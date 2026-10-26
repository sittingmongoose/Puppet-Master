# Shard 031: Parallel Execution & Subagent Integration

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3627-L5664

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Parallel Execution & Subagent Integration


### Current Parallel Execution Capabilities

The orchestrator already supports parallel execution of subtasks:

1. **Dependency Analysis**: Uses `DependencyAnalyzer` with Kahn's topological sort to build execution levels
2. **Parallel Executor (`ParallelExecutor`)**: Executes subtasks concurrently within dependency levels
3. **Worktree Isolation**: Each parallel subtask runs in its own git worktree
4. **Dependency-Aware**: Respects `TierNode.dependencies` to determine execution order

**Execution Flow:**
```
Level 0: [Subtask A, Subtask B] → Run in parallel (no dependencies)
Level 1: [Subtask C] → Runs after A and B complete
Level 2: [Subtask D] → Runs after C completes
```

### Subagent Selection for Parallel Subtasks

When subtasks run in parallel, each subtask can have **different subagents** selected independently:

**Example Scenario:**
- **Subtask A** (Rust backend API): `rust-engineer` + `backend-developer`
- **Subtask B** (React frontend UI): `react-specialist` + `frontend-developer`
- Both run in parallel (Level 0), each with their own specialized subagents

**Implementation:**

```rust
// src/core/orchestrator.rs (modifications to execute_subtasks_parallel)

async fn execute_subtasks_parallel(&self, subtask_ids: &[String]) -> Result<Vec<Result<()>>> {
    // ... existing dependency analysis ...

    // Get parallelizable groups
    let groups = self.dependency_analyzer.get_parallelizable_groups(dependencies)?;

    // Execute each group sequentially
    for group in groups {
        // Create worktrees for each subtask
        for id in &group {
            let _ = self.create_subtask_worktree(id).await?;
        }

        // Execute subtasks in parallel, each with its own subagent selection
        let results = join_all(group.iter().map(|id| async {
            let tree = self.tier_tree.lock().unwrap();
            let tier_node = tree.find_by_id(id).unwrap();

            // Build context for this specific subtask
            let tier_context = self.build_tier_context(&tier_node, &context)?;

            // DRY REQUIREMENT: Subagent selection MUST use subagent_selector which uses subagent_registry — NEVER hardcode subagent names
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
            // Select subagents for THIS subtask (independent of others)
            let subagent_names = self.subagent_selector.select_for_tier(
                TierType::Subtask,
                &tier_context,
            );
            // DRY: Validate selected subagent names using subagent_registry::is_valid_subagent_name()
            for name in &subagent_names {
                if !subagent_registry::is_valid_subagent_name(name) {
                    log::warn!("Invalid subagent name selected: {}", name);
                }
            }

            // DRY REQUIREMENT: execute_tier_with_subagents MUST use platform_specs for platform-specific invocation
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md
            // Execute with selected subagents
            self.execute_tier_with_subagents(&tier_node, &tier_context, &subagent_names).await
        })).await;

        // ... cleanup ...
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Context Flow Through Dependency Chains

Subagents can inherit context from completed dependencies:

**Dependency Chain Example:**
```
Subtask A (rust-engineer) → Subtask B (rust-engineer + test-automator)
```

**Implementation:**

```rust
// src/core/subagent_selector.rs (additions)

