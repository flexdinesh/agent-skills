---
name: visual-learning
description: "Teach a technical concept through a context-first, progressively example-driven lesson, then choose the visual form that best supports it. Use systems, boundaries, state, and message flow when they clarify the concept, not as a mandatory output schema. Use only when the user explicitly invokes `visual-learning` or `$visual-learning`; do not auto-invoke from context."
---

# Visual Learning

Manual invocation only: use this skill only when the user explicitly invokes
`visual-learning` or `$visual-learning`; do not auto-invoke it from task context.

## Intent

Help the learner build a mental model they can use to explain, predict, and reason about
a technical concept.

Treat this skill as a set of teaching heuristics and examples, not a rigid lesson
format. Adapt the structure, depth, visuals, and interaction to the concept and the
learner. Do not include a section, control, diagram element, or model field merely
because it appears in this skill or its references.

## Teaching priority

When guidance in this skill competes, use this order:

1. **Orient the learner to the topic.** Establish what it is, how it can be used, why it
   helps, and the important contextual subtopics needed to understand it well. Give the
   learner a useful map of the territory, not an exhaustive taxonomy.
2. **Teach through progressively developed examples.** Begin with the smallest concrete
   example that makes the core idea observable. Iterate on that example—or add a closely
   related one—one meaningful change at a time so each step motivates the next concept,
   rule, edge case, or tradeoff. Let the learner see what happens before extracting the
   abstraction.
3. **Apply the visual preferences in this skill.** Once the topic map and example
   progression are clear, choose the visual grammar, interaction, systems lens, and
   level of polish that best support them.

The first two priorities may override any visualization prescription, template, or
pattern in this skill and its references. A simple sequence of worked examples is
preferable to a richer visual artifact when it teaches the topic more clearly.

## What is flexible

Choose the representation that makes the concept easiest to understand. Depending on
the topic, that might be:

- an animated request or event flow
- a timeline of state changes
- annotated code that changes one line at a time
- a before-and-after comparison
- a memory, ownership, or dependency map
- a small simulation with a few meaningful controls
- a layered diagram
- a worked example with lightweight visuals
- prose or ASCII when a browser artifact would add ceremony without insight

The common systems lens—boundaries, ownership, actors, state, messages,
transformations, failures, and tradeoffs—is a useful menu. Select the parts that explain
the topic. Reorder or omit the rest.

For example:

- OAuth benefits from actors, trust boundaries, messages, artifacts, and validation.
- A closure may be clearer as annotated code plus a changing environment diagram; it
  does not need trust boundaries or a protocol inspector.
- Eventual consistency may need two replicas, a timeline, and a failure toggle; it does
  not necessarily need an ownership section or glossary.
- Type inference may work best as a series of expressions with inferred types revealed
  on demand; a system canvas would be artificial.

Use interaction and visual detail sparingly. Every device should answer a learner
question or make a change, relationship, or consequence easier to see.

## What is not flexible

- Follow an explicit user request for format, scope, path, audience, or depth.
- Keep technical claims accurate. Research authoritative primary sources for current,
  standards-based, repository-specific, or security-sensitive material.
- Distinguish verified behavior, common convention, simplification, and inference.
- Never invent protocol fields, guarantees, security properties, or implementation
  details.
- Never expose secrets, personal data, credentials, private URLs, or live tokens.
- If producing an interactive lesson, make its core teaching usable with a keyboard,
  visible focus, reduced motion, sufficient contrast, and more than colour alone.

These are quality and safety constraints. The teaching priority governs lesson
sequencing; the suggested visual patterns are flexible.

## Resources

Read [references/lesson-design.md](references/lesson-design.md) for a pattern library,
worked examples, research guidance, and quality prompts. Use only the patterns relevant
to the lesson. The teaching priority above governs when the reference suggests a
different starting point or sequence.

[assets/lesson-template.html](assets/lesson-template.html) is an optional starting point
for lessons whose main idea is an ordered flow across actors and boundaries. Read it in
full only if using it. Copy it to the destination before adapting it; do not modify the
source asset. Its JSON shape is the template's rendering API, not the required shape of
every visual lesson.

You may build a different standalone HTML structure when another visual grammar fits the
topic better.

