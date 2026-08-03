---
name: obsidian-projects
description: "Manage project-specific notes, plans, tasks, backlog, wins, problems, and workflows in an Obsidian vault using Obsidian CLI. Use only when the user explicitly invokes `obsidian-projects` or `$obsidian-projects`; do not auto-invoke from context."
---

# Obsidian Projects

Manual invocation only: use this skill only when the user explicitly invokes
`obsidian-projects` or `$obsidian-projects`.

Use Obsidian CLI to manage durable notes and tasks for the project containing the current
working directory. Keep project content separate from daily notes and group it under one
project folder in the user's confirmed default vault.

## CLI contract

- Expect `obsidian` to be available. Do not run an availability or version preflight.
- Use only Obsidian CLI commands to read or change vault content; do not edit vault files
  directly through the filesystem.
- Put `vault=<name-or-id>` immediately after `obsidian` when targeting a vault.
- Pass every dynamic `key=value` parameter as one opaque, safely escaped shell argument.
  Never interpolate vault text into shell source. Prefer an argument-array API; otherwise
  use correct quoting for the current shell, including embedded quotes, backslashes,
  backticks, and `$`. Encode content newlines as literal `\n` only after escaping existing
  backslashes. Stop rather than write if content cannot be represented losslessly.
- If an `obsidian` command cannot run or fails, stop. Show the failed command and error,
  then ask the user to ensure Obsidian CLI is enabled and on `PATH`, and Obsidian is
  running. Do not probe or attempt repairs.

Run `obsidian help <command>` only when the current CLI syntax is needed.

## Confirm the default vault

Do this before querying or changing project notes:

1. Run untargeted `obsidian vault info=name` and `obsidian vault info=path`. These are the
   first Obsidian commands; do not preflight them. The CLI selects a vault from the
   working directory when it is inside a vault and otherwise uses the active vault.
2. Show the name and path and ask the user to confirm that this is their default vault.
   Do not query or change vault notes before confirmation.
3. Remember the confirmed name and path for the current chat session. Use an explicit
   `vault=` target for every remaining command.
4. At the start of a later invocation in the same session, repeat the two untargeted
   metadata commands. Continue without asking when both values match. If either changed,
   show the old and new identities and ask the user to confirm before accessing notes.

Do not persist vault confirmation between chat sessions.

## Resolve the current project

Resolve the source identity before searching the confirmed vault:

1. Get the physical current directory. If it is inside Git, use the canonical path from
   `git rev-parse --show-toplevel` as the source path; otherwise use the physical current
   directory.
2. In Git, read `remote.origin.url` when present. Normalize common SSH and HTTP(S) forms
   to lowercase `host/owner/repository`, removing credentials, a trailing slash, `.git`,
   query text, and fragments. Keep the final repository component separately.
3. Use the repository component as the default project name and derive a lowercase
   kebab-case project ID from it. Without a usable origin, use the Git top-level directory
   name. Outside Git, use the current directory name.
4. Run `files folder=Projects ext=md` and keep candidate paths ending exactly in
   `/Project.md`. Read their project properties or contents through the CLI and require
   exact frontmatter values; do not treat incidental body text as a mapping.
5. Match an existing project first by canonical `source_paths`, then by normalized
   `git_remote`. A remote match lets clones and worktrees with different paths resolve to
   the same project.
6. Never merge on project ID or repository name alone. If an unrelated project already
   uses the derived name or ID, show the conflict and ask the user for a distinct project
   name and ID.

When a remote matches but the source path is new, use the existing project immediately.
Add the new path to `source_paths` as part of the next user-authorized vault write; do not
turn a read-only request into a mapping write.

If no mapping matches, show the derived name, ID, source path, remote when present, and
proposed `Projects/<Project Name>` path. Ask the user to confirm or rename it before
initializing project content. For a read-only request, report that the project has no
stored notes instead of creating it unless the user asks to initialize it.

## Project shape

Use this hierarchy and create only what the request needs:

```text
Projects/<Project Name>/
  Project.md
  Tasks.md
  Notes/
    YYYY-MM-DD - <Title>.md
```

Initialize `Project.md` with:

