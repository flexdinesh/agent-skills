# Users, identities and authentication

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Separate the application user from how they sign in

For an application supporting multiple login methods:

```text
users(id, display_name, status)
login_identities(id, user_id -> users, issuer, subject,
                 UNIQUE(issuer, subject))
user_emails(id, user_id -> users, address, verified_at)
sessions(id, user_id -> users, expires_at, revoked_at)

user 42 <- identity (issuer A, subject 123)
        <- identity (issuer B, subject 789)
```

Use an immutable local user ID in business relationships. For OpenID Connect,
map validated `(iss, sub)` to the user; email and display name are mutable claims,
not stable identity keys. The same person can have different subjects across
clients or providers. Never infer that two accounts are the same person from
matching names or email alone. See [OIDC claim stability](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability).

Decide whether users are global across workspaces or isolated within a tenant's
identity realm. For tenant-local users, include the trusted realm in identity
mapping and uniqueness. Do not accidentally merge customers' user populations.
If email is a login identifier, explicitly define normalization, uniqueness scope,
verification, and change handling. Verification establishes control at that time.

## Make linking, unlinking and recovery explicit operations

Link a new identity only after authenticating the current account and proving
control of the identity being added. Reject an identity already bound elsewhere;
serialize competing links with the unique constraint. This prevents matching-email
sign-in from silently claiming an existing account. See [account-linking precautions](https://auth0.com/docs/manage-users/user-accounts/user-account-linking).

Before unlinking, ensure an approved sign-in or recovery route remains. Account
merging is a separate operation: resolve business ownership and memberships,
retain attribution, and audit the change. Do not merge just by rewriting identity
foreign keys. Single-use recovery tokens need expiration, guarded consumption and
an explicit session-revocation policy.

**Check:** same email from different issuers stays separate; concurrent linking has
one winner; changing email preserves business ownership; recovery cannot attach
an attacker's identity or bypass disabled-user policy.

## Keep authentication state out of profiles

Use the installed authentication framework/provider for protocol validation and
credential storage. Validate token signature, issuer, audience, expiry and required
flow checks before trusting claims. An arbitrary decoded JWT is not authentication.
OAuth access to an API does not itself define an application login contract.

If credentials are local, keep password verifiers, passkey credential records and
recovery secrets in dedicated protected storage. Use maintained password hashing
and passkey libraries. Never store plaintext passwords or put credential material
in profile responses or audit payloads. API clients need dedicated service
principals with scoped, expiring/revocable credentials; do not impersonate employees.

Give sessions expiration and revocation semantics. Rotate session identifiers
after authentication or privilege changes, and invalidate server-side sessions
according to the logout/security policy. Use protected cookies for browser
sessions and appropriate CSRF protection. See [session lifecycle guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

Define how disabling a user or changing credentials affects existing sessions.
A signed token can remain valid until expiration unless the system checks
revocation or current state. Test the promised enforcement delay.

**Skip:** provider-managed authentication does not require copying credentials or
sessions into the application's database. Model only state the application owns;
a local-only application may need no authentication tables at all.
