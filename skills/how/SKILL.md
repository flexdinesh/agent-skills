---
name: how
description: "Explain how code works: subsystem architecture, runtime flow, onboarding mental models, code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Use only when the user explicitly invokes `how` or `$how`; do not auto-invoke from context."
---

# How

Manual invocation only: use this skill only when the user explicitly invokes `how` or `$how`; do not auto-invoke from task context.

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

This skill answers what the code does and how it works. It does not answer why the code has its shape. For motivation, history, and tradeoffs, investigate commits, PRs, tickets, and docs instead.

## Subagents

Explorers and the explainer are read-only. They never write files.

If your environment can spawn subagents, run each explorer and the explainer as its own subagent so raw file reads stay out of the main context. Run explorers in parallel. When you can choose models, a fast model is fine for explorers. Use your strongest model for the explainer. If your environment can't spawn subagents, play each role yourself in sequence and keep each explorer's findings separate until synthesis.

## 1. Assess complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. Run one explainer that explores and explains in one pass, built from `references/explainer-prompt.md` without the explorer-findings section. Go to step 4.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): go to step 2.

When in doubt, take the simple path.

## 2. Explore (complex only)

Decompose the question into 2 to 4 angles, each a distinct slice of the subsystem. Start all explorers at once, each with `references/explorer-prompt.md` and its angle filled in.

## 3. Synthesize (complex only)

Once all explorers have returned, run one explainer with `references/explainer-prompt.md` and every explorer's findings filled in.

## 4. Present

Present the explainer's output. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.

## Output format

The explanation uses the sections defined in `references/explainer-prompt.md`, dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
