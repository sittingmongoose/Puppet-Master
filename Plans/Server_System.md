# Server System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes retained owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for the Puppet Master Server Catalog, stable Server and Client identity, endpoint association and deduplication, discovery, Client trust/pairing/session/revocation policy, the permanent Server and Client product boundary, and Server-owned continuity projections. Shared Integration Runtime retains execution-topology and runtime-lifecycle primitives; Project Sync and Backbone retains Project Move and content movement; Remote Access retains transport routes and WAN policy; Backup and Restore retains portable backup products.

## 0. Scope

Puppet Master is Server-first. Every Project has exactly one Project Home Server, one canonical writer, and one physical Project Vault. Native and web Clients render read-only projections and issue canonical commands; they do not become writable Project databases, execution owners, or backup authorities.

This owner defines the small Server Catalog and the identities that let every Client, endpoint observation, selected pairing candidate, pairing run, bootstrap run, session, command, and Project binding resolve to one cryptographic `server_id`. Labels, hostnames, IP addresses, URLs, ports, certificates, paths, and display names are mutable attributes, never identity. Discovery reports reachability candidates only. Deduplication requires verified Server identity; identity or certificate mismatch fails closed and never merges records.

Every standalone Windows, macOS, and Linux Server is a complete permanent product with authenticated typed APIs, durable event/projection streams, the complete permanent web UI, and normal execution capability. Desktop packages include the native Slint Client, dormant/private local Server capability, and Execution Host capability. Closing a Client does not stop Server-owned work. A frontend development server is tooling only and cannot substitute for the permanent product.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Project_Sync_and_Backbone.md, ContractName:Plans/Remote_Access_System.md, ContractName:Plans/Backup_Restore_System.md

## 1. Ownership And Consumers

### 1.1 Owned here

`Plans/Server_System.md` owns:

- `ServerCatalog`, `ServerRecord`, `ServerEndpointRecord`, `DiscoveryObservation`, `ClientRecord`, `ClientTrustRecord`, `PairingRun`, `ServerBootstrapRun`, `ClientAccessPolicy`, `ServerTrustRecord`, `RevocationRecord`, `SessionRecord`, and `ServerConnectionProjection` semantics;
- stable `server_id`, `server_endpoint_id`, `client_id`, and `pairing_session_id` identity and the verified deduplication rules joining endpoint observations to a Server;
- LAN DNS-SD/mDNS discovery disclosure, expiry, refresh, and the rule that discovery is never trust;
- Client pairing, scoped access, session issuance, currentness, revocation, and stolen/expired credential handling;
- the permanent native/web Client and Server product contract, Client disconnection behavior, cursor/snapshot catch-up, and bounded read-only Client caches;
- the Server Catalog boundary, reconstruction rules, aggregate health/currentness projections, and the non-reconstructable trust/global state handed to Full Server Backup; and
- the Server manager command vocabulary and read-only projections consumed by Settings, Onboarding, Doctor, status, native Clients, and the permanent web UI.

### 1.2 Retained owners

| Domain | Retained owner | Boundary consumed here |
|---|---|---|
| Runtime topology, `RuntimeResourceGovernor`, `ObservableWork`, environment supervision, durable outbox/replay | `Plans/Shared_Integration_Runtime.md` | Server binds and projects exact topology; it does not duplicate shared runtime state machines. |
| Physical Project Vault persistence, seglog/redb/Tantivy, recovery journals, storage migration | `Plans/storage-plan.md` | Catalog and identity values are persisted through Storage; this owner does not define a peer engine or use SQLite. |
| Project content, source relocation, Project Move, one-writer cutover | `Plans/Project_Sync_and_Backbone.md` | Changing Client, endpoint, remote route, Host, or Environment is not Project Move. |
| WAN routes, Tailscale/Headscale, Serve/Funnel, reverse proxy, Remote Link, VPN/manual endpoint, deployment exposure | `Plans/Remote_Access_System.md` | Server verifies identity and associates endpoints; Remote Access owns transport behavior and route policy. |
| Project Backup, Full Server Backup, portable-secret envelope, restore | `Plans/Backup_Restore_System.md` | Server declares catalog/trust inclusion classes and consumes backup/restore receipts. |
| Installation/auth/browser/source-control/container semantics | Their named owner docs | Server coordinates durable ownership without creating parallel registries or private handlers. |
| Commands, Event Authority, UI catalog, production wiring | `Plans/Commands_System.md`, `Plans/Contracts_V0.md`, `Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.production.json` | This owner supplies domain contracts; central owners must admit IDs, producers, schemas, handlers, and wiring. |
| Settings and shared GUI tokens | `Plans/Settings_System.md`, `Plans/FinalGUISpec.md` | They render the Server manager and status projections without owning Server semantics. |

### 1.3 Consumers

Settings, Product Onboarding, Server Claim/Bootstrap, Doctor, Home, Assistant Chat, Orchestrator, Goal Runtime, Executor, Project Move, Backup/Restore, Remote Access, Usage, native Clients, permanent web Clients, and automation/API surfaces consume this owner by stable identity and ContractRef. A consumer must not create a feature-local Server list, Client-trust store, pairing protocol, endpoint deduplication rule, or Server-currentness computation.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Settings_System.md

## 2. Canonical PlanUnits

### SRV-001 - Server System Authority And Product Boundary

```yaml
plan_unit_id: SRV-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Plans/Server_System.md is the sole owner for the Puppet Master Server Catalog, stable Server and Client identity,
  endpoint association and deduplication, discovery, Client trust/pairing/session/revocation policy, the permanent
  Server and Client product boundary, and Server-owned continuity projections. Shared Integration Runtime retains
  execution lifecycle and topology primitives; Project Sync and Backbone retains Project Move and content movement;
  Remote Access retains WAN transport routes; Backup and Restore retains portable backup products.
gui_related: true
gui_classification_reason: The owner boundary includes permanent native/web Client behavior and visible Server manager projections.
depends_on: [PDS-003, PDS-005, SIR-002, SIR-013]
unblocks: [SRV-002, SRV-003, SRV-004, SRV-005, SRV-006, SRV-007, SRV-008, SRV-009, SRV-010, RAS-001, BRS-001]
acceptance_criteria:
  - Owner maps route Server Catalog, Client trust, discovery, deduplication, pairing, revocation, and permanent Server disputes here.
  - Runtime, movement, WAN, backup, storage, command, event, security, and GUI owners remain referenced rather than duplicated.
  - No Client or endpoint is treated as a writable Project authority.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, python3 scripts/pm-plans-verify.py run-gates]
risk_class: server_parallel_owner_drift
reasoning_tier: high
context_scope: server_owner_routing
implementation_surfaces: [Plans/Server_System.md, Plans/server_system_contracts.schema.json]
node_compile_hint: {mode: server_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:chat:server-remote-backup-owner-adjudication-2026-08-31
  - source_ref:normalized-register:server-first-2026-08-31:A01-A05
preserved_exact_tokens: [Server First, Server Catalog, Project Home Server, permanent web UI, Client]
negative_constraints: [Do not create writable Client replicas., Do not duplicate retained owners., Do not treat this Plans compile as runtime proof.]
owner_hints: [Plans/Server_System.md]
```

