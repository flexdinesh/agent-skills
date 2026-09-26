# Testing

Read when designing dependency seams, adding behavioral coverage, or verifying
new/refactored components, Hooks, providers, and page trees.

## `test-public-behavior`

**Apply:** behavior depends on React state, composition, interactions, or recovery.

**Problematic:** snapshots are the only coverage; tests inspect private component
state, assert effect invocation counts, or mock `useDraft` so provider wiring
cannot fail. A Hook test replaces the page test needed to catch ownership errors.

**Prefer:** use the installed compatible test stack. Test components through
accessible rendered output and realistic user interaction. Test a Hook through
its public actions/output when that is its meaningful contract; prefer a real
consumer for integration behavior. Test providers with actual consumers and
important pages with their provider/router/data tree. Use async assertions rather
than arbitrary sleeps and flush updates with the stack's supported tools.

Using the exports from the provider reference, this React Testing Library example
checks sibling state sharing across the visual boundary. Adapt runner setup to
the repository; this example assumes Vitest and a DOM test environment.

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test } from 'vitest'
import { DraftWorkspace } from './draft-workspace'

afterEach(cleanup)

test('preview reflects edits from its sibling editor', async () => {
  const user = userEvent.setup()
  render(<DraftWorkspace />)
  await user.type(screen.getByRole('textbox', { name: 'Draft' }), 'Hello')
  const preview = screen.getByRole('complementary', { name: 'Preview' })
  expect(preview.textContent).toBe('Hello')
})
```

For two instances, query within each named workspace and check that editing one
does not alter the other. Avoid requiring test-only state setters in production.

**Exception:** pure domain calculations can have direct unit tests. Focused Hook
tests can complement page/provider tests; not every simple component needs a new
test. Snapshots can supplement explicit behavior assertions.

**Verify:** changing internal implementation while preserving behavior does not
break tests; removing provider sharing or recovery does break relevant tests.

## `test-dependency-seams`

**Apply:** an external dependency must succeed, fail, or resolve in a chosen order.

**Problematic:** module mocks replace unrelated imports or the actual React
ownership path; test doubles return data that violates production contracts.

**Prefer:** typed dependency injection through a prop, provider, or data adapter,
or network interception at the real request boundary. Supply fresh query clients
and independent stores per test. Use deferred promises to control races rather
than elapsed time. Keep failures realistic, including status and parsing failures
when the HTTP boundary is under test.

**Exception:** use established repository seams rather than redesigning all
production dependencies for a single test. An injected rejecting loader proves
recovery, not HTTP status checking; test the I/O adapter separately if relevant.

**Verify:** doubles satisfy the same typed contract; tests exercise the real
provider, Hook, and error ownership whose behavior they claim to verify.

## `test-regression-scenarios`

Choose scenarios relevant to the change rather than adding a universal test
matrix to every task:

| Changed behavior | Meaningful scenario |
| --- | --- |
| State ownership | Shared consumers update together; independent owners stay independent. |
| Required provider | Missing provider gives a clear failure; valid tree works. |
| Component identity | Parent update retains edits/focus; deliberate entity change resets as specified. |
| List keys | Insert/remove/reorder preserves the correct row's draft and focus. |
| Effects/resources | Setup/cleanup/setup leaves one active resource; unmount releases it. |
| Async reads | A/B results and errors settle in either order; only current ownership wins. |
| Mutations | Failure retains draft; retry works; concurrent activation and newer edits are handled. |
| Error boundaries | Descendant failure shows the intended fallback; recovery retries the actual failed owner. |
| Page boundary | Direct load, client navigation, URL state, and history preserve intended behavior. |
| SSR | Deterministic hydration and request isolation; browser console has no new hydration errors. |
| Accepted reducer conversion | Valid transitions, coordinated updates, and reset invariants are preserved. |
| Performance change | Representative profile/network/bundle evidence; behavior still correct. |

Browser checks are appropriate when focus, layout, navigation, or hydration cannot
be established by the available unit environment. Use representative data and
the repository's existing harness. Do not install a new testing stack by default.

**Verification limits:** report failing tests honestly. A semantically correct
test exposing a real existing bug is valuable; do not weaken it merely to pass.
Do not claim the feature is verified if its relevant check failed. Distinguish
pre-existing failures from regressions with evidence where practical.

Lint and typechecking supplement tests, not replace them. Use compatible
`eslint-plugin-react-hooks` rules, including dependency, purity, identity, and
state-update diagnostics available in the installed version. Investigate a lint
finding's actual contract before mechanically rewriting legitimate code.

## Sources

- [Testing Library: Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [React Testing Library: Introduction](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library: user-event Introduction](https://testing-library.com/docs/user-event/intro/)
- [React: act](https://react.dev/reference/react/act)
- [React: eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks)
