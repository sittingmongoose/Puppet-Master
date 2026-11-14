# Shard 022: DG-OWN-C original source and boundary contracts (2026-11-05)

Source: `Plans/human-in-the-loop.md`

Source lines: L2806-L2859

Source SHA256: `c4538ca0f08e3ae892d324f691390b4c7499fe3b9d7d27f236d61bfc56e961d0`

---

## DG-OWN-C original source and boundary contracts (2026-11-05)

### HITL-1130 - Goal update original approval provider

```yaml
plan_unit_id: HITL-1130
unit_type: owner_boundary
status: accepted
owner_doc: Plans/human-in-the-loop.md
canonical_text: Newly authored owner contract under DL-045. For exactly goal.updated, sections U1-U7 materialize
  GoalUpdateProposalRequest and ApprovalRequest and owner.hitl.goal_update.capture.v1, resolve.v1 and read_resolution.v1
  within the existing approval host. Bind actual agent source message and user instruction to the exact Goal/predecessor/currentness/whole
  proposed text and genuine protected person decision. Denial, expiry, revocation, foreign/stale target or
  source refuses before body CAS. Proposal is read-only; direct Save has no additional confirmation. No generic
  approval or caller hash grants mutation.
gui_related: true
gui_classification_reason: Defines existing approval-dialog target and human-decision presentation.
depends_on:
- GRS-068
- HITL-038
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
- Plans/human-in-the-loop.md
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

The complete newly authored contract is `Plans/goal_own_c_contracts/protocol.md` (Goal update original approval provider). Its schema roots are `Plans/goal_own_c_contracts/contracts.schema.json`; complete original source roots and methods remain selected in their original banks.

ContractRef: ContractName:Plans/goal_own_c_contracts/protocol.md, ContractName:Plans/goal_own_c_contracts/contracts.schema.json
