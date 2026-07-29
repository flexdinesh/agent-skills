---
name: visual-learning
description: "Teach a technical concept as a progressive, interactive visual lesson built around systems, boundaries, ownership, state, and message flow. Use only when the user explicitly invokes `visual-learning` or `$visual-learning`; do not auto-invoke from context."
---

# Visual Learning

Manual invocation only: use this skill only when the user explicitly invokes
`visual-learning` or `$visual-learning`; do not auto-invoke it from task context.

## Purpose

Transform a technical concept into a self-contained browser lesson that helps the
learner construct a mental model. Teach in this order:

> boundaries → ownership → actors → state → messages → transformations → failures →
> tradeoffs

The output is not merely a diagram or an illustrated article. It is a guided,
interactive explanation in which the system view, current step, visible data, and
teaching text stay synchronized.

Optimise for these learner questions:

1. What problem does this solve?
2. Who participates, and what does each participant own?
3. Where are the system, trust, and security boundaries?
4. Where does the interaction begin?
5. What happens next?
6. What data or state exists before and after each step?
7. Who creates, holds, sends, changes, and validates each artifact?
8. What assumptions does the design rely on?
9. What variants are common, and why would someone choose one?
10. What breaks when an assumption fails?

## Required resources

Before creating a lesson, read:

- [references/lesson-design.md](references/lesson-design.md) in full for the learning
  sequence, visual grammar, lesson model, research rules, and quality bar.
- [assets/lesson-template.html](assets/lesson-template.html) in full. Treat it as an
  immutable source template.

## Default output

Create one standalone HTML lesson at
`.scratch/visual-learning/<topic-slug>.html`, unless the user provides another output
path. A user-provided path takes precedence.

Use lowercase ASCII for the default slug, replacing runs of non-alphanumeric characters
with `-`. Do not create a project, package manifest, build configuration, or dependency
tree. The lesson must work by opening the HTML file directly in a modern browser.

If the user explicitly requests ASCII or a prose explanation instead, provide that
format without creating HTML. Keep the same learning sequence and visual semantics as
far as the requested medium permits.

## Workflow

### 1. Frame the lesson

Resolve the topic, the learner's goal, and the desired depth from the request and
conversation. Infer sensible defaults rather than interviewing the learner:

- start conceptual, then reveal protocol or implementation detail
- use a common concrete scenario
- teach one primary happy path before alternatives
- include security, failure modes, and tradeoffs when they materially shape the concept

Ask one targeted question only when the topic is genuinely ambiguous or when choosing
the wrong scenario would substantially change the lesson.

Write a one-sentence learning objective. Define the lesson scope and explicitly name
important material that is out of scope.

### 2. Build the mental model before the page

Identify:

- the problem and the key idea that solves it
- human and machine actors
- system, ownership, trust, network, and security boundaries
- durable state, transient state, and exchanged artifacts
- the starting event and primary sequence
- transformations and validation decisions
- common variants
- meaningful failures and recovery paths
- decisions whose alternatives have real benefits and costs

Do not start from page layout or decorative styling. First make the system coherent.

### 3. Research and calibrate certainty

For standards, protocols, security-sensitive topics, or current product behaviour,
research authoritative primary sources. Prefer specifications, official documentation,
and original papers. For repository-specific lessons, inspect the real implementation
and configuration.

Separate:

- required behaviour from common convention
- conceptual simplification from protocol detail
- standard-defined roles from product-specific names
- verified claims from inference

Never invent request fields, token contents, guarantees, deployment topologies, or
security properties. Include source links inside the lesson. Do not embed third-party
scripts, fonts, images, analytics, or other runtime dependencies.

### 4. Design progressive disclosure

Structure the lesson in layers:

1. **Orient** — problem, objective, smallest useful map, and obvious starting point
2. **Follow** — one step at a time through the primary flow
3. **Inspect** — requests, responses, artifacts, and state changes
4. **Own** — responsibilities, visibility, validation, and trust
5. **Compare** — common variants under different constraints
6. **Stress** — failures, attacks, expiry, retries, or invalid assumptions
7. **Decide** — tradeoffs connected to the step or constraint that creates them
8. **Recall** — questions that require prediction or reconstruction

Do not reveal every arrow, warning, token, and variant at once. The first view must remain
understandable without opening any detail panel.

### 5. Build the lesson model

Create one lesson model using the schema and vocabulary in
[references/lesson-design.md](references/lesson-design.md).

Every flow step must state:

- what happens
- why it happens
- who is responsible
- what crosses a boundary
- what state or artifact changes
- what can fail at that moment, when material

Every tradeoff must connect a constraint or assumption to benefits, costs, and a choice
context. Avoid generic “pros and cons” lists.

### 6. Render the HTML

Copy the entire lesson template to the destination without modifying the source asset.
Replace the single `{{LESSON_DATA}}` marker with the lesson model.

Before embedding JSON, escape `<`, `>`, `&`, U+2028, and U+2029 as Unicode escapes so
lesson content cannot terminate the data script. Keep the result standalone.

The template provides the instructional shell and interaction mechanics. Adapt lesson
content to the template; do not replace it with a generic dashboard, slide deck, blog
post, Mermaid diagram, or static SVG.

Do not automatically open a browser unless the user asks.

### 7. Validate the learning experience

Inspect the rendered lesson in a browser when browser tools are available. Verify:

- the starting point is obvious
- the initial system map is small enough to parse
- previous, next, play, restart, scenario, layer, and inspector controls work
- keyboard focus is visible and controls have meaningful labels
- the lesson remains usable at narrow and wide viewport sizes
- the workspace uses the available viewport width and height instead of sitting inside
  a conventional centered page-width wrapper
- reduced-motion preferences are respected
- colour is never the only carrier of meaning
- actor, boundary, artifact, and flow labels do not overlap or clip
- every step keeps the system highlight, explanation, payload, and state synchronized
- variants preserve a stable reference model so differences are perceptible
- tradeoffs identify their triggering constraint or assumption
- checkpoints require recall rather than copying adjacent text
- conceptual simplifications, unknowns, and sources are visible
- there are no external runtime requests or exposed secrets

Correct problems before reporting completion.

## Teaching rules

- Lead with a concrete scenario, then name the abstraction.
- Keep one stable spatial layout while steps advance; movement should represent meaning,
  not compensate for an unstable diagram.
- Use animation to show change or direction, never as decoration.
- Prefer one strong primary flow plus a few materially different variants.
- Show state before and after important steps.
- Show an artifact's lifecycle: creator, holder, visibility, validation, and lifetime.
- Place failure and tradeoff explanations where their cause appears in the flow.
- Label simplifications explicitly.
- Explain acronyms on first use and use protocol terminology consistently.
- Map generic roles to familiar products only after teaching the generic model.
- End with a compact reconstruction of the mental model.

## Guardrails

- Do not equate visual richness with learning quality.
- Do not produce a giant all-paths architecture diagram.
- Do not make ordinary internal function calls into system actors.
- Do not use unexplained arrows or colour-only categories.
- Do not hide essential teaching content behind hover interactions.
- Do not use drag-and-drop as the main interaction; navigation and comparison matter
  more than rearrangement.
- Do not constrain the lesson to a conventional article or dashboard max width; let the
  system canvas expand with the viewport.
- Do not present one popular implementation as the only valid architecture.
- Do not flatten properties, consequences, costs, and decisions into one undifferentiated
  tradeoff list.
- Never expose secrets, personal data, credentials, private URLs, or live tokens.
