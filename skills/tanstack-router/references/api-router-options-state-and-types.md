# API: router options, state, and types

Use this reference when configuring router-wide behavior, calling the imperative router, or interpreting locations, matches, and events.

## Router options and current defaults

`routeTree` is the only universally required option. `context` becomes required when the root was created with `createRootRouteWithContext<T>()`.

### Matching and URL behavior

| Option | Type | v1 default |
| --- | --- | --- |
| `history` | `RouterHistory` | Browser history |
| `basepath` | `string` | `/` |
| `caseSensitive` | `boolean` | `false` |
| `trailingSlash` | `'always' \| 'never' \| 'preserve'` | `'never'` |
| `search.strict` | `boolean` | `false`; unknown search params remain |
| `parseSearch` | parser | `defaultParseSearch` |
| `stringifySearch` | serializer | `defaultStringifySearch` |
| `notFoundMode` | `'root' \| 'fuzzy'` | `'fuzzy'` |
| `unmaskOnReload` | `boolean` | `false` |

Use `rewrite.input` for browser-to-router URL transformation and `rewrite.output` for router-to-browser transformation. Return `undefined`, a string, or a `URL`. When both `basepath` and rewrites are used, basepath removal happens first on input and addition happens last on output.

### Loading and rendering

| Option | v1 default |
| --- | --- |
| `defaultPreload` | `false` |
| `defaultPreloadDelay` | `50` ms |
| `defaultStaleTime` | `0` |
| `defaultStaleReloadMode` | `'background'` |
| `defaultPreloadStaleTime` | `30_000` ms |
| `defaultGcTime` | 30 minutes |
| `defaultPreloadGcTime` | `defaultGcTime` |
| `defaultPendingMs` | `1_000` ms |
| `defaultPendingMinMs` | `500` ms |
| `defaultComponent` | `Outlet` |
| `defaultErrorComponent` | `ErrorComponent` |
| `defaultNotFoundComponent` | built-in `NotFound` |
| `disableGlobalCatchBoundary` | `false` |
| `defaultStructuralSharing` | `false` |
| `defaultHashScrollIntoView` | `true` |

`defaultPendingComponent` has no documented built-in default. Provide one when the application needs global pending UI.

Recommended client baseline:

```ts
const router = createRouter({
  routeTree,
  context: { api, user: null },
  defaultPreload: 'intent',
  defaultPreloadDelay: 50,
  defaultPendingMs: 800,
  defaultPendingMinMs: 300,
})
```

These timing values are product choices; measure before changing caching or pending behavior globally.

### Protocol security

Navigation rejects absolute URLs with protocols outside `protocolAllowlist`. The default allows:

- `http:`
- `https:`
- `mailto:`
- `tel:`

Custom values replace the default and must be lowercase with a trailing colon:

```ts
import {
  DEFAULT_PROTOCOL_ALLOWLIST,
  createRouter,
} from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  protocolAllowlist: [...DEFAULT_PROTOCOL_ALLOWLIST, 'blob:'],
})
```

Do not allow `data:` or another powerful protocol without validating the security model.

### Wrappers

- `Wrap` wraps the whole router and is suitable for provider components.
- `InnerWrap` wraps inner content and may use router hooks.

Both must be non-DOM-rendering provider wrappers for SSR; adding markup can produce hydration errors.

## Router instance

Important imperative methods:

| Method | Use |
| --- | --- |
| `update(newOptions)` | Update router configuration |
| `navigate(options)` | Commit an internal or external navigation |
| `buildLocation(options)` | Build without committing |
| `commitLocation(location)` | Commit a built parsed location |
| `matchRoutes(pathname, search?, options?)` | Resolve a path to matches |
| `matchRoute(destination, options?)` | Test one typed destination |
| `preloadRoute(options?)` | Load matching route assets/data ahead of navigation |
| `loadRouteChunk(route)` | Load one route's JS chunk |
| `load({ sync? })` | Load current matches while respecting `staleTime` |
| `invalidate(options?)` | Re-run `beforeLoad` and loaders, optionally filtered |
| `clearCache(options?)` | Remove cached matches, optionally filtered |
| `cancelMatch(id)` / `cancelMatches()` | Abort pending match controllers |
| `subscribe(event, listener)` | Observe router lifecycle; returns unsubscribe |
| `dehydrate()` / `hydrate(data)` | Transfer critical router state for SSR |

`load()` revalidates only stale matches. Use `invalidate()` when active matches must reload regardless of freshness:

```ts
await router.invalidate({
  filter: (match) => match.routeId === '/posts',
  sync: true,
})
```

Preloaded matches are transient and retained only until the next attempted navigation; do not treat them as a permanent cache.

## Reactive versus imperative state

`router.state` is current but not reactive. In React:

```tsx
const status = useRouterState({
  select: (state) => state.status,
})
```

The documented `RouterState` core is:

