# Update Instructions (maintainer-only)

This file is a standalone prompt for an agent refreshing
`skills/tanstack-start/`. It is intentionally not referenced from `SKILL.md` and
must not be loaded during ordinary skill use.

## Goal

Re-crawl the current TanStack Start React documentation, tutorials, and curated
examples; verify the Router APIs that Start uses; then update the skill and
references without copying stale, experimental, unsafe, or demo-only patterns.

The skill covers TanStack Router only as it operates inside Start. Do not turn it
into a standalone Router manual and do not create or modify another Router
skill.

## Baseline snapshot

- Crawl date: `2026-07-27`
- Documentation channel: Start `latest`, framework `react`
- TanStack/router source commit:
  `179d9b9b5eec50dc7833b4e2ef91b735d34bbc07`
- Live navigation counts:
  - Guides: 35
  - Tutorials: 2
  - Curated examples: 12
  - Total pages: 49

These counts are drift assertions, not permanent expectations. Discover the live
navigation first and update the counts after reconciling changes.

## Crawl seeds

- Guides:
  https://tanstack.com/start/latest/docs/framework/react/guide/routing
- Tutorials:
  https://tanstack.com/start/latest/docs/framework/react/tutorial/reading-writing-file
- Examples:
  https://tanstack.com/start/latest/docs/framework/react/examples/start-basic

## Source priority

Resolve claims by responsibility:

1. Current Start guides own Start execution, middleware, server functions/routes,
   rendering, build, deployment, and integration behavior.
2. Current Router guides own routes, loaders, navigation, URL state, route
   context/cache, route errors, and head behavior.
3. Exported package source and TypeScript declarations at the captured commit
   settle exact signatures, imports, option types, defaults, and package exports.
4. Official Start examples and tutorials are supporting evidence, not normative
   authority.
5. Current vendor documentation owns vendor-specific auth, database, UI, and
   deployment behavior.
6. External tutorial companion repositories are secondary evidence only.

When sources disagree, record the conflict, follow the authority that owns the
API, and qualify version-dependent advice. Never silently blend incompatible
examples.

## Current guide manifest

For every guide below, also fetch:

- Deployed Markdown: append `.md` to the canonical URL.
- GitHub blob:
  `https://github.com/TanStack/router/blob/{ref}/docs/start/framework/react/guide/{slug}.md`
- Raw source:
  `https://raw.githubusercontent.com/TanStack/router/{ref}/docs/start/framework/react/guide/{slug}.md`

Use `main` to discover current source, then replace `{ref}` with the captured
commit SHA for reproducible analysis.

### Server & Execution (14)

1. Routing
   - https://tanstack.com/start/latest/docs/framework/react/guide/routing
2. Execution Model
   - https://tanstack.com/start/latest/docs/framework/react/guide/execution-model
3. Code Execution Patterns
   - https://tanstack.com/start/latest/docs/framework/react/guide/code-execution-patterns
4. Import Protection
   - https://tanstack.com/start/latest/docs/framework/react/guide/import-protection
5. Path Aliases
   - https://tanstack.com/start/latest/docs/framework/react/guide/path-aliases
6. Environment Variables
   - https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables
7. Server Functions
   - https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
8. Streaming Data from Server Functions
   - https://tanstack.com/start/latest/docs/framework/react/guide/streaming-data-from-server-functions
9. Server Components
   - https://tanstack.com/start/latest/docs/framework/react/guide/server-components
10. Static Server Functions
    - https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions
11. Environment Functions
    - https://tanstack.com/start/latest/docs/framework/react/guide/environment-functions
12. Middleware
    - https://tanstack.com/start/latest/docs/framework/react/guide/middleware
13. Error Boundaries
    - https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries
14. Server Routes
    - https://tanstack.com/start/latest/docs/framework/react/guide/server-routes

### Rendering (10)

1. Hydration Errors
   - https://tanstack.com/start/latest/docs/framework/react/guide/hydration-errors
2. Deferred Hydration
   - https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration
3. Selective SSR
   - https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
4. SPA Mode
   - https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode
5. Static Prerendering
   - https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
6. Incremental Static Regeneration (ISR)
   - https://tanstack.com/start/latest/docs/framework/react/guide/isr
7. Server Entry Point
   - https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point
8. Client Entry Point
   - https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point
