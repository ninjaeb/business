import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deletePartnerCompany } from "@/app/actions/partner-companies";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { DEFAULT_PARTNER_CURRENCY, formatCurrency, formatDate, fullName } from "@/lib/format";
import { PARTNER_DEAL_STATUS_BADGE_CLASSES } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { formatPortalCompaniesCount, getPortalCompaniesStrings } from "@/lib/portal-companies-i18n";
import { INDUSTRY_LABELS_BY_LOCALE, PARTNER_DEAL_STATUS_LABELS_BY_LOCALE } from "@/lib/directory-i18n";

export default async function PartnerCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalCompaniesStrings(locale);
  const { id } = await params;
  const currency = user.currency ?? DEFAULT_PARTNER_CURRENCY;
  const company = await db.partnerCompany.findFirst({
    where: { id, partnerId: user.id },
    include: {
      contacts: { orderBy: { firstName: "asc" } },
      deals: { orderBy: { createdAt: "desc" } },
      tasks: { where: { completed: false }, orderBy: { dueDate: "asc" } },
    },
  });
  if (!company) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: t.companiesTitle, href: "/business-portal/companies" }, { label: company.name }]}
        title={company.name}
        description={company.industry ? INDUSTRY_LABELS_BY_LOCALE[locale][company.industry] : undefined}
        actions={
          <>
            <Link href={`/business-portal/companies/${company.id}/edit`} className={buttonClasses("secondary")}>
              <Pencil className="h-4 w-4" />
              {t.editCta}
            </Link>
            <form action={deletePartnerCompany.bind(null, company.id)}>
              <ConfirmSubmitButton confirmMessage={t.deleteConfirmMessage}>
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
          <DetailRow label={t.websiteLabel} value={company.website} />
          <DetailRow label={t.phoneLabel} value={company.phone} />
          <DetailRow label={t.addressLabel} value={company.address} />
          {company.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.notesLabel}</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{company.notes}</p>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{formatPortalCompaniesCount(t.contactsHeadingTemplate, company.contacts.length)}</CardTitle>
            <Link href={`/business-portal/contacts/new?companyId=${company.id}`} className={buttonClasses("secondary", "sm")}>
              <Plus className="h-4 w-4" />
              {t.addContactCta}
            </Link>
          </CardHeader>
          <CardBody>
            {company.contacts.length === 0 ? (
              <EmptyState title={t.noContactsEmpty} />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
                {company.contacts.map((contact) => (
                  <li key={contact.id}>
                    <Link
                      href={`/business-portal/contacts/${contact.id}`}
                      className="flex items-center justify-between py-2.5 text-sm hover:text-petrol dark:hover:text-petrol-light"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {fullName(contact.firstName, contact.lastName)}
                      </span>
                      <span className="text-slate-400">{contact.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{formatPortalCompaniesCount(t.dealsHeadingTemplate, company.deals.length)}</CardTitle>
            <Link href={`/business-portal/deals/new?companyId=${company.id}`} className={buttonClasses("secondary", "sm")}>
              <Plus className="h-4 w-4" />
              {t.addDealCta}
            </Link>
          </CardHeader>
          <CardBody>
            {company.deals.length === 0 ? (
              <EmptyState title={t.noDealsEmpty} />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
                {company.deals.map((deal) => (
                  <li key={deal.id}>
                    <Link
                      href={`/business-portal/deals/${deal.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-petrol dark:hover:text-petrol-light"
                    >
                      <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-200">{deal.title}</span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400">{formatCurrency(deal.value.toString(), currency)}</span>
                        <Badge className={PARTNER_DEAL_STATUS_BADGE_CLASSES[deal.status]}>
                          {PARTNER_DEAL_STATUS_LABELS_BY_LOCALE[locale][deal.status]}
                        </Badge>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formatPortalCompaniesCount(t.openTasksHeadingTemplate, company.tasks.length)}</CardTitle>
          <Link href={`/business-portal/tasks/new?companyId=${company.id}`} className={buttonClasses("secondary", "sm")}>
            <Plus className="h-4 w-4" />
            {t.addTaskCta}
          </Link>
        </CardHeader>
        <CardBody>
          {company.tasks.length === 0 ? (
            <EmptyState title={t.noOpenTasksEmpty} />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
              {company.tasks.map((task) => (
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
