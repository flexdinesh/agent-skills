/**
 * Complete server plugin reference showing every available hook.
 * Copy the hooks you need into your plugin.
 */
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

export const ServerHooksReference: Plugin = async ({
  client,
  project,
  directory,
  worktree,
  $,
  serverUrl,
  experimental_workspace,
}) => {
  // -- Startup logging --
  await client.app.log({
    body: {
      service: "my-plugin",
      level: "info",
      message: "Plugin initialized",
      extra: { directory, worktree },
    },
  })

  return {
    // ---------------------------------------------------------------
    // event -- receive all bus events
    // ---------------------------------------------------------------
    event: async ({ event }) => {
      switch (event.type) {
        // Session events
        case "session.created":
          console.log("new session", event.properties.info.id)
          break
        case "session.updated":
          console.log("session updated", event.properties.info.id)
          break
        case "session.deleted":
          console.log("session deleted", event.properties.info.id)
          break
        case "session.idle":
          // session finished processing -- good place for notifications
          await $`osascript -e 'display notification "Done!" with title "opencode"'`
          break
        case "session.error":
          console.error("session error", event.properties.error)
          break
        case "session.status":
          console.log("status changed", event.properties.status)
          break
        case "session.compacted":
          console.log("session compacted", event.properties.info.id)
          break
        case "session.diff":
          console.log("files changed", event.properties.files)
          break

        // Message events
        case "message.updated":
          console.log("message updated", event.properties.info.id)
          break
        case "message.removed":
          console.log("message removed", event.properties.info.id)
          break
        case "message.part.updated":
          console.log("part updated", event.properties.part.id)
          break
        case "message.part.removed":
          console.log("part removed", event.properties.part.id)
          break

        // File events
        case "file.edited":
          console.log("file edited", event.properties.file)
          break
        case "file.watcher.updated":
          console.log("file watcher update", event.properties.file)
          break

        // Tool events
        case "tool.execute.before":
          console.log("tool starting", event.properties.tool)
          break
        case "tool.execute.after":
          console.log("tool finished", event.properties.tool)
          break

        // Permission events
        case "permission.asked":
          console.log("permission asked", event.properties.permission)
          break
        case "permission.replied":
          console.log("permission replied", event.properties.status)
          break

        // Command events
        case "command.executed":
          console.log("command executed", event.properties.command)
          break

        // LSP events
        case "lsp.client.diagnostics":
          console.log("lsp diagnostics", event.properties.diagnostics)
          break
        case "lsp.updated":
          console.log("lsp updated")
          break

        // Other events
        case "server.connected":
          console.log("server connected")
          break
        case "installation.updated":
          console.log("installation updated")
          break
        case "todo.updated":
          console.log("todo updated", event.properties.todo)
          break
      }
    },

    // ---------------------------------------------------------------
    // config -- called with current config on load
    // ---------------------------------------------------------------
    config: async (config) => {
      console.log("config loaded", config.provider)
    },

    // ---------------------------------------------------------------
    // tool -- register custom tools
    // ---------------------------------------------------------------
    tool: {
      greet: tool({
        description: "Greet someone by name",
        args: {
          name: tool.schema.string().describe("Name to greet"),
          shout: tool.schema.boolean().optional().describe("Uppercase the greeting"),
        },
        async execute(args, context) {
          const { directory, worktree, sessionID, abort, metadata } = context
          // update metadata shown in the UI while running
          metadata({ title: `Greeting ${args.name}...` })
          const msg = `Hello ${args.name} from ${directory}!`
          return args.shout ? msg.toUpperCase() : msg
        },
      }),

      fetch_url: tool({
        description: "Fetch a URL and return the response body",
        args: {
          url: tool.schema.string().url().describe("URL to fetch"),
        },
        async execute(args, context) {
          // ask for permission before fetching
          context.ask({
            permission: "network",
            patterns: [args.url],
            always: [new URL(args.url).hostname],
            metadata: { url: args.url },
          })
          const res = await fetch(args.url, { signal: context.abort })
          const text = await res.text()
          return { output: text.slice(0, 5000), metadata: { status: res.status } }
        },
      }),
    },

    // ---------------------------------------------------------------
    // auth -- register authentication methods for a provider
    // ---------------------------------------------------------------
    auth: {
      provider: "my-provider",
      loader: async (auth, provider) => {
        const credentials = await auth()
        return { apiKey: credentials.access }
      },
      methods: [
        {
          type: "api",
          label: "API Key",
          prompts: [
            {
              type: "text",
              key: "api_key",
              message: "Enter your API key",
              placeholder: "sk-...",
              validate: (value) =>
                value.startsWith("sk-") ? undefined : "Key must start with sk-",
            },
          ],
          async authorize(inputs) {
            if (!inputs?.api_key) return { type: "failed" }
            return { type: "success", key: inputs.api_key }
          },
        },
        {
          type: "oauth",
          label: "Sign in with browser",
          prompts: [
            {
              type: "select",
              key: "region",
              message: "Select region",
              options: [
                { label: "US", value: "us" },
                { label: "EU", value: "eu", hint: "GDPR compliant" },
              ],
            },
          ],
          async authorize(inputs) {
            const region = inputs?.region ?? "us"
            return {
              url: `https://auth.example.com/oauth?region=${region}`,
              instructions: "Complete sign-in in your browser",
              method: "auto" as const,
              async callback() {
                // poll or wait for OAuth callback
                return {
                  type: "success" as const,
                  refresh: "refresh_token_value",
                  access: "access_token_value",
                  expires: Date.now() + 3600_000,
                }
              },
            }
          },
        },
      ],
    },

    // ---------------------------------------------------------------
    // provider -- customize provider models
    // ---------------------------------------------------------------
    provider: {
      id: "my-provider",
      async models(provider, ctx) {
        return {
          "my-model-v1": {
            id: "my-model-v1",
            name: "My Model v1",
          },
        }
      },
    },

    // ---------------------------------------------------------------
    // chat.message -- intercept new messages, modify parts
    // ---------------------------------------------------------------
    "chat.message": async (input, output) => {
      // input: { sessionID, agent?, model?, messageID?, variant? }
      // output: { message: UserMessage, parts: Part[] }
      // e.g. inject a system-level context part
      console.log("new message in session", input.sessionID)
    },

    // ---------------------------------------------------------------
    // chat.params -- modify LLM parameters
    // ---------------------------------------------------------------
    "chat.params": async (input, output) => {
      // input: { sessionID, agent, model, provider, message }
      // output: { temperature, topP, topK, maxOutputTokens, options }
      output.temperature = 0.7
      output.maxOutputTokens = 16_384
      output.options["custom_option"] = true
    },

    // ---------------------------------------------------------------
    // chat.headers -- modify HTTP headers sent to LLM
    // ---------------------------------------------------------------
    "chat.headers": async (input, output) => {
      // input: { sessionID, agent, model, provider, message }
      // output: { headers: Record<string, string> }
      output.headers["X-Custom-Header"] = "my-value"
      output.headers["X-Session-ID"] = input.sessionID
    },

    // ---------------------------------------------------------------
    // permission.ask -- intercept permission requests
    // ---------------------------------------------------------------
    "permission.ask": async (input, output) => {
      // input: Permission (the permission being requested)
      // output: { status: "ask" | "deny" | "allow" }
      // auto-allow reads, auto-deny writes to sensitive paths
      if (input.permission === "read") {
        output.status = "allow"
      }
    },

    // ---------------------------------------------------------------
    // command.execute.before -- before slash command execution
    // ---------------------------------------------------------------
    "command.execute.before": async (input, output) => {
      // input: { command, sessionID, arguments }
      // output: { parts: Part[] }
      console.log(`command /${input.command} with args: ${input.arguments}`)
    },

    // ---------------------------------------------------------------
    // tool.execute.before -- before tool execution, modify args
    // ---------------------------------------------------------------
    "tool.execute.before": async (input, output) => {
      // input: { tool, sessionID, callID }
      // output: { args: any }
      if (input.tool === "bash") {
        // prepend safety wrapper to all bash commands
        output.args.command = `set -euo pipefail; ${output.args.command}`
      }
      if (input.tool === "read" && output.args.filePath?.includes(".env")) {
        throw new Error("Reading .env files is not allowed")
      }
    },

    // ---------------------------------------------------------------
    // tool.execute.after -- after tool execution, modify output
    // ---------------------------------------------------------------
    "tool.execute.after": async (input, output) => {
      // input: { tool, sessionID, callID, args }
      // output: { title, output, metadata }
      if (input.tool === "bash") {
        output.title = `bash: ${input.args.command?.slice(0, 50)}`
      }
    },

    // ---------------------------------------------------------------
    // tool.definition -- modify tool descriptions sent to LLM
    // ---------------------------------------------------------------
    "tool.definition": async (input, output) => {
      // input: { toolID }
      // output: { description, parameters }
      if (input.toolID === "bash") {
        output.description += "\nALWAYS use set -euo pipefail."
      }
    },

    // ---------------------------------------------------------------
    // shell.env -- inject env vars into shell execution
    // ---------------------------------------------------------------
    "shell.env": async (input, output) => {
      // input: { cwd, sessionID?, callID? }
      // output: { env: Record<string, string> }
      output.env.PROJECT_ROOT = input.cwd
      output.env.OPENCODE = "1"
    },

    // ---------------------------------------------------------------
    // experimental.chat.messages.transform -- transform message history
    // ---------------------------------------------------------------
    "experimental.chat.messages.transform": async (input, output) => {
      // output: { messages: { info: Message, parts: Part[] }[] }
      // e.g. filter out messages older than 50 turns
      if (output.messages.length > 50) {
        output.messages = output.messages.slice(-50)
      }
    },

    // ---------------------------------------------------------------
    // experimental.chat.system.transform -- transform system prompt
    // ---------------------------------------------------------------
    "experimental.chat.system.transform": async (input, output) => {
      // input: { sessionID?, model }
      // output: { system: string[] }
      output.system.push("Always respond in markdown format.")
      output.system.push(`Current project: ${project.name}`)
    },

    // ---------------------------------------------------------------
    // experimental.session.compacting -- customize compaction
    // ---------------------------------------------------------------
    "experimental.session.compacting": async (input, output) => {
      // input: { sessionID }
      // output: { context: string[], prompt?: string }

      // option 1: append extra context to default prompt
      output.context.push(`## Project State\nWorktree: ${worktree}`)

      // option 2: replace compaction prompt entirely (uncomment to use)
      // output.prompt = `Summarize the session focusing on: 1) current task 2) files modified 3) next steps`
    },

    // ---------------------------------------------------------------
    // experimental.compaction.autocontinue -- control auto-continue
    // ---------------------------------------------------------------
    "experimental.compaction.autocontinue": async (input, output) => {
      // input: { sessionID, agent, model, provider, message, overflow }
      // output: { enabled: boolean }
      // disable auto-continue when context didn't overflow
      if (!input.overflow) {
        output.enabled = false
      }
    },

    // ---------------------------------------------------------------
    // experimental.text.complete -- modify completed text
    // ---------------------------------------------------------------
    "experimental.text.complete": async (input, output) => {
      // input: { sessionID, messageID, partID }
      // output: { text: string }
      // e.g. strip trailing whitespace from all text output
      output.text = output.text.trimEnd()
    },
  }
}
