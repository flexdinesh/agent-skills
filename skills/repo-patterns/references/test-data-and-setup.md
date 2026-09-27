# Test data and setup

**Read when:** preparing test/dev data, builders, seeds, mocks, per-test state, or setup/teardown.

**Policy status:** Fixture ownership, fidelity, and reset policies; no mandatory fixture library or directory tree.

## `fixture-data-ownership`

**Own reusable data definitions.**

**Apply:** data is used outside normal live application operation.

**Problematic:** UI mocks and backend seeds describe different orders; tests rely
on a developer's populated DB; a global test-data package imports private server
models into browser code; sample customers are embedded in production migrations.

**Prefer:** distinguish these roles, even when a small app keeps them in one file:

| Role | Responsibility |
| --- | --- |
| Fixture | Small fixed value or source-format file, including intentional invalid input |
| Builder/factory | Fresh typed values with explicit defaults and relevant variations |
| Scenario | Named related data and external behavior for a meaningful state |
| Loader/seed | Materialize a selected scenario in a specific store |
| Mock handler | Translate a scenario into an external protocol response/interaction |
| Runner fixture | Own setup, readiness, scope, and teardown for a test or worker |

Colocate definitions with their feature or consumed contract. Extract shared data
support only for actual consumers. Reuse a scenario across tests, dev, and demos
when its meaning matches; use separate mappings for domain, wire, and storage
contracts where they differ. Browser consumers import only browser-safe data and
handlers; DB loaders stay server-side. Application runtime code must not depend
on test runners or factory libraries to function normally.

Use synthetic data by default. Commit only needed fields and small assets; no
credentials, captured authentication state, or raw production/customer dumps.
Exceptional sanitized captures need an explicit review and retention policy;
removing names alone does not establish anonymization.

Keep required durable reference data in its owned migration/bootstrap path.
Development examples belong in optional scenarios. Tests needing reference data
use the normal reference-data initialization, then add their specific records.

**Exception:** framework-native YAML/JSON fixtures and local inline literals are
fine. A one-off test need not share its setup with a demo. Large performance data
can be generated separately with explicit size/distribution; keep it out of ordinary
dev/test defaults.

**Verify:** trace each consumer to its authoritative definition; inspect browser
imports, committed data, and production initialization. Check related records and
relevant wire schemas; follow `fixture-fidelity` for semantic/provider evidence.

## `fixture-builders`

**Build fresh minimal values.**

**Apply:** multiple tests/scenarios construct related values or need variations.

**Problematic:** a giant default object hides why a test passes; global sequences
depend on test order; random status/date values occasionally change the assertion;
a factory silently persists records and creates unrelated dependencies.

**Prefer:** use a small typed function or established factory with valid minimal
defaults. Make behavior-critical fields explicit at the call site. Return fresh
nested objects/collections on each call; separate building values from creating
persistent state. Name useful variants by domain meaning, such as `overdueInvoice`,
rather than fixture numbers. Compose relationships explicitly and return handles
to created records instead of making callers depend on magic IDs or whole-DB counts.

Illustrative pure builder; caller supplies identity so isolation is explicit:

```ts
interface InvoiceInput {
  readonly id: string;
  readonly status: "open" | "paid";
  readonly lines: readonly { readonly amountMinor: number }[];
}

function buildInvoice(
  id: string,
  status: InvoiceInput["status"] = "open",
): InvoiceInput {
  return { id, status, lines: [{ amountMinor: 1200 }] };
}

const paidInvoice = buildInvoice("case-paid-invoice", "paid");
```

Keep assertion-relevant values fixed. Faker is optional for incidental variety or
bulk data: use a scoped generator, explicit seed and reference date where needed,
and pinned dependency versions. A seed alone does not fix relative dates, changed
generator versions, or generation order. Give IDs a run/test namespace; deterministic
values need not be globally identical across concurrent runs. Report the seed and
scenario for randomized failures. Do not replace security randomness in live code.

For parser/validation tests, keep malformed raw inputs or explicit invalid variants
at that boundary; do not bypass types to fabricate impossible typed domain values.
Keep expected results independently specified: a builder or production serializer
used for setup must not also compute the only oracle for the behavior under test.

**Exception:** a small static regression file can be clearer than a builder.
Property-based tests intentionally generate varied inputs and should retain the
runner's replay/shrinking evidence, rather than fixing every test to one case.

**Verify:** two calls cannot mutate each other's nested state; relevant values and
relationships are readable at the test site. Reproduce seeded failures under the
documented clock/version; verify invalid inputs are rejected at the intended boundary.

## `fixture-setup-lifecycle`

**Own setup, reset, and teardown.**

**Apply:** tests or dev servers require prepared mutable state.

**Problematic:** every test loads a demo DB; rollback wraps only the test connection
while an HTTP server commits through another; reload silently resets edits; reset
accepts an arbitrary DB URL because `NODE_ENV=test` or `localhost` is set.

**Prefer:** use the smallest setup that preserves the behavior being tested:

