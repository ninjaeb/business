import type { DirectoryLocale } from "@/lib/directory-i18n";

// Strings for the business-portal's two Testimonials CRM pages — moderating
// submitted reviews (src/app/business-portal/(dashboard)/testimonials/
// page.tsx) and managing shareable "please leave us a testimonial" request
// links (testimonial-links/*, testimonial-request-link-form.tsx,
// copy-link-button.tsx). Follows the same type-then-one-block-per-locale
// shape as DIRECTORY_STRINGS in directory-i18n.ts and PORTAL_CHROME_STRINGS
// in portal-i18n.ts. A "use client" component that needs these imports
// PORTAL_TESTIMONIALS_STRINGS directly (it's plain data) rather than
// receiving the resolved strings as a prop.
export type PortalTestimonialsStrings = {
  // testimonials/page.tsx — moderation.
  moderationStatusPending: string;
  moderationStatusApproved: string;
  moderationStatusRejected: string;
  pageTitle: string;
  pageDescription: string;
  awaitingReviewHeading: string;
  awaitingReviewEmptyTitle: string;
  awaitingReviewEmptyDescription: string;
  approveCta: string;
  rejectNotePlaceholder: string;
  rejectCta: string;
  alreadyReviewedHeading: string;
  yourNotePrefix: string;

  // testimonial-links/page.tsx — the request-link list.
  linksPageTitle: string;
  linksPageDescription: string;
  newRequestCta: string;
  linksEmptyTitle: string;
  linksEmptyDescription: string;
  colListing: string;
  colCustomer: string;
  colService: string;
  colStatus: string;
  colCreated: string;
  colLink: string;
  emptyValuePlaceholder: string;
  usedOnLabel: string;
  statusPendingUse: string;
  editCta: string;
  deleteCta: string;
  deleteConfirm: string;

  // testimonial-links/new/page.tsx
  newBreadcrumbParent: string;
  newBreadcrumbCurrent: string;
  newPageTitle: string;

  // testimonial-links/[id]/edit/page.tsx
  editBreadcrumbCurrent: string;
  editPageTitle: string;
  saveChangesCta: string;
  savingCta: string;

  // testimonial-request-link-form.tsx
  createLinkCta: string;
  creatingCta: string;
  formListingLabel: string;
  formCustomerNameLabel: string;
  formCustomerNamePlaceholder: string;
  formCustomerTitleLabel: string;
  formCustomerTitlePlaceholder: string;
  formCustomerCompanyLabel: string;
  formCustomerCompanyPlaceholder: string;
  formServiceLabel: string;
  formServiceSearchPlaceholder: string;
  formServiceEmptyMessage: string;
  formServiceFreeTextPlaceholder: string;
  formServiceHint: string;
  formNoteLabel: string;
  formNotePlaceholder: string;
  formNoteHint: string;

  // copy-link-button.tsx
  copyLinkCta: string;
  copiedCta: string;
};

