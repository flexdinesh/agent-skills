---
name: pi-extension
description: "Build extensions for Pi. Use only when the user explicitly invokes `pi-extension` or `$pi-extension`; do not auto-invoke from context."
---

# Pi Extension
Manual invocation only: use this skill only when the user explicitly invokes `pi-extension` or `$pi-extension`; do not auto-invoke from task context.

Build Pi extensions: TypeScript modules that subscribe to lifecycle events, register LLM-callable tools, add slash commands/providers, and render custom TUI.

## Quick Start
```ts
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { Type } from "typebox"

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_e, ctx) => {
    ctx.ui.notify("Extension loaded!", "info")
  })

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
      const ok = await ctx.ui.confirm("Dangerous!", "Allow rm -rf?")
      if (!ok) return { block: true, reason: "Blocked by user" }
    }
  })

  pi.registerTool({
    name: "greet",
    label: "Greet",
    description: "Greet someone by name",
    parameters: Type.Object({ name: Type.String({ description: "Name to greet" }) }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      return { content: [{ type: "text", text: `Hello, ${params.name}!` }], details: {} }
    },
  })

  pi.registerCommand("hello", {
    description: "Say hello",
    handler: async (args, ctx) => { ctx.ui.notify(`Hello ${args || "world"}!`, "info") },
  })
}
```
Test: `pi -e ./my-extension.ts`

## Rules
- Default export is a factory `function(pi: ExtensionAPI)` (sync or async). Loaded via jiti — TS works, no build step.
- Async factory is awaited before `session_start`, `resources_discover`, and flushing `registerProvider()` queues. Use it for dynamic model discovery so models appear in `pi --list-models`.
- Do NOT start background resources (processes, watchers, sockets, timers) in the factory; factories may run with no session. Defer to `session_start` (or the tool/command/event that needs it); close session-scoped resources in an idempotent `session_shutdown` handler.
- `tool_call`: `event.input` is mutable — mutate in place to patch args; mutations affect execution, are seen by later handlers, and are NOT re-validated. Return `{ block: true, reason? }` to block.
- Tool errors: **throw** from `execute` (caught, reported to LLM with `isError: true`, execution continues). Returning a value never sets `isError`.
- Tools MUST truncate output (built-in limit 50KB AND 2000 lines). Use `truncateHead`/`truncateTail`/`truncateLine`; tell the LLM when truncated and where the full version is.
- File-mutating tools: wrap read-modify-write in `withFileMutationQueue(absolutePath, async () => …)` (resolve real path so symlinks share a queue).
- Guard UI: `ctx.hasUI` before dialogs/notifications; `ctx.mode === "tui"` before `custom()`/component factories.
- Use `CONFIG_DIR_NAME` (not hardcoded `.pi`) for project-local config paths.
- `before_provider_request` payload rewrites are NOT reflected by `ctx.getSystemPrompt()`.

## Locations & Loading
- Auto-discovered (hot-reloadable via `/reload`): `~/.pi/agent/extensions/*.ts` (global), `.pi/extensions/*.ts` (project-local); also `*/index.ts` subdir forms. Project-local loads only after the project is trusted.
- `settings.json`: `packages` (`"npm:@foo/bar@1.0.0"`, `"git:github.com/u/r@v1"`) and `extensions` (`"/abs/path.ts"` or dir).
- Package form: `package.json` `"pi": { "extensions": ["./src/index.ts"] }` + `dependencies`; `pi install` uses production install so runtime deps must be in `dependencies`.
- One-off test: `pi -e ./path.ts`.

## Imports
- `@earendil-works/pi-coding-agent` — `ExtensionAPI`/`ExtensionContext`/`ExtensionCommandContext`, `CONFIG_DIR_NAME`, guards (`isToolCallEventType`, `isBashToolResult`), tool factories (`createReadTool`, `createBashTool`, `createLocalBashOperations`), truncation utils.
- `typebox` (tool schemas); `@earendil-works/pi-ai` (`StringEnum` Google-compatible enums; prefer over `Type.Union`/`Literal`); `@earendil-works/pi-tui` (`Text`, `Component`, `matchesKey`, `AutocompleteItem`).

## Lifecycle
Startup: `project_trust` (global/CLI only) → `session_start {reason:"startup"}` → `resources_discover`.
Per prompt: ext-cmds checked → `input` → skill/template expand → `before_agent_start` → `agent_start` → message events → turn loop (`turn_start`→`context`→`before_provider_request`→`after_provider_response`→ tool-exec events →`turn_end`) → `agent_end`.
Replace: `/new`,`/resume` → `session_before_switch` → `session_shutdown` → `session_start {reason}` → `resources_discover`. `/fork`,`/clone` similar via `session_before_fork`. Exit → `session_shutdown`.

