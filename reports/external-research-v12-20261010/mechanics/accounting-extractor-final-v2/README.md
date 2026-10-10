# Final offline mechanical accounting preparation

READY for root's final frozen checkpoint and captures after all quiet. No live campaign extraction, candidate Goal, canary, host polling, source retrieval, stage writes, Git or publication was performed. This package is a copy of the pinned existing extractor with bounded additions; old code, snapshots and D pins are unchanged. The preparatory native Goal belongs to preparation, never a product candidate.

Root runs only after freezing inputs:

```sh
python3 -B ER12_RUNTIME/mechanics/accounting-extractor-final-v2/extract.py \
  --checkpoint /absolute/path/to/final-frozen-checkpoint.json \
  --runtime ER12_RUNTIME \
  --frozen-inputs \
  --output ER12_RUNTIME/mechanics/accounting-extractor-final-v2/final-snapshot.json
```

The freeze flag is root's attestation, not a live quiet check or atomic freeze. Concurrent input changes abort CLI saving. Output must be directly in this package. CLI also writes `DELIVERY-DISPOSITION.json` here, schema `er12.delivery-disposition-sidecar.v1`, with unchanged mechanical disposition records and provenance. No actual snapshot or disposition output was generated during preparation.

Optional `--host-manifest /absolute/path/to/manifest.json` reads a finite JSON object `{"files":["mechanics/final-native-host-capture-v1/host/exact.json"]}` (maximum 512 entries). Entries must resolve to direct JSON children of that exact host directory; traversal, science paths and other directories are rejected. No glob of that directory is performed. Optional `--root-terminal /absolute/runtime/mechanics/NATIVE_GOAL_TERMINAL-cohort4b.json` accepts one exact known root terminal filename under mechanics beginning `NATIVE_GOAL_TERMINAL` and ending `.json`. Root supplies its actual saved filename; preparation does not discover or collect it.

Added fixed reads: C-R1, C-R2, D-R1, D-R2 `mechanics/<cohort>-host-timing-v1/HOST_CAPTURE.json`; `mechanics/final-native-host-capture-v1/HOST_CAPTURE.json`; `mechanics/NATIVE_GOAL_ACTIVE-cohort4b.json`; `mechanics/D-R1-03-treatment-MISSING_FINAL.json`. Existing root terminal reads and the original observation inventory remain. Missing finite inputs are reported in `read_errors`. No mechanics-wide or science scan is added. The inherited inventory reads mechanical stage metadata, Goal-named receipts, authored Goal records, and original assessment labels; it does not analyze science/source bodies.

Schema `er12.accounting-extractor.final.v2` retains original metadata binding, route/tier, host proof and immutable provenance semantics. Original heterogeneous judgment records are retained as `original_record` alongside unchanged legacy label fields; missing fields remain UNKNOWN. No new grade is assigned. Declaration categories keep candidate, root, evaluation, preparation, support/monitor, and publication separate; support includes the original observation/evidence/mechanics/accounting setup classification.

Created-to-completed occupied lifetimes retain consumed cost, including failed attempts. Added `started_to_completed_context_seconds` starts at the first observed host run start. Arm/category `observed_started_to_completed_context_sum_seconds` and complete sums are distinct from created lifetime sums. Arm started unions and overlaps include retained authors. Run request/start/completion metrics and queue fields remain separate; handoff is UNKNOWN because no handoff timestamp contract exists. Partial observed sums never become complete totals when lifetimes are missing.

`attempt_terminal_latency_seconds` at arm scope is first owned host request → latest owned quiet task terminal. Every owned task must have a complete run inventory, every run must have non-conflicting requested/completed timestamps in chronological order and an explicit completed/complete/failed/cancelled/canceled status, and every task must be quiet by its full host inventory. Otherwise it is UNKNOWN. A missing designated final role does not erase an investigator's actual failed terminal. `attempt_terminal_at` records that latest owned terminal. Consumed created/start lifetimes and failed costs remain retained.

