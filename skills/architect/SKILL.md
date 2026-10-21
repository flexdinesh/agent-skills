---
name: architect
description: "Sketch types, signatures, and module structure before code, using parallel independent design candidates, then implement against the chosen sketch and scrap it when it proves wrong. Use for 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape. Use only when the user explicitly invokes `architect` or `$architect`; do not auto-invoke from context."
---

# Architect

Manual invocation only: use this skill only when the user explicitly invokes `architect` or `$architect`; do not auto-invoke from task context.

Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Synthesize across multiple independent candidates, then fill in code against the chosen sketch.

## Start

Track one entry per phase before starting, in a todo list if your environment has one.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Subagents

Phase A explorers, Phase B runners, and the Phase B judge each run best as their own subagent with a fresh context. Start parallel work at once. If you can choose a model per subagent, put runners on different model families, and use your strongest judgment model for the judge, preferring a family different from your own. If you can't choose models, use fresh-context subagents on the same model and say so in the synthesis note. If your environment can't spawn subagents, play each role yourself in sequence, and finish and record each candidate before starting the next so later candidates don't anchor on earlier ones.

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Naming a file isn't grounding.

For each relevant subsystem, produce an architectural explanation a senior engineer new to the area could work from:

- **Overview.** What it is and what it does.
- **Key concepts.** The types, services, and abstractions needed to follow the rest.
- **How it works.** The flow from trigger to result, naming files and functions, with the data that moves between steps and the decision points.
- **Boundaries.** Where it connects to the rest of the codebase. Its inputs and outputs.
- **Gotchas.** Non-obvious behavior and open questions you couldn't trace.

For a subsystem that spans several files or services, split it into 2 to 4 angles, explore each in parallel (read-only), then merge the findings and resolve contradictions by reading the code.

If the design redefines ownership or layering, also establish why the existing shape is the way it is, so the rationale becomes a constraint, not a guess. Read the history (`git log --follow`, `git blame`, `git log -S`), the PR bodies and review threads behind substantive commits (`gh pr view`), linked tickets, and any design docs. Tag each claim by confidence: direct (an author wrote the reason down, cite it), supported (several indirect items converge, cite each), inferred (your reading, hedged), or unknown (say what you searched). Never treat code as evidence for its own intent.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

## Phase B: Sketch

Run parallel independent candidates, judge them against a rubric, pick a base, and graft the best parts of the others into it.

### B1. Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate produces: a design package per `references/runner-prompt.md`.
2. Derive the rubric: 3 to 6 concrete, gradeable criteria for success on *this* design. It is the picker's tool. Candidates see only the task.
3. Pick the runners. At least two, on different model families when you can choose. Add runners when the design space has more than two plausible directions.
4. Give each candidate its own output location: a git worktree where possible, otherwise a per-candidate subdirectory under a scratch directory. Candidates must not share a write target.

### B2. Fan out

Start all runners at once. Each gets `references/runner-prompt.md`, the task, the Phase A grounding, the contents of `references/design-red-flags.md` and `references/rationale-template.md`, and its own output path.

Design it twice. Require at least two structurally distinct candidates before synthesis, even when the first looks sufficient. Whole-shape alternatives, not point fixes inside one shape. If a candidate produces no output, proceed with the rest and note the dropout. If fewer than two distinct shapes remain, run another candidate.

### B3. Cross-judge

After every candidate completes, start one read-only judge. It sees the rubric and the candidates by path label, scores each criterion, and recommends a base with rationale. It runs in parallel with your own reading. Don't start it while candidates are still writing.

### B4. Pick a base

Read every candidate end to end before picking. Screen each against `references/design-red-flags.md`. Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.

Score each candidate against the rubric criterion by criterion, not on holistic feel, and compare with the judge. Agreement confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous. Read both rationales before deciding.

Compare viable candidates on interface depth. Prefer the design that hides more complexity behind a smaller, simpler public interface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers. Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API.

### B5. Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, redesigning the base as if that idea had been there from the start, so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. If they wildly diverge, the frame was under-specified. Reframe and re-run rather than averaging the divergence.

### B6. Check

Check the synthesized sketch against the real code it must integrate with: the types it interoperates with, the callers it can't break, and the invariants Phase A surfaced. Typecheck the sketch if the language allows. If the check finds a problem, either the frame was wrong (reframe and re-run) or a candidate caught it and you missed the graft (go back to B5). Don't paper over it.

Record the synthesis decision in the rationale's "Synthesis decision" section: the base and why, the judge's verdict, each graft with its source candidate, what was rejected and why, any convergence or dropouts.

## Phase C: Agree (opt-in)

Default: proceed directly to implementation with the synthesized design. No human checkpoint.

Opt in to a checkpoint when the invoker explicitly asks: "architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design and pause for sign-off.

The sketch can ship as its own commit either way. Landing the shared types and module boundaries first gives every later step something to build against. Planned, scoped breakage while filling in the sketch is fine. Converge on the target design rather than writing throwaway compatibility code to keep every intermediate step working, and run full static and runtime checks at the end.

For adversarial pressure on the design before implementing, have at least two independent reviewers (different model families when available) attack the sketch for correctness gaps, leaked internals, split ownership, and missed simplifications. Judge their findings yourself before acting on any.

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and re-run Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The synthesized sketch is the contract. Deviations from it are signal to surface, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, and don't patch symptoms where the fault is in the shape.

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape across the implementation.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex. Complexity in the data is not complexity in the design.

When you scrap:

1. Re-run Phase A over what's been built.
2. Redesign as if the new constraints had been day-one assumptions. Ask "if we were writing this from scratch with what we know now, what would we build?"
3. Subtract before adding. Remove dead code, redundant checks, and abandoned paths first. The new sketch should be smaller than the old one before it grows.
4. Return to Phase B.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes. Module map plus type definitions for larger work. The rationale ships alongside, shaped per `references/rationale-template.md`, including the usage sketch and the synthesis decision.
