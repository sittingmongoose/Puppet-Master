# Shard 090: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/storage-plan.md`

Source lines: L30440-L30951

Source SHA256: `4809feb5ea7a33933ff0e945e520c89b3035a7fb7153f0466e362f1b3b880142`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### SP-1130 - Goal update approval original custody

```yaml
plan_unit_id: SP-1130
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, U6-U7 defines goal_update_proposal.v1:G:k(proposal_command_instance_id)
  and goal_update_approval_resolution.v1:G:k(approval_id), full original request/source/decision capture, existing
  thread-content versus content-free audit policies, whole MessagePack values and 16 KiB limits, SP-337 pack-before-reference
  durability, independent original byte resolution, coherent backup, restore and capability withdrawal. The
  existing approval owner issues these originals; neither schema nor wrapper authenticates it.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SP-299
- SP-337
- SP-340
- HITL-1130
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
- Plans/storage-plan.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval original custody). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SP-1131 - Goal cancellation unenrolled binding and old Stop migration

```yaml
plan_unit_id: SP-1131
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, M1-M9 is the separate
  source migration consumed by SP-305 and SP-423. Original StorageMigrationCoordinator joins all six actual
  owners, exact original source/association/pending/receipt images and effective host Stop, derives the full
  existing binding/control edition and atomically publishes complete mapping/result with original CAS/fences.
  goal_binding_migration_result.v1:G:k(migration_id) records first immutable enrolled, blocked_unresolved or
  withdrawn outcome. Missing representations never become empty; unknown effects and old Stop survive. The
  full source snapshots are transient; compact original mapping/result uses existing authority custody without
  extending source lifetime. Recover from actual first transaction/result; never retry birth after an unknown
  commit.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SP-305
- SP-423
- GRS-074
- SP-340
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
- Plans/storage-plan.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation unenrolled binding and old Stop migration). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SP-1132 - goal.updated original custody and oracle boundary adoption

```yaml
plan_unit_id: SP-1132
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, W1 adopts SP-299 and
  its complete original physical/source schema/method banks, SP-286 first/full-value receipt, exact envelope/payload
  selector and Storage metadata custody. No new event-derived projector or checkpoint is created. Exercise
  actual receipt/source resolution, retained history after live change, helper/final refusal, unknown/lost
  acknowledgement and exact stored-part limits/reference paths only where existing roots allow them. Native
  execution remains NOT_RUN.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SP-299
- SP-278
- SP-286
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
- Plans/storage-plan.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (goal.updated original custody and oracle boundary adoption). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SP-1133 - goal.cancelled original custody and oracle boundary adoption

```yaml
plan_unit_id: SP-1133
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, W2 adopts SP-304 and
  its complete original physical/source schema/method banks, SP-286 first/full-value receipt, exact envelope/payload
  selector and Storage metadata custody. No new event-derived projector or checkpoint is created. Exercise
  actual receipt/source resolution, retained history after live change, helper/final refusal, unknown/lost
  acknowledgement and exact stored-part limits/reference paths only where existing roots allow them. Native
  execution remains NOT_RUN.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SP-304
- SP-278
- SP-286
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
- Plans/storage-plan.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (goal.cancelled original custody and oracle boundary adoption). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SP-1134 - goal_run.started original custody and oracle boundary adoption

```yaml
plan_unit_id: SP-1134
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal_run.started, W3 adopts SP-311
  and its complete original physical/source schema/method banks, SP-286 first/full-value receipt, exact envelope/payload
  selector and Storage metadata custody. Keep its existing own full projection/checkpoint schema, physical
  keys, whole-root CAS, all nine durable SP-278 token fields, atomic row/checkpoint advance, generation cutover
  and withdrawal; passive reads own no durable progress. Exercise actual receipt/source resolution, retained
  history after live change, helper/final refusal, unknown/lost acknowledgement and exact stored-part limits/reference
  paths only where existing roots allow them. Native execution remains NOT_RUN. Amended 2026-11-11 (DG-S, DL-045)
  the TEST_ONLY Storage owner allocates sequences, times, first custody, packs, seeds and transactions for the
  W3 corpus `scripts/pm_goal_dg_s_oracles.py`, which checks all nine durable token fields, atomic row and checkpoint
  CAS with child-process cuts, staging and cutover, three generations with the 604800-second retirement window
  and holds, withdrawal and rebuild. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SP-311
- SP-278
- SP-286
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
- Plans/storage-plan.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (goal_run.started original custody and oracle boundary adoption). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SP-1135 - goal_run.cancelled original custody and oracle boundary adoption

```yaml
plan_unit_id: SP-1135
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal_run.cancelled, W4 adopts SP-312
  and its complete original physical/source schema/method banks, SP-286 first/full-value receipt, exact envelope/payload
  selector and Storage metadata custody. Keep its existing own full projection/checkpoint schema, physical
  keys, whole-root CAS, all nine durable SP-278 token fields, atomic row/checkpoint advance, generation cutover
  and withdrawal; passive reads own no durable progress. Exercise actual receipt/source resolution, retained
  history after live change, helper/final refusal, unknown/lost acknowledgement and exact stored-part limits/reference
  paths only where existing roots allow them. Native execution remains NOT_RUN.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SP-312
- SP-278
- SP-286
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
- Plans/storage-plan.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (goal_run.cancelled original custody and oracle boundary adoption). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SP-1136 - goal_run.certified original custody and oracle boundary adoption

