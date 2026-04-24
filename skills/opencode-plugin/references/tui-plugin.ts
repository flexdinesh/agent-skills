/**
 * Complete TUI plugin reference showing every API surface.
 * Copy the sections you need into your plugin.
 *
 * TUI plugins render with SolidJS via @opentui/solid.
 * They run in the terminal UI process, not the server.
 */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"

export const tui: TuiPluginModule["tui"] = async (api, options, meta) => {
  const {
    app,
    client,
    command,
    route,
    ui,
    keybind,
    tuiConfig,
    kv,
    state,
    theme,
    event,
    renderer,
    slots,
    plugins,
    lifecycle,
  } = api

  // ---------------------------------------------------------------
  // Plugin metadata
  // ---------------------------------------------------------------
  // meta.id        -- unique plugin ID
  // meta.state     -- "first" | "updated" | "same" (reload state)
  // meta.source    -- "file" | "npm" | "internal"
  // meta.version   -- package version if from npm

  console.log(`TUI plugin loaded: ${meta.id} (${meta.state})`)

  // ---------------------------------------------------------------
  // Commands -- register command palette entries and slash commands
  // ---------------------------------------------------------------
  const unregisterCommands = command.register(() => [
    {
      title: "My Plugin: Say Hello",
      value: "my-plugin.hello",
      description: "Show a hello toast",
      category: "My Plugin",
      keybind: "ctrl+shift+h",
      onSelect: () => {
        ui.toast({ variant: "success", title: "Hello!", message: "From my plugin" })
      },
    },
    {
      title: "My Plugin: Open Dashboard",
      value: "my-plugin.dashboard",
      description: "Open the plugin dashboard",
      category: "My Plugin",
      onSelect: () => {
        route.navigate("my-plugin-dashboard")
      },
    },
    {
      title: "My Plugin: Toggle Feature",
      value: "my-plugin.toggle",
      description: "Toggle a feature on/off",
      category: "My Plugin",
      // hidden commands don't appear in palette but can be triggered
      hidden: true,
      onSelect: () => {
        const current = kv.get<boolean>("feature_enabled", false)
        kv.set("feature_enabled", !current)
        ui.toast({
          variant: "info",
          message: `Feature ${!current ? "enabled" : "disabled"}`,
        })
      },
    },
    {
      // slash command -- available as /greet in the prompt
      title: "Greet",
      value: "my-plugin.greet",
      slash: {
        name: "greet",
        aliases: ["hi", "hello"],
      },
      onSelect: () => {
        ui.toast({ message: "Greetings!" })
      },
    },
  ])

  // trigger a command programmatically
  // command.trigger("my-plugin.hello")

  // open the command palette
  // command.show()

  // ---------------------------------------------------------------
  // Routes -- register custom full-screen pages
  // ---------------------------------------------------------------
  const unregisterRoutes = route.register([
    {
      name: "my-plugin-dashboard",
      render: (input) => {
        // input.params -- route params passed via navigate()
        // return a JSX element (SolidJS)
        return "Dashboard content goes here" as any
      },
    },
  ])

  // navigate programmatically
  // route.navigate("my-plugin-dashboard", { tab: "settings" })

  // read current route
  // route.current -- { name: "home" } | { name: "session", params: { sessionID } } | { name: string, params? }

  // ---------------------------------------------------------------
  // Slots -- inject UI into built-in layout positions
  // ---------------------------------------------------------------
  // Available slots:
  //   app, home_logo, home_prompt, home_prompt_right,
  //   session_prompt, session_prompt_right,
  //   home_bottom, home_footer,
  //   sidebar_title, sidebar_content, sidebar_footer

  const slotId = slots.register({
    // slot mode: "replace" (default), "append", "prepend"
    slots: {
      // add content below the home screen
      home_footer: {
        mode: "append",
        render: (props, ctx) => {
          // props -- slot-specific props (varies by slot name)
          // ctx -- { theme: TuiTheme }
          return "My Plugin v1.0" as any
        },
      },

      // add content to the sidebar
      sidebar_footer: {
        mode: "append",
        render: (props, ctx) => {
          // props: { session_id: string }
          return `Session: ${props.session_id}` as any
        },
      },
    },
  })

  // ---------------------------------------------------------------
  // Dialogs -- show modal dialogs
  // ---------------------------------------------------------------

  // alert dialog
  // ui.dialog.replace(() => (
  //   <ui.DialogAlert
  //     title="Alert"
  //     message="Something happened"
  //     onConfirm={() => ui.dialog.clear()}
  //   />
  // ))

  // confirm dialog
  // ui.dialog.replace(() => (
  //   <ui.DialogConfirm
  //     title="Confirm"
  //     message="Are you sure?"
  //     onConfirm={() => { /* yes */ ui.dialog.clear() }}
  //     onCancel={() => ui.dialog.clear()}
  //   />
  // ))

  // prompt dialog (text input)
  // ui.dialog.replace(() => (
  //   <ui.DialogPrompt
  //     title="Enter name"
  //     placeholder="Your name..."
  //     onConfirm={(value) => { console.log(value); ui.dialog.clear() }}
  //     onCancel={() => ui.dialog.clear()}
  //   />
  // ))

  // select dialog (pick from list)
  // ui.dialog.replace(() => (
  //   <ui.DialogSelect
  //     title="Choose option"
  //     options={[
  //       { title: "Option A", value: "a", description: "First option" },
  //       { title: "Option B", value: "b", description: "Second option", category: "Advanced" },
  //     ]}
  //     onSelect={(option) => { console.log(option.value); ui.dialog.clear() }}
  //   />
  // ))

  // dialog stack management
  // ui.dialog.setSize("large")   -- "medium" | "large" | "xlarge"
  // ui.dialog.depth               -- number of stacked dialogs
  // ui.dialog.open                -- whether dialog is visible

  // ---------------------------------------------------------------
  // Toast notifications
  // ---------------------------------------------------------------
  // ui.toast({ variant: "info", title: "Title", message: "Body", duration: 3000 })
  // variants: "info" | "success" | "warning" | "error"

  // ---------------------------------------------------------------
  // Event bus -- subscribe to server events
  // ---------------------------------------------------------------
  const unsubIdle = event.on("session.idle", (evt) => {
    ui.toast({ variant: "success", message: "Session completed!" })
  })

  const unsubError = event.on("session.error", (evt) => {
    ui.toast({ variant: "error", message: `Error: ${evt.properties.error}` })
  })

  const unsubMessage = event.on("message.part.updated", (evt) => {
    // react to streaming message parts
  })

  // ---------------------------------------------------------------
  // Keybinds -- create and match keybind sets
  // ---------------------------------------------------------------
  const keys = keybind.create(
    {
      // default keybinds
      "my-plugin.toggle": "ctrl+t",
      "my-plugin.dashboard": "ctrl+d",
    },
    // optional user overrides from config
    tuiConfig.keybinds,
  )

  // check keybind in a key handler
  // keys.match("my-plugin.toggle", keyEvent)

  // get display string for a keybind
  // keys.print("my-plugin.toggle") -- e.g. "Ctrl+T"

  // single keybind match (without a set)
  // keybind.match("ctrl+t", keyEvent)
  // keybind.print("ctrl+t") -- "Ctrl+T"

  // ---------------------------------------------------------------
  // KV storage -- persistent key-value store
  // ---------------------------------------------------------------
  // kv.ready   -- boolean, true when storage is loaded
  const visitCount = kv.get<number>("visit_count", 0)
  kv.set("visit_count", visitCount + 1)
  kv.set("last_visited", new Date().toISOString())

  // ---------------------------------------------------------------
  // State -- reactive app state (read-only)
  // ---------------------------------------------------------------
  // state.ready                    -- boolean
  // state.config                   -- current SDK config
  // state.provider                 -- ReadonlyArray<Provider>
  // state.path.state               -- state directory path
  // state.path.config              -- config directory path
  // state.path.worktree            -- worktree root
  // state.path.directory           -- project directory
  // state.vcs                      -- { branch?: string } | undefined

  // Session state
  // state.session.count()          -- number of sessions
  // state.session.messages(id)     -- ReadonlyArray<Message>
  // state.session.status(id)       -- SessionStatus | undefined
  // state.session.diff(id)         -- ReadonlyArray<{ file, additions, deletions }>
  // state.session.todo(id)         -- ReadonlyArray<{ content, status }>
  // state.session.permission(id)   -- ReadonlyArray<PermissionRequest>
  // state.session.question(id)     -- ReadonlyArray<QuestionRequest>

  // Parts and infrastructure
  // state.part(messageID)          -- ReadonlyArray<Part>
  // state.lsp()                    -- ReadonlyArray<{ id, root, status }>
  // state.mcp()                    -- ReadonlyArray<{ name, status, error? }>

  // ---------------------------------------------------------------
  // Theme -- access and manage themes
  // ---------------------------------------------------------------
  // theme.current                  -- all color tokens (TuiThemeCurrent)
  // theme.selected                 -- current theme name
  // theme.mode()                   -- "dark" | "light"
  // theme.has(name)                -- check if theme exists
  // theme.set(name)                -- switch theme
  // theme.install(jsonPath)        -- install theme from JSON file

  // color tokens include:
  //   primary, secondary, accent, error, warning, success, info,
  //   text, textMuted, background, backgroundPanel, backgroundElement,
  //   border, borderActive, borderSubtle,
  //   diff*, markdown*, syntax*

  // ---------------------------------------------------------------
  // App info
  // ---------------------------------------------------------------
  // app.version -- opencode version string

  // ---------------------------------------------------------------
  // Client -- SDK client for server communication
  // ---------------------------------------------------------------
  // client is the full OpenCode SDK client
  // client.session.list(), client.session.chat(), etc.
  // client.app.log({ body: { service, level, message, extra } })

  // ---------------------------------------------------------------
  // Renderer -- low-level CLI renderer
  // ---------------------------------------------------------------
  // renderer -- CliRenderer instance for advanced terminal rendering

  // ---------------------------------------------------------------
  // Plugin management
  // ---------------------------------------------------------------
  // plugins.list()                 -- ReadonlyArray<TuiPluginStatus>
  // plugins.activate(id)           -- enable a plugin
  // plugins.deactivate(id)         -- disable a plugin
  // plugins.add(spec)              -- add a plugin by npm spec
  // plugins.install(spec, opts)    -- install a plugin ({ global?: boolean })

  // ---------------------------------------------------------------
  // Lifecycle -- cleanup on plugin unload
  // ---------------------------------------------------------------
  // lifecycle.signal -- AbortSignal that fires when plugin is unloaded

  lifecycle.onDispose(() => {
    // clean up event subscriptions
    unsubIdle()
    unsubError()
    unsubMessage()
    // clean up command and route registrations
    unregisterCommands()
    unregisterRoutes()
    console.log("Plugin disposed")
  })
}
