# Shard 076: ATS-3880 - Executable s3bo family boundaries for the restore-point and recovery-unavailable families (C12-SR)

Source: `Plans/Automated_Testing_System.md`

Source lines: L16017-L16105

Source SHA256: `c2af0dedf955033c5a325da1a7a2ed72f8d3edef977438160db83ff564d21514`

---

## ATS-3880 - Executable s3bo family boundaries for the restore-point and recovery-unavailable families (C12-SR)

The ATS-2206 checker gains family-boundary extensions. `scripts/pm_s3bo_oracles.py` discovers every `scripts/pm_s3bo_ext_*.py` module in sorted order and refuses overlapping rows, table groups or families; each extension attaches a complete boundary record to its family's control, projects raw operands into its own generated tables of at most eight real predicates (`scripts/pm-s3bo-table-generate.py`), and adds independently labelled single-defect negatives through `scripts/pm_s3bo_cases.py`. PNC-019 lane C12-SR owns `pm_s3bo_ext_sr_applied.py`, `pm_s3bo_ext_sr_corrupt.py`, `pm_s3bo_ext_sr_created.py`, `pm_s3bo_ext_sr_expired.py` and `pm_s3bo_ext_sr_recovery.py`, with shared helpers in `pm_s3bo_sr_common.py`. `scripts/pm-s3bo-check.py corpus` runs the whole shared number and date-time corpus of `Plans/event_number_recipe_corpus.json` through every common payload, envelope and receipt slot and every declared boundary slot of each extension's family, changing every copy of a slot together; `evidence` replays extension-owned frozen packages. Only the expected guard together with its exact refusal code earns an input-mutation kill, and only the gated `scripts/pm_guard_isolation.py` cuts earn proof credit. Expected outcomes are derived from independently held inputs by the owner rules, never from a checker result.

For `restore_point.applied`, every SP-2202 step-1 precondition and every UCC-126 reason (writer cutoff, missing family, read-only and exhausted storage, missing point, wrong project, expired, deleted or corrupt status, expected-hash mismatch, wrong source thread, permission, hold, operation in progress and deleted source content) refuses with no commit row, target, event, branch or source change, and a repeat returns the same no-event result; the exact tokens `storage_read_only`, `storage_io_exhausted`, `operation_in_progress` and `source_deleted_content_unavailable` are compared where UCC-126 names them. A failure decided inside the step-2 transaction writes only the terminal row. A branched first execution reserves the application, materializes exactly the reserved pair, records the protecting ref and the frozen obligation, appends once, resolves the first receipt and only then returns; a crash after each of reserve, materialize, record, append and first receipt resumes without a second branch or a second append. Replay returns the recorded result, targets and original receipt; a different request digest is `idempotency_conflict`; a second key is a second application with its own `rpa_` identity. Every run leaves the source thread, branch, worktree, files, Git index, queue and safe points unchanged, and every commit row keeps the complete closed `application_commit` schema and Storage UTC-Z times.

For `restore_point.corrupt`, the fixed precedence is executed over independent inputs: missing record or material and indeterminate I/O stop without a commit, then trusted record-hash mismatch, decode failure, material hash or length mismatch for each canonical material field, and only then unsupported content scope, including both owner precedence pairs. Each of the four reasons appends exactly one event whose payload, evidence kind and branch fields are derived from the FileSafe attestation and the material inputs; the commit holds the complete attested evidence, the `rpx_` identity and the source thread only when the record is readable. Attestation, re-read, commit, barrier append, first receipt and publication run in order; a reader only reports a candidate; re-detection and replay resolve the existing commit with its first reason; a deletion or expiry commit excludes the corruption commit and a settled corruption refuses later branch, delete and expire. `MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001@1.0.0` upgrades a frozen v1 payload only with exactly one identity-matching evidence result, preserving the v1 bytes and appending nothing, and otherwise quarantines with `restore_point_corrupt_v1_upgrade_unresolvable`.

