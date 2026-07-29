# Hosting, observability, and deployment

TanStack Start is provider-neutral, but runtime behavior is not. Treat the
selected host, build tool, adapter, CDN, and storage model as architectural
inputs.

## Deployment checklist

Record:

- Start/Router/React/build-tool versions.
- Runtime: Node, Bun, Worker/edge, or provider-specific.
- Adapter/plugin and required ordering.
- Build output and server entry.
- Environment/binding injection.
- Static asset/base-path/CDN behavior.
- Server functions/routes reachability.
- Streaming and response-size/time limits.
- Filesystem persistence and writable paths.
- Cache and revalidation support.

Do not infer production support from the development server.

## Runtime boundaries

### Node/Bun

Check supported runtime versions, native dependencies, process lifecycle,
connection pools, and shutdown behavior. A Bun recipe may have different React
or package constraints than Node. The current Bun-specific Start deployment
guide requires React 19; recheck that requirement on upgrade.

### Worker/edge

- Read bindings per request.
- Do not assume Node filesystem/process/socket APIs.
- Use edge-compatible database/drivers.
- Respect CPU, memory, subrequest, streaming, and body limits.
- Configure compatibility flags/dates deliberately.
- Generate platform types rather than copying them.

Non-secret provider `vars` are not a secret store. Use the provider's encrypted
secret facility for credentials.

## Provider plugins

Follow current provider documentation for plugin order and config. For example,
the official Cloudflare example places the Cloudflare plugin, then Start, then
React. Reverify this on updates because provider plugins evolve.

Keep Vite and Rsbuild recipes separate. Do not translate option names between
them by analogy.

## Persistence

- Local JSON/files may work only on a single persistent server.
- Serverless filesystems are commonly read-only or ephemeral.
- Module state is per process/isolate and may disappear at any time.
- Use a database/object store/queue designed for the target runtime.
- Plan connection pooling and migrations for deploy/rollback.

## Observability surfaces

Instrument:

- Request middleware: request ID, route, duration, result.
- Server functions/routes: operation name, status, dependency timing.
- Router loaders/navigation: pending and failure behavior.
- SSR/streaming: time to headers/shell/completion and late failures.
- Client hydration and error boundaries.
- Health/readiness server routes.

Use structured logs and propagate correlation IDs. Redact authorization headers,
cookies, passwords, tokens, session IDs, reset codes, personal data, request
bodies, and database credentials.

Manual OpenTelemetry integration is experimental/release-sensitive; verify the
current API and runtime exporter behavior.

## Cache safety

HTTP/CDN caching is separate from Router and Query caching. Never mark a response
`public` when output varies by cookie, identity, authorization, tenant, or
private request context. Configure `Vary`, private/no-store policy, ETags,
revalidation, and purge deliberately.

## Production tests

- Direct deep URL and refresh.
- Client navigation and preloading.
- Server function and server route.
- Authenticated and unauthenticated private requests.
- Streaming and disconnect.
- Cold start and concurrent traffic.
- Deployment base path and CDN assets.
- Runtime binding/secret availability.
- Cache isolation between two users/tenants.
- Health checks and redacted failure logs.

## Do

- Pin and record adapter/runtime versions.
- Test provider-local and deployed behavior.
- Use durable external storage where required.
- Add correlation-aware, redacted observability.
- Verify cache isolation with multiple identities.
- Keep custom entries/adapters minimal.

## Don't

- Copy a compatibility date forever.
- Assume `nodejs_compat` makes every Node package safe.
- Log all request headers or provider tokens.
- Persist application state in module globals.
- Claim streaming, early hints, ISR, or CDN rewriting without host evidence.
- Use public cache directives for identity-dependent output.

## Sources

- https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- https://tanstack.com/start/latest/docs/framework/react/guide/observability
- https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables
- https://tanstack.com/start/latest/docs/framework/react/guide/isr
- https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-cloudflare
