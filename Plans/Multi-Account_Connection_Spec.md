# Multi-Account Connection And Protected-Auth Command Contract

> **Authority:** This document is the subordinate typed-command owner for the exact `cmd.auth_profile.*` family retained by `Plans/Multi-Account.md` MA-045. It does not replace Multi-Account policy, provider-native authentication, the shared `AuthenticationBroker`, credential storage, protected Browser ownership, command registration, production wiring, or native implementation.

## 1. Scope and claim boundary

This contract closes the owner-side request, result, error, availability, permission, disabled-reason, redaction, and protected-input shapes for eight exact command candidates:

`cmd.auth_profile.sign_in`, `cmd.auth_profile.sign_out`, `cmd.auth_profile.verify`, `cmd.auth_profile.cancel`, `cmd.auth_profile.retry`, `cmd.auth_profile.submit_code`, `cmd.auth_profile.open_official_page`, and `cmd.auth_profile.select`.

Their closed machine contracts are:

- request: `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest`;
- result: `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult`;
- availability: `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandAvailability`;
- permission: `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision`;
- error: `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError`;
- protected Browser lifecycle projection: `Plans/protected_auth_browser_contracts.schema.json#/$defs/protected_auth_browser_lifecycle_projection`.

These definitions make the candidates contract-complete for later central adjudication. They do not add them to `Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.production.json`, or a native handler registry. Until those independent bindings exist, availability is `available=false`, `command_registered=false`, `native_handler_available=false`, and `disabled_reason=command_not_registered`. Static schema and fixture success is not runtime, provider, protected-browser, Slint, or security certification.

ContractRef: ContractName:Plans/Multi-Account.md#MA-045, SchemaID:pm.multi_account.auth_profile_command_contracts.v1, SchemaID:pm.protected_auth_browser_contracts.schema.v1

## 2. Exact command semantics

| Exact command | Owner semantics | Required safe result |
|---|---|---|
| `cmd.auth_profile.sign_in` | Begin the selected provider-native path for one exact provider, route, profile/account, verified installation, Server, Host, Environment, auth revision, profile generation, initiating Client, and continuation. | Redacted auth-operation/proof refs and lifecycle state; no credential or protected content. |
| `cmd.auth_profile.sign_out` | End or revoke authentication for one exact profile/account under expected generations, with explicit credential and dependent-connection dispositions. It is not cancellation of an in-progress sign-in. | Exact resulting auth/profile revisions and a receipt; no silent deletion of provider-owned data. |
| `cmd.auth_profile.verify` | Verify one exact profile/account through broker-owned credential use and a bounded supported verification policy. | Non-secret proof identity, freshness-bearing revision, bounded state, and remediation reference. |
| `cmd.auth_profile.cancel` | Cancel the exact nonterminal authentication operation under its original topology and initiating-Client binding. | Cancellation or truthful already-terminal/stale result; established credentials remain untouched. |
| `cmd.auth_profile.retry` | Resume the same recoverable operation within its continuation, deadline, retry budget, auth revision, topology, and Client binding. | Same-operation outcome; no implicit new account, route, host, environment, or flow. |
| `cmd.auth_profile.submit_code` | Consume a one-use, bounded-lifetime protected-input reference supplied by a human for the exact operation. | Redacted lifecycle/result only; raw code is absent and `protected_input_persisted=false`. |
| `cmd.auth_profile.open_official_page` | Start a human-only handoff through owner-verified official-route and domain-policy references. | External-handoff lifecycle only; no URL, content, success, trust, installation, or capability proof. |
| `cmd.auth_profile.select` | Select one exact eligible profile/account for one route and Project/Host/Environment under expected profile/auth/topology generations. | Exact selected profile/account and resulting generation; no credential copy or unrelated default change. |

All requests carry exact command and operation identity, command instance and idempotency identity, provider/route/profile/account/connection/installation/topology selectors, expected revisions/generations, permission snapshot, work and return-context refs, and a closed action payload. Display label, focus, newest record, executable name, or equal path text is never identity.

## 3. Handler-owner and existing authentication-command boundary

