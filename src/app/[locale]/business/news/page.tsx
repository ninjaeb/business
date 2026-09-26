import { notFound, permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { directoryNewsPath } from "@/lib/directory-i18n";

// Superseded by the bare /[locale]/news route — kept only so an old
// bookmark or indexed link to this URL still lands somewhere real instead
// of 404ing.
export default async function LegacyBusinessNewsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  permanentRedirect(directoryNewsPath(resolved));
}
