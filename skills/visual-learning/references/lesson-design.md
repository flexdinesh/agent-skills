# Visual lesson design

This reference defines how to turn a technical concept into an interactive visual lesson.
The goal is not maximum information density. The goal is a durable mental model the
learner can use to explain, predict, and reason about the system.

## The teaching contract

A complete lesson answers:

| Learner question | Required representation |
| --- | --- |
| What problem is being solved? | concise orientation and concrete scenario |
| What exists? | actors, boundaries, artifacts, and persistent state |
| Who owns what? | responsibility text and ownership view |
| Where does it start? | explicit start marker and first selected step |
| What happens next? | ordered, controllable flow |
| What crosses a boundary? | directional message with a semantic line style |
| What changes? | synchronized before/after state |
| Why is this step necessary? | current-step explanation |
| What can go wrong here? | local failure attached to its causal step |
| What alternatives exist? | variants that preserve a stable reference layout |
| Which alternative should I choose? | constraint-driven tradeoff comparison |
| Did I understand it? | prediction, reconstruction, or ownership checkpoint |

If the lesson cannot answer one of these questions because it does not apply, omit it
deliberately rather than filling space.

## Learning sequence

### Orient

Begin with:

- the problem in plain language
- the key idea in one sentence
- the learning objective
- a named concrete scenario
- the smallest useful system map
- a visible “start here” cue

The learner should understand the cast and the reason for the interaction before seeing
protocol details.

### Follow

Teach the primary scenario as an ordered sequence. Select the first step initially.
Moving between steps must update the same stable canvas rather than replace it with a
different diagram.

Each step explains:

- **What:** the observable action
- **Why:** the reason it exists
- **Owner:** the participant responsible for initiating or enforcing it
- **Boundary crossing:** sender, receiver, direction, and transport when relevant
- **Change:** artifacts and state before and after
- **Risk:** a failure or broken assumption when it is useful at this point

Sequence numbers are reading order. If events are concurrent or delivery order is
uncertain, say so instead of inventing a total order.

### Inspect

Make artifacts inspectable without removing them from the system context. Useful
artifact views include:

- request method, destination, relevant headers, and body shape
- response status and relevant headers or body shape
- creator and current holder
- who can read, modify, send, or validate it
- sensitivity
- lifetime and expiry
- whether it is transient, client-held, server-held, or durable

Show representative shapes or redacted examples. Never put live secrets or realistic
secret values in a lesson.

### Own

Ownership is more precise than proximity. Explicitly distinguish:

- who operates a system
- who initiates an action
- who stores an artifact
- who is allowed to read it
- who validates it
- who makes an authorization or routing decision
- who recovers from failure

Distinguish boundary types when relevant:

| Boundary | Meaning |
| --- | --- |
| `system` | independently meaningful component or runtime |
| `deployment` | separately deployed process or service |
| `network` | communication crosses a network interface |
| `ownership` | controlled by a different person, team, or organization |
| `trust` | one side does not automatically trust claims from the other |
| `security` | secrets or privileges must not cross without protection |
| `data` | storage location, residency, or disclosure changes |

Do not draw every boundary merely because the vocabulary exists. Show the ones that
change how the learner should reason.

### Compare

A variant is useful when a changed constraint alters participants, messages,
responsibilities, state, or security assumptions. Examples include:

- browser application versus confidential server application
- synchronous call versus asynchronous delivery
- centralized session versus self-contained token
- polling versus server push
- managed service versus self-hosted system

Keep actor positions stable wherever possible. Describe what changed and visually mark
added, removed, or reassigned responsibilities.

Do not call cosmetic configuration differences variants.

### Stress

Attach a failure to the step where its cause becomes relevant. For each material failure
state:

- trigger or broken assumption
- point of detection
- visible effect
- responsible recovery actor
- retry, compensation, revocation, or prevention behaviour

Security topics should include misuse and trust failures, not only operational errors.
Avoid turning the lesson into an exhaustive threat model unless that is the requested
scope.

### Decide

A tradeoff is a causal chain:

> constraint or assumption → chosen design → gained property → resulting cost

Represent each tradeoff with:

- decision being made
- context or constraint
- options
- benefit of each option
- cost or risk of each option
- choose-when guidance
- assumption that would invalidate the choice

Place a concise tradeoff marker at the relevant step and a fuller comparison in the
decision section. Keep distinct:

- **Property:** a factual characteristic
- **Consequence:** what follows from that property
- **Cost:** what must be paid or managed
- **Decision:** a choice made under constraints

### Recall

Use two to five checkpoints. At least one should require the learner to predict the next
step or reconstruct ownership. Good prompts include:

- Which actor validates this artifact, and why that actor?
- What state exists immediately after step three?
- What changes if this client cannot keep a secret?
- Predict the next boundary crossing.
- Reconstruct the flow using only the actor names.

