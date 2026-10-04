import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedListingBySlug, isUpdateCurrent, resolveListingDisplay } from "@/lib/directory";
import { getListingPostsAsUpdateEntries } from "@/lib/partner-posts";
import { buildListingMetadata, buildUpdatesJsonLd } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingNewsPath, directoryListingPath } from "@/lib/directory-i18n";
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
    pageUrl: `${siteOrigin}${directoryListingNewsPath(resolved, slug)}`,
    pathFor: (code) => directoryListingNewsPath(code, slug),
    sectionHeading: t.newsLabel,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

export default async function NewsPage({
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
  // Instant posts (see PartnerPost's own schema comment) merge in
  // alongside the listing's own `updates` — newest first across both
  // sources, same as every other "merge two origins, one feed" list in
  // this app (e.g. the directory-wide news feed, NewsFeedContent).
  const today = new Date().toISOString().slice(0, 10);
  const livePosts = (await getListingPostsAsUpdateEntries(listing.id)).filter((post) => post.kind === "NEWS" && isUpdateCurrent(post, today));
  const news = [...display.currentNews, ...livePosts].sort((a, b) => (b.postedAt ?? "").localeCompare(a.postedAt ?? ""));
  if (news.length === 0) notFound();

  const siteOrigin = await getSiteOrigin();
  const pageUrl = `${siteOrigin}${directoryListingNewsPath(resolved, slug)}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildUpdatesJsonLd(news, siteOrigin, pageUrl) }} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.newsLabel}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {news.map((update, index) => (
            <UpdateItem key={index} update={update} locale={resolved} />
          ))}
        </CardBody>
      </Card>
    </>
  );
}
