# Route context, data loading, and caching

Router owns route context, loaders, loader dependencies, preloading, and its
loader cache. Start executes this lifecycle during SSR and transports loader
results into hydration.

## Typed context

Declare dependencies at the root:

```tsx
import { createRootRouteWithContext } from '@tanstack/react-router'

export interface RouterContext {
  queryClient: QueryClient
  user: PublicUser | null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootDocument,
})
```

Create the context per router/request. `beforeLoad` may return additional
context for descendants. Keep request secrets out of client-visible Router
context.

React-hook-derived values cannot be read directly in loaders. Bridge current,
client-safe values through Router context using the supported Start/Router
integration pattern.

## Loader purpose

Use loaders for data required to render a route. They:

- Run during initial SSR by default.
- May run in the browser during navigation.
- Can depend on validated path/search values.
- Participate in Router caching, preloading, invalidation, pending, and error
  behavior.

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => getPost({ data: params.postId }),
})
```

Forward cancellation where the called API explicitly supports it. Never invent
transport options on a server-function call. Never access a database,
filesystem, or secret directly in a loader; call a Start server function.

## Cache identity

Router loader identity includes the route match and loader dependencies. Put
every data-changing search value in `loaderDeps`. Choose `staleTime`,
`preloadStaleTime`, `gcTime`, and `shouldReload` deliberately rather than
copying unrelated defaults.

## Router cache or Query

Use Router cache when data is primarily route-scoped and the loader lifecycle is
the natural owner.

Use TanStack Query when data is:

- Shared across many routes/components.
- Refetched in the background.
- Mutated optimistically.
- Paginated/infinite or independently stale.
- Already managed through stable query option factories.

When Query owns the cache, loaders should warm the same request-scoped
QueryClient and components should consume the same query key/options. Do not
load a second copy into Router cache by accident.

## Query SSR seam

Create a QueryClient per router/request, put it in Router context, and use the
current official Start/Router Query SSR integration. Loader
`ensureQueryData(...)` is appropriate for render-critical data;
`prefetchQuery(...)` can intentionally leave work pending. Preserve dehydration
and hydration behavior supplied by the integration package.

## Invalidating

- `router.invalidate()` reruns invalidated Router lifecycle/loaders.
- Query invalidation refetches Query-owned data.
- Invalidate narrowly when possible.
- Await invalidation when the UI's pending state must include refreshed data.

## Do

- Load render-critical data before component render.
- Use a fresh cache per SSR request.
- Include validated dependencies in the loader key.
- Forward abort signals to cancellable work.
- Define one owner for each cached resource.

## Don't

- Treat a loader as server-only.
- Construct a global SSR QueryClient.
- Fetch the same resource into unrelated Router and Query caches.
- Use global invalidation for every small mutation.
- Hide thrown loader failures in an `{ error }` result unless that union is
  intentional product behavior.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/routing
- https://tanstack.com/start/latest/docs/framework/react/guide/execution-model
- https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
- https://tanstack.com/router/latest/docs/framework/react/guide/preloading
- https://tanstack.com/router/latest/docs/framework/react/guide/router-context
- https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading
