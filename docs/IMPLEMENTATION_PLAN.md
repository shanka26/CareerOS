# CareerOS Implementation Plan

**Status:** MVP foundation implemented; audit gaps and production release gates remain
**Branch:** `build/careeros-mvp`  
**Last updated:** 2026-07-29

## Authoritative Sources and Interpretation

Implementation follows, in order: the Master Implementation Charter, Product Requirements Document, Database Schema, Vision and Product Strategy, additional project documentation, then existing implementation details.

The charter describes its sequence as milestones 1-12, while the assignment asks to begin with Milestone 0. This plan treats the repository audit, documentation synthesis, decisions, and plan itself as Milestone 0, then retains the charter's twelve milestones without reordering them. The charter's internal "Source of Truth" list begins with the PRD because it does not list itself; no substantive conflict results. Where application status names differ, the PRD's `Technical Interview` and `Final Interview` labels are canonical user-facing labels; database-safe enum names will map to them.

## Milestone 0: Repository Audit

### Current state

The default branch contains only five Markdown files: the README and the four authoritative documents. There is no application code, package manifest, dependency lockfile, environment example, database configuration, migrations, tests, CI/CD, deployment configuration, or placeholder implementation. The repository is therefore documentation-only, not partially implemented.

### Product summary

CareerOS is an upload-first AI career operating system. A resume initializes a structured, user-editable Career Knowledge Graph/Career Twin. Verified career facts—not generated documents—are the source of truth. Jobs, tailored resumes, cover letters, application records, and explainable recommendations are derived from that knowledge. Generated documents are versioned, reproducible artifacts tied to immutable knowledge snapshots and exact applications.

The MVP includes authentication; PDF/DOCX resume ingestion; reviewable profile extraction; manual career profile editing; job URL/text import and analysis; verified-fact-only resume and cover-letter generation; versioned document storage; an application Kanban; an assistant; analytics; and approval-gated memory suggestions. Browser, email, calendar, collaboration, GitHub, full LinkedIn, and mobile integrations are non-goals.

### Documented stack and architecture

- Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui patterns, React Hook Form, TanStack Query, and Zod.
- Next.js route handlers with PostgreSQL, Prisma, and pgvector.
- Better Auth with email/password and Google OAuth.
- OpenAI Responses API behind a provider-neutral orchestration boundary prepared for Gemini.
- Domain-oriented modules: career, documents, jobs, applications, assistant, analytics, settings, and shared.
- Small specialist AI capabilities with structured inputs/outputs, prompt versions, provenance, explanations, and approval gates; never a single monolithic prompt.

### Initial gaps and concerns

- Every functional requirement and all infrastructure are missing because the repository has no implementation.
- No environment contract, validation, migrations, seed path, storage strategy, test harness, or CI exists.
- Resume URL fetching creates SSRF risk; uploads create type, size, malware, and parser risks.
- AI output can introduce fabricated facts, prompt injection, schema-invalid data, or accidental unapproved profile mutations.
- Generated artifact reproducibility requires snapshot and generation metadata not present in code.
- Authentication, authorization, tenant isolation, rate limiting, CSRF protections, and secure secret handling must be established before exposing data routes.
- External credentials are unavailable; real OAuth, hosted PostgreSQL/pgvector, object storage, URL extraction, and OpenAI calls cannot be claimed as live-tested.

## Assumptions and Technical Decisions

1. Use the current stable releases resolved by the package manager, committing the lockfile. Pin runtime prerequisites in `package.json` and document them.
2. Use PostgreSQL in production. Unit and component tests use isolated doubles; integration tests requiring PostgreSQL are explicitly gated by a test database URL.
3. Store uploaded/generated file metadata in PostgreSQL and binary objects through a storage interface. A local development adapter is allowed, but production defaults fail closed when storage configuration is absent.
4. Parse PDF/DOCX text through bounded server-side adapters. Uploaded facts begin unverified until the user reviews and accepts them.
5. Job URL import uses a hardened fetcher: HTTPS only, public destinations only, redirect/size/time limits, content-type checks, and no authenticated scraping. Pasted text is the reliable fallback.
6. All mutations enforce ownership in the service/data layer, not only in UI or route handlers.
7. AI features use typed capability contracts and a provider interface. Without an API key, explicit deterministic development/test adapters may demonstrate flows but are visibly labeled and never represented as real AI execution.
8. A `KnowledgeSnapshot` captures normalized verified facts used for generation. Each document version and generation log records snapshot, model/provider, prompt version, timestamps, and explanations.
9. Factual AI suggestions are persisted as pending `MemorySuggestion` records and never applied until explicit acceptance. Rejection is also retained.
10. Accessibility, responsive web behavior, observability, privacy controls, and secure defaults are cross-cutting acceptance criteria.

