# Update TanStack Router Skill

This is a standalone maintainer prompt for re-synchronizing
`skills/tanstack-router/`. It is deliberately not referenced by `SKILL.md`, so it
does not consume normal skill context.

## Goal and scope

Update the skill for the current stable TanStack Router v1 documentation, scoped
to React and TypeScript (`@tanstack/react-router`). Retain framework-neutral
Router concepts where they apply, but do not add Solid Router or TanStack Start
guidance.

Authority order:

1. Current official guides.
2. Current official API reference.
3. Official example source.

Examples illustrate usage but can lag the normative docs. When sources disagree,
follow the guides and API and record the discrepancy.

Baseline crawl:

- Date: 2026-07-27
- Channel: `latest`
- Displayed major version: Router v1
- Framework: React
- Language: TypeScript
- Guide pages: 41
- API pages: 81 (2 landing pages and 79 leaf pages)
- Example pages: 24
- Example source directories: 24

## Required orchestration

Use background agents when the harness supports them. Split independent work
into these streams:

1. Discover and crawl the guide navigation.
2. Discover and crawl both API indexes and every API leaf.
3. Discover the React example navigation and crawl each complete GitHub source
   directory.
4. Reconcile the manifests, deprecations, defaults, and reference coverage.

Do not let multiple agents edit the same file. The coordinating agent owns the
final consistency audit.

## Crawl protocol

1. Start from each landing page rather than trusting this saved manifest.
2. Extract the relevant rendered navigation, normalize canonical URLs, and
   deduplicate repeated desktop/mobile navigation.
3. Diff the discovered URL sets against the baseline below. Report additions,
   removals, redirects, category moves, and case changes.
4. For every guide and API URL, fetch its plain-Markdown endpoint by appending
   `.md` to the canonical URL. Preserve exact path casing. Generated React
   example pages do not expose these Markdown endpoints; crawl their rendered
   page and official GitHub source directory instead.
5. Retry a failed SPA click as a direct canonical URL and, for guide/API pages,
   as its `.md` endpoint before declaring the page unavailable.
6. For examples, follow the official GitHub link and inspect the entire source
   directory. Do not rely on the single file initially displayed by the docs
   page.
7. Exclude StackBlitz, third-party tutorials, issues, discussions, and examples
   that exist in the repository but are not in the requested Router example
   navigation.
8. Parse React sections when a Markdown page contains framework markers. Do not
   merge Solid-only syntax into this skill.
9. Fail visibly if any discovered page is unfetched, if an index count differs
   from the fetched count, or if an unresolved redirect changes the canonical
   target.

`latest` is mutable. Record the new crawl date and the resolved TanStack Router
release or source commit whenever it can be determined.

## Guide manifest

### Core Routing

- https://tanstack.com/router/latest/docs/routing/routing-concepts
- https://tanstack.com/router/latest/docs/routing/route-trees
- https://tanstack.com/router/latest/docs/routing/route-matching
- https://tanstack.com/router/latest/docs/routing/file-based-routing
- https://tanstack.com/router/latest/docs/routing/virtual-file-routes
- https://tanstack.com/router/latest/docs/routing/code-based-routing
- https://tanstack.com/router/latest/docs/routing/file-naming-conventions
- https://tanstack.com/router/latest/docs/guide/url-rewrites

### Navigation and URL State

- https://tanstack.com/router/latest/docs/guide/navigation
- https://tanstack.com/router/latest/docs/guide/link-options
- https://tanstack.com/router/latest/docs/guide/custom-link
- https://tanstack.com/router/latest/docs/guide/path-params
- https://tanstack.com/router/latest/docs/guide/search-params
- https://tanstack.com/router/latest/docs/guide/custom-search-param-serialization
- https://tanstack.com/router/latest/docs/guide/route-masking
- https://tanstack.com/router/latest/docs/guide/navigation-blocking
- https://tanstack.com/router/latest/docs/guide/history-types
- https://tanstack.com/router/latest/docs/guide/scroll-restoration
- https://tanstack.com/router/latest/docs/guide/internationalization-i18n

### Data and Rendering

- https://tanstack.com/router/latest/docs/guide/code-splitting
- https://tanstack.com/router/latest/docs/guide/automatic-code-splitting
- https://tanstack.com/router/latest/docs/guide/data-loading
- https://tanstack.com/router/latest/docs/guide/deferred-data-loading
- https://tanstack.com/router/latest/docs/guide/external-data-loading
- https://tanstack.com/router/latest/docs/guide/data-mutations
- https://tanstack.com/router/latest/docs/guide/preloading
- https://tanstack.com/router/latest/docs/guide/document-head-management
- https://tanstack.com/router/latest/docs/guide/ssr
- https://tanstack.com/router/latest/docs/guide/render-optimizations

