# TanStack Query Integration

Use Router to determine *when* a route's data is needed and TanStack Query to own server-state freshness, caching, retries, mutations, and invalidation.

## Establish one typed QueryClient

Expose the client through root router context so loaders do not import a singleton:

```tsx
// routes/__root.tsx
import { createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({})
```

```tsx
// router.tsx
export function getRouter() {
  const queryClient = new QueryClient()

  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    // Always invoke loaders; Query decides whether its data is fresh.
    defaultPreloadStaleTime: 0,
  })
}
```

Create a fresh `QueryClient` and router for every SSR request. A browser-only SPA may keep one application instance.

## Reuse query option factories

Define the key and function once, parameterize every value that affects the result, ensure it in the loader, and subscribe in the component:

```tsx
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

const projectQuery = (projectId: string) =>
  queryOptions({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
    staleTime: 30_000,
  })

export const Route = createFileRoute('/projects/$projectId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(projectQuery(params.projectId)),
  component: ProjectPage,
})

function ProjectPage() {
  const { projectId } = Route.useParams()
  const { data } = useSuspenseQuery(projectQuery(projectId))
  return <h1>{data.name}</h1>
}
```

`ensureQueryData` resolves from fresh cache or fetches before rendering, eliminating a component-fetch waterfall. `useSuspenseQuery` then subscribes the component to updates. Prefer it for required SSR/streamed data; plain `useQuery` does not execute on the server in the Router SSR integration.

## Blocking versus streaming

- Return or await `ensureQueryData` for critical data. Navigation/SSR waits for it.
- To begin a non-critical query during SSR without blocking, call `fetchQuery` without returning or awaiting its promise, then read it below a Suspense boundary with `useSuspenseQuery`.
- Do not fire and forget ordinary promises in loaders unless the SSR/query integration is responsible for streaming and hydrating them.

```tsx
export const Route = createFileRoute('/users/$userId')({
  loader: ({ context, params }) => {
    void context.queryClient.fetchQuery(userDetailsQuery(params.userId))
  },
  component: UserPage,
})
```

## Add the SSR Query integration

`@tanstack/react-router-ssr-query` automates Query dehydration/hydration, streams queries resolving during the initial server render, handles thrown Router redirects by default, and can provide `QueryClientProvider`.

```tsx
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

export function getRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}
```

The integration wraps the app with `QueryClientProvider` by default. Pass `wrapQueryClient: false` only when an existing wrapper provides the *same* client. Redirect interception is enabled by default; use `handleRedirects: false` only with an intentional replacement.

## Mutations and invalidation

Invalidate the cache that owns the changed data:

```tsx
const updateProject = useMutation({
  mutationFn: api.updateProject,
  onSuccess: async (project) => {
    await queryClient.invalidateQueries({
      queryKey: ['project', project.id],
    })
  },
})
```

Call `router.invalidate()` as well only if the mutation changes router-owned loader data, router context, guards, or route-derived metadata. Do not reload every route merely to refresh one query.

For suspense query errors, coordinate the route error boundary with Query's reset boundary:

```tsx
function RouteError({ error, reset }: ErrorComponentProps) {
  const queryReset = useQueryErrorResetBoundary()

  useEffect(() => queryReset.reset(), [queryReset])

  return <ErrorView error={error} onRetry={reset} />
}
```

## Do

- Keep query keys complete, stable, and colocated with query functions.
- Inject the client through typed router context.
- Let route loaders eliminate waterfalls and Query own freshness.
- Use `defaultPreloadStaleTime: 0` when Query should evaluate every preload.
- Create request-scoped clients during SSR.
- Use targeted `invalidateQueries` after mutations.

## Don't

- Don't create a QueryClient inside a route component.
- Don't use different query keys in the loader and component.
- Don't await a query intended to stream, or forget to await critical data.
- Don't install two `QueryClientProvider`s with different clients.
- Don't set competing Router and Query freshness windows without deciding which one wins.
- Don't assume a client-side route guard protects the backing endpoint.

## Sources

- [External Data Loading](https://tanstack.com/router/latest/docs/guide/external-data-loading)
- [TanStack Query Integration](https://tanstack.com/router/latest/docs/integrations/query)
- [Basic React Query file-based example](https://tanstack.com/router/latest/docs/framework/react/examples/basic-react-query-file-based)