Answers should be hidden until requested. Do not place the exact answer beside the
question.

## Visual grammar

Use stable semantics throughout a lesson:

### Shapes

| Shape | Meaning |
| --- | --- |
| rounded actor card | active human or software participant |
| containing region | system, ownership, or trust boundary |
| cylinder or stacked disk | persistent storage |
| document/chip | message, credential, token, or other artifact |
| diamond | decision or validation |
| warning triangle | failure or risk |
| lock marker | protected resource, secret, or security boundary |

### Lines

| Line | Meaning |
| --- | --- |
| solid arrow | request, command, or synchronous message |
| dashed reverse arrow | response |
| dotted arrow | event, callback, or asynchronous message |
| double line | queue or durable hand-off |
| muted line | context not active in the selected step |

Every visible line needs a direction and a text label. The meaning must survive grayscale
printing and colour-vision differences.

### Colour

Assign colour by ownership or trust domain, not by arbitrary decoration. Pair colour
with region borders, icons, labels, or line styles. Reserve warm warning colours for
decisions, risks, and failures.

### Motion

Motion may:

- trace message direction
- reveal a new artifact
- show state moving or changing
- focus attention after a deliberate step change

Motion must not:

- run continuously without instructional meaning
- change the spatial identity of actors
- be required to understand the lesson
- ignore `prefers-reduced-motion`

## Information hierarchy

The initial viewport should prioritize:

1. topic, problem, and learning objective
2. primary scenario and progress controls
3. stable system canvas
4. selected-step explanation

Treat the lesson as a fluid workspace, not a centered article. Use the available
horizontal and vertical space for the system canvas and synchronized explanation. Do
not impose a conventional page-width maximum. Small outer padding may preserve focus
rings and prevent content from touching the browser edge.

Secondary detail may follow:

5. artifact and state inspector
6. ownership map
7. variants
8. failures
9. tradeoffs
10. recall, glossary, and sources

Use plain language for headings. Prefer “What changes” over internal schema terms such as
“state delta.”

## Lesson model

Create a JSON object with the following structure. Optional fields may be omitted when
they do not improve the lesson, but do not omit applicable teaching dimensions merely to
make authoring easier.

```json
{
  "version": 1,
  "topic": {
    "title": "OAuth 2.0 authorization",
    "problem": "An application needs limited access to a user's data without receiving the user's password.",
    "keyIdea": "A user delegates limited access through an authorization server.",
    "objective": "Explain who owns each responsibility and how an authorization-code flow changes state.",
    "level": "conceptual with protocol detail",
    "scope": "Authorization Code flow with PKCE",
    "outOfScope": ["OpenID Connect identity semantics"],
    "modelType": "Conceptual model based on the standard"
  },
  "boundaries": [
    {
      "id": "user-space",
      "name": "User's environment",
      "type": "ownership",
      "owner": "User",
      "description": "The user controls the browser and chooses whether to grant access."
    }
  ],
  "actors": [
    {
      "id": "browser",
      "name": "Browser",
      "kind": "client",
      "boundaryId": "user-space",
      "role": "Carries the user's interactions and redirects.",
      "responsibilities": ["Display authorization UI", "Follow redirects"],
      "doesNotOwn": ["The user's resource password"]
    }
  ],
  "artifacts": [
    {
      "id": "authorization-code",
      "name": "Authorization code",
      "kind": "transient credential",
      "description": "A short-lived, single-use value exchanged for tokens.",
      "createdBy": "authorization-server",
      "heldBy": ["browser", "client"],
      "validatedBy": ["authorization-server"],
      "sensitivity": "sensitive",
      "lifetime": "short-lived",
      "representation": "<redacted authorization code>"
    }
  ],
  "scenarios": [
    {
      "id": "authorization-code-pkce",
      "name": "Authorization Code + PKCE",
      "summary": "A public client obtains delegated access without keeping a client secret.",
      "start": "The user chooses Connect in the client.",
      "steps": [
        {
          "number": 1,
          "title": "The user starts authorization",
          "kind": "request",
          "from": "browser",
          "to": "client",
          "label": "Connect",
          "what": "The browser tells the client to begin connecting an account.",
          "why": "Authorization begins only after an explicit user action.",
          "owner": "client",
          "transport": "HTTPS",
          "artifacts": [],
          "stateBefore": ["No authorization transaction exists."],
          "stateAfter": ["The client creates an authorization transaction."],
          "inspect": {
            "request": "GET /connect",
            "notes": ["The route is illustrative, not required by OAuth."]
          },
          "risk": {
            "trigger": "The request is started without binding it to a user session.",
            "effect": "The callback could be confused with another transaction.",
            "response": "Bind and later validate transaction state."
          },
          "tradeoffIds": ["browser-client-boundary"]
        }
      ]
    }
  ],
  "variants": [
    {
      "id": "confidential-client",
      "name": "Confidential server client",
      "constraint": "The client runs on a server that can protect credentials.",
      "changes": ["The server may authenticate itself with a client credential."],
      "benefits": ["Stronger client authentication is possible."],
      "costs": ["Credential rotation and storage become operational responsibilities."],
      "assumptions": ["The server environment can actually keep the credential secret."]
    }
  ],
  "tradeoffs": [
    {
      "id": "browser-client-boundary",
      "decision": "Where should the authorization response be handled?",
      "context": "Browser code is observable and cannot protect a static client secret.",
      "options": [
        {
          "name": "Public browser client with PKCE",
          "benefits": ["No static client secret is treated as confidential."],
          "costs": ["The client must manage verifier state correctly."],
          "chooseWhen": "The application executes entirely in a user-controlled environment.",
          "invalidWhen": "The architecture assumes browser-delivered credentials remain secret."
        }
      ]
    }
  ],
  "failures": [
    {
      "name": "State mismatch",
      "atStep": 1,
      "scenarioId": "authorization-code-pkce",
      "trigger": "The returned state does not match the initiating transaction.",
      "detectedBy": "client",
      "effect": "The callback is rejected.",
      "recovery": "Start a new authorization transaction.",
      "prevention": "Generate, bind, and validate unpredictable state."
    }
  ],
  "checkpoints": [
    {
      "question": "Which component validates the authorization code?",
      "answer": "The authorization server, because it created the code and owns the token endpoint."
    }
  ],
  "glossary": [
    {
      "term": "Client",
      "definition": "The application requesting delegated access; it is not necessarily the browser."
    }
  ],
  "simplifications": [
    "Deployment details are collapsed into protocol roles."
  ],
  "sources": [
    {
      "title": "OAuth 2.0 Authorization Framework",
      "url": "https://www.rfc-editor.org/rfc/rfc6749",
      "kind": "standard"
    }
  ]
}
```

