# Code organisation by application type

Read when organising CLI commands, REST endpoints, MCP servers, or React/Vite
features. Follow established repo/framework conventions. The layouts below are
illustrative; create only files with actual responsibilities.

Ports and adapters (hexagonal architecture) isolate external technology. Feature
slices localize changes. Tracer bullets establish a thin working path through
the relevant boundaries. These are complementary techniques, not a mandatory
controller/service/repository stack or a requirement for six layers.

## `organisation-ports-and-adapters`

**Apply:** application behavior needs independent execution, multiple drivers,
or substitution of an external dependency.

**Problematic:** business rules depend on HTTP/MCP request objects or ORM rows;
a nominal adapter forwards calls while leaking the vendor API into every consumer.

**Prefer:** keep application operations independent of transport and storage SDKs.
An incoming adapter parses a request and translates a result; an outgoing adapter
implements the consumer's needed capability. The composition root selects concrete
adapters, passes dependencies, and owns startup/cleanup. Keep authorization and
domain invariants in the shared operation so another driver cannot bypass them.

Dependency direction: drivers depend on operations; operations depend on their
own contracts; concrete adapters implement those contracts. Runtime calls can go
outward through a port without making the operation import its implementation.
Adapt incompatible interfaces with a function/module or small wrapper; no class
hierarchy or dependency-injection container is required. In Go, prefer narrow
consumer-owned interfaces; in TS, use typed functions/objects and parse unknown
I/O values. See [consumer contracts](go-and-node-correctness.md#go-consumer-contracts)
and [shared transport operations](boundaries-and-layout.md#boundary-transport-composition).

**Exception:** pure behavior or compact single-driver CRUD can use concrete
dependencies without introducing ports for every function. Extract a seam when
substitution, independent execution, or meaningful reuse needs it.

**Verify:** exercise the operation without starting a transport or live dependencies;
inspect imports and resource ownership. When multiple drivers exist, verify equivalent
invariants, denied actions, cancellation, and failures through the affected drivers.

## `organisation-tracer-slices`

**Apply:** building a feature across UI/command, transport, application, and data.

**Problematic:** all controllers or tables are built first, but no user operation
works; a demo shortcut bypasses the path that the eventual product will use.

**Prefer:** implement one narrow useful path end to end, get feedback, then widen
it. A tracer bullet is an incremental implementation technique; vertical slices
are a code-organisation technique. Keep each feature's operation, adapters, and
tests discoverable under its owner rather than scattering them through global
technical layers. Across Go/browser boundaries, use consistent feature vocabulary
and explicit contracts rather than forcing everything into one directory.

Trace a representative action from entry point through parsing, authorization,
operation, storage/external calls, result mapping, and observable output. Include
schema/migration changes when relevant. Preserve a runnable acceptance scenario
and name affected consumers. Use controlled dependencies for early runs, then
verify the real boundary before claiming production behavior. Keep the path brief
in existing docs when it is otherwise hard to discover; no tracing framework or
per-feature design document is mandatory.

**Exception:** a pure library feature may end at a public function and its test.
A throwaway prototype can answer a separate question; do not present it as proof
that the integrated path works. Shared capabilities still need one coherent owner.

**Verify:** follow one success and one meaningful failure through the actual entry
point. Confirm the fixture path exercises the same operation and that important
behavior is not proved solely by mocked intermediate calls.

## `organisation-storage-seams`

**Apply:** persistence substitution or independent fixture execution is required,
or database details are leaking into unrelated consumers.

**Problematic:** a generic repository exposes an ORM query builder; changing an
engine rewrites handlers; an in-memory store claims to prove transaction behavior.

**Prefer:** define a narrow storage contract in terms of the consuming operation,
such as reserving stock atomically, rather than a universal CRUD/query interface.
Keep SQL, ORM models, driver errors, and row mapping inside the storage adapter.
Select it at composition. Define required atomicity, ordering, uniqueness, null,
precision, cancellation, and error semantics where the operation depends on them.
Keep transaction ownership explicit; independent helper commits must not split an
atomic operation. Do not pass vendor transaction objects through unrelated code.

A replacement must satisfy the required behavior, not just matching signatures.
Keep engine-specific capabilities explicit when no faithful portable operation
exists. Build only supported adapters; do not implement speculative databases.
Test the common behavioral contract against supported real engines, retaining
engine-specific checks. Fakes support development but do not prove SQL semantics.

Keep migrations with the actual schema owner and storage/wire representations
separate where their contracts differ. A database rename must not silently rename
a REST field, CLI JSON key, or MCP tool schema. Make schema changes explicit in
versioned migrations, identify affected old/new consumers, and follow
[representation contracts](data-models-and-migrations.md#model-representations),
[migration history](data-models-and-migrations.md#migration-history), and
[compatible rollout](data-models-and-migrations.md#migration-compatible-rollout).

**Exception:** one concrete store is sufficient when no substitution need exists.
Database swaps still require deliberate data migration and operational validation;
a port does not make engines interchangeable or eliminate schema evolution.

**Verify:** exercise supported adapter semantics, transaction failure, and error
translation. For a schema change, create from empty, upgrade representative prior
data, regenerate derivatives, and verify affected public contracts/older consumers.

## `organisation-file-boundaries`

**Apply:** a file mixes independently changing responsibilities or navigation is
hard, or a proposed split adds abstraction without a clear purpose.

**Problematic:** parsing, SQL, formatting, and unrelated operations fill one file;
every function gets a file and every table gets a service/repository/mapper chain.

**Prefer:** split by cohesive responsibility and reason to change: entry-point
composition, feature operation, boundary adaptation, or independently meaningful
view. Keep tightly coupled helpers and their tests near the owner. Each extraction
should improve navigation, independent verification, reuse, or change ownership;
file length alone is not a reason. Avoid broad `utils`, `types`, and `interfaces`
folders that become shared edit points.

Go files within a feature can share one package; creating another file need not
create another package/module. Use separate Go packages/TS modules when compile-time
dependency isolation is required; a file split alone does not enforce that boundary.
Colocate `_test.go` files. TS modules expose narrow entry points; avoid barrels that
export internals or introduce cycles/side effects.
React components and Hooks use native naming; pure helpers remain ordinary
functions. Split rendering (`.tsx`) from non-rendering logic (`.ts`) when useful.
Coordinate shared edit points as in
[change ownership](boundaries-and-layout.md#boundary-change-ownership).

**Exception:** a small cohesive command, handler, component, or feature can stay
in one file. A legitimate framework layout can group files differently.

**Verify:** trace a representative edit and inspect the resulting import graph.
Explain each new file's responsibility; check affected behavior/public consumers.
Do not judge conformance by file counts, line limits, or abstraction counts.

## `organisation-cli`

**Apply:** Go or Node/TS command-line applications and subcommands.

**Problematic:** importing a command opens a live DB; domain helpers call process
exit; progress messages corrupt JSON output or a pipe.

**Prefer:** keep the executable root focused on command assembly, config/dependency
composition, signals, cleanup, and exit status. Commands own args/flags, validation,
and presentation; feature operations own behavior. Pass streams, cancellation,
and relevant dependencies explicitly so tests can run without a terminal/live store.
Keep machine-readable results on stdout and diagnostics on stderr; prompts and
terminal formatting belong to presentation, with deliberate noninteractive behavior.
Help/version and invalid arguments should not initialize unrelated live resources.
For one-shot Node commands, set `process.exitCode` and close owned resources so
output can flush before natural exit, rather than terminating inside domain helpers.

Illustrative Go command with an export feature:

```text
cmd/tool/main.go                 # compose and exit
internal/cli/export.go           # flags and presentation
internal/export/export.go        # operation and needed contracts
internal/export/export_test.go
internal/export/sqlstore.go      # storage adapter, if needed
```

In TS, the same responsibilities can live in `src/main.ts`, `src/commands/export.ts`,
and a feature module; no workspace or class hierarchy is implied.

**Exception:** a small file-transforming CLI may need only `main` and one testable
function. An independently deployed service client legitimately uses its API.

**Verify:** representative command success/failure, help without live resources,
config precedence, captured stdout/stderr, piped/noninteractive behavior, exit
status, interruption, and cleanup as applicable.

## `organisation-rest`

**Apply:** REST endpoints in Go or Node/TS services.

**Problematic:** one route owns parsing, authorization, unrelated SQL, and response
formatting; another driver must call that route to reuse its business behavior.

**Prefer:** compose routes/middleware and shared clients at startup. Group endpoints
with their feature owner. HTTP adapters own path/query/body decoding, request limits,
authentication context, status/headers, and response serialization. Operations own
business validation, authorization, and atomic changes; storage adapters own queries
and row mapping. Use the smallest split supporting those responsibilities, with
shared error mapping only where meanings match. Pass request cancellation to I/O.

Illustrative feature, inside the native Go package or TS feature directory:

```text
orders/
  create.go / create.ts              # operation and invariants
  http.go / http.ts                  # request/result adaptation
  sqlstore.go / sql-store.ts         # persistence, if needed
  create_test.go / create.test.ts
  http_test.go / http.test.ts
```

Keep wire schemas/public writable fields explicit; do not serialize whole storage
rows. See [HTTP contracts](http-contracts.md) for protocol behavior and compatibility.

**Exception:** a compact read endpoint can remain one handler with a focused query
and explicit result. Separate read projections from write workflows only when their
needs differ; CQRS, mediator buses, and rich domain models are not requirements.

**Verify:** request-to-response behavior, denied paths, malformed input, status/body
contracts, persistence failures, and cancellation. Pair transport tests with real
storage tests where transactional behavior matters; verify older clients on changes.

## `organisation-mcp`

**Apply:** MCP tools/resources and stdio or HTTP server composition.

**Problematic:** tools duplicate REST rules or call the co-located REST transport;
logging corrupts stdio; every client shares mutable user/session state.

**Prefer:** compose the SDK server, transport, dependencies, and shutdown at the
root. Keep feature-local registrations, input/output schemas, and protocol result
mapping next to their operations. Use the same application operation as local CLI
or REST drivers. Keep MCP request/session objects out of shared domain logic; pass
the validated principal, cancellation, and operation data it actually needs.

Separate tools (operations), resources (addressable context), and prompts (message
templates) where applicable; keep each with its feature and advertised contract.
Keep tool names, descriptions, and advertised schemas consistent with actual
behavior. Enforce authorization/capabilities in executable code; annotations are
descriptions. Keep protocol/dispatch failures distinct from operation failures,
using the negotiated protocol and installed SDK's error-result semantics. Validate
structured results when an output schema is advertised.

Illustrative TS server (equivalent Go packages are valid):

```text
src/main.ts                        # transport and lifecycle
src/features/orders/create.ts     # shared operation
src/features/orders/mcp.ts        # schema, registration, result mapping
src/features/orders/mcp.test.ts
```

For stdio, stdout carries only valid MCP messages; route logs to stderr. For
HTTP, explicitly own authentication and any per-client/session state. Follow the
installed SDK/negotiated protocol rather than copying an unversioned example.

**Exception:** a stateless server needs no session-state framework. A remote API
gateway can legitimately call that service and keep domain rules with its owner.
Keep a small explicit registration list rather than inventing plugin discovery.

**Verify:** protocol-level discovery and invocation, schema/result agreement,
operation-error mapping, denied actions, cancellation, and transport shutdown.
Check stdio contains no stray output and HTTP clients do not leak state across
sessions where state exists. A direct function test alone does not prove MCP wiring.

## `organisation-react-vite`

**Apply:** client React applications built with Vite.

**Problematic:** `App.tsx` owns every feature and fetch; global Hooks/types folders
couple unrelated views; importing an API client bundles a server store or secrets.

**Prefer:** let `main.tsx` mount the app and compose required providers; let the
app shell/routes compose features. Group a feature's views, behavior, API adaptation,
and tests together. Keep UI state with its nearest owner; lift it only to actual
shared consumers. Keep remote-data ownership distinct from local interaction state,
using the repo's existing fetching/cache approach. Extract a Hook for cohesive React
behavior or external synchronization, and an ordinary function for pure calculations.
Do not make every component acquire a Hook, view model, provider, or global store.

```text
src/main.tsx
src/App.tsx
src/features/orders/OrdersPage.tsx
src/features/orders/order-api.ts       # browser-safe boundary
src/features/orders/OrdersPage.test.tsx
src/components/Button.tsx              # genuinely shared UI primitive
```

Add local components/Hooks/pure helpers as responsibilities grow. Browser API
adapters own response parsing and wire mapping where required; server persistence
stays outside the browser import graph. Keep Vite config at the app root and public
environment values deliberate (`VITE_` values enter the client bundle). A development
proxy is not a production API deployment. Check production URL/asset configuration.

**Exception:** a small view can keep its state and API call together. Framework
routing/SSR rules take precedence where used. Feature folders do not require Redux,
a router, or a prescribed fetching library. Detailed React guidance stays in the
manual-only `react-patterns` skill; do not invoke it automatically.

**Verify:** user-visible feature behavior, loading/error/retry paths, stale-response
or cancellation behavior where relevant, and actual production build/API wiring.
Confirm tests use browser-safe boundaries and shared changes verify affected views.

## Sources

- [Cockburn: original ports and adapters](https://alistair.cockburn.us/hexagonal-architecture/)
- [Bogard: vertical slices and selective abstraction](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Hunt and Thomas: tracer bullets vs prototypes](https://www.artima.com/articles/tracer-bullets-and-prototypes)
- [Netflix: technology adapters and testing boundaries](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749)
- [Go module/command layouts](https://go.dev/doc/modules/layout)
- [Go transaction ownership](https://go.dev/doc/database/execute-transactions)
- [Go HTTP boundary tests](https://pkg.go.dev/net/http/httptest)
- [CLI streams, signals, and noninteractive conventions](https://clig.dev/)
- [Node exit status and output flushing](https://nodejs.org/api/process.html#processexitcode)
- [MCP tools and error/result contracts, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP transport requirements, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [MCP resources, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)
- [MCP prompt templates, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts)
- [MCP cancellation, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation)
- [React component decomposition](https://react.dev/learn/thinking-in-react)
- [React state ownership](https://react.dev/learn/sharing-state-between-components)
- [React custom Hook boundaries](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Redux feature locality; no Redux requirement implied](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
- [Vite public environment handling](https://vite.dev/guide/env-and-mode)

Layouts, shared-checkout coordination, and abstraction thresholds are skill policies,
not universal recipes or guarantees of database portability/conflict-free work.
