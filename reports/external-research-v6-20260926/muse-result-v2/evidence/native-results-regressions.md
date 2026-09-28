# Offline reader-to-Store regression evidence

PASS: 53 test methods (36 original imported/inherited methods and 17 focused
successor methods). This is development regression evidence with synthetic
native-shaped event envelopes. It is not a native experiment result, semantic
research grade, source-fact verification, or live marker/ack qualification.

The test imports the unchanged `ack-boundary-v1/tools/test_ack_boundary.py`,
hash-pins that file plus its fixture builder, Store and host receiver, and
inherits its `AckBoundaries` methods. It substitutes only the successor
`CompletionReader`/`MuseCompletionFeed` binding. The isolated frozen
`CompletionStore` is reused unchanged, including its parser, capacities,
snapshot-before-ack behavior and current-projection logic. Frozen host imports
are bound to those modules inside the temporary test context. Nothing creates
a Store against an original captured workspace.

Focused checks cover both payload and marker Writes:

- Plain results and the exact near-duplicate-sibling advisory, individually
  and together; raw text and delimiter-plus-advisory retained verbatim in
  operation data, completion proofs and final Store state.
- Persisted state and both byte snapshots exist before the annotated receipt
  is written; acknowledged bytes are the original pinned fixture and marker.
- Recognized wrong byte count, wrong path and `.other` prefix lookalikes,
  with and without advisory, fault and cannot acknowledge.
- Arbitrary/error/conflicting suffixes, changed punctuation, a sibling path,
  extra prose/newlines, non-string text and missing text remain unrecognized;
  unknown variants block acceptance and finalize explicitly incomplete.
- Extra status/error/unknown envelope fields remain unrecognized, with the
  entire original result record retained instead of an invented structured
  provider success contract.
- Missing/wrong result call/index identity and mismatched terminal
  effect/task/task-stream identity prevent completion. Failed and
  contradictory terminal statuses remain failed despite success-shaped text.
- Missing result events stay pending; success-shaped prose cannot bless
  changed filesystem bytes, even with identical byte length. The unchanged
  Store retains those bytes in an INVALID snapshot.
- True mutation after acknowledgement stays invalidated after restoration;
  identical annotated duplicate notifications never duplicate receipts or
  snapshots; conflicting annotated duplicates fault and withhold findings.

The inherited 36 methods retain interleaving, latest-attempt ordering,
pending/cancellation and cleanup handling, MSP binding, raw pending retention,
snapshot corruption, incremental native-journal reads, prefix verification,
and idle-publication coverage. No mechanisms or original tests were rebuilt.

Run command:

```sh
ACK_BOUNDARY_TEST_EVIDENCE=/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/muse-result-v2/evidence/synthetic-traces-final python3 /home/sittingmongoose/PM-Experiments/external-research-v6-20260926/muse-result-v2/tools/test_native_results.py
```

The final raw synthetic traces live only on the VM at that evidence path:
146 disposable workspace captures, 1,535 hashed files. The earlier 52-method
development capture is separately retained under `evidence/synthetic-traces`;
it is excluded from the final manifest. Do not publish either raw tree into
the product repository. All inputs needed for portable reruns use the existing
relative sibling layout under the experiment/report root: `ack-boundary-v1`,
`delivery-v2`, `i2-prep`, and `muse-result-v2`.

Final artifact identities (all below
`/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/muse-result-v2/`):

| Path | SHA-256 |
| --- | --- |
| `tools/test_native_results.py` | `bb6d8e47a2a93a04e60beca87db63dd5db95dd6186dd97e07b673bc551641248` |
| `tools/native_completion.py` tested successor | `3c125f305febe3bcc84fd240edf94ca90d4651ccf88dda0b10dbf5db739dc52c` |
| `evidence/native-results-tests.log` | `11c0a00f8b2d832010b81fdb17659553e57158d13e85642f6e6868f635e1ee48` |
| `evidence/native-results-trace-manifest.json` | `5ad9e65976f5aaf31adbd74c12acbeee97bad533c24e0ec7644ba1b41ef34dcf` |
| `evidence/native-results-regression-receipt.json` | `9ae82179ffc9da24e788a63a4883c6c153d698db35f88fcd228c3284f58379e1` |

The receipt records every tested source identity, exact command, test counts,
raw trace locations and zero native/provider/account/candidate/evaluator calls.
No canonical Plans or frozen source file was edited. These tests make no claim
about the separate A1-M raw replay or the independent offline audit checks.
