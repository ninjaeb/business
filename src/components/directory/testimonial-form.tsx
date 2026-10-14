"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { FillTimeField } from "@/components/ui/fill-time-field";
import { FormErrorList } from "@/components/ui/form-error-list";
import { Lightbulb, Loader2, Sparkles, Star, Upload, X } from "lucide-react";
import {
  rewriteTestimonialWithAi,
  submitDirectoryTestimonial,
  suggestTestimonialIdeasWithAi,
  uploadTestimonialPhoto,
} from "@/app/actions/testimonials";
import { logoutVisitor } from "@/app/actions/visitor-auth";
import { compressImage } from "@/lib/image-compression";
import { Button, buttonClasses } from "@/components/ui/button";
import { FieldGroup, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DIRECTORY_STRINGS, formatTestimonialPhotosUploading, type DirectoryLocale } from "@/lib/directory-i18n";

const MAX_BODY_LENGTH = 2000;
// Mirrors MAX_TESTIMONIAL_PHOTOS in src/app/actions/testimonials.ts —
// duplicated rather than imported, same reasoning as ListingPhotosEditor's
// own copy of MAX_GALLERY_PHOTOS (that module's server-only imports can't be
// bundled for the browser).
const MAX_TESTIMONIAL_PHOTOS = 4;

// What the visitor left out, checked when they press Submit (see handleSubmit)
// and shown in the error box right above that button — not as a browser
// pop-up beside a field that may be off-screen by then.
type MissingField = "name_required" | "rating_required" | "body_required";

// Which field each missing-field message links back to (see FormErrorList).
const MISSING_FIELD_TARGET: Record<MissingField, string> = {
  name_required: "standalone-testimonial-name",
  rating_required: "testimonial-rating",
  body_required: "testimonial-body",
};

