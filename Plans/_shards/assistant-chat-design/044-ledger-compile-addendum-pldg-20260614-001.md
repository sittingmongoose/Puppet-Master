# Shard 044: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/assistant-chat-design.md`

Source lines: L21707-L21787

Source SHA256: `6deeed2f549aa72007cf80665d3aa13c76a6632da40b1f4a1a66c20d30288214`

---

## Ledger Compile Addendum - pldg-20260614-001

### ACD-413 - Extensibility And Traceability Recovery Compile Addendum

```yaml
plan_unit_id: ACD-413
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  assistant-chat-design owns chat-facing extensibility entrypoints, command invocation affordances, traceability presentation, and chat handoff
  behavior. Section 7.3 Extensibility surface and Section 23.5 Previously open gaps must be restored as source-backed owner/consumer anchors,
  not as blanket closure claims. Tool, skill, MCP, slash-command, and command catalog owners remain authoritative for their concrete schemas.
gui_related: true
gui_classification_reason: Chat extensibility and traceability are user-visible chat surfaces and command presentation.
depends_on: [ACD-001]
unblocks: []
acceptance_criteria:
  - Section 7.3 names live chat extensibility boundaries without re-owning Tools, Skills, MCP, or Commands schemas.
  - Section 23.5 traceability preserves gap identifiers and dispositions instead of saying all gaps are closed without evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual assistant-chat cross-reference review
risk_class: chat_traceability_loss
reasoning_tier: standard
context_scope: assistant_chat_extensibility
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/Tools.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: chat_traceability_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0019
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0059
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0060
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0061
  - source_ref:chat:next-assistant-chat-newfeatures-cluster
preserved_exact_tokens: ["§7.3 Extensibility surface", "§23.5 Previously open gaps (now closed)", "Tools", "Skills", "MCP", "Commands", "traceability table"]
negative_constraints:
  - Do not claim a gap is closed without a live owner or explicit disposition.
  - Do not move tool, skill, MCP, or command schema ownership into assistant chat.
owner_hints: [Plans/assistant-chat-design.md, Plans/Tools.md, Plans/Skills_System.md, Plans/MCP_Integration.md, Plans/Commands_System.md]
```

### ACD-414 - Stale Newfeatures Reference Retargeting

```yaml
plan_unit_id: ACD-414
unit_type: constraint
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  References from assistant-chat-design into stale or gutted newfeatures sections must retarget to live owner docs. Auto-compact behavior
  routes to Prompt_Pipeline plus chat command entrypoints; terminal, hot-reload, browser, and virtualization references route to FinalGUISpec,
  FileManager, Section15 promoted browser specs, UI_Command_Catalog, and storage owners. W.16 acceptance-criteria identifiers remain stable even
  when numbering has holes.
gui_related: true
gui_classification_reason: This unit affects chat-visible commands plus terminal/browser/hot-reload UI references.
depends_on: [ACD-413]
unblocks: []
acceptance_criteria:
  - Stale newfeatures references are retained only as source-lineage or compatibility cues.
  - Auto-compact references land on Prompt_Pipeline and explicit chat command surfaces.
  - W.16 AC numbering holes preserve existing identifiers rather than renumbering historical acceptance criteria.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - rg newfeatures.md Plans/assistant-chat-design.md
risk_class: stale_reference_drift
reasoning_tier: standard
context_scope: assistant_chat_reference_cleanup
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/Prompt_Pipeline.md, Plans/UI_Command_Catalog.md, Plans/FileManager.md]
node_compile_hint: {mode: stale_reference_retargeting, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0062
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0063
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0064
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0065
  - source_ref:Plans/newfeatures.md:1121
preserved_exact_tokens: ["newfeatures.md", "§3", "§7", "§10 auto-compact", "§15.11", "§15.15", "§15.16", "W.16", "AC-16", "AC-25", "AC-35", "AC-66"]
negative_constraints:
  - Do not revive newfeatures.md as the live owner for auto-compact, terminal, browser, hot-reload, or virtualization behavior.
  - Do not renumber W.16 acceptance criteria merely to close holes.
owner_hints: [Plans/assistant-chat-design.md, Plans/newfeatures.md, Plans/Prompt_Pipeline.md, Plans/UI_Command_Catalog.md]
```
