import { Heart, Megaphone, MessageCircle, RotateCw, Share2, Trash2 } from "lucide-react";
import { requireCompletePartnerProfile } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { listPartnerPostsForPartner } from "@/lib/partner-posts";
import { isFacebookAuthConfigured } from "@/lib/auth/facebook";
import { getFacebookPostEngagement } from "@/lib/facebook";
import { decryptSecret } from "@/lib/secret-crypto";
import { createPartnerPost, deletePartnerPost, retryFacebookCrossPost } from "@/app/actions/partner-posts";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PostComposer } from "@/components/business-crm/post-composer";
import { PostToGoogleButton } from "@/components/business-crm/post-to-google-button";

const KIND_BADGE_CLASSES: Record<"NEWS" | "PROMOTION", string> = {
  NEWS: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-400 dark:ring-sky-500/30",
  PROMOTION: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/30",
};

const FB_CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  facebook_unavailable: "Facebook isn't configured on this deployment.",
  facebook_failed: "Connecting Facebook didn't go through — try again.",
  facebook_no_pages: "That Facebook account doesn't manage any Pages — you need to be an admin of a Page to connect it.",
};

// The business portal's "write a post" home — a composer (see
// PostComposer) above a feed of this partner's own posts, across every
// listing they own, same "spans every listing" shape as
// PartnerTestimonialsPage. Also where /api/facebook/callback lands a
// partner back after connecting (or failing to connect) a Facebook Page —
// see the fbConnected/fbError search params below.
export default async function PartnerPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ fbConnected?: string; fbError?: string }>;
}) {
  const partner = await requireCompletePartnerProfile();
  const { fbConnected, fbError } = await searchParams;

  const [listings, posts] = await Promise.all([
    db.partnerListing.findMany({ where: { partnerId: partner.id }, select: { id: true, companyName: true }, orderBy: { companyName: "asc" } }),
    listPartnerPostsForPartner(partner.id),
  ]);

  const facebookConfigured = isFacebookAuthConfigured();
  const connections = facebookConfigured
    ? await db.facebookPageConnection.findMany({
        where: { listingId: { in: listings.map((listing) => listing.id) } },
        select: { listingId: true, pageName: true, encryptedAccessToken: true },
      })
    : [];
  const connectedPages = Object.fromEntries(connections.map((connection) => [connection.listingId, connection.pageName]));

  // Like/comment counts for a post this app itself published — the real use
  // behind the pages_read_engagement permission (see getFacebookPostEngagement's
  // own comment). Only fetched for posts that actually have a
  // facebookPostId, using that same post's own listing's connection.
  const tokenByListing = new Map(connections.map((connection) => [connection.listingId, decryptSecret(connection.encryptedAccessToken)]));
  const engagementEntries = await Promise.all(
    posts
      .filter((post) => post.facebookPostId)
      .map(async (post) => {
        const accessToken = tokenByListing.get(post.listingId);
        if (!accessToken) return null;
        const engagement = await getFacebookPostEngagement(post.facebookPostId!, accessToken);
        return engagement ? ([post.id, engagement] as const) : null;
      }),
  );
  const engagementByPostId = new Map(engagementEntries.filter((entry) => entry !== null));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Posts"
        description="Share a quick update — it publishes instantly to your listing's Posts tab, and optionally to your connected Facebook Page."
      />

      {fbConnected && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          Connected to {fbConnected}.
        </p>
      )}
      {fbError && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-400">
          {FB_CALLBACK_ERROR_MESSAGES[fbError] ?? "Something went wrong connecting Facebook."}
        </p>
      )}

      {listings.length === 0 ? (
        <EmptyState icon={Megaphone} title="Add a business first" description="You need at least one listing before you can post." />
      ) : (
        <Card>
          <CardBody>
            <PostComposer action={createPartnerPost} listings={listings} connectedPages={connectedPages} facebookConfigured={facebookConfigured} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          {posts.length === 0 ? (
            <EmptyState icon={Megaphone} title="No posts yet" description="Whatever you post above will show up here." />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
              {posts.map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={KIND_BADGE_CLASSES[post.kind]}>{post.kind === "PROMOTION" ? "Promotion" : "News"}</Badge>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{post.title}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {post.listing.companyName} · {formatDate(post.createdAt)}
                    </p>
                    {post.facebookPostId && (
                      <p className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Share2 className="h-3 w-3 text-[#1877F2]" />
                          Posted to Facebook
                        </span>
                        {engagementByPostId.has(post.id) && (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {engagementByPostId.get(post.id)!.likes}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {engagementByPostId.get(post.id)!.comments}
                            </span>
                          </span>
                        )}
                      </p>
                    )}
                    {post.facebookPostError && !post.facebookPostId && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                        <span>Facebook: {post.facebookPostError}</span>
                        <form action={retryFacebookCrossPost.bind(null, post.id)}>
                          <button type="submit" className="inline-flex items-center gap-1 font-medium hover:underline">
                            <RotateCw className="h-3 w-3" />
                            Retry
                          </button>
                        </form>
                      </div>
                    )}
                    <div className="mt-1">
                      <PostToGoogleButton title={post.title} body={post.body} googleBusinessProfileUrl={post.listing.googleBusinessProfileUrl} />
                    </div>
                  </div>
                  <form action={deletePartnerPost.bind(null, post.id)}>
                    <button
                      type="submit"
                      aria-label="Delete post"
                      title="Delete post"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
