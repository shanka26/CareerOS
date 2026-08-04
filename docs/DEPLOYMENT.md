# Deployment

CareerOS targets a Node.js 22.3+ host and Supabase Postgres with pgvector. A self-managed PostgreSQL 16 instance remains supported. On Vercel, connect a private Blob store to Production before enabling resume upload; the production adapter fails closed without a Blob credential.

## Release sequence

1. Configure required values from `.env.example` in the deployment secret manager. For Supabase, use pooled transaction mode for `DATABASE_URL` and the direct or session-mode endpoint for `DIRECT_URL`. Connect a private Vercel Blob store so Vercel injects `BLOB_READ_WRITE_TOKEN` into Production.
2. Build an immutable artifact with `npm ci` and `npm run check`.
3. Apply `npm run db:migrate:deploy` using `DIRECT_URL`; the initial role must be able to create the `vector` extension.
4. Deploy with `NODE_ENV=production`, canonical application/auth URLs, and a strong auth secret. On Vercel, keep system environment variables exposed so the exact deployment, branch, and production origins are trusted automatically.
5. Configure the Google callback as `<origin>/api/auth/callback/google` when enabled.
6. Smoke-test account, upload, import, generation, export, and application linking with non-sensitive data.

Required production services include Supabase Postgres/pgvector with backups, HTTPS and secret management, connected private Vercel Blob storage, optional OpenAI credentials, and redacted centralized logs. Malware scanning and explicit retention/deletion controls remain release hardening requirements.

Supabase Postgres, OpenAI, and private Vercel Blob are configured in the current production project. Google OAuth remains optional and unavailable until its credentials are configured. Validate all live paths after every release with non-sensitive test data.
