---
name: tanstack-form
description: Build, review, debug, and test robust accessible React and React Native forms with @tanstack/react-form. Covers typed field wiring, validation, reactivity, arrays, composition, submission, server integration, focus management, SSR, and UI-library integration.
---

# TanStack Form

Use this skill for substantial work with `@tanstack/react-form`, including new
forms, reusable form primitives, validation, async workflows, accessibility,
debugging, testing, and reviews.

## Purpose

Build forms that are type-safe, resilient, performant, and usable with keyboards
and assistive technology. TanStack Form is headless: it owns form state and
workflows, while the application remains responsible for semantic controls,
accessible feedback, focus, and server-side trust boundaries.

This skill is standalone. Apply the consuming repository's instructions and UI
component contracts without assuming a particular design system, framework, or
validation library.

## Before You Act

1. Read the applicable repository and workspace instructions.
2. Inspect the installed versions of `@tanstack/react-form`, React, TypeScript,
   validation libraries, and any framework adapter. Do not assume the moving
   `latest` documentation matches the installed package.
3. Identify:
   - web or React Native;
   - client-only, SSR, or progressively enhanced submission;
   - create, edit, multi-step, array, or reusable sub-form;
   - synchronous, asynchronous, cross-field, and server validation needs;
   - the UI component library's value and event contracts.
4. Read only the references relevant to the work using the routing table below.

## Implementation Workflow

### 1. Model values and defaults

- Define a complete domain value shape.
- Supply non-`undefined` `defaultValues` for every controlled field.
- Convert UI event values to the domain type at the field boundary.
- Decide how async data initializes or resets the form without overwriting dirty
  edits.

### 2. Design validation

- Assign each rule to one owner: field, form, group, linked field, or server.
- Choose validation timing deliberately. Prefer submit- or blur-first feedback
  over interrupting untouched users on every keystroke.
- Debounce network validation and listeners.
- Treat client validation as user assistance; validate untrusted data again on
  the server.
- Decide how field errors, form errors, and server failures are presented and
  announced.

### 3. Wire fields and state

- Give native controls a stable `id`, `name`, current `value` or `checked`,
  `onChange`, and `onBlur` when blur state matters.
- Subscribe through a narrow `useSelector` or `form.Subscribe` selector.
- Use linked-field validation for dependent validity and listeners for effects.
- Use stable domain identities for reorderable array rows when possible.

### 4. Build accessible interaction

- Use semantic `<form>`, `<label>`, `<fieldset>`, and `<legend>` elements where
  applicable.
- Associate instructions and errors programmatically.
- Expose invalid, validating, submitting, and server-result states without
  relying on color or visual position alone.
- Keep submission discoverable, prevent duplicates while pending, and focus a
  useful error target after an invalid submission.
- Preserve keyboard submission and native behavior unless the selected server
  integration intentionally replaces it.

### 5. Submit and recover

- Route valid submission through `form.handleSubmit()`.
- Define multi-action submit metadata and Enter-key behavior explicitly.
- Map server field errors to exact field paths and non-field failures to a form
  status or summary.
- Do not assume Standard Schema transformations replace the value received by
  `onSubmit`; parse again when transformed output is required.
- Make retry, reset, cancellation, and async refetch behavior explicit.

### 6. Verify

- Test happy paths, invalid paths, async races, server rejection, reset,
  duplicate submission, keyboard submission, and focus recovery.
- Verify accessible names, descriptions, invalid state, announcements, grouping,
  and focus order in the rendered UI.
- Check that reactive selectors are narrow and that complex form types remain
  practical for TypeScript.

## Non-Negotiable Rules

- Do not read `form.state` in rendered UI and expect reactivity without a
  subscription.
- Do not call `useSelector(form.store)` without a selector.
- Do not use `useField` only to observe form state.
- Do not configure `onDynamic` without `revalidateLogic`.
- Do not run expensive async validators or listeners on every keystroke without
  an intentional debounce policy.
- Do not duplicate ownership of the same field error at field and form scope for
  the same trigger.
- Do not silently overwrite dirty user input when async data refetches.
- Do not combine native reset behavior with `form.reset()` unless native reset is
  prevented.
- Do not let array mutation controls default to `type="submit"`.
- Do not copy demo markup as an accessibility template without auditing it.
- Do not treat a UI library as proof of accessible labels, descriptions, errors,
  or focus behavior; inspect the rendered contract.
- Do not treat client validation as a security boundary.
- Do not assume `aria-disabled` prevents activation; enforce behavior in the
  submission path.
- Do not assume schema validation transforms the submitted input value.

## Reference Routing

| Work | Read |
| --- | --- |
| Form options, fields, defaults, metadata, reset, async initial data | [Foundations](references/foundations.md) |
| Sync/async/dynamic/schema validation, rich errors, linked validity | [Validation and errors](references/validation-and-errors.md) |
| Subscriptions, selectors, listeners, dependent effects, autosave | [State, reactivity, and listeners](references/state-reactivity-and-listeners.md) |
| Arrays, nested paths, linked fields, groups, multi-step forms | [Arrays, linked fields, and groups](references/arrays-linked-fields-and-groups.md) |
| Reusable fields/forms, `createFormHook`, `withForm`, UI libraries | [Composition and UI integration](references/composition-and-ui-integration.md) |
| Submit metadata, transformed values, server errors, async workflows | [Submission and server workflows](references/submission-and-server-workflows.md) |
| Labels, errors, announcements, focus, grouping, dynamic controls | [Accessibility and focus](references/accessibility-and-focus.md) |
| TanStack Start, Next.js, Remix, generic SSR, React Native | [SSR and platforms](references/ssr-and-platforms.md) |
| Runtime warnings, type failures, inspection, devtools | [Debugging and devtools](references/debugging-and-devtools.md) |
| Compiler requirements, inference, package pinning, type complexity | [TypeScript](references/typescript.md) |
| Selecting and hardening an official example | [Examples catalog](references/examples-catalog.md) |

## Review Checklist

- Values and field paths are inferred from complete defaults.
- UI adapters forward the correct value, change, blur, name, and ref contracts.
- Validation ownership, timing, debounce, and server authority are explicit.
- Errors have human-readable content and programmatic relationships.
- Submission works by keyboard and exposes a useful pending state.
- Invalid submission moves focus predictably without querying outside the form.
- Arrays retain identity and focus through insertion, removal, and reordering.
- Async initialization does not erase edits.
- Server errors survive the selected rendering and submission architecture.
- Tests cover behavior and rendered accessibility, not only internal state.

## Maintenance

Do not read the maintenance runbook during ordinary form implementation. When
updating this skill against a new TanStack Form release or documentation revision,
follow [update.md](update.md) completely.
