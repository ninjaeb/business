import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listPartnerListings, servicesFromJson } from "@/lib/directory";
import { createTestimonialRequestLink } from "@/app/actions/testimonial-request-links";
import { TestimonialRequestLinkForm } from "@/components/business-crm/testimonial-request-link-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default async function NewTestimonialRequestLinkPage() {
  const user = await requireCompletePartnerProfile();
  const listings = await listPartnerListings(user.id);

  // Every service title across every listing the partner owns, merged into
  // one suggestion list — see TestimonialRequestLinkForm's own comment on
  // why that's fine even for a partner with more than one listing.
  const serviceSuggestions = Array.from(
    new Set(listings.flatMap((listing) => servicesFromJson(listing.services).map((service) => service.title))),
  );

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Review links", href: "/business-portal/testimonial-links" }, { label: "New link" }]}
        title="New review link"
      />
      <Card>
        <CardBody>
          <TestimonialRequestLinkForm action={createTestimonialRequestLink} listings={listings} serviceSuggestions={serviceSuggestions} />
        </CardBody>
      </Card>
    </div>
  );
}
