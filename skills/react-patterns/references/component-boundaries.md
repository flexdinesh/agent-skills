# Component boundaries

Read when designing pages, splitting mixed-purpose components, or reviewing APIs
whose flags and dependencies make responsibilities hard to identify.

## `component-cohesion`

**Apply:** a component combines independently changing behavior, UI, state, or
external dependencies. A large component is a candidate, not proof.

**Problematic:** `OrdersPage` owns order fetching, a live connection, filter
synchronization, table rendering, and an unrelated editable account dialog.
Extracting its JSX into helpers leaves the same owner and lifecycle problems.

**Prefer:** the page composes `OrderFilters`, `OrdersTable`, and `AccountDialog`.
The dialog owns its local draft and save behavior; the table consumes orders from
the established data owner. A cohesive hook owns connection behavior only where
the feature actually needs it. Shared state stays at the nearest useful common
owner rather than being duplicated in the children.

Do not move all page behavior into `useOrdersPage` just to shorten the component.
Extract hooks by domain behavior, components by purpose, and pure helpers by
calculation. Keep small cohesive code inline when extraction adds only indirection.

**Exception:** long markup, a detailed SVG, or a cohesive stateful control may be
appropriate as one component. A stateless component need not acquire state.

**Verify:** each boundary has an identifiable purpose and lifetime; unrelated
interactions no longer require changing or rerendering the same owner needlessly.
Check that moved state still survives the interactions where it must persist.

## `page-boundaries`

**Apply:** every application page/route has a distinct composition boundary.

**Problematic:** page-only components live among shared primitives; a shared
button imports a page provider; a route file owns hundreds of lines of unrelated
feature implementation.

**Prefer:** a route entry composes a page; page/feature internals stay colocated.
Application code composes features and shared primitives. Shared code does not
depend on page internals. An illustrative layout, not a mandatory template:

```text
src/app/providers.tsx
src/routes/orders.tsx
src/features/orders/orders-page.tsx
src/features/orders/order-filters.tsx
src/features/orders/use-order-selection.ts
src/features/orders/orders-page.test.tsx
src/components/button.tsx
```

Follow installed router/framework conventions. Do not move generated route files
or violate file-routing, lazy-route, server/client, or Fast Refresh constraints.
Only create directories the feature needs. Promote code to shared ownership when
it serves multiple consumers with the same contract, not hypothetical future use.

**Exception:** a small page can be implemented entirely in its route module while
retaining a clear page boundary. A component library has no mandatory page layer.

**Verify:** imports follow ownership, route entry behavior stays intact, direct
loads/navigation work, and page internals do not leak into shared primitives.

## `component-explicit-contracts`

**Apply:** a reusable API allows contradictory modes or callers need to rearrange
the component's pieces.

**Problematic:** `<Editor compact readOnly withToolbar withSaveButton />` allows
combinations the implementation cannot support consistently.

**Prefer:** explicit variants or composition:

```tsx
import type { ReactNode } from 'react'

function EditorFrame({ children }: { children: ReactNode }) {
  return <section aria-label="Editor">{children}</section>
}

function EditorPreview({ text }: { text: string }) {
  return <p>{text}</p>
}

function ReadOnlyEditor({ text }: { text: string }) {
  return (
    <EditorFrame>
      <EditorPreview text={text} />
    </EditorFrame>
  )
}
```

Give controlled/uncontrolled APIs an explicit owner. Name initial-only props
`initial...` or `default...`; do not silently mirror subsequent prop changes into
local state. Preserve semantic markup, accessible names, and focus behavior when
splitting controls.

**Exception:** independent booleans such as `disabled`, `required`, and `open` are
valid contracts. Render props are useful when children need runtime data; prefer
children for structural composition without banning render props.

**Verify:** invalid combinations are excluded or handled; callers can compose
supported pieces without learning hidden mode interactions.

## Sources

- [React: Thinking in React](https://react.dev/learn/thinking-in-react)
- [Vercel: Composition Patterns](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md)
- [Bulletproof React: Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)

Page isolation and these file-ownership preferences are skill policies. The
sources offer architectural examples, not a universal React directory standard.