```yaml
plan_unit_id: SP-1136
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal_run.certified, W5 adopts SP-317
  and its complete original physical/source schema/method banks, SP-286 first/full-value receipt, exact envelope/payload
  selector and Storage metadata custody. Keep its existing own full projection/checkpoint schema, physical
  keys, whole-root CAS, all nine durable SP-278 token fields, atomic row/checkpoint advance, generation cutover
  and withdrawal; passive reads own no durable progress. Exercise actual receipt/source resolution, retained
  history after live change, helper/final refusal, unknown/lost acknowledgement and exact stored-part limits/reference
  paths only where existing roots allow them. Native execution remains NOT_RUN.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SP-317
- SP-278
- SP-286
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
- Plans/storage-plan.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (goal_run.certified original custody and oracle boundary adoption). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SP-1138 - Explicitly selected GoalRun projection reference successors

```yaml
plan_unit_id: SP-1138
unit_type: owner_boundary
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Newly authored owner contract under DL-045 and C3-W34 part-2 technical ruling. The started and cancelled contracts are separately authored and independently selected; no family borrows a sibling source. SP-311/SP-312 whole Event identity, original whole-value commitment and SP-337 payload references are joined to actual original custody. Every complete stored row, checkpoint and operation is measured at 16 KiB; oversized metadata and checkpoint contents use separately verified pack references. Original banks, schemas, URIs, hashes, Event selectors, producer editions and historical bytes remain unchanged. Rebuild into a fresh isolated successor generation with full original sources and atomic fenced row/checkpoint publication and cutover; never rewrite old rows in place. Pack durability, access and source lifetime are independently rechecked at every helper and final boundary. Native remains NOT_RUN. ATS-1120 requires complete original-path W3/W4 or an exact technical blocker, never closure from schema specimens.
gui_related: false
gui_classification_reason: Internal source custody and stored representation; no visual presentation.
split_recommended: false
depends_on: [SP-337]
unblocks: []
acceptance_criteria:
- Full original value reconstruction and original source predicates apply before every effect or disclosure.
- Old whole bytes remain unchanged and all new stored parts and operations respect 16 KiB.
- An incomplete original-root corpus remains explicitly blocked; native execution is NOT_RUN.
validation_surfaces:
- Plans/goal_run_projection_reference_contracts/started.md
- Plans/goal_run_projection_reference_contracts/started.v1.schema.json
- Plans/goal_run_projection_reference_contracts/started.physical.json
- Plans/goal_run_projection_reference_contracts/started.resources.json
- Plans/goal_run_projection_reference_contracts/started.methods.json
- Plans/goal_run_projection_reference_contracts/cancelled.md
- Plans/goal_run_projection_reference_contracts/cancelled.v1.schema.json
- Plans/goal_run_projection_reference_contracts/cancelled.physical.json
- Plans/goal_run_projection_reference_contracts/cancelled.resources.json
- Plans/goal_run_projection_reference_contracts/cancelled.methods.json
- scripts/pm_goal_own_c3_w34_reference_oracles.py
risk_class: projection_reference_or_original_source_substitution
reasoning_tier: high
context_scope: c3_w34_reference_successor
implementation_surfaces:
- Plans/goal_run_projection_reference_contracts/started.md
- Plans/goal_run_projection_reference_contracts/started.v1.schema.json
- Plans/goal_run_projection_reference_contracts/started.physical.json
- Plans/goal_run_projection_reference_contracts/started.resources.json
- Plans/goal_run_projection_reference_contracts/started.methods.json
- Plans/goal_run_projection_reference_contracts/cancelled.md
- Plans/goal_run_projection_reference_contracts/cancelled.v1.schema.json
- Plans/goal_run_projection_reference_contracts/cancelled.physical.json
- Plans/goal_run_projection_reference_contracts/cancelled.resources.json
- Plans/goal_run_projection_reference_contracts/cancelled.methods.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/storage-plan.md#SP-311
- Plans/storage-plan.md#SP-312
- Plans/storage-plan.md#SP-337
negative_constraints:
- No event registry change, admission, original-source hash restamping or new retention policy.
- No in-place rewrite, source-lifetime extension, action authority or native proof from a projection.
```


### SP-1139 - Certified projection bounded reference physical edition

```yaml
plan_unit_id: SP-1139
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Newly authored owner contract under DL-045 for exactly goal_run.certified. Plans/goal_run_projection_reference_contracts/certified.md
  and certified.physical.json define the additive reference.v1 projection and checkpoint Storage selections.
  Preserve SP-317/P5 base64url UTF-8 key components, original whole-value commitment, complete identity/receipt
  joins, all nine durable token fields, profile_digest, root_revision, full preimage/afterimage CAS and actual
  transaction identity. Deterministically choose inline, event_reference, then record_reference by measuring
  BOTH complete row and complete operation against 16384 bytes in original CV-339 MessagePack. Checkpoint also
  uses its complete logical-value reference when necessary. Actual pack/index durability precedes referencing
  acknowledgement; full bytes/media/BLAKE3/size, original-source lifetime, independent disclosure and withdrawal
  checks remain mandatory. Preserve RP-PROJECTION-3GEN and each original source policy; no new hold/archive.
  Rebuild a fresh dataset, replay complete authentic prefix and cut over atomically. BRS-031 restores authority
  and rebuilds derived state. Original v5 physical selections remain history.
gui_related: false
gui_classification_reason: Defines original source custody, derived physical representation and acceptance,
  without visual presentation.
depends_on:
- SP-317
- SP-337
- SP-340
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
- Plans/storage-plan.md
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