### Router Configuration

- https://tanstack.com/router/latest/docs/guide/creating-a-router
- https://tanstack.com/router/latest/docs/guide/outlets
- https://tanstack.com/router/latest/docs/guide/router-events
- https://tanstack.com/router/latest/docs/guide/type-safety
- https://tanstack.com/router/latest/docs/guide/type-utilities
- https://tanstack.com/router/latest/docs/guide/router-context
- https://tanstack.com/router/latest/docs/guide/not-found-errors
- https://tanstack.com/router/latest/docs/guide/authenticated-routes
- https://tanstack.com/router/latest/docs/guide/static-route-data

### Integrations

- https://tanstack.com/router/latest/docs/integrations/query

### ESLint

- https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router
- https://tanstack.com/router/latest/docs/eslint/create-route-property-order

## API manifest

### Landing pages

- https://tanstack.com/router/latest/docs/api/router
- https://tanstack.com/router/latest/docs/api/file-based-routing

### Functions

- https://tanstack.com/router/latest/docs/api/router/createFileRouteFunction
- https://tanstack.com/router/latest/docs/api/router/createLazyFileRouteFunction
- https://tanstack.com/router/latest/docs/api/router/createRootRouteFunction
- https://tanstack.com/router/latest/docs/api/router/createRootRouteWithContextFunction
- https://tanstack.com/router/latest/docs/api/router/createRouteFunction
- https://tanstack.com/router/latest/docs/api/router/createLazyRouteFunction
- https://tanstack.com/router/latest/docs/api/router/createRouteMaskFunction
- https://tanstack.com/router/latest/docs/api/router/createRouterFunction
- https://tanstack.com/router/latest/docs/api/router/deferFunction
- https://tanstack.com/router/latest/docs/api/router/getRouteApiFunction
- https://tanstack.com/router/latest/docs/api/router/isNotFoundFunction
- https://tanstack.com/router/latest/docs/api/router/isRedirectFunction
- https://tanstack.com/router/latest/docs/api/router/lazyRouteComponentFunction
- https://tanstack.com/router/latest/docs/api/router/linkOptions
- https://tanstack.com/router/latest/docs/api/router/notFoundFunction
- https://tanstack.com/router/latest/docs/api/router/redirectFunction
- https://tanstack.com/router/latest/docs/api/router/retainSearchParamsFunction
- https://tanstack.com/router/latest/docs/api/router/stripSearchParamsFunction

### Components

- https://tanstack.com/router/latest/docs/api/router/awaitComponent
- https://tanstack.com/router/latest/docs/api/router/catchBoundaryComponent
- https://tanstack.com/router/latest/docs/api/router/catchNotFoundComponent
- https://tanstack.com/router/latest/docs/api/router/clientOnlyComponent
- https://tanstack.com/router/latest/docs/api/router/defaultGlobalNotFoundComponent
- https://tanstack.com/router/latest/docs/api/router/errorComponentComponent
- https://tanstack.com/router/latest/docs/api/router/linkComponent
- https://tanstack.com/router/latest/docs/api/router/matchRouteComponent
- https://tanstack.com/router/latest/docs/api/router/navigateComponent
- https://tanstack.com/router/latest/docs/api/router/notFoundComponentComponent
- https://tanstack.com/router/latest/docs/api/router/outletComponent

### Hooks

- https://tanstack.com/router/latest/docs/api/router/useAwaitedHook
- https://tanstack.com/router/latest/docs/api/router/useBlockerHook
- https://tanstack.com/router/latest/docs/api/router/useCanGoBack
- https://tanstack.com/router/latest/docs/api/router/useChildMatchesHook
- https://tanstack.com/router/latest/docs/api/router/useLinkPropsHook
- https://tanstack.com/router/latest/docs/api/router/useLoaderDataHook
- https://tanstack.com/router/latest/docs/api/router/useLoaderDepsHook
- https://tanstack.com/router/latest/docs/api/router/useLocationHook
- https://tanstack.com/router/latest/docs/api/router/useMatchHook
- https://tanstack.com/router/latest/docs/api/router/useMatchRouteHook
- https://tanstack.com/router/latest/docs/api/router/useMatchesHook
- https://tanstack.com/router/latest/docs/api/router/useNavigateHook
- https://tanstack.com/router/latest/docs/api/router/useParentMatchesHook
- https://tanstack.com/router/latest/docs/api/router/useParamsHook
- https://tanstack.com/router/latest/docs/api/router/useRouteContextHook
- https://tanstack.com/router/latest/docs/api/router/useRouterHook
- https://tanstack.com/router/latest/docs/api/router/useRouterStateHook
- https://tanstack.com/router/latest/docs/api/router/useSearchHook

