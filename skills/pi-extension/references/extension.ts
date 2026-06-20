/**
 * Complete Pi extension reference showing every event handler, tool, command,
 * provider, and state pattern. Copy the pieces you need into your extension.
 *
 * Place at: ~/.pi/agent/extensions/my-extension.ts  (global)
 *        or: .pi/extensions/my-extension.ts         (project-local)
 * Test with: pi -e ./my-extension.ts
 *
 * Typed against @earendil-works/pi-coding-agent and typebox. Loaded via jiti,
 * so TypeScript works without a build step.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import {
  isToolCallEventType,
  isBashToolResult,
  createLocalBashOperations,
  withFileMutationQueue,
  truncateHead,
  truncateTail,
  truncateLine,
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  CONFIG_DIR_NAME,
} from "@earendil-works/pi-coding-agent"
import { Type } from "typebox"
import { StringEnum } from "@earendil-works/pi-ai"
import { join } from "node:path"

export default function (pi: ExtensionAPI) {
  // ---------------------------------------------------------------
  // Startup / resource events
  // ---------------------------------------------------------------
  // project_trust: global/CLI extensions only; project-local not loaded yet.
  pi.on("project_trust", async (event, ctx) => {
    // event.cwd; ctx is limited: cwd, mode, hasUI, select/confirm/input/notify
    if (ctx.hasUI && (await ctx.ui.confirm("Trust project?", event.cwd))) {
      return { trusted: "yes" as const, remember: true }
    }
    return { trusted: "undecided" as const }
  })

  pi.on("resources_discover", async (event) => {
    // event.cwd; event.reason: "startup" | "reload"
    return {
      skillPaths: [join(event.cwd, "my-skills")],
      promptPaths: [join(event.cwd, "my-prompts")],
      themePaths: [join(event.cwd, "my-themes")],
    }
  })

  // ---------------------------------------------------------------
  // Session events
  // ---------------------------------------------------------------
  // session-scoped resources are started here, closed in session_shutdown.
  let bgTimer: ReturnType<typeof setInterval> | undefined
  pi.on("session_start", async (event, ctx) => {
    // event.reason: "startup" | "reload" | "new" | "resume" | "fork"
    // event.previousSessionFile present for new/resume/fork
    ctx.ui.notify(`Session: ${ctx.sessionManager.getSessionFile() ?? "ephemeral"}`, "info")

    // restore persisted state (entries of type "custom")
    for (const entry of ctx.sessionManager.getEntries()) {
      if (entry.type === "custom" && entry.customType === "my-ext:state") {
        // entry.data holds whatever you passed to appendEntry
      }
    }

    // defer background work until a session actually starts:
    bgTimer = setInterval(() => {}, 60_000)
  })

  pi.on("session_before_switch", async (event) => {
    // event.reason: "new" | "resume"; event.targetSessionFile (resume only)
    if (event.reason === "new") return { cancel: true }
  })

  pi.on("session_before_fork", async (event) => {
    // event.entryId; event.position: "before" (/fork) | "at" (/clone)
    return { cancel: true }
  })

  pi.on("session_before_compact", async (event) => {
    const { preparation } = event
    return {
      compaction: {
        summary: "Custom summary…",
        firstKeptEntryId: preparation.firstKeptEntryId,
        tokensBefore: preparation.tokensBefore,
      },
    }
  })

  pi.on("session_compact", async (event) => {
    // event.compactionEntry; event.fromExtension
  })

  pi.on("session_before_tree", async (event) => {
    return { summary: { summary: "Custom tree summary", details: {} } }
  })

  pi.on("session_tree", async (event) => {
    // event.newLeafId, oldLeafId, summaryEntry, fromExtension
  })

  // idempotent cleanup for session-scoped resources
  pi.on("session_shutdown", async (event) => {
    // event.reason: "quit" | "reload" | "new" | "resume" | "fork"
    // event.targetSessionFile for replacement flows
    if (bgTimer) {
      clearInterval(bgTimer)
      bgTimer = undefined
    }
  })

  // ---------------------------------------------------------------
  // Agent events
  // ---------------------------------------------------------------
  pi.on("before_agent_start", async (event) => {
    // event.prompt, event.images, event.systemPrompt (chained), event.systemPromptOptions
    return {
      message: { customType: "my-ext", content: "Extra context for the LLM", display: true },
      systemPrompt: `${event.systemPrompt}\n\nExtra instructions for this turn…`,
    }
  })

  pi.on("agent_start", async () => {})
  pi.on("agent_end", async (event) => {
    // event.messages from this prompt
  })

  pi.on("turn_start", async (event) => {
    // event.turnIndex, event.timestamp
  })
  pi.on("turn_end", async (event) => {
    // event.turnIndex, event.message, event.toolResults
  })

  pi.on("message_start", async (event) => {
    // event.message
  })
  pi.on("message_update", async (event) => {
    // event.message; event.assistantMessageEvent (token stream)
  })
  pi.on("message_end", async (event) => {
    if (event.message.role !== "assistant") return
    // replace the finalized message (must keep the same role):
    return { message: { ...event.message } }
  })

  pi.on("tool_execution_start", async (event) => {
    // event.toolCallId, toolName, args
  })
  pi.on("tool_execution_update", async (event) => {
    // + event.partialResult
  })
  pi.on("tool_execution_end", async (event) => {
    // event.toolCallId, toolName, result, isError
  })

  pi.on("context", async (event) => {
    // event.messages is a deep copy; modify non-destructively
    return { messages: event.messages }
  })

  pi.on("before_provider_request", (event) => {
    // event.payload; return undefined to keep, or a value to replace it
    console.log(JSON.stringify(event.payload))
  })

  pi.on("after_provider_response", (event) => {
    // event.status, event.headers (provider/transport dependent)
    if (event.status === 429) console.log("rate limited")
  })

  // ---------------------------------------------------------------
  // Model events
  // ---------------------------------------------------------------
  pi.on("model_select", async (event) => {
    // event.model, event.previousModel, event.source: "set"|"cycle"|"restore"
  })
  pi.on("thinking_level_select", async (event) => {
    // event.level, event.previousLevel  (notify-only)
  })

  // ---------------------------------------------------------------
  // Tool events
  // ---------------------------------------------------------------
  pi.on("tool_call", async (event) => {
    // event.input is MUTABLE — patch args in place (no re-validation).
    if (isToolCallEventType("bash", event)) {
      event.input.command = `source ~/.profile\n${event.input.command}`
      if (event.input.command.includes("rm -rf")) {
        return { block: true, reason: "Dangerous command" }
      }
    }
    if (isToolCallEventType("read", event)) {
      console.log(`Reading: ${event.input.path}`)
    }
  })

  pi.on("tool_result", async (event, ctx) => {
    // chains middleware-style; return partial patches { content?, details?, isError? }
    if (isBashToolResult(event)) {
      // event.details typed as BashToolDetails
    }
    const res = await fetch("https://example.com/summarize", {
      method: "POST",
      body: JSON.stringify({ content: event.content }),
      signal: ctx.signal,
    })
    void res
    return { content: [{ type: "text" as const, text: "patched" }] }
  })

  // ---------------------------------------------------------------
  // Other events
  // ---------------------------------------------------------------
  pi.on("user_bash", (event) => {
    // event.command, event.excludeFromContext, event.cwd
    // Option: wrap pi's local backend
    const local = createLocalBashOperations()
    return {
      operations: {
        exec(command, cwd, options) {
          return local.exec(`source ~/.profile\n${command}`, cwd, options)
        },
      },
    }
  })

  pi.on("input", async (event) => {
    // event.text, images, source: "interactive"|"rpc"|"extension", streamingBehavior
    if (event.text.startsWith("?quick ")) {
      return { action: "transform", text: `Respond briefly: ${event.text.slice(7)}` }
    }
    if (event.text === "ping") return { action: "handled" }
    if (event.source === "extension") return { action: "continue" }
    return { action: "continue" }
  })

  // ---------------------------------------------------------------
  // Custom tool: full shape
  // ---------------------------------------------------------------
  pi.registerTool({
    name: "todo",
    label: "Todo",
    description: `Manage a todo list. Output is truncated to ${DEFAULT_MAX_LINES} lines / ${DEFAULT_MAX_BYTES} bytes.`,
    promptSnippet: "manage a todo list",
    promptGuidelines: ["Use todo when the user lists tasks to track."],
    parameters: Type.Object({
      action: StringEnum(["list", "add", "done"] as const),
      text: Type.Optional(Type.String()),
    }),
    prepareArguments(args) {
      // runs before schema validation; migrate stale fields from old sessions
      return args
    },
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      onUpdate?.({ content: [{ type: "text", text: "Working…" }], details: { progress: 50 } })
      if (signal?.aborted) throw new Error("aborted")
      const text = truncateTail(`result for ${params.action}`, DEFAULT_MAX_LINES, DEFAULT_MAX_BYTES)
      return {
        content: [{ type: "text", text }],
        details: { action: params.action }, // survives restart; used for rendering & state
      }
    },
  })

  // Tool that mutates a file — wrap read-modify-write in the mutation queue so
  // parallel calls don't clobber each other (symlinks share a queue).
  pi.registerTool({
    name: "append_log",
    label: "Append Log",
    description: "Append a line to the project log.",
    parameters: Type.Object({ line: Type.String() }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const path = join(ctx.cwd, CONFIG_DIR_NAME, "log.txt")
      await withFileMutationQueue(path, async () => {
        // read -> modify -> write, serialized
      })
      return { content: [{ type: "text", text: "appended" }], details: {} }
    },
  })

  // Terminating tool: skips the auto follow-up only if EVERY tool in the batch
  // returns terminate: true.
  pi.registerTool({
    name: "final_answer",
    label: "Final Answer",
    description: "Emit final structured output and end the turn.",
    parameters: Type.Object({ answer: Type.String() }),
    async execute(_id, params) {
      return { content: [{ type: "text", text: params.answer }], details: {}, terminate: true }
    },
  })

  // ---------------------------------------------------------------
  // Commands (ExtensionCommandContext — session-control methods live here)
  // ---------------------------------------------------------------
  pi.registerCommand("handoff", {
    description: "Fork the session at the latest entry",
    handler: async (_args, ctx) => {
      // ctx is ExtensionCommandContext here (not in event handlers).
      await ctx.waitForIdle()
      const leafId = ctx.sessionManager.getLeafId()
      if (!leafId) {
        ctx.ui.notify("No leaf entry to fork", "warning")
        return
      }
      const result = await ctx.fork(leafId, { position: "before" })
      if (result.cancelled) ctx.ui.notify("Fork cancelled", "warning")
    },
  })

  pi.registerCommand("reload-runtime", {
    description: "Reload extensions and resources",
    handler: async (_args, ctx) => {
      // emits session_shutdown -> session_start {reason:"reload"} -> resources_discover
      await ctx.reload()
      // code after reload() runs from the OLD frame; do not assume old state is valid.
    },
  })

  pi.registerCommand("new-from-template", {
    description: "Start a fresh session with seeded state",
    handler: async (_args, ctx) => {
      await ctx.newSession({
        setup: (sm) => {
          // mutate the new SessionManager before withSession runs
        },
        withSession: (newCtx) => {
          // OLD pi / ctx are stale and THROW — use only newCtx here.
          newCtx.ui.notify("New session ready", "info")
        },
      })
    },
  })

  // ---------------------------------------------------------------
  // Provider registration (async factory is preferred for remote discovery)
  // ---------------------------------------------------------------
  pi.registerProvider("local-openai", {
    name: "Local OpenAI",
    baseUrl: "http://localhost:1234/v1",
    apiKey: "$LOCAL_OPENAI_API_KEY", // env interpolation; "$$" escapes "$", "$!" escapes "!"
    api: "openai-completions",
    models: [
      {
        id: "my-model",
        name: "My Model",
        reasoning: false,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 128000,
        maxTokens: 4096,
      },
    ],
  })
  // pi.unregisterProvider("local-openai") // restores overridden built-ins

  // ---------------------------------------------------------------
  // Messaging, state, and tools/model control
  // ---------------------------------------------------------------
  // Inject a custom message (not a user message):
  pi.sendMessage(
    { customType: "my-ext", content: "note", display: true },
    { deliverAs: "steer", triggerTurn: false },
  )

  // Send as the user (always triggers a turn; deliverAs required while streaming):
  // pi.sendUserMessage("summarize", { deliverAs: "followUp" })

  // Persist state that does NOT participate in LLM context:
  pi.appendEntry("my-ext:state", { count: 1 })

  pi.setSessionName("My session")
  pi.getSessionName()
  pi.setLabel("entry-id", "label") // undefined clears

  const active = pi.getActiveTools()
  const all = pi.getAllTools() // [{ name, description, parameters, promptGuidelines, sourceInfo }]
  pi.setActiveTools(active)

  // pi.setModel("anthropic/claude-sonnet-4-5") // returns false if no API key
  const level = pi.getThinkingLevel() // "off"|"minimal"|"low"|"medium"|"high"|"xhigh"
  pi.setThinkingLevel(level)

  // Shell exec: returns { stdout, stderr, code, killed }
  // const out = await pi.exec("git", ["status"], { timeout: 5000 })

  // Cross-extension event bus:
  pi.events.on("my-ext:event", (data) => {})
  pi.events.emit("my-ext:event", { hello: true })

  // ---------------------------------------------------------------
  // Shortcuts / flags
  // ---------------------------------------------------------------
  pi.registerShortcut("ctrl+x ctrl+h", {
    description: "Hello shortcut",
    handler: async (ctx) => ctx.ui.notify("hi", "info"),
  })
  pi.registerFlag("my-flag", { description: "A boolean flag", type: "boolean", default: false })

  // ---------------------------------------------------------------
  // Truncation helpers (also re-exported above for tools)
  // ---------------------------------------------------------------
  void truncateHead
  void truncateTail
  void truncateLine
}
