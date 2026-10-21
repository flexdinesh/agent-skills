# Agent skills

Personal collection of agent skills, installable via the [`skills`](https://github.com/vercel-labs/skills) CLI.

## Invocation policy

Skills are manual-invocation only, with one exception: `gh-create-pr` also auto-invokes when the task calls for opening or updating a pull request. Otherwise, use a skill when the user explicitly invokes it by name, for example `$plan-mode` or `$review-changes`. Follow each skill's `SKILL.md` for its invocation rules.

## Available skills

- `engineering-patterns`: concrete engineering guidance with a minimal catalog and references loaded on demand
- `autopilot` — plan, implement, validate, push, create a PR, and return to main
- `execute-plan` — implement a planned set of changes, making writes and edits
- `gh-create-pr` — push branch and create a GitHub PR with `gh` CLI (explicit or auto-invoked for PR work)
- `go-architecture` — audit, design, and refactor Go around ownership, composition, semantic contracts, and boundary tests
- `highvis` — C4 architecture maps and HTML feature stories with sync/async events, URLs, payloads, and responses
- `plan-mode` — produce a decision-complete plan, read-only
- `react-patterns` — write, audit, debug, and refactor React with deliberate state, composition, recovery, and performance
- `repo-patterns` — audit, write, and conform repo boundaries, React ownership/composition/recovery, independent fixture runs, tooling, Docker images/Compose, data models, databases, REST contracts, CLI setup, manual stable CI releases, and automatic Go dev builds
- `review-changes` — review local diffs for bugs and risks
- `ts-guidance` — example-driven TypeScript guidance for type safety, input parsing, and explicit domain contracts

Ported from [pstack](https://github.com/cursor/plugins/tree/main/pstack) and rewritten as standalone, agent-agnostic skills (see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)):

- `architect`: sketch types and module structure from parallel design candidates, then implement against the chosen sketch
- `correct`: make repeated agent mistakes impossible via architecture, types, lints, and tests
- `how`: explain subsystem architecture and runtime flow
- `interrogate`: adversarial multi-reviewer code review with a lead verdict
- `recall`: rebuild recent working context from chat history, live state, and the shared record
- `unslop`: cut AI tells from writing
- `verify`: prove finished work against the real artifact, not a proxy
- `why`: cited, confidence-tiered investigation of why code has its shape

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
npx skills add flexdinesh/agent-skills --skill plan-mode --skill review-changes

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
npx skills update plan-mode review-changes

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

Full CLI reference: <https://github.com/vercel-labs/skills>
