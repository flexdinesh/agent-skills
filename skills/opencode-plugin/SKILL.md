---
name: opencode-plugin
description: "Build plugins for OpenCode. Use only when the user explicitly invokes `opencode-plugin` or `$opencode-plugin`; do not auto-invoke from context."
---

# OpenCode Plugin

Manual invocation only: use this skill only when the user explicitly invokes `opencode-plugin` or `$opencode-plugin`; do not auto-invoke from task context.

Guide for building opencode plugins that extend server behavior via hooks/tools/auth/providers or extend the terminal UI via commands, routes, slots, notifications, themes, and keymaps.

## Key Concepts

- Plugin modules are target-exclusive: export server or TUI, never both.
- Current module shape is default export object: `{ id?, server }` or `{ id?, tui }`.
- Server plugins are typed from `@opencode-ai/plugin`; TUI plugins are typed from `@opencode-ai/plugin/tui`.
- Server hooks use input/output pattern: read `input`, mutate `output` in place, return `void`.
- TUI plugins run in the terminal UI process and receive `tui(api, options, meta)`.
- All hooks/activations run in deterministic load order. External plugin imports may happen in parallel.

## Config And Loading

- Server plugins are configured in `opencode.json` under `plugin` or auto-discovered from `.opencode/plugin(s)/*.{ts,js}` and config-scope plugin dirs.
- TUI plugins are configured in `tui.json` under `plugin`; TUI plugins are not auto-discovered from `.opencode/plugins/`.
- TUI config schema is `https://opencode.ai/tui.json`; server config schema is `https://opencode.ai/config.json`.
- Plugin spec forms: `"pkg"`, `"pkg@1.2.3"`, `"./plugin.ts"`, `"file:///abs/plugin.js"`, or `["pkg", { "option": true }]`.
- Relative plugin paths resolve relative to the config file that declares them.
- For local deps, add `package.json` in the config dir (`.opencode/` or global config dir); opencode installs `@opencode-ai/plugin` and deps with Bun.
- npm plugins can declare compatibility with `package.json` `engines.opencode`.
- npm packages can expose `exports["./server"]`, `exports["./tui"]`, and optional `oc-themes` for TUI theme-only packages.

## Server Plugin Scaffold

```ts
import type { Plugin, PluginModule } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

const server: Plugin = async ({ client, project, directory, worktree, $, serverUrl, experimental_workspace }) => {
  await client.app.log({
    body: { service: "my-plugin", level: "info", message: "loaded", extra: { project: project.id, directory } },
  })

  return {
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
  }
}

export default { id: "acme.server", server } satisfies PluginModule & { id: string }
```

`PluginInput` fields: `client`, `project`, `directory`, `worktree`, `$` (Bun shell), `serverUrl`, `experimental_workspace`.

## TUI Plugin Scaffold

```ts
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"

const tui: TuiPlugin = async (api, options, meta) => {
  api.keymap.registerLayer({
    mode: "base",
    commands: [
      {
        name: "acme.hello",
        title: "Hello",
        category: "Plugin",
        namespace: "palette",
        slashName: "hello",
        run() {
          api.ui.toast({ variant: "success", message: `Hello from ${meta.id}` })
        },
      },
    ],
    bindings: [{ key: "ctrl+shift+h", cmd: "acme.hello", desc: "Say hello" }],
  })
}

export default { id: "acme.tui", tui } satisfies TuiPluginModule & { id: string }
```

`TuiPluginApi` fields: `app`, `attention`, `keys`, `keymap`, `mode`, `route`, `ui`, `tuiConfig`, `kv`, `state`, `theme`, `client`, `event`, `renderer`, `slots`, `plugins`, `lifecycle`. `command` still exists for v1 compatibility but is deprecated; prefer `keymap`.

## Server Hooks

