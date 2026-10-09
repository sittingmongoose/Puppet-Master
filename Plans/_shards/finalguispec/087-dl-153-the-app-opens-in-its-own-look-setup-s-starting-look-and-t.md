# Shard 087: DL-153 — The App Opens In Its Own Look, Setup's Starting Look, And The Four Families' Hero Moments (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L41371-L41463

Source SHA256: `a0e27d58f5b81e56672b85f9b47dfd865bdab8447ec953ba6b0ac355e873adb7`

---

## DL-153 — The App Opens In Its Own Look, Setup's Starting Look, And The Four Families' Hero Moments (2026-10-09)

This addendum compiles the owner decision DL-153, Jared's request of 2026-10-09 to take the next steps of the NieR
onboarding showpiece (DL-152) and his two rulings of that day. It amends F3-468 (the first paint), F3-520 (the look
onboarding starts in), F3-521 (the restore's own notices), F3-598 and F3-599 (the four families' pictures), and adds
F3-600. Behaviour stays with its owners: `Plans/Planning_Wizard.md` PWIZ-021 to PWIZ-023 (onboarding and tour
orchestration), `Plans/Settings_System.md` section 4.4 and SSYS-043 (the theme pair and NieR Mode). The units own the
presentation only. The concept is source lineage only: its class names, keys, event identifiers, harness hooks and every
measured timing outside these units are not canon.

### F3-600 — The Hero Moments In The Four Theme Families

```yaml
plan_unit_id: F3-600
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Product Onboarding's three hero moments, the wake as the window opens, the act card at a chapter's end and the
  curtain call at Ready, take five styles, one per look family: Basic, Friendly, Glass, Retro and NieR (DL-153).
  Whenever NieR Mode is painted, its onboarding preview included, NieR's moments play as F3-598 sets them out,
  whatever family is chosen beneath it, and no family has a NieR variant. Otherwise the painted family plays its own
  style, the same in its Light and its Dark variant and drawn only in that family's own materials, never a recoloured
  NieR. Basic is one drafting job: as the window opens a parallel rule sweeps down the sheet drawing its construction
  lines before the strings are tensioned; at a chapter's end a title block is drafted over the stage, the rail draws a
  dimension line to the next chapter and a DONE stamp presses onto the block before the sheet is lifted away; at Ready
  the troupe bows on the chord and an APPROVED stamp lands on the Ready sign. Friendly is a paper theatre: the
  footlights come up and the house curtain gathers as the paper troupe folds up from flat; a title card on a stick
  pops up from below the stage while a paper pennant hops along the rail; at Ready the troupe bows and paper roses land
  at its feet. Glass is a light lab: the lab switches on under its beam and light runs down each filament into its
  helper; a frosted plate lights up under a beam while a pulse of light runs along the rail; at Ready a spotlight comes
  on over each helper as it bows. Retro is an arcade: an attract screen types the name and the sprites spawn in
  stepped frames; a stage-clear screen with a bonus tally wipes over the stage while the rail's cursor jumps; at Ready
  the sprites duck their bows, ALL CLEAR types under the sign and a pixel arrow points to the Guided Tour. The wake
  plays on a fresh opening, the act card on the first forward arrival in a chapter of the run and the curtain call on
  the first arrival at Ready; the act card is that chapter's one sting, and the rail keeps its old state until the
  moment's beat moves it. Each family's moments play only that family's existing cues (F3-599). Reduced Motion and low
  resource show each moment's end state at once; a key or a press snaps a running moment to its end state, and input
  never waits; motion is one-shot transform or opacity, scaled by Animation speed; no surface larger than 340x256 px
  reverses its opacity more than once a second, and a large area leaves one way; no filter, blur, blend mode, mask,
  canvas or WebGL is used. Outside these moments every onboarding screen settles exactly as before; Ready settles with
  the troupe in a line and its family's mark (the APPROVED stamp, the roses, the spotlights, ALL CLEAR with its
  arrow). Ready still hands the window over to the Guided Tour's first callout in every family. No settings key,
  theme family, theme variant, NieR part, sound setting, `ui.onboarding.*` action or `ui.guided_tour.*` action is
  added.
gui_related: true
gui_classification_reason: Defines the act card, the wake and the curtain call of onboarding in the four theme families.
split_recommended: false
depends_on: [DL-153, DL-152, F3-520, F3-598, F3-599]
unblocks: []
acceptance_criteria:
  - "With NieR Mode painted, NieR's wake, act card and curtain call play over every family, and no family-styled moment draws, moves or plays."
  - "With NieR Mode off, each of Basic, Friendly, Glass and Retro plays its own wake, act card and curtain call, in its Light and in its Dark variant, drawn only in its own materials."
  - "The act card plays on the first forward arrival in a chapter of the run and is that chapter's one sting; Back and forward again play no card; the curtain call plays on the first arrival at Ready."
  - "Reduced Motion and low resource show each moment's end state at once, and a key or a press snaps a running moment to its end state; an act card never delays the next screen beyond NieR's act card."
  - "Every onboarding screen other than Ready settles pixel-identical to its earlier picture in the eight family variants; Ready settles with the troupe in a line and its family's mark."
  - "No surface larger than 340x256 px reverses its opacity more than once a second; no filter, blur, blend mode, mask, canvas or WebGL is used; motion is one-shot transform or opacity scaled by Animation speed."
  - "The families' moments play only their kits' existing cues, and no settings key, theme variant, NieR part, sound setting or onboarding or tour action is added."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
risk_class: nier_onboarding_tour_drift
reasoning_tier: high
context_scope: nier_onboarding_tour
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-153"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-next-20261009/JARED-REQUEST-20261009.md, SHA-256 5d4f5b2aa55364c55fb022e4624657b5185e5ea5b316b6108b880dde51a98e48"
  - "Concepts/onboarding/opus-5.5/README.md (concept lineage only; branch t3/concept/nier-showpiece-next)"
preserved_exact_tokens:
  - "NieR Mode"
  - "APPROVED"
  - "ALL CLEAR"
negative_constraints:
  - "Do not make a NieR variant per family or play a family's moment while NieR Mode is painted."
  - "Do not recolour NieR's moments as a family's moments."
  - "Do not add a settings key, a theme, a NieR part, a sound setting or an onboarding or tour action."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-153, ContractName:Plans/FinalGUISpec.md#F3-598, ContractName:Plans/FinalGUISpec.md#F3-599, ContractName:Plans/FinalGUISpec.md#F3-520
