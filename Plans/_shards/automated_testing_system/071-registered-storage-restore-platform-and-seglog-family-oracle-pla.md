# Shard 071: Registered Storage, restore, platform and seglog family oracle plans (PNC-019 S3, 2026-11-14)

Source: `Plans/Automated_Testing_System.md`

Source lines: L15481-L15710

Source SHA256: `c2af0dedf955033c5a325da1a7a2ed72f8d3edef977438160db83ff564d21514`

---

## Registered Storage, restore, platform and seglog family oracle plans (PNC-019 S3, 2026-11-14)

These units are the criterion-12 oracle **plans** for the owner text that SP-2200 to SP-2210 add for 14 registered families. Each plan names, per guard, a valid positive and negatives that change exactly one thing from it. No case here is executed yet: the executable checker, its Method B guard tables on the gated tool (`scripts/pm_guard_isolation.py`, 004bdedd63), the shared number calls (CV-1100, SP-1100) and the shared date-time check (CV-1101) are later work, and criterion 12 stays PARTIAL for every family until that checker passes. Native obligations remain NOT_RUN. Every plan includes the standing negatives: a current writer or retry selecting `projector_replay_only` refuses as `replay_only_not_appendable`; application keys follow CV-366 exactly; Project positives use the `project~` partition; anchored identifiers get trailing-LF negatives; failures reject a success exit; a retained original is read by its sealed write-time recipe (missing, ambiguous and other-original receipts refuse).

### ATS-2200 - storage.deletion_lifecycle_changed oracle plan

- **Producer and order:** positive thread and Project-data deletions through `handlers::chat::delete` and `handlers::project::delete_data`, each transition as record CAS, pending obligation, barrier append, first receipt, then effect. Negatives: a handler appending the event; an append before the record CAS; hide or purge before the receipt; a second purge on recovery after the commit frame is durable.
- **Identity:** `deletion_id`, the per-transition component, the CV-366 application key, the `storage-deletion@1` Project key and `event_id` recomputed from source. Negatives: a substituted key with the same digest; a reused ordinal after `failed`; a raw Project id partition; an application key in another format; a different request digest under the same key.
- **Replay:** same identity and digest returns the original receipt; a different digest is `idempotency_conflict`; unavailable dedupe is `dedupe_unavailable`; Storage-assigned fields changed alone are not a conflict.
- **Consumer:** the history reader with a nine-field token; negatives with a stored `redb_snapshot_id`, partial coverage returned as empty history, and a reader write.
- **Withdrawal:** cutoff then drain then fence; negatives for an append after the cutoff and a fenced reader disclosing history.

```yaml
plan_unit_id: ATS-2200
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Criterion-12 oracle plans for storage.deletion_lifecycle_changed under SP-2200; plan only, not executed.
gui_related: false
gui_classification_reason: Event authority oracle plan; no presentation change.
depends_on:
- SP-2200
unblocks: []
acceptance_criteria:
- Every SP-2200 guard has a positive and single-defect negatives in the plan; criterion 12 stays PARTIAL until an executable checker with guard-tool proof passes.
validation_surfaces:
- reports/event-authority-20261114/depth-s3b-registered-families.json
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/storage-plan.md#SP-2200
preserved_exact_tokens: []
negative_constraints:
- No executed result, admission or native proof is claimed.
```

### ATS-2201 - storage.value_quarantine_changed oracle plan

- **Producer and order:** raw custody synchronized before the record CAS, the append and the live-key effect. Negatives: live-key mutation before the receipt; an event with no raw custody; a reader appending the event.
- **Identity:** `quarantine_id` with occurrence; re-detection of a non-terminal record mints nothing; re-occurrence after `purged` takes occurrence 2. Negatives: a second identity for the same open record; a state repeated for one `quarantine_id`; a forged occurrence.
- **Custody:** a viewer without source permission sees only the quarantined fact; raw bytes only through protected export. SP-2211 applies E8-5 B: keep raw bytes until resolution, then delete subject to holds; ATS-2206 executes the thread and Project examples.
- **Consumer and withdrawal:** as ATS-2200, for `reader.storage.value_quarantine_history@1.0.0`; withdrawal never releases a value.

```yaml
plan_unit_id: ATS-2201
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Criterion-12 oracle plans for storage.value_quarantine_changed under SP-2201; plan only, not executed.
gui_related: false
gui_classification_reason: Event authority oracle plan; no presentation change.
depends_on:
- SP-2201
unblocks: []
acceptance_criteria:
- Every SP-2201 guard has a positive and single-defect negatives in the plan; the deletion interplay follows SP-2211 (E8-5 B).
validation_surfaces:
- reports/event-authority-20261114/depth-s3b-registered-families.json
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/storage-plan.md#SP-2201
preserved_exact_tokens: []
negative_constraints:
- No executed result, admission or native proof is claimed.
```

### ATS-2202 - restore_point.applied oracle plan

- **Order:** reserve IDs and pending row, materialize under the reserved IDs, record and protecting ref with the obligation, barrier append, first receipt, result. Negatives: an event for `refused` or `failed`; a second branch on a resumed step; a result before the receipt; any source thread, branch, worktree or safe-point change.
- **Identity:** the `rpa_` recipe; envelope `thread_id` equals `new_thread_id`. Negatives: envelope thread set to the source thread; a different request digest under the same key; a reused `application_id` for a new key.
- **Result custody:** replay returns the recorded result and target IDs; `restore_point_application_commit` validates against its closed schema with positives for all three results and one-field negatives.
- **Consumer:** `reader.chat.restore_point_history@2.0.0` through SP-278 with the nine-field token.

