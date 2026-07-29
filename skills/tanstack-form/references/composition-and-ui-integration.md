# Form Composition and UI Integration

## Read when

Read this reference when building reusable field primitives, binding TanStack Form
to a component library, splitting a large form across files, or sharing typed
field groups between forms.

## Composition ladder

Choose the least abstraction that removes real repetition:

1. Use `form.Field` render props for a small or unique form.
2. Use `createFormHookContexts` and `createFormHook` to bind application field and
   form components once.
3. Use `withForm` to split one form into type-safe feature components.
4. Use `withFieldGroup` for a reusable typed subset that can live at different
   paths in different forms.
5. Use typed form context only when an integration boundary prevents passing the
   form; it has weaker runtime protection.

Do not start with a universal input abstraction. Different controls expose
different event values, focus behavior, constraints, and accessibility contracts.

## Create one application form hook

Create the contexts once and import those exact exports everywhere. A component
using a context from another `createFormHookContexts()` call will not receive the
field or form instance.

```tsx
import {
  createFormHook,
  createFormHookContexts,
} from '@tanstack/react-form'

export const {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} = createFormHookContexts()

function TextField({
  label,
  description,
}: {
  label: string
  description?: string
}) {
  const field = useFieldContext<string>()
  const descriptionId = `${field.name}-description`
  const errorId = `${field.name}-error`
  const showError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <div>
      <label htmlFor={field.name}>{label}</label>
      {description ? <p id={descriptionId}>{description}</p> : null}
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={showError || undefined}
        aria-describedby={
          [description ? descriptionId : null, showError ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      {showError ? (
        <p id={errorId}>{field.state.meta.errors.join(', ')}</p>
      ) : null}
    </div>
  )
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : children}
        </button>
      )}
    </form.Subscribe>
  )
}

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: { SubmitButton },
})
```

Use `AppField` to provide field context and `AppForm` to provide form context:

```tsx
const form = useAppForm({
  defaultValues: { email: '' },
})

<form.AppForm>
  <form.AppField name="email">
    {(field) => (
      <field.TextField
        label="Email"
        description="We will send the receipt to this address."
      />
    )}
  </form.AppField>
  <form.SubmitButton>Save</form.SubmitButton>
</form.AppForm>
```

The context values are stable class instances; subscribe to selected store state
inside components rather than copying all form state into React context.

## Adapt UI-library control contracts

TanStack Form is headless. Inspect the actual control API and normalize it at the
adapter boundary:

| Control contract | Adapter |
| --- | --- |
| Text input DOM event | `event => field.handleChange(event.target.value)` |
| Number input DOM event | `event => field.handleChange(event.target.valueAsNumber)` with explicit empty/invalid handling |
| Native checkbox | `event => field.handleChange(event.target.checked)` |
| Boolean-or-indeterminate callback | `checked => field.handleChange(checked === true)` |
| Select returning an option object | Extract the domain value before `handleChange` |
| Date picker returning `Date \| null` | Match that exact type in `defaultValues` |

Prefer a controlled `value` or `checked` prop bound to `field.state.value`. Preserve
`field.handleBlur`; blur validation and touched behavior depend on it. Ensure the
component forwards a ref when focus management needs to target the underlying
control.

```tsx
<form.Field name="acceptedTerms">
  {(field) => {
    const errorId = `${field.name}-error`
    const showError =
      field.state.meta.isTouched && !field.state.meta.isValid

    return (
      <>
        <LibraryCheckbox
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked === true)}
          onBlur={field.handleBlur}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
        >
          Accept the terms
        </LibraryCheckbox>
        {showError ? (
          <p id={errorId}>{field.state.meta.errors.join(', ')}</p>
        ) : null}
      </>
    )
  }}
</form.Field>
```

Do not assume a UI library supplies accessible labeling and errors merely because
it renders a label-shaped component. Verify the resulting DOM and keyboard
behavior:

- The control has an accessible name and stable `id`/`name`.
- Help and error text are connected with `aria-describedby`.
- Invalid state reaches the actual focusable element with `aria-invalid`.
- Required state is conveyed semantically, not only with an asterisk.
- Composite controls support expected keyboard interaction and expose focus.
- Disabled and pending states remain perceivable; submission errors remain
  reachable.

