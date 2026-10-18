# Memberships and authorization models

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Scope roles to the relationship they describe

For a workspace application, a user can belong to several workspaces with
different roles:

```text
workspaces(id, name)
memberships(workspace_id -> workspaces, user_id -> users, role, status,
            PRIMARY KEY(workspace_id, user_id))

Alice: workspace A owner; workspace B viewer
Bob:   workspace A editor; no access to workspace B
```

Do not put `is_admin` on users to express workspace authority. If platform-wide
administration exists, model it separately with explicit operations and auditing.
Constrain role/status values. A fixed role enum or checked value plus a permission
map is enough when the product has a few stable roles. Add role/permission tables
only when custom roles or multiple assignments are real requirements.

Keep invitations separate from active membership. Bind invitation consumption to
the intended recipient, tenant and role; validate expiry and single use. Create
membership and consume the invitation atomically. Removing the last active owner
needs a transaction/concurrency rule if an owner must always remain.

## Choose the smallest model that expresses access

| Requirement | Model and example |
| --- | --- |
| Personal records | Ownership: `document.owner_user_id == caller.id` |
| Stable team capabilities | RBAC: workspace editor can create documents |
| Per-resource sharing | Relationship/grant: user or group may view project 7 |
| Context-dependent restriction | ABAC: editor may update only draft invoices in their region |

Combine these when necessary: an editor role supplies a capability, while the
resource's workspace and state constrain it. Adding a role per document creates
unnecessary role proliferation. For sharing, use concrete grant tables such as
`project_user_grants(project_id, user_id, permission)` with foreign keys and unique
grants. Add group relationships when needed. General relationship tuples and a
policy engine require explicit traversal, consistency and revocation contracts.
See [authorization model guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## Authorize the actual operation and resource

```text
updateDocument(caller, workspaceId, documentId):
  require active caller and active membership in workspaceId
  load document using both workspaceId and documentId
  require membership permits document.update and document state permits editing
  allow only writable fields; perform guarded update
```

A tenant ID in a URL or header selects context; it does not prove membership.
Deny when required facts are absent. Enforce authorization on list queries,
exports, bulk mutations and downloads as well as single-record endpoints.
Client-visible abilities only guide UI. Recheck mutable permission facts within
the mutation's concurrency boundary when the contract requires it.

Database row-level security can reinforce tenant filtering. Verify the runtime
role and policies: table owners typically bypass PostgreSQL RLS, as do privileged
roles. Test using the actual application role and ensure connection context
cannot leak between requests. See [row security behavior](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

## Specify revocation and delegated work

Do not treat a role copied into a long-lived token or cache as permanently current.
Define invalidation or a bounded stale-access window. Background work must specify
whether it executes under a recorded authorization decision or rechecks the
initiator's current access; use a scoped service principal where appropriate.
Record actor and effective principal for delegation without granting implicit access.

**Check:** same user has different roles across tenants; guessed IDs and mixed-tenant
bulk requests fail; removed memberships lose access within the promised interval;
two concurrent owner removals cannot violate the last-owner invariant.

**Skip:** a personal app with ownership checks needs no organization/role hierarchy.
