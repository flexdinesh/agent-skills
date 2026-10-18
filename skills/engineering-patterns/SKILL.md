---
name: engineering-patterns
description: "Example-driven architecture, data modeling, identity, authorization, persistence, API, background-work, state and reliability guidance. Use only when explicitly invoked as engineering-patterns or $engineering-patterns."
---

# Engineering Patterns

Manual invocation only. Follow the requested action; a bare invocation means a
read-only audit. Project instructions and established contracts take precedence.

## Load on demand

Initially load this catalog only. Identify the affected operation, then select
the smallest relevant set, usually one to three references. Read those files
before applying their guidance; paths are relative to this skill.

Read independent selections concurrently when supported. Add references only when
tracing exposes another concern. Do not preload the directory, recursively load
related topics, or select by technologies elsewhere in the repository. For a broad
audit, inspect connected operations in batches and track coverage.

## Catalog

| Decision or symptom | Reference |
| --- | --- |
| Deployments, modules, interfaces, shared helpers | [Architecture](references/architecture.md) |
| Entities, relationships, tenant ownership, history, deletion | [Data modeling](references/data-modeling.md) |
| Users, login identities, account linking, credentials, sessions | [Identity and authentication](references/identity-and-authentication.md) |
| Memberships, roles, resource sharing, permission revocation | [Authorization models](references/authorization-models.md) |
| Business states, endpoints, permissions, secret-free responses | [Domain and API](references/domain-and-api.md) |
| Related writes, uniqueness, concurrent edits | [Transactions](references/transactions.md) |
| Jobs, emails, file effects, enqueue gaps, retry outcomes | [Jobs and effects](references/jobs-and-effects.md) |
| Retried commands, lost replies, duplicate effects | [Idempotency](references/idempotency.md) |
| Worker limits, mutable buffers, cancellation, shutdown | [Concurrency and lifecycle](references/concurrency-and-lifecycle.md) |
| Drafts, stale responses, optimistic edits, derived data | [State and frontend](references/state-and-frontend.md) |
| Replication, stale owners, acknowledgment guarantees | [Distributed systems](references/distributed-systems.md) |
| Slow queries, caching, batching, pooling | [Performance](references/performance.md) |
| Verification, schema migration, structural refactoring | [Testing and change](references/testing-and-change.md) |

Examples: duplicate invoices load transactions + idempotency. Stale account data
loads state/frontend, adding domain/API if permissions are affected. A new local
tool starts with architecture. A SaaS schema starts with data modeling; add identity
and authorization when designing sign-in or access control.

## Apply

Trace the actual owner, invariant and failure window. Apply instructions, examples,
checks and exceptions together. Examples are adaptable sketches. Preserve working
conventions; make the smallest coherent change. Use no TypeScript `any`, type
assertions or non-null assertions.

Verify affected behavior. Report changes or supported findings, coverage, checks
actually run and material limits. Never invent measurements or successful tests.
