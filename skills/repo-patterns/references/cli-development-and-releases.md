# CLI development and releases

Read for Go or TypeScript/Node CLI setup, consumer installation, packaging, and
CI releases in separate repos or monorepos. Stable versions and `latest` are
published only by manually triggered CI; Go `main` builds publish automatically
to `dev`. PRs run checks/package previews without publication. Automatic stable
publication, automatic npm dev publication, and release-PR tooling are outside
this scope. Examples are illustrative, not required scaffolding.

Use [CLI organisation](code-organisation.md#organisation-cli) for command behavior
and [runtime distribution](boundaries-and-layout.md#boundary-runtime-distribution)
for build/runtime boundaries. These rules add the consumer installation and
release lifecycle rather than another application architecture.

## `cli-release-ownership`

**Apply:** choosing CLI ownership, layout, dependencies, or release units.

**Problematic:** each executable gains a module solely to match a folder tree;
private web/build packages acquire product versions or are published accidentally.

**Prefer:** distinguish code owner, Go module/JS package, executable, product,
and independently released consumer. Use the smallest native structure. Multiple
binaries can share one cohesive Go module; separate modules need actual dependency
or release ownership. A CLI and private embedded UI can be one product. Independently
consumed tools can have separate versions without independent repositories.

| Case | Useful starting point | Release/install identity |
| --- | --- | --- |
| Go, separate repo | `go.mod`, applicable `go.sum`, root `main.go` or `cmd/tool`, focused `internal/` | Module tags and supported command install path |
| Go, monorepo | Command within an existing cohesive module, or an intentionally nested module | Actual module root determines Go version tags |
| TS/Node, separate repo | One package, native TS entry point, typecheck/tests, lockfile | Declared runtime and supported install channel |
| TS/Node, monorepo | One owning workspace package; private root/tools; declared dependencies | Package/product identity and independently installable output |

Keep parser conventions; standard parsing may suffice for a tiny command. Command
trees can justify Cobra or Commander; plugin needs can justify oclif. No mandatory
generator, config framework, package per command, or public library extraction.
Private Go task-adapter manifests are not npm products. Retain supported scripts,
GoReleaser, and native packaging; add tooling only for demonstrated maintenance needs.

**Exception:** real consumers can justify a public library or coordinated release
group. Directory names and executable count alone establish neither.

**Verify:** identify the released units, runtime consumers, public surfaces, and
supported installs. Check the consumer dependency graph outside workspace shortcuts.
Do not add a release framework merely because the repo has several packages.

## `cli-go-distribution`

**Apply:** Go binary archives, tagged source installs, or Go CLI modules.

**Problematic:** `cmd/tool/v1.2.3` tags a command in a root module; local replacements
hide missing published dependencies; an installed binary lacks embedded web assets.

**Prefer:** root modules use `vX.Y.Z`; nested modules use the repository-relative
module directory prefix. A module at `packages/cli` uses `packages/cli/vX.Y.Z`,
while users install its command with `.../packages/cli/cmd/tool@vX.Y.Z`. A root
module's `cmd/tool` still uses root tags. Handle the `/v2` module-path suffix for
major versions >=2 when offering Go source installation.

Check released modules with `GOWORK=off`; separately validate supported versioned
installation, including its `replace`/`exclude` restrictions. Define whether direct
source installs require committed generated assets or only release archives supply
them. Native Go installation does not run a frontend build automatically.

For archives, declare OS/architecture and runtime prerequisites, include applicable
docs/license and checksums, and make version metadata intentional. CGO policy must
match dependencies; cross-compilation alone does not establish runtime support.
Archive linker flags do not automatically apply to source installs; Go build
information can support truthful version reporting there.

GoReleaser's prefixed-tag `monorepo` feature requires Pro. Verify installed version,
edition, and actual tag handling before choosing it. Small scripts are valid;
do not introduce fake root version tags just to make a packaging tool accept a
nested module. Preserve working artifact/target conventions.

**Exception:** a product may support archives only. Document that contract rather
than claiming every CLI must support `go install` or commit built assets.

**Verify:** build from the real module, inspect archives, run supported binaries,
and check embedded assets/runtime prerequisites. Test advertised tagged installation
after publication when authorized; report a prepublication source-install check
as incomplete evidence of the published path.

## `cli-js-distribution`

**Apply:** TypeScript/Node CLI development, workspace packaging, or installation.

**Problematic:** a native TS CLI gains an unnecessary development transpiler;
type stripping is treated as typechecking; npm ships a raw TS executable that
works locally but fails under `node_modules`.

**Prefer:** for an undecided JS CLI stack, use TypeScript running natively on
Node 26. Pin a consistent local/CI runtime policy. Use erasable syntax, explicit
`.ts` imports, `import type`, and deliberate module format. Native Node ignores
`tsconfig.json`; keep typechecking separate and avoid enums, parameter properties,
and TS-only path aliases. No `any`, type assertions, or non-null assertions.

Illustrative native check configuration; preserve compatible repo settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

For ESM `.ts`, set `"type": "module"`. Commands can directly run
`node src/main.ts`, applicable `node --test` TS tests, and `tsc --noEmit`.
Resolve install channels per product. Source/archive runs outside `node_modules`
can retain native TS with Node and production dependencies. npm installation
needs emitted JS because Node refuses native stripping under `node_modules`.
Use a packaging-only emit configuration with `.ts` imports rewritten to `.js`,
or an existing suitable bundler; local execution can remain native TS.

For npm, declare `bin` pointing to shipped JS with a Node shebang, runtime engines,
module format, included files, and package/repository metadata. External runtime
imports belong in production dependencies; fully bundled dependencies can remain
build dependencies. Inspect output to establish which imports remain external.
Type declarations are needed only for supported library consumers.

In pnpm workspaces, pack using tooling that rewrites `workspace:` ranges for
publication. Required public runtime packages must be available at compatible
versions; private helpers must be bundled or excluded from the runtime graph.
Test installation away from workspace symlinks, root dev tools, and source aliases.

**Exception:** preserve established supported JS runtimes, syntax, and build tools
unless migration is requested. Installation without Node is a separate product
requirement, not a reason to silently change runtime or add another distribution.

**Verify:** run the native TS command and typecheck separately. Verify the supported
source/archive installation or packed npm artifact in isolation. Check version,
entry point, production dependency/asset resolution, and declared runtime support.

## `release-go-channels`

**Apply:** setting up or auditing Go CLI publication from `main`.

**Problematic:** every merge creates a stable version; a development build changes
`latest` or the stable Homebrew formula; an older run overwrites a newer `dev`;
a Git tag named `latest` is mistaken for Go's `@latest` query.

**Prefer:** give stable and development publication explicit CI-only owners:

| Channel | Trigger and source | Publication contract |
| --- | --- | --- |
| Stable version | Manual `workflow_dispatch` from `main`; resolve its current tip once when planning | Immutable `vX.Y.Z` (module prefix where applicable), verified archives/checksums, stable downstream updates |
| `latest` | Successful stable publication only | Mark that versioned GitHub release latest; never select a development release |
| `dev` | Automatic `push` to `main`; verify and package that event's exact commit | Latest successfully published development build, with commit identity; no stable version bump or stable downstream update |

Reject a stable dispatch from another branch/tag. A new stable release uses the
resolved `main` tip, not an arbitrary input SHA; recovery deliberately reuses the
original release. Check out the resolved SHA in every job even if `main` advances.
Never document local tag pushing or local publication as the release path.
Use narrow publishing credentials in CI. Where enforcement is requested and the
provider supports it, restrict version/channel tag creation and updates to the
intended CI identity; verify its actual ruleset permissions rather than assuming
`GITHUB_TOKEN` bypasses protections.

Keep three meanings separate: GitHub's latest release is metadata on a versioned
release; a literal `latest` Git tag is a moving source alias; Go's `@latest`
query selects semantic module versions. Use GitHub latest metadata and its
`/releases/latest/download/<asset>` URL for stable binary downloads. This channel
does not require creating a Git tag named `latest`. In a monorepo, GitHub latest
is repository-wide: use product-specific versioned downloads or an explicit
product channel resolver rather than treating it as independent per-product state.

For a simple rolling download, use the non-semver Git tag `dev` and a GitHub
prerelease at that tag, with `prerelease: true` and `make_latest: false`.
Stage and verify the full artifact set before replacing the development assets;
record the source SHA, checksums, and a distinct binary version such as
`dev-<short-sha>`. Retain the previous verified set for interrupted-update recovery.
After the complete assets are available, move only the `dev` Git tag to that
source commit; a release API's `target_commitish` does not retarget an existing
tag. Update the specific ref with its expected prior value, never force-push all
tags. This channel is deliberately mutable and must not be advertised as a
reproducible version pin. Multi-asset replacement is not atomic: document how
consumers detect incomplete/mixed sets and retry using the checksum manifest.

Check release immutability before choosing that topology: GitHub immutable
releases lock both their tag and assets. Do not disable an established policy to
overwrite `dev`. Instead publish uniquely named development releases, such as
`dev-<full-sha>`, mark them prerelease/non-latest, and move a release-free `dev`
Git alias only after the complete build is available. A documented installer or
manifest must resolve that alias to its exact release/assets; GitHub does not
automatically provide `/releases/download/dev/...` for this arrangement. Both
arrangements preserve the requested `dev` channel; select one from repo policy.

Serialize channel updates per product and keep dev/stable locks separate unless
they share publication resources. Cancel superseded builds before publication;
do not cancel a job halfway through replacing shared assets. Serialization alone
does not establish source order: under the publication lock, compare the candidate
with the current remote main tip and the channel's recorded SHA; skip superseded
candidates and obsolete retries rather than regressing the channel. After a failed
check/build, retain the last successful `dev`. Monorepos include shared Go/frontend/generator,
dependency, and toolchain inputs in affected-product selection; do not filter only
the command directory. Name independent product channels explicitly, such as
`tool-dev`; Go semantic version prefixes still follow the actual module root.

Reuse the stable packaging inputs, targets, and artifact checks. With GoReleaser
OSS, `goreleaser release --snapshot` creates artifacts and skips publication;
an explicit CI publisher must handle `dev`. Do not present `--nightly` as an OSS
feature: GoReleaser's built-in nightly publication requires Pro. Configure snapshot
metadata deliberately and keep dev/channel tags out of stable version selection.
Native packaging scripts remain valid; no edition upgrade is required.

When source installation is supported, document `go install <command>@vX.Y.Z`
and `@latest` for releases, `@dev` (or the product's dev ref) for the CI-managed
rolling tag, and `@<sha>` for a development pin. `@main` follows source immediately, including commits
not yet published successfully by CI. Branch/non-semver tag queries may resolve
to pseudo-versions; let Go derive them. `@latest` ignores a literal `latest` alias
and prefers release versions, falling back to prereleases or default-branch source
when no releases/tags exist. Do not promise CI-only source availability or a stable
`@latest` before the first stable version; archives are the CI publication contract.

**Exception:** archives-only CLIs need no source-install promise. With GitHub
immutable releases, retain unique dev releases and an explicit channel resolver;
do not turn a published semantic version into a rolling alias. Existing supported
publishers may implement equivalent channels without adopting GoReleaser.

**Verify:** inspect both triggers and branch guards. Check that only manual stable
CI creates version tags/advances latest; automatic main publication changes only
the development channel. Exercise failed/newer/older runs, first release, retry
after branch advancement, incomplete assets, immutable-release settings, and
monorepo shared-input changes. Match installed binary SHA/version to the selected
release. Use controlled publishers for finite checks; do not publish during audit.

## `release-version-plan`

**Apply:** setting up or auditing manually triggered CI releases.

**Problematic:** different jobs reread moving `main`; arbitrary prefix matches
select another product's version; concurrent dispatches choose the same patch.

**Prefer:** use a maintainer-triggered workflow, such as `workflow_dispatch`.
Resolve source commit, released unit, version, tag, channels, and expected artifact
set once; downstream jobs use that commit and plan. Preserve version-selection
policy: an explicit version or configured patch series can both work. Keep one
version planner per released unit and serialize conflicting releases without
cancelling publication already underway.

Validate existing tags against the chosen source. Version selection must separate
products and stable/prerelease tags, order versions correctly, and distinguish a
new release from a retry. Patch automation does not infer compatibility: document
how maintainers select a new minor/major series. Private manifest versions do not
determine a Go product's release. Released npm manifest/CLI versions must match
the plan. Explain user-visible changes and upgrade requirements in release notes.

Keep normal checks separate from publication; Go main pushes may publish only
the development channel under `release-go-channels`. Shared library, generator,
lockfile, and toolchain changes can affect a CLI even when its own directory is unchanged.
Use the effective consumer graph before optimizing affected-target selection.

**Exception:** independent products may release concurrently when their actual
publication resources do not conflict. Existing compatible workflow names, helpers,
and task runners need no migration to match these examples.

**Verify:** inspect the trigger, source selection, tag checks, concurrency scope,
and shared inputs. Where selection logic changes, test first release, numeric
ordering, series change, unrelated/malformed tags, same-commit retry, and mismatched
existing tags. Do not publish merely to verify a read-only audit.

## `release-artifact-verification`

**Apply:** CLI packaging, release checks, or supported install paths.

**Problematic:** source tests pass but the tarball lacks templates; a smoke check
uses the maintainer's checkout/dependencies; publishing rebuilds different bytes.

**Prefer:** make finite packaging/snapshot checks available without publication.
Run applicable source checks, verify generated inputs before overwrite, then build
and package the release inputs. Inspect the artifact set, entry points/modes,
dependencies, assets, metadata, license/docs, and checksums as applicable.
Use [generation checks](tooling-and-commands.md#tool-generated-artifacts).

Exercise the installed archive/tarball outside the checkout with only declared
production prerequisites: help/version and a representative fixture operation,
including relevant failure exits and machine output. Test relevant declared
platform/runtime behavior; distinguish cross-build evidence from native execution.
Preserve verified bytes through publication and control packaging lifecycle hooks
so a later invocation does not silently rebuild them.

**Exception:** unsupported/unavailable platforms limit execution evidence. A
dependency-fetching install check may need registry access; report that prerequisite.
Not every CLI needs every distribution channel, browser check, or native matrix.

**Verify:** inspect and execute the actual packaged output. Include relevant
regressions for missing assets/dependencies, stale generated files, wrong version,
or installation-context failures. Report exactly which artifacts/platforms ran.

## `release-publish-recovery`

**Apply:** publication and retries in manual stable CI or automatic Go dev CI.

**Problematic:** release existence is mistaken for completeness; a failed tap
update rebuilds different stable assets; retry after `main` advances releases new code.

**Prefer:** CI publishes verified artifacts/metadata, then updates downstream
channels. Keep explicit publication state: expected assets/digests, package
versions, and downstream status. Retry the original source/tag; verify and reuse
existing bytes, and resume unfinished steps. Stable Go source tags remain unchanged;
changed published content needs a new version. npm package/version identities cannot
be reused, including after unpublishing. Verify already accepted packages before
skipping them; dependency publication must complete before dependent consumers ship.

Keep Git tags separate from npm dist-tags. Select stable/prerelease channels
deliberately; publishing a prerelease must not accidentally advance `latest`.
Deterministic tap branches/PRs permit repairing the same downstream update.
The tap owns its install/audit checks. Keep credentials scoped to the publisher;
for new npm publication, prefer supported trusted publishing and verify the
configured workflow/actions and installed tool support. Provenance availability
depends on provider and repository/package visibility; checksums alone are not
producer authentication.

Workflow dependencies must actually run. On GitHub, pushing a tag with the
repository's `GITHUB_TOKEN` does not start another push-triggered workflow; use
explicit job/reusable-workflow dependencies or an intentional supported dispatch.
Do not add a broader token just to split an otherwise coherent release job.

**Exception:** retain explicit existing artifact replacement policies where allowed
by the channel, but document byte/checksum consequences and do not generalize them
to immutable Go source or npm versions. Required staged publication can remain
within the existing manual process; do not invent extra approval flows.

**Verify:** exercise recovery with controlled publisher substitutes when logic
changes: publication succeeds then tap fails; one package succeeds and another
fails; existing assets mismatch; the branch advances; a retry completes unchanged.
Report external publication/install checks not executed. Never move a published
semantic Go version tag or republish an npm identity as a generic recovery step.
The explicitly mutable `dev` alias/assets follow `release-go-channels`; an obsolete
dev retry must not replace a newer successful build.

## `release-maintenance-docs`

**Apply:** documenting CLI installation, release channels, updates, or recovery.

**Problematic:** release instructions omit cwd, version source, credentials, or
partial-failure repair; three competing guides describe different release commands.

**Prefer:** update the canonical guide; where location is undecided, use brief
`docs/release.md` linked from README. Cover supported install/runtime/platforms,
version ownership, manual CI dispatch/source selection, preflight/package checks,
minor/major series changes, publisher prerequisites, artifact names, and recovery
of the original release after branch advancement. Link detailed architecture and
configuration elsewhere. Preserve working command names. For Go, document the
automatic `main` → `dev` path, manual `main` → version/latest path, latest metadata
versus literal Git aliases, development install/pin commands, and last-successful
behavior when a main build fails. State which releases/assets are immutable.

Keep the installer responsible for updates unless self-update is an intentional
product capability. Coordinate state/schema compatibility with
[migration guidance](data-models-and-migrations.md); release numbers are not schema
versions. Embedded runtimes need artifact rebuilds for runtime updates. Introduce
shared release helpers only when actual consumers and maintenance costs justify
them; pin shared consumers and retain meaningful local verification.

**Exception:** an existing canonical release guide can live elsewhere. Internal
unpublished tools need applicable run/update documentation, not fabricated public
package identities, credentials, or publishing tasks.

**Verify:** match the guide to the actual manifests, workflow, install channels,
version selector, and retry behavior. Follow authorized finite checks; distinguish
documented dispatch/installation from executed external actions.

## Sources

- [Go module layout](https://go.dev/doc/modules/layout)
- [Go module tag mapping and versioned installation](https://go.dev/ref/mod)
- [Go publishing and unchanged source versions](https://go.dev/doc/modules/publishing)
- [Go build information](https://pkg.go.dev/runtime/debug#ReadBuildInfo)
- [Go version queries and pseudo-versions](https://go.dev/ref/mod#version-queries)
- [Rclone per-commit beta builds and separate stable downloads](https://rclone.org/downloads/#beta-releases)
- [GoReleaser snapshots skip publication](https://goreleaser.com/customization/publish/snapshots/)
- [GoReleaser nightly publication requires Pro](https://goreleaser.com/customization/publish/nightlies/)
- [GoReleaser's migration from a rolling nightly tag to immutable builds](https://goreleaser.com/blog/immutable-releases/)
- [GoReleaser prerelease/latest metadata](https://goreleaser.com/customization/publish/scm/)
- [GitHub release latest metadata](https://docs.github.com/en/rest/releases/releases#create-a-release)
- [GitHub immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases)
- [Git aliases without associated immutable releases](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/using-immutable-releases-and-tags-to-manage-your-actions-releases)
- [GitHub publication concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub tag rules and CI identity restrictions](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Node TypeScript execution and dependency restrictions](https://nodejs.org/api/typescript.html)
- [npm package fields](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [pnpm workspace publication](https://pnpm.io/workspaces#publishing-workspace-packages)
- [npm version immutability](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
- [npm dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [GoReleaser monorepo edition and tags](https://goreleaser.com/customization/monorepo/)
- [GitHub workflow trigger semantics](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [Servef release](https://github.com/flexdinesh/servef/blob/d9da37533887293bd27250992b0a0e0a6d7ce611/.github/workflows/release.yml)
- [SSH Drop release configuration](https://github.com/flexdinesh/ssh-drop/blob/a9aea9fa1b251e965e1478dea8e97c33e44638f1/.goreleaser.yaml)
- [Servediff release](https://github.com/flexdinesh/servediff/blob/3b565685fe5d1b3d9087293030cf0e1d517c99ea/.github/workflows/release.yml)
- [Tokeninsights release](https://github.com/flexdinesh/tokeninsights/blob/6c06411682e0eff385f0d4ba990de8534d73fcee/.github/workflows/release.yml)

Native TS/Node 26, manual stable CI releases, and automatic Go dev publication
are scoped skill policies. Installation formats, tool choices, and doc locations
follow consuming-repo conventions. Named development channels vary across projects;
`dev` is the selected policy here, not a universal industry tag name.