```yaml
---
type: project
project_id: example
git_remote: host/owner/example
source_paths:
  - /absolute/path/to/example
tags:
  - project/example
---
```

Omit `git_remote` when unavailable. Follow the frontmatter with the project title and:

```md
## Current problems

## Ideas

## Wins

## Gotchas

## Notes
```

Initialize `Tasks.md` with `type: project-tasks`, the project ID, the project tag, a
path-qualified link to the project home, and:

```md
## Tasks

## Backlog
```

Add missing managed properties or headings without rearranging or replacing user content.
If a property conflicts, a required heading is duplicated, or multiple mappings match,
stop and ask before changing anything.

## Capture notes

- Put a brief current problem, idea, win, or gotcha as a bullet under the matching
  `Project.md` heading.
- Put research findings, architecture plans, bug-fix plans, detailed gotchas, development
  workflows, and other substantial material in `Notes/YYYY-MM-DD - <Title>.md`, using the
  machine's local date and a concise descriptive title.
- Give long-form notes `type: project-note`, `project_id`, a path-qualified project link,
  `kind`, `created`, `status`, project tag, and `people` when named people are material.
  Use kinds such as `research`, `architecture-plan`, `bug-fix-plan`, `gotcha`, `workflow`,
  and `note`; prefer an existing suitable kind over inventing near-duplicates.
- Link every long-form note from `Project.md` under `## Notes`. Because every project home
  is named `Project.md`, use full paths such as `[[Projects/example/Project|Example]]`.
- If the target note path already exists, read it and ask whether to update it or choose a
  distinct title. Never overwrite it merely because the generated title collides.

Represent a named person as `[[Full Name]]`. Do not create a person note unless the user
asks. Preserve names and substantive human details exactly.

For dictated input or session findings, remove filler and repair obvious punctuation
while preserving meaning. Base saved material only on the supplied conversation or
evidence. Do not invent facts, decisions, people, dates, or intent. Never record passwords,
tokens, private keys, or secret values; keep only variable names, steps, and redacted
examples. Ask one concise question when content routing or sensitivity is unclear.

## Task operations

Keep native Markdown tasks in the resolved project's `Tasks.md`. Put useful detail as
indented Markdown directly below its checkbox and treat that checkbox plus its indented
content as one task block.

- **Add:** put current, actionable, prioritized, or next work under `## Tasks`. Put later,
  deferred, parked, speculative, or explicitly backlogged work under `## Backlog`.
- **Move:** starting, prioritizing, or making an item next moves its whole block from
  Backlog to Tasks. Deferring or parking it moves the whole block from Tasks to Backlog.
  Infer this only when context is clear; otherwise ask which section the user intends.
- **Complete:** require one match, mark it done, and add `✅ YYYY-MM-DD` using today's
  local date. Leave it in its current section.
- **Reopen:** mark one matched task todo and remove its completion marker.
- **Edit:** change only the matched task block, preserving its checkbox, section, project
  tag, and completion marker unless the user changes them.
- **Delete:** remove only one uniquely matched task block. Never delete `Tasks.md`.

Use `tasks path=<Tasks.md> verbose format=json` to find task paths and line references,
then require candidates to belong to the exact resolved `Tasks.md`. Narrow by status,
section, and text when possible. If multiple tasks match, show short candidates with
section and status and ask the user to choose. A unique explicit request needs no extra
confirmation.

For every whole-note mutation, including initialization, mapping updates, note indexing,
task moves, and completion-marker changes:

1. Read every containing note immediately before changing it.
2. Change only the intended line, block, property, link, or missing section.
3. Rewrite through `obsidian create path=<path> content=<full-content> overwrite`.
4. Read the note again and verify both the requested change and preservation of unrelated
   content. Stop and report any mismatch.

## Queries and summaries

Scope searches, task listings, lookbacks, and summaries to the resolved project folder by
default. Search other project folders only when the user explicitly asks for a
cross-project result. Do not create or initialize content during a read-only query.

Base answers only on vault evidence. Mention missing mappings, dates, task details, or
metadata when they materially limit the result. Keep the response concise unless the user
requests detail.