export const PORTAL_TESTIMONIALS_STRINGS: Record<DirectoryLocale, PortalTestimonialsStrings> = {
  en: {
    moderationStatusPending: "Pending",
    moderationStatusApproved: "Approved",
    moderationStatusRejected: "Rejected",
    pageTitle: "Testimonials",
    pageDescription: "Reviews visitors have written about your business — approve the ones you want shown publicly.",
    awaitingReviewHeading: "Awaiting your review",
    awaitingReviewEmptyTitle: "Nothing waiting on review",
    awaitingReviewEmptyDescription: "New testimonials will show up here.",
    approveCta: "Approve",
    rejectNotePlaceholder: "What needs to change?",
    rejectCta: "Reject",
    alreadyReviewedHeading: "Already reviewed",
    yourNotePrefix: "Your note:",
    linksPageTitle: "Request Testimonial",
    linksPageDescription:
      "Create a unique link to send a specific customer — no account needed on their end. It opens straight to a testimonial form, prefilled with whatever you already know about them.",
    newRequestCta: "New Testimonial Request",
    linksEmptyTitle: "No testimonial requests yet.",
    linksEmptyDescription:
      "Create one to send a customer straight to your testimonial form — tag it with what you did for them so the review has context.",
    colListing: "Listing",
    colCustomer: "Customer",
    colService: "Service",
    colStatus: "Status",
    colCreated: "Created",
    colLink: "Link",
    emptyValuePlaceholder: "—",
    usedOnLabel: "Used {date}",
    statusPendingUse: "Pending",
    editCta: "Edit",
    deleteCta: "Delete",
    deleteConfirm: "Delete this testimonial request? This can't be undone.",
    newBreadcrumbParent: "Request Testimonial",
    newBreadcrumbCurrent: "New request",
    newPageTitle: "New Testimonial Request",
    editBreadcrumbCurrent: "Edit",
    editPageTitle: "Edit Testimonial Request",
    saveChangesCta: "Save changes",
    savingCta: "Saving…",
    createLinkCta: "Create link",
    creatingCta: "Creating…",
    formListingLabel: "Listing",
    formCustomerNameLabel: "Customer name",
    formCustomerNamePlaceholder: "e.g. Sarah Tan",
    formCustomerTitleLabel: "Customer title",
    formCustomerTitlePlaceholder: "e.g. Marketing Director",
    formCustomerCompanyLabel: "Customer company",
    formCustomerCompanyPlaceholder: "e.g. Acme Sdn Bhd",
    formServiceLabel: "Product or service provided",
    formServiceSearchPlaceholder: "Search this listing's services…",
    formServiceEmptyMessage: "No matching services",
    formServiceFreeTextPlaceholder: "e.g. Logo design package",
    formServiceHint:
      "Shown to the customer on the form, so they know what they're reviewing. Select more than one if several applied — leave blank for a general review.",
    formNoteLabel: "Note (for you only)",
    formNotePlaceholder: "e.g. Logo project — Mar 2026",
    formNoteHint: "Never shown to the customer — just helps you tell your own links apart.",
    copyLinkCta: "Copy link",
    copiedCta: "Copied",
  },
  zh: {
    moderationStatusPending: "待审核",
    moderationStatusApproved: "已批准",
    moderationStatusRejected: "已拒绝",
    pageTitle: "客户评价",
    pageDescription: "访客为您的企业撰写的评价——批准您希望公开展示的评价。",
    awaitingReviewHeading: "待您审核",
    awaitingReviewEmptyTitle: "暂无待审核的评价",
    awaitingReviewEmptyDescription: "新的评价会显示在这里。",
    approveCta: "批准",
    rejectNotePlaceholder: "需要修改什么？",
    rejectCta: "拒绝",
    alreadyReviewedHeading: "已处理",
    yourNotePrefix: "您的备注：",
    linksPageTitle: "请求评价",
    linksPageDescription:
      "创建专属链接发送给特定客户——对方无需注册账户，点击后会直接打开评价表单，并预先填入您已掌握的信息。",
    newRequestCta: "新建评价请求",
    linksEmptyTitle: "暂时还没有评价请求。",
    linksEmptyDescription: "创建一个链接，让客户直接前往您的评价表单——标注您为他们提供的服务，让评价更有针对性。",
    colListing: "商家",
    colCustomer: "客户",
    colService: "服务",
    colStatus: "状态",
    colCreated: "创建时间",
    colLink: "链接",
    emptyValuePlaceholder: "—",
    usedOnLabel: "已于 {date} 使用",
    statusPendingUse: "待使用",
    editCta: "编辑",
    deleteCta: "删除",
    deleteConfirm: "删除此评价请求？此操作无法撤销。",
    newBreadcrumbParent: "请求评价",
    newBreadcrumbCurrent: "新建请求",
    newPageTitle: "新建评价请求",
    editBreadcrumbCurrent: "编辑",
    editPageTitle: "编辑评价请求",
    saveChangesCta: "保存更改",
    savingCta: "正在保存…",
    createLinkCta: "创建链接",
    creatingCta: "正在创建…",
    formListingLabel: "商家",
    formCustomerNameLabel: "客户姓名",
    formCustomerNamePlaceholder: "例如：Sarah Tan",
    formCustomerTitleLabel: "客户职位",
    formCustomerTitlePlaceholder: "例如：市场总监",
    formCustomerCompanyLabel: "客户公司",
    formCustomerCompanyPlaceholder: "例如：Acme Sdn Bhd",
    formServiceLabel: "提供的产品或服务",
    formServiceSearchPlaceholder: "搜索该商家的服务…",
    formServiceEmptyMessage: "没有匹配的服务",
    formServiceFreeTextPlaceholder: "例如：标志设计套餐",
    formServiceHint: "会显示给客户，让他们了解自己评价的内容。如涉及多项服务可多选——若为一般性评价则留空。",
    formNoteLabel: "备注（仅供您查看）",
    formNotePlaceholder: "例如：标志设计项目——2026年3月",
    formNoteHint: "客户不会看到此备注——仅用于帮助您区分自己的链接。",
    copyLinkCta: "复制链接",
    copiedCta: "已复制",
  },
  ms: {
    moderationStatusPending: "Belum Disemak",
    moderationStatusApproved: "Diluluskan",
    moderationStatusRejected: "Ditolak",
    pageTitle: "Testimoni",
    pageDescription: "Ulasan yang ditulis oleh pelawat tentang perniagaan anda — luluskan yang anda mahu dipaparkan secara awam.",
    awaitingReviewHeading: "Menunggu semakan anda",
    awaitingReviewEmptyTitle: "Tiada apa-apa menunggu semakan",
    awaitingReviewEmptyDescription: "Testimoni baharu akan dipaparkan di sini.",
    approveCta: "Luluskan",
    rejectNotePlaceholder: "Apa yang perlu diubah?",
    rejectCta: "Tolak",
    alreadyReviewedHeading: "Sudah disemak",
    yourNotePrefix: "Nota anda:",
    linksPageTitle: "Minta Testimoni",
    linksPageDescription:
      "Cipta pautan unik untuk dihantar kepada pelanggan tertentu — tanpa perlu akaun di pihak mereka. Ia terus membuka borang testimoni, telah diisi awal dengan apa sahaja yang anda sudah tahu tentang mereka.",
    newRequestCta: "Permintaan Testimoni Baharu",
    linksEmptyTitle: "Belum ada permintaan testimoni.",
    linksEmptyDescription:
      "Cipta satu untuk menghantar pelanggan terus ke borang testimoni anda — tandakan apa yang anda lakukan untuk mereka supaya ulasan itu mempunyai konteks.",
    colListing: "Senarai",
    colCustomer: "Pelanggan",
    colService: "Perkhidmatan",
    colStatus: "Status",
    colCreated: "Dicipta",
    colLink: "Pautan",
    emptyValuePlaceholder: "—",
    usedOnLabel: "Digunakan {date}",
    statusPendingUse: "Belum Digunakan",
    editCta: "Sunting",
    deleteCta: "Padam",
    deleteConfirm: "Padam permintaan testimoni ini? Tindakan ini tidak boleh dibuat asal.",
    newBreadcrumbParent: "Minta Testimoni",
    newBreadcrumbCurrent: "Permintaan baharu",
    newPageTitle: "Permintaan Testimoni Baharu",
    editBreadcrumbCurrent: "Sunting",
    editPageTitle: "Sunting Permintaan Testimoni",
    saveChangesCta: "Simpan perubahan",
    savingCta: "Menyimpan…",
    createLinkCta: "Cipta pautan",
    creatingCta: "Mencipta…",
    formListingLabel: "Senarai",
    formCustomerNameLabel: "Nama pelanggan",
    formCustomerNamePlaceholder: "cth. Sarah Tan",
    formCustomerTitleLabel: "Jawatan pelanggan",
    formCustomerTitlePlaceholder: "cth. Pengarah Pemasaran",
    formCustomerCompanyLabel: "Syarikat pelanggan",
    formCustomerCompanyPlaceholder: "cth. Acme Sdn Bhd",
    formServiceLabel: "Produk atau perkhidmatan yang diberikan",
    formServiceSearchPlaceholder: "Cari perkhidmatan senarai ini…",
    formServiceEmptyMessage: "Tiada perkhidmatan sepadan",
    formServiceFreeTextPlaceholder: "cth. Pakej reka bentuk logo",
    formServiceHint:
      "Dipaparkan kepada pelanggan pada borang, supaya mereka tahu apa yang sedang diulas. Pilih lebih daripada satu jika beberapa perkhidmatan terlibat — biarkan kosong untuk ulasan umum.",
    formNoteLabel: "Nota (untuk anda sahaja)",
    formNotePlaceholder: "cth. Projek logo — Mac 2026",
    formNoteHint: "Tidak akan dipaparkan kepada pelanggan — hanya membantu anda membezakan pautan anda sendiri.",
    copyLinkCta: "Salin pautan",
    copiedCta: "Disalin",
  },
};

export function getPortalTestimonialsStrings(locale: DirectoryLocale): PortalTestimonialsStrings {
  return PORTAL_TESTIMONIALS_STRINGS[locale];
}
