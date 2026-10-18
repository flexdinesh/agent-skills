# Business data modeling

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Start with operations and ownership

Before defining tables, write three operations and their invariants:

```text
Create project: belongs to exactly one workspace.
Add task: belongs to a project in that same workspace.
Issue invoice: preserves agreed prices even if the product changes.
```

For each entity specify identity, owner, cardinality, lifecycle, uniqueness scope,
and deletion behavior. Distinguish `workspace_id` (owner) from `created_by`
(actor). Deactivating an employee must not delete the workspace's projects.
Treat a customer or employee as a business record that can exist without login.
Link it to a user only when the relationship exists; do not require fake users.

Use stable primary keys and separate business identifiers with scoped uniqueness,
such as `UNIQUE(workspace_id, invoice_number)`. Choose the project's existing ID
scheme unless distribution or ordering requirements justify changing it.

## Enforce relationships, including tenant boundaries

For a shared relational database, put the tenant key on scoped records when it
supports isolation and query paths. Derive it from validated membership/context.
Enforce consistency across relationships:

```sql
CREATE TABLE projects (
  id bigint PRIMARY KEY,
  workspace_id bigint NOT NULL REFERENCES workspaces(id),
  UNIQUE (workspace_id, id)
);
CREATE TABLE tasks (
  id bigint PRIMARY KEY,
  workspace_id bigint NOT NULL,
  project_id bigint NOT NULL,
  FOREIGN KEY (workspace_id, project_id)
    REFERENCES projects(workspace_id, id)
);
```

The composite foreign key rejects a task claiming workspace A while referencing
workspace B's project. It does not authorize the caller. Nullable relationship
columns need deliberate semantics; nulls can bypass a foreign-key match.
See [constraint semantics](https://www.postgresql.org/docs/current/ddl-constraints.html).

Represent many-to-many relationships with a join record and unique pair, adding
fields such as `joined_at` when the relationship has its own lifecycle. Prefer
real foreign keys over generic `(entity_type, entity_id)` references when referential
integrity matters. Separate tenant databases are another isolation choice; use
them for concrete requirements that justify provisioning and migration costs.

## Store facts deliberately

| Situation | Concrete modeling choice |
| --- | --- |
| Customer changes address | Keep current address on customer; snapshot billing address on issued invoice |
| Price or quantity | Exact decimal or integer minor units with currency/unit and explicit rounding; avoid binary float |
| Event versus appointment | Store event instant; preserve local time and named zone when future scheduling needs them |
| Optional field | Define null as unknown, absent, or inapplicable; never substitute zero without that meaning |
| Repeated structured facts | Use related rows; reserve JSON for bounded metadata with validation and a version |
| Fast dashboard totals | Keep a rebuildable projection with a defined freshness contract |

Start with normalized authoritative facts. Duplicate deliberately for immutable
snapshots or measured read needs, naming the owner and refresh rule. Do not add
event sourcing, universal entity tables, or history on every field by default.

## Define lifecycle and prove invariants

Specify draft-to-issued transitions, immutable fields, and correction operations.
For deletion choose cascade for disposable dependents, restrict for required
history, or explicit anonymization. Soft deletion needs query filtering, uniqueness
and restore rules; it does not erase data. An audit log records actor, action,
target and time without copying credentials; it is not automatically restorable history.

**Check:** reject cross-tenant relationships and concurrent duplicate business keys;
retain invoice snapshots after edits; verify deletion and restore behavior. Test
constraints on the deployed engine and index actual filters, joins and ordering.

**Skip:** single-owner applications need no invented workspace hierarchy. Keep
simple CRUD simple until operations require richer states or history.
