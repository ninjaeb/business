import Link from "next/link";
import { Suspense } from "react";
import { DirectoryLanguageSwitcher } from "@/components/directory/directory-language-switcher";
import { DirectoryNavMenu, type DirectoryViewer } from "@/components/directory/directory-nav-menu";
import { DirectoryTopNav } from "@/components/directory/directory-top-nav";
import { HeaderSearch } from "@/components/directory/header-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logout } from "@/app/actions/auth";
import { getSessionPayload } from "@/lib/session";
import { db } from "@/lib/db";
import { getDirectoryLocale } from "@/lib/directory-locale";
import {
  DIRECTORY_LOCALES,
  DIRECTORY_STRINGS,
  directoryBenefitsPath,
  directoryCategoriesIndexPath,
  directoryGuidesPath,
  directoryHomePath,
  directoryIndustriesIndexPath,
  directoryLocationsIndexPath,
  directoryNewsPath,
  directoryProductsPath,
  directorySignupPath,
  localizedBusinessNavItems,
  type DirectoryLocale,
} from "@/lib/directory-i18n";

// This app has a single session cookie (business_session, @/lib/session) —
// unlike the source CRM's three separate session types, there's no staff
// app here to detect a signed-in staff member for. A visitor is either
// signed in as a partner (business viewer) or not signed in at all; an
// admin session exists but isn't a "viewer" this public-facing chrome
// distinguishes.
async function getDirectoryViewer(): Promise<DirectoryViewer> {
  const session = await getSessionPayload();
  if (!session?.userId) return null;
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  return user?.role === "PARTNER" ? "business" : null;
}

// Shared by both places the switcher renders below (inline in the header at
// sm+, inside DirectoryNavMenu's dropdown below sm) — one definition of its
// useSearchParams() Suspense boundary and fallback rather than two drifting
// copies. useSearchParams() needs this (see DirectoryLanguageSwitcher's own
// comment, for preserving the query string across a language swap); the
// fallback is sized/styled the same as the real switcher so there's no
// visible flash the moment either copy first mounts.
function LocalizedLanguageSwitcher({ locale }: { locale: DirectoryLocale }) {
  return (
    <Suspense
      fallback={
        <div className="flex gap-1" aria-hidden="true">
          {DIRECTORY_LOCALES.map((option) => (
            <span key={option.code} className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {option.label}
            </span>
          ))}
        </div>
      }
    >
      <DirectoryLanguageSwitcher current={locale} />
    </Suspense>
  );
}

