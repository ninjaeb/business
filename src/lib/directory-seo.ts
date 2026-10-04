import type { Metadata } from "next";
import {
  DEFAULT_DIRECTORY_LOCALE,
  DIRECTORY_LOCALES,
  DIRECTORY_STRINGS,
  directoryGuidePath,
  directoryGuidesPath,
  directoryHomePath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import type { FaqEntry, ListingUpdateEntry, PublishedListingSnapshot, VideoEntry } from "@/lib/directory";
import { firstMarkdownLiteImageUrl, stripMarkdownLiteToPlainText, truncateAtWordBoundary } from "@/lib/markdown-lite";
import { MAX_SEO_DESCRIPTION_LENGTH } from "@/lib/listing-seo-limits";

// What every public directory page shares for search engines (SEO) and AI
// answer engines (GEO) that isn't a translated UI string: the brand the
// pages belong to, the robots directives, the hreflang set, and the
// site-level JSON-LD (WebSite/Organization) that each page's own
// CollectionPage/LocalBusiness markup points back at. No database access —
// safe to import from anywhere server-side.

// og:site_name / the WebSite entity's name. Kept apart from
// DIRECTORY_HOME_TITLE_BY_LOCALE ("Business Directory"), which is the home
// page's own name as an H1/breadcrumb — a site name that just repeats the
// page title tells a crawler nothing about who publishes it.
export const DIRECTORY_SITE_NAME_BY_LOCALE: Record<DirectoryLocale, string> = {
  en: "Gotka Business Directory",
  zh: "Gotka 企业目录",
  ms: "Direktori Perniagaan Gotka",
};

// Facebook/Open Graph locale codes for og:locale — ms_MY is in Facebook's
// own list; there's no en_MY, so English uses the generic en_US.
export const OG_LOCALE_BY_DIRECTORY_LOCALE: Record<DirectoryLocale, string> = {
  en: "en_US",
  zh: "zh_CN",
  ms: "ms_MY",
};

// Address/phone as published on gotka.com's own /contact page (also the
// source for the Contact page's copy — see directory-contact-copy.ts) —
// real operator details, not invented ones, for the Organization node's
// own address/telephone (an E-E-A-T trust signal a search engine or AI
// answer engine reads directly off the site, not just off gotka.com).
export const DIRECTORY_PUBLISHER = {
  name: "Gotka Technologies",
  alternateName: "Gotka",
  url: "https://gotka.com",
  email: "hello@gotka.com",
  telephone: "+60 11-6331 6630",
  address: {
    streetAddress: "93, Jalan Kerongsang 5",
    addressLocality: "Bandar Puteri Klang",
    postalCode: "41200",
    addressRegion: "Selangor",
    addressCountry: "MY",
  },
} as const;

// max-image-preview:large lets Google show a listing's full logo/share image
// in results and Discover rather than a thumbnail; the -1s lift the default
// snippet/video-preview caps. Applied by every indexable directory page.
export const DIRECTORY_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

// For a page that exists but has nothing to index yet (a category no
// published business carries) — still crawlable with its links followed,
// so it's picked up the moment it fills, but kept out of the index rather
// than sitting there as a near-empty page.
export const DIRECTORY_NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

// The directory's branded 1200×630 share image, rendered by
// src/app/[locale]/opengraph-image.tsx. Every directory page references it
// explicitly, as an absolute URL, rather than leaning on that file
// convention's own inheritance: a nested page that sets its own openGraph
// block — every one of them does, for title/description/url — replaces the
// segment's block wholesale, images included, which silently left the
// category, sign-up and logo-less listing pages with no image.
export const DIRECTORY_SHARE_IMAGE_ALT = "Gotka Business Directory";
export const DIRECTORY_SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

// Same shape, for a page whose own opengraph-image route renders something
// more specific than the generic card above (see category/industry/
// location's own opengraph-image.tsx, via directory-og-image.tsx) —
// `pageUrl` is the page's own absolute URL, already computed by every
// caller, so this just points at its opengraph-image sibling route instead
// of the home page's.
export function pageShareImage(pageUrl: string, alt: string) {
  return {
    url: `${pageUrl}/opengraph-image`,
    ...DIRECTORY_SHARE_IMAGE_SIZE,
    alt,
  };
}

export function directoryShareImage(siteOrigin: string, locale: DirectoryLocale) {
  return pageShareImage(`${siteOrigin}${directoryHomePath(locale)}`, DIRECTORY_SHARE_IMAGE_ALT);
}

// Every language version of one page, plus x-default pointing at English —
// what hreflang expects when none of the listed languages matches a
// visitor. Each page passes its own path builder.
export function buildLanguageAlternates(
  siteOrigin: string,
  pathFor: (locale: DirectoryLocale) => string,
): Record<string, string> {
  return {
    ...Object.fromEntries(DIRECTORY_LOCALES.map(({ code }) => [code, `${siteOrigin}${pathFor(code)}`])),
    "x-default": `${siteOrigin}${pathFor(DEFAULT_DIRECTORY_LOCALE)}`,
  };
}

// Shared by the listing's own About page and each of its section pages
// (Products & Services, Photos, Videos, News, Promotions, Visit us, FAQ —
// see src/app/[locale]/[slug]/) — every one of them wants the same title/
// description fallback chain and the same OG/Twitter/robots/hreflang shape,
// differing only in which page's own URL is canonical and (past About)
// which section name reads after the title's own em dash. The partner's
// seoTitle/seoDescription (or their fallbacks) describe the whole listing,
// not any one section, so they're reused as-is rather than rewritten per
// page — only the title gets a suffix, so a share of the Products &
// Services page still reads as "Acme Co | Gotka Business Directory –
// Products & Services" rather than losing the business's own name entirely.
export function buildListingMetadata({
  listing,
  siteOrigin,
  locale,
  pageUrl,
  pathFor,
  sectionHeading,
  shareImagePath,
  descriptionOverride,
}: {
  listing: Pick<PublishedListingSnapshot, "seoTitle" | "seoDescription" | "tagline" | "description" | "companyName">;
  siteOrigin: string;
  locale: DirectoryLocale;
  pageUrl: string;
  pathFor: (locale: DirectoryLocale) => string;
  // Omitted for the About page — the bare listing URL needs no suffix,
  // same as it never had one before it had siblings to distinguish itself
  // from.
  sectionHeading?: string;
  shareImagePath: string;
  // A page whose own content is more specific than "this listing" — one
  // named photo album, so far (see photos/page.tsx) — can describe exactly
  // what's actually on it instead of the whole listing's own tagline/About
  // text, which is what every other section page still falls back to.
  // Applied everywhere `description` below would otherwise go (top-level,
  // openGraph, twitter) so all three stay in sync, same as the fallback
  // chain already keeps them.
  descriptionOverride?: string;
}): Metadata {
  const plainDescription = stripMarkdownLiteToPlainText(listing.description);
  const description =
    descriptionOverride ||
    listing.seoDescription?.trim() ||
    listing.tagline ||
    (plainDescription ? truncateAtWordBoundary(plainDescription, MAX_SEO_DESCRIPTION_LENGTH) : undefined) ||
    `${listing.companyName} on the business directory.`;
  const baseTitle = listing.seoTitle?.trim() || `${listing.companyName} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`;
  const title = sectionHeading ? `${baseTitle} – ${sectionHeading}` : baseTitle;
  const shareImage = { url: `${siteOrigin}${shareImagePath}` };

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: buildLanguageAlternates(siteOrigin, pathFor),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title,
      description,
      url: pageUrl,
      // The listing's own name, not the directory's — google.com/search's
      // "site name" chip (the bold text next to the favicon) reads this
      // per-page, and a visitor searching for this specific business should
      // see its own name there, not "Gotka Business Directory" repeated
      // across every one of this listing's own pages. Every other page type
      // (home, category, location, guides, ...) genuinely is the directory
      // itself, so only this shared listing-page builder overrides it.
      siteName: listing.companyName,
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
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

// JSON.stringify doesn't escape "</script>" — a company name or FAQ answer
// containing that literal string could otherwise break out of the script
// tag. < is invisible to JSON parsing but not to an HTML tokenizer, so this
// neutralizes it either way.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function websiteJsonLdId(siteOrigin: string): string {
  return `${siteOrigin}/#website`;
}

export function organizationJsonLdId(siteOrigin: string): string {
  return `${siteOrigin}/#organization`;
}

// Schema.org WebSite with a SearchAction — tells a search engine the
// directory has its own search box and how to deep-link into it (the ?q=
// param DirectorySearch already reads), and gives every page's
// CollectionPage/LocalBusiness markup one site-level entity to point back
// at through isPartOf.
export function buildDirectoryWebSiteJsonLd(siteOrigin: string, locale: DirectoryLocale, searchPath: string): string {
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteJsonLdId(siteOrigin),
    name: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
    url: `${siteOrigin}/`,
    inLanguage: DIRECTORY_LOCALES.map(({ code }) => code),
    publisher: { "@id": organizationJsonLdId(siteOrigin) },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteOrigin}${searchPath}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

// The publisher's own other official profiles — sameAs is what tells a
// search engine's Knowledge Graph (and an AI answer engine resolving who
// "Gotka" is) that these are the same entity as the Organization node
// below, not a coincidentally-named lookalike. Each one is a page Gotka
// itself controls, not a mention of the brand elsewhere. Exported (with a
// label, not just the bare URL list sameAs itself needs) so
// DirectoryChrome's footer can render these as real, crawlable <a> links
// too — a search/AI crawler reading the DOM for social profile links never
// sees inside a JSON-LD script tag, only this list's own use in
// buildDirectoryOrganizationJsonLd's sameAs did before that.
export const DIRECTORY_SAME_AS = [
  { label: "Facebook", url: "https://www.facebook.com/p/Gotka-Technologies-61564390635502/" },
  { label: "LinkedIn", url: "https://www.linkedin.com/company/gotka-technologies/" },
];

// Who publishes the directory — the entity an AI answer engine attributes
// the whole thing to. gotka.com (the marketing site) is the organization's
// own URL; this app's icon stands in for a logo.
export function buildDirectoryOrganizationJsonLd(siteOrigin: string): string {
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationJsonLdId(siteOrigin),
    name: DIRECTORY_PUBLISHER.name,
    alternateName: DIRECTORY_PUBLISHER.alternateName,
    url: DIRECTORY_PUBLISHER.url,
    logo: `${siteOrigin}/icon-512.png`,
    sameAs: DIRECTORY_SAME_AS.map((profile) => profile.url),
    email: DIRECTORY_PUBLISHER.email,
    telephone: DIRECTORY_PUBLISHER.telephone,
    address: { "@type": "PostalAddress", ...DIRECTORY_PUBLISHER.address },
  });
}

