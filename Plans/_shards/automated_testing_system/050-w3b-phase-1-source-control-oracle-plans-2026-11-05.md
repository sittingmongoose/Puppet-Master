# Shard 050: W3B phase-1 Source Control oracle plans — 2026-11-05

Source: `Plans/Automated_Testing_System.md`

Source lines: L7238-L7737

Source SHA256: `1ad373a826436fda9f6808820677f15f2bc7a02f5008e571fa29f96cd23f4ef6`

---

## W3B phase-1 Source Control oracle plans — 2026-11-05

No oracle code is authored in this phase. The per-family plans below and `reports/event-authority-20261105/W3B-oracle-plan.json` define controls and single-defect negative constructions. Criterion 12 is PARTIAL for every row. Phase 2 requires the reviewed shared number/date-time helper and `scripts/pm_guard_isolation.py`, with predicate-by-predicate inventory of inherited schemas, exact duplicate-site proofs and Sol/Astra review. None of these plans proves native behavior or admission.

### ATS-1210 — Source Control phase-1 oracle plans 1

```yaml
plan_unit_id: ATS-1210
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.backend.detected uses SCS-1250, 133
  explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.backend.selected uses SCS-1251, 129 explicitly enumerated local schema/semantic guard-plan rows
  in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1250
- SCS-1251
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.backend.detected
- source_control.backend.selected
- PARTIAL
- NOT_RUN
```

### ATS-1211 — Source Control phase-1 oracle plans 2

```yaml
plan_unit_id: ATS-1211
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.checkpoint.created uses SCS-1252,
  136 explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.checkpoint.restored uses SCS-1253, 140 explicitly enumerated local schema/semantic guard-plan rows
  in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1252
- SCS-1253
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.checkpoint.created
- source_control.checkpoint.restored
- PARTIAL
- NOT_RUN
```

### ATS-1212 — Source Control phase-1 oracle plans 3

```yaml
plan_unit_id: ATS-1212
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.remote.fetch_completed uses SCS-1254,
  140 explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.remote.fetch_started uses SCS-1255, 136 explicitly enumerated local schema/semantic guard-plan
  rows in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1254
- SCS-1255
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.remote.fetch_completed
- source_control.remote.fetch_started
- PARTIAL
- NOT_RUN
```

### ATS-1213 — Source Control phase-1 oracle plans 4

```yaml
plan_unit_id: ATS-1213
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.remote.publish_completed uses SCS-1256,
  141 explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.remote.publish_started uses SCS-1257, 137 explicitly enumerated local schema/semantic guard-plan
  rows in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1256
- SCS-1257
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.remote.publish_completed
- source_control.remote.publish_started
- PARTIAL
- NOT_RUN
```

### ATS-1214 — Source Control phase-1 oracle plans 5

```yaml
plan_unit_id: ATS-1214
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.remote.sync_completed uses SCS-1258,
  145 explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.remote.sync_started uses SCS-1259, 141 explicitly enumerated local schema/semantic guard-plan rows
  in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1258
- SCS-1259
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.remote.sync_completed
- source_control.remote.sync_started
- PARTIAL
- NOT_RUN
```

### ATS-1215 — Source Control phase-1 oracle plans 6

```yaml
plan_unit_id: ATS-1215
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.repository.bound uses SCS-1260, 136
  explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.repository.unbound uses SCS-1261, 136 explicitly enumerated local schema/semantic guard-plan rows
  in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1260
- SCS-1261
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.repository.bound
- source_control.repository.unbound
- PARTIAL
- NOT_RUN
```

### ATS-1216 — Source Control phase-1 oracle plans 7

```yaml
plan_unit_id: ATS-1216
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.status.refreshed uses SCS-1262, 137
  explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.workspace.created uses SCS-1263, 136 explicitly enumerated local schema/semantic guard-plan rows
  in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1262
- SCS-1263
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.status.refreshed
- source_control.workspace.created
- PARTIAL
- NOT_RUN
```

