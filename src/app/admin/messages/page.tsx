import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { DIRECTORY_LOCALES } from "@/lib/directory-i18n";
import { MESSAGE_TEMPLATE_DEFINITIONS, getMessageTemplate, type MessageTemplateKey } from "@/lib/message-templates";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageTemplateEditor } from "@/components/settings/message-template-editor";

const EMAIL_KEYS: MessageTemplateKey[] = [
  "lead_notification_email",
  "testimonial_notification_email",
  "business_partner_request_email",
  "business_partner_invite_email",
  "lead_reply_email",
];
const WHATSAPP_KEYS: MessageTemplateKey[] = ["lead_reply_whatsapp_draft", "contact_whatsapp", "recommend_message", "footer_whatsapp"];

async function TemplateCard({ templateKey }: { templateKey: MessageTemplateKey }) {
  const definition = MESSAGE_TEMPLATE_DEFINITIONS[templateKey];
  const locales = definition.perLocale ? DIRECTORY_LOCALES.map((l) => l.code) : (["en"] as const);
  const resolved = await Promise.all(locales.map((locale) => getMessageTemplate(templateKey, locale)));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{definition.label}</CardTitle>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{definition.description}</p>
        </div>
      </CardHeader>
      <CardBody>
        {locales.map((locale, index) => (
          <MessageTemplateEditor
            key={locale}
            templateKey={templateKey}
            locale={locale}
            hasSubject={definition.hasSubject}
            subject={resolved[index].subject}
            body={resolved[index].body}
            isCustomized={resolved[index].isCustomized}
            tokens={definition.tokens}
            showLocaleLabel={definition.perLocale}
          />
        ))}
      </CardBody>
    </Card>
  );
}

// Every built-in email/WhatsApp message this app sends or hands a visitor
// as a prefilled draft, in one place an admin can rewrite without a
// redeploy — see MESSAGE_TEMPLATE_DEFINITIONS in src/lib/message-templates.ts
// for the canonical list this page just renders one Card per key from.
export default async function AdminMessagesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Message templates" }]}
        title="Message templates"
        description="Customize the wording of every automatic email and WhatsApp message this app sends — changes apply immediately, with no redeploy needed."
      />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</h2>
        <div className="space-y-4">
          {EMAIL_KEYS.map((key) => (
            <TemplateCard key={key} templateKey={key} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">WhatsApp</h2>
        <div className="space-y-4">
          {WHATSAPP_KEYS.map((key) => (
            <TemplateCard key={key} templateKey={key} />
          ))}
        </div>
        <Card>
          <CardBody className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <strong className="font-semibold text-slate-800 dark:text-slate-100">New-lead WhatsApp alert to partners</strong>{" "}
              isn&apos;t editable here — it sends through a Meta-approved WhatsApp Business template (
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-neutral-800">new_directory_lead_notification</code>),
              and its wording has to be changed and re-approved directly in Meta Business Manager, not from this app.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <strong className="font-semibold text-slate-800 dark:text-slate-100">Business Partner invite WhatsApp message</strong>{" "}
              is the same — its own template (
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-neutral-800">business_partner_invite</code>) is edited
              and re-approved in Meta Business Manager, not here.
            </p>
          </CardBody>
        </Card>
      </div>

      <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
        ← Back to admin
      </Link>
    </div>
  );
}
