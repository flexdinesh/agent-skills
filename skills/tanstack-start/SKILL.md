---
name: tanstack-start
description: "Build production-ready full-stack React applications with TanStack Start and its TanStack Router integration. Use only when the user explicitly invokes `tanstack-start` or `$tanstack-start`; do not auto-invoke from context."
---

# TanStack Start

Manual invocation only: use this skill only when the user explicitly invokes
`tanstack-start` or `$tanstack-start`; do not auto-invoke from task context.

Build React applications with TanStack Start's server runtime and TanStack
Router's routing substrate. This skill is self-contained for Start work. It
covers Router where Start uses it, but not standalone Router installation,
code-based routing, or manual Router SSR.

## Ownership first

| Concern | Owner | Typical import/config |
| --- | --- | --- |
| Routes, matching, loaders, navigation, params/search, route context/cache, redirects, not-found, head definitions | TanStack Router | `@tanstack/react-router` |
| Server functions, execution boundaries, request middleware, server routes, sessions, SSR/streaming, prerendering, builds, deployment | TanStack Start | `@tanstack/react-start` and documented subpaths |
| File-route generation and root document | Integration seam | Router APIs driven and rendered by Start's build/runtime |
| Query caching, auth providers, databases, UI libraries, hosting adapters | Integration/vendor | Their own packages, connected through Start and Router |

Do not infer ownership from the file containing an API. `server.handlers` is
declared on a Router file route but is a Start server-route capability.
`HeadContent` and `Scripts` are Router exports but Start relies on them for its
full-document SSR and hydration.

## Working method

1. Inspect installed Start, Router, React, bundler, runtime, and adapter versions.
2. Classify each concern as Router, Start, an integration seam, or vendor-owned.
3. Read only the references needed for the task.
4. Choose the data boundary and cache owner before writing code.
5. Keep secrets and privileged work behind a Start server boundary.
6. Implement typed routes, validated URL/input state, and scoped failures.
7. Verify direct SSR, hydration, client navigation, mutations, production build,
   and the target deployment runtime.

## Recommended baseline

Start applications use Router file routes and a fresh router per request:

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
  })
}
```

Put privileged work in a server function, then call it from a Router loader:

```tsx
// src/posts.functions.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from './db.server'

export const getPost = createServerFn({ method: 'GET' })
  .validator(z.string().min(1))
  .handler(async ({ data: postId }) => {
    return db.post.findUniqueOrThrow({ where: { id: postId } })
  })
```

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { getPost } from '../../posts.functions'

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => getPost({ data: params.postId }),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  return <article>{post.title}</article>
}
```

The loader is a Router API and is isomorphic: Start runs it during initial SSR,
and Router may run it in the browser during navigation. The server-function
handler is the server-only boundary.

## Core rules

### Routing and document

- Return a new router from `getRouter()`; never share an SSR router singleton.
- Use file-based routes under `src/routes`; Start does not support a normal
  code-based route tree as a drop-in alternative.
- Never edit `routeTree.gen.ts` or generator-managed `createFileRoute` paths.
- Let generated code perform Start's registration. Add a Router `Register`
  augmentation only when current integration/project types require it (for
  example the official Query integration does), using
  `ReturnType<typeof getRouter>`. Never paste standalone Router's singleton or
  `RouterProvider` bootstrap into Start.
- Keep `<HeadContent />` in `<head>`, `<Outlet />` at the child boundary, and
  `<Scripts />` near the end of `<body>`.
- Validate search params and include every loader-relevant value in
  `loaderDeps`.

### Execution and security

- Treat application code and route loaders as isomorphic unless explicitly
  constrained.
- Put secrets, database clients, filesystem access, and private upstream tokens
  in `.server.*`, `createServerOnlyFn`, server-function handlers, middleware, or
  server-route handlers.
- Validate every network-crossing input and authorize every private server
  operation. `beforeLoad` improves route UX; it is not a data security boundary.
- Read server secrets per request inside a server boundary. Do not read
  `process.env` at module scope or expose secrets through public env prefixes.
- Keep strict server-function serialization checks enabled and return deliberate
  client-safe DTOs.

### Data and cache ownership

- Use Router loaders for route-critical orchestration and to avoid component
  waterfalls.
- Use Start server functions for same-origin typed application RPC; use server
  routes for public HTTP APIs, webhooks, downloads, and protocol-shaped work.
- Use Router cache for route-scoped loader data or TanStack Query for shared,
  long-lived server state. Do not create two accidental caches for one resource.
