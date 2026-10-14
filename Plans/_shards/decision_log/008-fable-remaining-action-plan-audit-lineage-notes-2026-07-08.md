# Shard 008: FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

Source: `Plans/Decision_Log.md`

Source lines: L14489-L15205

Source SHA256: `17e8823eca6f596abf837eb7466aee2044c0b647ec5d63fbdec1f47271cd5738`

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
  Jared approved both terminal Customize entry points on 2026-10-13. The screen keeps live field editing,
  quick sets, sample trials and truthful hints; All terminals writes the same Project rows as Settings and
  This terminal stays an override. F3-650 owns the screen and F3-642/SSYS-051 its fields and persistence
  boundaries. On 2026-10-14 Jared set terminal padding to zero and required more background choices, a
  smaller removable/customizable bezel, a default look without bezel or curvature, and user-saved look
  presets. F3-642/F3-643/F3-650 record the approved direction and the pending detailed contracts; the
  earlier small catalog and CRT treatment are not final acceptance of those new requirements.
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
  Jared approved the v2/v3 Glass direction and asked for magnification/reflections rather than chromatic
  corruption, calmer transitions, curved slower switches and coherent controls. F3-652 replaces the old
  Glass material constraints. Publishing Glass together with wallpapers remains pending his final review;
  a source-only landing is not publication. His 2026-10-14 review requires the theme-selector lens, placed
  single highlights on entry, coherent Usage/Settings transitions and wallpaper/scroll material, and
  seamless Settings search fields. F3-652 carries these corrections and leaves the Glass Light hover-light
  question and final publication held.
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

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-652

### DL-192 - Wallpapers Are Selectable From Every Look

```yaml
plan_unit_id: DL-192
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared initially approved W1 and retained W2–W4: five wallpapers for each other look, all selectable from
  any look, one choice across looks, each look keeping its own ground by default and NieR returning to its
  scenes through Look's own. Ribbons remains Glass's default. W5 retires the old Glass background row at
  the coordinated Glass/wallpaper publication, held after the 19:25 correction. F3-653, SSYS-054 and
  DR-073 own the result. On 2026-10-14 his review item 11 withdrew Archive, Signal, Fragments, Hatch and
  Flora and replaced that direction with the NieR customizer’s own ink scenes available in the shared
  gallery. His same-day item 18 says the most recent change wins from either control. The approved owner
  contract names city, bunker, desert, forest, park and flooded; a gallery pick sets the shared wallpaper
  id and a NieR background change sets the shared choice to look through its one owner. F3-653/SSYS-054
  own those details; final assets/publication remain held. The five withdrawn prints are no longer an
  accepted selectable set.
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
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Decision_Log.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/DRY_Rules.md#DR-073

### DL-193 - Notification Defaults And Usage Under The Bell

```yaml
plan_unit_id: DL-193
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared approved the built defaults for notification questions 1–6 and explicitly answered question 7: Usage
  notices appear under the bell like every other page. F3-447 owns timing/staging, F3-453 the shared inbox and
  F3-460 material. The unbuilt automatic eight-second terminal-notice dismissal was not adopted by approval of
  built defaults.
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
  with the no-pill-label work. F3-656 owns this presentation; GLY-4 remains a separate unanswered scene-picture
  decision.
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
  rail's solid badges. F3-658 owns the resulting presentation and registry. GLY-4 is separate and unanswered.
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
canonical_text: Jared’s 2026-10-14 review puts the panel grip’s narrow end in the top-right corner, reduces
  excess spacing beside the rail and chat, reaffirms the rail’s visible Chat state and removes its Dashboard
  button. F3-630, F3-637 and F3-042 own those changes. The existing panel/chat commands and dashboard content
  remain; final spacing dimensions are held for the shell/Glass owners. F3-465 and DL-198 separately own the
  reduced central pointer spotlight.
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
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-042
