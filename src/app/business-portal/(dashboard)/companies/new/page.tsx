import { createPartnerCompany } from "@/app/actions/partner-companies";
import { PartnerCompanyForm } from "@/components/business-crm/partner-company-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalCompaniesStrings } from "@/lib/portal-companies-i18n";

export default async function NewPartnerCompanyPage() {
  const [, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalCompaniesStrings(locale);
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t.companiesTitle, href: "/business-portal/companies" }, { label: t.newCompanyCta }]}
        title={t.newCompanyCta}
      />
      <Card>
        <CardBody>
          <PartnerCompanyForm action={createPartnerCompany} submitLabel={t.createCompanySubmitLabel} locale={locale} />
        </CardBody>
      </Card>
    </div>
  );
}
