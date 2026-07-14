---
name: implement
description: "Implement a piece of work based on a spec or set of tickets. Use only when the user explicitly invokes `implement` or `$implement`; do not auto-invoke from context."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

## Implementation focus

- Explore the codebase and read `.scratch/CONTEXT.md` or the relevant context map before implementation when present.
- Respect relevant ADRs in `.scratch/adr/`.
- Work at pre-agreed public seams. Before writing tests, identify the public interface and the seams under test.
- Run typechecking regularly, single test files regularly, and the full test suite once at the end.
- Keep each change narrow and avoid speculative features.
- Commit the completed work to the current branch.

## Architecture decisions

When implementation produces one durable architectural decision, record it as an ADR rather than a changelog or transcript. Use [ADR.md](./ADR.md) for its format.

Create `.scratch/adr/` lazily and use sequential filenames such as `0001-slug.md`, after scanning for the highest existing number. Do not invent decisions or include empty optional sections. Update `AGENTS.md` only if the user explicitly wants durable project rules captured there.

## Test-driven development

TDD is the red → green loop. Consult these rules before and during every cycle.

Tests verify behavior through public interfaces, not implementation details. A good test reads like a specification, survives refactoring, describes what users or callers care about, and uses one logical assertion.

Test at seams: public boundaries where behavior can be observed without reaching inside. Prefer the highest existing seam and agree the seams before writing tests.

### Red-green loop

- **Red before green.** Write the failing test first, then only enough code to pass it.
- **One slice at a time.** Use one seam, one test, and one minimal implementation per cycle.
- **Vertical slicing.** Do not write all tests first and all implementation afterward. Each test should be a tracer bullet responding to what the previous cycle taught you.
- **No refactoring in the loop.** Keep refactoring separate from the red → green implementation cycle.

### Tests to keep

Prefer integration-style tests through real interfaces rather than mocks of internal parts. Do not mock internal collaborators, private methods, or call counts/order. Do not verify behavior through side channels such as querying a database directly; verify it through the public interface.

Avoid tautological tests whose expected value recomputes the implementation. Expected values come from an independent source of truth: a known-good literal, worked example, or spec.

### Mocking

Mock at system boundaries only: external APIs, databases when a test database is not preferable, time/randomness, and sometimes the file system. Do not mock modules or classes the project controls.

Design boundary dependencies for testability with dependency injection. Prefer specific SDK-style interfaces for each external operation over generic fetchers so mocks return one clear shape, tests show which operation they exercise, and types remain precise.
