import Link from "next/link";
import { Inbox, Handshake, ThumbsUp, Trophy, Wallet } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getDirectoryLeadStatsForPartner } from "@/lib/directory";
import { DEFAULT_PARTNER_CURRENCY, formatCurrencyExact, formatDate, formatDuration } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DIRECTORY_LEAD_STATUS_BADGE_CLASSES, DIRECTORY_LEAD_STATUS_LABELS } from "@/lib/labels";

// Across every listing this partner owns — a lead always belongs to
// exactly one listing (see the Listing column below), but there's no
// reason to make a partner with several businesses flip between separate
// per-listing inbox pages to see all their inquiries.
export default async function PartnerDirectoryLeadsPage() {
  const user = await requireCompletePartnerProfile();
  const currency = user.currency ?? DEFAULT_PARTNER_CURRENCY;
  const [stats, leads] = await Promise.all([
    getDirectoryLeadStatsForPartner(user.id),
    db.directoryLead.findMany({
      where: { listing: { partnerId: user.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
        value: true,
        viaReferral: true,
        createdAt: true,
        closedAt: true,
        listing: { select: { companyName: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Business Leads" description="Inquiries sent through your public listings" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="New" value={stats.new.toString()} icon={Inbox} accent="sky" />
        <StatCard label="Open" value={stats.open.toString()} icon={Handshake} accent="amber" />
        <StatCard label="Converted" value={stats.converted.toString()} icon={Trophy} accent="emerald" />
        <StatCard label="Converted value" value={formatCurrencyExact(stats.convertedValue, currency)} icon={Wallet} accent="indigo" />
        <StatCard label="Referred" value={stats.referred.toString()} description="Via your Recommend link" icon={ThumbsUp} accent="orange" />
      </div>

      <Card>
        <CardBody>
          {leads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No leads yet."
              description="Once someone sends an inquiry through one of your listings, it shows up here."
              action={
                <Link href="/business-portal/listings" className="text-sm font-medium text-petrol hover:underline dark:text-petrol-light">
                  Go to My Business
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">Lead</th>
                    <th className="py-2 pr-3 font-medium">Listing</th>
                    <th className="py-2 pr-3 font-medium">Received</th>
                    <th className="py-2 pr-3 font-medium">Duration</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-2.5 pr-3">
                        <Link
                          href={`/business-portal/business-leads/${lead.id}`}
                          className="inline-flex items-start gap-1.5 hover:text-petrol dark:hover:text-petrol-light"
                        >
                          {lead.viaReferral && (
                            <span className="mt-0.5 shrink-0" title="Came in through your Recommend link">
                              <ThumbsUp className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" aria-hidden="true" />
                            </span>
                          )}
                          <span>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{lead.name}</p>
                            {lead.company && <p className="text-xs text-slate-400">{lead.company}</p>}
                          </span>
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {lead.listing.companyName}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatDuration(lead.createdAt, lead.closedAt ?? undefined)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge className={DIRECTORY_LEAD_STATUS_BADGE_CLASSES[lead.status]}>
                          {DIRECTORY_LEAD_STATUS_LABELS[lead.status]}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {lead.value !== null ? formatCurrencyExact(Number(lead.value), currency) : "—"}
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
