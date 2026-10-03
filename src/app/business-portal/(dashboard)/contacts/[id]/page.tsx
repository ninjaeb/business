import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deletePartnerContact } from "@/app/actions/partner-contacts";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { DEFAULT_PARTNER_CURRENCY, formatCurrency, formatDate, fullName } from "@/lib/format";
import { PARTNER_DEAL_STATUS_BADGE_CLASSES, PARTNER_DEAL_STATUS_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_CONTACTS_STRINGS, formatDealsHeading, formatTasksHeading } from "@/lib/portal-contacts-i18n";

export default async function PartnerContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletePartnerProfile();
  const locale = await getDirectoryLocale();
  const t = PORTAL_CONTACTS_STRINGS[locale];
  const { id } = await params;
  const currency = user.currency ?? DEFAULT_PARTNER_CURRENCY;
  const contact = await db.partnerContact.findFirst({
    where: { id, partnerId: user.id },
    include: {
      company: { select: { id: true, name: true } },
      deals: { orderBy: { createdAt: "desc" } },
      tasks: { where: { completed: false }, orderBy: { dueDate: "asc" } },
    },
  });
  if (!contact) notFound();
  const name = fullName(contact.firstName, contact.lastName);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: t.breadcrumbContacts, href: "/business-portal/contacts" }, { label: name }]}
        title={name}
        description={contact.title ?? undefined}
        actions={
          <>
            <Link href={`/business-portal/contacts/${contact.id}/edit`} className={buttonClasses("secondary")}>
              <Pencil className="h-4 w-4" />
              {t.editCta}
            </Link>
            <form action={deletePartnerContact.bind(null, contact.id)}>
              <ConfirmSubmitButton confirmMessage={t.deleteConfirm}>
                <Trash2 className="h-4 w-4" />
                {t.deleteCta}
              </ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t.detailsHeading}</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-3 text-sm sm:grid-cols-2">
          <DetailRow
            label={t.detailCompanyLabel}
            value={contact.company && <Link href={`/business-portal/companies/${contact.company.id}`} className="hover:text-petrol dark:hover:text-petrol-light">{contact.company.name}</Link>}
          />
          <DetailRow label={t.detailEmailLabel} value={contact.email && <a href={`mailto:${contact.email}`} className="hover:text-petrol dark:hover:text-petrol-light">{contact.email}</a>} />
          <DetailRow label={t.detailPhoneLabel} value={contact.phone} />
          {contact.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.detailNotesLabel}</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{contact.notes}</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{formatDealsHeading(contact.deals.length, locale)}</CardTitle>
          <Link href={`/business-portal/deals/new?contactId=${contact.id}`} className={buttonClasses("secondary", "sm")}>
            <Plus className="h-4 w-4" />
            {t.addDealCta}
          </Link>
        </CardHeader>
        <CardBody>
          {contact.deals.length === 0 ? (
            <EmptyState title={t.noDealsLinked} />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
              {contact.deals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    href={`/business-portal/deals/${deal.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-petrol dark:hover:text-petrol-light"
                  >
                    <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-200">{deal.title}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400">{formatCurrency(deal.value.toString(), currency)}</span>
                      <Badge className={PARTNER_DEAL_STATUS_BADGE_CLASSES[deal.status]}>{PARTNER_DEAL_STATUS_LABELS[deal.status]}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{formatTasksHeading(contact.tasks.length, locale)}</CardTitle>
          <Link href={`/business-portal/tasks/new?contactId=${contact.id}`} className={buttonClasses("secondary", "sm")}>
            <Plus className="h-4 w-4" />
            {t.addTaskCta}
          </Link>
        </CardHeader>
        <CardBody>
          {contact.tasks.length === 0 ? (
            <EmptyState title={t.noOpenTasks} />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
              {contact.tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/business-portal/tasks/${task.id}`}
                    className="flex items-center justify-between py-2.5 text-sm hover:text-petrol dark:hover:text-petrol-light"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{task.title}</span>
                    {task.dueDate && <span className="text-slate-400">{formatDate(task.dueDate)}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 break-words text-slate-800 dark:text-slate-200">{value || "—"}</p>
    </div>
  );
}
