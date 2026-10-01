import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

// Creates the account a visitor needs before writing a testimonial (see
// registerVisitor in src/app/actions/visitor-auth.ts) — same shape as
// createPartnerUserAndListing in src/lib/partner-signup.ts, minus the
// listing-seeding step, since a VISITOR account has no listing of its own.
export type VisitorSignupInput = {
  name: string;
  email: string;
  phone: string;
  // Both optional — shown alongside the visitor's name on their testimonial
  // for credibility ("Jane Smith, Marketing Director at Acme Sdn Bhd"), not
  // required to post one at all.
  companyName?: string;
  title?: string;
};

export type VisitorSignupError = "email_taken";
export type VisitorSignupResult = { ok: true; userId: string } | { ok: false; error: VisitorSignupError };

// An email already on file is a hard stop, same reasoning as
// registerPartnerWithPassword's own comment: nothing here proves this
// visitor owns that address. Deliberately not scoped to "already a
// VISITOR" — an email already used by a PARTNER/ADMIN account can't become
// a second, different account too (User.email is globally unique), so
// visitorLogin (src/app/actions/visitor-auth.ts) is where that account
// actually signs back in, not here.
export async function registerVisitorWithPassword(
  input: VisitorSignupInput & { passwordHash: string },
): Promise<VisitorSignupResult> {
  const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) return { ok: false, error: "email_taken" };

  const user = await db.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: normalizePhone(input.phone),
      passwordHash: input.passwordHash,
      companyName: input.companyName ?? null,
      title: input.title ?? null,
      role: "VISITOR",
    },
  });
  return { ok: true, userId: user.id };
}

export type VisitorGoogleError = "wrong_role";
export type VisitorGoogleResult =
  | { ok: true; userId: string; name: string }
  | { ok: false; error: VisitorGoogleError };

// Google path: the visitor's email is already verified by Google (checked
// by the caller — see signInVisitorWithGoogle in
// src/app/actions/visitor-auth.ts), so a match against an existing VISITOR
// is treated as "this is them, log them in" rather than a conflict — no
// password needed, same reasoning as registerOrSignInPartnerWithGoogle. A
// match against a PARTNER/ADMIN account is a hard stop instead: this is a
// visitor-only front door. A brand-new email gets a fresh VISITOR account
// with no phone (Google's id_token never carries one — User.phone is
// nullable specifically so this account isn't stuck half-created) and a
// random, never-shared password hash, same as the partner Google path.
export async function registerOrSignInVisitorWithGoogle(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<VisitorGoogleResult> {
  const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true, role: true, name: true } });
  if (existing) {
    if (existing.role !== "VISITOR") return { ok: false, error: "wrong_role" };
    return { ok: true, userId: existing.id, name: existing.name };
  }

  const user = await db.user.create({
    data: { name: input.name, email: input.email, phone: null, passwordHash: input.passwordHash, role: "VISITOR" },
  });
  return { ok: true, userId: user.id, name: user.name };
}
