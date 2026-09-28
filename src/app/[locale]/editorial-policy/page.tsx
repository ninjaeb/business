import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { directoryEditorialPolicyPath } from "@/lib/directory-i18n";
import { DIRECTORY_EDITORIAL_POLICY_COPY } from "@/lib/directory-editorial-policy-copy";
import {
  DIRECTORY_ROBOTS,
  DIRECTORY_SITE_NAME_BY_LOCALE,
  OG_LOCALE_BY_DIRECTORY_LOCALE,
  buildLanguageAlternates,
  directoryShareImage,
} from "@/lib/directory-seo";
import { getSiteOrigin } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const siteOrigin = await getSiteOrigin();
  const copy = DIRECTORY_EDITORIAL_POLICY_COPY[resolved];
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[resolved];
  const title = `${copy.seoTitle} | ${siteName}`;
  const url = `${siteOrigin}${directoryEditorialPolicyPath(resolved)}`;
  const shareImage = directoryShareImage(siteOrigin, resolved);
  return {
    title,
    description: copy.seoDescription,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(siteOrigin, directoryEditorialPolicyPath),
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

export default async function DirectoryEditorialPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const copy = DIRECTORY_EDITORIAL_POLICY_COPY[resolved];

  return (
    <div className="w-full px-4 py-12 sm:px-8">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-petrol dark:text-petrol-light">{copy.heroEyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">{copy.heroTitle}</h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">{copy.heroSubtitle}</p>
      </section>

      <div className="mx-auto mt-16 max-w-5xl space-y-14">
        {copy.groups.map((group) => (
          <section key={group.heading} aria-labelledby={`editorial-policy-${group.heading}`}>
            <h2 id={`editorial-policy-${group.heading}`} className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {group.heading}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 p-4 dark:border-neutral-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
