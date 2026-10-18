# Domain, API and authorization

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Make legal states explicit when they change behavior

Use records and functions for simple CRUD. Use explicit states when callers must
distinguish legal transitions, retryable failure or partial completion.

```ts
type ExportState =
  | { kind: "queued" }
  | { kind: "running"; attempt: number }
  | { kind: "ready"; downloadUrl: string }
  | { kind: "failed"; reason: string };
```

This prevents a ready result without a URL in typed application code. It does not
prevent two workers from completing the same export. Enforce contested transitions
in the database or other state owner, then check whether the write succeeded.

Put `issueInvoice` rules where both its records and dependencies are visible. Do
not move every rule into an entity class solely to create a rich domain model.
Separate calculating a total from charging an external payment provider.

**Check:** invalid transitions fail with a defined outcome; retrying a failed attempt
does not retain partial in-memory changes. Decode persisted/external state at the
boundary; static types alone do not validate stored JSON.

## Expose an operation outcome, not an internal object

For a rename endpoint: parse the body, get account identity from authentication,
authorize the document, perform the guarded update, then map the result.

```text
Malformed title       -> invalid input
Wrong account         -> denied or deliberately hidden as absent
Stale expectedVersion -> conflict; client must reconcile
Database unavailable  -> dependency failure, with private diagnostics
Committed rename     -> saved title and new version
```

Use the project's established wire error format. A client needs stable meanings,
not raw SQL messages. Generated types do not replace runtime parsing.

A timeout after commit leaves the caller uncertain. For consequential retried
commands, retain an operation identity/result or expose status lookup. For reads,
a deadline and ordinary retry policy may suffice.

Return `accepted` only after the promised acceptance boundary. If work continues
durably after request cancellation, expose that fact through operation status.

**Check:** malformed input, denied access, stale version and dependency failure
remain distinguishable where the public contract allows it. Existing clients
continue to understand the response after internal refactoring.

## Authorization and disclosure contracts

**Use:** actions or output differ by caller, owner, tenant or privilege.

**Do:** authenticate the caller, authorize the specific effect against required
state, then independently choose fields allowed to leave the boundary.

### Example

```text
Internal account: id, email, passwordHash, disabled, providerToken
Public profile:   id, displayName
Profile update:   authenticated caller + allowed account + permitted fields
```

An authenticated request does not authorize an arbitrary account ID. A serializer
that strips credentials does not authorize the mutation. Allowlist outbound fields
when a privileged object contains secrets. Client-visible abilities only guide UI.

For long-lived connections, define when permission changes take effect: per-message
checks, bounded revalidation, or invalidation with an explicit failure policy.
Pub/sub alone cannot guarantee immediate revocation through a partition.

**Check:** cross-account access, revoked membership, omitted permission facts, and
secret-free output. Recheck mutable permission state within the mutation's concurrency
boundary when required by the contract.

**Skip:** three straightforward ownership rules need no general policy engine.
Use existing project authentication and error conventions.
