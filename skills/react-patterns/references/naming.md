# Naming

Read when naming components, hooks, props, state, actions, providers, or files,
or auditing inconsistent vocabulary and misleading contracts.

React's component and Hook naming requirements affect tooling and JSX behavior.
The remaining rules combine documented conventions with explicit skill
preferences. File casing, boolean prefixes, and role suffixes are not universal
industry standards. Preserve established repository and platform contracts.

## `naming-react-symbols`

**Apply:** declaring or importing React components, Hooks, types, and values.

**Problematic:** `<orderSummary />` is treated as a DOM tag; `getOrderSelection`
calls Hooks; `useSortedOrders` is only a pure sorting utility; ordinary values
are PascalCase and look like component constructors.

**Prefer:** PascalCase component identifiers and types, camelCase ordinary
functions, variables, and props. Custom Hooks start with `use` followed by a
capitalized purpose. A JSX element value is distinct from a component:

```tsx
const orderSummary = <OrderSummary />
```

Use `OrderSummaryProps` for component inputs when a named type is useful. Do not
create a named type solely to satisfy a suffix convention. Keep pure utilities
as ordinary functions such as `sortOrders`. Prefer Hooks named for capability
or domain behavior, such as `useOrderSelection` or `useMediaQuery`, over vague
helpers or lifecycle wrappers; see [State and hooks](state-and-hooks.md).

**Exception:** compound components such as `Dialog.Root` are valid. Follow
established component-valued prop conventions; alias a camelCase input to an
uppercase local identifier when rendering it in JSX. Preserve `aria-*`, `data-*`,
and external field names. A deliberate Hook placeholder may retain its `use`
prefix when its contract requires future Hook calls. Ordinary local `const`
values do not require CONSTANT_CASE.

**Verify:** JSX resolves the intended component, Hook calls remain recognizable
to installed lint rules, and names distinguish component types from values.

## `naming-event-contracts`

**Apply:** callback props, local event handlers, and domain actions.

**Problematic:** a callback prop is named `handleSave`; a domain command is named
`onClick`; `onSaved` fires before persistence succeeds.

**Prefer:** `on` + event or intent for callback props, `handle` + event or intent
for local handlers, and verbs for commands:

| Role | Example |
| --- | --- |
| Callback requesting a save | `onSave` |
| Local handler | `handleSave` |
| Domain command | `saveOrder` |
| Successful completion notification | `onSaved` |
| Controlled value change callback | `onSelectionChange` |

This request/completion distinction is a skill preference: define the actual
timing and payload. Feature callbacks express intent such as `onDeleteOrder`;
primitive controls can expose browser events such as `onClick`. Keep callbacks
passed through props under their existing `on...` names; do not rename them merely
because they are used locally.

**Exception:** not every function prop is an event callback. Render functions,
loaders, and formatters can be `renderItem`, `loadOrder`, and `formatPrice`.
Inline handlers and directly passing a command are valid; do not introduce
wrappers solely to obtain a `handle...` name. Preserve third-party callback APIs.

**Verify:** follow invocation paths to confirm whether a callback requests work,
reports a change, or announces completed work. Names and payloads match that role.

## `naming-state-contracts`

**Apply:** state/setter pairs, predicates, refs, and controlled/uncontrolled APIs.

**Problematic:** `[selectedOrderId, updateData]` hides the setter's target;
`selectedOrder` contains only an ID; `initialOpen` continuously controls visibility;
`isNotDisabled` requires double negation to understand.

**Prefer:** `[selectedOrderId, setSelectedOrderId]`; name values for their meaning,
not their storage mechanism. Prefer readable custom predicates such as
`isSaving`, `hasChanges`, and `canSubmit`. Use plural collection names (`orders`),
explicit ID names (`selectedOrderId`), and descriptive ref names (`inputRef`)
where they clarify the contract. These are readability preferences, not required
prefixes or suffixes for every value.

Use `initial...` or `default...` for inputs whose later changes do not
automatically update local state. A controlled API can use `open` and
`onOpenChange`; an uncontrolled initialization input can use `defaultOpen`.
Document explicit reset behavior separately. See
[Component boundaries](component-boundaries.md) for ownership and
[State and hooks](state-and-hooks.md) for minimal state and coordinated updates.

