# Shared Integration Runtime (Canonical Owner)

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes the cross-surface envelopes in `Plans/Contracts_V0.md`, and preserves deterministic defaults under `Plans/Decision_Policy.md`. Puppet Master is the only product name.

## 1. Authority and scope

This document is the sole canonical owner for the shared lifecycle and coordination primitives that were previously unowned across provider setup, durable client/server operation, developer services, resource governance, operational awareness, and agent advisory behavior. It owns the shared mechanisms for the following approved accountability rows:

`PROV-004`, `PROV-005`, `PROV-007`, `PROV-009`, `PROV-010`, `PROV-012`, `PROV-023`, `PROV-024`, `CTX-020`, `AGT-014`, `AGT-016`, `AGT-020`, `PRM-010`, `PRM-011`, `PRM-012`, `PRM-016`, `PRM-017`, `PRM-018`, `PRM-019`, `PRM-020`, and `PRM-022`.

`Plans/runtime_integration_disposition.json` records the complete 163-row routing decision. That register is traceability evidence; this document is canonical product prose for the 21 adopted rows.

ContractRef: ContractName:Plans/runtime_integration_disposition.json, ContractName:Plans/Contracts_V0.md, Primitive:DRYRules

This owner defines shared state machines, identities, fencing, leases, receipts, and failure semantics. It does not take over the domain semantics or visible surfaces of the owners listed below.

### 1.1 Non-ownership boundaries