### SRV-002 - Stable Identity, Catalog, And Verified Deduplication

```yaml
plan_unit_id: SRV-002
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Every Server has one cryptographic server_id. Server endpoint, Client, and pairing identities use stable
  server_endpoint_id, client_id, and pairing_session_id values; labels, URLs, hostnames, IPs, ports, paths, and
  certificate presentation are attributes only. ServerCatalog holds small identity, trust, Project-registration,
  backup/update-configuration, integration-reference, and aggregate-health records. Endpoint observations deduplicate
  only after verified server_id and certificate/fingerprint continuity; mismatch creates a blocked observation and
  never merges, changes Project authority, or creates a second Server.
gui_related: false
gui_classification_reason: Stable identity, Catalog, and deduplication are domain data contracts rather than GUI implementation work.
depends_on: [SRV-001, SIR-002]
unblocks: [SRV-003, SRV-004, SRV-006, RAS-002, BRS-002]
acceptance_criteria:
  - Changing a label, URL, address, route, or preferred endpoint preserves server_id.
  - Identity or certificate mismatch fails closed with both observations retained and no automatic merge.
  - Project registration is reconstructable from Vault manifests while non-reconstructable trust/global secure state is classified for Full Server Backup.
validation_surfaces: [Plans/server_system_contract_fixtures.json, future identity collision and deduplication tests]
risk_class: server_identity_collision_or_catalog_corruption
reasoning_tier: high
context_scope: server_catalog_identity
implementation_surfaces: [Plans/server_system_contracts.schema.json, future Server Catalog persistence]
node_compile_hint: {mode: stable_server_identity_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:S01-S05
  - source_ref:packet:10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
preserved_exact_tokens: [server_id, server_endpoint_id, client_id, pairing_session_id, ServerCatalog]
negative_constraints: [Do not use hostname URL IP label or path as identity., Do not auto-merge an identity mismatch., Do not put Project mutable payload in the Catalog.]
owner_hints: [Plans/Server_System.md, Plans/Shared_Integration_Runtime.md, Plans/storage-plan.md]
```

### SRV-003 - Minimal Discovery Is Not Trust

```yaml
plan_unit_id: SRV-003
unit_type: security_requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  LAN DNS-SD and mDNS discovery advertises only stable identity fingerprint, human name, TLS port, protocol range,
  claim or pairing summary, and minimal availability/capability. It never advertises Projects, paths, repositories,
  Goals, users, providers, storage, secrets, or remote configuration. Nearby, Known, QR, manual, private DNS, and
  Tailscale inventory may supply observations, but no broad subnet scan is allowed and no observation grants trust.
  Observations expire and remain separately attributable to their discovery source.
gui_related: true
gui_classification_reason: Nearby/Known Server lists, expiry, refresh, and pairing-required state are user-visible projections.
depends_on: [SRV-002]
unblocks: [SRV-004, SRV-008]
acceptance_criteria:
  - Discovery fixtures reject Project, path, user, provider, storage, and secret fields.
  - Expired observations do not disappear into a false current or trusted state.
  - Discovery disabled state prevents advertisement and active broad scanning without deleting known trusted Servers.
validation_surfaces: [Plans/server_system_contract_fixtures.json, future LAN VLAN IPv4 IPv6 mDNS tests]
risk_class: discovery_metadata_or_trust_leak
reasoning_tier: high
context_scope: server_discovery
implementation_surfaces: [Plans/server_system_contracts.schema.json, future discovery service and Server manager]
node_compile_hint: {mode: minimal_discovery_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R02
  - source_ref:packet:pm.remote_access_requirements.v1
preserved_exact_tokens: [DNS-SD, mDNS, Nearby, Known, discovery is not trust]
negative_constraints: [Do not advertise Project metadata., Do not perform broad subnet scans., Do not infer authorization from reachability.]
owner_hints: [Plans/Server_System.md, Plans/Remote_Access_System.md]
```

### SRV-004 - Pairing, Scoped Client Access, Sessions, And Revocation

```yaml
plan_unit_id: SRV-004
unit_type: security_requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Pairing uses an explicit pairing_session_id, explicit pairing_candidate_id, and verified Server identity through LAN
  discovery, QR, short code, fingerprint/certificate confirmation, manual URL, or approval by an already trusted
  Server-side Client. cmd.client.pair.start starts the selected method without granting trust; approve, reject, and
  cancel are distinct expected-generation-fenced transitions. QR and code material is consumed through an ephemeral
  handle, only its digest may be durable, and raw pairing secrets are never persisted. Reachability, localhost, LAN,
  tailnet, Funnel, proxy, Remote Link, or VPN never implies authorization. ClientTrustRecord and ClientAccessPolicy
  grant least-privilege scopes and bind protocol range, trust generation, expiry, and revocation. cmd.client.revoke
  increments authority generation, terminates all current sessions, rejects future sessions and stale commands, and
  remains restart-decidable from durable receipts.
gui_related: true
gui_classification_reason: Pairing prompts, fingerprint confirmation, Client lists, access scopes, expiry, and revocation are user-visible workflows.
depends_on: [SRV-002, SRV-003]
unblocks: [SRV-005, SRV-007, RAS-007]
acceptance_criteria:
  - Pairing cannot complete without explicit user or trusted-Client approval and identity confirmation.
  - A revoked or expired Client cannot reconnect, reuse a session, or publish a late command.
  - Sessions bind client_id, server_id, access-policy generation, protocol version, expiry, and non-secret currentness evidence.
validation_surfaces: [Plans/server_system_contract_fixtures.json, future stolen expired revoked access tests]
risk_class: client_trust_or_revocation_bypass
reasoning_tier: high
context_scope: client_trust_and_sessions
implementation_surfaces: [Plans/server_system_contracts.schema.json, future trust and session services]
node_compile_hint: {mode: client_trust_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:R03
  - source_ref:packet:10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
preserved_exact_tokens: [ClientTrustRecord, PairingRun, pairing_candidate_id, ClientAccessPolicy, ServerTrustRecord, RevocationRecord, SessionRecord, cmd.client.pair.start, cmd.client.pair.approve, cmd.client.pair.reject, cmd.client.pair.cancel, cmd.client.revoke]
negative_constraints: [Do not treat route possession as trust., Do not leave revoked sessions active., Do not persist raw pairing or session secrets in ordinary events.]
owner_hints: [Plans/Server_System.md, Plans/Permissions_System.md, Plans/FileSafe.md]
```

### SRV-005 - Permanent Server And Client Continuity

