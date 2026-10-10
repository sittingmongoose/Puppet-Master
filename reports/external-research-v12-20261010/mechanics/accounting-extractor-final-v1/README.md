# Final offline mechanical accounting preparation

READY for root's final frozen checkpoint and captures after all quiet. No live campaign extraction, candidate Goal, canary, host polling, source retrieval, stage writes, Git or publication was performed. This package is a copy of the pinned existing extractor with bounded additions; old code, snapshots and D pins are unchanged. The preparatory native Goal belongs to preparation, never a product candidate.

Root runs only after freezing inputs:

```sh
python3 -B ER12_RUNTIME/mechanics/accounting-extractor-final-v1/extract.py \
  --checkpoint /absolute/path/to/final-frozen-checkpoint.json \
  --runtime ER12_RUNTIME \
  --frozen-inputs \
  --output ER12_RUNTIME/mechanics/accounting-extractor-final-v1/final-snapshot.json
```

The freeze flag is root's attestation, not a live quiet check or atomic freeze. Concurrent input changes abort CLI saving. Output must be directly in this package. CLI also writes `DELIVERY-DISPOSITION.json` here, schema `er12.delivery-disposition-sidecar.v1`, with unchanged mechanical disposition records and provenance. No actual snapshot or disposition output was generated during preparation.

Optional `--host-manifest /absolute/path/to/manifest.json` reads a finite JSON object `{"files":["mechanics/final-native-host-capture-v1/host/exact.json"]}` (maximum 512 entries). Entries must resolve to direct JSON children of that exact host directory; traversal, science paths and other directories are rejected. No glob of that directory is performed. Optional `--root-terminal /absolute/runtime/mechanics/NATIVE_GOAL_TERMINAL-cohort4b.json` accepts one exact known root terminal filename under mechanics beginning `NATIVE_GOAL_TERMINAL` and ending `.json`. Root supplies its actual saved filename; preparation does not discover or collect it.

Added fixed reads: C-R1, C-R2, D-R1, D-R2 `mechanics/<cohort>-host-timing-v1/HOST_CAPTURE.json`; `mechanics/final-native-host-capture-v1/HOST_CAPTURE.json`; `mechanics/NATIVE_GOAL_ACTIVE-cohort4b.json`; `mechanics/D-R1-03-treatment-MISSING_FINAL.json`. Existing root terminal reads and the original observation inventory remain. Missing finite inputs are reported in `read_errors`. No mechanics-wide or science scan is added. The inherited inventory reads mechanical stage metadata, Goal-named receipts, authored Goal records, and original assessment labels; it does not analyze science/source bodies.

Schema `er12.accounting-extractor.final.v1` retains original metadata binding, route/tier, host proof and immutable provenance semantics. Original heterogeneous judgment records are retained as `original_record` alongside unchanged legacy label fields; missing fields remain UNKNOWN. No new grade is assigned. Declaration categories keep candidate, root, evaluation, preparation, support/monitor, and publication separate; support includes the original observation/evidence/mechanics/accounting setup classification.

Created-to-completed occupied lifetimes retain consumed cost, including failed attempts. Added `started_to_completed_context_seconds` starts at the first observed host run start. Arm/category `observed_started_to_completed_context_sum_seconds` and complete sums are distinct from created lifetime sums. Arm started unions and overlaps include retained authors. Run request/start/completion metrics and queue fields remain separate; handoff is UNKNOWN because no handoff timestamp contract exists. Partial observed sums never become complete totals when lifetimes are missing.

`attempt_terminal_latency_seconds` preserves request-to-terminal timing independently of `delivery_latency_seconds`. Missing-final dispositions and observed failures keep delivery latency UNKNOWN and preserve consumed lifetimes; candidate latency is UNKNOWN for those arms. Quiet host completion alone does not establish delivered science. Task delivery latency remains UNKNOWN without an independent delivery timestamp contract. The sidecar's existing judgment text is unchanged, including failure evidence pins; referenced failure/science files are not newly retrieved through the sidecar.

Native identities are deduplicated by the original explicit Goal ID or native-thread/creation basis. `raw_cumulative_meter_maxima` stores finite nonnegative maximum observations per raw field; `latest_raw_observations` retains every observation tied at the latest recorded numeric updatedAt. Repeated 0/100/100 yields maximum 100, never summed 200. These are raw observations, never billable tokens or effective compute. Raw records remain available with hashes/pointers; unknown identities remain separate rather than falsely merged. Blocked terminal is preserved as failure; `science_completion_inferred` is always false. Source/pass/closed counts never become progress. Billing, cache and vendor-effective settings remain UNKNOWN; root native meter is never campaign aggregate.

Run `python3 -B checks.py` for 15 finite synthetic checks. Temporary fixtures are created solely inside this directory and removed on completion. Checks cover duplicate/cumulative growth, blocked terminal, retained-author overlap, start versus creation, missing-final consumed failure cost versus delivery, queue/handoff separation, unchanged heterogeneous judgments, malformed originals/capture/manifest, finite missing files, exact manifest rejection of science, science-read sentinels, and immutable source hashes. `check-results.json` records results. `ORIGINAL-PIN.json` pins the original extractor; `SHA256SUMS.json` pins package deliverables. These checks do not run against the campaign.
