# Visual lesson design patterns

This reference is a pattern library, not a specification. Its purpose is to help choose
a useful teaching shape for a concept. A lesson does not become better by using more of
these patterns, following them in order, or reproducing their headings.

Start with a concrete example. Select the few patterns that make its mechanism visible.
Omit anything that does not contribute to the learner's mental model.

## Start from learner moves

A useful lesson helps the learner do one or more of these:

- point to where an interaction starts
- predict what happens next
- explain why a step or rule exists
- track a value or state change
- identify who owns a responsibility
- distinguish two easily confused cases
- change an assumption and predict the consequence
- recover the essential model without the visual

These are prompts for choosing content, not required sections.

## Let examples lead

Prefer the rhythm:

> concrete situation → observable change → explanation → reusable idea

For example, to teach a cache:

1. Ask for `/profile` with an empty cache and show the database read.
2. Ask for it again and show the cache hit.
3. Change the profile in the database and ask what the cache returns.
4. Name freshness, invalidation, and expiry only after the learner has seen the tension.

The example creates a reason for each abstraction. It is stronger than beginning with a
taxonomy of cache strategies.

A contrasting second example is useful when one changed condition exposes the rule:

- a public OAuth client versus a server that can hold a secret
- a closure that captures a variable versus a function that does not
- a synchronous request versus a queued job
- a type that narrows successfully versus one that remains ambiguous

Do not add variants merely to make the lesson feel complete.

## Choose the visual grammar from the mechanism

### Ordered interaction

Use a stepper, sequence, or timeline when order and causality are the point. Keep the
important participants spatially stable while messages or state advance.

Good fits include authentication flows, rendering pipelines, transactions, build
stages, and event processing.

A useful step might show:

- what just happened
- the concrete message, expression, or action
- the state that changed
- why the change matters

It does not need all four when some are irrelevant.

### Transformation

Use before-and-after values, staged code, or an input/output pipeline when the learner
needs to see how one representation becomes another.

Good fits include parsing, compilation, type inference, data normalization, image
processing, and cryptographic operations.

Keep intermediate forms small enough to compare. Highlight only the changed portion.

### Ownership and containment

Use nested regions, object graphs, memory maps, or responsibility annotations when
location and control explain behavior.

Good fits include memory management, closures, process isolation, tenancy, permissions,
and module boundaries.

“Ownership” may mean storage, control, lifetime, mutation rights, or operational
responsibility. Say which meaning matters in the example.

### State over time

Use snapshots or a timeline when the same entities persist while their state changes.

Good fits include state machines, consensus, retries, UI transitions, database
transactions, and distributed replicas.

Showing two or three well-chosen snapshots is often clearer than animating everything.

### Comparison

Use a stable side-by-side or switchable view when a changed constraint alters the
outcome. Preserve the reference points so the difference is easy to perceive.

Name:

- the condition that changed
- the consequence visible in the example
- when that difference affects a decision

Avoid generic pros-and-cons cards detached from a scenario.

### Feedback and emergence

Use a small simulation when behavior emerges through repetition or feedback and cannot
be understood well from a single static state.

Good fits include backpressure, rate limiting, scheduling, load balancing, congestion,
and eventual consistency.

Offer only a few controls with legible consequences. Defaults should demonstrate the
core behavior without setup.

### Failure as perturbation

Once the happy path is understood, alter one assumption:

- drop or delay a message
- expire a value
- duplicate an event
- revoke a permission
- introduce conflicting state
- make an input invalid

Show where the problem becomes observable and what recovery changes. One instructive
failure is better than an exhaustive catalogue.

## Progressive disclosure

Progressive disclosure means controlling cognitive load, not implementing a prescribed
set of tabs.

A small lesson might simply:

1. show an example
2. change one detail
3. explain the rule the change reveals

A complex protocol lesson might need:

- an initial map
- controllable flow steps
- inspectable messages or artifacts
- a comparison with one materially different variant
- a failure scenario
- a reconstruction prompt

Both are valid. Let complexity earn complexity.

Keep the first view parseable. Reveal details close to the moment they become useful.
Do not hide essential information behind hover.

## Concrete teaching material

Specific examples make abstractions testable. Depending on the topic, show:

- a short request and response
- a redacted token or artifact shape
- a three-line code example
- the contents of a queue before and after delivery
- a variable environment before and after a closure is created
- an inferred type beside an expression
- two replica values at specific times

Examples should be representative, short, and clearly labelled when illustrative. Never
use real secrets or realistic secret values.

## Questions and active learning

Use a prompt when predicting is more instructive than immediately revealing:

- What value will this expression produce?
- Which component can validate this artifact?
- What state exists after this message but before the next?
- Which request reaches the database?
- What changes if this message arrives twice?

One well-placed prediction can be enough. Do not bolt a quiz section onto every lesson.
Keep answers out of immediate view when recall is the point.

## Systems patterns, when relevant

