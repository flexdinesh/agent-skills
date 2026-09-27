# Architecture and ownership

**Read when:** choosing topology, changing ownership/imports, sharing operations, or separating build and runtime dependencies.

**Policy status:** Architectural skill policies; layouts are illustrative. Keep small cohesive code together.

## Contents

- [Choose topology from actual consumers](#layout-topology)
- [Colocate each capability](#boundary-cohesion)
- [Enforce public surfaces](#boundary-public-api)
- [Extract for real consumers](#boundary-reuse)
- [Coordinate shared edit points](#boundary-change-ownership)
- [Separate build and runtime graphs](#boundary-runtime-distribution)
- [Share operations across transports](#boundary-transport-composition)
- [Isolate external technology](#organisation-ports-and-adapters)
- [Build one working path](#organisation-tracer-slices)
- [Specify storage behavior](#organisation-storage-seams)
- [Split by responsibility](#organisation-file-boundaries)

## `layout-topology`

**Choose topology from actual consumers.**

**Apply:** new layout or proposed restructure of an existing repository.

**Problematic:** a Go API, worker, and CLI acquire separate modules solely because
they have three `main` functions; a small frontend gains a workspace and layers
without independent package consumers.

**Prefer:** inventory entry points, packages/modules, deployments, releases, and
domain owners separately. Use the smallest native structure that serves them.
For Go module/package choices read [Go layout](go.md#module-and-package-layout);
for frontend layout read [web organisation](web-react-vite.md#organisation-react-vite).

For several projects, `apps/` for executable applications and `packages/` for
consumed libraries/tooling is a useful default. Use native Go structure within
its owner. A private JS manifest can be a thin task adapter that delegates to
native Go commands; it does not make Go code a JS runtime package. Avoid dummy
dependencies or duplicated build logic solely for runner discovery. An illustrative
mixed tree:

```text
apps/api/                     # cmd/, internal/, local run docs
apps/web/                     # package.json, src/, fixture scenarios
apps/importer/                # CLI entry point, config, fixtures
packages/api-client/          # bounded consumer contract
packages/ui/                  # UI with actual consumers
pnpm-workspace.yaml           # JS packages; optional thin native-task adapters
mise.toml                     # shared tool policy / dispatch
```

**Exception:** genuine independent releases, dependency requirements, or deployments
can justify separate units. Existing framework layouts take precedence over a
cosmetic tree preference. Multiple projects already form a multi-project repo;
arguing whether to call it a monorepo adds no boundary.

**Verify:** build/test each meaningful target in its actual consumer context.
Check dependency resolution and supported release/install paths, including native
workspace restrictions, not merely the directory tree.

## `boundary-cohesion`

**Colocate each capability.**

**Apply:** a capability is spread across broad layers or one module changes for
unrelated reasons.

**Problematic:** every order feature edits global controllers, models, services,
and helpers; moving those files into one giant `OrderManager` preserves coupling.

**Prefer:** colocate order behavior, contracts, focused adapters, and tests under
an order owner. Entry points compose owners. Infrastructure such as telemetry can
remain technical packages. Place transport/persistence adapters adjacent to the
feature or in focused adapter packages according to dependency direction.

**Exception:** a small cohesive implementation can remain one package/file.
Simple CRUD need not acquire domain entities, aggregates, and four layers.

**Verify:** trace a representative change. Identify its owner, consumers, state,
and dependencies; explain why edits outside that owner are necessary.

## `boundary-public-api`

**Enforce public surfaces.**

**Apply:** consumers depend on another owner's implementation or imports violate
the intended dependency graph.

**Problematic:** web imports `../../api/src/store`; shared code imports an app;
a public barrel re-exports private persistence helpers.

**Prefer:** declare small public entry points and allowed dependencies. Use JS
package `exports` and declared workspace dependencies; check aliases, relative
paths, re-exports, cycles, and build config. Apply native package visibility;
[Go layout](go.md#module-and-package-layout) covers `internal/` restrictions.
Add focused import checks or use existing Nx boundary constraints where
conformance requires enforcement.

**Exception:** related binaries can share implementation through a common owner.
Some feature boundaries remain inside one package; use conventions/checks suited
to the size rather than splitting every feature into a published package.

**Verify:** public consumers build without private paths. Check the resolved import
graph and a known forbidden import against the guardrail. Node exports are not a
security sandbox; absolute filesystem access can bypass them.

## `boundary-reuse`

**Extract for real consumers.**

**Apply:** promoting private code or introducing/changing a shared package.

**Problematic:** all types, SQL, browser components, and config accumulate in
`shared`; different domains adopt one model simply because its fields look alike.

**Prefer:** extract a named capability with real consumers, coherent contract,
dependency policy, and owner. Share stable primitives or wire clients where they
fit. Keep domain-specific behavior with its owner; tolerate small duplication
when semantics differ. Applications compose libraries without libraries importing
application entry points.

**Exception:** a deliberately public library may have one initial consumer because
publication is the actual requirement. Document that public contract.

**Verify:** list consumers and why their semantics match. Build affected consumers;
check that reuse does not pull new server/browser/platform dependencies into them.

## `boundary-change-ownership`

**Coordinate shared edit points.**

**Apply:** features need many unrelated edits or contributors share hotspots.

**Problematic:** every feature edits a global domain model, registry, and common
test seed; separate worktrees still run against the same writable database.

**Prefer:** localize feature implementation, tests, and task logic. Record small
public contracts and coordinate shared contract edits, migration order, manifests,
lockfiles, and generated outputs. Give generated artifacts one source and a
reproducible generation command; regenerate affected outputs after integration.
Unique migration IDs help filenames, not incompatible concurrent schema changes.
See [runtime isolation](development-runtime.md#runtime-isolation).

On a shared branch/checkout, agree feature/file ownership and shared edits before
parallel work. Re-read shared files before editing; keep patches scoped and avoid
unrelated whole-file formatting. Coordinate staging/commits and schema/contract
integration; never discard another contributor's changes. Disjoint features can
still share registries, types, migrations, or generated artifacts. A shared checkout
has shared files/index; it can lose edits without a Git merge conflict.

**Exception:** route composition, lockfiles, and shared schema inherently need
coordination. Retain small explicit registries when they are clearer than dynamic
discovery. Do not spawn agents or create user tasks just because this rule applies.

**Verify:** identify shared edit points and affected consumers before parallel
work. Check integrated behavior and regenerated artifacts; do not claim a folder
move eliminates semantic conflicts. CODEOWNERS routes review, not import policing.

## `boundary-runtime-distribution`

**Separate build and runtime graphs.**

**Apply:** a product combines languages, embedded assets, or multiple build targets.

**Problematic:** a Go executable unexpectedly shells out to pnpm on startup;
testing the Vite server is treated as proof that the shipped embedded UI works.

**Prefer:** map build, development, and deployment dependencies separately. A
Go binary serving a React bundle can be one deployment even though its build
workspace contains several packages. Keep build-only tools out of runtime
composition. Define how assets/contracts reach the release artifact and what
direct native builds or installs promise. Retain genuine runtime dependencies,
such as Git for a live Git source, in documentation.

**Exception:** runtime plugins or external processes can be product requirements.
Committing built assets suits direct source installs; release-time generation
also works when the supported install path provides them. Neither is mandatory.

**Verify:** exercise the built artifact with its declared runtime prerequisites,
without relying on a dev server or build-tool installation. Check embedded assets,
API behavior, and supported native build/install paths. See
[generation checks](tooling-and-commands.md#tool-generated-artifacts) and
[CLI installation and releases](ci-releases.md).

## `boundary-transport-composition`

**Share operations across transports.**

**Apply:** REST, CLI, TUI, MCP, or another driver shares application behavior.

**Problematic:** MCP calls the local REST server to resolve a comment; CLI and
HTTP implement different normalization or permission rules for the same operation.

**Prefer:** compose a shared protocol-independent operation through each driver.
Keep request parsing, protocol errors, and presentation with the transport;
keep domain decisions, state ownership, and transaction semantics with the
application owner. Extract the proven shared operation when another consumer
needs it; it need not cover every endpoint.

**Exception:** a client of an independently deployed remote service legitimately
uses its network API. A single compact CRUD handler needs no speculative service
layer solely to prepare for a hypothetical second transport.

**Verify:** exercise equivalent operations through affected drivers, including
disabled capabilities, cancellation, not-found/conflict results, and persistence
failure. Confirm transports do not import one another to reuse local behavior.

## `organisation-ports-and-adapters`

**Isolate external technology.**

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
hierarchy or dependency-injection container is required. Apply the language's
contract representation: [Go interfaces](go.md#go-consumer-contracts) or
[TypeScript input contracts](typescript.md#js-input-contracts) when applicable.
Shared operation ownership follows
[transport composition](#boundary-transport-composition).

**Exception:** pure behavior or compact single-driver CRUD can use concrete
dependencies without introducing ports for every function. Extract a seam when
substitution, independent execution, or meaningful reuse needs it.

**Verify:** exercise the operation without starting a transport or live dependencies;
inspect imports and resource ownership. When multiple drivers exist, verify equivalent
invariants, denied actions, cancellation, and failures through the affected drivers.

## `organisation-tracer-slices`

**Build one working path.**

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

**Specify storage behavior.**

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

**Split by responsibility.**

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

A file split alone does not enforce dependency isolation. Use native package/module
visibility where required; follow [Go layout](go.md#module-and-package-layout),
[TypeScript modules](typescript.md#module-boundaries), or
[web file conventions](web-react-vite.md#framework-naming-and-layout) as applicable.
Coordinate shared edit points as in [change ownership](#boundary-change-ownership).

**Exception:** a small cohesive command, handler, component, or feature can stay
in one file. A legitimate framework layout can group files differently.

**Verify:** trace a representative edit and inspect the resulting import graph.
Explain each new file's responsibility; check affected behavior/public consumers.
Do not judge conformance by file counts, line limits, or abstraction counts.

## Sources

- [Go module layouts](https://go.dev/doc/modules/layout)
- [Go workspaces and dependency overrides](https://go.dev/ref/mod#workspaces)
- [Turborepo repository structure](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)
- [Node package entry points](https://nodejs.org/api/packages.html#package-entry-points)
- [ESLint import restrictions](https://eslint.org/docs/latest/rules/no-restricted-imports)
- [Nx boundary enforcement](https://nx.dev/docs/features/enforce-module-boundaries)
- [Redux feature organization](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
- [GitHub code ownership](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Git worktree files/index ownership](https://git-scm.com/docs/git-worktree)
- [Servediff shared review service](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/internal/reviewservice/service.go)
- [Tokeninsights native task adapter](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/package.json)
- [Tokeninsights development and distribution](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/development.md)
- [Cockburn: original ports and adapters](https://alistair.cockburn.us/hexagonal-architecture/)
- [Bogard: vertical slices and selective abstraction](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Hunt and Thomas: tracer bullets vs prototypes](https://www.artima.com/articles/tracer-bullets-and-prototypes)
- [Netflix: technology adapters and testing boundaries](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749)
- [Go module/command layouts](https://go.dev/doc/modules/layout)
- [Go transaction ownership](https://go.dev/doc/database/execute-transactions)
- [Redux feature locality; no Redux requirement implied](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
