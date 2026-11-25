# Shard 015: Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L2169-L2237

Source SHA256: `05e1968184b8c77b22c51fe65e3c124e1a75eee3caab2b3ea2719ff00b4edc05`

---

## Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

### PNC-038 - Rule Fixtures Bound At WorkNode Request Creation

```yaml
plan_unit_id: PNC-038
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  When PlanCompile drafts WorkNodeRequest records (PNC-013), every rule of every contract reaches a node as fixtures
  in that node's test_binding. A node's contracts are the contracts its source_plan_unit_ids and
  source_acceptance_unit_ids define or reference. Each rule's fixtures bind to the node or nodes whose
  source_acceptance_unit_ids own enforcement of that rule; a rule that no single node owns binds to the node that
  completes the contract, ordered through required_before_completion. For every contract, PlanCompile generates
  fixtures: mechanically from the contract's schema rules (for each rule, one input that breaks only that rule, as
  the schema validator confirms, and one passing input), and with the compile model from its declared failure results
  and acceptance criteria (one passing and one refusing example each). Risky contracts add the cases and generated
  inputs of the planning referee check (Plans/Planning_Wizard.md#PWIZ-111). A fixture record holds a fixture id, the
  contract ref, the rule id, its polarity (positive or negative), its input (a prior owner state plus an operation or
  event, or a short sequence) and its expected outcome (the resulting state, or the declared failure code). Fixtures
  are listed in generated_test_ids (Plans/Automated_Testing_System.md#ATS-003). Named gaps and test gaps from
  Plans/Planning_Wizard.md#PWIZ-110 and #PWIZ-111 travel with the node as recorded-gap records (rule id, kind
  named_gap or test_gap, evidence refs and catching rules), never as passing tests. A rule that reaches a node with no
  fixture is a test gap whose test_gap_policy is block_completion, defer_non_executable_harness_candidate, or
  allow_with_disposition with a recorded disposition; never not_applicable. When a contract changes after approval,
  the successor plan reruns its PWIZ-110 and PWIZ-111 checks and regenerates its fixtures, and the PlanDiffImpactReport
  (Plans/Executor_Protocol.md#EP-102) classifies each consuming node, with changed fixtures counting as an impact. The
  test_binding and test_case definitions in Plans/plans_to_code_handoff.schema.json do not yet carry the fixture and
  recorded-gap records; that schema change is a required companion change before any compile uses this unit. This
  unit specifies the binding only; it emits no NodeSeeds, WorkNodes, executable queues or build tasks.
gui_related: false
gui_classification_reason: Defines how compile artifacts carry test fixtures; no visual presentation.
depends_on: [DL-512, PNC-013, PNC-015, EP-102, PWIZ-110, PWIZ-111, ATS-003, ATS-004]
unblocks: [ATS-401]
acceptance_criteria:
  - "Every rule of every contract binds to the node that owns its enforcement, or to the node that completes the contract, as a negative and a positive fixture, a recorded named gap, or a test gap whose test_gap_policy is not not_applicable."
  - "Every contract gets generated fixtures, not only risky contracts."
  - "Fixture and recorded-gap records hold the fields this unit names, and named gaps and test gaps never count as passing tests."
  - "A contract change after approval reruns its checks in the successor plan and regenerates its fixtures, and the PlanDiffImpactReport classifies every consuming node."
  - "The handoff schema change for fixture and recorded-gap records is a recorded companion change, required before any compile uses this unit."
  - "No NodeSeeds, WorkNodes, executable queues, final node manifests, production build tasks, implementation files or source code are created by this PlanUnit."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: weak_test_oracle
reasoning_tier: high
context_scope: worknode_test_binding
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: worknode_test_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "pm-mail 1125004841-a1d8 (pm-ea-lead, 2026-11-25): a credited kill is a negative fixture and its control a positive one; per-rule fixtures for the other families must come from the WorkNode compiler, the builder or the tooling"
preserved_exact_tokens:
  - "fixture record"
  - "recorded-gap record"
  - "generated_test_ids"
  - "test_gap_policy"
  - "required_before_completion"
  - "PlanDiffImpactReport"
negative_constraints:
  - Do not count a named gap, a test gap or a rule without a fixture as a passing test.
  - Do not give a rule without a fixture the test_gap_policy not_applicable.
  - Do not create WorkNodes, NodeSeeds or build tasks from this unit.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/Planning_Wizard.md, Plans/Executor_Protocol.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-013, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004
