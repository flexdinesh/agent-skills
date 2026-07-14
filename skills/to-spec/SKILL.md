---
name: to-spec
description: "Turn the current conversation into a spec and save it under .scratch/specs/ — no interview, just synthesis of what you've already discussed. Use only when the user explicitly invokes `to-spec` or `$to-spec`; do not auto-invoke from context."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user — just synthesize what you already know.

Save the completed spec under `.scratch/specs/<feature-slug>.md`, creating the directory if needed. There is no external issue tracker or triage setup.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Write the spec using [SPEC.md](./SPEC.md) and save it under `.scratch/specs/<feature-slug>.md`.
