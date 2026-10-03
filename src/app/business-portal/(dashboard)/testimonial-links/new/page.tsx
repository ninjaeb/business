import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listPartnerListings, servicesFromJson } from "@/lib/directory";
import { createTestimonialRequestLink } from "@/app/actions/testimonial-request-links";
import { TestimonialRequestLinkForm } from "@/components/business-crm/testimonial-request-link-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default async function NewTestimonialRequestLinkPage() {
  const user = await requireCompletePartnerProfile();
  const listings = await listPartnerListings(user.id);

  // Parsed here, server-side, rather than handing the form's "use client"
  // component the raw listings and letting it call servicesFromJson itself
  // — that function lives in @/lib/directory, whose own top-level `db`
  // import can't be bundled for the browser (see that module's own comment
  // on why every client import from it must be type-only).
  const listingOptions = listings.map((listing) => ({
    id: listing.id,
    companyName: listing.companyName,
    services: servicesFromJson(listing.services),
  }));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Review links", href: "/business-portal/testimonial-links" }, { label: "New link" }]}
        title="New review link"
      />
      <Card>
        <CardBody>
          <TestimonialRequestLinkForm action={createTestimonialRequestLink} listings={listingOptions} />
        </CardBody>
      </Card>
    </div>
  );
}
