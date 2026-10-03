"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Lightbulb, Loader2, Sparkles, Star, Upload, X } from "lucide-react";
import {
  rewriteTestimonialWithAi,
  submitStandaloneTestimonial,
  suggestTestimonialIdeasWithAi,
  uploadTestimonialPhoto,
} from "@/app/actions/testimonials";
import { compressImage } from "@/lib/image-compression";
import { Button, buttonClasses } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ListingLogo } from "@/components/directory/listing-logo";
import {
  DIRECTORY_STRINGS,
  formatStandaloneTestimonialHeading,
  formatTestimonialPhotosUploading,
  formatTestimonialRequestContext,
  type DirectoryLocale,
} from "@/lib/directory-i18n";

const MAX_BODY_LENGTH = 2000;
// Mirrors MAX_TESTIMONIAL_PHOTOS in src/app/actions/testimonials.ts — same
// "duplicated rather than imported" reasoning as TestimonialForm's own copy.
const MAX_TESTIMONIAL_PHOTOS = 4;

// Same shape as TestimonialForm's own StarPicker — duplicated rather than
// shared, same "small enough to just copy" convention this codebase already
// uses elsewhere (see MAX_TESTIMONIAL_PHOTOS's own comment in
// testimonial-form.tsx) for the two forms to stay fully independent.
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
              star <= value ? "h-7 w-7 fill-amber-400 text-amber-400" : "h-7 w-7 text-slate-300 dark:text-neutral-700"
            }
          />
        </button>
      ))}
    </div>
  );
}

