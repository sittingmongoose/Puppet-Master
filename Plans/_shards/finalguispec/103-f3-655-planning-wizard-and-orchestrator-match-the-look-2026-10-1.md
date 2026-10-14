# Shard 103: F3-655 — Planning Wizard and Orchestrator match the look (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L47264-L47323

Source SHA256: `ad093afce0ca7418862e8c4d9bfd4fbb8d1081f379037deb47635caf0ea41254`

---

## F3-655 — Planning Wizard and Orchestrator match the look (2026-10-14)

```yaml
plan_unit_id: F3-655
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Planning Wizard and Orchestrator receive minor fixes and theme matching while their full redesign remains
  deferred. Their layout, planning/execution owners and flows are not replaced. Statuses are a mark and word,
  facts a small square and words, and counts plain numbers under F3-648. Work types use joined cells with a
  filled choice; answers remain the approved stacked reply rows in one box. Friendly widgets keep the white
  Light and plum Dark plates shared by Home and Usage. Chosen views fill their own boxes, stronger than hover,
  using the neutral family selection grammar; the title-bar Light/Dark/Auto menu shares that grey chosen fill,
  with Glass frost/rim, Retro reverse video and NieR ink. Primary actions and complete text remain readable;
  placeholders stay inside rows and inputs do not clip their hints. Reduced Motion removes moving, popping and
  blinking treatments. LIVE pulses only while the run is running. Liquid Glass columns are sheets with
  inner-card fills, and Orchestrator title, plan picker and tabs share an aligned header sheet under F3-652.
  OP-033 owns explicit retry confirmation and OP-037 owns current/historical scope truth; choosing a page or
  scope must not open a retry confirmation or fabricate a historical banner. Jared's three answers retain the
  Friendly plates, retain the answer rows and adopt the neutral mode-menu selection.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All ten looks render the two pages with readable actions, no pill labels and a chosen state stronger than hover.
- Opening Orchestrator or changing scope does not open retry confirmation; paused runs have no LIVE pulse.
- All three recorded answers are preserved without a full page redesign.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wizard-orch-theme/NOTES.md, SHA-256 ca7f206e6b92440d26972e4eb4113348722fb45245ba8429dad46633b56b49b8
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Planning_Wizard.md#PWIZ-021
- Plans/Orchestrator_Page.md#OP-033
- Plans/Orchestrator_Page.md#OP-037
- Plans/FinalGUISpec.md#F3-648
- Plans/FinalGUISpec.md#F3-652
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/Orchestrator_Page.md#OP-033, ContractName:Plans/Orchestrator_Page.md#OP-037, ContractName:Plans/FinalGUISpec.md#F3-648, ContractName:Plans/FinalGUISpec.md#F3-652
