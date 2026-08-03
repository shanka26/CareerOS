# Requirements Audit

**Date:** 2026-07-29  
**Branch:** `build/careeros-mvp`

This audit maps the Master Implementation Charter, PRD, Database Schema, Vision, and original fourteen-step acceptance journey to the current source. “Implemented” means source and automated local verification exist. “Blocked” means external infrastructure or an unresolved release dependency is required.

## On-track functionality

- Next.js App Router, strict TypeScript, domain-oriented modules, Tailwind/shadcn patterns, React Hook Form, TanStack Query, Zod, Better Auth, Prisma/PostgreSQL, and pgvector migration structure are present.
- Upload-first PDF/DOCX intake enforces size and signature policies, extracts bounded text, creates a pending suggestion, and requires approval before profile mutation.
- Users can manually add and edit profile preferences, experience, achievements, skills, projects, education, and certifications. These user-authored facts are verified and owner-scoped.
- Job paste/URL import, explicit field parsing, public-URL controls, requirements review, company record linkage, and verified-skill matching are implemented.
- Resume and cover-letter composition uses verified facts only, records immutable knowledge snapshots, explanations, exact versions, and deterministic generation logs.
- User-edited document versions retain the source snapshot/model/prompt provenance and add an explicit user-edit explanation.
- Applications retain exact resume/cover-letter version links, enforce guarded pipeline transitions, record timeline events, and expose history/detail views.
- Analytics covers tracked/submitted applications, response/interview/offer rates, profile completeness, and suggestion acceptance with correct empty denominators.

## Partial or externally blocked

- Email/password and Google OAuth code is present, but no live PostgreSQL or Google credentials are available for end-to-end authentication validation.
- Resume parsing remains a conservative deterministic adapter. User-facing resume and cover-letter generation invokes the OpenAI Responses provider when configured, validates structured output and fact citations, and records exact provenance. Company research and the broader specialist-agent catalog remain architecture capabilities, not completed product workflows.
- Private Vercel Blob storage is implemented and connected in Production. Automated malware scanning, retention/deletion controls, and lifecycle jobs remain incomplete.
- PDF export is deterministic and tested for valid/version-specific output, but it is a basic text layout rather than a polished multi-template resume renderer.
- URL policy tests cover private/local addresses, credentials, schemes, and ports. DNS rebinding protection still requires a fetch transport that pins the validated address in production.
- No disposable PostgreSQL, Docker, provider credentials, or browser E2E environment is available here. Database migrations and the fourteen-step journey therefore remain unverified against live services.
- Current production dependency audit reports four findings, including three high-severity advisories in PostCSS/Sharp bundled by Next.js 16.2.12. npm's proposed forced downgrade is unsafe; production release remains blocked pending a patched stable Next.js release.
- The audit also found a Prisma transitive `effect` advisory. Prisma and Prisma Client were safely patched from 6.19.2 to 6.19.3, removing that finding without a major-version change.

## Test posture

- The baseline suite passed 33 tests but reported 14.76% statement coverage because App Router pages, route handlers, and client forms were largely untested.
- This audit adds regression coverage for manual knowledge validation/UI submission, exact application artifact submission, document provenance inheritance, structured job parsing, private-URL rejection, expanded verified-fact composition, and suggestion acceptance math.
- After these additions, 48 tests across 23 files pass and statement coverage rises from 14.76% to approximately 25.5%. Route-handler and browser-journey coverage remains the largest deliberate gap.
- CI, lint, strict type checking, Prisma validation, unit/component tests, and production build must all pass after the audit changes.

## Next release gates

1. Wire specialist AI strategies into user-facing flows without allowing free-form factual invention; validate all cited fact IDs and preserve explicit review.
2. Add malware scanning, storage lifecycle/retention, export, and deletion controls to the private production Blob implementation.
3. Run disposable-PostgreSQL route integration tests and browser E2E tests for the full new-user journey.
4. Upgrade to a patched stable Next.js release and obtain a clean production dependency audit.
5. Validate OAuth, OpenAI, job URL compatibility, storage, migrations, backups, and observability in staging before marking the MVP production-ready.
