import Link from "next/link";
import { Link2, Pencil, Plus } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listTestimonialRequestLinks, testimonialRequestUrl } from "@/lib/testimonial-request-links";
import { deleteTestimonialRequestLink } from "@/app/actions/testimonial-request-links";
import { getSiteOrigin } from "@/lib/site-url";
import { formatDate } from "@/lib/format";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalTestimonialsStrings } from "@/lib/portal-testimonials-i18n";
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
  const [user, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalTestimonialsStrings(locale);
  const [links, siteOrigin] = await Promise.all([listTestimonialRequestLinks(user.id), getSiteOrigin()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.linksPageTitle}
        description={t.linksPageDescription}
        actions={
          <Link href="/business-portal/testimonial-links/new" className={buttonClasses()}>
            <Plus className="h-4 w-4" />
            {t.newRequestCta}
          </Link>
        }
      />

      <Card>
        <CardBody>
          {links.length === 0 ? (
            <EmptyState
              icon={Link2}
              title={t.linksEmptyTitle}
              description={t.linksEmptyDescription}
              action={
                <Link href="/business-portal/testimonial-links/new" className={buttonClasses()}>
                  <Plus className="h-4 w-4" />
                  {t.newRequestCta}
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">{t.colListing}</th>
                    <th className="py-2 pr-3 font-medium">{t.colCustomer}</th>
                    <th className="py-2 pr-3 font-medium">{t.colService}</th>
                    <th className="py-2 pr-3 font-medium">{t.colStatus}</th>
                    <th className="py-2 pr-3 font-medium">{t.colCreated}</th>
                    <th className="py-2 pr-3 font-medium">{t.colLink}</th>
                    <th className="py-2 pr-3 font-medium"></th>
                    <th className="py-2 pr-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {links.map((link) => (
                    <tr key={link.id}>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{link.listing.companyName}</td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                        {link.customerName || link.note || t.emptyValuePlaceholder}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{link.serviceTitle || t.emptyValuePlaceholder}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {link.usedAt ? (
                          <Badge className="bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-500/30">
                            {t.usedOnLabel.replace("{date}", formatDate(link.usedAt))}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/30">
                            {t.statusPendingUse}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(link.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <CopyLinkButton url={testimonialRequestUrl(siteOrigin, link.id)} locale={locale} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Link href={`/business-portal/testimonial-links/${link.id}/edit`} className={buttonClasses("secondary", "sm")}>
                          <Pencil className="h-3.5 w-3.5" />
                          {t.editCta}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3">
                        <form action={deleteTestimonialRequestLink.bind(null, link.id)}>
                          <ConfirmSubmitButton confirmMessage={t.deleteConfirm}>{t.deleteCta}</ConfirmSubmitButton>
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
