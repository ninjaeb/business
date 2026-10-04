import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedListingBySlug, isUpdateCurrent, resolveListingDisplay } from "@/lib/directory";
import { getListingPostsAsUpdateEntries } from "@/lib/partner-posts";
import { buildListingMetadata, buildUpdatesJsonLd } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingPath, directoryListingPostsPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateItem } from "@/components/directory/update-item";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) return {};

  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[resolved];
  return buildListingMetadata({
    listing,
    siteOrigin,
    locale: resolved,
    pageUrl: `${siteOrigin}${directoryListingPostsPath(resolved, slug)}`,
    pathFor: (code) => directoryListingPostsPath(code, slug),
    sectionHeading: t.postsHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

// News and Promotion entries together, newest first, one feed — the
// listing's own former News and Promotions tabs merged into one (see
// postsHeading's own comment in directory-i18n.ts), reusing UpdateItem
// unchanged: it already shows each entry's own kind badge, so a mixed feed
// needed no rendering change at all. Both sources (the legacy `updates`
// field, now always empty post-migration, and live PartnerPost rows) merge
// here exactly as they already do on the directory-wide feed.
export default async function PostsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();

  const t = DIRECTORY_STRINGS[resolved];
  const display = resolveListingDisplay(listing, resolved);
  const today = new Date().toISOString().slice(0, 10);
  const livePosts = (await getListingPostsAsUpdateEntries(listing.id)).filter((post) => isUpdateCurrent(post, today));
  const posts = [...display.currentNews, ...display.currentPromotions, ...livePosts].sort((a, b) =>
    (b.postedAt ?? "").localeCompare(a.postedAt ?? ""),
  );
  if (posts.length === 0) notFound();

  const siteOrigin = await getSiteOrigin();
  const pageUrl = `${siteOrigin}${directoryListingPostsPath(resolved, slug)}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildUpdatesJsonLd(posts, siteOrigin, pageUrl) }} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.postsHeading}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {posts.map((update, index) => (
            <UpdateItem key={index} update={update} locale={resolved} />
          ))}
        </CardBody>
      </Card>
    </>
  );
}
