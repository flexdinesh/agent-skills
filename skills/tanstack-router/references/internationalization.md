# Internationalization

TanStack Router is i18n-library agnostic. For React applications, choose one URL strategy and make locale detection, validation, link generation, loaders, document metadata, and server handling agree with it.

## Choose a URL strategy

| Strategy | Example | Best fit |
| --- | --- | --- |
| Optional route param | `/{-$locale}/about` | Small client app, manual locale handling, locale is part of the route contract |
| Bidirectional rewrite | Public `/fr/about`, internal `/about` | One internal route tree, integration with a URL-aware i18n library |
| Required route param | `/$locale/about` | Every public URL must explicitly state locale |

Prefer rewrites when localized and internal route trees should remain structurally identical. Prefer optional params when route components/loaders intentionally own the locale param.

## Optional locale params

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

const locales = ['en', 'fr', 'es', 'de'] as const
type Locale = (typeof locales)[number]

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale)
}

export const Route = createFileRoute('/{-$locale}/about')({
  beforeLoad: ({ params }) => {
    if (params.locale && !isLocale(params.locale)) {
      throw redirect({
        to: '/{-$locale}/about',
        params: { locale: undefined },
        replace: true,
      })
    }

    return { locale: params.locale ?? 'en' }
  },
  component: About,
})

function About() {
  const { locale } = Route.useRouteContext()
  return <TranslatedAbout locale={locale} />
}
```

This one route matches `/about`, `/en/about`, and `/fr/about`. Optional segments rank below exact static routes, so consider collisions such as `/about` versus a root optional param.

Use function-style params to preserve the remainder of a dynamic route:

```tsx
<Link
  to="/{-$locale}/blog/$slug"
  params={(previous) => ({
    ...previous,
    locale: 'fr',
  })}
>
  Français
</Link>
```

Set `locale: undefined` for a default-locale URL without a prefix.

For a large route tree, put the optional locale segment at a common ancestor:

```text
routes/
└── {-$locale}/
    ├── route.tsx
    ├── index.tsx
    ├── about.tsx
    └── blog/
        └── $slug.tsx
```

Validate and expose the locale once at that ancestor so all children inherit a typed route context.

## Localized URLs through rewrites

URL rewrites let the browser display localized paths while Router matches one internal tree:

```ts
import { createRouter } from '@tanstack/react-router'
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime'

const router = createRouter({
  routeTree,
  rewrite: {
    input: ({ url }) => deLocalizeUrl(url),
    output: ({ url }) => localizeUrl(url),
  },
})
```

This is the recommended integration shape for libraries such as Paraglide. Input removes/translates the public locale form before matching; output restores/localizes it for `<Link>`, navigation, and history.

The two directions must be inverses for every supported locale and route. If rendering can occur on a server, do not derive the output locale from browser-only storage. Feed both environments the same request/session-aware locale state to prevent different links and hydration output.

Use:

- `location.href` for Router's internal rewritten location.
- `location.publicHref` for copying, analytics, canonical URLs, and other public-facing uses.

When locale switching changes external pathnames, use the i18n library's locale-aware URL operation or update its locale state before building/navigating the new public URL. Do not manually prefix a URL that will also pass through an output rewrite.

## Load localized data

Locale is data identity. Include it in loader dependencies, query keys, or fetch arguments:

```tsx
export const Route = createFileRoute('/{-$locale}/products')({
  beforeLoad: ({ params }) => ({
    locale: isLocale(params.locale) ? params.locale : 'en',
  }),
  loader: ({ context }) => getProducts({ locale: context.locale }),
})
```

If a library holds locale outside the URL, pass it through typed router context and invalidate affected matches when it changes. Never reuse cached content across locales under a locale-free cache key.

## SEO and document semantics

For indexable applications:

- Set `<html lang>` to the resolved locale.
- Set `dir="rtl"` for right-to-left locales at an appropriate document/layout boundary.
- Emit a canonical URL according to the chosen default-locale policy.
- Emit `hreflang` alternates for every available localized version, including an intentional default/x-default policy.
- Use translated titles, descriptions, and Open Graph locale metadata.
- Generate public URLs through the rewrite/i18n layer rather than string concatenation.

If both `/about` and `/en/about` serve English, choose which one is canonical and apply that policy consistently. Router rewrites do not themselves send HTTP redirect status codes; canonicalization that requires a redirect belongs in the hosting/server layer.

## Locale detection and persistence

Use a deterministic precedence such as:

1. Valid locale in the public URL.
2. Explicit user preference.
3. Request/browser language.
4. Application default.

Do not silently override a valid locale already present in the URL. Persisting a preference is useful, but the shareable URL should remain sufficient to reconstruct the displayed language when locale-prefixed URLs are the contract.

Invalid locales need an explicit policy:

- Redirect to the default locale.
- Return not found.
- Fall back while canonicalizing the URL.

Avoid throwing a generic error for routine unsupported-locale input.

## Do

- Select and document one default-locale URL policy.
- Validate locale strings into a finite union before loading or rendering.
- Put locale in data/query cache identity.
- Keep input and output rewrites reversible.
- Generate canonical and alternate links from public/localized URLs.
- Use one locale source across client rendering and any server rendering.

## Don't

- Don't duplicate every route solely to add locale prefixes when a shared ancestor or rewrite suffices.
- Don't cast arbitrary params to `Locale`.
- Don't concatenate locale prefixes when an output rewrite already localizes URLs.
- Don't read `localStorage` inside rewrite logic that also runs during server rendering.
- Don't serve cached content from another locale.
- Don't assume a client-side rewrite is an SEO redirect.
- Don't mix TanStack Start-specific server conventions into a Router-only React application.

## Official sources

- [Internationalization](https://tanstack.com/router/latest/docs/guide/internationalization-i18n)
- [Path Params: i18n](https://tanstack.com/router/latest/docs/guide/path-params#internationalization-i18n-with-optional-path-parameters)
- [URL Rewrites](https://tanstack.com/router/latest/docs/guide/url-rewrites)
- [React Paraglide Example](https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide)
