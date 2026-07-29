# Project setup and file conventions

Use the official TanStack CLI or the current build-from-scratch guide. Inspect
the generated project before applying snippets because Start's package exports,
plugin options, and runtime adapters evolve.

## Recommended shape

```text
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   └── posts/
│       └── $postId.tsx
├── router.tsx
├── routeTree.gen.ts
├── start.ts                 # optional request middleware setup
├── client.tsx               # optional client-entry override
├── server.ts                # optional server-entry override
├── posts.functions.ts       # client-safe server-function proxies
└── posts.server.ts          # server-only implementation
vite.config.ts
```

Keep the default entry points unless a requirement needs an override. Defaults
receive fixes and new runtime behavior automatically.

## Build plugin

For Vite, use the current `tanstackStart` plugin from
`@tanstack/react-start/plugin/vite`. Preserve the documented plugin order,
especially when a deployment plugin such as Cloudflare participates. Rsbuild
uses its documented Start plugin instead of the Vite package.

Do not combine the standalone Router bundler plugin with Start configuration
unless current Start docs explicitly require it. Start already integrates route
generation.

## Router factory

```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })
}
```

Create request-scoped dependencies such as a QueryClient inside or alongside
`getRouter()` and expose them through typed Router context. Generated Start code
registers `ReturnType<typeof getRouter>` with Start. Some integrations also
require explicit Router registration; the current Query example uses:

```ts
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

Add that augmentation when installed types/current integration guidance require
it. Do not copy a standalone Router singleton or `RouterProvider` bootstrap into
Start, and never edit generated registration.

## Root document

```tsx
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Application' },
    ],
  }),
  component: Root,
})

function Root() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

Omitting `Scripts` breaks client functionality. Do not place route metadata
outside `HeadContent` without understanding ordering and deduplication.

## File routing rules

- `__root.tsx` is the always-matched root.
- `index.tsx` is an index route.
- `$postId.tsx` captures a path parameter.
- `$.tsx` is a splat route.
- `_layout` is a pathless layout prefix.
- Route groups organize files without changing the URL.
- Non-nested route conventions can escape a parent layout; use them sparingly.

Follow the current Router file-naming guide for exact syntax. The generator owns
`routeTree.gen.ts` and the path literal passed to `createFileRoute`.

## Paths and aliases

Configure aliases in the bundler/TypeScript source of truth used by the project.
Do not assume an editor-only TypeScript alias is available to Vite, Rsbuild, the
server build, or test tooling. Prefer consistent aliases over fragile tutorial
relative imports.

For the versions documented by the current guide, Vite 8 can enable
`resolve.tsconfigPaths`, while Vite 7 and earlier use `vite-tsconfig-paths`.
Rsbuild reads the root `tsconfig.json` and supports its documented
`source.tsconfigPath` override. Recheck these version gates before changing
configuration.

## Generated and source files

- Never edit `routeTree.gen.ts`.
- Exclude generated route and platform binding files from manual formatting
  rules when the generator expects exact output.
- Generate deployment bindings with the provider tool instead of copying them.
- Keep schemas/types client-safe; keep privileged implementations in
  `.server.*`; expose server-function proxies through `.functions.*`.

## Do

- Start from the current scaffold.
- Preserve a fresh `getRouter()` factory.
- Let generated Start code register `ReturnType<typeof getRouter>`.
- Add Router `Register` only when the current integration/type setup needs it.
- Keep custom entry points minimal.
- Run route generation and production builds after moving route files.

## Don't

- Export an SSR-shared router singleton.
- Handwrite or commit manual edits to generated route paths.
- Port standalone Router bootstrap code into Start.
- Assume code-based Router trees are supported by Start.
- Copy old `app/`, Vinxi, or deprecated package layouts from historical posts.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/getting-started
- https://tanstack.com/start/latest/docs/framework/react/build-from-scratch
- https://tanstack.com/start/latest/docs/framework/react/guide/routing
- https://tanstack.com/start/latest/docs/framework/react/guide/path-aliases
