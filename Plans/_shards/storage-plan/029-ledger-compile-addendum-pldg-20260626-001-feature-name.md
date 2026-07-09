# Shard 029: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/storage-plan.md`

Source lines: L15386-L15705

Source SHA256: `ed9771ce83eeeaed6d52411bdc4339f4dd1ddf421c14c18bdc8be5a0c7d869f8`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### SP-219 - Project Scoped Unified History Projection

```yaml
plan_unit_id: SP-219
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: History uses a project-scoped unified read projection for wizard documents, Orchestrator runs, artifacts,
  evidence, source lineage, package manifests, retention/archive state, and currentness/action availability. The
  projection is not the mutable authority; it preserves stable refs to immutable source records and is rebuildable
  from wizard save/approval, run lifecycle, artifact/evidence write, archive/unarchive, lineage, and manifest events.
  Stale, corrupt, incomplete, or out-of-sync projection state is detected and surfaced; rebuild never rewrites immutable
  source history or approved/final outputs.
gui_related: false
gui_classification_reason: Projection storage, rebuild, and identity rules are storage/read-model behavior; GUI
  consumers are separate.
depends_on:
- CV-295
unblocks:
- OP-026
- OP-027
- RAP-034
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_projection_drift
reasoning_tier: high
context_scope: project_history_projection
implementation_surfaces:
- Plans/storage-plan.md
- future History projection store
node_compile_hint:
  mode: history_projection_read_model
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0009
- pldg-20260626-001-feature-name:atom-0012
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0048
- pldg-20260626-001-feature-name:atom-0049
- pldg-20260626-001-feature-name:atom-0051
- pldg-20260626-001-feature-name:atom-0052
- pldg-20260626-001-feature-name:atom-0053
- pldg-20260626-001-feature-name:atom-0054
- pldg-20260626-001-feature-name:atom-0056
- pldg-20260626-001-feature-name:atom-0057
- pldg-20260626-001-feature-name:atom-0058
- pldg-20260626-001-feature-name:atom-0059
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Orchestrator_Page.md
- chat:history-scope-retention-actions-answers
- chat:history-source-index-answer
- chat:history-projection-lifecycle-answer
- chat:history-degraded-mode-answer
source_atom_ids:
- atom-0008
- atom-0009
- atom-0012
- atom-0024
- atom-0025
- atom-0047
- atom-0048
- atom-0049
- atom-0051
- atom-0052
- atom-0053
- atom-0054
- atom-0056
- atom-0057
- atom-0058
- atom-0059
decision_refs:
- dec-0002
- dec-0004
- dec-0008
- dec-0009
- dec-0010
preserved_exact_tokens:
- see historical documents that are made
- by documents I mean the plans and PRD docs that are created by the wizard
- plans and PRD docs
- created by the wizard
- historical orchestrator runs in PM
- historical orchestrator runs
- Runtime-artifact route-state answers "where should the user land," not "how should every panel be laid out when
  they get there."
- artifact_id
- run_id
- thread_id
- attempt_id
- identity-based open
- History versus Ledger
- final/approved outputs
- retained forever by default
- 'yes'
- show everything
- retention/archive rules
- project-scoped unified History index/projection
- source-of-truth shape
- immutable wizard, run, artifact, evidence, and lineage records
- manifest
- History surface
- filters
- exports
- compare
- artifact
- evidence
- rebuildable from immutable source records
- wizard
- run
- lineage
- wizard save/approval
- run lifecycle
- artifact/evidence write
- archive/unarchive
- lineage/manifest events
- stale/out-of-sync state detected and surfaced
- History
- rebuildable
- immutable source records
- approved/final outputs
- sounds good
- read-only viewing with a warning
- stale/out-of-sync
- Rebuild
- block compare/export/reopen/send-forward until rebuild succeeds
- until rebuild succeeds
- currentness
- authority
negative_constraints:
- Do not collapse PRD Builder outputs, Planning Wizard outputs, Plan packs, and runtime artifacts into an anonymous
  flat document list.
- Do not treat mutable draft projections as the same thing as immutable approved packs or historical snapshots.
- Do not show historical runs as ambiguous text summaries without stable run identity.
- Do not lose links to artifacts, evidence, ledger records, usage, or receipts when a run becomes historical.
- Do not use shell-state, current tab, filesystem path, or timestamp heuristics as the primary identity for historical
  documents or runs.
- Do not mint shadow IDs for manifest-backed bundles or receipt-like historical objects.
- Do not apply ordinary draft/intermediate retention cleanup to final/approved outputs by default.
- Do not silently remove final/approved outputs from History.
- Do not promise draft/intermediate rows remain visible forever by default.
- Do not make archived/hidden all-history rows indistinguishable from deleted records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not duplicate mutable source-of-truth content into the projection as if it were authoritative.
- Do not lose canonical IDs or lineage refs when projecting History rows.
- Do not mutate historical records through projection updates.
- Do not let UI rows, exports, or compare flows drift into different identity models.
- Do not open or export stale copies without resolving preserved source refs and currentness/authority checks where
  required.
- Do not make the projection the only copy of historical truth.
- Do not make projection corruption unrecoverable when source records remain valid.
- Do not rely on view-time scanning as the primary way to discover normal History changes.
- Do not omit archive/unarchive or lineage/manifest updates from the projection lifecycle.
- Do not let stale projection state silently drive History, export, or compare behavior without detection.
- Do not hide projection corruption/out-of-sync status in logs only.
- Do not repair the projection by rewriting immutable source history.
- Do not mutate approved/final wizard outputs in place during projection rebuild.
- Do not erase source refs when rebuilding.
- Do not hide stale/out-of-sync status while still showing rows.
- Do not allow normal-looking mutable history actions when the projection is stale.
- Do not make rebuild available only as hidden developer tooling.
- Do not rebuild by mutating immutable source records.
- Do not allow compare/export/reopen/send-forward from stale projection state.
- Do not bypass currentness/authority checks just because rebuild is requested.
- Do not treat successful rebuild as automatic permission to bypass currentness or authority checks.
- Do not mutate immutable historical records after rebuild.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Orchestrator_Page.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Permissions_System.md
```

