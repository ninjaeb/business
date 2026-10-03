"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminAction } from "@/lib/auth/dal";
import { MESSAGE_TEMPLATE_DEFINITIONS, type MessageTemplateKey } from "@/lib/message-templates";
import type { DirectoryLocale } from "@/lib/directory-i18n";

const saveSchema = z.object({
  key: z.string().trim().min(1),
  locale: z.string().trim().min(1),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1, "Message text is required."),
});

export type MessageTemplateFormState = { error: string } | { success: true } | undefined;

function assertKnownKey(key: string): asserts key is MessageTemplateKey {
  if (!(key in MESSAGE_TEMPLATE_DEFINITIONS)) throw new Error("Unknown template.");
}

// Every field here is admin-authored copy, not user input reaching a
// visitor's browser unescaped — same trust level as the rest of /admin
// (this page is behind requireAdminAction the same as every other admin
// mutation). {token} placeholders are substituted verbatim by
// fillMessageTemplate at send time, so there's nothing to validate about
// their shape beyond "is this a key this app actually knows about."
export async function saveMessageTemplate(_prevState: MessageTemplateFormState, formData: FormData): Promise<MessageTemplateFormState> {
  await requireAdminAction();
  const parsed = saveSchema.safeParse({
    key: formData.get("key"),
    locale: formData.get("locale"),
    subject: formData.get("subject") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid template." };
  }
  assertKnownKey(parsed.data.key);
  const definition = MESSAGE_TEMPLATE_DEFINITIONS[parsed.data.key];

  await db.messageTemplate.upsert({
    where: { key_locale: { key: parsed.data.key, locale: parsed.data.locale } },
    create: {
      key: parsed.data.key,
      locale: parsed.data.locale,
      subject: definition.hasSubject ? (parsed.data.subject ?? null) : null,
      body: parsed.data.body,
    },
    update: {
      subject: definition.hasSubject ? (parsed.data.subject ?? null) : null,
      body: parsed.data.body,
    },
  });
  revalidatePath("/admin/messages");
  return { success: true };
}

// Deletes the override row outright — getMessageTemplate's own fallback to
// MESSAGE_TEMPLATE_DEFINITIONS's built-in default then just takes over
// again, same as if this key/locale had never been customized.
export async function resetMessageTemplate(key: string, locale: DirectoryLocale): Promise<void> {
  await requireAdminAction();
  assertKnownKey(key);
  await db.messageTemplate.deleteMany({ where: { key, locale } });
  revalidatePath("/admin/messages");
}
