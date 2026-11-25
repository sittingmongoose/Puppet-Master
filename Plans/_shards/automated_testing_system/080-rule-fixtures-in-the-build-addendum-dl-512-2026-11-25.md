# Shard 080: Rule fixtures in the build addendum (DL-512, 2026-11-25)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16494-L16540

Source SHA256: `98ce020e6b2fdccfdf9dde2e5c1711957158dcc0135f0729966044b09bcea017`

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
  of the node's test strategy (ATS-003): completion needs every positive fixture accepted and every negative fixture
  refused with its named code, recorded in the node's TestRunReceipt (ATS-004). These tests prove the code matches the
  plan; they cannot find a plan's own design bugs, which the planning checks own
  (Plans/Planning_Wizard.md#PWIZ-110 and #PWIZ-111). The builder also reads the node's source sections and lists
  every source sentence it needed that no record or fixture carries. Each such sentence becomes a provisional record
  routed to the plan's owner for decision and a regression case for plan conversion; it is never added to the plan
  silently and never treated as a passed requirement.
gui_related: false
gui_classification_reason: Defines automated build verification and a builder report; no visual presentation.
depends_on: [DL-512, PNC-038, ATS-003, ATS-004]
unblocks: []
acceptance_criteria:
  - "A WorkNode with bound rule fixtures completes only when every positive fixture is accepted and every negative fixture is refused with its named code, as its TestRunReceipt records."
  - "The builder's list of needed but unrecorded source sentences is part of the node's evidence; each entry becomes a provisional record for the plan's owner and a conversion regression case."
  - "No unrecorded sentence is added to a plan without the owner's decision."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: weak_test_oracle
reasoning_tier: high
context_scope: worknode_test_binding
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: worknode_test_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-512
  - "/mnt/Cursor/archive/PM-Experiments/conv11-20261027/consult6/ideas-fable.md and ideas-neon.md: the builder as a second reader of the source"
preserved_exact_tokens:
  - "TestRunReceipt"
  - "negative fixture"
  - "positive fixture"
negative_constraints:
  - Do not certify WorkNode completion when a bound rule fixture fails or did not run.
  - Do not add an unrecorded source sentence to a plan without the owner's decision.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111
