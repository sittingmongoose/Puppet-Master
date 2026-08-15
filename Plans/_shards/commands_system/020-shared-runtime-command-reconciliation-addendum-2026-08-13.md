# Shard 020: Shared Runtime Command Reconciliation Addendum - 2026-08-13

Source: `Plans/Commands_System.md`

Source lines: L4028-L4267

Source SHA256: `af17557e7089aa0224394a5d063da4af28bbc3bbba2a703ab91100ff84d78f70`

---

## Shared Runtime Command Reconciliation Addendum - 2026-08-13

This addendum adjudicates the corrected remaining-runtime packet's 34 candidate UICommand IDs against the live catalog. It owns family semantics only; row-level catalog metadata remains in `Plans/UI_Command_Catalog.md`. It does not mint an EventRecord family, imply Event Authority denominator closure, or authorize a handler to emit an unregistered event.

### Candidate census and alias dispositions

| Candidate token | Disposition | Canonical command |
|---|---|---|
| `cmd.lsp.server.restart` | compatibility spelling, not registered | `cmd.lsp.restart_server` |
| `cmd.lsp.server.diagnose` | compatibility intent, not registered | `cmd.lsp.open_problems`; existing diagnostics/status projections supply the detail without a second diagnose command |
| `cmd.debug.session.start` | compatibility spelling, not registered | `cmd.run_debug.start` |
| `cmd.debug.session.stop` | compatibility spelling, not registered | `cmd.run_debug.stop` |
| `cmd.debug.session.action` | rejected generic dispatcher | the exact concrete `cmd.run_debug.*` verb |
| `cmd.worktree.provision` | compatibility spelling, not registered | `cmd.git.worktree.create` |
| `cmd.worktree.release` | compatibility spelling, not registered | `cmd.git.worktree.release` |
| `cmd.context.receipt.open` | compatibility intent, not registered | `cmd.nav.open_subject`, or `cmd.nav.open_usage_subject` for Usage identity |
| `cmd.remote.reconnect` | retained existing remote-surface wrapper | normalizes to `cmd.environment.reconnect` only after resolving an exact `ExecutionEnvironmentId`; it is not the generalized command |

The remaining 26 IDs below are the only new canonical IDs from the 34-row candidate register. Chat, Settings, Onboarding, Doctor, provider, and panel surfaces reuse these IDs rather than minting local peers.

The retained `cmd.remote.reconnect` wrapper accepts `RemoteReconnectWrapperRequest{project_id, remote_id, execution_environment_id, expected_remote_revision, expected_connection_epoch, idempotency_key}` and returns the underlying `EnvironmentConnectionCommandResult`. Its state selector is the remote row's resolved `online|degraded|offline|auth_blocked` environment projection; disabled reasons are `target_missing`, `stale_projection`, `topology_unavailable`, `auth_state_mismatch`, `breaker_open`, `permission_required`, and `policy_denied`. `handlers::remote::reconnect` performs resolution only and then calls the sole `handlers::environment::reconnect` domain handler. It does not maintain a second connection lifecycle, and its recovery, accessibility, tests, receipts, and no-unregistered-event rule are identical to the generalized command.

### Shared envelope, response, and fail-closed effect

Every new request type below includes `command_instance_id`, `idempotency_key`, `expected_revision_or_epoch`, `project_id`, `project_home_server_id`, `execution_host_id`, `execution_environment_id`, nullable `source_location_id`, `topology_generation`, `actor_ref`, `permission_snapshot_ref`, optional `goal_id`, `plan_id`, `run_id`, `thread_id`, `agent_id`, `crew_id`, `deadline_utc`, and `recovery_of_operation_id`. A command whose subject does not use one optional lineage field carries it as absent; it never substitutes a path or display label for exact topology identity.

Every result type includes `operation_id`, `command_instance_id`, `outcome` (`accepted`, `no_change`, `blocked`, `cancelled`, `failed`, or `recovery_required`), `observable_work_id?`, `current_revision_or_epoch`, `projection_ref`, `receipt_refs[]`, `artifact_refs[]`, `disabled_reason?`, `recovery_actions[]`, and `replayed`. `accepted` means admitted or durably queued, not domain success. Terminal success requires the typed owner result/receipt and owner verification. Replay returns the original result identity without a second side effect.

