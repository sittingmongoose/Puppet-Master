# ER11 measurement limits

Generated from the allowlisted control metadata at **2026-10-09T19:32:41.895Z**. Snapshot status: **PROVISIONAL_NONTERMINAL**. Rerun with `python3 accounting/calculate.py` from any directory; it writes this file and `TIMING.json`/`TIMING.csv` under `accounting/`.

## Scope and schema

One arm row is retained for every entry in `control/state.json`, including failed and invalid-infrastructure originals. Stage rows preserve the requested/accepted clocks, recorded deadlines, T3 status and handoff IDs, native observations, per-session counters, and artifact file metadata. The JSON `schema` object is the compact field guide; CSV has one `arm` row and one `stage` row per observed record. JSON unknowns remain `null`; CSV unknowns are empty.

Declared final-stage mapping: M05 = retained-author research; M03 = critic-finalizer; all other methods = reviser. `delivered` records T3 result availability for that declared final stage. `correct_declared_final_stage` is only a lifecycle/stage check; it makes no scientific-quality judgment.

## Clock and counter limits

- Stage `queue_wait_s` is the observed `requestedAt` to `acceptedAt` gap, a queue-wait proxy. Candidate service is `acceptedAt` to an explicit native terminal observation; it stays null when the terminal clock is missing. Partial elapsed time to the last native observation is a separate field.
- Experiment slot wait is null because the authorized queue records have no slot request/start timestamp. Shared research, cache, and setup cold charges are unknown where unobserved.
- Recorded `requested_at` and deadlines are used unchanged. `overdue_open`, `late_terminal_observation`, and `deadline_passed_terminal_clock_missing` remain visible; the last label is not reclassified as on-time. A terminal observation timestamp is an observation time, not proof of the exact completion time.
- Goal/context token and time counters are retained per session only. Input, cached input, output, and reasoning counters may overlap; no session counters are summed. The root Goal counter is null in this campaign snapshot and would not represent the campaign total. No billing, quota, or dollar inference is made.
- Aggregate occupied time is the union of observed accepted-to-terminal/last-observation wall-clock spans. Right-censored spans and missing endpoints are listed in `aggregate.missing_coverage`; this union does not prove continuous execution.

## Artifact limits

Only stat, byte count, mtime, and SHA-256 are collected for conventional stage output slots. The observed mtime is the **last observed save**, not proof of first completeness. The declared evaluation timing/artifact files are missing at these exact paths: `jobs/evaluations/dispatch.json`, `jobs/evaluations/task-result.json`, `jobs/evaluations/host-runs.json`, `jobs/evaluations/freeze.json`, `jobs/evaluations/assignment.md`. Artifact filename probes are therefore non-authoritative; slot presence is not a delivery, validity, or completeness judgment. No artifact contents or sealed case contents are opened.

No result is graded and no faster-fail claim is computed. Exact pair timing fields remain descriptive until root attaches qualifying quality, native-lifecycle, and protocol axes. Active or nonterminal snapshots are marked provisional.

Snapshot counts: 41 allocated arms; 41 started; 23 delivered at the declared final stage; 5 failed/invalid originals retained. Whole-arm deadline eligibility: 12 eligible, 6 ineligible, 23 unknown. These are clock/lifecycle counts only.
