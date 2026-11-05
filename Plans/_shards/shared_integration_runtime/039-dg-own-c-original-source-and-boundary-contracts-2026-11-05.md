# Shard 039: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L3311-L3422

Source SHA256: `661d2ce3d3be4f1a9ef00b390c45fc46a629025a6d2392bf5480e0b20cc201ba`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### SIR-1130 - Goal update approval source and result joins

```yaml
plan_unit_id: SIR-1130
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, U1-U7 and W1 adopt original
  HITL provider capture/resolution into SIR-049 and SP-299. The original proposal dispatch stays read-only;
  actual approved update dispatch retains its own original identity, input digest, user instruction and still-valid
  approval before source/body acceptance. Join complete original typed request/approval/resolution and whole
  update result at each source/terminal/replay boundary; never let a proposal response stand in for accepted
  mutation or terminal success.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SIR-049
- HITL-1130
- PS-1130
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
- Plans/Shared_Integration_Runtime.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval source and result joins). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json

### SIR-1131 - Goal cancellation migration of original pending command custody

```yaml
plan_unit_id: SIR-1131
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.cancelled, M1-M9 adopt SIR-051/052/053
  original accepted dispatch, pending operation, command outcome and immutable terminal references into source
  migration. Compare original operation/scope/owner/result custody to Plan, Workflow and Goal originals. Preserve
  unresolved work and original result/replay; migration neither reexecutes Stop nor issues an acknowledgement,
  cancellation result or event. Current inspection remains fenced until complete enrolled original mapping
  exists.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- SIR-051
- SIR-052
- SIR-053
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
- Plans/Shared_Integration_Runtime.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal cancellation migration of original pending command custody). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json