### Types

- https://tanstack.com/router/latest/docs/api/router/ActiveLinkOptionsType
- https://tanstack.com/router/latest/docs/api/router/AsyncRouteComponentType
- https://tanstack.com/router/latest/docs/api/router/historyStateInterface
- https://tanstack.com/router/latest/docs/api/router/LinkOptionsType
- https://tanstack.com/router/latest/docs/api/router/LinkPropsType
- https://tanstack.com/router/latest/docs/api/router/MatchRouteOptionsType
- https://tanstack.com/router/latest/docs/api/router/NavigateOptionsType
- https://tanstack.com/router/latest/docs/api/router/NotFoundErrorType
- https://tanstack.com/router/latest/docs/api/router/ParsedHistoryStateType
- https://tanstack.com/router/latest/docs/api/router/ParsedLocationType
- https://tanstack.com/router/latest/docs/api/router/RedirectType
- https://tanstack.com/router/latest/docs/api/router/RegisterType
- https://tanstack.com/router/latest/docs/api/router/RouteType
- https://tanstack.com/router/latest/docs/api/router/RouteApiType
- https://tanstack.com/router/latest/docs/api/router/RouteMaskType
- https://tanstack.com/router/latest/docs/api/router/RouteMatchType
- https://tanstack.com/router/latest/docs/api/router/RouteOptionsType
- https://tanstack.com/router/latest/docs/api/router/RouterType
- https://tanstack.com/router/latest/docs/api/router/RouterEventsType
- https://tanstack.com/router/latest/docs/api/router/RouterOptionsType
- https://tanstack.com/router/latest/docs/api/router/RouterStateType
- https://tanstack.com/router/latest/docs/api/router/ToMaskOptionsType
- https://tanstack.com/router/latest/docs/api/router/ToOptionsType
- https://tanstack.com/router/latest/docs/api/router/UseMatchRouteOptionsType
- https://tanstack.com/router/latest/docs/api/router/ViewTransitionOptionsType

### Deprecated

- https://tanstack.com/router/latest/docs/api/router/FileRouteClass
- https://tanstack.com/router/latest/docs/api/router/RouteClass
- https://tanstack.com/router/latest/docs/api/router/RouterClass
- https://tanstack.com/router/latest/docs/api/router/RouteApiClass
- https://tanstack.com/router/latest/docs/api/router/RootRouteClass
- https://tanstack.com/router/latest/docs/api/router/NotFoundRouteClass
- https://tanstack.com/router/latest/docs/api/router/rootRouteWithContextFunction

## React example manifest

### Documentation pages

- https://tanstack.com/router/latest/docs/framework/react/examples/quickstart-file-based
- https://tanstack.com/router/latest/docs/framework/react/examples/quickstart
- https://tanstack.com/router/latest/docs/framework/react/examples/basic-file-based
- https://tanstack.com/router/latest/docs/framework/react/examples/basic
- https://tanstack.com/router/latest/docs/framework/react/examples/basic-react-query-file-based
- https://tanstack.com/router/latest/docs/framework/react/examples/basic-react-query
- https://tanstack.com/router/latest/docs/framework/react/examples/basic-ssr-file-based
- https://tanstack.com/router/latest/docs/framework/react/examples/basic-ssr-streaming-file-based
- https://tanstack.com/router/latest/docs/framework/react/examples/kitchen-sink-file-based
- https://tanstack.com/router/latest/docs/framework/react/examples/kitchen-sink
- https://tanstack.com/router/latest/docs/framework/react/examples/kitchen-sink-react-query-file-based
- https://tanstack.com/router/latest/docs/framework/react/examples/kitchen-sink-react-query
- https://tanstack.com/router/latest/docs/framework/react/examples/location-masking
- https://tanstack.com/router/latest/docs/framework/react/examples/authenticated-routes
- https://tanstack.com/router/latest/docs/framework/react/examples/scroll-restoration
- https://tanstack.com/router/latest/docs/framework/react/examples/deferred-data
- https://tanstack.com/router/latest/docs/framework/react/examples/navigation-blocking
- https://tanstack.com/router/latest/docs/framework/react/examples/view-transitions
- https://tanstack.com/router/latest/docs/framework/react/examples/with-framer-motion
- https://tanstack.com/router/latest/docs/framework/react/examples/with-trpc
- https://tanstack.com/router/latest/docs/framework/react/examples/with-trpc-react-query
- https://tanstack.com/router/latest/docs/framework/react/examples/router-monorepo-simple
- https://tanstack.com/router/latest/docs/framework/react/examples/router-monorepo-simple-lazy
- https://tanstack.com/router/latest/docs/framework/react/examples/router-monorepo-react-query

