## Relationship Between the Two Plans

The project uses **two plan documents** that divide scope by execution context:

| Plan | Scope | Tier levels |
|------|--------|-------------|
| **orchestrator-subagent-integration.md** (this document) | Main run loop: PRD-driven execution of Phase → Task → Subtask → Iteration. Subagent selection, plan mode, config wiring, and start/end verification for the **orchestrator** run. | Phase, Task, Subtask, Iteration |
| **interview-subagent-integration.md** | Interview flow: multi-phase interview (Scope & Goals, Architecture, UX, Data, Security, Deployment, Performance, Testing). Subagent persona assignments **per interview phase**, prompt integration, research/validation, document generation. | Interview phases (1-8 and cross-phase) |

**Overlap and consistency:** Both plans reference subagent names, platform invocation, and config (e.g. tier config, plan mode). The **orchestrator** plan is the single source of truth for: tier-level subagent strategy, config-wiring validation at Phase/Task/Subtask/Iteration, and start/end verification (wiring + quality). The **interview** plan is the source of truth for: interview-phase subagent assignments, interview-specific config (e.g. `InterviewOrchestratorConfig`), and interview testing. When implementing, resolve any conflict by tier/context: orchestrator run vs interview run.

**Application and project rules:** **Plans/agent-rules-context.md** defines **application-level rules** (Puppet Master; e.g. "Always use Context7 MCP") and **project-level rules** (target project; e.g. "Always use DRY Method") that are fed into **every** agent. The orchestrator must include the shared rules pipeline output when building iteration prompts (see that plan for the single pipeline and injection point).

### Context management across tiers (Phase → Task → Subtask → Iteration)

Rule: For every tier run, the orchestrator MUST assemble agent run context as explicit bundles (Instruction / Work / Memory) and MUST apply tier visibility rules so Iteration runs receive minimal but sufficient context (including optional Parent Summary and Attempt Journal injection where enabled).

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim

Rule: The orchestrator MUST compute and persist an “Injected Context” breakdown per Iteration run (included `AGENTS.md` chain, parent summary, attempt journal, and any truncation applied) so UI surfaces can display it deterministically.

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

**Cited web search:** **Web search with citations** (inline citations + Sources list) is shared by the **Assistant**, **Interview**, and **Orchestrator**; the same run config and MCP/tool wiring apply. See **Plans/newtools.md** §8 (cited web search, [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited)-style) and **Plans/assistant-chat-design.md** §7.