| Domain | Canonical owner retained | Shared Integration Runtime role |
|---|---|---|
| Project content, Vault content, sync, move, and source-control semantics | `Plans/Project_Sync_and_Backbone.md` and `Plans/WorktreeGitImprovement.md` | Bind execution to canonical topology identities; never become a second content, sync, move, or Git authority. |
| Provider/model/account/auth policy | `Plans/Models_System.md`, `Plans/Multi-Account.md`, provider-specific plans | Execute approved installation, connection, and admission lifecycles; never select an account or weaken provider policy. |
| Provider CLI acquisition policy | `Plans/CLI_Bridged_Providers.md`, `Plans/Release_Supply_Chain.md` | Enforce explicit consent and exact-target proofs; never silently acquire a provider CLI. |
| Prompt construction and compaction policy | `Plans/Prompt_Pipeline.md` | Supply fenced operation, permit, artifact, and conditional-rule mechanics. |
| Chat, Goal, mode, and orchestration policy | `Plans/assistant-chat-design.md`, `Plans/Goal_Runtime_System.md`, `Plans/Run_Modes.md`, `Plans/orchestrator-subagent-integration.md` | Maintain durable execution and advisory lifecycles; visible controls remain consumers. |
| LSP, DAP, Eval tool policy, MCP, and Browser behavior | `Plans/LSPSupport.md`, `Plans/Automated_Testing_System.md`, `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md` | Own shared session records, leases, fencing, recovery, and host/environment binding only. |
| Commands and visible wiring | `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.production.json` | Implement canonical handlers and state effects behind registered commands. |
| Envelope vocabulary and persistence | `Plans/Contracts_V0.md`, `Plans/storage-plan.md` | Produce typed values and receipts; never create a peer event log, database, or migration actor. |
| Permissions, filesystem safety, secrets, and release provenance | `Plans/Permissions_System.md`, `Plans/FileSafe.md`, `Plans/Release_Supply_Chain.md` | Consume independent decisions and receipts; never self-authorize. |
| Usage accounting and GUI projection | `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, owning feature plans | Emit attributable facts and read models; never invent cost or visual policy. |

ContractRef: ContractName:Plans/DRY_Rules.md#2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

## 2. Platform invariants

1. Puppet Master is Server-first. Every Project has one Project Home Server and one physical Project Vault. The Home Server is the default Execution Host; additional Execution Hosts are explicit. Every operation binds an exact Execution Host, Execution Environment, and Source Location before admission.
2. Native Windows, macOS, and Linux hosts, standalone Servers, and supported container Servers are execution-capable. WSL is optional and environment-specific. Kubernetes execution is namespace-scoped unless a separately approved owner policy grants narrower capabilities; silent host or namespace fallback is prohibited.
3. `RuntimeResourceGovernor` is the single shared resource-policy and admission mechanism. Enforcement is host-local even when policy originates on the Home Server.
4. `ObservableWork` is the single shared truth for phase, wait reason, progress, cancellation, and terminal outcome. A spinner, command dispatch receipt, or connection state is not work truth.
5. The storage stack is seglog for canonical events/history, redb for canonical KV and projections, and Tantivy for derived search. Puppet Master does not use SQLite.
6. PM-native Browser Program and protected `AuthBrowserSession` remain the Browser architecture. This runtime exposes no Playwright runtime, facade, compatibility namespace, package, port, MCP server, command family, or capture engine.
7. Initial provider-CLI acquisition is never core, default-baseline, preseeded, or silent. It requires an explicit user setup action, the provider's official source, and the exact Host/Environment. Verified post-consent update, repair, and rollback may be lifecycle-managed.
8. Secrets remain in the operating-system credential store. Runtime records contain only non-secret references, redacted metadata, hashes, and proof identities.
9. Every mutation independently satisfies Permissions and FileSafe. A provider permit, lease, readiness result, or user-visible approval cannot substitute for either authority.
10. Generation, epoch, CAS revision, holder, and exact topology identity fence every durable or remotely resumed operation.

ContractRef: Invariant:ServerFirstTopology, Invariant:HostLocalRuntimeResourceGovernor, Invariant:ObservableWorkTruth, Invariant:NoSQLite, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

## 3. Canonical shared identities

The shared runtime uses the following identities without replacing domain-owned records:

| Identity | Purpose |
|---|---|
| `ProjectHomeServerId` | The Project's sole control-plane Server identity. |
| `ProjectVaultId` | The sole physical Vault identity; never a path alias. |
| `ExecutionHostId` | Native, standalone-server, remote, WSL host-side, container-server, or Kubernetes execution authority. |
| `ExecutionEnvironmentId` | Exact native, WSL distribution, container, Kubernetes namespace/pod class, SSH environment, or sandbox identity. |
| `SourceLocationId` | Domain-owned source identity, including worktree/repository binding by reference. |
| `TopologyGeneration` | Monotonic generation changed by authoritative topology replacement. |
| `OperationId` | Stable logical operation identity across retry, restart, and projection. |
| `AttemptId` | One bounded attempt beneath an operation. |
| `LeaseId` | Exclusive or shared reservation identity with holder, epoch, expiry, and reconciliation state. |
| `ObservableWorkId` | Stable work projection identity. |

Every executable request carries `project_id`, `project_home_server_id`, `execution_host_id`, `execution_environment_id`, `source_location_id` where applicable, `topology_generation`, and a capability snapshot reference. Equal path strings or executable names on different Host/Environment identities are not interchangeable.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Containers_Registry_and_Unraid.md

### 3.1 Topology projection

`RuntimeTopologyProjection` is a compact, read-only execution projection. Its states are `unavailable`, `cached`, `synchronizing`, `current`, `stale`, and `conflicted`. It carries provenance and freshness for the Home Server, Vault, Hosts, Environments, and Sources. It cannot create, move, merge, or synchronize Project content.

When authoritative topology is unavailable or conflicted, operations that require it are blocked with a typed reason. The runtime does not guess the local host, mount, WSL distribution, container, namespace, or source path.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#3, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Containers_Registry_and_Unraid.md

## 4. Installation and capability lifecycle

### 4.1 Resource model

The shared runtime distinguishes `ToolProduct`, `ToolPackage`, `Installation`, `Launcher`, `Executable`, `Profile`, `Connection`, `CapabilitySnapshot`, `ProvisioningOperation`, `UpdateTransaction`, `ExecutionHost`, and `ExecutionEnvironment`. GUI consumers may collapse these identities, but receipts and policy decisions do not.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Release_Supply_Chain.md

### 4.2 Installation Resolver

`InstallationResolver` accepts an exact capability need and topology target. It discovers candidates through BinaryLocator and domain adapters, normalizes duplicates and shadows by canonical executable identity, verifies compatibility and provenance, and returns one of `ready`, `setup_required`, `approval_required`, `blocked`, `conflicted`, or `unavailable`.

Discovery success, process exit zero, a PATH hit, version text, authentication state, and usage telemetry are separate evidence layers. None alone proves installation readiness.

ContractRef: ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Release_Supply_Chain.md, SchemaID:pm.shared_runtime.contracts.v1

### 4.3 Provider CLI exception

For a provider CLI with no consented installation record, resolution stops at `setup_required`. Only an explicit user action may begin acquisition. The acquisition plan pins the official source, artifact/package identity, version or channel, hashes/signatures where offered, license/cost/elevation disclosure, and exact Host/Environment. Authentication begins only after installation verification and remains a separate state machine.

After a consented installation exists, policy-approved checks, updates, repair, and rollback may run under the recorded lifecycle policy. A failed automatic maintenance attempt is bounded by retry budget, backoff, circuit state, and user-visible remediation; it cannot loop silently.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Release_Supply_Chain.md

### 4.4 Non-provider Auto/On/Off provisioning

Non-provider capabilities resolve effective `Off`, `Auto`, or `On` from Global and Project policy. `Off` forbids provisioning. `Auto` may provision only after trusted-source, compatibility, license/cost, elevation, Permissions, and current-operation checks pass. `On` requires availability but does not waive those checks. Successful provisioning resumes the originating operation only while its operation ID, generation, and intent remain current.

The effective default and recommended value for non-provider provisioning is `Auto`; the provider-CLI first-acquisition exception below remains mandatory.

This policy never applies to first provider-CLI acquisition.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Release_Supply_Chain.md

### 4.5 Transactional update and rollback

`InstallationLifecycleManager` uses `discovered -> planned -> awaiting_consent_or_policy -> acquiring -> verifying -> activating -> ready` with terminal or recoverable branches `cancelled`, `blocked`, `failed`, `rollback_pending`, `rolled_back`, and `recovery_required`. It records before/after installation identities and retains the last verified activation until replacement commits. Update failure never destroys the only verified installation.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/storage-plan.md

### 4.6 Closed inventory and provisioning vocabularies

`InstallationInventoryRecord` is the bounded evidence inventory returned by BinaryLocator-backed discovery. Candidate disposition is exactly `eligible`, `shadowed`, `duplicate`, `incompatible`, `untrusted`, `unverifiable`, or `rejected_by_policy`; selection state is `unselected`, `selected`, or `conflicted`; health is `unknown`, `ready`, `degraded`, `unavailable`, or `invalid`. Every candidate carries exact Host/Environment, executable identity, provenance, validation, ownership-confidence, and failure refs. Inventory is evidence, not permission or acquisition authority.

`CapabilityProvisioningOperation` uses phases `requested`, `resolving`, `awaiting_policy`, `awaiting_permission`, `awaiting_resource`, `provisioning`, `verifying`, `ready`, `blocked`, `failed`, `cancelled`, `rolling_back`, `rolled_back`, and `recovery_required`. Reconciliation disposition is exactly `resume`, `retry_bounded`, `rollback`, `quarantine`, `manual_recovery_required`, or `terminal_no_change`. A provider CLI without prior consent must terminate resolution as `blocked` with the explicit-acquisition reason; it cannot enter `provisioning`.

ContractRef: ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Tools.md, SchemaID:pm.shared_runtime.contracts.v1

## 5. Durable environment connection and domain synchronization

Exactly one `EnvironmentConnectionSupervisor` exists per `ExecutionEnvironmentId` and supervisor generation. It owns transport creation and replacement, retry/backoff, authentication-block projection, probes, and `offline`, `connecting`, `auth_blocked`, `online`, `degraded`, `reconnecting`, `closing`, and `closed` state.

It does not own domain records, provider authentication policy, or global process/resource pools. Transport health and domain synchronization are independent axes. Threads, Usage, provider catalog, terminal, testing/debug, and other domains each expose `cached`, `synchronizing`, `current`, `stale`, or `failed` projection state even while transport is online.

Connection replacement increments an epoch. Old-epoch responses, subscriptions, retries, and commands are discarded or reconciled by stable identity; they cannot mutate current projection state.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, Invariant:ServerFirstTopology, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Multi-Account.md

## 6. Durable command outbox

`ThreadCommandOutbox` persists commands that must survive offline state, client loss, or restart: messages, question answers, redirects, approvals, Goal controls, thread creation/request, attachments, and exact route/model/mode context.

Each logical command has a stable command instance ID, idempotency key, thread/order key, target generation, payload hash, attachment refs, enqueue time, expiry/cancellation state, and acknowledgement/result refs. Transport may retry an unacknowledged attempt, but one logical command produces at most one server-side effect. Commands preserve in-thread order while independent threads may progress concurrently.

Created thread and child identities are reconciled through stable request IDs. Stale continuation, superseded route, expired approval, cancelled intent, or mismatched topology generation is rejected visibly rather than replayed.

The durable outbox lifecycle is `queued`, `dispatching`, `acknowledged`, `cancel_requested`, `cancelled`, `expired`, `rejected`, or `terminal_unknown`. `acknowledged`, `cancelled`, `expired`, and `rejected` are terminal. `terminal_unknown` requires disclosure and reconciliation and is never silently retried. Retry of `dispatching` is allowed only for the same command instance, payload digest, idempotency key, order key, and target generation; acknowledgement or terminal state permanently forbids redispatch.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

## 7. Cursor replay, snapshot, live buffering, and coalescing

### 7.1 Reconnect protocol

`ProjectionReplayCoordinator` establishes a live subscription and buffers new-epoch events before requesting replay or snapshot. It then chooses replay versus snapshot using estimated bytes, decode and projection cost, link quality, device memory, payload shape, cursor validity, and retention coverage. It applies the replay or snapshot, drains buffered live events in sequence, and publishes current state only after the cursor and generation fence converge.

There is no fixed event-count threshold. Missing coverage, epoch conflict, snapshot validation failure, or buffer overflow forces a typed resnapshot or degraded state.

The durable replay checkpoint lifecycle is `initializing`, `buffering_live`, `replaying`, `applying_snapshot`, `draining_buffer`, `current`, `resnapshot_required`, `degraded`, or `failed`. A checkpoint records connection epoch, domain generation, requested/base/applied/published cursors, buffered cursor range, overflow state, snapshot digest/ref, and currentness evidence. `current` requires a valid contiguous applied range, an empty or fully drained live buffer, matching epoch/generation, and a published cursor equal to the applied high-water mark.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### 7.2 Streaming coalescing

`StreamCoalescer` may batch token and progress presentation updates using adaptive latency and pressure budgets. Durable events remain granular where their owners require it. Terminal output order is preserved. Approval, tool transition, failure, cancellation, completion, security, and lease-loss changes bypass ordinary coalescing and are projected immediately.

Coalescing records source count, output count, oldest/newest cursor, delay, dropped superseded presentation frames, and pressure reason. It never drops canonical events.

A terminal frame may publish only after every lower source cursor is emitted or explicitly represented by a supersession count and the coalescer flush barrier is durably acknowledged. Canonical-drop count must remain zero. Security, approval, tool-state, lease-loss, failure, cancellation, and completion frames are never superseded.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, Invariant:ObservableWorkTruth, ContractName:Plans/assistant-chat-design.md

## 8. RuntimeResourceGovernor and ObservableWork

### 8.1 RuntimeResourceGovernor

`RuntimeResourceGovernor` is the sole shared policy/admission service for CPU, memory, process, watcher, descriptor, queue, log, artifact, network, port, test-host, debug, Eval, MCP, and worktree pressure. The Home Server may distribute policy, but the exact Execution Host enforces it and reports effective limits, admission, reduction, preemption, and refusal.

Admission returns `admitted`, `admitted_reduced`, `queued`, `blocked`, or `rejected` with effective limits, reason, policy generation, host observation, lease refs, and reevaluation trigger. A consumer cannot convert `blocked` into local best effort.

This owner also defines the shared physical-parent budget tree, reserved control/synthesis/verification capacity, host-pressure backoff, bounded queue admission, idle-resource reaping, low-memory reduction, and Explain/Resume admission evidence. Storage persists governor inputs, decisions, and observations only; Containers, Orchestrator, Testing, Debug, Browser, MCP, and Worktree owners may request domain ceilings but cannot create peer governors or compute an effective host admission independently.

ContractRef: Invariant:HostLocalRuntimeResourceGovernor, SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Run_Modes.md

### 8.2 ObservableWork

`ObservableWork` records `queued`, `preflighting`, `awaiting_permission`, `awaiting_user`, `awaiting_resource`, `running`, `retry_backoff`, `reconciling`, `cancelling`, `succeeded`, `failed`, `cancelled`, and `recovery_required`. Every nonterminal wait carries a typed wait reason and next reevaluation condition. Progress includes completed/total units only when the producer can defend the denominator; otherwise it uses phase plus bounded activity evidence.

Server-owned providers, Goals, agents, tests, and approved operations continue when a client disconnects. Client projections reattach by identity and cursor; they do not become execution owners.

ContractRef: Invariant:ObservableWorkTruth, SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/usage-feature.md

## 9. Leases and operational awareness

### 9.1 LeaseCoordinator

`LeaseCoordinator` provides typed leases for resources, ports, worktrees, test hosts, DebugSessions, EvalSessions, MCP mutation controllers, and Browser page controllers. A lease records scope, resource identity, holder identity, mode, generation, epoch, acquired/renewed/expires timestamps, policy ref, cleanup strategy, and terminal disposition.

Acquire and renew are CAS operations. Expiry does not by itself prove cleanup; reconciliation observes the underlying resource before reassignment. A stale holder or generation cannot renew, release, or mutate through a replacement lease. Debug authorization grants remain Permissions-owned and are referenced by a DebugSession lease rather than reinterpreted as the lease itself.

Lease mode is exactly `exclusive` or `shared`. Lifecycle state is `requested`, `active`, `renewing`, `release_requested`, `released`, `expired_pending_reconciliation`, `reconciling`, `reconciled`, `revoked`, or `quarantined`. Cleanup strategy is `owner_release`, `process_exit_observation`, `resource_probe`, `worktree_reconcile`, or `manual_recovery`. Terminal disposition is `released_clean`, `reconciled_clean`, `revoked_clean`, `quarantined`, or `manual_recovery_required`. Expiry always enters `expired_pending_reconciliation`; it never proves cleanup or permits reassignment.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Permissions_System.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Automated_Testing_System.md

### 9.2 OperationalAwarenessService

`OperationalAwarenessService` derives a bounded, freshness-labeled projection from canonical owner records. It correlates active operations, agents, files, worktrees, leases, ports, tests, debug/eval sessions, provider processes, environments, resource pressure, and failure/remediation state.

It owns no domain truth and cannot authorize action. Its projection states are `current`, `partial`, `stale`, `unavailable`, and `conflicted`, each with source cursors and observed time. Doctor, Orchestrator, Chat, Source Control, Runtime Artifacts, and Usage consume this projection.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

## 10. DebugSession and EvalSession shared lifecycle

### 10.1 DebugSession

`DebugSessionRecord` binds classical DAP launch or attach to exact Host/Environment/Source identity, adapter capability snapshot, owner, lease, generation, permission grant, policy, logs, artifacts, and cleanup. Protocol semantics and the concrete `cmd.run_debug.*` command family remain with Testing/Debug owners.

Waiters for stop, termination, output, or immediate adapter events are installed before the operation that can emit them. Late prior-generation events are rejected. Restart or client loss preserves enough state to reconcile or truthfully terminate; it never fabricates a live adapter.

The durable record reuses `dev_session_record.v1`; `dap_session_id` is subordinate and never a peer storage identity. Lifecycle state is `created`, `awaiting_lease`, `launching`, `attaching`, `running`, `paused`, `terminating`, `terminated`, `failed`, `reconciling`, or `recovery_required`. Waiter-arm evidence and trigger time are required before a transition caused by an immediate adapter event. Paused stack frames, variables, and console scrollback are ephemeral and are not persisted in this record.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Commands_System.md

### 10.2 EvalSession

`EvalSessionRecord` represents a product-approved, persistent, sandboxed language kernel. Initial languages are Python, JavaScript, Ruby, and Julia only where the Tools and security owners mark an adapter supported. Sessions retain variables within their explicit scope, stream bounded output, spill redacted full output to artifact storage, and distinguish local compute from external wait.

Nested Puppet Master tool or agent calls require explicit policy and independent provider dispatch admission. Resource, filesystem, permission, credential, and network boundaries remain in force. Hidden global kernels are prohibited. Restart and cleanup are explicit lifecycle transitions with artifact and variable-persistence disposition.

Eval lifecycle state is `created`, `awaiting_lease`, `starting`, `ready`, `executing`, `interrupting`, `restarting`, `stopping`, `stopped`, `failed`, `reconciling`, or `recovery_required`. Variable scope is `session`, `thread`, or `goal`; `global` is forbidden. Variable disposition is `preserved`, `cleared`, `exported_redacted_artifact`, `quarantined`, or `manual_recovery_required`. Output is cursor-bounded and any retained full output is an artifact ref, never an inline unbounded value.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

## 11. Provider dispatch admission

`ProviderDispatchAdmissionService` evaluates the immutable final provider request bytes and their refs immediately before adapter dispatch. It returns a single-use, short-lived `ProviderRequestPermit` whose durable evidence form is `ProviderDispatchAdmissionReceipt`, bound to request hash, prompt/context epoch, route, model, requested/effective account refs, project/thread/Goal/agent lineage, Host/Environment where relevant, permission snapshot ref, FileSafe receipt refs for mutation-capable work, policy generations, and expiry.

Prompt compilation, permission, FileSafe approval, authentication, provider readiness, budget policy, and dispatch admission remain separate decisions. Adapters cannot self-issue admission. Any change to final bytes, route, account, permission generation, topology generation, or mutation evidence invalidates the receipt. Consumption is atomic and idempotent; rejection occurs before network transmission.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Multi-Account.md

## 12. Time-Traveling conditional rules

`ConditionalRuleEngine` indexes versioned rules by Project, source path, tool, mode, Goal phase, workflow state, and typed regex/AST predicates. Evaluation uses immutable facts and records rule version, matched facts, emitted instruction or action ID, ContextEpoch impact, retry/steer count, and outcome.

A match may inject one bounded reminder, request a capped steer/retry, produce a receipt, update context-cache impact, or route repeated failure to process repair. It cannot replace deterministic safety, alter canonical state directly, grant permissions, widen authority, or create hidden tool access. Repeated identical matches are suppressed by rule/version/fact digest.

This feature is unrelated to thread rewind, restore points, runtime safe points, or historical pricing snapshots.

Rule state is `enabled`, `disabled`, `superseded`, or `retired`. Evaluation outcome is `not_matched`, `matched_noop`, `instruction_emitted`, `steer_requested`, `retry_requested`, `suppressed_duplicate`, `suppressed_cap`, `blocked_by_policy`, or `failed_closed`. The intervention receipt records the rule/version/fact digest, evaluated scope and immutable-fact refs, requested and effective action, ContextEpoch before/after, retry/steer count, suppression identity, outcome, and authority ceiling. Identical rule/version/fact digests are idempotently suppressed.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md

## 13. Back Seat Driver

### 13.1 Modes and deterministic default

Back Seat Driver modes are `Off`, `Auto`, and `On`. The effective default and recommended value are `Auto`. A missing or invalid requested value resolves to `Auto` with an explicit resolution reason; existing stored `Off` remains an explicit user choice and is never migrated to `Auto`.

`Auto` evaluates only on owner-defined risk or phase triggers. `On` may evaluate every turn within quota. All modes remain read-only; frequency never grants tools, mutation, protected browser access, or authority.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#13, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md

### 13.2 Isolation and behavior

Each BSD assignment has an independent assignment ID, cursor, stable prefix, requested/effective route, Usage lineage, fallback, quota, and health state. Input is a bounded delta plus typed refs, not an unbounded transcript. Advice may be emitted or suppressed; duplicate semantic advice is suppressed by digest.

BSD cannot block primary work. Timeout, quota exhaustion, provider failure, malformed output, or loss of route records a terminal advisory outcome and primary work continues. BSD has no access to `AuthBrowserSession`, secrets, unredacted artifacts, mutation tools, approval controls, or hidden memory.

Every attempt, including silent or suppressed advice, records trigger, route, provider/model/account refs, cost and token facts where available, latency, outcome, emitted/suppressed reason, timeout/failure, and override scope. Unknown cost remains unknown rather than zero.

BSD health is `ready`, `degraded`, `unavailable`, `quota_exhausted`, or `disabled`; advisory outcome is `no_call_off`, `silent_no_material_delta`, `advice_emitted`, `duplicate_suppressed`, `policy_suppressed`, `quota_suppressed`, `timeout`, `provider_failed`, `malformed_output`, or `route_unavailable`. `Off` requires `no_call_off` and forbids a provider attempt. No health or outcome may block, mutate, approve, grant a tool, or expose protected-session content.

ContractRef: SchemaID:pm.shared_runtime.contracts.v1, ContractName:Plans/usage-feature.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

## 14. Persistence, recovery, and migration

### 14.1 Storage mapping

Canonical lifecycle transitions and audit history use EventRecord/seglog only after their producer families are individually admitted by Event Authority. Current state, idempotency, leases, outbox, cursors, topology projection, and session records use redb value families. Search over retained canonical source uses Tantivy and is rebuildable. JSON/JSONL is diagnostics or export only. SQLite is not a Puppet Master storage option.

ContractRef: ContractName:Plans/storage-plan.md, SchemaID:pm.event.v0, Invariant:NoSQLite

### 14.2 Recovery

Startup reconciles nonterminal operations against receipts, underlying processes/resources, lease generations, topology generation, and owner truth. Recovery outcomes are `resumed`, `replayed`, `rolled_back`, `cleaned`, `quarantined`, `manual_recovery_required`, or `terminal_unknown_with_disclosure`. Absence of evidence never becomes success.

Provider process, Goal, agent, test, outbox, DebugSession, EvalSession, MCP, worktree, and installation reconciliation is bounded and independently observable.

ContractRef: ContractName:Plans/storage-plan.md, Invariant:ObservableWorkTruth, SchemaID:pm.shared_runtime.contracts.v1

### 14.3 Migration actor

`StorageMigrationCoordinator` remains the only storage migration actor. A shared-runtime migration performs exact preflight, acquires the maintenance lease, records source versions and hashes, creates and verifies a backup before mutation, writes a same-root journal, applies one forward transaction, validates read-back, stamps the new store version last, and emits a migration receipt. Restart uses the journal and byte/evidence digests to choose completion, rollback, quarantine, or manual recovery.

Legacy JSON/JSONL is import-only lineage. Permission TOML remains its owner's deliberate configuration authority with a redb projection. Provider-owned opaque SQLite files are neither adopted nor queried as Puppet Master authority.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, Invariant:NoSQLite

## 15. Commands, wiring, DRY, GUI, and Usage

### 15.1 Command reconciliation

The runtime implements canonical command handlers but does not own IDs. The following packet candidates normalize to existing commands:

| Candidate | Canonical command/disposition |
|---|---|
| `cmd.lsp.server.restart` | `cmd.lsp.restart_server` |
| `cmd.lsp.server.diagnose` | `cmd.lsp.open_problems` |
| `cmd.debug.session.start` | `cmd.run_debug.start` |
| `cmd.debug.session.stop` | `cmd.run_debug.stop` |
| `cmd.debug.session.action` | Rejected; use the exact concrete `cmd.run_debug.*` verb. |
| `cmd.worktree.provision` | `cmd.git.worktree.create`, with the existing thread wrapper only for thread scope. |
| `cmd.worktree.release` | `cmd.git.worktree.release` |
| `cmd.context.receipt.open` | `cmd.nav.open_subject` or `cmd.nav.open_usage_subject` |
| `cmd.remote.reconnect` | Exact-`ExecutionEnvironmentId` compatibility wrapper over canonical `cmd.environment.reconnect`; it creates no second lifecycle. |

All 26 approved generalized operations are registered by the command owners. Their machine bindings carry typed request/result refs, state selector, disabled reason, sole handler, receipt-only effect, empty EventRecord expectations while Event Authority remains open, projection, accessibility, recovery, and regression fixtures. Compatibility intents never receive a second production wiring row.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md

### 15.2 DRY services

Consumer code uses these names rather than feature-local peers: `InstallationResolver`, `InstallationLifecycleManager`, `CapabilityProvisioner`, `EnvironmentConnectionSupervisor`, `ThreadCommandOutbox`, `ProjectionReplayCoordinator`, `StreamCoalescer`, `RuntimeResourceGovernor`, `ObservableWork`, `LeaseCoordinator`, `OperationalAwarenessService`, `DebugSessionBroker`, `EvalSessionBroker`, `ProviderDispatchAdmissionService`, `ConditionalRuleEngine`, and `BackSeatDriverService`.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### 15.3 GUI projections

GUI owners consume read-only projections with freshness, disabled reason, wait reason, and receipt/artifact drill-through. Thread lists use lightweight shell records; pinned items may use richer bounded summaries; only focused threads subscribe to full detail. Lists never subscribe to every transcript/tool stream.

Protected `AuthBrowserSession` control remains a human-only Browser surface and is excluded from operational-awareness detail, BSD, agents, tools, recordings, DOM, screenshot, console, and network capture.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

### 15.4 Usage and operational attribution

Each operation emits or links an operational attribution record containing operation/command/purpose, project and optional thread/Goal/Plan/run/agent/crew lineage, exact Host/Environment, status/outcome, timestamps, event/receipt/artifact refs, and time partitions for provider-active, local compute, resource wait, approval wait, offline/outbox wait, reconnect/sync/replay/snapshot, maintenance, and total elapsed.

Install, update, repair, rollback, connection maintenance, and local probes are not model Usage. If a model is called, it creates a separately linked immutable UsageRecord. BSD and context operations carry their additional attribution described above.

ContractRef: ContractName:Plans/usage-feature.md, SchemaID:pm.shared_runtime.contracts.v1

## 16. Verification contract

Implementation evidence is organized by requirement and exact source hash. Static schemas, green validators, or a concept browser do not prove runtime behavior.

The shared runtime test matrix includes:

- functional state-machine and owner-routing tests;
- process-kill restart and cursor convergence at every durable boundary;
- CAS, lease, replay/live-buffer, maintenance, and immediate-event races in both orders;
- cold/warm latency, replay volume, coalescing, CPU, memory, queue, and frame-impact budgets;
- secret, permission, FileSafe, hostile path, malformed input, supply-chain, and sandbox tests;
- delay, loss, jitter, offline, reconnect storm, and bounded retry network profiles;
- constrained CPU/RAM/software-render and old-hardware profiles;
- native Windows, macOS, Linux X11/Wayland, WSL, SSH, Docker, Podman, Compose, TrueNAS/Unraid, and namespace-scoped kind/k3d Kubernetes capability lanes when runners exist;
- ENOSPC, EIO, interrupted fsync, process death, provider outage, clock discontinuity, corrupted journal, and stale-generation failure injection;
- upgrade, rollback, restart, corruption, quarantine, legacy import, and secret-bearing migration tests;
- protected `AuthBrowserSession` negative tests for every prohibited consumer;
- worktree patch survival, failed integration, sibling isolation, and cold revival;
- LSP version/rename, DAP immediate-event, Eval persistence/cleanup, and MCP epoch/retry/subscription rollback tests.

Unavailable external hosts are reported as `not_run` with capability evidence and residual risk, never as pass.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Progression_Gates.md, Gate:GATE-009

## 17. Conflict dispositions

| Conflict | Deterministic disposition |
|---|---|
| BSD packet Auto default versus superseded source-lineage Off | Effective default and recommended value are Auto. Explicit stored Off remains Off; absent or invalid requested values resolve to Auto with a recorded reason. |
| Playwright listed as a PM-installable component in older contracts | External user-project dependency only. No PM-owned component or compatibility surface. |
| Secret storage allowances in older Multi-Account/FileSafe/Containers prose | OS credential store is authoritative; runtime stores only non-secret references. Conflicting clauses are superseded by their owners. |
| Provider-request permit absent from current canon | This document owns dispatch admission mechanics; Prompt Pipeline, Permissions, FileSafe, Multi-Account, and adapters remain independent decision owners. |
| No generic Home Server/Host/Environment/Source owner | This document owns runtime identity and topology projection for execution; `Plans/Project_Sync_and_Backbone.md` owns Project/Vault/app-content sync, move, source relocation, and Sync bundles, while Source Control remains with its named owners. |
| Event Authority denominator `UNKNOWN_OPEN` | New producer families remain unregistered and non-emitting until reconciled individually. No bulk registration or inferred closure. |
| PNC-019 hard-disabled runtime | Canonical and schema work may proceed; product runtime activation remains disabled until executable lifecycle and clean-room evidence close the governed gate. |

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/00-plans-index.md, ContractName:Plans/Shared_Integration_Runtime.md

## 18. Owner / consumer map

| Owned primitive | Primary consumers |
|---|---|
| Runtime topology identity/projection | Executor, provider lifecycle, LSP/DAP/Eval/MCP, Containers, Worktrees, Usage, Doctor |
| Installation/capability lifecycle | BinaryLocator, provider owners, Tools, Onboarding, Settings, Doctor |
| Environment supervision/domain sync status | Chat, provider catalog, Usage, Terminal, Testing/Debug, Doctor |
| Outbox/replay/coalescing | Assistant Chat, Goal controls, thread projections, Usage |
| Governor/ObservableWork/leases | Executor, Goal Runtime, Orchestrator, Tests, Debug, Eval, MCP, Browser, Worktrees |
| Operational awareness | Orchestrator, Chat, Source Control, Runtime Artifacts, Doctor, Usage |
| Debug/Eval session lifecycle | Testing/Debug, Tools, Chat, Runtime Artifacts, Usage |
| Provider dispatch admission | Prompt Pipeline, Permissions, FileSafe, Multi-Account, provider adapters |
| Conditional rules/BSD | Prompt Pipeline, Goal Runtime, Chat, Run Modes, Usage, Settings |

ContractRef: Primitive:DRYRules, ContractName:Plans/Shared_Integration_Runtime.md#1.1

## 19. PlanUnits

```yaml
plan_unit_id: SIR-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Shared Integration Runtime is the sole owner of the 21 adopted shared lifecycle primitives and consumes rather than replaces all named domain owners.
gui_related: false
depends_on: [PDS-003, PNC-001]
unblocks: []
acceptance_criteria:
  - The 21 adopted accountability IDs route here exactly once.
  - Domain, policy, command, GUI, storage, permission, and security owners remain non-duplicated.
