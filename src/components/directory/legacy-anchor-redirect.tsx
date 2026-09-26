"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// #media and #news each used to cover two of this listing's current pages
// (Photo+Video, News+Promotions) — picking just one below is a compromise,
// not a perfect mapping, but a visitor who lands on the wrong one of the
// pair is one tab click away from the other. #about and #contact need no
// entry: both still resolve correctly on this page without moving anywhere.
const LEGACY_HASH_TO_SECTION_PATH: Record<string, string> = {
  "#services": "products-services",
  "#hours": "visit",
  "#media": "photos",
  "#news": "news",
  "#visit": "visit",
  "#faq": "faq",
};

// Old bookmarked/shared links to this listing sometimes carry a "#services"
// (etc.) hash from when its sections were anchors within this one page,
// rather than each its own page the way they are now (see
// src/app/[locale]/[slug]/layout.tsx). A hash never reaches the server, so
// there's no way to redirect before this page paints — only after, once the
// browser's own JS runs here. Rendered only on the About page (the URL
// every old anchor link actually pointed at).
export function LegacyAnchorRedirect({ basePath }: { basePath: string }) {
  const router = useRouter();

  useEffect(() => {
    const section = LEGACY_HASH_TO_SECTION_PATH[window.location.hash];
    if (section) router.replace(`${basePath}/${section}`);
  }, [basePath, router]);

  return null;
}
