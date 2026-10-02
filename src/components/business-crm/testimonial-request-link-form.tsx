"use client";

import { useActionState } from "react";
import type { PartnerListing } from "@/generated/prisma/client";
import type { TestimonialRequestLinkFormState } from "@/app/actions/testimonial-request-links";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";

export function TestimonialRequestLinkForm({
  action,
  listings,
  serviceSuggestions,
}: {
  action: (prevState: TestimonialRequestLinkFormState, formData: FormData) => Promise<TestimonialRequestLinkFormState>;
  listings: PartnerListing[];
  // Every service title across every listing the partner owns, merged into
  // one <datalist> suggestion list — see the field below's own comment on
  // why that's fine even for a partner with more than one listing.
  serviceSuggestions: string[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {listings.length > 1 && (
        <FieldGroup label="Listing" htmlFor="listingId" required>
          <Select id="listingId" name="listingId" required defaultValue={listings[0]?.id}>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.companyName}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}
      {listings.length === 1 && <input type="hidden" name="listingId" value={listings[0].id} />}

      <FieldGroup label="Product or service provided" htmlFor="serviceTitle">
        <Input id="serviceTitle" name="serviceTitle" list="service-suggestions" placeholder="e.g. Logo design package" autoComplete="off" />
        {/* A typing aid, not a constraint — the field stays free text (see
            TestimonialRequestLink.serviceTitle's own comment on why this
            isn't a reference to one of the listing's own formal service
            entries), so picking a suggestion or typing something else
            entirely both work the same way. */}
        <datalist id="service-suggestions">
          {serviceSuggestions.map((title) => (
            <option key={title} value={title} />
          ))}
        </datalist>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Shown to the customer on the form, so they know what they&apos;re reviewing. Leave blank for a general review.
        </p>
      </FieldGroup>

      <FieldGroup label="Note (for you only)" htmlFor="note">
        <Input id="note" name="note" placeholder="e.g. Sarah, logo project — Mar 2026" />
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Never shown to the customer — just helps you tell your own links apart.
        </p>
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create link"}
        </Button>
      </div>
    </form>
  );
}
