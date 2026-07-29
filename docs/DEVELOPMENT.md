# Development

## Prerequisites

- Node.js 20.19 or newer (the initial foundation was also verified successfully on 20.14)
- npm 10 or newer
- PostgreSQL with pgvector beginning in Milestone 3

## Local setup

1. Copy `.env.example` to `.env.local` and replace only the values needed for the milestone you are running.
2. Run `npm ci` after the lockfile exists.
3. Run `npm run dev` and open `http://localhost:3000`.

Never commit `.env`, `.env.local`, credentials, uploaded resumes, or generated private documents.

## Quality checks

- `npm run lint` — ESLint with Next.js and TypeScript rules
- `npm run typecheck` — strict TypeScript without emitting files
- `npm test` — Vitest unit/component suite
- `npm run build` — optimized production build
- `npm run check` — all required milestone checks in order

Tests that require real PostgreSQL must use `TEST_DATABASE_URL`; tests that call paid/external services must use explicit adapters and must not silently make network calls.

## Dependency security

Run `npm audit` during dependency upgrades and before release. As of 2026-07-29, the latest stable Next.js 16.2.12 package bundles PostCSS 8.4.31 and Sharp 0.34.5, which npm flags under three high-severity 2026 advisories. Next.js bundles these copies, so package overrides do not replace them safely. CareerOS does not accept user-authored CSS, but this is still a release risk: upgrade to the first patched stable Next.js version and re-run the full suite before production deployment. Remaining development-only audit findings are in the ESLint/glob toolchain and are not shipped with the application.

## Architecture

Product logic belongs under `src/domains/<domain>`, with domain-owned schemas, services, repositories, UI, and tests. Cross-domain infrastructure belongs under `src/shared`; environment parsing belongs under `src/config`. App Router files should compose domain capabilities rather than contain large business workflows.
