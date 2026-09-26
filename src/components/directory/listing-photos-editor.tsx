"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import {
  removeListingGalleryPhoto,
  reorderListingGalleryPhotos,
  updateListingGalleryPhotoCaption,
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.set("image", compressed);
    const result = await uploadListingGalleryPhoto(listingId, formData);
    setUploading(false);

    if (result.status !== "ok") {
      setError(result.message);
      return;
    }
    setPhotos((prev) => [...prev, result.photo]);
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

  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
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
          ))}
        </div>
      )}
      {photos.length < MAX_GALLERY_PHOTOS && (
        <label className={buttonClasses("ghost", "sm", "w-fit cursor-pointer")}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Add photo"}
          <input type="file" accept="image/*" onChange={handleFileSelected} disabled={uploading} className="hidden" />
        </label>
      )}
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
