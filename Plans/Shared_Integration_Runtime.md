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

### 4.7 Ownership-aware maintenance

Proof-based installation ownership controls maintenance authority. PM-managed Tool Store generations may follow their reviewed automatic-maintenance policy. External, package-manager, user, and organization-managed installations default to check-and-notify: discovery and a verified update-available projection are allowed, but download, package-manager invocation, replacement, activation, repair, rollback, configuration mutation, and removal are not. A one-operation human action or a separately reviewed durable delegation may authorize only the exact ownership-compatible plan it names; `Auto`, `On`, Project demand, provider demand, baseline availability, a successful check, or prior unrelated consent is never delegation. Unknown ownership remains manual-only. Revocation or staleness of delegation returns the installation to check-and-notify before another effect.

ContractRef: ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Permissions_System.md

### 4.8 Logical provisioning and update coalescing

Coalescing here is operation-level deduplication inside `InstallationLifecycleManager`/`CapabilityProvisioner`, not presentation batching by `StreamCoalescer`. Provisioning or update requests from different Projects or Clients share one acquisition/update attempt only when operation kind, product/package, requested version or channel, desired effect, source/provenance, artifact hash, exact Host, exact Environment, ownership/delegation generation, and effective policy generation all match. The shared operation has one stable logical operation identity and one `ObservableWork`; every waiter retains its own permission/approval refs, continuation, cancellation, requested/effective result, and currentness check. A waiter cancellation detaches that waiter and does not cancel work still needed by another current waiter. A difference in any fingerprint or authority field, an incompatible permission/license/cost decision, or conflicting desired state prevents coalescing and instead remains separate, serialized under the package-manager-root lease, or blocked with a typed reason.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#7.2, ContractName:Plans/Permissions_System.md, ContractName:Plans/Release_Supply_Chain.md

### 4.9 Persistent Tool Store and isolated profiles

The PM Tool Store and isolated integration-profile roots are explicit durable-volume bindings keyed to the stable Server, Host, and Environment rather than paths inside a replaceable image or pod layer. Profiles remain isolated per product and profile/account identity; sharing a durable volume never merges their homes or permissions. After an image or pod replacement, readiness stays `synchronizing`, `degraded`, or `recovery_required` until the runtime verifies the mounted root identity and generation, schema/migration state, package provenance and hashes, active/previous generations, profile ownership/permissions, and broker references, then writes a restart/reconciliation receipt. A missing, wrong, stale, partially restored, corrupt, or unexpectedly writable root cannot be treated as a fresh empty success and cannot silently reacquire tools. Raw secrets remain outside Tool Store/profile payloads under the credential owner even when the durable root survives.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/Containers_Registry_and_Unraid.md

### 4.10 AuthenticationProfile and CredentialAttachment consumption

Shared Integration Runtime consumes the common `AuthenticationProfile` identity/lifecycle and `CredentialAttachment` value contract retained by Multi-Account; it does not create a second auth-profile registry, connection profile, authentication broker, credential store, or provider-auth policy. An executable operation carries only non-secret profile and credential-source references plus exact provider, Host, Environment, repository when applicable, operation/capability, issued/expiry, revocation and owner-generation fences. The credential owner attenuates that attachment into an operation-scoped broker lease. Expiry, revocation, provider/profile mismatch, Host/Environment or repository mismatch, operation mismatch, stale generation, or requested capability outside the attachment fails closed before launch. Attachments, profiles, Tool Store, durable roots, logs, events, receipts, projections, and continuations never contain raw passwords, tokens, keys, cookies, device codes, or protected authentication content.

ContractRef: ContractName:Plans/Multi-Account_Connection_Spec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Permissions_System.md

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

## Full-Thread Performance And Continuity Addendum - 2026-08-31

This addendum compiles the retained Full Thread Performance requirements into the existing shared-runtime owner. It does not create a `ResourceGovernor`, progress service, scheduler, connection manager, Event Authority, or plugin runtime beside the existing `RuntimeResourceGovernor`, `ObservableWork`, `EnvironmentConnectionSupervisor`, `ThreadCommandOutbox`, `ProjectionReplayCoordinator`, and `StreamCoalescer`. The closed value envelopes are `SchemaID:pm.full_thread_runtime.contracts.v1` in `Plans/full_thread_runtime_contracts.schema.json`; they specify durable values and receipts only and do not claim executable handlers or runtime proof.

### Separate decision, command, and work axes

Every admitted operation preserves three independently changing axes. Consumers must not flatten them into one overloaded status:

1. `GovernorDecisionRecord.decision` is exactly `admitted | queued | admitted_degraded | permission_blocked | resource_blocked | cancelled`. It records the requested and effective budgets, physical-parent budget identity, policy generation, host observation, reason, lease refs, and reevaluation trigger. Host-local enforcement of a Home-Server policy is not a second governor.
2. `CommandOutcomeRecord.outcome` is exactly `accepted | acknowledged | executing | succeeded | failed | cancelled | rejected | terminal_unknown`. Acceptance or same-frame acknowledgement proves only that the command entered its durable command lineage; neither value proves that the work started or completed.
3. `ObservableWorkRecord.work_state` is exactly `accepted | queued | starting | running | waiting | retrying | reconnecting | backgrounded | degraded | stalled | committing | verifying | testing-route | migrating-route | rolling-back | completed | failed | cancelled | recovery-required`. A waiting row carries one typed wait reason and next reevaluation condition. Completion remains owner-receipt-backed; command success alone cannot fabricate it.

The `testing-route` and `migrating-route` values describe active routed work, not successful testing or migration. `degraded` and `stalled` remain nonterminal until an owner receipt moves them to a terminal state. `backgrounded` changes presentation priority only; it does not cancel, pause, orphan, or weaken durable work.

This addendum supersedes only the closed admission/status spellings in §8.1-§8.2; it does not supersede or duplicate the services. Existing `pm.shared_runtime.contracts.v1` rows are compatibility/import values and normalize once at the owner boundary: `admitted_reduced -> admitted_degraded`; a legacy `blocked` row becomes `permission_blocked` or `resource_blocked` from its mandatory typed reason and otherwise fails migration; `rejected` requires the same reasoned blocked disposition or fails migration. Legacy work values normalize as `preflighting -> starting`, `awaiting_permission -> waiting(permission)`, `awaiting_user -> waiting(user)`, `awaiting_resource -> waiting(resource)`, `retry_backoff -> retrying`, transport `reconciling -> reconnecting`, non-transport `reconciling -> starting` with the preserved reconcile phase, `cancelling -> running` with the human phase `Cancelling` and no further cancel action, `succeeded -> completed`, and `recovery_required -> recovery-required`; unchanged spellings remain unchanged. New producers emit only `pm.full_thread_runtime.contracts.v1` values. Consumers do not expose both vocabularies, and ambiguous legacy rows fail closed rather than inventing a status.

### Logical concurrency, fairness, and physical budgets

Chats, threads, named Plans, Goals, WorkNodes, Browser tasks, provider attempts, and agents are durable logical state machines rather than dedicated operating-system threads or processes. The canonical execution lanes are the Slint UI thread, a protected interactive control/projection reserve, the async I/O runtime, a bounded CPU work-stealing pool, a bounded blocking/platform/install pool, ordered storage append/projector/index lanes, and governed external-process pools. Consumers may request a domain ceiling, but they may not instantiate a peer pool governor or multiply independent Tokio, Rayon, Tantivy, renderer, CEF, compiler, test, LSP, provider-helper, compression, or image-library budgets without a governor mapping.

The shared physical-parent budget tree prevents native hosts, WSL environments, containers, and Kubernetes workloads from each claiming the full parent CPU, memory, process, network, GPU/media, or storage budget. Admission applies Project-first then named-Plan fairness, weighted aging, temporary interaction boost, anti-starvation, completion-aware capacity, and provider/account/model/reset/cost limits. Required specialists and tests run in admitted waves; resource pressure may queue a wave but never silently remove it.

Resource families include CPU, memory, process, watcher, descriptor, queue, log, artifact, network, port, storage, index, browser, capture, provider, LSP, DAP, Eval, MCP, test host, device, container, worktree, and package-manager-root pressure. These are mapping keys into the one governor, not new resource owners. One seglog writer, one worktree writer per fenced scope, one Browser page mutation controller per page generation, one package-manager-root mutator, one Goal owner epoch, and one activation switch are serialized even while independent owners proceed concurrently.

### Same-frame acknowledgement and truthful projection

A user command that can be durably accepted must publish a visible pending shell in the dispatch frame where feasible, recording the command frame, acknowledgement frame, command instance, operation, target generation, and acknowledgement receipt. If the durable accept cannot be obtained in that frame, the UI may show only a non-success provisional affordance and must reconcile it to the durable command outcome. Pause, stop, New Plan, connect, install, Browser, and test controls never wait for broad hydration before showing the accepted pending shell, and any later failure rolls that shell back truthfully.

Long lists are stable-ID, bounded, virtualized projections. Producers send narrow deltas and collection generations; consumers render only a bounded visible window plus a bounded overscan and preserve selection by identity. Streamed fragments are frame-batched under `StreamCoalescer`; terminal, approval, security, lease-loss, failure, cancellation, and completion frames bypass ordinary coalescing. Latest-request-wins may cancel obsolete projection work, but it cannot cancel the underlying durable operation unless the owning command explicitly requests cancellation.

Inactive, hidden, off-screen, collapsed, and undocked surfaces share owner subscriptions and suppress expensive hydration, paint, animation clocks, media decode, and per-token repaint. Paint suppression never stops Server-owned work, drops canonical events, releases a lease, changes an `ObservableWork` terminal outcome, or suppresses a receipt. Returning visibility rehydrates from the current generation instead of replaying every hidden paint frame.

### Generation fencing, deduplication, and continuity

Every command, projection delta, continuation, retry, subscription, route return, and result binds `OperationId`, command/attempt identity where applicable, owner generation, topology generation, projection generation, and an idempotency or deduplication key. A stale or superseded generation is rejected with an explicit receipt and cannot mutate the current projection. Same-payload retries retain the same logical identity; a genuinely new provider or local attempt receives a new `AttemptId` and links to the parent operation.

