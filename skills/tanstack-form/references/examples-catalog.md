# React Examples Catalog

## Read when

Read this catalog to find the closest official React example before designing an
implementation. Treat examples as focused API demonstrations, not production
templates: retain their mechanics, then apply the robustness, security, testing,
and accessibility guidance in the other references.

This catalog covers the 13 examples linked from the official React Simple example
navigation at the time this skill was researched.

## 1. Simple

- **URL:** [Simple](https://tanstack.com/form/latest/docs/framework/react/examples/simple)
- **Use case:** A minimal controlled form with sync and debounced async field
  validation, submit state, reset, and devtools.
- **Important APIs:** `useForm`, `form.Field`, field metadata,
  `onChangeAsyncDebounceMs`, `form.Subscribe`, `form.handleSubmit`, `form.reset`.
- **Related references:** [Foundations](./foundations.md),
  [validation and errors](./validation-and-errors.md),
  [debugging and devtools](./debugging-and-devtools.md).
- **Platform requirement:** Client-rendered React; devtools require
  `@tanstack/react-devtools` and `@tanstack/react-form-devtools`.
- **Production/accessibility caveat:** Connect every error to its control, announce
  async status appropriately, handle rejected submissions, and prevent the native
  reset before calling `form.reset()`.

## 2. Multi-Step Wizard

- **URL:** [Multi-Step Wizard](https://tanstack.com/form/latest/docs/framework/react/examples/multi-step-wizard)
- **Use case:** One typed form split into steps with reusable components, group
  submission, and step-specific Standard Schema validation.
- **Important APIs:** `formOptions`, `createFormHookContexts`, `createFormHook`,
  `form.FormGroup`, `group.handleSubmit`, `revalidateLogic`, `onDynamic`, `withForm`.
- **Related references:** [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md),
  [composition and UI integration](./composition-and-ui-integration.md),
  [validation and errors](./validation-and-errors.md).
- **Platform requirement:** Client-rendered React; the current example uses Zod.
- **Production/accessibility caveat:** Announce the current step, focus its heading,
  preserve Back navigation, validate the complete payload on final submission, and
  never nest HTML forms.

## 3. Arrays

- **URL:** [Arrays](https://tanstack.com/form/latest/docs/framework/react/examples/array)
- **Use case:** Add repeated objects and bind nested fields by indexed paths.
- **Important APIs:** `form.Field`, `mode="array"`, `field.state.value`,
  `pushValue`, bracket paths such as `people[0].name`.
- **Related references:** [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md),
  [foundations](./foundations.md).
- **Platform requirement:** Client-rendered React.
- **Production/accessibility caveat:** The demonstration uses the array index as a
  React key and only adds rows. Production removable/reorderable rows need stable
  keys, distinct labels and control names, array helper operations, focus
  recovery, and add/remove/reorder announcements.

## 4. Form Composition (Large Form)

- **URL:** [Form Composition](https://tanstack.com/form/latest/docs/framework/react/examples/large-form)
- **Use case:** Split a large form into typed feature modules with reusable field
  and form components.
- **Important APIs:** `createFormHookContexts`, `createFormHook`, `useAppForm`,
  `AppField`, `AppForm`, `withForm`, `useFieldContext`, selected store state.
- **Related references:** [Composition and UI integration](./composition-and-ui-integration.md),
  [state, reactivity, and listeners](./state-reactivity-and-listeners.md),
  [TypeScript](./typescript.md).
- **Platform requirement:** Client-rendered React.
- **Production/accessibility caveat:** Make the shared primitives own a complete
  labeling, description, error, ref, and focus contract; avoid an ever-growing
  eager registry and excessive app-form extension chains.

## 5. Dynamic Validation

- **URL:** [Dynamic Validation](https://tanstack.com/form/latest/docs/framework/react/examples/dynamic)
- **Use case:** Change validation behavior before and after the first submission.
- **Important APIs:** `revalidateLogic`, form-level `validators.onDynamic`,
  Standard Schema validation, field metadata.
- **Related references:** [Validation and errors](./validation-and-errors.md),
  [state, reactivity, and listeners](./state-reactivity-and-listeners.md).
- **Platform requirement:** Client-rendered React; the current example uses Zod.
- **Production/accessibility caveat:** Avoid noisy per-keystroke announcements,
  expose when validation is pending, and ensure the server validates the same
  invariant rather than trusting the client schema.

## 6. TanStack Query Integration

- **URL:** [TanStack Query Integration](https://tanstack.com/form/latest/docs/framework/react/examples/query-integration)
- **Use case:** Load initial values from a query, save through a mutation, refetch,
  and reset to a clean state.
- **Important APIs:** `useQuery`, `useMutation`, `mutateAsync`, `useForm`,
  `onSubmit`, `formApi.reset`, query refetching.
- **Related references:** [Foundations](./foundations.md),
  [submission and server workflows](./submission-and-server-workflows.md).
- **Platform requirement:** React with `@tanstack/react-query` and a
  `QueryClientProvider`.
- **Production/accessibility caveat:** Design explicit loading, error, retry, and
  save-success feedback. Decide how fresh query data reconciles with dirty user
  edits; do not silently overwrite them or reset after a failed mutation.

## 7. Standard Schema

- **URL:** [Standard Schema](https://tanstack.com/form/latest/docs/framework/react/examples/standard-schema)
- **Use case:** Supply a Standard Schema-compatible validator directly rather than
  writing imperative validation.
- **Important APIs:** form-level `validators`, Standard Schema issues, field error
  metadata. The current example shows alternatives using Zod, Valibot, ArkType,
  and Effect Schema.
- **Related references:** [Validation and errors](./validation-and-errors.md),
  [TypeScript](./typescript.md).
- **Platform requirement:** Client-rendered React plus one compatible schema
  library; install only the library the application uses.
- **Production/accessibility caveat:** Normalize issue objects into useful,
  human-readable messages and associate them with controls. Schema transforms do
  not automatically mean the submitted TanStack Form value is transformed.

## 8. TanStack Start

- **URL:** [TanStack Start](https://tanstack.com/form/latest/docs/framework/react/examples/tanstack-start)
- **Use case:** Isomorphic validation with progressive HTML submission and merged
  server form state in a TanStack Start route.
- **Important APIs:** `@tanstack/react-form-start`, `createServerValidate`,
  `ServerValidateError`, `mergeForm`, `useTransform`, `formOptions`, route loader
  state, a native `action`/`method` form.
- **Related references:** [SSR and platforms](./ssr-and-platforms.md),
  [submission and server workflows](./submission-and-server-workflows.md).
- **Platform requirement:** TanStack Start and Router, with matching client/server
  form integration packages.
- **Production/accessibility caveat:** Render server errors beside their controls
  and in a focusable summary, retain submitted values after failure, and verify
  the non-JavaScript submission path.

## 9. Next Server Actions

- **URL:** [Next Server Actions](https://tanstack.com/form/latest/docs/framework/react/examples/next-server-actions)
- **Use case:** Validate `FormData` in a Next.js server action and merge returned
  validation state into a client form.
- **Important APIs:** `@tanstack/react-form-nextjs`, `createServerValidate`,
  `ServerValidateError`, `initialFormState`, `useActionState`, `mergeForm`,
  `useTransform`.
- **Related references:** [SSR and platforms](./ssr-and-platforms.md),
  [submission and server workflows](./submission-and-server-workflows.md).
- **Platform requirement:** Next.js App Router and React server actions. Other
  routing or submission architectures need a different transport integration.
- **Production/accessibility caveat:** Treat the server as authoritative, preserve
  user input and focus on invalid response, surface action failures, and test both
  pending and progressively enhanced behavior for the framework version in use.

## 10. Remix

- **URL:** [Remix](https://tanstack.com/form/latest/docs/framework/react/examples/remix)
- **Use case:** Share form options across a Remix action and route UI, validate on
  the server, and hydrate returned form state.
- **Important APIs:** `@tanstack/react-form-remix`, `createServerValidate`,
  `ServerValidateError`, `useActionData`, `mergeForm`, `useTransform`, Remix
  `Form`/action conventions.
- **Related references:** [SSR and platforms](./ssr-and-platforms.md),
  [submission and server workflows](./submission-and-server-workflows.md).
- **Platform requirement:** Remix with the TanStack Form Remix adapter.
- **Production/accessibility caveat:** Preserve native navigation semantics,
  retain entered values, announce server errors, move focus to an error summary or
  first invalid field, and handle thrown non-validation failures separately.

## 11. UI Libraries

- **URL:** [UI Libraries](https://tanstack.com/form/latest/docs/framework/react/examples/ui-libraries)
- **Use case:** Connect TanStack fields to third-party text inputs, checkboxes, and
  other controlled components.
- **Important APIs:** `form.Field`, render props, `field.handleChange`,
  `field.handleBlur`, controlled `value`/`checked`; current demo dependencies
  include Mantine and Material UI.
- **Related references:** [Composition and UI integration](./composition-and-ui-integration.md),
  [accessibility and focus](./accessibility-and-focus.md).
- **Platform requirement:** Client-rendered React and the chosen UI library,
  including its required styling/provider setup.
- **Production/accessibility caveat:** Normalize each component's value callback,
  forward IDs, names, refs, blur, invalid and described-by props to the focusable
  element, and inspect the rendered DOM rather than assuming the library is
  accessible by default.

## 12. Field Errors From Form Validators

- **URL:** [Field Errors From Form Validators](https://tanstack.com/form/latest/docs/framework/react/examples/field-errors-from-form-validators)
- **Use case:** Return one form-level error plus field-specific errors after
  asynchronous submission checks.
- **Important APIs:** `validators.onSubmitAsync`, `{ form, fields }` error shape,
  field error metadata, form `errorMap`, `form.Subscribe`.
- **Related references:** [Validation and errors](./validation-and-errors.md),
  [submission and server workflows](./submission-and-server-workflows.md),
  [accessibility and focus](./accessibility-and-focus.md).
- **Platform requirement:** Client-rendered React; real implementations require a
  trusted server endpoint for authoritative checks.
- **Production/accessibility caveat:** Associate field errors with inputs and
  expose the form error as a summary. Avoid duplicate `role="alert"` announcements,
  protect against stale async responses, and never treat simulated client checks
  as server security.

## 13. Devtools

- **URL:** [Devtools](https://tanstack.com/form/latest/docs/framework/react/examples/devtools)
- **Use case:** Inspect form values, metadata, validation, and events while
  developing.
- **Important APIs:** `TanStackDevtools`, `formDevtoolsPlugin`, optional devtools
  event-bus debugging, normal `useForm` usage.
- **Related references:** [Debugging and devtools](./debugging-and-devtools.md).
- **Platform requirement:** Client-rendered React with
  `@tanstack/react-devtools` and `@tanstack/react-form-devtools`.
- **Production/accessibility caveat:** Development inspection complements but does
  not replace keyboard, screen-reader, and automated accessibility tests. Do not
  expose sensitive form values or verbose debug event data in production.

## Cross-example review checklist

Before adapting an example:

- Confirm its packages and APIs match the versions installed in the target.
- Replace alerts, artificial delays, console logging, and in-memory databases with
  real error-handled application behavior.
- Add semantic labels, descriptions, errors, pending feedback, focus recovery, and
  keyboard tests where the focused demo omits them.
- Keep server-side validation authoritative and define how submitted values,
  server errors, and dirty client state reconcile.
- Preserve narrow subscriptions and stable keys when scaling the demo.

## Sources

- [React Simple example and example navigation](https://tanstack.com/form/latest/docs/framework/react/examples/simple)
- [TanStack Form React documentation](https://tanstack.com/form/latest/docs/framework/react)
- Each official example is linked in its catalog entry above.
