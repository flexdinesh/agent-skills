# Evaluating repo-patterns

Maintainer material. Do not load this directory during ordinary repository work.

The reorganisation baseline is commit `82f7040`. [evals.json](evals.json) contains
nine self-contained prompts for reference selection, design decisions, and restraint.
[scenarios.md](scenarios.md) preserves all 80 reorganisation-baseline behavior
scenarios and adds Docker cases for expansion into repository fixtures.

## Compare versions

1. Materialize the baseline and candidate skill directories in separate locations.
   Give each run the same prompt and only its assigned skill version.
2. Use fresh contexts with the same model, settings, tool access, and budget.
   Keep the working directory free of unrelated repositories and skill copies.
   An optional no-skill baseline measures whether either version adds value.
3. Run the nine cases without exposing expected outputs/assertions to the tested
   agent. Both versions use their own paths; assess selected concerns rather than
   requiring the candidate's filenames from the baseline.
4. Save the output, reference-read trace, check claims, token counts, and duration.
   Grade against assertions with concrete evidence; use blind review for judgment.
5. Repeat cases to distinguish consistent effects from one run's variation.
   Compare supported decisions, false positives, scope expansion, missed guidance,
   and reference-loading cost. Keep tradeoffs visible per case.
6. For implementation claims, add executable small repositories from the scenario
   catalog and verify resulting behavior with independent assertions. Do not grade
   by file count, layers, abstractions, or raw coverage.

The nine prompts deliberately request proposals/audits from supplied snapshots.
They can test reasoning and routing without live services, but cannot establish
runtime correctness, successful installation, or real repository audit coverage.
Their `files` lists are empty because the snapshot is embedded in each prompt.

## Review routing

Inspect whether the agent loads:
- Applicable language/runtime and task references before deciding.
- Additional references only when affected contracts justify them.
- All relevant categories in batches for a full audit.
- No maintenance evaluation material as part of ordinary skill execution.

Read-only proposals must remain read-only. Preserve explicit invocation, existing
tooling and naming conventions, TypeScript safety, independent-run obligations,
manual stable CI, and Go development-channel policies.
Docker cases also check final-image behavior, build-secret leakage, Compose state
ownership, and restraint for supported bases/platforms and image publication policy.

## Status

Prompts and expected results are evaluation inputs, not completed benchmark results.
Structural checks can establish valid links, unique rule ownership, catalog coverage,
and scenario preservation. Only actual comparative runs establish agent effectiveness.

## Sources

- [Agent Skills evaluation guidance](https://agentskills.io/skill-creation/evaluating-skills)
- [Anthropic skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)
