# Shard 065: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Contracts_V0.md`

Source lines: L24828-L25056

Source SHA256: `66de997a4776e946b96742104e1f6e685f3189c18fbe989233151e88ad3207e8`

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

### CV-1136 - Explicit older cancelled-v3 scoped-routing successor

Newly authored owner contract under DL-045 and the C3-W34b general successor ruling. Exactly the Project edition of `goal_run.cancelled` selects `Plans/goal_run_cancelled_w4_contracts/selection.v1.json` and its complete `protocol.md`. The pinned predecessor banks, schema bytes, URIs and hashes remain byte-exact history. Every selected method explicitly selects the new route together with the already authored cancelled projection-reference edition; no caller-selected or implicit fallback exists.

Only the eleven listed literal-reference locations in the whole original native WorkNode schema, in native_consumer, can enter the whole retained_original_d05 handoff resource at its original hash. Both original retrieval aliases are inspected. Nested references stay in the retained realm. Whole-source hash, exact location, literal and absolute-target checks precede dispatch; no guessed alias, fragment copying, global merge, network/host retrieval or original hash restamping is permitted. Eager qualification includes every unused schema branch. `pm_goal_own_c3_w34b_oracles.py` records qualification independently of full original-path closure.

EP-121/SP-312 still require complete authentic original D06/D05/D01/Start/Goal/FileSafe/process custody, distinct operation identities and complete first receipts. Schema resolution supplies no owner authority. Fresh current arguments, historical write-time recipes, SP-337 source-coupled payload references, whole row/checkpoint CAS, rebuild/cutover and SP-425 withdrawal retain their existing independent predicates. The new composition changes no event selector, admission, native registration, source lifetime or retention/deletion policy. The complete contract is `Plans/goal_run_cancelled_w4_contracts/protocol.md`.

```yaml
plan_unit_id: CV-1136
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for exactly the Project edition of goal_run.cancelled: an explicitly selected older source-composition successor admits only the eleven pinned native_consumer reference locations into the whole original retained_original_d05 realm, preserving predecessor bytes and nested realm resolution. Eager whole-bank qualification does not authenticate originals or close W4 semantics.
gui_related: false
gui_classification_reason: Defines isolated schema routing and source qualification without visual presentation.
depends_on:
- CV-347
- SP-312
- EP-121
- GRS-1137
- SP-1138
unblocks: []
acceptance_criteria:
- Every selected method names the versioned composition; predecessor banks and original resources remain byte-exact.
- Only the exact source realm, whole resource, hash, schema location and literal target can cross into the pinned retained realm; nested resolution stays there.
- Every reference, including unused definitions, resolves eagerly without a global merge or fallback.
- Qualification and full original-path closure are reported separately; no schema-shaped value supplies native authority.
validation_surfaces:
- Plans/goal_run_cancelled_w4_contracts/selection.v1.json
- Plans/goal_run_cancelled_w4_contracts/routing.v1.json
- Plans/goal_run_cancelled_w4_contracts/protocol.md
- scripts/pm_goal_own_c3_w34b_roots.py
- scripts/pm_goal_own_c3_w34b_oracles.py
risk_class: wrong_original_source_realm_or_implicit_reference_alias
reasoning_tier: high
context_scope: dg_own_c3_w34b_20261105
implementation_surfaces:
- Plans/goal_run_cancelled_w4_contracts
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/goal_certified_event_coordinator_contracts/original-reference-routing.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-OWN-C3.md
preserved_exact_tokens:
- goal_run.cancelled
- native_consumer
- retained_original_d05
negative_constraints:
- No event-registry edit, admission, Decision Log entry, native installation, retention/deletion change or application stopped-event edition.
- No original-bank rewrite, guessed alias, fragment copy, global realm merge, network retrieval or full W4 PASS from schema qualification.
owner_hints:
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md#EP-121
- Plans/storage-plan.md#SP-312
```

ContractRef: ContractName:Plans/goal_run_cancelled_w4_contracts/protocol.md, ContractName:Plans/goal_run_cancelled_w4_contracts/selection.v1.json


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
