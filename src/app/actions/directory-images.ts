"use server";

import { db } from "@/lib/db";
import { requirePartnerAction } from "@/lib/auth/dal";
import { getOwnedListing, MAX_GALLERY_PHOTOS, type PhotoEntry } from "@/lib/directory";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CAPTION_LENGTH = 140;

export type UploadDirectoryImageResult = { status: "ok"; url: string } | { status: "error"; message: string };

// Called directly from the About field's formatting toolbar (see
// markdown-lite-editor.tsx) — the image needs to exist and be servable the
// moment it's inserted into the text, not deferred until the listing is
// saved. `listingId` comes from the editor page the toolbar is mounted in
// (a partner can have several listings) and is checked against the calling
// partner via getOwnedListing before the image is attached to it — same
// ownership discipline as every other listing action.
export async function uploadDirectoryListingImage(
  listingId: string,
  formData: FormData,
): Promise<UploadDirectoryImageResult> {
  const partner = await requirePartnerAction();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image." };
  }
  if (!file.type.startsWith("image/")) {
    return { status: "error", message: "That doesn't look like an image." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { status: "error", message: "That image is too large (max 5MB)." };
  }

  const listing = await getOwnedListing(listingId, partner.id);
  if (!listing) {
    return { status: "error", message: "Listing not found." };
  }
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const image = await db.directoryListingImage.create({
    data: { mimeType: file.type, data, listingId: listing.id },
    select: { id: true },
  });

  return { status: "ok", url: `/api/directory-images/${image.id}` };
}

export type GalleryPhotoResult = { status: "ok"; photo: PhotoEntry } | { status: "error"; message: string };
export type GalleryActionResult = { status: "ok" } | { status: "error"; message: string };

// The listing's photo gallery (see PartnerListing.photoIds) — a separate,
// ordered set of images from the About field's own embeds above, though
// both share the same DirectoryListingImage table and public route. Upload
// is immediate, same reasoning as uploadDirectoryListingImage: a partner
// wants to see the photo in the gallery editor right away. Whether it's
// actually live on the public page is still gated by the normal
// save/submit/approve cycle — see buildPublishedSnapshot's photos parameter
// — since photoIds itself is one more field on the listing row, only copied
// into publishedSnapshot the next time an admin approves it.
export async function uploadListingGalleryPhoto(listingId: string, formData: FormData): Promise<GalleryPhotoResult> {
  const partner = await requirePartnerAction();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image." };
  }
  if (!file.type.startsWith("image/")) {
    return { status: "error", message: "That doesn't look like an image." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { status: "error", message: "That image is too large (max 5MB)." };
  }

  const listing = await getOwnedListing(listingId, partner.id);
  if (!listing) {
    return { status: "error", message: "Listing not found." };
  }
  if (listing.photoIds.length >= MAX_GALLERY_PHOTOS) {
    return { status: "error", message: `You can add up to ${MAX_GALLERY_PHOTOS} photos.` };
  }

  const caption = String(formData.get("caption") ?? "").trim().slice(0, MAX_CAPTION_LENGTH);
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  // The interactive form (a callback, not the array form used elsewhere in
  // this file) because the second write needs the first write's own result
  // (the new row's id) — the array form runs every statement independently
  // and can't thread a value between them.
  const image = await db.$transaction(async (tx) => {
    const created = await tx.directoryListingImage.create({
      data: { mimeType: file.type, data, caption: caption || null, listingId: listing.id },
      select: { id: true },
    });
    await tx.partnerListing.update({
      where: { id: listing.id },
      data: { photoIds: [...listing.photoIds, created.id] },
    });
    return created;
  });

  return { status: "ok", photo: { id: image.id, caption } };
}

export async function removeListingGalleryPhoto(listingId: string, photoId: string): Promise<GalleryActionResult> {
  const partner = await requirePartnerAction();
  const listing = await getOwnedListing(listingId, partner.id);
  if (!listing) {
    return { status: "error", message: "Listing not found." };
  }
  if (!listing.photoIds.includes(photoId)) {
    return { status: "error", message: "Photo not found." };
  }

  await db.$transaction([
    db.directoryListingImage.deleteMany({ where: { id: photoId, listingId: listing.id } }),
    db.partnerListing.update({
      where: { id: listing.id },
      data: { photoIds: listing.photoIds.filter((id) => id !== photoId) },
    }),
  ]);

  return { status: "ok" };
}

// orderedIds must be exactly the listing's current photoIds, reordered —
// never a different set — so this can't be used to smuggle in another
// listing's photo id. Silently drops nothing and adds nothing: a mismatched
// set is rejected outright rather than guessed at.
export async function reorderListingGalleryPhotos(listingId: string, orderedIds: string[]): Promise<GalleryActionResult> {
  const partner = await requirePartnerAction();
  const listing = await getOwnedListing(listingId, partner.id);
  if (!listing) {
    return { status: "error", message: "Listing not found." };
  }
  const current = [...listing.photoIds].sort();
  const requested = [...orderedIds].sort();
  if (current.length !== requested.length || current.some((id, i) => id !== requested[i])) {
    return { status: "error", message: "That doesn't match your current photos." };
  }

  await db.partnerListing.update({ where: { id: listing.id }, data: { photoIds: orderedIds } });
  return { status: "ok" };
}

export async function updateListingGalleryPhotoCaption(
  listingId: string,
  photoId: string,
  caption: string,
): Promise<GalleryPhotoResult> {
  const partner = await requirePartnerAction();
  const listing = await getOwnedListing(listingId, partner.id);
  if (!listing || !listing.photoIds.includes(photoId)) {
    return { status: "error", message: "Photo not found." };
  }

  const trimmed = caption.trim().slice(0, MAX_CAPTION_LENGTH);
  await db.directoryListingImage.update({
    where: { id: photoId },
    data: { caption: trimmed || null },
  });
  return { status: "ok", photo: { id: photoId, caption: trimmed } };
}
