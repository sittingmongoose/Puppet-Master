# Shard 030: Shared Runtime Command Catalog Addendum - 2026-08-13

Source: `Plans/UI_Command_Catalog.md`

Source lines: L11427-L11523

Source SHA256: `e90c2d9e9cd4dd77d91979cf6ed178eb6f9bf117ad4dbda3dbf62a060fe35af9`

---

## Shared Runtime Command Catalog Addendum - 2026-08-13

`Plans/Commands_System.md` CS-066 owns the family semantics, complete request/result fields, recovery, accessibility, and regression contract. This catalog registers only the 26 new canonical rows and their row-level dispatch metadata. All are `domain_action` except the read-only `cmd.resource.inspect`, which is `shell_view`. They use no navigation normalization unless a caller subsequently opens a returned subject through the existing route/open wrappers.

### Candidate compatibility and rejection table

| Candidate token | Catalog disposition |
|---|---|
| `cmd.lsp.server.restart` | alias intent -> `cmd.lsp.restart_server`; no new row |
| `cmd.lsp.server.diagnose` | alias intent -> `cmd.lsp.open_problems`; existing diagnostics/status projections supply detail; no new row |
| `cmd.debug.session.start` / `cmd.debug.session.stop` | alias intents -> `cmd.run_debug.start` / `cmd.run_debug.stop`; no new rows |
| `cmd.debug.session.action` | rejected; caller must choose an exact `cmd.run_debug.*` verb |
| `cmd.worktree.provision` / `cmd.worktree.release` | alias intents -> `cmd.git.worktree.create` / `cmd.git.worktree.release`; no new rows |
| `cmd.context.receipt.open` | alias intent -> `cmd.nav.open_subject` or Usage-specific `cmd.nav.open_usage_subject`; no new row |
| `cmd.remote.reconnect` | retained remote wrapper; resolves an exact environment then dispatches `cmd.environment.reconnect` |

### Canonical registration rows

The existing `cmd.remote.reconnect` row is retained and clarified, not newly registered: `RemoteReconnectWrapperRequest` -> `EnvironmentConnectionCommandResult`; selector `online|degraded|offline|auth_blocked`; disabled reasons `target_missing`, `stale_projection`, `topology_unavailable`, `auth_state_mismatch`, `breaker_open`, `permission_required`, `policy_denied`; sole wrapper handler `handlers::remote::reconnect`; `command_kind=domain_action`; `normalization.kind=wrapper`; `normalizes_to_contract=EnvironmentConnectionCommandRequest`; `alias_of_command_id=null`. The wrapper must resolve an exact `ExecutionEnvironmentId` and dispatch `cmd.environment.reconnect`; it owns no second connection state machine.

The `Payload -> result` types, typed fields, result outcomes, receipt-only pending-Event-Authority effect, and exact disabled-reason meanings are owned by CS-066 and consumed here by reference.

