---
name: repo-patterns
description: "Write, audit, and conform repositories with cohesive modules, explicit dependency and data ownership, independent fixture runs, consistent naming and tooling, safe schema evolution, and focused CLI, REST, MCP, and React/Vite organisation. Use only when the user explicitly invokes `repo-patterns` or `$repo-patterns`; do not auto-invoke from context."
---

# Repo Patterns

Manual invocation only: use this skill only when the user explicitly invokes
`repo-patterns` or `$repo-patterns`; do not auto-invoke from task context.

Apply to single applications, libraries, multiple executables, and monorepos.
Judge structure by whether parts can be understood, built, tested, run, and
changed through explicit contracts. Folder names alone do not establish boundaries.

## Uses

| Use | Action |
| --- | --- |
| Audit | Inspect requested scope; report supported findings and proposed changes. Default to read-only. |
| Write | Design and implement requested code using the patterns from the start. |
| Conform | Make requested boundary, runtime, tooling, or data changes incrementally; verify affected behavior. |

These are independent uses, not mandatory phases. A bare invocation defaults to
an audit. A writing/refactoring request authorizes that work; do not require a
separate audit or confirmation for routine scoped changes. User instructions
and consuming-repository policies take precedence.

Resolve tooling, command, and documentation choices separately: user instructions
and repo policy first, then established conventions evidenced by manifests,
lockfiles, scripts, CI, and docs. Apply skill fallbacks only to unresolved choices
within the requested scope. Missing written policy does not mean missing convention;
conflicting evidence does not establish absence.

## Before acting

1. Read applicable instructions, inspect Git state, and preserve unrelated work.
2. Identify scope and installed language/runtime/framework/tool versions. Inspect
   manifests, workspace/module membership, scripts, CI, tests, and migrations.
3. Distinguish entry points, language packages/modules, deployment units, domain
   owners, and independently released consumers. Do not classify by folder count.
4. Map public APIs, imports, runtime dependencies, configuration, data owners,
   fixture paths, lifecycle, and shared edit points. Separate development/build
   dependencies from the shipped runtime graph.
5. Inspect domain vocabulary, naming policy, existing lint rules, and representative
   peer modules. Distinguish language idioms from framework/protocol requirements
   and public or persisted names that consumers depend on.
6. Read relevant references below. Check version-sensitive commands/APIs against
   installed tools and primary documentation. Do not assume latest recipes apply.

Exclude dependencies, build output, vendored code, and generated implementation
from source audits unless requested. Inspect generation inputs and output drift
when those affect contracts or builds.

## Core policies

- Keep one clear owner for each capability, state store, contract, and resource
  lifecycle. Colocate independently changing features; keep entry points focused
  on composition. Use the smallest structure that establishes real boundaries.
- Distinguish multiple binaries from multiple modules. Favor one Go module for
  cohesive Go code; separate modules for justified dependency/release ownership.
  `apps/` and `packages/` is a useful workspace convention, not a universal tree.
- Define public surfaces and allowed dependency direction. Check relative imports,
  aliases, re-exports, and data access as well as manifest dependencies. Introduce
  minimal enforcement when requested conformance calls for it.
- Keep browser code free of server dependencies and secrets. Share appropriate
  wire contracts/clients, not private storage implementations. Multiple local
  transports reuse application operations rather than calling one another.
- Extract shared code for a cohesive capability and real consumers. Avoid giant
  `shared`, `utils`, or global model packages. Do not require a speculative
  interface, service layer, or mapper for every type.
- Use consistent domain terms and idiomatic names within each language. Follow
  explicit repo conventions, name observable behavior and units clearly, and
  preserve public/persisted naming contracts. Treat cosmetic differences as
  policy/readability findings unless demonstrated behavior or contracts break.
- Give each relevant server, CLI, worker, or app a documented independent run
  using controlled dependencies and fixture/scenario data. Independent execution
  may include a disposable database; it need not mean dependency-free execution.
- Select live/fixture dependencies at composition boundaries. Parse configuration
  once; preserve validation, authorization, domain behavior, and serialization.
  Resolve differing source support and policy into enforced capabilities where
  needed. Never silently switch to fixtures after a live dependency fails.
- Keep fixture inputs deterministic and mutable state isolated. Use real-engine
  integration evidence for database semantics and contract checks for mock drift.
- Own small synthetic datasets by feature/contract. Separate pure builders and
  named scenarios from persistence loaders, mock handlers, and runner setup.
  Tests arrange only needed state; explicit dev seeds/reset target owned disposable
  resources. Reuse data definitions where contracts match, never mutable instances.
- Reduce shared edit hotspots; coordinate contracts, migration order, lockfiles,
  and generated outputs. Isolate ports, databases, queues, and files between
  worktrees/runs. Do not promise conflict-free development.