impl SubagentSelector {
    // DRY:FN:select_with_dependency_context — Select subagents with dependency context
    // DRY REQUIREMENT: MUST use subagent_registry::get_subagent_for_language() — NEVER hardcode language → subagent mappings
    ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
    /// Select subagents with dependency context
    pub fn select_with_dependency_context(
        &self,
        tier_node: &TierNode,
        completed_dependencies: &[TierNode],
        execution_unit_context: &ExecutionUnitContext,
    ) -> Vec<String> {
        let mut subagents = self.select_for_tier(tier_node.tier_type, execution_unit_context);

        // DRY REQUIREMENT: language_to_subagent MUST use subagent_registry::get_subagent_for_language()
        ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md
        // Inherit language/domain from completed dependencies
        for dep in completed_dependencies {
            if let Some(dep_context) = self.get_tier_context(dep) {
                // Inherit language if not already set
                if execution_unit_context.primary_language.is_none() {
                    if let Some(lang) = &dep_context.primary_language {
                        // DRY: Use subagent_registry — DO NOT call self.language_to_subagent which may hardcode mappings
                        if let Some(subagent) = subagent_registry::get_subagent_for_language(lang) {
                            if !subagents.contains(&subagent) {
                                subagents.insert(0, subagent); // Prioritize inherited language
                            }
                        }
                    }
                }

                // Inherit domain if not already set
                if execution_unit_context.domain == ProjectDomain::Unknown {
                    // Use domain from dependency
                }
            }
        }

        subagents
    }
}
```

### Agent Coordination and Communication

When multiple agents/subagents run concurrently (parallel subtasks, different tiers, or same tier with multiple subagents), they need **coordination** to avoid conflicts, understand what others are working on, and not "freak out" when code changes around them.

This owner section defines both the canonical live coordination projection and the canonical attributable crew message-board contract used when agents need questions, decisions, warnings, or requests to survive beyond transient status updates.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

#### Canonical active-agent coordination records and projections

Canonical durable coordination truth is the `EventRecord` stream plus redb projections owned by `Plans/storage-plan.md` and registered in `Plans/Contracts_V0.md`. `AgentCoordinator` is an append/projection consumer, not a JSON file store.

Canonical seglog record families:
- `coordination.agent_registered` records agent registration before execution.
- `coordination.agent_status_updated` records lifecycle/status changes such as queued, running, awaiting_parent, blocked, complete, failed, or cancelled.
- `coordination.agent_operation_updated` records the current operation summary, progress note, and operation refs.
- `coordination.agent_file_ownership_updated` records file activity claims for coordination warnings; it is not a FileSafe lock or durable exclusive lease.
- `coordination.agent_unregistered` records normal completion or explicit unregister.
- `coordination.agent_crashed` records crash/heartbeat expiry resolution.
- `coordination.agent_aborted` records parent/user/runtime abort resolution.
- `coordination.debug_mirror_exported` records optional mirror export attempts and outcomes.

Canonical redb projections:
- `coordination_agent_projection.v1:{project_id}:{agent_id}` for the latest agent lifecycle, status, runtime/platform identity, worktree binding, operation ref, and last applied coordination sequence.
- `coordination_file_projection.v1:{project_id}:{path_hash}:{agent_id}` for current file-activity claims and conflict-warning inputs.
- `coordination_operation_projection.v1:{project_id}:{agent_id}:{operation_id}` for operation progress, current operation text, and related source refs.
- `coordination_snapshot_projection.v1:{project_id}:{projection_scope}` for the prompt-injection/read-model snapshot consumed by schedulers and agents.
- `projector.checkpoint.coordination:{project_id}` for the projector checkpoint that proves which seglog range the read model has consumed.

Concurrency and atomicity rules:
- Up to 32 active agents across multiple worktrees update coordination by calling the PM-owned coordination append API; they do not read-modify-write canonical state files.
- A coordination mutation is admitted only as one append/CAS boundary: the writer checks the current `agent_revision` or `last_applied_event_id`, appends one EventRecord with an idempotency key, and the projector advances the redb projection plus checkpoint in one redb transaction.
- Lost updates are prevented by CAS on `agent_revision`/`last_applied_event_id`. A stale update returns a coordination conflict diagnostic; the caller reloads the projection and emits a new event instead of overwriting the old projection.
- Canonical scheduling, conflict prevention, prompt injection, and execution decisions read only the redb projections whose checkpoint covers the required seglog sequence. They never read `active-agents.json`, `agent-messages.json`, verification JSON, or handoff JSON as authority.
- Mirror writers run after canonical projection commits. If a mirror write fails, lags, or is corrupt, PM emits diagnostics and regenerates the mirror from seglog/redb; canonical scheduling and execution continue from projections only.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.event.v0

<a id="coordination-event-authority-dl-045-2026-09-25"></a>
#### Coordination event authority (DL-045, 2026-09-25)

This section is a **newly authored owner contract under DL-045**. It is the semantic owner text for exactly seven families: `coordination.agent_registered`, `coordination.agent_status_updated`, `coordination.agent_operation_updated`, `coordination.agent_file_ownership_updated`, `coordination.agent_unregistered`, `coordination.agent_crashed` and `coordination.agent_aborted`. The per-family search that DL-045 requires is `reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md`. It found each family's partial contract, and no producer binding, closed domain, identity rule or transition rule. `Plans/Contracts_V0.md` owns the closed payload schema (CV-353). `Plans/storage-plan.md` owns persistence, the projector, the checkpoint and the transition table (SP-320). `coordination.debug_mirror_exported` is not covered here; it belongs to DL-045's Storage batch.

Nothing here admits a family. Each of the seven stays quarantined before append or projection, and absent from `Plans/event_family_registry.json`, until its own Storage admission landing, one family per landing. Preparing the seven together is not admission.

Where other text in this document that predates this section differs, this section governs, wherever that text stands. That covers the family list under "Canonical active-agent coordination records and projections", the `AgentCoordinator` sketch, the `RegisterAgent` example, the "Coordination event updates" bullets, "When to use coordination modes", Gaps #30, #31, #33 and #34, and OSI-258 to OSI-264. The Contracts payload rows govern over every sketch struct in this document.

**Agent identity.** `agent_id` names one registration of one agent. The component that registers the agent allocates it once, before the first append attempt, and reuses it for every retry of that registration. It is unique within its project for the lifetime of the app data root. A registered `agent_id` is never registered again, even after its terminal event. The sketch value `format!("{}-{}", subagent_name, node_id)` repeats across runs, so it is source lineage only. The subagent or persona name goes in `agent_type`.

**Producers.** Every coordination event is appended by `AgentCoordinator` through Storage's coordination append admission, `storage.coordination_append.v1@1.0.0` (SP-320). Child agents, provider adapters and platform hooks never append. Hooks, provider stream events, output parsing and git diff detection only supply observations. The Orchestrator's execution path normalizes those observations and calls the coordinator. So "Agent appends" in "Coordination event updates" and in "Subagent Conflict Prevention" means an append this path makes for the agent.

| Family | Entry point | Called by | When |
|---|---|---|---|
| `coordination.agent_registered` | `register_agent(RegisterAgent)` | the Orchestrator | once, before node execution; execution starts only after its first receipt returns |
| `coordination.agent_status_updated` | `update_status(AgentStatusUpdate)` | the Orchestrator's execution path for the agent | on an actual change of `status` or `status_reason` |
| `coordination.agent_operation_updated` | `update_operation(AgentOperationUpdate)` | the same path | on an actual change of the current operation or its progress, and once for the initial operation |
| `coordination.agent_file_ownership_updated` | `update_file_ownership(AgentFileOwnershipUpdate)`; Gap #33's `update_file_activity_claim` is a sketch of the same append | the same path, from normalized extractor results | on a new claim, or on a changed `claim_kind`, `claim_confidence` or `operation_id` for the same path |
| `coordination.agent_unregistered` | `unregister_agent(AgentTerminalUpdate)` | the Orchestrator's node completion path, or the scheduler's cleanup | once, when the agent ends with a known outcome |
| `coordination.agent_crashed` | `record_crash(AgentCrashResolution)`, newly defined here | only the scheduler or the crash detector | once, on crash evidence |
| `coordination.agent_aborted` | `record_abort(AgentAbortResolution)`, newly defined here | only the component that resolves the abort: the parent run's orchestration path, the user command path or the runtime | once, when the abort is resolved |

The `unregister_agent(&agent_id)` calls in the tier execution sketch under "Orchestrator Modifications" and in the `RegisterAgent` example are source lineage. The entry point takes an `AgentTerminalUpdate`.

Each entry point builds one complete closed payload, including the next `agent_revision` and the idempotency key that SP-320 defines, and submits it once. The entry point shortens `status_reason` to 256 and `operation_summary` to 512 characters at a character boundary before it builds the payload. Coordination has no owner body apart from the event: the EventRecord is the coordination fact, so no body commit precedes the append. Storage admits the event, appends it and issues its first AppendReceipt. The coordinator returns that receipt, and only then does the caller continue. The projection shows the event after the projector's next advance; a caller that must read it back waits until checkpoint coverage reaches the receipt's sequence (SP-320). After a lost acknowledgement or an uncertain append, the coordinator resolves the original append only through the explicitly adopted SP-286/CV-339 `storage.first_append_receipt.resolve.v2`, as SP-320 binds it, and never asks for a first mint. The coordinator keeps the prepared payload for its retries, so a retry carries the same bytes. After a restart it does not rebuild a lost request; it reloads the agent's projection. A stale revision returns `coordination_conflict`. The caller then reloads the projection and appends a successor event, or stops if the agent is terminal.

**Crash and abort resolution.** Gap #30's "Automatic cleanup" rule governs over the "After execution" bullet of "Coordination event updates". An agent never appends `coordination.agent_crashed` or `coordination.agent_aborted` about itself, because it cannot observe its own crash. `record_crash` and `record_abort` append through the same admission and revision check as the other entry points. When a crash races a normal unregister or an abort, the first terminal event to append wins. The other gets `coordination_conflict` and appends nothing (SP-320).

The crash detector records one of four reasons, each from direct evidence:
- `process_exit`: the agent's process ended without a terminal event.
- `process_lost`: the agent's process cannot be found, for example after a restart or a restore. A `permission_denied` process check counts as neither liveness nor loss; it needs a fresh verification first ("Cross-Platform Process Existence Check").
- `worktree_lost`: the agent's worktree was deleted.
- `heartbeat_expired`: the agent's last liveness signal is older than the heartbeat-expiry threshold.

The threshold is the runtime policy value `coordination_heartbeat_expiry_ms`. Gap #33 puts timeout constants in runtime or storage policy, and this section assigns no number: the "e.g., 5 minutes" of Gap #30 stays an example. Until runtime policy supplies the value, no heartbeat expiry is inferred, and crashes are resolved from the other three kinds of evidence. Choosing the value is a runtime policy choice, so it goes to Jared on a DL-036 decision card. The value is owned by the Orchestrator runtime policy that the card records; until it is answered, `heartbeat_expired` is not inferred. The event records the observed `heartbeat_age_ms`, not the threshold.

**Append on change; heartbeats are liveness.** A coordination event is appended at registration, on an actual change, and at termination:
- a status event when `status` or `status_reason` differs from the agent's projection;
- an operation event when the operation is new, or when its summary, progress or refs differ from the operation's projection row;
- a file claim when the agent holds no claim on that path, or when the claim's `claim_kind`, `claim_confidence` or `operation_id` differs.

An observation that changes nothing is not appended. Storage's admission returns `coordination_unchanged` for it and advances no revision (SP-320). Liveness heartbeats are runtime liveness. The runtime keeps each agent's last liveness signal for the crash detector, and no heartbeat is a coordination record. The "every 30 seconds" of "Coordination event updates" is an example of how often agents are observed. Gap #30's 30-second heartbeat stays the runtime liveness cadence: it refreshes the liveness signal and appends nothing. `last_update` is a sketch field that no Contracts row has.

This is an event contract, not a retention choice. It states which facts these families record, and Storage already describes those facts as changes ("records status/lifecycle changes", "records current operation/progress state"). It changes nothing about how long records are kept, how many are kept or what is deleted. `RP-COORDINATION-180D`'s 180-day window, its cap of 1,000,000 per project, its overflow rule and its expiry apply unchanged to every appended record.

**Registration and the initial operation.** Registration carries no operation, because the Contracts row for `coordination.agent_registered` has no operation field, and no field is added. When the registering path has an initial operation description, such as "Starting node 1.1.1", it appends it as `coordination.agent_operation_updated` right after registration returns its first receipt, at `agent_revision` 2. This is how "Agent appends `coordination.agent_registered` with initial operation description" is read. The agent's first status change, for example to `running`, is its own `coordination.agent_status_updated`.

**Closed domains.**

| Field | Family | Values | Basis |
|---|---|---|---|
| `platform` | all seven, in the lineage envelope | the effective runtime platform ID that the Orchestrator takes from `node_config.platform` (OSI-258), as `Plans/Models_System.md` section 1.2 names runtime platforms; this section closes no list of platforms | OSI-258; Models 1.2 |
| `status` | `coordination.agent_status_updated` | `queued`, `running`, `awaiting_parent`, `blocked` | the non-terminal members of the canonical child lifecycle enum in `Plans/Contracts_V0.md` |
| `terminal_status` | `coordination.agent_unregistered` | `complete`, `failed`, `cancelled` | the terminal members of the same enum |
| `crash_reason` | `coordination.agent_crashed` | `process_exit`, `heartbeat_expired`, `process_lost`, `worktree_lost` | Storage: "crash, heartbeat-expiry, process-loss, or worktree-loss resolution"; Gap #30: "process exit, worktree deletion, heartbeat expiry" |
| `abort_reason` | `coordination.agent_aborted` | `parent`, `user`, `runtime` | "parent/user/runtime abort resolution" |
| `claim_kind` | `coordination.agent_file_ownership_updated` | `editing`, `reviewing`, `generated_output`, `read_dependency` | Gap #33's `FileActivityClaim` |
| `claim_confidence` | `coordination.agent_file_ownership_updated` | `high`, `medium` | Gap #31: "Only include high/medium confidence files in coordination state." A low-confidence observation is never appended. |

The lifecycle enum applies to every coordination agent, including node agents, because orchestrated child runs project into the same child model. Contracts forbids a parallel enum, so the families share this one: status updates carry its non-terminal members, and its terminal members arise only from terminal events. In the agent projection, registration sets `queued`, `coordination.agent_unregistered` sets its `terminal_status`, `coordination.agent_crashed` sets `failed` and `coordination.agent_aborted` sets `cancelled`. A status update never stands in for a terminal event. `superseded` is a child-run terminal reason recorded by child-run events, not a coordination field. A replaced agent unregisters with the terminal status its child run presents.

`aborted_by_ref` names the authority that resolved the abort, and its kind follows `abort_reason`: the parent run for `parent`, the user command's actor for `user`, and the runtime component for `runtime`. CV-353 fixes the reference forms.

**Legacy sketch fields.** These do not govern:

| Sketch field | Where | Governing form |
|---|---|---|
| `worktree_path` | the `RegisterAgent` example and the projection JSON example | `worktree_id`; no path is stored |
| `files_being_edited` | the same, OSI-259 and OSI-260 | one `coordination.agent_file_ownership_updated` per claimed path |
| `current_operation` | the same | `coordination.agent_operation_updated` |
| `started_at` | the same | `started_at_utc` |
| `last_update` | the same, Gap #30's heartbeat and OSI-260's projection of it | none: runtime liveness, not a record |
| `expected_agent_revision` | the `RegisterAgent` example | `agent_revision` (1 at registration) and `expected_previous_revision` on later events |
| `unregister_agent(&str)` | the tier execution sketch and the `RegisterAgent` example | `unregister_agent(AgentTerminalUpdate)` |
| `FileActivityClaim.file_path: PathBuf`, `claimed_by`, `last_event_id` | Gap #33 | `path_ref` and `path_hash` (SP-320's recipe), the envelope's `agent_id`, the projection's source event |
| `agent_id` built as `format!("{}-{}", subagent_name, node_id)` | the tier execution sketch and the `RegisterAgent` example | a per-registration `agent_id` (above) |

**File claims.** A claim warns and sequences agents. It is not a FileSafe lock or a lease. Paths are normalized as Gap #34 requires, into the `path_ref` and `path_hash` that SP-320 defines. A newer claim by the same agent on the same `path_hash` supersedes the older one. A claim ends only when the agent's terminal event is applied; heartbeat expiry reaches the claims only through `coordination.agent_crashed` with `heartbeat_expired`. There is no release value. Gap #31's git diff validation runs before the agent's terminal event. A mismatch found later is logged and appends nothing.

**Restart and restore.** After an Orchestrator restart, or after a verified restore of an older backup, every non-terminal agent whose process no longer exists is resolved by the crash detector with `process_lost`, as a new operation. A restored or lost request is never replayed as a new event. An agent started after the restart gets a new `agent_id`.

**Readers.** The scheduler, the `AgentCoordinator` context and conflict reads, the prompt context assembler, the debug mirror exporter and the inspection views read coordination state only through the versioned Storage readers of SP-320, after checkpoint coverage is verified. When coverage cannot be verified, the scheduler treats it as `coordination_conflict`. It neither schedules nor injects context from stale rows or mirrors.

**Owner text per family.** Each family keeps its own lines, refined by this section:
- `coordination.agent_registered`: "records agent registration before execution" in the canonical records list; `register_agent` in the `AgentCoordinator` sketch; "Before execution" in "Coordination event updates"; OSI-258.
- `coordination.agent_status_updated`: "records lifecycle/status changes" in the canonical records list; `update_status`; OSI-259 and OSI-260; the blocked or awaiting-parent event of Gap #33.
- `coordination.agent_operation_updated`: "records the current operation summary, progress note, and operation refs"; `update_operation`; "During execution".
- `coordination.agent_file_ownership_updated`: "records file activity claims for coordination warnings"; `update_file_ownership`; Gaps #31, #33 and #34; "Subagent Conflict Prevention".
- `coordination.agent_unregistered`: "records normal completion or explicit unregister"; `unregister_agent`; OSI-261; Gap #30's "Automatic cleanup".
- `coordination.agent_crashed`: "records crash/heartbeat expiry resolution"; Gap #30's "Automatic cleanup" and "Crash detection"; OSI-261 and OSI-264.
- `coordination.agent_aborted`: "records parent/user/runtime abort resolution"; Gap #30's "Automatic cleanup"; OSI-261.

**Boundaries.** This section admits no family and registers nothing. It adds no payload field, retention policy, Storage key or table. It creates no WorkNode or NodeSeed and proves nothing native: the producers, the crash detector and the append path remain NOT_RUN.

```yaml
plan_unit_id: OSI-438
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Newly authored owner contract under DL-045 and the semantic owner text for coordination.agent_registered,
  coordination.agent_status_updated, coordination.agent_operation_updated,
  coordination.agent_file_ownership_updated, coordination.agent_unregistered, coordination.agent_crashed and
  coordination.agent_aborted. AgentCoordinator is the only appender, through storage.coordination_append.v1:
  register_agent, update_status, update_operation, update_file_ownership and unregister_agent(AgentTerminalUpdate),
  plus the newly defined record_crash for the scheduler or crash detector only and record_abort for the component
  that resolves the abort. The Gap #30 automatic-cleanup rule governs over the after-execution "Agent appends"
  wording. An agent_id names one registration and is never registered again. The closed domains are status (the four
  non-terminal members of the canonical child lifecycle enum, for every coordination agent), terminal_status
  (complete, failed, cancelled), claim_kind (editing, reviewing, generated_output, read_dependency), claim_confidence
  (high, medium), crash_reason (process_exit, heartbeat_expired, process_lost, worktree_lost) and abort_reason
  (parent, user, runtime). platform is the effective runtime platform ID that the Orchestrator takes from
  node_config.platform (OSI-258), as Plans/Models_System.md section 1.2 names runtime platforms, and no list of
  platforms is closed here. Events are appended at registration, on actual change and at termination. Heartbeats are
  runtime liveness, and the heartbeat-expiry threshold is the runtime policy value coordination_heartbeat_expiry_ms,
  with no number assigned here. The initial operation is its own agent_operation_updated event after registration.
  Legacy sketch fields do not govern. Lost acknowledgement resolves through the adopted SP-286/CV-339
  storage.first_append_receipt.resolve.v2. Nothing is admitted.