Reconnect, process restart, operating-system sleep/wake, and external-return navigation preserve the same logical operation, command instance, durable owner, target object, return route, and continuation generation. They may create a new transport epoch or attempt but do not mint a second logical effect. Startup and return first show the compact cached shell, then reconcile owner truth; absence of a response or a lost client is never converted to cancellation or success. Replay/live overlap, projector retry, reconnect, and duplicate external-return callbacks are deduplicated before projection and Usage attribution.

### Platform-specific host adapters

These are required adapter and measurement boundaries under the one `RuntimeResourceGovernor`; they are not separate schedulers, portable-proof substitutes, or evidence that an adapter exists. A producer may claim a native path only after capability detection and target-specific runtime evidence. An unavailable or weaker platform path remains explicit and cannot be reported as native success.

**macOS and Apple Silicon**

- First-party helpers are native arm64. macOS QoS/work classification is used instead of hard-pinning presumed performance/efficiency core IDs: interactive controls are `user-interactive` or `user-initiated`; foreground Project work is `user-initiated`; index, download, and validation work is `utility`; cleanup, checks, and backups are `background`. The governor still owns admission and reserve while macOS supplies topology-aware placement.
- Thermal pressure and Low Power Mode reduce speculative work, background fan-out, recording quality, index-merge frequency, and decorative animation while preserving active UI/control, durable writes, the active provider stream, pause/stop/approval, recovery, and rollback.
- One unified-memory budget accounts for Rust state, CEF surfaces/helpers, decoded media, renderer textures, capture rings, simulators, local tools, and readback/encoding buffers.
- FSEvents serves large repository trees without one expensive watcher per file. APFS clones are opportunistic only for same-volume snapshots or disposable test workspaces and retain normal-copy fallback.
- Browser evidence uses CEF/page-native capture. ScreenCaptureKit supplies native Puppet Master, external-app, simulator, emulator, or window capture where appropriate. Dirty-region comparison/encoding may optimize capture only with periodic full keyframes and honest dropped/degraded evidence. Accelerate, vDSP, or BNNS may back image/vector kernels only after measured proof.
- macOS 27 container-machine and Foundation Models integrations remain optional, feature-detected adapters rather than launch assumptions; adoption still requires FileSafe, receipts, networking, lifecycle, and cross-platform provider contracts.

**Windows**

- Sockets, process pipes, PTYs, and high-concurrency file operations use completion-based asynchronous I/O and do not allocate one thread per handle. The admitted packet does not freeze `IOCP` or a particular wait API as a product contract.
- Normal filesystem watching uses `ReadDirectoryChangesW`; NTFS USN data is optional acceleration for overflow, recovery, or long disconnect and always retains a normal fallback.
- Latency-critical controls use high QoS; maintenance uses EcoQoS or equivalent efficiency policy.
- Startup, input-to-paint, provider receive-to-paint, storage, Git, process launch, Browser lifecycle, queues, and Goal phases emit ETW/WPR/WPA-compatible instrumentation. Resource evidence measures the total process tree rather than the primary process alone.
- Large processor-group systems are supported and third-party pool assumptions are tested without indiscriminate affinity.
- Native and standalone Windows are complete execution hosts with WSL off. WSL is an optional selectable execution backend and cannot be a hidden prerequisite or substitute for native Windows proof.

**Linux**

- Asynchronous I/O is epoll-backed. Local change observation uses inotify with bounded reconciliation after overflow or reconnect; remote, NFS, and SMB repositories use local metadata/index caches plus bounded reconciliation and never claim local-watcher guarantees.
- CPU, memory, and I/O pressure response consumes PSI; limits and weights are cgroup-aware when available. The supported minimum libc/runtime floor is explicit rather than inferred from the build host.
- `io_uring`, NUMA, and huge-page specialization are optional and may activate only after end-to-end evidence; the portable path remains available. The admitted packet does not freeze fanotify, timerfd, signalfd, or pidfd as product requirements.
- Full desktop operation remains supported on older Xeon/Ivy Bridge-class systems. A future headless/standalone package may omit GUI assets or renderers but cannot redefine or weaken the desktop-first performance model.

The mechanism names and constraints above are sourced from the Full Thread decision register and its correction/return extracts. Static Plans, schemas, fixtures, or platform-name coverage do not prove native execution, performance, capture, filesystem, power, thermal, or recovery behavior.

### Low-resource and legacy-platform behavior

The compatibility path remains a portable x86-64 baseline and may select measured runtime-dispatched hot kernels; no global AVX2 or `target-cpu=native` requirement is permitted. Native arm64 remains native. Low-memory, battery, thermal, PSI/cgroup, network, and old-hardware profiles first cancel obsolete speculation, pause maintenance, stop prefetch/prewarm, shrink bounded caches and media rings, close idle helpers/readers, reduce background concurrency, and safely defer low-priority waves. They preserve UI/control reserve, active streams, durable commits, rollback, pause/stop, authentication safety, and owner recovery. A reduced profile cannot remove a feature, silently skip a required specialist/test, fabricate completion, or weaken Permissions, FileSafe, authentication, provenance, or public-ingress gates.

### Public ingress authentication and rate gate

Endpoint ownership remains with the Server and security owners. Shared runtime owns only the ordered admission composition for an already-declared endpoint. LAN/private access and explicit public Funnel/reverse-proxy/custom-domain exposure remain distinct; public exposure is explicit, off by default, and never an authentication boundary by itself.

`PublicIngressGateDecision` binds endpoint identity/generation, transport/request identity, exposure class, authentication decision ref, rate-policy decision ref, permission/security refs, and a decision of `admitted | authentication_required | authentication_rejected | rate_limited | blocked_policy | stale_generation`. For public traffic, authentication and rate decisions are mandatory and occur before Project/Vault/provider/plugin hydration, large body handling, Browser/CEF creation, model dispatch, expensive routing, or durable mutation. Rejected unauthenticated or rate-limited traffic receives a bounded redacted response and operational attribution only; it never becomes model Usage or an `ObservableWork` success.

### Commands, events, wiring, and GUI/reverse coverage

No new performance-only command family is introduced. Existing owner commands dispatch through their existing central IDs and return `CommandOutcomeRecord` plus an optional `ObservableWorkRecord` ref. `cmd.environment.connect`, `cmd.environment.reconnect`, and `cmd.environment.disconnect` retain connection ownership; installation, authentication, Browser, test, Goal, and Plan controls retain their named owners. A GUI control has exactly one canonical command dispatch, one stable command instance, one same-frame acknowledgement path, one current generation selector, and one owner receipt path.

These new records are receipt/projection values. They emit no new EventRecord while Event Authority is open. `event_effect_policy` remains `receipt_only_no_eventrecord_pending_event_authority`; existing admitted producer events remain governed by their existing owner registrations.

| Owner fact | Forward consumers | Reverse proof required |
|---|---|---|
| Governor decision and effective physical budget | Executor, Goal, Orchestrator, Browser, Testing, Plugins, Usage | request identity, policy/host generations, requested/effective budget, decision, reason, reevaluation, lease refs |
| Command outcome and same-frame acknowledgement | every command-driven GUI surface | control role/name, exact command ID, one dispatch, frame IDs, command instance, durable acknowledgement/result refs, rollback fixture |
| Observable work lifecycle and waits | Chat, Orchestrator, Usage, Settings, Doctor, Plugins | all closed work states, typed wait/queue reason, freshness, valid controls, owner result/receipt refs |
| Bounded virtualized projection | long lists, thread shells, Usage ledgers, Plugins inventory | stable IDs, collection/projection generations, bounded window/overscan, narrow-delta and stale-generation fixtures |
| Continuity and deduplication | reconnect/restart/sleep/external return consumers | unchanged logical operation, transport/attempt change evidence, dedupe key, stale-result rejection, no duplicate effect/Usage |
| Hidden-surface suppression | all inactive or off-screen GUI surfaces | paint/hydration/animation suppression plus proof that durable work, events, leases, receipts, and terminal outcomes continue |
| Public ingress gate | Server transport and authenticated native/web clients | public-off default, auth-before-hydration, rate-before-hydration, bounded redacted rejection, no model Usage |

ContractRef: SchemaID:pm.full_thread_runtime.contracts.v1, Invariant:HostLocalRuntimeResourceGovernor, Invariant:ObservableWorkTruth, ContractName:Plans/usage-feature.md, ContractName:Plans/Release_Supply_Chain.md

### SIR-015 - Full-Thread Admission, Command, And Work Axes

```yaml
plan_unit_id: SIR-015
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  The one RuntimeResourceGovernor and one ObservableWork vocabulary preserve separate governor-decision,
  command-outcome, and work-lifecycle axes; every logical operation is generation-fenced, deduplicated,
  restart/reconnect/sleep/external-return stable, and projected through bounded virtualized state.
gui_related: true
gui_classification_reason: Same-frame acknowledgement, wait/progress state, bounded lists, hidden-surface behavior, and continuity are user-visible.
depends_on: [SIR-004, SIR-005, SIR-006, SIR-007, SIR-011]
unblocks: [SIR-016, SIR-017, UF-097]
acceptance_criteria:
  - Governor decision, command outcome, and work lifecycle remain three independent closed axes.
  - Legacy shared-runtime admission/work spellings normalize once through the explicit compatibility map; new producers and consumers expose only the full-thread vocabulary and ambiguous rows fail closed.
  - ObservableWork accepts every retained state from accepted through recovery-required, including testing-route and migrating-route, without treating a route as successful proof.
  - The PMConcept7 browser fixture exposes exactly seven deterministic ObservableWork evidence rows, six GovernorDecision outcome rows, and five bounded-list families (findings, history, logs, provider, receipts), each with stable identity, truthful reason/reevaluation metadata, bounded row/byte metadata, and an explicit browser-fixture-only boundary; these rows do not prove native or production execution.
  - Same-frame acknowledgement is durable-command acknowledgement only and rolls back truthfully on later failure.
  - Stable-ID virtualized projections reject stale generations and hidden-surface paint suppression never cancels durable work.
  - Reconnect, restart, sleep, and external return preserve logical identity and deduplicate replay/projector overlap.
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, Concepts/pm7-tools/verify/full_thread_performance.mjs, future command acknowledgement, stale-generation, virtualization, continuity, and low-resource tests]
risk_class: full_thread_axis_or_identity_conflation
reasoning_tier: high
context_scope: full_thread_runtime_axes_and_continuity
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/full_thread_runtime_contracts.schema.json, Concepts/pm7-tools/full_thread_performance_source.py, Concepts/pm7-tools/verify/full_thread_performance.mjs]
node_compile_hint: {mode: full_thread_runtime_axes_and_continuity, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/04_DATA_CONTRACTS_AND_STATE_MACHINES.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/08_ACCEPTANCE_TEST_AND_FAILURE_MATRIX.md
preserved_exact_tokens: [RuntimeResourceGovernor, ObservableWork, same-frame, testing-route, migrating-route, external-return]
negative_constraints:
  - Do not create a peer governor, scheduler, progress service, connection manager, Event Authority, or OS thread per logical activity.
  - Do not flatten admission, acknowledgement, and lifecycle into one status.
  - Do not let projection cancellation or paint suppression cancel durable owner work.
```

