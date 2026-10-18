# Architecture and boundaries

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Choose the smallest topology that meets the requirement

Start an ordinary application with one deployable and one appropriate database.
Add a component only after naming the requirement it satisfies.

| Situation | Start with | Escalate when |
| --- | --- | --- |
| Solo expense tracker | One process, SQLite, direct calls | Concurrent writers or recovery requirements exceed this deployment |
| SaaS invoice export | Modular API plus worker role, shared SQL authority | Exports exceed request budgets or need independent capacity |
| Independently operated processing service | Explicit protocol and separately owned state | Isolation or deployment independence is required |

Example: slow PDF generation justifies a bounded worker. It does not by itself
justify separate customer, invoice and payment services.

Before adding a broker, cache or service, record its state owner, failure behavior,
operational owner and removal/migration cost. For performance-driven changes, record
the measurement; binding isolation requirements can justify a component immediately.

**Check:** every proposed deployment has a present responsibility and a recovery plan.
An existing supported platform can be cheaper than a new local substitute.

## Group code by changes that belong together

Keep an operation's rules and transaction participation discoverable. Preserve a
working layout unless a demonstrated dependency or ownership problem requires change.

```text
billing/
  issue-invoice     validates items and commits invoice + lines
  invoice-query     owns list/detail queries
http/
  invoice-handler   decodes input and maps operation outcomes
main               creates database/client resources and wires handlers
```

This is an example, not a mandatory directory tree. A short operation can remain
one file. Extract `issueInvoice` when both HTTP and a scheduled job need its rules;
have both call it directly instead of making the job call the local HTTP endpoint.

Share a money-rounding rule when consumers require identical semantics. Keep two
small label-formatting helpers separate when they change for different audiences.
Do not collect unrelated helpers in `common` merely to avoid duplication.

**Check:** trace a new caller without duplicating authorization, transaction logic
or infrastructure construction. Cheap stateless values can still be created locally.

## Introduce a contract for a real capability

Keep a concrete dependency when it is understandable and serves the operation.
An interface earns its cost when it isolates behavior, a dependency or a real
substitution. One implementation can still justify such a boundary.

```go
// A report needs this capability, not a generic CRUD framework.
type InvoiceReader interface {
    FindOverdue(ctx context.Context, before time.Time) ([]Invoice, error)
}
```

Specify whether results are tenant-scoped, how cancellation works and what errors
mean. An interface listing every database method hides little. A `SaveInvoice`
method that commits internally cannot silently participate in another transaction.

Map a database record to a public response when removing secrets or preserving a
wire contract. Avoid three identical DTO copies between a handler and its operation.
Use optional capabilities only with a tested fallback and equivalent public behavior.

**Check:** callers can use every promised method; alternate implementations preserve
the required semantics. Do not report concrete dependencies as defects by themselves.
