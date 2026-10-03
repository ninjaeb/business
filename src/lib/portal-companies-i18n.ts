import type { DirectoryLocale } from "@/lib/directory-i18n";

// The business portal's Companies CRM module (list, detail, new/edit
// pages, and the shared PartnerCompanyForm) — follows the same
// type-then-one-block-per-locale shape as PORTAL_CHROME_STRINGS in
// portal-i18n.ts. Count-bearing headings (the list page's own company
// count, and the detail page's Contacts/Deals/Open tasks section
// headings) are kept as {count}-token templates filled in by
// formatPortalCompaniesCount below, rather than plain strings, the same
// reasoning as formatFooterCopyright's own comment in directory-i18n.ts.
export type PortalCompaniesStrings = {
  // Shared page title, reused as-is for the list page's own <h1> and as
  // the "Companies" breadcrumb entry on every other page in this module.
  companiesTitle: string;
  // {count} token — see formatPortalCompaniesCount below. English branches
  // singular/plural; zh/ms don't need to.
  companyCountTemplate: string;
  companyCountSingularTemplate: string;
  newCompanyCta: string;
  emptyTitle: string;
  emptyDescription: string;
  columnCompany: string;
  columnIndustry: string;
  columnContacts: string;
  columnDeals: string;
  createCompanySubmitLabel: string;
  editCta: string;
  deleteCta: string;
  deleteConfirmMessage: string;
  detailsHeading: string;
  websiteLabel: string;
  phoneLabel: string;
  addressLabel: string;
  notesLabel: string;
  // {count} tokens — see formatPortalCompaniesCount below.
  contactsHeadingTemplate: string;
  dealsHeadingTemplate: string;
  openTasksHeadingTemplate: string;
  addContactCta: string;
  addDealCta: string;
  addTaskCta: string;
  noContactsEmpty: string;
  noDealsEmpty: string;
  noOpenTasksEmpty: string;
  editBreadcrumb: string;
  // {name} token — see formatEditCompanyTitle below.
  editCompanyTitleTemplate: string;
  companyNameLabel: string;
  companyNamePlaceholder: string;
  industryLabel: string;
  industryUnclassified: string;
  websitePlaceholder: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  notesPlaceholder: string;
  saveCompanyCta: string;
  savingCta: string;
};

