"use client";

import { useActionState } from "react";
import { saveMessageTemplate, resetMessageTemplate } from "@/app/actions/message-templates";
import type { MessageTemplateKey } from "@/lib/message-templates";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

const LOCALE_LABELS: Record<DirectoryLocale, string> = { en: "English", zh: "中文", ms: "Bahasa Melayu" };

// One (key, locale) pair's own save form — a per-locale template (see
// MessageTemplateDefinition.perLocale) renders one of these per
// DirectoryLocale; a single-locale one (every email, both WhatsApp drafts
// outside the two public-facing ones) renders exactly one, always under
// "en".
export function MessageTemplateEditor({
  templateKey,
  locale,
  hasSubject,
  subject,
  body,
  isCustomized,
  tokens,
  showLocaleLabel,
}: {
  templateKey: MessageTemplateKey;
  locale: DirectoryLocale;
  hasSubject: boolean;
  subject: string | null;
  body: string;
  isCustomized: boolean;
  tokens: { name: string; description: string }[];
  // Only shown for a perLocale template, where three of these stack inside
  // one card and each needs its own language heading.
  showLocaleLabel: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveMessageTemplate, undefined);
  const idPrefix = `${templateKey}-${locale}`;

  return (
    <div className="space-y-2 border-t border-slate-100 py-4 first:border-t-0 first:pt-0 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        {showLocaleLabel ? (
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{LOCALE_LABELS[locale]}</p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {isCustomized && (
            <Badge className="bg-indigo-100 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950 dark:text-indigo-400 dark:ring-indigo-500/30">
              Customized
            </Badge>
          )}
          {isCustomized && (
            <form action={resetMessageTemplate.bind(null, templateKey, locale)}>
              <Button type="submit" variant="ghost" size="sm">
                Reset to default
              </Button>
            </form>
          )}
        </div>
      </div>

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="key" value={templateKey} />
        <input type="hidden" name="locale" value={locale} />

        {hasSubject && (
          <Input
            id={`${idPrefix}-subject`}
            name="subject"
            defaultValue={subject ?? ""}
            placeholder="Subject line"
            aria-label="Subject"
          />
        )}
        <Textarea
          id={`${idPrefix}-body`}
          name="body"
          rows={hasSubject ? 5 : 3}
          defaultValue={body}
          required
          aria-label="Message"
          className="text-sm"
        />

        {tokens.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Available: {tokens.map((token) => token.name).join(", ")}
          </p>
        )}
        {state && "error" in state && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