gui_related: false
gui_classification_reason: Defines backend coordination producers, identities and event semantics, not presentation.
depends_on: [DL-045, OSI-432, CV-310, SP-232, SP-286, CV-339]
unblocks: []
acceptance_criteria:
  - Each family has one appending entry point with named callers; child agents, provider adapters and platform hooks never append, and only the scheduler or the crash detector calls record_crash.
  - An agent_id registers once; a second registration, an event before registration and an event after the agent's terminal event are refused.
  - Status updates carry only queued, running, awaiting_parent or blocked; complete, failed and cancelled arise only from terminal events, and each agent has exactly one terminal event.
  - An observation that changes nothing appends nothing and advances no revision; no heartbeat is a coordination record.
  - Heartbeat expiry is inferred only after the runtime policy value coordination_heartbeat_expiry_ms exists and is exceeded; permission_denied counts as neither liveness nor loss.
  - Registration carries no operation; the initial operation is the next event, at agent_revision 2.
  - Legacy sketch fields and the repeating sketch agent identity never govern payloads or identity.
  - After a lost acknowledgement the coordinator resolves the original append through storage.first_append_receipt.resolve.v2 and never requests a first mint.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md
  - Plans/coordination_event_payloads.schema.json
  - python3 scripts/pm_coordination_events.py
  - Plans/coordination_event_contract_fixtures.json
  - Plans/Automated_Testing_System.md#ATS-058
risk_class: coordination_producer_identity_or_lifecycle_drift
reasoning_tier: high
context_scope: coordination_event_authority_seven_families
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md
  - Plans/orchestrator-subagent-integration.md#OSI-432
  - Plans/Contracts_V0.md#CV-310
  - Plans/storage-plan.md#SP-232
preserved_exact_tokens: [record_crash, record_abort, coordination_heartbeat_expiry_ms, coordination_unchanged, coordination_conflict]
negative_constraints:
  - No admission, registry row, retention policy, payload field, Storage key or native proof.
  - No append by a child agent, provider adapter, platform hook or mirror, and no inference of a sibling family's state.
  - No heartbeat record and no fixed heartbeat-expiry number.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/Contracts_V0.md#CV-353, ContractName:Plans/storage-plan.md#SP-320, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/Contracts_V0.md#Stable-active-agent-coordination-event-families

#### Compatibility and debug mirror contract

`.puppet-master/state/active-agents.json`, `.puppet-master/state/agent-messages.json`, `.puppet-master/state/verification-{node_id}-end.json`, and `.puppet-master/state/handoff-validation-{node_id}.json` are compatibility/debug/export artifacts only. They are written by PM-owned projection or export code after redb commits, may lag canonical storage, and may be absent in headless or clean-room runs.

Mirror contract:
- **Writer:** only PM projector/exporter code writes mirrors; child agents, provider adapters, and platform hooks do not write them directly.
- **Lag:** mirrors may lag until the next projector/export tick and must expose source sequence/checkpoint metadata when present.
- **Corruption:** invalid JSON, partial writes, missing files, stale sequence ids, or disk-full failures are mirror failures. PM quarantines or overwrites the mirror from canonical seglog/redb and emits `coordination.debug_mirror_exported` with failure metadata.
- **Authority:** mirrors cannot drive scheduling, conflict prevention, execution admission, unregister/crash cleanup, or prompt-injection decisions. Consumers that need authority must read `coordination_snapshot_projection.v1` or the more specific redb projections.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md

#### Canonical crew message-board contract

PM-managed multi-agent collaboration uses the child-run/event-store coordination record family for attributable cross-agent coordination that cannot be reduced to live status projection alone. `.puppet-master/state/agent-messages.json` may exist as an optional debug or interoperability mirror, but it is not the canonical persistence store.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

The message board complements the active-agent coordination projection:
- active-agent state answers who is active, what files are in flight, and which operations are currently running
- the message board answers who asked, warned, decided, or requested something, who it targeted, and whether that exchange was resolved

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md

Canonical message schema:
- `message_id` (UUID)
- `from_agent_id`
- `from_platform`
- `to_agent_id?` for direct routing
- `to_agent_type?` for role-wide routing
- `to_node_id?` for node-wide routing
- `to_lane_id?` for lane-wide routing
- `message_type` = `Question | Answer | Update | Request | Decision | Warning | Announcement`
- `priority` = `low | normal | high | urgent`
- `subject`
- `content`
- `context` (execution_unit_context: files mentioned, operations mentioned, sender node, related message ids)
- `thread_id?`
- `in_reply_to?`
- `created_at`
- `read_by[]`
- `resolved`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Architecture_Invariants.md

Routing rules:
- direct routing uses `to_agent_id`
- role-wide routing uses `to_agent_type`
- node-wide routing uses `to_node_id`
- lane-wide routing uses `to_lane_id`
- broadcast routing leaves all target selectors empty
- the orchestrator MUST be able to inspect every message regardless of agent-local visibility filters
- agent-local views MUST be filtered to direct messages, type-matched messages, node-matched messages, lane-matched messages, broadcast messages, and file-relevant messages for the agent's active work

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Priority and rate limits:
- `normal` is the default priority
- `high` and `urgent` are reserved for blockers, conflict warnings, or manager-requested escalations
- each agent is capped at **10 messages per minute** across all routing modes
- when an agent hits the cap, PM MUST emit a structured throttling diagnostic and require the sender to coalesce or defer additional messages rather than silently dropping them

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

Threading and lifecycle:
- `thread_id` groups related coordination exchanges
- `in_reply_to` links replies to the causal parent message
- messages move through created, read, replied, resolved, and expired/archive states
- unresolved blocker threads and unresolved coordination requests MUST remain visible until resolved or explicitly superseded, even when ordinary retention archives stale messages after 24 hours

If orchestration surfaces document annotations in coordination messages, it must keep the document annotation lifecycle distinct from the crew message lifecycle. Document annotations retain the owner lifecycle `open -> addressed -> resolved` from the Crosswalk and assistant-chat contracts; coordination messages retain the created/read/replied/resolved/expired/archive states above.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

**Benefits of coordination:**

- **Conflict prevention:** Agents know what files/modules others are modifying, avoiding simultaneous edits
- **Context awareness:** Agents understand what other agents are working on, reducing confusion when seeing changes
- **Efficient collaboration:** Agents can build on each other's work, reference shared decisions, and avoid duplicate effort
- **Reduced errors:** Agents don't overwrite each other's changes or create conflicting implementations
- **Cross-platform coordination:** Agents from different platforms (Codex, Claude, Cursor, Gemini, Copilot) coordinate through the shared seglog/redb coordination projection; optional state files are debug/export mirrors only.

**Coordination mechanisms:**

1. **Source-lineage shared files (existing):** `progress.txt`, `AGENTS.md`, and `prd.json` may remain source-lineage or project-context inputs where a run explicitly imports them, but they do not provide canonical live coordination truth.

2. **Real-time coordination state (new, cross-platform):** Add a canonical coordination projection, optionally mirrored to `.puppet-master/state/active-agents.json` for debugging, that tracks:
   - Which agents/subagents are currently active (including platform: "codex", "claude", "cursor", "gemini", "copilot")
   - What files/modules each agent is working on
   - What operations each agent is performing (e.g., "editing src/api.rs", "running tests")
   - Platform identifier (so agents know which platform other agents are using)
   - Timestamp of last update

   **This projected coordination works across ALL platforms** -- a Codex agent can see what a Claude agent is doing, and vice versa. All platforms consume the same canonical coordination state even if a debug JSON mirror exists.

3. **Attributable crew message board (canonical records):** Persist durable questions, answers, decisions, warnings, requests, and announcements through the child-run/event-store coordination record family; `.puppet-master/state/agent-messages.json` is an optional debug or interoperability mirror for those records.

4. **Provider-bridge coordination (current):**

   - No same-platform shared thread/session coordination path is active.
   - Codex and Copilot follow the same projected coordination contract as Cursor/Claude/Gemini.
   - Cross-platform and same-platform coordination both use canonical coordination state + prompt injection.

5. **Cross-worktree awareness:** Even when agents run in separate worktrees, they can:
   - Read source-lineage/project-context inputs when a run imports them.
   - Read the projected active-agent state to see what others are doing (regardless of platform).
   - Append registration/status/operation/file-activity events before and during work.
   - Update coordination by appending events that the redb projector folds into the read model.

6. **Prompt injection:** Inject coordination context into each agent's prompt:
   ```
   **Active Agents:**
   - rust-engineer (Codex) is editing src/api.rs (started 2 minutes ago)
   - test-automator (Claude Code) is running tests in tests/api_test.rs (started 1 minute ago)

   **Files Being Modified:**
   - src/api.rs (by rust-engineer on Codex)
   - tests/api_test.rs (by test-automator on Claude Code)

   **Your Task:** Implement authentication middleware. Avoid editing src/api.rs until rust-engineer finishes.
   ```

**Cross-platform coordination example:**

When a Codex agent and a Claude Code agent work simultaneously:

```
1. Codex agent (rust-engineer) starts Subtask A:
   - Appends `coordination.agent_registered`:
     {
       "agent_id": "rust-engineer-1.1.1",
       "platform": "codex",
       "node_id": "1.1.1",
       "current_operation": "Starting API implementation",
       "files_being_edited": []
     }

2. Claude Code agent (test-automator) starts Subtask B (parallel):
   - Reads `coordination_snapshot_projection.v1` before starting
   - Sees: "rust-engineer (Codex) is working on Subtask A"
   - Appends `coordination.agent_registered` for itself:
     {
       "agent_id": "test-automator-1.1.2",
       "platform": "claude",
       "node_id": "1.1.2",
       "current_operation": "Starting test implementation",
       "files_being_edited": []
     }

3. Codex agent begins editing src/api.rs:
   - Appends `coordination.agent_file_ownership_updated` and `coordination.agent_operation_updated`:
     {
       "agent_id": "rust-engineer-1.1.1",
       "platform": "codex",
       "files_being_edited": ["src/api.rs"],
       "current_operation": "Editing src/api.rs to add POST /users endpoint"
     }

4. Claude Code agent reads `coordination_snapshot_projection.v1` (periodic check):
   - Sees: "rust-engineer (Codex) is editing src/api.rs"
   - Prompt includes: "**Active Agents:** rust-engineer (Codex) is editing src/api.rs. **Your Task:** Add tests for POST /users endpoint. Wait for rust-engineer to finish src/api.rs before adding tests."
   - Agent understands context and avoids editing src/api.rs

5. Codex agent completes:
   - Appends `coordination.agent_unregistered`
   - Claude Code agent can now safely edit src/api.rs for tests
```

**Platform field in coordination state:**

The coordination projection includes a `platform` field so agents know which platform other agents are using:

```json
{
  "active_agents": {
    "rust-engineer-1.1.1": {
      "agent_id": "rust-engineer-1.1.1",
      "platform": "codex",
      "node_id": "1.1.1",
      "worktree_path": ".puppet-master/worktrees/1.1.1",
      "files_being_edited": ["src/api.rs"],
      "current_operation": "Editing src/api.rs",
      "started_at": "2026-02-18T10:00:00Z",
      "last_update": "2026-02-18T10:02:00Z"
    },
    "test-automator-1.1.2": {
      "agent_id": "test-automator-1.1.2",
      "platform": "claude",
      "node_id": "1.1.2",
      "worktree_path": ".puppet-master/worktrees/1.1.2",
      "files_being_edited": ["tests/api_test.rs"],
      "current_operation": "Writing tests for API endpoint",
      "started_at": "2026-02-18T10:01:00Z",
      "last_update": "2026-02-18T10:03:00Z"
    }
  },
  "last_updated": "2026-02-18T10:03:00Z"
}
```

