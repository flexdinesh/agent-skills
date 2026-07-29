# Path and Search Parameters

Treat path params as route identity and search params as validated URL state. Both originate in user-editable text and must cross a parsing or validation boundary before application code trusts them.

## Choose path or search

Use a path param when changing the value selects a different resource or hierarchy:

```text
/teams/$teamId/members/$memberId
```

Use search state when the value changes the view of the same resource:

```text
/products?page=2&sort=price&filters={"inStock":true}
```

Search state is JSON-first in TanStack Router. Top-level values remain interoperable with normal URL query tools, while nested values can be serialized as JSON.

## Required, optional, and splat path params

- `$postId` captures one required path segment.
- `{-$category}` captures an optional segment.
- `$` captures the remaining path as `_splat`.
- `prefix{$name}` and `{$name}.suffix` support prefixed/suffixed params.

```tsx
// src/routes/posts/$postId.tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => getPost(params.postId),
  component: Post,
})

function Post() {
  const { postId } = Route.useParams()
  return <p>Post {postId}</p>
}
```

Parsed params are inherited by child routes. Prefer route-local `Route.useParams()` or `getRouteApi(path).useParams()` because they preserve the exact route contract. Use global `useParams({ from: '/posts/$postId' })` when a component cannot import the route API.

`strict: false` makes location ambiguous and every possible value optional:

```tsx
const { postId } = useParams({ strict: false })
// postId is optional because this component may render elsewhere.
```

Use it only for deliberately route-agnostic UI.

## Parse non-string path types

Params are strings by default. Define symmetric `parse` and `stringify` functions when application code needs a richer type:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  params: {
    priority: 10,
    parse: ({ postId }) => {
      if (!/^\d+$/.test(postId)) return false
      return { postId: Number(postId) }
    },
    stringify: ({ postId }) => ({ postId: String(postId) }),
  },
  loader: ({ params }) => getPost(params.postId), // number
})

const postLink = (
  <Link to="/posts/$postId" params={{ postId: 42 }}>
    Post 42
  </Link>
)
```

When dynamic candidates overlap, routes with `params.parse` are tried before equivalent unparsed candidates. Higher `params.priority` values are tried first; returning `false` lets matching continue. Static-route specificity still wins.

Keep parse/stringify round-trippable:

```ts
parse(stringify(value)) === value
```

By default, values are escaped with `encodeURIComponent`. Configure `pathParamsAllowedCharacters` only when the URL contract intentionally permits one of Router's supported URI characters.

## Navigate with params

Pass the route pattern and params separately:

```tsx
<Link
  to="/teams/$teamId/members/$memberId"
  params={{ teamId: 'platform', memberId: '42' }}
>
  View member
</Link>
```

Function updates inherit existing values:

```tsx
<Link
  to="/posts/{-$category}"
  params={(previous) => ({ ...previous, category: undefined })}
>
  Clear category
</Link>
```

For optional params, `undefined` removes the segment; an empty object inherits compatible current params.

## Validate search at the route boundary

`validateSearch` receives parsed but untrusted JSON. Return a typed, normalized object with safe fallbacks for user-fixable values:

```tsx
import { z } from 'zod'

const productSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  query: z.string().catch(''),
  sort: z.enum(['newest', 'price']).catch('newest'),
})

export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  component: Products,
})

function Products() {
  const { page, query, sort } = Route.useSearch()
  return <ProductTable page={page} query={query} sort={sort} />
}
```

Zod v4 and Standard Schema-compatible validators can be supplied directly. For Zod v3 transformations/defaults, use `@tanstack/zod-adapter` so navigation input and parsed output types remain correct.

Choose failure behavior deliberately:

- Catch/fallback malformed filters and pagination when continuity is more useful than an error page.
- Throw for a search value whose invalidity makes the route unsafe or meaningless. A validation failure reaches `onError`/`errorComponent` with router code `VALIDATE_SEARCH`.

Parent search schemas are merged into descendants, so validate shared URL state at the narrowest common ancestor.

## Make search part of loader identity

Declare loader dependencies instead of reading component state inside a loader:

```tsx
export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    query: search.query,
    sort: search.sort,
  }),
  loader: ({ deps }) => getProducts(deps),
})
```

`loaderDeps` tells Router which search values affect the data and cache identity. Omit presentational search state that does not change the loader result.

## Read and update search state

Use the local route API:

```tsx
function Pagination() {
  const search = Route.useSearch()

  return (
    <Link
      from={Route.fullPath}
      search={(previous) => ({ ...previous, page: search.page + 1 })}
    >
      Next
    </Link>
  )
}
```

For imperative updates:

```tsx
const navigate = Route.useNavigate()

await navigate({
  search: (previous) => ({ ...previous, query: 'router', page: 1 }),
  replace: true,
})
```

Use `replace: true` for rapid filter/input synchronization when every keystroke should not create a Back-button entry. Use pushed entries when each state is meaningfully navigable.

## Search middlewares

Middlewares transform search while links are built and after validation during navigation:

```tsx
import {
  retainSearchParams,
  stripSearchParams,
} from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  search: {
    middlewares: [
      retainSearchParams(['query']),
      stripSearchParams({ page: 1, query: '', sort: 'newest' }),
    ],
  },
})
```

Use `retainSearchParams` only for values that should intentionally flow to descendants. Use `stripSearchParams` to keep canonical URLs free of default noise.

## Custom serialization

Router's default serializer supports nested JSON. Configure `parseSearch` and `stringifySearch` on the router only when there is a concrete interoperability, readability, or size requirement:

```ts
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  parseSearch: parseSearchWith(customParse),
  stringifySearch: stringifySearchWith(customStringify),
})
```

The pair must be idempotent and preserve the full search object. Test Unicode, nested arrays/objects, empty values, malformed input, and copy/paste round trips. Base64 is encoding, not encryption; it does not make sensitive data safe.

## Do

- Validate every search contract at a route boundary.
- Use route-local hooks or a typed `from` whenever the rendering location is known.
- Keep parse/stringify functions symmetric.
- Declare data-affecting search fields through `loaderDeps`.
- Use updater functions to preserve required inherited URL state.
- Strip defaults when a shorter canonical URL improves sharing and caching.

## Don't

- Don't concatenate params or query strings into `to`.
- Don't cast raw search values to trusted application types.
- Don't use `strict: false` when a precise route is known.
- Don't put secrets, authorization tokens, or bulky ephemeral data in the URL.
- Don't change search serialization without compatibility and round-trip tests.
- Don't include every search field in `loaderDeps` if it does not affect loaded data.

## Official sources

- [Path Params](https://tanstack.com/router/latest/docs/guide/path-params)
- [Search Params](https://tanstack.com/router/latest/docs/guide/search-params)
- [Custom Search Param Serialization](https://tanstack.com/router/latest/docs/guide/custom-search-param-serialization)
- [Data Loading: loaderDeps](https://tanstack.com/router/latest/docs/guide/data-loading#using-loaderdeps-to-access-search-params)
