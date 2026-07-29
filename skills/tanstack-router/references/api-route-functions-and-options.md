# API: route functions and options

Use this reference when defining routes, choosing a route factory, or reviewing route lifecycle configuration.

## Choose the route factory

| API | Use |
| --- | --- |
| `createFileRoute(path)(options)` | Complete file-based route; preferred for normal route files |
| `createLazyFileRoute(path)(options)` | Manually split file-based UI-only configuration |
| `createRootRoute(options)` | Root without an application router-context contract |
| `createRootRouteWithContext<T>()(options)` | Root that requires typed router context |
| `createRoute(options)` | Complete code-based route |
| `createLazyRoute(id)(options)` | UI-only half of a code-based lazy route |
| `createRouter(options)` | Router instance from a completed route tree |
| `createRouteMask(options)` | Typed reusable mask for `routerOptions.routeMasks` |
| `getRouteApi(routeId)` | Route-bound hooks and redirect outside the declaring route file |

File routes must export the route as `Route`; generator commands insert and maintain the path literal:

```tsx
export const Route = createFileRoute('/teams/$teamId')({
  component: TeamPage,
})
```

For code-based routes, `getParentRoute` is required and must return the actual parent:

```tsx
const teamRoute = createRoute({
  getParentRoute: () => teamsRoute,
  path: '$teamId',
  component: TeamPage,
})
```

Use `id` instead of `path` for a code-based pathless layout.

## Critical and lazy route configuration

Lazy factories accept only non-critical render properties:

- `component`
- `pendingComponent`
- `errorComponent`
- `notFoundComponent`

Matching, validation, dependencies, context, `beforeLoad`, and loaders remain in the critical route:

```tsx
// routes/reports.tsx
export const Route = createFileRoute('/reports')({
  validateSearch: reportSearchSchema,
  loaderDeps: ({ search }) => ({ range: search.range }),
  loader: ({ context, deps }) => context.api.reports(deps.range),
})
```

```tsx
// routes/reports.lazy.tsx
export const Route = createLazyFileRoute('/reports')({
  component: ReportsPage,
  pendingComponent: ReportsSkeleton,
})
```

Prefer the bundler plugin's `autoCodeSplitting: true` to manual `.lazy.tsx` files when using file-based routes.

## Route option pipeline

The operational order is:

```text
params/search validation
  -> loaderDeps
  -> context
  -> beforeLoad
  -> loader
  -> render/lifecycle/head
```

### Path and param parsing

- `path`: matching segment; use `$name` for a dynamic param.
- `id`: identifies a pathless layout when no `path` is present.
- `params.parse`: parse and validate raw string params; may experimentally return `false` to skip a candidate.
- `params.priority`: defaults to `0`; higher values run first among competing routes using `params.parse`.
- `params.stringify`: convert parsed params back to strings when building locations.
- `caseSensitive`: makes this route case-sensitive.

Keep parse and stringify symmetrical:

```tsx
export const Route = createFileRoute('/invoices/$invoiceId')({
  params: {
    parse: ({ invoiceId }) => {
      const parsed = Number(invoiceId)
      if (!Number.isInteger(parsed)) throw new Error('Invalid invoice ID')
      return { invoiceId: parsed }
    },
    stringify: ({ invoiceId }) => ({ invoiceId: String(invoiceId) }),
  },
})
```

### Search validation and middleware

`validateSearch(raw)` returns the validated search shape used by the route and its descendants. Throwing puts the match into an error state. `search.middlewares` transform search when links or locations are built.

Use `retainSearchParams(keys | true)` and `stripSearchParams(keys | defaults | true)` for standard behavior:

```tsx
const defaults = { page: 1, sort: 'newest' as const }

export const Route = createFileRoute('/catalog')({
  validateSearch: (raw): CatalogSearch => parseCatalogSearch(raw),
  search: {
    middlewares: [stripSearchParams(defaults)],
  },
})
```

Use `SearchSchemaInput` when link inputs intentionally differ from validated outputs, such as optional inputs that receive defaults.

### Loader dependencies

`loaderDeps({ search })` returns serializable values that participate in loader identity and are passed as `loader({ deps })`. Path params already identify a match; do not repeat them in loader deps.

```tsx
export const Route = createFileRoute('/issues')({
  validateSearch: issueSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    status: search.status,
  }),
  loader: ({ context, deps, abortController }) =>
    context.api.listIssues(deps, abortController.signal),
})
```

