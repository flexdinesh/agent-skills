# Go and Node correctness

Read for language/runtime failures related to boundaries, lifecycle, I/O, and
async behavior. Apply platform-specific rules only where supported.

## `go-consumer-contracts`

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

## `js-input-contracts`

**Apply:** TypeScript/JS consumes env, JSON, request payloads, files, or remote data.

**Problematic:** a generated static type is treated as JSON validation; missing
env is trusted; loose dictionaries hide malformed values or missing fields.

**Prefer:** parse untrusted input once at the I/O boundary with the installed
schema/parser facility; pass validated domain contracts into application code.
Use strict TypeScript and explicit narrowing. No `any`, type assertions, or
non-null assertions. Consider indexed-access and exact-optional settings in the
repo's migration context. Define missing/null/default distinctions explicitly.
Represent mutually exclusive outcomes with a discriminated union, for example:

```ts
type ImportResult =
  | { readonly kind: "imported"; readonly count: number }
  | { readonly kind: "rejected"; readonly reason: string };

function describeImport(result: ImportResult): string {
  if (result.kind === "rejected") {
    return result.reason;
  }
  return `${result.count} records imported`;
}
```

**Exception:** a parser boundary can accept `unknown` until it establishes evidence;
do not replace it with a fabricated domain type. TS-only improvements do not require
an unrequested wholesale JS-to-TS migration. Apply runtime parsing to JS too.

**Verify:** malformed/missing/extra values as appropriate, invalid env, nullability,
and incompatible remote responses. Run installed type checks without escape hatches.

## `node-async-lifecycle`

**Apply:** Node servers/workers, async CLI operations, streams, or remote calls.

**Problematic:** one unbounded `Promise.all` launches work for every input record;
errors disappear; synchronous request-path work blocks unrelated clients; shutdown
exits while writes remain pending.

**Prefer:** own awaited work and rejection handling; bound fan-out, input sizes,
queue depth, and expensive operations. Use cancellation/deadlines supported by
the actual client API, not merely an unused AbortSignal. Respect stream backpressure.
Define shutdown/drain behavior for servers, workers, timers, and pools. Separate
retryable failures from permanent failures and make retry-sensitive mutations safe.

**Exception:** synchronous startup or small one-shot file operations can be fine.
Parallel independent operations are useful within a bounded workload; do not force
serial execution. Framework error/shutdown hooks can satisfy ownership.

**Verify:** rejection, timeout, partial failure, overload, interruption, and cleanup.
Check that bounded processing limits simultaneous work and gives honest results;
avoid swallowing failed records while reporting total success.

## `web-state-boundaries`

**Apply:** React/web behavior spans route, component, cache, or async ownership.

**Problematic:** duplicate server state is copied into local state by effects;
late responses overwrite current results; fixture handling lives in components;
failure leaves the user unable to retry or preserve edits.

**Prefer:** one owner per state lifetime; use existing URL/router/cache facilities
for their responsibilities. Derive redundant values, use effects for external
synchronization, and guard stale responses. Keep fixture behavior at HTTP/composition
boundaries. Place recovery where the user can act without losing unrelated work.

**Exception:** legitimate effects and ordinary local state are not defects.
SSR, hydration, file routing, and client/server APIs depend on the installed
framework. Preserve those conventions when changing ownership.

**Verify:** route changes, stale responses, failed loads/mutations, retry, edit
preservation, and relevant SSR/build behavior. Detailed component/state policies
belong to `react-patterns` when invoked, not a second conflicting rulebook.

## Sources

- [Go code review comments](https://go.dev/wiki/CodeReviewComments)
- [Uber Go guide](https://github.com/uber-go/guide/blob/master/style.md)
- [Google Go decisions](https://google.github.io/styleguide/go/decisions)
- [Go cancellation](https://go.dev/doc/database/cancel-operations)
- [Go race detector](https://go.dev/doc/articles/race_detector)
- [TypeScript strict mode](https://www.typescriptlang.org/tsconfig/strict.html)
- [Indexed access](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
- [Optional property semantics](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [Node event-loop guidance](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node cancellation APIs](https://nodejs.org/api/globals.html#class-abortcontroller)
- [React effects and async races](https://react.dev/learn/you-might-not-need-an-effect)

The assertion ban is skill policy. Organizational style guides inform choices;
they are not Go language requirements.
