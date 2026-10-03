import type { DirectoryLocale } from "@/lib/directory-i18n";

// My Business Listings — the biggest module in the partner portal. Split
// across two topic-scoped blocks in this one file (the index/detail-header/
// grid chrome around the editor, then the editor form itself, since the
// form alone has well over a hundred strings), following the same
// type-then-one-block-per-locale shape as DIRECTORY_STRINGS in
// directory-i18n.ts. The AI Auto Create panel, address search, logo crop,
// and slug sub-forms each get their own block in the sibling
// portal-listing-dialogs-i18n.ts instead, since they're independently
// reusable pieces rather than part of this page's own copy.
//
// Listing-status badge text (DRAFT/PENDING_REVIEW/PUBLISHED/REJECTED) is
// deliberately NOT duplicated here — see
// PARTNER_LISTING_STATUS_LABELS_BY_LOCALE in directory-i18n.ts, already
// built for exactly this.

// src/app/business-portal/(dashboard)/listings/page.tsx (the index of a
// partner's own listings) and .../listings/[id]/page.tsx (one listing's own
// editor page header/status card) share this block — both are the same
// flow, and a couple of labels (e.g. "My Business") are the same string in
// both places. my-business-listings-grid.tsx — the card grid itself —
// draws from it too, for the same reason.
export type PortalListingsStrings = {
  // The index page's own PageHeader title, reused as the editor page's
  // breadcrumb label pointing back to it.
  myBusiness: string;
  listingsPageDescription: string;
  newBusiness: string;
  emptyTitle: string;
  emptyDescription: string;
  // The editor page's own PageHeader description and status card.
  editorDescription: string;
  adminFeedbackLabel: string;
  notLiveYet: string;
  // Shared between the editor page's status card and each grid card.
  viewPublicListing: string;
  // my-business-listings-grid.tsx
  clear: string;
  linking: string;
  linkAsBranches: string;
  alreadyLinked: string;
  edit: string;
  deleteLabel: string;
  newsAndPromotionsLink: string;
};

export const PORTAL_LISTINGS_STRINGS: Record<DirectoryLocale, PortalListingsStrings> = {
  en: {
    myBusiness: "My Business",
    listingsPageDescription: "Every business you have on the partner directory.",
    newBusiness: "New Business",
    emptyTitle: "No listings yet",
    emptyDescription: "Create your first listing to get your business on the public directory.",
    editorDescription: "What visitors see on the business directory, and the form they use to reach you.",
    adminFeedbackLabel: "Admin feedback: ",
    notLiveYet: "Not live yet — save your details below and submit for review.",
    viewPublicListing: "View public listing",
    clear: "Clear",
    linking: "Linking…",
    linkAsBranches: "Link as branches",
    alreadyLinked: "Those listings are already linked as branches of each other.",
    edit: "Edit",
    deleteLabel: "Delete",
    newsAndPromotionsLink: "News & Promotions",
  },
  zh: {
    myBusiness: "我的商家",
    listingsPageDescription: "您在商业名录中的所有商家。",
    newBusiness: "新建商家",
    emptyTitle: "暂无商家列表",
    emptyDescription: "创建您的第一个商家列表，让您的企业出现在公开名录中。",
    editorDescription: "访客在商业名录中看到的内容，以及他们用来联系您的表单。",
    adminFeedbackLabel: "管理员反馈：",
    notLiveYet: "尚未上线——请在下方保存资料并提交审核。",
    viewPublicListing: "查看公开页面",
    clear: "清除",
    linking: "正在关联…",
    linkAsBranches: "关联为分店",
    alreadyLinked: "这些列表已经互相关联为分店。",
    edit: "编辑",
    deleteLabel: "删除",
    newsAndPromotionsLink: "新闻与促销",
  },
  ms: {
    myBusiness: "Perniagaan Saya",
    listingsPageDescription: "Semua perniagaan anda di dalam direktori perniagaan.",
    newBusiness: "Perniagaan Baharu",
    emptyTitle: "Belum ada senarai",
    emptyDescription: "Cipta senarai pertama anda untuk memaparkan perniagaan anda di direktori awam.",
    editorDescription: "Apa yang dilihat oleh pelawat di direktori perniagaan, dan borang yang mereka gunakan untuk menghubungi anda.",
    adminFeedbackLabel: "Maklum balas admin: ",
    notLiveYet: "Belum lagi disiarkan — simpan butiran anda di bawah dan hantar untuk semakan.",
    viewPublicListing: "Lihat senarai awam",
    clear: "Kosongkan",
    linking: "Menghubungkan…",
    linkAsBranches: "Hubungkan sebagai cawangan",
    alreadyLinked: "Senarai tersebut sudah dihubungkan sebagai cawangan antara satu sama lain.",
    edit: "Edit",
    deleteLabel: "Padam",
    newsAndPromotionsLink: "Berita & Promosi",
  },
};

