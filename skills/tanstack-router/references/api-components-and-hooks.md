# API: React components and hooks

Use this reference to select the narrowest reactive API or the correct rendering primitive.

## Route-bound first

Prefer route-bound hooks:

```tsx
const postRoute = getRouteApi('/posts/$postId')

function PostHeader() {
  const title = postRoute.useLoaderData({ select: (post) => post.title })
  const postId = postRoute.useParams({ select: (params) => params.postId })
  const navigate = postRoute.useNavigate()
  // ...
}
```

`Route` instances and `getRouteApi()` provide pre-bound versions of:

- `useMatch`
- `useRouteContext`
- `useSearch`
- `useParams`
- `useLoaderData`
- `useLoaderDeps`
- `useNavigate`
- `redirect`

Use top-level hooks when working across matches or when no route API is available, and provide `from` for route-specific values.

## Rendering components

| Component | Purpose | Key guidance |
| --- | --- | --- |
| `<RouterProvider>` | Connect a router to React | Render once near the root |
| `<Outlet>` | Render the next child match | Required in layouts that expose children |
| `<Link>` | Type-safe anchor navigation | Prefer over click-handler navigation |
| `<Navigate>` | Navigate after rendering | Use for render-driven navigation, not guards |
| `<MatchRoute>` | Conditional rendering from current/pending match | Component form of `useMatchRoute` |
| `<Await>` | Suspend on a promise in React 18 | React 19 can use `use()` |
| `<ClientOnly>` | Render client-dependent UI safely with SSR fallback | Supply a stable fallback |
| `<CatchBoundary>` | Local React error boundary | Requires `getResetKey` |
| `<CatchNotFound>` | Locally catch `NotFoundError` | Resets when pathname changes |
| `<ErrorComponent>` | Built-in generic error display | Prefer an application-specific route error UI |
| `<NotFoundComponent>` | Props contract for not-found UI | Receives `data`, `isNotFound`, and `routeId` |
| `<DefaultGlobalNotFound>` | Default root fallback | Renders `Not Found` |

### Links

`Link` changes pathname, params, search, hash, and history state without losing anchor semantics:

```tsx
<Link
  from="/posts"
  to="/posts/$postId"
  params={{ postId }}
  search={(previous) => ({ ...previous, preview: true })}
  activeProps={{ 'aria-current': 'page' }}
  preload="intent"
>
  Open post
</Link>
```

Use `activeOptions={{ exact: true }}` for a root link that should not remain active on every descendant. A disabled link is rendered without `href`; do not use that as a substitute for correct button semantics.

Use `useLinkProps` when building a custom anchor component:

```tsx
function AppLink(props: LinkProps) {
  const anchorProps = useLinkProps(props)
  return <a {...anchorProps} />
}
```

Preserve the returned click handler, ref behavior, accessibility attributes, and `href`.

## Route data hooks

### `useParams`, `useSearch`, `useRouteContext`

These read inherited values from a named match:

```tsx
const postId = useParams({
  from: '/posts/$postId',
  select: (params) => params.postId,
})

const page = useSearch({
  from: '/posts',
  select: (search) => search.page,
})

const api = useRouteContext({
  from: '/posts/$postId',
  select: (context) => context.api,
})
```

`useParams` and `useSearch` support `strict: false` for genuinely route-agnostic components. `shouldThrow: false` makes them return `undefined` when the named match is absent; normally a mismatch should surface as an error.

### `useLoaderData` and `useLoaderDeps`

Read the loader output or its declared search dependencies:

```tsx
const postName = useLoaderData({
  from: '/posts/$postId',
  select: (post) => post.name,
})
```

Prefer route-bound versions. Loader data is available to the route subtree only until another `<Outlet />` boundary changes the closest match; an explicit route ID removes ambiguity.

## Match and location hooks

| Hook | Returns |
| --- | --- |
| `useMatch({ from })` | One active route match |
| `useMatches()` | All active matches, independent of caller position |
| `useParentMatches()` | Root through immediate parent, excluding current match |
| `useChildMatches()` | Children through leaf, excluding current match |
| `useLocation()` | Current parsed location |
| `useMatchRoute()` | Function returning matched params or `false` |

Pending matches replace active matches in parent/child match hooks while pending fallbacks are shown.

Use `rootRouteId` rather than spelling the root route ID:

