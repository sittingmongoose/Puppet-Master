# Shard 068: Context Lens Source and Preview Reconciliation — 2026-09-10

Source: `Plans/assistant-chat-design.md`

Source lines: L25220-L25321

Source SHA256: `6bf649c57bc055f62507d520d529fd20c1e44c0f06e314fb8380880ca167f593`

---

## Context Lens Source and Preview Reconciliation — 2026-09-10

<a id="context-lens-source-and-preview-reconciliation-20260910"></a>

The header Lens trigger opens its existing compact mode chooser on click. When a mode is active,
the selection controls occupy the accepted in-flow Lens row between header and transcript. The
chooser's popover and the expanded controls' in-flow row are different surfaces; there is no new
floating panel over the transcript, and the older popover wording must not be used to restore one.

Mute and Focus continue to apply immediately to the selected messages. Subcompact stages a
preview without changing effective assembly; explicit Apply is required to install the summary.
Cancel changes neither canonical source messages nor effective assembly. The preview binds the
exact thread/project identity, source-message identities and content revisions/hashes, current
shaping revision, and summary identity. Source edits, source deletion/revocation, thread
replacement, rewind, or a changed shaping revision make Apply unavailable until a fresh preview
is produced. A duplicate Apply reuses its original result rather than adding a second summary.

Turn Off exits the active selection interaction, clears transient selection, and releases the
thread's applied Mute/Focus/Subcompact shaping so effective assembly again uses the canonical
messages. The UI discloses the affected counts in a receipt; this is not a silent reset. A retained
summary artifact may remain inspectable but is no longer substituted into effective context.
Individual removal and rehydration remain available when the user wants to reverse only one
operation. Canonical message history remains intact. Agent retrieval and child handoffs consume
the existing Prompt Pipeline shaping contract and source/rehydration references rather than a
Lens-local context or memory store.

A restored branch preserves its project and the applicable shaping/source lineage under the
thread owner; it does not inherit an in-flight preview capability or apply the source thread's
pending summary without fresh binding. Model changes and overlapping document tabs never
resolve a preview using whichever thread happens to be active at confirmation time.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md

```yaml
plan_unit_id: ACD-460
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The Context Lens header mode chooser and in-flow expanded selection row are distinct surfaces.
  Subcompact previews are bound to exact scope, source revisions, shaping revision, and summary
  identity; only explicit current Apply changes effective assembly. Turn Off clears transient
  selection and releases applied shaping with an attributable receipt, never deleting canonical
  history. Individual removal and rehydration can reverse one operation. Retrieval, branches, and child handoffs reuse the Prompt Pipeline owner.
gui_related: true
gui_classification_reason: Lens mode controls, preview validity, Apply/Cancel, and rehydration are visible interactions.
depends_on: [ACD-192, ACD-193, ACD-194, ACD-455]
unblocks: []
acceptance_criteria:
  - Expanded Lens controls push the transcript down; the mode chooser does not become a second context pane.
  - Source or scope drift refuses Apply without mutating history or effective context.
  - Cancel and duplicate Apply preserve the appropriate previous state and stable result identity.
  - Turn Off clears selection and releases applied shaping with disclosed counts while preserving canonical history.
  - Branches retain canonical source and shaping lineage, not a stale pending preview capability.
validation_surfaces: [scripts/pm-assistant-contract-check.py, future registered Lens dispatch and stale-preview fixtures]
risk_class: stale_context_application
reasoning_tier: high
context_scope: context_lens_shaping
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/Prompt_Pipeline.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: contract_reconciliation_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [user_correction:2026-09-10-fix-gaps-and-authority, ACD-192, ACD-193, ACD-194, ACD-455]
negative_constraints:
  - Do not promote a concept extraction algorithm or fixture byte cap to production summarization policy.
  - Do not create a second context, retrieval, or Assistant memory authority.
```

### ACD-461 - Composer Destination And Title Command Owner References

```yaml
plan_unit_id: ACD-461
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
