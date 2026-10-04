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
    // accounts.google.com/gsi/client — Google Identity Services' own SDK,
    // loaded by TestimonialAuthForm for the visitor "Continue with Google"
    // button (see getPublicGoogleClientId's own comment on why this flow is
    // separate from the partner pages' /api/auth/google redirect, which
    // needs no script-src/frame-src allowance since it's a same-origin form
    // POST followed by a server redirect, not a script this app loads).
    // Allowlisted unconditionally, same reasoning as the Plausible origin
    // above — harmless when GOOGLE_CLIENT_ID is unset, since
    // TestimonialAuthForm only injects the <Script> tag when it's configured.
    // crm.gotka.com/embed/lead-form.js — Gotka's own CRM lead-form widget,
    // embedded on the contact page (src/app/[locale]/contact/page.tsx) in
    // place of a custom-built form. Same-organization origin, not a
    // third-party vendor.
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://accounts.google.com/gsi/client https://crm.gotka.com ${plausible}${isDev ? " 'unsafe-eval'" : ""}`,
    // 'unsafe-inline': five components use inline style={{}} props (grepped
    // for `style={{` across src/), which CSP's style-src-attr governs the
    // same way as script-src-attr above. accounts.google.com/gsi/style —
    // the stylesheet Google Identity Services' own script (see script-src
    // above) loads to style its rendered button.
    "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
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
    // accounts.google.com/gsi/ — Google Identity Services' own status/logging
    // calls, made by the script above from inside TestimonialAuthForm.
    // crm.gotka.com — the lead-form widget's own submission call (script-src
    // comment above); the exact endpoint path isn't ours to pin down, but the
    // origin is first-party.
    `connect-src 'self' https://www.google-analytics.com https://accounts.google.com/gsi/ https://crm.gotka.com ${plausible}`,
    // Exactly the five video providers toEmbeddableVideoUrl
    // (src/lib/directory.ts) embeds, plus google.com for the "visit" page's
    // Maps embed (src/app/[locale]/[slug]/visit/page.tsx). accounts.google.com
    // for Google Identity Services' own button/credential iframe (see
    // script-src above) — GIS renders its branded button and any account
    // chooser inside an iframe from this origin, not just a plain script.
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.dailymotion.com https://www.facebook.com https://www.tiktok.com https://www.google.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    // accounts.google.com — the partner sign-up/login pages' own "Continue
    // with Google" button (business-login-form.tsx, partner-signup-form.tsx)
    // is a plain same-origin form POST to /api/auth/google, which then
    // 302s the browser on to Google's own consent screen. Chrome's
    // form-action enforcement covers that whole redirect chain, not just
    // the form's own literal action attribute — with only 'self' allowed,
    // the 302 to a different origin got treated as itself a form-action
    // violation and silently blocked client-side (no error UI, nothing in
    // the Network tab beyond a cancelled request — only visible in the
    // console as "Refused to send form data ... form-action 'self'"),
    // breaking this button on every page it appears on. accounts.google.com
    // is already trusted elsewhere in this same policy (script-src/connect-
    // src/frame-src, for Google Identity Services' separate JS-SDK flow).
    // www.facebook.com — same exact shape, for the business portal's
    // "Connect Facebook Page" button (src/components/business-crm/
    // post-composer.tsx): a same-origin form POST to /api/facebook/connect,
    // which 302s on to Facebook's own OAuth dialog
    // (facebook.com/v21.0/dialog/oauth — see buildFacebookAuthUrl in
    // src/lib/auth/facebook.ts). Missing here the same way accounts.google.com
    // was missing above, with the identical silent-failure symptom.
    "form-action 'self' https://accounts.google.com https://www.facebook.com",
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
  // Deliberately no `preload`: submitting to browsers' built-in HSTS
  // preload list is a much harder-to-reverse commitment (removal can take
  // months to propagate once shipped) and requires being certain every
  // subdomain under gotka.com will always serve HTTPS — a call the site
  // owner should make explicitly, not something to default to here. A
  // previous PR (#104) added it; reverted per the site owner's explicit
  // call, made before that PR merged.
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
