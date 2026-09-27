import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getGuideByIdForAdmin } from "@/lib/directory-guides";
import { publishGuideAction, unpublishGuideAction, deleteGuideAction } from "@/app/actions/directory-guides";
import { DEFAULT_DIRECTORY_LOCALE, directoryGuidePath } from "@/lib/directory-i18n";
import { GuideForm } from "@/components/admin/guide-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { buttonClasses } from "@/components/ui/button";

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const guide = await getGuideByIdForAdmin(id);
  if (!guide) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Guides", href: "/admin/guides" }, { label: guide.title || "(untitled)" }]}
        title={guide.title || "(untitled)"}
        actions={
          <>
            {guide.status === "PUBLISHED" && (
              <Link
                href={directoryGuidePath(DEFAULT_DIRECTORY_LOCALE, guide.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("secondary", "sm")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View live
              </Link>
            )}
            {guide.status === "PUBLISHED" ? (
              <form action={unpublishGuideAction.bind(null, guide.id)}>
                <ConfirmSubmitButton
                  variant="secondary"
                  size="sm"
                  confirmMessage="Unpublish this guide? It comes off the public site immediately."
                >
                  Unpublish
                </ConfirmSubmitButton>
              </form>
            ) : (
              <form action={publishGuideAction.bind(null, guide.id)}>
                <ConfirmSubmitButton
                  variant="primary"
                  size="sm"
                  confirmMessage="Publish this guide? It goes live on the public site immediately."
                  className="bg-led text-led-ink hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
                >
                  Publish
                </ConfirmSubmitButton>
              </form>
            )}
            <form action={deleteGuideAction.bind(null, guide.id)}>
              <ConfirmSubmitButton variant="danger" size="sm" confirmMessage="Delete this guide? This can't be undone.">
                Delete
              </ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <Card>
        <CardBody>
          <GuideForm guide={guide} />
        </CardBody>
      </Card>
    </div>
  );
}
