# Example Recipes and Monorepos

Use this reference when choosing a working pattern from the official React
examples or when routes and screens live in different packages. Examples are
illustrative: verify behavior and defaults against the relevant guide and API
reference before treating a pattern as normative.

## Choose the smallest relevant example

| Need | Start with |
| --- | --- |
| Minimal file routes | Quickstart (file-based) |
| Programmatic route tree | Quickstart (code-based) |
| Loaders, boundaries, params, and lazy routes | Basic |
| Router loaders backed by Query | Basic + React Query |
| Custom Router SSR | Basic + SSR or SSR Streaming |
| A focused feature | The matching feature example |
| Cross-package route ownership | A monorepo example |

Kitchen-sink examples demonstrate breadth, not a preferred application
architecture. Extract the narrow pattern you need rather than copying the whole
project.

## Stable application baseline

The file-based quickstart demonstrates the common client entrypoint:

```tsx
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

root.render(<RouterProvider router={router} />)
```

Keep one client router for a client-rendered application. For custom SSR, export
a factory and create a fresh router per request so request-specific context and
cache state do not leak between users.

### Do

- Prefer file routing for ordinary applications.
- Register the router type once at the package boundary that owns the route tree.
- Treat `routeTree.gen.ts` and generated `createFileRoute` path literals as
  generated code.

### Don't

- Don't copy the generated route tree into authored configuration.
- Don't construct a new client router during every component render.
- Don't copy artificial delays, mock authentication, or deliberately invalid
  links from demos.

## Query-backed route data

The Query examples share stable query options between loaders and components:

```tsx
const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
  })

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(postQueryOptions(params.postId)),
  component: PostScreen,
})

function PostScreen() {
  const { postId } = Route.useParams()
  const { data } = useSuspenseQuery(postQueryOptions(postId))
  return <article>{data.title}</article>
}
```

The same `QueryClient` must be supplied through typed router context and the
Query provider. With Query controlling freshness, examples commonly configure
`defaultPreloadStaleTime: 0` so Router asks Query whether cached data is fresh.

### Do

- Use one query-option factory and one cache key for loader and component.
- Let the loader orchestrate navigation-critical cache warming.
- Reset Query errors and invalidate Router matches deliberately when retrying a
  failed route.

### Don't

- Don't create separate Query clients for Router and React.
- Don't fetch the same resource independently under different cache keys.
- Don't copy blanket invalidation from a demo when a targeted key or route is
  known.

## Authentication recipe

The authenticated-routes example injects auth through typed router context and
guards a pathless layout:

```tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

After login or logout, invalidate the router so `beforeLoad` and dependent
matches re-evaluate. Preserve `location.href` from the `beforeLoad` argument
rather than reading a possibly stale resolved location from global router
state.

This protects the UI only. Every server endpoint and private data operation must
perform its own authentication and authorization.

## Focused feature recipes

### Location masking

Use `createRouteMask` for a reusable mapping, such as showing a photo modal at
an internal modal route while presenting the canonical photo URL. A centralized
mask is easier to audit than unrelated per-link masks. Always confirm what a
reload should reveal and whether `unmaskOnReload` is appropriate.

### Scroll restoration

Start with router-level `scrollRestoration`. Use `resetScroll={false}` for
navigations that should retain the position and a stable restoration ID for
scrollable elements. Virtualized lists can consume the restored offset as their
initial offset.

### Deferred data

Await navigation-critical data in the loader. Return secondary promises for
progressive rendering and handle them with the current React/Router suspense
pattern documented for the installed React version. Do not make SEO-critical or
layout-critical data secondary merely to demonstrate streaming.

### Navigation blocking

Tie `useBlocker` to real dirty state. If using resolver mode, present the prompt
and call `proceed` or `reset` explicitly. Enable `beforeunload` only while
unsaved state exists.

### Transitions

Prefer the router's native `viewTransition` option where it meets the design.
Use named transition types only with appropriate browser fallbacks. For Framer
Motion, key animation from the active route matches and keep the outlet's route
ownership clear.

### tRPC

Put the typed tRPC client in router context. Use loaders as request
orchestration, validate all URL inputs, and share Query option factories when
using tRPC with Query.

## Monorepo boundary

The official monorepo examples use a component-free router package that owns the
tree and module augmentation:

```text
packages/
  router/       route tree, route IDs, module augmentation, Router re-exports
  feature-a/    screens and feature code
apps/
  web/          router construction, providers, feature bindings
```

The central router package re-exports TanStack Router APIs so feature packages
compile against the same registered router type. The application binds route
IDs to feature components. A lazy variant binds typed `createLazyRoute` modules
at those boundaries.

### Do

- Keep one owner for route registration and module augmentation.
- Re-export Router APIs through that owner when packages need the registered
  types.
- Keep shared query-option factories below both loader and UI packages to avoid
  dependency cycles.
- Use `getRouteApi(routeId)` or `createLazyRoute(routeId)` when a feature cannot
  import a file route safely.

### Don't

- Don't repeat module augmentation in every feature package.
- Don't let feature packages construct competing route trees.
- Don't create a cycle where the router imports a feature that imports the
  router package's runtime implementation.
- Don't reach for `strict: false` merely to work around a package-boundary
  design problem.

## Source map

- [React Router examples navigation](https://tanstack.com/router/latest/docs/framework/react/examples/quickstart-file-based)
- [Official React example source](https://github.com/TanStack/router/tree/main/examples/react)
- [Quickstart file-based](https://tanstack.com/router/latest/docs/framework/react/examples/quickstart-file-based)
- [Basic React Query file-based](https://tanstack.com/router/latest/docs/framework/react/examples/basic-react-query-file-based)
- [Authenticated routes](https://tanstack.com/router/latest/docs/framework/react/examples/authenticated-routes)
- [Monorepo basic](https://tanstack.com/router/latest/docs/framework/react/examples/router-monorepo-simple)
- [Monorepo lazy](https://tanstack.com/router/latest/docs/framework/react/examples/router-monorepo-simple-lazy)
- [Monorepo with Query](https://tanstack.com/router/latest/docs/framework/react/examples/router-monorepo-react-query)
