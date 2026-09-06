# Shard 029: Working Notebook Contract Validation Registration (2026-09-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L4057-L4112

Source SHA256: `cca282071bcb94bb66c752ce4e25bee41f07e8bdc4963d585a60000e223698eb`

---

## Working Notebook Contract Validation Registration (2026-09-05)

```yaml
plan_unit_id: ATS-046
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Plans/working_notebook_contracts.schema.json and Plans/working_notebook_contract_fixtures.json
  retain the Working Notebook static contract family: positive fixtures prove schema shape and
  explicitly encoded invariants, and 17 negative fixtures prove the validator rejects encoded
  malformed inputs (verified epistemic kind, oversize bodies/capsules, uncommitted checkpoint
  receipts, unwitnessed activation success, rotation conflation, unregistered tools, mixed range
  conventions, unknown error codes, unrestricted hostile imports, and crash cut points that
  discard or fabricate committed checkpoints). scripts/pm-working-notebook-contracts.py validates the
  family and cross-checks the four notebook storage registry rows, and it is wired as the named
  subcheck validate-working-notebook-contracts in pm-plans-verify.py run-gates and
  audit-governance with test coverage in tests/test_pm_working_notebook_contracts.py.
  Retaining or validating a fixture never means executing it: this is static schema/fixture
  evidence only, and native handler, provider, recovery, security, visual, and performance proof
  remains NOT_RUN.
gui_related: true
gui_classification_reason: The retained scenarios include notebook chat/orchestrator surface states and Context Details disclosure, which are GUI obligations.
split_recommended: false
depends_on: [ATS-045]
unblocks: []
acceptance_criteria:
  - Positive fixtures validate against the schema; every negative fixture is rejected.
  - The four notebook storage registry rows cross-check against the schema family ids.
  - No fixture success object is reported as handler, runtime, or readiness evidence.
validation_surfaces:
  - Plans/working_notebook_contracts.schema.json
  - Plans/working_notebook_contract_fixtures.json
  - python3 scripts/pm-working-notebook-contracts.py
  - python3 scripts/pm-plans-verify.py validate-working-notebook-contracts
  - python3 scripts/pm-plans-verify.py run-gates
  - tests/test_pm_working_notebook_contracts.py
risk_class: static_fixture_or_false_execution_claim
reasoning_tier: high
context_scope: working_notebook_static_contracts
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/working_notebook_contracts.schema.json, Plans/working_notebook_contract_fixtures.json, scripts/pm-working-notebook-contracts.py, tests/test_pm_working_notebook_contracts.py]
node_compile_hint: {mode: static_contract_fixture_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-V03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-V04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A57
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A58
preserved_exact_tokens: ["validate-working-notebook-contracts", "NOT_RUN", "static schema/fixture evidence only", "17 negative fixtures"]
negative_constraints:
  - Do not infer runtime, recovery, security, visual, or performance results from fixture validation.
  - Do not add schemas or fixture pairs to the gate through an ambient glob.
  - Do not convert static validation into execution evidence or a readiness unlock.
owner_hints: [Plans/Automated_Testing_System.md]
```

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Working_Notebook.md
