# Router Context, Authentication, and Security

Router context is typed dependency injection for route configuration. Use it for services and request-varying state that `beforeLoad` and loaders need; use React context for component-only concerns.

## Type the root contract

Only properties passed directly to `createRouter` or `RouterProvider` belong in the root context type. Values returned from `beforeLoad` are inferred and merged for descendants.

```tsx
// routes/__root.tsx
import { createRootRouteWithContext } from '@tanstack/react-router'

export interface RouterContext {
  auth: AuthState
  api: ApiClient
}

export const Route = createRootRouteWithContext<RouterContext>()({})
```

```tsx
const router = createRouter({
  routeTree,
  context: {
    auth: initialAuth,
    api,
  },
})
```

Use context for injected clients/functions instead of constructing them inside loaders. A route can enrich context for all descendants:

```tsx
export const Route = createFileRoute('/_workspace')({
  beforeLoad: async ({ context }) => {
    const workspace = await context.api.currentWorkspace()
    return { workspace }
  },
})
```

Parent `beforeLoad` functions execute before children. Throwing there stops child `beforeLoad` functions and loaders.

## Bridge React hooks correctly

Hooks cannot run in route options. Call the hook in a component above `RouterProvider` and pass its result as provider context:

```tsx
function AppRouter() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth, api }} />
}
```

The router may be created with a temporary asserted value when React supplies the live value, but keep that assertion localized:

```tsx
const router = createRouter({
  routeTree,
  context: { auth: undefined!, api },
})
```

When live context changes in a way that affects guards or loaders, call `router.invalidate()` so active matches recompute. Avoid invalidating on every render; update on meaningful identity/session changes.

## Guard a pathless layout

Put a guard on a pathless layout to protect an entire subtree:

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        replace: true,
        search: { redirect: location.href },
      })
    }

    return { user: context.auth.user }
  },
})
```

Use the `location` passed to `beforeLoad`, not `router.state.resolvedLocation`, which can lag the navigation being guarded. A login route can restore a validated internal destination with `router.history.push(redirectTarget)` when replacing the complete URL is required.

If an authentication check can fail, preserve intentional redirects:

```tsx
try {
  const user = await verifySession()
  if (!user) throw redirect({ to: '/login' })
  return { user }
} catch (error) {
  if (isRedirect(error)) throw error
  throw redirect({ to: '/login' })
}
```

Choose the failure policy explicitly. Network failure might warrant an error boundary or offline screen rather than pretending credentials are invalid.

## Security boundaries

A route guard controls client rendering and navigation; it is **not** authorization. Every API route, server function, and data service must authenticate the request and authorize access to the specific resource.

- Treat URL params, search params, cookies, local storage, and client context as untrusted input.
- Do not put tokens or secrets in search params, loader return values, dehydrated router state, static data, or logs.
- Validate post-login redirect targets as same-origin internal paths before pushing them. Reject protocol-relative and absolute external URLs unless an allowlist explicitly permits them.
- Re-check authorization on mutations, not only reads.
- Return the minimum user/session shape the route needs.
- Use server-derived roles/permissions; hiding a link is presentation, not enforcement.

## Context versus alternatives

| Need | Use |
| --- | --- |
| API client, QueryClient, auth snapshot | Root router context |
| Workspace/user resolved for descendants | `beforeLoad` return context |
| Compile-time route label or layout flag | `staticData` |
| Component-local theme or form state | React context/state |
| URL-varying input | Validated params/search, then `loaderDeps` |

## Do

- Type context with `createRootRouteWithContext`.
- Keep request-varying instances request-scoped during SSR.
- Guard the highest common layout for a protected subtree.
- Throw `redirect()` from `beforeLoad`.
- Preserve redirects when catching auth-check errors.
- Invalidate after session changes that affect active routes.

## Don't

- Don't call React hooks in `beforeLoad`, `loader`, or route option callbacks.
- Don't import mutable auth singletons into routes when context can make dependencies explicit.
- Don't read `router.state.resolvedLocation` to build the guard's return URL.
- Don't trust a `redirect` search value without checking it is an allowed internal destination.
- Don't treat client guards, hidden outlets, or static role metadata as authorization.
- Don't serialize credentials into router-visible state.

## Sources

- [Router Context](https://tanstack.com/router/latest/docs/guide/router-context)
- [Authenticated Routes](https://tanstack.com/router/latest/docs/guide/authenticated-routes)
- [Authenticated Routes example](https://tanstack.com/router/latest/docs/framework/react/examples/authenticated-routes)
- [Router `invalidate` API](https://tanstack.com/router/latest/docs/api/router/RouterType)
