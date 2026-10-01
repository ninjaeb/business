import { cn } from "@/lib/utils";

// A small uppercase-tracked pill sitting above a section heading — the
// template's own "eyebrow" label (e.g. "DRIVEN BY INTELLIGENT AI AGENTS").
// Pixel-sampled off the live template: the pill itself is a LIGHT blue fill
// with dark navy text, not the dark-pill/light-text guess this started as —
// bg-led-soft/text-petrol-ink matches that sample, not bg-petrol-ink. Kept
// separate from Badge above: that one marks data (a status, a service tag)
// and takes a caller-supplied color; this one is purely decorative chrome
// around a heading, so it owns its own fixed style.
export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-led-soft px-3 py-1 text-xs font-semibold tracking-wide text-petrol-ink uppercase dark:bg-led-soft-dark dark:text-petrol-light",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/30",
        className,
      )}
    >
      {children}
    </span>
  );
}
