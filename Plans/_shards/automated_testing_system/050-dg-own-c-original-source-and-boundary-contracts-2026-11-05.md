# Shard 050: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Automated_Testing_System.md`

Source lines: L7479-L7706

Source SHA256: `a35b2430726e936bca5ca7807a12c92e9b85edc6af7b4fdec9bf5839e27cbc15`

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


### ATS-1121 - Certified reference successor and full original tuple acceptance

```yaml
plan_unit_id: ATS-1121
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'Newly authored acceptance contract for exactly goal_run.certified, selecting Plans/goal_run_projection_reference_contracts/certified.md
  and scripts/pm_goal_own_c3_w5_projection_oracles.py for the derived representation prerequisite. Measure
  and round-trip complete inline, event_reference, record_reference, inline checkpoint and referenced checkpoint
  using the pinned original codec and isolated original banks. Reject wrong identity/commitment, physical key/dataset/Storage,
  byte-size/media/hash/corrupt/trailing/missing/inaccessible/undurable/foreign pack and over-limit whole operations.
  Export each new guard and one-defect negative for the shared isolation sweep; no local proof engine. Component
  success does not close W5: ATS-057 CF-01..12 and P4..P8 still require complete original v7/prepare.v2 coordinator,
  producer, native, Standard, D01, generic-prefix, private source/guard, row/checkpoint/CAS/crash/cutover/lifetime
  tuples against this explicit successor. Retained lawful history and current disclosure stay separate. Keep
  native execution NOT_RUN and whole-suite closure NOT_COMPLETE until the entire original-path corpus passes.'
gui_related: false
gui_classification_reason: Defines original source custody, derived physical representation and acceptance,
  without visual presentation.
depends_on:
- ATS-057
- GRS-1138
- SP-1139
- CV-1137
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
- Plans/Automated_Testing_System.md
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
