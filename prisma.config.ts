import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { defineConfig } from "prisma/config";

// Next.js loads .env.local automatically, but Prisma CLI does not. Keep local
// database credentials in the same ignored file without requiring shell exports.
if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
