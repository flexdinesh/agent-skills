---
name: git-worktree
description: Create, inspect, use, clean up, and delete Git worktrees for a repository. Use when the user requests to isolate parallel work in separate checkouts, prepare a branch in a new directory, ship from a worktree, inspect existing worktrees, repair stale worktree metadata, or remove worktrees safely, with the canonical base repo kept separate from managed sibling worktrees under `../<repo-name>-worktrees/` by default.
---

# Git Worktree

## Overview

Use Git worktrees to keep multiple branches checked out at the same time without cloning the repository again.

Treat the original non-linked checkout as the canonical base repo. Do not treat the current working directory as canonical if you are already inside a linked worktree.

By default, create managed worktrees in a sibling directory named `../<repo-name>-worktrees/`, where `<repo-name>` is the directory name of the canonical base repo.

Always ask for explicit confirmation before creating or deleting a worktree.

## Terms

Use these terms consistently:

- `canonical base repo`: the main non-linked checkout for the repository
- `expected stable branch`: the repo's default branch when it can be determined, otherwise `main` or `master`, otherwise an override from another skill
- `current base branch`: the branch currently checked out in the canonical base repo
- `managed worktree root`: the default sibling directory `../<repo-name>-worktrees/` or a path override from another skill
- `target branch`: the branch the new or existing worktree should use
- `source branch`: the branch used to create a new target branch when the target branch does not already exist

Do not silently redefine the expected stable branch based on the current base branch. If the canonical base repo is currently on a feature branch, report that state and ask whether to proceed.

## Directory Layout

Use this layout by default:

```text
parent-dir/
|-- repo-name/                     # canonical base repo checkout
|   `-- ...
`-- repo-name-worktrees/          # managed sibling worktree root
    |-- feature-branch/
    |   `-- ...
    `-- bugfix-branch/
        `-- ...
