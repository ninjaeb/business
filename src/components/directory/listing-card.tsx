import Link from "next/link";
import { ChevronRight, Eye, MapPin } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, Eyebrow } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ListingLogo } from "@/components/directory/listing-logo";
import type { DirectoryGridListing } from "@/lib/directory";
import { directoryListingPath, type DirectoryLocale } from "@/lib/directory-i18n";
import { INDUSTRY_ICONS } from "@/lib/directory-industry-labels";

const MAX_VISIBLE_SERVICES = 3;

export function ListingCard({
  listing,
  viewLabel,
  industryLabel,
  locale,
  variant = "default",
}: {
  listing: DirectoryGridListing;
  viewLabel: string;
  // Pre-resolved for the visitor's locale by the caller (see
  // directory-search.tsx) — this component has no locale of its own to
  // look one up with.
  industryLabel?: string;
  locale: DirectoryLocale;
  // "default" (the full-width search/category/location grids, via
  // directory-search.tsx) keeps the big logo-or-cover-photo banner on top.
  // "compact" (the listing detail page's own "Latest businesses"/
  // "Businesses near you" sections — see src/app/[locale]/[slug]/page.tsx)
  // drops that banner entirely and puts a small ListingLogo inline before
  // the company name instead, so these two sections read as a tighter
  // "more businesses" list rather than repeating the same big-card
  // treatment the main grid already uses.
  variant?: "default" | "compact";
}) {
  const extraServices = listing.services.length - MAX_VISIBLE_SERVICES;
  const locationLabel = [listing.city, listing.state].filter(Boolean).join(", ") || listing.country;
  const IndustryIcon = listing.industry ? INDUSTRY_ICONS[listing.industry] : null;

  // Shared between both variants so they're defined once but placed
  // differently: alongside the name inside the compact header's logo row
  // below, or in their own normal-flow rows under the default variant's
  // banner.
  const ratingBlock = listing.googleRating !== null && (
    <div className="flex items-center gap-1">
      <StarRating rating={listing.googleRating} size="h-3.5 w-3.5" />
      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{listing.googleRating.toFixed(1)}</span>
      {listing.googleRatingCount !== null && (
        <span className="text-xs text-slate-400 dark:text-slate-500">({listing.googleRatingCount})</span>
      )}
    </div>
  );
  const locationBlock = locationLabel && (
    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{locationLabel}</span>
    </p>
  );

  return (
    // min-w-0: this Link is the actual grid item in the results grid
    // (directory-search.tsx's grid is a single column below sm) — without
    // it, it defaults to min-width: auto and the grid track sizes to this
    // card's own content instead of shrinking to fit the viewport.
    <Link href={directoryListingPath(locale, listing.slug)} className="block h-full min-w-0">
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
        {variant === "default" && (
          // The listing's logo, blown up and blurred as a backdrop with the
          // real logo sharp on top, if it has one — an album-art treatment
          // that keeps every card anchored to the company's own brand mark
          // rather than whatever a gallery photo happens to show (a listing's
          // gallery is partner-uploaded and uncurated, so its first photo is
          // often not the listing's most recognizable image — the logo
          // always is). Only a listing with no logo at all falls back to its
          // first gallery photo (see coverPhotoUrl's own comment in
          // directory.ts), and a listing with neither falls back to a flat
          // tinted block with its initial-letter avatar. Either way every
          // card in a grid keeps the same shape instead of some being
          // noticeably shorter.
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-led-soft dark:bg-led-soft-dark">
            {listing.logoUrl ? (
              <div className="relative flex h-full w-full items-center justify-center">
                {/* aria-hidden + empty alt: purely decorative backdrop: the
                    sharp logo on top (next) is the one screen readers and
                    crawlers should see. scale-125 keeps blur's own soft edge
                    from ever showing the image's true (unblurred) boundary. */}
                {/* eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images/logo/[slug], same reasoning as ListingLogo's own img tag */}
                <img
                  src={listing.logoUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full scale-125 object-cover opacity-80 blur-2xl"
                />
                {/* The logo itself, not through ListingLogo — that component
                    always crops to a circle, which fights an 80%-of-the-frame
                    size. object-contain (not cover) so a non-square logo never
                    gets cropped; drop-shadow (a filter, unlike box-shadow)
                    follows the logo's own transparency instead of its
                    rectangular bounding box. */}
                {/* eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images/logo/[slug], same reasoning as ListingLogo's own img tag */}
                <img
                  src={listing.logoUrl}
                  alt={`${listing.companyName} logo`}
                  loading="lazy"
                  decoding="async"
                  className="relative h-[80%] w-[80%] object-contain drop-shadow-lg"
                />
              </div>
            ) : listing.coverPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images/[id], same reasoning as ListingLogo's own img tag
              <img
                src={listing.coverPhotoUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ListingLogo name={listing.companyName} logoUrl={null} size={64} loading="lazy" className="h-16 w-16 text-xl" />
              </div>
            )}
            {listing.industry && industryLabel && IndustryIcon && (
              <Eyebrow className="absolute left-3 top-3 gap-1.5 bg-white normal-case tracking-normal text-petrol-ink shadow-sm dark:bg-white dark:text-petrol-ink">
                <IndustryIcon className="h-3.5 w-3.5" />
                {industryLabel}
              </Eyebrow>
            )}
          </div>
        )}

        <CardBody className="flex flex-1 flex-col gap-2.5">
          {/* A heading rather than a <p>: each card's name is an item
              under the page's H1/H2 outline, which is how a crawler (and a
              screen reader's heading list) tells the businesses apart from
              the surrounding copy. Tailwind's preflight leaves headings
              unstyled, so sizing/weight are set explicitly. */}
          {variant === "compact" ? (
            // Grid, not flex: an "auto" grid column stretched to the row's
            // height correctly derives the logo's width from aspect-square
            // for BOTH the <img> and ListingLogo's no-logo fallback (a plain
            // <div>) — flexbox's own flex-basis:auto sizing only does this
            // for replaced elements like <img>, so the same classes on a
            // flex row left the fallback avatar's width stuck at its
            // "S"-sized content box instead of matching its height (verified
            // empirically, not just by spec reading). Either way this is an
            // exact match to the name+rating+location column beside it at
            // any viewport and with however many of those three lines a
            // given listing actually has, not a guessed breakpoint pair of
            // fixed sizes.
            <div className="grid grid-cols-[auto_1fr] items-stretch gap-3">
              {/* rounded-none overrides ListingLogo's own default
                  rounded-full, and ring-0 drops its default border ring
                  (tailwind-merge resolves both conflicts in this later
                  class's favor) — a plain square crop here, unlike every
                  other place this component renders a circular bordered
                  avatar. */}
              <ListingLogo
                name={listing.companyName}
                logoUrl={listing.logoUrl}
                size={90}
                loading="lazy"
                className="aspect-square h-auto w-auto rounded-none text-2xl ring-0"
              />
              <div className="min-w-0 space-y-0.5">
                <h3 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {listing.companyName}
                </h3>
                {ratingBlock}
                {locationBlock}
              </div>
            </div>
          ) : (
            <>
              <h3 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{listing.companyName}</h3>
              {ratingBlock}
              {locationBlock}
            </>
          )}

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
            {/* A span, not a nested <button>/<a>: the whole card is already
                one Link (see above) — this just needs to read as a button,
                never act as a second, separately-focusable one. */}
            <span className={buttonClasses("secondary", "sm", "pointer-events-none gap-1 px-3")}>
              {viewLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
