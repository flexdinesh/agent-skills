# Foundations

## Read when

Read this before creating a React form, defining its value shape, loading initial
data, binding controls, or implementing reset behavior. Continue with the more
specialized references once the basic form contract is sound.

## Start with the data contract

1. Model the complete submitted value shape before rendering fields.
2. Give every controlled field a defined initial value. Prefer `''`, `false`, `0`,
   or `[]` as appropriate instead of switching between `undefined` and a value.
3. Let `defaultValues` infer field paths and value types. Add an explicit domain
   type when it improves the boundary with an API.
4. Use `formOptions` for reusable base configuration. Pass those options into
   `useForm` and add instance-specific behavior such as `onSubmit`.
5. Keep transport conversion at a boundary: DOM strings should become numbers,
   dates, or booleans before calling `field.handleChange`.

```tsx
import { formOptions, useForm } from '@tanstack/react-form'

type Profile = {
  displayName: string
  age: number
  marketingConsent: boolean
}

const defaultProfile: Profile = {
  displayName: '',
  age: 18,
  marketingConsent: false,
}

const profileOptions = formOptions({
  defaultValues: defaultProfile,
})

function ProfileForm() {
  const form = useForm({
    ...profileOptions,
    onSubmit: async ({ value }) => saveProfile(value),
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="displayName">
        {(field) => {
          const errorId = `${field.name}-error`
          const showError = field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <div>
              <label htmlFor={field.name}>Display name</label>
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
                <p id={errorId}>
                  {field.state.meta.errors.map(String).join(', ')}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>

      <button type="submit">Save profile</button>
    </form>
  )
}
```

`noValidate` is a product decision, not a TanStack requirement. Use it when the
application deliberately owns validation messages and focus behavior; otherwise,
native constraint validation can remain part of the experience.

## Field and form responsibilities

- A `form` instance owns values, validation, submission, and methods such as
  `setFieldValue` and `reset`.
- `form.Field` registers a typed path. Its render function receives the current
  field snapshot plus `handleChange` and `handleBlur`.
- Always forward a control's change and blur events when the chosen validation and
  interaction model depends on them.
- Set the native `name` attribute as well as an `id`. TanStack's field path is a
  useful default for both, but generate a page-unique `id` if multiple forms can
  contain the same path.
- Use `form.Subscribe` or `useSelector` for form state outside a field render
  function. Reading `form.state` directly does not subscribe React to changes.

## Understand interaction metadata

Use metadata for its documented meaning:

- `isTouched`: the user has changed or blurred the field.
- `isDirty`: the field has been changed at least once. It stays dirty even when
  the value is changed back to its default.
- `isPristine`: the inverse of persistent `isDirty`.
- `isBlurred`: the field has lost focus.
- `isDefaultValue`: the current value equals the default value.
- `isValidating`: asynchronous validation is currently running.
- `errors` combines relevant validation errors; `errorMap` preserves their event
  source and inferred error type.

Use `!isDefaultValue` when the requirement is “different from the initial value.”
Do not use persistent `isDirty` for that requirement.

## Async initial values

Fetching, caching, loading, and retry states belong to a data-loading layer.
Prefer mounting the form only after required data is available, so user edits
cannot be overwritten by a late response:

```tsx
function ProfileRoute() {
  const profile = useProfileQuery()

  if (profile.isPending) return <p aria-live="polite">Loading profile…</p>
  if (profile.isError) return <LoadError retry={profile.refetch} />

  return <LoadedProfileForm initialProfile={profile.data} />
}

function LoadedProfileForm({ initialProfile }: { initialProfile: Profile }) {
  const form = useForm({
    defaultValues: initialProfile,
    onSubmit: async ({ value }) => saveProfile(value),
  })

  return <form>{/* fields */}</form>
}
```

If the form must remain mounted while a different record loads, define the merge
policy explicitly. Reset to the new server snapshot only when safe, or ask the
user before discarding dirty edits. Treat load errors and empty data as distinct
states. Do not pretend placeholder values are successfully loaded data.

## Reset deliberately

TanStack state and the browser's native reset algorithm are separate. Prefer a
button that invokes `form.reset()`:

```tsx
<button type="button" onClick={() => form.reset()}>
  Reset changes
</button>
```

If the button must use `type="reset"`, call `event.preventDefault()` before
`form.reset()`. Otherwise native controls, especially selects, can reset to HTML
defaults that disagree with TanStack state. Confirm destructive resets when users
could lose meaningful work, and restore focus to a sensible control afterward.

## Accessibility implications

- Use a semantic `<form>` and an actual submit button so keyboard and assistive
  technology behavior works without custom key handlers.
- Give every control a persistent programmatic label. Placeholder text is not a
  label.
- Connect help and error text with `aria-describedby`; add `aria-invalid` only
  while the displayed value is invalid.
- Do not reveal errors before the chosen interaction point merely because a
  default value is technically invalid.
- Expose loading, saving, and validation progress in text. Do not rely only on
  animation, color, or a disabled control.
- Preserve user-entered values after recoverable failures.

See [Accessibility and focus](./accessibility-and-focus.md) for error summaries,
live regions, invalid-submit focus, and dynamic content.

## Pitfalls and anti-patterns

- Incomplete defaults that create uncontrolled-to-controlled React warnings.
- Passing DOM events to `field.handleChange` when the field expects a value.
- Treating `isDirty` as value inequality instead of persistent interaction state.
- Reading a non-reactive `form.state` snapshot and expecting React to update.
- Loading data inside validation or submission code instead of an explicit data
  state.
- Automatically resetting when a refetch completes, thereby erasing dirty edits.
- Combining native reset behavior with `form.reset()`.
- Omitting `type="button"` from non-submit buttons inside a form.
- Using field array indexes or paths as page-global IDs without considering
  duplicate forms.

## Related references

- [Validation and errors](./validation-and-errors.md)
- [State, reactivity, and listeners](./state-reactivity-and-listeners.md)
- [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md)
- [Submission and server workflows](./submission-and-server-workflows.md)
- [TypeScript](./typescript.md)

## Sources

- [React Quick Start](https://tanstack.com/form/latest/docs/framework/react/quick-start)
- [Basic Concepts and Terminology](https://tanstack.com/form/latest/docs/framework/react/guides/basic-concepts)
- [Async Initial Values](https://tanstack.com/form/latest/docs/framework/react/guides/async-initial-values)
