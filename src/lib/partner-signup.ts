import { db } from "@/lib/db";
import { generateListingSlug } from "@/lib/directory";
import { normalizePhone } from "@/lib/phone";

// Turns a "join the business directory" signup into a partner login account
// — the same fields land in the same shape whether the visitor signed up
// with a password (see src/app/actions/partner-signup.ts) or with Google
// (see src/app/api/auth/google/callback). Seeds one blank draft listing at
// the same time, so a fresh partner lands straight in an editor rather than
// an empty "create your first listing" screen.
export type PartnerSignupInput = {
  contactName: string;
  email: string;
  companyName: string;
  phone?: string | null;
  // Optional, unset by every existing caller (the main signup page/Google
  // callback never collect it) — added for the testimonial dialog's
  // "Business account" path (see registerTestimonialAuthor in
  // src/app/actions/visitor-auth.ts), which does ask for it, same as the
  // VISITOR path's own optional title/companyName.
  title?: string | null;
};

async function createPartnerUserAndListing({
  contactName,
  email,
  companyName,
  phone,
  title,
  passwordHash,
}: PartnerSignupInput & { passwordHash: string }) {
  const user = await db.user.create({
    data: {
      name: contactName,
      companyName,
      email,
      // The same number a partner can later opt into new-lead email alerts
      // with — collected once here so filling in the signup form's phone
      // field never has to be repeated on the profile page.
      phone: phone ? normalizePhone(phone) : null,
      title: title ?? null,
      passwordHash,
      role: "PARTNER",
    },
  });

  const slug = await generateListingSlug(companyName);
  await db.partnerListing.create({
    data: { partnerId: user.id, slug, companyName, services: [] },
  });

  return user;
}

export type PartnerSignupError = "email_taken";
export type PartnerSignupResult = { ok: true; userId: string } | { ok: false; error: PartnerSignupError };

// Password-based signup: an email already on file is a hard stop, since
// nothing here proves this visitor is that account's owner (unlike the
// Google path below, where Google itself vouches for the email).
export async function registerPartnerWithPassword(
  input: PartnerSignupInput & { passwordHash: string },
): Promise<PartnerSignupResult> {
  const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) return { ok: false, error: "email_taken" };

  const user = await createPartnerUserAndListing(input);
  return { ok: true, userId: user.id };
}

export type PartnerGoogleError = "wrong_role";
export type PartnerGoogleResult =
  | { ok: true; userId: string; isNew: boolean }
  | { ok: false; error: PartnerGoogleError };

// Google path: the visitor's email is already verified by Google, so a
// match against an existing PARTNER is treated as "this is them, log them
// in" rather than a conflict — no password needed, Google itself vouches
// for the email. A match against an ADMIN account is a hard stop instead:
// the Google button on the signup/login pages is a partner front door only.
// A brand-new email gets the full User/PartnerListing creation, with a
// random, never-shared password hash (this account only ever signs in
// through Google) so the schema's required passwordHash column still holds
// something no one can guess or use.
export async function registerOrSignInPartnerWithGoogle(
  input: PartnerSignupInput & { passwordHash: string },
): Promise<PartnerGoogleResult> {
  const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true, role: true } });
  if (existing) {
    if (existing.role !== "PARTNER") return { ok: false, error: "wrong_role" };
    return { ok: true, userId: existing.id, isNew: false };
  }

  const user = await createPartnerUserAndListing(input);
  return { ok: true, userId: user.id, isNew: true };
}
