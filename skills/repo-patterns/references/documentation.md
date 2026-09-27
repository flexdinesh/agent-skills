# Development and release documentation

**Read when:** changing run/setup instructions, command discoverability, installation, or release/recovery docs.

**Policy status:** Canonical-guide locations are fallbacks; retain existing locations and commands.

## `tool-development-docs`

**Document runnable development paths.**

**Apply:** documenting or auditing development runs within the requested scope.

**Problematic:** root `dev` has undocumented dependencies; individual app commands
are missing; competing guides drift; setup instructions bury commands in architecture.

**Prefer:** where doc location is undecided, use `docs/development.md` and link it
from README. Keep one canonical guide, updated with changed commands. Briefly cover:

- Prerequisites and setup; state the working directory.
- What root `dev` starts and commands for one part or selected combinations.
- Required dependencies or fixture modes; relevant config and URLs/ports.
- Scenario selection, data preparation, seed repeat semantics, and safe reset scope
  where applicable; see [test data and setup](test-data-and-setup.md).
- Shutdown and cleanup, including mutable development state where applicable.

Use a small purpose/command table and short action-focused steps. Include only
details needed to run the relevant parts; link architecture and full configuration
reference elsewhere. Brevity must preserve prerequisites and lifecycle instructions.

**Exception:** update an existing canonical development guide in its established
location instead of duplicating it. Libraries and one-shot CLIs document applicable
checks/sample runs rather than inventing a long-lived `dev` capability.

**Verify:** match documented commands to scripts/tasks and their actual dependencies.
Within authorized isolated validation, follow setup and relevant single/combined runs;
verify expected endpoints, shutdown, and cleanup. Report unexecuted runs honestly.

## `release-maintenance-docs`

**Document install and release recovery.**

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

- [Servediff development commands and managed fixture server](https://github.com/flexdinesh/servediff/blob/b9a7ef4c8e213d6c65ded790eba66daaf4e25879/docs/development.md)
- [Tokeninsights individual and combined development runs](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/docs/development.md)
- [Diátaxis goal-oriented how-to guides](https://diataxis.fr/how-to-guides/)
- [Google concise procedures](https://developers.google.com/style/procedures)