**Tool permissions:** **Plans/Tools.md** defines the central tool registry and permission model (allow/deny/ask, granular rules, [OpenCode Permissions](https://opencode.ai/docs/permissions/)). Run config snapshot includes tool permissions; in headless orchestrator runs, "ask" maps to deny or HITL. Tier/subagent config may override permissions per agent. See Tools.md §2.5 and §8.2-§8.3.

**ELI5/Expert copy alignment:** Any authored tooltip/help/interviewer copy referenced by orchestrator-facing UI in this plan (for example plan-mode hints, tier explanations, interview controls) must follow `Plans/FinalGUISpec.md` §7.4.0. Defaults are fixed: app-level **Interaction Mode (Expert/ELI5)** ON (ELI5), chat-level **Chat ELI5** OFF (Expert). The chat toggle only affects assistant chat style prompts and must not alter tooltip/interviewer variant selection.

### Respecting PRD/plan: subagent personas and parallelization

The **orchestrator must respect** two kinds of information that the interview (or other plan author) writes into the PRD/plans: **subagent persona recommendations** and **parallelization**.

1. **Subagent persona recommendations.** When the PRD (or loaded plan) contains **subagent recommendations** for a task or subtask in `crew_recommendation.subagents` (interview-subagent-integration §5.2 and Crew-Aware Plan Generation), the orchestrator **must use those personas** when executing that tier. Use the recommended subagent set as the source for which subagents to invoke; only fall back to dynamic selection (e.g. `select_for_tier`) when the PRD/plan does not specify recommendations for that item. Config overrides (disabled/required/override lists) can still apply on top of PRD recommendations. This ensures that interview-generated plans are executed with the intended specialists.

2. **Parallelization.** When the PRD/plan contains **parallelism** information (e.g. `depends_on` and `parallel_group` per STATE_FILES.md §3.3 and interview-subagent-integration §5.2), the orchestrator **must respect it** when building the execution schedule. Build a dependency graph from `depends_on`; run tasks/subtasks that have no unsatisfied dependencies, and run items in the same `parallel_group` **in parallel** where the execution engine supports it. Do not run items in parallel when the plan says they depend on another; do run independent items in parallel when the plan allows it. See **Schedule building: order of operations** below.

**Subagent selection: order of operations.** (1) Load the PRD and the current tier item (phase/task/subtask). (2) Read `crew_recommendation` for that item; if absent, go to step 5. (3) Read `crew_recommendation.subagents`; if missing or empty array, treat as **no recommendation** and go to step 5. (4) Use the list in `subagents` as the source set for which subagents to invoke; apply config overrides (disabled/required/override) on top; then exit. (5) Fall back to dynamic selection (e.g. `select_for_tier`) for this item; apply config overrides on top.

**Schedule building: order of operations.** (1) Build a dependency graph from `depends_on` at the tier level(s) the orchestrator schedules (e.g. subtasks). Use item ids; support phase, task, and subtask ids as in STATE_FILES. Missing `depends_on` or empty array = no incoming edges. (2) Topological sort the graph; items with no unsatisfied dependencies form the next runnable set. (3) Within the runnable set, group items that share the same non-empty `parallel_group`; items in the same group may run in parallel. (4) Execute batches in topological order: run each batch (possibly multiple items in parallel) before advancing to items that depend on them.

### Respecting PRD/plan: plan graph consumption (user projects)

For user projects created by Puppet Master, the orchestrator MUST consume a **SHARDED-ONLY** plan graph and MUST be able to execute headless from the sharded plan graph representation **alone** (no `Plans/` folder assumptions, and no reliance on any monolithic derived export file).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

Constraints:
- **No user-project `Plans/` assumptions:** Do not require or read `Plans/` from the target project; Puppet Master `Plans/` are internal references only.
- **No schema copying:** Validate artifacts against internal schemas, but do NOT embed/copy internal schema definitions into user-project artifacts (only `schema_version` / hash metadata as required).
- **Canonical persistence:** All required user-project planning artifacts MUST be written under `.puppet-master/project/...` and MUST be persisted canonically in **seglog**. Filesystem copies are reproducible materializations of the seglog canonical content.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, Primitive:Seglog

Canonical planning artifact paths and field-level contracts are defined in the SSOT:

- `Plans/Project_Output_Artifacts.md`
- `Plans/project_plan_graph_index.schema.json` (`pm.project-plan-graph-index.v1`)
- `Plans/project_plan_node.schema.json` (`pm.project-plan-node.v1`)
- `Plans/contracts_index.schema.json` (`pm.project_contracts_index.schema.v1`)
- `Plans/acceptance_manifest.schema.json` (`pm.acceptance_manifest.schema.v1`)

This document intentionally keeps only orchestrator-specific consumption behavior. For execution, the orchestrator MUST treat the following as required inputs:

- `.puppet-master/project/plan_graph/index.json`
- referenced `.puppet-master/project/plan_graph/nodes/<node_id>.json` shards
- `.puppet-master/project/contracts/index.json`
- `.puppet-master/project/acceptance_manifest.json`

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1, SchemaID:pm.project_contracts_index.schema.v1

Optional supplemental artifacts:

- `.puppet-master/project/plan_graph/edges.json` (supplemental consistency view)
- `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` (derived export only; non-canonical and never required)

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1, SchemaID:pm.project-plan-node.v1

#### Load order and validation behavior (user projects)

1. Load `.puppet-master/project/plan_graph/index.json` first and validate graph-level invariants:
   - `schema_version` present
   - `nodes[]` present and non-empty
   - every `nodes[].path` matches `nodes/<node_id>.json`
   - every `nodes[].sha256` present
   - `entrypoints` present and every entrypoint node ID resolves to an existing node shard (by ID derived from `nodes[].path`)
   - `validation.targets` present and includes pointers to required validation targets (contracts index + acceptance manifest)
2. Load each `.puppet-master/project/plan_graph/nodes/<node_id>.json` shard referenced by the index, validate required fields, and validate integrity:
   - shard `node_id` matches filename (`<node_id>.json`)
   - shard bytes hash to the corresponding `nodes[].sha256`
3. If `.puppet-master/project/plan_graph/edges.json` exists:
   - load it as a supplemental view and validate it is **consistent** with node-level `depends_on` (no extra edges, no missing edges)
   - if inconsistent, treat as an integrity error (do not silently choose one representation over the other)
4. If a derived export `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` exists:
    - treat it as **derived** (non-canonical) reference artifact
    - the orchestrator MAY compare it for consistency, but MUST NOT use it as the scheduling/readiness source
    - the orchestrator MUST NOT require `plan_graph/exports/plan_graph.monolithic.json` to exist for headless execution

ContractRef: ContractName:Plans/Project_Output_Artifacts.md
5. Load and validate required validation targets:
    - **Project Contract Pack:** `.puppet-master/project/contracts/index.json` must validate (`pm.project_contracts_index.schema.v1`) and every `ProjectContract:*` referenced by any node MUST resolve via this index.
   - **Acceptance registry:** `.puppet-master/project/acceptance_manifest.json` must validate (`pm.acceptance_manifest.schema.v1`) and cover every node acceptance ref (e.g. `acceptance[].check_id`). Validate that every acceptance check is **automatable** (no human-only criteria).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project_contracts_index.schema.v1, SchemaID:pm.acceptance_manifest.schema.v1
6. Validate node execution policy fields (`allowed_tools`, `tool_policy_mode`, `policy_mode`) are present and legal per `Plans/Project_Output_Artifacts.md` before scheduling.
7. **UI wiring validation (conditional; when `.puppet-master/project/ui/` exists):**
   - Validate `ui/wiring_matrix.json` against the wiring matrix schema (adapted from `Plans/Wiring_Matrix.schema.json`): all required fields present (`ui_element_id`, `ui_location`, `ui_command_id`, `handler_location`, `expected_event_types`, `acceptance_checks`, `evidence_required`).
    - Validate `ui/ui_command_catalog.json`: every `UICommandID` has a description and handler reference.
   - **Coverage check:** Every `UICommandID` in the command catalog has at least one wiring matrix entry. Every wiring matrix entry's `ui_command_id` exists in the command catalog.
   - **No unbound UI actions:** Every interactive UI element in the wiring matrix has a bound `UICommandID` and a non-empty `handler_location` (no placeholder or empty handler references).
   - **Plan node cross-reference:** Every plan node whose `objective` or scope involves UI work (creating/modifying interactive elements) MUST include at least one `contract_refs` entry pointing to a wiring matrix entry or command catalog ID. Flag nodes with UI scope but no wiring reference as a validation warning.
   - If any required UI wiring validation fails, treat as a planning-artifact integrity error (same severity as contract/acceptance validation failures).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project_contracts_index.schema.v1, SchemaID:pm.acceptance_manifest.schema.v1
8. If any required validation fails, halt scheduling and return a planning-artifact integrity error (no silent fallback, and no skipping contract/acceptance validation).

ContractRef: Gate:GATE-001, Gate:GATE-010, ContractName:Plans/UI_Wiring_Rules.md

Scheduling inputs must be sourced only from the validated canonical sharded plan graph (`plan_graph/index.json` + referenced node shards):

- `depends_on` (from node shards; if `edges.json` exists, it MUST match)
- `blockers` / `unblocks` from node definitions
- `parallel_group` metadata when available

ContractRef: Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md

Node states (scheduler-level; persisted per node):
- `runnable`: dependencies satisfied; not `complete`; not `blocked`; not `waiting_approval`
- `running`: currently executing
- `waiting_approval`: paused for HITL approval (mid-node and/or tier boundary); record an approval request and required action
- `blocked`: cannot proceed until a condition is met (e.g. missing contract/acceptance resolution, denied approval, or rework required); record `block_reason`
- `complete`: acceptance passed + evidence bundle written/validated

Scheduling rule ("continue other work when approvals pending"):
- The scheduler MUST continue executing other `runnable` nodes while any node is `waiting_approval` and/or `blocked`.
- A `waiting_approval`/`blocked` node only blocks its dependents via the dependency graph; it MUST NOT block unrelated runnable nodes.
- A run pauses only when the runnable set is empty and at least one node is `waiting_approval` (HITL needed) or `blocked` (intervention/replan needed).

ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-005, ContractName:Plans/Executor_Protocol.md

Execution policy notes:

- **Sharded-only (canonical):** The sharded plan graph (`plan_graph/index.json` + node shards) is the canonical on-disk representation for user projects and is sufficient for headless execution. Any derived export (`plan_graph/exports/plan_graph.monolithic.json`) is optional and non-canonical.
- `plan.md` is a human-readable summary view, but scheduler decisions come from the validated graph (not `plan.md`).
- All planning artifacts are canonical in seglog via full-content artifact events (chunked when needed with deterministic ordering and final `sha256` integrity events). Filesystem copies under `.puppet-master/project/` are reproducible materializations.
- **HITL + non-blocked continuation:** If a node enters `waiting_approval` (e.g. due to `tool_policy_mode: "ask"` or explicit boundary approvals), the scheduler MUST continue executing other runnable nodes where dependencies allow.
- **Automatable acceptance criteria:** Every node MUST have automatable acceptance criteria; record results in the node's evidence bundle and do not mark a node complete if acceptance fails.
- **Evidence bundles:** On node completion, the orchestrator MUST write an evidence bundle at `.puppet-master/project/evidence/<node_id>.json` (schema `pm.evidence.schema.v1`) and persist it canonically to seglog; a node MUST NOT be marked complete without valid evidence.
- **Deterministic ambiguity handling:** When ambiguity occurs during execution, resolve deterministically per `Plans/Decision_Policy.md` and append a machine-consumable record to `.puppet-master/project/auto_decisions.jsonl` (schema `pm.auto_decisions.schema.v1`).
- Authoritative artifact and schema contract: `Plans/Project_Output_Artifacts.md`.

ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-005, ContractName:Plans/Executor_Protocol.md

**Cross-reference:** STATE_FILES.md §3.3 (canonical PRD schema); **Plans/interview-subagent-integration.md** §5.2 and Crew-Aware Plan Generation.

