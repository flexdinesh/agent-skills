# Repeated requests and retained outcomes

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Scoped idempotency

**Use:** a lost response can make a caller repeat a consequential command.

**Do:** define the operation key, identity scope, payload-match policy, retained
result, in-progress outcome and expiry. Enforce the key in shared durable state.

### Example

```text
Unique key: (account_id, operation_name, client_request_id)
Receipt: payload_hash, completed_result, expiry
One transaction: arbitrate receipt key + create invoice + retain result
Retry with same key/payload: return retained result
Same key/different payload: conflict
```

Concurrent contenders must resolve the unique-key conflict before applying a
second effect. If the conflict aborts the transaction, roll it back before reading
the winner's receipt. A separate preflight lookup is insufficient. The client reuses
its key after timeout. Two intentional identical purchases require different keys.

Define behavior after expiry; do not promise replay forever when receipts are
pruned. Queue job IDs retained for minutes cannot enforce permanent business
uniqueness. External effects need idempotency at their own boundary.

**Check:** simultaneous duplicates, changed payload, timeout after commit, restart,
and retry beyond retention. Only expected uniqueness violations become duplicates.

**Skip:** a naturally repeatable replacement may need no receipt. Content identity
and command identity differ; hashing a payload is not always a business key.