// A Place entity for one city+state grouping on the location page (see
// LocationPageContent) — schema.org's CollectionPage (what that page's own
// buildDirectoryCollectionJsonLd already emits, shared with category/
// industry/home) has no "this page is about a place" slot of its own, so
// this rides alongside it as its own top-level entity instead, same
// "stands alone" shape as every other JSON-LD block in this file.
// addressCountry is only ever included when at least one listing in the
// group actually carries a country (see countListingsByCityState) — never
// guessed from city/state alone.
export function buildPlaceJsonLd(name: string, city: string | null, state: string, country: string | null, url: string): string {
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "Place",
    name,
    url,
    address: {
      "@type": "PostalAddress",
      ...(city ? { addressLocality: city } : {}),
      addressRegion: state,
      ...(country ? { addressCountry: country } : {}),
    },
  });
}

// FAQPage is its own top-level entity, never nested inside LocalBusiness or
// CollectionPage. Rich snippets are the SEO payoff; being directly quotable
// Q&A is the GEO one. Shared by a listing's own FAQ and the directory home
// page's.
export function buildFaqJsonLd(faqs: FaqEntry[]): string {
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  });
}

// One VideoObject per video, its own <script> tag (Google's own examples
// place several standalone VideoObject blocks this way, rather than one
// array or an ItemList wrapper) — the SEO payoff is Google's video rich
// result/carousel, the GEO one is an AI crawler being able to tell what
// each embedded video actually is without having to load the iframe itself.
// Deliberately has no uploadDate: this app never asks a partner for one,
// and oEmbed doesn't reliably return one either, so making one up would be
// wrong rather than merely incomplete — Google's rich-result eligibility
// wants it, but a fabricated date is worse than an eligibility that never
// triggers. thumbnailUrl is only ever included when fetchVideoOEmbed
// actually found one (see VideoEntry) — omitted, never a placeholder, when
// it didn't.
export function buildVideoJsonLd(video: VideoEntry, embedUrl: string | null, companyName: string): string {
  const name = video.title || companyName;
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description: video.description || (video.title ? `${video.title} — ${companyName}` : companyName),
    ...(video.thumbnailUrl ? { thumbnailUrl: [video.thumbnailUrl] } : {}),
    contentUrl: video.url,
    ...(embedUrl ? { embedUrl } : {}),
  });
}

