import type { DirectoryLocale } from "@/lib/directory-i18n";

// The business portal's Contacts CRM module — the list/new/detail/edit/
// import pages under src/app/business-portal/(dashboard)/contacts/ and
// their supporting forms in src/components/business-crm/ (partner-contact-
// form.tsx, new-partner-contact-form.tsx, partner-import-form.tsx). Its own
// topic-scoped file, following the same type-then-one-block-per-locale
// shape as PortalChromeStrings in portal-i18n.ts and DIRECTORY_STRINGS in
// directory-i18n.ts.
export type PortalContactsStrings = {
  // "Contacts" — the list page's own H1, and the breadcrumb crumb that links
  // back to it from every other page in this module (new/detail/edit/
  // import). Kept as one key since all of those are the exact same word.
  breadcrumbContacts: string;

  // List page (contacts/page.tsx). contactsCountOne/contactsCountOther are
  // the plural-aware count under the heading — see formatContactsCount
  // below for how the {count} token gets filled in.
  contactsCountOne: string;
  contactsCountOther: string;
  // "Import"/"New contact" — each reused as both a header action and (for
  // New contact) the empty state's own CTA / the New contact page's own
  // breadcrumb crumb and title.
  importCta: string;
  newContactCta: string;
  listEmptyTitle: string;
  listEmptyDescription: string;
  columnContact: string;
  columnCompany: string;
  columnEmail: string;
  columnPhone: string;

  // Detail page (contacts/[id]/page.tsx). "Edit" doubles as the Edit page's
  // own breadcrumb crumb.
  editCta: string;
  deleteCta: string;
  deleteConfirm: string;
  detailsHeading: string;
  detailCompanyLabel: string;
  detailEmailLabel: string;
  detailPhoneLabel: string;
  detailNotesLabel: string;
  // {count} token — see formatDealsHeading below.
  dealsHeading: string;
  addDealCta: string;
  noDealsLinked: string;
  // {count} token — see formatTasksHeading below.
  tasksHeading: string;
  addTaskCta: string;
  noOpenTasks: string;

  // Edit page (contacts/[id]/edit/page.tsx) — {name} token, filled in via
  // formatEditContactTitle below.
  editContactTitle: string;

  // Import page (contacts/import/page.tsx) — "Import" above doubles as its
  // own breadcrumb crumb.
  importPageTitle: string;
  importPageDescription: string;

  // Shared contact form (partner-contact-form.tsx) — used by both the
  // New contact page (via new-partner-contact-form.tsx) and the Edit page.
  formFirstNameLabel: string;
  formFirstNamePlaceholder: string;
  formLastNameLabel: string;
  formLastNamePlaceholder: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formPhoneLabel: string;
  formPhonePlaceholder: string;
  formJobTitleLabel: string;
  formJobTitlePlaceholder: string;
  formCompanyLabel: string;
  formNoCompanyOption: string;
  formNotesLabel: string;
  formNotesPlaceholder: string;
  // Default submit label, used on the Edit page (which doesn't override
  // it) — see the "New contact" createContactCta below for the one case
  // that does override it.
  formSaveCta: string;
  formSavingCta: string;

  // New contact form (new-partner-contact-form.tsx) — wraps the shared form
  // above with the quick-import (business card photo / shared contact
  // file) flow; the quick-import widget itself (ContactQuickImport) is a
  // shared component outside this module and stays as-is.
  quickImportHint: string;
  createContactCta: string;

  // Import form (partner-import-form.tsx) — upload step.
  importUploadFileLabel: string;
  importUploadHint: string;
  importPreviewCta: string;
  importReadingFileCta: string;

  // Import form — preview step. importPreviewSummary has {importable}/
  // {total} tokens (see formatImportPreviewSummary below); the three
  // *Suffix strings each have a {count} token and are appended only when
  // that count is above zero, same conditional structure as the English
  // original.
  importPreviewSummary: string;
  importPreviewSkippedSuffix: string;
  importPreviewDuplicateEmailSuffix: string;
  importPreviewDuplicatePhoneSuffix: string;
  importFillMissingLabel: string;
  importColumnName: string;
  importColumnEmail: string;
  importColumnPhone: string;
  importColumnCompany: string;
  importColumnStatus: string;
  importDuplicateWillFill: string;
  importDuplicateWillSkip: string;
  // Prefixes a row's own issue text (reported by the import preview action,
  // outside this module, and not itself translated here) when a new row
  // still has a non-blocking issue.
  importNewRowPrefix: string;
  importNewRowLabel: string;
  importStartOverCta: string;
  // {count} token — see formatImportConfirmCta below.
  importConfirmCtaOne: string;
  importConfirmCtaOther: string;
  importingCta: string;

  // Import form — done step. Each importSummary* pair is plural-aware (and
  // the non-"Created" ones carry their own leading ", " since the English
  // original concatenates them onto one sentence) — see the matching
  // formatImportSummary* helper below for each.
  importDoneTitle: string;
  importSummaryCreatedOne: string;
  importSummaryCreatedOther: string;
  importSummaryUpdatedOne: string;
  importSummaryUpdatedOther: string;
  importSummaryCompanyCreatedOne: string;
  importSummaryCompanyCreatedOther: string;
  importSummarySkippedDuplicateOne: string;
  importSummarySkippedDuplicateOther: string;
  importSummarySkippedInvalidOne: string;
  importSummarySkippedInvalidOther: string;
  // The sentence's closing punctuation — its own key since Chinese uses a
  // full-width "。" rather than ".".
  importSummaryPeriod: string;
  viewContactsCta: string;
  importAnotherFileCta: string;
};

