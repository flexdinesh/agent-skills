# pnpm workspaces and commands

**Read when:** pnpm is established or selected for JS dependencies, workspace packaging, or task selection.

**Policy status:** pnpm-specific implementation of the shared tooling policies; retain another supported package manager.

## Workspace dependencies

Apply [dependency ownership](tooling-and-commands.md#tool-dependency-ownership)
when changing manifests. Use `workspace:` for local dependencies where
appropriate. Catalogs centralize selected version ranges without erasing
consumer declarations or forcing incompatible projects onto one version.

When packing for publication, use tooling that rewrites `workspace:` ranges.
Installation away from workspace links must resolve all production dependencies;
read [Node distribution](node-cli-distribution.md) for CLI packaging.

## Task selection

Owning packages keep their actual JS commands. A Vite package might define:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

A JS root can select its primary workflow and individual apps:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel --filter @repo/web --filter @repo/api run dev",
    "dev:web": "pnpm --filter @repo/web run dev",
    "dev:api": "pnpm --filter @repo/api run dev"
  }
}
```

These are illustrative names after each package defines `dev`.
Use `pnpm run dev:web` for one part or repeated filters for a selected set.
`--parallel` skips dependency ordering; finish required builds/setup first,
then own readiness and shutdown for the foreground processes.

For changed shared packages, `...package` selects dependents and
`package...` selects dependencies. Verify affected consumers, not only
the libraries they import. Check installed-version filter semantics.

## Sources

- [Vite production vs preview](https://vite.dev/guide/static-deploy.html)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [pnpm catalogs](https://pnpm.io/catalogs)
- [pnpm filtering](https://pnpm.io/filtering)
- [pnpm script execution and parallel runs](https://pnpm.io/cli/run)
- [pnpm workspace publication](https://pnpm.io/workspaces#publishing-workspace-packages)
