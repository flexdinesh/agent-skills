# Visual language

Use this reference to create one feature interaction model and render it consistently
as HTML, Markdown, or explicitly requested ASCII.

## Visual grammar

Reading order runs from top to bottom. System boundaries and their participants run from
left to right. Sequence numbers define presentation order. They must not imply a verified
total chronological order when operations are concurrent or delivery order is unknown;
use ordering metadata and visible notes for those cases.

### Boundaries and participants

A boundary is an independently deployed, operated, or externally controlled runtime
environment. Common boundary types are `browser`, `application`, `downstream`,
`third-party`, and `messaging`.

A participant is an interaction endpoint within a boundary, such as `Signup page`,
`Public API`, or `Email queue`. Do not use ordinary functions, classes, or modules as
participants. Prefer one participant per boundary unless multiple endpoints materially
clarify the flow.

### Interaction kinds

| Kind | Meaning | Visual treatment |
|---|---|---|
| `request` | A request expecting a corresponding response | solid arrow |
| `response` | The result of a paired request | dashed reverse arrow |
| `webhook` | An externally initiated callback request | solid accent arrow |
| `event` | A one-way event or fire-and-forget operation | dotted arrow |
| `queue` | A message published to or consumed from messaging infrastructure | double-line arrow |
| `websocket` | A message on an established bidirectional channel | wave-accent arrow |
| `decision` | Internal logic that materially changes the observable path | participant callout, no cross-boundary arrow |

Use the actual transport as `protocol`: `HTTPS`, `HTTP`, `WSS`, `WS`, `AMQP`, `SQS`,
`Kafka`, or another value established by the implementation. The interaction kind and
protocol are separate concepts.

### Requests and responses

Give both sides of a synchronous exchange the same non-secret `pairId`. Responses must
be separate interactions and point back to the requester. On a response, `url` is the
URL of the paired request, not a redirect target. A redirect is a response with its
status and decision-relevant `Location` header, followed by a new browser request to the
resolved Location when the implementation performs one.

Model queue publication as producer → queue and consumption as queue → consumer when
both are present. Do not fabricate a response for either operation.

### Ordering and concurrency

Add an `ordering` object when timing needs explanation:

- `certainty`: `verified`, `inferred`, or `unknown`
- `after`: sequence numbers that are known predecessors
- `concurrentGroup`: a stable label shared by operations that may run concurrently
- `note`: a concise explanation of delivery or ordering constraints

Omit `ordering` only when the immediately preceding sequence is directly verified.
Number concurrent operations in a stable reading order and label the concurrency; never
use their number alone as evidence that one completed before another.

### Decision inputs

Highlight an input only when it affects routing, validation, authorisation,
transformation, downstream selection, or the response. Supported locations include:

- `route`
- `query`
- `header`
- `cookie`
- `body`
- `response`
- `config`

State the field, a safe value or shape, and its effect. Redact secret values even when
they influence a decision.

### Certainty

Use one of:

- `verified`: directly established by the cited code or configuration
- `runtime-derived`: the construction is verified but the deployed value is unavailable
- `inferred`: strongly implied by multiple sources but not directly established
- `unknown`: not established by the available repository

Every interaction and decision needs at least one evidence item unless its certainty is
`unknown`, in which case evidence should identify where tracing stopped when possible.

## Interaction model

Build one JSON object as the semantic source for every requested format. Embed it at the
HTML template's `{{FLOW_DATA}}` marker when producing HTML:

