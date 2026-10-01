import { LOCALE_ONLY_NOTICE, type DirectoryLegalCopy } from "@/lib/directory-legal-copy";
import type { DirectoryLocale } from "@/lib/directory-i18n";

// Shared shell for /privacy and /terms — both pages differ only in which
// DirectoryLegalCopy they pass in, so the layout (title, effective date,
// the two notice banners, section list) lives here once rather than
// duplicated across two nearly-identical page.tsx files.
export function LegalPageContent({ copy, locale }: { copy: DirectoryLegalCopy; locale: DirectoryLocale }) {
  const localeNotice = LOCALE_ONLY_NOTICE[locale];

  return (
    <div className="w-full px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        {/* Left-aligned, no gradient hero band — unlike the marketing pages
            (About/Benefits/Contact/Editorial Policy), a centered hero would
            read oddly in front of dense legal text. Just the bolder house
            type scale, kept plain otherwise. */}
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">{copy.heroTitle}</h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">{copy.heroSubtitle}</p>
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Effective {copy.effectiveDate}</p>

        {localeNotice && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-300">
            {localeNotice}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {copy.draftNotice}
        </div>

        <div className="mt-10 space-y-8">
          {copy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.heading}</h2>
              <div className="mt-2 space-y-2">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-slate-600 dark:text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
