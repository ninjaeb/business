import Link from "next/link";
import { Suspense } from "react";
import { DirectoryLanguageSwitcher } from "@/components/directory/directory-language-switcher";
import { DirectoryNavMenu, type DirectoryViewer } from "@/components/directory/directory-nav-menu";
import { DirectoryTopNav } from "@/components/directory/directory-top-nav";
import { HeaderSearch } from "@/components/directory/header-search";
import { logout } from "@/app/actions/auth";
import { getSessionPayload } from "@/lib/session";
import { db } from "@/lib/db";
import { getDirectoryLocale } from "@/lib/directory-locale";
import {
  DIRECTORY_LOCALES,
  DIRECTORY_STRINGS,
  directoryBenefitsPath,
  directoryCategoriesIndexPath,
  directoryHomePath,
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

// The site-like header/footer (sticky nav, search box, hamburger menu with
// language + theme switches tucked inside it, footer tagline) shared by
// every public-facing partner page — the directory itself, its listing
// pages, and the two forms that
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
    { href: directoryLocationsIndexPath(locale), label: t.navLocations },
    { href: directoryProductsPath(locale), label: t.navLatestProducts },
    { href: directoryNewsPath(locale), label: t.updatesHeading },
  ];

  return (
    <div className="flex min-h-full flex-col bg-slate-50 dark:bg-neutral-950">
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
          {/* Inline on lg+ screens only, right after the logo — below lg
              there's no second row for these to spill into anymore (that
              used to overflow into a cramped horizontal scroll bar of its
              own) — DirectoryNavMenu's own hamburger carries the same four
              links at that width instead. */}
          <DirectoryTopNav navLabel={t.topNavLabel} items={topNavItems} className="hidden lg:flex" />
          {/* ml-auto here (rather than on the nav above, where an earlier
              version of the header had it, and which briefly needed a
              wrapper div of its own to keep it working once DirectoryTopNav
              could collapse to hidden below lg) so the search box is what
              actually claims the header's free space: full-width between
              the logo and the hamburger below lg (nothing else on that row
              to share it with), capped to a fixed width at lg+ where the
              nav to its left already fills that space. Unlike DirectoryTopNav,
              this never collapses to hidden at any width, so it alone is
              enough to keep everything after it pushed flush right — no
              wrapper needed. */}
          <HeaderSearch
            action={directoryHref}
            placeholder={t.searchPlaceholder}
            className="ml-auto w-full max-w-[11rem] flex-1 sm:max-w-xs lg:max-w-sm"
          />
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
            languageSwitcher={
              // useSearchParams() (see directory-language-switcher.tsx, for
              // preserving the query string across a language swap)
              // requires a Suspense boundary around anything that might
              // otherwise be statically prerendered — the fallback is
              // sized/styled the same as the real switcher so there's no
              // visible flash the moment the dropdown first opens.
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
            }
            signOutLabel={t.navSignOut}
            directoryHref={directoryHref}
            signupHref={signupHref}
            benefitsHref={benefitsHref}
          />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* pb-40, not py-8's own 32px, on this specific side: a listing page
          renders two fixed-position bars pinned to the viewport bottom (the
          Services/Get in touch jump bar, and the RecommendBar pill floating
          above it — see recommend-bar.tsx) that together reach ~116px up
          from the viewport's bottom edge. "fixed" ignores scroll entirely,
          so once a visitor scrolls this footer into view — the page's own
          pb-40 (see the listing page) only delays that, it can't prevent it
          — those bars would otherwise sit on top of this footer's own links
          with nothing below to separate them. Harmless on every other page,
          which has no such bars and just gets a bit more empty space at the
          very bottom. */}
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