```json
{
  "version": 1,
  "feature": {
    "name": "User signup",
    "description": "Creates an account and starts email verification.",
    "scope": "Signup page through verification dispatch"
  },
  "boundaries": [
    {
      "id": "browser",
      "name": "Browser",
      "type": "browser",
      "participants": [
        { "id": "signup-page", "name": "Signup page", "technology": "React" }
      ]
    },
    {
      "id": "application",
      "name": "Application",
      "type": "application",
      "participants": [
        { "id": "public-api", "name": "Public API", "technology": "Node.js" }
      ]
    }
  ],
  "scenarios": [
    {
      "id": "success",
      "name": "Successful signup",
      "summary": "The account is accepted and the browser is redirected.",
      "interactions": [
        {
          "number": 1,
          "kind": "request",
          "from": "signup-page",
          "to": "public-api",
          "protocol": "HTTPS",
          "method": "POST",
          "url": "https://${API_HOST}/signup?invite=<redacted invite token>",
          "label": "Submit signup",
          "pairId": "signup-request",
          "certainty": "runtime-derived",
          "ordering": {
            "certainty": "verified",
            "after": [],
            "note": "This browser action starts the scenario."
          },
          "decisionInputs": [
            {
              "location": "query",
              "name": "invite",
              "value": "<redacted invite token>",
              "effect": "Selects the invited-user path"
            }
          ],
          "details": {
            "requestHeaders": { "Content-Type": "application/json" },
            "requestBody": { "email": "<redacted email>" },
            "notes": ["The hostname comes from API_HOST."]
          },
          "evidence": [
            {
              "path": "src/signup.ts",
              "line": 42,
              "label": "Request construction",
              "certainty": "verified"
            }
          ]
        },
        {
          "number": 2,
          "kind": "response",
          "from": "public-api",
          "to": "signup-page",
          "protocol": "HTTPS",
          "status": 303,
          "url": "https://${API_HOST}/signup?invite=<redacted invite token>",
          "label": "Redirect to verification",
          "pairId": "signup-request",
          "certainty": "verified",
          "decisionInputs": [],
          "details": {
            "responseHeaders": { "Location": "/verify-email" }
          },
          "evidence": [
            {
              "path": "src/signup-handler.ts",
              "line": 88,
              "label": "Redirect response",
              "certainty": "verified"
            }
          ]
        },
        {
          "number": 3,
          "kind": "request",
          "from": "signup-page",
          "to": "public-api",
          "protocol": "HTTPS",
          "method": "GET",
          "url": "https://${API_HOST}/verify-email",
          "label": "Follow redirect",
          "pairId": "verification-page",
          "certainty": "runtime-derived",
          "decisionInputs": [],
          "details": {},
          "evidence": [
            {
              "path": "src/signup-page.ts",
              "line": 54,
              "label": "Browser navigation",
              "certainty": "verified"
            }
          ]
        }
      ]
    }
  ]
}
```

Required top-level properties are `version`, `feature`, `boundaries`, and `scenarios`.
Required interaction properties are `number`, `kind`, `label`, `certainty`, and
`evidence`. Boundary-crossing interactions also require `from` and `to`; decisions use
`actor`. `url` on a response refers to the paired request URL. Use an `ordering` object
whenever concurrency or delivery order needs explanation. Use empty arrays or objects
when a collection has no entries.

Do not include a generated timestamp: it creates noisy, non-semantic diffs.

## Cross-format semantic contract

HTML and Markdown are different views of the same interaction model:

- Preserve feature name, description, and scope verbatim.
- Preserve boundary and participant identity, names, types, and technologies.
- Preserve scenario identity, order, names, summaries, and interaction order.
- Preserve every interaction's number, kind, label, direction or actor, protocol,
  method, URL, status, pair identifier, decision inputs, details, ordering, certainty,
  and evidence.
- Apply the same redactions in every format.
- Use the vocabulary from this reference, including the uppercase interaction kinds
  and the four certainty values.

Markdown may derive a system map, decision-path index, and non-verified detail summary
from the model to make agent retrieval easier. These are indexes over model facts, not
an additional source of runtime behaviour. Do not add a claim that cannot be traced to
an interaction and its evidence.

## HTML conventions

- Scenario tabs use outcome-oriented names rather than implementation branch names.
- Boundary headers remain visible while scrolling vertically.
- Participant lifelines remain visually subordinate to interaction arrows.
- The selected interaction opens a detail panel without changing scenario order.
- Source chips are buttons. Activating one copies repository-relative `path:line` text.
- Long URLs wrap in the detail panel but remain on one compact line in the sequence row.
- Decision inputs use a warm highlight distinct from errors or certainty states.
- Colour is never the only carrier of meaning; include text and line-style differences.
- Respect `prefers-reduced-motion` and keep all controls keyboard accessible.

