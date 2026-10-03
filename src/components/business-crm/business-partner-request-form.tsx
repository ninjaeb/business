"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { BusinessPartnerRequestFormState } from "@/app/actions/business-partners";
import { searchBusinessPartners } from "@/app/actions/business-partners";
import type { BusinessPartnerSearchResult } from "@/lib/business-partners";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PORTAL_BUSINESS_PARTNERS_STRINGS } from "@/lib/portal-business-partners-i18n";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { ListingLogo } from "@/components/directory/listing-logo";

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

export function BusinessPartnerRequestForm({
  action,
  listings,
  locale,
}: {
  action: (prevState: BusinessPartnerRequestFormState, formData: FormData) => Promise<BusinessPartnerRequestFormState>;
  listings: { id: string; companyName: string }[];
  locale: DirectoryLocale;
}) {
  const t = PORTAL_BUSINESS_PARTNERS_STRINGS[locale];
  const [state, formAction, pending] = useActionState(action, undefined);
  const [listingId, setListingId] = useState(listings[0]?.id);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessPartnerSearchResult[] | null>(null);
  const [selected, setSelected] = useState<BusinessPartnerSearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  // Guards against an earlier (slower) debounced search's result landing
  // after a newer one's — only the most recently *started* search may write
  // to `results` (same convention as AddressSearch's own searchSeq).
  const searchSeq = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const seq = ++searchSeq.current;
    // Routed through the same setTimeout every other branch uses, rather
    // than an early `setResults(null); return;` at the top of the effect
    // body — calling setState synchronously within an effect is what
    // react-hooks/set-state-in-effect flags; deferring even the "clear" case
    // keeps every state update here async relative to the effect itself.
    debounceRef.current = setTimeout(
      async () => {
        if (trimmed.length < MIN_QUERY_LENGTH || !listingId) {
          if (seq === searchSeq.current) setResults(null);
          return;
        }
        setSearching(true);
        const found = await searchBusinessPartners(trimmed, listingId);
        if (seq !== searchSeq.current) return;
        setResults(found);
        setSearching(false);
      },
      trimmed.length < MIN_QUERY_LENGTH ? 0 : SEARCH_DEBOUNCE_MS,
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, listingId]);

  return (
    <form action={formAction} className="space-y-4">
      {listings.length > 1 && (
        <FieldGroup label={t.requestFormYourListingLabel} htmlFor="listingId" required>
          <Select
            id="listingId"
            name="listingId"
            required
            value={listingId}
            onChange={(event) => {
              setListingId(event.target.value);
              setSelected(null);
            }}
          >
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.companyName}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}
      {listings.length === 1 && <input type="hidden" name="listingId" value={listings[0]?.id} />}

      <FieldGroup label={t.requestFormBusinessLabel} htmlFor="business-search" required>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="business-search"
            value={selected ? selected.companyName : query}
            onChange={(event) => {
              setSelected(null);
              setQuery(event.target.value);
            }}
            placeholder={t.requestFormSearchPlaceholder}
            autoComplete="off"
            className="pl-9"
          />
        </div>
        <input type="hidden" name="targetListingId" value={selected?.id ?? ""} />

        {searching && <p className="mt-2 text-sm text-slate-400">{t.requestFormSearching}</p>}
        {!searching && results && results.length === 0 && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t.requestFormNoMatches}</p>
        )}
        {!selected && results && results.length > 0 && (
          <ul className="mt-2 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 dark:divide-neutral-800 dark:border-neutral-800">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(result);
                    setResults(null);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-neutral-800"
                >
                  <ListingLogo name={result.companyName} logoUrl={result.logoUrl} className="h-8 w-8 shrink-0 text-sm" />
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900 dark:text-slate-100">{result.companyName}</span>
                    {result.tagline && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{result.tagline}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <Button type="submit" disabled={pending || !selected}>
        {pending ? t.requestFormSendingRequest : t.requestFormSendRequest}
      </Button>
    </form>
  );
}
