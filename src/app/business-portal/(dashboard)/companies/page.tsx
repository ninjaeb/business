import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { INDUSTRY_LABELS_BY_LOCALE } from "@/lib/directory-i18n";
import { formatPortalCompanyCount, getPortalCompaniesStrings } from "@/lib/portal-companies-i18n";

export default async function PartnerCompaniesPage() {
  const [user, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalCompaniesStrings(locale);
  const companies = await db.partnerCompany.findMany({
    where: { partnerId: user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { contacts: true, deals: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.companiesTitle}
        description={formatPortalCompanyCount(companies.length, locale)}
        actions={
          <Link href="/business-portal/companies/new" className={buttonClasses()}>
            <Plus className="h-4 w-4" />
            {t.newCompanyCta}
          </Link>
        }
      />

      <Card>
        <CardBody>
          {companies.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t.emptyTitle}
              description={t.emptyDescription}
              action={
                <Link href="/business-portal/companies/new" className={buttonClasses()}>
                  <Plus className="h-4 w-4" />
                  {t.newCompanyCta}
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">{t.columnCompany}</th>
                    <th className="py-2 pr-3 font-medium">{t.columnIndustry}</th>
                    <th className="py-2 pr-3 font-medium">{t.columnContacts}</th>
                    <th className="py-2 pr-3 font-medium">{t.columnDeals}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td className="py-2.5 pr-3">
                        <Link
                          href={`/business-portal/companies/${company.id}`}
                          className="font-medium text-slate-800 hover:text-petrol dark:text-slate-200 dark:hover:text-petrol-light"
                        >
                          {company.name}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {company.industry ? INDUSTRY_LABELS_BY_LOCALE[locale][company.industry] : "—"}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{company._count.contacts}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{company._count.deals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
