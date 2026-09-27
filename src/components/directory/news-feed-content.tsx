import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  directoryHomePath,
  directoryListingNewsPath,
  directoryListingPromotionsPath,
  directoryNewsPath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd, loadLatestListingUpdates } from "@/lib/directory";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { stripMarkdownLiteToPlainText } from "@/lib/markdown-lite";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingLogo } from "@/components/directory/listing-logo";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

// Same dateline formatting as the listing page's own updates card (see
// formatUpdatePostedAt in src/app/[locale]/[slug]/page.tsx) — kept as its
// own tiny copy rather than a shared export, since it's a one-line
// Intl.DateTimeFormat call with nothing else to factor out.
function formatUpdatePostedAt(postedAt: string, locale: DirectoryLocale): string {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${postedAt}T00:00:00`),
  );
}

// A directory-wide feed of every still-current update (news post, or
// promotion that hasn't ended) across published listings — sources the same
// PartnerListing.updates JSON field the listing's own page already renders
// (see loadLatestListingUpdates). No separate PartnerPromotion model or
// moderation queue: an update is already partner-authored, English-only
// content that only reaches this feed once its listing itself is approved
// and published — the same trust boundary every other public page relies on.
export async function buildNewsFeedMetadata(locale: DirectoryLocale): Promise<Metadata> {
  const siteOrigin = await getSiteOrigin();
  const t = DIRECTORY_STRINGS[locale];
  const url = `${siteOrigin}${directoryNewsPath(locale)}`;
  const shareImage = directoryShareImage(siteOrigin, locale);

  return {
    title: `${t.updatesHeading} | ${DIRECTORY_SITE_NAME_BY_LOCALE[locale]}`,
    description: t.newsFeedDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, (code) => directoryNewsPath(code)),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title: t.updatesHeading,
      description: t.newsFeedDescription,
      url,
      siteName: DIRECTORY_SITE_NAME_BY_LOCALE[locale],
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[locale],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t.updatesHeading,
      description: t.newsFeedDescription,
      images: [shareImage],
    },
  };
}

export async function NewsFeedContent({ locale }: { locale: DirectoryLocale }) {
  const [siteOrigin, entries] = await Promise.all([getSiteOrigin(), loadLatestListingUpdates(locale)]);
  const t = DIRECTORY_STRINGS[locale];
  const pageUrl = `${siteOrigin}${directoryNewsPath(locale)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.updatesHeading, url: pageUrl },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.updatesHeading}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.newsFeedDescription}</p>

        {entries.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={Megaphone} title={t.newsFeedEmptyTitle} description={t.newsFeedEmptyDescription} />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {entries.map((entry, index) => (
              <li key={`${entry.listingSlug}-${index}`}>
                {/* A plain-text preview, not the full renderMarkdownLite body
                    — the whole card is itself a Link to the listing page, and
                    a partner's post can embed its own [text](url) link, which
                    would otherwise nest an <a> inside this one. The full
                    formatted post (bold/lists/images) is what the listing
                    page's own updates card renders. */}
                <Link
                  href={
                    entry.update.kind === "PROMOTION"
                      ? directoryListingPromotionsPath(locale, entry.listingSlug)
                      : directoryListingNewsPath(locale, entry.listingSlug)
                  }
                  className="block"
                >
                  <Card className="transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
                    <CardBody className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ListingLogo name={entry.companyName} logoUrl={entry.logoUrl} size={28} loading="lazy" className="h-7 w-7 text-xs" />
                        <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{entry.companyName}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={
                            entry.update.kind === "PROMOTION"
                              ? "bg-led text-led-ink ring-0"
                              : "bg-slate-100 text-slate-600 ring-0 dark:bg-neutral-800 dark:text-slate-300"
                          }
                        >
                          {entry.update.kind === "PROMOTION" ? t.promotionLabel : t.newsLabel}
                        </Badge>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{entry.update.title}</h3>
                        {entry.update.postedAt && (
                          <time dateTime={entry.update.postedAt} className="text-xs text-slate-400">
                            {formatUpdatePostedAt(entry.update.postedAt, locale)}
                          </time>
                        )}
                      </div>
                      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                        {stripMarkdownLiteToPlainText(entry.update.body)}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
