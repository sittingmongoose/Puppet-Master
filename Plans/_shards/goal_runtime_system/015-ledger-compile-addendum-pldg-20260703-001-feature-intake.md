# Shard 015: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Goal_Runtime_System.md`

Source lines: L2394-L3114

Source SHA256: `c364c8a56534bfa55e15d74218dac25322c02987445aec5d2980f4bc89f62fec`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### GRS-033 - P1-AGENT-FOCUS-WATCHDOG

```yaml
plan_unit_id: GRS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-AGENT-FOCUS-WATCHDOG (P1) is compiled as canonical Puppet Master intent for Agent focus/progress watchdog for GUI: Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents. The preserved PM gap/delta is: Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering. The observed external-repo signal remains source-lineage evidence: Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p1_agent_focus_watchdog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0021
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0021
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0017/P1-AGENT-FOCUS-WATCHDOG@line=17
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0017/P1-AGENT-FOCUS-WATCHDOG
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:17
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0021
external_atom_id: extrepo-20260703-0017
source_row_id: P1-AGENT-FOCUS-WATCHDOG
priority: P1
finding_family: Agent focus/progress watchdog for GUI
source_repos:
- warpdotdev/warp
- cline/cline
- openai/codex
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
preserved_exact_tokens:
- extrepo-20260703-0017
- P1-AGENT-FOCUS-WATCHDOG
- P1
- Agent focus/progress watchdog for GUI
- warpdotdev/warp
- cline/cline
- openai/codex
negative_constraints: []
observed_signal: Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.
pm_current_coverage: PM has Goal Runtime and closure registry concepts, but terminal/dev-loop progress integration can be stronger.
pm_gap_or_delta: 'Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering.'
proposal_or_recommendation: Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents.
compile_disposition: create_new_planunit
```

### GRS-034 - P1-INTERRUPT-CANCEL-SETTLEMENT

```yaml
plan_unit_id: GRS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-INTERRUPT-CANCEL-SETTLEMENT (P1) is compiled as canonical Puppet Master intent for User stop/interrupt halts active agent and tools safely: Imported external-repo finding extrepo-20260703-0028 / P1-INTERRUPT-CANCEL-SETTLEMENT (P1). The preserved PM gap/delta is: Define cancellation propagation and settlement: provider stream, subprocess, MCP call, browser/device, child run; no conversion to success/failure; history interruption boundary. The observed external-repo signal remains source-lineage evidence: Agent Zero issue requests stop/interrupt for active chat/tool calls without container restart and with history preserved; OpenCode v2 includes sessions.interrupt and Effect interruption.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Stop active MCP call leaves partial/cancelled result
- Stop provider stream does not replay unfinished assistant/tool turn
- UI returns idle with preserved history
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Stop active MCP call leaves partial/cancelled result
- Stop provider stream does not replay unfinished assistant/tool turn
- UI returns idle with preserved history
risk_class: p1_mcp_tools_and_tool_settlement_hardening
reasoning_tier: standard
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: p1_interrupt_cancel_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0032
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0032
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0028/P1-INTERRUPT-CANCEL-SETTLEMENT@line=28
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0028/P1-INTERRUPT-CANCEL-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:8
source_atom_ids:
- atom-0032
external_atom_id: extrepo-20260703-0028
source_row_id: P1-INTERRUPT-CANCEL-SETTLEMENT
priority: P1
finding_family: User stop/interrupt halts active agent and tools safely
source_repos:
- agent0ai/agent-zero
- anomalyco/opencode
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0028
- P1-INTERRUPT-CANCEL-SETTLEMENT
- P1
- User stop/interrupt halts active agent and tools safely
- agent0ai/agent-zero
- anomalyco/opencode
negative_constraints: []
observed_signal: Agent Zero issue requests stop/interrupt for active chat/tool calls without container restart and with history preserved; OpenCode v2 includes sessions.interrupt and Effect interruption.
pm_current_coverage: Tools has cancelled normalized outcome and terminal/session actions exist.
pm_gap_or_delta: 'Define cancellation propagation and settlement: provider stream, subprocess, MCP call, browser/device, child run; no conversion to success/failure; history interruption boundary.'
compile_disposition: create_new_planunit
```

