# SSR, Deferred Data, and Document Head

For Router-only React applications, create an isomorphic router factory, load a fresh instance per server request, render with the Router SSR APIs, and hydrate the same route tree on the client. The official documentation recommends TanStack Start for a new zero-configuration full-stack SSR application; use manual Router SSR when integrating an existing server or when Start is intentionally out of scope.

## Build a request-safe router factory

Never share a server router, QueryClient, authenticated context, or loader cache across requests.

```tsx
// router.tsx
export function createAppRouter(context: RouterContext) {
  return createRouter({
    routeTree,
    context,
    defaultPreload: 'intent',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
```

The client normally uses browser history. `RouterServer` supplies suitable server memory history. Keep route creation and configuration consistent on both sides so matches and generated markup agree.

## Use the supported server/client pair

On the server, `createRequestHandler` coordinates routing and response headers; render with `renderRouterToString` or `renderRouterToStream` and `<RouterServer />` from `@tanstack/react-router/ssr/server`.

On the client, hydrate with `<RouterClient />` from `@tanstack/react-router/ssr/client`:

```tsx
import { hydrateRoot } from 'react-dom/client'
import { RouterClient } from '@tanstack/react-router/ssr/client'

const router = createAppRouter(clientContext)
hydrateRoot(document, <RouterClient router={router} />)
```

Resolved critical loader data is dehydrated and hydrated automatically when the standard SSR flow is complete. If integrating an external data cache, add its supported dehydration integration rather than serializing the cache ad hoc.

Use string rendering for a simpler all-at-once response. Use streaming when the server/runtime/proxy supports incremental responses and the page has meaningful Suspense/deferred boundaries. Verify status, headers, abort behavior, and error handling in the deployed runtime, not just a local Node server.

## Defer only non-critical data

Router loaders ordinarily run in parallel and the next route waits for them. Return an unresolved promise within loader data to render critical content first:

```tsx
import { Await, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await getPost(params.postId)
    return {
      post,
      comments: getComments(params.postId),
    }
  },
  component: PostPage,
})

function PostPage() {
  const { post, comments } = Route.useLoaderData()

  return (
    <>
      <article>{post.title}</article>
      <Suspense fallback={<CommentsSkeleton />}>
        <Await promise={comments}>
          {(items) => <Comments items={items} />}
        </Await>
      </Suspense>
    </>
  )
}
```

Deferred promises share the loader result's cache and invalidation lifecycle. Add a local error boundary when deferred failure should not replace the whole route.

With TanStack Query, use its Router SSR integration: await/return required queries; start non-critical queries without awaiting and consume them through `useSuspenseQuery`. Plain `useQuery` does not execute on the server in that integration.

## Keep serialized data safe and portable

Router's SSR serializer supports `undefined`, `Date`, `Error`, and `FormData` in addition to ordinary JSON-like values. Do not assume arbitrary `Map`, `Set`, `BigInt`, class instances, open handles, or functions will cross the boundary correctly.

Everything dehydrated to the browser is visible to the user:

- Never return secrets, bearer tokens, private server configuration, or unrestricted database objects.
- Shape loader results to the minimum client-visible fields.
- Enforce authorization on the server before loading or streaming private data.
- Avoid request-global caches unless their keys and tenant boundaries are rigorously isolated.

## Manage head and body assets through routes

Render both `<HeadContent />` and `<Scripts />`; route `head`/`scripts` declarations have no output without them.

```tsx
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
})
```

Declare head data on the owning route:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => getPost(params.postId),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData.title },
      { name: 'description', content: loaderData.summary },
      { property: 'og:title', content: loaderData.title },
    ],
  }),
})
```

Nested routes win during automatic title/meta deduplication: the last title and last meta with the same `name` or `property` override ancestors. Use `head` for head scripts/styles/links and route `scripts` plus `<Scripts />` for body scripts.

For a pre-hydration theme or feature-detection script, use `ScriptOnce`. It renders during SSR, runs before hydration, removes itself, and does not rerun on client navigation. If it changes the server-rendered DOM (for example the `<html>` class), add `suppressHydrationWarning` only at the intentional mismatch.

## Avoid hydration mismatches

- Produce deterministic initial markup from the same URL, locale, auth snapshot, and serialized data.
- Move browser-only reads (`window`, storage, media queries) into effects or an intentional pre-hydration script.
- Do not render `Date.now()`, random IDs, or locale-sensitive output differently on each side.
- Ensure streaming transforms and compression do not buffer the entire response.
- Test direct URL entry, redirects, not-found/error status, deferred rejection, and slow-client hydration.

## Do

- Instantiate request-scoped router/context/cache objects.
- Await critical data and defer only content with a useful independent fallback.
- Render `HeadContent` and `Scripts` once in the root document.
- Keep head metadata route-owned and loader-derived where appropriate.
- Audit every dehydrated value as public browser data.
- Use the official Query integration for Query SSR/streaming.

## Don't

- Don't reuse a singleton router or QueryClient on the server.
- Don't access browser globals during server rendering.
- Don't defer data needed for redirects, authorization, status codes, or the primary page identity.
- Don't stream without end-to-end runtime support and tests.
- Don't manually inject duplicate title/meta tags alongside `HeadContent`.
- Don't serialize secrets or unsupported rich objects.
- Don't suppress hydration warnings broadly to hide nondeterministic rendering.

## Sources

- [SSR](https://tanstack.com/router/latest/docs/guide/ssr)
- [Manual SSR setup](https://tanstack.com/router/latest/docs/how-to/setup-ssr)
- [Deferred Data Loading](https://tanstack.com/router/latest/docs/guide/deferred-data-loading)
- [Document Head Management](https://tanstack.com/router/latest/docs/guide/document-head-management)
- [TanStack Query Integration](https://tanstack.com/router/latest/docs/integrations/query)
- [SSR streaming example](https://tanstack.com/router/latest/docs/framework/react/examples/basic-ssr-streaming-file-based)