- For new projects with an undecided stack, prefer Go or Node/TypeScript servers
  and Vite/React frontends. For unresolved tooling choices, use pnpm dependencies
  and root package scripts in JS/TS-only projects; use mise tools/runtime versions
  and root tasks in Go + JS/TS projects. Mixed repos still use pnpm for undecided
  JS dependency management and native Go modules. Retain supported existing stacks;
  migrate tooling/frameworks only when requested.
- Give commands consistent meanings and truthful applicability. Delegate to native
  language/package commands; avoid duplicated task logic and dummy capabilities.
  Where command conventions are undecided, provide root `dev` for a documented
  primary workflow and independently selectable parts. Where doc location is
  undecided, use brief `docs/development.md` instructions for one or more parts.
- Give generated artifacts one source and reproducible generation. Detect drift
  before overwriting comparison targets; verify the actual release artifact.
- Model invariants and compatibility explicitly. Keep API, domain, and storage
  representations separate where their contracts differ; reuse them where they
  match. Do not expose internal rows or accept server-owned fields by accident.
- Parameterize SQL, enforce persistent invariants, own transaction scope, and
  handle concurrency deliberately. Keep schema history reproducible and applied
  migrations immutable in shared environments.
- Evolve schemas/contracts with the actual deployment and consumer lifecycle.
  Consider expand/migrate/switch/contract when old and new versions coexist.
  Account for concurrent writes, locks, retries, recovery, and backfill completion.
  Distinguish preserved data from rebuildable projections and destructive resets.
  Commit ingestion checkpoints consistently with data; validate reuse evidence.
- Respect HTTP semantics and object/field authorization. Bound work and lists;
  define machine-readable errors, duplicate behavior, and compatibility. POST may
  legitimately be retry-safe; URI spelling alone does not establish REST quality.
- Preserve type evidence. In TypeScript, use no `any`, type assertions, or non-null
  assertions. Parse untrusted data at I/O boundaries and narrow nullable values.
- Verify observable behavior at the boundary that could expose the bug. Avoid
  tests that merely restate layout or implementation; do not suppress a correct
  failing regression test to claim conformance.

## Code organisation by application type

Use ports and adapters (hexagonal architecture) where transport or external
technology needs isolation. Keep feature slices cohesive and build a thin working
path end to end (tracer bullets) before widening it. These techniques do not require
a layer, interface, or file for every function. Split only for a clear responsibility,
independent verification, reuse, or change owner; keep small cohesive code together.

