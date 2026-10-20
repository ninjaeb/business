// Fetches one licensed stock photo for a guide from the Pexels API and saves
// it, optimized, into prisma/guide-images/ — the step the daily guide routine
// used to do through the Canva connector, which needs an interactive approval
// per call and so stalled the unattended routine.
//
//   PEXELS_API_KEY=... npx tsx scripts/fetch-guide-image.ts \
//     --query "malaysian small business owner reviewing documents" \
//     --out terminating-an-employee-in-malaysia-cover.webp [--pick 1]
//
// Prints the search hits (so the caller can judge fit) and which one was
// saved. Output is a WebP at quality 82, fit within 1600px — the same
// treatment as every other file in prisma/guide-images/ (seed.ts stores the
// file as-is). Photos already used by an earlier guide are skipped; credits
// are recorded in prisma/guide-images/pexels-credits.json. Pexels licenses
// photos for free commercial use without attribution, so the credits file is
// for provenance only.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGE_DIR = path.join(process.cwd(), "prisma", "guide-images");
const CREDITS_FILE = path.join(IMAGE_DIR, "pexels-credits.json");
const MAX_DIMENSION = 1600;

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  alt: string;
  src: { original: string; large2x: string; large: string };
};

type Credit = { file: string; pexelsId: number; photographer: string; url: string };

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function fail(message: string): never {
  console.error(`fetch-guide-image: ${message}`);
  process.exit(1);
}

async function main() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    fail(
      "PEXELS_API_KEY is not set. Add it as an environment variable in the cloud environment's settings (free key from pexels.com/api); it can't be fetched or invented here.",
    );
  }
  const query = arg("query");
  const out = arg("out");
  if (!query || !out || !out.endsWith(".webp") || out.includes("/")) {
    fail('usage: --query "<search>" --out <name>.webp [--pick <1-based index among unused hits>]');
  }
  const pick = Math.max(1, Number(arg("pick") ?? "1") || 1);

  const credits: Credit[] = existsSync(CREDITS_FILE) ? JSON.parse(readFileSync(CREDITS_FILE, "utf8")) : [];
  const used = new Set(credits.map((credit) => credit.pexelsId));

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("size", "large");
  url.searchParams.set("per_page", "30");
  const response = await fetch(url, { headers: { Authorization: key } });
  if (!response.ok) fail(`Pexels search failed: HTTP ${response.status}`);
  const { photos } = (await response.json()) as { photos: PexelsPhoto[] };

  const candidates = photos.filter((photo) => !used.has(photo.id) && photo.width >= 1600);
  if (candidates.length === 0) fail(`no unused landscape photos found for "${query}" — try a broader query`);
  candidates.slice(0, 8).forEach((photo, index) => console.log(`${index + 1}. ${photo.alt || "(no description)"} — ${photo.url}`));

  const chosen = candidates[Math.min(pick, candidates.length) - 1];
  const download = await fetch(chosen.src.large2x);
  if (!download.ok) fail(`download failed: HTTP ${download.status}`);
  const bytes = Buffer.from(await download.arrayBuffer());

  await sharp(bytes)
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(IMAGE_DIR, out));

  credits.push({ file: out, pexelsId: chosen.id, photographer: chosen.photographer, url: chosen.url });
  writeFileSync(CREDITS_FILE, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`saved prisma/guide-images/${out} — Pexels #${chosen.id} by ${chosen.photographer}: ${chosen.alt || "(no description)"}`);
}

main().catch((error) => fail(String(error)));
