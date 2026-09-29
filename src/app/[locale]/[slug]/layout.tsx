import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Globe, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import {
  buildBreadcrumbJsonLd,
  directoryImagePath,
  formatOpeningHoursSchema,
  getOrCreateReferralCode,
  getPublishedBranchListings,
  getPublishedListingBySlug,
  incrementListingViewCount,
  listingLogoPath,
  listingViewCountByLocale,
  resolveListingDisplay,
  slugify,
} from "@/lib/directory";
import { serializeJsonLd } from "@/lib/directory-seo";
import { stripMarkdownLiteToPlainText } from "@/lib/markdown-lite";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { getVerifiedPartnerOrNull } from "@/lib/auth/dal";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  INDUSTRY_LABELS_BY_LOCALE,
  directoryHomePath,
  directoryListingFaqPath,
  directoryListingNewsPath,
  directoryListingPath,
  directoryListingPhotosPath,
  directoryListingPromotionsPath,
  directoryListingServicesPath,
  directoryListingVideosPath,
  directoryListingVisitPath,
  formatContactWhatsAppMessage,
  formatRecommendMessage,
  formatViewsLabel,
} from "@/lib/directory-i18n";
import { whatsAppUrl } from "@/lib/format";
import { translateCategoryName, categoryPath } from "@/lib/directory-category-labels";
import { locationLabel, locationPath } from "@/lib/directory-location-labels";
import { industryPath } from "@/lib/directory-industry-labels";
import { getSiteOrigin } from "@/lib/site-url";
import { INDUSTRY_LABELS } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingLogo } from "@/components/directory/listing-logo";
import { DirectoryLeadForm } from "@/components/directory/directory-lead-form";
import { InquiryProvider, InquiryScrollTarget } from "@/components/directory/listing-inquiry";
import { ShareButton } from "@/components/directory/share-button";
import { RecommendBar } from "@/components/directory/recommend-bar";
import { ReferralViewBeacon } from "@/components/directory/referral-view-beacon";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { ListingSectionNav } from "@/components/directory/listing-section-nav";

export const dynamic = "force-dynamic";

// A listing's logo is stored as a data: URL (see photoDataUrl), which JSON-LD
// can't use directly — that's read by a crawler fetching the image URL
// itself, not a browser rendering the page.
// /api/directory-images/logo/[slug] decodes and re-serves it under a real
// URL instead (versioned by publish time, see listingLogoPath, so a
// replaced logo is a new URL to every cache/crawler too). Returns null when
// the listing has no logo — JSON-LD's own `image` is left unset entirely in
// that case rather than pointed at unrelated Gotka branding.
type ListingWithMeta = NonNullable<Awaited<ReturnType<typeof getPublishedListingBySlug>>>;