```tsx
const rootMatch = useMatch({ from: rootRouteId })
```

Probe for an optionally rendered match with `shouldThrow: false`:

```tsx
const editorMatch = useMatch({
  from: '/editor/$documentId',
  shouldThrow: false,
})
```

`useMatchRoute()` can compare the current location, a pending location (`pending: true`), or a fuzzy descendant match and returns params on success:

```tsx
const matchRoute = useMatchRoute()
const params = matchRoute({ to: '/posts/$postId' })
if (params) {
  // params.postId is typed
}
```

## Navigation hooks

`useNavigate({ from })` returns a promise-producing navigation function:

```tsx
const navigate = useNavigate({ from: '/posts' })

await navigate({
  to: '/posts/$postId',
  params: { postId },
  replace: false,
  resetScroll: true,
})
```

Prefer `<Link>` for user-visible navigation. Use `navigate` for completion of an imperative interaction such as a successful form submission.

`useCanGoBack()` is experimental and reports whether Router history can go back without leaving the app. Its index resets after `reloadDocument` navigation.

## Router hooks

`useRouter()` returns the imperative instance. Its `router.state` is current but not reactive.

```tsx
function RefreshButton() {
  const router = useRouter()
  return <button onClick={() => void router.invalidate()}>Refresh</button>
}
```

Use `useRouterState()` for reactive state:

```tsx
const isNavigating = useRouterState({
  select: (state) => state.isLoading,
})
```

Prefer `useLocation` and `useMatches` when those narrower APIs express the need.

## Navigation blocking

The current `useBlocker` API is experimental:

```tsx
const blocker = useBlocker({
  shouldBlockFn: () => formIsDirty,
  enableBeforeUnload: true,
  withResolver: true,
})

if (blocker.status === 'blocked') {
  return (
    <Dialog>
      <button onClick={blocker.proceed}>Leave</button>
      <button onClick={blocker.reset}>Stay</button>
    </Dialog>
  )
}
```

- `shouldBlockFn` returns `true` to block and may be async.
- `disabled` defaults to `false`.
- `enableBeforeUnload` defaults to `true`.
- `withResolver` defaults to `false`; without it, the hook returns `void`.
- With a resolver, narrow on `status === 'blocked'` before using `current`, `next`, `action`, `proceed`, or `reset`.

The older `blockerFn` and `condition` options are deprecated; replace them with `shouldBlockFn` and `disabled`.

## Deferred promises

Return promises directly from loaders. In React 18, render them through `<Await>` or `useAwaited`; in React 19, prefer `use()`:

```tsx
function Activity() {
  const activityPromise = Route.useLoaderData({
    select: (data) => data.activityPromise,
  })

  return (
    <Await promise={activityPromise}>
      {(items) => <ActivityList items={items} />}
    </Await>
  )
}
```

Rejected promises propagate to the nearest error boundary.

## Selector rules

Most read hooks accept:

- `select`: derive only the value that triggers rendering.
- `structuralSharing`: reuse JSON-compatible subtrees when selected results are recreated.

Do not use structural sharing with non-JSON values. Keep selectors pure and cheap.

## Do

- Prefer route-bound hooks, literal `from`, and narrow selectors.
- Prefer `<Link>` over a button that calls `navigate`.
- Use `shouldThrow: false` only for a deliberate match probe.
- Use `useRouterState` for reactive router state.
- Await imperative navigation when later work depends on completion.
- Keep local not-found and error boundaries close to the failure they can recover from.

## Don't

- Do not read `router.state` in a component and expect re-renders.
- Do not call route-specific hooks without `from` merely to suppress TypeScript work.
- Do not replace links with `onClick` navigation and lose open-in-new-tab, copy-link, and keyboard behavior.
- Do not use `<Navigate>` inside `beforeLoad` or loaders; throw a redirect there.
- Do not use deprecated `useBlocker({ blockerFn, condition })`.
- Do not call `defer()` for new deferred data; promises are handled directly.

## Official sources

- <https://tanstack.com/router/latest/docs/api/router>
- <https://tanstack.com/router/latest/docs/api/router/RouteApiType>
- <https://tanstack.com/router/latest/docs/api/router/linkComponent>
- <https://tanstack.com/router/latest/docs/api/router/useRouterStateHook>
- <https://tanstack.com/router/latest/docs/api/router/useBlockerHook>

