import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronDown, Clock, Eye, Globe, MapPin } from "lucide-react";
import {
  currentDayInTimezone,
  DAYS_OF_WEEK,
  directoryImagePath,
  formatOpeningHoursSchema,
  getOrCreateReferralCode,
  getPublishedListingBySlug,
  incrementListingViewCount,
  isOpenNow,
  isUpdateCurrent,
  latestListings,
  listingLogoPath,
  loadPublishedListings,
  nearbyListingsExcludingIndustry,
  slugify,
  toDirectoryGridListing,
  toEmbeddableVideoUrl,
  buildBreadcrumbJsonLd,
  type ListingUpdateEntry,
  type OperatingHours,
} from "@/lib/directory";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildFaqJsonLd,
  buildLanguageAlternates,
  buildUpdatesJsonLd,
  buildVideoJsonLd,
  serializeJsonLd,
} from "@/lib/directory-seo";
import { renderMarkdownLite, stripMarkdownLiteToPlainText, truncateAtWordBoundary } from "@/lib/markdown-lite";
import { MAX_SEO_DESCRIPTION_LENGTH } from "@/lib/listing-seo-limits";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  INDUSTRY_LABELS_BY_LOCALE,
  VIDEO_CATEGORY_LABELS_BY_LOCALE,
  directoryHomePath,
  directoryListingPath,
  formatRecommendMessage,
  formatViewsLabel,
  type DirectoryLocale,
  type DirectoryStrings,
} from "@/lib/directory-i18n";
import { translateCategoryName, categoryPath } from "@/lib/directory-category-labels";
import { locationPath } from "@/lib/directory-location-labels";
import { industryPath } from "@/lib/directory-industry-labels";
import { getSiteOrigin } from "@/lib/site-url";
import { INDUSTRY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ListingLogo } from "@/components/directory/listing-logo";
import { ListingCard } from "@/components/directory/listing-card";
import { DirectoryLeadForm } from "@/components/directory/directory-lead-form";
import { InquiryProvider, InquiryScrollTarget } from "@/components/directory/listing-inquiry";
import { ServiceList } from "@/components/directory/service-list";
import { ShareButton } from "@/components/directory/share-button";
import { RecommendBar } from "@/components/directory/recommend-bar";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { VideoGallery } from "@/components/directory/video-gallery";
import { PhotoLightbox } from "@/components/directory/photo-lightbox";
import { ListingSectionNav } from "@/components/directory/listing-section-nav";

export const dynamic = "force-dynamic";

// How many other listings to surface in each of the two "other businesses"
// sections below this one (see latestListings/nearbyListingsExcludingIndustry)
// — enough to be useful, not so many the section competes with the
// listing's own content for attention.
const MAX_RELATED_LISTINGS = 6;

// Thin local alias so this file's several `typeof getPublishedListing`
// type references (below) stay put — the actual fetch now lives in
// src/lib/directory.ts, shared with this route's own opengraph-image.tsx.
async function getPublishedListing(slug: string) {
  return getPublishedListingBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const listing = await getPublishedListing(slug);
  if (!listing) return {};

  const siteOrigin = await getSiteOrigin();
  const url = `${siteOrigin}${directoryListingPath(resolved, slug)}`;
  // Meta/OG/Twitter descriptions are plain-text summaries — strip the
  // About field's own markdown-lite syntax first so a search result or
  // link preview never shows literal "**"/"[]()" characters. seoTitle/
  // seoDescription (optionally AI-written — see generateListingSeoMeta)
  // take priority when a partner has set them; everything after is the
  // same fallback chain as before.
  const plainDescription = stripMarkdownLiteToPlainText(listing.description);
  const description =
    listing.seoDescription?.trim() ||
    listing.tagline ||
    (plainDescription ? truncateAtWordBoundary(plainDescription, MAX_SEO_DESCRIPTION_LENGTH) : undefined) ||
    `${listing.companyName} on the business directory.`;
  const title = listing.seoTitle?.trim() || `${listing.companyName} | ${DIRECTORY_SITE_NAME_BY_LOCALE[resolved]}`;
  // Every listing gets the same branded card (company name, its services,
  // and this same description, in the gotka.com house style) as its link
  // preview, rather than a partner's own logo/photo — consistent quality
  // across the whole directory regardless of what a partner did or didn't
  // upload. Rendered by this route's own opengraph-image.tsx, which reads
  // the same published snapshot this function does.
  const shareImage = { url: `${siteOrigin}${directoryListingPath(resolved, slug)}/opengraph-image` };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      // The page body itself does vary by language (see the translation
      // lookup below, in the page component) even though this title/
      // description stay the partner's own single-language SEO fields.
      languages: buildLanguageAlternates(siteOrigin, (code) => directoryListingPath(code, slug)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title,
      description,
      url,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[resolved],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[resolved],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
  };
}

