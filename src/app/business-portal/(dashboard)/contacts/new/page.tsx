import { NewPartnerContactForm } from "@/components/business-crm/new-partner-contact-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_CONTACTS_STRINGS } from "@/lib/portal-contacts-i18n";

export default async function NewPartnerContactPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const user = await requireCompletePartnerProfile();
  const locale = await getDirectoryLocale();
  const t = PORTAL_CONTACTS_STRINGS[locale];
  const { companyId } = await searchParams;
  const companies = await db.partnerCompany.findMany({
    where: { partnerId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t.breadcrumbContacts, href: "/business-portal/contacts" }, { label: t.newContactCta }]}
        title={t.newContactCta}
      />
      <Card>
        <CardBody>
          <NewPartnerContactForm companies={companies} defaultCompanyId={companyId} locale={locale} />
        </CardBody>
      </Card>
    </div>
  );
}
