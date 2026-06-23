# Shard 024: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/FileManager.md`

Source lines: L4265-L4436

Source SHA256: `b8d70c0cf158febde60c6aa84a50f9eb865d3f45474e6710a5c569c70e3d0b4d`

---

## Ledger Compile Addendum - pldg-20260614-002

### F-068 - Shared Mutation Session Actions

```yaml
plan_unit_id: F-068
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager edit, rename, delete, duplicate, patch, preview-edit, and generated-output apply actions
  must open or join a FileSafe mutation session before mutation. The UI derives save, apply, discard,
  stage, retry, request approval, resolve conflict, open diff, and rollback actions from session state,
  permission result, conflict policy, preview trust, watcher snapshot, and degraded/offline/LSP state.
gui_related: true
gui_classification_reason: FileManager mutation actions, buttons, diffs, and conflict controls are user-visible UI behavior.
depends_on: [F-067, F2-188]
unblocks: []
acceptance_criteria:
  - Mutating FileManager actions join a FileSafe mutation session before side effects.
  - UI actions derive from structured session state and guard inputs rather than local ad hoc checks.
  - Preview-edit and generated-output apply flows share the same mutation-session model as user/agent edits.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: filemanager_mutation_bypass
reasoning_tier: high
context_scope: filemanager_mutation_session_actions
implementation_surfaces: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: filemanager_mutation_session_actions, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0082
  - pldg-20260614-002-part-3-fable-cleanup:atom-0083
preserved_exact_tokens: ["rename/delete/duplicate", "patch/conflict handling", "FileManager mutation UI derives actions from structured session"]
negative_constraints:
  - Do not implement FileManager mutating actions without FileSafe session state.
  - Do not derive conflict or rollback controls from unstructured error messages.
owner_hints: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
```

### F-069 - Operation Conflict Lifecycle

```yaml
plan_unit_id: F-069
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager operations use controlled `operation_type` values for create, edit, rename, delete,
  duplicate, move, patch, and bulk. Compare is a read-only comparison session linked to mutation
  sessions rather than a file-changing operation. Mutation sessions use explicit `conflict_policy`
  values `fail_if_changed`, `auto_merge_if_clean`, `require_review`, `staged_preview_only`, and
  `force_with_backup`, plus status values `draft`, `validating`, `pending_review`, `applied`,
  `conflicted`, `rolled_back`, `failed`, and `abandoned`. Conflict payloads carry conflict_id,
  target refs, baseline/current/proposed refs, conflict_kind, affected ranges or paths,
  actor/runtime_identity, recoverability, allowed_action_ids, selected resolution, evidence refs,
  and rollback refs. FileManager operations must use this lifecycle before mutating files.
gui_related: true
gui_classification_reason: Operation status, conflict resolution, compare, patch, and bulk controls are user-visible FileManager behavior.
depends_on: [F-068]
unblocks: []
acceptance_criteria:
  - "`operation_type` is limited to create, edit, rename, delete, duplicate, move, patch, and bulk."
  - "`conflict_policy` is limited to fail_if_changed, auto_merge_if_clean, require_review, staged_preview_only, and force_with_backup."
  - "Operation status includes draft, validating, pending_review, applied, conflicted, rolled_back, failed, and abandoned."
  - Compare remains a read-only comparison session linked to mutation sessions.
  - Conflict payloads identify target, baseline/current/proposed refs, conflict kind, recoverability, actions, resolution, evidence, and rollback.
  - Create, edit, rename, delete, duplicate, move, patch, and bulk operations do not use ad hoc conflict state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: file_operation_conflict_drift
reasoning_tier: high
context_scope: filemanager_operation_conflict_lifecycle
implementation_surfaces: [Plans/FileManager.md, Plans/FileSafe.md]
node_compile_hint: {mode: filemanager_operation_conflict_lifecycle, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0085
  - pldg-20260614-002-part-3-fable-cleanup:atom-0086
preserved_exact_tokens: ["operation_type", "create", "edit", "rename", "delete", "duplicate", "move", "patch", "bulk", "compare", "read-only comparison session", "conflict_policy", "status", "fail_if_changed", "auto_merge_if_clean", "require_review", "staged_preview_only", "force_with_backup", "draft", "validating", "pending_review", "applied", "conflicted", "rolled_back", "failed", "abandoned", "operation UI/actions", "controlled operation_type", "comparison-session", "mutation session contract"]
negative_constraints:
  - Do not mutate files after a conflict without selected resolution and rollback refs.
  - Do not leave operation_type or conflict_policy as unconstrained strings.
  - Do not treat compare as a mutation that changes files.
  - Do not let bulk operations bypass per-file conflict, evidence, rollback/recovery, and refresh state.
owner_hints: [Plans/FileManager.md, Plans/FileSafe.md]
```

### F-070 - Degraded State And Preview Trust