### Official source directories

- https://github.com/TanStack/router/tree/main/examples/react/quickstart-file-based
- https://github.com/TanStack/router/tree/main/examples/react/quickstart
- https://github.com/TanStack/router/tree/main/examples/react/basic-file-based
- https://github.com/TanStack/router/tree/main/examples/react/basic
- https://github.com/TanStack/router/tree/main/examples/react/basic-react-query-file-based
- https://github.com/TanStack/router/tree/main/examples/react/basic-react-query
- https://github.com/TanStack/router/tree/main/examples/react/basic-ssr-file-based
- https://github.com/TanStack/router/tree/main/examples/react/basic-ssr-streaming-file-based
- https://github.com/TanStack/router/tree/main/examples/react/kitchen-sink-file-based
- https://github.com/TanStack/router/tree/main/examples/react/kitchen-sink
- https://github.com/TanStack/router/tree/main/examples/react/kitchen-sink-react-query-file-based
- https://github.com/TanStack/router/tree/main/examples/react/kitchen-sink-react-query
- https://github.com/TanStack/router/tree/main/examples/react/location-masking
- https://github.com/TanStack/router/tree/main/examples/react/authenticated-routes
- https://github.com/TanStack/router/tree/main/examples/react/scroll-restoration
- https://github.com/TanStack/router/tree/main/examples/react/deferred-data
- https://github.com/TanStack/router/tree/main/examples/react/navigation-blocking
- https://github.com/TanStack/router/tree/main/examples/react/view-transitions
- https://github.com/TanStack/router/tree/main/examples/react/with-framer-motion
- https://github.com/TanStack/router/tree/main/examples/react/with-trpc
- https://github.com/TanStack/router/tree/main/examples/react/with-trpc-react-query
- https://github.com/TanStack/router/tree/main/examples/react/router-monorepo-simple
- https://github.com/TanStack/router/tree/main/examples/react/router-monorepo-simple-lazy
- https://github.com/TanStack/router/tree/main/examples/react/router-monorepo-react-query

## Source-to-artifact mapping

- Setup, creation, type registration:
  `references/quick-start-and-router-creation.md`
- Route concepts, matching, file naming:
  `references/route-trees-and-file-routing.md`
- Code and virtual route construction:
  `references/code-based-and-virtual-routing.md`
- Links, redirects, and imperative navigation:
  `references/navigation-and-links.md`
- Path/search params, validation, middleware, serialization:
  `references/path-and-search-params.md`
- Loaders, dependencies, cache lifetimes, mutations:
  `references/data-loading-caching-and-mutations.md`
- Query coordination and shared query options:
  `references/tanstack-query-integration.md`
- Context, `beforeLoad`, authentication and server authorization:
  `references/router-context-auth-and-security.md`
- Outlets, pending/error/not-found boundaries:
  `references/outlets-rendering-errors-and-not-found.md`
- Lazy routes, automatic splitting, preloading, render optimization:
  `references/code-splitting-preloading-and-performance.md`
- SSR, promises, hydration, document head:
  `references/ssr-deferred-data-and-document-head.md`
- History, masks, rewrites, and scroll restoration:
  `references/history-masking-rewrites-and-scroll.md`
- Blocking, native view transitions, Framer Motion:
  `references/navigation-blocking-and-transitions.md`
- Locale-aware URL patterns:
  `references/internationalization.md`
- Router events, state, invalidation, static data:
  `references/router-events-state-and-static-data.md`
- TypeScript performance, type utilities, Router ESLint:
  `references/typescript-type-safety-and-eslint.md`
- Route constructors, route options, redirects, not-found functions:
  `references/api-route-functions-and-options.md`
- React components and hooks:
  `references/api-components-and-hooks.md`
- Router options, state, events, and public types:
  `references/api-router-options-state-and-types.md`
