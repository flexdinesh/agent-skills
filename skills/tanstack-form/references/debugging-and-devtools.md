# Debugging and devtools

## Read when

Read this reference when a field does not update, errors appear at the wrong time, a form rerenders unexpectedly, React reports a controlled-value warning, TypeScript loses a field type, or live form state needs inspection.

## Debugging sequence

1. Reproduce with the smallest value shape, one field, and one validator.
2. Inspect `defaultValues`, the field `name`, the rendered control's `value`/`checked`, and the event passed to `field.handleChange`.
3. Inspect field metadata: `isTouched`, `isValidating`, `errors`, and `errorMap`.
4. Inspect form state through a narrow `form.Subscribe` or `useSelector`: `values`, `errorMap`, `canSubmit`, `isSubmitting`, and submission attempts as relevant.
5. Temporarily remove wrappers and UI-library adapters to verify the native field contract.
6. Use TanStack Form Devtools to inspect registration and live state.
7. If the failure is type-only, capture the TypeScript version, exact TanStack Form patch, and a minimal reproduction.

## Controlled-value warnings

React's “changing an uncontrolled input to be controlled” warning usually means the field initially rendered as `undefined` and later received a defined value. Supply complete defaults at `useForm` or field level:

```tsx
const form = useForm({
  defaultValues: {
    profile: {
      displayName: '',
    },
    newsletter: false,
    tags: [] as string[],
  },
})
```

Do not silence the warning with arbitrary `value ?? ''` conversions unless an empty string is truly the domain/UI boundary. A number, boolean, collection, or nullable value needs an explicit conversion policy.

## Unknown field values

If `field.state.value` becomes `unknown`, the form's type may be too large for TanStack Form to evaluate safely.

- Prefer a more specific value type.
- Break very large, independent workflows into smaller forms or form groups.
- Keep reusable components generic over the smallest path/value surface they need.
- Use a local cast only as a documented last resort after runtime shape is guaranteed.

```ts
const displayName = field.state.value as string
```

A cast hides the symptom; it does not restore end-to-end type safety.

## Excessively deep type instantiation

`Type instantiation is excessively deep and possibly infinite` is a compile-time TypeScript failure, not a runtime failure. Reduce the case and verify it against the exact current package patch. If it persists in a minimal valid example, report it upstream with:

- TypeScript and TanStack Form versions.
- The minimal value shape, validator, and field name.
- The complete compiler error and relevant `tsconfig`.
- A small repository or playground that reproduces it.

Avoid broad `any`, project-wide `skipLibCheck`, or repeated casts as the first response; they can conceal unrelated errors.

## Devtools setup

Install the host and Form plugin matching the React adapter:

```sh
npm install @tanstack/react-devtools @tanstack/react-form-devtools
```

Mount the plugin near the application root:

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'

root.render(
  <>
    <App />
    <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
  </>,
)
```

Follow the TanStack Devtools configuration guide for placement and other host options. Prefer development-only inclusion when form state may contain personal, secret, or regulated data, and verify the production bundle does not expose debugging UI unintentionally.

## State inspection without devtools

Use narrow selectors so diagnostics do not become permanent whole-form
subscriptions. Let the host provide its own development flag instead of assuming
a particular bundler:

```tsx
function FormDiagnostic({ isDevelopment }: { isDevelopment: boolean }) {
  const canSubmit = useSelector(form.store, (state) => state.canSubmit)
  const isSubmitting = useSelector(
    form.store,
    (state) => state.isSubmitting,
  )
  const errorMap = useSelector(form.store, (state) => state.errorMap)

  if (!isDevelopment) return null

  return (
    <pre>
      {JSON.stringify({ canSubmit, isSubmitting, errorMap }, null, 2)}
    </pre>
  )
}
```

Never print passwords, tokens, payment data, health data, or other sensitive values. Remove temporary diagnostics before shipping.

## Accessibility and robustness

- Devtools show state; they do not prove label association, keyboard behavior, focus order, live-region behavior, or screen-reader output.
- Reproduce invalid submission using keyboard and assistive technology, not only pointer clicks.
- Check that an error appears when intended, remains associated with its control, and clears only when the value becomes valid or the policy explicitly dismisses it.
- Test pending and failure states with delayed and rejected requests.
- Verify a component's disabled/loading styling matches its actual focusability and `disabled`/accessibility state.
- Include hydration, remount, reset, array reorder, and back-navigation cases when those flows exist.

## Pitfalls

- Logging `form.state` directly in render and expecting it to subscribe reactively.
- Subscribing to the entire form merely to display one flag.
- Debugging only the visual component while ignoring event normalization (`checked`, `valueAsNumber`, `onChangeText`, selected option).
- Adding missing defaults in the control rather than fixing the form's value model.
- Treating a type assertion as proof that runtime data has the asserted shape.
- Shipping devtools or raw form-state logs containing sensitive user data.
- Filing a type issue without a minimal reproduction or exact dependency versions.

## Related references

- [Foundations](foundations.md)
- [State, reactivity, and listeners](state-reactivity-and-listeners.md)
- [Validation and errors](validation-and-errors.md)
- [SSR and platforms](ssr-and-platforms.md)
- [TypeScript](typescript.md)

## Sources

- [Debugging React usage](https://tanstack.com/form/latest/docs/framework/react/guides/debugging)
- [Devtools](https://tanstack.com/form/latest/docs/framework/react/guides/devtools)
- [TanStack Devtools configuration](https://tanstack.com/devtools/latest/docs/configuration)
- [Devtools form example](https://tanstack.com/form/latest/docs/framework/react/examples/devtools)
