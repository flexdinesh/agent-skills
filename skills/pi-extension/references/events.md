# Events

Every event `pi.on(name, async (event, ctx) => …)` can subscribe to. Return shapes vary: some can **block** (`{ cancel }` / `{ block }`), some can **modify** (`{ messages }`, `{ compaction }`, partial patches), some are **notification-only**. Unless noted, return values are ignored. Handlers run in extension load order; where chaining applies, each handler sees the result of prior handlers.

## Lifecycle flow
```
startup: project_trust (global/CLI only) -> session_start {reason:"startup"} -> resources_discover
per prompt: ext-cmd -> input -> [skill/template expand] -> before_agent_start -> agent_start
  -> message_start/update/end -> turn loop:
       turn_start -> context -> before_provider_request -> after_provider_response
       -> tool_execution_start -> tool_call (block) -> tool_execution_update
       -> tool_result (modify) -> tool_execution_end -> turn_end
  -> agent_end
/new,/resume: session_before_switch -> session_shutdown -> session_start {reason} -> resources_discover
/fork,/clone: session_before_fork -> session_shutdown -> session_start {reason:"fork"} -> resources_discover
/compact: session_before_compact -> session_compact
/tree: session_before_tree -> session_tree
exit: session_shutdown
```

## Startup events

### `project_trust`
- **When:** startup, and when session replacement enters an untrusted cwd. Global/CLI extensions only; project-local extensions are not loaded yet.
- **Payload:** `event.cwd`. `ctx` is limited: `cwd`, `mode`, `hasUI`, and `select/confirm/input/notify`.
- **Return (required):** `{ trusted: "yes" | "no" | "undecided", remember?: boolean }`. First yes/no wins and suppresses the built-in prompt. `remember:true` persists a yes/no; otherwise process-scoped. `"undecided"` defers to later handlers / saved `trust.json` / `defaultProjectTrust`. Check `ctx.hasUI` before prompting.

### `resources_discover`
- **When:** after `session_start` (`reason: "startup" | "reload"`).
- **Payload:** `event.cwd`, `event.reason`.
- **Return:** `{ skillPaths?: string[], promptPaths?: string[], themePaths?: string[] }`.

## Session events

### `session_start`
- **Payload:** `event.reason` (`"startup" | "reload" | "new" | "resume" | "fork"`); `event.previousSessionFile` (present for `"new"`, `"resume"`, `"fork"`).
- **Notify only.** Reestablish in-memory state here.

### `session_before_switch`
- **Payload:** `event.reason` (`"new" | "resume"`); `event.targetSessionFile` (resume only).
- **Return:** `{ cancel: true }` to cancel.
- **After success:** `session_shutdown` (old) → reload/rebind → `session_start {reason:"new"|"resume", previousSessionFile}`.

### `session_before_fork`
- **Payload:** `event.entryId`; `event.position` (`"before"` for `/fork`, `"at"` for `/clone`).
- **Return:** `{ cancel: true }` | `{ skipConversationRestore: true }` (reserved).
- **After success:** `session_shutdown` → reload/rebind → `session_start {reason:"fork", previousSessionFile}`.

### `session_before_compact`
- **Payload (destructure):** `event.preparation` (`.firstKeptEntryId`, `.tokensBefore`), `event.branchEntries`, `event.customInstructions`, `event.signal`.
- **Return:** `{ cancel: true }` | `{ compaction: { summary, firstKeptEntryId: preparation.firstKeptEntryId, tokensBefore: preparation.tokensBefore } }` (custom summary).

### `session_compact`
- **Payload:** `event.compactionEntry`, `event.fromExtension`. **Notify only.**

### `session_before_tree`
- **Payload (destructure):** `event.preparation`, `event.signal`.
- **Return:** `{ cancel: true }` | `{ summary: { summary, details: {} } }`.

### `session_tree`
- **Payload:** `event.newLeafId`, `event.oldLeafId`, `event.summaryEntry`, `event.fromExtension`. **Notify only.**

### `session_shutdown`
- **Payload:** `event.reason` (`"quit" | "reload" | "new" | "resume" | "fork"`); `event.targetSessionFile` (for replacement flows).
- **Notify only.** Cleanup hook for resources opened in `session_start`/session-scoped hooks. Make it idempotent.

## Agent events

