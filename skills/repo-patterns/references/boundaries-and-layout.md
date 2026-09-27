# Boundaries and layout

Read when choosing repo topology, dividing responsibilities, exposing packages,
sharing code, or reducing coordinated edits.

## `layout-topology`

**Apply:** new layout or proposed restructure of an existing repository.

**Problematic:** a Go API, worker, and CLI acquire separate modules solely because
they have three `main` functions; a small frontend gains a workspace and layers
without independent package consumers.

**Prefer:** inventory entry points, packages/modules, deployments, releases, and
domain owners separately. A small Go library/command can live at the module root.
A larger cohesive Go product can use one module with `cmd/api`, `cmd/worker`, and
`cmd/tool`, plus bounded `internal` packages. Keep a single Vite application's
normal root configuration and `src/` when that serves it.

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

Choose the Go module roots separately. A multi-module workspace can help local
development, but independently distributed modules must work with declared
dependencies and workspace overrides disabled. Decide whether committing
`go.work` suits the release model; do not require or forbid it universally.

**Exception:** genuine independent releases, dependency requirements, or deployments
can justify separate units. Existing framework layouts take precedence over a
cosmetic tree preference. Multiple projects already form a multi-project repo;
arguing whether to call it a monorepo adds no boundary.

**Verify:** build/test each meaningful target; for distributed Go modules also
check `GOWORK=off` in the appropriate module directory. Check actual dependency
resolution and release/install paths, not merely the directory tree.

## `boundary-cohesion`

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

**Apply:** consumers depend on another owner's implementation or imports violate
the intended dependency graph.

**Problematic:** web imports `../../api/src/store`; shared code imports an app;
a public barrel re-exports private persistence helpers.

**Prefer:** declare small public entry points and allowed dependencies. Use JS
package `exports` and declared workspace dependencies; check aliases, relative
paths, re-exports, cycles, and build config. Use appropriately nested Go `internal/`
packages. A root `internal/` restricts outside imports but does not isolate sibling
domains. Add focused import checks or use existing Nx boundary constraints where
conformance requires enforcement.

**Exception:** related binaries can share implementation through a common owner.
Some feature boundaries remain inside one package; use conventions/checks suited
to the size rather than splitting every feature into a published package.

**Verify:** public consumers build without private paths. Check the resolved import
graph and a known forbidden import against the guardrail. Node exports are not a
security sandbox; absolute filesystem access can bypass them.

## `boundary-reuse`

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

## `boundary-browser-server`

**Apply:** web code consumes shared packages, generated clients, or config.

**Problematic:** a browser imports a server barrel that initializes a DB client;
an API secret appears in a `VITE_` variable or public runtime config.

**Prefer:** separate browser-safe entry points from server implementations and
credentials. Share transport contracts or generated clients. Keep server config
private, parse it at startup, and expose only intentional public settings. Follow
installed framework server/client and bundling rules.

**Exception:** isomorphic pure code is valid when dependencies and behavior work
in both environments. Type-only imports do not automatically make runtime exports
or the rest of a package safe.

**Verify:** build the actual browser target and inspect dependency/bundle inputs
for server-only modules and secrets. Do not print secret values as audit evidence.

## `boundary-change-ownership`

**Apply:** features need many unrelated edits or contributors share hotspots.

**Problematic:** every feature edits a global domain model, registry, and common
test seed; separate worktrees still run against the same writable database.

**Prefer:** localize feature implementation, tests, and task logic. Record small
public contracts and coordinate shared contract edits, migration order, manifests,
lockfiles, and generated outputs. Give generated artifacts one source and a
reproducible generation command; regenerate affected outputs after integration.
Unique migration IDs help filenames, not incompatible concurrent schema changes.
See [runtime isolation](independent-runs-and-fixtures.md#runtime-isolation).

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
[CLI installation and releases](cli-development-and-releases.md).

## `boundary-transport-composition`

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

## Sources

- [Go module layouts](https://go.dev/doc/modules/layout)
- [Go workspaces and dependency overrides](https://go.dev/ref/mod#workspaces)
- [Turborepo repository structure](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)
- [Node package entry points](https://nodejs.org/api/packages.html#package-entry-points)
- [ESLint import restrictions](https://eslint.org/docs/latest/rules/no-restricted-imports)
- [Nx boundary enforcement](https://nx.dev/docs/features/enforce-module-boundaries)
- [Redux feature organization](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
- [Vite environment handling](https://vite.dev/guide/env-and-mode)
- [GitHub code ownership](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Git worktree files/index ownership](https://git-scm.com/docs/git-worktree)
- [Servediff shared review service](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/internal/reviewservice/service.go)
- [Tokeninsights native task adapter](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/cli/package.json)
- [Tokeninsights development and distribution](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/development.md)

Feature locality, workspace names, and collaboration policies are skill choices;
the sources do not prescribe one universal tree.
