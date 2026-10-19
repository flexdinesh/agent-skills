---
name: interrogate
description: "Adversarial multi-reviewer code review: independent reviewers, ideally on different models, challenge a change, then a lead synthesizes a verdict. Use for \"interrogate\", \"adversarial review\", \"challenge this\", \"stress test this code\", \"find blind spots\", \"tear this apart\". Use only when the user explicitly invokes `interrogate` or `$interrogate`; do not auto-invoke from context."
---

# Interrogate

Manual invocation only: use this skill only when the user explicitly invokes `interrogate` or `$interrogate`; do not auto-invoke from task context.

Run independent reviewers to adversarially review code changes. The adversarial signal comes from reviewer independence, strongest when reviewers run on different model families, not from assigned personas. The deliverable is a synthesized verdict. Do NOT auto-apply changes.

## Step 1, Scope

Identify what to review from context:

- If the user points at specific files or a diff, use that.
- If on a feature branch, run `git diff main...HEAD` (or the appropriate base branch) for the full changeset.
- If the user's message references recent work, gather the relevant files.

Package the diff or file contents with any surrounding context files the reviewers need to understand the code.

## Step 2, Intent

Before starting reviewers, state the intent in one clear paragraph from the user's message, commit messages, the PR description if one exists, and the code. If you're unsure about the intent, ask the user before proceeding.

## Step 3, Run reviewers

Run at least two reviewers, labeled Reviewer A, B, and so on. Each reviewer is read-only.

- **Subagents.** If your environment can spawn subagents, run each reviewer as its own subagent with a fresh context, all started at once. If it can't, review the change yourself once per reviewer in sequence, and finish and record each pass before starting the next so later passes don't anchor on earlier ones.
- **Model diversity.** If you can choose a model per subagent, put each reviewer on a different model family, and use the strongest model available in each family. If you can't, run every reviewer on the same model with a fresh context, and say in the output that the panel lacked model diversity, so consensus is weaker signal.
- If a requested model is unavailable, run that reviewer on the closest available model and say so. Do not block the review on it.

Read `references/reviewer-prompt.md` and fill in the same template for every reviewer with the stated intent, the diff or file contents, the rubric from `references/rubric.md`, and the code-quality lens from `references/code-quality-review.md`.

## Step 4, Synthesize

As results come back, build a unified picture. Parse every reviewer's findings. Merge findings that describe the same issue differently, and note which reviewers raised each one. Findings two or more reviewers raised independently are the highest signal. Read a lone reviewer's finding, but weight it accordingly. Note disagreements. If one reviewer flags something and another explicitly says the opposite, that is context for the verdict.

## Step 5, Lead judgment

You are the lead reviewer, a pragmatic senior engineer, not a neutral aggregator. Read `references/lead-judgment.md` for the full framework. Verify each finding against the code before bucketing it. Put every finding in one of four buckets, with the reviewer(s) that raised it and a one-line rationale.

- **Act on**. Real issues affecting correctness, security, or maintainability given the actual goals. They would block a real PR.
- **Consider**. Legitimate, but you're not sure they outweigh the cost of addressing them now. Worth the user's attention.
- **Noted**. Technically valid but not actionable. Context-dependent, premature optimization, or low-impact at this stage.
- **Dismissed**. Wrong, nitpicky, or missing context, with a brief reason.

## Output format

### Intent
> [The stated intent paragraph from Step 2]

### Reviewers
- Reviewer [label]: [model name, or "same model, fresh context"], [N findings] (one bullet per reviewer)

### Act On
[Each: description, which reviewers raised it, why it matters.]

### Consider
[Each: description, which reviewers raised it, the tradeoff.]

### Noted
[Brief list.]

### Dismissed
[Each with a brief rationale.]

### Agreement Map
[Where reviewers agreed and diverged, and what that pattern tells us.]
