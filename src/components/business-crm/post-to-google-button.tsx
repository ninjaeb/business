"use client";

import { ExternalLink } from "lucide-react";
import { formatUpdateForGoogleBusinessProfile, GOOGLE_BUSINESS_PROFILE_POSTS_URL } from "@/lib/google-business-profile";
import { useToast } from "@/components/ui/toast";

// Posting straight to Google Business Profile via API is restricted to
// partners Google has separately approved (see
// src/lib/google-business-profile.ts) — this copies the post's text and
// opens the partner's own profile (or Google's generic one, when the
// listing has none pasted in — see PartnerListingForm's own "details" tab)
// so the partner can paste it in by hand. Same copy-and-open convenience
// the old UpdatesEditor had, carried over to the merged Posts feed.
export function PostToGoogleButton({
  title,
  body,
  googleBusinessProfileUrl,
}: {
  title: string;
  body: string;
  googleBusinessProfileUrl: string | null;
}) {
  const toast = useToast();

  async function postToGoogle() {
    try {
      await navigator.clipboard.writeText(formatUpdateForGoogleBusinessProfile({ kind: "NEWS", title, body, postedAt: null, endDate: null }));
      toast.success("Copied — paste it into the post box that just opened.");
    } catch {
      toast.error("Couldn't copy to your clipboard — copy the post's title and body by hand instead.");
    }
    window.open(googleBusinessProfileUrl || GOOGLE_BUSINESS_PROFILE_POSTS_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={postToGoogle}
      aria-label="Post to Google"
      title="Copy this post and open Google Business Profile to paste it in"
      className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
    >
      <ExternalLink className="h-3 w-3" />
      Post to Google
    </button>
  );
}
