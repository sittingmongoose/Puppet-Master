# Shard 042: PlanUnits

Source: `Plans/assistant-chat-design.md`

Source lines: L3324-L3661

Source SHA256: `70b52937e6d7839db3294be5fa2332888d67afa77c02c4b95be9438582f1b35f`

---

## PlanUnits

### ACD-001 - Assistant & Chat UI -- Design Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: ACD-001
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plans/assistant-chat-design.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0126
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0127
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0128
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0129
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0130
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0131
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0132
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0133
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0134
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0135
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0136
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0137
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0138
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0139
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0140
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0141
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0142
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0143
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0144
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0145
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0146
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0147
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0148
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0149
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0150
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0151
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0152
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0153
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0154
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0155
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0156
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0157
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0158
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0159
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0160
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0161
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0162
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0163
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0164
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0165
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0166
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0167
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0168
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0169
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0170
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0171
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0172
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0173
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0174
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0175
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0176
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0177
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0178
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0179
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0180
preserved_exact_tokens:
- Assistant & Chat UI -- Design Plan
- Canonical owner-section requirements
- Shared conversational/runtime boundary
- Canonical route payload
- Change Summary
- Rewrite alignment (2026-02-21)
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md'
- Executive Summary
- Table of Contents
- 1. Modes Overview
- 1.0 Primary Assistant mode strip
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md'
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md'
- 1.0A Planning workflow rules
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
- 1.0B Debug Mode contract
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/GitHub_Integration.md'
- 1.0C Runtime mode normalization (canonical)
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
- '1.1 Chat controls: platform, model, and reasoning/effort'
negative_constraints:
- '- **Identity disclosure:** requested/effective runtime identity, account binding, and auth state are imported from the shared runtime contracts. Assistant Chat must not invent a parallel provider/auth field set.'
- '- **Additive field placement:** Assistant Chat treats the additive field design from `Plans/Contracts_V0.md` as frozen for this surface; reconciliation may align wording and placement but must not reopen the shared field set.'
- '- A revalidation gate surfaces an explicit reason in the Investigation Context; it MUST NOT silently continue as though the earlier target binding were still valid.'
- There are **two separate ELI5 toggles**; they are independent and must not be conflated. The authoritative dual-copy checklist for in-scope strings is `Plans/FinalGUISpec.md` §7.4.0.
- '- Ordinary fenced code blocks render an always-visible copy button; the copy affordance/behavior may add emphasis or secondary controls on hover/focus, but copy availability must not depend on hover-only discovery.'
- '- The now-locked `/web` direction keeps web research as a first-class Assistant, Interviewer, and doc-builder capability even in Plan or Deep Plan contexts; permission-mode/mode-override rules must not silently auto-deny web-research, websearch, webfetch, model-native, provider-native, or PM-compose'
- '- Bare `/web` is /help-only autocomplete and dispatches `cmd.chat.web.help`; executable web intents must resolve to an explicit subcommand and must not create slash-only or search-only event families.'
- '- The assistant MUST NOT silently reinterpret a Git request as a GitHub request, or vice versa, just because one path appears easier.'
- '- Teach MUST NOT persist secrets, tokens, passwords, or other credentials'
- '- The locked attachment taxonomy replaces any older two-type rendered-selection wording with three explicit paths: browser-element (`browser_element_context`), browser-text-selection (`browser_selection_context`), and native-document-selection (`document_selection_context`). Browser text capture mus'
- '- Dismissed and paused flows preserve submitted-vs-dismissed distinction: `status = "dismissed"` / dismissed state pauses the flow and must not fabricate partial submitted answers, auto-submit, or auto-cancel the broader thread. Paused is UI-only for a backgrounded/navigated-away widget and does not'
- '- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.'
- '- targeted revision MUST NOT auto-run Multi-Pass Review'
- '- `selection-to-chat` and `document-selection` always create chat-visible pending composer chips; they must not silently inject hidden messages or mutate a thread before the user sends.'
- '- GUI defaults: the annotation drawer may `auto-open` only on the first durable annotation creation in a bundle/page context; after that, drawer state is sticky and must not force-open for every annotation. Hidden chat on `send-to-chat` does not auto-open by default: the surface adds the selection t'
- '- The unified `pre-send` composer prep strip/tray groups typed chips by source, including `doc selection`, `browser context`, `Context Lens`, and attachments where applicable. Do not create a `document-selection-only` `/tray` or a separate document-only strip.'
- '- Chat must not render `full-document` bodies inline for Builder or Interview handoff. It should keep `/document-pane` or editor pointers plus bounded excerpts, context summaries, and provenance instead of dumping the whole document into chat.'
- Secondary affordances may include `Open in Editor`, `Save As`, and, after an accept action, `Queue Execution` when another run is active in the same thread. Crew execution may be selected through execution configuration or a crew-specific flow, but it must not replace the four primary post-plan choi
- '- File Manager `Add to Assistant Chat` uses that command to insert a visible canonical file reference into the active composer/thread context; it must not inline full file contents as a hidden side effect'
- '- file references are file-only in MVP; folder insertion is out of scope'
- 'The files-touched strip is an aggregate chat preview: clicking a path under files-touched, `Read:`, or `Edited:` opens the canonical source file, while any diff-oriented affordance opens the canonical diff/review owner surface. Chat may preview diffs and edit counts, but it must not own hunk-level s'
- '- **Project-only by default:** Auto-retrieval searches **only within the current project** (project-scoped indices; see §10.3). It MUST NOT search other projects or external sources unless the user explicitly requests external navigation/import (§7.4).'
- '- Retrieved Context is **not** “memory” and must not be written into the Assistant memory store unless separately captured as a verified gist (Plans/assistant-memory-subsystem.md).'
- '- the system MUST NOT mint a durable `thread_id` for an unsent empty draft'
compatibility_only_notes:
- '- /assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT. `/revert` is active only through the command-catalog-owned `cmd.chat.revert` file-mutation restore path; it is not a conversation rewind or thread-clear alias.'
- '- Settings and help surfaces disclose provider support through a compatibility-matrix style view for first-class web tools, including support tier, provider order/fallback, credential state, and unavailable/high-side-effect controls.'
- '- Legacy `/what` lineage is compatibility/help-only and may surface usage or autocomplete guidance, but it does not bypass the explicit `/web` subcommand grammar.'
- '- compatibility-matrix'
- '- `single_question` is legacy syntactic sugar over the questionnaire envelope with exactly one QuestionItem; it uses the same answer source, draft, dismissal, and submit lifecycle as `questionnaire`. Decision #9 resolves the earlier Future Fields / TBD annotation: `response_kind` is LOCKED to `"sele'
- '- Legacy tool-shape aliases `header?: string`, `text: string`, and `options?: string[]` are accepted only at the compatibility boundary and normalize into the questionnaire envelope; legacy `answer: string` output normalizes into the canonical answer array with source metadata.'
- '- Multi-question `questionnaire` and `/questionnaire` cards render selectable options from `options?: Array<{id, label, description?}>`; `string[]` remains backwards-compatible only for legacy `single_question` callers and must be normalized to object-array options before draft storage, validation, '
- '- Question-card inputs support `allow_other`, `allow_multi_select?: boolean`, `required?: boolean`, `placeholder?: string`, and legacy `default_value?: string | string[]` as compatibility aliases that normalize into canonical `allow_freeform`, `multi_select`, `required`, `placeholder`, and `default_'
- '- The minimum output compatibility shape is `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`, `answers: Array<{ question_id, value, source: "option" | "other" | "freeform" }>`, `submitted: boolean`, and `submitted_at?`; canonical storage may also expose `answers: Array<'
- '- `/dismiss` is a retired shorthand for the same question-card exit path; canonical behavior is the dismissed/paused state transition above.'
- '- The question-flow supports single-choice and multi-choice question-card layouts; `allow_other = true` keeps the `Other` freeform route visible for legacy /callers as well as new questionnaire callers.'
- '- Legacy optional spellings `notes?` and `order_index?` normalize to canonical `notes` and `order_index`; this intentionally retires the source `?` suffix rather than dropping notes or ordering.'
- '- Legacy tool payloads `todos: Array<{ id?, content, status? }>` and `todos: Array<{ id, content, status }>` normalize into the Assistant TODO schema with `todo_id`, `title`, `summary`, `dependencies[]`, `owner_hint`, and `verification_hint`; `TODO` remains the visible checklist concept, not a secon'
- Terminal-associated threads are ordinary chat threads with terminal lineage, not a second terminal-thread identity model. If a message, command card, restore target, or permission path describes the owning thread as `terminal or non-writable`, the surface MUST treat that thread as terminal-associate
- '- The legacy compact badge shorthand `pending→running→completed|failed|cancelled` is only a base path; `running → blocked` and `blocked → running | cancelled` are explicit transitions triggered by recoverable waits such as permission denied, FileSafe held, or MCP unavailable.'
- '- Command-card `/edit/manage` menus expose terminal-focus, `View output`, `View output log`, `Retry attach`, and `Stop process` only when the referenced terminal/session state supports them. The legacy `Pop Out Terminal` label is a deprecated alias for `Detach/Pop-Out`.'
- '### 27.7 Provider compatibility disclosure in chat'
- Status bindings expose `dirty_state`/`/dirty_state` and `conflict_state`/`/conflict_state` to the icon renderer for compatibility with older state labels; canonical rendering still reads from `worktree_projection.v1:{project_id}:{worktree_id}`. All worktree controls have accessible labels, and creat
- '`blocked_notice` packets include the blocked reason, detail ref, `/attempt` and node references when applicable, preserved-local-work summary, and ordered `allowed_action_ids[]` / `allowed_action_ids` action rendering. `wizard.blocked` and `node.blocked` consume the same stronger blocked taxonomy; a'
stale_retired_dispositions:
- '- The message-stream control row keeps a thread-visible copy-icon on user and assistant messages, exposes `/submit`/stop morphing in the composer, and scopes `Stop`, `Edit`, and `Resend` to the most recent user-sent message only. `/edit/delete` is retired as a shorthand: edit and resend are supporte'
- '- `/control` is a retired generic shorthand in this section; use `message-control` plus the concrete Stop/Edit/Resend, send-stop morph, copy-icon, and jump controls.'
- '- /composer is a retired shorthand label; composer behavior is represented by the send/stop morph and most-recent-message actions above.'
- '- deprecated aliases shown distinctly from active commands'
- '- /assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT. `/revert` is active only through the command-catalog-owned `cmd.chat.revert` file-mutation restore path; it is not a conversation rewind or thread-clear alias.'
- '- Migration `/alias` and `/deprecation` handling keeps `/cancel` visibly deprecated toward `/stop` and keeps retired `/clear` behavior out of active command canon unless the command-catalog owner re-promotes it.'
- '- Assistant Chat command-routing consumes `Plans/UI_Command_Catalog.md` for `/web`, `/skill`, reserved built-ins, and source obligation carry-through for `obl-037`, `obl-046`, `obl-047`, `obl-048`, and `obl-051`; stale local summaries are `/retire` lineage until the command-catalog owner promotes an'
- '- The locked attachment taxonomy replaces any older two-type rendered-selection wording with three explicit paths: browser-element (`browser_element_context`), browser-text-selection (`browser_selection_context`), and native-document-selection (`document_selection_context`). Browser text capture mus'
- '- `allow_freeform` is canonical. `allow_other` is a retired alias, and the historical `allow_freeform? / allow_other?` slash-ambiguity resolves to `allow_freeform`.'
- '- `/dismiss` is a retired shorthand for the same question-card exit path; canonical behavior is the dismissed/paused state transition above.'
- '- allow_other (retired alias; use allow_freeform)'
- '- User edits to a Deep Plan artifact reconcile through PM-extracted `/diffs`: TODO changes are normalized into the thread TODO list, emitted through `chat.plan_todo_updated`, and execution continues from the updated TODO projection rather than from a stale artifact copy.'
- '- conflicting or stale mutating annotations are excluded from automatic revision until the user resolves them'
- '- Conflict and stale outcomes are explicit: `overlaps`, `contradicts`, and `stale_after_edit` are later-phase conflict/status labels that can appear in audit or review UI, while current automatic revision still excludes conflicting mutating annotations until resolved.'
- '- `grep(pattern, path?, glob?)` -> transparent regex search over project files. When the per-project sparse n-gram index can narrow the query, grep uses it without changing the interface, limit, timeout, or permission model. When the index is missing, disabled, corrupted, building without a valid sn'
- 'The agent-facing `search-tool` summary in `Plans/assistant-chat-design.md` (`/assistant-chat-design.md`) preserves same-freshness guarantees: stale-index disclosure must say when a valid snapshot is serving results, when raw ripgrep fallback is active, and when dirty-layer freshness is still protect'
- '**Revalidation reasons** that prevent silent resume include at minimum target replacement, auth/account switch, worktree or branch drift, HEAD drift for bound file/worktree targets, expired instrumentation, and stale safe-point or remediation lineage.'
- '`Plans/assistant-chat-design.md` and `Plans/usage-feature.md` are the primary feature owners for context/usage display; command, storage, runtime-identity, and artifact-target docs remain required consumers so `/open` behavior resolves through canonical route/open to the editor-tab Context Detail Pa'
- Chat-local aliases such as `primary_target` and `final_or_intermediate_state` are retired. Assistant Chat consumes the canonical field names above and may layer presentation labels on top, but it must not rename the durable data contract. This is the canonical Contracts_V0 §5.1A to assistant-chat-de
- '- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.'
- '- Command-card `/edit/manage` menus expose terminal-focus, `View output`, `View output log`, `Retry attach`, and `Stop process` only when the referenced terminal/session state supports them. The legacy `Pop Out Terminal` label is a deprecated alias for `Detach/Pop-Out`.'
- Reference lists must defer to live owner docs instead of stale section-number citations.
- '- **Plans/Commands_System.md:** Reserved built-in slash-command set for chat surfaces; see `Plans/Commands_System.md#7. Reserved built-in slash commands` for the canonical `/web` family behavior and deprecated aliases.'
- '**Status source:** Chat header icon and thread selector icon read from `worktree_projection.v1:{project_id}:{worktree_id}` which includes `dirty_state` and `conflict_state` fields. UI subscribes to projection changes via standard reactive binding. If `projection_freshness = stale`: icon shows last-k'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Shared conversational/runtime boundary'
- '### Canonical route payload'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- 2026-02-26: Added media generation and capability introspection requirements (§7): image attachment nuance (all platforms accept image attachments; image *generation* is Cursor-native or Google-key-backed), `capabilities.get` introspection rule, natural-language model override semantics (per-messa'
- '- 2026-02-25: Added §5.3 Git & GitHub command boundary and §23.6 Git & GitHub parity note; cross-references Plans/GitHub_Integration.md.'
- '- 2026-02-25: Added §26 Per-Pass Validation Model/Provider Settings UX: settings group for per-pass (Pass 1/2/3) provider+model selection for the Three-Pass Canonical Validation Workflow (Plans/chain-wizard-flexibility.md §12). Stored in app settings (not project artifacts). Deterministic defaults v'
- '- 2026-02-24: Aligned Interview/Assistant output surfacing with **canonical sharded plan graphs** under `.puppet-master/project/plan_graph/` (**index + node shards**). Outputs are **persisted canonically in seglog** and projected into `.puppet-master/project/...` for file-based review; `.puppet-mast'
- '- 2026-02-23: Added Interview chat UX cross-reference to Contract Layer outputs and required `.puppet-master/project/*` artifact pack so interview completion is maximally AI-executable and verifiable (SSOT: `Plans/Project_Output_Artifacts.md`, `Plans/chain-wizard-flexibility.md` §5.7/§11).'
- '**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/Contracts_V0.md`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/UI_Command_Catalog.md`.'
- '- [5.3 Git & GitHub command boundary](#53-git--github-command-boundary)'
- '| Primary Assistant mode | Purpose | Canonical runtime posture | Default execution posture | Primary outputs | Default next step |'
- '### 1.0C Runtime mode normalization (canonical)'
- The chat surface exposes both workflow overlays and runtime execution posture. Only the runtime posture normalizes into the canonical run-envelope `mode` used by `Plans/Run_Modes.md`.
- '| UI/workflow state | Canonical runtime mode | Notes |'
- 'Expert/ELI5 copy pairs must remain behaviorally equivalent: Expert text uses precise, compact system-model language, while ELI5 text uses plain-language explanation plus one concrete example. The dual-copy rule covers authored `/help` and tooltip text; it does not create a separate `concept-help` sy'
- '- **Regular mode:** Agent asks for permission before executing or editing. User-facing approval follows the canonical ladder: `deny`, `once`, `for session`, `always`.'
- This section defines the canonical contract for this surface.
- '- The message-stream control row keeps a thread-visible copy-icon on user and assistant messages, exposes `/submit`/stop morphing in the composer, and scopes `Stop`, `Edit`, and `Resend` to the most recent user-sent message only. `/edit/delete` is retired as a shorthand: edit and resend are supporte'
- Composer behavior is the live owner surface for the send/stop morph, per-message stop scope, jump-to-bottom affordance, always-visible copy controls, and the no-delete message policy. These rules remain part of the message-control contract above rather than a separate command family or chat-local hi
- The reserved slash-command surface is canonical and non-overridable.
- This section consumes the linked owner contract and stays aligned with it.
- '- /assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT. `/revert` is active only through the command-catalog-owned `cmd.chat.revert` file-mutation restore path; it is not a conversation rewind or thread-clear alias.'
owner_hints:
- Plans/assistant-chat-design.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

