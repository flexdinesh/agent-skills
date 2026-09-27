# Go modules and correctness

**Read when:** changing Go code, module/package boundaries, errors, resources, or concurrency.

**Policy status:** Go semantics and contextual skill policies. Native layout and naming examples are defaults.

## Module and package layout

Favor one module for cohesive Go code; separate modules only for justified
dependency/release ownership. Multiple binaries alone do not require modules.
A small library/command can live at the module root. A larger cohesive product
can use `cmd/api`, `cmd/worker`, and `cmd/tool` with bounded `internal/` packages.

Choose module roots separately from a mixed repo's `apps/`/`packages/` tree.
Keep dependencies in the actual Go module; a JS manifest may dispatch native Go
tasks without owning Go dependencies. Multi-module workspaces support local
development. Distributed modules must work with declared dependencies and
`GOWORK=off` in the appropriate module directory. Decide whether committing
`go.work` fits the release model; neither choice is universal.

Appropriately nested `internal/` packages restrict imports. Root `internal/`
restricts outside imports but does not isolate sibling domains. Use focused
checks when enforcing additional dependency direction.

Go files within a feature can share one package; creating another file need not
create another package/module. Colocate `_test.go` files. Use separate packages
when compile-time dependency isolation is required.

When installation changes, read [Go distribution](go-cli-distribution.md).
For ownership/import restructuring, read [architecture](architecture.md).

## Naming defaults

Where conventions are unresolved, use export-aware `MixedCaps`/`mixedCaps`,
consistent initialisms (`customerID`), and short lowercase package names.
Read qualified names at call sites; avoid repeating package context.
Go getters ordinarily omit `Get`; do not impose JS constant casing or getter
prefixes. Organizational style guides inform choices, not language requirements.

## `go-consumer-contracts`

**Keep interfaces consumer-owned.**

**Apply:** a Go dependency seam, public API, or proposed abstraction.

**Problematic:** every concrete store exports a large interface solely for mock
generation; callers depend on methods they never use.

**Prefer:** ordinary concrete types unless a caller needs substitution. Define
narrow interfaces at the consuming boundary, using meaningful operations.
For example, an order workflow might consume `Load` and `Save` without requiring
an implementor's entire reporting/query API. Keep transaction semantics clear;
generic CRUD methods can obscure atomic domain operations.

**Exception:** an existing public/framework contract can own an interface.
Interfaces can be justified by genuine multiple implementations or consumer needs;
do not introduce them before a realistic use.

**Verify:** consumer tests exercise the real contract; changing an unrelated
implementation method does not force consumer changes. Check exported surface
and ensure fakes represent consumed semantics rather than implementation calls.

## `go-error-resource-ownership`

**Own errors and resource cleanup.**

**Apply:** Go I/O, resource construction, or error translation.

**Problematic:** failed reads return empty success; expected errors panic;
import-time setup opens global connections; wrapped errors are compared by text.

**Prefer:** return/handle meaningful errors, wrap context while preserving identity,
and inspect with `errors.Is`/`errors.As`. Construct clients/stores explicitly.
Assign cleanup to the resource owner; close HTTP bodies and result rows, inspect
iteration errors, and handle failed commits. Keep process exit at entry points.
Avoid double logging every propagated error and exposing internal details to HTTP.

**Exception:** documented best-effort cleanup may tolerate an error where it cannot
change the result. Initialization of static values or framework registration can
be legitimate; mutable network side effects need lifecycle ownership.

**Verify:** simulate read/write/commit failures and observe the public result,
resource cleanup, and appropriate error translation. Check imports need no live
credentials. Add a regression test for concrete risk, not every cleanup line.

## `go-concurrency-lifecycle`

**Own cancellation and background work.**

**Apply:** goroutines, request cancellation, timeouts, or background workers.

**Problematic:** a goroutine survives shutdown, blocks on a send after its consumer
exits, or discards the request context before accessing the database.

**Prefer:** an owner starts, cancels, and joins background work. Propagate context
to I/O, bound concurrency, and select cancellation where a channel operation can
otherwise block. Define channel closing ownership. Give server/request work
appropriate deadlines and body limits; distinguish stopping admission from draining
in-flight work. Detached jobs need their own deliberate durable/runtime lifecycle.

**Exception:** a request context is not the right lifetime for a job intended to
outlive the request. Older Go versions may need different loop-variable/context
patterns; check the module/toolchain rather than copying stale recipes.

**Verify:** cancellation before/during I/O, abandoned consumers, worker failure,
and shutdown. Use `go test -race` for relevant exercised concurrency on supported
platforms; a passing race run does not establish unexecuted paths are safe.

## Sources

- [Go code review comments](https://go.dev/wiki/CodeReviewComments)
- [Uber Go guide](https://github.com/uber-go/guide/blob/master/style.md)
- [Google Go decisions](https://google.github.io/styleguide/go/decisions)
- [Go cancellation](https://go.dev/doc/database/cancel-operations)
- [Go race detector](https://go.dev/doc/articles/race_detector)
- [Go module layouts](https://go.dev/doc/modules/layout)
- [Go workspaces and dependency overrides](https://go.dev/ref/mod#workspaces)
- [Effective Go names, getters, and interfaces](https://go.dev/doc/effective_go#names)
- [Go initialisms](https://go.dev/wiki/CodeReviewComments#initialisms)
- [Go package names and qualified context](https://go.dev/blog/package-names)