## Markdown conventions

Markdown is a self-contained agent briefing, not a prose approximation of the visual
diagram. Optimise it for accurate retrieval, code navigation, and comparison of paths.
Use the following required structure and omit only explicitly optional subsections:

````markdown
# Feature flow: <feature name>

<feature description>

**Scope:** <feature scope>

## System map

| Boundary | Type | Participant | Technology |
|---|---|---|---|
| ... | ... | ... | ... |

## Decision-path index

| Scenario | Step | Decision input | Safe value | Effect | Evidence |
|---|---:|---|---|---|---|
| ... | ... | ... | ... | ... | `path:line` |

## Scenarios

### 1. <scenario name>

**Outcome:** <scenario summary>

#### Step 1 — `REQUEST`: <interaction label>

- **Route:** <boundary / participant> → <boundary / participant>
- **Transport:** `POST HTTPS https://${API_HOST}/signup`
- **Pair:** `signup-request`
- **Certainty:** `runtime-derived`
- **Decision inputs:** `query.invite = <redacted invite token>` → Selects the
  invited-user path
- **Ordering:** verified; starts the scenario
- **Evidence:** `src/signup.ts:42` — Request construction (`verified`)

**Request headers**

```json
{
  "Content-Type": "application/json"
}
```

**Request body**

```json
{
  "email": "<redacted email>"
}
```

## Runtime-derived, inferred, and unknown details

| Scenario | Step | Certainty | Detail | Evidence or tracing boundary |
|---|---:|---|---|---|
| ... | ... | ... | ... | ... |
````

Render every boundary and participant in the system map. Render every
`decisionInputs` entry in the decision-path index, including entries on ordinary
requests or responses. Also include path-changing `decision` interactions; use their
label when they have no named input. If there are no path-changing decisions, state
that explicitly instead of omitting the section.

Under each scenario, render every interaction in number order. Use `REQUEST`,
`RESPONSE`, `WEBHOOK`, `EVENT`, `QUEUE`, `WEBSOCKET`, or `DECISION` in the step heading.
For boundary-crossing interactions include the fully qualified boundary and participant
route plus transport data. For decisions use `**Actor:**` instead of `**Route:**` and do
not invent transport data. Include `Pair` whenever `pairId` exists.

Include every non-empty decision input, detail collection, ordering property, and
evidence item. Keep structured headers, bodies, payloads, and response data in fenced
`json` blocks when representable as JSON; use a text block otherwise. Evidence uses
repository-relative `` `path:line` `` references followed by its label and certainty.
When multiple values exist, use nested bullets or a compact table rather than
flattening away field names.

The final non-verified details section inventories every `runtime-derived`, `inferred`,
and `unknown` interaction. Name the expression, inference, or tracing boundary that
keeps it from being verified and cite available evidence. If every interaction is
verified, state that explicitly.

Do not include Mermaid, ASCII art, a generated timestamp, or a raw interaction-model
JSON appendix. The numbered ledger is the Markdown representation of the flow.

## ASCII conventions

Render each scenario independently. Declare boundary/participant names above the flow,
then use a numbered list of directional interactions. For example:

```text
Scenario: Successful signup

Browser / Signup page          Application / Public API
        |                                |
  1  --| POST HTTPS ${API_HOST}/signup ->|
        | ?invite=<redacted> [DECISION]  |
        | src/signup.ts:42               |
  2  <-| 303 Location: /verify-email --- |
        | src/signup-handler.ts:88       |
```

When participant names or URLs make aligned lifelines unreadable, prefer a compact
interaction ledger rather than truncating evidence:

```text
1. REQUEST  Browser/Signup page -> Application/Public API
   POST HTTPS https://${API_HOST}/signup
   DECISION query.invite -> invited-user path
   SOURCE   src/signup.ts:42 [runtime-derived]
```

Use `REQUEST`, `RESPONSE`, `WEBHOOK`, `EVENT`, `QUEUE`, `WEBSOCKET`, and `DECISION` so
the meaning does not depend on arrow punctuation alone.
