import type { DirectoryLocale } from "@/lib/directory-i18n";

// The business portal's Business Leads module — the inbox of inquiries the
// public directory sends a partner (business-leads/page.tsx), one lead's
// own detail page (business-leads/[id]/page.tsx), and the small client
// components that detail page assembles: the status picker, the
// email/phone/WhatsApp contact links, the reply form, and the value &
// notes form. Mirrors the type-then-one-block-per-locale shape of
// DIRECTORY_STRINGS (directory-i18n.ts) and PORTAL_CHROME_STRINGS
// (portal-i18n.ts).
//
// The 4 real DirectoryLeadStatus labels (NEW/PICKED_UP/CONTACTED/
// CLOSED_CONVERTED) already have their own locale map —
// DIRECTORY_LEAD_STATUS_LABELS_BY_LOCALE in directory-i18n.ts — so they
// aren't duplicated here. qualifiedDealOption below is the status picker's
// one extra, non-persisted action (see the comment above
// QUALIFY_AS_DEAL_ACTION in directory-lead-status-select.tsx) that isn't
// part of that enum and so isn't covered by that map.
export type PortalLeadsStrings = {
  // Inbox list (business-leads/page.tsx). pageTitle doubles as the detail
  // page's own breadcrumb label pointing back to this list — same page,
  // named the same way in both places.
  pageTitle: string;
  pageDescription: string;
  statNew: string;
  statOpen: string;
  statConverted: string;
  statConvertedValue: string;
  statReferred: string;
  statReferredDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction: string;
  tableLead: string;
  tableListing: string;
  tableReceived: string;
  tableDuration: string;
  tableStatus: string;
  tableValue: string;
  // Tooltip on the small ThumbsUp icon next to a lead that came in through
  // this partner's own Recommend link — distinct wording from
  // statReferredDescription above, which labels the stat card instead.
  referralTooltip: string;

  // Lead detail page (business-leads/[id]/page.tsx). sentOnTemplate/
  // openForTemplate/closedAfterTemplate carry a {date} or {duration}
  // token, filled in with a plain .replace() via the format* helpers
  // below — same {token} convention as directory-i18n.ts's own
  // formatFooterCopyright and friends.
  sentOnTemplate: string;
  openForTemplate: string;
  closedAfterTemplate: string;
  referredBadge: string;
  viewDealLabel: string;
  inquiryCardTitle: string;
  valueNotesCardTitle: string;
  replyCardTitle: string;
  notDeliveredLabel: string;

  // directory-lead-reply-form.tsx
  replyPlaceholder: string;
  replySending: string;
  replySubmit: string;

  // directory-lead-status-select.tsx — the one picker-only option not
  // covered by DIRECTORY_LEAD_STATUS_LABELS_BY_LOCALE (see above).
  qualifiedDealOption: string;

  // directory-lead-value-form.tsx. valueFieldLabelTemplate carries a
  // {currency} token, filled in with formatValueFieldLabel below.
  valueFieldLabelTemplate: string;
  notesFieldLabel: string;
  notesPlaceholder: string;
  valueFormSaving: string;
  valueFormSave: string;
  valueFormSavedToast: string;
};