For `restore_point.expired`, eligibility is executed exactly: an available, hash-authenticated point expires at or after the inclusive `released_at + 7,776,000` seconds boundary only when all eleven protecting-ref classes are completely enumerated and clear, the policy is the exact registered row rather than an inference, release evidence is present and, under count pressure, the count exceeds 2,048 and the point is rank 0. E1, the E2 barrier append of the frozen input, the first receipt and E3 run in order; a crash after E1, after the append or after the first receipt resumes the same `rpe_` identity with the frozen input unchanged and never rolls back to available; replay returns the original result and a different digest fails closed. The SP-275 closed value-shape fixtures run through the common auxiliary schema boundary. `evidence` authenticates and replays the SP-275 frozen joined package refrozen for DL-076: `/mnt/Cursor/PM-Experiments/ea-c12-sr-expiry-refreeze-20261114/event-authority-step08-restore-expired-20260911/v6/manifest.json`, SHA-256 `366c1dbcdd4dc510f3213ef36edfc29201cb4cc92d795fc3fa6573b60ffac41b`, built by `scripts/pm-s3bo-sr-expiry-refreeze.py` from the v5 package `b458da5c7684dc7a4dcfc8f3f38bc7b09722ca0f1d3136dd34602d2f40038654`; its stored checkpoint tokens carry no `redb_snapshot_id`, and its 88 joined and 24 generation cases keep their declared validity.

For `safe_point.recovery_unavailable`, establishment runs classify, durability commit, barrier append, first receipt and only then offers actions; a crash after the commit or after the append resumes without reclassifying or appending twice. The payload carries FileSafe's reason, the exact owner action array (with `start_fresh_attempt` only when the isolated baseline predicate holds), the Executor episode facts, the anchor key and the pre- or post-attempt identity, which the anchor and every resolution receipt repeat. Locate and abandon succeed only with every owner admission and verification or confirmation; every other request is a nonsuccess with the exact receipt-enum token where the condition names one, the anchor unchanged and the snapshot set preserved. Locate success records the verified set and releases as `resolved`; abandonment releases as `abandoned_by_user` with no cleanup, deletion, `abort_run`, worktree detachment or terminal transition; replan and a distinct verified successor release only after their own durable evidence. Replay returns the original receipt byte for byte and a conflicting digest is `invalid_args`. Age, exit, archive, completion, worktree unbinding, compaction, retention pressure, cleanup and withdrawal never release the anchor, and restore or ordinary retry refuses while it is unavailable. The UI shows success only for an applied or replayed result with a committed receipt.

For `restore_point.created`, the checker executes the thirteen-field `pm.restore_point.immutable_capture_sha256.v1` recipe against every owner vector in `Plans/restore_point_created_hash_vectors.json`, the union and set equalities against the canonical record, the exact frozen capture categories and order, the `rpc_` identity, the source and record joins, the B1, B2 and B3 order, crash recovery without recapture or a second append, and the native completion predicate. Not closed: no owner text defines how the creation owner selects conversation-history properties into `context_refs`, `provenance_refs`, `attachment_refs` and `citation_refs`. The checker therefore never constructs or infers a category assignment and accepts an empty category only where the frozen capture records it empty. `restore_point.created` criterion 12 stays open on that owner definition.

Amended 2026-11-15 (DL-693, lane C12-SR2), closing the gap above: that selection is now owner text, `Plans/assistant-chat-design.md#ACD-465` "Capture selection (DL-693)", and the co-extension `scripts/pm_s3bo_ext_sr2_capture.py` executes it. From an independently presented source transcript, custody and admission attempts it selects, through the boundary message inclusive, the context still in effect at the boundary in addition order, every answer's tool-call then model-run sources, every message's attachments and every answer's citations, each ref once, and compares the frozen `context_refs` and `provenance_refs` and the record's `attachment_refs`, `citation_refs` and `context_provenance_refs` order with it, one designated copy per list while the owner rows keep the other copies equal. Witnesses include context added after or removed before the boundary, current rather than boundary context, only the chosen message's sources, later, streaming, queued, draft, other-branch and other-thread material, the boundary message left out, a wrong-kind ref, and the merged order. Creation over unplaceable context, an unresolved selected ref or forbidden selected material must refuse or quarantine with no record, companion or event, while forbidden material outside the range does not block; a dropped, guessed, written or over-refused attempt is refused. Each expected capture is written out by hand. `restore_point.created` criterion 12 is graded in `reports/event-authority-20261114/depth-c12-sr2-created.json`.

