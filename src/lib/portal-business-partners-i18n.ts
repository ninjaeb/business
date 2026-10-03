import type { DirectoryLocale } from "@/lib/directory-i18n";

// Strings for the business-portal's Business Partners CRM module — the
// partner-to-partner referral network (src/app/business-portal/(dashboard)/
// business-partners/*, business-partner-invite-form.tsx,
// business-partner-request-form.tsx). Follows the same type-then-
// one-block-per-locale shape as DIRECTORY_STRINGS in directory-i18n.ts and
// PORTAL_CHROME_STRINGS in portal-i18n.ts. A "use client" component that
// needs these imports PORTAL_BUSINESS_PARTNERS_STRINGS directly (it's plain
// data) rather than receiving the resolved strings as a prop.
export type PortalBusinessPartnersStrings = {
  // business-partners/page.tsx — the combined links + invites list.
  pageTitle: string;
  pageDescription: string;
  inviteBusinessCta: string;
  addPartnerCta: string;
  linksEmptyTitle: string;
  linksEmptyDescription: string;
  colYourListing: string;
  colBusiness: string;
  colStatus: string;
  colDate: string;
  statusConnected: string;
  statusDeclined: string;
  statusAwaitingApproval: string;
  statusRequestSent: string;
  acceptCta: string;
  declineCta: string;
  // {business} replaced with the other side's company name — see the
  // page's own .replace() calls.
  declineConfirm: string;
  removeCta: string;
  cancelCta: string;
  removeConfirm: string;
  cancelRequestConfirm: string;
  invitedBusinessesHeading: string;
  invitesEmptyTitle: string;
  invitesEmptyDescription: string;
  colCompany: string;
  colContact: string;
  colEmail: string;
  colPhone: string;
  colSent: string;
  badgeEmail: string;
  badgeWhatsApp: string;
  badgeNotSent: string;
  deleteInviteCta: string;
  deleteInviteConfirm: string;

  // business-partners/invite/page.tsx
  inviteBreadcrumbParent: string;
  invitePageTitle: string;
  invitePageDescription: string;

  // business-partners/new/page.tsx
  newBreadcrumbCurrent: string;
  newPageTitle: string;

  // business-partner-invite-form.tsx
  formFromListingLabel: string;
  formCompanyLabel: string;
  formCompanyPlaceholder: string;
  formContactNameLabel: string;
  formContactNamePlaceholder: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formPhoneLabel: string;
  formPhonePlaceholder: string;
  formSendingInvite: string;
  formSendInvite: string;

  // business-partner-request-form.tsx
  requestFormYourListingLabel: string;
  requestFormBusinessLabel: string;
  requestFormSearchPlaceholder: string;
  requestFormSearching: string;
  requestFormNoMatches: string;
  requestFormSendingRequest: string;
  requestFormSendRequest: string;
};

