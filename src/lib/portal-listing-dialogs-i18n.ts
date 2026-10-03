import type { DirectoryLocale } from "@/lib/directory-i18n";

// The My Business Listings editor's four independently reusable sub-
// pieces — AI Auto Create, the plain address search box, the logo crop
// dialog, and the public-URL/slug form — each gets its own block here,
// sibling to the editor page/form's own strings in portal-listing-i18n.ts.
// Same type-then-one-block-per-locale shape as DIRECTORY_STRINGS in
// directory-i18n.ts.

// src/components/directory/logo-crop-dialog.tsx
export type PortalLogoCropStrings = {
  dialogHeading: string;
  cancelAriaLabel: string;
  zoomLabel: string;
  rotateLabel: string;
  resetLabel: string;
  cropError: string;
  cancelButton: string;
  applying: string;
  apply: string;
};

export const PORTAL_LOGO_CROP_STRINGS: Record<DirectoryLocale, PortalLogoCropStrings> = {
  en: {
    dialogHeading: "Crop logo",
    cancelAriaLabel: "Cancel",
    zoomLabel: "Zoom",
    rotateLabel: "Rotate",
    resetLabel: "Reset",
    cropError: "Couldn't crop that image — try a different file.",
    cancelButton: "Cancel",
    applying: "Applying…",
    apply: "Apply",
  },
  zh: {
    dialogHeading: "裁剪商标",
    cancelAriaLabel: "取消",
    zoomLabel: "缩放",
    rotateLabel: "旋转",
    resetLabel: "重置",
    cropError: "无法裁剪该图片——请尝试其他文件。",
    cancelButton: "取消",
    applying: "应用中…",
    apply: "应用",
  },
  ms: {
    dialogHeading: "Pangkas logo",
    cancelAriaLabel: "Batal",
    zoomLabel: "Zum",
    rotateLabel: "Putar",
    resetLabel: "Tetapkan semula",
    cropError: "Tidak dapat memangkas imej itu — cuba fail lain.",
    cancelButton: "Batal",
    applying: "Menggunakan…",
    apply: "Guna",
  },
};

// src/components/directory/address-search.tsx
export type PortalAddressSearchStrings = {
  searchLabel: string;
  searchPlaceholder: string;
  loadingAddress: string;
  searching: string;
  noMatches: string;
  // Split around the <span> wrapping the matched place's own name — see
  // address-search.tsx's own JSX — rather than a single {name} template, so
  // that name keeps its bold styling.
  filledInFromPrefix: string;
  filledInFromSuffix: string;
};

export const PORTAL_ADDRESS_SEARCH_STRINGS: Record<DirectoryLocale, PortalAddressSearchStrings> = {
  en: {
    searchLabel: "Search your address on Google Maps",
    searchPlaceholder: "Business name and city, e.g. Acme Printing Kuala Lumpur",
    loadingAddress: "Loading address…",
    searching: "Searching…",
    noMatches: "No matches — try adding the city or area.",
    filledInFromPrefix: "Filled in from ",
    filledInFromSuffix: " — edit the fields below if needed.",
  },
  zh: {
    searchLabel: "在 Google 地图上搜索您的地址",
    searchPlaceholder: "商家名称及城市，例如 Acme Printing Kuala Lumpur",
    loadingAddress: "加载地址中…",
    searching: "搜索中…",
    noMatches: "没有匹配结果——请尝试加上城市或地区。",
    filledInFromPrefix: "已根据「",
    filledInFromSuffix: "」自动填写——如有需要，可在下方字段中编辑。",
  },
  ms: {
    searchLabel: "Cari alamat anda di Google Maps",
    searchPlaceholder: "Nama perniagaan dan bandar, contohnya Acme Printing Kuala Lumpur",
    loadingAddress: "Memuatkan alamat…",
    searching: "Mencari…",
    noMatches: "Tiada padanan — cuba tambah bandar atau kawasan.",
    filledInFromPrefix: "Diisi berdasarkan ",
    filledInFromSuffix: " — edit medan di bawah jika perlu.",
  },
};

// src/components/directory/ai-auto-create-panel.tsx
export type PortalAiAutoCreateStrings = {
  heading: string;
  intro: string;
  step1Label: string;
  // Reused verbatim as both the step-2 heading and the button's own label.
  aiAutoCreate: string;
  creating: string;
  // Reused verbatim as both the step-3 heading and the button's own label.
  aiAutoTranslate: string;
  businessOnGoogleMapsLabel: string;
  searchPlaceholder: string;
  searching: string;
  noMatches: string;
  changeButton: string;
  websiteLabel: string;
  websitePlaceholder: string;
  websiteHelpAuto: string;
  websiteHelpManual: string;
  creatingHelp: string;
  createHelp: string;
  translating: string;
  translatingHelp: string;
  translateHelp: string;
  // handleCreate's own success toast — see formatAiAutoCreateToast below.
  detailsCreatedFromGoogleMaps: string;
  detailsCreated: string;
  noGoogleRatingYet: string;
  reviewEachSection: string;
  // {rating}/{reviewsSuffix} tokens.
  ratingFoundTemplate: string;
  // {count} token.
  reviewsSuffixTemplate: string;
};

