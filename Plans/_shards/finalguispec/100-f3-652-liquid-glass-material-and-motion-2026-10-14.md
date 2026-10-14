# Shard 100: F3-652 — Liquid Glass material and motion (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L47054-L47128

Source SHA256: `ad093afce0ca7418862e8c4d9bfd4fbb8d1081f379037deb47635caf0ea41254`

---

## F3-652 — Liquid Glass material and motion (2026-10-14)

```yaml
plan_unit_id: F3-652
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Liquid Glass is the approved replacement direction for the Glass look in Light and Dark, not a new theme
  family. Its publication into the reviewed PMConcept7 is pending Jared's review; this unit specifies product
  behavior and does not claim implementation or native certification. Sheets read as glass over the chosen
  wallpaper: a refracting rounded bevel, a frosted readable core, a top-left specular rim and a quieter exit
  light. Selection lenses enlarge sharp text, carry moving reflections and gently bend their rim; color
  fringing, tearing letters and opaque flashes are defects. One shared lens grammar serves page selection, rail
  and panel tabs, Usage, onboarding steps, Orchestrator views and customizer choice rows. It starts on
  activation without waiting for content work, never doubles or reverses mid-flight, and keeps its resting
  glass. Scrubbing is selection, never text selection. Pointer beads travel only between neighbouring controls.
  Switches use curved ends and a rounded lens knob with slower, settling movement; action buttons may be rounded
  under F3-648. Menus grow from their invoking control; fields such as Find a scope and Find a panel read as one
  seamless field; the theme menu has room for its labels. Usage changes are calm, with no full-board sweep or
  opaque-then-clear flash. Hover light stays near the shared control scale, about 96 px radius, and does not
  veil text. Settings rail/index/sections, onboarding window, tour callout/bar and the Wizard/Orchestrator
  columns use the same sheet hierarchy; nested cards and controls are fills on sheets, not independent
  full-scene effects. Dense Customize and notification surfaces use the more opaque menu material needed for
  F3-654's settled contrast. Moving/leaning sheets carry coherent frost, and wallpaper, refraction and frost
  change together (F3-653). The renderer may precompute static wallpaper optics and use bounded live optics on
  small lenses and menus; F3-427's old one-shell-blur and F3-431's blanket Glass restrictions are superseded for
  this material. It must not create arbitrary nested live blur or redraw idle static sheets every frame. Reduced
  Motion preserves end-state material, selection and focus without spring, sweep, magnification travel or
  condensation; a renderer without live-optics capability uses a truthful static readable equivalent.
  Publication of this look and the wallpaper gallery is one coordinated boundary, including retiring F3-428's
  old background modes.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every named selector has one legible resting and moving lens, with immediate activation feedback and no chromatic
  tearing or duplicate highlight.
- Dense menus, moving sheets and wallpaper swaps preserve settled contrast and coherent material.
- All material and selection remain usable in Light, Dark, Reduced Motion and the static capability fallback.
- The specification does not assert that a source-only Glass landing published the look.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-glass-v3/README.md, SHA-256 0e424cba2f2d03932159b6e25977959f23d8f65cbcca57ca1d067b505f61db54
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-11-liquid-glass-v2/README.md, SHA-256 ed0f7ebed280627aba47197a0c8a9273bb4b17373f79cd3fcb6c0b44344f6fb9
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-427
- Plans/FinalGUISpec.md#F3-431
- Plans/FinalGUISpec.md#F3-653
- Plans/FinalGUISpec.md#F3-654
preserved_exact_tokens:
- Liquid Glass
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-427, ContractName:Plans/FinalGUISpec.md#F3-431, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/FinalGUISpec.md#F3-654
