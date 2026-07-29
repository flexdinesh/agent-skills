---
name: tanstack-router
description: "Build and maintain type-safe React applications with TanStack Router. Use only when the user explicitly invokes `tanstack-router` or `$tanstack-router`; do not auto-invoke from context."
---

# TanStack Router

Manual invocation only: use this skill only when the user explicitly invokes
`tanstack-router` or `$tanstack-router`; do not auto-invoke from task context.

Build React and TypeScript applications with `@tanstack/react-router`. This
skill targets TanStack Router v1 and includes framework-neutral Router concepts
where useful. It does not cover Solid Router or TanStack Start.

## Working method

1. Inspect the installed Router, React, bundler, and validation-library versions.
2. Determine whether routing is file-based, code-based, or intentionally mixed.
3. Read only the references required by the task from the routing table below.
4. Preserve the application's existing route ownership and generated-file
   configuration unless the task explicitly changes architecture.
5. Implement with strict route IDs, `from`/`to` narrowing, and validated URL
   state.
6. Run route generation, typechecking, relevant tests, and the production build.
7. Check direct URL loads, browser history, loading/error/not-found boundaries,
   and any protected route behavior affected by the change.

## Recommended baseline

Prefer file-based routing with the Router bundler plugin. It provides the
strongest inference, automatic route generation, and automatic code splitting.

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params, abortController }) =>
    fetch(`/api/posts/${params.postId}`, {
      signal: abortController.signal,
    }).then((response) => response.json()),
  component: PostScreen,
})

