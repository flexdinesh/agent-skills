# repo-patterns: React proposal

Researched 2026-09-27. Incorporated into
[repo-patterns](../skills/repo-patterns/SKILL.md) and
[React guidance](../skills/repo-patterns/references/react.md).

## Existing setup and gap

repo-patterns routes scoped tasks to references with stable rule IDs,
applicability, problematic/preferred behavior, exceptions, and verification.
Consuming-repository policy and evidenced conventions precede defaults; audit
findings separate defects, boundaries, preferences, and unmeasured hypotheses.
Research and maintenance evaluations stay outside ordinary execution.

Web already owns Vite layout/configuration, browser-safe imports, API adaptation,
and cache/source identity. Architecture owns general cohesion/dependency direction;
TypeScript owns type evidence and input parsing; testing owns fixtures/isolation.
React internals were explicitly deferred to a manually invoked companion, leaving
repo-patterns unable to apply those fundamentals on its own. Add a routed React
reference; retain the existing owners and conditionally link their affected seams.

## Skills and patterns compared

- [Local react-patterns](../skills/react-patterns/SKILL.md): synthesize all nine
  reference concerns: naming, component boundaries, state/Hooks, providers,
  effects, rendering/identity, performance, async recovery, and testing. Preserve
  its version checks, nearest useful owners, independent instances, type safety,
  meaningful recovery, and evidence-based restraint. It remains the deeper
  companion, with no automatic invocation or installation dependency.
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md):
  prioritize waterfalls and client payloads before costly subscriptions/rendering.
  Adapt to installed loaders/cache/bundler; do not require Next.js APIs, SWR,
  broad barrel bans, hydration suppression, or speculative loop rewrites.
- [Vercel Composition Patterns](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md):
  retain explicit variants, compound UI, provider implementation boundaries,
  and flexible sibling composition. Ordinary booleans, props, render props,
  and React 18 context/ref APIs remain valid; small controls need no compound API.
- [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md):
  supports feature locality and shared-to-feature-to-app dependency ownership.
  Useful architecture example, not a skill or a universal folder/import template.

The two Vercel skills are widely installed: their [performance listing](https://www.skills.sh/vercel-labs/agent-skills/vercel-react-best-practices)
and [composition listing](https://www.skills.sh/vercel-labs/agent-skills/vercel-composition-patterns)
reported approximately 746.5k and 358.0k installs on the research date. These are
directory metrics, not quality proof or universal consensus. Technical decisions
are grounded in primary documentation below, not popularity rankings.

## Proposal and evidence

| Addition | Primary evidence | Integration |
| --- | --- | --- |
| Cohesive components, explicit modes, meaningful naming | [Thinking in React](https://react.dev/learn/thinking-in-react), [custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) | Apply existing cohesion/vocabulary to React; keep established files/routes |
| Minimal state, coherent updates, deliberate drafts | [State structure](https://react.dev/learn/choosing-the-state-structure), [reducers](https://react.dev/learn/extracting-state-logic-into-a-reducer) | Preserve cache/URL owners; draft divergence is intentional; reducers remain valid |
| Provider contracts, scope, independent instances | [Context](https://react.dev/reference/react/useContext) | Share one behavior owner where needed; ordinary props and existing stores remain valid |
| External synchronization, dependencies, teardown | [Effect alternatives](https://react.dev/learn/you-might-not-need-an-effect), [useEffect](https://react.dev/reference/react/useEffect), [external stores](https://react.dev/reference/react/useSyncExternalStore) | Resource ownership and replay safety; no blanket setter/effect ban |
| Pure rendering, Hook order, stable identity/keys | [Rules of React](https://react.dev/reference/rules), [state identity](https://react.dev/learn/preserving-and-resetting-state), [lists](https://react.dev/learn/rendering-lists) | Preserve drafts/focus across updates; deliberate entity resets stay scoped |
| Controlled/uncontrolled inputs, keyboard/focus contracts | [Inputs](https://react.dev/reference/react-dom/components/input), [WAI semantics](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/) | Augment composition with accessible interactions, using installed primitives |
| Async ownership, race guards, mutation recovery | [Effect races](https://react.dev/reference/react/useEffect#fetching-data-with-effects), [boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary), [Suspense](https://react.dev/reference/react/Suspense), [lazy](https://react.dev/reference/react/lazy) | Existing Web/HTTP/TypeScript own cache identity, write safety, and parsing; retry the failed owner |
| Hydration and per-request state | [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) | Extend runtime isolation to SSR; Web retains client import safety; no SSR migration |
| Readiness, payloads, subscriptions, measured rendering | [Compiler](https://react.dev/learn/react-compiler/introduction), [context subscription](https://react.dev/reference/react/useContext) | Adapt Vercel priorities without mandatory memoization, Compiler, or framework changes |
| User-visible verification and compatible lint | [Testing Library principles](https://testing-library.com/docs/guiding-principles/), [queries](https://testing-library.com/docs/queries/about/), [Hooks lint](https://react.dev/reference/eslint-plugin-react-hooks) | Real consumer/provider trees, deterministic races, fresh state; browser checks for browser-specific claims |

The ten rules distinguish runtime requirements from scoped policies. React supports
both state Hooks and reducers; the companion's simple-state preference and accepted
conversion policy are retained explicitly, not presented as industry consensus.
Provider placement, feature folders, and callback spelling remain conditional.
Hydration, Actions, Effect Events, Compiler coverage, and server/client behavior
depend on installed versions and framework contracts.

## Implementation and validation scope

Add the React catalog route, update Web's obsolete companion-only deferrals, and
extend the verification matrix and README scope. The new reference works alone;
related references load only for affected contracts. No companion skill changes.

Add four snapshot evaluation inputs and React scenarios covering correctness,
composition/instance ownership, async/SSR/performance, and restraint. Preserve
all previous prompts and scenarios. Evaluations include supported React 18 APIs,
justified reducers, normal booleans/render props, legitimate effects, and healthy
ownership so the skill is assessed for false positives as well as missed bugs.

Structural verification checks local links/anchors, unique rule IDs/catalog
coverage, required rule sections, valid evaluation JSON/IDs, and preservation of
baseline inputs. Review scenarios against the documented rules. These checks do
not establish agent effectiveness or application runtime behavior; no comparative
agent benchmarks or React runtime tests are claimed for this documentation change.

Unresolved questions: none.
