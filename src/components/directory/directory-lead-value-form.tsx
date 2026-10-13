"use client";

import { useActionState } from "react";
import { updateDirectoryLeadDetails } from "@/app/actions/directory";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { PORTAL_LEADS_STRINGS, formatValueFieldLabel } from "@/lib/portal-leads-i18n";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Textarea } from "@/components/ui/field";
import { useActionToast } from "@/components/ui/toast";

export function DirectoryLeadValueForm({
  leadId,
  value,
  notes,
  currency,
  locale,
}: {
  leadId: string;
  value: number | null;
  notes: string | null;
  currency: string;
  locale: DirectoryLocale;
}) {
  const t = PORTAL_LEADS_STRINGS[locale];
  const [state, formAction, pending] = useActionState(updateDirectoryLeadDetails.bind(null, leadId), undefined);
  useActionToast(state, t.valueFormSavedToast);

  return (
    <form action={formAction} className="space-y-3">
      <FieldGroup label={formatValueFieldLabel(t.valueFieldLabelTemplate, currency)} htmlFor="value">
        <Input id="value" name="value" type="number" min="0" step="0.01" defaultValue={value ?? ""} placeholder="0.00" />
      </FieldGroup>
      <FieldGroup label={t.notesFieldLabel} htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} defaultValue={notes ?? ""} placeholder={t.notesPlaceholder} />
      </FieldGroup>
      {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
      >
        {pending ? t.valueFormSaving : t.valueFormSave}
      </Button>
    </form>
  );
}
