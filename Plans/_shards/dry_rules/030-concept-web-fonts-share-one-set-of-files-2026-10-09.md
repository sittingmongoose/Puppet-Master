# Shard 030: Concept web fonts share one set of files — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L2722-L2778

Source SHA256: `92b9843cc9445ef32b3be2568251c9b0e7ffccd394cbad6d64d3ce39d2357496`

---

## Concept web fonts share one set of files — 2026-10-09

PMConcept7 and the 5.6 Pro chat concept embed the same theme web fonts; this rule keeps them from forking the files.

### DR-050 - Concept Web Fonts Share One Set Of Files

```yaml
plan_unit_id: DR-050
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The concepts' embedded copies of the theme web fonts are one set of files. Every face the 5.6 Pro chat
  concept embeds (Inter, Poppins and IBM Plex Mono, in Concepts/chat-assistant-concepts/5.6 Pro/styles.css and
  pmx-system.css) is carried byte for byte by PMConcept7's Concepts/onboarding/opus-5.5/src/fonts, whose
  SOURCE.md lists each file's source and SHA-256. A concept that adds or changes a shared face changes it for
  both, and Concepts/onboarding/opus-5.5/tools/build.py --check fails while a face 5.6 Pro embeds is missing
  from src/fonts byte for byte. Which faces each theme family uses stays F3-430's; this rule only fixes that the
  concepts do not keep two versions of the same face.
gui_related: true
gui_classification_reason: "Keeps the concepts' theme faces identical so both concepts draw the same letters."
split_recommended: false
depends_on: [F3-430, DL-161]
unblocks: []
acceptance_criteria:
  - "Each face 5.6 Pro embeds decodes to a file in Concepts/onboarding/opus-5.5/src/fonts with the same SHA-256."
  - "build.py --check reports a missing or changed shared face as a failure."
validation_surfaces:
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: standard
context_scope: concept_web_fonts
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-fonts-20261009/README.md, SHA-256 51df0972bff7f0f909d1cf3438aa1389eaa9e76c3b12b5ac8363814fbded11e4"
  - "Plans/Decision_Log.md#DL-161"
preserved_exact_tokens:
  - "F3-430"
  - "SOURCE.md"
  - "byte for byte"
negative_constraints:
  - "Do not give one concept its own version of a face the other already embeds."
  - "Do not restate which theme family uses which face here; F3-430 owns that."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-430, ContractName:Plans/Decision_Log.md#DL-161
