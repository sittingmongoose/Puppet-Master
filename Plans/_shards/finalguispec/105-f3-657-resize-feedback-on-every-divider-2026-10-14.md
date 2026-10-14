# Shard 105: F3-657 — Resize feedback on every divider (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L47390-L47449

Source SHA256: `ad093afce0ca7418862e8c4d9bfd4fbb8d1081f379037deb47635caf0ea41254`

---

## F3-657 — Resize feedback on every divider (2026-10-14)

```yaml
plan_unit_id: F3-657
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every resizer shares one feedback grammar: panel dividers in both directions, panel/chat and panel/rail edges
  and the browser DevTools split. Near a bar a faint glint invites then relaxes; on it a weighted light follows
  the pointer and stretches with speed; pressing catches it and lights the whole held bar; fast motion warms it
  and leaves a short wake; pushing a minimum-size limit strains the mark; release drains to the release point
  and settles once. Focus places the mark at the middle and each keyboard resize step settles it. Basic is a
  precise fine rod and endpoint ticks; Friendly a mint bead over swelling dots with bubbles and a settling ring;
  Glass neutral white light caught on both facing panel edges, with dark refraction beside the Light highlight
  and no color splitting or extra bar blur; Retro a cell-stepped cursor and phosphor persistence, ink/dither in
  Light; NieR an ink ruler, gated square/brackets and stepped ticks with no glow. Reduced Motion keeps calm
  appearance/disappearance and held/released state, without spring, streak, trail, blink or bounce; NieR snaps
  to its end state. The light tracks the actual resize lifecycle even if the bar's owner captures input
  elsewhere. It never changes the resize command, minimum or transaction, and does no animation work when idle
  away from a bar. This replaces the older unrelated per-divider hover line and first-pass blob/release-sparks
  treatment.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All five bar classes show hover, grab, held, limit and release feedback in all ten looks and both motion modes,
  including the chat edge.
- Keyboard steps and cancellation leave correct state, and idle bars do no animation work.
- Glass and NieR obey their material constraints; feedback never changes geometry or command counts.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-630
- Plans/FinalGUISpec.md#F3-652
- Plans/UI_Wiring_Rules.md#UIW-012
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/UI_Wiring_Rules.md#UIW-012