## Milestone Sequence

### 1. Project Foundation

Create the Next.js/TypeScript application, domain layout, design system foundation, environment validation, lint/type/test/build scripts, error conventions, and CI.

**Depends on:** Milestone 0.  
**Acceptance:** clean install succeeds; strict typecheck, lint, unit tests, and production build pass; missing required production configuration fails with actionable errors; CI runs the same checks.

### 2. Authentication

Add Better Auth, email/password and Google provider configuration, protected layouts/routes, session access, and ownership primitives.

**Depends on:** 1.  
**Acceptance:** a user can register, sign in/out, and access only their protected workspace; OAuth is configured when credentials exist and clearly unavailable otherwise; auth tests cover protected and unauthenticated behavior.

### 3. Database

Translate the documented schema into Prisma models, enums, constraints, indexes, ownership relationships, pgvector preparation, migrations, seed fixtures, and repositories.

**Depends on:** 1-2.  
**Acceptance:** schema validates; migration/seed instructions are reproducible; document versions reference snapshots; applications reference exact documents; pending suggestions cannot silently mutate facts; tenant-scoped repository tests pass.

### 4. Career Profile

Implement upload-first PDF/DOCX onboarding, bounded parsing, extracted-data review, explicit verification, manual CRUD, completeness, preferences/goals, and knowledge suggestions.

**Depends on:** 2-3.  
**Acceptance:** supported files can initialize a review screen; users can correct, accept, add, and edit their own facts; unsupported/oversized files fail safely; no extracted fact becomes verified without approval.

### 5. Document Library

Implement base/generated resume and cover-letter storage, safe object storage, version browsing, metadata/provenance display, editing, and PDF export foundation.

**Depends on:** 3-4.  
**Acceptance:** users can list and view only their documents and versions; provenance is visible; versions are immutable records; PDF exports are usable and associated with the correct version.

### 6. AI Foundation

Implement provider-neutral typed capabilities, OpenAI Responses adapter, optional Gemini-ready interface, prompt/version registry, structured output validation, generation logging, explainability, approval gates, and safe development/test doubles.

**Depends on:** 3-5.  
**Acceptance:** capabilities validate input/output and log success/failure; missing credentials fail safely; suggestions remain pending; verified-fact constraints and explanation requirements have automated tests.

### 7. Job Workspace

Implement pasted-text and hardened URL import, normalized job/company data, requirement analysis, match scoring, salary/location/type fields, and saved workspace UI.

**Depends on:** 4 and 6.  
**Acceptance:** paste import works end-to-end; supported public URLs are bounded and safe; title/company/requirements are reviewable; match explanations cite profile facts and gaps without fabrication.

### 8. Resume Composer

Compose editable tailored resumes from verified facts and a job analysis, with strategy, explanations, preview, version save, and PDF export.

**Depends on:** 5-7.  
**Acceptance:** generated claims trace to the selected snapshot; changes and reasons are shown; edits save as versions; a quality PDF can be exported; unsupported claims are rejected by validation/review.

### 9. Cover Letter Composer

Generate and edit role/company-specific cover letters from the same verified snapshot and job context, preserving explanations and versions.

**Depends on:** 5-8.  
**Acceptance:** the letter references the selected role/company and verified experience; it is editable before save; version/provenance metadata is complete; no unverified fact is silently introduced.

### 10. Application CRM

Implement application creation, canonical pipeline/Kanban transitions, timeline events, and immutable links to the exact resume and cover letter versions used.

**Depends on:** 7-9.  
**Acceptance:** users can create, move, filter, and inspect applications; transitions add history; linked submitted artifacts remain exact and viewable; ownership is enforced.

