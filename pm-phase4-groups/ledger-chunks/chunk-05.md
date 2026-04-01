### Phase 3: Deep Re-Audit (Waves 1–3)

Focused deep re-audit on orchestrator, provider, subagent, filemanager, editor, and terminal docs.
51 Opus 4.6 subagents launched across 3 waves; all 51 collected successfully.
~1,050 raw findings total.

#### Wave 1 — Orchestrator / Execution (16 agents, ~400 findings)

**orch-core** (orchestrator-subagent-integration.md body L1-2000): 37 findings (9 blocker, 11 HIGH)
- Body uses entirely stale Phase→Task→Subtask→Iteration model with 424+ tier refs
- Zero node/package/lane/seam vocabulary in body sections
- §3 remediation loop defines its own retry/escalation model incompatible with Executor_Protocol.md
- §7.2 Dashboard spec references TierTree widget with stale data model
- Body execution loop structurally incompatible with DAG-based scheduler in addenda
- Persona system not referenced in body at all — addenda say it's "first-class runtime role contract"

**orch-lifecycle** (orchestrator-subagent-integration.md L2000-4200): 59 findings (17 blocker, 24 HIGH)
- Remediation model in §3 is a "parallel universe" — defines retry/backoff/escalation that contradicts Executor_Protocol
- Dead vocabulary pervasive: `TierNode`, `TierType`, `tier_id`, `phase`, `task`, `subtask`, `iteration`
- Subagent selection code uses `select_for_tier()` — contradicts Persona addendum's `persona_registry`
- Score tuple references missing — body has no scored ready-set model
- §5 conflict resolution uses stale `TierContext` type
- Commit message format strings use `"tier: {tier_id}"` — ambiguous

**orch-parallel** (orchestrator-subagent-integration.md L4200-6270): 57 findings
- Crews mega-section (§6) unbuildable — references `CrewDefinition` type with fields that don't exist in any schema
- Parallel execution model assumes sequential tier traversal, contradicting DAG scheduler
- `ResourcePool` and `ConcurrencyManager` types defined here but nowhere else
- Inter-crew communication protocol is prose-only, no event schema
- Stale terminology throughout: "tier boundaries", "phase inspector", "subtask completion"

**orch-addenda** (orchestrator-subagent-integration.md L6270-7026): 32 findings (6 S1, 20 S2, 6 S3)
- L6272-6660: "Autonomous QA Loop" (390 lines) entirely dead code using superseded types — structurally incompatible with scheduler model 200 lines later
- L6683: `### Tier-specific Persona defaults` is EMPTY — zero content under header
- Four near-identical addenda at L6961-7026 all open with "The orchestrator is the primary consumer" — L7001-7013 and L7014-7026 are **verbatim identical**
- `node.prerequisite_resolved` referenced as wake event but does NOT exist in Executor_Protocol's canonical wake list (L481-493)
- `retry_count` called "display-only" but Executor_Protocol has sub-counter model with no field called `retry_count`
- Backoff durations `1s, 5s, 15s` exist ONLY here — no canonical owner
- Runtime fields list (16 fields at L6839) overlaps Executor_Protocol but several fields (`selected_at_utc`, `scheduler_score_breakdown`) are orphaned — not in EP, Contracts_V0, or storage-plan
- Wake causes list uses informal names ("node finished") instead of canonical enum values; lists only 9 of 13 EP canonical values; omits `auth_recovered`, `startup_recovered`, `watchdog_recheck`
- `worktree_conflict` and `dirty_worktree` added as `blocked_reason_code` values but NOT present in Contracts_V0.md canonical enum
- Remediation children visibility contract says they're "not canonical graph nodes" but never specifies how they participate in scheduling

**orch-verify** (orchestrator-subagent-integration.md cross-verification): 42+ findings (6 blocker)
- Confirmed body/addenda split-brain is pervasive — addenda reference a completely different execution model
- ContractRef tags in body point to stale sections; addenda ContractRefs are better but still incomplete
- No single authoritative list of runtime fields — must union L6841 (16 fields) and L6927 (10 fields) with EP

**exec-core** (Executor_Protocol.md L1-300): 17 findings (4 P1, 13 P2)
- §2.1 execution context mentions `TierContext` as deprecated but provides no replacement type name
- `attempt_record` key has 4 components in §2.3 (with project_id) but addendum has 3 components — conflict
- `blocked_projection` key shape has 3-way conflict across 3 locations
- Score tuple well-specified but no storage binding for `scheduler_score_breakdown`
- `failure_class` taxonomy lists 7 classes but boundary between `provider_transient` and `provider_capacity` is ambiguous

**exec-addenda** (Executor_Protocol.md L300-601): 17 findings (2 P1, 9 P2)
- Counter semantics conflict: L820 says `retry_count = attempt_count - 1` but L941-944 defines sub-counter decomposition where `attempt_count = automatic_retry_count + prerequisite_resume_count + manual_resume_count + remediation_retry_count + 1`
- Remediation lineage well-specified but remediation ceiling has no numerical bounds anywhere
- `node.prerequisite_resolved` event referenced but not in canonical event list
- Wake-reason addendum adds 3 values (`auth_recovered`, `startup_recovered`, `watchdog_recheck`) but these aren't in orchestrator addenda wake list

