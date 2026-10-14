# Shard 088: SP-333 — Editor appearance and wallpaper remain Project-owned (2026-10-14)

Source: `Plans/storage-plan.md`

Source lines: L27956-L28021

Source SHA256: `a4d0f9a89ae171184801ffb3e374c7e4179cfc23e07c9c6d520eaa3d033fd4e6`

---

## SP-333 — Editor appearance and wallpaper remain Project-owned (2026-10-14)

```yaml
plan_unit_id: SP-333
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Editor appearance overrides are optional appearance fields inside the existing editor tab state of SP-330,
  within its 16 KB serialized-state bound; no new physical family or buffer copy is created. Absent fields fall
  through to the Project code.editing rows and then F3-651's defaults. The token-colors map is keyed by
  scheme/kind and overlays the Project map per entry; null in a field patch clears that override, never copies
  all effective defaults into the tab. A tab-scoped appearance command returns a bounded receipt and
  saves/readbacks this nonstructural state without a layout revision advance or workspace.layout_changed event.
  All editors and All terminals write only the Project Settings snapshot through SSYS-009; no compatibility
  editor/terminal key authorizes app-global or no-Project persistence. The customizer's remembered tab scope is
  view state separate from the appearance fields; entering from Settings is temporary and does not overwrite it.
  No preview, sample, dock position or hover color is stored. Wallpaper is the same Project Settings snapshot's
  general.visual.wallpaper value; assets are immutable packaged catalog assets, not copied into settings. At the
  publication migration, an old concept wallpaper preference may seed the current Project only when its
  canonical value is absent and its id is valid; an explicit Project choice wins and no other Project is
  modified. Old glass_background_mode:v1 and Mesh/Depth/Minimal do not map to images; they retire to look when
  no new choice exists. Legacy keys are cleared only after successful owner write/readback, never before, and
  no-Project rendering performs no migration write. Import remains SP-331's parsed scheme/asset custody; this
  unit adds no secret, session, event family or governance authority.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Tab override/reset and reload preserve sparse fields and token fallthrough inside 16 KB; an over-bound mutation
  refuses without losing prior state.
- An appearance update emits no structural layout event and never changes another Project.
- Migration preserves an explicit Project choice, does not fan out an old key, and clears legacy data only after verified
  write.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- Plans/storage-plan.md#SP-330
- Plans/storage-plan.md#SP-331
- Plans/Settings_System.md#SSYS-009
- Plans/FinalGUISpec.md#F3-651
- Plans/Settings_System.md#SSYS-054
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/storage-plan.md#SP-331, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/FinalGUISpec.md#F3-651, ContractName:Plans/Settings_System.md#SSYS-054
