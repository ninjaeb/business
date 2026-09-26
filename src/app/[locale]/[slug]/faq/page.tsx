import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { getPublishedListingBySlug, resolveListingDisplay } from "@/lib/directory";
import { buildFaqJsonLd, buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingFaqPath, directoryListingPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

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
    pageUrl: `${siteOrigin}${directoryListingFaqPath(resolved, slug)}`,
    pathFor: (code) => directoryListingFaqPath(code, slug),
    sectionHeading: t.faqHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

export default async function FaqPage({
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
  if (display.faqs.length === 0) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildFaqJsonLd(display.faqs) }} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.faqHeading}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          {display.faqs.map((faq, index) => (
            <details key={index} className="group rounded-md border border-slate-200 px-3 py-2 dark:border-neutral-800">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-base font-semibold text-slate-900 marker:content-none dark:text-slate-100">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{faq.answer}</p>
            </details>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
