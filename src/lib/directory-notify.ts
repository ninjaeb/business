import { db } from "@/lib/db";
import { isMailerConfigured, sendMail } from "@/lib/mailer";
import { isWhatsAppConfigured, sendWhatsAppTemplateMessage } from "@/lib/whatsapp";
import { textToHtml } from "@/lib/text-to-html";
import { getSiteOrigin } from "@/lib/site-url";
import type { DirectoryLead, DirectoryTestimonial, PartnerListing } from "@/generated/prisma/client";

// A rewrite of the source CRM's src/lib/directory-notify.ts for this
// standalone app: same two exports and signatures, and — like the source
// CRM's own notifyDirectoryLeadViaWhatsApp — a WhatsApp ping alongside the
// email one. Both channels are admin-configured from /admin (see
// src/lib/email-settings.ts and src/lib/whatsapp-settings.ts) rather than
// env vars.

// Must match a template already approved in Meta Business Manager exactly
// — see the README's WhatsApp section for the exact text to submit. A
// template, not plain text: a visitor's inquiry through a partner's
// directory listing is never within that partner's own 24-hour WhatsApp
// reply window (there's no prior message from the partner to reply
// within).
const NEW_LEAD_WHATSAPP_TEMPLATE_NAME = "new_directory_lead_notification";
const NEW_LEAD_WHATSAPP_TEMPLATE_LANGUAGE = "en";

// Fires once, right after a visitor's inquiry is saved. Both channels below
// are best-effort and independent of each other — an unconfigured or
// failed channel never blocks or is affected by the other — the lead
// itself is already saved either way, these are just courtesy
// notifications on top of it, same convention the source CRM's own
// notifiers use.
export async function notifyPartnerOfNewLead(listing: PartnerListing, lead: DirectoryLead): Promise<void> {
  const partner = await db.user.findUnique({ where: { id: listing.partnerId }, select: { email: true, phone: true } });
  if (!partner) return;

  const path = `/business-portal/business-leads/${lead.id}`;
  const link = `${await getSiteOrigin()}${path}`;

  if (await isMailerConfigured()) {
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

  if (partner.phone && (await isWhatsAppConfigured())) {
    try {
      await sendWhatsAppTemplateMessage(partner.phone, NEW_LEAD_WHATSAPP_TEMPLATE_NAME, NEW_LEAD_WHATSAPP_TEMPLATE_LANGUAGE, [
        lead.name,
        lead.company || "No company given",
        link,
      ]);
    } catch (error) {
      console.error(
        `New directory lead WhatsApp notification failed for partner ${listing.partnerId}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}

// Fires once, right after a visitor's testimonial is saved (always PENDING
// — see submitDirectoryTestimonial in src/app/actions/testimonials.ts).
// Email-only, unlike notifyPartnerOfNewLead above: a testimonial needing
// admin approval before it's even public is lower-urgency than a sales
// inquiry, and a new WhatsApp template would need its own separate approval
// in Meta Business Manager before this app could send it (see
// NEW_LEAD_WHATSAPP_TEMPLATE_NAME's own comment) — not worth that overhead
// for a courtesy notice the partner can't act on any faster by getting it
// on WhatsApp too.
export async function notifyPartnerOfNewTestimonial(listing: PartnerListing, testimonial: DirectoryTestimonial): Promise<void> {
  if (!(await isMailerConfigured())) return;
  const partner = await db.user.findUnique({ where: { id: listing.partnerId }, select: { email: true } });
  if (!partner) return;

  const link = `${await getSiteOrigin()}/business-portal/testimonials`;
  const text =
    `${testimonial.authorName} left a testimonial on your ${listing.companyName} listing` +
    `${testimonial.rating ? ` (${testimonial.rating}/5)` : ""}:\n\n"${testimonial.body}"\n\n` +
    `It's waiting on your approval before it shows publicly. Review it from your business portal: ${link}`;
  try {
    await sendMail({
      to: partner.email,
      subject: `New testimonial: ${testimonial.authorName}`,
      text,
      html: textToHtml(text),
    });
  } catch (error) {
    console.error(
      `New testimonial email failed for partner ${listing.partnerId}:`,
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
  if (!(await isMailerConfigured())) {
    return {
      sent: false,
      error: "No outbound email is configured — set it up from /admin.",
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
