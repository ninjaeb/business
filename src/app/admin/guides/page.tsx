import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { listAllGuidesForAdmin } from "@/lib/directory-guides";
import { createGuideAction } from "@/app/actions/directory-guides";
import { formatDate } from "@/lib/format";
import { INDUSTRY_LABELS, DIRECTORY_GUIDE_STATUS_BADGE_CLASSES, DIRECTORY_GUIDE_STATUS_LABELS } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminGuidesPage() {
  await requireAdmin();
  const guides = await listAllGuidesForAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Guides" }]}
        title="Guides"
        description="Long-form pillar content published by Gotka — see it live at /guides."
        actions={
          <form action={createGuideAction}>
            <button type="submit" className={buttonClasses("primary", "md")}>
              <Plus className="h-4 w-4" />
              New guide
            </button>
          </form>
        }
      />

      <Card>
        <CardBody>
          {guides.length === 0 ? (
            <EmptyState icon={BookOpen} title="No guides yet." description="Click New guide to write the first one." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">Title</th>
                    <th className="py-2 pr-3 font-medium">Industry</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Updated</th>
                    <th className="py-2 pr-3 font-medium">Author</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {guides.map((guide) => (
                    <tr key={guide.id}>
                      <td className="py-2.5 pr-3">
                        <Link
                          href={`/admin/guides/${guide.id}/edit`}
                          className="font-medium text-slate-800 hover:text-petrol dark:text-slate-200 dark:hover:text-petrol-light"
                        >
                          {guide.title || "(untitled)"}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {guide.industry ? INDUSTRY_LABELS[guide.industry] : "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge className={DIRECTORY_GUIDE_STATUS_BADGE_CLASSES[guide.status]}>
                          {DIRECTORY_GUIDE_STATUS_LABELS[guide.status]}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatDate(guide.updatedAt)}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{guide.authorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
