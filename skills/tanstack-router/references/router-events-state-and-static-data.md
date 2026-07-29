# Router Events, State, and Static Data

Use reactive hooks to render from router state, lifecycle events for imperative integrations, and `staticData` for compile-time route metadata. These APIs solve different problems and should not substitute for one another.

## Render from reactive state

`router.state` is always current but is not reactive. Read it in imperative code only. In components, use `useRouterState` with a selector:

```tsx
import { useRouterState } from '@tanstack/react-router'

function NavigationProgress() {
  const isLoading = useRouterState({
    select: (state) => state.isLoading,
  })

  return isLoading ? <ProgressBar /> : null
}
```

Core state distinctions:

| Field | Meaning |
| --- | --- |
| `status` | `'pending'` while loading/transitioning, otherwise `'idle'`. |
| `isLoading` | A route is loading or waiting to finish. |
| `isTransitioning` | Navigation is transitioning to another route. |
| `matches` | Current active resolved matches. |
| `location` | Latest parsed browser location; it may not have loaded yet. |
| `resolvedLocation` | Last location whose route matches have resolved and loaded. |

Use `useMatches`, `useParams`, `useSearch`, and route-scoped hooks when they express the dependency more precisely. Select primitives or stable JSON-compatible shapes to reduce re-renders.

## Subscribe for imperative side effects

`router.subscribe(eventName, listener)` returns an unsubscribe function. Typical navigation order is:

1. `onBeforeNavigate`
2. `onBeforeLoad`
3. `onLoad`
4. `onBeforeRouteMount`
5. `onResolved`
6. `onRendered`

Choose the event by the actual dependency:

- `onBeforeNavigate` / `onBeforeLoad`: timing, logging, or reset at navigation start.
- `onResolved`: analytics and cleanup after navigation completes.
- `onRendered`: DOM-dependent focus or measurement after new route content renders.

```tsx
useEffect(() => {
  return router.subscribe('onResolved', (event) => {
    analytics.page({
      path: event.toLocation.pathname,
      href: event.toLocation.href,
    })
  })
}, [router])
```

`fromLocation` can be absent on initial load. Use `pathChanged` when an action should ignore search/hash-only changes, `hrefChanged` for any URL change, and `hashChanged` for hash-specific behavior.

Events observe routing; they are not a reactive store. Do not call `setState` from broad subscriptions when a selector hook can render the same information.

## Model route metadata with static data

`staticData` is synchronously defined at route creation, identical for every match of that route, and available as `match.staticData`. Type it globally through declaration merging:

```tsx
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    nav?: {
      label: string
      order: number
    }
    hideAppChrome?: boolean
  }
}
```

```tsx
export const Route = createFileRoute('/settings')({
  staticData: {
    nav: { label: 'Settings', order: 40 },
  },
})
```

Read active metadata with a narrow match selector:

```tsx
function AppFrame() {
  const hideChrome = useMatches({
    select: (matches) =>
      matches.some((match) => match.staticData.hideAppChrome === true),
  })

  return (
    <>
      {!hideChrome && <AppNav />}
      <Outlet />
    </>
  )
}
```

Use optional properties when only some routes participate. A required property in `StaticDataRouteOption` requires every route to provide it.

Choose `staticData` for compile-time labels, layout flags, feature identifiers, and breadcrumb factories whose definition does not vary by params/search/request. Choose context or loader data for user-, request-, param-, or search-dependent values.

## Imperative router operations

- `router.invalidate()` marks active matches invalid and reloads them; `{ sync: true }` waits for loaders.
- `router.load()` loads current matches but respects `staleTime`; fresh matches stay fresh.
- `router.clearCache({ filter? })` removes cached matches, not active UI state.
- `router.preloadRoute()` warms a destination.

Use these as explicit coordination points, not as a general state-management layer. Prefer cache-owner-specific invalidation where possible.

## Do

- Use selector hooks for UI and subscriptions for non-rendering integrations.
- Return the unsubscribe function from every component effect.
- Default analytics to `onResolved`; use `onRendered` only for DOM work.
- Check `pathChanged` before path-specific cleanup.
- Type `staticData` once and make selectively used fields optional.
- Keep static metadata synchronous and serializable where practical.
- Use `resolvedLocation` only when the last completed location is what you mean.

## Don't

- Don't read `router.state` in a component and expect it to re-render.
- Don't subscribe globally for UI that hooks can derive.
- Don't forget that `fromLocation` may be undefined.
- Don't perform DOM measurement in `onLoad` before the route is rendered.
- Don't put current user, fetched titles, or param-derived values in `staticData`.
- Don't clear the entire route cache after every mutation.
- Don't confuse `router.load()` with force reload; use invalidation when freshness must be bypassed.

## Sources

- [Router Events](https://tanstack.com/router/latest/docs/guide/router-events)
- [RouterState API](https://tanstack.com/router/latest/docs/api/router/RouterStateType)
- [Router API](https://tanstack.com/router/latest/docs/api/router/RouterType)
- [Static Route Data](https://tanstack.com/router/latest/docs/guide/static-route-data)
- [Render Optimizations](https://tanstack.com/router/latest/docs/guide/render-optimizations)