// One ImageObject per photo actually shown on the page (see
// photos/page.tsx — the flat grid, one album's own photos, or the "other
// photos" section, never the album-grid's own cover thumbnails, which
// stand for a whole album rather than being content in their own right).
// Same "@graph of one node type, none needing to stand alone" shape as
// buildUpdatesJsonLd. name/caption both fall back to companyName, same
// "distinct, non-generic" reasoning the page's own <img alt> already uses,
// since an uncaptioned photo would otherwise have no name at all here.
export function buildPhotoGalleryJsonLd(photos: { url: string; caption: string }[], companyName: string): string {
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: photo.url,
      name: photo.caption || companyName,
      ...(photo.caption ? { caption: photo.caption } : {}),
    })),
  });
}

// Each current News/Promotion post as its own Article node — the same
// "directly quotable, dated, structured" GEO payoff buildFaqJsonLd already
// gives FAQ entries. Always Article rather than splitting News into
// NewsArticle/Promotion into Offer: a bare Offer has no honest price to give
// (see buildJsonLd's own makesOffer comment on why a partner's free-text
// price never becomes a schema.org price), and NewsArticle carries stricter
// Google eligibility expectations that don't fit a partner's short post.
// Article's own inherited CreativeWork.expires — "date the content is no
// longer useful or available" — is exactly a Promotion's endDate, and gives
// a crawler or AI answer engine the freshness signal to stop citing a lapsed
// deal; a News post has no endDate and simply never expires. `image` is
// whichever image (if any) the partner embedded in the post's own body,
// resolved to an absolute URL — a free rich-result/GEO win straight from the
// same upload the editor's image button already produces. Wrapped in one
// @graph (rather than one <script> per post, the way the page's other
// JSON-LD blocks are split) since every node here shares one @context and
// none needs to stand alone the way LocalBusiness/FAQPage do.
export function buildUpdatesJsonLd(updates: ListingUpdateEntry[], siteOrigin: string, pageUrl: string): string {
  const organizationId = organizationJsonLdId(siteOrigin);
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": updates.map((update) => {
      const imageUrl = firstMarkdownLiteImageUrl(update.body);
      const node: Record<string, unknown> = {
        "@type": "Article",
        headline: update.title,
        articleBody: stripMarkdownLiteToPlainText(update.body),
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
        mainEntityOfPage: pageUrl,
      };
      if (update.postedAt) node.datePublished = update.postedAt;
      if (update.endDate) node.expires = update.endDate;
      if (imageUrl) node.image = new URL(imageUrl, siteOrigin).toString();
      return node;
    }),
  });
}

