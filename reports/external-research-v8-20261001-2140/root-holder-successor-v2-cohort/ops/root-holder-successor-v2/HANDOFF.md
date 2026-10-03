# Root holder successor v2 source handoff

Status: SOURCE READY; runtime HOLD pending root source review, concrete root-authored request, bounded once-only successor-unit launch, and positive MainPID proof. No live launch, live root-lock acquisition, root-request write, or claim write was performed. Original predecessor source, claim, unit, budgets, pauses, counters, and global cutoff remain unchanged.

Original author birth 1790993412.9046082; deadline 1790994012.9046082; source/test freeze completion 1790993882.2921708. No clock reset. Global epoch remains 1791013030.8303788.

Source: `LAB_ROOT/ops/root-holder-successor-v2/root_holder_successor_v2.py`
SHA-256: `77f869fe33387d426fc0fe66e146e0fad3ebbca08b386650773587b6748d1e35`
18 temp/mock tests passed; receipt and tests are pinned in TEST_RECEIPT.json and SHA256SUMS. All mocks and temporary lock/claim/request files were created inside this owned directory and removed by TemporaryDirectory. Python bytecode cache was removed before inventory.

Prospective utility CLI (root must substitute only its concrete request digest):

```sh
/usr/bin/python3 LAB_ROOT/ops/root-holder-successor-v2/root_holder_successor_v2.py --root-request LAB_ROOT/ops/recovery-v1/ROOT_HOLDER_SUCCESSOR_REQUEST_V2.json --request-sha256 <ROOT_CONSTRUCTED_REQUEST_SHA256>
```

No live request is supplied. Root constructs the request at exactly the above controlled-parent path, then hashes its exact bytes. JSON must contain exactly these fields, with no duplicates or unknown fields:

| Field | Required value |
| --- | --- |
| schema | pm.er8.root-holder-successor-request.v2 |
| root_authority | JSON true |
| deadline_epoch | finite number 1791013030.8303788 |
| native_global_cutoff_monotonic_ns | unchanged integer from root's current known V7CASE_AUTHORITY, positive and <= 2^63-1 |
| source_path | LAB_ROOT/ops/root-holder-successor-v2/root_holder_successor_v2.py |
| source_sha256 | 77f869fe33387d426fc0fe66e146e0fad3ebbca08b386650773587b6748d1e35 |
| predecessor_source_path | LAB_ROOT/ops/recovery-v1/durable_holder_v1.py |
| predecessor_source_sha256 | 48907c8afa5b6a8699b61d01528466e4c5b838ac2bdb955f4420738dc2a12788 |
| predecessor_claim_path | LAB_ROOT/ops/recovery-v1/SUPERVISOR_DURABLE.json |
| predecessor_claim_sha256 | e0b37dcddefe3d6fcad80a913701cb69729b467bd0ffbf34b535f54dab3211b9 |
| predecessor_pid | integer 1969270 |
| predecessor_unit | er8-v8-root-durable-20261002-2348.service |
| lock_path | LAB_ROOT/ops/recovery-v1/supervisor.lock |
| lock_device | positive integer from root's exact lock stat |
| lock_inode | positive integer from root's exact lock stat |
| successor_claim_path | LAB_ROOT/ops/recovery-v1/SUPERVISOR_DURABLE_SUCCESSOR_V2.json |
| successor_unit | er8-v8-root-durable-successor-v2.service |

Root launches only accepted exact source in its bounded distinct unit. No setter retry or original-unit operation is needed. Utility does not create/launch units, exec, subprocess, signal, fork, start threads, activate cases/providers, read profiles/auth/candidate/eval/sibling/current ledger/case bodies, or edit environment. Root must derive any service duration from the unchanged global cutoffs; no newly granted budget is implied.

The utility validates request/source/predecessor byte hashes, exact known paths/metadata, strict finite clock fields, every parent component with O_NOFOLLOW, and opened lock device/inode. It waits LOCK_EX|LOCK_NB with sleeps <=0.2s bounded by both original cutoffs. Before claim creation it revalidates pinned inputs and lock identity. Claim creation is O_EXCL/O_NOFOLLOW and fsyncs file plus directory. Waiting and holding share the same request cutoffs; acquisition never renews them. It closes its own descriptors at cutoff/failure, without removing files or clearing another lock. Any already-created incomplete claim after an I/O failure remains for root inspection; no automatic overwrite or cleanup occurs.

Claim records exclusive flock ownership only at acquisition. It explicitly records predecessor_exit_proven=false and native_case_activation=false. It is not predecessor exit proof, current liveness proof, or native-case authority.

Tested: busy-lock expiry with no claim/renewal; epoch and monotonic expiry before acquire; one acquisition/claim and positive release; both unchanged cutoffs through holding; exclusive claim collision and claim symlink collision preservation; source/request/predecessor hash failures; predecessor deadline drift; unknown/duplicate fields and path ambiguity; nonfinite/type/oversized monotonic fields; input/parent symlinks; lock inode replacement before acquire and while waiting; request mutation after acquire.

Untested: live root lock/service integration; actual predecessor natural exit/timing; runtime systemd launch/MainPID proof; real service termination or fsync fault injection. The live predecessor was only observed through its known unit metadata (active MainPID 1969270; RuntimeMaxUSec 7h46m40s).
