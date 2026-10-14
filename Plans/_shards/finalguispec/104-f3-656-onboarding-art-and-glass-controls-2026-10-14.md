# Shard 104: F3-656 — Onboarding art and Glass controls (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L47325-L47388

Source SHA256: `ad093afce0ca7418862e8c4d9bfd4fbb8d1081f379037deb47635caf0ea41254`

---

## F3-656 — Onboarding art and Glass controls (2026-10-14)

```yaml
plan_unit_id: F3-656
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Onboarding's art has connected bodies, limbs, joints and strings through the whole motion, not merely a
  correct resting pose. Basic draws the joints; Friendly uses felt/paper puppets with two-part sleeves and legs
  connected to their shoes; Glass uses ball-jointed crystal marionettes with light through the limbs, layered
  Ribbons-like waves, a glass stage and lens droplets. Waving bends at the elbow and strings remain attached to
  their hooks. Glass captions sit on a shelf of light without capsule boxes, signs are cut-glass plates, and
  Friendly captions are stitched paper cards and squiggles. Existing Retro and NieR scene drawings remain;
  GLY-4's proposed replacement of scene pictures is not admitted without its own answer. The project-name field
  is a large nameplate with centered words and a reserved hint line so typing never shifts the layout. Glass
  main actions, choice rows, step selector, switch, tour bar and callouts consume F3-652. Guided example and
  Teacher tags in practice chat are a small square and plain words on their own line. The chosen onboarding look
  remains in force during Create Project and checks, with no temporary reset of the app's theme; PWIZ-021's
  draft/commit boundary is unchanged. All art captions and Ready states consume F3-654. Motion respects the
  existing skip/end-state and Reduced Motion contracts; connected geometry and meaningful end states remain.
  This amends the presentation of F3-520, F3-521 and F3-600 without adding onboarding commands, steps, approval
  or scene-glyph decisions.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every animated and still pose keeps limbs and strings connected in all looks and both motion modes.
- Name/hint geometry stays stable while typing; Guided example and Teacher are plain labels.
- Create Project never paints a different look, and settled captions/Ready text meet F3-654.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-onboarding-art-glass/README.md, SHA-256 ce5e5e90df41f180e54b89e4fb3fe0087164039728a902aa481cbcc3adacb088
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-11-onboarding-no-pills/README.md, SHA-256 1ab0aedc5910ab03097439cf9cd48da77eb7cefad458ca705a556727d327fd1a
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-520
- Plans/FinalGUISpec.md#F3-521
- Plans/FinalGUISpec.md#F3-600
- Plans/Planning_Wizard.md#PWIZ-021
- Plans/FinalGUISpec.md#F3-654
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-520, ContractName:Plans/FinalGUISpec.md#F3-521, ContractName:Plans/FinalGUISpec.md#F3-600, ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/FinalGUISpec.md#F3-654