export const PORTAL_LEADS_STRINGS: Record<DirectoryLocale, PortalLeadsStrings> = {
  en: {
    pageTitle: "Business Leads",
    pageDescription: "Inquiries sent through your public listings",
    statNew: "New",
    statOpen: "Open",
    statConverted: "Converted",
    statConvertedValue: "Converted value",
    statReferred: "Referred",
    statReferredDescription: "Via your Recommend link",
    emptyTitle: "No leads yet.",
    emptyDescription: "Once someone sends an inquiry through one of your listings, it shows up here.",
    emptyAction: "Go to My Business",
    tableLead: "Lead",
    tableListing: "Listing",
    tableReceived: "Received",
    tableDuration: "Duration",
    tableStatus: "Status",
    tableValue: "Value",
    referralTooltip: "Came in through your Recommend link",
    sentOnTemplate: "Sent {date}",
    openForTemplate: "Open for {duration}",
    closedAfterTemplate: "Closed after {duration}",
    referredBadge: "Referred",
    viewDealLabel: "View deal",
    inquiryCardTitle: "Inquiry",
    valueNotesCardTitle: "Value & notes",
    replyCardTitle: "Reply",
    notDeliveredLabel: "Not delivered",
    replyPlaceholder: "Write a reply — it's emailed to the visitor from Gotka's system address, with your company name as the sender.",
    replySending: "Sending…",
    replySubmit: "Send reply",
    qualifiedDealOption: "Qualified Deal",
    valueFieldLabelTemplate: "Value ({currency})",
    notesFieldLabel: "Notes",
    notesPlaceholder: "Private notes about this lead — only you see these.",
    valueFormSaving: "Saving…",
    valueFormSave: "Save",
    valueFormSavedToast: "Saved.",
  },
  zh: {
    pageTitle: "商业线索",
    pageDescription: "访客通过您的商家主页发送的咨询",
    statNew: "新增",
    statOpen: "进行中",
    statConverted: "已转换",
    statConvertedValue: "转换金额",
    statReferred: "推荐",
    statReferredDescription: "通过您的推荐链接",
    emptyTitle: "暂无线索。",
    emptyDescription: "一旦有人通过您的商家主页提交咨询，便会显示在这里。",
    emptyAction: "前往我的商家",
    tableLead: "线索",
    tableListing: "商家",
    tableReceived: "接收时间",
    tableDuration: "持续时间",
    tableStatus: "状态",
    tableValue: "金额",
    referralTooltip: "通过您的推荐链接提交",
    sentOnTemplate: "发送于 {date}",
    openForTemplate: "已持续 {duration}",
    closedAfterTemplate: "结案耗时 {duration}",
    referredBadge: "推荐",
    viewDealLabel: "查看交易",
    inquiryCardTitle: "咨询内容",
    valueNotesCardTitle: "金额与备注",
    replyCardTitle: "回复",
    notDeliveredLabel: "未送达",
    replyPlaceholder: "撰写回复——系统会以 Gotka 的系统邮箱代为发送给访客，发件人会显示为您的公司名称。",
    replySending: "发送中…",
    replySubmit: "发送回复",
    qualifiedDealOption: "合格交易",
    valueFieldLabelTemplate: "金额（{currency}）",
    notesFieldLabel: "备注",
    notesPlaceholder: "关于此线索的私人备注——仅您可见。",
    valueFormSaving: "保存中…",
    valueFormSave: "保存",
    valueFormSavedToast: "已保存。",
  },
  ms: {
    pageTitle: "Petunjuk Perniagaan",
    pageDescription: "Pertanyaan yang dihantar melalui penyenaraian awam anda",
    statNew: "Baharu",
    statOpen: "Terbuka",
    statConverted: "Ditukar",
    statConvertedValue: "Nilai Ditukar",
    statReferred: "Disyorkan",
    statReferredDescription: "Melalui pautan Syor anda",
    emptyTitle: "Belum ada petunjuk.",
    emptyDescription: "Sebaik sahaja seseorang menghantar pertanyaan melalui salah satu penyenaraian anda, ia akan dipaparkan di sini.",
    emptyAction: "Pergi ke Perniagaan Saya",
    tableLead: "Petunjuk",
    tableListing: "Perniagaan",
    tableReceived: "Diterima",
    tableDuration: "Tempoh",
    tableStatus: "Status",
    tableValue: "Nilai",
    referralTooltip: "Masuk melalui pautan Syor anda",
    sentOnTemplate: "Dihantar pada {date}",
    openForTemplate: "Terbuka selama {duration}",
    closedAfterTemplate: "Ditutup selepas {duration}",
    referredBadge: "Disyorkan",
    viewDealLabel: "Lihat Urus Niaga",
    inquiryCardTitle: "Pertanyaan",
    valueNotesCardTitle: "Nilai & Nota",
    replyCardTitle: "Balasan",
    notDeliveredLabel: "Gagal dihantar",
    replyPlaceholder: "Tulis balasan — ia akan dihantar melalui e-mel kepada pelawat daripada alamat sistem Gotka, dengan nama syarikat anda sebagai penghantar.",
    replySending: "Menghantar…",
    replySubmit: "Hantar Balasan",
    qualifiedDealOption: "Urus Niaga Layak",
    valueFieldLabelTemplate: "Nilai ({currency})",
    notesFieldLabel: "Nota",
    notesPlaceholder: "Nota peribadi mengenai petunjuk ini — hanya anda yang boleh melihatnya.",
    valueFormSaving: "Menyimpan…",
    valueFormSave: "Simpan",
    valueFormSavedToast: "Disimpan.",
  },
};

// Fills in sentOnTemplate's {date} token — see that field's own comment.
export function formatLeadSentOn(template: string, date: string): string {
  return template.replace("{date}", date);
}

// Fills in openForTemplate's {duration} token — see that field's own comment.
export function formatLeadOpenFor(template: string, duration: string): string {
  return template.replace("{duration}", duration);
}

// Fills in closedAfterTemplate's {duration} token — see that field's own comment.
export function formatLeadClosedAfter(template: string, duration: string): string {
  return template.replace("{duration}", duration);
}

// Fills in valueFieldLabelTemplate's {currency} token — see that field's own comment.
export function formatValueFieldLabel(template: string, currency: string): string {
  return template.replace("{currency}", currency);
}
