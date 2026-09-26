"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/session";
import { homeForRole } from "@/lib/auth/dal";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = { error: string } | undefined;

// The app's one sign-in form, at /business-portal/login — used by both a
// partner (role PARTNER) and Gotka staff moderating listings (role ADMIN).
// There's no separate staff front door in this standalone app, so unlike
// the CRM this was extracted from, nothing here rejects a role — it just
// redirects each to its own home.
export async function businessLogin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    return { error: "Invalid email or password" };
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
