import { db } from "@/lib/db";
import { encryptSecret, decryptSecret } from "@/lib/secret-crypto";

// One connected Facebook Page per listing (see FacebookPageConnection's own
// schema comment) — unlike WhatsAppSettings' singleton row (one phone
// number for the whole app), every listing connects its own Page, so this
// is keyed by listingId rather than a fixed id.
export async function getFacebookConnection(listingId: string) {
  return db.facebookPageConnection.findUnique({ where: { listingId } });
}

// Decrypted in one step — every caller that reads a connection back out
// (src/lib/facebook.ts's own posting call, the composer's "connected as
// {pageName}" status) wants the live token, never the ciphertext itself.
export async function getDecryptedFacebookConnection(listingId: string) {
  const connection = await getFacebookConnection(listingId);
  if (!connection) return null;
  return { ...connection, accessToken: decryptSecret(connection.encryptedAccessToken) };
}

export async function saveFacebookConnection(listingId: string, pageId: string, pageName: string, accessToken: string): Promise<void> {
  await db.facebookPageConnection.upsert({
    where: { listingId },
    create: { listingId, pageId, pageName, encryptedAccessToken: encryptSecret(accessToken) },
    update: { pageId, pageName, encryptedAccessToken: encryptSecret(accessToken), connectedAt: new Date() },
  });
}

export async function deleteFacebookConnection(listingId: string): Promise<void> {
  await db.facebookPageConnection.deleteMany({ where: { listingId } });
}
