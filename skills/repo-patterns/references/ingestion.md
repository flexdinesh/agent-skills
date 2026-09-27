# Ingestion and derived-state recovery

**Read when:** changing incremental imports, checkpoints, source reuse, normalization, or rebuilds.

**Policy status:** Recovery and continuity policies for ingestion systems; ordinary CRUD needs no pipeline framework.

## `model-derived-state`

**Distinguish preserved and rebuildable data.**

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

## `db-ingestion-continuity`

**Commit validated ingestion progress.**

**Apply:** incremental import, sync, replay, or durable processing checkpoints.

**Problematic:** a byte offset advances before facts commit; file size alone
proves a source is unchanged; retry skips data interpreted by an older parser.

**Prefer:** treat a checkpoint as evidence tied to source identity, relevant
configuration, parser/collector version, and validated content continuity.
Handle truncation, replacement, partial records, changed dependencies, and
source mutation during parsing. Use content/logical fingerprints or another
source-appropriate consistency mechanism; an offset is safe only for a verified
append-compatible source. Fall back to full processing when reuse evidence fails.

Persist imported facts, deduplication identity, queued derived work, and successful
progress consistently within the chosen transaction boundary. Failed processing
must not advance success markers. Failure diagnostics may persist separately
without partial facts; make that distinction explicit. Repeated processing must
preserve intended results, rather than rely on skip optimization for correctness.

**Exception:** a bounded one-shot import needs no cursor/cache. External offset
stores may require reconciliation or an idempotent protocol instead of one DB
transaction. A content hash is not a universal snapshot guarantee for mutable data.

**Verify:** append, same-size replacement, truncation, incomplete final record,
parser/config change, source mutation, crash between data/progress writes,
duplicate replay, and commit failure. Verify partial success across source scopes
is reported honestly and retry preserves previously committed progress.

## Sources

- [Tokeninsights schema and recovery contract](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/design.md)
- [Tokeninsights normalization rule signatures](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/normalize.go)
- [Tokeninsights validated source reuse](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/source_reuse.go)
- [Tokeninsights byte cursor validation](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/source_cursor.go)
- [Tokeninsights atomic source ingest](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/sync.go)
