import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listPartnerListings } from "@/lib/directory";
import { requestBusinessPartner } from "@/app/actions/business-partners";
import { BusinessPartnerRequestForm } from "@/components/business-crm/business-partner-request-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default async function NewBusinessPartnerRequestPage() {
  const user = await requireCompletePartnerProfile();
  const listings = await listPartnerListings(user.id);
  const listingOptions = listings.map((listing) => ({ id: listing.id, companyName: listing.companyName }));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Business Partners", href: "/business-portal/business-partners" }, { label: "Add business partner" }]}
        title="Add business partner"
      />
      <Card>
        <CardBody>
          <BusinessPartnerRequestForm action={requestBusinessPartner} listings={listingOptions} />
        </CardBody>
      </Card>
    </div>
  );
}
