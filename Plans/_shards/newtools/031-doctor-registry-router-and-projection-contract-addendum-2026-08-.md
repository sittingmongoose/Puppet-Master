# Shard 031: Doctor registry, router, and projection contract addendum (2026-08-31)

Source: `Plans/newtools.md`

Source lines: L8719-L8864

Source SHA256: `ab70dbc2e26cad60cd86bb6344f3244b1b7a901e6a04e3b937ede665d1c3e7ec`

---

## Doctor registry, router, and projection contract addendum (2026-08-31)

N2-151 remains the owner boundary. This addendum closes the typed registry/router/projection shape without turning Doctor into a second domain engine. `Plans/doctor_contracts.schema.json` is the machine contract and `Plans/doctor_contract_fixtures.json` contains positive and negative static examples. They do not register commands or prove a running check, renderer, migration, or remediation handler.

### Registry and check identity

Doctor owns exactly one `DoctorCheckDescriptor` registry. Every active row has a stable `check_id`, one `owner_doc_ref`, exact target kinds, request/result schema refs, bounded cost class, cache TTL, timeout, redaction profile, permission class, side-effect policy, applicability selector, remediation action IDs, and support state. A descriptor may compose owner evidence but cannot redefine it. `side_effect_policy` is `read_only` for Doctor probes; a mutating action is always an owner command reached through remediation routing. Check IDs are permanent identities; aliases are migration-read only and cannot produce two active rows.

Registration is fail-closed. Duplicate active IDs, missing owners, missing schemas, an unregistered remediation action, a mutating probe, an unbounded target selector, protected-auth access, or a secret-bearing result schema rejects the descriptor. A domain owner may mark a check unavailable or unsupported; Doctor shows that truth and does not synthesize healthy. SQLite detection is `blocked`, never a supported backend option.

### Scheduling, caching, and stale rejection

Opening Doctor reads bounded cached projections first. It does not probe every configured record. The router selects visible, configured, relevant, stale, user-requested, or prerequisite checks; coalesces equal owner/target requests; obtains RuntimeResourceGovernor admission; and exposes one owner `ObservableWork` record. Cost classes are `instant_cached`, `light_local`, `network_bounded`, or `expensive_explicit`. Only `instant_cached` may run at entry without a user gesture. `expensive_explicit` requires an exact target and explicit action.

Every request binds `doctor_request_id`, `check_id`, Project/Server/Host/Environment/route/object identities as applicable, descriptor revision, owner projection generation, cache generation, deadline, permission snapshot, actor, redaction profile, and idempotency key. Results carry the same identities plus observed generation, start/finish time, evidence refs, receipt refs, and an owner result ref. Older descriptor, target, owner, cache, or continuation generations cannot overwrite a newer projection. Timeout, disconnect, interruption, and cancellation preserve the last known result with stale/interrupted disclosure; they do not become `healthy`.

Low-resource mode reduces concurrency and schedules checks in waves without removing domains. Closing Doctor detaches the viewer and does not cancel owner work; reopening joins the existing `ObservableWork` and current projection. A Client switch, Server restart, route change, or reconnect resumes only through matching durable owner identity and currentness.

### Normalized finding projection

`DoctorFindingProjection` is the only Doctor-owned presentation record. It contains owner and target identity, `healthy|needs_attention|blocked|unknown|stale|interrupted`, severity/task impact, concise human reason, freshness age/confidence, optional-Off applicability, last known result, Details/Logs/Receipt refs, remediation route, check cost, evidence refs, and redaction state. `optional_off` is healthy when no active work requires the capability. `required_missing`, stale, unknown, blocked, interrupted, and security-critical states are never green.

Transport, endpoint/route, Server, Vault, Source Location, Execution Host/Environment, Project registry, Project Sync, provider installation, provider authentication, model-generation readiness, Usage freshness, Browser Program, testing/capture, plugins, Source Control/worktrees, containers, permissions/FileSafe/secrets, storage/migration, Plans, and resource pressure stay distinct. Provider Ready with Usage unknown is valid. Reachability is not trust, a matching path is not Project/Vault identity, and visible focus is not Named Plan authority. Protected AuthBrowserSession exposes only redacted lifecycle/denial metadata; no page, credential, cookie, DOM, screenshot, URL/code, or reusable session content enters Doctor.

