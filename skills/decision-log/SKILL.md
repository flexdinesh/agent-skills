---
name: decision-log
description: Save a brief decision log from the current session when the user explicitly asks to persist decisions, rationale, tradeoffs, assumptions, ambiguities, or durable rules for future work.
---

# Decision Log

Use only when the user explicitly wants a decision log saved.

## Rules

- Capture durable decisions, not transcript detail.
- Keep it brief. Prefer `Why / What / How`.
- Include `Risks`, `Tradeoffs`, `Assumptions`, `Ambiguities`, `Rules`, or `Gotchas` only when useful.
- Ask the user to confirm the destination before creating the file.
- Default path: `docs/decision-log/YYYY-MM-DD-<slug>.md`.

## Workflow

1. Extract the few decisions future agents need.
2. Propose `docs/decision-log/YYYY-MM-DD-<slug>.md` and ask for confirmation or override.
3. After confirmation, write markdown with YAML frontmatter.
4. Update `AGENTS.md` only if the user explicitly wants durable project rules captured there.

## Format

```yaml
---
title: Short decision title
description: One-line summary
date: YYYY-MM-DD
slug: short-hyphenated-topic
status: planned | implemented | superseded
tags:
  - short-tag
related_paths:
  - path/when/useful
---
```

```md
## Why
## What
## How
```

## Constraints

- Do not invent decisions.
- Do not turn the log into a changelog or command history.
- Omit empty optional sections.
