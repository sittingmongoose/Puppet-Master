# Shard 080: Rule fixtures in the build addendum (DL-512, 2026-11-25)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16494-L16569

Source SHA256: `1e2a63acef6eab70e9cf9b5ad8a259f73598835f1f1617efecb1c246159e0a02`

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
  of the node's test strategy (ATS-003). The node completes only when every bound fixture meets its expected outcome: accepted
  (with its expected state where the fixture states one), the stated result, or refused with its declared failure code
  (and its error path where the fixture records one). Every bound ATS-003 oracle must pass, and every recorded test gap
  is honoured under its test_gap_policy (a block_completion gap blocks completion; a
  defer_non_executable_harness_candidate gap is recorded as ATS-004 requires). The TestRunReceipt records each of these through the companion schema change that
  Plans/Plan_To_Node_Compilation.md#PNC-038 names (ATS-004). A payload fixture runs against the built validator of its data shape, or through a declared consuming operation
  that exercises that validation. A behaviour fixture reaches the built code through an adapter generated from the
  contract's interface binding (the callable surface each operation or event maps to,
  Plans/Planning_Wizard.md#PWIZ-110). A fixture with no automatic route is a recorded test gap under ATS-004, never a
  silent pass. The adapter reaches a fixture's prior state by replaying the
  owner's own operations or through a seeding port the contract declares, never by writing storage directly. An
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
depends_on: [DL-512, PNC-038, PNC-015, EP-102, PWIZ-012, PWIZ-110, ATS-003, ATS-004]
unblocks: []
acceptance_criteria:
  - "A WorkNode with bound rule tests completes only when every bound fixture meets its expected outcome, every bound ATS-003 oracle passes, and every recorded test gap is honoured under its test_gap_policy, as its TestRunReceipt records."
  - "Payload fixtures run against the built validator or a declared consuming operation; behaviour fixture adapters are generated from the contract's interface binding and reach prior states by replaying owner operations or a declared seeding port, never by direct storage writes; a hand-written adapter is checked by an automated verification agent that is not the builder; a fixture with no automatic route is a recorded test gap."
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

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-015, ContractName:Plans/Executor_Protocol.md#EP-102, ContractName:Plans/Planning_Wizard.md#PWIZ-012, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111
