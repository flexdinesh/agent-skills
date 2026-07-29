# SSR and platforms

## Read when

Read this reference when a form crosses a server-rendering boundary, uses framework actions/loaders, must work before hydration, or runs in React Native.

## Decision rules

1. Identify the runtime first: generic React SSR, TanStack Start, Next.js App Router, Remix, or React Native. Do not mix adapter APIs.
2. Keep one shared `formOptions` definition for the value shape and defaults when a framework adapter supports client/server form-state exchange.
3. Validate again on the server. Client validators are a user-experience layer, not an authorization or integrity boundary.
4. Return structured validation state from expected server validation failures, then merge it into the client form. Throw or separately handle unexpected operational failures.
5. Keep the initial server and client values deterministic. A mismatch in defaults, conditional fields, locale output, or generated IDs can cause hydration problems.
6. Preserve native form semantics and valid `name` attributes when the workflow posts `FormData`.
7. React Native uses the same headless field state but native event props and accessibility primitives; it has no HTML form submission or hydration layer.

## Generic React SSR

`@tanstack/react-form` is framework-agnostic and supports SSR. For a client-managed form rendered on the server:

- Produce the same complete `defaultValues` during server render and initial hydration.
- Keep browser-only APIs out of render and initial option construction.
- Do not generate defaults from current time, randomness, or client-only storage during render. Load those values before rendering or update/reset deliberately after hydration.
- If server submission state must survive a navigation or non-JavaScript POST, define an explicit serialization and merge contract. Do not invent an adapter-specific API for a framework that does not provide one.
- Test both hydrated interaction and the intended no-JavaScript/progressive-enhancement path.

## TanStack Start

Use `@tanstack/react-form-start` for the adapter APIs:

- `formOptions` shares the form shape.
- `createServerValidate` parses `FormData` and runs `onServerValidate`.
- `ServerValidateError` identifies expected validation failures; its response can be returned.
- `getFormData` retrieves server form state for a loader.
- `useTransform` with `mergeForm` merges loader state into the client form.

```ts
export const formOpts = formOptions({
  defaultValues: { email: '', age: 0 },
})

const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: ({ value }) =>
    value.age < 13 ? 'You must be at least 13.' : undefined,
})
```

The route posts `multipart/form-data` to the server function, obtains returned state in a loader, and merges it into `useForm`. Ensure input `name` values match the declared field paths.

## Next.js App Router

The official integration is specifically for App Router and React Server Actions. Use `@tanstack/react-form-nextjs`:

- Define shared `formOptions` in code safe to import on both sides.
- In the server action, call `createServerValidate`; return `ServerValidateError.formState` for expected validation failures.
- In the client component, combine React's `useActionState` with `initialFormState`.
- Use `useTransform((base) => mergeForm(base, state), [state])`.
- Call `form.handleSubmit()` from the form submission path so client form state advances alongside the server action.

```tsx
'use client'

const [serverState, action] = useActionState(saveAction, initialFormState)
const form = useForm({
  ...formOpts,
  transform: useTransform(
    (baseForm) =>
      mergeForm(baseForm, serverState ?? initialFormState),
    [serverState],
  ),
})

return (
  <form action={action as never} onSubmit={() => void form.handleSubmit()}>
    {/* … */}
  </form>
)
```

Keep client hooks in a client component. Import server-safe adapter exports in server/shared modules and client exports in client modules as documented; the wrong boundary can trigger the Next.js `useState`/client-component import error.

## Remix

Use `@tanstack/react-form-remix` for shared `formOptions`, `createServerValidate`, `ServerValidateError`, and `initialFormState`:

- Read `request.formData()` in the route `action`.
- Return `ServerValidateError.formState` for expected validation failures.
- Read the result with `useActionData`.
- Merge `actionData ?? initialFormState` through `useTransform` and `mergeForm`.
- Render Remix's `<Form method="post">` and invoke `form.handleSubmit()` in its submit path.

This preserves Remix's action/navigation model while hydrating TanStack Form with authoritative errors.

## React Native

TanStack Form is headless and requires no special React Native configuration. Adapt the control contract:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) =>
      value < 13 ? 'You must be at least 13.' : undefined,
  }}
>
  {(field) => {
    const showError =
      field.state.meta.isTouched && !field.state.meta.isValid

    return (
      <>
        <Text>Age</Text>
        <TextInput
          value={String(field.state.value)}
          onChangeText={(text) => field.handleChange(Number(text))}
          onBlur={field.handleBlur}
          accessibilityLabel="Age"
        />
        {showError ? (
          <Text>{field.state.meta.errors.join(', ')}</Text>
        ) : null}
      </>
    )
  }}
</form.Field>
```

Normalize native text values at the component boundary, account for platform
keyboard behavior, and use React Native accessibility labels, hints, state, and
announcements rather than web-only `aria-*` assumptions. `accessibilityLabelledBy`
and `accessibilityLiveRegion` are Android-only; provide a cross-platform
`accessibilityLabel`, use an Android live region where appropriate, and announce
important iOS changes through `AccessibilityInfo` when focus does not convey
them.

## Accessibility and robustness

- Server-render labels, descriptions, and errors with stable IDs so associations survive hydration.
- When returned server state adds errors, announce the form-level result and move focus according to the same invalid-submit policy used for client errors.
- A progressively enhanced POST must remain understandable without client-only toast messages.
- Preserve user-entered values on validation and operational failures.
- Reject malformed payloads before validation, authenticate and authorize on the server, and never trust hidden controls or submit metadata.
- Avoid exposing stack traces, database errors, or sensitive validation details in serialized form state.
- React Native screen-reader behavior differs across iOS and Android; test labels, error announcements, focus, and keyboard dismissal on both target platforms.

## Pitfalls

- Importing adapter functions from the wrong package or runtime boundary.
- Maintaining separate client and server defaults that silently drift.
- Returning a generic thrown error for correctable validation failures, losing field targeting.
- Rendering server errors but failing to merge them into TanStack Form state.
- Omitting input `name` attributes from `FormData` workflows.
- Assuming JavaScript interception provides progressive enhancement; test the native action path.
- Reusing HTML event code such as `event.target.value` with React Native's `onChangeText`.
- Applying web ARIA attributes to native components without verifying React Native support.

## Related references

- [Submission and server workflows](submission-and-server-workflows.md)
- [Validation and errors](validation-and-errors.md)
- [Accessibility and focus](accessibility-and-focus.md)
- [Foundations](foundations.md)
- [Debugging and devtools](debugging-and-devtools.md)

## Sources

- [React meta-framework usage](https://tanstack.com/form/latest/docs/framework/react/guides/ssr)
- [Usage with React Native](https://tanstack.com/form/latest/docs/framework/react/guides/react-native)
- [TanStack Start form example](https://tanstack.com/form/latest/docs/framework/react/examples/tanstack-start)
- [Next server actions form example](https://tanstack.com/form/latest/docs/framework/react/examples/next-server-actions)
- [Remix form example](https://tanstack.com/form/latest/docs/framework/react/examples/remix)