validation_surfaces: [runtime integration disposition validation, owner-routing audit]
risk_class: parallel_owner_drift
reasoning_tier: high
context_scope: shared_runtime_owner_boundary
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/runtime_integration_disposition.json]
node_compile_hint: {mode: shared_runtime_owner_boundary, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/DECISION_COVERAGE.json
  - 'Plans/runtime_integration_disposition.json#items[PROV-004,PROV-005,PROV-007,PROV-009,PROV-010,PROV-012,PROV-023,PROV-024,CTX-020,AGT-014,AGT-016,AGT-020,PRM-010,PRM-011,PRM-012,PRM-016,PRM-017,PRM-018,PRM-019,PRM-020,PRM-022]'
```

```yaml
plan_unit_id: SIR-002
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Server-first runtime identity binds one Home Server and physical Vault to explicit Execution Host, Environment, and Source identities without taking over project content or sync semantics.
gui_related: false
depends_on: [SIR-001]
unblocks: []
acceptance_criteria:
  - Every executable operation binds exact topology identities and generation.
  - WSL, container, Kubernetes, SSH, and native identities cannot silently substitute for one another.
validation_surfaces: [topology contract tests, cross-host path-collision tests]
risk_class: execution_topology_drift
reasoning_tier: high
context_scope: server_first_runtime_topology
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: server_first_runtime_topology, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md#server-first-topology
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#execution-forms
  - 'Plans/runtime_integration_disposition.json#items[PRM-022]'
```

```yaml
plan_unit_id: SIR-003
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: InstallationResolver and InstallationLifecycleManager provide proof-based exact-target installation, update, repair, rollback, and non-provider provisioning while enforcing the explicit provider-CLI first-acquisition exception.
gui_related: false
depends_on: [SIR-002]
unblocks: []
acceptance_criteria:
  - Installation, authentication, readiness, and Usage evidence remain separate.
  - No provider CLI is silently acquired or treated as baseline.
  - Failed replacement preserves or restores the last verified installation.
validation_surfaces: [installation lifecycle tests, provider consent negative tests, rollback tests]
risk_class: installation_authority_or_provenance_drift
reasoning_tier: high
context_scope: shared_runtime_installation_lifecycle
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Release_Supply_Chain.md, Plans/Multi-Account.md]
node_compile_hint: {mode: proof_based_installation_lifecycle, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md#shared-lifecycle
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - 'Plans/runtime_integration_disposition.json#items[PROV-004,PROV-005,PROV-007,PROV-009,PROV-010,PROV-012,PROV-023,PROV-024]'
```

```yaml
plan_unit_id: SIR-004
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: EnvironmentConnectionSupervisor separates transport health from domain synchronization and fences replacement, retry, authentication block, probes, and reconnect by environment epoch.
gui_related: false
depends_on: [SIR-002]
unblocks: []
acceptance_criteria:
  - Exactly one active supervisor generation exists per environment.
  - Online transport never implies current domain projections.
  - Old-epoch work cannot mutate current state.
validation_surfaces: [connection replacement races, poor-network tests, domain sync independence tests]
risk_class: connection_domain_conflation
reasoning_tier: high
context_scope: environment_connection_supervision
implementation_surfaces: [Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: durable_environment_connection, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/02_T3_DURABLE_THREADS_NETWORK_AND_OUTBOX.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-016]'
```

```yaml
plan_unit_id: SIR-005
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: ThreadCommandOutbox, ProjectionReplayCoordinator, and StreamCoalescer provide cross-platform durable commands, buffered live-before-replay convergence, adaptive replay/snapshot choice, and lossless canonical ordering.
gui_related: true
gui_classification_reason: Thread shell/detail state, queued commands, reconnect, and streamed progress are user-visible projections.
depends_on: [SIR-004]
unblocks: []
acceptance_criteria:
  - Logical commands have at most one server-side effect and preserve in-thread order.
  - Live buffering begins before replay or snapshot and converges under an epoch fence.
  - Critical state bypasses presentation coalescing and canonical events are never dropped.
validation_surfaces: [outbox restart tests, replay/live races, coalescing order tests]
risk_class: durable_command_or_projection_loss
reasoning_tier: high
context_scope: durable_outbox_replay_coalescing
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/assistant-chat-design.md, Plans/storage-plan.md]
node_compile_hint: {mode: durable_outbox_replay_coalescing, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/02_T3_DURABLE_THREADS_NETWORK_AND_OUTBOX.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-017,PRM-018,PRM-019]'
```

```yaml
plan_unit_id: SIR-006
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: RuntimeResourceGovernor enforces shared policy on each exact host and ObservableWork is the sole truthful shared phase, wait, progress, cancellation, and outcome projection.
gui_related: true
gui_classification_reason: Observable work state and disabled/wait reasons are visible across product surfaces.
depends_on: [SIR-002]
unblocks: []
acceptance_criteria:
  - Host-local enforcement reports requested and effective limits and admission outcomes.
  - Every wait has a typed reason and reevaluation condition.
  - Client disconnection does not terminate Server-owned work.
