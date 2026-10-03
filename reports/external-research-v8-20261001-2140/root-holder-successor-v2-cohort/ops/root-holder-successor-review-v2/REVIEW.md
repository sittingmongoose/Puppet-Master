# Root holder successor v2 independent review

Decision: **SOURCE_ACCEPTED_RUNTIME_HOLD**. Accept only frozen source SHA-256 `77f869fe33387d426fc0fe66e146e0fad3ebbca08b386650773587b6748d1e35`. No decisive source HOLD finding was observed.

29/29 isolated tests passed: all 18 original tests plus 11 independent cases. The independent checks cover lock replacement after flock; parent replacement while waiting with the same hardlinked lock; epoch and monotonic expiry after flock; FIFO request rejection; predecessor byte mutation; write/fsync failure preservation and release; and three same-byte inode replacement observations. Exact source, handoff, test and receipt hashes matched the supplied freeze at both intake and close.

The utility uses the same pinned root mutex, shares both original cutoffs through waiting and holding, rejects duplicate/unknown request fields and unsafe symlink paths, and writes one distinct exclusive claim without overwriting. It performs no launch, subprocess, signal, provider or native activation. Its claim is flock acquisition evidence only: predecessor_exit_proven=false and native_case_activation=false.

Root must construct the concrete pinned request using its unchanged original integer native monotonic cutoff. Runtime launch, original root lock identity, predecessor liveness/natural exit and systemd MainPID were not tested or proved here. No live mutex/request/claim access, unit operation, source edit, provider/native action, profile/candidate/ledger/sibling access or canonical edit occurred.

Content-pinned input limitation: identical-byte atomic replacement of request/predecessor source/predecessor claim at the same admitted path passes validation across reads. The isolated tests retained parent and lock identity and unchanged byte digests/authority throughout; no duplicate mutex ownership, renewed clock, symlink traversal or overwrite followed. This is content/path pinning, not permanent input-inode provenance. Lock/parent inode drift remains rejected. Inputs are revalidated before claim rather than continuously throughout holding.

Synthetic write/fsync exceptions leave the distinct claim for root inspection and release the lock; retry preserves it. Actual storage stalls/durability, service integration and real predecessor exit timing remain untested.

Original reviewer birth: 1790993997.2604625. Original deadline: 1790994597.2604625 (600 seconds including preparation; no renewal). Review completed epoch: 1790994361.0443711, before that deadline. Test details and observed hashes are in REVIEW.json and TEST_RECEIPT.json. The owned review bundle is frozen by FREEZE.json and SHA256SUMS.
