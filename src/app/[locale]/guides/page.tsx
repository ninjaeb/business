import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { buildGuidesIndexMetadata } from "@/lib/directory-seo";
import { getSiteOrigin } from "@/lib/site-url";
import { GuidesIndexContent } from "@/components/directory/guides-index-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  const siteOrigin = await getSiteOrigin();
  return buildGuidesIndexMetadata(siteOrigin, resolved);
}

export const dynamic = "force-dynamic";

export default async function GuidesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  return <GuidesIndexContent locale={resolved} />;
}
