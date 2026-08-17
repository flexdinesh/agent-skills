---
name: ts-guidance
description: "Provide opinionated, example-driven guidance for writing TypeScript that preserves type evidence and explicit domain contracts. Use only when explicitly invoked."
---

# TypeScript Guidance

Use this skill when explicitly asked for TypeScript code guidance. Prefer code that
preserves known type evidence, parses untrusted values at I/O boundaries, and uses
named domain contracts instead of broad escape hatches. Treat these rules as an
iterable starting point and follow the consuming repository's instructions when
they are more specific.

## Rules

- `no-chained-type-assertions` — do not fabricate evidence with nested assertions.
- `no-conditional-empty-object-spread` — do not hide property omission behind `{}`.
- `no-known-value-widening` — do not discard the precise type of a known value.
- `no-module-mocking` — replace dependencies through real seams, not module mocks.
- `no-object-parameters` — accept a named input contract instead of `object`.
- `no-reflect-apply` — call typed functions directly.
- `no-reflect-get` — use typed property access.
- `no-runtime-typeof` — parse external values instead of narrowing them ad hoc.
- `no-shape-in-symbol-names` — name symbols for their domain role, not their shape.
- `no-unknown-parameters` — parse inputs before passing them into application code.
- `no-unknown-returns` — return parsed domain values instead of `unknown`.
- `no-unknown-type-aliases` — do not conceal `unknown` behind a type alias.
- `no-unsafe-dictionary-type` — give dictionary values a concrete contract.
- `no-widen-then-assert` — do not erase a known type and assert it back later.
- `require-safety-comment-for-type-assertion` — justify every necessary assertion.

## `no-chained-type-assertions`

Chained assertions manufacture type evidence. Keep the original precise type or
parse untrusted input once at its boundary.

**Don't**

```ts
const user = input as object as User;
```

**Do**

```ts
const user = UserSchema.parse(input);
```

Const assertions are not unsafe type-narrowing evidence and are outside this rule.

## `no-conditional-empty-object-spread`

Make conditional property assignment visible instead of spreading an empty object
to omit a field.

**Don't**

```ts
const options = {
  ...(timeout !== undefined ? { timeout } : {}),
};
```

**Do**

```ts
interface RequestOptions {
  timeout?: number;
}

const options: RequestOptions = {};

if (timeout !== undefined) {
  options.timeout = timeout;
}
```

## `no-known-value-widening`

Do not replace the inferred type of a known value with a broader annotation. Use
`satisfies` when the value must be checked against a wider contract.

**Don't**

```ts
const handlers: Record<string, Handler> = {
  start: startHandler,
};
```

**Do**

```ts
const handlers = {
  start: startHandler,
} satisfies Record<string, Handler>;
```

An empty accumulator can intentionally use a dictionary contract. A named owner
contract is also appropriate when it describes the value precisely.

## `no-module-mocking`

Test through a real dependency seam so the replacement follows the same contract
as production code.

**Don't**

```ts
vi.mock("./user-store");
```

**Do**

```ts
const store = new InMemoryUserStore();
const service = new UserService(store);
```

## `no-object-parameters`

The `object` type says almost nothing about what a function needs. Accept a named
type owned by the caller or domain.

**Don't**

```ts
function save(value: object) {}
```

**Do**

```ts
interface User {
  readonly id: string;
}

function save(user: User) {}
```

## `no-reflect-apply`

Use an ordinary typed call so TypeScript can check the arguments and return value.

**Don't**

```ts
const total = Reflect.apply(add, undefined, [1, 2]);
```

**Do**

```ts
const total = add(1, 2);
```

If dispatch is genuinely dynamic, put it behind a named interface.

## `no-reflect-get`

Use direct property access when the property is known. Parse dynamic input into a
domain type before reading it.

**Don't**

```ts
const name = Reflect.get(user, "name");
```

**Do**

```ts
const name = user.name;
```

## `no-runtime-typeof`

A `typeof` check narrows a representation without proving its domain contract.
Parse external input at the I/O boundary instead.

**Don't**

```ts
if (typeof input === "string") {
  useName(input);
}
```

**Do**

```ts
const name = NameSchema.parse(input);
useName(name);
```

Schema-free repositories may explicitly allow `typeof` inside type predicate and
assertion functions. That exception must be a deliberate repository decision.

## `no-shape-in-symbol-names`

`shape` describes structure, not ownership or purpose. Name the symbol for its
domain role.

**Don't**

```ts
interface UserShape {
  name: string;
}
```

**Do**

```ts
interface UserInput {
  name: string;
}
```

## `no-unknown-parameters`

Application functions should receive parsed domain values, not force every caller
to rediscover how to narrow `unknown`.

**Don't**

```ts
function handle(input: unknown) {}
```

**Do**

```ts
const user = UserSchema.parse(request.body);
handle(user);

function handle(user: User) {}
```

A parameter named `cause` may use `unknown` when enriching an error.

## `no-unknown-returns`

Do not make callers parse a function's result. Parse at the owning boundary and
return a meaningful domain type.

**Don't**

```ts
function loadUser(): unknown {
  return response.body;
}
```

**Do**

```ts
function loadUser(): User {
  return UserSchema.parse(response.body);
}
```

This applies to asynchronous contracts too: return `Promise<User>`, not
`Promise<unknown>`.

## `no-unknown-type-aliases`

An alias does not make `unknown` safer. Keep the uncertainty visible at the parsing
boundary, then produce a concrete domain value.

**Don't**

```ts
type ExternalValue = unknown;
```

**Do**

```ts
declare const input: unknown;
const user = UserSchema.parse(input);
```

## `no-unsafe-dictionary-type`

A dictionary must tell callers what each value contains. Use an owner- or
schema-derived value type and parse external payloads before insertion.

**Don't**

```ts
type Metadata = Record<string, unknown>;
```

**Do**

```ts
type MetadataValue = string | number | boolean;
type Metadata = Record<string, MetadataValue>;
```

Avoid direct dictionary value contracts based on `unknown`, `any`, `object`, `{}`,
or unions and aliases that contain those escape hatches.

## `no-widen-then-assert`

Do not erase known type evidence in a local binding and recreate it later with an
assertion. Preserve the precise type through the whole flow.

**Don't**

```ts
const loaded: User = loadUser();
const stored: unknown = loaded;
const user = stored as User;
```

**Do**

```ts
const user: User = loadUser();
useUser(user);
```

## `require-safety-comment-for-type-assertion`

Prefer removing assertions. When one is necessary, place a specific `SAFETY:`
comment immediately before it and state the invariant TypeScript cannot express.

**Don't**

```ts
const userId = value as UserId;
```

**Do**

```ts
// SAFETY: parseUserId validated the identifier before branding it.
const userId = value as UserId;
```

Const assertions such as `["open", "closed"] as const` do not need a safety
comment.
