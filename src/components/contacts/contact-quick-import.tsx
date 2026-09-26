"use client";

import { useRef, useState } from "react";
import { Camera, FileUp } from "lucide-react";
import { compressImage } from "@/lib/image-compression";
import { buttonClasses } from "@/components/ui/button";
import type { ContactDraft } from "@/lib/contact-draft";
import type { ScanCardResult } from "@/app/actions/scan-partner-business-card";
import type { ImportVCardResult } from "@/app/actions/import-partner-vcard";

// The scan/import actions are passed in rather than imported directly — the
// source CRM has both a system-wide pair and a partner-scoped pair (system
// resolves a company against a shared Company table, the partner-scoped
// ones against PartnerCompany); this app only ever has the partner-scoped
// pair, but the component stays agnostic to which action it's driving so it
// matches the source's shape exactly.
export function ContactQuickImport({
  onImported,
  scanAction,
  importAction,
}: {
  onImported: (draft: ContactDraft) => void;
  scanAction: (formData: FormData) => Promise<ScanCardResult>;
  importAction: (formData: FormData) => Promise<ImportVCardResult>;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const vcardInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<"photo" | "vcard" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPending("photo");
    setError(null);
    const compressed = file.type.startsWith("image/") ? await compressImage(file) : file;
    const formData = new FormData();
    formData.set("photo", compressed);
    const result = await scanAction(formData);
    setPending(null);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    onImported(result.data);
  }

  async function handleVCard(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPending("vcard");
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await importAction(formData);
    setPending(null);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    onImported(result.data);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          disabled={pending !== null}
          className={buttonClasses("secondary", "sm")}
        >
          <Camera className="h-4 w-4" />
          {pending === "photo" ? "Reading card…" : "Scan a business card"}
        </button>

        <input
          ref={vcardInputRef}
          type="file"
          accept=".vcf,text/vcard,text/x-vcard"
          onChange={handleVCard}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => vcardInputRef.current?.click()}
          disabled={pending !== null}
          className={buttonClasses("secondary", "sm")}
        >
          <FileUp className="h-4 w-4" />
          {pending === "vcard" ? "Reading file…" : "Import a vCard (.vcf)"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
