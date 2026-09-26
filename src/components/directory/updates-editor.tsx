"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListingUpdateEntry, ListingUpdateKind } from "@/lib/directory";

const EMPTY_UPDATE: ListingUpdateEntry = { kind: "NEWS", title: "", body: "", endDate: null };
const MAX_UPDATES = 20;
const KIND_OPTIONS: { value: ListingUpdateKind; label: string }[] = [
  { value: "NEWS", label: "News" },
  { value: "PROMOTION", label: "Promotion" },
];

// A repeatable list of News & Promotions posts — same controlled,
// serialize-to-hidden-JSON pattern as FaqEditor/ServicesEditor. Unlike
// those, an entry also carries a kind (News/Promotion) and an optional
// expiry date, shown only for a Promotion — a News post has no natural end.
export function UpdatesEditor({
  name,
  value,
  onChange,
}: {
  name: string;
  value: ListingUpdateEntry[];
  onChange: (updates: ListingUpdateEntry[]) => void;
}) {
  const updates = value.length > 0 ? value : [EMPTY_UPDATE];

  function updateEntry(index: number, patch: Partial<ListingUpdateEntry>) {
    onChange(updates.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
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
                    <Input
                      type="date"
                      value={entry.endDate ?? ""}
                      onChange={(event) => updateEntry(index, { endDate: event.target.value || null })}
                      className="h-8 w-auto text-xs"
                    />
                  </label>
                )}
              </div>
              <Input
                value={entry.title}
                onChange={(event) => updateEntry(index, { title: event.target.value })}
                placeholder={entry.kind === "PROMOTION" ? "e.g. 20% off this weekend" : "e.g. Now open on Sundays"}
                maxLength={100}
              />
              <Textarea
                value={entry.body}
                onChange={(event) => updateEntry(index, { body: event.target.value })}
                rows={2}
                placeholder="Details"
                maxLength={1000}
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
