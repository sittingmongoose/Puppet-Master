# Shard 024: Remaining Runtime Integration Addendum - LSP Write Transaction - 2026-08-13

Source: `Plans/LSPSupport.md`

Source lines: L7050-L7244

Source SHA256: `596bd6c5f0883c2daeed9e41fcebaed3e7cafde5db104954a2389ab885b9374b`

---

## Remaining Runtime Integration Addendum - LSP Write Transaction - 2026-08-13

This addendum adopts the approved runtime-integration packet's LSP-aware write sequence into the existing LSP, FileSafe, command, and shared-runtime owner boundaries. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated shards/evidence, or governance-seal artifacts.

### LSPS-110 - Versioned LSP Write Transaction Ordering

```yaml
plan_unit_id: LSPS-110
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: >-
  Every LSP-aware file mutation is one bounded transaction: capture the canonical file read revision,
  document version, diagnostic snapshot/version or explicit unversioned state, applicable-server set,
  and exact Project Home Server/Execution Host/Execution Environment/Source Location/session
  identity and topology generation; bring applicable Ready servers through the
  pre-write sync barrier; optionally request policy-approved formatting or code actions against that
  same version; submit the final edit set to FileSafe for approval and atomic CAS-backed publication;
  reread resulting disk state; emit didSave and applicable workspace watched-file notifications only
  after successful publication; then collect diagnostics attributable to the resulting version.
gui_related: false
gui_classification_reason: This unit defines backend LSP/FileSafe transaction ordering rather than direct GUI presentation.
split_recommended: false
depends_on: [LSPS-052, LSPS-072, SIR-002, SIR-004, SIR-006]
unblocks: [LSPS-111, LSPS-112, LSPS-113]
acceptance_criteria:
  - Preflight records file read_revision, document version, diagnostic version or unversioned status, applicable server identities, and transaction identity before optional edit-producing requests.
  - Applicable servers are selected and synchronized for the exact project_id, project_home_server_id, execution_host_id, execution_environment_id, source_location_id, topology_generation, server_id, root_identity, lsp_session_id, session_generation, and environment connection epoch; no local, remote, container, Kubernetes namespace, WSL, SSH, or worktree identity is inferred from path spelling alone.
  - RuntimeResourceGovernor admission and any returned lease refs are recorded before bounded server/process/watcher work; queued, blocked, rejected, or admitted_reduced outcomes remain truthful and cannot become local best effort.
  - Formatting and code-action responses are rejected or re-requested when their captured document version, server generation, or FileSafe expected-before revision is stale.
  - FileSafe remains the owner of permission checks, mutation lease/fence, approval, expected-before CAS, same-directory staging, durability, atomic promotion, rollback, and recovery-required behavior.
  - Failed, refused, rolled-back, or recovery-required publication emits no didSave and cannot be reported as saved or synchronized.
  - Successful publication rereads actual disk bytes and advances the authoritative resulting document version before post-write notification and diagnostics collection.
validation_surfaces:
  - LSP write-transaction ordering fixtures
  - stale preflight/version/CAS negative fixtures
  - local, SSH, WSL, container, and worktree identity fixtures
risk_class: lsp_write_transaction_order_or_identity_drift
reasoning_tier: high
context_scope: lsp_versioned_write_transaction
implementation_surfaces: [Plans/LSPSupport.md, Plans/FileSafe.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: lsp_versioned_write_transaction, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved remaining-runtime integration packet section 04, LSP-aware write transaction
preserved_exact_tokens: ["capture file and diagnostic versions", "sync applicable language servers", "optional format/code actions", "FileSafe-approved atomic write", "didSave", "watched-file notifications", "resulting version"]
negative_constraints:
  - LSP must not bypass FileSafe or reinterpret FileSafe atomic publication as a direct protocol-client write.
  - Pre-write diagnostics, formatter results, code actions, or server responses must not be attached to a different Execution Host, Execution Environment, Source Location, topology generation, connection epoch, or LSP session generation.
owner_boundary_notes:
  - Plans/LSPSupport.md owns LSP ordering, synchronization, notifications, and diagnostic freshness.
  - Plans/FileSafe.md owns filesystem authorization, atomic CAS-backed publication, rollback, and recovery.
  - Plans/Shared_Integration_Runtime.md owns exact runtime topology identity, RuntimeResourceGovernor admission, ObservableWork, environment connection epochs, leases, and shared operation/recovery mechanics.
  - Plans/UI_Command_Catalog.md and Plans/Commands_System.md retain command identity and dispatch ownership.
owner_hints: [Plans/LSPSupport.md, Plans/FileSafe.md, Plans/Shared_Integration_Runtime.md]
```

