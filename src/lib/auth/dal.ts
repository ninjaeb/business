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

export function homeForRole(role: Role) {
  return role === "ADMIN" ? ADMIN_HOME : PARTNER_HOME;
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
