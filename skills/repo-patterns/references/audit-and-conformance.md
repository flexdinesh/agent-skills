# Audit and conformance

**Read when:** auditing a repository or making a conformance finding; use the verification matrix for broader changes.

**Policy status:** Evidence, coverage, and minimal-change policies. Skill-maintenance evaluations are separate from repository work.

## `audit-evidence`

**Report supported findings.**

**Apply:** every audit and conformance finding.

**Problematic:** directory naming is a high-severity finding; a sampled package
is described as whole-repo conformance; an unrun fixture command is reported passing.

**Prefer:** record requested coverage and inspect owners/consumers in connected
batches. Exclude generated/vendor/dependency implementation unless requested;
inspect relevant generation inputs. Map the actual graph before judging layout:

| Part | Capture |
| --- | --- |
| Code | Entry points, modules/packages, public APIs, allowed imports, vocabulary and naming conventions |
| Runtime | Config, dependencies, composition, readiness, shutdown |
| Data | Owners, atomic operations, access scopes, migration streams |
| Development | Fixtures, prerequisites, target commands, mutable state isolation |
| Change | Consumers, shared registries/manifests/contracts/generated outputs |

Trace candidates to concrete evidence and separate:

- **Defect:** demonstrated broken/unsafe behavior or contract violation.
- **Boundary issue:** supported hidden dependency, leaked implementation, shared
  mutable state, or missing independent execution capability.
- **Policy difference:** a preferred stack, layout, naming, or task convention differs.
- **Hypothesis:** performance/conflict concern needing measurement or confirmation.

For each finding include rule ID, verified file/line or missing capability,
evidence, impact, confidence, minimal proposal, and a meaningful validation case.
Severity follows consequences. Soft preferences alone are not defects.

Example: `runtime-composition`, CLI module initialization opens the configured
live store before flags are parsed, preventing its documented fixture invocation.
Propose construction after config and pass the store to execution. Verify import
without live access, fixture success, failure exit, and cleanup. Report exact
source evidence when auditing a real repo; this example is not an actual finding.

**Exception:** an architecture proposal may address a newly required capability
before a bug exists. Label it as a proposal with tradeoffs, not invented breakage.

**Verify:** every reported finding survives cross-file inspection. State inspected
coverage, unknowns, checks actually run, and whether remaining scope exists. If no
findings survive, say so; do not pad with nits or invented speedups.

## `conform-small-slices`

**Change one coherent slice.**

**Apply:** authorized writing/refactoring to adopt these patterns.

**Problematic:** fixing a hidden DB dependency also changes frameworks, renames
all directories, splits modules, and rewrites schema history without need.

**Prefer:** choose one coherent boundary/behavior and its affected consumers.
Move ownership, not merely code. Preserve supported behavior/contracts except
explicit changes and deliberately corrected bugs. Introduce the minimal relevant
guardrail, document the normal/fixture run, and verify the slice before expanding.
Coordinate shared contract, migration, manifest, and generated-output changes.

Routine implementation follows the user's existing authorization; do not invent
mandatory audit/approval stages. An audit remains read-only; do not install tools
or mutate shared data to produce its findings. Broader stack migrations need a
request that actually includes them. Preserve unrelated changes throughout.

**Exception:** a genuinely cross-cutting contract can require coordinated edits.
Explain why the scope is necessary and stage changes compatibly where needed;
do not split an atomic repair into unsafe intermediate states just to be small.

**Verify:** affected public callers, config precedence, CLI exits, error behavior,
resource lifecycle, fixture runs, and migration compatibility. Reinspect import
direction and generated inputs after moving code.

## `verify-boundary-behavior`

**Verify observable behavior.**

**Apply:** validation of changed code, imports, tasks, config, or schema.

**Problematic:** tests assert a directory tree, mock call order, or coverage target
while missing permission, SQL, shutdown, or duplicate-operation behavior.

**Prefer:** use installed finite checks and behavior at the boundary that could
expose the risk. Add tests for actual regression/correctness risk, not every
reversible low-impact change. Keep a semantically correct failing test when it
exposes a bug; report the failure rather than weakening the expected behavior.

| Change | Useful verification |
| --- | --- |
| Public import/package surface | Affected consumer typecheck/build; forbidden-import guardrail |
| Pure domain behavior | Fast tests for meaningful transitions/outcomes |
| Config/CLI | Precedence, bad input, streams, exit status, interruption |
| Runtime/fixtures | Documented independent start, representative operation, readiness, cleanup |
| Database | Real-engine constraints, transaction failure/concurrency, migration create/upgrade |
| HTTP contract | Handler/provider/client behavior, denied paths, retries, pagination |
| Browser ownership | User interactions, stale results, retry, edits/navigation; build/SSR as relevant |
| Shared tooling/generation | Affected targets, deterministic generation, version/CI agreement |
| Docker images/Compose | Final target from declared inputs, runtime permissions/assets/probes, graceful stop, isolated state, source/digest identity |
| CLI distribution/releases | Native run/typecheck, installed artifact, version/tag/metadata, controlled partial-publication recovery |

Temporary/disposable verification resources still need isolated setup and cleanup.
Inspect commands before running them: formatting, seeding, migrations, installs,
and `EXPLAIN ANALYZE` can mutate state. Within authorized verification, use bounded
isolated resources; do not treat a read-only audit as permission to reset shared DBs.

**Exception:** unavailable services/platforms may limit execution. Report exact
prerequisites and unverified behavior rather than claiming success from static checks.

**Verify:** record command/result and what it establishes. Once relevant checks
pass, broaden only for new changes/failures/concerns. Say if full-repo checks were
not run; distinguish pre-existing failures from new failures with evidence.

## Sources

- [Component/contract testing strategies](https://martinfowler.com/articles/microservice-testing/)
- [Go HTTP test boundary](https://pkg.go.dev/net/http/httptest)
- [Testing Library observable behavior](https://testing-library.com/docs/guiding-principles/)
