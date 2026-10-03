"use client";

import { useActionState, useState } from "react";
import type { PartnerContact } from "@/generated/prisma/client";
import type { PartnerContactFormState } from "@/app/actions/partner-contacts";
import type { ContactDraft } from "@/lib/contact-draft";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PORTAL_CONTACTS_STRINGS } from "@/lib/portal-contacts-i18n";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { Combobox } from "@/components/ui/combobox";
import { PHONE_FORMAT_HINT } from "@/lib/phone";

type CompanyOption = { id: string; name: string };

export function PartnerContactForm({
  action,
  contact,
  companies,
  defaultCompanyId,
  prefill,
  submitLabel,
  locale,
}: {
  action: (prevState: PartnerContactFormState, formData: FormData) => Promise<PartnerContactFormState>;
  contact?: PartnerContact;
  companies: CompanyOption[];
  defaultCompanyId?: string;
  // Draft values for a new (unsaved) contact — e.g. from a scanned business
  // card. Ignored once `contact` is set, since editing an existing row
  // should never silently reintroduce stale draft data.
  prefill?: ContactDraft;
  // Defaults to t.formSaveCta below (the Edit page's own case) — the New
  // contact flow (new-partner-contact-form.tsx) overrides it with its own
  // translated "Create contact" label.
  submitLabel?: string;
  locale: DirectoryLocale;
}) {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values;
  const [companyId, setCompanyId] = useState(
    values?.companyId ?? contact?.companyId ?? prefill?.company?.id ?? defaultCompanyId ?? "",
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={t.formFirstNameLabel} htmlFor="firstName" required>
          <Input
            id="firstName"
            name="firstName"
            required
            defaultValue={values?.firstName ?? contact?.firstName ?? prefill?.firstName}
            placeholder={t.formFirstNamePlaceholder}
          />
        </FieldGroup>
        <FieldGroup label={t.formLastNameLabel} htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            defaultValue={values?.lastName ?? contact?.lastName ?? prefill?.lastName ?? ""}
            placeholder={t.formLastNamePlaceholder}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={t.formEmailLabel} htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={values?.email ?? contact?.email ?? prefill?.email ?? ""}
            placeholder={t.formEmailPlaceholder}
          />
        </FieldGroup>
        <FieldGroup label={t.formPhoneLabel} htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={values?.phone ?? contact?.phone ?? prefill?.phone ?? ""} placeholder={t.formPhonePlaceholder} />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{PHONE_FORMAT_HINT}</p>
        </FieldGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={t.formJobTitleLabel} htmlFor="title">
          <Input id="title" name="title" defaultValue={values?.title ?? contact?.title ?? prefill?.title ?? ""} placeholder={t.formJobTitlePlaceholder} />
        </FieldGroup>
        <FieldGroup label={t.formCompanyLabel} htmlFor="companyId">
          <Combobox
            id="companyId"
            name="companyId"
            value={companyId}
            onValueChange={setCompanyId}
            placeholder={t.formNoCompanyOption}
            options={[{ value: "", label: t.formNoCompanyOption }, ...companies.map((company) => ({ value: company.id, label: company.name }))]}
          />
        </FieldGroup>
      </div>

      <FieldGroup label={t.formNotesLabel} htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={values?.notes ?? contact?.notes ?? ""}
          placeholder={t.formNotesPlaceholder}
        />
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? t.formSavingCta : submitLabel ?? t.formSaveCta}
        </Button>
      </div>
    </form>
  );
}