| Application | Organise and trace | Guidance |
| --- | --- | --- |
| CLI | Command parsing/presentation → operation → dependency adapter → output/exit | [CLI](references/code-organisation.md#organisation-cli) |
| REST endpoints | Route/request mapping → authorized operation → storage → response contract | [REST](references/code-organisation.md#organisation-rest) |
| MCP server | Tool/resource registration and schemas → shared operation → protocol result | [MCP](references/code-organisation.md#organisation-mcp) |
| React/Vite web app | App shell → feature UI/state → browser API adapter → public wire contract | [React/Vite](references/code-organisation.md#organisation-react-vite) |

Use narrow storage seams when substitution is required; keep schema changes
explicit and public contracts deliberate. Coordinate shared edit points when agents
work on one branch/checkout; feature boundaries reduce overlap but do not prevent
lost edits, incompatible schemas, or semantic conflicts. Read the shared rules in
[code organisation](references/code-organisation.md) alongside the relevant app type.

## Reference routing and rule index

Read only references relevant to the task. Rules include applicability,
problematic/preferred examples, exceptions, verification, and sources.

| Concern | Rules | Reference |
| --- | --- | --- |
| Repo shape, module APIs, reuse, runtime distribution, transports, ownership | `layout-topology`, `boundary-cohesion`, `boundary-public-api`, `boundary-reuse`, `boundary-browser-server`, `boundary-change-ownership`, `boundary-runtime-distribution`, `boundary-transport-composition` | [Boundaries and layout](references/boundaries-and-layout.md) |
| Ports/adapters, tracer slices, storage seams, file splits, CLI/REST/MCP/React organisation | `organisation-ports-and-adapters`, `organisation-tracer-slices`, `organisation-storage-seams`, `organisation-file-boundaries`, `organisation-cli`, `organisation-rest`, `organisation-mcp`, `organisation-react-vite` | [Code organisation by application type](references/code-organisation.md) |
| Vocabulary, identifiers, file/package names, units, compatible renames | `naming-local-conventions`, `naming-domain-vocabulary`, `naming-behavior`, `naming-shape-and-units`, `naming-discoverability`, `naming-compatible-change` | [Consistent naming](references/consistent-naming.md) |
| Dependency composition, config, fixtures, concurrency, capabilities | `runtime-composition`, `runtime-config`, `fixture-scenarios`, `fixture-fidelity`, `runtime-isolation`, `runtime-capabilities` | [Independent runs and fixtures](references/independent-runs-and-fixtures.md) |
| Test-data ownership, builders, fixtures, seeds, per-test setup, dev-server lifecycle | `fixture-data-ownership`, `fixture-builders`, `fixture-setup-lifecycle` | [Test data and setup](references/test-data-and-setup.md) |
| Tooling fallbacks, manifests, tasks, development docs, ordering/cache, artifact drift | `tool-stack-defaults`, `tool-dependency-ownership`, `tool-command-contract`, `tool-development-docs`, `tool-task-graph`, `tool-generated-artifacts` | [Tooling and commands](references/tooling-and-commands.md) |
| Go errors/lifecycle, Node async work, input parsing, web behavior | `go-consumer-contracts`, `go-error-resource-ownership`, `go-concurrency-lifecycle`, `js-input-contracts`, `node-async-lifecycle`, `web-state-boundaries` | [Go and Node correctness](references/go-and-node-correctness.md) |
| Models, representations, schema history, rollout, derived-state recovery | `model-invariants`, `model-representations`, `migration-history`, `migration-compatible-rollout`, `migration-operational-safety`, `model-derived-state` | [Data models and migrations](references/data-models-and-migrations.md) |
| SQL, constraints, transactions, query/pool behavior, events, ingestion | `db-values-and-constraints`, `db-transaction-concurrency`, `db-query-pool-budget`, `db-durable-effects`, `db-ingestion-continuity` | [Database access](references/database-access.md) |
| HTTP semantics, auth, errors, pagination, retries, contracts | `http-resource-semantics`, `http-authorization-errors`, `http-bounded-lists`, `http-mutation-recovery`, `http-contract-evolution` | [HTTP contracts](references/http-contracts.md) |
| Coverage, finding discipline, incremental fixes, evaluations | `audit-evidence`, `conform-small-slices`, `verify-boundary-behavior` | [Audit and conformance](references/audit-and-conformance.md) |

## Working method

### Audit

1. Inventory requested parts and inspect connected boundaries in manageable
   batches. For a full audit, cover all relevant batches; do not stop at a sample.
2. Trace suspected coupling, hidden dependencies, state sharing, contract drift,
   and correctness failures through owners and consumers before reporting them.
3. Keep source/config/shared state unchanged. Do not install tools, seed a shared
   DB, or start the whole product during a read-only audit. Use existing checks
   consistent with the request; report independent-run commands not executed.
4. Rank supported findings by consequences. Include minimal proposals, meaningful
   verification, inspected coverage, and unknowns. Say when no findings survive.

### Write

1. Identify owners, public contracts, dependency direction, and runtime lifecycle
   before choosing directories, packages, interfaces, or services.
2. Compose normal and controlled-development dependencies through the same
   application boundary. Document prerequisites, config, scenario, and cleanup.
3. Implement requested behavior with scoped models, data access, and transport
   contracts. Introduce tools/abstractions only where the requested work needs them.
4. Run appropriate checks and verify affected consumers and independent execution.

### Conform

1. Choose the smallest coherent slice that fixes the actual boundary or behavior.
   Do not bundle package splitting, renames, framework upgrades, and schema redesign
   solely to match a template.
2. Preserve supported behavior and contracts unless changing them is requested;
   correct demonstrated bugs deliberately. Preserve CLI exits, configuration,
   fixture semantics, resource cleanup, and shared migration history.
3. Add focused import/contract/generation checks where useful. Avoid installing a
   large build platform solely to enforce one import restriction.
4. Verify the slice and affected consumers. Report remaining proposals honestly.

## Finding discipline and output

Separate correctness defects, boundary problems, repo-policy differences, and
unverified hypotheses. Folder names, casing, line counts, ordinary React effects, a
supported alternative package manager, and a sequential SQL scan alone prove
nothing. Fallback preferences are not bugs.

For each finding give a rule ID, verified file/line or missing capability,
concrete evidence, impact, confidence, smallest fix, and validation scenario.
Mark unmeasured performance/collaboration concerns as hypotheses; do not invent
speedups or guaranteed reductions in conflicts.

Audit output: prioritized findings/proposals, coverage, checks run, and remaining
scope. Write/conform output: concise changes, rationale, checks/results, and
material limits. End any plan with concise unresolved questions, if any.

## Foundations and related scope

These are opinionated repo policies informed by official Go/Node/pnpm/mise docs,
ports and adapters, Postgres, HTTP/OpenAPI standards, and established testing and
migration practices. Preferred stack and task vocabulary are conditional fallbacks;
fixture obligations are skill policies. These are not claims of universal consensus.
Sources live in references.

Keep detailed React composition/state guidance in `react-patterns` and specialized
router/framework behavior in the applicable skills when invoked. Do not require
another skill's installation or automatically invoke manual-only companions.
Examples here are original; related open-source skills informed scope and format.