### LSPS-111 - Rename Snapshot Coalescing And Conflict Rejection

```yaml
plan_unit_id: LSPS-111
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: >-
  Rename captures one immutable pre-edit snapshot for every affected canonical URI, requests
  prepare/rename and workspace/willRenameFiles participation from all applicable servers bound to
  the same Execution Host/Execution Environment/Source Location, topology generation, connection
  epoch, and LSP session generation, normalizes and coalesces their edits per URI,
  previews the complete result, and applies each URI at most once through the LSPS-110/FileSafe
  transaction; incompatible overlapping edits, duplicate physical-file identities, stale snapshots,
  or incomplete cross-host mappings block the rename rather than applying an arbitrary subset.
gui_related: false
gui_classification_reason: This unit defines backend rename edit construction and safety; existing owners govern preview presentation.
split_recommended: false
depends_on: [LSPS-031, LSPS-072, LSPS-110]
unblocks: []
acceptance_criteria:
  - All edits for one canonical URI are composed against one pre-edit byte snapshot and position-encoding map, never sequentially against intermediate file states.
  - Canonical URI identity includes execution_host_id, execution_environment_id, source_location_id, and topology_generation authority so equal path strings on different hosts, environments, namespaces, or sources cannot coalesce.
  - Deterministically identical or non-overlapping edits coalesce; incompatible overlaps produce a typed conflict with server provenance and zero FileSafe mutation.
  - Multi-file approval covers the complete coalesced edit set, and each affected URI is published at most once within the FileSafe transaction.
  - workspace/didRenameFiles and watched-file notifications occur only for the successfully committed resulting identities and never for an unapplied subset.
validation_surfaces:
  - multi-server rename coalescing fixtures
  - overlapping-edit and duplicate-URI negative fixtures
  - cross-host path-collision fixtures
risk_class: lsp_rename_snapshot_or_coalescing_drift
reasoning_tier: high
context_scope: lsp_rename_pre_edit_snapshot_coalescing
implementation_surfaces: [Plans/LSPSupport.md, Plans/FileSafe.md]
node_compile_hint: {mode: lsp_rename_snapshot_coalescing, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved remaining-runtime integration packet section 04, LSP-aware write transaction
preserved_exact_tokens: ["coalesce edits per URI", "one pre-edit snapshot", "workspace/willRenameFiles", "workspace/didRenameFiles"]
negative_constraints:
  - Rename must not apply server edit batches sequentially to already-mutated content.
  - Partial success must not be reported when the approved rename set did not commit as a whole under FileSafe policy.
owner_boundary_notes:
  - Existing GUI and command owners retain rename preview, confirmation, and command routing ownership.
owner_hints: [Plans/LSPSupport.md, Plans/FileSafe.md]
```

### LSPS-112 - Result-Version Diagnostics And Immediate Deferred Truth

```yaml
plan_unit_id: LSPS-112
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: >-
  Post-write diagnostics are fresh only when their topology generation, environment connection
  epoch, server/session generation, and document version
  match the committed resulting version; a bounded inline wait may return matching diagnostics
  immediately, while slower applicable servers remain pending and publish a deferred completion
  update tied to the same transaction. Timeout, cancellation, crash, unversioned publishDiagnostics,
  or server non-participation is reported explicitly and never converted into a clean result.
gui_related: false
gui_classification_reason: This unit defines diagnostic freshness and result semantics; status surfaces consume rather than own them.
split_recommended: false
depends_on: [LSPS-012, LSPS-050, LSPS-104, LSPS-110]
unblocks: []
acceptance_criteria:
  - The immediate result distinguishes fresh, pending, unavailable, cancelled, timed_out, stale_discarded, unversioned_unverified, and not_applicable per server.
  - Deferred diagnostics carry operation_id, attempt_id, LSP transaction_id, resulting document version/content revision, exact topology generation, environment connection epoch, server/session generation, provenance, and completion time.
  - A deferred update is discarded when the document advances again, topology generation or environment connection epoch changes, the session generation changes, or operation/transaction identity no longer matches.
  - The overall result distinguishes fresh_complete, fresh_partial_pending, and fresh_unavailable; absence of diagnostics is clean only when every applicable server produced a matching fresh empty result.
  - Formatter or code-action drift between proposed content, committed disk content, and resulting document version is recorded rather than hidden.
validation_surfaces:
  - immediate/deferred diagnostics timing fixtures
  - stale generation and post-write re-edit negative fixtures
  - unversioned publishDiagnostics truthfulness fixtures
risk_class: lsp_post_write_diagnostic_freshness_drift
reasoning_tier: high
context_scope: lsp_result_version_diagnostics_truth
implementation_surfaces: [Plans/LSPSupport.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: lsp_result_version_diagnostics_truth, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved remaining-runtime integration packet section 04, LSP-aware write transaction
preserved_exact_tokens: ["fresh resulting-version diagnostics", "immediate", "deferred", "formatter drift", "server provenance"]
negative_constraints:
  - Pre-write, stale, unversioned-unverified, timed-out, or cancelled diagnostics must not be labeled fresh or clean.
  - The inline timeout must not cancel durable post-commit reconciliation that is required to make transaction status truthful through ObservableWork.
owner_boundary_notes:
  - Problems and other status surfaces render this state without redefining diagnostic freshness.
owner_hints: [Plans/LSPSupport.md, Plans/Runtime_Artifacts_Panel.md]
```

