# Shard 030: Ledger Compile Addendum - pldg-20260615-001

Source: `Plans/Tools.md`

Source lines: L10784-L10857

Source SHA256: `333a9db901a27d27ad62cd46eeecdb8e717fc03c0fa19b0d29e4925da528e5c3`

---

## Ledger Compile Addendum - pldg-20260615-001

### T-158 - Extract Block Semantics Normalization

```yaml
plan_unit_id: T-158
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools.md extract-style `Fields:`, `Labels and values:`, `Permission rules:`,
  and `Rules:` lists are implementation-ready only when each token is interpreted
  through the section Core rules and the tool owner boundary. Web, LSP, batch,
  caching, provider routing, change-tracking, capability-unavailable, and
  search-then-read behavior must preserve exact field names, operation names,
  provider labels, enum/status values, compatibility aliases, and rule fragments
  without mixing them into one untyped schema list. Tools owns web tool/routing
  semantics and tool-level behavior; assistant-chat-design and FinalGUISpec consume
  chat cards and GUI presentation, and storage/contracts own persistence and event
  envelopes.
gui_related: false
gui_classification_reason: This unit defines tool-routing and schema interpretation; GUI/chat consumers are referenced but do not make Tools the visual owner.
depends_on: []
unblocks: []
acceptance_criteria:
  - Tools implementers can distinguish tool input fields, provider labels, enum/status values, aliases, and lifecycle/routing rules.
  - "`Serper-backed Google-result behavior`, `sources`, `categories`, Firecrawl routing, LSP operation names, and search-then-read behavior remain exact and auditable."
  - Chat and GUI presentation stay in assistant-chat-design and FinalGUISpec rather than becoming Tools-owned display canon.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, Spec Lock, shards, evidence bundles, plan_graph, or auto_decisions are created or updated.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: tools_extract_semantic_loss
reasoning_tier: high
context_scope: tools_extract_block_cleanup
implementation_surfaces:
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: tools_extract_block_semantics_normalization
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0010
  - pldg-20260615-001-part-4-fable-cleanup:atom-0011
  - pldg-20260615-001-part-4-fable-cleanup:atom-0012
  - local:Plans/Tools.md:2039
  - local:Plans/Tools.md:2113
  - local:Plans/Tools.md:2169
preserved_exact_tokens:
  - "Fields:"
  - "Rules:"
  - "Labels and values:"
  - "Serper-backed Google-result behavior"
  - "sources"
  - "categories"
  - "goToImplementation"
  - "ok | partial | unavailable | error"
  - "websearch"
  - "webfetch"
  - "webextract"
  - "webresearch"
  - "webcrawl"
  - "webmap"
  - "search-then-read behavior"
negative_constraints:
  - Do not delete exact tokens or compatibility aliases during cleanup.
  - Do not turn Tools.md into a GUI display owner.
  - Do not move assistant-chat operation-card/question/TODO behavior into Tools.md.
owner_hints:
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```
