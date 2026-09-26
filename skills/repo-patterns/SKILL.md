---
name: repo-patterns
description: "Write, audit, and conform repositories with cohesive modules, explicit dependency and data ownership, independent fixture runs, consistent tooling, safe schema evolution, and reliable Go, Node, React, database, and REST boundaries. Use only when the user explicitly invokes `repo-patterns` or `$repo-patterns`; do not auto-invoke from context."
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

## Before acting

1. Read applicable instructions, inspect Git state, and preserve unrelated work.
2. Identify scope and installed language/runtime/framework/tool versions. Inspect
   manifests, workspace/module membership, scripts, CI, tests, and migrations.
3. Distinguish entry points, language packages/modules, deployment units, domain
   owners, and independently released consumers. Do not classify by folder count.
4. Map public APIs, imports, runtime dependencies, configuration, data owners,
   fixture paths, lifecycle, and shared edit points.
5. Read relevant references below. Check version-sensitive commands/APIs against
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
  wire contracts/clients, not private storage implementations.
- Extract shared code for a cohesive capability and real consumers. Avoid giant
  `shared`, `utils`, or global model packages. Do not require a speculative
  interface, service layer, or mapper for every type.
- Give each relevant server, CLI, worker, or app a documented independent run
  using controlled dependencies and fixture/scenario data. Independent execution
  may include a disposable database; it need not mean dependency-free execution.
- Select live/fixture dependencies at composition boundaries. Parse configuration
  once; preserve validation, authorization, domain behavior, and serialization.
  Never silently switch to fixtures after a live dependency fails.
- Keep fixture inputs deterministic and mutable state isolated. Use real-engine
  integration evidence for database semantics and contract checks for mock drift.
- Reduce shared edit hotspots; coordinate contracts, migration order, lockfiles,
  and generated outputs. Isolate ports, databases, queues, and files between
  worktrees/runs. Do not promise conflict-free development.
- For new projects, prefer Go or Node/TypeScript servers, Vite/React frontends,
  pnpm for JS dependencies/scripts, and mise for tools/runtime versions and
  cross-language dispatch. These are defaults. Retain supported existing stacks;
  migrate tooling/frameworks only when requested.
- Give commands consistent meanings and truthful applicability. Delegate to native
  language/package commands; avoid duplicated task logic and dummy capabilities.
- Model invariants and compatibility explicitly. Keep API, domain, and storage
  representations separate where their contracts differ; reuse them where they
  match. Do not expose internal rows or accept server-owned fields by accident.
- Parameterize SQL, enforce persistent invariants, own transaction scope, and
  handle concurrency deliberately. Keep schema history reproducible and applied
  migrations immutable in shared environments.
- Evolve schemas/contracts with the actual deployment and consumer lifecycle.
  Consider expand/migrate/switch/contract when old and new versions coexist.
  Account for concurrent writes, locks, retries, recovery, and backfill completion.
- Respect HTTP semantics and object/field authorization. Bound work and lists;
  define machine-readable errors, duplicate behavior, and compatibility. POST may
  legitimately be retry-safe; URI spelling alone does not establish REST quality.
- Preserve type evidence. In TypeScript, use no `any`, type assertions, or non-null
  assertions. Parse untrusted data at I/O boundaries and narrow nullable values.
- Verify observable behavior at the boundary that could expose the bug. Avoid
  tests that merely restate layout or implementation; do not suppress a correct
  failing regression test to claim conformance.

## Reference routing and rule index

Read only references relevant to the task. Rules include applicability,
problematic/preferred examples, exceptions, verification, and sources.

| Concern | Rules | Reference |
| --- | --- | --- |
| Repo shape, module APIs, reuse, browser/server, change ownership | `layout-topology`, `boundary-cohesion`, `boundary-public-api`, `boundary-reuse`, `boundary-browser-server`, `boundary-change-ownership` | [Boundaries and layout](references/boundaries-and-layout.md) |
| Dependency composition, config, fixture fidelity, concurrent runs | `runtime-composition`, `runtime-config`, `fixture-scenarios`, `fixture-fidelity`, `runtime-isolation` | [Independent runs and fixtures](references/independent-runs-and-fixtures.md) |
| Stack preferences, manifests, task semantics, ordering/cache | `tool-stack-defaults`, `tool-dependency-ownership`, `tool-command-contract`, `tool-task-graph` | [Tooling and commands](references/tooling-and-commands.md) |
| Go errors/lifecycle, Node async work, input parsing, web behavior | `go-consumer-contracts`, `go-error-resource-ownership`, `go-concurrency-lifecycle`, `js-input-contracts`, `node-async-lifecycle`, `web-state-boundaries` | [Go and Node correctness](references/go-and-node-correctness.md) |
| Models, representations, schema history, rollout/backfills | `model-invariants`, `model-representations`, `migration-history`, `migration-compatible-rollout`, `migration-operational-safety` | [Data models and migrations](references/data-models-and-migrations.md) |
| SQL, constraints, transactions, query/pool behavior, events | `db-values-and-constraints`, `db-transaction-concurrency`, `db-query-pool-budget`, `db-durable-effects` | [Database access](references/database-access.md) |
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
unverified hypotheses. Folder names, line counts, ordinary React effects, a
supported alternative package manager, and a sequential SQL scan alone prove
nothing. Soft defaults are not bugs.

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
migration practices. Preferred stack, task vocabulary, and fixture obligations
are skill defaults, not claims of universal consensus. Sources live in references.

Keep detailed React composition/state guidance in `react-patterns` and specialized
router/framework behavior in the applicable skills when invoked. Do not require
another skill's installation or automatically invoke manual-only companions.
Examples here are original; related open-source skills informed scope and format.
