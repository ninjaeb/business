import type { DirectoryLocale } from "@/lib/directory-i18n";

// Business portal — Dashboard + Profile + Login module. Same shape as every
// other topic-scoped *-i18n.ts file (see portal-i18n.ts's own comment for
// why this isn't folded into DIRECTORY_STRINGS): one flat type, one
// Record<DirectoryLocale, ...> block per locale, small Record<code, string>
// maps for the handful of places that return an error *code* rather than
// ready-made text (Google OAuth callback query param, businessLogin's own
// validation failures).
export type PortalDashboardStrings = {
  // --- Dashboard home (business-portal/(dashboard)/page.tsx) ---------------
  // {name} replaced via formatDashboardWelcome below.
  dashboardWelcome: string;
  dashboardSubheading: string;
  statNewLeads: string;
  statOpen: string;
  statConverted: string;
  statConvertedValue: string;
  statReferred: string;
  statReferredDescription: string;
  myBusinessCardHeading: string;
  newBusinessCta: string;
  noListingsTitle: string;
  noListingsDescription: string;
  editListingCta: string;
  viewPublicListingCta: string;
  // "Manage listings" link under the listings grid.
  manageListingsCta: string;
  referredBusinessesHeading: string;
  noReferralsTitle: string;
  noReferralsDescription: string;
  // Label on the ShareButton next to each referred business.
  shareYourLinkLabel: string;
  wonValueNotSharedLabel: string;

  // --- Profile page (business-portal/(dashboard)/profile/page.tsx) --------
  profileHeading: string;
  profileDescription: string;
  profileIncompleteNotice: string;
  accountDetailsHeading: string;
  changePasswordCardHeading: string;

  // --- PartnerProfileForm ---------------------------------------------------
  nameLabel: string;
  companyNameLabel: string;
  emailLabel: string;
  emailHint: string;
  titleLabel: string;
  phoneLabel: string;
  // Full combined hint — written as its own complete sentence per locale
  // (same approach as DirectoryStrings.formPhoneHint) rather than splicing
  // a translated suffix onto lib/phone.ts's English-only PHONE_FORMAT_HINT
  // constant, which would leave zh/ms readers with a half-English hint.
  phoneHint: string;
  timezoneLabel: string;
  timezoneSelectPlaceholder: string;
  timezoneHint: string;
  currencyLabel: string;
  currencyHint: string;
  saveCta: string;
  savingCta: string;
  profileUpdatedToast: string;

  // --- ChangePasswordForm ---------------------------------------------------
  currentPasswordLabel: string;
  newPasswordLabel: string;
  updatePasswordCta: string;
  updatingPasswordCta: string;
  passwordUpdatedToast: string;

  // --- Login page metadata + Google OAuth error banner --------------------
  loginTitle: string;
  loginDescription: string;
  // Shared OG/Twitter siteName — same brand name DirectoryStrings.brandName
  // uses for the public directory, kept here as its own copy since this
  // page's metadata doesn't otherwise touch directory-i18n.ts.
  loginSiteName: string;
  googleErrors: Record<PortalGoogleLoginErrorCode, string>;
  // Shown when ?error= on the login URL carries a code not in googleErrors.
  googleErrorFallback: string;

  // --- businessLogin server action (src/app/actions/auth.ts) --------------
  loginErrors: Record<PortalLoginErrorCode, string>;

  // --- BusinessLoginForm -----------------------------------------------------
  loginHeading: string;
  loginSubheading: string;
  continueWithGoogle: string;
  orDivider: string;
  loginEmailLabel: string;
  loginPasswordLabel: string;
  signInCta: string;
  signingInCta: string;
  newBusinessPrompt: string;
  createAccountLink: string;
};

// The business-portal login's own Google OAuth callback (?error=<code> on
// /business-portal/login, set by /api/auth/google) — mirrors
// GOOGLE_ERROR_MESSAGES' keys in login/page.tsx.
export type PortalGoogleLoginErrorCode = "google_unavailable" | "google_failed" | "email_unverified" | "wrong_role";

// businessLogin's own validation/credential failures (src/app/actions/auth.ts)
// — this form posts straight to that action rather than going through a
// DirectoryLeadFormErrorCode-style code already defined elsewhere, so it
// gets its own small code type here instead.
export type PortalLoginErrorCode = "invalid_email" | "password_required" | "invalid_input" | "invalid_credentials";

