# repo-patterns: test-data proposal

Researched 2026-09-27. Incorporated into
[repo-patterns](../skills/repo-patterns/SKILL.md) and
[test data and setup](../skills/repo-patterns/references/test-data-and-setup.md).
Primary framework/tool documentation; original policy synthesis, not an adoption
survey or ranking of library popularity.

## Existing coverage

The skill audits, writes, and conforms repository boundaries, runtime composition,
tooling, data models, and contracts. It already requires independent fixture runs,
synthetic scenarios, deterministic inputs, isolated mutable state, MSW where useful,
real-engine integration checks, and migration-before-seed ordering. It also separates
durable migrations from disposable fixtures.

The gap was operational detail: who owns reusable data, fixtures versus factories,
minimal per-test arrangement, generator reproducibility, seed repeat semantics,
and preparation/reset behavior across tests and development servers.

## What established tools recommend

| Pattern | Primary evidence | Proposed instruction |
| --- | --- | --- |
| Small named fixed fixtures | [Rails](https://guides.rubyonrails.org/testing.html#fixtures) recommends predefined fixtures for common defaults, not every object | Keep readable fixed examples and source-format regression files; avoid a mandatory giant seed |
| Programmatic setup and factories | [Django](https://docs.djangoproject.com/en/5.2/topics/testing/tools/#fixture-loading) favors ORM-created test objects for readability/maintenance; [Faker](https://fakerjs.dev/guide/usage.html#create-complex-objects) demonstrates typed object factories | Pure typed builders, explicit variants and relationships; persistence remains an explicit operation |
| Controlled generated data | [Faker](https://fakerjs.dev/guide/usage.html#reproducible-results) documents seed, version, and relative-date limits | Fixed assertion values; optional scoped generation with seed, reference time, and pinned version |
| Shared HTTP descriptions, local overrides | [MSW](https://mswjs.io/docs/best-practices/structuring-handlers/) combines baseline handlers with runtime overrides and domain grouping | Reuse handlers where contracts match; isolate scenario state and per-test overrides |
| Scoped setup and teardown | [Playwright fixtures](https://playwright.dev/docs/test-fixtures) separates test and worker lifecycles; [parallelism](https://playwright.dev/docs/test-parallel#avoiding-shared-state-in-parallel-tests) addresses backend records | Own mutable data per test; reuse expensive services only with data isolation/restoration |
| API preparation of prerequisites | [Playwright API testing](https://playwright.dev/docs/api-testing) demonstrates preparing server state and cleanup | Arrange prerequisites without repetitive UI flows; exercise the actual behavior under test |
| Migrate, then seed | [Supabase](https://supabase.com/docs/guides/local-development/seeding-your-database) runs seed files after migrations and recommends data-only seeds | Keep schema and scenario loading distinct; explicit dev preparation and reset |
| Real storage evidence | [Testcontainers](https://testcontainers.com/guides/getting-started-with-testcontainers-for-go/) demonstrates isolated real-database integration | Keep fast fake-based tests plus relevant production-family DB tests |

These are recurring practices across established ecosystems. They do not establish
one universally preferred fixture format or library. Rails and Django differ on
the preferred representation; the skill should support both with explicit ownership
and lifecycle. The reuse/reset policies below are our synthesis from that evidence.

## Proposal

1. **Own definitions by feature/contract.** Distinguish fixed fixtures, fresh-value
   builders, named scenarios, store loaders, mock handlers, and runner fixtures.
   These are responsibilities, not six mandatory directories. Share definitions
   for real consumers; keep storage imports out of browser support.
2. **Arrange only relevant data.** Tests use small explicit values and prerequisites;
   dev/demo scenarios compose useful product states. Reuse compatible definitions
   across both, while retaining test-specific cases. Assertions specify expected
   behavior independently of setup helpers.
3. **Match setup to the boundary.** Unit tests use values; UI tests can use HTTP
   mocks; storage tests use the actual engine/migrations; end-to-end tests isolate
   backend records as well as browser state. Importer tests prepare from source
   input through the actual importer.
4. **Define lifecycle and repeat semantics.** Fixture provisioning resolves and
   verifies its target, migrates, seeds, starts, and waits for readiness. Ordinary
   reload preserves edits. Document idempotent versus fresh-only seeds; explicit
   reset restores only owned disposable resources. Test transactions cannot clean
   up writes committed through unrelated server connections.
5. **Make runs reproducible and inspectable.** Synthetic inputs, explicit scenario,
   controlled relevant time/IDs, scoped optional randomness, and resource cleanup.
   Record commands and limitations in the existing development guide.

Tradeoffs: builders clarify variation but can hide defaults; static fixtures are
clear but can drift. Shared scenarios reduce duplicated definitions but must not
couple every test to a demo dataset. Real DB tests cost more setup; use them where
database semantics matter. Transaction rollback is efficient only when its scope
matches the actual work and behavior being tested.

No required Faker/MSW/Testcontainers installation, new workspace package, fixture
DSL, public reset endpoint, or production-data copy. Preserve established tools.

## Integration and validation

Added three rules: `fixture-data-ownership`, `fixture-builders`, and
`fixture-setup-lifecycle`. Routed them from `SKILL.md`, linked the existing fixture
reference, extended applicable command/documentation contracts, and added evaluation
cases for minimal test data, reproducibility, rollback scope, and safe dev reset.

Acceptance scenarios: clean setup, repeated seed per its contract, explicit reset,
reload preservation, independent/retried/parallel tests, partial setup cleanup, and
reset refusal before mutation on an unowned target. These are proposed evaluations,
not claims of executed application tests or measured agent effectiveness.

Unresolved questions: none.
