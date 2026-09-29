import { cache } from "react";
import { db } from "@/lib/db";
import type { Industry, PartnerListing, Prisma } from "@/generated/prisma/client";
import { operatingHoursFromJson, type OperatingHours } from "@/lib/operating-hours";
import { slugify } from "@/lib/slug";
import {
  DIRECTORY_LOCALES,
  directoryListingPath,
  formatViewsLabel,
  INDUSTRY_LABELS_BY_LOCALE,
  VIDEO_CATEGORY_LABELS_BY_LOCALE,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { translateCategoryName } from "@/lib/directory-category-labels";
import { locationLabel } from "@/lib/directory-location-labels";
import { organizationJsonLdId, serializeJsonLd, websiteJsonLdId } from "@/lib/directory-seo";
import { INDUSTRIES, VIDEO_CATEGORIES, type VideoCategory, type VideoProvider } from "@/lib/labels";
import { stripMarkdownLiteToPlainText } from "@/lib/markdown-lite";
import { normalizeSearchText, type DirectorySearchIndex } from "@/lib/directory-search";

// Re-exported for existing server-side imports (actions, pages) that
// already pull these from "@/lib/directory" — but a "use client" component
// needing DAYS_OF_WEEK/OperatingHours/slugify etc. at runtime (not just as
// a type) must import them from "@/lib/operating-hours"/"@/lib/slug"
// directly, never from here: this module's own top-level `db` import can't
// be bundled for the browser.
export {
  currentDayInTimezone,
  DAYS_OF_WEEK,
  formatOpeningHoursSchema,
  groupOperatingHours,
  isOpenNow,
  isValidTimeString,
  operatingHoursFromJson,
  type DayGroup,
  type DayHours,
  type DayOfWeek,
  type OperatingHours,
} from "@/lib/operating-hours";
export { isValidSlugFormat, slugify } from "@/lib/slug";

// The only shape the public directory ever reads — a snapshot of a
// listing's public fields as they were the last time an admin approved
// them (see PartnerListing.publishedSnapshot in schema.prisma). Nothing a
// partner is still editing, and nothing that's never been approved, is ever
// visible here. Deliberately excludes the partner ACCOUNT's own
// User.email/phone (private login contact info) — `phone`/`whatsAppNumber`
// below are a different thing: a business's own contact numbers the partner
// explicitly sets on the listing itself, same opt-in-public convention as
// `website`. Two separate fields, not one — see PartnerListing.whatsAppNumber's
// own comment for why.
export type PublishedListingSnapshot = {
  companyName: string;
  tagline: string | null;
  description: string | null;
  services: ServiceEntry[];
  industry: Industry | null;
  website: string | null;
  // Google's own rating for this business, as of the last time a partner
  // ran AI Auto Create against a Google Maps place (see
  // PartnerListing.googleRating's own comment in prisma/schema.prisma) —
  // null until that's happened at least once, or when Google itself has no
  // rating on file. Never partner-editable.
  googleRating: number | null;
  googleRatingCount: number | null;
  // The Google Maps listing the rating above came from — what the star
  // rating links out to. Same provenance as googleRating; null on older
  // data set before this field existed.
  googleMapsUrl: string | null;
  phone: string | null;
  whatsAppNumber: string | null;
  videos: VideoEntry[];
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  operatingHours: OperatingHours | null;
  // The partner ACCOUNT's own timezone (User.timezone) as of publish time —
  // not per-listing; see buildPublishedSnapshot's partnerTimezone parameter.
  timezone: string | null;
  faqs: FaqEntry[];
  updates: ListingUpdateEntry[];
  // Gallery photos, in display order — id references DirectoryListingImage
  // (served via /api/directory-images/[id], same as an About-embedded
  // image), caption is this snapshot's own copy of that row's caption as of
  // publish time. Never the image bytes themselves — see buildPublishedSnapshot's
  // photos parameter for why those stay a live reference instead.
  photos: PhotoEntry[];
  categories: string[];
  translations: ListingTranslations;
  logoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

// `gallery` is the partner's own free-text label for grouping this photo
// with others (e.g. "Office", "Team") — empty string, like caption, when
// they haven't set one. See PhotoLightbox for how the public page groups by
// it once a listing has more than one distinct value among its photos.
export type PhotoEntry = { id: string; caption: string; gallery: string };

// Also the cap uploadListingGalleryPhoto (src/app/actions/directory-images.ts)
// enforces before creating a new row — exported so the two never drift apart.
export const MAX_GALLERY_PHOTOS = 12;

function sanitizePhotoEntry(entry: unknown): PhotoEntry | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) return null;
  return {
    id,
    caption: typeof raw.caption === "string" ? raw.caption.trim() : "",
    gallery: typeof raw.gallery === "string" ? raw.gallery.trim() : "",
  };
}

export function photosFromJson(value: unknown): PhotoEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(sanitizePhotoEntry)
    .filter((entry): entry is PhotoEntry => entry !== null)
    .slice(0, MAX_GALLERY_PHOTOS);
}

// A listing's video gallery — see VideosEditor. Only the URL and what the
// partner tells us (title, category) are ever partner-supplied; thumbnailUrl
// is fetched best-effort from the host's own oEmbed endpoint at add-time
// (see fetchVideoOEmbed in src/lib/video-oembed.ts) and stored here so the
// public page never depends on a live third-party call to render — same
// principle as every other external lookup in this app (Google Places,
// website scraping) happening at edit-time, not at request-time. A host
// oEmbed can't reach (Facebook, or any failed/timed-out lookup) just keeps
// thumbnailUrl null — the gallery still embeds it on click, just behind a
// plain placeholder instead of a real thumbnail (see VideoGallery). A host
// toEmbeddableVideoUrl doesn't recognize at all, or a Facebook Reel (which
// that function deliberately returns null for — see toEmbeddableVideoUrl),
// falls back further, to a plain "Watch video" link instead of an embed.
export type VideoEntry = {
  url: string;
  title: string;
  category: VideoCategory;
  thumbnailUrl: string | null;
};

const MAX_VIDEOS = 12;
const MAX_VIDEO_URL_LENGTH = 500;
const MAX_VIDEO_TITLE_LENGTH = 100;

function sanitizeVideoEntry(entry: unknown): VideoEntry | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const url = typeof raw.url === "string" ? raw.url.trim().slice(0, MAX_VIDEO_URL_LENGTH) : "";
  if (!url) return null;
  const category = VIDEO_CATEGORIES.includes(raw.category as VideoCategory) ? (raw.category as VideoCategory) : "OTHER";
  return {
    url,
    title: typeof raw.title === "string" ? raw.title.trim().slice(0, MAX_VIDEO_TITLE_LENGTH) : "",
    category,
    thumbnailUrl: typeof raw.thumbnailUrl === "string" ? raw.thumbnailUrl.trim() : null,
  };
}

export function videosFromJson(value: unknown): VideoEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(sanitizeVideoEntry)
    .filter((entry): entry is VideoEntry => entry !== null)
    .slice(0, MAX_VIDEOS);
}

// Parses the editor's serialized JSON (see VideosEditor's hidden input)
// permissively, same spirit as parseServicesJson/parseFaqsJson.
export function parseVideosJson(raw: string): VideoEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return videosFromJson(parsed);
}

function detectVideoProvider(host: string): VideoProvider | null {
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") return "youtube";
  if (host === "vimeo.com") return "vimeo";
  if (host === "dailymotion.com" || host === "dai.ly") return "dailymotion";
  if (host === "facebook.com" || host === "m.facebook.com" || host === "fb.watch") return "facebook";
  if (host === "tiktok.com" || host === "vm.tiktok.com") return "tiktok";
  return null;
}

