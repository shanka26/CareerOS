# Supabase Backend Setup

CareerOS uses Supabase as a hosted PostgreSQL and pgvector backend through Prisma. Better Auth remains the application authentication layer required by the implementation charter. Supabase Auth, the browser Data API, and Supabase service-role keys are not used by CareerOS.

## 1. Create the project

1. Create a Supabase project in the region closest to the application deployment.
2. Generate a strong database password and store it in a password manager.
3. In **Connect > ORMs > Prisma**, copy the transaction-mode and direct connection strings.
4. Do not commit either connection string. Passwords containing reserved URL characters must be percent-encoded.

## 2. Configure connections

For a serverless or auto-scaling deployment, use Supavisor transaction mode for application queries:

```dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
```

Use the direct endpoint for Prisma migrations:

```dotenv
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

Supabase direct connections are IPv6 unless the project has the IPv4 add-on. From an IPv4-only migration runner, use the project's Supavisor **session mode** URL on port `5432` for `DIRECT_URL`. Do not use transaction mode on port `6543` for migrations.

Keep `TEST_DATABASE_URL` pointed at a separate disposable database. Never run automated tests against development or production Supabase data.

## 3. Apply and verify migrations

With `DATABASE_URL` and `DIRECT_URL` present only in `.env.local` or the deployment secret manager:

```powershell
npm run db:validate
npm run db:migrate:deploy
```

`prisma.config.ts` loads the ignored `.env.local` for local Prisma CLI commands. CI and production release jobs should inject the same variables from their secret managers; committed environment files are never required.

The committed initial migration enables the `vector` extension before creating the `KnowledgeEmbedding` table. After migration, confirm in the Supabase dashboard that `_prisma_migrations` and the CareerOS tables exist and that the `vector` extension is enabled.

## 4. Start CareerOS

Set a separate strong `BETTER_AUTH_SECRET`, then run:

```powershell
npm run dev
```

Verify account creation, sign-in, session persistence, resume upload, career-fact approval, job import, document generation, and application tracking with non-sensitive test data.

## Security boundaries

- All application data access remains server-side through Prisma and authenticated owner-scoped queries.
- Do not add `NEXT_PUBLIC_` to database credentials or a Supabase service-role key.
- Supabase Row Level Security does not replace CareerOS authorization because Prisma connects server-side. Owner filters and relational constraints remain mandatory.
- Use SSL for hosted connections, rotate credentials after exposure, enable Supabase database backups, and review connection usage in Supabase observability.
- Supabase database backups do not include uploaded resume objects. Production object storage needs its own backup, retention, malware-scanning, and deletion controls.

## Optional future Supabase services

Supabase Storage can be evaluated behind the existing S3-compatible storage interface, but it is not enabled by this database change. Replacing Better Auth with Supabase Auth would conflict with the current implementation charter and requires a separate architecture decision and migration plan.
