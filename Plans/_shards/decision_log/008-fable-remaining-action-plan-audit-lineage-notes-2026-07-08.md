# Shard 008: FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

Source: `Plans/Decision_Log.md`

Source lines: L14489-L16051

Source SHA256: `cb61bff04149f02312f3c8eb9ac7e2bbfab04977f1e69256d8ce59466acdceb1`

---

## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 341` (explicitly_deferred; source line 1152; `sfk-f6f04565ca3fcaa8bf3a4f6d`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] whole doc: steer asks about "decision record schema/GUI" no such schema or GUI exists anywhere in the file; every DL unit is a prose decision statement with governance metadata only.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

### DL-189 - Terminal Customize From The Panel And Settings

```yaml
plan_unit_id: DL-189
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Historical decision as recorded on 2026-10-14; its publication/contract holds and superseded
  presentation are resolved by DL-206/DL-207 on 2026-10-16. The earlier decision text follows for
  lineage: Jared approved both terminal Customize entry points on 2026-10-13. The screen keeps live
  field editing, quick sets, sample trials and truthful hints; All terminals writes the same Project
  rows as Settings and This terminal stays an override. F3-650 owns the screen and F3-642/SSYS-051
  its fields and persistence boundaries. On 2026-10-14 Jared set terminal padding to zero and
  required more background choices, a smaller removable/customizable bezel, a default look without
  bezel or curvature, and user-saved look presets. F3-642/F3-643/F3-650 record the approved
  direction and the pending detailed contracts; the earlier small catalog and CRT treatment are not
  final acceptance of those new requirements. Later on 2026-10-14 Jared reaffirmed JetBrains Mono's
  full 100–800 range and directed adding the missing upright 100–300 files. F3-644 owns the
  unchanged range and shared asset delivery; this closes the product question without claiming that
  the files have landed. His later round-three bezel review requires another revision or a removal
  recommendation; F3-643 records that direction and keeps the final effect/control contract held.
  Round two is not accepted as the final bezel.
gui_related: true
gui_classification_reason: Terminal Customize from the panel and Settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: terminal_customize_from_the_panel_and_settings
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LANDING.md, SHA-256 066a115952b170ef50b5ca77bcc4b771428d2195ccc548e7955a656fed588d7e (landing source recheck; approved direction, not native implementation evidence)"
- "/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md, SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296 and 306; not implementation evidence)"
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256 1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-650
- Plans/Settings_System.md#SSYS-051
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): Read the current owners through DL-206/DL-207; earlier pending/held
  wording is historical, not an active hold.'
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/Settings_System.md#SSYS-051

### DL-190 - Full Editor Customize And One Preview Rule

```yaml
plan_unit_id: DL-190
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared requested an editor Customize screen like the terminal/NieR screens on 2026-10-13 and answered its seven
  cards on 2026-10-14: keep the design, default This editor with All available like the terminal, keep docking
  under one visibility rule for both screens, build token colors, keep indentation, move the tab rows to Saving
  & tabs, and keep the caret/motion behavior. His Show spaces correction requires selectors never to wrap.
  F3-650/F3-651 and SSYS-052 own the resulting requirements.
gui_related: true
gui_classification_reason: Full editor Customize and one preview rule.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: full_editor_customize_and_one_preview_rule
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-650
- Plans/FinalGUISpec.md#F3-651
- Plans/Settings_System.md#SSYS-052
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/FinalGUISpec.md#F3-651, ContractName:Plans/Settings_System.md#SSYS-052

### DL-191 - Liquid Glass Reads As Lenses And Reflections

```yaml
plan_unit_id: DL-191
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Historical decision as recorded on 2026-10-14; its publication/contract holds and superseded
  presentation are resolved by DL-203/DL-205 on 2026-10-16. The earlier decision text follows for
  lineage: Jared approved the v2/v3 Glass direction and asked for magnification/reflections rather
  than chromatic corruption, calmer transitions, curved slower switches and coherent controls.
  F3-652 replaces the old Glass material constraints. Publishing Glass together with wallpapers
  remains pending his final review; a source-only landing is not publication. His 2026-10-14 review
  requires the theme-selector lens, placed single highlights on entry, coherent Usage/Settings
  transitions and wallpaper/scroll material, and seamless Settings search fields. Later on
  2026-10-14 he chose a Glass Light hover light beneath the content, with readable text and retained
  edge glow. F3-652 carries that answer; Glass publication remains held, but the under-content
  hover-light choice is no longer open. Jared's Usage room-switching correction applies in every
  look, not only Glass; F3-628 owns the shared responsive takeover and no-trailing-shadow
  requirement. His later Usage #3 direction retires shared-element flights in every look in favour
  of a different expressive room-change animation. F3-628 owns this supersession of DL-178's
  flights; replacement details remain pending with the motion owner.
gui_related: true
gui_classification_reason: Liquid Glass reads as lenses and reflections.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: liquid_glass_reads_as_lenses_and_reflections
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md, SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296 and 306; not implementation evidence)"
- /mnt/Cursor/share/puppet-master/2026-10-13-glass-v3/README.md, SHA-256 0e424cba2f2d03932159b6e25977959f23d8f65cbcca57ca1d067b505f61db54
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-11-liquid-glass-v2/README.md, SHA-256 ed0f7ebed280627aba47197a0c8a9273bb4b17373f79cd3fcb6c0b44344f6fb9
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-652
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): Read the current owners through DL-203/DL-205; earlier pending/held
  wording is historical, not an active hold.'
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-652

### DL-192 - Wallpapers Are Selectable From Every Look

```yaml
plan_unit_id: DL-192
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Historical decision as recorded on 2026-10-14; its publication/contract holds and superseded
  presentation are resolved by DL-203 on 2026-10-16. The earlier decision text follows for lineage:
  Jared initially approved W1 and retained W2–W4: five wallpapers for each other look, all
  selectable from any look, one choice across looks, each look keeping its own ground by default and
  NieR returning to its scenes through Look's own. Ribbons remains Glass's default. W5 retires the
  old Glass background row at the coordinated Glass/wallpaper publication, held after the 19:25
  correction. F3-653, SSYS-054 and DR-073 own the result. On 2026-10-14 his review item 11 withdrew
  Archive, Signal, Fragments, Hatch and Flora and replaced that direction with the NieR customizer’s
  own ink scenes available in the shared gallery. His same-day item 18 says the most recent change
  wins from either control. The approved owner contract names city, bunker, desert, forest, park and
  flooded; a gallery pick sets the shared wallpaper id and a NieR background change sets the shared
  choice to look through its one owner. F3-653/SSYS-054 own those details; final assets/publication
  remain held. The five withdrawn prints are no longer an accepted selectable set.
