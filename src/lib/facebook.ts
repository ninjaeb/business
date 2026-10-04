import { GRAPH_API_BASE } from "@/lib/meta-graph-api";
import { stripMarkdownLiteToPlainText } from "@/lib/markdown-lite";

// Posting a PartnerPost to its listing's connected Facebook Page (see
// FacebookPageConnection) — src/app/actions/partner-posts.ts is the only
// caller, right after creating the local post, best-effort (see
// PartnerPost's own schema comment on why a failure here never blocks the
// local post itself).

export class FacebookPostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FacebookPostError";
  }
}

// Graph API posts take plain text, not this app's markdown-lite grammar —
// same stripper Google Business Profile's own copy-paste flow already uses
// (see src/lib/google-business-profile.ts) for the same reason.
const FACEBOOK_POST_LIMIT = 5000;

function buildMessage(title: string, body: string): string {
  const text = [title.trim(), stripMarkdownLiteToPlainText(body)].filter(Boolean).join("\n\n");
  return text.length > FACEBOOK_POST_LIMIT ? `${text.slice(0, FACEBOOK_POST_LIMIT - 1)}…` : text;
}

// The first ![alt](url) in the post body, if any, made absolute — a post
// written with the composer's own image-upload toolbar embeds a relative
// /api/directory-images/<id> URL, which only resolves on this app's own
// origin; Facebook's servers need an absolute one to fetch the photo from.
// Only the first — a Page feed photo post takes exactly one image, and the
// composer's body is meant to be a quick post, not a multi-photo gallery.
function extractFirstImageUrl(body: string, siteOrigin: string): string | null {
  const match = /!\[[^\]]*\]\(([^)\s]+)\)/.exec(body);
  if (!match) return null;
  const url = match[1];
  return url.startsWith("/") ? `${siteOrigin}${url}` : url;
}

// Throws FacebookPostError on any failure — callers treat this as
// best-effort and record the message on the post row rather than letting
// it fail the whole create action (see createPartnerPost).
export async function postToFacebookPage(
  pageId: string,
  pageAccessToken: string,
  entry: { title: string; body: string },
  siteOrigin: string,
): Promise<string> {
  const message = buildMessage(entry.title, entry.body);
  const imageUrl = extractFirstImageUrl(entry.body, siteOrigin);

  const url = imageUrl ? `${GRAPH_API_BASE}/${pageId}/photos` : `${GRAPH_API_BASE}/${pageId}/feed`;
  const body = imageUrl
    ? { url: imageUrl, caption: message, access_token: pageAccessToken }
    : { message, access_token: pageAccessToken };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload: { id?: string; post_id?: string; error?: { message?: string } } = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new FacebookPostError(payload.error?.message ?? `Facebook API returned ${response.status}`);
  }
  // A /photos post's own `id` is the photo's id, not the feed post's — the
  // post itself is `post_id` there, but plain `id` for a /feed post.
  const postId = payload.post_id ?? payload.id;
  if (!postId) throw new FacebookPostError("Facebook accepted the post but returned no post id.");
  return postId;
}
