# Update Instructions (maintainer-only)

This file is NOT referenced by the skill. It exists so a future agent can re-sync `skills/pi-extension/` against the current Pi extensions docs/source. It is not loaded into the skill's context automatically.

## Goal

Keep the skill accurate against the Pi extension API. The skill is a cheat sheet plus three reference files; the source is the source of truth.

## Source of truth

- Docs (canonical, latest): https://pi.dev/docs/latest/extensions
- Raw docs source: `earendil-works/pi` repo → `packages/coding-agent/docs/extensions.md`
- Reference implementations / examples: `earendil-works/pi` repo → `packages/coding-agent/examples/extensions/`
- Types shipped to extension authors: `@earendil-works/pi-coding-agent`, `@earendil-works/pi-ai`, `@earendil-works/pi-tui`, and `typebox`.

The agent only needs the extension-related parts of the repo — do not explore how pi itself works internally.

## Source → skill mapping

### `SKILL.md` (cheat sheet)
- **Quick Start / factory shape** → "Quick Start" + "Writing an Extension" sections of the docs.
- **Rules** → "Writing an Extension" (async factory gating), "Long-lived resources and shutdown", "Tool Events" (`event.input` mutation), "Error Handling" (throw for errors), "Output Truncation", `CONFIG_DIR_NAME`, mode guards.
- **Locations & Loading** → "Extension Locations", "Extension Styles", `settings.json` `packages`/`extensions`, `package.json` `"pi": { "extensions": […] }`.
- **Imports** → "Available Imports" table.
- **Lifecycle** → "Lifecycle Overview" ASCII flow.
- **ExtensionContext** → every `ctx.*` field under "ExtensionContext".
- **ExtensionCommandContext** → every method under "ExtensionCommandContext" + "Session replacement lifecycle and footguns".
- **ExtensionAPI** → every method under "ExtensionAPI Methods" + "State Management".
- **Events list** → one row per event in "Events".
- **Custom Tools** → "Custom Tools" → "Tool Definition", "Overriding Built-in Tools", "Output Truncation", "Multiple Tools".

### `references/events.md`
- One section per event in the docs' "Events" → Startup/Resource/Session/Agent/Model/Tool/User Bash/Input. For each: payload fields, return shape, block/modify/notify semantics, ordering caveats (parallel-tool ordering, chaining, "first handler wins").

### `references/extension.ts`
- Must exercise every `pi.on(...)` event, `registerTool` (full shape + override notes + `withFileMutationQueue` + `terminate`), `registerCommand`, `registerProvider`/`unregisterProvider`, `registerShortcut`/`registerFlag`, `pi.exec`, tools get/set, `sendMessage`/`sendUserMessage`, `appendEntry` + `session_start` restore, `pi.events`, `isToolCallEventType`/`isBashToolResult`, `user_bash`/`createLocalBashOperations`, truncation utils, `CONFIG_DIR_NAME`.

### `references/custom-ui.ts`
- Must exercise the full `ctx.ui` surface (dialogs, footer/widgets/working, autocomplete, editor, theme), `ctx.ui.custom()`, `registerMessageRenderer`, tool `renderCall`/`renderResult`/`renderShell`, `theme.fg`/`highlightCode`/`getLanguageFromPath`/`keyHint`/`keyText`.

## What to look for (drift signals)

1. **New/removed events** — diff the docs' event list vs `references/events.md` and the Events section of `SKILL.md`. Add/remove rows in both.
2. **Event payload/return changes** — re-read each event section; update payload fields and return shapes.
3. **New/removed `ctx.*` fields** — diff "ExtensionContext" vs the SKILL `ExtensionContext` section and `extension.ts`.
4. **New/removed `pi.*` methods** — diff "ExtensionAPI Methods" vs the SKILL `ExtensionAPI` section and `extension.ts`.
5. **`ExtensionCommandContext` method changes** — signatures, option shapes, and the `withSession` footguns.
6. **Custom tool definition changes** — new optional fields (e.g. new `prepareArguments` semantics), `terminate` behavior, override rules.
7. **Tool-input typing helpers** — `isToolCallEventType`/`isBashToolResult` names and type-param usage.
8. **Provider config** — `registerProvider` option shape (`api` enum values, `apiKey` interpolation rules, `oauth`, `streamSimple`, per-model `baseUrl`).
9. **Truncation constants** — `DEFAULT_MAX_BYTES`, `DEFAULT_MAX_LINES` values and helper names.
10. **UI surface changes** — new `ctx.ui.*` methods, widget placement options, `custom()` overlay options, autocomplete provider shape.
11. **Component model** — verify the `Component`/JSX story against `@earendil-works/pi-tui`. The reference currently avoids JSX; update if a pragma is documented.
12. **Deprecations** — note any `@deprecated` symbols and their replacements in SKILL "Rules".

## How to update

1. Fetch https://pi.dev/docs/latest/extensions (or read `packages/coding-agent/docs/extensions.md` from the repo). Do not skim — the skill's value is precision.
2. For each drift signal, diff source vs skill and edit the skill artifact.
3. Prefer editing existing files over creating new ones. The current structure (SKILL.md + 3 references) is intentional.
4. Keep `extension.ts` and `custom-ui.ts` self-consistent with `events.md` and the SKILL sections.
5. Do not invent events, methods, fields, or option names. If unsure, check the docs or the shipped types — that is authoritative.
6. Do not reference this file from `SKILL.md` or any reference file. It is maintainer-only.

## Accuracy rules

- **Source is truth.** If the skill and source disagree, the source wins.
- **No phantom names.** Never list an event/method/field that does not appear in the docs or shipped types.
- **Mark semantics precisely.** Distinguish "can block" vs "can modify" vs "notify-only"; note chaining and ordering (parallel-tool mode) where it matters.
- **Distinguish contexts.** `ExtensionContext` (handlers/tools) vs `ExtensionCommandContext` (commands only — deadlock risk). Keep the `withSession` footgun explicit.

## Verification checklist (run before finishing)

- [ ] Every event in the docs is a section in `references/events.md` and a row in SKILL "Events".
- [ ] Every `ctx.*` field in the docs appears in SKILL "ExtensionContext".
- [ ] Every method in "ExtensionAPI Methods" appears in SKILL "ExtensionAPI" and is exercised in `extension.ts`.
- [ ] Every `ExtensionCommandContext` method + the `withSession` footgun is in SKILL and demonstrated in `extension.ts`.
- [ ] `registerTool` full shape (incl. `prepareArguments`, `terminate`, override rules, `withFileMutationQueue`) is accurate.
- [ ] `events.md` payload/return shapes match the docs.
- [ ] `custom-ui.ts` covers the current `ctx.ui` surface and rendering hooks.
- [ ] Truncation constants and helper names are current.
- [ ] Component-model note in `custom-ui.ts` still reflects `@earendil-works/pi-tui`.

## Out of scope

- How the pi TUI/runtime work internally.
- SDK / RPC / JSON event-stream modes beyond what extension authors observe via `ctx.mode`/`ctx.hasUI`.
- Anything outside the extension authoring surface (`packages/coding-agent/docs/extensions.md`, `examples/extensions/`, and the four shipped packages above).
