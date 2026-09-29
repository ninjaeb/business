"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Sparkles, Star, Upload, X } from "lucide-react";
import { rewriteTestimonialWithAi, submitDirectoryTestimonial, uploadTestimonialPhoto } from "@/app/actions/testimonials";
import { compressImage } from "@/lib/image-compression";
import { Button, buttonClasses } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DIRECTORY_STRINGS, formatTestimonialPhotosUploading, type DirectoryLocale } from "@/lib/directory-i18n";

const MAX_BODY_LENGTH = 2000;
// Mirrors MAX_TESTIMONIAL_PHOTOS in src/app/actions/testimonials.ts —
// duplicated rather than imported, same reasoning as ListingPhotosEditor's
// own copy of MAX_GALLERY_PHOTOS (that module's server-only imports can't be
// bundled for the browser).
const MAX_TESTIMONIAL_PHOTOS = 4;

// Same shape as the 1-5 rating this writes (DirectoryTestimonial.rating) —
// a plain button row rather than a native <input type="radio"> group, since
// nothing here needs to work without JS (this is already a client
// component) and a row of stars reads at a glance in a way five radio
// buttons wouldn't.
function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star === value ? 0 : star)}
          className="p-0.5"
        >
          <Star
            className={
              star <= value
                ? "h-6 w-6 fill-amber-400 text-amber-400"
                : "h-6 w-6 text-slate-300 dark:text-neutral-700"
            }
          />
        </button>
      ))}
    </div>
  );
}