```yaml
plan_unit_id: SRV-005
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Every standalone Windows, macOS, and Linux Server provides authenticated typed API and projection streams, the
  complete permanent responsive web UI, and normal work execution. Desktop packages include the native Slint Client,
  dormant loopback/private local Server capability, and Execution Host capability. After owner claim,
  cmd.server.bootstrap.start separately bootstraps requested execution_form standalone or container, verifies durable
  roots or mounts and the immutable execution baseline, and never creates a reduced control-plane-only Server. Closing,
  refreshing, sleeping, or powering off a Client never cancels Server-owned Goal, turn, login, update, backup, Move,
  browser, build, or test. Reconnect and resume are exact cmd.server.connect modes using prior session and durable
  cursor/snapshot catch-up without duplicate or omitted entries; they do not mint separate commands or new work. Stop
  Server, restart, and move are explicit service/tray/menu operations; GUI close is not an implicit stop.
gui_related: true
gui_classification_reason: Native/web parity, disconnected/currentness state, explicit lifecycle controls, and responsive Client behavior are visible product behavior.
depends_on: [SRV-004, SIR-004, SIR-005]
unblocks: [SRV-007, SRV-008, RAS-008]
acceptance_criteria:
  - Native and web Clients use the same commands, identities, receipts, and projection cursors.
  - Standalone and container bootstrap preserve requested/effective execution_form, require a prior claim receipt, validate the execution baseline, and enable normal Server execution.
  - Client tab or process loss does not cancel Server-owned work.
  - Explicit Server stop is permission-gated, drains or checkpoints work, and exposes truthful blocked or recovery-required outcomes.
validation_surfaces: [future multi-Client cursor convergence tests, future native web parity tests, future GUI-close continuation tests]
risk_class: client_lifetime_becoming_server_lifetime
reasoning_tier: high
context_scope: permanent_server_client_product
implementation_surfaces: [future Server service, future native Client, future permanent web Client]
node_compile_hint: {mode: permanent_server_product_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:C01-C06
  - source_ref:packet:backbone_v5/10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
preserved_exact_tokens: [permanent web UI, Stop Server, restart, dormant, loopback, cmd.server.bootstrap.start, execution_form]
negative_constraints: [Do not use a frontend dev server as product architecture., Do not cancel work on Client close., Do not fabricate local filesystem or device capability in a web Client.]
owner_hints: [Plans/Server_System.md, Plans/Shared_Integration_Runtime.md, Plans/FinalGUISpec.md]
```

### SRV-006 - Execution Placement And Project Movement Boundary

```yaml
plan_unit_id: SRV-006
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Project Home Server, Connected Server, Execution Host, Execution Environment, Source Location, Client, endpoint, and
  remote route are distinct identities. The Home Server is the default Execution Host when compatible; Shared
  Integration Runtime owns execution assignment, leases, environment supervision, and handoff primitives. Changing a
  Client, endpoint, route, Host, Environment, or Source Location is not Project Move. Project Sync and Backbone alone
  owns verified Vault transfer and one-writer authority cutover. No automatic multi-Server failover or writable offline
  Client replica is permitted.
gui_related: true
gui_classification_reason: Connected Server, Hosted On, Run On, route, Move Project, and execution status must be visibly distinguished.
depends_on: [SRV-002, SIR-002, PSB-001]
unblocks: [SRV-008, RAS-002]
acceptance_criteria:
  - Commands bind exact Server, Project, Host, Environment, source, and expected generation where applicable.
  - Route or Client changes never mutate Project Home Server or start Project Move.
  - Project Move consumes a verified recovery point and retains one-writer cutover and rollback under its owner.
validation_surfaces: [future topology identity fixtures, future route-versus-move negative tests, future stale-owner fencing tests]
risk_class: execution_or_movement_authority_drift
reasoning_tier: high
context_scope: server_execution_movement_boundary
implementation_surfaces: [Plans/Server_System.md, Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md]
node_compile_hint: {mode: execution_movement_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:C05-C09
  - source_ref:packet:01_FULL_THREAD_DECISION_REGISTER.md
preserved_exact_tokens: [Project Home Server, Connected Server, Execution Host, Execution Environment, Source Location, Move Project]
negative_constraints: [Do not normalize distinct topology identities into one host string., Do not call a route change Project Move., Do not create automatic writable failover.]
owner_hints: [Plans/Server_System.md, Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md]
```

### SRV-007 - Durable Commands, Currentness, And Bounded Client Projection

```yaml
plan_unit_id: SRV-007
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  One Client command targets one Server and executes once through a typed idempotent envelope with expected Catalog,
  trust, topology, and session generations. cmd.server.connect carries exact connect, reconnect, and resume modes;
  reconnect requires the prior session and resume additionally requires the durable cursor, while neither creates a
  second semantic handler. Server projections distinguish loading, cached, current, stale, offline,
  unauthorized, protocol_mismatch, identity_mismatch, degraded, blocked, and recovery_required without converting a
  transport observation into durable success. Client caches are bounded and read-only. Slow or malicious Clients use
  bounded queues and cannot backpressure Goals, duplicate work, or force eager hydration of every Project or manager.
gui_related: true
gui_classification_reason: Currentness, disabled reasons, connection health, progress, retry, and recovery states are visible on every Client.
depends_on: [SRV-004, SRV-005, SIR-004, SIR-005, SIR-006]
unblocks: [SRV-008, SRV-010]
acceptance_criteria:
  - Replayed commands preserve idempotency and reject stale expected generations.
  - Reconnect/resume returns the requested/effective mode and exact prior-session cursor or snapshot continuation without replaying work.
  - Cached or stale data is never labeled current or Synced.
  - Bounded queues and projections preserve Server work under slow or malicious Client pressure.
validation_surfaces: [Plans/server_system_contract_fixtures.json, future reconnect storm and malicious backpressure tests]
risk_class: duplicate_command_or_false_currentness
reasoning_tier: high
context_scope: server_command_and_projection_continuity
implementation_surfaces: [Plans/server_system_contracts.schema.json, Plans/shared_runtime_contracts.schema.json, future Server API]
node_compile_hint: {mode: server_continuity_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:C01-C06
  - source_ref:packet:B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md
preserved_exact_tokens: [cached, current, stale, offline, protocol_mismatch, identity_mismatch, recovery_required, connect, reconnect, resume]
negative_constraints: [Do not label cached state current., Do not let Client queues backpressure Goals., Do not execute a replayed command twice.]
owner_hints: [Plans/Server_System.md, Plans/Shared_Integration_Runtime.md]
```

### SRV-008 - Canonical Server Commands And UI Projections

