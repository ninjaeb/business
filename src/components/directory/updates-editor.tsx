"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { MarkdownLiteEditor } from "@/components/directory/markdown-lite-editor";
import { cn } from "@/lib/utils";
import type { ListingUpdateEntry, ListingUpdateKind } from "@/lib/directory";

const EMPTY_UPDATE: ListingUpdateEntry = { kind: "NEWS", title: "", body: "", postedAt: null, endDate: null };
const MAX_UPDATES = 20;
const KIND_OPTIONS: { value: ListingUpdateKind; label: string }[] = [
  { value: "NEWS", label: "News" },
  { value: "PROMOTION", label: "Promotion" },
];

const POST_DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatPostedAt(postedAt: string): string {
  return POST_DATE_FORMAT.format(new Date(`${postedAt}T00:00:00`));
}

// A repeatable list of News & Promotions posts — same controlled,
// serialize-to-hidden-JSON pattern as FaqEditor/ServicesEditor. Unlike
// those, an entry also carries a kind (News/Promotion), a post date, and an
// optional expiry date, shown only for a Promotion — a News post has no
// natural end. `listingId` is only for its body's own MarkdownLiteEditor —
// the same image-upload store the About field already uses (see
// DirectoryListingImage), not anything specific to updates.
export function UpdatesEditor({
  name,
  value,
  onChange,
  listingId,
}: {
  name: string;
  value: ListingUpdateEntry[];
  onChange: (updates: ListingUpdateEntry[]) => void;
  listingId: string;
}) {
  const updates = value.length > 0 ? value : [EMPTY_UPDATE];

  // postedAt is stamped here, once, the moment an entry is first actually
  // touched — never on the untouched phantom row a fresh/empty list falls
  // back to above, and never bumped again by a later edit, same as a blog
  // post's own original dateline. `?? todayIso()` only ever fires on that
  // first edit, since every subsequent patch already has a postedAt to keep.
  function updateEntry(index: number, patch: Partial<ListingUpdateEntry>) {
    const todayIso = () => new Date().toISOString().slice(0, 10);
    onChange(updates.map((entry, i) => (i === index ? { ...entry, ...patch, postedAt: entry.postedAt ?? todayIso() } : entry)));
  }

  function addEntry() {
    if (updates.length >= MAX_UPDATES) return;
    onChange([...updates, EMPTY_UPDATE]);
  }

  function removeEntry(index: number) {
    onChange(updates.length > 1 ? updates.filter((_, i) => i !== index) : [EMPTY_UPDATE]);
  }

  return (
    <div className="space-y-3">
      {updates.map((entry, index) => (
        <div key={index} className="rounded-md border border-slate-200 p-3 dark:border-neutral-800">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-md bg-slate-100 p-0.5 dark:bg-neutral-800">
                  {KIND_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateEntry(index, { kind: option.value })}
                      aria-pressed={entry.kind === option.value}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                        entry.kind === option.value
                          ? "bg-white text-petrol-ink shadow-sm dark:bg-neutral-700 dark:text-petrol-light"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {entry.kind === "PROMOTION" && (
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    Ends
                    <DatePicker
                      value={entry.endDate ?? ""}
                      onChange={(endDate) => updateEntry(index, { endDate: endDate || null })}
                      className="w-36"
                      buttonClassName="h-8 px-2 text-xs"
                    />
                  </label>
                )}
                {/* Read-only — postedAt is stamped automatically (see
                    updateEntry above), never something a partner sets by
                    hand, same as a blog post's dateline isn't backdatable. */}
                {entry.postedAt && <span className="text-xs text-slate-400">Posted {formatPostedAt(entry.postedAt)}</span>}
              </div>
              <Input
                value={entry.title}
                onChange={(event) => updateEntry(index, { title: event.target.value })}
                placeholder={entry.kind === "PROMOTION" ? "e.g. 20% off this weekend" : "e.g. Now open on Sundays"}
                maxLength={100}
              />
              <MarkdownLiteEditor
                id={`${name}-body-${index}`}
                name={`${name}-body-${index}`}
                value={entry.body}
                onChange={(body) => updateEntry(index, { body })}
                listingId={listingId}
                rows={3}
                placeholder="Details — select text and use the toolbar for bold, lists, links, and images."
              />
            </div>
            <button
              type="button"
              onClick={() => removeEntry(index)}
              aria-label="Remove post"
              title="Remove post"
              className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addEntry} disabled={updates.length >= MAX_UPDATES} className={buttonClasses("ghost", "sm")}>
        <Plus className="h-3.5 w-3.5" />
        Add post
      </button>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(updates.filter((entry) => entry.title.trim() && entry.body.trim()))}
      />
    </div>
  );
}
