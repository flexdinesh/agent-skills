# CLI organisation and ownership

**Read when:** changing CLI commands, local setup, streams, exits, or product ownership.

**Policy status:** Command and ownership policies; trees and parser choices are illustrative. Publication is routed separately.

## `organisation-cli`

**Keep commands testable.**

**Apply:** Go or Node/TS command-line applications and subcommands.

**Problematic:** importing a command opens a live DB; domain helpers call process
exit; progress messages corrupt JSON output or a pipe.

**Prefer:** keep the executable root focused on command assembly, config/dependency
composition, signals, cleanup, and exit status. Commands own args/flags, validation,
and presentation; feature operations own behavior. Pass streams, cancellation,
and relevant dependencies explicitly so tests can run without a terminal/live store.
Keep machine-readable results on stdout and diagnostics on stderr; prompts and
terminal formatting belong to presentation, with deliberate noninteractive behavior.
Help/version and invalid arguments should not initialize unrelated live resources.
For one-shot Node commands, set `process.exitCode` and close owned resources so
output can flush before natural exit, rather than terminating inside domain helpers.

Illustrative Go command with an export feature:

```text
cmd/tool/main.go                 # compose and exit
internal/cli/export.go           # flags and presentation
internal/export/export.go        # operation and needed contracts
internal/export/export_test.go
internal/export/sqlstore.go      # storage adapter, if needed
```

In TS, the same responsibilities can live in `src/main.ts`, `src/commands/export.ts`,
and a feature module; no workspace or class hierarchy is implied.
For native TS execution read [Node](node.md). When packaging changes, read
[Go distribution](go-cli-distribution.md) or
[Node distribution](node-cli-distribution.md). Publication changes use
[CI releases](ci-releases.md), plus [Go channels](go-ci-releases.md) for Go.

**Exception:** a small file-transforming CLI may need only `main` and one testable
function. An independently deployed service client legitimately uses its API.

**Verify:** representative command success/failure, help without live resources,
config precedence, captured stdout/stderr, piped/noninteractive behavior, exit
status, interruption, and cleanup as applicable.

## `cli-release-ownership`

**Identify installable and released units.**

**Apply:** choosing CLI ownership, layout, dependencies, or release units.

**Problematic:** each executable gains a module solely to match a folder tree;
private web/build packages acquire product versions or are published accidentally.

**Prefer:** distinguish code owner, Go module/JS package, executable, product,
and independently released consumer. Use the smallest native structure. Multiple
binaries can share one cohesive Go module; separate modules need actual dependency
or release ownership. A CLI and private embedded UI can be one product. Independently
consumed tools can have separate versions without independent repositories.

| Case | Useful starting point | Release/install identity |
| --- | --- | --- |
| Go, separate repo | `go.mod`, applicable `go.sum`, root `main.go` or `cmd/tool`, focused `internal/` | Module tags and supported command install path |
| Go, monorepo | Command within an existing cohesive module, or an intentionally nested module | Actual module root determines Go version tags |
| TS/Node, separate repo | One package, native TS entry point, typecheck/tests, lockfile | Declared runtime and supported install channel |
| TS/Node, monorepo | One owning workspace package; private root/tools; declared dependencies | Package/product identity and independently installable output |

Keep parser conventions; standard parsing may suffice for a tiny command. Command
trees can justify Cobra or Commander; plugin needs can justify oclif. No mandatory
generator, config framework, package per command, or public library extraction.
Private Go task-adapter manifests are not npm products. Retain supported scripts,
GoReleaser, and native packaging; add tooling only for demonstrated maintenance needs.

**Exception:** real consumers can justify a public library or coordinated release
group. Directory names and executable count alone establish neither.

**Verify:** identify the released units, runtime consumers, public surfaces, and
supported installs. Check the consumer dependency graph outside workspace shortcuts.
Do not add a release framework merely because the repo has several packages.

## Sources

- [CLI streams, signals, and noninteractive conventions](https://clig.dev/)
- [Node exit status and output flushing](https://nodejs.org/api/process.html#processexitcode)
- [Go module layout](https://go.dev/doc/modules/layout)
