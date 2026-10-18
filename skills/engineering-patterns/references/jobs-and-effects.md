# Background work and external effects

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Move work off the request only for a concrete need

Generate a small CSV synchronously if it fits the request budget. Queue a large
export when it needs independent capacity, scheduling or restart recovery.

```text
POST export -> commit export request + required work intent -> accepted(jobId)
worker      -> claim -> generate artifact -> record ready(url) -> acknowledge
```

Define each state separately. `accepted` is not `ready`; a handler returning
success does not prove its requested file was written. Specify where intent lives,
who retries, which failures retry, and the terminal outcome.

Limit active workers and queued admission separately. Four replicas with eight
workers can run 32 jobs; a per-worker setting does not enforce a provider-wide
limit of ten requests. Shared quotas need a shared admission owner.

Keep a disposable UI hint best effort when the client can refetch. Required emails,
payments or exports need an explicit lost-handoff and duplicate policy.

**Check:** interrupt a worker after the effect but before acknowledgment. Verify
the documented repeat/reconciliation behavior and that terminal failures stay visible.

## Durable intent and commit effects

**Use:** committed state must eventually cause work in another system.

**Do:** store required work intent with the originating state. Supply a dispatcher,
claim/reclaim policy and reconciliation; an audit row by itself is not a dispatcher.

### Example

```text
transaction: insert invoice + insert email_intent -> commit
worker:      claim intent -> send email -> record completion
```

After-commit publication alone can be lost between commit and enqueue. Durable
intent closes that gap, but a crash after sending and before completion can send
again. Use the provider's stable idempotency key, lookup/reconciliation, or an
explicit duplicate-tolerant contract.

For a file move, record intent before changing disk; update the authoritative path
after success; clear intent last. Recovery must handle old-only, new-only, both,
and neither file existing. Name who actually retries outstanding intent.

**Check:** interrupt at each boundary, restart, and inspect state plus effects.
Do not mock a missing file's `stat` as successful when testing missing-file recovery.

**Skip:** a disposable UI notification can run after commit and recover through
refetch. A direct local operation needs no outbox.

## Explicit retry outcomes

**Use:** a worker or client may repeat failed work.

**Do:** inspect what the selected queue treats as failure. Define one retry owner,
retryable errors, delay, attempt/age budget and terminal outcome per boundary.

### Example

```text
Wrong: worker catches send error, logs it, returns normally
       queue marks callback complete; required email is lost

Correct: classify error
         transient -> report failure through the queue's supported retry contract
         permanent -> record terminal failure; acknowledge under that policy
         ambiguous provider outcome -> reconcile or retry with stable identity
```

Do not just rethrow every error: the provider may have completed the effect before
the connection failed. Do not retry in both an inner client loop and outer worker
without a combined bound. A retry limit does not create a dead-letter destination.

**Check:** use the actual queue adapter to verify rejection, delayed retry, terminal
record retention and successful completion. Assert business state, not only an
event called `JobSuccess`.

**Skip:** invalid input or denied permission usually needs correction, not retry.
A disposable hint can fail once when loss is part of its contract.