9. Early Hints
   - https://tanstack.com/start/latest/docs/framework/react/guide/early-hints
10. CDN Asset URLs
    - https://tanstack.com/start/latest/docs/framework/react/guide/cdn-asset-urls

### Deployment & Operations (2)

1. Hosting
   - https://tanstack.com/start/latest/docs/framework/react/guide/hosting
2. Observability
   - https://tanstack.com/start/latest/docs/framework/react/guide/observability

### Authentication & Data (4)

1. Authentication Overview
   - https://tanstack.com/start/latest/docs/framework/react/guide/authentication-overview
2. Authentication Server Primitives
   - https://tanstack.com/start/latest/docs/framework/react/guide/authentication-server-primitives
3. Authentication
   - https://tanstack.com/start/latest/docs/framework/react/guide/authentication
4. Databases
   - https://tanstack.com/start/latest/docs/framework/react/guide/databases

### Styling & Metadata (5)

1. CSS Styling
   - https://tanstack.com/start/latest/docs/framework/react/guide/css-styling
2. Tailwind CSS Integration
   - https://tanstack.com/start/latest/docs/framework/react/guide/tailwind-integration
3. Rendering Markdown
   - https://tanstack.com/start/latest/docs/framework/react/guide/rendering-markdown
4. SEO
   - https://tanstack.com/start/latest/docs/framework/react/guide/seo
5. Generative Engine Optimization (GEO)
   - https://tanstack.com/start/latest/docs/framework/react/guide/geo

## Current tutorial manifest

### Reading and Writing a File

- Page:
  https://tanstack.com/start/latest/docs/framework/react/tutorial/reading-writing-file
- Deployed Markdown:
  https://tanstack.com/start/latest/docs/framework/react/tutorial/reading-writing-file.md
- GitHub source:
  https://github.com/TanStack/router/blob/main/docs/start/framework/react/tutorial/reading-writing-file.md
- Raw source:
  https://raw.githubusercontent.com/TanStack/router/main/docs/start/framework/react/tutorial/reading-writing-file.md
- Companion repository:
  https://github.com/shrutikapoor08/devjokes

### Fetching Data from External API

- Page:
  https://tanstack.com/start/latest/docs/framework/react/tutorial/fetching-external-api
- Deployed Markdown:
  https://tanstack.com/start/latest/docs/framework/react/tutorial/fetching-external-api.md
- GitHub source:
  https://github.com/TanStack/router/blob/main/docs/start/framework/react/tutorial/fetching-external-api.md
- Raw source:
  https://raw.githubusercontent.com/TanStack/router/main/docs/start/framework/react/tutorial/fetching-external-api.md
- Companion repository:
  https://github.com/shrutikapoor08/tanstack-start-movies

Record the companion repository commit SHA if inspected. Its source cannot
override current official docs/types.

## Current curated example manifest

Example pages do not have a useful deployed `.md` sibling. For each page, inspect
the full official source tree at the captured TanStack/router commit.

1. Basic
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-basic
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-basic
2. Basic + React Query
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-react-query
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-basic-react-query
3. Basic + Clerk Auth
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-clerk-basic
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-clerk-basic
4. Basic + DIY Auth
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-auth
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-basic-auth
5. Basic + Supabase Auth
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-supabase-basic
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-supabase-basic
6. Trellaux + Convex
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-convex-trellaux
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-convex-trellaux
7. Trellaux
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-trellaux
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-trellaux
8. WorkOS
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-workos
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-workos
9. Material UI
   - Page:
     https://tanstack.com/start/latest/docs/framework/react/examples/start-material-ui
   - Source:
     https://github.com/TanStack/router/tree/main/examples/react/start-material-ui
10. Basic + Auth.js
    - Page:
      https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-authjs
    - Source:
      https://github.com/TanStack/router/tree/main/examples/react/start-basic-authjs
11. Basic + Static rendering
    - Page:
      https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-static
    - Source:
      https://github.com/TanStack/router/tree/main/examples/react/start-basic-static
12. Cloudflare Vite Plugin
    - Page:
      https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-cloudflare
    - Source:
      https://github.com/TanStack/router/tree/main/examples/react/start-basic-cloudflare

The repository contains additional `examples/react/start-*` directories that are
not in this curated nav. Do not silently add them. Record them as source-only and
include them only if the live Start examples navigation adds them or the skill's
scope is explicitly changed.