```yaml
plan_unit_id: SRV-008
unit_type: integration_contract
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  The Server manager, Settings, Onboarding, Doctor, palette, native/web UI, natural-language routing, and API/automation
  surfaces use the exact 32-command owner inventory listed here: the retained 26-command cmd.server manager inventory
  plus six narrowly owned bootstrap/pairing/trust commands. Each visible action requires one central
  registration, typed request/result/error, sole handler, permission and confirmation policy, idempotency/currentness,
  ObservableWork when asynchronous, receipt or explicit no-persist result, accessibility/focus return, and production
  wiring. UI projections use stable IDs, route to owner details, and show truthful availability and disabled reasons.
gui_related: true
gui_classification_reason: This unit defines Server manager actions, compact cards, status, details, focus return, and native/web parity.
depends_on: [SRV-003, SRV-004, SRV-005, SRV-006, SRV-007]
unblocks: [SSYS-012]
acceptance_criteria:
  - Every listed Server-owned command has one central command and UI-catalog row plus one production wiring handler before enablement.
  - Server cards distinguish Connected Server, Home Server, processing capability, paired Clients, route, version, and exact currentness.
  - Missing central registration, schema, handler, event admission, or wiring disables the affected action with the exact reason.
validation_surfaces: [Plans/server_system_contract_fixtures.json, future production wiring reverse coverage, future native web focus and keyboard tests]
risk_class: visible_server_action_without_owner_wiring
reasoning_tier: high
context_scope: server_commands_and_ui
implementation_surfaces: [Plans/Server_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: server_command_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:G01-G06
  - source_ref:packet:10_COMMAND_EVENT_RECEIPT_CENSUS.md
preserved_exact_tokens: [cmd.server.add, cmd.server.claim, cmd.server.connect, cmd.server.bootstrap.start, cmd.client.pair.start, cmd.client.pair.approve, cmd.client.pair.reject, cmd.client.pair.cancel, cmd.client.revoke, cmd.server.discovery.refresh, cmd.server.endpoint.test]
negative_constraints: [Do not enable an unregistered command., Do not create a Settings-local handler., Do not treat concept JavaScript as production wiring.]
owner_hints: [Plans/Server_System.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
```

### SRV-009 - Catalog Migration And Crash-Safe Convergence

```yaml
plan_unit_id: SRV-009
unit_type: migration_requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Migration from app-global Project state to the small Server Catalog plus one physical Vault per project_id is
  versioned, staged, one Project at a time, resumable, idempotent, hash/event/projection/blob verified, crash-safe,
  atomically activated, and rollback-capable. StorageMigrationCoordinator remains the only migration actor. A verified
  Full Server pre-migration backup and retained rollback generation are required. Restart converges each durable phase
  to resume, commit, rollback, quarantine, or recovery_required; missing evidence never becomes success and unrelated
  Projects remain available.
gui_related: true
gui_classification_reason: Migration phase, blocked reason, rollback availability, quarantine, and recovery-required state are visible progress and remediation surfaces.
depends_on: [SRV-002, BRS-005]
unblocks: [SRV-010]
acceptance_criteria:
  - Process death at every phase converges without a second Catalog identity or partial false completion.
  - Pre-migration backup verification and rollback generation are durable prerequisites to activation.
  - One Project failure does not mutate or prevent unrelated Projects.
validation_surfaces: [future per-phase crash injection, future migration idempotency tests, future unrelated-Project isolation tests]
risk_class: catalog_migration_data_loss_or_false_completion
reasoning_tier: high
context_scope: server_catalog_migration
implementation_surfaces: [Plans/Server_System.md, Plans/storage-plan.md, Plans/Backup_Restore_System.md]
node_compile_hint: {mode: catalog_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:S08-S11
  - source_ref:packet:04_STORAGE_AND_PROJECT_VAULT_MIGRATION.md
preserved_exact_tokens: [StorageMigrationCoordinator, Full Server pre-migration backup, rollback generation, recovery_required]
negative_constraints: [Do not migrate without a verified backup., Do not make absence of evidence success., Do not block unrelated Projects.]
owner_hints: [Plans/Server_System.md, Plans/storage-plan.md, Plans/Backup_Restore_System.md]
```

### SRV-010 - Server Acceptance And Proof Boundary

