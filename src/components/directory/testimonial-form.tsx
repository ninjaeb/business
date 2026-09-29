"use client";

import { useActionState, useState, useTransition } from "react";
import { Sparkles, Star } from "lucide-react";
import { rewriteTestimonialWithAi, submitDirectoryTestimonial } from "@/app/actions/testimonials";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";

const MAX_BODY_LENGTH = 2000;

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
        {googleReviewUrl && (
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
