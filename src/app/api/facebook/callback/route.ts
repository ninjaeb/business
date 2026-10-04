import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeFacebookCode,
  exchangeForLongLivedToken,
  fetchManagedPages,
  isFacebookAuthConfigured,
  verifyFacebookOAuthState,
} from "@/lib/auth/facebook";
import { getVerifiedPartnerOrNull } from "@/lib/auth/dal";
import { getOwnedListing } from "@/lib/directory";
import { saveFacebookConnection } from "@/lib/facebook-connections";
import { getSiteOrigin } from "@/lib/site-url";

const STATE_COOKIE = "facebook_oauth_state";
const RETURN_PATH = "/business-portal/posts";

function failure(siteOrigin: string, code: string) {
  const url = new URL(RETURN_PATH, siteOrigin);
  url.searchParams.set("fbError", code);
  const res = NextResponse.redirect(url);
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(request: NextRequest) {
  const siteOrigin = await getSiteOrigin();

  if (!isFacebookAuthConfigured()) {
    return failure(siteOrigin, "facebook_unavailable");
  }

  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !stateParam || !storedState || stateParam !== storedState) {
    return failure(siteOrigin, "facebook_failed");
  }

  const state = await verifyFacebookOAuthState(stateParam);
  if (!state) {
    return failure(siteOrigin, "facebook_failed");
  }

  // Re-checked rather than trusted from the state alone — the partner
  // could have signed out (or the listing could have been deleted) in the
  // several seconds this flow spends on Facebook's own consent screen.
  const partner = await getVerifiedPartnerOrNull();
  const listing = partner ? await getOwnedListing(state.listingId, partner.id) : null;
  if (!listing) {
    return failure(siteOrigin, "facebook_failed");
  }

  try {
    const redirectUri = `${siteOrigin}/api/facebook/callback`;
    const shortLivedToken = await exchangeFacebookCode(code, redirectUri);
    const longLivedToken = await exchangeForLongLivedToken(shortLivedToken);
    const pages = await fetchManagedPages(longLivedToken);

    if (pages.length === 0) {
      return failure(siteOrigin, "facebook_no_pages");
    }

    // Connects the first Page Facebook returns rather than asking the
    // partner to pick — a deliberate v1 simplification (see
    // FacebookManagedPage's own comment in src/lib/auth/facebook.ts): most
    // small-business accounts manage exactly one Page. A partner who
    // manages several can still reach the one they want by disconnecting
    // and reordering Pages in their own Facebook Business Settings first.
    const page = pages[0];
    await saveFacebookConnection(listing.id, page.id, page.name, page.access_token);

    const url = new URL(RETURN_PATH, siteOrigin);
    url.searchParams.set("fbConnected", page.name);
    const res = NextResponse.redirect(url);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch {
    return failure(siteOrigin, "facebook_failed");
  }
}
