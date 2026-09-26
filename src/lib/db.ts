import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Pool defaults, applied as connection-string query params (node-postgres's
// own syntax) — each is only a default, so a DATABASE_URL that sets one
// keeps its own value.
const POOL_DEFAULTS: Record<string, string> = {
  // Shared hosting caps Postgres connections per account well below the
  // driver's default pool of 10 — and the app's pool isn't the only one on
  // the account (a deploy's `prisma migrate deploy`, cron scripts; see the
  // README's troubleshooting notes on `max_connections`/`too many clients`).
  max: "5",
  // How long a query waits for a free connection before giving up. Surfaces
  // a starved pool as a fast, clear failure instead of a route handler that
  // hangs for the driver's much longer default.
  connectionTimeoutMillis: "5000",
  // How long an idle connection stays open before the pool closes it —
  // keeps an idle pool from pinning its whole allowance against the
  // account's connection cap indefinitely.
  idleTimeoutMillis: "10000",
};

function createPrismaClient() {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(connectionUrl);
  for (const [key, value] of Object.entries(POOL_DEFAULTS)) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }

  const adapter = new PrismaPg({ connectionString: url.toString() });
  return new PrismaClient({ adapter });
}

// One client — and so one connection pool — per process, in production too.
// Next.js compiles a server module once per bundling layer it's imported
// from (React Server Components, route handlers, ...), and each copy of this
// file would otherwise construct its own PrismaClient and pool. globalThis
// is shared across those copies, so caching the client there collapses them
// into a single pool.
export const db = globalThis.prismaGlobal ?? createPrismaClient();
globalThis.prismaGlobal = db;
