"use client";

import { useActionState, useState } from "react";
import type { BusinessPartnerInviteFormState } from "@/app/actions/business-partners";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { PHONE_FORMAT_HINT } from "@/lib/phone";

export function BusinessPartnerInviteForm({
  action,
  listings,
}: {
  action: (prevState: BusinessPartnerInviteFormState, formData: FormData) => Promise<BusinessPartnerInviteFormState>;
  listings: { id: string; companyName: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [listingId, setListingId] = useState(listings[0]?.id);

  return (
    <form action={formAction} className="space-y-4">
      {listings.length > 1 && (
        <FieldGroup label="From listing" htmlFor="listingId" required>
          <Select id="listingId" name="listingId" required value={listingId} onChange={(event) => setListingId(event.target.value)}>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.companyName}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}
      {listings.length === 1 && <input type="hidden" name="listingId" value={listings[0]?.id} />}

      <FieldGroup label="Company" htmlFor="companyName" required>
        <Input id="companyName" name="companyName" required maxLength={150} placeholder="Acme Printing" />
      </FieldGroup>

      <FieldGroup label="Contact name" htmlFor="contactName" required>
        <Input id="contactName" name="contactName" required maxLength={100} placeholder="Jane Tan" />
      </FieldGroup>

      <FieldGroup label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" required placeholder="jane@acme.com" />
      </FieldGroup>

      <FieldGroup label="Contact number" htmlFor="phone" required>
        <Input id="phone" name="phone" type="tel" required placeholder="+60 12 345 6789" />
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{PHONE_FORMAT_HINT}</p>
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending invite…" : "Send invite"}
      </Button>
    </form>
  );
}