```yaml
plan_unit_id: SRV-010
unit_type: validation_requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Server acceptance requires schema and negative fixtures, identity/deduplication, discovery disclosure, pairing and
  revocation, multi-Client cursor convergence, stale endpoint, protocol mismatch, GUI-close continuation, bounded
  queue/backpressure, Catalog reconstruction, migration crash, native/web parity, security, performance, accessibility,
  and command/wiring evidence. Static Plans, schemas, validators, concepts, or generated indexes are not runtime,
  native-platform, security, performance, visual, readiness, or certification proof. Unavailable lanes remain not_run
  with named residual risk.
gui_related: true
gui_classification_reason: Acceptance includes permanent native/web UI state, accessibility, responsiveness, focus, and visible failure behavior.
depends_on: [SRV-007, SRV-008, SRV-009]
unblocks: []
acceptance_criteria:
  - Positive and negative schema fixtures pass their expected disposition.
  - Runtime evidence covers the full identity, trust, continuity, migration, security, performance, and UI matrix before readiness is claimed.
  - Failures and unavailable lanes remain failures or not_run with named residual risk.
validation_surfaces: [Plans/server_system_contract_fixtures.json, Plans/Automated_Testing_System.md, future Server acceptance receipts]
risk_class: static_evidence_promoted_to_server_readiness
reasoning_tier: high
context_scope: server_acceptance
implementation_surfaces: [Plans/Server_System.md, future Server tests and evidence]
node_compile_hint: {mode: server_acceptance_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:normalized-register:server-first-2026-08-31:V01-V03
  - source_ref:normalized-register:server-first-2026-08-31:V09-V12
preserved_exact_tokens: [not_run, residual risk, no readiness claim, no certification claim]
negative_constraints: [Do not promote schema validation to runtime proof., Do not hide failed or missing evidence., Do not claim Server readiness from a UI fixture.]
owner_hints: [Plans/Server_System.md, Plans/Automated_Testing_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

### 3.1 Machine contracts

`Plans/server_system_contracts.schema.json` is the Draft 2020-12 machine owner for:

- `ServerCatalog`, `ServerRecord`, and `ServerEndpointRecord`;
- `DiscoveryObservation` with metadata-minimal disclosure and expiry;
- `ClientTrustRecord`, `PairingRun`, `ServerBootstrapRun`, and `SessionRecord` trust/currentness and product-bootstrap shapes;
- command result and availability projections with currentness and mismatch states;
- discriminated command payload, result, error, availability, permission, and disabled-reason records for the retained 26 primary `cmd.server.*` manager commands plus six supplemental owner commands for bootstrap, pairing, and Client trust revocation;
- exact return-context round trips, explicit integration-evidence gates, and `ObservableWork` links; and
- durable Server lifecycle and Catalog-migration records with restart convergence, verified-backup activation, and Client-close non-cancellation invariants.

`Plans/server_system_contract_fixtures.json` supplies one positive payload instance for every retained primary manager command, at least one for every supplemental owner command, method/peer/bootstrap variants, and positive and negative identity, trust, lifecycle, migration, exact-return, availability, permission, secret-redaction, and disabled-reason instances. These schemas close data shape only. They do not register a command or EventRecord producer, create storage-family rows, implement trust cryptography, or prove runtime behavior.

The schema root carries aggregate identity `x-schema-id = pm.server_system.contracts.v1`, the retained validator-bound `x-primary-command-count = 26` / `x-command-contracts` inventory, and the owner-total `x-owner-command-count = 32` with an exact six-row `x-supplemental-command-contracts` inventory. Each command entry names payload/result/error/availability/permission/disabled refs, availability/disabled selectors, permission class, persistence expectation, `ObservableWork` expectation, and the truthful pending central-registration/handler/wiring/event state. The split preserves the existing manager-inventory validator while making the six new domain commands explicit; it does not demote them to aliases. The fixture envelope ID `pm.server_system.contract_fixtures.v1` is test-only; its `contract_schema_id` points to the aggregate owner and is never a runtime record discriminator.

### 3.2 Identity and state rules

| Shape | Required identity/currentness rule |
|---|---|
| Server Catalog | Monotonic `catalog_revision`; one `server_id` per Server; one `project_id` registration per Project; no Project payload bytes. |
| Endpoint | Belongs to one `server_id`; address is an attribute; identity verification is `unverified`, `verified`, `mismatch`, `revoked`, or `expired`. |
| Discovery observation | Carries source, expiry, fingerprint, protocol range, TLS and minimal capability only; it cannot be trusted by observation. |
| Client trust | Binds `client_id`, `server_id`, access-policy ID/generation, trust generation, verification method, expiry, and revocation state. |
| Pairing run | Binds exact `pairing_session_id`, explicitly selected `pairing_candidate_id`, requested/effective method, expected fingerprint, pairing generation, approval actor, expiry, and digest-only durable material; raw QR/code secrets and their process-local handles are not persisted. |
| Session | Binds Client, Server, trust generation, access-policy generation, protocol version, issued/expiry timestamps, and state; no secret token bytes. |
| Connection projection | Uses `loading`, `cached`, `connecting`, `current`, `stale`, `offline`, `unauthorized`, `protocol_mismatch`, `identity_mismatch`, `degraded`, `blocked`, or `recovery_required`. |
| Bootstrap run | Binds prior claim receipt, requested/effective `execution_form`, standalone/container platform, durable roots/mount proof, immutable execution baseline, remote-access disposition, `ObservableWork`, receipt, and failure/currentness state; control-plane-only Server bootstrap is forbidden. |

### 3.3 Event Authority candidates

The following domain event IDs are canonical owner candidates but remain non-emitting until individually admitted in `Plans/event_family_registry.json` with producer, payload schema, retention, redaction, and consumer coverage:

- `server.catalog_changed`
- `server.endpoint_changed`
- `server.discovery_observed`
- `server.discovery_expired`
- `server.identity_mismatch_detected`
- `server.client_pairing_state_changed`
- `server.client_trust_changed`
- `server.client_revoked`
- `server.connection_state_changed`

No prose occurrence or schema fixture is Event Authority admission.

ContractRef: SchemaID:pm.server_system.contracts.v1, ContractName:Plans/Contracts_V0.md, ContractName:Plans/event_family_registry.json

## 4. Integration Surfaces

### 4.1 Canonical command family requiring central integration

The retained Server-manager inventory accepts exactly 26 primary domain IDs. `Plans/server_system_contracts.schema.json` materializes their static typed owner contracts. Root integration must still reconcile/register them in Commands System and UI Command Catalog, identify one sole native handler, admit an event or declare a receipt-only effect, and add production wiring before an action is enabled:

`cmd.server.add`, `cmd.server.claim`, `cmd.server.connect`, `cmd.server.select`, `cmd.server.rename`, `cmd.server.test_connection`, `cmd.server.open_web`, `cmd.server.processing.set_enabled`, `cmd.server.capabilities.refresh`, `cmd.server.restart`, `cmd.server.stop`, `cmd.server.remove`, `cmd.server.open_details`, `cmd.server.open_logs`, `cmd.server.update_policy`, `cmd.server.discovery.refresh`, `cmd.server.discovery.set_enabled`, `cmd.server.discovery.open_nearby`, `cmd.server.endpoint.add_manual`, `cmd.server.endpoint.update`, `cmd.server.endpoint.remove`, `cmd.server.endpoint.test`, `cmd.server.endpoint.set_preferred`, `cmd.server.endpoint.copy`, `cmd.server.endpoint.open`, `cmd.server.endpoint.open_details`.

Every mutation request carries `command_id`, `server_id` when known, exact target identity, expected revision/generation, idempotency key, correlation ID, permission snapshot, return context, and reason/confirmation where required. Async work links `ObservableWork`. Secret or session-token material is prohibited in command history, routes, logs, events, Chat, and Usage.

Static contract materialization does not cure the integration gap. Every command remains unavailable unless its central row, schema binding, native handler, permission route, receipt/event disposition, and production wiring are all present and current; `server.command.availability.v1` and `server.command.disabled_reason.v1` carry that fail-closed truth explicitly.

### 4.2 Pairing, trust, and bootstrap owner-command closure

The Server owner additionally accepts exactly six primary domain commands. They are not compatibility aliases and do not replace the retained 26 Server-manager IDs:

- `cmd.server.bootstrap.start` starts the post-claim durable `ServerBootstrapRun` for requested `execution_form = standalone|container`; it requires a claim receipt, exact roots/mount evidence, immutable execution-baseline manifest, explicit consent, requested/effective form, and `ObservableWork`. It must not be collapsed into `cmd.server.claim`, silently create a control-plane-only Server, or mutate a disposable container layer.
- `cmd.client.pair.start` starts one generation-fenced `PairingRun` for an explicitly selected `pairing_candidate_id` using LAN discovery, QR, short code, manual URL, or trusted-Client approval. QR/code input uses a process-local ephemeral dispatch handle and durable SHA-256 binding; no raw secret or handle is persisted in command history, receipts, events, logs, Chat, Usage, or ordinary projections.
- `cmd.client.pair.approve` records explicit identity confirmation and trusted approval for a current waiting pairing generation before trust issuance.
- `cmd.client.pair.reject` is the trusted approver's terminal refusal with an exact reason and current pairing generation.
- `cmd.client.pair.cancel` is the requesting Client's terminal abort before trust issuance, distinct from rejection.
- `cmd.client.revoke` revokes the entire `ClientTrustRecord`, increments trust generation, terminates every active session for that Client, rejects stale commands, and writes the durable revocation receipt. Session-only revocation is not substituted for this trust action.

`cmd.server.connect` remains the sole Server connection command. Its typed `connection_mode = connect|reconnect|resume` preserves exact requested/effective intent: reconnect requires a prior session; resume additionally requires its durable cursor and does not create new work. Separate `cmd.server.reconnect` or `cmd.server.resume` handlers would duplicate the same semantic operation and are not added.

QR import and Tailscale/Headscale peer selection also do not mint independent side-effect commands. QR import is `candidate_source = qr_pairing_link` on `cmd.client.pair.start`; explicit peer selection is the required `pairing_candidate_id`, including `tailscale_peer` and `headscale_peer` candidates. Neither parsing a QR payload nor selecting a reachability candidate grants trust. A raw QR/code value never crosses the durable command boundary.

The schema exposes these six through `x-supplemental-command-contracts`, typed `supplemental_command_*` records, command-specific receipt refs, availability/disabled selectors, permission classes, currentness, expected generations, exact return context, and truthful `pending_central_integration` / `not_proven` status. Missing central rows or native wiring keeps every affected action disabled.

### 4.3 UI projection grammar

The normal Server card shows only:

- human name and exact connection/currentness state;
- `Connected Server` and, per Project, `Home Server` without collapsing the two;
- route summary supplied by Remote Access;
- protocol/version compatibility;
- local processing enabled/disabled and capability summary;
- paired Client count and attention state; and
- primary actions such as Change/Add, Open Web, Test, and Details when centrally wired.

Details/Advanced may show stable IDs, endpoints, certificates/fingerprints, trust generations, protocol range, exact Host/Environment, logs, receipts, and diagnostics. The bottom status uses truthful examples such as `<Home Server> · Connected`, `Server Offline`, `Version Update Required`, `Reconnecting`, or `Remote Access Needs Attention`. Routine `Synced` is forbidden.

### 4.4 Central files intentionally not edited here

The parent/root lane must integrate:

- owner routing in `Plans/00-plans-index.md`, `Plans/Crosswalk.md`, and `Plans/DRY_Rules.md`;
- command rows in `Plans/Commands_System.md` and `Plans/UI_Command_Catalog.md`;
- Event Authority entries and payload refs in `Plans/event_family_registry.json` and Contracts;
- sole-handler rows in `Plans/Wiring_Matrix.production.json` plus UI wiring/reverse coverage;
- storage value/retention/redaction/migration registrations after schemas stabilize;
- Settings manager/search descriptors and owner routes; and
- generated PlanUnit indexes and governance artifacts only in their authorized later phases.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json

## 5. Validation And Acceptance

| Matrix | Required positive coverage | Required negative/failure coverage |
|---|---|---|
| Identity and Catalog | Stable ID through rename/address/route change; reconstruct Project registration from Vault manifest | ID/certificate mismatch; duplicate label/address; corrupt Catalog; no false merge |
| Discovery | LAN/VLAN, IPv4/IPv6, mDNS expiry and refresh | Metadata leak, broad scan, expired observation called current, reachability called trust |
| Pairing and trust | explicit candidate; QR/code/manual/trusted-Client start; approve/reject/cancel; scoped trust policy and revoke-all-sessions receipt | raw or persisted pairing secret, implicit trust from discovery, expired/replayed generation, wrong fingerprint, approval omission, reject/cancel conflation, revoked Client reuse |
| Client continuity | two Clients observe one operation; exact connect/reconnect/resume mode; cursor and snapshot continuation | duplicate/omitted entry, reconnect minted as peer handler, resume without cursor, GUI-close cancellation, slow/malicious backpressure |
| Product parity and bootstrap | native and permanent web use same commands/receipts; standalone/container requested/effective form; execution baseline and durable roots/mounts | web fabricates filesystem/PTY/device capability; bootstrap collapsed into claim; control-plane-only Server; unverified container mounts; dev server substituted for product |
| Migration | one-Project-at-a-time verified migration and rollback | process death at every phase, ENOSPC/EIO, corrupt journal, unrelated-Project mutation |
| Commands/wiring | one central ID, schema, handler, receipt, focus return, native/web parity | private handler, unexpected event, stale generation, missing disabled reason |
| Performance/accessibility | bounded caches/queues/lazy hydration/old hardware; keyboard/focus/reduced motion | eager manager hydration, per-record thread/process, clipped/unreachable action |

Schema fixtures validate shape and explicit invariants only. Runtime, native-platform, WAN, security, migration, performance, visual, and accessibility claims require fresh execution and raw receipts.

## 6. Plan-To-Node Readiness

| Area | Canonical classification | Required before node-ready |
|---|---|---|
| Owner placement and PlanUnits | `specified` | Index and owner-map integration by the authorized central lane |
| Record schemas and fixtures | `specified_static` | Fixture validation plus storage/event/command registry integration; the 32-command owner inventory remains static only |
| Command/event/handler/wiring | `blocked_integration_missing` | Central registration, one handler, production row, reverse coverage |
| Native/web Server runtime | `not_implemented_or_proven` | Build, lifecycle, security, platform, parity, and failure evidence |
| Migration | `specified_not_executed` | Clean-room migration and per-phase crash receipts |
| Readiness/certification | `blocked_runtime_certification_incomplete` | Governed runtime lifecycle and clean-room gate closure including PNC-019 |

All SRV PlanUnits are Plans-only. They create no WorkNodes, NodeSeeds, executable queues, implementation files, product launch, or certification.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Future Swift iOS/iPadOS and Kotlin Android Clients use the same Server protocol for monitoring/control and basic administration; they are not initial full local Execution Hosts.
- Automatic multi-Server failover, writable offline replicas, multi-master databases, relay/live database replication, routine sync-conflict management, and routine `Synced` are retired/rejected.
- Separate `cmd.server.reconnect`, `cmd.server.resume`, QR-import, or peer-selection side-effect handlers are rejected because their exact intent is already typed into `cmd.server.connect` or `cmd.client.pair.start`; this does not make discovery or QR parsing trusted.
- A Client display does not own Server update, Project Vault, Goal execution, trust, backup, or route state.
- LSP's unrelated “server catalog” must never satisfy or alias Puppet Master's Server Catalog.
- This owner does not choose Remote Link infrastructure, VPN administration, backup crypto algorithms, storage engines, Project Move transfer algorithms, or provider-auth custody.
- Time-sensitive packaging/platform support must be reverified at implementation time.

## 8. Source Lineage And Governance

This owner compiles the user-authorized Server First requirements normalized in the 2026-08-31 Server register, especially A01-A05, S01-S12, C01-C15, R01-R03, G01-G14, and V01-V12. Packet requirement IDs and candidate filenames were source-lineage proposals; this file and prefix `SRV` are canonical only because the owner lane explicitly adjudicated them here.

Primary lineage:

- `02_PRODUCT_ARCHITECTURE.md`
- `04_STORAGE_AND_PROJECT_VAULT_MIGRATION.md`
- `10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md`
- `backbone_v5/10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md`
- `01_FULL_THREAD_DECISION_REGISTER.md`
- `B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md`
- `10_COMMAND_EVENT_RECEIPT_CENSUS.md`

This compile does not edit generated shards/evidence, PlanUnit indexes, Spec Lock, auto decisions, command/event catalogs, production wiring, or runtime implementation. Structural/schema success must not be reported as product completeness, readiness, visual acceptance, security proof, or certification.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Decision_Policy.md, Gate:PNC-019

## Server command-gap owner closure - trusted Client management (2026-09-01)

`ClientTrustRegistry` owns one closed `ClientTrustCommandRequest|Result|Error|Availability|DisabledReason|PermissionDecision` family in `Plans/server_system_contracts.schema.json` for `cmd.client.access.update`, `cmd.client.remove`, `cmd.client.rename`, and `cmd.client.session.revoke`. Sole future handlers are `handlers::client_trust::access_update`, `handlers::client_trust::remove`, `handlers::client_trust::rename`, and `handlers::client_trust::session_revoke`. All four remain `handler_unavailable` until complete central and native integration. Source token `cmd.client.open_details` is retained only as the adjudicated spelling for `ui.client.open_details`, a bounded redacted local projection with an owner-local UI controller only, no domain handler, and no domain EventRecord.

The exact consumers are Settings > Servers > Clients, pairing/trust surface, Server permanent web UI, and Doctor. Access update preserves Client and trust identity and requires expected trust, policy, and session generations. Remove applies only to an already revoked or retired catalog record after every active session and dependency is settled; it never substitutes for `cmd.client.revoke`. Rename changes display metadata only. Session revoke targets exactly one session and preserves the Client trust record and all other sessions. Requests/results/logs/receipts/details carry stable refs and redacted metadata only, never pairing secrets, session tokens, cookies, credential material, private keys, or protected authentication state.

Idempotency plus trust/policy/session/catalog generations make duplicate or racing commands converge. Restart reloads the durable trust mutation journal and produces resume, rollback, or `recovery_required`, never fabricated success. Exact return restores the initiating surface, route, focus, and generation or reports `caller_unavailable`; another connected Client is not a fallback.

### SRV-011 - Trusted Client Management Command Closure

```yaml
plan_unit_id: SRV-011
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  ClientTrustRegistry owns four exact access-update, catalog-remove, rename, and single-session-revoke commands through
  one closed family plus one local details action. Commands remain handler_unavailable until named sole handlers and
  central integration exist; stable Client/trust/session identity, generation, revocation/removal separation, restart,
  race, permission, exact-return, and secret-exclusion rules fail closed.
