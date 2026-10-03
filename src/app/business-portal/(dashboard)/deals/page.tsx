import Link from "next/link";
import { Handshake, Plus, Trophy, Wallet } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { DEFAULT_PARTNER_CURRENCY, formatCurrency, formatCurrencyExact } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { PARTNER_DEAL_OPEN_STATUSES, PARTNER_DEAL_STATUS_BADGE_CLASSES } from "@/lib/labels";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PARTNER_DEAL_STATUS_LABELS_BY_LOCALE } from "@/lib/directory-i18n";
import { PORTAL_DEALS_STRINGS, formatDealsCountLabel } from "@/lib/portal-deals-i18n";

export default async function PartnerDealsPage() {
  const user = await requireCompletePartnerProfile();
  const locale = await getDirectoryLocale();
  const t = PORTAL_DEALS_STRINGS[locale];
  const statusLabels = PARTNER_DEAL_STATUS_LABELS_BY_LOCALE[locale];
  const currency = user.currency ?? DEFAULT_PARTNER_CURRENCY;
  const deals = await db.partnerDeal.findMany({
    where: { partnerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true } }, contact: { select: { firstName: true, lastName: true } } },
  });

  const open = deals.filter((deal) => PARTNER_DEAL_OPEN_STATUSES.includes(deal.status)).length;
  const won = deals.filter((deal) => deal.status === "CLOSED_WON");
  const wonValue = won.reduce((sum, deal) => sum + Number(deal.value), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pageTitle}
        description={formatDealsCountLabel(deals.length, locale)}
        actions={
          <Link href="/business-portal/deals/new" className={buttonClasses()}>
            <Plus className="h-4 w-4" />
            {t.newDealLabel}
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t.statOpenLabel} value={open.toString()} icon={Handshake} accent="sky" />
        <StatCard label={t.statWonLabel} value={won.length.toString()} icon={Trophy} accent="emerald" />
        <StatCard label={t.statWonValueLabel} value={formatCurrencyExact(wonValue, currency)} icon={Wallet} accent="indigo" />
      </div>

      <Card>
        <CardBody>
          {deals.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title={t.emptyDealsTitle}
              description={t.emptyDealsDescription}
              action={
                <Link href="/business-portal/deals/new" className={buttonClasses()}>
                  <Plus className="h-4 w-4" />
                  {t.newDealLabel}
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">{t.tableDealHeader}</th>
                    <th className="py-2 pr-3 font-medium">{t.tableCompanyContactHeader}</th>
                    <th className="py-2 pr-3 font-medium">{t.valueLabel}</th>
                    <th className="py-2 pr-3 font-medium">{t.statusLabel}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {deals.map((deal) => (
                    <tr key={deal.id}>
                      <td className="py-2.5 pr-3">
                        <Link
                          href={`/business-portal/deals/${deal.id}`}
                          className="font-medium text-slate-800 hover:text-petrol dark:text-slate-200 dark:hover:text-petrol-light"
                        >
                          {deal.title}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {deal.company?.name ?? (deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName ?? ""}`.trim() : "—")}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatCurrency(deal.value.toString(), currency)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge className={PARTNER_DEAL_STATUS_BADGE_CLASSES[deal.status]}>{statusLabels[deal.status]}</Badge>
                      </td>
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
