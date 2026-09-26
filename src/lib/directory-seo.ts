import type { Metadata } from "next";
import { DEFAULT_DIRECTORY_LOCALE, DIRECTORY_LOCALES, directoryHomePath, type DirectoryLocale } from "@/lib/directory-i18n";
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

export const DIRECTORY_PUBLISHER = {
  name: "Gotka Technologies",
  alternateName: "Gotka",
  url: "https://gotka.com",
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
// src/app/[locale]/business/opengraph-image.tsx. Every directory page
// references it explicitly, as an absolute URL, rather than leaning on that
// file convention's own inheritance: a nested page that sets its own
// openGraph block — every one of them does, for title/description/url —
// replaces the segment's block wholesale, images included, which silently
// left the category, sign-up and logo-less listing pages with no image.
export const DIRECTORY_SHARE_IMAGE_ALT = "Gotka Business Directory";
export const DIRECTORY_SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

export function directoryShareImage(siteOrigin: string, locale: DirectoryLocale) {
  return {
    url: `${siteOrigin}${directoryHomePath(locale)}/opengraph-image`,
    ...DIRECTORY_SHARE_IMAGE_SIZE,
    alt: DIRECTORY_SHARE_IMAGE_ALT,
  };
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
}): Metadata {
  const plainDescription = stripMarkdownLiteToPlainText(listing.description);
  const description =
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
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
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
    description: video.title ? `${video.title} — ${companyName}` : companyName,
    ...(video.thumbnailUrl ? { thumbnailUrl: [video.thumbnailUrl] } : {}),
    contentUrl: video.url,
    ...(embedUrl ? { embedUrl } : {}),
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
