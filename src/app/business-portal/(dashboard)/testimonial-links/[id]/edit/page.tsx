import { notFound } from "next/navigation";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listPartnerListings, servicesFromJson } from "@/lib/directory";
import { getOwnedTestimonialRequestLink } from "@/lib/testimonial-request-links";
import { updateTestimonialRequestLink } from "@/app/actions/testimonial-request-links";
import { TestimonialRequestLinkForm } from "@/components/business-crm/testimonial-request-link-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default async function EditTestimonialRequestLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletePartnerProfile();
  const { id } = await params;
  const [link, listings] = await Promise.all([getOwnedTestimonialRequestLink(id, user.id), listPartnerListings(user.id)]);
  if (!link) notFound();

  // Same server-side parse as new/page.tsx, for the same reason (see its
  // own comment).
  const listingOptions = listings.map((listing) => ({
    id: listing.id,
    companyName: listing.companyName,
    services: servicesFromJson(listing.services),
  }));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Request Testimonial", href: "/business-portal/testimonial-links" }, { label: "Edit" }]}
        title="Edit Testimonial Request"
      />
      <Card>
        <CardBody>
          <TestimonialRequestLinkForm
            action={updateTestimonialRequestLink.bind(null, link.id)}
            listings={listingOptions}
            initialValues={{
              listingId: link.listingId,
              customerName: link.customerName ?? "",
              customerTitle: link.customerTitle ?? "",
              customerCompany: link.customerCompany ?? "",
              serviceTitles: link.serviceTitle
                ? link.serviceTitle
                    .split(",")
                    .map((title) => title.trim())
                    .filter(Boolean)
                : [],
              note: link.note ?? "",
            }}
            submitLabel="Save changes"
            pendingLabel="Saving…"
          />
        </CardBody>
      </Card>
    </div>
  );
}
