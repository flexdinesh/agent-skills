---
name: opencode-plugin
description: "Build plugins for OpenCode. Use when creating, debugging, or extending an OpenCode plugin that hooks into events, tools, shell, chat, permissions, compaction, auth, or TUI."
---

# OpenCode Plugin

Guide for building OpenCode plugins that extend behavior via hooks, custom tools, event subscriptions, and TUI customization.

## Key Concepts

- Plugin = async function receiving context, returning hooks object.
- Two mutually exclusive types: **server** (`Plugin`) and **TUI** (`TuiPlugin`). A module exports one, not both.
- Server hooks use input/output pattern: read from `input`, mutate `output` in place.
- All hooks across plugins run sequentially in load order.
- Type with `@opencode-ai/plugin` (server) or `@opencode-ai/plugin/tui` (TUI).

## Project Setup

- Place in `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global).
- Or publish to npm and add to `opencode.json` `plugin` array.
- For deps, add `package.json` in `.opencode/` -- bun installs at startup.
- TypeScript supported natively.

## Server Plugin Scaffold

```ts
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

export const MyPlugin: Plugin = async ({ client, project, directory, worktree, $ }) => {
  return {
    // hooks here
  }
}
```

`PluginInput` fields: `client`, `project`, `directory`, `worktree`, `$` (bun shell), `serverUrl`, `experimental_workspace`.

## TUI Plugin Scaffold

```ts
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"

export const tui: TuiPluginModule["tui"] = async (api, options, meta) => {
  const { client, state, theme, ui, command, route, slots, event, kv, keybind, lifecycle } = api
  // register commands, routes, slots, event listeners
}
```

`TuiPluginApi` fields: `app`, `client`, `command`, `route`, `ui`, `keybind`, `tuiConfig`, `kv`, `state`, `theme`, `event`, `renderer`, `slots`, `plugins`, `lifecycle`.

## Server Hooks

| Hook | Description |
|---|---|
| `event` | Receive all bus events (session, message, file, tool, etc.) |
| `config` | Called with current config on load |
| `tool` | Register custom tools (map of tool definitions) |
| `auth` | Register authentication methods for a provider |
| `provider` | Customize provider models |
| `chat.message` | Intercept new messages, modify parts |
| `chat.params` | Modify LLM parameters (temperature, topP, maxOutputTokens) |
| `chat.headers` | Modify HTTP headers sent to LLM provider |
| `permission.ask` | Intercept permission requests, auto-allow/deny |
| `command.execute.before` | Before slash command execution |
| `tool.execute.before` | Before tool execution, modify args |
| `tool.execute.after` | After tool execution, modify output |
| `tool.definition` | Modify tool descriptions/parameters sent to LLM |
| `shell.env` | Inject environment variables into shell execution |
| `experimental.chat.messages.transform` | Transform chat message history |
| `experimental.chat.system.transform` | Transform system prompt |
| `experimental.session.compacting` | Customize compaction prompt/context |
| `experimental.compaction.autocontinue` | Control auto-continue after compaction |
| `experimental.text.complete` | Modify completed text output |

## Bus Event Types

Events received by the `event` hook via `event.type`:

- **Session**: `session.created`, `session.updated`, `session.deleted`, `session.idle`, `session.error`, `session.status`, `session.compacted`, `session.diff`
- **Message**: `message.updated`, `message.removed`, `message.part.updated`, `message.part.removed`
- **File**: `file.edited`, `file.watcher.updated`
- **Tool**: `tool.execute.before`, `tool.execute.after`
- **Permission**: `permission.asked`, `permission.replied`
- **Command**: `command.executed`
- **LSP**: `lsp.client.diagnostics`, `lsp.updated`
- **Shell**: `shell.env`
- **Server**: `server.connected`
- **Installation**: `installation.updated`
- **Todo**: `todo.updated`
- **TUI**: `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`

## TUI API Surface

| API | Description |
|---|---|
| `command.register()` | Register command palette entries and slash commands |
| `command.trigger(value)` | Programmatically trigger a command |
| `command.show()` | Open the command palette |
| `route.register()` | Register custom full-screen routes/pages |
| `route.navigate(name, params)` | Navigate to a route |
| `slots.register()` | Register UI slot plugins (replace/append/prepend built-in UI) |
| `ui.toast()` | Show toast notifications |
| `ui.dialog` | Dialog stack (replace, clear, setSize) |
| `ui.Dialog/DialogAlert/DialogConfirm/DialogPrompt/DialogSelect` | Dialog components |
| `ui.Prompt` | Prompt input component |
| `event.on(type, handler)` | Subscribe to bus events |
| `keybind.create(defaults, overrides)` | Create keybind sets |
| `kv.get(key)/kv.set(key, value)` | Persistent key-value storage |
| `state` | Reactive app state (sessions, messages, parts, providers, LSP, MCP, VCS) |
| `theme` | Theme access (current colors, set, install, mode) |
| `lifecycle.onDispose(fn)` | Register cleanup on plugin unload |
| `plugins.list/activate/deactivate/add/install` | Manage other plugins |

### Built-in Slot Names

`app`, `home_logo`, `home_prompt`, `home_prompt_right`, `session_prompt`, `session_prompt_right`, `home_bottom`, `home_footer`, `sidebar_title`, `sidebar_content`, `sidebar_footer`.

## Workflow

1. Decide: server plugin (hooks, tools, auth) or TUI plugin (UI, commands, routes).
2. Scaffold with correct type import.
3. Implement hooks -- read `input`, mutate `output` (server); use API methods (TUI).
4. For custom tools, use `tool()` helper with `tool.schema` (zod).
5. Place in `.opencode/plugins/` and restart opencode to test.
6. Use `client.app.log()` for structured logging, not `console.log`.

## Rules

- Always type plugins: `Plugin` from `@opencode-ai/plugin` or `TuiPluginModule` from `@opencode-ai/plugin/tui`.
- Server and TUI are mutually exclusive per module (`tui?: never` / `server?: never`).
- Use `tool.schema` (re-exported zod) for tool arg schemas.
- Server hooks are async -- always return `Promise<void>`.
- Mutate `output` in place; don't return new objects.
- Plugin tools with same name as built-in tools take precedence.
- `experimental.*` hooks may change between versions.
- TUI plugins must clean up via `lifecycle.onDispose()`.
- TUI slot modes: `"replace"` (default), `"append"`, `"prepend"`.

## References

- `references/server-hooks.ts` -- complete example code for every server hook.
- `references/tui-plugin.ts` -- complete example code for TUI plugin API.
