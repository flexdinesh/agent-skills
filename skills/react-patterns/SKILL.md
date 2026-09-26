---
name: react-patterns
description: "Write, audit, debug, and refactor React code with cohesive components, deliberate state ownership, composable providers, minimal effects, reliable async recovery, consistent naming, and good rendering performance. Use only when the user explicitly invokes `react-patterns` or `$react-patterns`; do not auto-invoke from context."
---

# React Patterns

Manual invocation only: use this skill only when the user explicitly invokes
`react-patterns` or `$react-patterns`; do not auto-invoke from task context.

Apply these patterns to new and existing React code in small applications, large
repositories, and component libraries. Architecture, correctness, testability,
and performance are always in scope. This skill is framework-neutral; apply
framework and platform rules only when the installed stack supports them.

## Uses

Infer the use from the user's request. These are independent uses, not phases
that every task must pass through:

| Use | Action |
| --- | --- |
| Write | Design and implement new components, hooks, providers, pages, or features using the rules from the start. |
| Audit | Analyze ownership, behavior, naming, and performance; report supported findings and proposed changes. Stay read-only. |
| Conform | Refactor existing code within the requested scope; preserve behavior and verify the change. |

If the user invokes the skill without a clear action, default to a read-only
audit. A writing or refactoring request authorizes that work; do not require a
separate audit or confirmation before routine scoped changes.

## Before acting

1. Read applicable repository instructions and inspect the working tree.
2. Identify the requested scope and preserve unrelated work.
3. Inspect installed React, framework/router, state/cache/form libraries,
   TypeScript, React Compiler, lint, and test configurations.
4. Identify client/server boundaries, application entry points, page routes,
   provider composition, and existing ownership and naming conventions.
5. Read the relevant references below. Verify version-sensitive APIs against
   installed packages and their primary documentation; do not assume latest
   guidance applies to an older repository.

Prefer APIs supported by the current stack. React 19 provider shorthand,
ref-as-prop, Actions, and newer Hooks are version-dependent; do not migrate
working React 18 APIs solely to match an example. Web DOM examples need platform
equivalents in React Native.

## Core policies

- Build components around one purpose or a few related responsibilities.
  Extract by behavior, purpose, dependencies, and lifecycle, not line count.
- Use consistent, descriptive names that express domain purpose and contract.
  Follow React naming requirements and documented repository conventions; apply
  the naming reference where conventions are absent.
- Keep page-level composition and files isolated from shared primitives. Follow
  framework file conventions and colocate page/feature internals.
- Keep state minimal and near its owner. Calculate derived values during render;
  avoid storing or effect-synchronizing values already available from props,
  state, URL, or a server cache.
- Provide app-wide state through domain providers near the application root and
  consume it through named context hooks. Keep feature/page providers scoped to
  their consumers; do not put every state value at the root.
- Avoid drilling app state through intermediaries that only forward it. Ordinary
  props and children composition remain valid component contracts.
- Separate a reusable stateful UI's provider boundary from its visual boundary
  when flexible composition or sibling access is needed. Support independent
  instances; simple stateless components need no provider.
- Encapsulate compound state behavior in cohesive domain hooks with named
  actions. Reusing a stateful hook does not share its state between callers.
- Prefer state and domain hooks over reducers by default. This is a soft
  preference, not a correctness rule: a justified reducer is acceptable.
  For existing reducers, explain the tradeoff and propose an alternative when
  useful; never convert them without user acceptance of that proposal.
- Use effects for external synchronization. Put interaction logic in handlers;
  check dependencies, cleanup, stale closures, and feedback loops.
- Assume async work can fail. Give failures an owner, visible recovery, and
  protection against stale results and unsafe duplicate operations.
- Place error boundaries where independent recovery makes sense. Handle ordinary
  async/event failures explicitly; Suspense is not an error boundary.
- Preserve type evidence. In TypeScript, use no `any`, type assertions, or
  non-null assertions; narrow nullable context and refs explicitly.
- Consider performance by default, prioritizing waterfalls, bundle boundaries,
  subscription scope, and expensive rendering over micro-optimizations.
- Design testable contracts and verify behavior, including failure and recovery.

## Reference routing and rule index

Each reference contains applicability, problematic/preferred examples,
exceptions, verification guidance, and primary sources. Read only what applies.

