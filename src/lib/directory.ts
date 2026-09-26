import { db } from "@/lib/db";
import type { Industry, PartnerListing, Prisma } from "@/generated/prisma/client";
import { operatingHoursFromJson, type OperatingHours } from "@/lib/operating-hours";
import { slugify } from "@/lib/slug";
import { directoryListingPath, type DirectoryLocale } from "@/lib/directory-i18n";
import { organizationJsonLdId, serializeJsonLd, websiteJsonLdId } from "@/lib/directory-seo";
import { VIDEO_CATEGORIES, type VideoCategory } from "@/lib/labels";
import { stripMarkdownLiteToPlainText } from "@/lib/markdown-lite";

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
// visible here. Deliberately excludes the partner's own User.email/phone —
// a visitor only ever reaches a partner through the lead form.
export type PublishedListingSnapshot = {
  companyName: string;
  tagline: string | null;
  description: string | null;
  services: ServiceEntry[];
  industry: Industry | null;
  website: string | null;
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

export type PhotoEntry = { id: string; caption: string };

// Also the cap uploadListingGalleryPhoto (src/app/actions/directory-images.ts)
// enforces before creating a new row — exported so the two never drift apart.
export const MAX_GALLERY_PHOTOS = 12;

function sanitizePhotoEntry(entry: unknown): PhotoEntry | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) return null;
  return { id, caption: typeof raw.caption === "string" ? raw.caption.trim() : "" };
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
// plain placeholder instead of a real thumbnail (see VideoGallery). Only a
// host toEmbeddableVideoUrl doesn't recognize at all falls back further, to
// a plain "Watch video" link instead of an embed.
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

export type VideoProvider = "youtube" | "vimeo" | "dailymotion" | "facebook" | "tiktok";

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
    return id ? { embedUrl: `https://www.youtube.com/embed/${id}`, provider } : null;
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
    // Facebook's embed is a plugin iframe over the ORIGINAL url, not a
    // per-video id extracted from the path — every Facebook video/watch/
    // reel URL shape works the same way here.
    return { embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false`, provider };
  }
  // tiktok
  const match = /\/video\/(\d+)/.exec(url.pathname);
  return match ? { embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`, provider } : null;
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
// faqs for the directory's non-English locales — see translateListingContent
// in src/app/actions/directory.ts. Keyed by DirectoryLocale minus "en": the
// English fields are the primary tagline/description/services/faqs
// themselves, never duplicated in here. A translated service keeps the
// same price as its English counterpart (price isn't language-specific) —
// see handleTranslate in partner-listing-form.tsx, which re-attaches it by
// index right after the AI call returns.
export type ListingTranslations = Partial<
  Record<Exclude<DirectoryLocale, "en">, { tagline: string; description: string; services: ServiceEntry[]; faqs: FaqEntry[] }>
>;

const TRANSLATION_LOCALES: Exclude<DirectoryLocale, "en">[] = ["zh", "ms"];
const MAX_TRANSLATED_TAGLINE_LENGTH = 140;

function sanitizeTranslationEntry(
  entry: unknown,
): { tagline: string; description: string; services: ServiceEntry[]; faqs: FaqEntry[] } | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const tagline = typeof raw.tagline === "string" ? raw.tagline.trim().slice(0, MAX_TRANSLATED_TAGLINE_LENGTH) : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const services = servicesFromJson(raw.services);
  const faqs = faqsFromJson(raw.faqs);
  if (!tagline && !description && services.length === 0 && faqs.length === 0) return null;
  return { tagline, description, services, faqs };
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
// listingLogoPath). `description` is the one exception to "only what the
// grid renders" — DirectorySearch's free-text query matches against it even
// though the grid's own cards never show it, so a business searchable by
// what it actually does (not just its services/industry/category) doesn't
// need its own card redesigned first. Plain text (see
// stripMarkdownLiteToPlainText), not the raw markdown-lite the About field
// stores, so literal "**"/"[]()" syntax never causes a false mismatch.
export type DirectoryGridListing = {
  slug: string;
  companyName: string;
  tagline: string | null;
  description: string;
  services: { title: string; description: string }[];
  industry: Industry | null;
  categories: string[];
  state: string | null;
  country: string | null;
  logoUrl: string | null;
};

export type PublishedListingRow = {
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  listing: PublishedListingSnapshot;
};

