import Link from "next/link";
import { Link2, Plus } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listTestimonialRequestLinks, testimonialRequestUrl } from "@/lib/testimonial-request-links";
import { deleteTestimonialRequestLink } from "@/app/actions/testimonial-request-links";
import { getSiteOrigin } from "@/lib/site-url";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { CopyLinkButton } from "@/components/business-crm/copy-link-button";

// A partner's own shareable "please leave us a testimonial" links (see
// TestimonialRequestLink's own comment in prisma/schema.prisma) — spans
// every listing this partner owns, same reasoning as the Testimonials
// moderation page just above this one in the nav. Links always open to
// English (the generated URL hardcodes /en/) — the business-portal itself
// is English-only, same as every other partner-facing page, but the
// customer who opens the link can still switch locale on the page itself
// like any other visitor, and needs no account at all — see
// StandaloneTestimonialForm.
export default async function TestimonialRequestLinksPage() {
  const user = await requireCompletePartnerProfile();
  const [links, siteOrigin] = await Promise.all([listTestimonialRequestLinks(user.id), getSiteOrigin()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review links"
        description="Create a unique link to send a specific customer — no account needed on their end. It opens straight to a testimonial form, prefilled with whatever you already know about them."
        actions={
          <Link href="/business-portal/testimonial-links/new" className={buttonClasses()}>
            <Plus className="h-4 w-4" />
            New link
          </Link>
        }
      />

      <Card>
        <CardBody>
          {links.length === 0 ? (
            <EmptyState
              icon={Link2}
              title="No review links yet."
              description="Create one to send a customer straight to your testimonial form — tag it with what you did for them so the review has context."
              action={
                <Link href="/business-portal/testimonial-links/new" className={buttonClasses()}>
                  <Plus className="h-4 w-4" />
                  New link
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">Listing</th>
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 font-medium">Service</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Created</th>
                    <th className="py-2 pr-3 font-medium">Link</th>
                    <th className="py-2 pr-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {links.map((link) => (
                    <tr key={link.id}>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{link.listing.companyName}</td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                        {link.customerName || link.note || "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{link.serviceTitle || "—"}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {link.usedAt ? (
                          <Badge className="bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-500/30">
                            Used {formatDate(link.usedAt)}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/30">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(link.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <CopyLinkButton url={testimonialRequestUrl(siteOrigin, link.id)} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <form action={deleteTestimonialRequestLink.bind(null, link.id)}>
                          <ConfirmSubmitButton confirmMessage="Delete this review link? This can't be undone.">
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </td>
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
