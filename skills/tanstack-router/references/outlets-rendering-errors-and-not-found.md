# Outlets, Rendering, Errors, and Not Found

Design boundaries with the route tree. A parent component renders `<Outlet />` where its matching child belongs; pending, error, and not-found boundaries are selected from the matching route hierarchy.

## Compose layouts with outlets

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <>
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </>
  )
}
```

`<Outlet />` takes no props and renders the next matching child, or `null` when there is none. A route with no `component` automatically behaves as an outlet, so omit wrapper components that add no UI, state, or boundary.

## Place pending UI deliberately

A route's `pendingComponent` appears when loading crosses `pendingMs` (1 second by default). Once shown, it remains for at least `pendingMinMs` (500 ms by default). Configure these globally or per route; do not set both to zero across an application without measuring the visual churn.

Keep structural shells in parent layouts and put route-specific skeletons near their data. Defer non-critical content behind a nested Suspense boundary rather than blocking the whole route.

```tsx
export const Route = createFileRoute('/projects/$projectId')({
  loader: ({ params }) => getProject(params.projectId),
  pendingComponent: ProjectSkeleton,
  errorComponent: ProjectError,
  component: ProjectPage,
})
```

## Handle errors at useful recovery boundaries

Errors thrown by parsing, `beforeLoad`, loaders, and rendering flow to route error boundaries. Put a domain-specific `errorComponent` on the nearest route that can explain and recover; provide a router-wide fallback for unexpected errors.

```tsx
import type { ErrorComponentProps } from '@tanstack/react-router'

function ProjectError({ error, reset }: ErrorComponentProps) {
  return (
    <section role="alert">
      <h1>Could not load this project</h1>
      <p>{error instanceof Error ? error.message : 'Unexpected error'}</p>
      <button onClick={reset}>Try again</button>
    </section>
  )
}
```

`reset` resets the rendered error boundary. If the underlying data remains stale, couple retry to the owning cache or router invalidation. With TanStack Query suspense, reset its query error boundary as described in `tanstack-query-integration.md`.

Use `CatchBoundary` only when a component subtree needs a boundary independent of routing. Route `errorComponent` is the default for route-level failures.

## Distinguish missing URLs from missing resources

Configure a real root/default not-found experience; the built-in fallback is intentionally only `<p>Not Found</p>`.

```tsx
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await getPost(params.postId)
    if (!post) throw notFound()
    return post
  },
  notFoundComponent: () => <PostNotFound />,
  component: PostPage,
})
```

Throw missing-resource errors in loaders where possible. This narrows loader data to the found case and avoids a render flicker. A `notFound()` is handled by the route or nearest valid ancestor with `notFoundComponent`; it can target a boundary explicitly with `routeId`.

Important boundary rules:

- A leaf route can handle a `notFound()` thrown by its own loading/rendering.
- A leaf cannot act as an unmatched-child URL boundary because it has no outlet.
- `notFoundComponent` does not render an `<Outlet />`.
- Parent loaders needed by the selected boundary may still run when `beforeLoad` throws `notFound()`.
- `NotFoundRoute` is deprecated; use `notFoundComponent` and `notFound()`.

Use `CatchNotFound` only for a component subtree that needs local missing-state UI. Prefer route-level not-found handling for routed resources.

## Subscribe to the smallest render state

Router hooks are reactive; direct `router.state` reads are not. Select only the value the component needs:

```tsx
const isNavigating = useRouterState({
  select: (state) => state.isLoading,
})

const page = Route.useSearch({
  select: (search) => search.page,
})
```

Router preserves unchanged references in parsed state. A selector that creates a new object still re-renders unless structural sharing is enabled:

```tsx
const summary = Route.useSearch({
  select: ({ page, filter }) => ({ page, filter }),
  structuralSharing: true,
})
```

Fine-grained selector structural sharing is off by default for backward compatibility. Enable it per hook or with `defaultStructuralSharing: true`. It supports JSON-compatible values only; disable it for `Date`, class instances, and other non-JSON results.

## Do

- Put persistent chrome above an outlet so child navigation preserves it.
- Omit `component` when a route only groups children.
- Put recovery UI at the nearest meaningful route boundary.
- Throw `notFound()` from loaders for absent resources.
- Configure an intentional global error and not-found fallback.
- Use hook selectors for frequently changing router/search state.
- Make error UI accessible and provide a real recovery path.

## Don't

- Don't forget `<Outlet />` in a layout that must render children.
- Don't render an outlet from `notFoundComponent`.
- Don't use a generic error boundary to represent an expected 404.
- Don't return `null` from a typed loader and make every component rediscover not-found state.
- Don't use the deprecated `NotFoundRoute`.
- Don't read `router.state` in a component and expect reactivity.
- Don't return newly allocated selector objects without structural sharing or memoization.

## Sources

- [Outlets](https://tanstack.com/router/latest/docs/guide/outlets)
- [Data Loading: pending and error handling](https://tanstack.com/router/latest/docs/guide/data-loading)
- [Not Found Errors](https://tanstack.com/router/latest/docs/guide/not-found-errors)
- [Render Optimizations](https://tanstack.com/router/latest/docs/guide/render-optimizations)
- [ErrorComponent API](https://tanstack.com/router/latest/docs/api/router/errorComponentComponent)