export const PORTAL_CONTACTS_STRINGS: Record<DirectoryLocale, PortalContactsStrings> = {
  en: {
    breadcrumbContacts: "Contacts",
    contactsCountOne: "1 contact",
    contactsCountOther: "{count} contacts",
    importCta: "Import",
    newContactCta: "New contact",
    listEmptyTitle: "No contacts yet.",
    listEmptyDescription: "Add the people you work with to start linking deals and tasks to them.",
    columnContact: "Contact",
    columnCompany: "Company",
    columnEmail: "Email",
    columnPhone: "Phone",

    editCta: "Edit",
    deleteCta: "Delete",
    deleteConfirm: "Delete this contact? Its deals and tasks will be unlinked.",
    detailsHeading: "Details",
    detailCompanyLabel: "Company",
    detailEmailLabel: "Email",
    detailPhoneLabel: "Phone",
    detailNotesLabel: "Notes",
    dealsHeading: "Deals ({count})",
    addDealCta: "Add deal",
    noDealsLinked: "No deals linked to this contact yet.",
    tasksHeading: "Open tasks ({count})",
    addTaskCta: "Add task",
    noOpenTasks: "No open tasks for this contact.",

    editContactTitle: "Edit {name}",

    importPageTitle: "Import contacts",
    importPageDescription:
      "Upload a CSV or Excel export from Google Contacts, another CRM, or your own spreadsheet. Review the preview before anything is saved.",

    formFirstNameLabel: "First name",
    formFirstNamePlaceholder: "Jane",
    formLastNameLabel: "Last name",
    formLastNamePlaceholder: "Doe",
    formEmailLabel: "Email",
    formEmailPlaceholder: "jane@acme.com",
    formPhoneLabel: "Phone",
    formPhonePlaceholder: "+60 12 345 6789",
    formJobTitleLabel: "Job title",
    formJobTitlePlaceholder: "Marketing Manager",
    formCompanyLabel: "Company",
    formNoCompanyOption: "No company",
    formNotesLabel: "Notes",
    formNotesPlaceholder: "Anything worth remembering about this contact…",
    formSaveCta: "Save contact",
    formSavingCta: "Saving…",

    quickImportHint: "Fills in the fields below from a business card photo or a shared contact file — review before saving.",
    createContactCta: "Create contact",

    importUploadFileLabel: "CSV or Excel file",
    importUploadHint:
      "CSV or Excel (.xlsx) — from Google Contacts, HubSpot, Salesforce, or your own spreadsheet. Columns are matched automatically, and a Company/Organization column creates or links that contact's company too. Max 5MB.",
    importPreviewCta: "Preview import",
    importReadingFileCta: "Reading file…",

    importPreviewSummary: "{importable} of {total} contacts will be imported",
    importPreviewSkippedSuffix: " — {count} skipped (missing name, or no email/phone)",
    importPreviewDuplicateEmailSuffix: ", {count} match an existing contact by email",
    importPreviewDuplicatePhoneSuffix: ", {count} match an existing contact by phone",
    importFillMissingLabel: "Fill in missing info on existing contacts (matched by email or phone)",
    importColumnName: "Name",
    importColumnEmail: "Email",
    importColumnPhone: "Phone",
    importColumnCompany: "Company",
    importColumnStatus: "Status",
    importDuplicateWillFill: "Duplicate — will fill in missing info",
    importDuplicateWillSkip: "Duplicate — will skip",
    importNewRowPrefix: "New — ",
    importNewRowLabel: "New",
    importStartOverCta: "Start over",
    importConfirmCtaOne: "Import 1 contact",
    importConfirmCtaOther: "Import {count} contacts",
    importingCta: "Importing…",

    importDoneTitle: "Import complete",
    importSummaryCreatedOne: "1 contact created",
    importSummaryCreatedOther: "{count} contacts created",
    importSummaryUpdatedOne: ", 1 existing contact updated with missing info",
    importSummaryUpdatedOther: ", {count} existing contacts updated with missing info",
    importSummaryCompanyCreatedOne: ", 1 new company",
    importSummaryCompanyCreatedOther: ", {count} new companies",
    importSummarySkippedDuplicateOne: ", 1 duplicate skipped",
    importSummarySkippedDuplicateOther: ", {count} duplicates skipped",
    importSummarySkippedInvalidOne: ", 1 row skipped (missing name, or no email/phone)",
    importSummarySkippedInvalidOther: ", {count} rows skipped (missing name, or no email/phone)",
    importSummaryPeriod: ".",
    viewContactsCta: "View contacts",
    importAnotherFileCta: "Import another file",
  },
  zh: {
    breadcrumbContacts: "联系人",
    contactsCountOne: "1 位联系人",
    contactsCountOther: "{count} 位联系人",
    importCta: "导入",
    newContactCta: "新建联系人",
    listEmptyTitle: "暂无联系人。",
    listEmptyDescription: "添加您合作的联系人，即可开始为他们关联交易与任务。",
    columnContact: "联系人",
    columnCompany: "公司",
    columnEmail: "电子邮件",
    columnPhone: "电话",

    editCta: "编辑",
    deleteCta: "删除",
    deleteConfirm: "确定要删除此联系人吗？与其关联的交易和任务将会取消关联。",
    detailsHeading: "详细信息",
    detailCompanyLabel: "公司",
    detailEmailLabel: "电子邮件",
    detailPhoneLabel: "电话",
    detailNotesLabel: "备注",
    dealsHeading: "交易（{count}）",
    addDealCta: "添加交易",
    noDealsLinked: "该联系人尚未关联任何交易。",
    tasksHeading: "待办任务（{count}）",
    addTaskCta: "添加任务",
    noOpenTasks: "该联系人暂无待办任务。",

    editContactTitle: "编辑 {name}",

    importPageTitle: "导入联系人",
    importPageDescription: "上传从 Google 联系人、其他 CRM 或您自己的表格导出的 CSV 或 Excel 文件，保存前可先预览确认。",

    formFirstNameLabel: "名字",
    formFirstNamePlaceholder: "Jane",
    formLastNameLabel: "姓氏",
    formLastNamePlaceholder: "Doe",
    formEmailLabel: "电子邮件",
    formEmailPlaceholder: "jane@acme.com",
    formPhoneLabel: "电话",
    formPhonePlaceholder: "+60 12 345 6789",
    formJobTitleLabel: "职位",
    formJobTitlePlaceholder: "市场经理",
    formCompanyLabel: "公司",
    formNoCompanyOption: "无公司",
    formNotesLabel: "备注",
    formNotesPlaceholder: "记录关于此联系人值得留意的事项…",
    formSaveCta: "保存联系人",
    formSavingCta: "保存中…",

    quickImportHint: "系统会根据名片照片或分享的联系人文件自动填入以下字段——保存前请先核对。",
    createContactCta: "创建联系人",

    importUploadFileLabel: "CSV 或 Excel 文件",
    importUploadHint:
      "CSV 或 Excel（.xlsx）文件——可来自 Google 联系人、HubSpot、Salesforce 或您自己的表格。系统会自动匹配栏位，其中的公司/组织栏位还会创建或关联该联系人的公司。文件大小上限为 5MB。",
    importPreviewCta: "预览导入",
    importReadingFileCta: "正在读取文件…",

    importPreviewSummary: "将导入 {total} 位联系人中的 {importable} 位",
    importPreviewSkippedSuffix: "——{count} 位已跳过（缺少姓名，或没有电子邮件/电话）",
    importPreviewDuplicateEmailSuffix: "，其中 {count} 位的电子邮件与现有联系人相符",
    importPreviewDuplicatePhoneSuffix: "，其中 {count} 位的电话与现有联系人相符",
    importFillMissingLabel: "为现有联系人（按电子邮件或电话匹配）补全缺失信息",
    importColumnName: "姓名",
    importColumnEmail: "电子邮件",
    importColumnPhone: "电话",
    importColumnCompany: "公司",
    importColumnStatus: "状态",
    importDuplicateWillFill: "重复——将补全缺失信息",
    importDuplicateWillSkip: "重复——将跳过",
    importNewRowPrefix: "新增——",
    importNewRowLabel: "新增",
    importStartOverCta: "重新开始",
    importConfirmCtaOne: "导入 1 位联系人",
    importConfirmCtaOther: "导入 {count} 位联系人",
    importingCta: "导入中…",

    importDoneTitle: "导入完成",
    importSummaryCreatedOne: "已创建 1 位联系人",
    importSummaryCreatedOther: "已创建 {count} 位联系人",
    importSummaryUpdatedOne: "，已为 1 位现有联系人补全缺失信息",
    importSummaryUpdatedOther: "，已为 {count} 位现有联系人补全缺失信息",
    importSummaryCompanyCreatedOne: "，新建了 1 家公司",
    importSummaryCompanyCreatedOther: "，新建了 {count} 家公司",
    importSummarySkippedDuplicateOne: "，跳过了 1 个重复项",
    importSummarySkippedDuplicateOther: "，跳过了 {count} 个重复项",
    importSummarySkippedInvalidOne: "，跳过了 1 行（缺少姓名，或没有电子邮件/电话）",
    importSummarySkippedInvalidOther: "，跳过了 {count} 行（缺少姓名，或没有电子邮件/电话）",
    importSummaryPeriod: "。",
    viewContactsCta: "查看联系人",
    importAnotherFileCta: "导入其他文件",
  },
  ms: {
    breadcrumbContacts: "Kenalan",
    contactsCountOne: "1 kenalan",
    contactsCountOther: "{count} kenalan",
    importCta: "Import",
    newContactCta: "Kenalan baharu",
    listEmptyTitle: "Belum ada kenalan.",
    listEmptyDescription: "Tambah orang yang anda berurusan dengannya untuk mula mengaitkan urus niaga dan tugasan.",
    columnContact: "Kenalan",
    columnCompany: "Syarikat",
    columnEmail: "E-mel",
    columnPhone: "Telefon",

    editCta: "Sunting",
    deleteCta: "Padam",
    deleteConfirm: "Padam kenalan ini? Urus niaga dan tugasan yang berkaitan akan dinyahkaitkan.",
    detailsHeading: "Butiran",
    detailCompanyLabel: "Syarikat",
    detailEmailLabel: "E-mel",
    detailPhoneLabel: "Telefon",
    detailNotesLabel: "Nota",
    dealsHeading: "Urus Niaga ({count})",
    addDealCta: "Tambah urus niaga",
    noDealsLinked: "Belum ada urus niaga dikaitkan dengan kenalan ini.",
    tasksHeading: "Tugasan terbuka ({count})",
    addTaskCta: "Tambah tugasan",
    noOpenTasks: "Tiada tugasan terbuka untuk kenalan ini.",

    editContactTitle: "Sunting {name}",

    importPageTitle: "Import kenalan",
    importPageDescription:
      "Muat naik eksport CSV atau Excel daripada Google Contacts, CRM lain, atau hamparan anda sendiri. Semak pratonton sebelum apa-apa disimpan.",

    formFirstNameLabel: "Nama pertama",
    formFirstNamePlaceholder: "Jane",
    formLastNameLabel: "Nama akhir",
    formLastNamePlaceholder: "Doe",
    formEmailLabel: "E-mel",
    formEmailPlaceholder: "jane@acme.com",
    formPhoneLabel: "Telefon",
    formPhonePlaceholder: "+60 12 345 6789",
    formJobTitleLabel: "Jawatan",
    formJobTitlePlaceholder: "Pengurus Pemasaran",
    formCompanyLabel: "Syarikat",
    formNoCompanyOption: "Tiada syarikat",
    formNotesLabel: "Nota",
    formNotesPlaceholder: "Apa-apa yang perlu diingati tentang kenalan ini…",
    formSaveCta: "Simpan kenalan",
    formSavingCta: "Menyimpan…",

    quickImportHint: "Mengisi ruangan di bawah daripada foto kad perniagaan atau fail kenalan yang dikongsi — semak sebelum menyimpan.",
    createContactCta: "Cipta kenalan",

    importUploadFileLabel: "Fail CSV atau Excel",
    importUploadHint:
      "CSV atau Excel (.xlsx) — daripada Google Contacts, HubSpot, Salesforce, atau hamparan anda sendiri. Lajur dipadankan secara automatik, dan lajur Syarikat/Organisasi turut mencipta atau mengaitkan syarikat kenalan tersebut. Maksimum 5MB.",
    importPreviewCta: "Pratonton import",
    importReadingFileCta: "Membaca fail…",

    importPreviewSummary: "{importable} daripada {total} kenalan akan diimport",
    importPreviewSkippedSuffix: " — {count} dilangkau (nama tiada, atau tiada e-mel/telefon)",
    importPreviewDuplicateEmailSuffix: ", {count} sepadan dengan kenalan sedia ada mengikut e-mel",
    importPreviewDuplicatePhoneSuffix: ", {count} sepadan dengan kenalan sedia ada mengikut telefon",
    importFillMissingLabel: "Isi maklumat yang tiada pada kenalan sedia ada (dipadankan mengikut e-mel atau telefon)",
    importColumnName: "Nama",
    importColumnEmail: "E-mel",
    importColumnPhone: "Telefon",
    importColumnCompany: "Syarikat",
    importColumnStatus: "Status",
    importDuplicateWillFill: "Pendua — akan mengisi maklumat yang tiada",
    importDuplicateWillSkip: "Pendua — akan dilangkau",
    importNewRowPrefix: "Baharu — ",
    importNewRowLabel: "Baharu",
    importStartOverCta: "Mula semula",
    importConfirmCtaOne: "Import 1 kenalan",
    importConfirmCtaOther: "Import {count} kenalan",
    importingCta: "Mengimport…",

    importDoneTitle: "Import selesai",
    importSummaryCreatedOne: "1 kenalan dicipta",
    importSummaryCreatedOther: "{count} kenalan dicipta",
    importSummaryUpdatedOne: ", 1 kenalan sedia ada dikemas kini dengan maklumat yang tiada",
    importSummaryUpdatedOther: ", {count} kenalan sedia ada dikemas kini dengan maklumat yang tiada",
    importSummaryCompanyCreatedOne: ", 1 syarikat baharu",
    importSummaryCompanyCreatedOther: ", {count} syarikat baharu",
    importSummarySkippedDuplicateOne: ", 1 pendua dilangkau",
    importSummarySkippedDuplicateOther: ", {count} pendua dilangkau",
    importSummarySkippedInvalidOne: ", 1 baris dilangkau (nama tiada, atau tiada e-mel/telefon)",
    importSummarySkippedInvalidOther: ", {count} baris dilangkau (nama tiada, atau tiada e-mel/telefon)",
    importSummaryPeriod: ".",
    viewContactsCta: "Lihat kenalan",
    importAnotherFileCta: "Import fail lain",
  },
};

