import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getSiteOrigin } from "@/lib/site-url";
import {
  DIRECTORY_STRINGS,
  DIRECTORY_HOME_TITLE_BY_LOCALE,
  INDUSTRY_LABELS_BY_LOCALE,
  directoryGuidePath,
  directoryGuidesPath,
  directoryHomePath,
  type DirectoryLocale,
  type DirectoryStrings,
} from "@/lib/directory-i18n";
import { buildBreadcrumbJsonLd } from "@/lib/directory";
import { listPublishedGuides, type DirectoryGuideSummary } from "@/lib/directory-guides";
import { formatDate } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { INDUSTRY_ICONS } from "@/components/directory/listing-card";
import { DirectoryBreadcrumbs } from "@/components/directory/directory-breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

// A guide's industry pill — same white-pill-over-photo treatment
// ListingCard already uses for a listing's own industry badge (icon +
// label, normal-case override of Eyebrow's default uppercase/tinted
// style), reused here so the two content types never visually disagree
// about what "this is an industry badge" looks like.
function GuideIndustryBadge({ guide, locale }: { guide: DirectoryGuideSummary; locale: DirectoryLocale }) {
  if (!guide.industry) return null;
  const Icon = INDUSTRY_ICONS[guide.industry];
  return (
    <Eyebrow className="gap-1.5 bg-white normal-case tracking-normal text-petrol-ink shadow-sm dark:bg-white dark:text-petrol-ink">
      <Icon className="h-3.5 w-3.5" />
      {INDUSTRY_LABELS_BY_LOCALE[locale][guide.industry]}
    </Eyebrow>
  );
}

// The large, single "lead" card and the two smaller "secondary" cards
// beside it share this same image-plus-content split, just at different
// sizes — see GuidesIndexContent's own comment on why they're one
// component rather than two.
function GuideFeaturedCard({
  guide,
  locale,
  t,
  size,
}: {
  guide: DirectoryGuideSummary;
  locale: DirectoryLocale;
  t: DirectoryStrings;
  size: "lg" | "md";
}) {
  const isLg = size === "lg";
  return (
    <Link href={directoryGuidePath(locale, guide.slug)} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30 sm:flex-row">
        {guide.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images/[id], same reasoning as ListingCard's own img tag
          <img
            src={guide.coverImageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className={isLg ? "aspect-video w-full object-cover sm:aspect-auto sm:w-1/2" : "aspect-video w-full object-cover sm:aspect-square sm:w-2/5"}
          />
        )}
        <CardBody className={isLg ? "flex flex-1 flex-col justify-center gap-3 py-8 sm:py-10" : "flex flex-1 flex-col justify-center gap-2"}>
          <div className="flex flex-wrap items-center gap-3">
            <GuideIndustryBadge guide={guide} locale={locale} />
            {guide.publishedAt && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(guide.publishedAt)}</span>
            )}
          </div>
          <h2
            className={
              isLg
                ? "text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100"
                : "text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            }
          >
            {guide.title}
          </h2>
          {isLg && <p className="text-base text-slate-600 dark:text-slate-300">{guide.excerpt}</p>}
          {isLg ? (
            <span className={buttonClasses("secondary", "sm", "mt-2 w-fit")}>
              {t.guideReadMoreLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-1 text-sm font-medium text-petrol dark:text-petrol-light">
              {t.guideReadMoreLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}

// The plain vertical card used for every guide past the first three
// featured ones — image on top, no explicit "read more" (the whole card
// is already the link), matching the reference's own "Latest articles"
// grid treatment.
function GuideGridCard({ guide, locale }: { guide: DirectoryGuideSummary; locale: DirectoryLocale }) {
  return (
    <Link href={directoryGuidePath(locale, guide.slug)} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-petrol/40 dark:hover:border-petrol-light/30">
        {guide.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images/[id], same reasoning as ListingCard's own img tag
          <img src={guide.coverImageUrl} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
        )}
        <CardBody className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <GuideIndustryBadge guide={guide} locale={locale} />
            {guide.publishedAt && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(guide.publishedAt)}</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{guide.title}</h3>
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{guide.excerpt}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

// The pillar-content index — every admin-published guide, newest first. No
// filtering/search (unlike the products/news feeds, this is meant to stay
// small and curated, not grow with every partner's own activity the way
// those do).
//
// Laid out the same way the reference template's own blog index is: one
// large "lead" card, up to two smaller "secondary" cards beside it, and
// everything past that in a plain grid under a "More guides" heading —
// rather than a fixed 1-large-plus-2-medium-plus-pagination shape that
// would only ever half-render with the single guide this directory
// currently publishes. Each section simply doesn't appear once there's
// nothing left to put in it, and the layout fills in on its own as more
// guides are added — no separate "not enough guides yet" case to maintain.
export async function GuidesIndexContent({ locale }: { locale: DirectoryLocale }) {
  const [siteOrigin, guides] = await Promise.all([getSiteOrigin(), listPublishedGuides(locale)]);
  const t = DIRECTORY_STRINGS[locale];
  const pageUrl = `${siteOrigin}${directoryGuidesPath(locale)}`;
  const breadcrumbItems = [
    { name: DIRECTORY_HOME_TITLE_BY_LOCALE[locale], url: `${siteOrigin}${directoryHomePath(locale)}` },
    { name: t.guidesIndexHeading, url: pageUrl },
  ];
  const [lead, ...rest] = guides;
  const secondary = rest.slice(0, 2);
  const remaining = rest.slice(2);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(breadcrumbItems) }} />
      <div className="mx-auto w-full px-4 py-8 sm:w-4/5 sm:px-8">
        <DirectoryBreadcrumbs items={breadcrumbItems} navLabel={t.breadcrumbNavLabel} />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          {t.guidesIndexHeading}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.guidesIndexDescription}</p>

        {!lead ? (
          <div className="mt-8">
            <EmptyState icon={BookOpen} title={t.guidesIndexEmptyTitle} description={t.guidesIndexEmptyDescription} />
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <GuideFeaturedCard guide={lead} locale={locale} t={t} size="lg" />

            {secondary.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {secondary.map((guide) => (
                  <GuideFeaturedCard key={guide.id} guide={guide} locale={locale} t={t} size="md" />
                ))}
              </div>
            )}

            {remaining.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{t.guidesLatestHeading}</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {remaining.map((guide) => (
                    <GuideGridCard key={guide.id} guide={guide} locale={locale} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
