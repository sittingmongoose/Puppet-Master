# Shard 031: Doctor registry, router, and projection contract addendum (2026-08-31)

Source: `Plans/newtools.md`

Source lines: L8719-L8909

Source SHA256: `1bce487b7d1d90c28942d99a8b1c7e9f4f06d9da0698e048b2a084dfa225f91f`

---

## Doctor registry, router, and projection contract addendum (2026-08-31)

N2-151 remains the owner boundary. This addendum closes the typed registry/router/projection shape without turning Doctor into a second domain engine. `Plans/doctor_contracts.schema.json` is the machine contract and `Plans/doctor_contract_fixtures.json` contains positive and negative static examples. They do not register commands or prove a running check, renderer, migration, or remediation handler.

### Registry and check identity

Doctor owns exactly one `DoctorCheckDescriptor` registry. Every active row has a stable `check_id`, one `owner_doc_ref`, exact target kinds, request/result schema refs, bounded cost class, cache TTL, timeout, redaction profile, permission class, side-effect policy, applicability selector, remediation action IDs, and support state. A descriptor may compose owner evidence but cannot redefine it. `side_effect_policy` is `read_only` for Doctor probes; a mutating action is always an owner command reached through remediation routing. Check IDs are permanent identities; aliases are migration-read only and cannot produce two active rows.

Registration is fail-closed. Duplicate active IDs, missing owners, missing schemas, an unregistered remediation action, a mutating probe, an unbounded target selector, protected-auth access, or a secret-bearing result schema rejects the descriptor. A domain owner may mark a check unavailable or unsupported; Doctor shows that truth and does not synthesize healthy. SQLite detection is `blocked`, never a supported backend option.

### Required diagnostic coverage

The September 3 diagnostic census is a coverage obligation for this one registry, not a second registry or a fixed count of runtime probes. Each applicable dimension below must resolve to an owner-backed active descriptor or an explicit unavailable/unsupported projection. A descriptor may compose bounded owner evidence, and one check may project into multiple relevant groups without duplicate active IDs or duplicate probes. Applicability, intentional Off, support, permission, cost, cache, currentness and resource admission remain the rules above. All probes remain read-only: fetch/push permission health never authorizes a fetch, push, repair or sign-in mutation.

| Group | Required diagnostic dimensions |
|---|---|
| Puppet Master Server | Claim/owner state, Server identity, Catalog/Project-Vault access, Client/Server protocol compatibility, current Client connection, Nearby discovery freshness, endpoint identity deduplication, and application update/restart requirement. |
| Devices & Remote Access | Trusted Clients and pairing health; LAN; PM Go/tsnet connector process/version/persistent identity; hosted Tailscale authentication and private listener/reachability; Headscale control/registration; Funnel only when enabled; nginx/Traefik TLS/origin/WebSocket/trusted-proxy policy; Remote Link signaling/direct/relay/end-to-end encryption; manually configured VPN endpoint/identity/protocol readiness. Reuse N2-156 connector axes, not a second connector probe. |
| AI Services | Provider installation only where required, authentication profile, account/product selection, model/capability, generation readiness, and independent Usage telemetry. Authentication or account success implies neither generation nor Usage success. |
| Code & Version History | Source path/mount/SSH reachability; Git/JJ executable and repository health; remote identity; separate fetch and push credential/permission readiness; conflicts, LFS and submodules; forge API account/scopes/version/capabilities; review API; provider-appropriate Actions/Pipelines; Origin CLI/profile only when used. Forge API authentication cannot substitute for Git transport readiness. |
| Backups & Recovery | Destination authentication/reachability, encrypted repository unlock status, Recovery Key/Kit public readiness, last complete backup, source/JJ coverage, verification/integrity, restore drill, retention/hold/prune, quota/archive retrieval and restore compatibility. Reuse N2-156 owner evidence and protected-data/no-mutation rules; Doctor never reads key/Kit bytes or unlocks a repository. |
| Updates | Application version/channel/install source, content/catalog currentness, helper/tool update readiness, migration/pre-update backup/recovery, rollback availability, and Client/Server protocol compatibility. Application update appearing in Server and Updates is one shared fact, not permission for duplicate active check identities. |
| Optional Capabilities | WSL, Apple Linux environment, GPU/KVM/Android/attached devices, container engines/clusters/registries, testing/debugging, LSP/formatters, plugins/skills/tools/MCP, only when configured, enabled or required by active work. Preserve each composite dimension; one Android or MCP check does not cover its sibling capabilities. Intentional Off is healthy when no active work requires it. Reuse existing domain checks, including N2-154 plugin checks; skill validation errors and formatter binary availability are required diagnostic dimensions, not merely audit suggestions. |

