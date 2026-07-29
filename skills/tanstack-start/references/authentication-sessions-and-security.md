# Authentication, sessions, and security

Authentication answers who the caller is. Authorization answers whether that
caller may perform this operation. Start provides server primitives and
middleware; Router provides route UX/context. Neither replaces application
authorization policy.

## Security boundary

Protect data and mutations at every server function and server route:

```text
request
  -> validate input
  -> authenticate session/token
  -> authorize action/resource
  -> perform operation
  -> return minimal public DTO
```

Use a Router pathless layout `beforeLoad` to keep unauthenticated users out of
screens they cannot use and to avoid failing loaders. It is defense-in-depth UX,
not the authoritative security check.

## Session handling

Use Start's current server session API with:

- A strong secret from a server-only environment source.
- Secure, HTTP-only cookies in production.
- Deliberate SameSite, path, domain, expiry, and rotation.
- Minimal session data.
- Logout that clears/invalidates server state.
- Rotation after privilege/authentication changes where appropriate.

Do not hardcode the session password. Follow the current minimum-length and
rotation guidance in the Start authentication primitives guide.

For a host-only session cookie, prefer the current guide's `__Host-` pattern:
`Secure`, `Path=/`, and no `Domain`, with `HttpOnly` and deliberate `SameSite`.
Prefer an opaque, revocable session ID backed by server storage for production
security and rotation.

Rotate sessions after login, password change, account recovery, and
role/privilege changes. When parsing a signed/base64 cookie, split on the first
`=` only so padding/value content is preserved.

## Router context

Load a minimal client-safe current-user projection at the root when routing
needs identity:

```ts
type PublicUser = {
  id: string
  displayName: string
  role: 'member' | 'admin'
}
```

Do not put access tokens, refresh tokens, provider account objects, or raw
session cookies in Router context or loader data. Invalidate Router state after
login/logout so guards and dependent loaders rerun.

## Password authentication

Prefer a mature authentication provider/library. For DIY credentials:

- Use a current password hashing algorithm and unique salts.
- Apply rate limiting and abuse detection.
- Avoid user enumeration.
- Verify email/recovery flows.
- Rotate/invalidate sessions appropriately.
- Protect credential and reset endpoints with CSRF/replay controls.
- Equalize login/reset response copy and timing.
- Store rate limits in durable/distributed infrastructure in multi-instance
  production.

The official DIY example demonstrates control flow, not complete production
security.

## CSRF

Server functions are same-origin RPC and rely on Start's CSRF protections. If
adding custom `src/start.ts`, explicitly preserve the current default CSRF
middleware. Do not expose mutation server functions through permissive origins.

Webhooks are different: verify provider signatures rather than applying a
browser CSRF token.

OAuth authorization flows require one-time `state`, PKCE, and a short-lived
signed attempt cookie. Validate redirect destinations against a strict
allowlist.

## Provider integrations

For Clerk, WorkOS, Auth.js, Supabase, or other providers:

- Follow the provider's current Start/SSR recipe.
- Keep request middleware at the documented scope.
- Preserve provider cookie attributes.
- Minimize client session projection.
- Authorize private server operations independently.
- Treat example debug pages/token displays as non-production.

## Do

- Authorize every private server operation.
- Keep session/token parsing server-side.
- Return minimal public identity.
- Preserve return-to URLs using validated Router state.
- Rate-limit authentication and recovery operations.
- Use non-GET methods for login, logout, reset, and other mutations.
- Recheck vendor guidance on every update.

## Don't

- Rely on hidden UI or `beforeLoad` for authorization.
- Serialize raw sessions or tokens.
- Use hardcoded secrets, fixed salts, or identity validators.
- Leak whether an account exists unnecessarily.
- Discard provider cookie options.
- Assume a provider example is a complete threat model.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/authentication-overview
- https://tanstack.com/start/latest/docs/framework/react/guide/authentication-server-primitives
- https://tanstack.com/start/latest/docs/framework/react/guide/authentication
- https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-auth
- https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-authjs