## Example source discovery

Capture the repository commit first:

- Commit API:
  https://api.github.com/repos/TanStack/router/commits/main
- Repository tree API:
  `https://api.github.com/repos/TanStack/router/git/trees/{sha}?recursive=1`
- Pinned source tree:
  `https://github.com/TanStack/router/tree/{sha}/examples/react/{slug}`
- Pinned raw file:
  `https://raw.githubusercontent.com/TanStack/router/{sha}/examples/react/{slug}/{path}`

For every curated example:

1. Enumerate all tracked files under its source root.
2. Read README, `package.json`, build config, Router/root/routes, server
   functions, middleware, server routes, data/auth code, and deployment config.
3. Mark every tracked file as reviewed or intentionally excluded.
4. Exclude generated files, lockfiles, binaries, and assets only with an
   explicit reason.
5. Compare README claims with actual source.
6. Record package versions and subtree/source changes.

## Focused Router-in-Start cross-checks

Use these to verify Router-owned behavior that appears inside Start. Do not
expand into standalone Router bootstrap or manual Router SSR.

- File-based routing:
  https://tanstack.com/router/latest/docs/routing/file-based-routing
- Creating a router:
  https://tanstack.com/router/latest/docs/framework/react/guide/creating-a-router
- Navigation:
  https://tanstack.com/router/latest/docs/framework/react/guide/navigation
- Path params:
  https://tanstack.com/router/latest/docs/framework/react/guide/path-params
- Search params:
  https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- Data loading:
  https://tanstack.com/router/latest/docs/framework/react/guide/data-loading
- Deferred data loading:
  https://tanstack.com/router/latest/docs/framework/react/guide/deferred-data-loading
- External data loading:
  https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading
- Data mutations:
  https://tanstack.com/router/latest/docs/framework/react/guide/data-mutations
- Preloading:
  https://tanstack.com/router/latest/docs/framework/react/guide/preloading
- Router context:
  https://tanstack.com/router/latest/docs/framework/react/guide/router-context
- Authenticated routes:
  https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes
- Document head management:
  https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management
- Not-found errors:
  https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors
- Route options API:
  https://tanstack.com/router/latest/docs/api/router/RouteOptionsType
- Router options API:
  https://tanstack.com/router/latest/docs/api/router/RouterOptionsType

Start pages arbitrate the integration seams:

- https://tanstack.com/start/latest/docs/framework/react/guide/routing
- https://tanstack.com/start/latest/docs/framework/react/build-from-scratch
- https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
- https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
- https://tanstack.com/start/latest/docs/framework/react/guide/middleware
- https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point
- https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point

## Discovery and URL normalization

For each update:

1. Capture the date, displayed release channel/version, and current
   TanStack/router `main` commit SHA.
2. Fetch all three seed HTML pages.
3. Extract links from the React/Latest docs sidebar only.
4. Restrict membership to:
   - `/start/latest/docs/framework/react/guide/`
   - `/start/latest/docs/framework/react/tutorial/`
   - `/start/latest/docs/framework/react/examples/`
5. Resolve relative links and redirects.
6. Normalize to HTTPS and lowercase host.
7. Strip query, fragment, and trailing slash.
8. Strip `.md` only for page identity; keep the Markdown URL as a source sibling.
9. Deduplicate the duplicated desktop/mobile nav while preserving first-seen
   order and group titles.
10. Exclude global header/footer links, “On this page” anchors, previous/next
    links, other frameworks/libraries, and content-body links.
11. Compare live and stored manifests by URL, title, group, and order.
12. Classify changes as added, removed, renamed, redirected, regrouped, or
    reordered.
13. Resolve redirects before declaring a page removed.
14. Reconcile live nav with official source directories. Record nav-only and
    source-only pages; never silently force them into equality.
15. Crawl every current page even when its source hash appears unchanged.
16. Update this baseline only after the new set is reconciled.

The deployed `.md` and raw GitHub Markdown are intentionally not byte-identical:
the raw file includes frontmatter while deployed Markdown materializes a title.
Hash each form separately. Compare normalized semantic body/AST when useful.

## Source-to-artifact mapping

### `SKILL.md`

