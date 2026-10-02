import Link from "next/link";
import { Suspense } from "react";
import { DirectoryLanguageSwitcher } from "@/components/directory/directory-language-switcher";
import { DirectoryNavMenu, type DirectoryViewer } from "@/components/directory/directory-nav-menu";
import { DirectoryTopNav } from "@/components/directory/directory-top-nav";
import { FloatingWhatsAppButton } from "@/components/directory/floating-whatsapp-button";
import { HeaderSearch } from "@/components/directory/header-search";
import { FacebookIcon, LinkedInIcon } from "@/components/directory/social-icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logout } from "@/app/actions/auth";
import { getSessionPayload } from "@/lib/session";
import { db } from "@/lib/db";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_SAME_AS } from "@/lib/directory-seo";
import {
  DIRECTORY_LOCALES,
  DIRECTORY_STRINGS,
  directoryAboutPath,
  directoryBenefitsPath,
  directoryCategoriesIndexPath,
  directoryContactPath,
  directoryEditorialPolicyPath,
  directoryGuidesPath,
  directoryHomePath,
  directoryIndustriesIndexPath,
  directoryLocationsIndexPath,
  directoryNewsPath,
  directoryPrivacyPath,
  directoryProductsPath,
  directorySignupPath,
  directoryTermsPath,
  formatFooterCopyright,
  localizedBusinessNavItems,
  type DirectoryLocale,
} from "@/lib/directory-i18n";

// gotka.com's own real social icons (see social-icons.tsx) — mapped by the
// same `label` DIRECTORY_SAME_AS already carries, so adding a third profile
// there later just shows no icon here rather than breaking.
const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook: FacebookIcon,
  LinkedIn: LinkedInIcon,
};

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
  const aboutHref = localeProp ? directoryAboutPath(localeProp) : "/directory/about";
  // Never existed at a bare pre-locale-prefix URL (unlike the four above),
  // so there's no old /directory/* link to preserve — built straight off
  // the resolved `locale`, same as topNavItems below.
  const contactHref = directoryContactPath(locale);
  const privacyHref = directoryPrivacyPath(locale);
  const termsHref = directoryTermsPath(locale);
  const editorialPolicyHref = directoryEditorialPolicyPath(locale);
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
  // The header's own nav row/hamburger — unlike topNavItems above (still
  // used as-is for the footer's "Explore" column) — drops the Industries and
  // Location links and repoints "All Business" out to gotka.com's own
  // business section instead of this directory's own category index; the
  // other three links keep their normal localized destinations.
  const headerTopNavItems = [
    { href: "https://business.gotka.com/en", label: t.navAllBusiness },
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
            <DirectoryTopNav navLabel={t.topNavLabel} items={headerTopNavItems} className="hidden lg:flex" />
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
              topNavItems={headerTopNavItems}
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

      {/* pb-40, not py-12's own padding, on this specific side: a listing
          page renders two fixed-position bars pinned to the viewport bottom
          (the Services/Get in touch jump bar, and the RecommendBar pill
          floating above it — see recommend-bar.tsx) that together reach
          ~144px up from the viewport's bottom edge. "fixed" ignores scroll
          entirely, so once a visitor scrolls this footer into view — the
          page's own pb-40 (see the listing page) only delays that, it can't
          prevent it — those bars would otherwise sit on top of this
          footer's own links with nothing below to separate them. Harmless
          on every other page, which has no such bars and just gets a bit
          more empty space at the very bottom.

          Dark navy (bg-petrol-ink) rather than this app's usual light
          surfaces — matches gotka.com's own real footer exactly (same
          column headings, same logo/tagline/social-icons corner, same
          bottom bar), which this directory's footer otherwise had nothing
          in common with. Content is the directory's own, though: gotka.com's
          footer links to ITS OWN services (hosting, domains, ...), which
          don't exist here. */}
      <footer className="bg-petrol-ink pt-12 pb-40 text-slate-300">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Link href={directoryHref} className="flex items-center gap-2">
                <img src="/icon-192.png" alt="" className="h-8 w-8 shrink-0" />
                <span className="text-lg font-semibold text-white">{t.brandName}</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-slate-400">{t.footerTagline}</p>
              {/* Real, crawlable links to the same profiles the Organization
                  JSON-LD's own sameAs already names — see DIRECTORY_SAME_AS's
                  own comment for why a link inside a JSON-LD script tag
                  isn't enough on its own. */}
              <div className="mt-4 flex gap-2">
                {DIRECTORY_SAME_AS.map((profile) => {
                  const Icon = SOCIAL_ICONS[profile.label];
                  return (
                    <a
                      key={profile.url}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={profile.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-white/30 hover:text-white"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t.footerDirectoryHeading}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href={directoryHref} className="hover:text-white">
                    {t.brandName}
                  </Link>
                </li>
                <li>
                  <Link href={signupHref} className="hover:text-white">
                    {t.listBusinessCta}
                  </Link>
                </li>
                <li>
                  <Link href={benefitsHref} className="hover:text-white">
                    {t.benefitsNavLabel}
                  </Link>
                </li>
                <li>
                  <Link href={aboutHref} className="hover:text-white">
                    {t.aboutNavLabel}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t.footerExploreHeading}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {topNavItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t.footerLegalHeading}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href={privacyHref} className="hover:text-white">
                    {t.privacyNavLabel}
                  </Link>
                </li>
                <li>
                  <Link href={termsHref} className="hover:text-white">
                    {t.termsNavLabel}
                  </Link>
                </li>
                <li>
                  <Link href={editorialPolicyHref} className="hover:text-white">
                    {t.editorialPolicyNavLabel}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t.footerContactHeading}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href={contactHref} className="hover:text-white">
                    {t.contactNavLabel}
                  </Link>
                </li>
                <li>
                  <Link href="/business-portal/login" className="hover:text-white">
                    {t.navLoginRegister}
                  </Link>
                </li>
                <li>
                  <a href="https://gotka.com" target="_blank" rel="noopener noreferrer nofollow" className="hover:text-white">
                    gotka.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
            {formatFooterCopyright(t.footerCopyright, new Date().getFullYear())}
          </div>
        </div>
      </footer>
      <FloatingWhatsAppButton locale={locale} />
    </div>
  );
}
