import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listPartnerListings } from "@/lib/directory";
import { createBusinessPartnerInvite } from "@/app/actions/business-partners";
import { BusinessPartnerInviteForm } from "@/components/business-crm/business-partner-invite-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default async function NewBusinessPartnerInvitePage() {
  const user = await requireCompletePartnerProfile();
  const listings = await listPartnerListings(user.id);
  const listingOptions = listings.map((listing) => ({ id: listing.id, companyName: listing.companyName }));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Business Partners", href: "/business-portal/business-partners" }, { label: "Invite a business" }]}
        title="Invite a business"
        description="Not every business you work with is on the directory yet — invite them by email and WhatsApp."
      />
      <Card>
        <CardBody>
          <BusinessPartnerInviteForm action={createBusinessPartnerInvite} listings={listingOptions} />
        </CardBody>
      </Card>
    </div>
  );
}