validation_surfaces: [resource pressure tests, client-loss tests, progress-truth tests]
risk_class: resource_or_progress_truth_drift
reasoning_tier: high
context_scope: resource_governor_observable_work
implementation_surfaces: [Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: resource_governor_observable_work, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#performance
  - 'Plans/runtime_integration_disposition.json#items[PRM-020]'
```

```yaml
plan_unit_id: SIR-007
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: LeaseCoordinator and OperationalAwarenessService provide fenced reservation lifecycles and freshness-labeled cross-domain projections without re-owning domain truth or authority.
gui_related: true
gui_classification_reason: Lease conflicts, active work, freshness, and remediation state are projected to visible owners.
depends_on: [SIR-006]
unblocks: []
acceptance_criteria:
  - Resource, port, worktree, test, debug, Eval, MCP, and Browser controller leases use CAS, generation, expiry, and reconciliation.
  - Expiry alone never proves resource cleanup.
  - Awareness projections cannot authorize mutation.
validation_surfaces: [lease races, crash reconciliation, awareness freshness tests]
risk_class: lease_or_awareness_authority_drift
reasoning_tier: high
context_scope: lease_operational_awareness
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md]
node_compile_hint: {mode: shared_leases_operational_awareness, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - 'Plans/runtime_integration_disposition.json#items[AGT-014,AGT-016]'
```

```yaml
plan_unit_id: SIR-008
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: DebugSession and EvalSession records provide durable exact-target session identity, lease, generation, output/artifact, restart, and cleanup mechanics while protocol and tool policy remain with their domain owners.
gui_related: false
depends_on: [SIR-002, SIR-006, SIR-007]
unblocks: []
acceptance_criteria:
  - DAP immediate-event waiters are armed before triggering operations.
  - Eval kernels are explicit, sandboxed, bounded, and never hidden global state.
  - Restart, cleanup, and late-generation behavior are deterministic and evidenced.
validation_surfaces: [DAP event races, Eval persistence tests, resource and security tests]
risk_class: developer_session_lifecycle_drift
reasoning_tier: high
context_scope: debug_eval_session_lifecycle
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Tools.md]
node_compile_hint: {mode: debug_eval_session_lifecycle, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-010,PRM-011]'
```

```yaml
plan_unit_id: SIR-009
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: ProviderRequestPermit and its ProviderDispatchAdmissionReceipt evidence are a single-use independent no-bypass decision bound to immutable request bytes and every effective identity and authority generation.
gui_related: false
depends_on: [SIR-002]
unblocks: []
acceptance_criteria:
  - Adapters cannot self-issue admission.
  - Byte, route, account, permission, topology, or mutation-evidence change invalidates admission.
  - Admission cannot replace Permissions, FileSafe, auth, readiness, or budget policy.
