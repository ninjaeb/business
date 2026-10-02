import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionPayload } from "@/lib/session";
import type { Role } from "@/generated/prisma/client";

const CURRENT_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  title: true,
  role: true,
  phone: true,
  companyName: true,
  currency: true,
} as const;

export const verifySession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) {
    redirect("/business-portal/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await db.user.findUnique({ where: { id: session.userId }, select: CURRENT_USER_SELECT });
  if (!user) {
    redirect("/business-portal/login");
  }
  return user;
});

// A redirect-free version of requirePartner, for the one caller that must
// never itself redirect on failure: the login page's own layout. Everything
// downstream of a valid business_session cookie is re-verified against the
// database here — the cookie alone can outlive the account behind it (role
// changed, or the account deleted) for up to its full 30-day life, since
// it's a signed, stateless JWT with nothing to revoke it early.
export async function getVerifiedPartnerOrNull() {
  const session = await getSessionPayload();
  if (!session?.userId) return null;
  const user = await db.user.findUnique({ where: { id: session.userId }, select: CURRENT_USER_SELECT });
  if (!user || user.role !== "PARTNER") return null;
  return user;
}

export const PARTNER_HOME = "/business-portal";
export const ADMIN_HOME = "/admin";
// A VISITOR account (see the Role enum's own comment) has no dashboard of
// its own — it exists only to write testimonials, right from the listing
// page it's already on. The site root redirects to the locale-resolved
// directory home (see src/proxy.ts), so this is a safe, locale-agnostic
// landing spot.
export const VISITOR_HOME = "/";

export function homeForRole(role: Role) {
  if (role === "ADMIN") return ADMIN_HOME;
  if (role === "VISITOR") return VISITOR_HOME;
  return PARTNER_HOME;
}

// For Server Components: redirects to the other role's home rather than
// rendering.
export async function requirePartner() {
  const user = await getCurrentUser();
  if (user.role !== "PARTNER") {
    redirect(homeForRole(user.role));
  }
  return user;
}

// Same as requirePartner, plus a one-time detour to /business-portal/profile
// for an account missing phone/companyName — mainly a Google sign-up that
// skipped the pre-redirect form fields, since the password signup form
// requires all three up front. Every dashboard page but the profile page
// itself calls this instead of requirePartner, so a partner can't reach the
// rest of the portal (or its notification-carrying phone number) with a
// half-filled account; the profile page keeps calling requirePartner
// plainly, since redirecting it here too would loop.
export async function requireCompletePartnerProfile() {
  const user = await requirePartner();
  if (!user.name.trim() || !user.phone || !user.companyName) {
    redirect("/business-portal/profile");
  }
  return user;
}

// For Server Actions (same throw-not-redirect convention as
// requireAdminAction): actions are invoked via forms/transitions, not page
// loads, so there's no navigation to redirect.
export async function requirePartnerAction() {
  const user = await getCurrentUser();
  if (user.role !== "PARTNER") {
    throw new Error("Partners only.");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    redirect(homeForRole(user.role));
  }
  return user;
}

export async function requireAdminAction() {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Admins only.");
  }
  return user;
}

// Same shape as getVerifiedPartnerOrNull above, for the write-a-testimonial
// dialog (WriteTestimonialButton) — a Server Component that must never
// itself redirect on a missing/wrong-role session, since "not signed in" is
// an expected, common state here (shows the sign-up/log-in form instead),
// not an error.
export async function getVerifiedVisitorOrNull() {
  const session = await getSessionPayload();
  if (!session?.userId) return null;
  const user = await db.user.findUnique({ where: { id: session.userId }, select: CURRENT_USER_SELECT });
  if (!user || user.role !== "VISITOR") return null;
  return user;
}

// For the testimonial-submission Server Action (same throw-not-redirect
// convention as requirePartnerAction/requireAdminAction) — reached only if
// someone calls it directly with no visitor session, since the dialog UI
// itself never renders the submit form without one already.
export async function requireVisitorAction() {
  const user = await getCurrentUser();
  if (user.role !== "VISITOR") {
    throw new Error("Visitors only.");
  }
  return user;
}

// Same shape as getVerifiedVisitorOrNull above, but for the write-a-
// testimonial dialog's "already signed in" check specifically — a VISITOR
// account exists solely to write testimonials, but a PARTNER (a business
// owner logged into business-portal on this same browser, since both share
// one session cookie — see session.ts) is just as much a real, already-
// authenticated person, and shouldn't be asked to sign up again just
// because this dialog historically only recognized one of the two account
// types testimonials can come from. ADMIN deliberately excluded — there's
// no "write a testimonial as the directory operator" case this needs to
// support.
export async function getVerifiedTestimonialAuthorOrNull() {
  const session = await getSessionPayload();
  if (!session?.userId) return null;
  const user = await db.user.findUnique({ where: { id: session.userId }, select: CURRENT_USER_SELECT });
  if (!user || (user.role !== "VISITOR" && user.role !== "PARTNER")) return null;
  return user;
}

// Same relationship to getVerifiedTestimonialAuthorOrNull as
// requireVisitorAction has to getVerifiedVisitorOrNull — the testimonial-
// submission Server Action's real gate, reached only if a direct call
// bypasses the dialog UI (which never renders the submit form without a
// recognized session already).
export async function requireTestimonialAuthorAction() {
  const user = await getCurrentUser();
  if (user.role !== "VISITOR" && user.role !== "PARTNER") {
    throw new Error("Visitors or business accounts only.");
  }
  return user;
}
