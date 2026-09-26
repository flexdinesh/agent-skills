# Rendering and identity

Read for all new interactive UI and when diagnosing state loss, incorrect lists,
focus loss, render loops, input warnings, or hydration failures.

## `render-purity`

**Apply:** components, Hooks, selectors, state updaters, and render calculations.

**Problematic:** render starts a request, mutates props or cache data, registers a
listener, uses a changing global value as hidden input, or unconditionally calls
a setter. Sorting a shared array in place changes data outside the calculation.

**Prefer:** render computes UI from current inputs. Move interaction work to
handlers and external synchronization to effects. Use immutable updates and
sort a copied array, or `toSorted` where the target runtime supports it. Ref
mutation/read during render must not become a hidden source of displayed state.

```tsx
interface Item {
  id: string
  title: string
}

function SortedItems({ items }: { items: readonly Item[] }) {
  const sorted = [...items].sort((left, right) =>
    left.title.localeCompare(right.title),
  )
  return <ul>{sorted.map(item => <li key={item.id}>{item.title}</li>)}</ul>
}
```

**Exception:** local allocations can be mutated inside a pure calculation. A
documented guarded same-component render adjustment can be valid React, but
prefer derivation or an identity reset; never update a different component during
render. Predictable one-time ref initialization has narrow documented exceptions.

**Verify:** repeated render evaluation does not alter inputs, issue requests, or
change external state. Strict Mode replay must preserve the same behavior.

## `render-hook-order`

**Apply:** ordinary Hooks in components and custom Hooks.

**Problematic:** a Hook appears after a conditional return, inside a loop or event
handler, or in a dynamically invoked component function.

**Prefer:** ordinary Hooks run unconditionally at the component/Hook top level.
Render components with JSX, not by calling component functions. Extract a child
component when a branch needs its own Hooks and lifetime.

**Exception:** React's version-supported `use` API has different conditional-call
rules. Follow its documented constraints rather than applying that exception to
`useState`, `useContext`, or other ordinary Hooks. Conditional logic inside an
effect or handler is fine; conditional Hook calls are the concern.

**Verify:** all branches and changing props preserve Hook order; use the installed
compatible `rules-of-hooks` lint.

## `render-component-identity`

**Apply:** a stateful subtree rerenders or its parent structure changes.

**Problematic:** an input component is defined inside a parent's render:

```tsx
import { useState } from 'react'

function SearchPanel() {
  const [expanded, setExpanded] = useState(false)
  function SearchInput() {
    const [text, setText] = useState('')
    return <input aria-label="Search" value={text}
      onChange={event => setText(event.target.value)} />
  }
  return <section>
    <button type="button" onClick={() => setExpanded(previous => !previous)}>
      {expanded ? 'Collapse' : 'Expand'}
    </button>
    <SearchInput />
  </section>
}
```

Each parent render creates a new component type, remounting the input.

**Prefer:** define `SearchInput` at module scope and pass its actual inputs as
props. Keep providers and stateful controls at stable tree positions. Avoid
recreating wrapped component types such as `memo(Component)` inside render.

**Exception:** a deliberate entity key or changed component type can reset state.
Document which drafts and focus are discarded. An inline event callback or a
render prop returning JSX is not itself a new component type.

**Verify:** type, toggle unrelated parent state, and check the input retains value
and focus. Entity changes must reset only the state intended to reset.

## `render-list-keys`

**Apply:** siblings are created from data, especially editable/reorderable lists.

**Problematic:** random keys remount rows on every render; index keys associate
edits with the wrong item after insertion, deletion, or sorting.

**Prefer:** stable domain IDs unique among siblings; put the key on the outermost
returned element or keyed Fragment. Pass the ID separately when the child needs
it, since React does not pass `key` as a normal prop. Generate new-record identity
when creating the record, not while rendering it. `useId` serves accessibility
relationships, not data-list identity.

**Exception:** index keys can be acceptable for truly static lists whose identity
and order never change. The same ID can appear in different sibling lists.

**Verify:** editing row B then inserting, sorting, or removing row A keeps B's
value, selection, and focus attached to B.

## `render-input-contract`

**Apply:** controlled inputs, conditional markup, and event wiring.

**Problematic:** an input switches from `undefined` to a controlled string; a
save handler is invoked during render; a non-submit form button submits; numeric
`items.length && <List />` renders a stray zero when empty.

**Prefer:** use a consistently controlled value (`value={text ?? ''}` or a boolean
`checked`) with a matching change handler, or an intentionally uncontrolled
`defaultValue`/`defaultChecked`. Choose ownership for the entire control lifetime.
Pass event handlers, specify button type, and use an explicit condition such as
`items.length > 0` or a ternary for potentially numeric conditions.

**Exception:** boolean `condition && <Content />` is valid. Controlled read-only
controls can use `readOnly` instead of a change handler. Do not replace every
conditional expression or uncontrolled input mechanically.

**Verify:** empty/populated data, keyboard submission, async initialization, and
input edits produce correct UI without warnings, stray text, or duplicate actions.

## `render-hydration`

**Apply:** React hydrates server-rendered HTML.

**Problematic:** initial markup differs due to random/time values, browser storage,
viewport checks, locale differences, or invalid HTML nesting. Shared mutable
server state exposes another request's data. Suppressing warnings conceals a bug.

**Prefer:** consistent server/client initial data, valid markup, framework-supported
client boundaries, and deterministic IDs (`useId` for supported accessibility
relationships). Isolate browser-only synchronization behind an appropriate
boundary; do not read browser globals during server render. Use request-scoped
state and caches for request-owned data.

**Exception:** a narrow unavoidable difference can use documented suppression,
but it is not a general fix or guarantee React will repair mismatched content.
Client-only applications do not need an SSR migration to follow this rule.

**Verify:** direct SSR load and hydration, then client navigation; check markup,
console errors, initial focus, and request isolation where applicable.

## Sources

- [React: Components and Hooks Must Be Pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [React: Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React: Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [React: Rendering Lists](https://react.dev/learn/rendering-lists)
- [React: input](https://react.dev/reference/react-dom/components/input)
- [React: Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [React: hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)
- [React: useId](https://react.dev/reference/react/useId)