Multi-Account owns the auth-profile facade semantics. Authentication execution remains with the shared authentication owner and provider-specific/native mechanism. The already registered `cmd.authentication.start`, `cmd.authentication.cancel`, and `cmd.authentication.resume` contracts remain independent authentication-owner commands; this document does not rename them, declare the eight exact IDs to be aliases, or mint a second authentication engine.

If a future central binding admits an exact `cmd.auth_profile.*` command, the binding must prove one logical dispatch and an explicit translation into an existing authentication-owner operation where applicable. `sign_out`, `verify`, `submit_code`, `open_official_page`, and `select` require their exact owner semantics and cannot be guessed as lossy aliases. No native module path or event producer is claimed here.

## 4. Protected `AuthBrowserSession` boundary

Protected authentication is human-only, ephemeral, non-recordable, non-inspectable, non-exportable, and unavailable to agents, adapters, tools, Browser Programs, automation, capture, ordinary browser navigation, and storage-state access. It opens only on the exact initiating active Client. Inactive, disconnected, or mismatched Client state fails closed and never falls back to another connected Client.

The command request may carry only non-secret identifiers and references. A provider return/device code is represented solely by a one-use `protected_input_ref`; raw code, URL, DOM, cookies, storage state, screenshots, console, network traffic, clipboard content, credentials, tokens, or page representation are not request/result fields. The durable result contains only redacted operation/proof/receipt refs and lifecycle state. `AuthBrowserSession` is not converted into an ordinary Browser session after success, failure, cancellation, or restart.

The schema's `ProtectedAuthBoundary` fixes every denied capability to `false` and binds the canonical lifecycle projection by `owner_contract_ref`. This is a fail-closed command guard, not a sanitization or recording path.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-143, SchemaID:pm.protected_auth_browser_contracts.schema.v1

## 5. Availability, permission, errors, and effects

Availability is a separately typed snapshot. A command is enabled only when central registration and a native handler both exist and the exact profile/auth/topology/Client/provider state is current. Disabled reasons distinguish unregistered/handler absence from setup, profile eligibility, auth state, operation, deadline, retry budget, credential, dependency, installation, topology, revision, Client, official-source, provider/rate, permission, policy, protected-surface, and human-action blockers.

Permissions are exact-scope and snapshot-bound. Decisions always assert `credential_material_exposed=false`, `protected_content_exposed=false`, and `authority_widening=false`. Human-only actions admit only `human_gui` or `human_palette`; the owner reconciler may perform bounded `verify` but cannot sign in, sign out, cancel, retry, submit protected input, open a page, or select a profile for the user.

Errors use the closed `AuthProfileErrorCode` vocabulary and separate validation, state, permission, policy, topology, provider, protected-surface, recovery, and internal fail-closed categories. Safe messages and non-secret detail refs are allowed; raw provider output and protected content are not. Results are receipt-only with `event_effect_policy=receipt_only_no_eventrecord_pending_event_authority`. No new event family or producer is inferred.

## 6. Consumer and reverse-coverage contract

Provider Settings, first-run setup, Free Models setup, account/profile lists, palette, and Doctor user-action projections are GUI consumers. Headless agents, adapters, tools, automation, Browser Programs, capture, and MCP are prohibited consumers of all human/protected actions. A non-interactive owner reconciler is permitted only for `verify` under exact bounded permission and provider-egress policy.

Before any control becomes enabled, reverse coverage must resolve exact UI action -> exact command ID -> typed request/result/availability/permission/error -> one central catalog row -> one production wiring row -> one native handler owner -> receipt projection. Missing any edge yields `command_not_registered` or `native_handler_unavailable`, never optimistic dispatch.

`Plans/multi_account_contract_fixtures.json` covers all eight requests and all eight return-settling results and rejects agent origin, raw-code injection, recording, inspection, persistence, adapter access, operation mismatch, null caller return, missing/stale verification proof, expired/replayed/reusable protected input, missing/stale official source, missing selection eligibility, inconsistent return settlement, non-human selection, and protected-content permission exposure. Future implementation evidence still requires stale-generation, restart/reconnect, Client-loss, provider failure/rate, revocation/dependency, actual protected-input replay/expiry drills, accessibility, and native cross-platform tests.

