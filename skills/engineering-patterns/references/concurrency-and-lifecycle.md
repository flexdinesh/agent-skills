# Capacity, ownership and shutdown

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Give resources and shutdown a named owner

The startup path creates the database pool, listeners and workers. Shutdown uses
the reverse dependency order, with an explicit bound:

```text
mark unready -> stop new requests/claims -> finish or cancel active work
            -> close clients/pools -> exit before the deployment deadline
```

Keep resources available while their users drain. A worker that cannot finish
must leave recoverable work according to its claim protocol. Hard termination
still requires duplicate-safe effects; graceful shutdown does not prove crash safety.

Log operation identity, attempt and failure stage without credentials. Measure
oldest queued work and terminal failures, not only "handler returned" counts.

For a containerized SQLite app, verify the mounted data survives replacement and
restore a database-consistent backup into a clean instance. A volume is not a backup.
Readiness means this role can serve its promised work; a running process is weaker.

**Check:** stop during an active operation and restore after abrupt termination.
Choose checks proportional to the deployment. A small CLI can use lexical cleanup
and `defer`/`finally` instead of a lifecycle framework.

## Bounded resources and owned lifecycle

**Use:** producers can outrun consumers or asynchronous work outlives one call.

**Do:** bound queued work and active work, identify the counted resource, and choose
the overload response. Count bytes when item sizes vary materially.

### Example

```text
Image processing:
  admission: queued bytes/age within budget, otherwise reject or defer
  execution: worker slots derived from peak decoded memory and CPU budget
  network:   per-call deadline
  stop:      reject new claims, settle/cancel active work, close dependencies
```

Do not start one promise/goroutine per file and call a semaphore inside each if
the collection itself can be huge. Use bounded intake with a fixed pool. Per-worker
limits multiply with replicas; enforce global quotas where they are shared.
Do not wait while holding the lock another worker needs to finish.

**Check:** exceed admission, stall a consumer, cancel work and stop twice. Pending
memory remains bounded under the specified workload; resources eventually close.

**Skip:** naturally bounded synchronous work may need only its request deadline.
Choose thresholds from the workload; the example prescribes no universal numbers.

## Asynchronous data ownership

**Use:** deferred work reads data that another actor can mutate or recycle.

**Do:** capture the smallest coherent payload, identity and provenance before
yielding. Transfer ownership or copy mutable data; define who releases it.

### Example

```go
// The parser reuses frame after this call; queued work needs owned bytes.
owned := append([]byte(nil), frame...)
err := queue.Enqueue(ctx, owned)
// Queue contract: successful enqueue transfers ownership; rejection retains it.
```

The queue still needs admission bounds. For document export, capture content,
revision and author together before awaiting I/O. Reading "current author" after
the await can attribute an older snapshot to a later edit.

When save revision 7 completes after revision 8 is edited, mark only 7 persisted.
Keep 8 dirty. On failure, reconstruct attempt-local state instead of retrying with
mutations from the failed attempt; SQL rollback does not restore heap objects.

**Check:** delay the consumer, mutate/reuse the original, then let it run. It receives
the intended snapshot and metadata. An older completion cannot clear newer work.

**Skip:** immutable, exclusively owned values need no extra copy. Add pooling only
when measured allocation cost justifies its lifetime complexity.
