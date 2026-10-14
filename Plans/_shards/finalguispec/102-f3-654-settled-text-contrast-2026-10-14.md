# Shard 102: F3-654 — Settled text contrast (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L47203-L47262

Source SHA256: `ad093afce0ca7418862e8c4d9bfd4fbb8d1081f379037deb47635caf0ea41254`

---

## F3-654 — Settled text contrast (2026-10-14)

```yaml
plan_unit_id: F3-654
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every enabled settled text state reads at least 4.5:1 against the actual composited background. Placeholder
  text, captions, hints, secondary text, token colors, selected states and a pointer resting on a hovered
  control all count; a resting hover is not an animation exemption. Large text is held to the same floor for
  this campaign. Disabled controls are exempt from the numeric floor but remain legible and expose their
  disabled state and reason. A brief transition under 0.4 s is recorded with its duration and frames rather than
  failed solely for an intermediate contrast/overlap reading; an incorrect end state, a longer transition or a
  looping low-contrast resting state still fails. Tests use the worst background beneath the glyph, including
  wallpaper, transparency, hover tint and glow, rather than comparing text to a nominal surface token. Requested
  editor/terminal colors are rendered at the selected floor; an old below-floor minimum-contrast choice cannot
  reduce this shell-wide floor. Color and semantic marks continue to have the applicable non-text contrast and
  redundant shape/name requirements. This is the sole campaign interpretation consumed by acceptance checks, not
  a permission to conceal controls or omit hard-to-measure looks.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Contrast is measured in all ten looks with normal and Reduced Motion at rest, selection and resting hover, including
  placeholders.
- Under-0.4-second intermediate states are recorded separately; disabled controls are separately identified, never
  counted as passing enabled text.
- A translucent or dimmed enabled label is tested against its actual worst background.
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
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-648
- Plans/Automated_Testing_System.md#ATS-077
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/ASSIGNMENT-CONTRAST.md, SHA-256 ce5acb947b15065d1193ca5eff1f43a9f1bc82ad7e8f3a230f7377fb18504044
preserved_exact_tokens:
- 4.5:1
- 0.4 s
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-648, ContractName:Plans/Automated_Testing_System.md#ATS-077
