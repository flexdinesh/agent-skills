# Data Loading, Caching, and Mutations

Use route loaders to coordinate data needed for a location. Loaders start before route components render, participate in preloading, receive typed params/search dependencies/context, and run in parallel after parent `beforeLoad` guards complete.

## Choose the cache owner

- Use TanStack Router's built-in loader cache for route-scoped data with modest caching needs.
- Use TanStack Query or another external cache for normalized/shared data, long-lived server state, optimistic mutations, polling, retries, or fine-grained invalidation.
- Keep one owner for freshness. When an external cache owns data, let the loader call that cache rather than returning a second independently cached copy.

## Define loader dependencies precisely

The route's parsed pathname is already part of the loader cache key. Add only the search values the loader actually reads through `loaderDeps`; path params do not need to be repeated.

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/products')({
  validateSearch: z.object({
    page: z.number().int().positive().catch(1),
    category: z.string().optional(),
    view: z.enum(['grid', 'list']).catch('grid'),
  }),
  loaderDeps: ({ search }) => ({
    page: search.page,
    category: search.category,
  }),
  loader: ({ deps, abortController }) =>
    fetchProducts(deps, { signal: abortController.signal }),
  component: ProductsPage,
})

function ProductsPage() {
  const products = Route.useLoaderData()
  return <ProductGrid products={products} />
}
```

Changing `view` does not reload this route because the loader does not use it. Dependency objects are compared deeply.

## Understand built-in cache defaults

| Option | Default | Meaning |
| --- | ---: | --- |
| `staleTime` / `defaultStaleTime` | `0` | Loaded data is immediately stale; revisiting serves it while reloading in the background. |
| `preloadStaleTime` / `defaultPreloadStaleTime` | `30_000` ms | A repeated preload within this window does not run again. |
| `gcTime` / `defaultGcTime` | `30 * 60_000` ms | Unused route data is removed after 30 minutes. |
| `pendingMs` / `defaultPendingMs` | `1_000` ms | Delay before showing pending UI for a slow load. |
| `pendingMinMs` / `defaultPendingMinMs` | `500` ms | Minimum time shown once pending UI appears, avoiding a flash. |

Set `staleTime` for data whose freshness policy is well understood. `staleTime: Infinity` prevents normal stale reloads; `staleReloadMode: 'blocking'` still permits stale data but waits for the reload instead of using stale-while-revalidate. Use `shouldReload` sparingly for policy that cannot be represented by dependencies and freshness.

To avoid retaining inactive loader results, use `gcTime: 0`. This does not disable preloading; turn preloading off separately if that is intended.

## Separate critical and deferred data

Await data required to choose or render the route. Return a promise without awaiting it only for non-critical data and render it inside a local Suspense boundary with `Await`. Deferred promises inherit the route loader's cache lifecycle. See `ssr-deferred-data-and-document-head.md` for streaming implications.

Use the loader's `abortController.signal` for cancellable requests. Treat `preload` as a hint only when an upstream API needs a different cache policy:

```tsx
export const Route = createFileRoute('/reports')({
  loader: ({ preload, abortController }) =>
    fetchReports({
      signal: abortController.signal,
      maxAge: preload ? 10_000 : 0,
    }),
})
```

## Mutate through a mutation owner

The router coordinates mutations but is not a full mutation-state manager. Prefer TanStack Query or another library when submission state, optimistic updates, retries, concurrent mutations, or keyed history matter.

After changing data owned by route loaders, invalidate active matches:

```tsx
import { useRouter } from '@tanstack/react-router'

function AddTodoButton() {
  const router = useRouter()

  const addTodo = async (input: NewTodo) => {
    await api.addTodo(input)
    await router.invalidate({ sync: true })
  }

  return <button onClick={() => void addTodo(draft)}>Add</button>
}
```

Without `{ sync: true }`, invalidation reloads in the background and continues to show existing data. Await synchronized invalidation only when the next UI step must observe the refreshed loaders.

Prefer mutation keys that include route identity, such as `['updatePost', postId]`, so submission state does not leak between resources. If a mutation library cannot key or reset state, clear it after a path-changing `onResolved` event and unsubscribe on cleanup.

## Do

- Validate search before deriving `loaderDeps`.
- Return only dependencies actually consumed by the loader.
- Fetch independent child-route data in child loaders so it starts in parallel.
- Pass abort signals into fetches.
- Put authentication/authorization routing decisions in `beforeLoad`, before private loaders start.
- Throw `redirect()` and `notFound()` instead of returning sentinel loader data.
- Use targeted cache invalidation when the cache owner supports it.

## Don't

- Don't return the entire search object from `loaderDeps`; unrelated URL changes will reload data.
- Don't fetch critical route data only in `useEffect`; it creates waterfalls, loading flashes, and weak SSR output.
- Don't assume `staleTime: 0` means “no cache”; it means immediately stale SWR data.
- Don't use `shouldReload` to compensate for missing dependencies.
- Don't duplicate external-cache results in long-lived router loader data.
- Don't swallow loader errors or redirects in broad `catch` blocks.
- Don't use router invalidation as a substitute for API-side authorization or consistency.

## Sources

- [Data Loading](https://tanstack.com/router/latest/docs/guide/data-loading)
- [Deferred Data Loading](https://tanstack.com/router/latest/docs/guide/deferred-data-loading)
- [External Data Loading](https://tanstack.com/router/latest/docs/guide/external-data-loading)
- [Data Mutations](https://tanstack.com/router/latest/docs/guide/data-mutations)
- [RouteOptions API](https://tanstack.com/router/latest/docs/api/router/RouteOptionsType)

