# Shard 090: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/storage-plan.md`

Source lines: L30440-L30836

Source SHA256: `a2240e06a32b7c822dab3a39ecec0f3abe255c0e861ce9784508c02b195e1228`

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
- python3 scripts/pm_goal_dg_cb_oracles.py
- Plans/goal_own_c_contracts/dg-cb-corpus-v1/coverage.json
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

DG-CB (2026-11-12) executes this migration as complete TEST_ONLY original paths on the shared owner adapters (C5 capture and mapping, C6 atomic installation, recovery and withdrawal); see `Plans/goal_own_c_contracts/protocol.md` (DG-CB paragraph after M9) and `Plans/goal_own_c_contracts/dg-cb-corpus-v1/coverage.json`. native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.

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
  paths only where existing roots allow them. Native execution remains NOT_RUN.
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
