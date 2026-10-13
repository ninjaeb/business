import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updatePartnerContact } from "@/app/actions/partner-contacts";
import { PartnerContactForm } from "@/components/business-crm/partner-contact-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { fullName } from "@/lib/format";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { PORTAL_CONTACTS_STRINGS, formatEditContactTitle } from "@/lib/portal-contacts-i18n";

export default async function EditPartnerContactPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletePartnerProfile();
  const locale = await getDirectoryLocale();
  const t = PORTAL_CONTACTS_STRINGS[locale];
  const { id } = await params;
  const [contact, companies] = await Promise.all([
    db.partnerContact.findFirst({ where: { id, partnerId: user.id } }),
    db.partnerCompany.findMany({ where: { partnerId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!contact) notFound();
  const name = fullName(contact.firstName, contact.lastName);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: t.breadcrumbContacts, href: "/business-portal/contacts" },
          { label: name, href: `/business-portal/contacts/${contact.id}` },
          { label: t.editCta },
        ]}
        title={formatEditContactTitle(name, locale)}
      />
      <Card>
        <CardBody>
          <PartnerContactForm
            action={updatePartnerContact.bind(null, contact.id)}
            contact={contact}
            companies={companies}
            locale={locale}
          />
        </CardBody>
      </Card>
    </div>
  );
}
