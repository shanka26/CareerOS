# Security Model

CareerOS stores sensitive career and application data. Protected routes validate a Better Auth session and aggregate queries scope data to the authenticated owner. User IDs are never accepted as authorization input.

Uploads are size-bounded, magic-byte checked, parsed as untrusted content, and stored in private Vercel Blob under pseudonymous randomized keys. Job URL import requires public HTTPS destinations and applies private-network, redirect, timeout, size, and content-type controls. Automated malware scanning and storage retention/deletion policies are not yet implemented.

Resume analysis sends bounded extracted text to the configured OpenAI API using structured outputs, a pseudonymous safety identifier, and `store: false`. If local parsing yields no meaningful text, CareerOS also sends the original supported resume file for exact transcription; PDF page images use high detail, while DOCX embedded images are limited by count and expanded byte budget. The file content is treated as untrusted data, model output is bounded, and API response storage remains disabled. Every extracted field and report claim must carry an exact source excerpt that is verified locally before persistence. Factual AI output cannot silently mutate the Career Profile; pending suggestions require explicit review. Documents and applications preserve immutable versions and knowledge snapshots.

Baseline response headers disable framing, MIME sniffing, camera/microphone/geolocation, and cross-origin opener sharing. Secrets belong only in the deployment secret manager. Logs must exclude resume text, personal prompts, credentials, and document bodies.

## Known release risk

As of 2026-07-29, npm reports high-severity advisories in dependencies bundled by the latest stable Next.js 16.2.12 and development tooling. There is no safe stable Next.js upgrade currently available in this repository's tested line. Do not approve production release until a patched stable version is available, upgraded, audited, and the full gate passes. See `docs/DEVELOPMENT.md` for detail.
