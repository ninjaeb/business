import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import { decryptSecret } from "@/lib/secret-crypto";

// A single business-initiated notification only — never a two-way
// conversation, an inbox, or a broadcast — so this is a minimal Meta
// WhatsApp Business Platform (Cloud API) sender. Admin-configured via
// /admin (see src/lib/whatsapp-settings.ts) rather than an env var, unlike
// the source CRM's own Settings-configured WhatsAppAccount (which also
// carries a businessAccountId and webhook verify token this app has no use
// for, since it never receives inbound messages).

export const GRAPH_API_VERSION = "v21.0";
export const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export async function isWhatsAppConfigured(): Promise<boolean> {
  return (await getWhatsAppSettings()) !== null;
}

// Digits only, country code included, no "+" — the wire format Meta's
// Cloud API "to" field expects. Not the same job as src/lib/phone.ts's own
// normalizePhone (which keeps the "+" for a clean *stored* value) — that
// file's own comment calls out this exact distinction.
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export class WhatsAppSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsAppSendError";
  }
}

// A business-initiated message like this one is always outside the
// recipient's 24-hour reply window (there's no prior message from them to
// reply within), so WhatsApp requires a pre-approved template rather than
// plain text — see the README's WhatsApp section for exactly how to create
// and submit one in Meta Business Manager. Throws WhatsAppSendError on any
// failure; callers treat this as a best-effort notification (same
// convention as a sendMail failure) and swallow it themselves.
export async function sendWhatsAppTemplateMessage(
  toPhone: string,
  templateName: string,
  languageCode: string,
  bodyParameters: string[],
): Promise<void> {
  const settings = await getWhatsAppSettings();
  if (!settings) throw new WhatsAppSendError("WhatsApp is not configured — set it up from /admin.");
  const accessToken = decryptSecret(settings.encryptedAccessToken);

  const response = await fetch(`${GRAPH_API_BASE}/${settings.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(toPhone),
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components:
          bodyParameters.length > 0
            ? [{ type: "body", parameters: bodyParameters.map((text) => ({ type: "text", text })) }]
            : [],
      },
    }),
  });
  if (!response.ok) {
    const payload: { error?: { message?: string } } = await response.json().catch(() => ({}));
    throw new WhatsAppSendError(payload.error?.message ?? `WhatsApp API returned ${response.status}`);
  }
}
