import { NextResponse, type NextRequest } from "next/server";
import { getSessionPayload } from "@/lib/session";
import { DIRECTORY_LOCALE_HEADER, directoryLocaleFromPathname } from "@/lib/directory-locale-header";

// Routes logged-out visitors can reach at all under /business-portal or
// /admin. Everything else under those two prefixes needs a session.
const AUTH_ONLY_PUBLIC_ROUTES = ["/business-portal/login"];

// Only ever redirects a sessionless visitor to the login page — never the
// other direction. An *already* signed-in visitor to /business-portal/login
// used to get bounced to /business-portal right here too, on nothing more
// than "a business_session cookie is present" (no database call, so a
// still-valid-looking but stale cookie — its account was deleted, or the
// cookie is simply a stateless JWT good for 30 days with nothing to revoke
// it early — passes this check the same as a genuinely valid one). Since
// /business-portal and /admin both always re-verify against the database
// themselves and bounce anything stale right back to the login page, that
// combination would be an infinite loop with no way to ever reach the login
// form again — so that decision lives in the login page's own layout
// instead (getVerifiedPartnerOrNull), where a database check is cheap (a
// login page is low-traffic) and authoritative. This function's job is only
// keeping a stranger with no session at all out of the dashboard/admin.
async function proxyPrivateRoute(request: NextRequest, pathname: string) {
  const isAuthOnlyPublic = AUTH_ONLY_PUBLIC_ROUTES.includes(pathname);
  const session = await getSessionPayload();

  if (!isAuthOnlyPublic && !session?.userId) {
    return NextResponse.redirect(new URL("/business-portal/login", request.url));
  }
  return NextResponse.next();
}

// Mirrors getDirectoryLocale (src/lib/directory-locale.ts) exactly — same
// cookie name/priority, same Accept-Language fallback — but reads off a
// NextRequest directly instead of next/headers' cookies()/headers(), which
// aren't available in middleware. Only used for the bare "/" redirect
// below; every /[locale]/... directory page resolves its own locale from
// the URL itself once it gets there.
function resolveDirectoryLocaleFromRequest(request: NextRequest): "en" | "zh" | "ms" {
  const cookieValue = request.cookies.get("directory_locale")?.value;
  if (cookieValue === "en" || cookieValue === "zh" || cookieValue === "ms") return cookieValue;

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  if (/\bzh\b/i.test(acceptLanguage)) return "zh";
  if (/\bms\b/i.test(acceptLanguage)) return "ms";
  return "en";
}

// The root layout (src/app/layout.tsx) renders <html lang> from this header
// — the only way a language that lives in a URL segment below it can reach
// the one element that carries it. Set from the path itself and never
// trusted from the client: stripped from any request that didn't arrive at
// a directory URL, so nothing outside the directory can be made to claim a
// language it isn't in.
function withDirectoryLocaleHeader(request: NextRequest, pathname: string) {
  const locale = directoryLocaleFromPathname(pathname);
  if (!locale && !request.headers.has(DIRECTORY_LOCALE_HEADER)) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  if (locale) requestHeaders.set(DIRECTORY_LOCALE_HEADER, locale);
  else requestHeaders.delete(DIRECTORY_LOCALE_HEADER);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The public business directory is the site's front door — a bare "/"
  // always hands off to it. Resolved straight to a locale-prefixed URL here
  // (same cookie/Accept-Language guess as getDirectoryLocale, reimplemented
  // rather than imported since that one calls next/headers' cookies()/
  // headers(), not available on a NextRequest in middleware). A bare locale
  // (/en, /zh, /ms) needs no redirect of its own anymore — it IS the
  // directory home page (src/app/[locale]/page.tsx, see directoryHomePath).
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${resolveDirectoryLocaleFromRequest(request)}`, request.url));
  }

  if (pathname === "/business-portal" || pathname.startsWith("/business-portal/") || pathname === "/admin" || pathname.startsWith("/admin/")) {
    return proxyPrivateRoute(request, pathname);
  }

  // Everything else is either the always-public directory itself or a
  // legacy redirect stub — this app has no separate staff area to gate, so
  // there's nothing else to redirect an unauthenticated visitor away from.
  return withDirectoryLocaleHeader(request, pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js|sitemap.xml|robots.txt|llms.txt).*)",
  ],
};
