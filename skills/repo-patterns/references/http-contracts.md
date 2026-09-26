# HTTP contracts

Read when designing or auditing REST-style endpoints and their consumers.
Distinguish HTTP standards from API conventions and product requirements.

## `http-resource-semantics`

**Apply:** endpoint resources, methods, status, and transport/application separation.

**Problematic:** GET changes requested domain state; table layout defines public
resources; handlers own unrelated SQL/transaction/lifecycle behavior.

**Prefer:** model domain resources/workflows with consistent names and explicit
contracts. Handlers parse/validate, establish authorization, call application
behavior, and translate results. Keep domain/transaction decisions with their
owner. Small CRUD handlers may remain compact when these responsibilities are
still explicit.

Respect safe/idempotent method semantics: GET/HEAD are safe; PUT/DELETE are
idempotent in intended effect. Repeated DELETE responses can differ. POST can
create resources or execute commands and can be application-level idempotent.
Define PATCH media type/semantics, omitted/null behavior, and validation. Do not
treat all PATCH formats alike or require every workflow to be forced into CRUD.

**Exception:** a custom domain action can be clearer than an artificial resource.
Resource naming and pluralization are conventions, not evidence of HTTP correctness.
Incidental access logging does not make a GET semantically unsafe.

**Verify:** request parsing, content types, method behavior, body/status/headers,
repeat requests, and application calls. Preserve installed routing conventions.

## `http-authorization-errors`

**Apply:** endpoint access, writable/exposed fields, failures, or abuse potential.

**Problematic:** knowing an object ID grants access; clients set server-owned
fields; all failures return 200 or leak stack traces; body/work limits are absent.

**Prefer:** authorize function, object, and fields through the relevant principal.
Retain these checks in fixture profiles. Bound bodies, uploads, computational
work, and relevant request rates. Authentication and CORS do not establish object
permission. Public CORS policies can be legitimate; select them for actual clients.

For local browser-facing servers, define the bind address, allowed origins, and
mutation trust model explicitly. Loopback binding, CORS, and Origin/Fetch Metadata
checks solve different problems; none substitutes for required authentication.
Account for remote-dashboard clients, development proxies, requests without
browser headers, and explicit network exposure. Do not copy a dev proxy's header
rewrites into the production trust boundary.

Give errors stable machine-readable meaning and appropriate HTTP status.
RFC 9457 problem details (`application/problem+json`) is a useful new-API default;
preserve compatible established formats. Distinguish malformed/invalid input,
denied access, missing resources, conflicts, throttling, and server failures as
the contract requires. Avoid exposing unauthorized existence and sensitive details.

**Exception:** deliberate concealment may return the same outward result for
denied and missing resources. Expected domain outcomes may be represented as
successful results when the contract makes that meaning explicit.

**Verify:** unauthenticated/denied/object-crossing requests, unauthorized field
changes, malformed/oversized input, internal failure, and error serialization.
Do not classify a valid public CORS wildcard as a defect by itself.

## `http-bounded-lists`

**Apply:** collections, filters, sorting, search, or potentially growing results.

**Problematic:** arbitrary SQL sort text, unbounded page sizes, unstable ordering,
or a cursor from one query reused against different scope/filter parameters.

**Prefer:** cap work/page size and allowlist filters/sorts. Define ordering with
a tie-breaker and consistency behavior during mutation. Choose cursor/keyset
pagination for large/changing data where it fits; retain offsets for bounded
datasets/page navigation when appropriate. Treat cursors as opaque API contracts;
validate their shape/scope and still apply authorization on each request.

**Exception:** small truly bounded collections may need no pagination.
Offset pagination is not automatically a bug, and a cursor is not a promise of
snapshot consistency. Do not require expensive exact counts where unnecessary.

**Verify:** empty/end pages, max limits, invalid cursors, duplicate sort values,
changed filters, unauthorized scope, and documented behavior during insertion/deletion.

## `http-mutation-recovery`

**Apply:** duplicate/retried commands, concurrent edits, or long-running work.

**Problematic:** a timed-out POST is blindly retried and creates two orders;
two editors overwrite each other; returning 202 hides a job with no status surface.

**Prefer:** define duplicate/retry behavior. For retry-sensitive creates/commands,
use idempotency keys or an equivalent operation identity with authorized principal
and operation scope, payload matching, concurrent handling, retention, and durable
results as needed. Persist the key/result consistently with the mutation. Do not
rely on a process-local map for cross-replica or post-crash duplicate prevention.

Use conditional writes or ETag/If-Match when lost updates matter. Define conflict
recovery so callers can refresh/reconcile. For async work, expose operation status,
completion/failure, and cancellation where supported. A timeout does not establish
that the original operation failed; provide a way to reconcile uncertain outcomes.

**Exception:** a naturally idempotent operation may need no additional key store.
Simple fast work needs no async job API. Last-write-wins is valid when explicit
and acceptable to the product. Do not add idempotency storage to every request.

**Verify:** simultaneous duplicates, same key/different payload, timeout after
commit, retry after restart, stale updates, and job failures. Verify real storage
where durable idempotency is promised, alongside fixture cases for fast development.

## `http-contract-evolution`

**Apply:** shared APIs, generated clients, mocks, or changes affecting consumers.

**Problematic:** docs and fixtures describe a different API; adding a required
field breaks old clients; generated types are the only behavior evidence.

**Prefer:** one authoritative contract (OpenAPI, code-first generation, or another
appropriate mechanism) and repeatable generation. Document representative inputs,
outputs, errors, auth, pagination, and retry behavior. Verify the actual handler
against the contract and relevant client/provider expectations.

Generated TypeScript types are compile-time evidence, not runtime validation.
Parse untrusted responses at the client boundary where malformed/version-skewed
data matters; contract-generated validators can avoid handwritten shape drift.
Choose unknown-field/enum handling deliberately: strict response validators can
reject additive provider changes. Test the deployed provider/artifact through
the real client, including errors; successful code generation alone is insufficient.

Check source, wire, and semantic compatibility. New enum values depend on client
unknown-value handling; new required inputs are not ordinarily additive-compatible.
Coordinate rollout with real consumers. Use versioning/deprecation for actual
breaking changes, not every internal schema iteration. Keep contract/fixture
ownership explicit between server and frontend.

**Exception:** a small private API can use focused documented contracts and tests
without a generated SDK or broker. Uniform deployment can reduce compatibility
requirements but should be verified rather than assumed.

**Verify:** actual request/response shapes and behavior, old-client cases, generated
output drift, fixture agreement, and denied/error paths. A schema check alone
cannot prove domain behavior or permission.

## Sources

- [RFC 9110 HTTP semantics](https://httpwg.org/specs/rfc9110.html)
- [RFC 9457 problem details](https://www.rfc-editor.org/rfc/rfc9457.html)
- [Google resource-oriented design](https://google.aip.dev/121)
- [Google custom methods](https://google.aip.dev/136)
- [Google pagination](https://google.aip.dev/158)
- [Google compatibility](https://google.aip.dev/180)
- [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests)
- [OpenAPI specification](https://spec.openapis.org/oas/latest.html)
- [OWASP object-level authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [Pact contract testing](https://docs.pact.io/)
- [Tokeninsights generated-validator client boundary](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/web/src/api.ts)
- [Servediff binary/client conformance](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/test/conformance/server.test.ts)

Resource naming, error defaults, and pagination choices are contextual API policies.
Google and Stripe document their conventions; only applicable protocol requirements
should be treated as standards.