## 7. PlanUnits

### MACS-001 - Authentication-Profile Command Contract Closure

```yaml
plan_unit_id: MACS-001
unit_type: schema_contract
status: accepted
owner_doc: Plans/Multi-Account_Connection_Spec.md
canonical_text: >-
  Eight exact cmd.auth_profile commands use the closed Multi-Account request, result, availability, permission,
  disabled-reason, and error contract with exact account, route, installation, topology, Client, auth-revision,
  and profile-generation fencing; owner schema closure does not register a command or prove a native handler.
gui_related: true
gui_classification_reason: The exact sign-in, sign-out, verify, cancel, retry, code, official-page, and profile-selection actions are visible account/setup controls.
depends_on: [MA-045]
unblocks: []
acceptance_criteria:
  - All eight exact IDs have one closed request/result/availability/permission/error family and one positive request and result fixture each.
  - Unregistered or handlerless commands remain unavailable with an exact disabled reason.
  - The existing cmd.authentication family is neither renamed nor treated as an undeclared alias.
validation_surfaces: [Plans/multi_account_contract_fixtures.json, future central catalog/wiring and native handler fixtures]
risk_class: auth_profile_command_phantom_closure
reasoning_tier: high
context_scope: auth_profile_command_contracts
implementation_surfaces: [Plans/Multi-Account_Connection_Spec.md, Plans/multi_account_contracts.schema.json]
node_compile_hint: {mode: auth_profile_command_contracts, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:IRT-001, source_ref:egolite-requirement:IRT-006, source_ref:egolite-requirement:IRT-011, source_ref:egolite-requirement:IRT-013, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:163-169, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:361-412]
negative_constraints:
  - Do not infer central registration, production wiring, native handlers, events, provider success, or runtime readiness from schema or fixture validation.
  - Do not infer account/profile identity from display text, focus, newest record, executable name, or path equality.
```

### MACS-002 - Human-Only Protected Authentication Boundary

```yaml
plan_unit_id: MACS-002
unit_type: security_contract
status: accepted
owner_doc: Plans/Multi-Account_Connection_Spec.md
canonical_text: >-
  AuthBrowserSession and protected device-code/page handoff remain human-only, ephemeral, non-recordable,
  non-inspectable, non-exportable, exact-Client-bound, and unavailable to agents, adapters, tools, automation,
  Browser Programs, capture, ordinary navigation, and persistence; commands exchange only one-use protected-input
  and redacted lifecycle/proof references.
gui_related: true
gui_classification_reason: The contract governs the user-visible protected authentication handoff and its safe lifecycle status.
depends_on: [MACS-001, SMPFS-143]
unblocks: []
acceptance_criteria:
  - Raw credentials, codes, URLs, page content, DOM, screenshots, console, network, cookies, storage state, and clipboard content are absent from request and result schemas.
  - Missing or mismatched initiating active Client fails closed without fallback.
  - Negative fixtures reject agent/adapter access, recording, inspection, persistence, raw code, and protected-content projection.
validation_surfaces: [Plans/multi_account_contract_fixtures.json, Plans/protected_auth_browser_contract_fixtures.json, future protected-session runtime tests]
risk_class: protected_auth_content_or_authority_escape
reasoning_tier: high
context_scope: auth_profile_protected_human_handoff
implementation_surfaces: [Plans/Multi-Account_Connection_Spec.md, Plans/multi_account_contracts.schema.json, Plans/protected_auth_browser_contracts.schema.json]
node_compile_hint: {mode: auth_profile_protected_human_handoff, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:BRW-013, source_ref:egolite-requirement:SEC-002, source_ref:egolite-requirement:SEC-003, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:110, source_ref:packet:PKT-04/08_AUTHORITY_AND_SUPERSESSION.md:24-48]
negative_constraints:
  - Do not sanitize protected content into ordinary Browser, storage, artifact, log, prompt, recording, inspection, export, or adapter state; reject the subject.
  - Do not claim protected Browser execution or security certification from static contract evidence.
```

