import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Shared by every place that fetches a URL a partner typed in (website
// scraping for AI Auto Create — see website-text.ts — and logo fetching —
// see logo-fetch.ts): anything that could reach this host's own network —
// localhost, a private IP, or a hostname that resolves to one — is refused
// before a single byte is requested, and again on every redirect hop.

function isPrivateIPv4(address: string): boolean {
  const [a, b] = address.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIPv6(address: string): boolean {
  const lower = address.toLowerCase();
  if (lower === "::" || lower === "::1") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateIPv4(mapped[1]) : false;
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPrivateIPv4(address);
  if (version === 6) return isPrivateIPv6(address);
  return true;
}

export async function assertPublicHttpUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) URLs can be fetched.");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Refusing to fetch a local address.");
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new Error("Refusing to fetch a private address.");
    return;
  }
  const addresses = await lookup(host, { all: true });
  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new Error("Refusing to fetch a private address.");
  }
}