### 11. Analytics

Implement applications/interviews/offers, response/interview/offer rates, profile completeness, and AI suggestion acceptance metrics.

**Depends on:** 4, 6, and 10.  
**Acceptance:** empty states and zero denominators are correct; metrics derive from owned source records; calculations have unit tests; dashboards are accessible and responsive.

### 12. Polish

Complete the unified Career Twin assistant experience, onboarding guidance, settings/privacy surfaces, accessibility, responsive layout, performance, security review, observability, documentation, and full acceptance verification.

**Depends on:** 1-11.  
**Acceptance:** the documented new-user journey works end-to-end; all checks and production build pass; no high-severity security or accessibility issue remains; setup/migration/deployment instructions are complete; real integrations not tested are disclosed.

## Testing Strategy

- Unit-test domain rules, schemas, mappings, calculations, prompt guards, and provider/storage adapters.
- Component-test forms, approval interactions, explanations, editors, boards, loading/error/empty states, and accessibility-critical behavior.
- Route/service integration tests cover authentication, authorization, validation, idempotency, version links, and failure handling.
- PostgreSQL integration tests use a disposable database when `TEST_DATABASE_URL` is provided; pgvector-specific behavior is skipped with an explicit reason otherwise.
- End-to-end tests cover account creation, upload/review, job import, generation, version saving, application tracking, and return visits, using deterministic external-service doubles in CI.
- Every milestone runs format/lint, strict typecheck, relevant tests, migration validation where applicable, and a production build.

## Risks and Mitigations

- **External service availability:** isolate adapters, validate configuration, use explicit test doubles, and document unverified live paths.
- **AI fabrication:** verified-fact allowlists, structured outputs, traceability, review UI, pending suggestions, and adversarial tests.
- **Sensitive career data:** least-privilege ownership filters, secure sessions, redacted logs, upload limits, encryption-capable storage, retention/deletion controls, and no committed secrets.
- **URL import abuse:** SSRF controls, limits, content checks, sanitization, and pasted-text fallback.
- **Document fidelity:** deterministic templates, visual/export tests, immutable versions, and snapshot checksums.
- **Scope pressure:** complete the smallest vertical slice per charter milestone and record deferred enhancements without presenting placeholders as complete.
- **Schema ambiguity:** preserve documented entities and rules, add only necessary relational keys/timestamps/constraints, and record mappings in schema documentation.

## Definition of Done

The MVP is done only when a new user can complete the fourteen-step journey in the assignment—from account creation and upload-first profile initialization through job analysis, explainable verified-fact document generation, exact artifact-linked application tracking, approval-gated suggestions, and a later return that benefits from accumulated Career Twin knowledge—and the automated checks, production build, security review, documentation, migrations, and disclosed external-service limitations are complete.

## Progress Log