Details, Logs, and Receipt hydrate lazily, remain byte/row bounded, and are redacted before persistence or rendering. Human labels lead; raw IDs/enums, ports, topology generations, fingerprints, package detail, and cryptographic information appear only in Technical Details when policy allows. Projection summaries use cached/fresh/stale/unknown truth and never fake percent, success, or completeness.

### Remediation and exact typed UI actions

Doctor may open, refresh, run a bounded check, reveal bounded evidence, or navigate to an owner. It never installs, signs in, repairs, moves, updates, restores, changes a route, runs Source Control mutations, alters storage, or authorizes governance. Every issue has one canonical `remediation_action_id`, owner command or typed route, exact return/focus/currentness context, permission/confirmation behavior, disabled reasons, and recovery evidence. A successful route is not successful remediation; Doctor updates only after a fresh owner result.

The exact owner-local UI action IDs are `ui.doctor.open`, `ui.doctor.refresh_visible`, `ui.doctor.run_check`, `ui.doctor.open_details`, `ui.doctor.open_logs`, `ui.doctor.open_receipt`, and `ui.doctor.open_remediation`. They are typed UI actions, not central command registrations. `ui.doctor.open_remediation` carries `check_id`, finding revision, owner route/action ID, exact target identity, return route, expected owner generation, and idempotency key. Central command/wiring owners must either map the typed action to one canonical command or record it as route-only; Doctor cannot mint a peer command.

### Settings GUI projection, motion, and accessibility

Doctor is an ongoing full Settings destination, separate from Product Onboarding. Its canonical surface is a calm health overview with cached groups, one primary `Check now` action for the current scope, optional filters, and progressive disclosure into Details/Logs/Receipt. The surface is a projection of this registry; it does not own Settings geometry or domain operations. Normal entry must remain useful offline and under partial failure.

Group/row disclosure uses a `160 ms` expand/collapse and result refresh uses a `120 ms` opacity settle. A targeted check may show an immediate pending shell in the same frame, but the animation never blocks navigation or cancellation. Fresh-result replacement uses no movement. Reduced Motion changes state immediately with a focus/announcement update; low-resource mode removes decorative transitions. Slint implementation uses stable model IDs, narrow row updates, opacity, height/clipping, and bounded timelines only. Hidden/collapsed/off-screen groups stop decorative work and do not duplicate subscriptions.

Keyboard order is group, row, primary action, then disclosed actions. Every status has text plus icon; color is never the only signal. Freshness and reason are announced together. Focus stays on the invoked row when results arrive, returns to the originating row after remediation, and survives stale-result rejection. Long/localized labels wrap; virtualized lists retain accessible position/count and stable focus identity. `Escape` closes popup, then detail, then returns outward; Back restores filter, group expansion, scroll, and focus.

### Persistence and migration

Storage owns registry and projection bindings. Doctor persists descriptor revision refs, bounded normalized findings, cache generation, timestamps, redacted evidence/receipt refs, and remediation return context. It never persists raw probe output by default, credentials, secrets, auth URLs/codes, protected-browser data, broad paths, or domain mutations. Owner results remain with owner storage; Doctor keeps references and presentation fields only.

Legacy `doctor.registry.auth` is a compatibility alias only for the DockerHub-specific `doctor.dockerhub.auth.capability` rule already stated above. Migration validates aliases against one active descriptor, preserves descriptor revision plus finding owner/cache generation and currentness hash only when owner/target identity and schema version remain compatible, marks uncertain state stale without upgrading freshness, and quarantines collisions or secret-bearing legacy payloads. `pm.doctor.cache_migration_receipt.v1` is the one-time domain reconciliation record closed by `Plans/doctor_contracts.schema.json`; it MUST reference the sole terminal durable `pm.storage_value.migration_receipt.v1` receipt rather than acting as peer storage authority. It reports exact source, accepted, stale, dropped, and quarantined row counts; enumerates preserved accepted/stale descriptor and finding currentness rows; names every dropped and quarantined row with a reason; records alias resolutions; and fixes `owner_work_replayed=false`, `private_repair_performed=false`, and `migrated_cache_is_fresh_execution_evidence=false`. A migrated cache is never fresh execution evidence and migration never runs a private Doctor repair.