```

Interpret the layout with these rules:

- the canonical base repo stays at `parent-dir/repo-name/`
- the managed worktree root stays at `parent-dir/repo-name-worktrees/`
- each managed worktree is a sibling inside that managed worktree root
- if another skill overrides naming or root-path rules, use the override consistently and still report the final absolute path before acting

## Required Preflight

Run this check before any create, inspect, cleanup, or delete workflow:

```bash
git rev-parse --show-toplevel
git branch --show-current
git rev-parse --path-format=absolute --git-common-dir
git symbolic-ref refs/remotes/origin/HEAD
git worktree list --porcelain
```

Use the output to determine:

- the current checkout path
- the current branch
- the shared Git common directory
- the default remote branch when available
- every registered worktree path and attached branch
- whether each entry is main, linked, bare, detached, or locked

Canonical base repo resolution is mandatory:

1. Parse `git worktree list --porcelain`.
2. Identify the main worktree entry.
3. Use that main worktree path as the canonical base repo.
4. Derive `<repo-name>` from the canonical base repo directory name.
5. Derive the managed worktree root as the sibling `../<repo-name>-worktrees/` unless another skill overrides it.
6. Resolve all paths to absolute paths before presenting them to the user.

Expected stable branch resolution:

1. Prefer the remote default branch from `refs/remotes/origin/HEAD`.
2. Otherwise use an explicit override from another skill.
3. Otherwise fall back to `main`, then `master`, only if one exists.
4. If none can be determined, report that the stable branch is unknown and avoid implying one.

## Naming And Path Convention

Default worktree naming is branch-derived:

- sanitize the target branch name into a directory-friendly name
- place the worktree at `<managed-worktree-root>/<sanitized-branch-name>`

Default sanitization rules:

- replace `/`, `\\`, spaces, `:`, and other non-directory-friendly characters with `-`
- collapse repeated separators when practical
- trim leading and trailing separators when practical
- show the sanitized result to the user before creation

These are defaults, not hard requirements. Another skill may override:

- the worktree directory naming convention
- the managed worktree root
- the full worktree path

If another skill overrides naming or path rules, use the override consistently and still ask for confirmation before creating anything.

## Branch Resolution Rules

Resolve branch state before choosing a command:

- if the target branch exists locally and is not checked out in another worktree, attach the new worktree to that branch
- if the target branch exists locally and is already checked out in another worktree, stop and tell the user instead of forcing a conflicting checkout
- if the target branch exists only on a remote, fetch if needed, then create or attach a local tracking branch and report that fetch was required
- if the target branch does not exist, require a source branch
- if the source branch exists only on a remote, fetch if needed, then create the target branch from that source branch
- if the source branch is already checked out in another worktree, that is acceptable when creating a new target branch from it
- if neither the target branch nor the source branch can be resolved, stop and explain the missing branch state

Use `git fetch --all --prune` only when branch resolution requires fresher remote refs. Report when fetch occurred.

## Create A Worktree

Use this workflow:

1. Run the required preflight.
2. Resolve the canonical base repo, managed worktree root, expected stable branch, and current base branch.
3. Ask for the target branch if the user did not specify it.
4. Use the current branch as the default source branch unless the user specifies a different one.
5. Apply the branch resolution rules.
6. Compute the final absolute worktree path from the naming rules or an override.
7. Tell the user the concluded values:
   - canonical base repo path
   - expected stable branch
   - current base branch
   - target branch
   - source branch when applicable
   - whether fetch was required
   - managed worktree root
   - final worktree path
   - sanitized directory name when applicable
8. Ask for explicit confirmation before creating anything.
9. Create the worktree only after the user confirms.
10. Switch into the newly created worktree directory immediately after creation.

Use command patterns like:

```bash
git fetch --all --prune
git worktree add -b <target-branch> <final-worktree-path> <source-branch>
git worktree add <final-worktree-path> <target-branch>
git worktree add --track -b <target-branch> <final-worktree-path> origin/<target-branch>
cd <final-worktree-path>
```

If the canonical base repo is not on the expected stable branch, report that explicitly before confirmation rather than silently treating the current base branch as stable.

## Use Worktrees To Ship

When the user asks to use worktrees to ship:

1. Run the required preflight.
2. Reuse the create-worktree workflow instead of inventing a separate layout.
3. Keep release, hotfix, or feature work isolated inside the managed worktree root.
4. Switch into the created worktree path immediately after creation.
5. Run branch-specific commands from inside that worktree path rather than switching the canonical base repo.
6. Before finishing, summarize which absolute path maps to which branch.

Use this pattern when it helps:

```bash
cd <final-worktree-path>
git status --short --branch
git fetch --all --prune
```

If shipping involves deleting the branch after merge, remove the worktree first. Ask separately before deleting the branch.

## Inspect Existing Worktrees

Use these commands to build context:

```bash
git worktree list --porcelain
git branch --all --verbose --verbose
git status --short --branch
```

Inspection is read-only. Do not prune, unlock, remove, or repair anything during inspect unless the user explicitly asks for cleanup.

Report:

- the repository inspected
- the canonical base repo path
- the expected stable branch
- the current base branch
- each worktree path
- the branch attached to each path when present
- whether each checkout is the main worktree or a linked worktree
- whether each entry is bare, detached, or locked
- whether any registered worktree path appears stale on disk

If stale metadata exists, report it and suggest cleanup. Do not mutate during inspect.

## Clean Up Worktrees

Use cleanup when the user wants stale registrations pruned or clean linked worktrees removed.

Clean up in this order:

1. Inspect with `git worktree list --porcelain`.
2. For each candidate worktree, check whether it still exists on disk and whether it has uncommitted changes.
3. If the path is missing on disk, ask for confirmation, then run `git worktree prune`.
4. If the linked worktree exists and is clean, ask for confirmation, then remove it with `git worktree remove <path>`.
5. If Git reports the worktree is locked, inspect the reason and ask before unlocking or forcing removal.
6. Never remove the main worktree.

Useful commands:

```bash
test -d <path>
git -C <path> status --short
git worktree prune
git worktree unlock <path>
git worktree remove <path>
git worktree remove --force <path>
```

Prefer `git worktree remove` over manually deleting the directory because it updates Git metadata correctly.

## Delete A Worktree

Use this workflow:

1. Run the required preflight.
2. Ask for the worktree path if the user provided only a branch name and multiple candidates could exist.
3. Present the matching worktree path or paths and branch mapping.
4. If no worktree matches, tell the user and stop.
5. Check for uncommitted changes in the selected worktree before deletion.
6. If it is clean, ask for confirmation, then remove it with `git worktree remove <path>`.
7. If it contains changes, stop and explain what would be lost unless the user explicitly asks for force.
8. Ask separately whether the branch should also be deleted after the worktree is removed.

Use force only with clear intent:

```bash
git worktree remove --force <path>
git branch -D <branch>
```

Do not assume branch deletion is part of worktree deletion.

## Operational Contract

Always:

- verify the current repository before acting
- resolve the canonical base repo from `git worktree list --porcelain`
- report the expected stable branch and the current base branch separately
- keep responses and confirmations in terms of absolute paths
- ask for confirmation before creating, pruning, removing, unlocking, or force-removing
- check for uncommitted changes before removal
- report when fetch was required to resolve branch state

Never:

- infer the canonical base repo from the current worktree directory name alone
- silently treat a feature branch in the base repo as the stable branch
- mutate anything during inspect-only workflows
- create a managed worktree before confirming the concluded values
- remove the main worktree
- force-remove a worktree or branch without clear user intent
- delete a worktree directory with plain `rm -rf` unless the user explicitly asks and Git-based cleanup is not viable

## Response Pattern

Keep responses operational and concrete. For each create, cleanup, or delete task, include:

- the repository you inspected
- the canonical base repo absolute path
- the expected stable branch
- the current base branch
- the target branch involved
- the source branch involved when creating
- the managed worktree root absolute path
- the final worktree absolute path
- whether fetch was required
- whether you switched into the created worktree path
- whether any naming or path override was applied
- the exact command sequence you plan to run or did run
- any confirmation still needed from the user