### LSPS-113 - Cancellation Restart Reconciliation And Receipt

```yaml
plan_unit_id: LSPS-113
unit_type: requirement
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: >-
  LSP write cancellation is phase-aware and projected through ObservableWork: cancellation before
  FileSafe commit releases bounded work
  with zero mutation, while cancellation or server failure after commit cannot undo or conceal the
  committed file and instead leaves notification/diagnostic reconciliation pending or explicitly
  unavailable. Session restart invalidates prior-generation responses, preserves transaction
  reconciliation state, resynchronizes committed documents, and uses the existing
  cmd.lsp.restart_server command; every terminal or deferred outcome emits a typed, redacted receipt.
gui_related: false
gui_classification_reason: This unit defines backend cancellation, restart, and evidence semantics rather than direct GUI presentation.
split_recommended: false
depends_on: [LSPS-047, LSPS-050, LSPS-052, LSPS-110, LSPS-112, SIR-004, SIR-006, SIR-011]
unblocks: []
acceptance_criteria:
  - Cancellation before publication records cancelled_before_write with zero changed paths and reaches ObservableWork cancelled; after commit it records committed_reconciliation_pending while ObservableWork remains reconciling, then reaches only a truthful succeeded, failed, cancelled, or recovery_required terminal outcome.
  - Crash, environment connection replacement, topology replacement, or explicit restart cancels outstanding old-generation/old-epoch requests, rejects their late responses, increments the applicable connection epoch or session_generation, performs full-buffer/disk rebase as required, and reissues only still-relevant post-commit reconciliation work.
  - The restart command is exactly cmd.lsp.restart_server; cmd.lsp.server.restart is a rejected packet candidate and must not become an alias or second command.
  - Receipts record operation_id, attempt_id, observable_work_id, LSP transaction_id, project_id, project_home_server_id, execution_host_id, execution_environment_id, source_location_id, topology_generation, capability_snapshot_ref, root_identity, environment connection epoch, URI/path refs under redaction policy, pre/result file revisions and document versions, per-server ids/generations, RuntimeResourceGovernor admission and lease refs, sync and notification outcomes, requested/applied formatter or code-action provenance, FileSafe receipt/evidence ref, immediate/deferred diagnostic status, cancellation/restart lineage, timestamps, and typed failure/block reasons.
  - Receipts contain refs, hashes, versions, and redacted diagnostics summaries rather than secrets or unrestricted source bodies.
validation_surfaces:
  - cancellation at every transaction boundary fixtures
  - server restart and late-response generation fixtures
  - LSP write receipt schema and redaction fixtures
  - command catalog exact-ID check
risk_class: lsp_write_restart_or_receipt_drift
reasoning_tier: high
context_scope: lsp_write_cancellation_restart_receipt
implementation_surfaces: [Plans/LSPSupport.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: lsp_write_cancellation_restart_receipt, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved remaining-runtime integration packet section 04, LSP-aware write transaction
preserved_exact_tokens: ["cmd.lsp.restart_server", "session_generation", "cancelled_before_write", "committed_reconciliation_pending", "typed receipt"]
negative_constraints:
  - Cancellation after FileSafe commit must not be reported as though the file was unchanged.
  - Restart must not accept old-generation responses or silently lose a committed transaction's pending notifications and diagnostic status.
  - Do not register cmd.lsp.server.restart.
owner_boundary_notes:
  - Command owners retain registration and dispatch; this unit binds their existing restart command to LSP transaction recovery.
  - Shared runtime owns exact topology identities, ObservableWork, RuntimeResourceGovernor, environment epochs, leases, generic recovery, and operational attribution; FileSafe and other security owners retain authorization, durable mutation receipt, redaction, and mutation mechanics.
owner_hints: [Plans/LSPSupport.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
```
