import { cache } from "react";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/secret-crypto";

const WHATSAPP_SETTINGS_ID = "singleton";

export const getWhatsAppSettings = cache(async () => {
  return db.whatsAppSettings.findUnique({ where: { id: WHATSAPP_SETTINGS_ID } });
});

export type WhatsAppSettingsInput = {
  phoneNumberId: string;
  // Undefined/empty keeps whatever access token is already stored — the
  // admin form never re-displays it, so "leave blank" is the only way to
  // keep an existing one while changing the phone number ID.
  accessToken?: string;
  displayPhoneNumber: string | null;
};

export async function saveWhatsAppSettings(input: WhatsAppSettingsInput): Promise<void> {
  // Branched rather than one upsert({create, update}) call: both of that
  // call's object literals get evaluated up front regardless of which one
  // Prisma ends up using, so a create branch that unconditionally
  // encrypts input.accessToken would throw on every token-less update (an
  // admin changing just the phone number ID on an already-connected
  // account) even though create is never the one used.
  if (input.accessToken) {
    await db.whatsAppSettings.upsert({
      where: { id: WHATSAPP_SETTINGS_ID },
      create: {
        id: WHATSAPP_SETTINGS_ID,
        phoneNumberId: input.phoneNumberId,
        encryptedAccessToken: encryptSecret(input.accessToken),
        displayPhoneNumber: input.displayPhoneNumber,
      },
      update: {
        phoneNumberId: input.phoneNumberId,
        encryptedAccessToken: encryptSecret(input.accessToken),
        displayPhoneNumber: input.displayPhoneNumber,
      },
    });
    return;
  }

  // No new token — updateWhatsAppSettings (src/app/actions/settings.ts)
  // only reaches this without one when a connection already exists, so a
  // plain update (not an upsert) is safe here.
  await db.whatsAppSettings.update({
    where: { id: WHATSAPP_SETTINGS_ID },
    data: { phoneNumberId: input.phoneNumberId, displayPhoneNumber: input.displayPhoneNumber },
  });
}
