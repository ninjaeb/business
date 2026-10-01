import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryBenefitsPath, directorySignupPath } from "@/lib/directory-i18n";
import { DIRECTORY_BENEFITS_COPY } from "@/lib/directory-benefits-copy";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
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
  const copy = DIRECTORY_BENEFITS_COPY[resolved];
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[resolved];
  const title = `${copy.seoTitle} | ${siteName}`;
  const url = `${siteOrigin}${directoryBenefitsPath(resolved)}`;
  const shareImage = directoryShareImage(siteOrigin, resolved);
  return {
    title,
    description: copy.seoDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, directoryBenefitsPath),
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

export default async function DirectoryBenefitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const t = DIRECTORY_STRINGS[resolved];
  const copy = DIRECTORY_BENEFITS_COPY[resolved];
  const signupHref = directorySignupPath(resolved);

  return (
    <div className="w-full px-4 py-16 sm:px-8 sm:py-20">
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
        <Link
          href={signupHref}
          className={buttonClasses(
            "primary",
            "md",
            "mt-8 h-11 bg-led px-6 text-base text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led",
          )}
        >
          {t.listBusinessCta}
        </Link>
      </section>

      <div className="mx-auto mt-20 max-w-5xl space-y-16">
        {copy.groups.map((group) => (
          <section key={group.heading} aria-labelledby={`benefits-${group.heading}`}>
            <h2
              id={`benefits-${group.heading}`}
              className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            >
              {group.heading}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Card key={item.title} className="rounded-2xl shadow-soft">
                  <CardBody>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        ))}
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
