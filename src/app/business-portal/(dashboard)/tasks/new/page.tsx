import { createPartnerTask } from "@/app/actions/partner-tasks";
import { PartnerTaskForm } from "@/components/business-crm/partner-task-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_TASKS_STRINGS } from "@/lib/portal-tasks-i18n";

export default async function NewPartnerTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; contactId?: string; dealId?: string }>;
}) {
  const locale = await getDirectoryLocale();
  const t = PORTAL_TASKS_STRINGS[locale];
  const user = await requireCompletePartnerProfile();
  const { companyId, contactId, dealId } = await searchParams;
  const [companies, contacts, deals] = await Promise.all([
    db.partnerCompany.findMany({ where: { partnerId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.partnerContact.findMany({
      where: { partnerId: user.id },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, companyId: true },
    }),
    db.partnerDeal.findMany({
      where: { partnerId: user.id },
      orderBy: { title: "asc" },
      select: { id: true, title: true, companyId: true, contactId: true },
    }),
  ]);

  return (
    <div>
      <PageHeader breadcrumbs={[{ label: t.tasksTitle, href: "/business-portal/tasks" }, { label: t.newTaskCta }]} title={t.newTaskCta} />
      <Card>
        <CardBody>
          <PartnerTaskForm
            action={createPartnerTask}
            companies={companies}
            contacts={contacts}
            deals={deals}
            defaultCompanyId={companyId}
            defaultContactId={contactId}
            defaultDealId={dealId}
            locale={locale}
            submitLabel={t.createTaskSubmitLabel}
          />
        </CardBody>
      </Card>
    </div>
  );
}
