import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listPartnerListings } from "@/lib/directory";
import { requestBusinessPartner } from "@/app/actions/business-partners";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalBusinessPartnersStrings } from "@/lib/portal-business-partners-i18n";
import { BusinessPartnerRequestForm } from "@/components/business-crm/business-partner-request-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default async function NewBusinessPartnerRequestPage() {
  const [user, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalBusinessPartnersStrings(locale);
  const listings = await listPartnerListings(user.id);
  const listingOptions = listings.map((listing) => ({ id: listing.id, companyName: listing.companyName }));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t.inviteBreadcrumbParent, href: "/business-portal/business-partners" }, { label: t.newBreadcrumbCurrent }]}
        title={t.newPageTitle}
      />
      <Card>
        <CardBody>
          <BusinessPartnerRequestForm action={requestBusinessPartner} listings={listingOptions} locale={locale} />
        </CardBody>
      </Card>
    </div>
  );
}
