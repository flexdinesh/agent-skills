---
name: review-pr
description: Review a GitHub pull request from a provided PR URL. Use when Codex should fetch PR metadata, prepare a local detached review worktree, inspect the actual branch diff in the local codebase, focus on bugs and OWASP Top 10 style risks, and optionally reconcile findings from multiple review agents when the runtime and user request allow it.
---

# Review PR

Use this skill when the user wants Codex to review a GitHub pull request and provide actionable feedback on the code changes.

## Core Rules

- The review itself must be read-only with respect to repository files.
- Local Git metadata updates that support the review are allowed.
- Prefer a local branch comparison and full-file reads over `gh pr diff`.
- Diffs alone are not enough. Read the full contents of modified files before concluding that something is wrong.
- Use surrounding code, nearby implementations, and existing history when needed to understand current decisions, abstractions, and patterns.
- Review only the changes in the PR, not unrelated pre-existing issues.
- Findings must focus on real bugs, security issues, behavioral regressions, or meaningful test gaps.

Allowed mutations:

- local `git fetch`
- local `git worktree add`
- local directory creation required for the review worktree

Never:

- edit repository files as part of the review
- apply patches
- commit, push, merge, or delete branches
- make remote changes through `gh` or Git
- fetch PR refs into normal local branch names such as `<source-branch>` or `<target-branch>`

## Required Input

- Expect a GitHub PR URL when the skill is invoked.
- If the URL is missing, ask the user for it before continuing.

## Tool Checks

1. Check whether `git` is available in the shell.
2. If `git` is unavailable, stop and tell the user the review cannot proceed.
3. Check whether `gh` is available in the shell.
4. If `gh` is available, use it to fetch PR metadata.
5. If `gh` is unavailable, fall back to parsing the PR URL and using Git-only fetches when possible.

## Fetch PR Metadata

Preferred command with `gh`:

```bash
gh pr view <pr-url> --json number,title,body,baseRefName,headRefName
```

Use the metadata to determine:

- PR number
- target branch
- source branch
- PR title
- PR description

Fallback when `gh` is unavailable:

1. Parse the PR number from the URL.
2. Infer the repository remote from the current checkout.
3. If the PR number or usable remote cannot be determined confidently, stop and ask the user.
4. Continue without PR title and body if Git-only fetch is possible.

## Jira Enrichment

1. Inspect the PR title and description for a Jira ticket ID such as `ABC-123`.
2. If a Jira ID is present, check whether `acli` is available.
3. If `acli` is available, fetch the Jira ticket details and summarize the ticket title and description.
4. If `acli` is unavailable, continue without Jira enrichment.

## Prepare The Review Workspace

Follow the `git-worktree` skill's preflight, canonical base repo resolution, and concluded-path confirmation flow rather than re-inventing worktree rules here.

Review-specific workspace rules:

1. Resolve the canonical base repo before deriving any paths.
2. Derive the review worktree root as `../<repo-name>-review-worktrees/` unless another skill overrides it.
3. Sanitize the review directory name from the PR number and source branch when available.
4. Show the user:
   - canonical base repo path
   - target branch
   - source branch when known
   - review worktree root
   - final review worktree path
5. Ask for explicit confirmation before creating the review worktree.

## Fetch Review Refs Safely

Do not fetch into normal local branch names. Fetch into review-only refs.

Use command patterns like:

```bash
git fetch origin <target-branch>:refs/codex/review-pr/<pr-number>/base
git fetch origin pull/<pr-number>/head:refs/codex/review-pr/<pr-number>/head
```

Rules:

- If the target-branch fetch cannot complete cleanly, continue with the existing local target branch only if it is clearly identifiable and recent enough for a trustworthy review. Otherwise stop.
- If the source PR ref fetch cannot complete cleanly, stop and tell the user instead of reviewing stale or ambiguous code.
- If the PR comes from a fork or `origin` is not the correct remote, determine the correct remote before fetching.

## Create The Review Worktree

Create the review worktree from the fetched review ref, preferably detached so it cannot collide with an already-checked-out branch.

Use command patterns like:

```bash
git worktree add --detach <review-worktree-path> refs/codex/review-pr/<pr-number>/head
```