| Hook | Description |
|---|---|
| `dispose` | Cleanup on server plugin unload |
| `event` | Receive all bus events |
| `config` | Called with current merged server config on load |
| `tool` | Register custom tools |
| `auth` | Register authentication methods for a provider |
| `provider` | Customize provider models |
| `chat.message` | Intercept new messages, modify message/parts |
| `chat.params` | Modify LLM parameters (`temperature`, `topP`, `topK`, `maxOutputTokens`, `options`) |
| `chat.headers` | Modify HTTP headers sent to LLM provider |
| `permission.ask` | Intercept permission requests, auto-allow/deny/ask |
| `command.execute.before` | Before slash command execution |
| `tool.execute.before` | Before tool execution, modify args |
| `tool.execute.after` | After tool execution, modify title/output/metadata |
| `tool.definition` | Modify tool descriptions/parameters sent to LLM |
| `shell.env` | Inject environment variables into shell execution |
| `experimental.chat.messages.transform` | Transform chat message history |
| `experimental.chat.system.transform` | Transform system prompt |
| `experimental.session.compacting` | Customize compaction prompt/context |
| `experimental.compaction.autocontinue` | Control auto-continue after compaction |
| `experimental.text.complete` | Modify completed text output |

## Bus Event Types

Events received by server `event` hook and TUI `api.event.on(type, handler)` include:

- **Global/server**: `server.connected`, `global.disposed`, `server.instance.disposed`
- **Session**: `session.created`, `session.updated`, `session.deleted`, `session.idle`, `session.error`, `session.status`, `session.compacted`, `session.diff`
- **Session next stream**: `session.next.prompted`, `session.next.synthetic`, `session.next.agent.switched`, `session.next.model.switched`, `session.next.step.started`, `session.next.step.ended`, `session.next.step.failed`, `session.next.text.started`, `session.next.text.delta`, `session.next.text.ended`, `session.next.reasoning.started`, `session.next.reasoning.delta`, `session.next.reasoning.ended`, `session.next.tool.input.started`, `session.next.tool.input.delta`, `session.next.tool.input.ended`, `session.next.tool.called`, `session.next.tool.progress`, `session.next.tool.success`, `session.next.tool.failed`, `session.next.retried`, `session.next.compaction.started`, `session.next.compaction.delta`, `session.next.compaction.ended`
- **Message**: `message.updated`, `message.removed`, `message.part.delta`, `message.part.updated`, `message.part.removed`
- **File/project/VCS**: `file.edited`, `file.watcher.updated`, `project.updated`, `vcs.branch.updated`
- **Permission/question**: `permission.asked`, `permission.replied`, `question.asked`, `question.replied`, `question.rejected`
- **Command/TUI**: `command.executed`, `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`, `tui.session.select`
- **LSP/MCP**: `lsp.client.diagnostics`, `lsp.updated`, `mcp.tools.changed`, `mcp.browser.open.failed`
- **Workspace/worktree/PTY**: `workspace.ready`, `workspace.failed`, `workspace.status`, `worktree.ready`, `worktree.failed`, `pty.created`, `pty.updated`, `pty.exited`, `pty.deleted`
- **Installation/catalog/account/todo**: `installation.updated`, `installation.update-available`, `catalog.model.updated`, `models-dev.refreshed`, `account.added`, `account.removed`, `account.switched`, `todo.updated`

Note: `tool.execute.before` and `tool.execute.after` are server hooks, not current bus events. Tool progress is represented in the event stream by `session.next.tool.*` events.

## TUI API Surface

| API | Description |
|---|---|
| `attention.notify(input)` | Trigger host-owned notification/sound attention |
| `attention.soundboard` | Register/list/activate semantic sound packs |
| `keymap.registerLayer()` | Register commands, palette entries, slash commands, and key bindings |
| `keymap.dispatchCommand(name)` | Execute a command with user-style semantics |
| `keys.formatSequence()` / `keys.formatBindings()` | Format shortcuts using host display policy |
| `mode.current()` / `mode.push(name)` | Read/push keymap modes; default host mode is `base` |
| `route.register()` / `route.navigate()` / `route.current` | Register and navigate custom full-screen routes |
| `slots.register()` | Register Solid slot plugins; runtime tracks cleanup |
| `ui.toast()` | Show in-TUI toast, not system notification |
| `ui.dialog` | Dialog stack (`replace`, `clear`, `setSize`, `size`, `depth`, `open`) |
| `ui.Dialog/DialogAlert/DialogConfirm/DialogPrompt/DialogSelect` | Built-in dialog components |
| `ui.Slot` / `ui.Prompt` | Render registered slots or host prompt component |
| `event.on(type, handler)` | Subscribe to event stream; runtime tracks cleanup |
| `kv.get(key)/kv.set(key, value)` | Shared persistent TUI KV (`state/kv.json`), not plugin-namespaced |
| `state` | Live synced state: config, paths, providers, sessions, parts, LSP, MCP, VCS |
| `theme` | Current theme, selected theme, install/set/has/mode/ready |
| `plugins.list/activate/deactivate/add/install` | Inspect and manage TUI plugins at runtime |
| `lifecycle.signal/onDispose(fn)` | Cleanup and abort signal on deactivate/shutdown |

