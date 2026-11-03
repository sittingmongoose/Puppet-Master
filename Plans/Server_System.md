# Server System

> **Compliance:** This document follows `Plans/DRY_Rules.md`, uses the PlanUnit contract in `Plans/Plan_Document_System.md`, consumes retained owner contracts by reference, and names Puppet Master only.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for protected SSH host trust/public-key installation, the Puppet Master Server Catalog, stable Server and Client identity, endpoint association and deduplication, discovery, Client trust/pairing/session/revocation policy, the permanent Server and Client product boundary, and Server-owned continuity projections. Shared Integration Runtime retains execution-topology and runtime-lifecycle primitives; Project Sync and Backbone retains Project Move and content movement; Remote Access retains transport routes and WAN policy; Backup and Restore retains portable backup products.

## 0. Scope

SRV-016 owns the explicit settings-home role and settings.follow trust; SRV-017 owns application chat/Goal/Crew/Assistant Plan/scheduled-task custody before a Project exists. Product copy calls the work place Computer. Neither role grants Project access or changes Home Server identity.

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
  Remote Access retains WAN transport routes; Backup and Restore retains portable backup products. SRV-016 adds
  same-owner Server-peer settings trust and the explicit settings-home role without Project access. SRV-017 defines
  Server custody of application work before any Project Vault exists; this is not a Project Home Server assignment.

  SRV-018 owns protected SSH host-fingerprint trust and public-key installation through the same shared key
  list and protected-auth broker. Remote Access, Settings, onboarding and New Project consume that contract
  without adding another trust store, installer or generic connection writer.
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
- 'source_ref:projects-pass2-20261103:S1/S7/S12/N5/N17; Jared: "I approve the outstanding questions with their
  recommended settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Goals, users, providers, storage, secrets, or remote configuration. Nearby, Known, QR, manual, private DNS,
  and Tailscale inventory may supply observations, but no broad subnet scan is allowed and no observation grants
  trust. Observations expire and remain separately attributable to their discovery source. No-project chat names,
  Goal/Plan/Crew/schedule metadata and settings contents are private owner projections, never discovery advertisements.
  Discovery does not claim a sleeping local Server or authorize settings.follow or Project reads.
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
- 'source_ref:projects-pass2-20261103:S7/N5/N17; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Pairing uses an explicit pairing_session_id, explicit pairing_candidate_id, and verified Server identity through
  LAN discovery, QR, short code, fingerprint/certificate confirmation, manual URL, or approval by an already trusted
  Server-side Client. cmd.client.pair.start starts the selected method without granting trust; approve, reject,
  and cancel are distinct expected-generation-fenced transitions. QR and code material is consumed through an
  ephemeral handle, only its digest may be durable, and raw pairing secrets are never persisted. Reachability,
  localhost, LAN, tailnet, Funnel, proxy, Remote Link, or VPN never implies authorization. ClientTrustRecord and
  ClientAccessPolicy grant least-privilege scopes and bind protocol range, trust generation, expiry, and revocation.
  cmd.client.revoke increments authority generation, terminates all current sessions, rejects future sessions
  and stale commands, and remains restart-decidable from durable receipts. DL-259 FO-7, 2026-10-31: accepting
  an owner’s approval or rejection finishes that exact pairing request/generation in the view. Clear its obsolete
  warning and render the answered result; later refreshes must not re-adopt the consumed result as a new request
  or show a false used-answer warning. The answered view offers a fresh code/request rather than Check again for
  the completed one. A fresh invitation starts a new generation; exact Server/Client/session/generation, matching-identity
  confirmation, permission, expiry and genuine replay rejection remain. Rejecting a later request cannot remove
  a Client already approved by an earlier request. A view marker never grants trust or bypasses the Server owner.
  DL-271 initial request waiting, 2026-10-31: while the current invitation is live and no device request has arrived,
  Your Server is ready shows No requests yet with Check again. Checking re-reads the current owner run; a real
  arriving request also updates that view. This neutral state is not an error and invents no candidate, approval
  or trust. Continue retains its existing Server-ready gates. Keep it distinct from DL-259 FO-7’s answered approval/rejection:
  a completed request stays answered, and a fresh request requires the existing new-code/new-generation route.


  DL-272 RV-2, 2026-11-01: Self-approval compares the initiating device’s own identity words with those the Server
  derived from the received candidate; both are labelled, and approval requires explicit matching confirmation.
  Missing or different words cannot grant trust.


  DL-272 RV-18, 2026-11-01: Pairing codes are obtained from Settings > Server & Project Location > Pair a device,
  or the Server’s reachable pairing page, and use the same XXXX-XXXX display form across those surfaces. Desktop
  Server installation gives the address to open and tells the person to keep its one-time setup code shown. Pairing
  and setup codes remain distinct protected owner material.


  DL-272 PAIR-DENIED-NAME, 2026-11-01: A Server card names the device whose request was turned down, preserves
  the answered generation, and offers a new request without changing earlier granted trust.


  DL-272 PAIR-CLIENT-WORDS, 2026-11-01: A Client waiting for approval shows its own identity words to compare
  on the approving device; Server identity words are not substituted for the Client’s. ClientAccessPolicy separately
  admits settings.everywhere.write only for current owner-authorized devices; limited/Member devices cannot write
  Everywhere or Computer values through a follower. ServerPeerTrustRecord under SRV-016 is distinct from ClientTrustRecord;
  settings.follow grants no Project/content/work authority. A native Client local_server_id is populated only
  by verified protected local handoff, not address equality. Revocation fences settings delivery and commands
  as well as existing sessions.
gui_related: true
gui_classification_reason: Pairing prompts, fingerprint confirmation, Client lists, access scopes, expiry, and revocation are user-visible workflows.
depends_on: [SRV-002, SRV-003]
unblocks: [SRV-005, SRV-007, RAS-007]
acceptance_criteria:
- Pairing cannot complete without explicit user or trusted-Client approval and identity confirmation.
- A revoked or expired Client cannot reconnect, reuse a session, or publish a late command.
- Sessions bind client_id, server_id, access-policy generation, protocol version, expiry, and non-secret currentness
  evidence.
- 'DL-259 FO-7, 2026-10-31: accepting an owner’s approval or rejection finishes that exact pairing request/generation
  in the view. Clear its obsolete warning and render the answered result; later refreshes must not re-adopt the consumed
  result as a new request or show a false used-answer warning. The answered view offers a fresh code/request rather than
  Check again for the completed one. A fresh invitation starts a new generation; exact Server/Client/session/generation,
  matching-identity confirmation, permission, expiry and genuine replay rejection remain. Rejecting a later request cannot
  remove a Client already approved by an earlier request. A view marker never grants trust or bypasses the Server owner.'
- 'DL-271 initial request waiting, 2026-10-31: while the current invitation is live and no device request has arrived,
  Your Server is ready shows No requests yet with Check again. Checking re-reads the current owner run; a real arriving
  request also updates that view. This neutral state is not an error and invents no candidate, approval or trust. Continue
  retains its existing Server-ready gates. Keep it distinct from DL-259 FO-7’s answered approval/rejection: a completed
  request stays answered, and a fresh request requires the existing new-code/new-generation route.'
- 'DL-272 RV-2, 2026-11-01: Self-approval compares the initiating device’s own identity words with those the Server derived
  from the received candidate; both are labelled, and approval requires explicit matching confirmation. Missing or different
  words cannot grant trust.'
