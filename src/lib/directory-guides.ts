import "server-only";

import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { firstMarkdownLiteImageUrl } from "@/lib/markdown-lite";
import { faqsFromJson, type FaqEntry } from "@/lib/directory";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import type { DirectoryGuideStatus, Industry } from "@/generated/prisma/client";

// Admin-authored pillar/guide content (see prisma/schema.prisma's
// DirectoryGuide) — a much simpler data model than PartnerListing:
// there's no owning partner, no draft-vs-published snapshot, no
// review/approve step. The row itself is what's shown once `status` is
// PUBLISHED, so a save takes effect immediately, same as any other
// admin-only content in this app.

type GuideTranslationEntry = { title: string; excerpt: string; body: string; faqs: FaqEntry[] };

// AI-translated (or hand-edited) copies of title/excerpt/body/faqs for the
// directory's non-English locales — same shape/convention as
// ListingTranslations in src/lib/directory.ts (keyed by locale minus "en";
// the English columns are the primary copy, never duplicated in here).
// Unlike PartnerListing, there's no admin-UI translation editor for guides
// yet — this is populated only by prisma/guides-seed.ts at seed time.
export type DirectoryGuideTranslations = Partial<Record<Exclude<DirectoryLocale, "en">, GuideTranslationEntry>>;

const GUIDE_TRANSLATION_LOCALES: Exclude<DirectoryLocale, "en">[] = ["zh", "ms"];

function sanitizeGuideTranslationEntry(entry: unknown): GuideTranslationEntry | null {
  if (!entry || typeof entry !== "object") return null;
  const raw = entry as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const excerpt = typeof raw.excerpt === "string" ? raw.excerpt.trim() : "";
  const body = typeof raw.body === "string" ? raw.body.trim() : "";
  const faqs = faqsFromJson(raw.faqs);
  if (!title && !excerpt && !body && faqs.length === 0) return null;
  return { title, excerpt, body, faqs };
}

export function guideTranslationsFromJson(value: unknown): DirectoryGuideTranslations {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const result: DirectoryGuideTranslations = {};
  for (const locale of GUIDE_TRANSLATION_LOCALES) {
    const entry = sanitizeGuideTranslationEntry(raw[locale]);
    if (entry) result[locale] = entry;
  }
  return result;
}

export type GuideDisplay = { title: string; excerpt: string; body: string; faqs: FaqEntry[] };

// Same fallback rule as resolveListingDisplay: a translation is used only
// if present for that guide's locale, otherwise the English column. faqs
// falls back the same way as title/excerpt/body — an empty translated FAQ
// list (translations added before faqs existed) still shows the English
// questions rather than no FAQ section at all.
export function resolveGuideDisplay(
  guide: { title: string; excerpt: string; body: string; faqs: unknown; translations: unknown },
  locale: DirectoryLocale,
): GuideDisplay {
  const translation = locale === "zh" || locale === "ms" ? guideTranslationsFromJson(guide.translations)[locale] : undefined;
  return {
    title: translation?.title || guide.title,
    excerpt: translation?.excerpt || guide.excerpt,
    body: translation?.body || guide.body,
    faqs: translation?.faqs.length ? translation.faqs : faqsFromJson(guide.faqs),
  };
}

export type DirectoryGuideSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  // The guide's own cover image, if its body happens to embed one (see
  // "Give the first guide a cover image" — there's no dedicated
  // coverImage column, just the first ![alt](url) the author's markdown
  // happens to contain, same source buildGuideJsonLd already reads for
  // the guide's own JSON-LD image). null for a guide that hasn't had one
  // added yet — the index/related-guides cards just render without a
  // thumbnail rather than showing an empty placeholder box.
  coverImageUrl: string | null;
  industry: Industry | null;
  publishedAt: Date | null;
  updatedAt: Date;
};

const SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  body: true,
  // Only fetched here because resolveGuideDisplay's input type requires it
  // (title/excerpt/body/faqs all resolve together) — a summary card itself
  // never reads DirectoryGuideSummary.faqs, which doesn't exist as a field.
  faqs: true,
  industry: true,
  publishedAt: true,
  updatedAt: true,
  translations: true,
} as const;

function toGuideSummary(
  guide: { id: string; slug: string; industry: Industry | null; publishedAt: Date | null; updatedAt: Date } & Parameters<
    typeof resolveGuideDisplay
  >[0],
  locale: DirectoryLocale,
): DirectoryGuideSummary {
  const display = resolveGuideDisplay(guide, locale);
  return {
    id: guide.id,
    slug: guide.slug,
    title: display.title,
    excerpt: display.excerpt,
    coverImageUrl: firstMarkdownLiteImageUrl(display.body),
    industry: guide.industry,
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
  };
}

export async function listPublishedGuides(locale: DirectoryLocale): Promise<DirectoryGuideSummary[]> {
  const guides = await db.directoryGuide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: SUMMARY_SELECT,
  });
  return guides.map((guide) => toGuideSummary(guide, locale));
}

export async function getPublishedGuideBySlug(slug: string) {
  return db.directoryGuide.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });
}

// For an industry page's own "Related guides" section (see
// industry-page-content.tsx) — the topical-cluster link back from a
// listing-heavy hub page to the guide(s) written about that industry.
// `excludeId` only matters when called from a guide's own detail page
// (its own industry siblings, not itself); the industry page passes none.
export async function listPublishedGuidesByIndustry(
  industry: Industry,
  locale: DirectoryLocale,
  options: { excludeId?: string; limit?: number } = {},
): Promise<DirectoryGuideSummary[]> {
  const guides = await db.directoryGuide.findMany({
    where: {
      status: "PUBLISHED",
      industry,
      ...(options.excludeId ? { id: { not: options.excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: options.limit ?? 3,
    select: SUMMARY_SELECT,
  });
  return guides.map((guide) => toGuideSummary(guide, locale));
}

export type DirectoryGuideForAdmin = {
  id: string;
  slug: string;
  title: string;
  status: DirectoryGuideStatus;
  industry: Industry | null;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
};

export async function listAllGuidesForAdmin(): Promise<DirectoryGuideForAdmin[]> {
  const guides = await db.directoryGuide.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      industry: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
  });
  return guides.map(({ author, ...guide }) => ({ ...guide, authorName: author.name }));
}

export async function getGuideByIdForAdmin(id: string) {
  return db.directoryGuide.findUnique({ where: { id } });
}

// Same find-a-free-slug-by-retrying convention as generateListingSlug in
// src/lib/directory.ts — a single unique scalar column, no separate
// slug-history table, collision handling lives here rather than in the
// database.
export async function generateGuideSlug(title: string): Promise<string> {
  const base = slugify(title) || "guide";
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = await db.directoryGuide.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique guide slug — please try again.");
}