This allows agents to see not just what others are doing, but also which platform they're using, which can be useful context (e.g., "Codex agent is working on this, Claude agent is working on that").

**Canonical implementation shape:**

```rust
// src/core/agent_coordination.rs (new module)

pub struct AgentCoordinator {
    store: CoordinationStore,
}

impl AgentCoordinator {
    pub async fn register_agent(&self, input: RegisterAgent) -> Result<AppendReceipt> {
        self.store.append_coordination_event("coordination.agent_registered", input).await
    }

    pub async fn update_status(&self, input: AgentStatusUpdate) -> Result<AppendReceipt> {
        self.store.append_coordination_event("coordination.agent_status_updated", input).await
    }

    pub async fn update_operation(&self, input: AgentOperationUpdate) -> Result<AppendReceipt> {
        self.store.append_coordination_event("coordination.agent_operation_updated", input).await
    }

    pub async fn update_file_ownership(&self, input: AgentFileOwnershipUpdate) -> Result<AppendReceipt> {
        self.store.append_coordination_event("coordination.agent_file_ownership_updated", input).await
    }

    pub async fn unregister_agent(&self, input: AgentTerminalUpdate) -> Result<AppendReceipt> {
        self.store.append_coordination_event("coordination.agent_unregistered", input).await
    }

    pub async fn get_coordination_context(&self, scope: CoordinationScope) -> Result<CoordinationSnapshot> {
        self.store.read_coordination_snapshot(scope).await
    }
}
```

The legacy `state_file: .puppet-master/state/active-agents.json` sketch is source-lineage only. Implementations must not use it as the canonical mutation path.

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, before executing a node:

```rust
// Before node execution
let coordinator = AgentCoordinator::new(self.coordination_store.clone());

// Register this agent/subagent as active (includes platform for cross-platform coordination)
coordinator.register_agent(RegisterAgent {
    agent_id: format!("{}-{}", subagent_name, node_id),
    agent_type: subagent_name.to_string(),
    platform: node_config.platform, // Include platform so other agents know which platform this agent uses
    node_id: node_id.to_string(),
    lane_id: None,
    run_id: run_id.to_string(),
    worktree_path: self.get_node_worktree(node_id),
    files_being_edited: Vec::new(), // Will update as agent works
    current_operation: format!("Starting node {}", node_id),
    started_at: Utc::now(),
    last_update: Utc::now(),
    expected_agent_revision: None,
    idempotency_key: coordination_idempotency_key,
}).await?;

// Get coordination context and inject into prompt
let coordination_context = coordinator.get_coordination_context().await?;
let enhanced_prompt = if !coordination_context.is_empty() {
    format!"{}\n\n{}", prompt, coordination_context)
} else {
    prompt
};

// During execution, update status periodically (e.g., when agent edits files)
// This requires parsing agent output or using platform-specific hooks
// For now, update on node completion

// After node execution
coordinator.unregister_agent(&format!("{}-{}", subagent_name, node_id)).await?;
```

**Provider coordination model (Codex/Copilot included):**

- **Canonical mode:** Coordination projection for all platforms, optionally mirrored to `active-agents.json` for debugging.
- **Scope:** Works for same-platform and cross-platform crews using the same coordination event/projection schema.
- **Runtime path:** Direct-provider invocation via direct provider calls (no local CLI bridge); no SDK threads/sessions.
- **Prompt contract:** Every subagent receives coordination context built from the canonical coordination snapshot projection.

**When to use coordination modes:**

- **Seglog/redb coordination (canonical):** Always on for orchestrator-managed runs. All platforms (Codex, Claude, Cursor, Gemini, Copilot) append coordination events and read the same redb coordination projections.
- **Debug/export mirrors (optional):** `active-agents.json` and related `.puppet-master/state/*.json` files may be emitted after projection commits for debugging or interoperability, but they are not read by schedulers or agents as authority.
- **Platform-native hooks (optional enrichments):** Use hook events where available to improve update fidelity, but keep hooks as producers of normalized coordination events rather than a replacement for canonical seglog/redb state.

**Benefits:**

- **Reduced conflicts:** Agents know what files others are editing, avoiding simultaneous modifications. Coordination context warns agents: "rust-engineer is editing src/api.rs -- avoid this file."
- **Better context:** Agents understand what others are working on, reducing confusion when seeing changes. Agent sees: "test-automator is running tests -- these test failures are expected."
- **Efficient collaboration:** Agents can reference shared decisions and avoid duplicate work. Agent sees: "architect-reviewer established pattern X -- use this pattern."
- **No "freaking out":** Agents see coordination context explaining why code is changing, who is changing it, and what they're doing. Reduces false alarms and confusion.
- **Platform-neutral:** one coordination contract across providers keeps behavior deterministic and replayable.

**Coordination event updates:**

- **Before execution:** Agent appends `coordination.agent_registered` with initial operation description.
- **During execution:** Agent appends status, operation, and file-activity events periodically (e.g., every 30 seconds or when file operations occur):
  - Files being edited (extracted from agent output or platform hooks)
  - Current operation (e.g., "editing src/api.rs", "running cargo test")
  - Progress updates
- **After execution:** Agent appends `coordination.agent_unregistered`, `coordination.agent_crashed`, or `coordination.agent_aborted`.

**Extracting file operations from agent output:**

- **Parse agent output:** Use output parser to detect file paths mentioned in agent responses (e.g., "I'm editing src/api.rs" or file paths in diffs).
- **Platform hooks:** For platforms with native hooks (Cursor, Claude, Gemini), use `PreToolUse`/`PostToolUse` hooks to detect file operations in real-time.
- **Provider event adapters:** For Codex/Copilot, use normalized CLI stream/tool events to detect file operations in real time.

**Example coordination flow (cross-platform):**

```
1. Agent A (rust-engineer, Codex) starts Subtask A: registers in the coordination projection
   - agent_id: "rust-engineer-1.1.1"
   - platform: "codex"
   - current_operation: "Starting implementation of API endpoint"
   - files_being_edited: []

2. Agent A begins editing: appends coordination events
   - files_being_edited: ["src/api.rs"]
   - current_operation: "Editing src/api.rs to add POST /users endpoint"

3. Agent B (test-automator, Claude Code) starts Subtask B (parallel): reads `coordination_snapshot_projection.v1`
   - Sees: "rust-engineer (Codex) is editing src/api.rs"
   - Prompt includes: "**Active Agents:** rust-engineer (Codex) is editing src/api.rs (started 1 minute ago). **Your Task:** Add tests for POST /users endpoint. Wait for rust-engineer to finish src/api.rs before adding tests."

4. Agent B (Claude Code) waits or works on other files, then proceeds when Agent A (Codex) finishes
   - Cross-platform coordination: Claude agent sees Codex agent's status via the shared coordination projection

5. Agent A (Codex) completes: appends `coordination.agent_unregistered`
   - Agent B (Claude Code) can now safely edit src/api.rs for tests
```

**Key point:** Canonical coordination projection enables **cross-platform communication**. A Codex agent and a Claude Code agent can coordinate through the same active-agent state even when they run on different providers/CLIs.

**Provider-bridge runner integration (canonical):**

- **All platform runners (Cursor, Codex, Claude, Gemini, Copilot):** read canonical coordination projections, append coordination events, and consume the same prompt injection contract.
- **No shared provider sessions/threads:** orchestrator keeps fresh-process isolation per iteration and uses canonical projections plus events for coordination.

**Implementation notes:**

- **Where:** New module `src/core/agent_coordination.rs` for canonical coordination projection; platform runners append coordination events, read projections, and consume injected context.
- **What:** Implement `AgentCoordinator`, inject coordination context into prompts, and keep status updates provider-agnostic.
- **When:** Register agent before execution; update status during execution (periodically or on file operations); unregister after execution.

### Puppet Master Crews (Teams/Fleets Alternative) -- duplicate source-lineage copy

This duplicate copy preserves the crew-cap and Assistant-surface lineage for audit. The first `Canonical crew-cap and availability rules` section above is the single live `executionLimits` anchor; this duplicate section is not a peer source of crew-cap authority.

Crew mode is a multi-model coordination overlay over child runs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Canonical crew rules:
- members are child runs.
- model/provider diversity is the default distinguishing axis.
- the same task and often the same Persona are preserved across the crew.
- member-to-member coordination occurs through an attributable crew board.
- the parent owns final synthesis and user-facing escalation.
- crew shared state is explicit shared coordination state, not hidden long-term member memory.

Crew defaults and confirmation:
- default crews live in the model/runtime settings surface.
- first crew invocation asks whether to use the default crew if one exists.
- after model choice, PM resolves each member's provider/runtime surface and discloses the resulting mapping.
- if any crew member is configured to use Copilot, provider-coupling rules auto-set the whole crew to Copilot as a crew-level provider constraint.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/CLI_Bridged_Providers.md
### Gaps and Potential Issues for Crews Feature

Gap-era crew notes in this section are retired as canonical guidance. The live crew rules now resolve through the orchestrator contracts elsewhere in this document rather than through illustrative fallback numbers, and the superseded gap-era examples that previously followed this heading MUST NOT be implemented as live crew canon.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md

#### Duplicate crew-cap source-lineage copy (retired)

Crew admission MUST use `executionLimits` as the sole live source for:
- `maxConcurrentCrewsPerPlatform = 4`
- `maxConcurrentAgentsPerCrew = 8`
- `maxTotalActiveAgents = 32`
- `maxNestingDepth = 4`
- `maxTotalSpawnedAgents = 99`
- `maxToolRoundsPerAgent = 200`

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md

Later illustrative examples in this file MUST NOT widen or replace those values. Availability checks MAY narrow admission further based on platform support, current saturation, quota posture, or policy, but they MUST fail closed rather than inventing alternate per-gap ceilings.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md

#### Crew lifecycle, cleanup, and GUI routing

Crew lifecycle, timeout propagation, cancellation, and cleanup follow the canonical parent/child orchestration and runtime lifecycle contracts. This section no longer defines separate crew-only timeout ceilings, alternate cleanup paths, or stale concurrency examples.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

GUI and future Assistant-surface affordances for crews remain consumer projections. They MUST disclose canonical crew/member state and runtime ceilings, but they do not become the owner of orchestration authority.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

#### Future Assistant-surface note

User-initiated crews remain future Assistant functionality. When that surface lands, platform selection, queueing, and subagent admission still resolve through the same orchestrator-owned ceilings and compatibility checks defined here and in `executionLimits`; future UX MUST NOT reintroduce alternative defaults such as "20 total crews", "3 crews per subagent type", or legacy "max 3 crews per subagent type" wording.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md
### Puppet Master Crews (Teams/Fleets Alternative)

Crew mode is a multi-model coordination overlay over child runs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Canonical crew rules:
- members are child runs.
- model/provider diversity is the default distinguishing axis.
- the same task and often the same Persona are preserved across the crew.
- member-to-member coordination occurs through an attributable crew board.
- the parent owns final synthesis and user-facing escalation.
- crew shared state is explicit shared coordination state, not hidden long-term member memory.

Crew defaults and confirmation:
- default crews live in the model/runtime settings surface.
- first crew invocation asks whether to use the default crew if one exists.
- after model choice, PM resolves each member’s provider/runtime surface and discloses the resulting mapping.
- if any crew member is configured to use Copilot, provider-coupling rules auto-set the whole crew to Copilot as a crew-level provider constraint.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/CLI_Bridged_Providers.md
### Gaps and Potential Issues for Crews Feature

