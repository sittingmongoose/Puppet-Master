# Shard 101: F3-653 — One wallpaper gallery for every look (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L47144-L47215

Source SHA256: `f05fb13f82babed54c090bb87736b01c7cbcf535d6c8a49773e2d7d25b8faf98`

---

## F3-653 — One wallpaper gallery for every look (2026-10-14)

```yaml
plan_unit_id: F3-653
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Wallpaper is one Project choice for every look, not one stored choice per theme. Settings > App & Input >
  Theme & colors places its gallery immediately after Light or dark. Look's own comes first, followed by
  families in the shared catalog's order; thumbnails have names, checked state and full accessible names. It is
  one radiogroup: arrows move among choices, Home and End reach the ends, Space selects; pointer and keyboard
  write the same value. Five columns reduce to two where needed, with the look's control corners and no animated
  tiles. Basic offers Blueprint, Contour, Folds, Sheets and Arcs; Friendly offers Dot Wave, Channels, Bubbles,
  Hills and Soft Stripes, each with its dot pattern; Retro offers Horizon, Peaks, Circuit, Dither and Stars;
  NieR offers Archive, Signal, Fragments, Hatch and Flora. Glass's catalog includes Ribbons, Prism, Orbs,
  Aurora, Dunes, Bloom, Pool and Facets. Every item has a Dark and Light print selected by effective mode and
  every item is selectable in every look. Look's own means Ribbons in Glass and the existing ground in Basic,
  Friendly and Retro; in NieR it restores the selected ink-scene background. An explicit wallpaper replaces that
  scene while chosen, without erasing the NieR background preference. Wallpapers show around opaque panels in
  the other looks; Usage and Settings Home may use the approved light veil. Glass optics derive from the same
  chosen print and swap in the same painted frame. The gallery's final space is present in Settings' first
  frame; thumbnail loading never displaces following rows. Missing/stale stored catalog ids display Look's own
  with a clear fallback, never a broken image. The Project's committed wallpaper applies with its look before
  first paint. Prints and thumbnails are shared packaged assets, not per-surface embedded copies. SSYS-054 owns
  the setting and SP-333 its storage boundary; DR-073 owns catalog reuse. W1 through W4 are approved; W5 retires
  Mesh/Depth/Minimal at the combined Glass/wallpaper publication, which still awaits Jared. Friendly's content
  ground extends its dot pattern through Settings, Usage, rail panels and the chat transcript, moving with
  content rather than as a second fixed overlay.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every catalog wallpaper works in every look and both modes; Look's own restores the correct default and NieR preference.
- Keyboard selection, reload, Project switching and unknown stored ids preserve the one-setting contract.
- A wallpaper swap never paints new wallpaper behind old frost, and gallery loading never shifts a reader's anchor.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-11-liquid-glass-v2/README.md, SHA-256 ed0f7ebed280627aba47197a0c8a9273bb4b17373f79cd3fcb6c0b44344f6fb9
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Settings_System.md#SSYS-054
- Plans/storage-plan.md#SP-333
- Plans/DRY_Rules.md#DR-073
- Plans/FinalGUISpec.md#F3-652
preserved_exact_tokens:
- Look's own
- Ribbons
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md

```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/storage-plan.md#SP-333, ContractName:Plans/DRY_Rules.md#DR-073, ContractName:Plans/FinalGUISpec.md#F3-652