// The selection bar's own counter (my-business-listings-grid.tsx) — plural-
// aware in English, so kept as a function rather than a plain
// PortalListingsStrings template, same reasoning as formatViewsLabel in
// directory-i18n.ts.
export function formatSelectedCount(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `已选择 ${count} 项`;
  if (locale === "ms") return `${count} dipilih`;
  return `${count} selected`;
}

// bulkLinkListingsAsBranches's own success toast.
export function formatLinkedSuccess(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `已将 ${count} 个列表互相关联为分店。`;
  if (locale === "ms") return `${count} senarai telah dihubungkan sebagai cawangan antara satu sama lain.`;
  return `Linked ${count} listings as branches of each other.`;
}

// Each card's sr-only checkbox label.
export function formatSelectListingAriaLabel(companyName: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `选择${companyName}`;
  if (locale === "ms") return `Pilih ${companyName}`;
  return `Select ${companyName}`;
}

// deleteListingAction's confirm prompt, for a listing that's already live.
export function formatDeleteConfirmPublic(companyName: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `删除「${companyName}」？其公开页面将立即下线，且此操作无法撤销。`;
  if (locale === "ms") return `Padam "${companyName}"? Halaman awamnya akan terus diturunkan dan ini tidak boleh dibuat asal.`;
  return `Delete "${companyName}"? Its public page comes down immediately and this can't be undone.`;
}

// Same, for a listing that's still only a draft.
export function formatDeleteConfirmDraft(companyName: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `删除草稿「${companyName}」？此操作无法撤销。`;
  if (locale === "ms") return `Padam draf "${companyName}"? Ini tidak boleh dibuat asal.`;
  return `Delete the draft "${companyName}"? This can't be undone.`;
}

