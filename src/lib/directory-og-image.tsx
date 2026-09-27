import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DIRECTORY_SHARE_IMAGE_SIZE } from "@/lib/directory-seo";
import type { DirectoryLocale } from "@/lib/directory-i18n";

// Shared card renderer for every category/industry/location page's own
// share image (see each route's opengraph-image.tsx) — same gotka.com house
// style as the per-listing card (src/app/[locale]/[slug]/opengraph-image.tsx)
// and the site-wide fallback (src/app/[locale]/opengraph-image.tsx), but
// keyed off a section eyebrow ("CATEGORY"/"INDUSTRY"/"LOCATION") + that
// page's own name + description rather than a listing's company name/
// services/logo, since none of these pages has one.
export const DIRECTORY_SECTION_OG_SIZE = DIRECTORY_SHARE_IMAGE_SIZE;

// ImageResponse ships only a Latin default font (and bundling a CJK face
// would blow its 500KB bundle cap several times over — see the site-wide
// fallback's own comment), so a Chinese visitor's card renders its text in
// English rather than as missing-glyph boxes. Only the drawn PNG is
// affected — the page's actual <title>/meta description stay in Chinese,
// since those never go through Satori.
export const OG_IMAGE_TEXT_LOCALE: Record<DirectoryLocale, DirectoryLocale> = { en: "en", zh: "en", ms: "ms" };

const iconSrc = `data:image/png;base64,${await readFile(join(process.cwd(), "public", "icon-512.png"), "base64")}`;

const NAVY = "#0E1B28";
const GREEN = "#2EC27E";
const MUTED = "#8FA6BC";

// Same scale as the per-listing card's own titleSize — a category/industry/
// location name can run from one short word to a multi-word phrase, and
// this keeps either from overflowing the card.
function titleSize(title: string): number {
  const n = title.length;
  if (n <= 26) return 66;
  if (n <= 38) return 54;
  if (n <= 52) return 46;
  if (n <= 68) return 38;
  return 32;
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

export function buildDirectorySectionOgImage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string | null;
}) {
  const descriptionLine = description ? truncate(description, 130) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: NAVY,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 50%, rgba(46,194,126,0.30), rgba(46,194,126,0) 70%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse's Satori renderer needs a plain <img>; the lint rule only recognizes this exemption in an actual opengraph-image.tsx route file, not this shared helper */}
            <img src={iconSrc} width={56} height={56} alt="" style={{ borderRadius: 13 }} />
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>BUSINESS DIRECTORY</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: GREEN,
                marginBottom: 22,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 2, background: GREEN }} />
              {eyebrow}
            </div>
            <div
              style={{
                fontSize: titleSize(title),
                fontWeight: 800,
                lineHeight: 1.14,
                color: "#fff",
                letterSpacing: -1,
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
            {descriptionLine && (
              <div style={{ marginTop: 20, fontSize: 24, color: MUTED, maxWidth: 900, lineHeight: 1.4 }}>{descriptionLine}</div>
            )}
          </div>
          <div style={{ display: "flex", fontSize: 19, color: MUTED }}>business.gotka.com</div>
        </div>
      </div>
    ),
    { ...DIRECTORY_SECTION_OG_SIZE },
  );
}
