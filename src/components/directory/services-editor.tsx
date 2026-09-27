"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import type { ServiceEntry } from "@/lib/directory";

const EMPTY_SERVICE: ServiceEntry = { title: "", description: "", price: "" };
const MAX_SERVICES = 20;

// A repeatable table of {title, description, price} rows — one row per
// product/service, matching how they're shown on the public listing (see
// ServiceList) so what a partner fills in here reads back the same way
// there. Controlled (value/onChange), same division of labor as
// MarkdownLiteEditor — the parent form also reads `value` as AI-rewrite
// context, so it can't be this component's own internal state. Serializes
// to a single hidden JSON field on submit (see parseServicesJson in
// src/lib/directory.ts): a variable-length list doesn't map cleanly onto
// individually-named form fields the way OperatingHoursEditor's fixed
// seven days do.
export function ServicesEditor({
  name,
  value,
  onChange,
}: {
  name: string;
  value: ServiceEntry[];
  onChange: (services: ServiceEntry[]) => void;
}) {
  const services = value.length > 0 ? value : [EMPTY_SERVICE];

  function updateService(index: number, patch: Partial<ServiceEntry>) {
    onChange(services.map((service, i) => (i === index ? { ...service, ...patch } : service)));
  }

  function addService() {
    if (services.length >= MAX_SERVICES) return;
    onChange([...services, EMPTY_SERVICE]);
  }

  function removeService(index: number) {
    onChange(services.length > 1 ? services.filter((_, i) => i !== index) : [EMPTY_SERVICE]);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-neutral-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-800/60">
              <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                Service or product
              </th>
              <th scope="col" className="w-40 px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                Price
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                Description
              </th>
              <th scope="col" className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index} className="border-b border-slate-100 align-top last:border-b-0 dark:border-neutral-800">
                <td className="px-3 py-2">
                  <Input
                    value={service.title}
                    onChange={(event) => updateService(index, { title: event.target.value })}
                    placeholder="Service or product name"
                    maxLength={80}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={service.price}
                    onChange={(event) => updateService(index, { price: event.target.value })}
                    placeholder="e.g. RM 500"
                    maxLength={40}
                  />
                </td>
                <td className="px-3 py-2">
                  <Textarea
                    value={service.description}
                    onChange={(event) => updateService(index, { description: event.target.value })}
                    rows={2}
                    placeholder="What does this include? (optional)"
                    maxLength={300}
                  />
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    aria-label="Remove service"
                    title="Remove service"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addService}
        disabled={services.length >= MAX_SERVICES}
        className={buttonClasses("ghost", "sm")}
      >
        <Plus className="h-3.5 w-3.5" />
        Add service
      </button>
      <input type="hidden" name={name} value={JSON.stringify(services.filter((service) => service.title.trim()))} />
    </div>
  );
}
