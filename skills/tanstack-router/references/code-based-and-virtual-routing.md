# Code-Based and Virtual Routing

File-based routing is the recommended default. Reach for virtual file routes when the physical files cannot follow TanStack Router's naming convention. Use fully code-based routing only when route generation is genuinely unsuitable.

## Choose the smallest exception

| Need | Approach |
| --- | --- |
| Conventional application routes | File-based routing |
| Existing/custom file layout with generated typing and splitting | Virtual file routes |
| Mount a convention-based directory inside a custom tree | Virtual `physical()` route |
| Runtime-independent, explicitly assembled tree with no generator | Code-based routing |

Virtual routes are still generation-time configuration: they programmatically map a route tree to real source files. They do not create routes dynamically at runtime.

## Virtual file routes

Install/use `@tanstack/virtual-file-routes` and export a virtual root:

```ts
// routes.ts
import {
  index,
  layout,
  physical,
  rootRoute,
  route,
} from '@tanstack/virtual-file-routes'

export const routes = rootRoute('root.tsx', [
  index('home.tsx'),
  layout('authenticated.tsx', [
    route('/dashboard', 'features/dashboard/screen.tsx'),
    physical('/posts', 'features/posts/routes'),
  ]),
  route('/about', 'features/about/screen.tsx'),
])
```

Map it in the plugin:

```ts
// vite.config.ts
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      virtualRouteConfig: './routes.ts',
    }),
    react(),
  ],
})
```

The helpers have distinct roles:

- `rootRoute(file, children)` defines the root module.
- `route(path, file?, children?)` creates a URL-bearing node; omitting `file` creates a path prefix.
- `index(file)` creates an index child.
- `layout(file, children)` creates a pathless layout. An overload accepts an explicit unique ID.
- `physical(pathPrefix, directory)` mounts a directory that follows normal file-route conventions.

Because `route()` receives an explicit path, leading and trailing underscores are literal characters. Use `layout()` for pathless layouts instead of relying on filename syntax.

Virtual routes can also be supplied directly as `virtualRouteConfig`, or configured in `tsr.config.json` for the CLI:

```json
{
  "virtualRouteConfig": "./routes.ts"
}
```

Prefer the TypeScript config file over a large inline JSON tree: it keeps helper types, imports, and comments available.

## Code-based routing

Each non-root route declares its parent so TypeScript can infer its context and path types. The final tree must also explicitly add every child.

```tsx
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
  component: () => <Outlet />,
})

const postsIndexRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '/',
  component: () => <h1>Posts</h1>,
})

const postRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '$postId',
  loader: ({ params }) => getPost(params.postId),
  component: PostScreen,
})

const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postsIndexRoute, postRoute]),
])

export const router = createRouter({ routeTree })
```

Important code-based conventions:

- `path: '/'` is an index route.
- Normal `path` values are normalized without leading/trailing slashes.
- `path: '$postId'` creates a dynamic segment.
- `path: '$'` creates a splat whose value is `_splat`.
- `id` without `path` creates a pathless layout.
- Parent relationships and `.addChildren()` structure must agree.

For a typed root context:

```ts
type RouterContext = {
  auth: AuthState
}

const rootRoute = createRootRouteWithContext<RouterContext>()
```

If the code tree is split across modules, export route objects and assemble them in a dedicated `routeTree.ts`. Avoid cycles: `getParentRoute` needs the parent object, while the assembler needs all children.

## Preserving router typing

Regardless of how the tree is built, register the router:

```ts
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

This powers typed `<Link>`, `navigate`, route hooks, and route matching across the application.

## Migration guidance

When moving from code-based to file-based routing:

1. Preserve route IDs, URL paths, and parent/child boundaries.
2. Create `__root.tsx`, layout routes, and leaves.
3. Move loaders, `beforeLoad`, validation, and error components route by route.
4. Let the generator create the tree.
5. Replace imports of code route objects with route-local APIs or `getRouteApi`.
6. Typecheck every navigation target before removing the old tree.

When adopting virtual routes, change only the mapping layer first. Keep route module behavior unchanged so URL and data behavior can be verified independently.

## Do

- Use virtual routes to adapt a legacy or feature-oriented file layout while retaining generation.
- Use `physical()` when only part of the tree needs custom mapping.
- Keep one obvious assembly point for a code-based tree.
- Give pathless code routes stable, unique `id` values.
- Register the final router type for application-wide inference.
- Test deep links, layouts, index matches, and dynamic paths after changing the tree.

## Don't

- Don't choose code-based routing simply to avoid learning filename conventions; it requires more manual type plumbing.
- Don't treat virtual routes as runtime route injection.
- Don't express a virtual pathless layout with `_` filename semantics; use `layout()`.
- Don't define a code route without both `getParentRoute` and either `path` or pathless `id`.
- Don't forget to add a declared child through its parent's `.addChildren()`.
- Don't mix independently generated and manually assembled trees without one authoritative final tree.

## Official sources

- [Virtual File Routes](https://tanstack.com/router/latest/docs/routing/virtual-file-routes)
- [Code-Based Routing](https://tanstack.com/router/latest/docs/routing/code-based-routing)
- [Route Trees](https://tanstack.com/router/latest/docs/routing/route-trees)
- [Creating a Router](https://tanstack.com/router/latest/docs/guide/creating-a-router)
