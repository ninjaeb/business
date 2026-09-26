import "server-only";
import { assertPublicHttpUrl } from "@/lib/ssrf-guard";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES, photoDataUrl } from "@/lib/photo";

// Fetches a business's own website and boils it down to plain text for the
// AI to read (see autoCreateListingDetails in src/app/actions/directory.ts).
// Best-effort throughout: any page that can't be fetched or isn't HTML is
// simply skipped, since the Google Maps listing alone is still enough to
// draft from. Hard caps everywhere — the URL is partner-supplied, so this
// must never turn into an open-ended crawl or a large download.
const FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 600_000;
const MAX_REDIRECTS = 3;
const MAX_HOME_CHARS = 8_000;
const MAX_SUBPAGE_CHARS = 5_000;
const MAX_SUBPAGES = 3;
const MAX_COMPANY_NAME_LENGTH = 200;
// Exported for video-oembed.ts, which needs the same realistic UA to avoid
// TikTok's oEmbed endpoint blocking bare/bot-like requests.
export const USER_AGENT = "Mozilla/5.0 (compatible; GotkaCRM/1.0; +https://gotka.com)";

// The homepage links worth following for more detail — the pages that
// typically spell out what a business actually offers.
const SUBPAGE_PATTERN = /about|service|product|solution|what-we-do|faq|pricing|package|menu|portfolio/i;
const NON_HTML_EXTENSION_PATTERN = /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|pptx?|mp4|mp3)$/i;

export type WebsitePage = { url: string; title: string; text: string };

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

async function readLimited(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks).subarray(0, maxBytes));
}

// Redirects are followed by hand rather than letting fetch do it, so each
// hop's target goes through the same public-address check as the first URL.
export async function fetchHtml(startUrl: URL): Promise<{ url: URL; html: string } | null> {
  let url = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHttpUrl(url);
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" },
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
    const contentType = response.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      await response.body?.cancel().catch(() => {});
      return null;
    }
    return { url, html: await readLimited(response, MAX_HTML_BYTES) };
  }
  return null;
}

// ---------------------------------------------------------------------------
// HTML → text
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  copy: "©",
  reg: "®",
  trade: "™",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  middot: "·",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith("#")) {
      const code = lower.startsWith("#x") ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[lower] ?? match;
  });
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export type ExtractedPage = { title: string; text: string; links: { href: string; text: string }[] };

// Plain-text view of a page: <title> and the meta description first (the
// two lines a site's own author wrote to summarize it), then the visible
// body text with block boundaries kept as line breaks. Scripts, styles,
// and the like are dropped outright. Regex-based on purpose — a full HTML
// parser would be a new dependency for what is, for the AI's purposes,
// just "the words on the page".
export function extractTextFromHtml(html: string, maxChars: number): ExtractedPage {
  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const metaTag = html.match(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i)?.[0] ?? "";
  const metaDescription = decodeEntities(metaTag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1] ?? "").trim();

  const links = [...html.matchAll(/<a\b[^>]*?\bhref\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: match[1].trim(),
    text: stripTags(match[2]),
  }));

  const body = decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|template|iframe|head)\b[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<(?:br|hr)\b[^>]*>|<\/(?:p|div|li|h[1-6]|tr|section|article|header|footer|nav|blockquote|td|th|dd|dt|ul|ol|table|figcaption)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const text = [metaDescription, body].filter(Boolean).join("\n\n").slice(0, maxChars);
  return { title, text, links };
}

// ---------------------------------------------------------------------------
// Site identity — company name and logo, read from the homepage only (never
// a subpage, which isn't reliably about the business itself the way the
// home page's own <title>/og: tags are). Used by autoCreateListingDetails
// when a partner gives a website without picking a Google Maps listing —
// the same "copy the fact, don't have the model write it" treatment place
// data gets, just sourced from the site's own metadata instead.
// ---------------------------------------------------------------------------

function metaContent(html: string, attr: "property" | "name", key: string): string | null {
  const tag = html.match(new RegExp(`<meta\\b[^>]*\\b${attr}\\s*=\\s*["']${key}["'][^>]*>`, "i"))?.[0];
  return tag ? decodeEntities(tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1] ?? "").trim() || null : null;
}

function linkHref(html: string, relPattern: string): string | null {
  const tag = html.match(new RegExp(`<link\\b[^>]*\\brel\\s*=\\s*["']${relPattern}["'][^>]*>`, "i"))?.[0];
  return tag?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() || null;
}

