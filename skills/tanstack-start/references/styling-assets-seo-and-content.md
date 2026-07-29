# Styling, assets, SEO, and content

Router owns route head definitions. Start's SSR/prerendering makes them visible
in the initial document and its asset manifest coordinates built CSS/scripts.

## CSS choices

- Side-effect CSS imports participate in the build's asset graph.
- CSS Modules provide local class names.
- `?url` imports can be placed explicitly in route `head().links`.
- CSS-in-JS requires a library-specific SSR cache/extraction strategy.
- Route/lazy component CSS may arrive later than initial critical CSS.

Choose one intentional ownership strategy. Do not mix approaches without
checking ordering, duplication, FOUC, hydration, and caching.

Side-effect CSS and CSS Modules are Start-manifest-managed and can participate
in static hints, experimental asset transforms, and inlining. A `?url` route
head link is dynamically explicit and is not automatically Start-inlined or
rewritten by `transformAssets`.

CSS inlining and Start asset transforms are currently experimental. Inlining
increases HTML size and loses independent stylesheet caching; verify CSP nonce
behavior and measure before adopting it.

## Tailwind

Tailwind 4 is the current recommended line:

- Vite uses the current `@tailwindcss/vite` integration.
- Rsbuild uses the documented PostCSS integration.

The current Vite recipe uses `?url` in root head; the Rsbuild recipe uses a
side-effect import. Preserve those asset-management consequences. Treat
Tailwind 3 instructions as legacy unless the installed application requires
them.

## Route metadata

Define head content on routes:

- Title and description.
- Canonical URL.
- Robots directives where needed.
- Open Graph/social metadata.
- Stylesheet/preload links.
- Structured data scripts.

Derive resource metadata from loader data rather than starting an unrelated
component fetch. Escape untrusted values in XML, JSON-LD, and text endpoints.

## SEO

- Render semantic, accessible HTML.
- Keep important content SSR/prerendered when crawlers require it.
- Use canonical URLs for duplicate parameter/search variants.
- Provide correct status/not-found behavior.
- Generate sitemap/robots output from an authoritative URL inventory.
- Remember that prerender link crawling cannot discover unlinked dynamic URLs.
- Test without client JavaScript.

## GEO

Generative Engine Optimization guidance overlaps good SEO: clear content
hierarchy, attribution, structured data, stable URLs, and machine-readable
documents. Treat `llms.txt` and similar conventions as emerging, not a guarantee
of indexing or citation.

## Markdown

Static content can be transformed at build time; remote/dynamic content should
be fetched inside a server function or server route.

Untrusted Markdown is hostile input:

- Disable raw HTML, or parse with `rehype-raw` and then sanitize with an explicit
  `rehype-sanitize` schema/allowlist.
- Restrict remote repository/branch/path inputs.
- Keep access tokens server-side.
- Limit size, recursion, embeds, protocols, and generated output.
- Cache only after considering authorization and freshness.
- Handle upstream rate limits and failures.

The current guide's raw-HTML example is not sufficient for untrusted content
without sanitization.

## Assets and CDN

Experimental `transformAssets` affects Start-managed manifest scripts/styles
and documented CSS URLs, not every arbitrary route link or component asset.
Coordinate it with bundler base/asset prefix and `assetCrossOrigin`. Prefer
stable manifest caching unless the CDN selection truly varies per request.

## Do

- Keep metadata route-owned and loader-informed.
- Sanitize untrusted HTML/Markdown.
- Escape dynamic sitemap/JSON-LD data.
- Verify CSS SSR and hydration with the chosen UI library.
- Test assets under the real base path/CDN.
- Label emerging GEO advice as non-guaranteed.

## Don't

- Enable raw HTML for user content without sanitizing.
- Put GitHub/provider tokens in a loader or browser fetch.
- Assume prerender crawling creates a complete sitemap.
- Render error stacks or debug metadata in production.
- Mix CSS ownership modes without checking order/caching.
- Teach legacy `@tanstack/react-start/config` imports unless installed exports
  prove they exist.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/css-styling
- https://tanstack.com/start/latest/docs/framework/react/guide/tailwind-integration
- https://tanstack.com/start/latest/docs/framework/react/guide/rendering-markdown
- https://tanstack.com/start/latest/docs/framework/react/guide/seo
- https://tanstack.com/start/latest/docs/framework/react/guide/geo
- https://tanstack.com/start/latest/docs/framework/react/guide/cdn-asset-urls
