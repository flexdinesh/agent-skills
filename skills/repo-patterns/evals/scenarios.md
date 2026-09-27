# Repository behavior scenarios

These are evaluation prompts/criteria, not claims of a completed agent benchmark.
Use representative small repos, compare with/without the skill, and inspect
evidence accuracy and restraint as well as detected problems.

| Scenario | Expected decision | Failure to catch |
| --- | --- | --- |
| Small Go CLI, pure/file behavior | Keep ordinary simple layout and sample-file run | Unused layers/workspace scaffolding |
| Go API/worker/CLI in one module | Separate composition/lifecycle where needed | Automatic module split from binary count |
| Root Go module with command under `cmd/tool` | Use module-root version tags and correct command install path | Tag prefix based on executable directory |
| Independently distributed nested Go module | Match tag prefix to module directory; check workspace-off build and actual source install | Workspace overrides or arbitrary product prefix masking an uninstallable module |
| Go release embeds assets generated only locally | Verify promised tagged install and packaged assets | Archive success treated as evidence of complete source installation |
| Private JS manifest dispatches Go tasks | Keep task-adapter version separate from product release | Publishing private adapters or versioning the binary from their manifest |
| New JS CLI with undecided runtime | Use native erasable TypeScript on Node 26 and separate typecheck | Unnecessary development transpiler or native execution mistaken for type safety |
| Native TS CLI packaged for npm | Emit JS for installation; retain native TS development | Raw `.ts` executable failing under `node_modules` |
| Native TS source/archive is the supported install | Verify Node/dependency prerequisites and execution outside checkout | Requiring npm publication or treating local symlinks as installation evidence |
| npm CLI depends on private workspace source | Bundle private code or use published runtime packages; inspect packed dependency ranges | Workspace links hiding missing consumer dependencies |
| CLI and private embedded frontend ship together | One deliberate product version; independently verify build inputs | Separate publication/versioning solely from workspace package count |
| Shared generator/library changes outside CLI directory | Include affected CLI consumers in verification | Path-only selection missing release inputs |
| Working manual CI uses scripts or GoReleaser | Preserve packaging convention; manual stable releases and requested automatic Go dev channel | Unrequested release-PR tooling or automatic stable/npm dev publishing |
| Go main push with successful artifact checks | Automatically publish dev with source identity; retain stable/latest | Every merge creates a stable version or updates the stable tap |
| New Go stable dispatch selects another branch/tag | Reject it; resolve current main tip once for new releases | Arbitrary source input silently violates main-only releases |
| Literal latest Git tag exists | Separate alias, GitHub latest metadata, and Go version query | Claiming Go `@latest` follows that Git tag |
| Go CLI has no stable version yet | Document Go latest fallback; keep CI archive channel explicit | Promising `@latest` cannot install unreleased/default-branch code |
| Old dev run/retry finishes after newer publication | Serialize updates and reject channel regression | A lock or cancellation flag assumed to guarantee source order |
| Dev artifact checks fail or asset update is interrupted | Keep last successful build; detect/recover incomplete sets | Deleting working dev before verification or claiming atomic asset replacement |
| Repo enforces immutable GitHub releases | Unique dev releases; release-free dev alias and explicit asset resolver | Replacing locked dev release or assuming its alias supplies GitHub download URLs |
| GoReleaser OSS used for dev builds | Snapshot packaging plus explicit CI publisher | Snapshot assumed to publish or Pro-only `--nightly` used |
| Two manual dispatches target the same product | Serialize conflicting publication and resolve source/version once | Version collision or cancelling a partially published release |
| npm prerelease is manually published | Select prerelease dist-tag; retain stable channel | Accidentally advancing `latest` |
| Primary publication succeeds; downstream fails after `main` advances | Recover original tag/bytes and unfinished channel | Rebuilding different stable assets or selecting a new patch on retry |
| Some npm packages published before failure | Verify accepted versions and resume pending dependencies/consumers | Attempting to overwrite immutable npm identities |
| CI pushes tag using `GITHUB_TOKEN` | Invoke dependent publication explicitly | Assuming tag push starts another push workflow |
| Prefixed module tags with GoReleaser OSS | Verify edition support; retain explicit valid packaging | Pro-only configuration or fake source-version tags |
| Web imports sibling server source | Trace leak and propose public API/import rule | Cosmetic move or unsafe browser dependency |
| CLI opens live DB on import | Move setup to entry point and verify fixture path | Fake flag parsed after live connection |
| Map fake only tests Postgres constraints | Keep fast tests, add relevant real-engine evidence | Claiming fake success proves SQL semantics |
| Tests depend on a large mutable demo seed | Arrange minimal test-owned records; keep demos optional | Requiring full demo data for every test |
| Builder shares nested objects or unseeded dates | Fresh values, explicit relevant fields, controlled generator/clock | Seed alone treated as complete reproducibility |
| HTTP server writes outside test rollback | Isolate actual backend state; verify commits where relevant | Test-connection transaction treated as server isolation |
| Dev reload reseeds; reset trusts a test env flag | Explicit preparation/reset and verified disposable ownership | Lost edits or arbitrary target destruction |
| Required container integration run has no runtime | Report prerequisite failure; preserve explicit fast-only checks | Silent skip or fake fallback reported as integration success |
| Container starts but migration/setup fails | Register cleanup on acquisition; remove owned resources and retain diagnostics | Leaked containers or clients after partial setup |
| Concurrent container runs use fixed host ports | Discover mapped endpoints; verify independent runs | Port collision despite separate container identities |
| CI enables persistent container reuse across runs | Use fresh CI resources; distinguish within-run sharing | Stale state or cleanup disabled by local reuse settings |
| Existing Compose/service-container tests satisfy contracts | Preserve supported setup; judge fidelity/isolation/lifecycle | Unrequested migration merely to install Testcontainers |
| Two worktrees share fixture DB/port | Propose namespaced mutable state and endpoints | Assuming Git isolation implies runtime isolation |
| Column replacement during rolling deploy | Handle old writes, resumable backfill, completion | Copying data without concurrent-write protection |
| Retry-safe POST with durable idempotency | Accept method; verify actual duplicate semantics | Blanket POST/idempotency violation |
| Supported nonpreferred stack | Label preference only; retain stack | Unrequested pnpm/framework migration |
| New JS/TS-only app with undecided tooling | Use pnpm and root `dev` scripts | Automatic mise requirement |
| New Go + JS/TS app with undecided tooling | Use mise root tasks, pnpm JS dependencies, native Go modules | Treating mise as a JS package manager |
| Existing npm/Task workflow without written policy | Preserve evidenced tooling and command conventions | Treating missing prose as permission to migrate |
| Manifests, CI, and docs disagree on tooling | Establish intended policy; report concrete drift | Treating conflicting evidence as an undecided choice |
| Established package manager, undecided doc location | Retain manager; use brief `docs/development.md` | Applying or withholding every fallback as one bundle |
| Existing canonical development guide elsewhere | Update it and preserve established command names | Duplicate guide or cosmetic task renames |
| Root `dev` combines related API/web; worker is optional | Document primary set plus independent/selected runs | Rejecting useful combinations or starting unrelated services |
| Parallel dev processes need setup/readiness and cleanup | Order finite setup, handle readiness, verify interruption | Waiting for foreground server completion or claiming unrun checks pass |
| Development guide loses prerequisites to become shorter | Retain necessary setup/lifecycle; link detailed explanations | Brevity that prevents successful runs |
| Client/mock/provider disagree | Trace actual contract drift and verify provider | Shared static types treated as sufficient |
| Go product embeds a React UI | Distinguish build graph from runtime; test shipped binary | Counting workspace packages as deployments |
| Thin JS manifest delegates Go tasks | Accept native ownership and useful dispatch | Reporting every Go package.json as a defect |
| CLI, REST, and MCP expose one operation | Share operation/invariants; adapt each transport | Calling local REST for reuse or leaking SDK types into domain logic |
| New feature spans web, API, and persistence | Build one runnable tracer slice with observable evidence | Complete technical layers with no working user action |
| Required database replacement preserves method signatures only | Verify atomicity, precision, ordering, and errors on real adapters | Claiming interface compatibility proves storage semantics |
| Storage rename feeds generated REST/CLI/MCP output | Review migrations and each public contract separately | Accidental wire/behavior changes from internal schema edits |
| Separate agents share checkout and global registry | Scope file ownership; coordinate shared edits/index and integration | Assuming distinct features prevent lost edits or semantic conflicts |
| One-file CLI gains speculative service/repository layers | Keep a small testable function and native entry point | Grading architecture by layers/files rather than responsibility |
| CLI help initializes DB; JSON includes progress logs | Defer live setup; separate output/diagnostic streams | Domain helpers exiting process or untestable terminal dependencies |
| REST tests mock a store while writes commit separately | Check request contracts and real atomic behavior | Passing mocks treated as proof of transaction correctness |
| MCP function tests pass but stdout includes logs | Verify discovery/invocation through actual protocol transport | Missing wiring/schema errors or corrupted stdio |
| Stateful MCP HTTP server shares user data between clients | Own authenticated session state and verify isolation | Treating annotations or global mutable state as authorization |
| React feature requires edits to every global Hooks/types module | Colocate feature responsibilities; share only cohesive capabilities | Mandatory global store/provider or one Hook per component |
| Vite dev proxy works; built app has wrong API URL | Verify production browser/API wiring and public config | Treating dev success as deployment evidence |
| REST and MCP share an operation | Reuse application owner and translate protocol results | One local transport calling another for reuse |
| Fixture source lacks refresh but permits comments | Resolve support/policy; enforce operations server-side | Source-name checks or UI-only denial |
| Generated check follows a staging write | Compare before overwrite or check resulting Git drift | Claiming a comparison with replaced output detects staleness |
| Derived DB rebuild loses absent-source history | Establish authority/loss scope and recovery contract | Calling destructive reset a row-preserving migration |
| Import cursor advances independently of facts | Validate continuity and atomic progress | Treating file size/offset as sufficient evidence |
| JS `customerId`, Go `customerID`, protobuf `customer_id` | Accept equivalent vocabulary with native spellings | Imposing one casing scheme across languages |
| Customer/client synonyms or distinct account concepts | Trace meaning; preserve domain translations | Unifying distinct concepts or ignoring synonym drift |
| Producer timeout seconds, consumer milliseconds | Verify conversion and contract; clarify scalar units | Cosmetic suffix advice without checking behavior |
| React component/Hook or required framework filename | Preserve required naming semantics and discovery | Treating framework requirements as cosmetic preferences |
| Public field/config rename with older consumers | Trace consumers and preserve compatible transition | Breaking callers for naming consistency |
| Coherent nonpreferred filename convention | Follow existing pattern; label preference only | Unrequested repository-wide rename |
| Healthy boundaries and checks | Report no supported findings | Invented folder-count/sequential-scan defects |
| Partial audit of large repo | Report exact inspected scope, continue full requested audit | Claim of repo-wide conformance from a sample |

Avoid grading by folder count, layer count, abstraction count, or raw coverage.
Measure supported findings, false positives, useful independent runs, behavior
preservation, and honest coverage. Changed decisions need actual runs to establish
agent effectiveness; format validation alone does not do that.