Gap-era crew notes in this section are retired as canonical guidance. The live crew rules now resolve through the orchestrator contracts elsewhere in this document rather than through illustrative fallback numbers, and the superseded gap-era examples that previously followed this heading MUST NOT be implemented as live crew canon.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md

#### Canonical crew-cap and availability rules

Crew admission MUST use `executionLimits` as the sole live source for:
- `maxConcurrentCrewsPerPlatform = 4`
- `maxConcurrentAgentsPerCrew = 8`
- `maxTotalActiveAgents = 32`
- `maxNestingDepth = 4`
- `maxTotalSpawnedAgents = 99`
- `maxToolRoundsPerAgent = 200`

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md

Later illustrative examples in this file MUST NOT widen or replace those values. Availability checks MAY narrow admission further based on platform support, current saturation, quota posture, or policy, but they MUST fail closed rather than inventing alternate per-gap ceilings.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md

#### Crew lifecycle, cleanup, and GUI routing

Crew lifecycle, timeout propagation, cancellation, and cleanup follow the canonical parent/child orchestration and runtime lifecycle contracts. This section no longer defines separate crew-only timeout ceilings, alternate cleanup paths, or stale concurrency examples.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

GUI and future Assistant-surface affordances for crews remain consumer projections. They MUST disclose canonical crew/member state and runtime ceilings, but they do not become the owner of orchestration authority.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

#### Future Assistant-surface note

User-initiated crews remain future Assistant functionality. When that surface lands, platform selection, queueing, and subagent admission still resolve through the same orchestrator-owned ceilings and compatibility checks defined here and in `executionLimits`; future UX MUST NOT reintroduce alternative defaults such as "20 total crews", "3 crews per subagent type", or legacy "max 3 crews per subagent type" wording.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md

### Additional Enhancements for Crews

**Enhancement #1: Crew templates and presets**

Allow users (when Assistant feature is added) to save crew configurations as templates:

```rust
pub struct CrewTemplate {
    pub name: String,
    pub subagents: Vec<String>,
    pub default_task: Option<String>,
    pub description: String,
}

// Users can create templates like:
// "Full Stack Crew": [rust-engineer, frontend-developer, test-automator, code-reviewer]
// "Security Review Crew": [security-auditor, compliance-auditor, code-reviewer]
```

**Enhancement #2: Crew performance metrics**

Track and display crew performance:
- Average time to complete tasks
- Success rate (tasks completed vs failed)
- Member utilization (how often each subagent type is used)
- Platform usage distribution

**Enhancement #3: Crew learning and adaptation**

Crews can learn from past executions:
- Track which subagent combinations work best for different task types
- Suggest optimal crew compositions based on historical data
- Adapt crew behavior based on success patterns

**Enhancement #4: Crew scheduling and prioritization**

When multiple crews are queued:
- Prioritize crews by tier dependency (crews for earlier tiers run first)
- Schedule crews based on platform quota availability
- Allow users to reorder crew execution (when Assistant feature is added)

**Gap #52: Crew integration with PRD/plan generation**

**Issue:** When the interview generates PRD/plans, should it account for crews? Should plans specify which tasks/subtasks benefit from crews? Should plans include crew recommendations?

**Mitigation:**
- **Crew-aware plan generation:** When interview generates PRD/plans, include crew recommendations for tasks that would benefit from multiple subagents working together
- **Plan annotations:** Add crew hints to PRD tasks/subtasks (e.g., "This subtask benefits from a crew: rust-engineer + test-automator + code-reviewer")
- **Crew templates in plans:** Plans can reference crew templates (e.g., "Use 'Full Stack Crew' template for this phase")
- **Orchestrator awareness:** Orchestrator reads crew hints from PRD and automatically creates crews when appropriate

**Integration with interview plan generation:**

When interview generates PRD (`prd.json`), add crew metadata to tasks/subtasks:

