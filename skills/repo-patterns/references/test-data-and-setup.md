# Test data and setup

Read when preparing application examples, tests, demos, or development servers.
Use alongside [independent runs and fixtures](independent-runs-and-fixtures.md)
for composition, fidelity, configuration, and resource isolation. Follow existing
framework conventions; these rules require no particular fixture library or tree.

## `fixture-data-ownership`

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

## `fixture-container-infrastructure`

**Apply:** requested verification or a controlled development run needs a
disposable database, cache, broker, or another containerizable service.

**Problematic:** every test acquires Docker dependencies; a builder starts a DB;
tests assume `localhost:5432`; a globally shared container is called isolated;
CI inherits persistent local reuse and passes against stale state.

**Prefer:** when real-service verification is needed, infrastructure tooling is
unresolved, and a supported container runtime is available, prefer Testcontainers.
Retain established Compose, CI service containers, or another supported disposable
setup when it satisfies fidelity, isolation, and lifecycle requirements. Absence
of Testcontainers alone is not a defect or permission to migrate tooling.

The runner fixture owns provisioning, readiness, discovered endpoints, and cleanup.
Keep imports in test/development support and dependencies in the owning package or
Go module; shipped application code needs only normal service configuration.
Builders/scenarios remain pure; loaders use ordinary clients and actual migrations.
Share support only for real consumers, without a mandatory infrastructure package.

Prefer supported service modules. Select explicit image versions/digests matching
the relevant production engine/version, extensions, and configuration; avoid
`latest`. Use the library's host/mapped-port or connection-URI APIs, including for
remote runtimes. Bound readiness waits using appropriate health/protocol checks;
a running container or open port alone need not establish service readiness.

Choose per-test, suite, or worker scope according to required isolation and measured
startup cost. Sharing a service within one run is distinct from persistent reuse
across runs. Follow [setup lifecycle](#fixture-setup-lifecycle) for record isolation,
retry, and reset rules; server-wide state can require separate containers. Do not
force global setup or assume a container per test is always too expensive.

Keep automatic resource cleanup enabled where supported and register explicit
runner cleanup promptly, including failed setup. Runtime exceptions need another
owned cleanup mechanism. Persistent reuse is an explicit local optimization with
documented reset/cleanup; do not enable it in CI. Report startup failures and useful
container logs without secrets; never silently fall back to a fake service.

Illustrative PostgreSQL helpers, adapted to the installed module/runner versions.
The caller supplies an explicit image and the repository's normal migration
function; these helpers do not define schema or load a demo dataset.

Go test helper; later client/worker cleanup registrations run before the container's
`t.Cleanup`. The setup deadline below is illustrative, not a suite-wide budget:

```go
package testsupport

import (
	"context"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
)

func postgresURL(t *testing.T, image string, migrate func(context.Context, string) error) string {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
	defer cancel()
	container, err := postgres.Run(ctx, image, postgres.BasicWaitStrategies())
	testcontainers.CleanupContainer(t, container)
	if err != nil {
		t.Fatal(err)
	}
	url, err := container.ConnectionString(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if err := migrate(ctx, url); err != nil {
		t.Fatal(err)
	}
	return url
}
```

Node/TypeScript callback helper; invoke and await it inside the installed runner's
test/fixture lifecycle. The callbacks own and close clients/children before they
return or reject. Set migration/test deadlines through their actual APIs/runner:

```ts
import { PostgreSqlContainer } from "@testcontainers/postgresql";

async function withPostgres<T>(
  image: string,
  migrate: (url: string) => Promise<void>,
  run: (url: string) => Promise<T>,
): Promise<T> {
  const container = await new PostgreSqlContainer(image)
    .withStartupTimeout(90_000)
    .start();
  try {
    const url = container.getConnectionUri();
    await migrate(url);
    return await run(url);
  } finally {
    await container.stop();
  }
}
```

Arrange minimal builder-produced records through the normal loader/client after
migration; exercise the actual application/storage operation and assert independent
expected results. A helper successfully starting PostgreSQL proves no application
behavior. For shared Node global setup, pass serializable endpoint configuration
through the runner's supported channel; do not assume workers share its globals.

**Exception:** pure/file-only tests need no container. Embedded engines such as
SQLite usually use the actual driver and isolated temporary files. Unavailable
runtimes can limit verification; report that limit. Containerized cloud emulators
remain substitutes and do not prove managed-service parity. A development runner
may use Testcontainers, but ordinary `dev` need not acquire that requirement.

**Verify:** relevant behavior with the actual engine and migrations, clean create
and representative upgrade, setup failure cleanup, and independent concurrent runs
using discovered endpoints. Check CI reuse settings, runtime/image prerequisites,
timeout failures, and teardown ordering. Distinguish runnable examples and proposed
evaluations from executed container tests or measured performance improvements.

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
- [Testcontainers real-database tests](https://testcontainers.com/guides/getting-started-with-testcontainers-for-go/)
- [Testcontainers Go PostgreSQL module](https://golang.testcontainers.org/modules/postgres/)
- [Testcontainers Go runner cleanup](https://golang.testcontainers.org/features/creating_container/)
- [Testcontainers Node PostgreSQL module](https://node.testcontainers.org/modules/postgresql/)
- [Testcontainers Node global setup and sharing](https://node.testcontainers.org/quickstart/global-setup/)
- [Testcontainers Node wait strategies](https://node.testcontainers.org/features/wait-strategies/)
- [Testcontainers Node runtimes](https://node.testcontainers.org/supported-container-runtimes/)
- [Testcontainers Node persistent reuse](https://node.testcontainers.org/features/containers/#reusing-a-container)
- [GitHub Actions service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/use-docker-service-containers)

Ownership, scenario reuse, reset safeguards, conditional container/tool choices,
command fallbacks, and verification obligations are skill policies synthesized
from these practices, not universal framework requirements.
