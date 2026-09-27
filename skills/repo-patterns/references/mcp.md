# MCP server organisation

**Read when:** changing MCP registration, schemas, tools/resources/prompts, or transport lifecycle.

**Policy status:** Follow the installed SDK and negotiated protocol. Application layout is skill policy.

## `organisation-mcp`

**Own protocol wiring and lifecycle.**

**Apply:** MCP tools/resources and stdio or HTTP server composition.

**Problematic:** tools duplicate REST rules or call the co-located REST transport;
logging corrupts stdio; every client shares mutable user/session state.

**Prefer:** compose the SDK server, transport, dependencies, and shutdown at the
root. Keep feature-local registrations, input/output schemas, and protocol result
mapping next to their operations. Use the same application operation as local CLI
or REST drivers. Keep MCP request/session objects out of shared domain logic; pass
the validated principal, cancellation, and operation data it actually needs.

Separate tools (operations), resources (addressable context), and prompts (message
templates) where applicable; keep each with its feature and advertised contract.
Keep tool names, descriptions, and advertised schemas consistent with actual
behavior. Enforce authorization/capabilities in executable code; annotations are
descriptions. Keep protocol/dispatch failures distinct from operation failures,
using the negotiated protocol and installed SDK's error-result semantics. Validate
structured results when an output schema is advertised.

Illustrative TS server (equivalent Go packages are valid):

```text
src/main.ts                        # transport and lifecycle
src/features/orders/create.ts     # shared operation
src/features/orders/mcp.ts        # schema, registration, result mapping
src/features/orders/mcp.test.ts
```

For stdio, stdout carries only valid MCP messages; route logs to stderr. For
HTTP, explicitly own authentication and any per-client/session state. Follow the
installed SDK/negotiated protocol rather than copying an unversioned example.

**Exception:** a stateless server needs no session-state framework. A remote API
gateway can legitimately call that service and keep domain rules with its owner.
Keep a small explicit registration list rather than inventing plugin discovery.

**Verify:** protocol-level discovery and invocation, schema/result agreement,
operation-error mapping, denied actions, cancellation, and transport shutdown.
Check stdio contains no stray output and HTTP clients do not leak state across
sessions where state exists. A direct function test alone does not prove MCP wiring.

## Sources

- [MCP tools and error/result contracts, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP transport requirements, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [MCP resources, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)
- [MCP prompt templates, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts)
- [MCP cancellation, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation)
