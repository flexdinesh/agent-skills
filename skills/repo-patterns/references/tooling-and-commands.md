# Tooling and commands

Read when selecting tools, organizing manifests, defining local/CI commands,
or documenting development runs.
Examples are conventions to implement, not commands guaranteed in an arbitrary repo.

## `tool-stack-defaults`

**Apply:** a requested tooling/stack choice is unresolved, or existing tooling
has demonstrated drift. Drift alone does not authorize a tool migration.

**Problematic:** a healthy supported npm/Next.js application is reported as broken
because the preferred stack is pnpm/Vite; Go dependency ownership is moved into
a Node manifest merely to satisfy a task runner.

**Prefer:** resolve each choice from user instructions/repo policy, then established
manifests, lockfiles, scripts, CI, and docs. Apply fallbacks only to gaps within
scope; missing prose or conflicting evidence does not establish an undecided choice.
Keep supported existing tools unless their migration is requested.

| Unresolved choice | Fallback |
| --- | --- |
| JS/TS-only dependencies and development commands | pnpm; root `package.json` scripts |
| Go + JS/TS tool/runtime versions and development commands | mise; root `mise.toml` tasks |
| JS dependency management within a mixed repo | pnpm |
| Go dependency management | Native Go modules |

mise manages tools/tasks, not JS libraries; it can pin Node/pnpm binaries too.
JS/TS-only projects gain no automatic mise requirement. This tooling matrix does
not prescribe a runner for Go-only or other language combinations. For new projects
with an undecided stack, prefer Go or Node/TypeScript servers and Vite/React frontend.
Pin a supported version policy in authoritative configuration for each tool and
keep local/CI resolution consistent.

**Exception:** product/platform needs can justify another stack. Retain an existing
build orchestrator when it serves the repo. Verify APIs for installed versions;
newer monorepo inference features may be unavailable or experimental.

**Verify:** identify the policy/convention or unresolved choice behind each decision.
Resolve versions from manifests/config and compare actual local/CI commands.
Report preference differences separately from failures.

## `tool-dependency-ownership`

**Apply:** JS workspaces, shared tool config, or independently used Go modules.

**Problematic:** a server builds only because its runtime library lives in the
root manifest; a TS path alias hides an undeclared package dependency.

**Prefer:** explicit workspace membership, one authoritative package manager and
lockfile per workspace, and consuming-package dependency declarations. For local
pnpm dependencies use `workspace:` where appropriate. Root dev tooling can be
shared; runtime dependencies belong to consumers. Catalogs centralize selected
version ranges without erasing package declarations. Reusable React libraries
should declare appropriate peer/runtime dependencies for their distribution model.

Keep Go dependencies in the actual module. A workspace override is a local
development convenience, not proof that a released dependency graph works.
Coordinate manifest/lockfile changes; regenerate through the package manager.

**Exception:** intentionally separate workspaces can have separate lockfiles.
Compatible projects can need different versions; do not force one catalog range
across conflicting requirements. Do not rewrite peer declarations mechanically.

**Verify:** build the target in its real deployment/package context, with declared
dependencies and appropriate workspace pruning. For externally released Go
modules, verify with workspace mode disabled. Check generated client/config inputs.

## `tool-command-contract`

**Apply:** defining or auditing tasks for apps, CLIs, libraries, and repo roots.

**Problematic:** `test` watches forever in CI; `start` runs a reload server;
root `dev` indiscriminately starts unrelated services; Vite preview is deployed
as a production server.

**Prefer:** consistent meanings with only applicable commands:

| Task | Contract |
| --- | --- |
| `dev` | Foreground development target; reload where supported |
| `dev:fixtures` | Explicit controlled scenario/profile, normal application path |
| `build` | Build deployable/package artifacts |
| `start` | Run a built long-lived executable; no development reload |
| `run` | One-shot CLI; forward options and exit status |
| `preview` | Inspect a built frontend locally |
| `test` | Finite behavior checks; no CI watch mode |
| `test:integration` | Explicit real-service checks with lifecycle/cleanup |
| `lint`, `typecheck`, `format:check` | Applicable finite, non-mutating checks |
| `check` | Aggregate applicable finite checks |
| `db:migrate`, `db:seed` | Distinct schema and development-scenario operations |
| `db:reset` | Explicit restoration/recreation of selected owned disposable state |

