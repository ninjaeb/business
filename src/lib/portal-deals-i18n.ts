import type { DirectoryLocale } from "@/lib/directory-i18n";

// The business portal's Deals CRM module (the pipeline list/board, the
// new/edit deal forms, and a single deal's own detail page — see
// src/app/business-portal/(dashboard)/deals/ and
// src/components/business-crm/partner-deal-form.tsx). Follows the same
// type-then-one-block-per-locale shape as DIRECTORY_STRINGS in
// directory-i18n.ts and PORTAL_CHROME_STRINGS in portal-i18n.ts.
//
// The 7 deal-pipeline status labels (NEW/CONTACTED/DISCOVERY/PROPOSAL/
// NEGOTIATION/CLOSED_WON/CLOSED_LOST) are NOT duplicated here — use
// PARTNER_DEAL_STATUS_LABELS_BY_LOCALE from directory-i18n.ts for those.
//
// "Deal(s)" itself is translated to match the existing navDeals entry in
// DIRECTORY_STRINGS (zh "交易", ms "Urus Niaga") so the sidebar label and
// this module's own copy read as the same word throughout the portal.
export type PortalDealsStrings = {
  // Shared across the list page, and reused as the "Deals" breadcrumb
  // label on the new/detail/edit pages.
  pageTitle: string;
  // The "+ New deal" call to action — the list page's header button and
  // empty-state button, and the new-deal page's own breadcrumb/title.
  newDealLabel: string;
  statOpenLabel: string;
  statWonLabel: string;
  statWonValueLabel: string;
  tableDealHeader: string;
  tableCompanyContactHeader: string;
  // "Value" / "Status" — reused as both the list table's column headers
  // and the detail page's/form's own field labels, since it's the same
  // word in every one of those spots.
  valueLabel: string;
  statusLabel: string;
  emptyDealsTitle: string;
  emptyDealsDescription: string;
  // "Edit" / "Delete" — the detail page's two header actions; editLabel is
  // also reused as the edit page's own breadcrumb label.
  editLabel: string;
  deleteLabel: string;
  deleteConfirmMessage: string;
  detailsHeading: string;
  expectedCloseDateLabel: string;
  // "Company" / "Contact" — the detail page's own DetailRow labels, and
  // (via companyLabel/contactLabel) the create/edit form's matching
  // FieldGroup labels.
  companyLabel: string;
  contactLabel: string;
  notesLabel: string;
  addTaskLabel: string;
  noOpenTasksTitle: string;
  dealTitleLabel: string;
  dealTitlePlaceholder: string;
  noCompanyOption: string;
  noContactOption: string;
  notesPlaceholder: string;
  createDealSubmit: string;
  saveDealSubmit: string;
  savingLabel: string;
};