gui_related: true
gui_classification_reason: Wallpapers are selectable from every look.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: wallpapers_are_selectable_from_every_look
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-653
- Plans/Settings_System.md#SSYS-054
- Plans/DRY_Rules.md#DR-073
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/NIER-WALLPAPER-DECISION-20261014.md, SHA-256
  56a7389f1fa9e6f6e0535f09525945f590b6ef44dfd8f72d1f3c844a7e21b816 (decision/source lineage; not native implementation
  evidence)
- "/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/NIER-WALLPAPER-CONTRACT-201d602f7d.md, SHA-256 6550b3e5d31dbeca5e9d5cf11f7c06db13f37e189da270ac25e6504a5ec4a3da (decision/source lineage; publication remains held where specified)"
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): Read the current owners through DL-203; earlier pending/held wording
  is historical, not an active hold.'
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/DRY_Rules.md#DR-073

### DL-193 - Notification Defaults And Usage Under The Bell

```yaml
plan_unit_id: DL-193
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Historical decision as recorded on 2026-10-14; its publication/contract holds and superseded
  presentation are resolved by DL-204 on 2026-10-16. The earlier decision text follows for lineage:
  Jared approved the built defaults for notification questions 1–6 and explicitly answered question
  7: Usage notices appear under the bell like every other page. F3-447 owns timing/staging, F3-453
  the shared inbox and F3-460 material. The unbuilt automatic eight-second terminal-notice dismissal
  was not adopted by approval of built defaults.
gui_related: true
gui_classification_reason: Notification defaults and Usage under the bell.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: notification_defaults_and_usage_under_the_bell
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-447
- Plans/FinalGUISpec.md#F3-453
- Plans/FinalGUISpec.md#F3-460
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): Read the current owners through DL-204; earlier pending/held wording
  is historical, not an active hold.'
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-447, ContractName:Plans/FinalGUISpec.md#F3-453, ContractName:Plans/FinalGUISpec.md#F3-460

### DL-194 - Wizard And Orchestrator Minor Theme Matching

```yaml
plan_unit_id: DL-194
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared allowed minor/theme-matching fixes while full redesign waits, then answered all three cards: keep
  Friendly white/plum plates, keep stacked answer options, and make the title-bar Light/Dark/Auto chosen fill
  match the shared grey. F3-655 owns presentation and the existing planning/execution owners retain behavior.
gui_related: true
gui_classification_reason: Wizard and Orchestrator minor theme matching.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: wizard_and_orchestrator_minor_theme_matching
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wizard-orch-theme/NOTES.md, SHA-256 ca7f206e6b92440d26972e4eb4113348722fb45245ba8429dad46633b56b49b8
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-655
- Plans/Planning_Wizard.md#PWIZ-021
- Plans/Orchestrator_Page.md#OP-033
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-655, ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/Orchestrator_Page.md#OP-033

### DL-195 - Connected Onboarding Art And Glass

```yaml
plan_unit_id: DL-195
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared required polished connected limbs, redesigned art captions and project-name field, shared Glass
  step/choice controls and no temporary theme switch during Create Project. He approved the art and its landing
  with the no-pill-label work. On 2026-10-14 he answered the separate GLY-4 scene-picture question
  with option B: keep the art's own drawings, without adopting the neon interface-icon shapes. F3-656
  owns this presentation and its boundary with the shared interface controls.
gui_related: true
gui_classification_reason: Connected onboarding art and Glass.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: connected_onboarding_art_and_glass
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md, SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296 and 306; not implementation evidence)"
- /mnt/Cursor/share/puppet-master/2026-10-13-onboarding-art-glass/README.md, SHA-256 ce5e5e90df41f180e54b89e4fb3fe0087164039728a902aa481cbcc3adacb088
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-656
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-656

### DL-196 - The Pill Ban Concerns Labels

```yaml
plan_unit_id: DL-196
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared clarified on 2026-10-11 that pill-shaped status labels, suggestion chips and state badges must go, while
  pill action buttons such as Install/Sign in and rounded Glass/Friendly actions are fine. This supersedes
  DL-184's blanket action-button language. DR-069 owns the rule and F3-648 its presentation and detector
  boundary.