Source matrix labels identify retained obligations, not newly registered `doctor.*` IDs. Its 52 group occurrences contain 51 distinct tokens (`app_update` appears in two groups); neither count prescribes the runtime descriptor cardinality. Descriptor/schema/fixture companions must account for every source occurrence and the detailed composite dimensions, with exact owner, applicability and unsupported outcomes. A schema-valid generic descriptor alone does not prove that coverage or native execution. Final Product Onboarding invokes only its draft-required subset, not this whole inventory.

### Scheduling, caching, and stale rejection

Opening Doctor reads bounded cached projections first. It does not probe every configured record. The router selects visible, configured, relevant, stale, user-requested, or prerequisite checks; coalesces equal owner/target requests; obtains RuntimeResourceGovernor admission; and exposes one owner `ObservableWork` record. Cost classes are `instant_cached`, `light_local`, `network_bounded`, or `expensive_explicit`. Only `instant_cached` may run at entry without a user gesture. `expensive_explicit` requires an exact target and explicit action.

Every request binds `doctor_request_id`, `check_id`, Project/Server/Host/Environment/route/object identities as applicable, descriptor revision, owner projection generation, cache generation, deadline, permission snapshot, actor, redaction profile, and idempotency key. Results carry the same identities plus observed generation, start/finish time, evidence refs, receipt refs, and an owner result ref. Older descriptor, target, owner, cache, or continuation generations cannot overwrite a newer projection. Timeout, disconnect, interruption, and cancellation preserve the last known result with stale/interrupted disclosure; they do not become `healthy`.

Low-resource mode reduces concurrency and schedules checks in waves without removing domains. Closing Doctor detaches the viewer and does not cancel owner work; reopening joins the existing `ObservableWork` and current projection. A Client switch, Server restart, route change, or reconnect resumes only through matching durable owner identity and currentness.

An explicit user-requested **Run All Checks** is a finite, applicability-scoped composition of existing exact owner checks for the selected Doctor scope, never unbounded global discovery or an automatic entry sweep. Resolve applicable configured/current targets through this registry and freeze their exact owner, target, descriptor and currentness bindings for the request. Run only admitted read-only checks under existing per-check timeout, cost, coalescing and RuntimeResourceGovernor rules. Low-resource waves retain required domains. A target or descriptor change invalidates affected work rather than silently broadening the frozen set. Unsupported, deferred, skipped, cancelled, stale and failed items remain explicit; a partial batch cannot claim complete health.

The composition exposes truthful progress and stop/cancel/retry through existing owner `ObservableWork` semantics. Stopping future scheduling is not proof that an in-flight owner operation was cancelled; each running check uses its owner's supported cancellation boundary, and unsupported cancellation stays visible. Closing Doctor only detaches the viewer. Settings, Onboarding and other Clients join identical in-flight owner work rather than duplicate probes. This bounded composition does not register `cmd.doctor.run_all`, authorize mutation, create a Doctor domain handler or turn `refresh_visible` into an unrestricted all-record sweep. Its finite-set/controller contract and causal fixtures must be materialized separately; this prose does not claim that the existing single-check/visible-refresh schemas already enforce batch semantics.

The additive internal protocol in `Plans/doctor_query_controller_contracts.schema.json` materializes that finite composition. `pm.doctor.batch_request.v1` freezes the original actor, actual application/Server/Project scope, deadline and selected members, each with its authentic descriptor, target and owner/cache generations. The registry/applicability owner authenticates the selection, including explicit unavailable/unsupported members; later focus, discovery or refreshed authority cannot expand it. An empty applicable selection reports `no_applicable_checks`, not healthy. A retry is a fresh admitted batch related to the original; it does not edit historical selection or resume old authority.

