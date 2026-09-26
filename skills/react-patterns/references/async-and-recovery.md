# Async and recovery

Read when fetching data, saving drafts, performing mutations, or placing loading
and failure boundaries. Assume external work can reject, return bad data, finish
late, or complete after navigation.

## `async-failure-owner`

**Apply:** every async read/action has an explicit owner for rejection and recovery.

**Problematic:** a floating promise rejects without handling; `catch` only logs
while pending stays true; HTTP failures are treated as successful fetches; an error
is swallowed and replaced with misleading empty data.

**Prefer:** let the established query/loader/action owner manage pending, success,
and failure, or model those states explicitly. Validate HTTP status and parse
untrusted payloads at the I/O boundary. Show a useful error and retry path. Clear
pending on every applicable settlement; preserve recoverable drafts on failure.

A helper may propagate rejection to a documented caller; every layer need not
catch and rethrow. `void promise` alone does not handle rejection. Catch values
can be non-Errors; normalize without unsafe assertions and retain diagnostic
context through the repository's error/reporting seam.

**Exception:** intentional cancellation can be non-error UI, but classify it
deliberately. Expected missing data is not automatically a failed operation.

**Verify:** network rejection, non-2xx status, invalid payloads, and retry cannot
leave a stuck spinner, erase input, or display false success. UI messages should
be actionable and avoid exposing raw internal diagnostics.

## `async-stale-results`

**Apply:** inputs change or owners unmount while a request is pending.

**Problematic:** slow request A resolves after B and replaces B's data; A's
`finally` clears B's pending status; previous entity data renders under a new ID.

**Prefer:** use the existing cache/loader cancellation and query-key mechanisms.
If manual fetching is required, combine ownership keys with cancellation or a
generation guard. Guard success, failure, and pending updates, not just success.
Cancellation alone cannot undo server work.

The following fallback example uses a typed loader seam and a keyed request
boundary. Prefer the repository's data library when one exists. The loader owns
HTTP checks and payload parsing.

```tsx
import { useEffect, useState } from 'react'

interface Project {
  id: string
  title: string
}
type LoadProject = (id: string, signal: AbortSignal) => Promise<Project>
type ProjectResult =
  | { status: 'loading' }
  | { status: 'success'; project: Project }
  | { status: 'error'; error: Error }
interface ProjectViewProps {
  projectId: string
  loadProject: LoadProject
}

function useProjectResult(projectId: string, loadProject: LoadProject) {
  const [result, setResult] = useState<ProjectResult>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const project = await loadProject(projectId, controller.signal)
        if (!controller.signal.aborted) {
          setResult({ status: 'success', project })
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          const error = cause instanceof Error
            ? cause
            : new Error('Unable to load project', { cause })
          setResult({ status: 'error', error })
        }
      }
    }
    void load() // load catches rejection; void is not the error handler.
    return () => controller.abort()
  }, [projectId, loadProject])

  return result
}

function ProjectRequest({ projectId, loadProject }: ProjectViewProps) {
  const result = useProjectResult(projectId, loadProject)
  if (result.status === 'loading') return <p role="status">Loading project</p>
  if (result.status === 'error') return <p role="alert">Unable to load project</p>
  return <h1>{result.project.title}</h1>
}

export function ProjectView({ projectId, loadProject }: ProjectViewProps) {
  return <ProjectRequest key={projectId} projectId={projectId}
    loadProject={loadProject} />
}
```

Use a stable loader seam for this owner's lifetime; defining it inline at each
render restarts the effect. The keyed boundary is essential: each selected entity
gets fresh result state, even when switching A -> B -> A before B settles. Keep
editable drafts outside this request boundary unless resetting them is intended.

This minimal example demonstrates read ownership, not caching or recovery UI.
Provide retry through the existing data owner, or an explicit request-version key
that remounts only this read boundary for same-ID retry/refresh. Do not reuse the
local hook with changing IDs without its ownership/reset contract. `Error` cause
requires a supported runtime/TypeScript lib; adapt diagnostics for older targets.

**Exception:** stale-while-revalidate UI is valid when intentionally keyed and
identified as stale. Not every request supports abort; ignore stale settlements
when cancellation is unavailable or ignored by the dependency.

**Verify:** start A then B; resolve or reject them in both orders. B stays current;
A cannot clear B's pending/error state. Unmount with a pending request and settle
it. Confirm entity changes never render the wrong entity as current.

## `async-mutation-safety`

**Apply:** an interaction writes data, especially if repeat submission matters.

**Problematic:** optimistic UI never rolls back; retries repeat a non-idempotent
operation; an older save clears a newer dirty draft; disabling one button is the
only protection against multiple submit paths.

**Prefer:** put mutation ownership in one action/library contract. Capture the
submitted draft/version and choose how newer edits behave. Guard concurrent
activation when duplicate writes would be unsafe, including keyboard and other
controls. Use server-supported idempotency when appropriate. On settlement,
reconcile/invalidate the actual cache owner; roll back optimistic changes or
present explicit reconciliation without overwriting unrelated newer changes.

**Exception:** concurrent mutations can be intentional when independent or
correctly ordered. Retrying safe reads differs from retrying writes. Aborting the
client request does not prove a server mutation was canceled.

**Verify:** rejection, rapid repeated activation, alternate submit controls,
out-of-order saves, retry, and editing while saving follow the chosen contract.

## `boundary-recovery`

**Apply:** decide which failures should replace a subtree and what stays usable.

**Problematic:** one chart failure blanks the entire app; every tiny component
has its own meaningless fallback; a network catch assumes an error boundary will
see it; retry resets the boundary but leaves failed query/lazy data unchanged.

**Prefer:** an application fallback plus page/route and independent feature
boundaries where useful. Position a boundary above providers when their failure
must be caught. Keep surrounding navigation usable when feasible. Fallbacks
explain the failure, offer a meaningful action, and report diagnostics through
the established seam. Reset both boundary and underlying failure owner as needed.

Error boundaries catch descendant rendering failures, not ordinary event-handler
or asynchronous callback failures, their own failures, or SSR generally. Use the
installed framework's server/route failure mechanism. Supported React transition
and framework/query APIs can route some errors into boundaries; verify their
actual contract instead of assuming all async rejection is caught.

Use Suspense for supported suspended work and loading presentation. It does not
detect ordinary effect/event fetching or handle errors by itself. For lazy-load
rejection, boundary reset alone may not retry React's cached rejected loader;
follow a supported recovery strategy and avoid reload loops. Prefer existing
boundary implementations; a custom class boundary is valid where needed.

**Exception:** a single root boundary can be enough for a small app; expected form
validation failures normally belong inline. Do not wrap every component.

**Verify:** throw from a descendant, fail a loader/mutation, and exercise recovery.
The intended fallback appears, unrelated UI remains usable, and retry actually
retries the failed owner. Check reset on navigation and fallback failure handling.

## Sources

- [MDN: Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [React: useEffect, fetching and races](https://react.dev/reference/react/useEffect#fetching-data-with-effects)
- [React: Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React: Suspense](https://react.dev/reference/react/Suspense)
- [React: lazy](https://react.dev/reference/react/lazy)
- [react-error-boundary: README](https://github.com/bvaughn/react-error-boundary)