### GRS-035 - P0-AGENT-CONTROL-PLANE-ENVELOPE

```yaml
plan_unit_id: GRS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-AGENT-CONTROL-PLANE-ENVELOPE (P0) is compiled as canonical Puppet Master intent for Agent control / autonomy / effort / resource envelope: Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs. The preserved PM gap/delta is: Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry. The observed external-repo signal remains source-lineage evidence: Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline
  and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every child run persists AgentControlEnvelope before first provider/tool call.
- GUI can show requested/effective autonomy, model, effort, budgets, and authority.
- A child/subagent cannot exceed parent ceiling even if model/tool output requests it.
- Completion receipts include envelope hash and final budget state.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every child run persists AgentControlEnvelope before first provider/tool call.
- GUI can show requested/effective autonomy, model, effort, budgets, and authority.
- A child/subagent cannot exceed parent ceiling even if model/tool output requests it.
- Completion receipts include envelope hash and final budget state.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_agent_control_plane_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0059
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0059
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0055/P0-AGENT-CONTROL-PLANE-ENVELOPE@line=55
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0055/P0-AGENT-CONTROL-PLANE-ENVELOPE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:1
source_atom_ids:
- atom-0059
external_atom_id: extrepo-20260703-0055
source_row_id: P0-AGENT-CONTROL-PLANE-ENVELOPE
priority: P0
finding_family: Agent control / autonomy / effort / resource envelope
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
- Warp
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0055
- P0-AGENT-CONTROL-PLANE-ENVELOPE
- P0
- Agent control / autonomy / effort / resource envelope
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
- Warp
negative_constraints: []
observed_signal: Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.
pm_current_coverage: PM already has Goal Runtime role-policy, progress fingerprints, hard budgets, parent/child goals, verification repair loop, provider/model requested/effective identity, and approval boundaries.
pm_gap_or_delta: Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry.
proposal_or_recommendation: Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs.
compile_disposition: create_new_planunit
```

### GRS-036 - P0-SUBAGENT-EXECUTION-CONTRACT

```yaml
plan_unit_id: GRS-036
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-SUBAGENT-EXECUTION-CONTRACT (P0) is compiled as canonical Puppet Master intent for Subagent lifecycle, model/effort config, and result authority: Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper. The preserved PM gap/delta is: PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating. The observed external-repo signal remains source-lineage evidence: Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes
  show child chats/parallel tools and non-destructive await timeouts.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A child can use a different allowed model/effort only if settlement proves it.
- Parent cannot certify complete until all required child results are settled or explicitly waived.
- Orphan helpers/processes are reaped on session close/crash/restart.
- Subagent loops trip per-child and aggregate budgets.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A child can use a different allowed model/effort only if settlement proves it.
- Parent cannot certify complete until all required child results are settled or explicitly waived.
- Orphan helpers/processes are reaped on session close/crash/restart.
- Subagent loops trip per-child and aggregate budgets.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p0_subagent_execution_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0061
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0061
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0057/P0-SUBAGENT-EXECUTION-CONTRACT@line=57
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0057/P0-SUBAGENT-EXECUTION-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0061
external_atom_id: extrepo-20260703-0057
source_row_id: P0-SUBAGENT-EXECUTION-CONTRACT
priority: P0
finding_family: Subagent lifecycle, model/effort config, and result authority
source_repos:
- Codex
- OpenCode
- Cline
- Agent Zero
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0057
- P0-SUBAGENT-EXECUTION-CONTRACT
- P0
- Subagent lifecycle, model/effort config, and result authority
- Codex
- OpenCode
- Cline
- Agent Zero
negative_constraints: []
observed_signal: Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes show child chats/parallel tools and non-destructive await timeouts.
pm_current_coverage: PM has parent/child goal runtime policy, canonical child run identity for subagents, and prompt-packet subagent hard gates.
pm_gap_or_delta: 'PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating.'
proposal_or_recommendation: Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper.
compile_disposition: create_new_planunit
```