| Use | Setup and boundary |
| --- | --- |
| Unit/domain | Inline data or pure builders; no DB required |
| Component/browser with mocked API | Shared contract handlers, per-test overrides and fresh handler state; proves client behavior |
| Storage integration | Production-family engine and normal migrations; seed only needed records; proves real persistence behavior |
| API/end-to-end | Owned backend data through application/API setup where practical; direct DB preparation for unrelated prerequisites is valid |
| Dev server/demo | Explicit named scenario/profile; preparation completes before readiness; separate repeatable reset |
| Importer/parser | Small source-format fixtures through the actual import/parse path |

Do not prepare away the action being tested: a signup test exercises signup, while
an invoice test can create its prerequisite account directly. Low-level storage
tests may insert rows deliberately to exercise DB constraints. Keep separate
provider/real-service checks where mocks substitute external contracts.

Scope mutable records to each test, including retries; reuse an expensive service
per worker/run only with independent record namespaces or reliable restoration.
Browser context isolation does not isolate backend state. Use transactions for
cleanup only when all relevant work participates and the test does not need real
commit/concurrency semantics; otherwise use isolated DBs/schemas or bounded cleanup.
Register cleanup as resources are acquired, including partial setup failure. Close
owned clients/children before deleting state; retain useful failure diagnostics.

Provision disposable state in order: provision/resolve owned service → verify
target and await service readiness → migrate → load selected scenario → start
application → await application readiness. Omit inapplicable stages, such as an
application server for storage-only tests. Keep ordinary startup/reload from
implicitly resetting or reseeding populated state. An explicit fixture runner can
automate first-time preparation for its own disposable instance. Stop application
workers/children and close clients before removing their owned infrastructure.

Document seed semantics: idempotent upsert of scenario-owned records, fresh-store
only (reject populated targets), or another explicit repeat policy. Upsert alone
need not remove extras or restore every mutable field; do not call it a full reset.
Provide explicit reset/recreate when developers need the original scenario.
Validate resource ownership and disposable identity before destructive work;
environment flags, hostname, or name prefixes alone are insufficient. Restrict
credentials/targets where possible; refuse connected/shared/production resources.
Do not expose an unrestricted seed/reset endpoint in the deployed application.

For HTTP mocks, activate before initial requests. Reset per-test overrides and
mutable handler state separately; resetting handlers alone does not clear a custom
store. Fail on unexpected requests to mocked services, with explicit allowances
for intended traffic. Avoid mutable global handlers shared by concurrent tests.

Document the selected scenario, seed/time inputs, prerequisites, target identity,
command arguments, readiness, cleanup, and what each profile proves in the canonical
development guide. Retain existing command names; where undecided and applicable,
`dev:fixtures`, `db:seed`, and `db:reset` are useful distinct contracts.

**Exception:** immutable baseline data can be shared. Framework-managed transactional
fixtures are appropriate when their isolation matches the test. A serialized shared
service may be unavoidable; document that limit rather than promising independence.

**Verify:** clean setup with normal migrations; repeated seed per its contract;
explicit reset restores the scenario; reload preserves edits. Run affected tests
alone, in different order, on retry, and concurrently where supported. Check that
failure cleanup works and reset refuses an unowned target before any mutation.

## `fixture-fidelity`

**Verify substitutes against real contracts.**

**Apply:** mocks/fakes stand in for SQL, HTTP, or another external contract.

**Problematic:** a map-backed fake is the only test of SQL uniqueness/transactions;
mock API responses compile but disagree with provider serialization/errors.

**Prefer:** test domain behavior quickly through controlled seams; test constraints,
queries, locks, and transactions against the actual database family and migrations.
Testcontainers or another disposable instance is suitable; see
[container infrastructure](containers.md#fixture-container-infrastructure)
for selection and runner ownership. Schema-validate fixture responses and verify
representative cases against the provider. Consumer/provider contract tests may
suffice; a Pact broker is not mandatory.

For browser fixtures, MSW can intercept real HTTP client calls across development,
component tests, and demos. Keep mock activation explicit and production-safe.
Share handlers where contracts match; avoid branching inside every component.

**Exception:** a fake is useful evidence for the contract it actually implements;
it need not perfectly emulate the database. Some I/O cannot run locally; document
the substitution and retain separate real integration checks.

**Verify:** compare fake/provider success, errors, nullability, ordering, and mutation
behavior. Run relevant real-engine tests. A schema-compatible response does not
establish authorization, business semantics, or transactional correctness.

## Sources

- [Rails named fixtures](https://guides.rubyonrails.org/testing.html#fixtures)
- [Django setup and transaction test behavior](https://docs.djangoproject.com/en/5.2/topics/testing/tools/#testcase)
- [Faker reproducibility and object factories](https://fakerjs.dev/guide/usage.html)
- [MSW handler organization](https://mswjs.io/docs/best-practices/structuring-handlers/)
- [MSW test lifecycle](https://mswjs.io/docs/integrations/node/)
- [Playwright test/worker fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright backend data isolation](https://playwright.dev/docs/test-parallel#avoiding-shared-state-in-parallel-tests)
- [Playwright API setup and cleanup](https://playwright.dev/docs/api-testing)
- [Supabase migration-before-seed workflow](https://supabase.com/docs/guides/local-development/seeding-your-database)
- [MSW reusable request mocking](https://mswjs.io/docs/)
- [Pact contracts](https://docs.pact.io/)
- [Playwright parallel isolation](https://playwright.dev/docs/test-parallel)