Keep library-specific props inside the adapter. Feature forms should express
domain intent such as `label`, `description`, and validation rather than know each
vendor's event shape.

## Split large forms with `withForm`

`withForm` keeps deep field names and values inferred without manually threading
generic parameters.

```tsx
const accountOptions = formOptions({
  defaultValues: {
    email: '',
    displayName: '',
  },
})

const AccountFields = withForm({
  ...accountOptions,
  props: { heading: 'Account' },
  render: function Render({ form, heading }) {
    return (
      <section aria-labelledby="account-heading">
        <h2 id="account-heading">{heading}</h2>
        <form.AppField name="email">
          {(field) => <field.TextField label="Email" />}
        </form.AppField>
      </section>
    )
  },
})
```

The `defaultValues` and `props` supplied to `withForm` are type scaffolding and
render defaults; the parent form owns the runtime values. Prefer a named
`function Render` when the render body uses hooks so React Hooks linting recognizes
it as a component.

Passing the form explicitly is safer than reaching through
`useTypedAppFormContext`. Use typed context only for hard boundaries such as an
outlet that cannot accept props, and pass matching `formOptions`; mismatches are
not automatically detected at runtime.

Repeatedly extending a custom app form increases TypeScript work. The official
guide recommends keeping extension chains to roughly three to five. Prefer
feature-level composition when the component registry would otherwise grow
without bound.

## Reuse a typed group with `withFieldGroup`

Use `withFieldGroup` when one field cluster belongs in multiple form shapes or
paths. Its `defaultValues` describe the required keys for type mapping; they do
not initialize the parent form at runtime.

```tsx
const ContactFields = withFieldGroup({
  defaultValues: {
    email: '',
    confirmEmail: '',
  },
  render: function Render({ group }) {
    return (
      <>
        <group.AppField name="email">
          {(field) => <field.TextField label="Email" />}
        </group.AppField>
        <group.AppField
          name="confirmEmail"
          validators={{
            onChangeListenTo: ['email'],
            onChange: ({ value }) =>
              value === group.getFieldValue('email')
                ? undefined
                : 'Email addresses do not match',
          }}
        >
          {(field) => <field.TextField label="Confirm email" />}
        </group.AppField>
      </>
    )
  },
})

<ContactFields form={form} fields="billingContact" />
```

Groups can map object keys to different deep keys. Top-level arrays and records
can be groups, but TypeScript limitations prevent mapping their individual keys.
`createFieldMap(defaultValues)` is convenient for an object group mapped to
same-named top-level fields.

Unlike `withForm`, a field group cannot constrain every validator error type.
Reusable error components must safely render `unknown` errors or normalize them
before display.

## Bundle and loading considerations

A large registry of eagerly imported field components can put every component in
every consumer bundle. Register `React.lazy` components and place an intentional
`Suspense` boundary around the form when code splitting materially helps. Make the
fallback accessible and avoid replacing a form the user has already begun editing.

## Pitfalls

- Calling `createFormHookContexts()` separately in the provider and consumer.
- Wrapping every control behind one prop-heavy abstraction before its contract is
  understood.
- Passing a DOM event to `handleChange` instead of the typed value.
- Using `defaultValue` while expecting later form-state changes or resets to update
  the control.
- Dropping `onBlur`, `name`, accessible labeling, described-by relationships, or
  ref forwarding in a UI adapter.
- Treating `withForm` defaults as runtime initialization.
- Using typed context as the default composition mechanism despite its weaker
  mismatch detection.
- Deeply chaining app-form extensions and degrading editor/type-check performance.
- Assuming a reusable field group's error values are always strings.
- Registering hundreds of eager components without checking bundle impact.

## Related references

- [Foundations](./foundations.md)
- [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md)
- [State, reactivity, and listeners](./state-reactivity-and-listeners.md)
- [Accessibility and focus](./accessibility-and-focus.md)
- [TypeScript](./typescript.md)
- [Examples catalog](./examples-catalog.md)

## Sources

- [Form Composition guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)
- [UI Libraries guide](https://tanstack.com/form/latest/docs/framework/react/guides/ui-libraries)
- [Large Form example](https://tanstack.com/form/latest/docs/framework/react/examples/large-form)
- [UI Libraries example](https://tanstack.com/form/latest/docs/framework/react/examples/ui-libraries)
