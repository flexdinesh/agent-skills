# Persistence and contested writes

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Put durable invariants where writers meet

Use database constraints for required uniqueness and references. An application
preflight can improve feedback, but competing writers still need enforcement.

```sql
CREATE UNIQUE INDEX invoice_number_per_account
ON invoices(account_id, invoice_number);
```

Translate only this expected constraint failure to "invoice number already used".
Do not translate a lost connection or disk error into a duplicate response.
Use the trusted account identity in every scoped query.

Keep several writes in one transaction only when partial completion is invalid.
An advisory lock does not make those writes atomic. Avoid remote calls while
holding SQL locks. Inspect whether ORM hooks use the same transaction.

Choose indexes from actual filtering and ordering. For SQLite, verify connection
foreign-key settings, contention handling and backup behavior. For PostgreSQL,
verify contested writes at the deployed isolation level. Sharing SQL syntax does
not establish equal concurrency behavior.

**Check:** simultaneous conflicting inserts produce one committed row; unrelated
database failures remain failures. A one-statement operation needs no transaction
framework around it.

## Operation-owned transactions

**Use:** partial completion of several database writes would violate an invariant.

**Do:** begin in the operation requiring atomicity. Pass the same transaction to
every participant. Helpers must not independently commit.

### Example

```text
issueInvoice:
  begin transaction
  insert invoice using tx
  insert required lines using tx
  insert required audit row using tx
  commit
```

If line insertion fails, none of these rows may remain. A hook using the pool
instead of `tx` escapes this guarantee. Email delivery and caller-object mutation
are outside SQL rollback.

If a transaction helper retries callbacks, recreate attempt-local state and keep
non-repeatable external effects outside the callback. Returning an ID assigned
before commit is not evidence that the operation succeeded.

**Check:** inject failure after the first write and query through a separate
connection. Verify no partial rows. For a guaranteed success response, commit first.

**Skip:** one atomic statement needs no unit-of-work framework. Independent writes
need not share a transaction; remote effects need their own recovery contract.

## Guarded state transitions

**Use:** two actors can observe the same eligible state, or a stale edit must fail.

**Do:** include the expected state/version in the authoritative write and inspect
its result. A prior read plus an unconditional update permits both actors to win.

### Example

```sql
UPDATE invitations SET used_at = CURRENT_TIMESTAMP
WHERE id = :id AND account_id = :account_id
  AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP;
```

Bind account identity from trusted authorization. One affected row wins; zero
means expired, consumed or inaccessible according to the public error contract.
If membership creation must succeed with consumption, include both in one
transaction. A consumed token alone does not prove the whole journey succeeded.

For editable records, use `WHERE version = :expected_version` and increment the
version. If locking instead, acquire the lock before reading/rechecking state used
to compute the mutation. Define what the losing caller does.

**Check:** race eligible contenders against the deployed database; exactly one
transition succeeds. Recheck mutable permission facts inside the chosen concurrency
boundary when required.

**Skip:** immutable data needs no transition protocol. A local mutex protects only
actors sharing it; it does not serialize writers in other processes.
