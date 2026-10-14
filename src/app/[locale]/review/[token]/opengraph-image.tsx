import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { readPublishedSnapshot } from "@/lib/directory";
import { DIRECTORY_STRINGS, formatStandaloneTestimonialHeading } from "@/lib/directory-i18n";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_SHARE_IMAGE_SIZE } from "@/lib/directory-seo";
import { getTestimonialRequestLinkForForm } from "@/lib/testimonial-request-links";

// The link-preview card for a "please leave us a testimonial" link — what
// WhatsApp/Facebook/Telegram show when a business sends one to a customer.
// Same gotka.com house style as the listing's own share image
// (src/app/[locale]/[slug]/opengraph-image.tsx: dark navy, green corner glow,
// the business's logo on a white tile), but about the ask, not the business:
// a big "Share your experience with {company}", five stars, and the two
// reassurances that make someone willing to tap (under a minute, no account).
// A used or unknown token falls back to a plain directory card rather than
// 404ing, so a stale link still previews cleanly.
export const size = DIRECTORY_SHARE_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "Share your experience — leave a testimonial";

const iconSrc = `data:image/png;base64,${await readFile(join(process.cwd(), "public", "icon-512.png"), "base64")}`;

const NAVY = "#0E1B28";
const GREEN = "#2EC27E";
const MUTED = "#8FA6BC";
const STAR = "#FBBF24";

// Satori's built-in font has no Chinese glyphs (they render as empty boxes),
// so the card's own wording uses English for zh — Malay is Latin script and
// renders fine. The page's title/description, which crawlers read as text,
// stay fully localized; only this baked-in picture falls back.
function headlineSize(text: string): number {
  const n = text.length;
  if (n <= 34) return 64;
  if (n <= 48) return 54;
  if (n <= 64) return 46;
  if (n <= 84) return 38;
  return 32;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24">
      <path
        d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.53L12 17.46l-5.86 3.09 1.12-6.53L2.51 9.39l6.56-.95L12 2.5z"
        fill={filled ? STAR : "none"}
        stroke={STAR}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Image({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  const resolved = resolveDirectoryLocale(locale) ?? "en";
  const t = DIRECTORY_STRINGS[resolved === "zh" ? "en" : resolved];

  const request = await getTestimonialRequestLinkForForm(token);
  const companyName = request?.listing.companyName ?? null;
  // The published snapshot's logo — what the public already sees — not the
  // live row's, which can hold an unpublished draft edit.
  const logoUrl = request ? (readPublishedSnapshot(request.listing.publishedSnapshot)?.logoUrl ?? null) : null;

  const headline = companyName
    ? formatStandaloneTestimonialHeading(t.standaloneTestimonialHeading, companyName)
    : "Business Directory";

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
            <img src={iconSrc} width={56} height={56} alt="" style={{ borderRadius: 13 }} />
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>BUSINESS DIRECTORY</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {logoUrl && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 132,
                  height: 132,
                  borderRadius: 26,
                  background: "#fff",
                  padding: 12,
                  flexShrink: 0,
                }}
              >
                <img src={logoUrl} width={108} height={108} alt="" style={{ objectFit: "contain", borderRadius: 10 }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} filled />
                ))}
              </div>
              <div
                style={{
                  fontSize: headlineSize(headline),
                  fontWeight: 800,
                  lineHeight: 1.14,
                  color: "#fff",
                  letterSpacing: -1,
                }}
              >
                {headline}
              </div>
              {companyName && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 24,
                    fontSize: 22,
                    fontWeight: 600,
                    color: GREEN,
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: GREEN }} />
                  {t.standaloneTestimonialShareTagline}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 19, color: MUTED }}>business.gotka.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
