import Link from "next/link";
import { Handshake, Mail, Plus, Send } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { listBusinessPartnerLinksForPartner, listBusinessPartnerInvitesForPartner } from "@/lib/business-partners";
import {
  acceptBusinessPartnerLink,
  declineBusinessPartnerLink,
  removeBusinessPartnerLink,
  deleteBusinessPartnerInvite,
} from "@/app/actions/business-partners";
import { formatDate } from "@/lib/format";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalBusinessPartnersStrings } from "@/lib/portal-business-partners-i18n";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

// Two independent ways a partner connects with another business: a
// BusinessPartnerLink (both sides already on business.gotka.com, needs the
// recipient's approval — see requestBusinessPartner) and a
// BusinessPartnerInvite (the other business isn't on the platform yet, so
// there's nothing to link to — just a sent email/WhatsApp invite, see
// createBusinessPartnerInvite). Spans every listing this partner owns,
// same reasoning as the Testimonials/Review Links pages just above this
// one in the nav.
export default async function BusinessPartnersPage() {
  const [user, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalBusinessPartnersStrings(locale);
  const [links, invites] = await Promise.all([
    listBusinessPartnerLinksForPartner(user.id),
    listBusinessPartnerInvitesForPartner(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pageTitle}
        description={t.pageDescription}
        actions={
          <>
            <Link href="/business-portal/business-partners/invite" className={buttonClasses("secondary")}>
              <Mail className="h-4 w-4" />
              {t.inviteBusinessCta}
            </Link>
            <Link href="/business-portal/business-partners/new" className={buttonClasses()}>
              <Plus className="h-4 w-4" />
              {t.addPartnerCta}
            </Link>
          </>
        }
      />

      <Card>
        <CardBody>
          {links.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title={t.linksEmptyTitle}
              description={t.linksEmptyDescription}
              action={
                <Link href="/business-portal/business-partners/new" className={buttonClasses()}>
                  <Plus className="h-4 w-4" />
                  {t.addPartnerCta}
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">{t.colYourListing}</th>
                    <th className="py-2 pr-3 font-medium">{t.colBusiness}</th>
                    <th className="py-2 pr-3 font-medium">{t.colStatus}</th>
                    <th className="py-2 pr-3 font-medium">{t.colDate}</th>
                    <th className="py-2 pr-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {links.map((link) => {
                    const isRecipient = link.recipientListing.partnerId === user.id;
                    const mine = isRecipient ? link.recipientListing : link.requesterListing;
                    const other = isRecipient ? link.requesterListing : link.recipientListing;
                    return (
                      <tr key={link.id}>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{mine.companyName}</td>
                        <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{other.companyName}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          {link.status === "ACCEPTED" ? (
                            <Badge className="bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-500/30">
                              {t.statusConnected}
                            </Badge>
                          ) : link.status === "DECLINED" ? (
                            <Badge className="bg-rose-100 text-rose-700 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-400 dark:ring-rose-500/30">
                              {t.statusDeclined}
                            </Badge>
                          ) : isRecipient ? (
                            <Badge className="bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/30">
                              {t.statusAwaitingApproval}
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/30">
                              {t.statusRequestSent}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {formatDate(link.respondedAt ?? link.createdAt)}
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {link.status === "PENDING" && isRecipient && (
                              <>
                                <form action={acceptBusinessPartnerLink.bind(null, link.id)}>
                                  <Button type="submit" size="sm">
                                    {t.acceptCta}
                                  </Button>
                                </form>
                                <form action={declineBusinessPartnerLink.bind(null, link.id)}>
                                  <ConfirmSubmitButton
                                    confirmMessage={t.declineConfirm.replace("{business}", other.companyName)}
                                    variant="secondary"
                                  >
                                    {t.declineCta}
                                  </ConfirmSubmitButton>
                                </form>
                              </>
                            )}
                            {link.status !== "DECLINED" && !(link.status === "PENDING" && isRecipient) && (
                              <form action={removeBusinessPartnerLink.bind(null, link.id)}>
                                <ConfirmSubmitButton
                                  confirmMessage={
                                    link.status === "ACCEPTED"
                                      ? t.removeConfirm.replace("{business}", other.companyName)
                                      : t.cancelRequestConfirm.replace("{business}", other.companyName)
                                  }
                                >
                                  {link.status === "ACCEPTED" ? t.removeCta : t.cancelCta}
                                </ConfirmSubmitButton>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Send className="h-4 w-4 text-slate-400" />
            {t.invitedBusinessesHeading}
          </CardTitle>
        </CardHeader>
        <CardBody>
          {invites.length === 0 ? (
            <EmptyState
              icon={Mail}
              title={t.invitesEmptyTitle}
              description={t.invitesEmptyDescription}
              action={
                <Link href="/business-portal/business-partners/invite" className={buttonClasses("secondary")}>
                  <Mail className="h-4 w-4" />
                  {t.inviteBusinessCta}
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-neutral-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">{t.colCompany}</th>
                    <th className="py-2 pr-3 font-medium">{t.colContact}</th>
                    <th className="py-2 pr-3 font-medium">{t.colEmail}</th>
                    <th className="py-2 pr-3 font-medium">{t.colPhone}</th>
                    <th className="py-2 pr-3 font-medium">{t.colSent}</th>
                    <th className="py-2 pr-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {invites.map((invite) => (
                    <tr key={invite.id}>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{invite.companyName}</td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{invite.contactName}</td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{invite.email}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{invite.phone}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {invite.emailSentAt && (
                            <Badge className="bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-500/30">
                              {t.badgeEmail}
                            </Badge>
                          )}
                          {invite.whatsappSentAt && (
                            <Badge className="bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-500/30">
                              {t.badgeWhatsApp}
                            </Badge>
                          )}
                          {!invite.emailSentAt && !invite.whatsappSentAt && (
                            <Badge className="bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-neutral-800 dark:text-slate-300 dark:ring-slate-400/20">
                              {t.badgeNotSent}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <form action={deleteBusinessPartnerInvite.bind(null, invite.id)}>
                          <ConfirmSubmitButton confirmMessage={t.deleteInviteConfirm.replace("{business}", invite.companyName)}>
                            {t.deleteInviteCta}
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
