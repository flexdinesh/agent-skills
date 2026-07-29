# Accessibility and focus

## Read when

Read this reference when building or reviewing form markup, validation feedback,
submission states, error summaries, focus behavior, dynamic rows, server-rendered
errors, or React Native forms.

TanStack Form manages values and validation state; it intentionally does not know
the rendered markup and therefore cannot make a form accessible or focus an
invalid control by itself. Treat semantics, relationships, announcements, and
focus as part of the form's public interface.

## Baseline contract

- Use a native `<form>` and submit event on the web. Preserve Enter-to-submit and
  use real `button`, `input`, `select`, and `textarea` elements where possible.
- Give every control a visible, persistent label. Associate it with `htmlFor` and
  `id`, or wrap the control in its label. A placeholder is an example or hint, not
  a label.
- Keep IDs stable and unique across hydration, repeated fields, and multiple
  forms. The control's `name` should remain `field.name`; its DOM `id` may be a
  separately generated, HTML-safe identifier.
- Put overall instructions before the form and field-specific constraints beside
  the relevant control. Connect hints and displayed errors with
  `aria-describedby`.
- Use native `required`, input types, `autocomplete`, `min`, `max`, and other
  applicable HTML semantics. Explain required-field notation in text. Do not rely
  on an asterisk, icon, position, or color alone.
- Set `aria-invalid="true"` only when an error is being presented to the user.
  Omitting it or setting it to `false` means the current value is not known to be
  invalid. Keep the error text in the accessibility tree and make it specific
  enough to identify a correction.
- Group related radios, checkboxes, or logically dependent controls in
  `<fieldset>` with a concise `<legend>`. Do not use a fieldset merely for visual
  layout.
- Keep source order, visual order, and keyboard focus order aligned. Do not use
  positive `tabIndex`, and never remove the visible focus indicator.
- Validate on the server as well as the client. Client validation improves
  feedback but is not a security boundary.

## Error timing and announcements

Choose validation timing for the task, not just for immediacy:

- On submit, reveal every actionable error, show a summary when the form is long,
  and move focus once to the summary or first invalid control.
- On blur is a good default for field feedback. After a field has failed, on-change
  validation may help the user see when it becomes valid.
- Avoid announcing errors on every keystroke. This is disruptive for screen-reader
  users and can punish incomplete but valid-in-progress input.
- Make format requirements available before entry. When a correction is known,
  state it: “Use DD/MM/YYYY” is more useful than “Invalid value.”
- Distinguish validation failure from a network or service failure. Preserve the
  user's input and provide a recovery action.

An inline error should be visually adjacent to its control and included in that
control's `aria-describedby`. A live region is useful when content changes away
from focus, but it is not a substitute for a programmatic relationship:

- Use a polite status (`role="status"`) for non-urgent progress and success.
- Use an assertive alert (`role="alert"`) sparingly for important errors that must
  be announced immediately.
- Prefer a live-region container that already exists before inserting a message.
  Do not put `aria-live` on every field and produce competing announcements.
- Set `aria-busy="true"` on the region being updated when that accurately describes
  it. Show text such as “Submitting…” as well as a spinner.

For a long form, render a visible error summary near its heading:

1. State the number of errors.
2. List links whose fragments target the invalid controls.
3. Keep the same messages inline at their controls.
4. On invalid submission, either focus the summary (give its heading
   `tabIndex={-1}`) or focus the first invalid control. Pick one predictable
   strategy; do not bounce focus between both.

## TanStack Form pattern

`onSubmitInvalid` is the appropriate boundary for failed-submit focus. Scope the
query to the current form so a page containing multiple forms cannot focus an
unrelated control. Query rendered accessibility state rather than duplicating
validation logic, and ensure custom UI controls forward a focusable ref.

```tsx
import { useRef } from 'react'
import { useForm } from '@tanstack/react-form'

export function AccountForm() {
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => saveAccount(value),
    onSubmitInvalid: () => {
      formRef.current
        ?.querySelector<HTMLElement>(
          '[aria-invalid="true"]:not([disabled])',
        )
        ?.focus()
    },
  })

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{
          onBlur: ({ value }) =>
            value.includes('@') ? undefined : 'Enter an email address.',
        }}
      >
        {(field) => {
          const showError =
            field.state.meta.isTouched && !field.state.meta.isValid
          const message = field.state.meta.errors.join(' ')

          return (
            <div>
              <label htmlFor="account-email">Email address</label>
              <p id="account-email-hint">For example, name@example.com.</p>
              <input
                id="account-email"
                name={field.name}
                type="email"
                autoComplete="email"
                required
                value={field.state.value}
                aria-invalid={showError || undefined}
                aria-describedby={[
                  'account-email-hint',
                  showError && 'account-email-error',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {showError && (
                <p id="account-email-error">{message}</p>
              )}
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save account'}
            </button>
            <span role="status">
              {isSubmitting ? 'Submitting form.' : ''}
            </span>
          </>
        )}
      </form.Subscribe>
    </form>
  )
}
```

`noValidate` is a product choice, not a universal requirement. Use it when
TanStack owns the validation experience and you have supplied equivalent,
accessible messages. Omit it when native constraint validation is the intended
experience. Do not accidentally present both browser messages and a competing
custom error flow.

Do not normally disable submit merely because `canSubmit` is false. An enabled
submit lets users discover validation errors and is often clearer than an
unexplained disabled control. Disable during an actual submission if necessary
to prevent duplicates, retain a visible label, expose progress, and recover the
control when submission fails.

## Dynamic arrays

