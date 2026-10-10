# Offline accounting extractor v1

Rerun with Python's standard library (callable by root; root privileges unnecessary):

```sh
python3 -B ER12_RUNTIME/mechanics/accounting-extractor-v1/extract.py \
  --checkpoint ER12_RUNTIME/root-checkpoint.json \
  --runtime ER12_RUNTIME \
  --output ER12_RUNTIME/mechanics/accounting-extractor-v1/current-snapshot.json
```

`extract(checkpoint, runtime)` returns the JSON object without writing. CLI writes only its explicit output inside this directory. No network, host collection, native polling, dispatch, review, Git, account/provider operations or input mutations occur. A final collector can supply additional raw observations in the existing bounded directories before rerunning.

All checkpoint attempts remain, including failed, superseded and unsupported contexts. Logical arms are unique candidate `(slot, arm)` pairs, never stages/files/tasks. Candidate, preparation, root, evaluation, publication and support accounting are separate. Root meters are not a campaign aggregate.

Host request/start/completion times come only from saved raw run records. Conflicting fields stay UNKNOWN. Quiet final requires the latest observed host snapshot to show no pending/active work and complete run coverage. Status receipts alone cannot supply a timestamp. Context lifetimes include waits: sums count occupied contexts, unions count wall time, and their difference preserves overlap. Missing lifetimes prevent complete totals; unobserved descendants remain unknown. Candidate latency requires first-request and correct quiet-final host proof: A2 treatment ORIGINAL investigator, A7 treatment critic-finalizer, ordinary full-pipeline reviser, B role. Stage deadlines bind only when the current request key matches the declared attempt; superseded metadata is retained unbound. Lateness and enforcement remain separate from source judgment.

Raw native fields/objectives/meters retain path, SHA-256 and pointer provenance. `/decoded` pointer segments document JSON-string decoding. Explicit Goal IDs deduplicate repeated active/terminal observations. Codex's thread-plus-creation grouping is labeled as such; its unavailable explicit Goal ID stays UNKNOWN. Local stage-path receipt joins can span attempts and do not prove original identity. Authored receipts/Markdown records remain distinct from raw host dynamic-tool proof. Cumulative meters are never summed, including repeats or uncertain overlapping scope.

Requested priority/default/mixed/vendor strata use recorded route options; the tier revision never fills missing settings. Vendor means routing family. Billing, cached input, effective settings and campaign billable tokens stay UNKNOWN. Existing own assessment labels and frozen mechanical labels are joined unchanged with hashes, never newly adjudicated. Delivery counts do not imply source/native PASS.

Inputs are bounded observation directories, named policies, mechanical stage metadata, Goal records and existing own assessment labels/reviewer receipts. Science/source bodies are not analyzed. `source_manifest` hashes bytes read; `sources_changed_during_extraction` detects concurrent changes. This is not an atomic campaign freeze. `read_errors` preserves absent/empty JSON; raw nulls remain null, unavailable derived values use `UNKNOWN`.

`python3 -B sanity.py` checks the snapshot against existing repeated-Goal and overlapping-host examples only; results are in `sanity-results.json`. Snapshot/checks and this task's `native-goal-precompletion.json` were saved before native completion.
