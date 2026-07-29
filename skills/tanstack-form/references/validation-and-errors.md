# Validation and Errors

## Read when

Read this when choosing validation timing or ownership, adding synchronous,
asynchronous, dynamic, cross-field, schema, server, or custom errors, or deciding
how errors should be displayed.

## Choose timing from the user interaction

- Use `onChange` for cheap constraints that help while typing, but avoid showing
  noisy errors before the user has meaningfully interacted.
- Use `onBlur` when feedback should appear after a user finishes a field. Forward
  both `onChange` and `onBlur` from the control.
- Use `onSubmit` for final checks and server-shaped rules.
- Use `onChangeAsync` or `onBlurAsync` only for work that is genuinely
  asynchronous. Debounce change-triggered network validation.
- Use `onDynamic` when timing must change after submission. It is disabled unless
  `validationLogic: revalidateLogic(...)` is configured.

A common accessible policy is submit-first validation, followed by change or blur
validation so users receive prompt feedback while correcting errors:

```tsx
import { revalidateLogic, useForm } from '@tanstack/react-form'

const form = useForm({
  defaultValues: { email: '' },
  validationLogic: revalidateLogic({
    mode: 'submit',
    modeAfterSubmission: 'blur',
  }),
  validators: {
    onDynamic: ({ value }) =>
      value.email
        ? undefined
        : {
            fields: {
              email: 'Enter an email address',
            },
          },
  },
  onSubmit: async ({ value }) => createAccount(value),
})
```

Without `revalidateLogic`, `onDynamic` is never called. Its default modes are
`submit` before the first submission and `change` afterward.

## Choose ownership by rule scope

- Put a rule on `form.Field` when it concerns one field and should travel with
  that field.
- Put a rule on `useForm` when it concerns the whole value, multiple fields, or a
  server response.
- For linked field dependencies and explicit revalidation, see
  [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md).
- Do not define the same rule at both levels. A field-specific error can overwrite
  an error assigned to that field by a form validator for the same event.

Form validators can return a form error, field errors, or both:

```tsx
const form = useForm({
  defaultValues: {
    password: '',
    confirmPassword: '',
  },
  validators: {
    onSubmit: ({ value }) =>
      value.password === value.confirmPassword
        ? undefined
        : {
            form: 'Check the highlighted fields',
            fields: {
              confirmPassword: 'Passwords do not match',
            },
          },
  },
  onSubmit: async ({ value }) => register(value),
})
```

Use exact TanStack field paths for nested field errors, such as
`details.email` or `socials[0].url`.

## Bind validation and errors accessibly

```tsx
<form.Field
  name="email"
  validators={{
    onBlur: ({ value }) =>
      value.includes('@') ? undefined : 'Enter a valid email address',
    onChangeAsyncDebounceMs: 600,
    onChangeAsync: async ({ value }) =>
      value && (await emailIsRegistered(value))
        ? 'That email is already registered'
        : undefined,
  }}
>
  {(field) => {
    const showError = field.state.meta.isBlurred && !field.state.meta.isValid
    const errorId = `${field.name}-error`

    return (
      <div>
        <label htmlFor={field.name}>Email</label>
        <input
          id={field.name}
          name={field.name}
          type="email"
          value={field.state.value}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? errorId : undefined}
        />
        {showError ? (
          <p id={errorId}>{field.state.meta.errors.map(String).join(', ')}</p>
        ) : null}
        <p role="status">
          {field.state.meta.isValidating ? 'Checking email…' : ''}
        </p>
      </div>
    )
  }}
</form.Field>
```

Synchronous validation runs before the matching asynchronous validator. By
default, async validation is skipped when sync validation fails; `asyncAlways`
opts into running it anyway. A field-wide `asyncDebounceMs` can be overridden by
event-specific options such as `onChangeAsyncDebounceMs`.