- Ownership summary and working method: overview, routing, execution model.
- Core routing/document rules: routing and Router cross-checks.
- Security and execution rules: execution, import protection, server functions,
  middleware, authentication primitives.
- Data/cache decisions: Router data guides, server functions, Query example.
- Rendering/deployment rules: rendering, hosting, prerendering, ISR.
- Demo warning: all tutorials/examples.

### References

- `architecture-and-api-boundaries.md`: overview, routing, selective SSR, server
  routes, context seams.
- `project-setup-and-file-conventions.md`: routing, path aliases, build/plugin
  setup, generated files.
- `routing-navigation-and-url-state.md`: routing plus focused Router navigation,
  params/search, auth, not-found.
- `route-context-data-loading-and-caching.md`: execution model, Router loading,
  preloading, context, Query integration.
- `execution-model-import-protection-and-environment.md`: execution model, code
  patterns, import protection, environment variables/functions.
- `server-functions-rpc-and-streaming.md`: server functions, streaming, static
  imports, validation/serialization.
- `middleware-server-routes-and-request-context.md`: middleware, server routes,
  request/server entry context.
- `errors-redirects-not-found-and-status.md`: error boundaries, server failures,
  Router control flow, HTTP status.
- `rendering-ssr-hydration-and-entry-points.md`: hydration, deferred hydration,
  selective SSR, server/client entries, root document.
- `prerendering-spa-isr-and-cdn.md`: SPA, prerendering, ISR, early hints, CDN
  asset URLs.
- `authentication-sessions-and-security.md`: all authentication guides and auth
  examples.
- `data-mutations-forms-and-query.md`: databases, server mutations, tutorials,
  Query/Trellaux/Convex examples.
- `hosting-observability-and-deployment.md`: hosting, observability, environment,
  adapters, Cloudflare.
- `styling-assets-seo-and-content.md`: CSS, Tailwind, Markdown, SEO, GEO, MUI.
- `experimental-and-versioned-features.md`: every experimental/deprecated/RC
  surface found in any source.
- `tutorial-patterns-and-production-caveats.md`: every tutorial's durable flow,
  inaccuracies, and production corrections.
- `example-pattern-catalog.md`: every curated example's purpose, ownership,
  useful patterns, and explicit non-production artifacts.

## Coverage ledger

Maintain one row per discovered guide/tutorial with:

- Nav group and order.
- Title and slug.
- Canonical HTML URL.
- Deployed Markdown URL.
- GitHub/raw source URL.
- Resolved status and redirect.
- Captured commit/blob SHA and fetch date.
- Headings/code blocks inspected.
- Durable findings.
- Owner: Start, Router, integration seam, platform, vendor, or tutorial/demo.
- Target skill/reference files.
- Result: updated, unchanged, or no durable guidance.
- Conflicts, experimental status, and notes.

For each example also record:

- Page and source root.
- Subtree/commit SHA.
- Package versions.
- Tracked, reviewed, and explicitly excluded file counts.
- Durable patterns.
- Demo/unsafe/stale patterns.
- Destination references.

Every page and source file must be accounted for; nothing may disappear from the
refresh silently.

## Drift signals

Check every update for:

1. Added/removed/renamed/regrouped docs and examples.
2. Redirects, non-200 responses, content-type changes, and broken source links.
3. Package names, exports, import subpaths, and scaffold commands.
4. API signatures, option names, overloads, types, defaults, and generated code.
5. Stable, RC, experimental, deprecated, or removed status.
6. Start-versus-Router ownership or integration changes.
7. Router factory, file conventions, route generation, and code-splitting rules.
8. Server/client/isomorphic execution and import-protection behavior.
9. Environment prefixes and request-injected runtime bindings.
10. Server-function validation, authorization, serialization, middleware, CSRF,
    streaming, caching, and import transformation.
11. Server-route path/handler/HTTP semantics.
12. Request context and custom entry-point behavior.
13. Loader/cache/dependency/preload/invalidation behavior.
14. Router cache versus Query ownership.
15. SSR, hydration, deferred/selective SSR, SPA, prerender, ISR, early hints,
    CSS/assets/CDN, and adapter behavior.
16. Authentication/session/cookie/rate-limit/CSRF recommendations.
17. Database/runtime/connection and deployment-adapter constraints.
18. Tutorial/example dependency and source changes.
19. Demo-only patterns that have been removed, added, or accidentally promoted.
20. Cross-file contradictions inside the skill.

