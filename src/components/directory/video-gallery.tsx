"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export type GalleryVideo = {
  url: string;
  title: string;
  categoryLabel: string;
  thumbnailUrl: string | null;
  embedUrl: string | null;
};

// Renders thumbnails, not N live third-party players at once — a gallery of
// several embedded YouTube/Vimeo/etc. iframes all loading on page load is
// exactly the kind of thing that tanks a page's Core Web Vitals (and so its
// search ranking), on top of the extra weight for a visitor who never plays
// any of them. Clicking a thumbnail swaps just that one card for its real
// iframe, with autoplay — the common "lite embed" pattern. A video with no
// thumbnail (oEmbed didn't have one, or timed out — see fetchVideoOEmbed)
// falls back to a plain "Watch video" link instead of a blank box.
export function VideoGallery({ videos, companyName }: { videos: GalleryVideo[]; companyName: string }) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {videos.map((video, index) => {
        const title = video.title || companyName;
        return (
          <div key={index} className="space-y-1.5">
            <div className="relative aspect-video overflow-hidden rounded-md bg-slate-100 dark:bg-neutral-800">
              {playingIndex === index && video.embedUrl ? (
                <iframe
                  title={title}
                  src={`${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : video.embedUrl ? (
                <button
                  type="button"
                  onClick={() => setPlayingIndex(index)}
                  className="group absolute inset-0 flex items-center justify-center"
                  aria-label={`Play ${title}`}
                >
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- an external third-party thumbnail (YouTube/Vimeo/etc.), not one this app serves itself
                    <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
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
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
                {video.categoryLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
