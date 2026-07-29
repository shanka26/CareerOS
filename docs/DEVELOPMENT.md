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

Run `npm audit` during dependency upgrades and before release. As of 2026-07-29, the latest stable Next.js 16.2.12 package bundles PostCSS 8.4.31 and Sharp 0.34.5, which npm flags under three high-severity 2026 advisories. Next.js bundles these copies, so package overrides do not replace them safely. CareerOS does not accept user-authored CSS, but this is still a release risk: upgrade to the first patched stable Next.js version and re-run the full suite before production deployment. Remaining development-only audit findings are in the ESLint/glob toolchain and are not shipped with the application.

## Architecture

Product logic belongs under `src/domains/<domain>`, with domain-owned schemas, services, repositories, UI, and tests. Cross-domain infrastructure belongs under `src/shared`; environment parsing belongs under `src/config`. App Router files should compose domain capabilities rather than contain large business workflows.
