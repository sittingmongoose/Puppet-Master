# Shard 106: F3-658 — Shared glyph vocabulary and presentation (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L47451-L47515

Source SHA256: `ad093afce0ca7418862e8c4d9bfd4fbb8d1081f379037deb47635caf0ea41254`

---

## F3-658 — Shared glyph vocabulary and presentation (2026-10-14)

```yaml
plan_unit_id: F3-658
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat's neon/tube glyph language is the default shared set for the rail, Settings, Usage, chat, panel and
  terminal tabs, notifications and onboarding controls (D44, GLY-0 through GLY-3). Plans/glyph_catalog.json owns
  the status keys, meanings, tones and mappings; object/control/panel glyphs use the same shared catalog grammar
  and no surface draws a competing icon for the same meaning. Planning Wizard and Orchestrator may consume the
  catalog but this approval does not require their full glyph adoption or redesign. Warning is the triangle;
  failed is a ring with a cross everywhere. The rail's solid badges become these shared tube marks. Changed is
  violet in every look. Status glyph inks preserve each look's hue, moving lightness to meet at least 3:1
  against their actual composited field in all ten looks; labels remain text governed by F3-654. Shape plus the
  accessible state name carries meaning without color. Working, reviewing, needs-you, dependency-wait, idle,
  complete, blocked, failed, paused, recovering, queued, skipped and mixed keep the shared semantics; warning,
  offline, off, info and five file-change marks complete the vocabulary. Off is the power symbol for
  disabled/not configured, never the blocked mark; file-change marks describe changes, not execution state.
  Domains keep their status words and resolution authority and map them to the shared presentation. A busy tab
  uses working; competing tab marks rank waiting, failed, agent driving, agent at the keyboard, working, info,
  preserving the other states in the accessible description. The terminal agent cursor is a spark and cursor
  cell, solid while the agent types and hollow when a person takes over; terminal command marks use shared
  status marks. Glyph hover ignition follows F3-465's existing card/row/control target, with stepped NieR and
  Retro phosphor power-on, never another hover engine. Reduced Motion keeps a still, lit, recognizable end
  state. GLY-4's alternate onboarding scene pictures remain unanswered; approving controls does not approve
  those art replacements.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All consumers use the same shape for the same state; warning and failed are distinct in grayscale.
- Every status mark meets 3:1 in all ten looks; its label meets F3-654.
- Tab priority, agent cursor, hover and Reduced Motion preserve state names and domain authority.
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
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-585
- Plans/FinalGUISpec.md#F3-619
- Plans/FinalGUISpec.md#F3-465
- Plans/FinalGUISpec.md#F3-654
preserved_exact_tokens:
- GLY-4
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-654
