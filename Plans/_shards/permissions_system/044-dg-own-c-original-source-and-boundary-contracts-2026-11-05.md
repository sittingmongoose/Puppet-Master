# Shard 044: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/Permissions_System.md`

Source lines: L11009-L11064

Source SHA256: `2cdd733d8301618bfe11517ee6fbe463e4ffc3481fda81aa4ba27f1bf120d357`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### PS-1130 - Goal update approval target and current authority

```yaml
plan_unit_id: PS-1130
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, U2-U5 binds the existing
  protected approver, exact original request and accepted user instruction, scope/currentness/text, permission
  snapshot and approval-host epoch at capture, resolution and final original body mutation. Source-message
  authorship and instruction provenance are independently authenticated. An approval does not waive Stop, deletion,
  Plan conflict or current access. Later event/result recovery preserves accepted body effects without reauthorizing
  a new mutation.
gui_related: false
gui_classification_reason: Defines original source custody, identity, recovery or testing boundaries without
  changing visual presentation.
depends_on:
- HITL-1130
- PS-147
- GRS-068
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
- Plans/Permissions_System.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update approval target and current authority). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json
