import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { buildIndustriesIndexMetadata, IndustriesIndexContent } from "@/components/directory/industries-index-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  return buildIndustriesIndexMetadata(resolved);
}

// Counts change the moment an admin approves or unpublishes a listing, with
// no other dynamic signal — same reasoning as the category/location pages.
export const dynamic = "force-dynamic";

export default async function IndustriesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  return <IndustriesIndexContent locale={resolved} />;
}
