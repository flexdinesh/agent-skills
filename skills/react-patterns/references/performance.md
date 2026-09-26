# Performance

Read during writing, auditing, and conforming. Performance is included by default;
an optimization still needs a concrete mechanism and proportionate complexity.

Prioritize avoidable network waits and large client payloads, then subscription
scope and expensive rendering. Distinguish a supported cost from an unmeasured
hypothesis. Use profiling/network/bundle evidence for magnitude claims.

## `perf-subscription-scope`

**Apply:** frequently changing data updates a broad owner or subscription.

**Problematic:** typing in one field updates a root context containing unrelated
account/theme state. A store consumer subscribes to all records but renders only
a selected flag. A provider recreates its value during unrelated parent renders.

**Prefer:** put interaction state near its consumers; split independent contexts
by domain/update behavior where useful. Use existing stores' narrow selectors and
supported equality contracts. Provide a store instance through context when the
store's subscription model is the established owner.

React context subscribes to the whole value. Returning only `context.text` from
a wrapper hook does not create selective subscriptions. `memo` does not block a
context update consumed by that component. Separate state/actions contexts can
help action-only consumers only when action value identity is actually stable.

**Exception:** a small low-frequency context is usually fine. Changing `value`
identity causes work, not automatically a bug. Memoize value/functions only when
the consumers and update pattern justify it; do not force a new state library.

**Verify:** profile the triggering interaction and identify which subscriptions
actually cause costly work. Check that narrowed consumers still update correctly.

## `perf-memoization`

**Apply:** expensive calculations or identity-sensitive boundaries repeat work.

**Problematic:** `useMemo` wraps trivial arithmetic; every handler uses
`useCallback` without an identity-sensitive consumer; a custom `memo` comparator
ignores a changed callback and preserves its stale closure.

**Prefer:** establish the expensive work or relevant identity boundary first.
Use `memo`, `useMemo`, or `useCallback` with complete dependencies when they avoid
that cost. Keep correctness independent of retained memo caches. Inspect whether
React Compiler is enabled and compatible before adding manual memoization.

**Exception:** stable identity can matter to a subscription or third-party API
even without a slow render. Inline functions, arrays, and objects are otherwise
ordinary code. Preserve intentional existing memoization unless evidence supports
changing it; do not strip it simply because a compiler is configured.

**Verify:** profile before/after when claiming a gain; test changed props,
callbacks, and dependencies for current behavior. Avoid brittle render-count tests.

## `perf-waterfalls`

**Apply:** multiple async operations determine page/feature readiness.

**Problematic:** a child starts fetching only after a parent's fetch renders it;
independent requests are awaited sequentially; each component fetches identical
data into its own local cache.

**Prefer:** loaders/server boundaries or the existing query cache own fetching.
Start independent operations together; await only where required; preload or
deduplicate through the installed library. Keep real dependencies sequential.

```ts
interface Order {
  id: string
}
interface Account {
  id: string
}
interface PageReader {
  readOrders: () => Promise<readonly Order[]>
  readAccount: () => Promise<Account>
}

export async function readOrdersPage(reader: PageReader) {
  // Independent reads; rejection belongs to the calling loader/query boundary.
  const [orders, account] = await Promise.all([
    reader.readOrders(),
    reader.readAccount(),
  ])
  return { orders, account }
}
```

**Exception:** one operation may require the other's result or authorization.
`Promise.all` is fail-fast and does not cancel siblings. Use separate boundaries
or `allSettled` when partial success is meaningful; handle every rejected result.
Do not launch mutations in parallel just because reads can be parallelized.

**Verify:** inspect request start times and readiness paths; simulate rejection
and partial failure. Do not invent a speedup from changed syntax alone.

## `perf-bundle-boundaries`

**Apply:** heavy dependencies, routes, or server-owned work reach the client.

**Problematic:** a rarely opened editor is loaded with every page; a broad import
pulls server-only code or a large package into a client boundary; a boundary move
serializes a much larger dataset.

**Prefer:** supported route splitting or lazy loading for genuinely heavy optional
UI; clear server/client imports; small serializable inputs across server/client
boundaries. Inspect actual bundler output before restructuring package imports.
Preload likely navigation when supported without defeating deferred loading.

**Exception:** eager loading can be appropriate for immediately needed content.
Barrel imports are not universally a problem; consider tree shaking and package
behavior. Do not use Next.js-specific APIs in other frameworks or mechanically
replace established lazy-route conventions.

**Verify:** build and inspect emitted chunks, client imports, and initial network
requests. Check lazy-loading failure/retry and direct navigation.

## `perf-expensive-rendering`

**Apply:** filtering, sorting, parsing, charts, or large lists cost enough to
affect an interaction.

**Problematic:** costly initial data is recomputed on every render; thousands of
rows mount for a small viewport; moving state to the root makes each keystroke
rerender a large unrelated tree.

**Prefer:** cheap pure derivation first, then lazy initialization for costly
initial state, justified memoization, narrower state boundaries, supported
virtualization, or version-supported deferred rendering when evidence warrants
it. Preserve accessible list navigation, focus, and screen-reader semantics.

**Exception:** defer only work that can lag. A controlled input's own value must
update promptly. Transitions/deferred values change scheduling, not request
debouncing; they do not eliminate computation or make arbitrary async pending
flags unnecessary. Lazy initializers must be pure and SSR-compatible.

**Verify:** measure the relevant interaction under representative data; check
typing responsiveness, latest results, focus, and scrolling. Generic JavaScript
micro-optimizations need measured cost, not merely a preferred loop style.

## Sources

- [Vercel: React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md)
- [React: useContext](https://react.dev/reference/react/useContext)
- [React: memo](https://react.dev/reference/react/memo)
- [React: useMemo](https://react.dev/reference/react/useMemo)
- [React: useState](https://react.dev/reference/react/useState)
- [React: useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [React: Profiler](https://react.dev/reference/react/Profiler)
- [React: lazy](https://react.dev/reference/react/lazy)
