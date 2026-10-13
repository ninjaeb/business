import { requirePartner } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalDashboardStrings } from "@/lib/portal-dashboard-i18n";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerProfileForm } from "@/components/partner/partner-profile-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export default async function PartnerProfilePage() {
  const [user, locale] = await Promise.all([requirePartner(), getDirectoryLocale()]);
  const t = getPortalDashboardStrings(locale);
  const { phone, companyName, timezone, currency } = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { phone: true, companyName: true, timezone: true, currency: true },
  });
  const isIncomplete = !user.name.trim() || !phone || !companyName;

  return (
    <div className="space-y-6">
      <PageHeader title={t.profileHeading} description={t.profileDescription} />

      {isIncomplete && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {t.profileIncompleteNotice}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.accountDetailsHeading}</CardTitle>
          </CardHeader>
          <CardBody>
            <PartnerProfileForm
              name={user.name}
              companyName={companyName}
              email={user.email}
              title={user.title}
              phone={phone}
              timezone={timezone}
              currency={currency}
              locale={locale}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.changePasswordCardHeading}</CardTitle>
          </CardHeader>
          <CardBody>
            <ChangePasswordForm locale={locale} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
