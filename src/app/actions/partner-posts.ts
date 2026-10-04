"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePartnerAction } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getOwnedListing } from "@/lib/directory";
import { DIRECTORY_LOCALES, directoryListingPostsPath, directoryNewsPath } from "@/lib/directory-i18n";
import { getOwnedPost } from "@/lib/partner-posts";
import { getDecryptedFacebookConnection, deleteFacebookConnection } from "@/lib/facebook-connections";
import { postToFacebookPage, FacebookPostError } from "@/lib/facebook";
import { getSiteOrigin } from "@/lib/site-url";

// Every public surface a post (or its removal) can appear on — the
// listing's own Posts tab merges in live PartnerPost rows alongside
// `updates` (see getListingPostsAsUpdateEntries's own comment), and the
// directory-wide feed does the same across every listing
// (loadLatestPartnerPosts) — both need revalidating in all 3 locales, same
// "one published thing, three language pages" convention as
// revalidateDirectory (src/lib/directory-revalidate.ts), kept separate
// from that helper since neither path it knows about is the Posts tab.
function revalidatePostSurfaces(slug: string) {
  for (const { code } of DIRECTORY_LOCALES) {
    revalidatePath(directoryListingPostsPath(code, slug));
    revalidatePath(directoryNewsPath(code));
  }
}

const createSchema = z.object({
  listingId: z.string().trim().min(1, "Choose which business this post is for."),
  kind: z.enum(["NEWS", "PROMOTION"]),
  title: z.string().trim().min(1, "Give the post a short title.").max(100),
  body: z.string().trim().min(1, "Write something before posting."),
  endDate: z.string().trim().optional(),
  crossPostToFacebook: z.coerce.boolean().optional(),
});

export type CreatePartnerPostFormState =
  | { error: string }
  | { success: true; facebookError?: string }
  | undefined;

// Publishes instantly — unlike PartnerListing.updates (the News &
// Promotions tab inside the full listing editor), a post here never waits
// on an admin re-approving the whole listing (see PartnerPost's own schema
// comment). Facebook cross-posting is attempted inline, right after the
// local row is created, and is always best-effort: a Facebook failure is
// recorded on the row and surfaced back to the form, but never rolls back
// or blocks the post that's already live on this site.
export async function createPartnerPost(_prevState: CreatePartnerPostFormState, formData: FormData): Promise<CreatePartnerPostFormState> {
  const partner = await requirePartnerAction();
  const parsed = createSchema.safeParse({
    listingId: formData.get("listingId"),
    kind: formData.get("kind"),
    title: formData.get("title"),
    body: formData.get("body"),
    endDate: formData.get("endDate") || undefined,
    crossPostToFacebook: formData.get("crossPostToFacebook"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { listingId, kind, title, body, endDate, crossPostToFacebook } = parsed.data;

  const listing = await getOwnedListing(listingId, partner.id);
  if (!listing) {
    return { error: "Listing not found." };
  }

  const post = await db.partnerPost.create({
    data: {
      listingId,
      partnerId: partner.id,
      kind,
      title,
      body,
      endDate: kind === "PROMOTION" && endDate ? new Date(endDate) : null,
    },
  });

  revalidatePostSurfaces(listing.slug);

  if (!crossPostToFacebook) {
    return { success: true };
  }

  const connection = await getDecryptedFacebookConnection(listingId);
  if (!connection) {
    return { success: true, facebookError: "No Facebook Page connected — the post went out on your listing, just not Facebook." };
  }

  try {
    const siteOrigin = await getSiteOrigin();
    const facebookPostId = await postToFacebookPage(connection.pageId, connection.accessToken, { title, body }, siteOrigin);
    await db.partnerPost.update({ where: { id: post.id }, data: { facebookPostId, facebookPostedAt: new Date() } });
    return { success: true };
  } catch (error) {
    const message = error instanceof FacebookPostError ? error.message : "Facebook didn't accept the post.";
    await db.partnerPost.update({ where: { id: post.id }, data: { facebookPostError: message } });
    return { success: true, facebookError: message };
  }
}

export async function deletePartnerPost(id: string): Promise<void> {
  const partner = await requirePartnerAction();
  const post = await getOwnedPost(id, partner.id);
  if (!post) return;
  const listing = await getOwnedListing(post.listingId, partner.id);
  await db.partnerPost.delete({ where: { id } });
  if (listing) revalidatePostSurfaces(listing.slug);
}

// Re-attempts a failed cross-post without creating a duplicate local post
// — a partner shouldn't have to re-type the whole thing just because
// Facebook's API hiccuped the first time.
export async function retryFacebookCrossPost(id: string): Promise<void> {
  const partner = await requirePartnerAction();
  const post = await getOwnedPost(id, partner.id);
  if (!post || post.facebookPostId) return;

  const connection = await getDecryptedFacebookConnection(post.listingId);
  if (!connection) {
    await db.partnerPost.update({ where: { id }, data: { facebookPostError: "No Facebook Page connected." } });
    return;
  }

  try {
    const siteOrigin = await getSiteOrigin();
    const facebookPostId = await postToFacebookPage(connection.pageId, connection.accessToken, { title: post.title, body: post.body }, siteOrigin);
    await db.partnerPost.update({ where: { id }, data: { facebookPostId, facebookPostedAt: new Date(), facebookPostError: null } });
  } catch (error) {
    const message = error instanceof FacebookPostError ? error.message : "Facebook didn't accept the post.";
    await db.partnerPost.update({ where: { id }, data: { facebookPostError: message } });
  }
}

export async function disconnectFacebookPage(listingId: string): Promise<void> {
  const partner = await requirePartnerAction();
  const listing = await getOwnedListing(listingId, partner.id);
  if (!listing) return;
  await deleteFacebookConnection(listingId);
}
