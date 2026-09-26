"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, MapPin, Search } from "lucide-react";
import { getAddressFromGooglePlace, searchBusinessOnGoogleMaps, type AddressFromPlace } from "@/app/actions/directory";
import type { PlaceSearchResult } from "@/lib/google-places";
import { FieldGroup, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

const SEARCH_DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 2;

// A standalone "search your address on Google Maps" box above the
// Address/City/State/Country fields — same debounced Text Search pattern as
// AiAutoCreatePanel's own business search (see its comment on why this is
// never a per-keystroke autocomplete: Text Search and Place Details are
// both billed per request), but gated only on isGooglePlacesConfigured(),
// not on the AI side of that panel — filling in an address is a plain
// Google Maps lookup, not something that needs a model at all. Selecting a
// result fetches its Place Details once and hands the parsed
// address/city/state/country straight to onSelect; the fields themselves
// stay ordinary, editable inputs (see partner-listing-form.tsx), so a
// partner can still fix up whatever Google gets wrong — a unit number, a
// slightly different suburb name.
export function AddressSearch({
  placesAvailable,
  onSelect,
}: {
  placesAvailable: boolean;
  onSelect: (address: AddressFromPlace) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [loadingDetails, startLoadDetails] = useTransition();
  const toast = useToast();
  // Guards against an earlier (slower) debounced search's result landing
  // after a newer one's — only the most recently *started* search may write
  // to `results`.
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

  useEffect(() => {
    if (!placesAvailable) return;
    debounceRef.current = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, placesAvailable]);

  function handleSelect(place: PlaceSearchResult) {
    setResults(null);
    setQuery("");
    startLoadDetails(async () => {
      const result = await getAddressFromGooglePlace(place.id);
      if (result.status === "ok") {
        setSelectedName(place.name);
        onSelect(result.data);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (!placesAvailable) return null;

  return (
    <FieldGroup label="Search your address on Google Maps" htmlFor="address-search">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="address-search"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            // Clears immediately rather than waiting out the debounce — only
            // the search request itself needs to wait.
            if (value.trim().length < MIN_QUERY_LENGTH) setResults(null);
          }}
          onKeyDown={(event) => {
            // Enter searches right away instead of waiting out the debounce.
            if (event.key === "Enter") {
              event.preventDefault();
              if (debounceRef.current) clearTimeout(debounceRef.current);
              runSearch(query);
            }
          }}
          placeholder="Business name and city, e.g. Acme Printing Kuala Lumpur"
          autoComplete="off"
          className="pl-9"
        />
      </div>

      {(searching || loadingDetails) && (!results || results.length === 0) && (
        <p className="mt-2 text-sm text-slate-400">{loadingDetails ? "Loading address…" : "Searching…"}</p>
      )}
      {!searching && !loadingDetails && results && results.length === 0 && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No matches — try adding the city or area.</p>
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
                  {place.address && <span className="block text-xs text-slate-500 dark:text-slate-400">{place.address}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedName && !results && !loadingDetails && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Check className="h-3.5 w-3.5 shrink-0 text-petrol-ink dark:text-petrol-light" />
          Filled in from <span className="font-medium text-slate-700 dark:text-slate-300">{selectedName}</span> — edit the
          fields below if needed.
        </p>
      )}
    </FieldGroup>
  );
}
