---
name: autopilot
description: "Plan, implement, validate, push, and create a PR for the accompanying prompt, then return to main. Use only when explicitly invoked as `autopilot` or `$autopilot`."
---

# Autopilot

Manual invocation only: use this skill only when the user explicitly invokes `autopilot` or `$autopilot`; do not auto-invoke from task context.

Treat the accompanying prompt as the task. Invocation authorizes worktree creation, implementation, task-scoped commits, pushing, PR creation, and returning to `main`; no separate approval needed. Stop only when the user's direction is needed.

Flow: Prepare, Plan, Execute, Validate, Push and PR, Return to main.

## Prepare

Read repository instructions. Inspect Git status, branch, upstream, and remotes; preserve unrelated work. Resolve detached HEAD or missing context first. Check that `wt` is available on `PATH` before starting the task. If missing, ask the user to install the Worktrunk CLI (`wt`) and make it available on `PATH`; resume once available. Identify `main`'s upstream remote (use `origin` if no upstream is configured) and run `git fetch <remote>`; require success. Always work from the fetched `<remote>/main`, never local `main`, which may be stale.

- Default: run `wt switch --create <task> --base <remote>/main` to create a descriptive branch in a new worktree from the fetched remote `main`, and switch to its directory before planning. Do this regardless of the current branch.
- Exception: only if the prompt explicitly says to continue existing work on the current branch, stay in it, but first rebase it onto the fetched `<remote>/main` (or its fetched parent branch, if stacked on another branch) when it lacks those commits. Never merge. Ask before handling uncommitted changes or an in-progress rebase; never discard or stash them automatically. On conflicts, abort the rebase, report files, and ask before resolving. If this rewrites published commits, disclose it at push time per Push and PR.

Use Worktrunk (`wt`), never Git commands, to create or switch worktrees. Confirm the resulting directory and branch; run subsequent commands from that worktree directory explicitly. If fetching, rebasing, or `wt` fails, report the blocker; do not continue from a stale base or fall back to Git worktree commands.

## Plan

Read `references/planning.md` and follow it exactly. Planning stays read-only; worktree setup from Prepare is the only change made before planning ends.

- Do not prompt the user to save the plan to a file. Save one only if the user explicitly asked, per the reference's Plan File rules.
- If open decisions, preferences, or ambiguity remain, ask the user and wait. Do not invent user decisions.
- Planning ends when the plan is decision complete: present the final plan, then proceed to Execute automatically. Do not ask for approval to start.

## Execute

Read `references/execution.md` and follow it exactly, using the finalized plan. Keep edits minimal, task-scoped, and consistent with repository conventions. When the reference says to stop and ask, stop and wait for direction; resume Autopilot once resolved.

## Validate

Before the after-execution summary:

- Run relevant local tests and required lint, type, and build checks. Add meaningful behavior tests where warranted.
- Fix task-related failures; report unresolved failures before publishing.
- Review the final diff.
- Include actual validation results in the summary.

## Push and PR

- Verify Git, `gh`, authentication, repository, push destination, head, base, and parent branch. Check for an existing open PR, including fork ownership; reuse the task PR instead of duplicating it.
- Stage only task changes; commit concisely. Run `git fetch <remote>` again for the latest `<remote>/main` and other relevant refs, then inspect the full committed diff against the PR base. Stop if there are no changes to propose.
- Check ancestry against the remote counterpart, parent, and base. Rebase stale branches in that order onto fetched remote refs; a `main` base means the freshly fetched `<remote>/main`, never local `main`. Never add merge commits. Record starting HEAD and fetched remote head. Ask before handling an existing rebase or obstructing local changes; never discard or stash them automatically. On conflicts, abort the attempted rebase, report files, and ask before resolving.
- After rebasing, review the final diff and rerun affected checks. Write a brief `<type>: <description>` title and bullets connecting concrete changes to why needed and what they fix; include actual validation results.
- Push explicitly with upstream tracking. If published history was rewritten, disclose it and obtain authorization; use an explicit lease against the fetched remote head, never plain force.
- Recheck for an existing PR. Create non-interactively with explicit repository, base, head, title, and `--body-file`; default to `--draft` unless ready mode was requested. Update an existing task PR instead. Attach the PR when supported.

## Return to main

After PR creation or update succeeds, run `wt switch main` to return to the `main` branch directory. Confirm the resulting directory and branch. Preserve local changes; never discard or stash unrelated work to force the switch. Report PR URL, validation, final branch, and any blocker.
