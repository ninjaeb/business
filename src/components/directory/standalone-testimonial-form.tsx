"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitStandaloneTestimonial } from "@/app/actions/testimonials";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { ListingLogo } from "@/components/directory/listing-logo";
import {
  DIRECTORY_STRINGS,
  formatStandaloneTestimonialHeading,
  formatTestimonialRequestContext,
  type DirectoryLocale,
} from "@/lib/directory-i18n";

const MAX_BODY_LENGTH = 2000;

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
// server-side on submit (see submitStandaloneTestimonial). Deliberately
// simpler than TestimonialForm — no photos, no AI rewrite, no Google
// cross-post step — since this is reached by someone who just clicked a
// link from a text/email/WhatsApp message, not already browsing the
// directory.
export function StandaloneTestimonialForm({
  token,
  locale,
  listing,
  serviceTitle,
  prefill,
}: {
  token: string;
  locale: DirectoryLocale;
  listing: { companyName: string; logoUrl: string | null };
  serviceTitle: string | null;
  prefill: { name: string; company: string; title: string };
}) {
  const [state, formAction, pending] = useActionState(submitStandaloneTestimonial, undefined);
  const t = DIRECTORY_STRINGS[locale];

  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const [renderedAt] = useState(() => Date.now());

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

  if (state?.status === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {t.testimonialFormSuccess}
        </p>
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
          <Textarea
            id="standalone-testimonial-body"
            name="body"
            rows={7}
            required
            maxLength={MAX_BODY_LENGTH}
            placeholder={t.testimonialFormBodyPlaceholder}
            className="text-base"
          />
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
