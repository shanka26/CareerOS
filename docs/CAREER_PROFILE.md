# Career Profile and Resume Ingestion

CareerOS begins with an existing PDF or DOCX resume. The upload endpoint enforces a 5 MB limit, checks magic bytes against the filename, extracts bounded text server-side, stores the original through a development storage adapter, and creates a base-resume document/version plus a pending `MemorySuggestion` in one transaction.

No extracted value enters the Career Profile automatically. The review screen shows the source text, lets the user correct or remove suggested values, asks targeted questions, and marks submitted values verified only after explicit approval. Manual profile and experience entries are authoritative user input and are therefore stored as verified.

## Parser behavior

PDF extraction uses `pdf-parse` v2 and DOCX extraction uses Mammoth raw text. The deterministic pre-AI parser only proposes a likely headline and values explicitly found under a skills/technologies heading. It does not infer experience, achievements, metrics, employers, or dates. Scanned/image-only PDFs return an honest OCR-not-supported error. A later specialist AI parser may produce richer suggestions, but it must use the same pending approval path.

## Storage and security

The local adapter writes randomized names under `.data/uploads/<user-id>` and is disabled when `NODE_ENV=production`. Production object storage and lifecycle controls are not implemented; uploads intentionally fail closed in production until that adapter and malware scanning are added. Failed local persistence removes an orphaned file.

Upload routes validate a full Better Auth session and derive ownership from it. User IDs and storage paths are never accepted from request input. Size and type checks occur before parsing, extracted text is bounded, and raw source content is untrusted text. Malware scanning remains required at the production storage boundary.

## Verification status

File-policy, deterministic extraction, approval schemas, completeness, and manual-data rules are unit tested. Lint, strict typecheck, and production build are verified. A real PDF/DOCX-to-PostgreSQL round-trip is not claimed because no live database is available.
