"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import { VIDEO_CATEGORIES, VIDEO_PROVIDER_DISPLAY_NAMES, type VideoCategory, type VideoProvider } from "@/lib/labels";

export type GalleryVideo = {
  url: string;
  title: string;
  category: VideoCategory;
  categoryLabel: string;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  // Always set together with embedUrl (see toEmbeddableVideoUrl) — separate
  // fields only because GalleryVideo isn't a discriminated union. Drives the
  // brand name in the lightbox's "Watch on {provider}" link below.
  provider: VideoProvider | null;
};

// A thumbnail card — clicking one with an embed opens the lightbox below
// rather than swapping in an inline iframe, so playing a video never
// reflows the grid around it. A video with no embed (oEmbed had none, or
// timed out — see fetchVideoOEmbed) falls back to a plain "Watch video"
// link instead of a blank box.
function VideoCard({
  video,
  title,
  onOpen,
  showCategoryBadge,
}: {
  video: GalleryVideo;
  title: string;
  onOpen: () => void;
  showCategoryBadge: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-neutral-800">
        {video.embedUrl ? (
          <button
            type="button"
            onClick={onOpen}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={`Play ${title}`}
          >
            {video.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- a data: URL (see VideoEntry's own comment) that next/image's remote loader can't optimize anyway
              <img src={video.thumbnailUrl} alt={title} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-slate-200 dark:bg-neutral-700" />
            )}
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
            <Play className="relative h-12 w-12 fill-white text-white drop-shadow" />
          </button>
        ) : (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex h-full w-full items-center justify-center text-sm text-petrol hover:underline dark:text-petrol-light"
          >
            Watch video
          </a>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>
        {showCategoryBadge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
            {video.categoryLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// The lightbox itself — one live iframe at a time (autoplay), over the
// page, closed via Escape/backdrop-click/X. Not a gallery of its own (no
// Prev/Next between videos): each thumbnail opens straight to its own
// video, which is all a click on a specific card should do.
function VideoLightbox({
  video,
  title,
  watchOnProviderLabel,
  onClose,
}: {
  video: GalleryVideo;
  title: string;
  watchOnProviderLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!video.embedUrl) return null;
  // Falls back to the raw provider id on the (should-never-happen) chance
  // embedUrl exists without a matching provider — see GalleryVideo's own
  // comment on why the two aren't a discriminated union.
  const providerName = video.provider ? VIDEO_PROVIDER_DISPLAY_NAMES[video.provider] : video.url;
  const watchOnLabel = watchOnProviderLabel.replace("{provider}", providerName);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <div className="aspect-video">
          <iframe
            title={title}
            src={`${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
            className="h-full w-full rounded-xl border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {/* A cross-origin iframe can't be inspected, so there's no way to
            detect an embed that's silently failing to play — a video that's
            region-locked, age-restricted, or (YouTube specifically) stuck
            behind its "Sign in to confirm you're not a bot" gate on some
            visitors' networks even after switching to youtube-nocookie.com
            (see toEmbeddableVideoUrl). This is a real button, not a small
            text link easy to miss against the black overlay, and it's
            always there instead of only appearing on failure — a working
            way out whatever the actual cause turns out to be, for a
            visitor who has no way to tell "this one's broken" from "this
            one's just slow to load" while staring at a stalled embed. */}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          {watchOnLabel}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

// Renders thumbnails, not N live third-party players at once — a gallery of
// several embedded YouTube/Vimeo/etc. iframes all loading on page load is
// exactly the kind of thing that tanks a page's Core Web Vitals (and so its
// search ranking), on top of the extra weight for a visitor who never plays
// any of them.
//
// Grouped into a heading per category (Overview, Tour, Testimonial, …), in
// VIDEO_CATEGORIES' own declared order, only once a listing actually has 2+
// distinct categories among its videos — the common case of one or two
// videos all in the same (often default) category stays a single flat
// grid, where a lone "Overview" heading over everything would just be
// noise. The per-card category badge is then redundant with its own
// section heading, so it's dropped in the grouped case and kept in the
// flat one.
export function VideoGallery({
  videos,
  companyName,
  watchOnProviderLabel,
}: {
  videos: GalleryVideo[];
  companyName: string;
  watchOnProviderLabel: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // A video with no title of its own (partner left it blank) shows the
  // company name instead — resolved once here rather than in both VideoCard
  // and VideoLightbox.
  const indexed = videos.map((video, index) => ({ video, index, title: video.title || companyName }));
  const distinctCategories = new Set(videos.map((entry) => entry.category)).size;

  const gallery =
    distinctCategories <= 1 ? (
      <div className="grid gap-4 sm:grid-cols-2">
        {indexed.map(({ video, index, title }) => (
          <VideoCard key={index} video={video} title={title} onOpen={() => setOpenIndex(index)} showCategoryBadge />
        ))}
      </div>
    ) : (
      <div className="space-y-5">
        {VIDEO_CATEGORIES.map((category) => {
          const items = indexed.filter(({ video }) => video.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {items[0].video.categoryLabel}
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map(({ video, index, title }) => (
                  <VideoCard key={index} video={video} title={title} onOpen={() => setOpenIndex(index)} showCategoryBadge={false} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );

  return (
    <>
      {gallery}
      {openIndex !== null && (
        <VideoLightbox
          video={indexed[openIndex].video}
          title={indexed[openIndex].title}
          watchOnProviderLabel={watchOnProviderLabel}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
