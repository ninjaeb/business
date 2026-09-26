import { notFound, permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { locationPath } from "@/lib/directory-location-labels";

// Superseded by the bare /[locale]/location/<slug> route (see locationPath's
// own comment in directory-location-labels.ts) — kept only so an old
// bookmark or indexed link to this URL still lands somewhere real instead
// of 404ing.
export default async function LegacyBusinessLocationRedirect({
  params,
}: {
  params: Promise<{ locale: string; stateSlug: string }>;
}) {
  const { locale, stateSlug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  permanentRedirect(locationPath(stateSlug, resolved));
}
