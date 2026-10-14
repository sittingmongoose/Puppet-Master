# Shard 013: DL-193 — Notification defaults and Usage under the bell (2026-10-14)

Source: `Plans/Decision_Log.md`

Source lines: L14679-L14726

Source SHA256: `5c46d671ae7d7ac3b244fa3d55edaf0d64cf05251fc7dab8691654c45a4f4fd9`

---

## DL-193 — Notification defaults and Usage under the bell (2026-10-14)

```yaml
plan_unit_id: DL-193
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved the built defaults for notification questions 1–6 and explicitly answered question 7: Usage
  notices appear under the bell like every other page. F3-447 owns timing/staging, F3-453 the shared inbox and
  F3-460 material. The unbuilt automatic eight-second terminal-notice dismissal was not adopted by approval of
  built defaults.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256 2a14a7bdce73196184348fc649a99dbb7ab282d0e0008270b12755b7e756a1bd
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-447
- Plans/FinalGUISpec.md#F3-453
- Plans/FinalGUISpec.md#F3-460
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-447, ContractName:Plans/FinalGUISpec.md#F3-453, ContractName:Plans/FinalGUISpec.md#F3-460
