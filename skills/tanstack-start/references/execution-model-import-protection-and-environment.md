# Execution model, import protection, and environment

TanStack Start is isomorphic by default. Shared modules and Router loaders may be
included in both server and client builds unless an explicit boundary protects
them.

Import protection is currently experimental. Confirm its current package
version, configuration, and dev/build enforcement before relying on it as the
only control. Keep architectural server boundaries even when protection warns or
mocks a violation during development.

Current defaults can warn/mock violations in development while making them
build errors in production. Always run a production build. Avoid unsafe barrel
re-exports; file checks may exclude `node_modules`, so use current specifier-deny
rules for risky packages rather than assuming every dependency is analyzed.

## Choose the boundary

| Need | API/pattern | Client/server behavior |
| --- | --- | --- |
| Server RPC callable by browser | `createServerFn` | Client calls a generated endpoint; handler runs server-side |
| Direct server utility | `createServerOnlyFn` | Throws if called in the client |
| Direct browser utility | `createClientOnlyFn` | Throws if called during SSR |
| Different implementation by environment | `createIsomorphicFn` | Selects declared server/client implementation |
| Browser-dependent component | Router `ClientOnly` | Stable fallback during SSR/first render |
| Hydration-aware render | Router `useHydrated` | False through first client render, then true |

## File protection

Use `.server.ts`/`.server.tsx` and `.client.ts`/`.client.tsx` for whole-file
boundaries. When renaming is unsuitable, place one marker import at the top:

```ts
import '@tanstack/react-start/server-only'
```

or:

```ts
import '@tanstack/react-start/client-only'
```

Both markers in one file are invalid. Type-only imports are ignored by import
protection. Follow violation traces instead of weakening protection rules to
silence a genuine leak.

## Secret-safe organization

```text
src/features/posts/
├── posts.schema.ts       # serializable types and validators
├── posts.functions.ts    # createServerFn proxies, safe to import from client
└── posts.server.ts       # database and secret-bearing implementation
```

Use static imports for server-function wrappers so the Start transform can
replace client usage with RPC stubs. Dynamic imports of wrappers can defeat the
expected bundling transform.

## Environment variables

- Keep committed defaults/templates separate from local secrets.
- Treat bundler-public prefixes as public client data: Vite uses `VITE_` and
  Rsbuild defaults to `PUBLIC_`.
- Read private variables inside a server function, server-only function,
  middleware server phase, or server-route handler.
- Read per request where edge/worker environments inject bindings at request
  time.
- Validate required variables at the server boundary and fail with a clear,
  non-secret error.

Do not read `process.env.SECRET` at module scope. It may be bundled into client
code and may evaluate before a worker request supplies its environment.

The server build currently statically replaces `NODE_ENV` by default. If
`staticNodeEnv` is disabled for one build deployed to multiple runtime
environments, set `NODE_ENV=production` explicitly in production.

For `createIsomorphicFn`, define both sides unless a silent `undefined` no-op in
the missing environment is intentional. `createServerOnlyFn` and
`createClientOnlyFn` throw in the wrong environment; neither is RPC.

## Hydration-safe environment use

The server render and the first browser render must agree. Browser locale,
timezone, random IDs, `Date.now()`, localStorage, media queries, and DOM
measurements need a deterministic fallback or post-hydration effect.

## Bundle verification

After production build:

- Inspect the client output for secret names and server-only packages.
- Exercise an import-protection failure intentionally when configuring custom
  deny rules.
- Verify Worker/edge bindings in a real or provider-local runtime.
- Confirm public environment substitution matches the chosen bundler.

## Do

- Default to shared pure logic, then add the narrowest explicit boundary.
- Keep validation/types importable from both environments.
- Read request-scoped bindings per request.
- Use `ClientOnly`/`useHydrated` for rendering, not `typeof window` branches that
  change the first render.

## Don't

- Assume a route file or loader is server-only.
- Import `.server.*` from a client-reachable module.
- put private values behind a public environment prefix.
- Disable import protection to accommodate a leaky architecture.
- Use module-scope browser or server globals in isomorphic modules.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/execution-model
- https://tanstack.com/start/latest/docs/framework/react/guide/code-execution-patterns
- https://tanstack.com/start/latest/docs/framework/react/guide/import-protection
- https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables
- https://tanstack.com/start/latest/docs/framework/react/guide/environment-functions