gui_related: true
gui_classification_reason: The pill ban concerns labels.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: the_pill_ban_concerns_labels
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-11-onboarding-no-pills/README.md, SHA-256 1ab0aedc5910ab03097439cf9cd48da77eb7cefad458ca705a556727d327fd1a
  (approved campaign source lineage; not native implementation evidence)
- Plans/DRY_Rules.md#DR-069
- Plans/FinalGUISpec.md#F3-648
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-069, ContractName:Plans/FinalGUISpec.md#F3-648

### DL-197 - Settled Contrast Includes Resting Hover And Placeholders

```yaml
plan_unit_id: DL-197
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared’s 2026-10-14 assignment sets 4.5:1 for all settled interface text at any size, including resting
  hover and placeholders; transitions under 0.4 s are recorded rather than failed solely for an
  intermediate reading. His later same-day clarification keeps terminal Minimum Text Contrast
  user-selectable for program output only, default 4.5:1, while interface text retains its floor. Disabled
  controls are exempt from 4.5:1 but must be legible at at least 3:1. Scheme thumbnails count as imagery
  only when hidden from assistive technology and their scheme-name labels meet 4.5:1. F3-654 owns the
  shared rule and F3-642/SSYS-051 the program-output setting; this explicit clarification resolves the
  earlier draft’s mandatory-output-floor interpretation.
gui_related: true
gui_classification_reason: Settled contrast includes resting hover and placeholders.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: settled_contrast_includes_resting_hover_and_placeholders
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-654
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/ASSIGNMENT-CONTRAST.md, SHA-256 ce5acb947b15065d1193ca5eff1f43a9f1bc82ad7e8f3a230f7377fb18504044
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/CONTRAST-CLARIFICATION-20261014.md, SHA-256
  1c5654b46b6ed160a34466c9df083681cc179815b658c0acce593698680b8493 (decision/source lineage; not native implementation
  evidence)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-654

### DL-198 - Hover Polish And The Friendly Breathing Ring

```yaml
plan_unit_id: DL-198
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved the Basic/Friendly/Retro/NieR hover/press polish on 2026-10-13 and kept Friendly's
  breathing ring. F3-465 and DR-072 own the shared marker and its reduced-motion form, preserving the
  earlier stationary-pointer/filtering repairs and leaving Glass optical hover with its own material
  owner. His 2026-10-14 review reduces only the central pointer spotlight, retaining the surface-edge
  glow; F3-465 owns that pending tuning.
gui_related: true
gui_classification_reason: Hover polish and the Friendly breathing ring.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: hover_polish_and_the_friendly_breathing_ring
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-465
- Plans/DRY_Rules.md#DR-072
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/DRY_Rules.md#DR-072

### DL-199 - Clear Panel Drop Zones And Polished Resize Feedback

```yaml
plan_unit_id: DL-199
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved panel drag-and-drop and requested further resize-glow polish. F3-630 owns the diagonal
  split/explicit Join model, complete-layout fit and readable target names; F3-657 owns the polished feedback on
  all bars. A target name must never be hidden by the carried tab at rest. The caption follow-up and source
  verification do not change the panel command transaction.
gui_related: true
gui_classification_reason: Clear panel drop zones and polished resize feedback.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: clear_panel_drop_zones_and_polished_resize_feedback
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/DND-NOTES-20261014-FOLLOWUP.md, SHA-256 b5b883caeef6d774fbca250e5c7b6c82dd31eee05af8da207727179baa21b5c3
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-630
- Plans/FinalGUISpec.md#F3-657
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-657

### DL-200 - Settings Stays Put On Updates And Enters Chapters At The Top

```yaml
plan_unit_id: DL-200
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  The approved M4 design, confirmed by the 2026-10-14 assignment, keeps the reader's anchor on in-place
  updates, restores exact Settings place on return and opens deliberately chosen chapters at the top.
  Settings occupies its final width from frame one. SSYS-053 owns the behavior; the old jumping baseline
  and performance-only workarounds are not accepted alternatives. Jared expressly kept the M4 top reserve
  on 2026-10-14: the temporary blank space above the chapter title is intended behavior. SSYS-053 owns its
  shrink/grow/scroll-away lifetime. His assignment also expressly requires a chapter to open at its top;
  the frozen assignment is its direct source. The earlier 2026-10-13 Settings correction also retired
  general.visual.theme-preview and its visible timed preview; SSYS-010 owns that retirement separately
  from the internal transaction preview/apply protocol.
gui_related: true
gui_classification_reason: Settings stays put on updates and enters chapters at the top.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The cited owner units reflect this decision and retain its source and later supersessions.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: settings_stays_put_on_updates_and_enters_chapters_at_the_top
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-perf-fixes/M4-DESIGN-DECISION.md, SHA-256 df7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Settings_System.md#SSYS-053
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/M4-TOP-RESERVE-DECISION.md, SHA-256 851b64ffa9c2664540864c28b46b351f7ac75d6d6cea75e9290d21d84a5a77b7
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/ASSIGNMENT-SETTINGS.md, SHA-256 fe8b2ad2d1014520753b65e6ef6e717d140ad7577a0238099714cd3b887e134a
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/SETTINGS-PREVIEW-RETIREMENT.md, SHA-256 327f4021cf41f627abcc2634af4e7ee2473ba75006dbb05d88dd5d8c4578ecb4
  (decision/source lineage; not native implementation evidence)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-053

### DL-201 - D44 Approves The Shared Glyph Rollout