### SP-220 - Teach Memory Capture Storage Boundary

```yaml
plan_unit_id: SP-220
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Teach memory capture is explicit and separate from one-off Teacher-guided instruction. Eligible
  Teacher answers may offer Save as taught memory; durable records preserve normalized fact, scope selector thread/project/user,
  source message/thread, secret-safety warning, conflict or supersession state, and user-locked record state. Users
  can inspect, narrow, supersede, revoke, or unlock records; one-off guidance is not auto-saved and secrets must
  not be persisted.
gui_related: false
gui_classification_reason: Durable taught-memory scope and record state are storage behavior; capture UI is owned
  by Assistant Chat.
depends_on:
- ACD-426
unblocks:
- G-026
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_memory_persistence_drift
reasoning_tier: standard
context_scope: teach_memory_capture_records
implementation_surfaces:
- Plans/storage-plan.md
- future taught memory records
node_compile_hint:
  mode: teach_memory_storage_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0094
- pldg-20260626-001-feature-name:atom-0122
- pldg-20260626-001-feature-name:atom-0123
- pldg-20260626-001-feature-name:atom-0146
- Plans/assistant-chat-design.md#6-Teach
- chat:teach-teacher-correction
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/assistant-chat-design.md#6-teach
source_atom_ids:
- atom-0094
- atom-0122
- atom-0123
- atom-0146
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
correction_refs:
- corr-0003
preserved_exact_tokens:
- Teach
- Teacher
- remember that...
- for this repo always...
- please prefer...
- ordinary one-off chat instructions do not become taught knowledge unless the user explicitly confirms persistence
- taught memory
- memory scope
- durable
- user-approved
- current thread
- current project
- feature area
- scope selector
- edit/delete
- one-off Teacher instruction
- user-locked record
- must not silently overwrite
- rejects an update
- resolves a conflict
- pins a correction
- unlock/edit flow
- conflict display
- Save as taught memory
- normalized fact
- thread
- project
- user
- source message/thread
- secret-safety warning
- conflict/supersession preview
- Save/Cancel
- inspect
- narrow
- supersede
- revoke
- unlock
negative_constraints:
- Do not make Teacher-guided instruction automatically persist memory.
- Do not make durable Teach capture a closed mode overlay detached from the current thread runtime/mode selection.
- Do not weaken existing `user-locked` Teach records through automated cleanup or summarization.
- Do not persist Teach conversation content as memory without confirmation.
- Do not use taught memory outside its approved scope.
- Do not bury edit/delete controls away from the memory explanation.
- Do not let later Teach runs overwrite locked corrections without explicit user action.
- Do not cite a locked record without showing its scope/source when relevant.
- Do not auto-save one-off Teacher guidance as taught memory.
- Do not persist secrets, tokens, passwords, or credentials.
- Do not allow conflicting teachings to silently overwrite prior locked records.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/Prompt_Pipeline.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Personas.md
- Plans/Glossary.md
- Plans/FinalGUISpec.md
```