### SIR-016 - Public Authentication And Rate Admission Gate

```yaml
plan_unit_id: SIR-016
unit_type: security_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Explicit public ingress composes endpoint-owner authentication and rate-policy decisions before expensive
  hydration or mutation, fails closed on stale generations, and records only bounded redacted operational
  attribution for rejected traffic without becoming an endpoint, authentication, rate-policy, or Usage owner.
gui_related: false
depends_on: [SIR-002, SIR-015]
unblocks: []
acceptance_criteria:
  - Public exposure remains explicit and off by default and is never treated as an authentication boundary.
  - Authentication and rate decisions precede Project, provider, plugin, Browser, model, and durable-mutation hydration.
  - Rejection is bounded, redacted, generation-fenced, and never counted as model Usage or successful work.
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, future public unauthenticated, rate-limit, stale-endpoint, and hydration-short-circuit tests]
risk_class: public_ingress_pre_auth_hydration
reasoning_tier: high
context_scope: public_ingress_auth_rate_composition
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/full_thread_runtime_contracts.schema.json]
node_compile_hint: {mode: public_ingress_auth_rate_composition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
negative_constraints:
  - Do not treat Funnel, reverse proxy, TLS, endpoint reachability, or public exposure as authentication.
  - Do not hydrate expensive domain state before both required gates admit public traffic.
```

### SIR-017 - Performance And Recovery Evidence Gate

```yaml
plan_unit_id: SIR-017
unit_type: acceptance
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Full-thread runtime acceptance requires measured user-visible latency, process-tree memory, wakeups,
  power/thermal behavior, queue delay, recovery, old-hardware, platform, stale-generation, low-resource,
  and 24-hour-soak evidence; static schema or wiring checks remain pre-build evidence only.
gui_related: false
depends_on: [SIR-012, SIR-015, SIR-016, SIR-018]
unblocks: []
acceptance_criteria:
  - Input acknowledgement, pause/stop acknowledgement, provider-fragment paint, idle, queue, and startup gates use P50/P95/P99, worst-case, and degraded/failure evidence.
  - Workloads cover 1, 10, 50, and 200 logical threads, many named Plans, browser/provider/tool saturation, old x86, Apple Silicon, native Windows without WSL, optional WSL, Linux/container/Kubernetes, low resources, restart, and a 24-hour soak.
  - Portable and optimized hot paths have equivalence, fuzz, boundary, and end-to-end evidence, and no unsupported runner is reported as pass.
validation_surfaces: [future full-thread benchmark matrix, process-tree resource captures, platform receipts, independent runtime audit]
risk_class: static_evidence_promoted_to_performance_proof
reasoning_tier: high
context_scope: full_thread_performance_acceptance
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, tests]
node_compile_hint: {mode: full_thread_performance_acceptance, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/07_PERFORMANCE_PLATFORM_STORAGE_BENCHMARKS.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/08_ACCEPTANCE_TEST_AND_FAILURE_MATRIX.md
negative_constraints:
  - Do not report schema, static wiring, concept UI, or an unavailable platform lane as runtime or performance success.
```

### SIR-018 - Platform-Specific Host Adapter Boundaries

```yaml
plan_unit_id: SIR-018
unit_type: platform_requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Native macOS, Windows, and Linux hosts implement the exact capability-probed I/O, watcher, pressure,
  filesystem, capture, tracing, topology, and compatibility boundaries in the platform-specific host-adapter
  section while retaining the one RuntimeResourceGovernor, portable fallbacks, explicit degraded/unavailable
  outcomes, and target-specific evidence. Unsourced mechanism names are not promoted into product contracts.
gui_related: false
depends_on: [SIR-004, SIR-015]
unblocks: [SIR-017]
acceptance_criteria:
  - macOS preserves native arm64 and QoS classification, thermal and Low Power reduction ordering, unified-memory accounting, FSEvents, same-volume APFS clone fallback, and source-appropriate capture with periodic full-keyframe and degraded-evidence truth.
  - Windows preserves completion-based asynchronous I/O without one thread per handle, ReadDirectoryChangesW plus optional USN recovery acceleration, control QoS plus maintenance EcoQoS, ETW/WPR/WPA-compatible tracing, total process-tree accounting, large-topology testing, and complete native operation with WSL off.
  - Linux preserves epoll and inotify with bounded overflow/reconnect reconciliation, PSI/cgroup pressure response, an explicit runtime/libc floor, bounded remote/NFS/SMB reconciliation, and evidence-gated optional io_uring, NUMA, and huge-page specialization.
  - IOCP, a particular Windows wait API, fanotify, timerfd, signalfd, and pidfd are not claimed as frozen packet requirements; a later adoption requires separate owner evidence and canonical amendment.
  - Static text or schema coverage earns no native runtime, performance, capture, filesystem, power, thermal, or recovery credit.
validation_surfaces: [future macOS Apple-Silicon and Low-Power tests, future native-Windows-without-WSL tests, future Linux minimum-runtime and remote-filesystem tests, future target-specific capture and tracing receipts]
risk_class: platform_adapter_mechanism_or_evidence_overclaim
reasoning_tier: high
context_scope: full_thread_platform_host_adapters
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future native platform adapters and tests]
node_compile_hint: {mode: full_thread_platform_host_adapter_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PKT-05/02_FINAL_DECISION_REGISTER.md:42-64
  - source_ref:packet:performance_final/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md:210-280
  - source_ref:packet:performance_final/03_RETURN_TO_PROJECT_SYNCING_AND_UPDATES_FULL_THREAD.md:193-219
preserved_exact_tokens: [native arm64, QoS, Low Power Mode, unified memory, FSEvents, APFS clones, ScreenCaptureKit, Accelerate, completion-based asynchronous I/O, ReadDirectoryChangesW, USN, EcoQoS, ETW, WPR, WPA, epoll, inotify, PSI, cgroup, io_uring, NUMA, huge-page]
negative_constraints:
  - Do not create a platform-local governor or a thread per Windows handle.
  - Do not report optional acceleration, a weaker platform substitute, or an unavailable lane as native proof.
  - Do not invent a frozen mechanism name that the admitted packet does not contain.
```

## Command Contract Closure Addendum - Connection Profiles And Installation Selection

This addendum closes only the owner-side machine contracts for six exact shared connection-profile commands and the exact installation-selection command retained by Touch Closure. It preserves the `EnvironmentConnectionSupervisor`, `IntegrationConnectionRegistry`, `InstallationResolver`, and `InstallationLifecycleManager` boundaries above and creates no parallel connection, provider, credential, installation, or authentication runtime.

The closed schema pointers are:

- connection request: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandRequest`;
- connection result: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandResult`;
- connection availability: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionAvailability`;
- shared permission: `Plans/shared_integration_runtime.schema.json#/$defs/SharedIntegrationPermissionDecision`;
- connection error: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandError`;
- installation-selection request/result/availability/error: `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandRequest`, `#/$defs/InstallationSelectCommandResult`, `#/$defs/InstallationSelectAvailability`, and `#/$defs/InstallationSelectCommandError`.

`cmd.integration.connection.add`, `.activate`, `.update`, `.test`, `.remove`, and `.open_details` carry exact provider/variant/connection/Project/route/Home Server/Host/Environment identity, expected connection and topology generations, permission snapshot, work and return context, and one closed `ConnectionMutation`. Add is the canonical inactive-draft creation route: it accepts typed non-secret configuration and optional broker/profile references, persists the draft in `IntegrationConnectionRegistry`, and can return a protected `auth_continuation_ref` without requiring a preexisting authenticated profile. Activate is separately CAS-fenced and requires the authenticated profile ref, minimum-capability requirement, and non-destructive verification evidence before an atomic registry transition to ready or ready-with-limits. Update requires a bounded patch ref. Test requires probe-policy and capability-requirement refs, returns currentness/freshness through availability plus probe evidence, and performs no write probe. Remove requires explicit confirmation plus credential and remote-data dispositions and never silently deletes provider or Backup data. Open Details for a persisted connection is read-only, bounded, redacted, and carries no `ObservableWork` mutation.

Provider-specific values remain data behind the `connection_kind`, `provider_id`, `provider_variant`, and non-secret setup/profile refs. This contract does not create provider command namespaces or provider-specific handlers. The semantic route remains Shared Integration Runtime connection supervision plus the named provider owner; the native handler route for these exact IDs is not materialized here.

`cmd.installation.select` selects one already discovered, verified, compatible installation for the exact product, Host, and Environment under inventory, installation, and topology generations. Its request fixes `acquisition_allowed=false` and `authentication_allowed=false`. Selection is not install, verify, update, repair, rollback, acquisition, or authentication and cannot silently continue either lifecycle. Initial provider-CLI acquisition remains explicit and separate.

Availability is separately typed. The central catalog and production-intent rows now exist, but all six exact connection IDs remain `handler_unavailable` until native dispatcher/handler registration and evidence exist; installation selection follows its own current central state. Permission decisions assert `credential_material_exposed=false` and `authority_widening=false`. Effects are receipt-only with `event_effect_policy=receipt_only_no_eventrecord_pending_event_authority`; no connection or installation EventRecord family, executable handler, provider effect, or runtime proof is inferred.

