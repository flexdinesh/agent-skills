# History, Masking, Rewrites, and Scroll

These features alter different layers of navigation:

| Concern | Purpose |
| --- | --- |
| History | Where navigation entries are stored |
| Route mask | Store an internal location behind a different history URL |
| URL rewrite | Bidirectionally translate public URLs and internal route URLs |
| Scroll restoration | Cache/reset scroll state across history transitions |

Choose by semantics, not by which feature can make a URL look different.

## History implementations

Browser history is the default and should be used for normal web applications:

```ts
const router = createRouter({ routeTree })
```

Use hash history only when the host cannot serve the application shell for arbitrary paths:

```ts
import { createHashHistory, createRouter } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  history: createHashHistory(),
})
```

Use memory history for tests, non-browser rendering, isolated widgets, or server routing:

```ts
import { createMemoryHistory, createRouter } from '@tanstack/react-router'

const history = createMemoryHistory({
  initialEntries: ['/posts/42'],
})

const router = createRouter({ routeTree, history })
```

Prefer server fallback/rewrite configuration plus browser history over hash routing when you control the deployment.

## Route masking

Masking is suited to contextual UI whose direct/shared URL should render a stable fallback. A photo modal can run at an internal modal route while displaying the photo's normal URL:

```tsx
<Link
  to="/photos/$photoId/modal"
  params={{ photoId: '42' }}
  mask={{
    to: '/photos/$photoId',
    params: { photoId: '42' },
  }}
>
  Open photo
</Link>
```

The internal location is stored in history state. If the displayed URL is copied into another history stack, only the displayed route remains, so `/photos/42` must be a useful standalone page.

For repeated patterns, declare a typed router mask:

```ts
import { createRouteMask, createRouter } from '@tanstack/react-router'

const photoModalMask = createRouteMask({
  routeTree,
  from: '/photos/$photoId/modal',
  to: '/photos/$photoId',
  params: (previous) => ({ photoId: previous.photoId }),
})

const router = createRouter({
  routeTree,
  routeMasks: [photoModalMask],
})
```

By default, a local reload can retain masking because history state survives. Set `unmaskOnReload` globally, on a declared mask, or on an individual navigation when reload should resolve to the displayed fallback.

Masking is not security, access control, or URL rewriting. Both masked and fallback routes must have intentional behavior.

## Bidirectional URL rewrites

Rewrites transform the browser-facing URL before matching and transform the internal URL before link generation/history writes:

```ts
const router = createRouter({
  routeTree,
  rewrite: {
    input: ({ url }) => {
      // Public /en/about -> internal /about
      url.pathname = url.pathname.replace(/^\/en(?=\/|$)/, '') || '/'
      return url
    },
    output: ({ url }) => {
      // Internal /about -> public /en/about
      url.pathname = `/en${url.pathname === '/' ? '' : url.pathname}`
      return url
    },
  },
})
```

The location exposes:

- `location.href`: internal URL after input rewriting.
- `location.publicHref`: external URL after output rewriting.

Use `publicHref` for sharing, analytics, and canonical URLs. `<Link>` and programmatic navigation apply output rewrites automatically. If an output rewrite changes origin, Router uses a hard navigation.

Compose independent transformations:

```ts
import { composeRewrites } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  rewrite: composeRewrites([localeRewrite, tenantRewrite]),
})
```

Input rewrites run in array order; output rewrites run in reverse order so transformations unwrap correctly. A configured `basepath` is composed automatically: it is stripped before custom input and restored after custom output.

Keep rewrite pairs deterministic and reversible. An input-only legacy alias can make an old URL match a new route, but it is not an HTTP permanent redirect and does not transfer SEO status by itself.

## Scroll behavior

Hash scrolling and window scroll-to-top work without additional configuration. Add nested scrolling surfaces when the application shell owns scrolling:

```ts
const router = createRouter({
  routeTree,
  scrollToTopSelectors: ['#main-scroll-area'],
})
```

Enable back/forward restoration:

```ts
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  scrollRestorationBehavior: 'instant',
})
```

`<ScrollRestoration />` still works but is deprecated; prefer router configuration.

The default restoration cache key is each history entry's `location.state.__TSR_key`. Override it only for intentional shared behavior:

```ts
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  getScrollRestorationKey: (location) => location.pathname,
})
```

Pathname keys reuse a position across visits to the same path; history-entry keys keep visits independent.

Suppress restoration/reset for a specific navigation:

```tsx
<Link to="/results" resetScroll={false}>
  Update results without moving
</Link>
```

For a virtualized window or element, use `useElementScrollRestoration`. Give element-based restoration a stable `data-scroll-restoration-id`, then pass the cached offset into the virtualizer as its initial offset.

## Do

- Use browser history with a server app-shell fallback when deployment allows it.
- Make every masked public URL a useful direct-entry fallback.
- Use bidirectional rewrites for stable public/internal URL translation.
- Use `publicHref` when referring to the URL users actually see.
- Enable scroll restoration for long or multi-pane SPA views.
- Use stable, intentional cache keys and element restoration IDs.

## Don't

- Don't use hash history merely to avoid configuring a server you control.
- Don't use a mask to hide sensitive data or enforce permissions.
- Don't use a rewrite when an actual HTTP redirect and status code are required.
- Don't make input/output rewrites disagree or depend on non-deterministic client-only state during SSR.
- Don't key all scroll positions by pathname unless shared positions are desired.
- Don't use the deprecated `<ScrollRestoration />` in new code.

## Official sources

- [History Types](https://tanstack.com/router/latest/docs/guide/history-types)
- [Route Masking](https://tanstack.com/router/latest/docs/guide/route-masking)
- [URL Rewrites](https://tanstack.com/router/latest/docs/guide/url-rewrites)
- [Scroll Restoration](https://tanstack.com/router/latest/docs/guide/scroll-restoration)

