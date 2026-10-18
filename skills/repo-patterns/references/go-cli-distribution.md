# Go CLI distribution

**Read when:** changing Go binary packaging, module version tags, or supported source installs.

**Policy status:** Go installation semantics and scoped packaging policies; install channels are product decisions.

## `cli-go-distribution`

**Verify Go installation contracts.**

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
source installs require committed generated assets, CI-created refs carry them
([asset refs](#cli-go-generated-asset-refs)), or only release archives supply
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

When publication triggers or stable/dev channels change, read
[CI releases](ci-releases.md) and [Go channels](go-ci-releases.md).
For module ownership changes, also read [Go layout](go.md#module-and-package-layout).

## `cli-go-generated-asset-refs`

**Commit generated assets only on installable refs.**

**Apply:** a Go binary embeds generated assets, such as a frontend bundle, and
`go install` from source is supported.

**Problematic:** `main` recommits a rebuilt bundle on every UI change and CI fails
on stale output; or the assets are ignored and `go install ...@latest` fails with
`pattern dist: no matching files found`; release tags point at `main` commits
without assets; a development ref's pseudo-version sorts below the latest release.

**Prefer:** Go installs the module source exactly as it is at the ref and runs
no generation. Ignore the generated directory on `main`; local builds, tests, and
vet run the asset build first, through the repo's setup/task tool. A fresh
checkout that skips it fails on the missing embed; no special error is needed.
Commit the assets only on CI-created refs, each one commit on top of `main`:

| Ref | Trigger | Commit |
| --- | --- | --- |
| `vX.Y.Z` | Manual stable release | `release: vX.Y.Z`: resolved `main` tip plus assets; push only the tag |
| `edge` | Push to `main`, after the test job passes (`needs:`) | That `main` commit plus assets; force-pushed |

Create each commit without touching branch history: `git add -f <dir>`,
`git write-tree`, then `git commit-tree <tree> -p <main sha>`. Build release
archives from the release commit so archive and source-install commit identity
match. A tag belongs to the `main` commit that is its first parent: rerun checks
and version selection compare `<tag>^1` with the `main` tip, not
`git tag --points-at HEAD`.

Go derives `edge` pseudo-versions from the highest semantic tag among its
ancestors, and release commits are not ancestors of `main`. When the latest
release commit is not already an ancestor, add it as a second parent
(`-p <release commit>`) so `edge` reports `vX.Y.(Z+1)-0.<time>-<sha>`, sorting
after `vX.Y.Z`. Serialize `edge` with `concurrency` and `cancel-in-progress`.
Skip a candidate when the current `edge` first parent already descends from it,
and push with `--force-with-lease=refs/heads/edge:<observed sha>`.

Document `@latest`/`@vX.Y.Z` for stable installs and `@edge` for the latest
`main` that passed CI. `@main`, `@<sha>`, and feature branches no longer build.
`edge` is a source ref; if a `dev` archive channel from
[Go channels](go-ci-releases.md) also exists, keep their names distinct, and
point any tag used for source installs at an asset commit. Earlier tags on
`main` stay valid. Record the choice in the repo's decision records.

**Exception:** commit assets on `main` when they are small or rarely change, or
when `@main`/`@<sha>` installs are required. Archives-only products need neither.
Rulesets must let the CI identity push `edge` and version tags.

**Verify:** simulate before merging: a bare remote, the workflow scripts run with
`GITHUB_SHA` set, then `go install` through Git with an isolated
`GIT_CONFIG_GLOBAL` containing
`url.file://<bare>.insteadOf https://github.com/<owner>/<repo>` and
`GOPROXY=direct GOSUMDB=off GOMODCACHE=<tmp> GOBIN=<tmp>`. Install `@edge`,
`@vX.Y.Z`, and `@latest`; check `--version` ordering and embedded assets; confirm
`@main` fails on the missing embed. Exercise the first `edge` before any new-style
release, a release rerun, and an older `edge` run finishing after a newer one.

## Sources

- [Go module layout](https://go.dev/doc/modules/layout)
- [Go module tag mapping and versioned installation](https://go.dev/ref/mod)
- [Go publishing and unchanged source versions](https://go.dev/doc/modules/publishing)
- [Go build information](https://pkg.go.dev/runtime/debug#ReadBuildInfo)
- [GoReleaser monorepo edition and tags](https://goreleaser.com/customization/monorepo/)
- [Go embed patterns fail without matching files](https://pkg.go.dev/embed)
- [Git commit-tree](https://git-scm.com/docs/git-commit-tree)
- [GitHub Actions job dependencies (`needs`)](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idneeds)
