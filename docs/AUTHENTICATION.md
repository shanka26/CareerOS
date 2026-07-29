# Authentication Setup

CareerOS uses Better Auth with its Prisma adapter. Email/password is always configured; Google OAuth is enabled only when both Google credentials are present.

## Required runtime values

- `DATABASE_URL` — pooled PostgreSQL connection string.
- `DIRECT_URL` — direct PostgreSQL connection used by Prisma migrations.
- `BETTER_AUTH_URL` — canonical application origin, such as `http://localhost:3000` locally.
- `BETTER_AUTH_SECRET` — a private random secret of at least 32 characters. Generate one with a trusted password generator; never reuse the build-only fallback visible in source.

The build can statically compile without credentials. A real authentication request fails closed with an actionable configuration error when the database URL or secret is absent.

## Google OAuth

Set both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Configure this authorized redirect URI in Google Cloud:

`http://localhost:3000/api/auth/callback/google`

Use the equivalent HTTPS application origin in production. If either credential is absent, Google is not registered server-side and the UI states that it is unavailable.

## Protection model

`src/proxy.ts` performs a fast cookie-presence redirect for dashboard navigation. This is not an authorization boundary. Protected layouts, route handlers, and server mutations must call `requireSession()` or validate `auth.api.getSession(...)`; data operations must additionally scope queries by the authenticated user ID. The shared ownership guard intentionally returns a not-found-style error to avoid revealing another user's resources.

## Verification status

Schema generation, lint, strict type checking, unit tests, and a production build are verified without credentials. A live email registration/session round-trip and Google OAuth callback require PostgreSQL and provider credentials; neither was available during Milestone 2, so those external paths are not claimed as tested.