export const PORTAL_DEALS_STRINGS: Record<DirectoryLocale, PortalDealsStrings> = {
  en: {
    pageTitle: "Deals",
    newDealLabel: "New deal",
    statOpenLabel: "Open",
    statWonLabel: "Won",
    statWonValueLabel: "Won value",
    tableDealHeader: "Deal",
    tableCompanyContactHeader: "Company / contact",
    valueLabel: "Value",
    statusLabel: "Status",
    emptyDealsTitle: "No deals yet.",
    emptyDealsDescription: "Track the opportunities you're working on with your companies and contacts.",
    editLabel: "Edit",
    deleteLabel: "Delete",
    deleteConfirmMessage: "Delete this deal? Its tasks will be unlinked.",
    detailsHeading: "Details",
    expectedCloseDateLabel: "Expected close date",
    companyLabel: "Company",
    contactLabel: "Contact",
    notesLabel: "Notes",
    addTaskLabel: "Add task",
    noOpenTasksTitle: "No open tasks for this deal.",
    dealTitleLabel: "Deal title",
    dealTitlePlaceholder: "Acme Inc. — Website redesign",
    noCompanyOption: "No company",
    noContactOption: "No contact",
    notesPlaceholder: "Anything worth remembering about this deal…",
    createDealSubmit: "Create deal",
    saveDealSubmit: "Save deal",
    savingLabel: "Saving…",
  },
  zh: {
    pageTitle: "交易",
    newDealLabel: "新建交易",
    statOpenLabel: "进行中",
    statWonLabel: "已成交",
    statWonValueLabel: "成交金额",
    tableDealHeader: "交易",
    tableCompanyContactHeader: "公司 / 联系人",
    valueLabel: "金额",
    statusLabel: "状态",
    emptyDealsTitle: "暂无交易。",
    emptyDealsDescription: "追踪您正在与客户公司和联系人推进的商机。",
    editLabel: "编辑",
    deleteLabel: "删除",
    deleteConfirmMessage: "删除此交易？其关联的任务将被取消关联。",
    detailsHeading: "详情",
    expectedCloseDateLabel: "预计成交日期",
    companyLabel: "公司",
    contactLabel: "联系人",
    notesLabel: "备注",
    addTaskLabel: "添加任务",
    noOpenTasksTitle: "此交易暂无待办任务。",
    dealTitleLabel: "交易名称",
    dealTitlePlaceholder: "Acme Inc. — 网站改版",
    noCompanyOption: "无公司",
    noContactOption: "无联系人",
    notesPlaceholder: "关于这笔交易，有什么值得记下的…",
    createDealSubmit: "创建交易",
    saveDealSubmit: "保存交易",
    savingLabel: "保存中…",
  },
  ms: {
    pageTitle: "Urus Niaga",
    newDealLabel: "Urus Niaga Baharu",
    statOpenLabel: "Aktif",
    statWonLabel: "Menang",
    statWonValueLabel: "Nilai Menang",
    tableDealHeader: "Urus Niaga",
    tableCompanyContactHeader: "Syarikat / Kenalan",
    valueLabel: "Nilai",
    statusLabel: "Status",
    emptyDealsTitle: "Belum ada urus niaga.",
    emptyDealsDescription: "Jejaki peluang yang anda usahakan bersama syarikat dan kenalan anda.",
    editLabel: "Edit",
    deleteLabel: "Padam",
    deleteConfirmMessage: "Padam urus niaga ini? Tugasan berkaitan akan dinyahpautkan.",
    detailsHeading: "Butiran",
    expectedCloseDateLabel: "Tarikh Jangkaan Ditutup",
    companyLabel: "Syarikat",
    contactLabel: "Kenalan",
    notesLabel: "Nota",
    addTaskLabel: "Tambah Tugasan",
    noOpenTasksTitle: "Tiada tugasan belum selesai untuk urus niaga ini.",
    dealTitleLabel: "Tajuk Urus Niaga",
    dealTitlePlaceholder: "Acme Inc. — Reka Bentuk Semula Laman Web",
    noCompanyOption: "Tiada syarikat",
    noContactOption: "Tiada kenalan",
    notesPlaceholder: "Apa-apa yang perlu diingati tentang urus niaga ini…",
    createDealSubmit: "Cipta Urus Niaga",
    saveDealSubmit: "Simpan Urus Niaga",
    savingLabel: "Menyimpan…",
  },
};

// The deals list page's "{count} deal(s)" line under the page title —
// plural-aware (English needs "1 deal" vs "N deals"), same reasoning as
// formatViewsLabel/formatPhotoCountLabel in directory-i18n.ts: it branches
// on count, so it can't be a plain PORTAL_DEALS_STRINGS template string.
export function formatDealsCountLabel(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `${count} 笔交易`;
  if (locale === "ms") return `${count} urus niaga`;
  return count === 1 ? "1 deal" : `${count} deals`;
}

// The deal detail page's "Open tasks (N)" card heading — fills in the
// {count} token.
export function formatOpenTasksHeading(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `待办任务（${count}）`;
  if (locale === "ms") return `Tugasan Belum Selesai (${count})`;
  return `Open tasks (${count})`;
}

// The create/edit form's "Value ({currency})" field label — fills in the
// {currency} token (e.g. "USD", "MYR").
export function formatValueFieldLabel(currency: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `金额（${currency}）`;
  if (locale === "ms") return `Nilai (${currency})`;
  return `Value (${currency})`;
}

// The edit-deal page's own title — fills in the deal's own name, which is
// never itself translated.
export function formatEditDealTitle(title: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `编辑 ${title}`;
  if (locale === "ms") return `Edit ${title}`;
  return `Edit ${title}`;
}
