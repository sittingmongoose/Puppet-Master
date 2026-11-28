# Shard 080: Rule fixtures in the build addendum (DL-512, 2026-11-25)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16497-L16603

Source SHA256: `c410594518918ec9cf51d83ec7baf4a6bfe99c3b1ffd1a495403e838e0e26635`

---

## Rule fixtures in the build addendum (DL-512, 2026-11-25)

### ATS-401 - The Build Runs Rule Fixtures And Reports Unrecorded Needs

```yaml
plan_unit_id: ATS-401
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  During a WorkNode build, the rule fixtures bound by Plans/Plan_To_Node_Compilation.md#PNC-038 run as required tests
  of the node's test strategy (ATS-003). The node completes only when every bound fixture meets its expected outcome (accepted with any stated result, or
  refused with its declared failure code and, where its expected outcome includes them, its error path and, separately, the
  member for a per-member rule, each compared only when expected (a wrapper path can be expected while the member stays
  provenance), or the diagnostic the owner's approved interface exposes for a semantic refusal; a path or member the
  fixture keeps only as provenance is never compared) and every state and effect
  assertion the fixture carries holds when read through its declared observation surface; a multi-step fixture meets
  it only when every step also met its own expected outcome and effects, as Plans/Plan_To_Node_Compilation.md#PNC-038
  provides, its TestRunReceipt recording each step's result. A fixture that exercises a surface another node implements
  (Plans/Plan_To_Node_Compilation.md#PNC-038), a split rule's fixture owner's or one whose prior state is reached
  through another node's operation, counts only when it ran against its node's final build together with the
  completed outputs of every other node it exercises, which the Executor brings into that build
  (Plans/Executor_Protocol.md#EP-100), and its TestRunReceipt names all of them; a pass on an earlier or partial build
  never counts, and the fixture runs again once they are in. Any step of any fixture that reaches a surface enforced
  outside the compile's write scope runs on the exact owner build the node resolves, whose identity its TestRunReceipt
  binds and which must match the node's final owner dependency. Every bound ATS-003 oracle must pass, and every recorded test gap
  is honoured under its test_gap_policy (a block_completion gap blocks completion; a defer_non_executable_harness_candidate gap is recorded with its test-harness WorkNode request candidate as
  ATS-004 requires and keeps the rule's verification open, so the node is not marked complete until the harness work
  lets the test run and pass, as Plans/Executor_Protocol.md#EP-101 requires). The TestRunReceipt records each of these through the companion schema change that
  Plans/Plan_To_Node_Compilation.md#PNC-038 names (ATS-004). A payload fixture runs against the built validator of its data shape, or through a declared consuming operation
  that exercises that validation; every payload fixture's TestRunReceipt names the surface actually invoked, and the
  fixture counts only on its bound surface: one bound to the built validator counts when run on the validator itself, or
  through a declared consuming operation only where the validator is the rule's sole surface and the run observes and
  compares the bound validator's own verdict for that exact payload (otherwise it runs on the validator directly or
  records the applicable test gap), and one bound to a separately declared owner surface counts only when run on that surface. A fixture whose
  step uses a value an earlier step issued at run time, PNC-038's run-time value route included, counts only when its
  receipt shows that the exact substituted input passed PNC-038's approved reference check for its case and that the
  verdict came from its bound surface; a missing output or a failed check leaves it unsatisfied. That one surface rule
  holds for every run; for every fixture, payload or behaviour, of a rule surface enforced outside the compile's write
  scope
  (Plans/Plan_To_Node_Compilation.md#PNC-038) three requirements add to it: the run (for a multi-step fixture, its
  certified step, each earlier step keeping its own surface's rules) targets the exact owner build the
  node resolves, whose immutable identity its TestRunReceipt binds and which must match the node's final owner
  dependency (a changed dependency needing a fresh run); it never passes through the receiving node's own code, though
  a validator that is the rule's sole surface may be reached through that owner's own declared consuming operation; and
  its refusal counts only when that build produced it. A behaviour fixture reaches the built code through an adapter generated from the
  contract's interface binding (the callable surface each operation or event maps to,
  Plans/Planning_Wizard.md#PWIZ-110). A fixture with no automatic route is a recorded test gap under ATS-004, never a
  silent pass, except a human-only action whose owner forbids automated access, which binds the permitted boundary and
  lifecycle checks as Plans/Plan_To_Node_Compilation.md#PNC-038 provides. The adapter reaches a fixture's prior state by replaying the
  owner's own operations or through a seeding port the contract declares, never by writing storage directly, and runs
  the harness actions a sequence names, such as a cut, a restart or a clock advance, against the same build. An
  adapter the builder writes by hand is checked by an automated verification agent that is not the builder; no human
  review is required (ATS-004). A builder who finds that a fixture contradicts the source span it cites files a report
  entry naming the fixture; the fixture stays required, and a corrected fixture arrives only through a successor plan
  (PNC-015, EP-102). The builder never waives or edits a fixture. These tests prove that the code matches the plan;
  they cannot find a plan's own design bugs, which the planning checks own (Plans/Planning_Wizard.md#PWIZ-110 and
  #PWIZ-111). The builder also reports the source sentences it needed that no record carries. Its source sections are
  the source_lineage spans of the node's source_plan_unit_ids, and a record is a PlanUnit, an acceptance unit or a
  fixture. Each entry cites its span and says what the builder would otherwise have built differently; an entry
  without both is dropped. Each entry carries a PWIZ-012 gap class. A technical entry goes to the planning repair
  route; a policy entry goes to the plan's approver, so the user sees only requires_user_policy_decision or
  risk-acceptance cases, as plain decisions. Where an actual safe default exists, the builder proceeds on a recorded safe_default_with_assumption and the node's
  completion does not wait for the routed entry. Where PWIZ-012 requires a decision before proceeding (product policy
  with no safe inference, material risk acceptance, or a destructive or irreversible operation), the affected behaviour
  stays behind that authority boundary until the decision arrives, while independent work continues. A material entry produces a successor plan (PNC-015), and its
  PlanDiffImpactReport reclassifies the node if the decision differs from the assumption. Each entry is also kept as a
  regression case for plan conversion in the project's planning evidence. No entry is added to a plan without its
  owner's decision, and none counts as a passed requirement.
gui_related: false
gui_classification_reason: Defines automated build verification and a builder report; no visual presentation.
depends_on: [DL-512, PNC-038, PNC-015, EP-100, EP-101, EP-102, PWIZ-012, PWIZ-110, ATS-003, ATS-004]
unblocks: []
acceptance_criteria:
  - "A WorkNode with bound rule tests completes only when every bound fixture meets its expected outcome (accepted with any stated result, or refused with its declared code and, each only where expected, its error path, its member or the exposed diagnostic of a semantic refusal) and every state and effect assertion it carries holds through its observation surface, a multi-step fixture only when every step met its own expected outcome and effects with each step's result in its receipt, every bound ATS-003 oracle passes, and every recorded test gap is honoured under its test_gap_policy, a deferred harness candidate leaving the node incomplete until the harness work lets its test run and pass, as its TestRunReceipt records."
  - "A fixture that exercises another node's surface, a split rule's included, counts at completion only when it ran on its node's final build with the completed outputs of every other node it exercises, all named in its TestRunReceipt; a pass on an earlier or partial build never counts."
  - "Payload fixtures run against the built validator or a declared consuming operation, every receipt naming the surface actually invoked and a fixture counting only on its bound surface (a validator-bound one also through a declared consuming operation, but only where the validator is the rule's sole surface and the run observes the validator's own verdict for that payload), a fixture whose step uses a run-time issued value counting only when its receipt shows the substituted input passed PNC-038's approved reference check and its verdict came from its bound surface, every step that reaches a surface outside the write scope running on the exact owner build the node resolves, its identity bound in the receipt and matching the node's final owner dependency, a changed dependency needing a fresh run, and every fixture of a rule surface enforced outside the write scope also runs (for a multi-step fixture, its certified step), never through the receiving node's own code (a validator that is the rule's sole surface may be reached through that owner's declared consuming operation), only on its bound surface of the exact owner build the node resolves, named in its receipt, counts only when that build's identity matches the node's final owner dependency, a changed dependency needing a fresh run, and counts a refusal only when that build produced it; behaviour fixture adapters are generated from the contract's interface binding and reach prior states by replaying owner operations or a declared seeding port, never by direct storage writes, and run a sequence's harness actions, such as a cut, against the same build; a hand-written adapter is checked by an automated verification agent that is not the builder; a fixture with no automatic route is a recorded test gap, except on a surface whose owner forbids automated access, where the permitted boundary and lifecycle checks are the required tests."
  - "A fixture that contradicts its cited span stays required until a successor plan corrects it; the builder never waives or edits a fixture."
  - "Each builder report entry cites its source span and the different build it would have caused, carries a PWIZ-012 gap class, goes to the planning repair route or the plan's approver, and is kept as a plan conversion regression case in the project's planning evidence."
  - "The user sees a builder report entry only as a plain policy or risk-acceptance decision, and no entry changes a plan without its owner's decision."
  - "The builder proceeds on a recorded assumption only where an actual safe default exists; behaviour that needs a PWIZ-012 decision first stays behind that authority boundary while independent work continues."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: weak_test_oracle
reasoning_tier: high
context_scope: worknode_test_binding
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: worknode_test_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "/mnt/Cursor/archive/PM-Experiments/conv11-20261027/consult6/ideas-fable.md and ideas-neon.md: the builder as a second reader of the source, and the padding risk"
preserved_exact_tokens:
  - "TestRunReceipt"
  - "declared failure code"
  - "interface binding"
  - "seeding port"
negative_constraints:
  - Do not certify WorkNode completion when a bound rule fixture fails or did not run.
  - Do not let the builder waive or edit a fixture, or judge its own hand-written fixture adapter.
  - Do not reach a fixture's prior state by writing storage directly.
  - Do not add an unrecorded source sentence to a plan without its owner's decision.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Planning_Wizard.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Executor_Protocol.md#EP-100, ContractName:Plans/Executor_Protocol.md#EP-101, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-012, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111