GUI consumers are Settings Integrations, setup/onboarding connection rows, installation pickers, palette, and bounded detail views. Headless owner reconciliation may test current connections only under exact scopes and policy; it cannot add, update, remove, open human details, acquire software, authenticate, or select an installation for the user. Reverse coverage must resolve exact control -> command ID -> typed contracts -> central catalog row -> production wiring row -> one native owner -> receipt before enablement.

`Plans/shared_integration_runtime_fixtures.json` covers all seven command request shapes and all seven return-settling results, the persisted first-time inactive draft/auth continuation, ACT-148 through ACT-153 normalization, draft-local details navigation, and negative command/action, configuration, capability, verification, patch/probe/confirmation, successful activation/test evidence, raw-token reference, details-work, acquisition/authentication, return settlement, credential exposure, and authority widening. Static validation is contract evidence only; stale-generation, restart/reconnect, provider failure, credential broker, destructive disposition, immutable-image, native-platform, and recovery behavior remain future runtime evidence.

ContractRef: SchemaID:pm.shared_integration_runtime.command_contracts.v1, ContractName:Plans/Shared_Integration_Runtime.md#4, ContractName:Plans/Release_Supply_Chain.md

### SIR-019 - Shared Connection-Profile Command Contracts

```yaml
plan_unit_id: SIR-019
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Six exact cmd.integration.connection commands share a closed request, result, availability, permission,
  disabled-reason, and error contract with exact provider, connection, Project, route, Server, Host,
  Environment, connection-generation, and topology-generation fencing; provider-specific values remain typed
  data and owner schema closure does not register a command, handler, event, or runtime path.
gui_related: true
gui_classification_reason: Draft creation, activation, update, test, remove, and details are visible integration-profile controls.
depends_on: [SIR-005, SIR-006, SIR-010]
unblocks: []
acceptance_criteria:
  - All six exact IDs have one positive request and result fixture and share the exact schema pointers in this addendum.
  - Add persists an inactive draft and can return a protected authentication continuation without a preexisting profile; activate requires current authenticated-profile, capability-requirement, and verification-evidence refs.
  - Remove requires confirmation and explicit credential/remote-data dispositions; details has no mutation work.
  - Raw credentials, provider-specific command namespaces, undeclared handlers, and event producers are absent.
validation_surfaces: [Plans/shared_integration_runtime_fixtures.json, future central catalog/wiring and native connection fixtures]
risk_class: shared_connection_command_phantom_closure
reasoning_tier: high
context_scope: shared_connection_profile_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json]
node_compile_hint: {mode: shared_connection_profile_commands, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:IRT-001, source_ref:egolite-requirement:IRT-011, source_ref:egolite-requirement:IRT-012, source_ref:egolite-requirement:IRT-013, source_ref:egolite-requirement:IRT-014, source_ref:egolite-requirement:IRT-015, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:387-412]
negative_constraints:
  - Do not register or enable an exact command from owner prose or schema alone.
  - Do not copy raw credentials, silently delete provider data, or create a provider-local connection runtime.
```

### SIR-020 - Verified Installation Selection Contract

```yaml
plan_unit_id: SIR-020
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  cmd.installation.select binds one already discovered, verified, compatible installation to the exact product,
  Host, Environment, inventory generation, installation generation, topology generation, provenance, and
  compatibility proof while explicitly forbidding acquisition and authentication.
gui_related: true
gui_classification_reason: Installation selection is a visible setup and provider-row choice.
depends_on: [SIR-003, SIR-004]
unblocks: []
acceptance_criteria:
  - The request fixes acquisition_allowed=false and authentication_allowed=false.
  - Successful selection returns non-null activation proof, the exact continuation, and a caller return settlement.
  - Ambiguous, unverified, incompatible, stale, wrong-topology, or policy-denied candidates fail closed with typed availability/error state.
  - Selection has no undeclared alias, native handler, EventRecord producer, or runtime-success claim.
validation_surfaces: [Plans/shared_integration_runtime_fixtures.json, future inventory-generation, topology, immutable-image, activation, and recovery fixtures]
risk_class: installation_selection_acquisition_or_auth_conflation
reasoning_tier: high
context_scope: verified_installation_selection
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json]
node_compile_hint: {mode: verified_installation_selection, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:IRT-003, source_ref:egolite-requirement:IRT-005, source_ref:egolite-requirement:IRT-006, source_ref:egolite-requirement:IRT-007, source_ref:egolite-requirement:IRT-008, source_ref:egolite-requirement:IRT-009, source_ref:egolite-requirement:IRT-010, source_ref:egolite-requirement:IRT-013, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:361-376]
negative_constraints:
  - Do not acquire, verify, update, repair, rollback, or authenticate as a side effect of selection.
  - Do not infer native activation success from static contract validation.
```

## Retained PKT-04 Candidate Inventory (Deferred, Non-Emitting, Non-Canonical)

Every name below is retained exactly as packet inventory with `canonical=false`, `registered=false`, `emits_eventrecord=false`, `disposition=deferred_non_emitting_event_candidate`, and reason `event_authority_and_native_producer_contract_absent`. Retention does not add an EventRecord family, registry entry, producer, handler, or runtime proof.

- Installation: `installation.discovered`, `installation.selected`, `installation.ownership_proven`, `installation.ambiguous`, `installation.install_requested`, `installation.download_started`, `installation.staged`, `installation.verified`, `installation.activated`, `installation.update_available`, `installation.update_deferred`, `installation.update_started`, `installation.update_completed`, `installation.repair_started`, `installation.repair_completed`, `installation.rollback_started`, `installation.rollback_completed`, `installation.recovery_required`, `installation.external_change_detected`.
- Connection: `integration.connection.added`, `integration.connection.tested`, `integration.connection.updated`, `integration.connection.removed`, `integration.connection.degraded`.
- Capability: `capability.requirement.detected`, `capability.provisioning_started`, `capability.ready`, `capability.blocked`, `capability.continuation_rejected`.

Adjacent installation command candidates are also retained without admission:

| Exact candidate | Disposition | Reason |
|---|---|---|
| `cmd.installation.install` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.update` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.repair` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.rollback` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.verify` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.rescan` | `deferred_noncanonical_candidate` | Owner contract, central registration, native route, and runtime evidence are absent. |
| `cmd.installation.check_updates` | `deferred_noncanonical_candidate` | Owner contract, central registration, native route, and runtime evidence are absent. |
| `cmd.installation.remove` | `deferred_noncanonical_candidate` | Destructive ownership/data-disposition contract and native route are absent. |
| `cmd.installation.open_logs` | `deferred_noncanonical_candidate` | Bounded redacted projection contract and native route are absent. |
| `cmd.installation.update_policy.set` | `deferred_noncanonical_candidate` | Policy owner, permission, and persistence contract are absent. |
| `cmd.installation.attach_external` | `deferred_noncanonical_candidate` | External ownership/provenance binding contract and native route are absent. |
| `cmd.installation.detach_external` | `deferred_noncanonical_candidate` | External ownership/data-disposition contract and native route are absent. |
| `cmd.installation.open_details` | `deferred_noncanonical_candidate` | Bounded redacted projection contract and native route are absent. |

For the six closed commands, every result now settles the initiating return context. A successful connection test must return non-null probe evidence, and a successful selected installation must return non-null activation proof while echoing its continuation and caller settlement. These are static result obligations; no provider probe, focus restoration, installation activation, or continuation execution is claimed.

### SIR-021 - Installation Ownership Maintenance Coalescing Persistence And Credential Attachments

```yaml
plan_unit_id: SIR-021
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Externally and package-manager managed installations default to check-and-notify; Puppet Master may mutate them only
  under a current explicit ownership-compatible action or delegation. Identical provisioning or update requests across
  Projects and Clients coalesce at the logical installation-operation layer only when every effect, target, artifact,
  authority, and policy fingerprint matches; one attempt fans out separately current results without sharing caller
  authority, and conflicting requests never coalesce. The PM Tool Store and isolated profiles use explicit durable
  roots that survive image and pod replacement and require reconciliation before readiness. Shared Runtime consumes
  rather than redefines the common AuthenticationProfile and CredentialAttachment contract, carrying broker refs only
  and enforcing exact provider, Host, Environment, repository, operation/capability, expiry, revocation, and
  owner-generation attenuation.
gui_related: true
gui_classification_reason: Ownership, check/update state, shared work, persistence, and credential attachment health are visible setup state.
depends_on: [SIR-003, SIR-004, SIR-006, SIR-007, SIR-011, SIR-020, MA-045]
unblocks: [SCS-007]
acceptance_criteria:
  - IRT-008 makes external and package-manager ownership check-and-notify by default; automatic PM maintenance, Auto/On, demand, successful discovery, and baseline presence cannot mutate without a current explicit action or reviewed delegation.
  - IRT-008 positive fixtures separate PM-managed automatic maintenance, external notification, one-operation consent, and delegated maintenance; negatives reject automatic download/package-manager/configuration/activation/removal and unknown-owner mutation.
  - IRT-009 coalesces one identical provisioning/update attempt across Projects/Clients only when operation kind, desired effect, product/package/version/channel, source/provenance/artifact, exact Host/Environment, ownership/delegation generation, and policy generation match.
  - IRT-009 preserves per-waiter permission, approval, continuation, cancellation, currentness, and result; negatives vary each fingerprint/authority dimension, cancel one of two waiters, and submit conflicting install/update/remove states to prove no authority or cancellation fanout.
  - IRT-010 keeps Tool Store and isolated-profile roots on declared durable volumes across image and pod replacement, with product/profile isolation and restart/reconciliation receipts before readiness.
  - IRT-010 positive fixtures replace an image and a pod while retaining verified tool/profile generations; negatives cover missing/wrong/stale mount, corrupt or partial root, cross-profile home reuse, silent reacquisition, and raw secret material.
  - IRT-011 consumes the common AuthenticationProfile/CredentialAttachment contract and attaches only non-secret refs under exact provider/Host/Environment/repository/operation-capability scopes, expiry, revocation, owner generation, and broker enforcement.
  - IRT-011 negatives reject raw secret fields, expired/revoked/stale refs, provider/profile mismatch, Host/Environment/repository mismatch, operation/capability widening, and treating profile attachment as authentication/readiness proof.
  - Static schema/fixture success does not prove package-manager behavior, acquisition, update, persistence across replacement, broker isolation, or runtime recovery.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, focused Egolite remediation validator, future ownership-maintenance positive/negative fixtures, future multi-Project/multi-Client coalescing matrix, future image/pod replacement recovery matrix, future broker attenuation and secret-isolation tests]
