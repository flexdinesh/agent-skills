# Distributed ownership and acknowledgment

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## State what success proves and reject stale owners

Write the acknowledgment contract before selecting replication or messaging tools:

```text
Publication accepted: committed at the configured broker boundary.
Job acknowledged: required business state committed in the sink.
External action complete: provider confirmed under its own contract.
```

These are separate milestones. Include storage/sync settings, surviving-failure
assumptions, retention and ordering scope. A broker deduplication window does not
make a downstream charge occur once.

When ownership moves, an old worker may resume. Gate its authoritative write:

```sql
UPDATE jobs SET state = 'done'
WHERE id = :id AND state = 'running' AND generation = :claimed_generation;
```

The current generation must be advanced atomically on reassignment; inspect the
affected-row count. This fences that database write, not an external provider.
Use provider idempotency or reconciliation for that effect.

**Check:** pause owner A, reassign to B, then resume A. A must fail the protected
write. Test ordering across retry/reassignment when per-key order matters.

**Exception:** one local owner may need only a mutex or sequential loop. Use existing
replicated infrastructure when required; do not build consensus for ordinary CRUD.