## Output

Honor a user-provided output path or requested medium.

When the user does not specify either, create the smallest useful self-contained lesson.
A standalone HTML file at `.scratch/visual-learning/<topic-slug>.html` is a good default
when interaction, animation, or synchronized views improve understanding. A focused
static visual, ASCII walkthrough, or conversational explanation is also valid when it
teaches the concept more directly.

For a default slug, use lowercase ASCII and replace runs of non-alphanumeric characters
with `-`. Avoid creating a package, build configuration, or dependency tree unless the
chosen lesson genuinely needs one. Prefer an artifact that opens directly in a modern
browser without external runtime dependencies.

Do not automatically open a browser unless the user asks.

## A lightweight way to work

Follow the teaching priority above. Within that order, use the following as prompts, not
gates.

### Orient the learner

Briefly establish what the topic is, where it is used, why it is useful, and which
surrounding ideas the learner needs. Turn those contextual subtopics into a small
learning path: prerequisites first, the core mechanism next, and important consequences
or tradeoffs after they become meaningful.

State what the learner will be able to explain or predict after the lesson. Infer a
sensible audience and depth from the conversation rather than interviewing by default.

Ask one targeted question only when ambiguity would materially change the lesson.

### Design the example progression

Choose the smallest concrete scenario that exposes the key mechanism. Then plan a short
series of iterations that each change one meaningful thing and introduce only the
contextual subtopic needed to explain that change.

Prefer extending a stable example so the learner can compare each step. Add a
contrasting example when contrast reveals an important rule, edge case, or tradeoff
more clearly. Do not make the example artificially visual; annotated code, concrete
values, a worked calculation, prose, or ASCII may be the best teaching form.

### Build the mental model

Work out what actually changes in the example and why. Identify only the participants,
state, boundaries, messages, transformations, constraints, and failures needed to
explain that change.

Start from the concept, not from the supplied HTML template or a predetermined page
layout.

### Pick a visual grammar

Match the representation to the mechanism:

- sequence or causality → steps, timeline, or message flow
- ownership or containment → nested regions, memory map, or annotated objects
- transformation → before/after values or staged code
- alternatives → stable side-by-side comparison
- feedback or emergence → a small simulation
- failure → perturb the happy-path example and show the consequence

Combine views only when their synchronization adds insight. A lesson with one excellent
visual and one worked example is better than a tour of every available widget.

### Teach through progression

Let the example unfold in meaningful increments. At each increment, explain the
important change, the reason for it, and how it connects to the topic map. Keep earlier
parts stable where possible so the learner can see exactly what the new concept changes.

Use questions, predictions, or small experiments where they create useful friction.
Do not force a quiz, inspector, variant, failure mode, or tradeoff section when it would
be filler.

### Validate proportionately

Inspect the result in a browser when browser tools are available and an HTML artifact
was created. Test the interactions and responsive layout that actually exist. Check that
the example remains coherent, labels are legible, and text and visuals agree.

Apply the relevant quality prompts from the design reference. Do not treat its full list
as a mandatory completion checklist.

## Teaching preferences

- Prefer showing over announcing: demonstrate the mechanism, then name it.
- Change one meaningful thing at a time.
- Keep stable visual anchors when the learner needs to compare steps or variants.
- Show concrete values, payload shapes, code, or state snapshots when they make an
  abstraction tangible; keep them short and clearly illustrative.
- Put an explanation near the example detail that motivates it.
- Surface a failure or tradeoff at the moment it becomes understandable.
- Label simplifications when they could otherwise be mistaken for reality.
- Explain acronyms on first use and keep terminology consistent.
- End with a compact restatement or reconstruction of the core idea.

These preferences may be bent when the learner, topic, or requested medium calls for a
different approach.

## Avoid

- forcing every topic into a distributed-systems actor-and-arrow diagram
- reproducing the reference sequence as page sections by default
- filling optional schema fields or panels with low-value content
- adding animation, controls, or visual richness for decoration
- giant all-paths diagrams
- unexplained arrows, unstable layouts, or colour-only categories
- hiding essential teaching behind hover-only interactions
- presenting one common implementation as the only valid design
- exhaustive edge cases before the primary example is understood
