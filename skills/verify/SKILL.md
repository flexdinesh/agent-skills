---
name: verify
description: "Prove a finished task works before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.' Use only when the user explicitly invokes `verify` or `$verify`; do not auto-invoke from context."
---

# Verify

Manual invocation only: use this skill only when the user explicitly invokes `verify` or `$verify`; do not auto-invoke from task context.

Verify every task output by checking the real thing directly. Do not infer from proxies, self-reports, or "it compiles."

**Why:** Unverified work has unknown correctness. Indirect verification (file mtimes, output freshness, agent self-reports, cached screenshots) feels cheaper than direct observation. Acting on a wrong inference costs far more than checking the source.

Check the real thing, not a proxy:

- Check process liveness directly, not indirectly through derived state.
- Read the actual value, not a cached or derived representation.
- For delegated or background work, inspect the output artifacts yourself. Do not trust a summary of them.
- When verification fails, suspect the observation method before suspecting the system.

## Script the check when you can

The strongest proof is a deterministic script that re-runs the same comparison, not a one-time eyeball. Write the script, run it, and keep its output as an artifact a reviewer can re-run instead of trusting your word.

Keep the artifact visible for the human. By default it is a working file, not committed. Commit the script and its output only for large or complex work where the trail has to be auditable later, like a big port or migration.

## Report

State what you checked, how you checked it, and what you observed. Label each claim as observed, inferred, or a guess. Never hand the human a check you could have run yourself.