```yaml
plan_unit_id: F-070
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager surfaces must model degraded state and preview trust explicitly. Mutation sessions include
  controlled `environment_state` and `trust_state` fields for `online`, `offline`,
  `remote_unavailable`, `cache_stale`, `lsp_ready`, `lsp_degraded`, `watcher_active`,
  `watcher_suspended`, `external_change_detected`, `preview_trusted`, `preview_untrusted`, and
  `fallback_required`. UI actions, allowed operations, refresh/reconcile behavior, preview fallback,
  open-in-editor, symbol navigation, build/debug affordances, warning surfaces, evidence refs, recovery
  paths, and trust warnings derive from those structured states.
gui_related: true
gui_classification_reason: Degraded banners, preview trust, refresh, symbol navigation, and build/debug affordances are user-visible FileManager UI.
depends_on: [F-068]
unblocks: []
acceptance_criteria:
  - FileManager exposes structured degraded-state and preview-trust inputs.
  - "`environment_state` and `trust_state` preserve the accepted state tokens, including remote_unavailable, cache_stale, lsp_ready, lsp_degraded, watcher_active, watcher_suspended, external_change_detected, preview_trusted, preview_untrusted, and fallback_required."
  - Watcher, remote SSH, offline cache, LSP, symbol-index, preview, and build/debug conditions drive actions and disclosures.
  - Preview fallback and trust warnings are not inferred from file extension or path alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: filemanager_degraded_state_drift
reasoning_tier: high
context_scope: filemanager_degraded_preview_trust
implementation_surfaces: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: filemanager_degraded_preview_trust, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0088
  - pldg-20260614-002-part-3-fable-cleanup:atom-0089
preserved_exact_tokens: ["environment_state", "trust_state", "online", "offline", "remote_unavailable", "cache_stale", "lsp_ready", "lsp_degraded", "watcher_active", "watcher_suspended", "external_change_detected", "preview_trusted", "preview_untrusted", "fallback_required", "allowed operations", "refresh/reconcile actions", "warning surfaces", "evidence refs", "recovery paths", "remote SSH/LSP", "symbol-index fallback", "file-watcher behavior", "remote cache/offline/LSP degraded states", "preview trust/fallback"]
negative_constraints:
  - Do not render stale or sandboxed previews as trusted live source.
  - Do not hide watcher/LSP/symbol-index degradation behind generic file errors.
  - Do not allow visible FileManager actions to ignore environment_state or trust_state.
owner_hints: [Plans/FileManager.md, Plans/FileSafe.md, Plans/FinalGUISpec.md]
```

### F-071 - Workspace Adjunct Sessions

```yaml
plan_unit_id: F-071
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  FileManager workspace adjunct sessions cover terminal tabs, build/debug sessions, compare sessions,
  symbol-index sessions, remote SSH/LSP sessions, session-view restore, file-tree refresh, and bulk
  operation sessions. Each adjunct session carries session_id, workspace/worktree scope, actor/runtime_identity,
  source_surface, remote endpoint identity, terminal/build/debug kind, command/task identity,
  environment/credential boundary, target refs, lifecycle state, degraded/trust inputs, output/artifact
  refs, evidence refs, restore token, restore scope, recovery/cleanup policy, and owning surface so
  FileManager can restore views without re-owning terminal, LSP, build, debug, or remote transport internals.
gui_related: true
gui_classification_reason: Workspace tabs, session restore, terminal/build/debug controls, file-tree refresh, and bulk operation views are user-visible UI.
depends_on: [F-067, F-070]
unblocks: []
acceptance_criteria:
  - Adjunct sessions have identity, source_surface, remote endpoint identity, terminal/build/debug kind, command/task identity, environment/credential boundary, lifecycle, degraded/trust inputs, output/artifact refs, evidence refs, restore scope, recovery/cleanup policy, and owner surface.
  - Session-view restore does not imply FileManager owns terminal, LSP, build/debug, or remote transport behavior.
  - File-tree refresh and bulk operations use adjunct session state instead of untracked local UI state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: filemanager_adjunct_session_drift
reasoning_tier: standard
context_scope: filemanager_workspace_adjunct_sessions
implementation_surfaces: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/LSPSupport.md]
node_compile_hint: {mode: filemanager_workspace_adjunct_sessions, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0091
  - pldg-20260614-002-part-3-fable-cleanup:atom-0092
preserved_exact_tokens: ["remote SSH/LSP sessions", "terminal tabs", "build/debug integration", "session-view restore", "first-class workspace adjunct sessions", "project/worktree identity", "mutation sessions", "session_id", "actor/runtime_identity", "source_surface", "remote endpoint identity", "terminal/build/debug kind", "command/task identity", "environment/credential boundary", "lifecycle status", "output/artifact refs", "restore scope", "recovery/cleanup policy", "file-tree refresh", "bulk operations"]
negative_constraints:
  - Do not let FileManager re-own terminal, LSP, build/debug, or remote transport internals.
  - Do not restore workspace views from unversioned UI-only state.
  - Do not hide credential boundary, restore scope, output/artifact refs, or recovery/cleanup policy from the workspace adjunct session model.
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/LSPSupport.md]
```
