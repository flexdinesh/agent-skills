# repo-patterns: code organisation by application type

Researched 2026-09-27. Primary architecture accounts and official language/protocol
docs; policy synthesis, not an agent-effectiveness benchmark. Extends
[repo-patterns](../skills/repo-patterns/SKILL.md) while preserving tooling fallbacks.

## Overlap and distinctions

| Idea | Existing material | Adopted instruction |
| --- | --- | --- |
| Adapters / hexagonal architecture | [Cockburn's original article](https://alistair.cockburn.us/hexagonal-architecture/) isolates application behavior from external drivers/devices | Consumer contracts, technology-specific adapters, explicit composition; no required class hierarchy/layer count |
| Feature locality | [Bogard's vertical slices](https://www.jimmybogard.com/vertical-slice-architecture/) groups changes by use case and rejects uniform abstraction stacks | Colocate feature behavior/adapters/tests; split by actual responsibility |
| Tracer bullets | [Hunt/Thomas interview](https://www.artima.com/articles/tracer-bullets-and-prototypes) describes early integrated paths and distinguishes prototypes | Build a narrow working feature, exercise observable output, then widen it; no tracing framework implied |
| Swappable external data | [Netflix case study](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749) describes adapters around changing data sources | Keep vendor details out of consuming operations; validate replacement semantics |
| Schema/public contract separation | [AIP-180](https://google.aip.dev/180) distinguishes source, wire, and semantic compatibility; [GitLab migrations](https://docs.gitlab.com/development/database/avoiding_downtime_in_migrations/) considers coexisting versions | Explicit migration history, deliberate public mappings, old/new consumer verification |
| Concurrent change ownership | [Git worktrees](https://git-scm.com/docs/git-worktree) have separate working trees/indexes; the same checkout does not | Feature/file ownership plus coordinated shared edits/staging; no promise of conflict-free work |

Hexagonal boundaries and vertical slices serve different purposes. The skill's
synthesis uses feature ownership while retaining useful technology boundaries;
it does not mandate Bogard's CQRS style or Netflix's repository/entity structure.
Tracer bullets are an incremental delivery technique, not a separate folder tree.

A database port permits substitution at a code boundary. It does not establish
equivalent isolation, constraints, precision, or query behavior across engines.
Build supported adapters only, verify their real behavior, and keep migration/data
movement requirements explicit. Existing storage/fixture rules supply that detail.

## Application-specific sources

- **CLI:** [Go layouts](https://go.dev/doc/modules/layout) distinguish commands and
  internal implementation. [CLI Guidelines](https://clig.dev/) supplies stream,
  exit, signal, and noninteractive conventions. Apply these at a testable command
  boundary; a small command need not acquire a package per responsibility.
  [Node exit semantics](https://nodejs.org/api/process.html#processexitcode) supports
  setting failure status while allowing buffered output to flush.
- **REST:** [Go HTTP testing](https://pkg.go.dev/net/http/httptest) supports transport
  evidence; [Go transactions](https://go.dev/doc/database/execute-transactions)
  establishes transaction-scoped operations. Existing HTTP rules cover semantics;
  the new section maps them to feature operations and adapters.
- **MCP:** official [tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools),
  [transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports),
  [resources](https://modelcontextprotocol.io/specification/2025-11-25/server/resources),
  [prompts](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts),
  and [cancellation](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation)
  specify discoverable contracts and transport behavior. Keep registration/result
  mapping separate from shared operations; verify protocol wiring, not just functions.
  References pin 2025-11-25; consuming repos must match their negotiated version/SDK.
- **React/Vite:** [Thinking in React](https://react.dev/learn/thinking-in-react),
  [state ownership](https://react.dev/learn/sharing-state-between-components), and
  [custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) support
  focused components and deliberate state/behavior ownership.
  [Redux's feature-folder guidance](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
  is overlapping evidence for locality, not a Redux requirement.
  [Vite environment docs](https://vite.dev/guide/env-and-mode) establish the public
  bundle boundary. Verify production API wiring independently of dev proxy behavior.

## Integration

Added a concise app-type section/routing in `SKILL.md` and one reference with four
shared rules plus CLI, REST, MCP, and React/Vite rules. Existing migration and change
ownership rules remain authoritative for detailed schema/collaboration behavior.
Added evaluation scenarios for restraint, storage semantics, transport evidence,
shared-checkout edits, public schema stability, and production browser wiring.

Layouts are illustrative; no mandatory workspace, interface per function, global
state library, router, mediator bus, or automatic companion-skill invocation.
Evaluation cases describe expected decisions; they do not establish agent efficacy.
