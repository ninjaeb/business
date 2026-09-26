import { notFound, permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { directoryHomePath } from "@/lib/directory-i18n";

// Superseded by the bare /[locale] route (see directoryHomePath's own
// comment in directory-i18n.ts) — kept only so an old bookmark or indexed
// link to this URL still lands somewhere real instead of 404ing. Query
// params (q, industry, category, state, country) carry straight through.
export default async function LegacyBusinessHomeRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const qs = new URLSearchParams(
    Object.entries(query).filter((entry): entry is [string, string] => entry[1] !== undefined),
  ).toString();
  permanentRedirect(`${directoryHomePath(resolved)}${qs ? `?${qs}` : ""}`);
}
