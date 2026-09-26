# repo-patterns: consistent naming proposal

Researched 2026-09-26. Implemented in
[repo-patterns](../skills/repo-patterns/SKILL.md) and its
[naming reference](../skills/repo-patterns/references/consistent-naming.md).
This brief preserves the proposal; examples and policies are original synthesis.

## Research conclusion

Established guides converge on readable, meaningful names and consistency within
an applicable context. They differ on casing, abbreviations, getter prefixes,
boolean prefixes, filenames, and enum members. Treat semantic guidance as broadly
supported; treat exact spellings as language conventions or explicit repo policy.
This comparison is not a survey measuring industry adoption.

PEP 8 prefers internal consistency for existing libraries and names reflecting
public usage rather than implementation. Google's C++ guide explicitly prioritizes
consistent naming over personal style preferences.
[PEP 8](https://peps.python.org/pep-0008/#naming-conventions),
[Google C++ naming](https://google.github.io/styleguide/cppguide.html#Naming)

At research time, the skill covered capability ownership, consistent commands,
resource naming, and compatible migrations. It lacked a general method for discovering
naming conventions and applying shared vocabulary across those concerns.

## Suggested rules

### `naming-local-conventions`

**Apply:** introducing identifiers, files, packages, or public contracts.

**Prefer:** inspect explicit repo policy, existing lint rules, and representative
peer modules before choosing names. Preserve required framework/protocol names and
supported external contracts. Apply documented repo conventions where compatible;
otherwise follow a coherent local pattern, then language defaults. In a mixed
repo, consistency means equivalent concepts with idiomatic spellings per language,
not identical casing everywhere. If peers conflict, identify the inconsistency
and choose/document one pattern for the scoped work; do not copy arbitrary drift.

**Examples:** JS `customerId`, Go `customerID`, and protobuf `customer_id` can
represent the same concept consistently. Go preserves initialisms such as `ID`
and `HTTP`; Google JS examples use `Id` and `Url`.
[Go initialisms](https://go.dev/wiki/CodeReviewComments#initialisms),
[Google JS naming](https://google.github.io/styleguide/jsguide.html#naming)

**Verify:** compare new names with peer declarations, imports, and existing checks.
Record conventions only where ambiguity or repeated decisions justify it.

### `naming-domain-vocabulary`

**Apply:** a concept crosses modules, storage, APIs, UI, or documentation.

**Prefer:** use one term per concept within its domain; use distinct terms for
distinct concepts. Avoid switching between `customer`, `client`, and `account`
when they mean the same entity. Retain distinct domain meanings and externally
fixed terms; make translations explicit at their boundary. Use familiar
abbreviations, expand obscure ones. Keep a small glossary only when terms collide.

Google's API guidance explicitly recommends the same name for the same concept
and different names for different concepts. Its abbreviation policy also shows
why banning every abbreviation would be excessive.
[AIP-140](https://google.aip.dev/140#uniformity)

**Verify:** trace one concept through its producer and consumers. Distinguish
legitimate domain translation from unexplained synonym drift.

### `naming-behavior`

**Apply:** functions, operations, types, and named events.

**Prefer:** nouns for entities and values; verbs for actions. Names should describe
observable behavior, including meaningful distinctions such as parsing versus
validation, scheduling versus completion, and commands versus completed events.
For domain events, `OrderPlaced` is a useful proposed default; it is not a rule
for every framework callback.

Microsoft recommends verb phrases for methods and noun/adjective phrases for
properties. Its event guidance distinguishes events before and after an action.
[Microsoft member naming](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/names-of-type-members)

**Examples:** `parseOrder` returns parsed data; `validateOrder` reports validity;
`enqueueEmail` queues delivery. Choose names after confirming those behaviors.
Do not impose universal `get`/`find`/`fetch` meanings. Document such distinctions
when a repository uses them. Go getters ordinarily omit `Get`.
[Effective Go getters](https://go.dev/doc/effective_go#Getters)

**Verify:** inspect return values, absence/error behavior, side effects, and actual
completion. A suggestive name never substitutes for a documented contract.

### `naming-shape-and-units`

**Apply:** data fields, options, collection variables, and numeric quantities.

**Prefer:** singular entities, plural collections, readable boolean conditions,
and explicit units for ambiguous scalar quantities. Distinguish IDs from objects,
counts from collections, durations from timestamps, and maps from lists when the
distinction matters. Examples: `order`, `orders`, `orderId`, `orderCount`,
`ordersById`, `timeoutMs`, `payloadBytes`. Prefer affirmative predicates when the
domain permits; preserve meaningful states such as `disabled`.

Plural collection names and affirmative booleans appear in Microsoft's guidance;
Google APIs also use singular/plural fields but omit `is` on boolean fields.
Therefore `isReady`/`hasAccess`/`canRetry` are useful JS predicate defaults, not
mandatory prefixes across every contract.
[Microsoft property naming](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/names-of-type-members#names-of-properties),
[AIP-140 fields](https://google.aip.dev/140)

AIP-141 puts units and counts in quantity names. Proposed adaptation: include
units where the scalar or established contract leaves them ambiguous; a typed
duration need not become `timeoutMs`. For money, specify currency and scale in
the type/contract rather than implying universal cents.
[AIP-141](https://google.aip.dev/141)

**Verify:** trace conversions, serialization, and consumers. Test behavior when a
unit mismatch is suspected; casing or a missing suffix alone does not prove a bug.

### `naming-discoverability`

**Apply:** packages, modules, filenames, and exports.

**Prefer:** name the owned capability, keep peer file/test names predictable, and
reuse canonical export names in consumers. Avoid generic dumping grounds such as
`misc` or `common`. Avoid redundant context: `billing.Invoice` reads better than
`billing.BillingInvoice`. Keep meaningful distinctions such as `InvoiceRow` and
`InvoiceResponse` when their contracts actually differ.

Go's package guidance directly connects naming to package focus, discourages
generic packages, and recommends considering the qualified name readers see.
[Go package names](https://go.dev/blog/package-names)

**Exception:** a generic name can serve a cohesive small scope; existing framework
filenames and generated outputs take precedence. A rename cannot repair mixed
ownership by itself. Use aliases for actual collisions or boundary translation;
do not enforce a blanket ban on default exports for naming alone.

**Verify:** inspect names at call sites and imports. Check import paths after
renames, including exact case, dynamic imports, test discovery, and generation
inputs. Use the existing file grammar; do not claim one universal JS filename case.

### `naming-compatible-change`

**Apply:** conforming existing names, particularly public or persisted names.

**Prefer:** scope private renames to the coherent change. Inventory consumers of
exports, import paths, API fields, CLI options, config keys, database names, and
event types before changing them. Apply the existing compatibility/migration
policy; retain adapters or deprecated aliases where consumers cannot update
together. Do not rewrite applied migrations or hand-edit generated code.

AIP-180 treats API renaming as removal plus addition and distinguishes source,
wire, and semantic compatibility. Extending that discipline to other externally
consumed names is a proposed repo policy.
[AIP-180](https://google.aip.dev/180#removing-or-renaming-components)

**Verify:** affected builds/typechecks and appropriate contract or migration
checks. Naming-only differences remain policy/readability findings unless traced
to demonstrated breakage. No blanket rename campaign or spelling-only tests.

## Language guidance to include

| Context | Suggested baseline | Qualification |
| --- | --- | --- |
| JS/TS identifiers | `camelCase` values/functions; `PascalCase` types | Common defaults, not a TypeScript language mandate |
| JS constants | Existing convention for semantic constants; ordinary `const` bindings stay `camelCase` | `const` alone does not mean constant-case |
| React | Capitalized component identifiers; Hooks start `use` followed by a capital letter | Framework semantics; filename case remains repo policy |
| Go | Export-aware `MixedCaps`/`mixedCaps`; consistent initialisms; short lowercase packages | Do not impose JS constant casing or getter prefixes |
| Python, if present | PEP 8 conventions with existing-library exceptions | Language-specific, not a cross-repo casing scheme |
| API/DB/config names | Follow the existing schema, protocol, and consumer contracts | No universal singular/plural SQL table policy |

Sources: [TypeScript contributor guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines#names)
explicitly disclaim being community-wide rules;
[Google JS constants](https://google.github.io/styleguide/jsguide.html#naming-constant-names)
distinguishes constants from ordinary bindings;
[React components](https://react.dev/learn/your-first-component#step-2-define-the-function),
[React Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use),
[Go names](https://go.dev/doc/effective_go#names),
[PEP 8](https://peps.python.org/pep-0008/#prescriptive-naming-conventions).

## Proposed integration

Keep the main skill small:

1. Add naming consistency to the description.
2. Extend “Before acting” to inventory vocabulary and applicable naming patterns.
3. Add one core policy: “Use consistent domain terms and idiomatic names within
   each language. Follow explicit repo conventions, name observable behavior and
   units clearly, and preserve public/persisted naming contracts.”
4. Route the six rules to a new `references/consistent-naming.md`, using the
   skill's existing Apply/Problematic/Prefer/Exception/Verify format.
5. Add evaluation cases: mixed-language initialisms; synonyms versus distinct
   domain concepts; ambiguous scalar units; framework naming; a rename that
   breaks an external consumer; consistent but nonpreferred filename style.

Reuse existing boundary, command, migration, and HTTP rules rather than duplicating
them. Existing linting can enforce mechanical rules; review semantics manually.
Do not add a new tooling stack solely to police names.

Unresolved questions: none for this proposal. Preserve existing filename styles;
choose a new-project filename default only if wanted as explicit skill policy.
