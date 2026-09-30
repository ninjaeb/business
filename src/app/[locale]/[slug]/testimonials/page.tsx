import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublishedListingBySlug } from "@/lib/directory";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingTestimonialsPath, directoryListingPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { isAiConfigured } from "@/lib/ai/client";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { TestimonialList } from "@/components/directory/testimonial-list";
import { WriteTestimonialButton } from "@/components/directory/write-testimonial-button";

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
    pageUrl: `${siteOrigin}${directoryListingTestimonialsPath(resolved, slug)}`,
    pathFor: (code) => directoryListingTestimonialsPath(code, slug),
    sectionHeading: t.testimonialsHeading,
    shareImagePath: `${directoryListingPath(resolved, slug)}/opengraph-image`,
  });
}

// Unlike the other section pages (FAQ, Photos, ...), this page never
// notFound()s on empty content — the "Write a testimonial" button (see
// WriteTestimonialButton, which pops the form itself open in a dialog
// rather than embedding it inline here) needs to stay reachable even for a
// listing with no APPROVED testimonials yet.
export default async function TestimonialsPage({
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
  const testimonials = await db.directoryTestimonial.findMany({
    where: { listingId: listing.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.testimonialsHeading}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.testimonialsIntro}</p>
        {testimonials.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.testimonialsEmpty}</p>
        ) : (
          <TestimonialList testimonials={testimonials} locale={resolved} />
        )}
        <div className="border-t border-slate-200 pt-6 dark:border-neutral-800">
          <WriteTestimonialButton
            slug={slug}
            locale={resolved}
            aiAvailable={isAiConfigured()}
            googleReviewUrl={listing.googleReviewUrl}
            variant="primary"
            className="h-11 w-full text-base bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
          />
        </div>
      </CardBody>
    </Card>
  );
}
