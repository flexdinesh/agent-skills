# API: file routing configuration and deprecations

Use this reference when configuring route generation, diagnosing missing routes, or modernizing legacy Router APIs.

## Configuration locations

With Vite, pass generation options to `tanstackRouter()`:

```ts
import { tanstackRouter } from '@tanstack/router-plugin/vite'

tanstackRouter({
  target: 'react',
  routesDirectory: './src/routes',
  generatedRouteTree: './src/routeTree.gen.ts',
  autoCodeSplitting: true,
})
```

Use `tsr.config.json` with the Router CLI. The CLI should be the fallback for unsupported bundlers: it generates and watches the tree but does not provide bundler transformations such as automatic code splitting.

## File-routing configuration

| Option | Type/current default | Meaning |
| --- | --- | --- |
| `routesDirectory` | `./src/routes` | Route source directory, relative to cwd |
| `generatedRouteTree` | `./src/routeTree.gen.ts` | Generated tree output |
| `virtualRouteConfig` | `undefined` | Virtual file route definition |
| `routeFilePrefix` | empty string | If set, only matching file names become routes |
| `routeFileIgnorePrefix` | `-` | Ignore colocated files/directories with this prefix |
| `routeFileIgnorePattern` | `undefined` | Regex-form ignore pattern |
| `indexToken` | `index` | Index-route file token |
| `routeToken` | `route` | Layout-route file token |
| `quoteStyle` | `single` | Generated/new-route quote style |
| `semicolons` | `false` | Generated/new-route semicolons |
| `autoCodeSplitting` | `false` in v1 | Bundler-only non-critical route splitting |
| `disableTypes` | `false` | Emit an untyped `.js` tree when true |
| `addExtensions` | `false` | Keep/replace import extensions |
| `disableLogging` | `false` | Silence generator logging |
| `routeTreeFileHeader` | generator directives | Lines prepended to the generated tree |
| `routeTreeFileFooter` | `[]` | Lines appended to the generated tree |
| `enableRouteTreeFormatting` | `true` | Format generated output |
| `tmpDir` | `TSR_TMP_DIR`, else `.tanstack/tmp` | Atomic-write temporary directory |

The default header is:

```json
[
  "/* eslint-disable */",
  "// @ts-nocheck",
  "// noinspection JSUnusedGlobalSymbols"
]
```

### Extension handling

- `addExtensions: false`: generated imports omit extensions.
- `addExtensions: true`: keep the source extension.
- `addExtensions: 'js'`: replace source extensions with `.js`, useful for Node ESM output.

### Token regexes

`indexToken` and `routeToken` may be regexes. In JSON use `{ "regex": "...", "flags": "i" }`; in inline TypeScript use `RegExp`.

Regexes match the entire final route segment. Escape a segment that should remain literal with square brackets, for example `[home-page].tsx`.

Do not configure `routeFilePrefix`, `routeFileIgnorePrefix`, or `routeFileIgnorePattern` to collide with file-naming convention tokens.

### Atomic writes

The generator writes a temporary file then renames it. `tmpDir` resolution is:

1. Explicit `tmpDir`
2. `process.env.TSR_TMP_DIR`
3. `.tanstack/tmp` relative to cwd

Use this option when the default temporary directory is unsuitable for a monorepo, container, or filesystem boundary.

## Generator contracts

- File routes must export `Route`.
- `createFileRoute('...')` and `createLazyFileRoute('...')` path strings are generator-maintained.
- The bundler plugin generates the tree during development and build.
- CLI users must run `tsr watch` in development and `tsr generate` before build.
- Generated output belongs in source imports but outside manual editing, linting, and formatting.
- With `disableTypes: true`, output changes to `.js`; this gives up the primary type-safety benefit and should be exceptional.

VS Code can mark `**/routeTree.gen.ts` read-only and exclude it from file watching and search to avoid stale generated-file diagnostics after route renames.

## Automatic code splitting

For file-based routes on a supported bundler:

```ts
tanstackRouter({
  target: 'react',
  autoCodeSplitting: true,
})
```

The v1 default is `false`; the docs state that v2 is intended to default it to `true`.

The default split groups are:

```ts
[
  ['component'],
  ['errorComponent'],
  ['notFoundComponent'],
]
```

The available split properties are `component`, `pendingComponent`, `errorComponent`, `notFoundComponent`, and `loader`. Configuration precedence is:

