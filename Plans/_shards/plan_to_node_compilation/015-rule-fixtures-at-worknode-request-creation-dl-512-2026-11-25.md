# Shard 015: Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L2169-L2220

Source SHA256: `cd9cfec30b941429c84691940aa93a41000285916341a99354ab1180166af740`

---

## Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

### PNC-038 - Rule Fixtures Bound At WorkNode Request Creation

```yaml
plan_unit_id: PNC-038
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  When PlanCompile drafts WorkNodeRequest records (PNC-013), every rule of every contract a node implements reaches
  that node as fixtures in its test_binding. Each refusing example and each generated rule-breaking input from the
  planning referee check (Plans/Planning_Wizard.md#PWIZ-111) becomes a negative fixture (this input must be refused,
  with this code, at this rule), and each passing example becomes a positive fixture; both are listed in
  generated_test_ids (Plans/Automated_Testing_System.md#ATS-003). A contract without a referee contributes the
  examples its completeness check produced (Plans/Planning_Wizard.md#PWIZ-110). Named gaps travel with the node as
  recorded gaps, each with the rules that catch it, never as passing tests. A rule that reaches a node with no
  fixture is a test gap under the node's test_gap_policy (ATS-004), never a silent pass. When a contract changes after
  compilation, its fixtures are regenerated and every node that consumes the contract is marked for regeneration.
  This unit specifies the binding only; it emits no NodeSeeds, WorkNodes, executable queues or build tasks.
gui_related: false
gui_classification_reason: Defines how compile artifacts carry test fixtures; no visual presentation.
depends_on: [DL-512, PNC-013, PWIZ-110, PWIZ-111, ATS-003, ATS-004]
unblocks: [ATS-401]
acceptance_criteria:
  - "Every rule of a contract a WorkNodeRequest implements has a negative and a positive fixture in its test_binding, or a recorded named gap, or a test gap under its test_gap_policy."
  - "Named gaps are carried as recorded gaps with the rules that catch them, never as passing tests."
  - "A contract change after compilation regenerates its fixtures and marks every consuming node for regeneration."
  - "No NodeSeeds, WorkNodes, executable queues, final node manifests, production build tasks, implementation files or source code are created by this PlanUnit."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: weak_test_oracle
reasoning_tier: high
context_scope: worknode_test_binding
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: worknode_test_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "pm-mail 1125004841-a1d8 (pm-ea-lead, 2026-11-25): a credited kill is a negative fixture and its control a positive one"
preserved_exact_tokens:
  - "negative fixture"
  - "positive fixture"
  - "generated_test_ids"
  - "test_gap_policy"
  - "named gap"
negative_constraints:
  - Do not count a named gap or a rule without a fixture as a passing test.
  - Do not create WorkNodes, NodeSeeds or build tasks from this unit.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/Planning_Wizard.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-013, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004