**contracts-core** (Contracts_V0.md L1-600): 19 findings (5 S1, 8 S2)
- §1.1 duplicate numbering — two different §1.1 sections
- `remediation.resolved` enum has zero overlap between 03-08 addendum (`success|failed|ceiling_exceeded`) and 03-09 addendum (`fixed|superseded|abandoned|replan_required`)
- `failure_class` enum position ambiguous — defined in EP but consumed in Contracts_V0 without import
- Attempt events (`node.attempt_started`, etc.) have no declared producer
- Codex auth still lists `OAuthDeviceCode` — stale

**contracts-addenda** (Contracts_V0.md L600-1144): 19 findings (3 CRIT, 5 HIGH)
- `remediation.resolved` resolution enum irreconcilable between two addenda — zero shared values
- `blocked_reason_code` enum in Contracts_V0 does NOT include `worktree_conflict` or `dirty_worktree` that orchestrator addenda introduce
- `allowed_action_id` enum has 10 values but chat blocked-state addenda use non-canonical action names (`Resume Wizard`, `View report`, `Provide new input`, `Open in Chat`)
- Investigation context `§5.1A` has field name divergence from chat `§12.0A` (`primary_target` vs `primary_target_summary`, `final_or_intermediate_state` vs `state`)

**interview-core** (interview-subagent-integration.md L1-800): 40 findings (11 HIGH)
- Slash-command contamination: `/interview start`, `/interview status` etc. referenced but slash commands aren't the canonical interface
- Persona field name crisis: `interview_persona` vs `effective_persona` vs `persona_id` used inconsistently
- `get_subagents_for_tier()` function uses stale tier model
- Phase selector input types don't match chain-wizard PhaseSelectorContract

**interview-impl** (interview-subagent-integration.md L800-1600): 43 findings (4 HIGH, 27 MED)
- Research agent dispatch code uses `tier_type` for selection — stale
- Question generation pipeline references `phase.config.max_questions` but no schema for phase config
- Evidence collection format unspecified — just says "structured research output"
- Fragment unification pass has no ownership assignment (who runs it?)

**interview-addenda** (interview-subagent-integration.md L1600-2269): 27 findings (1 CRIT, 12 HIGH)
- `requirements_quality_report` schema diverges from chain-wizard-flexibility.md §14.1
- Duplicate section at EOF (exact copy of earlier content)
- `stage_complete` event has no schema in Contracts_V0
- Phase-to-persona mapping references persona IDs that don't exist in Personas.md

**hitl** (human-in-the-loop.md): 15 findings (2 HIGH, 7 MED)
- HITL gates defined at "tier boundaries" — no package-complete or seam-complete gates
- Permission ask flow `once`/`always`/`reject` never mapped to `cmd.runtime.approve`/`cmd.runtime.decline`
- No bridge between HITL `approval_request` and chat blocked-state lifecycle
- `always` approval is session-scoped only — no durable/permanent path

**run-modes** (Run_Modes.md): 16 findings (3 P1, 4 P2)
- `debug` overlay defined here (L37, L152) but missing from chat §29.1 closed enum at L1966
- Sensitivity-aware forwarding (part 7 of runtime contract) has zero implementation spec
- Runtime mode transitions during tool execution have no atomic guarantee
- `yolo` mode has no permission escalation contract

**progression-gates** (Progression_Gates.md): 31 findings (6 S1, 12 S2)
- No package-complete or seam-complete gates — only tier-level gates exist
- Gate predicates use stale `tier_status` field
- No gate for remediation ceiling — blocked episodes can accumulate without circuit breaker
- Score threshold for dispatch is in EP but not cross-referenced here
- `gate.evaluation_started` / `gate.passed` / `gate.failed` events not in Contracts_V0

**prompt-pipeline** (Prompt_Pipeline.md): 20 findings (8 HIGH, 7 MED)
- Run envelope embeds `tier` and `mode` — no node/package/lane identity fields
- System prompt assembly references persona but not via canonical `effective_persona` resolution
- Token budget allocation algorithm is prose-only — no formula or pseudocode
- Context window management strategy ("smart truncation") undefined
- No sensitivity-aware forwarding implementation

#### Wave 2 — FileManager / Editor / Terminal / Tools / Storage (15 agents, ~350 findings)

**filemgr-core** (FileManager.md L1-500): 19 findings (1 P0, 2 P1)
- P0: §10.10 "LSP Integration" referenced in TOC but section doesn't exist (phantom)
- §9A terminal integration structurally incompatible with FinalGUISpec §5.1 terminal ownership model
- File-tree virtual scroll has no performance contract (max items? lazy loading threshold?)
- Drag-and-drop targets listed but no drop-rejection rules for invalid targets

**filemgr-impl** (FileManager.md L500-966): 30 findings (4 HIGH)
- §10.5-10.10: multiple phantom sections in TOC that don't exist in body
- Remote file operations have no timeout/retry contract