export const PORTAL_COMPANIES_STRINGS: Record<DirectoryLocale, PortalCompaniesStrings> = {
  en: {
    companiesTitle: "Companies",
    companyCountTemplate: "{count} companies",
    companyCountSingularTemplate: "1 company",
    newCompanyCta: "New company",
    emptyTitle: "No companies yet.",
    emptyDescription: "Add the businesses you work with to start tracking contacts and deals against them.",
    columnCompany: "Company",
    columnIndustry: "Industry",
    columnContacts: "Contacts",
    columnDeals: "Deals",
    createCompanySubmitLabel: "Create company",
    editCta: "Edit",
    deleteCta: "Delete",
    deleteConfirmMessage: "Delete this company? Its contacts, deals, and tasks will be unlinked.",
    detailsHeading: "Details",
    websiteLabel: "Website",
    phoneLabel: "Phone",
    addressLabel: "Address",
    notesLabel: "Notes",
    contactsHeadingTemplate: "Contacts ({count})",
    dealsHeadingTemplate: "Deals ({count})",
    openTasksHeadingTemplate: "Open tasks ({count})",
    addContactCta: "Add contact",
    addDealCta: "Add deal",
    addTaskCta: "Add task",
    noContactsEmpty: "No contacts linked to this company yet.",
    noDealsEmpty: "No deals linked to this company yet.",
    noOpenTasksEmpty: "No open tasks for this company.",
    editBreadcrumb: "Edit",
    editCompanyTitleTemplate: "Edit {name}",
    companyNameLabel: "Company name",
    companyNamePlaceholder: "Acme Inc.",
    industryLabel: "Industry",
    industryUnclassified: "Unclassified",
    websitePlaceholder: "https://acme.com",
    phonePlaceholder: "+60 12 345 6789",
    addressPlaceholder: "123 Main St, City",
    notesPlaceholder: "Anything worth remembering about this company…",
    saveCompanyCta: "Save company",
    savingCta: "Saving…",
  },
  zh: {
    companiesTitle: "公司",
    companyCountTemplate: "{count} 家公司",
    companyCountSingularTemplate: "1 家公司",
    newCompanyCta: "新建公司",
    emptyTitle: "暂无公司。",
    emptyDescription: "添加您合作的商家，开始追踪与其相关的联系人和交易。",
    columnCompany: "公司",
    columnIndustry: "行业",
    columnContacts: "联系人",
    columnDeals: "交易",
    createCompanySubmitLabel: "创建公司",
    editCta: "编辑",
    deleteCta: "删除",
    deleteConfirmMessage: "删除此公司？与其关联的联系人、交易和任务将被解除关联。",
    detailsHeading: "详情",
    websiteLabel: "网站",
    phoneLabel: "电话",
    addressLabel: "地址",
    notesLabel: "备注",
    contactsHeadingTemplate: "联系人（{count}）",
    dealsHeadingTemplate: "交易（{count}）",
    openTasksHeadingTemplate: "待办任务（{count}）",
    addContactCta: "添加联系人",
    addDealCta: "添加交易",
    addTaskCta: "添加任务",
    noContactsEmpty: "暂无与此公司关联的联系人。",
    noDealsEmpty: "暂无与此公司关联的交易。",
    noOpenTasksEmpty: "此公司暂无待办任务。",
    editBreadcrumb: "编辑",
    editCompanyTitleTemplate: "编辑{name}",
    companyNameLabel: "公司名称",
    companyNamePlaceholder: "Acme Inc.",
    industryLabel: "行业",
    industryUnclassified: "未分类",
    websitePlaceholder: "https://acme.com",
    phonePlaceholder: "+60 12 345 6789",
    addressPlaceholder: "123 Main St, City",
    notesPlaceholder: "任何值得记住的关于此公司的信息…",
    saveCompanyCta: "保存公司",
    savingCta: "保存中…",
  },
  ms: {
    companiesTitle: "Syarikat",
    companyCountTemplate: "{count} syarikat",
    companyCountSingularTemplate: "1 syarikat",
    newCompanyCta: "Syarikat baharu",
    emptyTitle: "Belum ada syarikat.",
    emptyDescription: "Tambah perniagaan yang anda bekerjasama dengannya untuk mula menjejaki kenalan dan tawaran berkaitan mereka.",
    columnCompany: "Syarikat",
    columnIndustry: "Industri",
    columnContacts: "Kenalan",
    columnDeals: "Tawaran",
    createCompanySubmitLabel: "Cipta syarikat",
    editCta: "Edit",
    deleteCta: "Padam",
    deleteConfirmMessage: "Padam syarikat ini? Kenalan, tawaran dan tugasannya akan dinyahpaut.",
    detailsHeading: "Butiran",
    websiteLabel: "Laman web",
    phoneLabel: "Telefon",
    addressLabel: "Alamat",
    notesLabel: "Nota",
    contactsHeadingTemplate: "Kenalan ({count})",
    dealsHeadingTemplate: "Tawaran ({count})",
    openTasksHeadingTemplate: "Tugasan belum selesai ({count})",
    addContactCta: "Tambah kenalan",
    addDealCta: "Tambah tawaran",
    addTaskCta: "Tambah tugasan",
    noContactsEmpty: "Belum ada kenalan dikaitkan dengan syarikat ini.",
    noDealsEmpty: "Belum ada tawaran dikaitkan dengan syarikat ini.",
    noOpenTasksEmpty: "Tiada tugasan belum selesai untuk syarikat ini.",
    editBreadcrumb: "Edit",
    editCompanyTitleTemplate: "Edit {name}",
    companyNameLabel: "Nama syarikat",
    companyNamePlaceholder: "Acme Inc.",
    industryLabel: "Industri",
    industryUnclassified: "Tidak dikelaskan",
    websitePlaceholder: "https://acme.com",
    phonePlaceholder: "+60 12 345 6789",
    addressPlaceholder: "123 Main St, City",
    notesPlaceholder: "Apa-apa yang perlu diingati tentang syarikat ini…",
    saveCompanyCta: "Simpan syarikat",
    savingCta: "Menyimpan…",
  },
};

export function getPortalCompaniesStrings(locale: DirectoryLocale): PortalCompaniesStrings {
  return PORTAL_COMPANIES_STRINGS[locale];
}

// Fills in companyCountTemplate/companyCountSingularTemplate's {count}
// token for the list page's own "N companies" line — English pluralizes,
// zh/ms don't, same branching reasoning as formatViewsLabel in
// directory-i18n.ts.
export function formatPortalCompanyCount(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_COMPANIES_STRINGS[locale];
  if (count === 1) return t.companyCountSingularTemplate;
  return t.companyCountTemplate.replace("{count}", String(count));
}

// Fills in contactsHeadingTemplate/dealsHeadingTemplate/
// openTasksHeadingTemplate's shared {count} token (see the detail page's
// own Contacts/Deals/Open tasks section headings).
export function formatPortalCompaniesCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

// Fills in editCompanyTitleTemplate's {name} token with the company's own
// name (see the edit page's own "Edit {name}" title).
export function formatEditCompanyTitle(template: string, name: string): string {
  return template.replace("{name}", name);
}
