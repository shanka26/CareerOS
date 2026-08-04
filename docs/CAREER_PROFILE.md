# Career Profile and Resume Ingestion

CareerOS begins with an existing PDF, DOC, or DOCX resume. The upload endpoint enforces a 5 MB limit, checks magic bytes against the filename, extracts bounded text server-side, runs a comprehensive OpenAI structured-output analysis, stores the original through the environment's storage adapter, and creates a base-resume document/version plus a pending `MemorySuggestion`.

No extracted value enters the Career Profile automatically. The review screen shows the source text, lets the user correct or remove suggested values, asks targeted questions, and marks submitted values verified only after explicit approval. Manual profile and experience entries are authoritative user input and are therefore stored as verified.

## Parser behavior

PDF extraction uses `pdf-parse` v2. DOCX extraction uses Mammoth first, then a bounded OOXML text-part fallback that covers document content, headers, footers, text boxes, drawings, footnotes, and endnotes. When local extraction produces no meaningful text, CareerOS sends the original file to the OpenAI Responses API for exact transcription with response storage disabled. PDF inputs use high-detail page vision; DOCX fallbacks also include up to ten supported embedded images within a 5 MB expanded-image budget. Legacy DOC files use the AI file-input path directly.

The AI analysis covers profile foundation fields, experience, achievements, skills, projects, education, certifications, additional facts, strengths, improvement opportunities, missing fields, and follow-up questions. Every populated field and report claim must cite an exact excerpt that is programmatically verified against the resulting transcription. Unsupported values are rejected, unavailable values remain null or empty, and instructions embedded in the resume are treated as untrusted document content.

The complete analysis, evidence excerpts, source text, provider, and model are retained in the resume `MemorySuggestion`. The review UI lets the user edit or exclude individual items. Approval upserts the selected facts as verified Career Profile records, and later resume/cover-letter generation includes the expanded profile, experience dates, proficiency, projects, education, certifications, preferences, and goals in its immutable fact snapshot. The latest accepted report remains viewable from the Career Profile.

## Storage and security

The local adapter writes randomized names under `.data/uploads/<user-id>` outside production. Production uses private Vercel Blob storage with pseudonymous owner prefixes and randomized object names. If database persistence fails after an upload, the adapter deletes the orphaned local file or Blob. Production requires a connected store credential and fails closed when it is absent.

Upload routes validate a full Better Auth session and derive ownership from it. User IDs and storage paths are never accepted from request input. Size and type checks occur before parsing, extracted text is bounded, DOCX expansion and embedded-image inputs are bounded, and raw source content is untrusted. Files are sent to OpenAI only when local extraction cannot recover meaningful text. Automated malware scanning, retention/lifecycle policy, and user-driven source-file deletion remain production hardening work.

## Verification status

File-policy, local PDF/DOCX extraction, AI fallback request privacy, embedded-DOCX-image handling, legacy DOC routing, the scanned-upload API path, storage routing, AI output shape, exact-evidence enforcement, approval schemas, completeness, and manual-data rules are unit tested. `npm run resume:check-ocr` performs a live provider check with a generated synthetic scanned PDF and no user data. Lint, strict typecheck, and production build are verified. A complete authenticated browser upload matrix should still be checked after each release.
