"use server";

import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { requireAdminAction } from "@/lib/auth/dal";
import { getEmailSettings, saveEmailSettings } from "@/lib/email-settings";
import { getWhatsAppSettings, saveWhatsAppSettings } from "@/lib/whatsapp-settings";
import { decryptSecret } from "@/lib/secret-crypto";
import { GRAPH_API_BASE } from "@/lib/whatsapp";

export type SettingsFormState = { error: string } | { success: true } | undefined;

function stringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Settings → (this page's) "Email (SMTP)" card. Verifies the connection
// (transporter.verify(), an SMTP handshake with no message sent) before
// persisting — same "don't save credentials that don't actually work"
// reasoning as updateWhatsAppSettings below, so a typo'd host surfaces here
// rather than silently on the next lead.
export async function updateEmailSettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdminAction();

  const host = stringField(formData, "host");
  const port = Number(formData.get("port")) || 587;
  const username = stringField(formData, "username");
  const password = stringField(formData, "password");
  const fromName = stringField(formData, "fromName");
  const fromEmail = stringField(formData, "fromEmail");

  if (!host || !fromEmail) {
    return { error: "Host and from-address are required." };
  }

  const existing = await getEmailSettings();
  if (!existing && username && !password) {
    return { error: "Enter a password to connect for the first time." };
  }

  const passwordToVerify = password || (existing?.encryptedPassword ? decryptSecret(existing.encryptedPassword) : undefined);
  const transporter = nodemailer.createTransport({
    host,
    port,
    auth: username ? { user: username, pass: passwordToVerify } : undefined,
  });
  try {
    await transporter.verify();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not connect with those settings." };
  }

  await saveEmailSettings({ host, port, username, password: password || undefined, fromName, fromEmail });
  revalidatePath("/admin");
  return { success: true };
}

// Settings → (this page's) "WhatsApp" card. Confirms the phone number ID
// actually belongs to the access token before persisting either (same
// "verify before persist" reasoning as the email connection above) — also
// fetches the human-readable number so the form can show a saved connection
// as "this real phone number" rather than a hard-to-verify ID.
export async function updateWhatsAppSettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdminAction();

  const phoneNumberId = stringField(formData, "phoneNumberId");
  const accessToken = stringField(formData, "accessToken");

  if (!phoneNumberId) {
    return { error: "Phone number ID is required." };
  }

  const existing = await getWhatsAppSettings();
  if (!existing && !accessToken) {
    return { error: "Enter an access token to connect for the first time." };
  }
  const tokenToVerify = accessToken || decryptSecret(existing!.encryptedAccessToken);

  let displayPhoneNumber: string | null;
  try {
    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}?fields=display_phone_number`, {
      headers: { Authorization: `Bearer ${tokenToVerify}` },
    });
    const body: { display_phone_number?: string; error?: { message?: string } } = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? `Meta API returned ${response.status}`);
    displayPhoneNumber = body.display_phone_number ?? null;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not connect with those settings." };
  }

  await saveWhatsAppSettings({ phoneNumberId, accessToken: accessToken || undefined, displayPhoneNumber });
  revalidatePath("/admin");
  return { success: true };
}