export const PORTAL_AI_AUTO_CREATE_STRINGS: Record<DirectoryLocale, PortalAiAutoCreateStrings> = {
  en: {
    heading: "AI Auto Business Details Creation",
    intro:
      "Find your business on Google Maps, and AI drafts the rest of this listing from that and your website — About, Products & services, FAQ, industry, categories, operating hours, address, SEO title & description, and your logo (copied straight from your Google Maps listing's own photo, where it has one). Review everything before saving.",
    step1Label: "Find your business",
    aiAutoCreate: "AI Auto Create",
    creating: "Creating…",
    aiAutoTranslate: "AI Auto Translate",
    businessOnGoogleMapsLabel: "Your business on Google Maps",
    searchPlaceholder: "Business name and city, e.g. Acme Printing Kuala Lumpur",
    searching: "Searching…",
    noMatches: "No matches — try adding the city or area.",
    changeButton: "Change",
    websiteLabel: "Website",
    websitePlaceholder: "acme.com",
    websiteHelpAuto: "Filled in automatically when you pick a business above — edit it any time.",
    websiteHelpManual: "Google Maps search isn't configured (GOOGLE_PLACES_API_KEY) — AI Auto Create reads this site directly instead.",
    creatingHelp: "Reading the Google listing and website, then writing — this can take up to a minute.",
    createHelp:
      "Drafts About, tagline, Products & services, FAQ, industry, categories, hours, address, SEO title & description, and logo from step 1 above. Review everything before saving.",
    translating: "Translating…",
    translatingHelp: "Translating your English content into Chinese and Malay — this can take a moment.",
    translateHelp: "Fills in the Chinese and Malay tabs from your English content above.",
    detailsCreatedFromGoogleMaps: "Details created from your Google Maps listing — your website couldn't be read.",
    detailsCreated: "Details created.",
    noGoogleRatingYet: " No Google rating on file for this business yet.",
    reviewEachSection: " Review each section, then save.",
    ratingFoundTemplate: " Found a {rating}★ Google rating{reviewsSuffix}.",
    reviewsSuffixTemplate: " ({count} reviews)",
  },
  zh: {
    heading: "AI 自动创建商家详情",
    intro:
      "在 Google 地图上找到您的商家，AI 即可根据该信息及您的网站起草列表的其余内容——「关于」、产品与服务、常见问题、行业、分类、营业时间、地址、SEO 标题与描述，以及您的商标（如 Google 地图列表本身有照片，将直接复制使用）。保存前请仔细检查所有内容。",
    step1Label: "找到您的商家",
    aiAutoCreate: "AI 自动创建",
    creating: "创建中…",
    aiAutoTranslate: "AI 自动翻译",
    businessOnGoogleMapsLabel: "您在 Google 地图上的商家",
    searchPlaceholder: "商家名称及城市，例如 Acme Printing Kuala Lumpur",
    searching: "搜索中…",
    noMatches: "没有匹配结果——请尝试加上城市或地区。",
    changeButton: "更改",
    websiteLabel: "网站",
    websitePlaceholder: "acme.com",
    websiteHelpAuto: "选择上方商家后将自动填写——您可随时编辑。",
    websiteHelpManual: "Google 地图搜索尚未配置（GOOGLE_PLACES_API_KEY）——AI 自动创建将改为直接读取该网站。",
    creatingHelp: "正在读取 Google 列表及网站内容并撰写——此过程最长可能需要一分钟。",
    createHelp: "根据上方步骤 1 的信息起草「关于」、标语、产品与服务、常见问题、行业、分类、营业时间、地址、SEO 标题与描述以及商标。保存前请检查所有内容。",
    translating: "翻译中…",
    translatingHelp: "正在将您的英文内容翻译为中文和马来文——可能需要一些时间。",
    translateHelp: "将根据上方英文内容填充中文和马来文标签。",
    detailsCreatedFromGoogleMaps: "已根据您的 Google 地图列表创建详情——您的网站无法读取。",
    detailsCreated: "详情已创建。",
    noGoogleRatingYet: " 该商家目前尚无 Google 评分记录。",
    reviewEachSection: " 请检查每个部分，然后保存。",
    ratingFoundTemplate: " 发现 Google 评分为 {rating}★{reviewsSuffix}。",
    reviewsSuffixTemplate: "（{count} 条评价）",
  },
  ms: {
    heading: "Penciptaan Butiran Perniagaan Automatik AI",
    intro:
      "Cari perniagaan anda di Google Maps, dan AI akan merangka selebihnya senarai ini berdasarkan itu dan laman web anda — Tentang, Produk & perkhidmatan, Soalan Lazim, industri, kategori, waktu operasi, alamat, tajuk & penerangan SEO, dan logo anda (disalin terus daripada foto senarai Google Maps anda sendiri, jika ada). Semak semula semuanya sebelum menyimpan.",
    step1Label: "Cari perniagaan anda",
    aiAutoCreate: "Cipta Automatik AI",
    creating: "Mencipta…",
    aiAutoTranslate: "Terjemah Automatik AI",
    businessOnGoogleMapsLabel: "Perniagaan anda di Google Maps",
    searchPlaceholder: "Nama perniagaan dan bandar, contohnya Acme Printing Kuala Lumpur",
    searching: "Mencari…",
    noMatches: "Tiada padanan — cuba tambah bandar atau kawasan.",
    changeButton: "Tukar",
    websiteLabel: "Laman web",
    websitePlaceholder: "acme.com",
    websiteHelpAuto: "Diisi secara automatik apabila anda memilih perniagaan di atas — edit pada bila-bila masa.",
    websiteHelpManual:
      "Carian Google Maps belum dikonfigurasikan (GOOGLE_PLACES_API_KEY) — Cipta Automatik AI akan membaca laman web ini secara terus sebagai gantinya.",
    creatingHelp: "Membaca senarai Google dan laman web, kemudian menulis — ini mungkin mengambil masa sehingga seminit.",
    createHelp:
      "Merangka Tentang, slogan, Produk & perkhidmatan, Soalan Lazim, industri, kategori, waktu operasi, alamat, tajuk & penerangan SEO, dan logo daripada langkah 1 di atas. Semak semula semuanya sebelum menyimpan.",
    translating: "Menterjemah…",
    translatingHelp: "Menterjemah kandungan Inggeris anda ke bahasa Cina dan Melayu — ini mungkin mengambil sedikit masa.",
    translateHelp: "Mengisi tab bahasa Cina dan Melayu daripada kandungan Inggeris anda di atas.",
    detailsCreatedFromGoogleMaps: "Butiran dicipta daripada senarai Google Maps anda — laman web anda tidak dapat dibaca.",
    detailsCreated: "Butiran telah dicipta.",
    noGoogleRatingYet: " Tiada penilaian Google direkodkan untuk perniagaan ini lagi.",
    reviewEachSection: " Semak setiap bahagian, kemudian simpan.",
    ratingFoundTemplate: " Menemui penilaian Google {rating}★{reviewsSuffix}.",
    reviewsSuffixTemplate: " ({count} ulasan)",
  },
};

