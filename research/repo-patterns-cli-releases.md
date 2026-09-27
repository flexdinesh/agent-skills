# repo-patterns: CLI setup and releases — research and integration

Researched and integrated 2026-09-27. Product repos unchanged.
Primary documentation and representative maintained projects, not an adoption
survey. Recommendations are policy synthesis; tool capabilities are sourced.

## Recommendation

Added one focused
[CLI reference](../skills/repo-patterns/references/cli-development-and-releases.md).
Keep the existing
organisation, lifecycle, fixture, tooling, and runtime-distribution rules.
Teach release ownership, consumer installation, version planning, artifact
verification, and recovery. Resolve each choice from repo policy and working
conventions before applying a fallback.

For new small CLIs, prefer a native Go module or one JS package. A CLI inside a
monorepo needs an explicit owner and installable artifact; it does not automatically
need independent dependencies, versions, or a release platform. Existing CI is
evidence to inspect, not a template to copy.

Scope confirmed: stable versions and GitHub latest only through manual CI;
Go main builds automatically publish to dev. Automatic npm dev publication is
deferred. For undecided JS CLI stacks,
prefer TypeScript running natively on Node 26. Preserve established install
channels; choose new channels per product rather than requiring npm or standalone
executables. Independent consumers can have independent versions without automatic
publication. Retain established release tools and version-selection policies.

## Existing skill coverage

| Existing rule | Keep; add only missing detail |
| --- | --- |
| `layout-topology` | One cohesive Go module; intentional module/package boundaries |
| `organisation-cli` | Thin command composition, testable operations, streams/exits/signals |
| `boundary-runtime-distribution` | Separate build tooling from shipped prerequisites |
| `tool-dependency-ownership` | Declared dependencies; workspace overrides are insufficient evidence |
| `tool-generated-artifacts` | Reproducible generation, drift checks, release inputs |
| `tool-command-contract` | Native commands, finite checks, one-shot sample runs |

The added concern is the path from reviewed source to a version users can
install and maintain. No need for a second command-architecture rulebook.

## Your repos: useful evidence

Inspected manifests, CI/release workflows, release docs, release configuration,
and representative version-selection code. No builds, installs, or publishing.
Servef's checkout is `/home/dee/workspace/servef/main`. Servediff had unrelated
UI/development-doc changes; inspected release files were unaffected. Other
checkouts were clean at inspection.

| Repo / inspected commit | Ownership | Release implementation | Retry behavior |
| --- | --- | --- | --- |
| Servef / `d9da37533887293bd27250992b0a0e0a6d7ce611` | Root Go module; JS builds embedded UI | Scripted archives; `.release-version`; formula PR | Downloads existing GitHub assets |
| SSH Drop / `a9aea9fa1b251e965e1478dea8e97c33e44638f1` | Root Go module; `cmd/ssh-drop` | Pinned GoReleaser; workflow-owned series; cask PR | Rebuilds/replaces assets via `replace_existing_artifacts` |
| Servediff / `3b565685fe5d1b3d9087293030cf0e1d517c99ea` | Root Go module; pnpm build workspace | GoReleaser; `.release-version`; formula PR | Downloads existing GitHub assets |
| Tokeninsights / `6c06411682e0eff385f0d4ba990de8534d73fcee` | Nested Go module; private JS task adapter | Scripted archives; `.release-version`; formula PR | Rebuilds/uploads with `--clobber` |

All four manually dispatch from `main`, serialize releases without cancellation,
select patch tags, check before tagging, publish archives/checksums, and update
deterministic Homebrew PR branches. These are strong candidates for the skill's
small-product workflow. They do not establish a preferred JS runtime: all four
ship Go executables.

Adopt the separation of publication from tap validation, documented native
install paths, and embedded-asset verification. Prefer immutable stable artifacts
for new releases; treat replacement as an explicit existing policy/tradeoff,
not a universal retry recipe. Their helper tests also demonstrate useful cases:
first version, numeric patch ordering, changed series, same-commit reuse, and
ignoring malformed/prerelease tags.

