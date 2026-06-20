/** @jsxImportSource @opentui/solid */
/**
 * Complete TUI plugin reference showing the current API surface.
 *
 * Save real TUI plugins that use JSX as .tsx files.
 *
 * TUI plugins are configured in tui.json:
 * {
 *   "$schema": "https://opencode.ai/tui.json",
 *   "plugin": [["./plugins/my-tui.tsx", { "label": "demo" }]],
 *   "attention": { "enabled": true, "notifications": true, "sound": true }
 * }
 *
 * TUI plugins render with SolidJS through @opentui/solid and run in the
 * terminal UI process, not the server process.
 */
import { onCleanup } from "solid-js"
import { createBindingLookup } from "@opencode-ai/plugin/tui"
import type {
  BindingConfig,
  KeyEvent,
  Renderable,
  SequenceBindingLike,
  TuiPlugin,
  TuiPluginApi,
  TuiPluginMeta,
  TuiPluginModule,
} from "@opencode-ai/plugin/tui"

type Options = {
  label?: string
  route?: string
}

const routeName = (options: Options | undefined) => options?.route ?? "acme-dashboard"
const label = (options: Options | undefined) => options?.label ?? "Acme"

function options(raw: Record<string, unknown> | undefined): Options | undefined {
  if (!raw) return undefined
  const out: Options = {}
  if (typeof raw.label === "string" && raw.label.trim()) out.label = raw.label
  if (typeof raw.route === "string" && raw.route.trim()) out.route = raw.route
  return out
}

function Panel(props: { api: TuiPluginApi; options: Options | undefined; meta: TuiPluginMeta }) {
  const info = () => {
    const route = props.api.route.current
    const params = "params" in route ? route.params : undefined
    return JSON.stringify(params ?? {}, null, 2)
  }

  return (
    <box flexDirection="column" padding={1} gap={1}>
      <text fg={props.api.theme.current.primary}>
        <b>{label(props.options)} plugin</b>
      </text>
      <text>id: {props.meta.id}</text>
      <text>state: {props.meta.state}</text>
      <text>source: {props.meta.source}</text>
      <text>route params: {info()}</text>
      <box flexDirection="row" gap={1}>
        <text>providers: {props.api.state.provider.length}</text>
        <text>sessions: {props.api.state.session.count()}</text>
      </box>
    </box>
  )
}

function Modal(props: { api: TuiPluginApi }) {
  return (
    <box paddingBottom={1} paddingLeft={2} paddingRight={2} gap={1} flexDirection="column">
      <text>
        <b>Plugin modal</b>
      </text>
      <text>Dialog depth: {props.api.ui.dialog.depth}</text>
      <text>Close with Esc or the button.</text>
      <box
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={props.api.theme.current.primary}
        onMouseUp={() => props.api.ui.dialog.clear()}
      >
        <text fg={props.api.theme.current.selectedListItemText}>close</text>
      </box>
    </box>
  )
}

const defaultKeybinds: BindingConfig<Renderable, KeyEvent> = {
  "acme.open": "ctrl+shift+o",
  "acme.modal": "ctrl+shift+m",
  "acme.notify": "ctrl+shift+n",
  "acme.close": "escape,q",
}

function registerCommands(api: TuiPluginApi, options: Options | undefined, meta: TuiPluginMeta) {
  const keys = createBindingLookup(defaultKeybinds, {
    commandMap: {
      "acme.open": "acme.open",
      "acme.modal": "acme.modal",
      "acme.notify": "acme.notify",
      "acme.close": "acme.close",
    },
  })
  const route = routeName(options)

  // api.keymap.registerLayer replaces the old api.command.register API.
  // Disposers returned by keymap APIs are automatically tracked by TUI runtime cleanup.
  api.keymap.registerLayer({
    mode: "base",
    commands: [
      {
        name: "acme.open",
        title: `${label(options)}: Open dashboard`,
        description: "Open the plugin dashboard route",
        category: "Plugin",
        namespace: "palette",
        slashName: "acme",
        slashAliases: ["demo"],
        run() {
          api.route.navigate(route, { openedAt: Date.now() })
        },
      },
      {
        name: "acme.modal",
        title: `${label(options)}: Open modal`,
        category: "Plugin",
        namespace: "palette",
        run() {
          api.ui.dialog.setSize("medium")
          api.ui.dialog.replace(() => <Modal api={api} />)
        },
      },
      {
        name: "acme.notify",
        title: `${label(options)}: Notify`,
        category: "Plugin",
        namespace: "palette",
        async run() {
          const result = await api.attention.notify({
            title: label(options),
            message: "Plugin requested your attention",
            notification: { when: "blurred" },
            sound: { name: "done", when: "always" },
          })
          api.ui.toast({
            variant: result.ok ? "success" : "warning",
            message: result.ok ? "Attention sent" : `Attention skipped: ${result.skipped ?? "unknown"}`,
          })
        },
      },
      {
        name: "acme.close",
        hidden: true,
        run() {
          api.route.navigate("home")
        },
      },
    ],
    bindings: keys.gather("acme", ["acme.open", "acme.modal", "acme.notify"]),
  })

  api.keymap.registerLayer({
    mode: route,
    commands: [{ name: "acme.close", run: () => api.route.navigate("home") }],
    bindings: keys.gather("acme", ["acme.close"]),
  })

  api.lifecycle.onDispose(() => {
    console.log(`TUI plugin disposed: ${meta.id}`)
  })

  // Cleanup is reverse-order, awaited, and bounded by the host cleanup budget.
  // api.lifecycle.signal is aborted before onDispose callbacks run.
}

