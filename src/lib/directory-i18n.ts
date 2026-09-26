import type { Industry } from "@/generated/prisma/client";
import { BUSINESS_NAV_ITEMS } from "@/lib/business-nav-items";
import { INDUSTRY_LABELS, VIDEO_CATEGORY_LABELS, type VideoCategory } from "@/lib/labels";

// Same three languages as the public /lead form (src/lib/lead-form-i18n.ts)
// but kept as its own copy rather than shared — that file's locale type and
// list are specific to the lead-capture widget's own module state, and this
// one's locale is read server-side from a cookie (see directory-locale.ts)
// rather than localStorage, so the two aren't actually interchangeable.
export type DirectoryLocale = "en" | "zh" | "ms";

export const DIRECTORY_LOCALES: { code: DirectoryLocale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
  { code: "ms", label: "BM" },
];

// The directory home page's own title, in each language — shared rather
// than kept as a local const in src/app/[locale]/business/page.tsx (where
// it originated) so a "Home" breadcrumb entry elsewhere in the tree (the
// category page, a single listing's own page) names the same page the same
// way instead of drifting into its own wording over time.
export const DIRECTORY_HOME_TITLE_BY_LOCALE: Record<DirectoryLocale, string> = {
  en: "Business Directory",
  zh: "企业目录",
  ms: "Direktori Perniagaan",
};

// Every directory URL carries its language as a leading path segment —
// /en, /zh/some-company, /ms/signup — English included, rather than a
// bare default-locale URL, so all three languages are equally real,
// bookmarkable, crawlable pages (see sitemap-generator.ts) instead of one
// "canonical" version plus query-param/cookie variants. The whole public
// directory sits directly under its locale segment now — no /business or
// /directory word in between (the tree's own folder name, and every old
// link, was /directory, then /business, until each was dropped in turn for
// a friendlier public URL). The signed-in partner portal used to share the
// /business word — it's since moved to its own /business-portal
// (src/app/business-portal/), which isn't locale-prefixed either way, so
// it was never a routing conflict, just a naming one. Every old
// /[locale]/business/* and /directory/* URL, prefixed or not, still
// resolves — see src/app/[locale]/business/, src/app/directory/ and
// src/app/[locale]/directory/ — as a permanent redirect into here, for old
// links/bookmarks/SEO.
export function directoryHomePath(locale: DirectoryLocale): string {
  return `/${locale}`;
}

export function directorySignupPath(locale: DirectoryLocale): string {
  return `/${locale}/signup`;
}

export function directoryBenefitsPath(locale: DirectoryLocale): string {
  return `/${locale}/benefits`;
}

// A listing's own page is just /en/some-company — shorter and friendlier
// to share than every other directory URL, since it's the one visitors
// actually pass around. Lives at src/app/[locale]/[slug], a sibling of
// every static directory folder below (category, location, industry,
// categories, locations, products, news, signup, benefits) rather than
// nested under any of them; Next.js resolves those static folders ahead of
// this dynamic one, so a listing at one of those exact slugs is the one
// tradeoff of dropping the old /business segment — same as a listing
// slugged "business" or "directory" already couldn't reach its own page
// either, back when those were the static siblings doing the same job.
// Every old /[locale]/business/<slug> URL still resolves — see
// src/app/[locale]/business/[slug]/ — as a permanent redirect into here,
// for old links/bookmarks/SEO.
export function directoryListingPath(locale: DirectoryLocale, slug: string): string {
  return `/${locale}/${slug}`;
}

// The main top-nav's four destinations (directory-top-nav.tsx) — real
// index/feed pages, distinct from the existing per-category (categoryPath)
// / per-location (locationPath) pages they each link out to.
export function directoryCategoriesIndexPath(locale: DirectoryLocale): string {
  return `/${locale}/categories`;
}

export function directoryLocationsIndexPath(locale: DirectoryLocale): string {
  return `/${locale}/locations`;
}

export function directoryProductsPath(locale: DirectoryLocale): string {
  return `/${locale}/products`;
}

export function directoryNewsPath(locale: DirectoryLocale): string {
  return `/${locale}/news`;
}

export const DEFAULT_DIRECTORY_LOCALE: DirectoryLocale = "en";

// Fills in DirectoryStrings.recommendMessage's {business}/{url} tokens —
// see that field's own comment for why this is plain substitution rather
// than a template literal built where the message is used.
export function formatRecommendMessage(template: string, business: string, url: string): string {
  return template.replace("{business}", business).replace("{url}", url);
}

// The listing page's view-count line — plural-aware (English needs "1
// view" vs "N views"), which is exactly why this can't be a plain
// DIRECTORY_STRINGS template string the way recommendMessage above is: it
// has to branch on count, and DIRECTORY_STRINGS itself gets passed whole
// into "use client" components (DirectorySearch) on the home/category/
// location pages, where a function value in that object throws at render
// ("Functions cannot be passed directly to Client Components"). Kept as
// its own plain function instead, called only from the (server-only)
// listing detail page — same reasoning as DirectoryHomeCopy.listingCount,
// which lives outside DIRECTORY_STRINGS for the same reason.
export function formatViewsLabel(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `${count.toLocaleString()} 次浏览`;
  if (locale === "ms") return `${count.toLocaleString()} paparan`;
  return count === 1 ? "1 view" : `${count.toLocaleString()} views`;
}

