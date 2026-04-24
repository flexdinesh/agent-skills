---
name: review-changes
description: Review local code changes from Git state or refs to find concrete bugs, regressions, security issues, compatibility risks, and missing tests. Use when Codex should review staged changes, unstaged changes, commits, or branch diffs with concise, evidence-based findings grounded in local code context.
---

# Review Changes

Use this skill when the user wants Codex to review local changes rather than a GitHub PR.

## Default Outcome

- Produce a concise review that surfaces the highest-risk issues in the selected local changes.
- Prioritize real correctness, regression, security, compatibility, and test-gap findings.
- Treat design, maintainability, operability, and documentation as secondary unless they create concrete near-term risk.
- Optimize for credible findings, not checklist coverage.

## Core Rules

- Stay read-only with respect to repository files.
- Prefer local Git state and local refs. Do not auto-fetch.
- Start from the diff, but read full changed files before turning a suspicion into a finding.
- Read only the surrounding code, tests, configs, schemas, or docs needed to validate or falsify a concern.
- Do not guess. Resolve discoverable ambiguity from local context first.
- Ask the user only when intent, expected behavior, or missing non-local context would change the review outcome.
- Review only the requested scope. Do not expand into unrelated pre-existing issues unless the selected change exposes them directly.
- Do not pad the review with style nits, speculative risks, or a universal rubric when parts of it are irrelevant.

## Supported Review Targets

- staged changes against the current codebase, excluding unstaged changes
- unstaged changes against the current staged baseline
- unstaged changes compared directly to staged changes
- the latest commit
- the latest N commits
- the current branch, including local staged and unstaged changes, against another branch

If the requested target is unclear, ask the user to choose the exact review scope before continuing.

## Review Workflow

1. Determine the exact review target from the user request and local Git state.
2. Inspect the selected diff or commit range with local Git.
3. Read the full contents of changed files, not just the diff hunks.
4. Read the minimum surrounding code, tests, configs, schemas, or docs needed to understand contracts and behavior.
5. Evaluate the change with the review lenses below, weighted by risk.
6. Report only findings that survive context checking.
7. If intent ambiguity blocks judgment, stop and ask a targeted question instead of guessing.

## Review Lenses

Use these in priority order. Do not force every lens into every review.

### Primary

- Correctness and regressions
  - Does the change work on the happy path?
  - What breaks on edge cases, nulls, empty states, retries, races, or partial failure?
- Safety and security
  - What inputs are trusted?
  - What happens with malformed or unexpected input?
  - Does this create attack surface or expose secrets or sensitive data?
- Compatibility and change risk
  - Is behavior backward compatible?
  - Does this change contracts, schema, migrations, or client expectations?
- Testing
  - What proves the change works?
  - What regressions or security-sensitive paths remain untested?

### Secondary

- Design and maintainability
  - Is this more complex than necessary?
  - Does it fit local patterns and stay understandable for the next engineer?

### Contextual

- Operability
  - Are logs, metrics, rollback, retry, timeout, or load concerns relevant here?
- Documentation
  - Did a contract, assumption, or operator expectation change enough to need docs or comments?

## Questions To Ask The User

Ask only when the answer would materially change the review:

- why the change exists
- intended behavior or non-goals
- rollout, compatibility, or security expectations
- missing external context that cannot be discovered locally

## Output Format

Make the findings the product.

- Present findings first, ordered by severity.
- Keep each finding brief, concrete, and fix-oriented.
- Include file paths and line numbers when citing code.
- Explain the failure mode or risk in real behavior, safety, compatibility, or maintenance terms.
- Suggest a fix direction when it is straightforward.
- Do not report speculative issues as findings.
- If there are no actionable findings, say so explicitly and note any residual risk or validation gap.
- After findings, include only short open questions, assumptions, or a compact summary if they help interpret the review.

## Constraints

- Do not auto-fetch remote refs.
- If a branch, commit, or compare target is missing locally, ask the user before continuing.
- Do not review from the diff alone when local codebase context is available.
- Do not treat speculation as a finding.
- Do not turn the review into a style pass, full architecture critique, or rewrite request unless a concrete defect requires it.
