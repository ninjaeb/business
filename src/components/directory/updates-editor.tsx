"use client";

import { useState, useTransition } from "react";
import { Megaphone, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { rewriteListingUpdate } from "@/app/actions/directory";
import { uploadDirectoryListingImage } from "@/app/actions/directory-images";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DatePicker } from "@/components/ui/date-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkdownLiteEditor } from "@/components/directory/markdown-lite-editor";
import { cn } from "@/lib/utils";
import type { ListingUpdateEntry, ListingUpdateKind } from "@/lib/directory";

const EMPTY_DRAFT: ListingUpdateEntry = { kind: "NEWS", title: "", body: "", postedAt: null, endDate: null };
const MAX_UPDATES = 20;
const KIND_OPTIONS: { value: ListingUpdateKind; label: string }[] = [
  { value: "NEWS", label: "News" },
  { value: "PROMOTION", label: "Promotion" },
];
const KIND_BADGE_CLASSES: Record<ListingUpdateKind, string> = {
  NEWS: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-400 dark:ring-sky-500/30",
  PROMOTION: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/30",
};

const POST_DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatIsoDate(isoDate: string): string {
  return POST_DATE_FORMAT.format(new Date(`${isoDate}T00:00:00`));
}

// The add/edit form pinned above the table below — same fields either way,
// just a different commit action/label (see UpdatesEditor's own commit).
// Editing an existing post loads it in here rather than making a table
// cell (a whole rich-text body, a kind toggle...) directly editable in
// place, which would be cramped and, for the body, awkward given
// MarkdownLiteEditor's own toolbar/image upload needs real width.
function UpdateEntryForm({
  draft,
  onDraftChange,
  onSubmit,
  onCancel,
  atLimit,
  listingId,
  aiAvailable,
}: {
  draft: ListingUpdateEntry;
  onDraftChange: (patch: Partial<ListingUpdateEntry>) => void;
  onSubmit: () => void;
  // Present only while editing an existing post (see UpdatesEditor) — its
  // presence, not a separate boolean, is what switches this form between
  // "Add post" and "Save changes".
  onCancel?: () => void;
  atLimit: boolean;
  listingId: string;
  aiAvailable: boolean;
}) {
  const [rewriting, startRewrite] = useTransition();
  const toast = useToast();
  const isEditing = onCancel !== undefined;
  const canSubmit = draft.title.trim() !== "" && draft.body.trim() !== "";

  function uploadImage(file: File) {
    const formData = new FormData();
    formData.set("image", file);
    return uploadDirectoryListingImage(listingId, formData);
  }

  function handleRewrite() {
    startRewrite(async () => {
      const result = await rewriteListingUpdate({ title: draft.title, body: draft.body }, draft.kind);
      if (result.status === "ok") {
        onDraftChange({ title: result.data.title, body: result.data.body });
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-neutral-800">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 dark:bg-neutral-800">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onDraftChange({ kind: option.value })}
                aria-pressed={draft.kind === option.value}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  draft.kind === option.value
                    ? "bg-white text-petrol-ink shadow-sm dark:bg-neutral-700 dark:text-petrol-light"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {draft.kind === "PROMOTION" && (
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              Ends
              <DatePicker
                value={draft.endDate ?? ""}
                onChange={(endDate) => onDraftChange({ endDate: endDate || null })}
                className="w-36"
                buttonClassName="h-8 px-2 text-xs"
              />
            </label>
          )}
          {aiAvailable && (
            <button
              type="button"
              onClick={handleRewrite}
              disabled={rewriting}
              className={buttonClasses("ghost", "sm", "ml-auto shrink-0")}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {rewriting ? "Rewriting…" : "Rewrite with AI"}
            </button>
          )}
        </div>
        <Input
          value={draft.title}
          onChange={(event) => onDraftChange({ title: event.target.value })}
          placeholder={draft.kind === "PROMOTION" ? "e.g. 20% off this weekend" : "e.g. Now open on Sundays"}
          maxLength={100}
        />
        <MarkdownLiteEditor
          id="updates-draft-body"
          name="updates-draft-body"
          value={draft.body}
          onChange={(body) => onDraftChange({ body })}
          onUploadImage={uploadImage}
          rows={3}
          placeholder="Details — select text and use the toolbar for bold, lists, links, and images."
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || (!isEditing && atLimit)}
            className={buttonClasses("secondary", "sm")}
          >
            {isEditing ? (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Save changes
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add post
              </>
            )}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel} className={buttonClasses("ghost", "sm")}>
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
        </div>
        {!isEditing && atLimit && (
          <p className="text-xs text-slate-400">You&apos;ve reached the {MAX_UPDATES}-post limit — remove one to add another.</p>
        )}
      </div>
    </div>
  );
}

