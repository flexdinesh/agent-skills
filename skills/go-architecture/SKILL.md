---
name: go-architecture
description: "Audit, design, and refactor Go projects around cohesive packages, explicit composition and mode policies, semantic contracts, durable state, and boundary tests. Use only when explicitly invoked as go-architecture or $go-architecture; do not auto-invoke from context."
---

# Go Architecture Patterns

Organize around behavior, ownership, and observable contracts. Use the smallest
structure that makes those properties clear. These are decision rules, not a
mandatory directory tree or framework.

## Scope and workflow

Manual invocation only. A bare invocation requests a read-only architecture
review and proposal. An explicit implementation request authorizes its scoped
changes. Follow user instructions and repository rules first.

1. Read repository instructions, design decisions, Git state, and supported
   product/deployment contracts. Establish compatibility requirements from evidence;
   do not assume either permanent compatibility or permission to break it.
2. Trace representative operations from entry point through policy, behavior,
   storage, and result. Include one failure/retry path and shutdown where relevant.
3. Map package dependencies, resource owners, transaction boundaries, modes,
   external contracts, and existing semantic tests. Inspect transitive dependencies.
4. Identify concrete violations or maintenance costs. Cite code and consequences;
   a different naming convention or layout alone is not a defect.
5. Propose small, coherent changes with the contract to preserve or deliberately
   change, deletion scope, verification, and rollout needs where applicable.
6. When implementing, complete one vertical slice, update affected docs/generated
   contracts, and run repository-required checks. Report verification limits.

For reviews, distinguish observed defects, useful simplifications, and optional
future work. Mark sampled or unverified areas; do not imply exhaustive coverage.
End plans with unresolved questions, or “Unresolved questions: none.”

## 1. Cohesive packages own behavior

Give each capability a clear owner. Keep its state transitions, validation, and
invariants together. A package containing only exported structs is not meaningful
encapsulation if callers must coordinate its rules themselves.

- Prefer domain/capability names to catch-all `utils`, `common`, or `helpers`.
- Keep implementation details unexported. Use `internal` for application-private
  packages; keep the exported surface small and purposeful.
- Separate packages when ownership, dependency direction, lifecycle, or a real
  consumer requires it. Do not create a package or interface for every type.
- Do not confuse Go packages with Go modules. Separate modules need an actual
  dependency, distribution, or release reason.

Avoid replacing one large package with many packages that still require intimate
knowledge of each other's internals.

## 2. Composition owns wiring and mode policy

Resolve configuration and choose the supported mode at the entry point or a
dedicated composition package. Construct explicit collaborators there. Core
behavior should not discover global config, open arbitrary resources, or select
its own transport.

For applications with local and server modes:

- Compose the same semantic operations with direct or remote adapters.
- Make a mode matrix: capabilities, permissions, resources, background work,
  listeners, and lifecycle owner. Test allowed and forbidden combinations.
- Keep mode switches out of processing/storage logic when dependency selection
  expresses the difference. Explicit domain policy remains legitimate.
- Resolve and validate conflicting configuration before side effects. Test real
  flag/environment/file precedence, not only a mode enum.
- A failed remote request must not silently change destination or mode. Any
  fallback needs an explicit product contract and visible behavior.

Single-process execution need not call itself over HTTP. Direct and HTTP paths
can share behavior without sharing process topology. Do not introduce a second
mode, DI framework, or general policy engine for hypothetical needs.

## 3. Dependencies point toward stable behavior

Domain decisions should not depend on HTTP routing, CLI rendering, database
drivers, or process startup. Transport adapters translate protocols; storage
encapsulates persistence; composition connects them.

An illustrative shape, not a required layout:

```text
cmd -> composition -> use cases / domain behavior
                  -> HTTP or direct adapters
                  -> storage and runtime resources

adapters and storage satisfy the contracts needed by their consumers
```

Keep pure computation pure where useful. Supply clocks, identity, or I/O through
explicit inputs/collaborators when their variability matters. Avoid extracting
interfaces merely to wrap every standard-library call.

Check transitive imports: a small progress or logging helper can accidentally pull
capture, storage, or server ownership into the wrong layer. Automate important
dependency prohibitions; tests must fail if their expected root package disappears.

## 4. DRY applies to decisions and invariants

Share rules that must evolve together: validation, accounting, identity, atomic
operations, and semantic response construction. Similar syntax alone is weak
evidence for an abstraction.

Keep separate concepts separate even when their current implementations resemble
each other. Parsing a source, interpreting its meaning, persisting facts, and
formatting a response have different responsibilities.

Prefer a little duplication over a shared abstraction with unrelated flags,
cross-layer dependencies, or coupled lifetimes. A second real consumer is useful
evidence for extraction, not a prerequisite for every justified boundary.

## 5. Contracts describe operations and guarantees

Define small interfaces at the consuming boundary when substitution or dependency
inversion is useful. Prefer semantic operations such as `Accept`, `ProcessNext`,
or `Dashboard` to generic CRUD repositories that force callers to reconstruct
invariants. Concrete types are appropriate when interchangeability adds no value.

For each significant contract, specify:

- Valid inputs and identity/scope binding.
- Results, error meaning, and observable side effects.
- Atomicity, idempotency, ordering, and visibility guarantees.
- Cancellation, resource ownership, and retry responsibility.

