import { createPartnerDeal } from "@/app/actions/partner-deals";
import { PartnerDealForm } from "@/components/business-crm/partner-deal-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { DEFAULT_PARTNER_CURRENCY } from "@/lib/format";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_DEALS_STRINGS } from "@/lib/portal-deals-i18n";

export default async function NewPartnerDealPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; contactId?: string }>;
}) {
  const user = await requireCompletePartnerProfile();
  const locale = await getDirectoryLocale();
  const t = PORTAL_DEALS_STRINGS[locale];
  const { companyId, contactId } = await searchParams;
  const currency = user.currency ?? DEFAULT_PARTNER_CURRENCY;
  const [companies, contacts] = await Promise.all([
    db.partnerCompany.findMany({ where: { partnerId: user.id }, orderBy: { name: "asc" } }),
    db.partnerContact.findMany({
      where: { partnerId: user.id },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, companyId: true },
    }),
  ]);

  return (
    <div>
      <PageHeader breadcrumbs={[{ label: t.pageTitle, href: "/business-portal/deals" }, { label: t.newDealLabel }]} title={t.newDealLabel} />
      <Card>
        <CardBody>
          <PartnerDealForm
            action={createPartnerDeal}
            companies={companies}
            contacts={contacts}
            defaultCompanyId={companyId}
            defaultContactId={contactId}
            currency={currency}
            locale={locale}
            submitLabel={t.createDealSubmit}
          />
        </CardBody>
      </Card>
    </div>
  );
}