export type DirectoryLeadFormErrorCode =
  | "name_required"
  | "email_required"
  | "email_invalid"
  | "phone_required"
  | "phone_invalid"
  | "message_required"
  | "rate_limited"
  | "listing_not_found"
  | "invalid_submission"
  | "generic";

export type DirectoryDayLabels = {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
};

export type DirectoryStrings = {
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  // A category page's "see other categories" links, below its results —
  // the only way to reach a sibling category without going back to the
  // directory home (see category-page-content.tsx).
  otherCategoriesHeading: string;
  // Same idea, for a location page's sibling states (see
  // location-page-content.tsx).
  otherLocationsHeading: string;
  // Same idea, for an industry page's sibling industries (see
  // industry-page-content.tsx).
  otherIndustriesHeading: string;
  noResultsTitle: string;
  noResultsDescription: string;
  viewListing: string;
  servicesHeading: string;
  // The new top nav bar (directory-top-nav.tsx) and the index/feed pages
  // it links to — All Business (categories index), Location (locations
  // index), Latest Products. The fourth item, News & Promotions, reuses
  // updatesHeading/newsLabel/promotionLabel below rather than duplicating
  // near-identical strings.
  topNavLabel: string;
  navAllBusiness: string;
  navLocations: string;
  navLatestProducts: string;
  categoriesIndexHeading: string;
  categoriesIndexDescription: string;
  categoriesIndexEmptyTitle: string;
  categoriesIndexEmptyDescription: string;
  locationsIndexHeading: string;
  locationsIndexDescription: string;
  locationsIndexEmptyTitle: string;
  locationsIndexEmptyDescription: string;
  latestProductsHeading: string;
  latestProductsDescription: string;
  latestProductsEmptyTitle: string;
  latestProductsEmptyDescription: string;
  // The /news feed's own subheading/empty state — its H1 reuses
  // updatesHeading itself (the listing page's own "News & Promotions" card
  // title), since this page is exactly that content aggregated site-wide.
  newsFeedDescription: string;
  newsFeedEmptyTitle: string;
  newsFeedEmptyDescription: string;
  // The listing page's two "other businesses" sections — newest published
  // listings overall, and other listings in the same state but a different
  // industry (see latestListings/nearbyListingsExcludingIndustry in
  // src/lib/directory.ts). Deliberately not grouped by this listing's own
  // category/industry, unlike the section these replaced.
  latestBusinessesHeading: string;
  nearbyBusinessesHeading: string;
  aboutHeading: string;
  // The section wrapping Video and Photos together (see VideoGallery's own
  // placement in [locale]/[slug]/page.tsx) — videoHeading/photosHeading
  // still exist as the two sub-headings shown when a listing has both.
  mediaHeading: string;
  videoHeading: string;
  photosHeading: string;
  updatesHeading: string;
  newsLabel: string;
  promotionLabel: string;
  faqHeading: string;
  visitHeading: string;
  hoursHeading: string;
  hoursOpenLabel: string;
  hoursOpenTodayLabel: string;
  hoursClosedLabel: string;
  hoursClosedTodayLabel: string;
  // The small badge next to the Hours heading itself — isOpenNow's
  // right-now verdict, distinct from hoursOpenTodayLabel/hoursClosedTodayLabel
  // above (those label a whole day's row in the table; this is a single
  // point-in-time status). Only rendered when the listing has a timezone
  // set, since isOpenNow can't tell without one.
  hoursOpenNowBadge: string;
  hoursClosedNowBadge: string;
  dayLabels: DirectoryDayLabels;
  websiteLabel: string;
  locationLabel: string;
  // The listing page's "Recommend" affordances, open to every visitor —
  // the header button, and the floating bottom-bar pill (see
  // RecommendBar). Both share one referral-tracking link (?r=<referral
  // code>, see recommendUrl) and this same pre-written message for the
  // email/WhatsApp/native-share options (Copy link still copies that same
  // tracking link). {business} and {url} are replaced with the listing's
  // name and the tracking link itself — plain string substitution, not a
  // template literal, since this is localized data, not code.
  recommendLabel: string;
  recommendBusinessCta: string;
  recommendMessage: string;
  // The header's plain Share button — ShareButton's own `label` prop
  // defaults to unlocalized English "Share", so every caller that isn't
  // fine with that (this one included) passes this instead.
  shareLabel: string;
  contactHeading: string;
  contactSubheading: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formPhoneLabel: string;
  formPhonePlaceholder: string;
  formPhoneHint: string;
  formCompanyLabel: string;
  formCompanyPlaceholder: string;
  formMessageLabel: string;
  formMessagePlaceholder: string;
  formSubmit: string;
  formSubmitting: string;
  formSuccess: string;
  errors: Record<DirectoryLeadFormErrorCode, string>;
  stickyNavLabel: string;
  // aria-label for the visible breadcrumb trail (see
  // directory-breadcrumbs.tsx) — read by assistive tech, not shown as text.
  breadcrumbNavLabel: string;
  notFoundTitle: string;
  notFoundDescription: string;
  notFoundBackCta: string;
  footerTagline: string;
  backToDirectory: string;
  brandName: string;
  navLoginRegister: string;
  navMyBusiness: string;
  navAddBusiness: string;
  navPartnership: string;
  navGoToCrm: string;
  navSignOut: string;
  // The business-portal's own page names (BUSINESS_NAV_ITEMS, keyed by
  // href below) — the portal itself is English-only by design (see
  // src/app/layout.tsx), but this same list also renders inside the
  // trilingual directory's own hamburger menu (see localizedBusinessNavItems
  // below and DirectoryNavMenu), where it needs to match whatever language
  // the rest of that menu is already in.
  navOverview: string;
  navMyListings: string;
  navBusinessLeads: string;
  navCompanies: string;
  navContacts: string;
  navDeals: string;
  navTasks: string;
  navProfile: string;
  listBusinessCta: string;
  benefitsNavLabel: string;
  signupHeading: string;
  signupSubheading: string;
  signupCompanyLabel: string;
  signupCompanyPlaceholder: string;
  signupNameLabel: string;
  signupNamePlaceholder: string;
  signupEmailLabel: string;
  signupEmailPlaceholder: string;
  signupPhoneLabel: string;
  signupPhonePlaceholder: string;
  signupPhoneHint: string;
  signupPasswordLabel: string;
  signupPasswordHint: string;
  signupSubmit: string;
  signupSubmitting: string;
  signupOrDivider: string;
  signupGoogleCta: string;
  signupAlreadyPartner: string;
  signupSignInLink: string;
  signupErrors: Record<PartnerSignupErrorCode, string>;
};

