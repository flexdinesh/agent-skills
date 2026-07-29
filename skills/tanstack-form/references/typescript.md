# TypeScript

## Read when

Read this reference when establishing compiler requirements, pinning dependencies, modeling form values, integrating a Standard Schema, building reusable typed fields, or diagnosing slow/failed type inference.

## Required baseline

TanStack Form's official TypeScript guidance requires:

- `"strict": true` in `tsconfig.json`.
- TypeScript 5.4 or newer.
- Awareness that type-only fixes and improvements are considered non-breaking and may ship in patch releases.
- An exact TanStack Form patch pin, followed by deliberate upgrades that include typechecking.

Do not use a caret or tilde for the reviewed snapshot:

```json
{
  "dependencies": {
    "@tanstack/react-form": "1.33.2"
  }
}
```

Apply the same exact-patch policy to a framework adapter that participates in the form integration, and keep related TanStack Form packages on compatible versions. The non-type public API follows semantic versioning strictly, but inferred types can still change between patches.

## Model values from complete defaults

Let `defaultValues` establish the concrete input shape whenever practical:

```ts
type RegistrationValues = {
  email: string
  age: number | null
  interests: string[]
}

const defaultValues: RegistrationValues = {
  email: '',
  age: null,
  interests: [],
}

const form = useForm({
  defaultValues,
  onSubmit: ({ value }) => saveRegistration(value),
})
```

Use an explicit annotation when defaults include literals, `null`, or empty
collections that must remain mutable across the full domain type. `satisfies`
checks compatibility but does not itself widen the resulting value type. Include
every rendered field in the model and choose nullability deliberately;
incomplete defaults can create React controlled/uncontrolled warnings.

## Standard Schema input and output

TanStack Form uses a Standard Schema's input type for form values. Schema transforms do not change the value passed to `onSubmit`; parse again at submission to obtain the output:

```ts
const personSchema = z.object({
  age: z.string().transform(Number),
})

const defaultValues: z.input<typeof personSchema> = { age: '' }

const form = useForm({
  defaultValues,
  validators: { onSubmit: personSchema },
  onSubmit: ({ value }) => {
    const person: z.output<typeof personSchema> = personSchema.parse(value)
    return savePerson(person)
  },
})
```

Keep the UI/input type and the persisted/domain output type visibly distinct.

## Preserve inference

- Prefer inference from `defaultValues`, validators, `formOptions`, and component APIs over spelling TanStack Form's long generic parameter lists.
- Keep field names as literals. When constructing paths dynamically, constrain the helper so it returns a valid path rather than widening to `string`.
- Give empty arrays and nullable values enough context to avoid `never[]`, `any[]`, or an overly narrow `null` type.
- Share form options when several components or a client/server adapter must agree on the same shape.
- Keep custom components generic over the smallest necessary field contract. Avoid accepting an entire form API solely to read or update one field.
- Type custom error objects as a discriminated union when rendering depends on error kind.
- Type submission metadata explicitly and provide a compatible `onSubmitMeta` default.

```ts
type SubmitMeta =
  | { intent: 'save' }
  | { intent: 'save-and-close'; returnTo: string }

const defaultMeta: SubmitMeta = { intent: 'save' }
```

## Control inference complexity

TanStack Form's path and validator types are powerful, but extremely large nested value types can exceed TypeScript's evaluation limits.

When a field value becomes `unknown`:

1. Make the form type more specific.
2. Split independent workflows into smaller forms or groups.
3. Reduce wrapper generic depth and avoid forwarding every form generic through many component layers.
4. Verify the result with the repository's exact TypeScript and TanStack Form versions.
5. Use a narrow, documented assertion only when the runtime invariant is already established.

When TypeScript reports `Type instantiation is excessively deep and possibly infinite`, reduce to a minimal reproduction and report it upstream if it persists. It is a compile-time problem; avoid “fixing” it by converting the form to `any`.

## Upgrade policy

For every TanStack Form patch upgrade:

1. Read the release notes and compare all Form adapter versions.
2. Update the exact version intentionally.
3. Run the full typecheck, lint, unit/component tests, and production build.
4. Pay special attention to inferred field paths, validator return types, custom errors, reusable field components, schema inputs/outputs, and server-adapter state.
5. Record any newly required annotations or changed inference before merging.

Lockfile-only reproducibility is useful, but an exact manifest pin makes the library's documented type-release policy explicit to maintainers and automated updates.

## Accessibility and robustness

- Type safety can prove that field paths and values align; it cannot prove that labels, descriptions, and error IDs are correctly associated.
- Model error data so every internal error has a deliberate, safe user-facing representation. Do not render unknown objects or server messages directly.
- Represent loading, success, validation failure, and operational failure distinctly so UI code cannot silently omit a state.
- Avoid non-null assertions around async initial data unless rendering is truly gated; a runtime `undefined` can still produce broken controls.
- Test runtime parsing at trust boundaries even when client values are statically typed.

## Pitfalls

- Running without `strict: true` or on TypeScript older than 5.4.
- Using `"^1.33.2"` or `"~1.33.2"` while expecting inferred types never to change.
- Treating a schema's transformed output as the `onSubmit` value without parsing.
- Allowing empty collections or `null` defaults to infer unusably narrow types.
- Hand-writing all `useForm` generics and making reusable APIs brittle.
- Masking genuine mismatches with `as`, `any`, `@ts-ignore`, or project-wide compiler relaxations.
- Assuming a successful typecheck validates server input at runtime.

## Related references

- [Foundations](foundations.md)
- [Validation and errors](validation-and-errors.md)
- [Form composition and UI integration](composition-and-ui-integration.md)
- [Submission and server workflows](submission-and-server-workflows.md)
- [Debugging and devtools](debugging-and-devtools.md)

## Sources

- [TypeScript](https://tanstack.com/form/latest/docs/typescript)
- [Basic concepts](https://tanstack.com/form/latest/docs/framework/react/guides/basic-concepts)
- [Form and field validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [Submission handling](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling)
- [Debugging React usage](https://tanstack.com/form/latest/docs/framework/react/guides/debugging)