// Common video hosts' watch/share URLs, converted to their embeddable iframe
// form, plus which host it detected (fetchVideoOEmbed uses this to skip
// Facebook, whose oEmbed now requires a Facebook developer app this project
// doesn't ask for — see that file). Returns null for a host this doesn't
// recognize; the caller falls back to a plain "Watch video" link pointing at
// the original URL in that case, same spirit as the map embed's own address
// parsing never rejecting an unusual input outright.
export function toEmbeddableVideoUrl(rawUrl: string): { embedUrl: string; provider: VideoProvider } | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  const provider = detectVideoProvider(host);
  if (!provider) return null;

  if (provider === "youtube") {
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : url.pathname.startsWith("/shorts/")
            ? url.pathname.slice(8)
            : url.pathname.startsWith("/embed/")
              ? url.pathname.slice(7)
              : null;
    // youtube-nocookie.com, not youtube.com: the privacy-enhanced embed
    // domain skips the session/cookie handshake that otherwise triggers
    // YouTube's "Sign in to confirm you're not a bot" overlay inside the
    // iframe on some videos/networks.
    return id ? { embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, provider } : null;
  }
  if (provider === "vimeo") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^\d+$/.test(id) ? { embedUrl: `https://player.vimeo.com/video/${id}`, provider } : null;
  }
  if (provider === "dailymotion") {
    // dai.ly/<id> (shortlink) or dailymotion.com/video/<id>[_slug]
    const id = host === "dai.ly" ? url.pathname.slice(1) : url.pathname.startsWith("/video/") ? url.pathname.slice(7) : null;
    return id ? { embedUrl: `https://www.dailymotion.com/embed/video/${id}`, provider } : null;
  }
  if (provider === "facebook") {
    // Reels (/reel/<id> and /share/r/<code> share links) consistently come
    // back "Video Unavailable" from this plugin — verified directly against
    // both the share link and its resolved canonical /reel/ URL, and Meta's
    // own embedded-video-player plugin doesn't officially cover Reels at
    // all, only Page/video-post URLs. No iframe URL is worth generating for
    // those; falling back to a plain "Watch video" link (the null case
    // below) is what actually plays for the visitor. Other Facebook video
    // shapes (/watch/?v=, /<page>/videos/<id>/) still go through the plugin
    // as before — the embed is over the ORIGINAL url, not a per-video id
    // extracted from the path.
    if (/^\/(reel|share\/r)\//.test(url.pathname)) return null;
    return { embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false`, provider };
  }
  // tiktok — player/v1 is TikTok's own documented embed-player endpoint
  // (developers.tiktok.com/docs/en/embed-player), a lightweight dedicated
  // player app. embed/v2 (the URL TikTok's oEmbed response's HTML snippet
  // points at) instead loads a cut-down copy of the full TikTok web app,
  // which is far more prone to showing an internal "overload-protect
  // triggered" wall in place of the video — a known, broadly-reported
  // TikTok-side embed reliability issue, not something specific to this
  // site. Same query-string convention as every other provider here, so
  // the lightbox's shared `?autoplay=1` append still works unchanged.
  const match = /\/video\/(\d+)/.exec(url.pathname);
  return match ? { embedUrl: `https://www.tiktok.com/player/v1/${match[1]}`, provider } : null;
}

// A listing's service/product catalog — see ServicesEditor. `description`
// and `price` are both freeform and optional (price is text, not a number:
// "RM 500", "From RM 200", "Contact for quote" are all legitimate) — only
// `title` is required for an entry to count at all.
export type ServiceEntry = { title: string; description: string; price: string };

// Capped well above what any real listing needs, just to keep a determined
// partner from ballooning the stored JSON and the page it renders into.
const MAX_SERVICES = 20;
const MAX_SERVICE_TITLE_LENGTH = 80;
const MAX_SERVICE_DESCRIPTION_LENGTH = 300;
const MAX_SERVICE_PRICE_LENGTH = 40;

function sanitizeServiceEntry(entry: unknown): ServiceEntry | null {
  // A bare string is an older listing's pre-restructure data (services
  // used to be just string[]) — upgraded in place into a title-only entry
  // rather than requiring a one-off migration, since the conversion is
  // lossless either way.
  if (typeof entry === "string") {
    const title = entry.trim().slice(0, MAX_SERVICE_TITLE_LENGTH);
    return title ? { title, description: "", price: "" } : null;
  }
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, MAX_SERVICE_TITLE_LENGTH) : "";
  if (!title) return null;
  return {
    title,
    description: typeof raw.description === "string" ? raw.description.trim().slice(0, MAX_SERVICE_DESCRIPTION_LENGTH) : "",
    price: typeof raw.price === "string" ? raw.price.trim().slice(0, MAX_SERVICE_PRICE_LENGTH) : "",
  };
}

export function servicesFromJson(value: unknown): ServiceEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(sanitizeServiceEntry)
    .filter((entry): entry is ServiceEntry => entry !== null)
    .slice(0, MAX_SERVICES);
}

// Parses the editor's serialized JSON (see ServicesEditor's hidden input)
// permissively — malformed JSON or a non-array becomes an empty list
// rather than a save error, same spirit as parseOperatingHoursFormData.
export function parseServicesJson(raw: string): ServiceEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return servicesFromJson(parsed);
}

// A listing's FAQ entries — see FaqEditor. Shown on the detail page and
// emitted as FAQPage JSON-LD (see buildFaqJsonLd in
// src/lib/directory-seo.ts), which is a straightforward, high-value
// win for both SEO (rich snippets) and GEO (an AI answer engine can quote a
// clearly-marked question/answer pair directly).
export type FaqEntry = { question: string; answer: string };

const MAX_FAQS = 20;
const MAX_FAQ_QUESTION_LENGTH = 150;
const MAX_FAQ_ANSWER_LENGTH = 500;

function sanitizeFaqEntry(entry: unknown): FaqEntry | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const question = typeof raw.question === "string" ? raw.question.trim().slice(0, MAX_FAQ_QUESTION_LENGTH) : "";
  const answer = typeof raw.answer === "string" ? raw.answer.trim().slice(0, MAX_FAQ_ANSWER_LENGTH) : "";
  if (!question || !answer) return null;
  return { question, answer };
}

export function faqsFromJson(value: unknown): FaqEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(sanitizeFaqEntry)
    .filter((entry): entry is FaqEntry => entry !== null)
    .slice(0, MAX_FAQS);
}

// Parses the editor's serialized JSON (see FaqEditor's hidden input)
// permissively, same spirit as parseServicesJson.
export function parseFaqsJson(raw: string): FaqEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return faqsFromJson(parsed);
}

// A listing's News & Promotions feed — see UpdatesEditor. Same
// draft-until-approved lifecycle as every other listing field (services,
// faqs, ...): posting or editing one only reaches the public page the next
// time the listing is submitted and approved, same as everything else on
// this form — there's no separate, unmoderated publish path for these, even
// though that means a time-sensitive promotion isn't instant. endDate is
// optional and mainly meaningful for a PROMOTION (a NEWS post has no natural
// expiry); the public page hides a promotion once its endDate has passed
// rather than requiring the partner to remember to remove it. No startDate:
// a promotion that shouldn't show yet is simply not posted yet. body is
// markdown-lite (see src/lib/markdown-lite.tsx), same grammar and image
// embedding as the About field, rendered with renderMarkdownLite rather than
// as plain text — and, unlike About, feeds a per-post Article JSON-LD node
// (see buildUpdatesJsonLd in src/lib/directory-seo.ts) for SEO/GEO. postedAt
// is stamped once, the moment a post is actually added (see UpdatesEditor's
// commit) — an original-publish date, never bumped by a later edit, same
// spirit as a blog post's own dateline; null on an entry saved before this
// field existed, which just omits datePublished from its JSON-LD rather
// than fabricating one.
export type ListingUpdateKind = "NEWS" | "PROMOTION";
export type ListingUpdateEntry = {
  kind: ListingUpdateKind;
  title: string;
  body: string;
  postedAt: string | null; // ISO date (YYYY-MM-DD), stamped client-side when the post is added
  endDate: string | null; // ISO date (YYYY-MM-DD), partner's own local date
};

const MAX_UPDATES = 20;
const MAX_UPDATE_TITLE_LENGTH = 100;
// Well above the old plain-text cap — a post's body is now markdown-lite,
// so this needs headroom for **bold**/list syntax and a couple of embedded
// ![alt](/api/directory-images/…) images on top of the visible text.
const MAX_UPDATE_BODY_LENGTH = 4000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function sanitizeUpdateEntry(entry: unknown): ListingUpdateEntry | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, MAX_UPDATE_TITLE_LENGTH) : "";
  const body = typeof raw.body === "string" ? raw.body.trim().slice(0, MAX_UPDATE_BODY_LENGTH) : "";
  if (!title || !body) return null;
  return {
    kind: raw.kind === "PROMOTION" ? "PROMOTION" : "NEWS",
    title,
    body,
    postedAt: typeof raw.postedAt === "string" && ISO_DATE_PATTERN.test(raw.postedAt) ? raw.postedAt : null,
    endDate: typeof raw.endDate === "string" && ISO_DATE_PATTERN.test(raw.endDate) ? raw.endDate : null,
  };
}

export function updatesFromJson(value: unknown): ListingUpdateEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(sanitizeUpdateEntry)
    .filter((entry): entry is ListingUpdateEntry => entry !== null)
    .slice(0, MAX_UPDATES);
}

// Parses the editor's serialized JSON (see UpdatesEditor's hidden input)
// permissively, same spirit as parseServicesJson/parseFaqsJson.
export function parseUpdatesJson(raw: string): ListingUpdateEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return updatesFromJson(parsed);
}