// The public "write a testimonial" form on a listing's Testimonials page
// (see src/app/[locale]/[slug]/testimonials/page.tsx) — same honeypot/
// render-timing shape as DirectoryLeadForm, this is exactly as exposed to
// the open internet. Every submission lands PENDING (see
// submitDirectoryTestimonial); this form has no way to show it live, only
// that it was received.
export function TestimonialForm({
  slug,
  locale,
  aiAvailable,
  googleReviewUrl,
}: {
  slug: string;
  locale: DirectoryLocale;
  aiAvailable: boolean;
  // Null when the listing has no "write a review" link set (see
  // PartnerListing.googleReviewUrl's own comment) — the "Leave it on Google
  // too" step is simply skipped in that case, not shown disabled.
  googleReviewUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(submitDirectoryTestimonial, undefined);
  const t = DIRECTORY_STRINGS[locale];
  const toast = useToast();

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const [rewriting, startRewrite] = useTransition();

  // Photos picked before submitting, alongside their preview object URLs
  // (kept as a parallel array, not derived on every render, so each preview
  // is revoked exactly once — see handleRemovePhoto/the cleanup effect
  // below). Uploaded only after the text itself is saved (see the effect
  // below) — see uploadTestimonialPhoto's own comment on why this can't be
  // one atomic submission with the rest of the form.
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoPickError, setPhotoPickError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  // Starts true so a submission with zero photos attached doesn't show a
  // stray "uploading" state for even a tick; the upload effect below flips
  // it false the moment a real, non-empty submission succeeds.
  const [photosDone, setPhotosDone] = useState(true);
  const uploadedTestimonialId = useRef<string | null>(null);

  function handleRewrite() {
    startRewrite(async () => {
      const result = await rewriteTestimonialWithAi(body);
      if (result.status === "ok") {
        setBody(result.data.text);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handlePhotosSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_TESTIMONIAL_PHOTOS - photos.length;
    const toAdd = files.slice(0, room);
    setPhotoPickError(files.length > toAdd.length ? t.testimonialFormPhotosTooMany : null);
    setPhotos((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...toAdd.map((file) => URL.createObjectURL(file))]);
  }

  function handleRemovePhoto(index: number) {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Revokes every preview URL still outstanding when the form itself goes
  // away (e.g. navigating off this page mid-pick) — the ones removed via
  // handleRemovePhoto, or consumed by the upload effect below, are already
  // revoked by then.
  useEffect(() => {
    return () => {
      for (const url of photoPreviews) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup-only, deliberately not re-run on every photoPreviews change
  }, []);

  // Fires once per successful text submission — uploadedTestimonialId
  // guards against re-running for the same id (e.g. a parent re-render),
  // since this already-fired submission's photos must upload exactly once.
  // A fake "success" from the honeypot/timing guards (see
  // submitDirectoryTestimonial) carries an empty testimonialId; treated the
  // same as "no photos to upload" rather than surfacing an error a real bot
  // would learn from.
  useEffect(() => {
    if (state?.status !== "success" || uploadedTestimonialId.current === state.testimonialId) return;
    uploadedTestimonialId.current = state.testimonialId;

    const testimonialId = state.testimonialId;
    const toUpload = photos;
    let cancelled = false;
    (async () => {
      // Yields once before touching any state, so every setState below runs
      // as a genuine async callback rather than synchronously within this
      // effect's own call stack (see react-hooks/set-state-in-effect).
      await Promise.resolve();
      if (cancelled) return;

      if (!testimonialId || toUpload.length === 0) {
        setPhotosDone(true);
        return;
      }

      setPhotosDone(false);
      for (let i = 0; i < toUpload.length; i++) {
        if (cancelled) return;
        setUploadProgress({ done: i, total: toUpload.length });
        const compressed = await compressImage(toUpload[i]);
        const formData = new FormData();
        formData.set("testimonialId", testimonialId);
        formData.set("image", compressed);
        const result = await uploadTestimonialPhoto(formData);
        if (cancelled) return;
        if (result.status !== "ok") {
          setPhotoUploadError(result.message);
          break;
        }
      }
      if (!cancelled) {
        setUploadProgress(null);
        setPhotosDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- photos is read only inside this effect's own async closure, keyed off state itself changing
  }, [state]);

  async function handlePostToGoogle() {
    if (!googleReviewUrl) return;
    try {
      await navigator.clipboard.writeText(body);
      toast.success(t.testimonialGoogleCopied);
    } catch {
      // Best-effort — the review page still opens either way; the visitor
      // just has to type it themselves instead of pasting.
    }
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  if (state?.status === "success") {
    return (
      <div className="space-y-3">
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {t.testimonialFormSuccess}
        </p>
        {uploadProgress && (
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {formatTestimonialPhotosUploading(t.testimonialFormPhotosUploading, uploadProgress.done + 1, uploadProgress.total)}
          </p>
        )}
        {photoUploadError && <p className="text-sm text-rose-600 dark:text-rose-400">{photoUploadError}</p>}
        {/* Held back until any attached photos have finished uploading —
            the Google button hands off the visitor's own text, not the
            photos, but showing it while uploads are still silently running
            in the background would read as "done" a beat too early. */}
        {photosDone && googleReviewUrl && (
          <Button type="button" variant="secondary" onClick={handlePostToGoogle}>
            {t.testimonialGoogleCta}
          </Button>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="rating" value={rating || ""} />
      {/* Honeypot: hidden from real visitors, often filled in by bots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="testimonial-website">Leave this field blank</label>
        <input id="testimonial-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="renderedAt" value={renderedAt} />

      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.testimonialFormHeading}</h3>

      <FieldGroup label={t.testimonialFormNameLabel} htmlFor="testimonial-name" required>
        <Input
          id="testimonial-name"
          name="authorName"
          required
          placeholder={t.testimonialFormNamePlaceholder}
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          className="text-base"
        />
      </FieldGroup>

      <FieldGroup label={t.testimonialFormRatingLabel} htmlFor="testimonial-rating">
        <StarPicker value={rating} onChange={setRating} />
      </FieldGroup>

      <FieldGroup label={t.testimonialFormBodyLabel} htmlFor="testimonial-body" required>
        <Textarea
          id="testimonial-body"
          name="body"
          rows={5}
          required
          maxLength={MAX_BODY_LENGTH}
          placeholder={t.testimonialFormBodyPlaceholder}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="text-base"
        />
        {aiAvailable && (
          <button
            type="button"
            onClick={handleRewrite}
            disabled={rewriting || body.trim().length === 0}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-petrol hover:underline disabled:opacity-50 disabled:no-underline dark:text-petrol-light"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {rewriting ? t.testimonialFormRewriting : t.testimonialFormRewriteCta}
          </button>
        )}
      </FieldGroup>

      <FieldGroup label={t.testimonialFormPhotosLabel} htmlFor="testimonial-photos">
        {photoPreviews.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {photoPreviews.map((src, index) => (
              <div key={src} className="relative h-16 w-16">
                {/* eslint-disable-next-line @next/next/no-img-element -- a local blob: preview, never a real uploaded URL */}
                <img src={src} alt="" className="h-16 w-16 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  aria-label="Remove photo"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < MAX_TESTIMONIAL_PHOTOS && (
          <label htmlFor="testimonial-photos" className={buttonClasses("ghost", "sm", "w-fit cursor-pointer")}>
            <Upload className="h-3.5 w-3.5" />
            {t.testimonialFormPhotosCta}
            <input
              id="testimonial-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosSelected}
              className="hidden"
            />
          </label>
        )}
        {photoPickError && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{photoPickError}</p>}
      </FieldGroup>

      {state?.status === "error" && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{t.testimonialErrors[state.code]}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-led text-base text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
      >
        {pending ? t.testimonialFormSubmitting : t.testimonialFormSubmit}
      </Button>
    </form>
  );
}