- After mutation, invalidate the actual owner: Router loader cache, Query cache,
  or both only when both intentionally participate.

### SSR and deployment

- Make server render and first client render deterministic. Gate browser-only or
  locale/time-dependent UI with `ClientOnly`, `useHydrated`, or a stable effect.
- Choose full SSR, data-only SSR, no SSR, SPA, prerendering, or ISR deliberately;
  do not copy a mode from an unrelated example.
- Verify cache headers, early hints, asset rewriting, filesystem behavior, and
  runtime bindings on the real deployment target.
- Treat Server Components and static server functions as experimental until the
  current docs state otherwise. Import protection, deferred hydration, early
  hints, and other features listed in the experimental reference also require
  release-specific verification.

## Do not copy demo artifacts

Official tutorials and examples are learning material, not a production policy.
Do not copy hardcoded secrets, fixed password salts, identity validators,
in-memory/file persistence, GET mutations, localhost URLs, broad invalidation,
raw session/token serialization, debug stack output, or generated artifacts.

## Task reference routing

### Architecture and setup

- Ownership and request/build/runtime seams:
  [architecture-and-api-boundaries.md](references/architecture-and-api-boundaries.md)
- Scaffold, plugins, router/root setup, paths, generated files:
  [project-setup-and-file-conventions.md](references/project-setup-and-file-conventions.md)
- Environment selection, import protection, secrets:
  [execution-model-import-protection-and-environment.md](references/execution-model-import-protection-and-environment.md)

### Routing and data

- File routes, navigation, params/search, redirects:
  [routing-navigation-and-url-state.md](references/routing-navigation-and-url-state.md)
- Context, loaders, dependencies, Router cache:
  [route-context-data-loading-and-caching.md](references/route-context-data-loading-and-caching.md)
- Mutations, forms, Router invalidation, TanStack Query:
  [data-mutations-forms-and-query.md](references/data-mutations-forms-and-query.md)
- Error, redirect, not-found, and status behavior:
  [errors-redirects-not-found-and-status.md](references/errors-redirects-not-found-and-status.md)

### Server and rendering

- Server functions, validation, serialization, streaming:
  [server-functions-rpc-and-streaming.md](references/server-functions-rpc-and-streaming.md)
- Middleware, request context, server routes, HTTP:
  [middleware-server-routes-and-request-context.md](references/middleware-server-routes-and-request-context.md)
- SSR, hydration, document, server/client entries:
  [rendering-ssr-hydration-and-entry-points.md](references/rendering-ssr-hydration-and-entry-points.md)
- SPA, prerendering, ISR, early hints, CDN assets:
  [prerendering-spa-isr-and-cdn.md](references/prerendering-spa-isr-and-cdn.md)
- Experimental and release-sensitive features:
  [experimental-and-versioned-features.md](references/experimental-and-versioned-features.md)

### Production concerns

- Authentication, sessions, authorization, CSRF:
  [authentication-sessions-and-security.md](references/authentication-sessions-and-security.md)
- Hosting, adapters, runtime behavior, observability:
  [hosting-observability-and-deployment.md](references/hosting-observability-and-deployment.md)
- CSS, Tailwind, Markdown, metadata, SEO/GEO:
  [styling-assets-seo-and-content.md](references/styling-assets-seo-and-content.md)
- Tutorial lessons and corrections:
  [tutorial-patterns-and-production-caveats.md](references/tutorial-patterns-and-production-caveats.md)
- What each curated official example demonstrates:
  [example-pattern-catalog.md](references/example-pattern-catalog.md)

## Review checklist

- Every API is assigned to Start, Router, an integration seam, or a vendor.
- Router and per-request dependencies are not shared across SSR requests.
- Generated routes are untouched; search and server inputs are validated.
- Loaders contain no secrets or server-only imports.
- Private data is authorized at its server boundary.
- Cache ownership and post-mutation invalidation are explicit.
- Root document, direct loads, hydration, and client navigation work.
- Pending, error, redirect, not-found, and HTTP status behavior is deliberate.
- Experimental and provider-specific patterns are labelled.
- Production build and target-runtime behavior are verified.

## Official documentation

- [TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Start guides](https://tanstack.com/start/latest/docs/framework/react/guide/routing)
- [TanStack Start tutorials](https://tanstack.com/start/latest/docs/framework/react/tutorial/reading-writing-file)
- [TanStack Start examples](https://tanstack.com/start/latest/docs/framework/react/examples/start-basic)
