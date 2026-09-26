import { notFound, permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";

// Superseded by the bare /[locale]/industry/<slug> route (see industryPath's
// own comment in directory-industry-labels.ts) — kept only so an old
// bookmark or indexed link to this URL still lands somewhere real instead
// of 404ing. Redirects on the raw slug segment rather than round-tripping
// it through findIndustryBySlug/industryPath — an unknown slug 404s on the
// new route exactly as it would have here.
export default async function LegacyBusinessIndustryRedirect({
  params,
}: {
  params: Promise<{ locale: string; industrySlug: string }>;
}) {
  const { locale, industrySlug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  permanentRedirect(`/${resolved}/industry/${industrySlug}`);
}
