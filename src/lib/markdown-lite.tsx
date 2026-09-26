import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ZoomableImage } from "@/components/directory/zoomable-image";

// A deliberately small formatting grammar for the partner directory's
// About field and News/Promotion posts — bold, italic, strikethrough,
// bullet/numbered lists, headings (##/###), blockquotes, links, and
// images. Still not a general markdown parser: no tables, nesting, or
// escaping, by design ("simple formatting" is what was asked for). Zero
// `db` (or any other server-only) dependency — safe to import from a
// "use client" component's live preview, same reasoning as
// src/lib/operating-hours.ts.

const SAFE_URL_PATTERN = /^https?:\/\//i;
// A root-relative path ("/api/directory-images/xyz") is same-origin and
// safe — this is how an uploaded image (see markdown-lite-editor.tsx's
// Image button, backed by uploadDirectoryListingImage) gets embedded.
// Deliberately excludes a protocol-relative path ("//evil.com/x"), which a
// browser resolves to that host's own https:// URL — not same-origin at all.
const SAFE_RELATIVE_PATTERN = /^\/(?!\/)/;

// Applies to both link and image targets — same http(s)-only rule the rest
// of the directory already uses for a partner's website (see
// normalizeWebsiteUrl in src/lib/directory.ts), plus same-origin relative
// paths. A `javascript:`/`data:` target is rendered as inert literal text
// instead of a live link/image rather than dropped, so a partner sees
// exactly what they typed.
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  return SAFE_URL_PATTERN.test(trimmed) || SAFE_RELATIVE_PATTERN.test(trimmed);
}

// Image before link (its leading "!" is what tells them apart — trying
// link first would still match an image's "[alt](url)" tail); bold before
// italic, since both use "*" and a leading "**" must win over "*" at the
// same position (the engine takes the first alternative that matches, not
// the longest, so order here is what makes "**bold**" not parse as
// "*" + "bold" wrapped by two stray italics).
const INLINE_PATTERN =
  /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]*)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|~~([^~]+)~~|\*([^*]+)\*/g;

function renderInline(text: string, keyPrefix: string, zoomableImages: boolean): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let count = 0;
  const pattern = new RegExp(INLINE_PATTERN.source, "g");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const [full, imageAlt, imageUrl, linkText, linkUrl, boldText, strikeText, italicText] = match;
    const key = `${keyPrefix}-${count++}`;
    if (imageUrl !== undefined) {
      nodes.push(
        isSafeUrl(imageUrl) ? (
          zoomableImages ? (
            <ZoomableImage key={key} src={imageUrl} alt={imageAlt} className="my-2 max-w-full rounded-md" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- an arbitrary partner-supplied external URL, not a domain next/image could be configured to optimize
            <img key={key} src={imageUrl} alt={imageAlt} loading="lazy" className="my-2 max-w-full rounded-md" />
          )
        ) : (
          full
        ),
      );
    } else if (linkUrl !== undefined) {
      nodes.push(
        isSafeUrl(linkUrl) ? (
          <a
            key={key}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-petrol underline hover:text-petrol-light dark:text-petrol-light"
          >
            {linkText}
          </a>
        ) : (
          full
        ),
      );
    } else if (boldText !== undefined) {
      nodes.push(<strong key={key}>{boldText}</strong>);
    } else if (strikeText !== undefined) {
      nodes.push(<del key={key}>{strikeText}</del>);
    } else if (italicText !== undefined) {
      nodes.push(<em key={key}>{italicText}</em>);
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

type Block = {
  type: "paragraph" | "bullet-list" | "numbered-list" | "heading" | "blockquote";
  lines: string[];
  // Only set for "heading" — 2 or 3, matching HEADING_RE's "##"/"###".
  level?: number;
};

// Exported for markdown-lite-editor.tsx's Enter-key handling, which needs to
// recognize "the cursor is on a list line" using the exact same grammar this
// parses with, rather than a second, potentially-drifting copy of it.
export const BULLET_RE = /^[-*]\s+(.*)$/;
export const NUMBERED_RE = /^\d+\.\s+(.*)$/;
// Two levels only (## and ###) — a partner's About/post body is a few
// paragraphs, not a document that needs a full h1-h6 outline, and h1 is
// reserved for the page's own listing-name heading.
const HEADING_RE = /^(#{2,3})\s+(.*)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;

// Blank lines separate paragraphs; a run of consecutive list-marker or
// blockquote-marker lines becomes one block, a heading line is always its
// own block. Everything else is a paragraph, with single line breaks kept
// as <br> (not collapsed) — the closest match to how this text rendered
// before (plain whitespace-pre-wrap) now that it's real markup.
function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < rawLines.length) {
    if (rawLines[i].trim() === "") {
      i++;
      continue;
    }
    const heading = HEADING_RE.exec(rawLines[i]);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, lines: [heading[2]] });
      i++;
      continue;
    }
    const blockquote = BLOCKQUOTE_RE.exec(rawLines[i]);
    if (blockquote) {
      const items: string[] = [];
      while (i < rawLines.length) {
        const m = BLOCKQUOTE_RE.exec(rawLines[i]);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ type: "blockquote", lines: items });
      continue;
    }
    const bullet = BULLET_RE.exec(rawLines[i]);
    if (bullet) {
      const items: string[] = [];
      while (i < rawLines.length) {
        const m = BULLET_RE.exec(rawLines[i]);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ type: "bullet-list", lines: items });
      continue;
    }
    const numbered = NUMBERED_RE.exec(rawLines[i]);
    if (numbered) {
      const items: string[] = [];
      while (i < rawLines.length) {
        const m = NUMBERED_RE.exec(rawLines[i]);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ type: "numbered-list", lines: items });
      continue;
    }
    const lines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() !== "" &&
      !HEADING_RE.test(rawLines[i]) &&
      !BLOCKQUOTE_RE.test(rawLines[i]) &&
      !BULLET_RE.test(rawLines[i]) &&
      !NUMBERED_RE.test(rawLines[i])
    ) {
      lines.push(rawLines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", lines });
  }
  return blocks;
}

