# Feature stories and contracts

Architecture answers who owns what. An HTML story explains what happens when a
person triggers the feature. Use both. Each scenario should read as connected
events, with enough contract detail to locate and debug the real call.

## Trace both ends

For every boundary interaction inspect the caller, URL/base resolver, serialized
request, receiving route/schema where available, returned response, and consumer.
Record exact method/path/query and the base URL configuration symbol. If a host
varies by environment, write `{SIGNUP_SERVICE}/api/v3/signup/paid/regular` and
cite its resolver; do not guess a production host. Cookies, authorization,
correlation IDs, and relevant content types belong in the contract.

Capture the emitted shape, including transformations and optional fields, rather
than copying an unrelated model. Payload objects are representative examples;
explain types/optionality and validation in notes. Use placeholders for secrets
and personal data. A GET without a body uses `payload: "No request body"`.
`payload: null` means a literal JSON null, not the absence of a body.

An unavailable SDK transport uses `method: "SDK"`,
`url: "Unknown — SDK transport not inspected"`, documented arguments as payload,
and a response status such as `"SDK return value"`. State what is unknown and
cite the SDK call. Never invent a URL, success code, response body, durability,
payment settlement, retry, or idempotency guarantee. Proposed downstream calls
must say **provisional** in the event description and notes.

## Execution and order

- **Sync:** the caller's continuation requires the reply. An awaited HTTP call
  remains a sync request/reply interaction even though its implementation uses
  asynchronous I/O; the browser itself need not be blocked.
- **Async:** independent publication/delivery, a detached continuation, webhook,
  or later callback. A broker acknowledgement is separate from worker completion.
  An HTTP 202 is acceptance, not evidence that the job succeeded.
- **Local:** validation, state transitions, decisions, or local effects needed
  to understand the next interaction. Do not inventory every helper call.
- **Redirect:** distinguish the HTTP 3xx response from the subsequent browser
  navigation and callback. Redirect is not a queue or background job.
- **Parallel:** sibling calls can each be sync while running concurrently.
  Give them a common `parallelGroup`, shared `after` prerequisites, and an explicit
  join event depending on both replies. Do not invent their completion order.

List events in causal reading order. `after` records real dependencies, not
merely the previous row. For nested calls, place the downstream request/reply
between the outer request and outer reply. Split branches into separate scenario
views; document the condition at the start. Keep IDs stable and match any optional
Mermaid event numbers to the HTML list. No Mermaid diagram is required for a story.

## JSON schema

Add `events` to a view. A `Dynamic` view may omit `mermaid` when events are non-empty.
Existing reports without events remain supported; new feature reports must supply
the main story. Each event has:

| Field | Meaning |
| --- | --- |
| `id`, `title` | Unique lowercase slug within the view; action-oriented title |
| `kind` | `request`, `response`, `publish`, `consume`, `callback`, `redirect`, or `local` |
| `mode` | `sync`, `async`, or `local`; local kind uses local mode only |
| `from`, `to` | Named participants; identical for a local decision |
| `description` | Why this happens, whether control waits/continues, and the observable consequence |
| `after` | Array of earlier event IDs that must happen first; `[]` for a trigger |
| `exchange` | Required for request/response; unique per request attempt, shared with its reply |
| `method`, `url` | Required for requests; method and full URL template, or explicit SDK unknown |
| `status` | Required for responses; status and meaning, or documented non-HTTP return |
| `payload` | Required for requests/responses; object, array, scalar, or explicit absence/unknown description |
| `headers` | Optional object of header names to strings; relevant values redacted |
| `channel` | Required for publish/consume; topic, queue, or event name |
| `parallelGroup` | Optional concurrent branch label; not a completion ordering guarantee |
| `notes`, `evidence` | Required arrays, like view annotations; source at the event, not just a global list |

Callbacks require `mode: "async"` and `url`; describe the initiating browser,
provider, or service precisely. Redirects require `url` and use sync or async
according to their continuation. Publish/consume events require async mode.
A response reverses its request's participants, preserves mode, and causally
follows the request. Requests without a known reply are allowed; explain the
timeout/unknown outcome in a subsequent local event instead of inventing a reply.

```json
{
  "id": "request-checkout",
  "title": "Browser requests a checkout intent",
  "kind": "request",
  "mode": "sync",
  "from": "Paid signup UI",
  "to": "Signup BFF",
  "description": "The user confirms selection. The page waits for a checked intent before showing payment fields.",
  "after": [],
  "exchange": "checkout-intent",
  "method": "POST",
  "url": "{APP_ORIGIN}/api/signup/paid/payment-intent",
  "headers": {"Content-Type": "application/json"},
  "payload": {"plan": {"planId": "<selected-plan-id>", "numberOfUsers": 2}},
  "notes": ["Illustrative payload; verify fields and types against the target source."],
  "evidence": []
}
```

For HTML, use a compact numbered event list with short explanatory paragraphs. Show the
participant direction, execution mode, method/URL or channel, response status,
and linked prerequisites inline. Put complete payloads, headers, qualifications,
and source evidence in native disclosure sections. A reader must understand the
scenario without opening the diagram; source text and payloads must be safely
escaped. Keep long URLs and JSON readable on narrow screens.

Use one ordered list, with each desktop row split into explanation and contract
columns. This fills horizontal space without changing chronology. Expanded
payload/header definitions may share a row. Stack these regions on narrow screens.
Keep method/URL/status visible even when contracts are collapsed; do not hide the
story or its causal links to achieve density. Inherit the compact typography,
gutters, and spacing from the template and the skill's compact HTML defaults.
