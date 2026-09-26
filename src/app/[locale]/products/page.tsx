import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { buildLatestProductsMetadata, LatestProductsContent } from "@/components/directory/latest-products-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  return buildLatestProductsMetadata(resolved);
}

// The feed changes the moment a partner edits their services and an admin
// approves it, with no other dynamic signal — same reasoning as every other
// directory listing page.
export const dynamic = "force-dynamic";

export default async function LatestProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  return <LatestProductsContent locale={resolved} />;
}
