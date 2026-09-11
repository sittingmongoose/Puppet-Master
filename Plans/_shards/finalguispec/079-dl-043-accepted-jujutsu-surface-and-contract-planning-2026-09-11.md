# Shard 079: DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

Source: `Plans/FinalGUISpec.md`

Source lines: L37504-L38155

Source SHA256: `159a3a21434eed3117a5b340250d28e36fc798eeca5545bffa5d5760462a8f8f`

---

## DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

This addendum compiles accepted planning decisions only. Live semantic owners retain command admission, native behavior, authorization and evidence authority. Existing command schemas and production wiring remain unchanged.

### F3-552 — Operation History Navigation And Descriptions

```yaml
plan_unit_id: F3-552
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Operation History presents named checkpoint markers, grouped actions, recent actions, simple action/time
  filters and receipt-derived descriptions as projections of exact native operations. Source history, operation
  history and Backup history remain separate domains. Labels and grouping metadata never replace native identity
  or establish recovery authority.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- JJI-005
- JJI-011
- JJI-012
unblocks: []
acceptance_criteria:
- Named markers resolve an existing checkpoint and exact operation; renamed or duplicate labels do not retarget
  it. Missing or retained-out targets remain visible as unavailable and are never resolved to the newest operation.
- Group display exposes ordered member operations and completed, failed, cancelled or unknown members; collapsing
  a group does not assert atomic execution or hide partial results. Group undo routes separately through F3-553.
- Recent actions navigate to the exact recorded operation and retain its currentness; supported redo is separately
  labelled and qualified under F3-553, not inferred from the recent list.
- Action and time filters disclose their active bounds, omitted history, empty results and pagination/truncation;
  they do not filter source history or imply a new operation query language.
- Descriptions use existing structured receipts, preserving external/unknown origins and exact identity in details;
  optional display metadata cannot become a native operation ID, state parser or idempotency key.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d005
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-553 — Distinct Group Undo Redo And Selected Operation Reversal

```yaml
plan_unit_id: F3-553
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Verified group undo, supported redo and Reverse selected operation are separate visible workflows
  consuming Jujutsu-owned semantics. Each shows its exact selected operation scope and qualified outcome; none
  is presented as Backup restore, earlier-state browsing, change back-out or a synonym for another recovery action.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- JJI-003
- JJI-005
- JJI-012
- JJI-020
unblocks: []
acceptance_criteria:
- Group undo previews the ordered verified member set and affected identities. Unsupported or partially reversible
  groups cannot promise atomic rollback; failure stops dependent work and exposes each completed, remaining and
  unknown member plus explicit recovery guidance.
- Redo is available only when the adapter proves the supported inverse/history relation for the exact current
  operation. Intervening edits, branching, expired support or an invalidated redo chain disable it with the reason
  and require a fresh preview; it never guesses the most recent target.
- Reverse selected operation previews the selected operation effect against current state and possible overlap/conflicts
  from later work. Unsupported root or merge operations are rejected with the exact-version qualification reason;
  selection never becomes sequential undo implicitly.
- Confirmation binds the reviewed native identities; stale state invalidates it. Work, cancellation, partial failure,
  recovery_required and effect_unknown remain visible through owner receipts; navigation away cannot fabricate
  completion.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-554 — Managed Rewrite Preview And Earlier State Browsing

```yaml
plan_unit_id: F3-554
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Rewrite preview and apply use an explicitly managed lifecycle, whereas Browse earlier state is
  a read-only historical graph/tree/bookmark context. These remain separate actions and neither is operation restore
  or Backup alignment.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- JJI-003
- JJI-005
- JJI-015
- JJI-010
- F-083
unblocks: []
acceptance_criteria:
- Starting rewrite preview discloses that native preview may write objects and have external effects; it is never
  labelled a read-only dry run. Show the preview identity, base operation, affected identities, effects and lifecycle/cleanup
  status before separate Apply.
- Apply binds the exact reviewed preview, current expected native operation and affected scope, revalidates authorization
  and safety, and refuses stale or incompatible previews. Cancel, expiry, abandoned preview or cleanup failure
  stays visible; closing the panel does not silently apply or claim cleanup.
- Earlier-state browsing pins graph, tree, content and bookmark projections to one exact historical operation
  with a persistent Earlier state label and explicit Return to current action. Current and historical selections
  cannot be mixed into an unlabelled comparison.
- Missing retained objects or unavailable historical queries show incomplete/unavailable data rather than current
  content; entering, navigating or leaving the mode never restores, snapshots or changes the current workspace.
  Mutation controls remain unavailable in the browsing context.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-555 — Guided Change Editing And Structured Partial Selection

```yaml
plan_unit_id: F3-555
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Change editing exposes qualified guided convergence, duplication, merge creation, absorption,
  change back-out and previewed drag actions, plus a structured hunk selection interface. All consume exact native
  change/commit/operation/workspace identities and the same semantic owner regardless of pointer, keyboard or
  internal automation caller.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- JJI-003
