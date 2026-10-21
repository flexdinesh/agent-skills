# Real-time team chat

Examples: Slack, Discord, Microsoft Teams, Mattermost. Chat tools vary. Inspect the available tool's capabilities first. If it needs authentication and that fails, stop and report the gap.

## How to search it

1. **Author-bounded search.** Messages from the PR author around the PR merge date. Limits scope dramatically and often hits gold.
2. **PR URL search.** Chat often links PRs when they're reviewed or discussed. Search for the PR URL (or just `/pull/<number>`).
3. **Error string search.** If the code handles a specific error, search for the error string. Incident threads often surface.
4. **Feature or symbol search.** Search the feature name and key symbols in the team's engineering and incident channels.

## Common pitfalls

- **Retention limits.** Very old messages may be gone due to retention policies. If you can't find anything before a certain date, note the retention cliff.
- **Unsearched DMs.** Many decisions happen in DMs that aren't searchable. You'll miss them. That's a known limitation.
- **Speculative jokes as "decisions."** Chat is casual. "Lol just do the thing" isn't a decision, even if it preceded the commit. Look for considered discussion.
- **Context collapse in single messages.** Without the thread, a single message often reads differently than in context. Always fetch threads.
- **Auth failures.** If the tool isn't authenticated, stop. Don't make up findings. Report that chat wasn't searchable.

## What to return

For each relevant thread:

- Channel, author, date, and permalink
- The verbatim message(s) that bear on the question, with surrounding thread context
- Relevance and strength: direct / circumstantial / weak