Acceptance includes registry schema validation; duplicate/alias/owner/schema/side-effect/secret negative cases; cached-first and targeted scheduling; dedupe/coalescing; timeout/cancel/reconnect; stale-generation rejection; optional-Off and Usage-unknown cases; all configured remote routes; protected-auth isolation; low-resource waves; lazy bounded evidence; remediation exact return; keyboard/focus/screen-reader behavior; six-width/eight-theme/Reduced Motion rendering; and proof that a routed action does not mark remediation complete. Failures remain failures and named residual risk remains visible.

### N2-152 - Doctor descriptor registry and bounded router

```yaml
plan_unit_id: N2-152
unit_type: owner_boundary
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor owns one versioned registry of stable read-only check descriptors and one bounded cached-first router with exact targets, cost classes, RuntimeResourceGovernor admission, ObservableWork, dedupe, freshness, generation fencing, redaction, and owner remediation routing; domain owners retain truth and every mutation.
gui_related: false
depends_on: [N2-151, SIR-003, SIR-004, SIR-007, PSB-001]
unblocks: []
acceptance_criteria:
  - Duplicate active IDs, missing owners/schemas, mutating probes, unbounded targets, protected-auth access, and unregistered remediation actions fail closed.
  - Cached entry does not trigger an exhaustive probe storm and stale results cannot overwrite newer owner state.
  - Closing Doctor detaches the viewer without cancelling owner work.
  - One-time registry/cache migration preserves descriptor/finding currentness, names every dropped or quarantined row, references the canonical storage migration receipt, and cannot replay owner work or perform private repair.
validation_surfaces: [Plans/doctor_contracts.schema.json, Plans/doctor_contract_fixtures.json, registry and scheduling negative fixtures]
risk_class: doctor_registry_collision_or_parallel_engine
reasoning_tier: high
context_scope: doctor_registry_router
implementation_surfaces: [Plans/newtools.md, Plans/doctor_contracts.schema.json]
node_compile_hint: {mode: doctor_registry_router_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-settings-onboarding.md#D-01-through-D-07"
negative_constraints: [Do not let Doctor own domain truth., Do not run mutating or unbounded probes., Do not expose protected authentication content.]
```

### N2-153 - Doctor finding projection and remediation return

```yaml
plan_unit_id: N2-153
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor projects normalized owner findings with explicit status, task impact, freshness/confidence, optional-Off applicability, bounded redacted evidence, and one exact owner remediation route; route success is not remediation success, stale or unknown never appears healthy, and exact return restores focus/currentness.
gui_related: true
gui_classification_reason: Defines the ongoing Settings Doctor destination, health rows, disclosure, motion, accessibility, and remediation navigation.
depends_on: [N2-152]
unblocks: [SSYS-014]
acceptance_criteria:
  - Provider readiness, Usage freshness, transport, topology, Project, Sync, Browser, testing, SCM, storage, security, Plans, and resources remain distinct projections.
  - Details, Logs, and Receipt are lazy, bounded, and redacted before persistence/rendering.
  - Reduced Motion, keyboard, focus return, stale rejection, and long/localized copy are deterministic.
  - Migration receipts keep migrated cache truth non-fresh and preserve exact accepted, stale, dropped, and quarantined counts.
validation_surfaces: [Plans/doctor_contracts.schema.json, Plans/doctor_contract_fixtures.json, remediation-return and protected-session fixtures]
risk_class: doctor_false_green_or_remediation_misattribution
reasoning_tier: high
context_scope: doctor_projection_and_remediation
implementation_surfaces: [Plans/newtools.md, Plans/doctor_contracts.schema.json]
node_compile_hint: {mode: doctor_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:canon-settings-performance-onboarding.md#G-11"
negative_constraints: [Do not mark a route as successful remediation., Do not persist raw secrets or probe output., Do not make color the only status signal.]
owner_boundary_notes: [Doctor owns the normalized finding and remediation-return contract; Settings consumes that projection, so N2-153 must not depend back on SSYS-014.]
```