function registerRoutes(api: TuiPluginApi, options: Options | undefined, meta: TuiPluginMeta) {
  const route = routeName(options)

  api.route.register([
    {
      name: route,
      render: () => {
        const popMode = api.mode.push(route)
        onCleanup(popMode)
        return <Panel api={api} options={options} meta={meta} />
      },
    },
  ])

  // Reserved route names: home and session.
  // api.route.navigate("session", { sessionID }) only uses sessionID.
  // api.route.current returns { name: "home" }, { name: "session", params }, or plugin route params.
}

function registerSlots(api: TuiPluginApi, options: Options | undefined) {
  const id = api.slots.register({
    order: 100,
    slots: {
      home_footer() {
        return <text fg={api.theme.current.textMuted}>{label(options)} loaded</text>
      },
      sidebar_footer(props) {
        return <text fg={api.theme.current.textMuted}>Session {props.session_id}</text>
      },
    },
  })

  // slots.register returns the assigned plugin id, not an unregister function.
  // Slot registrations are automatically removed on plugin deactivation.
  console.log("registered slots", id)
}

function registerAttention(api: TuiPluginApi) {
  const unregisterPack = api.attention.soundboard.registerPack({
    id: "acme.soft",
    name: "Acme Soft",
    sounds: {
      done: "sounds/done.mp3",
      error: "sounds/error.mp3",
      question: "sounds/question.mp3",
      permission: "sounds/permission.mp3",
      subagent_done: "sounds/subagent-done.mp3",
    },
  })

  api.lifecycle.onDispose(unregisterPack)

  const active = api.attention.soundboard.activate("acme.soft", { persist: false })
  const packs = api.attention.soundboard.list()
  console.log("attention sound pack active", active, api.attention.soundboard.current(), packs)

  // notify defaults:
  // notification: enabled with when "blurred"
  // sound: enabled with semantic sound "default" and when "always"
  // TUI config attention.enabled defaults to false, so notify can return skipped: "attention_disabled".
  void api.attention.notify({
    title: "opencode",
    message: "TUI plugin loaded",
    notification: false,
    sound: { name: "default", volume: 0.2, when: "always" },
  })
}

function registerEvents(api: TuiPluginApi) {
  api.event.on("session.idle", async (evt) => {
    await api.attention.notify({
      title: "opencode",
      message: "Session completed",
      notification: { when: "blurred" },
      sound: { name: "done" },
    })
  })

  api.event.on("session.error", (evt) => {
    api.ui.toast({ variant: "error", message: `Session error: ${evt.properties.sessionID ?? "unknown"}` })
  })

  api.event.on("question.asked", async () => {
    await api.attention.notify({
      message: "A question needs your input",
      notification: { when: "blurred" },
      sound: { name: "question", when: "always" },
    })
  })

  api.event.on("permission.asked", async () => {
    await api.attention.notify({
      message: "A permission request needs your input",
      notification: { when: "blurred" },
      sound: { name: "permission", when: "always" },
    })
  })

  api.event.on("session.next.tool.failed", async () => {
    await api.attention.notify({
      message: "A tool call failed",
      notification: { when: "blurred" },
      sound: { name: "error", when: "always" },
    })
  })
}

function showDialogs(api: TuiPluginApi) {
  const DialogAlert = api.ui.DialogAlert
  const DialogConfirm = api.ui.DialogConfirm
  const DialogPrompt = api.ui.DialogPrompt
  const DialogSelect = api.ui.DialogSelect

  api.ui.dialog.replace(() => (
    <DialogAlert title="Alert" message="Something happened" onConfirm={() => api.ui.dialog.clear()} />
  ))

  api.ui.dialog.replace(() => (
    <DialogConfirm
      title="Confirm"
      message="Are you sure?"
      onConfirm={() => api.ui.dialog.clear()}
      onCancel={() => api.ui.dialog.clear()}
    />
  ))

  api.ui.dialog.replace(() => (
    <DialogPrompt
      title="Enter name"
      placeholder="Your name..."
      onConfirm={(value) => {
        api.kv.set("name", value)
        api.ui.dialog.clear()
      }}
      onCancel={() => api.ui.dialog.clear()}
    />
  ))

  api.ui.dialog.replace(() => (
    <DialogSelect
      title="Choose option"
      options={[
        { title: "Option A", value: "a", description: "First option" },
        { title: "Option B", value: "b", description: "Second option", category: "Advanced" },
      ]}
      onSelect={(option) => {
        api.kv.set("selected", option.value)
        api.ui.dialog.clear()
      }}
    />
  ))
}

