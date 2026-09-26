import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { buildNewsFeedMetadata, NewsFeedContent } from "@/components/directory/news-feed-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  return buildNewsFeedMetadata(resolved);
}

// The feed changes the moment a partner edits their listing's updates and
// an admin approves it, with no other dynamic signal — same reasoning as
// every other directory listing page.
export const dynamic = "force-dynamic";

export default async function NewsFeedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();
  return <NewsFeedContent locale={resolved} />;
}
