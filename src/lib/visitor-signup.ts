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
      role: "VISITOR",
    },
  });
  return { ok: true, userId: user.id };
}
