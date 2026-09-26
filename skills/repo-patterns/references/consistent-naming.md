# Consistent naming

Read when choosing identifiers, vocabulary, file/package names, or changing names
that consumers depend on. Consistency follows semantic meaning and applicable
language conventions; a mixed repository need not use one casing scheme.

## `naming-local-conventions`

**Apply:** introducing identifiers, files, packages, or public contracts.

**Problematic:** imposing JS `customerId` on Go code that consistently uses
`customerID`; choosing a new filename style without inspecting peer modules.

**Prefer:** inspect explicit repo policy, existing lint rules, and representative
peers first. Preserve framework/protocol requirements and supported external
contracts. Follow documented repo conventions where compatible; otherwise use a
coherent local pattern, then language defaults. If peers conflict, identify the
drift and choose/document one pattern for the scoped work.

Use familiar abbreviations; expand obscure ones. Match name detail to scope and
reader context. A short loop index or Go receiver can be clear locally; exported
names need enough context for their consumers. JS `customerId`, Go `customerID`,
and protobuf `customer_id` can consistently represent the same concept.

**Exception:** generated names and required framework spellings are not reasons
to rename maintained source or generated outputs indiscriminately. User and
consuming-repository instructions take precedence over these defaults.

**Verify:** compare new names with peer declarations, imports, and existing checks.
Record conventions only where ambiguity or repeated decisions justify it. Use
existing linting for mechanical rules; inspect meaning manually. Do not install
a new tooling stack solely to enforce spelling.

## `naming-domain-vocabulary`

**Apply:** concepts cross modules, storage, APIs, UI, or documentation.

**Problematic:** one entity alternates between `customer`, `client`, and `account`
without a semantic distinction; distinct domain concepts acquire one shared name.

**Prefer:** use one term per concept within its domain and distinct terms for
different concepts. Carry the vocabulary through contracts and consumers using
idiomatic spellings. Keep a small glossary where ambiguity warrants one.

