import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  INDUSTRY_LABELS_BY_LOCALE,
  directoryAboutPath,
  directoryGuidePath,
  directoryGuidesPath,
  directoryHomePath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd } from "@/lib/directory";
import { buildGuideJsonLd } from "@/lib/directory-seo";
import { listPublishedGuidesByIndustry, resolveGuideDisplay } from "@/lib/directory-guides";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import { formatDate } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/badge";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import type { Industry } from "@/generated/prisma/client";

type Guide = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  industry: Industry | null;
  publishedAt: Date | null;
  updatedAt: Date;
  translations: unknown;
};

// A guide's own detail page — top-level (not nested under a listing's own
// layout the way About/Products/FAQ are), so this owns its full chrome:
// breadcrumbs, H1, and a "Related guides" rail once the industry pages
// have somewhere to link back from (see listPublishedGuidesByIndustry) —
// the actual pillar-to-cluster link this content type exists to make, not
// just a page that happens to exist.
export async function GuideDetailContent({ guide, locale }: { guide: Guide; locale: DirectoryLocale }) {
  const display = resolveGuideDisplay(guide, locale);
  const [siteOrigin, relatedGuides] = await Promise.all([
    getSiteOrigin(),
    guide.industry ? listPublishedGuidesByIndustry(guide.industry, locale, { excludeId: guide.id }) : Promise.resolve([]),
  ]);
  const t = DIRECTORY_STRINGS[locale];
  const pageUrl = `${siteOrigin}${directoryGuidePath(locale, guide.slug)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.guidesIndexHeading, url: `${siteOrigin}${directoryGuidesPath(locale)}` },
    { name: display.title, url: pageUrl },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildGuideJsonLd({ ...guide, ...display }, siteOrigin, pageUrl) }}
      />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />

        <Eyebrow className="mt-4">
          <BookOpen className="h-3.5 w-3.5" />
          {t.guidesIndexHeading}
        </Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">{display.title}</h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{display.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-slate-200 py-4 dark:border-neutral-800">
          <Link
            href={directoryAboutPath(locale)}
            className="text-sm font-semibold text-slate-700 hover:text-petrol dark:text-slate-200 dark:hover:text-petrol-light"
          >
            {t.guideByLabel}
          </Link>
          {guide.industry && (
            <span className="text-xs font-medium text-petrol dark:text-petrol-light">
              {INDUSTRY_LABELS_BY_LOCALE[locale][guide.industry]}
            </span>
          )}
          {guide.publishedAt && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t.guidePublishedOnLabel} {formatDate(guide.publishedAt)}
            </span>
          )}
          {/* Same freshness signal buildGuideJsonLd's own dateModified
              already gives a crawler, now visible to a reader too — only
              once updatedAt has actually moved past publishedAt by more
              than the publish action's own datePublished/updatedAt skew
              (two separate now() calls in the same request; see
              publishGuideAction), so a guide that's never been revised
              since it first went live doesn't show a redundant second date
              a few milliseconds after the first. */}
          {guide.publishedAt && guide.updatedAt.getTime() - guide.publishedAt.getTime() > 60_000 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t.guideUpdatedOnLabel} {formatDate(guide.updatedAt)}
            </span>
          )}
        </div>

        <div className="mt-8 text-base text-slate-600 dark:text-slate-300">
          {renderMarkdownLite(display.body, undefined, { zoomableImages: true })}
        </div>

        {relatedGuides.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8 dark:border-neutral-800">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{t.guideRelatedHeading}</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedGuides.map((related) => (
                <li key={related.id}>
                  <Link href={directoryGuidePath(locale, related.slug)} className="block h-full">
                    <Card className="h-full transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
                      <CardBody className="space-y-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{related.title}</h3>
                        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{related.excerpt}</p>
                      </CardBody>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
