# Shard 014: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31077-L31164

Source SHA256: `f3d48e18324a62c3bb3589925d92cc06651b368d686cea36757e9d9cc56c9084`

---

## Ledger Compile Addendum - pldg-20260616-002

### OSI-428 - Bounded Extensive Subagent Waves

```yaml
plan_unit_id: OSI-428
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagents remain extensive in Orchestrator GoalRuns, but each SubagentWave is bounded, cost-aware, auditable, and parent-supervised. The rewritten vocabulary uses child_goal, subagent_wave, bounded_work_unit, capability_lane, agent_role, write_policy, parent_synthesis, verification_cycle, receipt, write_mode, and certification_tier instead of old tier-era wording. Low-end subagents may execute one bounded WorkNode, inspect one file/window, map evidence, review one diff, run one acceptance-check group, classify one blocker, diagnose one test/failure, check source lineage, or check stale evidence/spans; they must not make final routing, final certification, broad architecture, authority/scope, governance unlock, user/product tradeoff, or parent completion decisions. Subagent policy must govern fanout thresholds, max parallel subagents, max cost per wave, bounded input limits, retry policy, and when subagents are mandatory.
gui_related: false
gui_classification_reason: Subagent task boundaries, capability lanes, and certification authority are runtime/orchestration behavior, not visual presentation.
depends_on: [GRS-026, GRS-027, OSI-426, EP-098, MS-109, PS-115, W-071]
unblocks: [OP-022, F3-394]
acceptance_criteria:
  - Subagent fanout remains central to Orchestrator design rather than collapsing into one smart agent.
  - Each SubagentWave records task boundaries, assigned inputs, capability lane, cost/budget policy, outputs, failures, and evidence refs.
  - Each bounded_work_unit records child_goal or parent WorkNode context, capability_lane, agent_role, write_policy, parent_synthesis expectation, verification_cycle expectation, receipt expectation, write_mode, and certification_tier when applicable.
  - Subagent policy records fanout thresholds, max parallel subagents, max cost per wave, bounded input limits, retry policy, and mandatory subagent rules.
  - Low-end subagents cannot certify parent GoalRun completion or approve governance unlocks.
  - Parent synthesis and high-end certification remain required for meaningful completion.
  - Old tier/config-era code samples are not implemented literally as canonical runtime semantics.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Orchestrator subagent wave runtime review
risk_class: subagent_authority_drift
reasoning_tier: high
context_scope: orchestrator_subagent_waves
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Goal_Runtime_System.md, Plans/Models_System.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/FinalGUISpec.md, Plans/Glossary.md]
node_compile_hint: {mode: bounded_subagent_wave_contract, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0018
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
negative_constraints:
  - Do not convert Orchestrator into one smart agent doing everything.
  - Do not run broad unbounded expensive subagent sweeps unless explicitly justified.
  - Do not let low-end subagents certify parent completion.
  - Do not let subagents write overlapping live surfaces concurrently.
  - Do not implement old tier/config-era code samples literally.
  - Do not preserve old tier-era wording as the canonical execution model.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Goal_Runtime_System.md, Plans/Models_System.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/FinalGUISpec.md, Plans/Glossary.md]
```