function inspectApi(api: TuiPluginApi) {
  // App
  const version = api.app.version

  // TUI config is live and includes resolved attention/keybind settings.
  const attentionEnabled = api.tuiConfig.attention.enabled
  const attentionVolume = api.tuiConfig.attention.volume

  // KV is shared app storage, not plugin-namespaced.
  const count = api.kv.get<number>("acme.visit_count", 0)
  api.kv.set("acme.visit_count", count + 1)

  // State is read-only synced app state.
  const ready = api.state.ready
  const config = api.state.config
  const providerCount = api.state.provider.length
  const paths = api.state.path
  const branch = api.state.vcs?.branch
  const sessionCount = api.state.session.count()
  const lsp = api.state.lsp()
  const mcp = api.state.mcp()

  // Session-specific helpers.
  const current = api.route.current
  if (current.name === "session") {
    const sessionID = current.params.sessionID
    const session = api.state.session.get(sessionID)
    const diff = api.state.session.diff(sessionID)
    const todo = api.state.session.todo(sessionID)
    const messages = api.state.session.messages(sessionID)
    const status = api.state.session.status(sessionID)
    const permissions = api.state.session.permission(sessionID)
    const questions = api.state.session.question(sessionID)
    const parts = messages.flatMap((message) => api.state.part(message.id))
    console.log({ session, diff, todo, status, permissions, questions, parts })
  }

  // Theme
  const themeReady = api.theme.ready
  const selected = api.theme.selected
  const darkOrLight = api.theme.mode()
  const hasTheme = api.theme.has("my-theme")
  const setTheme = api.theme.set("my-theme")
  void api.theme.install("themes/my-theme.json")

  // SDK client
  void api.client.app.log({ body: { service: "acme.tui", level: "info", message: "hello from TUI" } })

  // Renderer is the raw CliRenderer for low-level integrations.
  const renderer = api.renderer

  // Plugin management
  const plugins = api.plugins.list()
  void api.plugins.activate("some-plugin-id")
  void api.plugins.deactivate("some-plugin-id")
  // install patches tui.json/opencode.json but does not load into this session.
  // Call add(spec) after a successful install when you want immediate runtime load.
  void api.plugins.install("opencode-some-plugin", { global: false })
  void api.plugins.add("opencode-some-plugin")

  // Metadata is persisted by plugin id and helps detect first load vs update.
  const metaFields = {
    state: "first | updated | same",
    id: "plugin id",
    source: "file | npm | internal",
    spec: "configured spec",
    target: "resolved target",
    requested: "npm requested version",
    version: "npm installed version",
    modified: "file mtime",
    first_time: "first seen timestamp",
    last_time: "last load timestamp",
    time_changed: "fingerprint changed timestamp",
    load_count: "load count",
    fingerprint: "change detection key",
  }

  console.log({
    version,
    attentionEnabled,
    attentionVolume,
    ready,
    config,
    providerCount,
    paths,
    branch,
    sessionCount,
    lsp,
    mcp,
    themeReady,
    selected,
    darkOrLight,
    hasTheme,
    setTheme,
    renderer,
    plugins,
    metaFields,
  })
}

function formatShortcuts(api: TuiPluginApi, bindings: readonly SequenceBindingLike[] | undefined) {
  const text = api.keys.formatBindings(bindings)
  return text ?? "unbound"
}

const tui: TuiPlugin = async (api, rawOptions, meta) => {
  const pluginOptions = options(rawOptions)

  registerCommands(api, pluginOptions, meta)
  registerRoutes(api, pluginOptions, meta)
  registerSlots(api, pluginOptions)
  registerAttention(api)
  registerEvents(api)
  inspectApi(api)

  // Example only. Calling this immediately opens all dialogs in sequence; copy pieces as needed.
  if (pluginOptions?.label === "dialogs-demo") showDialogs(api)

  api.ui.toast({
    variant: "info",
    title: label(pluginOptions),
    message: `Loaded ${meta.id} (${meta.state})`,
    duration: 3000,
  })

  // Deprecated compatibility API still exists for v1 plugins, but new plugins should not use it:
  // api.command?.register(() => [])
  // api.command?.trigger("command")
  // api.command?.show()
}

export default { id: "acme.tui-reference", tui } satisfies TuiPluginModule & { id: string }
