# Updating the TanStack Form Skill

Use this file as the complete maintenance prompt for
`.agents/skills/tanstack-form/`. When asked to update the skill, read this file
first, recrawl every required source, reconcile the findings with every skill
file, and update this runbook as part of the same change.

Do not use this runbook during ordinary form implementation.

## Current Snapshot

- Last reviewed: 2026-07-27
- Documentation channel: TanStack Form v1, `latest`
- Package snapshot: `@tanstack/react-form` 1.33.2
- Framework focus: React and React Native
- Source policy: official TanStack, W3C WAI/WCAG, MDN, and React Native
  documentation

The `latest` documentation URL is moving. Treat the review date and package
version as a snapshot, not a compatibility promise. Inspect the package version
installed by the consuming repository before retaining or changing
version-sensitive advice.

## Update Goals

1. Preserve a compact `SKILL.md` that routes agents to focused references.
2. Keep API guidance correct for current TanStack Form while recording
   version-sensitive behavior.
3. Keep accessibility guidance grounded in authoritative sources rather than
   treating upstream demos as production templates.
4. Keep the skill portable and standalone. Do not add dependencies on another
   skill, repository-specific UI system, or project convention.
5. Keep examples summarized as decisions and caveats; do not copy upstream
   walkthroughs wholesale.

## Required TanStack Documentation

Visit every canonical page. If the rendered page fails, retry its plain Markdown
representation by appending `.md`, then verify against the corresponding file in
the official TanStack Form repository.

### Guides

- https://tanstack.com/form/latest/docs/framework/react/guides/basic-concepts
- https://tanstack.com/form/latest/docs/framework/react/guides/validation
- https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation
- https://tanstack.com/form/latest/docs/framework/react/guides/async-initial-values
- https://tanstack.com/form/latest/docs/framework/react/guides/arrays
- https://tanstack.com/form/latest/docs/framework/react/guides/form-groups
- https://tanstack.com/form/latest/docs/framework/react/guides/linked-fields
- https://tanstack.com/form/latest/docs/framework/react/guides/reactivity
- https://tanstack.com/form/latest/docs/framework/react/guides/listeners
- https://tanstack.com/form/latest/docs/framework/react/guides/custom-errors
- https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling
- https://tanstack.com/form/latest/docs/framework/react/guides/ui-libraries
- https://tanstack.com/form/latest/docs/framework/react/guides/focus-management
- https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
- https://tanstack.com/form/latest/docs/framework/react/guides/react-native
- https://tanstack.com/form/latest/docs/framework/react/guides/ssr
- https://tanstack.com/form/latest/docs/framework/react/guides/debugging
- https://tanstack.com/form/latest/docs/framework/react/guides/devtools

### Orientation and TypeScript

- https://tanstack.com/form/latest/docs/framework/react/quick-start
- https://tanstack.com/form/latest/docs/typescript

### Additional TanStack References Used by the Skill

- https://tanstack.com/form/latest/docs/framework/react
- https://tanstack.com/form/latest/docs/reference/classes/FieldApi
- https://tanstack.com/devtools/latest/docs/configuration

## Required React Examples

Start at the Simple example and enumerate the React examples exposed by its
navigation before using this saved list. Labels and slugs can drift.

- https://tanstack.com/form/latest/docs/framework/react/examples/simple
- https://tanstack.com/form/latest/docs/framework/react/examples/multi-step-wizard
- https://tanstack.com/form/latest/docs/framework/react/examples/array
- https://tanstack.com/form/latest/docs/framework/react/examples/large-form
- https://tanstack.com/form/latest/docs/framework/react/examples/dynamic
- https://tanstack.com/form/latest/docs/framework/react/examples/query-integration
- https://tanstack.com/form/latest/docs/framework/react/examples/standard-schema
- https://tanstack.com/form/latest/docs/framework/react/examples/tanstack-start
- https://tanstack.com/form/latest/docs/framework/react/examples/next-server-actions
- https://tanstack.com/form/latest/docs/framework/react/examples/remix
- https://tanstack.com/form/latest/docs/framework/react/examples/ui-libraries
- https://tanstack.com/form/latest/docs/framework/react/examples/field-errors-from-form-validators
- https://tanstack.com/form/latest/docs/framework/react/examples/devtools

For each example:

1. Open the documentation page and its official source directory at
   `https://github.com/TanStack/form/tree/main/examples/react/{slug}`.
2. Record its use case, important APIs, platform dependencies, and related
   references.
3. Identify demo shortcuts that require production hardening, especially labels,
   error relationships, announcements, stable array identity, pending feedback,
   server trust, and keyboard behavior.
4. Classify the URL as covered, redirected, removed, or inaccessible. Never
   silently omit a failure.

Also compare the official `examples/react/` directory with the linked navigation.
Record newly linked examples and notable unlisted examples. Add linked examples
to both this manifest and `references/examples-catalog.md`; mention useful
unlisted examples only when they materially improve the skill.

## Required Accessibility Sources

Recrawl these sources and update their URLs if an authority moves a page.

### W3C WAI Forms Tutorial

- https://www.w3.org/WAI/tutorials/forms/
- https://www.w3.org/WAI/tutorials/forms/labels/
- https://www.w3.org/WAI/tutorials/forms/instructions/
- https://www.w3.org/WAI/tutorials/forms/grouping/
- https://www.w3.org/WAI/tutorials/forms/validation/
- https://www.w3.org/WAI/tutorials/forms/notifications/
- https://www.w3.org/WAI/tutorials/forms/multi-page/

### WCAG 2.2 Understanding Documents

- https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html
- https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
- https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html

### MDN ARIA References

- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role

### React Native

- https://reactnative.dev/docs/accessibility
- https://reactnative.dev/docs/accessibilityinfo
- https://reactnative.dev/docs/textinput

## Coverage Matrix

| Source area | Primary destination |
| --- | --- |
| Quick start, basic concepts, async initial values | `references/foundations.md` |
| Validation, dynamic validation, custom errors | `references/validation-and-errors.md` |
| Reactivity and listeners | `references/state-reactivity-and-listeners.md` |
| Arrays, linked fields, form groups | `references/arrays-linked-fields-and-groups.md` |
| Form composition and UI libraries | `references/composition-and-ui-integration.md` |
| Submission handling, query integration, server failures | `references/submission-and-server-workflows.md` |
| Focus management and authoritative accessibility sources | `references/accessibility-and-focus.md` |
| SSR, TanStack Start, Next.js, Remix, React Native | `references/ssr-and-platforms.md` |
| Debugging and devtools | `references/debugging-and-devtools.md` |
| TypeScript guide and type-complexity guidance | `references/typescript.md` |
| All linked React examples | `references/examples-catalog.md` |
| Workflow, hard rules, routing, review checklist | `SKILL.md` |

## Update Procedure

### 1. Establish versions

- Determine the current stable `@tanstack/react-form` version from an official
  package source.
- Inspect the current TypeScript requirements and semver/type-change policy.
- If working for a consuming repository, separately record its installed version.
- Update the snapshot above only after completing the crawl.

### 2. Crawl and record

- Visit every URL in this file.
- Re-enumerate guides and examples from the current React documentation
  navigation.
- Deduplicate canonical URLs.
- Record pages that redirect, disappear, conflict, or cannot be fetched.
- Use official Markdown/source files as fallbacks, not third-party tutorials.

### 3. Diff concepts and APIs

Compare current sources with the skill for:

- added, removed, renamed, or deprecated options and methods;
- changed validator signatures, triggers, error shapes, or debounce behavior;
- state metadata and subscription recommendations;
- composition APIs and TypeScript performance guidance;
- submit metadata, server adapters, and schema transformation behavior;
- SSR state serialization and merge patterns;
- React Native differences;
- example navigation and production caveats;
- accessibility requirements or platform support changes.

When official pages disagree, prefer the current typed API and the most specific
guide, record the inconsistency, and avoid presenting uncertain behavior as a
hard rule.

### 4. Update the skill

- Keep `SKILL.md` concise and route details to references.
- Update every affected reference and its Sources section.
- Add migration notes when an existing recommendation becomes unsafe or invalid.
- Keep examples short, typed, and focused on the decision being explained.
- Preserve standalone portability and authoritative accessibility policy.
- Update `examples-catalog.md`, this manifest, the coverage matrix, review date,
  and package snapshot.
- Update this runbook whenever the navigation, source policy, or maintenance
  procedure changes.

### 5. Verify

- Format the entire skill directory with the repository's Markdown formatter.
- Validate YAML frontmatter and confirm the skill name matches its directory.
- Verify every relative Markdown link resolves.
- Confirm every required URL is accounted for with no duplicates.
- Confirm every currently linked React example is classified.
- Check code samples against the documented APIs and claimed package version.
- Audit the main workflow and hard rules against the updated references.
- Run a fresh-session skill-discovery smoke test.
- Inspect the final diff and confirm no unrelated file or skill was changed.

## Acceptance Checklist

- [ ] Every TanStack guide, quick-start, and TypeScript URL was visited.
- [ ] The Simple-page example navigation was re-enumerated.
- [ ] Every linked React example was visited and classified.
- [ ] The official React example directory was compared with the navigation.
- [ ] Every accessibility source was visited or its replacement recorded.
- [ ] Version-sensitive advice names its compatibility context.
- [ ] Removed and renamed APIs have migration guidance where necessary.
- [ ] Official inconsistencies are recorded rather than silently guessed.
- [ ] Accessibility advice remains stricter than demo markup where authoritative
      sources require it.
- [ ] All local links, frontmatter, formatting, and source sections pass review.
- [ ] The review date, package snapshot, manifest, coverage matrix, and this
      checklist reflect the completed update.
