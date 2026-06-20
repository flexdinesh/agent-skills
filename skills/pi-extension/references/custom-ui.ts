/**
 * Complete Pi custom-UI reference: the ctx.ui surface, message/tool rendering,
 * themes, and keybinding hints. Copy the pieces you need.
 *
 * NOTE on components: pi-tui exposes a `Component` model (e.g. `Text`,
 * `Container`) from @earendil-works/pi-tui. Renderers return a `Component`.
 * This reference uses the documented functional API rather than JSX; if your
 * distribution supports a JSX pragma, adapt the renderers accordingly and
 * verify against the @earendil-works/pi-tui source.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { Type } from "typebox"
import {
  highlightCode,
  getLanguageFromPath,
  keyHint,
  keyText,
  rawKeyHint,
} from "@earendil-works/pi-coding-agent"
import { Text, type AutocompleteItem } from "@earendil-works/pi-tui"

export default function (pi: ExtensionAPI) {
  // ===============================================================
  // Dialogs (guard with ctx.hasUI; in rpc mode some return defaults)
  // ===============================================================
  pi.on("session_start", async (_e, ctx) => {
    if (!ctx.hasUI) return

    const choice = await ctx.ui.select("Pick one", ["a", "b", "c"]) // undefined on timeout
    const ok = await ctx.ui.confirm("Title", "Are you sure?") // false on timeout
    const name = await ctx.ui.input("Name?", "placeholder") // undefined on timeout
    const draft = await ctx.ui.editor("Draft", "prefilled text")
    ctx.ui.notify("Done", "info") // "info" | "warning" | "error"
    void choice
    void ok
    void name
    void draft
  })

  // ===============================================================
  // Footer / status / widgets / working loader
  // ===============================================================
  pi.on("turn_start", async (_e, ctx) => {
    // persistent footer status row; undefined clears
    ctx.ui.setStatus("my-ext", "thinking…")
    ctx.ui.setStatus("my-ext", undefined)

    // widget above (default) or below the editor; string[] or Component factory
    ctx.ui.setWidget("my-ext", ["Line 1", "Line 2"], { placement: "aboveEditor" })
    ctx.ui.setWidget("my-ext", undefined)

    // replace the built-in footer entirely (undefined restores)
    ctx.ui.setFooter(undefined)

    ctx.ui.setTitle("terminal title")
    ctx.ui.setEditorText("seed text")
    ctx.ui.getEditorText()
    ctx.ui.pasteToEditor("big content") // triggers paste handling

    // streaming loader
    ctx.ui.setWorkingMessage("custom loader")
    ctx.ui.setWorkingMessage() // restore default
    ctx.ui.setWorkingVisible(false) // hide built-in loader row
    ctx.ui.setWorkingIndicator({ frames: ["|", "/", "-"], intervalMs: 120 })
    ctx.ui.setWorkingIndicator() // restore default
  })

  // ===============================================================
  // Full-screen / overlay custom component
  // ===============================================================
  pi.registerCommand("panel", {
    description: "Open a panel",
    handler: async (_args, ctx) => {
      if (ctx.mode !== "tui") return // custom() is TUI-only
      const value = await ctx.ui.custom<string>(
        (tui, theme, keybindings, done) => {
          // build a Component; call done(value) to close and resolve.
          // tui: TUI instance; theme: current theme; keybindings: KeybindingsManager.
          void tui
          void theme
          void keybindings
          setTimeout(() => done("result"), 100)
          return new Text("Custom panel", 0, 0)
        },
        { overlay: true }, // floating modal without clearing the screen
      )
      // overlayOptions: { anchor?, width?, margin? }
      // onHandle(handle) gives handle.focus()/unfocus({target})/setHidden(bool)/hide()
      ctx.ui.notify(`got ${value}`, "info")
    },
  })

  // ===============================================================
  // Custom editor component (extends CustomEditor for app keybindings)
  // ===============================================================
  // ctx.ui.setEditorComponent((tui, theme, keybindings) => Component | undefined)
  // const prev = ctx.ui.getEditorComponent() // capture to wrap/chain
  // ctx.ui.setEditorComponent(undefined) // restore default

  // ===============================================================
  // Autocomplete provider (stacks on built-in slash/path provider)
  // ===============================================================
  pi.on("session_start", async (_e, ctx) => {
    ctx.ui.addAutocompleteProvider((current) => ({
      triggerCharacters: [":"],
      getSuggestions(lines, line, col, options) {
        void lines
        void line
        void col
        void options
        // delegate to `current` when not your trigger
        const suggestions: AutocompleteItem[] = [] // { value, label, description? }
        return suggestions
      },
      applyCompletion(lines, line, col, item, prefix) {
        void lines
        void line
        void col
        void item
        void prefix
      },
    }))
  })

  // ===============================================================
  // Theme
  // ===============================================================
  pi.on("session_start", async (_e, ctx) => {
    const themes = ctx.ui.getAllThemes() // [{ name, path }]
    const t = ctx.ui.getTheme("name") // load without switching
    void themes
    void t
    const res = ctx.ui.setTheme("name") // { success: boolean, error?: string }
    void res
    // functional styling: theme.fg(token, text)
    const styled = ctx.ui.theme.fg("accent", "hi")
    void styled
  })

  // ===============================================================
  // Message rendering (pair with pi.sendMessage({ customType, ... }))
  // ===============================================================
  pi.registerMessageRenderer("my-ext", (message, options, theme) => {
    // message.customType, message.content, message.details
    // options.expanded: boolean
    void message
    void options
    void theme
    return new Text(String(message.content ?? ""), 0, 0)
  })

  // ===============================================================
  // Tool rendering (inside registerTool)
  // ===============================================================
  pi.registerTool({
    name: "demo_render",
    label: "Demo Render",
    description: "Shows renderCall/renderResult/renderShell.",
    parameters: Type.Object({ q: Type.String() }),
    async execute(_id, params) {
      return { content: [{ type: "text", text: `result for ${params.q}` }], details: {} }
    },
    renderCall(args, theme, context) {
      // context = { args, state, lastComponent, invalidate(), toolCallId, cwd,
      //             executionStarted, argsComplete, isPartial, expanded, showImages, isError }
      void args
      void theme
      void context
      return new Text(`Calling demo_render: ${args.q}`, 0, 0)
    },
    renderResult(result, options, theme, context) {
      // options = { expanded, isPartial }
      void result
      void options
      void theme
      void context
      return new Text(result.content.map((part) => part.type === "text" ? part.text : "").join("\n"), 0, 0)
    },
    renderShell: "self", // tool renders its own shell (no default Box framing)
  })

  // ===============================================================
  // Colors, syntax highlight, keybinding hints
  // ===============================================================
  pi.on("agent_end", async (_e, ctx) => {
    // tokens: "toolTitle" | "accent" | "success" | "error" | "warning" | "muted" | "dim"
    const txt = ctx.ui.theme.fg("success", "ok")
    const bold = ctx.ui.theme.bold(txt)
    void bold

    const code = highlightCode("const x = 1;", "typescript", ctx.ui.theme)
    const lang = getLanguageFromPath("/p/file.rs") // "rust"
    void code
    void lang

    // Namespaces: app.* (coding-agent), tui.* (shared TUI)
    const hint = keyHint("app.tools.expand", "to expand") // formatted with configured key
    const raw = keyText("tui.select.confirm")
    void hint
    void raw
    void rawKeyHint // rawKeyHint(key, description)
  })
}
