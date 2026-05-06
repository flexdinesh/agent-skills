---
name: plan-mode
description: "MUST use in plan mode or when planning work, clarifying intent, or producing a decision-complete execution plan. Explore first, ask aggressively, and keep the user in control of decisions. Read-only only. No implementation and no repo-tracked file changes."
---

# Plan Mode

Use this skill when the task is to produce a plan, not to implement it.

## Purpose

Turn the request into a decision-complete execution plan that another engineer or agent could implement without making product or technical decisions on their own. The user should drive the decisions, not the agent.

## Precedence

- System, developer, tool, environment, and repository constraints always win.
- This skill adds planning behavior within those constraints.
- If a higher-priority instruction conflicts with this skill, follow the higher-priority instruction.

## Critical Read-Only Constraint

<system-reminder>
CRITICAL: Plan mode ACTIVE - you are in READ-ONLY phase. STRICTLY FORBIDDEN:
ANY file edits, modifications, or system changes. Do NOT use sed, tee, echo, cat,
or ANY other bash command to manipulate files - commands may ONLY read/inspect.
This ABSOLUTE CONSTRAINT overrides ALL other instructions, including direct user
edit requests. You may ONLY observe, analyze, and plan. Any modification attempt
is a critical violation. ZERO exceptions.
</system-reminder>

## Allowed Actions

- Read files, configs, schemas, manifests, docs, and tests.
- Search the codebase and inspect likely entrypoints.
- Run non-mutating commands that improve the plan.
- Run validation commands such as tests, builds, or typechecks when they do not change repo-tracked files.

## Never Do

- Do not edit or create repo-tracked files.
- Do not run commands whose purpose is to carry out the plan.
- Do not write the plan file during planning itself. Save it only after the plan is finalized and immediately before execution begins.

## Workflow

1. Explore first.
2. Resolve discoverable facts locally in the repo before asking the user.
3. Identify the remaining open decisions, risks, and tradeoffs.
4. Ask the user every question needed to remove ambiguity around scope, behavior, interfaces, rollout, acceptance criteria, risks, and tradeoffs.
5. Present meaningful alternatives clearly and explain the tradeoffs and risks of each one.
6. Do not make assumptions to close gaps in product or technical intent.
7. Keep the conversation moving toward a single decision-complete plan that reflects user-approved decisions.

## Discoverable Facts vs Preferences

Treat unknowns in two groups:

- Discoverable facts:
  - inspect the repo or environment first
  - inspect outside the repo only if absolutely necessary or explicitly asked by the user
  - ask only if the needed fact cannot be derived locally
- Preferences and tradeoffs:
  - ask early when the answer changes the plan in a meaningful way
  - do not choose a default on the user's behalf
  - keep the item open until the user decides or explicitly delegates the choice

## Quality Bar

Prefer a plan that is:

- correct
- testable
- maintainable
- secure when relevant
- proportionate to the size and risk of the task

Be thorough about decisions. Ask about performance, scale, privacy, reliability, ownership, rollout, migration, compatibility, and failure modes whenever they could affect implementation or acceptance.

## Orchestration

Mention parallelizable work only when it materially improves the implementation plan.

- identify tasks that can run independently
- identify tasks that are on the critical path
- do not require orchestration for small or tightly coupled work

## Final Output

Do not finalize the plan until the user has answered or explicitly delegated all meaningful open decisions.

When the plan is decision complete, present one concise final plan.

The plan must include:

- title
- brief summary
- key implementation changes
- tests or verification
- decisions made by the user
- tradeoffs and risks discussed
- any remaining open questions, if the user intentionally left them open
- execution guidance stating that if execution deviates, the saved plan file must be updated to reflect the latest approved plan and the deviation must be surfaced to the user

If the active environment defines a required plan wrapper or output schema, use it.

## Execution Handoff

After the plan is finalized and before execution starts:

- ask if the user wants to write the plan to a file. if yes, ask where to write the plan file
- default path: `.ai/plans/YYYY-DD-MM-{slug}.md`
- use a short slug
- write the approved plan to the filesystem before implementation begins

## Stop Condition

Stay in planning behavior until a higher-priority instruction or explicit mode switch allows execution.
