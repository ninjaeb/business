import { cache } from "react";
import { db } from "@/lib/db";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";

// The canonical registry of every email/WhatsApp message template this app
// sends or hands a visitor as a prefilled draft — see /admin/messages
// (the only place these get edited) and MessageTemplate's own comment in
// prisma/schema.prisma for why the DB side of this is sparse (a row only
// exists once an admin has actually customized that key/locale). Every
// consumer below (directory-notify.ts, the listing layout, the floating
// WhatsApp button, the lead detail page) reads through getMessageTemplate,
// never DIRECTORY_STRINGS or an inline template literal directly — a
// default here IS the fallback DIRECTORY_STRINGS value for the three keys
// that used to live only there (contactWhatsapp/recommendMessage/
// footerWhatsapp), copied in verbatim so nothing visibly changes for a
// site that's never touched this admin page.
export type MessageTemplateKey =
  | "lead_notification_email"
  | "testimonial_notification_email"
  | "business_partner_request_email"
  | "business_partner_invite_email"
  | "lead_reply_email"
  | "lead_reply_whatsapp_draft"
  | "contact_whatsapp"
  | "recommend_message"
  | "footer_whatsapp";

type MessageTemplateDefinition = {
  label: string;
  description: string;
  channel: "email" | "whatsapp";
  // Per-locale templates (the three already public-facing, translated
  // strings) store up to one row per DirectoryLocale; every other key is
  // English-only (business-portal pages, and every outbound email this app
  // sends, are English-only by the same convention the rest of the admin/
  // business-portal UI already follows) and always resolves under "en"
  // regardless of which locale the triggering page was on.
  perLocale: boolean;
  hasSubject: boolean;
  tokens: { name: string; description: string }[];
  defaultSubject?: Partial<Record<DirectoryLocale, string>>;
  defaultBody: Partial<Record<DirectoryLocale, string>>;
};

export const MESSAGE_TEMPLATE_DEFINITIONS: Record<MessageTemplateKey, MessageTemplateDefinition> = {
  lead_notification_email: {
    label: "New lead — email to partner",
    description: "Sent to a partner the moment a visitor submits the contact form on their listing.",
    channel: "email",
    perLocale: false,
    hasSubject: true,
    tokens: [
      { name: "{name}", description: "The visitor's name" },
      { name: "{listing}", description: "The partner's listing name" },
      { name: "{message}", description: "The visitor's own message" },
      { name: "{link}", description: "Link to the lead in the business portal" },
      { name: "{company_note}", description: 'The visitor\'s company, pre-formatted as " (Acme Inc)" — blank if none given' },
    ],
    defaultSubject: { en: "New inquiry: {name}" },
    defaultBody: {
      en: '{name} sent an inquiry through your {listing} listing{company_note}:\n\n"{message}"\n\nReply from your business portal: {link}',
    },
  },
  testimonial_notification_email: {
    label: "New testimonial — email to partner",
    description: "Sent to a partner when a visitor writes a testimonial on their listing, before it's approved.",
    channel: "email",
    perLocale: false,
    hasSubject: true,
    tokens: [
      { name: "{name}", description: "The reviewer's name" },
      { name: "{listing}", description: "The partner's listing name" },
      { name: "{body}", description: "The testimonial text" },
      { name: "{link}", description: "Link to the testimonials queue in the business portal" },
      { name: "{rating_note}", description: 'The star rating, pre-formatted as " (5/5)" — blank if none given' },
    ],
    defaultSubject: { en: "New testimonial: {name}" },
    defaultBody: {
      en:
        "{name} left a testimonial on your {listing} listing{rating_note}:\n\n" +
        '"{body}"\n\nIt\'s waiting on your approval before it shows publicly. Review it from your business portal: {link}',
    },
  },
  business_partner_request_email: {
    label: "Business Partner request — email to recipient",
    description: "Sent to a partner when another listing requests connecting with them as a Business Partner, before they've approved it.",
    channel: "email",
    perLocale: false,
    hasSubject: true,
    tokens: [
      { name: "{requester}", description: "The requesting listing's company name" },
      { name: "{recipient}", description: "The recipient's own listing name" },
      { name: "{link}", description: "Link to the Business Partners page in the business portal" },
    ],
    defaultSubject: { en: "Business Partner request: {requester}" },
    defaultBody: {
      en:
        "{requester} would like to connect with your {recipient} listing as a Business Partner.\n\n" +
        "It's waiting on your approval before it shows publicly on either listing. Review it from your business portal: {link}",
    },
  },
  business_partner_invite_email: {
    label: "Business Partner invite — email to invited company",
    description: "Sent when a partner invites a company that isn't on the directory yet to connect as a Business Partner.",
    channel: "email",
    perLocale: false,
    hasSubject: true,
    tokens: [
      { name: "{inviter}", description: "The inviting listing's company name" },
      { name: "{company}", description: "The invited company's own name" },
      { name: "{link}", description: "Link to the directory's signup page" },
    ],
    defaultSubject: { en: "{inviter} invited you to connect as a Business Partner" },
    defaultBody: {
      en:
        "{inviter} has invited {company} to connect as a Business Partner on the Gotka Business Directory.\n\n" +
        "Business Partners are shown on each other's public listing page, helping customers discover businesses you work with.\n\n" +
        "List your business to get started: {link}",
    },
  },
  lead_reply_email: {
    label: "Lead reply — signature",
    description:
      "The partner's own reply text is never a template (they type it fresh each time) — this is only the subject line and the signature appended underneath it.",
    channel: "email",
    perLocale: false,
    hasSubject: true,
    tokens: [{ name: "{listing}", description: "The partner's listing name" }],
    defaultSubject: { en: "Re: your inquiry to {listing}" },
    defaultBody: { en: "—\n{listing}\n(sent via the Gotka business directory)" },
  },
  lead_reply_whatsapp_draft: {
    label: "Lead reply — WhatsApp draft",
    description: "Prefills WhatsApp when a partner clicks to reply to a lead from the business portal — still just a draft they can edit before sending.",
    channel: "whatsapp",
    perLocale: false,
    hasSubject: false,
    tokens: [
      { name: "{name}", description: "The visitor's name" },
      { name: "{listing}", description: "The partner's listing name" },
      { name: "{message}", description: "The visitor's own message" },
    ],
    defaultBody: { en: 'Hi {name}, thanks for reaching out to {listing}! Regarding your inquiry: "{message}"' },
  },
  contact_whatsapp: {
    label: "Listing page — \"WhatsApp\" button",
    description: "Prefills WhatsApp when a visitor clicks the WhatsApp button in a listing's \"Get in touch\" card.",
    channel: "whatsapp",
    perLocale: true,
    hasSubject: false,
    tokens: [{ name: "{business}", description: "The listing's company name" }],
    // Pulled from DIRECTORY_STRINGS rather than duplicated here — this IS
    // that field's own value, just made admin-overridable; keeping one
    // source of truth means the two can never silently drift apart.
    defaultBody: {
      en: DIRECTORY_STRINGS.en.contactWhatsAppMessage,
      zh: DIRECTORY_STRINGS.zh.contactWhatsAppMessage,
      ms: DIRECTORY_STRINGS.ms.contactWhatsAppMessage,
    },
  },
  recommend_message: {
    label: '"Recommend Business" share message',
    description: "Used for WhatsApp, email, and native-share when a visitor recommends a listing to someone else.",
    channel: "whatsapp",
    perLocale: true,
    hasSubject: false,
    tokens: [
      { name: "{business}", description: "The listing's company name" },
      { name: "{url}", description: "The listing's own tracked referral link" },
    ],
    defaultBody: {
      en: DIRECTORY_STRINGS.en.recommendMessage,
      zh: DIRECTORY_STRINGS.zh.recommendMessage,
      ms: DIRECTORY_STRINGS.ms.recommendMessage,
    },
  },
  footer_whatsapp: {
    label: "Footer / floating \"WhatsApp us\" button",
    description: "Prefills WhatsApp when a visitor messages the directory itself (not a specific partner) from the floating button or footer.",
    channel: "whatsapp",
    perLocale: true,
    hasSubject: false,
    tokens: [],
    defaultBody: {
      en: DIRECTORY_STRINGS.en.footerWhatsAppMessage,
      zh: DIRECTORY_STRINGS.zh.footerWhatsAppMessage,
      ms: DIRECTORY_STRINGS.ms.footerWhatsAppMessage,
    },
  },
};

