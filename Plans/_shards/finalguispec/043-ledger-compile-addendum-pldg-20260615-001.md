# Shard 043: Ledger Compile Addendum - pldg-20260615-001

Source: `Plans/FinalGUISpec.md`

Source lines: L24785-L24961

Source SHA256: `78b8bff95c32647029957b604e25f475c268cb881d0ab0b32e0cb7d343f180e9`

---

## Ledger Compile Addendum - pldg-20260615-001

### F3-391 - Extract Block Semantics Normalization

```yaml
plan_unit_id: F3-391
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec extract-style `Fields:`, `Labels and values:`, and `Rules:` lists
  are implementation inputs only after interpretation through the preceding Core
  rules, ContractRefs, owner boundaries, and topic-specific PlanUnits. Tokens that
  are operations, enum/status values, display labels, compatibility aliases,
  lifecycle transitions, persistence hooks, or error states must not be treated as
  canonical data fields merely because they appear under `Fields:`. FinalGUISpec
  preserves the exact GUI/source tokens while routing owned schema and runtime
  semantics back to Tools, assistant-chat-design, Contracts_V0, storage-plan,
  Models_System, and other referenced owner docs.
gui_related: true
gui_classification_reason: The unit clarifies user-visible GUI sections, widgets, cards, panels, labels, and visualizer behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - FinalGUISpec implementers can distinguish canonical data fields from display labels, enum/status values, operation names, compatibility aliases, and behavior fragments.
  - Exact source tokens from affected extract blocks remain preserved as lineage rather than being deleted or smoothed away.
  - FinalGUISpec remains a GUI consumer for tool, chat, storage, contract, provider/model, and runtime owner semantics.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: gui_extract_semantic_loss
reasoning_tier: high
context_scope: final_gui_extract_block_cleanup
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: extract_block_semantics_normalization
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0008
  - pldg-20260615-001-part-4-fable-cleanup:atom-0009
  - pldg-20260615-001-part-4-fable-cleanup:atom-0010
  - pldg-20260615-001-part-4-fable-cleanup:atom-0011
  - pldg-20260615-001-part-4-fable-cleanup:atom-0012
  - local:Plans/FinalGUISpec.md:1700
  - local:Plans/FinalGUISpec.md:3134
  - local:Plans/FinalGUISpec.md:3189
  - local:Plans/FinalGUISpec.md:3324
  - local:Plans/FinalGUISpec.md:3433
preserved_exact_tokens:
  - "Fields:"
  - "Rules:"
  - "Labels and values:"
  - "goToImplementation"
  - "ok | partial | unavailable | error"
  - "Serper-backed Google-result behavior"
  - "sources"
  - "categories"
  - "Q&A loop"
  - "chat.plan_todo_updated"
  - "questionnaire"
  - "single_question"
  - "Mermaid"
  - "inline visualizer"
negative_constraints:
  - Do not delete exact tokens during cleanup.
  - Do not let FinalGUISpec re-own tool, chat, storage, contract, provider/model, or runtime schemas.
  - Do not leave mixed `Fields:` lists as sufficient typed schema when the list contains non-field tokens.
compatibility_only_notes:
  - Remaining source extract lists marked as compatibility/source-lineage token banks preserve exact terms while typed field, label, action, and rule semantics route through Core rules and owner docs.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
```

### F3-392 - Blocked Recovery Addenda Consolidation

```yaml
plan_unit_id: F3-392
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The `Canonical Blocked/Recovery Behavior` section and its PlanUnit coverage are
  the canonical FinalGUISpec GUI summary for blocked and recovery surfaces. Earlier
  inline scheduler, blocked-state, parity, consolidation, and visual-distinction
  addenda headed by `Superseded — see Canonical Blocked/Recovery Behavior` are
  source-lineage and compatibility inputs only; implementers must not read them as
  peer normative sections or infer precedence from addendum order. GUI-specific
  recovery details that supplement the canonical summary remain preserved through
  source lineage and owner-boundary notes.
gui_related: true
gui_classification_reason: This unit defines visible blocked/recovery GUI cards, badges, dashboards, thread status, and recovery affordances.
depends_on:
  - F3-340
unblocks: []
acceptance_criteria:
  - FinalGUISpec blocked/recovery implementation points to a single canonical GUI summary.
  - Superseded addenda headings, dates, labels, aliases, compatibility statements, and exact tokens remain auditable as lineage.
  - Readers and parsers do not treat multiple March 2026 blocked/recovery addenda as coequal live canon.
  - Runtime event, payload, blocked_sequence, allowed_action_id, and safe-point ownership remains with the referenced owner docs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: gui_blocked_recovery_addenda_drift
reasoning_tier: high
context_scope: final_gui_blocked_recovery_consolidation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: final_gui_blocked_recovery_addenda_consolidation
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0013
  - pldg-20260615-001-part-4-fable-cleanup:atom-0014
  - pldg-20260615-001-part-4-fable-cleanup:atom-0015
  - pldg-20260615-001-part-4-fable-cleanup:atom-0016
  - pldg-20260615-001-part-4-fable-cleanup:atom-0018
  - local:Plans/FinalGUISpec.md:2853
  - local:Plans/FinalGUISpec.md:2929
  - local:Plans/FinalGUISpec.md:2950
  - local:Plans/FinalGUISpec.md:2978
  - local:Plans/FinalGUISpec.md:2996
  - local:Plans/FinalGUISpec.md:3043
preserved_exact_tokens:
  - "Scheduler, blocked, and Remediation GUI Addendum (2026-03-08)"
  - "Runtime Scheduler / Blocked-State GUI Parity Addendum (2026-03-09)"
  - "Runtime Blocked, Queue, and Recovery GUI Canonical Alignment (2026-03-09)"
  - "Runtime Scheduler Recovery GUI Consolidation Addendum (2026-03-09)"
  - "Blocked-State Visual Distinction and Recovery UX Addendum"
  - "Superseded — see Canonical Blocked/Recovery Behavior"
  - "Canonical Blocked/Recovery Behavior"
  - "wizard_blocked"
  - "allowed_action_ids[]"
  - "safe points"
negative_constraints:
  - Do not preserve inline superseded blocks as ordinary implementation instructions.
  - Do not drop GUI-specific recovery rules that supplement the canonical summary.
  - Do not let stale addenda re-own blocked/recovery semantics after the canonical GUI summary.
compatibility_only_notes:
  - Plans/chain-wizard-flexibility.md remains the wizard_status / wizard blocked lifecycle consumer/existing-coverage surface; F3-392 does not create a duplicate chain-wizard owner.
  - Earlier addenda headings are compatibility/source-lineage sections and must not be parsed as peer canonical sections.
  - >-
    Anchor aliases for SR-002 resolve preserved old heading tokens to the current
    `Compatibility/source-lineage - ...` headings at local:Plans/FinalGUISpec.md:2853,
    local:Plans/FinalGUISpec.md:2929, local:Plans/FinalGUISpec.md:2950,
    local:Plans/FinalGUISpec.md:2978, and local:Plans/FinalGUISpec.md:3043;
    aliases preserve source lookup only and do not restore peer canonical authority.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
  - Plans/chain-wizard-flexibility.md
```