Amended 2026-11-15 (DL-693, lane C12-SR2): a later lane adds rows to a family another extension owns only as a co-extension that names the family in `EXTENDS`. The loader requires exactly one other owner, refuses a co-extension's payload, envelope and corpus-slot hooks, and orders co-extensions after every owner, so the owner's controls, every common copy and the existing row, table and case order are unchanged.

These are deterministic fixture comparisons of presented protocol outcomes against owner rules over independently held inputs, plus the replay of one frozen external package; they do not authenticate a native Store or execute native producers. Native conformance remains NOT_RUN for all five families.

```yaml
plan_unit_id: ATS-3880
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  PNC-019 C12-SR adds executable family-boundary extensions to the ATS-2206 s3bo checker for
  restore_point.applied, restore_point.corrupt, restore_point.created, restore_point.expired and
  safe_point.recovery_unavailable, runs the whole shared number and date-time corpus through each
  family boundary, and replays the SP-275 expiry package refrozen for DL-076. Under DL-693 the co-extension
  pm_s3bo_ext_sr2_capture.py executes the restore_point.created capture selection.
gui_related: false
gui_classification_reason: Static event-authority contract oracles without presentation changes.
depends_on:
- ATS-2202
- ATS-2203
- ATS-2204
- ATS-2206
- SP-2202
- SP-2203
- SP-2204
- SP-275
- DL-076
- DL-693
unblocks: []
acceptance_criteria:
- Each family-boundary refusal is a real named table predicate with an independently labelled single-defect witness, at most eight per table.
- Extension modules cannot overlap rows, table groups or families except through an explicit EXTENDS co-extension with exactly one other owner, and the common witnesses and their guard selections are unchanged by an extension.
- The shared corpus runs through every common and declared boundary slot of each extension family, with expectations from corpus verdicts and owner bounds.
- The refrozen SP-275 package is authenticated by its manifest and every file hash and replays to byte-identical fixtures with no stored redb_snapshot_id.
- The restore_point.created capture selection of DL-693 is executed against hand-written expected captures, with one refusing row per single-defect witness.
validation_surfaces:
- scripts/pm-s3bo-check.py
- scripts/pm_s3bo_oracles.py
- scripts/pm_s3bo_cases.py
- reports/event-authority-20261114/depth-c12-sr-families.json
risk_class: false_event_oracle_closure
reasoning_tier: high
context_scope: event_authority_pnc019_c12_sr
implementation_surfaces:
- scripts/pm_s3bo_ext_sr_applied.py
- scripts/pm_s3bo_ext_sr_corrupt.py
- scripts/pm_s3bo_ext_sr_created.py
- scripts/pm_s3bo_ext_sr_expired.py
- scripts/pm_s3bo_ext_sr_recovery.py
- scripts/pm_s3bo_sr_common.py
- scripts/pm-s3bo-sr-expiry-refreeze.py
- scripts/pm_s3bo_ext_sr2_capture.py
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Automated_Testing_System.md#ATS-2206
- Plans/storage-plan.md#SP-2202
- Plans/storage-plan.md#SP-2203
- Plans/storage-plan.md#SP-2204
- Plans/storage-plan.md#SP-275
- Plans/assistant-chat-design.md#ACD-465
- Plans/Decision_Log.md#DL-693
preserved_exact_tokens:
- restore_point_corrupt_v1_upgrade_unresolvable
- source_deleted_content_unavailable
- abandon_recovery_and_preserve_local_work
- pm.restore_point.immutable_capture_sha256.v1
negative_constraints:
- Do not admit events, reseal governance or claim native execution.
- Do not infer a restore-point capture-category assignment or an empty category beyond the DL-693 selection.
- Do not edit the gated guard tool or the frozen date-time files.
```