`pm.doctor.owner_query_request.v1` binds the original batch/member, actual read admission, domain-owner query, governor admission and shared owner work. The domain owner's request and result must validate against the authentic selected descriptor's exact schema routes. `pm.doctor.owner_query_result.v1` records that original query, observed owner generation, actual terminal outcome, start/finish and bounded redacted evidence. Doctor retrieves and authenticates those actual originals; copied references, a mutation command, a current focus or serialized permission/currentness assertions cannot substitute. The Permissions-owned `pm.permissions.doctor_read_admission.v1` supplies human read authority for the actual scope without inventing a Project/executor attempt. Historical admission and current disclosure remain separate: current read permission/audit and native fences hold before dispatch, and disclosure is rechecked after result resolution. Existing FileSafe, storage, network/cost/resource and protected-data boundaries remain independent.

`pm.doctor.batch_result.v1` contains exactly one outcome per selected member, retaining unsupported, deferred, skipped, cancelled, stale and failed members. Completed query coverage is distinct from health; the domain owner's actual result determines the normalized finding. Unsupported/unavailable requires actual owner support/applicability evidence and cannot conceal an unimplemented descriptor or missing query interface. Separate controller records distinguish stop-future-scheduling, supported owner cancellation and viewer detach. A scheduling stop blocks later starts but cannot cancel work already in flight; a requested/refused/unsupported cancellation is not an owner terminal cancellation; viewer detach changes no member lifecycle. Resume requires actual original owner custody, never a replacement target or synthesized result.

These are internal nonpersisted request/controller/query envelopes, not a durable command archive or a new domain engine. Any retained result/projection facts require explicit existing Doctor/owner storage admission. Native resolver, policy issuance, query execution, effect-free read, governor, cancellation and recovery proof remain separate. The 52-source-occurrence coverage catalog is materialized separately from this common protocol and from authentic leaf binding; neither the catalog nor the protocol manufactures unsupported outcomes or claims all owner queries are bound or implemented.

`Plans/doctor_source_coverage.json`, constrained by `Plans/doctor_source_coverage.schema.json`, is the closed static source-occurrence catalog for N2-152, not an active Doctor registry or runtime record. It preserves all 52 source occurrences, 51 distinct labels, exact source matrix pointers and composite dimensions, canonical owner links and established typed-value references. The two `app_update` occurrences retain separate source identities and one shared fact key. Existing N2-154 plugin descriptor identities are retained without treating that subset as coverage of skill, tool, MCP, LSP or formatter siblings. The BRS-004 descriptor fixture is credited only for its existing nonsecret metadata subset, never complete Backup health.

Catalog completion means source obligations are exhaustively represented, not that full-dimension queries are bound. Each current full-dimension binding remains explicitly `unbound`; genuine existing bounded-leaf evidence is separate. This design-time state is neither a runtime unavailable/unsupported outcome nor permission to register a new descriptor, probe or mutation. Authentic descriptor population and exact owner query bindings remain required before check admission, with all N2-152/controller authority, applicability, support and currentness rules unchanged. Resolve and reuse current owner contracts before proposing an additional interface. No command, event, physical storage family, runtime admission or native proof is created by the catalog. Its static validator rejects dropped or duplicated occurrences, collapsed composite dimensions, unresolved established references, changed bounded-leaf routes and mutation/health authority claims.

