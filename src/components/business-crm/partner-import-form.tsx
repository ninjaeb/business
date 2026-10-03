"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, UploadCloud } from "lucide-react";
import {
  confirmPartnerContactImport,
  previewPartnerContactImport,
  type ImportPreview,
  type ImportResult,
} from "@/app/actions/partner-contact-import";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { phoneMatchKey } from "@/lib/phone";
import type { DirectoryLocale } from "@/lib/directory-i18n";
import {
  PORTAL_CONTACTS_STRINGS,
  formatImportConfirmCta,
  formatImportPreviewSuffix,
  formatImportPreviewSummary,
  formatImportSummaryCompanyCreated,
  formatImportSummaryCreated,
  formatImportSummarySkippedDuplicate,
  formatImportSummarySkippedInvalid,
  formatImportSummaryUpdated,
} from "@/lib/portal-contacts-i18n";

// Business portal counterpart to the source CRM's system-wide ImportForm
// (src/components/contacts/import-form.tsx, which has no counterpart in
// this app) — same upload → preview → confirm flow, wired to the
// partner-scoped preview/confirm actions.
type Phase =
  | { name: "upload" }
  | { name: "preview"; preview: ImportPreview }
  | { name: "done"; result: ImportResult };

export function PartnerImportForm({ locale }: { locale: DirectoryLocale }) {
  const t = PORTAL_CONTACTS_STRINGS[locale];
  const [phase, setPhase] = useState<Phase>({ name: "upload" });
  const [error, setError] = useState<string | null>(null);
  const [fillMissingInfo, setFillMissingInfo] = useState(true);
  const [pending, startTransition] = useTransition();
  const uploadFormRef = useRef<HTMLFormElement>(null);

  function handleUpload(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await previewPartnerContactImport(formData);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setPhase({ name: "preview", preview: result });
    });
  }

  function handleConfirm(preview: ImportPreview) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("rows", JSON.stringify(preview.rows));
      formData.set("duplicateAction", fillMissingInfo ? "update" : "skip");
      const result = await confirmPartnerContactImport(formData);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setPhase({ name: "done", result });
    });
  }

  function startOver() {
    setError(null);
    setPhase({ name: "upload" });
    uploadFormRef.current?.reset();
  }

  if (phase.name === "done") {
    const { result } = phase;
    return (
      <Card>
        <CardBody className="space-y-4 text-center py-10">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.importDoneTitle}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatImportSummaryCreated(result.created, locale)}
              {result.updated > 0 && formatImportSummaryUpdated(result.updated, locale)}
              {result.companiesCreated > 0 && formatImportSummaryCompanyCreated(result.companiesCreated, locale)}
              {result.skippedDuplicates > 0 && formatImportSummarySkippedDuplicate(result.skippedDuplicates, locale)}
              {result.skippedInvalid > 0 && formatImportSummarySkippedInvalid(result.skippedInvalid, locale)}
              {t.importSummaryPeriod}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Link href="/business-portal/contacts" className="inline-flex">
              <Button variant="secondary">{t.viewContactsCta}</Button>
            </Link>
            <Button onClick={startOver}>{t.importAnotherFileCta}</Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (phase.name === "preview") {
    const { preview } = phase;
    return (
      <div className="space-y-4">
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {preview.fileName}
              </p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {formatImportPreviewSummary(preview.importableRows, preview.totalRows, locale)}
                {preview.skippedRows > 0 &&
                  formatImportPreviewSuffix("importPreviewSkippedSuffix", preview.skippedRows, locale)}
                {preview.duplicateEmails.length > 0 &&
                  formatImportPreviewSuffix("importPreviewDuplicateEmailSuffix", preview.duplicateEmails.length, locale)}
                {preview.duplicatePhones.length > 0 &&
                  formatImportPreviewSuffix("importPreviewDuplicatePhoneSuffix", preview.duplicatePhones.length, locale)}
                {t.importSummaryPeriod}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={fillMissingInfo}
                onChange={(event) => setFillMissingInfo(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {t.importFillMissingLabel}
            </label>
          </CardBody>
        </Card>

        {error && (
          <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </p>
        )}

        <Card>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">{t.importColumnName}</th>
                  <th className="px-4 py-2 font-medium">{t.importColumnEmail}</th>
                  <th className="px-4 py-2 font-medium">{t.importColumnPhone}</th>
                  <th className="px-4 py-2 font-medium">{t.importColumnCompany}</th>
                  <th className="px-4 py-2 font-medium">{t.importColumnStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {preview.rows.map((row) => {
                  const isDuplicate = Boolean(
                    (row.email &&
                      preview.duplicateEmails.some(
                        (email) => email.toLowerCase() === row.email!.toLowerCase(),
                      )) ||
                      (row.phone && preview.duplicatePhones.includes(phoneMatchKey(row.phone))),
                  );
                  return (
                    <tr key={row.row}>
                      <td className="px-4 py-2 text-slate-800 dark:text-slate-200">
                        {[row.firstName, row.lastName].filter(Boolean).join(" ") ||
                          "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {row.email ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {row.phone ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {row.companyName ?? "—"}
                      </td>
                      <td className="px-4 py-2">
                        {!row.importable ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {row.issues[0]}
                          </span>
                        ) : isDuplicate ? (
                          <span
                            className={cn(
                              "text-xs font-medium",
                              fillMissingInfo
                                ? "text-slate-500 dark:text-slate-400"
                                : "text-amber-600 dark:text-amber-400",
                            )}
                          >
                            {fillMissingInfo ? t.importDuplicateWillFill : t.importDuplicateWillSkip}
                          </span>
                        ) : row.issues.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {t.importNewRowPrefix}{row.issues[0]}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {t.importNewRowLabel}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={startOver} disabled={pending}>
            {t.importStartOverCta}
          </Button>
          <Button onClick={() => handleConfirm(preview)} disabled={pending}>
            {pending ? t.importingCta : formatImportConfirmCta(preview.importableRows, locale)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardBody>
        <form
          ref={uploadFormRef}
          action={handleUpload}
          className="flex flex-col items-center gap-4 py-8 text-center"
        >
          <UploadCloud className="h-10 w-10 text-slate-400" />
          <div>
            <Label htmlFor="file" className="sr-only">
              {t.importUploadFileLabel}
            </Label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
              className="block text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:text-slate-400 dark:file:bg-indigo-950 dark:file:text-indigo-300"
            />
            <p className="mt-2 text-xs text-slate-400">{t.importUploadHint}</p>
          </div>
          {error && (
            <p className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? t.importReadingFileCta : t.importPreviewCta}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
