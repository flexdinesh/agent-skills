# Prerendering, SPA, ISR, early hints, and CDN assets

Choose a rendering/deployment mode from product requirements and target-host
capabilities, not from the smallest example configuration.

## Mode selection

| Mode | Initial HTML | Server features after load | Typical fit |
| --- | --- | --- | --- |
| Full SSR | Per-request rendered | Yes | Dynamic, SEO-sensitive applications |
| Selective/data-only SSR | Route-specific | Yes | Mixed browser/SEO constraints |
| SPA mode | Static app shell | Yes, through endpoints | Internal apps or static hosting |
| Static prerender | Built HTML for known URLs | Optional | Stable, enumerable content |
| ISR-style caching | Cached prerender/SSR with revalidation | Yes | Content that tolerates controlled staleness |

## SPA mode

SPA mode still allows server functions and server routes when the deployment
includes a server. If deployed as client-only static assets, those endpoints
must live elsewhere.

Ensure the host rewrites application URLs to the SPA shell while preserving
real asset/API paths. Test a deep direct URL, refresh, 404, and base path.
Preserve `/_serverFn/*` and server-route/API paths before a catch-all rewrite.
Root loader data captured while building the SPA shell can become stale or
public, so do not place request-specific identity there.

Current defaults use `/_shell.html`, recommend shell mask `/`, and have
`crawlLinks: false` and `retryCount: 0`. Recheck these defaults on upgrade rather
than encoding them permanently.

## Static prerendering

- Configure explicit routes for critical pages.
- Use link crawling only when the link set is bounded and trustworthy.
- Control external links, query explosions, dynamic IDs, and authenticated URLs.
- Fail the build on important prerender errors.
- Supply a canonical host when generating absolute URLs/sitemaps.
- Verify output under the deployment base path.

Automatic discovery does not produce concrete URLs for parameterized routes and
does not treat layout/componentless routes as pages. Link crawling can still
discover bounded dynamic paths.

Prerendering is build-time work; an ordinary loader without prerender
configuration is still request/navigation-time work.

## ISR

Start's documented ISR pattern combines generated/rendered output with HTTP/CDN
cache behavior. Verify the target honors directives such as
`stale-while-revalidate`; local development cannot prove CDN semantics.

Define:

- Cache key and personalization boundary.
- Freshness and stale window.
- Revalidation/failure behavior.
- Purge/invalidation path.
- Which cookies/headers vary the response.

Never place personalized or authorization-dependent HTML into a shared public
cache.

## Early hints

Early hints only help when the server, proxy/CDN, and client path preserve them.
Use them for critical known assets, avoid duplicating excessive preloads, and
measure on the actual host.

Browsers generally process only the first `103`. Static hints may be emitted
before a redirect is known; use the current dynamic `allLinks` strategy when
hints must be loader-aware or redirect-safe. Any CDN-replayed `Link` header must
contain only public, cache-stable resources. The Start development server
currently skips Early Hints.

## CDN asset URLs

Keep application route base paths, bundler asset bases, and CDN origins
coordinated. Verify:

- SSR-emitted URLs.
- Client chunk loading.
- Dynamic imports.
- Fonts/images/CSS.
- Integrity and cross-origin behavior.
- Local, preview, and production environments.

For navigation chunks, current guidance may require Vite `base: ''` or Rsbuild
`output.assetPrefix: 'auto'`; verify against the installed version. Experimental
`transformAssets` rewrites Start-managed manifest assets, not arbitrary `?url`
head links or component imports.

Production transform results are cached by default. Use `cache: false` only when
the result legitimately varies per request. Verify `assetCrossOrigin`, which can
override a transform-provided cross-origin value.

## Do

- Choose mode per route/workload.
- Bound prerender crawling.
- Align Vite base and Router base path.
- Test deep links and provider cache behavior.
- Document personalization and purge rules.
- Measure hints/CDN behavior end to end.

## Don't

- Call runtime loader work “build-time” without prerendering.
- Assume SPA means no server features.
- Cache authenticated output publicly.
- Claim ISR support without host verification.
- Crawl unbounded user-generated URLs during build.
- Hardcode a production asset origin into shared source.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode
- https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
- https://tanstack.com/start/latest/docs/framework/react/guide/isr
- https://tanstack.com/start/latest/docs/framework/react/guide/early-hints
- https://tanstack.com/start/latest/docs/framework/react/guide/cdn-asset-urls
- https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