// Same shape as the 1-5 rating this writes (DirectoryTestimonial.rating) —
// a plain button row rather than a native <input type="radio"> group, since
// nothing here needs to work without JS (this is already a client
// component) and a row of stars reads at a glance in a way five radio
// buttons wouldn't.
function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div id="testimonial-rating" className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
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
// that it was received. Only rendered once WriteTestimonialButton already
// has a signed-in visitor (see TestimonialAuthForm) — visitorName is shown
// as a "Posting as" line rather than re-collected here.
export function TestimonialForm({
  slug,
  locale,
  aiAvailable,
  googleReviewUrl,
  serviceTitles,
  visitorName,
  onLogout,
}: {
  slug: string;
  locale: DirectoryLocale;
  aiAvailable: boolean;
  // Null when the listing has no "write a review" link set (see
  // PartnerListing.googleReviewUrl's own comment) — the "Leave it on Google
  // too" step is simply skipped in that case, not shown disabled.
  googleReviewUrl: string | null;
  // Titles of the business's published products/services — offered as chips
  // so the visitor can say which one they used (see handleSuggestIdeas).
  serviceTitles: string[];
  visitorName: string;
  // Flips WriteTestimonialButton back to the sign-in step — this form
  // doesn't clear the session itself (see the "Not you? Log out" button
  // below), just the local state that decides which of the two to show.
  onLogout: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitDirectoryTestimonial, undefined);
  const t = DIRECTORY_STRINGS[locale];
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [missing, setMissing] = useState<MissingField[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [rewriting, startRewrite] = useTransition();
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [suggesting, startSuggest] = useTransition();

  function clearMissing(field: MissingField) {
    setMissing((prev) => prev.filter((code) => code !== field));
  }

  function handleRatingChange(value: number) {
    setRating(value);
    if (value > 0) clearMissing("rating_required");
  }

  // Validated here, with the form's own noValidate on, rather than left to
  // each field's `required` — a browser's pop-up bubble appears beside
  // whichever field is first, usually not where the visitor is looking after
  // pressing Submit. Rating has no native <input required> to hook into
  // anyway (it's a button row, see StarPicker). The server's own schema still
  // enforces all of this for a submission that skips this handler entirely.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const next: MissingField[] = [];
    if (rating === 0) next.push("rating_required");
    if (body.trim() === "") next.push("body_required");
    setMissing(next);
    if (next.length > 0) {
      event.preventDefault();
      return;
    }
    setAiError(null);
  }

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
    setAiError(null);
    startRewrite(async () => {
      const result = await rewriteTestimonialWithAi(body);
      if (result.status === "ok") {
        setBody(result.data.text);
      } else {
        setAiError(result.message);
      }
    });
  }

  function handleSuggestIdeas() {
    setAiError(null);
    startSuggest(async () => {
      // One service: that's necessarily what they used. Several: only what
      // they ticked — none ticked means "don't know", so the whole catalogue.
      const services = serviceTitles.length === 1 ? serviceTitles : selectedServices;
      const result = await suggestTestimonialIdeasWithAi(slug, locale, { services });
      if (result.status === "ok") {
        setIdeas(result.data.ideas);
      } else {
        setAiError(result.message);
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
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
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
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t.testimonialGoogleHint}</p>
            <Button type="button" variant="secondary" onClick={handlePostToGoogle}>
              {t.testimonialGoogleCta}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="rating" value={rating || ""} />
      {/* Honeypot: hidden from real visitors, often filled in by bots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="testimonial-website">Leave this field blank</label>
        <input id="testimonial-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <FillTimeField />

      {/* pr-7 keeps "Not you? Log out" clear of the dialog's own close
          button (absolute right-3 top-3 in WriteTestimonialButton) — without
          it the two sit close enough to invite a misclick. */}
      <div className="flex items-center justify-between gap-2 pr-7">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.testimonialFormHeading}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.testimonialLoggedInAs} <span className="font-medium text-slate-700 dark:text-slate-300">{visitorName}</span> ·{" "}
          <button
            type="button"
            onClick={() => {
              void logoutVisitor().then(onLogout);
            }}
            className="text-petrol hover:underline dark:text-petrol-light"
          >
            {t.testimonialLogout}
          </button>
        </p>
      </div>

      <FieldGroup label={t.testimonialFormRatingLabel} htmlFor="testimonial-rating" required>
        <StarPicker value={rating} onChange={handleRatingChange} />
      </FieldGroup>

      <FieldGroup label={t.testimonialFormBodyLabel} htmlFor="testimonial-body" required>
        {/* A short writing guide, not just a one-line hint — the four-part
            before → during → after → recommendation story (see
            testimonialFormGuide*'s own comment in directory-i18n.ts), one
            bold label + question each, for a visitor staring at a blank box,
            rather than a vague "write something nice." */}
        <div className="mb-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
          <p className="mb-1.5 font-medium text-slate-700 dark:text-slate-200">{t.testimonialFormGuideHeading}</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-100">{t.testimonialFormGuideProblemLabel}:</strong>{" "}
              {t.testimonialFormGuideProblemQuestion}
            </li>
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-100">
                {t.testimonialFormGuideExperienceLabel}:
              </strong>{" "}
              {t.testimonialFormGuideExperienceQuestion}
            </li>
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-100">{t.testimonialFormGuideImpactLabel}:</strong>{" "}
              {t.testimonialFormGuideImpactQuestion}
            </li>
            <li>
              <strong className="font-semibold text-slate-800 dark:text-slate-100">{t.testimonialFormGuideVerdictLabel}:</strong>{" "}
              {t.testimonialFormGuideVerdictQuestion}
            </li>
          </ol>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">{t.testimonialFormGuideTip}</p>
          {aiAvailable && (
            <div className="mt-2 border-t border-slate-200 pt-2 dark:border-neutral-700">
              {serviceTitles.length > 1 && (
                <div className="mb-2">
                  <p className="mb-1 text-slate-500 dark:text-slate-400">{t.testimonialFormServicesLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {serviceTitles.map((title) => {
                      const on = selectedServices.includes(title);
                      return (
                        <button
                          key={title}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setSelectedServices((prev) => (on ? prev.filter((item) => item !== title) : [...prev, title]));
                            // Whatever was suggested was for the previous picks.
                            setIdeas(null);
                          }}
                          className={
                            on
                              ? "rounded-full border border-petrol bg-led-soft px-2.5 py-1 text-xs font-medium text-petrol-ink dark:border-petrol-light dark:bg-led-soft-dark dark:text-petrol-light"
                              : "rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-petrol/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-300"
                          }
                        >
                          {title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                <div className="mt-2 space-y-1.5">
                  <p className="text-slate-500 dark:text-slate-400">{t.testimonialFormIdeasHint}</p>
                  {/* Each suggestion is a whole ready-to-use draft, so a tap
                      replaces the body with it (rather than appending) —
                      the visitor then edits it in the textarea below. */}
                  {ideas.map((idea, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setBody(idea)}
                      className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:border-petrol/40 hover:bg-led-soft dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:hover:border-petrol-light/30 dark:hover:bg-led-soft-dark"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Textarea
          id="testimonial-body"
          name="body"
          rows={7}
          required
          maxLength={MAX_BODY_LENGTH}
          placeholder={t.testimonialFormBodyPlaceholder}
          value={body}
          onChange={(event) => {
              setBody(event.target.value);
              if (event.target.value.trim()) clearMissing("body_required");
            }}
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

      <FormErrorList
        items={[
          ...missing.map((code) => ({ message: t.testimonialErrors[code], targetId: MISSING_FIELD_TARGET[code] })),
          ...(aiError ? [{ message: aiError }] : []),
          ...(state?.status === "error" ? [{ message: t.testimonialErrors[state.code] ?? t.testimonialErrors.generic }] : []),
        ]}
      />

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-led text-base text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
      >
        {pending ? t.testimonialFormSubmitting : t.testimonialFormSubmit}
      </Button>
      {googleReviewUrl && <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t.testimonialGoogleFormHint}</p>}
    </form>
  );
}