**Exception:** separate domains and external systems may legitimately use different
terms. Preserve those meanings and make translations explicit at their boundary;
do not unify models merely because their fields or names resemble one another.
See [representations](data-models-and-migrations.md#model-representations).

**Verify:** trace a concept through its producer and consumers. Explain each
translation before reporting synonym drift or proposing a rename.

## `naming-behavior`

**Apply:** functions, operations, types, and named events.

**Problematic:** `sendEmail` only queues delivery; `validateOrder` parses and returns
an order while peer validators only report validity; `OrderPlaced` fires before
the order is successfully placed.

**Prefer:** nouns for entities and values; verbs for actions. Name observable
behavior, including meaningful distinctions between parsing and validation,
scheduling and completion, and commands and completed domain events. Prefer
`enqueueEmail` for queuing and `OrderPlaced` for a completed domain action.
Confirm behavior before choosing the name.

**Exception:** language and framework idioms apply: Go getters ordinarily omit
`Get`; predicates, getters, constructors, and framework callbacks need not follow
one verb grammar. Do not impose universal `get`/`find`/`fetch` meanings. Document
those distinctions where the repository actually uses them.

**Verify:** inspect return values, absence/error behavior, side effects, and actual
completion. Names suggest contracts; they do not establish them. Trace evidence
before classifying a misleading name as a behavioral defect.

## `naming-shape-and-units`

**Apply:** fields, options, collection variables, and numeric quantities.

**Problematic:** `orders` contains a count; a bare numeric `timeout` means seconds
to its producer and milliseconds to its consumer; `isNotDisabled` obscures a
simple enabled condition.

**Prefer:** singular entities, plural collections, readable boolean conditions,
and explicit units for ambiguous scalar quantities. Distinguish IDs from objects,
counts from collections, durations from timestamps, and maps from lists where it
helps callers. Examples: `order`, `orders`, `orderId`, `orderCount`, `ordersById`,
`timeoutMs`, `payloadBytes`. Prefer affirmative predicates when the domain permits.
Specify currency and scale for money in its type/contract rather than assuming cents.

**Exception:** meaningful states such as `disabled` are valid. JS predicates may
use `isReady`, `hasAccess`, or `canRetry`; API boolean fields may omit prefixes.
Follow the established contract. Typed durations need not carry scalar unit
suffixes. Do not rename wire fields solely to match local identifier style.

**Verify:** trace conversions, serialization, and consumers. Verify actual unit or
shape mismatches at the affected boundary. A missing suffix alone proves no bug.

## `naming-discoverability`

**Apply:** packages, modules, filenames, and exports.

**Problematic:** unrelated capabilities accumulate in `common` or `misc`; equivalent
test files use arbitrary naming patterns; `billing.BillingInvoice` repeats context.

**Prefer:** name the owned capability and keep peer file/test names predictable.
Read names at call sites: `billing.Invoice` provides context without repetition.
Reuse canonical export names in consumers. Keep meaningful distinctions such as
`InvoiceRow` and `InvoiceResponse` where their contracts differ. A rename alone
cannot repair mixed ownership; see [cohesion](boundaries-and-layout.md#boundary-cohesion).

**Exception:** a generic name can serve a cohesive small scope. Framework filenames,
test-discovery conventions, and generation inputs take precedence. Aliases can
resolve collisions or translate domain terms. Do not ban default exports solely
for naming consistency or impose one universal JS filename case.

**Verify:** inspect qualified names, call sites, and imports. After renames check
exact path case, dynamic imports, test discovery, and generation inputs as relevant.
Follow the existing file grammar, including role suffixes where already meaningful.

## `naming-compatible-change`

**Apply:** conforming existing names, particularly public or persisted names.

**Problematic:** a cosmetic API field rename breaks clients; an environment key
changes without updating deployment config; applied migrations are rewritten to
make database names consistent.

**Prefer:** scope private renames to the coherent change. Inventory consumers of
exports, import paths, API fields, CLI options, config keys, database names, and
event types before changing them. Apply the existing compatibility/migration
policy; retain adapters or deprecated aliases where consumers cannot update
together. Update source definitions and regenerate affected outputs.
See [HTTP evolution](http-contracts.md#http-contract-evolution) and
[compatible rollout](data-models-and-migrations.md#migration-compatible-rollout).

**Exception:** coordinated consumers may change atomically when their lifecycle
permits it. Do not require aliases without a compatibility need. Do not perform
a blanket rename campaign solely to match these defaults.

**Verify:** affected builds/typechecks and appropriate contract or migration checks.
Preserve applied migration history. Add behavioral tests for actual regression
risk; avoid spelling-only tests. Separate policy/readability findings from traced
contract breakage and demonstrated bugs.

## Language defaults

Use only where the repository has no applicable convention or requirement.

| Context | Default | Qualification |
| --- | --- | --- |
| JS/TS | `camelCase` values/functions; `PascalCase` types | Common conventions, not TypeScript language requirements |
| JS constants | Follow repo convention for semantic constants; ordinary `const` bindings use `camelCase` | `const` alone does not require constant-case |
| React | Capitalized component identifiers; Hooks start `use` followed by a capital letter | Framework semantics; filenames remain repo policy |
| Go | Export-aware `MixedCaps`/`mixedCaps`, consistent initialisms, short lowercase packages | No JS constant casing or getter-prefix requirement |
| Python, if present | PEP 8 naming with existing-library exceptions | Do not impose its casing on other languages |
| API/DB/config | Existing schema, protocol, and consumer conventions | No universal singular/plural SQL table policy |

## Sources

- [PEP 8 naming and internal consistency](https://peps.python.org/pep-0008/#naming-conventions)
- [Google C++ naming consistency](https://google.github.io/styleguide/cppguide.html#Naming)
- [Google JS identifier names and constants](https://google.github.io/styleguide/jsguide.html#naming)
- [TypeScript contributor naming guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines#names)
- [Effective Go names, getters, and interfaces](https://go.dev/doc/effective_go#names)
- [Go initialisms](https://go.dev/wiki/CodeReviewComments#initialisms)
- [Go package names and qualified context](https://go.dev/blog/package-names)
- [Microsoft method, property, and event naming](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/names-of-type-members)
- [AIP-140 field vocabulary, shape, and boolean naming](https://google.aip.dev/140)
- [AIP-141 quantities and units](https://google.aip.dev/141)
- [AIP-180 compatibility and renames](https://google.aip.dev/180)
- [React component naming](https://react.dev/learn/your-first-component#step-2-define-the-function)
- [React Hook naming](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use)

Semantic clarity and consistency recur across these guides; exact spellings vary.
TypeScript's contributor guide explicitly is not a community-wide mandate.
Domain-event tense, cross-boundary vocabulary, and scoped rename discipline are
skill policies informed by these sources, not claims of universal consensus.
