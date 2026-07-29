# Quick start and router creation

Use this reference when adding TanStack Router to a React + TypeScript application or deciding between file-based and code-based routes.

## Recommended baseline

- React and React DOM 18 or later.
- TypeScript 5.3 or later.
- `@tanstack/react-router` at runtime.
- `@tanstack/router-plugin` as a development dependency when using a supported bundler.
- File-based routing for most applications. It gives the route generator enough information to produce the strongest types and supports automatic code splitting.
- `@tanstack/react-router-devtools` is useful in development but optional.

For an existing Vite app:

```sh
npm install @tanstack/react-router
npm install --save-dev @tanstack/router-plugin
```

Add the devtools package only when it will be rendered:

```sh
npm install @tanstack/react-router-devtools
```

## Configure Vite

The Router plugin must run before the React plugin.

```ts
// vite.config.ts
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
})
```

`autoCodeSplitting` defaults to `false` in Router v1, although the current docs say it is intended to become `true` in v2. Set it explicitly so upgrades do not silently change intent.

The other useful Vite defaults are:

| Option | v1 default |
| --- | --- |
| `routesDirectory` | `./src/routes` |
| `generatedRouteTree` | `./src/routeTree.gen.ts` |
| `routeFileIgnorePrefix` | `-` |
| `quoteStyle` | `single` |
| `semicolons` | `false` |

Ignore `routeTree.gen.ts` in formatters and linters. It is generated source and must not be edited.

## Minimal file-based application

Create this shape:

```text
src/
├── main.tsx
├── routeTree.gen.ts       # generated
└── routes/
    ├── __root.tsx
    ├── index.tsx
    └── about.tsx
```

The root route owns the application shell and renders child matches through `<Outlet />`:

```tsx
// src/routes/__root.tsx
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <main>Page not found</main>,
})

function RootLayout() {
  return (
    <>
      <nav>
        <Link to="/" activeOptions={{ exact: true }}>
          Home
        </Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </>
  )
}
```

Every file route must export its generated route declaration as `Route`. The route path literal is maintained by the generator:

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <main>Home</main>
}
```

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <main>About</main>
}
```

Create exactly one router instance, register its inferred type, then render `RouterProvider`:

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

Registration is not boilerplate to omit: it supplies the generated route tree to top-level exports such as `Link`, `useNavigate`, and `useParams`.

## Typed router context

Use router context for application dependencies needed during route matching and loading. Declare the contract on the root and fulfill it when creating the router:

```tsx
// src/routes/__root.tsx
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

export interface RouterContext {
  api: {
    getPost: (id: string, signal: AbortSignal) => Promise<Post>
  }
  user: User | null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
})
```

```ts
const router = createRouter({
  routeTree,
  context: { api, user: null },
})
```

For values sourced from React state, pass the current context to `RouterProvider` rather than reconstructing the router:

```tsx
function AppRouter() {
  const user = useCurrentUser()
  return <RouterProvider router={router} context={{ api, user }} />
}
```

Keep provider-only React contexts in `Wrap` or around `RouterProvider`; use router context for dependencies that loaders and `beforeLoad` need.

## Code-based alternative

Use code-based routing when explicit runtime composition is more important than filesystem conventions. Every non-root route must return its parent from `getParentRoute`; this is what carries parent params, search, and context into the child type.

```tsx
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

const rootRoute = createRootRoute({ component: Outlet })

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
  component: () => <Outlet />,
})

const postRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '$postId',
  component: PostPage,
})

const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postRoute]),
])

export const router = createRouter({ routeTree })
```

For large code-based trees, the object form of `addChildren` can reduce TypeScript work:

```ts
const routeTree = rootRoute.addChildren({
  postsRoute: postsRoute.addChildren({ postRoute }),
})
```

## Do

- Prefer file-based routing with the supported bundler plugin.
- Put `tanstackRouter()` before `react()` in Vite.
- Export `Route` from every generated file route and let the generator manage its path literal.
- Register `typeof router` with `@tanstack/react-router`.
- Put a root `notFoundComponent` and an `<Outlet />` in layouts that render children.
- Create the router once; update provider context instead of rebuilding the router on every render.
- Set behavior-changing options such as `autoCodeSplitting` and `defaultPreload` explicitly.

## Don't

- Do not edit, format, lint, or hand-maintain `routeTree.gen.ts`.
- Do not place the React plugin before the Router plugin.
- Do not use the Router CLI with Vite just to generate routes; the bundler plugin also provides transformations such as automatic code splitting.
- Do not forget `getParentRoute` in code-based children.
- Do not use legacy constructors such as `new Router`, `new Route`, or `new RootRoute`; use their `create*` factories.
- Do not mount DOM elements in the router `Wrap` or `InnerWrap` options during SSR; wrappers should be provider-only to avoid hydration mismatches.

## Official sources

- <https://tanstack.com/router/latest/docs/quick-start>
- <https://tanstack.com/router/latest/docs/installation/manual>
- <https://tanstack.com/router/latest/docs/installation/with-vite>
- <https://tanstack.com/router/latest/docs/guide/creating-a-router>
- <https://tanstack.com/router/latest/docs/api/router/createRouterFunction>

