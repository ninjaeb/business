"use client";

import { useActionState, useState } from "react";
import { updateGuideAction, type GuideFormState } from "@/app/actions/directory-guides";
import { uploadDirectoryGuideImage } from "@/app/actions/directory-images";
import { MarkdownLiteEditor } from "@/components/directory/markdown-lite-editor";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import { INDUSTRIES, INDUSTRY_LABELS } from "@/lib/labels";
import { slugify } from "@/lib/slug";
import type { DirectoryGuide } from "@/generated/prisma/client";

export function GuideForm({ guide }: { guide: DirectoryGuide }) {
  const [state, formAction, pending] = useActionState<GuideFormState, FormData>(updateGuideAction.bind(null, guide.id), undefined);
  const values = state?.values;

  const [title, setTitle] = useState(values?.title ?? guide.title);
  const [slug, setSlug] = useState(values?.slug ?? guide.slug);
  // Follows the title until the admin edits the slug field directly —
  // same "auto-fill until manually touched" convention as a listing's own
  // AI Auto Create slug suggestion (see autoSlugSource in
  // partner-listing-form.tsx), just simpler: no separate AI-result source
  // to distinguish from typing, only "has this field been touched yet".
  const [slugTouched, setSlugTouched] = useState(false);
  const [body, setBody] = useState(values?.body ?? guide.body);

  function uploadImage(file: File) {
    const formData = new FormData();
    formData.set("image", file);
    return uploadDirectoryGuideImage(guide.id, formData);
  }

  return (
    <form action={formAction} className="space-y-5">
      <FieldGroup label="Title" htmlFor="title" required>
        <Input
          id="title"
          name="title"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          placeholder="The Complete Guide to Coworking Spaces in Malaysia"
        />
      </FieldGroup>

      <FieldGroup label="Slug" htmlFor="slug" required>
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
        />
        <p className="mt-1 text-xs text-slate-400">
          Live at /guides/{slug || "…"}. Changing this after the guide is published moves its URL — the old one stops
          working immediately.
        </p>
      </FieldGroup>

      <FieldGroup label="Industry" htmlFor="industry">
        <Select id="industry" name="industry" defaultValue={values?.industry ?? guide.industry ?? ""}>
          <option value="">None — not cross-linked from an industry page</option>
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {INDUSTRY_LABELS[industry]}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup label="Excerpt" htmlFor="excerpt" required>
        <Textarea
          id="excerpt"
          name="excerpt"
          required
          rows={2}
          defaultValue={values?.excerpt ?? guide.excerpt}
          placeholder="A short, direct summary — shown on the guides index and used as the fallback meta description."
          maxLength={300}
        />
      </FieldGroup>

      <FieldGroup label="Body" htmlFor="body" required>
        <MarkdownLiteEditor id="body" name="body" value={body} onChange={setBody} onUploadImage={uploadImage} rows={16} />
      </FieldGroup>

      <div className="rounded-md border border-slate-200 p-4 dark:border-neutral-800">
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Search &amp; social preview</h3>
        <div className="space-y-3">
          <FieldGroup label="SEO title" htmlFor="seoTitle">
            <Input id="seoTitle" name="seoTitle" defaultValue={values?.seoTitle ?? guide.seoTitle ?? ""} placeholder={title} />
          </FieldGroup>
          <FieldGroup label="SEO description" htmlFor="seoDescription">
            <Textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              defaultValue={values?.seoDescription ?? guide.seoDescription ?? ""}
              placeholder="Leave blank to use the excerpt automatically."
            />
          </FieldGroup>
        </div>
      </div>

      {state?.error && <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
