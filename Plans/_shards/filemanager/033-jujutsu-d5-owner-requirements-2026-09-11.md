# Shard 033: Jujutsu D5 Owner Requirements (2026-09-11)

Source: `Plans/FileManager.md`

Source lines: L5115-L5274

Source SHA256: `33eee4047344b9fac5d0f051c94db21cb0e31b39f9b4389d3e6bacb538e16c13`

---

## Jujutsu D5 Owner Requirements (2026-09-11)

These accepted requirements consume the native owner in `Plans/Jujutsu_Integration.md` and the shared Source Control boundary; planning acceptance is not runtime or readiness evidence.

### F-082 - Nearest Existing Newline Policy

```yaml
plan_unit_id: F-082
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: For newly inserted newline boundaries in mixed-ending text, the shared editor buffer uses the nearest
  existing line ending. Ordinary Save preserves surviving existing CRLF, LF and CR boundaries exactly. This is a
  required editing policy. The existing optional paste normalization remains limited to the inserted paste transaction
  and does not normalize surviving surrounding file content or reopen ordinary Save behavior.
gui_related: false
gui_classification_reason: Defines safety, persistence, or verification behavior rather than visual presentation.
depends_on:
- F-008
- F-027
unblocks: []
acceptance_criteria:
- Insertion and replacement in mixed CRLF/LF/CR fixtures inherit the nearest surviving existing boundary for each
  newly created newline; surviving boundaries outside the edited range are byte-preserved.
- Ordinary Save with no edit preserves the complete existing line-ending sequence; save after a local edit changes
  no surviving boundary outside that edit.
- Paste with normalization off preserves pasted endings; when the existing optional normalization is selected, newly
  normalized boundaries follow the nearest-existing policy without normalizing the whole buffer.
- The policy does not change shared-buffer undo grouping, explicit Save, dirty-state preservation after failure,
  encoding limits, or FileSafe write authority.
validation_surfaces:
- future focused F-082 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_filemanager
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d020
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/FileManager.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

### F-083 - Native Historical And Read-Only File View Consumers

```yaml
plan_unit_id: F-083
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: File Manager and editor consume Jujutsu-owned read-only browsing, earlier-state browsing, workspace
  adoption/hide state, grouped recovery, supported redo, reverse-selected-operation and managed rewrite previews
  through the shared Source Control route. Historical and preview content carries exact Project, repository, workspace,
  selected operation/revision and file identity and remains distinct from the current path-backed writable buffer.
  The shared buffer authority retains editor-local undo and Save; native operation recovery never becomes editor
  Ctrl+Z.
gui_related: true
gui_classification_reason: Defines visible editor identity and state behavior.
depends_on:
- F-008
- F-019
- F-055
- F-081
unblocks: []
acceptance_criteria:
- Earlier-state graph/tree/bookmark navigation and file opens preserve the chosen operation context. Missing/pruned
  targets and unsupported reads remain visible; browsing never restores, switches or writes the active workspace.
- Read-only and preview file views cannot silently snapshot, migrate, reconcile or update original native metadata.
  Any supported disposable indexing or preview storage follows FileSafe and storage owners.
- Adoption/repair refreshes file routes only after the native owner confirms the explicit identity mapping and applied
  state. Hide/unhide changes visibility only and preserves dirty buffers, native workspace registration and file
  identity.
- Group undo, redo, reverse-selected-operation and preview apply use the native transaction owner with currentness
  and authorization checks; affected current buffers refresh only on confirmed applied state, preserve recovery
  attention on failure and explain changed undo history.
- Preview and historical views cannot silently replace the contents, dirty state, save target, file-watch identity
  or undo branch of a current ordinary file tab.
validation_surfaces:
- future focused F-083 acceptance fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: jujutsu_d5_filemanager
implementation_surfaces:
- Plans/FileManager.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- No runtime, event admission, physical storage-family admission, WorkNodes, NodeSeeds, automatic activation, or
  readiness proof follows from this PlanUnit.
owner_hints:
- Plans/FileManager.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-043, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md

### F-085 - Exact File And Buffer Compare Read Results

```yaml
plan_unit_id: F-085
unit_type: integration_contract
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The File owner produces a versioned internal compare read result for the exact selected path-backed file or
  shared editor buffer, binding the original Backup operation and opaque selected target revision to actual
  authorized content under the protocol below. Ordinary File targets require no Source Control identity.
gui_related: false
gui_classification_reason: Defines internal read custody and revision binding without changing presentation.
depends_on: [F-008, F-026, F-058, F-059, BRS-030]
unblocks: []
acceptance_criteria:
  - Dirty buffer content cannot be replaced by saved or disk content, and a tab or group is not buffer identity.
  - Exact selected identity, original operation, topology and owner-issued opaque version survive comparison and replay.
  - Missing, stale, denied, unsupported or unavailable reads carry no invented resolved content.
  - Native source custody, current read permission and race fences remain mandatory independently of schema validity.
validation_surfaces: [Plans/backup_compare_result_contracts.schema.json, Plans/backup_compare_result_contract_fixtures.json, tests/test_pm_backup_compare_results.py]
implementation_surfaces: [Plans/FileManager.md, future File owner compare read producer]
risk_class: source_history_identity_safety_or_false_recovery
reasoning_tier: high
context_scope: backup_exact_compare_read
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Backup_Restore_System.md#BRS-030, Plans/FileManager.md#F-008, Plans/FileManager.md#F-026]
preserved_exact_tokens: [cmd.backup.file.compare, target_revision, BackupBrowseOperation]
negative_constraints: [No autosave or write authority., No current-focus fallback., No physical storage family or runtime readiness admission.]
owner_hints: [Plans/FileManager.md, Plans/Backup_Restore_System.md, Plans/Permissions_System.md, Plans/FileSafe.md]
```

The `file_compare_read_result` definition in `Plans/backup_compare_result_contracts.schema.json` is the File-owned internal producer output. It binds the original `backup_operation_binding`, exact selected `target_ref` and opaque `target_revision`, and actual resolved Project, Server, Host, Environment, source location and topology generation. Successful file reads name the concrete file identity and its owner-issued content version; successful buffer reads additionally name the shared-buffer identity and buffer version. The File owner validates the selected revision against its own identity/version source. No numeric, UUID, Git, tab or line-coordinate grammar is imposed on those opaque tokens.

The content descriptor binds an owner-custodied immutable content reference, its exact version, representation reference and representation version. The representation owner defines the actual bytes or immutable buffer view, including encoding and line-ending preservation; rendered text or a digest does not replace that custody. Content remains pinned throughout the read under the actual owner's race fence. Permission, FileSafe, resolved-path and currentness evidence references are resolved by their real owners, including fail-closed canonical-path authorization; neither caller flags nor matching strings authenticate them. A denied, stale, missing, unsupported or unavailable result preserves the original selection and reason without supplying a fabricated file, empty content, newer buffer or disk fallback.

These internal outputs are nonpersisted. Separately admitted BackupBrowseOperation metadata may retain redacted original read references and outcome facts, without retaining raw content, absolute paths or private locators or extending File/content lifetimes. Replay requires genuine surviving original evidence and current disclosure permission; it never re-resolves current focus, autosaves, mutates a buffer, acquires write authority, restores or checks out a Project. The mandatory native producer/resolver integration and race/content/authorization tests remain NOT_RUN; the static fixture adapter supplies no owner authority.

ContractRef: ContractName:Plans/Backup_Restore_System.md#BRS-030, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md