### Attention API

`api.attention.notify({ title?, message, notification?, sound? })` requests user attention while keeping OS notifications and audio owned by the host.

- `message` is required; `title` defaults to `"opencode"`.
- `notification` is `boolean | { when?: "always" | "focused" | "blurred" }`; default is enabled and `when: "blurred"`.
- `sound` is `boolean | { name?: "default" | "question" | "permission" | "error" | "done" | "subagent_done"; volume?: number; when?: "always" | "focused" | "blurred" }`; default is enabled and `when: "always"`.
- Return value: `{ ok, notification, sound, skipped? }` where `skipped` can be `attention_disabled`, `empty_message`, `blurred`, `focused`, `focus_unknown`, or `renderer_destroyed`.
- TUI config `attention.enabled` defaults to `false`; `notifications` and `sound` default to `true`; `volume` defaults to `0.4`; `sound_pack` defaults to `opencode.default`.
- Prefer privacy-safe notification text. Avoid full prompts, paths, commands, errors, secrets, or file contents.

Sound packs:

```ts
const unregister = api.attention.soundboard.registerPack({
  id: "acme.soft",
  name: "Acme Soft",
  sounds: {
    done: "sounds/done.mp3",
    error: "sounds/error.mp3",
  },
})

api.attention.soundboard.activate("acme.soft", { persist: true })
api.lifecycle.onDispose(unregister)
```

Relative sound paths resolve from the plugin root. Runtime also auto-disposes registered packs on plugin deactivation.

### Built-in Slot Names

`app`, `app_bottom`, `home_logo`, `home_prompt`, `home_prompt_right`, `session_prompt`, `session_prompt_right`, `home_bottom`, `home_footer`, `sidebar_title`, `sidebar_content`, `sidebar_footer`.

## Workflow

1. Decide target: server plugin (`opencode.json`, hooks/tools/auth/provider) or TUI plugin (`tui.json`, UI/keymap/routes/attention/themes).
2. Use current default export object shape: `{ id, server }` or `{ id, tui }`.
3. Server: mutate hook output objects in place and use `tool()` with `tool.schema` for custom tools.
4. TUI: prefer `api.keymap.registerLayer` over deprecated `api.command`; use `api.attention.notify` for system attention and `api.ui.toast` for in-TUI messages.
5. Restart opencode after changing config, plugin files, deps, or skills.
6. Use `client.app.log()` for structured server logging. Avoid relying on `console.log` in production plugins.

## Rules

- Always type plugins: `Plugin`/`PluginModule` from `@opencode-ai/plugin` or `TuiPlugin`/`TuiPluginModule` from `@opencode-ai/plugin/tui`.
- A single module must not export both `server` and `tui`.
- Path/file plugins must export a non-empty `id`; npm plugins may omit `id` and fall back to package name.
- TUI loader reads only default export object; named TUI exports are ignored.
- Server loader supports current default export object and legacy function exports.
- Plugin tools with same name as built-in tools take precedence.
- `experimental.*` hooks may change between versions.
- TUI slot modes come from OpenTUI `SlotMode`; common modes are `replace`, `append`, and `prepend`, but host slots may define stricter behavior.
- Disposers returned from TUI `keymap`, `route`, `event`, `slots`, `mode`, and `attention.soundboard.registerPack` are tracked by runtime cleanup; explicit component cleanup is still recommended for component lifetimes.

## References

- `references/server-hooks.ts` -- complete example code for every server hook.
- `references/tui-plugin.tsx` -- complete example code for TUI plugin API.
