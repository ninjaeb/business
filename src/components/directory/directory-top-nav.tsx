import Link from "next/link";
import { cn } from "@/lib/utils";

// These four destinations (browse by category, browse by location, latest
// products, news & promotions) — rendered by DirectoryChrome inline next to
// the logo, but only at lg+ (hidden below that breakpoint, where there's no
// longer room for a whole extra nav row — see DirectoryNavMenu's own
// lg:hidden block for the same four links below lg instead). Plain
// server-rendered links, no client state.
export function DirectoryTopNav({
  navLabel,
  items,
  className,
}: {
  navLabel: string;
  items: { href: string; label: string }[];
  // Caller-supplied border/padding/visibility — the two instances above
  // need different chrome (a bordered second row vs. an inline group), so
  // neither is baked in here.
  className?: string;
}) {
  return (
    <nav
      aria-label={navLabel}
      className={cn(
        "flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-300",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          // rounded-full px-3 py-1.5: the template's own pill-on-hover nav
          // treatment — gap-4's old spacing moved onto this padding instead,
          // so links still read as separated once each gets its own pill.
          className="shrink-0 rounded-full px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-petrol dark:hover:bg-neutral-800 dark:hover:text-petrol-light"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