`legacy_candidate_latency_raw_host_interval_seconds` preserves the v1 designated-final-role first-request → quiet-final host interval before delivery/native filtering. It may be present even when delivery is UNKNOWN or native is blocked. It never substitutes another stage for the original final role. `delivery_disposition` is DELIVERED/MISSING/UNKNOWN, separately from unchanged original source/native/protocol judgments and `observed_native_or_host_failure`. Missing sidecar alone establishes MISSING. Quiet completion and native status never establish delivery. Without a delivery manifest, delivery is UNKNOWN except for the existing missing sidecar. `delivery_latency_seconds` remains UNKNOWN: exact science file creation timing is not recorded. For root-attested DELIVERED rows only, `delivery_proxy_latency_seconds` and compatibility `candidate_latency_seconds` contain the preserved final host interval (or UNKNOWN if that interval is unavailable). This is a requested-to-quiet final delivery proxy, not exact file creation time. Root observation time is retained, never substituted for file creation time.

Optional `--delivery-manifest /absolute/path/frozen-delivery.json` reads only that one declared JSON file, with no pointer dereference, science body reads or file-hash verification. Schema is an object with `rows`, exactly 80 records covering exactly the checkpoint's logical arms. Each record has exactly these eight fields:

```json
{
  "armId": "D-R1-03/treatment",
  "disposition": "DELIVERED",
  "final_task_id": "exact checkpoint taskId for designated final role",
  "final_path": "/absolute/path/to/final.md",
  "sha256": "64 lowercase hexadecimal characters",
  "observed_at": "2026-10-10T07:00:00Z",
  "terminal_task_status_pointer": {"path": "/absolute/path/original-task-status.json", "pointer": "/structuredContent"},
  "root_science_freeze_pointer": {"path": "/absolute/path/root-science-freeze.json", "pointer": "/arms/D-R1-03~1treatment"}
}
```

`armId` is exactly `slot/arm`. Root supplies the actual frozen original terminal task_status capture pointer and actual root science-freeze pointer; those are attestations, not independently checked evidence. Pointer objects have exactly path/pointer, absolute JSON paths and nonempty JSON pointers. A DELIVERED final task must match the uniquely designated checkpoint final role; an optional checkpoint declaration `final_path` must also match. MISSING rows have null final_path/sha256 and either null final_task_id or a declared owned taskId (allowing the failed investigator when final role was never dispatched). observed_at always requires an ISO timestamp with timezone. Duplicate/unknown arms, mismatched tasks/declared paths, malformed fields, incorrect row count/coverage, or delivered claims conflicting with the missing sidecar invalidate the whole manifest. The API reports errors and applies no rows; CLI refuses to save an invalid manifest. Science SHA-256 values are root attestations only. `delivery_manifest.science_hashes_verified_by_reader` is false. Raw accepted rows and their manifest hashes/pointers are retained as delivery evidence; statuses and judgments are never rewritten.

Native identities are deduplicated by the original explicit Goal ID or native-thread/creation basis. `raw_cumulative_meter_maxima` stores finite nonnegative maximum observations per raw field; `latest_raw_observations` retains every observation tied at the latest recorded numeric updatedAt. Repeated 0/100/100 yields maximum 100, never summed 200. These are raw observations, never billable tokens or effective compute. Raw records remain available with hashes/pointers; unknown identities remain separate rather than falsely merged. Blocked terminal is preserved as failure; `science_completion_inferred` is always false. Source/pass/closed counts never become progress. Billing, cache and vendor-effective settings remain UNKNOWN; root native meter is never campaign aggregate.

Run `python3 -B checks.py` for 24 finite offline checks (all 15 original checks retained, plus 9 repair checks). Temporary fixtures are created solely inside this directory and removed on completion. Checks cover duplicate/cumulative growth, blocked terminal, retained-author overlap, start versus creation, missing-final consumed failure cost versus delivery, queue/handoff separation, unchanged heterogeneous judgments, malformed originals/capture/manifest, finite missing files, exact manifest rejection of science, science-read sentinels, and immutable source hashes. `check-results.json` records results. `ORIGINAL-PIN.json` pins the original extractor; `SHA256SUMS.json` pins package deliverables. These checks do not run against the campaign.

The complete original final-v1 package is preserved byte-for-byte in `prior-v1/`, including its original checks, README, READY and SHA pins. The active checks keep all original 15 assertions unchanged; new fixtures use the actual missing-final declaration shape (failed investigator only, absent reviser), rather than relying on the old final-present fixture. Added checks cover incomplete terminals, blocked + root-delivered, no manifest, science/pointer read sentinels, mismatched task, duplicate rows, malformed metadata and exactly-80 enforcement. No actual campaign was extracted; root runs later after all quiet and frozen captures. `root-review-findings.json` records the mechanical repair disposition and remaining attestation limits.
