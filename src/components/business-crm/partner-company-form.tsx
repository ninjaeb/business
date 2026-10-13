"use client";

import { useActionState } from "react";
import type { PartnerCompany } from "@/generated/prisma/client";
import type { PartnerCompanyFormState } from "@/app/actions/partner-companies";
import { INDUSTRY_LABELS_BY_LOCALE, type DirectoryLocale } from "@/lib/directory-i18n";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { INDUSTRIES } from "@/lib/labels";
import { PHONE_FORMAT_HINT } from "@/lib/phone";
import { PORTAL_COMPANIES_STRINGS } from "@/lib/portal-companies-i18n";

export function PartnerCompanyForm({
  action,
  company,
  submitLabel,
  locale,
}: {
  action: (prevState: PartnerCompanyFormState, formData: FormData) => Promise<PartnerCompanyFormState>;
  company?: PartnerCompany;
  submitLabel?: string;
  locale: DirectoryLocale;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values;
  const t = PORTAL_COMPANIES_STRINGS[locale];
  const resolvedSubmitLabel = submitLabel ?? t.saveCompanyCta;

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label={t.companyNameLabel} htmlFor="name" required>
        <Input id="name" name="name" required defaultValue={values?.name ?? company?.name} placeholder={t.companyNamePlaceholder} />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={t.industryLabel} htmlFor="industry">
          <Select id="industry" name="industry" defaultValue={values?.industry ?? company?.industry ?? ""}>
            <option value="">{t.industryUnclassified}</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {INDUSTRY_LABELS_BY_LOCALE[locale][industry]}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label={t.websiteLabel} htmlFor="website">
          <Input
            id="website"
            name="website"
            defaultValue={values?.website ?? company?.website ?? ""}
            placeholder={t.websitePlaceholder}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={t.phoneLabel} htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={values?.phone ?? company?.phone ?? ""} placeholder={t.phonePlaceholder} />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{PHONE_FORMAT_HINT}</p>
        </FieldGroup>
        <FieldGroup label={t.addressLabel} htmlFor="address">
          <Input id="address" name="address" defaultValue={values?.address ?? company?.address ?? ""} placeholder={t.addressPlaceholder} />
        </FieldGroup>
      </div>

      <FieldGroup label={t.notesLabel} htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={values?.notes ?? company?.notes ?? ""}
          placeholder={t.notesPlaceholder}
        />
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? t.savingCta : resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
}
