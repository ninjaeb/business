"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard } from "@/components/directory/listing-card";
import { INDUSTRY_LABELS_BY_LOCALE, type DirectoryLocale } from "@/lib/directory-i18n";
import type { DirectoryGridListing } from "@/lib/directory";
import { cn } from "@/lib/utils";

// The listing detail page's right-hand sidebar, directly below the sticky
// "Get in touch" card (see src/app/[locale]/[slug]/layout.tsx) — a quick
// way to notice this business's own accepted Business Partners (see
// getPublishedBusinessPartnerListings) without leaving the page, through
// the same "compact" ListingCard treatment the About/Visit pages' own
// "more businesses" sections use. A single partner renders as one plain
// card; two or more become a one-at-a-time slideshow (Prev/Next, wrapping
// at either end, same modulo-cycling PhotoLightbox already uses) rather
// than stacking every partner down the sidebar, which could run longer
// than the "Get in touch" card above it and crowd the column.
export function BusinessPartnersSidebar({
  partners,
  heading,
  viewLabel,
  locale,
}: {
  partners: DirectoryGridListing[];
  heading: string;
  viewLabel: string;
  locale: DirectoryLocale;
}) {
  const [index, setIndex] = useState(0);
  if (partners.length === 0) return null;

  const current = partners[index];
  const industryLabel = current.industry ? INDUSTRY_LABELS_BY_LOCALE[locale][current.industry] : undefined;

  return (
    <section aria-labelledby="business-partners-sidebar">
      <h2 id="business-partners-sidebar" className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {heading}
      </h2>
      <div className="mt-3">
        <ListingCard listing={current} viewLabel={viewLabel} industryLabel={industryLabel} locale={locale} variant="compact" />
        {partners.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + partners.length) % partners.length)}
              aria-label="Previous business partner"
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-neutral-800 dark:hover:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {partners.map((partner, i) => (
                <button
                  key={partner.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${partner.companyName}`}
                  aria-current={i === index}
                  className={cn("h-1.5 w-1.5 rounded-full", i === index ? "bg-petrol dark:bg-petrol-light" : "bg-slate-300 dark:bg-neutral-700")}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % partners.length)}
              aria-label="Next business partner"
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-neutral-800 dark:hover:text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