risk_class: installation_ownership_mutation_or_persistence_secret_failure
reasoning_tier: high
context_scope: integration_installation_and_credential_closure
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Multi-Account_Connection_Spec.md, future InstallationLifecycleManager and CapabilityProvisioner, future credential-attachment enforcement]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:IRT-008, source_ref:egolite-requirement:IRT-009, source_ref:egolite-requirement:IRT-010, source_ref:egolite-requirement:IRT-011]
preserved_exact_tokens: [check-and-notify, coalesce identical provisioning/update operations, Tool Store, isolated profiles, image replacement, pod replacement, AuthenticationProfile, CredentialAttachment]
negative_constraints:
  - Do not mutate an externally managed installation under an automatic PM maintenance policy.
  - Do not use StreamCoalescer, equal display text, or partial fingerprints as installation-operation deduplication authority.
  - Do not claim readiness after image/pod replacement until exact durable-root reconciliation succeeds.
  - Do not re-own AuthenticationProfile lifecycle, provider authentication policy, or credential custody.
  - Do not persist raw credential material in Tool Store, profiles, attachments, records, or receipts.
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#4.7, ContractName:Plans/Shared_Integration_Runtime.md#4.8, ContractName:Plans/Shared_Integration_Runtime.md#4.9, ContractName:Plans/Shared_Integration_Runtime.md#4.10, ContractName:Plans/Multi-Account_Connection_Spec.md

### SIR-023 - Human Step Projection Consumption

```yaml
plan_unit_id: SIR-023
unit_type: consumer_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  ObservableWork consumes the owner-authored HumanStepProjection without re-owning Browser or test semantics. It
  preserves stable step identity/revision, bounded user_step_label/detail, requested/effective state, freshness,
  owner receipt refs, and terminal disposition so Chat, Testing, Watch, and timeline projections reconcile the same
  step. Labels remain secret/path/raw-ID/code-free and grant no authority.
gui_related: true
depends_on: [SIR-007, SIR-015, SMPFS-154]
unblocks: []
acceptance_criteria:
  - All five projections retain one stable step identity and revision rather than copying unrelated prose.
  - Stale or missing owner evidence is visible and cannot become a completed step.
  - Client focus, attachment, disconnect, or projection suppression does not cancel server-owned work.
  - Static fixtures do not prove producer emission or consumer rendering.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, focused Egolite remediation validator]
risk_class: human_step_projection_divergence
reasoning_tier: high
context_scope: observable_human_step_projection
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future ObservableWork projector]
node_compile_hint: {mode: shared_runtime_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:HBU-013]
negative_constraints: [Do not re-own Browser or test outcomes., Do not use human copy as payload or authority.]
```

## Server/WAN exact-command owner closure addendum

This addendum supersedes the retained-candidate disposition table above for the exact 91 packet rows enumerated here. It closes the Shared Integration Runtime owner side only: 44 exact commands, 14 typed local UI actions, and 33 packet aliases. Central registration, shared wiring, Touch Closure, PM7/native GUI wiring, and executable native handlers remain separate owner work and are not implied by these static contracts.

`Plans/shared_integration_runtime_expansion_contracts.schema.json` is the single DRY typed source for the four semantic command families. Each family has one request, result, error, availability, and permission-decision contract. `Plans/shared_integration_runtime_expansion_fixtures.json` preserves the packet source line, intended semantics, exact owner component, sole handler, and complete GUI-consumer set for every row. Every new command starts as `handler_unavailable` with no native-handler evidence. Results settle the initiating return context exactly; asynchronous work uses `ObservableWork`; restart reconciliation and current generation are mandatory before success; raw secret material, authority widening, stale-success, conflicting-generation success, duplicate handlers, and inferred runtime success are forbidden. Receipts and projections are the only admitted evidence until Event Authority separately admits an exact domain-event family.

### Exact 44-command inventory

| Exact command | Sole handler target | Intended GUI consumers |
|---|---|---|
| `cmd.credential_attachment.revoke` | `handlers::credential_broker::attachment_revoke` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.revoke_active` | `handlers::credential_broker::attachment_revoke_active` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.test` | `handlers::credential_broker::attachment_test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.transfer.apply` | `handlers::credential_broker::attachment_transfer_apply` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.transfer.preview` | `handlers::credential_broker::attachment_transfer_preview` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.add` | `handlers::credential_broker::source_add` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.remove` | `handlers::credential_broker::source_remove` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.test` | `handlers::credential_broker::source_test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.execution_environment.attach` | `handlers::execution_topology::environment_attach` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.discover` | `handlers::execution_topology::environment_discover` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.provision` | `handlers::execution_topology::environment_provision` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.remove` | `handlers::execution_topology::environment_remove` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.repair` | `handlers::execution_topology::environment_repair` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.resource_policy.apply` | `handlers::execution_topology::environment_resource_policy_apply` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.resource_policy.preview` | `handlers::execution_topology::environment_resource_policy_preview` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.restart` | `handlers::execution_topology::environment_restart` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.rollback` | `handlers::execution_topology::environment_rollback` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.select` | `handlers::execution_topology::environment_select` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.start` | `handlers::execution_topology::environment_start` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.stop` | `handlers::execution_topology::environment_stop` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.update` | `handlers::execution_topology::environment_update` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.verify` | `handlers::execution_topology::environment_verify` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.capabilities.refresh` | `handlers::execution_topology::host_capabilities_refresh` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.disable` | `handlers::execution_topology::host_disable` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.drain` | `handlers::execution_topology::host_drain` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.enable` | `handlers::execution_topology::host_enable` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.register` | `handlers::execution_topology::host_register` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.remove` | `handlers::execution_topology::host_remove` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.set_default` | `handlers::execution_topology::host_set_default` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.test` | `handlers::execution_topology::host_test` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.installation.attach_external` | `handlers::installation::attach_external` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.detach_external` | `handlers::installation::detach_external` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.remove` | `handlers::installation::remove` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.project.execution_host.select` | `handlers::execution_topology::execution_host_select` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.execution_policy.set` | `handlers::execution_topology::execution_policy_set` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.home_server.set` | `handlers::execution_topology::home_server_set` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.add` | `handlers::execution_topology::source_location_add` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.remove` | `handlers::execution_topology::source_location_remove` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.set_primary` | `handlers::execution_topology::source_location_set_primary` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.test` | `handlers::execution_topology::source_location_test` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.update` | `handlers::execution_topology::source_location_update` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.provider_binding.copy` | `handlers::credential_broker::binding_copy` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.provider_binding.resolve_on_destination` | `handlers::credential_broker::binding_resolve_on_destination` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.tool_package.approve_license` | `handlers::installation::package_approve_license` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |

### Typed local UI actions

These packet command-shaped tokens are not domain commands. The `ui.*` identity is the typed owner-local action; it has current projection/focus/accessibility/return state, no semantic-domain handler, no command registration, and no domain-event emission.

| Packet token | Typed local action | Intended GUI consumers |
|---|---|---|
| `cmd.auth_session.close_secure_browser` | `ui.auth_session.close_secure_browser` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.copy_device_code` | `ui.auth_session.copy_device_code` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_details` | `ui.auth_session.open_details` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.credential_attachment.open_consumers` | `ui.credential_attachment.open_consumers` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.open_details` | `ui.credential_attachment.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.open_details` | `ui.credential_source.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.execution_environment.open_details` | `ui.execution_environment.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.open_logs` | `ui.execution_environment.open_logs` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.open_details` | `ui.execution_host.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.installation.open_details` | `ui.installation.open_details` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.open_logs` | `ui.installation.open_logs` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.project.source_location.open_details` | `ui.project.source_location.open_details` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.tool_package.open_provenance` | `ui.tool_package.open_provenance` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.tool_package.review_license` | `ui.tool_package.review_license` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |

### Pre-policy alias normalization

The 33 packet aliases normalize to their exact target before availability, permission, policy, or dispatch. The source spelling is never registered, has no peer handler or peer availability, and may be preserved only as compatibility/source receipt identity.

| Packet alias | Exact canonical target | Intended GUI consumers |
|---|---|---|
| `cmd.auth_session.cancel` | `cmd.authentication.cancel` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_official_page` | `cmd.auth_profile.open_official_page` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_secure_browser` | `cmd.authentication.start` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_secure_cli` | `cmd.authentication.start` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.resume_callback` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.retry` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.start` | `cmd.authentication.start` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.submit_redirect` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.submit_returned_code` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.cluster_connection.add` | `cmd.integration.connection.add` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.disable` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.edit` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.open_details` | `cmd.integration.connection.open_details` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.refresh_capabilities` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.remove` | `cmd.integration.connection.remove` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.select` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.test` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.git_credential_binding.test` | `cmd.integration.connection.test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.installation.rescan` | `cmd.tool.discover` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.registry_connection.add` | `cmd.integration.connection.add` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.edit` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.open_details` | `cmd.integration.connection.open_details` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.remove` | `cmd.integration.connection.remove` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.test` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_credential_binding.test` | `cmd.integration.connection.test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.runtime_connection.add` | `cmd.integration.connection.add` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.disable` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.edit` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.open_details` | `cmd.integration.connection.open_details` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.remove` | `cmd.integration.connection.remove` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.select` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.test` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.ssh_credential_binding.test` | `cmd.integration.connection.test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |

### SIR-024 - Credential Attachment And Provider Binding Commands

```yaml
plan_unit_id: SIR-024
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  CredentialBroker owns the ten exact credential-attachment, credential-source, and provider-binding operations in
  the 44-command inventory. Requests carry references only, exact owner/topology generations, idempotency,
  permission and return context; results report requested/effective state, currentness, receipt refs, and exact return.
gui_related: true
depends_on: [SIR-003, SIR-006, SIR-019, SIR-021]
unblocks: []
acceptance_criteria:
  - All ten commands use IntegrationCredential request/result/error/availability/permission contracts and the sole handlers listed above.
  - Transfer never copies secret bytes; it uses compatible references or a separately encrypted user-controlled recovery-envelope reference.
  - Attachment test remains distinct from connection reachability, and revoke-active never deletes the attachment definition.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: credential_scope_or_secret_material_leak
