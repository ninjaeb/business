"use server";

import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/session";
import { registerVisitorWithPassword, registerOrSignInVisitorWithGoogle } from "@/lib/visitor-signup";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { isValidPhoneFormat } from "@/lib/phone";
import { isRateLimited, isSuspiciouslyFast } from "@/lib/lead-spam-guard";
import { firstHopValue } from "@/lib/site-url";
import type { VisitorAuthErrorCode } from "@/lib/directory-i18n";

// The account gate in front of the testimonial form (see TestimonialAuthForm,
// WriteTestimonialButton) — unlike signUpPartner/businessLogin in
// src/app/actions/{partner-signup,auth}.ts, neither action here redirects:
// both are called from inside a dialog on the listing page, not a page
// navigation, so the caller (WriteTestimonialButton) flips local state to
// show the testimonial form next instead of navigating anywhere. Same
// honeypot/render-timing/rate-limit shape as submitDirectoryTestimonial —
// this is exactly as exposed to the open internet, and shares that same
// in-memory per-IP budget (see lead-spam-guard.ts's own comment on why
// that's fine).

const visitorSignupSchema = z.object({
  name: z.string().trim().min(1, "name_required").max(100),
  email: z.string().trim().toLowerCase().min(1, "email_required").email("email_invalid"),
  phone: z
    .string()
    .trim()
    .min(1, "phone_required")
    .refine((value) => isValidPhoneFormat(value), { message: "phone_invalid" }),
  password: z.string().min(8, "password_length"),
  // Both optional — see registerVisitorWithPassword's own comment.
  companyName: z.string().trim().max(150).optional(),
  title: z.string().trim().max(100).optional(),
});

export type VisitorAuthState =
  | { status: "success"; name: string }
  | { status: "error"; code: VisitorAuthErrorCode }
  | undefined;

export async function registerVisitor(_prevState: VisitorAuthState, formData: FormData): Promise<VisitorAuthState> {
  if (String(formData.get("website") || "").trim()) {
    return { status: "error", code: "generic" };
  }
  if (isSuspiciouslyFast(formData.get("renderedAt"))) {
    return { status: "error", code: "generic" };
  }

  const headersList = await headers();
  if (isRateLimited(firstHopValue(headersList.get("x-forwarded-for")))) {
    return { status: "error", code: "rate_limited" };
  }

  const parsed = visitorSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    // Blank left as "" by an unfilled optional field, not absent — normalized
    // here rather than in the schema so a blank submission stores no value
    // at all instead of an empty string.
    companyName: formData.get("companyName") || undefined,
    title: formData.get("title") || undefined,
  });
  if (!parsed.success) {
    const code = (parsed.error.issues[0]?.message as VisitorAuthErrorCode) ?? "invalid_submission";
    return { status: "error", code };
  }

  const result = await registerVisitorWithPassword({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    passwordHash: await hashPassword(parsed.data.password),
    companyName: parsed.data.companyName,
    title: parsed.data.title,
  });
  if (!result.ok) {
    return { status: "error", code: result.error };
  }

  await createSession(result.userId);
  return { status: "success", name: parsed.data.name };
}

const visitorLoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "email_required").email("email_invalid"),
  password: z.string().min(1, "password_required"),
});

// Deliberately the same "invalid_credentials" error whether the email
// doesn't exist, belongs to a PARTNER/ADMIN account instead, or the
// password is simply wrong — unlike registerOrSignInPartnerWithGoogle's
// explicit "wrong_role" message, this form is open to the whole internet
// with no Google-verified identity behind it, so it doesn't confirm or deny
// which of those is true.
export async function loginVisitor(_prevState: VisitorAuthState, formData: FormData): Promise<VisitorAuthState> {
  const headersList = await headers();
  if (isRateLimited(firstHopValue(headersList.get("x-forwarded-for")))) {
    return { status: "error", code: "rate_limited" };
  }

  const parsed = visitorLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const code = (parsed.error.issues[0]?.message as VisitorAuthErrorCode) ?? "invalid_submission";
    return { status: "error", code };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid || user.role !== "VISITOR") {
    return { status: "error", code: "invalid_credentials" };
  }

  await createSession(user.id);
  return { status: "success", name: user.name };
}

// The testimonial form's own "Not you? Log out" link — never redirects
// (same reasoning as registerVisitor/loginVisitor above: this is a dialog,
// not a page), just clears the session so WriteTestimonialButton's next
// render shows the auth form again in the same spot.
export async function logoutVisitor(): Promise<void> {
  await deleteSession();
}

export type VisitorGoogleAuthResult = { status: "ok"; name: string } | { status: "error"; code: VisitorAuthErrorCode };

// "Continue with Google" inside TestimonialAuthForm — deliberately not the
// redirect-based flow the partner signup/login pages use
// (/api/auth/google + its callback route): this dialog opens over an
// arbitrary listing page rather than a dedicated page, so there's nowhere
// natural for a full-page round trip to Google to land back on. Google
// Identity Services' own client-side button instead hands the browser a
// signed id_token directly (no redirect at all), which this verifies the
// exact same way verifyGoogleIdToken already does for the partner flow —
// same signature/issuer/audience check against Google's own published
// keys, just reached by a different path.
//
// Not rate-limited like the password paths above: verifyGoogleIdToken
// rejects anything not genuinely signed by Google before this ever touches
// the database, so hitting registerOrSignInVisitorWithGoogle at all already
// requires a real Google-issued token — no cheaper for an attacker to spam
// than just using the password form with a real account.
export async function signInVisitorWithGoogle(idToken: string): Promise<VisitorGoogleAuthResult> {
  let profile;
  try {
    profile = await verifyGoogleIdToken(idToken);
  } catch {
    return { status: "error", code: "google_failed" };
  }
  if (!profile.emailVerified) {
    return { status: "error", code: "email_unverified" };
  }

  const result = await registerOrSignInVisitorWithGoogle({
    name: profile.name,
    email: profile.email,
    passwordHash: await hashPassword(randomBytes(24).toString("hex")),
  });
  if (!result.ok) {
    return { status: "error", code: result.error };
  }

  await createSession(result.userId);
  return { status: "ok", name: result.name };
}
