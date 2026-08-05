# Development

## Prerequisites

- Node.js 22 or newer (Better Auth's current database layer requires it; build verification also passed on the available Node 20.14 runtime, but that runtime is not supported for deployment)
- npm 10 or newer
- PostgreSQL with pgvector beginning in Milestone 3

## Local setup

1. Copy `.env.example` to `.env.local` and replace only the values needed for the milestone you are running.
2. Run `npm ci`. Prisma Client is generated automatically after installation.
3. Run `npm run dev` and open `http://localhost:3000`.

Never commit `.env`, `.env.local`, credentials, uploaded resumes, or generated private documents.

## Quality checks

- `npm run lint` — ESLint with Next.js and TypeScript rules
- `npm run typecheck` — strict TypeScript without emitting files
- `npm run db:validate` — validate the Prisma model without changing a database
- `npm test` — Vitest unit/component suite
- `npm run build` — optimized production build
- `npm run check` — all required milestone checks in order

Tests that require real PostgreSQL must use `TEST_DATABASE_URL`; tests that call paid/external services must use explicit adapters and must not silently make network calls.

See [DATABASE.md](./DATABASE.md) for local pgvector startup, migrations, seeding, schema decisions, and live-test limitations.

See [CAREER_PROFILE.md](./CAREER_PROFILE.md) for upload limits, extraction behavior, approval semantics, and storage restrictions.

## Dependency security

Run `npm audit` during dependency upgrades and before release. The Next.js 16.3.0 maintenance upgrade resolved the earlier bundled PostCSS and Sharp advisories, and the release gate now reports zero vulnerabilities. Do not merge future dependency updates until lint, strict types, tests, the production build, and the audit pass together.

See [JOB_SEARCH.md](./JOB_SEARCH.md) for optional provider credentials, attribution requirements, and the external-search adapter contract.

## Architecture

Product logic belongs under `src/domains/<domain>`, with domain-owned schemas, services, repositories, UI, and tests. Cross-domain infrastructure belongs under `src/shared`; environment parsing belongs under `src/config`. App Router files should compose domain capabilities rather than contain large business workflows.
