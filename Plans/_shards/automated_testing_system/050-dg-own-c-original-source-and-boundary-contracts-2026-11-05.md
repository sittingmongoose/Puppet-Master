# Shard 050: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7479-L7707

Source SHA256: `0bc0707040f6fd36ac75b7eadfebcd84ff8ff38a5b2256f1e1a860d1f955a8a3`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### ATS-1116 - Goal update approval and complete original route oracles

```yaml
plan_unit_id: ATS-1116
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, U1-U7 and W1 define independent
  original provider capture/decision resolution, direct Save and approved agent mutation, full source/body/first-event/terminal
  recovery, current body/history versus retained event/input/audit/replay and every private helper/final fence.
  The executable scripts/pm_goal_own_c_oracles.py has bounded new-provider and five-family custody cases and
  lists every new guard/negative; full original inherited-root cases remain mandatory before claiming PASS.
  No local guard-removal engine is added.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- CV-1130
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- python3 scripts/pm_goal_own_c_source_oracles.py
- Plans/goal_own_c_contracts/source-witness-inputs.json
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval and complete original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1117 - Goal cancellation migration and three original route oracles

```yaml
plan_unit_id: ATS-1117
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, M1-M9 and W2 define
  complete old Stop/association/pending/effect/receipt mapping, atomic enrollment/recovery/withdrawal and separate
  no-association, bound Plan and Workflow whole-value producer/current-inspection/immutable replay cases. Every
  missing, foreign, forged, stale, contradictory, unknown or changed-after-helper source is refused for its
  own defect; all dependent copies/hashes/keys stay coherent. Preserve earlier genuine effects. New adapter
  evidence is bounded; full inherited-root instantiation stays required.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- CV-1131
unblocks: []
acceptance_criteria:
- Independently acquire complete original owner sources before helpers and recheck complete sources and entire
  candidate after the last helper at each own effect or disclosure.
- Preserve genuine earlier effects, original receipts and immutable replay; missing or unknown authority stays
  unavailable.
- Use exact own-family source, scope, selected schema realm and existing retention; no registry admission,
  native runtime or governance proof.
validation_surfaces:
- python3 scripts/pm_goal_own_c_source_oracles.py
- Plans/goal_own_c_contracts/source-witness-inputs.json
- scripts/pm_goal_own_c_oracles.py
- Plans/goal_own_c_contracts/protocol.md
risk_class: forged_original_authority_or_lost_pending_effect
reasoning_tier: high
context_scope: dg_own_c_20261105
implementation_surfaces:
- Plans/Automated_Testing_System.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation migration and three original route oracles). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1118 - Three exact GoalRun producer and projector oracle suites

```yaml
plan_unit_id: ATS-1118
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Newly authored owner contract under DL-045. Separate W3 goal_run.started, W4 goal_run.cancelled
  and W5 goal_run.certified suites adopt original Start, positive D06 and v7/prepare.v2 coordinator identity/append/commit/release
  respectively. Each owns its full schema-realm tuple, actual original source and first receipt, global prefix,
  full row/checkpoint/token/CAS/stage/cutover, retained/current and withdrawal tests. Certified includes every
  ATS-057 CF-01..12 and passive P4-P8 obligation. The executable adapter reports bounded dispatch/custody/final-fence
  coverage separately from full original native-root specimens; native remains NOT_RUN and no full oracle grade
  follows from table-only checks.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- ATS-210
- ATS-057
- EP-1130
- EP-1131
- EP-1132
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
- Plans/Automated_Testing_System.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Three exact GoalRun producer and projector oracle suites). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### ATS-1120 - W3 and W4 original-path reference successor qualification

```yaml
plan_unit_id: ATS-1120
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Newly authored owner contract under DL-045 and C3-W34 part-2 technical ruling. The started and cancelled contracts are separately authored and independently selected; no family borrows a sibling source. SP-311/SP-312 whole Event identity, original whole-value commitment and SP-337 payload references are joined to actual original custody. Every complete stored row, checkpoint and operation is measured at 16 KiB; oversized metadata and checkpoint contents use separately verified pack references. Original banks, schemas, URIs, hashes, Event selectors, producer editions and historical bytes remain unchanged. Rebuild into a fresh isolated successor generation with full original sources and atomic fenced row/checkpoint publication and cutover; never rewrite old rows in place. Pack durability, access and source lifetime are independently rechecked at every helper and final boundary. Native remains NOT_RUN. ATS-1120 requires complete original-path W3/W4 or an exact technical blocker, never closure from schema specimens.
gui_related: false
gui_classification_reason: Internal source custody and stored representation; no visual presentation.
split_recommended: false
depends_on: [ATS-1118]
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