Rules:

- Run the review from inside the created worktree path.
- Keep the review worktree by default after the review completes unless the user later asks to remove it.
- Do not attach the worktree directly to `<source-branch>` unless there is a specific reason and no branch-collision risk.

## Summarize Change Intent Before Reviewing

1. Analyze the PR title, description, target branch, source branch, and local diff.
2. Write a brief summary of the intent of the changes.
3. State what problem the PR appears to solve.
4. If Jira details were fetched, summarize the Jira ticket title and description as well.
5. Present the PR summary and Jira summary, when available, before starting the deep review.

## How To Review The Code

1. Use Git CLI to diff the actual review refs locally.
2. Start with a file inventory:
   - `git diff --stat refs/codex/review-pr/<pr-number>/base...refs/codex/review-pr/<pr-number>/head`
   - `git diff --name-only refs/codex/review-pr/<pr-number>/base...refs/codex/review-pr/<pr-number>/head`
3. Read every modified file in full from the review worktree before judging a change.
4. Inspect targeted hunks with enough context to understand control flow and data flow.
5. Inspect nearby code and existing implementations before concluding that a change is incorrect.
6. Inspect history only when needed to confirm whether a pattern or decision is intentional.
7. Review only the changed code, but use surrounding context to validate behavior.

## Review Priorities

- Bugs:
  - logic errors
  - incorrect conditionals
  - missing guards
  - broken error handling
  - null, empty, and malformed input cases
  - concurrency or race issues when relevant
- Security issues with explicit attention to OWASP Top 10 style risks:
  - injection
  - broken access control
  - sensitive data exposure
  - insecure defaults
  - unsafe deserialization or similar trust-boundary mistakes when relevant
- Behavioral regressions:
  - changed semantics
  - missing compatibility handling
  - broken migrations or upgrade paths
- Test gaps:
  - missing coverage for new branches, failure cases, or security-sensitive behavior
- Fit with the existing codebase:
  - whether the change follows current patterns and established abstractions
  - whether a suspicious diff is actually correct in local context
- Performance only when the issue is concrete and obvious.

Before flagging something:

- Be certain.
- Investigate first if unsure.
- Do not invent hypothetical issues.
- Explain the realistic failure scenario.
- Do not be a zealot about style.

## Orchestration

Default behavior:

1. The invoking agent is the main reviewer.
2. The main reviewer loads PR metadata, prepares the local review worktree, writes the PR summary, and performs the review.

Optional parallel review:

1. Use multiple review agents only when both of these are true:
   - the user explicitly asked for delegation, sub-agents, or parallel review
   - the runtime permits agent spawning
2. When parallel review is allowed, prefer three reviewers named `alpha`, `beta`, and `charlie`.
3. Each review agent independently reviews the same local worktree using the same instructions.
4. Each review agent must inspect full-file context and relevant existing code patterns before returning findings.
5. Each review agent returns only actionable findings.
6. The main reviewer reconciles the outputs, deduplicates overlapping findings, and summarizes the final findings to the user.
7. For each final finding, note whether it was reported by:
   - all agents
   - two agents
   - one agent

## Output Format

- First, provide the brief PR intent summary.
- Then provide the Jira summary when Jira details were fetched.
- Then provide findings only.
- If there are no actionable findings, say so explicitly.
- Keep the tone matter-of-fact.
- Include file paths and line numbers.
- Communicate severity honestly.
- Explain why the issue is a bug or real security risk.
- Suggest a fix when it is straightforward.
- If the review was single-agent, do not mention agent consensus.
- If the review was reconciled from multiple agents, note whether each finding was reported by all agents, two agents, or one agent.

## Constraints

- Do not continue if neither `gh` nor a reliable Git-only fallback can identify the PR to review.
- Do not review only the `gh` diff when a local branch comparison is available.
- Do not skip full-file reads for modified files.
- Do not assume unfamiliar code is wrong before checking local patterns.
- Do not recommend unnecessary rewrites when a smaller fix is enough.
- Do not create the review worktree before showing the concluded path and getting user confirmation.
- Do not fetch PR refs into ordinary local branch names.
