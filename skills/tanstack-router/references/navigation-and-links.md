# Navigation and Links

Prefer `<Link>` for user-initiated navigation because it renders a real anchor with a valid `href`, preserving open-in-new-tab, copying, accessibility, and browser semantics. Use imperative navigation for effects and event flows that are not naturally links.

## Use the shared navigation shape

TanStack Router uses the same core options across `<Link>`, `useNavigate`, `<Navigate>`, redirects, and `router.navigate`:

- `from`: type-safe origin for relative navigation.
- `to`: route pattern, never an interpolated URL.
- `params`: values for path parameters.
- `search`: validated query state object or updater.
- `hash`: fragment without `#`.
- `state`: transient history state.
- `mask`: alternate public/history location.

Keep these concerns separate:

```tsx
<Link
  from="/posts"
  to="/posts/$postId"
  params={{ postId: '42' }}
  search={{ tab: 'comments' }}
  hash="latest"
>
  Open comments
</Link>
```

Do not build `to={`/posts/${postId}?tab=comments`}`. Separate fields preserve encoding, validation, refactoring, and compile-time checks.

## Relative navigation

Without `from`, absolute paths receive the strongest autocomplete and type checking. Supply `from` when the target is relative:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  component: Post,
})

function Post() {
  return (
    <nav>
      <Link from={Route.fullPath} to="..">
        All posts
      </Link>
      <Link from={Route.fullPath} to=".">
        Reload this route
      </Link>
      <Link from={Route.fullPath} to="./edit">
        Edit
      </Link>
    </nav>
  )
}
```

`Route.useNavigate()` pre-binds the origin to that route:

```tsx
function PostActions() {
  const navigate = Route.useNavigate()

  async function archive() {
    await archivePost()
    await navigate({ to: '..', replace: true })
  }

  return <button onClick={archive}>Archive</button>
}
```

For a pathless layout, relative navigation resolves from the pathless route's parent because the layout has no URL path. Prefer an explicit `from` if that subtlety would be unclear.

## Choose the navigation API

| Situation | API |
| --- | --- |
| User clicks a destination | `<Link>` |
| Event/effect navigates after work | `useNavigate()` or `Route.useNavigate()` |
| Render-time client redirect | `<Navigate>` |
| Navigation outside React | `router.navigate()` |
| Loader or `beforeLoad` redirect | `throw redirect(...)` |
| Redirect before the app mounts | Server/platform redirect |

`navigate()` and `router.navigate()` return promises. Await them when later work depends on navigation completion.

Use `replace: true` when the current entry should not remain in history, such as a post-login handoff or canonicalization. Do not replace normal drill-down navigation that users reasonably expect to reverse with Back.

## Active links and preloading

```tsx
<Link
  to="/settings"
  activeOptions={{ exact: true }}
  activeProps={{ 'aria-current': 'page', className: 'active' }}
  inactiveProps={{ className: 'inactive' }}
  preload="intent"
>
  Settings
</Link>
```

By default, active matching is prefix-based. Use `activeOptions.exact` for index-like navigation items. `includeSearch` and `includeHash` are available when those states define distinct navigation items.

Intent preloading starts when interaction suggests the user may navigate. Apply it selectively or configure a router-wide default; pair it with loader stale times so hovering does not cause wasteful repeat fetching.

## Updating URL state

Updater functions preserve existing URL state:

```tsx
<Link
  to="."
  search={(previous) => ({
    ...previous,
    page: previous.page + 1,
  })}
>
  Next page
</Link>
```

For optional path params, `params: {}` inherits existing values, while setting a value to `undefined` removes it:

```tsx
<Link
  to="/posts/{-$category}"
  params={{ category: undefined }}
>
  All categories
</Link>
```

## Reusable navigation options

Use `linkOptions()` instead of an untyped object or a broad annotation. It validates early and preserves narrow inferred route types:

```tsx
import { Link, linkOptions } from '@tanstack/react-router'

const primaryNav = linkOptions([
  { to: '/', label: 'Home', activeOptions: { exact: true } },
  { to: '/posts', label: 'Posts' },
  { to: '/settings', label: 'Settings' },
])

function PrimaryNav() {
  return primaryNav.map((item) => (
    <Link key={item.to} {...item}>
      {item.label}
    </Link>
  ))
}
```

The result can also be passed to `navigate` or `redirect` when its options are valid for those APIs.

## Design-system links

Use `createLink` to wrap an anchor-compatible design-system primitive without losing Router's generic types:

```tsx
import * as React from 'react'
import { createLink, type LinkComponent } from '@tanstack/react-router'

const Anchor = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => <a ref={ref} {...props} className={`app-link ${props.className ?? ''}`} />)

const RouterAnchor = createLink(Anchor)

export const AppLink: LinkComponent<typeof Anchor> = (props) => (
  <RouterAnchor preload="intent" {...props} />
)
```

The underlying component must forward the ref and anchor props, including `href`, event handlers, target, and accessibility attributes.

## Full-document and external navigation

Use `reloadDocument` when an internal destination intentionally requires a full document request. Use a normal anchor for unrelated external URLs. A Router navigation API is not a substitute for an HTTP redirect that must occur before client rendering.

Hash fragments are client-only; browsers do not send them to the server. Avoid rendering SSR markup conditionally from a hash because it can cause hydration differences.

## Do

- Prefer `<Link>` for destinations a user can visit.
- Supply `from` for typed relative navigation or use a route-bound navigation hook.
- Pass dynamic path, search, hash, and history state through their dedicated options.
- Use `linkOptions()` for shared menus and redirect destinations.
- Use real anchors or `createLink` wrappers so browser and assistive-technology behavior remains intact.
- Await imperative navigation when sequencing matters.

## Don't

- Don't interpolate params, query strings, or hashes into `to`.
- Don't use `useNavigate` for ordinary navigation controls that should be links.
- Don't omit `from` and expect safe relative autocomplete from an unknown origin.
- Don't use `window.location` for routine same-origin SPA navigation.
- Don't make a `<div onClick>` behave like a link.
- Don't use client navigation in place of a server-side redirect.

## Official sources

- [Navigation](https://tanstack.com/router/latest/docs/guide/navigation)
- [Link Options](https://tanstack.com/router/latest/docs/guide/link-options)
- [Custom Link](https://tanstack.com/router/latest/docs/guide/custom-link)
- [NavigateOptions API](https://tanstack.com/router/latest/docs/api/router/NavigateOptionsType)

