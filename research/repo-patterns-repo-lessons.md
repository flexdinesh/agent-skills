# repo-patterns: Servediff and Tokeninsights lessons

Inspected 2026-09-26. Local source review, targeted checks, and policy synthesis;
not a whole-repository correctness audit or an agent-effectiveness benchmark.
Changes apply to [repo-patterns](../skills/repo-patterns/SKILL.md), not either product.

| Repository | Local checkout | Inspected commit |
| --- | --- | --- |
| Servediff | `/home/dee/workspace/servediff/main` | `b9a7ef4c8e213d6c65ded790eba66daaf4e25879` |
| Tokeninsights | `/home/dee/workspace/tokeninsights/main` | `a9af7c20b14d0aa1fd98c68909acc43c3186dc25` |

Servediff was clean. Tokeninsights had existing browser-opening implementation,
tests, help, and documentation changes. Those changes were preserved and excluded
from adopted lessons; the inspected architecture/schema sections were unaffected.
Source links below pin the committed evidence. Two related Go/React products are
useful examples, not evidence of universal industry consensus.

## Comparison

| Boundary | Servediff | Tokeninsights | General lesson |
| --- | --- | --- | --- |
| Go ownership | Root module; `cmd/servediff` and focused `internal/` packages | Nested CLI module; TUI, sync, and HTTP share it | Executable count does not determine module count |
| JS workspace | `apps/web`, `packages/api`, `packages/shared` | `packages/web`, thin `packages/cli` manifest, `tools/build` | Judge dependency ownership, not directory spelling |
| Production | Go serves embedded React assets; live mode also needs Git | Go serves embedded React assets and owns SQLite | Build workspace and runtime deployment are different graphs |
| Local drivers | CLI composes REST and MCP over shared review operations | CLI/TUI and HTTP consume pipeline/database owners | Reuse application operations, not transport handlers |
| Fixtures | Patch source, memory state, managed Go child for Vite | Synthetic JSONL/SQL sources, real sync/normalize, disposable SQLite | Controlled dependencies should exercise real behavior |
| API authority | OpenAPI with generated TS client | OpenAPI with generated Go models and TS/Zod schemas | One wire authority; runtime and behavioral evidence still needed |
| State contract | Source support plus session policy resolves capabilities | Raw facts, canonical facts, compatibility/rebuild lifecycle | Make support, provenance, and continuity explicit |
| Verification | Native Go tests, web tests, built-binary/client conformance | Native Go tests, tool tests, browser tests against built CLI | Test the boundary and artifact that consumers actually use |

Evidence: [Servediff architecture](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/docs/architecture.md),
[Tokeninsights architecture](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/design.md),
[Tokeninsights native task manifest](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/package.json).

## Lessons adopted

### Separate build and deployment boundaries

Both products use Node/pnpm to build the browser UI, then embed assets in Go.
Committed assets support direct Go builds/installs without JS tooling. This
supports one deployment with several development packages; it does not justify
forcing every package into a separately deployed service.

Added `boundary-runtime-distribution`. Verification must cover supported native
build/install paths and the built executable, not merely Vite. Committed assets
remain an option based on distribution requirements, not a universal policy.
[Servediff development](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/docs/development.md),
[Tokeninsights development](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/development.md).

### Let transports share an application operation

Servediff's REST and MCP adapters consume `reviewservice` for comment listing and
resolution. The shared service checks capabilities, computes applicability, and
returns typed not-found results; transports translate protocol details. It is a
focused extraction with actual consumers, not a generic service layer for every
endpoint. Tokeninsights likewise keeps ingest/normalization in its pipeline and
analytics in the database owner, used by different drivers.

Added `boundary-transport-composition`: a new local transport should consume the
application operation rather than call another local transport or duplicate its
domain rules. Remote service clients remain legitimate network boundaries.
[Review service](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/internal/reviewservice/service.go),
[MCP consumer](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/internal/mcpapi/server.go).

### Describe capabilities rather than infer them from source names

Servediff sources report technical support; session policy resolves enabled,
disabled, and unavailable operations. UI and server consume that contract. A
fixture/piped source can support comments while lacking file contents or live
refresh. This prevents a single `isFixture` flag from deciding unrelated behavior.

Added `runtime-capabilities`, with direct-call denial tests. Capability discovery
remains separate from authentication and object/field authorization; uniform
products need no capability framework.
[Session resolution](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/internal/session/session.go),
[Server enforcement](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/internal/httpapi/server_test.go).

### Build fixture state through the real pipeline

Tokeninsights copies compact synthetic source files, materializes an external
SQLite source from SQL, and invokes the actual CLI `sync --all --source-dir ...
--db-path ...`. Prepared data then serves CLI/UI development with startup sync
disabled. Fixture-safety tests validate allowed records and reject representative
sensitive values. This exercises adapters and normalization that a ready-made
output database would bypass.

Servediff's Vite runner starts a Go fixture server with memory state and port
zero, reads the bound address, and owns shutdown. These approaches reinforce
`fixture-scenarios`, `fixture-fidelity`, and `runtime-isolation`: use real paths,
bounded readiness, synthetic relevant inputs, and explicit lifecycle ownership.
Neither approach establishes arbitrary concurrent-run isolation automatically.
[Fixture preparation](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/tools/build/src/setup-dev-data.ts),
[Fixture safety](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/tools/build/test/fixture-safety.test.ts),
[Managed fixture server](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/apps/web/test/fixture-server.ts).

### Give generated artifacts one source and a meaningful drift check

Tokeninsights regenerates Go/TS API derivatives in temporary directories and
compares bytes with committed outputs. Its schema check compares the authoritative
SQL with the embedded copy and Go constants. Servediff rebuilds/stages embedded
assets and checks Git changes, including untracked files, before binary conformance.