- JJI-016
- JJI-018
unblocks: []
acceptance_criteria:
- Convergence lists the divergent immutable versions, selected destination and conflicts; unsupported adapter
  heuristics or ambiguous selection are explained and cannot dispatch.
- Duplicate previews source immutable version, destination and newly created identity/descendant behavior; success
  displays the actual new identity from the receipt.
- Merge creation previews the exact ordered parent set and resulting conflicts; missing or stale parents block
  apply rather than substituting current selection.
- Absorption previews proposed per-hunk destination changes and ambiguous/unmatched portions; only the reviewed
  eligible selection is applied and unresolved portions remain visible.
- Back out a change previews its compensating change, scope and conflicts and retains subsequent history; it is
  labelled separately from undo, reverse-selected-operation and restore.
- Drag and keyboard equivalents select the same admitted semantic operation and preview. Multi-selection order,
  insertion target and descendant effects are explicit; invalid targets reject, autoscroll preserves selection,
  and no pointer gesture directly mutates history.
- Structured hunk listing/selection preserves native bindings, exact file/content kind and range identity, repeated/ambiguous
  matching, truncation and stale-input state. A content hash alone cannot authorize apply; unsupported binary
  or incomplete selections are rejected without silently widening to the whole file.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-556 — History Comparison Graph Assistance And Review Correspondence

```yaml
plan_unit_id: F3-556
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: History views add exact version-to-version comparison, focused change evolution, bounded attribution/file
  history, conservative rewrite-aware review marks, explicit lane priorities, native query assistance and pinned
  comparison details. These consume SourceGraph and Jujutsu owner truth without creating another graph or diff
  engine.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- JJI-017
- SCS-019
- SCS-020
unblocks: []
acceptance_criteria:
- Version comparison displays both immutable versions and its parent-normalization basis; unrelated, missing or
  ambiguous selections remain explicit and cannot silently compare current versions instead.
- Evolution navigation exposes known predecessor/successor rewrites, abandonment and visibility gaps while retaining
  distinct operation-history and Backup routes.
- Attribution and file history are bounded/cancellable reads showing revision, pagination/truncation, rename-history
  limitations and unavailable origins; unmeasured performance is not presented as proven.
- Review marks retain their original immutable reviewed-version evidence and display derived correspondence only
  when the Source Control owner proves an exact unambiguous match under SCS-020; ambiguous, stale and orphaned
  marks remain visibly unresolved. Local correspondence never transfers hosted approval or marks changed content
  reviewed.
- Lane priorities consume a qualified native priority expression intersected with the visible bounded graph. Hidden
  revisions do not create phantom lanes or escape query/render bounds; invalid expressions retain an explained
  prior layout.
- Query assistance uses version-qualified native syntax, previews validation/errors and preserves query bounds,
  active filters and elision. It is history selection assistance, not an unbounded shell or operation query language.
- Pinned comparison retains exact endpoints, selected-change details and stale/missing identity state across navigation.
  Physical untracked-file projections remain distinct from Git staging and from the pinned revision.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d015
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d016
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-557 — Read Only Browsing Workspace Adoption And Visibility

```yaml
plan_unit_id: F3-557
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Repository/workspace surfaces distinguish supported read-only browsing, explicit adoption/repair,
  and hide/unhide visibility. Compatibility, identity and mutation authority come from their owners; a hidden
  workspace remains a real workspace.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- JJI-010
- JJI-014
- F-083
unblocks: []
acceptance_criteria:
- Supported read-only mode labels storage and capability limitations and disables mutation. If native migration,
  indexing or reconciliation would write the protected repository, the read path uses only a proven owner-approved
  isolated alternative or reports unsupported; merely opening it cannot repair it.
