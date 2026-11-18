---
name: execute-plan
description: "Execute or implement a plan. Use only when the user explicitly invokes `execute-plan` or `$execute-plan`; do not auto-invoke from context."
---

# Execute Plan

Manual invocation only: use this skill only when the user explicitly invokes `execute-plan` or `$execute-plan`; do not auto-invoke from task context.

## Execute

The plan is the finalized plan in the conversation, or the plan file or prompt the user points to. If no plan is identifiable, ask the user for it before changing anything.

Read `references/execution.md` and follow it exactly.