Added `tool-generated-artifacts`: verification must preserve the comparison
baseline or explicitly inspect resulting Git drift. It must detect missing,
changed, and stale extra output. Generated client types do not validate runtime
responses; Tokeninsights also parses them through contract-generated Zod schemas.
Strict response validation needs an explicit additive-compatibility policy.
[Temporary API check](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/tools/build/src/check-api.ts),
[Schema check](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/tools/build/src/check-schema.ts),
[Client response parsing](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/web/src/api.ts),
[Servediff distribution CI](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/.github/workflows/ci.yml).

### Distinguish authoritative facts, projections, and recovery

Tokeninsights retains metadata facts with original source identifiers and derives
canonical identifiers through normalization. Schema version, semantic data
generation, and normalization-rule signatures serve different compatibility
purposes. Rule changes can refresh canonical identifiers without a full source
reimport. Pending rebuild state prevents incomplete analytics being presented
as complete, and retries require the original source scope.

Added `model-derived-state`. Its key guardrail: a row-preserving migration,
derived-only rebuild, and full reset/reingestion are different operations. Deleted
source artifacts can mean lost history after reingestion; do not infer that a
local database is disposable merely because part of it is derived.
[Compatibility and loss contract](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/design.md),
[Normalization signatures](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/normalize.go),
[Scoped recovery](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/recovery.go).

### Treat incremental progress as a correctness boundary

Tokeninsights validates source reuse with parser/collector identity and content
or logical fingerprints; Pi byte cursors additionally verify prior content and
record boundaries. Source ingest commits facts, queued normalization work, and
successful continuity state through one transaction. Failure records can survive
while partial fact writes roll back. Reuse optimizes work; deduplication remains
necessary when processing repeats.

Added `db-ingestion-continuity`: checkpoints must not outrun durable data; stale
parser/config/content evidence must not skip required work. Reinforced consistent
read snapshots, connection-scoped settings, and cross-process writer ownership.
This does not mandate cursors, file locks, or SQLite for ordinary CRUD.
[Reuse validation](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/source_reuse.go),
[Cursor validation](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/source_cursor.go),
[Transactional ingest](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/pipeline/sync.go).

### Preserve async and cache ownership at web boundaries

Tokeninsights query keys include server identity, filters, and revision; its
client forwards cancellation signals and only preserves previous analytics for
matching scopes. This is useful for local/remote dashboard switching as well as
ordinary filter changes. Refined `web-state-boundaries` to include that identity
explicitly, without requiring a particular query library or duplicating the
React skill's detailed component guidance.
[Web query ownership](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/web/src/api.ts).

## Conventions not adopted mechanically

- **Directory names:** both layouts are viable. No automatic move from
  `packages/web` to `apps/web`, or split of one Go module into several.
- **Native task manifests:** relaxed the original blanket rejection of Go
  `package.json` files. Tokeninsights uses private scripts delegating to native Go;
  Go dependencies and production execution remain native.
- **Tooling:** neither repo uses mise; Servediff has Taskfile dispatch and
  Tokeninsights has pnpm dispatch. Existing supported tooling is not a defect.
- **Fixed run resources:** Tokeninsights uses one `.tokeninsights-dev` directory
  per checkout and fixed browser-test ports; Servediff also fixes its browser-test
  frontend port. These require namespaces/overrides or serialization for concurrent
  runs. A managed Go child using port zero solves only that child's allocation.
- **Startup sync:** Tokeninsights `--no-sync` skips startup ingestion; it does not
  disable the HTTP Sync action. Do not mistake it for a read-only capability.
- **Generated assets in CI:** Tokeninsights CI runs `build`, which stages assets,
  before comparing built and embedded assets. That ordering alone cannot prove
  committed assets were current before staging; no explicit Git-drift assertion
  follows there. Compare before overwrite or assert the resulting Git diff.
- **Browser trust:** Servediff denies mismatched Origin/cross-site requests;
  Tokeninsights permits API CORS for remote dashboards. Neither policy is a
  universal template, and CORS is not authentication. The skill now asks for the
  actual local/network/client trust boundary rather than classifying wildcard
  CORS alone as a bug.
- **Repository instructions:** Tokeninsights' schema-approval requirement remains
  its own policy. It is not imported as a mandatory approval stage in this skill.

Evidence: [Tokeninsights scripts](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/package.json),
[Tokeninsights CI ordering](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/.github/workflows/ci.yml),
[Tokeninsights API origins](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/internal/server/cors.go),
[Servediff request checks](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/internal/httpapi/server.go).

## Coverage and checks

Inspected manifests/workspaces, Go modules, task scripts, CI, architecture/dev
docs, composition, fixture runners/preparation, transport/service consumers,
capability enforcement, contract generation/client parsing, schema compatibility,
read/write ownership, source reuse/cursors, normalization, recovery, and relevant
tests. Did not trace every endpoint/component, measure performance/conflicts,
run full suites, or test concurrent development processes.

Targeted checks passed:

- Servediff: `go test ./internal/session ./internal/reviewservice`.
- Tokeninsights: fixture-safety Node tests (3), schema check, and Go pipeline
  recovery tests (`go test ./internal/pipeline -run '^TestRecovery' -count=1`).
- Tokeninsights: targeted Pi cursor, same-size rewrite, and normalization-rule
  tests (`-run '^Test(PiCursor|ClaudeCodeSourceReuseDetectsSameSizeRewrite|NormalizeSkipsCurrentRules)'`).

The skill gained six indexed rules, refinements to existing rules, and seven
evaluation scenarios. Structure/link checks verify document integrity, not that
agents consistently apply the new rules. Behavioral skill evaluations remain unrun.
