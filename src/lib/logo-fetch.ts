import "server-only";
import { assertPublicHttpUrl } from "@/lib/ssrf-guard";
import { fetchHtml } from "@/lib/website-text";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES, photoDataUrl } from "@/lib/photo";

// Lets a partner point at a plain business website instead of uploading a
// logo file by hand — the Google Maps case (AI Auto Create's own photo, see
// logoFromPlace in src/app/actions/directory.ts) already covers the other
// source named in the request. Ends the same way: a same-origin `data:`
// URL, so the result can go straight into LogoCropDialog without tripping
// its canvas's CORS check.
const FETCH_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 5;
const USER_AGENT = "Mozilla/5.0 (compatible; GotkaCRM/1.0; +https://gotka.com)";

export type LogoFetchResult = { status: "ok"; dataUrl: string } | { status: "error"; message: string };

// Follows redirects itself (fetch's own follower would skip the guard on
// every hop) and enforces the same JPEG/PNG/WebP/GIF + 3MB rules a manual
// upload gets, via a hard content-length check plus a streamed byte cap —
// oversized or wrong-type responses are rejected outright, never truncated
// into a broken image.
async function fetchImageAsDataUrl(imageUrl: URL): Promise<string | null> {
  let url = imageUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHttpUrl(url);
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel().catch(() => {});
      if (!location) return null;
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      return null;
    }
    const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_PHOTO_TYPES.has(contentType)) {
      await response.body?.cancel().catch(() => {});
      return null;
    }
    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_PHOTO_BYTES) {
      await response.body?.cancel().catch(() => {});
      return null;
    }
    const buffer = await readCappedBuffer(response, MAX_PHOTO_BYTES);
    if (!buffer) return null;
    return photoDataUrl(buffer, contentType);
  }
  return null;
}

async function readCappedBuffer(response: Response, maxBytes: number): Promise<Buffer | null> {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

function metaContent(html: string, attr: "property" | "name", key: string): string | null {
  const tag = html.match(new RegExp(`<meta\\b[^>]*\\b${attr}\\s*=\\s*["']${key}["'][^>]*>`, "i"))?.[0];
  return tag?.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() || null;
}

function linkHref(html: string, relPattern: string): string | null {
  const tag = html.match(new RegExp(`<link\\b[^>]*\\brel\\s*=\\s*["']${relPattern}["'][^>]*>`, "i"))?.[0];
  return tag?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() || null;
}

// Priority order: the image a site's own author chose to represent it when
// shared (og:image, then Twitter's equivalent), then its home-screen icon,
// then its plain favicon, then a bare /favicon.ico guess — each resolved to
// an absolute URL and tried in turn until one actually fetches.
function websiteImageCandidates(pageUrl: URL, html: string): URL[] {
  const hrefs = [
    metaContent(html, "property", "og:image:secure_url"),
    metaContent(html, "property", "og:image"),
    metaContent(html, "name", "twitter:image"),
    metaContent(html, "name", "twitter:image:src"),
    linkHref(html, "apple-touch-icon"),
    linkHref(html, "(?:shortcut )?icon"),
    "/favicon.ico",
  ].filter((value): value is string => Boolean(value));

  const seen = new Set<string>();
  const urls: URL[] = [];
  for (const href of hrefs) {
    try {
      const resolved = new URL(href, pageUrl);
      if ((resolved.protocol !== "http:" && resolved.protocol !== "https:") || seen.has(resolved.toString())) continue;
      seen.add(resolved.toString());
      urls.push(resolved);
    } catch {
      continue;
    }
  }
  return urls;
}

async function fetchWebsiteLogoDataUrl(url: URL): Promise<string | null> {
  const page = await fetchHtml(url);
  if (!page) return null;
  for (const candidate of websiteImageCandidates(page.url, page.html)) {
    const dataUrl = await fetchImageAsDataUrl(candidate).catch(() => null);
    if (dataUrl) return dataUrl;
  }
  return null;
}

// Partner-gated caller lives in src/app/actions/directory.ts
// (fetchListingLogoFromUrl) — this stays a plain lib function, matching
// logoFromPlace/fetchWebsiteText's own split of "fetch the thing" from
// "who's allowed to ask for it."
export async function fetchLogoFromUrl(rawUrl: string): Promise<LogoFetchResult> {
  const trimmed = rawUrl.trim().slice(0, 500);
  if (!trimmed) return { status: "error", message: "Enter a website URL." };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return { status: "error", message: "That doesn't look like a valid URL." };
  }

  try {
    const dataUrl = await fetchWebsiteLogoDataUrl(url);
    return dataUrl ? { status: "ok", dataUrl } : { status: "error", message: "Couldn't find a usable logo image on that website." };
  } catch {
    return { status: "error", message: "Couldn't reach that address." };
  }
}