Debouncing limits request frequency but does not define server consistency.
Design remote validation and final submission for stale responses, cancellation
where supported, authorization, and server-side revalidation.

## Select an error representation

Validators may return any type. Truthy values are errors; `undefined`, `null`, and
other falsy values mean valid. Prefer strings unless the UI genuinely needs a
typed error code, severity, or structured remediation.

```tsx
type EmailError = {
  code: 'invalid_format' | 'already_used'
  message: string
}

<form.Field
  name="email"
  validators={{
    onBlur: ({ value }): EmailError | undefined =>
      value.includes('@')
        ? undefined
        : { code: 'invalid_format', message: 'Enter a valid email address' },
  }}
>
  {(field) => {
    const error = field.state.meta.errorMap.onBlur
    return error ? <p id={`${field.name}-error`}>{error.message}</p> : null
  }}
</form.Field>
```

`field.state.meta.errors` flattens validator results by one array level by
default. `errorMap` provides errors by event and preserves each validator's
inferred return type. Use `disableErrorFlat` only when the UI must preserve the
nested array shape of an array-valued validator result; it is not required to
distinguish change, blur, and submit sources.

Do not render arbitrary error objects with `String(error)`; define a stable,
human-readable message projection. If a validator returns an array, decide
whether the default one-level flattening or `disableErrorFlat` matches the UI's
error model.

## Standard Schema validators

Pass a current Standard Schema-compatible schema directly to a form or field
validator. Form-level schema issues propagate by field path.

```tsx
import { z } from 'zod'

const accountSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  age: z.number().min(18, 'You must be at least 18'),
})

const form = useForm({
  defaultValues: { email: '', age: 18 },
  validators: { onSubmit: accountSchema },
  onSubmit: async ({ value }) => createAccount(value),
})
```

Validation does not replace the submitted `value` with a schema's transformed
output. If coercion or transformation is required, parse at the submission
boundary and handle parse failures explicitly. Standard Schema form errors have a
different typed shape from string-returning function validators; inspect and
render their issue messages instead of assuming a string.

## Accessibility implications

- Associate each visible error with its control via `aria-describedby` and set
  `aria-invalid` when that error is shown.
- Keep instructions in the accessibility description when an error appears;
  include both IDs in `aria-describedby` instead of replacing useful help.
- Avoid announcing every keystroke as an alert. Reserve assertive live regions for
  important submit-time failures; ordinary inline feedback can be non-live or
  polite.
- On an invalid submission, provide a summary and move focus to the summary or the
  first invalid control according to a consistent policy.
- Keep the submit control operable when possible. An `aria-disabled` control still
  needs code that blocks invalid submission and explains the errors.
- Never use color alone to indicate validity, and do not erase values after
  validation or server failure.

See [Accessibility and focus](./accessibility-and-focus.md) for the complete
invalid-submit and announcement pattern.

## Pitfalls and anti-patterns

- Running remote validation on every keystroke without debouncing.
- Treating client-side validation as authorization or server enforcement.
- Configuring `onDynamic` without `revalidateLogic`.
- Showing untouched-field errors immediately on initial render.
- Forgetting `field.handleBlur` while relying on blur validation.
- Returning truthy “success” objects from a validator; every truthy result is an
  error.
- Assuming schema transforms change the value supplied to `onSubmit`.
- Blindly joining structured errors, schema issues, or arrays as strings.
- Duplicating one rule at form and field level and relying on error precedence.
- Disabling submit without offering an understandable route to correction.

## Related references

- [Foundations](./foundations.md)
- [State, reactivity, and listeners](./state-reactivity-and-listeners.md)
- [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md)
- [Submission and server workflows](./submission-and-server-workflows.md)
- [Accessibility and focus](./accessibility-and-focus.md)

## Sources

- [Form and Field Validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [Dynamic Validation](https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation)
- [Custom Errors](https://tanstack.com/form/latest/docs/framework/react/guides/custom-errors)
