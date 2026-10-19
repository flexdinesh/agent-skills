# Shared-record sweep

The question for every source is: **what is the current state, what has been tried and didn't hold, and what are users still reporting?** Not "why was this built".

## Posture

- One investigator per source, each owning exactly one tool. Run them in parallel when your environment supports subagents, otherwise one at a time.
- Discover the sources first. List the external tools in this session (MCP servers, connectors, authenticated CLIs) and map each to one category below. Source control is always available through git and usually `gh`.
- An unavailable source is a gap, not a choice. Skip it and say so in one line.
- Null results are findings. Record what you searched, verbatim.
- Investigators read only. They never write files, comment, or change external state.
- Quote verbatim with exact locations. Don't round a partial finding up into a confident one.
- Time-bound every search to the recall window, widened only to catch the start of a bug tail.

## Sources

### Source control (git, `gh`)

- `git log --since=<window> --oneline -- <paths>` for recent commits on the target.
- `git log --grep='revert' -i --since=<window> -- <paths>` and `git log -S '<symbol>'` for fixes that were undone or reworked.
- `gh pr list --search '<topic>' --state all` for open, merged, and closed PRs. Read review threads on the relevant ones for unresolved objections.
- `gh pr checks <number>` for PRs that are open but failing.

### Issue / ticket tracker (e.g. Linear, Jira, GitHub Issues)

- Open and recently closed tickets naming the feature, file, or error string.
- Reopened tickets and closed-as-duplicate chains. Follow duplicates to the canonical ticket.
- Comments that report the bug still happening after a fix shipped.

### Team chat (e.g. Slack, Discord, Teams)

- User-report and support channels for the feature name and error strings in the window.
- Threads that link the relevant PRs. Always read the whole thread.
- If the tool isn't authenticated, stop and report the gap.

### Long-form documents (e.g. Notion, Confluence, Google Docs)

- Postmortems, specs, and plans for the target updated in the window. Check whether the doc still matches the code.

### Error tracking (e.g. Sentry, Rollbar, Bugsnag)

- Issues whose stack traces pass through the target. First seen, last seen, frequency trend, and affected releases.
- Issues marked resolved that regressed after the fix release.

### Observability (e.g. Datadog, Grafana, Honeycomb)

- Monitors and alerts on the target's service that fired in the window.
- Incidents that name the target, its symbols, or its error strings.

## What to return per source

- **Source** and the tool used.
- **What I searched.** Queries verbatim, with time windows.
- **Current state.** Open items with IDs and status.
- **Tried and didn't hold.** Reverted or reopened fixes, with the evidence that they failed.
- **Still reported.** Live symptoms with their most recent occurrence.
- **Gaps.** What was unsearchable and why.
