# Product analytics warehouse

Examples: Databricks, Snowflake, BigQuery, ClickHouse, Redshift, dbt. Use whatever SQL or warehouse tool the session provides, read-only.

## What this source contains

The product, data-pipeline, and warehouse-telemetry layer. It complements infrastructure observability. Observability is the *infra/runtime* view. The warehouse is the *product/data* view: what users did, which experiments ran, how feature usage evolved, where a threshold constant came from.

- **Product analytics events.** Raw event tables and typed, deduplicated models built on them. User behavior: feature invocations, clicks, accepts/rejects, submissions, client-reported errors.
- **Usage and billing events.** For cost- or volume-driven decisions.
- **Experiment / feature-flag data.** Exposure and outcome tables.
- **System tables.** Query history, compute usage, billing, access audit. Answer "was this query expensive?", "how often did anyone run this?", "when did warehouse load spike?"
- **Transformation lineage** (e.g. dbt models). Reveals what pipelines depend on a table or field. Upstream changes frequently motivate consumer-code changes.
- **Notebooks.** Exploratory analyses engineers wrote before code changes. Often not queryable through a SQL tool. If you suspect the rationale lives in one, name it as a gap.

## How to search it

**Orient before querying.** Schemas are company-specific. Never assume a table name. List tables matching a keyword and describe a table before you query it. If the tool returns an async statement handle, poll it rather than re-running the query.

**Time-bound every query.** Event tables are huge and unconstrained scans time out. Filter on the event timestamp column with a window bracketing the ship date, typically about 30 days before and after, wider only for strong reason.

**Prefer typed, deduplicated models over raw event tables.** Drop to raw tables only when no model exists yet, or you need events newer than the model's refresh.

### Investigation patterns that tend to pay off

1. **Event usage trajectory.** Daily counts of the relevant event across a window around the PR merge. A step function from zero to steady volume within a day or two of the merge is strong circumstantial evidence the PR launched the feature. A decay to zero suggests a deprecation or deletion.
2. **Guard-rail / defensive-check origin.** Distribution (median / p99 / max) of the relevant event property in the 14 days *before* the PR. A p99 that matches the target's threshold constant suggests the number was chosen from data.
3. **Experiment / feature-flag lookup.** Find the exposure table, then pull exposure counts by variant for the relevant flag key near the PR date.
4. **Query-history evidence for migrations, backfills, or perf rewrites.** Filter query history by statement text containing the table or symbol, with a tight time window. Sort by duration or bytes read to surface the expensive queries that likely motivated the change.
5. **Lineage.** If the target reads from or writes to a modeled table, the model's own git history often carries the rationale. Hand that lead back to the source control investigator rather than chasing it yourself.

## What good evidence looks like here

- An error-classifying event's count drops to near zero in the days after a defensive-code PR. Suggests the PR resolved that error class.
- An exposure table row names the target's feature-flag key with a "shipped" / "concluded" decision around the PR ship date.

## Common pitfalls

- **Instrumented is not caused.** An event's existence means someone cared enough to log it, not that the target code exists *because* of it. Pair with a PR/commit citation before claiming causation.
- **Silent instrumentation changes.** A step function in event volume may mean a new event started being logged, not that user behavior changed. Check for instrumentation PRs in the same window.
- **Schema drift.** Event properties evolve. A column today may not have existed when the target was written. Older data may carry the property only inside a raw JSON blob.
- **Refresh lag.** Modeled tables rebuild on a schedule. For the last few hours, fall back to raw tables and deduplicate.
- **Unconfirmed tables.** Reporting a result from a table whose existence you never confirmed is a classic failure mode. Probe first.
- **Retention cliff.** If the relevant window predates the table's retention or the model's creation date, that's a *gap*, not a null result. Name it explicitly so the synthesizer doesn't read "no results" as "no activity."

## What to return

For each relevant finding:

- Type (product event / experiment exposure / usage or billing event / system-table row / lineage)
- Fully-qualified table name and the exact query you ran
- Time window queried
- Compact numeric summary (counts, percentiles, first/last-seen timestamps). **Don't dump raw rows.**
- Temporal correlation with the target's ship date (e.g., "first row 2024-08-15, PR #49074 merged 2024-08-14")
- Relevance and strength: direct / circumstantial / weak
