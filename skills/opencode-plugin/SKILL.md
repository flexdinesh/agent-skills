---
name: opencode-plugin
description: "Build plugins for OpenCode. Use only when the user explicitly invokes `opencode-plugin` or `$opencode-plugin`; do not auto-invoke from context."
---

# OpenCode Plugin
Manual invocation only: use this skill only when the user explicitly invokes `opencode-plugin` or `$opencode-plugin`; do not auto-invoke from task context.

Build opencode plugins that extend server behavior with hooks/tools/auth/providers or extend the terminal UI with commands, routes, slots, notifications, themes, and keymaps.

## Quick Start
```ts
import type { Plugin, PluginModule } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

const server: Plugin = async ({ client, project, directory }) => ({
  tool: {
    greet: tool({
      description: "Greet someone by name",
      args: { name: tool.schema.string() },
      async execute(args, context) {
        context.metadata({ title: `Greeting ${args.name}` })
        return `Hello ${args.name} from ${context.directory}`
      },
    }),
  },
})

export default { id: "acme.server", server } satisfies PluginModule & { id: string }
```
```ts
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const tui: TuiPlugin = async (api, options, meta) => {
  api.keymap.registerLayer({
    mode: "base",
    commands: [{ name: "acme.hello", title: "Hello", category: "Plugin", namespace: "palette", run: () => api.ui.toast({ message: `Hello from ${meta.id}` }) }],
    bindings: [{ key: "ctrl+shift+h", cmd: "acme.hello", desc: "Say hello" }],
  })
}

export default { id: "acme.tui", tui } satisfies TuiPluginModule & { id: string }
```

## Rules
- Plugin modules are target-exclusive: default export `{ id?, server }` or `{ id?, tui }`, never both.
- Use `Plugin`/`PluginModule` from `@opencode-ai/plugin` and `TuiPlugin`/`TuiPluginModule` from `@opencode-ai/plugin/tui`.
- Path/file plugins must export a non-empty `id`; npm plugins may omit `id` and fall back to package name.
- TUI loader reads only the default export object; named TUI exports are ignored.
- Server loader supports current default export object and legacy function/named exports.
- Server hooks read `input`, mutate `output` in place, and return `void`.
- Plugin tools with the same name as built-in tools take precedence.
- `experimental.*` hooks may change between versions.
- Prefer `api.keymap.registerLayer` over deprecated `api.command`.
- Auth hook `prompts[].condition` is deprecated. Use `when: { key, op: "eq" | "neq", value }`.

## Config And Loading
- Server plugins are configured in `opencode.json` under `plugin` or auto-discovered from `.opencode/plugin(s)/*.{ts,js}` and config-scope plugin dirs.
- TUI plugins are configured in `tui.json` under `plugin`; TUI plugins are not auto-discovered from `.opencode/plugins/`.
- Plugin spec forms: `"pkg"`, `"pkg@1.2.3"`, `"./plugin.ts"`, `"file:///abs/plugin.js"`, or `["pkg", { "option": true }]`.
- Relative plugin paths resolve relative to the config file that declares them.
- Server npm packages resolve `exports["./server"]`, then `package.json` `main`.
- TUI npm packages resolve `exports["./tui"]` or valid `oc-themes`; TUI never falls back to `main` or `exports["."]`.
- File directory plugins without `package.json` can fall back to `index.ts`, `index.tsx`, `index.js`, `index.mjs`, or `index.cjs`.
- Local config-scoped plugins can import `@opencode-ai/plugin` after opencode installs config-dir deps with Bun.
- npm plugins can declare `package.json` `engines.opencode` compatibility.
- `exports["./server"].config` and `exports["./tui"].config` provide default options during install.

## Lifecycle
- External plugin resolution/import may run in parallel; server hook execution and TUI activation run sequentially in deterministic order.
- TUI init failure rolls back that plugin's tracked registrations and loading continues.
- TUI cleanup runs in reverse registration order, awaits disposers, and has a 5 second budget per plugin.
- `api.lifecycle.signal` is aborted before cleanup handlers run.
- TUI runtime tracks cleanup for `keymap`, `route`, `event`, `slots`, `mode`, and `attention.soundboard.registerPack`; component-level cleanup is still recommended.
- `plugin_enabled` is keyed by plugin id; persisted TUI KV state overrides config on startup.

## APIs
- `PluginInput`: `client`, `project`, `directory`, `worktree`, `$`, `serverUrl`, `experimental_workspace`.
- `TuiPluginApi`: `app`, `attention`, `keys`, `keymap`, `mode`, `route`, `ui`, `tuiConfig`, `kv`, `state`, `theme`, `client`, `event`, `renderer`, `slots`, `plugins`, `lifecycle`.
- `TuiPluginMeta`: `state`, `id`, `source`, `spec`, `target`, `requested`, `version`, `modified`, `first_time`, `last_time`, `time_changed`, `load_count`, `fingerprint`.
- TUI `api.plugins.install(spec, options?)` patches config but does not load into the current session; call `api.plugins.add(spec)` after install to load now.
- TUI `api.plugins.activate/deactivate(id)` persists desired state into KV; `active` means initialized.
- Use `client.app.log()` for structured server logging. Avoid relying on `console.log` in production plugins.

## Server Hooks
`dispose`, `event`, `config`, `tool`, `auth`, `provider`, `chat.message`, `chat.params`, `chat.headers`, `permission.ask`, `command.execute.before`, `tool.execute.before`, `tool.execute.after`, `tool.definition`, `shell.env`, `experimental.chat.messages.transform`, `experimental.chat.system.transform`, `experimental.provider.small_model`, `experimental.session.compacting`, `experimental.compaction.autocontinue`, `experimental.text.complete`.

## Events And References
- Server `event` hook is typed with v1 `Event` from `@opencode-ai/sdk`; TUI `api.event.on` is typed with v2 `Event` from `@opencode-ai/sdk/v2`.
- See `references/events.md` for typed server/TUI event lists and differences.
- See `references/server-hooks.ts` for complete server hook examples.
- See `references/tui-plugin.tsx` for complete TUI API examples.
