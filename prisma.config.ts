import "dotenv/config";

import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL?.trim() || "file:./prisma/qulture.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
