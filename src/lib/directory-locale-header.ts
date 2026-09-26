// The directory's language lives in a URL segment (/en|/zh|/ms, see
// directoryHomePath/directoryListingPath) below the root layout — and only
// the root layout renders <html lang>. src/proxy.ts copies the segment into
// this request header so the root layout can read it; nothing else should.
// Kept free of any next/* import so the proxy can pull it in cheaply.
export const DIRECTORY_LOCALE_HEADER = "x-directory-locale";

// Every directory page lives under one of these three locale segments —
// /en/business/..., or a listing's own bare /en/<slug> (see
// directoryListingPath) — so a leading locale segment alone identifies a
// directory URL; nothing else in the app is locale-prefixed this way.
const DIRECTORY_PATH_PATTERN = /^\/(en|zh|ms)(?:\/|$)/;

export function directoryLocaleFromPathname(pathname: string): "en" | "zh" | "ms" | null {
  const match = DIRECTORY_PATH_PATTERN.exec(pathname);
  return match ? (match[1] as "en" | "zh" | "ms") : null;
}
