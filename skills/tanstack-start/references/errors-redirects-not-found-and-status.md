# Errors, redirects, not-found, and status

Separate route control flow, expected domain failures, unexpected exceptions,
and HTTP protocol responses.

## Ownership

- Router owns route `errorComponent`, `notFoundComponent`, `redirect()`,
  `notFound()`, match/loader failures, and navigation behavior.
- Start owns transporting supported server-function failures/control flow,
  server-route `Response` status/headers, SSR error rendering, and server logs.
- Application code owns domain error design and sanitization.

## Route boundaries

Place pending, error, and not-found boundaries at the narrowest route that can
recover or explain the failure. Keep a root fallback for failures that escape.
Use Router's `defaultErrorComponent` for a global default and a boundary's
`reset()` when a retry should rerun the failed route lifecycle.

Test each boundary through:

- Direct server-rendered request.
- Client navigation.
- Preloading.
- Loader revalidation.
- A server-function failure.

An error caught and returned as `{ error }` will not exercise Router's
`errorComponent`; use a result union only when the screen intentionally renders
that state as normal data.

## Not-found

Throw `notFound()` for a missing route-backed resource and define a useful
`notFoundComponent`. Do not use the deprecated `NotFoundRoute`.

Choose whether a parent or child owns the not-found presentation. Do not convert
every upstream error into 404; distinguish absence, authorization, validation,
dependency failure, and timeout.

## Redirects

Use Router `redirect()` for internal route control:

- Authentication return-to.
- Canonical paths.
- Post-action navigation where route semantics apply.

Use an HTTP `Response` redirect for external/protocol flows such as an OAuth
callback when a raw response is the intended API. Avoid low-level redirects for
ordinary internal navigation because they force hard reloads and lose Router
semantics.

## Server-function errors

- Validate and authorize before mutation.
- Let Router redirect/not-found objects propagate.
- Convert internal exceptions to stable, non-secret client errors.
- Log the original exception with a request/correlation ID.
- Do not serialize stack traces, SQL, tokens, filesystem paths, or provider
  payloads to the browser.

## Server-route status

Return deliberate standard `Response` objects:

- 2xx for success.
- 3xx for protocol redirect.
- 4xx for caller/auth/resource errors.
- 5xx for unexpected server/dependency failure.

Include cache and retry headers only when semantically correct. Never cache a
personalized error in a shared CDN response.

## Hydration and streaming failures

SSR failures may occur before headers, after streaming begins, or during client
hydration. Verify behavior for each phase. A response status may no longer be
changeable after a stream starts, so log and render late failures deliberately.

## Do

- Preserve typed Router control flow.
- Use scoped boundaries and meaningful status codes.
- Return public error codes/messages rather than internal exception details.
- Log server causes with correlation data.
- Test failures on direct load and navigation.

## Don't

- Catch every error and return HTTP 200.
- Turn authorization failures into not-found unless that concealment is
  intentional.
- Show raw stack/session/provider data in production.
- Use a hard redirect for normal internal navigation.
- Suppress hydration errors as an error strategy.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries
- https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
- https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors
