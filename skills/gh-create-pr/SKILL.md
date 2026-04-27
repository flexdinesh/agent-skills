---
name: gh-create-pr
description: Push the current branch and create a GitHub pull request with gh CLI. Use when the user requests to create a PR. Expect this skill to be extended by project-specific skills that override the PR title and description format.
---

# GH Create PR

Use this skill when the user requests to push the current branch and create a GitHub pull request with `gh`.

## Core Rules

- Use non-interactive Git and `gh` commands only.
- Ask for confirmation before any remote side effects.
- Never guess the base branch when multiple plausible targets exist.
- Never assume the push remote is `origin` without checking.
- Never rely on editor prompts from `git` or `gh`.
- Prefer the actual branch diff over chat history when summarizing the PR.
- If the current session summary and branch diff disagree, tell the user and summarize the branch diff.

## Tool Checks

Run these checks first:

```bash
command -v git
command -v gh
gh auth status
git rev-parse --is-inside-work-tree
git branch --show-current
git remote -v
```

Stop and tell the user if any of these are true:

- `git` is unavailable
- `gh` is unavailable
- `gh auth status` shows the user is not authenticated
- the current directory is not inside a Git worktree
- the current checkout is on detached `HEAD`
- no GitHub remote can be identified confidently

## Inspect Repo State

Inspect the repo before drafting the PR:

```bash
git status --short
git branch --show-current
git rev-parse --abbrev-ref --symbolic-full-name @{upstream}
git remote -v
```

Rules:

- If the upstream exists, inspect commits ahead of upstream with:

```bash
git log --oneline @{upstream}..HEAD
```

- If the upstream does not exist, do not fail. Continue with base-branch resolution.
- Dirty local changes do not block the skill, but the PR summary must be based on the committed branch diff rather than unstaged edits.

## Resolve Base Branch

Resolve the base branch in this order:

1. If another active project skill defines the base branch, use that.
2. Otherwise use the GitHub repo default branch:

```bash
gh repo view --json defaultBranchRef
```

3. If that cannot be resolved confidently, use `origin/HEAD` only if it resolves cleanly.
4. Otherwise stop and ask the user which branch to target.

After resolving the base branch, fetch and inspect it:

```bash
git fetch <base-remote> <base-branch>
git merge-base <base-remote>/<base-branch> HEAD
git log --oneline <base-remote>/<base-branch>..HEAD
git diff --stat <base-remote>/<base-branch>...HEAD
```

Rules:

- Stop if the base branch cannot be determined confidently.
- Stop if `HEAD` has no commits ahead of the resolved base branch.
- Show the resolved base branch to the user before PR creation.

## Resolve Push Remote

Resolve the push remote in this order:

1. If the current branch already tracks a remote branch, use that remote.
2. Otherwise, if exactly one GitHub remote matches the current checkout, use it.
3. Otherwise, if multiple plausible GitHub remotes exist, stop and ask the user which remote to push to.
4. Never assume `origin` unless it is the only confident match.

Push rules:

- If the current branch already has an upstream, use:

```bash
git push
```

- If the current branch does not have an upstream, use:

```bash
git push -u <push-remote> <branch>
```

## Draft PR Content

PR workflow:

1. Review the current conversation or session to identify what was completed.
2. Inspect the commits and branch diff from the resolved base branch.
3. Draft a brief PR title and concise PR description using both the session and Git history.
4. Prefer the actual branch diff over commit subjects when they disagree.
5. If the branch contains work outside the current conversation, summarize the full branch and tell the user before confirmation.
6. Keep the title and description as brief as possible.

Default PR title format:

```text
<type>: <description>
```

- `<type>` must be one of `feat`, `fix`, `docs`, `ci`, `chore`, `test`, `perf`, `refactor`, or `style`.
- `<description>` must be brief and accurately describe the PR.

Default PR description format:

```md
Summary: <brief summary>

Changes:

- <change and why>

Notes:

- <optional validation note>

TODO:

- [ ] <optional required follow-up>
```

Description rules:

- `Summary` is required and should be one brief sentence.
- `Changes` is required and should use short bullets that say what changed and why.
- Add docs or reference links only when directly relevant to a change.
- Omit `Notes` when there is nothing to validate before merge.
- Omit `TODO` when there is nothing that should be done before merge.

PR formatting is overridable:

- If another active skill defines the PR title format, use that instead of the default title format.
- If another active skill defines the PR description format, use that instead of the default description format.
- Do not ask the user to re-decide the format when an active project skill already defined it.

## Check For Existing PR

Before creating a new PR, check whether one already exists for the current branch:

```bash
gh pr list --head <branch> --state open --json number,title,baseRefName,headRefName,url
```

Rules:

- If an open PR already exists for the current branch, stop and show it to the user.
- Do not create a second PR for the same head branch unless the user explicitly asks for a different target or repo.

## Confirmation

Show the user all of the following before any push or PR creation:

- push remote
- head branch
- base branch
- draft or ready mode
- proposed title
- proposed description

Ask whether to create the PR in draft mode or ready mode. Default to draft mode.

Ask for final confirmation before any remote side effects.

## Push Branch

Push with Git CLI after the user confirms:

- If the branch already has an upstream, use `git push`.
- If the branch does not have an upstream, use `git push -u <push-remote> <branch>`.

## Create PR

Create the PR with a fully specified non-interactive command:

```bash
gh pr create --base <base-branch> --head <branch> --title "<title>" --body-file <temp-file> [--draft]
```

Rules:

- Always pass `--base`.
- Always pass `--head`.
- Always pass `--title`.
- Always pass `--body-file` or `--body`.
- Add `--draft` only when the user chose draft mode.
- Do not rely on `gh` defaults or interactive prompts.

## Output Requirements

Before confirmation, show the user:

- resolved push remote
- head branch
- resolved base branch
- draft or ready mode
- proposed title
- proposed description

After creation, report the PR URL.

## Constraints

- Keep the title concise.
- Keep the description concise and limited to the current branch and session.
- Avoid unrelated changes when summarizing the PR.
- Stop and tell the user if the base branch cannot be determined confidently.
- Stop and tell the user if the push remote cannot be determined confidently.
- Stop and tell the user if no GitHub remote is configured.
- Stop and tell the user if `gh` is unavailable or not authenticated.
- Stop and tell the user if the current checkout is detached `HEAD`.
- Stop and tell the user if there are no commits ahead of the resolved base branch.
- Stop and tell the user if an open PR already exists for the current branch.
- Default to draft mode unless the user asks for ready mode.
- Do not replace `git push` or `gh pr create` with a prose-only answer.
