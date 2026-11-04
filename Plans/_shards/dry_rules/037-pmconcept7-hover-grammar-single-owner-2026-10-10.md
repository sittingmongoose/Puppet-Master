# Shard 037: PMConcept7 hover grammar single owner — 2026-10-10

Source: `Plans/DRY_Rules.md`

Source lines: L3501-L3581

Source SHA256: `1e82eb3fe72cf40ae8d0e33431c20ebf4cac99b09fefa82aa7d05d544c23c68d`

---

## PMConcept7 hover grammar single owner — 2026-10-10

DL-171 merges PMConcept7's two hover systems into one, so the hover grammar must live in one place and every surface must take it rather than restate it.

### DR-072 - One Hover Grammar For PMConcept7

```yaml
plan_unit_id: DR-072
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The shared hover grammar has exactly one owner, FinalGUISpec F3-465: the magnet, the pointer light, the
  emitted glow, the continuous field with its neighbours, the Retro form Raise, the NieR form Lock-on, the
  Reduced Motion and software-rendered forms, and the boundary. It has one shared hover engine riding the
  one merged pointer-move owner F3-446 and one token set with family, kind and family-by-kind rows. The card,
  row, tile and icon kinds and the bounded small-control extension use the same owner. A surface enrolls with
  its target kind through that owner; explicit target opt-out and containing-region exemptions exclude it.
  Surfaces never restate the effect: no surface keeps its own hover lift, glow, pointer sheen, magnet,
  pointer-move listener or animation loop, and any independent hover lift or ring on a target is suppressed
  rather than layered under the grammar. A surface that needs a different strength sets a token for its kind
  and never forks a layer. The boundary is part of the grammar: editor and terminal text surfaces never
  receive card effects; small controls use F3-465's shared marker without card magnet, Glass uses F3-652's
  optical marker, and dividers use F3-657's one resize grammar. Tab silhouettes stay with their tab owners
  (F3-505, F3-466), and parallax stays with F3-446. Target selection, outermost-target and occlusion rules,
  settling, and Reduced Motion, software-rendering and gesture gates remain F3-465's shared policy.
  Amended 2026-10-29 (O2, PC1; PM7): Pip gaze/watch dwell subscribe to the shared pointer/hover owner, with
  one bounded kit rig clock for illustration, not a per-surface pointer listener or hover effect. It pauses
  hidden/offscreen/during drags and keeps the last pointer position. QA round 2, Jared 2026-10-30; DL-258;
  GUI 7d586bad18: Q20: Glass has only the F3-465 shared hover light on registered edge-glow objects, including
  Usage/Home widgets, cards, tiles and rows. No independent sheet-wide sheen, light or pointer listener
  remains. Its central sheen is at Basic’s level (Glass Dark white 4.5 percent, Glass Light accent 4.5
  percent); edge glow is unchanged. Plain panels, bars and dialog ground do not light merely because the
  pointer crosses them. Retro and NieR retain their non-soft-light forms and existing Reduced Motion,
  software and gesture holds.
gui_related: true
gui_classification_reason: "Fixes one owner for the shared product hover grammar."
split_recommended: false
depends_on: [F3-465, F3-446, DL-171]
unblocks: []
acceptance_criteria:
  - "Exactly one shared product hover engine and one hover token set exist; no surface keeps a second engine, its own pointer-move listener or its own hover animation loop."
  - "Every hover target is a card, row, tile, icon or small control enrolled with its kind through F3-465; explicit target opt-out and containing-region exemptions prevent the effect."
  - "No surface owner restates the hover lift, glow, pointer light or magnet; a different strength is a kind token, not a forked layer."
  - "Tab/header controls use F3-465's small-control marker; editor/terminal text never gets a card magnet, and resize bars consume F3-657."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q20: Glass has only the F3-465 shared hover light on registered edge-glow objects, including Usage/Home widgets, cards, tiles and rows. No independent sheet-wide sheen, light or pointer listener remains. Its central sheen is at Basic’s level (Glass Dark white 4.5 percent, Glass Light accent 4.5 percent); edge glow is unchanged. Plain panels, bars and dialog ground do not light merely because the pointer crosses them. Retro and NieR retain their non-soft-light forms and existing Reduced Motion, software and gesture holds."
validation_surfaces:
  - scripts/pm-shard-plans.py
  - scripts/pm-plan-index.py
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: pm7_hover_grammar
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-171
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-hover-20261009/ENGINE.md, SHA-256 bd3480ac65c053210ebc6d9193480acc3c04c6592276607332817615fd76de5e
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
- "DL-260 source lineage only (no product API or implementation obligation): PMH, 18-hover.js, 22-hover.css, class lists, data-pmh, data-pmh=off and data-pm-hover-exempt were concept hover enrollment implementations; lg-shine/light and data-lg-lit were the retired sheet-wide light spellings."
preserved_exact_tokens:
  - "F3-465"
  - "card, row, tile and icon"
negative_constraints:
- Do not restate the hover effect in a surface owner or give a surface its own hover lift, glow, pointer sheen, magnet
  or animation loop.
- Do not apply card magnet effects to editor/terminal text or resize bars; controls and dividers use their shared
  owner grammar.
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-446, ContractName:Plans/Decision_Log.md#DL-171, ContractName:Plans/FinalGUISpec.md#F3-505, ContractName:Plans/FinalGUISpec.md#F3-466
