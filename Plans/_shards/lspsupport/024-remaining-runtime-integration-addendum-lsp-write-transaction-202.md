# Shard 024: Remaining Runtime Integration Addendum - LSP Write Transaction - 2026-08-13

Source: `Plans/LSPSupport.md`

Source lines: L7051-L7298

Source SHA256: `8460219bdb4126ddfa1d188eb067cdede819bc588f824a600983d8d2a4678f45`

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
  - RuntimeResourceGovernor admission and any returned lease refs are recorded before bounded server/process/watcher work; the exact admitted, queued, admitted_degraded, permission_blocked, resource_blocked, or cancelled decision remains truthful and cannot become local best effort. Legacy admitted_reduced, blocked, and rejected rows are read/import-only inputs that normalize once at the shared-runtime owner boundary and are never emitted or displayed by this consumer.
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
  - Cancellation before publication records cancelled_before_write with zero changed paths and reaches ObservableWork cancelled; after commit it records committed_reconciliation_pending while ObservableWork remains starting with the preserved human reconcile phase, then reaches only a truthful completed, failed, cancelled, or recovery-required terminal outcome. Legacy reconciling, succeeded, and recovery_required rows are read/import-only inputs normalized once at the shared-runtime owner boundary.
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


### LSPS-173 - Event Authority lsp.server.lifecycle_changed 1.0.0 — newly authored owner contract under DL-045.

```yaml
plan_unit_id: LSPS-173
unit_type: event_contract
status: accepted
owner_doc: Plans/LSPSupport.md
canonical_text: |-
  lsp.server.lifecycle_changed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/lsp_server_lifecycle_changed.schema.json (pm.event_payload.lsp_server_lifecycle_changed.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. LSP previous_state and state must differ and the original supervisor observation must prove that exact Host/server/root/session edge under LSPSupport section 14.3. A valid enum alone never proves a transition.
  Producer: LspSupervisor lifecycle adapter. Observe one LspSupervisor transition for the exact Host/server/root attachment. Use canonical states Starting, Initializing, Ready, RestartBackoff, Degraded, ShuttingDown, Stopped (LSPSupport section 14.3); legacy stopped/starting/initializing/ready/degraded/stopping map by meaning, and a crash is a reason on RestartBackoff or Stopped rather than a new canonical state. No replay spawns a server, sends initialize, reopens a document or retries a crash.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["lsp.server.lifecycle_changed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="lsp.server.lifecycle_changed:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=no_secrets. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.ts byte-for-byte from the original LspSupervisor Host/server/root/session observation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for lsp.server.lifecycle_changed: actor_ref is the non-empty non-secret actor reference retained by the original LspSupervisor Host/server/root/session observation identifying the actual LspSupervisor service for payload.host_id (not the focused editor user). correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original observation must join payload.host_id, server_id, root_identity, lsp_session_id, previous_state, state and ts exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.lsp.lifecycle@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for lsp.server.lifecycle_changed: only opaque attachment identities, canonical states and a sanitized bounded reason code are inline; raw logs, URIs, paths and server stderr are forbidden; redaction_profile=no_secrets is an existing EventRecord value and does not grant source access.
  Custody remains with LspSupervisor lifecycle adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.lsp.lifecycle@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for lsp.server.lifecycle_changed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns LspSupervisor lifecycle adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  lsp.server.lifecycle_changed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for lsp.server.lifecycle_changed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for lsp.server.lifecycle_changed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by scripts/pm-small-owner-guard-audit.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. Each enforcement rule is removed only in memory; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- CV-621
- SP-601
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/LSPSupport.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```
