import { NextResponse, type NextRequest } from "next/server";
import { loadDirectorySearchIndex } from "@/lib/directory";
import { DEFAULT_DIRECTORY_LOCALE } from "@/lib/directory-i18n";
import { resolveDirectoryLocale } from "@/lib/directory-locale";

// The header search bar's index (see HeaderSearch) as a plain, cacheable
// GET rather than a Server Action. It's public, read-only data with no form
// behind it, so nothing an action offers applies and everything a GET
// offers does: the browser caches it (see Cache-Control below), so moving
// between pages within a visit doesn't fetch it again, and it isn't queued
// behind a page's other in-flight actions the way Server Actions are with
// each other. On the shared host this runs on, a Server Action's POST
// through the front proxy also measured about a second slower than a
// comparable GET, every time.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const locale = resolveDirectoryLocale(request.nextUrl.searchParams.get("locale") ?? "") ?? DEFAULT_DIRECTORY_LOCALE;
  const index = await loadDirectorySearchIndex(locale);
  // Five minutes: a suggestions dropdown may lag a just-approved or
  // just-unpublished listing by that much — the "see all results" page it
  // hands off to is always fresh — in exchange for one fetch per visit
  // rather than one per page.
  return NextResponse.json(index, { headers: { "Cache-Control": "public, max-age=300" } });
}
