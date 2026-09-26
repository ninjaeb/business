import { ShareButton } from "@/components/directory/share-button";

// The "Recommend the Business" pill pinned to the foot of a listing page,
// shown to every visitor: one floating button that opens the same share
// menu as the header's Recommend button, with the same referral-tracking
// link (?ref=recommend, see recommendUrl). It's the always-in-reach
// version of that button — a visitor reading down a long listing
// shouldn't have to scroll back up to recommend it to a friend.
//
// The page's own fixed bottom jump bar (Services / Get in touch — see the
// listing page) is shown at every width now, so this pill always floats
// just above it rather than covering it.
export function RecommendBar({
  title,
  url,
  message,
  label,
}: {
  title: string;
  url: string;
  message: string;
  label: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="pointer-events-auto">
        <ShareButton
          title={title}
          url={url}
          message={message}
          label={label}
          icon="recommend"
          variant="primary"
          size="md"
          menuPlacement="above"
          menuAlign="center"
          className="rounded-full bg-led px-6 text-base text-led-ink shadow-lg hover:bg-led-hover active:bg-led-active focus-visible:ring-led"
        />
      </div>
    </div>
  );
}
