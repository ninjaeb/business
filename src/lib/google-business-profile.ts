import { stripMarkdownLiteToPlainText } from "@/lib/markdown-lite";
import type { ListingUpdateEntry } from "@/lib/directory";

// Where "Post to Google" opens when the partner hasn't pasted their own
// Google Business Profile link — Google's own generic entry point for
// managing a profile, which then asks them to pick which business.
export const GOOGLE_BUSINESS_PROFILE_POSTS_URL = "https://business.google.com/posts";

// Google Business Profile rejects a post summary longer than this — see
// https://support.google.com/business/answer/7213077. Posting itself is
// manual for now (Google restricts the API that would post this directly
// to approved partners), so this only needs to produce text a partner can
// paste in, not to call any Google endpoint.
const GOOGLE_BUSINESS_PROFILE_POST_LIMIT = 1500;

// Plain text for a partner to copy into Google Business Profile's own post
// composer — title and (markdown-lite-stripped) body joined together, clipped
// to Google's own summary limit.
export function formatUpdateForGoogleBusinessProfile(entry: ListingUpdateEntry): string {
  const body = stripMarkdownLiteToPlainText(entry.body);
  const text = [entry.title.trim(), body].filter(Boolean).join("\n\n");
  return text.length > GOOGLE_BUSINESS_PROFILE_POST_LIMIT
    ? `${text.slice(0, GOOGLE_BUSINESS_PROFILE_POST_LIMIT - 1)}…`
    : text;
}