// Shared by both header layouts below (desktop's sm:flex block and mobile's
// sm:hidden duplicate — see their own comments on why the content repeats).
// A real link to the Google Maps listing when one's on file (see
// PartnerListing.googleMapsUrl's own comment in prisma/schema.prisma) so a
// visitor can read the reviews behind the number, not just be told to trust
// it; a plain span on older data set before that column existed.
function GoogleRatingBadge({ listing, ratingLabel }: { listing: ListingWithMeta; ratingLabel: string }) {
  if (listing.googleRating === null) return null;
  const label = `${ratingLabel}: ${listing.googleRating}${listing.googleRatingCount !== null ? ` (${listing.googleRatingCount})` : ""}`;
  const content = (
    <>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-semibold text-slate-700 dark:text-slate-200">{listing.googleRating.toFixed(1)}</span>
      {listing.googleRatingCount !== null && <span>({listing.googleRatingCount})</span>}
    </>
  );
  return listing.googleMapsUrl ? (
    <a
      href={listing.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={label}
      className="inline-flex items-center gap-1 hover:text-petrol hover:underline dark:hover:text-petrol-light"
    >
      {content}
    </a>
  ) : (
    <span aria-label={label} className="inline-flex items-center gap-1">
      {content}
    </span>
  );
}

function buildListingLogoUrl(listing: ListingWithMeta, siteOrigin: string, slug: string): string | null {
  return listing.logoUrl ? `${siteOrigin}${listingLogoPath(slug, listing.publishedAt)}` : null;
}

// Every image worth telling a crawler about, logo first — the gallery
// (PublishedListingSnapshot.photos) is just as public and, unlike the logo,
// often carries its own caption.
function listingImageEntries(
  listing: ListingWithMeta,
  siteOrigin: string,
  slug: string,
): { url: string; caption?: string }[] {
  const logoUrl = buildListingLogoUrl(listing, siteOrigin, slug);
  return [
    ...(logoUrl ? [{ url: logoUrl }] : []),
    ...listing.photos.map((photo) => ({
      url: `${siteOrigin}${directoryImagePath(photo.id)}`,
      caption: photo.caption || undefined,
    })),
  ];
}

// Schema.org LocalBusiness markup — read by both search engines (SEO) and AI
// answer engines that crawl the page (GEO). Rendered once here, in the
// shared layout, so every one of this listing's pages (About, Products &
// Services, Photos, ...) carries it, always pointed at the listing's own
// canonical URL (the About page, `url` below) regardless of which of its
// pages a crawler actually fetched — this describes the business, not "this
// specific page". `telephone` only appears when the partner has set one on
// the listing itself (see PublishedListingSnapshot's own comment in
// src/lib/directory.ts on why that's a different thing from the partner
// ACCOUNT's own private phone, which never appears here) — it's opt-in
// public info, same as `website` below.
function buildJsonLd(
  listing: ListingWithMeta,
  url: string,
  images: { url: string; caption?: string }[],
) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.companyName,
    url,
  };
  const description = listing.seoDescription?.trim() || stripMarkdownLiteToPlainText(listing.description) || listing.tagline;
  if (description) jsonLd.description = description;
  // A plain URL for an uncaptioned image (the logo, almost always), an
  // ImageObject when there's a caption to carry (schema.org's `image`
  // accepts either, and can mix both in one array) — and the single-value
  // form rather than a 1-element array for the common case of just a logo
  // and no gallery, so a listing with no photos gets exactly the same
  // `image` shape it always has.
  if (images.length > 0) {
    const jsonLdImages = images.map((image) =>
      image.caption ? { "@type": "ImageObject", url: image.url, caption: image.caption } : image.url,
    );
    jsonLd.image = jsonLdImages.length === 1 ? jsonLdImages[0] : jsonLdImages;
  }
  // A structured PostalAddress (falling back to the free-text `address` as
  // streetAddress when city/state/country aren't set) reads far better to
  // both a rich-result parser and an AI crawler extracting "where is this
  // business" than the same info as one opaque string ever did.
  if (listing.address || listing.city || listing.state || listing.country) {
    jsonLd.address = {
      "@type": "PostalAddress",
      ...(listing.address ? { streetAddress: listing.address } : {}),
      ...(listing.city ? { addressLocality: listing.city } : {}),
      ...(listing.state ? { addressRegion: listing.state } : {}),
      ...(listing.country ? { addressCountry: listing.country } : {}),
    };
  }
  if (listing.website) jsonLd.sameAs = [listing.website];
  if (listing.phone) jsonLd.telephone = listing.phone;
  // Google's own rating (see PartnerListing.googleRating's own comment in
  // prisma/schema.prisma) — schema.org requires a ratingCount/reviewCount
  // on an AggregateRating, so this only appears once both are present,
  // never rating alone. Google Places already checks a rating has at least
  // one review before it ever returns one, so ratingCount === 0 alongside
  // a non-null rating isn't a real case to guard against here.
  if (listing.googleRating !== null && listing.googleRatingCount !== null) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.googleRating,
      reviewCount: listing.googleRatingCount,
    };
  }
  // English regardless of the page's own locale — schema.org's own
  // vocabulary/consumers (search engines, AI crawlers) expect this field in
  // a consistent language, unlike the human-visible badge below.
  if (listing.industry) jsonLd.additionalType = INDUSTRY_LABELS[listing.industry];
  if (listing.operatingHours) {
    const openingHours = formatOpeningHoursSchema(listing.operatingHours);
    if (openingHours.length > 0) jsonLd.openingHours = openingHours;
  }
  if (listing.services.length > 0) {
    // service.price is deliberately left out of this Offer — it's free
    // text a partner typed ("RM 25/day", "From RM 900/mo"), not the plain
    // decimal plus separate priceCurrency schema.org's Offer.price expects.
    // The visible price badge on the Products & Services page itself is
    // unaffected; this only keeps the JSON-LD from asserting an invalid
    // price value.
    jsonLd.makesOffer = listing.services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        ...(service.description ? { description: service.description } : {}),
      },
    }));
  }
  return serializeJsonLd(jsonLd);
}

