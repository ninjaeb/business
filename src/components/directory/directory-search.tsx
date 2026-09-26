"use client";

import { useMemo, useState } from "react";
import { Search, Handshake, X } from "lucide-react";
import { ListingCard } from "@/components/directory/listing-card";
import { ShareButton } from "@/components/directory/share-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import type { DirectoryGridListing } from "@/lib/directory";
import { normalizeSearchText } from "@/lib/directory-search";
import type { Industry } from "@/generated/prisma/client";
import type { DirectoryLocale, DirectoryStrings } from "@/lib/directory-i18n";

export function DirectorySearch({
  listings,
  industryLabels,
  categories,
  t,
  locale,
  initialQuery,
  initialIndustry,
  initialCategory,
  initialCity,
  initialState,
  initialCountry,
  directoryUrl,
  heading,
  subheading,
}: {
  listings: DirectoryGridListing[];
  industryLabels: Record<Industry, string>;
  // value stays the English category name a listing's snapshot actually
  // stores (see readPublishedSnapshot) so filtering/the URL query param
  // keep matching regardless of locale; label is that name translated for
  // display (see translateCategoryName).
  categories: { value: string; label: string }[];
  t: DirectoryStrings;
  locale: DirectoryLocale;
  initialQuery: string;
  // Set from a listing's own Industry pill (see the listing detail page) —
  // there's no dropdown to pick one from, so a plain chip with its own
  // clear button (grouped with State/Country below) is the only way back
  // to the unfiltered list.
  initialIndustry: string;
  // Set by a category page (see category-page-content.tsx), which already
  // has its own navigation back to the rest of the directory, so unlike
  // industry/city/state/country this never needs a clear button here.
  initialCategory: string;
  // Set from a listing's own City/State/Country pill (see the listing
  // detail page), or from a location page narrowing to one city+state
  // group (see location-page-content.tsx) — no dropdown for these, since
  // they're free text rather than a fixed enum like industry, but the URL
  // query param still filters the same in-memory list the same way.
  // initialCity is three-valued, unlike the plain empty-string-means-off
  // convention every other filter here uses: null disables city filtering
  // entirely (every page but a location page), "" requires a listing to
  // have no city at all (a state-only location group — see
  // countListingsByCityState — where "no filter" would wrongly also match
  // every listing that DOES have a city in that state), and any other
  // string requires an exact match.
  initialCity: string | null;
  initialState: string;
  initialCountry: string;
  directoryUrl: string;
  // A category page passes its own category-specific H1/subtitle (better
  // on-page SEO than the generic homepage copy repeated under every
  // category); the home page omits these and gets t.heroTitle/heroSubtitle.
  heading?: string;
  subheading?: string;
}) {
  // Filters entirely in the browser as the user types — no round trip, no
  // debounce needed. Safe because the whole listing set is fetched once up
  // front: a partner network is small by nature (dozens, not thousands),
  // the same reasoning the server-side filter this replaced already relied
  // on (see the page's own fetch comment).
  const [query, setQuery] = useState(initialQuery);
  // Unlike the other initial* props below (only ever set by a fresh
  // navigation from a different page — a listing's own pill, a category
  // page), initialQuery can now also change while this exact component
  // stays mounted: the header's own HeaderSearch submits a new ?q= from
  // wherever a visitor already is, including this same page. A prop change
  // alone doesn't reset useState's initial value, so without the block
  // below the address bar would update but the results and input text
  // would not. Adjusted during render rather than in an effect — React's
  // own recommended pattern for state that needs to reset when a prop
  // changes (see "Adjusting state when a prop changes" in the React docs) —
  // so the mismatched render this would otherwise briefly show never
  // happens instead of merely getting corrected a tick later.
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }
  // No dropdown for these (see the type comments above) — set once from the
  // URL a pill linked to, cleared only via the chip below.
  const [industry, setIndustry] = useState(initialIndustry);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [country, setCountry] = useState(initialCountry);
  // Never cleared from here (see the type comment above), so this doesn't
  // need to be state at all.
  const category = initialCategory;

  // Maps a listing's stored (English) category name to its translated
  // label, so free text search matches what's actually shown on screen
  // (see the categories prop comment above).
  const categoryLabelByValue = useMemo(() => new Map(categories.map((cat) => [cat.value, cat.label])), [categories]);

  const filtered = useMemo(() => {
    // Same normalization as the header dropdown (see normalizeSearchText),
    // so its "see all results" hand-off to this page finds what it found.
    const q = normalizeSearchText(query);
    return listings.filter((listing) => {
      if (industry && listing.industry !== industry) return false;
      if (category && !listing.categories.includes(category)) return false;
      if (city !== null && (listing.city ?? "") !== city) return false;
      if (state && listing.state !== state) return false;
      if (country && listing.country !== country) return false;
      if (!q) return true;
      const industryLabel = listing.industry ? industryLabels[listing.industry] : undefined;
      return (
        normalizeSearchText(listing.companyName).includes(q) ||
        normalizeSearchText(listing.description).includes(q) ||
        listing.services.some(
          (service) => normalizeSearchText(service.title).includes(q) || normalizeSearchText(service.description).includes(q),
        ) ||
        (industryLabel ? normalizeSearchText(industryLabel).includes(q) : false) ||
        listing.categories.some((cat) => normalizeSearchText(categoryLabelByValue.get(cat) ?? cat).includes(q))
      );
    });
  }, [listings, query, industry, category, city, state, country, industryLabels, categoryLabelByValue]);

  return (
    <>
      <div className="border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="w-full px-4 py-14 text-center sm:px-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">
            {heading ?? t.heroTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">{subheading ?? t.heroSubtitle}</p>
          <div className="mt-4 flex justify-center">
            <ShareButton title={heading ?? t.heroTitle} url={directoryUrl} />
          </div>

          <form onSubmit={(event) => event.preventDefault()} className="mx-auto mt-6 max-w-2xl">
            <div className="relative mx-auto w-full sm:w-4/5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-9"
              />
            </div>
          </form>

          {/* Only ever set by following a listing's own Industry/City/State/
              Country pill (see the listing detail page), or by a location
              page's own city+state narrowing — there's no dropdown for
              these, so a plain chip with its own clear button is the only
              way back to the unfiltered list. */}
          {(industry || city || state || country) && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
              {industry && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-slate-700 dark:bg-neutral-800 dark:text-slate-200">
                  {industryLabels[industry as Industry]}
                  <button
                    type="button"
                    onClick={() => setIndustry("")}
                    aria-label={`Clear ${industryLabels[industry as Industry]} filter`}
                    className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {city && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-slate-700 dark:bg-neutral-800 dark:text-slate-200">
                  {city}
                  <button
                    type="button"
                    // null, not "": clearing disables city filtering
                    // entirely (see the type comment above) — "" would
                    // instead switch to requiring no city at all, which on
                    // a real city's own chip would just hide every result.
                    onClick={() => setCity(null)}
                    aria-label={`Clear ${city} filter`}
                    className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {state && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-slate-700 dark:bg-neutral-800 dark:text-slate-200">
                  {state}
                  <button
                    type="button"
                    onClick={() => setState("")}
                    aria-label={`Clear ${state} filter`}
                    className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {country && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-slate-700 dark:bg-neutral-800 dark:text-slate-200">
                  {country}
                  <button
                    type="button"
                    onClick={() => setCountry("")}
                    aria-label={`Clear ${country} filter`}
                    className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-4 py-10 sm:px-8">
        {filtered.length === 0 ? (
          <EmptyState icon={Handshake} title={t.noResultsTitle} description={t.noResultsDescription} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.slug}
                listing={listing}
                viewLabel={t.viewListing}
                industryLabel={listing.industry ? industryLabels[listing.industry] : undefined}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
