import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Handshake, ThumbsUp } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { DEFAULT_PARTNER_CURRENCY, formatDate, formatDateTime, formatDuration } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DirectoryLeadStatusSelect } from "@/components/directory/directory-lead-status-select";
import { DirectoryLeadContactLinks } from "@/components/directory/directory-lead-contact-links";
import { DirectoryLeadValueForm } from "@/components/directory/directory-lead-value-form";
import { DirectoryLeadReplyForm } from "@/components/directory/directory-lead-reply-form";

export default async function PartnerDirectoryLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletePartnerProfile();
  const { id } = await params;
  const currency = user.currency ?? DEFAULT_PARTNER_CURRENCY;
  const lead = await db.directoryLead.findFirst({
    where: { id, listing: { partnerId: user.id } },
    include: {
      replies: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      listing: { select: { companyName: true } },
      convertedDeal: { select: { id: true } },
    },
  });
  if (!lead) notFound();

  // Pre-fills the chat, quoting their own inquiry back to them for context
  // — still just a draft in WhatsApp's own composer until the partner
  // edits and sends it themselves, never sent automatically from here.
  const whatsAppMessage = `Hi ${lead.name}, thanks for reaching out to ${lead.listing.companyName}! Regarding your inquiry: "${lead.message}"`;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Business Leads", href: "/business-portal/business-leads" },
          { label: lead.listing.companyName },
          { label: lead.name },
        ]}
        title={lead.name}
        description={
          <>
            {`Sent ${formatDateTime(lead.createdAt)} · ${
              lead.closedAt
                ? `Closed after ${formatDuration(lead.createdAt, lead.closedAt)}`
                : `Open for ${formatDuration(lead.createdAt)}`
            }`}
            {lead.viaReferral && (
              <Badge className="ml-2 bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-400 dark:ring-orange-500/30">
                <ThumbsUp className="mr-1 h-3 w-3" aria-hidden="true" />
                Referred
              </Badge>
            )}
          </>
        }
        actions={
          <>
            {lead.convertedDeal && (
              <Link
                href={`/business-portal/deals/${lead.convertedDeal.id}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-slate-300 dark:hover:bg-neutral-800"
              >
                <Handshake className="h-3.5 w-3.5" />
                View deal
              </Link>
            )}
            <DirectoryLeadStatusSelect leadId={lead.id} status={lead.status} />
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inquiry</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              {lead.company && <span>{lead.company}</span>}
              <DirectoryLeadContactLinks leadId={lead.id} email={lead.email} phone={lead.phone} whatsAppMessage={whatsAppMessage} />
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{lead.message}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Value & notes</CardTitle>
          </CardHeader>
          <CardBody>
            <DirectoryLeadValueForm
              leadId={lead.id}
              value={lead.value !== null ? Number(lead.value) : null}
              notes={lead.notes}
              currency={currency}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {lead.replies.length > 0 && (
            <ul className="space-y-3">
              {lead.replies.map((reply) => (
                <li key={reply.id} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-neutral-800">
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{reply.body}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                    {reply.author.name} · {formatDate(reply.createdAt)}
                    {!reply.sentAt && (
                      <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400" title={reply.sendError ?? undefined}>
                        <AlertTriangle className="h-3 w-3" />
                        Not delivered
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <DirectoryLeadReplyForm leadId={lead.id} />
        </CardBody>
      </Card>
    </div>
  );
}
