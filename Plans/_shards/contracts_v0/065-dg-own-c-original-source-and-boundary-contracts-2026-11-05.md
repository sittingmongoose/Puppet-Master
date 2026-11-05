# Shard 065: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Contracts_V0.md`

Source lines: L24828-L24992

Source SHA256: `559e3c67fa349d57155c5cfeb3c32e0b7740493c23938403227c5a338f0ccd73`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### CV-1130 - Goal update approval closed request and resolution roots

```yaml
plan_unit_id: CV-1130
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, adopt all U1-U7 closed
  definitions in Plans/goal_own_c_contracts/contracts.schema.json with id https://puppetmaster.local/schemas/goal_own_c/1.0.0/contracts.schema.json.
  Central GoalUpdateProposalRequest and ApprovalRequest are exact aliases; existing update/start/cancel shapes
  and union stay unchanged. ApprovalResolution, Target and original byte-image selections have no caller authority.
  Eagerly resolve the complete graph, check exact types and full-string formats, and bind true original source/whole
  request bytes rather than a supplied digest.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- CV-342
- HITL-1130
- SP-1130
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval closed request and resolution roots). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### CV-1131 - Goal cancellation source migration roots and original realms

```yaml
plan_unit_id: CV-1131
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, M1-M9 adopt closed
  MigrationRequest, MigrationResult, OwnerMapping, SourceImage and Selection roots in Plans/goal_own_c_contracts/contracts.schema.json.
  SourceImage carries exact original physical bytes and schema/codec/key/origin selection; each complete source
  validates in its own original realm. Actual owner membership, complete inventories, pending/receipt joins,
  effective Stop preservation and whole destination mapping are semantic predicates, never inferred from a
  schema-shaped byte carrier. Existing CV-347 and complete Project/app resource graphs remain exact.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- CV-347
- SP-1131
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/goal_own_c_contracts/contracts.schema.json
- Plans/goal_own_c_contracts/protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG-sol/REVIEW-cycle3.md#work-the-drafting-lead-can-assign-under-dl-045
negative_constraints:
- No new approval policy, cancellation lifecycle, retention/deletion policy or application goal_run.stopped
  edition.
- No source capability, runtime installation, full oracle PASS, Event Authority or WorkNode from a test adapter.
```

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation source migration roots and original realms). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json


### CV-1137 - Certified reference successor whole roots and scoped methods

```yaml
plan_unit_id: CV-1137
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract under DL-045 for exactly goal_run.certified. Plans/goal_run_projection_reference_contracts/certified.v1.schema.json,
  certified.resources.json, certified.imports.json, certified.methods.json and certified.definition-adaptations.json
  define the explicitly selected derived reference.v1 whole roots. Each method retains its complete original
  source arguments, return branches and entry/helper/final predicates. Only enumerated derived wrappers, key/table/checkpoint/profile
  selections change; never cast original native, producer, custody or birth headers. Explicitly select source-package.v2
  for its existing scoped retained-Handoff repair, keep original banks isolated, and eagerly resolve every
  reference including unvisited branches. New location-scoped metadata references enter only the exact original
  target realm. Profile commitments cover complete selected leaves before new generation birth; they never
  replace the original native all_writers.v7 descriptor. Missing source/codec/owner/pack capability refuses;
  schema or digest equality confers none.
gui_related: false
gui_classification_reason: Defines original source custody, derived physical representation and acceptance,
  without visual presentation.
depends_on:
- CV-352
- SP-1139
unblocks: []
acceptance_criteria:
- Preserve all complete original source, scope, custody, phase and lifetime predicates through explicit successor
  selection.
- Measure complete stored values and operations; rebuild and atomically cut over without rewriting predecessors.
- Report representation components separately from complete original semantic tuples and native NOT_RUN.
validation_surfaces:
- scripts/pm_goal_own_c3_w5_projection_oracles.py
- Plans/goal_run_projection_reference_contracts/certified.md
risk_class: original_source_custody_or_reference_representation_drift
reasoning_tier: high
context_scope: dg_own_c3_w5_part3_20261105
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/goal_run_projection_reference_contracts/certified.v1.schema.json
- Plans/goal_run_projection_reference_contracts/certified.methods.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-OWN-C3.md#part-3-for-c3-w34-split-and-c3-w5
negative_constraints:
- No Event registry admission, changed original bank/hash/header, retention/deletion policy, native installation
  or governance seal.
- No full oracle PASS from schema, size or source-shaped component controls.
```

ContractRef: ContractName:Plans/goal_run_projection_reference_contracts/certified.md
