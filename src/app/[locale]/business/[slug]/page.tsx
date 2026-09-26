import { notFound, permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { directoryListingPath } from "@/lib/directory-i18n";

// Superseded by the bare /[locale]/[slug] route (see directoryListingPath's
// own comment in directory-i18n.ts) — kept only so old bookmarks/indexed
// links to a listing's old /business/<slug> URL still land somewhere real
// instead of 404ing.
export default async function LegacyBusinessListingRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  permanentRedirect(directoryListingPath(resolved, slug));
}
