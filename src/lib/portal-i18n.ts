import type { DirectoryLocale } from "@/lib/directory-i18n";

// The business portal's own chrome — sidebar/mobile-nav wordmark, the
// outbound link back to the public directory, the sidebar's "Add Business"
// shortcut, the static "My Business" group heading above the nav items
// (distinct from navMyListings in directory-i18n.ts, which is that same
// page's own nav label — these happen to read the same in English today but
// are separate copy), the sign-out action, and the page <head> metadata
// every business-portal page falls through to. Everything else in the
// portal (page bodies, CRM tools) gets its own topic-scoped *-i18n.ts file
// alongside this one, following the same type-then-one-block-per-locale
// shape as DIRECTORY_STRINGS in directory-i18n.ts.
export type PortalChromeStrings = {
  metaTitle: string;
  metaDescription: string;
  brandName: string;
  businessDirectoryLink: string;
  addBusiness: string;
  myBusinessHeading: string;
  signOut: string;
  menu: string;
};

export const PORTAL_CHROME_STRINGS: Record<DirectoryLocale, PortalChromeStrings> = {
  en: {
    metaTitle: "Business Portal",
    metaDescription: "Manage your business listings and directory leads.",
    brandName: "Business Portal",
    businessDirectoryLink: "Business Directory",
    addBusiness: "Add Business",
    myBusinessHeading: "My Business",
    signOut: "Sign out",
    menu: "Menu",
  },
  zh: {
    metaTitle: "商家门户",
    metaDescription: "管理您的商家列表和名录线索。",
    brandName: "商家门户",
    businessDirectoryLink: "商业名录",
    addBusiness: "添加商家",
    myBusinessHeading: "我的商家",
    signOut: "登出",
    menu: "菜单",
  },
  ms: {
    metaTitle: "Portal Perniagaan",
    metaDescription: "Uruskan senarai perniagaan dan petunjuk direktori anda.",
    brandName: "Portal Perniagaan",
    businessDirectoryLink: "Direktori Perniagaan",
    addBusiness: "Tambah Perniagaan",
    myBusinessHeading: "Perniagaan Saya",
    signOut: "Log keluar",
    menu: "Menu",
  },
};

export function getPortalChromeStrings(locale: DirectoryLocale): PortalChromeStrings {
  return PORTAL_CHROME_STRINGS[locale];
}
