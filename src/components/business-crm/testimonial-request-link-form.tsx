"use client";

import { useActionState, useMemo, useState } from "react";
import type { ServiceEntry } from "@/lib/directory";
import type { TestimonialRequestLinkFormState } from "@/app/actions/testimonial-request-links";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import { MultiCombobox } from "@/components/ui/multi-combobox";

export function TestimonialRequestLinkForm({
  action,
  listings,
  initialValues,
  submitLabel = "Create link",
  pendingLabel = "Creating…",
}: {
  action: (prevState: TestimonialRequestLinkFormState, formData: FormData) => Promise<TestimonialRequestLinkFormState>;
  // Already parsed server-side (see new/page.tsx's own comment on why) —
  // just the id/name/services slice this form needs, not a full
  // PartnerListing row.
  listings: { id: string; companyName: string; services: ServiceEntry[] }[];
  // Present only on the edit page (see [id]/edit/page.tsx) — prefills every
  // field from the existing row. Undefined means create mode.
  initialValues?: {
    listingId: string;
    customerName: string;
    customerTitle: string;
    customerCompany: string;
    serviceTitles: string[];
    note: string;
  };
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [listingId, setListingId] = useState(initialValues?.listingId ?? listings[0]?.id);

  // Options track whichever listing is currently selected — a partner with
  // more than one listing sees that listing's own services, not a merged
  // list across all of them, since "Web Design" on listing A has nothing to
  // do with listing B.
  const serviceOptions = useMemo(() => {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) return [];
    return listing.services.map((service) => ({ value: service.title, label: service.title }));
  }, [listings, listingId]);

  return (
    <form action={formAction} className="space-y-4">
      {listings.length > 1 && (
        <FieldGroup label="Listing" htmlFor="listingId" required>
          <Select
            id="listingId"
            name="listingId"
            required
            value={listingId}
            onChange={(event) => setListingId(event.target.value)}
          >
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.companyName}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}
      {listings.length === 1 && <input type="hidden" name="listingId" value={listings[0].id} />}

      {/* Prefills the standalone form's own name/company/title fields (see
          StandaloneTestimonialForm) — all optional, and still editable by
          the customer before they submit, so a guess here that's wrong or
          incomplete costs nothing. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Customer name" htmlFor="customerName">
          <Input id="customerName" name="customerName" placeholder="e.g. Sarah Tan" defaultValue={initialValues?.customerName} />
        </FieldGroup>
        <FieldGroup label="Customer title" htmlFor="customerTitle">
          <Input
            id="customerTitle"
            name="customerTitle"
            placeholder="e.g. Marketing Director"
            defaultValue={initialValues?.customerTitle}
          />
        </FieldGroup>
      </div>
      <FieldGroup label="Customer company" htmlFor="customerCompany">
        <Input
          id="customerCompany"
          name="customerCompany"
          placeholder="e.g. Acme Sdn Bhd"
          defaultValue={initialValues?.customerCompany}
        />
      </FieldGroup>

      <FieldGroup label="Product or service provided" htmlFor="serviceTitles">
        {serviceOptions.length > 0 ? (
          <MultiCombobox
            // Forces a remount on every listing switch — MultiCombobox
            // tracks its own selection internally and never clears it when
            // its `options` prop changes, so without this a selection made
            // for one listing would silently keep submitting as a hidden
            // input after switching to another listing whose services
            // don't include it at all (invisible in the chip UI, since
            // those chips are filtered against the new options, but still
            // present in `selected` and still posted on submit).
            key={listingId}
            id="serviceTitles"
            name="serviceTitles"
            options={serviceOptions}
            defaultValue={listingId === initialValues?.listingId ? initialValues?.serviceTitles : undefined}
            placeholder="Search this listing's services…"
            emptyMessage="No matching services"
          />
        ) : (
          // Falls back to free text when the selected listing has no
          // formal services of its own on file yet. Same remount-on-switch
          // reasoning as the MultiCombobox branch above.
          <Input
            key={listingId}
            id="serviceTitles"
            name="serviceTitles"
            placeholder="e.g. Logo design package"
            autoComplete="off"
            defaultValue={listingId === initialValues?.listingId ? initialValues?.serviceTitles?.join(", ") : undefined}
          />
        )}
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Shown to the customer on the form, so they know what they&apos;re reviewing. Select more than one if several
          applied — leave blank for a general review.
        </p>
      </FieldGroup>

      <FieldGroup label="Note (for you only)" htmlFor="note">
        <Input id="note" name="note" placeholder="e.g. Logo project — Mar 2026" defaultValue={initialValues?.note} />
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Never shown to the customer — just helps you tell your own links apart.
        </p>
      </FieldGroup>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
