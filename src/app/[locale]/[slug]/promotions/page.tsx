import { permanentRedirect } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { directoryListingPostsPath } from "@/lib/directory-i18n";

// News and Promotions merged into one Posts tab (see directoryListingPostsPath's
// own comment) — this route stays only so a link or crawler that indexed it
// before the merge still lands somewhere real, rather than 404ing.
export default async function PromotionsRedirectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale) ?? "en";
  permanentRedirect(directoryListingPostsPath(resolved, slug));
}