// The site-like header/footer (sticky nav, search box, language + theme
// switches, hamburger menu, footer tagline) shared by every public-facing
// partner page — the directory itself, its listing pages, and the two forms
// that
// sit outside it (the locale-prefixed .../signup and the bare
// /business/login) — rather than the minimal centered-card wrapper an
// internal admin form might use. A partner filling in a form should feel
// like they're on the same site the whole way through, not dropped onto a
// bare page.
export async function DirectoryChrome({
  children,
  locale: localeProp,
  forceAnonymousNav = false,
}: {
  children: React.ReactNode;
  // Every /[locale]/... directory page passes its own already-validated URL
  // segment here, so the header renders in exactly that language with no
  // extra cookie lookup. Omitted by pages outside the locale-prefixed tree
  // (currently just /business/login, which still shares this same header)
  // — those fall back to the cookie/Accept-Language guess as before.
  locale?: DirectoryLocale;
  // /business/login sets this — a page that's specifically asking someone
  // to sign in should never look like it already thinks you're signed in.
  forceAnonymousNav?: boolean;
}) {
  const [locale, viewer] = await Promise.all([
    localeProp ? Promise.resolve(localeProp) : getDirectoryLocale(),
    forceAnonymousNav ? Promise.resolve(null) : getDirectoryViewer(),
  ]);
  const t = DIRECTORY_STRINGS[locale];
  // Points into the real /[locale]/business/... tree when the current page
  // already knows its locale; otherwise the old bare /directory/* URL,
  // which now just permanently redirects there anyway (see
  // src/app/directory/page.tsx) — one extra hop only from a page like
  // /business/login that isn't part of the locale-prefixed tree itself.
  const directoryHref = localeProp ? directoryHomePath(localeProp) : "/directory";
  const signupHref = localeProp ? directorySignupPath(localeProp) : "/directory/signup";
  const benefitsHref = localeProp ? directoryBenefitsPath(localeProp) : "/directory/benefits";
  // Always built off the resolved `locale` (not localeProp) — unlike the
  // links above, these four pages have no bare-URL fallback to redirect
  // through, so even a page outside the locale-prefixed tree (e.g.
  // /business/login) still gets working links, in whatever language the
  // cookie/Accept-Language guess landed on.
  const topNavItems = [
    { href: directoryCategoriesIndexPath(locale), label: t.navAllBusiness },
    { href: directoryIndustriesIndexPath(locale), label: t.navIndustries },
    { href: directoryLocationsIndexPath(locale), label: t.navLocations },
    { href: directoryProductsPath(locale), label: t.navLatestProducts },
    { href: directoryNewsPath(locale), label: t.updatesHeading },
    { href: directoryGuidesPath(locale), label: t.navGuides },
  ];

  return (
    <div className="flex min-h-full flex-col bg-slate-50 dark:bg-neutral-950">
      {/* First focusable element on every page — invisible until it
          receives keyboard focus (Tab from a fresh page load), so a
          keyboard or screen-reader visitor can jump straight to #main-content
          instead of tabbing through every header link first. z-30: above the
          header's own sticky z-20 once focused, so it isn't drawn under it. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-30 focus:rounded-md focus:bg-petrol focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none dark:focus:bg-petrol-light dark:focus:text-petrol-ink"
      >
        {t.skipToContentLabel}
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-8">
          <Link href={directoryHref} className="flex shrink-0 items-center gap-2">
            {/* Below sm the wordmark beside it is hidden, so this alt is
                the whole link's name there; from sm up the two together
                read "Gotka Business Directory". */}
            <img src="/icon-192.png" alt="Gotka" className="h-8 w-8 shrink-0" />
            {/* "Gotka" only ever showed the wordmark, not what this page
                actually is — dropped entirely on mobile to save space
                (the icon alone is enough there), and replaced with the
                localized "Business Directory" name on wider screens. */}
            <span className="hidden text-lg font-semibold text-slate-900 dark:text-slate-100 sm:inline">
              {t.brandName}
            </span>
          </Link>
          {/* Right after the logo at every width — the header's own search
              entry point, ahead of the nav links rather than trailing them,
              so it reads as the header's second-most prominent thing after
              the brand itself. flex-1 lets it grow into whatever space the
              nav/hamburger group doesn't claim, rather than sitting at a
              fixed width that would leave dead space on a narrow screen or
              crowd the nav on a wide one — uncapped below sm, where the
              logo shrinks to just its icon and the hamburger is the only
              other thing sharing the row, so the box may as well take the
              rest of it; capped from sm up, once the wordmark and inline
              nav links are also competing for the same row. Live results as
              the visitor types, grouped into business/products & services/
              news & promotions (see HeaderSearch's own dropdown) — Enter,
              or its "see all results" link, still lands on the same
              directoryHref?q= search a plain form submit would. The
              dropdown itself (see header-search.tsx) doesn't stretch to
              match this box's own width — it's anchored to the box's left
              edge but sized independently, wide enough to stay readable
              even at a narrow width. */}
          <HeaderSearch
            locale={locale}
            t={t}
            className="min-w-0 flex-1 sm:max-w-xs lg:max-w-sm"
          />
          {/* This wrapper — not DirectoryTopNav itself — carries the ml-auto
              that pushes the nav+hamburger group flush right against the
              header's trailing edge. DirectoryTopNav is inline on lg+
              screens only (below lg its own four links live in
              DirectoryNavMenu's hamburger instead — see its own comment
              there); putting the margin on it directly would leave nothing
              to push the hamburger right once DirectoryTopNav collapses to
              `hidden` and contributes no box at all below lg. */}
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <DirectoryTopNav navLabel={t.topNavLabel} items={topNavItems} className="hidden lg:flex" />
            {/* Language + theme, inline from sm up (tablet and laptop/
                desktop both have the room) — ahead of the hamburger, same
                order they render in inside its dropdown below. Hidden below
                sm, where DirectoryNavMenu's own copy takes over instead;
                see its own comment for why that copy only shows there now. */}
            <div className="hidden items-center gap-2 sm:flex">
              <LocalizedLanguageSwitcher locale={locale} />
              <ThemeToggle className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-neutral-800 dark:hover:text-slate-100" />
            </div>
            <DirectoryNavMenu
              viewer={viewer}
              logoutAction={logout}
              loginLabel={t.navLoginRegister}
              listBusinessLabel={t.listBusinessCta}
              benefitsLabel={t.benefitsNavLabel}
              directoryLabel={t.brandName}
              myBusinessLabel={t.navMyBusiness}
              addBusinessLabel={t.navAddBusiness}
              businessNavItems={localizedBusinessNavItems(locale)}
              topNavItems={topNavItems}
              languageSwitcher={<LocalizedLanguageSwitcher locale={locale} />}
              signOutLabel={t.navSignOut}
              directoryHref={directoryHref}
              signupHref={signupHref}
              benefitsHref={benefitsHref}
            />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* pb-40, not py-8's own 32px, on this specific side: a listing page
          renders its own Services/Recommend/Get in touch bar pinned fixed to
          the viewport bottom (see the listing layout's own nav). "fixed"
          ignores scroll entirely, so once a visitor scrolls this footer into
          view — the page's own pb-40 (see the listing page) only delays
          that, it can't prevent it — that bar would otherwise sit on top of
          this footer's own links with nothing below to separate them.
          Harmless on every other page, which has no such bar and just gets
          a bit more empty space at the very bottom. */}
      <footer className="border-t border-slate-200 bg-white pt-8 pb-40 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="w-full px-4 text-center text-sm text-slate-500 dark:text-slate-400 sm:px-8">
          {/* Plain links, server-rendered: the header's hamburger menu only
              builds its links in the browser once opened, so until this
              existed the sign-up and sign-in pages had no crawlable link
              anywhere in the directory's HTML. */}
          <nav aria-label={t.stickyNavLabel} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href={directoryHref} className="hover:text-petrol hover:underline dark:hover:text-petrol-light">
              {t.brandName}
            </Link>
            <Link href={signupHref} className="hover:text-petrol hover:underline dark:hover:text-petrol-light">
              {t.listBusinessCta}
            </Link>
            <Link href={benefitsHref} className="hover:text-petrol hover:underline dark:hover:text-petrol-light">
              {t.benefitsNavLabel}
            </Link>
            <Link href="/business-portal/login" className="hover:text-petrol hover:underline dark:hover:text-petrol-light">
              {t.navLoginRegister}
            </Link>
            <a
              href="https://gotka.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-petrol hover:underline dark:text-petrol-light"
            >
              gotka.com
            </a>
          </nav>
          <p className="mt-3">{t.footerTagline}</p>
        </div>
      </footer>
    </div>
  );
}
