# Aggregated Job Search

CareerOS searches supported job APIs through server-only provider adapters. Search results remain transient until the user selects **Analyze in CareerOS**; only that selected listing becomes an owned Job Workspace in Supabase. Every result retains its source name and links directly to the provider listing.

## Initial providers

| Source | Configuration | Coverage |
| --- | --- | --- |
| Arbeitnow Germany | None | European, German, and remote listings |
| Arbeitnow UK | None | United Kingdom and remote listings |
| Adzuna | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY` | Country-specific broad job search |
| USAJOBS | `USAJOBS_API_KEY`, `USAJOBS_USER_AGENT` | U.S. federal jobs open to the public |
| The Muse | `THE_MUSE_API_KEY` | Curated company and job listings |

Register the CareerOS application and accept each provider's current terms before adding credentials. Adzuna registration and documentation are at [developer.adzuna.com](https://developer.adzuna.com/). USAJOBS credentials come from the [USAJOBS developer portal](https://developer.usajobs.gov/), and `USAJOBS_USER_AGENT` must be the registration email. The Muse requires application registration under its [API terms](https://www.themuse.com/developers/api/v2/terms). Arbeitnow documents its public feeds at [arbeitnow.com](https://www.arbeitnow.com/blog/job-board-api).

## Behavior and safeguards

- Authentication is required; no profile or query is sent to the browser as a provider credential.
- Fixed HTTPS provider hosts, encoded query parameters, eight-second timeouts, response-size limits, schema validation, and parallel requests bound external calls.
- One unavailable source does not discard successful results from other sources.
- Normalization produces one contract for title, company, location, remote status, dates, employment type, salary, description, and source attribution.
- Obvious duplicates are collapsed by normalized title, company, and location.
- Match scores use the search terms and the user's verified skills; they are directional, not hiring predictions.
- Suggested searches and keywords are deterministic values derived from verified skills, target role, and experience titles. CareerOS does not invent qualifications.
- Search results can be sorted by profile match, posting date, salary, or title and filtered by source or salary availability.

CareerOS does not scrape LinkedIn, Indeed, Glassdoor, or other sites without an approved API agreement. Remotive's public feed is intentionally excluded because its public terms prohibit using the feed as a signup-gated listing experience. New sources must be added as provider adapters with attribution, terms review, schema validation, timeouts, and tests.