// The full listing editor (src/components/directory/partner-listing-form.tsx)
// — basic info, products & services, FAQ, news & promotions, and
// photos/videos, each with their own per-language tab hint where the
// section has translatable fields.
export type PortalListingFormStrings = {
  // Section tabs (business details / products & services / FAQ / news &
  // promotions / photos and videos).
  sectionDetails: string;
  sectionServices: string;
  sectionFaq: string;
  sectionUpdates: string;
  sectionMedia: string;

  // Shared "Translate with AI" trigger, rendered once per section that has
  // per-language fields.
  translateWithAi: string;
  translating: string;

  // The Public URL / Search & social preview box, beside AI Auto Create.
  publicUrlHeading: string;
  searchSocialPreviewLabel: string;
  generateWithAi: string;
  generating: string;
  seoTitleLabel: string;
  // {company} token — see formatSeoTitlePlaceholder below.
  seoTitlePlaceholderTemplate: string;
  seoTitlePlaceholderFallback: string;
  seoDescriptionLabel: string;
  seoDescriptionPlaceholder: string;
  seoHelpText: string;
  shareWonValueLabel: string;
  shareWonValueHelp: string;

  // Logo.
  logoLabel: string;
  logoHelpText: string;
  removeLogoLabel: string;

  // Business Details tab.
  detailsTabHint: string;
  companyNameLabel: string;
  taglineLabel: string;
  taglinePlaceholder: string;
  websiteLabel: string;
  websitePlaceholder: string;
  industryLabel: string;
  industryNotSet: string;
  categoriesLabel: string;
  noCategoriesYet: string;
  categoriesSearchPlaceholder: string;
  categoriesEmptyMessage: string;
  categoriesHelpText: string;
  addressLabel: string;
  addressPlaceholder: string;
  addressHelpText: string;
  cityLabel: string;
  cityPlaceholder: string;
  stateLabel: string;
  statePlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  branchesLabel: string;
  noOtherListings: string;
  branchesSearchPlaceholder: string;
  branchesEmptyMessage: string;
  branchesHelpText: string;
  phoneLabel: string;
  phoneHelpText: string;
  phonePlaceholder: string;
  whatsAppLabel: string;
  whatsAppHelpText: string;
  googleReviewLabel: string;
  googleReviewPlaceholder: string;
  googleReviewHelpText: string;
  aboutLabel: string;
  rewriteWithAi: string;
  rewriting: string;
  aboutPlaceholder: string;
  // Split around the embedded <strong> in the help text below the About
  // editor — see partner-listing-form.tsx's own JSX.
  aboutHelpTextPrefix: string;
  aboutHelpTextBoldWord: string;
  aboutHelpTextSuffix: string;
  hoursLabel: string;
  hoursHelpText: string;

  // Products & Services tab.
  servicesTabHint: string;
  servicesLabel: string;
  servicesHelpText: string;

  // FAQ tab.
  faqTabHint: string;
  faqLabel: string;
  faqHelpText: string;

  // News & Promotions tab.
  updatesIntro: string;
  googleBusinessProfileLabel: string;
  googleBusinessProfilePlaceholder: string;
  googleBusinessProfileHelpText: string;
  updatesTabHint: string;

  // Photos and Videos tab.
  photosHeading: string;
  photosHelpText: string;
  videosHeading: string;
  videosHelpText: string;

  // Save/submit bar and its toasts.
  saving: string;
  saved: string;
  saveDraft: string;
  submitting: string;
  awaitingReview: string;
  submitForReview: string;
  draftSaved: string;
  publishedToast: string;
  submittedToast: string;
};

