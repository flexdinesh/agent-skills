# Architecture and API boundaries

Use this reference before changing cross-boundary code. Import ownership,
execution ownership, and file location are related but not identical.

## Capability map

| Capability | Owner | Notes |
| --- | --- | --- |
| Route tree, matching, params/search | Router | File routes and generated types |
| Navigation, links, redirects, not-found | Router | Used during SSR and in the browser |
| `beforeLoad`, loaders, route context/cache | Router | Universal lifecycle executed by Start during SSR |
| Root route `head`, `HeadContent`, `Scripts` | Router exports | Start turns them into a full SSR document |
| `createServerFn`, execution functions | Start | Compiler/runtime creates the server boundary |
| Request/server-function middleware | Start | Request lifecycle, context, headers, auth |
| Server routes and HTTP handlers | Start seam | Declared on a Router file route |
| SSR, streaming, hydration, entries | Start | Uses the Router match tree |
| SPA, prerendering, ISR policy | Start | Some policy is attached to routes |
| Query/auth/database/UI adapters | Vendor | Integrated through typed contexts and providers |

## Request lifecycle

```text
HTTP request
  -> Start request middleware and request context
  -> Router matches routes
  -> Router beforeLoad/loaders (Start executes them during SSR)
  -> Start renders/streams the full document
  -> browser hydrates
  -> Router owns later client navigation
  -> Start server functions/server routes handle later server work
```

Route loaders are not server handlers. A loader can run on the server for the
initial request and in the browser after hydration. Call a Start server function
from the loader when the work needs secrets, a database, filesystem, or trusted
credentials.

## Important seams

### Router factory

`createRouter` belongs to Router. Start requires a `getRouter()` export that
returns a new instance so request-specific context and caches cannot leak between
SSR requests.

### File route generation

File naming and `createFileRoute` belong to Router. Start's Vite/Rsbuild plugin
drives generation and code splitting as part of the full-stack build.

### Root document

`createRootRoute`, `Outlet`, `HeadContent`, and `Scripts` are Router APIs. In a
Start application the root component must render the full HTML document and
Start uses those components for SSR metadata and hydration scripts.

### Selective SSR

The `ssr` route option is expressed on a Router route, while Start interprets it
as rendering/execution policy. Use Start's selective SSR guide as the authority
for behavior.

### Server routes

`server.handlers` and route server middleware appear inside
`createFileRoute(...)`, but Start owns the HTTP server runtime. Router owns the
file path and matching syntax.

### Contexts

- Router context is typed dependency injection for `beforeLoad`, loaders, and
  components.
- Start request context is per incoming request and flows through request
  middleware, server functions, server routes, and SSR.
- React context is component-only; hooks cannot be called in loaders.

Do not collapse these into one global context object.

### Redirects and not-found

Use Router `redirect()` and `notFound()` for route control flow, including when
thrown from supported Start server functions. Use raw `Response` redirects when
the HTTP protocol itself is the concern, such as an external callback.

## Do

- Label examples by owner and import path.
- Create request-scoped routers, QueryClients, and request data.
- Keep Router lifecycle code universal.
- Shape explicit serializable DTOs at Start server boundaries.
- Let Start documentation arbitrate Start runtime behavior and Router
  documentation arbitrate Router behavior.

## Don't

- Import standard routing primitives from Start.
- Treat every option written inside `createFileRoute` as Router-owned.
- Teach manual `<RouterProvider>` or manual Router SSR in a normal Start app.
- Depend on a separate local Router skill; this Start skill is self-contained.
- Assume an official integration example defines a vendor's security policy.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/overview
- https://tanstack.com/start/latest/docs/framework/react/guide/routing
- https://tanstack.com/start/latest/docs/framework/react/guide/execution-model
- https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
- https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr

