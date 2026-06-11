# Shard 036: PlanUnits

Source: `Plans/FinalGUISpec.md`

Source lines: L3439-L3838

Source SHA256: `e7d74c518f43fb85d1bcb78c9f41c6ecf73d29086b5c1f37693b3c4ed79ecdd2`

---

## PlanUnits

### F3-001 - Puppet Master GUI Specification -- Slint Rewrite Source-Preserving PlanUnit

```yaml
plan_unit_id: F3-001
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Plans/FinalGUISpec.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0126
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0127
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0128
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0129
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0130
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0131
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0132
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0133
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0134
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0135
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0136
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0137
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0138
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0139
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0140
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0141
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0142
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0143
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0144
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0145
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0146
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0147
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0148
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0149
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0150
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0151
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0152
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0153
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0154
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0155
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0156
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0157
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0158
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0159
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0160
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0161
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0162
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0163
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0164
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0165
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0166
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0167
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0168
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0169
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0170
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0171
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0172
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0173
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0174
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0175
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0176
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0177
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0178
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0179
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0180
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0181
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0182
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0183
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0184
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0185
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0186
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0187
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0188
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0189
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0190
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0191
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0192
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0193
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0194
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0195
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0196
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0197
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0198
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0199
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0200
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0201
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0202
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0203
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0204
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0205
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0206
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0207
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0208
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0209
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0210
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0211
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0212
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0213
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0214
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0215
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0216
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0217
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0218
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0219
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0220
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0221
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0222
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0223
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0224
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0225
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0226
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0227
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0228
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0229
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0230
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0231
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0232
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0233
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0234
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0235
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0236
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:FinalGUISpec-S0237
preserved_exact_tokens:
- Puppet Master GUI Specification -- Slint Rewrite
- Canonical owner-section requirements
- Concern record family definition
- Concern routing and object-first search behavior
- Concern action policy and authority model
- Projection trust and action gating
- Progress-only widget hostability
- Shared escalation ladder
- Action-surface policy
- Glossary and help governance
- Notification routing policy
- Canonical route payload
- Project summary projection
- Project attention projection
- Requested concrete-account fields
- Execution role and operational identity
- Projection freshness vs projection health
- Dismissed vs resolved rationale enforcement
- Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Recommended minimum concern record shape
- Table of Contents
- 1. Executive Summary
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
- 2. Tech Stack and Renderer
negative_constraints:
- '- FinalGUISpec must not let stale Orchestrator ontology re-amplifies drift into widgets, settings, dashboard copy, or route handling.'
- Operational identities may display provider/account identity and `/account` source metadata, but the GUI must not imply shared token ownership across accounts, providers, or execution roles.
- '- If a stale-but-valid snapshot is still serving grep or Search, the indicator may show refresh progress, but the UI must not imply that Search is fully unindexed.'
- Remote search freshness copy cross-references `Plans/GitHub_Integration.md` (`/GitHub_Integration.md`) for the SSH file-watcher channel; the regex-index dirty layer and Tantivy code index subscribe to the same notification channel, so the GUI must not imply duplicate watcher setup.
- 'Panel-ownership is resolved before any plan-doc rewrite, shortcut map, or command-palette migration changes shell navigation. The activity bar MUST NOT expose a `Git` icon that opens `GITHUB ACTIONS`: `GITHUB ACTIONS` belongs to panel ID `github_actions`, and `SOURCE CONTROL` / `CONTROL` belongs to '
- Panel-specific UX state must not be `co-mingled` with global policy settings. Settings > Branching / Health owns global Git/worktree policy, recovery, and correctness controls; Settings > Advanced owns GitHub Actions generation/template controls and Docker/registry defaults. Per-panel expansion, fil
- '- Auto-retrieval (Tantivy search, `@file` resolution) remains project-scoped, not worktree-scoped; GUI search surfaces may expose the results, but they must not imply that the retrieval corpus was narrowed to only the active worktree.'
- '- the terminal grid must not use a split-parent opacity enter animation that dims all children during reorder or drag operations.'
- '**Conditional overlays:** Paper texture and pixel grid are optional overlay components at the root, bound to `Theme.retro-effects-enabled`. Implementations must not branch component logic on theme; only the presence/absence of these overlay nodes changes.'
- '`Progress` widgets must not teach active-tier, `phase-task-subtask`, or `tier-targeted` terminal semantics as the primary operational mental model; those spellings remain compatibility labels behind native Progress, package, lane, and runtime-object routing.'
- Blocked-state integration uses one shared contract rather than surface-specific recovery wording. Orchestrator remains the hub for blocked episodes, while destination panels render the same reason code, owner route, recovery CTA, and allowed actions in local context. If a destination panel cannot ho
- '`Plans/assistant-chat-design.md` / `assistant-chat-design.md` message `jump-to-message`, search, and persistence behavior consume the same object-first route model; chat may store `resume_url` for recovery portability, but it must not fall back to path-first opening.'
- '`subject_id` is for openable `/renderable` content subjects only; it must not become a second generic object taxonomy beside `object_kind` / `object_id`.'
- Interview and other `/document-production` runs may carry runtime identity plus blocked `/remediation` state, but they are not Orchestrator package `/node` execution records and must not collapse into the package/node object model.
- Legacy `DOCKER MANAGE`, `Docker Manage`, `docker_manage_surface_state`, and separate Unraid panel references are migration aliases. They open Docker Manager, optionally focused to `Publish / Unraid`, and must not create a second activity-bar slot or remain embedded under Persona Editor.
- 'Runtime alert lifecycle defines `/auto-resolution`: an alert may auto-resolve on healthy refresh, downgrade to historical `/seen` after acknowledgment, and clear badges consistently across mirrored surfaces. Persistent non-blocking issues support `per-alert` `acknowledge`, `snooze`, and `/snooze/mut'
- '- provider settings layout stays OUT of this GUI widget contract while provider-runtime docs remain provisional; this document owns UI widget contracts and must not encode provider routing or configuration internals'
- '- chat-local controls must not duplicate ownership of Problems, Output, Ports, or Debug Console; they link to those shell surfaces instead'
- '- Tree-level actions include `New file`, `New folder`, `Rename`, `Delete`, Copy full path, Copy relative path, Add to Assistant Chat, Open With, Download / Save Local Copy, and `/Cut/Paste` for workspace nodes. `cmd.file` / `cmd.file.*` is the command-family for workspace-node actions, and missing a'
- '- Embedded editor surfaces are leaf editing/rendering surfaces, not owners of workspace truth. DOM/browser-coupled, browser-specific, browser-runner, service-worker, query-string, localStorage, `/browser-coupled`, `/shared-doc`, `/render-root`, `/selection/IME/paste/shadow-root/Firefox`, `/auth/inpu'
- '- Per-surface state may persist `line`, `range`, `active_subview`, compare target, panel layout, browser tab state, and widget layout only as view state; it must not replace canonical route identity.'
- Git/source-control discard/compare/stage actions are not editor undo. Restore points, rollback, and revert-last-agent-edit stay explicit restore-history commands, and the GUI must not bury them behind git-panel affordances. The File Editor must expose diff heat-map/change-marker and scrollbar change
- '- polling is acceptable for external systems that do not provide push updates, such as GitHub Actions status checks; those intervals are freshness aids only and must not become the correctness model for the rest of the shell'
- Non-text path/value copy actions must copy the exact underlying value via the shared clipboard helper and must not depend on text rendering quirks.
compatibility_only_notes:
- '- `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`) six-tab `Tiers` carry-through is stale: widget-based tabs `1, 2, 4, 5, 6`, `widget.tier_tree`, `widget.current_task`, `widget.progress_bars`, `tier_id`, `request_id`, `requested_persona_id`, `effective_persona_id`, `provider`, `model`, and `Pu'
- '- `Plans/Widget_System.md` (`/Widget_System.md`) tier-centric `Orch/Tiers` and `/Tiers` entries, `widget.agent_terminal`, `widget.completed_prose`, `widget.tier_tree`, older `TierChanged` / `IterationStart` pushes, and `/task/subtask`-oriented `widget.current_task` remain compatibility vocabulary; o'
- '- Legacy `GUI` inventory entries such as `/current-task`, `7.7 Tiers`, tier-oriented Settings, `Orchestrator tabs`, `wizard_attention_required`, `resume_url`, and phase-task-subtask progress bars stay searchable compatibility copy, but primary navigation moves to native graph/package/lane/seam surfa'
- '- Legacy Progress widget catalog fields such as `widget.current_task`, `widget.progress_bars`, `widget.cta_stack`, `widget.agent_terminal`, and `widget.completed_prose` plus `PuppetMasterEvent`, `PuppetMasterEvent::UserInteractionRequired`, `UserInteractionRequired`, `tier_id`, `/tasks`, `/task/subt'
- '- `Widget_System` / `Widget_System.md` keeps `/Tiers`, `Orch/Tiers`, `Orch/Evidence`, `Orch/History`, `Orch/Ledger`, `/Evidence`, `/History`, and `/Ledger` as legacy widget-composed catalog aliases only; only `Progress` remains widget-composed in native Orchestrator.'
- '- `Orchestrator_Page` / `Orchestrator_Page.md` Progress widgets that still center active-tier or tier-targeted terminal semantics are legacy inputs; `widget.agent_terminal`, `widget.completed_prose`, `widget.current_task`, `widget.progress_bars`, `/task/subtask`, and `/objective/platform/model` reso'
- '`Plans/Run_Graph_View.md` (`/Run_Graph_View.md`) `cmd.graph.approve_hitl` / `cmd.graph.deny_hitl` actions use `blocked_sequence` and ordered `allowed_action_ids[]`; legacy `hitl_request_id` is compatibility display metadata, not a second `HITL` approval identity.'
- '`Plans/Prompt_Pipeline.md` / `/Prompt_Pipeline.md` locks requested `/effective` identity semantics, including concrete-account intent, while tier-era override ownership is compatibility vocabulary only.'
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- 19. [Persona Editor, Compatibility Disclosure, and Surface-Level Persona Controls](#19-persona-editor-compatibility-disclosure-and-surface-level-persona-controls-2026-03-06)
- 'Provider CLI backend eligibility is separate from Slint renderer selection: Cursor CLI must be re-evaluated as an ACP-capable first-class CLI backend, not only a stream-json bridge, before GUI diagnostics classify it as a legacy stream transport.'
- '`FinalGUISpec.md §3.1` is the shell confirmation for right-hand side-panel occupants: the side panel is the Activity Bar surface slot with a 240-480px width budget. Legacy labels such as `/File`, `/Source`, `/GitHub`, and `/etc` are migration labels for occupants or groups, not separate page surface'
- 'Panel-ownership is resolved before any plan-doc rewrite, shortcut map, or command-palette migration changes shell navigation. The activity bar MUST NOT expose a `Git` icon that opens `GITHUB ACTIONS`: `GITHUB ACTIONS` belongs to panel ID `github_actions`, and `SOURCE CONTROL` / `CONTROL` belongs to '
- Legacy widget-composed tab keys `orchestrator:tiers`, `orchestrator:evidence`, `orchestrator:history`, and `orchestrator:ledger` plus generic `/remove/move/resize` behavior are migration aliases; only `orchestrator:progress` persists as the Orchestrator widget layout key.
- '`Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` carry-through references to `Tab 2: Tiers`, `orchestrator:tiers`, and `FinalGUISpec section 7.7` are legacy aliases only; FinalGUISpec keeps them searchable without restoring a Tiers tab as canonical Orchestrator navigation.'
- Legacy tier-era `Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` signals such as `Progress`, `Tiers`, `Node Graph`, `Evidence`, `History`, `Ledger`, the six-tab shell, `active tier`, `phase/task/subtask`, `TierChanged`, and cross-surface `CTA` labels are compatibility inputs only; native Orche
- '`Orchestrator_Page.md` and `Run_Graph_View.md` user-facing help and `/copy` translate legacy data-model labels, including `Tiers`, `Phase/Task/Subtask`, `/Task/Subtask`, and `Overseer`, into native graph/package/seam/lane terms instead of presenting tier-era wording as current guidance.'
- Tier/group views, where retained as compatibility projections, carry pointers to canonical execution objects for `/group` display and `/audit` routing; `tier_id` is never the primary mutation or audit key.
- '`Orchestrator_Page` / `Orchestrator_Page.md` legacy ontology may still be visible in tab structure, widget structure, event sources, filter keys, and worker identity fields, but those are migration signals rather than canonical execution identity.'
- The old `all Orchestrator tabs are widget canvases` model from `Widget_System.md` and `Orchestrator_Page.md` is compatibility-only; Progress stays the sole widget-composed Orchestrator tab, while Seams, Node Graph, Evidence, History, and Ledger remain native views.
- '`Plans/FinalGUISpec.md` / `/FinalGUISpec.md`, `Widget_System` / `Widget_System.md`, and `Orchestrator_Page` / `Orchestrator_Page.md` migration notes treat `GUI`, `/Tiers/Node`, `/Evidence/History/Ledger`, phase `/task/subtask` progress, `widget.tier_tree`, `widget.progress_bars`, `/widget`, schedule'
- GUI rewrite-era surfaces replace tier/task/subtask claims with seam/package/node ownership; `/package/node` expansions expose execution detail while legacy `/task/subtask` wording stays compatibility copy only.
- '`Progress` widgets must not teach active-tier, `phase-task-subtask`, or `tier-targeted` terminal semantics as the primary operational mental model; those spellings remain compatibility labels behind native Progress, package, lane, and runtime-object routing.'
- Dashboard CtAs, blocked-node CtAs, thread badges, and live-run cards route through one Dashboard -> Orchestrator -> chat-thread attention contract. The route is `/seam/lane-aware`, exposes `/seams/lanes` rollups and package `/package/node` expansions progressively, and demotes tiers-first widgets or
stale_retired_dispositions:
- Projection-backed surfaces use `freshness_state` values `current`, `refreshing`, `stale`, `degraded`, and `unavailable`; `/current` projections may allow normal read/write interaction, while `stale` or `/degraded` surfaces narrow mutation-bearing actions, disable them, or require direct canonical/cu
- '- `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`) six-tab `Tiers` carry-through is stale: widget-based tabs `1, 2, 4, 5, 6`, `widget.tier_tree`, `widget.current_task`, `widget.progress_bars`, `tier_id`, `request_id`, `requested_persona_id`, `effective_persona_id`, `provider`, `model`, and `Pu'
- '- The widget layout migration has one explicit persistence-rule: active layout state writes through `widget_layout`, while retired layout keys are read-only migration backups.'
- '- FinalGUISpec must not let stale Orchestrator ontology re-amplifies drift into widgets, settings, dashboard copy, or route handling.'
- Blocked-notice consumers keep `## Unified Thread Blocked-State Lifecycle`, `### Multi-episode display`, and `### 7.3 Shared route and open behavior` as owner-anchor / owner-heading carry-through, but `gap-002`, `exact_items`, `stale-survivor`, and `GUI` cleanup must expose `blocked_sequence`, `appro
- '- Stale visibility is not action authority: when projection trust drops, `/recovery` controls and `allowed_action_ids[]` may become invalid, and destructive or topology-changing actions require stronger gating rather than ordinary undo.'
- '- If a stale-but-valid snapshot is still serving grep or Search, the indicator may show refresh progress, but the UI must not imply that Search is fully unindexed.'
- 'Search is also the `search-owner` for the full indexing control surface: enable/disable index, rebuild/re-anchor, large-file threshold default 10 MB, generated-file index-exclusion patterns, follow-symlinks toggle, and visible indexed/stale/unindexed/fallback state. If the user turns OFF indexing wh'
- The GUI concept artifact `Concepts/PuppetMasterDashComp.html` (`/PuppetMasterDashComp.html`) is historical design evidence for the side-panel model, not a live owner path. Its labels `GITHUB ACTIONS`, `DOCKER MANAGE`, and `SOURCE CONTROL` map to the canonical GitHub Actions, Docker Manager, and Sour
- Account-switch propagation is visible at the shell boundary. When the effective account changes, Source Control, GitHub Actions, Docker Manager, Kubernetes, receipts, and blocked-state projections hard-refresh or clear stale selections; Orchestrator CTAs are reclassified against the new requested/ef
- '`Critical workflow pinning / health badges` appears as a GitHub Actions affordance, with dashboard and Orchestrator mirrors only linking back to the owner surface. `GitHub Actions > Workflows` owns pin and unpin, including `cmd.github.actions.pin`, `cmd.github.actions.unpin`, pinned-workflow state, '
- '- the separate command-log strip is retired from the canonical layout'
- '- DnD cleanup must clear stale hover, opacity, and drag classes after rebuild or dragend so terminal panes do not remain visually dimmed.'
- 'The Orchestrator renders five composite projection states: `current`, `refreshing`, `stale`, `degraded`, and `unavailable`. `projection_freshness` owns `current` / `refreshing` / `stale`, `projection_health` owns `degraded` / `unavailable`, and `trust_tier` is reserved for preview/browser semantics '
- Projection-heavy surfaces must disclose degraded or `/stale` state and revalidate against canonical records before emitting strong notification claims. Dashboard-hosted push widgets carry a chrome-level trust indicator plus `/idle/historical` and no-active-run states, so page-level chrome explains w
- 'Orchestrator stale-data mitigations use the same copy and action rules as other `/degraded` runtime projections: mutation-bearing controls narrow, disable, or require canonical/current revalidation before execution.'
- 'SCM, GitHub Actions, Docker/Kubernetes, Orchestrator, and other /runtime-backed surfaces share one user-facing status vocabulary: `Running`, `Ready`, `Blocked`, `Needs Attention`, `Degraded`, `Stale`, `Detached`, and `Not Configured`. Icon, text, and badge presentation may vary by density, but `/tex'
- Shell `/navigation` and `deep-link` handling in `Plans/FinalGUISpec.md` / `/FinalGUISpec.md` must consume the shared route contract before reviving any stale `Tiers` or widgetized Orchestrator surface assumption.
- '| Tiers (retired alias) | Compatibility/search alias only; visible execution navigation uses Nodes, Packages, Lanes, Seams, or Branching surfaces | Orchestrator, Run Graph, Worktree, and node/package/lane owner docs |'
- '| Health | Doctor checks, readiness, stale/degraded states, and remediation links | owner docs for the failing subsystem plus Runtime Artifacts |'
- Project-summary cards derived from stale or `/degraded` projections downgrade confidence without manufacturing a blocked state, and historical-only projects still keep a current `project_summary` row with neutral `historical_only` or `idle` activity rather than a warning color/state.
- '- the visible slash palette mirrors the final reserved slash set, including bare `/web` help/autocomplete, `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, `/web map`, `/skill`, and the deprecated `/cancel` alias'
- '- SSH remote editing, stale-write disclosure, and recoverable unsaved local buffer persistence'
- '- Preview/browser/file-type GUI seams include Mermaid, Markdown, HTML, SVG, image, and media preview; source-canonical preview/edit bridge; linked-asset reload; multi-preview ownership; trust tiers; sandboxing; `runtime_unavailable`; capture/mutation boundaries; and generated-vs-workspace-file open,'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- 'Global search labels distinguish `Search in this tab` from `Search Orchestrator`: the former is local tab filtering, while the latter is object-first, cross-tab, and route-aware so concern, evidence, history, ledger, and graph results land on the canonical object route rather than a page-local text '
- '- Concern record surfaces expose a canonical record schema with `/routing`, `/blocked/remediation`, `/corroboration/graph`, `/recovery`, and relationship links to reviews and graph patches; structural actions use `/split/supersession` instead of local free-text history.'
- '- Object-specific context menus show only operational actions valid for the current object state and use canonical labels from runtime semantics; mutation actions never appear because a generic shell menu has a matching verb.'
- Projection-backed surfaces display `projection_freshness` and `projection_health` as the runtime trust grammar. Preview/browser `/UI` keeps `trust_tier` under `/browser`; runtime `/degraded` copy never reuses `trust_tier` as degraded trust. Artifact provenance `/trust` disclosure derives from persis
- Shared attention labels include `Waiting on user approval`, `Seam integration blocked`, `Graph patch required`, `Recovery in progress`, `Provider/account pressure`, and `Projection trust degraded`; each label carries owner route, projection state, and `/account` or provider context when relevant ins
- Projection-backed surfaces use `freshness_state` values `current`, `refreshing`, `stale`, `degraded`, and `unavailable`; `/current` projections may allow normal read/write interaction, while `stale` or `/degraded` surfaces narrow mutation-bearing actions, disable them, or require direct canonical/cu
- '- Legacy `GUI` inventory entries such as `/current-task`, `7.7 Tiers`, tier-oriented Settings, `Orchestrator tabs`, `wizard_attention_required`, `resume_url`, and phase-task-subtask progress bars stay searchable compatibility copy, but primary navigation moves to native graph/package/lane/seam surfa'
- Blocked-notice consumers keep `## Unified Thread Blocked-State Lifecycle`, `### Multi-episode display`, and `### 7.3 Shared route and open behavior` as owner-anchor / owner-heading carry-through, but `gap-002`, `exact_items`, `stale-survivor`, and `GUI` cleanup must expose `blocked_sequence`, `appro
- '- The canonical term system owns stable object `/state/action` names from docs and `/runtime/contracts`; the help entry system owns explainer pages or `/cards`; the contextual help system owns inline tooltips, badges, hover copy, and small "what is this?" affordances.'
- 'Local attention surfaces normalize through the shared notification model: Dashboard `Action Required`, thread badges, run-graph `/node` badges, warnings `/toasts/banners`, tray `/system` notifications, rate-limit banners, and blocked versus attention-required copy all preserve severity, source, and '
- '### Canonical route payload'
- '`Contracts_V0` / `Contracts_V0.md` owns the canonical route payload and target model, including the `object_kind` enum; `Glossary.md` carries the user-facing `object_kind` vocabulary so help and downstream copy do not drift.'
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Blocked-owner eight-kind taxonomy and escalation ladder surfaces'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '| Persistence (events) | seglog | Canonical event ledger for usage, chat, orchestrator events |'
- 'Canonical shell rule:'
- 'Non-canonical after this section:'
- The activity bar is the canonical entry point for persistent right-hand side-panel operational surfaces.
- '- None of those surfaces are described as canonical primary-content pages unless the statement is explicitly about a routed detail page launched from the surface.'
- 'Canonical side-panel descriptions:'
- '| Panel ID | Canonical label | Purpose |'
owner_hints:
- Plans/FinalGUISpec.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

