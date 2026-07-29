# Middleware, server routes, and request context

Start owns the incoming request lifecycle, server-function middleware, server
routes, request context, and HTTP response behavior.

## Middleware layers

Keep these distinct:

- Request middleware wraps incoming Start requests and can populate per-request
  context, headers, tracing, or provider authentication. Global request
  middleware wraps SSR, server routes, and server functions.
- Server-function middleware wraps selected server functions and may have
  client/server phases supported by the current API.
- Server-route middleware wraps HTTP handlers declared on a route.
- Router `beforeLoad` is route lifecycle, not Start request middleware.

Use the current `createMiddleware` and `createStart` guides for exact signatures;
middleware APIs are more release-sensitive than Router basics.

Call downstream `next()` unless the middleware deliberately returns a terminal
response. Preserve returned context and response metadata.
Request middleware cannot depend on function middleware because it runs around
the broader request lifecycle.

## Context

Context should be request-scoped and additive:

```text
request middleware
  -> request context (request ID, verified session, logger)
  -> server function/server route/SSR
  -> selected client-safe data copied into Router context
```

Never put a mutable request object, secret token, or database transaction into a
module-level singleton. Only expose the minimum client-safe subset to Router
context.

Treat function middleware context sent from the client as client-controlled,
even when typed. Validate it and never derive authenticated identity or
authorization from it. Context sent back to the client must contain no secrets.

Client context is not transmitted automatically. The current API uses
`next({ sendContext })` to serialize explicitly selected context in either
direction. Treat both directions as a network boundary.

Typed custom server-entry request context is currently registered through
Router's `Register.server.requestContext`, even though Start injects it at
runtime. Keep that integration seam explicit and verify the current declaration
shape before editing.

## Server routes

Server routes use Router file path conventions but Start's HTTP runtime:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => Response.json({ ok: true }),
    },
  },
})
```

Use the exact current handler signature from the server-routes guide. Prefer
standard `Request`/`Response` semantics for custom status, headers, body,
content type, redirects, caching, streaming, and method handling.

Server-route paths must be unique. Recheck current file conventions for escaped
dots (`[.]`), splat `_splat` params, pathless middleware layouts, and breakout
routes. Middleware may apply at a route or handler-specific level. Runtime
validate params, search, headers, and request bodies; file-route typing does not
validate an HTTP body.

## Choosing HTTP versus RPC

Choose server routes when callers or semantics are HTTP-shaped. Examples:

- OAuth/auth provider callbacks.
- Webhooks with signature verification.
- Public JSON endpoints.
- File downloads, sitemaps, robots, feeds.
- Custom caching or streaming protocol.

Choose server functions for application-internal, typed same-origin RPC.

## Middleware ordering

- Put broad request tracing/security before feature middleware.
- Authenticate before work that requires identity.
- Authorize as close as possible to the resource operation.
- Ensure final/terminal middleware stays last when the current API requires it.
- Preserve response headers and context returned by downstream middleware.
- Make cleanup/error logging reliable for thrown redirects and errors.

## Request helpers

Use the documented Start server request helpers for cookies, headers, request
URL, and status when inside a supported server context. Avoid importing them
into code that can execute in the browser.

Cookies should deliberately set security attributes appropriate to the
deployment: `httpOnly`, `secure`, `sameSite`, path, domain, and expiry. Preserve
vendor-supplied cookie options when adapting a provider.

## Webhook checklist

- Read the raw body in the form expected by signature verification.
- Verify signature/timestamp before parsing or mutating.
- Make processing idempotent.
- Return deliberate 2xx/4xx/5xx responses.
- Avoid leaking verification details.
- Do not apply browser-oriented CSRF logic to third-party webhooks; use the
  provider's signature protocol.

## Do

- Use per-request context for identity, request IDs, and tracing.
- Keep protocol-shaped work in server routes.
- Return explicit status and headers.
- Preserve middleware ordering and downstream response metadata.
- Verify provider callbacks against current provider documentation.

## Don't

- Confuse `beforeLoad` with request middleware.
- Store request data in global mutable state.
- Expose a server-function RPC as a public integration API.
- Discard cookie attributes from an auth provider.
- Parse an unverified webhook as trusted input.
- Swallow Router redirect/not-found control flow in generic middleware.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/middleware
- https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
- https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point
- https://tanstack.com/start/latest/docs/framework/react/guide/authentication-server-primitives
