# Go CI release channels

**Read when:** changing Go stable/dev publication triggers, channel ordering, or development-build recovery.

**Policy status:** Scoped skill policy: successful main builds publish to dev; stable/latest require manual CI. dev is a chosen channel name, not an industry standard.

## `release-go-channels`

**Separate stable and development channels.**

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

Use [CI releases](ci-releases.md) for shared version planning, artifact checks,
and publication recovery. Source installs additionally follow
[Go distribution](go-cli-distribution.md).

## Sources

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
