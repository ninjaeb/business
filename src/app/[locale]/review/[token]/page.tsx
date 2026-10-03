import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link2Off } from "lucide-react";
import { resolveDirectoryLocale } from "@/lib/directory-locale";
import { getTestimonialRequestLinkForForm } from "@/lib/testimonial-request-links";
import { listingLogoPath } from "@/lib/directory";
import { DIRECTORY_STRINGS } from "@/lib/directory-i18n";
import { isAiConfigured } from "@/lib/ai/client";
import { StandaloneTestimonialForm } from "@/components/directory/standalone-testimonial-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

// A personal, single-use link sent to one specific customer — never meant
// to be crawled or show up in search results, unlike every other page
// under [locale] (which all opt INTO indexing explicitly).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = resolveDirectoryLocale(locale);
  if (!resolved) return {};
  return { robots: { index: false, follow: false } };
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
      googleReviewUrl={request.listing.googleReviewUrl}
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
