# Shard 070: DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Source: `Plans/assistant-chat-design.md`

Source lines: L25343-L25384

Source SHA256: `f11d0bc4f8072003bd4e92a6725b7b60fa2ec0a0b42576547e30867387fad3a1`

---

## DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)

Chat consumes the committed current `ToDoController` projection at the applicable revisions. TDR-012 in `Plans/ToDo_Runtime.md` owns the complete approved migration mapping; historical `chat.plan_todo_updated` stays readable without granting direct writer authority to Chat or changing current GUI behavior.

ContractRef: ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Decision_Log.md

### ACD-462 - Composer Destination And Title Command Owner References

```yaml
plan_unit_id: ACD-462
unit_type: integration_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The existing cmd.chat.composer.destination.set and cmd.chat.thread.regenerate_title declarations
  in UCC-156 are Assistant Chat-owned. Destination selection binds the exact thread and existing
  workflow/participant/Plan-revision/component-list target and names it visibly in composer chrome;
  it does not create or start that workflow or send unrelated unsent input. Explicit title regeneration
  consumes the existing title policy and title-model availability and clears the manual-rename lock
  only through its owner operation. Neither command owns a second ComposerBuffer, collaborative
  runtime, model service or artifact store.
gui_related: true
gui_classification_reason: Composer destination chrome, title actions, disabled state and return focus are visible Chat behavior.
depends_on: [UCC-156, UCC-158, DR-040, DR-041]
unblocks: []
acceptance_criteria:
  - Reuse ComposerDestinationSetRequest/ComposerDestinationSetResult and ThreadTitleRegenerateRequest/ThreadTitleGenerationResult declarations with their existing sole future handler targets.
  - Revalidate the exact originating thread and target at dispatch; changing the active tab must not redirect a pending operation.
  - Keep unsent buffer state isolated and preserve the originating route and focus on failure or owner unavailability.
  - Existing policy, permission, idempotency, title-lock and currentness rules remain authoritative; a production-intent row does not prove a model call, persistence or event.
  - Markdown references in partial Touch Closure rows identify declarations, not materialized machine schemas; exact request/result/error and native execution evidence remain required before operational closure.
validation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, scripts/pm-assistant-contract-check.py, future native destination and title currentness tests]
risk_class: wrong_chat_owner_or_unproved_dispatch
reasoning_tier: high
context_scope: composer_and_title_owner_reference_repair
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: owner_and_touch_accounting_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/UI_Command_Catalog.md#UCC-158]
negative_constraints: [No new command or handler., No second buffer or collaboration owner., No fabricated schema or native proof., No event or readiness admission.]
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-158, ContractName:Plans/Commands_System.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Models_System.md, ContractName:Plans/DRY_Rules.md#DR-040
