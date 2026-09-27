# Node runtime and native TypeScript

**Read when:** changing Node execution, async I/O, streams, shutdown, or CLI runtime setup.

**Policy status:** Runtime behavior is version-sensitive. Native TypeScript on Node 26 is a fallback for undecided JS CLI stacks.

## Native TypeScript CLI execution

For an undecided JS CLI stack, use TypeScript running natively on
Node 26. Pin a consistent local/CI runtime policy. Use erasable syntax, explicit
`.ts` imports, `import type`, and deliberate module format. Native Node ignores
`tsconfig.json`; keep typechecking separate and avoid enums, parameter properties,
and TS-only path aliases. No `any`, type assertions, or non-null assertions.

Illustrative native check configuration; preserve compatible repo settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

For ESM `.ts`, set `"type": "module"`. Commands can directly run
`node src/main.ts`, applicable `node --test` TS tests, and `tsc --noEmit`.

Native execution strips types without checking them. For consumer installation
or npm output, read [Node distribution](node-cli-distribution.md); npm installation
requires emitted JS. Retain an established supported runtime/build approach
unless migration is requested. Apply [TypeScript rules](typescript.md) to typed
code and untrusted input.

## `node-async-lifecycle`

**Bound and await asynchronous work.**

**Apply:** Node servers/workers, async CLI operations, streams, or remote calls.

**Problematic:** one unbounded `Promise.all` launches work for every input record;
errors disappear; synchronous request-path work blocks unrelated clients; shutdown
exits while writes remain pending.

**Prefer:** own awaited work and rejection handling; bound fan-out, input sizes,
queue depth, and expensive operations. Use cancellation/deadlines supported by
the actual client API, not merely an unused AbortSignal. Respect stream backpressure.
Define shutdown/drain behavior for servers, workers, timers, and pools. Separate
retryable failures from permanent failures and make retry-sensitive mutations safe.

**Exception:** synchronous startup or small one-shot file operations can be fine.
Parallel independent operations are useful within a bounded workload; do not force
serial execution. Framework error/shutdown hooks can satisfy ownership.

**Verify:** rejection, timeout, partial failure, overload, interruption, and cleanup.
Check that bounded processing limits simultaneous work and gives honest results;
avoid swallowing failed records while reporting total success.

## Sources

- [Node event-loop guidance](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node cancellation APIs](https://nodejs.org/api/globals.html#class-abortcontroller)
- [Node TypeScript execution and dependency restrictions](https://nodejs.org/api/typescript.html)