Until Event Authority individually admits a producer family, these commands have `event_effect = none_pending_event_authority`; they update only owner-authorized redb state and return the typed result/receipt/projection references below. A missing event registration is an explicit blocked integration edge, never permission to invent an EventRecord name.

### Canonical 26-row shared-runtime command family

| Command ID | Typed payload -> result | State selector and disabled reasons | Sole handler | Receipt/projection effect |
|---|---|---|---|---|
| `cmd.environment.connect` | `EnvironmentConnectionCommandRequest{action=connect, environment_id, expected_supervisor_generation, expected_connection_epoch}` -> `EnvironmentConnectionCommandResult` | `offline`, `closed`; `stale_projection`, `already_in_state`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::environment::connect` | `EnvironmentConnectionState`, `ObservableWork`; no EventRecord pending authority |
| `cmd.environment.reconnect` | `EnvironmentConnectionCommandRequest{action=reconnect, environment_id, expected_supervisor_generation, expected_connection_epoch, reason}` -> `EnvironmentConnectionCommandResult` | `online`, `degraded`, `offline`, `auth_blocked`; same as connect plus `auth_state_mismatch`, `breaker_open` | `handlers::environment::reconnect` | replacement epoch plus `EnvironmentConnectionState`; no EventRecord pending authority |
| `cmd.environment.disconnect` | `EnvironmentConnectionCommandRequest{action=disconnect, environment_id, expected_supervisor_generation, expected_connection_epoch, drain_policy}` -> `EnvironmentConnectionCommandResult` | not `closed`; `stale_projection`, `already_in_state`, `operation_in_progress`, `permission_required` | `handlers::environment::disconnect` | closing/closed projection and work result; no EventRecord pending authority |
| `cmd.thread.outbox.retry` | `ThreadOutboxRetryRequest{outbox_entry_id, thread_id, expected_outbox_revision, expected_target_generation}` -> `ThreadOutboxCommandResult` | retryable unacknowledged entry; `outbox_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required` | `handlers::thread_outbox::retry` | same logical command/idempotency identity, new bounded attempt; no EventRecord pending authority |
| `cmd.thread.outbox.cancel` | `ThreadOutboxCancelRequest{outbox_entry_id, thread_id, expected_outbox_revision, cancellation_reason}` -> `ThreadOutboxCommandResult` | cancellable uncommitted entry; `outbox_state_mismatch`, `stale_projection`, `already_in_state`, `permission_required` | `handlers::thread_outbox::cancel` | durable cancellation intent/result; no EventRecord pending authority |
| `cmd.thread.request` | `ThreadRequestCommandRequest{request_id, parent_thread_id?, requested_thread_kind, bounded_request_ref, target_generation}` -> `ThreadRequestCommandResult` | target current and request admissible; `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::thread::request` | durable outbox entry and stable request/thread reconciliation refs; no EventRecord pending authority |
| `cmd.thread.spawn` | `ThreadSpawnCommandRequest{spawn_request_id, parent_thread_id, requested_role, bounded_context_ref, target_generation}` -> `ThreadSpawnCommandResult` | parent current and spawn allowed; `stale_projection`, `policy_denied`, `resource_blocked`, `lease_conflict`, `permission_required` | `handlers::thread::spawn` | stable spawn request and resulting child ref when committed; no EventRecord pending authority |
| `cmd.thread.await` | `ThreadAwaitCommandRequest{await_request_id, thread_id, condition_ref, timeout_utc, target_generation}` -> `ThreadAwaitCommandResult` | current nonterminal target; `stale_projection`, `already_in_state`, `deadline_expired`, `target_missing`, `policy_denied` | `handlers::thread::await_condition` | asynchronous wait as `ObservableWork`, never a blocked UI thread; no EventRecord pending authority |
| `cmd.capability.ensure` | `CapabilityEnsureRequest{capability_id, provisioning_mode=Off,Auto,On, requirement_ref, origin_operation_id}` -> `CapabilityEnsureResult` | exact target and current policy; `capability_unavailable`, `setup_required`, `approval_required`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::capability::ensure` | `CapabilityProvisioningOperation`/readiness projection; provider first acquisition still requires explicit setup |
| `cmd.tool.discover` | `ToolDiscoverRequest{capability_query_ref, stage_limit, expected_registry_generation}` -> `ToolDiscoverResult` | registry query allowed; `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked` | `handlers::tool::discover` | bounded progressive capability-stage projection and artifact refs; no EventRecord pending authority |
| `cmd.tool.select` | `ToolSelectRequest{selection_id, tool_refs[], expected_registry_generation, policy_snapshot_ref}` -> `ToolSelectResult` | all selected refs current/admissible; `stale_projection`, `capability_unavailable`, `policy_denied`, `permission_required` | `handlers::tool::select` | stable ordered selection projection; does not invoke a tool or widen policy |
| `cmd.installation.install` | `InstallationLifecycleCommandRequest{action=install, subject_kind, subject_id, provider_cli, acquisition_basis, official_source_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | no ready installation and explicit acquisition allowed; `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied` | `handlers::installation::install` | `InstallationLifecycleRecord`, proof and `ObservableWork` refs; no EventRecord pending authority |
| `cmd.installation.update` | `InstallationLifecycleCommandRequest{action=update, installation_id, target_release_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | verified consented installation; install reasons plus `target_missing`, `resource_blocked` | `handlers::installation::update` | retains last verified activation until replacement commit; no EventRecord pending authority |
| `cmd.installation.repair` | `InstallationLifecycleCommandRequest{action=repair, installation_id, repair_plan_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | known installation with repair evidence; update reasons | `handlers::installation::repair` | bounded repair attempt and verification refs; no EventRecord pending authority |
| `cmd.installation.rollback` | `InstallationLifecycleCommandRequest{action=rollback, installation_id, rollback_target_ref, provenance_ref}` -> `InstallationLifecycleCommandResult` | verified rollback target; `target_missing`, `official_source_unverified`, `host_environment_mismatch`, `operation_in_progress`, `permission_required`, `policy_denied` | `handlers::installation::rollback` | rollback/verification receipt refs and lifecycle projection; no EventRecord pending authority |
| `cmd.installation.verify` | `InstallationLifecycleCommandRequest{action=verify, installation_id, verification_policy_ref}` -> `InstallationLifecycleCommandResult` | installation resolvable; `target_missing`, `host_environment_mismatch`, `operation_in_progress`, `policy_denied` | `handlers::installation::verify` | proof-based readiness evidence; exit zero or PATH discovery alone is not success |
| `cmd.authentication.start` | `AuthenticationCommandRequest{action=start, provider_id, route_id, profile_ref?, account_id?, connection_id?, auth_surface, credential_ref?}` -> `AuthenticationCommandResult` | installation separately verified and auth path supported; `setup_required`, `auth_state_mismatch`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::start` | non-secret auth operation/proof refs; install, auth, entitlement, and readiness remain separate |
| `cmd.authentication.cancel` | `AuthenticationCommandRequest{action=cancel, authentication_operation_id, expected_auth_revision}` -> `AuthenticationCommandResult` | current cancellable auth operation; `auth_state_mismatch`, `already_in_state`, `stale_projection`, `permission_required` | `handlers::authentication::cancel` | cancellation receipt/projection; never deletes provider-owned credentials without a separate owner action |
| `cmd.authentication.resume` | `AuthenticationCommandRequest{action=resume, authentication_operation_id, expected_auth_revision, continuation_ref}` -> `AuthenticationCommandResult` | same nonterminal operation and authority binding; `auth_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::resume` | resumes the same auth operation; never rotates account/route/host silently |
| `cmd.eval.session.start` | `EvalSessionCommandRequest{action=start, eval_session_id, language, sandbox_policy_ref, limits_ref, variable_scope_ref}` -> `EvalSessionCommandResult` | supported exact-target adapter and no conflicting lease; `unsupported`, `capability_unavailable`, `resource_blocked`, `lease_conflict`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::eval_session::start` | `EvalSessionRecord`, lease, `ObservableWork`, artifact refs; no hidden global kernel |
| `cmd.eval.session.execute` | `EvalSessionCommandRequest{action=execute, eval_session_id, execution_id, expected_session_generation, code_artifact_ref, selected_tool_refs[]}` -> `EvalSessionCommandResult` | live current session; `session_state_mismatch`, `stale_projection`, `deadline_expired`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::eval_session::execute` | bounded output plus redacted spill artifact; nested calls keep independent policy/admission |
| `cmd.eval.session.stop` | `EvalSessionCommandRequest{action=stop, eval_session_id, expected_session_generation, variable_disposition, cleanup_policy_ref}` -> `EvalSessionCommandResult` | live/recoverable session; `session_state_mismatch`, `stale_projection`, `operation_in_progress`, `permission_required` | `handlers::eval_session::stop` | explicit cleanup and variable/artifact disposition; no EventRecord pending authority |
| `cmd.mcp.server.connect` | `McpServerLifecycleCommandRequest{action=connect, server_id, expected_config_epoch, expected_runtime_generation}` -> `McpServerLifecycleCommandResult` | enabled valid server; `stale_projection`, `already_in_state`, `operation_in_progress`, `capability_unavailable`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::mcp::connect_server` | component-state projection, lease and work refs; no EventRecord pending authority |
| `cmd.mcp.server.reconnect` | `McpServerLifecycleCommandRequest{action=reconnect, server_id, expected_config_epoch, expected_runtime_generation, reason}` -> `McpServerLifecycleCommandResult` | configured server and breaker admits/join; connect reasons plus `breaker_open`, `auth_state_mismatch` | `handlers::mcp::reconnect_server` | joins the one generation-scoped reconnect; does not erase failure history or add invoke retries |
| `cmd.resource.inspect` | `RuntimeResourceInspectRequest{resource_scope_ref, host_id, environment_id, expected_policy_generation}` -> `RuntimeResourceInspectResult` | readable exact host/environment; `stale_projection`, `topology_unavailable`, `target_missing`, `permission_required` | `handlers::runtime_resource::inspect` | read-only governor/admission/lease/awareness refs; never changes admission |
| `cmd.bsd.set` | `BackSeatDriverModeSetRequest{scope_kind, scope_id, requested_mode=Off,Auto,On, expected_policy_revision}` -> `BackSeatDriverModeSetResult` | scope writable and projection current; `stale_projection`, `already_in_state`, `policy_denied`, `permission_required` | `handlers::back_seat_driver::set_mode` | durable effective-mode projection/receipt; default and recommended value are `Auto`, mode never grants tools or authority |

### Recovery, accessibility, and regression contract

Handlers perform CAS and idempotency checks before mutation, join the existing logical operation when safe, and otherwise return a typed disabled/recovery result. Cancellation is request/acknowledgement based; a button press or accepted command is not cleanup. Restart recovery uses the same `operation_id`, topology generation, owner record, lease and receipt evidence. Missing or conflicting evidence returns `recovery_required` or a disabled reason, never success.

Every visible command exposes its runtime label, current state, disabled reason, busy/wait phase, and terminal outcome to assistive technology. Keyboard and pointer activation dispatch the same ID and payload. Focus remains on the invoking control while accepted work is pending; completion announcements identify the subject and outcome without reading secret or raw output content. Destructive or authority-sensitive setup remains on the shared confirmation/permission surface.

Regression fixtures must cover payload/result schema validation, exact handler uniqueness, alias normalization, keyboard/pointer parity, stale epoch/CAS refusal, idempotent replay, restart reconciliation, cancel-vs-complete races, permission and topology denial, receipt/projection presence, and the absence of unregistered EventRecord effects. Domain-specific suites additionally cover outbox ordering, explicit provider-CLI acquisition, rollback preservation, auth/readiness separation, Eval isolation/output bounds, MCP breaker joining, resource read-only behavior, and BSD `Off|Auto|On` with effective default `Auto`.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

### CS-066 - Shared Runtime Command Census And Typed Family

```yaml
plan_unit_id: CS-066
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The corrected packet's 34 candidate command IDs resolve to 26 new generalized
  shared-runtime commands, seven compatibility intents over existing canonical
  commands, and one rejected generic debug dispatcher; cmd.remote.reconnect
  remains an existing remote wrapper over the newly canonical generalized
  cmd.environment.reconnect after exact environment resolution.
gui_related: true
gui_classification_reason: The commands define visible actions, enabled and disabled state, progress, recovery, and assistive-technology behavior across runtime surfaces.
split_recommended: false
depends_on: [SIR-003, SIR-004, SIR-005, SIR-006, SIR-008, SIR-010, CS-063]
unblocks: [UCC-145]
acceptance_criteria:
  - Exactly 26 new command IDs appear in the canonical family table and no candidate-local Chat, Settings, Onboarding, Doctor, provider, or panel clone is minted.
  - The seven candidate compatibility intents resolve to existing canonical commands and cmd.debug.session.action is rejected in favor of an exact cmd.run_debug.* verb.
  - Every new row has a typed payload/result, state selector, closed disabled reasons, sole handler, receipt/projection effect, recovery rule, accessibility rule, and regression expectations.
  - No row emits or names a new EventRecord family while Event Authority remains UNKNOWN_OPEN.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - command census and exact-handler uniqueness fixture
  - typed command replay, restart, race, accessibility, and no-unregistered-event fixtures
risk_class: command_alias_or_authority_drift
reasoning_tier: high
context_scope: shared_runtime_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: shared_runtime_command_family, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/CANDIDATE_COMMAND_ID_REGISTER.json
  - Plans/Shared_Integration_Runtime.md#15.1
preserved_exact_tokens: [cmd.environment.reconnect, cmd.remote.reconnect, cmd.lsp.restart_server, cmd.run_debug.*, cmd.git.worktree.create, cmd.nav.open_subject, none_pending_event_authority]
negative_constraints:
  - Do not mint an EventRecord family, a generic debug action dispatcher, or surface-local command clones.
  - Do not treat command acceptance, dispatch, or a UI acknowledgement as domain success.
  - Do not let cmd.remote.reconnect replace the generalized environment command or bypass exact ExecutionEnvironmentId resolution.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Shared_Integration_Runtime.md]