validation_surfaces: [no-bypass tests, immutable-byte binding tests, generation invalidation tests]
risk_class: provider_dispatch_bypass
reasoning_tier: high
context_scope: provider_dispatch_admission
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md, Plans/FileSafe.md]
node_compile_hint: {mode: provider_dispatch_admission, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-012]'
```

```yaml
plan_unit_id: SIR-010
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: ConditionalRuleEngine and BackSeatDriverService are bounded, receipt-backed, non-authoritative advisory mechanisms; BSD supports Off, Auto, and On with effective default and recommended value Auto.
gui_related: true
gui_classification_reason: BSD mode, advisory output, suppressed state, and conditional-rule effects have user-visible projections.
depends_on: [SIR-009]
unblocks: []
acceptance_criteria:
  - Conditional rules cannot replace safety or mutate canonical state.
  - BSD is read-only, delta-bounded, independently routed, fully attributed, and non-blocking.
  - BSD cannot access AuthBrowserSession, secrets, tools, or approvals.
validation_surfaces: [rule determinism tests, BSD timeout/quota tests, protected-session negative tests, Usage attribution tests]
risk_class: advisory_authority_widening
reasoning_tier: high
context_scope: conditional_rules_bsd
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Prompt_Pipeline.md, Plans/usage-feature.md]
node_compile_hint: {mode: conditional_rules_bsd, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - 'Plans/runtime_integration_disposition.json#items[CTX-020,AGT-020]'
```

```yaml
plan_unit_id: SIR-011
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Shared runtime persistence uses seglog, redb, and Tantivy under the sole StorageMigrationCoordinator with no SQLite, no raw secrets, and crash-decidable migration and recovery.
gui_related: false
depends_on: [SIR-003, SIR-004, SIR-005, SIR-007, SIR-008, SIR-009, SIR-010]
unblocks: []
acceptance_criteria:
  - Canonical events are emitted only after individual Event Authority admission.
  - Migration performs preflight, verified backup, journal, atomic apply, read-back, version-last stamp, and receipt.
  - Missing or conflicting evidence cannot become success.
validation_surfaces: [storage schema tests, restart/failure injection, migration/rollback tests, secret scans]
risk_class: storage_migration_or_secret_drift
reasoning_tier: high
context_scope: shared_runtime_storage_recovery
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/storage-plan.md]
node_compile_hint: {mode: shared_runtime_storage_recovery, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - 'Plans/runtime_integration_disposition.json#items[PROV-004,PROV-005,PROV-007,PROV-009,PROV-010,PROV-012,PROV-023,PROV-024,CTX-020,AGT-014,AGT-016,AGT-020,PRM-010,PRM-011,PRM-012,PRM-016,PRM-017,PRM-018,PRM-019,PRM-020,PRM-022]'
```

```yaml
plan_unit_id: SIR-012
unit_type: acceptance
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Shared runtime implementation is complete only with owner, command, wiring, DRY, schema, migration, functional, restart, race, performance, security, network, old-hardware, platform, failure-injection, and migration evidence; unavailable lanes remain explicit gaps.
gui_related: false
depends_on: [SIR-001, SIR-002, SIR-003, SIR-004, SIR-005, SIR-006, SIR-007, SIR-008, SIR-009, SIR-010, SIR-011]
unblocks: []
acceptance_criteria:
  - Every adopted row links current implementation and test evidence.
  - Static validation is never substituted for runtime behavior.
  - Skipped or unavailable external lanes remain non-pass with residual risk.
validation_surfaces: [complete runtime integration matrix, independent fidelity and security audit]
risk_class: false_completion_claim
reasoning_tier: high
context_scope: shared_runtime_acceptance
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, tests]
node_compile_hint: {mode: shared_runtime_acceptance, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json
  - 'Plans/runtime_integration_disposition.json#items[PROV-004,PROV-005,PROV-007,PROV-009,PROV-010,PROV-012,PROV-023,PROV-024,CTX-020,AGT-014,AGT-016,AGT-020,PRM-010,PRM-011,PRM-012,PRM-016,PRM-017,PRM-018,PRM-019,PRM-020,PRM-022]'
```

```yaml
plan_unit_id: SIR-014
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Usage renders offline-outbox wait and reconnect/replay time partitions from the SIR-005 ThreadCommandOutbox, ProjectionReplayCoordinator, and StreamCoalescer receipts, joined by logical operation id, and owns no transport, ordering, buffering, or convergence state; queued and replayed time is operational time rather than provider usage, and replay overlap never creates a second billed attempt.
gui_related: true
gui_classification_reason: Queued-while-offline and reconnect/replay waits are visible explanations on the Usage page for why work took the time it did.
depends_on: [SIR-005, UF-091, UF-092]
unblocks: []
acceptance_criteria:
  - Usage joins outbox and replay receipts by logical operation id and never derives its own transport, ordering, or convergence state.
  - Offline-outbox wait and reconnect/replay partitions remain distinguishable from provider-active time and never become provider usage.
  - Replay or reconnect overlap of one logical operation cannot produce a second attributable attempt in Usage.
validation_surfaces: [python3 scripts/pm-shared-runtime-contracts.py --self-test, python3 scripts/pm-plan-index.py validate, future Usage outbox and replay attribution fixtures]
risk_class: replay_overlap_double_attribution
reasoning_tier: high
context_scope: usage_outbox_replay_attribution
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/usage-feature.md]
node_compile_hint: {mode: usage_outbox_replay_attribution, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
preserved_exact_tokens: [ThreadCommandOutbox, ProjectionReplayCoordinator, StreamCoalescer, offline/outbox wait]
negative_constraints:
  - Do not let Usage hold or reimplement transport, ordering, or convergence state.
  - Do not convert queued or replayed operational time into provider usage.
  - Do not attribute a replayed logical operation twice.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/usage-feature.md]
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Automated_Testing_System.md