| Command ID | Label | Description | Payload -> result | Preconditions / state selector | Disabled reasons | Sole handler | command_kind | normalization.kind | normalizes_to_contract | alias_of_command_id |
|---|---|---|---|---|---|---|---|---|---|---|
| `cmd.environment.connect` | Connect Environment | Connects the exact execution environment through its sole supervisor generation. | `EnvironmentConnectionCommandRequest` -> `EnvironmentConnectionCommandResult` | `offline`, `closed` | `stale_projection`, `already_in_state`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::environment::connect` | `domain_action` | `none` | `EnvironmentConnectionSupervisor` | null |
| `cmd.environment.reconnect` | Reconnect Environment | Replaces or rejoins transport for the exact environment without conflating domain sync. | `EnvironmentConnectionCommandRequest` -> `EnvironmentConnectionCommandResult` | `online`, `degraded`, `offline`, `auth_blocked` | `stale_projection`, `already_in_state`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied`, `auth_state_mismatch`, `breaker_open` | `handlers::environment::reconnect` | `domain_action` | `none` | `EnvironmentConnectionCommandRequest` | null |
| `cmd.environment.disconnect` | Disconnect Environment | Requests bounded drain and disconnect for the exact environment. | `EnvironmentConnectionCommandRequest` -> `EnvironmentConnectionCommandResult` | state is not `closed` | `stale_projection`, `already_in_state`, `operation_in_progress`, `permission_required` | `handlers::environment::disconnect` | `domain_action` | `none` | `EnvironmentConnectionSupervisor` | null |
| `cmd.thread.outbox.retry` | Retry Queued Thread Command | Retries the same unacknowledged logical command under its existing idempotency identity. | `ThreadOutboxRetryRequest` -> `ThreadOutboxCommandResult` | retryable unacknowledged entry | `outbox_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required` | `handlers::thread_outbox::retry` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.outbox.cancel` | Cancel Queued Thread Command | Records cancellation for a cancellable uncommitted outbox entry. | `ThreadOutboxCancelRequest` -> `ThreadOutboxCommandResult` | cancellable uncommitted entry | `outbox_state_mismatch`, `stale_projection`, `already_in_state`, `permission_required` | `handlers::thread_outbox::cancel` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.request` | Request Thread | Durably requests a thread and reconciles its stable identity after acknowledgement. | `ThreadRequestCommandRequest` -> `ThreadRequestCommandResult` | target current and request admissible | `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::thread::request` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.spawn` | Spawn Child Thread | Durably requests a bounded child thread under exact parent and role lineage. | `ThreadSpawnCommandRequest` -> `ThreadSpawnCommandResult` | parent current and spawn allowed | `stale_projection`, `policy_denied`, `resource_blocked`, `lease_conflict`, `permission_required` | `handlers::thread::spawn` | `domain_action` | `none` | `ThreadCommandOutbox` | null |
| `cmd.thread.await` | Await Thread Condition | Starts an observable asynchronous await without blocking the UI thread. | `ThreadAwaitCommandRequest` -> `ThreadAwaitCommandResult` | current nonterminal target | `stale_projection`, `already_in_state`, `deadline_expired`, `target_missing`, `policy_denied` | `handlers::thread::await_condition` | `domain_action` | `none` | `ObservableWork` | null |
| `cmd.capability.ensure` | Ensure Capability | Resolves or provisions one exact-target capability under Off, Auto, or On policy. | `CapabilityEnsureRequest` -> `CapabilityEnsureResult` | exact target and current policy | `capability_unavailable`, `setup_required`, `approval_required`, `policy_denied`, `resource_blocked`, `permission_required` | `handlers::capability::ensure` | `domain_action` | `none` | `CapabilityProvisioner` | null |
| `cmd.tool.discover` | Discover Tools | Advances bounded progressive capability discovery for the current need. | `ToolDiscoverRequest` -> `ToolDiscoverResult` | registry query allowed | `stale_projection`, `topology_unavailable`, `policy_denied`, `resource_blocked` | `handlers::tool::discover` | `domain_action` | `none` | `ProgressiveCapabilityRegistry` | null |
| `cmd.tool.select` | Select Tools | Commits a stable ordered current-generation tool selection without invoking it. | `ToolSelectRequest` -> `ToolSelectResult` | selected refs current and admissible | `stale_projection`, `capability_unavailable`, `policy_denied`, `permission_required` | `handlers::tool::select` | `domain_action` | `none` | `ProgressiveCapabilityRegistry` | null |
| `cmd.installation.install` | Install Capability | Starts explicit proof-based installation for the exact host and environment. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | no ready installation and acquisition allowed | `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied` | `handlers::installation::install` | `domain_action` | `none` | `InstallationLifecycleManager` | null |
| `cmd.installation.update` | Update Installation | Replaces a consented installation while retaining the last verified activation until commit. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | verified consented installation | `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied`, `target_missing`, `resource_blocked` | `handlers::installation::update` | `domain_action` | `none` | `InstallationLifecycleCommandRequest` | null |
| `cmd.installation.repair` | Repair Installation | Executes a bounded evidence-backed repair plan for a known installation. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | known installation with repair evidence | `already_in_state`, `operation_in_progress`, `setup_required`, `approval_required`, `official_source_unverified`, `host_environment_mismatch`, `permission_required`, `policy_denied`, `target_missing`, `resource_blocked` | `handlers::installation::repair` | `domain_action` | `none` | `InstallationLifecycleCommandRequest` | null |
| `cmd.installation.rollback` | Roll Back Installation | Activates a verified rollback target without discarding the current verified copy early. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | verified rollback target | `target_missing`, `official_source_unverified`, `host_environment_mismatch`, `operation_in_progress`, `permission_required`, `policy_denied` | `handlers::installation::rollback` | `domain_action` | `none` | `InstallationLifecycleManager` | null |
| `cmd.installation.verify` | Verify Installation | Produces layered proof for installation health and readiness. | `InstallationLifecycleCommandRequest` -> `InstallationLifecycleCommandResult` | installation resolvable | `target_missing`, `host_environment_mismatch`, `operation_in_progress`, `policy_denied` | `handlers::installation::verify` | `domain_action` | `none` | `InstallationResolver` | null |
| `cmd.authentication.start` | Start Authentication | Starts the selected non-secret auth path after separate installation verification. | `AuthenticationCommandRequest` -> `AuthenticationCommandResult` | auth path supported | `setup_required`, `auth_state_mismatch`, `operation_in_progress`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::start` | `domain_action` | `none` | `AuthenticationBroker` | null |
| `cmd.authentication.cancel` | Cancel Authentication | Cancels the current auth operation without silently deleting provider credentials. | `AuthenticationCommandRequest` -> `AuthenticationCommandResult` | current cancellable auth operation | `auth_state_mismatch`, `already_in_state`, `stale_projection`, `permission_required` | `handlers::authentication::cancel` | `domain_action` | `none` | `AuthenticationBroker` | null |
| `cmd.authentication.resume` | Resume Authentication | Resumes the same operation and exact account, route, host, and environment binding. | `AuthenticationCommandRequest` -> `AuthenticationCommandResult` | same nonterminal authority binding | `auth_state_mismatch`, `stale_projection`, `deadline_expired`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::authentication::resume` | `domain_action` | `none` | `AuthenticationBroker` | null |
| `cmd.eval.session.start` | Start Eval Session | Starts a supported sandboxed persistent EvalSession under a resource lease. | `EvalSessionCommandRequest` -> `EvalSessionCommandResult` | supported adapter and no conflicting lease | `unsupported`, `capability_unavailable`, `resource_blocked`, `lease_conflict`, `topology_unavailable`, `permission_required`, `policy_denied` | `handlers::eval_session::start` | `domain_action` | `none` | `EvalSessionBroker` | null |
| `cmd.eval.session.execute` | Execute In Eval Session | Executes artifact-backed code in the current session with bounded output. | `EvalSessionCommandRequest` -> `EvalSessionCommandResult` | live current session | `session_state_mismatch`, `stale_projection`, `deadline_expired`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::eval_session::execute` | `domain_action` | `none` | `EvalSessionBroker` | null |
| `cmd.eval.session.stop` | Stop Eval Session | Stops and cleans the current session with an explicit variable and artifact disposition. | `EvalSessionCommandRequest` -> `EvalSessionCommandResult` | live or recoverable session | `session_state_mismatch`, `stale_projection`, `operation_in_progress`, `permission_required` | `handlers::eval_session::stop` | `domain_action` | `none` | `EvalSessionBroker` | null |
| `cmd.mcp.server.connect` | Connect MCP Server | Connects one enabled valid MCP server under its component-state lifecycle. | `McpServerLifecycleCommandRequest` -> `McpServerLifecycleCommandResult` | enabled valid server | `stale_projection`, `already_in_state`, `operation_in_progress`, `capability_unavailable`, `resource_blocked`, `permission_required`, `policy_denied` | `handlers::mcp::connect_server` | `domain_action` | `none` | `McpLifecycleManager` | null |
| `cmd.mcp.server.reconnect` | Reconnect MCP Server | Joins or requests the one breaker-governed reconnect for the server generation. | `McpServerLifecycleCommandRequest` -> `McpServerLifecycleCommandResult` | configured server and breaker admits/join | `stale_projection`, `already_in_state`, `operation_in_progress`, `capability_unavailable`, `resource_blocked`, `permission_required`, `policy_denied`, `breaker_open`, `auth_state_mismatch` | `handlers::mcp::reconnect_server` | `domain_action` | `none` | `McpServerLifecycleCommandRequest` | null |
| `cmd.resource.inspect` | Inspect Runtime Resource | Opens the read-only current governor, admission, lease, and awareness evidence for an exact resource scope. | `RuntimeResourceInspectRequest` -> `RuntimeResourceInspectResult` | readable exact host/environment | `stale_projection`, `topology_unavailable`, `target_missing`, `permission_required` | `handlers::runtime_resource::inspect` | `shell_view` | `none` | `RuntimeResourceGovernor` | null |
| `cmd.bsd.set` | Set Back Seat Driver Mode | Sets Off, Auto, or On for the selected canonical scope; effective default and recommended value are Auto. | `BackSeatDriverModeSetRequest` -> `BackSeatDriverModeSetResult` | scope writable and projection current | `stale_projection`, `already_in_state`, `policy_denied`, `permission_required` | `handlers::back_seat_driver::set_mode` | `domain_action` | `none` | `BackSeatDriverService` | null |

