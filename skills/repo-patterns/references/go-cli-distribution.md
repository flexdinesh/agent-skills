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

When publication triggers or stable/dev channels change, read
[CI releases](ci-releases.md) and [Go channels](go-ci-releases.md).
For module ownership changes, also read [Go layout](go.md#module-and-package-layout).

## Sources

- [Go module layout](https://go.dev/doc/modules/layout)
- [Go module tag mapping and versioned installation](https://go.dev/ref/mod)
- [Go publishing and unchanged source versions](https://go.dev/doc/modules/publishing)
- [Go build information](https://pkg.go.dev/runtime/debug#ReadBuildInfo)
- [GoReleaser monorepo edition and tags](https://goreleaser.com/customization/monorepo/)
