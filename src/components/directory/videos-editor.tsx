"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { fetchVideoDetails } from "@/app/actions/directory";
import { Input, Select } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { VIDEO_CATEGORY_LABELS, type VideoCategory } from "@/lib/labels";
import type { VideoEntry } from "@/lib/directory";

const EMPTY_VIDEO: VideoEntry = { url: "", title: "", category: "OVERVIEW", thumbnailUrl: null };
// Mirrors MAX_VIDEOS in src/lib/directory.ts — duplicated rather than
// imported, since that module's top-level `db` import can't be bundled for
// the browser (same reason FaqEditor keeps its own copy of MAX_FAQS).
const MAX_VIDEOS = 12;
const CATEGORY_OPTIONS = Object.entries(VIDEO_CATEGORY_LABELS) as [VideoCategory, string][];

// A repeatable list of video entries — same controlled, serialize-to-
// hidden-JSON pattern as FaqEditor/ServicesEditor, plus one extra step:
// leaving the URL field auto-looks up a thumbnail/title (fetchVideoDetails
// — best-effort, silently does nothing for a host it can't reach) so the
// gallery has something to show without the partner hunting one down
// themselves. Only fills the title if the partner hasn't typed one; never
// overwrites it. A "Fetch thumbnail" button takes over once a URL has one
// but no thumbnail yet, so a failed best-effort lookup (a timeout, a
// provider rate-limiting us) isn't a dead end — see runFetch.
export function VideosEditor({
  name,
  value,
  onChange,
}: {
  name: string;
  value: VideoEntry[];
  onChange: (videos: VideoEntry[]) => void;
}) {
  const videos = value.length > 0 ? value : [EMPTY_VIDEO];
  // handleUrlBlur's fetch resolves after a real network round trip — by
  // then the partner may have edited another field, so the merge below
  // reads the LATEST videos through this ref rather than the `videos` this
  // closure captured at blur time, which would otherwise clobber that edit.
  const videosRef = useRef(videos);
  useEffect(() => {
    videosRef.current = videos;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `videos` falls back to a fresh `[EMPTY_VIDEO]` array literal when `value` is empty, which would otherwise make this run every render for no reason; `value` itself is the stable thing that actually changes.
  }, [value]);
  const [fetchingIndex, setFetchingIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  function updateEntry(index: number, patch: Partial<VideoEntry>) {
    onChange(videos.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addEntry() {
    if (videos.length >= MAX_VIDEOS) return;
    onChange([...videos, EMPTY_VIDEO]);
  }

  function removeEntry(index: number) {
    onChange(videos.length > 1 ? videos.filter((_, i) => i !== index) : [EMPTY_VIDEO]);
  }

  function runFetch(index: number, url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFetchingIndex(index);
    startTransition(async () => {
      const details = await fetchVideoDetails(trimmed);
      setFetchingIndex((current) => (current === index ? null : current));
      if (!details.title && !details.thumbnailUrl) return;
      onChange(
        videosRef.current.map((entry, i) =>
          i === index
            ? { ...entry, title: entry.title || details.title || "", thumbnailUrl: details.thumbnailUrl }
            : entry,
        ),
      );
    });
  }

  function handleUrlBlur(index: number, url: string) {
    // Only once per URL automatically — re-running on every blur would
    // re-fetch (and could re-overwrite a title the partner has since
    // edited) for no gain. A fetch that comes back empty (oEmbed timed
    // out, the provider rate-limited us, …) leaves thumbnailUrl null with
    // no further automatic retries — the "Fetch thumbnail" button below
    // gives the partner a way to try again instead of being stuck with a
    // blank thumbnail forever.
    if (videos[index]?.thumbnailUrl) return;
    runFetch(index, url);
  }

  return (
    <div className="space-y-3">
      {videos.map((video, index) => (
        <div key={index} className="rounded-md border border-slate-200 p-3 dark:border-neutral-800">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={video.url}
                  onChange={(event) => updateEntry(index, { url: event.target.value, thumbnailUrl: null })}
                  onBlur={(event) => handleUrlBlur(index, event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=… (YouTube, Vimeo, Dailymotion, Facebook, or TikTok)"
                />
                {fetchingIndex === index && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={video.title}
                  onChange={(event) => updateEntry(index, { title: event.target.value })}
                  placeholder="Title"
                  maxLength={100}
                  className="flex-1"
                />
                <Select
                  value={video.category}
                  onChange={(event) => updateEntry(index, { category: event.target.value as VideoCategory })}
                  className="w-auto"
                >
                  {CATEGORY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- a data: URL (see VideoEntry's own comment) that next/image's remote loader can't optimize anyway
                <img src={video.thumbnailUrl} alt="" className="h-16 w-28 rounded object-cover" />
              ) : (
                video.url.trim() &&
                fetchingIndex !== index && (
                  <button
                    type="button"
                    onClick={() => runFetch(index, video.url)}
                    className={buttonClasses("ghost", "sm")}
                  >
                    Fetch thumbnail
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              onClick={() => removeEntry(index)}
              aria-label="Remove video"
              title="Remove video"
              className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addEntry} disabled={videos.length >= MAX_VIDEOS} className={buttonClasses("ghost", "sm")}>
        <Plus className="h-3.5 w-3.5" />
        Add video
      </button>
      <input type="hidden" name={name} value={JSON.stringify(videos.filter((video) => video.url.trim()))} />
    </div>
  );
}
