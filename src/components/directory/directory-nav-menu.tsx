"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, Menu, Plus, Sparkles, Store, X } from "lucide-react";
import { createListingAction } from "@/app/actions/directory";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Who's currently browsing, as far as the hamburger menu cares — a signed-
// out visitor gets the sign-up funnel (Business Login, List your
// business); a signed-in business owner gets a shortcut back to their own
// portal instead of being asked to sign up again.
export type DirectoryViewer = "business" | null;

// The directory header's real destinations — sign in, start listing a
// business, or (once signed in) jump back to your own portal — tucked
// behind one hamburger button rather than sitting inline next to the
// language switcher/theme toggle. Same click-outside + Escape pattern as
// NotificationBell/ShareButton elsewhere in this app.
export function DirectoryNavMenu({
  viewer,
  logoutAction,
  loginLabel,
  listBusinessLabel,
  benefitsLabel,
  directoryLabel,
  myBusinessLabel,
  addBusinessLabel,
  businessNavItems,
  topNavItems,
  languageSwitcher,
  signOutLabel,
  directoryHref,
  signupHref,
  benefitsHref,
}: {
  viewer: DirectoryViewer;
  logoutAction: () => void | Promise<void>;
  loginLabel: string;
  listBusinessLabel: string;
  benefitsLabel: string;
  directoryLabel: string;
  myBusinessLabel: string;
  addBusinessLabel: string;
  // Already localized to whatever language this menu is currently showing
  // (see localizedBusinessNavItems in directory-i18n.ts) — unlike
  // PartnerNavMenu/PartnerSidebar, which import BUSINESS_NAV_ITEMS directly
  // and stay English, matching the rest of the (English-only) portal.
  businessNavItems: { href: string; label: string }[];
  // The same four items DirectoryTopNav renders inline at lg+ (categories,
  // locations, latest products, news & promotions) — see this component's
  // own lg:hidden wrapper below for why they're repeated here rather than
  // just left to that inline nav: below lg there's no second row for them
  // to live in anymore, so the hamburger is their only way in at that width.
  topNavItems: { href: string; label: string }[];
  // Rendered as-is, already wrapped in whatever Suspense boundary
  // useSearchParams() needs (see directory-chrome.tsx) — DirectoryNavMenu
  // itself has no reason to know that requirement, only to place the
  // result next to ThemeToggle at the bottom of the dropdown, where both
  // used to sit inline in the header before there was no longer room for
  // them there either (see DirectoryTopNav's own move into this same menu).
  languageSwitcher: React.ReactNode;
  signOutLabel: string;
  // Locale-aware (see directory-chrome.tsx) — never a bare "/directory" or
  // "/directory/signup" here, so a click from within the locale-prefixed
  // tree stays in that same language instead of round-tripping through the
  // old bare URL's redirect.
  directoryHref: string;
  signupHref: string;
  benefitsHref: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const itemClasses =
    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-neutral-800";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-slate-100"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {/* Same directoryLabel/Store combination both viewer states used
              to render separately — this is the state that link was
              missing from: a visitor browsing an outside-the-shell page
              like /directory/signup or /business-portal/login had no way
              back into the directory itself. */}
          <Link href={directoryHref} role="menuitem" onClick={() => setOpen(false)} className={itemClasses}>
            <Store className="h-4 w-4 shrink-0 text-slate-400" />
            {directoryLabel}
          </Link>
          {/* Only below lg: at lg+ these same four destinations already
              show inline next to the logo (DirectoryTopNav), so repeating
              them here too would just be a redundant second copy for a
              visitor who can already see them. */}
          <div className="lg:hidden">
            {topNavItems.map((item) => (
              <Link key={item.href} href={item.href} role="menuitem" onClick={() => setOpen(false)} className={itemClasses}>
                {item.label}
              </Link>
            ))}
          </div>
          {viewer === null && (
            <>
              <Link href="/business-portal/login" role="menuitem" onClick={() => setOpen(false)} className={itemClasses}>
                <LogIn className="h-4 w-4 shrink-0 text-slate-400" />
                {loginLabel}
              </Link>
              <Link href={signupHref} role="menuitem" onClick={() => setOpen(false)} className={itemClasses}>
                <Store className="h-4 w-4 shrink-0 text-slate-400" />
                {listBusinessLabel}
              </Link>
              <Link href={benefitsHref} role="menuitem" onClick={() => setOpen(false)} className={itemClasses}>
                <Sparkles className="h-4 w-4 shrink-0 text-slate-400" />
                {benefitsLabel}
              </Link>
            </>
          )}
          {viewer === "business" && (
            <>
              <form action={createListingAction}>
                <button type="submit" role="menuitem" className={itemClasses}>
                  <Plus className="h-4 w-4 shrink-0 text-slate-400" />
                  {addBusinessLabel}
                </button>
              </form>
              <div className="border-t border-slate-100 px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-neutral-800 dark:text-slate-500">
                {myBusinessLabel}
              </div>
              {businessNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(itemClasses, "pl-5")}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
          {viewer !== null && (
            <form action={logoutAction}>
              <button type="submit" role="menuitem" className={itemClasses}>
                <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
                {signOutLabel}
              </button>
            </form>
          )}
          {/* Language + theme, moved here from the header row they used to
              sit in inline next to this same hamburger button — freeing
              that space up for the header's own search box. Not menuitems:
              neither navigates or closes the menu on click (switching
              language re-renders this same open menu in the new language;
              toggling theme is a preference flip a visitor might want to
              try more than once in a row), so this row is excluded from
              the role="menu" semantics above it. */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 pb-1 pt-2 dark:border-neutral-800">
            {languageSwitcher}
            <ThemeToggle className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-neutral-800 dark:hover:text-slate-100" />
          </div>
        </div>
      )}
    </div>
  );
}