export const PORTAL_LISTING_FORM_STRINGS: Record<DirectoryLocale, PortalListingFormStrings> = {
  en: {
    sectionDetails: "Business Details",
    sectionServices: "Products & Services",
    sectionFaq: "FAQ",
    sectionUpdates: "News & Promotions",
    sectionMedia: "Photos and Videos",

    translateWithAi: "Translate with AI",
    translating: "Translating…",

    publicUrlHeading: "Public URL",
    searchSocialPreviewLabel: "Search & social preview",
    generateWithAi: "Generate with AI",
    generating: "Generating…",
    seoTitleLabel: "SEO title",
    seoTitlePlaceholderTemplate: "{company} | Business Directory",
    seoTitlePlaceholderFallback: "Your company",
    seoDescriptionLabel: "SEO description",
    seoDescriptionPlaceholder: "Shown in search results and when your link is shared — one or two sentences.",
    seoHelpText: "Optional — leave blank to use your tagline and About text automatically.",
    shareWonValueLabel: "Let people who refer you leads see how much those deals are worth",
    shareWonValueHelp: "Off by default — a deal's value is otherwise only ever shown on your own Dashboard.",

    logoLabel: "Logo",
    logoHelpText: "JPEG, PNG, WebP, or GIF, under 3MB — crop, zoom, and rotate it before it's saved.",
    removeLogoLabel: "Remove current logo",

    detailsTabHint:
      "Tagline and About are per-language — switch tabs to edit each, or use Translate with AI to fill in Chinese and Malay from your English content. Everything else on this tab (company name, industry, categories, hours, and more) applies to all languages.",
    companyNameLabel: "Company name",
    taglineLabel: "Tagline",
    taglinePlaceholder: "One line under your company name",
    websiteLabel: "Website",
    websitePlaceholder: "acme.com",
    industryLabel: "Industry",
    industryNotSet: "Not set",
    categoriesLabel: "Business categories",
    noCategoriesYet: "No categories yet.",
    categoriesSearchPlaceholder: "Search categories…",
    categoriesEmptyMessage: "No matching categories",
    categoriesHelpText: "Optional — helps visitors filter the directory by what you do.",
    addressLabel: "Address",
    addressPlaceholder: "123 Jalan Bukit Bintang\n50200 Kuala Lumpur, Malaysia",
    addressHelpText: "Shown on your listing with a map. Leave blank to skip the map.",
    cityLabel: "City",
    cityPlaceholder: "Kuala Lumpur",
    stateLabel: "State / province",
    statePlaceholder: "Selangor",
    countryLabel: "Country",
    countryPlaceholder: "Malaysia",
    branchesLabel: "Linked branches",
    noOtherListings: "No other listings on your account yet — add another location's listing first, then link it here.",
    branchesSearchPlaceholder: "Search your other listings…",
    branchesEmptyMessage: "No matching listings",
    branchesHelpText:
      "Other locations of this same business — shown as a linked list on this listing's Visit us page once they're published, and vice versa. Linking works both ways, so you only need to set it up on one side.",
    phoneLabel: "Contact number",
    phoneHelpText: "Shown on your listing as a Call button. Include the country code with a + sign. Leave blank to hide it.",
    phonePlaceholder: "+60 12 345 6789",
    whatsAppLabel: "WhatsApp number",
    whatsAppHelpText:
      "Shown on your listing as a WhatsApp button, for calls and messages. Can be different from your Contact number. Leave blank to hide it.",
    googleReviewLabel: "Google review link",
    googleReviewPlaceholder: "https://search.google.com/local/writereview?placeid=...",
    googleReviewHelpText:
      'Filled in automatically when you pick your business on Google Maps above (Step 1) or in the address search below. Shown on your Testimonials page as a "Leave it on Google too" button after a visitor writes you one — or paste your own short review link here (Google Business Profile > Get more reviews > Share review form).',
    aboutLabel: "About",
    rewriteWithAi: "Rewrite with AI",
    rewriting: "Rewriting…",
    aboutPlaceholder: "What does your business do?",
    aboutHelpTextPrefix: "Select text and use the toolbar for ",
    aboutHelpTextBoldWord: "bold",
    aboutHelpTextSuffix: ", lists, links, and images — or switch to Preview to see how it'll look.",
    hoursLabel: "Operating hours",
    hoursHelpText: "Shown on your listing exactly as set here.",

    servicesTabHint:
      "Products & services are per-language — switch tabs to edit each, or use Translate with AI to fill in Chinese and Malay from your English content.",
    servicesLabel: "Products & services",
    servicesHelpText:
      "A title, an optional description, and an optional price for each — shown on your listing. At least one is required (in English) before you can submit for review.",

    faqTabHint:
      "FAQ is per-language — switch tabs to edit each, or use Translate with AI to fill in Chinese and Malay from your English content.",
    faqLabel: "FAQ",
    faqHelpText: "Optional — shown on your listing as a Q&A section, and helps your page surface in AI search answers.",

    updatesIntro:
      "Optional — shown on your listing in a News & Promotions section. A promotion disappears on its own once its end date passes.",
    googleBusinessProfileLabel: "Google Business Profile link",
    googleBusinessProfilePlaceholder: "https://g.page/r/...",
    googleBusinessProfileHelpText:
      'Optional — open your Google Business Profile, tap Share, and paste the link here. Each post below then gets a "Post to Google" button that copies it and opens your profile to paste it in.',
    updatesTabHint:
      "Posts are per-language — switch tabs to edit each, or use Translate with AI to fill in Chinese and Malay from your English posts. Kind, post date, and end date always come from the English post and aren't set separately per language.",

    photosHeading: "Photos",
    photosHelpText:
      'Up to 12 — group photos into an album (e.g. "Team Building 2026") and they\'ll show as an album on your public page. Added right away, but only shown publicly once you save and the listing is (re)approved, same as everything else here.',
    videosHeading: "Videos",
    videosHelpText:
      "Up to 12 — YouTube, Vimeo, Dailymotion, Facebook, or TikTok links, each with a title and category. Optimized for search and AI answer engines.",

    saving: "Saving…",
    saved: "Saved",
    saveDraft: "Save draft",
    submitting: "Submitting…",
    awaitingReview: "Awaiting review",
    submitForReview: "Submit for review",
    draftSaved: "Draft saved.",
    publishedToast: "Published — your listing is now live.",
    submittedToast: "Submitted — an admin will review it shortly.",
  },
  zh: {
    sectionDetails: "商家详情",
    sectionServices: "产品与服务",
    sectionFaq: "常见问题",
    sectionUpdates: "新闻与促销",
    sectionMedia: "照片与视频",

    translateWithAi: "AI 翻译",
    translating: "翻译中…",

    publicUrlHeading: "公开网址",
    searchSocialPreviewLabel: "搜索与社交预览",
    generateWithAi: "AI 生成",
    generating: "生成中…",
    seoTitleLabel: "SEO 标题",
    seoTitlePlaceholderTemplate: "{company} | 商业名录",
    seoTitlePlaceholderFallback: "您的企业",
    seoDescriptionLabel: "SEO 描述",
    seoDescriptionPlaceholder: "显示于搜索结果及分享链接时——一到两句话即可。",
    seoHelpText: "选填——留空将自动使用您的标语和「关于」内容。",
    shareWonValueLabel: "让为您介绍线索的人看到这些成交的价值",
    shareWonValueHelp: "默认关闭——否则成交价值只会显示在您自己的仪表板上。",

    logoLabel: "商标",
    logoHelpText: "支持 JPEG、PNG、WebP 或 GIF 格式，3MB 以内——保存前可裁剪、缩放及旋转。",
    removeLogoLabel: "移除当前商标",

    detailsTabHint:
      "标语和「关于」为分语言内容——切换标签即可分别编辑，或使用 AI 翻译自动将英文内容译成中文和马来文。此标签页中的其他内容（公司名称、行业、分类、营业时间等）适用于所有语言。",
    companyNameLabel: "公司名称",
    taglineLabel: "标语",
    taglinePlaceholder: "公司名称下方的一句话",
    websiteLabel: "网站",
    websitePlaceholder: "acme.com",
    industryLabel: "行业",
    industryNotSet: "未设置",
    categoriesLabel: "商家分类",
    noCategoriesYet: "暂无分类。",
    categoriesSearchPlaceholder: "搜索分类…",
    categoriesEmptyMessage: "没有匹配的分类",
    categoriesHelpText: "选填——便于访客按业务类型筛选名录。",
    addressLabel: "地址",
    addressPlaceholder: "123 Jalan Bukit Bintang\n50200 Kuala Lumpur, Malaysia",
    addressHelpText: "将随地图显示在您的列表中。留空则不显示地图。",
    cityLabel: "城市",
    cityPlaceholder: "Kuala Lumpur",
    stateLabel: "州/省",
    statePlaceholder: "Selangor",
    countryLabel: "国家",
    countryPlaceholder: "马来西亚",
    branchesLabel: "关联分店",
    noOtherListings: "您的账户下暂无其他列表——请先添加另一个地点的列表，再在此处关联。",
    branchesSearchPlaceholder: "搜索您的其他列表…",
    branchesEmptyMessage: "没有匹配的列表",
    branchesHelpText:
      "同一商家的其他地点——一经发布，将以关联列表的形式显示在该列表的「联系地址」页面上，反之亦然。关联是双向的，只需在其中一方设置即可。",
    phoneLabel: "联系电话",
    phoneHelpText: "将以「致电」按钮显示在您的列表中。请附上带 + 号的国家代码。留空则不显示。",
    phonePlaceholder: "+60 12 345 6789",
    whatsAppLabel: "WhatsApp 号码",
    whatsAppHelpText: "将以 WhatsApp 按钮显示在您的列表中，用于通话和留言，可与联系电话不同。留空则不显示。",
    googleReviewLabel: "Google 评价链接",
    googleReviewPlaceholder: "https://search.google.com/local/writereview?placeid=...",
    googleReviewHelpText:
      "当您在上方 Google 地图（步骤 1）或下方地址搜索中选择您的商家时，将自动填入。访客撰写评价后，您的「客户评价」页面上会显示「同时在 Google 发表」按钮——您也可以在此粘贴自己的简短评价链接（Google 商家资料 > 获取更多评价 > 分享评价表单）。",
    aboutLabel: "关于",
    rewriteWithAi: "AI 改写",
    rewriting: "改写中…",
    aboutPlaceholder: "您的企业是做什么的？",
    aboutHelpTextPrefix: "选中文字后使用工具栏设置",
    aboutHelpTextBoldWord: "粗体",
    aboutHelpTextSuffix: "、列表、链接和图片——或切换到预览查看显示效果。",
    hoursLabel: "营业时间",
    hoursHelpText: "将按此处设置原样显示在您的列表中。",

    servicesTabHint: "产品与服务为分语言内容——切换标签即可分别编辑，或使用 AI 翻译自动将英文内容译成中文和马来文。",
    servicesLabel: "产品与服务",
    servicesHelpText: "每项包含标题、选填描述及选填价格——将显示在您的列表中。提交审核前至少需填写一项（英文）。",

    faqTabHint: "常见问题为分语言内容——切换标签即可分别编辑，或使用 AI 翻译自动将英文内容译成中文和马来文。",
    faqLabel: "常见问题",
    faqHelpText: "选填——将以问答形式显示在您的列表中，并有助于您的页面出现在 AI 搜索答案中。",

    updatesIntro: "选填——将显示在您列表的「新闻与促销」版块中。促销一旦过期将自动消失。",
    googleBusinessProfileLabel: "Google 商家资料链接",
    googleBusinessProfilePlaceholder: "https://g.page/r/...",
    googleBusinessProfileHelpText:
      "选填——打开您的 Google 商家资料，点击「分享」，并将链接粘贴于此。此后下方每条帖子都会出现「发布到 Google」按钮，点击即可复制内容并打开您的商家资料以供粘贴。",
    updatesTabHint:
      "帖子为分语言内容——切换标签即可分别编辑，或使用 AI 翻译自动将英文帖子译成中文和马来文。类型、发布日期及结束日期始终以英文帖子为准，不会按语言单独设置。",

    photosHeading: "照片",
    photosHelpText:
      "最多 12 张——将照片归入相册（例如「2026 团建活动」），即可在公开页面上以相册形式展示。上传后立即生效，但仅在您保存并且列表（重新）获批后才会公开显示，与此处其他内容相同。",
    videosHeading: "视频",
    videosHelpText:
      "最多 12 个——支持 YouTube、Vimeo、Dailymotion、Facebook 或 TikTok 链接，每个均可设置标题和分类。已针对搜索引擎和 AI 问答引擎进行优化。",

    saving: "保存中…",
    saved: "已保存",
    saveDraft: "保存草稿",
    submitting: "提交中…",
    awaitingReview: "审核中",
    submitForReview: "提交审核",
    draftSaved: "草稿已保存。",
    publishedToast: "已发布——您的列表现已上线。",
    submittedToast: "已提交——管理员将尽快审核。",
  },
  ms: {
    sectionDetails: "Butiran Perniagaan",
    sectionServices: "Produk & Perkhidmatan",
    sectionFaq: "Soalan Lazim",
    sectionUpdates: "Berita & Promosi",
    sectionMedia: "Foto dan Video",

    translateWithAi: "Terjemah dengan AI",
    translating: "Menterjemah…",

    publicUrlHeading: "URL Awam",
    searchSocialPreviewLabel: "Pratonton Carian & Media Sosial",
    generateWithAi: "Jana dengan AI",
    generating: "Menjana…",
    seoTitleLabel: "Tajuk SEO",
    seoTitlePlaceholderTemplate: "{company} | Direktori Perniagaan",
    seoTitlePlaceholderFallback: "Syarikat anda",
    seoDescriptionLabel: "Penerangan SEO",
    seoDescriptionPlaceholder: "Dipaparkan dalam hasil carian dan apabila pautan anda dikongsi — satu atau dua ayat.",
    seoHelpText: "Pilihan — biarkan kosong untuk menggunakan slogan dan teks Tentang anda secara automatik.",
    shareWonValueLabel: "Benarkan orang yang merujuk petunjuk kepada anda melihat nilai urus niaga tersebut",
    shareWonValueHelp: "Dimatikan secara lalai — jika tidak, nilai urus niaga hanya dipaparkan pada Papan Pemuka anda sendiri.",

    logoLabel: "Logo",
    logoHelpText: "JPEG, PNG, WebP atau GIF, bawah 3MB — pangkas, zum dan putar sebelum disimpan.",
    removeLogoLabel: "Buang logo semasa",

    detailsTabHint:
      "Slogan dan Tentang adalah mengikut bahasa — tukar tab untuk mengedit setiap satu, atau gunakan Terjemah dengan AI untuk mengisi bahasa Cina dan Melayu daripada kandungan Inggeris anda. Semua perkara lain pada tab ini (nama syarikat, industri, kategori, waktu operasi, dan lain-lain) digunakan untuk semua bahasa.",
    companyNameLabel: "Nama syarikat",
    taglineLabel: "Slogan",
    taglinePlaceholder: "Satu ayat di bawah nama syarikat anda",
    websiteLabel: "Laman web",
    websitePlaceholder: "acme.com",
    industryLabel: "Industri",
    industryNotSet: "Belum ditetapkan",
    categoriesLabel: "Kategori perniagaan",
    noCategoriesYet: "Belum ada kategori.",
    categoriesSearchPlaceholder: "Cari kategori…",
    categoriesEmptyMessage: "Tiada kategori yang sepadan",
    categoriesHelpText: "Pilihan — membantu pelawat menyaring direktori mengikut bidang perniagaan anda.",
    addressLabel: "Alamat",
    addressPlaceholder: "123 Jalan Bukit Bintang\n50200 Kuala Lumpur, Malaysia",
    addressHelpText: "Dipaparkan pada senarai anda bersama peta. Biarkan kosong untuk melangkau peta.",
    cityLabel: "Bandar",
    cityPlaceholder: "Kuala Lumpur",
    stateLabel: "Negeri",
    statePlaceholder: "Selangor",
    countryLabel: "Negara",
    countryPlaceholder: "Malaysia",
    branchesLabel: "Cawangan terhubung",
    noOtherListings: "Belum ada senarai lain dalam akaun anda — tambah senarai lokasi lain dahulu, kemudian hubungkannya di sini.",
    branchesSearchPlaceholder: "Cari senarai lain anda…",
    branchesEmptyMessage: "Tiada senarai yang sepadan",
    branchesHelpText:
      "Lokasi lain bagi perniagaan yang sama ini — dipaparkan sebagai senarai terhubung pada halaman Lawati Kami senarai ini sebaik sahaja diterbitkan, dan begitu juga sebaliknya. Pautan ini berfungsi dua hala, jadi anda hanya perlu menetapkannya pada satu pihak sahaja.",
    phoneLabel: "Nombor hubungan",
    phoneHelpText: "Dipaparkan pada senarai anda sebagai butang Hubungi. Sertakan kod negara dengan tanda +. Biarkan kosong untuk menyembunyikannya.",
    phonePlaceholder: "+60 12 345 6789",
    whatsAppLabel: "Nombor WhatsApp",
    whatsAppHelpText:
      "Dipaparkan pada senarai anda sebagai butang WhatsApp, untuk panggilan dan mesej. Boleh berbeza daripada Nombor hubungan anda. Biarkan kosong untuk menyembunyikannya.",
    googleReviewLabel: "Pautan ulasan Google",
    googleReviewPlaceholder: "https://search.google.com/local/writereview?placeid=...",
    googleReviewHelpText:
      'Diisi secara automatik apabila anda memilih perniagaan anda di Google Maps di atas (Langkah 1) atau dalam carian alamat di bawah. Dipaparkan pada halaman Testimoni anda sebagai butang "Tinggalkan di Google juga" selepas pelawat menulis satu untuk anda — atau tampal pautan ulasan ringkas anda sendiri di sini (Profil Perniagaan Google > Dapatkan Lebih Ramai Ulasan > Kongsi Borang Ulasan).',
    aboutLabel: "Tentang",
    rewriteWithAi: "Tulis semula dengan AI",
    rewriting: "Menulis semula…",
    aboutPlaceholder: "Apakah yang dilakukan oleh perniagaan anda?",
    aboutHelpTextPrefix: "Pilih teks dan gunakan bar alat untuk ",
    aboutHelpTextBoldWord: "tebal",
    aboutHelpTextSuffix: ", senarai, pautan dan imej — atau tukar ke Pratonton untuk melihat rupanya.",
    hoursLabel: "Waktu operasi",
    hoursHelpText: "Dipaparkan pada senarai anda tepat seperti yang ditetapkan di sini.",

    servicesTabHint:
      "Produk & perkhidmatan adalah mengikut bahasa — tukar tab untuk mengedit setiap satu, atau gunakan Terjemah dengan AI untuk mengisi bahasa Cina dan Melayu daripada kandungan Inggeris anda.",
    servicesLabel: "Produk & perkhidmatan",
    servicesHelpText:
      "Satu tajuk, penerangan pilihan, dan harga pilihan untuk setiap satu — dipaparkan pada senarai anda. Sekurang-kurangnya satu diperlukan (dalam bahasa Inggeris) sebelum anda boleh menghantar untuk semakan.",

    faqTabHint:
      "Soalan Lazim adalah mengikut bahasa — tukar tab untuk mengedit setiap satu, atau gunakan Terjemah dengan AI untuk mengisi bahasa Cina dan Melayu daripada kandungan Inggeris anda.",
    faqLabel: "Soalan Lazim",
    faqHelpText: "Pilihan — dipaparkan pada senarai anda sebagai bahagian Soal Jawab, dan membantu halaman anda muncul dalam jawapan carian AI.",

    updatesIntro:
      "Pilihan — dipaparkan pada senarai anda dalam bahagian Berita & Promosi. Promosi akan hilang secara automatik selepas tarikh tamatnya berlalu.",
    googleBusinessProfileLabel: "Pautan Profil Perniagaan Google",
    googleBusinessProfilePlaceholder: "https://g.page/r/...",
    googleBusinessProfileHelpText:
      'Pilihan — buka Profil Perniagaan Google anda, ketik Kongsi, dan tampal pautan di sini. Setiap siaran di bawah kemudiannya akan mendapat butang "Siar ke Google" yang menyalinnya dan membuka profil anda untuk ditampal.',
    updatesTabHint:
      "Siaran adalah mengikut bahasa — tukar tab untuk mengedit setiap satu, atau gunakan Terjemah dengan AI untuk mengisi bahasa Cina dan Melayu daripada siaran Inggeris anda. Jenis, tarikh siaran, dan tarikh tamat sentiasa diambil daripada siaran Inggeris dan tidak ditetapkan secara berasingan mengikut bahasa.",

    photosHeading: "Foto",
    photosHelpText:
      'Sehingga 12 — kumpulkan foto ke dalam album (contohnya "Team Building 2026") dan ia akan dipaparkan sebagai album pada halaman awam anda. Ditambah serta-merta, tetapi hanya dipaparkan secara awam selepas anda menyimpan dan senarai (semula) diluluskan, sama seperti perkara lain di sini.',
    videosHeading: "Video",
    videosHelpText:
      "Sehingga 12 — pautan YouTube, Vimeo, Dailymotion, Facebook atau TikTok, masing-masing dengan tajuk dan kategori. Dioptimumkan untuk enjin carian dan enjin jawapan AI.",

    saving: "Menyimpan…",
    saved: "Disimpan",
    saveDraft: "Simpan draf",
    submitting: "Menghantar…",
    awaitingReview: "Menunggu semakan",
    submitForReview: "Hantar untuk semakan",
    draftSaved: "Draf disimpan.",
    publishedToast: "Diterbitkan — senarai anda kini disiarkan.",
    submittedToast: "Dihantar — admin akan menyemaknya tidak lama lagi.",
  },
};

// The SEO title field's own placeholder (fills in once a company name
// exists) — kept as a function rather than a plain template string since it
// interpolates companyName, same reasoning as every formatXxx function in
// directory-i18n.ts.
export function formatSeoTitlePlaceholder(companyName: string, locale: DirectoryLocale): string {
  const t = PORTAL_LISTING_FORM_STRINGS[locale];
  return t.seoTitlePlaceholderTemplate.replace("{company}", companyName || t.seoTitlePlaceholderFallback);
}
