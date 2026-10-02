import Link from "next/link";
import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  ChevronRight,
  Clapperboard,
  Cpu,
  Eye,
  Factory,
  GraduationCap,
  HeartPulse,
  Landmark,
  MapPin,
  Megaphone,
  Palmtree,
  Radio,
  Scale,
  ShoppingBag,
  Sprout,
  Tag,
  Truck,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Industry } from "@/generated/prisma/client";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, Eyebrow } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ListingLogo } from "@/components/directory/listing-logo";
import type { DirectoryGridListing } from "@/lib/directory";
import { directoryListingPath, type DirectoryLocale } from "@/lib/directory-i18n";

const MAX_VISIBLE_SERVICES = 3;

// Purely decorative (the category badge overlaid on the cover photo) — one
// representative icon per Industry, not an attempt to classify a business
// more precisely than its own chosen category already does.
const INDUSTRY_ICONS: Record<Industry, LucideIcon> = {
  TECHNOLOGY: Cpu,
  RETAIL_ECOMMERCE: ShoppingBag,
  HEALTHCARE: HeartPulse,
  FINANCE_BANKING: Banknote,
  MANUFACTURING: Factory,
  CONSTRUCTION_REAL_ESTATE: Building2,
  EDUCATION: GraduationCap,
  HOSPITALITY_TOURISM: Palmtree,
  PROFESSIONAL_SERVICES: Briefcase,
  MEDIA_ENTERTAINMENT: Clapperboard,
  TRANSPORTATION_LOGISTICS: Truck,
  AGRICULTURE: Sprout,
  ENERGY_UTILITIES: Zap,
  GOVERNMENT_NONPROFIT: Landmark,
  TELECOMMUNICATIONS: Radio,
  AUTOMOTIVE: Car,
  FOOD_BEVERAGE: UtensilsCrossed,
  LEGAL: Scale,
  MARKETING_ADVERTISING: Megaphone,
  OTHER: Tag,
};

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
  const locationLabel = [listing.city, listing.state].filter(Boolean).join(", ") || listing.country;
  const IndustryIcon = listing.industry ? INDUSTRY_ICONS[listing.industry] : null;

  return (
    // min-w-0: this Link is the actual grid item in the results grid
    // (directory-search.tsx's grid is a single column below sm) — without
    // it, it defaults to min-width: auto and the grid track sizes to this
    // card's own content instead of shrinking to fit the viewport.
    <Link href={directoryListingPath(locale, listing.slug)} className="block h-full min-w-0">
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
        {/* Cover photo — the listing's first gallery photo (see
            coverPhotoUrl's own comment in directory.ts). A listing with no
            gallery photos yet but a logo gets that logo blown up and
            blurred as a backdrop, with the real logo sharp on top — an
            album-art treatment that still looks like a deliberate image
            rather than an empty box, using only what the listing already
            has. A listing with neither falls back to a flat tinted block
            with its initial-letter avatar. Either way every card in a grid
            keeps the same shape instead of some being noticeably shorter. */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-led-soft dark:bg-led-soft-dark">
          {listing.coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images/[id], same reasoning as ListingLogo's own img tag
            <img
              src={listing.coverPhotoUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : listing.logoUrl ? (
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
              <ListingLogo
                name={listing.companyName}
                logoUrl={listing.logoUrl}
                size={72}
                loading="lazy"
                className="relative h-[4.5rem] w-[4.5rem] text-2xl ring-4 ring-white shadow-lg dark:ring-neutral-900"
              />
            </div>
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

        <CardBody className="flex flex-1 flex-col gap-2.5">
          <div className="flex items-center gap-2">
            {listing.logoUrl && (
              <ListingLogo name={listing.companyName} logoUrl={listing.logoUrl} size={24} loading="lazy" className="h-6 w-6 shrink-0 text-[10px]" />
            )}
            {/* A heading rather than a <p>: each card's name is an item
                under the page's H1/H2 outline, which is how a crawler (and
                a screen reader's heading list) tells the businesses apart
                from the surrounding copy. Tailwind's preflight leaves
                headings unstyled, so sizing/weight are set explicitly. */}
            <h3 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{listing.companyName}</h3>
          </div>

          {listing.googleRating !== null && (
            <div className="flex items-center gap-1">
              <StarRating rating={listing.googleRating} size="h-3.5 w-3.5" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{listing.googleRating.toFixed(1)}</span>
              {listing.googleRatingCount !== null && (
                <span className="text-xs text-slate-400 dark:text-slate-500">({listing.googleRatingCount})</span>
              )}
            </div>
          )}

          {locationLabel && (
            <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </p>
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
