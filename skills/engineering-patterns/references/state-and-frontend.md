# Client state and derived data

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Separate saved state, drafts and request lifetimes

Use the existing loader/query/store for server data. Keep an unsaved title with
its editor; retain it when saving fails. Do not mirror every cached entity into
another global store.

```text
Load account A -> user switches to B -> B renders -> A response arrives late
Required result: A cannot populate B's view or cache.
```

Include identity in cache keys. Cancel obsolete work and guard result publication
by the current request/identity; cancellation alone may arrive too late.

```ts
const request = ++sequence;
try {
  const data = await loadAccount(accountId, signal);
  if (request === sequence && !signal.aborted) publish(data);
} catch (error: unknown) {
  if (request === sequence && !signal.aborted) showLoadError(error);
}
```

The state owner increments `sequence` on cancellation or identity change, even
when no replacement fetch starts. Guard loading-state cleanup by the same identity.

For optimistic rename, send the expected version. On conflict, retain the draft
and fetch authoritative state. A failed older mutation must not undo a newer save.
If that recovery is costly and latency acceptable, wait for success before updating.

On socket reconnect, replay from a cursor or refetch a snapshot. A connected or
synchronized collaboration provider does not prove database persistence. Keep
"connected", "pending save" and "saved" meanings distinct.

**Check:** late response, save failure, conflicting edit, logout/account switch,
and missed notification. Use ordinary local fetch state for an isolated read; do
not add a cache framework solely for this guidance.

## State authority and projections

**Use:** the same entity has a server record, cache, user draft or generated output.

**Do:** name the authority and recovery rule for each representation. Derived
records need an invalidation/rebuild rule; drafts need preservation and conflict rules.

### Example

| State | Owner | Recovery |
| --- | --- | --- |
| Saved title/version | Server document operation | Fetch authoritative record |
| Unsaved title | Active editor | Retain on failed save; reconcile conflict |
| Search index | Index worker | Rebuild from saved documents |
| Thumbnail | Media worker | Recompute from original; reconcile orphan files |

An omitted field in a narrow query is unknown, not false. Load membership/status
facts before an authorization decision. A machine-generated caption must not
overwrite a user override unless that overwrite is explicitly requested.

**Check:** rebuild derived state; miss a notification then reconnect; rerun extraction
after user edits. Ensure the original/override remains authoritative. Database
cascades do not delete external files automatically.

**Skip:** a small record can be read in full with component-local state. Do not add
CQRS, a normalized global store or a collaboration protocol without a need.
