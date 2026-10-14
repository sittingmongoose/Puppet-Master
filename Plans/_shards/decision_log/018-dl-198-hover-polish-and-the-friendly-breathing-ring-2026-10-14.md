# Shard 018: DL-198 — Hover polish and the Friendly breathing ring (2026-10-14)

Source: `Plans/Decision_Log.md`

Source lines: L14914-L14959

Source SHA256: `5c46d671ae7d7ac3b244fa3d55edaf0d64cf05251fc7dab8691654c45a4f4fd9`

---

## DL-198 — Hover polish and the Friendly breathing ring (2026-10-14)

```yaml
plan_unit_id: DL-198
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved the Basic/Friendly/Retro/NieR hover/press polish on 2026-10-13 and kept Friendly's breathing
  ring. F3-465 and DR-072 own the shared marker and its reduced-motion form, preserving the earlier
  stationary-pointer/filtering repairs and leaving Glass optical hover with its own material owner.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256 2a14a7bdce73196184348fc649a99dbb7ab282d0e0008270b12755b7e756a1bd
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-465
- Plans/DRY_Rules.md#DR-072
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/DRY_Rules.md#DR-072
