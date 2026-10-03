"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/session";
import { homeForRole } from "@/lib/auth/dal";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalDashboardStrings } from "@/lib/portal-dashboard-i18n";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type LoginState = { error: string } | undefined;

// The app's one sign-in form, at /business-portal/login — used by both a
// partner (role PARTNER) and Gotka staff moderating listings (role ADMIN).
// There's no separate staff front door in this standalone app, so unlike
// the CRM this was extracted from, nothing here rejects a role — it just
// redirects each to its own home.
//
// businessLogin is only ever called from BusinessLoginForm (the `login`
// alias below is unused), so its error text is localized here via the
// cookie-based directory locale — same idea as the rest of the business
// portal's i18n (see getDirectoryLocale's own comment), just read directly
// inside the action instead of passed down from a Server Component.
export async function businessLogin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const locale = await getDirectoryLocale();
  const t = getPortalDashboardStrings(locale).loginErrors;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "email") return { error: t.invalid_email };
    if (issue?.path[0] === "password") return { error: t.password_required };
    return { error: t.invalid_input };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    return { error: t.invalid_credentials };
  }

  await createSession(user.id);
  redirect(homeForRole(user.role));
}

export async function businessLogout() {
  await deleteSession();
  redirect("/business-portal/login");
}

// Aliases — some ported components/routes refer to these by the shorter
// names; both pairs point at the exact same functions.
export const login = businessLogin;
export const logout = businessLogout;