- Adoption/repair previews discovered and intended repository/workspace/path mappings and any migration effects.
  Identity collisions, incompatible versions and path mismatches are explicit; only the reviewed mapping can be
  applied, with receipts and no silent workspace identity replacement.
- Hide removes only the workspace from the ordinary list and offers Show hidden plus Unhide. Hiding neither deletes
  nor abandons, unregisters, stops work, releases ownership or changes retention; active/owned work and relevant
  warnings remain discoverable.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-558 — Qualified Conflict Publication Bookmark Resolution And Review Stacks

```yaml
plan_unit_id: F3-558
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Publishing remains separate from local history. Unresolved-conflict publication is blocked by
  default; an advanced path exists only for qualified compatible targets. Guided bookmark resolution must clarify
  every alternative. Stacked reviews are introduced one explicitly supported forge workflow at a time, and additional
  review services require a concrete user workflow independent of local history.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- PS-138
- JJI-019
- FGI-016
- FGI-017
unblocks: []
acceptance_criteria:
- Default Publish blocks unresolved conflicts. Advanced availability requires exact adapter/target compatibility
  evidence, current target-bound authority and a preview disclosing unresolved content and downstream limitations;
  unknown compatibility or an unqualified target stays blocked.
- A conflicted-bookmark picker displays all relevant local and remote target alternatives with immutable identities,
  divergence/conflict state and before/after effect. It must reuse admitted bookmark mutations and may not hide
  alternatives or choose a winner by label or recency.
- The one supported review-stack workflow identifies provider instance, stack order, published revisions and review/base
  links. Per-step publication and review creation/update receipts distinguish partial success and effect_unknown;
  retries reconcile existing effects rather than duplicating reviews.
- After rewriting a published stack, stale review mappings require fresh qualified preview. Additional providers
  remain unavailable until a concrete supported workflow, authentication/identity and recovery contract exist;
  missing hosting support never blocks independent local history.
- Git transport readiness and hosting API availability/permissions remain separate. A successful push never proves
  review creation or overall stack completion.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-559 — History Maintenance And Sanitized Diagnostic Surfaces

```yaml
plan_unit_id: F3-559
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: History growth diagnostics, explicit history maintenance, sanitized operation export and an optional
  technical command log consume owner facts. Ordinary browsing does not initiate maintenance or export, and technical
  output never establishes repository state.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- PS-139
- JJI-013
- SCS-021
unblocks: []
acceptance_criteria:
- Growth diagnostics disclose measured/unknown size and retention scope. Explicit maintenance previews affected
  recovery history, holds, Backup capture/GC fences and irreversible consequences; blocked fences or current work
  disable it, and partial/recovery/unknown outcomes remain visible.
- Export is explicit and bounded to a reviewed operation scope and destination; show sanitization/content/path
  exclusions and any incomplete export. Export success requires the owner artifact receipt, not a download gesture
  or raw log dump.
- The optional technical log displays secret-free command identity correlated with typed receipts, filters and
  bounded retention/truncation. Sensitive paths/content follow permission/redaction policy; stdout/stderr and
  process exit cannot be presented as authoritative state or resolution.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### F3-560 — Line Ending And Backup Completion Policy Presentation

```yaml
plan_unit_id: F3-560
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'Editor and Backup consumers present their owner policies truthfully: new newline boundaries use
  the nearest existing ending while ordinary Save preserves existing boundaries; isolated restore drills rebuild
  correctness-critical indexes with captured indexes only an optional speed aid; completing missing repository
  data is a separately authorized workflow.'
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- F3-529
- PS-139
- F-082
- BRS-021
- BRS-022
unblocks: []
acceptance_criteria:
- No Source Control save or diff action normalizes surviving line endings. Mixed-ending content and any explicit
  normalization route consume FileManager policy; no new Source Control setting or command is created for this
  policy.
- Restore drill progress distinguishes index rebuild from optional cache reuse and from missing native data. A
  captured index is never displayed as proof of closure or restore readiness.
- Missing-data state offers a separate completion preview showing missing scope, selected remote, authorization/credentials,
  expected cost/size where known and unknowns. Browse/verify never starts completion implicitly; cancellation,
  partial completion and still-missing dependencies remain explicit, and completion never implies restore activation.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d020
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d034
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```
