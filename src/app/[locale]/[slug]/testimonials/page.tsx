import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublishedListingBySlug } from "@/lib/directory";
import { buildListingMetadata } from "@/lib/directory-seo";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { DIRECTORY_STRINGS, directoryListingTestimonialsPath, directoryListingPath } from "@/lib/directory-i18n";
import { getSiteOrigin } from "@/lib/site-url";
import { isAiConfigured } from "@/lib/ai/client";
import { getVerifiedTestimonialAuthorOrNull } from "@/lib/auth/dal";
import { getPublicGoogleClientId } from "@/lib/auth/google";
import { getVisitorTestimonialForListing } from "@/lib/testimonials";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { TestimonialList } from "@/components/directory/testimonial-list";
import { WriteTestimonialButton } from "@/components/directory/write-testimonial-button";
import { ShareButton } from "@/components/directory/share-button";

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
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  // `write=1` auto-opens the WriteTestimonialButton dialog below on load —
  // what the "Copy link" button's own URL (see pageUrl) carries, so a happy
  // customer following that link lands straight in the write-a-testimonial
  // form instead of having to find and click the button themselves.
  searchParams: Promise<{ write?: string }>;
}) {
  const [{ locale, slug }, { write }] = await Promise.all([params, searchParams]);
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();

  const t = DIRECTORY_STRINGS[resolved];
  const [siteOrigin, testimonials, visitor] = await Promise.all([
    getSiteOrigin(),
    db.directoryTestimonial.findMany({
      where: { listingId: listing.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { createdAt: "asc" } } },
    }),
    getVerifiedTestimonialAuthorOrNull(),
  ]);
  const existingTestimonial = visitor ? (await getVisitorTestimonialForListing(visitor.id, listing.id)) ?? null : null;
  const pageUrl = `${siteOrigin}${directoryListingTestimonialsPath(resolved, slug)}?write=1`;

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
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{t.testimonialsCta}</p>
          <div className="flex flex-wrap items-center gap-2">
            <WriteTestimonialButton
              slug={slug}
              locale={resolved}
              aiAvailable={isAiConfigured()}
              googleReviewUrl={listing.googleReviewUrl}
              googleClientId={getPublicGoogleClientId()}
              visitor={visitor ? { name: visitor.name } : null}
              existingTestimonial={existingTestimonial}
              variant="primary"
              className="bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
              autoOpen={write === "1"}
            />
            {/* Next to the button rather than folded into WriteTestimonialButton's
                own dialog — this copies/shares this *page's* URL (so it opens
                straight to the write-a-testimonial CTA), which a partner can hand
                a happy customer directly instead of the listing's front page. A
                partner wanting a trackable, per-customer link instead has the
                dedicated /business-portal/testimonial-links flow — this is just
                the quick, ad-hoc "copy my testimonials page" option. */}
            <ShareButton title={listing.companyName} url={pageUrl} label={t.testimonialsCopyLinkLabel} size="md" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
