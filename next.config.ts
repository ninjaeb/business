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

// Sitewide response headers an SEO/security audit checks for that Next.js
// doesn't set on its own. A Content-Security-Policy is deliberately NOT
// included here: this app embeds third-party iframes (YouTube, Vimeo,
// Dailymotion, TikTok, Facebook's video plugin — see toEmbeddableVideoUrl in
// src/lib/directory.ts) and loads Google Places photos, so a CSP tight
// enough to be worth having would need every one of those origins allowlisted
// and testing across the whole app to avoid silently breaking video/image
// embeds in production — worth doing as its own follow-up, not bundled into
// a header pass that should otherwise carry zero functional risk.
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
