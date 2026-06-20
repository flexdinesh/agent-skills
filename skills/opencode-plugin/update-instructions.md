# Update Instructions (maintainer-only)

This file is NOT referenced by the skill. It exists so a future agent can re-sync `skills/opencode-plugin/` against the current opencode plugin source. It is not loaded into the skill's context automatically.

## Goal

Keep the skill accurate against the plugin SDK and runtime behaviour in the opencode source repo. The skill is a cheat sheet plus three reference files; the source is the source of truth.

## Locate the source

The opencode source is a monorepo. The agent only needs the plugin-related parts — do not explore how opencode itself works. Find the repo root (often a sibling, e.g. `../opencode`, but locate it; do not assume). Relevant packages:

- `packages/plugin/` — the `@opencode-ai/plugin` SDK shipped to plugin authors. **Primary source of truth for types.**
- `packages/opencode/src/plugin/` — server-side loader, lifecycle, internal plugins.
- `packages/opencode/src/config/` — config discovery, plugin spec parsing, auto-discovery rules.
- `packages/tui/src/plugin/` — TUI plugin runtime (slots, routes, scoped APIs).
- `packages/sdk/js/src/` — the `Event` unions shipped to plugins (v1 + v2).

## Source → skill mapping

Each skill artifact is derived from specific source files. Diff against these:

### Skill: `SKILL.md` (cheat sheet)
- **Key Concepts / module shape** → `packages/plugin/src/index.ts` (`Plugin`, `PluginModule`) and `tui.ts` (`TuiPlugin`, `TuiPluginModule`). Re-verify the `{ id?, server }` / `{ id?, tui }` object shape and that one module cannot export both.
- **PluginInput fields** → `PluginInput` in `packages/plugin/src/index.ts`.
- **Server Hooks table** → the `Hooks` interface in `packages/plugin/src/index.ts`. Every key in `Hooks` must be a row. Currently includes `experimental.*` hooks — re-check each.
- **TUI API Surface table + Attention API + slot names** → `TuiPluginApi`, `TuiAttention*`, `TuiHostSlotMap` in `packages/plugin/src/tui.ts`.
- **Config / loading rules** (schemas, spec forms, auto-discovery, `exports`/`oc-themes`, `engines.opencode`) → `packages/opencode/src/config/config.ts`, `config/tui.ts`, `config/plugin.ts`, `config/paths.ts`, and `packages/opencode/src/plugin/shared.ts` (`resolvePluginEntrypoint`, `readPackageThemes`, `checkPluginCompatibility`, `readV1Plugin`).
- **Bus Events pointer** → v1 union in `packages/sdk/js/src/gen/types.gen.ts` (search `export type Event =`), v2 union in `packages/sdk/js/src/v2/gen/types.gen.ts`.

### Skill: `references/events.md`
- **Server (v1) list** → the `Event` union in `packages/sdk/js/src/gen/types.gen.ts`.
- **TUI (v2) list** → the `Event` union in `packages/sdk/js/src/v2/gen/types.gen.ts`.
- **Runtime caveat** (server hook receives v2 events at runtime, typed as `any`) → the `events.listen` block in `packages/opencode/src/plugin/index.ts` that calls `hook["event"]?.({ event: { ... } as any })`.

### Skill: `references/server-hooks.ts`
- Must compile against `Hooks` in `packages/plugin/src/index.ts` and `tool()`/`ToolContext` in `packages/plugin/src/tool.ts`. Add an example block for any new hook key.

### Skill: `references/tui-plugin.tsx`
- Must exercise the current `TuiPluginApi` in `packages/plugin/src/tui.ts` and the scoped runtime in `packages/opencode/src/plugin/tui/runtime.ts`.

## What to look for (drift signals)

1. **New/removed `Hooks` keys** — grep the `Hooks` interface and compare to the Server Hooks table.
2. **New/removed `TuiPluginApi` fields** — compare to the TUI API Surface table.
3. **Event union changes** — extract every `type: "..."` literal from both SDK gen files and diff against `references/events.md`. Remove any event listed in the skill that no longer exists; add any new ones. Note v1-only vs v2-only correctly.
4. **Deprecations** — grep for `@deprecated` JSDoc in `packages/plugin/src/`. Note them in the skill (e.g. `condition` → `when`, `api.command` → `api.keymap`).
5. **`TuiHostSlotMap` keys** — these are the built-in slot names; diff against the "Built-in Slot Names" line.
6. **`PluginInput` / `TuiPluginMeta` field changes** — update the field lists.
7. **New `experimental.*` hooks** — add to the table with the `experimental.*` note that they may change.
8. **Loader behaviour changes** — `readV1Plugin`, `resolvePluginEntrypoint`, retry/compatibility logic in `shared.ts` and `loader.ts`. Update Config/Loading and Rules sections if behaviour shifts.
9. **Internal auth plugins list** — `packages/opencode/src/plugin/index.ts` `internalPlugins(...)`. Only worth noting if the skill's auth section references them.
10. **Package `exports`** — `packages/plugin/package.json` `exports` map. The skill references `@opencode-ai/plugin`, `/tool`, `/tui`.

## How to update

1. Read the source files in the mapping above. Do not skim — the skill's value is precision.
2. For each drift signal, diff source vs skill and edit the skill artifact.
3. Prefer editing existing files over creating new ones. The current structure (SKILL.md + 3 references) is intentional.
4. Keep the v1/server vs v2/TUI distinction explicit everywhere it matters (events, typing). This is the most common source of past inaccuracies.
5. Do not invent events, hooks, or API fields. If unsure whether something exists, grep the SDK gen files or the plugin `src/` — that is authoritative.
6. Code examples in references must stay self-consistent and typed against the current SDK.
7. Do not reference this file from `SKILL.md` or any reference file. It is maintainer-only.

## Accuracy rules

- **Source is truth.** If the skill and source disagree, the source wins unless the skill is documenting intended behaviour the source has a bug for (rare; flag it).
- **No phantom names.** Never list an event/hook/slot that does not appear in source. (Past example: `catalog.model.updated`, `account.*` were listed but never existed.)
- **Distinguish typed vs runtime.** Server `event` hook is *typed* v1 but *receives* v2 at runtime. State both facts; do not collapse them.
- **Mark deprecations.** When source marks something `@deprecated`, the skill must say so and point to the replacement.
- **`experimental.*` is unstable.** Keep the "may change between versions" note.

## Verification checklist (run before finishing)

- [ ] Every key in the `Hooks` interface is a row in the Server Hooks table.
- [ ] Every field of `TuiPluginApi` is covered in the TUI API Surface table or Attention API section.
- [ ] `references/events.md` v1 list == v1 `Event` union members; v2 list == v2 `Event` union members.
- [ ] Built-in slot names line == keys of `TuiHostSlotMap`.
- [ ] `PluginInput` field list matches the type.
- [ ] No `@deprecated` symbol in `packages/plugin/src/` is undocumented in the skill.
- [ ] `references/server-hooks.ts` and `references/tui-plugin.tsx` typecheck conceptually against current exports (no removed APIs referenced).
- [ ] Config schema URLs, spec forms, and auto-discovery rules still match `config/config.ts` + `config/tui.ts` + `config/plugin.ts`.

## Out of scope

- How the opencode server/TUI work internally.
- The opencode CLI, desktop, web, or enterprise packages.
- Anything outside `packages/plugin/`, `packages/opencode/src/plugin/`, `packages/opencode/src/config/`, `packages/tui/src/plugin/`, and `packages/sdk/js/src/`.
