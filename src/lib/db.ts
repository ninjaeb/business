import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Pool defaults, applied as connection-string query params (the mariadb
// driver's own syntax) — each is only a default, so a DATABASE_URL that sets
// one keeps its own value.
const POOL_DEFAULTS: Record<string, string> = {
  // Shared hosting caps MySQL connections per account well below the
  // driver's default pool of 10 — and the app's pool isn't the only one on
  // the account (a deploy's `prisma migrate deploy`, cron scripts).
  connectionLimit: "5",
  // How long a query waits for a free connection before giving up. The
  // driver's 10 s default is what turns a starved pool into route handlers
  // that hang for ~10.5 s and then 500; 5 s surfaces the same failure
  // twice as fast without abandoning a merely busy pool.
  acquireTimeout: "5000",
  // The driver keeps this many connections open even when idle, and
  // defaults it to connectionLimit — so an idle pool still pins its whole
  // allowance against the account's cap. One warm connection is enough.
  minimumIdle: "1",
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

  const adapter = new PrismaMariaDb(url.toString());
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
