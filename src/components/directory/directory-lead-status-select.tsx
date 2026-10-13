"use client";

import { useTransition } from "react";
import { convertDirectoryLeadToDeal, updateDirectoryLeadStatus } from "@/app/actions/directory";
import type { DirectoryLeadStatus } from "@/generated/prisma/client";
import { Select } from "@/components/ui/field";
import { DIRECTORY_LEAD_STATUS_LABELS_BY_LOCALE, type DirectoryLocale } from "@/lib/directory-i18n";
import { PORTAL_LEADS_STRINGS } from "@/lib/portal-leads-i18n";
import { cn } from "@/lib/utils";

// Not a real DirectoryLeadStatus — picking it never gets written to the
// database as-is. It's a picker-only action: onChange below recognizes it
// and calls convertDirectoryLeadToDeal instead of a plain status update,
// which creates a PartnerDeal (with a Company/Contact auto-filled from this
// lead's own company/name/email/phone) and moves the lead straight to
// CLOSED_CONVERTED. Kept as one more option in this same dropdown, right
// where a partner is already looking to change a lead's status, rather
// than a separate button elsewhere.
const QUALIFY_AS_DEAL_ACTION = "QUALIFY_AS_DEAL";

export function DirectoryLeadStatusSelect({
  leadId,
  status,
  locale,
  className,
}: {
  leadId: string;
  status: DirectoryLeadStatus;
  locale: DirectoryLocale;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const statusLabels = DIRECTORY_LEAD_STATUS_LABELS_BY_LOCALE[locale];
  const t = PORTAL_LEADS_STRINGS[locale];

  return (
    <Select
      value={status}
      disabled={pending}
      onChange={(event) => {
        const value = event.target.value;
        startTransition(async () => {
          if (value === QUALIFY_AS_DEAL_ACTION) {
            await convertDirectoryLeadToDeal(leadId);
            return;
          }
          const formData = new FormData();
          formData.set("status", value);
          await updateDirectoryLeadStatus(leadId, formData);
        });
      }}
      className={cn("w-auto", className)}
    >
      <option value="NEW">{statusLabels.NEW}</option>
      <option value="PICKED_UP">{statusLabels.PICKED_UP}</option>
      <option value="CONTACTED">{statusLabels.CONTACTED}</option>
      <option value={QUALIFY_AS_DEAL_ACTION}>{t.qualifiedDealOption}</option>
      <option value="CLOSED_CONVERTED">{statusLabels.CLOSED_CONVERTED}</option>
    </Select>
  );
}
