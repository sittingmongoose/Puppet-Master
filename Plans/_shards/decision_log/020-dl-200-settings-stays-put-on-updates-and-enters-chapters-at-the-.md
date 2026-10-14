# Shard 020: DL-200 — Settings stays put on updates and enters chapters at the top (2026-10-14)

Source: `Plans/Decision_Log.md`

Source lines: L15011-L15056

Source SHA256: `5c46d671ae7d7ac3b244fa3d55edaf0d64cf05251fc7dab8691654c45a4f4fd9`

---

## DL-200 — Settings stays put on updates and enters chapters at the top (2026-10-14)

```yaml
plan_unit_id: DL-200
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The approved M4 design, confirmed by the 2026-10-14 assignment, keeps the reader's anchor on in-place updates,
  restores exact Settings place on return and opens deliberately chosen chapters at the top. Settings occupies
  its final width from frame one. SSYS-053 owns the behavior; the old jumping baseline and performance-only
  workarounds are not accepted alternatives.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-perf-fixes/M4-DESIGN-DECISION.md, SHA-256 df7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256 2a14a7bdce73196184348fc649a99dbb7ab282d0e0008270b12755b7e756a1bd
  (approved campaign source lineage; not native implementation evidence)
- Plans/Settings_System.md#SSYS-053
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-053