- 'DL-272 RV-18, 2026-11-01: Pairing codes are obtained from Settings > Server & Project Location > Pair a device, or
  the Server’s reachable pairing page, and use the same XXXX-XXXX display form across those surfaces. Desktop Server
  installation gives the address to open and tells the person to keep its one-time setup code shown. Pairing and setup
  codes remain distinct protected owner material.'
- 'DL-272 PAIR-DENIED-NAME, 2026-11-01: A Server card names the device whose request was turned down, preserves the answered
  generation, and offers a new request without changing earlier granted trust.'
- 'DL-272 PAIR-CLIENT-WORDS, 2026-11-01: A Client waiting for approval shows its own identity words to compare on the
  approving device; Server identity words are not substituted for the Client’s.'
validation_surfaces: [Plans/server_system_contract_fixtures.json, future stolen expired revoked access tests]
risk_class: client_trust_or_revocation_bypass
reasoning_tier: high
context_scope: client_trust_and_sessions
implementation_surfaces: [Plans/server_system_contracts.schema.json, future trust and session services]
node_compile_hint: {mode: client_trust_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:normalized-register:server-first-2026-08-31:R03
- source_ref:packet:10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
- 'PM7 srv FO-7 40899806fb: endGuestRun/runDone/pollGuestRun source-only terminal-view guard.'
- 'PM7 final batch, lead 1031214952-2d19 (2026-10-31), integration 2819a3def0: FO-11 2a3661f021; FO-12/Unlock
  4c6305553d; weak-key/waiting view dfbaacbad7. Provider/onboarding/server reports are source lineage only; no
  concept host, seeded situation, artificial delay or helper API is a product requirement. Lead 1031215509-a74e
  confirms unconditional weak-key refusal.'
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
- 'source_ref:projects-pass2-20261103:S7/S12; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  dormant loopback/private local Server capability, and Execution Host capability. After owner claim, cmd.server.bootstrap.start
  separately bootstraps requested execution_form standalone or container, verifies durable roots or mounts and
  the immutable execution baseline, and never creates a reduced control-plane-only Server. Closing, refreshing,
  sleeping, or powering off a Client never cancels Server-owned Goal, turn, login, update, backup, Move, browser,
  build, or test. Reconnect and resume are exact cmd.server.connect modes using prior session and durable cursor/snapshot
  catch-up without duplicate or omitted entries; they do not mint separate commands or new work. Stop Server,
  restart, and move are explicit service/tray/menu operations; GUI close is not an implicit stop. DL-259 CLOUD-1
  A, Jared 2026-10-31: the person uses an explicit cloud-provider console or local-bootstrap handoff and its one-time
  Server setup code to claim a new cloud computer. The Server owner checks and consumes the code through the protected
  local/private bootstrap handoff. Its initial owner-claim authorization is bound to the existing discovery_observation_id,
  pairing_session_id and identity_fingerprint handed to cmd.server.claim, with the command’s current permission
  and generation fences. The tuple references owner-verified authority; guessed IDs, an address or a caller-provided
  success flag are not proof. Raw setup code never enters the ordinary command payload, stored setup plan, logs
  or receipts. No public unclaimed setup, automated provider-console/SSH provisioning or implicit tailnet enrollment
  is admitted. cmd.server.bootstrap.start remains separate after successful claim. DL-259 DESKTOP-RESTORE-1 A,
  Jared 2026-10-31: the native desktop performs the first owner claim of its dormant local Server through a protected
  direct local handoff, with no code for the person to type. The Server owner binds that initial owner-claim authorization
  to its discovery_observation_id, pairing_session_id and identity_fingerprint for the existing cmd.server.claim
  request and exact current permission/generations. Ordinary Clients, browser state and loopback reachability
  cannot manufacture this protected native authority. Claim then separate cmd.server.bootstrap.start must complete
  for the actual local Server, its durable roots/mounts and immutable execution baseline before cmd.restore.server_full.
  Backup maintenance/recovery authority, exact-target verification, paused restore and separate pairing/remote
  activation remain required. Reuse current verified prerequisites when already satisfied; dormant capability
  alone is never a claim or bootstrap receipt. DL-259 CLOUD-1 / srv C2 A, Jared 2026-10-31: onboarding claims
  a new cloud computer through the provider-console/local-bootstrap one-time setup-code handoff. That initial
  claim route asks for the code, not a Server address, and does not discover unclaimed cloud computers over the
  network. The Server owner’s protected authorization and existing exact proof tuple still gate claim; no public
  unclaimed setup is exposed. Application chats, Goals, Crew, Assistant Plan/Deep Plan and scheduled messages/tasks
  are Server-owned under SRV-017. Client close, sleep or refresh does not stop them; no-project availability does
  not claim/bootstrap a dormant local service. Explicit service quit/stop enumerates both app and Project live
  work/timers and preserves their safe-stop/restart and missed-time rules.
gui_related: true
gui_classification_reason: Native/web parity, disconnected/currentness state, explicit lifecycle controls, and responsive Client behavior are visible product behavior.
depends_on: [SRV-004, SIR-004, SIR-005]
unblocks: [SRV-007, SRV-008, RAS-008]
acceptance_criteria:
- Native and web Clients use the same commands, identities, receipts, and projection cursors.
- Standalone and container bootstrap preserve requested/effective execution_form, require a prior claim receipt, validate
  the execution baseline, and enable normal Server execution.
- Client tab or process loss does not cancel Server-owned work.
- Explicit Server stop is permission-gated, drains or checkpoints work, and exposes truthful blocked or recovery-required
  outcomes.
- 'DL-259 CLOUD-1 A, Jared 2026-10-31: the person uses an explicit cloud-provider console or local-bootstrap handoff
  and its one-time Server setup code to claim a new cloud computer. The Server owner checks and consumes the code through
  the protected local/private bootstrap handoff. Its initial owner-claim authorization is bound to the existing discovery_observation_id,
  pairing_session_id and identity_fingerprint handed to cmd.server.claim, with the command’s current permission and generation
  fences. The tuple references owner-verified authority; guessed IDs, an address or a caller-provided success flag are
  not proof. Raw setup code never enters the ordinary command payload, stored setup plan, logs or receipts. No public
  unclaimed setup, automated provider-console/SSH provisioning or implicit tailnet enrollment is admitted. cmd.server.bootstrap.start
  remains separate after successful claim.'
- 'DL-259 DESKTOP-RESTORE-1 A, Jared 2026-10-31: the native desktop performs the first owner claim of its dormant local
  Server through a protected direct local handoff, with no code for the person to type. The Server owner binds that initial
  owner-claim authorization to its discovery_observation_id, pairing_session_id and identity_fingerprint for the existing
  cmd.server.claim request and exact current permission/generations. Ordinary Clients, browser state and loopback reachability
  cannot manufacture this protected native authority. Claim then separate cmd.server.bootstrap.start must complete for
  the actual local Server, its durable roots/mounts and immutable execution baseline before cmd.restore.server_full.
  Backup maintenance/recovery authority, exact-target verification, paused restore and separate pairing/remote activation
  remain required. Reuse current verified prerequisites when already satisfied; dormant capability alone is never a claim
  or bootstrap receipt.'
- 'DL-259 CLOUD-1 / srv C2 A, Jared 2026-10-31: onboarding claims a new cloud computer through the provider-console/local-bootstrap
  one-time setup-code handoff. That initial claim route asks for the code, not a Server address, and does not discover
  unclaimed cloud computers over the network. The Server owner’s protected authorization and existing exact proof tuple
  still gate claim; no public unclaimed setup is exposed.'
validation_surfaces: [future multi-Client cursor convergence tests, future native web parity tests, future GUI-close continuation tests]
risk_class: client_lifetime_becoming_server_lifetime
reasoning_tier: high
context_scope: permanent_server_client_product
implementation_surfaces: [future Server service, future native Client, future permanent web Client]
node_compile_hint: {mode: permanent_server_product_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:normalized-register:server-first-2026-08-31:C01-C06
- source_ref:packet:backbone_v5/10_SERVER_REMOTE_ACCESS_DEPLOYMENT_CONTRACT.md
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31;
  DL-259)
- 'source_ref:projects-pass2-20261103:N5/N15/N17/latest-Plan-schedule-ruling; Jared: "I approve the outstanding
  questions with their recommended settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  Project Home Server, Connected Server, Execution Host, Execution Environment, Source Location, Client, endpoint,
  and remote route are distinct identities. The Home Server is the default Execution Host when compatible; Shared
  Integration Runtime owns execution assignment, leases, environment supervision, and handoff primitives. Changing
  a Client, endpoint, route, Host, Environment, or Source Location is not Project Move. Project Sync and Backbone
  alone owns verified Vault transfer and one-writer authority cutover. No automatic multi-Server failover or writable
  offline Client replica is permitted. Settings home is a separate explicit role, not every Project Home Server.
  The Computer display name groups a native Client and its actual local Server via ClientRecord.local_server_id;
  their identity and authorization domains remain distinct. Settings levels are values, never new topology or
  connector identities. An app thread fixes its actual work Server/Host after first message; only its admitted
  conversion/Continue elsewhere route changes future scope.
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
- 'source_ref:projects-pass2-20261103:S1/S7/N5/N17; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
  reconnect requires the prior session and resume additionally requires the durable cursor, while neither creates
  a second semantic handler. Server projections distinguish loading, cached, current, stale, offline, unauthorized,
  protocol_mismatch, identity_mismatch, degraded, blocked, and recovery_required without converting a transport
  observation into durable success. Client caches are bounded and read-only. Slow or malicious Clients use bounded
  queues and cannot backpressure Goals, duplicate work, or force eager hydration of every Project or manager.
  DL-259 CLOUD-1 / DESKTOP-RESTORE-1, Jared 2026-10-31: initial owner-claim authorization comes from the Server
  owner’s one-time console/bootstrap-code handoff for a new cloud computer, or the native desktop’s protected
  direct local handoff for its dormant Server with no human code. cmd.server.claim keeps its existing closed arguments
  discovery_observation_id, pairing_session_id and identity_fingerprint. Their owner-verified binding plus current
  permission/generations carries the authorization; no raw code, certificate material, new claim command or caller
  assertion of trust is added. Bootstrap and restore remain separate commands and receipts. Initial owner claim
  does not grant pairing/trust to other Clients. Typed application/level commands may carry null project_id with
  an explicit scope and actual writer Server/Host/Client; a missing Project is still refused where the target
  operation needs one. A settings follower or cache cannot accept a write for its unreachable home and cannot
  relay another Client's session authority.
gui_related: true
gui_classification_reason: Currentness, disabled reasons, connection health, progress, retry, and recovery states are visible on every Client.
depends_on: [SRV-004, SRV-005, SIR-004, SIR-005, SIR-006]
unblocks: [SRV-008, SRV-010]
acceptance_criteria:
- Replayed commands preserve idempotency and reject stale expected generations.
- Reconnect/resume returns the requested/effective mode and exact prior-session cursor or snapshot continuation without
  replaying work.
- Cached or stale data is never labeled current or Synced.
- Bounded queues and projections preserve Server work under slow or malicious Client pressure.
- 'DL-259 CLOUD-1 / DESKTOP-RESTORE-1, Jared 2026-10-31: initial owner-claim authorization comes from the Server owner’s
  one-time console/bootstrap-code handoff for a new cloud computer, or the native desktop’s protected direct local handoff
  for its dormant Server with no human code. cmd.server.claim keeps its existing closed arguments discovery_observation_id,
  pairing_session_id and identity_fingerprint. Their owner-verified binding plus current permission/generations carries
  the authorization; no raw code, certificate material, new claim command or caller assertion of trust is added. Bootstrap
  and restore remain separate commands and receipts. Initial owner claim does not grant pairing/trust to other Clients.'
validation_surfaces: [Plans/server_system_contract_fixtures.json, future reconnect storm and malicious backpressure tests]
risk_class: duplicate_command_or_false_currentness
reasoning_tier: high
context_scope: server_command_and_projection_continuity
implementation_surfaces: [Plans/server_system_contracts.schema.json, Plans/shared_runtime_contracts.schema.json, future Server API]
node_compile_hint: {mode: server_continuity_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:normalized-register:server-first-2026-08-31:C01-C06
- source_ref:packet:B5/22_SECURITY_AND_FAILURE_TEST_MATRIX.md
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31;
  DL-259)
- 'source_ref:projects-pass2-20261103:S7/N12; Jared: "I approve the outstanding questions with their recommended
  settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
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
canonical_text: 'The Server manager, Settings, Onboarding, Doctor, palette, native/web UI, natural-language routing,
  and API/automation surfaces use the exact 32-command owner inventory listed here: the retained 26-command cmd.server
  manager inventory plus six narrowly owned bootstrap/pairing/trust commands. Each visible action requires one central
  registration, typed request/result/error, sole handler, permission and confirmation policy, idempotency/currentness,
  ObservableWork when asynchronous, receipt or explicit no-persist result, accessibility/focus return, and production
  wiring. UI projections use stable IDs, route to owner details, and show truthful availability and disabled reasons.
  DL-259 srv final, 2026-10-31: what the person actually set up is what the app shows. Enter/finish binds the shell,
  Settings and status views to the stable Client, Server, Execution Host, route and Project identities supplied by current
  owner results and registries, with their actual readiness/deferred state. Display names never become IDs, and the reviewed
  setup plan is intent rather than effective state. Onboarding creates no second account/server/Project registry or durable
  handoff writer; its initial context is a non-authoritative join of existing owner receipts/projections, followed by
  their normal updates. No concept-global object, event or store key is a product contract.'
gui_related: true
gui_classification_reason: This unit defines Server manager actions, compact cards, status, details, focus return, and native/web parity.
depends_on: [SRV-003, SRV-004, SRV-005, SRV-006, SRV-007]
unblocks: [SSYS-012]
acceptance_criteria:
- Every listed Server-owned command has one central command and UI-catalog row plus one production wiring handler before
  enablement.
- Server cards distinguish Connected Server, Home Server, processing capability, paired Clients, route, version, and
  exact currentness.
- Missing central registration, schema, handler, event admission, or wiring disables the affected action with the exact
  reason.
- 'DL-259 srv final, 2026-10-31: what the person actually set up is what the app shows. Enter/finish binds the shell,
  Settings and status views to the stable Client, Server, Execution Host, route and Project identities supplied by current
  owner results and registries, with their actual readiness/deferred state. Display names never become IDs, and the reviewed
  setup plan is intent rather than effective state. Onboarding creates no second account/server/Project registry or durable
  handoff writer; its initial context is a non-authoritative join of existing owner receipts/projections, followed by
  their normal updates. No concept-global object, event or store key is a product contract.'
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



### SRV-016 - Settings Home And Least-Privilege Same-Owner Following

```yaml
plan_unit_id: SRV-016
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  One ServerRecord has the explicit settings-home role and is sole writer of Everywhere/history; its card says
  Keeps your settings. Computer and Device writers remain SSYS-060's. Independently configured Servers start separately;
  they follow one home only after an owner-chosen S12 join and protected same-owner pairing. ServerPeerTrustRecord
  is distinct from ClientTrustRecord: bind both verified stable Server identities/owner, pairing session, allowed
  settings.follow scope, trust generation, expiry/revocation, protocol and digest-only proof. settings.follow
  lets a follower read Everywhere/deltas and send its own Computer mirror only; no write to Everywhere, arbitrary
  Server command, Project metadata/content, cross-Project read/send or work authority follows. Member/unowned
  Servers cannot lead/follow the owner's settings. Revocation ends both-direction delivery and fences stale sessions/commands;
  at next authorized startup the follower discards its former Everywhere copy, retaining its own Computer level.
  Devices pair directly with the home for settings.everywhere.write; a follower cannot relay their commands.

  ClientRecord.local_server_id is written only by the verified protected native local handoff. It makes the app
  and its own Server one Computer name while preserving Client/Server identity, trust and D7 B connector owners.
  Server discovery exposes no settings/Project/app-work data and cannot grant following.

  cmd.server.settings_home.move is one Server-owner operation with preview/apply modes, one sole planned handler
  and exact source/destination Server IDs, owner/trust/catalog/role generations, current snapshot/history hashes/revisions,
  preview expiry, idempotency and return context. The person chooses the destination; refuse changes-in-flight
  and stale/unverified targets. Copy Everywhere/history, verify readback, fence the old writer, switch the role
  generation once, then let the former home follow. No two role generations can write; old sessions/deltas fail
  the new fence. Lost-home recovery is a distinct explicit promotion of a named last-known copy, with as-of/loss
  warning and a role fence that rejects the old home if it returns; never automatic election. A freshness/loss
  acknowledgement alone is not a writer fence: promotion must establish the admitted role-generation/lease revocation
  that prevents the old home serving another write; if that cannot be proved, return recovery_required with no
  writable promotion. F/A freeze that exact recovery proof before a native handler is enabled. Full Server Backup
  holds the role's Everywhere/history; Project Backup holds only Project own values and cannot overwrite Everywhere.
  Restore replacement remains protected and target-bound. The frozen peer operation is cmd.server.settings_peer_trust
  with handlers::server::settings_peer_trust and settings_peer_trust_command_request/settings_peer_trust_command_result
  in Plans/server_system_contracts.schema.json. It admits only start, approve, reject, cancel and revoke for
  settings.follow; join data choices use Settings transactions. The move handler is handlers::server::settings_home_move
  with settings_home_move_request/settings_home_move_result in that same schema. Both preserve exact initiating
  Client, invocation, context revision, route, focus and continuation generation. No command becomes available
  without central contract, handler, wiring, secure storage and native evidence.

  Home move preview/apply binds verified source/destination Server IDs, same-owner trust and protocol,
  catalog and role generations, snapshot/history revisions and hashes, preview expiry, idempotency and exact
  return. Apply rechecks every captured generation, copies and verifies readback before the single
  role-generation switch, and obtains original old-writer fencing proof under the admitted writer lease.
  Lost-home promotion cannot turn a stale snapshot, user acknowledgement, elapsed time or an all-true client
  assertion into that proof; without verifiable old-writer revocation/lease fencing it remains
  recovery_required. A returned former home cannot accept writes under its old role. SP-348 supplies the
  tagged Server/Execution Host/Client keys, not raw-ID aliases. SRV-018's SSH trust is separate from
  Server-peer settings trust and Client pairing.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SRV-001
- SRV-004
- SRV-006
- SRV-007
unblocks: []
acceptance_criteria:
- Only a same-owner explicit pairing creates settings.follow; Member, discovery-only and revoked/stale peers fail
  closed.
- A follower can read Everywhere and publish its own mirror, but cannot write home values or read any Project
  via that scope.
- Home move verifies copied values/history before one fenced writer switch; in-flight/stale or unknown effects
  do not create a second writer.
- Loss requires a human-chosen fresh/stale copy with disclosed loss window and old-home return fencing.
validation_surfaces:
- Plans/server_system_contracts.schema.json and owner companion fixtures (lane F; pending adoption)
- python3 scripts/pm-settings-layering-check.py (lane F proposed validator; not_run)
- Future native owner/command/writer/readback/security evidence; not_run
risk_class: owner_scope_or_credential_authority_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_srv_016
implementation_surfaces:
- Plans/Server_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_companion_and_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards S1/S7/S12
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
- 'source_ref:chat:20261103: Jared: "when I say separate settings for different environments, that is what T3
  calls the different computers, but it is where Puppet Master runs its work."'
preserved_exact_tokens:
- ServerPeerTrustRecord
- settings.follow
- settings.everywhere.write
- ClientRecord.local_server_id
- cmd.server.settings_home.move
- Keeps your settings
- cmd.server.settings_peer_trust
- settings_peer_trust_command_request
- settings_peer_trust_command_result
- settings_home_move_request
- settings_home_move_result
negative_constraints:
- Do not alias Server-peer trust to Client pairing or introduce relay command authority.
- Do not elect a home automatically or admit writable follower caches.
- Do not share connector keys, credentials or protected pairing material.
owner_hints:
- Plans/Server_System.md
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Server_System.md, ContractName:Plans/Plan_Document_System.md

### SRV-017 - Application Work Custody And Named Computer

```yaml
plan_unit_id: SRV-017
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  No project is a genuine app-scope chat with project_id=null, explicit application scope and its actual work
  server_id, execution_host_id, execution_environment_id where relevant, thread_id, current storage writer/lease
  and permission/Stop context. Before any Project Vault exists, that Server owns application chat history, app
  scratch notebook/checkpoints, Goals/control/history/continuations, Crew definitions/runs/board/coordination,
  Assistant Plan/Deep Plan/revisions/PlanRuns/bundles and scheduled messages/tasks/windows/occurrences/quota consent
  under their existing owners and scope-aware versions. The app store is not a Project Vault and has no fabricated
  Project Home Server lease. Ordinary owner limits, holds, retention, source-custody and mandatory Full Server
  Backup apply; chat Undo expiry alone cannot purge independent canonical work or referenced payloads.

  Choose the native device's already claimed/bootstrapped local Server when usable, otherwise the person's named
  main Computer; phone/web always names where work runs. A native Client without a ready local service says which
  Computer will work and offers Set up Puppet Master here via protected claim/bootstrap. Dormant local capability
  is never silently claimed. The place may change before first message; after that work Computer is fixed. Continue
  on another computer makes a new linked chat, and chat conversion uses C/PSB's preview/copy/check/fence/cutover
  with fresh destination authority. Existing running processes, provider profiles, credentials and timers do not
  move by changing focus or copying a transcript.

  The actual Server owns timers and occurrence-idempotency; closing/sleeping a Client or switching Projects does
  not fire, cancel or relocate them. An offline Computer remains listed by name/status; loaded cached history
  is readable but cannot continue. Missed work follows SQR's saved policy on that Server's return, never fallback
  to another Computer or a burst of backlog. App and Project pause/Stop epochs are independent operational records,
  not Everywhere settings; clear remains a user action. Explicit Server quit/stop includes app live work/timers
  in the same safe-stop/restart rules and truthful ObservableWork/History/attention projections.

  Cross-Server reads use the existing Remote Access route/verified source identity and separately admitted narrow
  Project read authority on every access. settings.follow and discovery carry no content scope; no parallel route
  registry, synthetic Project, unbounded cache or second message board is created. Goals, Crew, Plan/Deep Plan
  and scheduled tasks/messages are available in app scope; only Planning Wizard, PRD Builder and Orchestrator
  retain no-project workflow gates. Availability still requires each actual target, capability, permission, writer
  and admitted schema/event graph, and acceptance of this prose is no native implementation evidence.

  Before any Vault exists the same app writer also owns Deep Plan ledger sessions, schedule bindings, pause
  records and their canonical consent/occurrence/source audit under CV-365–368 and SP-349/351/352/353.
  Server-only pause and Settings operations carry actual Server scope without a fabricated thread; real
  execution records carry their actual thread/Host/Environment and admitted roots. Internal talk/planning
  alone does not create a chat folder. Client close, app shutdown and explicit Server stop are distinct
  lifecycle actions.
gui_related: true
gui_classification_reason: Defines user-visible Settings, Computer, panel or work-state behavior.
depends_on:
- SRV-005
- SRV-006
- SRV-007
- SRV-014
unblocks: []
acceptance_criteria:
- A zero-Project chat/work item has real app/Server/thread/Host custody, never Project sentinel/Vault identity.
- Local absence names main Computer and offers protected setup; first message fixes place and offline hosts never
  silently fallback.
- App Goal/Crew/Plan/schedule commands, history/timers/pause/backup use the existing owners and counterpart limits.
- Client close keeps Server work live; explicit service stop accounts for app tasks and preserves restart/missed-time
  policy.
validation_surfaces:
- Plans/server_system_contracts.schema.json and owner companion fixtures (lane F; pending adoption)
- python3 scripts/pm-settings-layering-check.py (lane F proposed validator; not_run)
- Future native owner/command/writer/readback/security evidence; not_run
risk_class: owner_scope_or_credential_authority_leak
reasoning_tier: high
context_scope: projects_refresh_20261103_srv_017
implementation_surfaces:
- Plans/Server_System.md
- Plans/storage-plan.md
- future shared Rust interface model and sole owner services; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_companion_and_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md; cards N5/N12/N15/N17/N24/N25/latest-app-rulings
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md §3 A; pinned integration
  41d8119aec71789de7422018ea9c167e6c60a156
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
- 'source_ref:chat:20261103: Jared: "Those look good, except goals and crew should be allowed in no project."'
- 'source_ref:chat:20261103: Jared: "Plan mode and scheduled tasks are also available in no project. It''s only
  planning wizard/prd builder/orchestrator that isn''t."'
preserved_exact_tokens:
- project_id=null
- server_id
- thread_id
- Set up Puppet Master here
- No project
- settings.follow
- Full Server Backup
negative_constraints:
- Do not claim a sleeping local service or turn a frontend into an execution owner.
- Do not continue on an offline Computer or move live profiles/processes/timers implicitly.
- Do not use settings.follow, a read grant or source scope as destination work authority.
owner_hints:
- Plans/Server_System.md
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Server_System.md, ContractName:Plans/Plan_Document_System.md

### SRV-018 - Protected SSH Host Trust And Public-Key Installation

```yaml
plan_unit_id: SRV-018
unit_type: security_contract
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: >-
  Server System is the sole protected SSH host-trust and public-key-install owner. Settings SSH
  computers/keys, New Project, onboarding, source inspection and Doctor consume the same operations.
  cmd.server.ssh.trust routes only to handlers::server::ssh_host_trust; cmd.server.ssh.public_key.install
  routes only to handlers::server::ssh_public_key_install. Each has preview|apply phases and the exact
  closed request/result roster and source joins below. SshHostTrustCommandRequestV1 and
  SshHostTrustCommandResultV1 bind host trust; SshPublicKeyInstallCommandRequestV1 and
  SshPublicKeyInstallCommandResultV1 bind installation in Plans/server_system_contracts.schema.json. Both
  are accepted design contracts with handler_unavailable until central registration, companions, secure
  custody and native evidence exist. expected_event_types=[]; typed owner receipts/ObservableWork do not
  admit an EventRecord family.

  An SSH target is a Server-owned connection or pre-identity connection draft, binding the executing claimed
  Server/Host/Environment, exact remote host/port/account, transport and target generation. It does not
  fabricate a PM server_id for an unmanaged SSH host or a Project before reservation. An owner-observed
  current host-key challenge binds that target and actual public host key/fingerprint, observation expiry
  and existing trust revision or explicit absence. Display the full fingerprint and, for replacement, both
  old and new fingerprints. Preview is read-only; discovering or reaching the host grants no trust. Apply
  requires an authentic human_gui or human_palette decision on the exact initiating active Client, current
  permission/session/topology and challenge, followed by host-key revalidation. Add/replace the exact
  host/port trust entry under CAS only after that protected decision. A changed key fails
  ssh_host_key_changed until a fresh explicit replacement preview and human decision; it never uses
  accept-any, a global insecure flag or a cached yes. Concurrent change or expired/revoked proof refuses
  before effect. SSH host trust is independent of PM Client pairing, Server peer settings.follow, TLS/PM
  identity, executable source trust and Project/content authority.

  Public-key installation selects an existing shared SSH-key-list public_key_id and immutable public-key
  fingerprint/revision. Validate the supported algorithm and strength before even the already-authorized
  path as required by DL-271; a stale, missing or weak key is not reused. The private half remains on its
  original Host/secure owner. Preview uses a verified current SSH host-trust session and existing chosen
  credential ref or the broker's exact-Client one-use protected input to read the selected remote account
  and its own authorized_keys target. Bind remote account identity, home and file identity, exact public-key
  entry, existing bytes hash/revision or explicit absent-file proof, safe permissions and preview expiry. No
  arbitrary caller-supplied path or shell command is accepted. Human-only apply revalidates all of these
  facts, appends the exact public entry only if absent under the remote capability's admitted atomic
  compare/write, preserves other entries/restrictions, refuses symlink/identity/permission drift and
  verifies readback. Existing unsafe permissions or unsupported remote atomicity fail closed with recovery
  guidance; there is no blind overwrite, automatic permission loosening or generic shell fallback. An
  existing entry is unchanged only after the same strength/identity checks.

  The SSH effect journal binds operation/idempotency identity, exact target, preview commitment, public key
  and observed trust/file revision. Same key and same committed intent replay the original result; changed
  intent conflicts. A disconnect after possible write returns effect_unknown with settled/remaining facts,
  then reconciles by reading that same trusted account/file before retry; it never blindly appends twice.
  Unreconciled work cannot complete setup or imply a usable login. Cancel/Close cannot claim an already
  applied entry was removed. Trust or public-entry cleanup requires a separate fresh protected owner action
  against current identity; Project failure, Settings rollback or conversion Undo never deletes it
  speculatively. An install receipt proves only the verified authorized entry; any subsequent
  connection/readiness test remains the existing connection owner's independent current check.

  Requests/results/history/export contain no password, passphrase, private key, cookie, CLI profile or raw
  protected input. The existing broker alone consumes a bounded one-use protected_input_ref for the exact
  operation/Client/session, zeroizes it and keeps it out of durable requests, receipts and logs; public key
  and fingerprint refs are not credential-copy authority. YOLO, build grants, agents, screen-use and
  adapters cannot accept host trust, install a key or answer protected authentication. Exact return
  preserves initiating Client, invocation token, caller scope/context revision, route/focus and continuation
  generation, or reports caller_unavailable; no current-tab/another-Client fallback. Before native dispatch
  the complete original target/challenge/human-decision/trust/key/file/receipt source and secure-custody
  graph must be bound; booleans or structural fixtures cannot substitute for it. This grants no automated
  SSH provisioning, PM bootstrap/claim, Server listener, VPN enrollment or remote-access ingress.
gui_related: true
gui_classification_reason: Defines visible protected SSH confirmation, key-install outcomes and exact setup return.
depends_on:
- SRV-001
- SRV-004
- MACS-002
unblocks: []
acceptance_criteria:
- Settings, onboarding, New Project and Doctor use the two exact Server operations and handlers with one shared
  SSH-key list.
- Changed/expired/revoked host proof or wrong Client/target/permission refuses before trust or installation; explicit
  replacement compares both fingerprints.
- Weak key refusal runs before already-authorized reuse; private keys and raw protected input never enter request/result/history/export.
- Remote account/file CAS, preserved entries and verified readback distinguish applied, unchanged, failed and
  effect_unknown; replay never repeats unknown effects.
- YOLO/agents cannot self-approve; PM identity, settings.follow, source trust and Project authority are not inferred
  from SSH trust.
- Return binds the exact initiating continuation, and missing schema/handler/source/custody evidence leaves the
  operation unavailable.
validation_surfaces:
- Plans/server_system_contracts.schema.json and Plans/server_system_contract_fixtures.json; F-d adoption required
- Plans/projects_refresh_command_bindings.json and central wiring/Touch contracts; F-b adoption required
- Future native protected-input, SSH currentness, remote-write/readback and restart evidence; not_run
risk_class: ssh_host_impersonation_or_protected_key_install_authority_escape
reasoning_tier: high
context_scope: projects_refresh_20261103_srv_018
implementation_surfaces:
- Plans/Server_System.md
- Plans/server_system_contracts.schema.json
- future sole Server SSH owner and shared protected-auth broker; no implementation claimed
node_compile_hint:
  mode: accepted_product_contract_pending_companion_and_native_evidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-pass2-20261103:PHASE2-BRIEF known correction assigns protected SSH trust/key-install to
  lane A
- source_ref:projects-pass2-20261103:Fb-ACE01; Fc-ACE01; Fd-E01; PLANS-EDIT-PLAN section 7 owner-operation freeze
- 'source_ref:chat:20261103: Jared: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- cmd.server.ssh.trust
- cmd.server.ssh.public_key.install
- handlers::server::ssh_host_trust
- handlers::server::ssh_public_key_install
- SshHostTrustCommandRequestV1
- SshHostTrustCommandResultV1
- SshPublicKeyInstallCommandRequestV1
- SshPublicKeyInstallCommandResultV1
- preview|apply
- protected_input_ref
- authorized_keys
- effect_unknown
- ssh_host_key_changed
- expected_event_types=[]
negative_constraints:
- Do not copy private keys, persist protected input, use accept-any host checking or install through an untyped
  connection action.
- Do not let agents, YOLO or a build grant approve SSH trust, key installation or protected sign-in.
- Do not overwrite foreign entries, follow symlink targets, weaken permissions, retry unknown writes blindly or
  invent a remote rollback.
- Do not claim PM pairing, settings following, source trust, provisioning, public ingress or native readiness
  from these operations.
owner_hints:
- Plans/Server_System.md#SRV-018
- Plans/Multi-Account_Connection_Spec.md#MACS-002
- Plans/Remote_Access_System.md#RAS-017
```

ContractRef: ContractName:Plans/Server_System.md#SRV-018, ContractName:Plans/Multi-Account_Connection_Spec.md#MACS-002, ContractName:Plans/Remote_Access_System.md#RAS-017

#### SRV-018 exact command and data contract

All four definitions below are new version 1.0.0 resources in `Plans/server_system_contracts.schema.json`; they preserve every existing definition and close `additionalProperties`. Logical IDs are respectively `pm.server.ssh_host_trust.request.v1`, `pm.server.ssh_host_trust.result.v1`, `pm.server.ssh_public_key_install.request.v1` and `pm.server.ssh_public_key_install.result.v1`. F-d materializes the exact owner data/source contracts; F-b registers both primaries with their sole planned handlers, producer/return/disabled profiles and Touch rows. No alias is admitted.

| Primary and sole handler | Request | Result |
|---|---|---|
| `cmd.server.ssh.trust` → `handlers::server::ssh_host_trust` | `Plans/server_system_contracts.schema.json#/$defs/SshHostTrustCommandRequestV1` | `Plans/server_system_contracts.schema.json#/$defs/SshHostTrustCommandResultV1` |
| `cmd.server.ssh.public_key.install` → `handlers::server::ssh_public_key_install` | `Plans/server_system_contracts.schema.json#/$defs/SshPublicKeyInstallCommandRequestV1` | `Plans/server_system_contracts.schema.json#/$defs/SshPublicKeyInstallCommandResultV1` |

| Closed component | Required fields and joins |
|---|---|
| Shared request envelope | `schema_id`, `schema_version`, exact `command_id`, `phase=preview\|apply`, `operation_id`, `command_instance_id`, `idempotency_key`, `actor=human_gui\|human_palette`, actual `scope`, `target_ref`, `expected`, `permission_snapshot_ref`, `preview_ref`, `human_decision_ref`, `protected_input_ref`, `return_context`. Scope is the actual executing Server application scope under CV-365; optional initiating Project/draft context is descriptive and cannot replace the SSH target. Absent phase-inapplicable refs are present-null. Protected input is an ephemeral transport-only ref and is removed before durable intent recording. |
| Target source | `target_ref` selects exactly one owner-issued existing connection revision or pre-identity connection-draft revision/hash. It resolves executing `server_id`, `execution_host_id`, actual `execution_environment_id`, target host/port/remote account and transport/target generation. No invented remote PM Server or Project. Display the resolved destination before apply. |
| Trust payload | `trust_action=add\|replace`, `host_key_observation_ref`, `expected_trust_revision` or explicit absent-key proof. Observation source binds full public host-key fingerprint/algorithm, host/port, target generation, observed time/expiry and prior trust ref. Replace requires the exact prior and newly observed keys plus a fresh human decision; add cannot overwrite a prior key. Apply's preview/decision are required and must match the owner-issued complete commitment. |
| Install payload | `public_key_ref` binds shared `public_key_id`, revision, fingerprint and key-policy proof; `authorized_keys_observation_ref` binds the verified remote account/home/file identity, existing content digest/revision or explicit absence, permissions, matching host trust/session and expiry. No raw private key, password, arbitrary destination path or executable command. |
| Currentness and authority | `expected` captures target/connection or draft, topology, trust, auth/session, permission/Stop and public-key/file generations as applicable. Owner-issued preview includes these original sources, exact requested effect and expiry; apply re-reads and validates them immediately before effect. `human_decision_ref` is authentic protected owner evidence for that exact Client/operation/preview, never a caller-supplied confirmation boolean. |
| Result union | `schema_id`, `schema_version`, exact `command_id`, `phase`, `operation_id`, `status`, `target_ref`, `preview`, `receipt`, `error`, `work_ref`, `return_context`, `expected_event_types=[]`. `preview_ready` carries an owner preview and no mutation receipt; `applied\|unchanged` requires a verified owner receipt; `rejected\|failed` names the exact reason and any earlier settled facts; `effect_unknown` carries an owner reconciliation/work ref and never a fabricated success receipt. Nullability is branch-specific. |
| Receipt/source | Exact operation/idempotency/target/preview commitment; actual actor/authority source; observed host trust and public-key refs; before/after trust or authorized-file identity/digest/revision; settled/remaining effects, readback proof, UTC outcome and original-result replay ref. Source objects come from the owner, not client assertions. Canonical redacted intent/result and trust/connection/key references use existing secure/storage owners; no ordinary Settings value, live JSON mirror or reconstructable-from-events authority. |
| Return | Captured initiating `client_id`, invocation token, caller scope and context revision, caller route/focus, continuation generation. Echo exact values; a missing initiating caller is `caller_unavailable`, with the completed operation still discoverable by its original work/result identity. Back/Close never silently retargets or undoes a dispatched effect. |

Closed refusal reasons include `handler_unavailable`, `human_action_required`, `initiating_client_unavailable`, `caller_unavailable`, `permission_denied`, `stale_target`, `stale_preview`, `preview_expired`, `ssh_host_key_changed`, `host_trust_required`, `stale_trust`, `authentication_required`, `protected_input_expired`, `unsupported_ssh_target`, `unsupported_key`, `weak_key`, `key_unavailable`, `remote_account_changed`, `authorized_keys_changed`, `unsafe_remote_target`, `unsupported_remote_atomicity`, `remote_effect_unknown`, `idempotency_conflict` and `recovery_required`. Each is used only for its actual failed predicate; unknown remote effect cannot be relabelled permission refusal or safe retry.

Positive fixtures cover add trust, explicit changed-key replacement, same-key unchanged replay, first safe public-entry append, already-authorized strong key, absent-file CAS, exact continuation and separate connection verification. Negative/source fixtures cover forged or stale human decision, target/host-key/account substitution, old trust generation, revoked session, weak-before-reuse, wrong/private key, raw protected input, unauthorized caller, symlink/unsafe permissions, concurrent file edit, lost reply after possible write, wrong-body idempotency reuse, unsupported atomicity, another-Client return and speculative cleanup. Native security/durability evidence remains not_run.

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
canonical_text: 'Server consumes Backup/Restore policy and run contracts through one durable schedule-occurrence, outbox,
  writer, and maintenance-authority projection that survives every Client and restart. It also consumes Remote Access
  endpoint provenance that distinguishes PM-connector private ingress, hosted Funnel, and verified external host-Tailscale
  routes while deduplicating only by cryptographically verified server_id. A connector node identity is infrastructure
  owned by Remote Access, never a second Server identity. Safe Bootstrap claims a local Server before optionally entering
  fresh Full Server recovery; foreign-machine recovery creates a new Server and connector identity and pairs Clients
  again, while exact same-host takeover requires exclusive collision fencing. DL-259 DESKTOP-RESTORE-1 A, Jared 2026-10-31:
  the native desktop performs the first owner claim of its dormant local Server through a protected direct local handoff,
  with no code for the person to type. The Server owner binds that initial owner-claim authorization to its discovery_observation_id,
  pairing_session_id and identity_fingerprint for the existing cmd.server.claim request and exact current permission/generations.
  Ordinary Clients, browser state and loopback reachability cannot manufacture this protected native authority. Claim
  then separate cmd.server.bootstrap.start must complete for the actual local Server, its durable roots/mounts and immutable
  execution baseline before cmd.restore.server_full. Backup maintenance/recovery authority, exact-target verification,
  paused restore and separate pairing/remote activation remain required. Reuse current verified prerequisites when already
  satisfied; dormant capability alone is never a claim or bootstrap receipt.


  DL-272 RV-8, 2026-11-01: Restored Goals and schedules stay paused. A way in explicitly set up and activated after restore
  is reported active from its separate Remote Access result; restoring old configuration never activates it by itself.'
gui_related: true
gui_classification_reason: Schedule, bootstrap recovery, endpoint provenance, reconnect, disabled, and recovery-safe states are visible Server and Onboarding projections.
depends_on: [SRV-002, SRV-004, SRV-007, SRV-008, SRV-009, BRS-012, BRS-015, BRS-016, RAS-015, SIR-005, SIR-006, SIR-007, SIR-011]
unblocks: []
acceptance_criteria:
- One Server-owned occurrence identity and durable outbox survive DST repeat/skip, sleeping or offline source Hosts,
  duplicate signals, multiple Clients, restart, and Project Move; a moved Project is rebound through owner preflight
  and one-writer transfer rather than duplicated scheduling.
- Backup policy, capture, encryption, repository, retention, restore, and RecoverySet semantics remain Backup/Restore-owned;
  Shared Integration Runtime retains governor, lease, outbox-continuity, and ObservableWork primitives.
- Server Catalog metadata and the catalog backup repository remain distinct from every independently recoverable Project
  repository; unrelated Project repositories are outside one another's prune authority.
- Project copy, Move, source snapshots, and Project Backup exclude connector secret state; portable Full Server Backup
  excludes it by default, and optional inclusion remains unavailable until portability and explicit protected consent
  are proven.
- Cloud destination traffic and credentials do not default through PM Remote Link, connector relays, or tailnet identity,
  and a tailnet login never unlocks Backup.
- Endpoint projections carry route provenance and capabilities for connector-private, Funnel, and external host-managed
  routes; all observations remain untrusted until Server identity verification and pairing, and duplicate labels or addresses
  never merge identities.
- Fresh recovery starts only after safe local claim, keeps schedules/execution/remote exposure paused until recovery-safe
  checks pass, creates new Server and connector identities on a foreign machine, and permits same-host identity recovery
  only behind exclusive collision fencing.
- SRV-009's verified pre-migration backup remains a prerequisite for that storage migration only; it is not evidence
  that BRS v2 handlers, native scheduling, restore, remote transport, or recovery execution exists.
- This static consumer admits no new command or EventRecord family; any future packet command remains handler_unavailable
  with expected_event_types=[] until its owner, central catalog, sole handler, persistence/receipt, and production wiring
  are independently closed.
- 'DL-259 DESKTOP-RESTORE-1 A, Jared 2026-10-31: the native desktop performs the first owner claim of its dormant local
  Server through a protected direct local handoff, with no code for the person to type. The Server owner binds that initial
  owner-claim authorization to its discovery_observation_id, pairing_session_id and identity_fingerprint for the existing
  cmd.server.claim request and exact current permission/generations. Ordinary Clients, browser state and loopback reachability
  cannot manufacture this protected native authority. Claim then separate cmd.server.bootstrap.start must complete for
  the actual local Server, its durable roots/mounts and immutable execution baseline before cmd.restore.server_full.
  Backup maintenance/recovery authority, exact-target verification, paused restore and separate pairing/remote activation
  remain required. Reuse current verified prerequisites when already satisfied; dormant capability alone is never a claim
  or bootstrap receipt.'
- 'DL-272 RV-8, 2026-11-01: Restored Goals and schedules stay paused. A way in explicitly set up and activated after
  restore is reported active from its separate Remote Access result; restoring old configuration never activates it by
  itself.'
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
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31; DL-259)
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
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
canonical_text: >-
  Notebook and checkpoint records have exactly one canonical writer. Project records use the actual Project Home
  Server and Vault lease; an app thread's scratch notebook/checkpoints use its actual work Server's application
  store writer/lease before a Vault exists. Clients render read-only projections and issue exact idempotent owner
  commands. At admitted chat conversion, the Notebook/PSB owners copy/check/fence and cut over to the real destination
  Vault with new authority; the old app writer and any previous Project Server are fenced. No automatic failover
  or offline replica creates a second writer. Canonical Goal/Plan/Crew/schedule records retain their independent
  owner retention/holds beyond chat Undo expiry.
