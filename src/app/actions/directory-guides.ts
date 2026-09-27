"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAction } from "@/lib/auth/dal";
import { generateGuideSlug } from "@/lib/directory-guides";
import { regenerateSitemapFile } from "@/lib/sitemap-generator";
import { directoryGuideUrls, directoryGuidesIndexUrls, notifyIndexNow } from "@/lib/indexnow";
import { isValidSlugFormat } from "@/lib/slug";
import { INDUSTRIES } from "@/lib/labels";
import type { Industry } from "@/generated/prisma/client";

// A publish/unpublish/delete always changes what belongs in the sitemap
// (or the guide's own URL's presence in it) and is worth telling Bing/etc.
// about — same treatment publishListing/unpublishDirectoryListing give the
// directory's own sitemap+IndexNow pair. Never awaited by the caller for
// its own sake; `void` at each call site, same "never let a search-engine
// ping block or fail a save" reasoning as every other notifyIndexNow call.
async function announceGuideChange(slug: string): Promise<void> {
  await regenerateSitemapFile();
  void notifyIndexNow([...directoryGuideUrls(slug), ...directoryGuidesIndexUrls()]);
}

function revalidateGuidePaths(id: string) {
  revalidatePath("/admin/guides");
  revalidatePath(`/admin/guides/${id}/edit`);
}

// Explicit creation, same reasoning as createPartnerListing/
// createListingAction — clicking "+ New guide" gets a real DRAFT row
// immediately (a placeholder title/slug the form below will overwrite on
// its first real save), redirected straight into its own edit page,
// rather than typing a title into a page that doesn't exist in the
// database yet.
export async function createGuideAction(): Promise<never> {
  const admin = await requireAdminAction();
  const slug = await generateGuideSlug("untitled-guide");
  const guide = await db.directoryGuide.create({
    data: { slug, title: "Untitled guide", excerpt: "", body: "", authorId: admin.id },
  });
  revalidatePath("/admin/guides");
  redirect(`/admin/guides/${guide.id}/edit`);
}

const guideSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .refine(isValidSlugFormat, { message: "Slug must be lowercase letters, numbers, and hyphens (3-60 characters)" }),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  body: z.string().trim().min(1, "Body is required"),
  industry: z.string().trim().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export type GuideFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  industry: string;
  seoTitle: string;
  seoDescription: string;
};

function stringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function extractGuideFormValues(formData: FormData): GuideFormValues {
  return {
    title: stringField(formData, "title"),
    slug: stringField(formData, "slug"),
    excerpt: stringField(formData, "excerpt"),
    body: stringField(formData, "body"),
    industry: stringField(formData, "industry"),
    seoTitle: stringField(formData, "seoTitle"),
    seoDescription: stringField(formData, "seoDescription"),
  };
}

export type GuideFormState = { error: string; values: GuideFormValues } | undefined;

// Saves every field of an existing guide (title/slug/excerpt/body/
// industry/SEO) — always live, unlike a partner listing's own draft/
// publish split: a guide has no review step, so an admin's save is what's
// shown the moment `status` is PUBLISHED. Publishing/unpublishing itself
// is a separate action below (a plain status flip, not a field to edit
// here) — same "the big save vs. the status change are different clicks"
// split updateDirectoryLeadStatus/convertDirectoryLeadToDeal already draw
// for leads.
export async function updateGuideAction(id: string, _prevState: GuideFormState, formData: FormData): Promise<GuideFormState> {
  await requireAdminAction();
  const parsed = guideSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    industry: formData.get("industry"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid guide data", values: extractGuideFormValues(formData) };
  }
  const data = parsed.data;
  const industry = data.industry && (INDUSTRIES as string[]).includes(data.industry) ? (data.industry as Industry) : null;

  const existing = await db.directoryGuide.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) {
    return { error: "Guide not found.", values: extractGuideFormValues(formData) };
  }
  if (data.slug !== existing.slug) {
    const slugTaken = await db.directoryGuide.findFirst({ where: { slug: data.slug, id: { not: id } }, select: { id: true } });
    if (slugTaken) {
      return { error: "That slug is already used by another guide.", values: extractGuideFormValues(formData) };
    }
  }

  const guide = await db.directoryGuide.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      body: data.body,
      industry,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    },
  });

  revalidateGuidePaths(id);
  if (guide.status === "PUBLISHED") {
    await announceGuideChange(guide.slug);
    // The old slug's page 404s the moment the row moves — no redirect
    // stub exists for a guide the way listing slugs get one, since this
    // is admin-authored content, not a partner's own established URL a
    // visitor or search engine has already been linking to for months.
    if (data.slug !== existing.slug) void notifyIndexNow(directoryGuideUrls(existing.slug));
  }
  // Redirects to itself on success (same convention as
  // updatePartnerCompany/updatePartnerDeal) rather than returning
  // `undefined` and leaving the page as-is — every field below but `body`
  // is an uncontrolled input keyed off `defaultValue`, which only ever
  // applies on mount; without a real navigation here, a field the admin
  // didn't touch this time (or the Industry select's own DRAFT-vs-just-
  // saved gap) would keep showing this render's stale initial value
  // instead of what was actually just written.
  redirect(`/admin/guides/${id}/edit`);
}

export async function publishGuideAction(id: string): Promise<void> {
  await requireAdminAction();
  const guide = await db.directoryGuide.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  revalidateGuidePaths(id);
  await announceGuideChange(guide.slug);
}

export async function unpublishGuideAction(id: string): Promise<void> {
  await requireAdminAction();
  await db.directoryGuide.update({ where: { id }, data: { status: "DRAFT" } });
  revalidateGuidePaths(id);
  await regenerateSitemapFile();
}

export async function deleteGuideAction(id: string): Promise<never> {
  await requireAdminAction();
  const guide = await db.directoryGuide.delete({ where: { id } });
  revalidatePath("/admin/guides");
  if (guide.status === "PUBLISHED") await regenerateSitemapFile();
  redirect("/admin/guides");
}
