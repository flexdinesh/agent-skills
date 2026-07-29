# Experimental and versioned features

Check the installed package exports/types and current official guide before
using anything here. Do not rely only on this snapshot.

## Current experimental/release-sensitive surfaces

| Surface | Main risk/check |
| --- | --- |
| Import protection | Experimental; development may warn/mock while production errors |
| Server Components | Experimental RSC build/runtime and serialization constraints |
| Static server functions | Experimental package; build-time/static semantics |
| Deferred hydration | Experimental `Hydrate` strategies and interaction readiness |
| Early hints | Experimental runtime/CDN support for HTTP 103 |
| Asset transformation/CDN URLs | Experimental transform scope and manifest caching |
| CSS inlining | HTML size, caching, CSP nonce, asset ordering |
| Custom server-function IDs | Build compatibility and cache identity |
| Manual OpenTelemetry integration | Runtime/exporter and API drift |

Repeat the warning next to any implementation; do not hide it only in this
catalog.

## Import protection

Whole-file suffixes and marker imports are useful safety nets, but:

- Verify current defaults and configuration.
- Run a production build because development behavior can differ.
- Avoid unsafe barrel re-exports and package imports.
- Treat `node_modules` and custom deny rules according to the current guide.
- Do not disable the feature globally to fix one violation.

## Server Components

Server Components require the current Start RSC integration. Verify:

- Build tool and React support.
- Current exports such as `renderServerComponent`, `createCompositeComponent`,
  and `CompositeComponent`.
- `renderServerComponent` for rendering an RSC result versus composite
  components for controlled client/server composition.
- Serializable arguments/results, opaque server slots, and serializable
  render-prop arguments.
- Router loader cache identity; use `loaderDeps` for non-path inputs.
- Query settings required by the current integration, currently including
  `structuralSharing: false`.
- Use `router.invalidate()` when Router owns an RSC loader result that must be
  refreshed.
- Verify selective SSR combinations for routes returning RSC values.

Do not present RSC as the default Start component model.

## Static server functions

`staticFunctionMiddleware` from the current experimental package executes during
prerender/build and writes keyed static data. It must be the final middleware.
Never use it for request identity, current secrets, personalized output, or
mutation.

## Deferred hydration

Current strategies include load/idle/visible/media/interaction/condition/never
variants from `@tanstack/react-start/hydration`. Verify exact imports and
options.

Initial HTML is still SSR output; later client navigation mounts normally.
Do not defer accessibility-critical, navigation, checkout, consent, or
immediately interactive controls without a strong UX case.
The children supply the initial SSR HTML; `fallback` is for later client
mounting/suspension, not an initial-document placeholder. Verify the current
`split` default. `fallback` is unused by `never()`, and `prefetch` controls when
the generated child chunk is requested.

## Early hints and assets

HTTP 103 must survive the server, proxy/CDN, and browser path. Static hints can
be wrong before redirects; dynamic hints cost more work. Asset transforms do not
rewrite arbitrary links. Verify response headers and requested asset URLs in
production.

Expect browsers to process at most the first `103`. Use dynamic `allLinks` when
hints must account for redirects/loaders, and only replay public, cache-stable
`Link` headers from a CDN. For navigation assets, verify Vite `base: ''` or
Rsbuild `output.assetPrefix: 'auto'` as required by current guidance.
Start's development server currently skips Early Hints.

## Version drift rules

- Inspect `package.json` versions and exports before coding.
- Prefer current Vite/Rsbuild plugin subpaths.
- Do not copy historical Vinxi, `app.config.ts`, or removed `/config` exports.
- Keep provider compatibility dates and packages current.
- Record experimental/stable/deprecated status in code comments and handoff.
- Re-run build, SSR, hydration, and deployment-specific tests after upgrades.

## Do

- Isolate experimental features behind small modules/config.
- Provide a stable fallback/removal path.
- Pin compatible versions.
- Verify exact exports and behavior from source/types.
- Measure the feature's actual benefit.

## Don't

- Combine several experimental features without independent tests.
- use static functions for personalized data.
- Treat a dev warning as proof production import protection passes.
- Claim early hints/CDN rewriting based on local development.
- Teach stale config imports from an inconsistent guide.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/import-protection
- https://tanstack.com/start/latest/docs/framework/react/guide/server-components
- https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration
- https://tanstack.com/start/latest/docs/framework/react/guide/early-hints
- https://tanstack.com/start/latest/docs/framework/react/guide/cdn-asset-urls
- https://tanstack.com/start/latest/docs/framework/react/guide/observability