- File-routing configuration and deprecated APIs:
  `references/api-file-routing-config-and-deprecations.md`
- Example-derived recipes and monorepo boundaries:
  `references/example-recipes-and-monorepos.md`

Keep `SKILL.md` concise. It should route tasks to these references and contain
only the high-value defaults, workflow, and cross-cutting rules.

## Drift signals

Re-check all of the following:

1. Added, removed, renamed, or recategorized navigation entries.
2. New deprecated, experimental, caution, warning, and important blocks.
3. Router/route option defaults, especially preload, stale, GC, pending,
   trailing-slash, not-found, search strictness, and protocol allowlist behavior.
4. File-router configuration keys and defaults.
5. New or removed functions, components, hooks, public types, and deprecated
   APIs.
6. React-version-specific guidance such as `<Await>` versus React `use()`.
7. `beforeLoad`, loader, redirect, not-found, and authorization semantics.
8. Automatic code-splitting rules and properties that must remain eager.
9. Query cache integration, SSR hydration, and error reset guidance.
10. Generated-file conventions and plugin/CLI setup.
11. Type-registration and inference-performance recommendations.
12. Example-only hacks: sleeps, mock auth, intentionally invalid links,
    blanket invalidation, and hand-built demo SSR must not become defaults.

At minimum, explicitly verify the current replacements for:

- Deprecated constructor classes → `createRouter`, `createRoute`,
  `createFileRoute`, `createRootRoute`, and `getRouteApi`.
- `NotFoundRoute` → `notFound` plus `notFoundComponent`.
- `rootRouteWithContext` → `createRootRouteWithContext`.
- `parseParams`/`stringifyParams` → `params.parse`/`params.stringify`.
- Navigation from loaders or `beforeLoad` → throw or return `redirect`.
- Manual `defer` usage → current automatic promise handling.
- Deprecated search filters → search middleware.

## Update procedure

1. Save the newly discovered manifests and crawl metadata in this file.
2. Build a source diff grouped by the artifact mapping above.
3. Update existing references in place. Add or split a reference only when a
   genuinely new concern would make an existing file difficult to load
   selectively.
4. Put do/don't guidance beside the affected workflow, not only in a generic
   appendix.
5. Use small original TypeScript/TSX examples. Do not copy entire examples or
   long passages from the docs.
6. Mark examples as illustrative where they are not a documented
   recommendation.
7. Remove claims for APIs or behavior no longer present. Do not keep stale
   advice merely for historical context; use the deprecations reference when a
   migration path is still relevant.
8. Update `SKILL.md` only for changes that affect the quick workflow, routing
   table, recommended defaults, or high-frequency safety rules.
9. Do not link this file from `SKILL.md` or a runtime reference.

## Accuracy rules

- Never invent an API name, option, default, event, route convention, or
  deprecation.
- Preserve the distinction between file-based and code-based routing.
- Preserve the distinction between Router SSR and the separate TanStack Start
  framework.
- A client-side route guard is a UI boundary, not a server authorization
  boundary.
- Treat `routeTree.gen.ts` and generated `createFileRoute` path literals as
  generated output.
- Keep API URL casing exact.
- Prefer route-scoped APIs or strict `from`/`to` narrowing; document
  `strict: false` as an intentional loss of specificity.
- Do not treat `router.state` as reactive React state.
- Do not recommend Next.js, Remix, React Router DOM, or `src/pages`
  conventions.

## Verification checklist

- [ ] The guide nav count equals the number of successfully fetched guide pages.
- [ ] Both API indexes were fetched and every leaf category count reconciles.
- [ ] The baseline API shape is rechecked: 18 functions, 11 components,
      18 hooks, 25 types, and 7 deprecated pages.
- [ ] The example nav count equals the number of docs pages and source
      directories crawled.
- [ ] Every guide and API page has a successful `.md` fetch; every generated
      example page and source directory has a successful direct fetch.
- [ ] Every manifest URL maps to at least one artifact.
- [ ] Every local link in `SKILL.md` resolves.
- [ ] All documented defaults and deprecations were checked against current API
      pages.
- [ ] React and TypeScript examples use current imports and do not weaken types
      without explaining why.
- [ ] `SKILL.md` remains a concise operational entrypoint.
- [ ] No unfinished work marker or filler text remains.
- [ ] `git diff --check` passes.
- [ ] The repository skills CLI discovers `tanstack-router`.

Do not declare the update complete if any manifest page failed to fetch or if a
discovered addition/removal was not reconciled.
