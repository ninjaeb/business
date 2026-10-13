"use client";

import { useActionState, useMemo, useState } from "react";
import type { PartnerCompany, PartnerContact } from "@/generated/prisma/client";
import type { PartnerDealFormState } from "@/app/actions/partner-deals";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDateInput, fullName } from "@/lib/format";
import { PARTNER_DEAL_STATUSES } from "@/lib/labels";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PARTNER_DEAL_STATUS_LABELS_BY_LOCALE } from "@/lib/directory-i18n";
import { PORTAL_DEALS_STRINGS, formatValueFieldLabel } from "@/lib/portal-deals-i18n";

type ContactOption = Pick<PartnerContact, "id" | "firstName" | "lastName" | "companyId">;

// Plain-number/plain-object shape, not the Prisma-generated PartnerDeal
// type — that carries `value` as a Decimal, which can't cross the Server
// -> Client Component boundary as a prop (see EditPartnerDealPage, which
// converts it with Number(...) before passing a deal down here).
type PartnerDealDraft = {
  title: string;
  value: number;
  status: string;
  companyId: string | null;
  contactId: string | null;
  expectedCloseDate: Date | null;
  notes: string | null;
};

export function PartnerDealForm({
  action,
  deal,
  companies,
  contacts,
  defaultCompanyId,
  defaultContactId,
  submitLabel,
  currency = "USD",
  locale,
}: {
  action: (prevState: PartnerDealFormState, formData: FormData) => Promise<PartnerDealFormState>;
  deal?: PartnerDealDraft;
  companies: PartnerCompany[];
  contacts: ContactOption[];
  defaultCompanyId?: string;
  defaultContactId?: string;
  submitLabel?: string;
  currency?: string;
  locale: DirectoryLocale;
}) {
  const t = PORTAL_DEALS_STRINGS[locale];
  const statusLabels = PARTNER_DEAL_STATUS_LABELS_BY_LOCALE[locale];
  const resolvedSubmitLabel = submitLabel ?? t.saveDealSubmit;
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values;
  const [contactId, setContactId] = useState(values?.contactId ?? deal?.contactId ?? defaultContactId ?? "");
  const [companyId, setCompanyId] = useState(() => {
    if (values?.companyId) return values.companyId;
    if (deal?.companyId) return deal.companyId;
    if (defaultCompanyId) return defaultCompanyId;
    return contacts.find((contact) => contact.id === contactId)?.companyId ?? "";
  });

  const filteredContacts = useMemo(
    () => (companyId ? contacts.filter((contact) => contact.companyId === companyId) : contacts),
    [contacts, companyId],
  );

  function handleCompanyChange(nextCompanyId: string) {
    setCompanyId(nextCompanyId);
    const contactStillValid = !nextCompanyId
      ? true
      : contacts.some((contact) => contact.id === contactId && contact.companyId === nextCompanyId);
    if (!contactStillValid) setContactId("");
  }

  function handleContactChange(nextContactId: string) {
    setContactId(nextContactId);
    const contact = contacts.find((c) => c.id === nextContactId);
    if (contact?.companyId) setCompanyId(contact.companyId);
  }

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup label={t.dealTitleLabel} htmlFor="title" required>
        <Input id="title" name="title" required defaultValue={values?.title ?? deal?.title} placeholder={t.dealTitlePlaceholder} />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={formatValueFieldLabel(currency, locale)} htmlFor="value">
          <Input
            id="value"
            name="value"
            type="number"
            min={0}
            step="0.01"
            defaultValue={values?.value ?? (deal ? deal.value.toString() : "0")}
          />
        </FieldGroup>
        <FieldGroup label={t.statusLabel} htmlFor="status">
          <Select id="status" name="status" defaultValue={values?.status ?? deal?.status ?? "NEW"}>
            {PARTNER_DEAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={t.companyLabel} htmlFor="companyId">
          <Combobox
            id="companyId"
            name="companyId"
            value={companyId}
            onValueChange={handleCompanyChange}
            placeholder={t.noCompanyOption}
            options={[{ value: "", label: t.noCompanyOption }, ...companies.map((company) => ({ value: company.id, label: company.name }))]}
          />
        </FieldGroup>
        <FieldGroup label={t.contactLabel} htmlFor="contactId">
          <Combobox
            id="contactId"
            name="contactId"
            value={contactId}
            onValueChange={handleContactChange}
            placeholder={t.noContactOption}
            options={[
              { value: "", label: t.noContactOption },
              ...filteredContacts.map((contact) => ({ value: contact.id, label: fullName(contact.firstName, contact.lastName) })),
            ]}
          />
        </FieldGroup>
      </div>

      <FieldGroup label={t.expectedCloseDateLabel} htmlFor="expectedCloseDate">
        <DatePicker id="expectedCloseDate" name="expectedCloseDate" defaultValue={values?.expectedCloseDate ?? formatDateInput(deal?.expectedCloseDate)} />
      </FieldGroup>

      <FieldGroup label={t.notesLabel} htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={values?.notes ?? deal?.notes ?? ""}
          placeholder={t.notesPlaceholder}
        />
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? t.savingLabel : resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
}