gui_related: true
gui_classification_reason: Trusted Client management and details are visible across four named consumers.
depends_on: [SRV-004, SRV-007, SRV-008]
unblocks: []
acceptance_criteria:
  - The schema and fixtures cover exactly four new ClientTrust command IDs, four sole handlers, and ui.client.open_details without a domain handler or EventRecord.
  - Remove is rejected until trust is revoked/retired and every session/dependency is settled; single-session revoke preserves trust and peer sessions.
  - Positive and negative fixtures cover all consumers, generations, duplicate/race, restart, permission, exact return, and secret redaction.
  - No static artifact claims native trust mutation or runtime security proof.
validation_surfaces: [Plans/server_system_contracts.schema.json, Plans/server_system_contract_fixtures.json, focused Server owner-bundle-A validator]
risk_class: client_trust_identity_or_revocation_scope_corruption
reasoning_tier: high
context_scope: server_command_gap_client_trust
implementation_surfaces: [Plans/Server_System.md, Plans/server_system_contracts.schema.json, future ClientTrustRegistry handlers]
node_compile_hint: {mode: client_trust_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-18-22]
negative_constraints:
  - Do not treat Client removal as trust revocation.
  - Do not revoke peer sessions when one exact session is targeted.
  - Do not expose pairing or session secrets through details, receipts, logs, or results.