export type PartnerSignupErrorCode =
  | "company_required"
  | "name_required"
  | "email_required"
  | "email_invalid"
  | "phone_invalid"
  | "password_length"
  | "email_taken"
  | "rate_limited"
  | "invalid_submission"
  | "generic"
  | "google_failed"
  | "google_unavailable"
  | "email_unverified"
  | "wrong_role";

export const DIRECTORY_STRINGS: Record<DirectoryLocale, DirectoryStrings> = {
  en: {
    heroTitle: "Find the right business for your project",
    heroSubtitle: "Browse trusted businesses and reach out directly.",
    searchPlaceholder: "Search by company, service, industry or category…",
    otherCategoriesHeading: "Browse other categories",
    otherLocationsHeading: "Browse other locations",
    otherIndustriesHeading: "Browse other industries",
    noResultsTitle: "No businesses found",
    noResultsDescription: "Try a different search or industry filter.",
    viewListing: "View details",
    servicesHeading: "Products & Services",
    topNavLabel: "Browse",
    navAllBusiness: "All Business",
    navLocations: "Location",
    navLatestProducts: "Latest Products",
    categoriesIndexHeading: "All Business Categories",
    categoriesIndexDescription: "Every category in the Gotka Business Directory, with how many businesses are listed in each.",
    categoriesIndexEmptyTitle: "No categories yet",
    categoriesIndexEmptyDescription: "Check back soon — categories will appear here.",
    locationsIndexHeading: "All Locations",
    locationsIndexDescription: "Every state and region with a business listed in the Gotka Business Directory.",
    locationsIndexEmptyTitle: "No locations yet",
    locationsIndexEmptyDescription: "Check back soon — locations will appear here as businesses join the directory.",
    latestProductsHeading: "Latest Products & Services",
    latestProductsDescription: "Recently added products and services from businesses across the directory.",
    latestProductsEmptyTitle: "No products yet",
    latestProductsEmptyDescription: "Check back soon — businesses are adding their products and services.",
    newsFeedDescription: "Current news and promotions from businesses across the directory.",
    newsFeedEmptyTitle: "No news or promotions yet",
    newsFeedEmptyDescription: "Check back soon for updates from businesses in the directory.",
    latestBusinessesHeading: "Latest Businesses",
    nearbyBusinessesHeading: "Businesses Near You",
    aboutHeading: "About",
    mediaHeading: "Media",
    videoHeading: "Videos",
    photosHeading: "Photos",
    updatesHeading: "News & Promotions",
    newsLabel: "News",
    promotionLabel: "Promotion",
    faqHeading: "Frequently asked questions",
    visitHeading: "Visit us",
    hoursHeading: "Hours",
    hoursOpenLabel: "Open",
    hoursOpenTodayLabel: "Open today",
    hoursClosedLabel: "Closed",
    hoursClosedTodayLabel: "Closed today",
    hoursOpenNowBadge: "Open now",
    hoursClosedNowBadge: "Closed now",
    dayLabels: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
    websiteLabel: "Website",
    locationLabel: "Location",
    recommendLabel: "Recommend Business",
    recommendBusinessCta: "Recommend the Business",
    recommendMessage: "I recommend {business} — check them out on the Business Directory: {url}",
    shareLabel: "Share Business",
    contactHeading: "Get in touch",
    contactSubheading: "Send a message directly to this business — they'll reply to the email address and contact number you provide.",
    formNameLabel: "Name",
    formNamePlaceholder: "Jane Smith",
    formEmailLabel: "Email",
    formEmailPlaceholder: "jane@company.com",
    formPhoneLabel: "Phone",
    formPhonePlaceholder: "+60 12 345 6789",
    formPhoneHint: "Include the country code with a + sign, e.g. +60 12 345 6789.",
    formCompanyLabel: "Company",
    formCompanyPlaceholder: "Optional",
    formMessageLabel: "What do you need help with?",
    formMessagePlaceholder: "Tell us a bit about your project…",
    formSubmit: "Send message",
    formSubmitting: "Sending…",
    formSuccess: "Thanks! Your message has been sent — the business will reply to your email directly.",
    errors: {
      name_required: "Name is required",
      email_required: "Email is required",
      email_invalid: "Enter a valid email",
      phone_required: "Phone number is required",
      phone_invalid: "Include the country code with a + sign, e.g. +60 12 345 6789.",
      message_required: "Tell us a bit about what you need",
      rate_limited: "Too many attempts — please wait a few minutes and try again.",
      listing_not_found: "This listing is no longer available.",
      invalid_submission: "Please check the form and try again.",
      generic: "Something went wrong. Please try again.",
    },
    stickyNavLabel: "Quick links",
    breadcrumbNavLabel: "Breadcrumb",
    notFoundTitle: "This page isn't in the directory",
    notFoundDescription:
      "The business or category you're looking for may have moved, been unpublished, or never existed. Check the link, or browse the directory from the start.",
    notFoundBackCta: "Browse the directory",
    footerTagline: "A directory of trusted businesses in the Gotka network.",
    backToDirectory: "Back to directory",
    brandName: "Business Directory",
    navLoginRegister: "Business Login",
    navMyBusiness: "My business",
    navAddBusiness: "Add Business",
    navOverview: "Overview",
    navMyListings: "My listings",
    navBusinessLeads: "Business Leads",
    navCompanies: "Companies",
    navContacts: "Contacts",
    navDeals: "Deals",
    navTasks: "Tasks",
    navProfile: "Profile",
    navPartnership: "Partnership",
    navGoToCrm: "Go to CRM",
    navSignOut: "Sign out",
    listBusinessCta: "List your business",
    benefitsNavLabel: "Why list your business",
    signupHeading: "List your business",
    signupSubheading: "Join the business directory and start receiving inquiries directly from visitors.",
    signupCompanyLabel: "Business name",
    signupCompanyPlaceholder: "Acme Sdn Bhd",
    signupNameLabel: "Your name",
    signupNamePlaceholder: "Jane Smith",
    signupEmailLabel: "Email",
    signupEmailPlaceholder: "jane@company.com",
    signupPhoneLabel: "Phone",
    signupPhonePlaceholder: "+60 12 345 6789",
    signupPhoneHint: "Include the country code with a + sign, e.g. +60 12 345 6789.",
    signupPasswordLabel: "Password",
    signupPasswordHint: "At least 8 characters.",
    signupSubmit: "Create account",
    signupSubmitting: "Creating account…",
    signupOrDivider: "or",
    signupGoogleCta: "Continue with Google",
    signupAlreadyPartner: "Already have an account?",
    signupSignInLink: "Sign in",
    signupErrors: {
      company_required: "Business name is required",
      name_required: "Your name is required",
      email_required: "Email is required",
      email_invalid: "Enter a valid email",
      phone_invalid: "Include the country code with a + sign, e.g. +60 12 345 6789.",
      password_length: "Password must be at least 8 characters",
      email_taken: "An account with that email already exists. Try signing in instead.",
      rate_limited: "Too many attempts — please wait a few minutes and try again.",
      invalid_submission: "Please check the form and try again.",
      generic: "Something went wrong. Please try again.",
      google_failed: "Google sign-in failed. Please try again.",
      google_unavailable: "Google sign-in isn't available right now.",
      email_unverified: "Your Google account's email isn't verified.",
      wrong_role: "That Google account belongs to a staff member. Staff sign in at /system/login.",
    },
  },
  zh: {
    heroTitle: "为您的项目寻找合适的企业",
    heroSubtitle: "浏览值得信赖的企业，并直接联系他们。",
    searchPlaceholder: "按公司、服务、行业或类别搜索…",
    otherCategoriesHeading: "浏览其他类别",
    otherLocationsHeading: "浏览其他地区",
    otherIndustriesHeading: "浏览其他行业",
    noResultsTitle: "未找到企业",
    noResultsDescription: "请尝试其他搜索词或行业筛选。",
    viewListing: "查看详情",
    servicesHeading: "产品与服务",
    topNavLabel: "浏览",
    navAllBusiness: "所有企业",
    navLocations: "地区",
    navLatestProducts: "最新产品",
    categoriesIndexHeading: "所有企业类别",
    categoriesIndexDescription: "Gotka 商业目录中的每一个类别，以及各类别下的企业数量。",
    categoriesIndexEmptyTitle: "暂无类别",
    categoriesIndexEmptyDescription: "请稍后再来查看——类别将显示在这里。",
    locationsIndexHeading: "所有地区",
    locationsIndexDescription: "Gotka 商业目录中每个有企业上榜的州属与地区。",
    locationsIndexEmptyTitle: "暂无地区",
    locationsIndexEmptyDescription: "请稍后再来查看——随着企业加入目录，地区将显示在这里。",
    latestProductsHeading: "最新产品与服务",
    latestProductsDescription: "来自目录中各企业最新添加的产品与服务。",
    latestProductsEmptyTitle: "暂无产品",
    latestProductsEmptyDescription: "请稍后再来查看——企业正在添加产品与服务。",
    newsFeedDescription: "来自目录中各企业的最新新闻与促销信息。",
    newsFeedEmptyTitle: "暂无新闻或促销",
    newsFeedEmptyDescription: "请稍后再来查看目录中企业的最新动态。",
    latestBusinessesHeading: "最新企业",
    nearbyBusinessesHeading: "附近企业",
    aboutHeading: "关于",
    mediaHeading: "媒体",
    videoHeading: "视频",
    photosHeading: "照片",
    updatesHeading: "新闻与促销",
    newsLabel: "新闻",
    promotionLabel: "促销",
    faqHeading: "常见问题",
    visitHeading: "联系地址",
    hoursHeading: "营业时间",
    hoursOpenLabel: "营业",
    hoursOpenTodayLabel: "今日营业",
    hoursClosedLabel: "休息",
    hoursClosedTodayLabel: "今日休息",
    hoursOpenNowBadge: "营业中",
    hoursClosedNowBadge: "已休息",
    dayLabels: {
      monday: "星期一",
      tuesday: "星期二",
      wednesday: "星期三",
      thursday: "星期四",
      friday: "星期五",
      saturday: "星期六",
      sunday: "星期日",
    },
    websiteLabel: "网站",
    recommendLabel: "推荐企业",
    recommendBusinessCta: "推荐这家企业",
    recommendMessage: "我推荐 {business}——快来企业目录看看：{url}",
    shareLabel: "分享企业",
    locationLabel: "地点",
    contactHeading: "联系我们",
    contactSubheading: "直接给这家企业发送信息——他们会回复您提供的电子邮件地址和联系电话。",
    formNameLabel: "姓名",
    formNamePlaceholder: "Jane Smith",
    formEmailLabel: "电子邮件",
    formEmailPlaceholder: "jane@company.com",
    formPhoneLabel: "电话号码",
    formPhonePlaceholder: "+60 12 345 6789",
    formPhoneHint: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
    formCompanyLabel: "公司",
    formCompanyPlaceholder: "选填",
    formMessageLabel: "您需要什么帮助？",
    formMessagePlaceholder: "简单介绍一下您的项目…",
    formSubmit: "发送信息",
    formSubmitting: "发送中…",
    formSuccess: "谢谢！您的信息已发送——该企业会直接回复您的电子邮件。",
    errors: {
      name_required: "请填写姓名",
      email_required: "请填写电子邮件",
      email_invalid: "请输入有效的电子邮件地址",
      phone_required: "请填写电话号码",
      phone_invalid: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
      message_required: "请简单说明您需要的帮助",
      rate_limited: "尝试次数过多，请稍等几分钟后再试。",
      listing_not_found: "该合作伙伴的资料已下架。",
      invalid_submission: "请检查表单内容后重试。",
      generic: "出现错误，请重试。",
    },
    stickyNavLabel: "快捷链接",
    breadcrumbNavLabel: "面包屑导航",
    notFoundTitle: "目录中没有这个页面",
    notFoundDescription: "您查找的企业或类别可能已迁移、已下架，或从未存在。请检查链接，或从头浏览目录。",
    notFoundBackCta: "浏览目录",
    footerTagline: "Gotka 网络中值得信赖的企业目录。",
    backToDirectory: "返回目录",
    brandName: "企业目录",
    navLoginRegister: "企业登录",
    navMyBusiness: "我的企业",
    navAddBusiness: "添加企业",
    navOverview: "概览",
    navMyListings: "我的刊登",
    navBusinessLeads: "商业线索",
    navCompanies: "公司",
    navContacts: "联系人",
    navDeals: "交易",
    navTasks: "任务",
    navProfile: "个人资料",
    navPartnership: "合作伙伴关系",
    navGoToCrm: "前往 CRM",
    navSignOut: "退出登录",
    listBusinessCta: "刊登您的企业",
    benefitsNavLabel: "为什么要刊登您的企业",
    signupHeading: "刊登您的企业",
    signupSubheading: "加入企业目录，直接从访客那里获得咨询。",
    signupCompanyLabel: "企业名称",
    signupCompanyPlaceholder: "Acme Sdn Bhd",
    signupNameLabel: "您的姓名",
    signupNamePlaceholder: "Jane Smith",
    signupEmailLabel: "电子邮件",
    signupEmailPlaceholder: "jane@company.com",
    signupPhoneLabel: "电话号码",
    signupPhonePlaceholder: "+60 12 345 6789",
    signupPhoneHint: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
    signupPasswordLabel: "密码",
    signupPasswordHint: "至少 8 个字符。",
    signupSubmit: "创建账户",
    signupSubmitting: "正在创建账户…",
    signupOrDivider: "或",
    signupGoogleCta: "使用 Google 继续",
    signupAlreadyPartner: "已经有账户？",
    signupSignInLink: "登录",
    signupErrors: {
      company_required: "请填写企业名称",
      name_required: "请填写您的姓名",
      email_required: "请填写电子邮件",
      email_invalid: "请输入有效的电子邮件地址",
      phone_invalid: "请附上国家代码及 + 号，例如 +60 12 345 6789。",
      password_length: "密码至少需要 8 个字符",
      email_taken: "该电子邮件已注册账户，请尝试登录。",
      rate_limited: "尝试次数过多，请稍等几分钟后再试。",
      invalid_submission: "请检查表单内容后重试。",
      generic: "出现错误，请重试。",
      google_failed: "Google 登录失败，请重试。",
      google_unavailable: "Google 登录目前不可用。",
      email_unverified: "您的 Google 账户电子邮件尚未验证。",
      wrong_role: "该 Google 账户属于员工账号。员工请在 /system/login 登录。",
    },
  },
  ms: {
    heroTitle: "Cari perniagaan yang sesuai untuk projek anda",
    heroSubtitle: "Semak imbas perniagaan yang dipercayai dan hubungi terus.",
    searchPlaceholder: "Cari mengikut syarikat, perkhidmatan, industri atau kategori…",
    otherCategoriesHeading: "Semak imbas kategori lain",
    otherLocationsHeading: "Semak imbas lokasi lain",
    otherIndustriesHeading: "Semak imbas industri lain",
    noResultsTitle: "Tiada perniagaan dijumpai",
    noResultsDescription: "Cuba carian atau penapis industri yang lain.",
    viewListing: "Lihat butiran",
    servicesHeading: "Produk & Perkhidmatan",
    topNavLabel: "Semak Imbas",
    navAllBusiness: "Semua Perniagaan",
    navLocations: "Lokasi",
    navLatestProducts: "Produk Terkini",
    categoriesIndexHeading: "Semua Kategori Perniagaan",
    categoriesIndexDescription: "Setiap kategori dalam Direktori Perniagaan Gotka, berserta bilangan perniagaan yang tersenarai dalam setiap satu.",
    categoriesIndexEmptyTitle: "Belum ada kategori",
    categoriesIndexEmptyDescription: "Sila semak semula tidak lama lagi — kategori akan dipaparkan di sini.",
    locationsIndexHeading: "Semua Lokasi",
    locationsIndexDescription: "Setiap negeri dan kawasan yang mempunyai perniagaan tersenarai dalam Direktori Perniagaan Gotka.",
    locationsIndexEmptyTitle: "Belum ada lokasi",
    locationsIndexEmptyDescription: "Sila semak semula tidak lama lagi — lokasi akan dipaparkan di sini apabila perniagaan menyertai direktori.",
    latestProductsHeading: "Produk & Perkhidmatan Terkini",
    latestProductsDescription: "Produk dan perkhidmatan yang baru ditambah oleh perniagaan di seluruh direktori.",
    latestProductsEmptyTitle: "Belum ada produk",
    latestProductsEmptyDescription: "Sila semak semula tidak lama lagi — perniagaan sedang menambah produk dan perkhidmatan mereka.",
    newsFeedDescription: "Berita dan promosi terkini daripada perniagaan di seluruh direktori.",
    newsFeedEmptyTitle: "Belum ada berita atau promosi",
    newsFeedEmptyDescription: "Sila semak semula tidak lama lagi untuk kemas kini daripada perniagaan dalam direktori.",
    latestBusinessesHeading: "Perniagaan Terkini",
    nearbyBusinessesHeading: "Perniagaan Berhampiran",
    aboutHeading: "Tentang",
    mediaHeading: "Media",
    videoHeading: "Video",
    photosHeading: "Foto",
    updatesHeading: "Berita & Promosi",
    newsLabel: "Berita",
    promotionLabel: "Promosi",
    faqHeading: "Soalan lazim",
    visitHeading: "Lawati kami",
    hoursHeading: "Waktu Operasi",
    hoursOpenLabel: "Buka",
    hoursOpenTodayLabel: "Buka hari ini",
    hoursClosedLabel: "Tutup",
    hoursClosedTodayLabel: "Tutup hari ini",
    hoursOpenNowBadge: "Buka sekarang",
    hoursClosedNowBadge: "Tutup sekarang",
    dayLabels: {
      monday: "Isnin",
      tuesday: "Selasa",
      wednesday: "Rabu",
      thursday: "Khamis",
      friday: "Jumaat",
      saturday: "Sabtu",
      sunday: "Ahad",
    },
    websiteLabel: "Laman web",
    recommendLabel: "Syorkan Perniagaan",
    recommendBusinessCta: "Syorkan Perniagaan Ini",
    recommendMessage: "Saya syorkan {business} — lihat mereka di Direktori Perniagaan: {url}",
    shareLabel: "Kongsi Perniagaan",
    locationLabel: "Lokasi",
    contactHeading: "Hubungi kami",
    contactSubheading: "Hantar mesej terus kepada perniagaan ini — mereka akan membalas ke alamat e-mel dan nombor telefon yang anda berikan.",
    formNameLabel: "Nama",
    formNamePlaceholder: "Jane Smith",
    formEmailLabel: "E-mel",
    formEmailPlaceholder: "jane@company.com",
    formPhoneLabel: "Nombor Telefon",
    formPhonePlaceholder: "+60 12 345 6789",
    formPhoneHint: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
    formCompanyLabel: "Syarikat",
    formCompanyPlaceholder: "Pilihan",
    formMessageLabel: "Apakah bantuan yang anda perlukan?",
    formMessagePlaceholder: "Ceritakan sedikit tentang projek anda…",
    formSubmit: "Hantar mesej",
    formSubmitting: "Menghantar…",
    formSuccess: "Terima kasih! Mesej anda telah dihantar — perniagaan ini akan membalas terus ke e-mel anda.",
    errors: {
      name_required: "Nama diperlukan",
      email_required: "E-mel diperlukan",
      email_invalid: "Sila masukkan e-mel yang sah",
      phone_required: "Nombor telefon diperlukan",
      phone_invalid: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
      message_required: "Beritahu kami sedikit tentang apa yang anda perlukan",
      rate_limited: "Terlalu banyak percubaan — sila tunggu beberapa minit dan cuba lagi.",
      listing_not_found: "Penyenaraian ini tidak lagi tersedia.",
      invalid_submission: "Sila semak borang dan cuba lagi.",
      generic: "Berlaku ralat. Sila cuba lagi.",
    },
    stickyNavLabel: "Pautan pantas",
    breadcrumbNavLabel: "Navigasi laluan",
    notFoundTitle: "Halaman ini tiada dalam direktori",
    notFoundDescription:
      "Perniagaan atau kategori yang anda cari mungkin telah berpindah, ditarik balik, atau tidak pernah wujud. Semak pautan itu, atau layari direktori dari mula.",
    notFoundBackCta: "Layari direktori",
    footerTagline: "Direktori perniagaan yang dipercayai dalam rangkaian Gotka.",
    backToDirectory: "Kembali ke direktori",
    brandName: "Direktori Perniagaan",
    navLoginRegister: "Log Masuk Perniagaan",
    navMyBusiness: "Perniagaan saya",
    navAddBusiness: "Tambah Perniagaan",
    navOverview: "Gambaran keseluruhan",
    navMyListings: "Senarai saya",
    navBusinessLeads: "Petunjuk Perniagaan",
    navCompanies: "Syarikat",
    navContacts: "Kenalan",
    navDeals: "Urus Niaga",
    navTasks: "Tugasan",
    navProfile: "Profil",
    navPartnership: "Perkongsian",
    navGoToCrm: "Pergi ke CRM",
    navSignOut: "Log keluar",
    listBusinessCta: "Senaraikan perniagaan anda",
    benefitsNavLabel: "Kenapa senaraikan perniagaan anda",
    signupHeading: "Senaraikan perniagaan anda",
    signupSubheading: "Sertai direktori perniagaan dan mula menerima pertanyaan terus daripada pelawat.",
    signupCompanyLabel: "Nama perniagaan",
    signupCompanyPlaceholder: "Acme Sdn Bhd",
    signupNameLabel: "Nama anda",
    signupNamePlaceholder: "Jane Smith",
    signupEmailLabel: "E-mel",
    signupEmailPlaceholder: "jane@company.com",
    signupPhoneLabel: "Nombor Telefon",
    signupPhonePlaceholder: "+60 12 345 6789",
    signupPhoneHint: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
    signupPasswordLabel: "Kata laluan",
    signupPasswordHint: "Sekurang-kurangnya 8 aksara.",
    signupSubmit: "Cipta akaun",
    signupSubmitting: "Mencipta akaun…",
    signupOrDivider: "atau",
    signupGoogleCta: "Teruskan dengan Google",
    signupAlreadyPartner: "Sudah mempunyai akaun?",
    signupSignInLink: "Log masuk",
    signupErrors: {
      company_required: "Nama perniagaan diperlukan",
      name_required: "Nama anda diperlukan",
      email_required: "E-mel diperlukan",
      email_invalid: "Sila masukkan e-mel yang sah",
      phone_invalid: "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789.",
      password_length: "Kata laluan mesti sekurang-kurangnya 8 aksara",
      email_taken: "Akaun dengan e-mel itu sudah wujud. Cuba log masuk sebaliknya.",
      rate_limited: "Terlalu banyak percubaan — sila tunggu beberapa minit dan cuba lagi.",
      invalid_submission: "Sila semak borang dan cuba lagi.",
      generic: "Berlaku ralat. Sila cuba lagi.",
      google_failed: "Log masuk Google gagal. Sila cuba lagi.",
      google_unavailable: "Log masuk Google tidak tersedia sekarang.",
      email_unverified: "E-mel akaun Google anda belum disahkan.",
      wrong_role: "Akaun Google itu milik kakitangan. Kakitangan log masuk di /system/login.",
    },
  },
};

