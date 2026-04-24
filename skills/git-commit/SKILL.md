---
name: git-commit
description: Stage changes and create a Git commit for the current task. Use when Codex should inspect the repo, verify the commit scope matches the current session, prepare a brief commit subject, add a concise body summarizing the session changes, and create the commit with Git CLI. Expect this skill to be extended by project-specific skills that provide the required commit naming convention.
---

# Git Commit

Use this skill when the user wants Codex to prepare and create a Git commit for work completed in the current conversation.

## Preflight

Check the repo state first:

```bash
git status --short
git branch --show-current
git rev-parse --abbrev-ref --symbolic-full-name @{upstream}
git diff --stat
git diff --cached --stat
```

Before drafting the commit message or staging anything:

1. Verify `git` is available.
2. Verify the current directory is inside a Git repository.
3. Inspect the current branch and upstream.
4. Stop and tell the user if `HEAD` is detached unless the user explicitly wants to commit there.
5. Stop and tell the user if a merge, rebase, or cherry-pick is in progress.
6. Stop and tell the user if there is nothing to commit.

## Commit Workflow

1. Review the current conversation and repo changes to determine what was completed in this session.
2. Inspect both staged and unstaged changes to verify they match the work from the current session.
3. If the staged changes do not match the session work, stop and ask the user to adjust the staging scope.
4. Ask which staging scope to use before staging:
   - keep existing staged changes as-is
   - tracked changes only: `git add -u`
   - all changes including new files: `git add -A`
5. If unrelated changes are present, stop or ask the user to narrow the scope before continuing.
6. Write a short commit subject.
7. Write a concise commit body that summarizes the actual changes completed in the current session.
8. Base the body on both the session context and the staged diff, not on a generic conversation recap.
9. Include the body by default. Omit it only when the change is trivial, single-purpose, and the subject fully captures the work.
10. Show the proposed subject, body, and chosen staging scope.
11. Ask for final confirmation before running `git commit`.
12. Stage with Git CLI, then create the commit with Git CLI.
13. After the commit succeeds, inspect the current branch and upstream before offering to push.
14. Ask whether to push the branch.
15. Default to not pushing unless the user explicitly confirms.
16. If the user confirms and there is no upstream, push with `git push -u origin <branch>`.
17. If the user confirms and an upstream exists, push with Git CLI.

## Commit Naming

- If another active skill provides a commit naming convention, exact format, or prefix rule, follow it.
- If no upstream convention is provided, use a short plain subject.
- Do not ask the user to re-decide the naming format when an upstream skill already defined it.

## Constraints

- Keep the subject concise.
- Keep the body concise and limited to the changes completed in the current session.
- Avoid unrelated changes; commit only work relevant to the current conversation.
- Do not continue if the commit scope cannot be isolated confidently.
- Do not push by default.
- Ask for confirmation before any push.
- Stop and tell the user if the branch or remote cannot be determined confidently for push.
- Do not use `--amend` unless the user explicitly requests it.
- Do not force-push.
- Do not replace Git CLI with a prose-only answer.
