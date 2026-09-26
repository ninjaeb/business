"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// A second, compact entry point into the same search DirectorySearch's own
// hero box already offers — this one lives in the sticky header, so it's
// reachable from every public-facing page (a listing's own detail page, a
// category/location/industry page, signup, benefits), not just wherever
// DirectorySearch itself is rendered. Always submits to the bare directory
// home (never the page a visitor is currently on) — a header search box
// searching everything is the pattern visitors already know, and scoping it
// to whatever category/location a visitor happens to be browsing would be a
// surprise rather than a convenience. Submitting is a real navigation
// (there's no listings array here to filter in the browser the way
// DirectorySearch does), which is why DirectorySearch itself re-syncs its
// own query state from the URL — see its own initialQuery effect — so
// searching again from here while already on the directory home actually
// updates what's showing instead of only changing the address bar.
export function HeaderSearch({
  action,
  placeholder,
  className,
}: {
  action: string;
  placeholder: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `${action}?q=${encodeURIComponent(q)}` : action);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative min-w-0", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pl-8 text-sm"
      />
    </form>
  );
}
