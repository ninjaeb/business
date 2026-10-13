import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updatePartnerDeal } from "@/app/actions/partner-deals";
import { PartnerDealForm } from "@/components/business-crm/partner-deal-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { DEFAULT_PARTNER_CURRENCY } from "@/lib/format";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_DEALS_STRINGS, formatEditDealTitle } from "@/lib/portal-deals-i18n";

export default async function EditPartnerDealPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletePartnerProfile();
  const locale = await getDirectoryLocale();
  const t = PORTAL_DEALS_STRINGS[locale];
  const { id } = await params;
  const currency = user.currency ?? DEFAULT_PARTNER_CURRENCY;
  const [deal, companies, contacts] = await Promise.all([
    db.partnerDeal.findFirst({ where: { id, partnerId: user.id } }),
    db.partnerCompany.findMany({ where: { partnerId: user.id }, orderBy: { name: "asc" } }),
    db.partnerContact.findMany({
      where: { partnerId: user.id },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, companyId: true },
    }),
  ]);
  if (!deal) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: t.pageTitle, href: "/business-portal/deals" },
          { label: deal.title, href: `/business-portal/deals/${deal.id}` },
          { label: t.editLabel },
        ]}
        title={formatEditDealTitle(deal.title, locale)}
      />
      <Card>
        <CardBody>
          <PartnerDealForm
            action={updatePartnerDeal.bind(null, deal.id)}
            deal={{ ...deal, value: Number(deal.value) }}
            companies={companies}
            contacts={contacts}
            currency={currency}
            locale={locale}
          />
        </CardBody>
      </Card>
    </div>
  );
}
