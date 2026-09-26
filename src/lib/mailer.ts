import nodemailer from "nodemailer";
import { getEmailSettings } from "@/lib/email-settings";
import { decryptSecret } from "@/lib/secret-crypto";

// Admin-configured via /admin (see src/lib/email-settings.ts) rather than
// env vars, unlike this app's other integrations — a non-technical admin
// can set or change outbound email without asking a developer to redeploy.
// A fresh transporter is built per send rather than cached: nodemailer
// doesn't open a connection until sendMail is actually called, so this
// costs nothing, and a cache would otherwise keep using stale credentials
// after an admin saves new ones until the process next restarts.

export async function isMailerConfigured(): Promise<boolean> {
  return (await getEmailSettings()) !== null;
}

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  // Overrides the display name only — the from address is always the
  // configured fromEmail, never a partner's or visitor's own address.
  fromName?: string;
};

// Throws on failure — callers that need to save a "did this send?" result
// rather than fail their own action (see directory-notify.ts) catch this
// themselves instead of calling isMailerConfigured() and skipping the call.
export async function sendMail({ to, subject, text, html, fromName }: SendMailInput): Promise<void> {
  const settings = await getEmailSettings();
  if (!settings) throw new Error("Email is not configured — set it up from /admin.");

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    auth: settings.username
      ? { user: settings.username, pass: settings.encryptedPassword ? decryptSecret(settings.encryptedPassword) : undefined }
      : undefined,
  });

  const displayName = fromName || settings.fromName;
  await transporter.sendMail({
    from: displayName ? `"${displayName}" <${settings.fromEmail}>` : settings.fromEmail,
    to,
    subject,
    text,
    html,
  });
}