### GRS-037 - P0-LOOP-BREAKER-TAXONOMY

```yaml
plan_unit_id: GRS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-LOOP-BREAKER-TAXONOMY (P0) is compiled as canonical Puppet Master intent for Looping / no-progress / spend control: Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason. The preserved PM gap/delta is: The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops. The observed external-repo signal remains source-lineage evidence: OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only
  loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Fixtures for each loop family stop within bounded attempts.
- Spend/quota caps terminate even when model output appears syntactically successful.
- Compaction can run once or configured bounded times but cannot self-loop indefinitely.
- GUI shows stopped_for_loop with fingerprint and last safe point.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Fixtures for each loop family stop within bounded attempts.
- Spend/quota caps terminate even when model output appears syntactically successful.
- Compaction can run once or configured bounded times but cannot self-loop indefinitely.
- GUI shows stopped_for_loop with fingerprint and last safe point.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p0_loop_breaker_taxonomy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0062
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0062
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0058/P0-LOOP-BREAKER-TAXONOMY@line=58
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0058/P0-LOOP-BREAKER-TAXONOMY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:4
source_atom_ids:
- atom-0062
external_atom_id: extrepo-20260703-0058
source_row_id: P0-LOOP-BREAKER-TAXONOMY
priority: P0
finding_family: Looping / no-progress / spend control
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
target_docs:
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0058
- P0-LOOP-BREAKER-TAXONOMY
- P0
- Looping / no-progress / spend control
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
negative_constraints: []
observed_signal: OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.
pm_current_coverage: Executor has doom-loop guard and Goal Runtime has progress fingerprints, budgets, and verification repair loop.
pm_gap_or_delta: The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops.
proposal_or_recommendation: 'Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason.'
compile_disposition: create_new_planunit
```

### GRS-038 - P0-GOAL-SCOPE-SUBAGENT-ISOLATION

```yaml
plan_unit_id: GRS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-GOAL-SCOPE-SUBAGENT-ISOLATION (P0) is compiled as canonical Puppet Master intent for Goal/subagent identity leakage and rogue continuation: Imported external-repo finding extrepo-20260703-0075 / P0-GOAL-SCOPE-SUBAGENT-ISOLATION (P0). The preserved PM gap/delta is: AgentControlEnvelope covered authority, but not enough about inheritable goal identity, child-agent leases, or proving that a child cannot resume/advance the parent goal. The observed external-repo signal remains source-lineage evidence: Codex issue #25472 reports subagents reactivating a long-running goal and behaving like the main thread. | Codex changelog has multiple goal/subagent/session persistence and terminal-subagent error propagation fixes. | PM already has subagent hard gates, but needs runtime-level goal leases rather than prompt-only role instructions.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every subagent receives a ChildAgentLease with parent_goal_id, allowed_phase, read/write mode, max_depth, cannot_resume_parent_goal=true, and terminal return channel.
- A child/subagent cannot spawn further agents unless its lease explicitly grants delegation_depth > 0.
- Parent sees child terminal errors as typed failed outcomes, never empty successful completion.
- Subagent cache/context lineage is separate from parent stable-prefix/cache lineage unless explicitly linked by a receipt.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every subagent receives a ChildAgentLease with parent_goal_id, allowed_phase, read/write mode, max_depth, cannot_resume_parent_goal=true, and terminal return channel.
- A child/subagent cannot spawn further agents unless its lease explicitly grants delegation_depth > 0.
- Parent sees child terminal errors as typed failed outcomes, never empty successful completion.
- Subagent cache/context lineage is separate from parent stable-prefix/cache lineage unless explicitly linked by a receipt.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p0_goal_scope_subagent_isolation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0079
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0079
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0075/P0-GOAL-SCOPE-SUBAGENT-ISOLATION@line=75
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0075/P0-GOAL-SCOPE-SUBAGENT-ISOLATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:2
source_atom_ids:
- atom-0079
external_atom_id: extrepo-20260703-0075
source_row_id: P0-GOAL-SCOPE-SUBAGENT-ISOLATION
priority: P0
finding_family: Goal/subagent identity leakage and rogue continuation
target_docs:
- Goal_Runtime_System.md
- orchestrator-subagent-integration.md
- Orchestrator_Page.md
- Contracts_V0.md
- FinalGUISpec.md
owner_hints:
- Goal_Runtime_System.md
- orchestrator-subagent-integration.md
- Orchestrator_Page.md
- Contracts_V0.md
- FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0075
- P0-GOAL-SCOPE-SUBAGENT-ISOLATION
- P0
- Goal/subagent identity leakage and rogue continuation
negative_constraints: []
observed_signal: 'Codex issue #25472 reports subagents reactivating a long-running goal and behaving like the main thread. | Codex changelog has multiple goal/subagent/session persistence and terminal-subagent error propagation fixes. | PM already has subagent hard gates, but needs runtime-level goal leases rather than prompt-only role instructions.'
pm_gap_or_delta: AgentControlEnvelope covered authority, but not enough about inheritable goal identity, child-agent leases, or proving that a child cannot resume/advance the parent goal.
relationship_to_prior_reports: Sharpens AgentControlEnvelope and SubagentExecutionContract into an isolation primitive.
compile_disposition: create_new_planunit
```

