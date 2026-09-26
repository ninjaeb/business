import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPublishedListingBySlug } from "@/lib/directory";
import { stripMarkdownLiteToPlainText } from "@/lib/markdown-lite";
import { DIRECTORY_SHARE_IMAGE_SIZE } from "@/lib/directory-seo";

// Every listing's own share image (see the `shareImage` in this route's
// page.tsx) — the same gotka.com house style as the directory's site-wide
// opengraph-image.tsx (dark navy, the green corner glow), but built from
// this specific business's own company name, services, and description
// rather than generic directory branding, plus its own logo alongside them
// when the partner uploaded one. The top-left lockup reads "Business
// Directory" rather than "Gotka" — this card is about the listed business,
// not the parent brand, which still gets its G icon plus the
// business.gotka.com domain at the bottom. A consistent, always-informative
// link preview whether or not a partner bothered uploading a logo or
// photos — this never falls back to those directly the way the old
// shareImage priority chain did.
export const size = DIRECTORY_SHARE_IMAGE_SIZE;
export const contentType = "image/png";

const iconSrc = `data:image/png;base64,${await readFile(join(process.cwd(), "public", "icon-512.png"), "base64")}`;

const NAVY = "#0E1B28";
const GREEN = "#2EC27E";
const MUTED = "#8FA6BC";

// Same scale gotka.com's own OG-image pipeline uses for a page title
// (tools/build-og-images-render.js) — a company name can run anywhere from
// a couple words to a full "Sdn Bhd"-suffixed mouthful, and this keeps
// either from overflowing the card.
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

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getPublishedListingBySlug(slug);

  const companyName = listing?.companyName || "Business Directory";
  // Every service's title, comma-separated, standing in for gotka.com's own
  // static per-page eyebrow ("SERVICES") — here it's each business's actual
  // services rather than a fixed label.
  const servicesLine = listing?.services.length
    ? truncate(listing.services.map((service) => service.title).join(" · "), 72)
    : null;
  const descriptionSource =
    listing?.seoDescription?.trim() ||
    listing?.tagline ||
    (listing?.description ? stripMarkdownLiteToPlainText(listing.description) : "");
  const descriptionLine = descriptionSource ? truncate(descriptionSource, 130) : null;

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
            position as its OG-image template (tools/og-image/template.html
            in the go-website repo). */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {listing?.logoUrl && (
              // A white tile behind it — a partner's own logo can be any
              // color, including one that would otherwise vanish against
              // this card's dark navy background — sized generously enough
              // (100px) to read clearly at social-preview thumbnail sizes.
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  background: "#fff",
                  padding: 10,
                  flexShrink: 0,
                }}
              >
                <img src={listing.logoUrl} width={80} height={80} alt="" style={{ objectFit: "contain", borderRadius: 8 }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              {servicesLine && (
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
                  {servicesLine}
                </div>
              )}
              <div
                style={{
                  fontSize: titleSize(companyName),
                  fontWeight: 800,
                  lineHeight: 1.14,
                  color: "#fff",
                  letterSpacing: -1,
                }}
              >
                {companyName}
              </div>
              {descriptionLine && (
                <div style={{ marginTop: 20, fontSize: 24, color: MUTED, maxWidth: 900, lineHeight: 1.4 }}>
                  {descriptionLine}
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
