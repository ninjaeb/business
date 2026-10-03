import { PageHeader } from "@/components/ui/page-header";
import { PartnerImportForm } from "@/components/business-crm/partner-import-form";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_CONTACTS_STRINGS } from "@/lib/portal-contacts-i18n";

export default async function ImportPartnerContactsPage() {
  await requireCompletePartnerProfile();
  const locale = await getDirectoryLocale();
  const t = PORTAL_CONTACTS_STRINGS[locale];
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: t.breadcrumbContacts, href: "/business-portal/contacts" }, { label: t.importCta }]}
        title={t.importPageTitle}
        description={t.importPageDescription}
      />
      <PartnerImportForm locale={locale} />
    </div>
  );
}
