import { cache } from "react";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/secret-crypto";

const EMAIL_SETTINGS_ID = "singleton";

export const getEmailSettings = cache(async () => {
  return db.emailSettings.findUnique({ where: { id: EMAIL_SETTINGS_ID } });
});

export type EmailSettingsInput = {
  host: string;
  port: number;
  username: string;
  // Undefined/empty keeps whatever password is already stored — the admin
  // form never re-displays it, so "leave blank" is the only way to keep an
  // existing one while changing another field.
  password?: string;
  fromName: string;
  fromEmail: string;
};

export async function saveEmailSettings(input: EmailSettingsInput): Promise<void> {
  const shared = {
    host: input.host,
    port: input.port,
    username: input.username || null,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
  };
  await db.emailSettings.upsert({
    where: { id: EMAIL_SETTINGS_ID },
    create: {
      id: EMAIL_SETTINGS_ID,
      ...shared,
      encryptedPassword: input.password ? encryptSecret(input.password) : null,
    },
    update: {
      ...shared,
      ...(input.password ? { encryptedPassword: encryptSecret(input.password) } : {}),
    },
  });
}
