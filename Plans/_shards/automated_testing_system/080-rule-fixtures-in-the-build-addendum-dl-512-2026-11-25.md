# Shard 080: Rule fixtures in the build addendum (DL-512, 2026-11-25)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16494-L16550

Source SHA256: `93e2ddd58f63bd78fa1e3d4de13244c355243eabb4647364fdc9187f7fab2f50`

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
  of the node's test strategy (ATS-003). The node completes only when every positive fixture is accepted with its
  expected state and every negative fixture is refused with its declared failure code, as its TestRunReceipt records
  (ATS-004). A fixture reaches the built code through an adapter generated from the contract's interface binding; an
  adapter the builder writes by hand is reviewed separately from the implementation it judges. These tests prove that
  the code matches the plan; they cannot find a plan's own design bugs, which the planning checks own
  (Plans/Planning_Wizard.md#PWIZ-110 and #PWIZ-111). The builder also reports the source sentences it needed that no
  record carries. Its source sections are the source_lineage spans of the node's source_plan_unit_ids, and a record is
  a PlanUnit, an acceptance unit or a fixture. Each entry cites its span and says what the builder would otherwise
  have built differently; an entry without both is dropped. Entries are routed through PWIZ-005 by materiality, each
  with a PWIZ-012 gap class, so the user sees only requires_user_policy_decision or risk-acceptance cases, as plain
  decisions. The node's completion does not wait for routed entries. Each entry is also kept as a regression case for
  plan conversion in the project's planning evidence. No entry is added to a plan without its owner's decision, and
  none counts as a passed requirement.
gui_related: false
gui_classification_reason: Defines automated build verification and a builder report; no visual presentation.
depends_on: [DL-512, PNC-038, PWIZ-005, PWIZ-012, ATS-003, ATS-004]
unblocks: []
acceptance_criteria:
  - "A WorkNode with bound rule fixtures completes only when every positive fixture is accepted with its expected state and every negative fixture is refused with its declared failure code, as its TestRunReceipt records."
  - "Fixture adapters are generated from the contract's interface binding, or reviewed separately from the implementation they judge."
  - "Each builder report entry cites its source span and the different build it would have caused, is routed through PWIZ-005 with a PWIZ-012 gap class, and is kept as a plan conversion regression case in the project's planning evidence."
  - "The user sees a builder report entry only as a plain policy or risk-acceptance decision, and no entry changes a plan without its owner's decision."
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
negative_constraints:
  - Do not certify WorkNode completion when a bound rule fixture fails or did not run.
  - Do not let the implementation's own builder be the only judge of a hand-written fixture adapter.
  - Do not add an unrecorded source sentence to a plan without its owner's decision.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Planning_Wizard.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-512, ContractName:Plans/Plan_To_Node_Compilation.md#PNC-038, ContractName:Plans/Automated_Testing_System.md#ATS-003, ContractName:Plans/Automated_Testing_System.md#ATS-004, ContractName:Plans/Planning_Wizard.md#PWIZ-005, ContractName:Plans/Planning_Wizard.md#PWIZ-012, ContractName:Plans/Planning_Wizard.md#PWIZ-110, ContractName:Plans/Planning_Wizard.md#PWIZ-111