## 8. Retained Packet Candidate Inventory (Deferred And Non-Emitting)

The exact PKT-04 event names below are retained only as non-canonical inventory. Each has `canonical=false`, `registered=false`, `emits_eventrecord=false`, `disposition=deferred_non_emitting_event_candidate`, and reason `event_authority_and_native_producer_contract_absent`:

`auth_profile.sign_in_started`, `auth_profile.challenge_presented`, `auth_profile.completed`, `auth_profile.cancelled`, `auth_profile.failed`, `auth_profile.expired`, `auth_profile.verified`, `auth_profile.signed_out`, `credential.attachment.created`, `credential.attachment.expired`, `credential.attachment.revoked`.

Adjacent packet command candidates are retained without becoming aliases, primaries, or dispatchable commands:

| Exact candidate group | Disposition | Reason |
|---|---|---|
| `cmd.auth_profile.open_details`, `cmd.auth_profile.rename`, `cmd.auth_profile.revoke`, `cmd.auth_profile.transfer.preview`, `cmd.auth_profile.transfer.apply` | `deferred_noncanonical_candidate` | Exact payload/result, ownership-transfer, permission, handler, and central bindings remain unadjudicated. |
| `cmd.auth_session.start`, `cmd.auth_session.cancel`, `cmd.auth_session.retry`, `cmd.auth_session.resume_callback`, `cmd.auth_session.submit_redirect`, `cmd.auth_session.submit_returned_code`, `cmd.auth_session.open_official_page`, `cmd.auth_session.open_secure_browser`, `cmd.auth_session.close_secure_browser`, `cmd.auth_session.open_secure_cli`, `cmd.auth_session.open_details` | `deferred_noncanonical_candidate` | Relationship to existing authentication commands and protected-session owner requires explicit alias/primary adjudication; no dispatch is admitted. |
| `cmd.auth_session.copy_device_code` | `deferred_noncanonical_candidate_blocked_protected_boundary` | Clipboard/content projection conflicts with the protected non-observation boundary; it cannot dispatch without a later owner decision that preserves that boundary. |
| `cmd.credential_attachment.open_consumers`, `cmd.credential_attachment.open_details`, `cmd.credential_attachment.revoke`, `cmd.credential_attachment.revoke_active`, `cmd.credential_attachment.test`, `cmd.credential_attachment.transfer.preview`, `cmd.credential_attachment.transfer.apply` | `deferred_noncanonical_candidate` | Credential Broker ownership, redaction, active-use/revocation, transfer, permission, and native contracts are absent. |
| `cmd.credential_source.add`, `cmd.credential_source.open_details`, `cmd.credential_source.remove`, `cmd.credential_source.test` | `deferred_noncanonical_candidate` | Credential source ownership, secret custody, provider, and native contracts are absent. |
| `cmd.provider_binding.copy`, `cmd.provider_binding.resolve_on_destination` | `deferred_noncanonical_candidate` | Destination identity, authority, credential-copy prohibition, and resolution contracts are absent. |

The eight closed auth-profile commands now require a non-secret return context and a result-side settlement. Sign-in binds exact profile, account, and verified installation selectors. Completed verification requires a current proof ref plus issued/expiry timestamps; blocked or failed verification requires a remediation ref. `submit_code` requires an exact-operation-bound protected-input contract with current/fresh status, one-use consume-and-zeroize policy, replay rejection, expiry timestamp, and no persistence; completion requires a consumed-and-zeroized disposition. Official-page handoff requires a current official-source proof. Profile selection requires both profile and installation eligibility proofs. None of these fields make AuthBrowserSession observable, recordable, inspectable, persistent, or available to agents/adapters/tools.

## Official-Page Central-Route Binding Addendum - 2026-09-01

