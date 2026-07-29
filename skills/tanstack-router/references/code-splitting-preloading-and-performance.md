# Code Splitting, Preloading, and Performance

Split non-critical route UI while keeping matching and data-start logic available early. Then preload likely destinations so the code and data arrive before navigation.

## Prefer automatic file-route splitting

With a supported bundler plugin, enable automatic splitting and place the Router plugin before React:

```tsx
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
  ],
})
```

Automatic splitting requires a supported bundler integration; the standalone Router CLI cannot perform it. The default automatic groupings create separate chunks for `component`, `errorComponent`, and `notFoundComponent`. Customize split groupings only after measuring request overhead and shared-code duplication.

Keep critical route configuration eager:

- path parsing and serialization
- search validation
- `beforeLoad`, context, and ordinary loaders
- static data and route metadata needed before rendering

Lazy route configuration normally includes components and UI boundaries. Loaders are eager by design so preloading can start data immediately without first waiting for a loader chunk. Splitting loaders is supported by automatic grouping configuration, but usually creates an avoidable sequential request.

## Use `.lazy.tsx` when automation is unavailable

```tsx
// routes/posts.tsx — critical
export const Route = createFileRoute('/posts')({
  loader: getPosts,
})
```

```tsx
// routes/posts.lazy.tsx — non-critical
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/posts')({
  component: PostsPage,
  pendingComponent: PostsSkeleton,
  errorComponent: PostsError,
})
```

`createLazyFileRoute` accepts only `component`, `pendingComponent`, `errorComponent`, and `notFoundComponent`. The root route is always rendered and cannot be split this way. For code-based routing, use `createLazyRoute`/route `.lazy()` and keep the same critical/non-critical distinction.

## Make intent preloading the baseline

```tsx
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})
```

Strategies:

- `'intent'`: starts after hover or touch intent; a strong general default.
- `'viewport'`: starts when a link becomes visible through Intersection Observer.
- `'render'`: starts as soon as the link renders; reserve for destinations almost certain to be needed.
- `false`: disables preloading for a specific link or router default.

Override with `<Link preload="viewport" />` or `preload={false}` where user intent differs.

Relevant defaults:

- intent preload delay: 50 ms (`defaultPreloadDelay` / `preloadDelay`)
- built-in preload freshness: 30 seconds (`defaultPreloadStaleTime`)
- unused preloaded match lifetime: 30 seconds (`defaultPreloadMaxAge`)

Normal navigation promotes the preloaded match. When an external cache such as TanStack Query owns freshness, set Router's `defaultPreloadStaleTime: 0`; the loader runs and lets the external cache decide whether to fetch.

## Preload manually only for real signals

```tsx
const router = useRouter()

useEffect(() => {
  if (editorLikelyNext) {
    void router.preloadRoute({
      to: '/projects/$projectId/edit',
      params: { projectId },
    })
  }
}, [editorLikelyNext, projectId, router])
```

`preloadRoute` loads a destination's route dependencies and data. `loadRouteChunk(route)` loads only code; use it for code-only warming when fetching the data would be wasteful.

## Diagnose performance in layers

1. Confirm route data starts in loaders rather than after component mount.
2. Inspect network waterfalls and chunk sizes.
3. Use intent preloading for likely next routes.
4. Move slow non-critical data behind deferred Suspense boundaries.
5. Use selectors to limit router-state re-renders.
6. Only then customize chunk grouping, preload timing, or pending thresholds.

Too many tiny chunks add request and evaluation overhead. Too much render preloading spends bandwidth and server capacity on routes never visited. The best boundary follows measured route usage and shared dependencies.

## Do

- Prefer automatic splitting for file-based routes on a supported bundler.
- Keep the Router bundler plugin before the React plugin.
- Keep guards, validation, and ordinary loaders eager.
- Use intent preloading as the default and override exceptional links.
- Measure initial JavaScript, navigation waterfalls, and unused preloads.
- Use route directories to colocate eager and lazy files.

## Don't

- Don't expect `@tanstack/router-cli` alone to perform automatic code splitting.
- Don't split the root route.
- Don't put `loader`, `beforeLoad`, or search validation in `.lazy.tsx`.
- Don't split loaders by default; doing so delays data kickoff.
- Don't use `'render'` on large lists without a bandwidth budget.
- Don't tune preload cache values blindly when an external cache owns freshness.
- Don't assume more chunks always means faster.

## Sources

- [Code Splitting](https://tanstack.com/router/latest/docs/guide/code-splitting)
- [Automatic Code Splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting)
- [Preloading](https://tanstack.com/router/latest/docs/guide/preloading)
- [Render Optimizations](https://tanstack.com/router/latest/docs/guide/render-optimizations)
- [Lazy-loaded monorepo example](https://tanstack.com/router/latest/docs/framework/react/examples/router-monorepo-simple-lazy)
