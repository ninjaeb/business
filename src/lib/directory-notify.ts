import { db } from "@/lib/db";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { textToHtml } from "@/lib/text-to-html";
import { getSiteOrigin } from "@/lib/site-url";
import type { DirectoryLead, PartnerListing } from "@/generated/prisma/client";

// A rewrite of the source CRM's src/lib/directory-notify.ts for this
// standalone app: same two exports and signatures, but with no WhatsApp
// integration (that CRM feature doesn't exist here) and no DB-backed
// "system sender" (see src/lib/mailer.ts) — email only, via SMTP env vars.

// Fires once, right after a visitor's inquiry is saved. Best-effort: any
// failure here is swallowed and logged rather than thrown — the lead itself
// is already saved either way, this is just a courtesy notification on top
// of it, same convention the source CRM's own notifiers use.
export async function notifyPartnerOfNewLead(listing: PartnerListing, lead: DirectoryLead): Promise<void> {
  if (!isMailerConfigured()) return;

  const partner = await db.user.findUnique({ where: { id: listing.partnerId }, select: { email: true } });
  if (!partner) return;

  const path = `/business-portal/business-leads/${lead.id}`;
  const link = `${await getSiteOrigin()}${path}`;
  const text =
    `${lead.name}${lead.company ? ` (${lead.company})` : ""} sent an inquiry through your ` +
    `${listing.companyName} listing:\n\n"${lead.message}"\n\nReply from your business portal: ${link}`;
  try {
    await sendMail({
      to: partner.email,
      subject: `New inquiry: ${lead.name}${lead.company ? ` — ${lead.company}` : ""}`,
      text,
      html: textToHtml(text),
    });
  } catch (error) {
    console.error(
      `New directory lead email failed for partner ${listing.partnerId}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

export type ReplyEmailResult = { sent: true } | { sent: false; error: string };

// The partner's reply, sent with the partner's company name as the display
// name — never the partner's own address, since that's exactly the
// direct-contact detail this feature deliberately keeps out of the
// visitor's hands. Returns rather than throws so the caller can still save
// the reply row (with this as its sendError) even when delivery fails — the
// partner shouldn't lose what they wrote just because the send did.
export async function sendDirectoryLeadReply(
  listing: PartnerListing,
  lead: DirectoryLead,
  body: string,
): Promise<ReplyEmailResult> {
  if (!isMailerConfigured()) {
    return {
      sent: false,
      error: "No outbound email is configured — set SMTP_HOST etc.",
    };
  }

  const text = `${body}\n\n—\n${listing.companyName}\n(sent via the Gotka business directory)`;
  try {
    await sendMail({
      to: lead.email,
      subject: `Re: your inquiry to ${listing.companyName}`,
      text,
      html: textToHtml(text),
      fromName: listing.companyName,
    });
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Failed to send the reply email." };
  }
}
