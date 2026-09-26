"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxPhoto = { id: string; src: string; caption: string; alt: string };

// The gallery grid on a listing's own page (src/app/[locale]/[slug]/page.tsx)
// — a click used to do nothing, so a visitor had no way to see a photo
// larger than its small grid thumbnail. Clicking one now opens it full-size
// over the page, with Prev/Next (arrow keys included) when there's more
// than one, and Escape/backdrop-click/X to close.
export function PhotoLightbox({ photos, companyName }: { photos: LightboxPhoto[]; companyName: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenIndex(null);
      else if (event.key === "ArrowLeft") setOpenIndex((current) => (current === null ? current : (current - 1 + photos.length) % photos.length));
      else if (event.key === "ArrowRight") setOpenIndex((current) => (current === null ? current : (current + 1) % photos.length));
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- photos.length is stable for the lifetime of one page render
  }, [isOpen]);

  const current = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <figure key={photo.id} className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="block w-full overflow-hidden rounded-md ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led dark:ring-neutral-800"
              aria-label={`View ${photo.alt} full size`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images, same reasoning as ListingLogo */}
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform hover:scale-105"
              />
            </button>
            {/* Same text as the alt above, but visible — search engines and
                AI crawlers both weigh on-page text more heavily than an
                attribute, and a sighted visitor gets the context an alt
                never shows them. */}
            {photo.caption && <figcaption className="text-sm text-slate-600 dark:text-slate-300">{photo.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${companyName} photo`}
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((openIndex! - 1 + photos.length) % photos.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:left-4"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenIndex((openIndex! + 1) % photos.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:right-4"
                aria-label="Next photo"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <figure className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images, same reasoning as ListingLogo */}
            <img src={current.src} alt={current.alt} className="max-h-[80vh] max-w-full rounded-md object-contain" />
            {current.caption && <figcaption className="max-w-lg text-center text-sm text-white/90">{current.caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
