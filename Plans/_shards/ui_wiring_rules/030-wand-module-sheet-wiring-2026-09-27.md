# Shard 030: Wand module sheet wiring — 2026-09-27

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1831-L1905

Source SHA256: `4c1dd01297a065808ec216a3774a89bb2bd9824fdcb1e56f8f5fb9a0247f1e5a`

---

## Wand module sheet wiring — 2026-09-27

### UIW-025 - Configuration Sheet Wiring Open Is Not Start One Close Path Focus Return

```yaml
plan_unit_id: UIW-025
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Opening a wand-module configuration sheet (FinalGUISpec F3-566) from any producer, including a
  wand row, a mode-menu sidecar, a held natural-language request, a card's change-setup action or
  another sheet, creates only local draft state; it may dispatch at most the owner's side-effect-free
  preview (for a collaboration sheet, cmd.collaboration.configure) and never starts, schedules or
  saves anything. Opening is not starting. Every control in the sheet writes a field of the draft
  that the sheet's one primary sends; only that primary commits. Every sheet has one close path:
  Cancel, the close button, Escape and a click on the scrim run the same handler, which discards the
  draft and leaves no transcript trace; where the owner defines a cancel command (Teach's
  cmd.chat.teach.cancel) that one handler dispatches it, and elsewhere closing is view state. The
  one exception is a Crew Auto sheet opened from a Crew sheet, where Cancel and Escape go back one
  step to the Crew sheet with its draft while the close button and the scrim close both. The other
  exception is a sheet whose changes apply at once (F3-566), for example the ELI5 sheet (F3-581):
  each of its controls dispatches its owner's command when chosen, so it holds no draft and has no
  primary that commits, and Done, the close button, Escape and the scrim all run its one close
  handler, which has nothing to discard. A closing
  sheet stops taking input at once, so a second activation cannot commit twice. Focus after a sheet
  closes: after a committed Start or Schedule Message, the composer's message box; after a Revert,
  the files row under that reply; after a settings-style sheet saves or closes (for example Back
  Seat Driver, Crew Auto or Memory), the wand trigger; after any other sheet, and after Cancel,
  close or Escape anywhere, the control that opened it, or the wand trigger when that control is
  gone. Focus never lands on the page body.
gui_related: true
gui_classification_reason: "Wires how wand sheets open, commit, close and return focus."
split_recommended: false
depends_on: [UCC-156, F3-566]
unblocks: [F3-568]
acceptance_criteria:
  - "Opening a sheet from any producer creates no card, Activity entry, run, schedule or saved setting."
  - "Cancel, close, Escape and the scrim run one handler per sheet."
  - "In a sheet whose changes apply at once, each control dispatches its own owner command when chosen, and Done, close, Escape and the scrim only close it."
  - "A double activation of a primary commits at most once."
  - "Focus after close follows the listed targets and never lands on the page body."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: open_triggers_side_effect
reasoning_tier: high
context_scope: wand_sheet_wiring
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: wiring_rule
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 5.4, 6.7, 8.2 (G-27), 8.15"
  - "CANON-PLAN coordination item UIW-025"
preserved_exact_tokens:
  - "Opening is not starting"
  - "one close path"
  - "cmd.collaboration.configure"
  - "cmd.chat.teach.cancel"
negative_constraints:
  - "Do not start, schedule or save on opening a sheet."
  - "Do not give Cancel, close, Escape and the scrim different effects, except the one named Crew Auto step back."
  - "Do not give a sheet whose changes apply at once a draft or a committing primary."
  - "Do not leave focus on the page body."
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-568, ContractName:Plans/UI_Command_Catalog.md#UCC-156
