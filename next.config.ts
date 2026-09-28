import type { NextConfig } from "next";
import path from "node:path";

// Hosts like cPanel's "Setup Node.js App" install dependencies into a
// per-account "nodevenv" directory and symlink node_modules back into the
// app root from there. Turbopack refuses to follow that symlink ("points
// out of the filesystem root") unless its root is widened to a directory
// that actually contains both the app and the symlink target. Only widen
// it when $HOME genuinely is an ancestor of this project (true on that
// kind of host) — everywhere else (local dev, most CI/hosting), leave
// Turbopack's own root auto-detection alone.
function turbopackRoot(): string | undefined {
  const home = process.env.HOME;
  if (!home) return undefined;
  const relative = path.relative(home, __dirname);
  const isDescendant = relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  return isDescendant ? home : undefined;
}

const root = turbopackRoot();

// Plausible's own env var (see plausibleScript in src/app/[locale]/layout.tsx)
// may point a self-hosted instance at any domain, so the CSP origin is read
// from it too rather than hardcoded to plausible.io — used whether or not
// PLAUSIBLE_DOMAIN is actually set; allowlisting an unused origin is harmless.
function plausibleOrigin(): string {
  const scriptUrl = process.env.PLAUSIBLE_SCRIPT_URL?.trim() || "https://plausible.io/js/script.js";
  try {
    return new URL(scriptUrl).origin;
  } catch {
    return "https://plausible.io";
  }
}

// Every origin below is grounded in an actual resource this app loads,
// confirmed by grepping the codebase rather than guessed — see each
// directive's own comment. Not nonce-based: nonces need every page to
// render dynamically (Next's CSP guide, "Static vs Dynamic Rendering"),
// a much bigger change than this header deserves on its own.
function contentSecurityPolicy(): string {
  const plausible = plausibleOrigin();
  const isDev = process.env.NODE_ENV === "development";
  const directives = [
    "default-src 'self'",
    // 'unsafe-inline': the GA config snippet embeds a per-deploy measurement
    // ID (googleAnalyticsScripts, src/app/[locale]/layout.tsx) generated
    // fresh per request, so it can't be hashed like a static asset; nonces
    // are the alternative but require dynamic rendering everywhere (see
    // above). googletagmanager.com loads gtag.js itself; the Plausible
    // origin loads its tracking script.
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com ${plausible}${isDev ? " 'unsafe-eval'" : ""}`,
    // 'unsafe-inline': five components use inline style={{}} props (grepped
    // for `style={{` across src/), which CSP's style-src-attr governs the
    // same way as script-src-attr above.
    "style-src 'self' 'unsafe-inline'",
    // blob: — the logo-crop preview (URL.createObjectURL in
    // partner-listing-form.tsx). data: — a few inline SVG placeholders
    // (src/components/ui/field.tsx). Nothing else: every business photo and
    // logo, including ones sourced from Google Places, is proxied through
    // this app's own /api/directory-images/* routes (see
    // listingLogoUrl/listingImageUrl in src/lib/directory.ts) — never linked
    // to an external host directly, so no external image origin is needed.
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // Where gtag.js and Plausible's script actually send their beacons.
    `connect-src 'self' https://www.google-analytics.com ${plausible}`,
    // Exactly the five video providers toEmbeddableVideoUrl
    // (src/lib/directory.ts) embeds, plus google.com for the "visit" page's
    // Maps embed (src/app/[locale]/[slug]/visit/page.tsx).
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.dailymotion.com https://www.facebook.com https://www.tiktok.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Matches X-Frame-Options: SAMEORIGIN below, not the stricter 'none' —
    // this app never needs to be framed by *another* origin, but nothing
    // rules out framing itself.
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}

// Sitewide response headers an SEO/security audit checks for that Next.js
// doesn't set on its own.
const SECURITY_HEADERS = [
  // HTTPS-only is already true in production (see Cloudflare/LiteSpeed in
  // front of this app) — this just tells browsers to enforce it themselves
  // too, including on subdomains, without re-checking on every request.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Superseded by CSP's frame-ancestors in browsers that support it, but
  // still worth sending for the ones that don't — this app never needs to
  // be framed by another origin.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables browser features this app never uses (confirmed no
  // navigator.geolocation/getUserMedia calls anywhere in src/) rather than
  // leaving them at the browser's own default-on posture.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async rewrites() {
    return [
      {
        // Browsers, link-preview bots, and some crawlers request
        // /favicon.ico regardless of the <link rel="icon"> tags in <head>,
        // so this 404ed on every page load. Serve the same PNG Next already
        // exposes at /icon.png (from src/app/icon.png) there instead.
        source: "/favicon.ico",
        destination: "/icon.png",
      },
    ];
  },
  experimental: {
    serverActions: {
      // Default is 1mb. A listing logo upload can be up to 3MB (see
      // MAX_PHOTO_BYTES in src/lib/photo.ts), which the Server Action's own
      // FormData encoding inflates by ~4/3 once base64-encoded — comfortably
      // covered with headroom.
      bodySizeLimit: "8mb",
    },
    // Both the "Collecting page data" and "Generating static pages" build
    // phases spawn one worker *process* per experimental.cpus (see
    // getNumberOfWorkers in next/dist/build/index.js), which defaults to
    // the host's *reported* CPU count (os.cpus().length) — on shared
    // hosting that's typically the whole physical box's core count, not
    // what this account's resource limits (CloudLinux LVE, on a cPanel
    // host) actually allow it to use concurrently. Left at that default,
    // a build can try to spawn a worker per reported core, get refused past
    // the account's real thread/process ceiling ("OS can't spawn worker
    // thread: Resource temporarily unavailable"), and crash outright.
    // Pinning this low keeps worker count independent of whatever core
    // count the host happens to report.
    cpus: 2,
  },
  ...(root ? { turbopack: { root } } : {}),
};

export default nextConfig;