### N2-154 - Plugins System Doctor Descriptor Set

```yaml
plan_unit_id: N2-154
unit_type: integration_contract
status: accepted
owner_doc: Plans/newtools.md
canonical_text: >-
  Doctor registers eight stable read-only Plugins System checks: doctor.plugin.manifest_resolution,
  doctor.plugin.conformance, doctor.plugin.containment, doctor.plugin.supply_chain,
  doctor.plugin.permission_update_review, doctor.plugin.runtime_bounds, doctor.plugin.rollback_health, and
  doctor.plugin.promoted_routine_freshness. Each descriptor consumes a cached bounded Plugins System projection,
  preserves exact plugin/package/target and generation identity, reports requested/effective/freshness/confidence
  separately, and routes one admitted cmd.agent_plugin.* action to the existing Settings K3 Plugins tab. Doctor never
  scans, installs, updates, enables, disables, reloads, removes, validates, reviews, rolls back, reads package bytes, or
  performs private plugin repair. Route success is not remediation success; an unavailable native handler remains
  handler_unavailable and an exact fresh owner result is required before normalized finding replacement.
gui_related: true
gui_classification_reason: The eight checks are visible Doctor rows with status, evidence, disabled reason, owner route, and exact return/focus behavior.
depends_on: [N2-152, N2-153, PLUG-067, PLUG-070, CS-071, WM-048]
unblocks: [SSYS-024, F3-525]
acceptance_criteria:
  - The descriptor registry contains each of the eight exact check IDs once with Plugins System as domain owner and no Doctor-private probe or mutation handler.
  - Manifest resolution, portable/target/agent conformance, containment, supply chain, complete permission/update review, runtime bounds, rollback health, and stale promoted-routine disposition remain separate findings.
  - Details, Logs, and Receipt remain explicit lazy bounded redacted projections; secret bytes, protected authentication content, sensitive paths, and raw package/runtime output are absent.
  - Owner routing opens code/toolchain with the Plugins tab and intended detail selected, while exact finding/target/generation/continuation/focus context is preserved for return.
  - handler_unavailable, stale, unknown, waiting-for-user, blocked, and needs-attention remain distinct and cannot be rendered Ready by route completion or browser fixture state.
validation_surfaces: [Plans/doctor_contracts.schema.json, Plans/doctor_contract_fixtures.json, Plans/plugin_contracts.schema.json, Plans/plugin_contract_fixtures.json, Concepts/pm7-tools/verify/plugin_projection_matrix.mjs]
risk_class: doctor_plugin_private_repair_or_false_green
reasoning_tier: high
context_scope: doctor_plugins_owner_projection
implementation_surfaces: [Plans/newtools.md, Plans/Plugins_System.md, Plans/Settings_System.md, Concepts/pm7-tools/systems_integration_source.py, future Doctor descriptor registry fixtures]
node_compile_hint: {mode: doctor_plugins_descriptor_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Plugins_System.md#PLUG-067
  - Plans/Plugins_System.md#PLUG-070
  - source_ref:chat:plugin-owner-projection-closure-2026-09-01
preserved_exact_tokens: [doctor.plugin.manifest_resolution, doctor.plugin.conformance, doctor.plugin.containment, doctor.plugin.supply_chain, doctor.plugin.permission_update_review, doctor.plugin.runtime_bounds, doctor.plugin.rollback_health, doctor.plugin.promoted_routine_freshness, handler_unavailable]
negative_constraints: [Do not let Doctor execute a Plugins System command or read raw package/runtime bytes., Do not infer remediation from navigation or stale fixture state., Do not expose protected-auth or secret content.]
owner_boundary_notes: [Doctor owns descriptor, normalized finding, bounded cache, and exact remediation return; Plugins System owns checks, truth, package/runtime bytes, commands, mutations, and receipts; Settings and Final GUI own presentation only.]
owner_hints: [Plans/newtools.md, Plans/Plugins_System.md, Plans/Settings_System.md, Plans/FinalGUISpec.md]
```
