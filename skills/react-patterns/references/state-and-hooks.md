# State and hooks

Read when adding state, organizing coordinated behavior, diagnosing stale values,
or evaluating reducer alternatives.

## `state-single-owner`

**Apply:** identify the source and lifetime of every changing value.

**Problematic:** a query result is copied into context and component state; a
selected item is duplicated rather than identified; a URL filter also has local
state that must be synchronized on every navigation.

**Prefer:** one owner. Keep server data in its established loader/cache, navigable
state in the URL, transient UI state near its consumer, and shared app state in
domain providers. Store `selectedId`, then find the selected item from current
data. Handle removal of that ID deliberately.

**Exception:** an editable draft or committed snapshot may intentionally diverge
from its source. Specify initialization, dirty edits, cancellation, reset, and
refetch behavior. Incoming data must not silently erase edits.

**Verify:** external updates, navigation, deletion, and refetch cannot produce
competing values; deliberate drafts follow their stated reset contract.

## `state-derived-values`

**Apply:** a value can be computed from current inputs during render.

**Problematic:** extra state and an effect keep `fullName` in sync:

```tsx
import { useEffect, useState } from 'react'

function NameLabel({ first, last }: { first: string; last: string }) {
  const [fullName, setFullName] = useState('')
  useEffect(() => setFullName(`${first} ${last}`), [first, last])
  return <p>{fullName}</p>
}
```

**Prefer:** calculate the value directly:

```tsx
function NameLabel({ first, last }: { first: string; last: string }) {
  const fullName = `${first} ${last}`
  return <p>{fullName}</p>
}
```

Apply this to filtered lists, counts, validity flags, and selected records.
Memoize expensive calculations only when warranted; memoization does not make a
value an independent state owner.

**Exception:** independent drafts, historical snapshots, and an explicitly
documented external synchronization contract. Being expensive alone does not
justify duplicating a computed value into state.

**Verify:** changed inputs immediately produce correct output without an
intermediate stale render or synchronization effect.

## `state-coherent-updates`

**Apply:** updates depend on previous state or several fields change atomically.

**Problematic:** two `setCount(count + 1)` calls in one handler use the same
snapshot. Separate `isSaving` and `isSaved` flags can become contradictory.

**Prefer:** functional updates for previous-state calculations; group values that
must change together and model mutually exclusive status with a union.

```tsx
import { useState } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function useDraftState(initialText: string) {
  const [draft, setDraft] = useState<{ text: string; status: SaveStatus }>({
    text: initialText,
    status: 'idle',
  })

  function changeText(text: string) {
    setDraft(previous => ({ ...previous, text, status: 'idle' }))
  }

  function reset() {
    setDraft({ text: initialText, status: 'idle' })
  }

  return { text: draft.text, status: draft.status, changeText, reset }
}
```

`initialText` is initial-only until `reset` is called; this hook does not perform
async saving. For a real submission, keep its request identity and recovery with
the behavior owner. Do not infer submission success from text changes.

Never mutate previous state; updater functions and lazy initializers must be pure.
Use refs for handles or non-rendered mutable values, not displayed status.

**Exception:** direct replacement is correct when independent of previous state;
independent fields need not be combined. A captured snapshot can be intentional.

**Verify:** queued updates, rapid input, and reset produce the intended state;
mutually exclusive statuses cannot simultaneously be true.

## `hook-domain-behavior`

**Apply:** multiple state values, handlers, or external interactions form one
cohesive behavior, or that behavior is reused.

**Problematic:** `usePageEverything` mixes unrelated domains; `useMount` conceals
dependencies; every consumer calls a local `useDraftState` expecting one draft.

**Prefer:** domain hooks such as `useOrderSelection` or `useDraftSubmission` with
typed inputs, outputs, and named actions. Separate independent lifecycles. Keep
pure calculations as ordinary functions; use a Hook only when it calls Hooks.
Mount the behavior once in a provider when callers need the same state instance.

**Exception:** a cohesive complex hook can be larger than a trivial component.
Extraction need not wait for reuse when it establishes a meaningful boundary.

**Verify:** public actions express domain intent; repeated local hook calls are
independent; context consumers observe the same owner when sharing is intended.

## `state-reducer-preference`

**Apply:** choosing state machinery or encountering application-authored reducers.

**Default:** prefer `useState`, cohesive domain hooks, named actions, and pure
domain calculations. Do not recreate a reducer as a dispatch switch hidden inside
a state hook just to avoid the API name.

**Existing code:** evaluate transition complexity, invariants, debugging needs,
tests, and migration cost. If replacement helps, propose the exact ownership and
action contract plus what will be preserved. Explain why retaining the reducer
might be preferable. Never convert without user acceptance of that proposal,
even during a general conform request that did not accept reducer conversion.

**Exception:** a reducer that clarifies complex transitions or protects important
invariants is acceptable. New justified reducers may be used with a concise
rationale. Do not audit dependencies' internal reducers or ban unrelated array
`reduce` calculations. Reducer usage alone is neither a bug nor high severity.

**Verify:** any accepted conversion preserves valid transitions, coordinated
updates, reset behavior, and tested invariants. Continue other authorized fixes
without waiting on an optional reducer proposal.

## Sources

- [React: Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [React: Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [React: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React: Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [Vercel: Calculate Derived State During Rendering](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-derived-state-no-effect.md)

Reducer avoidance is a soft skill preference; React supports both approaches.
