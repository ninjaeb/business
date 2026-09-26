import { requirePartner } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerProfileForm } from "@/components/partner/partner-profile-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export default async function PartnerProfilePage() {
  const user = await requirePartner();
  const { phone, companyName, timezone } = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { phone: true, companyName: true, timezone: true },
  });
  const isIncomplete = !user.name.trim() || !phone || !companyName;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your own login — name, email, contact phone, and password." />

      {isIncomplete && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Name, company name, and contact phone are all required before you can use the rest of the dashboard —
          fill these in and save to continue.
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardBody>
            <PartnerProfileForm
              name={user.name}
              companyName={companyName}
              email={user.email}
              title={user.title}
              phone={phone}
              timezone={timezone}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change your password</CardTitle>
          </CardHeader>
          <CardBody>
            <ChangePasswordForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
