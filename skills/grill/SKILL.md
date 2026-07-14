---
name: grill
description: "A relentless interview to sharpen a plan or design, maintain the domain language, and chart large efforts until their route is clear. Use only when the user explicitly invokes `grill` or `$grill`; do not auto-invoke from context."
disable-model-invocation: true
---

# Grill

Use this skill to turn an unclear plan or design into a shared understanding. Interview the user relentlessly about every aspect until the important decisions, terminology, scenarios, and route through the work are clear.

Do not enact the plan until the user confirms that you have reached a shared understanding.

## Interview

Ask questions one at a time. For each question, provide your recommended answer. If a fact can be found by exploring the codebase, look it up rather than asking. Decisions belong to the user: put each one to them and wait for feedback before continuing.

Walk down each branch of the design tree, resolving dependencies between decisions one by one. Challenge vague or overloaded terms with a precise canonical term, and call out conflicts with the project's existing language immediately.

Stress-test relationships and boundaries with concrete scenarios, especially edge cases. When the user states how something works, check whether the code agrees and surface contradictions.

## Domain language

Read the relevant domain context before exploring:

- `.scratch/CONTEXT.md`, or
- `.scratch/CONTEXT-MAP.md` and the relevant context files if it exists.

Read relevant ADRs from `.scratch/adr/` before discussing the area they cover. If these files do not exist, proceed silently.

When a term is resolved, update the relevant context file immediately. Create files lazily: create `.scratch/CONTEXT.md` only when the first term is resolved. Keep context files free of implementation details; they are glossaries, not specs or scratch pads.

### Context format

Use [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md). Be opinionated when multiple words mean the same thing, keep definitions to one or two sentences, include only terms specific to the project, and group terms under subheadings when natural clusters emerge.

For multiple contexts, use `.scratch/CONTEXT-MAP.md` to locate the relevant context. If the topic is unclear, ask which context applies.

## ADRs

An Architecture Decision Record captures one durable architectural decision from the session, not a changelog or transcript. Use the standard sections `Status`, `Context`, `Decision`, and `Consequences`. Add `Options Considered`, `Risks`, `Tradeoffs`, `Assumptions`, or `Gotchas` only when useful.

Offer an ADR only when all three are true:

1. The decision is hard to reverse.
2. It would be surprising without context.
3. It resulted from a real trade-off.

If any condition is missing, skip the ADR. Create `.scratch/adr/` lazily and use sequential filenames such as `0001-slug.md`, after scanning for the highest existing number.

Before creating one, confirm the destination with the user. Extract the single decision future agents need, propose `.scratch/adr/YYYY-MM-DD-<slug>.md`, and after confirmation write the markdown with YAML frontmatter. Do not invent decisions, turn the ADR into a command history, or include empty optional sections.

Use [ADR.md](./ADR.md) for the ADR format.

Update `AGENTS.md` only if the user explicitly wants durable project rules captured there.

Add `Status`, `Considered Options`, or `Consequences` only when they add genuine value.

## Wayfinding large efforts

When the work is too large for one session, use this skill to chart the route rather than execute the destination. The destination may be a spec, decision, or change. The map is complete when nothing remains to decide before implementation can begin.

Never resolve more than one wayfinding ticket per session.

### Map

Store the canonical map at `.scratch/<effort>/map.md`:

Use [MAP.md](./MAP.md) for the map format.

The map is an index, not a store. Decisions live in exactly one ticket; the map only gists and links them. Refer to maps and tickets by title in narration and decisions, never by a bare number or slug.

Each child ticket lives under `.scratch/<effort>/issues/NN-<slug>.md` and contains its question, `Type:`, `Status:`, and `Blocked by:` lines. Types are `research`, `prototype`, `grilling`, and `task`. A ticket is either HITL, requiring the user's live participation, or AFK, driven by the agent alone.

Blocking is recorded as `Blocked by: NN, NN`. A ticket is on the frontier when it is open, unclaimed, and every listed blocker has `Status: resolved`. Claim it by setting `Status: claimed` before doing any work. Resolve it by appending an `## Answer`, setting `Status: resolved`, and adding a context pointer to the map's Decisions so far.

Research reads external or local resources and records a linked summary. A prototype is a cheap, concrete artifact used to answer a design question. Grilling is the normal human-in-the-loop decision conversation. A task is manual work that unblocks a decision, not destination delivery.

### Charting mode

1. Name the destination through an interview and domain-language session.
2. Map the frontier breadth-first, surfacing open decisions and the first takeable steps.
3. If no fog remains and the journey fits one session, stop and ask how the user wants to proceed instead of creating a map.
4. Create the map with the destination, notes, empty decisions, fog, and out-of-scope boundaries.
5. Create currently specifiable tickets, then wire their blocking edges in a second pass.
6. Stop; do not resolve tickets in the charting session.

### Work-through mode

1. Load the map at low resolution.
2. Use the user's named ticket, or choose the first frontier ticket, and claim it.
3. Resolve it, zooming into related tickets and artifacts as needed.
4. Record and close the resolution, update the map, and add any newly specifiable tickets.
5. Move newly out-of-scope work to the map's Out of scope section rather than resolving it.

## Session finish

Capture decisions as soon as they crystallise. Keep the final result focused on the shared understanding, resolved vocabulary, scenarios, decisions, and any remaining explicitly identified fog.