The central command/wiring closure assigns `cmd.auth_profile.open_official_page` to exactly one future Multi-Account target, `handlers::multi_account::open_official_page`. It consumes the existing `AuthProfileCommandRequest|AuthProfileCommandResult|AuthProfileCommandError|AuthProfileCommandAvailability|AuthProfilePermissionDecision` family in `Plans/multi_account_contracts.schema.json`. The route may launch only an owner-verified human handoff through the protected authentication boundary on the exact initiating active Client. It carries no raw URL or protected content and grants no browser observation, capture, automation, agent, adapter, or success authority. The command remains `handler_unavailable` until native dispatcher and protected-handoff evidence exists.

### MACS-003 - Official Page Sole Future Handler

```yaml
plan_unit_id: MACS-003
unit_type: command_binding
status: accepted
owner_doc: Plans/Multi-Account_Connection_Spec.md
canonical_text: cmd.auth_profile.open_official_page has exactly one planned Multi-Account route, handlers::multi_account::open_official_page, which preserves the human-only exact-Client protected-auth boundary and the existing owner-DRY auth-profile contracts.
gui_related: true
gui_classification_reason: Authentication handoff, Product Onboarding owner handoff, Settings Integrations, Doctor remediation, and palette consumers expose the action and exact disabled reason.
depends_on: [MACS-001, MACS-002]
unblocks: []
acceptance_criteria:
  - Central catalog and production-intent wiring name exactly handlers::multi_account::open_official_page and the existing AuthProfile request/result schema pointers.
  - The request/result contain only non-secret identities and redacted lifecycle/proof refs; raw URL and protected content remain structurally absent.
  - Missing executable handler or exact initiating active Client keeps the action disabled and never falls back to another Client.
validation_surfaces: [Plans/multi_account_contracts.schema.json, Plans/multi_account_contract_fixtures.json, Plans/protected_auth_browser_contract_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
risk_class: protected_auth_handoff_phantom_handler_or_content_escape
reasoning_tier: high
context_scope: auth_profile_official_page_central_binding
implementation_surfaces: [Plans/Multi-Account_Connection_Spec.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: command_binding_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:row-10, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:378-385, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#repair_target:cmd.auth_profile.open_official_page]
negative_constraints:
  - Do not expose raw URL, DOM, cookies, storage state, screenshot, console, network, clipboard, credentials, tokens, or protected content.
  - Do not treat the planned target string as native, provider, protected-browser, security, or runtime proof.
```

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 7 previously unbound primary commands. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.auth_profile.cancel` | `handlers::multi_account::cancel` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError` / `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision` |
| `cmd.auth_profile.retry` | `handlers::multi_account::retry` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError` / `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision` |
| `cmd.auth_profile.select` | `handlers::multi_account::select` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError` / `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision` |
| `cmd.auth_profile.sign_in` | `handlers::multi_account::sign_in` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError` / `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision` |
| `cmd.auth_profile.sign_out` | `handlers::multi_account::sign_out` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError` / `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision` |
| `cmd.auth_profile.submit_code` | `handlers::multi_account::submit_code` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError` / `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision` |
| `cmd.auth_profile.verify` | `handlers::multi_account::verify` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandRequest` -> `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandResult` | `Plans/multi_account_contracts.schema.json#/$defs/AuthProfileCommandError` / `Plans/multi_account_contracts.schema.json#/$defs/AuthProfilePermissionDecision` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.auth_profile.cancel`, `cmd.auth_profile.retry`, `cmd.auth_profile.select`, `cmd.auth_profile.sign_in`, `cmd.auth_profile.sign_out`, `cmd.auth_profile.submit_code`, `cmd.auth_profile.verify`.

Exact sole future handler set: `handlers::multi_account::cancel`, `handlers::multi_account::retry`, `handlers::multi_account::select`, `handlers::multi_account::sign_in`, `handlers::multi_account::sign_out`, `handlers::multi_account::submit_code`, `handlers::multi_account::verify`.

### MACS-004 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: MACS-004
unit_type: command_binding
status: accepted
owner_doc: Plans/Multi-Account_Connection_Spec.md
canonical_text: >-
  Multi-Account Connection owns exactly 7 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 7 commands and their exact disabled reasons.
depends_on: [MACS-001, MACS-003]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 7-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
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
- Plans/Multi-Account_Connection_Spec.md
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
