"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import {
  removeListingGalleryPhoto,
  reorderListingGalleryPhotos,
  updateListingGalleryPhotoCaption,
  updateListingGalleryPhotoGallery,
  uploadListingGalleryPhoto,
} from "@/app/actions/directory-images";
import { compressImage } from "@/lib/image-compression";
import { Input } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import type { PhotoEntry } from "@/lib/directory";

// Mirrors MAX_GALLERY_PHOTOS in src/lib/directory.ts — duplicated rather
// than imported, since that module's top-level `db` import can't be bundled
// for the browser (same reason FaqEditor keeps its own copy of MAX_FAQS).
const MAX_GALLERY_PHOTOS = 12;

// Unlike ServicesEditor/FaqEditor (a plain array serialized to one hidden
// field, saved only when the rest of the form is), every change here calls
// its own server action immediately — same reasoning as the About field's
// image button (see markdown-lite-editor.tsx): a partner wants to see the
// upload/remove/reorder happen, not stage it for a later Save. Whether a
// change is actually live on the public page is still gated by the normal
// save/submit/approve cycle (see buildPublishedSnapshot's photos parameter)
// — this component only ever touches PartnerListing.photoIds, never
// publishedSnapshot.
export function ListingPhotosEditor({ listingId, initialPhotos }: { listingId: string; initialPhotos: PhotoEntry[] }) {
  const [photos, setPhotos] = useState<PhotoEntry[]>(initialPhotos);
  // The album every file in the *next* upload batch goes into — typed or
  // picked once, applied to every file selected together, so "create an
  // album and add several photos to it" is one action instead of retyping
  // the same name on each photo afterwards. Blank means no album (the photo
  // lands in "Other photos" on the public page — see photos/page.tsx).
  const [albumInput, setAlbumInput] = useState("");
  // { done, total } while a batch is uploading — null the rest of the time.
  // Shown as "Uploading 2/5…" so picking several files at once still reads
  // as one action with visible progress, not a frozen button.
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Uploads run one at a time, in the order picked, rather than in parallel
  // — uploadListingGalleryPhoto reads the listing's current photoIds and
  // writes back photoIds + the new id, so two calls in flight together would
  // each read the same starting array and the second write would silently
  // drop the first's photo. Sequential avoids that at the cost of a little
  // wall-clock time, which a progress count makes tolerable.
  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const album = albumInput.trim();
    const room = MAX_GALLERY_PHOTOS - photos.length;
    const toUpload = files.slice(0, room);
    setError(files.length > toUpload.length ? `Only added ${toUpload.length} — up to ${MAX_GALLERY_PHOTOS} photos per listing.` : null);

    for (let i = 0; i < toUpload.length; i++) {
      setUploadProgress({ done: i, total: toUpload.length });
      const compressed = await compressImage(toUpload[i]);
      const formData = new FormData();
      formData.set("image", compressed);
      formData.set("gallery", album);
      const result = await uploadListingGalleryPhoto(listingId, formData);
      if (result.status !== "ok") {
        setError(result.message);
        break;
      }
      setPhotos((prev) => [...prev, result.photo]);
    }
    setUploadProgress(null);
  }

  function handleRemove(photoId: string) {
    const previous = photos;
    setError(null);
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    startTransition(async () => {
      const result = await removeListingGalleryPhoto(listingId, photoId);
      if (result.status !== "ok") {
        setPhotos(previous);
        setError(result.message);
      }
    });
  }

  function handleCaptionBlur(photoId: string, caption: string) {
    startTransition(async () => {
      const result = await updateListingGalleryPhotoCaption(listingId, photoId, caption);
      if (result.status !== "ok") setError(result.message);
    });
  }

  function handleGalleryBlur(photoId: string, gallery: string) {
    startTransition(async () => {
      const result = await updateListingGalleryPhotoGallery(listingId, photoId, gallery);
      if (result.status !== "ok") setError(result.message);
    });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const previous = photos;
    const reordered = [...photos];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setError(null);
    setPhotos(reordered);
    startTransition(async () => {
      const result = await reorderListingGalleryPhotos(
        listingId,
        reordered.map((photo) => photo.id),
      );
      if (result.status !== "ok") {
        setPhotos(previous);
        setError(result.message);
      }
    });
  }

  // Existing album names a partner already used on this listing's other
  // photos, offered back through the input's own datalist so grouping two
  // photos together is picking the same name from a list, not remembering
  // and retyping it exactly (a typo like "Office"/"office" would otherwise
  // silently create two separate albums — see PhotoLightbox's grouping).
  const albumNames = [...new Set(photos.map((photo) => photo.gallery).filter(Boolean))];
  // Grouped for display only — the underlying order (and what handleMove
  // reorders) stays the single flat array photoIds already is; a photo's
  // group here is just whichever section its own current gallery value
  // puts it in, recomputed on every render.
  const groups = [...new Set(photos.map((photo) => photo.gallery))].map((name) => ({
    name,
    items: photos
      .map((photo, index) => ({ photo, index }))
      .filter(({ photo }) => photo.gallery === name),
  }));

  function renderPhoto(photo: PhotoEntry, index: number) {
    return (
      <div key={photo.id} className="space-y-1.5 rounded-md border border-slate-200 p-2 dark:border-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images, same reasoning as ListingLogo */}
        <img
          src={`/api/directory-images/${photo.id}`}
          alt={photo.caption || "Gallery photo"}
          className="h-28 w-full rounded object-cover"
        />
        <Input
          defaultValue={photo.caption}
          onBlur={(event) => handleCaptionBlur(photo.id, event.target.value)}
          placeholder="Caption (optional)"
          className="h-8 text-xs"
        />
        <Input
          defaultValue={photo.gallery}
          onBlur={(event) => handleGalleryBlur(photo.id, event.target.value)}
          placeholder="Album (optional)"
          list="photo-album-names"
          className="h-8 text-xs"
        />
        <div className="flex items-center justify-between gap-1">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleMove(index, -1)}
              disabled={index === 0}
              aria-label="Move earlier"
              title="Move earlier"
              className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
            >
              &uarr;
            </button>
            <button
              type="button"
              onClick={() => handleMove(index, 1)}
              disabled={index === photos.length - 1}
              aria-label="Move later"
              title="Move later"
              className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
            >
              &darr;
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleRemove(photo.id)}
            aria-label="Remove photo"
            title="Remove photo"
            className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {albumNames.length > 0 && (
        <datalist id="photo-album-names">
          {albumNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}
      {photos.length > 0 && (
        <div className="space-y-4">
          {groups.map(({ name, items }) => (
            <div key={name || "\u0000"}>
              {/* A heading only for a named album — an untitled group (no
                  gallery set) stays a plain grid, same as the public page. */}
              {name && (
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {name}
                </h4>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map(({ photo, index }) => renderPhoto(photo, index))}
              </div>
            </div>
          ))}
        </div>
      )}
      {photos.length < MAX_GALLERY_PHOTOS && (
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="photo-album-input" className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
              Album (optional)
            </label>
            <Input
              id="photo-album-input"
              value={albumInput}
              onChange={(event) => setAlbumInput(event.target.value)}
              placeholder="e.g. Team Building 2026"
              list="photo-album-names"
              className="h-8 w-48 text-xs"
            />
          </div>
          <label className={buttonClasses("ghost", "sm", "w-fit cursor-pointer")}>
            {uploadProgress ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploadProgress ? `Uploading ${uploadProgress.done + 1}/${uploadProgress.total}…` : "Add photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              disabled={uploadProgress !== null}
              className="hidden"
            />
          </label>
        </div>
      )}
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
