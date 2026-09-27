# Node CLI distribution

**Read when:** changing Node CLI packaging, npm manifests, production dependencies, or consumer installation.

**Policy status:** Node/npm installation semantics; preserve supported runtime/build conventions.

## `cli-js-distribution`

**Verify Node installation contracts.**

**Apply:** TypeScript/Node CLI workspace packaging or consumer installation.

**Problematic:** a native TS CLI gains an unnecessary development transpiler;
type stripping is treated as typechecking; npm ships a raw TS executable that
works locally but fails under `node_modules`.

**Prefer:** resolve install channels per product. For native TypeScript CLI
development, read [Node execution](node.md#native-typescript-cli-execution).
Source/archive runs outside `node_modules` can retain native TS with Node and
production dependencies. npm installation
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

When publication/version planning changes, read [CI releases](ci-releases.md).
For pnpm workspace packaging changes, also read [pnpm](pnpm.md).

## Sources

- [Node TypeScript execution and dependency restrictions](https://nodejs.org/api/typescript.html)
- [npm package fields](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [pnpm workspace publication](https://pnpm.io/workspaces#publishing-workspace-packages)