Some concepts are best understood through systems, boundaries, state, and messages. Use
the following vocabulary when it clarifies real distinctions.

### Participants

Draw something as an actor when it has a meaningful independent role, responsibility,
or behavior in the concept. Ordinary internal function calls do not automatically
become system actors.

### Boundaries

Possible boundaries include:

| Boundary | Useful when |
| --- | --- |
| system | independently meaningful components matter |
| deployment | separate processes or services change behavior |
| network | transport or partial failure matters |
| ownership | different people, teams, or organizations control each side |
| trust | one side must verify claims from the other |
| security | secrets or privileges require protection |
| data | storage location, residency, or disclosure changes |

Show only boundaries that change how the learner should reason.

### Messages and lines

When arrows are useful, give each a direction and label. Line styles can distinguish
requests, responses, events, and durable hand-offs, but include a legend or textual
meaning. The distinction should survive grayscale and colour-vision differences.

### Artifacts

An artifact can be understood through whichever lifecycle questions matter:

- Who creates it?
- Who holds or can read it?
- Who validates or changes it?
- How long does it live?
- What happens when it expires or leaks?

Do not turn these questions into empty fields when the answers do not teach the concept.

## Optional flow-lesson template

`../assets/lesson-template.html` is a ready-made renderer for a particular kind of
lesson: an ordered scenario moving across actors and boundaries, with synchronized
state, ownership, artifact, failure, variant, and tradeoff views.

Use it when most of that structure naturally fits the topic. For example, OAuth
Authorization Code + PKCE is a strong fit. Lexical scoping is probably not.

The template accepts a JSON object shaped broadly like this:

```json
{
  "version": 1,
  "topic": {
    "title": "OAuth authorization",
    "problem": "An app needs limited access without receiving the user's password.",
    "keyIdea": "The user delegates limited access through an authorization server.",
    "objective": "Predict how an authorization-code flow moves and validates artifacts.",
    "scope": "Authorization Code with PKCE",
    "modelType": "Conceptual model based on the standard"
  },
  "boundaries": [
    {
      "id": "user-space",
      "name": "User's environment",
      "type": "ownership",
      "owner": "User"
    }
  ],
  "actors": [
    {
      "id": "browser",
      "name": "Browser",
      "kind": "client",
      "boundaryId": "user-space",
      "role": "Carries the user's interactions and redirects."
    }
  ],
  "artifacts": [],
  "scenarios": [
    {
      "id": "authorization-code-pkce",
      "name": "Authorization Code + PKCE",
      "start": "The user chooses Connect.",
      "steps": [
        {
          "number": 1,
          "title": "The user starts authorization",
          "kind": "human-action",
          "from": "browser",
          "to": "client",
          "what": "The browser tells the client to connect an account.",
          "why": "Authorization begins after an explicit user action.",
          "stateBefore": ["No authorization transaction exists."],
          "stateAfter": ["The client creates an authorization transaction."]
        }
      ]
    }
  ]
}
```

This is an illustrative minimum, not a universal lesson model. The renderer tolerates
many omitted collections and fields. Add variants, failures, checkpoints, glossary,
simplifications, sources, and tradeoffs only when they improve this lesson.

If the topic needs a different structure, build a different standalone HTML page rather
than distorting the concept to fit this data model.

When embedding JSON in the supplied template, replace the single `{{LESSON_DATA}}`
marker and escape `<`, `>`, `&`, U+2028, and U+2029 as Unicode escapes.

## Research and certainty

Use sources to establish claims, not decorate a bibliography.

- Prefer standards and specifications for protocol requirements.
- Prefer official documentation for product or vendor behavior.
- Prefer repository evidence for application-specific behavior.
- Prefer original papers for research concepts.
- Label illustrative URLs, payloads, deployments, and simplifications.
- Explain when common practice differs from a base standard.
- Include only sources actually used.

Current or security-sensitive guidance should be verified when the lesson is generated.
A template is not evidence that an old recommendation remains safe.

## Visual and interaction quality

Apply the checks relevant to what was built:

- Is the starting point or first example obvious?
- Can the learner tell what changed?
- Do text, state, code, and visuals stay synchronized?
- Are stable anchors preserved where comparison matters?
- Are labels legible without overlap or clipping?
- Does motion show direction or change rather than decorate?
- Are the meaningful controls keyboard accessible and visibly focused?
- Is the lesson usable with reduced motion?
- Does meaning survive without colour?
- Does the layout work at its intended narrow and wide sizes?
- Are simplifications and uncertainty visible where material?
- Are there external runtime requests, exposed secrets, or private data?

This list is a prompt for judgment, not a requirement to implement features that make
every question applicable.

## A useful stopping rule

The lesson is ready when the primary example is coherent, the key mechanism is visible,
and the learner has a fair chance of predicting or explaining the important behavior.

Stop before additional panels, controls, edge cases, or polish begin competing with that
goal.
