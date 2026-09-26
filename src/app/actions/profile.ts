"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSessionPayload } from "@/lib/session";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type ChangePasswordState = { error: string } | { success: true } | undefined;

// Self-service, for whichever account is signed in — a partner or an admin,
// same as this app's one login form (see @/app/actions/auth). There's no
// generic "any signed-in user" helper in @/lib/auth/dal (its exports are
// all role-specific — requirePartner*/requireAdmin*), so this reads the
// session cookie directly, the same way src/proxy.ts's own verifySession
// does internally.
export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await getSessionPayload();
  if (!session?.userId) {
    return { error: "You need to sign in again." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return { success: true };
}