```ts
type RouterState = {
  status: 'pending' | 'idle'
  isLoading: boolean
  isTransitioning: boolean
  matches: Array<RouteMatch>
  location: ParsedLocation
  resolvedLocation: ParsedLocation
}
```

- `location` is the latest parsed browser location and may still be unresolved.
- `resolvedLocation` is the location whose matches have loaded.
- `matches` are the currently resolved active matches.

Use `useLocation()` or `useMatches()` instead of the entire state when possible.

## Core shapes

### Parsed location

```ts
interface ParsedLocation {
  href: string
  pathname: string
  search: FullSearchSchema
  searchStr: string
  state: ParsedHistoryState
  hash: string
  maskedLocation?: ParsedLocation
  unmaskOnReload?: boolean
}
```

Do not manually concatenate `pathname`, search, or hash. Use typed navigation or `router.buildLocation`.

### Route match

Useful `RouteMatch` fields include:

- identity: `id`, `routeId`, `pathname`
- typed inputs: `params`, `search`, `context`
- state: `status`, `isFetching`, `showPending`, `cause`
- output/errors: `loaderData`, `error`, `paramsError`, `searchError`
- lifecycle: `updatedAt`, `fetchedAt`, `abortController`, `ssr`

Match `status` can be `'pending'`, `'success'`, `'error'`, `'redirected'`, or `'notFound'`. Prefer route APIs over reaching into raw matches for ordinary params or loader data.

### Navigation types

`ToOptions` describes a destination:

- `from`, `to`
- `params`: object, updater, or `true` to retain
- `search`: object, updater, or `true` to retain
- `hash`
- `state`
- `mask`

`NavigateOptions` adds:

| Option | Default |
| --- | --- |
| `replace` | `false` |
| `resetScroll` | `true` |
| `hashScrollIntoView` | `true` |
| `viewTransition` | `false` |
| `ignoreBlocker` | `false` |
| `reloadDocument` | `false` |
| `href` | unset; use for fully built/external URLs |

`LinkOptions` additionally supports `target`, `activeOptions`, `preload`, `preloadDelay`, and `disabled`. `LinkProps` adds standard anchor attributes and a render-function child receiving `{ isActive }`.

## Router events

Subscribe outside render or inside an effect that returns the unsubscribe function:

```tsx
useEffect(
  () =>
    router.subscribe('onResolved', ({ toLocation }) => {
      analytics.page(toLocation.href)
    }),
  [router],
)
```

Events:

1. `onBeforeNavigate`
2. `onBeforeLoad`
3. `onLoad`
4. `onBeforeRouteMount`
5. `onResolved`
6. `onRendered`

`onInjectedHtml` is emitted for injected HTML and has only `type`. Navigation event payloads contain `fromLocation`, `toLocation`, and `pathChanged`, `hrefChanged`, and `hashChanged`.

Use events for observation, metrics, and integration—not as a substitute for route guards, loaders, or React rendering.

## Route masks and redirects

`createRouteMask({ routeTree, from, to, ... })` produces a typed reusable mask for `routeMasks`. A per-navigation mask has the same destination-building shape and can opt into `unmaskOnReload`.

`Redirect` extends `NavigateOptions` with:

- `statusCode`
- `headers`
- `throw`

Use `to` for registered internal routes and `href` for external URLs.

## History state

Extend the public `HistoryState` interface through declaration merging. `ParsedHistoryState` adds router-managed `__TSR_index` and optional `__TSR_key`. The older `key` field is scheduled for removal in v2.

```ts
declare module '@tanstack/react-router' {
  interface HistoryState {
    source?: 'command-palette' | 'navigation'
  }
}
```

## Deprecation

`routerOptions.notFoundRoute` is deprecated. Configure `notFoundComponent` on the root or relevant route boundary instead.

## Do

- Use selectors for reactive state and imperative router methods for actions.
- Keep the default protocol allowlist unless a reviewed feature needs another protocol.
- Unsubscribe from router events.
- Use `invalidate()` after mutations when Router-owned loader data is stale.
- Use route-level overrides for exceptional cache or pending behavior.
- Use `buildLocation` instead of string concatenation when a location must be computed without navigation.

## Don't

- Do not read `router.state` as reactive React state.
- Do not globally set `shouldReload: true` or zero all cache times without a measured need.
- Do not render DOM from `Wrap` or `InnerWrap` in an SSR application.
- Do not use router events to perform authorization.
- Do not mutate router-managed parsed history fields.
- Do not add unsafe protocols casually.
- Do not configure deprecated `notFoundRoute`.

## Official sources

- <https://tanstack.com/router/latest/docs/api/router/RouterOptionsType>
- <https://tanstack.com/router/latest/docs/api/router/RouterType>
- <https://tanstack.com/router/latest/docs/api/router/RouterStateType>
- <https://tanstack.com/router/latest/docs/api/router/RouterEventsType>
- <https://tanstack.com/router/latest/docs/api/router/NavigateOptionsType>

