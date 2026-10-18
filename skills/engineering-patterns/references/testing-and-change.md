# Verification, migrations and refactoring

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Test where the claimed guarantee is enforced

Choose the smallest test that can falsify the intended behavior:

| Claim | Useful check | Insufficient evidence |
| --- | --- | --- |
| Failed invoice issue leaves no partial rows | Real database; fail line insertion | Mock says rollback called |
| Invitation is single-use | Concurrent calls against actual engine | Two sequential happy-path tests |
| Job retries after handler failure | Real selected worker/queue contract | Mocked `perform` throws |
| UI ignores old-account responses | Resolve old request after switching account | Assert cancellation called |
| Process loss is recoverable | Abrupt stop at a defined effect boundary | Graceful shutdown alone |

Use unit tests for calculations and local state transitions. Substitute clocks or
external clients when their actual implementation does not decide the claim.

**Check:** assertions inspect outcomes, persisted state or user-visible recovery.
Record what ran, what passed/failed and what remained mocked or blocked. Retain a
correct failing regression expectation when it exposes a real defect.

**Exception:** a reversible wording or local display change needs proportionate
verification, not a new integration environment.

## Preserve the operation before changing its structure

Before extracting `issueInvoice`, trace its permission check, transaction, error
mapping and callers. Move one coherent operation; preserve its public behavior.
Do not replace the ORM or reorganize every folder to match an example.

For a persisted-field rename with old workers still running:

```text
1. Add the new field; deploy code compatible with both versions.
2. Backfill in bounded batches; concurrent writes follow a defined compatibility rule.
3. Switch readers/writers after verifying all active versions and backfill results.
4. Remove old support only after the rollback/compatibility window closes.
```

Specify which writer owns each field during overlap. Two independent write paths
without precedence can silently diverge. Reversing the code deployment does not
automatically reverse transformed data.

**Check:** old/new versions coexist where promised; interrupted backfill resumes;
authorization, conflicts and rollback behavior remain correct after extraction.

**Exception:** a single-user offline tool may stop, back up, migrate and restart.
Use that simpler procedure when the allowed downtime and restore process suffice.

## Semantic boundary verification

**Use:** a claim depends on storage, a protocol or a specific failure window.

**Do:** test the invariant at the component that enforces it. Keep unrelated
dependencies substituted so the test remains focused.

### Example

```text
Claim: at most one invitation consumption can commit.
Setup: real configured SQL engine; one unexpired invitation.
Action: release two independent connections to consume it concurrently.
Assert: one winner, one defined loser, one membership in persisted state.
```

Do not assert only that the code called `begin`, `update` and `commit`. Those calls
can all occur in an incorrect read-then-write implementation. A separate test can
inject failure creating membership and verify rollback.

**Check:** tests can fail when the guarded predicate is removed. State which
engine/configuration ran and which dependencies were mocked. A graceful close
does not simulate abrupt process loss, and process loss does not simulate power loss.

**Skip:** pure rules need fast unit tests. A wording fix needs a wording check.
Do not expand verification just to produce more test counts.
