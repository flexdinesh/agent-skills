# Arrays, Linked Fields, and Form Groups

## Read when

Read this reference when a form contains a repeatable list, nested object paths,
cross-field validation, a reusable cluster of fields, or a multi-step flow.

## Choose the right mechanism

| Need | Use |
| --- | --- |
| Add, remove, replace, or reorder repeated values | A `mode="array"` field and its array helpers |
| Revalidate one field when another changes or blurs | `onChangeListenTo` or `onBlurListenTo` |
| Validate and submit one section of a larger form | `form.FormGroup` |
| Reuse the same typed cluster in unrelated forms | `withFieldGroup`; see [composition and UI integration](./composition-and-ui-integration.md) |

Keep one form instance when the sections ultimately produce one payload. Splitting
each wizard step into an independent form makes final submission, cross-step
validation, dirty state, and error recovery harder.

## Array fields

Declare the complete array shape in `defaultValues`, render the array field with
`mode="array"`, and register nested fields with bracket paths.

```tsx
type Person = { id: string; name: string; age: number }

const form = useForm({
  defaultValues: { people: [] as Person[] },
})
const rowRefs = useRef(new Map<string, HTMLInputElement>())
const addButtonRef = useRef<HTMLButtonElement>(null)
const [arrayStatus, setArrayStatus] = useState('')

<form.Field name="people" mode="array">
  {(people) => {
    const addPerson = () => {
      const person = { id: createPersonId(), name: '', age: 0 }
      people.pushValue(person)
      setArrayStatus('Person added.')
      requestAnimationFrame(() => rowRefs.current.get(person.id)?.focus())
    }

    const removePerson = (index: number) => {
      const removed = people.state.value[index]
      const nextFocusId =
        people.state.value[index + 1]?.id ??
        people.state.value[index - 1]?.id

      people.removeValue(index)
      setArrayStatus(`${removed.name || `Person ${index + 1}`} removed.`)
      requestAnimationFrame(() => {
        if (nextFocusId) rowRefs.current.get(nextFocusId)?.focus()
        else addButtonRef.current?.focus()
      })
    }

    return (
      <fieldset>
        <legend>People</legend>
        {people.state.value.map((person, index) => (
          <div key={person.id}>
            <form.Field name={`people[${index}].name`}>
              {(name) => {
                const errorId = `${name.name}-error`
                const showError =
                  name.state.meta.isTouched && !name.state.meta.isValid
                return (
                  <>
                    <label htmlFor={name.name}>
                      Name for person {index + 1}
                    </label>
                    <input
                      ref={(node) => {
                        if (node) rowRefs.current.set(person.id, node)
                        else rowRefs.current.delete(person.id)
                      }}
                      id={name.name}
                      name={name.name}
                      value={name.state.value}
                      onBlur={name.handleBlur}
                      onChange={(event) =>
                        name.handleChange(event.target.value)
                      }
                      aria-invalid={showError || undefined}
                      aria-describedby={showError ? errorId : undefined}
                    />
                    {showError ? (
                      <p id={errorId}>
                        {name.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </>
                )
              }}
            </form.Field>
            <button type="button" onClick={() => removePerson(index)}>
              Remove person {index + 1}
            </button>
          </div>
        ))}
        <button ref={addButtonRef} type="button" onClick={addPerson}>
          Add person
        </button>
        <p role="status">{arrayStatus}</p>
      </fieldset>
    )
  }}
</form.Field>
```

Available array helpers include:

- `pushValue(value)` and `insertValue(index, value)`
- `removeValue(index)` and `clearValues()`
- `replaceValue(index, value)`
- `swapValues(aIndex, bIndex)` and `moveValue(fromIndex, toIndex)`

Prefer these helpers over manually rebuilding the array. They express the
operation to the form and keep value and field bookkeeping aligned.

### Array identity and accessibility

- Use a stable item identifier as the React `key`, especially when removing or
  reordering. An array index is still required in the TanStack field path, but it
  is a poor React key for stateful controls.
- If a UI-only identifier must not be submitted, keep a parallel stable-key map
  or remove the identifier when constructing the server payload.
- Label each nested control with its item position or other unique context.
- Put add, remove, and reorder controls at `type="button"` so they cannot submit.
- Give icon-only controls an accessible name. Do not rely on an icon or position
  alone to distinguish repeated controls.
- Announce add, remove, and reorder outcomes through a restrained live status,
  and deliberately move focus after removing the currently focused item.
- Use `fieldset` and `legend` when the collection is conceptually one group.

## Linked-field validation

Place the validator on the dependent field and list every field that must cause it
to re-run. `onChangeListenTo` follows change validation; `onBlurListenTo` follows
blur validation.

```tsx
<form.Field
  name="confirmEmail"
  validators={{
    onChangeListenTo: ['email'],
    onChange: ({ value, fieldApi }) =>
      value === fieldApi.form.getFieldValue('email')
        ? undefined
        : 'Email addresses do not match',
  }}
>
  {(field) => {
    const errorId = `${field.name}-error`
    const showError =
      field.state.meta.isTouched && !field.state.meta.isValid

    return (
      <>
        <label htmlFor={field.name}>Confirm email</label>
        <input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
        />
        {showError ? (
          <p id={errorId}>{field.state.meta.errors.join(', ')}</p>
        ) : null}
      </>
    )
  }}
</form.Field>
```