export const PORTAL_DASHBOARD_STRINGS: Record<DirectoryLocale, PortalDashboardStrings> = {
  en: {
    dashboardWelcome: "Welcome, {name}",
    dashboardSubheading: "Your listings and directory leads at a glance.",
    statNewLeads: "New leads",
    statOpen: "Open",
    statConverted: "Converted",
    statConvertedValue: "Converted value",
    statReferred: "Referred",
    statReferredDescription: "Via your Recommend link",
    myBusinessCardHeading: "My Business",
    newBusinessCta: "New Business",
    noListingsTitle: "No listings yet",
    noListingsDescription: "Create your first listing to get your business on the public directory.",
    editListingCta: "Edit",
    viewPublicListingCta: "View public listing",
    manageListingsCta: "Manage listings",
    referredBusinessesHeading: "Businesses You've Referred",
    noReferralsTitle: "No referrals yet",
    noReferralsDescription:
      "Open any business's public page and click Recommend Business to start tracking what your own link brings in.",
    shareYourLinkLabel: "Share your link",
    wonValueNotSharedLabel: "Won value not shared by this business",

    profileHeading: "Profile",
    profileDescription: "Your own login — name, email, contact phone, and password.",
    profileIncompleteNotice:
      "Name, company name, and contact phone are all required before you can use the rest of the dashboard — fill these in and save to continue.",
    accountDetailsHeading: "Account details",
    changePasswordCardHeading: "Change your password",

    nameLabel: "Name",
    companyNameLabel: "Company name",
    emailLabel: "Email",
    emailHint: "Used to sign in, and where nothing else applies.",
    titleLabel: "Title",
    phoneLabel: "Contact phone",
    phoneHint:
      "Include the country code with a + sign, e.g. +60 12 345 6789. Used to WhatsApp you when a directory inquiry comes in — never shown on your public listing, and never given to visitors.",
    timezoneLabel: "Timezone",
    timezoneSelectPlaceholder: "Select a timezone…",
    timezoneHint:
      "Detected from your browser — correct it if you're somewhere else. Used to show visitors whether your listings are open right now.",
    currencyLabel: "Currency",
    currencyHint: "Guessed from your browser — correct it if you bill in something else. Used for deal and lead values across your CRM.",
    saveCta: "Save",
    savingCta: "Saving…",
    profileUpdatedToast: "Profile updated.",

    currentPasswordLabel: "Current password",
    newPasswordLabel: "New password",
    updatePasswordCta: "Update password",
    updatingPasswordCta: "Updating…",
    passwordUpdatedToast: "Password updated.",

    loginTitle: "Sign In | Business Directory",
    loginDescription: "Sign in to manage your business listing and directory leads.",
    loginSiteName: "Business Directory",
    googleErrors: {
      google_unavailable: "Google sign-in is not available right now.",
      google_failed: "Google sign-in failed. Please try again.",
      email_unverified: "That Google account's email address isn't verified.",
      wrong_role: "That Google account belongs to an admin account. Sign in with your email and password instead.",
    },
    googleErrorFallback: "Sign-in failed. Please try again.",

    loginErrors: {
      invalid_email: "Enter a valid email address",
      password_required: "Password is required",
      invalid_input: "Invalid input",
      invalid_credentials: "Invalid email or password",
    },

    loginHeading: "Sign in to your business",
    loginSubheading: "Manage your listing and directory leads.",
    continueWithGoogle: "Continue with Google",
    orDivider: "or",
    loginEmailLabel: "Email",
    loginPasswordLabel: "Password",
    signInCta: "Sign in",
    signingInCta: "Signing in…",
    newBusinessPrompt: "New business?",
    createAccountLink: "Create an account",
  },
  zh: {
    dashboardWelcome: "欢迎，{name}",
    dashboardSubheading: "一目了然地查看您的商家列表与名录线索。",
    statNewLeads: "新线索",
    statOpen: "处理中",
    statConverted: "已转化",
    statConvertedValue: "转化金额",
    statReferred: "推荐线索",
    statReferredDescription: "通过您的推荐链接",
    myBusinessCardHeading: "我的商家",
    newBusinessCta: "新增商家",
    noListingsTitle: "暂无商家列表",
    noListingsDescription: "创建您的第一个商家列表，让您的企业出现在公开名录中。",
    editListingCta: "编辑",
    viewPublicListingCta: "查看公开列表",
    manageListingsCta: "管理商家列表",
    referredBusinessesHeading: "您推荐的商家",
    noReferralsTitle: "暂无推荐记录",
    noReferralsDescription: "打开任意商家的公开主页，点击「推荐企业」，即可开始追踪您专属链接带来的成效。",
    shareYourLinkLabel: "分享您的链接",
    wonValueNotSharedLabel: "该商家尚未公开成交金额",

    profileHeading: "个人资料",
    profileDescription: "您自己的登录信息——姓名、电子邮箱、联系电话与密码。",
    profileIncompleteNotice: "在使用仪表盘其他功能之前，您需先填写姓名、公司名称与联系电话——请填写并保存以继续。",
    accountDetailsHeading: "账户详情",
    changePasswordCardHeading: "修改密码",

    nameLabel: "姓名",
    companyNameLabel: "公司名称",
    emailLabel: "电子邮箱",
    emailHint: "用于登录，以及在没有其他联系方式时使用。",
    titleLabel: "职位",
    phoneLabel: "联系电话",
    phoneHint:
      "请附上国家代码及 + 号，例如 +60 12 345 6789。用于在收到名录咨询时通过 WhatsApp 联系您——不会显示在您的公开列表上，也绝不会提供给访客。",
    timezoneLabel: "时区",
    timezoneSelectPlaceholder: "选择时区…",
    timezoneHint: "系统已根据您的浏览器自动检测——如您身处其他地区，请自行更正。用于向访客显示您的商家目前是否营业。",
    currencyLabel: "货币",
    currencyHint: "系统已根据您的浏览器自动推测——如您以其他货币结算，请自行更正。此设置将用于您 CRM 中的商机与线索金额。",
    saveCta: "保存",
    savingCta: "保存中…",
    profileUpdatedToast: "资料已更新。",

    currentPasswordLabel: "当前密码",
    newPasswordLabel: "新密码",
    updatePasswordCta: "更新密码",
    updatingPasswordCta: "更新中…",
    passwordUpdatedToast: "密码已更新。",

    loginTitle: "登录 | 企业目录",
    loginDescription: "登录以管理您的商家列表与名录线索。",
    loginSiteName: "企业目录",
    googleErrors: {
      google_unavailable: "Google 登录目前不可用。",
      google_failed: "Google 登录失败，请重试。",
      email_unverified: "该 Google 账户的电子邮箱尚未通过验证。",
      wrong_role: "该 Google 账户已关联管理员账户，请改用电子邮箱和密码登录。",
    },
    googleErrorFallback: "登录失败，请重试。",

    loginErrors: {
      invalid_email: "请输入有效的电子邮箱地址",
      password_required: "请输入密码",
      invalid_input: "输入无效",
      invalid_credentials: "电子邮箱或密码不正确",
    },

    loginHeading: "登录您的商家账户",
    loginSubheading: "管理您的商家列表与名录线索。",
    continueWithGoogle: "使用 Google 继续",
    orDivider: "或",
    loginEmailLabel: "电子邮箱",
    loginPasswordLabel: "密码",
    signInCta: "登录",
    signingInCta: "登录中…",
    newBusinessPrompt: "还不是商家？",
    createAccountLink: "创建账户",
  },
  ms: {
    dashboardWelcome: "Selamat datang, {name}",
    dashboardSubheading: "Senarai perniagaan dan petunjuk direktori anda, sepintas lalu.",
    statNewLeads: "Petunjuk Baharu",
    statOpen: "Terbuka",
    statConverted: "Ditukar",
    statConvertedValue: "Nilai Ditukar",
    statReferred: "Dirujuk",
    statReferredDescription: "Melalui pautan Cadangkan anda",
    myBusinessCardHeading: "Perniagaan Saya",
    newBusinessCta: "Perniagaan Baharu",
    noListingsTitle: "Belum ada penyenaraian",
    noListingsDescription: "Cipta penyenaraian pertama anda untuk memaparkan perniagaan anda di direktori awam.",
    editListingCta: "Sunting",
    viewPublicListingCta: "Lihat penyenaraian awam",
    manageListingsCta: "Uruskan penyenaraian",
    referredBusinessesHeading: "Perniagaan yang Anda Rujuk",
    noReferralsTitle: "Belum ada rujukan",
    noReferralsDescription:
      "Buka halaman awam mana-mana perniagaan dan klik Cadangkan Perniagaan untuk mula menjejaki hasil pautan anda sendiri.",
    shareYourLinkLabel: "Kongsi pautan anda",
    wonValueNotSharedLabel: "Nilai kemenangan tidak dikongsi oleh perniagaan ini",

    profileHeading: "Profil",
    profileDescription: "Log masuk anda sendiri — nama, e-mel, nombor telefon dan kata laluan.",
    profileIncompleteNotice:
      "Nama, nama syarikat dan nombor telefon diperlukan sebelum anda boleh menggunakan bahagian lain papan pemuka ini — lengkapkan dan simpan untuk meneruskan.",
    accountDetailsHeading: "Butiran Akaun",
    changePasswordCardHeading: "Tukar Kata Laluan Anda",

    nameLabel: "Nama",
    companyNameLabel: "Nama Syarikat",
    emailLabel: "E-mel",
    emailHint: "Digunakan untuk log masuk, dan apabila tiada maklumat lain berkenaan.",
    titleLabel: "Jawatan",
    phoneLabel: "Nombor Telefon",
    phoneHint:
      "Sertakan kod negara dengan tanda +, contohnya +60 12 345 6789. Digunakan untuk menghubungi anda melalui WhatsApp apabila terdapat pertanyaan daripada direktori — tidak dipaparkan pada penyenaraian awam anda, dan tidak akan diberikan kepada pelawat.",
    timezoneLabel: "Zon Waktu",
    timezoneSelectPlaceholder: "Pilih zon waktu…",
    timezoneHint:
      "Dikesan daripada pelayar anda — betulkan jika anda berada di tempat lain. Digunakan untuk menunjukkan kepada pelawat sama ada penyenaraian anda sedang dibuka sekarang.",
    currencyLabel: "Mata Wang",
    currencyHint:
      "Dianggarkan daripada pelayar anda — betulkan jika anda mengebil dalam mata wang lain. Digunakan untuk nilai urus niaga dan petunjuk di seluruh CRM anda.",
    saveCta: "Simpan",
    savingCta: "Menyimpan…",
    profileUpdatedToast: "Profil telah dikemas kini.",

    currentPasswordLabel: "Kata Laluan Semasa",
    newPasswordLabel: "Kata Laluan Baharu",
    updatePasswordCta: "Kemas Kini Kata Laluan",
    updatingPasswordCta: "Mengemas kini…",
    passwordUpdatedToast: "Kata laluan telah dikemas kini.",

    loginTitle: "Log Masuk | Direktori Perniagaan",
    loginDescription: "Log masuk untuk menguruskan penyenaraian perniagaan dan petunjuk direktori anda.",
    loginSiteName: "Direktori Perniagaan",
    googleErrors: {
      google_unavailable: "Log masuk Google tidak tersedia buat masa ini.",
      google_failed: "Log masuk Google gagal. Sila cuba lagi.",
      email_unverified: "Alamat e-mel akaun Google tersebut belum disahkan.",
      wrong_role: "Akaun Google tersebut dikaitkan dengan akaun pentadbir. Sila log masuk menggunakan e-mel dan kata laluan anda.",
    },
    googleErrorFallback: "Log masuk gagal. Sila cuba lagi.",

    loginErrors: {
      invalid_email: "Sila masukkan alamat e-mel yang sah",
      password_required: "Kata laluan diperlukan",
      invalid_input: "Input tidak sah",
      invalid_credentials: "E-mel atau kata laluan tidak sah",
    },

    loginHeading: "Log masuk ke perniagaan anda",
    loginSubheading: "Uruskan penyenaraian dan petunjuk direktori anda.",
    continueWithGoogle: "Teruskan dengan Google",
    orDivider: "atau",
    loginEmailLabel: "E-mel",
    loginPasswordLabel: "Kata Laluan",
    signInCta: "Log Masuk",
    signingInCta: "Sedang log masuk…",
    newBusinessPrompt: "Perniagaan baharu?",
    createAccountLink: "Cipta akaun",
  },
};

