import { createHmac, timingSafeEqual } from "node:crypto";

// Verifies an HMAC-SHA256 "sha256=<hex>" signature header — the scheme
// GitHub's own webhooks use. Verifying against the RAW body (before any
// JSON parsing) is the only thing standing between a public,
// unauthenticated endpoint and anyone who finds the URL.
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  let expectedBuf: Buffer;
  let providedBuf: Buffer;
  try {
    expectedBuf = Buffer.from(expected, "hex");
    providedBuf = Buffer.from(provided, "hex");
  } catch {
    return false;
  }
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
