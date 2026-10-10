# Shard 034: Left rail presentation single owner — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L3132-L3194

Source SHA256: `11109edad77de99e5435ec7d13cd33654af0587b6a16f26eba546597831321c0`

---

## Left rail presentation single owner — 2026-10-09

The left rail's Polish design (DL-162) is a presentation grammar shared by nine panels with nine different owner documents, so it must live in one place.

### DR-057 - Left Rail Presentation Single Owner

```yaml
plan_unit_id: DR-057
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The left rail's presentation grammar has exactly one GUI owner, FinalGUISpec F3-618 to F3-622 and F3-625 with
  F3-472, F3-473 and F3-480, and F3-623's fit rule for the two Source Control strips: the geometry and radii, the shelf tints, the type ladder, the status glyphs and words, plain
  counts, fitting by layout, the rail dropdown style and the motion of each theme family (DL-162). The panel owner
  documents (FileManager, Source_Control_System, Jujutsu_Integration, WorktreeGitImprovement, GitHub_Integration
  and the Forge owners, Containers_Registry_and_Unraid, Automated_Testing_System, Runtime_Artifacts_Panel, and the
  Run & Debug and Agents units of FinalGUISpec) supply content, state vocabularies and behaviour only, and never
  restate, fork or restyle that grammar; a chip, pill or badge named by a panel owner is a status or a count drawn
  through F3-619, the rail's instance of the shell-wide rule against side stripes, emoji and pills (DR-069). Every rail dropdown is the one chat picker primitive with ACD-439's sprout, with no second
  dropdown style and no native select. The rail's status glyphs (F3-619) and the assistant chat's 13 status marks
  (F3-585) each have their own owner and neither restates the other; merging them is an open owner question
  recorded in DL-162.
gui_related: true
gui_classification_reason: "Fixes one owner for the left rail's presentation grammar."
split_recommended: false
depends_on: [DL-162, F3-618, F3-619, F3-620, F3-621, F3-622, F3-625, DL-184]
unblocks: []
acceptance_criteria:
  - "No panel owner document defines its own rail geometry, type size, status capsule, abbreviation rule, dropdown style or motion voice."
  - "Every rail dropdown is the chat picker primitive."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-162"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06"
preserved_exact_tokens:
  - "F3-618"
  - "F3-619"
  - "F3-585"
  - "chat picker primitive"
negative_constraints:
  - "Do not restate the rail grammar in a panel owner document."
  - "Do not add a second dropdown style or a native select to the rail."
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-184): the rail's rule that a chip, pill or badge is drawn as a status or a count is now an instance of the shell-wide DR-069; the rail grammar is unchanged."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/FinalGUISpec.md#F3-618, ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-620, ContractName:Plans/FinalGUISpec.md#F3-621, ContractName:Plans/FinalGUISpec.md#F3-622, ContractName:Plans/assistant-chat-design.md#ACD-439, ContractName:Plans/Decision_Log.md#DL-184, ContractName:Plans/DRY_Rules.md#DR-069
