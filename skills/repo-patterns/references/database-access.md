# Database access

Read when writing queries, choosing transaction scope, tuning access, or coupling
database changes to remote effects. Adapt engine-specific guidance to the repo.

## `db-values-and-constraints`

**Apply:** application-controlled queries and persistent invariants.

**Problematic:** user input is interpolated into SQL; a pre-insert existence check
is the only uniqueness protection; object lookup ignores the authorized tenant.

**Prefer:** parameterize values. Allowlist/map dynamic identifiers and sort
expressions; placeholders do not represent arbitrary SQL syntax. Enforce appropriate
uniqueness, foreign keys, nullability, and checks in storage. Preserve authorized
scope on every applicable query, including joins, updates, and deletes; derive
scope from trusted authorization rather than a client-supplied tenant claim.

Use named domain/query operations where they make scope and intent clearer.
Adapters should translate storage errors into meaningful application results
without leaking raw SQL/schema details to public clients.

**Exception:** a static query needs no artificial parameter. Cross-tenant/admin
operations can be valid with explicit authorization. Some invariants span rows
or services and need transactional/application coordination beyond constraints.

**Verify:** malicious values, invalid references, concurrent duplicate inserts,
denied cross-owner operations, and documented constraint error translation. Use
the actual engine; fake stores cannot prove these semantics.

## `db-transaction-concurrency`

**Apply:** multi-query atomic work, concurrent updates, or retryable failures.

**Problematic:** one query uses the transaction while another uses the base pool;
read-then-write loses an update; a retry repeats an already-sent remote payment.

**Prefer:** give the atomic operation one transaction owner. Pass the same
transaction-bound client through participating queries and check commit errors.
Choose conditional writes, version checks, locking, or isolation for the actual
invariant. Keep transactions short and avoid waiting for remote work while holding
locks unless that coupling is deliberately required.

An illustrative optimistic write, after validating the transition and principal:

```sql
UPDATE orders
SET status = $1, version = version + 1
WHERE id = $2 AND tenant_id = $3 AND version = $4;
```

Inspect affected rows. Zero rows can mean stale version, absent object, or denied
scope; distinguish only as authorization permits. Do not report success by default.

Classify failures. Retry known serialization/deadlock failures by rerunning the
whole transaction with bounded attempts and appropriate backoff. Do not blindly
retry permanent errors or uncertain commits; reconcile ambiguous outcomes through
idempotency/status where necessary. Keep external side effects safe across attempts.

**Exception:** one atomic statement may need no explicit multi-query transaction.
Serializable isolation or row locks are not mandatory for every operation. An
intentional cross-owner transaction can be appropriate within a modular monolith.

**Verify:** rollback after intermediate failure, commit failure, simultaneous writes,
expected conflict handling, retry bounds, and external effect duplication. Exercise
real connections and relevant isolation rather than only mocked client calls.

## `db-query-pool-budget`

**Apply:** query growth, list endpoints, repeated access, or connection pressure.

**Problematic:** one query per list item; unbounded reads; one pool per request;
an index is added without checking its query; every sequential scan is a finding.

**Prefer:** bounded results and deliberate projection. Batch/join repeated access
where semantics match. Reuse owned pools, release resources, and tune only with
workload/budget evidence. At scale account for replicas, workers, and dev instances.
Observe query plans with representative parameters/data; choose indexes for actual
predicates, joins, ordering, and write costs. Postgres foreign keys do not
automatically index referencing columns; evaluate those indexes deliberately.

`EXPLAIN ANALYZE` executes the statement, including mutations. Use appropriately
isolated data and account for side effects; it is not inherently a read-only audit.

**Exception:** defaults can be sufficient, especially for small Go programs.
A sequential scan can be optimal on a small/selective-cost table. Bounded N+1
access can be acceptable when measurement and requirements justify it.

**Verify:** query count/workload, plans, relevant latency, pool wait/exhaustion, and
resource release. Report measured evidence; indexes and pooling do not guarantee
a fixed speedup.

## `db-durable-effects`

**Apply:** a successful DB change must reliably cause a remote event or operation.

**Problematic:** commit then publish loses events on crash; publish then commit
announces a rolled-back change; repeated delivery repeats a charge.

**Prefer:** where durable delivery is required, persist event intent with the
domain change in the same transaction and dispatch through a controlled worker
(outbox or equivalent). Track completion/retry and make consumers idempotent.
Define ordering only where the domain needs it. An outbox does not make delivery
exactly once or atomically commit a remote service.

**Exception:** best-effort telemetry may not need durable delivery. Pure database
CRUD needs no queue/outbox. Use an existing reliable mechanism rather than adding
an event platform to satisfy an architectural label.

**Verify:** crash before/after commit and publish, repeated delivery, worker retry,
and recovery from backlog. Check observability of stuck/failed work and ensure
fixtures can exercise the worker without live third-party credentials.

## Sources

- [Go SQL injection avoidance](https://go.dev/doc/database/sql-injection)
- [Postgres constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Go transactions](https://go.dev/doc/database/execute-transactions)
- [sqlc transaction binding](https://docs.sqlc.dev/en/latest/howto/transactions.html)
- [Postgres isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Postgres locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Go connection pools](https://go.dev/doc/database/manage-connections)
- [Postgres EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [OWASP object-level authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
