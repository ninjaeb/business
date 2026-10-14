import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link2Off } from "lucide-react";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { getTestimonialRequestLinkForForm } from "@/lib/testimonial-request-links";
import { listingLogoPath } from "@/lib/directory";
import { DIRECTORY_STRINGS, formatStandaloneTestimonialHeading } from "@/lib/directory-i18n";
import { DIRECTORY_SITE_NAME_BY_LOCALE, OG_LOCALE_BY_DIRECTORY_LOCALE } from "@/lib/directory-seo";
import { getSiteOrigin } from "@/lib/site-url";
import { googleReviewDestination } from "@/lib/google-business-profile";
import { isAiConfigured } from "@/lib/ai/client";
import { StandaloneTestimonialForm } from "@/components/directory/standalone-testimonial-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

// A personal, single-use link sent to one specific customer — never meant
// to be crawled or show up in search results, unlike every other page
// under [locale] (which all opt INTO indexing explicitly), so it stays
// noindex. The title/description/image below are for the other places a
// link like this actually gets seen: the browser tab, and the preview card
// WhatsApp/Facebook/Telegram/email clients build when a business sends it —
// without them that card was blank (just the bare URL), which reads as
// suspicious for a link asking a customer to type something. The preview
// image is this folder's own opengraph-image.tsx, which Next attaches to
// og:image and twitter:image automatically. A used or unknown token gets a
// plain generic title instead of leaking whose link it was.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  const { locale, token } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};

  const t = DIRECTORY_STRINGS[resolved];
  const siteName = DIRECTORY_SITE_NAME_BY_LOCALE[resolved];
  const robots = { index: false, follow: false } as const;
  const request = await getTestimonialRequestLinkForForm(token);
  if (!request) {
    return { title: `${t.standaloneTestimonialInvalidTitle} | ${siteName}`, robots };
  }

  const company = request.listing.companyName;
  const heading = formatStandaloneTestimonialHeading(t.standaloneTestimonialHeading, company);
  const description = formatStandaloneTestimonialHeading(t.standaloneTestimonialMetaDescription, company);
  const siteOrigin = await getSiteOrigin();
  const url = `${siteOrigin}/${resolved}/review/${token}`;
  return {
    title: `${heading} | ${siteName}`,
    description,
    robots,
    openGraph: {
      title: heading,
      description,
      url,
      siteName: company,
      type: "website",
      locale: OG_LOCALE_BY_DIRECTORY_LOCALE[resolved],
    },
    twitter: { card: "summary_large_image", title: heading, description },
  };
}

export default async function StandaloneTestimonialPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) notFound();

  const t = DIRECTORY_STRINGS[resolved];
  const request = await getTestimonialRequestLinkForForm(token);

  // A used, deleted, or invalid token, or one whose listing is no longer
  // published — a normal, expected state (links get reused, listings get
  // taken down), not a 404: this explains what happened rather than
  // showing a generic "page not found".
  if (!request) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={Link2Off}
          title={t.standaloneTestimonialInvalidTitle}
          description={t.standaloneTestimonialInvalidDescription}
        />
      </div>
    );
  }

  return (
    <StandaloneTestimonialForm
      token={request.id}
      locale={resolved}
      slug={request.listing.slug}
      aiAvailable={isAiConfigured()}
      googleReviewUrl={googleReviewDestination(request.listing)}
      listing={{
        companyName: request.listing.companyName,
        logoUrl: request.listing.logoUrl ? listingLogoPath(request.listing.slug, request.listing.publishedAt) : null,
      }}
      serviceTitle={request.serviceTitle}
      prefill={{
        name: request.customerName ?? "",
        company: request.customerCompany ?? "",
        title: request.customerTitle ?? "",
      }}
    />
  );
}