// handleCreate's own success toast, composed from several conditional
// pieces (same branching as the component already does — see
// ai-auto-create-panel.tsx) — kept as a function since it interpolates the
// Google rating/review count, same reasoning as every formatXxx function in
// directory-i18n.ts.
export function formatAiAutoCreateToast(
  locale: DirectoryLocale,
  args: {
    googleMaps: boolean;
    fromWebsite: boolean;
    hasWebsite: boolean;
    rating: number | null;
    ratingCount: number | null;
  },
): string {
  const t = PORTAL_AI_AUTO_CREATE_STRINGS[locale];
  const baseMessage =
    args.googleMaps && !args.fromWebsite && args.hasWebsite ? t.detailsCreatedFromGoogleMaps : t.detailsCreated;
  const ratingNote = !args.googleMaps
    ? ""
    : args.rating !== null
      ? t.ratingFoundTemplate
          .replace("{rating}", args.rating.toFixed(1))
          .replace("{reviewsSuffix}", args.ratingCount !== null ? t.reviewsSuffixTemplate.replace("{count}", String(args.ratingCount)) : "")
      : t.noGoogleRatingYet;
  return `${baseMessage}${ratingNote}${t.reviewEachSection}`;
}

// src/components/directory/partner-slug-form.tsx
export type PortalSlugFormStrings = {
  webAddressLabel: string;
  helpText: string;
  warningText: string;
  saving: string;
  updateAddress: string;
};

export const PORTAL_SLUG_FORM_STRINGS: Record<DirectoryLocale, PortalSlugFormStrings> = {
  en: {
    webAddressLabel: "Web address",
    helpText: "Letters, numbers, and hyphens only.",
    warningText: "Don't change this after you go live — anyone with the old link gets a not-found page instead.",
    saving: "Saving…",
    updateAddress: "Update address",
  },
  zh: {
    webAddressLabel: "网址",
    helpText: "仅限字母、数字及连字符。",
    warningText: "上线后请勿更改此设置——持有旧链接的访客将无法访问您的页面。",
    saving: "保存中…",
    updateAddress: "更新网址",
  },
  ms: {
    webAddressLabel: "Alamat web",
    helpText: "Hanya huruf, nombor, dan sengkang.",
    warningText: "Jangan tukar ini selepas anda disiarkan — sesiapa yang memegang pautan lama akan mendapat halaman tidak dijumpai.",
    saving: "Menyimpan…",
    updateAddress: "Kemas kini alamat",
  },
};
