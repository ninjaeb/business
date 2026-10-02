import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  INDUSTRY_LABELS_BY_LOCALE,
  directoryGuidePath,
  directoryGuidesPath,
  directoryHomePath,
  type DirectoryLocale,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd } from "@/lib/directory";
import { listPublishedGuides } from "@/lib/directory-guides";
import { Card, CardBody } from "@/components/ui/card";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

// The pillar-content index — every admin-published guide, newest first. No
// filtering/search (unlike the products/news feeds, this is meant to stay
// small and curated, not grow with every partner's own activity the way
// those do).
export async function GuidesIndexContent({ locale }: { locale: DirectoryLocale }) {
  const [siteOrigin, guides] = await Promise.all([getSiteOrigin(), listPublishedGuides(locale)]);
  const t = DIRECTORY_STRINGS[locale];
  const pageUrl = `${siteOrigin}${directoryGuidesPath(locale)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.guidesIndexHeading, url: pageUrl },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <div className="mx-auto w-full px-4 py-8 sm:w-4/5 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          {t.guidesIndexHeading}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.guidesIndexDescription}</p>

        {guides.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={BookOpen} title={t.guidesIndexEmptyTitle} description={t.guidesIndexEmptyDescription} />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {guides.map((guide) => (
              <li key={guide.id}>
                <Link href={directoryGuidePath(locale, guide.slug)} className="block">
                  <Card className="transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
                    <CardBody className="flex gap-4">
                      {/* Only when the guide's own body happens to embed one
                          (see DirectoryGuideSummary's own comment) — no
                          placeholder box for a guide without one yet, so
                          today's text-only card stays exactly as it was. */}
                      {guide.coverImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images/[id], same reasoning as ListingCard's own img tag
                        <img
                          src={guide.coverImageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-24 w-24 shrink-0 rounded-lg object-cover sm:h-28 sm:w-40"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {guide.industry && (
                          <span className="text-xs font-medium text-petrol dark:text-petrol-light">
                            {INDUSTRY_LABELS_BY_LOCALE[locale][guide.industry]}
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{guide.title}</h3>
                        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{guide.excerpt}</p>
                      </div>
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