```json
{
  "phases": [
    {
      "tasks": [
        {
          "subtasks": [
            {
              "id": "ST-001-001-001",
              "title": "Implement authentication API",
              "crew_recommendation": {
                "suggested": true,
                "subagents": ["rust-engineer", "security-auditor", "test-automator"],
                "rationale": "Requires security expertise, implementation, and testing"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Gap #53: Crew coordination with interview phases**

**Issue:** Can crews be used during the interview itself? Should interview phases use crews for research/validation/documentation?

**Mitigation:**
- **Interview phase crews:** Interview phases can use crews internally (e.g., Architecture phase crew: architect-reviewer + knowledge-synthesizer + technical-writer)
- **Research crews:** Research operations can use crews (e.g., multiple researchers working in parallel)
- **Research /coverage caveat:** When comparator products have mixed or limited public source availability, research crews must record the coverage limit, use official `/docs`, public community feedback, and `/web` evidence as fallback, and still maximize clone-based or source-level inspection through GitHub/web tools wherever cloning is possible or meaningful.
- **Document generation crews:** Document generation can use crews (e.g., technical-writer + knowledge-synthesizer + qa-expert)
- **Cross-phase coordination:** Crews can coordinate across interview phases (e.g., Architecture crew shares decisions with Testing crew)

**Note:** This is separate from orchestrator-initiated crews for execution tiers. Interview crews are for interview flow only.

**Why this is valuable:**

1. **Cross-platform communication:** Works for all supported providers (Cursor, Claude Code, OpenCode, Codex, Gemini, GitHub Copilot), even those without native teams/fleets support
2. **Orchestrator visibility:** Boss agent (orchestrator) can monitor all subagent communication, providing insights into what subagents are doing and how they're coordinating
3. **Platform-agnostic:** Can be used alongside native teams/fleets (Claude Code Teams, Copilot Fleets) but provides fallback and cross-platform capabilities
4. **Enhanced coordination:** Enables more sophisticated coordination patterns (agents asking for help, sharing decisions, requesting reviews)
5. **Unified interface:** Single communication system works the same way across all providers

**Comparison with native solutions:**

| Feature | Claude Code Teams | Copilot Fleets | Puppet Master Communication |
|---------|------------------|----------------|---------------------------|
| Cross-platform | ❌ Claude only | ❌ Copilot only | ✅ All supported providers |
| Orchestrator visibility | Limited | Limited | ✅ Full visibility |
| Agent-to-agent messaging | ✅ Native | ❌ Not supported | ✅ Supported |
| Debug/export mirror available | ❌ Uses API | ❌ Uses API | ✅ Optional non-canonical mirror |
| Works with CLI-only | ❌ Requires Teams API | ❌ Requires Fleets API | ✅ Seglog/redb coordination plus optional mirror export |

**Architecture:**

The communication system extends the canonical coordination event stream and redb read models with a crew board. The file tree below is a debug/export mirror shape only:

```
.puppet-master/state/
├── active-agents.json          # Optional debug mirror of agent status projection
└── agent-messages.json         # Optional debug/interoperability mirror of crew-board records
```

**Message structure:**

```rust
// src/core/agent_communication.rs (new module)

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:AgentMessage — Agent-to-agent message structure
pub struct AgentMessage {
    pub message_id: String, // UUID
    pub from_agent_id: String, // e.g., "rust-engineer-1.1.1"
    pub from_platform: Platform,
    pub to_agent_id: Option<String>, // None = broadcast
    pub to_agent_type: Option<String>, // e.g., "test-automator", "code-reviewer"
    pub to_node_id: Option<String>, // e.g., "1.1" (all agents in this node)
    pub message_type: MessageType,
    pub subject: String, // Brief summary
    pub content: String, // Full message content
    pub context: MessageContext, // Files, operations, etc.
    pub thread_id: Option<String>, // For threaded conversations
    pub in_reply_to: Option<String>, // message_id of message being replied to
    pub created_at: DateTime<Utc>,
    pub read_by: Vec<String>, // agent_ids that have read this message
    pub resolved: bool, // Whether this message/request has been resolved
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Question, // Agent asking a question
    Answer, // Agent answering a question
    Update, // Agent sharing progress/status update
    Request, // Agent requesting help/review/approval
    Decision, // Agent sharing a decision (architecture, pattern, etc.)
    Warning, // Agent warning about conflicts/issues
    Announcement, // Agent announcing completion/blocker
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageContext {
    pub files_mentioned: Vec<PathBuf>,
    pub operations_mentioned: Vec<String>, // e.g., "editing src/api.rs", "running tests"
    pub node_id: String,
    pub related_messages: Vec<String>, // message_ids
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessageBoard {
    pub messages: Vec<AgentMessage>,
    pub last_updated: DateTime<Utc>,
    pub schema_version: u32,
}
```

**Message routing:**

Messages can be routed to:
- **Direct:** Specific agent ID (`to_agent_id`)
- **By type:** All agents of a specific type (`to_agent_type`, e.g., "all test-automators")
- **By node:** All agents in a specific node (`to_node_id`)
- **Broadcast:** All active agents (`to_agent_id = None`, `to_agent_type = None`, `to_node_id = None`)

**Usage examples:**

**Example 1: Agent asking for help**

```rust
// Rust engineer needs help with testing
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "rust-engineer-1.1.1".to_string(),
    from_platform: Platform::Codex,
    to_agent_type: Some("test-automator".to_string()), // Ask all test-automators
    message_type: MessageType::Question,
    subject: "Need help writing tests for POST /users endpoint".to_string(),
    content: "I've implemented the POST /users endpoint in src/api.rs. Can someone help me write comprehensive tests? The endpoint handles validation, authentication, and database insertion.".to_string(),
    context: MessageContext {
        files_mentioned: vec![PathBuf::from("src/api.rs")],
        operations_mentioned: vec!["implemented POST /users endpoint".to_string()],
        node_id: "1.1.1".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Example 2: Agent sharing a decision**

```rust
// Architect reviewer shares architectural decision
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "architect-reviewer-1.0".to_string(),
    from_platform: Platform::Claude,
    to_node_id: Some("1.1".to_string()), // Share with all agents in node 1.1
    message_type: MessageType::Decision,
    subject: "Architecture decision: Use Actix-web for API server".to_string(),
    content: "After reviewing requirements, I've decided we should use Actix-web for the API server. This provides async/await support, good performance, and strong Rust ecosystem integration. All agents working on API-related tasks should use this framework.".to_string(),
    context: MessageContext {
        files_mentioned: vec![],
        operations_mentioned: vec!["architecture review".to_string()],
        node_id: "1.0".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Example 3: Agent warning about conflicts**

```rust
// Agent warns about file conflict
coordinator.post_message(AgentMessage {
    message_id: uuid::Uuid::new_v4().to_string(),
    from_agent_id: "test-automator-1.1.2".to_string(),
    from_platform: Platform::Claude,
    to_agent_id: Some("rust-engineer-1.1.1".to_string()), // Direct message
    message_type: MessageType::Warning,
    subject: "File conflict: src/api.rs".to_string(),
    content: "I'm about to add tests for src/api.rs. Are you still editing it? I'll wait if you need more time.".to_string(),
    context: MessageContext {
        files_mentioned: vec![PathBuf::from("src/api.rs")],
        operations_mentioned: vec!["adding tests".to_string()],
        node_id: "1.1.2".to_string(),
        related_messages: vec![],
    },
    thread_id: None,
    in_reply_to: None,
    created_at: Utc::now(),
    read_by: vec![],
    resolved: false,
}).await?;
```

**Integration with orchestrator:**

The orchestrator monitors all messages and can:
- **Track agent communication:** See which agents are talking to each other
- **Detect blockers:** Identify when agents are stuck or need help
- **Monitor decisions:** Track architectural decisions and ensure consistency
- **Detect conflicts:** See warnings about file conflicts before they happen
- **Provide insights:** Show communication patterns in GUI

**Integration with agent prompts:**

Messages are injected into agent prompts as part of coordination context:

```rust
// In orchestrator, before executing agent
let coordination_context = coordinator.get_coordination_context().await?;
let messages = coordinator.get_messages_for_agent(&agent_id, &node_id).await?;
let message_context = coordinator.format_messages_for_prompt(&messages)?;

let enhanced_prompt = format!(
    "{}\n\n{}\n\n**Messages from other agents:**\n{}",
    prompt,
    coordination_context,
    message_context
);
```

**Message filtering:**

Agents only see messages relevant to them:
- Messages addressed to their agent_id
- Messages addressed to their agent type
- Messages addressed to their node_id
- Broadcast messages
- Messages mentioning files they're working on

**Message threading:**

Messages can be threaded (conversations):
- `thread_id`: Groups related messages together
- `in_reply_to`: Links reply to original message
- Agents can follow threads to see conversation history

**Message lifecycle:**

- **Created:** Agent posts message
- **Read:** Agent reads message (tracked in `read_by`)
- **Replied:** Agent replies (creates new message with `in_reply_to`)
- **Resolved:** Message marked as resolved (e.g., question answered, request fulfilled)
- **Expired:** Old messages (>24 hours) are archived or deleted

**Canonical implementation shape:**

```rust
// src/core/agent_communication.rs

// DRY:DATA:AgentCommunicator — Agent-to-agent message communication
pub struct AgentCommunicator {
    store: CoordinationStore,
    coordinator: AgentCoordinator,
}

impl AgentCommunicator {
    // DRY:FN:post_message — Post a message to the message board
    // DRY REQUIREMENT: Validate agent_id using subagent_registry::is_valid_subagent_name() if it's a subagent name
    /// Post a message to the message board
    pub async fn post_message(&self, message: AgentMessage) -> Result<AppendReceipt> {
        self.store.append_coordination_event("crew.board_message_posted", message).await
    }

    /// Get messages relevant to an agent
    pub async fn get_messages_for_agent(
        &self,
        agent_id: &str,
        node_id: &str,
        agent_type: Option<&str>,
    ) -> Result<Vec<AgentMessage>> {
        self.store.read_crew_board_projection(agent_id, node_id, agent_type).await
    }

    /// Format messages for prompt injection
    pub fn format_messages_for_prompt(&self, messages: &[AgentMessage]) -> Result<String> {
        if messages.is_empty() {
            return Ok(String::new());
        }

        let mut formatted = String::new();
        formatted.push_str("**Recent Messages from Other Agents:**\n\n");

        for msg in messages.iter().take(10) { // Limit to 10 most recent
            // DRY REQUIREMENT: Platform display name MUST use platform_specs::display_name_for() — NEVER hardcode platform names
            ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Models_System.md
            let platform_display = platform_specs::display_name_for(msg.from_platform);
            let from_info = format!("{} ({})", msg.from_agent_id, platform_display);
            let message_type_str = match msg.message_type {
                MessageType::Question => "❓ Question",
                MessageType::Answer => "✅ Answer",
                MessageType::Update => "📢 Update",
                MessageType::Request => "🙏 Request",
                MessageType::Decision => "🎯 Decision",
                MessageType::Warning => "⚠️ Warning",
                MessageType::Announcement => "📣 Announcement",
            };

            formatted.push_str(&format!(
                "- **{}** from {}: {}\n  {}\n",
                message_type_str,
                from_info,
                msg.subject,
                msg.content
            ));

            if !msg.context.files_mentioned.is_empty() {
                formatted.push_str(&format!(
                    "  Files: {}\n",
                    msg.context.files_mentioned.iter()
                        .map(|f| f.display().to_string())
                        .collect::<Vec<_>>()
                        .join(", ")
                ));
            }
        }

        Ok(formatted)
    }

    /// Mark message as read
    pub async fn mark_message_read(&self, message_id: &str, agent_id: &str) -> Result<AppendReceipt> {
        self.store.append_coordination_event("crew.board_message_read", BoardMessageRead {
            message_id: message_id.to_string(),
            agent_id: agent_id.to_string(),
        }).await
    }

    /// Archive old messages (>24 hours)
    pub async fn archive_old_messages(&self, scope: CrewBoardArchiveScope) -> Result<AppendReceipt> {
        self.store.append_coordination_event("crew.board_messages_archived", scope).await
    }
}
```

The legacy `message_board_file` / `agent-messages.json` sketch is source-lineage only. PM may export that mirror from the canonical crew-board projection, but agents and schedulers must not use it as the durable board store.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Integration with agent execution:**

Agents can post messages during execution:

```rust
// In orchestrator, during agent execution
// Parse agent output for message commands
if agent_output.contains("@message") || agent_output.contains("@ask") {
    // Extract message from agent output
    let message = parse_message_from_output(&agent_output)?;
    communicator.post_message(message).await?;
}

// Before agent execution, inject messages into prompt
let messages = communicator.get_messages_for_agent(&agent_id, &node_id, Some(&agent_type)).await?;
let message_context = communicator.format_messages_for_prompt(&messages)?;
```

**Orchestrator monitoring:**

The orchestrator can monitor all messages for insights:

```rust
// In orchestrator
pub struct OrchestratorInsights {
    pub active_conversations: Vec<ConversationThread>,
    pub pending_questions: Vec<AgentMessage>,
    pub recent_decisions: Vec<AgentMessage>,
    pub conflict_warnings: Vec<AgentMessage>,
}

impl OrchestratorInsights {
    pub async fn analyze_communication(&self, communicator: &AgentCommunicator) -> Result<Self> {
        let board = communicator.load_message_board().await?;

        // Analyze messages for insights
        // ...
    }
}
```

**Benefits:**

1. **Cross-platform:** Works for all providers, even without native teams/fleets
2. **Orchestrator visibility:** Boss agent can see all subagent communication
3. **Enhanced coordination:** Agents can ask for help, share decisions, warn about conflicts
4. **File-based:** No API calls, pure file-based (fits Puppet Master architecture)
5. **Flexible routing:** Messages can be direct, by type, by tier, or broadcast
6. **Threaded conversations:** Supports multi-turn conversations
7. **Integration:** Works seamlessly with existing coordination state

**Potential issues and mitigations:**

- **Message spam:** Limit message rate per agent (max 10 messages/minute)
- **Large message board:** Archive old messages, limit message history
- **File locking:** Use same locking mechanism as coordination state
- **Message parsing:** Agents may not always format messages correctly -- provide clear instructions in prompts
- **Orphaned messages:** Messages from crashed agents -- mark as resolved after agent unregisters

**Next steps:**

1. Add message board to coordination state
2. Implement `AgentCommunicator` with message posting/reading
3. Integrate message injection into agent prompts
4. Add orchestrator monitoring/insights
5. Add GUI visualization of agent communication
6. Test with multiple agents across different platforms
### Gaps and Potential Issues for Agent Coordination

**Gap #28: File locking and concurrent writes**

**Issue:** Legacy/source-lineage mirror writers that directly update `active-agents.json` can race, corrupt JSON, or lose updates. Canonical coordination avoids this class by prohibiting read-modify-write on files and admitting updates only through seglog append plus redb projection CAS.

**Mitigation:**
- **Canonical append/CAS:** Each update appends one coordination EventRecord with an idempotency key and expected agent revision; stale expected revisions fail with a conflict diagnostic.
- **Projection transaction:** The coordination projector writes all affected redb rows and the checkpoint in one transaction. It does not advance the checkpoint on partial failure.
- **Mirror-only atomic writes:** Optional mirrors use same-directory temp files, fsync, and rename. Mirror failure is a debug/export failure, not a canonical coordination failure.
- **No fail-open scheduling:** Lock timeout, mirror write failure, or mirror corruption must never authorize scheduling or execution from stale mirror data.

```rust
// Legacy mirror-only source-lineage sketch. Do not use for canonical coordination mutation.
// src/core/agent_coordination.rs (enhanced)

use std::fs::File;
use std::io::{Read, Write};
use std::os::unix::fs::FileExt; // For file locking on Unix

impl AgentCoordinator {
    async fn save_state_with_lock(&self, state: &AgentCoordinationState) -> Result<()> {
        let lock_file = self.state_file.with_extension("lock");
        let mut attempts = 0;
        const MAX_ATTEMPTS: u32 = 3;

        loop {
            // Try to acquire lock
            match self.acquire_lock(&lock_file).await {
                Ok(_) => break,
                Err(e) if attempts < MAX_ATTEMPTS => {
                    attempts += 1;
                    tokio::time::sleep(tokio::time::Duration::from_millis(100 * attempts)).await;
                    continue;
                }
                Err(e) => {
                    // Lock timeout — log warning but proceed
                    tracing::warn!("Could not acquire coordination lock after {} attempts: {}. Proceeding without lock.", MAX_ATTEMPTS, e);
                    break;
                }
            }
        }

        // Write to temp file first
        let temp_file = self.state_file.with_extension("tmp");
        let json = serde_json::to_string_pretty(state)?;
        std::fs::write(&temp_file, json)?;

        // Atomic rename
        std::fs::rename(&temp_file, &self.state_file)?;

        // Release lock
        let _ = std::fs::remove_file(&lock_file);

        Ok(())
    }

    async fn acquire_lock(&self, lock_file: &Path) -> Result<()> {
        // Create lock file with PID
        let pid = std::process::id();
        let lock_content = format!("{}\n", pid);

        // Try to create lock file exclusively
        match std::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(lock_file)
        {
            Ok(mut file) => {
                file.write_all(lock_content.as_bytes())?;
                Ok(())
            }
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                // Check if lock is stale (process no longer exists)
                if let Ok(content) = std::fs::read_to_string(lock_file) {
                    if let Ok(lock_pid) = content.trim().parse::<u32>() {
                        // Check if process exists (Unix-specific)
                        if !self.process_exists(lock_pid) {
                            // Stale lock — remove it
                            let _ = std::fs::remove_file(lock_file);
                            return self.acquire_lock(lock_file).await;
                        }
                    }
                }
                Err(anyhow!("Lock file exists"))
            }
            Err(e) => Err(anyhow!("Failed to create lock: {}", e)),
        }
    }

    fn process_exists(&self, pid: u32) -> bool {
        // Unix-specific: check if process exists
        #[cfg(unix)]
        {
            use std::process::Command;
            Command::new("kill")
                .args(&["-0", &pid.to_string()])
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
        }
        #[cfg(not(unix))]
        {
            // Windows: use different approach
            true // Assume exists for now
        }
    }
}
```

**Gap #29: Error handling and file corruption recovery**

**Issue:** If the optional `active-agents.json` mirror becomes corrupted (invalid JSON, partial write, disk full), debug/interoperability views can be stale or unreadable.

**Mitigation:**
- **Authority fallback:** Read canonical `coordination_snapshot_projection.v1` and specific redb projections; do not parse a corrupt mirror for authority.
- **Mirror regeneration:** Quarantine or overwrite the mirror by replaying seglog/redb projection state from the last valid coordination checkpoint.
- **Diagnostic event:** Emit `coordination.debug_mirror_exported` with failure metadata when mirror recovery is needed.
- **No empty canonical state fallback:** A corrupt mirror must not create an empty canonical active-agent set or unregister agents by implication.

```rust
// Legacy mirror-only source-lineage sketch. Do not use for canonical coordination reads.
async fn load_state(&self) -> Result<AgentCoordinationState> {
    if self.state_file.exists() {
        let json = match std::fs::read_to_string(&self.state_file) {
            Ok(json) => json,
            Err(e) => {
                tracing::error!("Failed to read coordination state: {}. Using empty state.", e);
                return Ok(AgentCoordinationState::default());
            }
        };

        // Try to parse JSON
        match serde_json::from_str::<AgentCoordinationState>(&json) {
            Ok(state) => {
                // Validate schema (check required fields)
                self.validate_state(&state)?;
                Ok(state)
            }
            Err(e) => {
                // Try backup
                let backup_file = self.state_file.with_extension("bak");
                if backup_file.exists() {
                    tracing::warn!("Coordination state corrupted. Attempting backup recovery.");
                    if let Ok(backup_json) = std::fs::read_to_string(&backup_file) {
                        if let Ok(backup_state) = serde_json::from_str(&backup_json) {
                            tracing::info!("Recovered coordination state from backup.");
                            return Ok(backup_state);
                        }
                    }
                }

                // Last resort: empty state
                tracing::error!("Coordination state corrupted and backup recovery failed: {}. Using empty state.", e);
                Ok(AgentCoordinationState::default())
            }
        }
    } else {
        Ok(AgentCoordinationState::default())
    }
}

fn validate_state(&self, state: &AgentCoordinationState) -> Result<()> {
    // Validate schema: check that all agents have required fields
    for (agent_id, agent) in &state.active_agents {
        if agent.agent_id.is_empty() {
            return Err(anyhow!("Invalid agent: empty agent_id"));
        }
        if agent.node_id.is_empty() {
            return Err(anyhow!("Invalid agent {}: empty node_id", agent_id));
        }
        // Check for reasonable timestamps (not in future, not too old)
        let now = Utc::now();
        if agent.started_at > now {
            return Err(anyhow!("Invalid agent {}: started_at in future", agent_id));
        }
        if agent.started_at < now - chrono::Duration::days(7) {
            // Agent running for 7+ days is likely stale
            tracing::warn!("Agent {} has been running for 7+ days — likely stale", agent_id);
        }
    }
    Ok(())
}
```

**Gap #30: Stale agent cleanup and crash recovery**

**Issue:** If an agent crashes or is killed without normal unregister, the canonical projection needs a terminal resolution rather than side-file cleanup.

**Mitigation:**
- **Heartbeat mechanism:** Agents update `last_update` timestamp periodically (every 30 seconds). Prune agents with `last_update` older than threshold (e.g., 5 minutes).
- **Process existence check:** When loading state, check if agent's process still exists (via PID if stored, or by checking worktree activity). Remove stale entries.
- **Automatic cleanup:** The scheduler or crash detector appends `coordination.agent_crashed`, `coordination.agent_aborted`, or `coordination.agent_unregistered`; projectors derive terminal state from those events.
- **Crash detection:** Detect agent crashes (process exit, worktree deletion, heartbeat expiry) and append terminal coordination events rather than deleting a JSON entry.

```rust
// Legacy mirror-only source-lineage sketch. Do not use for canonical crash cleanup.
async fn load_state(&self) -> Result<AgentCoordinationState> {
    // ... existing load logic ...

    // Prune stale agents
    let mut pruned = state.clone();
    let cutoff = Utc::now() - chrono::Duration::minutes(5); // 5 minute timeout
    let initial_count = pruned.active_agents.len();

    pruned.active_agents.retain(|agent_id, agent| {
        // Check if agent is stale
        if agent.last_update < cutoff {
            tracing::info!("Pruning stale agent: {} (last update: {} ago)",
                agent_id,
                Utc::now().signed_duration_since(agent.last_update));
            return false;
        }

        // Check if worktree still exists (if applicable)
        if let Some(ref worktree) = agent.worktree_path {
            if !worktree.exists() {
                tracing::info!("Pruning agent {}: worktree {} no longer exists", agent_id, worktree.display());
                return false;
            }
        }

        true
    });

    if pruned.active_agents.len() != initial_count {
        // Save pruned state
        self.save_state(&pruned).await?;
    }

    Ok(pruned)
}
```

**Gap #31: File operation extraction reliability**

**Issue:** Extracting file operations from agent output is unreliable. Agents may mention files they don't edit, or edit files they don't mention. Platform hooks may not fire for all file operations.

**Mitigation:**
- **Multi-source extraction:** Combine multiple sources: (1) agent output parsing (regex for file paths), (2) platform hooks (`PreToolUse`/`PostToolUse`), (3) provider stream/tool events from CLI output adapters, (4) git diff detection (compare worktree before/after).
- **Confidence scoring:** Assign confidence scores to file operations (high: platform hook detected, medium: agent mentioned, low: inferred from context). Only include high/medium confidence files in coordination state.
- **Validation:** After agent completes, validate claimed files against actual git diff. If mismatch, log warning and update coordination state.
- **Best-effort updates:** If file extraction fails, still register agent with empty `files_being_edited` list. Coordination context will still show agent is active, just without file details.

```rust
pub struct FileOperationExtractor;

impl FileOperationExtractor {
    /// Extract file operations from multiple sources
    pub async fn extract_files(
        &self,
        agent_output: &str,
        platform_hooks: Option<Vec<String>>, // Files detected by platform hooks
        git_diff: Option<Vec<PathBuf>>, // Files changed in git diff
    ) -> Vec<PathBuf> {
        let mut files = std::collections::HashSet::new();

        // Source 1: Platform hooks (highest confidence)
        if let Some(hook_files) = platform_hooks {
            for file in hook_files {
                files.insert(PathBuf::from(file));
            }
        }

        // Source 2: Git diff (high confidence)
        if let Some(diff_files) = git_diff {
            for file in diff_files {
                files.insert(file);
            }
        }

        // Source 3: Agent output parsing (medium confidence)
        let output_files = self.parse_files_from_output(agent_output);
        for file in output_files {
            files.insert(file);
        }

        files.into_iter().collect()
    }

    fn parse_files_from_output(&self, output: &str) -> Vec<PathBuf> {
        // Regex patterns for common file mentions
        let patterns = vec![
            r#"editing\s+([^\s]+\.(rs|ts|js|py|go|java))"#i,
            r#"modifying\s+([^\s]+\.(rs|ts|js|py|go|java))"#i,
            r#""([^"]+\.(rs|ts|js|py|go|java))""#,
            r#"'([^']+\.(rs|ts|js|py|go|java))'"#,
        ];

        let mut files = Vec::new();
        for pattern in patterns {
            let re = regex::Regex::new(pattern).unwrap();
            for cap in re.captures_iter(output) {
                if let Some(file_match) = cap.get(1) {
                    files.push(PathBuf::from(file_match.as_str()));
                }
            }
        }

        files
    }
}
```

**Gap #32: Coordination state size limits and performance**

**Issue:** If many agents run simultaneously, coordination projections and prompt-injection snapshots can become large. The supported v1 bound is up to 32 active agents across worktrees; above that, admission policy must queue or throttle new child runs.

**Mitigation:**
- **Size limits:** Limit coordination state to max 100 active agents. If exceeded, prune oldest agents (by `started_at`).
- **Prompt context limits:** Limit coordination context to max 2000 tokens. If exceeded, summarize (e.g., "15 agents active, 8 editing files") or filter (only show agents editing files in current directory).
- **Lazy loading:** Only load coordination state when needed (before agent execution), not on every orchestrator tick.
- **Caching:** Cache coordination context for 5 seconds to avoid repeated file reads.
- **Filtering:** Allow filtering coordination context by tier, platform, or file path to reduce size.

```rust
pub async fn get_coordination_context(
    &self,
    filter: Option<CoordinationFilter>, // Filter by tier, platform, file path
) -> Result<String> {
    let state = self.load_state().await?;
    let mut context = String::new();

    // Apply filters
    let filtered_agents: Vec<_> = state.active_agents.values()
        .filter(|agent| {
            if let Some(ref filter) = filter {
                if let Some(ref node_filter) = filter.node_id {
                    if agent.node_id != *node_filter {
                        return false;
                    }
                }
                if let Some(ref platform_filter) = filter.platform {
                    if agent.platform != *platform_filter {
                        return false;
                    }
                }
                if let Some(ref file_filter) = filter.file_path {
                    if !agent.files_being_edited.iter().any(|f| f == file_filter) {
                        return false;
                    }
                }
            }
            true
        })
        .collect();

    // Limit to max agents
    let max_agents = 20; // Limit to prevent token bloat
    let agents_to_show: Vec<_> = filtered_agents.iter().take(max_agents).collect();

    if agents_to_show.is_empty() {
        return Ok(String::new());
    }

    // Build context (same as before but with limit)
    // ... existing context building logic ...

    // If context exceeds token limit, summarize
    let estimated_tokens = context.len() / 4; // Rough estimate
    if estimated_tokens > 2000 {
        context = self.summarize_coordination_context(&agents_to_show)?;
    }

    Ok(context)
}

pub struct CoordinationFilter {
    pub node_id: Option<String>,
    pub platform: Option<Platform>,
    pub file_path: Option<PathBuf>,
}
```

**Gap #33: Conflict resolution and file locking**

**Issue:** If two agents want to edit the same file, coordination context warns them, but there's no automatic conflict resolution. Agents may ignore warnings or both proceed, causing merge conflicts.

**Mitigation:**
- **Conflict detection:** Before agent starts, check coordination state for file conflicts. If conflict detected, either (1) delay agent start, (2) select alternative files, or (3) escalate to orchestrator.
- **File-activity claims:** Extend coordination projections to include file-activity claims (which agent intends to edit or is currently editing a file). These claims warn and sequence agents; they are not FileSafe locks or durable exclusive leases.
- **Claim expiry:** Claims expire from the projection only after terminal coordination events, heartbeat expiry policy, or explicit supersession events. Timeout constants belong in runtime/storage policy, not in a debug mirror.
- **Orchestrator intervention:** If conflict persists, orchestrator can serialize execution (run agents sequentially instead of parallel), reassign files, or append a blocked/awaiting-parent coordination event.

```rust
// Canonical projection sketch; no JSON file read-modify-write is allowed.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileActivityClaim {
    pub file_path: PathBuf,
    pub claimed_by: String, // agent_id
    pub claim_kind: FileClaimKind, // editing, reviewing, generated_output, read_dependency
    pub last_event_id: String,
}

impl AgentCoordinator {
    /// Check for file conflicts before agent starts
    pub async fn check_file_conflicts(
        &self,
        agent_id: &str,
        files_to_edit: &[PathBuf],
    ) -> Result<Vec<FileConflict>> {
        self.store.read_file_conflict_projection(agent_id, files_to_edit).await
    }

