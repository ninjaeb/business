import "server-only";

import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

// AES-256-GCM at rest for admin-configured secrets stored in the database
// (SMTP password, WhatsApp access token — see src/lib/email-settings.ts and
// src/lib/whatsapp-settings.ts). The key is derived from SESSION_SECRET via
// HKDF with its own "info" label — same domain-separation convention as
// src/lib/session.ts and src/lib/auth/google.ts — rather than a dedicated
// encryption-key env var this app has no other use for.
function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return Buffer.from(hkdfSync("sha256", secret, "", "gotka-business-directory:secrets", 32));
}

// "iv:authTag:ciphertext", all base64, as one self-contained string column.
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((buffer) => buffer.toString("base64")).join(":");
}

export function decryptSecret(stored: string): string {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(":");
  if (!ivB64 || !authTagB64 || !ciphertextB64) throw new Error("Malformed encrypted secret");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextB64, "base64")), decipher.final()]).toString("utf8");
}
