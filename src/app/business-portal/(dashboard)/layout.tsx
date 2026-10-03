import type { Metadata } from "next";
import Link from "next/link";
import { requirePartner } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";
import { getSiteOrigin } from "@/lib/site-url";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DirectoryLanguageSwitcher } from "@/components/directory/directory-language-switcher";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PartnerNavMenu } from "@/components/portal/partner-nav";
import { PartnerSidebar } from "@/components/portal/partner-sidebar";

const TITLE = "Business Portal";
const DESCRIPTION = "Manage your business listings and directory leads.";

// None of these pages set their own metadata, so this is what every one of
// them — Listings, Leads, Profile — shows in a browser tab/share preview
// instead of falling through to the root layout's generic title. robots
// noindex since everything past it requires requirePartner, so there's
// nothing here a search engine should ever list.
export async function generateMetadata(): Promise<Metadata> {
  const siteOrigin = await getSiteOrigin();
  const imageUrl = `${siteOrigin}/icon-192.png`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    robots: { index: false, follow: false },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: "Business Directory",
      type: "website",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary",
      title: TITLE,
      description: DESCRIPTION,
      images: [imageUrl],
    },
  };
}

// The business portal's own shell: PartnerSidebar is a persistent rail from
// `sm` up, PartnerNavMenu's hamburger takes over below it, in its own
// header here matching the public directory's own header (see
// src/components/directory/directory-chrome.tsx) — sticky, same icon+
// wordmark treatment, same language switcher + theme toggle + hamburger
// row — since a business owner moves between the two and the chrome should
// feel continuous there.
export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [, locale] = await Promise.all([requirePartner(), getDirectoryLocale()]);

  return (
    <div className="flex h-full min-h-full">
      <PartnerSidebar signOutAction={logout} locale={locale} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* z-50, not z-20: PartnerNavMenu's dropdown is a normal descendant
            of this header (no portal), so it only stacks as high as the
            header's own global z-index — a fixed bottom toast rendered
            later in the DOM (e.g. MyBusinessListingsGrid's publish-status
            bar, z-30) would otherwise paint over an open dropdown despite
            the dropdown's own z-30. See directory-chrome.tsx's own header
            for the same fix on the public side. */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 sm:hidden">
          <div className="flex w-full items-center gap-3 px-4 py-3">
            <Link href="/business-portal" className="flex shrink-0 items-center gap-2">
              {/* Below sm the wordmark beside it is hidden, so this alt is
                  the whole link's name there — same treatment as the public
                  directory's own header (directory-chrome.tsx). Without it,
                  "Business Portal" plus the language switcher/theme/menu
                  group don't fit in one row on a narrow phone and overflow
                  the viewport. */}
              <img src="/icon-192.png" alt="Business Portal" className="h-8 w-8 shrink-0" />
              <span className="hidden text-lg font-semibold text-slate-900 dark:text-slate-100 sm:inline">
                Business Portal
              </span>
            </Link>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <DirectoryLanguageSwitcher current={locale} />
              <ThemeToggle />
              <PartnerNavMenu signOutAction={logout} locale={locale} />
            </div>
          </div>
        </header>
        <div className="hidden items-center justify-end gap-1 border-b border-slate-200 bg-white px-8 py-2.5 dark:border-neutral-800 dark:bg-neutral-900 sm:flex">
          <DirectoryLanguageSwitcher current={locale} />
          <ThemeToggle />
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