### Model rules

- IDs use lowercase ASCII kebab-case and are unique within the lesson.
- Actor references use actor IDs. Tradeoff references use tradeoff IDs.
- Step numbers are monotonically increasing within a scenario.
- The actor layout is shared across scenarios. A variant may deactivate an actor but
  should not silently redefine its role.
- `kind` is one of `request`, `response`, `event`, `queue`, `decision`, `state`, or
  `human-action`.
- Boundary `type` is one of `system`, `deployment`, `network`, `ownership`, `trust`,
  `security`, or `data`.
- Use empty arrays for applicable collections with no entries. Omit a collection only
  when that teaching dimension does not apply.
- Structured examples must be short, representative, and redacted.
- A `risk` describes a problem local to a step. `failures` provide fuller recovery
  explanations and may refer to the same causal moment.
- State descriptions use observable language: “the server stores a session identifier,”
  not “the auth stuff is updated.”
- `modelType` must say whether the lesson is conceptual, protocol-level, a common
  production pattern, or a concrete implementation.

## Research and source discipline

Use sources to establish technical claims, not to decorate a bibliography.

- Prefer standards and specifications for protocol requirements.
- Prefer official vendor documentation for vendor behaviour.
- Prefer repository evidence for application-specific behaviour.
- Label illustrative URLs, payloads, and deployments as illustrative.
- Explain when sources disagree or when common production practice differs from a base
  standard.
- Keep quotations short; explain in original language.
- Include only sources actually used.

Current or security-sensitive guidance must be verified at lesson-generation time. A
template is not evidence that an old recommendation remains safe.

## Output and accessibility

The HTML lesson must:

- contain no external runtime dependencies
- work from a `file://` URL
- use semantic headings, buttons, lists, and tables
- support keyboard navigation
- expose a visible focus state
- maintain usable contrast in light and dark schemes
- use text and shape in addition to colour
- respect reduced motion
- remain readable from 320px wide through large desktop displays
- expand to the available viewport width and give the primary lesson stage meaningful
  viewport-relative height
- avoid horizontal page scrolling; a deliberately scrollable canvas is acceptable
- print a useful static summary when practical

## Completion rubric

A lesson is ready only if:

- the learner can point to the start
- the learner can identify each actor and its responsibility
- the learner can distinguish boundary types that matter
- the learner can advance the primary flow without losing spatial orientation
- the learner can inspect material artifacts and state changes
- failures appear at their causal step
- variants explain changed constraints, not merely changed labels
- tradeoffs connect assumptions to consequences and costs
- terminology is consistent
- simplifications and sources are explicit
- recall prompts test the mental model
- the artifact works without setup or network access
