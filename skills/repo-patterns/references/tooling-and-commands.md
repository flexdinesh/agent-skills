# Tooling and commands

Read when selecting tools, organizing manifests, or defining local/CI commands.
Examples are conventions to implement, not commands guaranteed in an arbitrary repo.

## `tool-stack-defaults`

**Apply:** a new project needs a stack or an existing project has tooling drift.

**Problematic:** a healthy supported npm/Next.js application is reported as broken
because the preferred stack is pnpm/Vite; Go projects acquire fake Node manifests.

**Prefer:** for new work, Go or Node/TypeScript servers, Vite/React frontend, pnpm
for JS dependencies/scripts, mise for tool/runtime versions and cross-language
dispatch. Follow explicit repo requirements. Keep supported existing tools unless
their migration is requested. mise can pin Node/pnpm binaries too; pnpm owns JS
libraries. Pin a supported version policy in one authoritative configuration and
keep local/CI resolution consistent.

**Exception:** product/platform needs can justify another stack. Retain an existing
build orchestrator when it serves the repo. Verify APIs for installed versions;
newer monorepo inference features may be unavailable or experimental.

**Verify:** resolve versions from manifests/config and compare actual local/CI
commands. Report preference differences separately from failures.

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
root `dev` starts every service; Vite preview is deployed as a production server.

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

Keep actual JS commands in package scripts; mise/root tasks delegate. Go tasks
invoke native commands. Provide bounded target selection and document cwd, args,
dependencies, readiness, shutdown, and exit behavior. `mise run`/`pnpm run` is
dispatch syntax, not a requirement for every package to define a `run` script.

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

**Exception:** a static frontend has no mandatory production `start`; a library
needs no dev server. Preserve established compatible task aliases rather than
breaking callers purely for naming. Use `preview` for Vite built-site inspection.

**Verify:** list available tasks, inspect delegated commands, and run affected
finite checks. Check forwarded args, failure exits, signals, and production build
behavior when changed. Do not add dummy scripts to make aggregate checks green.

## `tool-task-graph`

**Apply:** prerequisites, affected-target checks, or build caching.

**Problematic:** migration and seed are unordered sibling prerequisites; a shared
API change tests only its dependencies; a live DB seed is treated as a cached build.

**Prefer:** express migration → seed → start as actual sequential steps/dependencies.
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

## Sources

- [pnpm workspaces](https://pnpm.io/workspaces)
- [pnpm catalogs](https://pnpm.io/catalogs)
- [pnpm filtering](https://pnpm.io/filtering)
- [mise configuration](https://mise.jdx.dev/configuration.html)
- [mise task semantics](https://mise.jdx.dev/tasks/)
- [mise monorepo features](https://mise.jdx.dev/tasks/monorepo.html)
- [Go workspace guidance](https://go.dev/ref/mod#workspaces)
- [Vite production vs preview](https://vite.dev/guide/static-deploy.html)
- [Turborepo installed-version documentation routing](https://github.com/vercel/turborepo/blob/main/skills/turborepo/SKILL.md)

Preferred stack and task names are skill defaults, not ecosystem requirements.
