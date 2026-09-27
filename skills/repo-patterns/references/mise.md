# mise tools and tasks

**Read when:** mise is established or selected for runtime pins and development/CI task dispatch.

**Policy status:** mise-specific implementation of tooling policies; no automatic mise requirement for JS-only projects.

## Tool and task ownership

When tool choice is unresolved, use the shared
[tooling fallback matrix](tooling-and-commands.md#tool-stack-defaults).
mise manages tool/runtime versions and tasks, not JS libraries; it can pin
Node/pnpm binaries. Keep actual JS commands in package scripts and Go dependencies
in native modules. Root mise tasks delegate; avoid duplicating package logic.

Illustrative finite dispatch:

```toml
[tasks."web:test"]
run = "pnpm --filter @repo/web run test"

[tasks."api:test"]
run = "go test ./..."
dir = "apps/api"
```

For a mixed repo with a Go module at `apps/api` and a JS web package:

```toml
[tasks.dev]
depends = ["dev:web", "dev:api"]

[tasks."dev:web"]
run = "pnpm --filter @repo/web run dev"

[tasks."dev:api"]
run = "go run ./cmd/api"
dir = "apps/api"
```

Select one part with `mise run dev:web`, or multiple parts with
`mise run dev:web ::: dev:api`. Preserve established task names.

## Task ordering and readiness

Prerequisite arrays can run in parallel; array order is not a sequence.
Express migrate → seed → start as actual ordered dependencies/steps.
Prerequisites wait for task completion, not server readiness; never make a web
task wait for a foreground API task that does not complete. Own readiness checks
and cleanup explicitly and permit enough parallel jobs for selected processes.
`mise run` is dispatch syntax, not a requirement for packages to define `run`.

Use [task graph guidance](tooling-and-commands.md#tool-task-graph) when changing
ordering/cache behavior. Verify installed mise APIs before adopting newer
monorepo inference features.

## Sources

- [mise configuration](https://mise.jdx.dev/configuration.html)
- [mise task semantics](https://mise.jdx.dev/tasks/)
- [mise multiple-task execution](https://mise.jdx.dev/tasks/running-tasks.html)
- [mise task dependencies](https://mise.jdx.dev/tasks/task-configuration.html)
- [mise monorepo features](https://mise.jdx.dev/tasks/monorepo.html)