    /// Record a file-activity claim for coordination warnings
    pub async fn update_file_activity_claim(
        &self,
        claim: FileActivityClaim,
    ) -> Result<AppendReceipt> {
        self.store.append_coordination_event("coordination.agent_file_ownership_updated", claim).await
    }
}

pub struct FileConflict {
    pub file: PathBuf,
    pub conflicting_agent: String,
    pub conflicting_platform: Platform,
}
```

**Gap #34: Path normalization and worktree handling**

**Issue:** Agents may report file paths in different formats (relative vs absolute, worktree paths vs main repo paths). Coordination state may not correctly match files across worktrees.

**Mitigation:**
- **Path normalization:** Normalize all paths to relative paths from project root before storing in coordination state.
- **Worktree path resolution:** Convert worktree paths to main repo paths (e.g., `.puppet-master/worktrees/A/src/api.rs` → `src/api.rs`).
- **Path comparison:** Use canonical paths for comparison (resolve symlinks, normalize separators).

```rust
impl AgentCoordinator {
    fn normalize_path(&self, path: &Path, project_root: &Path) -> PathBuf {
        // If path is absolute, make it relative to project root
        if path.is_absolute() {
            if let Ok(relative) = path.strip_prefix(project_root) {
                return relative.to_path_buf();
            }
        }

        // If path is in worktree, convert to main repo path
        if let Ok(stripped) = path.strip_prefix(".puppet-master/worktrees/") {
            // Extract worktree name and file path
            if let Some(components) = stripped.components().next() {
                // Remove worktree prefix, keep file path
                return stripped.strip_prefix(components).unwrap_or(stripped).to_path_buf();
            }
        }

        path.to_path_buf()
    }
}
```

**Gap #35: Coordination-event ingestion fallback**

**Issue:** If provider event ingestion fails (e.g. adapter parse errors, stream interruption), coordination updates can degrade, and there is no explicit fallback policy.

**Mitigation:**
- **Fallback detection:** Detect event-ingestion failures (parser error, stream timeout, malformed event). Automatically continue with baseline coordination projection updates.
- **Baseline-first coordination:** Keep canonical coordination projection as the primary path; event ingestion is an enrichment layer only.
- **Error handling:** Log ingestion failures but do not block execution. Continue with baseline coordination projection updates.

**Gap #36: Coordination metrics and monitoring**

**Issue:** No visibility into coordination effectiveness. Can't tell if coordination is preventing conflicts, how often agents wait, or if coordination state is accurate.

**Mitigation:**
- **Metrics:** Track coordination events (agent registered, conflicts detected, stale agents pruned, file locks acquired).
- **Logging:** Log coordination state changes (agent registered/unregistered, file conflicts detected, coordination context injected).
- **Monitoring:** Add coordination state to GUI (show active agents, file locks, conflicts).
- **Analytics:** Track coordination effectiveness (conflicts prevented, false positives, coordination accuracy).

### Improvements to Agent Coordination

**Improvement #1: Coordination state querying and filtering**

Add methods to query coordination state by platform, tier, file path, or agent ID:

```rust
impl AgentCoordinator {
    pub async fn get_agents_by_platform(&self, platform: Platform) -> Result<Vec<ActiveAgent>> {
        self.store.read_coordination_agents_by_platform(platform).await
    }

