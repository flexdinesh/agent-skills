# State, Reactivity, and Listeners

## Read when

Read this when form state appears stale in React, state changes trigger too many
renders, UI depends on another value, or a field/form event must perform a side
effect such as clearing dependent data, analytics, or autosave.

## Use the right reactive mechanism

TanStack Form stores state outside React. Reading `form.state` gives a snapshot;
it does not by itself subscribe a component to later changes.

- Use `useSelector(form.store, selector)` when component logic needs reactive
  state.
- Use `form.Subscribe` when only a small UI subtree needs reactive state.
- Use field state inside a `form.Field` render function for that field's value and
  metadata.
- Use listeners for effects caused by events, not to render derived UI.

```tsx
import { useSelector } from '@tanstack/react-form'

function CheckoutSummary({ form }: { form: CheckoutFormApi }) {
  const itemCount = useSelector(
    form.store,
    (state) => state.values.items.length,
  )

  return (
    <>
      <p>{itemCount} items</p>
      <form.Subscribe
        selector={(state) => state.isSubmitting}
      >
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Placing order…' : 'Place order'}
          </button>
        )}
      </form.Subscribe>
    </>
  )
}
```

Provide the narrowest selector that represents what the consumer needs. Omitting
the selector subscribes to the entire store and causes avoidable component
re-renders. `useSelector` rerenders its component when the selected value changes;
`form.Subscribe` limits rerendering to its render subtree.

`useStore` is a deprecated alias. Prefer `useSelector`; when a custom comparison
is required, use its current third-argument options shape and verify it against the
installed package version.

## Keep selectors stable and cheap

- Select primitives or small structures rather than the complete state.
- Avoid expensive sorting, parsing, or network work inside a selector.
- Do not allocate a new object or array on every selection unless comparison
  behavior makes that safe. A tuple is convenient for `form.Subscribe`, but be
  aware of equality semantics when optimizing a hot path.
- Derive display-only values in the consumer. Store a derived value as another
  field only if it is genuinely part of the editable/submitted data contract.
- Never call a form mutation from a selector; selectors must be pure.

## Use listeners only for effects

Field listeners support `onChange`, `onBlur`, `onMount`, `onSubmit`, and
`onUnmount`. Form listeners can observe form lifecycle events and propagated child
change/blur events. The callback receives the relevant APIs, not a React event.

```tsx
<form.Field
  name="country"
  listeners={{
    onChange: ({ value }) => {
      const province = form.getFieldValue('province')
      if (province) form.setFieldValue('province', '')
    },
  }}
>
  {(field) => (
    <>
      <label htmlFor={field.name}>Country</label>
      <select
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      >
        {/* options */}
      </select>
    </>
  )}
</form.Field>
```

When clearing a dependent field:

1. Decide whether its touched/dirty metadata should also reset.
2. Make the mutation conditional so it does not create an event loop.
3. Tell the user when a previously selected value was removed.
4. Move focus only when the current control disappears or the next action would
   otherwise be unclear.

Use validation dependencies rather than a listener when the goal is only to
revalidate a linked field. See
[Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md).

## Debounce expensive effects

Listeners accept event-specific debounce options such as
`onChangeDebounceMs` and `onBlurDebounceMs`.

```tsx
const form = useForm({
  defaultValues: draft,
  listeners: {
    onChangeDebounceMs: 800,
    onChange: ({ formApi }) => {
      if (!formApi.state.isValid || formApi.state.isSubmitting) return
      void saveDraft(formApi.state.values)
    },
  },
  onSubmit: async ({ value }) => publish(value),
})
```

Debouncing does not cancel an already-started request. Autosave must still define:

- a latest-write-wins, queue, or cancellation policy;
- idempotency and retry behavior;
- how unsaved, saving, saved, and failed states are announced;
- what happens when the component unmounts or navigation begins;
- whether sensitive values may be persisted before explicit submission.

Prefer explicit save for high-risk, destructive, regulated, or sensitive data.

## Separate derived UI, validation, and effects

Use this decision table:

| Requirement | Mechanism |
| --- | --- |
| Render a conditional section from a value | `form.Subscribe` |
| Use a value in component logic | `useSelector` |
| Validate when another field changes | linked-field validation |
| Clear invalid dependent data | listener |
| Compute a submitted field | explicit field update, guarded against loops |
| Send analytics or autosave | debounced listener or a dedicated effect layer |

Do not use a listener merely to copy form state into React state. That creates two
sources of truth and additional synchronization failures.

## Accessibility implications

- Reactive UI must preserve logical focus order. If a focused element is removed,
  move focus to a stable, meaningful location.
- Announce important listener-driven changes, such as clearing a province after
  changing country, through visible text and an appropriate polite live region.
- Avoid announcing high-frequency derived values or autosave activity on every
  keystroke. Debounce both work and user-facing status.
- Keep submit controls understandable while state changes. If using
  `aria-disabled`, prevent the action in code and expose the reason nearby.
- Do not hide errors or instructions solely because a conditional section
  rerendered; maintain valid `aria-describedby` references.

## Pitfalls and anti-patterns

- Reading `form.state` during render and expecting reactive updates.
- Calling `useSelector(form.store)` without a selector.
- Selecting the whole state when only one primitive is needed.
- Using the deprecated `useStore` in new work.
- Putting side effects or mutations inside selectors.
- Using listeners for derived rendering or validation.
- Unconditionally mutating a field from another field's listener and creating a
  change loop.
- Starting un-debounced network calls from `onChange`.
- Assuming listener debouncing cancels in-flight requests.
- Autosaving secrets or incomplete data without a deliberate privacy and recovery
  policy.
- Mirroring TanStack values into component state.

## Related references

- [Foundations](./foundations.md)
- [Validation and errors](./validation-and-errors.md)
- [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md)
- [Submission and server workflows](./submission-and-server-workflows.md)
- [Accessibility and focus](./accessibility-and-focus.md)
- [Debugging and devtools](./debugging-and-devtools.md)

## Sources

- [Basic Concepts and Terminology](https://tanstack.com/form/latest/docs/framework/react/guides/basic-concepts)
- [Reactivity](https://tanstack.com/form/latest/docs/framework/react/guides/reactivity)
- [Side Effects for Event Triggers](https://tanstack.com/form/latest/docs/framework/react/guides/listeners)
