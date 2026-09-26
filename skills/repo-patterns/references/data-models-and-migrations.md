# Data models and migrations

Read when designing persistent/wire models, changing schema, or planning rollout.
Database-specific examples below target Postgres; check the actual engine/version.

## `model-invariants`

**Apply:** new entities, relationships, or lifecycle states.

**Problematic:** storage columns define the API by accident; independent booleans
permit impossible order states; amounts lose precision crossing Go/JSON/JS/SQL.

**Prefer:** identify owner, identity, legal transitions, authorization scope,
relationships, and atomic operations before choosing storage. Make invalid states
hard to construct and enforce persistent invariants at storage boundaries.
Define units, precision/rounding, time semantics, and identifier serialization.
Use exact decimal or appropriately bounded minor-unit integers where financial
accuracy requires them; account for JS integer range and JSON representation.
Normalize stable relationships; give denormalized projections a refresh owner.

**Exception:** a straightforward CRUD model may need only explicit contracts,
validation, and constraints. Domain-driven aggregates, event sourcing, soft deletes,
or generic entity frameworks are not mandatory.

**Verify:** illegal transitions, relationship integrity, amount/ID round-trips,
and time-boundary cases relevant to the domain. Explain the consistency boundary.

## `model-representations`

**Apply:** transport, domain, and storage representations have different needs.

**Problematic:** returning an ORM row exposes internal fields; copying a whole
request into persistence lets clients set ownership or privileged state.

**Prefer:** name input/output contracts and writable fields. Separate representations
when visibility, validation, nullability, lifecycle, or versioning differs. For a
partial update, distinguish omission (retain) from explicit null (clear, if allowed)
and defaulting. Map at the relevant I/O boundary; share wire contracts/clients
across Go/JS rather than sharing private persistence models.

**Exception:** a single representation can be fine when contracts actually match.
Do not generate three near-identical types/mappers for every table. A read model
may be a purpose-built SQL projection rather than an aggregate.

**Verify:** only intended fields are accepted/exposed; missing/null/default values
behave as documented. Contract generation comes from one authority and is repeatable.
Check old consumers when response parsing is strict.

## `migration-history`

**Apply:** schema or durable reference-data changes in shared environments.

**Problematic:** editing a deployed migration leaves environments divergent;
schema auto-sync replaces history; scenario seeding quietly drops live tables.

**Prefer:** one reproducible versioned history and deliberate executor per shared
database, or explicit coordination between migration owners. Keep applied shared
migrations immutable; correct with new migrations. Separate disposable development
fixtures from durable data/schema changes. Use the existing migration tool and its
ordering/checksum semantics. Coordinate concurrent migrations after integration.

**Exception:** undeployed migrations on a private branch can be edited. Tiny
atomic reference-data changes can accompany schema when the tool/deployment needs
it; do not universally ban mixing DDL and DML. Schema snapshots can complement
history where the chosen tool supports them.

**Verify:** create from empty and upgrade a representative previous version; check
history/checksum handling, regenerated queries/types, fixture loading, and failure
recovery. Do not repair a shared history by deleting applied migrations.

## `migration-compatible-rollout`

**Apply:** schema/contracts change while old clients, replicas, or workers remain.

**Problematic:** a column is renamed/dropped before old code stops using it;
backfill copies data while concurrent writes still update only the old field.

**Prefer:** state which versions coexist and use a change-specific transition:

1. Expand compatibly and establish writes that preserve the transition invariant.
2. Backfill in bounded, resumable batches that handle concurrent updates safely.
3. Verify completeness/consistency, switch readers/writers, and observe behavior.
4. Contract after old consumers are gone and recovery requirements are satisfied.

Example: replacing `display_name` with `preferred_name` requires a policy for old
writes, conflict resolution, and completeness. A temporary compatible writer or
trigger may bridge versions. Copying once before enabling compatible writes leaves
a race; merely adding both fields to a type does not establish consistency.

**Exception:** coordinated downtime can make a transactional migration simpler.
Purely additive changes may need no dual writes. A new API major version is not
automatically necessary for every schema iteration.

**Verify:** old/new readers and writers, writes during backfill, interruption/resume,
conflicting updates, and rollback/forward-repair behavior. Contract only with actual
completion evidence; restarting application code alone cannot undo lost data.

## `migration-operational-safety`

**Apply:** DDL or backfills on populated production-like tables.

**Problematic:** a metadata-only column addition is called lock-free; a concurrent
index build runs inside a transaction; a large backfill holds locks indefinitely.

**Prefer:** inspect the actual engine/version's lock level, scans/rewrites,
transaction support, estimated workload, and recovery. Bound lock/statement time
and batch work appropriately. Postgres column additions may avoid rewrites while
still requiring strong locks. Non-volatile vs volatile defaults matter. Concurrent
index creation has separate restrictions and can leave invalid indexes on failure.

Distinguish reversibility from recovery: some changes need forward repair or backup
restore. Make resumable batches idempotent or otherwise safely restartable, with
completion tracking. A seed/reset path must target disposable resources explicitly.

**Exception:** ordinary transactional DDL/index creation is appropriate for small
or offline tables. Do not force concurrency mode, production-sized fixtures, or
zero downtime where requirements do not demand them.

**Verify:** representative data/workload, lock contention where relevant, timeout,
interruption/retry, invalid-index cleanup, and migration-tool transaction settings.
State measurements and assumptions; avoid guarantees inferred from small fixtures.

## `model-derived-state`

**Apply:** ingestion produces normalized facts, projections, or other rebuildable data.

**Problematic:** normalization destroys the only retained source identity;
unchanged schema version hides incompatible counting semantics; reset is called
a migration even though deleted source artifacts cannot be reconstructed.

**Prefer:** identify authoritative inputs and derived outputs, provenance,
deduplication identity, and rebuild ownership. Retain the minimal source facts
needed to explain/recompute derived results, without collecting sensitive payloads
by default. Separate schema structure compatibility from data-semantics and
normalization-rule compatibility where those can change independently. A rule
signature/version can trigger recomputation without treating every rule change
as a full reingestion or product release.

Choose row-preserving migration, derived-only rebuild, or full reingestion
deliberately. State source availability and loss risks before destructive recovery.
Persist incomplete rebuild status and required source scope; prevent partially
rebuilt results from masquerading as complete. Reject unsupported newer formats
rather than silently resetting them.

**Exception:** ordinary CRUD needs no raw/canonical pipeline or extra version
markers. A disposable cache may be safely rebuilt when its authoritative source
and loss tolerance are established. These are not reasons to reset user-owned data.

**Verify:** rule changes without new input, raw provenance preservation, repeat
rebuilds, missing/deleted sources, incompatible/newer versions, interruption/resume,
and changed source scope. Verify migration and reset are distinct behaviors.

## Sources

- [Postgres constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Postgres numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html)
- [TypeScript optional properties](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [Evolutionary database design](https://martinfowler.com/articles/evodb.html)
- [GitLab compatible migrations](https://docs.gitlab.com/development/database/avoiding_downtime_in_migrations/)
- [GitLab resumable background migrations](https://docs.gitlab.com/development/database/batched_background_migrations/)
- [Postgres ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Postgres CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [API source/wire/semantic compatibility](https://google.aip.dev/180)
- [Tokeninsights schema and recovery contract](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/design.md)
- [Tokeninsights normalization rule signatures](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/normalize.go)

Rollout complexity should follow real compatibility requirements. No ORM,
database, or deployment platform is required by these patterns.