```

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 25 previously unbound primary commands. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.server.add` | `handlers::server::add` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.capabilities.refresh` | `handlers::server::capabilities_refresh` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.claim` | `handlers::server::claim` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.discovery.open_nearby` | `handlers::server::discovery_open_nearby` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.discovery.refresh` | `handlers::server::discovery_refresh` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.discovery.set_enabled` | `handlers::server::discovery_set_enabled` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.add_manual` | `handlers::server::endpoint_add_manual` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.copy` | `handlers::server::endpoint_copy` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.open` | `handlers::server::endpoint_open` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.open_details` | `handlers::server::endpoint_open_details` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.remove` | `handlers::server::endpoint_remove` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.set_preferred` | `handlers::server::endpoint_set_preferred` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.test` | `handlers::server::endpoint_test` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.endpoint.update` | `handlers::server::endpoint_update` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.open_details` | `handlers::server::open_details` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.open_logs` | `handlers::server::open_logs` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.open_web` | `handlers::server::open_web` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.processing.set_enabled` | `handlers::server::processing_set_enabled` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.remove` | `handlers::server::remove` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.rename` | `handlers::server::rename` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.restart` | `handlers::server::restart` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.select` | `handlers::server::select` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.stop` | `handlers::server::stop` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.test_connection` | `handlers::server::test_connection` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |
| `cmd.server.update_policy` | `handlers::server::update_policy` | `Plans/server_system_contracts.schema.json#/$defs/command_payload` -> `Plans/server_system_contracts.schema.json#/$defs/command_result` | `Plans/server_system_contracts.schema.json#/$defs/command_error` / `Plans/server_system_contracts.schema.json#/$defs/command_permission` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.server.add`, `cmd.server.capabilities.refresh`, `cmd.server.claim`, `cmd.server.discovery.open_nearby`, `cmd.server.discovery.refresh`, `cmd.server.discovery.set_enabled`, `cmd.server.endpoint.add_manual`, `cmd.server.endpoint.copy`, `cmd.server.endpoint.open`, `cmd.server.endpoint.open_details`, `cmd.server.endpoint.remove`, `cmd.server.endpoint.set_preferred`, `cmd.server.endpoint.test`, `cmd.server.endpoint.update`, `cmd.server.open_details`, `cmd.server.open_logs`, `cmd.server.open_web`, `cmd.server.processing.set_enabled`, `cmd.server.remove`, `cmd.server.rename`, `cmd.server.restart`, `cmd.server.select`, `cmd.server.stop`, `cmd.server.test_connection`, `cmd.server.update_policy`.

Exact sole future handler set: `handlers::server::add`, `handlers::server::capabilities_refresh`, `handlers::server::claim`, `handlers::server::discovery_open_nearby`, `handlers::server::discovery_refresh`, `handlers::server::discovery_set_enabled`, `handlers::server::endpoint_add_manual`, `handlers::server::endpoint_copy`, `handlers::server::endpoint_open`, `handlers::server::endpoint_open_details`, `handlers::server::endpoint_remove`, `handlers::server::endpoint_set_preferred`, `handlers::server::endpoint_test`, `handlers::server::endpoint_update`, `handlers::server::open_details`, `handlers::server::open_logs`, `handlers::server::open_web`, `handlers::server::processing_set_enabled`, `handlers::server::remove`, `handlers::server::rename`, `handlers::server::restart`, `handlers::server::select`, `handlers::server::stop`, `handlers::server::test_connection`, `handlers::server::update_policy`.

### SRV-012 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: SRV-012
unit_type: command_binding
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Server System owns exactly 25 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 25 commands and their exact disabled reasons.
depends_on: [SRV-008, SRV-011]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 25-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
validation_surfaces:
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
risk_class: command_route_authority_and_runtime_claim_boundary
reasoning_tier: high
context_scope: canonical_owner_command_binding
implementation_surfaces:
- Plans/Server_System.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: owner_adjudicated_future_handler_bindings
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not claim a native handler, runtime dispatch, durable effect, registered event, security result, readiness, or certification from this Plans-only binding.
- Do not duplicate owner schemas, state machines, repair logic, credentials, or provider operations in Settings, Onboarding, Doctor, or PMConcept7.
- Do not expose protected-auth content, secret bytes, private browser state, or provider credentials to agents, adapters, logs, receipts, capture, or ordinary GUI projections.
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/touch_closure.json

## Forge/Backup/tsnet cross-owner consumer addendum - 2026-09-01

