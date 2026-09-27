# repo-patterns: Docker proposal

Researched 2026-09-27. Incorporated into
[repo-patterns](../skills/repo-patterns/SKILL.md) and
[Docker guidance](../skills/repo-patterns/references/docker.md).

## Existing setup

The skill routes scoped work to references, each with stable rule IDs,
applicability, problematic examples, guidance, exceptions, and verification.
Repository policy and evidenced conventions precede fallbacks. Evaluations live
outside ordinary execution; research records the rationale separately.

Existing guidance owns build/runtime boundaries, independent runs, configuration,
mutable-state isolation, migration/seed lifecycle, and disposable container
provisioning. The gap is application-image construction and operation. Expanding
the testing-only container reference would mix provisioning with distribution.

## Skills compared

- [docker-expert](https://github.com/sickn33/agentic-awesome-skills/blob/main/skills/docker-expert/SKILL.md),
  surfaced on [Skills](https://www.skills.sh/sickn33/agentic-awesome-skills/docker-expert):
  covers stages, caching, context, non-root execution, secrets, Compose, and image
  checks. Useful coverage; its examples include old runtime pins, an absent probe
  dependency, and shell commands that suppress diagnostics. Do not copy templates
  or automatic expert handoffs into this manually invoked, evidence-based skill.
- [docker-patterns](https://github.com/affaan-m/everything-claude-code/blob/main/skills/docker-patterns/SKILL.md),
  surfaced on [Skills](https://www.skills.sh/affaan-m/ecc/docker-patterns):
  covers local Compose, dev/production targets, networking, volumes, hardening,
  and disposable installer runs. Retain those concerns; fixed ports, project-specific
  harness rules, and concrete version examples are not universal defaults.

These are widely installed examples, not a complete popularity survey. Community
coverage informed the comparison; primary documentation grounds technical guidance.

## Proposal and evidence

| Addition | Primary evidence | Integration |
| --- | --- | --- |
| Declared contexts, ignores, locked inputs, optional caches | [Build context](https://docs.docker.com/build/concepts/context/), [cache guidance](https://docs.docker.com/build/cache/optimize/) | Reuse dependency ownership and generation rules; preserve workspace inputs |
| Compatible minimal final images and maintained bases | [Build practices](https://docs.docker.com/build/building/best-practices/), [stages](https://docs.docker.com/build/building/multi-stage/), [Node variants](https://github.com/nodejs/docker-node/blob/main/README.md#image-variants) | Extend build/runtime separation; base choice remains contextual |
| Build mounts and runtime secret delivery | [Build secrets](https://docs.docker.com/build/building/secrets/), [Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/) | Extend existing configuration policy; distinguish build artifacts from runtime env |
| Signals, user/permissions, writable paths, useful probes | [Dockerfile semantics](https://docs.docker.com/reference/dockerfile/), [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html) | Verify effective behavior; preserve upstream initialization and platform-owned settings |
| Compose readiness, DNS, volumes, bounded cleanup | [Startup](https://docs.docker.com/compose/how-tos/startup-order/), [networking](https://docs.docker.com/compose/how-tos/networking/), [teardown](https://docs.docker.com/reference/cli/docker/compose/down/) | Link existing isolation and migration/seed owners; keep provisioning tooling |
| Final-image checks and digest identity | [Build checks](https://docs.docker.com/build/checks/), [platform builds](https://docs.docker.com/build/building/multi-platform/), [attestations](https://docs.docker.com/build/metadata/attestations/) | Extend artifact verification without imposing CLI release triggers on images |

The six rules synthesize these sources for this skill. Dockerfile semantics are
runtime facts; ownership/verification obligations are skill policy. Digest pinning,
cache strategy, base variant, hardening, metadata, and platform breadth depend on
the consuming repository. Pinning improves input identity but requires updates;
smaller bases reduce bundled software but can remove needed libraries/tools.
Startup ordering does not establish recovery after dependency failure.

## Implementation and validation scope

Added a dedicated routed reference, a conditional link from disposable containers,
and an image/Compose row in the verification matrix. Updated skill/README scope.
Added three snapshot evaluations and Docker behavior scenarios covering image
leakage/compatibility, Compose lifecycle/isolation, and restraint for supported
upstream images and existing publication policy. Existing evaluations remain intact.

Structural checks cover local links/anchors, rule ownership/catalog coverage,
evaluation JSON/IDs, and preservation of existing prompts/scenarios. Evaluation
inputs are not executed agent benchmarks or Docker runtime tests. No application
image is introduced by this documentation change.

Unresolved questions: none.
