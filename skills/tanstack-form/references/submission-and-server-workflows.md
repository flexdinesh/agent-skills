# Submission and server workflows

## Read when

Read this reference when implementing submit buttons, multiple submit actions, async persistence, server validation, mutation errors, or reset-after-success behavior.

## Decision rules

1. Treat the server as authoritative. Client validation improves feedback, but the server must revalidate untrusted input before persistence.
2. Put value-dependent validation in `validators.onSubmit` or `validators.onSubmitAsync`. Put the successful side effect in `onSubmit`.
3. Use `onSubmitMeta` when several controls submit the same values with different intent. Keep the metadata small, typed, and non-authoritative.
4. Subscribe only to the submission state the UI consumes. `isSubmitting` usually
   controls duplicate prevention; use `canSubmit` when displaying validity or
   when an intentional gating policy requires it.
5. Prevent duplicate side effects while a submission is pending. Make the pending state visible in text, not only through color or animation.
6. Preserve values and returned errors after failure. Reset or navigate only after the authoritative operation succeeds.
7. For native `FormData` or progressively enhanced submissions, give every successful control a stable `name`. JavaScript state alone is not posted by the browser.
8. If a Standard Schema transforms values, parse inside `onSubmit` to obtain its output type. TanStack Form validates against the schema but passes the schema's **input** value to `onSubmit`.

## Core submission pattern

```tsx
const form = useForm({
  defaultValues: {
    email: '',
  },
  validators: {
    onSubmitAsync: async ({ value }) => {
      const result = await validateRegistration(value)

      return result.ok
        ? undefined
        : {
            form: 'Check the highlighted fields.',
            fields: result.fieldErrors,
          }
    },
  },
  onSubmit: async ({ value }) => {
    await createRegistration(value)
  },
})

return (
  <form
    onSubmit={(event) => {
      event.preventDefault()
      event.stopPropagation()
      void form.handleSubmit()
    }}
  >
    {/* Fields and accessible error output */}
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      )}
    </form.Subscribe>
  </form>
)
```

An async form validator may return both a form error and field-path errors:

```ts
return {
  form: 'The server rejected this submission.',
  fields: {
    email: 'This email is already registered.',
    'contacts[0].phone': 'This phone number is not valid.',
  },
}
```

Use paths that exactly match registered field names. Keep transport and unexpected failures distinct from correctable validation errors: show a recoverable form-level message for the former, and field-specific messages for the latter.

## Multiple submission intents

`onSubmitMeta` declares the default metadata type and value. Passing metadata to `handleSubmit` overrides that default for the current submission.

```tsx
type SubmitMeta = {
  intent: 'save' | 'save-and-close'
}

const defaultMeta: SubmitMeta = { intent: 'save' }

const form = useForm({
  defaultValues: { title: '' },
  onSubmitMeta: defaultMeta,
  onSubmit: async ({ value, meta }) => {
    await saveDocument(value)
    if (meta.intent === 'save-and-close') closeEditor()
  },
})

<form
  onSubmit={(event) => {
    event.preventDefault()
    void form.handleSubmit()
  }}
>
  {/* Pressing Enter uses the default "save" metadata. */}
  <button type="submit">Save</button>
  <button
    type="button"
    onClick={() => void form.handleSubmit({ intent: 'save-and-close' })}
  >
    Save and close
  </button>
</form>
```

Do not trust submit metadata for authorization, price, ownership, or other security decisions; the client can alter it.

## Standard Schema transformations

Validation does not replace the submitted input with a schema's transformed output:

```ts
const schema = z.object({
  age: z.string().transform(Number),
})

const defaultValues: z.input<typeof schema> = { age: '' }

const form = useForm({
  defaultValues,
  validators: { onChange: schema },
  onSubmit: ({ value }) => {
    const parsed: z.output<typeof schema> = schema.parse(value)
    return savePerson(parsed)
  },
})
```

Use a safe-parse equivalent when the schema library exposes one and failure remains possible at the submission boundary.

## Accessibility and robustness

- Keep a real form and submit control on the web so Enter-to-submit and assistive technology semantics work.
- Associate each server field error with its control using the same error rendering and `aria-describedby`/`aria-errormessage` strategy as client errors.
- Put a concise form-level summary near the start of the form. When a submit is rejected, focus the summary or first invalid control according to the product's focus policy.
- Announce an asynchronous failure or completion through an appropriate live region. Avoid repeatedly announcing every keystroke.
- `disabled` controls cannot receive focus. If users need to discover why submission is unavailable, do not rely solely on a permanently disabled button; expose the requirements and validate on attempted submission.
- Preserve an actionable label while pending (`Submitting…`), and consider `aria-busy` on the relevant form or result region.
- Make writes idempotent or otherwise duplicate-safe. A disabled button reduces accidental repeats but does not protect against retries, multiple tabs, or network replay.
- Clear stale server errors when their owning values change only when doing so will not hide useful feedback; otherwise revalidate deliberately.

## Pitfalls

- Calling the mutation from both the native `onSubmit` handler and TanStack Form's `onSubmit`.
- Forgetting `void form.handleSubmit()` in an event callback and leaving a floating promise under strict linting.
- Resetting in `finally`, which discards user input on error.
- Rendering raw rich error objects as React children instead of mapping them to safe, user-facing messages.
- Treating client validation or `onSubmitMeta` as a security boundary.
- Assuming schema coercion or transforms changed the `value` received by `onSubmit`.
- Omitting `name` attributes in a server-action or native `FormData` workflow.
- Catching every server exception and presenting it as a field validation error; unexpected failures need logging and a generic recoverable message.

## Related references

- [Validation and errors](validation-and-errors.md)
- [Accessibility and focus](accessibility-and-focus.md)
- [SSR and platforms](ssr-and-platforms.md)
- [State, reactivity, and listeners](state-reactivity-and-listeners.md)
- [TypeScript](typescript.md)

## Sources

- [Submission handling](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling)
- [Form and field validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [Custom errors](https://tanstack.com/form/latest/docs/framework/react/guides/custom-errors)
- [React meta-framework usage](https://tanstack.com/form/latest/docs/framework/react/guides/ssr)
