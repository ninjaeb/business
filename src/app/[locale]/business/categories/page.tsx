import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { buildCategoriesIndexMetadata, CategoriesIndexContent } from "@/components/directory/categories-index-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  return buildCategoriesIndexMetadata(resolved);
}

// Counts change the moment an admin approves or unpublishes a listing, with
// no other dynamic signal — same reasoning as the category/location pages.
export const dynamic = "force-dynamic";

export default async function CategoriesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  return <CategoriesIndexContent locale={resolved} />;
}
