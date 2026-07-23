# Evaluation cases

Use these cases when creating or changing the skill. Run them against a small fixture
repository or an equivalent real code path. Evaluate observable behaviour, not exact
wording or styling.

## Shared acceptance checklist

- The primary scenario appears first and there are no more than six scenarios.
- Sequence numbers are monotonic within every scenario.
- Requests and responses use separate interactions with correct directions.
- Redirect responses retain the paired request URL; `Location` contains the target and
  any browser follow-up is a new interaction.
- Each boundary-crossing interaction shows a protocol and URL or explicitly marks it
  unknown.
- Decision-relevant inputs are highlighted and state their effect.
- Each verified or runtime-derived interaction has repository-relative source evidence.
- Runtime-derived values are expressions rather than invented deployed values.
- Secrets and personal data are redacted.
- Default output creates same-stem `.html` and `.md` sibling artifacts under
  `.scratch/visualisations/`.
- HTML is standalone, responsive, keyboard operable, and contains no unresolved
  `{{FLOW_DATA}}` marker.
- Markdown contains the system map, decision-path index, complete ordered scenario
  ledgers, and the runtime-derived/inferred/unknown detail summary.
- HTML and Markdown agree on feature metadata, scenario order, interaction semantics,
  decision effects, certainty, evidence, and redactions.
- Markdown contains no Mermaid, ASCII diagram, generated timestamp, or raw interaction
  model appendix.
- An explicit HTML-only or Markdown-only request creates no unrequested sibling file.
- ASCII output creates no visualization file.
- Concurrent or delivery-uncertain operations label ordering certainty rather than
  implying unsupported causality.

## Case 1: Signup, redirect, and query routing

Prompt:

> `$visualise-feature` Show how signup works. Include the normal invited-user flow, the
> existing-email path, and the browser redirect after success.

Fixture characteristics:

- A browser posts an HTTPS form or fetch request.
- An `invite` query parameter selects a branch.
- The application returns a `303` with a `Location` header.
- The browser follows the redirect with a second request.

Additional checks:

- Same-stem HTML and Markdown artifacts are created.
- The redirect response and follow-up request are separate ordered steps.
- `invite` is highlighted with its routing effect.
- The Markdown decision-path index includes `query.invite`, its safe redacted value,
  its effect, scenario, step, and source evidence.
- Existing-email behaviour is a separate scenario tab.

## Case 2: Downstream failure and alternate code paths

Prompt:

> `$visualise-feature` Visualise checkout across the browser, API, payment provider, and
> inventory service. Cover success, declined payment, and inventory timeout.

Fixture characteristics:

- Two downstream services are called in a defined order.
- Decline and timeout paths return different statuses or application outcomes.
- Some internal helpers do not cross a boundary.

Additional checks:

- Internal helpers are absent as lifelines.
- Only path-changing internal decisions appear as callouts.
- Each material outcome has its own scenario.

## Case 3: Explicit ASCII output

Prompt:

> `$visualise-feature` Trace password reset and output ASCII only.

Additional checks:

- Output is printed directly.
- No `.scratch/visualisations/` artifact is created by the run.
- Multiple scenarios remain independently readable.
- Protocols, URLs, statuses, decision inputs, certainty, and sources remain present.

## Case 4: Explicit single-format output

Prompts:

> `$visualise-feature` Trace password reset and output Markdown only.

> `$visualise-feature` Trace password reset and output HTML only.

Additional checks:

- Each run creates only the explicitly requested artifact.
- The artifact uses the same directory and slug rules as paired output.
- Markdown-only output retains all interaction details, decision effects, uncertainty,
  and evidence even without the visual explorer.

## Case 5: Redaction

Prompt:

> `$visualise-feature` Show the OAuth callback and token exchange, including the fields
> that determine whether the callback succeeds.

Fixture characteristics:

- Source contains client credentials, authorization codes, access tokens, cookies, and
  user profile data.

Additional checks:

- Field names may appear when relevant, but values are redacted.
- No credential, code, token, cookie value, or personal value appears in either
  artifact.
- Redaction does not hide the decision effect.
- Redacted values agree across HTML and Markdown.

## Case 6: Runtime-derived URL

Prompt:

> `$visualise-feature` Explain how report export calls the reporting service.

Fixture characteristics:

- The hostname comes from configuration unavailable in the repository.
- The path and protocol are established in code.

Additional checks:

- The URL is shown as an expression such as
  `https://${REPORTING_HOST}/v1/reports`.
- Certainty is `runtime-derived`.
- The skill does not substitute localhost, a production hostname, or another guess.
- The Markdown non-verified detail summary identifies the runtime-derived hostname
  expression and its evidence.

## Case 7: Asynchronous interactions

Prompt:

> `$visualise-feature` Show order fulfilment, including the queue publication, worker
> consumption, warehouse webhook, and WebSocket update to the browser.

Fixture characteristics:

- An HTTP request starts the flow.
- A queue message continues it asynchronously.
- A webhook enters from a third party.
- A WebSocket message updates the browser.

Additional checks:

- Asynchronous operations are not given fabricated responses.
- Queue publication and consumption are separate interactions when both occur.
- Queue, webhook, and WebSocket interactions use distinct labels and line styles.
- Their chronological relationship and any uncertainty are explicit.
- The Markdown ledger preserves the known predecessors, concurrent groups, and ordering
  notes without relying on sequence numbers as proof of causality.