### ATS-1217 — Source Control phase-1 oracle plans 8

```yaml
plan_unit_id: ATS-1217
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.workspace.opened uses SCS-1264, 136
  explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.workspace.removed uses SCS-1265, 138 explicitly enumerated local schema/semantic guard-plan rows
  in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1264
- SCS-1265
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.workspace.opened
- source_control.workspace.removed
- PARTIAL
- NOT_RUN
```

### ATS-1218 — Source Control phase-1 oracle plans 9

```yaml
plan_unit_id: ATS-1218
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.workspace.switched uses SCS-1266,
  140 explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  source_control.writer_lease.granted uses SCS-1267, 145 explicitly enumerated local schema/semantic guard-plan
  rows in reports/event-authority-20261105/W3B-oracle-plan.json. All inherited request/native/envelope/receipt/token
  schema assertions must be expanded by the reviewed shared tool in phase 2. Raw-number and timestamp profiles come
  from the shared foundation; no lane codec or timestamp routine. Negatives start from a valid case, repair dependent
  copies/hashes/keys/post-state and leave exactly one predicate invalid. Only identical field/predicate guards form
  duplicate sets; weakening one duplicate site leaves its peer, weakening all admits its negative. Compound rules
  and shared enforcement sites are cut per predicate. Include current replay-only refusal, valid retained replay-only
  and original-recipe history, 16 KiB wrapper/payload boundaries, malformed types/formats/LF, source authentication,
  full original receipts, global checkpoint coverage and every effect counter. Nothing here executes a fixture or
  proves guard isolation. Criterion 12 PARTIAL; native NOT_RUN. Registration, retention decisions, shared-helper/tool
  adoption and independent Sol/Astra review remain separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1266
- SCS-1267
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.workspace.switched
- source_control.writer_lease.granted
- PARTIAL
- NOT_RUN
```

### ATS-1219 — Source Control phase-1 oracle plans 10

```yaml
plan_unit_id: ATS-1219
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: This is an oracle plan only. Each family below has its own independent guard inventory, controls
  and single-defect negatives; no sibling fixture is evidence. source_control.writer_lease.lost uses SCS-1268, 147
  explicitly enumerated local schema/semantic guard-plan rows in reports/event-authority-20261105/W3B-oracle-plan.json.
  All inherited request/native/envelope/receipt/token schema assertions must be expanded by the reviewed shared
  tool in phase 2. Raw-number and timestamp profiles come from the shared foundation; no lane codec or timestamp
  routine. Negatives start from a valid case, repair dependent copies/hashes/keys/post-state and leave exactly one
  predicate invalid. Only identical field/predicate guards form duplicate sets; weakening one duplicate site leaves
  its peer, weakening all admits its negative. Compound rules and shared enforcement sites are cut per predicate.
  Include current replay-only refusal, valid retained replay-only and original-recipe history, 16 KiB wrapper/payload
  boundaries, malformed types/formats/LF, source authentication, full original receipts, global checkpoint coverage
  and every effect counter. Nothing here executes a fixture or proves guard isolation. Criterion 12 PARTIAL; native
  NOT_RUN. Registration, retention decisions, shared-helper/tool adoption and independent Sol/Astra review remain
  separate.
gui_related: false
gui_classification_reason: Plans verification of saved-history behavior.
depends_on:
- SCS-1268
unblocks: []
acceptance_criteria:
- Every listed family remains criterion-12 PARTIAL until phase-2 executable proof.
- Single-defect negative per guard; inherited predicates expanded before coverage can close.
validation_surfaces:
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: masked_negative_or_unproved_contract
reasoning_tier: high
context_scope: w3b_phase_1_oracle_plan
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: oracle_plan_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- WAVE3.md phase 1, deck 2 item 9.a A
preserved_exact_tokens:
- source_control.writer_lease.lost
- PARTIAL
- NOT_RUN
```