Evidence: [Servef release](https://github.com/flexdinesh/servef/blob/d9da37533887293bd27250992b0a0e0a6d7ce611/.github/workflows/release.yml),
[SSH Drop config](https://github.com/flexdinesh/ssh-drop/blob/a9aea9fa1b251e965e1478dea8e97c33e44638f1/.goreleaser.yaml),
[Servediff release](https://github.com/flexdinesh/servediff/blob/3b565685fe5d1b3d9087293030cf0e1d517c99ea/.github/workflows/release.yml),
[Tokeninsights release](https://github.com/flexdinesh/tokeninsights/blob/6c06411682e0eff385f0d4ba990de8534d73fcee/.github/workflows/release.yml).

## Setup: four cases

| Case | Smallest useful setup | Release identity and install evidence |
| --- | --- | --- |
| Go, separate repo | `go.mod`/applicable `go.sum`, root `main.go` or `cmd/tool`, focused `internal/`, colocated tests | Root module uses `vX.Y.Z`; verify the actual `go install` command if supported |
| Go, monorepo | Existing cohesive module with `cmd/tool`, or nested module for independent ownership | Nested module `packages/cli` uses `packages/cli/vX.Y.Z`; verify outside workspace overrides |
| TS/Node 26, separate repo | One `package.json`, native `.ts` entry point, typecheck, tests, lockfile | Native source run; emit JS for npm installation if offered; verify the supported install channel |
| TS/Node 26, monorepo | One owning workspace package; native `.ts`; private root/tools; declared shared dependencies | Per-package identity or deliberate shared product version; verify installation without workspace links |

Go's official layout permits simple commands at the root and uses `internal/`
for implementation. `cmd/` is useful, not mandatory. Go module tags follow the
module's directory, not the executable's directory. For example, a command at
`cmd/tool` in the root module still uses root tags. For v2+, account for the module
path suffix even for a CLI offering versioned source installation.
[Go layout](https://go.dev/doc/modules/layout),
[module source conventions](https://go.dev/doc/modules/managing-source),
[tag mapping](https://go.dev/ref/mod#vcs-version).

Preserve an existing parser. For an undecided tiny CLI, standard parsing may
suffice; Cobra or Commander fit command trees. Use oclif when its plugin/runtime
capabilities serve a real requirement. Do not mandate generators, Viper,
autoloaded plugins, or a package per command.
[Cobra](https://cobra.dev/docs/tutorials/first-cli/),
[Commander](https://github.com/tj/commander.js).

## Distribution choices

### Go

Prefer native archives with checksums for users without Go; offer `go install`
when the tagged module is complete. GoReleaser is a useful fallback when its
matrix, archives, and publishers replace meaningful custom maintenance. Keep a
small working script when it is clearer. Native prefixed-tag monorepo support is
GoReleaser Pro; do not add its `monorepo` configuration to an OSS setup. An explicit
script remains a valid option, as Tokeninsights demonstrates.
[GoReleaser monorepos](https://goreleaser.com/customization/monorepo/).

Check direct builds with `GOWORK=off`, then the published installation separately:
workspace-off compilation alone cannot prove `go install ...@version`. Versioned
installation has additional restrictions on `replace`/`exclude` directives.
For embedded UI/schema assets, decide whether tagged source must contain generated
output or only the archive build supports it. Document the actual promise.
[Go installation constraints](https://go.dev/ref/mod#go-install).

Set an intentional OS/architecture/CGO policy. `CGO_ENABLED=0` works only when
dependencies permit it; a successful cross-build does not prove runtime compatibility.
Keep version/commit information truthful across release binaries and source installs;
linker flags used by archive builds are not automatically used by `go install`.
Build metadata can support an intentional source-install version fallback.
[Go build information](https://pkg.go.dev/runtime/debug#ReadBuildInfo).

### TypeScript on Node 26

Prefer native execution for CLI development, repository tools, and compatible
tests: `node src/main.ts` and `node --test tests/*.test.ts`. Keep a separate
`tsc --noEmit` check. Pin the supported Node 26 version policy consistently in
local tooling and CI; document runtime requirements for users. Preserve existing
supported runtimes unless migration is requested.

Use erasable syntax, explicit `.ts` imports, `import type`, and deliberate ESM
configuration (`"type": "module"`). Native Node ignores `tsconfig.json` and does
not typecheck; avoid enums, parameter properties, and TS-only path aliases.
An illustrative check configuration:

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

No runtime transpiler or bundler is required for this native path. Retain the
skill's prohibition on `any`, type assertions, and non-null assertions.
[Node 26 TypeScript](https://nodejs.org/api/typescript.html).

Distribution remains a separate decision. Source checkouts or archives outside
`node_modules` can run native TS with Node 26 and resolved runtime dependencies.
Verify that actual installation rather than assuming a development checkout
proves it. If publishing an npm CLI, emit JavaScript: Node refuses native TS
stripping under `node_modules`. Use a packaging-only emit configuration with
relative imports rewritten to `.js`, or an existing suitable bundler.
[Node dependency restriction](https://nodejs.org/api/typescript.html#type-stripping-in-dependencies).

For an npm CLI, declare `bin`, Node `engines`, module format, an explicit shipped
file list, and publication metadata. Emit JavaScript for the executable; include
its Node shebang. Keep external runtime imports in production dependencies;
dependencies fully included by a bundle can remain build dependencies. Inspect
the resolved output rather than assigning dependencies by source imports alone.
[npm package fields](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/),
[Vite's bundling/dependency policy](https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md#notes-on-dependencies).

In pnpm workspaces, pack with a tool that rewrites `workspace:` dependencies into
registry ranges. Private helpers must be bundled or kept outside the runtime
graph; public runtime dependencies must have usable published versions. Workspace
symlinks and source aliases are not evidence that consumers can install the CLI.
[pnpm workspace publication](https://pnpm.io/workspaces#publishing-workspace-packages).

## Manual releases through CI

A maintainer deliberately starts the release workflow. CI handles verification,
packaging, version/tag creation under repo policy, publication, and downstream
updates. This applies to separate repos and selected products in monorepos.
PRs run checks and package previews without publishing releases. Go main pushes
also publish the development channel described below; stable publication stays manual.

| Tool / workflow | Good fit | Skill decision |
| --- | --- | --- |
| Manual dispatch + version selection | Maintainer chooses timing; CI selects or validates the version | Preserve working policy; configured patch series or explicit version are both valid |
| GoReleaser within manual CI | Go artifact matrix and publishers | Packaging tool; retain or add where it reduces maintenance |
| Native Go/scripted packaging within manual CI | Small matrix or unsupported packaging needs | Explicit inputs, version metadata, archives, checksums and recovery |
| pnpm/npm packaging within manual CI | Published Node CLI | Pack, verify installation, then publish the verified artifact |

Define independent versus coordinated releases from consumers, not folder count.
A CLI and private embedded frontend can share one product version; unrelated
published tools need separate identities. Define coordinated versions explicitly
when consumers require them. Keep one version planner per released unit.
Automatic stable publication, automatic npm dev publication, and release-PR
tooling are outside this integration.

Representative projects show variation, not one industry template:

| Project | Observed pattern | Transferable lesson |
| --- | --- | --- |
| GitHub CLI | Maintainer-triggered Go release; platform packaging/signing and release docs | Manual release control is compatible with substantial automation |
| `create-vite` in Vite | Small npm CLI inside a larger monorepo; own `bin`, build, files, engines, repository directory | Package locally; publish only its supported surface |
| pnpm | Multiple CLI products; release PRs, product tags, package publication and partial-release recovery | Explicit ownership and publication state matter; its full machinery exceeds a small CLI's needs |
| oclif's release model | npm or archives containing Node, plus optional installers/updater | Distribution format is a choice distinct from command organisation |

Evidence: [GitHub CLI](https://github.com/cli/cli/blob/trunk/docs/releasing.md),
[create-vite manifest](https://github.com/vitejs/vite/blob/main/packages/create-vite/package.json),
[pnpm releasing](https://github.com/pnpm/pnpm/blob/main/RELEASING.md),
[oclif releases](https://oclif.io/docs/releasing/).
Some large projects document tag replacement; do not transfer that to Go module
source releases, whose tooling expects published versions to remain unchanged.
[Go publishing](https://go.dev/doc/modules/publishing).

## Go development channel: follow-up research and integration

User-selected policy: publish successful main builds automatically to `dev`;
publish stable versions and update GitHub's latest stable release only through
manual CI. `latest` means GitHub release metadata, not a literal Git tag.
The implementation remains guidance in the skill; product CI is unchanged.

This is a synthesis of maintained patterns, not a claim that all Go projects use
these channel names. Rclone generates beta artifacts from each default-branch
commit, identifies their source revision, and separates beta/stable installation.
GoReleaser also separates development and stable builds; in April 2026 it replaced
its rolling nightly GitHub release with unique nightly tags to support immutable
releases. These support the separation and source identity; `dev` and manual stable
timing are our selected policy.
[Rclone downloads](https://rclone.org/downloads/#beta-releases),
[GoReleaser immutable releases](https://goreleaser.com/blog/immutable-releases/).

The default simple topology is a rolling non-semver `dev` Git tag with a GitHub
prerelease (`prerelease: true`, `make_latest: false`). Stable CI creates an immutable
module-correct semantic tag and versioned release, then marks that release latest.
Prepare and verify all development artifacts before replacing the rolling assets;
the binary version, notes, and checksum manifest identify its source commit.
Development publication never changes the stable tap or creates stable versions.
[GitHub release metadata](https://docs.github.com/en/rest/releases/releases#create-a-release),
[GoReleaser release metadata](https://goreleaser.com/customization/publish/scm/).

An important topology constraint: GitHub immutable releases lock their tags and
assets. When enabled, retain that policy: publish unique `dev-<full-sha>` prereleases
and update a release-free `dev` source alias after publication. Provide an explicit
installer/manifest resolver from the alias to immutable development artifacts.
A Git alias alone does not produce a GitHub `/releases/download/dev/...` endpoint.
[GitHub immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases),
[Git aliases separate from immutable releases](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/using-immutable-releases-and-tags-to-manage-your-actions-releases).

Go's `@dev`, `@main`, and commit queries can install source without CI publishing
binaries; non-semver references may resolve to pseudo-versions. `@latest` selects
the highest release version, then prerelease when no releases exist, then default
branch when no tags exist. It does not follow GitHub latest metadata or a literal
latest tag. Source access therefore cannot establish CI-only publication, and no
stable-source promise should be made before the first release.
[Go version queries](https://go.dev/ref/mod#version-queries).

GoReleaser OSS snapshots package without publication. Reuse them with an explicit
CI publisher, or preserve native packaging; the built-in nightly publication
feature requires Pro. Do not add a paid requirement to these small CLIs.
[GoReleaser snapshots](https://goreleaser.com/customization/publish/snapshots/),
[GoReleaser nightlies](https://goreleaser.com/customization/publish/nightlies/).

Keep builds pinned to the event/planned SHA, guard stable dispatches to main,
serialize shared channel updates, and reject stale candidates under that lock.
GitHub concurrency does not guarantee dispatch order; cancellation belongs before
publication, not halfway through replacing shared assets. Retain the last
successful dev build on verification failure. In monorepos, include shared inputs
and separate product channel identities; GitHub latest is repository-wide.
[GitHub concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

## Manual CI release contract

1. **Plan:** resolve a source commit, release owner, version, tag, channels, and
   artifact set once. Serialize conflicting releases. Existing tags must identify
   that source. Manual patch selection needs a documented compatibility policy;
   it cannot infer whether features/breaking changes need a different series.
   For npm, make the released manifest and `--version` agree with the plan; keep
   private task-adapter versions outside product release identity. Release notes
   should explain user-visible changes and any upgrade/migration requirements.
2. **Verify:** run applicable checks on that commit. Build assets before packaging;
   verify drift before overwriting comparison targets. Changes to shared libraries,
   generators, lockfiles, or toolchain config affect consumers even outside the
   CLI directory. Keep effective dependency selection correct before optimizing CI.
3. **Package:** make finite archive/tarball checks available without publishing.
   Inspect files, version, binary mode/entry point, dependencies, assets, and
   checksums. Exercise the actual installed artifact in an isolated directory.
   Check help/version and a representative fixture operation, including a failure
   exit and machine output where supported. Use only declared production
   prerequisites, outside the checkout; select relevant supported runtime/platform
   checks rather than treating the maintainer's development runtime as coverage.
4. **Publish:** within the manually triggered CI run, publish the verified bytes
   and release metadata; then update downstream channels. A draft release can
   collect artifacts before exposure.
   Avoid a second uncontrolled rebuild during publication.
5. **Recover:** verify existing artifacts rather than treating release existence
   as completeness. Resume missing package/channel steps; keep the same version
   and bytes. A changed published artifact/source requires a new release under
   the recommended stable policy. Allow explicit existing replacement policies.
6. **Maintain:** document release/new-series/upgrade/recovery steps, supported
   targets and runtime prerequisites, and who owns each downstream publisher.
   Let the installer manage updates unless self-update is a deliberate product
   requirement. For embedded runtimes, updates require rebuilding the artifact.

An npm package/version cannot be republished, even after unpublishing. Recovery
must distinguish packages already accepted by the registry from pending packages.
Stable/prerelease dist-tags are separate from Git tags; publish prereleases to a
deliberate channel such as `next`, not accidentally `latest`.
[npm immutability](https://docs.npmjs.com/cli/v11/commands/npm-publish/),
[npm dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/).

For new npm publication, prefer supported OIDC trusted publishing. Configure each
package's permitted workflow/actions; retain scoped credentials where unsupported.
Current npm requirements include npm >=11.5.1, Node >=22.14, and supported hosted
runners. Automatic provenance additionally needs a public repo and public package.
New publisher configurations can default to staged publishing: inspect the allowed
action rather than assuming direct publication works. This is a tool-setup concern,
not a reason to add an approval flow to every consuming repo.
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Keep workflow topology executable: a tag pushed with `GITHUB_TOKEN` does not
trigger a second push workflow. Invoke dependent publication explicitly, use
reusable workflow/job dependencies, or use an intentionally authorized trigger.
Keep downstream Homebrew validation with the tap, and use narrow credentials
for that repo. Checksums establish byte identity; signing/provenance are distinct
capabilities to select for actual distribution needs.
[GitHub trigger semantics](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

For a failed downstream update after `main` advances, recover against the original
release tag/source, rather than selecting a new patch from current `main`. A
small `docs/release.md` should explain this distinction and give concrete commands.
Avoid building a cross-repo release framework until real duplication/change costs
justify it; any shared helper should have pinned consumers and local verification.

## Integration applied

1. Added the focused reference in existing **Apply / Problematic / Prefer /
   Exception / Verify** format, with source links and illustrative small layouts.
2. Added two short core policies and one routing row to `SKILL.md`: explicit release
   ownership/install contracts; verify shipped artifacts and recover publication.
3. Linked `organisation-cli` and `boundary-runtime-distribution` to the new reference.
   Keep their existing architecture guidance authoritative.
4. Extended `tool-command-contract` with optional finite `package` / `release:check`
   and a documented manual CI dispatch for `release`, honoring existing names.
   These are capability descriptions, not required scripts in every project.
5. Added evaluation cases below to `audit-and-conformance.md`. Kept stable releases
   manual and JS development guidance at native TS/Node 26. Added `release-go-channels`
   for automatic Go dev publication; automatic npm dev publication remains deferred.

| Integrated rule | Scope and meaningful verification |
| --- | --- |
| `cli-release-ownership` | Identify code/module/product owners and release units; prove intended consumers work independently |
| `cli-go-distribution` | Correct tags, source-install graph, metadata and assets; check module without workspace overrides and supported tagged install |
| `cli-js-distribution` | Native TS/Node 26 development and channel-specific packaging; verify source/archive execution or emitted npm installation |
| `release-go-channels` | Automatic main dev builds; manual main stable/latest releases; source identity, stale-run rejection, immutable-release topology and channel install checks |
| `release-version-plan` | One resolved source/version/tag/channel plan; test first release, bump, unrelated tags, existing-tag mismatch and concurrent selection |
| `release-artifact-verification` | Exercise packed artifacts; prove required files/runtime dependencies rather than only source-level tests |
| `release-publish-recovery` | Retry same bytes and unfinished channels; test partial publication, mismatched artifacts and recovery after branch advancement |
| `release-maintenance-docs` | Follow documented release, series change, install/upgrade and failure recovery; report unexecuted external steps |

Suggested evaluations: tiny root Go CLI stays simple; multiple binaries do not
force modules; nested module receives correct tags; workspace-only build cannot
prove installation; private Go task manifest is not an npm release; npm CLI with
raw TS/missing assets fails artifact verification; shared-package change selects
dependent CLI; unrelated monorepo changes do not force unrelated releases;
prerelease does not change stable channel; downstream failure after branch
advancement repairs the original release; existing GoReleaser/scripted CI remains;
an unpaid setup does not receive Pro-only configuration; native TS runs directly
while typechecking remains explicit; npm packaging emits JS without imposing
transpilation on local development; main pushes publish only Go dev artifacts;
stable/latest stays manual; old dev retries do not replace newer builds;
immutable releases retain an explicit development resolver.

## Limits and unresolved questions

Documentation/configuration research only. No claim that any current repo's
release was executed or that proposed checks pass. Verify installed packaging
tool versions before choosing commands. Recipes should be version-matched links,
not frozen latest-version workflows copied into the skill.
[pnpm publication changes](https://pnpm.io/cli/publish).

Unresolved questions: none for this integration. Choose the supported install channel
when implementing each CLI; this does not block the stable CI/Go dev/native TS guidance.
