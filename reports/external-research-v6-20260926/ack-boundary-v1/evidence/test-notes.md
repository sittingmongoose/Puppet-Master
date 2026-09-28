# Offline acknowledgement tests

`tools/test_ack_boundary.py` exercises the actual `CompletionReader` / `MuseCompletionFeed` → `CompletionStore` path with artificial structural findings. No inference, native process, API, account, candidate, evaluator, research corpus or answer key is invoked. The native-shaped events are minimized derivative fixtures, with source shape pins maintained in the fixture documentation; this is deterministic host-side testing, not a replay of a native application's private write implementation.

The producer opens marker files, publishes empty/partial bytes, and retains its handles while the consumer polls. Fixed scheduling determines when the producer writes the remaining bytes and emits terminal/result events. Logical clocks advance through 0, 1, 1,000,000 and 1,000,000,000,000 seconds while the same operation remains pending. No sleeps, size-stability gate or elapsed-time acknowledgement is used.

Coverage:

- Empty and partial markers stay pending through multiple polls and completed-looking bytes until matching native terminal **and** result evidence arrives. Pending operations remain counted separately from acknowledged submissions.
- Six simultaneously open markers interleave with an independent completed finding, finish in a different order, and coexist with multiple revisions. Acknowledged history and host identity remain stable.
- Payload completion must precede marker start. Completed empty/wrong markers and empty/malformed payloads receive genuine `INVALID` feedback with their raw snapshots; failed/missing completion receives no fabricated receipt.
- Failed operations without a visible file remain counted. Missing terminal/result, cap, cancellation and an unterminated final JSONL frame remain explicit incomplete/failed evidence. Pending raw bytes are retained outside acknowledged history.
- Duplicate success notifications produce one acknowledgement. Wrong session, call identity and result path cannot commit; late events after close cannot reopen the receiver.
- Completed snapshots and persistent state exist before receipt publication. Actual payload/marker changes latch violations even after restoration. Current/historical snapshot corruption and altered frozen projections remain detected.
- Invalid and pending latest revisions withhold their older content while independent valid findings stay available; subsequent genuine valid revisions preserve full history. An older pending revision does not suppress a newer accepted revision, and its later acceptance cannot replace a newer invalid revision. Two revisions committed in one native call batch use the ordered call ordinal even when filenames and completion order run in reverse.
- Twenty settled polls issue zero projection `write_text` calls. Actual mutation still causes diagnostics/publication; another twenty settled polls again issue zero writes.
- Partial JSONL records are carried between polls, complete records are parsed once, and appended native records read only the new suffix (observed file read offsets and byte totals). Closure verifies the consumed prefix. A partial MSP `session/start` response cannot bind the receiver before the complete response arrives; absent binding and bound missing/empty journals close explicitly incomplete.
- The actual host adapter watches a finite stub process. Its normal/cap/cancellation schedules invoke no `Popen` or sleeps. Quiescence occurs before incomplete bytes are captured, nonzero exit remains failed, and cap/cancellation remain globally incomplete even with valid content. A failed cleanup callback is attempted once; an active writer leaves evidence unclosed with an explicit failure, while a callback that raises after stopping the writer records the error and closes cancelled.
- Missing-at-acceptance payload bytes remain genuinely invalid without inventing an idle mutation; newly appearing bytes after acknowledgement are detected. Orphan payload names retain raw bytes and keep the overall result incomplete.
- An adversarial synthetic `edit_file` event invalidates accepted input even when source bytes were restored between polls. This is conservative invalidation coverage only: the stopped I2 corpus does not establish an observed or qualified native Edit route.

The frozen synthetic delivery-v2 `valid`, `revision`, `unknown-field` and `malformed` findings are read directly, with SHA-256 checks in the test module. Relevant chronology/current/history/mutation assertions were adapted from the unchanged `delivery-v2/tools/test_delivery_store.py` (SHA-256 `af6e060486a4ccf72eb8621f49474ce4b60b7fea57d0d9e7837086f043c712a2`). The earlier completed-file tests alone were insufficient for this boundary.

Set `ACK_BOUNDARY_TEST_EVIDENCE` to an absolute scratch directory outside the product repository to retain every synthetic workspace, journal, snapshot and receiver state on cleanup. Run logs and a path/SHA-256 trace manifest are retained separately from the compact repair bundle. These tests establish the bounded offline receiver behavior; they establish no native runtime timing, durability/security guarantee, semantic research result, token/cost saving or end-to-end speedup.

Final retained run: **36 tests passed**, exit 0; 47 synthetic workspaces and 657 trace files retained. The test module, fixture helper and three receiver source files were hashed before and after the run and remained unchanged. The 5.289-second unittest duration includes copying raw evidence during test cleanup and is not a receiver latency measurement.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/scratch/ack-boundary-tests-20260928-clejp4fa/`.

| Artifact | SHA-256 |
|---|---|
| `run-receipt.json` | `ef950a28b3d9d67fdfc0fdb9a2092b030474d96d1f0b04acb09714abbeee94b3` |
| `test-run.log` | `ac7d1c6d8473fadc31b3df1709feec25a09f0e7bc2a3744783940d6dd8f03c89` |
| `trace-manifest.json` | `da2eb0b91d0d565f2bf7ffc9ee9d8da0e53e8d52720cf072a532a62969141730` |

The manifest gives the absolute path and SHA-256 of each retained synthetic journal, snapshot, state and feedback artifact. Raw traces remain outside the product repository. `run-receipt.json` pins the tested code: test module `bac64cc0f47cfde8c30245d47f9fa5325fd1ecf98ffd0997daf8faa6a4f2db06`; store `a1e460bd38afa2fab09d28442a7b59d2ac295aaee8921f9c127b57946c20f909`; reader `83dac66a29bc0778ed0edfa134fd04db03eda34602e5c80d5938c17c4dc2fd38`; adapter `3edefb29c495a642dc70748dd0a07b43cccc1493a74caee3ab7c4a855347d283`; synthetic event helper `8423ffabb9b2ded62d6b1b60933e8606b2957339cfe5102c7f2e21f856823328`.
