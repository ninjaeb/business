import "server-only";
import { toEmbeddableVideoUrl } from "@/lib/directory";
import { USER_AGENT } from "@/lib/website-text";

// Best-effort thumbnail/title lookup for a video URL a partner just pasted
// into the gallery editor (see VideosEditor, fetchVideoDetails in
// src/app/actions/directory.ts). Runs once, at add-time, so the result can
// be stored on the listing (VideoEntry.thumbnailUrl) and the public page
// never depends on a live third-party call to render — same principle as
// Google Places/website scraping in autoCreateListingDetails.
//
// Every provider here is a fixed, hardcoded host — only the query STRING
// (the partner's own URL, already percent-encoded) is partner-supplied, so
// this carries none of fetchWebsiteText's SSRF exposure (an arbitrary
// partner-chosen host to connect to); no DNS/private-IP guard needed.
const REQUEST_TIMEOUT_MS = 6_000;

type OEmbedResult = { title: string | null; thumbnailUrl: string | null };

async function fetchOEmbedJson(endpoint: string): Promise<{ title?: unknown; thumbnail_url?: unknown } | null> {
  try {
    // TikTok's oEmbed endpoint in particular blocks requests that don't look
    // like they come from a real client — a bare fetch() with no headers
    // reliably fails against it in production even though the endpoint
    // itself is fine (verified directly).
    const response = await fetch(endpoint, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as { title?: unknown; thumbnail_url?: unknown };
  } catch {
    return null;
  }
}

// Facebook's oEmbed now requires a Facebook developer app's access token
// (App ID|App Secret) — this project doesn't ask partners to set that up
// just for a thumbnail, so Facebook videos simply get no auto-fetched
// title/thumbnail; the partner types a title themselves, and the gallery
// falls back to a plain "Watch video" link for the missing thumbnail.
export async function fetchVideoOEmbed(rawUrl: string): Promise<OEmbedResult | null> {
  const embeddable = toEmbeddableVideoUrl(rawUrl);
  if (!embeddable || embeddable.provider === "facebook") return null;

  const encoded = encodeURIComponent(rawUrl);
  const endpoint =
    embeddable.provider === "youtube"
      ? `https://www.youtube.com/oembed?url=${encoded}&format=json`
      : embeddable.provider === "vimeo"
        ? `https://vimeo.com/api/oembed.json?url=${encoded}`
        : embeddable.provider === "dailymotion"
          ? `https://www.dailymotion.com/services/oembed?url=${encoded}&format=json`
          : `https://www.tiktok.com/oembed?url=${encoded}`; // tiktok

  const data = await fetchOEmbedJson(endpoint);
  if (!data) return null;
  return {
    title: typeof data.title === "string" ? data.title : null,
    thumbnailUrl: typeof data.thumbnail_url === "string" ? data.thumbnail_url : null,
  };
}