## Patterns that require explicit rechecking

- Router loaders are isomorphic, not server-only.
- A custom `src/start.ts` must preserve current CSRF middleware behavior.
- `beforeLoad` is UX, never the private data authorization boundary.
- Public HTTP caching of identity-dependent output is a cross-user leak.
- Module-scope secret reads can leak and can fail on request-injected edge env.
- Server functions are same-origin RPC, not public APIs.
- Static imports of server-function wrappers are required by current transforms.
- `useServerFn` is a callback wrapper, not a general query/mutation-state hook.
- Do not teach `.server()` as the terminal server-function builder; current
  server functions use `.handler(...)`.
- Import protection, Server Components, static server functions, deferred
  hydration, early hints, asset transforms, CSS inlining, and manual
  OpenTelemetry are currently experimental/release-sensitive.
- Raw HTML Markdown must be sanitized for untrusted/remote content.
- Examples may contain hardcoded secrets/URLs, weak auth, GET mutations,
  identity validators, in-memory/file storage, broad invalidation, token/session
  serialization, debug output, or generated artifacts.

## How to update

1. Read this file completely.
2. Capture live manifests and source commit in parallel by collection.
3. Fetch every guide/tutorial `.md` and pinned raw source.
4. Enumerate and inspect every curated example source tree.
5. Reconcile directly relevant Router docs and current package exports/types.
6. Build the coverage ledger and conflict list before editing.
7. Update `SKILL.md` and concept references; synthesize rather than mirror pages.
8. Keep Start/Router/integration/vendor ownership explicit.
9. Add Do/Don't guidance at the relevant point of use.
10. Mark experimental/provider/deployment assumptions next to the advice.
11. Update this manifest, metadata, counts, mappings, and drift history.
12. Run the verification checklist.

Prefer parallel read-only research, followed by one reconciler/writer so shared
facts and examples stay consistent across files.

## Accuracy rules

- Do not invent exports, options, events, defaults, or config.
- Verify questionable docs against current package exports/types.
- Keep this skill self-contained; do not depend on another local skill.
- Do not copy standalone Router SSR/bootstrap into Start.
- Do not copy a tutorial/example without its caveats.
- Distinguish initial SSR from client navigation.
- Distinguish request context, Router context, and React context.
- Distinguish Router, Query, HTTP/CDN, and static-function caches.
- Keep secrets and privileged work behind an explicit server boundary.
- Preserve redirects/not-found as Router control flow where intended.
- Qualify vendor-specific and experimental behavior.
- Avoid lengthy verbatim copying; write operational synthesis.

## Verification checklist

- [ ] Live normalized manifests equal the updated stored manifests.
- [ ] Counts, titles, group names, and order are updated.
- [ ] Every current page is mapped or marked `no durable guidance`.
- [ ] Every curated example source file is reviewed or explicitly excluded.
- [ ] Every canonical HTML page and docs `.md` resolves or has a recorded
      redirect/status explanation.
- [ ] Raw/blob sources are pinned to the captured commit.
- [ ] Prominent APIs have Start/Router/integration/platform/vendor ownership.
- [ ] Imports/signatures/defaults match current package exports/types.
- [ ] Server inputs are runtime-validated and private work is authorized.
- [ ] Session/cookie/CSRF/cache advice is safe.
- [ ] Rendering examples are deterministic and SSR-safe.
- [ ] Cache ownership and invalidation are explicit.
- [ ] Experimental/platform/provider features are labelled.
- [ ] Every normal reference is linked from `SKILL.md`.
- [ ] Every `SKILL.md` reference link exists.
- [ ] `update.md` remains maintainer-only and is not linked from normal context.
- [ ] README still lists the skill with manual invocation policy.
- [ ] Markdown/frontmatter/link checks and `git diff --check` pass.
- [ ] No unrelated files or another Router skill were modified.
- [ ] Crawl date, commit SHA, old/new counts, manifest changes, and affected
      references are recorded.

## Out of scope

- Standalone TanStack Router installation, code-based/virtual route trees, or
  manual Router SSR.
- Solid Start/Router.
- Exhaustive vendor SDK documentation.
- Community examples as normative sources.
- Editing or depending on any separate local Router skill.
