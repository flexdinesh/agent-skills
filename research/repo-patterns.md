# repo-patterns: research and provisional design

Researched 2026-09-26. Research brief, not an installed skill or settled policy.
Examples and recommendations below are original synthesis. Links identify the
supporting standards, documentation, or authors' own descriptions.

Implemented companion: [repo-patterns](../skills/repo-patterns/SKILL.md). The skill
adopts the recommended defaults below; this brief preserves the research context.

Local case studies: [Servediff and Tokeninsights lessons](repo-patterns-repo-lessons.md).

## Direction supported by the research

Build `repo-patterns` around **explicit, verifiable boundaries**: dependencies,
public contracts, runtime resources, data ownership, compatibility, and change
ownership. Folder layout helps readers discover those boundaries; enforcement
and behavior establish whether they exist.

The closest architectural foundation for independent fixture runs is **ports and
adapters**. Cockburn's original description explicitly aims to let applications
run through tests or other drivers, independently of their eventual UI and
database. This supports replaceable I/O without requiring a dependency-injection
framework or a prescribed number of layers. [Original ports-and-adapters paper](https://alistair.cockburn.us/hexagonal-architecture)

A **modular monolith** is a useful starting hypothesis when one deployment can
serve the product. Separate services need reasons such as distinct deployment,
scaling, security, or operational ownership. Fowler recommends discovering
boundaries before committing to microservices, while acknowledging exceptions.
This is architectural advice, not an industry mandate. [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)

Monorepos help coordinate changes across projects; they do not inherently imply
microservices, independently released packages, or a particular build system.
Google's experience illustrates benefits and substantial tooling costs, not a
template small repositories should reproduce. [Google's monorepo paper](https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/)

### Refine the starting assumptions

| Initial idea | Research-backed refinement | Status |
| --- | --- | --- |
| Different layout for one vs several independent parts | First identify entry points, language packages/modules, deployment units, and domain owners. These are different axes. | Strong recommendation |
| Monorepo needs excellent boundaries | Declare allowed dependencies and public APIs; check imports, builds, data access, and contracts. | Strong recommendation |
| Every server/CLI needs fixtures | Every relevant executable should have a documented reproducible development path. Fixture strategy depends on its I/O and fidelity needs. | Proposed repo policy |
| Default path plus config/fixture path | Same application behavior, different explicit dependency composition. Parse config once; avoid fixture branches throughout domain code. | Strong recommendation |
| Go/Node servers; Vite/React frontend | Useful preferred stack. Preserve supported existing stacks unless migration is requested. | Personal preference |
| pnpm for JS; mise for other tools | Good division: pnpm owns JS dependencies/scripts; mise pins runtimes/tools and can provide a cross-language task entry point. | Personal preference |
| Consistent dev/start/run | Standardize task meanings and lifecycle. A static frontend preview, daemon start, and one-shot CLI run differ. | Proposed repo policy |
| Shared code improves reuse | Extract a cohesive capability with actual consumers and an owner. Similar-looking code across domains can evolve differently. | Context-dependent |
| Boundaries avoid contributor conflicts | Reduce shared edits and isolate runtime resources. Contracts, lockfiles, and shared schema still need coordination. | Goal with limits |

## What a good boundary should establish

For each meaningful module or runnable part, answer:

1. **Purpose:** what domain capability or technical responsibility does it own?
2. **Surface:** what can consumers import, call, or send? What remains private?
3. **Dependencies:** which modules and external services may it use?
4. **State:** which data, transactions, caches, jobs, and resources does it own?
5. **Execution:** how do its tests and development runtime start and stop?
6. **Evolution:** which consumers must remain compatible when it changes?
7. **Change ownership:** what can a contributor change locally, and what requires
   coordinated work?

Prefer cohesive domain/feature modules over giant repository-wide collections of
controllers, services, models, and utilities. Infrastructure shared across domains
can remain technical packages. Feature grouping is an established option in
Redux's guidance; Feature-Sliced Design offers stricter layer/import conventions.
Neither establishes a universal React directory standard. Borrow locality and
explicit surfaces without adopting every layer. [Redux style guide](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic), [Feature-Sliced Design layers](https://feature-sliced.design/docs/reference/layers)

Use the smallest useful seam. A pure function, concrete service passed to a
constructor, or narrow consumer-owned interface can be sufficient. Go's review
guidance discourages speculative interfaces and implementor-owned interfaces
created solely for mocking. This limits how aggressively a ports-and-adapters
policy should introduce abstractions. [Go interface guidance](https://go.dev/wiki/CodeReviewComments#interfaces)

### Make the rules executable

| Boundary | Useful enforcement | Limitation |
| --- | --- | --- |
| Private Go implementation | Appropriately nested `internal/` packages | Imports are restricted by the parent directory, not by conceptual domain ownership. A root `internal/` does not isolate sibling domains. |
| JS package API | Explicit package `exports`; declared workspace dependencies | Relative paths and tooling aliases can bypass intended surfaces; inspect those too. |
| Feature/domain imports | Existing ESLint restrictions, Nx constraints, or a focused dependency check | No need to introduce Nx merely to enforce imports. |
| Browser/server separation | Separate entry points and dependency rules; inspect production bundles | Shared types do not justify importing server runtime code. |
| Database ownership | Owner-specific access code; privileges where justified; cross-owner access review | Shared physical storage can be legitimate; ownership is not always a separate database. |
| Contract compatibility | Provider/client tests, schema checks, affected consumer builds | Compiling generated types does not prove behavior or authorization. |

These mechanisms are documented in [Go layout guidance](https://go.dev/doc/modules/layout),
[Node package exports](https://nodejs.org/api/packages.html#package-entry-points),
[ESLint import restrictions](https://eslint.org/docs/latest/rules/no-restricted-imports),
and [Nx module boundaries](https://nx.dev/docs/features/enforce-module-boundaries).

## Repository shapes: choose by actual units

### One application or library

Keep the language/framework's ordinary root structure. A Go library can live at
the module root. A small Go command can do the same; a larger server often uses
`cmd/` and `internal/`. A Vite application can keep its normal root configuration
and `src/`. No workspace or artificial package layer is needed.

An illustrative larger Go server:

```text
go.mod
cmd/api/main.go                # config, dependency composition, lifecycle
internal/orders/              # cohesive order behavior and contracts
internal/orders/postgres/     # SQL implementation when separation helps
internal/httpapi/             # HTTP translation and route composition
migrations/                   # this database's ordered migration stream
testdata/                     # input fixtures / scenarios
mise.toml
```

Names and adapter placement are provisional. Keep HTTP adjacent to its feature
when that improves locality. Avoid creating an adapter directory for a trivial
implementation. Go's official examples support several layouts and do not
require `pkg/`, `src/`, or a clean-architecture scaffold. [Official Go module layouts](https://go.dev/doc/modules/layout)

### Several entry points in one cohesive product

A server, worker, and CLI using the same Go implementation can be separate
`cmd/api`, `cmd/worker`, and `cmd/tool` directories in **one module**. Their entry
points compose dependencies independently. Multiple binaries alone do not justify
multiple `go.mod` files. [Go multiple-command convention](https://go.dev/doc/modules/layout#multiple-commands)

Likewise, several Node entry points can share one package when dependency and
release ownership are cohesive. Separate packages when consumer surfaces,
runtime requirements, or change ownership warrant it.

### Several projects in a repository

For JS workspaces, `apps/` and `packages/` is a common convention, supported by
Turborepo's documentation. It is a useful default, not a standard all languages
must obey. [Turborepo repository structure](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)

An illustrative mixed repository:

```text
apps/
  api/                        # Go: cmd/, internal/, own local-run docs
  web/                        # Vite/React: package.json, src/, scenarios
  importer/                   # CLI: own command, config, fixtures, tests
packages/
  api-client/                 # generated or handwritten public client
  ui/                         # reusable UI with real consumers
  tooling/                    # shared JS lint/config where worthwhile
contracts/                    # only if this is the chosen contract authority
pnpm-workspace.yaml            # JS projects only
pnpm-lock.yaml
mise.toml
```

The Go arrangement is a separate decision. One root module may suit Go projects
developed together; separate modules may suit independent consumers or releases.
Do not add dummy JS manifests to Go projects just to satisfy a JS task runner.

If multiple Go modules exist, `go.work` can support local combined development.
Decide deliberately whether to commit it. Go documents risks of workspace
overrides hiding dependency problems and allows exceptions for tightly coordinated
modules. Independently distributed modules should also be tested with workspace
mode disabled and genuine declared dependencies. [Go workspace and CI guidance](https://go.dev/ref/mod#workspaces)

### Reuse and dependency direction

Candidate policy: applications compose libraries; libraries expose bounded
capabilities and avoid importing application entry points. An independently owned
application should consume another's contract rather than its private source.
Deployable programs sharing business code can extract that code into a suitable
package without pretending it is universally reusable.

Give every shared package a purpose, owner, consumers, and dependency policy.
Avoid a growing `shared` package containing server models, browser components,
secrets, database access, and unrelated helpers.

## Independent runs, fixtures, and test fidelity

Distinguish four concepts:

| Concept | Purpose | Example |
| --- | --- | --- |
| Fixture data | Reproducible inputs | JSON documents, small SQL datasets, files |
| Test double / adapter | Substitute an external dependency | In-memory store, deterministic clock, fake mail sender |
| Development profile | Compose a runnable environment | Local DB, fake payments, configurable port |
| Integration environment | Verify real infrastructure semantics | Production-family Postgres plus actual migrations |

Candidate invariant: **a contributor can run the relevant part from a clean
checkout, using documented prerequisites, without production credentials or the
entire product runtime.** Independent means the dependency set is controlled;
it can include a disposable local database.

Provide explicit profiles where useful:

- **Fast fixture profile:** deterministic input, fake remote services, isolated
  writable state; no unrelated applications required.
- **Real persistence profile:** actual database engine, migrations, then seed
  data; fake unrelated external services. Use this for database behavior.
- **Connected development:** configured real development dependencies, where
  integration needs them.

Do not require all three for a pure CLI that reads files. Do not replace Postgres
with SQLite or an in-memory map as the only verification of SQL behavior.
Testcontainers demonstrates testing Go persistence against real disposable
Postgres; another isolated local instance is also valid. Containers are an
implementation option and carry runtime prerequisites. [Testcontainers Go/Postgres guide](https://testcontainers.com/guides/getting-started-with-testcontainers-for-go/)

### Compose once; exercise the real application

The executable loads config, creates dependencies, starts the application, and
owns cleanup. HTTP handlers, domain operations, and CLI execution should be
constructible without import-time network connections or reading machine-global
configuration. Fixture composition selects alternate I/O; it should preserve
validation, authorization, domain behavior, and transport serialization.

A CLI execution function can receive parsed options, input/output streams, and
dependencies, returning a result or exit status. The outer entry point alone
owns process exit. This makes errors, stdout/stderr, and file behavior observable
without spawning a process for every unit test.

Use one documented config precedence, for example defaults → config file → env
→ flags. This ordering is a proposed repo convention, not a standard. Validate
resolved values at startup; fail on a missing explicitly requested config or
fixture. Never silently fall back to fake data when live connectivity fails.
Keep deploy-specific credentials outside committed code. Twelve-Factor advocates
environment configuration; structured local files can remain appropriate for
CLIs and scenario selection. [Twelve-Factor configuration](https://12factor.net/config)

### Fixtures that remain useful

- Name scenarios by behavior: empty, typical, invalid, unauthorized, conflict,
  timeout, and recovery. Add relevant cases rather than exhaustive artificial
  permutations.
- Use small synthetic data with explicit schema/version expectations. Avoid
  unsanitized production dumps and massive shared golden datasets.
- Separate immutable fixture inputs from per-run mutable state. Reset deterministically;
  do not make tests depend on another test's seed or mutation.
- Control time and identifiers when assertions need reproducibility. Inject a
  clock where behavior depends on it; do not make security randomness predictable.
- Schema-validate mock responses and periodically verify them against the real
  provider contract. Shared types alone cannot stop mock drift.
- For a frontend, intercept HTTP with MSW so production request code still runs.
  Its handlers can serve development, component tests, and demos. Keep mock
  activation explicit and out of production composition.

[MSW's reusable network mocking](https://mswjs.io/docs/),
[Pact's contract-testing model](https://docs.pact.io/), and
[Playwright test isolation](https://playwright.dev/docs/test-parallel#keep-tests-independent)
support these choices. Pact infrastructure is optional; ordinary provider and
consumer tests can be sufficient for a small API.

### Test at the boundary that can expose the bug

| Concern | Appropriate evidence |
| --- | --- |
| Domain transitions and calculations | Fast behavioral tests, ordinary fakes where needed |
| HTTP parsing, auth, status, body | Handler/server tests through public request behavior |
| SQL constraints, locks, transactions, query semantics | Real database integration tests |
| Fixture/provider agreement | Contract checks / provider verification |
| Browser state and interactions | Component tests and a small set of browser flows |
| Config and executable lifecycle | Startup, representative operation, cancellation/shutdown smoke checks |

Use Go's `httptest` for transport-level checks where appropriate. Testing Library
supports testing user-observable behavior. Fowler's component/contract testing
discussion supports isolating services without relying on a large end-to-end
suite. [httptest](https://pkg.go.dev/net/http/httptest),
[Testing Library principles](https://testing-library.com/docs/guiding-principles/),
[Microservice testing strategies](https://martinfowler.com/articles/microservice-testing/)

## Contributor and agent independence

This is a proposed collaboration policy, inferred from the architecture and
isolation practices above. Evidence does not justify promising conflict-free work.

- Colocate feature changes so an ordinary feature does not require editing broad
  global registries, shared model files, or unrelated packages.
- Give each module a small contract and local commands. A short local README or
  applicable `AGENTS.md` can record ownership and dependency rules.
- Agree contracts before parallel implementation. Assign contract edits, lockfile
  changes, migration ordering, and shared configuration deliberately.
- Keep task changes scoped. Use separate worktrees when concurrent edits need
  independent Git working trees; worktrees alone do not isolate runtime resources.
- Namespace DBs/schemas, Compose project names, queues, temp directories, output
  paths, and mutable fixtures by worktree/run. Use configurable or allocated ports
  and report the actual bound address.
- Give generated artifacts one source and reproducible generation commands.
  Regenerate lockfiles/generated code after integration; do not hand-merge them
  as ordinary source or delete them to bypass a conflict.
- Use migration identifiers/order supported by the chosen tool. Unique filenames
  reduce naming collisions; they do not resolve incompatible concurrent DDL.
- Check affected consumers after a shared change. With pnpm, selecting a package's
  dependencies differs from selecting its dependents; use the correct direction.

Compose documents project names for environment isolation, and Playwright
documents worker-specific data isolation. `CODEOWNERS` can route human reviews
and enforce configured review requirements; it does not prevent import violations
or coordinate simultaneous agents. [Compose project isolation](https://docs.docker.com/compose/how-tos/project-name/),
[Playwright parallel data isolation](https://playwright.dev/docs/test-parallel#isolate-test-data-between-parallel-workers),
[GitHub code ownership](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners),
[pnpm filtering](https://pnpm.io/filtering)

## Tooling and command conventions

Proposed default for new projects: Go or Node/TypeScript servers, Vite/React
frontends, pnpm for JS dependency management, and mise for runtime/tool versions
and cross-language task dispatch. Existing compatible tooling should be audited
on behavior before proposing migration.

For JS workspaces, use explicit workspace membership and declared local
dependencies with `workspace:` where appropriate. Keep runtime dependencies in
the consuming package. Shared root tooling does not excuse undeclared application
dependencies. Catalogs can centralize selected dependency ranges while preserving
package declarations and justified exceptions. [pnpm workspaces](https://pnpm.io/workspaces),
[pnpm catalogs](https://pnpm.io/catalogs)

Pin a supported runtime/tool version policy and the pnpm version. mise can manage
Node and pnpm binaries too; pnpm still manages JS libraries. Preserve native
language commands beneath wrappers. Start with pnpm/mise and the existing checks;
add caching/orchestration tools when dependency-graph scale justifies them.
[mise configuration](https://mise.jdx.dev/configuration.html),
[mise tasks](https://mise.jdx.dev/tasks/)

### Candidate task vocabulary

| Task | Meaning | Applicability |
| --- | --- | --- |
| `dev` | Foreground development runtime; reload where supported | Runnable development target |
| `dev:fixtures` | Documented scenario/profile; same application code | Relevant executable |
| `build` | Produce deployable/package artifacts | Buildable target |
| `start` | Run built long-lived executable without development reload | Server/worker where meaningful |
| `run` | Execute a one-shot command; forward arguments and exit status | CLI |
| `preview` | Inspect built frontend locally | Vite frontend |
| `test` | Finite tests; no watch mode in CI | Testable target |
| `test:integration` | Explicit real-service tests with lifecycle/cleanup | Targets requiring them |
| `lint`, `typecheck`, `format:check` | Finite non-mutating checks | Where supported |
| `check` | Aggregate applicable finite checks | Repo / part |
| `db:migrate`, `db:seed` | Separate schema and development data operations | Persistence owner |

Names are proposed conventions. Avoid dummy tasks for non-applicable capabilities.
`pnpm run` and `mise run` are dispatch syntax; they do not require every project
to define a task named `run`.

Node package scripts should own their actual JS commands; mise wrappers can
delegate to them. Go tasks should invoke native Go commands. Root convenience
tasks should dispatch bounded targets without requiring the entire repo to boot.

Candidate invocations, after corresponding tasks are defined:

```text
pnpm --filter @repo/web run dev:fixtures
pnpm --filter @repo/web run test
mise run api:dev:fixtures
mise run importer:run -- --config ./dev/importer.toml
mise run check
```

These are illustrative interfaces, not verified commands in this skills repo.
Use `preview` for Vite's built-site inspection: Vite explicitly says its preview
server is unsuitable for production serving. [Vite deployment guidance](https://vite.dev/guide/static-deploy.html)

Declare task dependencies correctly. mise prerequisites may run in parallel;
listing migration and seed tasks in the same dependency array does not order
them. Express migration → seed → start as actual sequential dependencies or
steps. Do not cache live development, migrations, or nondeterministic tests as
ordinary pure builds. Include relevant config, environment, and generated inputs
when a build cache is used. [mise task ordering](https://mise.jdx.dev/tasks/)

Check installed versions before relying on newer features. Current mise docs
mark workspace graph/script inference features experimental. Turborepo's current
skill directs agents to version-matched documentation bundled with the installed
package. Both are reasons to avoid embedding unqualified latest-version recipes.
[mise monorepo features](https://mise.jdx.dev/tasks/monorepo.html),
[Turborepo skill](https://github.com/vercel/turborepo/blob/main/skills/turborepo/SKILL.md)

## Go and JavaScript correctness patterns

Keep this skill focused on risks connected to repository boundaries and runtime
behavior; use reference files for language-specific detail.

### Go candidates

- Narrow interfaces at consumers; concrete constructors when abstraction adds
  nothing. Avoid Java-style interface/service/repository layers for every type.
- Explicit resource construction and cleanup; avoid network/DB work in `init()`
  or mutable global clients. Keep process exit at executable entry points.
- Preserve error identity when adding context; inspect errors structurally.
  Handle expected failures without panicking or silently returning empty values.
- Propagate request cancellation into I/O. Give goroutines an owner, cancellation,
  bounded work, and a way to wait for exit. Avoid abandoning blocked sends.
- Close response bodies/result rows; check iteration and commit errors. Bound
  request bodies and externally supplied work. Configure timeouts for the runtime.
- Run meaningful tests plus installed checks; use the race detector for relevant
  concurrency. Its coverage is limited to code paths actually exercised.

Foundations: [Go review comments](https://go.dev/wiki/CodeReviewComments),
[Uber Go guide](https://github.com/uber-go/guide/blob/master/style.md),
[Google Go decisions](https://google.github.io/styleguide/go/decisions),
[Go cancellation](https://go.dev/doc/database/cancel-operations),
[Go race detector](https://go.dev/doc/articles/race_detector).
Google/Uber style choices are organizational conventions, not language law.

### JavaScript/TypeScript candidates

- Preserve browser/server import boundaries. Separate public browser config from
  server credentials. Vite-prefixed environment values are bundled client data.
- Parse untrusted input at I/O boundaries. Static types and generated clients do
  not validate JSON, env, database representation, or remote responses.
- Prefer strict TypeScript. Consider indexed-access and exact-optional checks
  deliberately. Per this repository's instruction: no `any`, type assertions,
  or non-null assertions. That prohibition is personal policy, not universal TS
  convention.
- Own async failures and cancellation. Bound fan-out rather than launching one
  task per unbounded record. Protect against stale responses and unsafe retries.
- Avoid blocking a server's event loop with synchronous I/O or heavy computation
  in request paths. Startup scripts and small one-shot CLIs have different needs.
- Keep React state ownership clear; derive redundant values and avoid effect
  loops. Use existing router/query facilities where appropriate. Recover visibly
  from failed loads and mutations.

Foundations: [Vite environment handling](https://vite.dev/guide/env-and-mode),
[TypeScript strict mode](https://www.typescriptlang.org/tsconfig/strict.html),
[indexed access](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html),
[optional properties](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html),
[Node event-loop guidance](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop),
[React effect/state guidance](https://react.dev/learn/you-might-not-need-an-effect).

The existing `react-patterns` already covers component/state/effect correctness.
`repo-patterns` should cover placement, dependency direction, runtime composition,
contracts, and dev execution; avoid maintaining a second conflicting React rulebook.

## Data models and schema evolution

Model from invariants and use cases, then choose representation. Identify the
owner, identity, lifecycle, legal transitions, relationships, authorization scope,
and atomic operations. A complicated domain can benefit from bounded contexts
and aggregates; a straightforward CRUD feature may need only explicit types,
validation, and constraints.

Candidate checks:

- Separate transport inputs/outputs from persistence rows when visibility,
  validation, or evolution differs. Do not expose ORM rows wholesale or permit
  mass assignment of server-owned fields.
- Reuse one representation when contracts actually match; do not mandate three
  near-identical models and mappers for every entity.
- Define absent vs null vs default, especially for partial updates. Model
  mutually exclusive states deliberately; avoid inconsistent combinations of
  optional fields and flags.
- Define precision/units for amounts, time semantics, and ID serialization across
  Go/JS/SQL. Exact decimal or bounded minor-unit integer representations can suit
  money; floating point should not silently define financial rounding.
- Start with constraints and relationships that represent the domain. Introduce
  JSON blobs or denormalized projections for concrete requirements, with an owner
  and an update/rebuild story.
- Share wire contracts or generated clients across Go/JS, rather than importing
  storage models into the frontend. Identify one contract authority and detect
  generated-output drift.

Postgres documents exact vs inexact numeric types and database constraints.
OpenAPI defines a language-neutral HTTP contract. These support the checks above
without prescribing an ORM or a contract-first workflow. [Postgres numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html),
[Postgres constraints](https://www.postgresql.org/docs/current/ddl-constraints.html),
[OpenAPI specification](https://spec.openapis.org/oas/latest.html)

Treat model/API/DB changes as compatibility work when consumers or old application
versions remain active. Removing a field, requiring a formerly optional input,
or changing semantics can break consumers even when a new schema compiles. Enum
expansion depends on consumers' unknown-value handling. Google's guidance
distinguishes source, wire, and semantic compatibility; adapt its policy to the
actual audience and rollout model. [API compatibility](https://google.aip.dev/180)

## Database access and migrations

Postgres is the concrete research example; database-specific rules should be
conditional. Do not force a database or ORM through this skill.

### Access patterns

- Parameterize query values. Allowlist dynamic identifiers/sort expressions;
  placeholders cannot safely stand in for arbitrary SQL syntax.
- Enforce persistent invariants with appropriate uniqueness, foreign-key,
  nullability, and check constraints. Application pre-checks alone race.
- Make transaction scope correspond to the atomic operation. Pass the same
  transaction through participating queries; avoid mixing transactional and
  nontransactional clients accidentally.
- Choose concurrency control for the invariant: conditional writes, version
  checks, locking, or appropriate isolation. Retry retryable transaction failures
  by re-running the whole operation with bounded attempts and safe side effects.
- Reuse pools and manage their lifecycle. Budget connections across replicas,
  workers, and development instances when scale requires tuning; do not require
  arbitrary custom pool settings in every small Go program.
- Bound list results, watch N+1 patterns, and select needed columns. Evaluate
  indexes with actual queries/plans. A sequential scan alone is not a bug.
- Preserve tenant/user scoping on every relevant read and write. Authentication
  does not establish permission for a particular object.

[Go SQL parameterization](https://go.dev/doc/database/sql-injection),
[Go transactions](https://go.dev/doc/database/execute-transactions),
[sqlc transaction binding](https://docs.sqlc.dev/en/latest/howto/transactions.html),
[Go pooling](https://go.dev/doc/database/manage-connections),
[Postgres isolation](https://www.postgresql.org/docs/current/transaction-iso.html),
[Postgres query plans](https://www.postgresql.org/docs/current/sql-explain.html),
[OWASP object authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
are the primary references.

Postgres does not automatically index the referencing side of a foreign key;
evaluate that index against access/deletion patterns. `EXPLAIN ANALYZE` executes
the query, including writes: use appropriate isolated data and account for side
effects. [Constraint/index behavior](https://www.postgresql.org/docs/current/ddl-constraints.html),
[EXPLAIN execution](https://www.postgresql.org/docs/current/sql-explain.html)

Where a DB update must reliably trigger a remote event, a transactional outbox
can address the dual-write gap. Delivery can still repeat; consumers need
idempotent handling. This is conditional on reliable event delivery being a real
requirement, not a reason to introduce queues into every CRUD application.
[AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)

### Evolution patterns

Version schema changes in a reproducible migration history. Avoid editing applied
shared migrations. Keep development scenario seeds distinguishable from schema
and durable reference-data changes. Test creating a clean DB and upgrading a
representative previous schema. Evolutionary database design supports incremental
versioned change rather than manually maintaining divergent environments.
[Evolutionary database design](https://martinfowler.com/articles/evodb.html)

For rolling deployments or other compatibility-sensitive changes, consider:

1. **Expand:** add compatible schema; establish compatible writes/read behavior.
2. **Migrate:** backfill in bounded, resumable batches with safe handling of writes
   happening during the backfill.
3. **Switch:** verify consistency and move reads/writes to the new representation.
4. **Contract:** remove the old representation after old consumers are gone and
   the recovery/rollback window is understood.

Order depends on the change. Backfilling before protecting concurrent writes can
lose updates. State compatibility, transition behavior, and completion evidence
explicitly. For a small offline tool, a transactional migration during planned
downtime may be simpler. [GitLab migration compatibility](https://docs.gitlab.com/development/database/avoiding_downtime_in_migrations/),
[GitLab resumable background migrations](https://docs.gitlab.com/development/database/batched_background_migrations/)

Audit lock duration, scans, rewrites, timeouts, and transaction support. A fast
metadata operation can still wait for or hold a strong lock. Concurrent Postgres
index creation has restrictions, can leave an invalid index after failure, and
cannot run inside an ordinary transaction block. Recovery might be a forward
repair or restore rather than a data-losing down migration. Choose one migration
stream/executor per shared database, or explicitly coordinate separate owners.
[Postgres ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html),
[Postgres CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)

## REST/HTTP endpoint patterns

Separate three levels of authority:

- **HTTP semantics:** standardized method/status/header behavior.
- **API conventions:** resource naming, pagination, errors, compatibility policy.
- **Product decisions:** authorization, workflows, data visibility, retries.

Candidate rules:

| Concern | Proposed guidance |
| --- | --- |
| Resources | Expose domain resources and workflows with consistent names; avoid mirroring tables mechanically. |
| Methods | Respect safe/idempotent method semantics. POST can legitimately implement commands and application-level idempotency. PATCH semantics depend on the selected patch representation. |
| Handlers | Parse/validate, establish authorization, call application behavior, translate results; keep transaction and domain decisions with their owner. |
| Errors | Stable machine-readable errors; RFC 9457 is a good default for a new API. Preserve compatible established formats when appropriate. |
| Lists | Bound page size; define ordering/filtering. Cursor/keyset pagination suits large changing datasets; offsets remain useful for bounded datasets and page navigation. |
| Mutations | Define duplicate/retry behavior. For retry-sensitive creates/commands, consider idempotency keys with principal/operation scope, payload checks, concurrent handling, retention, and durable results. |
| Updates | Use conditional updates / ETags where concurrent edits must avoid overwriting changes. Define missing vs explicit-null behavior. |
| Long work | Use async operations and observable status when needed; document polling, cancellation, and failure behavior. |
| Security | Object/function/field authorization; bound body size/work; avoid leaking credentials, internals, or unauthorized existence. |
| Contract | OpenAPI or another appropriate authoritative description, representative examples, and tests against actual handlers. |
| Evolution | Compatibility policy based on real consumers. Avoid unnecessary global `/v2` migrations for an additive internal change. |

[RFC 9110 HTTP semantics](https://httpwg.org/specs/rfc9110.html),
[RFC 9457 problem details](https://www.rfc-editor.org/rfc/rfc9457.html),
[Google resource-oriented design](https://google.aip.dev/121),
[Google custom methods](https://google.aip.dev/136),
[Google pagination](https://google.aip.dev/158),
[Stripe idempotency behavior](https://docs.stripe.com/api/idempotent_requests),
and [OpenAPI](https://spec.openapis.org/oas/latest.html)
inform this table. Google and Stripe document their conventions, not universal
requirements. An opaque cursor is not authorization; repeated DELETE requests
can remain idempotent while returning different status codes.

Test invalid input, denied access, empty results, duplicate requests, concurrent
changes, and persistence failures where relevant. Schema checks alone will miss
these behaviors.

## Tangential open-source skills

Popularity snapshot: GitHub repository stars fetched from the GitHub API on
2026-09-26. Rounded counts below describe repositories, **not individual skill
installs or quality scores**. Exact skill sources were inspected; old search
results sometimes describe older contents, especially for Turborepo.

| Project / popularity | Relevant skills | Useful influence | Caution |
| --- | --- | --- | --- |
| [Vercel agent-skills](https://github.com/vercel-labs/agent-skills), ~31.5k | [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md), [vercel-composition-patterns](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md) | Small rules grouped by concern; examples and impact-aware review | React/Next.js advice needs framework applicability; not a repo/database architecture standard. |
| [Supabase agent-skills](https://github.com/supabase/agent-skills), ~2.7k | [supabase-postgres-best-practices](https://github.com/supabase/agent-skills/blob/main/skills/supabase-postgres-best-practices/SKILL.md) | Query/pool/schema/security/concurrency references; good SQL example format | Distinguish Postgres fundamentals from Supabase deployment assumptions; measure performance claims. |
| [Turborepo](https://github.com/vercel/turborepo), ~31.1k | [turborepo](https://github.com/vercel/turborepo/blob/main/skills/turborepo/SKILL.md) | Package/task ownership; current skill routes to installed-version docs | Tool-specific. Do not require Turbo to satisfy boundaries. |
| [Nx](https://github.com/nrwl/nx), ~29.4k | [nx-workspace](https://github.com/nrwl/nx/blob/master/.agents/skills/nx-workspace/SKILL.md), [nx-run-tasks](https://github.com/nrwl/nx/blob/master/.agents/skills/nx-run-tasks/SKILL.md) | Inspect effective project configuration and dependency graph before acting | Useful where Nx exists; some broader enforcement capabilities have separate licensing/features. |
| [wshobson/agents](https://github.com/wshobson/agents), ~40k | [architecture-patterns](https://github.com/wshobson/agents/blob/main/plugins/backend-development/skills/architecture-patterns/SKILL.md), [api-design-principles](https://github.com/wshobson/agents/blob/main/plugins/backend-development/skills/api-design-principles/SKILL.md), [nodejs-backend-patterns](https://github.com/wshobson/agents/blob/main/plugins/javascript-typescript/skills/nodejs-backend-patterns/SKILL.md) | Broad backend/API coverage; progressive reference routing | Some absolutes overshoot: interfaces at every layer, POST/idempotency, blanket production CORS restrictions. Verify each rule. |
| [ECC](https://github.com/affaan-m/ECC), ~267.6k | [golang-patterns](https://github.com/affaan-m/ECC/blob/main/skills/golang-patterns/SKILL.md), [database-migrations](https://github.com/affaan-m/ECC/blob/main/skills/database-migrations/SKILL.md) | Broad examples for Go errors/lifecycle and migration workflows | Migration examples include misleading lock/rewrite explanations; review examples against engine docs. |
| [Superpowers](https://github.com/obra/superpowers), ~291.7k | [writing-skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md), [test-driven-development](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md) | Test whether the skill changes agent decisions; failure-oriented evaluation | Workflow prescriptions should not override local authorization or impose tests for every low-impact edit. |
| [Anthropic skills](https://github.com/anthropics/skills), ~178.4k | [skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) | Iterative prompts, qualitative review, and quantitative evaluations | Authoring aid, not architecture authority. |
| [mblode/agent-skills](https://github.com/mblode/agent-skills), 129 | [codebase-architecture](https://github.com/mblode/agent-skills/blob/main/skills/codebase-architecture/SKILL.md) | Closest scope: module contracts, deepen/harden modes, enforcement, agent wayfinding | Relevant but not popular enough to call consensus; strongly opinionated TS architecture. |

Existing local complements: `react-patterns`, `ts-guidance`, `adr`, `plan-mode`,
and `review-changes`. Respect their invocation rules; reference overlapping scope
without requiring automatic invocation or importing contradictory policies.

### Popularity does not establish correctness

Two concrete checks changed the recommendations:

1. ECC's migration skill describes adding a nullable column as having no lock.
   Postgres documents `ACCESS EXCLUSIVE` unless otherwise specified. Avoiding a
   table rewrite and avoiding a lock are different. The skill also overgeneralizes
   default handling; volatile defaults can require rewrites.
   [ECC example](https://github.com/affaan-m/ECC/blob/main/skills/database-migrations/SKILL.md),
   [Postgres authoritative behavior](https://www.postgresql.org/docs/current/sql-altertable.html)
2. wshobson's API skill treats using POST for idempotent operations as an error.
   RFC 9110 gives particular methods guaranteed idempotent semantics; it does
   not prohibit an application from making POST retry-safe. Stripe demonstrates
   an established idempotency-key convention.
   [Skill claim](https://github.com/wshobson/agents/blob/main/plugins/backend-development/skills/api-design-principles/SKILL.md),
   [HTTP semantics](https://httpwg.org/specs/rfc9110.html),
   [Stripe example](https://docs.stripe.com/api/idempotent_requests)

Use external skills as discovery and format inspiration. Write original rules,
retain provenance, and check applicable licenses before reusing actual text.

## Provisional skill design

Suggested scope: **audit and propose by default; apply patterns while writing or
conforming when that work is explicitly requested.** Invocation policy can match
this repository's manual skill convention. A bare invocation should not imply a
repo-wide restructure or stack migration.

A compact `SKILL.md` should route to references instead of loading this entire
research brief. The Agent Skills specification recommends progressive disclosure
and a main file below 500 lines. [Agent Skills specification](https://agentskills.io/specification)

Candidate reference groups:

```text
skills/repo-patterns/
  SKILL.md
  references/
    boundaries-and-layout.md
    independent-runs-and-fixtures.md
    tooling-and-commands.md
    go-and-node-correctness.md
    data-models-and-migrations.md
    database-access.md
    http-contracts.md
    audit-and-conformance.md
```

Each rule should have: applicability, rule ID, rationale, problematic/preferred
example, justified exceptions, verification, and primary sources. Separate:

- **Correctness defects:** demonstrated unsafe behavior, broken builds, lost data,
  leaked secrets, violated authorization, or invalid HTTP semantics.
- **Boundary problems:** unwanted coupling, shared state, hidden dependencies,
  missing contract ownership, or unavailable independent execution.
- **Repo policies:** preferred layout, stack, task names, and fixture obligations.
- **Hypotheses:** performance or collaboration concerns requiring evidence.

### Audit procedure and deliverable

1. Inspect instructions, working tree, manifests, modules, entry points, tool
   versions, CI, tests, migrations, and configuration.
2. Inventory meaningful parts and map imports, runtime dependencies, data owners,
   public contracts, and shared edit points. Keep labels provisional.
3. Inspect requested coverage. Trace candidates through callers/consumers rather
   than treating file size or folder names as proof.
4. When verification is authorized, run relevant finite checks and selected local
   fixture smoke checks. A requested read-only audit should report runnable checks
   rather than silently seed DBs, install tools, or modify files.
5. Produce prioritized supported findings and the smallest coherent proposals.
   State inspected coverage and unknowns; a sample is not a full-repo audit.

Useful report contract:

| Field | Meaning |
| --- | --- |
| Rule / class | Stable rule ID; defect, boundary issue, policy, or hypothesis |
| Evidence | Verified file/line, dependency chain, failing behavior, or missing documented capability |
| Impact | Specific effect on correctness, independent execution, or coordinated change |
| Proposal | Smallest fix; migration/coupling costs and reasonable alternatives |
| Verification | Behavioral test or command; prerequisites and what it proves |
| Coverage | Inspected parts and remaining scope |

Example finding: `runtime-import-side-effect`: importing the CLI command module
opens the shared database, so a fixture invocation needs live credentials before
config is parsed. Proposal: construct the store in the entry point and pass it
to command execution. Verify import without network access, fixture operation,
failure exit status, and cleanup. This gives the agent a concrete repair target.

Conformance should preserve behavior, supported APIs, CLI exits, config semantics,
and migration history; move one coherent slice at a time. Do not combine folder
renames, framework migration, schema redesign, and package splitting solely to
look more standardized.

### Evaluate the skill before declaring it good

Use small representative repositories/prompts and compare results with/without
the skill. Evaluate both supported findings and restraint:

| Scenario | Expected decision |
| --- | --- |
| Small Go CLI | Retain simple layout; do not scaffold unused layers. |
| Go API + worker, one module | Separate composition/lifecycle; no automatic module split. |
| JS workspace reaching through sibling source | Find bypassed public API and propose enforceable boundary. |
| Frontend fixture profile | Exercise normal HTTP client via mocks; preserve validation/error handling. |
| Postgres-dependent feature | Require real persistence evidence for constraints/transactions. |
| Two worktrees running fixtures | Detect shared DB/ports/state and propose per-run isolation. |
| Rolling column change | Explain old/new compatibility and concurrent-write-safe backfill. |
| Retry-sensitive POST | Accept legitimate POST; evaluate actual duplicate prevention. |
| Healthy repo with another package manager | Identify preference only; no unauthorized tool migration. |
| Fixture/client/provider contract drift | Catch drift; do not equate shared types with behavior. |

Measure evidence accuracy, false positives, independence of fixture runs,
behavior preservation, coverage honesty, and whether proposals reduce meaningful
coupling. Do not use folder counts, abstraction counts, or coverage percentages
as substitutes for these outcomes. Skill-creator and writing-skills supply useful
evaluation approaches; their workflows need not become mandatory repo policy.

## Decisions at research time

The implemented skill adopts these recommendations as defaults, with explicit
repo/user instructions taking precedence.

- Stack/tool choices: mandatory or defaults? Recommendation: defaults; migrations explicit.
- Fixture obligation: every executable or relevant I/O boundary? Recommendation: documented independent run per relevant executable; profile fidelity chosen per boundary.
- Enforcement: introduce checks when conforming, or proposals only? Recommendation: audit proposes; requested conformance adds minimal justified checks.
