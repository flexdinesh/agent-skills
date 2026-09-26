# Providers and composition

Read when app state is drilled through the tree, reusable pieces need shared
behavior, or context contracts and instance lifetimes are unclear.

## `provider-scope`

**Apply:** multiple distant consumers need the same app/feature state instance.

**Problematic:** `App -> Layout -> Sidebar -> AccountMenu` forwards account state
and actions through components that do not use them. Alternatively, one root
context includes account, theme, every page's draft, and live pointer position.

**Prefer:** app-domain providers such as account and theme near the root, composed
in an application provider entry. Page/feature providers live at their useful
common boundary. Keep unrelated domains separate and order dependent providers
so consumers are below their dependencies.

Use existing cache/router/form providers for their data. Do not copy server
cache results into app context or replace a working store merely to use context.
An external store can be provided through context while its own selector hooks
subscribe consumers to data.

**Exception:** ordinary component inputs belong in props. Children composition
can eliminate forwarding without context. Several levels of props alone do not
prove a violation; establish app ownership and unnecessary intermediaries.

**Verify:** all consumers reach the intended provider, domain state persists for
its intended lifetime, and page drafts reset without resetting app identity.

## `provider-consumer-contract`

**Apply:** a provider is required for a named consumer hook.

**Problematic:** dummy default actions silently do nothing outside a provider;
consumers assert a nullable value is present; UI depends on the provider's
storage or networking implementation.

**Prefer:** a nullable context, an explicit missing-provider error, and a typed
domain contract. This original example uses React 18-compatible provider syntax:

```tsx
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface DraftContextValue {
  text: string
  changeText: (text: string) => void
}

const DraftContext = createContext<DraftContextValue | null>(null)

function useDraftState() {
  const [text, setText] = useState('')
  function changeText(nextText: string) {
    setText(nextText)
  }
  return { text, changeText }
}

export function DraftProvider({ children }: { children: ReactNode }) {
  const draft = useDraftState()
  return <DraftContext.Provider value={draft}>{children}</DraftContext.Provider>
}

export function useDraft() {
  const draft = useContext(DraftContext)
  if (draft === null) {
    throw new Error('useDraft requires DraftProvider')
  }
  return draft
}

export function DraftInput() {
  const { text, changeText } = useDraft()
  return (
    <label>
      Draft
      <textarea value={text} onChange={event => changeText(event.target.value)} />
    </label>
  )
}

export function DraftPreview() {
  const { text } = useDraft()
  return <p>{text}</p>
}
```

Provider, hook, and UI may live in separate files to fit Fast Refresh conventions.
The provider owns one behavior instance; consumers call `useDraft`, not
`useDraftState`. Return semantic actions rather than requiring consumers to know
state structure. A state/actions/meta grouping is optional, not a required wrapper
for every small contract. Assess value identity when optimizing a real hot path.

**Exception:** a meaningful optional context default is valid, such as a default
theme. Do not throw when absence is intentionally supported.

**Verify:** a required consumer outside its provider fails clearly; consumers
inside it share updates; no unsafe narrowing is needed.

## `composition-provider-boundary`

**Apply:** stateful reusable pieces need custom layout or sibling consumers.

**Problematic:** draft state is trapped inside `DraftEditor`; a sibling preview
uses copied state updated by an effect, or reads an imperative ref for normal UI.

**Prefer:** separate behavior sharing from visual containment. Using the exports
above, callers can compose the exact pieces they need:

```tsx
import type { ReactNode } from 'react'
import { DraftInput, DraftPreview, DraftProvider } from './draft'

function DraftFrame({ children }: { children: ReactNode }) {
  return <section aria-label="Draft editor">{children}</section>
}

export function DraftWorkspace() {
  return (
    <DraftProvider>
      <DraftFrame>
        <DraftInput />
      </DraftFrame>
      <aside aria-label="Preview">
        <DraftPreview />
      </aside>
    </DraftProvider>
  )
}
```

Named exports and a compound namespace are both valid. Ordinary portals preserve
React context even when DOM placement differs; a separate React root does not.
Compound components still need correct accessible relationships and interaction.

**Exception:** simple controls do not need compound APIs. Controlled props remain
useful when the caller is the intentional owner.

**Verify:** sibling controls and previews use one owner without synchronization
effects; changing layout does not accidentally change ownership or lose edits.

## `composition-independent-instances`

**Apply:** multiple instances or nested overrides can coexist.

**Problematic:** a module-level mutable draft makes all editors share one state;
provider keys change on every keystroke; nesting accidentally shadows the intended
owner. Module-level request state can also leak between SSR users.

**Prefer:** instantiate behavior inside each provider, document intentional
nesting, and keep provider identity stable. If identity must reset when changing
entities, use a deliberate entity key and explain which state it discards.
Initialize request-owned server state per request, never in mutable shared module
variables.

**Exception:** an intentionally shared application instance is valid. Stable
module constants are not mutable request state.

**Verify:** editing instance A leaves B unchanged; intended consumers share A;
nested providers use the nearest owner; entity changes preserve or reset state
according to the contract. Test SSR request isolation when applicable.

## Sources

- [React: Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React: useContext](https://react.dev/reference/react/useContext)
- [React: createPortal](https://react.dev/reference/react-dom/createPortal)
- [Vercel: Use Compound Components](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/architecture-compound-components.md)
- [Vercel: Define Generic Context Interfaces](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/state-context-interface.md)