// og:site_name is written specifically to name the site/brand, so it's used
// as-is; a bare <title> usually reads "Brand | Tagline" or "Brand - Short
// description", so only the segment before the first separator is kept.
function extractCompanyName(html: string): string | null {
  const siteName = metaContent(html, "property", "og:site_name");
  if (siteName) return siteName.slice(0, MAX_COMPANY_NAME_LENGTH);
  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  if (!title) return null;
  return title.split(/\s[|\-–—:»]\s/)[0].trim().slice(0, MAX_COMPANY_NAME_LENGTH) || null;
}

// Priority order: the image a site's own author chose to represent it when
// shared (og:image, then Twitter's equivalent), then its home-screen icon,
// then its plain favicon, then a bare /favicon.ico guess — each resolved to
// an absolute URL and tried in turn (see fetchWebsiteLogo) until one
// actually fetches.
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

// Follows redirects itself (fetch's own follower would skip the guard on
// every hop) and enforces the same JPEG/PNG/WebP/GIF + 3MB rules a manual
// logo upload gets, via a hard content-length check plus a streamed byte
// cap — oversized or wrong-type responses are rejected outright, never
// truncated into a broken image.
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
    const buffer = await readLimitedBuffer(response, MAX_PHOTO_BYTES);
    if (!buffer) return null;
    return photoDataUrl(buffer, contentType);
  }
  return null;
}

async function readLimitedBuffer(response: Response, maxBytes: number): Promise<Buffer | null> {
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

// Best-effort, like logoFromPlace in src/app/actions/directory.ts — tries
// each candidate in turn (see websiteImageCandidates) until one actually
// fetches, or gives up quietly. Kept as its own call (rather than folded
// into fetchWebsiteText) so it can run in parallel with the AI call, the
// same way logoFromPlace does.
export async function fetchWebsiteLogo(candidates: URL[]): Promise<string | null> {
  for (const candidate of candidates) {
    const dataUrl = await fetchImageAsDataUrl(candidate).catch(() => null);
    if (dataUrl) return dataUrl;
  }
  return null;
}

function hostKey(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, "");
}

function pickSubpages(home: URL, links: ExtractedPage["links"]): URL[] {
  const picked: URL[] = [];
  const seen = new Set<string>([home.pathname.replace(/\/$/, "") || "/"]);
  for (const link of links) {
    let target: URL;
    try {
      target = new URL(link.href, home);
    } catch {
      continue;
    }
    if ((target.protocol !== "http:" && target.protocol !== "https:") || hostKey(target) !== hostKey(home)) continue;
    const path = target.pathname.replace(/\/$/, "") || "/";
    if (seen.has(path) || NON_HTML_EXTENSION_PATTERN.test(path)) continue;
    if (!SUBPAGE_PATTERN.test(path) && !SUBPAGE_PATTERN.test(link.text)) continue;
    seen.add(path);
    target.hash = "";
    picked.push(target);
    if (picked.length >= MAX_SUBPAGES) break;
  }
  return picked;
}

export type WebsiteScrapeResult = {
  pages: WebsitePage[];
  // Read from the homepage only — see extractCompanyName/
  // websiteImageCandidates above. logoCandidates are already resolved,
  // absolute URLs; fetching the actual image bytes is a separate step (see
  // fetchWebsiteLogo) so the caller can run it in parallel with other work.
  companyName: string | null;
  logoCandidates: URL[];
};

const EMPTY_SCRAPE: WebsiteScrapeResult = { pages: [], companyName: null, logoCandidates: [] };

// `website` must already be an absolute http(s) URL (see normalizeWebsiteUrl
// in src/lib/directory.ts). Returns the homepage first, then whichever
// about/services/etc. pages it links to that could be read — or an empty
// result when even the homepage couldn't be, so the caller can carry on
// with the Google Maps listing alone.
export async function fetchWebsiteText(website: string): Promise<WebsiteScrapeResult> {
  let home: Awaited<ReturnType<typeof fetchHtml>>;
  try {
    home = await fetchHtml(new URL(website));
  } catch {
    return EMPTY_SCRAPE;
  }
  if (!home) return EMPTY_SCRAPE;

  const homePage = extractTextFromHtml(home.html, MAX_HOME_CHARS);
  const pages: WebsitePage[] = [];
  if (homePage.text) pages.push({ url: home.url.toString(), title: homePage.title, text: homePage.text });

  const subpages = await Promise.allSettled(pickSubpages(home.url, homePage.links).map((url) => fetchHtml(url)));
  for (const result of subpages) {
    if (result.status !== "fulfilled" || !result.value) continue;
    const page = extractTextFromHtml(result.value.html, MAX_SUBPAGE_CHARS);
    if (page.text) pages.push({ url: result.value.url.toString(), title: page.title, text: page.text });
  }
  return {
    pages,
    companyName: extractCompanyName(home.html),
    logoCandidates: websiteImageCandidates(home.url, home.html),
  };
}
