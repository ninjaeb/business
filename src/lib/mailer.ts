import nodemailer from "nodemailer";

// A small, self-contained SMTP mailer — unlike the source CRM (which reads
// a DB-backed "system sender" identity for outbound mail), this app has no
// such concept: every outbound email in this codebase is a fixed set of
// env vars, checked once here. No sender picker, no per-org configuration.

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | undefined;

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  if (!host) throw new Error("SMTP_HOST is not set");

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return cachedTransporter;
}

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  // Overrides the display name only — the from address is always
  // MAIL_FROM_EMAIL, never a partner's or visitor's own address.
  fromName?: string;
};

// Throws on failure — callers that need to save a "did this send?" result
// rather than fail their own action (see directory-notify.ts) catch this
// themselves instead of calling isMailerConfigured() and skipping the call.
export async function sendMail({ to, subject, text, html, fromName }: SendMailInput): Promise<void> {
  const transporter = getTransporter();
  const fromEmail = process.env.MAIL_FROM_EMAIL;
  const defaultName = process.env.MAIL_FROM_NAME;
  const displayName = fromName || defaultName;

  await transporter.sendMail({
    from: displayName ? `"${displayName}" <${fromEmail}>` : fromEmail,
    to,
    subject,
    text,
    html,
  });
}