Include every search value used by the loader. Use the provided abort signal for cancelable I/O.

### Context and guards

`beforeLoad` sees parent context and may return additional context for this route and its descendants. A rejected `beforeLoad` prevents the loader and rendering.

```tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw Route.redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    return { user: context.user }
  },
})
```

Use `Route.redirect()` or `getRouteApi(id).redirect()` for type-safe relative redirects. Use standalone `redirect({ to })` when no route binding is available; use `href` for external URLs.

### Loader and cache controls

The loader receives `context`, parsed `params`, `deps`, `location`, `abortController`, `cause`, and route/match data. It may be a function or:

```ts
loader: {
  handler: loadProject,
  staleReloadMode: 'blocking',
}
```

Relevant defaults:

| Route option | Effective router default |
| --- | --- |
| `staleTime` | `0` |
| `preloadStaleTime` | `30_000` ms |
| `gcTime` | 30 minutes |
| `pendingMs` | `1_000` ms |
| `pendingMinMs` | `500` ms |
| `preloadMaxAge` | `30_000` ms |
| `staleReloadMode` | `'background'` |

`shouldReload` can force, prevent, or defer to normal stale-while-revalidate behavior. Prefer cache policy to unconditional reloads.

### Render and lifecycle

- `component` defaults to `<Outlet />`.
- `pendingComponent` appears only after `pendingMs`, for at least `pendingMinMs`.
- `errorComponent` catches route errors.
- `notFoundComponent` handles not-found errors at that boundary.
- `wrapInSuspense` forces a suspense boundary.
- `remountDeps` returns a JSON-serializable value; the component remounts when it changes.
- `onEnter`, `onStay`, and `onLeave` observe match lifecycle.
- `onError` observes navigation/preload errors and may throw a redirect.
- `onCatch` observes errors caught by the React error boundary.
- `head`, `scripts`, and `headers` produce route-level document/SSR metadata.
- `codeSplitGroupings` overrides automatic split grouping for the route.

## Control-flow helpers

```tsx
import {
  isNotFound,
  isRedirect,
  notFound,
  redirect,
} from '@tanstack/react-router'
```

- `redirect(options)` returns a redirect, or throws it when `throw: true`; normally `throw redirect(...)` from `beforeLoad` or a loader.
- `notFound(options?)` behaves similarly for not-found control flow.
- `isRedirect(value)` and `isNotFound(value)` narrow unknown caught values.
- To force root handling, use `notFound({ routeId: rootRouteId })`.
- Native promises are deferred automatically. Do not wrap them with `defer()` in new code.

## Current deprecations in route options

| Deprecated | Replacement |
| --- | --- |
| `parseParams` | `params.parse` |
| `stringifyParams` | `params.stringify` |
| `preSearchFilters` | `search.middlewares` |
| `postSearchFilters` | `search.middlewares` |
| `beforeLoad({ navigate })` | `throw redirect({ to: ... })` |
| `loader({ navigate })` | `throw redirect({ to: ... })` |
| `notFound({ global: true })` | `notFound({ routeId: rootRouteId })` |
| Manual `defer(promise)` | Return the promise directly |

The `params.parse` ability to return `false` and `useBlocker`'s newer API are explicitly experimental; isolate them behind small local abstractions if adopted.

## Do

- Keep inference producers before consumers in the route options object.
- Keep matching and data-critical options out of lazy route files.
- Use route-bound redirects and include every loader-relevant search value in `loaderDeps`.
- Throw redirects and not-found values from guards/loaders.
- Keep `params.parse` and `params.stringify` round-trip compatible.
- Use `abortController.signal` in loader requests.

## Don't

- Do not return `false` from `params.parse` without consciously accepting an experimental API.
- Do not split loaders merely because components are split; an extra loader chunk delays data loading.
- Do not call imperative `navigate` from `beforeLoad` or a loader.
- Do not use deprecated search filters or param parser fields in new code.
- Do not use `to` for an external redirect; use `href`.
- Do not duplicate path params in `loaderDeps`.

## Official sources

- <https://tanstack.com/router/latest/docs/api/router>
- <https://tanstack.com/router/latest/docs/api/router/RouteOptionsType>
- <https://tanstack.com/router/latest/docs/api/router/createFileRouteFunction>
- <https://tanstack.com/router/latest/docs/api/router/createLazyFileRouteFunction>
- <https://tanstack.com/router/latest/docs/api/router/redirectFunction>
- <https://tanstack.com/router/latest/docs/api/router/notFoundFunction>