Keep actual JS commands in package scripts; mise/root tasks delegate. Go tasks
invoke native commands. Provide bounded target selection and document cwd, args,
dependencies, readiness, shutdown, and exit behavior. `mise run`/`pnpm run` is
dispatch syntax, not a requirement for every package to define a `run` script.

For `test:integration`, document runtime/service access, image availability where
applicable, startup/test timeouts, and worker limits. Required integration runs
fail clearly on missing prerequisites; do not silently skip or substitute fakes.
Explicit fast-only selection may omit them; relevant CI jobs must execute the
required suite. Keep provisioning in the owning harness; see
[container infrastructure](test-data-and-setup.md#fixture-container-infrastructure).

Where command conventions are undecided, define root `dev` for a documented
primary development workflow. Select a bounded useful set; several related parts
can form one workflow. Each runnable app also needs an independently selectable
command. Use `dev:<part>` for new root command names when naming is undecided;
retain established names. Do not add a dev server to a library or one-shot CLI.

Illustrative package scripts and dispatcher, after defining the app's fixture
config and installed commands:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

```toml
[tasks."web:test"]
run = "pnpm --filter @repo/web run test"

[tasks."api:test"]
run = "go test ./..."
dir = "apps/api"
```

Illustrative root dispatch for two JS apps whose owning packages define `dev`:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel --filter @repo/web --filter @repo/api run dev",
    "dev:web": "pnpm --filter @repo/web run dev",
    "dev:api": "pnpm --filter @repo/api run dev"
  }
}
```

For a mixed repo with a Go module in `apps/api` and a JS web package:

```toml
[tasks.dev]
depends = ["dev:web", "dev:api"]

[tasks."dev:web"]
run = "pnpm --filter @repo/web run dev"

