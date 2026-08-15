# Aggregated Job Search

CareerOS searches supported job APIs through server-only provider adapters. Search results remain transient until the user selects **Analyze in CareerOS**; only that selected listing becomes an owned Job Workspace in Supabase. Every result retains its source name and links directly to the provider listing.

The Search Jobs view also includes an AI search coach. It uses the authenticated user's verified role, skills, experience titles, and stated preferences alongside an ephemeral chat to recommend concise provider-friendly keywords, location, and workplace filters. The exact recommendation and rationale remain visible, and the user must explicitly choose **Use this search** before it runs. Chat messages are not persisted.

LinkedIn, Indeed, Glassdoor, Google Jobs, ZipRecruiter, and Dice are integrated as outbound searches using the same active keywords, location, and remote intent. Their public developer programs do not provide CareerOS with unrestricted job-search feeds, so their listings are not scraped, copied, or represented as in-app API results. Each link opens the platform's own results in a new tab.

## Initial providers

| Source | Configuration | Coverage |
| --- | --- | --- |
| Arbeitnow Germany | None | European, German, and remote listings |
| Arbeitnow UK | None | United Kingdom and remote listings |
| Jobicy | None | Curated remote listings across regions and industries |
| Remote OK | None | Worldwide remote listings across technical and non-technical roles |
| Adzuna | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY` | Country-specific broad job search |
| USAJOBS | `USAJOBS_API_KEY`, `USAJOBS_USER_AGENT` | U.S. federal jobs open to the public |
| The Muse | `THE_MUSE_API_KEY` | Curated company and job listings |

Register the CareerOS application and accept each provider's current terms before adding credentials. Adzuna registration and documentation are at [developer.adzuna.com](https://developer.adzuna.com/). USAJOBS credentials come from the [USAJOBS developer portal](https://developer.usajobs.gov/), and `USAJOBS_USER_AGENT` must be the registration email. The Muse requires application registration under its [API terms](https://www.themuse.com/developers/api/v2/terms). Arbeitnow documents its public feeds at [arbeitnow.com](https://www.arbeitnow.com/blog/job-board-api), Jobicy documents its public API and fair-use rules in its [official API repository](https://github.com/Jobicy/remote-jobs-api), and Remote OK publishes its attribution requirements inside its [official JSON feed](https://remoteok.com/api).

## Behavior and safeguards

- Authentication is required; no profile or query is sent to the browser as a provider credential.
- AI search-coach responses use schema-validated structured output, no-store requests, a pseudonymous safety identifier, bounded conversation length, and the existing server-only OpenAI configuration.
- Fixed HTTPS provider hosts, encoded query parameters, eight-second timeouts, response-size limits, schema validation, and parallel requests bound external calls.
- One unavailable source does not discard successful results from other sources.
- Public feeds are fetched at provider-appropriate breadth. Jobicy and Remote OK feeds are cached for one hour, and paginated providers are queried across multiple pages without serial request waterfalls.
- Normalization produces one contract for title, company, location, remote status, dates, employment type, salary, description, and source attribution.
- Obvious duplicates are collapsed by normalized title, company, and location.
- Match scores use the search terms and the user's verified skills; they are directional, not hiring predictions.
- Suggested searches and keywords are deterministic values derived from verified skills, target role, and experience titles. CareerOS does not invent qualifications.
- Multi-word queries use a minimum relevance threshold instead of requiring every word verbatim, improving recall while retaining exact location and workplace filters.
- Search results can be sorted by profile match, posting date, salary, or title and filtered by source or salary availability.
- Default match ranking interleaves successful sources while preserving relevance order within each source, preventing one large feed from monopolizing the first results.
- Common-platform search links are generated locally from the active search and never expose provider credentials or profile data beyond the keywords and filters visible to the user.

CareerOS does not scrape LinkedIn, Indeed, Glassdoor, or other sites without an approved API agreement. Native ingestion from these platforms can be added if CareerOS receives the required partner approval and API credentials. Remotive's public feed is intentionally excluded because its public terms prohibit using the feed as a signup-gated listing experience. New sources must be added as provider adapters with attribution, terms review, schema validation, timeouts, and tests.