### SIR-013 - Server Claim And Bootstrap Lifecycle

```yaml
plan_unit_id: SIR-013
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Server Claim and Bootstrap is one idempotent exact-topology lifecycle that proves Server identity and access, binds the Project Home Server and one physical Project Vault, records the topology transition, requests any Project-content synchronization from Project Sync and Backbone, and exposes restart-safe revocation and recovery without making transport reachability or a mounted path proof of ownership.
gui_related: true
gui_classification_reason: Claim, bootstrap, topology binding, access failure, recovery, and remediation have user-visible onboarding and Doctor projections.
depends_on: [SIR-002, SIR-003, PSB-001]
unblocks: []
acceptance_criteria:
  - A claim record binds stable Server identity, claimant, proof method, permission snapshot, topology generation, Home Server and Vault identities, idempotency key, and recovery refs.
  - Repeating a committed claim returns the same binding; conflicting identity or generation fails closed without a second Home Server or Vault.
  - Bootstrap installation/capability steps use SIR-003, Project content movement uses PSB, and neither path is reimplemented here.
  - Revocation or interrupted bootstrap is restart-decidable and cannot infer success from reachability, path equality, or missing evidence.
validation_surfaces: [server claim schema fixtures, idempotent bootstrap fixtures, topology conflict negative fixtures]
risk_class: server_claim_or_vault_identity_drift
reasoning_tier: high
context_scope: server_claim_bootstrap
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
node_compile_hint: {mode: server_claim_bootstrap_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-001
negative_constraints: [Do not treat transport reachability as claim proof., Do not create a second Project Vault., Do not re-own Project content synchronization.]
```

## 20. Migration coverage

The corrected remaining-runtime packet is compiled into `SIR-001` through `SIR-012`. The 21 adopted IDs are covered as follows:

| PlanUnit | Accountability rows |
|---|---|
| `SIR-002` | `PRM-022` |
| `SIR-003` | `PROV-004`, `PROV-005`, `PROV-007`, `PROV-009`, `PROV-010`, `PROV-012`, `PROV-023`, `PROV-024` |
| `SIR-004` | `PRM-016` |
| `SIR-005` | `PRM-017`, `PRM-018`, `PRM-019` |
| `SIR-006` | `PRM-020` |
| `SIR-007` | `AGT-014`, `AGT-016` |
| `SIR-008` | `PRM-010`, `PRM-011` |
| `SIR-009` | `PRM-012` |
| `SIR-010` | `CTX-020`, `AGT-020` |

This compile does not update generated shards, Spec Lock, evidence bundles, plan-index outputs, auto-decisions, or governance seals. It does not itself prove implementation or lift PNC-019.

ContractRef: ContractName:Plans/runtime_integration_disposition.json, Gate:PNC-019, Primitive:DRYRules
