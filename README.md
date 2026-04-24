# Dinesh's agent skills

Personal collection of agent skills, installable via the [`skills`](https://github.com/vercel-labs/skills) CLI.

## Available skills

- `decision-log` — persist decisions, rationale, and tradeoffs from a session
- `gh-create-pr` — push branch and create a GitHub PR with `gh` CLI
- `git-commit` — stage and commit scoped to the current task
- `git-worktree` — create, inspect, and clean Git worktrees
- `opencode-plugin` — build plugins for OpenCode
- `plan-mode` — produce a decision-complete plan, read-only
- `review-changes` — review local diffs for bugs and risks
- `review-pr` — review a GitHub PR from a URL

## Install from remote

```bash
# GitHub shorthand
npx skills add flexdinesh/agent-skills

# Full URL
npx skills add https://github.com/flexdinesh/agent-skills

# List skills without installing
npx skills add flexdinesh/agent-skills --list

# Install a specific skill
npx skills add flexdinesh/agent-skills --skill plan-mode

# Install multiple skills
npx skills add flexdinesh/agent-skills --skill plan-mode --skill git-commit

# Install all skills non-interactively
npx skills add flexdinesh/agent-skills --all -y
```

## Install to `.agents/skills/` (agent-agnostic)

Install to `.agents/skills/` so every supported agent picks them up — including Claude Code, OpenCode, Codex, Cursor, and others. Most agents read from this shared path.

```bash
# Project scope (./.agents/skills/) — default
npx skills add flexdinesh/agent-skills

# Global scope (~/.agents/skills/)
npx skills add flexdinesh/agent-skills -g
```

## Install from a local directory

```bash
# Clone, then install from the local path
git clone https://github.com/flexdinesh/agent-skills
npx skills add ./agent-skills

# Install a single skill directly from its directory
npx skills add ./agent-skills/skills/plan-mode

# Install to global scope from local
npx skills add ./agent-skills -g
```

## Symlink vs copy

Default is symlink (recommended): single source of truth, easy to update. Use `--copy` if symlinks aren't supported on your system.

```bash
npx skills add flexdinesh/agent-skills --copy
```

## Update skills

```bash
# Update all installed skills (interactive scope prompt)
npx skills update

# Update a specific skill
npx skills update plan-mode

# Update multiple
npx skills update plan-mode git-commit

# Update only global or project scope
npx skills update -g
npx skills update -p

# Non-interactive (auto-detects scope)
npx skills update -y
```

Tip: if installed via symlink from a cloned local dir, `git pull` in the clone — agents reflect changes immediately, no `update` needed.

## Other commands

```bash
npx skills list              # show installed skills
npx skills remove plan-mode  # remove a skill
```

Full CLI reference: https://github.com/vercel-labs/skills