```yaml
plan_unit_id: DL-201
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  DL-201 records Jared's D44 answer, “i agree,” approving GLY-0 through GLY-3 as recommended: one shared default
  set, warning triangle and failed ring with cross, fitted per-look inks, and shared tube marks replacing the
  rail's solid badges. F3-658 owns the resulting presentation and registry. GLY-4 was a separate
  question; Jared's 2026-10-14 option B answer is recorded in DL-195 and owned by F3-656.
gui_related: true
gui_classification_reason: D44 approves the shared glyph rollout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The current consumers reference F3-658 and historical separate-set assertions are superseded.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: d44_approves_the_shared_glyph_rollout
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md, SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296 and 306; not implementation evidence)"
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-658
preserved_exact_tokens:
- DL-201
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-658

### DL-202 - Shell Spacing, Panel Grip And Rail Controls

```yaml
plan_unit_id: DL-202
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared’s 2026-10-14 review puts the panel grip’s narrow end in the top-right corner, reduces excess
  spacing beside the rail and chat, reaffirms the rail’s visible Chat state and removes its
  Dashboard button. F3-630, F3-637 and F3-042 own those changes. The existing panel/chat commands
  and dashboard content remain; final spacing dimensions are held for the shell/Glass owners. F3-465
  and DL-198 separately own the reduced central pointer spotlight. Superseded 2026-10-16 by
  DL-209/F3-637 for spacing: the later landed shell/Glass dimensions close this final-dimensions
  hold.
gui_related: true
gui_classification_reason: Records approved panel-grip, shell-spacing and rail-control presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The current consumers reference F3-658 and historical separate-set assertions are superseded.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: shell_presentation
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/FinalGUISpec.md#F3-630
- Plans/FinalGUISpec.md#F3-637
- Plans/FinalGUISpec.md#F3-042
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): F3-637 now owns the landed shell/Settings/Orchestrator spacing; earlier
  final-dimensions hold is closed.'
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-042

### DL-203 - Liquid Glass And Wallpaper Publication

```yaml
plan_unit_id: DL-203
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'Recorded 2026-10-16. Jared approved Glass after round-three corrections on 2026-10-15,
  and ad37be9a23 published Glass together with the wallpaper gallery. F3-652/F3-653, SSYS-054 and SP-333
  now consume that publication: the six NieR scene prints ship, Mesh/Depth/Minimal retires, and the most
  recent accepted gallery or NieR background change still wins through the one Project transaction. This
  closes the publication holds in DL-191/DL-192 without a native certification claim.'
gui_related: true
gui_classification_reason: Liquid Glass And Wallpaper Publication.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: liquid_glass_and_wallpaper_publication
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--LANDING.md,
  SHA-256 4585c89ab98c4ee6c88f0683ac8d00244725047fe2637fe657371ec42cff17bd (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/Settings_System.md#SSYS-054

### DL-204 - Bell Staging And Setup Continuation

```yaml
plan_unit_id: DL-204
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'Recorded 2026-10-16. Jared''s Glass round-three #19 is owned by F3-447/F3-460: every
  page stages under the shared bell, crowded lasting cards join it, and optional setup joins after its
  reading interval or interaction elsewhere. F3-453 remains the only lasting store; existing resume and
  alert actions retain their owners. This supersedes DL-193''s indefinite pinned-card presentation.'
gui_related: true
gui_classification_reason: Bell Staging And Setup Continuation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: bell_staging_and_setup_continuation
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-447, ContractName:Plans/FinalGUISpec.md#F3-460

### DL-205 - Shared Switcher And Room Handover

```yaml
plan_unit_id: DL-205
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'Recorded 2026-10-16. The landed #20–24 corrections use F3-652''s one token-driven switcher,
  placed on the first visible frame and restored on reveal, including both Glass Customize screens. F3-628
  owns the new family room handover and rapid reversal/return semantics; no shared-element flights return.
  Non-Glass adoption from the consistency pass is pending a separate top-up. Amended 2026-10-16: DL-214
  records that adoption.'
gui_related: true
gui_classification_reason: Shared Switcher And Room Handover.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: shared_switcher_and_room_handover
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--liquid-glass--opus-5.5--CONTRACT.md,
  SHA-256 84a12b3c917ab557ae0478b2158be1146294900b1a10b5bacdc684cdcf11f74e (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-16 (DL-214): non-Glass switcher adoption is no longer pending.'
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/FinalGUISpec.md#F3-628

### DL-206 - Terminal Backgrounds And Monitor Housing

```yaml
plan_unit_id: DL-206
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Historical decision as recorded on 2026-10-16; its round-5 holds on reflection, stops and the mask are
  resolved by DL-213 the same day. The earlier decision text follows for lineage.
  Recorded 2026-10-16. The approved terminal round-3 landing 9cee10982c closes the catalog/bezel/curvature
  holds in DL-189. F3-642 owns the 64 cross-look designs, Lens and Plain choice behavior; F3-643 owns the
  independently optional monitor housing, width and revised opt-in CRT defaults. Numeric 0–1 reflection
  values remain readable compatibility input; final offered reflection range, steps and material levels are
  held for round 5. Mask display-density/capability behavior is also held: the source's DPR-2-only drawing
  and DPR-1 no-op are source lineage and an unresolved acceptance defect, not an admitted capability rule.
  Settings and machine companions consume those owners. Later round-4/5 discrete controls and mask changes
  remain pending; the prior contrast ruling DL-197 is unchanged.
