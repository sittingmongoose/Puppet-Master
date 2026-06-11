# Shard 044: PlanUnits

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L6434-L6816

Source SHA256: `a29fb722e82fd1f89823b9be4c7a2aaa3b75418b6d3659c9b6657c0b15971241`

---

## PlanUnits

### OSI-001 - Orchestrator Subagent Integration -- Implementation Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: OSI-001
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Plans/orchestrator-subagent-integration.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0126
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0127
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0128
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0129
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0130
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0131
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0132
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0133
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0134
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0135
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0136
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0137
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0138
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0139
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0140
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0141
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0142
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0143
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0144
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0145
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0146
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0147
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0148
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0149
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0150
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0151
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0152
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0153
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0154
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0155
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0156
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0157
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0158
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0159
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0160
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0161
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0162
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0163
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0164
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0165
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0166
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0167
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0168
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0169
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0170
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0171
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0172
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0173
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0174
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0175
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0176
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0177
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0178
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0179
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0180
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0181
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0182
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0183
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0184
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0185
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0186
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0187
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0188
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0189
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0190
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0191
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0192
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0193
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0194
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0195
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0196
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0197
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0198
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0199
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0200
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0201
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0202
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0203
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0204
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0205
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0206
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0207
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0208
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0209
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0210
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0211
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0212
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0213
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0214
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0215
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0216
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0217
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0218
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0219
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0220
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0221
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0222
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0223
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:orchestrator-subagent-integration-S0224
preserved_exact_tokens:
- Orchestrator Subagent Integration -- Implementation Plan
- Canonical owner-section requirements
- Retire tier-era canon and shadow fields
- Coverage blocker worktree allocation strategy
- Plan Document Status
- Executive Summary
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md'
- Task tool contract alignment
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/MCP_Integration.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
- Runtime scheduler, identity, and worktree reconciliation
- Cross-surface receipt record
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/usage-feature.md'
- Rewrite alignment (2026-02-21)
- Persistence and event emission (rewrite)
- 'Config Wiring — Option B: Build at Run Start (Resolved, Canonical Definition) {#config-wiring}'
- Test Strategy Loading {#test-strategy-loading}
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2'
- Relationship Between the Two Plans
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
- Tier-Level Subagent Strategy
negative_constraints:
- References to external bridge or A2A mapping material are adapter guidance only. They MUST NOT be read as approval for PM-internal child orchestration, child-run control messages, budget propagation, or crew coordination to move onto A2A semantics.
- Orchestrator consumes canonical runtime fields and event names from shared contracts; it must not revive local page-spec ownership such as `PuppetMasterEvent::*`, PuppetMasterEvent, `/type`, or `/schema` as first-class runtime schema. Exact transfer rows that mention exact_items, exact-missing, miss
- Delegated work and memory loops remain parent-owned. Fresh-iteration loops may read `/plan`, append-only progress, reusable-pattern summaries, repo state, git history, `/gotchas`, and files changed, but they do not create hidden orchestrator memory beyond assistant-memory-subsystem, assistant-memory
- 'Scoped overrides have explicit lifecycle boundaries: turn, session, run, task, and subagent overrides are separate records and must not collapse into one sticky runtime setting. TierContext is retained only as a compatibility wrapper that may carry legacy_decomposition_context beside canonical execu'
- '`ActiveAgent`, crew structs, and coordination payloads key first on canonical execution refs such as run/thread/parent-child/node/attempt/package/seam/lane identity. Any `tier-keyed` field is a compatibility label only; it must not outrank `/package/seam` runtime identity or become a primary crew lo'
- 'Orchestrator action metadata is `command-owner` bound to `Plans/UI_Command_Catalog.md` / `UI_Command_Catalog`: every Orchestrator action declares whether it is `palette-visible`, `shortcut-worthy`, `context-menu` only, `bulk-safe`, or `bulk-forbidden`, and bulk mutation remains disabled unless the c'
- Graph schemas must not `hard-code` lexicographic selection as execution authority. The scored `ready-set` is canonical; schemas and consumers preserve `node-first` `runnable-unit` identity, while `/task/subtask` and `Iteration` are display or compatibility lenses only.
- '- **Orchestrator invocation builder:** Use the same code path the orchestrator uses to build the CLI command (e.g. a function that takes `platform`, `tier_type`, `subagent_name`, `prompt`, `model` and returns `Command`). Do not duplicate logic in tests.'
- '- the orchestrator must not silently widen a read-only planning run into execution authority.'
- '- **GUI/spec copy:** Config, Wizard, and Doctor GUI text must say "Configure Gemini access" or name the resolved auth mode; it MUST NOT frame "Gemini API key" as the primary or `/only` settings path when OAuth or Google/Vertex credential modes are valid for the selected provider entry.'
- 'Competitive-reference posture remains evidence-weighted: Antigravity-style high-level manager or `/agent-terminal` patterns are lower-confidence reference material than VS Code, Cursor, JetBrains, and OpenCode evidence, and must not override PM-native parent supervision, terminal ownership, or deleg'
- '- **Reject** invalid entries with a clear error message. Do not save config with invalid subagent names.'
- '- **Fail fast** with a clear error: "Unknown subagent ''[name]'' in tier config. Available: [list]." Do not silently filter.'
- '- **Mitigation:** Accept for v1 that overrides are per tier type. Document that per-node overrides (or context-aware overrides) are out of scope for the first version. Dynamic selection (language/framework) still differentiates parallel subtasks when overrides are not set.'
- '- **Prompts:** In `prompt_templates.rs` (or equivalent), inject the configured min (and max if set) into the instructions, e.g. "Ask at least {min} questions..." and "Do not exceed {max} questions..." when max is set.'
- 1. **Execution config type:** Add the field to the **runtime config** used by the component that executes (e.g. `InterviewOrchestratorConfig`, or the `PuppetMasterConfig` / tier config used by the main orchestrator). Do not only add it to GUI or file-only config.
- This table is the source of truth for `validate_config_wiring_for_tier(...)`. Readiness MUST NOT be heuristic prose.
- A tier MUST NOT start when a required execution-affecting field is unwired, unavailable, or inconsistent.
- '- performance concerns MUST NOT weaken the verification categories; implementation may scope work to changed artifacts, but may not silently skip categories'
- '- **LLM extraction:** Run a lightweight extraction subagent (e.g., `knowledge-synthesizer` if promoted, otherwise a workflow-resolved drafting/synthesis Persona such as `general-purpose` or a retained specialty) on Phase 1 output to extract structured memory entries. Do not require a protected core '
- '- **When called:** Immediately before the orchestrator builds execution context or spawns the agent for that tier (i.e. at Phase start, Task start, Subtask start, Iteration start). Do not skip validation for "fast path" or tests unless explicitly gated (e.g. env var to disable for a specific test).'
- Gap-era crew notes in this section are retired as canonical guidance. The live crew rules now resolve through the orchestrator contracts elsewhere in this document rather than through illustrative fallback numbers, and the superseded gap-era examples that previously followed this heading MUST NOT be
- Later illustrative examples in this file MUST NOT widen or replace those values. Availability checks MAY narrow admission further based on platform support, current saturation, quota posture, or policy, but they MUST fail closed rather than inventing alternate per-gap ceilings.
- User-initiated crews remain future Assistant functionality. When that surface lands, platform selection, queueing, and subagent admission still resolve through the same orchestrator-owned ceilings and compatibility checks defined here and in `executionLimits`; future UX MUST NOT reintroduce alternat
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- 'The legacy duplicate heading string `#### Task-envelope timeout contract` is retired as a separate live heading. The singular child timeout envelope above is the non-contradictory owner contract: terminal elapsed-time completion is `done.task_timeout`, while pre-dispatch and post-response budget out'
- 'The scheduling model is graph-native: runnable graph nodes, DAG readiness, scored ready-set selection, and runtime-selection use plan-graph, plan_graph, project_plan_graph_index, project_plan_graph_index.schema.json, plan_graph.schema.json, `/project/plan_graph/index.json`, puppet-master/project/pla'
- 'Worktree allocation is package-based by default with seam/lane exceptions documented by policy. SCM and /worktree behavior uses Plans/WorktreeGitImprovement.md, /WorktreeGitImprovement.md, package-based lane pools, branch-per-tier compatibility notes, contamination quarantine, restore-before-reuse, '
- Provider and permission boundaries stay explicit. Plans/Provider_Stream_Mapping_External_Reference_A2A.md and /Provider_Stream_Mapping_External_Reference_A2A.md are adapter references only; hard-wires to tier scope are non-canonical when they drop /account/trust metadata. Permissions_System.md and P
- 'Scoped overrides have explicit lifecycle boundaries: turn, session, run, task, and subagent overrides are separate records and must not collapse into one sticky runtime setting. TierContext is retained only as a compatibility wrapper that may carry legacy_decomposition_context beside canonical execu'
- Destructive action taxonomy is canonical. `non_reversible` covers durable `/live` state mutation such as deleting records or `/skills/files` without a protected restore path. FinalGUISpec.md, /FinalGUISpec.md, page-spec, Overseer, Package, Lanes, detached_window, project-state, artifact_kind, task_i
- '`ActiveAgent`, crew structs, and coordination payloads key first on canonical execution refs such as run/thread/parent-child/node/attempt/package/seam/lane identity. Any `tier-keyed` field is a compatibility label only; it must not outrank `/package/seam` runtime identity or become a primary crew lo'
- Graph schemas must not `hard-code` lexicographic selection as execution authority. The scored `ready-set` is canonical; schemas and consumers preserve `node-first` `runnable-unit` identity, while `/task/subtask` and `Iteration` are display or compatibility lenses only.
- '- GitHub Copilot and Codex subagent execution use direct-provider account rows rather than legacy CLI assumptions.'
- '- Demote TierContext to a derived or compatibility-only selection/decomposition helper.'
- '- Any remaining `TierContext` or `tier_id` mention in this subsection is compatibility-only and never canonical runtime state.'
- '`scm_lineage_snapshot` is a projector-owned Orchestrator consumer snapshot assembled from canonical runtime, storage, and Source Control records for UI inspection, run receipts, blocked `/recovery`, and later `/reconciliation`. It does not replace the owner records. Every run, node, `/tier/attempt`,'
- '### Compatibility retirement'
- 2. **Generic fallback:** Attempt generic text extraction — scan for completion signals (including legacy naming variants), error patterns (stack traces, "error:", "fatal:"), and file modification markers.
- '- **Issue:** Some projects may use a different config format (e.g. legacy or alternate YAML shape). `gui_config::load_config` might fail or return a partial struct.'
- User-initiated crews remain future Assistant functionality. When that surface lands, platform selection, queueing, and subagent admission still resolve through the same orchestrator-owned ceilings and compatibility checks defined here and in `executionLimits`; future UX MUST NOT reintroduce alternat
- 3. **Version Compatibility:** Guard capability use by known version constraints.
- Legacy references to `explore` are stale and must be normalized to `explorer` in the canonical registry and all derived selection logic.
- '- Receipts and blocked projections generated by Orchestrator retain `timeout_class?`, `wait_state_class?`, source timer refs, and the timestamp that caused transition so recovery can distinguish retry, reconnect, wait-for-user, and stale-observation paths.'
stale_retired_dispositions:
- 'The stale later-stage example `Enforce maximum concurrent crews (e.g., 20 total)` from `Gap #45: Crew performance and scalability` is non-canonical. Crew and child admission use the executionLimits owner contract; no later-stage prose may reintroduce parallel caps that compete with that SSOT.'
- 'The legacy duplicate heading string `#### Task-envelope timeout contract` is retired as a separate live heading. The singular child timeout envelope above is the non-contradictory owner contract: terminal elapsed-time completion is `done.task_timeout`, while pre-dispatch and post-response budget out'
- 'The scheduling model is graph-native: runnable graph nodes, DAG readiness, scored ready-set selection, and runtime-selection use plan-graph, plan_graph, project_plan_graph_index, project_plan_graph_index.schema.json, plan_graph.schema.json, `/project/plan_graph/index.json`, puppet-master/project/pla'
- 'The six-pass owner-doc audit posture is canonical for this integration surface: remaining issues are exact owner-doc structural mismatches and target-level drift, not permission to re-use stale source scaffolding. Orchestrator consumers must route storage-side gaps back to their owner docs and keep '
- Parallelism uses package/seam `lane-pool` capacity rather than stale `per-thread` queues, `per-provider` caps, parallel subtasks, or crews-per-tier as execution owners. Those older shapes may appear only as migration notes that map into package/seam promotion and lane capacity.
- '- This subsection stays separate from runtime-context canon language and separate from stale-token retirement language.'
- 'Child timeout, budget, and `/time` supervision must reuse the corrected `Plans/Run_Modes.md` kill/done `/outcome` taxonomy. The pre-fix mixed `stop.*` / `kill.*` vocabulary is retired for child supervision: pre-dispatch budget denial is `kill.budget_exceeded`, post-response overrun after durable usa'
- '- **Mitigation:** Cache detection per workspace path (cache key: canonical workspace path). Invalidate when the config is reloaded or the workspace path for the run changes. Expose a single entry point (e.g. `get_project_context(workspace) -> Result<ProjectContext>`) that returns cached value if val'
- '**Rationale for "at each tier":** A single run-start check can miss tier-specific wiring (e.g. task-tier plan_mode not applied for a task). Checking at Phase, Task, Subtask, and Iteration ensures that the config in effect for that tier is the one the code path uses, and that no tier is accidentally '
- '**Built-in hooks:** `ActiveSubagentTrackerHook` (BeforeUnit), `TierContextInjectorHook` (BeforeUnit), `StaleStatePrunerHook` (BeforeUnit), `HandoffValidatorHook` (AfterUnit).'
- '- stale child entries are resolved through canonical status and expiry logic, not side-file cleanup heuristics.'
- '**Stale pruning:**'
- '- **Execution order:** Built-in hooks run first (ActiveSubagentTrackerHook, TierContextInjectorHook, StaleStatePrunerHook), then platform-native hooks, then custom hooks.'
- '**Gap #18: Memory persistence conflicts and staleness**'
- '**Issue:** Memory files may become stale (outdated decisions), conflict between runs (different decisions), or grow unbounded. How do we manage memory lifecycle?'
- '- **Async hooks:** Run hooks asynchronously where possible (e.g., StaleStatePrunerHook can run in background).'
- '- **Integration with hooks:** BeforeUnit hook runs **before** `verify_tier_start` (tracks active subagent, injects context, prunes stale state). AfterUnit hook runs **after** `verify_tier_end` (validates handoff format, tracks completion). See **"Lifecycle and Quality Features"** for hook implementa'
- '- **What:** (1) **BeforeUnit/AfterUnit hooks:** Implement hook traits, register hooks per unit type, call automatically at unit boundaries. For platforms with native hooks (Cursor, Claude, Gemini), register Puppet Master hooks that delegate where possible; for Codex/Copilot, use orchestrator-level m'
- '- unresolved blocker threads and unresolved coordination requests MUST remain visible until resolved or explicitly superseded, even when ordinary retention archives stale messages after 24 hours'
- // Prune stale agents (no update in last hour)
- Gap-era crew notes in this section are retired as canonical guidance. The live crew rules now resolve through the orchestrator contracts elsewhere in this document rather than through illustrative fallback numbers, and the superseded gap-era examples that previously followed this heading MUST NOT be
- Crew lifecycle, timeout propagation, cancellation, and cleanup follow the canonical parent/child orchestration and runtime lifecycle contracts. This section no longer defines separate crew-only timeout ceilings, alternate cleanup paths, or stale concurrency examples.
- '- **Lock timeout:** If lock cannot be acquired within 5 seconds, log warning and proceed (coordination may be stale but execution continues).'
- // Check if lock is stale (process no longer exists)
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '> **Integration policy note (2026-02-24):** Runtime integration follows the ProviderTransport taxonomy (SSOT: `Plans/Contracts_V0.md`): Cursor/Claude Code = `CliBridge`, Codex/Copilot/Gemini = `DirectApi`, OpenCode = `ServerBridge`. Any Codex/Copilot SDK references in this file are historical contex'
- Browser-capability rethink entries in this planning-doc are research inputs, not direct implementation authority by themselves. They may survey capability breadth, behavior contracts and `/state` model, UX flows, safety and `/permissions`, and chat `/planning` integration, but canonical product/runt
- 'Child effective-authority is clamped before dispatch and audited after completion. Parent restrictions clamp the canonical `child-permission` envelope: child tool policy, write scope, FileSafe scope, mode ceiling, provider/model/account availability, and crew admission. Pre-dispatch budget denial, p'
- 'The stale later-stage example `Enforce maximum concurrent crews (e.g., 20 total)` from `Gap #45: Crew performance and scalability` is non-canonical. Crew and child admission use the executionLimits owner contract; no later-stage prose may reintroduce parallel caps that compete with that SSOT.'
- 'The legacy duplicate heading string `#### Task-envelope timeout contract` is retired as a separate live heading. The singular child timeout envelope above is the non-contradictory owner contract: terminal elapsed-time completion is `done.task_timeout`, while pre-dispatch and post-response budget out'
- Orchestrator consumes canonical runtime fields and event names from shared contracts; it must not revive local page-spec ownership such as `PuppetMasterEvent::*`, PuppetMasterEvent, `/type`, or `/schema` as first-class runtime schema. Exact transfer rows that mention exact_items, exact-missing, miss
- Runtime identity carry-through is mandatory across orchestrator, interview, and usage. Plans/usage-feature.md, /usage-feature.md, Plans/interview-subagent-integration.md, /interview-subagent-integration.md, Plans/orchestrator-subagent-integration.md, /orchestrator-subagent-integration.md, execution_
- Delegated work and memory loops remain parent-owned. Fresh-iteration loops may read `/plan`, append-only progress, reusable-pattern summaries, repo state, git history, `/gotchas`, and files changed, but they do not create hidden orchestrator memory beyond assistant-memory-subsystem, assistant-memory
- Provider and permission boundaries stay explicit. Plans/Provider_Stream_Mapping_External_Reference_A2A.md and /Provider_Stream_Mapping_External_Reference_A2A.md are adapter references only; hard-wires to tier scope are non-canonical when they drop /account/trust metadata. Permissions_System.md and P
- Packet emission is gated by target-level fidelity. Packet artifacts may be useful planning state, but they are not faithful-emission-safe until packet-planning inputs remove contradictions in owner docs, target-level runtime fields, and /graph scheduling records. The orchestrator therefore treats pa
- 'Scoped overrides have explicit lifecycle boundaries: turn, session, run, task, and subagent overrides are separate records and must not collapse into one sticky runtime setting. TierContext is retained only as a compatibility wrapper that may carry legacy_decomposition_context beside canonical execu'
- 'The six-pass owner-doc audit posture is canonical for this integration surface: remaining issues are exact owner-doc structural mismatches and target-level drift, not permission to re-use stale source scaffolding. Orchestrator consumers must route storage-side gaps back to their owner docs and keep '
- Destructive action taxonomy is canonical. `non_reversible` covers durable `/live` state mutation such as deleting records or `/skills/files` without a protected restore path. FinalGUISpec.md, /FinalGUISpec.md, page-spec, Overseer, Package, Lanes, detached_window, project-state, artifact_kind, task_i
- '`ActiveAgent`, crew structs, and coordination payloads key first on canonical execution refs such as run/thread/parent-child/node/attempt/package/seam/lane identity. Any `tier-keyed` field is a compatibility label only; it must not outrank `/package/seam` runtime identity or become a primary crew lo'
- 'Orchestrator action metadata is `command-owner` bound to `Plans/UI_Command_Catalog.md` / `UI_Command_Catalog`: every Orchestrator action declares whether it is `palette-visible`, `shortcut-worthy`, `context-menu` only, `bulk-safe`, or `bulk-forbidden`, and bulk mutation remains disabled unless the c'
- Graph schemas must not `hard-code` lexicographic selection as execution authority. The scored `ready-set` is canonical; schemas and consumers preserve `node-first` `runnable-unit` identity, while `/task/subtask` and `Iteration` are display or compatibility lenses only.
- Coverage/audit notes for this owner doc treat the remaining partial tail uniformly as `Gemini + Opus + Sonnet`; there is no command-owner or orchestration-tail exception that permits uneven pass coverage after the merge.
- Storage receipt and `/activity` gaps reported through this surface are `under-transfer` or anchor failures until the storage owner records the missing receipt contract; they are not total `missing-content` claims against this orchestrator doc.
- '- Start/end verification, "built but not wired" checks, and tier boundary semantics should be represented as explicit events for replayability'
- '- **Seglog:** Emit to the canonical seglog stream: tier start/end, iteration start/end, verification results, subagent invocation boundaries, and any event that must be replayable. Use the unified event model; do not add one-off log files for run history.'
owner_hints:
- Plans/orchestrator-subagent-integration.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