```yaml
plan_unit_id: ATS-2202
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Criterion-12 oracle plans for restore_point.applied under SP-2202; plan only, not executed.
gui_related: false
gui_classification_reason: Event authority oracle plan; no presentation change.
depends_on:
- SP-2202
unblocks: []
acceptance_criteria:
- Every SP-2202 guard and the application_commit schema have positives and single-defect negatives in the plan.
validation_surfaces:
- Plans/restore_point_application_corruption_contracts.schema.json
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/storage-plan.md#SP-2202
preserved_exact_tokens: []
negative_constraints:
- No executed result, admission or native proof is claimed.
```

### ATS-2203 - restore_point.corrupt oracle plan

- Existing EA-OC-004-POS-01..06 and NEG-01..11 carried forward, plus: a reader appending the corrupt event; a corruption commit when a deletion or expiry commit exists (and the reverse); a second `corruption_id` for one point; a re-detection changing the first reason; evidence carrying a body, path or secret; a branch or deletion admitted after a settled corruption commit. `restore_point_corruption_commit` validates against its closed schema.

```yaml
plan_unit_id: ATS-2203
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Criterion-12 oracle plans for restore_point.corrupt under SP-2203, carrying EA-OC-004; plan only, not executed.
gui_related: false
gui_classification_reason: Event authority oracle plan; no presentation change.
depends_on:
- SP-2203
unblocks: []
acceptance_criteria:
- Every SP-2203 guard and the corruption_commit schema have positives and single-defect negatives in the plan.
validation_surfaces:
- Plans/restore_point_application_corruption_contracts.schema.json
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/storage-plan.md#SP-2203
preserved_exact_tokens: []
negative_constraints:
- No executed result, admission or native proof is claimed.
```

### ATS-2204 - safe_point.recovery_unavailable oracle plan

- Existing P01..P10 and N01..N15 carried forward, plus: the event appended by Executor; the append before the anchor commit; actions offered before the receipt; `receipt_ref` naming anything but the event's own SP-286 custody key; a second event identity for one anchor; a recovery that releases the anchor or changes the reason; withdrawal that releases an anchor; disclosure without a read-time access check.

```yaml
plan_unit_id: ATS-2204
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Criterion-12 oracle plans for safe_point.recovery_unavailable under SP-2204, carrying P01..P10 and N01..N15; plan only, not executed.
gui_related: false
gui_classification_reason: Event authority oracle plan; no presentation change.
depends_on:
- SP-2204
unblocks: []
acceptance_criteria:
- Every SP-2204 guard has a positive and single-defect negatives in the plan.
validation_surfaces:
- reports/event-authority-20261114/depth-s3b-registered-families.json
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/storage-plan.md#SP-2204
preserved_exact_tokens: []
negative_constraints:
- No executed result, admission or native proof is claimed.
```

### ATS-2205 - Boot, compaction, recovery, hold, platform and seglog oracle plan

- **Boot (SP-2205):** a fresh post-restore issuance with SP-286 `restore_admission` and the new-epoch set ID; negatives first-minting a restored pending intent, rolling the anchor back, and re-establishing earliest completeness after an older restore.
- **Compaction (SP-2206):** the history reader with a nine-field token; a negative driving a translation from an EventRecord.
- **Recovery (SP-2207):** aftermath after the verified receipt; negatives starting aftermath before it, repeating a rebuild on restart, translating when the action is `invalidate_and_rebuild`, and writing another owner's checkpoint.
- **Hold (SP-2208):** a post-restore set with a SIR command accepted after the session opened; negatives with a pre-restore SIR command, a fresh-origin flag and a copied group capability.
- **Platform (SP-2209):** `read_output` positives for `read_through` and `unavailable`; one-field negatives including a persisted marker, a missing `action_authority`, an incomplete coverage flag and a decision on an unavailable result.
- **Seglog (SP-2210):** the relational suite refrozen with a nine-field stored token; a stored-snapshot negative and a live ten-field disclosure join.
- **Restore-point created and expired, integrity:** the carried gaps (the ACD-465 capture constructor, the expiry suite's stored `redb_snapshot_id`, SP-279's full-u64 semantic adapter and `exact_event` corroboration) stay open and are listed in the S3 report.

```yaml
plan_unit_id: ATS-2205
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Criterion-12 oracle plans for the SP-2205 to SP-2210 owner text (Boot, compaction, recovery, hold,
  platform and seglog); plan only, not executed.
gui_related: false
gui_classification_reason: Event authority oracle plan; no presentation change.
depends_on:
- SP-2205
- SP-2206
- SP-2207
- SP-2208
- SP-2209
- SP-2210
unblocks: []
acceptance_criteria:
- Every SP-2205 to SP-2210 guard and the platform read_output schema have positives and single-defect negatives in the plan.
validation_surfaces:
- Plans/platform_capability_decision_read_output.schema.json
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/storage-plan.md#SP-2205
- Plans/storage-plan.md#SP-2210
preserved_exact_tokens: []
negative_constraints:
- No executed result, admission or native proof is claimed.
```
