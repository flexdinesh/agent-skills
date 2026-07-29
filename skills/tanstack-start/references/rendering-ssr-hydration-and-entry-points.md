# Rendering, SSR, hydration, and entry points

Start owns full-document SSR, streaming, hydration orchestration, and the default
server/client entries. Router supplies the match tree, document-head model, and
hydration-aware React primitives.

## Default rendering path

1. Start receives a request.
2. Router matches routes and runs route lifecycle.
3. Start renders/streams the root HTML document.
4. `HeadContent` emits route head content.
5. `Scripts` emits hydration/client scripts.
6. The browser hydrates and Router owns later navigation.

Prefer the default entries. Override them only for a documented integration or
behavior that cannot be achieved through middleware, the root document, or
plugin configuration.

## Deterministic hydration

The server output and first browser render must match. Common mismatch sources:

- Current time, random values, unstable IDs.
- Browser locale/timezone.
- `window`, DOM, localStorage, matchMedia.
- Invalid HTML nesting.
- CSS-in-JS cache/order mismatch.
- Extensions or third-party scripts modifying HTML.
- Different server/client data or environment variables.

Use Router `ClientOnly`, `useHydrated`, or a post-hydration effect with a stable
fallback. Use `suppressHydrationWarning` only for a narrow, understood leaf.

## Selective SSR

Current Start supports route-level SSR values `true`, `false`, and
`'data-only'`. The option is declared on Router routes but interpreted by Start;
its functional form is server-only and stripped from the client.

Choose based on:

- SEO/crawler requirements.
- Time to content and server cost.
- Whether the component can run on the server.
- Whether route data should still load on the server.
- The quality of the fallback before client rendering.

Do not disable SSR globally to avoid fixing one browser-only component.
Descendants may only become more restrictive than their parent. Keep an
always-SSR root `shellComponent` when using selective SSR and verify how the
first disabled/data-only match uses pending UI and minimum pending timing.

## Deferred hydration

Defer hydration for non-critical UI only. Keep the children deterministic
because their SSR HTML remains the initial document. `Hydrate`'s `fallback` is
for later client mounting/suspension, not the initial SSR placeholder; the
current `split` default is `true`. Consider interaction readiness,
accessibility, layout shift, focus, and event replay. Critical
navigation/auth/payment UI should not become inert merely to improve a
synthetic metric.

Deferred hydration currently applies to the initial document; later client
navigation mounts normally. Nested boundaries hydrate parent-first, and a
`never` strategy intentionally leaves initial HTML static.

## Streaming

Streaming can improve progressive display but introduces phases:

- Headers and early shell.
- Pending route/data UI.
- Incremental chunks.
- Late error handling.
- Hydration coordination.

Test slow dependencies, cancellation, disconnection, and errors after the first
bytes. Do not confuse server-function streaming with full-document SSR
streaming; they are separate surfaces.

## Root head and scripts

Route `head` definitions and `HeadContent` belong to Router. Start renders them
in SSR. Keep `Scripts` in the body for hydration. Use route metadata rather than
imperative DOM mutation for titles, canonical links, stylesheets, preload links,
and structured metadata.

## Custom server entry

When overriding the server entry:

- Use the current `ServerEntry`/`createServerEntry` contract from
  `@tanstack/react-start/server-entry`.
- Delegate to the current default Start handler.
- Preserve request context, middleware, streaming, manifest, and error behavior.
- Keep runtime-specific code isolated.
- Verify adapters and platform bindings.

Current custom request context is passed as the second `handler.fetch` argument.

## Custom client entry

When overriding the client entry:

- Import `StartClient` from `@tanstack/react-start/client` and hydrate the
  document through the current Start contract.
- Preserve Start's hydration contract.
- Initialize client-only observability/providers before or around hydration as
  documented.
- Avoid rendering a second independent Router.
- Keep server and client provider order compatible.

## Do

- Keep full-document structure valid.
- Fix the source of hydration differences.
- Test SSR with slow/erroring data.
- Prefer defaults and keep overrides thin.
- Measure selective/deferred hydration against real UX.

## Don't

- Remove `Scripts`.
- Branch the first render with `typeof window`.
- Hide broad hydration warnings.
- Create a new router during hydration outside Start's contract.
- Assume streaming errors behave like pre-header errors.
- use Router's manual SSR setup inside Start.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/hydration-errors
- https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration
- https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
- https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point
- https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point
- https://tanstack.com/start/latest/docs/framework/react/guide/routing