### GRS-039 - P1-EXTERNAL-AGENT-HANDOFF-IMPORT

```yaml
plan_unit_id: GRS-039
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-EXTERNAL-AGENT-HANDOFF-IMPORT (P1) is compiled as canonical Puppet Master intent for Third-party agent import, continuation, and session provenance: Imported external-repo finding extrepo-20260703-0085 / P1-EXTERNAL-AGENT-HANDOFF-IMPORT (P1). The preserved PM gap/delta is: MCP/import config provenance was covered, but PM should also treat external agent sessions as imported runtimes with provenance and continuation contracts. The observed external-repo signal remains source-lineage evidence: Warp supports third-party CLI agents, custom routers, local continuation when a cloud run is interrupted, and structured CLI-agent notifications. | Codex changelog records external agent import results and Claude Code import support. | Cline/OpenCode configs and MCP ecosystems encourage cross-tool state/config reuse.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Imported external-agent session has source tool/version, authority surface, context lineage, credential handling, cwd/worktree, terminal/session transcript, and continuation mode.
- Cloud-to-local or local-to-cloud continuation changes authority/cache/tool/session epoch and must be displayed.
- External agent output/tool requests enter PM as untrusted until settled by PM receipts.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Imported external-agent session has source tool/version, authority surface, context lineage, credential handling, cwd/worktree, terminal/session transcript, and continuation mode.
- Cloud-to-local or local-to-cloud continuation changes authority/cache/tool/session epoch and must be displayed.
- External agent output/tool requests enter PM as untrusted until settled by PM receipts.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p1_external_agent_handoff_import
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0089
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0089
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0085/P1-EXTERNAL-AGENT-HANDOFF-IMPORT@line=85
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0085/P1-EXTERNAL-AGENT-HANDOFF-IMPORT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0089
external_atom_id: extrepo-20260703-0085
source_row_id: P1-EXTERNAL-AGENT-HANDOFF-IMPORT
priority: P1
finding_family: Third-party agent import, continuation, and session provenance
target_docs:
- Goal_Runtime_System.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Provider_OpenCode.md
- MCP_Integration.md
- FinalGUISpec.md
owner_hints:
- Goal_Runtime_System.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Provider_OpenCode.md
- MCP_Integration.md
- FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0085
- P1-EXTERNAL-AGENT-HANDOFF-IMPORT
- P1
- Third-party agent import, continuation, and session provenance
negative_constraints: []
observed_signal: Warp supports third-party CLI agents, custom routers, local continuation when a cloud run is interrupted, and structured CLI-agent notifications. | Codex changelog records external agent import results and Claude Code import support. | Cline/OpenCode configs and MCP ecosystems encourage cross-tool state/config reuse.
pm_gap_or_delta: MCP/import config provenance was covered, but PM should also treat external agent sessions as imported runtimes with provenance and continuation contracts.
relationship_to_prior_reports: Extends external config provenance into full session handoff.
compile_disposition: create_new_planunit
```