// Renders **bold**, *italic*, ~~strikethrough~~, "- "/"* " and "1. " lists,
// "##"/"###" headings, "> " blockquotes, [text](url) links, and
// ![alt](url) images as real React elements — never dangerouslySetInnerHTML,
// so there's no HTML-string XSS surface: everything but a validated
// http(s) href/src is plain escaped text by construction.
export function renderMarkdownLite(
  text: string | null | undefined,
  className?: string,
  options?: { zoomableImages?: boolean },
): ReactNode {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return null;
  const zoomableImages = options?.zoomableImages ?? false;
  const blocks = parseBlocks(trimmed);
  return (
    <div className={cn("space-y-3", className)}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          // Only ever h2/h3 (see HEADING_RE) — sized/weighted the same way
          // the rest of the directory's own section headings are, so a
          // heading a partner types in here doesn't look out of place next
          // to e.g. the "About"/"Services" Card titles around it.
          const HeadingTag = block.level === 3 ? "h3" : "h2";
          return (
            <HeadingTag key={i} className={block.level === 3 ? "text-base font-semibold" : "text-lg font-semibold"}>
              {renderInline(block.lines[0], `${i}-0`, zoomableImages)}
            </HeadingTag>
          );
        }
        if (block.type === "blockquote") {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-slate-300 pl-3 italic text-slate-600 dark:border-neutral-700 dark:text-slate-400"
            >
              {block.lines.map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {renderInline(line, `${i}-${j}`, zoomableImages)}
                </Fragment>
              ))}
            </blockquote>
          );
        }
        if (block.type === "bullet-list") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {block.lines.map((item, j) => (
                <li key={j}>{renderInline(item, `${i}-${j}`, zoomableImages)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "numbered-list") {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {block.lines.map((item, j) => (
                <li key={j}>{renderInline(item, `${i}-${j}`, zoomableImages)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(line, `${i}-${j}`, zoomableImages)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// The first embedded image in a body of markdown-lite text, if any — gives
// a News/Promotion post's JSON-LD (see buildUpdatesJsonLd in
// src/lib/directory-seo.ts) a representative `image` for free, straight from
// whatever the partner already attached via markdown-lite-editor.tsx's own
// Image button. Same safe-URL rule as renderMarkdownLite's own isSafeUrl (an
// http(s) URL, or a same-origin root-relative one like
// /api/directory-images/xyz) — anything else yields no image rather than
// handing a crawler a javascript:/data: string.
const FIRST_IMAGE_PATTERN = /!\[[^\]]*\]\(([^)\s]+)\)/;
export function firstMarkdownLiteImageUrl(text: string | null | undefined): string | null {
  const match = FIRST_IMAGE_PATTERN.exec(text ?? "");
  if (!match) return null;
  const url = match[1].trim();
  return isSafeUrl(url) ? url : null;
}

// For contexts that need a single plain-text line — <meta name="description">
// and the JSON-LD description — where literal "**"/"[]()" syntax would
// otherwise leak into a search result snippet or AI answer-engine summary.
export function stripMarkdownLiteToPlainText(text: string | null | undefined): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, "$1")
    .replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{2,3}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s*\n+\s*/g, " ")
    .trim();
}

// Trims to at most maxLength characters without cutting a word in half —
// for the meta description/JSON-LD fallback when a listing hasn't set its
// own seoDescription, so that fallback never ends mid-word the way a plain
// text.slice(0, n) would. Appends an ellipsis only when it actually
// truncated something.
export function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  const trimmed = (lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd();
  return `${trimmed}…`;
}
