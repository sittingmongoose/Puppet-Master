# Shard 017: DL-197 — Settled contrast includes resting hover and placeholders (2026-10-14)

Source: `Plans/Decision_Log.md`

Source lines: L14869-L14912

Source SHA256: `5c46d671ae7d7ac3b244fa3d55edaf0d64cf05251fc7dab8691654c45a4f4fd9`

---

## DL-197 — Settled contrast includes resting hover and placeholders (2026-10-14)

```yaml
plan_unit_id: DL-197
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The 2026-10-14 assignment confirms 4.5:1 for settled text, including resting hover and placeholders;
  transitions under 0.4 s are recorded, not failed, and disabled controls are exempt but legible. The
  coordinator's earlier 04:18 timing ruling is source lineage, not a claim that every word came directly from
  Jared. F3-654 is the one owner of this interpretation.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256 2a14a7bdce73196184348fc649a99dbb7ab282d0e0008270b12755b7e756a1bd
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-654
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-654