### GRS-040 - GRS-040

```yaml
plan_unit_id: GRS-040
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  External agent sessions, MCP config imports, and handoff packets enter PM as untrusted provenance/evidence until settled by PM receipts. Imported sessions do not become native PM authority or bypass Goal, Tool, or Permission ownership.
gui_related: false
gui_classification_reason: Backend/orchestration import guardrail; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0121 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: import_guardrail_compile
reasoning_tier: standard
context_scope: import_guardrail
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: atom_0121
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0121
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0121
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
source_atom_ids:
- atom-0121
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- untrusted provenance/evidence
- Imported sessions do not become native PM authority
- External agent sessions enter as untrusted provenance
negative_constraints:
- Do not let imported external sessions bypass Goal/Tool/Permission ownership.
compile_disposition: create_new_planunit
```

### GRS-041 - FABLE Goal Runtime Event Payload Closure

```yaml
plan_unit_id: GRS-041
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime enumerates the shared envelope and event-specific payload minima for
  all canonical goal and goal_run events, and defines the spec-level runtime
  records LoopBreakerRegistry, AgentControlEnvelope, CertificationReceipt,
  ChildAgentLease, WorkNodeRequests, AuditCycle, AuditFinding, and AuditClosure.
  The closure preserves Goal Runtime as the semantic owner while consuming
  Contracts_V0 for cross-surface field names, storage-plan for persistence and
  replay, Executor for WorkNode scheduling and safe-point behavior, and
  Permissions/Models/Multi-Account owners for authority and requested/effective
  identity.
gui_related: false
gui_classification_reason: This unit defines backend Goal Runtime event payload and record semantics, not visual presentation.
depends_on: [GRS-005, GRS-026, GRS-035, GRS-036, GRS-037, GRS-038, CV-287, CV-288, CV-313, EP-098, PNC-013]
unblocks: []
acceptance_criteria:
  - The common payload envelope includes event_name, schema_version, occurred_at_utc, project/thread/goal identity, revisions, actor/execution role, requested/effective provider/model/account refs, correlation/causation/idempotency, evidence/artifact refs, approval refs, and block refs.
  - All 15 goal events and all 6 goal_run events list event-specific payload minima.
  - LoopBreakerRegistry includes the required loop families with fingerprint, max count, observation window, terminal action, and user-facing reason.
  - AgentControlEnvelope, CertificationReceipt, ChildAgentLease, WorkNodeRequests, AuditCycle, AuditFinding, and AuditClosure define stable identities and required proof/authority fields.
  - Goal Runtime does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, or production build tasks from this payload closure.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fable_goal_runtime_event_payload_drift
reasoning_tier: high
context_scope: contract_runtime_core_repair
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: goal_runtime_event_payload_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "`goal.created`"
  - "`goal.scheduled`"
  - "`goal.progressed`"
  - "`goal.tool_check_recorded`"
  - "`goal.updated`"
  - "`goal.replanned`"
  - "`goal.child_status_changed`"
  - "`goal.evidence_captured`"
  - "`goal.verification_decided`"
  - "`goal.receipt_recorded`"
  - "`goal.completed`"
  - "`goal.degraded`"
  - "`goal.stopped`"
  - "`goal.blocked`"
  - "`goal.cancelled`"
  - "`goal_run.started`"
  - "`goal_run.replanned`"
  - "`goal_run.blocked`"
  - "`goal_run.certified`"
  - "`goal_run.cancelled`"
  - "`goal_run.stopped`"
  - "`LoopBreakerRegistry`"
  - "`AgentControlEnvelope`"
  - "`CertificationReceipt`"
  - "`ChildAgentLease`"
  - "`WorkNodeRequests`"
  - "`AuditCycle`"
  - "`AuditFinding`"
  - "`AuditClosure`"
negative_constraints:
  - Do not treat event payload closure as runtime certification harness or implementation readiness proof.
  - Do not re-own Executor scheduling, storage replay, permission enforcement, or provider/model/account resolution.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```
