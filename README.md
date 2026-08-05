# CareerOS

CareerOS is an upload-first AI career operating system. It turns user-verified career knowledge into explainable, versioned resumes and cover letters, then preserves the exact artifacts connected to every application.

## MVP capabilities

- Better Auth email/password accounts with optional Google OAuth
- PDF/DOC/DOCX resume ingestion, including scanned-file recognition, into an approval-gated Career Profile
- Manual verified career facts and profile completeness
- Pasted-text or hardened public-URL job import and match analysis
- Aggregated, attributed job search with profile-derived keywords, source filters, sorting, and selective import
- Verified-fact resume and cover-letter composition with explanations
- Immutable document versions, provenance, editing, and PDF export
- Exact-version application CRM and pipeline history
- Career Twin guidance, pending-fact review, and owned-record analytics

## Local setup

Prerequisites: Node.js 22.3+, npm 10+, and PostgreSQL 16 with pgvector.

1. Copy `.env.example` to `.env.local` and provide database/auth values.
2. Configure a Supabase project using [the Supabase guide](./docs/SUPABASE.md), or start local PostgreSQL with `docker compose up -d postgres`.
3. Install dependencies with `npm ci`.
4. Apply migrations with `npm run db:migrate:deploy`.
5. Start CareerOS with `npm run dev` and visit `http://localhost:3000`.

Google OAuth remains unavailable when its credentials are omitted. Resume and cover-letter routes use the OpenAI Responses API when `OPENAI_API_KEY` is configured, with structured outputs, verified-fact citation checks, no-store requests, and model/prompt provenance. Production resume uploads use a connected private Vercel Blob store; local development uses `.data/uploads`. No code path invents credentials.

## Verification

`npm run check` runs lint, strict type checking, unit tests, and a production build. `npm run db:validate` validates the Prisma schema. PostgreSQL integration and real external-provider verification require operator-supplied services.

After configuring Supabase and applying migrations, `npm run db:check` verifies database connectivity, SSL, pgvector, and migration state without printing credentials.

## Documentation

- [Implementation plan](./docs/IMPLEMENTATION_PLAN.md)
- [Development guide](./docs/DEVELOPMENT.md)
- [Database and migrations](./docs/DATABASE.md)
- [Authentication](./docs/AUTHENTICATION.md)
- [Career Profile ingestion](./docs/CAREER_PROFILE.md)
- [Aggregated job search](./docs/JOB_SEARCH.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Security](./docs/SECURITY.md)

The authoritative product documents remain in the repository root. See the implementation plan for milestone status and external-test limitations. The committed `.node-version` matches the supported Node.js runtime.