// Every listing the public directory shows, newest first — the one query
// behind the home page, the category pages, sitemap.xml, and llms.txt, so
// they can never disagree about what's public. Presence of an approved
// snapshot is the test (same as the detail page), not the row's status.
export async function loadPublishedListings(): Promise<PublishedListingRow[]> {
  const rows = await db.partnerListing.findMany({
    select: { slug: true, publishedAt: true, updatedAt: true, publishedSnapshot: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.flatMap((row) => {
    const listing = readPublishedSnapshot(row.publishedSnapshot);
    return listing ? [{ slug: row.slug, publishedAt: row.publishedAt, updatedAt: row.updatedAt, listing }] : [];
  });
}

// A single published listing by its slug, snapshot fields flattened
// alongside the few live/row-level ones a caller also needs (id/partnerId
// to tell whose listing this is, publishedAt to version the logo URL — see
// listingLogoPath — and viewCount, which lives on the row, not the
// snapshot). Shared by the listing detail page's own metadata/body and its
// opengraph-image route (src/app/[locale]/[slug]/opengraph-image.tsx),
// which needs the same company name/services/description a visitor sees.
export async function getPublishedListingBySlug(slug: string) {
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
        // Read-only here — null until the listing detail page itself (never
        // the opengraph-image route, which shares this same fetch but has no
        // reason to write anything) calls getOrCreateReferralCode below.
        referralCode: listing.referralCode,
      }
    : null;
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

export function toDirectoryGridListing({ slug, publishedAt, listing }: PublishedListingRow, locale: DirectoryLocale): DirectoryGridListing {
  // Same fallback rule as the detail page: a translation only stands in
  // for the field it actually covers; the company name is never translated.
  const translation = locale === "en" ? undefined : listing.translations[locale];
  const services = translation?.services.length ? translation.services : listing.services;
  return {
    slug,
    companyName: listing.companyName,
    tagline: translation?.tagline || listing.tagline,
    description: stripMarkdownLiteToPlainText(translation?.description || listing.description),
    services: services.map(({ title, description }) => ({ title, description })),
    industry: listing.industry,
    categories: listing.categories,
    state: listing.state,
    country: listing.country,
    logoUrl: listing.logoUrl ? listingLogoPath(slug, publishedAt) : null,
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

// How many published listings carry each state — the location-page
// counterpart of countListingsByCategory above. Unlike category, state has
// no separate admin-managed table (BusinessCategory): a state only exists
// at all because some listing's own address carries it, so — unlike a
// category — there's no such thing as a state with zero listings.
export function countListingsByState(rows: { listing: Pick<PublishedListingSnapshot, "state"> }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { listing } of rows) {
    if (listing.state) counts.set(listing.state, (counts.get(listing.state) ?? 0) + 1);
  }
  return counts;
}

// How many published listings carry each industry — the industry-page
// counterpart of countListingsByCategory/countListingsByState above.
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

// Resolves a location page's URL slug back to the exact state string its
// listings carry (same slugify-at-request-time approach as
// findCategoryBySlug, since state isn't a separate table with its own slug
// column either) — null when no published listing has a state that
// slugifies to this.
export function findStateBySlug(rows: PublishedListingRow[], stateSlug: string): string | null {
  for (const { listing } of rows) {
    if (listing.state && slugify(listing.state) === stateSlug) return listing.state;
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

// Every state at least one published listing carries, alphabetically — the
// locations-index counterpart of listCategoriesWithCounts. No zero-count
// case here either, for the same reason countListingsByState has none: a
// state only exists because some listing's own address carries it.
export type LocationWithCount = { name: string; count: number };
export async function listLocationsWithCounts(): Promise<LocationWithCount[]> {
  const rows = await loadPublishedListings();
  return [...countListingsByState(rows)].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
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
export type ListingUpdateFeedEntry = {
  listingSlug: string;
  companyName: string;
  logoUrl: string | null;
  update: ListingUpdateEntry;
  publishedAt: Date | null;
};

const MAX_LATEST_UPDATES = 60;

export async function loadLatestListingUpdates(limit = MAX_LATEST_UPDATES): Promise<ListingUpdateFeedEntry[]> {
  const rows = await loadPublishedListings();
  const today = new Date().toISOString().slice(0, 10);
  const entries: ListingUpdateFeedEntry[] = [];
  for (const { slug, publishedAt, listing } of rows) {
    for (const update of listing.updates) {
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

// Explicit creation — unlike the old single-listing ensurePartnerListing
// (which silently created one the first time any listing page was visited),
// a partner who can have several listings needs "create another one" to be
// a visible, deliberate action (the "+ New listing" button on
// /business/listings), not something that happens as a side effect of
// loading a page.
export async function createPartnerListing(partnerId: string, partnerName: string): Promise<PartnerListing> {
  const slug = await generateListingSlug(partnerName);
  return db.partnerListing.create({
    data: { partnerId, slug, companyName: partnerName, services: [] },
  });
}

export type DirectoryLeadStats = {
  total: number;
  new: number;
  open: number;
  won: number;
  lost: number;
  wonValue: number;
  // How many of the above came in through the listing's Recommend link
  // (DirectoryLead.viaReferral) — a subset of total, not a separate
  // funnel stage, so it's not folded into new/open/won/lost above.
  referred: number;
};

async function computeDirectoryLeadStats(where: Prisma.DirectoryLeadWhereInput): Promise<DirectoryLeadStats> {
  const [total, byStatus, wonAgg, referred] = await Promise.all([
    db.directoryLead.count({ where }),
    db.directoryLead.groupBy({ by: ["status"], where, _count: { _all: true } }),
    db.directoryLead.aggregate({ where: { ...where, status: "WON" }, _sum: { value: true } }),
    db.directoryLead.count({ where: { ...where, viaReferral: true } }),
  ]);
  const counts = new Map<string, number>(byStatus.map((row) => [row.status, row._count._all]));
  const won = counts.get("WON") ?? 0;
  const lost = counts.get("LOST") ?? 0;
  return {
    total,
    new: counts.get("NEW") ?? 0,
    open: total - won - lost,
    won,
    lost,
    wonValue: Number(wonAgg._sum.value ?? 0),
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

export type DirectoryOverviewStats = {
  publishedListings: number;
  pendingListings: number;
  totalLeads: number;
  leadsLast30Days: number;
  wonValue: number;
};

// For Settings → Directory (admin) — across every partner's listing, not
// scoped to one.
export async function getDirectoryOverviewStats(): Promise<DirectoryOverviewStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [publishedListings, pendingListings, totalLeads, leadsLast30Days, wonAgg] = await Promise.all([
    db.partnerListing.count({ where: { status: "PUBLISHED" } }),
    db.partnerListing.count({ where: { status: "PENDING_REVIEW" } }),
    db.directoryLead.count(),
    db.directoryLead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.directoryLead.aggregate({ where: { status: "WON" }, _sum: { value: true } }),
  ]);

  return {
    publishedListings,
    pendingListings,
    totalLeads,
    leadsLast30Days,
    wonValue: Number(wonAgg._sum.value ?? 0),
  };
}
