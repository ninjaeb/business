import Link from "next/link";
import { cn } from "@/lib/utils";

// These four destinations (browse by category, browse by location, latest
// products, news & promotions) are core enough to the directory that they
// shouldn't be hidden behind DirectoryNavMenu's hamburger — rendered twice
// by DirectoryChrome at two different breakpoints instead: inline next to
// the logo on lg+ screens (room for everything on one line), and as its own
// second row below that (see the lg:hidden/hidden lg:flex split there).
// Plain server-rendered links, no client state either way. Only one of the
// two ever renders visibly at a given width — the other is `display: none`
// via Tailwind's responsive classes, which also removes it from the
// accessibility tree, so there's never two competing landmarks for a
// screen reader despite two <nav> elements existing in the DOM.
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
        "flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-300",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 transition-colors hover:text-petrol dark:hover:text-petrol-light"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
