# Effects and lifecycle

Read when adding effects, debugging loops or stale callbacks, or managing external
subscriptions and resources. Minimizing effects does not mean banning them.

## `effect-external-system`

**Apply:** every proposed or existing effect must have an identifiable purpose.

**Problematic:** effects calculate filtered data, mirror props, reset an entire
form after every refetch, or notify a parent about state the parent also stores.
These create redundant renders and competing owners.

**Prefer:** calculate values in render, update the owner in the initiating event,
or use a deliberate entity key for a full reset. Use an effect when React must
synchronize with an external system: a connection, timer, browser API, or widget.
Use existing loaders/cache libraries for fetching when available.

**Exception:** a necessary external synchronization can update state, including
async results and measured layout. Do not impose a blanket ban on setters inside
effects; investigate redundant synchronous derived-state updates specifically.

**Verify:** name the external system, setup conditions, and teardown conditions.
Removing the effect should remove synchronization, not merely a derived value.

## `effect-event-ownership`

**Apply:** work is triggered by a particular interaction rather than visibility
or a reactive external synchronization contract.

**Problematic:** setting `submitted` causes an effect to save; changing theme
then reruns the effect and saves again.

**Prefer:** perform submission in the event handler or a domain action called by
it. That action owns pending, error, and recovery behavior. Preserve the submitted
snapshot if the request should save exactly what the user submitted.

**Exception:** autosave is a real synchronization contract. Specify debounce,
stale-request handling, dirty-version tracking, cancellation, and retry instead
of treating every state change as an unconstrained submit event. Analytics tied
to visibility can belong in an effect if duplicate delivery is handled.

**Verify:** unrelated rerenders do not repeat user actions; failed actions remain
recoverable. Input changes during submission follow a deliberate draft contract.

## `effect-dependencies`

**Apply:** an effect references reactive props, state, functions, or objects.

**Problematic:** suppressing `exhaustive-deps` freezes a stale callback; a new
object dependency reconnects on every render; an effect updates state that
changes its own dependency and repeats forever.

**Prefer:** include actual reactive dependencies. Move effect-only object/function
creation inside the effect, hoist genuine constants, or change ownership to remove
unnecessary dependencies. Split independent synchronization processes. Use a
functional update when reading previous state only to calculate its replacement:

```tsx
import { useEffect, useState } from 'react'

export function useElapsedTicks(active: boolean) {
  const [ticks, setTicks] = useState(0)
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => {
      setTicks(previous => previous + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [active])
  return ticks
}
```

This counts callbacks, not precise wall-clock time; use an appropriate clock for
an actual elapsed-time contract. `ticks` is not a dependency because the effect
does not read it. Do not remove dependencies the effect really reads.

Inspect both links of a loop: the update and the dependency changed by that
update. Stabilizing identity alone may hide a bad state synchronization design.
Use version-supported Effect Events only for genuinely non-reactive effect logic;
they are not an escape hatch to hide values that should trigger synchronization.

**Exception:** intentionally stable external functions are valid dependencies.
An empty array is appropriate when setup has no reactive dependencies; it is not
a guarantee of a single lifetime invocation.

**Verify:** change every relevant input, exercise rapid updates, and check that
only the intended process restarts with current values. Run compatible lint rules.

## `effect-cleanup`

**Apply:** setup registers listeners, subscriptions, connections, timers, or
starts async work whose results may outlive its owner.

**Problematic:** listeners accumulate after navigation; old requests write into
new views; a ref flag skips setup after Strict Mode cleanup removed the resource.

**Prefer:** cleanup mirrors setup; unsubscribe, disconnect, clear timers, and
cancel or ignore stale work. Subscribe to external stores through their compatible
React adapter or `useSyncExternalStore` when appropriate instead of copying store
snapshots into local state. Keep snapshots cached/stable according to that API.

Effects run after commit and not during server rendering. Use layout effects only
when pre-paint layout work is necessary; account for SSR and avoid blocking paint
for ordinary synchronization.

**Exception:** a setup that acquires no resource may need no cleanup. A global
resource can intentionally outlive a component, but its separate owner must
manage its lifecycle. Do not use per-component refs as a substitute for that owner.

**Verify:** setup -> cleanup -> setup works in Strict Mode; unmount and changing
dependencies release old resources; there is one active subscription per owner.
Development replay itself is not a production loop or duplicate-submission bug.

## Sources

- [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React: useEffect](https://react.dev/reference/react/useEffect)
- [React: Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)
- [React: useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [Vercel: Put Interaction Logic in Event Handlers](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-move-effect-to-event.md)
