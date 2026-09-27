import "server-only";

import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { DirectoryGuideStatus, Industry } from "@/generated/prisma/client";

// Admin-authored pillar/guide content (see prisma/schema.prisma's
// DirectoryGuide) — a much simpler data model than PartnerListing:
// there's no owning partner, no draft-vs-published snapshot, no
// review/approve step. The row itself is what's shown once `status` is
// PUBLISHED, so a save takes effect immediately, same as any other
// admin-only content in this app.

export type DirectoryGuideSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  industry: Industry | null;
  publishedAt: Date | null;
  updatedAt: Date;
};

const SUMMARY_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  industry: true,
  publishedAt: true,
  updatedAt: true,
} as const;

export async function listPublishedGuides(): Promise<DirectoryGuideSummary[]> {
  return db.directoryGuide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: SUMMARY_SELECT,
  });
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
  options: { excludeId?: string; limit?: number } = {},
): Promise<DirectoryGuideSummary[]> {
  return db.directoryGuide.findMany({
    where: {
      status: "PUBLISHED",
      industry,
      ...(options.excludeId ? { id: { not: options.excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: options.limit ?? 3,
    select: SUMMARY_SELECT,
  });
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