export type ResolvedMessageTemplate = { subject: string | null; body: string; isCustomized: boolean };

// Fetched once per request regardless of how many templates a page/action
// ends up resolving (a listing page alone resolves two) — same "cheap,
// whole-table read, cached per request" shape as getDirectoryApprovalMode
// and friends in src/lib/settings.ts, appropriate here too since this
// table is small by nature (at most 3 rows per key).
const getMessageTemplateRows = cache(async () => {
  const rows = await db.messageTemplate.findMany();
  const map = new Map<string, { subject: string | null; body: string }>();
  for (const row of rows) {
    map.set(`${row.key}:${row.locale}`, { subject: row.subject, body: row.body });
  }
  return map;
});

// A template's own locale-invariant templates (every email + the two
// business-portal/WhatsApp ones) are always stored/read under "en" — see
// MessageTemplateDefinition.perLocale's own comment.
function resolveLocale(key: MessageTemplateKey, locale: DirectoryLocale): DirectoryLocale {
  return MESSAGE_TEMPLATE_DEFINITIONS[key].perLocale ? locale : "en";
}

export async function getMessageTemplate(key: MessageTemplateKey, locale: DirectoryLocale = "en"): Promise<ResolvedMessageTemplate> {
  const definition = MESSAGE_TEMPLATE_DEFINITIONS[key];
  const effectiveLocale = resolveLocale(key, locale);
  const rows = await getMessageTemplateRows();
  const override = rows.get(`${key}:${effectiveLocale}`);
  if (override) {
    return { subject: override.subject, body: override.body, isCustomized: true };
  }
  return {
    subject: definition.defaultSubject?.[effectiveLocale] ?? definition.defaultSubject?.en ?? null,
    body: definition.defaultBody[effectiveLocale] ?? definition.defaultBody.en ?? "",
    isCustomized: false,
  };
}

// Plain {token} substitution — every value is used as-is, blank string if
// a caller doesn't have one, same "blank tokens are blank" convention this
// app already accepts in formatRecommendMessage/formatContactWhatsAppMessage
// (see their own comments in directory-i18n.ts). Not HTML-aware: callers
// that need an email body still run the result through textToHtml
// themselves, same as every existing call site already does.
export function fillMessageTemplate(text: string, tokens: Record<string, string>): string {
  let result = text;
  for (const [name, value] of Object.entries(tokens)) {
    result = result.split(name).join(value);
  }
  return result;
}
