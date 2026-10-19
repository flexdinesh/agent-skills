---
name: recall
description: "Reconstruct recent working context from past agent chat history, live repo state, and the shared record (user reports, prior fixes, reverts, incidents), then hand back a tight current-state brief. Use for 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work. Use only when the user explicitly invokes `recall` or `$recall`; do not auto-invoke from context."
---

# Recall

Manual invocation only: use this skill only when the user explicitly invokes `recall` or `$recall`; do not auto-invoke from task context.

**Before you start or resume work, rebuild the user's recent working context and hand back a tight capsule of where things stand now and what to do next.**

Keep it tight and on-topic. Read only what the in-scope threads need, then stop.

Context lives in three places:

- **Chat history.** Past agent conversations in this workspace hold what was done and decided.
- **Live state.** Branches, worktrees, uncommitted changes, open PRs, and ticket status show where things actually stand.
- **The shared record.** Everything that happened around the same code under other names: the symptoms users keep reporting, the fixes that shipped and got reverted, the errors still firing in production. A feature with a long bug tail keeps most of its story here, so don't reconstruct it from chat history alone.

## Workflow

1. **Classify.** If the user wants to resume one specific prior chat, read that chat in full instead of sweeping. If the user already gave you a full state capsule (paths, branch, the change), use it and skip the mining.
2. **Lock the scope before searching.** Pin the window ("recent" is a real range, default the last 7 days), the topic if named, and the workspace (default the current one). Never read another project's history without being asked. State the scope back. Never quietly turn "all" into "recent N".
3. **Locate the chat history.** Find where the agent you are running in stores past conversations for this workspace. Most agent CLIs and editors persist per-project transcripts on disk, often as JSONL with one message per line. Check the agent's documentation or config directory. If you can't find the store or can't read it, say so in one line, ask the user for the path if it matters, and continue with steps 5 and 6.
4. **Mine the chat history.** Order candidate chats by real modification time (`ls -t`), never by file name or ID. Grep for the topic first, then read only the matching chats and only their relevant regions. Skip the current chat and obvious noise (subagent, eval, and test chats). For each in-scope chat, extract one block: topic, the user's goal, decisions, open threads, struggles and corrections, and artifacts (PRs, tickets, branches), citing the chat's ID or file. For more than a couple of chats, split the corpus across parallel subagents on a fast model if your environment supports them, each returning the same block schema, so raw transcripts stay out of the main context.
5. **Sweep the shared record** whenever the topic names a feature, file, subsystem, area, or bug. This is the default, not a judgment call, and "my work on X" does not exempt it. Follow `references/shared-record.md`. Run it in parallel with step 4. Skip this step only for pure activity recall with no named target ("what did I do this week"), where chat history and live state are the entire answer.
6. **Verify against live state.** Check every PR, branch, and ticket that steps 4 and 5 surfaced with `git` and `gh` (or the tracker's tool): merged, open, reverted, or gone. Also check `git status`, `git worktree list`, and recent local branches for work that never reached a PR. When the answer hinges on what an agent actually did (the tools it ran, files it read, errors it hit), read the full transcript, not a summary.
7. **Write the brief** to the contract below. Group by thread. Stay on the named topic.

## Output contract

Lead with the capsule, then the thread status, then the problems, then the next move. Deeper detail goes below or gets cut.

- **Capsule.** At most 5 bullets. What this work is and where it stands overall.
- **Threads.** One line each, prefixed with exactly one status tag: `[merged #N]`, `[open PR #N]`, `[in flight <branch>]`, `[verified, uncommitted]`, `[reverted #N]`, or `[planned, not started]`. A thread with no tag is not done yet, so tag it.
- **Problems.** At most 5, the recurring ones. Include the symptoms users keep reporting and any fix that shipped and was reverted, so the next attempt starts where the last one failed.
- **Next move.** The single most useful next action, concrete.

An adjacent feature or ticket stays out unless it blocks this one. When the capsule and thread lines outgrow a screen, cut detail before you cut threads.

Cite chat findings by chat ID or file, and shared-record findings by their source (PR #, ticket ID, chat permalink, error-tracker issue). Never fabricate a link or citation. Sanitize private context before any public output.

## Writing the brief

- Short declarative sentences. One idea per sentence.
- Plain words. No filler ("in order to", "it is important to note"), no chatbot phrases, no AI vocabulary (delve, crucial, pivotal, landscape, robust, leverage).
- No em dashes. No colons as mid-sentence connectors. Colons before a list are fine.
- Name the mechanism or the number, not a feeling. "CI fails on the migration step" beats "CI is a bit unhappy".
- Every claim carries its evidence or its label: observed, inferred, or guess.

**Reply:** the brief, to the contract above.
