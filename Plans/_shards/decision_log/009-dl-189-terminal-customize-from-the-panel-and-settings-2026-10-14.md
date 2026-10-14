# Shard 009: DL-189 — Terminal Customize from the panel and Settings (2026-10-14)

Source: `Plans/Decision_Log.md`

Source lines: L14484-L14529

Source SHA256: `5c46d671ae7d7ac3b244fa3d55edaf0d64cf05251fc7dab8691654c45a4f4fd9`

---

## DL-189 — Terminal Customize from the panel and Settings (2026-10-14)

```yaml
plan_unit_id: DL-189
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved both terminal Customize entry points on 2026-10-13. The screen keeps live field editing, quick
  sets, sample trials and truthful hints; All terminals writes the same Project rows as Settings and This
  terminal stays an override. F3-650 owns the screen and F3-642/SSYS-051 its fields and persistence boundaries.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256 1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256 2a14a7bdce73196184348fc649a99dbb7ab282d0e0008270b12755b7e756a1bd
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-650
- Plans/Settings_System.md#SSYS-051
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/Settings_System.md#SSYS-051
