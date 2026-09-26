import { notFound, permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { categoryPath } from "@/lib/directory-category-labels";

// Superseded by the bare /[locale]/category/<slug> route (see categoryPath's
// own comment in directory-category-labels.ts) — kept only so an old
// bookmark or indexed link to this URL still lands somewhere real instead
// of 404ing.
export default async function LegacyBusinessCategoryRedirect({
  params,
}: {
  params: Promise<{ locale: string; categorySlug: string }>;
}) {
  const { locale, categorySlug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  permanentRedirect(categoryPath(categorySlug, resolved));
}
