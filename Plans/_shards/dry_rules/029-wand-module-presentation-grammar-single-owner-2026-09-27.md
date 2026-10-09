# Shard 029: Wand module presentation grammar single owner — 2026-09-27

Source: `Plans/DRY_Rules.md`

Source lines: L2657-L2722

Source SHA256: `9ce78fdaab144d9c473fc7671c9148b29d7fb19d4ed60abfe73235a6f135bf4d`

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
