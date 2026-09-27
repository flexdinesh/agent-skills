# Audit and conformance

Read when inspecting a repository, proposing fixes, implementing conformance,
or evaluating whether this skill improves agent decisions.

## `audit-evidence`

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

Temporary/disposable verification resources still need isolated setup and cleanup.
Inspect commands before running them: formatting, seeding, migrations, installs,
and `EXPLAIN ANALYZE` can mutate state. Within authorized verification, use bounded
isolated resources; do not treat a read-only audit as permission to reset shared DBs.

**Exception:** unavailable services/platforms may limit execution. Report exact
prerequisites and unverified behavior rather than claiming success from static checks.

**Verify:** record command/result and what it establishes. Once relevant checks
pass, broaden only for new changes/failures/concerns. Say if full-repo checks were
not run; distinguish pre-existing failures from new failures with evidence.

## Skill evaluation cases

These are evaluation prompts/criteria, not claims of a completed agent benchmark.
Use representative small repos, compare with/without the skill, and inspect
evidence accuracy and restraint as well as detected problems.

| Scenario | Expected decision | Failure to catch |
| --- | --- | --- |
| Small Go CLI, pure/file behavior | Keep ordinary simple layout and sample-file run | Unused layers/workspace scaffolding |
| Go API/worker/CLI in one module | Separate composition/lifecycle where needed | Automatic module split from binary count |
| Web imports sibling server source | Trace leak and propose public API/import rule | Cosmetic move or unsafe browser dependency |
| CLI opens live DB on import | Move setup to entry point and verify fixture path | Fake flag parsed after live connection |
| Map fake only tests Postgres constraints | Keep fast tests, add relevant real-engine evidence | Claiming fake success proves SQL semantics |
| Two worktrees share fixture DB/port | Propose namespaced mutable state and endpoints | Assuming Git isolation implies runtime isolation |
| Column replacement during rolling deploy | Handle old writes, resumable backfill, completion | Copying data without concurrent-write protection |
| Retry-safe POST with durable idempotency | Accept method; verify actual duplicate semantics | Blanket POST/idempotency violation |
| Supported nonpreferred stack | Label preference only; retain stack | Unrequested pnpm/framework migration |
| New JS/TS-only app with undecided tooling | Use pnpm and root `dev` scripts | Automatic mise requirement |
| New Go + JS/TS app with undecided tooling | Use mise root tasks, pnpm JS dependencies, native Go modules | Treating mise as a JS package manager |
| Existing npm/Task workflow without written policy | Preserve evidenced tooling and command conventions | Treating missing prose as permission to migrate |
| Manifests, CI, and docs disagree on tooling | Establish intended policy; report concrete drift | Treating conflicting evidence as an undecided choice |
| Established package manager, undecided doc location | Retain manager; use brief `docs/development.md` | Applying or withholding every fallback as one bundle |
| Existing canonical development guide elsewhere | Update it and preserve established command names | Duplicate guide or cosmetic task renames |
| Root `dev` combines related API/web; worker is optional | Document primary set plus independent/selected runs | Rejecting useful combinations or starting unrelated services |
| Parallel dev processes need setup/readiness and cleanup | Order finite setup, handle readiness, verify interruption | Waiting for foreground server completion or claiming unrun checks pass |
| Development guide loses prerequisites to become shorter | Retain necessary setup/lifecycle; link detailed explanations | Brevity that prevents successful runs |
| Client/mock/provider disagree | Trace actual contract drift and verify provider | Shared static types treated as sufficient |
| Go product embeds a React UI | Distinguish build graph from runtime; test shipped binary | Counting workspace packages as deployments |
| Thin JS manifest delegates Go tasks | Accept native ownership and useful dispatch | Reporting every Go package.json as a defect |
| CLI, REST, and MCP expose one operation | Share operation/invariants; adapt each transport | Calling local REST for reuse or leaking SDK types into domain logic |
| New feature spans web, API, and persistence | Build one runnable tracer slice with observable evidence | Complete technical layers with no working user action |
| Required database replacement preserves method signatures only | Verify atomicity, precision, ordering, and errors on real adapters | Claiming interface compatibility proves storage semantics |
| Storage rename feeds generated REST/CLI/MCP output | Review migrations and each public contract separately | Accidental wire/behavior changes from internal schema edits |
| Separate agents share checkout and global registry | Scope file ownership; coordinate shared edits/index and integration | Assuming distinct features prevent lost edits or semantic conflicts |
| One-file CLI gains speculative service/repository layers | Keep a small testable function and native entry point | Grading architecture by layers/files rather than responsibility |
| CLI help initializes DB; JSON includes progress logs | Defer live setup; separate output/diagnostic streams | Domain helpers exiting process or untestable terminal dependencies |
| REST tests mock a store while writes commit separately | Check request contracts and real atomic behavior | Passing mocks treated as proof of transaction correctness |
| MCP function tests pass but stdout includes logs | Verify discovery/invocation through actual protocol transport | Missing wiring/schema errors or corrupted stdio |
| Stateful MCP HTTP server shares user data between clients | Own authenticated session state and verify isolation | Treating annotations or global mutable state as authorization |
| React feature requires edits to every global Hooks/types module | Colocate feature responsibilities; share only cohesive capabilities | Mandatory global store/provider or one Hook per component |
| Vite dev proxy works; built app has wrong API URL | Verify production browser/API wiring and public config | Treating dev success as deployment evidence |
| REST and MCP share an operation | Reuse application owner and translate protocol results | One local transport calling another for reuse |
| Fixture source lacks refresh but permits comments | Resolve support/policy; enforce operations server-side | Source-name checks or UI-only denial |
| Generated check follows a staging write | Compare before overwrite or check resulting Git drift | Claiming a comparison with replaced output detects staleness |
| Derived DB rebuild loses absent-source history | Establish authority/loss scope and recovery contract | Calling destructive reset a row-preserving migration |
| Import cursor advances independently of facts | Validate continuity and atomic progress | Treating file size/offset as sufficient evidence |
| JS `customerId`, Go `customerID`, protobuf `customer_id` | Accept equivalent vocabulary with native spellings | Imposing one casing scheme across languages |
| Customer/client synonyms or distinct account concepts | Trace meaning; preserve domain translations | Unifying distinct concepts or ignoring synonym drift |
| Producer timeout seconds, consumer milliseconds | Verify conversion and contract; clarify scalar units | Cosmetic suffix advice without checking behavior |
| React component/Hook or required framework filename | Preserve required naming semantics and discovery | Treating framework requirements as cosmetic preferences |
| Public field/config rename with older consumers | Trace consumers and preserve compatible transition | Breaking callers for naming consistency |
| Coherent nonpreferred filename convention | Follow existing pattern; label preference only | Unrequested repository-wide rename |
| Healthy boundaries and checks | Report no supported findings | Invented folder-count/sequential-scan defects |
| Partial audit of large repo | Report exact inspected scope, continue full requested audit | Claim of repo-wide conformance from a sample |

Avoid grading by folder count, layer count, abstraction count, or raw coverage.
Measure supported findings, false positives, useful independent runs, behavior
preservation, and honest coverage. Changed decisions need actual runs to establish
agent effectiveness; format validation alone does not do that.

## Sources

- [Agent Skills progressive disclosure](https://agentskills.io/specification)
- [Component/contract testing strategies](https://martinfowler.com/articles/microservice-testing/)
- [Go HTTP test boundary](https://pkg.go.dev/net/http/httptest)
- [Testing Library observable behavior](https://testing-library.com/docs/guiding-principles/)
- [Anthropic skill evaluation workflow](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)
- [Superpowers skill evaluation](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md)

Audit classifications, evaluation cases, and scoped-change discipline are skill
policies. External workflows inform evaluation without imposing their approval,
test, delegation, or installation rules on this skill.