function PostScreen() {
  const post = Route.useLoaderData()
  return <article>{post.title}</article>
}
```

The generator owns `routeTree.gen.ts` and the path literal passed to
`createFileRoute`. Never hand-edit either.

## Core rules

### Routes and types

- Prefer file routes for applications. Use code routes for dynamic or
  library-composed trees and virtual routes when filesystem layout cannot
  express the desired tree.
- Register the constructed router through declaration merging exactly once.
- Prefer route-owned APIs such as `Route.useParams()`, `Route.useSearch()`, and
  `Route.useLoaderData()`. Outside the route module, bind with
  `getRouteApi(routeId)` or pass a strict `from`.
- Use `strict: false` only in components deliberately shared across multiple
  routes; it returns less specific types.
- Keep inference-sensitive route properties in the order enforced by
  `@tanstack/router-plugin`.

### Navigation and URL state

- Use `<Link>` for user-initiated internal navigation and `useNavigate` for
  navigation caused by application logic.
- Put path params in `params`, query state in `search`, fragments in `hash`, and
  history data in `state`. Do not interpolate them into `to`.
- Validate search params at the route boundary. Put every validated search value
  that changes loader output into `loaderDeps`.
- Use `linkOptions(...)` for reusable inferred navigation options.
- Throw or return `redirect(...)` from `beforeLoad` and loaders. Use `href`, not
  `to`, for an external redirect.

### Data and rendering

- Load render-critical data in route loaders to avoid component waterfalls.
- Pass the loader abort signal to cancellable work and choose `staleTime`,
  `preloadStaleTime`, `gcTime`, and `shouldReload` deliberately.
- When Query owns server-state caching, loaders should warm the same
  `QueryClient` and use the same stable query options as components.
- Put pending, error, and not-found boundaries at the narrowest useful route.
- Keep loaders eager unless a measured bundle-size win justifies their extra
  request waterfall.
- Prefer reactive hooks in components. `router.state` is current but is not a
  reactive React subscription.

### Authentication and security

- Supply framework state such as auth and `QueryClient` through typed router
  context.
- Use `beforeLoad` on a layout route to gate its descendants and preserve the
  attempted `location.href` when redirecting to login.
- Invalidate the router after auth state changes so guards re-run.
- Treat route guards as UI boundaries only. Authenticate and authorize every
  private server operation independently.

### Generated code and deprecated APIs

- Do not edit `routeTree.gen.ts` or generated `createFileRoute` paths.
- Do not use deprecated constructor classes. Use `createRouter`, `createRoute`,
  `createFileRoute`, `createRootRoute`, and `getRouteApi`.
- Use `notFound` and `notFoundComponent`, not `NotFoundRoute`.
- Use `params.parse`/`params.stringify`, not `parseParams`/`stringifyParams`.
- Current Router versions handle returned promises; do not add manual `defer`
  solely from an older example.

## Task reference routing

### Setup and route design

- New project, Vite/plugin setup, router creation, provider, registration:
  [quick-start-and-router-creation.md](references/quick-start-and-router-creation.md)
- File conventions, layouts, groups, matching, generated trees:
  [route-trees-and-file-routing.md](references/route-trees-and-file-routing.md)
- Programmatic trees or virtual file configuration:
  [code-based-and-virtual-routing.md](references/code-based-and-virtual-routing.md)

### Navigation and URL state

- Links, active state, imperative navigation, redirects, custom links:
  [navigation-and-links.md](references/navigation-and-links.md)
- Path params, search validation, middleware, serialization:
  [path-and-search-params.md](references/path-and-search-params.md)
- History adapters, masks, rewrites, scroll restoration:
  [history-masking-rewrites-and-scroll.md](references/history-masking-rewrites-and-scroll.md)
- Unsaved changes, browser unload, native or animated transitions:
  [navigation-blocking-and-transitions.md](references/navigation-blocking-and-transitions.md)
- Locale-prefixed URLs and language switching:
  [internationalization.md](references/internationalization.md)

### Data, rendering, and application boundaries

- Loader lifecycle, dependencies, cache behavior, invalidation, mutations:
  [data-loading-caching-and-mutations.md](references/data-loading-caching-and-mutations.md)
- Query cache ownership, SSR, and shared query options:
  [tanstack-query-integration.md](references/tanstack-query-integration.md)
- Typed context, authentication, authorization boundaries:
  [router-context-auth-and-security.md](references/router-context-auth-and-security.md)
- Outlets, pending/error/catch/not-found behavior:
  [outlets-rendering-errors-and-not-found.md](references/outlets-rendering-errors-and-not-found.md)
- Lazy routes, automatic splitting, preload strategy, render subscriptions:
  [code-splitting-preloading-and-performance.md](references/code-splitting-preloading-and-performance.md)
- Custom Router SSR, promises, hydration, document head:
  [ssr-deferred-data-and-document-head.md](references/ssr-deferred-data-and-document-head.md)
- Router events, invalidation, state, and route metadata:
  [router-events-state-and-static-data.md](references/router-events-state-and-static-data.md)
- Type utilities, inference performance, and Router ESLint:
  [typescript-type-safety-and-eslint.md](references/typescript-type-safety-and-eslint.md)

### API lookup and examples

- Route constructors, route options, redirects, not-found and search middleware:
  [api-route-functions-and-options.md](references/api-route-functions-and-options.md)
- React Router components and hooks:
  [api-components-and-hooks.md](references/api-components-and-hooks.md)
- Router options, state, events, navigation and public types:
  [api-router-options-state-and-types.md](references/api-router-options-state-and-types.md)
- File-router generator configuration and deprecated replacements:
  [api-file-routing-config-and-deprecations.md](references/api-file-routing-config-and-deprecations.md)
- Focused official example recipes and monorepo organization:
  [example-recipes-and-monorepos.md](references/example-recipes-and-monorepos.md)

## Review checklist

- The router type is registered and there is one router owner.
- Generated route files were regenerated, not edited.
- Internal navigation uses typed `to`, `params`, and `search`.
- Search state is validated and data-affecting values appear in `loaderDeps`.
- Loaders cancel work and avoid duplicate caches or component waterfalls.
- Auth guards re-run after state changes; server authorization remains separate.
- Pending, error, and not-found behavior works on direct load and navigation.
- Lazy boundaries do not move critical loaders into avoidable request waterfalls.
- SSR creates one router and cache per request.
- No deprecated class, stale example pattern, or foreign router convention was
  introduced.

## Official documentation

- [Routing guides](https://tanstack.com/router/latest/docs/routing/routing-concepts)
- [Router API](https://tanstack.com/router/latest/docs/api/router)
- [React examples](https://tanstack.com/router/latest/docs/framework/react/examples/quickstart-file-based)
