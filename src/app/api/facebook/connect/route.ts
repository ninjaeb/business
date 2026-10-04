import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { buildFacebookAuthUrl, isFacebookAuthConfigured, signFacebookOAuthState } from "@/lib/auth/facebook";
import { getVerifiedPartnerOrNull } from "@/lib/auth/dal";
import { getOwnedListing } from "@/lib/directory";
import { getSiteOrigin } from "@/lib/site-url";

const STATE_COOKIE = "facebook_oauth_state";

// Kicked off by the "Connect Facebook Page" button on the post composer
// (/business-portal/posts) — a same-origin form POST naming which listing
// the connection is for, same CSRF-cookie shape as /api/auth/google, but
// starting from an already-authenticated business-portal page rather than
// the public signup/login forms.
export async function POST(request: Request) {
  if (!isFacebookAuthConfigured()) {
    return new NextResponse("Facebook isn't configured on this deployment.", { status: 501 });
  }

  const partner = await getVerifiedPartnerOrNull();
  if (!partner) {
    return new NextResponse("Sign in as a business to connect a Facebook Page.", { status: 401 });
  }

  const formData = await request.formData();
  const listingId = String(formData.get("listingId") || "");
  const listing = listingId ? await getOwnedListing(listingId, partner.id) : null;
  if (!listing) {
    return new NextResponse("Listing not found.", { status: 404 });
  }

  const nonce = randomBytes(16).toString("hex");
  const state = await signFacebookOAuthState({ nonce, listingId });
  const siteOrigin = await getSiteOrigin();
  const redirectUri = `${siteOrigin}/api/facebook/callback`;

  const response = NextResponse.redirect(buildFacebookAuthUrl({ redirectUri, state }));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
