# Shard 044: PlanUnits

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6436-L30903

Source SHA256: `5fe8943c3c799a6ad0638813af2527938453cc4f716bb44dff99a52b10a54841`

---

## PlanUnits

### OSI-001 - Orchestrator Subagent Integration Residual Source-Preserving PlanUnit

```yaml
plan_unit_id: OSI-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  OSI-001 is retired as a source-preserving bridge after Phase 2B batch 140. Spans S0001 through S0223 and S0224 source
  lines 6414-6426 are covered by fine-grained PlanUnits OSI-002 through OSI-424; S0224 source line 6427 and generated
  audit/reporting spans S0225 through S0228 are covered by explicit structural dispositions. No residual
  source_preserving_planunit coverage remains for Plans/orchestrator-subagent-integration.md.
gui_related: false
gui_classification_reason: >-
  The residual span is generated Migration Coverage audit/reporting text, not GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- >-
  OSI-001 no longer carries source_preserving_planunit mode after Phase 2B batch 140.
- >-
  orchestrator-subagent-integration-S0001 through S0228 are covered by fine-grained PlanUnits or explicit structural
  dispositions.
- >-
  Generated Owner / Consumer Map, PlanUnits, and Migration Coverage spans remain source-lineage audit material only and must
  not override the fine-grained PlanUnits.
- No next cursor remains for Plans/orchestrator-subagent-integration.md.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: source_preservation
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0227
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0228
preserved_exact_tokens:
- OSI-001
- source_preserving_planunit
- Migration Coverage
negative_constraints:
- >-
  OSI-001 must not re-enter source_preserving_planunit mode after Phase 2B batch 140.
- The residual bridge must not be treated as final implementation-ready product coverage.
- >-
  The residual bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- S0155 through S0172 are no longer residual after Phase 2B batch 136.
- S0173 source lines 5623-5626 are no longer residual after Phase 2B batch 136.
- S0173 source line 5627 through S0187 are no longer residual after Phase 2B batch 137.
- S0188 through S0223 and S0224 source lines 6414-6426 are no longer residual after Phase 2B batch 138.
- S0224 source line 6427 and S0225 through S0227 are no longer residual after Phase 2B batch 139.
- S0228 is structurally dispositioned after Phase 2B batch 140.
- >-
  Residual generated standardization spans are audit material only and not implementation-ready product coverage.
stale_retired_dispositions: []
owner_boundary_notes:
- Fine-grained PlanUnits OSI-002 through OSI-424 carry product/source coverage for S0001 through S0223 and S0224 source lines 6414-6426; batch 139 structurally dispositioned S0224 source line 6427 and generated audit spans S0225 through S0227.
- Batch 140 structurally dispositioned generated Migration Coverage audit/reporting span S0228 and retired this bridge.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-002 - Document Canonical Owner Scope

```yaml
plan_unit_id: OSI-002
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: This owner document preserves product, runtime, storage, UI, and governance requirements for Orchestrator
  subagent integration.
gui_related: true
gui_classification_reason: This unit includes UI/user-visible governance scope in the canonical owner-section requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_canonical_owner_scope
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: document_canonical_owner_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0002
preserved_exact_tokens:
- Orchestrator Subagent Integration -- Implementation Plan
- Canonical owner-section requirements
- product, runtime, storage, UI, and governance details
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-003 - Tier Era Vocabulary Retirement

```yaml
plan_unit_id: OSI-003
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Compatibility-only tier-era and shadow-field vocabulary is noncanonical; live wording uses the owner terminology
  below.
gui_related: false
gui_classification_reason: This unit covers terminology retirement, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tier_era_vocabulary_retirement
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: tier_era_vocabulary_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0003
preserved_exact_tokens:
- Retire tier-era canon and shadow fields
- Compatibility-only source vocabulary
- noncanonical
- owner terminology
negative_constraints: []
compatibility_only_notes:
- Compatibility-only source vocabulary is noncanonical.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-004 - ProviderTransport Integration Boundary

```yaml
plan_unit_id: OSI-004
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: 'Runtime integration follows the ProviderTransport taxonomy: Cursor and Claude Code are CliBridge, Codex,
  Copilot, and Gemini are DirectApi, and OpenCode is ServerBridge; Codex/Copilot SDK references are historical context only
  and not implementation targets.'
gui_related: false
gui_classification_reason: This unit covers provider transport integration boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: providertransport_integration_boundary
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: providertransport_integration_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0004
preserved_exact_tokens:
- ProviderTransport
- CliBridge
- DirectApi
- ServerBridge
- Cursor/Claude Code
- Codex/Copilot/Gemini
- OpenCode
- historical context only
- not implementation targets
negative_constraints:
- Codex/Copilot SDK references in this file are historical context only and are not implementation targets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- ProviderTransport taxonomy is SSOT in Plans/Contracts_V0.md.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-005 - Plan Only And Research Transfer Gate

```yaml
plan_unit_id: OSI-005
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: This remains a PLAN DOCUMENT ONLY; browser-capability rethink entries are research inputs until canonical
  product/runtime changes transfer into owning live Plans docs.
gui_related: false
gui_classification_reason: This unit covers plan status and research transfer gating, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_only_and_research_transfer_gate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: plan_only_research_transfer_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0005
preserved_exact_tokens:
- PLAN DOCUMENT ONLY
- No code changes
- Browser-capability rethink
- research inputs
- owning live `Plans/**` docs
negative_constraints:
- Browser-capability rethink entries are not direct implementation authority by themselves.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-006 - PM Native Child Orchestration Ownership

```yaml
plan_unit_id: OSI-006
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Internal multi-agent orchestration is PM-native, with parent/child supervision, timeout propagation, thread/run
  lineage, shell isolation, cancellation, and crew scheduling owned by this document with Contracts_V0 and storage-plan.
gui_related: false
gui_classification_reason: This unit covers orchestration ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pm_native_child_orchestration_ownership
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: pm_native_child_orchestration_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0006
preserved_exact_tokens:
- PM-native
- Parent and child supervision
- timeout propagation
- thread and run lineage
- shell isolation
- cancellation
- crew scheduling
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This doc owns PM-native child orchestration together with Contracts_V0 and storage-plan.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
```

### OSI-007 - External Bridge And A2A Boundary

```yaml
plan_unit_id: OSI-007
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: External bridge or A2A mapping material is adapter guidance only and MUST NOT approve moving PM-internal child
  orchestration, control messages, budget propagation, or crew coordination onto A2A semantics.
gui_related: false
gui_classification_reason: This unit covers adapter boundary rules, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: external_bridge_and_a2a_boundary
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: external_bridge_a2a_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0006
preserved_exact_tokens:
- external bridge
- A2A mapping
- adapter guidance only
- PM-internal child orchestration
- child-run control messages
- budget propagation
- crew coordination
- A2A semantics
negative_constraints:
- External bridge or A2A mapping material MUST NOT be read as approval for PM-internal child orchestration to move onto A2A
  semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md'
```

### OSI-008 - Child Lineage And Resume Envelopes

```yaml
plan_unit_id: OSI-008
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Every child spawn, retry, cancellation, timeout, pause, resume, and completion path preserves run_id, thread_id,
  parent_run_id, child_run_id, requested/effective runtime descriptors, parent oversight, audit visibility, and PM-owned resume
  envelopes without hidden channels or unbounded queues.
gui_related: false
gui_classification_reason: This unit covers child lifecycle and lineage, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: child_lineage_and_resume_envelopes
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: child_lineage_resume_envelopes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0006
preserved_exact_tokens:
- run_id
- thread_id
- parent_run_id
- child_run_id
- requested/effective runtime descriptors
- PM-owned resume envelopes
- hidden inter-agent channels
- implicit shared state
- unbounded task queue
negative_constraints:
- Child re-entry must not create hidden inter-agent channels, implicit shared state, or an unbounded task queue outside the
  crew board contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
```

### OSI-009 - Child Authority Clamp And Outcomes

```yaml
plan_unit_id: OSI-009
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Child effective authority is clamped before dispatch and audited after completion across child-permission,
  tool policy, write/FileSafe scope, mode ceiling, provider/model/account availability, crew admission, and budget-outcome
  supervision.
gui_related: false
gui_classification_reason: This unit covers child authority and runtime outcomes, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: child_authority_clamp_and_outcomes
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: child_authority_clamp_outcomes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0006
preserved_exact_tokens:
- child-permission
- tool policy
- write scope
- FileSafe scope
- mode ceiling
- provider/model/account availability
- crew admission
- budget-outcome
- pre-dispatch budget denial
- post-response budget-overrun
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md'
```

### OSI-010 - Retired Crew Cap Example

```yaml
plan_unit_id: OSI-010
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: 'The stale later-stage example Enforce maximum concurrent crews (e.g., 20 total) from Gap #45 is non-canonical;
  crew and child admission use the executionLimits owner contract.'
gui_related: false
gui_classification_reason: This unit covers stale crew cap retirement, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_crew_cap_example
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: retired_crew_cap_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0006
preserved_exact_tokens:
- Enforce maximum concurrent crews (e.g., 20 total)
- 'Gap #45: Crew performance and scalability'
- non-canonical
- executionLimits
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- The later-stage crew cap example is non-canonical and retired.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md'
```

### OSI-011 - Task Tool Delegation Lifecycle

```yaml
plan_unit_id: OSI-011
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Task-tool delegation honors per-target deny rules, rejects unsafe self-dispatch loops, and treats long-running
  session_id tasks as governed child lifecycle/resume/timeout/parent-supervision sessions.
gui_related: false
gui_classification_reason: This unit covers task tool lifecycle, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: task_tool_delegation_lifecycle
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: task_tool_delegation_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0006
preserved_exact_tokens:
- Task-tool delegation
- per-target deny rules
- unsafe self-dispatch loops
- session_id
- child lifecycle
- resume
- timeout
- parent supervision
negative_constraints:
- Unsafe self-dispatch loops must be rejected.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md'
```

### OSI-012 - Parent Owned Clarification Escalation

```yaml
plan_unit_id: OSI-012
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: 'Task and question escalation remain parent-owned: subagents request clarification through the parent orchestrator,
  do not address users directly, and follow the parent /question flow plus child lifecycle contract.'
gui_related: false
gui_classification_reason: This unit covers parent-owned escalation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: parent_owned_clarification_escalation
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: parent_owned_clarification_escalation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0007
preserved_exact_tokens:
- Task tool contract alignment
- parent-owned
- /question
- do not address users directly
- child lifecycle contract
negative_constraints:
- Subagents do not address users directly.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-013 - Child Launch Snapshot Propagation

```yaml
plan_unit_id: OSI-013
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Child launch context carries normalized effective skill/tool/permission/MCP snapshots plus cache-affinity,
  cache-hit, compaction-state, compaction-regression, and subagent context visibility inputs without provider-specific hidden
  channels or permission bypass.
gui_related: false
gui_classification_reason: This unit covers launch context propagation, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: child_launch_snapshot_propagation
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: child_launch_snapshot_propagation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0007
preserved_exact_tokens:
- effective skill/tool/permission/MCP snapshot
- cache-affinity
- cache-hit
- compaction-state
- compaction-regression
- subagent context visibility
- handoff bundle
negative_constraints:
- Child launch context does not create provider-specific hidden channels or bypass the parent permission ceiling.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Prompt_Pipeline.md'
```

### OSI-014 - AgentCard Selection Boundary

```yaml
plan_unit_id: OSI-014
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: AgentCard-style capability advertisement is only an inspectable capability summary for subagent selection
  and does not replace the registry, permission ceiling, runtime snapshot, or provider capability contract.
gui_related: false
gui_classification_reason: This unit covers selection metadata boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agentcard_selection_boundary
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: agentcard_selection_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0007
preserved_exact_tokens:
- AgentCard
- inspectable capability summary
- registry
- permission ceiling
- runtime snapshot
- provider capability contract
negative_constraints:
- AgentCard data does not replace the registry, permission ceiling, runtime snapshot, or provider capability contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md'
```

### OSI-015 - Timeout Heading Retirement

```yaml
plan_unit_id: OSI-015
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: The duplicate heading string Task-envelope timeout contract is retired; terminal elapsed-time completion is
  done.task_timeout, while done.timeout and alternate timeout headings are non-canonical.
gui_related: false
gui_classification_reason: This unit covers timeout terminology retirement, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: timeout_heading_retirement
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: timeout_heading_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0007
preserved_exact_tokens:
- '#### Task-envelope timeout contract'
- done.task_timeout
- done.timeout
- alternate timeout headings
- budget taxonomy
negative_constraints:
- Wording must not revive done.timeout or alternate timeout headings.
compatibility_only_notes:
- The legacy duplicate heading string is retired as a separate live heading.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-016 - Crew Message Board Surface

```yaml
plan_unit_id: OSI-016
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: The crew message board is the normative subagent-collaboration surface; BrainStorm, Crew, and Assistant projections
  may show collaborative summaries, while schema, routing, priority, rate limiting, visibility, and parent mediation remain
  owned by this orchestrator contract.
gui_related: true
gui_classification_reason: This unit includes user-visible BrainStorm, Crew, Assistant projections and collaboration summaries.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: crew_message_board_surface
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_message_board_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0007
preserved_exact_tokens:
- crew message board
- BrainStorm
- Crew
- Assistant projections
- collaborative summaries
- schema
- routing
- priority
- rate limiting
- orchestrator visibility
- parent mediation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Crew board schema/routing/priority/rate limiting/orchestrator visibility/parent mediation remain orchestrator-owned.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md'
```

### OSI-017 - Runtime Schema Ownership Boundary

```yaml
plan_unit_id: OSI-017
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Orchestrator consumes canonical runtime fields and event names from shared contracts and must not revive PuppetMasterEvent::*,
  PuppetMasterEvent, /type, or /schema as local page-spec runtime schema.
gui_related: true
gui_classification_reason: This unit affects runtime/UI schema projections and user-visible page-spec consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_schema_ownership_boundary
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: runtime_schema_ownership_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0008
preserved_exact_tokens:
- Runtime scheduler, identity, and worktree reconciliation
- PuppetMasterEvent::*
- PuppetMasterEvent
- /type
- /schema
- exact_items
- missing_data_shape
- missing-owner-heading
- lifecycle-boundary
negative_constraints:
- Orchestrator must not revive local page-spec ownership as first-class runtime schema.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-018 - Graph Native Scheduler Identity

```yaml
plan_unit_id: OSI-018
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Scheduling is graph-native through runnable graph nodes, DAG readiness, scored ready-set selection, runtime-selection,
  /node, /node/runtime, and graph schemas; Phase, Task, Subtask, Iteration, tier_id, TierType, Tiers, and lexicographic
  selection terms are derived display, source-lineage, or compatibility only.
gui_related: false
gui_classification_reason: This unit covers scheduler identity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: graph_native_scheduler_identity
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: graph_native_scheduler_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
preserved_exact_tokens:
- plan-graph
- plan_graph
- project_plan_graph_index
- DAG readiness
- scored ready-set
- /node
- /node/runtime
- Lexicographic-style selection
- hard-code
- tier_id
- TierContext
- Phase
- Task
- Subtask
- Iteration
- TierType
- Tiers
negative_constraints:
- Graph schemas must not hard-code lexicographic selection as execution authority.
compatibility_only_notes:
- Phase/Task/Subtask/Iteration and tier language are derived display or compatibility context only.
stale_retired_dispositions:
- Phase/Task/Subtask/Iteration and tier-era terms are retired runtime canon.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-019 - Runtime Identity And Override Lifecycle

```yaml
plan_unit_id: OSI-019
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Runtime identity carry-through preserves requested/effective account and role disclosure, tool_use_id, execution_unit_context,
  and scoped override records for turn, session, run, task, and subagent instead of one sticky runtime setting.
gui_related: false
gui_classification_reason: This unit covers runtime identity and override records, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_and_override_lifecycle
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: runtime_identity_override_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- requested_account_policy
- requested_account_binding
- persona_override_owner_id
- plan_or_tier_default
- tool_use_id
- execution_unit_context
- turn, session, run, task, and subagent overrides
- TierContext
negative_constraints:
- Scoped overrides must not collapse into one sticky runtime setting.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-020 - Package Based Worktree Policy

```yaml
plan_unit_id: OSI-020
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Worktree allocation and SCM behavior are package/seam/lane based with contamination quarantine, restore-before-reuse,
  safe-point-aware transition recovery, same-lane defaults, promote-then-fork only for safe parallelism, and usage attribution
  on package/seam/attempt/remediation dimensions.
gui_related: false
gui_classification_reason: This unit covers worktree and SCM policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: package_based_worktree_policy
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: package_based_worktree_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- package-based lane pools
- branch-per-tier compatibility notes
- contamination quarantine
- restore-before-reuse
- same-cycle event-driven update
- file-lease rejection
- /update
- /backoff
- safe-point-aware `/transition`
- promote-then-fork
negative_constraints: []
compatibility_only_notes:
- Branch-per-tier notes are compatibility notes under package-based lane pools.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-021 - Parent Owned Delegated Work Memory

```yaml
plan_unit_id: OSI-021
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Delegated work and memory loops remain parent-owned; fresh iteration loops may read plan, progress, reusable-pattern
  summaries, repo state, git history, gotchas, and files changed without creating hidden orchestrator memory or FIFO chat
  ordering.
gui_related: false
gui_classification_reason: This unit covers parent-owned memory loops, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: parent_owned_delegated_work_memory
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: parent_owned_delegated_work_memory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- /plan
- append-only progress
- reusable-pattern summaries
- repo state
- git history
- /gotchas
- hidden orchestrator memory
- FIFO chat ordering
negative_constraints:
- Delegated work and memory loops do not create hidden orchestrator memory beyond owner boundaries.
- Task/run/subagent scope must not collapse into FIFO chat ordering.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-022 - Provider And Permission Event Projection

```yaml
plan_unit_id: OSI-022
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: 'Provider and permission boundaries stay explicit: A2A references are adapter-only, and permission consumers
  project blocked reason, safe point, event family, /event/usage, policy-visible role routing, UI_Command_Catalog route meaning,
  and MUST VERIFY inspection requirements through shared runtime events.'
gui_related: true
gui_classification_reason: This unit includes UI_Command_Catalog route meaning and permission projection visible to UI/runtime
  consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_and_permission_event_projection
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: provider_permission_event_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- Provider_Stream_Mapping_External_Reference_A2A.md
- adapter references only
- /account/trust metadata
- Permissions_System.md
- blocked-reason
- safe-point
- event-family
- /event/usage
- UI_Command_Catalog
- MUST VERIFY
- VERIFY
negative_constraints:
- Hard-wires to tier scope are non-canonical when they drop /account/trust metadata.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-023 - Packet Emission Fidelity Gate

```yaml
plan_unit_id: OSI-023
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Packet artifacts are useful preflight planning state but are not faithful-emission-safe until packet-planning
  inputs remove contradictions in owner docs, target-level runtime fields, and graph scheduling records.
gui_related: false
gui_classification_reason: This unit covers packet emission fidelity gating, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: packet_emission_fidelity_gate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: packet_emission_fidelity_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- Packet emission
- target-level fidelity
- packet-planning
- preflight contract
- downstream packet emission
negative_constraints:
- Packet-planning is not proof that downstream packet emission can proceed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-024 - Owner Audit And Storage Gap Posture

```yaml
plan_unit_id: OSI-024
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: The six-pass owner-doc audit posture treats remaining issues as exact owner-doc structural mismatch and target-level
  drift, coverage tails uniformly as Gemini + Opus + Sonnet, and storage receipt/activity gaps as under-transfer or anchor
  failures until storage owner records the contract.
gui_related: false
gui_classification_reason: This unit covers audit posture and storage gap ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_audit_and_storage_gap_posture
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: owner_audit_storage_gap_posture
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- six-pass owner-doc audit posture
- Gemini + Opus + Sonnet
- storage receipt
- /activity
- under-transfer
- anchor failures
- missing-content
negative_constraints:
- Storage receipt and /activity gaps are not total missing-content claims against this orchestrator doc.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-025 - Destructive Action Compatibility Vocabulary

```yaml
plan_unit_id: OSI-025
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: non_reversible is the canonical destructive action taxonomy for durable /live mutation; FinalGUISpec, page-spec,
  detached_window, project-state, artifact_kind, task_id, and UI_Command_Catalog references are consumer or compatibility
  vocabulary unless this section names the runtime owner.
gui_related: true
gui_classification_reason: This unit affects user-visible destructive action taxonomy and UI command consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: destructive_action_compatibility_vocabulary
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: destructive_action_compatibility_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- non_reversible
- /live
- /skills/files
- FinalGUISpec.md
- page-spec
- detached_window
- project-state
- artifact_kind
- task_id
- UI_Command_Catalog.md
negative_constraints: []
compatibility_only_notes:
- Listed GUI/page-spec terms are consumer or compatibility vocabulary unless the runtime owner is named.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-026 - Crew Coordination Identity Keys

```yaml
plan_unit_id: OSI-026
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: ActiveAgent, crew structs, and coordination payloads key first on run/thread/parent-child/node/attempt/package/seam/lane
  identity; tier-keyed fields are compatibility labels only and must not outrank package/seam runtime identity.
gui_related: false
gui_classification_reason: This unit covers coordination payload identity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: crew_coordination_identity_keys
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_coordination_identity_keys
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- ActiveAgent
- crew structs
- run/thread/parent-child/node/attempt/package/seam/lane identity
- tier-keyed
- /package/seam
negative_constraints:
- tier-keyed fields must not become primary crew lookup keys.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-027 - Command Metadata And GUI Execution Policy

```yaml
plan_unit_id: OSI-027
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Orchestrator action metadata is command-owner bound to UI_Command_Catalog, including palette-visible, shortcut-worthy,
  context-menu only, bulk-safe, and bulk-forbidden; GUI execution-policy settings explicitly choose retry identity and node
  worker class.
gui_related: true
gui_classification_reason: This unit governs GUI command metadata, bulk mutation controls, and execution-policy settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_metadata_and_gui_execution_policy
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: command_metadata_gui_execution_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- command-owner
- UI_Command_Catalog
- palette-visible
- shortcut-worthy
- context-menu
- bulk-safe
- bulk-forbidden
- GUI `execution-policy`
- fresh agent/subagent
- same-agent retries
- full-agent override
negative_constraints:
- Bulk mutation remains disabled unless catalog and permission contracts both allow it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-028 - Tier View Projection Boundary

```yaml
plan_unit_id: OSI-028
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: tier_type, tier_id, title/description, and optional parent labels are projection-only grouping helpers and
  never replace run/node/package/seam/attempt identity in runtime routing.
gui_related: true
gui_classification_reason: This unit affects UI grouping/projection labels for tier views.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tier_view_projection_boundary
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: tier_view_projection_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- Tier `/view` identity
- tier_type
- tier_id
- title/description
- parent labels
- projection-only
- runtime routing
negative_constraints:
- Tier view labels never replace runtime routing identity.
compatibility_only_notes:
- tier_type and tier_id may help UI grouping only as projection labels.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-029 - Structured Attempt Handoff

```yaml
plan_unit_id: OSI-029
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Each failed node attempt emits a structured-attempt-handoff receipt describing what happened, what changed,
  why it failed or was blocked, and what to try next; retries remain policy-driven and may route to remediation, graph patch,
  worker replacement, or HITL.
gui_related: false
gui_classification_reason: This unit covers retry/remediation handoff records, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: structured_attempt_handoff
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: structured_attempt_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- structured-attempt-handoff
- /blocked
- /caps
- remediation
- graph patch
- /worker replacement
- /HITL
- /handoff
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-030 - Lane Pool Parallelism Capacity

```yaml
plan_unit_id: OSI-030
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Parallelism uses package/seam lane-pool capacity; stale per-thread queues, per-provider caps, parallel subtasks,
  and crews-per-tier shapes are migration notes that map into package/seam promotion and lane capacity.
gui_related: false
gui_classification_reason: This unit covers parallelism capacity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lane_pool_parallelism_capacity
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: lane_pool_parallelism_capacity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0009
preserved_exact_tokens:
- package/seam `lane-pool` capacity
- per-thread
- per-provider
- parallel subtasks
- crews-per-tier
- package/seam promotion
negative_constraints: []
compatibility_only_notes:
- Older parallelism shapes may appear only as migration notes.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
```

### OSI-031 - Rewrite Alignment Event Model

```yaml
plan_unit_id: OSI-031
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Rewrite alignment keeps Providers emitting normalized streaming events, centralizes tool gating in the tool
  policy engine, and represents start/end verification, built-but-not-wired checks, and tier boundary semantics as explicit
  replayable events.
gui_related: false
gui_classification_reason: This unit covers rewrite event model alignment, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_alignment_event_model
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: rewrite_alignment_event_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0010
preserved_exact_tokens:
- Rewrite alignment (2026-02-21)
- Providers
- normalized streaming event model
- tool policy engine
- built but not wired
- tier boundary semantics
- explicit events
- replayability
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-032 - Persistence And Event Emission

```yaml
plan_unit_id: OSI-032
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Rewrite persistence emits canonical seglog events for tier start/end, iteration start/end, verification results,
  subagent invocation boundaries, and replayable events, while redb persists run metadata, session identity/linkage, and checkpoints
  from the same orchestrator boundaries.
gui_related: false
gui_classification_reason: This unit covers event/persistence boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persistence_and_event_emission
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: persistence_event_emission
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0011
preserved_exact_tokens:
- Seglog
- canonical seglog stream
- tier start/end
- iteration start/end
- verification results
- subagent invocation boundaries
- redb
- run metadata
- session identity
- checkpoints
negative_constraints:
- Do not add one-off log files for run history.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-033 - Config Wiring Option B

```yaml
plan_unit_id: OSI-033
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: At run start the orchestrator builds execution config by merging GUI config defaults, interview output config,
  and per-tier overrides with scalar last-writer-wins, array concat/dedup, object deep merge, and validate_config_wiring_for_tier().
gui_related: true
gui_classification_reason: This unit includes GUI config defaults and run configuration behavior visible through settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: config_wiring_option_b
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: config_wiring_option_b
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0012
preserved_exact_tokens:
- 'Config Wiring — Option B: Build at Run Start'
- config-wiring
- GUI config defaults
- config:gui.*
- Interview output config
- Per-tier overrides
- last writer wins
- concatenate and deduplicate
- deep merge
- validate_config_wiring_for_tier()
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-034 - Test Strategy Loading

```yaml
plan_unit_id: OSI-034
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: The orchestrator loads .puppet-master/interview/test-strategy.json when present, merges items[].criterion
  into tier acceptance criteria, injects relevant excerpts into prompt context, and treats missing/invalid input as WARN-only.
gui_related: false
gui_classification_reason: This unit covers test strategy loading, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: test_strategy_loading
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: test_strategy_loading
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0013
preserved_exact_tokens:
- Test Strategy Loading
- test-strategy-loading
- .puppet-master/interview/test-strategy.json
- items[].criterion
- tier acceptance criteria
- prompt context
- WARN-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2'
```

### OSI-035 - Rewrite Runtime Ontology

```yaml
plan_unit_id: OSI-035
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Canonical orchestration identity is Feature Seam, Work Package, Node, graph generation lineage, and lane/worktree
  lineage; surviving phase/task/subtask language is derived view language, while worktree, recovery, approval, usage, and
  routing align to run/node/attempt/lane/worktree identity rather than tier_id.
gui_related: true
gui_classification_reason: This unit affects derived view language and user-visible orchestration identity.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_runtime_ontology
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: rewrite_runtime_ontology
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0014
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
preserved_exact_tokens:
- node/package/seam graph
- Feature Seam
- Work Package
- Node
- graph generation lineage
- lane/worktree lineage
- phase/task/subtask
- derived decomposition/view language
- tier_id
negative_constraints: []
compatibility_only_notes:
- Phase/task/subtask language is derived decomposition/view language only.
stale_retired_dispositions:
- Tier-era runtime ontology is retired in favor of node/package/seam graph identity.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
```

### OSI-036 - Graph Owned Worker Runtime Selection

```yaml
plan_unit_id: OSI-036
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Worker strategy is graph-owned; node execution selects from provider-entry/account-or-profile models, freezes
  requested/effective runtime snapshots, uses OpenCode server profiles, direct Codex/Copilot account rows, and PM-native skill/MCP
  behavior.
gui_related: false
gui_classification_reason: This unit covers worker runtime selection, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: graph_owned_worker_runtime_selection
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: graph_owned_worker_runtime_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0015
preserved_exact_tokens:
- Tier-Level Subagent Strategy
- graph-owned
- provider-entry / account-or-profile
- frozen requested/effective runtime snapshot
- OpenCode server profile
- GitHub Copilot
- Codex
- direct-provider account rows
- PM-native skill/MCP model
negative_constraints: []
compatibility_only_notes:
- Canonical worker strategy remains graph-owned rather than tier-owned.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Graph_View.md'
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Skills_System.md'
```

### OSI-037 - Debug Capable Investigation Orchestration

```yaml
plan_unit_id: OSI-037
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Orchestrator may launch shared investigations for build, test, environment setup, or runtime verification
  failures; investigation state stays subordinate to attempt/remediation lineage, workers may share evidence under one investigation_id,
  and only one mutation-capable investigation targets a project/worktree unless isolated.
gui_related: false
gui_classification_reason: This unit covers debug-capable orchestration ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_capable_investigation_orchestration
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: debug_capable_investigation_orchestration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0016
preserved_exact_tokens:
- Debug-capable investigation orchestration
- investigation_id
- owning attempt / remediation lineage
- one mutation-capable investigation
- separate worktree
- host context
negative_constraints:
- Orchestrator does not switch into the Assistant Debug mode strip.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/MiscPlan.md'
```

### OSI-038 - Project Context Detection Model

```yaml
plan_unit_id: OSI-038
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Project context detection preserves the example model tokens ProjectContext, DetectedLanguage, ProjectDomain,
  ErrorPattern, languages, frameworks, domain, task_type, and error_patterns for subagent selection inputs.
gui_related: false
gui_classification_reason: This unit covers model/example tokens, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_context_detection_model
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: project_context_detection_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0018
preserved_exact_tokens:
- Dynamic Subagent Selection Architecture
- Project Context Detection
- ProjectContext
- DetectedLanguage
- ProjectDomain
- ErrorPattern
- languages
- frameworks
- domain
- task_type
- error_patterns
- Cargo.toml
- src/main.rs
- CompilationError
- TestFailure
- SecurityIssue
- PerformanceIssue
- RuntimeError
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-039 - Subagent Selector Identity Carry Through

```yaml
plan_unit_id: OSI-039
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Subagent selection preserves requested_account_id, effective_account_id, requested_account_binding, requested_account_policy,
  operational_identity, and tool_use_id into delegated runtime selection, audit, lineage, approval, and usage joins without
  local substitute fields.
gui_related: false
gui_classification_reason: This unit covers subagent selector identity, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: subagent_selector_identity_carry_through
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: subagent_selector_identity_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0019
preserved_exact_tokens:
- Subagent Selector
- requested_account_id
- effective_account_id
- requested_account_binding
- requested_account_policy
- operational_identity
- tool_use_id
- effective-account
- Plans/Multi-Account.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Subagent selection is a consumer of shared runtime-account owner contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-040 - Orchestrator Integration And Overseer Role

```yaml
plan_unit_id: OSI-040
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Integration with Orchestrator preserves that the controlling AI role is Overseer, with canonical definition
  and responsibilities in Plans/Glossary.md.
gui_related: false
gui_classification_reason: This unit covers role ownership, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_integration_and_overseer_role
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: orchestrator_integration_overseer_role
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0021
preserved_exact_tokens:
- Integration with Orchestrator
- Overseer (controlling role)
- Overseer
- Plans/Glossary.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Glossary.md owns the canonical Overseer definition and responsibilities.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-041 - Orchestrator Subagent Selector And Manager Initialization

```yaml
plan_unit_id: OSI-041
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator initialization preserves selector and manager example wiring: subagent_selector and subagent_manager are initialized from detected project context and workspace paths, with SubagentManager lineage tied to the interview plan.
gui_related: false
gui_classification_reason: This unit covers backend orchestration initialization example tokens, not GUI behavior.
split_recommended: false
depends_on:
- OSI-038
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_subagent_selector_manager_initialization
node_compile_hint:
  mode: orchestrator_subagent_selector_manager_initialization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'Orchestrator Modifications'
- 'src/core/orchestrator.rs (additions)'
- 'subagent_selector'
- 'subagent_manager'
- 'detect_project_context'
- 'SubagentSelector::new'
- 'SubagentManager::new'
- 'interview plan'
negative_constraints: []
compatibility_only_notes:
- 'The src/core/orchestrator.rs snippet is source/example evidence, not a production build task.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-042 - Frozen Execution Unit Context Construction

```yaml
plan_unit_id: OSI-042
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Tier execution and subagent selection consume an ExecutionUnitContext built from the same frozen tier-start config snapshot used by validation and persistence, including workspace/worktree/runtime snapshot fields, language, domain, framework, review flags, error patterns, and parent_subagents.
gui_related: false
gui_classification_reason: This unit covers runtime context construction and source/example tokens, not GUI behavior.
split_recommended: false
depends_on:
- OSI-033
- OSI-035
- OSI-038
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: frozen_execution_unit_context_construction
node_compile_hint:
  mode: frozen_execution_unit_context_construction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'execute_tier_with_subagents'
- 'build_tier_context'
- 'ExecutionUnitContext'
- 'workspace/worktree/runtime snapshot'
- 'frozen tier-start config snapshot'
- 'detect_language'
- 'infer_domain'
- 'detect_framework'
- 'primary_language'
- 'needs_architecture_review'
- 'needs_product_planning'
- 'subtask_focus'
- 'error_patterns'
- 'parent_subagents'
negative_constraints: []
compatibility_only_notes:
- 'TierNode, tier_type, and TierType are compatibility/source-example vocabulary in this span.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-043 - Registry Validated Subagent Selection Controls

```yaml
plan_unit_id: OSI-043
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent selection controls must use registry-backed selection and validation, including overrides, disabled lists, and required lists; subagent names must not be hardcoded and invalid override, disabled, or required entries must be rejected or filtered as specified by the source span.
gui_related: false
gui_classification_reason: This unit covers registry-backed backend selection controls, not GUI behavior.
split_recommended: false
depends_on:
- OSI-038
- OSI-042
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: registry_validated_subagent_selection_controls
node_compile_hint:
  mode: registry_validated_subagent_selection_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'select_for_tier'
- 'subagent_registry::'
- 'NEVER hardcode subagent names'
- 'get_tier_overrides'
- 'is_valid_subagent_name'
- 'disabled'
- 'required'
- 'Invalid subagent name in override'
- 'Invalid subagent name in disabled list'
- 'Invalid subagent name in required list'
negative_constraints:
- 'DRY REQUIREMENT: SubagentSelector MUST use subagent_registry:: functions — NEVER hardcode subagent names'
- 'DRY REQUIREMENT: Validate override names using subagent_registry::is_valid_subagent_name()'
- 'DRY REQUIREMENT: Validate disabled names using subagent_registry::is_valid_subagent_name()'
- 'DRY REQUIREMENT: Validate required names using subagent_registry::is_valid_subagent_name()'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-044 - Platform Model And Coordination Registration

```yaml
plan_unit_id: OSI-044
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent execution must resolve platform and model for the tier, fetch coordination context, and register each selected agent in coordination state with identity, platform, node, worktree, file, operation, and timestamp fields before execution.
gui_related: false
gui_classification_reason: This unit covers orchestration coordination state, not GUI behavior.
split_recommended: false
depends_on:
- OSI-036
- OSI-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_model_coordination_registration
node_compile_hint:
  mode: platform_model_coordination_registration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'get_platform_for_tier'
- 'get_model_for_tier'
- 'get_coordination_context'
- 'register_agent'
- 'ActiveAgent'
- 'agent_id'
- 'node_id'
- 'worktree_path'
- 'files_being_edited'
- 'current_operation'
- 'started_at'
- 'last_update'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-045 - Sequential And Parallel Subagent Execution Lifecycle

```yaml
plan_unit_id: OSI-045
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent execution preserves both configured parallel and sequential lifecycle paths, including async dispatch, join_all result propagation, sequential execute_subagent calls, and post-execution unregister_agent cleanup.
gui_related: false
gui_classification_reason: This unit covers backend execution lifecycle behavior, not GUI behavior.
split_recommended: false
depends_on:
- OSI-030
- OSI-044
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: sequential_parallel_subagent_execution_lifecycle
node_compile_hint:
  mode: sequential_parallel_subagent_execution_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'enable_parallel_subagents'
- 'execute_subagent_async'
- 'futures::future::join_all'
- 'result??'
- 'execute_subagent'
- 'unregister_agent'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Parallel execution remains subordinate to lane-pool/package capacity canon rather than stale per-tier queues.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-046 - Single Subagent Invocation And Coordination Updates

```yaml
plan_unit_id: OSI-046
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Single-subagent execution builds the invocation, marks the agent operation active, executes through the platform runner with the selected subagent, extracts file operations from output, updates coordination files, and returns SubagentOutput.
gui_related: false
gui_classification_reason: This unit covers backend invocation and coordination updates, not GUI behavior.
split_recommended: false
depends_on:
- OSI-011
- OSI-045
- OSI-047
- OSI-048
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: single_subagent_invocation_coordination_updates
node_compile_hint:
  mode: single_subagent_invocation_coordination_updates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'DRY:FN:execute_subagent'
- 'SubagentOutput'
- 'build_subagent_invocation'
- 'update_agent_operation'
- 'execute_with_subagent'
- 'extract_file_operations_from_output'
- 'update_agent_files'
- 'Executing {}: {}'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-047 - Platform Specs Invocation Format Boundary

```yaml
plan_unit_id: OSI-047
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform-specific subagent invocation formatting must be delegated to platform_specs::get_subagent_invocation_format, then filled with subagent, task, context, and coordination values without local platform match statements or duplicated format strings.
gui_related: false
gui_classification_reason: This unit covers provider/platform invocation formatting boundaries, not GUI behavior.
split_recommended: false
depends_on:
- OSI-036
- OSI-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_specs_invocation_format_boundary
node_compile_hint:
  mode: platform_specs_invocation_format_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'DRY:FN:build_subagent_invocation'
- 'platform_specs::get_subagent_invocation_format()'
- 'Platform::Cursor'
- 'Platform::Codex'
- '{subagent}'
- '{task}'
- '{context}'
- '{coordination}'
- 'format_tier_context'
negative_constraints:
- 'MUST use platform_specs::get_subagent_invocation_format()'
- 'NEVER hardcode platform-specific formats'
- 'DO NOT hardcode match statements for Platform::Cursor, Platform::Codex, etc.'
- 'DO NOT duplicate platform-specific format strings here'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-048 - Subagent File Operation Extraction Evidence

```yaml
plan_unit_id: OSI-048
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent output evidence includes extracting file operations from findings file fields and from task_report, downstream_context, or findings text so coordination state can record files touched by a subagent.
gui_related: false
gui_classification_reason: This unit covers evidence extraction from backend output, not GUI behavior.
split_recommended: false
depends_on:
- OSI-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagent_file_operation_extraction_evidence
node_compile_hint:
  mode: subagent_file_operation_extraction_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'DRY:FN:extract_file_operations_from_output'
- 'SubagentOutput'
- 'findings'
- 'file'
- 'task_report'
- 'downstream_context'
- 'file paths'
- 'regex or text parsing'
negative_constraints: []
compatibility_only_notes:
- 'regex or text parsing is preserved source/example wording and does not override structured artifacts where owner contracts provide them.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-049 - Orchestrator Subagent Failure Handling

```yaml
plan_unit_id: OSI-049
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent orchestration failure handling preserves fallbacks and best-effort behavior: selection failures warn and fall back or skip, coordination registration/update failures warn and continue, and subagent execution failures log errors and continue with the next subagent or fail a critical tier.
gui_related: false
gui_classification_reason: This unit covers backend error handling behavior, not GUI behavior.
split_recommended: false
depends_on:
- OSI-043
- OSI-044
- OSI-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source example paths and code snippets are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_subagent_failure_handling
node_compile_hint:
  mode: orchestrator_subagent_failure_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0022
preserved_exact_tokens:
- 'Error handling'
- 'Subagent selection failure'
- 'Coordination registration failure'
- 'Subagent execution failure'
- 'Coordination update failure'
- 'log warning and continue'
- 'log error and continue with next subagent (or fail tier if critical)'
- 'fall back to default subagent or skip subagents'
- 'coordination is best-effort'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-050 - Runtime-Facing Execution Unit Context

```yaml
plan_unit_id: OSI-050
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  execution_unit_context is the canonical runtime-facing context object for worker spawn, recovery, remediation, coordination, and related runtime inspection anchors; TierContext and tier_id remain derived or compatibility-only selection/decomposition vocabulary and are never canonical runtime state.
gui_related: false
gui_classification_reason: This unit covers runtime context ownership, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: runtime_facing_execution_unit_context
node_compile_hint:
  mode: runtime_facing_execution_unit_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0024
preserved_exact_tokens:
- 'Execution unit context and worktree allocation strategy'
- 'execution_unit_context'
- 'TierContext'
- 'tier_id'
- 'compatibility-only'
- 'worker spawn'
- 'recovery'
- 'remediation'
- 'coordination'
negative_constraints:
- 'Any remaining TierContext or tier_id mention in this subsection is compatibility-only and never canonical runtime state.'
compatibility_only_notes:
- 'TierContext and tier_id are derived or compatibility-only selection/decomposition helper vocabulary.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-051 - Execution Unit UI Inspection Anchor

```yaml
plan_unit_id: OSI-051
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  UI inspection anchors to execution_unit_context as a consumer of canonical runtime context rather than to TierContext or tier_id runtime canon.
gui_related: true
gui_classification_reason: This unit explicitly covers the UI inspection projection anchor.
split_recommended: false
depends_on:
- OSI-050
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: execution_unit_ui_inspection_anchor
node_compile_hint:
  mode: execution_unit_ui_inspection_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0024
preserved_exact_tokens:
- 'UI inspection'
- 'execution_unit_context'
- 'Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'UI inspection consumes execution_unit_context; it does not own canonical runtime state.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-052 - Lane-Managed Worktree Lease Policy

```yaml
plan_unit_id: OSI-052
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Each execution_unit_context receives a lane-managed worktree lease; package or seam reuse is allowed only when lineage matches the lane assignment and no contamination guard is active, while contaminated worktrees are quarantined and cleanup waits for archive, receipt, and recovery checks instead of age alone.
gui_related: false
gui_classification_reason: This unit covers backend worktree allocation policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: lane_managed_worktree_lease_policy
node_compile_hint:
  mode: lane_managed_worktree_lease_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0025
preserved_exact_tokens:
- 'lane-managed worktree lease'
- 'package or seam reuse'
- 'lineage matches'
- 'contamination guard'
- 'contaminated worktrees'
- 'quarantined'
- 'clean lineage'
- 'dirty/conflict'
- 'archive'
- 'receipt'
- 'recovery checks'
negative_constraints:
- 'Cleanup waits for archive, receipt, and recovery checks instead of age alone.'
compatibility_only_notes: []
stale_retired_dispositions:
- 'This subsection stays separate from runtime-context canon language and separate from stale-token retirement language.'
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-053 - SCM Lineage Snapshot Field Contract

```yaml
plan_unit_id: OSI-053
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  scm_lineage_snapshot is a projector-owned Orchestrator consumer snapshot assembled from canonical runtime, storage, and Source Control records and preserving the full listed field set, including project/repo/worktree identity, worktree state, commit/compare fields, owner lineage, safe-point fields, active git operation, last commit summary, and pr_ref.
gui_related: false
gui_classification_reason: This unit covers snapshot field contract and owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: scm_lineage_snapshot_field_contract
node_compile_hint:
  mode: scm_lineage_snapshot_field_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0026
preserved_exact_tokens:
- 'scm_lineage_snapshot'
- 'projector-owned'
- 'project_id'
- 'repo_id'
- 'repo_root'
- 'worktree_id'
- 'worktree_path'
- 'worktree_status'
- 'owner_node_id'
- 'owner_tier_id'
- 'safe_point_id'
- 'pr_ref'
negative_constraints:
- 'scm_lineage_snapshot does not replace the owner records.'
compatibility_only_notes:
- 'owner_tier_id is compatibility vocabulary in this field list.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Canonical runtime, storage, and Source Control records own the source data.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-054 - SCM Snapshot UI Consumer Projection

```yaml
plan_unit_id: OSI-054
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Progress surfaces, graph/detail views, History rows, blocked cards, and run receipts consume scm_lineage_snapshot projection data for explicit worktree status values while mutation authority, safe-point restore rules, compare target calculation, and persisted SCM evidence remain with their owner docs.
gui_related: true
gui_classification_reason: This unit covers user-visible UI/status consumers of the SCM snapshot projection.
split_recommended: false
depends_on:
- OSI-053
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: scm_snapshot_ui_consumer_projection
node_compile_hint:
  mode: scm_snapshot_ui_consumer_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0026
preserved_exact_tokens:
- 'clean'
- 'dirty'
- 'conflict'
- 'orphaned'
- 'unknown_ownership'
- 'locked'
- 'repairable'
- 'prunable'
- 'Progress > Current Task'
- 'Progress > Orchestrator Status'
- 'graph/detail views'
- 'History rows'
- 'blocked cards'
- 'run receipts'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Mutation authority, safe-point restore rules, compare target calculation, and persisted SCM evidence remain owned by Plans/WorktreeGitImprovement.md, Plans/storage-plan.md, and Plans/Contracts_V0.md.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-055 - Compatibility Retirement Targets

```yaml
plan_unit_id: OSI-055
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  TierContext, tier_id, TierType, Tiers, Phase-Task-Subtask runtime canon, allowed_actions[], reason_code, recovery_options[], and approve_continue are retirement targets; this subsection is retirement-only and leaves sibling runtime-context and worktree-allocation rules canonical.
gui_related: false
gui_classification_reason: This unit covers terminology retirement, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: compatibility_retirement_targets
node_compile_hint:
  mode: compatibility_retirement_targets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0027
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
preserved_exact_tokens:
- 'TierContext'
- 'tier_id'
- 'TierType'
- 'Tiers'
- 'Phase-Task-Subtask'
- 'allowed_actions[]'
- 'reason_code'
- 'recovery_options[]'
- 'approve_continue'
negative_constraints:
- 'This subsection is retirement-only; canonical runtime-context rules and worktree-allocation rules remain in sibling subsections.'
compatibility_only_notes:
- 'Compatibility retirement is preserved as source disposition.'
stale_retired_dispositions:
- TierContext/tier_id/TierType/Tiers/Phase-Task-Subtask runtime canon are retired.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-056 - Child Timeout Outcome Taxonomy

```yaml
plan_unit_id: OSI-056
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Child timeout, budget, and /time supervision reuse the corrected Plans/Run_Modes.md kill/done /outcome taxonomy: pre-dispatch budget denial is kill.budget_exceeded, post-response overrun after durable usage recording is done.budget_exceeded, and child effective authority must not invent a local stop-state dialect.
gui_related: false
gui_classification_reason: This unit covers runtime outcome taxonomy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: child_timeout_outcome_taxonomy
node_compile_hint:
  mode: child_timeout_outcome_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0028
preserved_exact_tokens:
- '/time'
- '/outcome'
- 'stop.*'
- 'kill.*'
- 'kill.budget_exceeded'
- 'done.budget_exceeded'
- 'child effective authority'
negative_constraints:
- 'Child effective authority must surface the resulting outcome without inventing a local stop-state dialect.'
compatibility_only_notes: []
stale_retired_dispositions:
- 'The pre-fix mixed stop.* / kill.* vocabulary is retired for child supervision.'
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractName:Plans/Run_Modes.md'
```

### OSI-057 - Child Timeout Envelope And Shell Isolation

```yaml
plan_unit_id: OSI-057
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The child timeout envelope carries timeout_ms, request identity, /response identity, parent remaining-budget snapshot, and the clamped child deadline; /propagation records child timeout clamping, and shell-isolation is contract-level behavior owned by each child execution boundary.
gui_related: false
gui_classification_reason: This unit covers runtime timeout envelope and shell isolation, not GUI behavior.
split_recommended: false
depends_on:
- OSI-056
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: child_timeout_envelope_shell_isolation
node_compile_hint:
  mode: child_timeout_envelope_shell_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0028
preserved_exact_tokens:
- 'timeout_ms'
- '/response'
- 'parent remaining-budget snapshot'
- 'clamped child deadline'
- '/propagation'
- 'shell-isolation'
- 'shell scope lifecycle'
- 'teardown'
- 'leak prevention'
negative_constraints:
- 'shell-isolation is contract-level behavior, not governance-level guidance.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-058 - Subagent Adaptation Benefit Intent

```yaml
plan_unit_id: OSI-058
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The subagent integration benefit intent is dynamic adaptation, language awareness, domain expertise, error handling, specialization, and inheritance across tier hierarchy, including source examples for Rust, Swift, backend/frontend domains, and debugger invocation on errors.
gui_related: false
gui_classification_reason: This unit covers product intent and selection benefits, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagent_adaptation_benefit_intent
node_compile_hint:
  mode: subagent_adaptation_benefit_intent
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0029
preserved_exact_tokens:
- 'Dynamic Adaptation'
- 'Language Awareness'
- 'Domain Expertise'
- 'Error Handling'
- 'Specialization'
- 'Inheritance'
- 'Rust'
- 'Swift'
- 'backend/frontend'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-059 - Phase 1 Project Context Detection Backlog

```yaml
plan_unit_id: OSI-059
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The implementation-phase source backlog preserves Phase 1 Project Context Detection work: ProjectContext detection, language detection from codebase files, framework detection, and domain inference from task descriptions.
gui_related: false
gui_classification_reason: This unit covers backlog/source planning tokens, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: phase1_project_context_detection_backlog
node_compile_hint:
  mode: phase1_project_context_detection_backlog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0031
preserved_exact_tokens:
- 'Implementation Phases'
- 'ProjectContext'
- 'Language detection from codebase files'
- 'Framework detection'
- 'Domain inference from task descriptions'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-060 - Phase 2 Subagent Selector Backlog

```yaml
plan_unit_id: OSI-060
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The implementation-phase source backlog preserves Phase 2 Subagent Selector work: SubagentSelector, tier-level selection logic, language-to-subagent mapping, framework-to-subagent mapping, and domain-to-subagent mapping.
gui_related: false
gui_classification_reason: This unit covers backlog/source planning tokens, not GUI behavior.
split_recommended: false
depends_on:
- OSI-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: phase2_subagent_selector_backlog
node_compile_hint:
  mode: phase2_subagent_selector_backlog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0032
preserved_exact_tokens:
- 'SubagentSelector'
- 'tier-level selection logic'
- 'Language-to-subagent mapping'
- 'Framework-to-subagent mapping'
- 'Domain-to-subagent mapping'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-061 - Phase 3 Orchestrator Integration Backlog

```yaml
plan_unit_id: OSI-061
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The implementation-phase source backlog preserves Phase 3 Orchestrator Integration work: adding subagent selection to orchestrator, building tier context from tier nodes, invoking subagents via platform runners, and handling subagent responses.
gui_related: false
gui_classification_reason: This unit covers backlog/source planning tokens, not GUI behavior.
split_recommended: false
depends_on:
- OSI-041
- OSI-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: phase3_orchestrator_integration_backlog
node_compile_hint:
  mode: phase3_orchestrator_integration_backlog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0033
preserved_exact_tokens:
- 'Add subagent selection to orchestrator'
- 'Build tier context from tier nodes'
- 'Invoke subagents via platform runners'
- 'Handle subagent responses'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-062 - Phase 4 Error Pattern Detection Backlog

```yaml
plan_unit_id: OSI-062
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The implementation-phase source backlog preserves Phase 4 Error Pattern Detection work: detecting error patterns from iteration outputs, automatically invoking debugger/security-auditor/etc., and pattern-based subagent selection.
gui_related: false
gui_classification_reason: This unit covers backlog/source planning tokens, not GUI behavior.
split_recommended: false
depends_on:
- OSI-049
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: phase4_error_pattern_detection_backlog
node_compile_hint:
  mode: phase4_error_pattern_detection_backlog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0034
preserved_exact_tokens:
- 'error patterns'
- 'iteration outputs'
- 'debugger/security-auditor/etc.'
- 'Pattern-based subagent selection'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-063 - Phase 5 Verification Family Summary

```yaml
plan_unit_id: OSI-063
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Phase 5 verification preserves multi-language selection checks plus provider connectivity smoke tests, subagent-invocation integration tests, and plan mode CLI verification as environment-gated or manual verification families.
gui_related: false
gui_classification_reason: This unit covers verification planning, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: phase5_verification_family_summary
node_compile_hint:
  mode: phase5_verification_family_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0035
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0036
preserved_exact_tokens:
- 'Rust, Python, JavaScript, Swift'
- 'Provider connectivity smoke tests'
- 'Subagent-invocation integration tests'
- 'Plan mode CLI verification'
- 'environment-gated or manual'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-064 - Provider Smoke Scope And Gating

```yaml
plan_unit_id: OSI-064
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Provider connectivity smoke tests validate invocation paths and basic behavior for CLI-bridged Cursor and Claude Code, Server-bridged OpenCode, and Direct providers Codex, GitHub Copilot, and Gemini through minimal non-destructive prompts, transport prerequisites, and explicit environment gates.
gui_related: false
gui_classification_reason: This unit covers provider verification strategy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: provider_smoke_scope_gating
node_compile_hint:
  mode: provider_smoke_scope_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0037
preserved_exact_tokens:
- 'CLI-bridged'
- 'Server-bridged'
- 'Direct providers'
- 'Cursor'
- 'Claude Code'
- 'OpenCode'
- 'Codex'
- 'GitHub Copilot'
- 'Gemini'
- 'non-destructive prompt'
- 'RUN_CURSOR_CLI_SMOKE=1'
- 'RUN_OPENCODE_SERVER_SMOKE=1'
- 'RUN_GEMINI_API_SMOKE=1'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
```

### OSI-065 - Provider Probe Matrix And Assertions

```yaml
plan_unit_id: OSI-065
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The provider probe matrix preserves per-platform smoke commands and assertions: Cursor and Claude CLI probes, OpenCode server handshake, Direct-provider Codex/Copilot/Gemini API probes, exit-success checks, non-empty output, and parseable JSON or expected response shape.
gui_related: false
gui_classification_reason: This unit covers provider verification details, not GUI behavior.
split_recommended: false
depends_on:
- OSI-064
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: provider_probe_matrix_assertions
node_compile_hint:
  mode: provider_probe_matrix_assertions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0037
preserved_exact_tokens:
- 'agent -p "/code-reviewer Review the last commit." --output-format json'
- 'READY'
- 'OpenCode'
- 'Codex'
- 'GitHub Copilot'
- 'Gemini'
- 'exit code 0'
- 'parseable JSON'
- 'expected response shape'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-066 - Provider Smoke Test Location And Cursor Example

```yaml
plan_unit_id: OSI-066
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Provider smoke tests preserve the source example location and Cursor test sketch, including ignored test attributes, cargo ignored runner guidance, binary lookup for agent or cursor-agent, and SMOKE_OK output-shape checks.
gui_related: false
gui_classification_reason: This unit covers test location and example code, not GUI behavior.
split_recommended: false
depends_on:
- OSI-064
- OSI-065
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: provider_smoke_test_location_cursor_example
node_compile_hint:
  mode: provider_smoke_test_location_cursor_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0037
preserved_exact_tokens:
- 'puppet-master-rs/tests/provider_connectivity_smoke.rs'
- 'cursor_cli_smoke'
- '#[ignore]'
- 'cargo test --ignored'
- 'which_binary("agent")'
- 'cursor-agent'
- 'SMOKE_OK'
negative_constraints:
- 'Do not assert on exact text, only on success and shape.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-067 - Subagent Invocation Scope And DRY Builder

```yaml
plan_unit_id: OSI-067
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent-invocation integration tests must verify the exact command line built by the orchestrator for tier and subagent execution, use the same builder/code path instead of duplicating logic, and remain environment-gated with optional evidence logs.
gui_related: false
gui_classification_reason: This unit covers invocation verification strategy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagent_invocation_scope_dry_builder
node_compile_hint:
  mode: subagent_invocation_scope_dry_builder
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0038
preserved_exact_tokens:
- 'exact command line'
- 'same code path'
- 'Do not duplicate logic in tests'
- 'RUN_SUBAGENT_INVOCATION_TESTS=1'
- '.puppet-master/evidence/subagent-invocation-<platform>.log'
negative_constraints:
- 'Do not duplicate logic in tests.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-068 - Subagent Invocation Test Matrix

```yaml
plan_unit_id: OSI-068
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The subagent invocation test matrix preserves the integration test file/name list and summary table expectations for platform CLI smoke, subagent-invocation integration, and plan mode CLI verification.
gui_related: false
gui_classification_reason: This unit covers test matrix metadata, not GUI behavior.
split_recommended: false
depends_on:
- OSI-067
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagent_invocation_test_matrix
node_compile_hint:
  mode: subagent_invocation_test_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0038
preserved_exact_tokens:
- 'subagent_invocation_integration.rs'
- 'cursor_subagent_invocation'
- 'codex_subagent_invocation'
- 'claude_subagent_invocation'
- 'gemini_subagent_invocation'
- 'copilot_subagent_invocation'
- 'Summary table'
- 'Platform CLI smoke'
- 'Subagent-invocation integration'
- 'Plan mode CLI verification'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-069 - Cursor Invocation Builder Example

```yaml
plan_unit_id: OSI-069
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The Cursor invocation builder example preserves DRY platform_specs usage for binary names and invocation format, subagent/task replacement tokens, optional model handling, current_dir workspace assignment, and the ignored cursor_subagent_invocation test.
gui_related: false
gui_classification_reason: This unit covers example test code, not GUI behavior.
split_recommended: false
depends_on:
- OSI-067
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cursor_invocation_builder_example
node_compile_hint:
  mode: cursor_invocation_builder_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0038
preserved_exact_tokens:
- 'build_cursor_subagent_command'
- 'platform_specs::cli_binary_names()'
- 'platform_specs::get_subagent_invocation_format()'
- 'NEVER hardcode "agent" or "cursor-agent"'
- 'NEVER hardcode "/{subagent} {prompt}"'
- '{subagent}'
- '{task}'
- 'code-reviewer'
- 'INVOKED'
negative_constraints:
- 'DRY requirement: must use platform_specs::cli_binary_names() — never hardcode "agent" or "cursor-agent"'
- 'DRY requirement: must use platform_specs::get_subagent_invocation_format() — never hardcode "/{subagent} {prompt}" format'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-070 - Plan Mode CLI Scope And Gating

```yaml
plan_unit_id: OSI-070
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Plan mode CLI verification confirms CLI-bridged Cursor CLI and Claude Code CLI accept and honor plan mode flags, while Direct providers are verified through PM runtime-policy and provider-integration tests, with RUN_PLAN_MODE_CLI_TESTS gating and ignored integration tests.
gui_related: false
gui_classification_reason: This unit covers CLI verification strategy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: plan_mode_cli_scope_gating
node_compile_hint:
  mode: plan_mode_cli_scope_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0039
preserved_exact_tokens:
- 'Cursor CLI'
- 'Claude Code CLI'
- '--mode=plan'
- '--permission-mode plan'
- 'RUN_PLAN_MODE_CLI_TESTS=1'
- 'plan_mode_cli_verification.rs'
- 'cursor_plan_mode_cli'
- 'claude_plan_mode_cli'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-071 - Plan Mode CLI Commands And Assertions

```yaml
plan_unit_id: OSI-071
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Plan mode CLI tests preserve exact per-platform command examples, success and non-empty/parseable-output assertions, command-line plan-mode flag checks, optional evidence capture, and relationship to smoke and subagent-invocation tests.
gui_related: false
gui_classification_reason: This unit covers CLI verification assertions, not GUI behavior.
split_recommended: false
depends_on:
- OSI-070
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: plan_mode_cli_commands_assertions
node_compile_hint:
  mode: plan_mode_cli_commands_assertions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0039
preserved_exact_tokens:
- 'agent -p "Reply with only: PLAN_OK" --mode plan --output-format json'
- 'claude -p "Reply with only: PLAN_OK" --permission-mode plan --no-session-persistence --output-format text'
- 'stdout non-empty'
- 'parseable JSON'
- 'command-line flag assertion'
- '.puppet-master/evidence/plan-mode-cli-<platform>.log'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-072 - Cursor Plan Mode Example And Runner Parity

```yaml
plan_unit_id: OSI-072
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The Cursor plan mode example preserves binary lookup, ignored test gating, plan-mode args matching CursorRunner when request.plan_mode is true, PLAN_OK output checks, and optional no-file-writes assertion.
gui_related: false
gui_classification_reason: This unit covers example test code, not GUI behavior.
split_recommended: false
depends_on:
- OSI-070
- OSI-071
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cursor_plan_mode_example_runner_parity
node_compile_hint:
  mode: cursor_plan_mode_example_runner_parity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0039
preserved_exact_tokens:
- 'which_binary("agent")'
- 'cursor-agent'
- 'Same flags as CursorRunner when request.plan_mode == true'
- 'PLAN_OK'
- 'Optional: assert --mode plan was honored'
- 'no file writes'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-073 - Ask Plan Delegated Child Authority Ceiling

```yaml
plan_unit_id: OSI-073
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  In ask and plan modes, delegated child runs may launch only for read-only research or analysis, required planning dependencies may still be read-only child runs, parent mode is a hard ceiling, and Plan remains read-only until execution with first-class clarifying questions and visible plan/TODO artifacts.
gui_related: false
gui_classification_reason: This unit covers delegated child authority policy, not GUI behavior.
split_recommended: false
depends_on:
- OSI-005
- OSI-006
- OSI-009
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: ask_plan_delegated_child_authority_ceiling
node_compile_hint:
  mode: ask_plan_delegated_child_authority_ceiling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0040
preserved_exact_tokens:
- 'ask'
- 'plan'
- 'read-only research or analysis'
- 'parent mode is a hard ceiling'
- 'todowrite'
- 'question'
- 'Plan remains read-only'
- 'clarifying questions are first-class'
- 'plan plus TODO'
negative_constraints:
- 'The orchestrator must not silently widen a read-only planning run into execution authority.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Planning-flow behavior is PM-native and must not be justified solely by analogy to OpenCode defaults.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md'
```

### OSI-074 - Planning Child Required Optional Classification

```yaml
plan_unit_id: OSI-074
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Planning children should be classified as required or optional so planning completion and summarization behave deterministically.
gui_related: false
gui_classification_reason: This unit covers planning-flow orchestration metadata, not GUI behavior.
split_recommended: false
depends_on:
- OSI-073
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples, command lines, and test paths are preserved as plan evidence and do not create production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: planning_child_required_optional_classification
node_compile_hint:
  mode: planning_child_required_optional_classification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0040
preserved_exact_tokens:
- 'required'
- 'optional'
- 'planning completion'
- 'summarization'
- 'deterministically'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-075 - GUI Backend Scope Now In Scope

```yaml
plan_unit_id: OSI-075
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  All previously optional or later plan-mode and subagent GUI/backend items are in scope now and must specify frontend and backend behavior so they work end-to-end; the implementation-checklist boundary is coverage material attached to this scope.
gui_related: true
gui_classification_reason: This unit covers GUI/backend scope and user-visible implementation scope.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gui_backend_scope_now_in_scope
node_compile_hint:
  mode: gui_backend_scope_now_in_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0041
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0048
preserved_exact_tokens:
- 'GUI and Backend Scope (All In-Scope Now)'
- 'in scope now'
- 'frontend and backend'
- 'end-to-end'
- 'Implementation Checklist (GUI & Backend -- Add/Expand)'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-076 - Plan Mode Defaults And Global GuiConfig State

```yaml
plan_unit_id: OSI-076
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Plan mode defaults remain migration-safe false across tier defaults and YAML unless explicitly overridden, while GuiConfig owns use_plan_mode_all_tiers, optional last_per_tier_plan_mode as HashMap<String, bool>, write-through tier syncing, redb persistence at config:gui.use_plan_mode_all_tiers, and no settings.json storage for this setting.
gui_related: false
gui_classification_reason: This unit covers backend/config state and persistence defaults, not GUI presentation.
split_recommended: false
depends_on:
- OSI-073
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: plan_mode_defaults_global_guiconfig_state
node_compile_hint:
  mode: plan_mode_defaults_global_guiconfig_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0042
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0050
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0059
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0072
preserved_exact_tokens:
- 'plan_mode: false'
- 'use_plan_mode_all_tiers'
- 'last_per_tier_plan_mode'
- 'HashMap<String, bool>'
- 'config:gui.use_plan_mode_all_tiers'
- 'default_config.rs'
- 'config_override.rs'
- 'gui_config.rs'
negative_constraints:
- 'settings.json is NOT used for this setting.'
- 'Default use_plan_mode_all_tiers to false so existing configs are unchanged.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-077 - Plan Mode Config And Wizard Controls

```yaml
plan_unit_id: OSI-077
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Config and Wizard surfaces provide plan-mode controls using existing widgets: a global Use plan mode for all tiers toggle, an Enable plan mode for all tiers button, tier plan_mode toggle disabling when global mode is on, Wizard tier config as run source of truth, and persistence/merge behavior that keeps saved config consistent.
gui_related: true
gui_classification_reason: This unit covers Config/Wizard controls and user-visible plan-mode UI behavior.
split_recommended: false
depends_on:
- OSI-076
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: plan_mode_config_wizard_controls
node_compile_hint:
  mode: plan_mode_config_wizard_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0043
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0044
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0050
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0076
preserved_exact_tokens:
- 'Use plan mode for all tiers'
- 'Enable plan mode for all tiers'
- 'ConfigUsePlanModeAllTiersToggled'
- 'ConfigEnablePlanModeAllTiers'
- 'tier.plan_mode'
- 'Wizard tier config'
- 'source of truth for that run'
- 'Settings → Orchestration'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Wizard UI does not need the global plan-mode toggle; per-tier plan mode toggles and optional one-click button are sufficient.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-078 - Subagent ExecutionRequest Plan Mode Propagation

```yaml
plan_unit_id: OSI-078
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent invocation paths that build ExecutionRequest must propagate request.plan_mode from tier_config.plan_mode through TierConfig or IterationContext when enable_tier_subagents is active and subagent execution is not skipped.
gui_related: false
gui_classification_reason: This unit covers backend request propagation, not GUI behavior.
split_recommended: false
depends_on:
- OSI-061
- OSI-076
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagent_executionrequest_plan_mode_propagation
node_compile_hint:
  mode: subagent_executionrequest_plan_mode_propagation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0042
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0057
preserved_exact_tokens:
- 'ExecutionRequest'
- 'request.plan_mode = tier_config.plan_mode'
- 'TierConfig'
- 'IterationContext'
- 'execute_tier_with_subagents'
- 'build_subagent_invocation'
- 'execute_with_subagent'
- 'SubagentSelector'
- 'enable_tier_subagents'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-079 - PM Child Run Backend And Parent Rollups

```yaml
plan_unit_id: OSI-079
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator launches PM child runs rather than provider-native ad hoc agent processes; each delegated launch creates a canonical child-run record, marks required or optional, resolves requested/effective Persona/runtime/model/effort, narrows capabilities, preserves lifecycle action distinctions, and keeps parent orchestration as projected rollups over canonical child records/events.
gui_related: false
gui_classification_reason: This unit covers backend child-run orchestration, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: pm_child_run_backend_parent_rollups
node_compile_hint:
  mode: pm_child_run_backend_parent_rollups
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0045
preserved_exact_tokens:
- 'canonical child-run record'
- 'required'
- 'optional'
- 'retry'
- 'reroute'
- 'replacement'
- 'resume'
- 'cancellation'
- 'projected child-orchestration facet'
- 'child rollups by batch and subgroup'
negative_constraints:
- 'Parent orchestration state is not a separate ad hoc child-state store.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md'
```

### OSI-080 - Delegated Task Contract And Aggressive Defaults

```yaml
plan_unit_id: OSI-080
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Delegated orchestration enters the same task tool child-run contract used elsewhere, uses aggressive specialist-fit/task-fit delegation defaults when checks pass, consumes task/question/todowrite/todoread contracts, preserves parent ceilings for permissions, scopes, runtime/account restrictions, and budget, and treats Gaps and Clarifications as boundary coverage for these resolved delegated defaults.
gui_related: false
gui_classification_reason: This unit covers backend delegated-run/tool contracts, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: delegated_task_contract_aggressive_defaults
node_compile_hint:
  mode: delegated_task_contract_aggressive_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0049
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0054
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0055
preserved_exact_tokens:
- 'task'
- 'question'
- 'todowrite'
- 'todoread'
- 'subagent_tool_overrides'
- 'aggressive by default'
- 'specialist-fit / task-fit'
- 'Gaps and Clarifications'
- 'Copilot-native routing remains strict-denied'
negative_constraints:
- 'No provider-native /subagent, /agent, /fleet, or /delegate syntax is normative orchestrator runtime behavior.'
- 'Antigravity-style high-level manager or /agent-terminal patterns must not override PM-native parent supervision, terminal ownership, or delegated-run contracts.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Commands_System.md, ContractName:Plans/interview-subagent-integration.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Modes.md'
```

### OSI-081 - SubagentGuiConfig Storage And Override Semantics

```yaml
plan_unit_id: OSI-081
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  GuiConfig owns subagent configuration through a top-level subagent SubagentGuiConfig serialized as subagentConfig or equivalent, including enable_tier_subagents, tier_overrides, disabled_subagents, and required_subagents; v1 overrides are per tier type, required wins over disabled, and missing or empty override lists use auto-selection.
gui_related: false
gui_classification_reason: This unit covers backend/config schema and override semantics, not GUI presentation.
split_recommended: false
depends_on:
- OSI-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagentguiconfig_storage_override_semantics
node_compile_hint:
  mode: subagentguiconfig_storage_override_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0051
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0056
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0077
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0080
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0081
preserved_exact_tokens:
- 'subagent: SubagentGuiConfig'
- 'subagentConfig'
- 'enable_tier_subagents'
- 'tier_overrides'
- 'disabled_subagents'
- 'required_subagents'
- 'required wins'
- 'missing or empty override = use auto-selection'
- 'phase'
- 'task'
- 'subtask'
- 'iteration'
negative_constraints:
- 'Per-node overrides are out of scope for the first version.'
- 'Persona description/instruction edits do not persist inside SubagentGuiConfig.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-082 - Subagents Config UI And Registry Validation

```yaml
plan_unit_id: OSI-082
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The Config page exposes a Subagents section with enable toggle, tier override editors, disabled and required lists, registry-backed autocomplete or multi-select validation, clear inline errors for unknown names, save/apply rejection for invalid entries, backend fail-fast validation, and shared names from subagent_registry and persona_registry.
gui_related: true
gui_classification_reason: This unit covers the Config page subagents UI and validation surfaces.
split_recommended: false
depends_on:
- OSI-081
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagents_config_ui_registry_validation
node_compile_hint:
  mode: subagents_config_ui_registry_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0053
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0073
preserved_exact_tokens:
- 'Subagents'
- 'ConfigSubagentEnableTierSubagentsToggled'
- 'ConfigSubagentTierOverrideChanged'
- 'disabledSubagents'
- 'requiredSubagents'
- 'subagent_registry'
- 'persona_registry'
- 'architect-reviewer'
- 'security-auditor'
- 'Unknown subagent: [name]'
negative_constraints:
- 'Reject invalid entries with a clear error message.'
- 'Fail fast with a clear error.'
- 'Do not silently filter invalid backend entries.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-083 - Agent Config Personas UI And Import Seeds

```yaml
plan_unit_id: OSI-083
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agent Config > Personas provides UI for discovering/importing provider-native definitions as seed content, letting users add and delete mutable Personas, duplicating protected built-ins to non-reserved IDs, showing list metadata and prompt preview, and optionally trimming persona content to a smaller token footprint while preserving intent and provenance.
gui_related: true
gui_classification_reason: This unit covers user-visible Persona management UI.
split_recommended: false
depends_on:
- OSI-084
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_config_personas_ui_import_seeds
node_compile_hint:
  mode: agent_config_personas_ui_import_seeds
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0085
preserved_exact_tokens:
- 'Agent Config > Personas'
- '.claude/agents'
- 'add their own'
- 'delete any'
- 'trim'
- '500-1000 chars'
- 'prompt preview'
- 'protected built-ins'
- 'duplicated to a non-reserved ID'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-084 - Persona Storage And Injection Boundary

```yaml
plan_unit_id: OSI-084
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Persona storage layout, schema, validation, GUI management, and context-injection rules are owned by Plans/Personas.md; canonical Persona content persists in Puppet Master Persona storage only, provider-native directories are import/refresh sources only, SubagentGuiConfig is not a second runtime source, and orchestrator/interview share the same Persona resolution and injection logic.
gui_related: false
gui_classification_reason: This unit covers storage/injection ownership boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: persona_storage_injection_boundary
node_compile_hint:
  mode: persona_storage_injection_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0062
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0085
preserved_exact_tokens:
- 'Puppet Master Persona storage'
- 'not to provider-native directories'
- 'not as a second runtime source in SubagentGuiConfig'
- 'do not restate those definitions here'
- 'PERSONA.md'
- 'Instruction Bundle'
- 'Orchestrator and interview use the same injection logic'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-INJECTION, ContractName:Plans/Personas.md#STORAGE-LAYOUT'
```

### OSI-085 - Gemini Provider Validation And Config Loading

```yaml
plan_unit_id: OSI-085
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Doctor and plan-mode validation for Gemini resolve the selected provider entry, auth mode, project context, and account readiness for Gemini Direct and Gemini CLI, discover/load the same project GuiConfig inside run(), and skip or warn neutrally when config cannot be loaded rather than assuming a single API-key-only settings surface.
gui_related: false
gui_classification_reason: This unit covers provider/account validation and config loading, not GUI copy.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gemini_provider_validation_config_loading
node_compile_hint:
  mode: gemini_provider_validation_config_loading
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0042
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0047
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0052
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0074
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0075
preserved_exact_tokens:
- 'Gemini Direct'
- 'Gemini CLI'
- 'OAuth'
- 'API-key'
- 'Google/Vertex credential'
- 'config_discovery::discover_config_path(None)'
- 'gui_config::load_config(path)'
- 'skip check'
- 'neutral warning'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Plans/Multi-Account.md and Plans/Contracts_V0.md own account/auth resolution semantics.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-086 - Gemini Project Context UX And Copy Boundary

```yaml
plan_unit_id: OSI-086
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Gemini OAuth and Doctor UX expose project-context fields, validation-required and onboarding-needed states, and copy that says Configure Gemini access or names the resolved auth mode instead of treating Gemini API key as the primary or only settings path.
gui_related: true
gui_classification_reason: This unit covers Doctor/Config/Wizard user-visible Gemini access copy and UX.
split_recommended: false
depends_on:
- OSI-085
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gemini_project_context_ux_copy_boundary
node_compile_hint:
  mode: gemini_project_context_ux_copy_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0047
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0074
preserved_exact_tokens:
- 'project-context'
- 'validation-required'
- 'onboarding-needed'
- 'Configure Gemini access'
- 'Gemini API key'
- '/only'
negative_constraints:
- 'Config, Wizard, and Doctor GUI text MUST NOT frame Gemini API key as the primary or /only settings path when OAuth or Google/Vertex credential modes are valid.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-087 - Config Message Variants And App Handlers

```yaml
plan_unit_id: OSI-087
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Every new Config plan-mode and subagent message variant must be added to the Message enum and handled in App::update, including global plan-mode toggles and subagent enable/override/disabled/required list changes.
gui_related: true
gui_classification_reason: This unit covers GUI application message handling.
split_recommended: false
depends_on:
- OSI-077
- OSI-082
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: config_message_variants_app_handlers
node_compile_hint:
  mode: config_message_variants_app_handlers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0058
preserved_exact_tokens:
- 'Message'
- 'App::update'
- 'ConfigUsePlanModeAllTiersToggled'
- 'ConfigEnablePlanModeAllTiers'
- 'ConfigSubagentEnableTierSubagentsToggled'
- 'ConfigSubagentTierOverrideChanged'
- 'ConfigSubagentDisabledListChanged'
- 'ConfigSubagentRequiredListChanged'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-088 - Interview Built But Not Wired Audit

```yaml
plan_unit_id: OSI-088
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Interview Config currently builds settings that are not all wired into interview execution: max_questions_per_phase, require_architecture_confirmation, and vision_provider are present in GUI/config but absent from InterviewOrchestratorConfig and interview runtime use; the detailed resolutions continue in the next source window.
gui_related: true
gui_classification_reason: This unit covers GUI/config settings and their runtime wiring audit.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_built_not_wired_audit
node_compile_hint:
  mode: interview_built_not_wired_audit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0060
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0086
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0087
preserved_exact_tokens:
- 'InterviewGuiConfig'
- 'InterviewConfig'
- 'InterviewOrchestratorConfig'
- 'max_questions_per_phase'
- 'require_architecture_confirmation'
- 'vision_provider'
- 'Not wired'
- 'built but not wired'
negative_constraints: []
compatibility_only_notes:
- 'require_architecture_confirmation and vision_provider details continue after source line 1260.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'S0060 contains forward-reference coverage for interview settings resolved in the next bounded window.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-089 - Interview Min Max Runtime Contract

```yaml
plan_unit_id: OSI-089
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Interview question limits replace the single max setting with min_questions_per_phase and max_questions_per_phase Option<u32>, accept phase completion only after the minimum, support None as unlimited, enforce a soft cap with max + 1 grace, force-complete runaway phases with phase.force_completed and max_questions_exceeded, and never reject a phase that already collected valid answers.
gui_related: false
gui_classification_reason: This unit covers interview runtime behavior, not GUI controls.
split_recommended: false
depends_on:
- OSI-088
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_min_max_runtime_contract
node_compile_hint:
  mode: interview_min_max_runtime_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0088
preserved_exact_tokens:
- 'min_questions_per_phase'
- 'max_questions_per_phase: Option<u32>'
- 'None = unlimited'
- '<<<PM_PHASE_COMPLETE>>>'
- 'max + 1'
- 'phase.force_completed'
- 'max_questions_exceeded'
- 'No reject'
negative_constraints:
- 'Never reject a phase that has already collected valid answers.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-090 - Interview Question Limit UI Prompt And Test Wiring

```yaml
plan_unit_id: OSI-090
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Interview min/max question limits must be wired through GUI types, execution config, PhaseManager, orchestrator logic, prompt templates, docs/tooltips, and tests, with the Interview tab replacing the single max control with Min and Max plus Unlimited and prompts injecting configured min/max instructions.
gui_related: true
gui_classification_reason: This unit covers Interview tab controls, prompts, and user-visible configuration wiring.
split_recommended: false
depends_on:
- OSI-089
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_question_limit_ui_prompt_test_wiring
node_compile_hint:
  mode: interview_question_limit_ui_prompt_test_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0088
preserved_exact_tokens:
- 'Interview tab'
- 'Unlimited'
- 'prompt_templates.rs'
- 'Ask at least {min} questions...'
- 'Do not exceed {max} questions...'
- 'unit tests'
- 'integration test'
- 'env-gated smoke'
- 'PhaseManager'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-091 - Platform Specs And Subagent Registry DRY Requirements

```yaml
plan_unit_id: OSI-091
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  DRY method compliance requires platform_specs for platform CLI commands, binary names, models, auth, capabilities, and invocation formats; discover_platform_capabilities instead of match statements; subagent_registry for subagent language/framework/name mappings; and DRY:DATA:subagent_registry as the single source of truth.
gui_related: false
gui_classification_reason: This unit covers backend DRY data/function requirements, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_specs_subagent_registry_dry_requirements
node_compile_hint:
  mode: platform_specs_subagent_registry_dry_requirements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0063
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0064
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0065
preserved_exact_tokens:
- 'platform_specs::'
- 'discover_platform_capabilities()'
- 'subagent_registry::'
- 'DRY:DATA:subagent_registry'
- 'build_subagent_invocation'
- 'language_to_subagent'
- 'framework_to_subagent'
- 'platform_agents_dir'
- 'invoke_subagent'
negative_constraints:
- 'NEVER hardcode platform CLI commands, binary names, models, auth, or capabilities.'
- 'NEVER hardcode subagent names in match statements or mappings.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Plans/DRY_Rules.md#dry-method-compliance'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-092 - GUI Widget Catalog And DRY Tagging

```yaml
plan_unit_id: OSI-092
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Plan-mode and subagent GUI work must check docs/gui-widget-catalog.md before adding UI, reuse existing widgets and layout helpers where possible, tag reusable widgets/functions/data/helpers with DRY tags, document UI-DRY-EXCEPTION when bespoke UI is required, and run widget-catalog generation/check scripts after widget or catalog changes.
gui_related: true
gui_classification_reason: This unit covers GUI widget reuse, catalog, and tagging requirements.
split_recommended: false
depends_on:
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gui_widget_catalog_dry_tagging
node_compile_hint:
  mode: gui_widget_catalog_dry_tagging
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0064
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0066
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0067
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0068
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0069
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0070
preserved_exact_tokens:
- 'docs/gui-widget-catalog.md'
- 'styled_button'
- 'toggler'
- 'help_tooltip'
- 'DRY:WIDGET:'
- 'DRY:FN:'
- 'DRY:DATA:'
- 'DRY:HELPER:'
- 'UI-DRY-EXCEPTION'
- 'scripts/generate-widget-catalog.sh'
- 'scripts/check-widget-reuse.sh'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-093 - Platform Output Parser And Hook Reliability

```yaml
plan_unit_id: OSI-093
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Structured subagent handoff validation needs platform-specific parser and hook reliability: JSON parsers for Cursor/Claude/Gemini, JSONL/NDJSON aggregation for Codex, regex/text extraction for Copilot, parser.error seglog records with raw-output excerpts, generic fallback extraction, parser_fallback_used metadata, retry behavior, raw output preservation, and malformed/missing-field/edge-case integration tests.
gui_related: false
gui_classification_reason: This unit covers parser and hook backend reliability, not GUI behavior.
split_recommended: false
depends_on:
- OSI-047
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_output_parser_hook_reliability
node_compile_hint:
  mode: platform_output_parser_hook_reliability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0061
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0084
preserved_exact_tokens:
- 'JSON'
- 'JSONL'
- 'text parser'
- 'NDJSON events'
- 'parser.error'
- 'first 500 characters'
- 'parser_fallback_used'
- 'malformed input tests'
- 'Never silently drop output'
- 'SubagentOutput'
negative_constraints:
- 'Never silently drop output.'
compatibility_only_notes: []
stale_retired_dispositions:
- 'Earlier complete with warnings fallback wording is superseded by the resolved retry/surface-error behavior.'
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-094 - Parser Failure Recovery UX

```yaml
plan_unit_id: OSI-094
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  If platform-specific and generic parser fallback both fail after retry, the provider error is surfaced to the user with retry, skip, and raw-output viewing options rather than silently dropping output.
gui_related: true
gui_classification_reason: This unit covers user-visible parser failure recovery affordances.
split_recommended: false
depends_on:
- OSI-093
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parser_failure_recovery_ux
node_compile_hint:
  mode: parser_failure_recovery_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0061
preserved_exact_tokens:
- 'Could not parse output from [Provider]. [Retry] [Skip] [View raw output].'
- 'Retry'
- 'Skip'
- 'View raw output'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-095 - Platform Persona Prompt Adapter

```yaml
plan_unit_id: OSI-095
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform runners adapt subagent persona prompts per provider: Cursor may use /subagent_name, Codex/Claude/Gemini/Copilot may use an As <subagent_name> prompt preamble or omit unsupported conventions, and subagent_prompt_prefix or platform_specs owns the per-platform adaptation point.
gui_related: false
gui_classification_reason: This unit covers provider adapter behavior, not GUI behavior.
split_recommended: false
depends_on:
- OSI-084
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_persona_prompt_adapter
node_compile_hint:
  mode: platform_persona_prompt_adapter
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0078
preserved_exact_tokens:
- 'Cursor => /subagent_name'
- 'Codex/Claude/Gemini/Copilot'
- 'As <subagent_name>,'
- 'subagent_prompt_prefix(platform, subagent_name)'
- 'platform_specs'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-096 - Project Context Detection Cache Boundary

```yaml
plan_unit_id: OSI-096
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Project context, language, and framework detection should be cached by canonical workspace path, invalidated on config reload or workspace changes, exposed through get_project_context(workspace), and optionally TTL- or run-duration-scoped so long sessions do not hold stale data.
gui_related: false
gui_classification_reason: This unit covers backend detection caching, not GUI behavior.
split_recommended: false
depends_on:
- OSI-038
- OSI-059
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: project_context_detection_cache_boundary
node_compile_hint:
  mode: project_context_detection_cache_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0079
preserved_exact_tokens:
- 'cache key: canonical workspace path'
- 'get_project_context(workspace) -> Result<ProjectContext>'
- 'TTL'
- 'cache for the duration of the run'
- 'Phase 1/2'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Phase 1/2 timing language is source-lineage planning vocabulary; runtime behavior follows the cache boundary.'
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-097 - Config Dirty State Atomic Persistence

```yaml
plan_unit_id: OSI-097
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Config changes for global plan mode and subagent settings follow existing Config save behavior, mark dirty or prompt on leave as appropriate, and persist use_plan_mode_all_tiers, last_per_tier_plan_mode, and the full subagent block atomically through the same GuiConfig and gui_config::save_config call to the same YAML file.
gui_related: true
gui_classification_reason: This unit covers user-visible Config save/dirty behavior and atomic persistence.
split_recommended: false
depends_on:
- OSI-076
- OSI-081
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: config_dirty_state_atomic_persistence
node_compile_hint:
  mode: config_dirty_state_atomic_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0082
preserved_exact_tokens:
- 'explicit Save'
- 'mark dirty'
- 'prompt on leave'
- 'gui_config::save_config()'
- 'entire gui_config'
- 'same YAML file'
- 'use_plan_mode_all_tiers'
- 'last_per_tier_plan_mode'
negative_constraints:
- 'Never persist only tier config without plan-mode global or subagent settings.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-098 - Tier Quality Verification Policy

```yaml
plan_unit_id: OSI-098
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Tier quality verification prioritizes quality over speed, scopes checks to changed files or tier artifacts where practical, defines a small canonical quality checklist per tier, requires reviewer subagent participation at end-of-tier, retry, and quality-gate failure, routes unrelated failures through parent-tier orchestration, and reuses existing gates rather than duplicating them.
gui_related: false
gui_classification_reason: This unit covers verification policy, not GUI behavior.
split_recommended: false
depends_on:
- OSI-063
- OSI-079
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Section-only headings and checklist boundary spans in this window are preserved as coverage material attached to adjacent
  units, not as standalone implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_quality_verification_policy
node_compile_hint:
  mode: tier_quality_verification_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0071
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0083
preserved_exact_tokens:
- 'Potential Issues'
- 'Quality over performance'
- 'reviewer subagent'
- 'end-of-tier'
- 'retry'
- 'quality gate fails'
- 'unrelated failures'
- 'parent-tier orchestrator'
- 'reuse existing gates'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-099 - Interview Architecture Confirmation Gate

```yaml
plan_unit_id: OSI-099
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Interview execution must wire require_architecture_confirmation into InterviewOrchestratorConfig from gui_config.interview in app.rs and require explicit architecture/tech-stack confirmation through a phase gate, dedicated phase, or prompt line before phase completion when enabled.
gui_related: true
gui_classification_reason: This unit covers interview flow UX and confirmation behavior.
split_recommended: false
depends_on:
- OSI-088
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_architecture_confirmation_gate
node_compile_hint:
  mode: interview_architecture_confirmation_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0089
preserved_exact_tokens:
- 'require_architecture_confirmation'
- 'InterviewOrchestratorConfig'
- 'gui_config.interview'
- 'app.rs'
- 'architecture/tech stack'
- 'explicit confirmation'
- 'phase gate'
- 'dedicated phase'
- 'prompt line'
- 'AGENTS.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-100 - Interview Vision Provider Selection

```yaml
plan_unit_id: OSI-100
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Interview and follow-up image or vision flows must wire vision_provider as a String into InterviewOrchestratorConfig, use it for screenshot/diagram or other vision-capable requests filtered by platform_specs vision capability, and document use-when-implemented behavior if no image flow exists yet.
gui_related: true
gui_classification_reason: This unit covers vision-capable interview UX/config behavior.
split_recommended: false
depends_on:
- OSI-088
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_vision_provider_selection
node_compile_hint:
  mode: interview_vision_provider_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0089
preserved_exact_tokens:
- 'vision_provider'
- 'String'
- 'screenshots'
- 'diagrams'
- 'vision-capable requests'
- 'platform_specs vision capability'
- 'use when implementing image/vision flows'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-101 - Main Run Config Source Alignment

```yaml
plan_unit_id: OSI-101
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Main orchestrator run config must align with Config tab saves: the run loop uses ConfigManager::discover and get_config to load PuppetMasterConfig from disk, the Config tab saves GuiConfig to the same path, saved YAML must remain compatible for execution-affecting fields, and project-hinted runs should prefer discover_with_hint(project_path).
gui_related: true
gui_classification_reason: This unit covers config-source behavior visible through the Config tab and run setup.
split_recommended: false
depends_on:
- OSI-097
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: main_run_config_source_alignment
node_compile_hint:
  mode: main_run_config_source_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0090
preserved_exact_tokens:
- 'ConfigManager::discover()'
- 'get_config()'
- 'PuppetMasterConfig'
- 'Config tab'
- 'GuiConfig'
- 'same path'
- 'ConfigManager::discover_with_hint(project_path)'
negative_constraints:
- 'Saving from the Config tab must not drop or default values that the run expects.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-102 - Execution Config Wiring Checklist

```yaml
plan_unit_id: OSI-102
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Every new execution-affecting config or feature must follow the built-but-not-wired checklist: add the field to the runtime execution config, set it during construction/load from the source of truth, use it in the execution path, document the checklist, and have reviewers verify that GUI/file settings have corresponding execution-config fields and runtime usage.
gui_related: true
gui_classification_reason: This unit covers GUI/config features and their execution wiring process.
split_recommended: false
depends_on:
- OSI-088
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: execution_config_wiring_checklist
node_compile_hint:
  mode: execution_config_wiring_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0091
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0092
preserved_exact_tokens:
- 'built but not wired'
- 'affects execution'
- 'Execution config type'
- 'Construction / load'
- 'Runtime use'
- 'Do not only add it to GUI or file-only config'
- 'No "dead" fields'
- 'Implementers and reviewers'
negative_constraints:
- 'Do not only add execution-affecting config to GUI or file-only config.'
- 'No dead fields in the execution config.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-103 - GUI Wiring Matrix Enforcement

```yaml
plan_unit_id: OSI-103
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  GUI projects enforce built-but-not-wired at the UI layer through wiring_matrix.json and ui_command_catalog.json: every interactive element must have a bound command and handler, orphan elements and orphan commands are validation failures, and tier-boundary validation includes a UI wiring check for UI-scoped nodes.
gui_related: true
gui_classification_reason: This unit covers mechanical GUI wiring enforcement.
split_recommended: false
depends_on:
- OSI-102
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gui_wiring_matrix_enforcement
node_compile_hint:
  mode: gui_wiring_matrix_enforcement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0092
preserved_exact_tokens:
- '.puppet-master/project/ui/wiring_matrix.json'
- '.puppet-master/project/ui/ui_command_catalog.json'
- 'bound command and handler'
- 'orphan elements'
- 'orphan commands'
- 'UI wiring check'
- 'nodes with UI scope'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-104 - Tier Boundary Config Wiring Validation

```yaml
plan_unit_id: OSI-104
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  At each Phase, Task, Subtask, and Iteration boundary, a shared validation layer checks that tier config, plan_mode, interview config when relevant, subagent config, and ExecutionRequest construction are present and actually used for that tier, with a summary table defining what each tier checks.
gui_related: false
gui_classification_reason: This unit covers backend tier-boundary validation, not GUI presentation.
split_recommended: false
depends_on:
- OSI-102
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_boundary_config_wiring_validation
node_compile_hint:
  mode: tier_boundary_config_wiring_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0093
preserved_exact_tokens:
- 'Phase'
- 'Task'
- 'Subtask'
- 'Iteration'
- 'tier config'
- 'plan_mode'
- 'InterviewOrchestratorConfig'
- 'min/max questions'
- 'subagent config'
- 'ExecutionRequest'
- 'Start of phase'
- 'Start of task'
- 'Start of subtask'
- 'Start of iteration'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'A single run-start check can miss tier-specific wiring and is insufficient by itself.'
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-105 - Config Wiring Validator Entrypoint And Failure Policy

```yaml
plan_unit_id: OSI-105
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Config-wiring validation uses a single entry point such as validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>, called at tier entry for main and interview orchestrators, with fail-fast behavior for missing required execution-affecting fields, warn/toast behavior for classic built-but-not-wired gaps, and unit/integration tests.
gui_related: true
gui_classification_reason: This unit includes user-facing warning/toast behavior for config wiring failures.
split_recommended: false
depends_on:
- OSI-104
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: config_wiring_validator_entrypoint_failure_policy
node_compile_hint:
  mode: config_wiring_validator_entrypoint_failure_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0093
preserved_exact_tokens:
- 'validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>'
- 'Fail fast'
- 'Warn'
- 'toast'
- 'unit tests'
- 'Integration test'
- 'interview-specific validator'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-106 - Checklist And Validation Complementarity

```yaml
plan_unit_id: OSI-106
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Process checklist A and tier-boundary validation B are complementary: the mandatory wiring checklist reduces omissions, and validation catches remaining omissions so built-but-not-wired behavior does not reach users.
gui_related: false
gui_classification_reason: This unit covers process/validation relationship, not GUI behavior.
split_recommended: false
depends_on:
- OSI-102
- OSI-104
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: checklist_validation_complementarity
node_compile_hint:
  mode: checklist_validation_complementarity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0091
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0094
preserved_exact_tokens:
- 'Process (A)'
- 'Validation (B)'
- 'Together'
- 'built but not wired'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-107 - Tier Verification Lifecycle And HITL Boundary

```yaml
plan_unit_id: OSI-107
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Tier verification defines broader start verification and end verification around Phase, Task, and Subtask boundaries, persists verification and QA-cycle results as canonical events/projections, treats waiting_approval, needs_review, and warning states as overlays rather than Executor node statuses, and keeps HITL pauses after end verification before advancing.
gui_related: true
gui_classification_reason: This unit covers user-visible verification/HITL overlays and boundary behavior.
split_recommended: true
depends_on:
- OSI-098
- OSI-104
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_verification_lifecycle_hitl_boundary
node_compile_hint:
  mode: tier_verification_lifecycle_hitl_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0095
preserved_exact_tokens:
- 'start verification'
- 'end verification'
- 'quality review'
- 'Human-in-the-Loop (HITL)'
- 'config.validation.*'
- 'run.qa_cycle_*'
- 'waiting_approval'
- 'needs_review'
- 'Plans/human-in-the-loop.md'
- 'Plans/Executor_Protocol.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Detailed end-tier verification remains in S0097 for the next bounded window.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-108 - Tier Start Pre-Spawn Verification Checklist

```yaml
plan_unit_id: OSI-108
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  When entering a Phase, Task, or Subtask, the orchestrator runs start verification before building execution context or spawning the agent, including config-wiring checks, GUI-to-backend and backend-to-GUI mapping checks, operation sequence validation, known-gap checks, and UI wiring checks for UI-scoped project nodes.
gui_related: true
gui_classification_reason: This unit covers GUI/backend mapping and UI wiring checks in start verification.
split_recommended: false
depends_on:
- OSI-104
- OSI-103
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_start_prespawn_verification_checklist
node_compile_hint:
  mode: tier_start_prespawn_verification_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0096
preserved_exact_tokens:
- 'before building execution context or spawning the agent'
- 'validate_config_wiring_for_tier'
- 'GUI'
- 'backend'
- 'load config → select subagents → build request → run'
- '.puppet-master/project/ui/'
- 'contract_refs'
- 'no unbound UI actions'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-109 - Tier Start Responsibility Phases And Persistence

```yaml
plan_unit_id: OSI-109
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Tier-start verification separates BeforeTierStart, DuringTierStart, and AfterTierStart responsibilities, builds StartVerificationResult, logs/handles failures, emits canonical config.validation.passed|warning|failed events, updates redb projections and verification history, and defines src/verification/tier_start.rs with verify_tier_start.
gui_related: true
gui_classification_reason: This unit covers verification result visibility, events, and persisted projections.
split_recommended: false
depends_on:
- OSI-108
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_start_responsibility_phases_persistence
node_compile_hint:
  mode: tier_start_responsibility_phases_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0096
preserved_exact_tokens:
- 'BeforeTierStart'
- 'DuringTierStart'
- 'AfterTierStart'
- 'StartVerificationResult'
- 'config.validation.passed|warning|failed'
- 'redb'
- 'src/verification/tier_start.rs'
- 'verify_tier_start()'
- '.puppet-master/logs/verification.log'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Canonical events/projections replace authoritative ad hoc JSON verification files.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-110 - Orchestrator Tier Start Integration Flow

```yaml
plan_unit_id: OSI-110
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The orchestrator tier-entry example runs verify_tier_start before building execution context, handles VerificationStatus Pass/Fail/Warning through FailFast or WarnAndContinue policy, logs and persists results, and builds execution context only after pass or warn-and-continue.
gui_related: false
gui_classification_reason: This unit covers backend orchestrator flow, not GUI behavior.
split_recommended: false
depends_on:
- OSI-109
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_tier_start_integration_flow
node_compile_hint:
  mode: orchestrator_tier_start_integration_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0096
preserved_exact_tokens:
- 'src/core/orchestrator.rs'
- 'execute_tier'
- 'verify_tier_start'
- 'VerificationPolicy::FailFast'
- 'WarnAndContinue'
- 'log_verification_result'
- 'persist_verification_result'
- 'build_execution_context'
negative_constraints:
- 'Build execution context only after verification passed or warn-and-continue policy allows continuation.'
compatibility_only_notes:
- 'The Rust snippet is plan/example evidence, not an executable WorkNode or final implementation output.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-111 - Start Verification Result Types And Categories

```yaml
plan_unit_id: OSI-111
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Start verification result types preserve the example schema for StartVerificationResult, VerificationStatus, VerificationFinding, FindingCategory, and FindingSeverity, including pass/fail/warning states and ConfigWiring, GuiBackendMapping, BackendGuiMapping, OperationSequence, and KnownGaps categories.
gui_related: true
gui_classification_reason: This unit includes categories for GUI/backend mapping findings and user-visible verification status.
split_recommended: false
depends_on:
- OSI-109
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: start_verification_result_types_categories
node_compile_hint:
  mode: start_verification_result_types_categories
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0096
preserved_exact_tokens:
- 'StartVerificationResult'
- 'VerificationStatus'
- 'Pass'
- 'Fail'
- 'Warning'
- 'VerificationFinding'
- 'FindingCategory'
- 'ConfigWiring'
- 'GuiBackendMapping'
- 'BackendGuiMapping'
- 'OperationSequence'
- 'KnownGaps'
- 'FindingSeverity'
- 'DRY:FN:verify_tier_start'
negative_constraints: []
compatibility_only_notes:
- 'The Rust type definitions are plan/example evidence, not an executable WorkNode or final implementation output.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-112 - Verify Tier Start Algorithm

```yaml
plan_unit_id: OSI-112
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  verify_tier_start collects config wiring, GUI-backend mapping, backend-GUI mapping, operation sequence, and known-gap findings; maps severities to fail/warning/pass; and returns a StartVerificationResult with tier_type, node_id, findings, and Utc timestamp.
gui_related: true
gui_classification_reason: This unit includes GUI/backend mapping algorithm checks and surfaced verification status.
split_recommended: false
depends_on:
- OSI-111
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: verify_tier_start_algorithm
node_compile_hint:
  mode: verify_tier_start_algorithm
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0096
preserved_exact_tokens:
- 'config_wiring_result'
- 'check_gui_backend_mapping'
- 'check_backend_gui_mapping'
- 'validate_operation_sequence'
- 'check_known_gaps'
- 'Critical'
- 'Major'
- 'VerificationStatus::Fail'
- 'VerificationStatus::Warning'
- 'Utc::now()'
negative_constraints: []
compatibility_only_notes:
- 'The Rust algorithm snippet is plan/example evidence, not an executable WorkNode or final implementation output.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-113 - Tier Start Helper Function Boundaries

```yaml
plan_unit_id: OSI-113
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Tier-start helper boundaries separate config wiring validation, GUI-backend mapping loading, backend-GUI mapping loading, operation sequence validation, and known-gap loading into named helper functions returning typed result boundaries.
gui_related: true
gui_classification_reason: This unit includes GUI/backend mapping helper boundaries.
split_recommended: false
depends_on:
- OSI-112
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_start_helper_function_boundaries
node_compile_hint:
  mode: tier_start_helper_function_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0096
preserved_exact_tokens:
- 'validate_config_wiring_for_tier'
- 'ConfigWiringResult'
- 'MappingCheckResult'
- 'load_gui_backend_mapping'
- 'load_backend_gui_mapping'
- 'SequenceValidationResult'
- 'GapCheckResult'
- 'load_known_gaps'
negative_constraints: []
compatibility_only_notes:
- 'The helper function signatures are plan/example evidence, not executable WorkNodes.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-114 - Tier Start Error Handling Policy

```yaml
plan_unit_id: OSI-114
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Tier-start error handling treats config loading failure as VerificationStatus::Fail with a Critical finding, mapping load failure as VerificationStatus::Warning with an Info finding, and gap-check failure as a logged warning while continuing because gaps are informational.
gui_related: true
gui_classification_reason: This unit covers verification statuses and user/operator-visible error policy.
split_recommended: false
depends_on:
- OSI-112
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_start_error_handling_policy
node_compile_hint:
  mode: tier_start_error_handling_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0096
preserved_exact_tokens:
- 'Config loading failure'
- 'Mapping load failure'
- 'Gap check failure'
- 'VerificationStatus::Fail'
- 'Critical finding'
- 'VerificationStatus::Warning'
- 'Info finding'
- 'log warning and continue'
- 'gaps are informational'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-115 - End Tier Wiring And Acceptance Recheck

```yaml
plan_unit_id: OSI-115
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  End-tier verification reruns wiring/readiness in completion context for Phase, Task, and Subtask completion, checks whether new or touched config/settings are wired across GUI, backend, and execution, and runs existing acceptance criteria as the spec-compliance check before tier completion.
gui_related: true
gui_classification_reason: This unit covers GUI/backend/execution wiring rechecks at user-visible tier completion.
split_recommended: false
depends_on:
- OSI-107
- OSI-108
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: end_tier_wiring_acceptance_recheck
node_compile_hint:
  mode: end_tier_wiring_acceptance_recheck
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'End-of-phase / end-of-task / end-of-subtask verification'
- 'Phase'
- 'Task'
- 'Subtask'
- 'completion'
- 'GUI ↔ backend ↔ execution'
- 'Acceptance criteria'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-116 - Required Agent Driven Quality Verification

```yaml
plan_unit_id: OSI-116
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  End-tier quality verification requires agent-driven review of code or artifacts for maintainability, correctness, and project-standard alignment, including a dedicated reviewer subagent and required quality criteria in the gate, with no human-review path and no skip path.
gui_related: false
gui_classification_reason: This unit covers backend/verification quality policy, not GUI behavior.
split_recommended: false
depends_on:
- OSI-098
- OSI-107
- OSI-115
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: required_agent_driven_quality_verification
node_compile_hint:
  mode: required_agent_driven_quality_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'review the code (or artifacts)'
- 'maintainable, correct, and aligned with project standards'
- 'Structured code review by reviewer subagent'
- 'required, not optional'
- 'code-reviewer'
- 'Quality criteria in the gate'
negative_constraints:
- 'No human review; agent-driven only.'
- 'There is no path that skips this.'
- 'Do not use human review.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-117 - Document Packaging Verification Gate

```yaml
plan_unit_id: OSI-117
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  End-of-run verification must enforce Plans/Document_Packaging_Policy.md for Markdown/text artifacts under .puppet-master/** that reached packaging triggers, and any packaging verification breach blocks tier completion where the Document Set audit applies.
gui_related: false
gui_classification_reason: This unit covers document packaging verification policy, not GUI behavior.
split_recommended: false
depends_on:
- OSI-115
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: document_packaging_verification_gate
node_compile_hint:
  mode: document_packaging_verification_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'Document packaging verification'
- 'End-of-run verification MUST enforce'
- '.puppet-master/**'
- 'packaging triggers'
- 'Document Set audit checks (A/B/C)'
- 'fail tier completion on any packaging verification breach'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014'
```

### OSI-118 - Quality Gate Severity Defaults And Overrides

```yaml
plan_unit_id: OSI-118
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Quality gate severity defaults classify linter/test/build/type errors as fail-worthy critical checks, linter warnings, formatter violations, and coverage delta as advisory warnings, load thresholds from .puppet-master/quality.json when present, and allow per-check fail/warn overrides through quality.gate.{check_name}.action.
gui_related: false
gui_classification_reason: This unit covers backend quality-gate policy, not GUI behavior.
split_recommended: false
depends_on:
- OSI-116
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: quality_gate_severity_defaults_overrides
node_compile_hint:
  mode: quality_gate_severity_defaults_overrides
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'Linter errors'
- 'Linter warnings'
- 'Formatter violations'
- 'Test failures'
- 'Test coverage delta < 0%'
- 'Build errors'
- 'Type check errors'
- 'Critical'
- 'Advisory'
- 'Fail'
- 'Warn'
- '.puppet-master/quality.json'
- 'quality.gate.{check_name}.action'
- '"fail"'
- '"warn"'
negative_constraints:
- 'If .puppet-master/quality.json is missing, use built-in defaults.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-119 - BeforeTierEnd Verification Context Preparation

```yaml
plan_unit_id: OSI-119
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeTierEnd prepares verification context by collecting tier artifacts, computing git diff where applicable, loading tier context and execution history, and building a context with artifacts, diff, tier context, and config.
gui_related: false
gui_classification_reason: This unit covers backend verification context preparation, not GUI behavior.
split_recommended: false
depends_on:
- OSI-115
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: before_tier_end_verification_context_preparation
node_compile_hint:
  mode: before_tier_end_verification_context_preparation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'BeforeTierEnd'
- 'Collect tier artifacts'
- 'Compute diff'
- 'Load tier context'
- 'execution history'
- 'Prepare verification context'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-120 - DuringTierEnd Verification Execution

```yaml
plan_unit_id: OSI-120
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  DuringTierEnd reruns wiring checks, acceptance criteria, quality verification via reviewer subagent and automated gate criteria, Document Set audit checks, collects results, and determines complete, incomplete, or complete-with-warnings tier status.
gui_related: true
gui_classification_reason: This unit includes user-visible tier status outcomes and verification result handling.
split_recommended: false
depends_on:
- OSI-115
- OSI-116
- OSI-117
- OSI-119
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: during_tier_end_verification_execution
node_compile_hint:
  mode: during_tier_end_verification_execution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'DuringTierEnd'
- 'Re-run wiring check'
- 'Run acceptance criteria'
- 'Code review by reviewer subagent'
- 'Quality gate criteria'
- 'linters, formatters, test coverage, security scanners'
- 'Document Set audit checks (A/B/C)'
- 'complete'
- 'incomplete'
- 'complete with warnings'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-121 - AfterTierEnd Persistence Feedback And Failure Handling

```yaml
plan_unit_id: OSI-121
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  AfterTierEnd persists verification results, updates tier status in PRD/state, generates feedback for agent/user when verification fails, and handles failures as rework or complete-with-warnings according to policy.
gui_related: true
gui_classification_reason: This unit covers user/operator feedback and tier status surfaces.
split_recommended: false
depends_on:
- OSI-120
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: after_tier_end_persistence_feedback_failure_handling
node_compile_hint:
  mode: after_tier_end_persistence_feedback_failure_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'AfterTierEnd'
- '.puppet-master/state/verification-{node_id}-end.json'
- 'Update tier status'
- 'Generate feedback'
- 'agent/user'
- 'incomplete'
- 'rework'
- 'complete with warnings'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-122 - Tier End Orchestrator Integration Example

```yaml
plan_unit_id: OSI-122
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The tier-end orchestrator example introduces tier_end verification integration, collecting artifacts and diff, calling verify_tier_end, mapping VerificationStatus to TierStatus, persisting results, updating tier status, and generating feedback when incomplete.
gui_related: false
gui_classification_reason: This unit covers backend orchestrator example flow, not GUI behavior.
split_recommended: false
depends_on:
- OSI-121
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_end_orchestrator_integration_example
node_compile_hint:
  mode: tier_end_orchestrator_integration_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'src/verification/tier_end.rs'
- 'verify_tier_end()'
- 'src/core/orchestrator.rs'
- 'complete_tier'
- 'collect_tier_artifacts'
- 'compute_tier_diff'
- 'VerificationStatus::Pass'
- 'VerificationStatus::Fail'
- 'VerificationStatus::Warning'
- 'TierStatus::CompleteWithWarnings'
negative_constraints: []
compatibility_only_notes:
- 'The Rust snippet is plan evidence only, not an executable node output.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-123 - EndVerificationResult Schema And Algorithm

```yaml
plan_unit_id: OSI-123
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  EndVerificationResult preserves tier type, node id, status, wiring/acceptance/quality checks, findings, feedback, timestamp, and an algorithm that reruns wiring, acceptance criteria, and quality verification, maps critical/major findings to fail or warning, and generates verification feedback on failure.
gui_related: false
gui_classification_reason: This unit covers backend verification result schema and algorithm, not GUI behavior.
split_recommended: false
depends_on:
- OSI-120
- OSI-122
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: endverificationresult_schema_algorithm
node_compile_hint:
  mode: endverificationresult_schema_algorithm
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'EndVerificationResult'
- 'wiring_check'
- 'acceptance_check'
- 'quality_check'
- 'VerificationFinding'
- 'FindingCategory::ConfigWiring'
- 'FindingCategory::AcceptanceCriteria'
- 'FindingCategory::Quality'
- 'FindingSeverity::Critical'
- 'FindingSeverity::Major'
- 'Utc::now()'
- 'generate_verification_feedback'
negative_constraints: []
compatibility_only_notes:
- 'The Rust schema and algorithm snippet is plan evidence only.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-124 - Quality Verification Composition

```yaml
plan_unit_id: OSI-124
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  run_quality_verification composes required reviewer subagent review and required quality gate criteria, accumulates findings from reviewer_result and quality_gate_result, and passes only when findings are empty.
gui_related: false
gui_classification_reason: This unit covers backend quality verification composition, not GUI behavior.
split_recommended: false
depends_on:
- OSI-116
- OSI-123
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: quality_verification_composition
node_compile_hint:
  mode: quality_verification_composition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'run_quality_verification'
- 'run_reviewer_subagent'
- 'run_quality_gate_criteria'
- 'reviewer_result'
- 'quality_gate_result'
- 'passed: findings.is_empty()'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-125 - Reviewer Subagent Registry And DRY Invocation Boundary

```yaml
plan_unit_id: OSI-125
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Reviewer subagent selection and invocation must resolve reviewer-capable entries through subagent registry using execution_unit_context and reviewer role metadata, use platform_specs functions and platform runner abstractions, avoid hardcoded code-reviewer or tier-only lookup, parse reviewer output as SubagentOutput, and preserve task_report feedback.
gui_related: false
gui_classification_reason: This unit covers backend reviewer selection/invocation boundaries, not GUI behavior.
split_recommended: false
depends_on:
- OSI-091
- OSI-124
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: reviewer_subagent_registry_dry_invocation_boundary
node_compile_hint:
  mode: reviewer_subagent_registry_dry_invocation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'execution_unit_context'
- 'reviewer role metadata'
- 'never hardcode "code-reviewer"'
- 'tier-only lookup'
- 'platform_specs functions'
- 'DO NOT use match statements'
- 'platform_specs::get_subagent_invocation_format()'
- 'SubagentOutput'
- 'task_report'
negative_constraints:
- 'Never hardcode code-reviewer or select by tier-only lookup.'
- 'Do not use match statements for platform selection.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, Gate:GATE-005'
```

### OSI-126 - Tier Quality Criteria Catalog And Runner

```yaml
plan_unit_id: OSI-126
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Quality criteria are selected per tier type and run through quality check runners, preserving phase/task/subtask/iteration source tokens, document and design doc quality checks, linter and test coverage checks, no TODOs without tickets, and iteration quality checked at subtask level.
gui_related: false
gui_classification_reason: This unit covers backend quality criteria catalog behavior, not GUI behavior.
split_recommended: false
depends_on:
- OSI-118
- OSI-124
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_quality_criteria_catalog_runner
node_compile_hint:
  mode: tier_quality_criteria_catalog_runner
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'get_quality_criteria_for_tier'
- 'Phase'
- 'Task'
- 'Subtask'
- 'Iteration'
- 'document_quality'
- 'design_doc_quality'
- 'no_new_clippy_warnings'
- 'new_code_has_tests'
- 'no_todos_without_tickets'
- 'DocumentReview'
- 'Linter'
- 'TestCoverage'
- 'CodeReview'
- 'Iteration quality checked at subtask level'
negative_constraints: []
compatibility_only_notes:
- 'Phase/Task/Subtask/Iteration are preserved source tokens for tier-era compatibility, not promoted above graph/node identity.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-127 - End Tier Verification Error Handling Policy

```yaml
plan_unit_id: OSI-127
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  End-tier verification error handling treats artifact collection failure as warning with Info finding, diff computation failure as logged warning and continue, reviewer subagent failure as fail with Critical finding because reviewer is required, and quality gate failure status according to severity.
gui_related: true
gui_classification_reason: This unit covers user/operator-visible verification failure outcomes.
split_recommended: false
depends_on:
- OSI-120
- OSI-125
- OSI-126
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: end_tier_verification_error_handling_policy
node_compile_hint:
  mode: end_tier_verification_error_handling_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0097
preserved_exact_tokens:
- 'Artifact collection failure'
- 'Diff computation failure'
- 'Reviewer subagent failure'
- 'Quality gate failure'
- 'VerificationStatus::Warning'
- 'VerificationStatus::Fail'
- 'Critical finding'
- 'log warning and continue'
- 'Critical → Fail'
- 'Major/Minor → Warning'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-128 - Start/End Verification Timing Matrix

```yaml
plan_unit_id: OSI-128
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Start and end tier boundaries use the summary timing matrix to distinguish start-phase/task/subtask/iteration config-wiring
  and wiring/readiness checks from end-phase/task/subtask acceptance and quality verification.
gui_related: true
gui_classification_reason: The matrix explicitly names GUI/backend wiring-readiness and user-visible verification boundary
  behavior.
split_recommended: true
depends_on:
- OSI-104
- OSI-107
- OSI-115
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: start_end_verification_timing_matrix
node_compile_hint:
  mode: start_end_verification_timing_matrix
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0098
preserved_exact_tokens:
- Start Phase
- Start Task
- Start Subtask
- Start Iteration
- End Phase
- End Task
- End Subtask
- Config-wiring
- Wiring/readiness (GUI? backend? steps? gaps?)
- Acceptance criteria
- Quality verification
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-129 - Canonical Validation Table Source Of Truth

```yaml
plan_unit_id: OSI-129
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Start/end verification gaps are closed by a canonical validation table maintained with orchestrator code; every row preserves
  config field, GUI control or UI source, backend consumer, applicable tier set, execution impact, and default or fallback
  behavior, and validate_config_wiring_for_tier uses that table as the source of truth.
gui_related: true
gui_classification_reason: >-
  This unit includes GUI control or UI source mappings and backend consumer wiring for execution-affecting settings.
split_recommended: true
depends_on:
- OSI-102
- OSI-104
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: canonical_validation_table_source_of_truth
node_compile_hint:
  mode: canonical_validation_table_source_of_truth
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0099
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0100
preserved_exact_tokens:
- Gaps and potential issues in start/end verification
- Canonical validation-table source of truth
- config field
- GUI control or UI source
- backend consumer
- phase
- task
- subtask
- iteration
- interview_phase
- validate_config_wiring_for_tier(...)
negative_constraints:
- Readiness MUST NOT be heuristic prose.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  Self PolicyRule anchor #config-wiring-verification is preserved as ContractRef text from source; no governance anchor generation
  occurs in this batch.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- >-
  ContractRef: ContractName:Plans/Contracts_V0.md, PolicyRule:Plans/orchestrator-subagent-integration.md#config-wiring-verification
```

### OSI-130 - Tier Start Verification Preconditions

```yaml
plan_unit_id: OSI-130
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Start-of-phase, start-of-task, and start-of-subtask verification run config-wiring validation, readiness validation, operation-sequence
  validation, and known-gap detection before tier execution may start.
gui_related: false
gui_classification_reason: This unit defines backend verification preconditions rather than GUI behavior.
split_recommended: false
depends_on:
- OSI-108
- OSI-112
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_start_verification_preconditions
node_compile_hint:
  mode: tier_start_verification_preconditions
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0101
preserved_exact_tokens:
- Start-of-tier verification
- config-wiring validation against the canonical table
- readiness validation for required upstream artifacts and dependencies
- operation-sequence validation
- known-gap detection for execution-affecting unresolved prerequisites
negative_constraints:
- A tier MUST NOT start when a required execution-affecting field is unwired, unavailable, or inconsistent.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  Self PolicyRule anchor #tier-start-preconditions is preserved as ContractRef text from source; no governance anchor generation
  occurs in this batch.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- >-
  ContractRef: ContractName:Plans/Executor_Protocol.md, PolicyRule:Plans/orchestrator-subagent-integration.md#tier-start-preconditions
```

### OSI-131 - Tier End Verification Sequence

```yaml
plan_unit_id: OSI-131
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  End-of-phase, end-of-task, and end-of-subtask verification run config-wiring re-checks, acceptance checks, quality review,
  and feedback emission for failed requirements, quality findings, or retry/remediation triggers.
gui_related: false
gui_classification_reason: This unit defines backend tier-end verification sequence rather than GUI behavior.
split_recommended: false
depends_on:
- OSI-115
- OSI-120
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_end_verification_sequence
node_compile_hint:
  mode: tier_end_verification_sequence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0102
preserved_exact_tokens:
- End-of-tier verification
- config-wiring re-check
- acceptance check
- quality review
- feedback emission
- retry/remediation trigger
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-132 - Canonical Tier Quality Matrix

```yaml
plan_unit_id: OSI-132
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The canonical quality matrix maps tier types to required reviews for Phase, Task, Subtask, Iteration, and Interview phase,
  preserving artifact completeness, design correctness, code review, tests, lint/format, local retry acceptance, and downstream
  plan generation readiness criteria.
gui_related: false
gui_classification_reason: This unit defines tier quality criteria, not GUI presentation.
split_recommended: false
depends_on:
- OSI-126
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: canonical_tier_quality_matrix
node_compile_hint:
  mode: canonical_tier_quality_matrix
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0103
preserved_exact_tokens:
- Canonical quality matrix
- Phase
- artifact completeness, acceptance coverage, cross-doc integrity, terminology alignment
- Task
- design/contract correctness, dependency consistency, fit with parent phase intent
- Subtask
- code review, tests for touched scope, lint/format for touched scope, implementation acceptance
- Iteration
- local acceptance of the concrete retry/fix objective when iteration-level execution is used
- Interview phase
- >-
  document completeness, decision clarity, unresolved-clarification handling, output readiness for downstream plan generation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-133 - Reviewer Participation Required

```yaml
plan_unit_id: OSI-133
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The reviewer/quality path is mandatory at the end of every tier completion path, on retry paths after a failed tier is re-attempted,
  and when a quality gate failure feeds remediation back into the same tier.
gui_related: false
gui_classification_reason: This unit covers required verification participation rather than GUI behavior.
split_recommended: false
depends_on:
- OSI-116
- OSI-124
- OSI-125
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: reviewer_participation_required
node_compile_hint:
  mode: reviewer_participation_required
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0104
preserved_exact_tokens:
- Reviewer participation
- reviewer/quality path is not optional
- end of every tier completion path
- retry paths
- quality gate fails
- remediation loop feeds back into the same tier
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-134 - Failure Warning Category Invariant

```yaml
plan_unit_id: OSI-134
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Verification failure policy requires execution-affecting mismatches and missing required upstream dependencies to fail,
  permits only non-execution-affecting display/observability/deferred mismatches to warn, and forbids performance concerns
  from weakening verification categories.
gui_related: false
gui_classification_reason: This unit defines backend verification outcome policy rather than GUI behavior.
split_recommended: false
depends_on:
- OSI-130
- OSI-131
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: failure_warning_category_invariant
node_compile_hint:
  mode: failure_warning_category_invariant
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0105
preserved_exact_tokens:
- Failure vs warning policy
- required execution-affecting mismatches fail verification
- missing or inconsistent upstream dependencies required for the declared tier objective fail verification
- display-only, observability-only, or deferred non-execution-affecting mismatches may warn
- performance concerns MUST NOT weaken the verification categories
- may not silently skip categories
negative_constraints:
- >-
  Performance concerns MUST NOT weaken the verification categories; implementation may scope work to changed artifacts, but
  may not silently skip categories.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  Self PolicyRule anchor #verification-category-invariant is preserved as ContractRef text from source; no governance anchor
  generation occurs in this batch.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Plans/orchestrator-subagent-integration.md#verification-category-invariant'
```

### OSI-135 - Interview Phase Lifecycle Mirror

```yaml
plan_unit_id: OSI-135
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Interview phases mirror the same lifecycle as other tiers: start uses wiring, readiness, and sequence checks; end uses wiring
  re-check, acceptance, and quality checks; interview-subagent-integration.md owns phase-specific quality criteria and UI/runtime
  consequences without inventing an alternate lifecycle.
gui_related: true
gui_classification_reason: The unit preserves interview UI/runtime consequences and cross-doc lifecycle behavior.
split_recommended: true
depends_on:
- OSI-099
- OSI-130
- OSI-131
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_phase_lifecycle_mirror
node_compile_hint:
  mode: interview_phase_lifecycle_mirror
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0106
preserved_exact_tokens:
- Interview-phase mirror
- start = wiring + readiness + sequence
- end = wiring re-check + acceptance + quality
- interview-subagent-integration.md
- UI/runtime consequences
- MUST mirror this contract
- invent an alternate lifecycle
negative_constraints:
- Interview phases MUST mirror this contract rather than invent an alternate lifecycle.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md'
```

### OSI-136 - Unrelated Failure Escalation Policy

```yaml
plan_unit_id: OSI-136
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  When a tier fails because of issues outside its intended scope, the orchestrator retries once with the same config, then
  raises an Assistant chat CTA with review, skip, retry, and abort options; modal escalation is reserved for P0 risk such
  as possible data loss or workspace corruption, and unrelated failures must not be silently bypassed.
gui_related: true
gui_classification_reason: This unit defines user-visible Assistant chat CTA and modal escalation behavior.
split_recommended: false
depends_on:
- OSI-098
- OSI-121
- OSI-127
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: unrelated_failure_escalation_policy
node_compile_hint:
  mode: unrelated_failure_escalation_policy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0107
preserved_exact_tokens:
- Unrelated-failure escalation
- retry once automatically using the same config
- Assistant chat CTA
- review, skip, retry, and abort options
- modal
- P0 risk
- possible data loss
- workspace corruption
- do not silently bypass unrelated failures
negative_constraints:
- Do not silently bypass unrelated failures.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-137 - Structured Verification Feedback Loop

```yaml
plan_unit_id: OSI-137
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Verification failures produce structured feedback identifying the failing criterion, affected artifact or file when known,
  and expected next action, while rework loops reuse the existing incomplete-task/remediation flow rather than a separate
  ad hoc channel.
gui_related: true
gui_classification_reason: Structured feedback and remediation loops are user/operator-visible workflow behavior.
split_recommended: true
depends_on:
- OSI-121
- OSI-136
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: structured_verification_feedback_loop
node_compile_hint:
  mode: structured_verification_feedback_loop
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0108
preserved_exact_tokens:
- Feedback loop
- failing criterion
- affected artifact or file
- expected next action
- incomplete-task / remediation flow
- separate ad hoc channel
negative_constraints:
- >-
  Rework loops reuse the existing incomplete-task / remediation flow rather than inventing a separate ad hoc channel.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- >-
  ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md,
  ContractName:Plans/FinalGUISpec.md
```

### OSI-138 - BeforeUnit/AfterUnit Middleware Boundary

```yaml
plan_unit_id: OSI-138
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Puppet Master supports BeforeUnit and AfterUnit hooks that run automatically at Phase, Task, Subtask, and Iteration execution
  unit boundaries, separating lifecycle concerns such as tracking, state management, and validation from execution logic.
gui_related: false
gui_classification_reason: This unit defines backend lifecycle middleware boundaries rather than GUI behavior.
split_recommended: false
depends_on:
- OSI-107
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: beforeunit_afterunit_middleware_boundary
node_compile_hint:
  mode: beforeunit_afterunit_middleware_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- Hook-Based Lifecycle Middleware
- BeforeUnit
- AfterUnit
- execution unit boundaries
- Phase
- Task
- Subtask
- Iteration
- tracking
- state management
- validation
- separately from execution logic
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-139 - Platform Hook Registration Policy

```yaml
plan_unit_id: OSI-139
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform hook registration uses orchestrator-level hooks as primary middleware while optionally integrating native platform
  hooks: Cursor hook files and events, Codex and Copilot CLI lifecycle outputs, Claude settings hooks with blocking/context
  behavior, and Gemini orchestrator-level Direct API hooks without native config files.
gui_related: false
gui_classification_reason: This unit covers provider/runtime hook registration policy, not GUI presentation.
split_recommended: false
depends_on:
- OSI-138
- OSI-047
- OSI-093
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_hook_registration_policy
node_compile_hint:
  mode: platform_hook_registration_policy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- Cursor
- .cursor/hooks.json
- ~/.cursor/hooks.json
- SubagentStart
- SubagentStop
- beforeSubmitPrompt
- afterAgentResponse
- CLI subagents have reported issues (Feb 2026)
- orchestrator-level hooks as primary
- Codex
- CLI lifecycle outputs
- Claude Code
- .claude/settings.json
- PreToolUse
- PostToolUse
- SessionStart
- SessionEnd
- exit code 2
- Gemini
- Direct API provider
- No platform-native hook config file
- Copilot
negative_constraints: []
compatibility_only_notes:
- >-
  CLI subagents have reported issues (Feb 2026); orchestrator-level hooks remain primary and native hooks are enhancement
  when fixed.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-140 - BeforeUnit Context Schema

```yaml
plan_unit_id: OSI-140
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeUnitContext carries execution identity, lane/worktree, role/account policy, tool use, tier type, platform/model, selected
  subagents, config snapshot, and known gaps into BeforeUnit hooks.
gui_related: false
gui_classification_reason: This unit defines backend hook context schema rather than GUI behavior.
split_recommended: false
depends_on:
- OSI-138
- OSI-050
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: beforeunit_context_schema
node_compile_hint:
  mode: beforeunit_context_schema
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- BeforeUnitContext
- run_id
- node_id
- attempt_id
- lane_id
- worktree_id
- execution_role
- requested_account_policy
- tool_use_id
- tier_type
- platform
- model
- selected_subagents
- config_snapshot
- known_gaps
negative_constraints: []
compatibility_only_notes:
- The Rust schema snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-141 - AfterUnit Context And Completion Status Schema

```yaml
plan_unit_id: OSI-141
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  AfterUnitContext carries execution identity, lane/worktree, role/account policy, tool use, tier type, platform, subagent
  output, completion status, and iteration count into AfterUnit hooks, with CompletionStatus variants for success, failure,
  and warning.
gui_related: false
gui_classification_reason: This unit defines backend hook context and completion-status schema.
split_recommended: false
depends_on:
- OSI-138
- OSI-123
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: afterunit_context_completion_status_schema
node_compile_hint:
  mode: afterunit_context_completion_status_schema
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- AfterUnitContext
- run_id
- node_id
- attempt_id
- lane_id
- worktree_id
- execution_role
- requested_account_policy
- tool_use_id
- tier_type
- platform
- subagent_output
- completion_status
- iteration_count
- CompletionStatus
- Success
- Failure(String)
- Warning(String)
negative_constraints: []
compatibility_only_notes:
- The Rust schema snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-142 - Hook Trait Interfaces

```yaml
plan_unit_id: OSI-142
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeUnitHook and AfterUnitHook traits are Send + Sync interfaces that execute against their respective context and expose
  a hook name.
gui_related: false
gui_classification_reason: This unit defines backend trait interfaces.
split_recommended: false
depends_on:
- OSI-140
- OSI-141
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_trait_interfaces
node_compile_hint:
  mode: hook_trait_interfaces
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- BeforeUnitHook
- AfterUnitHook
- Send + Sync
- execute
- name
negative_constraints: []
compatibility_only_notes:
- The Rust trait snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-143 - Hook Result Contracts

```yaml
plan_unit_id: OSI-143
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeUnitResult communicates active subagent selection, injected context, and block decisions, while AfterUnitResult communicates
  validation status, validation error, retry request, and retry reason.
gui_related: false
gui_classification_reason: This unit defines backend hook result contracts.
split_recommended: false
depends_on:
- OSI-142
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_result_contracts
node_compile_hint:
  mode: hook_result_contracts
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- BeforeUnitResult
- active_subagent
- injected_context
- block
- block_reason
- AfterUnitResult
- validation_passed
- validation_error
- request_retry
- retry_reason
negative_constraints: []
compatibility_only_notes:
- The Rust result snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-144 - Hook Registry Registration Model

```yaml
plan_unit_id: OSI-144
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  HookRegistry stores before_unit_hooks and after_unit_hooks and exposes register_before_unit and register_after_unit registration
  methods.
gui_related: false
gui_classification_reason: This unit defines backend hook registry storage and registration.
split_recommended: false
depends_on:
- OSI-142
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_registry_registration_model
node_compile_hint:
  mode: hook_registry_registration_model
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- HookRegistry
- before_unit_hooks
- after_unit_hooks
- register_before_unit
- register_after_unit
negative_constraints: []
compatibility_only_notes:
- The Rust registry snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-145 - BeforeUnit Hook Execution Semantics

```yaml
plan_unit_id: OSI-145
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeUnit hook execution runs each hook through safe_hook_main, short-circuits on block, preserves hook-provided active_subagent,
  accumulates injected contexts joined by blank lines, logs hook failures as warnings, and returns the combined BeforeUnitResult.
gui_related: false
gui_classification_reason: This unit defines backend BeforeUnit execution semantics.
split_recommended: false
depends_on:
- OSI-143
- OSI-144
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: beforeunit_hook_execution_semantics
node_compile_hint:
  mode: beforeunit_hook_execution_semantics
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- execute_before_unit
- safe_hook_main
- block
- block_reason
- active_subagent
- injected_contexts
- join("\n\n")
- log::warn!
- BeforeUnitResult
negative_constraints: []
compatibility_only_notes:
- The Rust execution snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-146 - AfterUnit Hook Execution Semantics

```yaml
plan_unit_id: OSI-146
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  AfterUnit hook execution runs each hook through safe_hook_main, short-circuits on validation failure, carries validation_error,
  request_retry, and retry_reason, logs hook failures as warnings, and returns the combined AfterUnitResult.
gui_related: false
gui_classification_reason: This unit defines backend AfterUnit execution semantics.
split_recommended: false
depends_on:
- OSI-143
- OSI-144
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: afterunit_hook_execution_semantics
node_compile_hint:
  mode: afterunit_hook_execution_semantics
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- execute_after_unit
- safe_hook_main
- validation_passed
- validation_error
- request_retry
- retry_reason
- log::warn!
- AfterUnitResult
negative_constraints: []
compatibility_only_notes:
- The Rust execution snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-147 - Safe Hook Wrapper And Built-In Integration

```yaml
plan_unit_id: OSI-147
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  safe_hook_main wraps hook execution, and built-in hooks ActiveSubagentTrackerHook, TierContextInjectorHook, StaleStatePrunerHook,
  and HandoffValidatorHook are always registered and integrated before and after subagent execution, updating ExecutionUnitContext.active_subagent
  even when platform-native hooks are also registered.
gui_related: false
gui_classification_reason: This unit defines backend hook integration behavior.
split_recommended: false
depends_on:
- OSI-145
- OSI-146
- OSI-050
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: safe_hook_wrapper_builtin_integration
node_compile_hint:
  mode: safe_hook_wrapper_builtin_integration
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0109
preserved_exact_tokens:
- safe_hook_main
- ActiveSubagentTrackerHook
- TierContextInjectorHook
- StaleStatePrunerHook
- HandoffValidatorHook
- src/core/orchestrator.rs
- hook_registry.execute_before_unit
- hook_registry.execute_after_unit
- ExecutionUnitContext.active_subagent
- Always register built-in hooks even when platform-native hooks are also registered
negative_constraints:
- Always register built-in hooks even when platform-native hooks are also registered.
compatibility_only_notes:
- The Rust integration snippet is plan evidence only, not an executable node output.
stale_retired_dispositions:
- >-
  Built-in hook names are preserved source tokens and remain canonical integration requirements unless later owner docs retire
  them explicitly.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-148 - Structured Handoff Report Required Output Gate

```yaml
plan_unit_id: OSI-148
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Every subagent invocation must produce a structured handoff report with required fields; malformed output blocks completion
  and requests one retry, with a fail-safe path after retry.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-093
- OSI-147
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: structured_handoff_report_required_output_gate
node_compile_hint:
  mode: structured_handoff_report_required_output_gate
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- Structured Handoff Report Validation
- structured handoff report
- required fields
- block and request one retry
- fail-safe after retry
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-149 - Handoff Validation Phase Responsibilities

```yaml
plan_unit_id: OSI-149
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeHandoffValidation detects output format, loads the SubagentOutput schema, and prepares validation context; DuringHandoffValidation
  parses, validates required fields, types, and findings, extracts from text fallback, and requests one malformed-output retry;
  AfterHandoffValidation persists validation results, updates tier context, and handles post-retry failure as partial output
  with complete-with-warnings source disposition.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-148
- OSI-093
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: handoff_validation_phase_responsibilities
node_compile_hint:
  mode: handoff_validation_phase_responsibilities
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- BeforeHandoffValidation
- DuringHandoffValidation
- AfterHandoffValidation
- SubagentOutput
- task_report
- downstream_context
- findings
- .puppet-master/state/handoff-validation-{node_id}.json
- complete with warnings
negative_constraints: []
compatibility_only_notes:
- >-
  The .puppet-master/state/handoff-validation-{node_id}.json path is preserved from source and requires storage-owner alignment
  when implemented.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-150 - SubagentOutput Finding And ValidationError Schema

```yaml
plan_unit_id: OSI-150
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The SubagentOutput schema preserves task_report, optional downstream_context, findings, Finding fields, Severity values,
  and ValidationError variants for structured subagent handoff validation.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-148
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagentoutput_finding_validationerror_schema
node_compile_hint:
  mode: subagentoutput_finding_validationerror_schema
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- DRY:DATA:SubagentOutput
- SubagentOutput
- Finding
- Severity
- Critical
- Major
- Minor
- Info
- ValidationError
- JsonParse
- MissingField
- InvalidSeverity
- TextExtraction
- ValidationFailedAfterRetry
negative_constraints: []
compatibility_only_notes:
- The Rust schema snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-151 - OutputParser Structured Handoff Extension

```yaml
plan_unit_id: OSI-151
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  src/platforms/output_parser.rs extends ParsedOutput with subagent_output and extends OutputParser with parse_subagent_output
  plus extract_subagent_output_from_text for platform-specific structured handoff parsing.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-150
- OSI-093
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: outputparser_structured_handoff_extension
node_compile_hint:
  mode: outputparser_structured_handoff_extension
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- src/platforms/output_parser.rs
- ParsedOutput
- 'subagent_output: Option<SubagentOutput>'
- OutputParser
- parse_subagent_output
- extract_subagent_output_from_text
negative_constraints: []
compatibility_only_notes:
- The Rust parser extension snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-152 - Cursor Structured Output Parser Example

```yaml
plan_unit_id: OSI-152
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  CursorOutputParser structured handoff parsing reads JSON output according to platform_specs, extracts task_report, downstream_context,
  and findings, and must not hardcode the output-format behavior.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-091
- OSI-093
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cursor_structured_output_parser_example
node_compile_hint:
  mode: cursor_structured_output_parser_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- CursorOutputParser
- DRY:FN:parse_subagent_output_cursor
- platform_specs
- --output-format json
- do not hardcode "--output-format json"
- serde_json::Value
- task_report
- downstream_context
- findings
negative_constraints:
- Output format detection must use platform_specs; do not hardcode "--output-format json".
compatibility_only_notes:
- The Rust Cursor parser snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-153 - Cursor Text Extraction Fallback Example

```yaml
plan_unit_id: OSI-153
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Cursor text fallback extraction looks for Task Report and Findings markers, may use LLM extraction later, falls back to
  stdout as task_report, and records that findings cannot be reliably extracted from plain text.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-152
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cursor_text_extraction_fallback_example
node_compile_hint:
  mode: cursor_text_extraction_fallback_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- 'Task Report:'
- 'Findings:'
- LLM
- stdout.to_string()
- 'downstream_context: None'
- 'findings: Vec::new()'
- Cannot extract findings from text reliably
negative_constraints: []
compatibility_only_notes:
- The Rust fallback snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-154 - HandoffValidator Parser Selection And Retry Workflow

```yaml
plan_unit_id: OSI-154
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  HandoffValidator validates subagent output by using platform_specs-driven parser selection, trying structured parsing first,
  requesting retry for malformed output before max retries, and falling back to text extraction after retry exhaustion.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-150
- OSI-093
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: handoffvalidator_parser_selection_retry_workflow
node_compile_hint:
  mode: handoffvalidator_parser_selection_retry_workflow
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- HandoffValidator
- max_retries
- validate_subagent_output
- ValidationFailedAfterRetry
- TextExtraction
- platform_specs
- never hardcode parser selection by platform
- do not use match platform statements
negative_constraints:
- Must use platform_specs to determine parser type.
- Never hardcode parser selection by platform.
- Do not use match platform statements.
compatibility_only_notes:
- The Rust validator snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-155 - Required Field And Finding Severity Validation

```yaml
plan_unit_id: OSI-155
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Required-field validation rejects empty task_report and empty finding.description, and constrains finding severity to Critical,
  Major, Minor, or Info.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-150
- OSI-154
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: required_field_finding_severity_validation
node_compile_hint:
  mode: required_field_finding_severity_validation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- validate_required_fields
- task_report.trim().is_empty()
- finding.description
- Severity::Critical
- Severity::Major
- Severity::Minor
- Severity::Info
- MissingField
negative_constraints: []
compatibility_only_notes:
- The Rust required-field validation snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-156 - Orchestrator Handoff Validation Retry Loop

```yaml
plan_unit_id: OSI-156
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The orchestrator subagent execution loop obtains the platform runner, executes the subagent, validates stdout/stderr through
  HandoffValidator, returns validated SubagentOutput on success, requests retry with SubagentOutput::example format instructions
  on malformed output, and after max retries warns and returns extracted partial output.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-045
- OSI-046
- OSI-147
- OSI-154
- OSI-155
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_handoff_validation_retry_loop
node_compile_hint:
  mode: orchestrator_handoff_validation_retry_loop
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- src/core/orchestrator.rs
- execute_with_subagent
- get_platform_runner
- runner.execute_with_subagent
- HandoffValidator::new(platform)
- retry_count
- validator.max_retries()
- extract_partial_output
- SubagentOutput::example()
- tracing::warn!
negative_constraints: []
compatibility_only_notes:
- The Rust orchestrator integration snippet is plan evidence only, not an executable node output.
- >-
  Adjacent orphaned parser-tail lines 2573-2585 are preserved as non-standalone example coverage and not as a separate product
  requirement.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-157 - Handoff Validation Failure Outcome Policy

```yaml
plan_unit_id: OSI-157
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Handoff validation failure handling requests retry for JSON parse, missing field, and invalid severity failures, and after
  max retries proceeds with partial output while preserving complete-with-warnings source wording as a compatibility disposition.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-093
- OSI-094
- OSI-154
- OSI-156
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: handoff_validation_failure_outcome_policy
node_compile_hint:
  mode: handoff_validation_failure_outcome_policy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- JSON parse failure
- Missing field failure
- Invalid severity failure
- Max retries reached
- partial output
- complete with warnings
negative_constraints: []
compatibility_only_notes:
- >-
  The complete with warnings wording is preserved as source text and does not override OSI-093 retry/surface-error stale disposition.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-158 - Codex JSONL Subagent Output Parser Example

```yaml
plan_unit_id: OSI-158
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  CodexOutputParser parses JSONL according to platform_specs, detects Turn/turn events and structured content, aggregates
  findings, and reports TextExtraction when no structured output is found.
gui_related: false
gui_classification_reason: This unit covers backend handoff validation, parser, and orchestration behavior rather than GUI
  presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-154
- OSI-093
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: codex_jsonl_subagent_output_parser_example
node_compile_hint:
  mode: codex_jsonl_subagent_output_parser_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- CodexOutputParser
- DRY:FN:parse_subagent_output_codex
- DO NOT hardcode "JSONL"
- platform_specs
- Turn
- turn
- content
- serde_json::from_value::<SubagentOutput>
- findings
- No structured output found in JSONL
negative_constraints:
- Output format detection MUST use platform_specs; DO NOT hardcode "JSONL" or output format.
compatibility_only_notes:
- The Rust Codex parser snippet is plan evidence only, not an executable node output.
- Line 2639 is a separator-only code boundary and has no standalone product semantics.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md'
```

### OSI-159 - Claude Structured Output Parser Example

```yaml
plan_unit_id: OSI-159
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  ClaudeOutputParser parses Claude structured output according to platform_specs, reads result.content or direct fields, attempts
  direct SubagentOutput parsing, and manually extracts task_report, downstream_context, and findings when needed.
gui_related: false
gui_classification_reason: This unit covers backend parser, hook, or runtime-validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-154
- OSI-150
- OSI-093
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: claude_structured_output_parser_example
node_compile_hint:
  mode: claude_structured_output_parser_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- ClaudeOutputParser
- DRY:FN:parse_subagent_output_claude
- platform_specs
- --output-format json
- result.content
- serde_json::from_value::<SubagentOutput>
- task_report
- downstream_context
- findings
negative_constraints:
- >-
  Output format detection MUST use platform_specs; do not hardcode Claude output format or "--output-format json".
compatibility_only_notes:
- The Rust Claude parser snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md'
```

### OSI-160 - Gemini Text-Wrapped JSON Parser Example

```yaml
plan_unit_id: OSI-160
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  GeminiOutputParser parses Gemini Direct API output according to platform_specs, extracts candidates[0].content.parts[0].text,
  tries to parse that text as SubagentOutput JSON, and reports TextExtraction when pattern extraction is required.
gui_related: false
gui_classification_reason: This unit covers backend parser, hook, or runtime-validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-154
- OSI-150
- OSI-093
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gemini_text_wrapped_json_parser_example
node_compile_hint:
  mode: gemini_text_wrapped_json_parser_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- GeminiOutputParser
- DRY:FN:parse_subagent_output_gemini
- candidates[0].content.parts[0].text
- serde_json::from_str::<SubagentOutput>(text)
- ValidationError::TextExtraction
- Gemini text output requires pattern extraction
- platform_specs
negative_constraints:
- >-
  Output format detection MUST use platform_specs; do not hardcode Gemini JSON behavior or "--output-format json".
compatibility_only_notes:
- The Rust Gemini parser snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md'
```

### OSI-161 - Copilot Task And Downstream Text Section Parser

```yaml
plan_unit_id: OSI-161
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  CopilotOutputParser parses text according to platform_specs by combining stdout and stderr, extracting the Task Report section
  as required and Downstream Context as optional through regex section extraction.
gui_related: false
gui_classification_reason: This unit covers backend parser, hook, or runtime-validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-154
- OSI-093
- OSI-091
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: copilot_task_downstream_text_section_parser
node_compile_hint:
  mode: copilot_task_downstream_text_section_parser
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- CopilotOutputParser
- DRY:FN:parse_subagent_output_copilot
- combined = format!("{stdout}\n{stderr}")
- '## Task Report'
- Task Report section
- '## Downstream Context'
- regex section extraction
- platform_specs
negative_constraints:
- Output format detection MUST use platform_specs; do not hardcode Copilot text behavior.
compatibility_only_notes:
- The Rust Copilot task/downstream parser snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md'
```

### OSI-162 - Copilot Findings Regex Parser Example

```yaml
plan_unit_id: OSI-162
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Copilot findings parsing extracts Findings sections with severity, category, description, file, line, and suggestion fields,
  mapping Critical, Major, Minor, and Info strings to Severity values before returning SubagentOutput.
gui_related: false
gui_classification_reason: This unit covers backend parser, hook, or runtime-validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-161
- OSI-155
- OSI-150
- OSI-093
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: copilot_findings_regex_parser_example
node_compile_hint:
  mode: copilot_findings_regex_parser_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- '## Findings'
- findings_re
- Critical
- Major
- Minor
- Info
- Severity::*
- category
- description
- file
- line
- suggestion
- PathBuf
negative_constraints: []
compatibility_only_notes:
- The Rust Copilot findings parser snippet is plan evidence only, not an executable node output.
- Lines 2775-2778 are boundary/ContractRef coverage attached to the parser-example group.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-163 - Hook-Level Handoff Validation Function

```yaml
plan_unit_id: OSI-163
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The hook-level validate_subagent_output function creates an output parser and delegates parse_subagent_output for output,
  stderr, and platform, while create_parser(platform) remains aligned with platform_specs-driven selection.
gui_related: false
gui_classification_reason: This unit covers backend parser, hook, or runtime-validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-154
- OSI-150
- OSI-147
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_level_handoff_validation_function
node_compile_hint:
  mode: hook_level_handoff_validation_function
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- src/core/hooks/handoff_validator.rs
- validate_subagent_output
- OutputParser
- create_parser
- SubagentOutput
- ValidationError
- parser.parse_subagent_output(output, stderr)
negative_constraints:
- >-
  create_parser(platform) must remain aligned to OSI-154 platform_specs-driven selection and must not become hardcoded parser
  selection.
compatibility_only_notes:
- The Rust hook validation snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-164 - AfterTier Handoff Validation Retry Policy

```yaml
plan_unit_id: OSI-164
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  AfterTier handoff validation logs platform, error type, and partial output snippet details, requests one retry with structured
  JSON output instruction, and after retry failure proceeds with partial output fail-safe while preserving complete-with-warnings
  source wording.
gui_related: false
gui_classification_reason: This unit covers backend parser, hook, or runtime-validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-147
- OSI-154
- OSI-157
- OSI-093
- OSI-094
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: aftertier_handoff_validation_retry_policy
node_compile_hint:
  mode: aftertier_handoff_validation_retry_policy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- AfterTier hook
- Log error with details
- platform
- error type
- partial output snippet
- one retry
- format your output as structured JSON
- partial output (fail-safe)
- complete with warnings
- ExecutionUnitContext
negative_constraints: []
compatibility_only_notes:
- >-
  The complete with warnings wording is preserved as source text and does not override OSI-093/OSI-157 resolved parser failure
  behavior.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-165 - ParsedOutput SubagentOutput Population Example

```yaml
plan_unit_id: OSI-165
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Existing ParsedOutput integration populates output.subagent_output by attempting parse_subagent_output during platform output
  parsing, but the .ok() example must not silently drop parser failures contrary to structured handoff failure policy.
gui_related: false
gui_classification_reason: This unit covers backend parser, hook, or runtime-validation behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-152
- OSI-093
- OSI-094
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds, executable queues,
  final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parsedoutput_subagentoutput_population_example
node_compile_hint:
  mode: parsedoutput_subagentoutput_population_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0110
preserved_exact_tokens:
- Integration with existing ParsedOutput
- src/platforms/output_parser.rs
- CursorOutputParser
- ParsedOutput::new
- output.subagent_output = self.parse_subagent_output(stdout, stderr).ok();
negative_constraints:
- >-
  The .ok() example is source evidence only and must not silently drop output contrary to OSI-093/OSI-094 structured parser
  failure handling.
compatibility_only_notes:
- The Rust ParsedOutput integration snippet is plan evidence only, not an executable node output.
- >-
  Line 2821 benefits text is coverage-only summary attached to OSI-148, OSI-149, OSI-164, OSI-165, and the next remediation-loop
  section.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-166 - Remediation Severity Completion Gate

```yaml
plan_unit_id: OSI-166
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Quality verification findings gate tier completion by severity: Critical and Major findings block completion and enter remediation,
  while Minor and Info findings are logged and proceed.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-150
- OSI-155
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_severity_completion_gate
node_compile_hint:
  mode: remediation_severity_completion_gate
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0111
preserved_exact_tokens:
- Critical
- Major
- Minor
- Info
- block completion
- log and proceed
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-167 - Reviewer Findings Filter And Nonblocking Exit

```yaml
plan_unit_id: OSI-167
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The remediation loop filters reviewer findings for Critical or Major severity and exits complete when only Minor or Info
  findings remain, logging nonblocking findings.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-150
- OSI-155
- OSI-164
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: reviewer_findings_filter_nonblocking_exit
node_compile_hint:
  mode: reviewer_findings_filter_nonblocking_exit
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0111
preserved_exact_tokens:
- DRY:DATA:RemediationLoop
- DRY:FN:run
- Severity::Critical | Severity::Major
- RemediationResult::Complete
- log_findings
negative_constraints: []
compatibility_only_notes:
- The Rust remediation-loop snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md'
```

### OSI-168 - Registry-Backed Overseer And Reviewer Reruns

```yaml
plan_unit_id: OSI-168
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Critical or Major remediation marks the tier incomplete, builds a remediation prompt, reruns the overseer and reviewer through
  registry-backed subagent lookup, and never hardcodes overseer, reviewer, or code-reviewer names.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-167
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: registry_backed_overseer_reviewer_reruns
node_compile_hint:
  mode: registry_backed_overseer_reviewer_reruns
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0111
preserved_exact_tokens:
- mark_tier_incomplete
- build_remediation_prompt
- re_run_overseer_with_prompt
- re_run_reviewer
- get_reviewer_subagent_for_tier()
- subagent_registry
- code-reviewer
negative_constraints:
- >-
  Reviewer and overseer subagent names MUST come from subagent_registry; never hardcode names or "code-reviewer".
compatibility_only_notes:
- The Rust rerun snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md'
```

### OSI-169 - Remediation Progress Detection And Escalation Loop

```yaml
plan_unit_id: OSI-169
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The remediation loop parses new Critical/Major findings, returns Resolved when none remain, increments retry count when
  findings are unchanged, resets retry count on progress, and escalates unresolved findings after retry exhaustion.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-168
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_progress_detection_escalation_loop
node_compile_hint:
  mode: remediation_progress_detection_escalation_loop
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0111
preserved_exact_tokens:
- new_critical_major
- findings_unchanged
- retry_count
- RemediationResult::Resolved
- RemediationResult::Escalate
- Progress made, reset retry count
negative_constraints: []
compatibility_only_notes:
- The Rust progress/escalation snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-170 - Remediation Prompt Finding Detail Format

```yaml
plan_unit_id: OSI-170
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Remediation prompts enumerate Critical/Major findings before tier completion and include severity, category, description,
  optional File, optional Line, optional Suggestion, and an instruction to fix issues and rerun verification.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-169
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_prompt_finding_detail_format
node_compile_hint:
  mode: remediation_prompt_finding_detail_format
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0111
preserved_exact_tokens:
- CRITICAL/Major findings must be fixed before tier completion
- File
- Line
- Suggestion
- Please fix these issues and re-run verification
negative_constraints: []
compatibility_only_notes:
- The Rust prompt-format snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-171 - Finding Comparison And Logging Example

```yaml
plan_unit_id: OSI-171
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Finding comparison detects unchanged findings by description, file, and line, while finding logging records severity, category,
  and description for nonblocking findings.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-169
- OSI-170
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: finding_comparison_logging_example
node_compile_hint:
  mode: finding_comparison_logging_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0111
preserved_exact_tokens:
- findings_unchanged
- description
- file
- line
- log::info!
- severity
- category
negative_constraints: []
compatibility_only_notes:
- The Rust comparison/logging snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-172 - Orchestrator Post-Gate Remediation Integration

```yaml
plan_unit_id: OSI-172
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  After gate passes and reviewer output is parsed, orchestrator remediation handles Complete, Resolved, and Escalate outcomes,
  reruns gate after resolution, escalates unresolved findings to parent orchestration, and runs after the gate but before
  tier completion.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-164
- OSI-165
- OSI-169
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_post_gate_remediation_integration
node_compile_hint:
  mode: orchestrator_post_gate_remediation_integration
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0111
preserved_exact_tokens:
- RemediationResult::Complete
- RemediationResult::Resolved
- RemediationResult::Escalate
- parse_reviewer_output
- after gate passes
- before tier completion
- re-run gate
- escalate_to_parent
- required reviewer subagent
negative_constraints: []
compatibility_only_notes:
- The Rust orchestrator integration snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-173 - Canonical Cross-Run Continuity Sources

```yaml
plan_unit_id: OSI-173
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Cross-run continuity persists architectural decisions, established patterns, tech choices, and lessons learned through canonical
  runtime storage, planning artifacts, handoff bundles, seglog/redb-backed runtime state, stored plan outputs, and normalized
  handoff bundles, not .puppet-master/memory side files.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- SP-001
- PP-001
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: canonical_cross_run_continuity_sources
node_compile_hint:
  mode: canonical_cross_run_continuity_sources
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0112
preserved_exact_tokens:
- canonical runtime storage
- planning artifacts
- handoff bundles
- seglog/redb-backed runtime state
- stored plan outputs
- normalized handoff bundles
- .puppet-master/memory/*
negative_constraints:
- .puppet-master/memory/* is not the canonical continuity source for orchestrator child runs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-174 - Continuity Persistence And Run-Start Loading Lifecycle

```yaml
plan_unit_id: OSI-174
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  At phase completion, durable decisions and patterns are extracted from canonical outputs and stored through the runtime/project
  persistence path; at run start before Phase 1, continuity context is assembled from persisted decisions, stored outputs,
  and handoff projections, may inform child selection, and does not create subagent-specific durable memory.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-173
- PP-001
- P-001
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: continuity_persistence_run_start_loading_lifecycle
node_compile_hint:
  mode: continuity_persistence_run_start_loading_lifecycle
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0112
preserved_exact_tokens:
- phase completion
- planning/architecture work
- runtime/project persistence path
- run start
- before Phase 1
- prior Rust decision
- Rust-focused child Persona
- do not create subagent-specific durable memory
negative_constraints:
- Continuity inputs may inform child selection but do not create subagent-specific durable memory.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-175 - Active Child Tracking Projection Source Of Truth

```yaml
plan_unit_id: OSI-175
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Active child tracking projects from canonical storage and events rather than mutable side files; child visibility, conflict
  prevention, status rollups, launch order, batch membership, subgroup membership, parent-child lineage, and stale entry resolution
  come from seglog/redb projections and canonical status/expiry logic.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- CV-001
- SP-001
- UF-001
- W-001
- PP-001
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: active_child_tracking_projection_source_truth
node_compile_hint:
  mode: active_child_tracking_projection_source_truth
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0113
preserved_exact_tokens:
- active-agents.json
- not canonical runtime truth
- seglog/redb projections
- launch order
- batch membership
- subgroup membership
- parent-child lineage
- canonical status and expiry logic
- side-file cleanup heuristics
negative_constraints:
- active-agents.json is not canonical runtime truth.
- Stale child entries are resolved through canonical status and expiry logic, not side-file cleanup heuristics.
compatibility_only_notes: []
stale_retired_dispositions:
- Side-file active-agent tracking is preserved only as a noncanonical source token.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- >-
  ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md
- >-
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md
```

### OSI-176 - Safe Hook Wrapper Structured-Output Envelope

```yaml
plan_unit_id: OSI-176
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  safe_hook_main wraps hook execution so hooks and verification functions produce structured ok/error JSON or Result-like
  output even when serialization or hook execution fails.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-154
- OSI-157
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: safe_hook_wrapper_structured_output_envelope
node_compile_hint:
  mode: safe_hook_wrapper_structured_output_envelope
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0114
preserved_exact_tokens:
- safe_hook_main
- status
- ok
- error
- HookOutput
- HookError
- unknown
- JSON or Result
negative_constraints: []
compatibility_only_notes:
- The Rust safe-hook wrapper snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-177 - Safe Handling Application Surfaces

```yaml
plan_unit_id: OSI-177
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeTier/AfterTier hooks, verification functions, and subagent output parsing must use safe handling so hooks never crash,
  verification returns structured errors, and parse failures produce partial SubagentOutput rather than crashing.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-176
- OSI-164
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: safe_handling_application_surfaces
node_compile_hint:
  mode: safe_handling_application_surfaces
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0114
preserved_exact_tokens:
- BeforeTier/AfterTier hooks
- Result<(), VerificationError>
- 'SubagentOutput { task_report: raw_output, downstream_context: None, findings: vec![] }'
- never crash
- platform-agnostic
negative_constraints:
- Hooks and verification functions must never crash the session.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-178 - Lazy Verification State Creation Compatibility Envelope

```yaml
plan_unit_id: OSI-178
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Verification state directories and files may be created lazily on first write, with no setup command, but .puppet-master
  verification paths, active-subagents.json, and handoff-reports.json are preserved as compatibility/source examples rather
  than canonical runtime truth.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-175
- SP-001
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: lazy_verification_state_creation_compatibility_envelope
node_compile_hint:
  mode: lazy_verification_state_creation_compatibility_envelope
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0115
preserved_exact_tokens:
- .puppet-master/verification/<session-id>/
- active-subagents.json
- handoff-reports.json
- No setup command
- created automatically
negative_constraints: []
compatibility_only_notes:
- >-
  Side-file paths are compatibility/source examples and must be reconciled with canonical storage projections before implementation.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-179 - Stale Verification-State Pruning Compatibility Envelope

```yaml
plan_unit_id: OSI-179
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Verification state pruning may be described as lazy stale cleanup after inactivity, but modification-time deletion and no-teardown
  heuristics must not override canonical status and expiry logic.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-175
- SP-001
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: stale_verification_state_pruning_compatibility_envelope
node_compile_hint:
  mode: stale_verification_state_pruning_compatibility_envelope
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0115
preserved_exact_tokens:
- Stale pruning
- 2 hours of inactivity
- modification time
- delete if older than threshold
- No teardown command
- platform-agnostic
negative_constraints:
- Modification-time deletion heuristics must not override canonical status and expiry logic.
compatibility_only_notes: []
stale_retired_dispositions:
- >-
  mtime/delete pruning is preserved as source-lineage compatibility material unless mapped to canonical expiry policy.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-180 - Runtime Handoff Contract Enforcement Retry Policy

```yaml
plan_unit_id: OSI-180
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Runtime handoff contract enforcement validates Task Report, Downstream Context, and Findings through AfterTier validation,
  blocks malformed responses, requests one retry with format instruction, and then proceeds with partial output complete-with-warnings
  source disposition if still malformed.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-148
- OSI-154
- OSI-164
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: runtime_handoff_contract_enforcement_retry_policy
node_compile_hint:
  mode: runtime_handoff_contract_enforcement_retry_policy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0116
preserved_exact_tokens:
- Task Report + Downstream Context + Findings
- AfterTier hook
- validate_subagent_output()
- Block response
- one retry
- complete with warnings
- AGENTS.md
- subagent prompt templates
negative_constraints: []
compatibility_only_notes:
- >-
  complete with warnings is preserved source wording and must remain aligned with OSI-093/OSI-157 parser failure policy.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-181 - Platform Validators And Provider Capability Guard

```yaml
plan_unit_id: OSI-181
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Runtime contract enforcement uses platform-specific parser validation across Cursor, Codex, Claude, Gemini, and Copilot
  while treating provider-doc schema findings as capability evidence rather than a bypass for local validation; provider-native
  schema enforcement is preferred where available, and weak or unsupported transports fall back to locally validated structured
  output or partial-output warnings.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-158
- OSI-159
- OSI-160
- OSI-161
- OSI-162
- OSI-163
- OSI-164
- OSI-165
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_validators_provider_capability_guard
node_compile_hint:
  mode: platform_validators_provider_capability_guard
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0116
preserved_exact_tokens:
- Cursor/Codex/Claude/Gemini
- Copilot
- JSON output
- JSONL
- text output
- provider-doc findings are capability evidence, not a blanket bypass
- Structured Outputs
- schema-bound structured output
- SDK schema helpers
- /transports
- downgrade behavior
- partial-output warnings
negative_constraints: []
compatibility_only_notes:
- >-
  Codex JSON wording is preserved as source shorthand only; Codex JSONL parser behavior remains represented by OSI-158 and
  the platform summary.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-182 - Platform Implementation Responsibility Matrix

```yaml
plan_unit_id: OSI-182
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The platform implementation matrix preserves which lifecycle and quality features are orchestrator-level and which require
  platform-specific parsers or validators across Cursor, Codex, Claude, Gemini, and Copilot.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-180
- OSI-181
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_implementation_responsibility_matrix
node_compile_hint:
  mode: platform_implementation_responsibility_matrix
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0117
preserved_exact_tokens:
- Platform-Specific Implementation Summary
- BeforeTier/AfterTier hooks
- Handoff validation
- Remediation loop
- Cross-session memory
- Active agent tracking
- Safe error handling
- Lazy lifecycle
- Contract enforcement
- Orchestrator
- Platform-specific parser
- Platform-specific validator
negative_constraints: []
compatibility_only_notes:
- The platform table is plan evidence and responsibility mapping, not an executable output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-183 - Orchestrator-Level Versus Parser-Specific Boundary

```yaml
plan_unit_id: OSI-183
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Most lifecycle features are orchestrator-level and platform-agnostic, while handoff validation and contract enforcement
  require parser-specific JSON, JSONL, or text handling; platform-native hooks may be used where available while orchestrator
  middleware remains the fallback for all platforms.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-182
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_level_versus_parser_specific_boundary
node_compile_hint:
  mode: orchestrator_level_versus_parser_specific_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0117
preserved_exact_tokens:
- Most features are orchestrator-level
- platform-agnostic
- JSON vs JSONL vs text
- platform-native hooks
- Cursor
- Claude
- Gemini
- orchestrator-level middleware
- all platforms
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-184 - Start/End Verification Lifecycle Ordering

```yaml
plan_unit_id: OSI-184
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Lifecycle and quality features complement start/end verification: BeforeTier runs before verify_tier_start, AfterTier runs
  after verify_tier_end, remediation extends the required reviewer subagent, cross-session continuity enhances Phase 1 context,
  and active tracking enhances logging/debugging.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-180
- OSI-172
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: start_end_verification_lifecycle_ordering
node_compile_hint:
  mode: start_end_verification_lifecycle_ordering
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0118
preserved_exact_tokens:
- BeforeTier hook
- verify_tier_start
- AfterTier hook
- verify_tier_end
- Remediation loop
- required reviewer subagent
- Cross-session memory
- Phase 1 context
- Active agent tracking
- logging and debugging
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-185 - Platform-Native Hook Discovery Config And Fallback

```yaml
plan_unit_id: OSI-185
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform-native hook discovery scans Cursor and Claude hook config files where available, models platform_hooks in PuppetMasterConfig,
  records Gemini as Direct API with orchestrator-level hooks only, and falls back to orchestrator-level hooks when native
  hooks fail or are unavailable.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-139
- OSI-183
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_native_hook_discovery_config_fallback
node_compile_hint:
  mode: platform_native_hook_discovery_config_fallback
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- 'Gap #14'
- Cursor .cursor/hooks.json
- Claude .claude/settings.json
- Gemini is a Direct API provider
- platform_hooks
- PuppetMasterConfig
- gemini
- 'enabled: false'
- fallback to orchestrator-level hooks
negative_constraints: []
compatibility_only_notes:
- The YAML platform_hooks snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-186 - Hook Execution Order Shared Context And Blocking Policy

```yaml
plan_unit_id: OSI-186
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Hook execution order runs built-in hooks, then platform-native hooks, then custom hooks; hooks remain independent and share
  data through BeforeUnitContext or AfterUnitContext, and the first blocking hook stops execution and logs the hook and reason.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-138
- OSI-143
- OSI-145
- OSI-146
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_execution_order_shared_context_blocking_policy
node_compile_hint:
  mode: hook_execution_order_shared_context_blocking_policy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- 'Gap #15'
- ActiveSubagentTrackerHook
- TierContextInjectorHook
- StaleStatePrunerHook
- platform-native hooks
- custom hooks
- BeforeUnitContext
- AfterUnitContext
- First hook that blocks stops execution
negative_constraints: []
compatibility_only_notes:
- Tier-era hook names are preserved source tokens and must not override current runtime-context ownership.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-187 - Structured-Output Parser Reliability Fallbacks And Versioning

```yaml
plan_unit_id: OSI-187
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Structured output parsing handles JSON, JSONL, and text variation through multi-pass parsing, best-effort partial output,
  parser edge-case tests, parser version tracking, and platform CLI version tracking.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-151
- OSI-152
- OSI-153
- OSI-158
- OSI-159
- OSI-160
- OSI-161
- OSI-162
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: structured_output_parser_reliability_fallbacks_versioning
node_compile_hint:
  mode: structured_output_parser_reliability_fallbacks_versioning
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- 'Gap #16'
- JSON vs JSONL vs text
- malformed JSON
- partial output
- streaming output
- Multi-pass parsing
- complete with warnings
- Parser testing
- Parser versioning
- platform CLI version
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-188 - Remediation Retry Ceiling Progress Detection Timeout Escalation

```yaml
plan_unit_id: OSI-188
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Remediation loop risk is bounded by max retries, progress detection, escalation after unchanged findings or retry exhaustion,
  parent-tier remediation decision options, and an overall timeout.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-169
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_retry_ceiling_progress_detection_timeout_escalation
node_compile_hint:
  mode: remediation_retry_ceiling_progress_detection_timeout_escalation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- 'Gap #17'
- Max retries
- 'default: 3'
- unchanged after 2 retries
- escalate
- skip, fix manually, or re-plan
- Timeout
- 30 minutes
negative_constraints: []
compatibility_only_notes:
- parent-tier wording is preserved as source text and should route through current remediation lineage.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-189 - Memory Persistence Conflict And Staleness Retired-Source Disposition

```yaml
plan_unit_id: OSI-189
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Memory-file persistence conflict and staleness heuristics are preserved as source-lineage tokens only unless remapped to
  canonical runtime storage retention, including timestamp, recency, conflict, pruning, persistence, size limit, rotation,
  and archive examples.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-173
- OSI-174
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: memory_persistence_conflict_staleness_retired_source_disposition
node_compile_hint:
  mode: memory_persistence_conflict_staleness_retired_source_disposition
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- 'Gap #18'
- timestamp
- last 30 days
- '"Rust + Actix" vs "Python + FastAPI"'
- 90 days
- persistent
- 10MB
- Rotate or archive
negative_constraints: []
compatibility_only_notes:
- Memory-file heuristics are source-lineage only unless remapped to canonical runtime storage retention.
stale_retired_dispositions:
- >-
  Memory files may become stale/conflicting/unbounded is retained as retired source framing, not promoted above canonical
  runtime storage.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-190 - Active-Subagent Tracking Accuracy Source-Of-Truth Partial

```yaml
plan_unit_id: OSI-190
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The first part of the active-subagent tracking accuracy gap records inaccurate tracking risk from mid-tier selection changes
  or platform-native overrides and requires ExecutionUnitContext.active_subagent to be set by BeforeUnit hook and updated
  by platform-native hooks.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, runtime continuity, parser, hook, remediation, storage projection, or lifecycle
  behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-175
unblocks: []
acceptance_criteria:
- Covered source spans or source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, tables, YAML snippets, and Rust snippets are preserved as plan evidence and do not create WorkNodes, NodeSeeds,
  executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: active_subagent_tracking_accuracy_source_truth_partial
node_compile_hint:
  mode: active_subagent_tracking_accuracy_source_truth_partial
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- 'Gap #19'
- Active subagent tracking accuracy
- subagent selection changes mid-tier
- platform-native hooks override selection
- ExecutionUnitContext.active_subagent
- BeforeUnit hook
- must update ExecutionUnitContext
negative_constraints: []
compatibility_only_notes:
- >-
  This PlanUnit covers only S0119 source lines 3215-3220; the S0119 tail remains residual for the next bounded window.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-191 - Active-Subagent Tracking Validation And Inference Fallback

```yaml
plan_unit_id: OSI-191
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  AfterUnit validation checks that tracked subagent identity matches actual execution using platform logs or output, and if
  tracking fails may infer subagent identity from output patterns such as rust-engineer or Rust-specific markers.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-175
- OSI-190
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: active_subagent_tracking_validation_inference_fallback
node_compile_hint:
  mode: active_subagent_tracking_validation_inference_fallback
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- AfterUnit hook
- platform logs
- output
- subagent name
- Fallback
- rust-engineer
- Rust-specific patterns
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-192 - Safe Hook Wrapping Performance Budget

```yaml
plan_unit_id: OSI-192
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  safe_hook_main wrapping is scoped by performance budget: only hooks and verification functions that may panic or fail unpredictably
  require wrapping, trusted simple getters can avoid wrapping, Result types are preferred where possible, and overhead above
  5 percent on hot paths triggers optimization or removal.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-176
- OSI-177
- OSI-138
- OSI-145
- OSI-146
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: safe_hook_wrapping_performance_budget
node_compile_hint:
  mode: safe_hook_wrapping_performance_budget
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- 'Gap #20'
- safe_hook_main
- Selective wrapping
- Result
- panics
- overhead > 5%
- hot paths
negative_constraints:
- Do not wrap trusted/simple getters unnecessarily.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-193 - Lazy Lifecycle State Directory Permission Fallback

```yaml
plan_unit_id: OSI-193
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Lazy verification state directory creation checks write permissions, logs errors and continues when persistence is unavailable,
  may try a fallback location such as /tmp/puppet-master-<user>/, and reports clear user instructions for permission repair.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-178
- OSI-179
- SP-001
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: lazy_lifecycle_state_directory_permission_fallback
node_compile_hint:
  mode: lazy_lifecycle_state_directory_permission_fallback
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- .puppet-master/verification/
- Permission check
- log error and continue
- /tmp/puppet-master-<user>/
- 'Cannot create state directory. Run: chmod 755 .puppet-master'
negative_constraints: []
compatibility_only_notes:
- Fallback paths are source examples and must remain aligned with canonical storage/security policy.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-194 - Structured Handoff Prompt-Injection Enforcement And Retry Feedback

```yaml
plan_unit_id: OSI-194
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Structured handoff prompt enforcement includes explicit JSON schema examples for structured-capable providers, markdown
  examples for Copilot text-only output, validation-error feedback in retry prompts, and best-effort partial output with warnings
  after retry failure.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-180
- OSI-181
- OSI-187
- OSI-151
- OSI-152
- OSI-158
- OSI-161
- OSI-162
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: structured_handoff_prompt_injection_enforcement_retry_feedback
node_compile_hint:
  mode: structured_handoff_prompt_injection_enforcement_retry_feedback
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- Required output format
- task_report
- downstream_context
- findings
- Copilot (text-only)
- Your output was missing 'task_report' field
- Fail-safe
- best-effort
- warnings
negative_constraints: []
compatibility_only_notes:
- The JSON and markdown snippets are plan examples only, not executable node outputs.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-195 - Platform Hook Adapter Trait And Protocol Boundary

```yaml
plan_unit_id: OSI-195
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform-native hook adapters for Cursor, Claude, and Gemini normalize platform-specific hook formats, communication protocols,
  JSON stdin/stdout, exit codes, and error handling behind a PlatformHookAdapter trait and documented platform hook formats.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-138
- OSI-139
- OSI-143
- OSI-145
- OSI-146
- OSI-183
- OSI-185
- OSI-186
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_hook_adapter_trait_protocol_boundary
node_compile_hint:
  mode: platform_hook_adapter_trait_protocol_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- CursorNativeHookAdapter
- ClaudeNativeHookAdapter
- GeminiNativeHookAdapter
- JSON stdin/stdout
- exit codes
- PlatformHookAdapter
- BeforeUnitContext
- AfterUnitContext
- docs/platform-hooks.md
negative_constraints: []
compatibility_only_notes:
- The Rust PlatformHookAdapter trait snippet is plan evidence only, not an executable node output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-196 - Phase 1 Memory Extraction And Persona Boundary

```yaml
plan_unit_id: OSI-196
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Phase 1 memory extraction may use pattern matching, workflow-resolved drafting or synthesis Personas, explicit memory tags,
  and best-effort extraction to capture architectural decisions, patterns, tech choices, and pitfalls, but memory extraction
  is an enhancement and must not require a protected core document-writer Persona.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-173
- OSI-174
- OSI-189
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: phase1_memory_extraction_persona_boundary
node_compile_hint:
  mode: phase1_memory_extraction_persona_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- Phase 1
- architectural decisions
- Rust + Actix
- knowledge-synthesizer
- general-purpose
- document-writer
- <memory:architecture>Rust + Actix</memory:architecture>
- Best-effort
negative_constraints:
- Do not require a protected core document-writer Persona.
- Missing memory extractions do not block execution.
compatibility_only_notes:
- >-
  knowledge-synthesizer/general-purpose/document-writer names are preserved source tokens and remain subject to Persona owner
  routing.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-197 - Remediation Re-Execution Context Preservation

```yaml
plan_unit_id: OSI-197
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Remediation reruns use a remediation prompt appended to original context, include previous iteration output, preserve tier
  state between retries, and retain progress such as modified files and tests run.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-169
- OSI-188
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_reexecution_context_preservation
node_compile_hint:
  mode: remediation_reexecution_context_preservation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- remediation prompt appended
- original context (files, state)
- previous iteration's output
- Don't reset tier state
- files modified
- tests run
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-198 - Hook Performance Budget Async Selective Execution And Caching

```yaml
plan_unit_id: OSI-198
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Hook performance mitigation may use asynchronous hooks, selective execution, critical-hook filtering, cached hook results,
  and execution-time monitoring, while tier-era and hook-name source terms remain aligned to the current execution-unit model.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-138
- OSI-145
- OSI-146
- OSI-186
- OSI-175
- OSI-179
- OSI-180
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_performance_budget_async_selective_execution_caching
node_compile_hint:
  mode: hook_performance_budget_async_selective_execution_caching
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- Async hooks
- StaleStatePrunerHook
- Iteration tier
- ActiveSubagentTrackerHook
- HandoffValidatorHook
- TierContextInjectorHook
- hooks > 10% of tier time
negative_constraints: []
compatibility_only_notes:
- >-
  Tier-era and hook-name terms are preserved as lineage and must be aligned to current execution-unit context before implementation.
stale_retired_dispositions:
- >-
  Async StaleStatePrunerHook and Iteration-tier skip examples are retained as source examples, not unconditional implementation
  policy.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-199 - Structured Output Validation Strictness And False Positive Tuning

```yaml
plan_unit_id: OSI-199
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Structured output validation tunes strictness to reduce false positives and false negatives, accepts partial output where
  downstream_context is missing, rejects missing task_report, targets less than 1 percent false positive rate, logs raw output
  for debugging, and updates parsers based on user feedback and platform CLI changes.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration, hook, lifecycle, validation, parser, remediation, continuity, or storage-boundary
  behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-187
- OSI-180
- OSI-181
- OSI-151
- OSI-152
- OSI-158
- OSI-161
- OSI-162
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Plans/orchestrator-subagent-integration.md remains the owner for PM-native child orchestration while referenced owner docs
  retain their own contracts.
- >-
  Source examples, JSON snippets, Rust snippets, and blank boundary lines are preserved as plan evidence or attached coverage
  and do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: structured_output_validation_strictness_false_positive_tuning
node_compile_hint:
  mode: structured_output_validation_strictness_false_positive_tuning
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0119
preserved_exact_tokens:
- false positive
- false negative
- Lenient validation
- downstream_context
- task_report
- < 1% false positive rate
- raw output
- platform CLI changes
negative_constraints:
- Missing downstream_context is acceptable, but missing task_report is not acceptable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-200 - Hook Lifecycle Placement Summary

```yaml
plan_unit_id: OSI-200
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Hook lifecycle placement source notes identify hook-system module candidates and summarize BeforeUnitHook and AfterUnitHook
  traits running at tier boundaries, while preserving this as placement/source evidence aligned to current execution-unit
  context.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-142
- OSI-184
- OSI-186
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_lifecycle_placement_summary
node_compile_hint:
  mode: hook_lifecycle_placement_summary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0120
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0123
preserved_exact_tokens:
- src/core/hooks.rs
- src/verification/hooks.rs
- BeforeUnitHook
- AfterUnitHook
- tier boundaries
negative_constraints: []
compatibility_only_notes:
- Source placement/example only; tier wording must align to current execution-unit context.
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-201 - Continuity Persistence Placement Compatibility

```yaml
plan_unit_id: OSI-201
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Continuity placement source notes mention src/core/memory.rs plus save_memory and load_memory functions for cross-session
  persistence at Phase completion and run start, but the memory-module phrasing remains compatibility lineage unless reconciled
  to canonical runtime storage and handoff projections.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-173
- OSI-174
- OSI-189
- OSI-196
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: continuity_persistence_placement_compatibility
node_compile_hint:
  mode: continuity_persistence_placement_compatibility
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0120
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0123
preserved_exact_tokens:
- src/core/memory.rs
- save_memory()
- load_memory()
- cross-session persistence
- Phase completion
- run start
negative_constraints: []
compatibility_only_notes:
- >-
  Memory-file/module phrasing is compatibility lineage unless reconciled to canonical runtime storage and handoff projections.
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-202 - Structured Handoff Parser Placement Summary

```yaml
plan_unit_id: OSI-202
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Structured handoff placement source notes extend SubagentOutput in src/types and validate_subagent_output with platform-specific
  parsers for structured handoff runtime validation.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-150
- OSI-180
- OSI-181
- OSI-187
- OSI-199
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: structured_handoff_parser_placement_summary
node_compile_hint:
  mode: structured_handoff_parser_placement_summary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0120
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0123
preserved_exact_tokens:
- SubagentOutput
- src/types/
- validate_subagent_output()
- platform-specific parsers
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-203 - Remediation Trigger Placement Summary

```yaml
plan_unit_id: OSI-203
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Remediation placement source notes put remediation loop behavior into orchestrator completion logic and trigger remediation
  when Critical or Major findings are detected, without creating executable retry queues or production tasks.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-170
- OSI-172
- OSI-188
- OSI-197
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_trigger_placement_summary
node_compile_hint:
  mode: remediation_trigger_placement_summary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0120
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0123
preserved_exact_tokens:
- remediation loop
- orchestrator completion logic
- Critical/Major findings
negative_constraints:
- Do not treat this placement summary as an executable retry queue or production build task.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-204 - Selector Detection Cache And Recompute Guardrail

```yaml
plan_unit_id: OSI-204
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Selector detection performance guardrails require caching subagent detection and avoiding recomputation every iteration.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-038
- OSI-059
- OSI-096
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: selector_detection_cache_recompute_guardrail
node_compile_hint:
  mode: selector_detection_cache_recompute_guardrail
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0121
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0124
preserved_exact_tokens:
- Performance
- Subagent detection should be cached
- not recomputed every iteration
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-205 - Selector Fallback And Availability Guardrails

```yaml
plan_unit_id: OSI-205
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Selector guardrails preserve fallback subagents when detection fails and subagent availability checks before selection,
  while file-existence checks remain selection guardrails rather than hard platform-native agent-file contracts unless later
  owner docs define them.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-038
- OSI-041
- OSI-060
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: selector_fallback_availability_guardrails
node_compile_hint:
  mode: selector_fallback_availability_guardrails
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0121
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0124
preserved_exact_tokens:
- Fallbacks
- fallback subagents
- detection fails
- Subagent Availability
- subagent files exist before selection
negative_constraints: []
compatibility_only_notes:
- >-
  File-existence check is a selection guardrail, not a hard platform-native agent-file contract unless later owner docs define
  it.
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-206 - Parallel Invocation And Override Guardrails

```yaml
plan_unit_id: OSI-206
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Selector considerations preserve support for parallel subagent invocation when appropriate and manual configuration overrides
  for edge cases as orchestration/config policy, not a build queue.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-041
- OSI-061
- OSI-096
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parallel_invocation_override_guardrails
node_compile_hint:
  mode: parallel_invocation_override_guardrails
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0121
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0124
preserved_exact_tokens:
- Multiple Subagents
- parallel subagent invocation
- Configuration Overrides
- manual overrides
- edge cases
negative_constraints:
- >-
  Do not promote this consideration into a build queue, WorkNode, NodeSeed, executable queue, final node manifest, or production
  task.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-207 - Multi-Language Detection Guardrail

```yaml
plan_unit_id: OSI-207
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Selector language-detection guardrails preserve multi-language project handling such as Rust + TypeScript for project context
  and subagent selection.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-038
- OSI-059
- OSI-096
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: multi_language_detection_guardrail
node_compile_hint:
  mode: multi_language_detection_guardrail
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0121
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0124
preserved_exact_tokens:
- Language Detection
- multi-language projects
- Rust + TypeScript
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-208 - Platform Capability Next-Steps Coverage Disposition

```yaml
plan_unit_id: OSI-208
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform capability next-steps checklist tokens are preserved only as compatibility/source-lineage coverage for prior plan
  sequencing and must not be promoted into executable work.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation-placement, compatibility, selector, parser, remediation, continuity, or orchestration
  policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-059
- OSI-060
- OSI-061
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- >-
  Checklists and placement notes are preserved as compatibility/source-lineage plan evidence and do not create WorkNodes,
  NodeSeeds, executable queues, final node manifests, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_capability_next_steps_coverage_disposition
node_compile_hint:
  mode: platform_capability_next_steps_coverage_disposition
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0122
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0125
preserved_exact_tokens:
- Review and approve this plan
- Implement Phase 1 (Project Context Detection)
- Implement Phase 2 (Subagent Selector)
- Integrate with orchestrator
- Test with real projects
negative_constraints:
- >-
  Do not promote this checklist into WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks,
  or implementation-ready build tasks.
compatibility_only_notes:
- Compatibility/source-lineage checklist disposition only; duplicate S0125 repeats S0122.
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  S0123 duplicates S0120, S0124 duplicates S0121, and S0125 duplicates S0122 byte-for-byte in the Phase 2B span map.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-209 - Implementation Notes Placement Boundary

```yaml
plan_unit_id: OSI-209
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The Implementation Notes section is a placement boundary that tells implementers where to put code and what the orchestrator
  already provides; it is coverage-only parent material for the following placement PlanUnits, not an executable work queue.
gui_related: false
gui_classification_reason: >-
  This unit covers implementation-placement source structure and backend orchestration guidance rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-001
- OSI-208
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- >-
  The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: implementation_notes_placement_boundary
node_compile_hint:
  mode: implementation_notes_placement_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0126
preserved_exact_tokens:
- Implementation Notes (Where Code Lives and What to Add)
- where to put code
- what the orchestrator already provides
negative_constraints:
- This placement boundary must not be promoted into executable work.
compatibility_only_notes:
- Coverage-only parent material for the following implementation-placement PlanUnits.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-210 - Project Context Module Placement

```yaml
plan_unit_id: OSI-210
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Project context detection is placed in a new core module such as src/core/subagent_selector.rs,
  src/core/project_context.rs, or a small src/core/detection/ module with language.rs and framework.rs helpers.
gui_related: false
gui_classification_reason: >-
  This unit covers backend module placement and detection ownership rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-038
- OSI-059
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Project context module placement remains aligned to core orchestration and selector ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: project_context_module_placement
node_compile_hint:
  mode: project_context_module_placement
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0127
preserved_exact_tokens:
- src/core/subagent_selector.rs
- src/core/project_context.rs
- src/core/detection/
- language.rs
- framework.rs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-211 - Project Context Detection And Cache API

```yaml
plan_unit_id: OSI-211
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Project context detection implements ProjectContext, DetectedLanguage, workspace-path scanning for Cargo.toml,
  package.json, and similar markers, caches results per workspace path or in memory for the run, and exposes a
  detect_project_context(workspace: &Path) -> Result<ProjectContext> style API.
gui_related: false
gui_classification_reason: >-
  This unit covers backend detection and caching behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-038
- OSI-096
- OSI-204
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Detection results are cached so selector and orchestrator consumers do not recompute every time.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: project_context_detection_cache_api
node_compile_hint:
  mode: project_context_detection_cache_api
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0127
preserved_exact_tokens:
- ProjectContext
- DetectedLanguage
- Cargo.toml
- package.json
- Cache results per workspace path
- in-memory for the run
- "detect_project_context(workspace: &Path) -> Result<ProjectContext>"
negative_constraints:
- Phase 2 and the orchestrator must not recompute project context every time.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-212 - Registry-Backed Selector Canonical List

```yaml
plan_unit_id: OSI-212
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The subagent selector uses the Known subagent names table from Gaps section 4 as canonical list lineage, preserving the
  DRY:DATA:subagent_names source token while aligning implementation to the shared subagent_registry module.
gui_related: false
gui_classification_reason: >-
  This unit covers selector registry data ownership rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-060
- OSI-205
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Selector name lists are routed through shared registry/data ownership rather than local hardcoded lists.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: registry_backed_selector_canonical_list
node_compile_hint:
  mode: registry_backed_selector_canonical_list
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0128
preserved_exact_tokens:
- Known subagent names
- Gaps §4
- DRY:DATA:subagent_names
- subagent_registry
negative_constraints:
- Selector implementation must not hardcode subagent names outside the canonical registry/data owner.
compatibility_only_notes:
- >-
  DRY:DATA:subagent_names is preserved as source lineage while current canonical naming also uses DRY:DATA:subagent_registry.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-213 - Pure Subagent Selector API

```yaml
plan_unit_id: OSI-213
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  SubagentSelector exposes SubagentSelector::new(project_context) and select_for_tier(tier_type, tier_context) -> Vec<String>
  over language, framework, and domain mappings from Tier-Level Subagent Strategy, with no platform calls in selector logic.
gui_related: false
gui_classification_reason: >-
  This unit covers backend selector API behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-060
- OSI-206
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Selector behavior remains pure logic and does not invoke platform runners directly.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: pure_subagent_selector_api
node_compile_hint:
  mode: pure_subagent_selector_api
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0128
preserved_exact_tokens:
- SubagentSelector::new(project_context)
- "select_for_tier(tier_type, tier_context) -> Vec<String>"
- language/framework/domain mappings
- Tier-Level Subagent Strategy
- No platform calls yet; pure logic
negative_constraints:
- The selector API must not make platform calls.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-214 - Orchestrator Tier Config And Subagent Merge Policy

```yaml
plan_unit_id: OSI-214
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator integration uses src/core/orchestrator.rs and tier_config_for(tier_type) -> &TierConfig as the source for
  platform, model, and plan_mode, then reads enable_tier_subagents and subagent config, applies tier_overrides, filters
  disabled_subagents, and adds required_subagents.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration configuration merge behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-044
- OSI-061
- OSI-105
- OSI-206
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The same config source as tier config governs subagent enablement and overrides.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_tier_config_subagent_merge_policy
node_compile_hint:
  mode: orchestrator_tier_config_subagent_merge_policy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0129
preserved_exact_tokens:
- src/core/orchestrator.rs
- "tier_config_for(tier_type) -> &TierConfig"
- enable_tier_subagents
- GuiConfig
- tier_overrides
- disabled_subagents
- required_subagents
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-215 - Subagent ExecutionRequest Runner Boundary

```yaml
plan_unit_id: OSI-215
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent execution builds an ExecutionRequest with coordination context, model, and plan_mode from tier_config, then runs
  through the existing platform runner path; build_subagent_invocation and execute_with_subagent may take tier_config and use
  tier_config_for(...).platform and .model without a separate get_platform_for_tier helper.
gui_related: false
gui_classification_reason: >-
  This unit covers backend runner invocation boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-044
- OSI-046
- OSI-061
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Subagent runs use the existing platform runner path and ExecutionRequest contract.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagent_executionrequest_runner_boundary
node_compile_hint:
  mode: subagent_executionrequest_runner_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0129
preserved_exact_tokens:
- ExecutionRequest
- prompt with coordination context
- plan_mode from tier_config
- existing platform runner
- build_subagent_invocation
- execute_with_subagent
- .platform
- .model
- get_platform_for_tier
negative_constraints:
- No separate get_platform_for_tier is needed when tier_config_for provides platform and model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumes the executor/run request boundary from Plans/Executor_Protocol.md.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-216 - Orchestrator Coordination State Around Execution

```yaml
plan_unit_id: OSI-216
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator subagent execution registers the agent in coordination state before execution, gets coordination context for
  prompt injection, updates coordination state during execution for active files and operations, and unregisters after
  completion.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination-state lifecycle behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-026
- OSI-044
- OSI-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Coordination state is updated before, during, and after subagent execution.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_coordination_state_around_execution
node_compile_hint:
  mode: orchestrator_coordination_state_around_execution
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0129
preserved_exact_tokens:
- Register agent in coordination state
- Get coordination context
- Update coordination state
- Unregister agent
- files being edited
- current operation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-217 - Error Pattern Detection Selection Feed

```yaml
plan_unit_id: OSI-217
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Error pattern detection parses iteration output in the orchestrator or a small stdout/stderr helper, updates
  ExecutionUnitContext.has_errors or error_patterns from the last iteration result, and uses simple v1 checks such as regex,
  exit codes, non-zero exit, and stderr keywords for compilation error, test failure, and security issue signals.
gui_related: false
gui_classification_reason: >-
  This unit covers backend output parsing and selector feed behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-060
- OSI-061
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Error signals can feed the next subagent selection pass.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: error_pattern_detection_selection_feed
node_compile_hint:
  mode: error_pattern_detection_selection_feed
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0130
preserved_exact_tokens:
- ExecutionUnitContext.has_errors
- error_patterns
- compilation error
- test failure
- security issue
- regex on stderr
- exit codes
- non-zero exit + keyword in stderr
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-218 - SubagentManager Optional V1 Boundary

```yaml
plan_unit_id: OSI-218
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  SubagentManager is referenced as coming from the interview plan, but for v1 it is optional: if unavailable, implement only
  the selection and invocation needed by Phase 3 through the existing runner, with no separate manager required beyond a thin
  workspace-path wrapper.
gui_related: false
gui_classification_reason: >-
  This unit covers backend module optionality and runner integration rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-060
- OSI-061
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Missing SubagentManager does not block v1 if selector and runner integration provide the needed behavior.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagentmanager_optional_v1_boundary
node_compile_hint:
  mode: subagentmanager_optional_v1_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0131
preserved_exact_tokens:
- SubagentManager
- from interview plan
- loading agent definitions from disk
- optional for v1
- thin wrapper
- workspace path
negative_constraints:
- No separate manager is strictly required for v1.
compatibility_only_notes:
- SubagentManager is preserved as source lineage and optional integration with interview-plan capabilities.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-219 - Config Wiring Module Placement And Orchestrator/Interview Ownership

```yaml
plan_unit_id: OSI-219
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Config-wiring validation may live in src/core/config_wiring.rs, src/verification/config_wiring.rs, or split
  config_wiring/orchestrator.rs and config_wiring/interview.rs, with the main orchestrator calling from
  src/core/orchestrator.rs and the interview orchestrator calling its interview-specific validator from
  src/interview/orchestrator.rs.
gui_related: false
gui_classification_reason: >-
  This unit covers backend validation module placement and owner boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-105
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Main and interview orchestrators retain distinct validation call sites.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: config_wiring_module_placement_orchestrator_interview_ownership
node_compile_hint:
  mode: config_wiring_module_placement_orchestrator_interview_ownership
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0132
preserved_exact_tokens:
- src/core/config_wiring.rs
- src/verification/config_wiring.rs
- config_wiring/orchestrator.rs
- config_wiring/interview.rs
- src/core/orchestrator.rs
- src/interview/orchestrator.rs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-220 - Config Wiring Tier Matrix And Non-Skip Timing

```yaml
plan_unit_id: OSI-220
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Config-wiring validation exposes validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>
  or equivalent, checks Phase, Task, Subtask, and Iteration required/optional fields against the resolved table, and runs
  immediately before context building or agent spawning without skipping fast paths or tests unless explicitly gated.
gui_related: false
gui_classification_reason: >-
  This unit covers backend validation matrix and timing behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-105
- OSI-106
- OSI-110
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Validation timing is before execution context construction or agent spawning at each applicable tier boundary.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: config_wiring_tier_matrix_non_skip_timing
node_compile_hint:
  mode: config_wiring_tier_matrix_non_skip_timing
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0132
preserved_exact_tokens:
- "validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>"
- Phase
- Task
- Subtask
- Iteration
- Config-Wiring Validation: Required vs Optional Fields (Resolved)
- fast path
- env var
negative_constraints:
- Do not skip validation for fast path or tests unless explicitly gated.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-221 - Tier Start/End Verification Placement

```yaml
plan_unit_id: OSI-221
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Tier start/end verification lives with config-wiring verification under src/verification/, src/core/, or tier_verification.rs,
  and the main orchestrator calls verify_tier_start on Phase/Task/Subtask entry and verify_tier_end after the acceptance gate
  before marking the tier complete.
gui_related: false
gui_classification_reason: >-
  This unit covers backend verification placement and lifecycle timing rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-107
- OSI-108
- OSI-109
- OSI-110
- OSI-111
- OSI-112
- OSI-113
- OSI-114
- OSI-184
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Start and end verification are wired at Phase, Task, and Subtask boundaries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: tier_start_end_verification_placement
node_compile_hint:
  mode: tier_start_end_verification_placement
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0133
preserved_exact_tokens:
- src/verification/
- src/core/
- tier_verification.rs
- verify_tier_start
- verify_tier_end
- acceptance gate
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-222 - GUI Readiness Verification Criterion

```yaml
plan_unit_id: OSI-222
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Start verification includes GUI updated? as a readiness checklist criterion for user-visible readiness, while this unit
  remains a verification consumer and does not become the owner of GUI implementation requirements.
gui_related: true
gui_classification_reason: >-
  This unit explicitly preserves a GUI readiness criterion for user-visible surfaces.
split_recommended: false
depends_on:
- OSI-112
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- GUI readiness remains a verification criterion without moving GUI implementation ownership into this document.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gui_readiness_verification_criterion
node_compile_hint:
  mode: gui_readiness_verification_criterion
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0133
preserved_exact_tokens:
- GUI updated?
- readiness checklist
negative_constraints:
- This unit is not the owner of GUI implementation requirements.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI owner docs consume this as readiness/verification criteria where applicable.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-223 - Quality Review And Gate Criteria

```yaml
plan_unit_id: OSI-223
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Quality verification requires a code-reviewer subagent at end-of-tier, on retry, and when the gate fails, plus gate criteria
  such as clippy and tests, with per-tier checklists for Phase docs, Task design, and Subtask code plus tests plus clippy;
  parent-tier orchestration addresses unrelated failures.
gui_related: false
gui_classification_reason: >-
  This unit covers backend quality gate and review orchestration behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-170
- OSI-172
- OSI-188
- OSI-197
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Quality review and gate criteria are both represented in the verification path.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: quality_review_gate_criteria
node_compile_hint:
  mode: quality_review_gate_criteria
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0133
preserved_exact_tokens:
- code-reviewer
- end-of-tier
- on retry
- gate fails
- clippy
- tests
- Phase: docs
- Task: design
- Subtask: code + tests + clippy
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-224 - Hook/Verification Ordering Compatibility

```yaml
plan_unit_id: OSI-224
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Hook integration preserves the ordering that BeforeUnit runs before verify_tier_start and AfterUnit runs after
  verify_tier_end, with active-subagent tracking, context injection, stale-state pruning, handoff-format validation, and
  completion tracking treated as compatibility/source summary for the hook owner path.
gui_related: false
gui_classification_reason: >-
  This unit covers backend hook and verification ordering rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-184
- OSI-186
- OSI-200
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Hook ordering remains explicit relative to start/end verification.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_verification_ordering_compatibility
node_compile_hint:
  mode: hook_verification_ordering_compatibility
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0133
preserved_exact_tokens:
- BeforeUnit hook
- verify_tier_start
- AfterUnit hook
- verify_tier_end
- tracks active subagent
- injects context
- prunes stale state
- validates handoff format
negative_constraints:
- This compatibility/source summary must not override the canonical hook owner path.
compatibility_only_notes:
- Hook implementation details remain aligned with Lifecycle and Quality Features owner text.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-225 - Agent Coordination Module And Canonical Projection Boundary

```yaml
plan_unit_id: OSI-225
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agent coordination is placed in src/core/agent_coordination.rs around an AgentCoordinator over child-run state, lineage,
  current file activity, and platform/runtime metadata projected from seglog/redb; optional debug mirrors may exist, but
  active-agents.json is not canon.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination projection and storage boundary behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-026
- OSI-044
- OSI-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Canonical coordination state is projected from runtime/storage records, not owned by a debug mirror.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_coordination_module_canonical_projection_boundary
node_compile_hint:
  mode: agent_coordination_module_canonical_projection_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0134
preserved_exact_tokens:
- src/core/agent_coordination.rs
- AgentCoordinator
- child-run state
- lineage
- current file activity
- platform/runtime metadata
- seglog/redb
- active-agents.json
negative_constraints:
- active-agents.json must not become the canonical coordination store.
compatibility_only_notes:
- Optional debug mirrors are allowed but are not the source of truth.
stale_retired_dispositions: []
owner_boundary_notes:
- Consumes child-run lifecycle and runtime/storage projection contracts from Plans/Contracts_V0.md.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-226 - Coordination Lifecycle Status Projection

```yaml
plan_unit_id: OSI-226
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Coordination lifecycle registers agents before execution, updates status during execution from hooks, provider events, or
  tool activity, and unregisters or terminally resolves agents through canonical status projection after execution.
gui_related: false
gui_classification_reason: >-
  This unit covers backend child-run status projection behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-216
- OSI-225
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Agent lifecycle status updates resolve through canonical projection state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_lifecycle_status_projection
node_compile_hint:
  mode: coordination_lifecycle_status_projection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0134
preserved_exact_tokens:
- Register agents before execution
- update status during execution
- hooks/provider events/tool activity
- unregister or terminally resolve
- canonical status projection
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Consumes child lifecycle status canon and storage projection ownership.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-227 - Prompt Injection And Conflict Prevention

```yaml
plan_unit_id: OSI-227
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Prompt injection includes active agents with platform info, files being modified, conflict warnings, and platform identifiers;
  orchestration extracts file operations, checks projected coordination state before execution, and warns or delays execution
  when conflicts are detected.
gui_related: false
gui_classification_reason: >-
  This unit covers backend prompt-context and conflict-prevention behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-046
- OSI-225
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Agents receive coordination context needed to avoid active file/operation conflicts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: prompt_injection_conflict_prevention
node_compile_hint:
  mode: prompt_injection_conflict_prevention
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0134
preserved_exact_tokens:
- Prompt injection
- active agents with platform info
- files being modified
- warnings about conflicts
- platform identifier
- Extract file operations
- Check projected coordination state
- warn agents or delay execution
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-228 - Lifecycle Hooks Placement And Storage Projections

```yaml
plan_unit_id: OSI-228
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Lifecycle hooks live in src/core/hooks.rs or src/verification/hooks.rs, with canonical continuity persistence and recovery
  projections in seglog/redb, SubagentOutput extensions in src/types/, and remediation loop placement in
  src/core/orchestrator.rs.
gui_related: false
gui_classification_reason: >-
  This unit covers backend hook, storage-projection, handoff, and remediation placement rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-138
- OSI-200
- OSI-201
- OSI-202
- OSI-203
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Lifecycle hook placement remains separate from canonical storage/projection ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: lifecycle_hooks_placement_storage_projections
node_compile_hint:
  mode: lifecycle_hooks_placement_storage_projections
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0135
preserved_exact_tokens:
- src/core/hooks.rs
- src/verification/hooks.rs
- seglog/redb
- SubagentOutput
- src/types/
- src/core/orchestrator.rs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-229 - Platform Hook Adapter And Middleware Boundary

```yaml
plan_unit_id: OSI-229
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  BeforeUnit/AfterUnit hooks delegate to native hooks where possible for Cursor, Claude, and Gemini, while Codex and Copilot
  use orchestrator-level middleware and canonical coordination projection.
gui_related: false
gui_classification_reason: >-
  This unit covers backend platform hook adapter boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-184
- OSI-186
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Platform-native hooks and orchestrator middleware remain distinct compatibility paths.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_hook_adapter_middleware_boundary
node_compile_hint:
  mode: platform_hook_adapter_middleware_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0135
preserved_exact_tokens:
- Cursor
- Claude
- Gemini
- Codex
- Copilot
- native hooks
- orchestrator-level middleware
- canonical coordination projection
negative_constraints: []
compatibility_only_notes:
- Platform-specific hook terms are adapter boundaries, not separate canonical coordination stores.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-230 - Structured Handoff Validation And Contract Enforcement

```yaml
plan_unit_id: OSI-230
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Structured handoff validation extends validate_subagent_output() with platform-specific parsers, including JSON for
  Cursor, Claude, and Gemini, JSONL for Codex, and text parsing for Copilot, and contract enforcement retries malformed
  output before failing safe.
gui_related: false
gui_classification_reason: >-
  This unit covers backend structured handoff parsing and contract enforcement rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-150
- OSI-159
- OSI-165
- OSI-180
- OSI-187
- OSI-199
- OSI-202
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Malformed handoff output retries once before fail-safe handling.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: structured_handoff_validation_contract_enforcement
node_compile_hint:
  mode: structured_handoff_validation_contract_enforcement
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0135
preserved_exact_tokens:
- validate_subagent_output()
- JSON for Cursor/Claude/Gemini
- JSONL for Codex
- text parsing for Copilot
- retry on malformed output
- fail-safe after retry
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-231 - Remediation Loop Completion Block

```yaml
plan_unit_id: OSI-231
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The remediation loop parses reviewer subagent findings, filters Critical and Major findings, blocks completion, reruns until
  resolved or max retries, and escalates to the parent tier when max retries are reached.
gui_related: false
gui_classification_reason: >-
  This unit covers backend remediation loop and completion-block behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-170
- OSI-172
- OSI-188
- OSI-197
- OSI-203
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Critical and Major findings prevent completion until resolved, exhausted, or escalated.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_loop_completion_block
node_compile_hint:
  mode: remediation_loop_completion_block
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0135
preserved_exact_tokens:
- Critical/Major
- block completion
- re-run until resolved
- max retries
- escalate to parent-tier
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-232 - Continuity And Active Subagent Runtime Projection

```yaml
plan_unit_id: OSI-232
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Cross-run continuity persists architectural decisions, patterns, and tech choices as canonical outputs/projections at Phase
  completion, reloads them at run start through handoff/context assembly rather than child-memory files, and tracks
  active_subagent: Option<String> in ExecutionUnitContext through canonical runtime storage and projections.
gui_related: false
gui_classification_reason: >-
  This unit covers backend continuity and runtime projection behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-173
- OSI-174
- OSI-189
- OSI-196
- OSI-201
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Continuity loads through run-start handoff/context assembly rather than child-memory files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: continuity_active_subagent_runtime_projection
node_compile_hint:
  mode: continuity_active_subagent_runtime_projection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0135
preserved_exact_tokens:
- architectural decisions
- patterns
- tech choices
- Phase completion
- run start
- handoff/context assembly
- child-memory files
- "active_subagent: Option<String>"
- ExecutionUnitContext
negative_constraints:
- Continuity must not depend on child-memory files as the canonical reload path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-233 - Safe Hook Error Handling And Lazy Verification State

```yaml
plan_unit_id: OSI-233
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Hook and verification error handling wraps execution in safe_hook_main() that guarantees structured output even on failure,
  creates verification state on first write, and prunes stale state older than 2 hours in the BeforeUnit hook.
gui_related: false
gui_classification_reason: >-
  This unit covers backend hook error handling and verification-state lifecycle behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-147
- OSI-186
- OSI-199
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Hook failure still emits structured output and does not corrupt lifecycle state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: safe_hook_error_handling_lazy_verification_state
node_compile_hint:
  mode: safe_hook_error_handling_lazy_verification_state
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0135
preserved_exact_tokens:
- safe_hook_main()
- structured output even on failure
- Create verification state on first write
- prune stale state (>2 hours)
- BeforeUnit hook
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-234 - Subagent Availability File-Existence Optional V1

```yaml
plan_unit_id: OSI-234
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Checking whether subagent files exist before selection is optional for v1: platforms such as Cursor may resolve subagent
  names internally from built-in or workspace config, future custom agent files such as .cursor/agents/ can add checks later,
  and for now the canonical list is treated as valid while unsupported names may fail in the platform CLI.
gui_related: false
gui_classification_reason: >-
  This unit covers backend selector availability guardrails and platform compatibility rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-205
- OSI-212
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- File-existence checks remain optional v1 guardrails, not a hard platform-native agent-file contract.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: subagent_availability_file_existence_optional_v1
node_compile_hint:
  mode: subagent_availability_file_existence_optional_v1
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0136
preserved_exact_tokens:
- Check if subagent files exist before selection
- optional for v1
- Cursor
- built-in or workspace config
- .cursor/agents/
- canonical list as valid
- platform CLI fail
negative_constraints:
- Do not make file existence a hard platform-native agent-file contract for v1.
compatibility_only_notes:
- File-existence validation can be added later for custom agent files.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-235 - Parallel Execution Capability Baseline

```yaml
plan_unit_id: OSI-235
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The orchestrator baseline supports dependency-level parallel execution of subtasks using DependencyAnalyzer with Kahn's
  topological sort, ParallelExecutor, git worktree isolation, and TierNode.dependencies to form ordered execution levels.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestration and scheduling capability rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-206
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Execution-flow examples remain plan evidence and do not create executable work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parallel_execution_capability_baseline
node_compile_hint:
  mode: parallel_execution_capability_baseline
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0137
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0138
preserved_exact_tokens:
- DependencyAnalyzer
- Kahn's topological sort
- ParallelExecutor
- TierNode.dependencies
- Level 0
negative_constraints: []
compatibility_only_notes:
- Execution-flow block is preserved as plan evidence.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-236 - Dependency-Level Worktree Group Execution

```yaml
plan_unit_id: OSI-236
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Parallel subtasks are grouped by dependency level, each group creates worktrees for its subtasks, and group members run
  concurrently through join_all while groups themselves execute sequentially by dependency order.
gui_related: false
gui_classification_reason: >-
  This unit covers backend dependency-level orchestration and worktree execution rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-235
- OSI-206
- OSI-216
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Rust snippets are preserved as plan examples unless a surrounding contract states a normative rule.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: dependency_level_worktree_group_execution
node_compile_hint:
  mode: dependency_level_worktree_group_execution
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0139
preserved_exact_tokens:
- execute_subtasks_parallel
- get_parallelizable_groups
- create_subtask_worktree
- join_all
negative_constraints: []
compatibility_only_notes:
- Rust implementation block is plan evidence, not direct source-code output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-237 - Independent Per-Subtask Selection Context

```yaml
plan_unit_id: OSI-237
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Each parallel subtask builds its own tier context and selects subagents independently, so concurrent subtasks can carry
  different selected subagent sets.
gui_related: false
gui_classification_reason: >-
  This unit covers backend selector context behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-213
- OSI-236
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Per-subtask context selection is represented separately from GUI/frontend example evidence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: independent_per_subtask_selection_context
node_compile_hint:
  mode: independent_per_subtask_selection_context
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0139
preserved_exact_tokens:
- Build context for this specific subtask
- select_for_tier
- TierType::Subtask
- different subagents
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-238 - Frontend/UI Selection Example Evidence

```yaml
plan_unit_id: OSI-238
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The React frontend UI example is preserved as evidence that GUI/frontend subtasks can select specialized subagents
  independently while parallel backend/frontend subtasks run in the same dependency level.
gui_related: true
gui_classification_reason: >-
  This unit preserves a user-visible frontend UI example and associated frontend-specialist subagent selection evidence.
split_recommended: false
depends_on:
- OSI-237
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- GUI/frontend example evidence does not become GUI owner canon in this document.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: frontend_ui_selection_example_evidence
node_compile_hint:
  mode: frontend_ui_selection_example_evidence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0139
preserved_exact_tokens:
- React frontend UI
- react-specialist
- frontend-developer
negative_constraints:
- This illustrative example does not transfer GUI implementation ownership to this document.
compatibility_only_notes:
- Frontend/UI selection is example evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- GUI implementation owner docs remain authoritative for GUI requirements.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-239 - Registry-Backed Selector Validation

```yaml
plan_unit_id: OSI-239
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagent selection in parallel subtasks must use subagent_selector backed by subagent_registry and validate selected names
  with subagent_registry::is_valid_subagent_name(), never hardcoding subagent names.
gui_related: false
gui_classification_reason: >-
  This unit covers backend DRY selector validation rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-212
- OSI-213
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Selector validation preserves DRY registry ownership for subagent names.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: registry_backed_selector_validation
node_compile_hint:
  mode: registry_backed_selector_validation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0139
preserved_exact_tokens:
- NEVER hardcode subagent names
- subagent_selector
- subagent_registry::is_valid_subagent_name()
- Primitive:DRYRules
negative_constraints:
- Never hardcode subagent names in this selection path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-240 - Platform-Specific Invocation Boundary

```yaml
plan_unit_id: OSI-240
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  execute_tier_with_subagents must use platform_specs for platform-specific invocation when running selected subagents for a
  tier.
gui_related: false
gui_classification_reason: >-
  This unit covers backend platform invocation boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-215
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Platform-specific invocation stays routed through platform_specs and executor protocol ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_specific_invocation_boundary
node_compile_hint:
  mode: platform_specific_invocation_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0139
preserved_exact_tokens:
- execute_tier_with_subagents
- platform_specs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md'
```

### OSI-241 - Dependency Context Selector API

```yaml
plan_unit_id: OSI-241
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  select_with_dependency_context accepts a current tier node, completed dependencies, and ExecutionUnitContext, then returns
  selected subagents after considering dependency context.
gui_related: false
gui_classification_reason: >-
  This unit covers backend selector API behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-213
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Rust snippets are preserved as plan examples unless contract text makes a rule normative.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: dependency_context_selector_api
node_compile_hint:
  mode: dependency_context_selector_api
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0140
preserved_exact_tokens:
- select_with_dependency_context
- completed_dependencies
- ExecutionUnitContext
- Select subagents with dependency context
negative_constraints: []
compatibility_only_notes:
- Rust implementation block is plan evidence, not direct source-code output.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-242 - Registry-Backed Inherited Language Priority

```yaml
plan_unit_id: OSI-242
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Inherited language selection must use subagent_registry::get_subagent_for_language(), must not hardcode language-to-subagent
  mappings, must not call self.language_to_subagent when it may hardcode mappings, and prioritizes inherited language by
  inserting the inherited subagent first.
gui_related: false
gui_classification_reason: >-
  This unit covers backend DRY selector inheritance rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-212
- OSI-241
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Inherited language routing remains backed by subagent_registry.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: registry_backed_inherited_language_priority
node_compile_hint:
  mode: registry_backed_inherited_language_priority
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0140
preserved_exact_tokens:
- NEVER hardcode language
- subagent_registry::get_subagent_for_language()
- DO NOT call self.language_to_subagent
- insert(0, subagent)
negative_constraints:
- Never hardcode language to subagent mappings in this path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Contracts_V0.md'
```

### OSI-243 - Dependency Domain Inheritance Fallback

```yaml
plan_unit_id: OSI-243
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Dependency domain may be inherited from completed dependencies when the current execution context domain is
  ProjectDomain::Unknown.
gui_related: false
gui_classification_reason: >-
  This unit covers backend selector fallback behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-241
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Domain inheritance remains a fallback only when the current domain is unknown.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: dependency_domain_inheritance_fallback
node_compile_hint:
  mode: dependency_domain_inheritance_fallback
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0140
preserved_exact_tokens:
- ProjectDomain::Unknown
- Inherit domain
- Use domain from dependency
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-244 - Coordination Owner Boundary

```yaml
plan_unit_id: OSI-244
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agent Coordination and Communication defines the live coordination projection and the attributable crew message-board
  contract needed so concurrent agents understand active work, conflicts, questions, decisions, warnings, and requests that
  survive transient status updates.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination owner boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-225
- OSI-227
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Coordination projection and durable message-board responsibilities remain distinct.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_owner_boundary
node_compile_hint:
  mode: coordination_owner_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0141
preserved_exact_tokens:
- not "freak out"
- canonical live coordination projection
- canonical attributable crew message-board contract
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- >-
  This owner section consumes assistant chat, storage, and contract owners for user-visible message surfaces and durable
  records.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-245 - Crew Board Coordination Surface And Persistence Boundary

```yaml
plan_unit_id: OSI-245
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  PM-managed multi-agent collaboration uses the child-run/event-store coordination record family for durable attributable
  crew-board coordination that cannot be reduced to live status projection alone; `.puppet-master/state/agent-messages.json`
  may be an optional debug or interoperability mirror, but it is not the canonical persistence store.
gui_related: false
gui_classification_reason: >-
  This unit covers backend durable coordination records rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-244
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The crew message board is represented as durable attributable coordination, not active-status projection.
- "`.puppet-master/state/agent-messages.json` is optional mirror lineage and not canonical persistence."
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_board_persistence_truth_split
node_compile_hint:
  mode: crew_board_persistence_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:8
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:15
preserved_exact_tokens:
- .puppet-master/state/agent-messages.json
- canonical file-backed message board
- file-backed message board
- durable questions, answers, decisions, warnings, requests, and announcements
negative_constraints:
- .puppet-master/state/agent-messages.json must not be treated as the canonical persistence store.
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions:
- File-backed side-file persistence is retired as canonical truth; child-run/event-store coordination records are canonical.
owner_boundary_notes:
- Contracts_V0 owns child-run and side-file retirement; storage-plan owns seglog/redb persistence.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-246 - Projection Versus Message-Board Responsibility Split

```yaml
plan_unit_id: OSI-246
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Active-agent state answers who is active, what files are in flight, and which operations are running, while the message
  board answers who asked, warned, decided, or requested something, who it targeted, and whether that exchange was resolved.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination responsibility boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-225
- OSI-245
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Active status projection and durable message exchange are not collapsed into one concern.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: projection_message_board_responsibility_split
node_compile_hint:
  mode: projection_message_board_responsibility_split
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- active-agent state
- who is active
- what files are in flight
- who asked, warned, decided, or requested
- whether that exchange was resolved
negative_constraints: []
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-247 - Canonical Crew Message Schema

```yaml
plan_unit_id: OSI-247
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The canonical crew message schema preserves message identity, sender and platform, optional direct/role/node/lane targets,
  message type, priority, subject, content, execution context, thread linkage, creation time, read tracking, and resolution.
gui_related: false
gui_classification_reason: >-
  This unit covers backend record schema fields rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-245
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Message schema fields remain attributable and routeable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: canonical_crew_message_schema
node_compile_hint:
  mode: canonical_crew_message_schema
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- message_id
- from_platform
- message_type
- priority
- read_by[]
- resolved
negative_constraints: []
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Architecture_Invariants.md'
```

### OSI-248 - Crew Message Routing And Visibility

```yaml
plan_unit_id: OSI-248
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Crew messages route directly, by role, by node, by lane, or as broadcast, while the orchestrator can inspect every message
  and agent-local views are filtered to messages relevant to that agent's direct, role, node, lane, broadcast, or active-file
  context.
gui_related: false
gui_classification_reason: >-
  This unit covers backend routing and visibility rules rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Orchestrator-wide inspectability and agent-local filtering are both preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_message_routing_visibility
node_compile_hint:
  mode: crew_message_routing_visibility
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- to_agent_id
- to_agent_type
- to_node_id
- to_lane_id
- MUST be able to inspect every message
- MUST be filtered
negative_constraints: []
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-249 - Priority Rate Limits And Throttling Diagnostics

```yaml
plan_unit_id: OSI-249
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Crew message priority defaults to normal, high and urgent are reserved for blockers/conflict warnings/manager escalations,
  each agent is capped at 10 messages per minute, and throttling emits structured diagnostics requiring senders to coalesce
  or defer rather than silently dropping messages.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination rate-limit behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Throttling behavior emits diagnostics and avoids silent message loss.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: priority_rate_limits_throttling_diagnostics
node_compile_hint:
  mode: priority_rate_limits_throttling_diagnostics
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- 10 messages per minute
- structured throttling diagnostic
- silently dropping
- high
- urgent
negative_constraints:
- PM must not silently drop messages when rate limits are hit.
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md'
```

### OSI-250 - Threading Lifecycle And Annotation Separation

```yaml
plan_unit_id: OSI-250
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Crew message threading uses thread_id and in_reply_to for causal grouping, messages move through created/read/replied/resolved
  and expired/archive states, unresolved blocker threads and coordination requests remain visible until resolved or superseded,
  and document annotation lifecycle stays distinct as open -> addressed -> resolved.
gui_related: false
gui_classification_reason: >-
  This unit covers backend lifecycle and routing semantics rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Unresolved blocker visibility remains normative despite stale/archive retention language.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: threading_lifecycle_annotation_separation
node_compile_hint:
  mode: threading_lifecycle_annotation_separation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- thread_id
- in_reply_to
- open -> addressed -> resolved
- MUST remain visible
- created, read, replied, resolved, and expired/archive states
negative_constraints:
- Unresolved blocker threads and unresolved coordination requests must remain visible until resolved or explicitly superseded.
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions:
- >-
  Retention/archive wording is preserved as lifecycle context, not a basis to hide unresolved blocker threads.
owner_boundary_notes:
- Document annotations retain the Crosswalk and assistant-chat owner lifecycle, separate from crew message lifecycle.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-251 - Coordination Mechanisms And Canonical Projection

```yaml
plan_unit_id: OSI-251
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Coordination mechanisms include legacy asynchronous context files, a cross-platform canonical coordination projection for
  active agents/files/operations/platform/timestamps optionally mirrored to active-agents.json for debugging, and durable
  attributable crew-board records for revisitable exchanges.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination mechanisms and projection boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-225
- OSI-245
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Debug mirrors do not become canonical coordination stores.
- Shared files such as progress.txt, AGENTS.md, prd.json, active-agents.json, and agent-messages.json do not stand beside child-run/event-store records as peer runtime truth.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_mechanisms_canonical_projection
node_compile_hint:
  mode: coordination_mechanisms_canonical_projection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:8
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:15
preserved_exact_tokens:
- progress.txt
- AGENTS.md
- prd.json
- .puppet-master/state/active-agents.json
- .puppet-master/state/agent-messages.json
- ALL platforms
- Attributable crew message board
negative_constraints:
- active-agents.json is only an optional debug mirror and must not become canonical state.
- agent-messages.json is only an optional debug or interoperability mirror and must not become canonical persistence.
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions:
- Shared state files are context/mirror lineage, not canonical runtime truth.
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-252 - Provider-Bridge Coordination Boundary

```yaml
plan_unit_id: OSI-252
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  No same-platform shared thread/session coordination path is active; Codex and Copilot follow the same projected coordination
  contract and prompt-injection contract as Cursor, Claude, and Gemini.
gui_related: false
gui_classification_reason: >-
  This unit covers backend provider-bridge coordination boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-229
- OSI-251
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Same-platform and cross-platform coordination use canonical coordination state plus prompt injection.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: provider_bridge_coordination_boundary
node_compile_hint:
  mode: provider_bridge_coordination_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- No same-platform shared thread/session coordination path is active
- Codex
- Copilot
- canonical coordination state + prompt injection
negative_constraints: []
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-253 - Cross-Worktree Awareness

```yaml
plan_unit_id: OSI-253
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agents running in separate worktrees read shared main-repo state, read the projected active-agent state, write their own
  status through the same coordination path before starting work, and update active file/operation status during work.
gui_related: false
gui_classification_reason: >-
  This unit covers backend cross-worktree coordination behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-216
- OSI-225
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Cross-worktree workers use the shared projected coordination path for status awareness.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cross_worktree_awareness
node_compile_hint:
  mode: cross_worktree_awareness
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- separate worktrees
- main repo
- Write their own status
- Update status as they work
negative_constraints: []
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-254 - Coordination Prompt Injection Content

```yaml
plan_unit_id: OSI-254
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Coordination prompt injection includes active agents, files being modified, platform context, and task-specific conflict
  guidance such as avoiding a file until the active worker finishes.
gui_related: false
gui_classification_reason: >-
  This unit covers backend prompt context assembly and conflict guidance rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-227
- OSI-251
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Prompt examples are preserved as evidence and do not define hardcoded message text.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_prompt_injection_content
node_compile_hint:
  mode: coordination_prompt_injection_content
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- Active Agents
- Files Being Modified
- Your Task
- Avoid editing
negative_constraints: []
compatibility_only_notes:
- Prompt block is example evidence only.
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-255 - Cross-Platform Coordination Scenario Evidence

```yaml
plan_unit_id: OSI-255
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The Codex and Claude example demonstrates cross-platform coordination through registration, projected file-status updates,
  periodic reads, conflict avoidance, and unregistering after completion.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination scenario evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-253
- OSI-254
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- JSON examples are preserved as evidence and not as a final storage schema override.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cross_platform_coordination_scenario_evidence
node_compile_hint:
  mode: cross_platform_coordination_scenario_evidence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- rust-engineer-1.1.1
- test-automator-1.1.2
- active-agents.json
- Codex
- Claude Code
negative_constraints: []
compatibility_only_notes:
- JSON scenario block is example evidence only.
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-256 - Platform Field In Active-Agent Projection

```yaml
plan_unit_id: OSI-256
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Active-agent coordination projection includes a platform field so agents can see which platform other agents are using,
  alongside active agent ids, worktree paths, current operations, files being edited, and last update timestamps.
gui_related: false
gui_classification_reason: >-
  This unit covers backend projection fields rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-251
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Platform field behavior remains part of active-agent projection rather than GUI copy ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_field_active_agent_projection
node_compile_hint:
  mode: platform_field_active_agent_projection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- platform
- active_agents
- worktree_path
- last_update
- codex
- claude
negative_constraints: []
compatibility_only_notes:
- JSON block is example evidence only.
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-257 - ActiveAgent And Coordination State Data Model

```yaml
plan_unit_id: OSI-257
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  ActiveAgent, AgentCoordinationState, and AgentCoordinator preserve active-agent identity, role/type, platform, node/lane/run
  identity, worktree path, files being edited, current operation, start time, and last-update timestamp.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination data model fields rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-225
- OSI-256
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Data-model examples remain aligned with canonical coordination and runtime identity ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: activeagent_coordination_state_data_model
node_compile_hint:
  mode: activeagent_coordination_state_data_model
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- DRY:DATA:ActiveAgent
- agent_type
- run_id
- files_being_edited
- DRY:DATA:AgentCoordinator
- AgentCoordinationState
negative_constraints: []
compatibility_only_notes:
- Rust data model block is plan evidence and must reconcile with canonical storage/runtime owners before implementation.
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-258 - AgentCoordinator Construction And Registration API

```yaml
plan_unit_id: OSI-258
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  AgentCoordinator construction derives the active-agent debug/state path under .puppet-master/state/active-agents.json, and
  register_agent loads state, inserts by agent_id, updates last_updated with Utc::now(), and saves state while requiring the
  agent platform field to come from node_config.platform rather than a hardcoded platform.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordinator construction and registration API behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-257
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Registration preserves platform sourcing through node_config.platform and does not hardcode platforms.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agentcoordinator_construction_registration_api
node_compile_hint:
  mode: agentcoordinator_construction_registration_api
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- "new(project_root: &Path)"
- register_agent
- Utc::now()
- node_config.platform
- NEVER hardcode platform
- .puppet-master/state/active-agents.json
negative_constraints:
- Agent platform must not be hardcoded in registration.
compatibility_only_notes:
- active-agents.json path remains a projection/debug-path token and must not override canonical storage ownership.
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual after line 3828.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Models_System.md'
```

### OSI-259 - Partial Status Update API Opening

```yaml
plan_unit_id: OSI-259
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Batch 131 preserves only the opening signature and first state-load line for update_agent_status, including agent_id,
  files_being_edited, current_operation, and let mut state = self.load_state().await?; complete status-update behavior remains
  residual until the next bounded window covers line 3829 onward.
gui_related: false
gui_classification_reason: >-
  This unit covers a backend coordination API opening rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-258
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- This unit does not claim complete update_agent_status behavior before source line 3829 is atomized.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, or implementation files are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: partial_status_update_api_opening
node_compile_hint:
  mode: partial_status_update_api_opening
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- update_agent_status
- files_being_edited
- current_operation
- "let mut state = self.load_state().await?"
negative_constraints:
- Do not treat this partial opening as complete update_agent_status behavior.
compatibility_only_notes:
- Batch 131 covers S0142 only through source line 3828; the S0142 tail remains residual from line 3829.
stale_retired_dispositions: []
owner_boundary_notes:
- Residual cursor remains inside orchestrator-subagent-integration-S0142 at source line 3829.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-260 - Complete Status Update Mutation

```yaml
plan_unit_id: OSI-260
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  update_agent_status completes mutation of the active agent record by updating files_being_edited, current_operation,
  last_update, state.last_updated, saving state, and returning an error when the agent_id is absent.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination state mutation rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-259
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Missing agent_id is not treated as a successful status update.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: complete_status_update_mutation
node_compile_hint:
  mode: complete_status_update_mutation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- active_agents.get_mut(agent_id)
- save_state
- Err(anyhow!("Agent {} not found", agent_id))
negative_constraints:
- Do not treat a missing agent as successful.
compatibility_only_notes:
- Rust snippet is plan evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestration owns behavior; storage owns persistence details.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-261 - Agent Unregistration

```yaml
plan_unit_id: OSI-261
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Completed agents are unregistered by removing agent_id from active_agents, refreshing last_updated with Utc::now(), and
  saving coordination state.
gui_related: false
gui_classification_reason: >-
  This unit covers backend agent lifecycle cleanup rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-258
- OSI-260
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Completed agents do not remain active.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_unregistration
node_compile_hint:
  mode: agent_unregistration
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- unregister_agent
- active_agents.remove
- Utc::now()
negative_constraints:
- Completed agents must not remain active.
compatibility_only_notes:
- Rust snippet is plan evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestration lifecycle owns unregister timing.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-262 - Coordination Context Active-Agent Prompt Block

```yaml
plan_unit_id: OSI-262
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  get_coordination_context builds an **Active Agents:** prompt section and derives platform display names through
  platform_specs::display_name_for(agent.platform), never hardcoding platform names.
gui_related: false
gui_classification_reason: >-
  This unit covers backend prompt-context assembly and platform display-name sourcing rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-254
- OSI-256
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Platform display names are sourced from platform_specs rather than hardcoded.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_context_active_agent_prompt_block
node_compile_hint:
  mode: coordination_context_active_agent_prompt_block
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- DRY:FN:get_coordination_context
- "**Active Agents:**"
- format_duration(age)
- NEVER hardcode platform names
negative_constraints:
- Never hardcode platform names.
compatibility_only_notes:
- Prompt text is evidence unless adopted by the prompt owner.
stale_retired_dispositions: []
owner_boundary_notes:
- DRY and Models owners govern platform display names.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Models_System.md'
```

### OSI-263 - Files Being Modified Prompt Aggregation

```yaml
plan_unit_id: OSI-263
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Coordination context aggregates active files_being_edited from active agents, sorts and deduplicates the file list, and
  lists each file with the contributing agent ids.
gui_related: false
gui_classification_reason: >-
  This unit covers backend file-state aggregation for prompt context rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-257
- OSI-262
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Duplicate file entries are avoided in the prompt-context file list.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: files_being_modified_prompt_aggregation
node_compile_hint:
  mode: files_being_modified_prompt_aggregation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- "**Files Being Modified:**"
- sort()
- dedup()
- file.display()
- agents.join(", ")
negative_constraints:
- Avoid duplicate file entries.
compatibility_only_notes:
- Prompt format is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestration consumes file state; storage owns durable record details.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-264 - Load State And Prune Stale Active Agents

```yaml
plan_unit_id: OSI-264
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  load_state reads and deserializes coordination state when present, prunes active-agent projection entries whose last_update
  is older than one hour, saves pruned state, or returns an empty state when no state file exists.
gui_related: false
gui_classification_reason: >-
  This unit covers backend projection loading and stale active-agent cleanup rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-257
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Active-agent projection pruning must not retire unresolved blocker or message-board threads.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: load_state_prune_stale_active_agents
node_compile_hint:
  mode: load_state_prune_stale_active_agents
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- serde_json::from_str
- chrono::Duration::hours(1)
- last_update > cutoff
- HashMap::new()
- Prune stale agents (no update in last hour)
negative_constraints:
- Pruning active-agent projection must not retire unresolved blocker or message-board threads.
compatibility_only_notes:
- Projection cleanup is not durable-message retention policy.
stale_retired_dispositions:
- Stale active-agent pruning is projection cleanup only.
owner_boundary_notes:
- Storage owns canonical persistence semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-265 - Save Coordination State Serialization

```yaml
plan_unit_id: OSI-265
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  save_state creates the state directory, pretty-serializes coordination state, writes the state file, and completes the
  coordinator implementation example.
gui_related: false
gui_classification_reason: >-
  This unit covers backend serialization evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-264
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Serialization/path details remain evidence until reconciled with storage ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: save_coordination_state_serialization
node_compile_hint:
  mode: save_coordination_state_serialization
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- std::fs::create_dir_all
- serde_json::to_string_pretty
- std::fs::write
negative_constraints: []
compatibility_only_notes:
- Implementation example only; storage path ownership remains external.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage path ownership remains external to this placement example.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-266 - Duration Formatting Helper Evidence

```yaml
plan_unit_id: OSI-266
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  format_duration renders active-agent age for prompt context as seconds, minutes, or hours plus minutes, and closes the
  coordination code example.
gui_related: false
gui_classification_reason: >-
  This unit covers backend prompt helper evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-262
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Helper formatting remains evidence for prompt-context generation, not mandatory UI copy.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: duration_formatting_helper_evidence
node_compile_hint:
  mode: duration_formatting_helper_evidence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- format_duration
- '"{}s"'
- '"{}m"'
- '"{}h {}m"'
negative_constraints: []
compatibility_only_notes:
- Helper snippet is plan evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Prompt formatting owner consumes this evidence where appropriate.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-267 - Orchestrator Pre-Execution Registration

```yaml
plan_unit_id: OSI-267
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Before node execution, the orchestrator creates AgentCoordinator and registers an ActiveAgent with agent identity, platform
  from node_config.platform, run/worktree fields, initial operation, and timestamps.
gui_related: false
gui_classification_reason: >-
  This unit covers backend orchestrator runtime integration rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-258
- OSI-256
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Registration must not hardcode platform identity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_pre_execution_registration
node_compile_hint:
  mode: orchestrator_pre_execution_registration
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- src/core/orchestrator.rs
- AgentCoordinator::new
- node_config.platform
- get_node_worktree
- Starting node {}
negative_constraints:
- Do not hardcode platform.
compatibility_only_notes:
- Rust snippet is plan evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator runtime integration owns pre-execution registration timing.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-268 - Prompt Injection From Coordination Context

```yaml
plan_unit_id: OSI-268
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The orchestrator obtains coordination_context and appends it to the prompt only when the context is non-empty, preserving
  the source typo format!"{}\n\n{}" as evidence rather than compilable code.
gui_related: false
gui_classification_reason: >-
  This unit covers backend prompt assembly rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-262
- OSI-254
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Empty coordination context does not alter the prompt.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: prompt_injection_from_coordination_context
node_compile_hint:
  mode: prompt_injection_from_coordination_context
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- get_coordination_context
- enhanced_prompt
- 'format!"{}\n\n{}"'
negative_constraints:
- Empty context should not alter the prompt.
compatibility_only_notes:
- Preserve the syntax typo as source evidence, not compilable syntax.
stale_retired_dispositions: []
owner_boundary_notes:
- Prompt contract owner consumes this behavior where applicable.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-269 - Execution Update And Unregister Lifecycle

```yaml
plan_unit_id: OSI-269
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  During execution, coordination status may update periodically or from file-operation signals, and after execution the agent
  unregisters; current fallback evidence updates on node completion.
gui_related: false
gui_classification_reason: >-
  This unit covers backend execution lifecycle and cleanup rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-260
- OSI-261
- OSI-267
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Completed agents do not remain registered.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: execution_update_unregister_lifecycle
node_compile_hint:
  mode: execution_update_unregister_lifecycle
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- update status periodically
- platform-specific hooks
- unregister_agent
- For now, update on node completion
negative_constraints:
- Do not leave completed agents registered.
compatibility_only_notes:
- Current fallback update-on-completion wording is source evidence pending richer event integration.
stale_retired_dispositions: []
owner_boundary_notes:
- Executor hooks remain adjacent owners for file-operation signals.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-270 - Provider Coordination Model

```yaml
plan_unit_id: OSI-270
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  All platforms use the canonical coordination projection, optional active-agents.json debug mirror, shared schema,
  direct-provider runtime path, and the same prompt contract; provider coordination does not permit local CLI bridge reuse or
  shared SDK threads/sessions.
gui_related: false
gui_classification_reason: >-
  This unit covers backend provider coordination boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-251
- OSI-252
- OSI-254
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Provider coordination does not allow local CLI bridge or shared SDK threads/sessions.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: provider_coordination_model
node_compile_hint:
  mode: provider_coordination_model
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- Canonical mode
- active-agents.json
- no local CLI bridge
- no SDK threads/sessions
negative_constraints:
- No local CLI bridge or shared SDK sessions/threads.
compatibility_only_notes:
- Debug mirror is not the source of truth.
stale_retired_dispositions: []
owner_boundary_notes:
- Executor/provider boundary owns runtime path details.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-271 - Coordination Modes And Hook Enrichment

```yaml
plan_unit_id: OSI-271
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  File-based coordination is always on for orchestrator-managed runs, while platform-native hooks are optional enrichments
  that improve update fidelity without replacing file-based coordination state as the source of truth.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination mode and hook adapter boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-270
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Platform-native hooks do not replace canonical file/projection state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_modes_hook_enrichment
node_compile_hint:
  mode: coordination_modes_hook_enrichment
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- File-based coordination (canonical)
- Always on
- Platform-native hooks
- single source of coordination truth
negative_constraints:
- Hooks must not replace canonical file/projection state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestration and platform adapters share enrichment boundaries.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-272 - Coordination Benefit Examples

```yaml
plan_unit_id: OSI-272
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Coordination rationale examples preserve reduced conflicts, better context, efficient collaboration, reduced false alarms,
  and platform-neutral deterministic replay benefits.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination rationale rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-271
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Rationale examples are not required literal prompt copy.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_benefit_examples
node_compile_hint:
  mode: coordination_benefit_examples
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- Reduced conflicts
- No "freaking out"
- Platform-neutral
- deterministic and replayable
negative_constraints:
- Benefit examples are not required literal prompt copy.
compatibility_only_notes:
- Rationale/evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestration rationale only; implementation detail remains elsewhere.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-273 - Coordination State Update Cadence

```yaml
plan_unit_id: OSI-273
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agents register before execution, update coordination state during execution about every 30 seconds or when file operations
  occur with files/current operation/progress, and unregister after execution.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination update cadence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-260
- OSI-261
- OSI-269
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- No stale active entry remains after execution completes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_state_update_cadence
node_compile_hint:
  mode: coordination_state_update_cadence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- every 30 seconds
- Files being edited
- Current operation
- Progress updates
negative_constraints:
- No stale active entry after execution.
compatibility_only_notes:
- Cadence is plan evidence pending runtime tuning.
stale_retired_dispositions: []
owner_boundary_notes:
- Executor scheduling remains adjacent.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-274 - File Operation Extraction Sources

```yaml
plan_unit_id: OSI-274
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  File operations can be detected by parsing agent output, native PreToolUse/PostToolUse hooks where available, or
  Codex/Copilot normalized CLI stream or tool events.
gui_related: false
gui_classification_reason: >-
  This unit covers backend event extraction and provider adapter evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-273
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Platform enrichments do not replace canonical coordination state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: file_operation_extraction_sources
node_compile_hint:
  mode: file_operation_extraction_sources
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- Parse agent output
- PreToolUse
- PostToolUse
- Provider event adapters
- normalized CLI stream/tool events
negative_constraints:
- Platform enrichments do not replace canonical coordination state.
compatibility_only_notes:
- Adapter details must reconcile with executor and provider contracts.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider adapters own platform-specific extraction details.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-275 - Cross-Platform Flow Registration And Edit Update

```yaml
plan_unit_id: OSI-275
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The cross-platform flow example preserves Agent A registering as Codex, then updating files_being_edited and
  current_operation while editing src/api.rs.
gui_related: false
gui_classification_reason: >-
  This unit covers backend coordination scenario evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-270
- OSI-273
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Example ids and files remain evidence, not fixed implementation identifiers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cross_platform_flow_registration_edit_update
node_compile_hint:
  mode: cross_platform_flow_registration_edit_update
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- rust-engineer-1.1.1
- 'platform: "codex"'
- 'files_being_edited: ["src/api.rs"]'
negative_constraints:
- Example ids and file names are not fixed implementation identifiers.
compatibility_only_notes:
- Scenario evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestration examples preserve flow, not literal runtime ids.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-276 - Cross-Platform Reader Waits And Proceeds

```yaml
plan_unit_id: OSI-276
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agent B on Claude Code reads shared coordination state, receives active-agent context, waits or works elsewhere, and then
  proceeds after Agent A unregisters; canonical projection enables Codex/Claude cross-provider communication.
gui_related: false
gui_classification_reason: >-
  This unit covers backend cross-provider coordination behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-275
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Coordination context helps avoid simultaneous conflicting edits.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cross_platform_reader_waits_proceeds
node_compile_hint:
  mode: cross_platform_reader_waits_proceeds
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- test-automator
- Claude Code
- Wait for rust-engineer
- cross-platform communication
negative_constraints:
- Avoid simultaneous conflicting edits.
compatibility_only_notes:
- Prompt example is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestration coordination owns the conflict-avoidance behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-277 - Platform Runner Coordination Contract

```yaml
plan_unit_id: OSI-277
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  All platform runners read and update canonical coordination state, consume the same prompt injection contract, avoid shared
  provider sessions or threads, and keep fresh-process isolation per iteration.
gui_related: false
gui_classification_reason: >-
  This unit covers backend platform runner coordination contracts rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-270
- OSI-271
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Provider-bridge wording does not permit local CLI bridge reuse or shared sessions/threads.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_runner_coordination_contract
node_compile_hint:
  mode: platform_runner_coordination_contract
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- All platform runners (Cursor, Codex, Claude, Gemini, Copilot)
- No shared provider sessions/threads
- fresh-process isolation
negative_constraints:
- No shared provider sessions or threads.
compatibility_only_notes:
- Provider-bridge wording is integration-layer terminology, not local CLI bridge permission.
stale_retired_dispositions: []
owner_boundary_notes:
- Executor/provider runtime owns platform-runner details.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-278 - Agent Coordination Implementation Placement Notes

```yaml
plan_unit_id: OSI-278
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agent coordination implementation notes identify future src/core/agent_coordination.rs placement, AgentCoordinator,
  prompt injection, provider-agnostic status updates, and register/update/unregister timing.
gui_related: false
gui_classification_reason: >-
  This unit covers backend implementation placement notes rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-260
- OSI-262
- OSI-267
- OSI-277
unblocks: []
acceptance_criteria:
- Covered source lines remain losslessly available for exact-text audit.
- Plan standardization does not create implementation files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_coordination_implementation_placement_notes
node_compile_hint:
  mode: agent_coordination_implementation_placement_notes
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0142
preserved_exact_tokens:
- src/core/agent_coordination.rs
- AgentCoordinator
- provider-agnostic
- Register agent before execution
negative_constraints:
- Plan standardization must not create implementation files.
compatibility_only_notes:
- Future placement note only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plan document records implementation surface without creating code.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-279 - Crew Mode Canonical Rules

```yaml
plan_unit_id: OSI-279
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Crew mode is a multi-model coordination overlay over child runs: members are child runs, model/provider diversity is the
  default distinguishing axis, the same task and often the same Persona are preserved, member coordination uses an attributable
  crew board, the parent owns final synthesis and user-facing escalation, and crew shared state is explicit coordination state
  rather than hidden long-term member memory. Crew defaults live in model/runtime settings, first invocation confirms default
  crew use, member provider/runtime mapping is disclosed after model choice, and any Copilot-configured member applies a
  crew-level provider constraint.
gui_related: false
gui_classification_reason: >-
  This unit covers crew orchestration defaults and provider/runtime coordination rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-245
- OSI-251
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- The covered orchestrator/subagent fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_mode_canonical_rules
node_compile_hint:
  mode: crew_mode_canonical_rules
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0143
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0148
preserved_exact_tokens:
- Puppet Master Crews (Teams/Fleets Alternative)
- members are child runs
- model/provider diversity
- same Persona
- attributable crew board
- not hidden long-term member memory
- member's provider/runtime surface
- member’s provider/runtime surface
negative_constraints:
- Crew shared state must not become hidden long-term member memory.
compatibility_only_notes:
- Duplicate source coverage preserves both apostrophe variants from the repeated block.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator owns crew coordination; model/runtime settings and provider docs own runtime choice surfaces.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/CLI_Bridged_Providers.md'
```

### OSI-280 - Gap-Era Crew Notes Retired

```yaml
plan_unit_id: OSI-280
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Gap-era crew notes are retired as canonical guidance; live crew rules resolve through orchestrator contracts rather than
  illustrative fallback numbers, and superseded gap-era examples MUST NOT be implemented as live crew canon.
gui_related: false
gui_classification_reason: This unit covers stale crew-plan disposition rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-279
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- Retired gap-era examples remain explicitly noncanonical.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gap_era_crew_notes_retired
node_compile_hint:
  mode: gap_era_crew_notes_retired
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0144
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0149
preserved_exact_tokens:
- Gaps and Potential Issues for Crews Feature
- Gap-era crew notes
- retired as canonical guidance
- MUST NOT be implemented as live crew canon
negative_constraints:
- Superseded gap-era examples MUST NOT be implemented as live crew canon.
compatibility_only_notes: []
stale_retired_dispositions:
- Gap-era crew notes in this section are retired as canonical guidance.
owner_boundary_notes:
- Live crew rules resolve through orchestrator contracts and referenced owner docs.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Crosswalk.md'
```

### OSI-281 - ExecutionLimits Crew Admission Caps

```yaml
plan_unit_id: OSI-281
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Crew admission MUST use `executionLimits` as the sole live source for `maxConcurrentCrewsPerPlatform = 4`,
  `maxConcurrentAgentsPerCrew = 8`, `maxTotalActiveAgents = 32`, `maxNestingDepth = 4`, `maxTotalSpawnedAgents = 99`, and
  `maxToolRoundsPerAgent = 200`; availability checks may narrow admission based on support, saturation, quota posture, or
  policy, but they MUST fail closed rather than inventing alternate per-gap ceilings; the first `Canonical crew-cap and
  availability rules` section is the live anchor and duplicate crew-cap copies are retired source-lineage.
gui_related: false
gui_classification_reason: This unit covers runtime admission limits rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-279
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- Later illustrative examples cannot widen or replace `executionLimits`.
- Duplicate crew-cap subsections are source-lineage only and do not become peer anchors.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: executionlimits_crew_admission_caps
node_compile_hint:
  mode: executionlimits_crew_admission_caps
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0145
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0150
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:12
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:19
preserved_exact_tokens:
- executionLimits
- §Subagent Configuration executionLimits (this file)
- corrupted YAML block
- crew-cap subsection
- duplicated verbatim twice
- maxConcurrentCrewsPerPlatform = 4
- maxConcurrentAgentsPerCrew = 8
- maxTotalActiveAgents = 32
- maxNestingDepth = 4
- maxTotalSpawnedAgents = 99
- maxToolRoundsPerAgent = 200
negative_constraints:
- Later illustrative examples in this file MUST NOT widen or replace those values.
- Availability checks MUST fail closed rather than inventing alternate per-gap ceilings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The first `Canonical crew-cap and availability rules` section is the live same-file executionLimits anchor; duplicate crew-cap copies are retired lineage.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md'
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-282 - Crew Lifecycle Uses Parent/Child Runtime Contracts

```yaml
plan_unit_id: OSI-282
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Crew lifecycle, timeout propagation, cancellation, and cleanup follow canonical parent/child orchestration and runtime
  lifecycle contracts.
gui_related: false
gui_classification_reason: This unit covers runtime lifecycle behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-279
- OSI-281
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- Crew lifecycle does not define alternate crew-only runtime paths.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_lifecycle_parent_child_runtime_contracts
node_compile_hint:
  mode: crew_lifecycle_parent_child_runtime_contracts
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0146
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0151
preserved_exact_tokens:
- Crew lifecycle, timeout propagation, cancellation, and cleanup
- parent/child orchestration
- runtime lifecycle contracts
negative_constraints:
- This section no longer defines separate crew-only timeout ceilings, alternate cleanup paths, or stale concurrency examples.
compatibility_only_notes: []
stale_retired_dispositions:
- Separate crew-only timeout ceilings, alternate cleanup paths, and stale concurrency examples are retired.
owner_boundary_notes:
- Parent/child orchestration and runtime lifecycle contracts remain the owners for lifecycle semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
```

### OSI-283 - Crew GUI And Assistant Surfaces Are Consumer Projections

```yaml
plan_unit_id: OSI-283
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  GUI and future Assistant-surface affordances for crews disclose canonical crew/member state and runtime ceilings, but they do
  not become the owner of orchestration authority.
gui_related: true
gui_classification_reason: This unit covers user-visible GUI and Assistant-surface crew projections.
split_recommended: false
depends_on:
- OSI-279
- OSI-281
- OSI-282
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- GUI and Assistant surfaces remain consumer projections of orchestrator-owned state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_gui_assistant_consumer_projection
node_compile_hint:
  mode: crew_gui_assistant_consumer_projection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0146
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0151
preserved_exact_tokens:
- GUI and future Assistant-surface affordances
- disclose canonical crew/member state
- runtime ceilings
- do not become the owner of orchestration authority
negative_constraints:
- GUI and Assistant surfaces must not become the owner of orchestration authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI and Assistant surfaces consume canonical crew/member state; orchestrator retains authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md'
```

### OSI-284 - Future Assistant Crew Surface Guardrails

```yaml
plan_unit_id: OSI-284
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  User-initiated crews remain future Assistant functionality, and when that surface lands, platform selection, queueing, and
  subagent admission still resolve through orchestrator-owned ceilings, compatibility checks, and `executionLimits`.
gui_related: false
gui_classification_reason: This unit covers future-surface governance guardrails rather than GUI layout or presentation.
split_recommended: false
depends_on:
- OSI-279
- OSI-281
- OSI-283
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- Duplicate source spans are recorded as duplicate coverage and do not create separate implementation scope.
- Future Assistant UX cannot reintroduce alternative crew defaults.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: future_assistant_crew_surface_guardrails
node_compile_hint:
  mode: future_assistant_crew_surface_guardrails
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0147
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0152
preserved_exact_tokens:
- User-initiated crews
- future Assistant functionality
- executionLimits
- 20 total crews
- 3 crews per subagent type
- max 3 crews per subagent type
negative_constraints:
- Future UX MUST NOT reintroduce alternative defaults such as "20 total crews", "3 crews per subagent type", or legacy wording.
compatibility_only_notes:
- User-initiated crews remain future Assistant functionality.
stale_retired_dispositions: []
owner_boundary_notes:
- Future Assistant platform selection and queueing still resolve through orchestrator-owned ceilings and compatibility checks.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Crosswalk.md'
```

### OSI-285 - Future Crew Template Save Surface

```yaml
plan_unit_id: OSI-285
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: When the Assistant feature is added, users may save crew configurations as templates or presets.
gui_related: true
gui_classification_reason: This unit covers a future user-visible Assistant template surface.
split_recommended: false
depends_on:
- OSI-284
unblocks: []
acceptance_criteria:
- Covered source span remains losslessly available for exact-text audit.
- The future Assistant template surface is represented without creating implementation work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: future_crew_template_save_surface
node_compile_hint:
  mode: future_crew_template_save_surface
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Enhancement #1: Crew templates and presets
- when Assistant feature is added
- save crew configurations as templates
negative_constraints: []
compatibility_only_notes:
- Future Assistant feature only.
stale_retired_dispositions: []
owner_boundary_notes:
- Assistant/Final GUI own the user-visible save surface; orchestrator owns crew admission semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-286 - CrewTemplate Schema Example

```yaml
plan_unit_id: OSI-286
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves the `CrewTemplate` example with `name`, `subagents`, `default_task`, and `description`, plus the
  example template names "Full Stack Crew" and "Security Review Crew".
gui_related: false
gui_classification_reason: This unit covers a schema/example snippet rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-285
unblocks: []
acceptance_criteria:
- Covered source snippet remains losslessly available for exact-text audit.
- The Rust snippet is preserved as plan evidence only.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crewtemplate_schema_example
node_compile_hint:
  mode: crewtemplate_schema_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- CrewTemplate
- name
- subagents
- default_task
- description
- Full Stack Crew
- Security Review Crew
negative_constraints:
- The Rust snippet must not be treated as created source code.
compatibility_only_notes:
- Rust snippet and example names are plan evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-287 - Crew Performance Metrics

```yaml
plan_unit_id: OSI-287
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Crew performance may track and display average completion time, success rate, member utilization, and platform usage
  distribution.
gui_related: true
gui_classification_reason: This unit includes user-visible metric display as well as metric collection.
split_recommended: true
depends_on:
- OSI-279
unblocks: []
acceptance_criteria:
- Covered source span remains losslessly available for exact-text audit.
- Display ownership remains separate from durable metric ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_performance_metrics
node_compile_hint:
  mode: crew_performance_metrics
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Enhancement #2: Crew performance metrics
- Average time to complete tasks
- Success rate
- Member utilization
- Platform usage distribution
negative_constraints: []
compatibility_only_notes:
- Future enhancement source coverage only until metric owners accept durable collection semantics.
stale_retired_dispositions: []
owner_boundary_notes:
- Usage/storage own durable metrics; Final GUI owns display projections.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-288 - Crew Learning And Adaptation

```yaml
plan_unit_id: OSI-288
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Future crew learning may track effective subagent combinations, suggest optimal crew compositions, and adapt crew behavior
  based on success patterns.
gui_related: false
gui_classification_reason: This unit covers backend learning/adaptation behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-279
unblocks: []
acceptance_criteria:
- Covered source span remains losslessly available for exact-text audit.
- Learning/adaptation remains future source-lineage coverage until storage, privacy, and policy owners accept live semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_learning_and_adaptation
node_compile_hint:
  mode: crew_learning_and_adaptation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Enhancement #3: Crew learning and adaptation
- Track which subagent combinations work best
- Suggest optimal crew compositions
- Adapt crew behavior based on success patterns
negative_constraints: []
compatibility_only_notes:
- Future enhancement source-lineage coverage; storage/privacy/policy owner acceptance is required before live canon.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage, privacy, and policy owners must adjudicate durable learning semantics before implementation.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-289 - Crew Scheduling By Tier And Quota

```yaml
plan_unit_id: OSI-289
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Queued crews may be prioritized by tier dependency and scheduled against platform quota availability.
gui_related: false
gui_classification_reason: This unit covers scheduling policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-281
unblocks: []
acceptance_criteria:
- Covered source span remains losslessly available for exact-text audit.
- Scheduling remains subordinate to `executionLimits` and policy admission.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_scheduling_by_tier_and_quota
node_compile_hint:
  mode: crew_scheduling_by_tier_and_quota
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Enhancement #4: Crew scheduling and prioritization
- Prioritize crews by tier dependency
- Schedule crews based on platform quota availability
negative_constraints:
- Crew scheduling must not bypass `executionLimits` or policy admission.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator admission and platform quota policy remain authoritative.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-290 - User Reorders Queued Crew Execution

```yaml
plan_unit_id: OSI-290
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: When the Assistant feature is added, users may reorder crew execution.
gui_related: true
gui_classification_reason: This unit covers a future user-visible queue reordering affordance.
split_recommended: false
depends_on:
- OSI-284
- OSI-289
unblocks: []
acceptance_criteria:
- Covered source span remains losslessly available for exact-text audit.
- User reordering remains a future Assistant surface and does not override orchestrator admission.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: user_reorders_queued_crew_execution
node_compile_hint:
  mode: user_reorders_queued_crew_execution
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Allow users to reorder crew execution
- when Assistant feature is added
negative_constraints:
- User-visible reordering must not replace orchestrator admission authority.
compatibility_only_notes:
- Future Assistant feature only.
stale_retired_dispositions: []
owner_boundary_notes:
- Assistant/Final GUI own the user-visible reorder control; orchestrator still owns admission.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-291 - Crew-Aware PRD Plan Generation Hints

```yaml
plan_unit_id: OSI-291
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  PRD and plan generation may include crew recommendations, task/subtask crew hints, crew template references, and
  orchestrator consumption of crew hints when appropriate.
gui_related: false
gui_classification_reason: This unit covers PRD/plan metadata and orchestrator consumption rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-279
- OSI-284
unblocks: []
acceptance_criteria:
- Covered source span remains losslessly available for exact-text audit.
- Question-form gap language is preserved as deferred source-lineage, not a forced product decision.
- Automatic crew creation cannot bypass confirmation or admission constraints.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_aware_prd_plan_generation_hints
node_compile_hint:
  mode: crew_aware_prd_plan_generation_hints
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Gap #52: Crew integration with PRD/plan generation
- Crew-aware plan generation
- Plan annotations
- Crew templates in plans
- Orchestrator awareness
negative_constraints:
- Automatic crew creation must respect confirmation, admission, and `executionLimits`.
compatibility_only_notes:
- Question-form gap retained as deferred source-lineage until owner docs accept live behavior.
stale_retired_dispositions: []
owner_boundary_notes:
- PRD/interview plan owners must accept schema semantics before crew hints become live schema canon.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-292 - Crew Recommendation PRD JSON Example

```yaml
plan_unit_id: OSI-292
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves the `prd.json` example containing `crew_recommendation`, `suggested`, `subagents`, and `rationale`
  for `ST-001-001-001`.
gui_related: false
gui_classification_reason: This unit covers a JSON example rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-291
unblocks: []
acceptance_criteria:
- Covered JSON example remains losslessly available for exact-text audit.
- The JSON example is not promoted into schema canon by this standardization batch.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_recommendation_prd_json_example
node_compile_hint:
  mode: crew_recommendation_prd_json_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- prd.json
- crew_recommendation
- suggested
- subagents
- rationale
- ST-001-001-001
- Implement authentication API
negative_constraints:
- The JSON example must not be treated as live schema canon by this batch.
compatibility_only_notes:
- JSON is example evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- PRD schema ownership remains outside this source-preserving example.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-293 - Interview Phase Crew Uses

```yaml
plan_unit_id: OSI-293
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Interview phases may use crews internally for architecture, research, document generation, and cross-phase coordination.
gui_related: false
gui_classification_reason: This unit covers interview-flow orchestration rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-135
- OSI-279
unblocks: []
acceptance_criteria:
- Covered source span remains losslessly available for exact-text audit.
- Interview-specific crew behavior remains distinct from execution-tier crew behavior.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_phase_crew_uses
node_compile_hint:
  mode: interview_phase_crew_uses
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Gap #53: Crew coordination with interview phases
- Interview phase crews
- Research crews
- Document generation crews
- Cross-phase coordination
negative_constraints:
- Interview-flow crews must not be merged with execution-tier crew canon.
compatibility_only_notes:
- Question-form gap retained as source-lineage coverage pending interview owner acceptance.
stale_retired_dispositions: []
owner_boundary_notes:
- interview-subagent-integration remains the phase-specific owner for interview crew behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-294 - Research Coverage Caveat

```yaml
plan_unit_id: OSI-294
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Research crews must record coverage limits when comparator products have mixed or limited public source availability, use
  official `/docs`, public community feedback, and `/web` evidence as fallback, and maximize clone-based or source-level
  inspection through GitHub/web tools wherever cloning is possible or meaningful.
gui_related: false
gui_classification_reason: This unit covers research evidence policy rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-293
unblocks: []
acceptance_criteria:
- Covered source line remains losslessly available for exact-text audit.
- Research outputs cannot imply full source coverage when the source is not available.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: research_coverage_caveat
node_compile_hint:
  mode: research_coverage_caveat
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Research /coverage caveat
- official `/docs`
- public community feedback
- '`/web` evidence'
- GitHub/web tools
negative_constraints:
- Research crews must not imply full source coverage when comparator source availability is mixed or limited.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Research evidence policy must preserve coverage limits and source availability caveats.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-295 - Interview Crews Are Separate From Execution-Tier Crews

```yaml
plan_unit_id: OSI-295
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Interview crews are separate from orchestrator-initiated crews for execution tiers.
gui_related: false
gui_classification_reason: This unit covers orchestration boundary semantics rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-293
unblocks: []
acceptance_criteria:
- Covered source line remains losslessly available for exact-text audit.
- Interview crew behavior remains separate from execution-tier crew behavior.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: interview_crews_separate_from_execution_tier_crews
node_compile_hint:
  mode: interview_crews_separate_from_execution_tier_crews
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- separate from orchestrator-initiated crews
- execution tiers
- Interview crews are for interview flow only
negative_constraints:
- Do not merge interview-flow crew behavior with execution-tier crew canon.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Interview crew behavior and execution-tier crew behavior retain separate owner contexts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-296 - Crew Value Rationale

```yaml
plan_unit_id: OSI-296
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves rationale for cross-platform communication, orchestrator visibility, platform-agnostic behavior,
  enhanced coordination, and a unified interface across supported providers.
gui_related: false
gui_classification_reason: This unit preserves rationale text rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-279
- OSI-245
unblocks: []
acceptance_criteria:
- Covered rationale remains losslessly available for exact-text audit.
- Rationale examples are not promoted into executable work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: crew_value_rationale
node_compile_hint:
  mode: crew_value_rationale
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Cross-platform communication
- Orchestrator visibility
- Platform-agnostic
- Enhanced coordination
- Unified interface
negative_constraints: []
compatibility_only_notes:
- Rationale evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-297 - Native Teams/Fleets Comparison Evidence

```yaml
plan_unit_id: OSI-297
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves comparison tokens for Claude Code Teams, Copilot Fleets, Puppet Master Communication, cross-platform
  support, orchestrator visibility, agent-to-agent messaging, file-based operation, and CLI-only operation.
gui_related: false
gui_classification_reason: This unit preserves comparison evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-296
unblocks: []
acceptance_criteria:
- Covered comparison table remains losslessly available for exact-text audit.
- External-product comparison evidence is not treated as external product canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: native_teams_fleets_comparison_evidence
node_compile_hint:
  mode: native_teams_fleets_comparison_evidence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Claude Code Teams
- Copilot Fleets
- Puppet Master Communication
- Cross-platform
- Orchestrator visibility
- Agent-to-agent messaging
- File-based (no API)
- Works with CLI-only
negative_constraints: []
compatibility_only_notes:
- Comparison table is source evidence only and not external product canon.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-298 - Agent Message Board Architecture Example

```yaml
plan_unit_id: OSI-298
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The communication system example extends coordination state with a message board/queue, preserving `.puppet-master/state/active-agents.json`
  as an optional debug mirror and `.puppet-master/state/agent-messages.json` as an optional debug or interoperability mirror
  for agent-to-agent message records.
gui_related: false
gui_classification_reason: This unit covers backend coordination-state architecture rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-245
- OSI-246
unblocks: []
acceptance_criteria:
- Covered architecture example remains losslessly available for exact-text audit.
- This duplicate-era example does not narrow prior canonical message-board coverage.
- This example must not promote active-agents.json or agent-messages.json into canonical persistence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_message_board_architecture_example
node_compile_hint:
  mode: agent_message_board_architecture_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:8
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:15
preserved_exact_tokens:
- .puppet-master/state/
- active-agents.json
- Optional debug mirror
- agent-messages.json
- agent-to-agent messages
negative_constraints:
- The optional active-agents debug mirror must not become the coordination source of truth.
- The optional agent-messages mirror must not become the canonical persistence store.
compatibility_only_notes:
- Duplicate message-board architecture example; do not narrow OSI-245.
- "`.puppet-master/state/agent-messages.json` is compatibility/debug mirror lineage."
stale_retired_dispositions: []
owner_boundary_notes:
- Storage owns durable schema semantics; orchestrator owns coordination use.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-299 - AgentMessage Structure Example

```yaml
plan_unit_id: OSI-299
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves `AgentMessage` fields including `message_id`, `from_agent_id`, `from_platform`, `to_agent_id`,
  `to_agent_type`, `to_node_id`, `message_type`, `subject`, `content`, `context`, `thread_id`, `in_reply_to`, `created_at`,
  `read_by`, and `resolved`.
gui_related: false
gui_classification_reason: This unit covers a backend message schema example rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
unblocks: []
acceptance_criteria:
- Covered Rust structure example remains losslessly available for exact-text audit.
- The example must not narrow the canonical message schema already covered by earlier PlanUnits.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agentmessage_structure_example
node_compile_hint:
  mode: agentmessage_structure_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- AgentMessage
- message_id
- from_agent_id
- from_platform
- to_agent_id
- to_agent_type
- to_node_id
- read_by
- resolved
negative_constraints:
- The Rust snippet must not narrow canonical message-board schema coverage.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Earlier canonical message-board PlanUnits retain lane/priority and lifecycle semantics not repeated by this example.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-300 - MessageType Enum Example

```yaml
plan_unit_id: OSI-300
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves message type variants `Question`, `Answer`, `Update`, `Request`, `Decision`, `Warning`, and
  `Announcement`.
gui_related: false
gui_classification_reason: This unit covers a backend enum example rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
unblocks: []
acceptance_criteria:
- Covered enum example remains losslessly available for exact-text audit.
- The enum snippet is not created as implementation code by this batch.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: messagetype_enum_example
node_compile_hint:
  mode: messagetype_enum_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- MessageType
- Question
- Answer
- Update
- Request
- Decision
- Warning
- Announcement
negative_constraints:
- The enum snippet must not be treated as created implementation code.
compatibility_only_notes:
- Enum snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-301 - MessageContext And Board Example

```yaml
plan_unit_id: OSI-301
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves `MessageContext` fields `files_mentioned`, `operations_mentioned`, `node_id`, and `related_messages`,
  plus `AgentMessageBoard` fields `messages`, `last_updated`, and `schema_version`.
gui_related: false
gui_classification_reason: This unit covers backend message context and board structure rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
- OSI-250
unblocks: []
acceptance_criteria:
- Covered structure examples remain losslessly available for exact-text audit.
- Storage ownership of durable schema semantics is preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: messagecontext_and_board_example
node_compile_hint:
  mode: messagecontext_and_board_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- MessageContext
- files_mentioned
- operations_mentioned
- node_id
- related_messages
- AgentMessageBoard
- schema_version
negative_constraints: []
compatibility_only_notes:
- Structure snippets are evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage owns durable message-board schema semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-302 - Message Routing Modes

```yaml
plan_unit_id: OSI-302
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Messages route direct by `to_agent_id`, by type through `to_agent_type`, by node through `to_node_id`, or as broadcast
  when `to_agent_id`, `to_agent_type`, and `to_node_id` are all `None`.
gui_related: false
gui_classification_reason: This unit covers routing semantics rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-248
unblocks: []
acceptance_criteria:
- Covered routing example remains losslessly available for exact-text audit.
- This example must not narrow the richer canonical routing/lane coverage in earlier PlanUnits.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: message_routing_modes
node_compile_hint:
  mode: message_routing_modes
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Message routing
- Direct
- By type
- By node
- Broadcast
- to_agent_id = None
- to_agent_type = None
- to_node_id = None
negative_constraints:
- This example omits lane routing and must not narrow OSI-248.
compatibility_only_notes:
- Example routing list is source evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Earlier canonical routing PlanUnits retain lifecycle and lane/priority semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-303 - Help Request Message Example

```yaml
plan_unit_id: OSI-303
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves an example where `rust-engineer-1.1.1` on `Platform::Codex` asks `test-automator` for help writing
  tests for `POST /users` in `src/api.rs`.
gui_related: false
gui_classification_reason: This unit covers an agent-message example rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-302
unblocks: []
acceptance_criteria:
- Covered example remains losslessly available for exact-text audit.
- Example ids, files, and endpoints are not promoted into fixed product identifiers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: help_request_message_example
node_compile_hint:
  mode: help_request_message_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Agent asking for help
- rust-engineer-1.1.1
- Platform::Codex
- test-automator
- POST /users endpoint
- src/api.rs
negative_constraints:
- Example ids, files, and endpoints are examples only.
compatibility_only_notes:
- Rust message-posting snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-304 - Architecture Decision Message Example

```yaml
plan_unit_id: OSI-304
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves an example where `architect-reviewer-1.0` shares a `MessageType::Decision` to node `1.1` with the
  subject "Architecture decision: Use Actix-web for API server".
gui_related: false
gui_classification_reason: This unit covers an agent-message example rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-302
unblocks: []
acceptance_criteria:
- Covered example remains losslessly available for exact-text audit.
- The example does not mandate Actix-web or any fixed framework choice.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: architecture_decision_message_example
node_compile_hint:
  mode: architecture_decision_message_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Agent sharing a decision
- architect-reviewer-1.0
- MessageType::Decision
- Architecture decision: Use Actix-web for API server
- Actix-web
negative_constraints:
- Actix-web is example evidence, not a framework mandate.
compatibility_only_notes:
- Rust message-posting snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-305 - File Conflict Warning Example

```yaml
plan_unit_id: OSI-305
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The source preserves a direct warning example from `test-automator-1.1.2` to `rust-engineer-1.1.1` about `File conflict:
  src/api.rs`, including mentioned files, operations, `read_by`, and `resolved` fields.
gui_related: false
gui_classification_reason: This unit covers an agent-message conflict example rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-302
- OSI-250
unblocks: []
acceptance_criteria:
- Covered warning example remains losslessly available for exact-text audit.
- The example must not create fixed agent ids or file paths.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: file_conflict_warning_example
node_compile_hint:
  mode: file_conflict_warning_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Agent warning about conflicts
- test-automator-1.1.2
- rust-engineer-1.1.1
- File conflict: src/api.rs
- files_mentioned
- operations_mentioned
- read_by
- resolved
negative_constraints:
- Example ids and file paths are examples only.
compatibility_only_notes:
- Rust message-posting snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-306 - Orchestrator Message Monitoring

```yaml
plan_unit_id: OSI-306
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The orchestrator monitors messages to track agent communication, detect blockers, monitor decisions, and detect conflicts.
gui_related: false
gui_classification_reason: This unit covers orchestrator monitoring behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
- OSI-248
- OSI-250
unblocks: []
acceptance_criteria:
- Covered monitoring bullets remain losslessly available for exact-text audit.
- Orchestrator monitoring is represented without creating implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_message_monitoring
node_compile_hint:
  mode: orchestrator_message_monitoring
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Integration with orchestrator
- Track agent communication
- Detect blockers
- Monitor decisions
- Detect conflicts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator owns monitoring behavior; message-board storage owns durable records.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-307 - Communication Pattern GUI Insights

```yaml
plan_unit_id: OSI-307
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: GUI may provide insights showing agent communication patterns.
gui_related: true
gui_classification_reason: This unit covers a user-visible GUI insight projection.
split_recommended: false
depends_on:
- OSI-306
unblocks: []
acceptance_criteria:
- Covered GUI insight bullet remains losslessly available for exact-text audit.
- GUI insight presentation remains a consumer projection of orchestrator-supplied coordination state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: communication_pattern_gui_insights
node_compile_hint:
  mode: communication_pattern_gui_insights
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Provide insights
- communication patterns
- GUI
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI owns presentation; orchestrator supplies coordination/message state.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-308 - Agent Prompt Message Injection Introduction

```yaml
plan_unit_id: OSI-308
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Messages are injected into agent prompts as part of coordination context.
gui_related: false
gui_classification_reason: This unit covers prompt orchestration behavior rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-254
- OSI-302
unblocks: []
acceptance_criteria:
- Covered prompt-injection introduction remains losslessly available for exact-text audit.
- The Rust fence beginning at S0153 source line 4437 remains residual for the next bounded window and is not split mid-snippet.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_prompt_message_injection_introduction
node_compile_hint:
  mode: agent_prompt_message_injection_introduction
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Integration with agent prompts
- Messages are injected into agent prompts
- coordination context
negative_constraints:
- Do not treat the Rust fence beginning at source line 4437 as covered by this unit.
compatibility_only_notes:
- The prompt-injection code fence remains residual source-preserving coverage for the next batch.
stale_retired_dispositions: []
owner_boundary_notes:
- Prompt contract ownership remains with orchestrator/prompt pipeline consumers.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-309 - Prompt Message Injection Rust Example

```yaml
plan_unit_id: OSI-309
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the intact Rust example that loads `coordination_context`, gets messages for `agent_id` and `node_id`, formats
  `message_context`, and builds `enhanced_prompt` containing `**Messages from other agents:**`.
gui_related: false
gui_classification_reason: This unit covers prompt orchestration example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-308
- OSI-254
- OSI-302
unblocks: []
acceptance_criteria:
- Covered Rust snippet remains losslessly available for exact-text audit.
- The snippet remains example evidence and does not narrow the canonical prompt contract.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: prompt_message_injection_rust_example
node_compile_hint:
  mode: prompt_message_injection_rust_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- coordination_context
- get_messages_for_agent
- format_messages_for_prompt
- enhanced_prompt
- '**Messages from other agents:**'
negative_constraints:
- Example text must not hardcode or narrow the canonical prompt contract.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Earlier prompt and message-board PlanUnits retain canonical prompt-contract semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-310 - Agent Message Relevance Filters

```yaml
plan_unit_id: OSI-310
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Agent-local message views include messages addressed to `agent_id`, agent type, `node_id`, broadcast messages, and messages
  mentioning files the agent is working on.
gui_related: false
gui_classification_reason: This unit covers backend message filtering rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-248
- OSI-302
- OSI-253
unblocks: []
acceptance_criteria:
- Covered filtering prose and snippet remain losslessly available for exact-text audit.
- This example does not narrow richer canonical routing/lane coverage in earlier PlanUnits.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_message_relevance_filters
node_compile_hint:
  mode: agent_message_relevance_filters
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Messages addressed to their agent_id
- Messages addressed to their agent type
- Messages addressed to their node_id
- Broadcast messages
- Messages mentioning files they're working on
- files_being_edited
negative_constraints:
- This example omits lane routing and must not narrow OSI-248.
compatibility_only_notes:
- Filtering code is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Earlier canonical message-board routing PlanUnits retain lane and lifecycle semantics not repeated here.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-311 - Message Threading Fields

```yaml
plan_unit_id: OSI-311
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Threaded messages use `thread_id` to group related messages and `in_reply_to` to link replies so agents can follow
  conversation history.
gui_related: false
gui_classification_reason: This unit covers message threading metadata rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-250
unblocks: []
acceptance_criteria:
- Covered threading fields remain losslessly available for exact-text audit.
- Threading coverage reinforces existing message lifecycle canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: message_threading_fields
node_compile_hint:
  mode: message_threading_fields
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- thread_id
- in_reply_to
- conversation history
negative_constraints: []
compatibility_only_notes:
- Source-lineage reinforcement of existing lifecycle canon.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-312 - Message Lifecycle And Retention Caveat

```yaml
plan_unit_id: OSI-312
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Message lifecycle preserves Created, Read tracked in `read_by`, Replied through `in_reply_to`, Resolved, and Expired/archive
  behavior for old messages.
gui_related: false
gui_classification_reason: This unit covers backend message lifecycle and retention behavior rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-250
unblocks: []
acceptance_criteria:
- Covered lifecycle prose and archive snippet remain losslessly available for exact-text audit.
- Unresolved blocker or coordination-request threads remain visible until resolved or explicitly superseded.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: message_lifecycle_and_retention_caveat
node_compile_hint:
  mode: message_lifecycle_and_retention_caveat
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Created
- Read
- Replied
- Resolved
- Expired
- '>24 hours'
- archive.json
negative_constraints:
- Unresolved blocker or coordination-request threads must remain visible until resolved or explicitly superseded.
compatibility_only_notes:
- '`>24 hours`, archived/deleted behavior, and archive-file code remain source evidence and do not override OSI-250.'
stale_retired_dispositions: []
owner_boundary_notes:
- Durable lifecycle and retention semantics remain owned by canonical message-board/storage contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-313 - AgentCommunicator Placement And Paths Example

```yaml
plan_unit_id: OSI-313
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the `AgentCommunicator` example using `message_board_file`, `AgentCoordinator`, and `.puppet-master/state/agent-messages.json`,
  with load/save behavior analogous to coordination state locking as source-lineage example code, not as canonical persistence.
gui_related: false
gui_classification_reason: This unit covers backend placement and storage-path examples rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-245
- OSI-246
- OSI-251
unblocks: []
acceptance_criteria:
- Covered placement and path example remains losslessly available for exact-text audit.
- Implementation module/path tokens remain examples and do not create source files.
- message_board_file and .puppet-master/state/agent-messages.json remain compatibility-path examples only.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agentcommunicator_placement_and_paths_example
node_compile_hint:
  mode: agentcommunicator_placement_and_paths_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:8
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:15
preserved_exact_tokens:
- src/core/agent_communication.rs
- AgentCommunicator
- message_board_file
- AgentCoordinator
- .puppet-master/state/agent-messages.json
- load_message_board
- save_message_board
negative_constraints:
- Implementation module/path tokens are examples, not source-code creation.
- message_board_file must not become canonical persistence.
compatibility_only_notes:
- Rust snippet is evidence only.
- "`.puppet-master/state/agent-messages.json` is compatibility/debug mirror lineage."
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator owns communication use; storage owns durable record semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-314 - Post Message Validation And Persistence Example

```yaml
plan_unit_id: OSI-314
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  `post_message` preserves the DRY requirement to validate a subagent name with `subagent_registry::is_valid_subagent_name()`,
  load the board, append the message, update `last_updated`, and save.
gui_related: false
gui_classification_reason: This unit covers backend message posting and validation rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-247
unblocks: []
acceptance_criteria:
- Covered post-message snippet remains losslessly available for exact-text audit.
- Subagent-name validation is preserved when `agent_id` encodes a subagent name.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: post_message_validation_and_persistence_example
node_compile_hint:
  mode: post_message_validation_and_persistence_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- DRY:FN:post_message
- subagent_registry::is_valid_subagent_name()
- load_message_board
- board.messages.push(message)
- last_updated
- save_message_board
negative_constraints:
- Subagent-name validation must not be bypassed when `agent_id` encodes a subagent name.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-315 - Prompt Formatting Uses Platform Display Contract

```yaml
plan_unit_id: OSI-315
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Message prompt formatting preserves `**Recent Messages from Other Agents:**`, limits display to 10 recent messages, formats
  sender, platform, type, subject, content, and files, and uses `platform_specs::display_name_for()` for platform display names.
gui_related: false
gui_classification_reason: This unit covers prompt formatting and platform naming contracts rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-254
- OSI-247
- OSI-300
unblocks: []
acceptance_criteria:
- Covered prompt-formatting snippet remains losslessly available for exact-text audit.
- Platform display names use the DRY platform display contract and are never hardcoded.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: prompt_formatting_uses_platform_display_contract
node_compile_hint:
  mode: prompt_formatting_uses_platform_display_contract
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- '**Recent Messages from Other Agents:**'
- take(10)
- platform_specs::display_name_for()
- '❓ Question'
- '✅ Answer'
- '📢 Update'
- '🙏 Request'
- '🎯 Decision'
- '⚠️ Warning'
- '📣 Announcement'
negative_constraints:
- Platform display name MUST use `platform_specs::display_name_for()` and NEVER hardcode platform names.
compatibility_only_notes:
- Prompt labels and Rust formatting are example evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- DRY_Rules and Models_System own platform display naming.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Models_System.md'
```

### OSI-316 - Agent Execution Message Command Integration

```yaml
plan_unit_id: OSI-316
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  During execution, orchestrator output parsing may detect `@message` or `@ask`, parse a message, post it, and inject relevant
  formatted messages before agent execution.
gui_related: false
gui_classification_reason: This unit covers execution/prompt integration rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-314
- OSI-315
unblocks: []
acceptance_criteria:
- Covered execution-integration snippet remains losslessly available for exact-text audit.
- Command parsing remains example evidence, not a command-system implementation task.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_execution_message_command_integration
node_compile_hint:
  mode: agent_execution_message_command_integration
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- '@message'
- '@ask'
- parse_message_from_output
- communicator.post_message
- get_messages_for_agent
- format_messages_for_prompt
negative_constraints:
- Command parsing snippet is not a command-system implementation task.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Commands and prompt pipeline owners retain their respective implementation contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-317 - Orchestrator Communication Insights Example

```yaml
plan_unit_id: OSI-317
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the `OrchestratorInsights` example with `active_conversations`, `pending_questions`, `recent_decisions`,
  `conflict_warnings`, and `analyze_communication`.
gui_related: false
gui_classification_reason: This unit covers backend insight derivation rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-306
- OSI-247
- OSI-250
unblocks: []
acceptance_criteria:
- Covered insight example remains losslessly available for exact-text audit.
- Monitoring does not re-own durable message-board storage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: orchestrator_communication_insights_example
node_compile_hint:
  mode: orchestrator_communication_insights_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- OrchestratorInsights
- active_conversations
- pending_questions
- recent_decisions
- conflict_warnings
- analyze_communication
negative_constraints:
- Monitoring does not re-own durable message-board storage.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator owns insight derivation; storage owns message records.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-318 - Message Board Benefits Rationale

```yaml
plan_unit_id: OSI-318
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve rationale tokens for cross-platform operation, orchestrator visibility, enhanced coordination, file-based operation,
  flexible routing, threaded conversations, and integration with coordination state.
gui_related: false
gui_classification_reason: This unit preserves rationale text rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-245
- OSI-248
- OSI-250
unblocks: []
acceptance_criteria:
- Covered benefit bullets remain losslessly available for exact-text audit.
- Rationale bullets are not executable work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: message_board_benefits_rationale
node_compile_hint:
  mode: message_board_benefits_rationale
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Cross-platform
- Orchestrator visibility
- Enhanced coordination
- File-based
- Flexible routing
- Threaded conversations
- Integration
negative_constraints:
- Rationale bullets are not executable work.
compatibility_only_notes:
- Rationale evidence only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-319 - Message Board Operational Mitigations

```yaml
plan_unit_id: OSI-319
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve mitigation tokens for `Message spam`, `max 10 messages/minute`, `Large message board`, `File locking`,
  `Message parsing`, and `Orphaned messages`.
gui_related: false
gui_classification_reason: This unit covers backend operational mitigations rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-249
- OSI-250
unblocks: []
acceptance_criteria:
- Covered mitigation bullets remain losslessly available for exact-text audit.
- Orphaned-message cleanup does not hide unresolved blocker threads.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: message_board_operational_mitigations
node_compile_hint:
  mode: message_board_operational_mitigations
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Message spam
- max 10 messages/minute
- Large message board
- File locking
- Message parsing
- Orphaned messages
negative_constraints:
- Orphaned-message cleanup must not hide unresolved blocker threads.
compatibility_only_notes:
- Mitigation list is source evidence and must align to canonical lifecycle/storage owners.
stale_retired_dispositions: []
owner_boundary_notes:
- Canonical lifecycle/storage owners control retention, archive, and cleanup semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-320 - Message Board Backend Next-Step Checklist Evidence

```yaml
plan_unit_id: OSI-320
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve backend checklist tokens to add a message board to coordination state, implement `AgentCommunicator`, integrate
  message injection, add orchestrator monitoring/insights, and test multiple agents across platforms.
gui_related: false
gui_classification_reason: This unit preserves backend checklist evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-245
- OSI-314
- OSI-315
- OSI-317
unblocks: []
acceptance_criteria:
- Covered checklist remains losslessly available for exact-text audit.
- Checklist items are not promoted into WorkNodes, tasks, queues, or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: message_board_backend_next_step_checklist_evidence
node_compile_hint:
  mode: message_board_backend_next_step_checklist_evidence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Add message board to coordination state
- Implement `AgentCommunicator`
- Integrate message injection into agent prompts
- Add orchestrator monitoring/insights
- Test with multiple agents across different platforms
negative_constraints:
- Checklist items are not WorkNodes, tasks, queues, or production build tasks.
compatibility_only_notes:
- Source-lineage checklist only.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-321 - Agent Communication GUI Visualization Consumer

```yaml
plan_unit_id: OSI-321
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: GUI may visualize agent communication as a consumer projection of orchestrator/message-board state.
gui_related: true
gui_classification_reason: This unit covers a user-visible GUI visualization projection.
split_recommended: false
depends_on:
- OSI-307
- OSI-317
unblocks: []
acceptance_criteria:
- Covered GUI visualization checklist line remains losslessly available for exact-text audit.
- GUI visualization does not re-own backend message schema or storage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: agent_communication_gui_visualization_consumer
node_compile_hint:
  mode: agent_communication_gui_visualization_consumer
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0153
preserved_exact_tokens:
- Add GUI visualization of agent communication
- GUI
- agent communication
negative_constraints:
- GUI visualization does not re-own backend message schema or storage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI owns presentation; orchestrator supplies communication state.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-322 - Coordination Concurrent Write And Atomicity Gap

```yaml
plan_unit_id: OSI-322
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Gap #28 preserves the concurrent-write risk that multiple agents writing `active-agents.json` can cause race conditions,
  file corruption, or lost updates; mitigation evidence includes advisory locks, exponential backoff, atomic temp-file rename,
  and read-modify-write retry for debug/projection mirrors rather than canonical persistence.
gui_related: false
gui_classification_reason: This unit covers coordination storage safety rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-251
- OSI-253
unblocks: []
acceptance_criteria:
- Covered Gap #28 opening and mitigation bullets remain losslessly available for exact-text audit.
- '`active-agents.json` remains projection/debug compatibility, not canonical runtime truth.'
- Concurrent-write mitigation evidence does not convert side files into canonical persistence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_concurrent_write_and_atomicity_gap
node_compile_hint:
  mode: coordination_concurrent_write_and_atomicity_gap
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:8
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:15
preserved_exact_tokens:
- 'Gap #28: File locking and concurrent writes'
- active-agents.json
- File locking
- Atomic writes
- Read-modify-write with retry
- up to 3 attempts
negative_constraints:
- '`active-agents.json` remains projection/debug compatibility, not canonical runtime truth.'
compatibility_only_notes:
- Mitigation applies only through canonical coordination projection/storage owner alignment.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage and coordination contracts own canonical locking and atomicity semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-323 - Lock Timeout Fail-Open Stale Disposition

```yaml
plan_unit_id: OSI-323
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve exact fail-open tokens `within 5 seconds`, `log warning and proceed`, `coordination may be stale but execution
  continues`, and `Proceeding without lock` as stale compatibility evidence.
gui_related: false
gui_classification_reason: This unit covers stale coordination safety disposition rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-322
unblocks: []
acceptance_criteria:
- Covered fail-open timeout tokens remain losslessly available for exact-text audit.
- Fail-open stale coordination is not promoted into live safety policy without owner adjudication.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: lock_timeout_fail_open_stale_disposition
node_compile_hint:
  mode: lock_timeout_fail_open_stale_disposition
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- within 5 seconds
- log warning and proceed
- coordination may be stale but execution continues
- Proceeding without lock
negative_constraints:
- Future canon must not promote stale coordination or proceeding without lock as live safety policy without owner adjudication.
compatibility_only_notes:
- Fail-open timeout behavior is stale compatibility evidence only.
stale_retired_dispositions:
- Lock timeout fail-open behavior requires owner adjudication before use.
owner_boundary_notes:
- Coordination/storage owners must decide fail-open/fail-closed locking policy.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-324 - Save State With Lock Rust Example

```yaml
plan_unit_id: OSI-324
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve `save_state_with_lock` example tokens including `MAX_ATTEMPTS: u32 = 3`, lock file, retry sleep, temp file,
  `serde_json::to_string_pretty`, atomic rename, and release lock.
gui_related: false
gui_classification_reason: This unit covers backend locking example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-322
- OSI-323
unblocks: []
acceptance_criteria:
- Covered Rust locking example remains losslessly available for exact-text audit.
- The Rust snippet is not treated as implementation code.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: save_state_with_lock_rust_example
node_compile_hint:
  mode: save_state_with_lock_rust_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- save_state_with_lock
- 'MAX_ATTEMPTS: u32 = 3'
- tokio::time::sleep
- serde_json::to_string_pretty
- std::fs::rename
- remove_file
negative_constraints:
- Rust snippet is not implementation code.
compatibility_only_notes:
- Fail-open lines inside the snippet inherit OSI-323 stale disposition.
stale_retired_dispositions:
- Proceeding without lock remains stale compatibility evidence.
owner_boundary_notes:
- Coordination/storage owners retain actual locking algorithm authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-325 - Lock Acquisition And Stale Lock Cleanup Example

```yaml
plan_unit_id: OSI-325
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve `acquire_lock` example tokens including PID lock content, `create_new(true)`, `AlreadyExists`, stale process check,
  stale lock removal, and retry.
gui_related: false
gui_classification_reason: This unit covers backend lock acquisition example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-324
unblocks: []
acceptance_criteria:
- Covered lock acquisition example remains losslessly available for exact-text audit.
- Stale lock cleanup does not authorize side-file cleanup heuristics for canonical child/run state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: lock_acquisition_and_stale_lock_cleanup_example
node_compile_hint:
  mode: lock_acquisition_and_stale_lock_cleanup_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- acquire_lock
- create_new(true)
- AlreadyExists
- process_exists
- Stale lock
- remove_file
negative_constraints:
- Stale lock cleanup does not authorize side-file cleanup heuristics for canonical child/run state.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions:
- Stale lock cleanup behavior requires owner adjudication before use.
owner_boundary_notes:
- Canonical child/run state cleanup remains owned by runtime/storage contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-326 - Platform-Specific Process Existence Placeholder

```yaml
plan_unit_id: OSI-326
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Preserve the `process_exists` example using Unix `kill -0` and the non-Unix placeholder `true // Assume exists for now`.
gui_related: false
gui_classification_reason: This unit covers platform-specific backend process-check evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-325
unblocks: []
acceptance_criteria:
- Covered platform-specific process-check example remains losslessly available for exact-text audit.
- Windows/non-Unix placeholder is not treated as live correctness canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_specific_process_existence_placeholder
node_compile_hint:
  mode: platform_specific_process_existence_placeholder
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- process_exists
- kill
- '-0'
- '#[cfg(unix)]'
- '#[cfg(not(unix))]'
- true // Assume exists for now
negative_constraints:
- Windows/non-Unix placeholder is not live correctness canon.
compatibility_only_notes:
- Platform-specific implementation must be adjudicated before use.
stale_retired_dispositions:
- Non-Unix placeholder is compatibility evidence only.
owner_boundary_notes:
- Runtime/platform owners must define real process-existence checks.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-327 - File Corruption Recovery Gap Opening

```yaml
plan_unit_id: OSI-327
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the opening of Gap #29: corrupted `active-agents.json` from invalid JSON, partial write, or disk full can break
  registration or coordination-state reads.
gui_related: false
gui_classification_reason: This unit covers coordination file corruption risk rather than GUI presentation.
split_recommended: true
depends_on:
- OSI-251
- OSI-322
unblocks: []
acceptance_criteria:
- Covered Gap #29 opening remains losslessly available for exact-text audit.
- This partial unit does not claim mitigation or recovery coverage after source line 4836.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: file_corruption_recovery_gap_opening
node_compile_hint:
  mode: file_corruption_recovery_gap_opening
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #29: Error handling and file corruption recovery'
- active-agents.json
- invalid JSON
- partial write
- disk full
- register or read coordination state
negative_constraints:
- Do not claim mitigation or recovery coverage after source line 4836 in this unit.
compatibility_only_notes:
- Partial S0154 coverage only; recovery mitigation starts after this window.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage/coordination owners retain recovery semantics for corrupted coordination projections.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-328 - File Corruption Recovery Mitigations

```yaml
plan_unit_id: OSI-328
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve JSON validation, backup-before-write, fallback-empty-state, and corruption-detection mitigations for corrupted
  coordination projection reads.
gui_related: false
gui_classification_reason: This unit covers coordination projection recovery rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-327
- OSI-322
unblocks: []
acceptance_criteria:
- Covered file-corruption mitigation bullets remain losslessly available for exact-text audit.
- Recovery applies to projection/debug state and does not make `active-agents.json` canonical runtime truth.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: file_corruption_recovery_mitigations
node_compile_hint:
  mode: file_corruption_recovery_mitigations
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- JSON validation
- Backup before write
- active-agents.json.bak
- Fallback to empty state
- Corruption detection
negative_constraints:
- Recovery applies to projection/debug state, not canonical runtime truth.
compatibility_only_notes:
- Corruption recovery is source-lineage evidence for coordination projections.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage and coordination owners retain canonical recovery semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-329 - Load State Backup Recovery Example

```yaml
plan_unit_id: OSI-329
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the `load_state` Rust example that reads `state_file`, parses `AgentCoordinationState`, validates schema, tries
  `.bak`, and falls back to `AgentCoordinationState::default()`.
gui_related: false
gui_classification_reason: This unit covers backend recovery example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-328
- OSI-265
unblocks: []
acceptance_criteria:
- Covered Rust recovery example remains losslessly available for exact-text audit.
- The snippet remains evidence only and does not create implementation code.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: load_state_backup_recovery_example
node_compile_hint:
  mode: load_state_backup_recovery_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- load_state
- AgentCoordinationState
- serde_json::from_str
- backup_file
- Recovered coordination state from backup
- AgentCoordinationState::default()
negative_constraints:
- Rust snippet is evidence only.
compatibility_only_notes:
- Backup recovery applies to projection/debug coordination state evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage owners retain durable recovery implementation authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-330 - Coordination State Schema And Timestamp Validation

```yaml
plan_unit_id: OSI-330
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve required-field and timestamp validation evidence for `agent_id`, `node_id`, future `started_at`, and the 7-day
  stale warning.
gui_related: false
gui_classification_reason: This unit covers backend schema/timestamp validation rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-257
- OSI-329
unblocks: []
acceptance_criteria:
- Covered validation snippet remains losslessly available for exact-text audit.
- The 7-day stale warning is not promoted into live cleanup policy.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_state_schema_and_timestamp_validation
node_compile_hint:
  mode: coordination_state_schema_and_timestamp_validation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- validate_state
- empty agent_id
- empty node_id
- started_at in future
- chrono::Duration::days(7)
- likely stale
negative_constraints:
- The 7-day stale warning is compatibility evidence, not live cleanup policy.
compatibility_only_notes:
- Timestamp thresholds are source evidence pending canonical owner adjudication.
stale_retired_dispositions:
- 7-day stale warning remains compatibility evidence only.
owner_boundary_notes:
- Runtime/storage owners define canonical stale-state validation.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-331 - Stale Agent Cleanup And Crash Recovery Gap

```yaml
plan_unit_id: OSI-331
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve Gap #30 heartbeat, stale prune, process-existence, automatic cleanup, and crash-detection mitigation tokens.
gui_related: false
gui_classification_reason: This unit covers stale coordination cleanup and crash recovery rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-264
- OSI-273
- OSI-269
unblocks: []
acceptance_criteria:
- Covered Gap #30 bullets remain losslessly available for exact-text audit.
- Stale-agent behavior remains projection/compatibility evidence unless canonical owner docs accept it.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: stale_agent_cleanup_and_crash_recovery_gap
node_compile_hint:
  mode: stale_agent_cleanup_and_crash_recovery_gap
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #30: Stale agent cleanup and crash recovery'
- every 30 seconds
- 5 minutes
- Process existence check
- Automatic cleanup
- Crash detection
negative_constraints:
- Stale-agent behavior remains stale compatibility/projection evidence unless accepted by canonical owner docs.
compatibility_only_notes:
- Stale-agent cleanup is projection evidence only.
stale_retired_dispositions:
- Gap #30 stale-agent cleanup language remains compatibility evidence.
owner_boundary_notes:
- Canonical child visibility and conflict state comes from seglog/redb projections, not side-file cleanup alone.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-332 - Five-Minute Stale Prune Example

```yaml
plan_unit_id: OSI-332
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the `load_state` pruning example using `last_update`, `chrono::Duration::minutes(5)`, worktree existence checks,
  and `save_state`.
gui_related: false
gui_classification_reason: This unit covers backend stale-prune example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-331
unblocks: []
acceptance_criteria:
- Covered stale-prune snippet remains losslessly available for exact-text audit.
- Side-file cleanup heuristics do not become canonical child/run state cleanup.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: five_minute_stale_prune_example
node_compile_hint:
  mode: five_minute_stale_prune_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- Prune stale agents
- last_update
- chrono::Duration::minutes(5)
- worktree.exists()
- Save pruned state
negative_constraints:
- This example does not authorize side-file cleanup heuristics for canonical child/run state.
compatibility_only_notes:
- Five-minute prune threshold is compatibility/tuning evidence only.
stale_retired_dispositions:
- Stale prune example remains stale compatibility evidence.
owner_boundary_notes:
- Canonical child/run cleanup remains owned by runtime/storage contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-333 - File Operation Extraction Reliability Gap

```yaml
plan_unit_id: OSI-333
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve multi-source extraction, confidence scoring, git-diff validation, and best-effort empty-file registration evidence
  for unreliable file-operation extraction.
gui_related: false
gui_classification_reason: This unit covers backend extraction reliability rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-274
- OSI-273
unblocks: []
acceptance_criteria:
- Covered Gap #31 bullets remain losslessly available for exact-text audit.
- Extraction enriches coordination projection and does not replace canonical tool/event records.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: file_operation_extraction_reliability_gap
node_compile_hint:
  mode: file_operation_extraction_reliability_gap
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #31: File operation extraction reliability'
- PreToolUse
- PostToolUse
- provider stream/tool events
- git diff detection
- high/medium confidence
negative_constraints:
- Extraction enriches coordination projection and must not replace canonical tool/event records.
compatibility_only_notes:
- Best-effort empty-file registration remains source-lineage evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/tool-event owners retain canonical event records.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-334 - File Operation Extractor Rust Example

```yaml
plan_unit_id: OSI-334
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve `FileOperationExtractor`, `extract_files`, platform-hook, git-diff, output-parsing, and regex-pattern example evidence.
gui_related: false
gui_classification_reason: This unit covers backend extractor example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-333
unblocks: []
acceptance_criteria:
- Covered extractor snippet remains losslessly available for exact-text audit.
- Regex patterns are not promoted into the final parser contract.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: file_operation_extractor_rust_example
node_compile_hint:
  mode: file_operation_extractor_rust_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- FileOperationExtractor
- extract_files
- parse_files_from_output
- editing
- modifying
- rs|ts|js|py|go|java
negative_constraints:
- Regex snippet is not the final parser contract.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Parser contracts remain owned by provider/tool-event and prompt pipeline owners.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-335 - Coordination State Size And Prompt Limits

```yaml
plan_unit_id: OSI-335
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve Gap #32 size and performance mitigation evidence for `50+` agents, `max 100 active agents`, `max 2000 tokens`,
  lazy loading, `5 seconds` cache, and filtering.
gui_related: false
gui_classification_reason: This unit covers coordination state performance and prompt limits rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-262
- OSI-263
- OSI-264
unblocks: []
acceptance_criteria:
- Covered size/performance bullets remain losslessly available for exact-text audit.
- Tier filter wording remains compatibility vocabulary and does not outrank canonical node/package/lane identity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_state_size_and_prompt_limits
node_compile_hint:
  mode: coordination_state_size_and_prompt_limits
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #32: Coordination state size limits and performance'
- 50+
- max 100 active agents
- max 2000 tokens
- Lazy loading
- Caching
- 5 seconds
negative_constraints:
- Tier filter wording is compatibility vocabulary and must not outrank canonical node/package/lane identity.
compatibility_only_notes:
- Numeric thresholds are tuning evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Canonical identity terminology remains with node/package/lane owner docs.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-336 - Filtered Coordination Context Example

```yaml
plan_unit_id: OSI-336
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve `get_coordination_context`, `CoordinationFilter`, `node_id`, `platform`, `file_path`, `max_agents = 20`, and
  `estimated_tokens > 2000` summarization evidence.
gui_related: false
gui_classification_reason: This unit covers backend coordination context filtering rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-335
- OSI-262
- OSI-263
unblocks: []
acceptance_criteria:
- Covered filtering snippet remains losslessly available for exact-text audit.
- Threshold differences are tuning evidence and not a product decision.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: filtered_coordination_context_example
node_compile_hint:
  mode: filtered_coordination_context_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- get_coordination_context
- CoordinationFilter
- node_id
- platform
- file_path
- max_agents = 20
- estimated_tokens > 2000
negative_constraints:
- '`100` versus `20` thresholds are tuning evidence, not a product decision.'
compatibility_only_notes:
- Filter and summarization snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Prompt/token budgeting remains owned by prompt pipeline and runtime owners.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-337 - Conflict Resolution And File Locking Gap

```yaml
plan_unit_id: OSI-337
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve Gap #33 conflict detection, delay/alternative/escalate options, file-level locking, `30 minutes` expiry, and
  serialize/reassign mitigation evidence.
gui_related: false
gui_classification_reason: This unit covers backend conflict resolution and locking rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-276
- OSI-322
- OSI-323
unblocks: []
acceptance_criteria:
- Covered conflict-resolution bullets remain losslessly available for exact-text audit.
- Stale lock release remains compatibility evidence until owner adjudication.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: conflict_resolution_and_file_locking_gap
node_compile_hint:
  mode: conflict_resolution_and_file_locking_gap
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #33: Conflict resolution and file locking'
- Conflict detection
- File-level locking
- 30 minutes
- Orchestrator intervention
- serialize execution
negative_constraints:
- Stale lock release remains compatibility evidence until owner adjudication.
compatibility_only_notes:
- Conflict-resolution options are mitigation evidence, not executable work.
stale_retired_dispositions:
- File-lock expiry and stale lock release remain compatibility evidence.
owner_boundary_notes:
- Runtime/storage owners decide canonical conflict and locking behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-338 - FileLock And Conflict Detection Example

```yaml
plan_unit_id: OSI-338
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve `FileLock`, `check_file_conflicts`, `files_to_edit`, `files_being_edited.contains(file)`, and `FileConflict` evidence.
gui_related: false
gui_classification_reason: This unit covers backend conflict-detection example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-337
- OSI-257
unblocks: []
acceptance_criteria:
- Covered FileLock/conflict snippet remains losslessly available for exact-text audit.
- The example does not make `file_locks` canonical storage schema.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: filelock_and_conflict_detection_example
node_compile_hint:
  mode: filelock_and_conflict_detection_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- FileLock
- check_file_conflicts
- files_to_edit
- files_being_edited.contains(file)
- FileConflict
- conflicting_platform
negative_constraints:
- '`file_locks` does not become canonical storage schema from this example.'
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage owners retain canonical file-lock schema authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-339 - Acquire File Lock Compatibility Example

```yaml
plan_unit_id: OSI-339
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the `acquire_file_lock` example that currently checks `files_being_edited`, pushes file paths, updates
  `last_update`, saves state, and returns `Ok(false)` when unavailable.
gui_related: false
gui_classification_reason: This unit covers backend file-lock compatibility example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-338
unblocks: []
acceptance_criteria:
- Covered acquire-file-lock snippet remains losslessly available for exact-text audit.
- The example is not promoted to live lock semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: acquire_file_lock_compatibility_example
node_compile_hint:
  mode: acquire_file_lock_compatibility_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- acquire_file_lock
- This would require extending AgentCoordinationState with file_locks
- For now
- files_being_edited
- last_update
- Ok(false)
negative_constraints:
- This example is not live lock semantics.
compatibility_only_notes:
- Compatibility example only.
stale_retired_dispositions:
- Current files_being_edited lock fallback remains compatibility evidence.
owner_boundary_notes:
- Canonical file-lock behavior requires storage/runtime owner adjudication.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-340 - Path Normalization And Worktree Handling

```yaml
plan_unit_id: OSI-340
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve Gap #34 path normalization for relative/absolute paths, worktree-to-main-repo conversion, and canonical path
  comparison.
gui_related: false
gui_classification_reason: This unit covers path normalization and worktree handling rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-253
- OSI-263
unblocks: []
acceptance_criteria:
- Covered path-normalization bullets remain losslessly available for exact-text audit.
- Worktree/storage owners retain canonical path identity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: path_normalization_and_worktree_handling
node_compile_hint:
  mode: path_normalization_and_worktree_handling
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #34: Path normalization and worktree handling'
- Path normalization
- Worktree path resolution
- .puppet-master/worktrees/A/src/api.rs → src/api.rs
- resolve symlinks
- normalize separators
negative_constraints: []
compatibility_only_notes:
- Path normalization example must align with canonical storage/worktree path identity.
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree/storage owners retain canonical path identity.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-341 - Normalize Path Rust Example

```yaml
plan_unit_id: OSI-341
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve `normalize_path`, `strip_prefix(project_root)`, `.puppet-master/worktrees/`, component stripping, and fallback
  `path.to_path_buf()` evidence.
gui_related: false
gui_classification_reason: This unit covers backend path-normalization example code rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-340
unblocks: []
acceptance_criteria:
- Covered normalize-path snippet remains losslessly available for exact-text audit.
- The snippet is not the final canonicalization algorithm.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: normalize_path_rust_example
node_compile_hint:
  mode: normalize_path_rust_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- normalize_path
- strip_prefix(project_root)
- .puppet-master/worktrees/
- components().next()
- path.to_path_buf()
negative_constraints:
- Snippet is not the final canonicalization algorithm.
compatibility_only_notes:
- Rust snippet is evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Canonical path normalization remains owned by storage/worktree contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-342 - Coordination Event Ingestion Fallback

```yaml
plan_unit_id: OSI-342
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve Gap #35 fallback detection for parser errors, stream timeout, malformed events, baseline-first coordination, and
  event-ingestion enrichment.
gui_related: false
gui_classification_reason: This unit covers provider/event ingestion fallback rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-271
- OSI-274
- OSI-270
unblocks: []
acceptance_criteria:
- Covered fallback bullets remain losslessly available for exact-text audit.
- Provider events remain enrichment and do not replace canonical coordination projection.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_event_ingestion_fallback
node_compile_hint:
  mode: coordination_event_ingestion_fallback
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #35: Coordination-event ingestion fallback'
- parser error
- stream timeout
- malformed event
- baseline coordination projection updates
- enrichment layer only
- do not block execution
negative_constraints:
- Provider events do not replace canonical coordination projection.
compatibility_only_notes:
- Event ingestion is an enrichment layer only.
stale_retired_dispositions: []
owner_boundary_notes:
- Baseline coordination projection remains primary; provider event adapters enrich it.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-343 - Coordination Metrics And Logging Visibility

```yaml
plan_unit_id: OSI-343
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve Gap #36 metrics and logging visibility for agent registration, conflicts, stale-agent pruning, file-lock acquisition,
  and coordination state changes.
gui_related: false
gui_classification_reason: This unit covers metrics/logging visibility rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-337
- OSI-342
unblocks: []
acceptance_criteria:
- Covered metrics/logging bullets remain losslessly available for exact-text audit.
- Stale-agent pruning metrics remain projection evidence only.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_metrics_and_logging_visibility
node_compile_hint:
  mode: coordination_metrics_and_logging_visibility
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- 'Gap #36: Coordination metrics and monitoring'
- agent registered
- conflicts detected
- stale agents pruned
- file locks acquired
- coordination context injected
negative_constraints:
- '`stale agents pruned` is projection metric evidence only.'
compatibility_only_notes:
- Metrics/logging list is source evidence pending analytics owner acceptance.
stale_retired_dispositions:
- Stale-agent pruning metrics remain compatibility evidence.
owner_boundary_notes:
- Usage/analytics owners consume event taxonomy if promoted.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-344 - Coordination GUI Monitoring Consumer

```yaml
plan_unit_id: OSI-344
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: GUI may show coordination state, active agents, file locks, and conflicts as a consumer projection.
gui_related: true
gui_classification_reason: This unit covers a user-visible GUI monitoring projection.
split_recommended: false
depends_on:
- OSI-321
- OSI-307
- OSI-343
unblocks: []
acceptance_criteria:
- Covered GUI monitoring bullet remains losslessly available for exact-text audit.
- GUI monitoring remains a consumer projection and does not own backend coordination state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_gui_monitoring_consumer
node_compile_hint:
  mode: coordination_gui_monitoring_consumer
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- Add coordination state to GUI
- show active agents, file locks, conflicts
negative_constraints:
- GUI monitoring does not own backend coordination state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI owns presentation; orchestrator supplies state.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-345 - Coordination Effectiveness Analytics

```yaml
plan_unit_id: OSI-345
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Preserve analytics evidence for conflicts prevented, false positives, and coordination accuracy.
gui_related: false
gui_classification_reason: This unit covers analytics evidence rather than GUI presentation.
split_recommended: false
depends_on:
- OSI-343
unblocks: []
acceptance_criteria:
- Covered analytics bullet and trailing boundary line remain losslessly available for exact-text audit.
- Analytics evidence is not promoted into executable telemetry work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_effectiveness_analytics
node_compile_hint:
  mode: coordination_effectiveness_analytics
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0154
preserved_exact_tokens:
- Analytics
- conflicts prevented
- false positives
- coordination accuracy
negative_constraints:
- Analytics evidence is not executable telemetry work.
compatibility_only_notes:
- Line 5226 is trailing boundary coverage only.
stale_retired_dispositions: []
owner_boundary_notes:
- Usage/analytics owner consumes event taxonomy if promoted.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-346 - Coordination State Query And Filtering Requirement

```yaml
plan_unit_id: OSI-346
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Coordination state must remain queryable by platform, tier compatibility label, file path, or agent ID so orchestrator
  coordination consumers can inspect active agent projections without promoting tier labels above canonical execution refs.
gui_related: false
gui_classification_reason: This unit covers backend coordination query behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-257
unblocks: []
acceptance_criteria:
- Covered coordination query/filtering prose remains losslessly available for exact-text audit.
- '`tier` remains compatibility vocabulary and must not outrank canonical execution refs.'
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_query_filtering
node_compile_hint:
  mode: coordination_query_filtering
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0155
preserved_exact_tokens:
- platform
- tier
- file path
- agent ID
negative_constraints:
- Tier compatibility labels must not outrank canonical execution refs.
compatibility_only_notes:
- '`tier` is retained only as compatibility vocabulary.'
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator consumes the coordination projection; runtime/storage contracts own canonical execution identity.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-347 - AgentCoordinator Query Methods Example

```yaml
plan_unit_id: OSI-347
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the AgentCoordinator query-method snippet as source evidence for filtering active agent projections by platform,
  node ID, and edited file path.
gui_related: false
gui_classification_reason: This unit covers backend coordination example code, not GUI presentation.
split_recommended: false
depends_on:
- OSI-346
- OSI-258
unblocks: []
acceptance_criteria:
- Covered query-method Rust snippet remains losslessly available for exact-text audit.
- The snippet is preserved as plan evidence and does not by itself create implementation work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_query_methods_example
node_compile_hint:
  mode: coordination_query_methods_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0155
preserved_exact_tokens:
- get_agents_by_platform
- get_agents_by_node
- get_agents_editing_file
- load_state
- active_agents
- files_being_edited
negative_constraints:
- Example code does not override canonical runtime/storage ownership.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only until implementation owners accept it.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage/runtime own durable coordination state; orchestrator consumes and filters the projection.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-348 - Coordination Backup Before Write Requirement

```yaml
plan_unit_id: OSI-348
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Coordination projection writes should preserve backup-before-write and retention-policy evidence for recovery of the
  compatibility state file.
gui_related: false
gui_classification_reason: This unit covers backend coordination recovery behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-265
- OSI-328
unblocks: []
acceptance_criteria:
- Covered backup-before-write and retention-policy prose remains losslessly available for exact-text audit.
- Backup behavior remains scoped to coordination projection/debug state unless a storage owner adopts it.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_backup_before_write
node_compile_hint:
  mode: coordination_backup_before_write
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0155
preserved_exact_tokens:
- Automatically backup coordination state before each write
- retention policy
negative_constraints:
- Projection backups must not become canonical storage durability rules by implication.
compatibility_only_notes:
- Backup behavior applies to projection/debug state evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage owner adjudicates durable backup and retention semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-349 - Save State Backup And Cleanup Example

```yaml
plan_unit_id: OSI-349
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the save_state backup and cleanup example, including timestamped .bak files and the "keep last 10" cleanup
  note, as coordination projection recovery evidence.
gui_related: false
gui_classification_reason: This unit covers backend coordination example code, not GUI presentation.
split_recommended: false
depends_on:
- OSI-348
unblocks: []
acceptance_criteria:
- Covered save_state backup snippet remains losslessly available for exact-text audit.
- The cleanup threshold is compatibility evidence and not promoted to a durable storage retention contract.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_save_state_backup_example
node_compile_hint:
  mode: coordination_save_state_backup_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0155
preserved_exact_tokens:
- save_state
- 'with_extension(format!("bak.{}", Utc::now().timestamp()))'
- cleanup_old_backups
- keep last 10
negative_constraints:
- Timestamped backup snippet does not own canonical storage retention.
compatibility_only_notes:
- Cleanup threshold is source-lineage compatibility evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage owner adjudicates cleanup policy if the example is promoted.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-350 - Coordination Schema Versioning Requirement

```yaml
plan_unit_id: OSI-350
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Coordination projection formats should retain explicit schema-versioning evidence for controlled format changes.
gui_related: false
gui_classification_reason: This unit covers backend schema compatibility, not GUI presentation.
split_recommended: false
depends_on:
- OSI-257
- OSI-330
unblocks: []
acceptance_criteria:
- Covered schema-versioning prose remains losslessly available for exact-text audit.
- Schema versioning remains scoped to coordination projection schema unless adopted by storage owners.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_schema_versioning
node_compile_hint:
  mode: coordination_schema_versioning
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0155
preserved_exact_tokens:
- schema versioning
- coordination state
- format changes
negative_constraints:
- Coordination projection schema versioning does not redefine canonical storage schema ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Storage/schema owners accept or reject durable schema semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-351 - AgentCoordinationState Schema Version Example

```yaml
plan_unit_id: OSI-351
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the AgentCoordinationState schema version example as evidence for schema_version, current version constants,
  validation, and migration hooks on coordination projections.
gui_related: false
gui_classification_reason: This unit covers backend schema example code, not GUI presentation.
split_recommended: false
depends_on:
- OSI-350
unblocks: []
acceptance_criteria:
- Covered schema-version Rust snippet remains losslessly available for exact-text audit.
- The snippet is source evidence only and does not create implementation work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: coordination_schema_version_example
node_compile_hint:
  mode: coordination_schema_version_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0155
preserved_exact_tokens:
- schema_version
- 'CURRENT_SCHEMA_VERSION: u32 = 1'
- validate_schema_version
- migrate_schema
negative_constraints:
- Example code must not override canonical storage schema contracts.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Storage/schema owners own durable schema migration semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-352 - Parallel Subagent Execution Principles

```yaml
plan_unit_id: OSI-352
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Parallel subagent execution preserves worktree isolation, independent selection, platform resource management, dependency-chain
  context sharing, and coordination through shared state/projection rather than direct subagent communication.
gui_related: false
gui_classification_reason: This unit covers orchestration execution principles, not GUI presentation.
split_recommended: false
depends_on:
- OSI-235
- OSI-236
- OSI-251
- OSI-253
unblocks: []
acceptance_criteria:
- Covered concurrent-execution principles remain losslessly available for exact-text audit.
- Context sharing remains through dependency-chain results, not direct subagent communication.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parallel_subagent_execution_principles
node_compile_hint:
  mode: parallel_subagent_execution_principles
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0156
preserved_exact_tokens:
- Worktree Isolation
- Independent Selection
- Resource Management
- Context Sharing
- Coordination
negative_constraints:
- Parallel context sharing is not direct subagent-to-subagent communication.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Platform runners own concurrent invocation constraints.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-353 - Parallel Worktree Example

```yaml
plan_unit_id: OSI-353
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the Level 0 parallel worktree example with rust-engineer, react-specialist, and python-pro as source-lineage
  evidence for isolated concurrent subtask execution and later merge-back.
gui_related: false
gui_classification_reason: This unit covers backend orchestration example text, not GUI presentation.
split_recommended: false
depends_on:
- OSI-352
unblocks: []
acceptance_criteria:
- Covered parallel worktree example remains losslessly available for exact-text audit.
- Example worktrees are illustrative and do not create executable work queues.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parallel_worktree_example
node_compile_hint:
  mode: parallel_worktree_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0156
preserved_exact_tokens:
- Level 0
- rust-engineer
- react-specialist
- python-pro
- .puppet-master/worktrees/A
- .puppet-master/worktrees/B
- .puppet-master/worktrees/C
- Results merged back to main branch after completion
negative_constraints:
- Example subtasks are not executable queues or WorkNodes.
compatibility_only_notes:
- Worktree paths are illustrative source evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- SCM/worktree owners adjudicate concrete worktree lifecycle behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-354 - Conflict Types And Coordination Prevention

```yaml
plan_unit_id: OSI-354
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Conflict prevention must preserve file, resource, and context conflict classes plus coordination-based prevention through
  active-file projection checks and prompt warnings.
gui_related: false
gui_classification_reason: This unit covers backend coordination conflict prevention, not GUI presentation.
split_recommended: false
depends_on:
- OSI-337
- OSI-343
- OSI-254
- OSI-268
unblocks: []
acceptance_criteria:
- Covered conflict-type and mitigation prose remains losslessly available for exact-text audit.
- active-agents.json remains projection/debug compatibility and does not imply canonical file leases.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: conflict_types_coordination_prevention
node_compile_hint:
  mode: conflict_types_coordination_prevention
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0157
preserved_exact_tokens:
- File Conflicts
- Resource Conflicts
- Context Conflicts
- active-agents.json
- file conflicts
- Coordination context injected into prompts
negative_constraints:
- Coordination projection checks do not create canonical file leases.
compatibility_only_notes:
- active-agents.json remains projection/debug compatibility evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime/storage contracts own durable conflict and lock semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-355 - Conflict Detector File-Overlap Example

```yaml
plan_unit_id: OSI-355
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the SubagentConflictDetector file-overlap example as source evidence for detecting overlapping active-agent file
  projections before parallel execution.
gui_related: false
gui_classification_reason: This unit covers backend conflict detection example code, not GUI presentation.
split_recommended: false
depends_on:
- OSI-338
- OSI-354
unblocks: []
acceptance_criteria:
- Covered file-overlap Rust snippet remains losslessly available for exact-text audit.
- The snippet remains source evidence and does not create implementation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: conflict_detector_file_overlap_example
node_compile_hint:
  mode: conflict_detector_file_overlap_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0157
preserved_exact_tokens:
- SubagentConflictDetector
- detect_conflicts
- coordination_state
- files_a
- files_b
- 'ConflictType::FileOverlap'
negative_constraints:
- File-overlap example does not override canonical conflict/lock ownership.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime/storage owners adjudicate concrete conflict enforcement.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-356 - Architectural Conflict Heuristic Example

```yaml
plan_unit_id: OSI-356
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the architectural-conflict heuristic example as source evidence for advisory conflict detection involving
  architect-reviewer groups and ConflictType variants.
gui_related: false
gui_classification_reason: This unit covers backend heuristic example code, not GUI presentation.
split_recommended: false
depends_on:
- OSI-043
- OSI-125
- OSI-354
unblocks: []
acceptance_criteria:
- Covered architectural-conflict Rust snippet remains losslessly available for exact-text audit.
- Heuristic example is not live selector policy unless adopted by the selector owner.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: architectural_conflict_heuristic_example
node_compile_hint:
  mode: architectural_conflict_heuristic_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0157
preserved_exact_tokens:
- has_architectural_conflict
- architect-reviewer
- 'ConflictType::Architectural'
- ResourceLimit
- Conflict
negative_constraints:
- Architectural-conflict heuristic does not become live selector policy by implication.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Selector policy owner adjudicates any promoted heuristic.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-357 - Parallel Execution Concurrency Cap Ownership

```yaml
plan_unit_id: OSI-357
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Concurrency caps are execution/config concerns owned by the `Canonical crew-cap and availability rules` `executionLimits`
  anchor; the plan graph owns dependency/blocking structure only, and both crew and per-platform agent limits apply.
gui_related: false
gui_classification_reason: This unit covers backend execution/config ownership, not GUI presentation.
split_recommended: false
depends_on:
- OSI-281
- OSI-030
unblocks: []
acceptance_criteria:
- Covered concurrency-cap ownership prose remains losslessly available for exact-text audit.
- The plan graph must not own max-concurrent execution caps.
- References to `§Subagent Configuration executionLimits (this file)` are compatibility lineage when they point at the old corrupted YAML block instead of the live crew-cap anchor.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parallel_execution_concurrency_cap_ownership
node_compile_hint:
  mode: parallel_execution_concurrency_cap_ownership
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0158
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:12
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:19
preserved_exact_tokens:
- executionLimits
- §Subagent Configuration executionLimits (this file)
- depends_on
- blockers
- unblocks
- maxConcurrentCrewsPerPlatform
- 'Plans/Crosswalk.md §3.7'
- >-
  Both limits apply: a crew spawn must not exceed either the crew cap or the per-platform agent cap. See §Subagent
  Configuration `executionLimits` for canonical values.
negative_constraints:
- The plan graph must not own max concurrent execution caps.
- Crew spawn must not exceed either the crew cap or the per-platform agent cap.
compatibility_only_notes: []
stale_retired_dispositions:
- The old `§Subagent Configuration executionLimits (this file)` pointer is retired when it resolves to the corrupted YAML block; the live same-file anchor is `Canonical crew-cap and availability rules`.
owner_boundary_notes:
- Crosswalk §3.7 and the same-file `Canonical crew-cap and availability rules` executionLimits anchor own concurrency cap values.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-358 - Parallel Subagent Benefits Rationale

```yaml
plan_unit_id: OSI-358
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the rationale that parallel subagent execution can improve speed, specialization, resource efficiency, and
  scalability when bounded by the execution/coordination constraints.
gui_related: false
gui_classification_reason: This unit covers rationale for backend orchestration behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-352
- OSI-357
unblocks: []
acceptance_criteria:
- Covered benefits list remains losslessly available for exact-text audit.
- Rationale does not override concurrency, coordination, or worktree constraints.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parallel_subagent_benefits_rationale
node_compile_hint:
  mode: parallel_subagent_benefits_rationale
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0159
preserved_exact_tokens:
- Faster Execution
- Better Specialization
- Resource Efficiency
- Scalability
negative_constraints:
- Benefits rationale must not override execution limits or coordination constraints.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-359 - Multi-Language Backend Parallelization Example

```yaml
plan_unit_id: OSI-359
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the multi-language backend example where Rust backend subtasks split database schema, API endpoints, and
  authentication work across appropriate specialist subagents with dependency ordering.
gui_related: false
gui_classification_reason: This unit covers backend example work, not GUI presentation.
split_recommended: false
depends_on:
- OSI-352
unblocks: []
acceptance_criteria:
- Covered backend example bullets remain losslessly available for exact-text audit.
- Example subtasks remain illustrative and do not create executable work queues.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: multilanguage_backend_parallelization_example
node_compile_hint:
  mode: multilanguage_backend_parallelization_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0160
preserved_exact_tokens:
- Rust backend
- Database schema
- API endpoints
- Authentication
- rust-engineer
- database-administrator
- api-designer
- security-engineer
negative_constraints:
- Example subtasks are not WorkNodes or executable queues.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Backend owners adjudicate implementation task decomposition if promoted.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-360 - Frontend UI Parallelization Example

```yaml
plan_unit_id: OSI-360
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the frontend UI example where component library and API integration subtasks use react-specialist and
  frontend-developer subagents, with API integration depending on backend work.
gui_related: true
gui_classification_reason: This unit covers frontend UI example work and user-visible presentation surfaces.
split_recommended: false
depends_on:
- OSI-359
unblocks: []
acceptance_criteria:
- Covered frontend UI example bullets remain losslessly available for exact-text audit.
- Frontend example remains illustrative and does not create executable UI work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: frontend_ui_parallelization_example
node_compile_hint:
  mode: frontend_ui_parallelization_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0160
preserved_exact_tokens:
- Frontend UI
- Component library
- API integration
- react-specialist
- frontend-developer
negative_constraints:
- Example subtasks are not WorkNodes, NodeSeeds, or executable UI tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- GUI/frontend owner adjudicates any promoted UI implementation.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-361 - Dependency-Level Execution Flow Example

```yaml
plan_unit_id: OSI-361
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the Level 0, Level 1, and Level 2 execution-flow example showing parallel backend/frontend starts and inherited
  context across dependency levels.
gui_related: true
gui_classification_reason: This mixed example includes frontend UI execution flow and backend dependency sequencing.
split_recommended: true
depends_on:
- OSI-359
- OSI-360
unblocks: []
acceptance_criteria:
- Covered execution-flow fenced example remains losslessly available for exact-text audit.
- Mixed backend/frontend example remains source-lineage evidence unless owner docs promote it.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: dependency_level_execution_flow_example
node_compile_hint:
  mode: dependency_level_execution_flow_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0160
preserved_exact_tokens:
- Level 0 (Parallel)
- Level 1 (After Level 0)
- Level 2 (After Task 1)
- inherits context
- inherits API context from Task 1
negative_constraints:
- Example levels are not executable queues.
compatibility_only_notes:
- Mixed GUI/backend example is split_recommended for future owner refinement.
stale_retired_dispositions: []
owner_boundary_notes:
- Backend and frontend owners retain implementation decomposition authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-362 - Parallel Execution Implementation Considerations

```yaml
plan_unit_id: OSI-362
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Parallel execution implementation considerations preserve selection-before-grouping, context caching, worktree creation,
  result aggregation, and continue_on_failure error handling as source-lineage orchestration constraints.
gui_related: false
gui_classification_reason: This unit covers backend orchestration considerations, not GUI presentation.
split_recommended: false
depends_on:
- OSI-038
- OSI-096
- OSI-236
unblocks: []
acceptance_criteria:
- Covered implementation-considerations list remains losslessly available for exact-text audit.
- Checklist items are not executable tasks by themselves.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parallel_execution_implementation_considerations
node_compile_hint:
  mode: parallel_execution_implementation_considerations
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0161
preserved_exact_tokens:
- Subagent Selection Timing
- Context Caching
- Worktree Management
- Result Aggregation
- Error Handling
- continue_on_failure
negative_constraints:
- Implementation considerations are not executable build tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator policy and runtime owners adjudicate promoted behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-363 - Updated Orchestrator Flow

```yaml
plan_unit_id: OSI-363
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Preserve the updated high-level orchestrator flow for cached context detection, dependency graph construction,
  parallelizable groups, subagent selection, worktree creation, parallel execution, merge, cleanup, and level advancement.
gui_related: false
gui_classification_reason: This unit covers backend orchestration flow, not GUI presentation.
split_recommended: false
depends_on:
- OSI-362
unblocks: []
acceptance_criteria:
- Covered orchestrator-flow fenced example remains losslessly available for exact-text audit.
- Flow example does not create executable queues or work manifests.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: updated_orchestrator_flow
node_compile_hint:
  mode: updated_orchestrator_flow
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0162
preserved_exact_tokens:
- Detect project context
- CACHED
- Build dependency graph
- Get parallelizable groups
- Select subagents for each subtask
- Create worktrees
- Execute subtasks in parallel
- Merge results
- Cleanup worktrees
- Advance to next dependency level
negative_constraints:
- Flow example is not an executable work manifest.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime/orchestrator owners adjudicate concrete dispatch flow.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-364 - Platform Capability Execution Classes

```yaml
plan_unit_id: OSI-364
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform capability handling is provider-first, limited to PM-supported runtime surfaces, and classified across direct,
  CLI-bridged, and server-bridged providers under the referenced provider/prompt contracts.
gui_related: false
gui_classification_reason: This unit covers provider/runtime capability classes, not GUI presentation.
split_recommended: false
depends_on:
- OSI-004
- OSI-091
unblocks: []
acceptance_criteria:
- Covered platform capability heading and overview remain losslessly available for exact-text audit.
- Capability handling must not introduce unsupported runtime surfaces.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_capability_execution_classes
node_compile_hint:
  mode: platform_capability_execution_classes
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0163
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0164
preserved_exact_tokens:
- Platform-Specific Capabilities & Extensions
- direct providers
- CLI-bridged providers
- server-bridged providers
negative_constraints:
- Capability handling must not create unsupported runtime surfaces.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider and prompt contracts retain provider capability ownership.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Prompt_Pipeline.md'
```

### OSI-365 - CLI-Bridged Capability Surfaces

```yaml
plan_unit_id: OSI-365
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  CLI-bridged capability surfaces preserve Cursor CLI cursor-agent boundaries, PM-managed account roots and derived
  MCP/instruction projections, Claude Code setup families, and PM-native skill/MCP handling.
gui_related: false
gui_classification_reason: This unit covers provider/runtime capability boundaries, not GUI presentation.
split_recommended: false
depends_on:
- OSI-364
unblocks: []
acceptance_criteria:
- Covered Cursor CLI and Claude Code CLI capability bullets remain losslessly available for exact-text audit.
- Provider/account owners retain auth and setup ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cli_bridged_capability_surfaces
node_compile_hint:
  mode: cli_bridged_capability_surfaces
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0165
preserved_exact_tokens:
- Cursor CLI
- cursor-agent
- PM-managed account roots
- PM-derived MCP/instruction projections
- Claude Code CLI
- subscriber, console/API, and SSO setup families
- PM-native skill and MCP handling remains canonical
negative_constraints:
- CLI-bridged capability notes must not move auth/setup ownership out of provider/account plans.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/account owners retain auth/setup semantics; PM consumes projected runtime facts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
```

### OSI-366 - Direct Provider No-CLI Runtime Surfaces

```yaml
plan_unit_id: OSI-366
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Direct provider surfaces preserve Gemini direct, Codex direct with ChatGPT/API key rows, and GitHub Copilot direct
  semantics without adding Codex or Copilot CLI runtime requirements.
gui_related: false
gui_classification_reason: This unit covers provider/runtime capability boundaries, not GUI presentation.
split_recommended: false
depends_on:
- OSI-364
unblocks: []
acceptance_criteria:
- Covered direct-provider capability bullets remain losslessly available for exact-text audit.
- Direct providers must not gain Codex/Copilot CLI runtime requirements through this document.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: direct_provider_no_cli_runtime_surfaces
node_compile_hint:
  mode: direct_provider_no_cli_runtime_surfaces
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0165
preserved_exact_tokens:
- Gemini direct
- direct API-key provider
- Codex
- ChatGPT
- API key
- GitHub Copilot
- no Codex CLI runtime requirement
- no Copilot CLI runtime requirement
negative_constraints:
- Direct providers must not reintroduce CLI runtime requirements by implication.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Multi-account and provider owners retain direct-provider account semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
```

### OSI-367 - Gemini CLI Separate Provider Entry

```yaml
plan_unit_id: OSI-367
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Gemini CLI remains a separate CLI-backed provider entry whose routing behavior may differ from the originally requested
  model and must be disclosed through requested/effective runtime facts.
gui_related: false
gui_classification_reason: This unit covers provider/runtime capability boundaries, not GUI presentation.
split_recommended: false
depends_on:
- OSI-364
- OSI-366
unblocks: []
acceptance_criteria:
- Covered Gemini CLI bullets remain losslessly available for exact-text audit.
- Gemini direct and Gemini CLI remain separate provider/runtime entries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: gemini_cli_separate_provider_entry
node_compile_hint:
  mode: gemini_cli_separate_provider_entry
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0165
preserved_exact_tokens:
- Gemini CLI
- separate CLI-backed provider entry
- may expose routing behavior
- originally requested model
negative_constraints:
- Gemini CLI must not collapse into Gemini direct provider semantics.
compatibility_only_notes:
- Requested/effective runtime disclosure remains required for provider routing differences.
stale_retired_dispositions: []
owner_boundary_notes:
- Models and multi-account owners retain provider routing/account semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
```

### OSI-368 - Direct Coding-Plan And OpenCode Surfaces

```yaml
plan_unit_id: OSI-368
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Direct coding-plan providers are day-one direct orchestrator-selection surfaces sourced from Models_System requested/effective
  runtime and API-family facts, while OpenCode remains server-bridged through managed or attached server profiles.
gui_related: false
gui_classification_reason: This unit covers provider/runtime capability boundaries, not GUI presentation.
split_recommended: false
depends_on:
- OSI-364
unblocks: []
acceptance_criteria:
- Covered direct coding-plan and OpenCode capability bullets remain losslessly available for exact-text audit.
- Direct coding-plan providers must not be treated as OpenCode-only server entries.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: direct_coding_plan_and_opencode_surfaces
node_compile_hint:
  mode: direct_coding_plan_and_opencode_surfaces
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0165
preserved_exact_tokens:
- Alibaba coding-plan direct
- Z.AI coding-plan direct
- MiniMax coding-plan direct
- Plans/Models_System.md
- OpenCode
- server-bridged provider
- managed or attached server profiles
negative_constraints:
- Direct coding-plan providers must not be downgraded to OpenCode-only server entries.
compatibility_only_notes:
- Primary-source provider detail follow-up remains required for provider-specific facts.
stale_retired_dispositions: []
owner_boundary_notes:
- Models and Multi-Account own accepted provider/account architecture.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
```

### OSI-369 - Platform-Native Package Strategy

```yaml
plan_unit_id: OSI-369
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform-native subagent packages may use skills, plugins, extensions, and agent files for context and lifecycle hooks,
  while installation/discovery routes through platform_specs and provider-aware helpers.
gui_related: false
gui_classification_reason: This unit covers provider/package integration strategy, not GUI presentation.
split_recommended: false
depends_on:
- OSI-364
- OSI-091
unblocks: []
acceptance_criteria:
- Covered platform-native package strategy text remains losslessly available for exact-text audit.
- Installation and discovery must route through platform_specs and provider-aware helpers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_native_package_strategy
node_compile_hint:
  mode: platform_native_package_strategy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0166
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0167
preserved_exact_tokens:
- platform-native packages
- skills/plugins/extensions/agent files
- lifecycle hooks
- platform_specs
- provider-aware helpers
negative_constraints:
- Platform package strategy does not bypass provider-aware installation/discovery ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Platform/provider owners retain installation and discovery authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-370 - Hook Lifecycle Strategy

```yaml
plan_unit_id: OSI-370
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform hooks may enrich lifecycle events through context injection, validation, and quality checks while orchestrator
  policy and verification gates remain the enforcement authority.
gui_related: false
gui_classification_reason: This unit covers lifecycle hook strategy, not GUI presentation.
split_recommended: false
depends_on:
- OSI-139
- OSI-271
unblocks: []
acceptance_criteria:
- Covered hook lifecycle strategy remains losslessly available for exact-text audit.
- Hooks must not own orchestrator policy or verification-gate enforcement.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: hook_lifecycle_strategy
node_compile_hint:
  mode: hook_lifecycle_strategy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0168
preserved_exact_tokens:
- platform hooks
- context injection
- validation
- quality checks
- orchestrator policy
- verification gates
negative_constraints:
- Hooks do not own orchestrator policy or verification-gate enforcement.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator policy and verification contracts remain enforcement authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-371 - MCP Tool Exposure Strategy

```yaml
plan_unit_id: OSI-371
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  MCP may expose tools and interoperability where supported, but tool permissions, evidence, and run policy remain centralized
  in orchestrator/runtime ownership.
gui_related: false
gui_classification_reason: This unit covers MCP/runtime policy boundaries, not GUI presentation.
split_recommended: false
depends_on:
- OSI-365
- OSI-370
unblocks: []
acceptance_criteria:
- Covered MCP strategy remains losslessly available for exact-text audit.
- MCP exposure must not move permissions, evidence, or run-policy ownership out of orchestrator/runtime.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: mcp_tool_exposure_strategy
node_compile_hint:
  mode: mcp_tool_exposure_strategy
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0169
preserved_exact_tokens:
- MCP
- tool exposure
- interoperability
- Tool permissions
- evidence
- run policy
negative_constraints:
- MCP exposure must not move centralized tool permissions, evidence, or run-policy ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator/runtime remain policy owners for tool exposure and evidence.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-372 - CLI Invocation Strategy Stale Disposition

```yaml
plan_unit_id: OSI-372
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The legacy statement that all subagent work executes through provider CLI commands is preserved only as CLI-bridged
  compatibility evidence and must not override the ProviderTransport taxonomy.
gui_related: false
gui_classification_reason: This unit covers stale provider-transport disposition, not GUI presentation.
split_recommended: false
depends_on:
- OSI-364
- OSI-366
- OSI-367
- OSI-368
unblocks: []
acceptance_criteria:
- Covered CLI invocation strategy text remains losslessly available for exact-text audit.
- The stale all-CLI statement must not override direct or server-bridged provider transports.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: cli_invocation_strategy_stale_disposition
node_compile_hint:
  mode: cli_invocation_strategy_stale_disposition
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0170
preserved_exact_tokens:
- CLI Invocation as Execution Truth
- All subagent work executes through provider CLI commands
- explicit args/env
- normalized event parsing from CLI output
- 'ProviderTransport = CliBridge | DirectApi | ServerBridge'
negative_constraints:
- The all-CLI statement must not override ProviderTransport taxonomy.
compatibility_only_notes:
- All-subagent-work-through-CLI wording is CLI-bridged compatibility only.
stale_retired_dispositions:
- The all-CLI runtime claim is stale for direct-provider and server-bridged surfaces.
owner_boundary_notes:
- Provider transport ownership remains in shared contracts and provider plans.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-373 - Platform Capability Manager And Snapshot Rules

```yaml
plan_unit_id: OSI-373
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  PlatformCapabilityManager preserves capability discovery through platform_specs, frozen run/tier snapshot rules, precedence
  from live runtime discovery to provider policy snapshot to static baseline, and the platform.capability_evaluated persistence event.
gui_related: false
gui_classification_reason: This unit covers backend capability snapshot behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-181
- OSI-364
unblocks: []
acceptance_criteria:
- Covered Platform Capability Manager snippet and snapshot rules remain losslessly available for exact-text audit.
- The manager complements provider capabilities.get and must not replace the provider-facing capability API.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_capability_manager_snapshot_rules
node_compile_hint:
  mode: platform_capability_manager_snapshot_rules
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0171
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0172
preserved_exact_tokens:
- PlatformCapabilityManager
- 'platform_specs::discover_platform_capabilities'
- 'live runtime discovery -> provider policy snapshot -> static model/platform baseline'
- platform.capability_evaluated
- capabilities.get
negative_constraints:
- PlatformCapabilityManager must not replace the provider-facing capability API.
compatibility_only_notes:
- Run/tier snapshot wording is preserved as source language and must align to canonical runtime identity if promoted.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider capabilities.get remains provider-facing capability API authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-374 - Enhanced Subagent Invoker Partial Fence Coverage

```yaml
plan_unit_id: OSI-374
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Phase 2B batch 136 preserves only the Enhanced Subagent Invoker heading, Rust fence opening, and source-file comment
  through source line 5626; the remaining invoker body starts at source line 5627 and remains residual under OSI-001.
gui_related: false
gui_classification_reason: This partial boundary unit covers backend invoker source evidence, not GUI presentation.
split_recommended: true
depends_on:
- OSI-240
- OSI-373
unblocks: []
acceptance_criteria:
- S0173 source lines 5623-5626 remain losslessly available for exact-text audit under OSI-374.
- OSI-374 must not claim full enhanced invoker coverage beyond source line 5626.
- S0173 source line 5627 remains the exact next cursor for the following bounded window.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: enhanced_subagent_invoker_partial_fence_coverage
node_compile_hint:
  mode: enhanced_subagent_invoker_partial_fence_coverage
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0173
preserved_exact_tokens:
- Enhanced Subagent Invoker
- '```rust'
- '// src/core/subagent_invoker.rs (enhanced)'
negative_constraints:
- OSI-374 must not claim full enhanced invoker coverage.
compatibility_only_notes:
- ContractRefs and full invoker body remain deferred to the S0173 residual window.
stale_retired_dispositions: []
owner_boundary_notes:
- OSI-001 retains S0173 source line 5627 through 5653 until the next bounded window.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-375 - Enhanced Subagent Invoker Capability Dispatch

```yaml
plan_unit_id: OSI-375
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Enhanced subagent invocation uses platform-specific capabilities by validating the subagent name through the registry,
  resolving invocation method through platform_specs, and dispatching only to MCP or CLI invocation paths represented by
  the source example.
gui_related: false
gui_classification_reason: This unit covers backend invocation dispatch, not GUI presentation.
split_recommended: false
depends_on:
- OSI-240
- OSI-371
- OSI-373
- OSI-374
unblocks: []
acceptance_criteria:
- Covered enhanced invoker body and ContractRef remain losslessly available for exact-text audit.
- Subagent names and platform invocation must not be hardcoded outside registry/platform_specs ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: enhanced_subagent_invoker_capability_dispatch
node_compile_hint:
  mode: enhanced_subagent_invoker_capability_dispatch
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0173
preserved_exact_tokens:
- invoke_with_capabilities
- 'subagent_registry::is_valid_subagent_name'
- 'platform_specs::get_subagent_invocation_method'
- 'InvocationMethod::Mcp'
- 'InvocationMethod::Cli'
negative_constraints:
- No hardcoded subagent names or platform dispatch outside registry/platform_specs ownership.
compatibility_only_notes:
- Rust snippet is plan evidence only until implementation owners accept it.
stale_retired_dispositions: []
owner_boundary_notes:
- DRY rules own subagent-registry and platform_specs reuse requirements.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-376 - Platform Capability Benefits

```yaml
plan_unit_id: OSI-376
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Platform capability benefits preserve context enrichment, validation, quality gates, deterministic transport-aware runtime,
  reusable packaging, and MCP tool access without overriding ProviderTransport ownership.
gui_related: false
gui_classification_reason: This unit covers provider/runtime benefit rationale, not GUI presentation.
split_recommended: false
depends_on:
- OSI-364
- OSI-369
- OSI-370
- OSI-371
- OSI-373
unblocks: []
acceptance_criteria:
- Covered benefits list remains losslessly available for exact-text audit.
- Benefits rationale must not override ProviderTransport or capability ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: platform_capability_benefits
node_compile_hint:
  mode: platform_capability_benefits
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0174
preserved_exact_tokens:
- Rich Context
- Validation
- Quality Gates
- Deterministic Runtime
- ProviderTransport
- CLI-bridged
- direct-provider
- server-bridged
- MCP
negative_constraints:
- Benefits do not override ProviderTransport ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/runtime contracts retain transport taxonomy authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-377 - Capability Operational Considerations

```yaml
plan_unit_id: OSI-377
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Capability operation preserves detection, caching, version-compatibility guards, explicit platform config paths,
  graceful degradation for capability misses, and documentation alignment with provider contracts.
gui_related: false
gui_classification_reason: This unit covers provider/runtime operational considerations, not GUI presentation.
split_recommended: false
depends_on:
- OSI-373
- OSI-369
unblocks: []
acceptance_criteria:
- Covered implementation-considerations list remains losslessly available for exact-text audit.
- Version compatibility and base CLI fallback wording remain compatibility guards, not new transport canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: capability_operational_considerations
node_compile_hint:
  mode: capability_operational_considerations
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0175
preserved_exact_tokens:
- Platform Detection
- Capability Caching
- Version Compatibility
- Configuration Management
- Error Handling
- base CLI flow
- provider contracts
negative_constraints:
- Capability fallback wording must not reintroduce all-provider CLI runtime canon.
compatibility_only_notes:
- Version Compatibility is a compatibility guard.
- Base CLI flow fallback applies only where a CLI-bridged surface exists.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider contracts own provider-specific capability and version facts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-378 - Capability Follow-Up Checklist

```yaml
plan_unit_id: OSI-378
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Capability follow-up checklist items preserve release-note tracking, platform_specs updates, reusable package templates,
  hook evidence points, and deterministic invocation tests as source-lineage planning evidence only.
gui_related: false
gui_classification_reason: This unit covers planning/checklist evidence, not GUI presentation.
split_recommended: false
depends_on:
- OSI-369
- OSI-370
- OSI-371
- OSI-373
unblocks: []
acceptance_criteria:
- Covered next-step checklist remains losslessly available for exact-text audit.
- Next-step bullets are not executable queues or production build tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: capability_follow_up_checklist
node_compile_hint:
  mode: capability_follow_up_checklist
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0176
preserved_exact_tokens:
- Track release notes
- platform_specs
- Expand capability detection
- Package templates
- Hook coverage
- Integration tests
negative_constraints:
- Next steps are not executable queues or production build tasks.
compatibility_only_notes:
- Checklist remains source-lineage planning evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider/platform owners decide whether checklist evidence becomes owner-doc canon.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-379 - Autonomous QA Reference Adoption Boundary

```yaml
plan_unit_id: OSI-379
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  The autonomous QA loop pattern is an external reference input for quality-gate ideas and must not override PM-native
  orchestrator, subagent, and verification contracts.
gui_related: false
gui_classification_reason: This unit covers external reference/adoption boundary, not GUI presentation.
split_recommended: false
depends_on:
- OSI-098
- OSI-107
- OSI-116
unblocks: []
acceptance_criteria:
- Covered Autonomous QA Loop Pattern Integration and Overview text remains losslessly available for exact-text audit.
- External VS Code Copilot pattern material remains reference input only.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_reference_adoption_boundary
node_compile_hint:
  mode: autonomous_qa_reference_adoption_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0177
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0178
preserved_exact_tokens:
- 'https://gist.github.com/gsemet/1ef024fc426cfc75f946302033a69812'
- autonomous QA loop pattern
- VS Code Copilot
- quality gates
negative_constraints:
- External pattern material must not override PM-native orchestration contracts.
compatibility_only_notes:
- External pattern is reference input only.
stale_retired_dispositions: []
owner_boundary_notes:
- PM-native orchestrator and verification contracts retain authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-380 - Autonomous QA Backend Concept Catalog

```yaml
plan_unit_id: OSI-380
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Backend autonomous QA concepts preserve orchestrator/subagent separation, three-tier QA naming, phase-aware execution,
  PAUSE.md halting, and rework commit strategy as source-lineage concepts.
gui_related: false
gui_classification_reason: This unit covers backend orchestration concepts, not visual presentation.
split_recommended: false
depends_on:
- OSI-098
- OSI-107
- OSI-137
unblocks: []
acceptance_criteria:
- Covered backend concept bullets remain losslessly available for exact-text audit.
- Concept bullets remain plan evidence and do not create executable queues.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_backend_concept_catalog
node_compile_hint:
  mode: autonomous_qa_backend_concept_catalog
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0179
preserved_exact_tokens:
- Orchestrator/Subagent Separation
- Three-Tier QA System
- Phase-Aware Execution
- PAUSE.md
- Commit Strategy
negative_constraints:
- Backend concept bullets are not executable work queues.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator and verification owners decide whether concepts become canonical behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-381 - Autonomous QA Visual Status Symbols

```yaml
plan_unit_id: OSI-381
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Autonomous QA visual status concepts preserve the exact visual symbols for progress and incomplete-task prioritization
  as GUI-consumer evidence separate from backend orchestration semantics.
gui_related: true
gui_classification_reason: This unit preserves user-visible status symbols and incomplete-task visual markers.
split_recommended: false
depends_on:
- OSI-380
unblocks: []
acceptance_criteria:
- Covered visual status symbol bullets remain losslessly available for exact-text audit.
- GUI status presentation remains a consumer projection and does not own backend orchestration semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_visual_status_symbols
node_compile_hint:
  mode: autonomous_qa_visual_status_symbols
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0179
preserved_exact_tokens:
- Visual status symbols
- '⬜ 🔄 ✅ 🔴'
- 'Incomplete tasks (🔴)'
negative_constraints:
- Visual symbols do not own backend orchestration state.
compatibility_only_notes:
- Symbols are GUI-consumer evidence until presentation owners accept them.
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI owns user-visible presentation; orchestrator owns status semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-382 - Progress Tracking Visual Status Model

```yaml
plan_unit_id: OSI-382
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Progress tracking visual status model evidence preserves TaskStatus values and exact status symbols for user-visible
  progress presentation while keeping presentation separate from runtime state authority.
gui_related: true
gui_classification_reason: This unit preserves visible progress status symbols and labels.
split_recommended: false
depends_on:
- OSI-381
unblocks: []
acceptance_criteria:
- Covered progress tracking visual status lines remain losslessly available for exact-text audit.
- Visual TaskStatus examples do not redefine canonical runtime status enums.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: progress_tracking_visual_status_model
node_compile_hint:
  mode: progress_tracking_visual_status_model
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0180
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0181
preserved_exact_tokens:
- Enhanced Progress Tracking
- TaskStatus
- NotStarted
- InProgress
- Completed
- Incomplete
- Skipped
- '⬜'
- '🔄'
- '✅'
- '🔴'
- '⏸️'
negative_constraints:
- Visual TaskStatus examples do not redefine canonical runtime status enums.
compatibility_only_notes:
- Integration Opportunities heading is attached coverage for S0181-S0187 units.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime contracts own canonical status enums; GUI consumes display projection.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-383 - ProgressTracker State And Next-Task Selection

```yaml
plan_unit_id: OSI-383
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  ProgressTracker source evidence preserves task progress fields, current-phase tracking, and next-task selection that
  prioritizes incomplete current-phase tasks before not-started current-phase tasks.
gui_related: false
gui_classification_reason: This unit covers backend progress tracking and selection behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-380
- OSI-382
unblocks: []
acceptance_criteria:
- Covered ProgressTracker Rust snippet remains losslessly available for exact-text audit.
- Snippet remains plan evidence and does not create executable scheduling work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: progress_tracker_state_next_task_selection
node_compile_hint:
  mode: progress_tracker_state_next_task_selection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0181
preserved_exact_tokens:
- TaskProgress
- ProgressTracker
- current_phase
- get_next_task
- incomplete tasks in current phase
- not started tasks in current phase
negative_constraints:
- ProgressTracker snippet is not an executable scheduler manifest.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator scheduling owners adjudicate concrete next-task policy.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-384 - Three-Tier QA System Interfaces

```yaml
plan_unit_id: OSI-384
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Three-tier QA system evidence preserves preflight, task-inspector, and phase-inspector interfaces plus complete/incomplete
  feedback classification as source-lineage quality-gate concepts.
gui_related: false
gui_classification_reason: This unit covers backend QA interfaces, not GUI presentation.
split_recommended: false
depends_on:
- OSI-098
- OSI-116
- OSI-124
- OSI-221
unblocks: []
acceptance_criteria:
- Covered QASystem Rust snippet remains losslessly available for exact-text audit.
- QA interface example does not create executable inspector work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: three_tier_qa_system_interfaces
node_compile_hint:
  mode: three_tier_qa_system_interfaces
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0182
preserved_exact_tokens:
- QASystem
- PreflightRunner
- TaskInspector
- PhaseInspector
- run_preflight
- inspect_task
- inspect_phase
- Complete or Incomplete with feedback
negative_constraints:
- QA interface example does not create executable inspector work.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Verification/quality-gate owners adjudicate promoted inspector interfaces.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-385 - Task Inspector Subtask Feedback Integration

```yaml
plan_unit_id: OSI-385
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Task inspector integration evidence preserves post-subagent inspection for subtasks, completed/incomplete marking, and
  feedback prepending for the next iteration.
gui_related: false
gui_classification_reason: This unit covers backend task inspection flow, not GUI presentation.
split_recommended: false
depends_on:
- OSI-120
- OSI-121
- OSI-137
- OSI-384
unblocks: []
acceptance_criteria:
- Covered task inspector integration snippet remains losslessly available for exact-text audit.
- Feedback integration remains source evidence and does not create executable remediation work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: task_inspector_subtask_feedback_integration
node_compile_hint:
  mode: task_inspector_subtask_feedback_integration
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0183
preserved_exact_tokens:
- execute_tier_with_subagents
- 'TierType::Subtask'
- 'InspectionStatus::Complete'
- mark_completed
- 'InspectionStatus::Incomplete'
- mark_incomplete
- prepend_task_feedback
negative_constraints:
- Task inspector feedback snippet is not executable remediation work.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator remediation/inspection owners adjudicate concrete feedback routing.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-386 - Phase Inspector Completion Gate

```yaml
plan_unit_id: OSI-386
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Phase inspector evidence preserves phase completion checking, phase-level inspection, phase task lookup, and phase
  advancement after all tasks complete.
gui_related: false
gui_classification_reason: This unit covers backend phase inspection flow, not GUI presentation.
split_recommended: false
depends_on:
- OSI-107
- OSI-221
- OSI-384
unblocks: []
acceptance_criteria:
- Covered phase inspector snippet remains losslessly available for exact-text audit.
- Phase inspector snippet is plan evidence and not an executable scheduler manifest.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: phase_inspector_completion_gate
node_compile_hint:
  mode: phase_inspector_completion_gate
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0184
preserved_exact_tokens:
- check_phase_completion
- phase_tasks_complete
- inspect_phase
- get_phase_tasks
- advance_phase
negative_constraints:
- Phase inspector snippet is not an executable scheduler manifest.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator/verification owners adjudicate concrete phase inspection behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-387 - Pause Gate File Check

```yaml
plan_unit_id: OSI-387
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Pause gate evidence preserves checking .puppet-master/PAUSE.md before each loop iteration, logging the active pause gate,
  returning a halted result, and waiting for resume.
gui_related: false
gui_classification_reason: This unit covers backend pause detection, not GUI presentation.
split_recommended: false
depends_on:
- OSI-107
- OSI-137
unblocks: []
acceptance_criteria:
- Covered pause gate file-check snippet remains losslessly available for exact-text audit.
- Pause detection example remains plan evidence and does not create executable runtime work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: pause_gate_file_check
node_compile_hint:
  mode: pause_gate_file_check
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0185
preserved_exact_tokens:
- check_pause_gate
- .puppet-master
- PAUSE.md
- Pause gate active - orchestrator halted
- return Ok(true)
- Exit loop, wait for resume
negative_constraints:
- Pause gate example is not executable runtime work.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime/orchestrator owners adjudicate concrete pause semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-388 - Pause Gate GUI Event Projection

```yaml
plan_unit_id: OSI-388
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Pause gate evidence preserves a GUI event projection for pause-gate activation as a consumer-facing runtime signal.
gui_related: true
gui_classification_reason: This unit covers a user-visible GUI event projection for pause state.
split_recommended: false
depends_on:
- OSI-387
unblocks: []
acceptance_criteria:
- Covered GUI event comment remains losslessly available for exact-text audit.
- GUI/runtime views consume the pause event; OSI owns pause detection semantics only.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: pause_gate_gui_event_projection
node_compile_hint:
  mode: pause_gate_gui_event_projection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0185
preserved_exact_tokens:
- Emit event for GUI
negative_constraints:
- GUI event projection does not own pause detection semantics.
compatibility_only_notes:
- GUI event comment is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI/runtime views consume the event; orchestrator owns pause detection.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-389 - Rework Commit Strategy Example

```yaml
plan_unit_id: OSI-389
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Rework commit strategy evidence preserves the example distinction between amended commits for rework and new commits for
  non-rework progress without authorizing history mutation during migration.
gui_related: false
gui_classification_reason: This unit covers backend SCM/commit strategy evidence, not GUI presentation.
split_recommended: false
depends_on:
- OSI-137
- OSI-168
- OSI-172
unblocks: []
acceptance_criteria:
- Covered commit strategy snippet remains losslessly available for exact-text audit.
- Commit amend example is not an instruction to amend repository history during this migration.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: rework_commit_strategy_example
node_compile_hint:
  mode: rework_commit_strategy_example
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0186
preserved_exact_tokens:
- commit_tier_progress
- is_rework
- 'node: {} iteration {} (after review)'
- 'node: {} iteration {} complete'
- commit_amend
- commit
negative_constraints:
- Commit amend example is not an instruction to amend repository history during migration.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- SCM and runtime owners adjudicate concrete commit policy.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-390 - Enhanced Loop Pause And Progress Selection

```yaml
plan_unit_id: OSI-390
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Enhanced loop evidence preserves pause-gate checking, progress reads, next-task selection that prioritizes incomplete
  work, and all-tasks-complete termination.
gui_related: false
gui_classification_reason: This unit covers backend loop control, not GUI presentation.
split_recommended: false
depends_on:
- OSI-383
- OSI-387
unblocks: []
acceptance_criteria:
- Covered enhanced loop pause/progress selection lines remain losslessly available for exact-text audit.
- Loop example is not an executable work queue.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: enhanced_loop_pause_progress_selection
node_compile_hint:
  mode: enhanced_loop_pause_progress_selection
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0187
preserved_exact_tokens:
- run_enhanced_loop
- 'Step 0: Check pause gate'
- 'Step 1: Read progress'
- 'Step 2: Get next task'
- All tasks complete
negative_constraints:
- Loop example is not an executable work queue.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator/runtime owners adjudicate concrete loop behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-391 - Enhanced Loop DRY Selection And Invocation

```yaml
plan_unit_id: OSI-391
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Enhanced loop selection and invocation evidence preserves DRY requirements that subagent selection uses subagent_selector,
  subagent_registry validation, platform_specs invocation, and execute_with_subagents under DRY and Executor Protocol contracts.
gui_related: false
gui_classification_reason: This unit covers backend selector/invocation requirements, not GUI presentation.
split_recommended: false
depends_on:
- OSI-239
- OSI-240
- OSI-375
unblocks: []
acceptance_criteria:
- Covered DRY selection and invocation lines plus inline ContractRef remain losslessly available for exact-text audit.
- Subagent and platform invocation must not be hardcoded outside selector/registry/platform_specs contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: enhanced_loop_dry_selection_invocation
node_compile_hint:
  mode: enhanced_loop_dry_selection_invocation
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0187
preserved_exact_tokens:
- subagent_selector
- subagent_registry
- 'subagent_registry::is_valid_subagent_name()'
- platform_specs
- execute_with_subagents
negative_constraints:
- No hardcoded subagent or platform invocation outside selector/registry/platform_specs contracts.
compatibility_only_notes:
- Inline ContractRef appears inside the Rust fence and remains source-lineage evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- DRY and Executor Protocol contracts own selector/invocation reuse requirements.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/Executor_Protocol.md'
```

### OSI-392 - Enhanced Loop Preflight Failure Handling

```yaml
plan_unit_id: OSI-392
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Enhanced loop preflight evidence preserves Tier 1 QA execution, failed-preflight incomplete marking, error formatting,
  and loop continuation for remediation.
gui_related: false
gui_classification_reason: This unit covers backend preflight failure handling, not GUI presentation.
split_recommended: false
depends_on:
- OSI-108
- OSI-384
unblocks: []
acceptance_criteria:
- Covered preflight failure handling lines remain losslessly available for exact-text audit.
- Preflight snippet is plan evidence and not executable remediation work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: enhanced_loop_preflight_failure_handling
node_compile_hint:
  mode: enhanced_loop_preflight_failure_handling
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0187
preserved_exact_tokens:
- run_preflight
- preflight_result.passed
- mark_incomplete
- Preflight failed
- continue
negative_constraints:
- Preflight snippet is not executable remediation work.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Verification/remediation owners adjudicate concrete preflight failure behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-393 - Enhanced Loop Task Inspection Feedback

```yaml
plan_unit_id: OSI-393
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Enhanced loop task inspection evidence preserves task inspection against commit results, completed/incomplete marking,
  feedback cloning, feedback prepending, and re-looping to fix incomplete tasks.
gui_related: false
gui_classification_reason: This unit covers backend inspection feedback behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-385
- OSI-137
unblocks: []
acceptance_criteria:
- Covered task inspection feedback lines remain losslessly available for exact-text audit.
- Feedback loop snippet is plan evidence and not an executable work queue.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: enhanced_loop_task_inspection_feedback
node_compile_hint:
  mode: enhanced_loop_task_inspection_feedback
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0187
preserved_exact_tokens:
- inspect_task
- result.commit_hash
- mark_completed
- feedback.clone()
- prepend_task_feedback
- Re-loop to fix incomplete task
negative_constraints:
- Feedback loop snippet is not an executable work queue.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator/inspection owners adjudicate concrete feedback loop behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-394 - Enhanced Loop Phase Inspection Advancement

```yaml
plan_unit_id: OSI-394
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Enhanced loop phase inspection evidence preserves phase completion checks, phase inspection, phase task lookup, phase
  advancement, and the closing DRY ContractRef.
gui_related: false
gui_classification_reason: This unit covers backend phase inspection and loop advancement, not GUI presentation.
split_recommended: false
depends_on:
- OSI-386
unblocks: []
acceptance_criteria:
- Covered phase inspection advancement lines and closing ContractRef remain losslessly available for exact-text audit.
- Phase inspection snippet is plan evidence and not an executable scheduler manifest.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: enhanced_loop_phase_inspection_advancement
node_compile_hint:
  mode: enhanced_loop_phase_inspection_advancement
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0187
preserved_exact_tokens:
- phase_complete
- inspect_phase
- get_phase_tasks
- advance_phase
negative_constraints:
- Phase inspection snippet is not an executable scheduler manifest.
compatibility_only_notes:
- Rust snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator/verification owners adjudicate concrete phase advancement behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### OSI-395 - Autonomous QA Benefits Backend Evidence

```yaml
plan_unit_id: OSI-395
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Autonomous QA loop backend benefits preserve quality-assurance, rework-prioritization, safe-pausing, commit-history, and
  phase-discipline evidence without creating tasks or repository-history actions.
gui_related: false
gui_classification_reason: This unit covers backend orchestration benefit evidence, not GUI presentation.
split_recommended: false
depends_on:
- OSI-379
- OSI-380
- OSI-383
- OSI-387
- OSI-389
- OSI-394
unblocks: []
acceptance_criteria:
- Covered autonomous QA backend benefit bullets remain losslessly available for exact-text audit.
- Benefit evidence does not create executable tasks or repository-history actions.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_benefits_backend_evidence
node_compile_hint:
  mode: autonomous_qa_benefits_backend_evidence
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0188
preserved_exact_tokens:
- Better Quality Assurance
- Rework Prioritization
- Safe Pausing
- PAUSE.md
- Better Commit History
- Phase Discipline
negative_constraints:
- Benefit evidence is not executable work and does not authorize repository-history mutation.
compatibility_only_notes:
- Autonomous QA benefits remain source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator and SCM owners adjudicate any promoted runtime or commit behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-396 - Autonomous QA Clear Progress Visibility Evidence

```yaml
plan_unit_id: OSI-396
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Clear progress visibility evidence preserves visual status symbols as GUI-consumer presentation evidence.
gui_related: true
gui_classification_reason: This unit covers user-visible progress/status presentation.
split_recommended: false
depends_on:
- OSI-381
- OSI-382
unblocks: []
acceptance_criteria:
- Covered clear-progress visibility bullet remains losslessly available for exact-text audit.
- GUI progress presentation remains a consumer projection and does not own backend orchestration semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_clear_progress_visibility
node_compile_hint:
  mode: autonomous_qa_clear_progress_visibility
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0188
preserved_exact_tokens:
- Clear Progress Visibility
- Visual status symbols make progress obvious
negative_constraints:
- Visual status symbols do not own backend orchestration state.
compatibility_only_notes:
- Visual status evidence remains GUI-consumer source-lineage material.
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI owns presentation; orchestrator owns runtime status semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-397 - Autonomous QA Implementation Considerations Evidence

```yaml
plan_unit_id: OSI-397
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Autonomous QA implementation considerations preserve progress-file, inspector feedback, pause-file, commit-amending, and
  inspector-subagent examples as compatibility/source-lineage evidence.
gui_related: false
gui_classification_reason: This unit covers backend implementation-consideration evidence, not GUI presentation.
split_recommended: false
depends_on:
- OSI-380
- OSI-383
- OSI-384
- OSI-385
- OSI-387
- OSI-389
unblocks: []
acceptance_criteria:
- Covered autonomous QA implementation-considerations list remains losslessly available for exact-text audit.
- Inspector and commit examples remain source evidence and do not create implementation work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_implementation_considerations
node_compile_hint:
  mode: autonomous_qa_implementation_considerations
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0189
preserved_exact_tokens:
- Progress File Format
- Inspector Feedback
- Pause File Location
- .puppet-master/PAUSE.md
- Commit Amending
- Inspector Subagents
- code-reviewer
- qa-expert
negative_constraints:
- Inspector and commit examples are not executable tasks.
compatibility_only_notes:
- Considerations remain compatibility/source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator, SCM, and Persona/subagent owners adjudicate promoted behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-398 - Autonomous QA Config Example Backend Knobs

```yaml
plan_unit_id: OSI-398
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Autonomous QA config example backend knobs preserve enablement, QA-system, inspector-feedback, feedback-prepending,
  rework-amend, and conventional-format settings as source evidence only.
gui_related: false
gui_classification_reason: This unit covers backend configuration example fields, not GUI presentation.
split_recommended: false
depends_on:
- OSI-380
- OSI-384
- OSI-389
unblocks: []
acceptance_criteria:
- Covered configuration example backend knobs remain losslessly available for exact-text audit.
- The YAML example is not an instruction to create or modify a runtime config file.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_config_backend_knobs
node_compile_hint:
  mode: autonomous_qa_config_backend_knobs
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0190
preserved_exact_tokens:
- .puppet-master/config.yaml
- enableAutonomousQaLoopPatterns
- qaSystem
- trackInspectorFeedback
- prependFeedbackToTasks
- amendForRework
- conventionalFormat
negative_constraints:
- Config example must not create runtime files or executable tasks.
compatibility_only_notes:
- YAML snippet is source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Configuration owners adjudicate any promoted runtime keys.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-399 - Autonomous QA Visual Status Config Knob

```yaml
plan_unit_id: OSI-399
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Preserve the visual-status configuration example as GUI/status evidence only.
gui_related: true
gui_classification_reason: This unit covers user-visible status-symbol configuration evidence.
split_recommended: false
depends_on:
- OSI-381
- OSI-382
- OSI-396
unblocks: []
acceptance_criteria:
- Covered visual status config line remains losslessly available for exact-text audit.
- Visual status config evidence does not own backend status semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: autonomous_qa_visual_status_config_knob
node_compile_hint:
  mode: autonomous_qa_visual_status_config_knob
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0190
preserved_exact_tokens:
- 'useVisualStatus: true  # ⬜ 🔄 ✅ 🔴'
negative_constraints:
- Visual status config evidence does not own backend status semantics.
compatibility_only_notes:
- YAML line is GUI/status source-lineage evidence only.
stale_retired_dispositions: []
owner_boundary_notes:
- Final GUI owns presentation; configuration/runtime owners own accepted settings.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-400 - Media Capability Gating Change Summary

```yaml
plan_unit_id: OSI-400
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Media capability gating change-summary evidence preserves that Orchestrator must call capabilities.get before dispatching
  media.generate and must gate execution on real-time capability state under the media capability owner.
gui_related: false
gui_classification_reason: This unit covers backend capability gating, not GUI presentation.
split_recommended: false
depends_on:
- OSI-181
- OSI-373
unblocks: []
acceptance_criteria:
- Covered media capability gating change-summary line and ContractRef remain losslessly available for exact-text audit.
- Media capability owner retains SSOT authority.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: media_capability_gating_change_summary
node_compile_hint:
  mode: media_capability_gating_change_summary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0191
preserved_exact_tokens:
- capabilities.get
- media.generate
- real-time capability state
- SSOT
negative_constraints:
- Orchestrator evidence must not replace Media Generation and Capabilities ownership.
compatibility_only_notes:
- Change-summary row is source-lineage evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md retains capability-system SSOT.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM'
```

### OSI-401 - Sharded User Project Plan Graph Consumption

```yaml
plan_unit_id: OSI-401
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  User-project plan graph consumption evidence preserves sharded-only plan graph execution from project index and node
  shards, rejects a canonical monolithic graph file, and keeps derived monolithic export as noncanonical.
gui_related: false
gui_classification_reason: This unit covers graph/storage consumption, not GUI presentation.
split_recommended: false
depends_on:
- OSI-018
unblocks: []
acceptance_criteria:
- Covered sharded plan graph change-summary rows remain losslessly available for exact-text audit.
- Monolithic plan_graph.json must not become canonical project graph storage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: sharded_user_project_plan_graph_consumption
node_compile_hint:
  mode: sharded_user_project_plan_graph_consumption
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0191
preserved_exact_tokens:
- SHARDED-ONLY
- .puppet-master/project/plan_graph/index.json
- nodes/<node_id>.json
- .puppet-master/project/plan_graph.json
- exports/plan_graph.monolithic.json
- deterministic node_id
- edges.json
negative_constraints:
- There is no canonical .puppet-master/project/plan_graph.json.
compatibility_only_notes:
- Monolithic export may exist only as a derived export.
stale_retired_dispositions:
- Monolithic project graph storage is retired as canonical storage.
owner_boundary_notes:
- Graph/storage owners retain schema authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-402 - Persona Tier Label Compatibility And Frame Switching

```yaml
plan_unit_id: OSI-402
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Persona Phase, Task, Subtask, and Iteration labels are retired tier-era compatibility/defaulting labels, not live runtime
  canon; Persona switching uses operation frame and requested/effective Persona runtime records without adding tiers or
  restoring Phase/Task/Subtask/Iteration as execution authority.
gui_related: false
gui_classification_reason: This unit covers backend Persona/tier behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-019
- OSI-084
unblocks: []
acceptance_criteria:
- Covered Persona addendum heading, tier reminder, tier defaults, and planning/execution switching sections remain losslessly available as compatibility lineage.
- Persona switching must not add tiers or restore Phase/Task/Subtask/Iteration as live runtime canon.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: persona_tier_compatibility_drift
node_compile_hint:
  mode: persona_tier_label_compatibility_frame_switching
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0192
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0193
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0194
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0196
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
preserved_exact_tokens:
- Phase
- Task
- Subtask
- Iteration
- The orchestrator tier model remains
- node/package/seam graph
- tier_personas
- operation frame
- planning/discussion
- execution
- review/verification
negative_constraints:
- Persona switching must not introduce new tiers.
- Persona Phase/Task/Subtask/Iteration labels must not reassert tier runtime canon.
- Leaving a tier unset does not create an implicit overseer Persona or provider-native agent-file default.
compatibility_only_notes:
- Phase, Task, Subtask, and Iteration survive only as legacy Persona defaulting labels.
stale_retired_dispositions:
- The earlier assertion that the orchestrator tier model remains Phase, Task, Subtask, Iteration is retired for runtime canon.
owner_boundary_notes:
- Persona owner docs retain Persona registry and defaulting authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-403 - Orchestrator Persona Resolution Config Contract

```yaml
plan_unit_id: OSI-403
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator consumes a canonical Persona-resolution config object separate from delegated-subagent registry data,
  validates Persona IDs against persona_registry, and keeps delegated child-run validation with subagent_registry.
gui_related: false
gui_classification_reason: This unit covers backend Persona config and validation behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-019
- OSI-079
- OSI-084
- OSI-095
unblocks: []
acceptance_criteria:
- Covered Persona config contract section and ContractRefs remain losslessly available for exact-text audit.
- Persona registry/storage ownership remains with Personas and storage plans.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: persona_resolution_config_contract
node_compile_hint:
  mode: persona_resolution_config_contract
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0195
preserved_exact_tokens:
- 'manual | auto | hybrid'
- tier_personas
- operation_frame_personas
- requested_persona
- requested_platform
- requested_model
- expires_after_run_start
- persona_registry
- subagent_registry
negative_constraints:
- Persona IDs must validate against persona_registry, not only subagent_registry.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Personas owns registry/storage; OSI consumes for runtime selection.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Personas.md'
- 'ContractRef: ContractName:Plans/Personas.md'
```

### OSI-404 - Requested Effective Persona Runtime Record

```yaml
plan_unit_id: OSI-404
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Every orchestrator tier run must record requested/effective Persona, selection source and reason, requested/effective
  platform/model/variant, and applied/skipped Persona controls.
gui_related: false
gui_classification_reason: This unit covers backend runtime state recording, not GUI presentation.
split_recommended: false
depends_on:
- OSI-019
- OSI-036
- OSI-403
unblocks: []
acceptance_criteria:
- Covered requested/effective runtime state fields remain losslessly available for exact-text audit.
- Persona runtime records do not add tiers or override Persona registry ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: requested_effective_persona_runtime_record
node_compile_hint:
  mode: requested_effective_persona_runtime_record
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0197
preserved_exact_tokens:
- requested Persona
- effective Persona
- selection source
- selection reason
- requested/effective platform/model/variant
- applied Persona controls
- skipped Persona controls
negative_constraints:
- Persona runtime recording must not add tiers.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime and Persona contracts own durable state semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-405 - Persona Runtime State UI Event Availability

```yaml
plan_unit_id: OSI-405
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Persona runtime state must be available to event stream consumers and UI surfaces as consumer projections.
gui_related: true
gui_classification_reason: This unit covers user-visible UI/event availability for Persona runtime state.
split_recommended: false
depends_on:
- OSI-404
unblocks: []
acceptance_criteria:
- Covered UI/event availability line remains losslessly available for exact-text audit.
- UI surfaces consume runtime state and do not own the runtime record.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: persona_runtime_state_ui_event_availability
node_compile_hint:
  mode: persona_runtime_state_ui_event_availability
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0197
preserved_exact_tokens:
- event stream consumers
- UI surfaces
negative_constraints:
- UI surfaces do not own Persona runtime records.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime emits Persona state; UI consumes and displays it.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-406 - Auto Persona Resolution Inputs And Examples

```yaml
plan_unit_id: OSI-406
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Auto Persona resolution consumes tier, task, repo, operation, PRD/plan, and config override signals; example Personas
  remain illustrative, and future sre remains unpromoted until explicit promotion.
gui_related: false
gui_classification_reason: This unit covers backend Persona selection inputs, not GUI presentation.
split_recommended: false
depends_on:
- OSI-084
- OSI-196
- OSI-403
unblocks: []
acceptance_criteria:
- Covered auto Persona resolution inputs and examples remain losslessly available for exact-text audit.
- Future sre remains unpromoted unless a later canonical owner explicitly promotes it.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: auto_persona_resolution_inputs_examples
node_compile_hint:
  mode: auto_persona_resolution_inputs_examples
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0198
preserved_exact_tokens:
- tier level
- task type
- repo language/framework
- PRD/plan recommendations
- rust-engineer
- collaborator
- explorer
- devops-engineer
- performance-engineer
- sre
negative_constraints:
- Future sre Persona is not promoted by this example.
compatibility_only_notes:
- Persona examples are illustrative source evidence.
stale_retired_dispositions: []
owner_boundary_notes:
- Persona registry owner controls promoted Persona IDs.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-407 - Persona Registry Normalization And Provider Seed Boundary

```yaml
plan_unit_id: OSI-407
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Persona registry language normalizes stale explore references to explorer and treats provider-native directories as
  seed/import sources only, with Puppet Master Persona storage as the sole canonical source after import.
gui_related: false
gui_classification_reason: This unit covers backend registry normalization and storage ownership, not GUI presentation.
split_recommended: false
depends_on:
- OSI-083
- OSI-084
unblocks: []
acceptance_criteria:
- Covered registry normalization and provider seed boundary sections remain losslessly available for exact-text audit.
- Provider-native directories are not canonical Persona storage after import.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: persona_registry_normalization_provider_seed_boundary
node_compile_hint:
  mode: persona_registry_normalization_provider_seed_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0199
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0200
preserved_exact_tokens:
- explore
- explorer
- .claude/agents
- provider-native directories
- seed/import sources only
- Puppet Master Persona storage
- sole canonical source after import
negative_constraints:
- Provider-native directories are not canonical Persona storage after import.
compatibility_only_notes:
- explore is stale vocabulary normalized to explorer.
stale_retired_dispositions:
- Legacy explore references are stale and must normalize to explorer.
owner_boundary_notes:
- Persona storage owner retains canonical registry/storage authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-408 - Persona Acceptance Criteria Addendum

```yaml
plan_unit_id: OSI-408
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Persona acceptance criteria preserve defaults/auto selection per tier, Iteration as lowest tier, effective Persona/model/platform
  state emission, and registry language standardized on explorer rather than explore.
gui_related: false
gui_classification_reason: This unit covers backend Persona acceptance criteria, not GUI presentation.
split_recommended: false
depends_on:
- OSI-402
- OSI-403
- OSI-404
- OSI-406
- OSI-407
unblocks: []
acceptance_criteria:
- Covered Persona acceptance criteria remain losslessly available for exact-text audit.
- Persona switching must not add tiers.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: persona_acceptance_criteria_addendum
node_compile_hint:
  mode: persona_acceptance_criteria_addendum
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0201
preserved_exact_tokens:
- Persona defaults/auto selection per tier
- Iteration remains the lowest tier
- effective Persona/model/platform state
- explorer
- explore
negative_constraints:
- Iteration remains the lowest tier; Persona switching must not add tiers.
compatibility_only_notes:
- explore is compatibility/stale vocabulary only.
stale_retired_dispositions:
- Registry and plan language must standardize on explorer, not explore.
owner_boundary_notes:
- Persona owner docs retain registry and tier-default ownership.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-409 - Scored Ready Set Scheduler And Parallel Dispatch

```yaml
plan_unit_id: OSI-409
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator scheduling consumes the executor scored ready-set model, global ready set, canonical score tuple, available
  capacity, queue-analysis observability, DAG readiness, isolation, blocked/backoff states, and remediation lanes.
gui_related: false
gui_classification_reason: This unit covers backend scheduler behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-018
- OSI-030
- OSI-352
- OSI-357
unblocks: []
acceptance_criteria:
- Covered scheduler model, parallel execution contract, runtime addendum heading, and relevant acceptance bullets remain losslessly available.
- Scheduler evidence does not create WorkNodes or executable queues.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: scored_ready_set_scheduler_parallel_dispatch
node_compile_hint:
  mode: scored_ready_set_scheduler_parallel_dispatch
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0202
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0203
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0204
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0213
preserved_exact_tokens:
- global ready set
- canonical score tuple
- available capacity
- queue-analysis observability
- canonical DAG readiness
- worktree/runtime isolation
- blocked/backoff states
- remediation lane handling
negative_constraints:
- Scheduler evidence does not create executable queues or WorkNodes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor, runtime, and storage contracts own scheduler fields and scoring semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
```

### OSI-410 - Worktree Native Conflict Control Observability

```yaml
plan_unit_id: OSI-410
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Parallel safety preserves worktree-native isolation, declared touch-set recording, merge/conflict risk observability,
  blocked or capacity_deferred classification, and backoff/yield policy without introducing file-lease orchestration.
gui_related: false
gui_classification_reason: This unit covers backend worktree/conflict behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-020
- OSI-354
- OSI-357
unblocks: []
acceptance_criteria:
- Covered worktree-native conflict control section and relevant acceptance bullet remain losslessly available.
- This packet does not introduce a file-lease system.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: worktree_native_conflict_control_observability
node_compile_hint:
  mode: worktree_native_conflict_control_observability
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0205
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0213
preserved_exact_tokens:
- worktree-native isolation
- file-lease orchestration
- declared touch sets
- merge/conflict risk
- blocked
- capacity_deferred
- backoff/yield policies
negative_constraints:
- This packet does not introduce a file-lease system.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement, Decision Policy, and storage plans own accepted conflict-control semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md'
```

### OSI-411 - Wake Reason Cascade Semantics

```yaml
plan_unit_id: OSI-411
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator consumes event-driven wakeups, preserves the required wake_reason values, reevaluates direct dependents
  immediately, and makes newly ready nodes eligible in the same wake cycle.
gui_related: false
gui_classification_reason: This unit covers backend wake/cascade behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-018
- OSI-031
- OSI-409
unblocks: []
acceptance_criteria:
- Covered wakeup/cascade semantics and wake_reason list remain losslessly available for exact-text audit.
- Wakeup evidence does not create executable queues.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: wake_reason_cascade_semantics
node_compile_hint:
  mode: wake_reason_cascade_semantics
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0206
preserved_exact_tokens:
- wake_reason
- node_finished
- prerequisite_resolved
- verification_finished
- approval_resolved
- clarification_resolved
- remediation_finished
- backoff_expired
- capacity_changed
- restore_recovery_finished
- replan_patch_applied
- auth_recovered
- startup_recovered
- watchdog_recheck
negative_constraints:
- Newly ready nodes must not be deferred to a later sweep when eligible in the same wake cycle.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor/runtime contracts own canonical wake events.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-412 - Temporal Wait And Timeout Scheduler Semantics

```yaml
plan_unit_id: OSI-412
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator treats scheduled observations, wait timers, and governance waits as explicit scheduler inputs and must not
  infer skipped/failed, stall, pause, or blocked outcomes before the governing timestamp or timer expires.
gui_related: false
gui_classification_reason: This unit covers backend wait/timeout semantics, not GUI presentation.
split_recommended: false
depends_on:
- OSI-411
- OSI-017
unblocks: []
acceptance_criteria:
- Covered temporal observation and wait scheduling section remains losslessly available for exact-text audit.
- Orchestrator must not infer stale-observation failure before governing timestamp or timer expiry.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: temporal_wait_timeout_scheduler_semantics
node_compile_hint:
  mode: temporal_wait_timeout_scheduler_semantics
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0207
preserved_exact_tokens:
- scheduled_workflow_observation_gap
- skipped/failed
- environment_wait_timer
- approval_wait
- queue_wait
- deadlock/stall
- /stall
- timeout_class?
- wait_state_class?
- hard execution timeout
- inactivity timeout
- polling timeout
- reconnect timeout
- user-visible wait timer expiry
negative_constraints:
- Orchestrator/receipts MUST NOT assume skipped/failed merely because no fresh observation arrived.
- Known future-timestamp waits MUST NOT trigger deadlock/stall escalation before expiry.
compatibility_only_notes:
- Receipt timeout/wait fields preserve stale-observation recovery context.
stale_retired_dispositions:
- Stale observation alone is not failure evidence before timer expiry.
owner_boundary_notes:
- Runtime taxonomy owns timeout and wait-state classes.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-413 - Runtime Projection Fields Surfaced By Orchestrator

```yaml
plan_unit_id: OSI-413
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Orchestrator runtime projections must be able to surface the listed attempt, retry, wake, scheduler, backoff,
  safe-point, remediation, and replan fields from owner runtime/storage contracts.
gui_related: false
gui_classification_reason: This unit covers backend runtime projection fields, not GUI presentation.
split_recommended: false
depends_on:
- OSI-017
- OSI-018
- OSI-019
- OSI-020
unblocks: []
acceptance_criteria:
- Covered runtime field list and ContractRefs remain losslessly available for exact-text audit.
- Orchestrator surfaces fields as a consumer and does not redefine storage/runtime contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: runtime_projection_fields_surfaced_by_orchestrator
node_compile_hint:
  mode: runtime_projection_fields_surfaced_by_orchestrator
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0208
preserved_exact_tokens:
- attempt_count
- retry_count
- failure_class
- blocked_reason_code
- wake_reason
- scheduler_lane
- scheduler_score_breakdown
- ready_since_utc
- selected_at_utc
- backoff_until_utc
- safe_point_id
- remediation_root_id
- remediation_parent_attempt_id
- replan_generation
negative_constraints:
- Orchestrator must not redefine storage/runtime contracts for these fields.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- storage-plan, Run Graph View, and Orchestrator Page own referenced projection surfaces.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md'
```

### OSI-414 - Remediation Child Lineage Flow

```yaml
plan_unit_id: OSI-414
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Remediation flow preserves structured finding classification, remediation child lineage, canonical context plus finding
  set, retry/safe-point behavior, remediation ceilings, and explicit recovery options.
gui_related: false
gui_classification_reason: This unit covers backend remediation lineage flow, not GUI presentation.
split_recommended: false
depends_on:
- OSI-166
- OSI-169
- OSI-172
- OSI-197
- OSI-231
unblocks: []
acceptance_criteria:
- Covered remediation flow and relevant acceptance bullet remain losslessly available for exact-text audit.
- Remediation evidence does not create executable remediation tasks.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_child_lineage_flow
node_compile_hint:
  mode: remediation_child_lineage_flow
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0209
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0213
preserved_exact_tokens:
- Canonical remediation flow
- remediation child
- same canonical context plus finding set
- retry ceiling
- remediation ceiling
- exact recovery options
negative_constraints:
- Remediation flow evidence does not create executable remediation tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor/runtime contracts own remediation execution and retry policy.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-415 - Retry Backoff Classifier Matrix

```yaml
plan_unit_id: OSI-415
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Retry/backoff classifier behavior preserves executor classifier families, auto-retry/backoff/safe-point/remediation
  matrix entries, and the rule that blocked reasons must not be coerced into failure_class.
gui_related: false
gui_classification_reason: This unit covers backend retry/backoff classification, not GUI presentation.
split_recommended: false
depends_on:
- OSI-017
- OSI-413
- OSI-414
unblocks: []
acceptance_criteria:
- Covered retry/backoff matrix and relevant acceptance bullet remain losslessly available for exact-text audit.
- Orchestrator must preserve classifier family and must not coerce blocked reasons into failure_class.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: retry_backoff_classifier_matrix
node_compile_hint:
  mode: retry_backoff_classifier_matrix
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0210
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0213
preserved_exact_tokens:
- failure_class
- blocked_reason_code
- provider_transient
- structured_output_invalid
- verification_failed
- reviewer_findings
- permission_denied
- filesafe_blocked
- external_side_effect_blocked
- auth_expired
- graph_integrity
- replan_required
negative_constraints:
- Preserve classifier family; do not coerce blocked reasons into failure_class.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor Protocol, Decision Policy, and Run Modes own classifier taxonomy.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Modes.md'
```

### OSI-416 - Decomposition Degradation Boundary

```yaml
plan_unit_id: OSI-416
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Decomposition fallback may flatten only during draft planning before canonical graph lock; after graph lock, invalid graph
  structure is an integrity failure rather than a fallback case.
gui_related: false
gui_classification_reason: This unit covers backend decomposition/graph boundary behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-018
unblocks: []
acceptance_criteria:
- Covered decomposition degradation and draft fallback sections remain losslessly available for exact-text audit.
- After graph lock, invalid graph structure is an integrity failure, not a fallback case.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: decomposition_degradation_boundary
node_compile_hint:
  mode: decomposition_degradation_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0211
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0219
preserved_exact_tokens:
- draft planning/decomposition before canonical graph lock
- canonical orchestrator execution after graph lock
- degraded flat draft plan
- invalid graph structure
- integrity failure
negative_constraints:
- After graph lock, invalid graph structure is an integrity failure, not a fallback case.
compatibility_only_notes:
- Draft fallback applies only before graph lock.
stale_retired_dispositions: []
owner_boundary_notes:
- Chain wizard, interview, progression gate, executor, and decision policy owners retain graph-lock semantics.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md'
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/chain-wizard-flexibility.md'
- 'ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Executor_Protocol.md'
```

### OSI-417 - Event Driven GUI Projection Alignment

```yaml
plan_unit_id: OSI-417
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Queue and remediation UI projections update from event/projection streams; steady-state polling is not authoritative,
  though debug/watchdog or non-authoritative background refresh polling may remain.
gui_related: true
gui_classification_reason: This unit covers queue/remediation UI projection behavior.
split_recommended: false
depends_on:
- OSI-409
- OSI-411
- OSI-414
unblocks: []
acceptance_criteria:
- Covered event-driven GUI alignment section and UI acceptance bullet remain losslessly available for exact-text audit.
- UI queue/remediation updates must come from event/projection streams rather than authoritative polling loops.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: event_driven_gui_projection_alignment
node_compile_hint:
  mode: event_driven_gui_projection_alignment
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0212
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0213
preserved_exact_tokens:
- event-driven projection updates
- Polling may remain only for debug/watchdog or non-authoritative background refresh
- Queue and remediation UI
- event/projection streams
negative_constraints:
- Queue and remediation UI must not depend on authoritative polling loops for correctness.
compatibility_only_notes:
- Debug/watchdog and non-authoritative background refresh polling remain compatibility use cases.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime/projection streams own canonical updates; UI consumes projections.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-418 - Runtime Scheduler Consumer Alignment And Required Fields

```yaml
plan_unit_id: OSI-418
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator consumes the runtime scheduler contract and must retain queue analysis, attempt identity, remediation lineage,
  blocked outcomes, and required per-runnable-unit fields including permission/model snapshot identifiers.
gui_related: false
gui_classification_reason: This unit covers backend scheduler consumer fields, not GUI presentation.
split_recommended: false
depends_on:
- OSI-017
- OSI-018
- OSI-409
- OSI-413
unblocks: []
acceptance_criteria:
- Covered scheduler consumer alignment and required fields sections remain losslessly available for exact-text audit.
- Orchestrator remains a consumer of runtime scheduler fields and must not redefine them locally.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: runtime_scheduler_consumer_alignment_fields
node_compile_hint:
  mode: runtime_scheduler_consumer_alignment_fields
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0214
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0215
preserved_exact_tokens:
- run_id
- thread_id
- node_id
- attempt_id
- replan_generation
- scheduler_lane
- manual_priority
- transitive_unblock_count
- ready_since_utc
- permission / model snapshot identifiers
negative_constraints:
- Orchestrator must not redefine runtime scheduler fields locally.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor Protocol, Contracts V0, Run Graph View, and storage-plan own required runtime fields.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md'
```

### OSI-419 - Parent Child Attempt Lineage And Blocked Outcomes

```yaml
plan_unit_id: OSI-419
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Subagents and remediation children preserve parent-child lineage across spawn, result ingestion, verification, and retry;
  blocked outcomes preserve local work, exact blocked_reason_code, allowed recovery actions, and no hidden retry/fallback paths.
gui_related: false
gui_classification_reason: This unit covers backend lineage and blocked outcome behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-008
- OSI-009
- OSI-414
- OSI-415
unblocks: []
acceptance_criteria:
- Covered parent-child lineage and blocked outcome sections remain losslessly available for exact-text audit.
- Hidden retries and hidden fallback paths are forbidden for blocked outcomes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: parent_child_attempt_lineage_blocked_outcomes
node_compile_hint:
  mode: parent_child_attempt_lineage_blocked_outcomes
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0216
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0217
preserved_exact_tokens:
- not free-floating tasks
- parent-child lineage
- own attempt_id
- blocked_reason_code
- preserve completed local work
- allowed recovery actions
- avoid hidden retries
- hidden fallback paths
negative_constraints:
- Hidden retries and hidden fallback paths are forbidden for blocked outcomes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor, Permissions, FileSafe, and Project Output Artifacts own canonical lineage and blocked outcome contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md'
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md'
```

### OSI-420 - Immediate Wake Consumer Behavior

```yaml
plan_unit_id: OSI-420
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator projections must update immediately on runtime wakeups so newly unblocked work can be reconsidered in the
  same event cycle rather than waiting for a periodic sweep.
gui_related: false
gui_classification_reason: This unit covers backend wake-consumer behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-411
unblocks: []
acceptance_criteria:
- Covered wake-consumer behavior section remains losslessly available for exact-text audit.
- Orchestrator MUST NOT wait for a periodic sweep to discover runnable work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: immediate_wake_consumer_behavior
node_compile_hint:
  mode: immediate_wake_consumer_behavior
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0218
preserved_exact_tokens:
- runtime wakeups
- newly-unblocked work
- same event cycle
- periodic sweep
negative_constraints:
- Orchestrator projections MUST NOT wait for a periodic sweep to discover runnable work.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime wake events and projection owners control canonical wake behavior.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Executor_Protocol.md'
```

### OSI-421 - Runtime Consumption Rules And Capacity Deferred Boundary

```yaml
plan_unit_id: OSI-421
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Runtime consumption preserves canonical event names and identities, same-cycle prerequisite reevaluation, capacity_deferred
  as the slot-shortage non-selection reason, allowed_action_ids, completed local work for blocked outcomes, and no hidden retries.
gui_related: false
gui_classification_reason: This unit covers backend runtime-consumption rules, not GUI presentation.
split_recommended: false
depends_on:
- OSI-017
- OSI-409
- OSI-415
- OSI-419
unblocks: []
acceptance_criteria:
- Covered runtime consumption rules remain losslessly available for exact-text audit.
- Slot shortage is capacity_deferred, not a blocked outcome.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: runtime_consumption_rules_capacity_deferred_boundary
node_compile_hint:
  mode: runtime_consumption_rules_capacity_deferred_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0220
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0221
preserved_exact_tokens:
- canonical event names and identities
- node.prerequisite_resolved
- non_selected_reason = capacity_deferred
- allowed_action_ids[]
- completed local work
- hidden retries
- fallback loops
- provider-local resubmission
negative_constraints:
- Treat shortage of slots as non_selected_reason = capacity_deferred, not as a blocked outcome.
- Do not hide retries, fallback loops, or provider-local resubmission inside orchestrator code paths.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Contracts V0 and runtime scheduler contracts own canonical events, identities, and allowed actions.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-422 - Remediation Child Attempt Visibility And Replan Boundary

```yaml
plan_unit_id: OSI-422
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Remediation child attempts receive their own attempt_id, inherit parent correlation, remain visible to queue/run graph/orchestrator/artifact
  consumers without becoming canonical graph nodes, block parent dispatch while active, and require accepted/applied replans before new canonical graph work.
gui_related: false
gui_classification_reason: This unit covers backend remediation child attempt behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-414
- OSI-419
unblocks: []
acceptance_criteria:
- Covered remediation execution model section remains losslessly available for exact-text audit.
- Remediation children are visible consumers but are not canonical graph nodes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: remediation_child_attempt_visibility_replan_boundary
node_compile_hint:
  mode: remediation_child_attempt_visibility_replan_boundary
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0222
preserved_exact_tokens:
- attempt_id
- remediation_root_id
- parent_attempt_id
- remediation_generation
- queue analysis
- run graph
- orchestrator lists
- artifact navigation
- not canonical graph nodes
- replan accepted/applied
negative_constraints:
- Remediation children are visible to consumers but are not canonical graph nodes.
- The parent node is not dispatchable while remediation child execution is active.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime creates new canonical graph work only after accepted/applied replan.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs: []
```

### OSI-423 - Same-Cycle Scheduling For Unblocked And Remediation Work

```yaml
plan_unit_id: OSI-423
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Newly unblocked canonical nodes and remediation children that become runnable in a wake cycle must be considered before
  that wake cycle ends, with projections updated from committed runtime events/projections rather than timer polling.
gui_related: false
gui_classification_reason: This unit covers backend scheduling behavior, not GUI presentation.
split_recommended: false
depends_on:
- OSI-411
- OSI-420
- OSI-422
unblocks: []
acceptance_criteria:
- Covered same-cycle scheduling section and ContractRef remain losslessly available for exact-text audit.
- Same-cycle consideration uses committed events/projections rather than timer polling.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: same_cycle_scheduling_unblocked_remediation_work
node_compile_hint:
  mode: same_cycle_scheduling_unblocked_remediation_work
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0223
preserved_exact_tokens:
- Newly unblocked canonical nodes
- remediation children
- wake cycle
- committed runtime events/projections
- timer polling
negative_constraints:
- Orchestrator projections must update from committed runtime events/projections rather than timer polling.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Executor, Contracts V0, and Orchestrator Page own referenced wake/projection contracts.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md'
```

### OSI-424 - Runtime Enum And Counter Family Alignment

```yaml
plan_unit_id: OSI-424
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Runtime enum and counter alignment preserves orchestrator as a consumer of canonical runtime contracts, classified
  failure_class, blocked_reason_code, ordered allowed_action_ids, capacity_deferred slot shortage, new attempt_id creation,
  independent counter families, and retry_count as display-only.
gui_related: false
gui_classification_reason: This unit covers backend runtime enum/counter alignment, not GUI presentation.
split_recommended: true
depends_on:
- OSI-017
- OSI-413
- OSI-415
- OSI-421
- OSI-422
- OSI-423
unblocks: []
acceptance_criteria:
- S0224 source lines 6414-6426 remain losslessly available for exact-text audit under OSI-424.
- S0224 source line 6427 remains residual blank boundary coverage for the next structural disposition batch.
- Orchestrator must not redefine canonical runtime contracts locally.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- >-
  python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
reasoning_tier: standard
context_scope: orchestrator_subagent_standardization
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
risk_class: runtime_enum_counter_family_alignment
node_compile_hint:
  mode: runtime_enum_counter_family_alignment
  create_worknodes: false
source_lineage:
- >-
  Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:orchestrator-subagent-integration-S0224
preserved_exact_tokens:
- failure_class
- blocked_reason_code
- allowed_action_ids[]
- capacity_deferred
- attempt_id
- independent counter-family model
- retry_count
- display-only
negative_constraints:
- The orchestrator is a consumer of canonical runtime contracts and MUST NOT redefine them locally.
- Treat slot shortage as capacity_deferred, not blocked.
compatibility_only_notes:
- retry_count is display-only.
stale_retired_dispositions: []
owner_boundary_notes:
- Contracts V0, Decision Policy, and Executor Protocol own canonical runtime enums and counters.
owner_hints:
- Plans/orchestrator-subagent-integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Executor_Protocol.md'
```
