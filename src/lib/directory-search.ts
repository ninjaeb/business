import type { ListingUpdateKind } from "@/lib/directory";

// What both sides of every match are reduced to first — lowercase, and
// letters and digits only, in any script (\p{L}/\p{N}, so 中文 survives) —
// so that hyphens, spaces, apostrophes and punctuation never decide a
// match: "co-working", "coworking" and "co working" are one and the same
// to a visitor, and "sdn bhd" should find "Sdn. Bhd.". Shared by the
// header dropdown (searchDirectoryIndex below, and the index's own
// haystacks, see loadDirectorySearchIndex) and the home page's full
// results (DirectorySearch), so the "see all results" hand-off between
// them can never disagree about what matched.
export function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

// The header search bar's own searchable index (see HeaderSearch) — one
// compact entry per published listing, built server-side by
// loadDirectorySearchIndex (src/lib/directory.ts) and filtered in the
// browser by searchDirectoryIndex below. No `db` import anywhere in this
// module, so a "use client" component can import the filter itself, not
// just its types. Every `haystack` is already normalized plain text (see
// normalizeSearchText — markdown stripped, translated labels included) so
// a keystroke is a plain substring check with nothing left to compute.
export type DirectorySearchIndexEntry = {
  slug: string;
  companyName: string;
  tagline: string | null;
  industryLabel: string | null;
  logoUrl: string | null;
  haystack: string;
  services: { title: string; haystack: string }[];
  updates: { kind: ListingUpdateKind; title: string; haystack: string }[];
};
export type DirectorySearchIndex = DirectorySearchIndexEntry[];

export type DirectorySearchListingHit = {
  slug: string;
  companyName: string;
  tagline: string | null;
  logoUrl: string | null;
  industryLabel: string | null;
};
export type DirectorySearchProductHit = {
  listingSlug: string;
  companyName: string;
  logoUrl: string | null;
  title: string;
};
export type DirectorySearchUpdateHit = {
  listingSlug: string;
  companyName: string;
  logoUrl: string | null;
  kind: ListingUpdateKind;
  title: string;
};
export type DirectorySearchResults = {
  businesses: DirectorySearchListingHit[];
  products: DirectorySearchProductHit[];
  updates: DirectorySearchUpdateHit[];
};

const MAX_RESULTS_PER_GROUP = 5;

// Up to a handful of matches in each of three groups (business, products &
// services, news & promotions) — normalized substring matching (see
// normalizeSearchText), the same rule DirectorySearch's own free-text
// filter uses. A dropdown of suggestions, not the authoritative filter:
// the "see all results" link below it re-runs the real thing
// (DirectorySearch, on the home page).
export function searchDirectoryIndex(index: DirectorySearchIndex, query: string): DirectorySearchResults {
  const q = normalizeSearchText(query);
  const businesses: DirectorySearchListingHit[] = [];
  const products: DirectorySearchProductHit[] = [];
  const updates: DirectorySearchUpdateHit[] = [];
  if (!q) return { businesses, products, updates };

  for (const entry of index) {
    if (businesses.length >= MAX_RESULTS_PER_GROUP && products.length >= MAX_RESULTS_PER_GROUP && updates.length >= MAX_RESULTS_PER_GROUP) {
      break;
    }
    const { slug, companyName, logoUrl } = entry;

    if (businesses.length < MAX_RESULTS_PER_GROUP && entry.haystack.includes(q)) {
      businesses.push({ slug, companyName, tagline: entry.tagline, logoUrl, industryLabel: entry.industryLabel });
    }
    for (const service of entry.services) {
      if (products.length >= MAX_RESULTS_PER_GROUP) break;
      if (service.haystack.includes(q)) products.push({ listingSlug: slug, companyName, logoUrl, title: service.title });
    }
    for (const update of entry.updates) {
      if (updates.length >= MAX_RESULTS_PER_GROUP) break;
      if (update.haystack.includes(q)) updates.push({ listingSlug: slug, companyName, logoUrl, kind: update.kind, title: update.title });
    }
  }

  return { businesses, products, updates };
}
