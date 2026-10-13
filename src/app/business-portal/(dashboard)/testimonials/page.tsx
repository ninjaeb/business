import { db } from "@/lib/db";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { approveDirectoryTestimonial, rejectDirectoryTestimonial } from "@/app/actions/testimonials";
import { formatDate } from "@/lib/format";
import { getDirectoryLocale } from "@/lib/directory-locale";
import { getPortalTestimonialsStrings } from "@/lib/portal-testimonials-i18n";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRating } from "@/components/ui/star-rating";
import { MessageSquareQuote } from "lucide-react";

const STATUS_BADGE_CLASSES: Record<"PENDING" | "APPROVED" | "REJECTED", string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
};

// Testimonial moderation, moved here from /admin — a testimonial is about
// one specific listing, and that listing's own partner is the one with the
// context (and the stake) to judge whether it's genuine, unlike listing
// edits, which stay admin-approved (see approveDirectoryTestimonial's own
// comment). Spans every listing this partner owns (see PartnerListingsPage's
// own "a partner account can list more than one business"), grouped so the
// ones needing a decision are never buried under ones that already have one.
export default async function PartnerTestimonialsPage() {
  const [user, locale] = await Promise.all([requireCompletePartnerProfile(), getDirectoryLocale()]);
  const t = getPortalTestimonialsStrings(locale);
  const STATUS_LABEL: Record<"PENDING" | "APPROVED" | "REJECTED", string> = {
    PENDING: t.moderationStatusPending,
    APPROVED: t.moderationStatusApproved,
    REJECTED: t.moderationStatusRejected,
  };
  const testimonials = await db.directoryTestimonial.findMany({
    where: { listing: { partnerId: user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { companyName: true, slug: true } },
      images: { orderBy: { createdAt: "asc" }, select: { id: true } },
    },
  });
  const pending = testimonials.filter((item) => item.status === "PENDING");
  const reviewed = testimonials.filter((item) => item.status !== "PENDING");

  return (
    <div className="space-y-6">
      <PageHeader title={t.pageTitle} description={t.pageDescription} />

      <Card>
        <CardHeader>
          <CardTitle>{t.awaitingReviewHeading}</CardTitle>
        </CardHeader>
        <CardBody>
          {pending.length === 0 ? (
            <EmptyState icon={MessageSquareQuote} title={t.awaitingReviewEmptyTitle} description={t.awaitingReviewEmptyDescription} />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
              {pending.map((testimonial) => (
                <li key={testimonial.id} className="space-y-3 py-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {testimonial.authorName}
                        {/* Only set when this testimonial came through one
                            of this partner's own request links (see
                            /business-portal/testimonial-links) — lets them
                            tell which job a review is actually about. */}
                        {testimonial.serviceTitle && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-led-soft px-2 py-0.5 text-xs font-medium text-petrol-ink dark:bg-led-soft-dark dark:text-petrol-light">
                            {testimonial.serviceTitle}
                          </span>
                        )}
                      </p>
                      {(testimonial.authorTitle || testimonial.authorCompany) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {[testimonial.authorTitle, testimonial.authorCompany].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {testimonial.listing.companyName} · {formatDate(testimonial.createdAt)}
                      </p>
                    </div>
                    {testimonial.rating && <StarRating rating={testimonial.rating} />}
                  </div>
                  <p className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
                    {testimonial.body}
                  </p>
                  {testimonial.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {testimonial.images.map((image) => (
                        // eslint-disable-next-line @next/next/no-img-element -- served straight out of the DB by /api/directory-images, same reasoning as ListingLogo
                        <img
                          key={image.id}
                          src={`/api/directory-images/${image.id}`}
                          alt="Attached to this testimonial"
                          className="h-16 w-16 rounded object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={approveDirectoryTestimonial.bind(null, testimonial.id)}>
                      <Button type="submit" size="sm">
                        {t.approveCta}
                      </Button>
                    </form>
                    <form action={rejectDirectoryTestimonial.bind(null, testimonial.id)} className="flex items-center gap-2">
                      <Input name="note" required placeholder={t.rejectNotePlaceholder} className="!h-8 w-56 text-xs" />
                      <Button type="submit" size="sm" variant="secondary">
                        {t.rejectCta}
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {reviewed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.alreadyReviewedHeading}</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
              {reviewed.map((testimonial) => (
                <li key={testimonial.id} className="space-y-1.5 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {testimonial.authorName} <span className="font-normal text-slate-400">· {testimonial.listing.companyName}</span>
                      {testimonial.serviceTitle && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-led-soft px-2 py-0.5 text-xs font-medium text-petrol-ink dark:bg-led-soft-dark dark:text-petrol-light">
                          {testimonial.serviceTitle}
                        </span>
                      )}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[testimonial.status]}`}>
                      {STATUS_LABEL[testimonial.status]}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{testimonial.body}</p>
                  {testimonial.status === "REJECTED" && testimonial.reviewNote && (
                    <p className="text-xs italic text-slate-400">
                      {t.yourNotePrefix} {testimonial.reviewNote}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