gui_related: false
gui_classification_reason: Writer authority is server behavior, not GUI work.
depends_on: [SRV-013, PSB-006]
unblocks: []
acceptance_criteria:
- Project notebook writes require actual Project/Vault writer authority; app scratch writes require actual thread/Server/application
  lease and null Project.
- Conversion permits exactly one live writer and issues fresh destination authority; stale source writes cannot
  succeed.
- Client closure never cancels Server-owned work and no cache becomes writable.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: dual_writer
reasoning_tier: standard
context_scope: server_system
implementation_surfaces: [Plans/Server_System.md, Plans/Project_Sync_and_Backbone.md]
node_compile_hint: {mode: server_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-I11
- 'source_ref:projects-pass2-20261103:N5/N17/N25/latest-Plan-schedule-ruling; Jared: "I approve the outstanding
  questions with their recommended settings."; SETTINGS-PROPOSAL.md and PLANS-EDIT-PLAN.md §3 A'
preserved_exact_tokens: ["one canonical writer", "Project Home Server"]
negative_constraints:
  - Do not create a second notebook writer through failover or Client replicas.
owner_hints: [Plans/Server_System.md]
```

ContractRef: ContractName:Plans/Server_System.md, ContractName:Plans/Project_Sync_and_Backbone.md

## External Multiplexer Transport Evaluation — DL-035 (2026-09-09)

DL-035 P11 authorizes evaluation only of an optional external multiplexer transport, such as a WezTerm-compatible remote daemon, for persistent remote shells within the existing PM session/process-host service. Selection is held until compatibility with PM Server ownership is resolved and a later explicit adoption decision is recorded. Evaluation compares plain SSH and PM-owned Server transport as alternatives; it is not an implementation task, installation request or approval of a protocol/library dependency.

The evaluation must produce an owner compatibility map and evidence-backed decision packet covering PM Server/Execution Host/Client responsibility, exact authenticated host/environment/session/cursor identity, spawn/attach/read/resize/input/exit/teardown ownership, and reconnect after Client disconnection or Server/transport interruption. PM remains owner of its engine and direct-OS-API process host under the landed DL-035 P1/P2 policy; a remote integration may not import emulator, parser or PTY-abstraction code, silently delegate PM writer authority, or create a writable Client replica. Shared Integration Runtime and Remote Access retain lifecycle/transport primitives; external endpoint labels, daemon process IDs and credentials do not become PM identity or trust.

Acceptance for an eventual candidate evaluation includes actionable daemon/protocol version mismatch, verified reconnect without duplicate shells, no silent local fallback, supported-host lifetime ownership, and separate WSL2 cases. Pin the evidence to the evaluated protocol/daemon versions and tested host path; unsupported or missing runners remain not-run with residual risk. Demonstrate how remote daemon lifetime and its state would coexist with the existing PM-owned host/Server model before claiming compatibility. Conflicting ownership is a reported incompatibility, not permission to revise Server canon.

The output is a plain-language comparison and recommendation with technical source/identity evidence, remaining incompatibilities and explicit selection status held. This PlanUnit schedules no native job, adopts no adapter or daemon, installs nothing, grants no new credential authority and enables no predictive echo. No current source report proves runtime acceptance or resolves the ownership question.

### SRV-015 - External Multiplexer Ownership Evaluation

```yaml
plan_unit_id: SRV-015
unit_type: requirement
status: accepted
owner_doc: Plans/Server_System.md
canonical_text: Evaluate an optional external multiplexer transport for persistent remote shells within PM
  existing session/process-host service, while holding selection for PM Server ownership compatibility and
  a later explicit adoption decision. PM-owned engine/host, one Server writer, exact identity and existing
  transport/security owners remain authoritative.
gui_related: false
gui_classification_reason: Not itself GUI; backend/orchestration ownership evaluation grants no product control
  or runtime.
depends_on:
- SRV-001
- SRV-002
- SRV-006
- SRV-007
- SMPFS-070
unblocks: []
acceptance_criteria:
- Produce a bounded comparison against plain SSH and PM-owned Server transport, with benefits, daemon/version/credential/maintenance
  costs, exact evidence and explicit held selection.
- Map Server, Execution Host, Client and external daemon ownership for spawn/attach/read/resize/input/exit/teardown
  and continuity; incompatibility is reported without silently changing owner contracts or creating a writable
  Client.
- Eventual evaluation covers actionable version mismatch, verified reconnect without duplicate shells, no local
  fallback, supported-host lifetime ownership and separate WSL2 cases.
- Every conclusion identifies exact authenticated host/environment/session/cursor joins, tested protocol/daemon
  versions and missing-runner risk; source study or static prose is not runtime acceptance.
- No engine/parser/PTY-abstraction dependency or reference-code reuse is adopted, PM-owned engine/host remain
  in force, and no daemon install, new credential authority or predictive echo is authorized.
- Compatibility evidence alone cannot select an adapter; any adoption returns in the approved plain-language
  decision form for an explicit later disposition.
validation_surfaces:
- Independent ownership/evidence review of the bounded evaluation report
- Future version-mismatch/reconnect/duplicate-shell/lifetime/WSL2 evaluation fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: external_mux_server_ownership_conflict
reasoning_tier: high
context_scope: terminal_external_mux_evaluation
implementation_surfaces:
- Plans/Server_System.md
- Plans/Shared_Integration_Runtime.md
- Plans/Remote_Access_System.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: evaluation_only_selection_held
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0013
negative_constraints:
- Evaluation only; selection held for Server compatibility and explicit later approval.
- No daemon installation, new credentials, reference-code reuse, writable Client replica or silent local fallback.
- No implementation, WorkNodes, NodeSeeds or native/runtime proof.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Server_System.md, ContractName:Plans/Automated_Testing_System.md


## PM7 client quit and live work (2026-10-29; D8–D12, G4)

App chats, Goals, Crew, PlanRuns and timers participate in these same work/quit rules under SRV-017. Client close remains separate from explicit Server service stop.

The server remains the owner of live work when a window quits. F3-665/DL-249 require a choice: keep server work (default), or stop reviewed selected work by current identities, never system services. SIR-054 owns ProcessFacts and server/environment resource observations; Resources samples only while open. Stop is whole-group SIGTERM then SIGKILL after 3 s, never a client-local kill. Restart reconciliation marks missing work Lost and tells its owner once.

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-665, ContractName:Plans/Shared_Integration_Runtime.md#SIR-054
