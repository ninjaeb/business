import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { getPublishedGuideBySlug, resolveGuideDisplay } from "@/lib/directory-guides";
import { buildGuideMetadata } from "@/lib/directory-seo";
import { getSiteOrigin } from "@/lib/site-url";
import { GuideDetailContent } from "@/components/directory/guide-detail-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  const guide = await getPublishedGuideBySlug(slug);
  if (!guide) return {};
  const siteOrigin = await getSiteOrigin();
  return buildGuideMetadata({ guide: { ...guide, ...resolveGuideDisplay(guide, resolved) }, siteOrigin, locale: resolved });
}

export const dynamic = "force-dynamic";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  const guide = await getPublishedGuideBySlug(slug);
  if (!guide) notFound();
  return <GuideDetailContent guide={guide} locale={resolved} />;
}