### `before_agent_start`
- **Payload:** `event.prompt`, `event.images`, `event.systemPrompt` (chained — includes earlier handlers' changes), `event.systemPromptOptions` (`.customPrompt`, `.selectedTools`, `.toolSnippets`, `.promptGuidelines`, `.appendSystemPrompt`, `.cwd`, `.contextFiles`, `.skills`).
- **Return:** `{ message?: { customType, content, display }, systemPrompt?: string }`. `message` is a persistent stored message sent to the LLM; `systemPrompt` replaces the prompt for this turn (chained). `event.systemPrompt` and `ctx.getSystemPrompt()` both reflect changes as of the current handler.

### `agent_start` / `agent_end`
- Once per prompt. `agent_end` payload: `event.messages`. **Notify only.**

### `turn_start` / `turn_end`
- Per turn (one LLM response + tool calls). `turn_start`: `event.turnIndex`, `event.timestamp`. `turn_end`: `event.turnIndex`, `event.message`, `event.toolResults`.

### `message_start` / `message_update` / `message_end`
- `message_start`/`message_end` fire for user, assistant, and toolResult messages; `message_update` fires for assistant streaming.
- `message_update`: `event.message`, `event.assistantMessageEvent` (token-by-token stream event).
- `message_end`: **can replace** — return `{ message: { …event.message, … } }`; replacement must keep the same `role`.

### `tool_execution_start` / `tool_execution_update` / `tool_execution_end`
- **Parallel-tool ordering:** `_start` emits in assistant source order during preflight; `_update` may interleave across tools; `_end` emits in completion order; final `toolResult` message events still emit later in assistant source order.
- `_start`: `event.toolCallId`, `event.toolName`, `event.args`.
- `_update`: + `event.partialResult`.
- `_end`: `event.toolCallId`, `event.toolName`, `event.result`, `event.isError`.

### `context`
- **When:** before each LLM call. `event.messages` is a deep copy (safe to modify).
- **Return:** `{ messages: […] }`.

### `before_provider_request`
- **When:** after the provider payload is built, before send. Handlers run in load order.
- **Return:** `undefined` keeps the payload; any other value **replaces** it for later handlers and the request.
- **Payload:** `event.payload`. Caveat: payload-level system-instruction rewrites are NOT reflected by `ctx.getSystemPrompt()`.

### `after_provider_response`
- **When:** after the HTTP response, before the stream is consumed. Load order.
- **Payload:** `event.status`, `event.headers` (availability depends on provider/transport).

## Model events

### `model_select`
- **When:** `/model`, cycling (`Ctrl+P`), or restore.
- **Payload:** `event.model`, `event.previousModel` (undefined if first), `event.source` (`"set" | "cycle" | "restore"`). **Notify only.**

### `thinking_level_select`
- **When:** thinking level changes (settings, keybinding, `pi.setThinkingLevel()`, or model change).
- **Payload:** `event.level`, `event.previousLevel`. **Notify only — return values ignored.**

## Tool events

### `tool_call` — can block / can mutate
- **When:** after `tool_execution_start`, before execution.
- **Payload:** `event.toolName` (`"bash" | "read" | "write" | "edit" | …`), `event.toolCallId`, `event.input` (**mutable**).
- **Mutation rules:** mutate `event.input` in place to patch args; affects execution; later handlers see the change; **no re-validation** afterward.
- **Return:** `{ block: true, reason?: string }` to block (return values only control blocking).
- **Ordering:** pi drains prior Agent events first so `ctx.sessionManager` is current through the active assistant message; in parallel mode it is NOT guaranteed to include sibling tool results from the same message.
- **Typing:** `isToolCallEventType("bash", event)` narrows built-ins; for custom tools export `type MyToolInput = Static<typeof schema>` and call `isToolCallEventType<"my_tool", MyToolInput>("my_tool", event)`.

### `tool_result` — can modify (middleware chain)
- **When:** after execution, before `tool_execution_end` and final tool-result message events.
- **Payload:** `event.toolName`, `event.toolCallId`, `event.input`, `event.content`, `event.details`, `event.isError`.
- **Chaining:** load order; each handler sees the latest result; return partial patches `{ content?, details?, isError? }` (omitted fields keep current value). `isBashToolResult(event)` narrows `event.details` to `BashToolDetails`.
- Use `ctx.signal` for nested async work so Esc cancels `fetch()` etc.

## Other events

### `user_bash` — can intercept
- **When:** user runs `!` / `!!`. Payload: `event.command`, `event.excludeFromContext` (`true` if `!!`), `event.cwd`.
- **Return:** `{ operations }` (custom backend, e.g. SSH; reuse local via `createLocalBashOperations()`), or `{ operations: { exec(command, cwd, options) { … } } }` to wrap local, or `{ result: { output, exitCode, cancelled, truncated } }` for full replacement.

### `input` — can intercept / transform / handle
- **When:** after extension commands are checked, before skill/template expansion (sees raw `/skill:…`, `/template`).
- **Payload:** `event.text`, `event.images`, `event.source` (`"interactive" | "rpc" | "extension"`), `event.streamingBehavior` (`"steer" | "followUp" | undefined`).
- **Processing order:** ext-cmd → `input` → skill expand → template expand → agent.
- **Return:** `{ action: "continue" }` (default) | `{ action: "transform", text }` (chains across handlers) | `{ action: "handled" }` (first handler wins; skips agent).