export function getPortalDashboardStrings(locale: DirectoryLocale): PortalDashboardStrings {
  return PORTAL_DASHBOARD_STRINGS[locale];
}

// Fills in PortalDashboardStrings.dashboardWelcome's {name} token.
export function formatDashboardWelcome(template: string, name: string): string {
  return template.replace("{name}", name);
}

// The listings grid's own "N listing(s)" summary line — plural-aware for
// English, kept as its own function for the same reason as
// directory-i18n.ts's formatViewsLabel: it branches on count, and this
// object gets read straight from a Server Component (no "use client"
// involved here), but is kept alongside the other formatters in this file
// for discoverability.
export function formatListingsCountLabel(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `${count} 个商家列表`;
  if (locale === "ms") return `${count} penyenaraian`;
  return count === 1 ? "1 listing" : `${count} listings`;
}

// The same line's optional "· N live on the public directory" suffix —
// only appended when at least one listing is actually published.
export function formatLiveOnDirectoryLabel(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `${count} 个已上线至公开名录`;
  if (locale === "ms") return `${count} aktif di direktori awam`;
  return `${count} live on the public directory`;
}

// A referred business's own lead count — plural-aware, same reasoning as
// formatListingsCountLabel above.
export function formatLeadsCountLabel(count: number, locale: DirectoryLocale): string {
  if (locale === "zh") return `${count} 条线索`;
  if (locale === "ms") return `${count} petunjuk`;
  return count === 1 ? "1 lead" : `${count} leads`;
}

// "{amount} won" — amount arrives already formatted (see formatCurrencyExact
// in src/lib/format.ts), so this only supplies the surrounding words.
export function formatWonValueLabel(amount: string, locale: DirectoryLocale): string {
  if (locale === "zh") return `已赢得 ${amount}`;
  if (locale === "ms") return `${amount} dimenangi`;
  return `${amount} won`;
}