// BUSINESS_NAV_ITEMS (src/lib/business-nav-items.ts) gives the portal's own
// English page names — right for PartnerNavMenu/PartnerSidebar, which live
// outside the locale-prefixed directory tree, but wrong for that same list
// rendered inside DirectoryNavMenu, which does live inside it and needs to
// match whichever of the three languages that menu is already showing.
// Zips those hrefs (unlocalized, and never shown directly) with the
// translated labels above, in the same fixed order.
export function localizedBusinessNavItems(locale: DirectoryLocale): { href: string; label: string }[] {
  const t = DIRECTORY_STRINGS[locale];
  const labels: Record<string, string> = {
    "/business-portal": t.navOverview,
    "/business-portal/listings": t.navMyListings,
    "/business-portal/business-leads": t.navBusinessLeads,
    "/business-portal/companies": t.navCompanies,
    "/business-portal/contacts": t.navContacts,
    "/business-portal/deals": t.navDeals,
    "/business-portal/tasks": t.navTasks,
    "/business-portal/profile": t.navProfile,
  };
  return BUSINESS_NAV_ITEMS.map((item) => ({ href: item.href, label: labels[item.href] ?? item.label }));
}

// Industry is a fixed enum shared with the internal /system CRM (see
// INDUSTRY_LABELS in src/lib/labels.ts, English-only — that side isn't
// trilingual, see src/app/system/(dashboard)/settings/directory/page.tsx's
// own comment on why). The public directory needs the same 20 values in
// all three locales; "en" reuses INDUSTRY_LABELS directly rather than
// duplicating those strings a second time.
export const INDUSTRY_LABELS_BY_LOCALE: Record<DirectoryLocale, Record<Industry, string>> = {
  en: INDUSTRY_LABELS,
  zh: {
    TECHNOLOGY: "科技",
    RETAIL_ECOMMERCE: "零售与电子商务",
    HEALTHCARE: "医疗保健",
    FINANCE_BANKING: "金融与银行",
    MANUFACTURING: "制造业",
    CONSTRUCTION_REAL_ESTATE: "建筑与房地产",
    EDUCATION: "教育",
    HOSPITALITY_TOURISM: "酒店与旅游",
    PROFESSIONAL_SERVICES: "专业服务",
    MEDIA_ENTERTAINMENT: "媒体与娱乐",
    TRANSPORTATION_LOGISTICS: "运输与物流",
    AGRICULTURE: "农业",
    ENERGY_UTILITIES: "能源与公用事业",
    GOVERNMENT_NONPROFIT: "政府与非营利组织",
    TELECOMMUNICATIONS: "电信",
    AUTOMOTIVE: "汽车",
    FOOD_BEVERAGE: "餐饮",
    LEGAL: "法律",
    MARKETING_ADVERTISING: "市场营销与广告",
    OTHER: "其他",
  },
  ms: {
    TECHNOLOGY: "Teknologi",
    RETAIL_ECOMMERCE: "Runcit & E-dagang",
    HEALTHCARE: "Penjagaan Kesihatan",
    FINANCE_BANKING: "Kewangan & Perbankan",
    MANUFACTURING: "Pembuatan",
    CONSTRUCTION_REAL_ESTATE: "Pembinaan & Hartanah",
    EDUCATION: "Pendidikan",
    HOSPITALITY_TOURISM: "Hospitaliti & Pelancongan",
    PROFESSIONAL_SERVICES: "Perkhidmatan Profesional",
    MEDIA_ENTERTAINMENT: "Media & Hiburan",
    TRANSPORTATION_LOGISTICS: "Pengangkutan & Logistik",
    AGRICULTURE: "Pertanian",
    ENERGY_UTILITIES: "Tenaga & Utiliti",
    GOVERNMENT_NONPROFIT: "Kerajaan & Bukan Untung",
    TELECOMMUNICATIONS: "Telekomunikasi",
    AUTOMOTIVE: "Automotif",
    FOOD_BEVERAGE: "Makanan & Minuman",
    LEGAL: "Undang-undang",
    MARKETING_ADVERTISING: "Pemasaran & Pengiklanan",
    OTHER: "Lain-lain",
  },
};

// Same reasoning as INDUSTRY_LABELS_BY_LOCALE just above: "en" reuses
// VIDEO_CATEGORY_LABELS (src/lib/labels.ts) directly rather than duplicating
// those strings a second time.
export const VIDEO_CATEGORY_LABELS_BY_LOCALE: Record<DirectoryLocale, Record<VideoCategory, string>> = {
  en: VIDEO_CATEGORY_LABELS,
  zh: {
    OVERVIEW: "概览",
    TOUR: "导览",
    PRODUCT_SERVICE: "产品/服务",
    TESTIMONIAL: "客户评价",
    PROMOTIONAL: "宣传",
    EVENT: "活动",
    OTHER: "其他",
  },
  ms: {
    OVERVIEW: "Gambaran Keseluruhan",
    TOUR: "Lawatan",
    PRODUCT_SERVICE: "Produk/Perkhidmatan",
    TESTIMONIAL: "Testimoni",
    PROMOTIONAL: "Promosi",
    EVENT: "Acara",
    OTHER: "Lain-lain",
  },
};