reasoning_tier: high
context_scope: integration_credential_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future AuthenticationBroker and CredentialBroker]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 33-41 and 134-135]
negative_constraints: [No raw secret bytes., No connection-test substitution., No implicit authority widening.]
```

### SIR-025 - Execution Host And Environment Commands

```yaml
plan_unit_id: SIR-025
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  ExecutionTopologyRegistry owns the 22 exact Host and Environment operations in the inventory, preserves immutable
  identity and generation fences, routes resource policy through RuntimeResourceGovernor, and reconciles restart,
  rollback, drain, removal, and active-work races before reporting effective state.
gui_related: true
depends_on: [SIR-004, SIR-005, SIR-007, SIR-015, SIR-017]
unblocks: []
acceptance_criteria:
  - All 22 commands use ExecutionTopology request/result/error/availability/permission contracts and the sole handlers listed above.
  - Success cannot survive stale owner, topology, or operation generations; restart success requires reconciliation evidence.
  - Remove, stop, drain, rollback, and default selection return explicit active-work and data dispositions.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: topology_identity_race_or_unsettled_work
reasoning_tier: high
context_scope: execution_topology_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future ExecutionTopologyRegistry]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 51-75]
negative_constraints: [No inferred success., No implicit Project Home Server change., No hidden work cancellation.]
```

### SIR-026 - Project Host And Source Location Commands

```yaml
plan_unit_id: SIR-026
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  ProjectHostBinding and SourceLocationRegistry own the eight exact Project topology operations in the inventory.
  Home Server, execution Host, execution policy, and Source Location are separate typed bindings; changing one does
  not silently change routes, move a Project, delete external source payloads, or select another binding.
gui_related: true
depends_on: [SIR-004, SIR-015, SIR-025]
unblocks: []
acceptance_criteria:
  - All eight commands use ProjectTopology request/result/error/availability/permission contracts and the sole handlers listed above.
  - Add/update/remove/set-primary/test settle exact Project and Source Location identities under current generations.
  - Removing a binding never implies deletion of the external source payload.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: project_topology_binding_or_external_data_loss
reasoning_tier: high
context_scope: project_topology_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future ProjectHostBinding and SourceLocationRegistry]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 106-108 and 122-127]
negative_constraints: [No implicit Project Move., No implicit route change., No external payload deletion.]
```

### SIR-027 - Installation Ownership Extension Commands

```yaml
plan_unit_id: SIR-027
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  InstallationLifecycleManager owns attach-external, detach-external, remove, and tool-package license approval as
  distinct exact commands. External provenance and external data remain externally owned; destructive disposition,
  active dependencies, reviewed package/version/license identity, and exact return are explicit.
gui_related: true
depends_on: [SIR-010, SIR-020, SIR-021]
unblocks: []
acceptance_criteria:
  - All four commands use InstallationOwnership request/result/error/availability/permission contracts and the sole handlers listed above.
  - Detach does not delete external data, and remove requires explicit ownership/dependency/data disposition.
  - License approval is valid only for the exact reviewed package, version, provenance, and terms generation.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: installation_ownership_or_license_mismatch
reasoning_tier: high
context_scope: installation_ownership_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future InstallationLifecycleManager]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 84-88 and 154]
negative_constraints: [No silent external mutation., No implicit external data deletion., No stale license approval.]
```

### SIR-028 - Local Action And Compatibility Normalization Boundary

```yaml
plan_unit_id: SIR-028
unit_type: boundary_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Fourteen presentation and projection behaviors remain typed owner-local UI actions, while 33 packet spellings are
  compatibility inputs that normalize to exact canonical commands before permission and dispatch. Neither group
  creates a peer semantic command, handler, availability owner, or domain event.
gui_related: true
depends_on: [SIR-006, SIR-019, SIR-020, SIR-024, SIR-025, SIR-026, SIR-027]
unblocks: []
acceptance_criteria:
  - Every local action preserves current projection, accessibility description, focus, and exact return settlement without command registration.
  - Protected-auth local actions remain human-only and never expose protected browser content to agents or adapters.
  - Every alias normalizes before availability, permission, policy, and handler dispatch and inherits only its exact target's behavior.
  - Fixtures cover all 47 rows and reject local peer handlers, local domain events, source registration, late normalization, and wrong targets.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: duplicate_command_owner_or_protected_ui_boundary_bypass
reasoning_tier: high
context_scope: sir_local_action_and_alias_normalization
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future owner-local UI controllers, future compatibility normalizer]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication SIR-owned typed_local_ui_action and approved_alias_to_exact rows]
negative_constraints: [No source alias registration., No peer handler., No local domain event., No protected content inspection.]
```

## Shared Connection Central-Route Binding Addendum - 2026-09-01

The central command/wiring closure assigns the six exact shared connection commands to one future `SharedConnectionProfileSupervisor` route each: `cmd.integration.connection.add` -> `handlers::integration_connection::add`, `.activate` -> `handlers::integration_connection::activate`, `.update` -> `handlers::integration_connection::update`, `.test` -> `handlers::integration_connection::test`, `.remove` -> `handlers::integration_connection::remove`, and `.open_details` -> `handlers::integration_connection::open_details`. Each consumes the existing `IntegrationConnectionCommandRequest|IntegrationConnectionCommandResult|IntegrationConnectionCommandError|IntegrationConnectionAvailability|SharedIntegrationPermissionDecision` family from `Plans/shared_integration_runtime.schema.json`. Provider-specific values remain typed data and no provider-specific peer handler is created. These are planned targets only; all six remain `handler_unavailable`, receipt-only/no-new-EventRecord, and unsupported by native execution evidence.

### SIR-029 - Shared Connection Sole Future Handlers

```yaml
plan_unit_id: SIR-029
unit_type: command_binding
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: The six exact cmd.integration.connection commands each have one planned SharedConnectionProfileSupervisor handler target over the existing owner-DRY connection command family; provider-specific values remain typed data and static binding creates no native implementation.
gui_related: true
gui_classification_reason: Settings Integrations, Product Onboarding owner setup, Doctor, connection managers, detail views, and palette/API consumers expose these commands and their exact disabled reasons.
depends_on: [SIR-019, SIR-024, SIR-025, SIR-026]
unblocks: []
acceptance_criteria:
  - Central catalog and production-intent wiring use exactly handlers::integration_connection::add, activate, update, test, remove, and open_details with the existing request/result schema pointers.
  - Draft-create/add, activate, update, test, remove, and details retain their distinct closed mutations, permissions, generation fences, receipt/ObservableWork rules, and exact return settlement.
  - Missing executable Rust and provider-owner evidence keeps every command handler_unavailable and emits no unregistered EventRecord.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
risk_class: shared_connection_route_split_or_phantom_handler
reasoning_tier: high
context_scope: shared_connection_central_binding
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: command_binding_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:387-391, source_ref:server-command-gap-adjudication:rows-23-30, source_ref:server-command-gap-adjudication:row-76, source_ref:server-command-gap-adjudication:rows-136-141, source_ref:server-command-gap-adjudication:rows-143-149, source_ref:server-command-gap-adjudication:row-153, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#repair_targets:cmd.integration.connection.*]
negative_constraints:
  - Do not create provider-specific peer common commands or handlers.
  - Do not treat planned handler paths as native, provider, network, authentication, or runtime proof.
```

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 1 previously unbound primary command. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.installation.select` | `handlers::installation::select` | `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandRequest` -> `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandResult` | `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandError` / `Plans/shared_integration_runtime.schema.json#/$defs/SharedIntegrationPermissionDecision` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.installation.select`.

Exact sole future handler set: `handlers::installation::select`.

### SIR-030 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: SIR-030
unit_type: command_binding
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Shared Integration Runtime owns exactly 1 additional central command route. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 1 command and their exact disabled reasons.
depends_on: [SIR-020, SIR-029]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 1-command set maps one-to-one to the table's sole future handler target and no competing handler path exists.
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
- Plans/Shared_Integration_Runtime.md
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

## Expansion Compatibility Materialization Addendum - 2026-09-01

### SIR-031 - DRY Expansion Compatibility And Local-Action Materialization

```yaml
plan_unit_id: SIR-031
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  shared_integration_runtime_expansion_contracts.schema.json remains the single
  DRY state-machine source for the server-gap expansion. Its fixtures close 44
  canonical command records, 14 typed local UI-action records, 44 disabled-reason
  records, and 33 pre-dispatch compatibility normalizations. Existing owner schemas
  expose 40 command compatibility records and all 14 local-action aliases through
  narrow external $ref composition; they do not copy the shared state machines or
  transfer domain ownership to Shared Integration Runtime. Local actions are
  deterministic, presentation-only, non-domain, non-persistent, and authority-free.
  Protected-auth actions additionally remain human-only, non-recordable,
  non-inspectable, unavailable to agents and adapters, and incapable of exposing
  protected content. Remote-Link test normalizes under RAS-013 before validation.
gui_related: true
gui_classification_reason: The materialized aliases provide typed requests, exact disabled reasons, and deterministic returns for real Settings, Onboarding, Doctor, and PMConcept7 consumers.
split_recommended: false
depends_on: [SIR-028, SIR-030, RAS-013, SMPFS-157]
unblocks: [CV-326, ATS-042, 0PI-068]
acceptance_criteria:
  - "The expansion fixture pack contains exactly 44 command cases, 14 typed local UI actions, 44 disabled-reason records, and 33 alias normalizations."
  - "Owner compatibility validation accepts exactly 240 command records and 28 owner-local records while retaining the expansion sidecar as the sole shared state-machine source."
  - "All 168 schema-bearing adjudication rows resolve and the 3 rejected rows remain action-free; unresolved local and other proposed schema references both equal zero."
  - "Local actions cannot install, authenticate, browse protected content, access files, dispatch providers, persist state, emit domain events, or claim a domain handler."
  - "ProtectedAuth local actions require human_only=true and false recording, inspection, agent, adapter, persistence, and protected-content-exposure capabilities."
  - "Compatibility tokens normalize before permission, availability, typed validation, dispatch, receipts, events, or persistence and receive no peer handler or production row."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plans-verify.py validate-server-command-gap
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plan-index.py validate
risk_class: copied_expansion_state_machine_or_local_authority_widening
reasoning_tier: high
context_scope: server_gap_expansion_compatibility_materialization
implementation_surfaces:
  - Plans/Shared_Integration_Runtime.md
  - Plans/shared_integration_runtime_expansion_contracts.schema.json
  - Plans/shared_integration_runtime_expansion_fixtures.json
  - Plans/shared_integration_runtime.schema.json
  - Plans/shared_integration_runtime_fixtures.json
  - Plans/shared_runtime_command_contracts.schema.json
  - Plans/shared_runtime_command_contract_fixtures.json
  - Plans/protected_auth_browser_contracts.schema.json
  - Plans/protected_auth_browser_contract_fixtures.json
  - Plans/remote_access_system_contracts.schema.json
  - Plans/remote_access_system_contract_fixtures.json