// A listing's logo is stored as a data: URL (see photoDataUrl), which
// Open Graph/Twitter/JSON-LD can't use directly — those are read by a
// crawler that fetches the image URL itself, not by a browser rendering
// the page. /api/directory-images/logo/[slug] decodes and re-serves it
// under a real URL instead (versioned by publish time, see
// listingLogoPath, so a replaced logo is a new URL to every cache and
// link-preview scraper too). Returns null when the listing has no logo —
// callers decide their own fallback (OG/Twitter inherit the directory's
// branded share image; JSON-LD's `image` is meant to represent this
// specific business, so it's left unset entirely rather than pointed at
// unrelated Gotka branding).
function buildListingLogoUrl(
  listing: NonNullable<Awaited<ReturnType<typeof getPublishedListing>>>,
  siteOrigin: string,
  slug: string,
): string | null {
  return listing.logoUrl ? `${siteOrigin}${listingLogoPath(slug, listing.publishedAt)}` : null;
}

// Every image worth telling a crawler about, logo first — the logo alone
// used to be all buildJsonLd/generateMetadata had to work with; the
// gallery (PublishedListingSnapshot.photos) is just as public and, unlike
// the logo, often carries its own caption, so it rides along here too
// rather than needing a second, parallel image list at each call site.
function listingImageEntries(
  listing: NonNullable<Awaited<ReturnType<typeof getPublishedListing>>>,
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

// Schema.org LocalBusiness markup — read by both search engines (SEO) and
// AI answer engines that crawl the page (GEO). Deliberately never includes
// a phone number: this is public, crawlable content, and the partner's own
// contact details stay internal (see PublishedListingSnapshot's own
// comment in src/lib/directory.ts) — a visitor reaches a partner only
// through the lead form below, never directly.
function buildJsonLd(
  listing: NonNullable<Awaited<ReturnType<typeof getPublishedListing>>>,
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
    // The visible price badge on the page itself is unaffected; this only
    // keeps the JSON-LD from asserting an invalid price value.
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

// A News/Promotion post's own dateline (see ListingUpdateEntry.postedAt),
// shown next to its title the way a news feed or blog normally dates its
// posts — matches the visiting locale, unlike the post's own English-only
// title/body (posts aren't translated at all — see ListingUpdateEntry's
// own comment in src/lib/directory.ts).
function formatUpdatePostedAt(postedAt: string, locale: DirectoryLocale): string {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${postedAt}T00:00:00`),
  );
}

// A single News/Promotion card — a promotion gets a soft brand-tinted card
// (same bg-led-soft token the Hours table's own "today" row highlight
// uses) rather than relying on its small badge alone to read as the more
// time-sensitive, actionable kind of the two.
function UpdateItem({ update, locale }: { update: ListingUpdateEntry; locale: DirectoryLocale }) {
  const t = DIRECTORY_STRINGS[locale];
  const isPromotion = update.kind === "PROMOTION";
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        isPromotion
          ? "border-led/30 bg-led-soft dark:border-led/20 dark:bg-led-soft-dark"
          : "border-slate-200 dark:border-neutral-800",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            isPromotion ? "bg-led text-led-ink ring-0" : "bg-slate-100 text-slate-600 ring-0 dark:bg-neutral-800 dark:text-slate-300"
          }
        >
          {isPromotion ? t.promotionLabel : t.newsLabel}
        </Badge>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{update.title}</h3>
        {update.postedAt && (
          <time dateTime={update.postedAt} className="text-xs text-slate-400">
            {formatUpdatePostedAt(update.postedAt, locale)}
          </time>
        )}
      </div>
      <div className="mt-1 text-base text-slate-600 dark:text-slate-300">
        {renderMarkdownLite(update.body, undefined, { zoomableImages: true })}
      </div>
    </div>
  );
}

type HoursRow = { day: string; label: string; status: string; isToday: boolean };

// One row per day of the week (Monday–Sunday, always all seven) rather than
// collapsing consecutive matching days into a range — this is the display
// table on the detail page; buildJsonLd's own openingHours still uses the
// compact grouped form, which is what schema.org actually wants.
function buildHoursRows(hours: OperatingHours, t: DirectoryStrings, timezone: string | null): HoursRow[] {
  // Prefer the listing's own timezone for "today" — an older listing with
  // none set falls back to the server's local day rather than showing no
  // highlight at all.
  const jsDay = new Date().getDay(); // 0 (Sun) .. 6 (Sat)
  const serverTodayKey = DAYS_OF_WEEK[(jsDay + 6) % 7]; // rotate to our Monday-first order
  const todayKey = (timezone && currentDayInTimezone(timezone)) || serverTodayKey;
  return DAYS_OF_WEEK.map((day) => {
    const isToday = day === todayKey;
    const dayHours = hours[day];
    const status = dayHours
      ? `${isToday ? t.hoursOpenTodayLabel : t.hoursOpenLabel}: ${dayHours.open} – ${dayHours.close}`
      : isToday
        ? t.hoursClosedTodayLabel
        : t.hoursClosedLabel;
    return { day, label: t.dayLabels[day], status, isToday };
  });
}

export default async function DirectoryListingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  // Reads the approved snapshot only — never the partner's live-editing
  // draft — same invariant the listing grid enforces (see
  // src/lib/directory.ts's PublishedListingSnapshot comment). A slug with
  // no snapshot at all (never approved, or since unpublished) 404s exactly
  // like one that doesn't exist.
  const listing = await getPublishedListing(slug);
  if (!listing) notFound();

  const [siteOrigin, , referralCode] = await Promise.all([
    getSiteOrigin(),
    incrementListingViewCount(listing.id, resolved),
    getOrCreateReferralCode(listing),
  ]);
  const t = DIRECTORY_STRINGS[resolved];
  const mapAddress = listing.address;
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
  const recommendUrl = `${pageUrl}?r=${referralCode}`;
  const recommendMessage = formatRecommendMessage(t.recommendMessage, listing.companyName, recommendUrl);

  // The partner's own tagline/description/services/faqs stay the source of
  // truth — a translation only stands in for whichever field it actually
  // covers, so a half-filled translation (tagline only, say) still shows
  // the primary language's About text (or services/FAQ) rather than
  // leaving it blank. Company name is never translated — always shown
  // exactly as the partner entered it, regardless of locale.
  const translation = resolved === "zh" || resolved === "ms" ? listing.translations[resolved] : undefined;
  const displayTagline = translation?.tagline || listing.tagline;
  const displayDescription = translation?.description || listing.description;
  const displayServices = translation?.services?.length ? translation.services : listing.services;
  const displayFaqs = translation?.faqs?.length ? translation.faqs : listing.faqs;
  // Not translated (see UpdatesEditor) — always the partner's own English
  // text, regardless of locale, same as companyName.
  const todayIso = new Date().toISOString().slice(0, 10);
  const currentUpdates = listing.updates.filter((update) => isUpdateCurrent(update, todayIso));
  // Promotions surface above news (more time-sensitive/actionable), each
  // under its own subheading — only shown when both kinds are present, same
  // as the Media card's Videos/Photos split above, so a listing with only
  // one kind still reads as a single plain list under "News & Promotions".
  const currentPromotions = currentUpdates.filter((update) => update.kind === "PROMOTION");
  const currentNews = currentUpdates.filter((update) => update.kind === "NEWS");
  // Neither are the videos (see VideosEditor) — category labels below are
  // looked up per-locale (VIDEO_CATEGORY_LABELS_BY_LOCALE), but a title is
  // whatever the partner (or the oEmbed lookup) actually typed, same as
  // companyName.
  const videoGallery = listing.videos.map((video) => ({ ...video, embed: toEmbeddableVideoUrl(video.url) }));

  // Home > (first category, if any) > this business. Only the first
  // category, not every one a listing has — a breadcrumb trail is meant to
  // read as one path back to the root, not an exhaustive tag list.
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

  // Two ways to reach another business from this page — without these,
  // landing here from search or an AI answer engine has no path to another
  // listing except going all the way back to the directory home.
  // Deliberately NOT grouped by this listing's own category/industry (the
  // section this replaced): the newest published listings overall, and
  // other listings in the same state but a different industry, so a
  // visitor sees fresh and nearby businesses rather than a list of this
  // one's direct competitors.
  const publishedRows = await loadPublishedListings();
  const latestBusinesses = latestListings(publishedRows, slug, MAX_RELATED_LISTINGS).map((row) =>
    toDirectoryGridListing(row, resolved),
  );
  const nearbyBusinesses = listing.state
    ? nearbyListingsExcludingIndustry(publishedRows, listing.state, slug, listing.industry, MAX_RELATED_LISTINGS).map(
        (row) => toDirectoryGridListing(row, resolved),
      )
    : [];

  // The header's own jump-to-section tab strip (see ListingSectionNav) —
  // same conditions as each section's own Card below, in the same order
  // they appear on the page, so a tab only ever points at something that's
  // actually there to scroll to.
  const hasMedia = videoGallery.length > 0 || listing.photos.length > 0;
  const sectionLinks = [
    displayDescription && { href: "#about", label: t.aboutHeading },
    displayServices.length > 0 && { href: "#services", label: t.servicesHeading },
    listing.operatingHours && { href: "#hours", label: t.hoursHeading },
    hasMedia && { href: "#media", label: t.mediaHeading },
    currentUpdates.length > 0 && { href: "#news", label: t.updatesHeading },
    mapAddress && { href: "#visit", label: t.visitHeading },
    displayFaqs.length > 0 && { href: "#faq", label: t.faqHeading },
    { href: "#contact", label: t.contactHeading },
  ].filter((section): section is { href: string; label: string } => Boolean(section));

  return (
    // Top padding matches the category/location pages' own breadcrumb
    // spacing (see category-page-content.tsx/location-page-content.tsx) so
    // it doesn't sit flush against the sticky header. Bottom padding clears
    // whatever is pinned over the page's foot at every width: the jump bar
    // below, plus the RecommendBar pill floating just above it.
    <div className="w-full px-4 pt-4 pb-40 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildJsonLd(
            { ...listing, services: displayServices },
            pageUrl,
            listingImageEntries(listing, siteOrigin, slug),
          ),
        }}
      />
      {displayFaqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildFaqJsonLd(displayFaqs) }}
        />
      )}
      {videoGallery.map((video, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildVideoJsonLd(video, video.embed?.embedUrl ?? null, listing.companyName) }}
        />
      ))}
      {currentUpdates.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildUpdatesJsonLd(currentUpdates, siteOrigin, pageUrl) }}
        />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <div className="mb-4">
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
            {displayTagline && <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{displayTagline}</p>}
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <Eye className="h-4 w-4" />
              {/* listing.viewCount is the count from before this load — the
                  increment above runs in parallel rather than being awaited
                  first, so it hasn't landed yet. +1 so this visitor's own
                  view is reflected immediately instead of showing up only on
                  the next page load. */}
              {formatViewsLabel(listing.viewCount + 1, resolved)}
            </p>
            {/* From sm up, industry/category/state/country/website live here
                — in the same column as the name and tagline, beside the
                logo — rather than their own full-width row further down,
                which otherwise leaves the space below a short tagline next
                to a 200px logo empty. Below sm there's no spare height left
                in this column for a phone-width logo, so the sm:hidden
                block after this row repeats the same content as its own
                full-width row instead. Industry/category, state/country,
                and website are three separate lines (each still its own
                flex-wrap row, for a long combination within one group)
                rather than one shared wrapping row. */}
            {(listing.industry || listing.categories.length > 0 || listing.city || listing.state || listing.country || listing.website) && (
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
                {(listing.city || listing.state || listing.country) && (
                  <div className="flex flex-wrap items-center gap-2 text-base text-slate-500 dark:text-slate-400">
                    {listing.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.city}
                      </span>
                    )}
                    {listing.state && (
                      <Link
                        href={locationPath(slugify(listing.state), resolved)}
                        className={cn(
                          "hover:text-petrol hover:underline dark:hover:text-petrol-light",
                          !listing.city && "inline-flex items-center gap-1",
                        )}
                      >
                        {!listing.city && <MapPin className="h-4 w-4" />}
                        {listing.state}
                      </Link>
                    )}
                    {listing.country && (
                      <Link
                        href={`${directoryHomePath(resolved)}?country=${encodeURIComponent(listing.country)}`}
                        className="hover:text-petrol hover:underline dark:hover:text-petrol-light"
                      >
                        {listing.country}
                      </Link>
                    )}
                  </div>
                )}
                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-base text-petrol hover:underline dark:text-petrol-light"
                  >
                    <Globe className="h-4 w-4" />
                    {t.websiteLabel}
                  </a>
                )}
              </div>
            )}
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

        {/* Phone-width fallback for the sm:+ version tucked into the name
            column above — same content and order, just its own full-width
            block since there's no spare height beside the logo down here.
            Industry/category get their own line; state/country and website
            share the next one (there's enough width for all three on a
            phone, unlike the desktop column squeezed beside a 200px logo,
            which keeps them on three separate lines). */}
        {(listing.industry || listing.categories.length > 0 || listing.city || listing.state || listing.country || listing.website) && (
          <div className="mt-3 flex flex-col gap-2 sm:hidden">
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
            {(listing.city || listing.state || listing.country || listing.website) && (
              <div className="flex flex-wrap items-center gap-2 text-base text-slate-500 dark:text-slate-400">
                {listing.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.city}
                  </span>
                )}
                {listing.state && (
                  <Link
                    href={locationPath(slugify(listing.state), resolved)}
                    className={cn(
                      "hover:text-petrol hover:underline dark:hover:text-petrol-light",
                      !listing.city && "inline-flex items-center gap-1",
                    )}
                  >
                    {!listing.city && <MapPin className="h-4 w-4" />}
                    {listing.state}
                  </Link>
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
              </div>
            )}
          </div>
        )}

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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {displayDescription && (
              <Card id="about" className="scroll-mt-32">
                <CardHeader>
                  <CardTitle className="text-base">{t.aboutHeading}</CardTitle>
                </CardHeader>
                <CardBody className="text-base text-slate-600 dark:text-slate-300">
                  {renderMarkdownLite(displayDescription, undefined, { zoomableImages: true })}
                </CardBody>
              </Card>
            )}

            {(displayServices.length > 0 || listing.operatingHours) && (
              <div
                className={cn(
                  "grid gap-6",
                  displayServices.length > 0 && listing.operatingHours ? "sm:grid-cols-2" : "",
                )}
              >
                {displayServices.length > 0 && (
                  <Card id="services" className="scroll-mt-32">
                    <CardHeader>
                      <CardTitle className="text-base">{t.servicesHeading}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ServiceList services={displayServices} />
                    </CardBody>
                  </Card>
                )}
                {listing.operatingHours && (
                  <Card id="hours" className="scroll-mt-32">
                    <CardHeader className="gap-2">
                      <CardTitle className="flex items-center gap-1.5 text-base">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {t.hoursHeading}
                      </CardTitle>
                      {listing.timezone &&
                        (() => {
                          const openNow = isOpenNow(listing.operatingHours, listing.timezone);
                          if (openNow === null) return null;
                          return (
                            <Badge
                              className={
                                openNow
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-slate-400"
                              }
                            >
                              {openNow ? t.hoursOpenNowBadge : t.hoursClosedNowBadge}
                            </Badge>
                          );
                        })()}
                    </CardHeader>
                    <CardBody>
                      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800">
                        <table className="w-full text-base">
                          <tbody>
                            {buildHoursRows(listing.operatingHours, t, listing.timezone).map((row) => (
                              <tr
                                key={row.day}
                                className={cn(
                                  "border-b border-slate-200 last:border-b-0 dark:border-neutral-800",
                                  row.isToday && "bg-led-soft dark:bg-led-soft-dark",
                                )}
                              >
                                <td
                                  className={cn(
                                    "px-3 py-2 font-semibold text-slate-700 dark:text-slate-300",
                                    row.isToday && "text-petrol-ink dark:text-petrol-light",
                                  )}
                                >
                                  {row.label}
                                </td>
                                <td
                                  className={cn(
                                    "px-3 py-2 text-slate-600 dark:text-slate-300",
                                    row.isToday && "font-semibold text-petrol-ink dark:text-petrol-light",
                                  )}
                                >
                                  {row.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}

            {hasMedia && (
              <Card id="media" className="scroll-mt-32">
                <CardHeader>
                  <CardTitle className="text-base">{t.mediaHeading}</CardTitle>
                </CardHeader>
                <CardBody className="space-y-6">
                  {videoGallery.length > 0 && (
                    <div>
                      {listing.photos.length > 0 && (
                        <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{t.videoHeading}</h3>
                      )}
                      <VideoGallery
                        companyName={listing.companyName}
                        videos={videoGallery.map((video) => ({
                          url: video.url,
                          title: video.title,
                          category: video.category,
                          categoryLabel: VIDEO_CATEGORY_LABELS_BY_LOCALE[resolved][video.category],
                          thumbnailUrl: video.thumbnailUrl,
                          embedUrl: video.embed?.embedUrl ?? null,
                        }))}
                      />
                    </div>
                  )}
                  {listing.photos.length > 0 && (
                    <div>
                      {videoGallery.length > 0 && (
                        <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{t.photosHeading}</h3>
                      )}
                      <PhotoLightbox
                        companyName={listing.companyName}
                        photos={listing.photos.map((photo) => ({
                          id: photo.id,
                          src: directoryImagePath(photo.id),
                          caption: photo.caption,
                          // Caption plus company name, not caption alone — a
                          // photo with no caption still gets a distinct,
                          // non-generic alt instead of repeating the bare
                          // company name across every uncaptioned photo on
                          // the page, and a photo with one gets the
                          // business tied to it explicitly (useful to an AI
                          // crawler that only sees this image out of
                          // context, e.g. via Google Images).
                          alt: photo.caption ? `${photo.caption} – ${listing.companyName}` : listing.companyName,
                        }))}
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {currentUpdates.length > 0 && (
              <Card id="news" className="scroll-mt-32">
                <CardHeader>
                  <CardTitle className="text-base">{t.updatesHeading}</CardTitle>
                </CardHeader>
                <CardBody className="space-y-5">
                  {currentPromotions.length > 0 && (
                    <div className="space-y-3">
                      {currentNews.length > 0 && (
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t.promotionLabel}</h3>
                      )}
                      {currentPromotions.map((update, index) => (
                        <UpdateItem key={index} update={update} locale={resolved} />
                      ))}
                    </div>
                  )}
                  {currentNews.length > 0 && (
                    <div className="space-y-3">
                      {currentPromotions.length > 0 && (
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t.newsLabel}</h3>
                      )}
                      {currentNews.map((update, index) => (
                        <UpdateItem key={index} update={update} locale={resolved} />
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {mapAddress && (
              <Card id="visit" className="scroll-mt-32">
                <CardHeader>
                  <CardTitle className="text-base">{t.visitHeading}</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  {listing.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress.replace(/\n/g, ", "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-base text-slate-600 hover:text-petrol hover:underline dark:text-slate-300 dark:hover:text-petrol-light"
                    >
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      <span className="whitespace-pre-wrap">{listing.address}</span>
                    </a>
                  )}
                  <iframe
                    title={`${listing.companyName} on the map`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress.replace(/\n/g, ", "))}&output=embed`}
                    className="h-96 w-full rounded-md border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </CardBody>
              </Card>
            )}

            {displayFaqs.length > 0 && (
              <Card id="faq" className="scroll-mt-32">
                <CardHeader>
                  <CardTitle className="text-base">{t.faqHeading}</CardTitle>
                </CardHeader>
                <CardBody className="space-y-2">
                  {displayFaqs.map((faq, index) => (
                    <details
                      key={index}
                      className="group rounded-md border border-slate-200 px-3 py-2 dark:border-neutral-800"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-base font-semibold text-slate-900 marker:content-none dark:text-slate-100">
                        {faq.question}
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{faq.answer}</p>
                    </details>
                  ))}
                </CardBody>
              </Card>
            )}

            {/* Both kept inside this column (rather than full-width
                sections below the grid, where they used to live) so the
                grid itself — and with it the "Get in touch" card's sticky
                containing block — extends the whole way down through them.
                Sticky only holds while its own column has room left to move
                within; ending the grid right after the last card left the
                contact card scrolling away well before the page's actual
                end. */}
            {latestBusinesses.length > 0 && (
              <section aria-labelledby="latest-businesses">
                <h2 id="latest-businesses" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t.latestBusinessesHeading}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {latestBusinesses.map((related) => (
                    <ListingCard
                      key={related.slug}
                      listing={related}
                      viewLabel={t.viewListing}
                      industryLabel={related.industry ? INDUSTRY_LABELS_BY_LOCALE[resolved][related.industry] : undefined}
                      locale={resolved}
                    />
                  ))}
                </div>
              </section>
            )}

            {nearbyBusinesses.length > 0 && (
              <section aria-labelledby="nearby-businesses">
                <h2 id="nearby-businesses" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t.nearbyBusinessesHeading}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {nearbyBusinesses.map((related) => (
                    <ListingCard
                      key={related.slug}
                      listing={related}
                      viewLabel={t.viewListing}
                      industryLabel={related.industry ? INDUSTRY_LABELS_BY_LOCALE[resolved][related.industry] : undefined}
                      locale={resolved}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <InquiryScrollTarget id="contact" className="scroll-mt-32 lg:sticky lg:top-32 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.contactHeading}</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="mb-4 text-base text-slate-500 dark:text-slate-400">{t.contactSubheading}</p>
                <DirectoryLeadForm slug={slug} locale={resolved} />
              </CardBody>
            </Card>
          </InquiryScrollTarget>
        </div>
      </InquiryProvider>

      <RecommendBar title={listing.companyName} url={recommendUrl} message={recommendMessage} label={t.recommendBusinessCta} />

      {/* Shown at every width, not just mobile: on lg+ the Get in touch card
          is a sticky right-hand column (see its own lg:sticky lg:top-32
          above, and the latest/nearby-businesses sections' own comment on
          why they're inside that same grid) — sticky only through the grid's own
          height, which now runs the whole way down the left column's real
          content, but still ends before this bar's own row and RecommendBar
          above it. This bar stays truly fixed the whole way down, so "get
          in touch" is always one tap away regardless of scroll position or
          screen width. */}
      <nav
        aria-label={t.stickyNavLabel}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
      >
        {/* Constrained and centered rather than edge-to-edge — full-width
            flex-1 buttons read fine as a phone-width bar, but would stretch
            into two oversized buttons on a wide desktop screen now that this
            bar shows at every width. */}
        <div className="mx-auto flex max-w-sm gap-2">
          {displayServices.length > 0 && (
            <a href="#services" className={buttonClasses("secondary", "md", "flex-1 justify-center")}>
              {t.servicesHeading}
            </a>
          )}
          <a
            href="#contact"
            className={buttonClasses("primary", "md", "flex-1 justify-center bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led")}
          >
            {t.contactHeading}
          </a>
        </div>
      </nav>
    </div>
  );
}
