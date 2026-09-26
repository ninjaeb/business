import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { buildIndustryMetadata, IndustryPageContent } from "@/components/directory/industry-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; industrySlug: string }>;
}): Promise<Metadata> {
  const { locale, industrySlug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  return buildIndustryMetadata(industrySlug, resolved);
}

// Same reasoning as the category/location routes' own force-dynamic:
// listings change by hand approval, not on a schedule, but a plain Prisma
// read carries no dynamic signal of its own without this.
export const dynamic = "force-dynamic";

export default async function DirectoryIndustryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; industrySlug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ locale, industrySlug }, { q }] = await Promise.all([params, searchParams]);
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  return <IndustryPageContent industrySlug={industrySlug} locale={resolved} q={q ?? ""} />;
}
