# Docker images and Compose

**Read when:** changing or auditing Dockerfiles, build contexts/cache, application images, container lifecycle, Compose, or image verification/publication.

**Policy status:** Docker behavior is version-sensitive. Image/runtime guidance is scoped skill policy; base variants, hardening options, and multi-platform builds depend on actual requirements. Preserve supported tools and deployment contracts.

## Contents

- [Build inputs](#docker-build-inputs)
- [Image contents](#docker-image-contents)
- [Secrets](#docker-secrets)
- [Runtime contract](#docker-runtime-contract)
- [Compose lifecycle](#docker-compose-lifecycle)
- [Artifact verification](#docker-artifact-verification)

## `docker-build-inputs`

**Build from declared inputs.**

**Apply:** Docker builds consume source, dependencies, generated assets, or caches.

**Problematic:** a build copies host `node_modules` or credentials; a workspace
build omits sibling manifests; cached downloads hide an undeclared dependency.

**Prefer:** identify the actual context, Dockerfile, target, platform, and build
arguments used by local/CI commands. Keep the context small with the applicable
`.dockerignore`; exclude credentials, local mutable state, and unneeded host
artifacts without excluding required generation inputs. Dockerfile-specific ignore
files can override the context-root file. A Git ignore file does not filter Docker
contexts. A monorepo can legitimately require a repository-root context.

Copy dependency manifests, lockfiles, and required workspace/config inputs before
frequently changing source where the build permits. Use the established package
manager's locked install and generation path; retain build dependencies until
compilation completes. See [dependency ownership](tooling-and-commands.md#tool-dependency-ownership)
for workspace pruning and [generated outputs](tooling-and-commands.md#tool-generated-artifacts)
for drift checks. Do not regenerate lockfiles merely to make an image build pass.

Use BuildKit cache mounts or CI cache import/export when useful and supported.
Caches are optional accelerators, not required undeclared inputs; protect private
cache contents and restrict who can publish trusted caches. Change relevant
inputs to invalidate dependent work; measure speed before claiming improvement.

**Exception:** deliberately prebuilt artifacts can be image inputs when their
producer, source identity, and verification are explicit. Do not impose an
in-container compilation stage on an established artifact pipeline.

**Verify:** build through the documented path without host dependency directories
or undeclared assets; inspect effective ignore rules. Check relevant manifest,
source, and generated-input changes rebuild affected output. Confirm a build with
empty layer/package caches still works; `--no-cache` alone need not clear cache mounts.

## `docker-image-contents`

**Ship a compatible runtime image.**

**Apply:** choosing bases/stages or changing the contents of an application image.

**Problematic:** production ships a compiler and dev reload server; an Alpine
runtime receives glibc-linked dependencies; a scratch image cannot make TLS calls.

**Prefer:** use maintained, trusted bases compatible with the repo's runtime
versions. Select explicit versions; prefer tag plus digest when immutable base
identity is required, with an owned update/rebuild path for security fixes. Tags
can move; digest pinning alone does not make every build input reproducible.

Use named multi-stage builds when they separate build/dev tools from runtime.
Copy only required executable code, production dependencies, assets, and runtime
configuration; keep dev mounts/debuggers out of the shipped target. Install only
needed OS packages and remove transient package lists in the same layer. Prefer
`COPY` for ordinary files; use `ADD` when its fetch/extraction semantics are intended.

Match OS/architecture, libc, native modules, shared libraries, certificates, and
required external programs across build and runtime. Alpine, slim, distroless,
and scratch have different compatibility/debugging costs; size alone does not
choose a base. A Go binary with cgo or a real Git dependency is not automatically
self-contained. A Node runtime image must retain needed package/module metadata
and assets, not just a compiled entry point.

**Exception:** a single stage is sufficient for an already minimal runtime.
Required runtime tools or supervised child processes are legitimate dependencies.
Do not remove them to satisfy an image-size target or force exactly one process.

**Verify:** run the final target without checkout mounts or build tools. Exercise
required TLS/native-library/external-program behavior and inspect included assets
and dependency versions. Verify only the platforms actually promised.

## `docker-secrets`

**Keep credentials out of build artifacts.**

**Apply:** builds or running containers need credentials/private configuration.

**Problematic:** credentials travel through `ARG`, Dockerfile `ENV`, copied `.env`
files, logs, or an intermediate layer deleted later.

**Prefer:** use BuildKit secret/SSH mounts for authenticated build steps; mark
required mounts as required when supported. Do not copy, echo, or persist their
contents in outputs/caches. Deletion or a later stage does not sanitize exported
build layers/cache. Keep build arguments non-secret; provenance can expose them.

Inject deployment configuration at runtime. Prefer supported secret-file mounts
or the platform's secret provider for sensitive values; grant only consuming
services access. Compose secrets and `_FILE` variables require actual application
support; `_FILE` is an image convention, not automatic Docker behavior. Compose
file-backed secrets do not themselves provide an encrypted secret store. Protect
their host sources. Keep example credentials synthetic and clearly local-only.

**Exception:** an established deployment can supply secrets through runtime env
when the app/provider requires it; document the exposure boundary and keep values
out of logs and image layers. `.env`/`env_file` is configuration, not a secret vault.

**Verify:** inspect relevant context, image config/layers, build logs, cache export,
and metadata without printing real credentials. Check missing required secrets
fail clearly on an uncached authenticated step. Use synthetic leakage markers;
a clean final filesystem alone does not establish that build artifacts contain
no secrets.

## `docker-runtime-contract`

**Own process, permissions, and writable state.**

**Apply:** defining how an application image starts, operates, and stops.

**Problematic:** a shell wrapper swallows stop signals; an arbitrary `USER` breaks
mounted data; a healthcheck calls an absent `curl`; a restart loop hides failure.

**Prefer:** use exec-form entry points/commands for the actual application; wrappers
finish with `exec` and forward arguments. Preserve the image's inherited entry
point semantics. The application handles shutdown/draining within the configured
stop grace period; use a supported init when child reaping/forwarding needs it.
Emit application logs to stdout/stderr with correct failure exits.

Run application work as a non-root user where supported; verify UID/GID, owned
paths, and mounted-volume permissions. For Linux deployments, prefer dropping
unneeded capabilities, preventing new privileges, and a read-only root filesystem
with explicit writable volumes/tmpfs where compatible. Retain runtime security
profiles; avoid privileged mode, host namespaces, and daemon socket mounts without
a demonstrated requirement. A read-only Docker socket mount still grants API access.
Choose effective CPU/memory/PID limits and restart behavior for the workload/runtime.

Define writable temporary/cache paths separately from durable storage. Health
checks use tools actually present and bounded application/protocol checks. Distinguish
startup, readiness, and liveness for the consuming platform; an unhealthy Docker
status alone does not restart a container. One-shot jobs/CLIs need no HTTP probe.

**Exception:** upstream images may initialize storage as root, then drop privileges;
preserve documented behavior. Platform-managed users/probes can satisfy the
contract without Dockerfile `USER`/`HEALTHCHECK`. Document necessary writable paths
or elevated operations rather than adding hardening flags that break them.

**Verify:** actual user and mounted-path access, representative operation, denied
unnecessary writes, probe failure, argument/exit behavior, and `docker stop` with
pending work. Inspect effective limits/security settings on the supported runtime.

## `docker-compose-lifecycle`

**Compose owned services and state.**

**Apply:** Compose owns development, integration, or deployment services.

**Problematic:** short-form `depends_on` is called readiness; `localhost` addresses
another container; two projects share an explicitly named volume; reload resets a DB.

**Prefer:** use the installed Compose implementation/specification. For new Docker
Compose commands, prefer `docker compose`; do not add an obsolete top-level
`version` field or migrate working tooling solely for spelling. Inspect the effective
merged files, targets, profiles, interpolation, mounts, and commands. `.env`
interpolation and service `env_file` have different roles; required values must
fail clearly. Keep production selection free of dev source mounts/debug ports.

Use service DNS names and container ports between services; host clients use the
runtime's published address/port. Publish only needed ports; prefer loopback for
local-only access and configurable/discovered ports for concurrent runs. `EXPOSE`
does not publish a port. The default project network can suffice; extra networks
need a real access boundary. Container servers must listen on a reachable interface.

Use health-based dependency conditions for initial readiness or successful
completion for finite prerequisites where supported. Applications still own
reconnection/retry after dependency failure. Migration/seed ownership follows
[setup lifecycle](test-data-and-setup.md#fixture-setup-lifecycle); container-start
init scripts alone do not establish repeated migration/seed behavior.

Apply [run isolation](development-runtime.md#runtime-isolation): unique projects
per independent run, plus isolated published ports, bind paths, and externally or
explicitly named containers/volumes/networks. Project names alone do not isolate
those. Document
normal stop versus explicit disposable reset; `down` normally retains named
volumes, while `down --volumes` removes owned declared/anonymous volumes. Preserve
external/shared data; do not use global prune as project cleanup.

**Exception:** an intentionally shared service needs documented ownership and
serialization. Pure tests need no Compose; retain supported disposable provisioning
under [container infrastructure](containers.md#fixture-container-infrastructure).

**Verify:** validate the exact file/profile/env selection, then relevant isolated
startup, dependency failure/recovery, restart persistence, and interruption cleanup.
For concurrent workflows, run two projects and reset one without affecting the other.

## `docker-artifact-verification`

**Verify and promote the same image.**

**Apply:** image checks, CI builds, platform support, or registry publication.

**Problematic:** a dev target passes but production lacks assets; CI checks only
Dockerfile syntax; a tested image is rebuilt from moving inputs for publication.

**Prefer:** use finite build checks and Compose model validation where supported,
such as `docker build --check` and `docker compose ... config --quiet`. These do
not prove image/runtime behavior; build checks can contact registries and resolve
inputs. Rendered Compose config can expose secrets, so avoid logging real values.

Build/test the intended final target from the selected source and declared inputs.
Inspect config and contents; smoke-test meaningful application behavior with owned
disposable resources. Use the established scanner and actionable vulnerability
policy; do not infer safety from small size or a successful build. Retain diagnostics
and report unavailable runtime/scanner/platform checks honestly.

For publication, record source/version and resulting digest; promote the verified
image instead of rebuilding different bytes. Treat tags as movable pointers and
use digests for exact deployment/rollback identity. Add SBOM/provenance/signatures
when required by the distribution policy and supported by builder/exporter/registry;
verify metadata survives transport. Multi-platform releases need the promised
manifest entries and runtime checks; emulation does not prove native performance.

**Exception:** follow existing image publication/channel policy; the manual stable
CLI and automatic Go dev policies in [CI releases](ci-releases.md) do not silently
become universal image-release rules. No publication is needed for local checks
or authorized read-only audits. Add platforms only when actually supported.

**Verify:** final-image operation, missing config/assets, graceful stop, source/digest
identity, supported platform manifests, and configured scan/metadata requirements.
Published-image changes additionally verify pull-by-digest and rollback selection
within authorized scope; distinguish static checks from executed image tests.

## Sources

- [Docker build contexts and ignore files](https://docs.docker.com/build/concepts/context/)
- [Docker cache optimization](https://docs.docker.com/build/cache/optimize/)
- [Docker build best practices](https://docs.docker.com/build/building/best-practices/)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Node official image variants](https://github.com/nodejs/docker-node/blob/main/README.md#image-variants)
- [Docker build secrets](https://docs.docker.com/build/building/secrets/)
- [Compose runtime secrets](https://docs.docker.com/compose/how-tos/use-secrets/)
- [Docker provenance and build-argument exposure](https://docs.docker.com/build/metadata/attestations/slsa-provenance/)
- [Dockerfile instruction and process semantics](https://docs.docker.com/reference/dockerfile/)
- [OWASP Docker security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Docker restart semantics](https://docs.docker.com/engine/containers/start-containers-automatically/)
- [Compose obsolete version field](https://docs.docker.com/reference/compose-file/version-and-name/)
- [Compose interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/)
- [Compose networking](https://docs.docker.com/compose/how-tos/networking/)
- [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)
- [Compose project names](https://docs.docker.com/compose/how-tos/project-name/)
- [Compose teardown](https://docs.docker.com/reference/cli/docker/compose/down/)
- [Compose model validation](https://docs.docker.com/reference/cli/docker/compose/config/)
- [Docker build checks](https://docs.docker.com/build/checks/)
- [Docker multi-platform builds](https://docs.docker.com/build/building/multi-platform/)
- [Docker build attestations](https://docs.docker.com/build/metadata/attestations/)