    pub async fn get_agents_by_node(&self, node_id: &str) -> Result<Vec<ActiveAgent>> {
        self.store.read_coordination_agents_by_node(node_id).await
    }

    pub async fn get_agents_editing_file(&self, file: &Path) -> Result<Vec<ActiveAgent>> {
        self.store.read_coordination_agents_by_file(file).await
    }
}
```

**Improvement #2: Coordination state backup and recovery**

Automatically backup coordination state before each write, with retention policy:

```rust
// Legacy mirror-only source-lineage sketch. Canonical recovery is seglog/redb replay plus mirror export.
impl AgentCoordinator {
    async fn save_state(&self, state: &AgentCoordinationState) -> Result<()> {
        // Backup current state
        if self.state_file.exists() {
            let backup_file = self.state_file.with_extension(format!("bak.{}", Utc::now().timestamp()));
            let _ = std::fs::copy(&self.state_file, &backup_file);

            // Cleanup old backups (keep last 10)
            self.cleanup_old_backups().await?;
        }

        // Save new state (with locking as above)
        self.save_state_with_lock(state).await
    }

    async fn cleanup_old_backups(&self) -> Result<()> {
        // Implementation: list backup files, sort by timestamp, keep last 10
        // ...
    }
}
```

**Improvement #3: Coordination state validation and schema versioning**

Add schema versioning to coordination state to handle format changes:

```rust
// Legacy mirror-only source-lineage sketch. Canonical schema versions live in EventRecord payload schemas and registry rows.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCoordinationState {
    pub schema_version: u32, // Current version: 1
    pub active_agents: HashMap<String, ActiveAgent>,
    pub last_updated: DateTime<Utc>,
}

impl AgentCoordinator {
    fn validate_schema_version(&self, state: &AgentCoordinationState) -> Result<()> {
        const CURRENT_SCHEMA_VERSION: u32 = 1;

        if state.schema_version != CURRENT_SCHEMA_VERSION {
            return Err(anyhow!(
                "Coordination state schema version mismatch: expected {}, got {}",
                CURRENT_SCHEMA_VERSION,
                state.schema_version
            ));
        }

        Ok(())
    }

    async fn migrate_schema(&self, old_state: AgentCoordinationState) -> Result<AgentCoordinationState> {
        // Migrate old schema versions to current
        // ...
    }
}
```

### Handling Concurrent Subagent Execution

When multiple subagents run in parallel:

1. **Worktree Isolation**: Each subtask has its own worktree, so subagents don't interfere
2. **Independent Selection**: Each subtask selects subagents independently based on its own context
3. **Resource Management**: Platform runners handle concurrent invocations
4. **Context Sharing**: Completed subtasks share results via dependency chain, not direct subagent communication
5. **Coordination**: Agents coordinate through canonical seglog/redb coordination records and projections; optional shared state files are debug/export mirrors only (see "Agent Coordination and Communication" above)

**Example:**
```rust
// Parallel execution with different subagents
Level 0:
  - Subtask A (rust-engineer) → Worktree: .puppet-master/worktrees/A
  - Subtask B (react-specialist) → Worktree: .puppet-master/worktrees/B
  - Subtask C (python-pro) → Worktree: .puppet-master/worktrees/C

// All run concurrently, each with appropriate subagent
// Results merged back to main branch after completion
```

### Subagent Conflict Prevention

**Potential Conflicts:**
1. **File Conflicts**: Multiple subagents modifying same files
2. **Resource Conflicts**: Platform quota limits
3. **Context Conflicts**: Conflicting architectural decisions

**Mitigation Strategies:**

**Coordination-based prevention (primary):** Use agent coordination (see "Agent Coordination and Communication" above) to prevent conflicts:
- Agents append `coordination.agent_file_ownership_updated` for files they are editing or claiming for coordination.
- Before starting work, agents check `coordination_file_projection.v1` and `coordination_snapshot_projection.v1` for file conflicts.
- If conflict detected, agent waits or selects alternative files
- Coordination context injected into prompts warns agents about active files

**Conflict detection (secondary):** Detect conflicts before execution:

```rust
// src/core/subagent_selector.rs (additions)

pub struct SubagentConflictDetector;

impl SubagentConflictDetector {
    /// Check for potential conflicts between parallel subagents using coordination state
    pub async fn detect_conflicts(
        &self,
        subagent_groups: &[Vec<String>],
        contexts: &[ExecutionUnitContext],
        coordinator: &AgentCoordinator,
    ) -> Vec<Conflict> {
        let mut conflicts = Vec::new();
        let projection = coordinator.read_coordination_snapshot(CoordinationScope::current_run()).await.ok();

        // Check for overlapping file modifications using the redb coordination projection
        for (i, context_a) in contexts.iter().enumerate() {
            for (j, context_b) in contexts.iter().enumerate().skip(i + 1) {
                if let Some(snapshot) = &projection {
                    let overlapping = snapshot.overlapping_file_claims(&context_a.node_id, &context_b.node_id);

                    if !overlapping.is_empty() {
                        conflicts.push(Conflict {
                            type_: ConflictType::FileOverlap,
                            subtask_a: i,
                            subtask_b: j,
                            files: overlapping,
                        });
                    }
                }
            }
        }

        // Check for architectural conflicts
        for (i, subagents_a) in subagent_groups.iter().enumerate() {
            for (j, subagents_b) in subagent_groups.iter().enumerate().skip(i + 1) {
                if self.has_architectural_conflict(subagents_a, subagents_b) {
                    conflicts.push(Conflict {
                        type_: ConflictType::Architectural,
                        subtask_a: i,
                        subtask_b: j,
                        files: Vec::new(),
                    });
                }
            }
        }

        conflicts
    }

    fn has_architectural_conflict(
        &self,
        subagents_a: &[String],
        subagents_b: &[String],
    ) -> bool {
        // Check if subagents might make conflicting decisions
        // e.g., architect-reviewer vs different language engineers
        subagents_a.contains(&"architect-reviewer".to_string()) &&
        subagents_b.contains(&"architect-reviewer".to_string())
    }
}

pub enum ConflictType {
    FileOverlap,
    Architectural,
    ResourceLimit,
}

pub struct Conflict {
    pub type_: ConflictType,
    pub subtask_a: usize,
    pub subtask_b: usize,
    pub files: Vec<String>,
}
```
### Parallel Execution Configuration

**Concurrency caps rationale:** Per-platform concurrency limits exist for two reasons:

1. **Provider rate limits:** Each platform (Cursor, Codex, Claude Code, Gemini, Copilot) enforces rate limits on concurrent requests. Exceeding them causes throttling, errors, or temporary bans.
2. **Dev-machine load:** Agent processes consume CPU, disk I/O, and memory on the machine hosting the project folder. Running too many concurrent processes degrades the user's development environment.

**Source of caps:** The canonical concurrency limits are defined in the `Canonical crew-cap and availability rules` `executionLimits` anchor above. The plan graph defines only dependency structure (`depends_on`, plus blocking edges such as `blockers`/`unblocks` where applicable); max concurrent is an execution/config concern. See `Plans/Crosswalk.md` §3.7 for the ownership table.

**Crew limits vs agent limits:** These are separate concepts:
- **Per-platform agent cap:** limits individual concurrent agent/subagent processes per platform. This is what hits rate limits and machine load.
- **Crew cap** (`maxConcurrentCrewsPerPlatform`): limits concurrent crew groups per platform. A crew is a logical group of subagents working together.

Both limits apply: a crew spawn must not exceed either the crew cap or the per-platform agent cap. See the `Canonical crew-cap and availability rules` `executionLimits` anchor for canonical values.

### Benefits of Parallel Subagent Execution

1. **Faster Execution**: Multiple specialized subagents work simultaneously
2. **Better Specialization**: Each subtask gets the right subagent for its domain
3. **Resource Efficiency**: Worktrees isolate changes, preventing conflicts
4. **Scalability**: Can handle complex projects with many parallel subtasks

### Example: Multi-Language Project

**Scenario:** Full-stack project with Rust backend and React frontend

**Phase 1: Setup**
- `overseer` coordinates

**Task 1: Backend API**
- Subtask 1.1: Database schema (parallelizable)
  - `rust-engineer` + `database-administrator`
- Subtask 1.2: API endpoints (parallelizable)
  - `rust-engineer` + `api-designer`
- Subtask 1.3: Authentication (depends on 1.1, 1.2)
  - `rust-engineer` + `security-engineer`

**Task 2: Frontend UI**
- Subtask 2.1: Component library (parallelizable)
  - `react-specialist` + `frontend-developer`
- Subtask 2.2: API integration (depends on Task 1)
  - `react-specialist` + `frontend-developer`

**Execution Flow:**
```
Level 0 (Parallel):
  - 1.1: rust-engineer + database-administrator
  - 1.2: rust-engineer + api-designer
  - 2.1: react-specialist + frontend-developer

Level 1 (After Level 0):
  - 1.3: rust-engineer + security-engineer (inherits context from 1.1, 1.2)

Level 2 (After Task 1):
  - 2.2: react-specialist + frontend-developer (inherits API context from Task 1)
```

### Implementation Considerations

1. **Subagent Selection Timing**: Select subagents **before** building dependency groups, so each subtask knows its subagents
2. **Context Caching**: Cache project context detection to avoid repeated filesystem scans
3. **Worktree Management**: Ensure worktrees are created before subagent execution
4. **Result Aggregation**: Merge subagent outputs correctly when dependencies complete
5. **Error Handling**: If one parallel subtask fails, handle gracefully based on `continue_on_failure` config

### Updated Orchestrator Flow

```rust
// High-level flow with subagents and parallel execution

1. Detect project context (language, framework, domain) - CACHED
2. For each tier level:
   a. Build dependency graph
   b. Get parallelizable groups
   c. For each group:
      - Select subagents for each subtask (independent)
      - Create worktrees
      - Execute subtasks in parallel with their subagents
      - Merge results
      - Cleanup worktrees
3. Advance to next dependency level
```
