import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingLogo } from "@/components/directory/listing-logo";
import type { DirectoryGridListing } from "@/lib/directory";
import { directoryListingPath, type DirectoryLocale } from "@/lib/directory-i18n";

const MAX_VISIBLE_SERVICES = 3;

export function ListingCard({
  listing,
  viewLabel,
  industryLabel,
  locale,
}: {
  listing: DirectoryGridListing;
  viewLabel: string;
  // Pre-resolved for the visitor's locale by the caller (see
  // directory-search.tsx) — this component has no locale of its own to
  // look one up with.
  industryLabel?: string;
  locale: DirectoryLocale;
}) {
  const extraServices = listing.services.length - MAX_VISIBLE_SERVICES;

  return (
    // min-w-0: this Link is the actual grid item in the results grid
    // (directory-search.tsx's grid is a single column below sm) — without
    // it, it defaults to min-width: auto and the grid track sizes to this
    // card's own content instead of shrinking to fit the viewport.
    <Link href={directoryListingPath(locale, listing.slug)} className="block h-full min-w-0">
      <Card className="flex h-full flex-col transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
        <CardBody className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            <ListingLogo name={listing.companyName} logoUrl={listing.logoUrl} size={40} loading="lazy" className="h-10 w-10 text-sm" />
            <div className="min-w-0">
              {/* A heading rather than a <p>: each card's name is an item
                  under the page's H1/H2 outline, which is how a crawler (and
                  a screen reader's heading list) tells the businesses apart
                  from the surrounding copy. Tailwind's preflight leaves
                  headings unstyled, so it looks exactly as before. */}
              <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">{listing.companyName}</h3>
              {listing.industry && industryLabel && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{industryLabel}</p>
              )}
            </div>
          </div>

          {listing.tagline && <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{listing.tagline}</p>}

          {listing.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.services.slice(0, MAX_VISIBLE_SERVICES).map((service, index) => (
                // max-w + truncate: a service title is free text a partner
                // wrote themselves and can run long — without a cap, one
                // long title (no internal wrap points a flex-wrap row can
                // break on) renders at its full width and pushes the whole
                // card wider than the viewport on mobile.
                <Badge
                  key={index}
                  className="max-w-[9rem] truncate bg-led-soft text-petrol-ink ring-led/30 sm:max-w-[14rem] dark:bg-led-soft-dark dark:text-petrol-light dark:ring-led/20"
                >
                  {service.title}
                </Badge>
              ))}
              {extraServices > 0 && (
                <Badge className="bg-led-soft text-petrol-ink ring-led/30 dark:bg-led-soft-dark dark:text-petrol-light dark:ring-led/20">
                  +{extraServices}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Eye className="h-3.5 w-3.5" />
              {listing.viewsLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-petrol dark:text-petrol-light">
              {viewLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
