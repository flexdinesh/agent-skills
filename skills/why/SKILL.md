---
name: why
description: "Investigate why code works the way it does: design rationale, 'why we picked Y', regressions, postmortems, or data-backed thresholds. Discovers the available external tools and queries each evidence category (source control, issue tracker, long-form docs, team chat, infrastructure observability, error tracking, product analytics) in parallel, then returns a cited, confidence-tiered read on decisions and tradeoffs. Use only when the user explicitly invokes `why` or `$why`; do not auto-invoke from context."
---

# Why

Manual invocation only: use this skill only when the user explicitly invokes `why` or `$why`; do not auto-invoke from task context.

Investigate the motivation and intent behind code. This skill answers what forces led to the code's shape. It does not explain runtime behavior. For "how does this work", trace the code instead.

## Subagents

If your environment can spawn subagents, run each investigator and the synthesizer as its own subagent, and start all investigators at once so they run concurrently. When you can choose models, a fast model is fine for investigators. Use your strongest judgment model for the synthesizer. If your environment can't spawn subagents, play each role yourself in sequence, one source at a time, and keep each investigator's findings separate until synthesis.

Investigators and the synthesizer need access to every external tool in the session (MCP servers, connectors, authenticated CLIs). Do not run them in a read-only mode that strips that access. They still must not write files, commit, or change external state.

## Operating posture

Operate as a **careful, cautious, and precise investigator**. Be honest about what you know vs what you're inferring. Read `references/epistemics.md` for the full confidence framework and phrasing guide. The synthesizer must follow it.

## Step 1. Understand the target and the question

The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually a design rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a broad history sweep.

If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from conversation context (open files, recent edits, what was just discussed). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the code anchor

Before starting investigators, build the seed context inline: file paths and line ranges, key symbols (functions, classes, constants), the last few commits touching the target, PR numbers from merge commits (pattern `(#1234)` in the subject line), and any linked ticket IDs.

```bash
git blame -L <start>,<end> <file>          # last-touch commits
git log --follow -p -- <file>              # full history with patches through renames
git log --oneline -20 -- <file>            # recent commits with PR numbers visible
git log -1 --format=%B <commit>            # extract PR numbers and ticket IDs
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews
```

Pull the PR body and discussion for every substantive commit. This anchor goes to every investigator and to the synthesizer.

## Step 3. Run parallel investigators

**Default to the full parallel investigation.** The goal is a complete coverage map, not a minimal one. Document the null, don't skip the search.

### Discovery

List the external tools available in this session: MCP servers, connectors, and authenticated CLIs. Map each one to exactly one evidence category:

| # | Category | Example tools | Playbook | Best at |
|---|---|---|---|---|
| 1 | Source control history | git, `gh` | `references/sources/source-control.md` | Implementation-time rationale captured during review. |
| 2 | Issue / ticket tracker | Linear, Jira, GitHub Issues, Shortcut | `references/sources/issue-tracker.md` | The product or business forcing function. Strongest when the why is external to engineering. |
| 3 | Long-form documents | Notion, Confluence, Google Docs, Coda | `references/sources/documents.md` | Long-form design rationale, written before it became code. |
| 4 | Real-time team chat | Slack, Discord, Microsoft Teams, Mattermost | `references/sources/team-chat.md` | Deliberation that never reached a doc. Most important when the source control, ticket, and doc trail is thin. |
| 5 | Infrastructure observability | Datadog, New Relic, Honeycomb, Grafana, Splunk | `references/sources/observability.md` | The runtime reality that motivated the code. Strongest when the target reacts to an infra signal (timeouts, retries, rate limits, circuit breakers). |
| 6 | Error / exception tracking | Sentry, Rollbar, Bugsnag, Airbrake | `references/sources/error-tracking.md` | The specific exceptions that motivated defensive or corrective code. Strongest for catch blocks, null guards, type checks, retries. |
| 7 | Product analytics warehouse | Databricks, Snowflake, BigQuery, ClickHouse, dbt | `references/sources/analytics-warehouse.md` | Product and data reality. Strongest for flag-gated code, experiment-driven ships, data migrations, and "where did this number come from". |

Source control is always available through git and usually `gh`. For the other six, classify each tool by its name, instructions, tool names, and resource descriptions. If a tool could fit more than one category, choose the one matching its primary evidence. Record ambiguous cases in the coverage map.

Run one investigator per category that has a matching tool, each owning exactly one tool. Don't ask one investigator to cover multiple tools. The playbooks are concrete examples. Adapt them to the specific tool in that category.

Each investigator's prompt is `references/investigator-prompt.md` filled in, plus:

- the category playbook from the table above
- `references/sources/incident-postmortem.md` **if the target code looks defensive** (null checks, retry logic, timeout handling, rate limiting, feature flags, egress guards, OOM handlers)
- the code anchor and the user's original question

### When to skip an investigator

Only with an **explicit, written justification** that goes in the final Sources Consulted. Two valid reasons:

- **No tool is available for that category** in this environment. Flag it as a gap, not a choice: "Real-time team chat skipped. No matching tool available, so the conversational record was not searchable."
- **The source is provably irrelevant**, not just "probably irrelevant." A high bar: "Error / exception tracking skipped. Target is a build-time script with no runtime code path."

If the target is a single-commit trivial change where the PR description already contains the complete answer, you may answer inline **only after** confirming every available category search would be redundant. Say so explicitly. This should be rare.

## Step 4. Synthesize

Run one synthesizer. It gets:

1. The investigator findings, including any null results and any categories skipped with justification
2. The code anchor
3. The user's original question
4. The epistemics framework from `references/epistemics.md`
5. The synthesizer prompt template from `references/synthesizer-prompt.md`

## Step 5. Present

Present the synthesizer's output to the user. You may lightly edit for clarity or add context from the conversation, but **do not rewrite the confidence language**.

## Output format

The structure is the one in `references/synthesizer-prompt.md`: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. Adapt as needed, but keep the confidence separation intact, and keep Sources Consulted as one line per category, including the ones that returned nothing or were skipped, with the reason.

After Sources Consulted, if the user's question is a precursor to changing this code, convert the findings into a Preserve / Change / Avoid / Risk constraint set for planning the change.

## Common failure modes to avoid

- **Recency bias.** Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.
- **Confirming the user's guess.** A hypothesis embedded in the question is one candidate, not the answer. Check it against the evidence.
- **Code as evidence for its own intent.** Code shows mechanics, not motivation.
