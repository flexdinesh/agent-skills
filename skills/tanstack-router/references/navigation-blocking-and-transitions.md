# Navigation Blocking and Transitions

Block navigation only to prevent meaningful data loss or interruption. View transitions are progressive visual enhancement and should never be required for navigation correctness.

## Block unsaved work

`shouldBlockFn` returns `true` to block and `false` to allow:

```tsx
import { useBlocker } from '@tanstack/react-router'

function ProfileForm() {
  const [isDirty, setIsDirty] = React.useState(false)

  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) return false
      return !window.confirm('Discard unsaved changes?')
    },
    enableBeforeUnload: isDirty,
  })

  return <form>{/* ... */}</form>
}
```

Router-controlled SPA navigations can show custom UI. Reload, tab close, and other document unloads use the browser's generic `beforeunload` prompt; browsers do not allow a custom message there.

Conditionally set `enableBeforeUnload` so clean pages do not install unnecessary unload protection.

## Build custom confirmation UI

Use resolver mode when the application owns the dialog:

```tsx
function Editor() {
  const [isDirty, setIsDirty] = React.useState(false)
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  })

  return (
    <>
      <EditorForm onDirtyChange={setIsDirty} />
      {blocker.status === 'blocked' && (
        <ConfirmDialog
          title="Discard changes?"
          onConfirm={blocker.proceed}
          onCancel={blocker.reset}
        />
      )}
    </>
  )
}
```

With `withResolver: true`, `shouldBlockFn` only determines whether navigation should enter the blocked state. Its return does not resolve the pending navigation. Call:

- `proceed()` to continue the pending navigation.
- `reset()` to cancel it and return to idle.

The `<Block>` component exposes the same state through render props, but `useBlocker` is usually easier to colocate with form state.

`shouldBlockFn` receives typed `current` and `next` locations. Use them to exempt safe transitions—for example, moving between tabs inside the same editor—rather than disabling the blocker globally.

Multiple blockers run sequentially. Any blocker that rejects navigation stops the remaining checks. Keep blocker logic fast and avoid stacking independent prompts for the same form.

## Save-then-navigate flows

Clear the dirty condition before proceeding after a successful save:

```tsx
async function saveAndLeave() {
  await saveDraft()
  setIsDirty(false)
  blocker.proceed()
}
```

If state updates are asynchronous in the surrounding form architecture, ensure the pending blocker is not re-registered as dirty before proceeding. Centralize ownership of the dirty flag rather than inferring it from DOM state.

`ignoreBlocker` exists on navigation options for deliberate escape hatches. Reserve it for controlled flows such as navigation immediately after a successful save:

```ts
await navigate({
  to: '/projects',
  ignoreBlocker: true,
})
```

Do not attach it broadly to navigation components.

## View transitions

Opt in per navigation:

```tsx
<Link to="/gallery" viewTransition>
  Gallery
</Link>
```

Or imperatively:

```ts
await navigate({
  to: '/gallery/$photoId',
  params: { photoId: '42' },
  viewTransition: true,
})
```

Set `defaultViewTransition` on the router only when most navigations benefit:

```ts
const router = createRouter({
  routeTree,
  defaultViewTransition: true,
})
```

Router calls `document.startViewTransition()` when supported and ignores the option when the API is unavailable. Design the DOM and CSS so the route still works without it.

Browsers that support typed view transitions can receive types:

```ts
const router = createRouter({
  routeTree,
  defaultViewTransition: {
    types: ({ pathChanged }) =>
      pathChanged ? ['route-change'] : false,
  },
})
```

`types` may be a string array or a function receiving `fromLocation`, `toLocation`, and booleans for path, href, and hash changes. Returning `false` skips the view transition for that navigation. Where transition types are unsupported, Router falls back to a normal view transition.

Use stable `view-transition-name` values only for elements that should morph between screens. Duplicate names in the same rendered state can invalidate a transition.

## Blocking and transitions together

Blocking resolves before navigation commits. Do not open transition-specific UI while a blocker is pending. The useful sequence is:

1. User requests navigation.
2. Blocker evaluates dirty/interruption state.
3. User cancels, or proceeds.
4. Router performs the accepted navigation with an optional view transition.

Keep the confirmation dialog outside route content that may unmount during the accepted transition.

## Do

- Block only when navigation risks losing work or interrupting a critical operation.
- Enable `beforeunload` only while the risk exists.
- Use resolver mode for an accessible application-owned dialog.
- Clear dirty state after a successful save before navigating.
- Treat view transitions as progressive enhancement.
- Respect `prefers-reduced-motion` in transition CSS.

## Don't

- Don't block routine navigation merely to increase engagement or force confirmation.
- Don't return a confirmation result and also expect it to resolve `withResolver: true`.
- Don't promise custom text for browser unload dialogs.
- Don't set `ignoreBlocker` on general-purpose links.
- Don't couple data loading or route correctness to transition callbacks.
- Don't assume all browsers support typed or basic view transitions.

## Official sources

- [Navigation Blocking](https://tanstack.com/router/latest/docs/guide/navigation-blocking)
- [Navigation](https://tanstack.com/router/latest/docs/guide/navigation)
- [NavigateOptions API](https://tanstack.com/router/latest/docs/api/router/NavigateOptionsType)
- [ViewTransitionOptions API](https://tanstack.com/router/latest/docs/api/router/ViewTransitionOptionsType)
- [React View Transitions Example](https://tanstack.com/router/latest/docs/framework/react/examples/view-transitions)

