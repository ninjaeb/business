import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { GRAPH_API_BASE } from "@/lib/meta-graph-api";

// "Connect your Facebook Page" for a signed-in partner's own listing — see
// src/app/api/facebook/connect and src/app/api/facebook/callback. Same
// minimal, hand-rolled OAuth shape as src/lib/auth/google.ts (this app has
// no auth library at all), with one real difference: Google's flow signs
// someone *up or in*; this one starts from an already-authenticated
// business-portal page and attaches an external resource (a Facebook Page)
// to a listing the partner already owns, so the state has to carry which
// listing initiated the connect.
const FACEBOOK_OAUTH_VERSION = "v21.0";
const FACEBOOK_AUTH_ENDPOINT = `https://www.facebook.com/${FACEBOOK_OAUTH_VERSION}/dialog/oauth`;

// pages_show_list: list the Pages the user manages (see fetchManagedPages).
// pages_manage_posts: create a post as the Page (see src/lib/facebook.ts).
// Deliberately not pages_read_engagement — this app never reads a Page's
// posts, comments, followers, or insights, only writes to it, and Meta's
// own App Review asks for a real justification (plus a screen recording)
// per permission requested. Claiming a use this app doesn't have is worse
// than not having it: App Review would have nothing honest to demonstrate
// for it.
const FACEBOOK_OAUTH_SCOPE = "pages_show_list,pages_manage_posts";

// Optional — the "Connect Facebook Page" button hides (and the connect
// route refuses to start the flow) when these aren't set, same convention
// as isGoogleAuthConfigured(). Posting itself can still fail downstream of
// a successful connect, for a reason no env var can fix: Meta restricts
// pages_manage_posts to this app's own admins/developers/testers until
// Meta grants App Review (see FacebookPageConnection's own schema comment).
export function isFacebookAuthConfigured(): boolean {
  return Boolean(process.env.FACEBOOK_APP_ID?.trim() && process.env.FACEBOOK_APP_SECRET?.trim());
}

function getStateSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type FacebookOAuthState = {
  nonce: string;
  // Which listing the partner was connecting a Page for when they clicked
  // "Connect Facebook Page" — the callback has no other way to know, since
  // it only gets `code`/`state` back from Facebook, not the original
  // request. Ownership is re-checked against the signed-in partner in the
  // callback itself, never trusted from this alone.
  listingId: string;
};

export async function signFacebookOAuthState(state: FacebookOAuthState): Promise<string> {
  return new SignJWT(state)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getStateSecretKey());
}

export async function verifyFacebookOAuthState(token: string): Promise<FacebookOAuthState | null> {
  try {
    const { payload } = await jwtVerify<FacebookOAuthState>(token, getStateSecretKey(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export function buildFacebookAuthUrl({ redirectUri, state }: { redirectUri: string; state: string }): string {
  const url = new URL(FACEBOOK_AUTH_ENDPOINT);
  url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", FACEBOOK_OAUTH_SCOPE);
  url.searchParams.set("state", state);
  return url.toString();
}

type FacebookTokenResponse = { access_token: string; token_type: string; expires_in?: number };

export async function exchangeFacebookCode(code: string, redirectUri: string): Promise<string> {
  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
  url.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Facebook code exchange failed: ${response.status}`);
  const payload: FacebookTokenResponse = await response.json();
  return payload.access_token;
}

// A code-exchange token is short-lived (~1-2h) — this trades it for a
// long-lived (~60 day) user token, which is in turn what makes the Page
// access tokens fetchManagedPages returns long-lived too (a Page token
// derived from a long-lived user token doesn't expire on its own, only if
// revoked — see Meta's own "Page Access Tokens" docs).
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
  url.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", shortLivedToken);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Facebook token exchange failed: ${response.status}`);
  const payload: FacebookTokenResponse = await response.json();
  return payload.access_token;
}

export type FacebookManagedPage = { id: string; name: string; access_token: string };

// Every Facebook Page the authenticated user is an admin of (the only role
// pages_manage_posts can act through) — src/app/api/facebook/callback
// connects the first one returned rather than asking the partner to pick,
// a deliberate v1 simplification documented on that route: most small
// business accounts manage exactly one Page.
export async function fetchManagedPages(userAccessToken: string): Promise<FacebookManagedPage[]> {
  const url = new URL(`${GRAPH_API_BASE}/me/accounts`);
  url.searchParams.set("access_token", userAccessToken);
  url.searchParams.set("fields", "id,name,access_token");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Facebook Page list fetch failed: ${response.status}`);
  const payload: { data?: FacebookManagedPage[] } = await response.json();
  return payload.data ?? [];
}