export const PORTAL_BUSINESS_PARTNERS_STRINGS: Record<DirectoryLocale, PortalBusinessPartnersStrings> = {
  en: {
    pageTitle: "Business Partners",
    pageDescription:
      "Connect with other businesses on the directory — each shows on the other's public listing page as a Business Partner, once approved.",
    inviteBusinessCta: "Invite a business",
    addPartnerCta: "Add business partner",
    linksEmptyTitle: "No business partners yet.",
    linksEmptyDescription: "Search for a business already on the directory to request connecting with them.",
    colYourListing: "Your listing",
    colBusiness: "Business",
    colStatus: "Status",
    colDate: "Date",
    statusConnected: "Connected",
    statusDeclined: "Declined",
    statusAwaitingApproval: "Awaiting your approval",
    statusRequestSent: "Request sent",
    acceptCta: "Accept",
    declineCta: "Decline",
    declineConfirm: "Decline {business}'s request?",
    removeCta: "Remove",
    cancelCta: "Cancel",
    removeConfirm: "Remove {business} as a business partner? This can't be undone.",
    cancelRequestConfirm: "Cancel this request to {business}?",
    invitedBusinessesHeading: "Invited businesses",
    invitesEmptyTitle: "No invites sent yet.",
    invitesEmptyDescription: "Not every business you work with is on the directory yet — invite them by email and WhatsApp.",
    colCompany: "Company",
    colContact: "Contact",
    colEmail: "Email",
    colPhone: "Phone",
    colSent: "Sent",
    badgeEmail: "Email",
    badgeWhatsApp: "WhatsApp",
    badgeNotSent: "Not sent",
    deleteInviteCta: "Delete",
    deleteInviteConfirm: "Delete the invite to {business}?",
    inviteBreadcrumbParent: "Business Partners",
    invitePageTitle: "Invite a business",
    invitePageDescription: "Not every business you work with is on the directory yet — invite them by email and WhatsApp.",
    newBreadcrumbCurrent: "Add business partner",
    newPageTitle: "Add business partner",
    formFromListingLabel: "From listing",
    formCompanyLabel: "Company",
    formCompanyPlaceholder: "Acme Printing",
    formContactNameLabel: "Contact name",
    formContactNamePlaceholder: "Jane Tan",
    formEmailLabel: "Email",
    formEmailPlaceholder: "jane@acme.com",
    formPhoneLabel: "Contact number",
    formPhonePlaceholder: "+60 12 345 6789",
    formSendingInvite: "Sending invite…",
    formSendInvite: "Send invite",
    requestFormYourListingLabel: "Your listing",
    requestFormBusinessLabel: "Business to connect with",
    requestFormSearchPlaceholder: "Search by company name",
    requestFormSearching: "Searching…",
    requestFormNoMatches: "No matches — only businesses already live on the directory can be found here.",
    requestFormSendingRequest: "Sending request…",
    requestFormSendRequest: "Send request",
  },
  zh: {
    pageTitle: "商业伙伴",
    pageDescription: "与名录上的其他商家建立联系——经对方批准后，双方会互相显示在彼此的公开商家页面上，作为商业伙伴。",
    inviteBusinessCta: "邀请商家",
    addPartnerCta: "添加商业伙伴",
    linksEmptyTitle: "暂时还没有商业伙伴。",
    linksEmptyDescription: "搜索名录上已有的商家，向对方发出合作邀请。",
    colYourListing: "您的商家",
    colBusiness: "合作商家",
    colStatus: "状态",
    colDate: "日期",
    statusConnected: "已连接",
    statusDeclined: "已拒绝",
    statusAwaitingApproval: "待您批准",
    statusRequestSent: "请求已发送",
    acceptCta: "接受",
    declineCta: "拒绝",
    declineConfirm: "拒绝{business}的请求？",
    removeCta: "移除",
    cancelCta: "取消",
    removeConfirm: "将{business}移除为商业伙伴？此操作无法撤销。",
    cancelRequestConfirm: "取消向{business}发出的请求？",
    invitedBusinessesHeading: "已邀请的商家",
    invitesEmptyTitle: "暂时还没有发出邀请。",
    invitesEmptyDescription: "并非所有与您合作的商家都已加入名录——可通过电子邮件和 WhatsApp 邀请他们。",
    colCompany: "公司",
    colContact: "联系人",
    colEmail: "电子邮件",
    colPhone: "电话",
    colSent: "发送时间",
    badgeEmail: "邮件",
    badgeWhatsApp: "WhatsApp",
    badgeNotSent: "尚未发送",
    deleteInviteCta: "删除",
    deleteInviteConfirm: "删除对{business}的邀请？",
    inviteBreadcrumbParent: "商业伙伴",
    invitePageTitle: "邀请商家",
    invitePageDescription: "并非所有与您合作的商家都已加入名录——可通过电子邮件和 WhatsApp 邀请他们。",
    newBreadcrumbCurrent: "添加商业伙伴",
    newPageTitle: "添加商业伙伴",
    formFromListingLabel: "所属商家",
    formCompanyLabel: "公司",
    formCompanyPlaceholder: "Acme Printing",
    formContactNameLabel: "联系人姓名",
    formContactNamePlaceholder: "Jane Tan",
    formEmailLabel: "电子邮件",
    formEmailPlaceholder: "jane@acme.com",
    formPhoneLabel: "联系电话",
    formPhonePlaceholder: "+60 12 345 6789",
    formSendingInvite: "正在发送邀请…",
    formSendInvite: "发送邀请",
    requestFormYourListingLabel: "您的商家",
    requestFormBusinessLabel: "要连接的商家",
    requestFormSearchPlaceholder: "按公司名称搜索",
    requestFormSearching: "搜索中…",
    requestFormNoMatches: "未找到匹配结果——只能找到已在名录上发布的商家。",
    requestFormSendingRequest: "正在发送请求…",
    requestFormSendRequest: "发送请求",
  },
  ms: {
    pageTitle: "Rakan Perniagaan",
    pageDescription:
      "Berhubung dengan perniagaan lain dalam direktori — setelah diluluskan, setiap satu akan dipaparkan pada halaman senarai awam pihak lain sebagai Rakan Perniagaan.",
    inviteBusinessCta: "Jemput perniagaan",
    addPartnerCta: "Tambah rakan perniagaan",
    linksEmptyTitle: "Belum ada rakan perniagaan.",
    linksEmptyDescription: "Cari perniagaan yang sudah berada dalam direktori untuk memohon berhubung dengan mereka.",
    colYourListing: "Senarai anda",
    colBusiness: "Perniagaan",
    colStatus: "Status",
    colDate: "Tarikh",
    statusConnected: "Berhubung",
    statusDeclined: "Ditolak",
    statusAwaitingApproval: "Menunggu kelulusan anda",
    statusRequestSent: "Permohonan dihantar",
    acceptCta: "Terima",
    declineCta: "Tolak",
    declineConfirm: "Tolak permohonan daripada {business}?",
    removeCta: "Buang",
    cancelCta: "Batal",
    removeConfirm: "Buang {business} sebagai rakan perniagaan? Tindakan ini tidak boleh dibuat asal.",
    cancelRequestConfirm: "Batalkan permohonan ini kepada {business}?",
    invitedBusinessesHeading: "Perniagaan yang dijemput",
    invitesEmptyTitle: "Belum ada jemputan dihantar.",
    invitesEmptyDescription:
      "Tidak semua perniagaan yang anda bekerjasama dengannya berada dalam direktori lagi — jemput mereka melalui e-mel dan WhatsApp.",
    colCompany: "Syarikat",
    colContact: "Orang Hubungan",
    colEmail: "E-mel",
    colPhone: "Telefon",
    colSent: "Dihantar",
    badgeEmail: "E-mel",
    badgeWhatsApp: "WhatsApp",
    badgeNotSent: "Belum dihantar",
    deleteInviteCta: "Padam",
    deleteInviteConfirm: "Padam jemputan kepada {business}?",
    inviteBreadcrumbParent: "Rakan Perniagaan",
    invitePageTitle: "Jemput perniagaan",
    invitePageDescription:
      "Tidak semua perniagaan yang anda bekerjasama dengannya berada dalam direktori lagi — jemput mereka melalui e-mel dan WhatsApp.",
    newBreadcrumbCurrent: "Tambah rakan perniagaan",
    newPageTitle: "Tambah rakan perniagaan",
    formFromListingLabel: "Daripada senarai",
    formCompanyLabel: "Syarikat",
    formCompanyPlaceholder: "Acme Printing",
    formContactNameLabel: "Nama orang hubungan",
    formContactNamePlaceholder: "Jane Tan",
    formEmailLabel: "E-mel",
    formEmailPlaceholder: "jane@acme.com",
    formPhoneLabel: "Nombor telefon",
    formPhonePlaceholder: "+60 12 345 6789",
    formSendingInvite: "Menghantar jemputan…",
    formSendInvite: "Hantar jemputan",
    requestFormYourListingLabel: "Senarai anda",
    requestFormBusinessLabel: "Perniagaan untuk disambungkan",
    requestFormSearchPlaceholder: "Cari mengikut nama syarikat",
    requestFormSearching: "Mencari…",
    requestFormNoMatches: "Tiada padanan — hanya perniagaan yang sudah tersiar dalam direktori boleh ditemui di sini.",
    requestFormSendingRequest: "Menghantar permohonan…",
    requestFormSendRequest: "Hantar permohonan",
  },
};

export function getPortalBusinessPartnersStrings(locale: DirectoryLocale): PortalBusinessPartnersStrings {
  return PORTAL_BUSINESS_PARTNERS_STRINGS[locale];
}