export default async function ListingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  // Reads the approved snapshot only — never the partner's live-editing
  // draft — same invariant the listing grid enforces (see
  // src/lib/directory.ts's PublishedListingSnapshot comment). A slug with
  // no snapshot at all (never approved, or since unpublished) 404s exactly
  // like one that doesn't exist. Cached (see getPublishedListingBySlug), so
  // this doesn't re-hit the database on top of whichever section page's own
  // identical fetch runs alongside it for the same request.
  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();

  const [siteOrigin, , referralCode, viewer, branches] = await Promise.all([
    getSiteOrigin(),
    // Runs once per visit to this listing, not once per page: Next.js keeps
    // a layout mounted across client-side navigation between its own child
    // pages, so a visitor clicking from About to Products & Services to
    // Photos doesn't re-run this (or re-fetch the listing above) at all —
    // only a fresh request (first landing here, or a hard reload) does,
    // same "one view per visit" semantics the single combined page always
    // had, preserved now that a visit might start on any one of its pages.
    incrementListingViewCount(listing.id, resolved),
    getOrCreateReferralCode(listing),
    // Who's viewing, if anyone signed in as a partner — purely to decide
    // whether recommendUrl below gets a personalized `via` tag; never
    // gates the Recommend button itself (see its own comment).
    getVerifiedPartnerOrNull(),
    // Only to decide whether the Visit us tab below should show at all for
    // a listing with no address/hours of its own but at least one live
    // branch — the Visit page itself re-fetches this same list (same
    // "every section page re-queries the same request-scoped listing"
    // pattern getPublishedListingBySlug's own comment describes).
    getPublishedBranchListings(listing.id),
  ]);
  const t = DIRECTORY_STRINGS[resolved];
  const display = resolveListingDisplay(listing, resolved);
  const pageUrl = `${siteOrigin}${directoryListingPath(resolved, slug)}`;

  // No commission/payout system (this app doesn't pay anyone for a
  // referral, unlike the CRM it was extracted from) — just attribution: a
  // `r=<referral code>` tag on the Recommend link's own URL, distinct from
  // pageUrl (which the plain Share button still uses untagged). A short,
  // generated-once code (see getOrCreateReferralCode) rather than this
  // listing's own id, so the shared link stays short and doesn't leak the
  // cuid — but still lets submitDirectoryLead confirm the tag actually
  // names the listing the lead is being submitted to, rather than trusting
  // any `r` value present. A visitor who lands here via that link and then
  // submits the lead form gets DirectoryLead.viaReferral set (see
  // directory-lead-form.tsx and submitDirectoryLead), which is what the
  // business portal's "Referred" stat counts. Offered to every visitor, not
  // gated to a signed-in partner — anyone recommending a business they like
  // generates the same tag, not just its own owner.
  //
  // A signed-in partner's own copy of this link additionally carries
  // `via=<their User.id>` — same non-secret, exact-match trust level as
  // `r` itself (see submitDirectoryLead and recordReferralView), not a
  // cryptographic proof of anything. It's what lets ReferralViewBeacon and
  // a lead's own DirectoryLead.referrerId attribute this specific visit or
  // lead back to whoever shared it, surfaced on that partner's own
  // Dashboard (see getReferralActivityForPartner) — no special-casing
  // "is this their own listing," recommending your own business is a
  // harmless case of this same path. Anonymous/admin visitors get the
  // plain, untagged link exactly as before.
  const recommendUrl = viewer ? `${pageUrl}?r=${referralCode}&via=${viewer.id}` : `${pageUrl}?r=${referralCode}`;
  const recommendMessage = formatRecommendMessage(t.recommendMessage, listing.companyName, recommendUrl);

  // Home > (first category, if any) > this business. Only the first
  // category, not every one a listing has — a breadcrumb trail is meant to
  // read as one path back to the root, not an exhaustive tag list. Ends at
  // the listing's own (About) URL on every one of its pages — same
  // reasoning as buildJsonLd's own `url` above.
  const primaryCategory = listing.categories[0];
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[resolved], url: `${siteOrigin}${directoryHomePath(resolved)}` },
    ...(primaryCategory
      ? [
          {
            name: translateCategoryName(primaryCategory, resolved),
            url: `${siteOrigin}${categoryPath(slugify(primaryCategory), resolved)}`,
          },
        ]
      : []),
    { name: listing.companyName, url: pageUrl },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  // The header's own tab strip (see ListingSectionNav) — same conditions as
  // each section page's own notFound() guard, in the same order they used
  // to appear as Cards on the single page, so a tab only ever points at a
  // page that actually has something on it. Two tabs from that single page
  // are now four: the old combined "Photo and Video" splits into Photos and
  // Videos, and "News & Promotions" into News and Promotions, since each is
  // now its own page rather than a subheading within a shared card. Hours
  // has no tab of its own — folded into Visit us (see
  // directoryListingVisitPath's own comment).
  const sectionLinks = [
    display.description && { href: directoryListingPath(resolved, slug), label: t.aboutHeading },
    // Right after About — "where/when to visit" is core identity info a
    // visitor wants placed next to "what this business is," not buried
    // behind the content tabs.
    (listing.address || listing.operatingHours || branches.length > 0) && {
      href: directoryListingVisitPath(resolved, slug),
      label: t.visitHeading,
    },
    display.services.length > 0 && { href: directoryListingServicesPath(resolved, slug), label: t.servicesHeading },
    // Right after Products & Services (not second-to-last) — a shopper
    // deciding what to buy is exactly who wants "any questions about
    // this?" right next to it.
    display.faqs.length > 0 && { href: directoryListingFaqPath(resolved, slug), label: t.faqHeading },
    listing.photos.length > 0 && { href: directoryListingPhotosPath(resolved, slug), label: t.photosHeading },
    display.videoGallery.length > 0 && { href: directoryListingVideosPath(resolved, slug), label: t.videoHeading },
    display.currentNews.length > 0 && { href: directoryListingNewsPath(resolved, slug), label: t.newsLabel },
    display.currentPromotions.length > 0 && {
      href: directoryListingPromotionsPath(resolved, slug),
      label: t.promotionsHeading,
    },
  ].filter((section): section is { href: string; label: string } => Boolean(section));

  return (
    // Top padding matches the category/location pages' own breadcrumb
    // spacing (see category-page-content.tsx/location-page-content.tsx) so
    // it doesn't sit flush against the sticky header. Bottom padding clears
    // the sticky Services/Recommend/Get in touch bar pinned over the page's
    // foot at every width — generous on purpose (the bar itself is nowhere
    // near this tall) rather than trimmed to its exact height, since too
    // little here means the bar covers real content and too much is just
    // some extra whitespace.
    <div className="w-full px-4 pt-4 pb-40 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildJsonLd(
            { ...listing, services: display.services },
            pageUrl,
            listingImageEntries(listing, siteOrigin, slug),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      {/* Renders nothing — mounted here (layout level, not a child page)
          for the exact same "once per visit, not once per child page"
          lifetime incrementListingViewCount above already relies on. See
          its own comment for why a `via` tag can't be read here directly. */}
      <ReferralViewBeacon listingId={listing.id} />
      {/* Hidden below sm — the JSON-LD above still carries the same trail
          for search results; a phone screen just doesn't have the spare
          width for it above the header, and the tab strip further down
          already covers "get back to a section of this page." */}
      <div className="hidden sm:mb-4 sm:block">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
      </div>
      <div className="mb-8 border-b border-slate-200 bg-white px-4 py-4 -mx-4 sm:-mx-8 sm:px-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-start gap-4">
          {/* 96px below sm — a fixed 200px logo left too little width for
              the name column beside it on a phone screen, to the point a
              longer company name could clip instead of wrapping. Full
              200px from sm up, where there's room for both. */}
          <ListingLogo
            name={listing.companyName}
            logoUrl={listing.logoUrl ? listingLogoPath(slug, listing.publishedAt) : null}
            size={200}
            className="h-24 w-24 text-2xl sm:h-[200px] sm:w-[200px] sm:text-4xl"
            zoomable
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{listing.companyName}</h1>
            {display.tagline && <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{display.tagline}</p>}
            {/* From sm up, industry/category/state/country/website/views
                live here — in the same column as the name and tagline,
                beside the logo — rather than their own full-width row
                further down, which otherwise leaves the space below a short
                tagline next to a 200px logo empty. Below sm there's no
                spare height left in this column for a phone-width logo, so
                this whole group is hidden here and instead repeats,
                full-width, at the top of the content column below (ahead
                of whichever section a page renders there) — see the
                sm:hidden block there. Industry/category is its own line;
                location, website and the view count share the next one —
                the view count rides along next to the website link (rather
                than its own separate line above) since it's always present
                regardless of which of the others are. */}
            <div className="mt-3 hidden flex-col gap-2 sm:flex">
              {(listing.industry || listing.categories.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 text-base text-slate-500 dark:text-slate-400">
                  {listing.industry && (
                    <Link href={industryPath(listing.industry, resolved)}>
                      <Badge className="bg-petrol px-2.5 py-1 text-sm font-semibold text-white ring-0 transition-colors hover:bg-petrol-ink dark:bg-petrol/70 dark:hover:bg-petrol">
                        {INDUSTRY_LABELS_BY_LOCALE[resolved][listing.industry]}
                      </Badge>
                    </Link>
                  )}
                  {listing.categories.map((category) => (
                    <Link key={category} href={categoryPath(slugify(category), resolved)}>
                      <Badge className="bg-petrol px-2.5 py-1 text-sm font-semibold text-white ring-0 transition-colors hover:bg-petrol-ink dark:bg-petrol/70 dark:hover:bg-petrol">
                        {translateCategoryName(category, resolved)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 text-base text-slate-500 dark:text-slate-400">
                <GoogleRatingBadge listing={listing} ratingLabel={t.googleRatingLabel} />
                {listing.state ? (
                  <Link
                    href={locationPath(slugify(locationLabel(listing.city, listing.state)), resolved)}
                    className="inline-flex items-center gap-1 hover:text-petrol hover:underline dark:hover:text-petrol-light"
                  >
                    <MapPin className="h-4 w-4" />
                    {locationLabel(listing.city, listing.state)}
                  </Link>
                ) : (
                  listing.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.city}
                    </span>
                  )
                )}
                {listing.country && (
                  <Link
                    href={`${directoryHomePath(resolved)}?country=${encodeURIComponent(listing.country)}`}
                    className="hover:text-petrol hover:underline dark:hover:text-petrol-light"
                  >
                    {listing.country}
                  </Link>
                )}
                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-petrol hover:underline dark:text-petrol-light"
                  >
                    <Globe className="h-4 w-4" />
                    {t.websiteLabel}
                  </a>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                  <Eye className="h-4 w-4" />
                  {/* This page's own language's count (not the listing's
                      all-time total across all three) — the count from
                      before this load, since the increment above runs in
                      parallel rather than being awaited first, so it hasn't
                      landed yet. +1 so this visitor's own view is reflected
                      immediately instead of showing up only on the next page
                      load. */}
                  {formatViewsLabel(listingViewCountByLocale(listing, resolved) + 1, resolved)}
                </span>
              </div>
            </div>
          </div>
          {/* Share/Recommend live in the header's top-right corner from sm
              up — tablet has the same spare width desktop does, nothing
              here needs lg:'s extra room, so both get the stack. Recommend
              leads: sharing a business is the deliberate, opt-in action,
              Share is the everyday one right below it. Below sm there's no
              corner left beside the logo, so the same two buttons render
              again, full-width side by side, in their own row under the
              badges instead — see the sm:hidden block below. */}
          <div className="hidden w-44 shrink-0 flex-col gap-2 sm:flex">
            <ShareButton
              title={listing.companyName}
              url={recommendUrl}
              message={recommendMessage}
              label={t.recommendLabel}
              icon="recommend"
              variant="primary"
              className="w-full bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
            />
            <ShareButton title={listing.companyName} url={pageUrl} label={t.shareLabel} className="w-full" />
          </div>
        </div>

        {/* Phone-width fallback for the corner stack above — same two
            buttons, same order, just a full-width row since there's no
            room beside the logo down here. flex-wrap is the safety net on
            the narrowest phones: whitespace-nowrap label text (see
            ShareButton) won't shrink below its own width, so if both
            buttons together don't fit one line, the second wraps to its
            own full-width line rather than clipping. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
          <ShareButton
            title={listing.companyName}
            url={recommendUrl}
            message={recommendMessage}
            label={t.recommendLabel}
            icon="recommend"
            variant="primary"
            className="flex-1 justify-center bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
          />
          <ShareButton title={listing.companyName} url={pageUrl} label={t.shareLabel} className="flex-1 justify-center" />
        </div>

        <ListingSectionNav sections={sectionLinks} navLabel={t.sectionNavLabel} />
      </div>

      <InquiryProvider>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            {/* Phone-width fallback for the sm:+ version tucked into the name
                column in the header above — same content and order, just
                moved down here (ahead of whichever section this page
                renders) rather than crowded into the header, which on a
                phone screen only has room for the logo and name before it.
                Industry/category get their own line; location, website and
                the view count share the next one — the view count rides
                along next to the website link (rather than its own separate
                line) since it's always present regardless of which of the
                others are. Rendered here regardless of which page this is,
                so a listing with no About text (or a visitor on any of its
                other pages) doesn't lose these on mobile. */}
            <div className="flex flex-col gap-2 sm:hidden">
              {(listing.industry || listing.categories.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 text-base text-slate-500 dark:text-slate-400">
                  {listing.industry && (
                    <Link href={industryPath(listing.industry, resolved)}>
                      <Badge className="bg-petrol px-2.5 py-1 text-sm font-semibold text-white ring-0 transition-colors hover:bg-petrol-ink dark:bg-petrol/70 dark:hover:bg-petrol">
                        {INDUSTRY_LABELS_BY_LOCALE[resolved][listing.industry]}
                      </Badge>
                    </Link>
                  )}
                  {listing.categories.map((category) => (
                    <Link key={category} href={categoryPath(slugify(category), resolved)}>
                      <Badge className="bg-petrol px-2.5 py-1 text-sm font-semibold text-white ring-0 transition-colors hover:bg-petrol-ink dark:bg-petrol/70 dark:hover:bg-petrol">
                        {translateCategoryName(category, resolved)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 text-base text-slate-500 dark:text-slate-400">
                <GoogleRatingBadge listing={listing} ratingLabel={t.googleRatingLabel} />
                {listing.state ? (
                  <Link
                    href={locationPath(slugify(locationLabel(listing.city, listing.state)), resolved)}
                    className="inline-flex items-center gap-1 hover:text-petrol hover:underline dark:hover:text-petrol-light"
                  >
                    <MapPin className="h-4 w-4" />
                    {locationLabel(listing.city, listing.state)}
                  </Link>
                ) : (
                  listing.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.city}
                    </span>
                  )
                )}
                {listing.country && (
                  <Link
                    href={`${directoryHomePath(resolved)}?country=${encodeURIComponent(listing.country)}`}
                    className="hover:text-petrol hover:underline dark:hover:text-petrol-light"
                  >
                    {listing.country}
                  </Link>
                )}
                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-petrol hover:underline dark:text-petrol-light"
                  >
                    <Globe className="h-4 w-4" />
                    {t.websiteLabel}
                  </a>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                  <Eye className="h-4 w-4" />
                  {formatViewsLabel(listingViewCountByLocale(listing, resolved) + 1, resolved)}
                </span>
              </div>
            </div>

            {children}
          </div>

          <InquiryScrollTarget id="contact" className="scroll-mt-32 md:sticky md:top-32 md:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.contactHeading}</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="mb-4 text-base text-slate-500 dark:text-slate-400">{t.contactSubheading}</p>
                {(listing.phone || listing.whatsAppNumber) && (
                  <div className="mb-4 flex gap-2">
                    {listing.phone && (
                      <a href={`tel:${listing.phone}`} className={buttonClasses("secondary", "md", "min-h-12 flex-1 justify-center gap-2")}>
                        <Phone className="h-4 w-4" />
                        {t.contactCallCta}
                      </a>
                    )}
                    {listing.whatsAppNumber && (
                      <a
                        href={whatsAppUrl(
                          listing.whatsAppNumber,
                          formatContactWhatsAppMessage(t.contactWhatsAppMessage, listing.companyName),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClasses("secondary", "md", "min-h-12 flex-1 justify-center gap-2")}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {t.contactWhatsAppCta}
                      </a>
                    )}
                  </div>
                )}
                <DirectoryLeadForm slug={slug} locale={resolved} />
              </CardBody>
            </Card>
          </InquiryScrollTarget>
        </div>
      </InquiryProvider>

      <RecommendBar title={listing.companyName} url={recommendUrl} message={recommendMessage} label={t.recommendLabel} />

      {/* Shown at every width, not just mobile: on md+ the Get in touch card
          is a sticky right-hand column (see its own md:sticky md:top-32
          above) — sticky only through the grid's own height, which runs the
          whole way down the left column's real content, but still ends
          before this bar's own row and RecommendBar above it. This bar
          stays truly fixed the whole way down, so "get in touch" is always
          one tap away regardless of scroll position, screen width, or which
          of this listing's pages a visitor is on — Contact is the one
          section every page still carries in its own right column, so
          "#contact" always resolves on the current page rather than needing
          a cross-page link the way Products & Services now does. Both
          buttons get the neutral `secondary` look — Recommend, floating
          above as its own solid-green pill, is the one that stands out.
          min-h-12 (up from the default h-9) makes both easier to tap. */}
      <nav
        aria-label={t.stickyNavLabel}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        {/* Constrained and centered rather than edge-to-edge — full-width
            flex-1 buttons read fine as a phone-width bar, but would stretch
            into two oversized buttons on a wide desktop screen now that this
            bar shows at every width. */}
        <div className="mx-auto flex max-w-sm gap-2">
          {display.services.length > 0 && (
            <Link
              href={directoryListingServicesPath(resolved, slug)}
              className={buttonClasses("secondary", "md", "min-h-12 flex-1 justify-center")}
            >
              {t.servicesHeading}
            </Link>
          )}
          <a href="#contact" className={buttonClasses("secondary", "md", "min-h-12 flex-1 justify-center")}>
            {t.contactHeading}
          </a>
        </div>
      </nav>
    </div>
  );
}
