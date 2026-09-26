import { notFound, permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { directorySignupPath } from "@/lib/directory-i18n";

// Superseded by the bare /[locale]/signup route (see directorySignupPath's
// own comment in directory-i18n.ts) — kept only so an old bookmark or
// indexed link to this URL still lands somewhere real instead of 404ing.
export default async function LegacyBusinessSignupRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  permanentRedirect(directorySignupPath(resolved));
}
