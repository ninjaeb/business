"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useInquiry } from "@/components/directory/listing-inquiry";
import { cn } from "@/lib/utils";
import type { ServiceEntry } from "@/lib/directory";

// Each row is clickable — a persistent checkbox-style marker (not just a
// hover state) shows that up front, rather than a visitor having to
// discover it by accident. Picking one or more scrolls to the Get in touch
// card and prefills its message with an inquiry listing everything picked,
// so a visitor can ask about several things in one message instead of
// typing them out. A table rather than a plain list (compare the Hours
// card's own table, right beside this one) so a listing with several
// products/services reads as a scannable price list rather than a stack of
// separate cards.
export function ServiceList({ services }: { services: ServiceEntry[] }) {
  const { selectedServices, toggleService } = useInquiry();

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400 dark:text-slate-500">Tap a row to add it to your inquiry below.</p>
      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800">
        <table className="w-full text-base">
          <tbody>
            {services.map((service, index) => {
              const selected = selectedServices.includes(service.title);
              return (
                <tr
                  key={index}
                  onClick={() => toggleService(service.title)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    toggleService(service.title);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  className={cn(
                    "cursor-pointer border-b border-slate-100 align-top transition-colors last:border-b-0 dark:border-neutral-800",
                    selected ? "bg-led-soft dark:bg-led-soft-dark" : "hover:bg-slate-50 dark:hover:bg-neutral-800/60",
                  )}
                >
                  <td className="w-9 py-3 pl-3">
                    {selected ? (
                      <CheckCircle2 className="h-5 w-5 text-petrol dark:text-petrol-light" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 dark:text-neutral-700" />
                    )}
                  </td>
                  <td className="w-full py-3 pr-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{service.title}</h3>
                      {service.price && (
                        <span className="shrink-0 text-base font-medium text-petrol dark:text-petrol-light">{service.price}</span>
                      )}
                    </div>
                    {service.description && (
                      <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{service.description}</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