This addendum consumes the accepted Backup/Restore and Remote Access owner contracts without moving either engine into
the Server owner. It supersedes only older Server wording that could imply host-Tailscale adoption, a second Server
identity, Client-lifetime scheduling, or that a pre-migration backup proves the new Backup runtime.

### SRV-013 - Backup continuity and remote-endpoint provenance

```yaml
plan_unit_id: SRV-013
unit_type: integration_contract
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Server consumes Backup/Restore policy and run contracts through one durable schedule-occurrence, outbox, writer,
  and maintenance-authority projection that survives every Client and restart. It also consumes Remote Access endpoint
  provenance that distinguishes PM-connector private ingress, hosted Funnel, and verified external host-Tailscale
  routes while deduplicating only by cryptographically verified server_id. A connector node identity is infrastructure
  owned by Remote Access, never a second Server identity. Safe Bootstrap claims a local Server before optionally
  entering fresh Full Server recovery; foreign-machine recovery creates a new Server and connector identity and pairs
  Clients again, while exact same-host takeover requires exclusive collision fencing.
gui_related: true
gui_classification_reason: Schedule, bootstrap recovery, endpoint provenance, reconnect, disabled, and recovery-safe states are visible Server and Onboarding projections.
depends_on: [SRV-002, SRV-004, SRV-007, SRV-008, SRV-009, BRS-012, BRS-015, BRS-016, RAS-015, SIR-005, SIR-006, SIR-007, SIR-011]
unblocks: []
acceptance_criteria:
  - One Server-owned occurrence identity and durable outbox survive DST repeat/skip, sleeping or offline source Hosts, duplicate signals, multiple Clients, restart, and Project Move; a moved Project is rebound through owner preflight and one-writer transfer rather than duplicated scheduling.
  - Backup policy, capture, encryption, repository, retention, restore, and RecoverySet semantics remain Backup/Restore-owned; Shared Integration Runtime retains governor, lease, outbox-continuity, and ObservableWork primitives.
  - Server Catalog metadata and the catalog backup repository remain distinct from every independently recoverable Project repository; unrelated Project repositories are outside one another's prune authority.
  - Project copy, Move, source snapshots, and Project Backup exclude connector secret state; portable Full Server Backup excludes it by default, and optional inclusion remains unavailable until portability and explicit protected consent are proven.
  - Cloud destination traffic and credentials do not default through PM Remote Link, connector relays, or tailnet identity, and a tailnet login never unlocks Backup.
  - Endpoint projections carry route provenance and capabilities for connector-private, Funnel, and external host-managed routes; all observations remain untrusted until Server identity verification and pairing, and duplicate labels or addresses never merge identities.
  - Fresh recovery starts only after safe local claim, keeps schedules/execution/remote exposure paused until recovery-safe checks pass, creates new Server and connector identities on a foreign machine, and permits same-host identity recovery only behind exclusive collision fencing.
  - SRV-009's verified pre-migration backup remains a prerequisite for that storage migration only; it is not evidence that BRS v2 handlers, native scheduling, restore, remote transport, or recovery execution exists.
  - This static consumer admits no new command or EventRecord family; any future packet command remains handler_unavailable with expected_event_types=[] until its owner, central catalog, sole handler, persistence/receipt, and production wiring are independently closed.
validation_surfaces:
  - Plans/server_system_contracts.schema.json
  - Plans/server_system_contract_fixtures.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/backup_restore_system_contract_fixtures.json
  - Plans/remote_access_system_contracts.schema.json
  - future occurrence/DST/restart/Project-Move one-writer fixtures
  - future foreign-restore/new-identity and same-host collision-fence fixtures
  - future endpoint-provenance/dedupe and connector-secret-exclusion fixtures
risk_class: duplicate_backup_writer_or_server_connector_identity_collision
reasoning_tier: high
context_scope: server_backup_continuity_and_remote_endpoint_provenance
implementation_surfaces: [Plans/Server_System.md, future Server schedule/outbox/bootstrap projections]
node_compile_hint: {mode: server_cross_owner_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#4
  - packet:07_BACKUP_ARCHITECTURE_AND_CAPTURE.md#BKP-003
  - packet:10_RESTORE_BROWSE_RETRIEVE_GUI_AND_SAFETY.md#REST-008
  - packet:11_BACKUP_AUTOMATION_RETENTION_AND_OPERATIONS.md#AUTO-001
  - packet:13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md#TSX-002
  - packet:13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md#TSX-004
preserved_exact_tokens: [server_id, schedule occurrence ID, Server Catalog, recovery-safe, PM connector, Funnel, external host Tailscale, "expected_event_types=[]"]
negative_constraints:
  - Do not create a Backup scheduler, encryption owner, restore engine, or retention reducer in Server System.
  - Do not create a second Server identity from a connector node or adopt host-Tailscale state as PM identity.
  - Do not copy connector secrets into a Project, Project Move, source snapshot, or ordinary Project Backup.
  - Do not activate recovered schedules, work, public ingress, or connector identity before recovery-safe fencing completes.
  - Do not infer runtime, native Slint, provider, security, restore, or readiness proof from this Plans-only contract.
owner_boundary_notes:
  - Backup_Restore_System owns backup policy, capture, encryption, repositories, retention, RecoverySet, browse, and restore semantics; Server owns durable scheduling/outbox attachment and safe-bootstrap consumption.
  - Remote_Access_System owns connector process/node/route/exposure behavior; Server owns server_id, endpoint association, pairing, trust, and deduplication.
owner_hints: [Plans/Server_System.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md, Plans/Shared_Integration_Runtime.md]
```

## Notebook Writer Authority Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Working Notebook and checkpoint records follow the Server-first rule: exactly one Project Home Server holds canonical writer authority for them; Clients render read-only notebook projections and issue canonical notebook commands with typed idempotent envelopes, never becoming writable notebook databases. After a Project Move cutover, the previous Server cannot keep writing notebook or checkpoint records (stale-owner fencing per SRV-006/PSB-006), and no automatic failover creates a second writer.

```yaml
plan_unit_id: SRV-014
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: Notebook and checkpoint records have exactly one canonical writer, the Project Home Server. Clients render read-only projections and issue idempotent canonical commands; a previous Server cannot keep writing after Project Move cutover, and no automatic failover or offline replica creates a second notebook writer.
gui_related: false
gui_classification_reason: Writer authority is server behavior, not GUI work.
depends_on: [SRV-013, PSB-006]
unblocks: []
acceptance_criteria:
  - Stale Server writes after cutover are rejected.
  - No Client becomes a writable notebook database.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: dual_writer
reasoning_tier: standard
context_scope: server_system
implementation_surfaces: [Plans/Server_System.md, Plans/Project_Sync_and_Backbone.md]
node_compile_hint: {mode: server_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I11
preserved_exact_tokens: ["one canonical writer", "Project Home Server"]
negative_constraints:
  - Do not create a second notebook writer through failover or Client replicas.
owner_hints: [Plans/Server_System.md]
```

ContractRef: ContractName:Plans/Server_System.md, ContractName:Plans/Project_Sync_and_Backbone.md
