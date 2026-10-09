# Shard 029: Wand module presentation grammar single owner — 2026-09-27

Source: `Plans/DRY_Rules.md`

Source lines: L2657-L2780

Source SHA256: `ebc98b23ba4de1d47738b0a154dabd0b537d15c2481f8afa59f0df98236cf600`

---

## Wand module presentation grammar single owner — 2026-09-27

The redesigned wand popups and their in-chat presence add a presentation grammar that must live in one place, beside the chat transcript owners of DR-043.

### DR-044 - Wand Module Presentation Grammar Single Owner

```yaml
plan_unit_id: DR-044
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The wand modules' presentation grammar has exactly one GUI owner, FinalGUISpec F3-566 with
  F3-567 through F3-577, F3-592, F3-594, F3-595, F3-601 and F3-602: the configuration sheet anatomy, sizes and yield
  rules, the plate and the cast plate (its floor and wrap, with the shared parts DR-045 names), kind marks and the agent puppets (one puppet primitive draws
  every agent everywhere, DL-149), run card budgets and width tiers, the one-line receipt, the dock, the one-line
  reply traces and the run view as an editor document (ACD-480). Every implementation builds these
  from one shared set of primitives; a module owner supplies content only and never forks or
  restyles a primitive. Every module's finished trace uses the one receipt grammar, and time,
  cost and token phrases each come from one shared formatter (there is no stand-in phrase, DL-121), with one time-zone
  implementation for the app. Behaviour stays with the module owners (Collaborative_Workflows,
  Back_Seat_Driver, Scheduling_and_Quota_Resume, assistant-memory-subsystem, assistant-chat-design).
  DR-043's owners stand: the transcript family map is ACD-469's and the accent budget is a
  theme-token role rule, and the assistant-turn vocabulary is EP-128's. The wand grammar consumes
  them and never restates them, and DR-043's owners do not restate this grammar.
gui_related: true
gui_classification_reason: "Fixes one owner for the wand modules' presentation grammar."
split_recommended: false
depends_on: [DR-043, F3-566, DL-109]
unblocks: []
acceptance_criteria:
  - "No second sheet grammar, receipt grammar, dock or time formatter exists for a wand module."
  - "No wand-module owner restates the family map, the accent rule or EP-128's vocabulary."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.0, 4.3 (A2-14), 7.14"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/COORDINATION.md (SHA-256 0bbcd8a1649f0e90dd93a5a18966c7a344442a8a99d1bb714afe91f8d168f076)"
  - "CANON-PLAN coordination item DR-044"
preserved_exact_tokens:
  - "F3-566"
  - "DR-043"
  - "ACD-469"
  - "EP-128"
  - "one receipt grammar"
negative_constraints:
  - "Do not restate the wand modules' grammar in a module owner."
  - "Do not restate the family map, the accent rule or EP-128's vocabulary in the wand grammar."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/Executor_Protocol.md#EP-128

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