gui_related: true
gui_classification_reason: Terminal Backgrounds And Monitor Housing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: terminal_backgrounds_and_monitor_housing
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-16 (DL-213): read F3-642/F3-643 and SSYS-051 through DL-213; the round-4/5 holds above
  are closed.'
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/Settings_System.md#SSYS-051

### DL-207 - Personal Terminal Presets

```yaml
plan_unit_id: DL-207
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-16. Saved terminal looks are a computer-local reusable library, not Project-bound
  and not another app-wide appearance layer. F3-650 owns the controls and capture/apply behavior,
  SP-331 owns custody and the 40-entry limit, and UCC-204/CS-102 reuse existing scope apply writers
  with typed local Save/Rename/Delete/Undo library actions. This closes DL-189's preset-contract
  hold. Coordinator confirmation 1016001056-4c95 on 2026-10-16 resolves the custody boundary by the
  existing widget-preset precedent; q-035 remains open for app-wide appearance defaults.
gui_related: true
gui_classification_reason: Personal Terminal Presets.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: personal_terminal_presets
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--home-redesign--src--terminal--js--42-appearance.js,
  SHA-256 60379cc762cb98e4fbc4d6fb0a44751cbc7447da3c1e9ff4a04589c8186fefc9 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/COORDINATOR-PRESET-CUSTODY-1016001056-4c95.md,
  SHA-256 ad3b14eebf173550efe88a594b4a869588e3175e7e1277120e86405753bc7f3f (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/storage-plan.md#SP-331, ContractName:Plans/UI_Command_Catalog.md#UCC-204

### DL-208 - Editor Delivery And Shared Glyph Rollout

```yaml
plan_unit_id: DL-208
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: Recorded 2026-10-16. Editor landing 1baf19c6d7 integrates all 31 already-canonical rows,
  and F3-651 records the additional live-preview behavior. F3-644 records delivery of the full-axis Latin
  upright while preserving the 100–800 range. Glyph landing 1f74bf9ac8 keeps F3-658's approved vocabulary
  and GLY-4 boundary; Home panel/tab/terminal and Settings content icons are still deferred adoption,
  not completed rollout.
