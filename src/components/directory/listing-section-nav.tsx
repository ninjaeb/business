"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// A tab-like row of links to this listing's own sections (About, Products &
// Services, News, etc.) — each its own real page now (see
// src/app/[locale]/[slug]/layout.tsx and its section route folders), not an
// anchor within one single page the way this used to work, so "use client"
// + usePathname() here just tells the current page's own tab apart from the
// rest; no scroll-spy needed since there's nothing to scroll past on another
// tab's page anymore.
export function ListingSectionNav({
  sections,
  navLabel,
}: {
  sections: { href: string; label: string }[];
  navLabel: string;
}) {
  const pathname = usePathname();
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label={navLabel}
      className="mt-4 -mb-4 flex gap-5 overflow-x-auto border-t border-slate-200 pt-0.5 dark:border-neutral-800"
    >
      {sections.map((section) => {
        const isActive = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-petrol text-petrol-ink dark:border-petrol-light dark:text-petrol-light"
                : "border-transparent text-slate-500 hover:border-petrol/40 hover:text-petrol-ink dark:text-slate-400 dark:hover:text-petrol-light",
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
