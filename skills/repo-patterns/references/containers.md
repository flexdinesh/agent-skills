# Disposable container infrastructure

**Read when:** real-service tests or controlled development need a disposable database, cache, or broker.

**Policy status:** Testcontainers is a conditional fallback. Preserve suitable Compose or CI services; this reference does not prescribe production images.

## `fixture-container-infrastructure`

**Own disposable services.**

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
across runs. Follow [setup lifecycle](test-data-and-setup.md#fixture-setup-lifecycle) for record isolation,
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

- [Testcontainers real-database tests](https://testcontainers.com/guides/getting-started-with-testcontainers-for-go/)
- [Testcontainers Go PostgreSQL module](https://golang.testcontainers.org/modules/postgres/)
- [Testcontainers Go runner cleanup](https://golang.testcontainers.org/features/creating_container/)
- [Testcontainers Node PostgreSQL module](https://node.testcontainers.org/modules/postgresql/)
- [Testcontainers Node global setup and sharing](https://node.testcontainers.org/quickstart/global-setup/)
- [Testcontainers Node wait strategies](https://node.testcontainers.org/features/wait-strategies/)
- [Testcontainers Node runtimes](https://node.testcontainers.org/supported-container-runtimes/)
- [Testcontainers Node persistent reuse](https://node.testcontainers.org/features/containers/#reusing-a-container)
- [GitHub Actions service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/use-docker-service-containers)
- [Testcontainers Go/Postgres](https://testcontainers.com/guides/getting-started-with-testcontainers-for-go/)
- [Compose project names](https://docs.docker.com/compose/how-tos/project-name/)
