---
name: repo-patterns
description: "Audit, write, and conform repository architecture, language/runtime boundaries, application contracts, development tooling, test setup, and CLI releases. Use only when the user explicitly invokes repo-patterns or $repo-patterns; do not auto-invoke from context."
---

# Repo Patterns

Apply to applications, libraries, multiple executables, and monorepos. Judge
structure by explicit ownership, contracts, and independently verifiable behavior.

## Select the work

Manual invocation only. A bare invocation means a read-only audit. A request to
write or refactor authorizes that scoped work without a separate audit or approval.

| Mode | Method |
| --- | --- |
| Audit | Trace evidence across owners and consumers; report findings and coverage. |
| Write | Establish owners and contracts; implement one working path, then widen it. |
| Conform | Fix the smallest coherent slice; preserve supported behavior and consumers. |

Follow user instructions and consuming-repository policy first, then established
conventions evidenced by manifests, lockfiles, scripts, CI, docs, and peer code.
Apply a fallback only to an unresolved choice within scope. Missing prose or
conflicting evidence does not establish an undecided choice.

References distinguish standards/runtime requirements, scoped skill policies,
conditional defaults, and illustrative examples. A preferred tool or layout alone
is not grounds for a defect finding or migration.

## Keep these principles

- Give each capability, state store, contract, and resource lifecycle a clear owner.
- Keep public surfaces and dependency direction explicit; share cohesive capabilities
  for real consumers. Split only for an actual responsibility or verification need.
- Preserve public/persisted contracts and authorization across transports and fixtures.
- Give relevant executables controlled independent runs; isolate mutable state.
  Never silently substitute fixtures after a live dependency fails.
- Coordinate shared contracts, migrations, lockfiles, and generated outputs.
  Preserve unrelated work; separate checkouts alone do not isolate runtime state.
- Verify observable behavior at the affected boundary. Report unverified behavior
  and correct failing regression tests honestly.

## Inspect and route

1. Read applicable instructions and Git state. Identify the requested scope,
   affected consumers, installed versions, and established conventions.
2. Inspect relevant entry points, manifests, imports, config, tests, and data owners.
   Distinguish packages/modules, deployments, releases, and build/runtime dependencies.
   Exclude generated/vendor/dependency implementation unless requested; inspect
   generation inputs when they affect the work.
3. Select references below from the task and affected language/runtime. Read them
   before making decisions. Add a reference when tracing reveals another affected
   contract; repository-wide technology presence alone does not require loading it.
4. Use a reference's applicability, exceptions, and verification together. Related
   links are conditional, not a recursive reading list. Check version-sensitive APIs
   against installed tools/bundled documentation, then primary documentation.

For a full audit, maintain a coverage checklist and inspect every applicable category
in connected batches. Mark completed, inapplicable, and unverified scope; a sample
does not establish whole-repository conformance. For a focused change, inspect only
its relevant owners and consumers.

## Reference catalog

| Group | Read when the task involves | Reference |
| --- | --- | --- |
| Architecture | Topology, ownership, imports, shared operations, storage seams, build/runtime separation | [Architecture](references/architecture.md) |
| Naming | Identifiers, domain vocabulary, units, compatible renames | [Naming](references/naming.md) |
| Language | Go code, modules, interfaces, errors, concurrency | [Go](references/go.md) |
| Language | TypeScript contracts or JS/TS untrusted input | [TypeScript/input contracts](references/typescript.md) |
| Runtime | Node async work, shutdown, native TS CLI execution | [Node](references/node.md) |
| Application | CLI setup, args, streams, exits, product ownership | [CLI](references/cli.md) |
| Application | HTTP endpoints/clients, REST layout, auth, errors, pagination, retries | [HTTP/REST](references/http-rest.md) |
| Application | MCP registration, schemas, tools/resources/prompts, transports | [MCP](references/mcp.md) |
| Application | Browser/server separation, React/Vite layout, API/state integration | [Web](references/web-react-vite.md) |
| Data | Invariants, wire/storage representations, schema history, rollout | [Models/migrations](references/data-models-and-migrations.md) |
| Data | SQL, transactions, query/pool budgets, durable effects | [Database access](references/database-access.md) |
| Data | Imports, checkpoints, source reuse, normalization, rebuilds | [Ingestion](references/ingestion.md) |
| Development | Composition, config, independent runs, capabilities, isolation | [Runtime setup](references/development-runtime.md) |
| Testing | Builders, scenarios, seeds, mocks, fidelity, test setup/teardown | [Test data/setup](references/test-data-and-setup.md) |
| Testing | Disposable real services through Testcontainers, Compose, or CI containers | [Containers](references/containers.md) |
| Tooling | Unresolved stack/tool choices, manifests, commands, task graphs, generation | [Tooling/commands](references/tooling-and-commands.md) |
| Tooling | Established or selected pnpm workspace dependencies and task dispatch | [pnpm](references/pnpm.md) |
| Tooling | Established or selected mise tool pins and task dispatch | [mise](references/mise.md) |
| Docs | Development instructions or install/release/recovery guides | [Documentation](references/documentation.md) |
| Distribution | Go archives, module tags, supported source installs | [Go distribution](references/go-cli-distribution.md) |
| Distribution | Node CLI packaging, npm manifests, isolated installation | [Node distribution](references/node-cli-distribution.md) |
| Releases | Manual stable CI, version plans, artifact checks, publication recovery | [CI releases](references/ci-releases.md) |
| Releases | Go automatic dev builds, stable/dev channels, publication ordering | [Go CI channels](references/go-ci-releases.md) |
| Workflow | Audits, conformance findings, broader verification selection | [Audit/conformance](references/audit-and-conformance.md) |

Example: Go MCP work uses Go and MCP guidance. Add architecture for shared
operations, database guidance for persistent work, and fixture guidance for changed
setup. A docs-only command correction uses documentation and the affected command
reference. Other languages retain their native conventions; use applicable shared
references and primary documentation without imposing Go/Node recipes.

## Verify and report

Run appropriate finite checks and inspect affected consumers. Verify changed
independent runs and release artifacts when relevant. During read-only audits,
keep source/config/shared state unchanged; do not install tools, seed a shared DB,
or start the whole product. Inspect commands for side effects before running them.

For findings, give rule ID, verified location or missing capability, evidence,
impact, confidence, smallest fix, and validation scenario. Separate defects,
boundary issues, policy differences, and hypotheses; rank by demonstrated consequences.
Do not invent performance gains or guaranteed conflict reduction.

Audit output: prioritized findings/proposals, coverage, checks run, and remaining
scope; say when no findings survive. Write/conform output: concise changes,
rationale, checks/results, and material limits. End plans with unresolved questions,
if any.

Detailed React composition and framework behavior stay in companion skills when
invoked. Do not automatically invoke manual-only companions or require installation.