| Concern | Rules | Reference |
| --- | --- | --- |
| Symbols, events, state contracts, domain vocabulary, files | `naming-react-symbols`, `naming-event-contracts`, `naming-state-contracts`, `naming-domain-language`, `naming-repository-consistency` | [Naming](references/naming.md) |
| Component and page ownership | `component-cohesion`, `page-boundaries`, `component-explicit-contracts` | [Component boundaries](references/component-boundaries.md) |
| Minimal state, domain hooks, reducers | `state-single-owner`, `state-derived-values`, `state-coherent-updates`, `hook-domain-behavior`, `state-reducer-preference` | [State and hooks](references/state-and-hooks.md) |
| App context, compound UI, provider contracts | `provider-scope`, `provider-consumer-contract`, `composition-provider-boundary`, `composition-independent-instances` | [Providers and composition](references/providers-and-composition.md) |
| Effects, dependencies, subscriptions, cleanup | `effect-external-system`, `effect-event-ownership`, `effect-dependencies`, `effect-cleanup` | [Effects and lifecycle](references/effects-and-lifecycle.md) |
| Purity, identity, keys, inputs, hydration | `render-purity`, `render-hook-order`, `render-component-identity`, `render-list-keys`, `render-input-contract`, `render-hydration` | [Rendering and identity](references/rendering-and-identity.md) |
| Rerenders, memoization, fetching, bundles | `perf-subscription-scope`, `perf-memoization`, `perf-waterfalls`, `perf-bundle-boundaries`, `perf-expensive-rendering` | [Performance](references/performance.md) |
| Async failures, races, mutation safety, boundaries | `async-failure-owner`, `async-stale-results`, `async-mutation-safety`, `boundary-recovery` | [Async and recovery](references/async-and-recovery.md) |
| Components, hooks, providers, page flows | `test-public-behavior`, `test-dependency-seams`, `test-regression-scenarios` | [Testing](references/testing.md) |

## Working method

### Write

1. Identify the page/feature boundary, state sources, consumers, and lifetimes.
2. Choose local state, existing URL/cache ownership, or a scoped provider for
   each concern. Specify loading, failure, and recovery behavior before coding.
3. Compose cohesive UI and domain hooks. Apply rendering and performance rules
   while writing; do not postpone them to a later audit.
4. Use real dependency seams where external work needs substitution in tests.
5. Review the resulting tree and run relevant checks.

### Audit

1. Inventory relevant React packages, pages, providers, hooks, and data owners.
   Exclude generated files, build output, dependencies, and vendored code unless
   the request explicitly targets them.
2. In a small repo, inspect all relevant source. In a large repo, inventory all
   packages, then inspect connected page/feature trees in batches. If the user
   requests a full audit, continue until all relevant batches are covered.
3. Use searches and installed lint rules to locate candidates. Trace owners,
   consumers, updates, dependencies, and boundaries before reporting a finding.
   Hook counts, file size, prop depth, and inline allocations alone prove nothing.
4. Prioritize real render bugs, lost edits, loops, races, and broken recovery;
   then architecture policies and material performance concerns.
5. Report exact inspected coverage and remaining scope. Never describe a sample
   as whole-repository conformance.

### Conform

1. Fix the underlying ownership or lifecycle problem with the smallest coherent
   change; do not just move complexity into another file or a giant hook.
2. Preserve public APIs unless changing them is in scope. Preserve state lifetime,
   focus, edits, URL behavior, provider isolation, and recovery semantics.
3. Implement accepted reducer conversions only. Continue other authorized work
   independently of an unaccepted reducer proposal.
4. Test meaningful affected behavior and run relevant checks. Reinspect the
   changed tree for new subscriptions, identity changes, and async races.

## Finding discipline

Separate correctness defects, architecture policies, and performance concerns.
Give each finding a rule ID, file/line, concrete evidence, impact, confidence,
smallest proposed fix, and validation scenario. Judge severity by consequences,
not category. Mark unmeasured performance concerns as hypotheses with a way to
measure them; do not invent speedup percentages or pad reports with style nits.

Classify naming inconsistencies as policy findings unless they cause a concrete
bug, such as a lowercase JSX component identifier being treated as a DOM tag.
Report material ambiguity or inconsistent contracts, not subjective preferences
that contradict established repository conventions. Keep renames scoped and
preserve public APIs unless their migration is authorized.

For reducer proposals, show retain/replace tradeoffs and make user acceptance
explicit. A justified reducer needs no violation finding.

Ordinary rerenders, development Strict Mode replay, inline handlers, ordinary
booleans such as `disabled`, and legitimate effects are not defects by themselves.
Do not add blanket memoization, ban all props, suppress dependencies, force a
folder template, replace existing data libraries, or upgrade React to satisfy a
pattern.

## Verification and output

- Run installed lint, typechecking, relevant behavioral tests, and a production
  build when changed boundaries, imports, SSR, or bundling warrant it.
- Use compatible React Hooks lint rules as evidence; architecture still needs
  cross-file reasoning. Do not silently install tools or rewrite lint config.
- Test user-visible outcomes and public contracts. Add tests for concrete
  regression risk, not to mirror implementation or assert fixed render counts.
- Verify affected provider instances, state preservation/reset, async races,
  failure/retry, and page navigation. Include hydration checks when applicable.
- Record checks actually run, their results, and any verification limits.
- Audit output: prioritized supported findings, reducer proposals when relevant,
  inspected coverage, and remaining scope. Say when no findings survive checking.
- Write/conform output: concise changes, rationale, checks, and remaining risks
  or proposals. End any plan with unresolved questions, if any.

## Foundations

These are opinionated policies informed by React's official documentation and
Vercel's React best-practices and composition skills, not a claim that every policy
is universal consensus. In particular, reducer preference and page organization
are architectural choices. Detailed sources live with each reference; consult
them when updating guidance. Vercel sources are inspiration; examples here are
original and adapted to the policies above.
