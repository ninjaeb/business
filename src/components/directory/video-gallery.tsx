"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { VIDEO_CATEGORIES, type VideoCategory } from "@/lib/labels";

export type GalleryVideo = {
  url: string;
  title: string;
  category: VideoCategory;
  categoryLabel: string;
  thumbnailUrl: string | null;
  embedUrl: string | null;
};

// One playing video at a time, keyed by its position in the original
// (ungrouped) `videos` array — stable across grouping below, so Play always
// swaps the right card regardless of which category section it landed in.
function VideoCard({
  video,
  index,
  companyName,
  playingIndex,
  onPlay,
  showCategoryBadge,
}: {
  video: GalleryVideo;
  index: number;
  companyName: string;
  playingIndex: number | null;
  onPlay: (index: number) => void;
  showCategoryBadge: boolean;
}) {
  const title = video.title || companyName;
  return (
    <div className="space-y-1.5">
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
            onClick={() => onPlay(index)}
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
        {showCategoryBadge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
            {video.categoryLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// Renders thumbnails, not N live third-party players at once — a gallery of
// several embedded YouTube/Vimeo/etc. iframes all loading on page load is
// exactly the kind of thing that tanks a page's Core Web Vitals (and so its
// search ranking), on top of the extra weight for a visitor who never plays
// any of them. Clicking a thumbnail swaps just that one card for its real
// iframe, with autoplay — the common "lite embed" pattern. A video with no
// thumbnail (oEmbed didn't have one, or timed out — see fetchVideoOEmbed)
// falls back to a plain "Watch video" link instead of a blank box.
//
// Grouped into a heading per category (Overview, Tour, Testimonial, …), in
// VIDEO_CATEGORIES' own declared order, only once a listing actually has 2+
// distinct categories among its videos — the common case of one or two
// videos all in the same (often default) category stays a single flat
// grid, where a lone "Overview" heading over everything would just be
// noise. The per-card category badge is then redundant with its own
// section heading, so it's dropped in the grouped case and kept in the
// flat one.
export function VideoGallery({ videos, companyName }: { videos: GalleryVideo[]; companyName: string }) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const indexed = videos.map((video, index) => ({ video, index }));
  const distinctCategories = new Set(videos.map((entry) => entry.category)).size;

  if (distinctCategories <= 1) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {indexed.map(({ video, index }) => (
          <VideoCard
            key={index}
            video={video}
            index={index}
            companyName={companyName}
            playingIndex={playingIndex}
            onPlay={setPlayingIndex}
            showCategoryBadge
          />
        ))}
      </div>
    );
  }

  const groups = VIDEO_CATEGORIES.map((category) => ({
    category,
    items: indexed.filter(({ video }) => video.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.category}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {group.items[0].video.categoryLabel}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.items.map(({ video, index }) => (
              <VideoCard
                key={index}
                video={video}
                index={index}
                companyName={companyName}
                playingIndex={playingIndex}
                onPlay={setPlayingIndex}
                showCategoryBadge={false}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
