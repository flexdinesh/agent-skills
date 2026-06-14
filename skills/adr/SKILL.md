---
name: adr
description: "Save a brief Architecture Decision Record (ADR) from the current session. Use only when the user explicitly invokes `adr` or `$adr`; do not auto-invoke from context."
---

# ADR

Manual invocation only: use this skill only when the user explicitly invokes `adr` or `$adr`; do not auto-invoke from task context.

## Rules

- Write an Architecture Decision Record (ADR), not a changelog or transcript.
- Capture one durable architectural decision per ADR.
- Use standard ADR sections: `Status`, `Context`, `Decision`, `Consequences`.
- Add `Options Considered`, `Risks`, `Tradeoffs`, `Assumptions`, or `Gotchas` only when useful.
- Ask the user to confirm the destination before creating the file.
- Default directory: `docs/adr/`.

## Workflow

1. Extract the single decision future agents need.
2. Propose `docs/adr/YYYY-MM-DD-<slug>.md` and ask for confirmation or override.
3. After confirmation, write markdown with YAML frontmatter.
4. Update `AGENTS.md` only if the user explicitly wants durable project rules captured there.

## Format

```yaml
---
title: Short decision title
description: One-line summary
date: YYYY-MM-DD
slug: short-hyphenated-topic
status: proposed | accepted | superseded | deprecated
tags:
  - short-tag
related_paths:
  - path/when/useful
---
```

```md
## Status

Proposed | Accepted | Superseded | Deprecated

## Context

## Decision

## Consequences
```

## Constraints

- Do not invent decisions.
- Do not turn the ADR into a changelog or command history.
- Omit empty optional sections.