<a id="doctor-app-update-owner-read-consumer"></a>
For the two `app_update` occurrences only, `Plans/Release_Supply_Chain.md#doctor-application-update-owner-read` defines the owner-read request/result obligation, with `Plans/Server_System.md` supplying the joined Server-owned protocol/version compatibility field. Doctor resolves both members through that one contract at the exact Server/application-installation/source/channel scope: one member query, one projected owner fact, both occurrence identities and dimension lists unchanged, and no second descriptor, check, query, scheduler, cache, storage value, command, event or policy for the Updates occurrence. The read stays read-only and never dispatches `cmd.update.app.check`, download, install/restart, rollback, cancel or the automatic toggle; command output, a cached projection, a copied ref and a schema-valid boolean are not that read. Both occurrences remain `full_dimension_query_binding: unbound` with `bounded_leaf: null` until the typed request/result, descriptor, catalog join and authentic owner-read currentness are present. An unimplemented query or absent owner support is not a fabricated `unsupported` finding, and the other 50 occurrences, their dimensions and `leaf_binding_status: incomplete` are unchanged.

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
canonical_text: Doctor owns one versioned registry of stable read-only check descriptors covering the required seven diagnostic groups and one bounded cached-first router with exact targets, cost classes, RuntimeResourceGovernor admission, ObservableWork, dedupe, freshness, generation fencing, redaction, owner remediation routing and explicitly requested finite Run All composition; domain owners retain truth and every mutation. The two application-update source occurrences share one exact-scope, read-only owner fact, not a second probe or mutation.
gui_related: false
depends_on: [N2-151, SIR-003, SIR-004, SIR-007, PSB-001]
unblocks: []
acceptance_criteria:
  - Duplicate active IDs, missing owners/schemas, mutating probes, unbounded targets, protected-auth access, and unregistered remediation actions fail closed.
  - Cached entry does not trigger an exhaustive probe storm and stale results cannot overwrite newer owner state.
  - Closing Doctor detaches the viewer without cancelling owner work.
  - One-time registry/cache migration preserves descriptor/finding currentness, names every dropped or quarantined row, references the canonical storage migration receipt, and cannot replay owner work or perform private repair.
  - Every applicable September 3 source diagnostic dimension maps to an owner-backed descriptor or explicit unsupported/unavailable projection across Server, Devices and Remote Access, AI Services, Code and Version History, Backups and Recovery, Updates, and Optional Capabilities; source labels/counts do not mint active IDs or prove native checks.
  - Composite dimensions preserve fetch versus push, forge API versus Git transport, reachability versus protocol/trust, Remote Link direct versus relay/E2E, LSP versus formatter availability, skill validation and independent provider generation versus Usage; optional Off does not degrade unrelated health.
  - Explicit Run All freezes a finite applicable owner/target/descriptor/currentness set, coalesces existing work, obeys per-check bounds and governor admission, and uses waves without dropping required domains; entry, stale-set broadening and mutating probes are forbidden.
  - Run All progress distinguishes partial, deferred, unsupported, cancelled, stale and failed work from complete health; stop-future-scheduling, supported owner cancellation and viewer detachment remain distinct, with no cmd.doctor.run_all registration or unrestricted refresh_visible sweep.
  - Final Product Onboarding runs only draft-required checks; full source coverage and finite-batch semantics require separate exact companion validation, not a generic-descriptor or single-check schema pass.
  - The versioned finite batch retains exact original membership and all terminal outcomes, composes authentic descriptor/request/result/current read authority, distinguishes query completion from health, and keeps stop scheduling, owner cancellation and viewer detach separate without registering cmd.doctor.run_all.
  - Source occurrences sep03-doctor-008 and sep03-doctor-043 retain their distinct identity and dimensions while sharing one authentic, current application-update owner read. Their full-dimension catalog bindings remain unbound until the exact typed owner result, Server protocol join and descriptor/query binding exist; command output and cached display are not substitutes.
validation_surfaces: [Plans/doctor_contracts.schema.json, Plans/doctor_contract_fixtures.json, Plans/doctor_query_controller_contracts.schema.json, Plans/doctor_query_controller_contract_fixtures.json, Plans/doctor_source_coverage.json, Plans/doctor_source_coverage.schema.json, tests/test_pm_doctor_source_coverage.py, registry and scheduling negative fixtures]
risk_class: doctor_registry_collision_or_parallel_engine
reasoning_tier: high
context_scope: doctor_registry_router
implementation_surfaces: [Plans/newtools.md, Plans/doctor_contracts.schema.json]
node_compile_hint: {mode: doctor_registry_router_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_report:register-settings-onboarding.md#D-01-through-D-07"
  - PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/07_DOCTOR_HEALTH_AND_REMEDIATION.md:7-35,95-103,124-126
  - PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/machine/doctor_check_matrix.json
  - PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/10_ACCEPTANCE_FAILURE_AND_USABILITY_MATRIX.md:103-110
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