// Metadata for /guides — a plain aggregate index, same shape as
// buildNewsFeedMetadata/buildLatestProductsMetadata (no per-page data to
// read, unlike buildListingMetadata).
export function buildGuidesIndexMetadata(siteOrigin: string, locale: DirectoryLocale): Metadata {
  const t = DIRECTORY_STRINGS[locale];
  const title = `${t.guidesIndexHeading} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`;
  const pageUrl = `${siteOrigin}${directoryGuidesPath(locale)}`;
  const shareImage = directoryShareImage(siteOrigin, locale);
  return {
    title,
    description: t.guidesIndexDescription,
    alternates: {
      canonical: pageUrl,
      languages: buildLanguageAlternates(siteOrigin, directoryGuidesPath),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title,
      description: t.guidesIndexDescription,
      url: pageUrl,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: { card: "summary_large_image", title, description: t.guidesIndexDescription, images: [shareImage] },
  };
}

// A single guide's own detail page — same seoTitle/seoDescription fallback
// chain as buildListingMetadata, just against a guide's own fields (no
// tagline, no markdown `description` to strip — `excerpt` already is the
// short, plain-text summary).
export function buildGuideMetadata({
  guide,
  siteOrigin,
  locale,
}: {
  guide: { slug: string; title: string; excerpt: string; seoTitle: string | null; seoDescription: string | null };
  siteOrigin: string;
  locale: DirectoryLocale;
}): Metadata {
  const description = guide.seoDescription?.trim() || truncateAtWordBoundary(guide.excerpt, MAX_SEO_DESCRIPTION_LENGTH);
  const title = guide.seoTitle?.trim() || `${guide.title} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`;
  const pageUrl = `${siteOrigin}${directoryGuidePath(locale, guide.slug)}`;
  // The generic directory share image, not a per-guide dynamic render —
  // same choice the news feed's own cards make (see directoryShareImage),
  // rather than standing up a whole opengraph-image route for a content
  // type this pass is deliberately keeping to a working scaffold.
  const shareImage = directoryShareImage(siteOrigin, locale);
  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: buildLanguageAlternates(siteOrigin, (code) => directoryGuidePath(code, guide.slug)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "article",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  };
}

// Schema.org Article for a single guide — same shape as one node of
// buildUpdatesJsonLd's own @graph (author/publisher both point at the
// same site-level Organization entity — see that function's own comment
// for why this is deliberately not a personal byline), but standalone (a
// guide's detail page has exactly one) and carries dateModified alongside
// datePublished: an editorial guide is exactly the kind of content that
// gets revised after it first goes up, and AI overviews are said to
// weight a recently modified source over a stale one — the freshness
// signal this whole content type exists to serve.
export function buildGuideJsonLd(
  guide: { title: string; body: string; publishedAt: Date | null; updatedAt: Date },
  siteOrigin: string,
  pageUrl: string,
): string {
  const organizationId = organizationJsonLdId(siteOrigin);
  const imageUrl = firstMarkdownLiteImageUrl(guide.body);
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    articleBody: stripMarkdownLiteToPlainText(guide.body),
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
    mainEntityOfPage: pageUrl,
    dateModified: guide.updatedAt,
  };
  if (guide.publishedAt) node.datePublished = guide.publishedAt;
  if (imageUrl) node.image = new URL(imageUrl, siteOrigin).toString();
  return serializeJsonLd(node);
}
