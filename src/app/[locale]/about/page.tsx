import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ChevronDown, Factory, MapPin, Tags } from "lucide-react";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryAboutPath, directorySignupPath } from "@/lib/directory-i18n";
import { DIRECTORY_ABOUT_COPY } from "@/lib/directory-about-copy";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildDirectoryOrganizationJsonLd,
  buildFaqJsonLd,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { countListingsByCategory, countListingsByCityState, countListingsByIndustry, loadPublishedListings } from "@/lib/directory";
import { getSiteOrigin } from "@/lib/site-url";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const siteOrigin = await getSiteOrigin();
  const copy = DIRECTORY_ABOUT_COPY[resolved];
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[resolved];
  const title = `${copy.seoTitle} | ${siteName}`;
  const url = `${siteOrigin}${directoryAboutPath(resolved)}`;
  const shareImage = directoryShareImage(siteOrigin, resolved);
  return {
    title,
    description: copy.seoDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, directoryAboutPath),
    },
    robots: DIRECTORY_ROBOTS,
    openGraph: {
      title,
      description: copy.seoDescription,
      url,
      siteName,
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[resolved],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: copy.seoDescription,
      images: [shareImage],
    },
  };
}

// One icon per item, cycling by position within its own group — the copy
// file (directory-about-copy.ts) deliberately stays icon-agnostic (it's
// translated content, not presentation), so this is the one place that maps
// "which item" to "which lucide icon". Purely decorative, so a group with
// more items than icons here just repeats the cycle.
const GROUP_ITEM_ICONS = [Building2, Tags, Factory] as const;

export default async function DirectoryAboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const t = DIRECTORY_STRINGS[resolved];
  const copy = DIRECTORY_ABOUT_COPY[resolved];
  const signupHref = directorySignupPath(resolved);
  const siteOrigin = await getSiteOrigin();

  // The stats strip under the hero is computed live, not hardcoded — same
  // loadPublishedListings()/countListingsBy* calls the home page already
  // makes (src/app/[locale]/page.tsx), so these four numbers are always
  // exactly what's actually live on the directory right now.
  const rows = await loadPublishedListings();
  const stats = [
    { value: rows.length, label: copy.statsListingsLabel, icon: Building2 },
    { value: countListingsByCategory(rows).size, label: copy.statsCategoriesLabel, icon: Tags },
    { value: countListingsByIndustry(rows).size, label: copy.statsIndustriesLabel, icon: Factory },
    { value: countListingsByCityState(rows).size, label: copy.statsLocationsLabel, icon: MapPin },
  ];

  return (
    <div className="w-full px-4 py-16 sm:px-8 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildDirectoryOrganizationJsonLd(siteOrigin) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildFaqJsonLd(copy.faqs) }} />

      {/* Hero — a soft petrol/led radial wash behind bold, large-scale type,
          the one deliberately new visual move this page introduces (every
          other public page still uses the plainer text-3xl/sm:text-4xl
          hero). isolate + -z-10 keeps the gradient from ever intercepting
          clicks on the content stacked above it. */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-soft sm:px-12 sm:py-24 dark:border-neutral-800 dark:bg-neutral-900">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-led-soft)_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_var(--color-led-soft-dark)_0%,_transparent_60%)]"
        />
        <p className="text-sm font-semibold uppercase tracking-wide text-petrol dark:text-petrol-light">{copy.heroEyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100">
          {copy.heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{copy.heroSubtitle}</p>
      </section>

      {/* Stats strip — real, live counts (see above), not placeholder
          numbers. Big bold figures read at a glance, same "number first,
          label underneath" shape the reference uses for its own stats
          block. */}
      <section aria-label={copy.statsHeading} className="mx-auto -mt-10 max-w-5xl px-2 sm:-mt-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Icon className="mx-auto h-5 w-5 text-petrol dark:text-petrol-light" aria-hidden="true" />
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {value.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-20 max-w-5xl space-y-16">
        {copy.groups.map((group) => (
          <section key={group.heading} aria-labelledby={`about-${group.heading}`}>
            <h2 id={`about-${group.heading}`} className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {group.heading}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item, itemIndex) => {
                const Icon = GROUP_ITEM_ICONS[itemIndex % GROUP_ITEM_ICONS.length];
                return (
                  <Card key={item.title} className="rounded-2xl shadow-soft">
                    <CardBody>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-led-soft dark:bg-led-soft-dark">
                        <Icon className="h-4 w-4 text-petrol dark:text-petrol-light" aria-hidden="true" />
                      </span>
                      <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}

        {/* FAQ — same native <details>/<summary> accordion already used on
            the home page (directory-home-sections.tsx), paired with its own
            FAQPage JSON-LD above rather than home's directory-wide one. */}
        <section aria-labelledby="about-faq">
          <h2 id="about-faq" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {copy.faqHeading}
          </h2>
          <div className="mt-6 space-y-2">
            {copy.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-slate-200 px-4 py-3 dark:border-neutral-800"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-base font-semibold text-slate-900 marker:content-none dark:text-slate-100">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <section className="relative mx-auto mt-20 max-w-3xl overflow-hidden rounded-3xl bg-led-soft p-10 text-center shadow-soft sm:p-14 dark:bg-led-soft-dark">
        <h2 className="text-2xl font-semibold tracking-tight text-petrol-ink sm:text-3xl dark:text-petrol-light">
          {copy.ctaHeading}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-700 dark:text-slate-300">{copy.ctaBody}</p>
        <Link
          href={signupHref}
          className={buttonClasses(
            "primary",
            "md",
            "mt-6 h-11 bg-led px-6 text-base text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led",
          )}
        >
          {t.listBusinessCta}
        </Link>
      </section>
    </div>
  );
}