// A promotion past its own endDate is dropped from what the public page
// shows — a partner posting "20% off this weekend" shouldn't have to
// remember to come back and remove it once it's stale. News posts and
// promotions with no endDate never expire on their own. `today` is passed
// in (rather than read via `new Date()` here) so the detail page computes it
// once for every entry, consistently.
export function isUpdateCurrent(entry: ListingUpdateEntry, today: string): boolean {
  return !entry.endDate || entry.endDate >= today;
}

// AI-translated (or hand-edited) copies of tagline/description/services/
// faqs/updates for the directory's non-English locales — see
// translateListingContent in src/app/actions/directory.ts. Keyed by
// DirectoryLocale minus "en": the English fields are the primary
// tagline/description/services/faqs/updates themselves, never duplicated
// in here. A translated service keeps the same price as its English
// counterpart, and a translated update keeps the same kind/postedAt/
// endDate as its English counterpart (none of those are language-specific)
// — see handleTranslate in partner-listing-form.tsx, which re-attaches
// them by index right after the AI call returns.
export type ListingTranslations = Partial<
  Record<
    Exclude<DirectoryLocale, "en">,
    { tagline: string; description: string; services: ServiceEntry[]; faqs: FaqEntry[]; updates: ListingUpdateEntry[] }
  >
>;

const TRANSLATION_LOCALES: Exclude<DirectoryLocale, "en">[] = ["zh", "ms"];
const MAX_TRANSLATED_TAGLINE_LENGTH = 140;

function sanitizeTranslationEntry(
  entry: unknown,
): { tagline: string; description: string; services: ServiceEntry[]; faqs: FaqEntry[]; updates: ListingUpdateEntry[] } | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const tagline = typeof raw.tagline === "string" ? raw.tagline.trim().slice(0, MAX_TRANSLATED_TAGLINE_LENGTH) : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const services = servicesFromJson(raw.services);
  const faqs = faqsFromJson(raw.faqs);
  const updates = updatesFromJson(raw.updates);
  if (!tagline && !description && services.length === 0 && faqs.length === 0 && updates.length === 0) return null;
  return { tagline, description, services, faqs, updates };
}

export function translationsFromJson(value: unknown): ListingTranslations {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const result: ListingTranslations = {};
  for (const locale of TRANSLATION_LOCALES) {
    const entry = sanitizeTranslationEntry(raw[locale]);
    if (entry) result[locale] = entry;
  }
  return result;
}

// Parses the translation editor's serialized JSON permissively, same spirit
// as parseServicesJson/parseFaqsJson.
export function parseTranslationsJson(raw: string): ListingTranslations {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  return translationsFromJson(parsed);
}

// The inverse of buildPublishedSnapshot — reads the stored JSON back into a
// typed snapshot, tolerating a missing/malformed value (never trust a JSON
// column's shape at the type level) by treating it as "not published".
export function readPublishedSnapshot(value: unknown): PublishedListingSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.companyName !== "string") return null;
  return {
    companyName: raw.companyName,
    tagline: typeof raw.tagline === "string" ? raw.tagline : null,
    description: typeof raw.description === "string" ? raw.description : null,
    services: servicesFromJson(raw.services),
    industry: typeof raw.industry === "string" ? (raw.industry as Industry) : null,
    website: typeof raw.website === "string" ? raw.website : null,
    googleRating: typeof raw.googleRating === "number" ? raw.googleRating : null,
    googleRatingCount: typeof raw.googleRatingCount === "number" ? raw.googleRatingCount : null,
    googleMapsUrl: typeof raw.googleMapsUrl === "string" ? raw.googleMapsUrl : null,
    phone: typeof raw.phone === "string" ? raw.phone : null,
    whatsAppNumber: typeof raw.whatsAppNumber === "string" ? raw.whatsAppNumber : null,
    videos: videosFromJson(raw.videos),
    address: typeof raw.address === "string" ? raw.address : null,
    city: typeof raw.city === "string" ? raw.city : null,
    state: typeof raw.state === "string" ? raw.state : null,
    country: typeof raw.country === "string" ? raw.country : null,
    operatingHours: operatingHoursFromJson(raw.operatingHours),
    timezone: typeof raw.timezone === "string" ? raw.timezone : null,
    faqs: faqsFromJson(raw.faqs),
    updates: updatesFromJson(raw.updates),
    photos: photosFromJson(raw.photos),
    categories: Array.isArray(raw.categories) ? raw.categories.filter((entry): entry is string => typeof entry === "string") : [],
    translations: translationsFromJson(raw.translations),
    logoUrl: typeof raw.logoUrl === "string" ? raw.logoUrl : null,
    seoTitle: typeof raw.seoTitle === "string" ? raw.seoTitle : null,
    seoDescription: typeof raw.seoDescription === "string" ? raw.seoDescription : null,
  };
}

// categoryNames comes from a separate query (see approveDirectoryListing) —
// `listing` alone, a bare PartnerListing row, has no relation data to
// resolve PartnerListingCategory rows into names itself. partnerTimezone is
// the owning User's own timezone (see publishListing in
// src/app/actions/directory.ts) — timezone is an account-level setting now
// (User.timezone, editable from the Profile page), not a PartnerListing
// column, so it has to be passed in rather than read off `listing` itself.
// photos is likewise fetched separately by the caller (a small
// DirectoryListingImage query keyed on listing.photoIds) rather than joined
// in here — captions live on that table, not on `listing` itself, and this
// function stays a pure, synchronous mapper like the rest of the module.
export function buildPublishedSnapshot(
  listing: PartnerListing,
  categoryNames: string[],
  partnerTimezone: string | null,
  photos: PhotoEntry[],
): PublishedListingSnapshot {
  return {
    companyName: listing.companyName,
    tagline: listing.tagline,
    description: listing.description,
    services: servicesFromJson(listing.services),
    industry: listing.industry,
    website: listing.website,
    googleRating: listing.googleRating,
    googleRatingCount: listing.googleRatingCount,
    googleMapsUrl: listing.googleMapsUrl,
    phone: listing.phone,
    whatsAppNumber: listing.whatsAppNumber,
    videos: videosFromJson(listing.videos),
    address: listing.address,
    city: listing.city,
    state: listing.state,
    country: listing.country,
    operatingHours: operatingHoursFromJson(listing.operatingHours),
    timezone: partnerTimezone,
    faqs: faqsFromJson(listing.faqs),
    updates: updatesFromJson(listing.updates),
    photos,
    categories: categoryNames,
    translations: translationsFromJson(listing.translations),
    logoUrl: listing.logoUrl,
    seoTitle: listing.seoTitle,
    seoDescription: listing.seoDescription,
  };
}

// Only what the directory grid (the home page and each category page)
// actually renders and filters on, in the visitor's own language. This is
// what crosses the wire to the client-side search (see DirectorySearch), so
// it deliberately drops everything the grid never shows — hours, FAQ, every
// other language's translation — and, above all, the stored logo: that's a
// data: URL of the whole image (see photoDataUrl), which inlined into the
// HTML and again into React's payload made the home page ~870KB for five
// listings. logoUrl here is a real, cacheable path instead (see
// listingLogoPath). `searchText` is the one exception to "only what the
// grid renders": every piece of text the listing carries (see
// listingSearchText), already normalized, so DirectorySearch's free-text
// query can match a business by anything about it — its About text, an
// FAQ, its address, a post — without the grid shipping each of those
// fields, or its cards showing them.
export type DirectoryGridListing = {
  slug: string;
  companyName: string;
  tagline: string | null;
  searchText: string;
  services: { title: string; description: string }[];
  industry: Industry | null;
  categories: string[];
  city: string | null;
  state: string | null;
  country: string | null;
  logoUrl: string | null;
  // Same provenance as PublishedListingSnapshot's own googleRating —
  // shown as a small star rating on the card. No googleMapsUrl here: the
  // whole card is already a Link to the listing's own page, where that
  // link lives — a second <a> around just the rating would nest anchors.
  googleRating: number | null;
  googleRatingCount: number | null;
  // Pre-formatted for the grid's own locale (see formatViewsLabel) — same
  // "computed once, server-side, where the locale is already in scope"
  // reasoning toDirectoryGridListing's other locale-dependent fields use,
  // since every card grid is rendered by a "use client" component
  // (DirectorySearch) that formatViewsLabel itself can't be called from.
  viewsLabel: string;
};

export type PublishedListingRow = {
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  viewCount: number;
  listing: PublishedListingSnapshot;
};

