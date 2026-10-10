# Shard 034: First paint single reader per page — 2026-10-09

Source: `Plans/DRY_Rules.md`

Source lines: L3089-L3141

Source SHA256: `ba9cf0aa7fbf57a2ac900f58bb6007c9f61ee301264b329566297a4c9c4843c3`

---

## First paint single reader per page — 2026-10-09

The assistant chat concept gained a first-paint reader of its own (DL-159, F3-612) on the pattern of PMConcept7's boot paint (F3-468, DL-153). DR-056 already keeps one look store that the first paint only reads; a page with two readers would still let the first frame and the rendered page disagree, so one rule covers both pages and the chat's later port.

### DR-054 - One First-Paint Reader Per Page, Reading The Look Owner's Store

```yaml
plan_unit_id: DR-054
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  A page paints its stored look before its first frame through exactly one first-paint reader (F3-468). The look's
  one store and the reader's read-only access are DR-056's; this rule adds only the count. The reader writes nothing
  but the attributes the look owner's first render writes, so the owner rewrites the same values, and no surface on
  the page adds a reader of its own. The assistant chat keeps its reader (F3-612) only while it is a page of its own;
  when it is ported into PMConcept7, PMConcept7's head boot script is the page's one reader and the chat's reader is
  removed rather than kept beside it.
gui_related: true
gui_classification_reason: "Keeps one first-paint reader per page, reading the look owner's store."
split_recommended: false
depends_on: [DL-159, F3-468, F3-612, DR-056]
unblocks: []
acceptance_criteria:
  - "A page has one first-paint reader, and it writes no look setting and no copy of the theme."
  - "The chat ported into PMConcept7 carries no first-paint reader of its own."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: standard
context_scope: chat_fixes_20261009
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-159"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md, First paint: the stored look from the first frame (concept lineage only)"
preserved_exact_tokens:
  - "F3-468"
  - "F3-612"
negative_constraints:
  - "Do not add a second first-paint reader to a page, or a stored or global copy of the theme for one."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-468, ContractName:Plans/FinalGUISpec.md#F3-612, ContractName:Plans/Decision_Log.md#DL-159, ContractName:Plans/DRY_Rules.md#DR-056
