"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Megaphone, Package, Search } from "lucide-react";
import { fetchDirectorySearchIndex } from "@/app/actions/directory";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ListingLogo } from "@/components/directory/listing-logo";
import { directoryHomePath, directoryListingPath, formatSearchViewAllResults, type DirectoryLocale, type DirectoryStrings } from "@/lib/directory-i18n";
import { searchDirectoryIndex, type DirectorySearchIndex } from "@/lib/directory-search";
import { cn } from "@/lib/utils";

// The header's own always-present search box (see directory-chrome.tsx) —
// live results as the visitor types, grouped into the same three kinds of
// content the directory holds (business, products & services, news &
// promotions), each linking straight to the listing it's on. Same
// filter-locally idea as DirectorySearch, the home page's own big hero
// search, with one difference in where the data comes from: that page has
// its listing set in hand from its own render, whereas this box renders on
// every page, so it fetches its own compact index (fetchDirectorySearchIndex)
// once, the first time the box is focused — never on page load, since most
// visitors never search — and every keystroke after that is a synchronous
// search of that index. Not a server round trip per keystroke: Server
// Actions from one page run one at a time, in order, so a query that takes
// a moment stacks up behind every earlier keystroke's query and the visitor
// waits for all of them.
export function HeaderSearch({
  locale,
  t,
  className,
}: {
  locale: DirectoryLocale;
  t: DirectoryStrings;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // Keyed by locale: the index carries that language's taglines, industry
  // and category labels, so one built for another language is no use here.
  const [index, setIndex] = useState<{ locale: DirectoryLocale; entries: DirectorySearchIndex } | null>(null);
  const [loading, startLoading] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const requestedLocaleRef = useRef<DirectoryLocale | null>(null);

  function ensureIndex() {
    if (requestedLocaleRef.current === locale) return;
    requestedLocaleRef.current = locale;
    startLoading(async () => {
      try {
        const entries = await fetchDirectorySearchIndex(locale);
        setIndex({ locale, entries });
      } catch {
        // Let the next focus try again rather than leaving the box dead for
        // the rest of the visit.
        requestedLocaleRef.current = null;
      }
    });
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
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

  function goToFullResults() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`${directoryHomePath(locale)}?q=${encodeURIComponent(trimmed)}`);
  }

  const trimmedQuery = query.trim();
  const entries = index?.locale === locale ? index.entries : null;
  // null until the index has arrived — the dropdown stays closed (just the
  // spinner in the box) rather than flashing "no results" at a visitor who
  // has simply typed faster than the first fetch.
  const results = useMemo(() => (entries && trimmedQuery ? searchDirectoryIndex(entries, trimmedQuery) : null), [entries, trimmedQuery]);
  const hasResults = results !== null && (results.businesses.length > 0 || results.products.length > 0 || results.updates.length > 0);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={query}
          onChange={(event) => {
            ensureIndex();
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            ensureIndex();
            if (trimmedQuery) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              goToFullResults();
            }
          }}
          placeholder={t.headerSearchPlaceholder}
          aria-label={t.headerSearchPlaceholder}
          className="h-9 pl-9 pr-8 text-sm"
        />
        {loading && trimmedQuery !== "" && (
          <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {open && results && (
        <div className="absolute left-0 z-30 mt-1.5 max-h-[70vh] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg sm:w-96 dark:border-neutral-700 dark:bg-neutral-900">
          {!hasResults && <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">{t.searchNoResults}</p>}

          {results.businesses.length > 0 && (
            <ResultGroup heading={t.searchSectionBusiness}>
              {results.businesses.map((hit) => (
                <Link
                  key={hit.slug}
                  href={directoryListingPath(locale, hit.slug)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-neutral-800"
                >
                  <ListingLogo name={hit.companyName} logoUrl={hit.logoUrl} size={28} loading="lazy" className="h-7 w-7 text-xs" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{hit.companyName}</span>
                    {(hit.tagline || hit.industryLabel) && (
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{hit.tagline || hit.industryLabel}</span>
                    )}
                  </span>
                </Link>
              ))}
            </ResultGroup>
          )}

          {results.products.length > 0 && (
            <ResultGroup heading={t.servicesHeading}>
              {results.products.map((hit, index) => (
                <Link
                  key={`${hit.listingSlug}-${index}`}
                  href={`${directoryListingPath(locale, hit.listingSlug)}#services`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-neutral-800"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{hit.title}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{hit.companyName}</span>
                  </span>
                </Link>
              ))}
            </ResultGroup>
          )}

          {results.updates.length > 0 && (
            <ResultGroup heading={t.updatesHeading}>
              {results.updates.map((hit, index) => (
                <Link
                  key={`${hit.listingSlug}-${index}`}
                  href={directoryListingPath(locale, hit.listingSlug)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-neutral-800"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
                    <Megaphone className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{hit.title}</span>
                    <span className="flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {hit.companyName}
                      <Badge
                        className={
                          hit.kind === "PROMOTION"
                            ? "bg-led text-led-ink ring-0"
                            : "bg-slate-100 text-slate-600 ring-0 dark:bg-neutral-800 dark:text-slate-300"
                        }
                      >
                        {hit.kind === "PROMOTION" ? t.promotionLabel : t.newsLabel}
                      </Badge>
                    </span>
                  </span>
                </Link>
              ))}
            </ResultGroup>
          )}

          {hasResults && (
            <button
              type="button"
              onClick={goToFullResults}
              className="mt-1 block w-full border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-petrol hover:bg-slate-50 dark:border-neutral-800 dark:text-petrol-light dark:hover:bg-neutral-800"
            >
              {formatSearchViewAllResults(t.searchViewAllResults, trimmedQuery)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{heading}</p>
      {children}
    </div>
  );
}
