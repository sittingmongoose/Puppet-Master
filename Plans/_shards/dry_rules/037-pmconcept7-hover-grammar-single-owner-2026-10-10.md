# Shard 037: PMConcept7 hover grammar single owner — 2026-10-10

Source: `Plans/DRY_Rules.md`

Source lines: L3283-L3347

Source SHA256: `ba9cf0aa7fbf57a2ac900f58bb6007c9f61ee301264b329566297a4c9c4843c3`

---

## PMConcept7 hover grammar single owner — 2026-10-10

DL-171 merges PMConcept7's two hover systems into one, so the hover grammar must live in one place and every surface must take it rather than restate it.

### DR-072 - One Hover Grammar For PMConcept7

```yaml
plan_unit_id: DR-072
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  PMConcept7's hover grammar has exactly one owner, FinalGUISpec F3-465: the magnet, the pointer light, the emitted
  glow, the continuous field with its neighbours, the Retro form Raise, the NieR form Lock-on, the Reduced Motion and
  software-rendered forms, and the boundary. It has one engine, the PMH engine (18-hover.js in the concept), riding
  the one merged document pointer-move handler F3-446 owns, and one token set (22-hover.css in the concept), with
  family, kind and family-by-kind rows. There are four kinds, card, row, tile and icon, and every target is one of
  them. A surface opts in, with its class in the engine's lists or `data-pmh` naming a kind on its markup, and opts
  out with `data-pmh="off"` or by sitting inside `[data-pm-hover-exempt]`; it never restates the effect: no surface
  keeps its own hover lift, glow, pointer sheen, magnet, pointer-move listener or animation loop, and a page's own
  `:hover` lift or ring on a target is cancelled rather than layered under the grammar. A surface that needs a
  different strength sets a token for its kind and never forks a layer. The boundary is part of the grammar: tab
  strips, resize dividers and editor and terminal text surfaces are never targets and get at most a static hover tint,
  and icons get no magnet and keep at most their own quiet tint. Tab silhouettes stay with their tab owners (F3-505,
  F3-466), and parallax stays with F3-446.
gui_related: true
gui_classification_reason: "Fixes one owner for PMConcept7's hover grammar."
split_recommended: false
depends_on: [F3-465, F3-446, DL-171]
unblocks: []
acceptance_criteria:
  - "Exactly one hover engine and one hover token set exist in PMConcept7; no surface keeps a second engine, its own pointer-move listener or its own hover animation loop."
  - "Every hover target is a card, row, tile or icon, opted in by class or `data-pmh` and opted out by `data-pmh=\"off\"` or `[data-pm-hover-exempt]`."
  - "No surface owner restates the hover lift, glow, pointer light or magnet; a different strength is a kind token, not a forked layer."
  - "Tab strips, resize dividers and editor and terminal text surfaces are never hover targets and show at most a static tint."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: pm7_hover_grammar
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-171"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-hover-20261009/ENGINE.md, SHA-256 bd3480ac65c053210ebc6d9193480acc3c04c6592276607332817615fd76de5e"
preserved_exact_tokens:
  - "F3-465"
  - "data-pmh"
  - "data-pm-hover-exempt"
  - "card, row, tile and icon"
negative_constraints:
  - "Do not restate the hover effect in a surface owner or give a surface its own hover lift, glow, pointer sheen, magnet or animation loop."
  - "Do not make a tab strip, resize divider or editor or terminal text surface a hover target."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-446, ContractName:Plans/Decision_Log.md#DL-171, ContractName:Plans/FinalGUISpec.md#F3-505, ContractName:Plans/FinalGUISpec.md#F3-466
