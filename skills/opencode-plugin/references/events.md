# Bus Events

Server plugins and TUI plugins subscribe to the same event bus but are typed against different SDK generations.

- **Server** `event` hook (`Hooks["event"]`) is typed with the **v1** `Event` union from `@opencode-ai/sdk`.
- **TUI** `api.event.on(type, handler)` is typed with the **v2** `Event` union from `@opencode-ai/sdk/v2`.

## Server events (v1 `Event`)

The complete set of event types a server `event` hook is typed to receive:

- **Server/global**: `server.connected`, `server.instance.disposed`
- **Installation**: `installation.updated`, `installation.update-available`
- **LSP**: `lsp.client.diagnostics`, `lsp.updated`
- **Message**: `message.updated`, `message.removed`, `message.part.updated`, `message.part.removed`
- **Permission**: `permission.updated`, `permission.replied`
- **Session**: `session.created`, `session.updated`, `session.deleted`, `session.idle`, `session.error`, `session.status`, `session.compacted`, `session.diff`
- **File/project/VCS**: `file.edited`, `file.watcher.updated`, `vcs.branch.updated`
- **Command/TUI**: `command.executed`, `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`
- **PTY**: `pty.created`, `pty.updated`, `pty.exited`, `pty.deleted`
- **Other**: `todo.updated`

### Runtime caveat

Internally the server runtime bridges the modern event stream into the hook and casts the payload to `any` (see `packages/opencode/src/plugin/index.ts`). This means a server `event` hook will, at runtime, also receive v2 stream events (e.g. `session.next.*`, `permission.v2.*`). TypeScript only narrows to the v1 union above, so to access v2 shapes you must narrow/cast `event.type` yourself. Prefer relying on the v1-typed events; cast only when you need a v2-only event.

## TUI events (v2 `Event`)

The complete v2 union that `api.event.on(type, handler)` is typed against. Handlers are type-narrowed by `type`.

- **Server/global**: `server.connected`, `global.disposed`, `server.instance.disposed`
- **Installation/catalog/models**: `installation.updated`, `installation.update-available`, `catalog.updated`, `models-dev.refreshed`, `integration.updated`
- **Plugin/reference**: `plugin.added`, `reference.updated`
- **Project/file/VCS**: `project.updated`, `project.directories.updated`, `file.edited`, `file.watcher.updated`, `vcs.branch.updated`
- **Session lifecycle**: `session.created`, `session.updated`, `session.deleted`, `session.idle`, `session.error`, `session.status`, `session.compacted`, `session.diff`
- **Session next stream**:
  - Prompt: `session.next.prompted`, `session.next.prompt.admitted`, `session.next.prompt.promoted`, `session.next.synthetic`, `session.next.moved`, `session.next.interrupt.requested`, `session.next.context.updated`
  - Agent/model: `session.next.agent.switched`, `session.next.model.switched`
  - Step: `session.next.step.started`, `session.next.step.ended`, `session.next.step.failed`
  - Text: `session.next.text.started`, `session.next.text.delta`, `session.next.text.ended`
  - Reasoning: `session.next.reasoning.started`, `session.next.reasoning.delta`, `session.next.reasoning.ended`
  - Tool: `session.next.tool.input.started`, `session.next.tool.input.delta`, `session.next.tool.input.ended`, `session.next.tool.called`, `session.next.tool.progress`, `session.next.tool.success`, `session.next.tool.failed`
  - Shell: `session.next.shell.started`, `session.next.shell.ended`
  - Retry/compaction: `session.next.retried`, `session.next.compaction.started`, `session.next.compaction.delta`, `session.next.compaction.ended`
- **Message**: `message.updated`, `message.removed`, `message.part.updated`, `message.part.removed`, `message.part.delta`
- **Permission**: `permission.asked`, `permission.replied`, `permission.v2.asked`, `permission.v2.replied`
- **Question**: `question.asked`, `question.replied`, `question.rejected`, `question.v2.asked`, `question.v2.replied`, `question.v2.rejected`
- **Command/TUI**: `command.executed`, `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`, `tui.session.select`
- **LSP/MCP**: `lsp.updated`, `mcp.tools.changed`, `mcp.browser.open.failed`
- **Workspace/worktree/PTY**: `workspace.ready`, `workspace.failed`, `workspace.status`, `worktree.ready`, `worktree.failed`, `pty.created`, `pty.updated`, `pty.exited`, `pty.deleted`
- **Other**: `todo.updated`

## Notable differences

- `lsp.client.diagnostics` is **v1-only** (server). TUI uses `lsp.updated`.
- `session.next.*`, `permission.v2.*`, `question.v2.*`, `catalog.updated`, `plugin.added`, `integration.updated`, `reference.updated`, `project.directories.updated`, `models-dev.refreshed` are **v2-only** (typed). Server plugins only see them at runtime via the bridge caveat above.
- `permission.updated` exists in v1; v2 has `permission.v2.*` instead.
- `account.*` and `catalog.model.updated` events do **not** exist in either SDK.