// Fills in contactsCountOne/contactsCountOther's {count} token — the list
// page's own plural-aware heading, same "branch on count, format outside
// the Record" reasoning as formatViewsLabel/formatPhotoCountLabel in
// directory-i18n.ts.
export function formatContactsCount(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return count === 1 ? t.contactsCountOne : t.contactsCountOther.replace("{count}", count.toLocaleString());
}

// Fills in dealsHeading's {count} token — the detail page's "Deals (N)"
// card title.
export function formatDealsHeading(count: number, locale: DirectoryLocale): string {
  return PORTAL_CONTACTS_STRINGS[locale].dealsHeading.replace("{count}", String(count));
}

// Fills in tasksHeading's {count} token — the detail page's
// "Open tasks (N)" card title.
export function formatTasksHeading(count: number, locale: DirectoryLocale): string {
  return PORTAL_CONTACTS_STRINGS[locale].tasksHeading.replace("{count}", String(count));
}

// Fills in editContactTitle's {name} token — the Edit page's own <h1>.
export function formatEditContactTitle(name: string, locale: DirectoryLocale): string {
  return PORTAL_CONTACTS_STRINGS[locale].editContactTitle.replace("{name}", name);
}

// Fills in importPreviewSummary's {importable}/{total} tokens.
export function formatImportPreviewSummary(importable: number, total: number, locale: DirectoryLocale): string {
  return PORTAL_CONTACTS_STRINGS[locale].importPreviewSummary
    .replace("{importable}", String(importable))
    .replace("{total}", String(total));
}