// News & Promotions posts — an add/edit form (see UpdateEntryForm above)
// pinned above a compact table of the listing's existing posts, same
// controlled, serialize-to-hidden-JSON pattern as FaqEditor/ServicesEditor
// for the field itself. Unlike those, a post also carries a kind
// (News/Promotion), a post date, and an optional expiry date shown only
// for a Promotion — a News post has no natural end. `listingId` is only
// for the form's own MarkdownLiteEditor — the same image-upload store the
// About field already uses (see DirectoryListingImage), not anything
// specific to updates.
export function UpdatesEditor({
  name,
  value,
  onChange,
  listingId,
  aiAvailable,
}: {
  name: string;
  value: ListingUpdateEntry[];
  onChange: (updates: ListingUpdateEntry[]) => void;
  listingId: string;
  aiAvailable: boolean;
}) {
  // null: the form above is building a fresh post. A number: it's editing
  // the existing post at that index instead — see startEdit/commit below.
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ListingUpdateEntry>(EMPTY_DRAFT);

  function patchDraft(patch: Partial<ListingUpdateEntry>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraft(value[index]);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraft(EMPTY_DRAFT);
  }

  function commit() {
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) return;
    if (editingIndex === null) {
      // postedAt is stamped here, once, the moment a post is actually
      // added — never something a partner sets by hand, same as a blog
      // post's own original dateline.
      const postedAt = new Date().toISOString().slice(0, 10);
      onChange([...value, { ...draft, title, body, postedAt }]);
    } else {
      // postedAt (and everything else not touched here) carries over from
      // the post being edited — draft was seeded from it in startEdit and
      // nothing here resets it.
      onChange(value.map((entry, i) => (i === editingIndex ? { ...draft, title, body } : entry)));
    }
    cancelEdit();
  }

  function removeEntry(index: number) {
    onChange(value.filter((_, i) => i !== index));
    if (editingIndex === index) cancelEdit();
    else if (editingIndex !== null && index < editingIndex) setEditingIndex(editingIndex - 1);
  }

  return (
    <div className="space-y-3">
      <UpdateEntryForm
        draft={draft}
        onDraftChange={patchDraft}
        onSubmit={commit}
        onCancel={editingIndex !== null ? cancelEdit : undefined}
        atLimit={value.length >= MAX_UPDATES}
        listingId={listingId}
        aiAvailable={aiAvailable}
      />

      {value.length === 0 ? (
        <EmptyState icon={Megaphone} title="No posts yet" description="Add a News or Promotion post above — it'll show up here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                <th className="py-2 pr-3 font-medium">Title</th>
                <th className="py-2 pr-3 font-medium">Kind</th>
                <th className="py-2 pr-3 font-medium">Posted</th>
                <th className="py-2 pr-3 font-medium">Ends</th>
                <th className="py-2 pr-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {value.map((entry, index) => (
                <tr key={index} className={cn(editingIndex === index && "bg-slate-50 dark:bg-neutral-800/60")}>
                  <td className="max-w-xs truncate py-2.5 pr-3 text-slate-800 dark:text-slate-200">{entry.title}</td>
                  <td className="py-2.5 pr-3">
                    <Badge className={KIND_BADGE_CLASSES[entry.kind]}>{entry.kind === "PROMOTION" ? "Promotion" : "News"}</Badge>
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {entry.postedAt ? formatIsoDate(entry.postedAt) : "—"}
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {entry.kind === "PROMOTION" && entry.endDate ? formatIsoDate(entry.endDate) : "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(index)}
                        aria-label="Edit post"
                        title="Edit post"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-800 dark:hover:text-slate-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        aria-label="Remove post"
                        title="Remove post"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <input type="hidden" name={name} value={JSON.stringify(value.filter((entry) => entry.title.trim() && entry.body.trim()))} />
    </div>
  );
}
