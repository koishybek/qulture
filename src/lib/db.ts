import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@generated/prisma/client";

export const DEFAULT_DATABASE_URL = "file:./prisma/qulture.db";

export const databaseUrl =
  process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;

export function createPrismaClient(url = databaseUrl): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const globalForDatabase = globalThis as typeof globalThis & {
  __qultureDatabase?: PrismaClient;
};

export const db =
  globalForDatabase.__qultureDatabase ?? createPrismaClient(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__qultureDatabase = db;
}

export const prisma = db;

export async function disconnectDatabase(): Promise<void> {
  await db.$disconnect();
}
