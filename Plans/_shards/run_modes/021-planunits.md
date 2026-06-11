# Shard 021: PlanUnits

Source: `Plans/Run_Modes.md`

Source lines: L727-L904

Source SHA256: `278c36fc1015a5ee27bf870d55c3f1147530f3880a98ebc4071ecc5e19ef74b0`

---

## PlanUnits

### RM-001 - Run Modes (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: RM-001
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: Plans/Run_Modes.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Run_Modes.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Modes-S0059
preserved_exact_tokens:
- Run Modes (Canonical SSOT)
- Canonical owner-section requirements
- Identity and blocked-policy transfer cluster
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md'
- 1. Canonical mode definitions
- 1.0 Runtime mode and workflow-overlay separation
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/orchestrator-subagent-integration.md'
- 1.1 `ask`
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'
- 1.2 `plan`
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
- 1.3 `regular`
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md'
- 1.4 `yolo`
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'
- 2. CLI-bridged execution strategies
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009'
- 2.1 HTE — Hosted Tool Execution
- 2.2 DAE — Delegated Agent Execution
- 2.2.1 DAE worktree context
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md'
negative_constraints:
- '- overlay choice must not widen runtime authority.'
- '- The canonical workspace MUST NOT be directly writable during DAE. Host-side reconciliation applies the verified jail diff back only after scans and FileSafe checks succeed.'
- '- `effective_mode_overlay = debug` with `mode ∈ {ask, plan}` is an invalid automated-debug combination and MUST be normalized before run spawn; the runtime must not execute a Debug investigation in read-only posture'
- '- `Debug Mode + yolo` is an advanced opt-in only and MUST NOT become the default Debug posture'
- '- `yolo` still requires DAE; if the provider policy snapshot does not allow DAE, the run MUST fail before provider spawn with `stop_reason = "yolo_requires_dae_provider"`; it MUST NOT silently downgrade to HTE'
- Three-level concurrency limits apply globally across all run strategies and MUST NOT be overridden by Persona or overlay configuration alone.
- '| `task_timeout_ms` | inherit parent remaining budget | Subagent task envelope | Per-task cap; may narrow parent budget but MUST NOT exceed it. |'
- '- Budget overrides MAY narrow defaults per run, but MUST NOT widen beyond the hard policy ceiling.'
- '- Queueing at concurrency caps is deterministic; PM MUST NOT silently discard or auto-widen queued work.'
- '- `kill.budget_exceeded` remains pre-dispatch only. Post-response budget-overrun cases use terminal `done.budget_exceeded` after usage has been durably recorded and MUST NOT be folded back into the pre-dispatch row above.'
- '- PM MUST NOT silently drop an incomplete run or rewrite it as `done.failed` without the crash marker'
- '- a failed teardown step emits a structured diagnostic; PM MUST NOT silently reuse poisoned process state or abandoned shell/session state'
- '| Provider tool-call observed | `kill.hte_tool_observed` | Any `tool_use` event observed in the provider stream. HTE MUST NOT allow delegated tool execution. |'
- '- `done.task_timeout` is the canonical terminal stop reason after timeout exhaustion completes the grace-period shutdown path. `kill.task_timeout` may exist as internal supervisor bookkeeping, but it MUST NOT be emitted as the consumer-facing terminal alias.'
- '- These terminal stop reasons MUST be preserved in the terminal `done` payload and persisted `run.completed` metadata. Consumers MUST NOT collapse post-response budget overruns back into pre-dispatch naming, and `done.timeout` is retired as a synonym.'
- '`read_only` excludes mutation-authority metadata (write scopes, DAE reconciliation metadata, and execution affordances). `plan_output_scaffold_v1` adds a deterministic plan/todo scaffold only. The overlay is applied during prompt/context compilation before attachments and the Injected Context breakd'
- '**AC-08:** UI/workflow state MUST normalize deterministically into the canonical runtime mode enum before strategy selection. `Interview`, `BrainStorm`, and `Crew` MUST NOT create additional runtime mode values.'
- '**AC-10:** In `yolo` mode, a provider with `dae_allowed != true` MUST fail before provider spawn with `stop_reason = "yolo_requires_dae_provider"`; it MUST NOT silently downgrade to HTE.'
- '**AC-11:** `kill.shell_failure` counts only actually executed shell failures for one canonical shell fingerprint. Policy denials, FileSafe blocks, UI-only terminal actions, and different shell fingerprints MUST NOT increment the same streak.'
- '**AC-12:** `kill.write_thrash` counts only qualifying content-changing writes to one normalized file identity within a sliding 10-minute window. Writes to different files, aged-out writes, and denied / blocked / no-diff operations MUST NOT trigger the ceiling.'
- '**AC-13:** Child/subagent/rotated follow-up runs MUST inherit the parent effective context overlay. A read-only parent run (`ask` or `plan`) MUST NOT widen into `full_execution` context in any child run.'
compatibility_only_notes:
- '- The legacy `/plan/regular` shorthand maps to the canonical ask/plan/regular default: HTE is used for `ask`, `plan`, and `regular` unless `regular` explicitly selects DAE and provider policy allows it.'
- Legacy A2A/OpenCode gap wording may call these ceilings `max_tokens` and `max_wall_time`; the canonical run-envelope keys are `max_estimated_tokens` and `max_wall_ms`, and both feed the budget and kill-condition enforcement below.
- '- Compatibility labels are canonicalized here: `shell-fingerprint` means the canonical shell fingerprint, `terminal-normalized` means the terminal normalized `done` and `/audit` outcome family, and `/replace/stop` covers explicit session replacement, restart, or user/parent stop paths.'
stale_retired_dispositions:
- '- Runtime-governance docs continue to sharpen rather than stabilize: - startup recovery remains split across policy, executor, and storage docs with no single owner deciding how interrupted attempts become `stale_historical` vs rehydrated vs `startup_recovered`. - retry/backoff policy is now more cl'
- Concurrency SSOT defaults are `max_concurrent_crews_per_platform=4`, `max_concurrent_agents_per_crew=8`, and `max_total_active_agents=32`; any 5-crews / 10-agents wording in downstream docs is stale drift and must be retired rather than treated as an alternate cap.
- '- `done.task_timeout` is the canonical terminal stop reason for elapsed-budget exhaustion after graceful teardown. Internal supervisor bookkeeping may classify the pre-terminal trigger as timeout exhaustion, but consumers MUST persist and inspect `done.task_timeout`; `kill.task_timeout` is retired a'
- '- These terminal stop reasons MUST be preserved in the terminal `done` payload and persisted `run.completed` metadata. Consumers MUST NOT collapse post-response budget overruns back into pre-dispatch naming, and `done.timeout` is retired as a synonym.'
owner_boundary_notes:
- '# Run Modes (Canonical SSOT)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for Puppet Master run modes. All other plan documents MUST reference this document by anchor (for example `Plans/Run_Modes.md#MODE-ask`) rather than restating mode definitions, strategy selection rules, budgets, or kill conditions.
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '- Context compilation + compaction owner: `Plans/Prompt_Pipeline.md`'
- '- HITL tier-boundary approvals: `Plans/human-in-the-loop.md`'
- '## 1. Canonical mode definitions'
- '- External IDE baselines such as JetBrains chat/agent modes and Junie validate that assistant modes may generate code, edits, and terminal commands with visible progress plus review/apply affordances in tool windows; PM still maps those affordances to `/agent`, `/apply`, operation-card/terminal surf'
- '- The legacy `/plan/regular` shorthand maps to the canonical ask/plan/regular default: HTE is used for `ask`, `plan`, and `regular` unless `regular` explicitly selects DAE and provider policy allows it.'
- '- The canonical workspace MUST NOT be directly writable during DAE. Host-side reconciliation applies the verified jail diff back only after scans and FileSafe checks succeed.'
- '- Child/subagent runs inherit the parent selected strategy unless a higher-level SSOT explicitly narrows it.'
- '- Debug target binding uses target-discovery heuristics and adapter-selection defaults owned by the relevant GUI, evidence, and tool surfaces; file-by-file canonical doc changes must land in those owner docs instead of creating a generic runtime-mode bucket'
- '- Runtime-governance docs continue to sharpen rather than stabilize: - startup recovery remains split across policy, executor, and storage docs with no single owner deciding how interrupted attempts become `stale_historical` vs rehydrated vs `startup_recovered`. - retry/backoff policy is now more cl'
- '- ELI5/Expert currently risks becoming a synonym generator. - the safer rule is: simplify explanation depth, not canonical object names - for example, `Feature Seam` should remain the term in both modes even if the ELI5 explanation is plainer'
- '- current work item posture remains `active`, but the center of gravity is shifting from exploration to owner-hardening'
- Concurrency SSOT defaults are `max_concurrent_crews_per_platform=4`, `max_concurrent_agents_per_crew=8`, and `max_total_active_agents=32`; any 5-crews / 10-agents wording in downstream docs is stale drift and must be retired rather than treated as an alternate cap.
- Legacy A2A/OpenCode gap wording may call these ceilings `max_tokens` and `max_wall_time`; the canonical run-envelope keys are `max_estimated_tokens` and `max_wall_ms`, and both feed the budget and kill-condition enforcement below.
- '| `max_same_shell_failure` | 3 | DAE / host-managed shell surfaces | Consecutive failures of the same canonical shell fingerprint before stop. |'
- '- Canonical run-envelope exact defaults are `max_nesting_depth=4`, `max_total_spawned_agents=99`, and `max_tool_rounds=200`; the kill table consumes those fields without inventing alternate caps.'
owner_hints:
- Plans/Run_Modes.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

