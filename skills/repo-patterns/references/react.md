# React behavior and composition

**Read when:** writing, auditing, or conforming React components, Hooks, providers, state, effects, forms, async recovery, SSR, performance, or UI tests.

**Policy status:** React runtime requirements plus scoped ownership, composition, and verification policies synthesized from react-patterns. Folder layout, reducer preference, and API naming defaults are choices, not universal standards. Framework-neutral; preserve repository conventions and supported libraries.

## Inspect the installed stack

Identify React/platform versions, framework/router, cache/store/form owners,
Compiler configuration, lint rules, and test harness before choosing APIs.
React 19 provider shorthand, ref-as-prop, Actions, `use`, and Effect Events have
version-specific contracts; do not upgrade React or rewrite working React 18
APIs solely to match newer examples. DOM guidance needs platform equivalents
in React Native. A component library need not acquire routes or an app shell.

Use [Web](web-react-vite.md) for browser-safe imports, Vite configuration, API
adapters, and cache/source identity; [TypeScript](typescript.md) for changed
types or untrusted input; [Naming](naming.md) for vocabulary and compatible
renames. Read these only when their contracts are affected. This reference is
self-contained for React decisions; no companion installation is required.

## Contents

- [Cohesive components and explicit contracts](#react-component-contracts)
- [Minimal state and deliberate drafts](#react-state-ownership)
- [Scoped providers and flexible composition](#react-provider-composition)
- [External synchronization and cleanup](#react-effects-lifecycle)
- [Pure rendering and stable identity](#react-render-identity)
- [Input ownership and accessible interaction](#react-input-accessibility)
- [Async failure, races, and actual recovery](#react-async-recovery)
- [SSR, hydration, and request isolation](#react-ssr-boundaries)
- [Performance from concrete mechanisms](#react-performance)
- [Verify public behavior](#react-behavior-verification)

## `react-component-contracts`

**Compose cohesive components.**

**Apply:** designing component APIs/names, extracting boundaries, or reviewing
mixed responsibilities and contradictory public modes.

**Problematic:** a page owns an unrelated account draft, a live order connection,
and table presentation; moving everything into `usePageEverything` preserves the
coupling. Shared UI imports a page provider. Mode flags permit invalid combinations.

**Prefer:** pages/routes compose features; feature internals stay with their owner,
shared primitives serve actual consumers. Extract components by purpose, Hooks by
cohesive stateful behavior, and ordinary functions for pure calculations. Small
cohesive code can stay inline. Follow framework route and Fast Refresh conventions.
Use explicit variants or children composition when modes conflict; use compound
components when callers need flexible arrangement of related stateful pieces.

Capitalize component identifiers; custom Hooks start with `use` plus a capitalized
purpose. Keep domain vocabulary consistent. Where local conventions are absent,
callback props use `on...`, local handlers `handle...`, and actions intent verbs;
distinguish a save request (`onSave`) from completion (`onSaved`). Name initial-only
inputs `initial...`/`default...`. Filenames follow repository/framework discovery.

**Exception:** long markup is not evidence of mixed ownership. Ordinary booleans
such as `disabled`, `required`, and `open` are valid. Render props are useful for
runtime data. Controlled props are valid ownership, and a small route may contain
its whole page. Do not force providers, one Hook per component, or a folder template.

**Verify:** trace inputs, actions, state lifetimes, imports, and affected consumers.
Invalid modes are excluded or handled; moving code preserves navigation and edits.
File size, prop depth, and Hook count alone establish no finding.

## `react-state-ownership`

**Keep one owner per state lifetime.**

**Apply:** choosing local/shared state, derived values, drafts, or update machinery.

**Problematic:** cached records are copied into context and component state;
effects maintain counts/filter results; refetch erases dirty edits; unrelated
booleans permit simultaneous saving/saved/error states.

**Prefer:** existing loaders/caches own remote data, URL/router facilities own
navigable state, and transient UI state stays near its consumers. Store selection
identity and derive the current record. Calculate redundant values during render:

```tsx
interface Order {
  id: string
  status: 'open' | 'closed'
}

export function OrderSummary({ orders }: { orders: readonly Order[] }) {
  const openCount = orders.filter(order => order.status === 'open').length
  return <p>{openCount} open orders</p>
}
```

Use functional updates when depending on previous state; never mutate prior state
or cache data. Group fields that must change together; use a status union when
outcomes are mutually exclusive. Encapsulate cohesive behavior in domain Hooks
with named actions. Repeated stateful Hook calls create independent owners.
Refs hold resource handles or non-rendered values, not displayed status.

Prefer local state/domain Hooks for simple behavior. Reducer avoidance is a soft
companion policy: justified reducers are valid, especially for complex transitions.
Preserve existing reducers unless the user accepts a concrete conversion proposal;
explain retain/replace tradeoffs and preserve invariants in any accepted conversion.
Do not hide a dispatch switch in a Hook merely to change the API name.

**Exception:** editable drafts and historical snapshots intentionally diverge.
Specify initialization, dirty/refetch behavior, submission snapshot, cancellation,
and reset; incoming data must not silently discard newer edits. Independent fields
need not be combined. Expensive derivation can justify memoization, not another owner.

**Verify:** navigation, refetch, removed selection, rapid/queued updates, and reset
follow the contract. Distinguish deliberate draft divergence from duplicated state.
Reducer usage alone is neither a correctness defect nor a high-severity finding.

## `react-provider-composition`

**Scope shared behavior to its consumers.**

**Apply:** distant consumers need one state instance, or reusable stateful pieces
need custom layout and sibling access.

**Problematic:** app state passes through unused intermediaries; one root context
owns every page draft; separate hook calls expect shared state; a required context
silently returns dummy actions outside its provider.

**Prefer:** compose app-domain providers near the root and page/feature providers
at their useful common boundary. Keep dependent providers below their dependencies.
Use existing cache/router/form/store owners rather than copying their state into
context. A provider can supply an external store instance whose supported selector
Hooks subscribe to data. Keep state implementation behind typed domain actions.

For required context, use a nullable default and a named consumer Hook that narrows
explicitly and throws a clear missing-provider error; no assertions or dummy state.
When useful, separate the provider's shared behavior from visual containment so
sibling controls/previews can compose around one owner. Instantiate behavior per
provider; keep identity stable. Portals retain context; separate React roots do not.

**Exception:** ordinary props and children composition remain valid. Prop depth
alone proves nothing. Meaningful optional context defaults are valid. Simple
stateless components need no provider; small contexts need no mandatory memoization
or state/actions/meta wrappers. Keep working store libraries and controlled APIs.

**Verify:** actual consumers share intended updates; editing instance A leaves B
unchanged; nesting uses the intended nearest owner; missing required providers fail
clearly. Moving visual boundaries does not lose state or accessible relationships.

## `react-effects-lifecycle`

**Synchronize external systems deliberately.**

**Apply:** effects, subscriptions, timers, browser widgets, or manual async setup.

**Problematic:** a `submitted` flag triggers saving in an effect; suppressed
dependencies retain stale values; changing unrelated objects reconnects a socket;
listeners accumulate; a ref skips setup after Strict Mode cleanup removed a resource.

**Prefer:** name the external system and setup/teardown conditions. Handle user
actions in handlers/domain actions; derive render values directly. Include reactive
dependencies, split independent processes, and move effect-only allocations inside
the effect when that removes unnecessary identity dependencies. Cleanup mirrors
setup: disconnect, unsubscribe, clear timers, and cancel or ignore obsolete work.

Use installed external-store adapters or compatible `useSyncExternalStore` rather
than effect-copying snapshots; follow its stable snapshot and server snapshot
contracts. Effects do not run during SSR. Use layout effects only for necessary
pre-paint work. Version-supported Effect Events serve non-reactive effect logic,
not hidden dependencies that should restart synchronization.

**Exception:** legitimate effects can update state, including fetched results and
layout measurements. Autosave is external synchronization with explicit debounce,
draft-version, race, and recovery semantics. An empty dependency list does not
promise a single invocation; a resource with a separate owner may outlive a component.

**Verify:** dependency changes use current values; setup -> cleanup -> setup leaves
one active resource per owner; unmount releases it. Run installed compatible Hooks
lint. Strict Mode replay itself is not a production bug; do not disable it to mask
missing cleanup or suppress lint to conceal ownership problems.

## `react-render-identity`

**Preserve pure rendering and intended identity.**

**Apply:** components/Hooks, updater functions, stateful subtrees, and data lists.

**Problematic:** render issues a request or sorts shared data in place; a Hook
follows a conditional return; a nested component definition remounts an input;
random/index keys attach drafts to the wrong records after reordering.

**Prefer:** render computes UI from inputs; keep effects in their proper owners
and updates immutable. Ordinary Hooks run unconditionally at component/Hook top
level; render components with JSX. Define component types at module scope and keep
stateful tree positions stable. Use stable domain IDs unique among siblings on the
outermost returned element; pass IDs separately when consumers need them. Generate
record IDs at creation, not render. `useId` serves accessible relationships, not
list identity. Deliberate entity keys reset only the intended state boundary.

**Exception:** local mutation within a pure calculation is fine. Documented guarded
same-component render adjustments and predictable ref initialization have narrow
valid uses; prefer derivation or a deliberate identity reset. Version-supported
`use` has different call rules; ordinary Hooks do not inherit that exception.
Static lists can use index keys. Inline handlers/render props are not component types.

**Verify:** repeated rendering does not change external state. Changing branches
preserves Hook order. Parent updates retain edits/focus; insert/remove/reorder keeps
row B's draft with B. Entity changes reset only what the contract intends.

## `react-input-accessibility`

**Keep control ownership and interaction intact.**

**Apply:** forms, reusable controls, compound UI, or changed input/event wiring.

**Problematic:** an input changes from undefined to controlled; non-submit controls
submit a form; pointer-only handlers make actions unreachable by keyboard; splitting
compound UI loses label, error, or focus relationships.

**Prefer:** consistently controlled values with matching change handlers, or
intentional uncontrolled defaults for the control lifetime. Keep controlled text
updates prompt; defer expensive results separately. Use semantic elements, accessible
names/labels, appropriate button types, and related validation messages. Preserve
keyboard activation, focus behavior, and supported dialog/menu interactions when
composing UI. Use established accessible primitives where available; ARIA roles
alone do not implement keyboard behavior. Pass handlers rather than calling them
during render. Use explicit numeric conditions so empty counts do not render `0`.

**Exception:** read-only controlled inputs need no change handler. Ordinary boolean
`condition && <Content />` is valid. Platform-specific controls and file inputs have
their own contracts; do not impose a web implementation or new form/UI library.

**Verify:** labels/roles resolve, keyboard submit/activation works, validation and
retry retain drafts, and focus reaches/returns from the intended control. Check
async initialization and empty/populated states for warnings or stray content.

## `react-async-recovery`

**Own failures and retry the failed operation.**

**Apply:** reads, mutations, lazy loading, and loading/error boundaries.

**Problematic:** rejection only logs while pending stays true; request A overwrites
B or clears B's pending/error; a late save erases newer edits; retry resets a
boundary but leaves the failed query or rejected lazy loader unchanged.

**Prefer:** the established loader/query/action owns pending, success, failure,
and recovery. Propagate rejection to an explicit owner or handle it there; `void`
alone handles no error. Validate HTTP status/payloads at the I/O adapter. For
changed inputs, use cache/loader ownership and cancellation; manual fetching needs
cancellation or generation guards for success, failure, and pending settlements.
Never display another entity's result as current. See [Web state boundaries](web-react-vite.md#web-state-boundaries)
when cache identity or data sources change.

Mutations capture the submitted draft/version, guard unsafe duplicate activation
across controls, reconcile the real cache, and roll back optimistic updates or
offer explicit reconciliation without discarding newer edits. Client abort does
not prove server cancellation; retry writes only under their actual safety contract.
See [HTTP retries](http-rest.md#http-mutation-recovery) when changing that contract.

Place loading/error boundaries where independent recovery makes sense. Error
boundaries catch descendant rendering errors, not ordinary event/async failures
or SSR generally; use the framework's server/route mechanism. Supported action,
transition, or query APIs can route errors differently: verify installed behavior.
Suspense handles supported suspended work, not ordinary effect-fetching or errors.
Recovery resets/retries the failed owner as well as its boundary; lazy rejection
can remain cached, so follow a supported retry/reload strategy without loops.

**Exception:** cancellation may be non-error UI; intentional stale-while-revalidate
must keep scope valid. Independent mutations may be concurrent. A small app may
need only a root boundary; expected field errors normally belong inline.

**Verify:** settle A/B success and failure in both orders, unmount pending work,
fail a save while editing, retry, and activate alternate submit paths. Drafts stay
recoverable; pending belongs to the current request; retry actually restarts work.
Fail an independent feature and check surrounding navigation remains usable.

## `react-ssr-boundaries`

**Match initial rendering and isolate request state.**

**Apply:** server rendering/hydration, Server Components, or shared server UI state.

**Problematic:** browser storage/time/random values change initial markup; browser
globals run on the server; module-level mutable user state leaks between requests;
warning suppression conceals a reproducible hydration defect.

**Prefer:** deterministic server/client initial inputs, valid markup, supported
IDs, framework client/server conventions, and request-owned state/cache instances
for private data. Keep browser-only synchronization at an appropriate boundary;
minimize data crossing into client code. Client import safety remains with [Web](web-react-vite.md#boundary-browser-server).
Server actions are server entry points: preserve validation/authorization at the
actual operation owner; hiding a control is no access control.

**Exception:** intentionally shared public caches/constants can have broader
lifetimes. Narrow unavoidable mismatches can use documented suppression; that
neither fixes arbitrary mismatches nor guarantees repair. Client-only apps need
no SSR migration. Do not introduce Next.js APIs into Vite or another framework.

**Verify:** direct server load/hydration and client navigation; inspect new console
errors, initial markup/focus, and concurrent authenticated requests. Verify denied
operations server-side when their entry points change. A browser build alone does
not establish hydration, authorization, or request isolation.

## `react-performance`

**Prioritize waits, payloads, and costly subscriptions.**

**Apply:** React design and changes affecting data readiness, bundles, or rendering.

**Problematic:** independent reads wait sequentially; child mounting starts an
avoidable fetch waterfall; a rarely used editor loads eagerly; typing updates a
root context with unrelated consumers; every handler/calculation is memoized.

**Prefer:** existing loaders/caches preload/deduplicate and start independent
reads together. Keep real data/authorization dependencies ordered. Handle partial
failure deliberately; `Promise.all` neither cancels siblings nor makes writes safe
to parallelize. Use framework-supported route splitting/lazy loading for heavy
optional UI, with loading/failure recovery. Inspect actual client imports/chunks;
barrel imports are not universally expensive.

Keep frequent state local and use supported narrow store selectors. React context
subscribes to its entire value: a wrapper returning one field is not selective,
and `memo` cannot block consumed context changes. Split independent domains when
useful. Profile costly rendering before choosing memoization, virtualization, or
supported deferred scheduling. Preserve accessible focus/list semantics.

Check whether Compiler actually applies to the affected code. Use manual memoization
for demonstrated cost or identity-sensitive contracts, with complete dependencies;
correctness must not require retained memo caches. Keep intentional existing
memoization unless evidence supports removal. Transitions/deferred values change
scheduling, not network debouncing or computational complexity.

**Exception:** small contexts, inline handlers, and ordinary rerenders are normal.
Immediately needed UI can load eagerly. Stable identity can matter to an external
API without slow rendering. No mandatory Compiler adoption, SWR/store migration,
blanket memoization, barrel ban, or speculative JavaScript micro-optimization.

**Verify:** representative interaction profiles, request start/readiness times,
and emitted bundles as relevant; behavior, focus, current callbacks/results, and
load failure still work. Describe concrete mechanisms; quantify gains only from
measurements, and label unmeasured performance concerns as hypotheses.

## `react-behavior-verification`

**Exercise real consumers and public outcomes.**

**Apply:** changed React behavior, shared UI contracts, or regression risk.

**Problematic:** only snapshots or render counts are checked; mocked consumer
Hooks hide provider wiring; sleeps guess request ordering; shared test caches leak
state; a DOM unit test is claimed to prove hydration or browser focus behavior.

**Prefer:** use the installed harness with accessible queries and realistic user
interactions. Exercise actual consumers/providers and relevant router/data trees.
Use typed seams or request interception for controlled failures, deferred promises
for races, async assertions instead of sleeps, and fresh mutable test owners.
Pure calculations can have direct unit tests; focused Hook tests verify public
actions/output and supplement integration where ownership matters.

Choose scenarios from changed risks: sibling sharing/independent instances,
edit/focus retention after parent updates or row reordering, resource cleanup,
A/B races, mutation failure/new edits/retry, navigation/history, or SSR isolation.
Use browser checks where the available unit environment cannot prove the behavior.
Run installed compatible Hooks lint and typechecks; build when imports, bundling,
or SSR are affected. A linter does not replace cross-owner reasoning or behavior.

**Exception:** simple reversible markup changes need no ritual test suite. Existing
seams/harnesses take precedence; do not install a new stack by default. Snapshots
can supplement explicit assertions. Keep semantically correct failing regressions
and report their limits rather than weakening expected behavior.

**Verify:** tests survive internal refactoring but fail when the claimed ownership,
identity, or recovery contract breaks. Report checks actually run, inspected scope,
and unverified behavior; do not turn lint/static checks into runtime claims.

## Sources

- [React: Thinking in React](https://react.dev/learn/thinking-in-react)
- [React: Choosing State Structure](https://react.dev/learn/choosing-the-state-structure)
- [React: Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [React: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React: Rules of React](https://react.dev/reference/rules)
- [React: useContext](https://react.dev/reference/react/useContext)
- [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React: useEffect](https://react.dev/reference/react/useEffect)
- [React: useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [React: Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [React: Rendering Lists](https://react.dev/learn/rendering-lists)
- [React: input](https://react.dev/reference/react-dom/components/input)
- [WAI: Native Semantics and ARIA Contracts](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)
- [React: Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React: Suspense](https://react.dev/reference/react/Suspense)
- [React: lazy](https://react.dev/reference/react/lazy)
- [React: hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)
- [React: Compiler Introduction](https://react.dev/learn/react-compiler/introduction)
- [React: Hooks Lint](https://react.dev/reference/eslint-plugin-react-hooks)
- [Testing Library: Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Testing Library: Accessible Queries](https://testing-library.com/docs/queries/about/)
- [Vercel: React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md)
- [Vercel: Composition Patterns](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md)
- [Bulletproof React: Feature Organization](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)

Vercel and Bulletproof React inform the synthesis; their preferred stacks and
templates are not requirements. Examples here are original. The local react-patterns
skill remains the deeper companion when explicitly invoked; these rules preserve
its policies without automatically invoking it.