node_compile_hint: {mode: shared_expansion_external_ref_materialization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#sir-028---local-action-and-compatibility-normalization-boundary
  - Plans/server_command_gap_adjudication.json
  - Plans/Remote_Access_System.md#ras-013---remote-link-test-pre-dispatch-normalization
preserved_exact_tokens: [shared_integration_runtime_expansion_contracts.schema.json, human_only, content_recording_allowed, content_inspection_allowed, agent_access_allowed, adapter_access_allowed, persistence_allowed, protected_content_exposed]
negative_constraints:
  - "Do not copy the expansion state machines into owner schemas; use narrow external-reference composition."
  - "Do not promote a typed local UI action into a domain command, handler, event, persistence write, or capability grant."
  - "Do not let agents, adapters, capture, recording, inspection, export, replay, or restore cross the protected-auth boundary."
  - "Do not claim native implementation, network behavior, security certification, or readiness from schema and fixture closure."
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Remote_Access_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Commands_System.md]
```

## Forge, Backup, Automation, And Embedded-Connector Consumer Addendum - 2026-09-01

Shared Integration Runtime remains the sole owner of the durable command outbox, host-local `RuntimeResourceGovernor`, `ObservableWork`, `LeaseCoordinator`, shared authentication/profile references, and exact-return continuation primitives. Forgejo, Gitea, the provider-neutral `repository_automation` shell, Backup destinations, and the embedded Go tsnet connector consume those primitives by reference. Their semantic owners retain provider capability, `AutomationBinding`, Backup scheduling/crypto/repository behavior, and connector identity/process/IPC state. No peer shared supervisor, auth broker, scheduler, updater, or provider capability pool is created here.

`Plans/shared_integration_runtime.schema.json#/$defs/SharedIntegrationConsumerProjection` carries only owner refs, current generations, shared-primitive refs, and truthful availability. `handler_unavailable` and `read_only` never authorize mutation; `protected` requires a human-only handoff. A Gitea or Forgejo API limit does not erase an independently ready Git transport. `repository_automation` requires its own `automation_binding_ref` and never inherits automation authority from a repository `ForgeBinding`. A Backup destination carries an exact destination/profile/continuation ref without making Shared Integration Runtime the Backup owner. The embedded connector carries one Remote-Access-owned `connector_identity_ref` per PM Server; it is never Project-, WSL-, runner-, replica-, or Client-scoped, and its secret state never enters this projection.

Every projection is receipt/projection-only, event-silent, and marked `runtime_evidence_claimed=false`. Static schema acceptance does not establish a native handler, provider call, cloud account, OAuth registration, connector process, network route, secret-isolation result, or runtime success.

### SIR-032 - Post-Integration Shared Consumer Boundary

```yaml
plan_unit_id: SIR-032
unit_type: integration_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Forgejo, Gitea, repository_automation, Backup destinations, and the embedded Go tsnet connector consume the one shared outbox, governor, ObservableWork, lease, authentication-profile/credential-attachment, and exact-return primitives through owner references. Provider, automation, Backup, and connector semantics remain with their named owners; handler_unavailable, read_only, and protected states fail closed and static projections claim no runtime evidence.
gui_related: true
gui_classification_reason: Settings, Actions & Pipelines, Data Backup and Retention, Remote Access, Onboarding, and Doctor render these exact unavailable, read-only, and protected states.
depends_on: [SIR-005, SIR-006, SIR-007, SIR-008, SIR-011, SIR-012, SIR-031]
unblocks: []
acceptance_criteria:
  - Forgejo and Gitea remain distinct provider identities while consuming one shared authentication/profile and connection lifecycle.
  - repository_automation requires an independent AutomationBinding and never derives automation authority from ForgeBinding or the selected shell.
  - Backup consumes outbox, governor, ObservableWork, lease, and exact auth continuation refs without transferring scheduler, crypto, repository, restore, or destination ownership.
  - The embedded connector carries exactly one Remote-Access-owned connector identity per PM Server and never a Project/WSL/environment/runner/replica/session identity.
  - handler_unavailable and read_only projections have mutation_dispatch_allowed=false; protected projections require the human-only boundary and expose no protected content to agents or adapters.
  - All records use receipt_projection_only_no_unregistered_eventrecord and runtime_evidence_claimed=false.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, python3 scripts/pm-new-contracts-verify.py]
risk_class: shared_consumer_owner_drift_or_false_availability
reasoning_tier: high
context_scope: forge_backup_automation_connector_shared_consumption
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json]
node_compile_hint: {mode: static_owner_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/01_AUTHORITY_SCOPE_AND_PRESERVATION.md:55-63
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:31-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/08_CLOUD_DESTINATIONS_AND_SIGN_IN.md:31-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md:31-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/15_DRY_WIRING_AND_PLAN_OWNERS.md:7-45
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md:8-19
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md:113-127
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md:66-78
preserved_exact_tokens: [Forgejo, Gitea, repository_automation, AutomationBinding, handler_unavailable, read_only, protected, AuthBrowserSession, pm-tailnet-connector]
negative_constraints:
  - Do not create a peer shared supervisor, governor, ObservableWork system, auth broker, Backup scheduler, connector owner, or provider capability owner.
  - Do not infer Git transport availability from hosting API availability or automation authority from repository hosting.
  - Do not expose connector state, credentials, auth URLs/codes, protected content, or raw provider errors.
  - Do not claim native/runtime/provider/network/security evidence from static contracts or fixtures.
```

### SIR-033 - Post-Integration Auth Candidate Normalization

```yaml
plan_unit_id: SIR-033
unit_type: compatibility_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Post-integration packet candidates cmd.auth_session.resume, cmd.auth_session.submit_code, and cmd.credential.add normalize before permission and dispatch to cmd.authentication.resume, cmd.auth_profile.submit_code, and cmd.credential_source.add respectively. The source spellings are unregistered compatibility inputs with no peer handler, availability, persistence, EventRecord, secret payload, or protected-browser authority.
gui_related: false
gui_classification_reason: This is pre-dispatch identity normalization and owner routing, not GUI implementation.
depends_on: [SIR-028, SIR-031]
unblocks: []
acceptance_criteria:
  - The expansion sidecar contains exactly 36 approved aliases and 94 total rows while retaining 44 canonical commands and 14 typed local actions.
  - Each of the three source tokens normalizes to one exact existing owner command before permission, availability, validation, dispatch, receipt, event, or persistence handling.
  - cmd.auth_profile.verify and cmd.auth_profile.sign_out remain exact Multi-Account owner commands and are not duplicated or aliased here.
  - AuthBrowserSession content and raw submitted code/credential material are absent from alias records and unavailable to agents and adapters.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, python3 scripts/pm-new-contracts-verify.py]
risk_class: duplicate_auth_handler_or_secret_bearing_alias
reasoning_tier: high
context_scope: post_integration_auth_candidate_reconciliation
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json]
node_compile_hint: {mode: compatibility_normalization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:124-131
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-45
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/coverage_verification.md:84-93
preserved_exact_tokens: [cmd.auth_session.resume, cmd.auth_session.submit_code, cmd.credential.add, cmd.authentication.resume, cmd.auth_profile.submit_code, cmd.credential_source.add]
negative_constraints:
  - Do not register any source alias or create a peer handler, availability row, persistence identity, or EventRecord.
  - Do not carry raw codes, tokens, credentials, URLs, cookies, or protected AuthBrowserSession content through normalization.
```

### SIR-034 - Backup Shared Primitives And Common External-Effect Envelope

