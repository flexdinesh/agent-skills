# Independent runs and fixtures

Read when running a part without the full product, substituting external I/O,
designing config, or making tests/development reproducible.

## `runtime-composition`

**Apply:** an executable creates I/O dependencies or a test needs replacements.

**Problematic:** importing a command opens a live DB before fixture config is
parsed; domain operations repeatedly branch on `fixtureMode`.

**Prefer:** entry points parse config, construct dependencies, start the application,
and own cleanup. Pass dependencies to a constructible application/service; select
live, local, or fake adapters there. Keep validation, authorization, and domain
behavior in the same path. Ordinary functions/constructors suffice; do not require
a DI framework or interfaces around every operation.

For a CLI, separate parsing/process exit from command execution with explicit
options, dependencies, streams, and an observable result. An illustrative typed
seam, usable with a real or fixture source:

```ts
interface ImportOptions {
  readonly path: string;
}

interface RecordSource {
  read(path: string): Promise<readonly string[]>;
}

interface Output {
  write(message: string): void;
}

async function runImport(
  options: ImportOptions,
  source: RecordSource,
  output: Output,
): Promise<number> {
  const records = await source.read(options.path);
  output.write(`${records.length} records\n`);
  return 0;
}
```

The outer entry point handles rejection, stderr, and exit status; libraries do
not terminate the process. A fake implements the actual consumed contract.

**Exception:** pure/file-only programs need no alternate storage adapter. A
framework can own composition if it permits controlled construction and lifecycle.

**Verify:** construct/import without live credentials; exercise fixture and live
composition, expected failure reporting, exit status, and resource cleanup.

## `runtime-config`

**Apply:** executables read config, env, flags, paths, or credentials.

**Problematic:** packages read env independently; relative paths change with cwd;
a misspelled requested fixture silently selects a live DB.

**Prefer:** load and validate one resolved config at startup. Document precedence,
for example defaults → config file → env → explicit flags, and path resolution
(config-relative or working-directory-relative). Separate fixture profile selection
from data location. Fail on missing explicitly requested files or malformed values.
Keep deploy-specific secrets out of committed config and public web settings.

Normal execution should select its documented dependencies; fixture execution is
explicit. Never fall back to fake data on live failure. Log mode/endpoint identity
without secrets, and retain normal authorization checks in fixture profiles.

**Exception:** follow an established compatible precedence rather than breaking
it to match the example. Embedded read-only assets can be legitimate defaults.

**Verify:** defaults, precedence, missing files, invalid env/flags, and documented
relative paths. Verify production composition cannot accidentally select local
fixture resets or a fake authentication bypass.

## `fixture-scenarios`

**Apply:** an app, server, worker, or CLI depends on data/external behavior.

**Problematic:** starting one part requires the full product and production
credentials; a huge shared seed only covers success and tests mutate its input.

**Prefer:** document a bounded independent run per relevant executable: command,
prerequisites, config, scenario, dependencies, readiness/output, and stop/reset
behavior. Independent runs may require a disposable database or a local stub.
Use small synthetic scenarios named by behavior: typical, empty, invalid,
unauthorized, conflict, timeout, recovery. Add cases relevant to real behavior.
Keep immutable fixtures separate from per-run mutable state; control time/IDs only
where reproducibility requires it. Keep security randomness secure.

Useful profiles, only where needed:

| Profile | Dependencies | Proves |
| --- | --- | --- |
| Fast fixtures | Data files / in-memory state; fake unrelated remote services | Application behavior and fast development |
| Real persistence | Production-family engine, migrations, then seed; controlled remote I/O | Actual storage behavior |
| Connected dev | Explicit development service endpoints | Selected integration behavior |

**Exception:** a pure library needs fixtures/tests rather than a dev server.
A file importer can run on sample files without a database/container profile.

**Verify:** use the documented path from a clean checkout with listed prerequisites.
Check a representative operation plus relevant failure/recovery and reset behavior.
Record dependencies and limits; do not call a fake-only run database integration.

## `fixture-fidelity`

**Apply:** mocks/fakes stand in for SQL, HTTP, or another external contract.

**Problematic:** a map-backed fake is the only test of SQL uniqueness/transactions;
mock API responses compile but disagree with provider serialization/errors.

**Prefer:** test domain behavior quickly through controlled seams; test constraints,
queries, locks, and transactions against the actual database family and migrations.
Testcontainers or another disposable instance is suitable. Schema-validate fixture
responses and verify representative cases against the provider. Consumer/provider
contract tests may suffice; a Pact broker is not mandatory.

For browser fixtures, MSW can intercept real HTTP client calls across development,
component tests, and demos. Keep mock activation explicit and production-safe.
Share handlers where contracts match; avoid branching inside every component.

**Exception:** a fake is useful evidence for the contract it actually implements;
it need not perfectly emulate the database. Some I/O cannot run locally; document
the substitution and retain separate real integration checks.

**Verify:** compare fake/provider success, errors, nullability, ordering, and mutation
behavior. Run relevant real-engine tests. A schema-compatible response does not
establish authorization, business semantics, or transactional correctness.

## `runtime-isolation`

**Apply:** multiple tests, worktrees, contributors, or agents run mutable fixtures.

**Problematic:** two API instances use the same seed DB, fixed ports, queue names,
output files, and reset command; one test needs another test's side effects.

**Prefer:** isolate mutable state by worktree/run/worker. Namespace DBs or schemas,
Compose projects, queues, caches, temp/output paths, and fixture copies. Allocate
or configure ports and report bound addresses. Own setup/readiness/cleanup; reset
only the explicitly selected disposable resources. Isolation within a shared
schema also needs correct privileges/search paths where applicable.

**Exception:** intentional read-only resources can be shared. If an integration
environment must be shared and serialized, document it and avoid claiming parallel
independence. Worktree isolation alone does not isolate runtime resources.

**Verify:** run two instances concurrently, mutate/reset one, and check the other's
data/output remains intact. Test independent order, interruption cleanup, and
protection against resetting a connected/shared database.

## Sources

- [Ports and adapters](https://alistair.cockburn.us/hexagonal-architecture)
- [Twelve-Factor configuration](https://12factor.net/config)
- [Go interface ownership](https://go.dev/wiki/CodeReviewComments#interfaces)
- [MSW reusable request mocking](https://mswjs.io/docs/)
- [Testcontainers Go/Postgres](https://testcontainers.com/guides/getting-started-with-testcontainers-for-go/)
- [Pact contracts](https://docs.pact.io/)
- [Playwright parallel isolation](https://playwright.dev/docs/test-parallel)
- [Compose project names](https://docs.docker.com/compose/how-tos/project-name/)

Fixture obligations, profile names, and example config precedence are skill
policies. The implementation should suit the actual dependency and runtime.
