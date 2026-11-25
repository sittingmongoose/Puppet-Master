# Shard 015: Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L2169-L2257

Source SHA256: `076ed500d71b88e7b01f7af37323b692b5901faa29c0a5346d26da56b4fe077b`

---

## Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

### PNC-038 - Rule Fixtures Bound At WorkNode Request Creation

```yaml
plan_unit_id: PNC-038
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  When PlanCompile drafts WorkNodeRequest records (PNC-013), every rule of every contract reaches a node as tests in
  that node's test_binding. A node's contracts are the contracts its source_plan_unit_ids and
  source_acceptance_unit_ids reach through an owner_reference or consumer_reference edge (PNC-016). Each rule's tests
  bind to the node or nodes whose source_acceptance_unit_ids own enforcement of that rule; a rule that no single node
  owns binds to the node that completes the contract, the last node in build order whose source units hold the
  contract's owner_reference, ordered through required_before_completion. A contract's rules are its schema rules, its
  declared failure results and its acceptance criteria. Schema rules get payload fixtures: for each rule, code generates
  one payload that the schema validator confirms breaks only that rule and one payload that passes. Declared failure
  results and behavioural acceptance criteria (those with an input and an observable outcome) get behaviour fixtures:
  one passing and one refusing example each, written by the compile model, citing the exact span they come from, and
  checked by code against the schema and the declared failure codes before they bind; risky contracts add the cases of
  the planning referee check (Plans/Planning_Wizard.md#PWIZ-111). Other acceptance criteria (latency gates, visual or
  browser checks, artifacts that must not exist) bind their ATS-003 oracles as tests and are not rule fixtures. No
  contract is exempt from schema fixtures because its acceptance criteria use other oracles. A fixture's expected
  outcome comes only from the approved contract: accepted, with a resulting state only where the contract states it or
  the referee computes it from the contract; or refused with the declared failure code and, when several rules share
  that code, the validator's error path that names the rule. A referee case binds only when the approved contract
  states its expected outcome; a case where the referee and the contract disagree, or where the contract states no
  outcome, stays a design finding or gap evidence and never becomes a fixture, and the outcome the referee observed is
  recorded beside the case but never used as an expectation. A payload fixture record holds a fixture id, the contract
  ref, the rule id, its polarity (positive or negative), the payload and its expected outcome. A behaviour fixture
  record holds the same fields with an input (a prior owner state plus an operation or event, or a short sequence)
  in place of the payload. A model-written fixture also keeps an immutable reference to its source span in the approved
  plan version. Fixtures are listed in generated_test_ids (Plans/Automated_Testing_System.md#ATS-003). Each rule ends
  in exactly one disposition: both polarities bound; a positive bound together with an evidenced named gap
  (Plans/Planning_Wizard.md#PWIZ-111) as the disposition of its negative, whose recorded multi-rule inputs bind as
  regression fixtures under the catching rules' approved outcomes with no single-rule coverage credit; or a test gap
  for each missing polarity, or for a rule that has no automatic route. A test gap is a recorded-gap record holding the
  rule id, the missing polarity, the reason, evidence refs, catching rules, a test_gap_policy and a disposition; its
  test_gap_policy is block_completion, defer_non_executable_harness_candidate, or allow_with_disposition with a
  recorded disposition, never not_applicable. A completeness finding carried as a recorded gap
  (Plans/Planning_Wizard.md#PWIZ-110) reaches the node the same way. When a contract changes after approval, the
  successor plan reruns its PWIZ-110 and PWIZ-111 checks and regenerates its tests, and the PlanDiffImpactReport
  (Plans/Executor_Protocol.md#EP-102) classifies each consuming node, with changed tests counting as an impact. The
  test_binding and test_case definitions in Plans/plans_to_code_handoff.schema.json do not yet carry payload fixture,
  behaviour fixture or recorded-gap records; that schema change is a required companion change before any compile uses
  this unit. This unit specifies the binding only; it emits no NodeSeeds, WorkNodes, executable queues or build tasks.
gui_related: false
gui_classification_reason: Defines how compile artifacts carry test fixtures; no visual presentation.
depends_on: [DL-512, PNC-013, PNC-015, PNC-016, EP-102, PWIZ-110, PWIZ-111, ATS-003, ATS-004]
unblocks: [ATS-401]
acceptance_criteria:
  - "Every rule of every contract binds to the node that owns its enforcement, or to the node that completes the contract, and ends in exactly one disposition: both polarities bound; a positive with an evidenced named gap for its negative; or a recorded test gap for each missing polarity or missing automatic route, whose test_gap_policy is not not_applicable."
  - "Schema rules always get payload fixtures; declared failure results and behavioural acceptance criteria get behaviour fixtures; other acceptance criteria bind their ATS-003 oracles; no contract is exempt from schema fixtures."
  - "Every expected outcome comes from the approved contract; a referee case that disagrees with the contract or lacks a contract outcome never binds as a fixture, and observed planning outcomes are kept only as evidence."
  - "Every model-written fixture cites its source span, passes the schema and declared-failure-code check before it binds, and keeps an immutable reference to that span in the approved plan version."
  - "Named-gap regression inputs bind with no single-rule coverage credit."
  - "A contract change after approval reruns its checks in the successor plan and regenerates its tests, and the PlanDiffImpactReport classifies every consuming node."
  - "The handoff schema change for payload fixture, behaviour fixture and recorded-gap records is a recorded companion change, required before any compile uses this unit."
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
  - "payload fixture"
  - "behaviour fixture"
  - "recorded-gap record"
  - "generated_test_ids"
  - "test_gap_policy"
  - "required_before_completion"
  - "PlanDiffImpactReport"
negative_constraints:
  - Do not count a named gap, a test gap or a rule without a fixture as a passing test, and do not give such a rule the test_gap_policy not_applicable.
  - Do not use an outcome the referee observed as a fixture's expected outcome; only the approved contract sets expectations.
  - Do not exempt a contract's schema rules from payload fixtures.
  - Do not create WorkNodes, NodeSeeds or build tasks from this unit.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/Planning_Wizard.md, Plans/Executor_Protocol.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-013, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004