- Give each row a stable application identity and React key. An array index can be
  part of the current TanStack field path, but should not be the row's identity
  across insertions and reordering.
- Include context in labels and control names, such as “Email address 2.” Keep
  remove and reorder buttons as real buttons with specific accessible names.
- After removal, move focus to the next logical row, the preceding row, or the
  “Add” control. Do not leave focus on an element that no longer exists.
- Announce additions, removals, and reordering through one polite status region
  when the visual update is not otherwise clear.
- If rows are grouped, use a meaningful `fieldset`/`legend`; avoid deeply nested
  fieldsets that add noise.
- When focusing an invalid array field, use rendered DOM order. Do not assume the
  validation object's property order matches the user's reading order.

## Server errors and SSR

Map field-specific server errors into the same visible inline error pipeline and
put form-wide failures in the summary or status region. After a failed response,
preserve entered values, mark the affected controls invalid, render their
descriptions, and then apply the same single focus policy used for client errors.

On SSR pages, generate deterministic IDs and make the initial error/value state
match between server and client. Content present in the initial HTML may not be
announced as a live-region update, so server-rendered errors must also be visible,
linked to their controls, and reachable from a summary. If an error arrives after
hydration, announce the update and manage focus deliberately.

## React Native

React Native has no DOM query API. Keep an ordered registry of mounted
`TextInput` refs and TanStack field names, inspect the form error map in
`onSubmitInvalid`, and call `.focus()` on the first mounted invalid input. Use
`formApi.getAllErrors().fields` so both form-assigned field errors and field-level
validator errors participate. Update the registry when conditional or array
fields mount, move, and unmount.

- Supply concise `accessibilityLabel` and, when needed, `accessibilityHint`.
  Visible `Text` does not automatically provide the same label relationship as
  HTML in every platform configuration.
- Expose supported control state through `accessibilityState`, including
  `disabled` and `busy`. Do not claim unsupported state properties.
- Announce validation or submission changes with
  `AccessibilityInfo.announceForAccessibility()` when focus alone will not convey
  them. On Android, `accessibilityLiveRegion` can announce changing text.
- Use `AccessibilityInfo.setAccessibilityFocus()` only when accessibility focus
  must be moved to a non-input summary; use the native handle of a mounted
  accessible view. Prefer `TextInput.focus()` for correcting a field.
- Test with VoiceOver and TalkBack as well as touch, hardware keyboard, switch
  access where applicable, large text, and reduced motion. Platform behavior
  differs, so web ARIA patterns must not be copied mechanically into native code.

## Anti-patterns

- Styling an error in red without text, `aria-invalid`, and a description link.
- Using a placeholder, tooltip, icon, or `aria-label` to replace a useful visible
  label.
- Rendering an error that is not connected to its control.
- Focusing on each validation change, async response, or rerender.
- Calling `document.querySelector('[aria-invalid="true"]')` globally.
- Depending on a validation error object's iteration order to choose focus.
- Putting every error in an assertive live region.
- Clearing values after server failure or replacing a precise server error with
  “Something went wrong.”
- Disabling submit before the user can request validation, without explaining how
  to make the form submittable.
- Using clickable `div` elements for submit, add, remove, or reorder actions.
- Hiding focus outlines without an equally visible replacement.
- Adding positive `tabIndex` values to repair a visual/source-order mismatch.
- Assuming TanStack Form, a schema validator, a UI library, or React Native
  supplies accessible semantics automatically.

## Verification

- Navigate and submit using only the keyboard; verify logical order and visible
  focus.
- Inspect each control's accessible name, description, required state, invalid
  state, and error correction.
- Submit empty and malformed values; verify one predictable focus move and no
  announcement storm.
- Exercise slow, failed, duplicate, and successful submissions.
- Add, reorder, and remove array rows while focus is inside them.
- Test server-rendered and post-hydration errors.
- Test at least one screen reader/browser pairing appropriate to the supported
  platforms; automated accessibility checks are necessary but insufficient.

## Related references

- [Validation and errors](./validation-and-errors.md)
- [Arrays, linked fields, and groups](./arrays-linked-fields-and-groups.md)
- [Submission and server workflows](./submission-and-server-workflows.md)
- [SSR and platforms](./ssr-and-platforms.md)
- [Composition and UI integration](./composition-and-ui-integration.md)

## Sources

- [TanStack Form: Focus Management](https://tanstack.com/form/latest/docs/framework/react/guides/focus-management)
- [TanStack Form: React Native](https://tanstack.com/form/latest/docs/framework/react/guides/react-native)
- [W3C WAI: Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [W3C WAI: Labeling Controls](https://www.w3.org/WAI/tutorials/forms/labels/)
- [W3C WAI: Grouping Controls](https://www.w3.org/WAI/tutorials/forms/grouping/)
- [W3C WAI: Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [W3C WAI: Validating Input](https://www.w3.org/WAI/tutorials/forms/validation/)
- [W3C WAI: User Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [WCAG 2.2 Understanding SC 1.3.1: Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)
- [WCAG 2.2 Understanding SC 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WCAG 2.2 Understanding SC 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [WCAG 2.2 Understanding SC 3.3.1: Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG 2.2 Understanding SC 3.3.2: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [WCAG 2.2 Understanding SC 3.3.3: Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)
- [WCAG 2.2 Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [MDN: `aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby)
- [MDN: `aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
- [MDN: `aria-busy`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy)
- [MDN: ARIA `alert` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role)
- [MDN: ARIA `status` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role)
- [React Native: Accessibility](https://reactnative.dev/docs/accessibility)
- [React Native: AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo)
- [React Native: TextInput](https://reactnative.dev/docs/textinput)
