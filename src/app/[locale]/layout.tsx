import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { DirectoryChrome } from "@/components/directory/directory-chrome";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { getSiteOrigin } from "@/lib/site-url";

// Every URL the directory's own pages put in <head> is already absolute
// (built from getSiteOrigin), so this exists for the one relative URL Next
// adds by itself: the segment's file-based share image (./opengraph-image.tsx)
// is resolved against metadataBase when this layout's metadata merges, and
// without it Next falls back to localhost even in production, since this
// app isn't on Vercel (getSocialImageMetadataBaseFallback in
// next/dist/lib/metadata/resolvers/resolve-url.js) — a warning on every
// request, and a localhost og:image on any page that didn't override it.
//
// The ownership tokens Google Search Console and Bing Webmaster Tools hand
// out when a property is added with their "HTML tag" method live here too,
// from env, so the same build verifies on whichever host it runs on and
// nothing site-specific is committed. Each is simply absent until set.
export async function generateMetadata(): Promise<Metadata> {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  return {
    metadataBase: new URL(await getSiteOrigin()),
    ...(google || bing
      ? {
          verification: {
            ...(google ? { google } : {}),
            ...(bing ? { other: { "msvalidate.01": bing } } : {}),
          },
        }
      : {}),
  };
}

// Plausible Analytics, scoped to the public directory tree — the staff CRM
// and the partner portal stay untracked. Off until PLAUSIBLE_DOMAIN is set;
// PLAUSIBLE_SCRIPT_URL points a self-hosted instance's script, else the
// hosted one. Referrer breakdowns in Plausible are where AI answer engines
// (chatgpt.com, perplexity.ai, copilot.microsoft.com, claude.ai,
// gemini.google.com) show up as a traffic source — see the README.
function plausibleScript() {
  const domain = process.env.PLAUSIBLE_DOMAIN?.trim();
  if (!domain) return null;
  const src = process.env.PLAUSIBLE_SCRIPT_URL?.trim() || "https://plausible.io/js/script.js";
  return <Script defer data-domain={domain} src={src} strategy="afterInteractive" />;
}

// Google Analytics (GA4), scoped the same as plausibleScript above — the
// two aren't mutually exclusive, a site can run either, both, or neither.
// Defaults to this site's own GA4 property (business.gotka.com's Data
// Stream) so it's live without any env var to set; GA_MEASUREMENT_ID still
// overrides it if the property ever changes.
function googleAnalyticsScripts() {
  const measurementId = process.env.GA_MEASUREMENT_ID?.trim() || "G-RCEL949R1J";
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}

export default async function LocalizedDirectoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  return (
    <>
      <DirectoryChrome locale={resolved}>{children}</DirectoryChrome>
      {plausibleScript()}
      {googleAnalyticsScripts()}
    </>
  );
}
