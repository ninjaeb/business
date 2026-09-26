import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, type DirectoryLocale } from "@/lib/directory-i18n";
import { DIRECTORY_SHARE_IMAGE_ALT, DIRECTORY_SHARE_IMAGE_SIZE } from "@/lib/directory-seo";

// The share image (og:image/twitter:image) every directory page points at
// (see directoryShareImage) that isn't a listing with its own (see this
// route's sibling under [slug]/opengraph-image.tsx) — home, category,
// location, products, news, sign-up and benefits pages. Same gotka.com
// house style as that listing card (dark navy, the green corner glow, the
// G/GOTKA lockup — see tools/og-image/template.html in the go-website
// repo), but centered like gotka.com's own home page share image rather
// than a per-page eyebrow+title, since this one has no single page title
// of its own to lead with.
export const alt = DIRECTORY_SHARE_IMAGE_ALT;
export const size = DIRECTORY_SHARE_IMAGE_SIZE;
export const contentType = "image/png";

// The icon never changes between requests — read once at module scope.
const iconSrc = `data:image/png;base64,${await readFile(join(process.cwd(), "public", "icon-512.png"), "base64")}`;

const NAVY = "#0E1B28";
const MUTED = "#8FA6BC";

// ImageResponse ships only a Latin default font (and bundling a CJK face
// would blow its 500KB bundle cap several times over), so the Chinese
// variant renders its text in English rather than as missing-glyph boxes.
// Malay is Latin-script and gets its own words.
const TEXT_LOCALE: Record<DirectoryLocale, DirectoryLocale> = { en: "en", zh: "en", ms: "ms" };

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const textLocale = TEXT_LOCALE[resolveDirectoryLocale(locale) ?? "en"];

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
        {/* gotka.com's own top-right radial glow accent, same color and
            position as its OG-image template. */}
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
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <img src={iconSrc} width={100} height={100} alt="" style={{ borderRadius: 24 }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>GOTKA</div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 6, color: MUTED, marginTop: 4 }}>
                BUSINESS DIRECTORY
              </div>
            </div>
          </div>
          <div style={{ marginTop: 48, fontSize: 40, fontWeight: 700, color: "#fff", textAlign: "center" }}>
            {DIRECTORY_STRINGS[textLocale].footerTagline}
          </div>
          <div style={{ marginTop: 28, fontSize: 22, color: MUTED }}>business.gotka.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