// Every listing the public directory shows, newest first — the one query
// behind the home page, the category pages, sitemap.xml, and llms.txt, so
// they can never disagree about what's public. Presence of an approved
// snapshot is the test (same as the detail page), not the row's status.
export async function loadPublishedListings(): Promise<PublishedListingRow[]> {
  const rows = await db.partnerListing.findMany({
    select: { slug: true, publishedAt: true, updatedAt: true, viewCount: true, publishedSnapshot: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.flatMap((row) => {
    const listing = readPublishedSnapshot(row.publishedSnapshot);
    return listing
      ? [{ slug: row.slug, publishedAt: row.publishedAt, updatedAt: row.updatedAt, viewCount: row.viewCount, listing }]
      : [];
  });
}

// A single published listing by its slug, snapshot fields flattened
// alongside the few live/row-level ones a caller also needs (id/partnerId
// to tell whose listing this is, publishedAt to version the logo URL — see
// listingLogoPath — and viewCount, which lives on the row, not the
// snapshot). Shared by the listing detail page's own metadata/body and its
// opengraph-image route (src/app/[locale]/[slug]/opengraph-image.tsx),
// which needs the same company name/services/description a visitor sees.
// Wrapped in React's cache() since the listing now also has its own shared
// layout (src/app/[locale]/[slug]/layout.tsx) plus one route per section
// (products-services/, photos/, videos/, news/, promotions/, visit/, faq/)
// — every one of those, and each one's own generateMetadata, calls this
// with the same slug for the same request, and this dedupes them to a
// single DB round trip rather than one per file.
export const getPublishedListingBySlug = cache(async (slug: string) => {
  const listing = await db.partnerListing.findUnique({ where: { slug } });
  if (!listing) return null;
  const snapshot = readPublishedSnapshot(listing.publishedSnapshot);
  return snapshot
    ? {
        ...snapshot,
        id: listing.id,
        partnerId: listing.partnerId,
        publishedAt: listing.publishedAt,
        viewCount: listing.viewCount,
        viewCountEn: listing.viewCountEn,
        viewCountZh: listing.viewCountZh,
        viewCountMs: listing.viewCountMs,
        // Read-only here — null until the listing detail page itself (never
        // the opengraph-image route, which shares this same fetch but has no
        // reason to write anything) calls getOrCreateReferralCode below.
        referralCode: listing.referralCode,
      }
    : null;
});

export type ListingDisplay = {
  tagline: string;
  description: string;
  services: ServiceEntry[];
  faqs: FaqEntry[];
  videoGallery: { url: string; title: string; category: VideoCategory; thumbnailUrl: string | null; embed: { embedUrl: string; provider: VideoProvider } | null }[];
  hasMedia: boolean;
  currentUpdates: ListingUpdateEntry[];
  currentNews: ListingUpdateEntry[];
  currentPromotions: ListingUpdateEntry[];
};

// Resolves which language's Tagline/About/Products & services/FAQ/Updates
// actually show for a given locale — the partner's own primary-language
// fields, unless a translation covers that particular one (see
// ListingTranslations) — plus the small amount of further derived data
// several section pages need (which updates are still current, split by
// kind; which videos have a working embed). Kept as one function rather
// than duplicated across the shared layout and each of the listing's own
// section pages: every one of those independently calls this on the exact
// same already-fetched (and cache()d, see above) listing object, so
// nothing re-hits the database, only this plain derivation re-runs.
export function resolveListingDisplay(
  listing: NonNullable<Awaited<ReturnType<typeof getPublishedListingBySlug>>>,
  locale: DirectoryLocale,
): ListingDisplay {
  const translation = locale === "zh" || locale === "ms" ? listing.translations[locale] : undefined;
  const tagline = translation?.tagline || listing.tagline || "";
  const description = translation?.description || listing.description || "";
  const services = translation?.services?.length ? translation.services : listing.services;
  const faqs = translation?.faqs?.length ? translation.faqs : listing.faqs;
  const updates = translation?.updates?.length ? translation.updates : listing.updates;
  const todayIso = new Date().toISOString().slice(0, 10);
  const currentUpdates = updates.filter((update) => isUpdateCurrent(update, todayIso));
  const currentPromotions = currentUpdates.filter((update) => update.kind === "PROMOTION");
  const currentNews = currentUpdates.filter((update) => update.kind === "NEWS");
  const videoGallery = listing.videos.map((video) => ({ ...video, embed: toEmbeddableVideoUrl(video.url) }));
  return {
    tagline,
    description,
    services,
    faqs,
    videoGallery,
    hasMedia: videoGallery.length > 0 || listing.photos.length > 0,
    currentUpdates,
    currentNews,
    currentPromotions,
  };
}

const REFERRAL_CODE_LENGTH = 7;

// Two random base36 strings concatenated rather than one sliced to length —
// Math.random().toString(36) can come back short (occasionally far short)
// of REFERRAL_CODE_LENGTH characters after the "0." prefix, the same
// imprecision generateListingSlug's own disambiguation suffix accepts at a
// shorter length; concatenating first guarantees enough characters to slice
// from every time.
function randomReferralCode(): string {
  return (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z0-9]/g, "").slice(0, REFERRAL_CODE_LENGTH);
}

async function generateReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = randomReferralCode();
    const existing = await db.partnerListing.findUnique({ where: { referralCode: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique referral code — please try again.");
}

// Lazily assigns a listing's referralCode the first time it's actually
// needed (see recommendUrl in src/app/[locale]/[slug]/page.tsx) — nothing
// needs one before a visitor first lands on the listing's own public page,
// so there's no migration to backfill every existing row up front. Once
// set, it never changes (same "generated once" contract as the slug this
// listing started with — see generateListingSlug).
export async function getOrCreateReferralCode(listing: { id: string; referralCode: string | null }): Promise<string> {
  if (listing.referralCode) return listing.referralCode;
  const referralCode = await generateReferralCode();
  try {
    await db.partnerListing.update({ where: { id: listing.id }, data: { referralCode } });
    return referralCode;
  } catch {
    // Only realistic cause: another concurrent first-ever visit to this
    // same listing won the race and already set one. Read back whatever
    // actually landed so this page's own link matches exactly what
    // submitDirectoryLead will later check it against, rather than handing
    // out a value that was never actually saved.
    const current = await db.partnerListing.findUnique({ where: { id: listing.id }, select: { referralCode: true } });
    return current?.referralCode ?? referralCode;
  }
}

// The logo's real URL (served by /api/directory-images/logo/[slug]). The
// publish timestamp rides along as a cache-buster: the slug outlives any
// number of logo replacements, but every replacement is re-approved, which
// stamps a new publishedAt — so this URL changes exactly when the image
// can, and that route caches the versioned form for good.
export function listingLogoPath(slug: string, publishedAt: Date | null): string {
  const path = `/api/directory-images/logo/${encodeURIComponent(slug)}`;
  return publishedAt ? `${path}?v=${publishedAt.getTime()}` : path;
}

// A gallery photo's (or an About-embed's) real URL — the same
// DirectoryListingImage row and /api/directory-images/[id] route
// PhotoEntry.id and the About field's own embeds both reference (see that
// model's comment in schema.prisma). No cache-buster needed the way the
// logo's own path carries one: unlike a logo, which is replaced in place,
// a gallery photo is a whole new row (and so a new id) every time a
// partner uploads one — this route already serves each id immutably (see
// src/app/api/directory-images/[id]/route.ts).
export function directoryImagePath(id: string): string {
  return `/api/directory-images/${encodeURIComponent(id)}`;
}

// Everything a visitor could know a listing by, in their own language, as
// one normalized haystack (see normalizeSearchText) — what both the home
// page's free-text search (DirectoryGridListing.searchText) and the header
// dropdown's business group (loadDirectorySearchIndex) match against, so
// the two can never disagree about which businesses a query finds. Every
// text field of the snapshot is in here, not just the obvious ones: a
// business is as findable by its street, its website, an FAQ it answers,
// a photo caption or a post as by its name. What the page itself would
// never show is left out too — a promotion past its end date, which the
// listing page no longer renders (see isUpdateCurrent). Same fallback rule
// as the detail page for translations: one only stands in for the field
// it actually covers; the company name is never translated.
export function listingSearchText(slug: string, listing: PublishedListingSnapshot, locale: DirectoryLocale): string {
  const translation = locale === "en" ? undefined : listing.translations[locale];
  const services = translation?.services.length ? translation.services : listing.services;
  const faqs = translation?.faqs.length ? translation.faqs : listing.faqs;
  const updates = translation?.updates.length ? translation.updates : listing.updates;
  const videoCategoryLabels = VIDEO_CATEGORY_LABELS_BY_LOCALE[locale];
  const today = new Date().toISOString().slice(0, 10);
  return normalizeSearchText(
    [
      slug,
      listing.companyName,
      translation?.tagline || listing.tagline,
      stripMarkdownLiteToPlainText(translation?.description || listing.description),
      listing.industry ? INDUSTRY_LABELS_BY_LOCALE[locale][listing.industry] : null,
      // Both the stored English name and its translation, so a visitor
      // typing in either language finds it.
      ...listing.categories.flatMap((cat) => [cat, translateCategoryName(cat, locale)]),
      listing.address,
      listing.city,
      listing.state,
      listing.country,
      listing.website,
      ...services.flatMap((service) => [service.title, service.description, service.price]),
      ...faqs.flatMap((faq) => [faq.question, faq.answer]),
      ...updates.filter((update) => isUpdateCurrent(update, today)).flatMap((update) => [update.title, stripMarkdownLiteToPlainText(update.body)]),
      ...listing.videos.flatMap((video) => [video.title, videoCategoryLabels[video.category]]),
      ...listing.photos.map((photo) => photo.caption),
      listing.seoTitle,
      listing.seoDescription,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function toDirectoryGridListing(
  { slug, publishedAt, viewCount, listing }: PublishedListingRow,
  locale: DirectoryLocale,
): DirectoryGridListing {
  // Same fallback rule as the detail page: a translation only stands in
  // for the field it actually covers; the company name is never translated.
  const translation = locale === "en" ? undefined : listing.translations[locale];
  const services = translation?.services.length ? translation.services : listing.services;
  return {
    slug,
    companyName: listing.companyName,
    tagline: translation?.tagline || listing.tagline,
    searchText: listingSearchText(slug, listing, locale),
    services: services.map(({ title, description }) => ({ title, description })),
    industry: listing.industry,
    categories: listing.categories,
    city: listing.city,
    state: listing.state,
    country: listing.country,
    logoUrl: listing.logoUrl ? listingLogoPath(slug, publishedAt) : null,
    googleRating: listing.googleRating,
    googleRatingCount: listing.googleRatingCount,
    viewsLabel: formatViewsLabel(viewCount, locale),
  };
}

// How many published listings carry each category name — what decides
// which categories get a real link on the home page, a sitemap entry, and
// an llms.txt line (see those callers), versus only a dropdown option.
export function countListingsByCategory(rows: { listing: Pick<PublishedListingSnapshot, "categories"> }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { listing } of rows) {
    for (const category of new Set(listing.categories)) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return counts;
}

// The top few category names among a set of rows, most-common first — used
// by locationPageDescription (directory-location-labels.ts) to say what a
// location's businesses actually do instead of a generic "browse trusted
// businesses" line.
export function topCategoryNames(rows: { listing: Pick<PublishedListingSnapshot, "categories"> }[], limit = 3): string[] {
  return [...countListingsByCategory(rows).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

// One entry per distinct city+state a published listing carries — the
// location-page counterpart of countListingsByCategory above, grouped
// finer than state alone so a page for "Petaling Jaya, Selangor" doesn't
// lump in every other city in the same state. A listing with no city set
// (an older one, from before that field existed, or one whose partner left
// it blank) falls back to its own state-only group, same as before city
// existed at all — grouping key is city+state, never city alone, since two
// same-named cities in different states are different places. country is
// carried along only for display (see listLocationsWithCounts's own
// comment on when it's actually shown) — not part of the grouping key,
// since every business in the same city/state pair is expected to share
// one; the first non-null value seen wins if they ever don't agree. Unlike
// category, state has no separate admin-managed table (BusinessCategory):
// a group only exists at all because some listing's own address carries
// it, so there's no such thing as a location with zero listings.
export type LocationGroup = { city: string | null; state: string; country: string | null; count: number };
export function countListingsByCityState(
  rows: { listing: Pick<PublishedListingSnapshot, "city" | "state" | "country"> }[],
): Map<string, LocationGroup> {
  const groups = new Map<string, LocationGroup>();
  for (const { listing } of rows) {
    if (!listing.state) continue;
    const key = `${listing.city ?? ""}\u0000${listing.state}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.country && listing.country) existing.country = listing.country;
    } else {
      groups.set(key, { city: listing.city, state: listing.state, country: listing.country, count: 1 });
    }
  }
  return groups;
}

// How many published listings carry each industry — the industry-page
// counterpart of countListingsByCategory/countListingsByCityState above.
// Industry has a fixed, known set of possible values (see INDUSTRIES in
// src/lib/labels.ts), so — like category, unlike state — a value can have
// zero listings; see buildIndustryMetadata's noindex-when-empty handling.
export function countListingsByIndustry(rows: { listing: Pick<PublishedListingSnapshot, "industry"> }[]): Map<Industry, number> {
  const counts = new Map<Industry, number>();
  for (const { listing } of rows) {
    if (listing.industry) counts.set(listing.industry, (counts.get(listing.industry) ?? 0) + 1);
  }
  return counts;
}

// Resolves a location page's URL slug back to the exact city+state (or
// state-only) group its listings carry (same slugify-at-request-time
// approach as findCategoryBySlug, since neither is a separate table with
// its own slug column) — null when no published listing's location
// slugifies to this. slugify collapses ", " and " " identically, so this
// stays in sync with every caller that builds a link via
// slugify(locationLabel(city, state)) without a dedicated slug function of
// its own.
export function findLocationBySlug(rows: PublishedListingRow[], slug: string): { city: string | null; state: string } | null {
  for (const { listing } of rows) {
    if (listing.state && slugify(locationLabel(listing.city, listing.state)) === slug) {
      return { city: listing.city, state: listing.state };
    }
  }
  return null;
}

// The newest published listings overall, for the detail page's "Latest
// Businesses" section — the only place on a listing page a visitor (or a
// crawler) could otherwise reach another listing without going all the way
// back to search. Newest-first, same order loadPublishedListings already
// returns; the caller caps how many to show. Deliberately not filtered by
// this listing's own category or industry — "what's new," not "what's
// similar."
export function latestListings(rows: PublishedListingRow[], excludeSlug: string, limit: number): PublishedListingRow[] {
  return rows.filter((row) => row.slug !== excludeSlug).slice(0, limit);
}

// Other published listings in the same state but a DIFFERENT industry, for
// the detail page's "Businesses Near You" section — deliberately excludes
// this listing's own industry so it reads as "other businesses near you,"
// not a list of local competitors in the same line of work. A listing (or
// a candidate) with no industry set has nothing to compare, so it's never
// excluded by this rule. Newest-first, same order loadPublishedListings
// already returns.
export function nearbyListingsExcludingIndustry(
  rows: PublishedListingRow[],
  state: string,
  excludeSlug: string,
  excludeIndustry: Industry | null,
  limit: number,
): PublishedListingRow[] {
  return rows
    .filter(
      (row) =>
        row.slug !== excludeSlug &&
        row.listing.state === state &&
        (!excludeIndustry || row.listing.industry !== excludeIndustry),
    )
    .slice(0, limit);
}

// Every BusinessCategory, including one with zero published listings — the
// one place a visitor sees the *complete* category list, unlike the
// populated-only pill lists on the home/category pages (see
// DirectoryHomeSections, which deliberately filters those out).
export type CategoryWithCount = { name: string; count: number };
export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const [categories, rows] = await Promise.all([
    db.businessCategory.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    loadPublishedListings(),
  ]);
  const counts = countListingsByCategory(rows);
  return categories.map((row) => ({ name: row.name, count: counts.get(row.name) ?? 0 }));
}

// Every city+state (or state-only) group at least one published listing
// carries, sorted by state then city — the locations-index counterpart of
// listCategoriesWithCounts. No zero-count case here either, for the same
// reason countListingsByCityState has none: a group only exists because
// some listing's own address carries it. country only matters for display
// when it isn't the same for every group (see LocationsIndexContent) —
// this just carries it through unfiltered.
export type LocationWithCount = LocationGroup;
export async function listLocationsWithCounts(): Promise<LocationWithCount[]> {
  const rows = await loadPublishedListings();
  return [...countListingsByCityState(rows).values()].sort((a, b) => {
    const stateCompare = a.state.localeCompare(b.state);
    return stateCompare !== 0 ? stateCompare : (a.city ?? "").localeCompare(b.city ?? "");
  });
}

// Every Industry, including one with zero published listings — the
// industries-index counterpart of listCategoriesWithCounts. Industry is a
// fixed enum (see INDUSTRIES in src/lib/labels.ts), not a DB table, so this
// needs no query of its own the way the category version does.
export type IndustryWithCount = { industry: Industry; count: number };
export async function listIndustriesWithCounts(): Promise<IndustryWithCount[]> {
  const rows = await loadPublishedListings();
  const counts = countListingsByIndustry(rows);
  return INDUSTRIES.map((industry) => ({ industry, count: counts.get(industry) ?? 0 }));
}

// One entry per service across every published listing, newest-listing-first
// (loadPublishedListings's own order) — the directory-wide "Latest Products"
// feed. No new Product model: a service has no publish timestamp of its own,
// so the listing's own publishedAt stands in for "when this was added."
export type LatestProductEntry = {
  listingSlug: string;
  companyName: string;
  logoUrl: string | null;
  service: ServiceEntry;
  publishedAt: Date | null;
};

const MAX_LATEST_PRODUCTS = 60;

export async function loadLatestProducts(locale: DirectoryLocale, limit = MAX_LATEST_PRODUCTS): Promise<LatestProductEntry[]> {
  const rows = await loadPublishedListings();
  const entries: LatestProductEntry[] = [];
  for (const { slug, publishedAt, listing } of rows) {
    const translation = locale === "en" ? undefined : listing.translations[locale];
    const services = translation?.services.length ? translation.services : listing.services;
    for (const service of services) {
      entries.push({
        listingSlug: slug,
        companyName: listing.companyName,
        logoUrl: listing.logoUrl ? listingLogoPath(slug, publishedAt) : null,
        service,
        publishedAt,
      });
      if (entries.length >= limit) return entries;
    }
  }
  return entries;
}

// One entry per still-current update (news post, or promotion that hasn't
// ended) across every published listing, newest-listing-first — the
// directory-wide "News & Promotions" feed. Sources the same
// PartnerListing.updates JSON field the listing's own page already renders
// (see isUpdateCurrent) rather than a separate model: an update has no
// publish timestamp of its own, so the listing's own publishedAt stands in
// for "when this was posted," same convention as loadLatestProducts above.
// Same translation fallback as toDirectoryGridListing: a listing's
// translated updates stand in only when it has some, otherwise the
// English list shows through.
export type ListingUpdateFeedEntry = {
  listingSlug: string;
  companyName: string;
  logoUrl: string | null;
  update: ListingUpdateEntry;
  publishedAt: Date | null;
};

const MAX_LATEST_UPDATES = 60;

export async function loadLatestListingUpdates(
  locale: DirectoryLocale,
  limit = MAX_LATEST_UPDATES,
): Promise<ListingUpdateFeedEntry[]> {
  const rows = await loadPublishedListings();
  const today = new Date().toISOString().slice(0, 10);
  const entries: ListingUpdateFeedEntry[] = [];
  for (const { slug, publishedAt, listing } of rows) {
    const translation = locale === "en" ? undefined : listing.translations[locale];
    const updates = translation?.updates.length ? translation.updates : listing.updates;
    for (const update of updates) {
      if (!isUpdateCurrent(update, today)) continue;
      entries.push({
        listingSlug: slug,
        companyName: listing.companyName,
        logoUrl: listing.logoUrl ? listingLogoPath(slug, publishedAt) : null,
        update,
        publishedAt,
      });
      if (entries.length >= limit) return entries;
    }
  }
  return entries;
}

// The header search bar's searchable index (see HeaderSearch and the
// /api/directory-search-index route) — every published listing, reduced
// to just the text a search matches against and the few fields a result
// row shows, with each haystack already normalized (see
// normalizeSearchText) so the browser-side filter (searchDirectoryIndex in
// directory-search.ts) is a bare substring check per keystroke.
//
// Deliberately not loadPublishedListings: the snapshot's logoUrl is the
// whole logo image as a base64 data: URL (see PartnerListing.logoUrl in
// schema.prisma), so that query drags every listing's logo — megabytes,
// across the wire and through JSON.parse — into a read that then throws
// them all away. The `- 'logoUrl'` here drops that key inside Postgres
// instead, before the row ever leaves it; the separate boolean keeps just
// the one fact a result row needs (whether there's a logo at all, so
// listingLogoPath can point at it). Same reason this isn't queried per
// keystroke either: it's fetched once per visit, on first focus, and
// searched locally from then on.
export async function loadDirectorySearchIndex(locale: DirectoryLocale): Promise<DirectorySearchIndex> {
  const rows = await db.$queryRaw<{ slug: string; publishedAt: Date | null; snapshot: unknown; hasLogo: boolean }[]>`
    SELECT
      "slug",
      "publishedAt",
      "publishedSnapshot" - 'logoUrl' AS "snapshot",
      jsonb_typeof("publishedSnapshot" -> 'logoUrl') = 'string' AS "hasLogo"
    FROM "PartnerListing"
    WHERE "publishedSnapshot" IS NOT NULL
    ORDER BY "publishedAt" DESC
  `;
  const industryLabels = INDUSTRY_LABELS_BY_LOCALE[locale];
  const today = new Date().toISOString().slice(0, 10);
  const index: DirectorySearchIndex = [];

  for (const row of rows) {
    // The pg adapter hands jsonb back already parsed, but a driver that
    // returned it as text would otherwise make every row read as
    // unpublished (readPublishedSnapshot rejects non-objects) — so accept
    // either.
    const listing = readPublishedSnapshot(typeof row.snapshot === "string" ? JSON.parse(row.snapshot) : row.snapshot);
    if (!listing) continue;
    // Same fallback rule as toDirectoryGridListing: a translation only
    // stands in for the field it actually covers; the company name is never
    // translated.
    const translation = locale === "en" ? undefined : listing.translations[locale];
    const services = translation?.services.length ? translation.services : listing.services;
    const updates = translation?.updates.length ? translation.updates : listing.updates;
    const publishedAt = row.publishedAt ? new Date(row.publishedAt) : null;

    index.push({
      slug: row.slug,
      companyName: listing.companyName,
      tagline: translation?.tagline || listing.tagline || null,
      industryLabel: listing.industry ? industryLabels[listing.industry] : null,
      logoUrl: row.hasLogo ? listingLogoPath(row.slug, publishedAt) : null,
      // The whole listing (see listingSearchText) — so a query that matches
      // one of its products or posts lists the business itself too, beside
      // that product's or post's own row below.
      haystack: listingSearchText(row.slug, listing, locale),
      services: services.map((service) => ({
        title: service.title,
        haystack: normalizeSearchText(`${service.title} ${service.description} ${service.price}`),
      })),
      // Only while still current, same as loadLatestListingUpdates above.
      updates: updates
        .filter((update) => isUpdateCurrent(update, today))
        .map((update) => ({
          kind: update.kind,
          title: update.title,
          haystack: normalizeSearchText(`${update.title} ${stripMarkdownLiteToPlainText(update.body)}`),
        })),
    });
  }

  return index;
}

// A "Visit website" link needs a real absolute URL, not just a bare domain
// — contrast Company.domain (src/lib/companies.ts), which deliberately
// strips down to the bare form for internal matching. A partner typing
// "acme.com" with no scheme still needs to link somewhere that isn't
// resolved relative to this app's own origin.
export function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Schema.org CollectionPage/ItemList markup for the directory's own listing
// pages (the home page and each friendly category page) — the collection-
// level counterpart to a single listing's own LocalBusiness markup (see
// buildJsonLd in src/app/[locale]/business/[slug]/page.tsx). Read by both
// search engines (SEO) and AI answer engines that crawl the page (GEO), same
// reasoning as that one. Each entry is a LocalBusiness in its own right —
// name, this language's canonical URL, logo, region, one-line description —
// rather than a bare name+url pair, so a crawler that never follows through
// to the detail page still learns what each business is and where. The page
// also declares its language and the WebSite/Organization it belongs to
// (see directory-seo.ts), so per-page and site-level markup read as one
// graph rather than unrelated islands.
export function buildDirectoryCollectionJsonLd(
  listings: DirectoryGridListing[],
  url: string,
  siteOrigin: string,
  name: string,
  locale: DirectoryLocale,
  description?: string,
): string {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    inLanguage: locale,
    isPartOf: { "@id": websiteJsonLdId(siteOrigin) },
    publisher: { "@id": organizationJsonLdId(siteOrigin) },
  };
  if (description) jsonLd.description = description;
  jsonLd.mainEntity = {
    "@type": "ItemList",
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: listing.companyName,
        url: `${siteOrigin}${directoryListingPath(locale, listing.slug)}`,
        ...(listing.tagline ? { description: listing.tagline } : {}),
        ...(listing.logoUrl ? { image: `${siteOrigin}${listing.logoUrl}` } : {}),
        ...(listing.state || listing.country
          ? {
              address: {
                "@type": "PostalAddress",
                ...(listing.state ? { addressRegion: listing.state } : {}),
                ...(listing.country ? { addressCountry: listing.country } : {}),
              },
            }
          : {}),
      },
    })),
  };
  return serializeJsonLd(jsonLd);
}

// Schema.org BreadcrumbList markup — shared by the category page (Home >
// Category) and a single listing's own page (Home > Category > Business
// name, when the listing has a category). Search engines use this for the
// breadcrumb trail shown under a result instead of the raw URL; an AI
// answer engine crawling the page gets the same "where does this sit in the
// site" context for free. `items` is root-first, and its last entry is the
// current page itself — schema.org expects `item` on every entry, current
// page included, not just the ancestors.
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

// Generated once, from whatever the partner is called at the time (their
// User.name — companyName isn't set yet on a brand-new draft) — same
// reasoning as referralCode in src/lib/referrals.ts for why it exists at
// all. Unlike a referral code, a partner CAN move it later (see
// updateListingSlug) — this is only ever the starting point. Falls back to
// "partner" for a name with no latinizable characters at all (e.g. fully
// CJK), then disambiguates with a short suffix either way.
export async function generateListingSlug(name: string): Promise<string> {
  const base = slugify(name) || "partner";
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = await db.partnerListing.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique listing slug — please try again.");
}

// A BusinessCategory row only ever stores an English name (see
// prisma/migrations/20260909170000_seed_business_categories) — there's no
// separate slug column, so a friendly category URL (see
// src/app/directory/category) matches by slugifying that name at request
// time rather than a stored value that could drift out of sync with it.
export async function findCategoryBySlug(categorySlug: string): Promise<string | null> {
  const categories = await db.businessCategory.findMany({ select: { name: true } });
  return categories.find((row) => slugify(row.name) === categorySlug)?.name ?? null;
}

// A partner account can list more than one business (see
// src/app/business-portal/(dashboard)/listings) — every listing row belongs to
// exactly one partner, but a partner can own several. Ordered oldest-first
// so a partner's listings stay in a stable, predictable order across visits
// rather than reshuffling as they're edited (updatedAt would do that).
export async function listPartnerListings(partnerId: string): Promise<PartnerListing[]> {
  return db.partnerListing.findMany({ where: { partnerId }, orderBy: { createdAt: "asc" } });
}

// Ownership-scoped lookup for a single listing — every partner-facing read
// or write on a specific listing goes through this (or the equivalent
// inline findFirst) rather than a bare findUnique({where:{id}}), since an
// id alone doesn't prove the requesting partner is the one who owns it.
export async function getOwnedListing(listingId: string, partnerId: string): Promise<PartnerListing | null> {
  return db.partnerListing.findFirst({ where: { id: listingId, partnerId } });
}

// PartnerListingBranchLink stores each pair once, smaller id first — lets
// "branches of X" be a single OR query below instead of needing a link
// written in both directions. Exported so linkListingsAsBranches below (and
// bulkLinkListingsAsBranches in src/app/actions/directory.ts) can build the
// same canonical pairs when linking several listings at once.
export function branchLinkPairKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

// Every listing linked to this one as a branch, in either direction —
// symmetric regardless of which listing's editor originally created the
// link (see the model's own comment in schema.prisma).
export async function getListingBranchIds(listingId: string): Promise<string[]> {
  const links = await db.partnerListingBranchLink.findMany({
    where: { OR: [{ listingAId: listingId }, { listingBId: listingId }] },
    select: { listingAId: true, listingBId: true },
  });
  return links.map((link) => (link.listingAId === listingId ? link.listingBId : link.listingAId));
}

// Reconciles listingId's branch links to exactly branchIds — same
// "validate against rows the partner actually owns, then diff and write"
// shape as categoryIds in saveListingFields, just against PartnerListing
// instead of BusinessCategory. Silently drops any id that isn't one of the
// partner's own other listings rather than erroring, same as a stale
// category id would be.
export async function setListingBranchIds(listingId: string, branchIds: string[], partnerId: string): Promise<void> {
  const validBranches = branchIds.length
    ? await db.partnerListing.findMany({
        where: { id: { in: branchIds }, partnerId, NOT: { id: listingId } },
        select: { id: true },
      })
    : [];
  const validIds = new Set(validBranches.map((branch) => branch.id));

  const existingLinks = await db.partnerListingBranchLink.findMany({
    where: { OR: [{ listingAId: listingId }, { listingBId: listingId }] },
  });
  const existingOtherIds = new Set(
    existingLinks.map((link) => (link.listingAId === listingId ? link.listingBId : link.listingAId)),
  );

  const toDelete = existingLinks.filter((link) => {
    const otherId = link.listingAId === listingId ? link.listingBId : link.listingAId;
    return !validIds.has(otherId);
  });
  const toCreate = [...validIds].filter((id) => !existingOtherIds.has(id));
  if (toDelete.length === 0 && toCreate.length === 0) return;

  await db.$transaction([
    ...(toDelete.length ? [db.partnerListingBranchLink.deleteMany({ where: { id: { in: toDelete.map((link) => link.id) } } })] : []),
    ...toCreate.map((otherId) => {
      const [listingAId, listingBId] = branchLinkPairKey(listingId, otherId);
      return db.partnerListingBranchLink.create({ data: { listingAId, listingBId } });
    }),
  ]);
}

// Fully connects every listing in listingIds to every other one, as
// branches of each other — for the "My Business" grid's own bulk selection
// (a partner ticking several of their locations at once, rather than
// opening each one's editor to link it by hand). Purely additive: an
// already-linked pair is left alone (skipDuplicates), never unlinked —
// unlike setListingBranchIds above, which reconciles one listing's full
// set and so can also remove links. Returns how many new pairs were
// actually created, for the caller's own confirmation message.
export async function linkListingsAsBranches(listingIds: string[], partnerId: string): Promise<number> {
  const uniqueIds = [...new Set(listingIds)];
  if (uniqueIds.length < 2) return 0;
  const owned = await db.partnerListing.findMany({ where: { id: { in: uniqueIds }, partnerId }, select: { id: true } });
  const validIds = owned.map((listing) => listing.id);
  if (validIds.length < 2) return 0;

  const pairs: { listingAId: string; listingBId: string }[] = [];
  for (let i = 0; i < validIds.length; i++) {
    for (let j = i + 1; j < validIds.length; j++) {
      const [listingAId, listingBId] = branchLinkPairKey(validIds[i], validIds[j]);
      pairs.push({ listingAId, listingBId });
    }
  }
  const result = await db.partnerListingBranchLink.createMany({ data: pairs, skipDuplicates: true });
  return result.count;
}

export type ListingBranchSummary = { companyName: string; slug: string; address: string | null; city: string | null; state: string | null };

// For the public Visit us page — every linked branch that's actually live,
// with just enough of its own current publishedSnapshot to show and link
// to it. A branch that's since been unpublished or deleted simply drops
// out here rather than needing its link cleaned up separately.
export async function getPublishedBranchListings(listingId: string): Promise<ListingBranchSummary[]> {
  const branchIds = await getListingBranchIds(listingId);
  if (branchIds.length === 0) return [];
  // Not filtered by status: "PUBLISHED" — same reasoning as
  // loadPublishedListings, which reads every row and keeps whichever have
  // a snapshot. A listing mid-edit (back to DRAFT until re-approved, see
  // saveListingFields) still shows its last-approved snapshot everywhere
  // else on the public site, so a branch link to it shouldn't disappear
  // just because its owner is currently editing something else on it.
  const rows = await db.partnerListing.findMany({
    where: { id: { in: branchIds } },
    select: { slug: true, publishedSnapshot: true },
  });
  return rows
    .map((row) => {
      const snapshot = readPublishedSnapshot(row.publishedSnapshot);
      if (!snapshot) return null;
      return { companyName: snapshot.companyName, slug: row.slug, address: snapshot.address, city: snapshot.city, state: snapshot.state };
    })
    .filter((entry): entry is ListingBranchSummary => entry !== null);
}

const VIEW_COUNT_FIELD_BY_LOCALE = {
  en: "viewCountEn",
  zh: "viewCountZh",
  ms: "viewCountMs",
} as const satisfies Record<DirectoryLocale, string>;

// Bumped once per real page load of the public listing page (see
// DirectoryListingPage in src/app/[locale]/business/[slug]/page.tsx),
// which is server-rendered on every request — never on a cached/static
// hit. Swallows its own errors: a missed view count is never worth
// failing, or slowing, that page's render for. Also bumps the matching
// per-locale column (see PartnerListing.viewCountEn/Zh/Ms) in the same
// write, atomically — viewCount stays their running sum rather than
// something computed on every read.
export async function incrementListingViewCount(id: string, locale: DirectoryLocale): Promise<void> {
  const localeField = VIEW_COUNT_FIELD_BY_LOCALE[locale];
  await db.partnerListing
    .update({ where: { id }, data: { viewCount: { increment: 1 }, [localeField]: { increment: 1 } } })
    .catch(() => {});
}

// Bumped once per real page load that arrived through a specific signed-in
// partner's own copy of a listing's Recommend link (see recommendUrl's
// `via=<User.id>` tag in src/app/[locale]/[slug]/layout.tsx, and
// ReferralViewBeacon, the only caller — via the recordReferralView server
// action, which is what actually validates referrerId names a real
// PARTNER). One row per (listing, referrer) pair; same swallow-its-own-
// errors reasoning as incrementListingViewCount above — a missed count
// here is never worth surfacing an error to a visitor for.
export async function recordListingReferralView(listingId: string, referrerId: string): Promise<void> {
  await db.listingReferralView
    .upsert({
      where: { listingId_referrerId: { listingId, referrerId } },
      create: { listingId, referrerId, viewCount: 1 },
      update: { viewCount: { increment: 1 } },
    })
    .catch(() => {});
}

// Reads whichever of viewCountEn/Zh/Ms matches — for the business-portal
// listing cards' per-language breakdown, so that UI never has to know the
// column names itself. Views from before this breakdown existed are only
// ever reflected in the older, single viewCount total (see its own
// comment) — there's no way to attribute them to a language after the
// fact, so an older listing's three per-locale counts simply undercount
// its all-time total until enough new views come in.
export function listingViewCountByLocale(
  listing: { viewCountEn: number; viewCountZh: number; viewCountMs: number },
  locale: DirectoryLocale,
): number {
  return listing[VIEW_COUNT_FIELD_BY_LOCALE[locale]];
}

// The business-portal listing cards' per-language breakdown, one real
// entry per locale — never a padded/inferred "the rest" bucket. Its own
// sum is what those cards show as the listing's total view count (see
// callers), deliberately *not* the older, single viewCount column: that
// column also holds views from before per-locale tracking existed, which
// there's no record of a language for, so folding it back in would mean
// either a total that (again) doesn't match its own breakdown, or
// inventing a per-language split for views nobody actually attributed.
// viewCount itself is kept only for the public listing page's own
// separate all-time "N views" line, which isn't broken down by language.
export function listingViewCountBreakdown(
  listing: { viewCountEn: number; viewCountZh: number; viewCountMs: number },
): { locale: DirectoryLocale; label: string; count: number }[] {
  return DIRECTORY_LOCALES.map(({ code, label }) => ({ locale: code, label, count: listingViewCountByLocale(listing, code) }));
}

// Explicit creation — unlike the old single-listing ensurePartnerListing
// (which silently created one the first time any listing page was visited),
// a partner who can have several listings needs "create another one" to be
// a visible, deliberate action (the "+ New Business" button on
// /business/listings), not something that happens as a side effect of
// loading a page.
export async function createPartnerListing(partnerId: string, companyName: string): Promise<PartnerListing> {
  const slug = await generateListingSlug(companyName);
  return db.partnerListing.create({
    data: { partnerId, slug, companyName, services: [] },
  });
}

export type DirectoryLeadStats = {
  total: number;
  new: number;
  open: number;
  converted: number;
  convertedValue: number;
  // How many of the above came in through the listing's Recommend link
  // (DirectoryLead.viaReferral) — a subset of total, not a separate
  // funnel stage, so it's not folded into new/open/converted above.
  referred: number;
};

async function computeDirectoryLeadStats(where: Prisma.DirectoryLeadWhereInput): Promise<DirectoryLeadStats> {
  const [total, byStatus, convertedAgg, referred] = await Promise.all([
    db.directoryLead.count({ where }),
    db.directoryLead.groupBy({ by: ["status"], where, _count: { _all: true } }),
    db.directoryLead.aggregate({ where: { ...where, status: "CLOSED_CONVERTED" }, _sum: { value: true } }),
    db.directoryLead.count({ where: { ...where, viaReferral: true } }),
  ]);
  const counts = new Map<string, number>(byStatus.map((row) => [row.status, row._count._all]));
  const converted = counts.get("CLOSED_CONVERTED") ?? 0;
  return {
    total,
    new: counts.get("NEW") ?? 0,
    open: total - converted,
    converted,
    convertedValue: Number(convertedAgg._sum.value ?? 0),
    referred,
  };
}

export async function getDirectoryLeadStats(listingId: string): Promise<DirectoryLeadStats> {
  return computeDirectoryLeadStats({ listingId });
}

// Same shape, summed across every listing a partner owns — for the
// business dashboard's aggregate "Directory listing" card, which no longer
// has one single listing to point getDirectoryLeadStats at.
export async function getDirectoryLeadStatsForPartner(partnerId: string): Promise<DirectoryLeadStats> {
  return computeDirectoryLeadStats({ listing: { partnerId } });
}

export type ReferredListingActivity = {
  listingId: string;
  companyName: string;
  slug: string;
  referralCode: string | null;
  isPublished: boolean;
  viewCount: number;
  leadCount: number;
  // null means the listing's own owner hasn't opted in to share it (see
  // PartnerListing.shareWonValueWithReferrers) — never 0 for that reason;
  // 0 here means "opted in, but nothing WON yet."
  wonValue: number | null;
};

const REFERRAL_ACTIVITY_LISTING_SELECT = {
  id: true,
  companyName: true,
  slug: true,
  referralCode: true,
  publishedSnapshot: true,
  shareWonValueWithReferrers: true,
} as const;

// Every listing a specific partner has personally referred — i.e. has at
// least one ListingReferralView or DirectoryLead attributed to them (see
// both models' own referrerId/DirectoryLead.referrerId) — for that
// partner's own Dashboard (see getReferralActivityForPartner's caller).
// Deliberately keyed off referrerId, not partnerId: this is about referral
// activity this account generated for (possibly someone else's) listing,
// the mirror image of getDirectoryLeadStatsForPartner's "leads on my own
// listing(s)."
export async function getReferralActivityForPartner(referrerId: string): Promise<ReferredListingActivity[]> {
  const [viewRows, leadRows] = await Promise.all([
    db.listingReferralView.findMany({
      where: { referrerId },
      select: { viewCount: true, listing: { select: REFERRAL_ACTIVITY_LISTING_SELECT } },
    }),
    db.directoryLead.groupBy({
      by: ["listingId", "status"],
      where: { referrerId },
      _count: { _all: true },
      _sum: { value: true },
    }),
  ]);

  function toEntry(listing: { id: string; companyName: string; slug: string; referralCode: string | null; publishedSnapshot: unknown; shareWonValueWithReferrers: boolean }, viewCount: number): ReferredListingActivity {
    return {
      listingId: listing.id,
      companyName: listing.companyName,
      slug: listing.slug,
      referralCode: listing.referralCode,
      isPublished: listing.publishedSnapshot !== null,
      viewCount,
      leadCount: 0,
      wonValue: listing.shareWonValueWithReferrers ? 0 : null,
    };
  }

  const activity = new Map<string, ReferredListingActivity>();
  for (const row of viewRows) activity.set(row.listing.id, toEntry(row.listing, row.viewCount));

  // A lead can exist with no matching view row (e.g. an ad-blocked or
  // JS-disabled visit never reached ReferralViewBeacon) — fetch those
  // listings separately so this list is really "at least one view or lead."
  const missingListingIds = [...new Set(leadRows.map((row) => row.listingId))].filter((id) => !activity.has(id));
  const missingListings = missingListingIds.length
    ? await db.partnerListing.findMany({ where: { id: { in: missingListingIds } }, select: REFERRAL_ACTIVITY_LISTING_SELECT })
    : [];
  for (const listing of missingListings) activity.set(listing.id, toEntry(listing, 0));

  for (const row of leadRows) {
    const entry = activity.get(row.listingId);
    if (!entry) continue;
    entry.leadCount += row._count._all;
    if (row.status === "CLOSED_CONVERTED" && entry.wonValue !== null) entry.wonValue += Number(row._sum.value ?? 0);
  }

  return [...activity.values()].sort((a, b) => b.leadCount - a.leadCount || b.viewCount - a.viewCount);
}

export type DirectoryOverviewStats = {
  publishedListings: number;
  pendingListings: number;
  totalLeads: number;
  leadsLast30Days: number;
  convertedValue: number;
};

// For Settings → Directory (admin) — across every partner's listing, not
// scoped to one.
export async function getDirectoryOverviewStats(): Promise<DirectoryOverviewStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [publishedListings, pendingListings, totalLeads, leadsLast30Days, convertedAgg] = await Promise.all([
    db.partnerListing.count({ where: { status: "PUBLISHED" } }),
    db.partnerListing.count({ where: { status: "PENDING_REVIEW" } }),
    db.directoryLead.count(),
    db.directoryLead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.directoryLead.aggregate({ where: { status: "CLOSED_CONVERTED" }, _sum: { value: true } }),
  ]);

  return {
    publishedListings,
    pendingListings,
    totalLeads,
    leadsLast30Days,
    convertedValue: Number(convertedAgg._sum.value ?? 0),
  };
}