All 26 rows use the CS-066 shared command envelope, typed response, CAS/idempotency/restart recovery, assistive-technology announcement, and keyboard/pointer parity requirements. Their effects are receipt/projection only while Event Authority remains `UNKNOWN_OPEN`; wiring must record `missing_event_registration` rather than fabricate an expected event. `cmd.capability.ensure` cannot authorize first provider-CLI acquisition, `cmd.tool.select` cannot invoke or widen tools, `cmd.resource.inspect` cannot mutate admission, and `cmd.bsd.set` cannot grant tools, mutation, protected Browser access, or authority.

ContractRef: ContractName:Plans/Commands_System.md#CS-066, ContractName:Plans/Shared_Integration_Runtime.md, SchemaID:pm.shared_runtime.contracts.v1

### UCC-145 - Shared Runtime Command Catalog Registration

```yaml
plan_unit_id: UCC-145
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The catalog registers exactly 26 new canonical generalized shared-runtime
  command rows from CS-066, records seven candidate compatibility intents over
  existing IDs, rejects cmd.debug.session.action, and retains cmd.remote.reconnect
  as a remote wrapper that resolves and dispatches cmd.environment.reconnect.
gui_related: true
gui_classification_reason: Catalog metadata governs visible labels, enabled and disabled state, handler dispatch, progress, recovery, and accessible activation.
split_recommended: false
depends_on: [CS-066, SIR-004, SIR-005, SIR-008, SIR-010]
unblocks: []
acceptance_criteria:
  - Exactly 26 new canonical IDs have typed payload/result references, state selectors, disabled reasons, sole handlers, command_kind, and normalization metadata.
  - Candidate aliases do not receive primary catalog rows and the generic debug action is rejected.
  - cmd.remote.reconnect remains a wrapper and generalized reconnect is cmd.environment.reconnect.
  - Effects are receipt/projection only and explicitly carry missing_event_registration until individual Event Authority admission.
  - Keyboard and pointer activation, accessible disabled/busy/outcome announcements, idempotent replay, restart, CAS, and race fixtures consume CS-066.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - command catalog 26-row census and exact-handler uniqueness fixture
  - alias, accessibility, replay, restart, race, and missing-event-registration fixtures
risk_class: catalog_command_or_event_authority_drift
reasoning_tier: high
context_scope: shared_runtime_command_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
node_compile_hint: {mode: shared_runtime_command_catalog, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/CANDIDATE_COMMAND_ID_REGISTER.json
  - Plans/Shared_Integration_Runtime.md#15.1
preserved_exact_tokens: [cmd.environment.reconnect, cmd.remote.reconnect, cmd.run_debug.*, cmd.lsp.restart_server, cmd.git.worktree.create, cmd.nav.open_subject, missing_event_registration]
negative_constraints:
  - Do not register candidate aliases as primary rows or mint Chat, Settings, Onboarding, Doctor, provider, or panel-local clones.
  - Do not name or emit a new EventRecord family while Event Authority remains UNKNOWN_OPEN.
  - Do not treat accepted dispatch or UI acknowledgement as terminal domain success.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
```
