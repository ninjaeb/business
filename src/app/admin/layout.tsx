import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const TITLE = "Admin";
const DESCRIPTION = "Moderate business directory listings.";

// Nothing here should ever be indexed — everything past it requires
// requireAdmin.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

// A small, single-purpose admin section — just the one moderation page
// (src/app/admin/page.tsx) behind a session, not the CRM staff app's own
// full sidebar/chrome. requireAdmin redirects a non-admin (or a signed-out
// visitor, via src/proxy.ts) away before this ever renders.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex h-full min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <img src="/icon-192.png" alt="" className="h-8 w-8 shrink-0" />
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Business Directory Admin</span>
          </Link>
          <form action={logout} className="ml-auto">
            <Button type="submit" variant="secondary" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
