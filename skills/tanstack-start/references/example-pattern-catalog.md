# Official example pattern catalog

Examples demonstrate complete integrations at a point in time. They are
evidence, not universal production defaults. Source snapshot used for this
catalog: TanStack/router commit
`179d9b9b5eec50dc7833b4e2ef91b735d34bbc07` (2026-07-26).

## 1. Basic

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-basic
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-basic
- Demonstrates: file-route variants, root document, loaders/`beforeLoad`,
  redirect/not-found/error/head, deferred promises, server functions,
  middleware, and file server routes.
- Do not copy: identity validators, JSON casts, sleeps/fake records, debug
  logging, POST reads, invalid links, or logging all request headers.

## 2. Basic + React Query

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-react-query
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-basic-react-query
- Demonstrates: fresh QueryClient in `getRouter`, typed context, current SSR
  Query integration, `ensureQueryData`, stable query options, Suspense, and
  loader-informed head metadata.
- Do not copy: hardcoded localhost deployment URL, accidental internal HTTP
  hops, identity validation, or unreviewed cache defaults.

## 3. Basic + Clerk Auth

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-clerk-basic
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-clerk-basic
- Demonstrates: provider request middleware, minimal current-user context,
  pathless protected layout, and provider UI.
- Do not copy: treating `beforeLoad` as authorization, serializing full users or
  tokens, unconstrained return URLs, or SSR-sensitive browser access.

## 4. Basic + DIY Auth

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-auth
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-basic-auth
- Demonstrates: Start sessions, login/signup server functions, minimal Router
  context, guard/invalidation flow, and a database seam.
- Never copy: hardcoded cookie password, fixed PBKDF salt/homegrown password
  scheme, identity validators, enumeration messages, GET logout, missing rate
  limits/CSRF hardening, or open redirect behavior.

## 5. Basic + Supabase Auth

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-supabase-basic
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-supabase-basic
- Demonstrates: request-scoped Supabase SSR client, server user lookup, auth
  server functions, and Router guard/context.
- Do not copy: dropped provider cookie options, GET logout, non-null env
  assertions instead of startup validation, raw provider errors, or confusing a
  public anon key with a private service-role key.

## 6. Trellaux + Convex

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-convex-trellaux
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-convex-trellaux
- Demonstrates: Convex/Query/Router SSR bridge, provider `Wrap`, typed vendor
  queries/mutations, and vendor-native optimistic updates.
- Do not copy: destructive demo crons, placeholder random IDs, or omit
  authentication/tenant authorization. In the audited snapshot,
  `createColumn` does not await `ensureBoardExists`; always await
  authorization/existence checks before a write so a failed check cannot race
  past the mutation.

## 7. Trellaux

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-trellaux
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-trellaux
- Demonstrates: Query option factories, loader prefill, Zod server-function
  validators, optimistic UI, mutation-cache errors, and invalidation.
- Never copy: module-level in-memory backend, artificial sleeps, GET mutations,
  broad query cancellation/invalidation, or optimistic changes without complete
  snapshot/rollback/reconciliation.

## 8. WorkOS

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-workos
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-workos
- Demonstrates: AuthKit request middleware, client-safe initial auth, external
  sign-in redirect, provider callback server route, and protected layouts.
- Never copy: logging access tokens, displaying token suffixes/debug claims,
  GET logout, unallowlisted return URLs, or relying on route guards for data
  authorization.

## 9. Material UI

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-material-ui
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-material-ui
- Demonstrates: `createLink` adapters with forwarded refs, typed MUI navigation,
  validated search state, root theme/cache providers, and font head links.
- Do not copy: user-visible error stacks or assume the minimal Emotion cache is
  a complete current MUI SSR recipe. Verify the vendor guide.

## 10. Basic + Auth.js

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-authjs
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-basic-authjs
- Demonstrates: Auth.js GET/POST handlers on a Start splat server route, server
  request/session lookup, and Router context/guard flow.
- Never copy: full session/access-token serialization, token/profile cookies
  without deliberate security attributes, printing session JSON, or treating
  the route guard as API authorization.

## 11. Basic + Static rendering

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-static
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-basic-static
- Demonstrates: SPA/prerender config, link crawling, aligned bundler base and
  Router base path, sitemap configuration, and static server-function concept.
- Do not copy: experimental static functions as a stable default,
  `failOnError: false`, localhost sitemap host, demo `/test/` base, random build
  data, or request/personalized work in a static function.

## 12. Cloudflare Vite Plugin

- Page: https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-cloudflare
- Source: https://github.com/TanStack/router/tree/main/examples/react/start-basic-cloudflare
- Demonstrates: provider/Start/React plugin order, Start server entry, Worker
  compatibility config, generated bindings, and server-only binding access.
- Do not copy: stale compatibility dates, credentials in non-secret vars, Node
  API assumptions under compatibility mode, header/token logs, or Basic
  example's generic identity casts.

## Cross-example rules

- Recheck the current live sidebar; the repository contains more `start-*`
  directories than the curated documentation list.
- Pin a commit when auditing source.
- Review package/config/README and all handwritten source, not only the page's
  initially selected file.
- Account for generated/lock/assets explicitly rather than silently ignoring
  them.
- Separate Start, Router, Query, vendor, and platform ownership.
- Promote a pattern only after reconciling it with current guides/types.
- Treat every auth `beforeLoad` and root user context as route UX only. Every
  private server function and server route must authenticate and authorize
  direct RPC/HTTP calls independently.
