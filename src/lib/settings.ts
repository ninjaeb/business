import { cache } from "react";
import { db } from "@/lib/db";
import type { DirectoryApprovalMode } from "@/generated/prisma/client";

const SETTINGS_ID = "singleton";

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  currency: "USD",
  directoryApprovalMode: "EVERY_SUBMISSION" as DirectoryApprovalMode,
};

export const getSettings = cache(async () => {
  const settings = await db.settings.findUnique({ where: { id: SETTINGS_ID } });
  return settings ?? DEFAULT_SETTINGS;
});

export async function getCurrency() {
  const settings = await getSettings();
  return settings.currency;
}

export async function setCurrency(currency: string) {
  await db.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, currency },
    update: { currency },
  });
}

// Settings → Directory's "Listing approval" control — see
// DirectoryApprovalMode in schema.prisma for what each value means.
export async function getDirectoryApprovalMode() {
  const settings = await getSettings();
  return settings.directoryApprovalMode;
}

export async function setDirectoryApprovalMode(mode: DirectoryApprovalMode) {
  await db.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, directoryApprovalMode: mode },
    update: { directoryApprovalMode: mode },
  });
}
