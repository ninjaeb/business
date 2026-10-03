import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updatePartnerCompany } from "@/app/actions/partner-companies";
import { PartnerCompanyForm } from "@/components/business-crm/partner-company-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { formatEditCompanyTitle, getPortalCompaniesStrings } from "@/lib/portal-companies-i18n";

export default async function EditPartnerCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalCompaniesStrings(locale);
  const { id } = await params;
  const company = await db.partnerCompany.findFirst({ where: { id, partnerId: user.id } });
  if (!company) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: t.companiesTitle, href: "/business-portal/companies" },
          { label: company.name, href: `/business-portal/companies/${company.id}` },
          { label: t.editBreadcrumb },
        ]}
        title={formatEditCompanyTitle(t.editCompanyTitleTemplate, company.name)}
      />
      <Card>
        <CardBody>
          <PartnerCompanyForm action={updatePartnerCompany.bind(null, company.id)} company={company} locale={locale} />
        </CardBody>
      </Card>
    </div>
  );
}
