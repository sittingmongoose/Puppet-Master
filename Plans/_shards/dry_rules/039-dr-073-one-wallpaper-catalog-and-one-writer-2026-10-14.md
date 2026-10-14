# Shard 039: DR-073 — One wallpaper catalog and one writer (2026-10-14)

Source: `Plans/DRY_Rules.md`

Source lines: L3981-L4029

Source SHA256: `96a4dedb695e637c0c3f1531f685eda8cb179d0944f149f4d8ee0ec6c04d9b79`

---

## DR-073 — One wallpaper catalog and one writer (2026-10-14)

```yaml
plan_unit_id: DR-073
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  One wallpaper registry supplies stable ids, family/order, names, dark/light assets, thumbnails and defaults to
  every wallpaper consumer. Plans/wallpaper_catalog.json is that registry; F3-653 owns presentation, SSYS-054
  owns the single Project choice and SP-333 owns storage. No theme, Settings gallery, onboarding or native
  renderer keeps a competing list or default. Picking through any surface uses the Settings transaction, never a
  wallpaper-specific settings store or duplicate command. The editor and terminal likewise reuse F3-650's
  Customize presentation and F3-642's scheme catalog while their field values retain separate identities.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every wallpaper id/default/asset resolves from the registry and every committed choice uses the same Project transaction.
- A consumer references the owner and cannot silently add a private wallpaper or background mode.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-653
- Plans/Settings_System.md#SSYS-054
- Plans/storage-plan.md#SP-333
- Plans/FinalGUISpec.md#F3-650
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/storage-plan.md#SP-333, ContractName:Plans/FinalGUISpec.md#F3-650
