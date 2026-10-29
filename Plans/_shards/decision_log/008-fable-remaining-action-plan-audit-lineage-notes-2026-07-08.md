# Shard 008: FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

Source: `Plans/Decision_Log.md`

Source lines: L14505-L18426

Source SHA256: `127fae472b23113aea42e5e94ced1122bcb3c9a2ccbd07c933a17860679ae6d4`

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
stale_retired_dispositions:
- 'Amended 2026-10-17 (DL-228): the central spotlight tuning landed on 2026-10-14 (F3-465): only the pool under the pointer was turned down, to 0.6 of its strength, the edge glow kept. It read: F3-465 owns that pending tuning.'
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
- "F3-630 puts the panel grip's narrow end at the top-right. F3-042 keeps the rail Chat state visible and removes the Dashboard button. F3-637, through DL-209, closes the spacing hold."
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
  motion fix lanes are recorded as landed in DL-217.'
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
stale_retired_dispositions:
- 'Amended 2026-10-17 (DL-222): the motion fix lanes that landed after this entry, F6 included, are
  recorded in DL-217 and DL-222.'
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
stale_retired_dispositions:
- 'Amended 2026-10-17 (DL-219, DL-220): no lower-spec tier is added, and concept performance work stops
  at not horribly slow. The P1000 reading in ACD-475 stands. It read: the P1000 speed-up work continues
  separately.'
