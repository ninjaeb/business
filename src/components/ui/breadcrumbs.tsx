import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1.5 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-neutral-700" />}
            {item.href && !isLast ? (
              // min-w-0: as a flex item, truncate's white-space: nowrap
              // makes its content-based minimum size equal its full
              // (unwrapped) width — without min-w-0 that wins over max-w
              // and the crumb never actually truncates. The max-w itself
              // is smaller below sm: this app's root font-size is 18px
              // (see globals.css), not the usual 16px, so these rem
              // values already render 12.5% wider than they look — at
              // the un-prefixed size a single crumb can eat the whole
              // width of a narrow phone screen and push the page wider
              // than the viewport.
              <Link
                href={item.href}
                className="min-w-0 max-w-[10rem] truncate text-slate-500 hover:text-indigo-600 hover:underline sm:max-w-[16rem] dark:text-slate-400"
              >
                {item.label}
              </Link>
            ) : (
              <span className="min-w-0 max-w-[12rem] truncate text-slate-500 sm:max-w-[20rem] dark:text-slate-400">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
