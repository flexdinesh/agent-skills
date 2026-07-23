---
name: visualise-feature
description: "Visualise how a feature works as ordered requests, responses, and asynchronous messages across system boundaries. Use only when the user explicitly invokes `visualise-feature` or `$visualise-feature`; do not auto-invoke from context."
---

# Visualise Feature

Manual invocation only: use this skill only when the user explicitly invokes
`visualise-feature` or `$visualise-feature`; do not auto-invoke it from task context.

## Purpose

Trace a feature through its implementation and explain its runtime behaviour as an
ordered sequence of interactions across boundaries such as browsers, application
servers, downstream services, queues, and third-party services.

Default to a standalone HTML sequence explorer. Produce ASCII directly in the
harness only when the user explicitly requests ASCII.

## Required resources

Before producing output, read:

- [references/visual-language.md](references/visual-language.md) for the interaction
  model, evidence rules, and output conventions.
- [assets/sequence-template.html](assets/sequence-template.html) in full when producing
  HTML. Treat it as an immutable source template.

Read [references/evaluation-cases.md](references/evaluation-cases.md) only when testing
or modifying this skill.

## Workflow

### 1. Establish scope

Identify the feature, entry point, repository root, and requested output format. Use
HTML unless the user explicitly asks for ASCII. If the feature name or scope cannot be
resolved from the request or repository, ask one targeted question before continuing.

### 2. Trace the implementation

Start at externally observable entry points and follow the real code and configuration:

- browser navigation, forms, fetches, SDK calls, and redirects
- routes, middleware, controllers, handlers, and callbacks
- downstream clients, queues, webhooks, WebSockets, and third-party SDKs
- response construction, redirects, errors, retries, and asynchronous continuations

Search broadly enough to find material alternate paths. Read the implementation rather
than inferring behaviour from names. Keep repository-relative `path:line` evidence for
every interaction and decision.

### 3. Build scenarios

Create the primary success scenario plus at most five materially different paths found
in code. Prioritise:

1. validation or authentication rejection
2. alternate routing caused by decision inputs
3. redirect or callback behaviour
4. downstream or third-party failure
5. asynchronous continuation or retry behaviour

Do not enumerate cosmetic variations or every combination of the same branch. Give each
scenario a concise outcome-oriented name. Order scenarios with the primary path first.

### 4. Model interactions

Use arrows only for boundary-crossing requests, responses, webhooks, events, queue
messages, WebSocket messages, and fire-and-forget operations. Show internal processing
as a decision callout only when it routes, validates, authorises, transforms, or
otherwise explains why the observable flow changes.

For each interaction capture, when applicable:

- monotonically increasing sequence number
- sender and receiver participant
- interaction kind and protocol
- HTTP method, complete URL or runtime expression, and response status
- decision-relevant route parameters, query parameters, headers, cookies, or payload
  fields
- a compact payload or outcome summary
- paired request/response identifier
- ordering evidence, dependencies, concurrency, or delivery uncertainty when relevant
- source evidence and certainty

Never guess a protocol, hostname, URL, status, or payload. Resolve values from code and
configuration. When a value is assembled at runtime, show the expression, for example
`https://${API_HOST}/v1/users`. Mark a justified inference as `inferred`; use `unknown`
when the repository does not establish the value.

Sequence numbers define reading order, not proof of causality. For concurrent work or
delivery whose relative timing is not established, record the known predecessor,
concurrent group, and ordering certainty rather than inventing a total chronological
order. Show queue publication and queue consumption as separate interactions when both
occur.

### 5. Protect sensitive information

Never render secrets or sensitive values. Replace access tokens, credentials, API keys,
session identifiers, cookies, personal data, and secret-bearing query or payload values
with descriptive redactions such as `<redacted access token>`. Preserve field names only
when they help explain behaviour.

### 6. Render

#### HTML (default)

Create `.scratch/visualisations/` if needed. Use a user-provided filename when present,
but treat it as a basename: discard directory components, normalise its stem using the
slug rule below, and force the `.html` extension. Otherwise write
`.scratch/visualisations/<feature-slug>.html`, where the slug is lowercase ASCII with
runs of non-alphanumeric characters replaced by `-`. Keep the output inside
`.scratch/visualisations/`.

Copy the complete HTML template to the destination without changing the source asset.
Replace the single `{{FLOW_DATA}}` marker with the interaction model described in the
visual-language reference. Before embedding JSON, escape `<`, `>`, `&`, U+2028, and
U+2029 as Unicode escapes so repository content cannot terminate the data script.

Keep the result standalone: no external scripts, styles, fonts, images, network calls,
or build step. Do not automatically open a browser unless the user asks.

#### ASCII (explicit request only)

Print the visualization directly in the final response or harness output. Do not create
an HTML, text, or diagram file. Preserve scenario separation, interaction ordering,
protocols, URLs, statuses, decision inputs, certainty, and compact source evidence.

### 7. Validate and report

Before reporting completion:

- compare every scenario and interaction with its cited source
- check numbering is monotonic within each scenario
- check request/response directions and pair identifiers
- check redirects retain the paired request URL, expose `Location` as response data, and
  show the browser's follow-up request when it occurs
- check asynchronous ordering claims do not exceed their evidence
- check protocols and URLs are present or explicitly unknown
- check decision inputs explain the paths they affect
- search the output for secret-bearing values found during tracing
- for HTML, confirm the marker was replaced and no external dependency was introduced
- render or inspect HTML with available browser tools and correct clipping or overlap
- for ASCII, confirm no visualization file was created

Report the artifact path for HTML. Briefly list the scenarios, any unresolved values,
and the evidence standard used. Do not claim inferred or unknown details are verified.

## Guardrails

- Preserve chronological order even when it makes the diagram longer.
- Prefer multiple focused scenarios over a tangled all-paths diagram.
- Do not turn internal function calls into lifelines.
- Do not collapse a request and its response into one arrow.
- Do not omit redirects, callbacks, or browser round trips.
- Do not include a detail merely because it exists; include it when it explains the flow.
- Do not modify application code while visualising it.
