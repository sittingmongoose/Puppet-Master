# Shard 048: ATS-077 — PM7 campaign acceptance matrix (2026-10-14)

Source: `Plans/Automated_Testing_System.md`

Source lines: L6461-L6524

Source SHA256: `c20a97c98694ef62477401e260329001803afeaf288a65a16919ceacc942f689`

---

## ATS-077 — PM7 campaign acceptance matrix (2026-10-14)

```yaml
plan_unit_id: ATS-077
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  PM7 campaign acceptance consumes the requirements without copying them: F3-650/F3-651 for both Customize
  entries/scopes, preview visibility, token colors, caret, indentation and no-wrap; SSYS-052/SSYS-054 for
  inventory and Project ownership; SSYS-053 for per-frame anchor, chapter top, return, rail focus/scroll and
  first-frame width; F3-652/F3-653 for held Glass and wallpapers; F3-447/F3-453/F3-460 for notification timing,
  read dwell, dismissal and the shared under-bell stage; F3-655/F3-656 for Wizard/Orchestrator and onboarding;
  F3-648/F3-654 for label detectors and settled contrast; F3-465/F3-658 for shared hover and glyphs;
  F3-630/F3-657 for drop captions, global fit and resize glow. Run pointer and keyboard paths in all ten looks
  and app/system Reduced Motion. Record intermediate transition contrast separately when under 0.4 s; measure
  resting hover/placeholder text on the actual worst composited background, and keep disabled-state legibility
  observations separate. Layout tests inspect each painted frame, not just the final screenshot. Every dispatch
  test uses UIW-043's census and asserts request, availability/refusal, receipt, saved readback and exact event
  delta; local tests assert zero dispatch/write. Token maps, unset overlays, unknown scheme/wallpaper ids, stale
  state, replay and serialized-state bounds need negative fixtures. The shared status registry needs
  warning/failed distinction, 3:1 marks and 4.5:1 text. Concept source/harness evidence is lineage only; native
  certification remains owed. Pending Glass publication is recorded as pending, never presented as a passed
  implementation case.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every cited owner has a matrix case or an explicit unimplemented/held result, never an inferred pass.
- Static schema/registry/census checks pass before draft review; native evidence is separately required.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-perf-fixes/M4-DESIGN-DECISION.md, SHA-256 df7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- Plans/Automated_Testing_System.md#ATS-075
- Plans/UI_Wiring_Rules.md#UIW-043
- Plans/FinalGUISpec.md#F3-654
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-075, ContractName:Plans/UI_Wiring_Rules.md#UIW-043, ContractName:Plans/FinalGUISpec.md#F3-654
