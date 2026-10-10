# Shard 030: Concept web fonts share one set of files — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L2724-L2840

Source SHA256: `950505776db9faa02f0de952cdc3a5d83949b0cd2d7ef1038a6463f9e0968200`

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
  concept embeds (Inter, Poppins, IBM Plex Mono and JetBrains Mono, each with its unicode-range script slices, in
  Concepts/chat-assistant-concepts/5.6 Pro/styles.css and pmx-system.css) is carried byte for byte by PMConcept7's
  Concepts/onboarding/opus-5.5/src/fonts or, for JetBrains Mono, src/settings/nier/fonts, where the same files are
  NieR Mode's PM NieR Mono; src/fonts/SOURCE.md lists each file's source and SHA-256, and 5.6 Pro's NieR faces are
  generated from those files (amended 2026-10-09, DL-161). A concept that adds or changes a shared face changes it for
  both, and Concepts/onboarding/opus-5.5/tools/build.py --check fails while a face 5.6 Pro embeds is missing
  from src/fonts byte for byte. Which faces each theme family uses stays F3-430's; this rule only fixes that the
  concepts do not keep two versions of the same face.
gui_related: true
gui_classification_reason: "Keeps the concepts' theme faces identical so both concepts draw the same letters."
split_recommended: false
depends_on: [F3-430, DL-161]
unblocks: []
acceptance_criteria:
  - "Each face 5.6 Pro embeds decodes to a file in Concepts/onboarding/opus-5.5/src/fonts or src/settings/nier/fonts with the same SHA-256."
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

### DR-045 - One Plate Fit Rule, One Cast Grammar With Its Wrap, One Track

```yaml
plan_unit_id: DR-045
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  How a drawing keeps its place as the rows beside it grow is one shared mechanism, not a fix per sheet (DL-154).
  Every plate slot in a wand-module sheet (the four collaboration kinds' cast plates, Scheduling's plates, Back Seat
  Driver's cue plate) is fitted by one rule: the richest mode that fits at scale 1, never past the slot's floor, the
  leanest drawing that fits the slot's width, with the caption only for a slot no drawing fits (F3-601). Every
  collaboration graph, in a setup sheet and at the head of a run view, is drawn by the one cast grammar of F3-595,
  whose wrap mode is the only way a team too wide for one row is drawn; a kind describes its cast and its mode list and
  never draws its own wrapped or scrolling variant. Every run card's and preview's stop track is the one track
  primitive, whose wrapping of eight or more stops (F3-602) serves every kind; a kind supplies its stops and never caps
  or restyles the track itself. The roster's own overflow (its lean steps, then its scroll with the fade) stays the
  one roster rule of F3-566. DR-044's single owner of the wand grammar stands; this rule names the shared parts the
  owner's growth behaviour lives in.
gui_related: true
gui_classification_reason: "Fixes one shared mechanism for plates, cast graphs and tracks that must stay in view as rows grow."
split_recommended: false
depends_on: [DR-044, DL-154, F3-566, F3-595]
unblocks: [F3-601, F3-602]
acceptance_criteria:
  - "No sheet, kind or run view carries its own plate fitting, wrapped cast drawing or track wrapping."
  - "No kind caps the number of stops on its track below its own limit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-154"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/JARED_REQUEST.md, SHA-256 46723a8829ea87fc5e01a261d81e92e32f3f1bc2e8a428af6704b1e3a91229e2"
  - "Concepts/chat-assistant-concepts/5.6 Pro/module-shell.js pmxPlateFit, pmxCastFit and pmxTrack and pmx-system.js fitPlates (concept lineage only)"
preserved_exact_tokens:
  - "DR-044"
  - "F3-595"
  - "one track primitive"
negative_constraints:
  - "Do not give a sheet or a kind its own plate fitting, wrapped graph or track wrapping."
  - "Do not cap a track's stops in a kind below that kind's own limit."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/Decision_Log.md#DL-154, ContractName:Plans/FinalGUISpec.md#F3-601, ContractName:Plans/FinalGUISpec.md#F3-602, ContractName:Plans/FinalGUISpec.md#F3-595
