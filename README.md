# CareerOS

CareerOS is an upload-first AI career operating system. It turns user-verified career knowledge into explainable, versioned resumes and cover letters, then preserves the exact artifacts connected to every application.

## MVP capabilities

- Better Auth email/password accounts with optional Google OAuth
- PDF/DOCX resume ingestion into an approval-gated Career Profile
- Manual verified career facts and profile completeness
- Pasted-text or hardened public-URL job import and match analysis
- Verified-fact resume and cover-letter composition with explanations
- Immutable document versions, provenance, editing, and PDF export
- Exact-version application CRM and pipeline history
- Career Twin guidance, pending-fact review, and owned-record analytics

## Local setup

Prerequisites: Node.js 22.3+, npm 10+, and PostgreSQL 16 with pgvector.

1. Copy `.env.example` to `.env.local` and provide database/auth values.
2. Start PostgreSQL with `docker compose up -d postgres` or use an equivalent pgvector database.
3. Install dependencies with `npm ci`.
4. Apply migrations with `npm run db:migrate:deploy`.
5. Start CareerOS with `npm run dev` and visit `http://localhost:3000`.

Google OAuth remains unavailable when its credentials are omitted. The OpenAI Responses adapter exists but is not wired into user-facing generation, which currently uses a labeled deterministic grounded strategy. Production object storage is not implemented and uploads fail closed in production. No code path invents credentials or claims those integrations were live-tested.

## Verification

`npm run check` runs lint, strict type checking, unit tests, and a production build. `npm run db:validate` validates the Prisma schema. PostgreSQL integration and real external-provider verification require operator-supplied services.

## Documentation

- [Implementation plan](./docs/IMPLEMENTATION_PLAN.md)
- [Development guide](./docs/DEVELOPMENT.md)
- [Database and migrations](./docs/DATABASE.md)
- [Authentication](./docs/AUTHENTICATION.md)
- [Career Profile ingestion](./docs/CAREER_PROFILE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Security](./docs/SECURITY.md)

The authoritative product documents remain in the repository root. See the implementation plan for milestone status, external-test limitations, and the known upstream dependency advisory.
