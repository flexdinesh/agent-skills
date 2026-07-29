# Data mutations, forms, databases, and TanStack Query

Choose the server boundary, cache owner, and mutation lifecycle together.

## Mutation path

```text
form/event
  -> validate client UX constraints
  -> POST Start server function
  -> runtime validation
  -> authenticate + authorize
  -> database transaction/mutation
  -> return minimal DTO
  -> invalidate/update the owning cache
  -> render success/error/focus state
```

Client validation improves feedback; server validation is mandatory.

## Forms

- Prefer semantic forms and progressive enhancement where practical.
- Prevent native submission only when intentionally handling the form in React.
- Disable or deduplicate repeated submissions.
- Preserve accessible labels, errors, pending state, and focus.
- Use stable field names and server-side runtime schemas.
- Never trust hidden inputs, return URLs, IDs, prices, roles, or tenant keys.

Do not copy tutorial handlers that omit `event.preventDefault()` while claiming
to handle submission entirely in React.

## Server functions for mutation

Use `createServerFn({ method: 'POST' })`, validate data, and authorize the
specific resource. GET must remain safe and free of mutation side effects so
preloading, crawlers, caches, and retries cannot change state.

Return a small result that the UI needs. Do not return the database entity by
default; explicitly select public fields.

## Database boundary

Database clients belong in `.server.*`, server-function handlers, or server
routes. Account for:

- Connection pooling/runtime compatibility.
- Transactions and concurrency.
- Tenant scoping and row/resource authorization.
- Migrations and schema version.
- Retries and idempotency.
- Unique constraints and conflict errors.
- Explicit DTO mapping.

JSON files and module-level arrays are educational storage only. They are racy,
process-local, often ephemeral/read-only on serverless platforms, and do not
scale horizontally.

## Router-owned data

After mutation, use Router invalidation when Router loaders own the data:

```tsx
const router = useRouter()
await updatePost({ data: input })
await router.invalidate()
```

Scope invalidation when possible. Await it when the submission should remain
pending until refreshed loader data is visible.

## Query-owned data

When TanStack Query owns server state:

- Define reusable query option factories.
- Warm the same request-scoped QueryClient in Router loaders.
- Use Query mutation state and invalidate/set the relevant query keys.
- For optimistic updates, cancel relevant queries, snapshot old data, update,
  roll back on error, and reconcile on settle.
- Avoid broad `cancelQueries()`/`invalidateQueries()` without filters.

Do not invalidate Router and Query reflexively. Update both only when both are
intentional consumers with separate responsibilities.

## Internal HTTP hops

A server-rendered loader calling an application HTTP URL can add deployment URL,
cookie, latency, and localhost problems. Prefer direct server functions for
same-application typed work unless exercising an HTTP contract is intentional.

## External APIs

- Keep private tokens inside a server boundary.
- Check `response.ok` and map upstream status deliberately.
- Apply timeout, retry, and rate-limit behavior suitable for the operation.
- Runtime-validate external JSON.
- Cache only when user/tenant variation and provider terms permit it.

## Do

- Use non-GET mutation methods.
- Validate and authorize at the server boundary.
- Use transactions/idempotency for multi-step or retried work.
- Pick one primary cache owner.
- Implement complete optimistic rollback.
- Return structured, client-safe failures.

## Don't

- Mutate through a preloaded route or GET loader.
- Use local files/in-memory arrays as production persistence.
- Trust TypeScript casts for network/database data.
- Build internal URLs from hardcoded localhost origins.
- Broadcast global invalidation for every mutation.
- Optimistically update without a rollback/reconciliation strategy.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/databases
- https://tanstack.com/router/latest/docs/framework/react/guide/data-mutations
- https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading
- https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-react-query
- https://tanstack.com/start/latest/docs/framework/react/examples/start-trellaux

