# Shard 033: Jujutsu D5 Owner Requirements (2026-09-11)

Source: `Plans/FileManager.md`

Source lines: L5076-L5195

Source SHA256: `841fcabc69480319a9c10d0db2f4fd08e2250d5487082a1d8a3e9fe9eaec24bc`

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
