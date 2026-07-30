# Database and Migration Guide

CareerOS uses PostgreSQL, Prisma 6, and pgvector. The schema is in `prisma/schema.prisma`; immutable SQL migration history is in `prisma/migrations`.

Supabase is the recommended managed PostgreSQL provider. See [SUPABASE.md](./SUPABASE.md) for connection modes, project setup, and migration instructions.

## Local PostgreSQL

The optional `compose.yaml` uses the official pgvector 0.8.2 PostgreSQL 16 image. With Docker installed:

1. Run `docker compose up -d postgres`.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run db:migrate:deploy` to apply committed migrations.
4. Optionally set `SEED_DEMO_DATA=true` and run `npm run db:seed`. The seed refuses production and does not create a password or usable login credential.

Docker was not available in the implementation environment, so container startup and migration application are not claimed as tested. Schema formatting, validation, client generation, migration generation, and migration contract tests are verified without a live database.

## Production migration

Set both `DATABASE_URL` (pooled application connection) and `DIRECT_URL` (direct migration connection), then run `npm run db:migrate:deploy` from a controlled release job. The database role applying the initial migration must be allowed to run `CREATE EXTENSION IF NOT EXISTS vector`. Do not use `prisma db push` in production.

## Model decisions

- Documented entities are preserved and receive the relational keys, timestamps, constraints, and owner keys needed for tenant safety and history.
- Education and certification gain `careerProfileId`; otherwise they could not belong to a user's source-of-truth profile.
- Company and AI generation records gain `ownerId`/`userId` so private notes and logs cannot become cross-tenant data.
- Projects, skills, education, and certifications gain `verified`, applying the charter's approval rule consistently to factual career data.
- The PRD's `Technical Interview` and `Final Interview` labels map to `TECHNICAL_INTERVIEW` and `FINAL_INTERVIEW`. This resolves the shorter database-schema labels without changing user-facing wording.
- Applications retain the documented resume/cover-letter document IDs and also store exact version IDs. Composite foreign keys guarantee that each selected version belongs to its selected document. Service validation requires both exact artifacts once an application is submitted.
- Generated document versions reference immutable `KnowledgeSnapshot` records by ID rather than embedding an unqueryable duplicate snapshot in each row. Checksums deduplicate equivalent per-user snapshots.
- pgvector content lives in `KnowledgeEmbedding`. Prisma represents `vector(1536)` as an unsupported type, so vector writes/searches must use parameterized raw SQL in the future AI milestone.
- `CareerMetric` is a recalculable cache; application and timeline records remain the source of truth for analytics.

## Ownership and immutability rules

Every product aggregate is directly or transitively owned by a user. Services must begin queries with `ownedBy`, `belongsToUser`, or an equivalent authenticated relation filter. Route handlers must never accept a user ID as authorization.

Knowledge snapshots and document versions are append-only at the application layer. Database foreign keys use `RESTRICT` where historical generation or submitted-application provenance would otherwise be lost. AI suggestions default to `PENDING`; accepting a suggestion requires a separate audited service operation in Milestone 4/6.

## Test database

Use a disposable PostgreSQL database via `TEST_DATABASE_URL`. Never point tests at development or production data. Integration tests that need PostgreSQL must skip with an explicit reason when the variable is absent; unit and schema-contract tests always run in CI.
