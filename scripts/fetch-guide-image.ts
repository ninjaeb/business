// Picks a stock photo for a guide from a vetted pool and saves it, optimized,
// into prisma/guide-images/ — the step the daily guide routine used to do
// through the Canva connector, whose per-call approvals stalled the unattended
// routine. Needs no API key and no connector: photos come from Pexels' public
// image CDN (free for commercial use, attribution not required), and the pool
// of already-vetted photos lives in prisma/guide-images/stock-pool.json.
//
//   npx tsx scripts/fetch-guide-image.ts --list [--tag finance]
//   npx tsx scripts/fetch-guide-image.ts --id 8296970 --out <slug>-cover.webp
//
// --list prints the pool photos not yet used by a guide (optionally only those
// carrying a tag). --id downloads one at 1600px, converts it to WebP at quality
// 82 (same treatment as every other file in prisma/guide-images/; seed.ts
// stores the file as-is) and marks it used in the pool so no two guides share
// a photo. An id that isn't in the pool yet is accepted too (found on a Pexels
// search page, whose photo URLs end in the id) — pass --tags a,b --desc "..."
// to record it in the pool for next time. Check the saved image yourself
// before keeping it.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const IMAGE_DIR = path.join(process.cwd(), "prisma", "guide-images");
const POOL_FILE = path.join(IMAGE_DIR, "stock-pool.json");
const MAX_DIMENSION = 1600;

type PoolPhoto = { id: number; tags: string[]; description: string; usedBy: string | null };
type Pool = { source: string; photos: PoolPhoto[] };

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function fail(message: string): never {
  console.error(`fetch-guide-image: ${message}`);
  process.exit(1);
}

function cdnUrl(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${MAX_DIMENSION}`;
}

async function main() {
  const pool = JSON.parse(readFileSync(POOL_FILE, "utf8")) as Pool;

  if (process.argv.includes("--list")) {
    const tag = arg("tag")?.toLowerCase();
    const unused = pool.photos.filter((photo) => !photo.usedBy && (!tag || photo.tags.includes(tag)));
    unused.forEach((photo) => console.log(`${photo.id} | ${photo.tags.join(",")} | ${photo.description}`));
    const unusedTotal = pool.photos.filter((photo) => !photo.usedBy).length;
    console.log(`${unused.length} listed; ${unusedTotal} unused of ${pool.photos.length} in the pool${unusedTotal < 8 ? " — running low: add more (see --id with --tags/--desc)" : ""}`);
    return;
  }

  const id = Number(arg("id"));
  const out = arg("out");
  if (!Number.isInteger(id) || id <= 0 || !out || !out.endsWith(".webp") || out.includes("/")) {
    fail('usage: --list [--tag <tag>]   |   --id <pexels photo id> --out <name>.webp [--tags a,b --desc "..."]');
  }

  const response = await fetch(cdnUrl(id));
  if (!response.ok) fail(`Pexels CDN returned HTTP ${response.status} for photo ${id}`);
  const bytes = Buffer.from(await response.arrayBuffer());

  await sharp(bytes)
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(IMAGE_DIR, out));

  let entry = pool.photos.find((photo) => photo.id === id);
  if (entry?.usedBy) console.warn(`warning: photo ${id} was already used by ${entry.usedBy}`);
  if (!entry) {
    entry = { id, tags: (arg("tags") ?? "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean), description: arg("desc") ?? "", usedBy: null };
    pool.photos.push(entry);
  }
  entry.usedBy = out;
  writeFileSync(POOL_FILE, `${JSON.stringify(pool, null, 2)}\n`);
  console.log(`saved prisma/guide-images/${out} from Pexels photo ${id}${entry.description ? `: ${entry.description}` : ""}`);
}

main().catch((error) => fail(String(error)));