1. Route `codeSplitGroupings`
2. Plugin `codeSplittingOptions.splitBehavior`
3. Plugin `codeSplittingOptions.defaultBehavior`

Keep loaders in the critical bundle unless profiling justifies the extra request. Do not export component functions used as split route properties from the route file; exporting them can pull them into the main bundle.

## Complete deprecated API replacement map

### Deprecated API index

| Deprecated API | Exact replacement |
| --- | --- |
| `new FileRoute(path).createRoute(options)` | `createFileRoute(path)(options)` |
| `new Route(options)` | `createRoute(options)` |
| `new Router(options)` | `createRouter(options)` |
| `new RouteApi({ id })` | `getRouteApi(id)` |
| `new RootRoute(options)` | `createRootRoute(options)` |
| `new NotFoundRoute(options)` | Route-level `notFoundComponent` |
| `rootRouteWithContext<T>()(options)` | `createRootRouteWithContext<T>()(options)` |

These APIs are documented as deprecated and planned for removal in the next major Router version.

### Deprecated options and fields

| Deprecated | Exact replacement |
| --- | --- |
| Route `parseParams` | `params.parse` |
| Route `stringifyParams` | `params.stringify` |
| Route `preSearchFilters` | `search.middlewares` |
| Route `postSearchFilters` | `search.middlewares` |
| `beforeLoad`/`loader` argument `navigate` | Throw `redirect({ to: ... })` |
| Router option `notFoundRoute` | Route/root `notFoundComponent` |
| `NotFoundError.global` | `routeId: rootRouteId` |
| `useBlocker` option `blockerFn` | `shouldBlockFn` |
| `useBlocker` option `condition` | Express the condition inside `shouldBlockFn`, or use `disabled` |
| Parsed history `state.key` | Router-managed `state.__TSR_key` |

`defer()` remains in the API index with a caution rather than in the deprecated section: promises are now handled automatically, so return promises directly in new code.

### Preferred-but-not-deprecated choices

- File-based `createLazyFileRoute` is preferred over `lazyRouteComponent` for a one-off file-route component.
- Automatic code splitting is preferred over manual `createLazyFileRoute` when the supported bundler plugin is available.
- Route-bound `Route.redirect()`/`getRouteApi(id).redirect()` is preferred for relative redirects because `from` is supplied automatically.

Do not describe these preferences as formal deprecations.

## Migration patterns

Legacy router:

```tsx
// Before
const router = new Router({ routeTree })

// After
const router = createRouter({ routeTree })
```

Legacy params:

```tsx
// Before
createRoute({
  getParentRoute: () => rootRoute,
  path: '$year',
  parseParams: ({ year }) => ({ year: Number(year) }),
  stringifyParams: ({ year }) => ({ year: String(year) }),
})

// After
createRoute({
  getParentRoute: () => rootRoute,
  path: '$year',
  params: {
    parse: ({ year }) => ({ year: Number(year) }),
    stringify: ({ year }) => ({ year: String(year) }),
  },
})
```

Legacy not-found route:

```tsx
// After
export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <NotFoundPage />,
})
```

Legacy guard navigation:

```tsx
export const Route = createFileRoute('/account')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw Route.redirect({ to: '/login' })
    }
  },
})
```

## Do

- Keep generator configuration explicit when it materially changes builds.
- Ignore and protect generated route-tree output.
- Use the bundler plugin on supported bundlers and the CLI only as the fallback.
- Audit every legacy constructor and option before a major-version upgrade.
- Distinguish formal deprecations from recommendations and experimental APIs.
- Validate regex token and ignore-pattern changes against the complete route tree.

## Don't

- Do not hand-edit generated route paths or `routeTree.gen.ts`.
- Do not enable `disableTypes` in a TypeScript application without an explicit reason.
- Do not expect the CLI to perform automatic code splitting.
- Do not split loaders by default.
- Do not export automatically split component functions from their route file.
- Do not claim `lazyRouteComponent` or `defer` is formally deprecated when the current API index does not.
- Do not configure ignore/prefix patterns that consume `$`, `_`, `__root`, `index`, `route`, or other naming-convention semantics.

## Official sources

- <https://tanstack.com/router/latest/docs/api/file-based-routing>
- <https://tanstack.com/router/latest/docs/installation/with-vite>
- <https://tanstack.com/router/latest/docs/installation/with-router-cli>
- <https://tanstack.com/router/latest/docs/guide/automatic-code-splitting>
- <https://tanstack.com/router/latest/docs/api/router>