gui_related: true
gui_classification_reason: Editor Delivery And Shared Glyph Rollout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: editor_delivery_and_shared_glyph_rollout
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-editor-customizer--LANDING.md,
  SHA-256 4d2abf07b2ca9d3eae6e1d9b18143c23263dd8e4deef0ab5f940a18382d8f71b (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-glyph-rollout-landing--LANDING.md,
  SHA-256 9bd8e1ed3deb6d61e516a42f0f524a36639ee098f7ce7496cb50434c9ca4ce90 (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-651, ContractName:Plans/FinalGUISpec.md#F3-644, ContractName:Plans/FinalGUISpec.md#F3-658, ContractName:Plans/Settings_System.md#SSYS-052

### DL-209 - Continuity And Settled Presentation

```yaml
plan_unit_id: DL-209
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-16. The Wizard continuity, combined DnD, M4 settle-read, shell polish, Projects
  no-pill and contrast landings consume F3-655, F3-630, SSYS-053, F3-042/F3-465 and F3-648/F3-654.
  Only uncovered behavior is amended there. Jared's existing contrast and label-only pill rulings
  stand; action buttons remain allowed. Drop and sound-cache implementation improvements introduce
  no new settings, commands or universal microbenchmark guarantees. The Glass landing also closes
  DL-202's spacing hold through F3-637, with the Orchestrator consuming that shell owner in F3-655.
gui_related: true
gui_classification_reason: Continuity And Settled Presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: continuity_and_settled_presentation
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-mech-fixes--wizard-stage-blank--LANDING.md,
  SHA-256 c95281d78ea2d46661242f40b0d1f0b3a6250f1e0fa409b472edeccd927cf679 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-13-panel-dnd-resize--NOTES.md,
  SHA-256 6ffc7b0308acc0b371f997fd643f5711169f4d7d9f431ea090f3243668752734 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-contrast-round--NOTES.md,
  SHA-256 0b6b3c5aa2833176f83f1601a83fb3d1b3e7b8e3511cbd76bed9e8cb8fd85354 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-q21b-sounds--NOTES.md, SHA-256
  22b863ac31a61b0fff025139d583ef497cf77506e6b216eef4d503c04fc60c40 (source lineage; not native certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-655, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/Settings_System.md#SSYS-053, ContractName:Plans/FinalGUISpec.md#F3-654

### DL-210 - Account Warning Hold Consumers

```yaml
plan_unit_id: DL-210
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: Recorded 2026-10-16. MA-073 already owns the 2026-10-15 all-writer switch/warn hold and
  refused default restoration. SSYS-044 and UF-107 consume that exact rule for hosted controls, named
  refusals, batch writes and inherited values. No second threshold algorithm, value store, setting or
  command is added by this pass.
gui_related: true
gui_classification_reason: Account Warning Hold Consumers.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: account_warning_hold_consumers
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-usage-warn-hold--LANDING.md,
  SHA-256 5357dc0dd60b0e08548f4dab5d5359662ee0ea0f159f7201a25577067372c238 (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Multi-Account.md#MA-073, ContractName:Plans/Settings_System.md#SSYS-044, ContractName:Plans/usage-feature.md#UF-107

### DL-211 - Picker Back Navigation

```yaml
plan_unit_id: DL-211
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: Recorded 2026-10-16. Jared's 2026-10-15 add-tab feedback is implemented by a42713eff4.
  F3-632 owns same-plate levels, visible Back, keyboard equivalents, prior query/scroll/focus restoration
  and launcher/standalone roots. UCC-200/CS-100 classify Back as local navigation; a final item pick alone
  invokes its existing opening command.
gui_related: true
gui_classification_reason: Picker Back Navigation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: picker_back_navigation
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-consistency-pass--JARED-FEEDBACK-20261015.md,
  SHA-256 afd66d07739267c5a7d7d6f711af6bd7a709062ef5afd8f3834d2ea819a4dda5 (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-632, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Commands_System.md#CS-100

### DL-212 - Pass Two Scope And Deferred Successors

```yaml
plan_unit_id: DL-212
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: Recorded 2026-10-16. This 2026-10-16 canon pass is bounded by landed input a42713eff4
  after 386c792b2c. The consistency pass, panel-drop performance Q13, terminal round 5 and Friendly lavender
  are pending a small top-up. The consistency feedback approving a Retro chip in place of the notch and
  requesting Home tab size, seamless search and seating corrections is retained as pending direction,
  not a claim that Q16 landed. Demo Studio stays concept-only; quick-wins/build tooling and sound-cache
  mechanics add no product surface. Existing native verification and governance staleness remain obligations
  of their owners; no seal, WorkNode or build task is created.
gui_related: true
gui_classification_reason: Pass Two Scope And Deferred Successors.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pass_two_scope_and_deferred_successors
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-consistency-pass--JARED-FEEDBACK-20261015.md,
  SHA-256 afd66d07739267c5a7d7d6f711af6bd7a709062ef5afd8f3834d2ea819a4dda5 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-terminal-round4--CANON-PROPOSALS.md,
  SHA-256 6be6e2e0743fe3af41ba338d508573eab7d0c60e42ee7517cd18bb77ee35ade7 (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-16 (Plans top-up): terminal round 5 is recorded by DL-213, the consistency pass and
  Friendly lavender by DL-214, and the motion decisions by DL-215; panel-drop performance Q13 and the
  motion fix lanes remain pending until they land.'
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-631, ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/DRY_Rules.md#DR-070

### DL-213 - Terminal Rounds Four And Five, Flicker On Or Off, Bell Follow Look Or Off

```yaml
plan_unit_id: DL-213
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-16. Terminal rounds 4 and 5 (round-5 head f1042f7d3e, which carries round 4, approved to
  land after the Q15 delta re-audit) close the holds DL-206 left open. Jared decided P10 and P14 on 2026-10-16:
  Flicker is on or off at one faint level, and the Flicker Amount row retires (a stored amount reads once as
  Flicker on where no Flicker is stored beside it, then is forgotten); Bell is Follow look or Off, and a stored
  Visual reads and is stored again as Follow look. F3-643 owns the bezel's four Reflection levels from each
  material's own, the twelve Width stops, NieR's chosen materials and the mask drawn at every density;
  F3-642 owns the picture veil, picture-only Blur, the half desaturation default and the designs that now
  draw apart; F3-644 owns JetBrains Mono's drawn Semibold and Bold; F3-650 owns the offered stops; SSYS-051
  owns the rows, the read-once rules and the ten round-3 rows' visibility, which are now live in the
  published concept with no publication guard. Distinctness, contrast and film figures are concept evidence,
  not native certification. The DL-197 contrast ruling is unchanged.
gui_related: true
gui_classification_reason: Terminal Rounds Four And Five, Flicker On Or Off, Bell Follow Look Or Off.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-canon-check.py
risk_class: owner_drift
reasoning_tier: high
context_scope: terminal_rounds_four_and_five
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--CANON-PROPOSALS.md,
  SHA-256 9d55ddc569405b468fcad2c51aed61540563eea3d89d9402a891e071a0547d93 (P10 and P14 decided; source lineage;
  not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--NOTES.md,
  SHA-256 77c878854cf0c02b0612ce422a5f68797b3646f6d2aee2b316059d35be342541 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--LANDING-HANDOFF.md,
  SHA-256 722e8c035f500fca7929a589197b0ad6fa5f8dbb68347e383b57b20e10b25df6 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round4--CANON-PROPOSALS.md,
  SHA-256 6be6e2e0743fe3af41ba338d508573eab7d0c60e42ee7517cd18bb77ee35ade7 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round4--NOTES.md,
  SHA-256 2c1ec6ce72a08a6b4bbbe3b8256d713571379fef7e3a39a5fb927e992e685fcf (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-13-pm7-coordinator-handoff--COORDINATOR-LOG-20261016.md,
  SHA-256 d52085df3ab4a82f323d1fd2ed0a846b8e858fcaf7ec746a2ff79cc9cf2a97ba (Jared's P10/P14 ruling, ~02:05 ET;
  the Q15 delta LAND verdict, ~12:10 ET; decision lineage)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/FinalGUISpec.md#F3-644, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/Settings_System.md#SSYS-051

### DL-214 - One Switcher Per Look, Seated Home Tabs And Friendly Lavender

```yaml
plan_unit_id: DL-214
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-16. The consistency pass Q16 (landed on main as aec2916c94, Glass owner approved, review
  fixes made) adopts F3-652's one switcher in every look, each in its own material: Basic's tinted
  chip, Friendly's mint plate, Retro's reverse-video block and NieR's ink bar, Glass's lens unchanged.
  Jared decided on 2026-10-16 that Retro and NieR chips keep F3-438's stepped motion, not the concept's
  glide; Q16 changed its tokens to match. F3-463, F3-464 and
  F3-621 read their selection marks through F3-652. Jared's 2026-10-15 panel items: a Home board opens pinned from every path (F3-638); the
  add-a-tab picker's search is the look's own search field, seamless in Glass (F3-647); the active Home
  tab is the look's chip standing on the panel's rule (F3-631), and Retro's chip replaces the notch, his
  'new draft design'. Every control draws only its own look's palette (F3-647). Jared approved Friendly's
  lavender for the Usage key light, Live dot and Home Live mark (F3-628, F3-638; landed c0305227f7).
  Picker Back stays DL-211's. Concept measurements are not native certification.
gui_related: true
gui_classification_reason: One Switcher Per Look, Seated Home Tabs And Friendly Lavender.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: one_switcher_per_look_seated_home_tabs_and_friendly_lavender
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-consistency-pass--PLAN.md,
  SHA-256 5e69a60a2d05dff1a5f0e9bbb1f72ab53c4ecc0836880df0a02a66eeccf8c569 (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-consistency-pass--NOTES.md,
  SHA-256 3065192be40e317876ab989ca939d0d016faeec1f8592628a3a2d1edfb5de5ae (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-consistency-pass--LANDING-HANDOFF.md,
  SHA-256 017ef32f6e5b29cd9242fed6b0496ccd118bfae5594ddd5b1059d300cc215907 (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-consistency-pass--JARED-FEEDBACK-20261015.md,
  SHA-256 afd66d07739267c5a7d7d6f711af6bd7a709062ef5afd8f3834d2ea819a4dda5 (Jared's panel items and Retro chip ruling; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/c0305227f7-friendly-lavender.diff,
  SHA-256 fb6f7127bfa67d809d9fdfef3b44da8603511e24c4782b1f24627376566a3b77 (landed c0305227f7; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-13-pm7-coordinator-handoff--COORDINATOR-LOG-20261016.md,
  SHA-256 d52085df3ab4a82f323d1fd2ed0a846b8e858fcaf7ec746a2ff79cc9cf2a97ba (Jared's rulings of 2026-10-15 (~19:20, ~19:30 ET) and 2026-10-16 (~09:05 ET); decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016075014-d904.txt, SHA-256
  c47ba9668ab4537387f255ce3c05384c84c114d4f27eb04a1572a1adf337dcf6 (coordinator mail relaying Jared's
  2026-10-16 ruling that Retro and NieR chips step or cut; decision lineage)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/FinalGUISpec.md#F3-631, ContractName:Plans/FinalGUISpec.md#F3-647, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/FinalGUISpec.md#F3-628

### DL-215 - Motion Acceptance Bar And Jared's Motion Calls

```yaml
plan_unit_id: DL-215
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-16. Jared's bar for every motion, from the final motion QA judgement (acknowledgement,
  fully drawn or a covering transition, no held frame, and M3 Event Timing), is stated once in ACD-475, the
  owner of every surface's motion; it is an acceptance bar for motion, distinct from DL-209's
  refusal to turn concept microbenchmarks into guarantees. His calls on the judgement's design-intent
  items: NieR's page wipe keeps an empty beat of at most 50 ms (F3-464); a NieR or Retro Usage cancel
  reverses the wipe, and with the judgement's A12 must-fix no Usage cancel snaps back or shows the
  cancelled room (F3-628); Reset all really restores defaults, with exactly one outcome toast
  (SSYS-009); NieR's rail wipe stays (F3-621); and the NieR reboot cover's exit is smoothed (F3-598). The
  Retro chip over the notch is DL-214's. The motion fix lanes' own contract changes are recorded as they
  land.
gui_related: true
gui_classification_reason: Motion Acceptance Bar And Jared's Motion Calls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: motion_acceptance_bar_and_motion_calls
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-pass--JUDGEMENT.md,
  SHA-256 8a3291ea2558da05d40c5a051a958f378802ec9c36454b83dbaf5ffc7efe8cf9 (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-13-pm7-coordinator-handoff--COORDINATOR-LOG-20261016.md,
  SHA-256 d52085df3ab4a82f323d1fd2ed0a846b8e858fcaf7ec746a2ff79cc9cf2a97ba (Jared's rulings of 2026-10-15 (~19:20, ~19:30 ET) and 2026-10-16 (~09:05 ET); decision lineage)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/FinalGUISpec.md#F3-464, ContractName:Plans/FinalGUISpec.md#F3-628, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/FinalGUISpec.md#F3-598

### DL-216 - P1000 Raster Reading, Animated Covers, Silent Bell And Frost Crossfade

```yaml
plan_unit_id: DL-216
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-16. Jared's decisions of 2026-10-16 (about 12:10Z) on the P1000 decision packet and the
  motion part-2 owner checks. P1000 bar: option A, recorded in his words in ACD-475; no low-end-GPU tier is
  added, and the P1000 speed-up work continues separately. The theme switch cover is animated in each look's own language
  so it never reads as blank (F3-077). The NieR reboot cover moves while it waits, a scanline or progress
  glyph in NieR's language (F3-598). The terminal bell stays invisible in Basic and NieR, meaning it is left
  as it is: Basic's 2 px warn marker, NieR's motion-only bracket glitch and the Reduced Motion 1 px outline
  stay deliberately near-invisible, and no flash, rim or inverse is added (F3-643); the Bell row's help
  text becomes 'Follow look rings the look's own bell'. A
  wallpaper change crossfades the full frost with the print (F3-653); its implementation lands in a later
  lane. Concept films and measurements are evidence, not native certification.
gui_related: true
gui_classification_reason: P1000 Raster Reading, Animated Covers, Silent Bell And Frost Crossfade.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: p1000_raster_reading_animated_covers_silent_bell_and_frost_crossfade
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-p1000-decision--JARED-DECISIONS.md,
  SHA-256 a1dedd6e70bfa51ec0b07c34a86bfa65583439b18ff4ace266c4fe9e2a0aa3a6 (Jared's decisions of 2026-10-16 ~12:10Z; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-p1000-decision--DRAFT.md,
  SHA-256 9fe06d34054ed8510ac5df4e621b2371fc75e451f7620d09c3f43af6c01c5813 (the P1000 decision packet and its measurements; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-pass--PART2.md,
  SHA-256 3d5a20ca7293c065906642c09ebd322a08129931636b943eafc3570b5bf8898c (P2-01 theme switch, P2-05 NieR cover, P2-S6 bell; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016121015-af12.txt,
  SHA-256 685a0a89c78f08b56ecf940bc87d68852dbf13489c860df76643758bf4bc108c (coordinator mail asking these be recorded; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016125551-0a2f.txt, SHA-256
  a2dab08eb221ea2fc9853907f1eefca60ec99e76ba8047f9a552c17f04c0189e (coordinator rulings on the pre-review,
  including Jared's bell answer; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016125628-2167.txt, SHA-256
  f9e6f05b20c1a4e2fd1f4dc412c20cd8d6fdd0044b5fb700d6a6e04bb16871ab (bell reading (A), help text and stored
  reflection scale; decision lineage)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/FinalGUISpec.md#F3-077, ContractName:Plans/FinalGUISpec.md#F3-598, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/FinalGUISpec.md#F3-653

### DL-217 - Contracts Added By The Motion Fix Lanes

```yaml
plan_unit_id: DL-217
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-16. Contracts the motion fix lanes add, recorded as each lands on main. The terminal
  lane (main 89d1a6c057) makes the wallpaper owner's synchronous, cache-only source query the one way a
  consumer finds the selected print (DR-073); its other changes (the Customize screen kept ready, Flicker
  on the compositor, nothing drawn for a terminal off screen, idle and busy waits) change no product
  contract, nor does its B5 follow-up (main dd511b683e), which applies a look change to a hidden terminal
  as it shows and to a visible one after the frame's layout, inside F3-642's live-apply rule. The Usage
  lane (main d2e038618b) implements F3-628's cancel and reversal rules (DL-215) and adds no contract. The
  shell lane (main b9a08db90f) adds ACD-475's one shared busy signal, look-cover answer and on-time start,
  and F3-077's look-cover sequence. Drafted from branch heads, to be confirmed at their main commits when
  they land together: the Glass lane (90565f62ea) adds F3-652's worker bakes, idle shader warm-up and
  cover-only strip deferral; the Settings lane (0d510df290) adds DR-073's wallpaper preparation, F3-598's
  Reduced Motion calm cover and SSYS-053's acknowledged, coalesced navigation. The editor lane and Q13 are
  added when they land. Concept evidence is not native certification.
gui_related: true
gui_classification_reason: Contracts Added By The Motion Fix Lanes.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners and finite companions agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: contracts_added_by_the_motion_fix_lanes
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--home-redesign--src--terminal--js--44-grounds-glass.js,
  SHA-256 029716017b916a8c93c6817a458ba7d17c56dae295462655c31bb69dfe2c2392 (main 89d1a6c057, the terminal lane, the consumer of the wallpaper source query; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--LANDING-REVIEW.md,
  SHA-256 b1ca802f406fa585b3be8d1096e8aefada4bac0c94ef81a3ee93f3be3611918e (cross-lane contract check; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/1d44afa8ce--Concepts--onboarding--opus-5.5--src--js--11-motion-start.js,
  SHA-256 b042bcd35aab9cd50ba71fcfd8b2330015b12e07cadff7886c2647e4648e84bf (shell lane head 1d44afa8ce, landed unchanged on main b9a08db90f,
  the shared busy signal and on-time start; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/1d44afa8ce--Concepts--onboarding--opus-5.5--src--js--12-theme-transition.js,
  SHA-256 643b432a82dff4d71c037f175a7afca0c336e053d30f8724ce389504ab051787 (shell lane head 1d44afa8ce, landed unchanged on main b9a08db90f,
  the look cover; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/90565f62ea--Concepts--liquid-glass--opus-5.5--CONTRACT.md,
  SHA-256 8c4dcd540ee6fa4129c7a9286e679c8ac70519f9a56804e7f16a9afcced349c9 (Glass lane head 90565f62ea,
  worker bakes and shader warm-up; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/0d510df290--Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 817dc779652ba04c4f23d6201d0b88d855a651f568496880f24731a7a3c535d0 (Settings lane head 0d510df290,
  wallpaper preparation and source cache; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--pm7-motion-settings--NOTES.md,
  SHA-256 969a47e289d72c048f7f44b94488b1953a2edeba0fa28c41b72bdc5d4ca5e094 (Settings lane notes, B1, B3
  and B5; source lineage)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-073, ContractName:Plans/FinalGUISpec.md#F3-628, ContractName:Plans/FinalGUISpec.md#F3-653
