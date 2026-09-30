"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TestimonialForm } from "@/components/directory/testimonial-form";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";

// A button that pops the write-a-testimonial form open in a sized dialog,
// right where the visitor already is — the listing page header (see
// ListingLayout) and the Testimonials page's own call-to-action both render
// this, rather than either page embedding TestimonialForm inline or linking
// off to a dedicated page/anchor for it. Same fixed-backdrop/centered-card
// dialog shape as LogoCropDialog (Escape + an explicit close button, no
// backdrop-click-to-close — a half-written testimonial is exactly the kind
// of state a stray click outside the box shouldn't silently discard).
export function WriteTestimonialButton({
  slug,
  locale,
  aiAvailable,
  googleReviewUrl,
  variant = "secondary",
  className,
}: {
  slug: string;
  locale: DirectoryLocale;
  aiAvailable: boolean;
  googleReviewUrl: string | null;
  variant?: ButtonVariant;
  // Extra utility classes on top of variant/size — same third-argument
  // convention as buttonClasses itself, not a replacement for its base
  // shape/spacing classes.
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = DIRECTORY_STRINGS[locale];

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClasses(variant, "md", className)}>
        {t.testimonialFormHeading}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.testimonialFormHeading}
        >
          {/* max-h-[90vh]/overflow-y-auto — the photo picker's previews can
              push this taller than a phone viewport, unlike the fixed-height
              crop tool LogoCropDialog sizes itself around. */}
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-2xl dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-neutral-800 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
            <TestimonialForm slug={slug} locale={locale} aiAvailable={aiAvailable} googleReviewUrl={googleReviewUrl} />
          </div>
        </div>
      )}
    </>
  );
}