[tasks."dev:api"]
run = "go run ./cmd/api"
dir = "apps/api"
```

Select one part with `pnpm run dev:web` or `mise run dev:web`. Select multiple
parts with repeated pnpm filters as above or `mise run dev:web ::: dev:api`.
pnpm `--parallel` skips dependency ordering: complete required build/setup first.
mise prerequisites wait for completion, not server readiness; do not make the web
task depend on a foreground API task that never completes. Explicitly handle
readiness where required and allow enough parallel jobs for the selected processes.

**Exception:** a static frontend has no mandatory production `start`; a library
needs no dev server. Preserve established compatible task aliases rather than
breaking callers purely for naming. Use `preview` for Vite built-site inspection.

**Verify:** list available tasks, inspect delegated commands, and run affected
finite checks. Check forwarded args, failure exits, signals, and production build
behavior when changed. Within authorized isolated validation, check documented
single/combined starts, readiness, interruption, and cleanup. Audits report runs
not executed. Do not add dummy scripts to make aggregate checks green.

## `tool-development-docs`

**Apply:** documenting or auditing development runs within the requested scope.

**Problematic:** root `dev` has undocumented dependencies; individual app commands
are missing; competing guides drift; setup instructions bury commands in architecture.

**Prefer:** where doc location is undecided, use `docs/development.md` and link it
from README. Keep one canonical guide, updated with changed commands. Briefly cover:

- Prerequisites and setup; state the working directory.
- What root `dev` starts and commands for one part or selected combinations.
- Required dependencies or fixture modes; relevant config and URLs/ports.
- Scenario selection, data preparation, seed repeat semantics, and safe reset scope
  where applicable; see [test data and setup](test-data-and-setup.md).
- Shutdown and cleanup, including mutable development state where applicable.

Use a small purpose/command table and short action-focused steps. Include only
details needed to run the relevant parts; link architecture and full configuration
reference elsewhere. Brevity must preserve prerequisites and lifecycle instructions.

**Exception:** update an existing canonical development guide in its established
location instead of duplicating it. Libraries and one-shot CLIs document applicable
checks/sample runs rather than inventing a long-lived `dev` capability.

**Verify:** match documented commands to scripts/tasks and their actual dependencies.
Within authorized isolated validation, follow setup and relevant single/combined runs;
verify expected endpoints, shutdown, and cleanup. Report unexecuted runs honestly.

## `tool-task-graph`

**Apply:** prerequisites, affected-target checks, or build caching.

**Problematic:** migration and seed are unordered sibling prerequisites; a shared
API change tests only its dependencies; a live DB seed is treated as a cached build.

**Prefer:** when provisioning fixture state, express migration → seed → start as
actual sequential steps/dependencies; normal reload must not implicitly reset data.
mise prerequisite arrays may run in parallel; their order is not a sequence.
Package task logic stays with its owner. Select affected consumers for shared
changes; pnpm's `...package` selects dependents whereas `package...` selects
dependencies. Use the installed orchestrator's effective graph where present.

Cache only work whose result is determined by declared inputs. Include config,
relevant env, lockfiles, contract/generator inputs, and outputs. Do not cache a
dev server, migration, seed, or externally stateful check as a pure build.

**Exception:** no graph platform is needed for a small repo. Pure tests can be
cached when inputs and reproducibility are explicit; not all tests are stateful.

**Verify:** inspect ordering/effective targets and affected consumer selection.
Change an important build input and confirm invalidation. Confirm fixture reset
and integration checks actually execute rather than replaying irrelevant results.

## `tool-generated-artifacts`

**Apply:** checked-in clients, validators, embedded schema copies, or built assets.

**Problematic:** a check overwrites a stale generated file and then compares it
with its own replacement; obsolete hashed assets or mock workers ship in a binary.

**Prefer:** give each derivative one authoritative input, pinned/reproducible
generation path, and documented owner. Separate mutation (`generate`/stage) from
verification. Regenerate into temporary output and compare with committed outputs,
or regenerate and explicitly check Git changes, including additions/deletions.
Run drift verification before another task can overwrite its comparison target.
An asset check should compare the complete intended file set and contents.

Guard replacement/reset tools with a controlled destination contract. Remove
obsolete output only there, exclude development-only assets deliberately, and
keep inputs intact. Typecheck directly executed TypeScript tooling separately;
runtime type stripping is not a compiler check.

**Exception:** uncommitted artifacts need no committed-output comparison, but the
build must still produce the correct release inputs. Tools that cannot redirect
output can use an isolated checkout or an explicit Git-diff verification path.

**Verify:** change an input without regenerating and confirm failure; add a stale
extra output and confirm detection. Check failure cleanup, destination rejection,
and production inclusion/exclusion. Report whether a check writes scratch/build
output, tracked files, or runtime state; a `check` label proves none of these.

## Sources

- [pnpm workspaces](https://pnpm.io/workspaces)
- [pnpm catalogs](https://pnpm.io/catalogs)
- [pnpm filtering](https://pnpm.io/filtering)
- [pnpm script execution and parallel runs](https://pnpm.io/cli/run)
- [mise configuration](https://mise.jdx.dev/configuration.html)
- [mise task semantics](https://mise.jdx.dev/tasks/)
- [mise multiple-task execution](https://mise.jdx.dev/tasks/running-tasks.html)
- [mise task dependencies](https://mise.jdx.dev/tasks/task-configuration.html)
- [mise monorepo features](https://mise.jdx.dev/tasks/monorepo.html)
- [Go workspace guidance](https://go.dev/ref/mod#workspaces)
- [Vite production vs preview](https://vite.dev/guide/static-deploy.html)
- [Turborepo installed-version documentation routing](https://github.com/vercel/turborepo/blob/main/skills/turborepo/SKILL.md)
- [Tokeninsights temporary API generation check](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/tools/build/src/check-api.ts)
- [Tokeninsights asset comparison](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/tools/build/src/check-web.ts)
- [Servediff distribution drift check](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/.github/workflows/ci.yml)
- [Servediff development commands and managed fixture server](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/docs/development.md)
- [Tokeninsights individual and combined development runs](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/development.md)
- [Diátaxis goal-oriented how-to guides](https://diataxis.fr/how-to-guides/)
- [Google concise procedures](https://developers.google.com/style/procedures)

Tool choices, task names, and doc location are conditional skill fallbacks,
not ecosystem requirements.
