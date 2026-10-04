"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Send, Share2 } from "lucide-react";
import { uploadDirectoryListingImage } from "@/app/actions/directory-images";
import { disconnectFacebookPage, type CreatePartnerPostFormState } from "@/app/actions/partner-posts";
import { Input, Select } from "@/components/ui/field";
import { Button, buttonClasses } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { MarkdownLiteEditor } from "@/components/directory/markdown-lite-editor";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const KIND_OPTIONS: { value: "NEWS" | "PROMOTION"; label: string }[] = [
  { value: "NEWS", label: "News" },
  { value: "PROMOTION", label: "Promotion" },
];

// The business portal's "what's on your mind?" box — publishes a post
// instantly to the chosen listing's own News/Promotions tab (see
// src/app/actions/partner-posts.ts's own comment on why this never waits
// on an admin re-approving the whole listing), with an optional cross-post
// to that listing's connected Facebook Page.
export function PostComposer({
  action,
  listings,
  connectedPages,
  facebookConfigured,
}: {
  action: (prevState: CreatePartnerPostFormState, formData: FormData) => Promise<CreatePartnerPostFormState>;
  listings: { id: string; companyName: string }[];
  // listingId -> connected Page's own display name, only for listings that
  // actually have a FacebookPageConnection — see the posts page's own query.
  connectedPages: Record<string, string>;
  // Hides every Facebook control below when FACEBOOK_APP_ID/SECRET aren't
  // set — same "hide rather than error" convention as the signup page's
  // own "Continue with Google" button (see isGoogleAuthConfigured).
  facebookConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const toast = useToast();
  const [listingId, setListingId] = useState(listings[0]?.id ?? "");
  const [kind, setKind] = useState<"NEWS" | "PROMOTION">("NEWS");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [endDate, setEndDate] = useState("");
  const [crossPost, setCrossPost] = useState(true);

  const connectedPageName = connectedPages[listingId];

  // Clears the composer once a post actually goes out — state?.success only
  // ever flips true right after a fresh submission accepted by the server,
  // never on the initial render (useActionState's own prevState is
  // undefined until then). Routed through setTimeout rather than calling
  // setState directly in the effect body, same convention
  // BusinessPartnerRequestForm's own debounced search follows (see its own
  // comment) — react-hooks/set-state-in-effect flags a synchronous call.
  useEffect(() => {
    if (!state || !("success" in state) || !state.success) return;
    setTimeout(() => {
      setTitle("");
      setBody("");
      setEndDate("");
      if (state.facebookError) toast.error(`Posted — but Facebook said: ${state.facebookError}`);
      else toast.success("Posted.");
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function uploadImage(file: File) {
    const formData = new FormData();
    formData.set("image", file);
    return uploadDirectoryListingImage(listingId, formData);
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="endDate" value={endDate} />

        <div className="flex flex-wrap items-center gap-3">
          {listings.length > 1 && (
            <Select value={listingId} onChange={(event) => setListingId(event.target.value)} className="max-w-56">
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.companyName}
                </option>
              ))}
            </Select>
          )}
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 dark:bg-neutral-800">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setKind(option.value)}
                aria-pressed={kind === option.value}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  kind === option.value
                    ? "bg-white text-petrol-ink shadow-sm dark:bg-neutral-700 dark:text-petrol-light"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {kind === "PROMOTION" && (
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              Ends
              <DatePicker value={endDate} onChange={setEndDate} className="w-36" buttonClassName="h-8 px-2 text-xs" />
            </label>
          )}
        </div>

        <Input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={kind === "PROMOTION" ? "e.g. 20% off this weekend" : "What's new?"}
          maxLength={100}
        />
        <MarkdownLiteEditor
          id="post-draft-body"
          name="body"
          value={body}
          onChange={setBody}
          onUploadImage={uploadImage}
          rows={3}
          placeholder="Write your post — select text and use the toolbar for bold, lists, links, and images."
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {facebookConfigured && connectedPageName && (
            <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                name="crossPostToFacebook"
                checked={crossPost}
                onChange={(event) => setCrossPost(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-petrol focus:ring-petrol dark:border-neutral-700"
              />
              <Share2 className="h-4 w-4 text-[#1877F2]" />
              Also post to {connectedPageName}
            </label>
          )}
          <Button type="submit" disabled={pending || !title.trim() || !body.trim()} className="ml-auto">
            <Send className="h-4 w-4" />
            {pending ? "Posting…" : "Post"}
          </Button>
        </div>
        {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      </form>

      {facebookConfigured && (
        <div className="border-t border-slate-100 pt-3 dark:border-neutral-800">
          {connectedPageName ? (
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-[#1877F2]" />
                Connected to <strong className="font-medium text-slate-700 dark:text-slate-200">{connectedPageName}</strong>
              </span>
              <form action={disconnectFacebookPage.bind(null, listingId)}>
                <button type="submit" className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400">
                  Disconnect
                </button>
              </form>
            </div>
          ) : (
            <form action="/api/facebook/connect" method="POST">
              <input type="hidden" name="listingId" value={listingId} />
              <button type="submit" className={buttonClasses("ghost", "sm")}>
                <Share2 className="h-3.5 w-3.5 text-[#1877F2]" />
                Connect Facebook Page
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
