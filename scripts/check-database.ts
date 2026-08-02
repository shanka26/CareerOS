import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Configure the Supabase runtime URL in .env.local.");
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const [database] = await prisma.$queryRaw<
    Array<{
      database: string;
      role: string;
      serverVersion: string;
      ssl: boolean;
    }>
  >`
    SELECT
      current_database() AS "database",
      current_user AS "role",
      current_setting('server_version') AS "serverVersion",
      EXISTS (
        SELECT 1 FROM pg_stat_ssl WHERE pid = pg_backend_pid() AND ssl
      ) AS "ssl"
  `;

  const [vector] = await prisma.$queryRaw<Array<{ version: string | null }>>`
    SELECT extversion AS "version" FROM pg_extension WHERE extname = 'vector'
  `;

  const [migrationTable] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS "exists"
  `;

  const migrationCount = migrationTable?.exists
    ? Number(
        (
          await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) AS "count" FROM "_prisma_migrations" WHERE finished_at IS NOT NULL
          `
        )[0]?.count ?? 0,
      )
    : 0;

  console.log("CareerOS database connection is healthy.");
  console.log(`Database: ${database?.database ?? "unknown"}`);
  console.log(`Role: ${database?.role ?? "unknown"}`);
  console.log(`PostgreSQL: ${database?.serverVersion ?? "unknown"}`);
  console.log(`SSL: ${database?.ssl ? "enabled" : "not detected"}`);
  console.log(`pgvector: ${vector?.version ?? "not installed"}`);
  console.log(`Applied migrations: ${migrationCount}`);
} finally {
  await prisma.$disconnect();
}