```

### CS-058 - EventRecord V2 Command Evidence Consumer

```yaml
plan_unit_id: CS-058
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Command-originated persisted domain evidence consumes EventRecord 2.0 scope, global
  event identity, exact scope-partitioned index identity, scoped lifetime idempotency,
  dedupe catch-up, complete-reader admission, no-secret custody, and synced-receipt truth.
  Project restore, worktree, attempt, receipt, and restore-point events require project
  scope; app-root storage diagnostics use application scope without a fake project;
  StorageCompatibilityStatus is not appended into an incompatible target; and normal
  command dispatch can neither request projector_replay_only nor fabricate local events.
gui_related: false
gui_classification_reason: Defines backend event identity, dedupe, durability, and scope constraints for command handlers.
split_recommended: false
depends_on: [CS-006, CS-007, CV-317, CV-318, CV-320, CV-321, SP-241]
unblocks: []
acceptance_criteria:
  - Every command-originated persisted event uses schema_version 2.0.0, exact scope_kind/project_id pairing, and a registered payload/event owner.
  - EventRecord 2.0 root inspection refuses open unless the reader validates 2.0.0; partial or best-effort projection is impossible.
  - Event index access uses exact app/project scope_partition encoding, zero-padded sequence_id_20, and the canonical event_record_index.v2 key; key/value scope mismatch is corruption.
  - A replayed command identity returns the original only for the same semantic digest; conflict or dedupe_unavailable appends nothing.
  - No command success that requires durability is authorized by persisted_at_utc without the matching synced AppendReceipt or owner receipt.
  - Normal dispatch cannot construct projector_replay_only, and compatibility replay produces zero command/tool/provider/network/notification/usage/safe-point/external side effects.
  - Unsupported/newer-store compatibility status remains diagnostic-only; secrets and local root/worktree/credential paths remain absent or local/redacted.
