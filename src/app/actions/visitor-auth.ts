"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/session";
import { registerVisitorWithPassword } from "@/lib/visitor-signup";
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