Types establish shape; tests establish semantics. Keep transport DTOs, domain
values, and persistence representations distinct where their meanings differ.
Do not create three mechanically identical models without a reason.

Direct and remote adapters should agree on domain outcomes and errors. Test the
same scenarios against both; allow intentional differences such as pagination,
latency, and network failures. Direct adapters should not require a synthetic
HTTP application just to access shared behavior.

## 6. Ownership includes transactions and lifetime

The layer owning an invariant owns its atomic operation. Storage executes local
transactions; orchestration coordinates operations without pretending independent
databases or remote calls share a transaction.

Give each database handle, listener, worker group, queue, and lock an explicit
owner. Document who starts, cancels, joins, and closes it. Pass request contexts
through work; distinguish a caller stopping its wait from cancelling accepted
durable work.

Stop admission and cancel/drain according to the contract; join workers before
closing their resources. Bound concurrency, queues, and retry budgets where work
can accumulate. Avoid unowned goroutines and independent retries at every layer.

## 7. Durable workflows expose their milestones

When work is asynchronous, distinguish acceptance, processing completion, and
query visibility. A successful enqueue or receipt must not imply published results.

Where retries/replay exist, define stable operation identity, duplicate behavior,
conflict handling, and acknowledgment rules. Persist the retry material needed by
the protocol; if byte identity is contractual, retries must preserve exact bytes.
Commit related progress and effects atomically, or use an explicit recoverable
state machine. Do not promise cross-system exactly-once execution casually.

For systems derived from captured evidence, consider immutable evidence and
replaceable projections. Preserve provenance and domain identity; publish rebuilt
generations atomically when partial results would violate the read contract.
This is conditional guidance, not a requirement to adopt event sourcing everywhere.

## 8. Capabilities, authorization, and data scope differ

Capabilities describe available operations. Permissions authorize a caller.
Tenant/dataset scope determines which data that caller may access. One does not
substitute for another; UI visibility is not authorization.

Resolve authenticated scope at a trusted boundary and carry it through storage,
receipts, caches, jobs, and queries. Client-selected identifiers must not bypass
that scope. Bind paginated/snapshot reads to the relevant identity and revision
when consistency across requests is promised.

For sensitive ingestion, define allowed data at extraction. Verify privacy through
transport, persistence, diagnostics, and logs where relevant; redaction in a single
adapter is insufficient evidence for the whole path.

## 9. Persisted and public contracts evolve deliberately

Schema, API, CLI, and generated-client changes move with their consumers, docs,
and tests. Establish supported versions and rejection behavior explicitly.

For applications opening existing local stores, validate role and required
structure before mutation where feasible. A version marker alone does not prove
constraints, columns, or views are intact. Check the actual store; caching an
expected contract is different from caching validation of mutable files.

With explicit authorization to drop compatibility, remove obsolete paths together:
implementation, routes, flags, schemas, adapters, fixtures, tests, and documentation.
Do not keep a second production pipeline solely to satisfy historical fixtures.
Preserve valuable semantic oracles by moving them to the supported path.

Permission to remove compatibility code does not authorize deleting user data.
Products with deployed users may require migrations and staged rollout; this
skill does not prescribe either permanent backward compatibility or its removal.

## 10. Test boundaries without abandoning precise unit tests

Favor tests that establish observable contracts and explain meaningful failures.

| Concern | Useful verification |
| --- | --- |
| Pure rules | Focused tests for arithmetic, parsing, identity, time, state transitions |
| Adapter equivalence | Shared domain scenarios against direct and HTTP adapters |
| Persistence | Real-store rollback, constraints, duplicate/conflict behavior, restart |
| Composition | Configuration precedence, mode capabilities, resource ownership, shutdown |
| Isolation | Cross-tenant denial, scoped receipts/jobs/queries, snapshot consistency |
| Durable work | Retry, interruption, replay, acknowledgment and visibility milestones |
| Dependency direction | Targeted transitive import guards |
| Distribution | Built executable in its supported runtime environment |

Use mocks/fakes for useful controlled failures and unavailable boundaries, not to
prove database atomicity or merely assert internal call order. Keep fixtures on the
current production path. Remove obsolete and redundant tests, not tests exposing
correctness bugs. Integration tests complement focused unit tests; replacing all
unit tests makes failures slower and harder to locate.

## 11. Documentation and measurement constrain future work

Keep a short design map of ownership, dependency direction, modes, and contracts.
Record consequential tradeoffs in ADRs; update or supersede stale decisions.
Turn critical enforceable rules into checks rather than relying on prose alone.

Separate build-time dependencies from production requirements. If the product
promises a standalone Go executable, verify the built binary in that environment,
including embedded assets and any actual native dependencies.

Before performance-driven restructuring, measure representative workloads and
attribute costs to stages. Distinguish cold/warm behavior, Go allocations, total
process memory, and correctness. Label synthetic baselines; do not claim an
improvement without a comparable before/after measurement.

## Review output

Lead with the most consequential findings. For each proposed change, give the
current evidence, affected invariant/owner, smallest coherent action, and the test
or measurement that establishes success. Include what can be deleted and which
decisions deserve documentation. Recommend leaving sound boundaries alone.

Do not mandate microservices, a fixed number of layers, generic repositories,
interfaces for every implementation, event sourcing, or a fashionable directory
tree. Architecture earns its complexity through real behavior and consumers.
