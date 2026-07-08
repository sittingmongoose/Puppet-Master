# Shard 032: Ledger Compile Addendum - pldg-20260615-001

Source: `Plans/Tools.md`

Source lines: L10923-L11008

Source SHA256: `cbbb06892d4d407c00bc79c41c49c4f000d8f7ba4054dc8a8a0c86ae8e39819c`

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
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
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
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: tools_extract_block_semantics_normalization
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0008
  - pldg-20260615-001-part-4-fable-cleanup:atom-0009
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
compatibility_only_notes:
  - Remaining source extract lists marked as compatibility/source-lineage token banks preserve exact terms while typed field, label, action, and rule semantics route through Core rules and owner docs.
owner_hints:
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
```