```yaml
plan_unit_id: SIR-034
unit_type: integration_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  BackupCoordinator and RestoreCoordinator consume, without re-owning, the one durable command outbox, host-local RuntimeResourceGovernor, ObservableWork, LeaseCoordinator, AuthenticationBroker/CredentialBroker, protected human session, and exact-return continuation. Every external-effect request carries common non-secret operation/request, actor/Client, Home Server, Project, repository/source-location/checkout/Host/Environment, instance/connection/profile, expected revision/capability revision, idempotency, and optional Goal/Plan/thread refs when applicable. The host revalidates context and leases. Outcomes are accepted, running, outcome_unknown, observed_complete, failed, partial, or cancelled; read-only observations carry revision/freshness and never claim current state from stale cache. Recovery credentials, OAuth codes/tokens, browser content, and connector secrets use separate protected channels.
gui_related: true
gui_classification_reason: Durable progress, retries, rate/cost deferral, protected handoff, exact return, stale/read-only state, and external-effect outcomes are visible across Backup, Settings, Doctor, and recovery surfaces.
depends_on: [SIR-005, SIR-006, SIR-007, SIR-011, SIR-012, SIR-032, BRS-017, BRS-019]
unblocks: []
acceptance_criteria:
  - Backup consumes the shared outbox, governor, ObservableWork, leases, auth/profile/credential attachments, protected browser/human boundary, and exact-return refs; it creates no peer implementation.
  - RuntimeResourceGovernor accounts capture, compression, encryption, hashing, IO, network, staging, uploads, retries, and process leases while reserving interactive, approval, and recovery capacity.
  - Per-repository mutation and maintenance authority is serialized; restart reconciliation reads persisted intent/phase before effects, and stale locks require proven ownership or explicit recovery override rather than reachability guesses.
  - The non-secret common envelope binds every applicable identity/currentness/idempotency field and forbids raw secrets, arbitrary parameter bags, foreign paths, or stale-cache freshness claims.
  - External-effect receipts distinguish accepted, running, outcome_unknown, observed_complete, failed, partial, and cancelled; receipt/projection truth remains event-silent with "expected_event_types=[]" unless Event Authority admits a family.
  - Source/integration DRY components remain RepositoryContextHeader, CapabilityAction, RevisionBadge, ReviewRequestList, NativeJobTree, StreamingLogView, ArtifactProvenanceRow, and SetupReturnContext; Backup DRY components remain owned by BRS-019 and are only referenced here.
  - Static schema/fixtures retain handler_unavailable and runtime_evidence_claimed=false; PROC-001/PROC-002, native handlers, provider calls, resource behavior, release proof, and GUI execution remain unproved.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/BackupSharedRuntimeConsumptionRecord, Plans/shared_integration_runtime_expansion_fixtures.json, python3 scripts/pm-new-contracts-verify.py]
risk_class: shared_runtime_duplication_or_external_effect_ambiguity
reasoning_tier: high
context_scope: backup_shared_primitives_and_common_envelope
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json]
node_compile_hint: {mode: static_shared_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:AUTO-002
  - source_ref:packet:2026-09-01:AUTO-006
  - source_ref:packet:2026-09-01:CMDX-001-CMDX-002
  - source_ref:packet:2026-09-01:OWN-001-OWN-002
  - source_ref:packet:2026-09-01:OWN-005-OWN-006
  - source_ref:packet:2026-09-01:PROC-001-PROC-002
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.4
preserved_exact_tokens: [RuntimeResourceGovernor, ObservableWork, LeaseCoordinator, AuthenticationBroker, CredentialBroker, accepted, running, outcome_unknown, observed_complete, failed, partial, cancelled, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not create a Backup-specific governor, work system, lease service, auth broker, credential broker, protected browser, outbox, or common command envelope.
  - Do not put Recovery Keys, OAuth codes/tokens, credentials, browser content, connector state, raw provider errors, or foreign absolute paths into the ordinary envelope.
  - Do not claim currentness from stale cache or completion from request acceptance, Client reconnect, process memory, schema acceptance, or target strings.
  - Do not claim PROC-001/PROC-002 execution, runtime, release, provider, native GUI, security, performance, or readiness evidence.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Backup_Restore_System.md, Plans/Contracts_V0.md, Plans/Permissions_System.md]
```

## ConnectionDraft Candidate Closure Addendum - 2026-09-02

`IntegrationConnectionRegistry` remains the canonical persistence and lifecycle owner. Packet action candidates ACT-148 through ACT-153 are compatibility inputs, not a second command namespace:

| Packet action | Candidate spelling | Canonical disposition | Sole future target |
|---|---|---|---|
| ACT-148 | `cmd.connection.draft.create` | normalize before gates to `cmd.integration.connection.add`; add persists an inactive `ConnectionDraft` | `handlers::integration_connection::add` |
| ACT-149 | `cmd.connection.activate` | normalize before gates to `cmd.integration.connection.activate` | `handlers::integration_connection::activate` |
| ACT-150 | `cmd.connection.update` | normalize before gates to `cmd.integration.connection.update` | `handlers::integration_connection::update` |
| ACT-151 | `cmd.connection.test` | normalize before gates to `cmd.integration.connection.test` | `handlers::integration_connection::test` |
| ACT-152 | `cmd.connection.remove` | normalize before gates to `cmd.integration.connection.remove` | `handlers::integration_connection::remove` |
| ACT-153 | `cmd.connection.open_details` | normalize before gates to the existing persisted-connection command `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` |

The source spellings are unregistered, receive no peer handler, availability identity, persistence identity, or EventRecord, and normalize before schema, capability/currentness, permission, policy, and dispatch gates. Only the canonical target has a sole future handler. Every target remains `handler_unavailable` until source-hashed executable dispatcher and handler proof exists. Requests bind the shared non-secret `CommandContext` by `command_context_ref`; results settle the initiating return context and record only typed receipt/projection evidence; errors carry a closed reason code, safe message, effect state, retry truth, and typed `recovery_action_ref`. The family keeps `expected_event_types=[]`.

First-time Forge, repository-automation, or Backup setup does not require a preexisting authenticated connection. `cmd.integration.connection.add` accepts `connection_kind=forge|automation|backup`, a validated provider/instance identity, a typed non-secret configuration ref, and nullable profile/credential refs. It atomically persists a non-active `ConnectionDraft` before protected authentication begins and may return only an opaque `auth_continuation_ref`; auth codes, tokens, credential bytes, protected browser content, and raw provider errors never enter the record, command, receipt, projection, logs, capture, agents, or adapters. Cancellation or restart reconciles the persisted draft and removes only uncommitted draft attachments after safe cleanup; it preserves user-owned profiles and provider data.

Activation is a separate expected-generation mutation. It fails closed unless the exact draft, provider, topology, authenticated profile, permission snapshot, minimum non-destructive capability requirement, verification evidence, and required lease are current. Success atomically advances the registry generation and returns a non-secret active connection ref, capability snapshot, receipt, ObservableWork correlation, and exact return settlement. Test is a bounded read/projection with currentness and probe evidence and no write probe. Remove never deletes Backup or provider data by implication. FileSafe applies only if a provider-owned plan separately declares a filesystem mutation; these registry commands do not acquire ambient filesystem authority.

The non-packet draft-only spelling `cmd.connection.draft.open_details` is rejected as a domain command and is represented as `ui.integration.connection.draft.open_details`, a typed owner-local navigation action over the current non-secret draft projection. It has no command registration, semantic handler, persistence write, capability grant, ObservableWork mutation, or domain event; it returns a `navigation_receipt_ref` and restores the exact initiating focus/route. ACT-153 remains distinct because it names details for an already persisted connection and therefore continues to normalize to the existing bounded registry command.

Reverse consumers are exactly Settings integration/destination rows, Product Onboarding owner setup, Doctor deep links/remediation, connection managers, and palette/API where the canonical command is exposed. Repository automation remains a separate `AutomationBinding` consumer; Forge and Backup owners retain their provider, repository, scheduler, encryption, and data semantics. Static Plans, schemas, fixtures, catalog rows, and wiring targets prove no provider call, protected-auth execution, capability result, persistence implementation, native UI, dispatch, or runtime success.

### SIR-035 - ConnectionDraft Lifecycle And ACT-148..153 Reconciliation

```yaml
plan_unit_id: SIR-035
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  IntegrationConnectionRegistry owns one persisted inactive ConnectionDraft lifecycle. ACT-148..153 normalize to the six canonical cmd.integration.connection add/activate/update/test/remove/open_details commands before every gate, source spellings gain no peer route, first-time setup may continue through an opaque protected-auth reference, activation requires current authenticated-profile, capability, verification, permission, and generation proof, and draft-only details remain typed owner-local navigation.
gui_related: true
gui_classification_reason: Settings integration/destination rows, Product Onboarding, Doctor deep links, connection managers, and palette/API expose the draft lifecycle, disabled reasons, progress, and exact return behavior.
depends_on: [SIR-019, SIR-029, SIR-032, SIR-034]
unblocks: []
acceptance_criteria:
  - ACT-148 through ACT-153 each have exactly one machine-validated resolution to an existing canonical command except the newly admitted canonical activation command; no source spelling is registered or receives a peer handler.
  - Draft creation persists an inactive IntegrationConnectionRegistry record before protected authentication and supports a first-time opaque auth continuation without requiring a preexisting profile.
  - Activation requires expected generation, exact identity/topology, current permission, authenticated profile, minimum capability requirement, non-destructive verification evidence, and any required lease before atomic registry activation.
  - Update, test, remove, and persisted-connection details retain their exact current owner contracts; test is a bounded no-write read, and remove never implies provider or Backup data deletion.
  - cmd.connection.draft.open_details is not registered; ui.integration.connection.draft.open_details is presentation-only, currentness- and permission-bound, non-persistent, event-silent navigation with deterministic focus/route return.
  - The six canonical commands have one sole future integration_connection handler each, remain handler_unavailable, use receipt/projection-only effects with "expected_event_types=[]", and claim no runtime evidence.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: duplicate_connection_registry_or_premature_activation
reasoning_tier: high
context_scope: connection_draft_candidate_and_canonical_lifecycle
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, future IntegrationConnectionRegistry and SharedConnectionProfileSupervisor]
node_compile_hint: {mode: static_connection_draft_contract_and_binding_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:192-197"
  - "source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:8624-8978"
  - "source_ref:packet:2026-09-01:SAUTH-005"
  - "source_ref:packet:2026-09-01:CLOUD-002"
preserved_exact_tokens: [ConnectionDraft, IntegrationConnectionRegistry, ACT-148, ACT-149, ACT-150, ACT-151, ACT-152, ACT-153, cmd.connection.draft.create, cmd.connection.activate, cmd.connection.update, cmd.connection.test, cmd.connection.remove, cmd.connection.open_details, cmd.connection.draft.open_details, ui.integration.connection.draft.open_details, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not create a second connection registry, provider namespace, auth broker, capability owner, persistence identity, peer handler, or EventRecord family.
  - Do not activate from request acceptance, stale cache, missing auth/profile proof, a destructive test, or static schema/catalog/wiring evidence.
  - Do not expose auth codes, tokens, credentials, protected browser content, raw provider errors, or unrelated provider/Backup data.
  - Do not claim native dispatch, handler execution, persistence, provider effects, protected-auth completion, capability verification, GUI execution, or runtime readiness.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Multi-Account.md, Plans/Forge_Integrations.md, Plans/Repository_Automation.md, Plans/Backup_Restore_System.md]
```

## Additive Correction v4 — Provisioning Only After Start (2026-09-03)

`MODAL-016`. Temporary MCP, tool, or package provisioning requested by a collaborative workflow —
BrainStorm in particular — is admitted only **after** the workflow's Start is committed and after
normal permission and provisioning approval. The configuration modal may display which
capabilities are available; displaying availability is not installing, and preflight never mutates
the host or the project.

Provisioning admitted this way stays scoped to the run and is torn down when the run ends, exactly
as the v2 contract already requires. Cancelling the modal installs nothing and leaves no residue.
