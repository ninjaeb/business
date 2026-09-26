"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdminAction } from "@/lib/auth/dal";
import { regenerateSitemapFile } from "@/lib/sitemap-generator";
import { regenerateLlmsTxtFile } from "@/lib/llms-txt-generator";

// Fixed vocabulary a partner picks multiple of for their listing (see
// PartnerListingCategory in schema.prisma), seeded once via prisma/seed.ts
// rather than admin-created. Deleting a category a listing still has
// selected just drops that selection (PartnerListingCategory cascades) — an
// already-published listing's category badges don't change until it's next
// re-approved, same as every other field in publishedSnapshot. Regenerates
// sitemap.xml and llms.txt afterward — the category's own friendly page (in
// every language) needs to drop out of both.
export async function deleteBusinessCategory(id: string): Promise<void> {
  await requireAdminAction();
  await db.businessCategory.delete({ where: { id } });
  await Promise.all([regenerateSitemapFile(), regenerateLlmsTxtFile()]);
  revalidatePath("/admin");
  revalidatePath("/business-portal/listings");
  revalidatePath("/business-portal/listings/[id]", "layout");
}