validation_surfaces:
  - future Case L EventRecord scope, dedupe, replay-only, and command-receipt fixtures
  - python3 -m json.tool Plans/event_record.schema.json
  - python3 scripts/pm-plan-index.py validate
risk_class: command_event_identity_or_durability_drift
reasoning_tier: high
context_scope: case_l_command_eventrecord_v2
implementation_surfaces: [Plans/Commands_System.md, Plans/Contracts_V0.md, Plans/event_record.schema.json, Plans/storage-plan.md]
node_compile_hint:
  mode: case_l_command_eventrecord_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-007
  - Case-L:L-008
  - Case-L:L-009
  - Case-L:L-023
  - Case-L:EVT-01..EVT-07
preserved_exact_tokens:
  - EventRecord
  - 2.0.0
  - scope_kind
  - scope_partition
  - application
  - project
  - "event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}"
  - sequence_id_20
  - projector_replay_only
  - replay_only_not_appendable
  - dedupe_unavailable
  - AppendReceipt
  - synced
negative_constraints:
  - Do not fabricate a project for application scope or emit into an incompatible store.
  - Do not let command handlers create a peer event envelope, dedupe rule, or durability meaning.
  - Do not infer successful persistence from timestamps or projection/UI state.
  - Do not open an EventRecord 2.0 root with a reader that cannot validate 2.0.0 or persist raw secret/credential material in command evidence.
