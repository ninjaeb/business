import { cn } from "@/lib/utils";

export function Card({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        // min-w-0: without it, a Card sitting in a grid/flex row (e.g. the
        // dashboard's lg:grid-cols-2 pairs) defaults to min-width: auto —
        // its own content's min-content size — and forces that whole
        // row/track wider than the viewport on mobile instead of letting
        // the Card's text wrap down to fit.
        "min-w-0 rounded-lg border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-neutral-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={cn(
        "text-sm font-semibold text-slate-900 dark:text-slate-100",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