Decision rules:

- Use linked-field validation when another field affects validity. Use a field
  listener only for a genuine side effect, such as clearing an invalid dependent
  selection.
- Make dependency direction explicit. In the confirmation example, confirmation
  depends on the source field, not the reverse.
- Keep the validator pure and read dependencies through `fieldApi.form` (or the
  group API inside `withFieldGroup`).
- Avoid circular dependency graphs and expensive async work on every linked
  change. Choose blur or debounce when appropriate.
- Revalidate any server-enforced invariant at submission time; linked client
  validation improves feedback but is not a security boundary.

Expose a linked error on the dependent input with `aria-invalid` and
`aria-describedby`. Avoid assertive announcements on every keystroke unless the
message is critical; blur or submit timing is often less disruptive.

## Form groups and multi-step forms

`form.FormGroup` scopes values, validation, submission attempts, and metadata to a
subtree of the parent form.

```tsx
const [step, setStep] = useState(0)
const form = useForm({
  defaultValues: {
    identity: { name: '' },
    profile: { age: 0 },
  },
  validationLogic: revalidateLogic(),
})

{step === 0 ? (
  <form.FormGroup
    name="identity"
    validators={{ onDynamic: identitySchema }}
    onGroupSubmit={() => setStep(1)}
  >
    {(group) => (
      <section aria-labelledby="identity-heading">
        <h2 id="identity-heading">Step 1 of 2: Identity</h2>
        {/* Register fields with their full parent paths. */}
        <form.Field name="identity.name">{/* control */}</form.Field>
        <button
          type="button"
          disabled={group.state.meta.isSubmitting}
          onClick={() => void group.handleSubmit()}
        >
          Continue
        </button>
      </section>
    )}
  </form.FormGroup>
) : (
  <form.FormGroup name="profile">
    {() => (
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading">Step 2 of 2: Profile</h2>
        <form.Field name="profile.age">{/* control */}</form.Field>
        <button type="submit">Submit all steps</button>
      </section>
    )}
  </form.FormGroup>
)}
```

Call `group.handleSubmit()` to validate and submit only the group. Call
`form.handleSubmit()` for the final whole-form submission. Do not create nested
HTML `<form>` elements; HTML does not support them.

Group validators may return a group error and relative field errors:

```tsx
<form.FormGroup
  name="identity"
  validators={{
    onChange: ({ value }) =>
      value.name
        ? undefined
        : {
            group: 'Identity is incomplete',
            fields: {
              // Relative to "identity", not "identity.name".
              name: 'Enter a name',
            },
          },
  }}
/>
```

Standard Schema validators can validate the group subtree. Compose the same
sub-schema into the parent schema so the final submission cannot bypass an
unvisited step.

When using `revalidateLogic()` and `onDynamic`, put the step sub-schema on the
`FormGroup`. A parent `onDynamic` validator responds to parent submission; it does
not provide the group submission lifecycle.

Useful group metadata:

- `isFieldsValid`: all field-level validators in the group pass.
- `isGroupValid`: group-level validators pass.
- `isValid`: both levels pass.
- `isSubmitting`: the group submission is pending.

For a wizard, announce the new step, move focus to its heading, preserve entered
values when steps unmount, keep Back available, and focus or summarize the first
invalid field when advancement fails. Do not use color alone to communicate
current, complete, or invalid steps.

## Pitfalls

- Using the array index as a React key for removable or reorderable rows.
- Mutating `field.state.value` or rebuilding it instead of using array helpers.
- Omitting defaults for nested items, producing uncontrolled-to-controlled
  warnings and weak inference.
- Forgetting `onChangeListenTo`, leaving stale confirmation errors after the
  source field changes.
- Using a listener to implement validation when linked validators model the
  dependency directly.
- Sending group field-error keys as full paths instead of paths relative to the
  group.
- Expecting the parent `onDynamic` validator to run on `group.handleSubmit()`.
- Advancing a wizard before the group submission succeeds.
- Treating hidden or unvisited steps as exempt from final server validation.

## Related references

- [Validation and errors](./validation-and-errors.md)
- [State, reactivity, and listeners](./state-reactivity-and-listeners.md)
- [Composition and UI integration](./composition-and-ui-integration.md)
- [Accessibility and focus](./accessibility-and-focus.md)
- [Submission and server workflows](./submission-and-server-workflows.md)

## Sources

- [Arrays guide](https://tanstack.com/form/latest/docs/framework/react/guides/arrays)
- [Form Groups guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-groups)
- [Linked Fields guide](https://tanstack.com/form/latest/docs/framework/react/guides/linked-fields)
- [FieldApi array methods](https://tanstack.com/form/latest/docs/reference/classes/FieldApi)
- [Array example](https://tanstack.com/form/latest/docs/framework/react/examples/array)
- [Multi-Step Wizard example](https://tanstack.com/form/latest/docs/framework/react/examples/multi-step-wizard)