owner_hints: [Plans/Commands_System.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

### CS-059 - Storage Compatibility Maintenance Retention And Availability Gate

```yaml
plan_unit_id: CS-059
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Storage-facing commands consume owner compatibility, migration, maintenance, retention,
  and registry-materialization gates without creating a live unsupported-store viewer,
  generic repair/salvage/Doctor mutation, force-cancel/try-anyway path, retention inference,
  hold/maintenance bypass, or lazy alias rewrite. Retry actions revalidate rather than repair;
  protected hold and manual-compaction requests stay owner-routed; and affected actions remain
  unavailable until their exact machine storage families and value schemas are materialized.
gui_related: true
gui_classification_reason: Compatibility blocks, migration interruption, retention settings, legal holds, compaction, diagnostics, and unavailable actions are visible command states.
split_recommended: false
depends_on: [CS-054, CS-056, CS-057, SP-235, SP-237, SP-243]
unblocks: []
acceptance_criteria:
  - Unsupported/newer-store command inventory exposes only check_for_update, choose_compatible_backup, open_diagnostics, and quit; no live viewer, try_anyway, force-open, downgrade-in-place, or mutation is reachable.
  - Migration cancellation is admitted only in preflight; later phases preserve recovery-on-next-launch disclosure and expose no force-cancel, skip-step, rollback-now, or invented ETA.
  - Retry storage and retry-recovery actions rerun owner admission/verification and never claim byte repair, live salvage, or automatic blocked-work replay.
  - Commands expose no generic verify/repair/salvage, Doctor mutation, in-place editor, or bypass token; backup restore and internal maintenance stay coordinator-owned and offline where required.
  - Unknown retention policy remains indefinite/no-count-eviction and materially_incomplete; no command infers destructive eligibility from prefix, key, path, filename, mtime, ordering, or focus.
  - storage.legal_hold.manage and manual compaction preserve owner permission, actor/reason/receipt, holds/anchors/refs, maintenance lease, and storage access gates.
  - Missing, deferred, ambiguous, or unsupported machine registry family/value schema keeps the affected safe-point, restore-point, migration, retention, quarantine, or deletion action unavailable.
validation_surfaces:
  - future Case L startup command inventory, migration interruption, retention/hold/compaction, and registry-availability fixtures
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_command_maintenance_or_retention_bypass
reasoning_tier: high
context_scope: case_l_storage_compatibility_maintenance_retention_commands
implementation_surfaces: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: case_l_storage_compatibility_retention_command_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-005
  - Case-L:L-017
  - Case-L:L-031
  - Case-L:L-032
  - Case-L:PD-L005-01..PD-L005-07
preserved_exact_tokens:
  - blocked_newer_store
  - check_for_update
  - choose_compatible_backup
  - open_diagnostics
  - storage.legal_hold.manage
  - retention_policy_ref
  - materially_incomplete
negative_constraints:
  - Do not turn metadata diagnostics into live unsupported-store inspection or mutation.
  - Do not mint a generic repair/salvage/Doctor mutation command from storage recovery wording.
  - Do not treat command registration, plan validation, or registry-row presence as runtime durability, migration, compaction, or restore proof.
owner_hints: [Plans/Commands_System.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```
