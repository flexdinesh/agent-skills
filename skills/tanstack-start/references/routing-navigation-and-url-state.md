# Routing, navigation, and URL state

These are Router responsibilities inside a Start application. Start supplies the
SSR/full-stack runtime; use `@tanstack/react-router` for the APIs below.

## File route

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  filter: z.string().catch(''),
})

export const Route = createFileRoute('/posts')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter,
  }),
  loader: ({ deps }) => loadPosts(deps),
  component: Posts,
})
```

Validate search at the route boundary. Every search value that changes loader
output must appear in `loaderDeps`; those dependencies participate in loader
identity and reload behavior.

## Typed navigation

```tsx
import { Link, useNavigate } from '@tanstack/react-router'

<Link
  to="/posts/$postId"
  params={{ postId: post.id }}
  search={{ preview: true }}
>
  {post.title}
</Link>
```

Use separate `to`, `params`, `search`, and `hash` fields. Do not interpolate
typed values into a string path. Use `<Link>` for user navigation and
`useNavigate` for application-driven navigation.

## Route-owned hooks

Inside the route module, prefer:

- `Route.useParams()`
- `Route.useSearch()`
- `Route.useLoaderData()`
- `Route.useRouteContext()`

Outside it, use `getRouteApi(routeId)` when importing `Route` would create a
circular dependency. Use strict `from`/`to` narrowing rather than weakening
types globally.

## Layouts and guards

Pathless layouts can apply UI, `beforeLoad`, context, pending, and error policy
to descendants without adding a URL segment.

```tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

Use the provided `location.href` as the return URL. A route guard prevents
unusable screens and work, but every private server function/route must still
authorize the request.

## Redirect and not-found

- Throw Router `redirect(...)` from `beforeLoad` or loaders for route control.
- Throw `notFound()` when a resource-backed route cannot resolve.
- Use route `notFoundComponent` and `errorComponent` at the narrowest useful
  ownership boundary.
- Use a hard browser or raw HTTP redirect only when protocol/external navigation
  requires it.

## Preloading and scroll

Configure intentional preloading in the Router and links. Avoid preloading a
route that performs a side effect. Use `scrollRestoration` rather than ad hoc
window scrolling when Router should own navigation scroll state.

## Do

- Keep URL state serializable and validated.
- Put auth gates on the closest common layout.
- Use typed Router navigation rather than string assembly.
- Preserve route-local pending/error/not-found behavior on direct SSR and
  client navigation.
- Use `getRouteApi` to avoid circular imports.

## Don't

- Put secrets in params/search or loader code.
- Call React hooks from `beforeLoad` or loaders; inject values through context.
- Use a side-effect route as a preloadable mutation endpoint.
- Read non-reactive `router.state` in a component when a Router hook exists.
- Use deprecated `NotFoundRoute`.

## Router cross-checks

- https://tanstack.com/router/latest/docs/routing/routing-concepts
- https://tanstack.com/router/latest/docs/routing/file-based-routing
- https://tanstack.com/router/latest/docs/framework/react/guide/navigation
- https://tanstack.com/router/latest/docs/framework/react/guide/path-params
- https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes
- https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors

