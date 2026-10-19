# Incident and postmortem context

Append this to an investigator's playbook when the target code looks defensive. Run incident-flavored queries inside your own source only.

- **Source control.** Commits with messages like "fix for incident", "add defensive check", or "revert" followed by "re-apply with..." are strong signals.
- **Issue tracker.** Tickets labeled `incident`, `sev-*`, `postmortem-action-item`, `reliability`.
- **Long-form documents.** Postmortems and runbooks that name the target code, its symbols, or its error strings.
- **Team chat.** Incident and severity channels around the dates the target code was added.
- **Observability.** Incident records and alert history in the window before the change.
- **Error tracking.** Issues whose spike and resolution bracket the change.
