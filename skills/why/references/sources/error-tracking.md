# Error / exception tracking

Examples: Sentry, Rollbar, Bugsnag, Airbrake. Use whatever tool the session provides. The steps below name generic operations. Map each to the tool's equivalent.

## How to search it

1. **Orient.** Find the organization and project that own the target code.
2. **Search for issues related to the target.** Build queries from the exception class names the target handles, its function or class name, the error message strings it checks for, and its file path.
3. **Narrow by release and time window.** For a suspected issue, check **first seen** and **last seen** (does the stop line up with the target's ship date?), the **affected releases** (which saw it, and which was the fix?), and the **frequency trajectory** (did it spike, then get resolved?). Tag distributions across versions, users, and environments help here.
4. **Pull the full event for context.** Does the stack trace pass through the target code? Do the tags and breadcrumbs match the conditions the target defends against?
5. **Check releases that landed near the target.** Cross-reference release version with the PR's merge date.
6. **Treat AI root-cause summaries as hypotheses.** If the tool offers automated analysis, it is inference, not authority. The actual events and stack traces are the primary evidence.

## Common pitfalls

- **Sampling.** Event counts may be sampled. Note the sampling rate if known before comparing volumes.
- **Retention.** Old issues may have aged out. A missing issue in an old window is a gap, not proof the error never happened.
- **Grouping changes.** The tool may have regrouped issues over time, splitting or merging the history you are looking for.

## What to return

For each relevant issue:

- Issue ID and title
- Project and organization
- First seen / last seen timestamps
- Event count (and sampling rate if known)
- Affected releases
- A representative stack trace snippet showing relevance to the target (verbatim excerpt, not summary)
- First/last-seen correlation with the target's ship date
- Link to the issue
- Any author comments or resolution notes
