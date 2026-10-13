"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, MapPin, Sparkles } from "lucide-react";
import {
  autoCreateListingDetails,
  searchBusinessOnGoogleMaps,
  type AutoCreatedListingDetails,
} from "@/app/actions/directory";
import type { PlaceSearchResult } from "@/lib/google-places";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { formatAiAutoCreateToast, PORTAL_AI_AUTO_CREATE_STRINGS } from "@/lib/portal-listing-dialogs-i18n";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Label } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

const SEARCH_DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 2;

function StepLabel({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-petrol text-[11px] font-semibold text-white dark:bg-petrol-light dark:text-petrol-ink">
        {step}
      </span>
      <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{children}</span>
    </div>
  );
}

// The "AI Auto Business Details Creation" section at the top of the
// listing editor — only ever rendered by the form when aiAvailable is true
// (see partner-listing-form.tsx, which renders a bare Website field in its
// place otherwise). Owns the Website field itself, since this is where it
// gets filled in from: find the business on Google Maps (which fills
// Website straight away), then one click drafts the rest of the listing
// from that listing and the website. The form itself owns every field this
// writes into — this component only reports back through the callbacks, so
// it never has to know how the form stores its state.
export function AiAutoCreatePanel({
  listingId,
  placesAvailable,
  defaultQuery,
  website,
  onWebsiteChange,
  getContext,
  onCreated,
  formId,
  onTranslate,
  translating,
  locale,
}: {
  // Passed straight through to autoCreateListingDetails, which writes
  // Google's own rating/ratingCount directly to this listing's row — see
  // that action's own comment on why that one part doesn't ride the
  // AutoCreatedListingDetails/onCreated review flow every other field here
  // does.
  listingId: string;
  placesAvailable: boolean;
  defaultQuery: string;
  website: string;
  onWebsiteChange: (website: string) => void;
  getContext: () => { companyName: string };
  onCreated: (details: AutoCreatedListingDetails) => void;
  // Id of the listing form this panel's Website field submits with — needed
  // because this panel now renders as a sibling of that <form> (to sit
  // beside Public URL in the editor's first row), not a descendant of it.
  formId: string;
  // The language tabs' own "Translate with AI" trigger (see
  // partner-listing-form.tsx's handleTranslate) — passed in rather than
  // duplicated here, so AI Auto Translate below is a second entry point to
  // the exact same action/state, not a second implementation of it.
  onTranslate: () => void;
  translating: boolean;
  locale: DirectoryLocale;
}) {
  const t = PORTAL_AI_AUTO_CREATE_STRINGS[locale];
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null);
  const [selected, setSelected] = useState<PlaceSearchResult | null>(null);
  const [searching, startSearch] = useTransition();
  const [creating, startCreate] = useTransition();
  const toast = useToast();

  // useState(defaultQuery) above only seeds the query on first mount — a
  // partner typing their company name into the Company name field *after*
  // this panel has already rendered (the common case on a brand-new,
  // still-untitled listing) wouldn't otherwise be reflected here at all.
  // Follows defaultQuery on every change, but only while the query still
  // shows the previously-synced default verbatim — a partner already
  // mid-edit in this box keeps what they typed, same treatment as
  // PartnerSlugForm's own lastSyncedSlug.
  const [lastSyncedDefaultQuery, setLastSyncedDefaultQuery] = useState(defaultQuery);
  if (defaultQuery !== lastSyncedDefaultQuery) {
    const previousDefault = lastSyncedDefaultQuery;
    setLastSyncedDefaultQuery(defaultQuery);
    if (query === previousDefault) setQuery(defaultQuery);
  }
  // Guards against an earlier (slower) debounced search's result landing
  // after a newer one's — only the most recently *started* search is
  // allowed to write to `results`.
  const searchSeq = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function runSearch(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults(null);
      return;
    }
    const seq = ++searchSeq.current;
    startSearch(async () => {
      const result = await searchBusinessOnGoogleMaps(trimmed);
      if (seq !== searchSeq.current) return;
      if (result.status === "ok") setResults(result.data.places);
      else toast.error(result.message);
    });
  }

  // Live search as the partner types — no button to click. Debounced so
  // pausing mid-word doesn't fire a new (billed) request on every
  // keystroke; a query shorter than MIN_QUERY_LENGTH never searches at all.
  useEffect(() => {
    if (!placesAvailable) return;
    debounceRef.current = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, placesAvailable]);

  function handleSelect(place: PlaceSearchResult) {
    setSelected(place);
    setResults(null);
    if (place.website) onWebsiteChange(place.website);
  }

  function handleCreate() {
    const context = getContext();
    startCreate(async () => {
      const result = await autoCreateListingDetails({ listingId, placeId: selected?.id, website, companyName: context.companyName });
      if (result.status !== "ok") {
        toast.error(result.message);
        return;
      }
      onCreated(result.data);
      const { googleMaps, website: fromWebsite } = result.data.sources;
      // Spelled out either way rather than left silent on a miss — a
      // partner who just picked a place and sees no star rating appear
      // shouldn't be left guessing whether that's Google (no rating on
      // file yet) or a bug (see autoCreateListingDetails's own comment on
      // why this field exists at all).
      toast.success(
        formatAiAutoCreateToast(locale, {
          googleMaps,
          fromWebsite,
          hasWebsite: Boolean(website),
          rating: result.data.googleRating,
          ratingCount: result.data.googleRatingCount,
        }),
      );
    });
  }

  return (
    <section className="min-w-0 rounded-md border border-slate-200 p-4 dark:border-neutral-800">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-petrol dark:text-petrol-light" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.heading}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.intro}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-neutral-800">
        <StepLabel step={1}>{t.step1Label}</StepLabel>

        {placesAvailable && (
          <div>
            <Label htmlFor="places-search">{t.businessOnGoogleMapsLabel}</Label>
            <Input
              id="places-search"
              value={query}
              onChange={(event) => {
                // Not part of the listing itself, so typing here shouldn't
                // count as an edit for the form's own "Saved" tracking.
                event.stopPropagation();
                const value = event.target.value;
                setQuery(value);
                // Clears immediately rather than waiting out the debounce —
                // only the search request itself needs to wait.
                if (value.trim().length < MIN_QUERY_LENGTH) setResults(null);
              }}
              onKeyDown={(event) => {
                // Enter searches right away instead of waiting out the
                // debounce — never submits the whole listing form.
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  runSearch(query);
                }
              }}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
            />

            {searching && (!results || results.length === 0) && (
              <p className="mt-2 text-sm text-slate-400">{t.searching}</p>
            )}
            {!searching && results && results.length === 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t.noMatches}</p>
            )}
            {results && results.length > 0 && (
              <ul className="mt-2 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 dark:divide-neutral-800 dark:border-neutral-800">
                {results.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(place)}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-neutral-800"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-900 dark:text-slate-100">{place.name}</span>
                        {place.address && (
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{place.address}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selected && (
              <div className="mt-2 flex items-start gap-2 rounded-md bg-led-soft px-3 py-2 text-sm text-slate-700 dark:bg-led-soft-dark dark:text-slate-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol-ink dark:text-petrol-light" />
                <div className="min-w-0 flex-1">
                  <span className="block font-medium">{selected.name}</span>
                  {selected.address && <span className="block text-xs">{selected.address}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="shrink-0 text-xs text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t.changeButton}
                </button>
              </div>
            )}
          </div>
        )}

        <FieldGroup label={t.websiteLabel} htmlFor="website" className={placesAvailable ? "mt-3" : undefined}>
          <Input
            id="website"
            name="website"
            form={formId}
            value={website}
            onChange={(event) => onWebsiteChange(event.target.value)}
            placeholder={t.websitePlaceholder}
          />
          <p className="mt-1 text-xs text-slate-400">{placesAvailable ? t.websiteHelpAuto : t.websiteHelpManual}</p>
        </FieldGroup>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-neutral-800">
        <StepLabel step={2}>{t.aiAutoCreate}</StepLabel>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
          >
            <Sparkles className="h-4 w-4" />
            {creating ? t.creating : t.aiAutoCreate}
          </Button>
          <p className="text-xs text-slate-400">{creating ? t.creatingHelp : t.createHelp}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-neutral-800">
        <StepLabel step={3}>{t.aiAutoTranslate}</StepLabel>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={onTranslate} disabled={translating}>
            <Sparkles className="h-4 w-4" />
            {translating ? t.translating : t.aiAutoTranslate}
          </Button>
          <p className="text-xs text-slate-400">{translating ? t.translatingHelp : t.translateHelp}</p>
        </div>
      </div>
    </section>
  );
}
