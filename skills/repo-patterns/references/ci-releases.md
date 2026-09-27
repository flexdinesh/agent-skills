# CLI CI releases

**Read when:** setting up or auditing stable CLI publication, version planning, artifact checks, or retry recovery.

**Policy status:** Stable versions and latest publish only through manually triggered CI. Automatic stable/npm dev publication and release-PR tooling are outside this skill's scope.

## `release-version-plan`

**Resolve a release plan once.**

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
the development channel under [Go channel policy](go-ci-releases.md#release-go-channels). Shared library, generator,
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

**Test the packaged artifact.**

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

**Resume the original publication.**

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
The explicitly mutable Go `dev` alias/assets follow
[Go channel policy](go-ci-releases.md#release-go-channels); an obsolete
dev retry must not replace a newer successful build.

## Sources

- [GitHub publication concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [npm version immutability](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
- [npm dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [GitHub workflow trigger semantics](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [Servef release](https://github.com/flexdinesh/servef/blob/d9da37533887293bd27250992b0a0e0a6d7ce611/.github/workflows/release.yml)
- [SSH Drop release configuration](https://github.com/flexdinesh/ssh-drop/blob/a9aea9fa1b251e965e1478dea8e97c33e44638f1/.goreleaser.yaml)
- [Servediff release](https://github.com/flexdinesh/servediff/blob/3b565685fe5d1b3d9087293030cf0e1d517c99ea/.github/workflows/release.yml)
- [Tokeninsights release](https://github.com/flexdinesh/tokeninsights/blob/6c06411682e0eff385f0d4ba990de8534d73fcee/.github/workflows/release.yml)