## ExtensionContext (`ctx`)
`ui`, `mode` (`"tui"|"rpc"|"json"|"print"`), `hasUI`, `cwd`, `isProjectTrusted()`, `sessionManager` (ro: `getEntries()`,`getBranch()`,`getLeafId()`,`getSessionFile()`,`getLabel(id)`), `modelRegistry`/`model`, `signal` (agent AbortSignal; `undefined` when idle), `isIdle()`, `abort()`, `hasPendingMessages()`, `shutdown()`, `getContextUsage()`, `compact({customInstructions,onComplete,onError})`, `getSystemPrompt()`.

## ExtensionCommandContext (commands only — calling from handlers can deadlock)
`getSystemPromptOptions()` (may include full context-file contents — treat as sensitive), `waitForIdle()`, `newSession({parentSession,setup,withSession})`, `fork(entryId,{position,withSession})`, `navigateTree(targetId,{summarize,customInstructions,replaceInstructions,label})`, `switchSession(path,{withSession})`, `reload()`.
Footgun: `withSession` runs in the OLD closure after `session_shutdown`; old `pi`/`ctx`/`sessionManager` are stale and throw — use only the `ctx` passed to `withSession`. Capture plain data only.

## ExtensionAPI (`pi`)
`on(event,handler)`, `registerTool(def)`, `sendMessage({customType,content,display?,details?},{deliverAs,triggerTurn})`, `sendUserMessage(content,{deliverAs})` (always triggers a turn; `deliverAs` required while streaming), `appendEntry(customType,data?)` (persist; not in LLM context), `setSessionName`, `getSessionName`, `setLabel(entryId,label)`, `registerCommand(name,{description?,getArgumentCompletions?,handler})`, `getCommands()`, `registerMessageRenderer(customType,(msg,{expanded},theme)=>Component)`, `registerShortcut(shortcut,{description?,handler})`, `registerFlag(name,{description?,type,default})`, `exec(cmd,args,{signal?,timeout?})`, `getActiveTools()`/`getAllTools()`/`setActiveTools(names)`, `setModel(model)` (returns `false` if no key), `getThinkingLevel()`/`setThinkingLevel(level)`, `events` (cross-ext bus), `registerProvider(name,config)`, `unregisterProvider(name)`.

## Events
Startup: `project_trust`, `resources_discover`.
Session: `session_start`, `session_before_switch`, `session_before_fork`, `session_before_compact`, `session_compact`, `session_before_tree`, `session_tree`, `session_shutdown`.
Agent: `before_agent_start`, `agent_start`, `agent_end`, `turn_start`, `turn_end`, `message_start`, `message_update`, `message_end`, `tool_execution_start`, `tool_execution_update`, `tool_execution_end`, `context`, `before_provider_request`, `after_provider_response`.
Model: `model_select`, `thinking_level_select`.
Tool: `tool_call` (block/mutate), `tool_result` (modify, chains middleware-style).
Other: `user_bash` (intercept), `input` (intercept/transform/handle).

## Custom Tools
`registerTool({ name, label, description, promptSnippet?, promptGuidelines?, parameters: Type.Object({…}), prepareArguments?(args), async execute(toolCallId,params,signal,onUpdate,ctx){ return {content:[{type:"text",text}], details?, terminate?} }, renderCall?, renderResult?, renderShell? })`. `onUpdate?.({content,details})` streams progress. `terminate:true` skips the auto follow-up only if every tool in the batch terminates. Override built-ins by reusing a name (`read`,`bash`,`edit`,`write`,`grep`,`find`,`ls`); renderers resolve per-slot and are independent of the execution override; `promptSnippet`/`promptGuidelines` are NOT inherited — redefine them.

## Custom UI
Dialogs: `ui.select/confirm/input/editor`. Fire-and-forget: `ui.notify(msg,"info"|"warning"|"error")`, `setStatus(key,text|undefined)`, `setWidget(key,lines|fn|undefined,{placement})`, `setFooter`, `setTitle`, `setEditorText`/`getEditorText`, `pasteToEditor`, working-loader setters. `ui.custom<T>((tui,theme,keybindings,done)=>Component,{overlay?})` replaces the editor until `done(value)`. `addAutocompleteProvider`, `setEditorComponent`, `theme`/`getAllThemes`/`getTheme`/`setTheme`. Tool rendering via `renderCall`/`renderResult`; `theme.fg("accent",text)`, `highlightCode(code,lang,theme)`, `keyHint("app.tools.expand","to expand")`.

## References
- `references/events.md` (event catalog: payloads, return shapes, ordering); `references/extension.ts` (factory: events, tools, commands, providers, state); `references/custom-ui.ts` (full `ctx.ui` surface + rendering).
- Official docs: https://pi.dev/docs/latest/extensions; examples: https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions
