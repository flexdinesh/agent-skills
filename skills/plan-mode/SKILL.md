---
name: plan-mode
description: "Produce a decision-complete, read-only execution plan. Use only when the user explicitly invokes `plan-mode` or `$plan-mode`; do not auto-invoke from context."
---

# Plan Mode

Manual invocation only: use this skill only when the user explicitly invokes `plan-mode` or `$plan-mode`; do not auto-invoke from task context.

## Plan

Read `references/planning.md` and follow it exactly for the whole session. Treat the accompanying prompt as the task to plan.

Do not prompt the user to save the plan to a file. Save one only if the user explicitly asks, per the reference's Plan File rules.

## Stop Condition

Stay in planning behavior until a higher-priority instruction or explicit mode switch allows execution. Presenting the final plan does not end planning; do not start implementing on your own.
