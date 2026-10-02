import { cn } from "@/lib/utils";
import { ExternalLink } from "@/components/ui/external-link";

export function Linkify({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <p className={cn("whitespace-pre-wrap break-words", className)}>
      {parts.map((part, i) =>
        /^https?:\/\/[^\s]+$/.test(part) ? (
          <ExternalLink
            key={i}
            href={part}
            className="text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
          >
            {part}
          </ExternalLink>
        ) : (
          part
        ),
      )}
    </p>
  );
}
