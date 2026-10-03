"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TestimonialForm } from "@/components/directory/testimonial-form";
import { TestimonialAuthForm } from "@/components/directory/testimonial-auth-form";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";

type ExistingTestimonial = { status: "PENDING" | "APPROVED" | "REJECTED"; reviewNote: string | null };

// A button that pops the write-a-testimonial flow open in a sized dialog,
// right where the visitor already is — the listing page header (see
// ListingLayout) and the Testimonials page's own call-to-action both render
// this, rather than either page embedding the form inline or linking off to
// a dedicated page/anchor for it. Same fixed-backdrop/centered-card dialog
// shape as LogoCropDialog (Escape + an explicit close button, no
// backdrop-click-to-close — a half-written testimonial, or a half-filled
// sign-up form, is exactly the kind of state a stray click outside the box
// shouldn't silently discard).
//
// Portaled straight to document.body rather than rendered in place: this
// button lives inside the listing header's `isolate` wrapper (ListingLayout),
// which creates its own stacking context — a plain `fixed inset-0 z-50`
// backdrop rendered as a descendant of that wrapper only out-ranks siblings
// *within* it, not the page's later, independently-stacked "Get in touch"
// sidebar card (sticky, so very visibly on top once in view). Rendering
// outside the whole tree sidesteps that instead of touching `isolate`, which
// the header's own gradient/badge layering depends on.
//
// Three states inside the dialog, decided by visitor/existingTestimonial
// (both computed server-side by the caller — see getVerifiedVisitorOrNull/
// getVisitorTestimonialForListing) plus local auth state picked up mid-flow:
// no visitor session -> TestimonialAuthForm; signed in but already reviewed
// this listing -> a status message; otherwise -> TestimonialForm itself.
//
// Not the only way to leave a testimonial — a partner's own request link
// (see /business-portal/testimonial-links) skips this entirely and opens a
// standalone, unauthenticated form at /[locale]/review/[token] instead (see
// StandaloneTestimonialForm), since that flow is explicitly meant to need
// no account at all.
export function WriteTestimonialButton({
  slug,
  locale,
  aiAvailable,
  googleReviewUrl,
  googleClientId,
  visitor,
  existingTestimonial,
  variant = "secondary",
  className,
}: {
  slug: string;
  locale: DirectoryLocale;
  aiAvailable: boolean;
  googleReviewUrl: string | null;
  // Null when Google sign-in isn't configured — forwarded straight to
  // TestimonialAuthForm, which hides its "Continue with Google" button in
  // that case (see getPublicGoogleClientId).
  googleClientId: string | null;
  // Null when no visitor is signed in on this browser — the dialog opens
  // straight to TestimonialAuthForm in that case.
  visitor: { name: string } | null;
  // Null when the signed-in visitor (if any) has no testimonial on this
  // listing yet. Only meaningful alongside a non-null visitor.
  existingTestimonial: ExistingTestimonial | null;
  variant?: ButtonVariant;
  // Extra utility classes on top of variant/size — same third-argument
  // convention as buttonClasses itself, not a replacement for its base
  // shape/spacing classes.
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Local override of the visitor prop once sign-up/log-in succeeds inside
  // the dialog, so the form appears immediately without a full page
  // reload/refetch. Log-out (see TestimonialForm's own button) sets this
  // back to null the same way. Starts from the server-computed prop, not
  // null, so a page load that's already signed in skips the auth step.
  const [localVisitor, setLocalVisitor] = useState(visitor);
  const t = DIRECTORY_STRINGS[locale];

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Only trustworthy right after sign-up (a brand-new visitor can't already
  // have a testimonial here) — a returning visitor who logs back in still
  // goes through the server-computed existingTestimonial prop, unaffected
  // by this local override.
  const alreadySubmittedMessage = (() => {
    if (!existingTestimonial) return null;
    if (existingTestimonial.status === "PENDING") return t.testimonialAlreadySubmittedPending;
    if (existingTestimonial.status === "APPROVED") return t.testimonialAlreadySubmittedApproved;
    return t.testimonialAlreadySubmittedRejected;
  })();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClasses(variant, "md", className)}>
        {t.testimonialFormHeading}
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t.testimonialFormHeading}
          >
            {/* max-h-[95vh]/overflow-y-auto — the photo picker's previews
                (and the taller testimonial textarea below) can push this
                past a phone viewport's height, unlike the fixed-height crop
                tool LogoCropDialog sizes itself around. */}
            <div className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-neutral-800 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
              {!localVisitor ? (
                <TestimonialAuthForm
                  locale={locale}
                  googleClientId={googleClientId}
                  onAuthenticated={(name) => setLocalVisitor({ name })}
                />
              ) : alreadySubmittedMessage ? (
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {t.testimonialAlreadySubmittedTitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{alreadySubmittedMessage}</p>
                  {existingTestimonial?.status === "REJECTED" && existingTestimonial.reviewNote && (
                    <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
                      {existingTestimonial.reviewNote}
                    </p>
                  )}
                </div>
              ) : (
                <TestimonialForm
                  slug={slug}
                  locale={locale}
                  aiAvailable={aiAvailable}
                  googleReviewUrl={googleReviewUrl}
                  visitorName={localVisitor.name}
                  onLogout={() => setLocalVisitor(null)}
                />
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