// The partner's own request-link flow (see /business-portal/testimonial-links
// and /[locale]/review/[token]) — unlike TestimonialForm, this needs no
// account at all: the link's own token stands in for one, re-validated
// server-side on submit (see submitStandaloneTestimonial). Feature-equivalent
// to TestimonialForm (writing tips, AI ideas/rewrite, photos, Google
// cross-post) — the logic below is duplicated rather than shared, same
// convention as StarPicker above, since the two forms' auth/identity shape
// differs enough (name/company/title fields here, visitor session there)
// that sharing would mean threading that difference through every helper.
export function StandaloneTestimonialForm({
  token,
  locale,
  slug,
  aiAvailable,
  googleReviewUrl,
  listing,
  serviceTitle,
  prefill,
}: {
  token: string;
  locale: DirectoryLocale;
  // Used only for suggestTestimonialIdeasWithAi, which reads the listing's
  // own published products/services by slug (see that action's own comment).
  slug: string;
  aiAvailable: boolean;
  // Null when the listing has no "write a review" link set (see
  // PartnerListing.googleReviewUrl's own comment) — the "Leave it on Google
  // too" step is simply skipped in that case, not shown disabled.
  googleReviewUrl: string | null;
  listing: { companyName: string; logoUrl: string | null };
  serviceTitle: string | null;
  prefill: { name: string; company: string; title: string };
}) {
  const [state, formAction, pending] = useActionState(submitStandaloneTestimonial, undefined);
  const t = DIRECTORY_STRINGS[locale];
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const [body, setBody] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const [rewriting, startRewrite] = useTransition();
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [suggesting, startSuggest] = useTransition();

  function handleRatingChange(value: number) {
    setRating(value);
    if (value > 0) setRatingError(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (rating === 0) {
      event.preventDefault();
      setRatingError(true);
    }
  }

  // Photos picked before submitting — same parallel-array-of-previews shape,
  // and the same post-submission upload sequencing, as TestimonialForm.
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoPickError, setPhotoPickError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
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

  function handleSuggestIdeas() {
    startSuggest(async () => {
      const result = await suggestTestimonialIdeasWithAi(slug, locale);
      if (result.status === "ok") {
        setIdeas(result.data.ideas);
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

  useEffect(() => {
    return () => {
      for (const url of photoPreviews) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup-only, deliberately not re-run on every photoPreviews change
  }, []);

  useEffect(() => {
    if (state?.status !== "success" || uploadedTestimonialId.current === state.testimonialId) return;
    uploadedTestimonialId.current = state.testimonialId;

    const testimonialId = state.testimonialId;
    const toUpload = photos;
    let cancelled = false;
    (async () => {
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
      <div className="mx-auto max-w-lg space-y-3 px-4 py-16 text-center">
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {t.testimonialFormSuccess}
        </p>
        {uploadProgress && (
          <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {formatTestimonialPhotosUploading(t.testimonialFormPhotosUploading, uploadProgress.done + 1, uploadProgress.total)}
          </p>
        )}
        {photoUploadError && <p className="text-sm text-rose-600 dark:text-rose-400">{photoUploadError}</p>}
        {photosDone && googleReviewUrl && (
          <Button type="button" variant="secondary" onClick={handlePostToGoogle}>
            {t.testimonialGoogleCta}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <ListingLogo name={listing.companyName} logoUrl={listing.logoUrl} size={48} className="h-12 w-12 text-lg" />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {formatStandaloneTestimonialHeading(t.standaloneTestimonialHeading, listing.companyName)}
        </h1>
      </div>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{t.standaloneTestimonialIntro}</p>

      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="rating" value={rating || ""} />
        {/* Honeypot: hidden from real visitors, often filled in by bots. */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label htmlFor="standalone-testimonial-website">Leave this field blank</label>
          <input id="standalone-testimonial-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <input type="hidden" name="renderedAt" value={renderedAt} />

        {serviceTitle && (
          <p className="rounded-xl bg-led-soft px-3 py-2 text-sm text-petrol-ink dark:bg-led-soft-dark dark:text-petrol-light">
            {formatTestimonialRequestContext(t.testimonialRequestContext, serviceTitle)}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label={t.signupNameLabel} htmlFor="standalone-testimonial-name" required>
            <Input id="standalone-testimonial-name" name="authorName" required maxLength={100} defaultValue={prefill.name} />
          </FieldGroup>
          <FieldGroup label={t.testimonialPositionLabel} htmlFor="standalone-testimonial-title">
            <Input id="standalone-testimonial-title" name="authorTitle" maxLength={100} defaultValue={prefill.title} />
          </FieldGroup>
        </div>
        <FieldGroup label={t.testimonialCompanyLabel} htmlFor="standalone-testimonial-company">
          <Input id="standalone-testimonial-company" name="authorCompany" maxLength={150} defaultValue={prefill.company} />
        </FieldGroup>

        <FieldGroup label={t.testimonialFormRatingLabel} htmlFor="testimonial-rating" required>
          <StarPicker value={rating} onChange={handleRatingChange} />
          {ratingError && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{t.testimonialErrors.rating_required}</p>}
        </FieldGroup>

        <FieldGroup label={t.testimonialFormBodyLabel} htmlFor="standalone-testimonial-body" required>
          <div className="mb-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
            <p className="mb-1.5 font-medium text-slate-700 dark:text-slate-200">{t.testimonialFormGuideHeading}</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <strong className="font-semibold text-slate-800 dark:text-slate-100">{t.testimonialFormGuideImpactLabel}:</strong>{" "}
                {t.testimonialFormGuideImpactQuestion}
              </li>
              <li>
                <strong className="font-semibold text-slate-800 dark:text-slate-100">
                  {t.testimonialFormGuideExperienceLabel}:
                </strong>{" "}
                {t.testimonialFormGuideExperienceQuestion}
              </li>
              <li>
                <strong className="font-semibold text-slate-800 dark:text-slate-100">{t.testimonialFormGuideVerdictLabel}:</strong>{" "}
                {t.testimonialFormGuideVerdictQuestion}
              </li>
            </ul>
            {aiAvailable && (
              <div className="mt-2 border-t border-slate-200 pt-2 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={handleSuggestIdeas}
                  disabled={suggesting}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-petrol hover:underline disabled:opacity-50 disabled:no-underline dark:text-petrol-light"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {suggesting ? t.testimonialFormIdeasLoading : t.testimonialFormIdeasCta}
                </button>
                {ideas && ideas.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {ideas.map((idea, index) => (
                      <li key={index}>{idea}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <Textarea
            id="standalone-testimonial-body"
            name="body"
            rows={7}
            required
            maxLength={MAX_BODY_LENGTH}
            placeholder={t.testimonialFormBodyPlaceholder}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="text-base"
          />
          {aiAvailable && (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleRewrite}
                disabled={rewriting || body.trim().length === 0}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-petrol hover:underline disabled:opacity-50 disabled:no-underline dark:text-petrol-light"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {rewriting ? t.testimonialFormRewriting : t.testimonialFormRewriteCta}
              </button>
              <p className="mt-0.5 text-xs text-slate-400">{t.testimonialFormRewriteDescription}</p>
            </div>
          )}
        </FieldGroup>

        <FieldGroup label={t.testimonialFormPhotosLabel} htmlFor="standalone-testimonial-photos">
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
            <label htmlFor="standalone-testimonial-photos" className={buttonClasses("ghost", "sm", "w-fit cursor-pointer")}>
              <Upload className="h-3.5 w-3.5" />
              {t.testimonialFormPhotosCta}
              <input
                id="standalone-testimonial-photos"
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

        {state?.status === "error" && <p className="text-sm text-rose-600 dark:text-rose-400">{t.testimonialErrors[state.code]}</p>}

        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full bg-led text-base text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
        >
          {pending ? t.testimonialFormSubmitting : t.testimonialFormSubmit}
        </Button>
      </form>
    </div>
  );
}
