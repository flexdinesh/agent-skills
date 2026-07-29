# Server functions, RPC, and streaming

Server functions are Start's same-origin, type-safe RPC boundary. A function can
be imported and called from browser code; Start replaces the call with a request
to the server handler.

## Basic shape

```ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const updatePostInput = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200),
})

export const updatePost = createServerFn({ method: 'POST' })
  .validator(updatePostInput)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const post = await authorizePostEdit(user, data.id)
    return savePost(post, data.title)
  })
```

GET is the default, but declare POST for mutations. Use a runtime validator such
as Zod rather than an identity cast. TypeScript types do not validate hostile
network input.

## Server boundary responsibilities

Every private server function should:

1. Validate externally influenced input.
2. Authenticate the current request.
3. Authorize the specific operation/resource.
4. Perform server-only work.
5. Return a minimal serializable DTO.
6. Sanitize client-visible errors while preserving an internal cause/log.

Route `beforeLoad` may prevent an unusable screen from rendering, but callers
can invoke a server function independently of that UI guard.

## Calling locations

- Router loaders: route-critical server work.
- React components/events: interactive reads and mutations.
- Other server functions/server code: composition when the API supports it.
- `useServerFn`: a callback wrapper that integrates supported Router control
  flow. It is not a general query/mutation-state hook and does not imply
  `{ data, isLoading, refetch }` or `.mutate`.

Keep wrappers in statically imported `.functions.ts` modules and privileged
implementation in `.server.ts`.

## Server function or server route

Use a server function for:

- Same-origin application RPC.
- End-to-end inferred calls from the Start client.
- Route loader data and application mutations.

Use a server route for:

- Public or cross-origin HTTP APIs.
- Webhooks and provider callbacks.
- Downloads, feeds, custom content types, or explicit HTTP semantics.
- Endpoints consumed by non-Start clients.

## Middleware

Attach function middleware for shared authentication, validation context,
logging, or timing. Keep authorization resource-specific in the handler when a
generic middleware cannot make that decision safely.

If the application defines a custom `src/start.ts`, verify that the standard
CSRF middleware is still installed. Do not assume automatic defaults remain
after replacing the default Start configuration.

The current guide requires explicitly installing `createCsrfMiddleware` for
server functions when custom Start request middleware replaces the automatic
setup. Verify its current filter/signature from installed types.

## Serialization

- Inputs and outputs cross a transport boundary.
- Return plain, supported serializable values and documented stream types.
- Avoid database clients, class instances with hidden state, request objects,
  secrets, or provider SDK objects in returned data.
- Keep strict serialization validation enabled.
- Return explicit public session/user fields, never a raw provider session.
- Apply `public` cache headers only to truly non-personalized results. Any
  cookie, identity, authorization, or tenant-dependent branch makes shared
  caching a cross-user data-leak risk.

## Redirect and not-found

Router `redirect()` and `notFound()` can be thrown from supported server
functions when route control flow is intended. Let them propagate; do not wrap
them in a broad catch that converts them into a generic error.

## Streaming results

Use streaming when progressive delivery materially improves the experience.
Current Start supports typed `ReadableStream<T>` values and async generators;
async generators are often the simpler typed iteration API.
Preserve:

- Backpressure and incremental consumption.
- Cancellation/abort behavior supported by the current API.
- A stable fallback/pending UI.
- Serializable chunks.
- Error handling for failures before and during the stream.

Do not call a streaming API and immediately buffer the entire result unless the
consumer truly needs an aggregate.

POST server functions can accept `FormData` under the current API. For
progressive enhancement, use the documented server-function URL/form behavior
and still validate, authorize, and handle non-JavaScript responses deliberately.

## Do

- Use POST for mutations.
- Validate before trusted work.
- Authenticate and authorize each private operation.
- Keep imports static and server implementation isolated.
- Return minimal DTOs and preserve Router control-flow errors.
- Rate-limit sensitive public-facing operations where appropriate.

## Don't

- Treat the generated RPC endpoint as private merely because its handler is
  server-side.
- Use server functions as a general public API.
- Return tokens, secrets, raw sessions, or raw database records.
- Dynamically import server-function wrappers.
- Treat `useServerFn` as a data-fetching state machine.
- End a server-function builder with `.server(...)`; current server functions
  terminate with `.handler(...)`.
- Replace actionable validation/authorization failures with one broad catch.
- Disable CSRF protection to make a request pass.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/streaming-data-from-server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/code-execution-patterns
- https://tanstack.com/start/latest/docs/framework/react/guide/authentication-server-primitives