- 'Amended 2026-10-17 (DL-223): fade-first is the later landing of the frost crossfade. It read: its
  implementation lands in a later lane.'
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
  Recorded 2026-10-16. Contracts the motion fix lanes add, recorded as each lands on main. Landed: the
  terminal lane (main 89d1a6c057) makes the wallpaper owner's synchronous, cache-only source query the one
  way a consumer finds the selected print (DR-073); its other changes, and its B5 follow-up (main
  dd511b683e), change no product contract. The Usage lane (main d2e038618b) implements F3-628's cancel and
  reversal rules (DL-215). The shell lane (main b9a08db90f) adds ACD-475's one shared busy signal,
  look-cover answer and on-time start, and F3-077's look-cover sequence. Q13 (main a2c537cb61) removes
  redundant forced layout from panel drops and adds no contract: drops are judged by ACD-475's bar, the
  concept's own 50 ms worst-frame target stays open and is not a canon requirement, and the Plan tab's
  first resize keeps a nonzero scroll when nothing was saved. Approved by Jared and landed as train L1
  (main a0f844455c), with Glass 554b3d3a65 (F3-652's worker bakes, idle shader warm-up and cover-only
  strip deferral), Settings d02f2ac26b (DR-073's wallpaper preparation, F3-598's Reduced Motion calm
  cover, SSYS-053's acknowledged, coalesced navigation), the editor d6647a2fc1 (F3-650: the editor screen
  opens over Settings), and shell ff77ba2788, terminal cc36402ab4, panels 89e0639749, T2 76c2f44ca9,
  isplit ba33681a3c and Usage 96a309b9f3, which are performance and build-time work with no new contract
  (the shell's Reduced Motion Enter fade sits inside F3-520's short opacity settle); then train L2 (main
  2b5ed6092d), with the frost crossfade 10ba7d6427 and its seam c17316f6cf (F3-653) and the seg plate
  e7f4a4fa8d (F3-652: Settings' segmented choices show the chip while the choice moves). Win's trace
  attributes the B5 fade delay to Chrome's own autofill form extraction, which no page code causes; the
  coordinator ruled it a concept harness matter: films stay on the default browser and record it, the cost
  is reported separately and never subtracted, and an autofill-off run is allowed only for both arms of an
  A/B (TCME-007); product canon is unchanged (AI-045). Concept evidence is not native certification.
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
  SHA-256 8c4dcd540ee6fa4129c7a9286e679c8ac70519f9a56804e7f16a9afcced349c9 (Glass lane head 90565f62ea, superseded by 554b3d3a65 on main a0f844455c,
  worker bakes and shader warm-up; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/0d510df290--Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 817dc779652ba04c4f23d6201d0b88d855a651f568496880f24731a7a3c535d0 (Settings lane head 0d510df290, superseded by d02f2ac26b on main a0f844455c,
  wallpaper preparation and source cache; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--pm7-motion-settings--NOTES.md,
  SHA-256 969a47e289d72c048f7f44b94488b1953a2edeba0fa28c41b72bdc5d4ca5e094 (Settings lane notes, B1, B3
  and B5; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--LANDING-q13.md,
  SHA-256 9e8c04cb464d074a83bed4db27e3ec3af9ccfbc2bab5c8a93276ff452d04056a (Q13 landing note, main
  a2c537cb61; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-q13-blind-review--REVIEW.md,
  SHA-256 125025f8c54f6d4e44d0444f0bffc7d18ca762e6e4d0b5a91ab31baf3986eb38 (Q13 blind review, LAND with
  qualifications; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016160926-ef62.txt, SHA-256
  b52026d51089c02c9002cdb5cd0afb44941f8303916bd5f8785f20af76f2fee6 (coordinator ruling relaying Win's
  autofill trace; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016161110-3341.txt, SHA-256
  7e7e95064e16d0c15274b2521afc6c62d05ae8da7a6d55fc2401a563b64a78ca (coordinator choice of option A,
  concept harness rule only; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016161708-f80e.txt, SHA-256
  b4a25d5f50b882188b35a9da348972d7471030edff0dd86bc1a2f3303c9880a8 (coordinator correction, films stay on
  the default browser; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016175437-8a2c.txt, SHA-256
  c36ac2ab8fd07c28e447d0b8a5993ba646cdc83785382f725b8ddc1dc9e9059e (Jared's approval of trains L1 and L2
  with their pinned heads; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-pass--LANDING-TRAIN-BRIEF.md,
  SHA-256 7b119ebaaa01af1d49cee9e3dacacfdd24b8ac8843fb797c3d44d907ea8a1ce0 (landing train brief; source
  lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/d02f2ac26b--Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 1687dac3d7dc7905598780595e7df743255edaf6619f038c97d5bfcaa043d544 (Settings head d02f2ac26b;
  source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/554b3d3a65--Concepts--liquid-glass--opus-5.5--CONTRACT.md,
  SHA-256 acd64cd195435ff1bb143d2dd00dab6f0cc7420a7dc8132ee8703f185ebab629 (Glass head 554b3d3a65; source
  lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-frost-crossfade--NOTES.md,
  SHA-256 a90acd28ecc0d3930fa26091b69a55ff3f484a78c150a501a4784c388b3e7d2f (frost crossfade lane; source
  lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/e7f4a4fa8d-seg-plate-commit.txt, SHA-256
  e5d22ffe6fb3afab65144b8da3742d32adf0b7bfbcf3653d5288cf903b879128 (seg plate head; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/ff77ba2788-shell-reduced-enter-commit.txt,
  SHA-256 05fe18d67f4bd18351e6b3a3dd36142c77f926154f26ac44deefb518f3e785b2 (shell follow-up, Reduced
  Motion Enter; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--pm7-motion-editor--NOTES.md,
  SHA-256 a9d113635287031b45c99d01df04710b80b6812f2a6f00838ec57462b3f448e5 (editor lane B6; source
  lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016184818-d1f9.txt, SHA-256
  c9ae59edc7cecdb87a68fade456b18530883c6a3c136b4dc8252e696d39ff799 (coordinator, both trains landed, L1
  a0f844455c and L2 2b5ed6092d; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2b5ed6092d--Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 8206d528447af2e70b66be376a898a2f70c4ff5ea50329527da5d865a5b1ffd2 (main 2b5ed6092d, the commit
  seam with the print fade; source lineage)
preserved_exact_tokens: []
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-17 (DL-222, DL-223): F6, landed on main at 6a3ee2fe90, is recorded in DL-222, and
  fade-first in DL-223. This entry stays the record of the lanes through L2.'
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-073, ContractName:Plans/FinalGUISpec.md#F3-628, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/FinalGUISpec.md#F3-077, ContractName:Plans/FinalGUISpec.md#F3-598, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/Settings_System.md#SSYS-053, ContractName:Plans/Test_Capture_and_Motion_Evidence.md#TCME-007

### DL-218 - Wonderer Runs Alongside And Grill Me Is A Skill

```yaml
plan_unit_id: DL-218
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Decided by Jared on 2026-10-16 after a review of how the Plans describe Wonderer and Grill Me
  against the two sources they were based on: the Hermes wonderer profile (hermes-profiles
  867a555e13) and the grilling skill (mattpocock/skills 49dd158d10). Wonderer in Crew, BrainStorm
  and Chat Room is an automated helper that runs alongside the run and feeds its leads back to the
  agents, who decide whether each is worth exploring. It explores the run's topic once at the start,
  with the Hermes method, and again only when an agent or the user asks, at most twice more. Every
  agent gets a short summary of each pass and opens a lead's dossier only when it needs it, and
  every lead says how it connects to the topic and where it came from. In a BrainStorm its leads
  reach the agents only after every blind proposal is in. The agents decide each lead (explore it,
  use it or set it aside) with a one-line reason that is shown, and the user's Check it sends any
  lead to research as an override. Writing a BrainStorm plan, and a Crew's final result, wait until
  every lead has a decision; a Chat Room never waits, and its summary lists every lead and what the
  room did with it. The Wonderer never votes, never argues for or against a proposal and never sends
  its own leads to research. Grill Me works like the grilling skill: it is a skill switched on for
  the run, not a participant, and whoever already talks to the user (the assistant, a Crew's
  coordinator, a Chat Room's moderator, or a BrainStorm's coordinator at intake) grills the user,
  never the other agents. This replaces question 10 of DL-138. The question cap stays as a safety
  net, the session normally ends when no decision is left to ask or the user presses Wrap up, and
  nothing acts on the answers until the user confirms what was agreed. Chat Room keeps Grill Me.
  Wonderer in PRD Builder and the Planning Wizard is more human-driven and interactive and is
  designed by those owners, as is when Grill Me runs there, which Jared handed to the thread working
  on them. On 2026-10-20 Jared approved seven defaults: at most two further Wonderer passes (three
  total); no Wonderer debate or room turn, only pass delivery and answers to addressed lead
  questions; shared cmd.collaboration.research_lead with cmd.brainstorm.research_lead as its
  one-to-one BrainStorm alias; a Crew waits for the first pass before splitting; Crew and Chat Room
  use no question base and the extension as their whole maximum (default 25); Crew Auto and
  scheduled-build Crews still refuse both options; and Puppet Master offers no
  one-question-at-a-time setting, so every round asks the whole frontier.
gui_related: true
gui_classification_reason: Changes what the collaboration sheets, run cards, run views and the chat's questionnaire show for Wonderer and Grill Me.
split_recommended: false
depends_on: [DL-133, DL-138]
unblocks: [CWR-041, CWR-042, CWR-043, SS-037, SS-038, P-059, APR-072]
acceptance_criteria:
- Collaborative Workflows, Skills System, Personas, Runtime Artifacts Panel, Assistant Plan Runtime and FinalGUISpec agree with this decision; PRD Builder and Planning Wizard keep their own Wonderer and Grill Me timing.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
risk_class: owner_drift
reasoning_tier: high
context_scope: wonderer_and_grill_me_roles
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Collaborative_Workflows.md
- Plans/Skills_System.md
- Plans/Personas.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Assistant_Plan_Runtime.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce (decision record, T3 thread 3e741762-c008-45a0-931b-b27997b1d784; decision lineage)"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/SOURCE-SHA256.txt (pinned copies of the Hermes wonderer profile and the grilling skill; source lineage)"
preserved_exact_tokens: []
negative_constraints:
- Wonderer never votes, argues or routes its own leads to research.
- Grill Me is never a participant and never puts the user's decisions to other agents.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043, ContractName:Plans/Skills_System.md#SS-037, ContractName:Plans/Skills_System.md#SS-038, ContractName:Plans/Personas.md#P-059, ContractName:Plans/Assistant_Plan_Runtime.md#APR-072, ContractName:Plans/Decision_Log.md#DL-138

### DL-219 - No Platform-Specific Solutions

```yaml
plan_unit_id: DL-219
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared, 2026-10-17 10:27Z: "I don't want a solution that varies based on the
  platform. So no special treatment for lower spec machines. Just do the best you can and move on
  from the issue." Idle preparation and the page-change hold are the same on every machine. No
  platform-specific rule, no per-machine acceptance and no lower-spec tier are added. P1000-class
  and M3-class hardware stay measurement hardware. This generalizes DL-216's refusal of a
  low-end-GPU tier. ACD-475 owns the rule. Existing capability fallbacks that an owner already
  states, such as no blur without a GPU and no idle preparation when there is no GPU, are unchanged.
  Concept films are evidence, not native certification.
gui_related: true
gui_classification_reason: No Platform-Specific Solutions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: no_platform_specific_solutions
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (Jared, 2026-10-17, as
  relayed by the coordinator; no special treatment for lower-spec machines; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-p1000-speed/IDLE-WARM-RULE.md,
  SHA-256 9a79df01751fbd98f1b4d597d40e520e662b5d584e97ef9094c27dd8aa55736d (Jared, 2026-10-17 10:27Z;
  decision lineage)
preserved_exact_tokens:
- no special treatment for lower spec machines
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475

### DL-220 - The Concept Is Not Production

```yaml
plan_unit_id: DL-220
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared: this concept is not production. It will be rebuilt in Slint and custom
  Skia, so concept performance work stops at "not horribly slow". That bound ends further
  concept-only performance campaigns. It does not replace ACD-475's acceptance bar, which the rebuild
  honours, and it does not certify the concept. DL-216's separate P1000 speed-up campaign is closed
  by this decision.
gui_related: true
gui_classification_reason: The Concept Is Not Production.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: the_concept_is_not_production
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (Jared, 2026-10-17; the
  concept is not production and will be rebuilt in Slint and custom Skia; decision lineage)
- '/mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256 c84372326c5e04124e0fec8580fa2b9ea8d576c03815396a0380cda39ddbb5ad as of 2026-10-17 (the log keeps growing; Jared''s words at 16:00Z, "Do B. ... As long as its not horribly slow.", the options at 15:52Z; decision lineage)'
preserved_exact_tokens:
- not horribly slow
- Slint
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475

### DL-221 - Q22 Closed As Best Effort

```yaml
plan_unit_id: DL-221
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. The Q22 final motion QA pass is closed as best effort. These open items are
  parked, not scheduled, and each requirement still stands: the Usage cold-entry hold (F3-628,
  ACD-475), Settings entry and chapter switch (SSYS-053, ACD-475), the NieR toggle under Reduce
  Animations (F3-598), onboarding Ready to Enter under Reduce Animations (F3-520), and the Glass
  Light Forest wallpaper hold (F3-653, DR-073). The report is the motion pass part 2. Parking does
  not waive ACD-475's bar or the behaviours F6 recorded. It ends the concept campaign on those
  moments. Concept evidence is not native certification.
gui_related: true
gui_classification_reason: Q22 Closed As Best Effort.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The five parked moments are named here and are not a scheduled concept gate.
- The linked owners agree; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: q22_closed_as_best_effort
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (Jared, via the coordinator;
  Q22 closed as best effort; the five items parked; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/2026-10-16-motion-pass--PART2.md,
  SHA-256 1a61d195f6542a182596e531781b696927b2900248e5155b9abe134786bc0f3f (the Q22 report, including
  the F6c update; source lineage; not native certification)
- '/mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256 c84372326c5e04124e0fec8580fa2b9ea8d576c03815396a0380cda39ddbb5ad as of 2026-10-17 (the log keeps growing; Jared''s words at 16:00Z, "Do B. ... As long as its not horribly slow.", the options at 15:52Z; decision lineage)'
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/Automated_Testing_System.md#ATS-077

### DL-222 - F6 Landed

```yaml
plan_unit_id: DL-222
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. F6 landed on main at 6a3ee2fe90, from 1b092d0b0e. Behaviours the Slint and
  custom Skia rebuild honours, each in one owner: a page change may hold the leaving page, the
  click's motion still running, while the arriving page is still drawing, for about 1.5 s counted
  from the click, and the entrance then plays from the start. Under Reduce Animations the page
  arrives whole and is not held. A move that was held, or released but not yet shown, still counts as
  running (ACD-475). The click fade keeps moving through a hold and the exit continues from the
  opacity it has reached (F3-464). Entering Usage never shows a blank or empty board; plates and
  bodies arrive together, and a room change hands off at the new room's first drawn frame (F3-628).
  NieR's page-wipe band covers at the release of the hold, not during it (F3-464). Idle preparation
  is the one rule in ACD-475, the same on every machine (DL-219). Terminal Customize is prepared
  under that rule so it opens already drawn, and the bezel's look is unchanged (F3-650, F3-643).
  A pick shows on its control before the write (ACD-475, F3-650). Glass's warm-up follows the same
  rule and changes no Glass look (F3-652). Wallpaper fade-first is DL-223 (F3-653, DR-073).
  Reopening Customize reports a failed or empty open as an error, not only a toast (F3-650). The
  editor sheet's opening pass-through, and focus while a surface is drawn unseen, are proposed
  pending Jared in F3-650 and ACD-475. Amended 2026-10-17 (DL-230): Jared kept the opening pass-through
  (F3-650), and the focus rule stands as the coordinator's default, not objected by him (ACD-475). F6 brings the concept's Bell help and bezel reflection scale
  into line with the inventory and SSYS-051; those owners are unchanged. Lead B6 / T2-4
  (c145df3233) changes no behaviour. Settings place (67afa7e2a9) and the generator fix (881a6130ff)
  change no product contract; the generator writes LF and slash paths on Windows, which is tooling.
  F6 adds no binding, command or stored state. Concept evidence is not native certification.
gui_related: true
gui_classification_reason: F6 Landed.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: f6_landed
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (the F6 lanes as behaviour;
  decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/2026-10-16-motion-pass--INTEGRATION.md,
  SHA-256 b821fd283ce457433e82e62885ddf0bf480272c3a5531340144fedf87532b262 (F6c final, main
  6a3ee2fe90, and the lane heads; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/Concepts--onboarding--opus-5.5--tools--shell_motion.py,
  SHA-256 e245b03ddc951281dc20463422fc9dddf3c5299c7f3ca3421f41b9da399ab625 (main 6a3ee2fe90; the
  entrance wait, cap about 1.5 s from the click; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/Concepts--onboarding--opus-5.5--tools--motion_finish.js,
  SHA-256 a7a522fa4a1984cafddc45b315d23b4b7792fbab0a6e1a9069c448a6095476a4 (main 6a3ee2fe90; a held
  page move finishes; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/Concepts--home-redesign--src--panels--kinds--11-editor-customize.js,
  SHA-256 7bd2cb58747e1d064ae91a82763d76d948262c64bc1a939a1123efce27ab7701 (main 6a3ee2fe90; a failed
  Customize open is reported; the opening pass-through, proposed then and kept by Jared on 2026-10-17 (DL-230); source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/FinalGUISpec.md#F3-628, ContractName:Plans/FinalGUISpec.md#F3-464, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/DRY_Rules.md#DR-073, ContractName:Plans/UI_Wiring_Rules.md#UIW-043

### DL-223 - Wallpaper Fade-First

```yaml
plan_unit_id: DL-223
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared approved option (c) on 2026-10-16, in the words "fade is fine". A
  wallpaper pick whose frost is not ready starts the print's fade as soon as the print is decoded.
  The sheets keep the old frost during that fade, then crossfade to the new frost once it is ready.
  A prepared pick still fades the print and its frost together. No frame is blank. While a fade has
  not committed, a newer choice fades from the print currently fading. A look or mode change that
  changes the print ends that fade at once; one that keeps the same print lets it finish. Reduced
  Motion, a print change that a look change causes, and no GPU keep the immediate swap (amended 2026-10-17, review r1). The setting still writes at the pick.
  F3-653 owns the crossfade. DR-073 owns preparation and the source query. This supersedes DL-216's
  "lands in a later lane" for the frost crossfade. Concept evidence is not native certification.
gui_related: true
gui_classification_reason: Wallpaper Fade-First.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: wallpaper_fade_first
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-16-motion-fixes/pm7-liquid-glass/F6-NOTES.md,
  SHA-256 86b0f12a17d3eab6becf2410e1c5950a6c619066c8a6d683ba57328a9fef7899 (Jared approved option (c),
  fade is fine; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/2026-10-16-motion-pass--INTEGRATION.md,
  SHA-256 b821fd283ce457433e82e62885ddf0bf480272c3a5531340144fedf87532b262 (F6c final; source lineage;
  not native certification)
preserved_exact_tokens:
- fade is fine
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/DRY_Rules.md#DR-073, ContractName:Plans/Decision_Log.md#DL-216


### DL-224 - The Whole System Should Wow People

```yaml
plan_unit_id: DL-224
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared, 2026-10-10: "this whole system should WOW people. The glyphs, the
  glass, the hover effects, the animations and motion everywhere, the widgets, dragging and dropping
  effects, the terminal, themes, everything. This should look like a polished high budget production
  software." The coordinator's note under it adds never to cut polish, effects or scope to save an AI-account budget;
  that is a working rule for the campaign, not Jared's words (amended 2026-10-17, review r1). ACD-475's motion
  bar is unchanged and is not a licence to drop an effect. This is not a per-machine rule. DL-219
  still refuses a platform-specific tier. Concept evidence is not native certification.
gui_related: true
gui_classification_reason: The Whole System Should Wow People.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: product_quality_bar
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-10-design-consistency-threads/README.md,
  SHA-256 8fa64025997bb65cbd95f0ebebca59984d882aa097fdd6f550ffa126618e4c1b (Jared, 2026-10-10, the
  quality bar; decision lineage)
preserved_exact_tokens:
- "this whole system should WOW people"
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/GUI_Rebuild_Requirements_Checklist.md#GRRC-041, ContractName:Plans/Decision_Log.md#DL-219

### DL-225 - Friendly Takes Its Cues From Handheld And Console Menus

```yaml
plan_unit_id: DL-225
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared, 2026-10-11: "keep in mind the friendly theme is based on the original
  DS, 3DS, wii, Wiiu menu styles and feel. Also the cocoon shell front end. and https://iisu.network/."
  Every new Friendly surface takes its cues from that direction. The Friendly row of FinalGUISpec section 6.1's
  theme-family table records it (amended 2026-10-17, DL-228; it read: F3-647's Friendly row).
  Friendly wallpapers and Usage keep their own owners. Concept evidence is not native certification.
gui_related: true
gui_classification_reason: Friendly Takes Its Cues From Handheld And Console Menus.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: friendly_design_direction
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-glass-review-feedback/PARTY-ONBOARDING-ART-GLASS-GO.md,
  SHA-256 27c060986ce65fee12cf0eac1e6d7365f487300b8a06cee9c374b22316f1eefa (Jared, 2026-10-11,
  Friendly design direction; decision lineage)
preserved_exact_tokens:
- "the friendly theme is based on the original DS, 3DS, wii, Wiiu menu styles and feel"
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-647

### DL-226 - Glass Carry Holds A Pre-Painted Frost

```yaml
plan_unit_id: DL-226
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. On 2026-10-11 Jared chose Glass carry A, frost while carrying, rather than
  accepting about 30 fps. While a widget plate is carried on a board, on the Usage page or a Home
  dashboard tab, in Glass, the resting plates hold a pre-painted frost instead of live blur. At rest
  the frost looks the same. The planner narrowed the choice to those plates and reported that narrowing to Jared
  (STATUS-planner.md:128; amended 2026-10-17, review r1). F3-652 owns the one line. This is not a platform threshold and adds no setting.
  Concept evidence is not native certification.
gui_related: true
gui_classification_reason: Glass Carry Holds A Pre-Painted Frost.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: glass_carry_frost
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/STATUS-planner.md,
  SHA-256 7d367d3e117bc2bed033890abd6598bc28a7f9b82d528fd768ea10fd1d8bb1a8 (Jared chose Glass carry
  A, frost while carrying, 2026-10-11 05:47 UTC; decision lineage)
preserved_exact_tokens:
- "frost while carrying"
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-652

### DL-227 - Ctrl+Shift+D Is Reserved For Readiness And Doctor

```yaml
plan_unit_id: DL-227
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared, 2026-10-14: Ctrl+Shift+D is left to Readiness & Doctor. No shortcut
  opens Demo Studio (DL-185). The chord is not the Home dashboard reveal. That earlier use, the
  FinalGUISpec shortcut table under DL-180, is retired. The dashboard still opens from the plus
  menu (F3-634, F3-638). The chord stays unbound until Readiness & Doctor's owner registers the
  command. This adds no command id. Concept evidence is not native certification.
gui_related: true
gui_classification_reason: Ctrl+Shift+D Is Reserved For Readiness And Doctor.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The shortcut table reserves Ctrl+Shift+D for Readiness & Doctor and does not bind it to the dashboard reveal or to Demo Studio."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: readiness_doctor_shortcut
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Concepts/onboarding/opus-5.5/DEMO_STUDIO.md, SHA-256
  538efe846c8bcb29a397a7f692166119cf2aa80ca6bbeff407688fc947babc29 (Jared, 2026-10-14, Ctrl+Shift+D
  is left to Readiness & Doctor; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-14-demo-studio-follow-ups/NOTES.md, SHA-256
  abefcca89c23094da8cd7fb31f8454dbb2e5c5bf96666f88611b652f079a0073 (nothing yet binds Doctor's
  chord; source lineage)
preserved_exact_tokens:
- "Ctrl+Shift+D is left to Readiness & Doctor"
negative_constraints:
- "Do not open Demo Studio with Ctrl+Shift+D."
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-185

### DL-228 - The Week Sweep Records What The Concept Built

```yaml
plan_unit_id: DL-228
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared, 2026-10-17: "For sweeping for plan changes (which also includes wiring, dry,
  commands), you need to have multiple models sweep so nothing is lost." Four independent sweeps of the PM7
  week, by Opus 5.5 and Muse Wonder over two areas (Concepts 226e834893 to 1b092d0b0e and the top-ups DL-157
  to DL-217), found behaviour, wiring, commands and settings the concept has and Plans lacked or stated
  wrongly. The owner amendments dated 2026-10-17 that cite this row record them. They are behaviour the Slint
  and custom Skia rebuild honours, not Jared decisions, except where an owner cites one. Wrong counts, event
  lists, state names and mappings are corrected in place, each keeping what it read. This row registers
  cmd.workspace_layout.restore (UCC-200, CV-361, production entry tour.layout_restore), the local read
  projection ui.notifications.mark_all_read (CS-102) and the tour phase review_parts (PWIZ-035). Concept
  internals (timings, CSS values, caches, warm queues, demo scaffolding) stay out. A question no Jared
  decision answers is marked proposed, pending Jared in its owner; Jared answered those questions on 2026-10-17
  (DL-230). The sizes, distances and times these
  amendments quote from the concept are tokens, not acceptance numbers (review r1). Concept evidence is not native
  certification.
gui_related: true
gui_classification_reason: The Week Sweep Records What The Concept Built.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The amended owners agree with the concept's built behaviour or say why not; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_week_sweep_reconciliation
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/WEEK-WRITER-BRIEF.md, SHA-256
  2297493867dccad908210fc023b470eb41d964f6ebd23be0caae3045db349a84 (Jared's sweep rule, as relayed by the
  coordinator; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/SWEEP-WEEK-BRIEF.md, SHA-256
  642d804ebc361475da10d33056b55617b30cf673914229c452d35926e78fda1c (the sweep brief and range)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/SWEEP-WEEK-OPUS-A.md, SHA-256
  df790ea1fcc4bd156f0dac2234551335364a0676a92b32e44e505f6a05bee432 (OA-1 to OA-95; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/SWEEP-WEEK-MUSE-A.md, SHA-256
  edd9dcae68bd56980e270e40f08309701b63a1cfd82858abb634b0695bd3a13d (MA-1 to MA-26; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/SWEEP-WEEK-OPUS-B.md, SHA-256
  a74054b4fea13526b56a1e0a395b6ad434d62828bb407cd1a79b228e8f2ef144 (OB-1 to OB-91; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/SWEEP-WEEK-MUSE-B.md, SHA-256
  64660f9cb17aeb5bd5c4f5c61aba78f006926e25286b6b93ebf1fc5b57006c7b (MB-1 to MB-48; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/NOTES.md (the week reconciliation table, one outcome per
  sweep row)
preserved_exact_tokens:
- "you need to have multiple models sweep so nothing is lost"
negative_constraints:
- "Do not read an amendment under this row as a Jared decision unless it cites one."
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/Commands_System.md#CS-102, ContractName:Plans/Planning_Wizard.md#PWIZ-035

### DL-229 - Glass Keeps Usage Calm With No Sweep And No Opaque-Then-Clear

```yaml
plan_unit_id: DL-229
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared, 2026-10-11, reviewing Liquid Glass v2: "The usage page animations are too busy. I
  think the side ways swipe across the whole screen when you change tabs can go away. Also, when you change tabs
  in the usage area, it seems like the items that are moving are more opaque then once they settle they become
  clear. It is really jarring." F3-652 owns the outcome: no full-board sweep on a Usage change, and Glass
  condenses into place only when Glass is switched on, never on a page, tab or room change, so moving items
  never turn opaque and then clear. Moving a widget by hand may still lift it (WS-019). DL-191's "calmer
  transitions" is this answer, recorded until now only in the share notes. Concept evidence is not native
  certification.
gui_related: true
gui_classification_reason: Glass Keeps Usage Calm.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The linked owners agree with this decision; source publication is not native certification.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: glass_usage_calm
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-glass-review-feedback/PARTY-WALLPAPERS-GO.md, SHA-256
  2118d28c76c25e840487decba5d542c2092db7ad0635280055f1315ee9a4c86a (Jared's 2026-10-11 review, verbatim;
  decision lineage)
preserved_exact_tokens:
- "The usage page animations are too busy."
negative_constraints:
- "Do not condense Glass on a page, tab or room change."
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/Decision_Log.md#DL-191

### DL-230 - Jared's Answers To The Week's Open Questions

```yaml
plan_unit_id: DL-230
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-17. Jared answered the week's open questions on 2026-10-17, about 20:45Z, numbered as the
  coordinator's 20:20Z explanation put them: "1. A 2. A, don't waste too much time on the tour I'm going to need
  to completely redo it when chat is rolled in and when I redesign the planning wizard. So I'm not going to fix
  your until all that is done. 3. A 4. A 5. A 6. A 7. A 8. A 9. A 10. A 11. Don't worry about it". The coordinator
  mapped each answer to the writer's open questions, and each owner records it. 1 (open question 3), A: a family
  switch is live under the look's cover; the cross-family restart rule is retired with a dated disposition in
  F3-077, FinalGUISpec section 6.4, the risks table, F3-244 and F3-430, and the theme hot-reload line no longer
  prompts for a restart. 2 (open question 4), A: Planning is about half of the tour's actions and time, which the
  accepted 20-step tour meets (PWIZ-023, F3-521, ATS-020, WM-041, and the guided-tour and interaction contracts);
  Jared will redo the tour completely once chat is rolled in and the Planning Wizard is redesigned, so no other
  tour work is planned until then. 3 (open question 5), A: in the wallpaper gallery the arrows choose as they
  move, and the print's preparation waits for the next frame and a short pause after the last step (F3-653,
  SSYS-054, the control binding wallpaper.keys). 4 (open question 1), A: the editor Customize sheet's opening
  guard stands as proposed (F3-650, DL-222). 5 (open question 6), A: a saved named layout belongs to the person
  across projects, in home_named_layouts:v1, and the dashboard boards inside it stay per project and are skipped
  elsewhere (F3-630, SP-330, the v2 layout schema, the storage registry, UCC-200, CV-361). 6 (open question 7), A:
  Testing's Errored uses the shared failed mark with the word Errored in the failed tone, which answers the
  Errored-colour question of 2026-10-11 (F3-619, DL-162, the glyph catalog). 7 (open question 8), A: the concept's
  plain-language Settings labels, help and option words are adopted in one wording pass, the old labels kept as
  search aliases (F3-441, DR-068, Plans/settings_inventory.json and its schema's option_labels). 8 (open question
  9), A: usage-windows, platform-filters, reset-countdown, cooldown-timers, pressure-visibility and
  tool-usage-window are bound to what the Usage page shows, chart-type is the starting style of each new chart
  widget, and ledger-page-size and ledger-export's CSV choice are retired (UF-107, the inventory). 9 (open
  question 10), A: Usage's demo rows, Play the next hour, Back to now and Demo time, live only in the Demo Studio,
  and the Live menu holds Live readings on and Pause live readings alone (UF-107, DL-177). 10 (open question 11),
  A: a Usage widget is a card everywhere, and the concept's Usage copy is the reference wording with its "panel"
  read as "card" (G-030, UF-093, UF-107, F3-514, F3-628, WS-019, WS-020, UCC-147). 11 (open question 12), "Don't
  worry about it": no requirement is set for how Glass reads under the system's reduced-transparency or
  more-contrast requests, and the proposed reading is withdrawn (F3-652). The focus rule for a surface drawn
  unseen (ACD-475) was put to Jared as the coordinator's default and drew no objection; it stands as that default,
  not as his words. The writer chose, and these are not Jared's words: the tour contracts' 40 percent floor for
  about half; App font losing its restart badge with the restart rule; and numbering the later of two saved
  layouts that share a name when they are gathered.
gui_related: true
gui_classification_reason: Jared's Answers To The Week's Open Questions.
split_recommended: false
depends_on: [DL-228]
unblocks: []
acceptance_criteria:
- Each owner named here records its answer with a dated amendment citing DL-230, and no owner still marks these questions proposed, pending Jared.
- The quote above is Jared's exact text; the writer's choices listed above are not read as his words.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: jared_answers_week_open_questions
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/FinalGUISpec.md
- Plans/Planning_Wizard.md
- Plans/Settings_System.md
- Plans/usage-feature.md
- Plans/Glossary.md
- Plans/storage-plan.md
- Plans/settings_inventory.json
- Plans/storage_value_registry.json
- Plans/pm7_control_bindings.json
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-pm7-coordinator-handoff/COORDINATOR-LOG.md, SHA-256
  74400578201cb0c797697791a7fb0d15ee37ab527c6f19c922ec758c203bbace as of 2026-10-17 (entry 20:45Z, Jared's
  answers verbatim and the coordinator's mapping; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/NOTES.md (the open questions as put, now under Answered by
  Jared 2026-10-17)
preserved_exact_tokens:
- "So I'm not going to fix your until all that is done."
- "Don't worry about it"
negative_constraints:
- "Do not read the writer's choices listed in this row as Jared's words."
- "Do not start other guided tour work before the chat port and the Planning Wizard redesign."
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-077, ContractName:Plans/FinalGUISpec.md#F3-244, ContractName:Plans/FinalGUISpec.md#F3-430, ContractName:Plans/Planning_Wizard.md#PWIZ-023, ContractName:Plans/FinalGUISpec.md#F3-521, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-441, ContractName:Plans/DRY_Rules.md#DR-068, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/Decision_Log.md#DL-177, ContractName:Plans/Glossary.md#G-030, ContractName:Plans/usage-feature.md#UF-093, ContractName:Plans/FinalGUISpec.md#F3-628, ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/assistant-chat-design.md#ACD-475

### DL-231 - Chat Room Rounds Run By Themselves, With An Option To Pause Between Rounds

```yaml
plan_unit_id: DL-231
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Decided by Jared on 2026-10-21, with a refinement the same day, both relayed by the Plans lead.
  Question: when a Chat Room round finishes, should the agents carry on to the next round by
  themselves until the round limit, or wait each time for the user to press Next Round? Why it came
  up: the recorded Chat Room example stopped after round 1 with Round 1 done, Your move, Next Round
  and Summarize Now, and Jared asked what a Chat Room is for. A Chat Room is several AIs holding a
  conversation among themselves under a turn policy (moderated, round robin or free discussion) that
  the user can join at any time; ask_everyone_once is the mode that puts the question to all of
  them once. Decision: rounds are automatic. When a round ends, the room starts the next round by
  itself under the same turn policy and keeps going until its last configured round or its stop
  condition, so the user never presses Next Round between rounds, and a room between rounds reads as
  live rather than as the user's move. Automatic is the default. Automatic pacing removes no existing
  gate: permission, needs-you questions and Grill Me waits stay in force, and rounds continue
  automatically once a gate clears. A Pause between rounds option brings
  back the earlier behaviour for anyone who wants it: it is set on the Chat Room setup sheet and can
  be switched while the room runs from the room's card in the chat and from its run view (the side
  panel), and with it on the room waits after every round, shows Round N done as the user's move,
  and offers Next Round, Summarize Now and End discussion. Unchanged: after its last round the room
  waits until the user adds rounds, chooses Summarize Now or ends the discussion, and never finishes
  by itself (DL-138), and Add 2 more rounds then carries on; a message sent during a round is queued
  for the next round unless the user sends it now to steer (DL-112); Pause, Resume, Summarize Now,
  End discussion and Cancel stay available throughout; ask_everyone_once still asks each participant
  once and stops; Grill Me still grills the user before round 1, which waits for Confirm, and a room
  never waits for the Wonderer (DL-218). Options considered: waiting for Next Round after every
  round, the earlier behaviour, which is now the Pause between rounds option; and automatic rounds
  with no way to pause between them, which the refinement replaced by adding the option. For
  cmd.chat_room.next_round the options were to raise it from the moderator as the record of every
  round start (rejected: no catalog surface raises a command for a run's own progress, and a
  scheduled message's dispatch is an internal action rather than a user command for the same
  reason), to narrow it to the user's start of round 1 (rejected: Start already starts round 1), and
  to keep it as the user's command for starting the next round while the room pauses between rounds
  (chosen: its identity, request, result, handler and surfaces all stay, so no command is minted or
  retired, and the room's automatic round starts dispatch no command, as BrainStorm's phases advance
  without one). The mechanics are the Plans lead's and the writer's readings, not Jared's words: the
  setup sheet's Start is the user's go, so round 1 starts when the room starts and the Ask Everyone
  step before it is retired; a room whose stop condition is met before its last round stops starting
  rounds and waits in the same way; the option is the definition field pause_between_rounds, false
  by default, switched while the room runs through cmd.collaboration.reconfigure with the change
  set_pause_between_rounds, the way Grill Me is turned on mid-run, so it bumps the definition
  revision, writes one system transcript entry, takes effect at the next round boundary and never
  cancels a turn; it has the Settings default assistant.multi_agent.chat_room.pause_between_rounds
  beside the room's turn policy and rounds, because the sheet opens from Settings defaults and Save
  as default should keep the choice for someone who always wants to read each round before the next;
  and a Chat Room's your-move dock item covers only a room that waits on the user, such as between
  rounds with the option on, after its last round, while paused, or while any Grill Me session waits
  for its current Confirm: before round 1, or a session turned on mid-run before the round that needs
  its answers. Questions, approvals and failures keep the needs tone. Affected units: Collaborative
  Workflows sections 6.2, 6.3, 10, 12, 14 and 18,
  CWR-024, CWR-031, CWR-032 and the new CWR-044, and the chat's dock requirement ACD-476.
gui_related: true
gui_classification_reason: Changes when a Chat Room waits for the user and what its setup sheet, card, run view and dock item offer between rounds.
split_recommended: false
depends_on: [DL-112, DL-138, DL-218]
unblocks: [CWR-044]
acceptance_criteria:
- Collaborative Workflows and the chat design agree with this decision; with Pause between rounds off, eligible rounds continue automatically subject to existing gates, and completing a round alone never makes it the user's move. Existing permission, needs-you, Grill Me and manual-pause attention remains as CWR-044 and ACD-476 specify.
- The mechanics listed above as the lead's and the writer's readings are not read as Jared's words.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
risk_class: owner_drift
reasoning_tier: high
context_scope: chat_room_rounds
implementation_surfaces:
- Plans/Decision_Log.md
- Plans/Collaborative_Workflows.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans lead's T3 task brief of 2026-10-21 relaying Jared's answer (automatic rounds) and his same-day refinement (an option to pause between rounds, in the setup sheet, the room's card and its side panel); decision lineage"
preserved_exact_tokens: []
negative_constraints:
- Do not make a Chat Room wait for Next Round between rounds unless Pause between rounds is on.
- Do not read the lead's and the writer's readings listed in this row as Jared's words.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-044, ContractName:Plans/Collaborative_Workflows.md#CWR-024, ContractName:Plans/Collaborative_Workflows.md#CWR-031, ContractName:Plans/Collaborative_Workflows.md#CWR-032, ContractName:Plans/assistant-chat-design.md#ACD-476, ContractName:Plans/Decision_Log.md#DL-112, ContractName:Plans/Decision_Log.md#DL-138, ContractName:Plans/Decision_Log.md#DL-218


### DL-232 - Port The 5.6 Pro Chat Into The Home Column

```yaml
plan_unit_id: DL-232
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared requested the 5.6 Pro chat port into PMConcept7 on 2026-10-22, replacing its scripted
  stand-in, restyling the chat in every look including NieR, moving its demonstrations into the one
  Demo Studio, opening its surfaces through the Home panels and updating Plans, commands, wiring and
  Settings. This executes the earlier accepted decisions DL-180, DL-181, DL-185 and DL-187 rather than
  inventing another workspace. The original presentation and Demo Studio decisions are recorded with
  Jared's words in DL-185 and DR-070; this entry records their port into the hosted column. The fixed
  chat column, one History list, Activity Detail inside chat, universal tab kinds, file preview rules
  and user-versus-agent focus rules stay with their existing owners. The host owns look, code faces,
  NieR parts, hover, panel placement and tab chrome; the chat owns its conversation and the content it
  supplies to those tabs. The port carries the accepted Wonderer and Grill Me behavior of DL-218 and
  automatic Chat Room rounds of DL-231. The port must apply the carry-over layout repairs, including
  narrow shelf headers, run plates, NieR type and sticky headers, questionnaire controls and narrow
  sheets. Settings binds existing admitted preferences instead of making parallel chat defaults. The
  Guided Tour stays on its accepted teaching flow for this port and is redone after both this port and
  the Planning Wizard redesign, as Jared already decided in DL-230. Concept integration and browser
  checks prove no native handler, EventRecord, storage writer, runtime admission or governance seal.
  Any remaining mismatch between the integrated concept and an accepted owner is an implementation
  gap, never an implicit repeal of that owner. The lead's 2026-10-22 ruling under Jared's port brief
  admits general.interaction.thought-stream as a global, display-only preference, Auto (While it
  thinks) or Expanded (Always open), default Auto, shared by Settings and New chat defaults. The same
  ruling moves the existing run-scoped current-chat ELI5 control to the chat sheet only, retaining its
  inventory identity and override contract. These are the lead's rulings, not Jared's quoted words,
  and are flagged for Jared at handoff. Amended 2026-10-23 (DL-233): the scripted stand-in chat is
  removed, with its Studio-only swap; it is not the hosted conversation and has no Settings row. The
  fixture workspace bodies in ordinary Home tabs are concept scaffolding, not product settings or
  native tab kinds. That clarifies ACD-500's product exclusion while allowing the demonstrations Jared
  asked to carry into the Studio. The lead also kept the existing project-only
  Settings adapter for this port: All chats ELI5 is session-only in the concept, the gap is disclosed,
  and no shadow global store is created. Final reconciliation against integrated concept 59ca2d4382
  records the hosted column, Home surface routing, thread-bound browser captures, thread-bound context
  actions, attachment viewer tabs and bounded More Info popover as built. Demo Studio has its Chat
  section and the standalone remains the module source. The final integration of 2026-10-23 adds the
  looks lane's CSS, the hover press fix, PMConcept7 hover copy for every chat control and the hosted
  render repairs. Its browser checks pass the narrow shelf headers, the 480 px run plates, PMConcept7's
  NieR type and the helper-sheet chrome at 400-519 px in all ten looks, and PMConcept7 films of Crew,
  Room and BrainStorm are recorded. The hover press fix also narrows F3-523's scroll cancellation to a
  scroll that moves the anchor. Thought Stream shares a preference and preview; its live thinking
  display followed on 2026-10-23 (DL-234). The window-based isPhone helper and the separate scoped overlay wrapper are
  concept integration limits under ACD-501/504, not fulfilled native acceptance. Jared ratified the
  Thought Stream admission on 2026-10-23 (DL-234); no other product ruling is inferred from this snapshot.
  Astra's round-2 check corrected the integration brief's broader capture claim: composer attachment,
  list and insertion paths needed destination restoration or mismatch refusal before draft mutation,
  and the shared editor-revealed state counted hidden Home panels. The final integration repairs both
  under the existing originating-thread/destination and visibility requirements. Two concept gaps
  remain open without changing an owner: under load the hosted Ask Card close can finish after its
  browser check reads it, and at a wide column the turn follow-along waits for the standalone chat's
  own wide-layout fold.
gui_related: true
gui_classification_reason: Records the hosted chat replacement, shared Settings controls and preservation of the accepted tour.
split_recommended: false
depends_on: [DL-180, DL-181, DL-185, DL-187, DL-218, DL-230, DL-231]
unblocks: []
acceptance_criteria:
  - "The port owner map identifies the existing column, surface, command, Settings and tour owners without changing their domain identities."
  - "The standalone chat remains a separate concept reference; the hosted build has one chat surface and one Demo Studio."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/Decision_Log.md"
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, D4, D7, D8, D9, D26, D27, D28)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b (concept integration lineage, not native API authority)"
  - "/mnt/Cursor/share/puppet-master/2026-10-20-wonderer-grill-me-concept/PORT-CARRY-OVER.md, SHA-256 67195793eeda6a463b5e2da60e7ae294ae62ef435a4a89e56fcd3e25587884fa (accepted layout and styling repairs)"
  - "Lead ruling via pm-mail 1022211545-c3b8, 2026-10-22: Thought Stream admission, current-chat ELI5 placement and stand-in harness fallback; not Jared verbatim."
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/lead-checkpoint-20261022-2155.md, SHA-256 9063fdc033b2aac0d2558eba612d2f0ab33b032f0a0df72c848c21112ee72e98 (lead checkpoint; concept integration and rulings, not native proof)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/demo-inventory-20261022.md, SHA-256 3f1f8f372c1ec03a047cd6936853f14f3b745b056791bd2f7a30d929a00e60cd (concept-only Studio inventory, not product counts or native APIs)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md, SHA-256 108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated against concept source; not native or final visual verification)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/capture-destination-r2-gap.md, SHA-256 9f8937823eeac12174ab07a023a4c3d5b867bf94b498e99e5b96aeaafb691208 (Astra round-2 verified composer destination gap; corrects the broad integrated capture claim)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/astra-r2-verified-capture-visibility.md, SHA-256 00e29db6dca53bbaeb5f3414acd13be6b36ab5c7af2f61a4ccfdf45e9158bcd7 (frozen partial independent review: shared editor visibility and composer destination gaps; separate run-card visibility passes)"
preserved_exact_tokens:
  - "Demo Studio"
negative_constraints:
  - "Do not treat a concept bridge as native implementation evidence."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/Decision_Log.md"
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-504, ContractName:Plans/FinalGUISpec.md#F3-659, ContractName:Plans/Settings_System.md#SSYS-055


### DL-233 - Remove The Stand-In Chat And Size Pinned History As The Panel Redesign Designed

```yaml
plan_unit_id: DL-233
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared answered the 5.6 Pro port's open items on 2026-10-23. Of the scripted stand-in chat he said:
  "Stand-in chat should be removed. It's just going to confuse future agents." Of pinned History's
  width he said: "Do whatever the panel redesign had designed around." The stand-in that held the Home
  chat column before the port is removed from the concept, with its chat.standIn value, its Home
  options row and its Demo Studio Workspace row. The hosted 5.6 Pro chat is the column's only chat
  surface. Its own controls and the Studio's Agents open things carry the panel-open demonstrations
  the stand-in held. This supersedes DL-232's ruling that the stand-in stays built but off by default
  for Home harnesses, and ACD-504's Studio-only stand-in swap. Pinned History follows the panel
  redesign's D3 as F3-637 states it: pinning widens the chat by the list's own width instead of
  squeezing the messages. Pinned, the list is 240 px, or 200 px while the whole column is under 540
  px, which only a capped column reaches. The column grows by the width the list is drawn at, also
  when the person dragged the list's edge to another width within the chat's own 170 to 360 px and
  42 percent of its pane, so the messages keep their width. The centre budget and the narrow ladder
  still cap the column. While the ladder takes the History's width back, the list shows as its flyout
  and the person's pin is kept. The standalone 5.6 Pro chat keeps its own 200 px pinned drawer. This
  is a concept and canon reconciliation; browser checks of the concept are concept evidence, not
  native implementation evidence.
gui_related: true
gui_classification_reason: Records the stand-in chat's removal and pinned History's width in the Home chat column.
split_recommended: false
depends_on: [DL-180, DL-187, DL-232]
unblocks: []
acceptance_criteria:
  - "The Home chat column has one chat surface, the hosted 5.6 Pro chat; no stand-in chat, setting, Home options row or Demo Studio row remains."
  - "Pinning History grows the column by the list's drawn width, default 240 px or a width the person dragged, and the messages keep their width wherever the centre budget allows it."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/Decision_Log.md"
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-232"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/ROUND2.md, SHA-256 9f669dde0142444599dbcca0524943ea4523008ef53d89d71518e705bd808e22 (Jared's answers of 2026-10-23, quoted verbatim, relayed by the port lead)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/FINAL-REPORT.md, SHA-256 2b92cf507b5b7999eed9be9557289a83c06918a5124925e88f24e0187a450a4d (open items 1 and 2 that the answers settle)"
  - "/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, the panel redesign's History width)"
preserved_exact_tokens:
  - "Stand-in chat should be removed. It's just going to confuse future agents."
  - "Do whatever the panel redesign had designed around."
negative_constraints:
  - "Do not restore a scripted stand-in chat, a chat.standIn value or a stand-in Studio row."
  - "Do not narrow the messages to make room for pinned History where the centre budget allows the column to grow."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/Decision_Log.md"
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-659, ContractName:Plans/assistant-chat-design.md#ACD-504, ContractName:Plans/Settings_System.md#SSYS-055

### DL-234 - Show The Live Thinking In The Chat

```yaml
plan_unit_id: DL-234
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-23. Jared answered the 5.6 Pro port's open items on 2026-10-23: "Your rulings were
  fine, I would like the live thinking demoed though." The lead's rulings of 2026-10-22 recorded in
  DL-232 therefore stand, the Thought Stream admission among them: general.interaction.thought-stream
  stays a global, display-only preference, Auto (While it thinks) or Expanded (Always open), default
  Auto, shared by Settings, New chat defaults and the composer's Thought Stream choice. Round 2 of the
  port adds the live thinking display that the preference drives, in the shared chat so the standalone
  concept and the hosted Home column both have it, and demonstrates it. ACD-221's amendment of the same
  date owns the presentation: a thinking block of its own before the reply, or before an agent turn's
  first working card; the thinking placeholder of ACD-470 as its line while the model thinks; Auto
  folding it to one line with how long it thought when the answer or the first tool call starts, and
  Expanded keeping it open; a disclosure line with a hover tag; one polite status at the start and one
  at the end; and a fold that never moves a reader at the bottom of the transcript. Settings' row help,
  the New chat defaults fine print, SSYS-055, CS-104, ACD-470, ACD-504 and DL-232 no longer describe
  the display as pending. Demo Studio's Chat section gains a Thought Stream pair of guided examples,
  While it thinks and Always open, each in an example chat that shows its one mode without writing the
  preference. The concept streams reasoning recorded with its demo turns, so it proves no native
  reasoning capture, provider stream parsing, storage writer or governance seal. The mechanics are the
  thinking lane's reading of ACD-221 and the existing chat owners, not Jared's words. Amended the same
  day with Jared's answers to the thinking lane's four open questions, quoted verbatim. Asked whether
  an agent turn's thinking block folds when its reasoning ends, before the work starts, he answered
  "Folds.": the fold before the first working card stands. Asked how many lines Auto shows while the
  model thinks, where the lane had chosen six, he answered "Default 8, adjustable in settings.": the
  live window shows the last eight lines by default, and a new global, display-only preference,
  general.interaction.thought-stream-lines (Lines shown while thinking), sets that number from
  Settings, New chat defaults and the composer's Thought Stream menu, with the choices 4, 6, 8, 12 and
  16 lines; Expanded stays uncapped. Asked whether NieR's thinking ink stays stepped halfway toward
  the text colour, so that it reads over the scene art, he answered "Keep": it stays. Asked whether the
  working card's own Thinking step, shown after the folded thought, should be dropped from the recorded
  run, he answered "Leave it": the run is unchanged. The five choices, the row's words and its place
  under Show thinking are the thinking2 lane's reading, not Jared's words: fewer than four lines would
  leave the top fade over a third of the window, and past sixteen (320 px) the window is half a
  column, which is what Always open is for.
gui_related: true
gui_classification_reason: Records that the chat shows the model's reasoning live and how the admitted Thought Stream preference shapes it.
split_recommended: false
depends_on: [DL-232]
unblocks: []
acceptance_criteria:
  - "ACD-221, ACD-470, ACD-504, SSYS-055, CS-104 and DL-232 agree that the concept shows live thinking driven by the admitted preference."
  - "Jared's words are quoted verbatim, and the lane's mechanics are labelled as its reading, not his words."
  - "ACD-221, SSYS-055, UCC-208 and Plans/settings_inventory.json agree that Auto's live window shows eight lines by default and that general.interaction.thought-stream-lines (4, 6, 8, 12 or 16) adjusts it; Expanded is never capped."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/Decision_Log.md"
  - "Plans/assistant-chat-design.md"
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-232"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/ROUND2.md, SHA-256 9f669dde0142444599dbcca0524943ea4523008ef53d89d71518e705bd808e22 (Jared's 2026-10-23 answers as relayed by the lead, verbatim where quoted)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/ROUND2.md, SHA-256 6eda2be634f439a1398e87e8ddd1d9fa08d60d709f5fcf90687436af38e0e56a, section Thinking display answers (Jared's 2026-10-23 answers to the thinking lane's four questions as relayed by the lead, verbatim where quoted)"
preserved_exact_tokens:
  - "Your rulings were fine, I would like the live thinking demoed though."
  - "general.interaction.thought-stream"
  - "Folds."
  - "Default 8, adjustable in settings."
  - "Keep"
  - "Leave it"
  - "general.interaction.thought-stream-lines"
negative_constraints:
  - "Do not treat recorded demo reasoning as native reasoning capture or provider evidence."
  - "Do not read the lane's mechanics listed in this row as Jared's words."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/Decision_Log.md"
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-221, ContractName:Plans/assistant-chat-design.md#ACD-470, ContractName:Plans/Settings_System.md#SSYS-055, ContractName:Plans/Commands_System.md#CS-104, ContractName:Plans/UI_Command_Catalog.md#UCC-208


### DL-235 - Pip Brand, Assets And Faces

```yaml
plan_unit_id: DL-235
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. X1, X3, A1–A5, S8: Pip is the brand and each individual agent;
  robot is the small category mark. One static Basic Dark app tile ships in the signed bundle (ICO 16–256,
  ICNS, PNG and SVG manifest); the title-bar mark is static, 24 px, state-free and non-interactive, with
  mark-only density. Tray visibility retains minimize-to-tray. Across all Projects its face maps idle→idle,
  working→working, done→complete for about 10 s, needs-you→waiting (wins), error→failed, paused→paused.
  Static NieR keeps the plain band; live Pip has eyes. OS notifications and Friendly’s app tile use Pip;
  in-app kind marks stay. No mood adds a status key. Recommendations follow the decision packet and remain
  addressable by their decision IDs; X1, L1, S9, O11 and G4 are Jared’s explicit rulings.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Brand/title mark is static/non-interactive at 24 px with mark-only density; fixed app tile is Basic Dark.
- Tray gate and full A3 precedence match one cross-Project projection, with complete lasting about 10 s and
  asks winning.
- Every mood maps to one of 22 existing keys and illustrative expressions never manufacture owner state.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-660, ContractName:Plans/DRY_Rules.md#DR-076




### DL-236 - Project Box A And Switching

```yaml
plan_unit_id: DL-236
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. B1–B7: approved option A Tab, with 28 px tab-height box inside the
  40 px title bar (46 px Glass), folder and drawn chevron, hairline, bare project name and ellipsis.
  Path/branch are in the hover tag and two-line menu rows. Projects remains the primary switch shell; this
  box is a secondary entry. A row dispatches cmd.project.switch_active_tab; Ctrl/Cmd+Enter dispatches
  cmd.project.open_in_new_workspace_tab. Ctrl+Shift+P invokes ui.project_switcher.open; All projects opens
  Projects. Badge priority is needs-you > blocked > working > unsaved > calm. The box may wear a second
  chosen chip while its menu is open. Lens and tab ink follow layout before paint with zero exposed wrong
  frames. B7 fixes a cover guard that survives the NieR reboot cover; any different cause is reported with
  evidence. Recommendations follow the decision packet and remain addressable by their decision IDs; X1,
  L1, S9, O11 and G4 are Jared’s explicit rulings.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Box and project rows match option A and use shared family material with distinct blocked/needs-you states.
- Ctrl+Shift+P opens the menu; pick and Ctrl/Cmd+Enter dispatch the two named project commands.
- At ~1390 px and full width, 60 fps recordings show zero exposed frames with a displaced selected chip.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- 60 fps GPU recordings at 860/1024/1280/~1390/1920 px, all ten looks and Reduced Motion; count exposed wrong-chip
  frames
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
- Concepts/project-picker-concepts/opus-5.5/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-661, ContractName:Plans/Commands_System.md#CS-105, ContractName:Plans/UI_Command_Catalog.md#UCC-209




### DL-237 - One Universal Loading Indicator

```yaml
plan_unit_id: DL-237
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. X2, RM1, L1–L8: Pip marks every indeterminate wait: page, panel,
  splash, button, check, sign-in, thinking placeholder; st-working remains item state in rows and tabs.
  Keep meaningful skeletons and determinate bars. Think is the thinking context, Swing the default, Hop a
  short success wait; these are not preferences. Friendly 1.8 s, Glass 2.6 s, Basic 1.7 s, Retro eight
  frames/1.2 s share one clock and scale with Animation speed. Reduced Motion permits only the control
  opacity breath and Pip blink as wait feedback, no travel; under 12 px is still. Needs-you stays the
  loudest loop. NieR routes to Diamond loaders and retains its existing fallback when that part is off;
  static NieR Pip never animates. All loops pause offscreen, hidden and during drags. L8 records duplicate
  menu-sprout implementations as deferred DRY debt. Recommendations follow the decision packet and remain
  addressable by their decision IDs; X1, L1, S9, O11 and G4 are Jared’s explicit rulings. RM1: Reduced
  Motion stays stored per Project, app-wide in effect for the active Project and combined with the OS
  preference. Global inventory applicability is not app-global persistence; the adopted ruling introduces
  no new store or key.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every indeterminate wait uses the shared loader while item state, skeletons and measured progress keep their
  owners.
- Family periods are 1.8/2.6/1.7/1.2 s, scaled by Animation speed; all clocks pause hidden/offscreen/during
  drags.
- Reduced Motion has only permitted wait breath/blink; NieR routes to Diamond/fallback and <12 px stays still.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-662, ContractName:Plans/DRY_Rules.md#DR-077, ContractName:Plans/Settings_System.md#SSYS-010




### DL-238 - Onboarding With Pip

```yaml
plan_unit_id: DL-238
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. O1–O12: replace the troupe and NieR unit with one Pip across every
  look, preserving each family’s own world/material. Expand to every real onboarding route, screen, choice
  and error, about 44 screens and 203 tips. Use bounded transform-only physics, shared gaze and solved
  strings, paused hidden/offscreen/during drags. Retro Dark CRT and Retro Light paper have separate worlds
  and sound kits; approved music is not re-keyed. Live synthesis uses the one sound player with recipe
  metadata, setup-voice and music parts; Reduced Motion never mutes, look hover is silent. The question
  note is the one pm7ob-explainer. Pip marks the current chapter. Ready hands strings to the first Tour
  callout, but O11 defers Tour redesign; Pod 042 remains Tour/Chat narrator. Creating blocks follow
  completed owner phases and never gate Continue/Ready. Recommendations follow the decision packet and
  remain addressable by their decision IDs; X1, L1, S9, O11 and G4 are Jared’s explicit rulings.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All real routes/screens/options/errors have Pip scenes and asked-for tips; no flow is replaced by a demo
  shortcut.
- The chapter rail, faces/gaze, world lifecycle and six recipe kits satisfy F3-663, including Retro split and
  no re-key.
- Creating owner phases determine progress; Reduced Motion is instant, and Tour redesign stays deferred.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- Concepts/onboarding/opus-5.5/tools/scenarios.mjs
- Concepts/onboarding/opus-5.5-pip/tools/sound_levels.mjs
- Concepts/onboarding/opus-5.5-pip/tools/sound_texture.mjs
- 60 fps GPU recordings of rail, faces, world lifecycle and owner-phase Creating; no fabricated native evidence
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
- Concepts/chat-assistant-concepts/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-663, ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/FinalGUISpec.md#F3-599




### DL-239 - Pip Chat Primitive And Parts

```yaml
plan_unit_id: DL-239
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. PC1–PC5, S1–S9: Pip redraws the existing single puppet primitive,
  superseding DL-149 card 6’s still sheets, puppet-native state silhouette and magnifier. Sheets may
  sway/blink/gaze and react; faces map to typed status, never new keys. Checker/Reviewer use glasses; crown
  and hard hat may be gold as role material, not a status tone. Orbit centre has Pip and a tool badge,
  handed over from the thinking placeholder so only one Pip represents a reply. Parts cover chat/onboarding
  only. Full, Quiet, Still, Plain replace Classic; no second primitive. One per-Project
  general.visual.pip-parts row, editor in Settings/wand/title-bar theme menu, never onboarding. Setup voice
  on, app chirps off, setup music on, all under the master sound; NieR parts win overlapping placements. No
  Pip master switch and no switchable brand/tray/app-icon/loader/notification faces. Recommendations follow
  the decision packet and remain addressable by their decision IDs; X1, L1, S9, O11 and G4 are Jared’s
  explicit rulings.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every individual agent uses one Pip primitive in all ten looks, with role/status semantics preserved.
- The 25-part registry and exact four presets match SSYS-056; Full is 24 on, app voice off.
- One Project transaction backs all editor hosts; no Classic/brand/loader switch, extra player or onboarding
  editor exists.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
- Concepts/chat-assistant-concepts/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-594, ContractName:Plans/assistant-chat-design.md#ACD-507, ContractName:Plans/Settings_System.md#SSYS-056




### DL-240 - D1 Processes Naming

```yaml
plan_unit_id: DL-240
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D1: Processes names the tenth chat Activity domain, hover card,
  Activity Detail and status-bar item/tab. Running is only a row state. Tasks remains To-Dos, and
  backgrounded remains an ObservableWork state. Authority: Jared decided D1 on 2026-10-27; this is an
  approved source-thread decision, not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every domain/item/tab label is Processes, with Running only a row state.
- Agents and subagents retain their own domain/owner vocabulary.
- No process is relabelled as a To-Do task.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-505, ContractName:Plans/FinalGUISpec.md#F3-664




### DL-241 - D2 Process Membership

```yaml
plan_unit_id: DL-241
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D2: the thread view lists processes, scripts, servers, watchers,
  browser sessions and scheduled runs started by the thread or its subagents, including
  finished-this-session rows. Subagents stay in Subagents and occur here only as linked owners. Platform
  scope includes Assistant, Orchestrator, Planning Wizard, PRD Builder, Scout and all other owners.
  Authority: Jared decided D2 on 2026-10-28; this is an approved source-thread decision, not an unanswered
  packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Thread filters include only its work and descendants, preserving stable linked owner identities.
- Subagents appear as process owners here and remain in Subagents as agents.
- Platform scope includes Assistant, Orchestrator, Planning Wizard, PRD Builder, Scout and all registered owners.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-505, ContractName:Plans/Shared_Integration_Runtime.md#SIR-054




### DL-242 - D3 Process Grouping

```yaml
plan_unit_id: DL-242
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D3: default thread layout By state orders Needs input, Running,
  Scheduled, Finished this session; By owner is the fallback with many subagents. Optional output
  inspection is bounded head/tail with omitted-line count. Platform live processes sit under their owning
  agent. Authority: Jared decided D3 on 2026-10-28; this is an approved source-thread decision, not an
  unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- By state orders Needs input, Running, Scheduled, Finished this session.
- By owner remains usable with many subagents and preserves agent/process lineage.
- Output inspection enforces head/tail caps and reports omitted lines.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-505, ContractName:Plans/FinalGUISpec.md#F3-664




### DL-243 - D4 Conditional Processes Domain

```yaml
plan_unit_id: DL-243
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D4: show the chat icon only while a process runs or needs input;
  retain it while its hover card or Activity Detail is open, then remove it on close if no live/input work
  remains. Scheduled or finished rows alone never keep the icon. Authority: Jared decided D4 on 2026-10-27;
  this is an approved source-thread decision, not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The icon appears for running/input work and not for scheduled/finished work alone.
- An open card/detail retains the icon until close after the final live item ends.
- Closing the retained view removes the icon only when no live/input item remains.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-533, ContractName:Plans/assistant-chat-design.md#ACD-505




### DL-244 - D5 Status Bar Work Group

```yaml
plan_unit_id: DL-244
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D5: two separated status-bar items between project folder and
  source control, agents/questions and processes/needs input. Numbers is default: glyph/number pairs with
  words on hover; general.interaction.status-bar-words switches to Words. Zero says No agents / No
  processes; stale data shows one stale strip, never a healthy zero. Fold the Orchestrator chip into Agents
  and its group; no CPU/RAM bar item (G4). Authority: Jared decided D5 on 2026-10-27 (initial) and
  2026-10-28 (final); this is an approved source-thread decision, not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Numbers is false/default in the admitted Words row and full labels remain accessible/on hover.
- Agents/questions and processes/needs-input occupy two separated items, with no Orchestrator or CPU/RAM extra
  item.
- Zero reads No agents/No processes; stale data remains explicit rather than healthy zero.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-448, ContractName:Plans/Settings_System.md#SSYS-057




### DL-245 - D6 Three Panel Tabs And Pop Out

```yaml
plan_unit_id: DL-245
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D6 amended by G4/G8: one platform panel has Agents, Processes,
  Resources tabs and desktop Pop out. Agents leads with Questions; Processes leads with Needs input. Side
  by side and the Task manager layout are retired from product; its resource table is in Resources. Home
  panel-tab support stays deferred (G10), no new WorkNodes. One overlay root; desktop pop-out preserves
  scope and selected tab; unsupported clients expose a reason. Authority: Jared decided D6 on 2026-10-28;
  this is an approved source-thread decision, not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The panel has exactly Agents, Processes, Resources tabs, leading with Questions/Needs input in their own
  views.
- Desktop Pop out preserves one view/state in a draggable window.
- Side by side, old Task manager layout and Home work-panel tab are not offered.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-664




### DL-246 - D7 One Work Projection

```yaml
plan_unit_id: DL-246
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D7: status panel is glance/triage; Agents rail is deep lanes, queue
  and lineage; Home Agents board is a filtered agent view. All share OperationalAwareness over
  ObservableWork and registry lineage, one row anatomy, ordering and needs-you set. No surface owns a
  parallel runtime list/count. Authority: Jared decided D7 on 2026-10-28; this is an approved source-thread
  decision, not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every named surface projects the same work identity, count and needs-you set.
- Triage and the deep rail share row anatomy/ordering while keeping their distinct scope and controls.
- A stale/reconciled item cannot become a duplicate healthy row in another surface.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-078, ContractName:Plans/FinalGUISpec.md#F3-452




### DL-247 - D8 Process Group Stop

```yaml
plan_unit_id: DL-247
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D8: composer Stop ends only the reply and holds its queue.
  cmd.work.stop stops one item, a thread or the reviewed platform target set. Stopping an agent includes
  its subagents and their processes. Executor sends SIGTERM then SIGKILL after 3 s to the whole process
  group, bound to pid plus start time. Stopping is pending with its word until exit is observed; already
  ended is idempotent. System services are excluded. Authority: Jared decided D8 on 2026-10-28; this is an
  approved source-thread decision, not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Stop checks pid plus start time/group/generation and targets descendants as one reviewed current set.
- SIGTERM precedes SIGKILL by 3 s, using Windows equivalents, and Stopping remains until observed exit.
- Composer Stop does not kill background processes and platform Stop all excludes system services.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-043, ContractName:Plans/Commands_System.md#CS-106




### DL-248 - D9 Completion Delivery

```yaml
plan_unit_id: DL-248
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D9: per item agent | user | quiet. Scripts/tests/builds default
  Tell the agent; servers/watchers/databases default Notify me. Tell the agent never wakes a user-stopped
  thread. Notify me uses the alert owner, one deduplicated/coalesced notice per item; Quiet makes no
  completion delivery. holds_reply is separate from delivery; completion/input candidates emit no
  unadmitted event. Authority: Jared decided D9 on 2026-10-28; this is an approved source-thread decision,
  not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Scripts/tests/builds default agent; servers/watchers/databases default user; quiet suppresses delivery.
- A completion produces at most one deduplicated/coalesced notice or agent delivery per identity/generation.
- No completion wakes a user-stopped thread, and holds_reply is independent.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#SIR-054, ContractName:Plans/FinalGUISpec.md#F3-461




### DL-249 - D10 Quit With Work

```yaml
plan_unit_id: DL-249
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D10: always ask while live work exists. Default Keep everything
  running on the server; alternative Stop selected work has a target list the user may untick. The window
  is a client, not the work owner. Confirmation is generation-bound; keep-running never terminates server
  work; selected-stop waits for owner exit observations or reports truthful unresolved state. Authority:
  Jared decided D10 on 2026-10-28; this is an approved source-thread decision, not an unanswered packet
  recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Quit with live work defaults to keeping server work and shows an untickable stop target list for the alternative.
- Cancel and keep-running make no work-stop mutation.
- Stop-selected validates the reviewed generation, excludes services and observes exits or reports unresolved
  work.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-665, ContractName:Plans/Commands_System.md#CS-106




### DL-250 - D11 Read Only System Services

```yaml
plan_unit_id: DL-250
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D11: collapsed System services ends the Processes tab, mirrors
  owner status and links System status. No Stop/Restart/Stop all in this feature may affect those services.
  Authority: Jared decided D11 on 2026-10-28; this is an approved source-thread decision, not an unanswered
  packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- System services is collapsed/read-only at the end of Processes.
- Its rows link to System status and expose no stop/restart here.
- Stop all cannot include a system-service identity.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-664




### DL-251 - D12 Resource Samples For All Servers

```yaml
plan_unit_id: DL-251
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D12 amended by G4/G8: Resources is the third tab. Show CPU, memory,
  ports, sortable rows and an inspector grouped by Project/server/environment, including every
  environment/server of each represented Project. Samples are host-owner observations read only while the
  tab is open; closed tabs do not sample. Missing/stale/partial/unavailable/conflicted is explicit. Never
  choose one server implicitly for a CPU/RAM status-bar indicator. Authority: Jared decided D12 on
  2026-10-28; this is an approved source-thread decision, not an unanswered packet recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Resources attributes CPU/memory/ports to explicit Project/server/environment identities across at least two
  environments.
- Closing/hiding the tab stops its sampling subscription.
- Unavailable readings are null with a reason; stale/partial/conflicted data never becomes a synthetic healthy
  zero.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-664, ContractName:Plans/Shared_Integration_Runtime.md#SIR-054




### DL-252 - D13 Safe Process Input

```yaml
plan_unit_id: DL-252
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D13: only a plain yes/no prompt gets quick answers, safe answer
  first. Other prompts use Answer in Terminal, preserving exact terminal/process identity and input
  generation. No synthetic terminal input, secret echo or agent answer to protected prompts. Authority:
  Jared decided D13 on 2026-10-28; this is an approved source-thread decision, not an unanswered packet
  recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Only current plain yes/no requests offer quick answers and the detected safe answer is first.
- Any other prompt reveals the exact owning terminal instead of accepting arbitrary text here.
- Stale prompt generations and protected input refuse without sending input.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#SIR-054, ContractName:Plans/Commands_System.md#CS-106




### DL-253 - D14 Category Glyphs And Pip Agents

```yaml
plan_unit_id: DL-253
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. D14 with X1: processes is a console-framed >_ glyph; robot is the
  existing redrawn antenna category glyph, not an individual agent figure. Live category glyphs breathe on
  2200 ms, cursor/antenna move below needs-you’s motion priority. Panel heads join; list marks stay still.
  Reduced Motion shows the lit rest pose. Every individual agent is the one Pip primitive. Authority: Jared
  decided D14 on 2026-10-28; this is an approved source-thread decision, not an unanswered packet
  recommendation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Processes is the console-framed prompt and robot the category antenna, while each individual agent remains
  Pip.
- Live category heads breathe at 2200 ms below needs-you; list state marks stay still.
- Reduced Motion and hidden/offscreen/drag state retain recognizable rest poses without live loops.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-658




### DL-254 - Chat Detail, Width And Glass Repairs

```yaml
plan_unit_id: DL-254
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. G1–G3/G9: remove Activity Detail Pin and the small transient view.
  Click opens full-size docked detail and keeps it until ×, Esc or that icon closes it. Widen chat to fit,
  then cover transcript at full column height when no more room remains. Message area has no fixed 760 cap,
  preserving centre/page floors and the narrow ladder. History pin remains a different control. Floating
  Glass Activity/attachment/History plates use the persona/model menu plate; context rings must be
  continuous and artifact-free in Friendly/Glass. NieR and narrow forms are designed in this build.
  Recommendations follow the decision packet and remain addressable by their decision IDs; X1, L1, S9, O11
  and G4 are Jared’s explicit rulings. W7/C5 open investigation PM7-C5-CONTEXT-RING: the ring’s correct
  continuous rendering is the requested acceptance outcome. The activity GUI lane must report the
  investigated cause and actual drawing/token fix; no mechanism is claimed by this decision before that
  report.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- No fixed 760 cap or Activity Pin/small transient fallback remains; History pin and centre/page floors survive.
- Glass floating Activity/History/attachment surfaces share the persona/model menu plate.
- Friendly/Glass ring acceptance is recorded with PM7-C5-CONTEXT-RING investigation and later GUI mechanism
  evidence.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-506, ContractName:Plans/FinalGUISpec.md#F3-637




### DL-255 - Work Contracts And Deferred Surfaces

```yaml
plan_unit_id: DL-255
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. G5–G7/G10: stopping→pending, lost→warning, stopped→skipped; keep 22
  status keys. cmd.work.clear_finished hides finished rows in this view only and deletes no owner record.
  ProcessFacts is subordinate, referenced from subject_refs; it does not burden non-process work. Keyboard
  panel shortcuts, OS badge/notification flow implementation and Home panel-tab opening remain deferred; a
  future OS badge consumes the same needs-you projection. D9 in-app notices and existing OS notification
  behavior remain their owners. Recommendations follow the decision packet and remain addressable by their
  decision IDs; X1, L1, S9, O11 and G4 are Jared’s explicit rulings.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Process facts are subordinate and stopping/lost/stopped use pending/warning/skipped without a new key.
- Clear Finished hides only the invoking view and deletes no owner record.
- Deferred Home tab, panel shortcuts and new OS badge rollout remain absent; new candidate events do not emit.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#SIR-054, ContractName:Plans/Commands_System.md#CS-106




### DL-256 - Demo Studio And Evidence Boundary

```yaml
plan_unit_id: DL-256
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Adopted 2026-10-29 for the PM7 build. W8/W9, SND1, LAND1: the one lab-only Demo Studio gains
  Pip/loader/moods/parts/sound, full onboarding errors/tips, project-box widths/states and background
  Activity/Resources/quit scenarios using public owner APIs. No concept toolbar, injected runtime,
  innerHTML hook or duplicate store becomes product. Missing APIs are unavailable. Sound gets Jared’s
  listening review before the lead’s single final landing approval; phase builds are review artifacts.
  Static checks and concept recordings supply no native Rust/Slint, production-event or governance
  certification. No reseal in this task. Recommendations follow the decision packet and remain addressable
  by their decision IDs; X1, L1, S9, O11 and G4 are Jared’s explicit rulings. W8’s concrete lab-only matrix
  is normative in F3-649: all named Pip/loader/sound controls, 42 events/5 loops,
  antigravityOnce/tastebook/≤11-character key/Ask Pip/pipRoughDay, Adjust Pip/presets/recorded pip run,
  five Project states and widths, Busy/No asks/Quiet/Many/Stale feed/After restart/Right-now, all three
  tabs/multiple environments/Quit/Stop all/Numbers-Words and busy/quitWithWork. No generic topic-only demo
  substitutes for that matrix; strings/contrast/OWNED reset and public API availability remain required.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every named F3-649 case/recipe is exposed in the one lab through public APIs or explicitly unavailable.
- Words come from the Studio copy owner, contrast is 4.5:1 and Reset Everything clears only OWNED keys.
- No lab trigger becomes a product preference/command/runtime, and sound awaits Jared listening before landing.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
- Concepts/chat-assistant-concepts/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-649
