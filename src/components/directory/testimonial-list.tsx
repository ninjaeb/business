import { Star } from "lucide-react";
import type { DirectoryListingImage, DirectoryTestimonial } from "@/generated/prisma/client";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PhotoLightbox } from "@/components/directory/photo-lightbox";

// Same locale-aware dateline pattern as UpdateItem/NewsFeedContent's own
// formatUpdatePostedAt — a testimonial's createdAt is a real timestamp
// rather than a partner-entered date-only string, so it's formatted
// straight from the Date instead of being re-parsed through a "T00:00:00"
// suffix first.
function formatTestimonialDate(createdAt: Date, locale: DirectoryLocale): string {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(createdAt);
}

function TestimonialStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={star <= rating ? "h-3.5 w-3.5 fill-amber-400 text-amber-400" : "h-3.5 w-3.5 text-slate-300 dark:text-neutral-700"}
        />
      ))}
    </div>
  );
}

// Read-only display of a listing's own APPROVED testimonials (see
// src/app/[locale]/[slug]/testimonials/page.tsx) — this only ever renders
// rows an admin has already moderated, same trust boundary as every other
// visitor-authored content this app shows publicly.
type TestimonialWithPhotos = DirectoryTestimonial & { images: DirectoryListingImage[] };

export function TestimonialList({ testimonials, locale }: { testimonials: TestimonialWithPhotos[]; locale: DirectoryLocale }) {
  return (
    <ul className="space-y-3">
      {testimonials.map((testimonial) => (
        <li key={testimonial.id} className="rounded-2xl border border-slate-200 px-5 py-4 shadow-sm dark:border-neutral-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{testimonial.authorName}</span>
            <div className="flex items-center gap-2">
              {testimonial.rating && <TestimonialStars rating={testimonial.rating} />}
              <time dateTime={testimonial.createdAt.toISOString()} className="text-xs text-slate-400">
                {formatTestimonialDate(testimonial.createdAt, locale)}
              </time>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{testimonial.body}</p>
          {testimonial.images.length > 0 && (
            <div className="mt-3 max-w-xs">
              <PhotoLightbox
                photos={testimonial.images.map((image) => ({
                  id: image.id,
                  src: `/api/directory-images/${image.id}`,
                  caption: "",
                  alt: `Photo from ${testimonial.authorName}'s testimonial`,
                  gallery: "",
                }))}
                companyName={testimonial.authorName}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
