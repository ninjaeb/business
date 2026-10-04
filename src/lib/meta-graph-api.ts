// Shared by every Meta Graph API integration this app has — WhatsApp
// Business Platform sending (src/lib/whatsapp.ts) and Facebook Page posting
// (src/lib/facebook.ts) both call the same graph.facebook.com endpoint
// family, just different node types (a phone number vs. a Page). One
// pinned version across both, rather than each integration tracking its
// own, so bumping it is a one-line change.
export const GRAPH_API_VERSION = "v21.0";
export const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
