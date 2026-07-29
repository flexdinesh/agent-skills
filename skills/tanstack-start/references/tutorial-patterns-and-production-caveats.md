# Tutorial patterns and production caveats

The tutorials teach boundaries and data flow. They are not production reference
architectures and contain shortcuts that must be corrected.

## Reading and Writing a File

- Page: https://tanstack.com/start/latest/docs/framework/react/tutorial/reading-writing-file
- Official docs source:
  https://github.com/TanStack/router/blob/main/docs/start/framework/react/tutorial/reading-writing-file.md
- Companion app: https://github.com/shrutikapoor08/devjokes

### Durable pattern

```text
Router route loader
  -> Start GET server function
  -> Node-only file read
  -> Route.useLoaderData

React form
  -> Start POST server function
  -> validated write
  -> await router.invalidate()
  -> loader-owned UI refreshes
```

This correctly demonstrates that Router owns route loading/invalidation while
Start owns the server boundary.

### Production corrections

- JSON/file persistence is teaching-only: read-modify-write is racy, lacks
  transactions/locking, is not horizontally shared, and is commonly
  immutable/ephemeral on serverless/edge.
- Runtime-validate parsed file data; a TypeScript cast is not validation.
- Authorize reads/writes when data is private.
- Use a deliberate form submit event and `preventDefault()` when handling
  submission in React.
- Keep validation details actionable rather than replacing everything with one
  generic catch.
- Prefer a database/object store for durable multi-instance deployment.
- Scope Router invalidation as the route tree grows.
- Correct relative tutorial imports with real aliases/project paths.

## Fetching Data from External API

- Page: https://tanstack.com/start/latest/docs/framework/react/tutorial/fetching-external-api
- Official docs source:
  https://github.com/TanStack/router/blob/main/docs/start/framework/react/tutorial/fetching-external-api.md
- Companion app: https://github.com/shrutikapoor08/tanstack-start-movies

### Durable pattern

```text
Router loader
  -> Start server function
  -> authenticated external fetch with server-only token
  -> typed/validated DTO
  -> Route.useLoaderData
```

Choose TanStack Query when the data needs background refresh, shared caching,
pagination/infinite behavior, or mutation state.

### Production corrections

- Loaders are isomorphic; secrecy comes from `createServerFn`, not from being
  declared in a route.
- Runtime-validate the upstream JSON and check `response.ok`.
- Configure timeouts, cancellation/retries, rate limits, and cache semantics.
- A caught `{ movies: [], error }` result bypasses Router's route error boundary;
  choose that result union intentionally.
- A blocking awaited loader resolves before the component renders, so an
  in-component “Loading” branch is not the route pending strategy.
- An ordinary loader is request/navigation-time, not build-time unless
  prerendering is configured.
- Keep `.env` ignored and deploy the token through the platform secret store.

## Tutorial authority rules

- Use current guides/types to correct tutorial code.
- Record the tutorial's learning goal separately from production advice.
- Do not normalize contradictory scaffold commands without checking the current
  CLI.
- Do not promote companion repositories above official current docs.
- Recheck every tutorial after `/latest/` or its companion repository changes.

