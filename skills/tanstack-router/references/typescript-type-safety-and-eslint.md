# TypeScript type safety and ESLint

Use this reference when type inference is weak, route APIs are used outside route files, or a large route tree is slowing the TypeScript language service.

## Register the router

Top-level exports cannot know the application route tree until the router type crosses the module boundary through declaration merging:

```ts
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

Register the application router, not `typeof routeTree` and not a manually written router interface. Keep one registration per TypeScript program unless the application deliberately has separate builds.

## Prefer route-bound APIs

Inside a route file, the exported `Route` object is the narrowest and fastest type boundary:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => getPost(params.postId),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  const postId = Route.useParams({ select: (params) => params.postId })
  const navigate = Route.useNavigate()
  // ...
}
```

In a split file or a feature module, bind the same APIs once with a literal route ID:

```tsx
import { getRouteApi } from '@tanstack/react-router'

const postRoute = getRouteApi('/posts/$postId')

export function PostToolbar() {
  const id = postRoute.useParams({ select: (params) => params.postId })
  const navigate = postRoute.useNavigate()
  // ...
}
```

For top-level hooks, provide `from`:

```tsx
const postId = useParams({
  from: '/posts/$postId',
  select: (params) => params.postId,
})

const navigate = useNavigate({ from: '/posts/$postId' })
```

`from` is both a type constraint and a runtime assertion that the route is currently rendered. Passing the wrong route can throw at runtime.

## Shared components and relaxed types

Use `strict: false` only when a component genuinely spans unrelated routes and cannot name an origin:

```tsx
function GlobalFilterBadge() {
  const filter = useSearch({
    strict: false,
    select: (search) => search.filter,
  })
  // filter is optional/loosened across the registered tree
}
```

Loose mode returns the router-wide shared or partial shape. It is not a shortcut for avoiding a correct `from` value. Prefer passing already-selected data into reusable presentation components.

## Keep inference narrow

### Constrain navigation

Relative destinations without a `from` can make TypeScript compare params and search against the entire route tree:

```tsx
// Narrow and refactor-safe
<Link from={Route.fullPath} to=".." search={(prev) => ({ ...prev, page: 1 })} />
```

Absolute `to` values also narrow inference:

```tsx
<Link to="/posts/$postId" params={{ postId }} />
```

### Select only reactive state that is rendered

```tsx
const pathname = useLocation({ select: (location) => location.pathname })
const isLoading = useRouterState({ select: (state) => state.isLoading })
```

Selectors reduce re-renders and reduce the type surface carried into the component. Enable `structuralSharing` only for JSON-compatible selector results; do not return class instances or other non-JSON structures when using it.

### Avoid broad annotation

An unparameterized `LinkProps` is a large union of all routes, params, and search schemas. Preserve a precise inferred object:

```tsx
import { linkOptions, type LinkProps } from '@tanstack/react-router'

const settingsLink = linkOptions({
  to: '/settings',
  search: { tab: 'profile' },
})

const postLink = {
  to: '/posts/$postId',
  params: { postId: 'example' },
} as const satisfies LinkProps
```

Use `linkOptions()` when an object or array will later be spread into `<Link>`, `navigate`, or `redirect`. Avoid widening route literals to `string`.

### Avoid inferred loader data that is never consumed

When a loader only primes another cache, make the return type `Promise<void>` by not returning the cached value:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(postQuery(params.postId))
  },
})
```

This keeps a complex query result out of the generated route-tree type.

### Prefer object children for very large code-based trees

```ts
const routeTree = rootRoute.addChildren({
  accountRoute: accountRoute.addChildren({
    profileRoute,
    securityRoute,
  }),
  homeRoute,
})
```

The object form is more verbose but can type-check faster than a large tuple when route types include complex external-library types.

## Inference-sensitive property order

Route option order affects inference. The official ESLint rule enforces and fixes this sequence:

1. `params`, `validateSearch`
2. `loaderDeps`, `search.middlewares`, `ssr`
3. `context`
4. `beforeLoad`
5. `loader`
6. `onEnter`, `onStay`, `onLeave`, `head`, `scripts`, `headers`, `remountDeps`

Other properties are order-insensitive. A typical route follows the dependency flow:

```tsx
export const Route = createFileRoute('/projects/$projectId')({
  validateSearch: (raw): { view?: 'board' | 'list' } => ({
    view: raw.view === 'list' ? 'list' : 'board',
  }),
  loaderDeps: ({ search }) => ({ view: search.view }),
  beforeLoad: ({ context }) => {
    if (!context.user) throw Route.redirect({ to: '/login' })
  },
  loader: ({ context, deps, params }) =>
    context.api.getProject(params.projectId, deps.view),
})
```

## Configure the Router ESLint plugin

Install:

```sh
npm install --save-dev @tanstack/eslint-plugin-router
```

ESLint flat config:

```js
// eslint.config.js
import pluginRouter from '@tanstack/eslint-plugin-router'

export default [
  ...pluginRouter.configs['flat/recommended'],
  {
    ignores: ['src/routeTree.gen.ts'],
  },
]
```

The current plugin exposes one recommended, fixable rule: `@tanstack/router/create-route-property-order`.

If `@typescript-eslint/only-throw-error` is enabled, allow the Router core values designed to be thrown:

```js
{
  rules: {
    '@typescript-eslint/only-throw-error': [
      'error',
      {
        allow: [
          {
            from: 'package',
            package: '@tanstack/router-core',
            name: 'Redirect',
          },
          {
            from: 'package',
            package: '@tanstack/router-core',
            name: 'NotFoundError',
          },
        ],
      },
    ],
  },
}
```

## Extending history state

Use declaration merging rather than casts when the application stores custom history state:

```ts
declare module '@tanstack/react-router' {
  interface HistoryState {
    returnFocusTo?: string
  }
}
```

The router adds internal fields such as `__TSR_index` and `__TSR_key`; do not write or depend on them. The older parsed-state `key` is marked for removal in v2 in favor of `__TSR_key`.

## Do

- Register `typeof router` immediately after creating the router.
- Prefer `Route.use*`, `Route.useNavigate`, or `getRouteApi(routeId)` over broad top-level hooks.
- Use literal `from` and `to` values and `select` functions.
- Preserve inference with `linkOptions()` or `as const satisfies`.
- Use the recommended ESLint configuration and ignore generated route-tree output.
- Let route schemas and callbacks infer types downstream.

## Don't

- Do not manually declare param, search, loader-data, or context types that the route already infers.
- Do not cast an invalid destination to a valid route union.
- Do not use `strict: false` in route-specific feature code.
- Do not annotate reusable link objects as bare `LinkProps`.
- Do not return complex loader data when the loader exists only to prefetch an external cache.
- Do not reorder `loader` before `beforeLoad`, or other inference consumers before their producers.

## Official sources

- <https://tanstack.com/router/latest/docs/guide/type-safety>
- <https://tanstack.com/router/latest/docs/api/router/RegisterType>
- <https://tanstack.com/router/latest/docs/api/router/getRouteApiFunction>
- <https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router>
- <https://tanstack.com/router/latest/docs/eslint/create-route-property-order>

