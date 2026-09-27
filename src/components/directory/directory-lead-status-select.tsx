"use client";

import { useTransition } from "react";
import { convertDirectoryLeadToDeal, updateDirectoryLeadStatus } from "@/app/actions/directory";
import type { DirectoryLeadStatus } from "@/generated/prisma/client";
import { Select } from "@/components/ui/field";
import { DIRECTORY_LEAD_STATUS_LABELS } from "@/lib/labels";
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
  className,
}: {
  leadId: string;
  status: DirectoryLeadStatus;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

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
      <option value="NEW">{DIRECTORY_LEAD_STATUS_LABELS.NEW}</option>
      <option value="PICKED_UP">{DIRECTORY_LEAD_STATUS_LABELS.PICKED_UP}</option>
      <option value="CONTACTED">{DIRECTORY_LEAD_STATUS_LABELS.CONTACTED}</option>
      <option value={QUALIFY_AS_DEAL_ACTION}>Qualified Deal</option>
      <option value="CLOSED_CONVERTED">{DIRECTORY_LEAD_STATUS_LABELS.CLOSED_CONVERTED}</option>
    </Select>
  );
}