- 2026-08-01: Confirmed the implementation branch was synchronized with GitHub and prepared Supabase Postgres as the recommended hosted backend. Added pooled runtime/direct migration connection guidance, SSL and IPv4/IPv6 handling, a dedicated Supabase runbook, and Prisma CLI `.env.local` loading. Prisma and Better Auth remain authoritative; Supabase Auth/Storage are not silently substituted.
- 2026-07-29: Requirements housekeeping audit reread all project documentation and corrected overstatements. Added complete manual Career Knowledge editing, application history inspection, structured job-field/requirements review, company linkage, expanded verified-fact resume evidence, generation logs, provenance-preserving document edits, suggestion acceptance analytics, and targeted component/security/domain tests. `docs/REQUIREMENTS_AUDIT.md` records remaining AI wiring, production storage, live database/E2E, DNS-pinning, PDF fidelity, and dependency-security gates.
- 2026-07-29: Milestone 12 implementation completed. Added unified Career Twin guidance and approval routing, settings/privacy and integration-status surfaces, responsive navigation, loading/error/not-found states, baseline security headers, crawler exclusions, release/security documentation, and final schema/audit checks. Production acceptance remains blocked by unavailable live PostgreSQL/OAuth/storage/OpenAI verification and four production npm advisories (three high) in the latest stable Next.js bundled PostCSS/Sharp dependencies; the audit's proposed forced downgrade is unsafe.
- 2026-07-29: Milestone 11 completed. Added owner-scoped career analytics for tracked/submitted applications, responses, interviews, offers, conversion rates, Career Twin completeness, and pending fact reviews, with documented measurement rules and zero-denominator tests.
- 2026-07-29: Milestone 10 completed. Added owner-scoped application creation from jobs and exact immutable resume/cover-letter versions, the complete documented Kanban pipeline, guarded state transitions, applied-date handling, timeline events, version links, and transition/integrity tests.
- 2026-07-29: Milestone 9 completed. Added role/company-specific cover-letter composition from verified snapshots, factual-source explanations, generated document/version persistence, editing and PDF export reuse, UI trigger, and grounding tests.
- 2026-07-29: Milestone 8 completed. Added a verified-fact resume strategy, relevance ordering, fact-ID change explanations, immutable knowledge snapshots, generated document/version persistence, editing and PDF export reuse, UI trigger, and grounding tests. The deterministic adapter is labeled and makes no live-AI claim.
- 2026-07-29: Milestone 7 completed. Added pasted-text and hardened public-HTTPS job import with DNS/private-address checks, bounded redirects/time/size/content, conservative parsing, verified-skill match scoring and explanations, owner-scoped persistence, workspace UI, and tests. Live third-party URL compatibility is not claimed.
- 2026-07-29: Milestone 6 completed. Added typed specialist capability and prompt registries, a provider-neutral orchestration contract, current OpenAI Responses API structured-output adapter, fail-closed missing-provider behavior, privacy-preserving safety identifiers, no-store requests, generation success/failure logs, verified-fact citation guards, and tests. The OpenAI docs MCP install was blocked by the host, so implementation used the skill's official-domain fallback; no live API call is claimed without credentials.
- 2026-07-29: Milestone 5 completed. Added the owner-scoped Document Library, detail/version browser, provenance display, editing as append-only versions, and version-specific deterministic PDF export with tests. Production object storage remains intentionally fail-closed pending deployment configuration.
- 2026-07-29: Milestone 4 completed. Added authenticated, bounded PDF/DOCX resume ingestion with magic-byte validation, text extraction, randomized development storage and orphan cleanup, conservative deterministic draft parsing, pending suggestion persistence, explicit approval, profile editing, manual verified experience entry, completeness scoring, and the Career Profile workspace. Added parser/policy/completeness tests and security/limitation documentation. Live database-backed upload remains externally untested because PostgreSQL is unavailable.
- 2026-07-29: Milestone 3 completed. Implemented the complete PostgreSQL/Prisma model for authentication, career knowledge, documents and exact versions, jobs/companies, applications/timeline, approval-gated memory, immutable snapshots, AI generation logs, pgvector embeddings, and analytics caches. Added composite artifact constraints, tenant-scope helpers, deterministic snapshot checksums, an initial customized pgvector migration, opt-in non-production seed, local compose configuration, CI schema validation, 9 new rule/contract tests, and migration documentation. Schema validation and generation pass; live migration application is untested because PostgreSQL/Docker is unavailable.
- 2026-07-29: Milestone 2 completed. Added Better Auth with Prisma, email/password policy, conditional Google OAuth, rate limiting, secure production cookies, auth routes/client/forms, full server-side session enforcement, optimistic Next.js 16 proxy redirects, ownership guards, sign-out, and a protected dashboard. Lint, typecheck, 8 tests, schema generation, and production build pass. Live PostgreSQL registration and Google OAuth were not tested because Docker/database/provider credentials are unavailable; that external verification remains explicit and database migrations follow in Milestone 3.
- 2026-07-29: Milestone 1 completed. Added the Next.js App Router foundation, strict TypeScript, Tailwind and shadcn-style primitives, TanStack Query provider, domain registry, validated public configuration, environment template, lint/type/test/build tooling, CI, responsive trust-focused landing page, and development documentation. ESLint, typecheck, 3 tests, and production build pass. Latest stable Next.js bundled-dependency advisories are documented as a release risk pending an upstream stable patch.
- 2026-07-29: Milestone 0 completed. Repository cloned and updated from `main`; all Markdown read; documentation-only state confirmed; conflicts, assumptions, plan, test strategy, and risks recorded; implementation branch created.
