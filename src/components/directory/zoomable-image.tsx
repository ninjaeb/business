"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

// A single, standalone image (the listing's own logo, or one embedded in a
// markdown-lite field) made clickable to view full-size — the same
// "click to zoom" affordance PhotoLightbox already gives the gallery grid,
// generalized to any one-off image rather than a curated list with its own
// Prev/Next. No navigation here on purpose: unlike a photo gallery, these
// images aren't a set to browse — each is its own unrelated click target,
// so Escape/backdrop-click/X close it and that's the whole interaction.
export function ZoomableImage({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
}) {
  const [open, setOpen] = useState(false);

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block cursor-zoom-in rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led"
        aria-label={`View ${alt} full size`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- same reasoning as ListingLogo/PhotoLightbox: an already-sized/served DB or partner-supplied image, not a domain next/image would optimize */}
        <img src={src} alt={alt} width={width} height={height} loading={loading} decoding="async" className={className} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
          <img
            src={src}
            alt={alt}
            className="max-h-[80vh] max-w-full rounded-md object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
