# Supabase Setup

CareerOS uses Supabase as managed PostgreSQL. Better Auth remains the application authentication layer and stores its users, accounts, sessions, and verification records in the same Supabase database. The browser never receives a database password or service-role credential.

## 1. Create the project

Create a Supabase project and save its database password. In the project dashboard, open **Connect** to obtain the database connection strings.

CareerOS does not need `NEXT_PUBLIC_SUPABASE_URL` or an anon key because it accesses PostgreSQL exclusively through the server-side Prisma client.

## 2. Configure connection strings

Set these values in `.env.local` for local development and in the deployment platform's encrypted environment settings for production:

```dotenv
# Runtime traffic. For serverless hosting, use Supavisor transaction mode (port 6543).
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Migrations. Prefer the direct connection; use Supavisor session mode (port 5432)
# when the machine running migrations cannot reach Supabase over IPv6.
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres"
```

Copy the actual strings from the dashboard rather than constructing them manually. Percent-encode reserved characters in the password if the dashboard has not already done so. Do not commit either URL.

For a persistent, non-serverless application server, the direct connection or Supavisor session mode is also suitable for `DATABASE_URL`.

## 3. Apply the schema

The committed initial migration enables the `vector` extension and creates all CareerOS and Better Auth tables:

```powershell
npm run db:migrate:deploy
npm run db:generate
```

Use `prisma migrate deploy`, not `prisma db push`, for shared or production databases. Supabase supports the `vector` extension used by the `KnowledgeEmbedding` model.

## 4. Configure application auth

Set a private random `BETTER_AUTH_SECRET` of at least 32 characters and set both application origins:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-a-private-random-secret
```

Use the public HTTPS deployment URL in production. Email/password authentication works without any Supabase Auth configuration. Google sign-in remains optional and requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; its callback is `/api/auth/callback/google` on the configured origin.

## 5. Verify

Start the application, create an email/password account, and confirm that the dashboard loads. Then verify the `user`, `account`, and `session` tables in Supabase's Table Editor. Run the normal project checks with `npm run check` before deployment.

All application queries run server-side and enforce ownership by the authenticated Better Auth user ID. Do not expose `DATABASE_URL`, `DIRECT_URL`, or a Supabase service-role key through any `NEXT_PUBLIC_` variable.