// Fills in one of the preview step's three conditional suffix strings'
// {count} token — importPreviewSkippedSuffix/importPreviewDuplicateEmailSuffix/
// importPreviewDuplicatePhoneSuffix all share this same shape, so the
// caller passes which one it means.
export function formatImportPreviewSuffix(
  key: "importPreviewSkippedSuffix" | "importPreviewDuplicateEmailSuffix" | "importPreviewDuplicatePhoneSuffix",
  count: number,
  locale: DirectoryLocale,
): string {
  return PORTAL_CONTACTS_STRINGS[locale][key].replace("{count}", String(count));
}

// Fills in importConfirmCtaOne/importConfirmCtaOther's {count} token — the
// preview step's "Import N contact(s)" submit button.
export function formatImportConfirmCta(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return (count === 1 ? t.importConfirmCtaOne : t.importConfirmCtaOther).replace("{count}", String(count));
}

// Fills in importSummaryCreatedOne/importSummaryCreatedOther's {count}
// token — the done step's own leading clause.
export function formatImportSummaryCreated(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return (count === 1 ? t.importSummaryCreatedOne : t.importSummaryCreatedOther).replace("{count}", String(count));
}

// Fills in importSummaryUpdatedOne/importSummaryUpdatedOther's {count}
// token — the done step's own conditional ", N existing contact(s)
// updated…" clause.
export function formatImportSummaryUpdated(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return (count === 1 ? t.importSummaryUpdatedOne : t.importSummaryUpdatedOther).replace("{count}", String(count));
}

// Fills in importSummaryCompanyCreatedOne/importSummaryCompanyCreatedOther's
// {count} token — the done step's own conditional ", N new company/companies"
// clause.
export function formatImportSummaryCompanyCreated(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return (count === 1 ? t.importSummaryCompanyCreatedOne : t.importSummaryCompanyCreatedOther).replace(
    "{count}",
    String(count),
  );
}

// Fills in importSummarySkippedDuplicateOne/importSummarySkippedDuplicateOther's
// {count} token — the done step's own conditional ", N duplicate(s) skipped"
// clause.
export function formatImportSummarySkippedDuplicate(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return (count === 1 ? t.importSummarySkippedDuplicateOne : t.importSummarySkippedDuplicateOther).replace(
    "{count}",
    String(count),
  );
}

// Fills in importSummarySkippedInvalidOne/importSummarySkippedInvalidOther's
// {count} token — the done step's own conditional ", N row(s) skipped…"
// clause.
export function formatImportSummarySkippedInvalid(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return (count === 1 ? t.importSummarySkippedInvalidOne : t.importSummarySkippedInvalidOther).replace(
    "{count}",
    String(count),
  );
}
