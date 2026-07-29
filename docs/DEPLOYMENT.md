# Deployment

CareerOS targets a Node.js 22.3+ host and PostgreSQL 16 with pgvector. Use HTTPS and durable S3-compatible object storage before enabling production resume upload; the local adapter intentionally fails closed in production.

## Release sequence

1. Configure required values from `.env.example` in the deployment secret manager.
2. Build an immutable artifact with `npm ci` and `npm run check`.
3. Apply `npm run db:migrate:deploy` using `DIRECT_URL`; the initial role must be able to create the `vector` extension.
4. Deploy with `NODE_ENV=production`, canonical application/auth URLs, and a strong auth secret.
5. Configure the Google callback as `<origin>/api/auth/callback/google` when enabled.
6. Smoke-test account, upload, import, generation, export, and application linking with non-sensitive data.

Required production services include PostgreSQL/pgvector with backups, HTTPS and secret management, private object storage with malware scanning/lifecycle controls, optional OpenAI credentials, and redacted centralized logs.

The implementation environment had no Docker/PostgreSQL, OAuth, object-storage, or OpenAI credentials. Those live paths must be validated by the deployer and are not represented as tested here.