**Exception:** preserve established props such as `disabled`, `required`, and
`open`; do not force `is...` onto platform or library contracts. A semantic action
such as `selectOrder` is not a raw setter and need not start with `set`. Prefer a
status union over incompatible boolean flags; naming does not repair state design.

**Verify:** names accurately distinguish records, IDs, collections, refs, and
predicates. Prop updates and explicit resets match initialization/control claims.

## `naming-domain-language`

**Apply:** related components, providers, Hooks, types, and returned actions.

**Problematic:** one selection concern alternates between `OrderPickerProvider`,
`ChosenOrdersContext`, and `useOrderSelection`; unrelated responsibilities hide
behind `useHelper` or `DataManager`.

**Prefer:** one domain vocabulary across related APIs. An illustrative family:
`OrderSelectionProvider`, `OrderSelectionContext`, `OrderSelectionContextValue`,
and `useOrderSelection`. Name UI by purpose (`OrderSummary`), behavior by
capability (`useOrderSelection`), and actions by intent (`selectOrder`,
`clearSelection`). These role suffixes are skill defaults where conventions are
absent, not a requirement to add abstractions or rename valid existing APIs.
See [Providers and composition](providers-and-composition.md) for contracts.

Let scope supply context: `orderSubmission.status` is clear without repeating
`orderSubmissionStatus` inside the object. When several Hook results coexist,
alias ambiguous fields locally, such as `status: orderSubmissionStatus`.
Use familiar domain terms; avoid unexplained abbreviations and redundant suffixes.

**Exception:** similar-looking terms can represent different domain concepts;
do not erase meaningful distinctions to obtain textual uniformity. Local state
Hooks and context consumers can use different role names, such as `useDraftState`
and `useDraft`, when that distinction describes ownership.

**Verify:** trace related exports and consumers; the same term denotes the same
concept, and distinct behavior or ownership remains recognizable.

## `naming-repository-consistency`

**Apply:** choosing file names, auditing conventions, or renaming existing APIs.

**Problematic:** adding `OrderSummary.tsx` beside consistently kebab-case files;
renaming framework route entries for stylistic uniformity; changing published
props or exports during an unrelated cleanup.

**Prefer:** inspect instructions, lint configuration, and nearby comparable
files before choosing a convention. Follow framework requirements, then explicit
repository rules, then established conventions for the relevant package or
feature. Where none exists, choose and document one convention; PascalCase
component files and camelCase Hook files matching their primary exports are an
acceptable default, not a universal standard. Casing need not be identical across
file categories. Keep file names aligned with exported domain purpose.

During scoped renames, update affected references, imports, re-exports, tests,
and documentation. Check path casing on case-sensitive systems. Preserve public
APIs unless their migration is authorized; avoid repository-wide style churn.

**Exception:** generated files, framework entries, external schemas, and
intentional package-specific conventions retain their required names. Tightly
related exports may share a file; a matching file per symbol is not required.

**Verify:** imports and public consumers still resolve; no obsolete references
remain in scope. Run installed lint/typechecking and affected behavior checks
when code changes warrant them; do not install naming tooling without scope.

## Sources

- [React: Your First Component](https://react.dev/learn/your-first-component)
- [React: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React: Responding to Events](https://react.dev/learn/responding-to-events)
- [React: useState](https://react.dev/reference/react/useState)
- [React: Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [React: Common DOM Components](https://react.dev/reference/react-dom/components/common)
- [Google: TypeScript Style Guide, Naming](https://google.github.io/styleguide/tsguide.html#naming)
- [Airbnb: React/JSX Style Guide, Naming](https://github.com/airbnb/javascript/blob/master/react/README.md#naming)
- [Radix: Dialog API](https://www.radix-ui.com/primitives/docs/components/dialog)
- [MUI: Button API](https://mui.com/material-ui/api/button/)

Google and Airbnb demonstrate differing file conventions; Radix and MUI
demonstrate established boolean and callback APIs. Use these sources for naming
evidence, not wholesale adoption of their unrelated architectural or lint rules.
