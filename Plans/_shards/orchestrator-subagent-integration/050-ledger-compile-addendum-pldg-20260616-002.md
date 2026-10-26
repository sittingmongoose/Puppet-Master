# Shard 050: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31282-L31389

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Ledger Compile Addendum - pldg-20260616-002

### OSI-428 - Bounded Extensive Subagent Waves

```yaml
plan_unit_id: OSI-428
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagents remain extensive in Orchestrator GoalRuns, but each SubagentWave is bounded, cost-aware, auditable, and parent-supervised. The rewritten vocabulary uses child_goal, subagent_wave, bounded_work_unit, capability_lane, agent_role, write_policy, parent_synthesis, verification_cycle, receipt, write_mode, and certification_tier instead of old tier-era wording; controller, planner, executor, reviewer, verifier, adjudicator, certifier, root_cause, and replan roles remain distinct in subagent routing and certification authority. Old fixed-hierarchy and tier-era labels may remain only as compatibility/search aliases for search or import; canonical runtime prose uses GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, and Receipt, and stale tier labels are not active canonical runtime semantics. Contracts_V0 owns shared schema/envelope references for these runtime records and storage-plan owns their persistence/projection boundaries. Low-end subagents may execute one bounded WorkNode, inspect one file/window, map evidence, review one diff, run one acceptance-check group, classify one blocker, diagnose one test/failure, check source lineage, or check stale evidence/spans; they must not make final routing, final certification, broad architecture, authority/scope, governance unlock, user/product tradeoff, or parent completion decisions. SubagentPolicy governs fanout thresholds, max parallel subagents, max cost per wave, bounded input limits, retry policy, and mandatory-subagent rules with default limits of 4 parallel children, 8 children per wave, 3 waves per GoalRun, 2000000 microusd per wave, 16000 estimated tokens per wave, 900000 wall-clock ms per child, 2 retry attempts per child, 1 retry attempt per wave, and 30000 ms retry backoff for provider_transient, rate_limit, tool_timeout, or coordination_conflict only.
gui_related: false
gui_classification_reason: Subagent task boundaries, capability lanes, and certification authority are runtime/orchestration behavior, not visual presentation.
depends_on: [GRS-026, GRS-027, OSI-426, EP-098, MS-109, PS-115, W-071]
unblocks: [OP-022, F3-394]
acceptance_criteria:
  - Subagent fanout remains central to Orchestrator design rather than collapsing into one smart agent.
  - Each SubagentWave records task boundaries, assigned inputs, capability lane, cost/budget policy, outputs, failures, and evidence refs.
  - Each bounded_work_unit records child_goal or parent WorkNode context, capability_lane, agent_role, write_policy, parent_synthesis expectation, verification_cycle expectation, receipt expectation, write_mode, and certification_tier when applicable.
  - Subagent policy records fanout thresholds, max parallel subagents, max cost per wave, bounded input limits, retry policy, and mandatory subagent rules.
  - SubagentPolicy receipts record evaluated thresholds, selected child count, parallelism cap, cost ceiling, retry budget, capability lanes, write policy, and compatibility aliases consumed.
  - Default limits are measurable in children, waves, microusd, estimated tokens, bytes, refs, write targets, wall-clock ms, and tool rounds; hard-limit exceedance blocks the wave rather than silently widening scope.
  - SubagentPolicy limits cannot exceed the parent Run_Modes run-envelope budget or remaining budget.
  - Low-end subagents cannot certify parent GoalRun completion or approve governance unlocks.
  - Parent synthesis and high-end certification remain required for meaningful completion.
  - Old fixed-hierarchy and tier-era labels remain compatibility/search aliases only; they do not replace GoalRun, WorkGraph, WorkNode, capability_lane, agent_role, SubagentWave, VerificationCycle, or Receipt terminology in active runtime prose.
  - Old tier/config-era code samples are not implemented literally as canonical runtime semantics.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator subagent wave runtime review
risk_class: subagent_authority_drift
reasoning_tier: high
context_scope: orchestrator_subagent_waves
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Goal_Runtime_System.md, Plans/Models_System.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md, Plans/Glossary.md]
node_compile_hint: {mode: bounded_subagent_wave_contract, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0018
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0014
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0028
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0029
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0030
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0031
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0032
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0034
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0035
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0037
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0064
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0075
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0087
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0088
  - pldg-20260616-002-orchestrator-goal-runtime-flow:corr-0002
  - pldg-20260616-002-orchestrator-goal-runtime-flow:corr-0003
preserved_exact_tokens:
  - "subagents are used extensively"
  - "bounded"
  - "cost per wave"
  - "low end agents"
  - "higher end agents"
  - "SubagentWave"
  - "child_goal"
  - "subagent_wave"
  - "bounded_work_unit"
  - "capability_lane"
  - "agent_role"
  - "write_policy"
  - "parent_synthesis"
  - "verification_cycle"
  - "receipt"
  - "write_mode"
  - "certification_tier"
  - "controller"
  - "planner"
  - "executor"
  - "reviewer"
  - "verifier"
  - "adjudicator"
  - "certifier"
  - "root_cause"
  - "replan"
  - "one WorkNode execution"
  - "one file/window analysis"
  - "parent completion"
  - "subagent policy"
  - "fanout thresholds"
  - "max parallel subagents"
  - "max cost per wave"
  - "bounded input limits"
  - "retry policy"
  - "mandatory"
  - "compatibility/search aliases"
  - "tier-era wording"
  - "GoalRun"
  - "WorkGraph"
  - "VerificationCycle"
  - "Receipt"
negative_constraints:
  - Do not convert Orchestrator into one smart agent doing everything.
  - Do not run broad unbounded expensive subagent sweeps unless explicitly justified.
  - Do not let low-end subagents certify parent completion.
  - Do not let subagents write overlapping live surfaces concurrently.
  - Do not implement old tier/config-era code samples literally.
  - Do not preserve old tier-era wording as the canonical execution model.
  - Do not keep stale tier labels as active canonical runtime semantics.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Goal_Runtime_System.md, Plans/Models_System.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md, Plans/Glossary.md]
```
