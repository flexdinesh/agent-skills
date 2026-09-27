# TypeScript and JavaScript input contracts

**Read when:** changing TypeScript contracts or parsing untrusted input in JavaScript/TypeScript.

**Policy status:** The ban on any, type assertions, and non-null assertions is skill policy; strictness and naming settings respect existing migration context.

## Module boundaries

Expose narrow module entry points; avoid barrels that export internals or introduce
cycles/side effects. Use separate modules where dependency isolation is required;
a file split alone does not establish a boundary.

## Naming defaults

Where conventions are unresolved, use `camelCase` for values/functions and
`PascalCase` for types. Ordinary `const` bindings remain `camelCase`;
constant-case follows repository policy for semantic constants. These are
conventions, not TypeScript language requirements. TypeScript's contributor
guidelines are not a community-wide mandate.

For Node execution/lifecycle changes, also read [Node](node.md). Browser code
uses these type/input rules without requiring Node runtime guidance.

## `js-input-contracts`

**Establish runtime type evidence.**

**Apply:** TypeScript/JS consumes env, JSON, request payloads, files, or remote data.

**Problematic:** a generated static type is treated as JSON validation; missing
env is trusted; loose dictionaries hide malformed values or missing fields.

**Prefer:** parse untrusted input once at the I/O boundary with the installed
schema/parser facility; pass validated domain contracts into application code.
Use strict TypeScript and explicit narrowing. No `any`, type assertions, or
non-null assertions. Consider indexed-access and exact-optional settings in the
repo's migration context. Define missing/null/default distinctions explicitly.
Represent mutually exclusive outcomes with a discriminated union, for example:

```ts
type ImportResult =
  | { readonly kind: "imported"; readonly count: number }
  | { readonly kind: "rejected"; readonly reason: string };

function describeImport(result: ImportResult): string {
  if (result.kind === "rejected") {
    return result.reason;
  }
  return `${result.count} records imported`;
}
```

**Exception:** a parser boundary can accept `unknown` until it establishes evidence;
do not replace it with a fabricated domain type. TS-only improvements do not require
an unrequested wholesale JS-to-TS migration. Apply runtime parsing to JS too.

**Verify:** malformed/missing/extra values as appropriate, invalid env, nullability,
and incompatible remote responses. Run installed type checks without escape hatches.

## Sources

- [TypeScript strict mode](https://www.typescriptlang.org/tsconfig/strict.html)
- [Indexed access](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
- [Optional property semantics](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [Google JS identifier names and constants](https://google.github.io/styleguide/jsguide.html#naming)
- [TypeScript contributor naming guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines#names)
