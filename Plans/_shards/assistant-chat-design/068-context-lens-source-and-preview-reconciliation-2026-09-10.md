# Shard 068: Context Lens Source and Preview Reconciliation — 2026-09-10

Source: `Plans/assistant-chat-design.md`

Source lines: L25221-L25285

Source SHA256: `35379f0b8c2fd1c3ea7425b336f90ed33f8a8f6b5220eba030e8a89af5a8b94c`

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
