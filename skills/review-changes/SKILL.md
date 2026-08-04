---
name: review-changes
description: "Review local code changes from Git state or refs. Use only when the user explicitly invokes `review-changes` or `$review-changes`; do not auto-invoke from context."
---

# Review Changes

Manual invocation only: use this skill only when the user explicitly invokes `review-changes` or `$review-changes`; do not auto-invoke from task context.

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

## Coding Style

Optimize for code that is straightforward for humans to read and reason about.

- Apply the Rule of Three aggressively. Keep small, single-use logic inline, tolerate duplication across two places, and extract an abstraction only when the same meaningful logic appears in roughly three or more places or files.
- Look across changed files and relevant existing code for the same abstraction being recreated independently. When reuse is justified under the Rule of Three, recommend moving a small, stable abstraction into an existing reusable module or shared utility instead of maintaining parallel versions in multiple files.
- Prefer explicit code over indirection. Do not introduce wrappers that merely forward to standard-library or framework APIs such as request or response methods; call those APIs directly where they are used.
- For enums and other small, fixed sets, including fixed arrays, prefer explicit `switch` cases over loop-driven lookup or dispatch when every possible entry is known and can be handled directly.
- Prefer direct named property access and assignment when property names are known. Avoid dynamic destructuring, computed access, spreading, or object reconstruction that makes the same operation harder to follow.
- Favor readability over marginal or speculative performance gains. Prefer a clear operation such as `map` over a less-readable loop unless the readable implementation has a concrete, material performance cost.
- Treat these as secondary readability signals. Report them only when changed code adds meaningful indirection, complexity, or maintenance cost; do not turn the review into a cosmetic style pass.

## Questions To Ask The User

Ask only when the answer would materially change the review:

- why the change exists
- intended behavior or non-goals
- rollout, compatibility, or security expectations
- missing external context that cannot be discovered locally

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
  - authentication flaws
  - authorization bypasses
  - unsafe deserialization or similar trust-boundary mistakes when relevant
- Performance
  - n+1 queries
  - missing indexes
  - caching opportunities
  - algorithmic bottlenecks
- Architecture
  - system design decisions
  - component boundaries
  - dependency directions
  - design patterns and anti-patterns
  - code smells
- Data
  - migration checks
  - breaking schema, api
  - transaction boundaries
  - referential integrity
  - ID mappings
  - rollback safety
  - data validations and backwards compatibility
- Frontend
  - Detects race conditions in JavaScript and Stimulus controllers
- Behavioral regressions:
  - changed semantics
  - missing compatibility handling
  - broken migrations or upgrade paths
- Test gaps:
  - missing coverage for new branches, failure cases, or security-sensitive behavior
- Fit with the existing codebase:
  - whether the change follows current patterns and established abstractions
  - whether a suspicious diff is actually correct in local context
- Language specific
  - Rails: Rails conventions, Turbo Streams patterns, model/controller responsibilities
  - Go: Go conventions, code organisation conventions, patterns and boundaries
  - Python: PEP 8 compliance, type hints, Pythonic idioms
  - TypeScript: Type safety, modern ES patterns, clean architecture
- Deployment
  - pre-deploy checklists
  - post-deploy verification steps
  - rollback plans
- Agent-native
  - Ensures features are accessible to agents, not just humans

Before flagging something:

- Be certain.
- Investigate first if unsure.
- Do not invent hypothetical issues.
- Explain the realistic failure scenario.
- Do not be a zealot about style.
- Performance findings are high priority only when the issue is concrete and obvious.

## Output Format

Make the findings the product.

- When there are meaningful readability suggestions, present a `Human readability suggestions` section first.
- Keep readability suggestions concise and non-blocking. Include file paths, line numbers, and a direct improvement where applicable.
- Omit the readability section when there are no meaningful suggestions.
- Follow it with a `Priority findings` section containing actionable findings ordered by severity.
- Do not repeat a readability suggestion as a priority finding unless it creates a concrete maintenance or behavioral risk.
- Keep each finding brief, concrete, and fix-oriented.
- Include file paths and line numbers when citing code.
- Explain the failure mode or risk in real behavior, safety, compatibility, or maintenance terms.
- Suggest a fix direction when it is straightforward.
- Do not report speculative issues as findings.
- If there are no actionable findings, say so explicitly and note any residual risk or validation gap.
- After findings, include only short open questions, assumptions, or a compact summary if they help interpret the review.

Example

Human readability suggestions:
[ ] Inline a single-use request wrapper so the request flow is visible at the call site

Priority findings:

P1 - CRITICAL (must fix):
[ ] SQL injection vulnerability in search query
[ ] Missing transaction around user creation

P2 - IMPORTANT (should fix):
[ ] N+1 query in comments loading
[ ] Controller doing business logic

P3 - MINOR (nice to fix):
[ ] Unused variable
[ ] Could use guard clause

## Constraints

- Do not auto-fetch remote refs.
- If a branch, commit, or compare target is missing locally, ask the user before continuing.
- Do not review from the diff alone when local codebase context is available.
- Do not treat speculation as a finding.
- Do not turn the review into a style pass, full architecture critique, or rewrite request unless a concrete defect requires it.
