# Agent instructions

## Skill independence

Each skill under `skills/` must be fully self-contained.

- Never reference another skill from a skill: no skill names, `$skill` invocations, or paths into another skill's directory.
- Shared process lives in a reference file copied into every skill that needs it.
- All skills are manual-invocation only; `gh-create-pr` is the sole exception (also auto-invokes for PR work). New skills must state manual-only invocation in both `description` and body.

## Duplicate references

Files in each group are exact, byte-identical copies. When changing any file in a group, apply the same change to every file in that group in the same commit.

| Group | Copies |
| --- | --- |
| Planning process | `skills/plan-mode/references/planning.md`, `skills/autopilot/references/planning.md` |
| Execution process | `skills/execute-plan/references/execution.md`, `skills/autopilot/references/execution.md` |

Keep reference text skill-agnostic: refer to "the loading `SKILL.md`", never a specific skill. Put skill-specific behavior in that skill's `SKILL.md`.

When adding a skill that combines existing processes, copy the needed reference files into it and add the new copy to the table above.

Verify before committing:

```bash
cmp skills/plan-mode/references/planning.md skills/autopilot/references/planning.md
cmp skills/execute-plan/references/execution.md skills/autopilot/references/execution.md
```
