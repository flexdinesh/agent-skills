# Web and React/Vite integration

**Read when:** changing browser/server imports, app organisation, configuration, or state spanning API and UI owners.

**Policy status:** Framework requirements and repo integration policies. Component behavior and composition use the scoped [React reference](react.md); no companion invocation is required.

## Framework naming and layout

React component identifiers are capitalized; Hooks start with `use` followed
by a capital letter. Filenames follow repository/framework discovery conventions.
Pure helpers remain ordinary functions. Split rendering (`.tsx`) from
non-rendering logic (`.ts`) when useful. A single Vite app can retain its
normal root configuration and `src/`; no workspace is implied.

For React component/state/lifecycle decisions, read [React](react.md).
Use the deeper `react-patterns` companion only when invoked.

## `organisation-react-vite`

**Compose browser features.**

**Apply:** client React applications built with Vite.

**Problematic:** `App.tsx` owns every feature and fetch; global Hooks/types folders
couple unrelated views; importing an API client bundles a server store or secrets.

**Prefer:** let `main.tsx` mount the app and compose required providers; let the
app shell/routes compose features. Group a feature's views, behavior, API adaptation,
and tests together. Keep UI state with its nearest owner; lift it only to actual
shared consumers. Keep remote-data ownership distinct from local interaction state,
using the repo's existing fetching/cache approach. Extract a Hook for cohesive React
behavior or external synchronization, and an ordinary function for pure calculations.
Do not make every component acquire a Hook, view model, provider, or global store.

```text
src/main.tsx
src/App.tsx
src/features/orders/OrdersPage.tsx
src/features/orders/order-api.ts       # browser-safe boundary
src/features/orders/OrdersPage.test.tsx
src/components/Button.tsx              # genuinely shared UI primitive
```

Add local components/Hooks/pure helpers as responsibilities grow. Browser API
adapters own response parsing and wire mapping where required; server persistence
stays outside the browser import graph. Keep Vite config at the app root and public
environment values deliberate (`VITE_` values enter the client bundle). A development
proxy is not a production API deployment. Check production URL/asset configuration.

**Exception:** a small view can keep its state and API call together. Framework
routing/SSR rules take precedence where used. Feature folders do not require Redux,
a router, or a prescribed fetching library. Follow the installed framework's
entry points rather than introducing Vite files into another stack.

**Verify:** user-visible feature behavior, loading/error/retry paths, stale-response
or cancellation behavior where relevant, and actual production build/API wiring.
Confirm tests use browser-safe boundaries and shared changes verify affected views.

## `boundary-browser-server`

**Keep browser imports safe.**

**Apply:** web code consumes shared packages, generated clients, or config.

**Problematic:** a browser imports a server barrel that initializes a DB client;
an API secret appears in a `VITE_` variable or public runtime config.

**Prefer:** separate browser-safe entry points from server implementations and
credentials. Share transport contracts or generated clients. Keep server config
private, parse it at startup, and expose only intentional public settings. Follow
installed framework server/client and bundling rules.

**Exception:** isomorphic pure code is valid when dependencies and behavior work
in both environments. Type-only imports do not automatically make runtime exports
or the rest of a package safe.

**Verify:** build the actual browser target and inspect dependency/bundle inputs
for server-only modules and secrets. Do not print secret values as audit evidence.

## `web-state-boundaries`

**Keep state and recovery with their owner.**

**Apply:** React/web behavior spans route, component, cache, or async ownership.

**Problematic:** duplicate server state is copied into local state by effects;
late responses overwrite current results; fixture handling lives in components;
failure leaves the user unable to retry or preserve edits.

**Prefer:** one owner per state lifetime; use existing URL/router/cache facilities
for their responsibilities. Derive redundant values, use effects for external
synchronization, and guard stale responses. Keep fixture behavior at HTTP/composition
boundaries. Place recovery where the user can act without losing unrelated work.

Include endpoint/source identity, meaningful filters/scope, and data revision in
cache identity where they change the result. Forward cancellation to real I/O;
only retain previous results when their scope remains valid. Switching a local
dashboard to another server must not display the previous server's cached data.

**Exception:** legitimate effects and ordinary local state are not defects.
SSR, hydration, file routing, and client/server APIs depend on the installed
framework. Preserve those conventions when changing ownership. Component-level
state, lifecycle, and recovery use [React](react.md) when affected.

**Verify:** route changes, stale responses, failed loads/mutations, retry, edit
preservation, and relevant SSR/build behavior.

## Sources

- [React component decomposition](https://react.dev/learn/thinking-in-react)
- [React state ownership](https://react.dev/learn/sharing-state-between-components)
- [React custom Hook boundaries](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Redux feature locality; no Redux requirement implied](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
- [Vite public environment handling](https://vite.dev/guide/env-and-mode)
- [Node package entry points](https://nodejs.org/api/packages.html#package-entry-points)
- [Redux feature organization](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic)
- [Vite environment handling](https://vite.dev/guide/env-and-mode)
- [React effects and async races](https://react.dev/learn/you-might-not-need-an-effect)
- [Tokeninsights endpoint/scope-aware queries](https://github.com/flexdinesh/tokeninsights/blob/a9af7c20b14d0aa1fd98c68909acc43c3186dc25/packages/web/src/api.ts)
- [React component naming](https://react.dev/learn/your-first-component#step-2-define-the-function)
- [React Hook naming](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use)
