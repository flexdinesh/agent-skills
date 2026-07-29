# Route Trees and File-Based Routing

Use file-based routing for new React applications unless an existing filesystem convention makes it impractical. TanStack Router treats the route tree as both the URL matcher and the component/layout hierarchy, and its generator turns route files into a fully typed `routeTree`.

## Model the route tree first

A URL such as `/posts/42/edit` matches a branch of the route tree. Every matched route can contribute a component, loader, search validation, context, pending UI, and error boundary. Parent components render their matched child with `<Outlet />`.

```tsx
// src/routes/posts/route.tsx
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  component: PostsLayout,
})

function PostsLayout() {
  return (
    <main>
      <h1>Posts</h1>
      <Outlet />
    </main>
  )
}
```

Think in two parallel trees:

- The URL tree determines which routes match.
- The component tree is composed from the matched routes.

An index route renders only when its parent is the leaf match. For example, `posts/index.tsx` matches `/posts` exactly, while `posts/$postId.tsx` matches `/posts/:postId`.

## Recommended file structure

Directory, flat, and mixed styles are equivalent. Prefer the style that keeps related code understandable; mixed routing is usually the most practical.

```text
src/routes/
├── __root.tsx
├── index.tsx
├── about.tsx
├── posts/
│   ├── route.tsx
│   ├── index.tsx
│   ├── $postId.tsx
│   └── $postId.edit.tsx
├── _authenticated/
│   ├── route.tsx
│   └── dashboard.tsx
└── -components/
    └── post-card.tsx
```

This produces:

- `__root.tsx`: always-matched root route.
- `index.tsx`: `/`.
- `about.tsx`: `/about`.
- `posts/route.tsx`: `/posts` layout.
- `posts/index.tsx`: `/posts` index.
- `posts/$postId.tsx`: `/posts/$postId`.
- `posts/$postId.edit.tsx`: nested `/posts/$postId/edit`.
- `_authenticated/route.tsx`: pathless layout; its children do not gain a URL segment.
- `-components/`: ignored by route generation and safe for colocated helpers.

## File naming conventions

| Convention | Meaning |
| --- | --- |
| `__root.tsx` | Required root file at the top of `routesDirectory` |
| `.` or a directory | Nest a route under its parent |
| `$name` | Required dynamic segment, available as `params.name` |
| `$` | Splat/catch-all; remaining path is `params._splat` |
| `{-$name}` | Optional path parameter |
| `_name` | Pathless layout with a unique route ID |
| `name_` | Break nesting under the otherwise matching parent |
| `-name` | Exclude a file or directory from generated routes |
| `(group)` | Group files without adding a URL segment |
| `[x]` | Escape a character with routing meaning in a filename |
| `index` | Match the parent URL exactly |
| `route.tsx` | Define the route at the containing directory's path |

Examples of escaping include `script[.]js.tsx` for `/script.js`. Router configuration can change the `index` and `route` tokens, so inspect project configuration before assuming defaults.

## Root and file routes

```tsx
// src/routes/__root.tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => <Outlet />,
})
```

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => getPost(params.postId),
  component: PostScreen,
})

function PostScreen() {
  const post = Route.useLoaderData()
  return <article>{post.title}</article>
}
```

The bundler plugin or CLI owns the string passed to `createFileRoute`. It updates that route ID when the file is created, renamed, or moved. The generated route tree normally lives at `src/routeTree.gen.ts`.

## Layout choices

Use a normal layout when its URL segment is meaningful:

```text
routes/
└── settings/
    ├── route.tsx
    ├── profile.tsx
    └── billing.tsx
```

Use a pathless layout for cross-cutting behavior without a URL segment, such as authentication or shared chrome:

```text
routes/
└── _authenticated/
    ├── route.tsx
    ├── dashboard.tsx
    └── account.tsx
```

Use a non-nested route when the URL should retain a prefix but the component should not render inside the prefix route's layout. A trailing underscore breaks nesting:

```text
posts.tsx
posts.$postId.tsx
posts_.$postId.edit.tsx
```

Here `/posts/42` renders inside `posts.tsx`, while `/posts/42/edit` renders outside it.

## Generator configuration

For Vite, keep the Router plugin before the React plugin so route generation and automatic code splitting can transform route modules correctly.

```ts
// vite.config.ts
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
})
```

Commit the generated tree if that is the repository's established policy. Whether committed or ignored, it remains generated output rather than an editing surface.

## Do

- Prefer file-based routing for less boilerplate, generated type links, and automatic splitting.
- Use `<Outlet />` anywhere a route is intended to render child routes.
- Use `-`-prefixed files and folders to colocate route-only helpers safely.
- Keep layout boundaries aligned with shared data, context, errors, and UI—not only visual folders.
- Let the plugin or CLI update `createFileRoute` IDs and regenerate `routeTree.gen.ts`.
- Inspect the generated route tree or devtools when nesting behaves unexpectedly.

## Don't

- Don't manually edit `routeTree.gen.ts` or the generated `createFileRoute` path literal.
- Don't assume filesystem directories always create URL segments; pathless layouts, groups, and excluded folders do not.
- Don't use a pathless layout with a dynamic segment in its path; put the dynamic route above it.
- Don't add a parent route component without `<Outlet />` if children must render.
- Don't use a trailing `_` merely for organization; it changes component nesting.
- Don't create both flat and directory routes that resolve to ambiguous duplicate route IDs.

## Official sources

- [Route Trees](https://tanstack.com/router/latest/docs/routing/route-trees)
- [Routing Concepts](https://tanstack.com/router/latest/docs/routing/routing-concepts)
- [File-Based Routing](https://tanstack.com/router/latest/docs/routing/file-based-routing)
- [File Naming Conventions](https://tanstack.com/router/latest/docs/routing/file-naming-conventions)

