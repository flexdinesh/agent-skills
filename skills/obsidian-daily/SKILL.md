---
name: obsidian-daily
description: "Manage daily tasks, notes, wins, events, people, and project summaries in an Obsidian vault using Obsidian CLI. Use only when the user explicitly invokes `obsidian-daily` or `$obsidian-daily`; do not auto-invoke from context."
---

# Obsidian Daily

Manual invocation only: use this skill only when the user explicitly invokes
`obsidian-daily` or `$obsidian-daily`.

Use Obsidian CLI to manage the user's daily work in the default vault. Keep the system
small, predictable, and compatible with native Daily Notes and Markdown tasks.

## CLI contract

- Expect `obsidian` to be available. Do not run an availability or version preflight.
- Obsidian and the Daily Notes core plugin must be running and enabled.
- Use only Obsidian CLI commands to read or change vault content; do not edit vault files
  directly through the filesystem.
- Put `vault=<name-or-id>` immediately after `obsidian` when targeting a vault.
- Pass every dynamic `key=value` parameter as one opaque, safely escaped shell argument.
  Never interpolate vault text into shell source. Prefer an argument-array API; otherwise
  use correct quoting for the current shell, including embedded quotes, backslashes,
  backticks, and `$`. Encode actual content newlines as literal `\n` only after escaping
  existing backslashes. Stop rather than write if the content cannot be represented
  losslessly.
- If an `obsidian` command cannot run or fails, stop. Show the failed command and error,
  then ask the user to ensure Obsidian CLI is enabled and on `PATH`, Obsidian is running,
  and Daily Notes is enabled. Do not probe or attempt repairs.

Run `obsidian help <command>` only when the current CLI syntax is needed.

## Resolve the daily vault

Do this before operating on daily content:

1. Run `obsidian daily:path`. This is the first CLI command; do not preflight it.
2. Derive the configured daily-note folder from the returned path. List Markdown files in
   that folder with `obsidian files folder=<folder> ext=md`; omit `folder` when the path
   is at the vault root.
3. Treat the current vault as the daily vault only when that location contains existing
   `YYYY-MM-DD.md` daily notes. Today's note does not need to exist yet.
4. Otherwise run `obsidian vaults verbose`, show the choices, and ask the user which vault
   contains their daily notes. Never guess.
5. Validate the chosen vault with targeted `daily:path` and `files` commands. Open one of
   its existing daily notes with `obsidian vault=<chosen> open path=<daily-note>` to focus
   that vault without creating content. Use the explicit `vault=` target for every
   remaining command in the invocation.

If no vault contains existing daily notes, ask the user to choose the intended vault and
configure Daily Notes to use `YYYY-MM-DD` filenames before continuing.

## Daily-note shape

Use the folder configured by Daily Notes and `YYYY-MM-DD.md` filenames. For today's work,
run `daily` to create the note when needed, then get its exact path with `daily:path`.

Every managed daily note has these properties:

```yaml
date: YYYY-MM-DD
type: daily
```

and these second-level sections:

```md
## Tasks

## Notes

## Wins

## Events
```

Add missing properties or sections without rearranging or replacing existing content. If
a property conflicts or a required heading is duplicated, ask before changing it.

## Entry conventions

- Tasks: `- [ ] Prepare release notes #project/example`
- Notes: `- The retry policy needs a separate timeout #project/example`
- Wins: `- Reduced deploy time to five minutes #project/example`
- Events: `- Reviewed the rollout with [[Jane Smith]] #project/example`
- Completed tasks: `- [x] Prepare release notes #project/example ✅ YYYY-MM-DD`

Use a project tag on every project-specific entry, not only tasks. Reuse an existing
`#project/...` tag when the match is clear; otherwise normalize the spoken project name
to lowercase kebab-case. Put unassigned entries under the correct section without a
made-up project.

Represent a named person as `[[Full Name]]`. Do not create a person note unless the user
asks. Preserve names and substantive details exactly.

For dictated input, remove filler and repair obvious speech punctuation while preserving
meaning. Do not invent facts, projects, people, dates, or intent. Use explicit language
such as "task", "to do", "win", or "event" to select a section; infer only when the
meaning is clear, otherwise ask one concise question.

## Task operations

Use `tasks verbose format=json` to find task paths and line references. Before mutating,
require every candidate to be a `YYYY-MM-DD.md` file in the resolved daily-note folder.
Narrow further by status, project tag, date, or text when possible.

- **Add:** insert a new unchecked item under today's `## Tasks` section.
- **Complete:** require one matching task, run `task ref=<path:line> done`, then add
  `✅ YYYY-MM-DD` using today's local date.
- **Reopen:** run `task ref=<path:line> todo`, then remove its completion marker.
- **Edit:** replace only the uniquely matched task line and preserve its checkbox,
  project tag, and completion marker unless the user changes them.
- **Delete:** remove only the uniquely matched task line. Never delete the daily note.

If multiple tasks match, show short candidates with date, project, and status and ask the
user to choose. A unique explicit request needs no extra confirmation.

For every whole-note mutation, including initialization, additions, edits, deletion, and
completion-marker changes:

1. Read the containing note immediately before changing it.
2. Change only the intended line or missing section.
3. Rewrite through `obsidian create path=<path> content=<full-content> overwrite`.
4. Read the note again and verify both the requested change and preservation of unrelated
   content. Stop and report any mismatch.

## Lookbacks and summaries

Resolve dates in the machine's local timezone:

- current week: Monday through today
- last week: the preceding Monday through Sunday
- month: calendar month
- rolling periods: only when the user explicitly asks for one

List files in the configured daily folder and select `YYYY-MM-DD.md` notes. Do not create
daily notes during a read-only lookback.

For notes, wins, events, and legacy completed tasks without markers, read only daily notes
whose filenames fall in the requested range. Separately run `tasks done verbose
format=json`, keep only tasks in the daily folder, and scan their completion markers so a
task created earlier but completed in the requested range is still included.

- Count a completed task on its `✅ YYYY-MM-DD` date.
- For an older completed task without a marker, fall back to its daily-note date and say
  that the date was inferred.
- Collect wins from `## Wins`.
- For project summaries, group tasks and entries by `#project/...`; group entries without
  a project tag as `Unassigned`.
- Base summaries only on vault evidence. Mention missing dates or project tags when they
  materially limit the result.

Keep the answer concise unless the user requests detail.
