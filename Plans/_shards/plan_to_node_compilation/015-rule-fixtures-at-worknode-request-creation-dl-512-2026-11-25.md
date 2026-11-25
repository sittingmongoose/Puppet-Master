# Shard 015: Rule fixtures at WorkNode request creation (DL-512, 2026-11-25)

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L2169-L2278

Source SHA256: `9c8ecb0e4de7f592e7cf7243e278a1dc063966a35800f8ec1dac77cbb25f4c7c`

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
  declared failure results and its acceptance criteria, and each kind of rule gets its own tests. A schema rule gets
  two payload fixtures: a payload that the schema validator confirms breaks only that rule, expected to be refused, and
  a payload that passes, expected to be accepted. A declared failure result gets two behaviour fixtures: an input that
  meets its failing condition, expected to be refused with that failure's code, and the same input without the failing
  condition, expected to be accepted. A behavioural acceptance criterion (one with an input and an observable outcome)
  gets one behaviour fixture for each input condition it lists, each carrying the criterion's state and effect
  assertions and asserting the outcome the criterion states on its input or sequence: a refusal where the
  criterion prescribes one, otherwise the stated result, compared so that a wrong result fails (a duplicate delivery
  that must return the existing identity fails when another identity comes back). Any other acceptance criterion
  (a latency gate, a visual or browser check, an artifact that must not exist) binds its ATS-003 oracle as its test.
  No contract is exempt from schema fixtures because its acceptance criteria use other oracles. The compile model writes
  behaviour fixtures; each cites the exact span it comes from and keeps an immutable reference to that span in the
  approved plan version, and code checks it against the schema and the declared failure codes before it binds. Risky
  contracts add the cases of the planning referee check (Plans/Planning_Wizard.md#PWIZ-111). A fixture's expected
  outcome comes only from the approved contract: accepted with any stated result, or refused with the declared failure code and, when several rules share that
  code, the validator's error path that names the rule; every expected state comes from the owner-stated state and
  effect assertions. A referee case binds only when the
  approved contract states its expected outcome; a case where the referee and the contract disagree, or where the
  contract states no outcome, stays a design finding or gap evidence and never becomes a fixture, and the outcome the
  referee observed is recorded beside the case but never used as an expectation. A payload fixture record holds a
  fixture id, the contract ref, the rule id, the payload and its expected outcome; a behaviour fixture record holds the same fields with an input (a prior owner state plus an operation or event,
  or a short sequence) in place of the payload, its span reference, and the owner-stated state and effect assertions
  that apply to either polarity, each read through a declared observation surface (Plans/Planning_Wizard.md#PWIZ-110);
  an assertion whose observation surface is still missing at compile time and carries no gap marker is a test gap,
  and a gap-marked missing surface is carried once, as a completeness gap. Fixtures are listed in generated_test_ids (Plans/Automated_Testing_System.md#ATS-003); a bound oracle is listed in
  generated_test_ids, or in reused_test_ids when it is an existing test. Each rule ends in exactly one disposition: its required tests bound;
  for a schema rule whose refusing payload cannot be isolated, the passing payload bound together with a named gap
  evidenced to the standard of Plans/Planning_Wizard.md#PWIZ-111 (a complete keyword-aware isolation search over the
  fixed candidate domains PWIZ-111 defines, which also bound PlanCompile's own search), whether
  the planning check or PlanCompile's own code produced that evidence, as the disposition of the refusal, binding a recorded multi-rule input
  as a regression fixture only where the approved contract determines the refusal for that exact input, and never with
  single-rule coverage credit; or a test gap for each required test that is missing because it could not be
  produced, failed its pre-bind check, or has no automatic route. A PWIZ-111 budget test gap whose rule PlanCompile then
  covers with bound required tests stays as planning evidence only. A bound fixture with a missing assertion keeps the rule's disposition as bound, and that assertion's test gap
  still applies at completion. A test gap is a recorded-gap record holding the rule id, the missing test or the
  missing assertion of a bound fixture, the reason, evidence refs, catching rules and its
  test_gap_policy, which is block_completion or defer_non_executable_harness_candidate as ATS-004 requires for
  verification that cannot run automatically; allow_with_disposition and not_applicable are never used for a rule's
  required test. A completeness or design finding carried as a recorded gap (Plans/Planning_Wizard.md#PWIZ-110 and #PWIZ-111) keeps
  its PWIZ-012 gap class and is resolved under that class, outside the test-gap policies above; when the build resolves
  the missing detail, the resulting rule's tests bind through the successor plan (PNC-015). When a contract changes after approval, the successor plan reruns its PWIZ-110 and PWIZ-111 checks
  and regenerates its tests, and the PlanDiffImpactReport (Plans/Executor_Protocol.md#EP-102) classifies each consuming
  node, with changed tests counting as an impact. The test_binding, test_case and test_run_receipt definitions in Plans/plans_to_code_handoff.schema.json do not yet
  carry payload fixture, behaviour fixture or recorded-gap records, or per-test outcomes with references to each
  recorded gap and its policy; that schema change is a required companion change before any compile uses this unit,
  and its validation scenarios include a refusal that must preserve state and a replay that must return the right value
  without repeating its effect. This unit specifies the binding
  only; it emits no NodeSeeds, WorkNodes, executable queues or build tasks.
gui_related: false
gui_classification_reason: Defines how compile artifacts carry test fixtures; no visual presentation.
depends_on: [DL-512, PNC-013, PNC-015, PNC-016, EP-102, PWIZ-110, PWIZ-111, ATS-003, ATS-004]
unblocks: [ATS-401]
acceptance_criteria:
  - "Every rule of every contract binds to the node that owns its enforcement, or to the node that completes the contract, and ends in exactly one disposition: its required tests bound; a passing payload with a named gap evidenced to PWIZ-111's standard, by the planning check or by PlanCompile, for an unisolatable schema refusal; or a test gap for each required test that could not be produced, failed its pre-bind check, or has no automatic route."
  - "A schema rule's required tests are a refusing and a passing payload fixture; a declared failure result's are a refusing input and its passing neighbour; a behavioural criterion's is one fixture per input condition it lists, each asserting its stated outcome so that a wrong result fails; any other criterion's is its ATS-003 oracle; no contract is exempt from schema fixtures."
  - "Every behaviour fixture carries the owner-stated state and effect assertions for its polarity, each read through a declared observation surface, or a test gap where none exists."
  - "Every expected outcome comes from the approved contract; a referee case that disagrees with the contract or lacks a contract outcome never binds, and observed planning outcomes are kept only as evidence."
  - "Every behaviour fixture cites its source span, passes the schema and declared-failure-code check before it binds, and keeps an immutable reference to that span in the approved plan version."
  - "A named-gap regression input binds only where the approved contract determines its refusal, and never with single-rule coverage credit."
  - "A test gap's test_gap_policy is block_completion or defer_non_executable_harness_candidate; allow_with_disposition and not_applicable are never used for a rule's required test."
  - "A contract change after approval reruns its checks in the successor plan and regenerates its tests, and the PlanDiffImpactReport classifies every consuming node."
  - "The handoff schema change for payload fixture, behaviour fixture and recorded-gap records, and for per-test outcomes in test_run_receipt, is a recorded companion change, required before any compile uses this unit."
  - "A carried completeness or design gap keeps its PWIZ-012 class and is resolved under that class, not under the test-gap policies."
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
  - Do not count a named gap, a test gap or a rule without its required tests as passing.
  - Do not use an outcome the referee observed as a fixture's expected outcome; only the approved contract sets expectations.
  - Do not exempt a contract's schema rules from payload fixtures, and do not invent an opposite-polarity test for a behavioural criterion that prescribes none.
  - Do not give a rule's required test the test_gap_policy allow_with_disposition or not_applicable.
  - Do not create WorkNodes, NodeSeeds or build tasks from this unit.
owner_hints: [Plans/Plan_To_Node_Compilation.md, Plans/Automated_Testing_System.md, Plans/Planning_Wizard.md, Plans/Executor_Protocol.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-013, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-016, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004
