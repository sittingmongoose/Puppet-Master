# Root holder successor v2 — source acceptance, runtime HOLD

The root's historical positive observation records a distinct, finite, once-only standby successor unit with MainPID 2422357, exact source/request argv and the same opened original mutex device/inode. Its exclusive successor claim is ABSENT/WAITING. Predecessor PID 1969270 remains the recorded owner under its unchanged source, claim, unit and RuntimeMax 28000 seconds. Active standby status does not prove handoff or current exclusive ownership. No native case activation or live predecessor exit is proven.

| Evidence | Published artifact |
| --- | --- |
| Actual successor source | [root_holder_successor_v2.py](ops/root-holder-successor-v2/root_holder_successor_v2.py) |
| Author tests and receipt | [18 mock tests](ops/root-holder-successor-v2/test_root_holder_successor_v2.py), [test receipt](ops/root-holder-successor-v2/TEST_RECEIPT.json), [handoff](ops/root-holder-successor-v2/HANDOFF.md) |
| Independent source review | [review](ops/root-holder-successor-review-v2/REVIEW.md), [decision](ops/root-holder-successor-review-v2/REVIEW.json), [test receipt](ops/root-holder-successor-review-v2/TEST_RECEIPT.json), [review driver](ops/root-holder-successor-review-v2/run_review.py) |
| Concrete root request | [request](ops/recovery-v1/ROOT_HOLDER_SUCCESSOR_REQUEST_V2.json) |
| Once-only bounded launch metadata | [launch](ops/recovery-v1/ROOT_HOLDER_SUCCESSOR_LAUNCH_V2.json) |
| Historical positive runtime metadata | [positive observation](ops/recovery-v1/ROOT_HOLDER_SUCCESSOR_POSITIVE_V2.json) |
| Original failed setter / guard | [guard repair observation](ops/recovery-v1/SUPERVISOR_RUNTIME_GUARD_REPAIR_V1.json) |
| Unchanged predecessor | [original nine-line source](ops/recovery-v1/durable_holder_v1.py), [original claim](ops/recovery-v1/SUPERVISOR_DURABLE.json) |

Independent decision is SOURCE_ACCEPTED_RUNTIME_HOLD. Author 18 and independent 11 passing mock tests total 29. These tests establish source/mock properties only. Content-pinned inputs can accept same-byte inode replacement; that is an explicit provenance limitation. Lock and parent identity are strict. The original author HANDOFF's runtime-pending statement is historical at its own source freeze; later root request/launch/positive receipts are separate, without converting source tests into live handoff proof.

The predecessor's unsupported RuntimeMax setter returned 1 and established no mutation. Root used a distinct bounded once-only standby unit, rather than altering the original source/claim/unit. The successor RuntimeMax 18565 seconds was derived under unchanged epoch cutoff 1791013030.8303788 and native monotonic cutoff 234777000142921; acquisition and holding do not renew either. No new native or campaign budget is implied. The guard receipt is a safe structural failure projection: original captured stderr is omitted, with the unsupported-property reason and exit/mutation facts retained. No live unit operations or observations were performed by this publisher.

This positive publication includes exactly 20 original source/metadata files plus handoff, notes and portable checker. Isolated copies, temporary directories, raw journal/stdout/stderr capture bodies, native streams/conversations, process contexts, profiles/auth, SDKs, native case answers and evaluator keys are excluded. Source/review inventories retain omitted path/hash locators; those do not authorize dependency export or serve as hashes of sanitized public files. No previous cohort was modified.

[PUBLIC_EXPORT.json](PUBLIC_EXPORT.json) separates original/public SHA-256 hashes and byte counts. LAB_ROOT, WORKTREE_ROOT and USER_HOME replace host paths; sess_ handles use consistent pseudonyms; internal execution/thread JSON keys are omitted. Embedded original source/request/inventory pins remain original-runtime provenance. Sanitized source paths, source-byte hashes and unit/timer assumptions mean source/timer replay is not portable. This bundle does not establish current liveness, exclusive transfer, native case activation, model quality, timing cure or a winner.

Run `python3 -I -B verify_public.py .` here for portable artifact-hash verification. The optional timing declaration map is absent, so timing_declarations_present_and_valid=false is expected. This checker verifies hashes and optional declarations only; it executes no holder source/tests, changes no unit/ledger/lock, and proves no live handoff or native replay.
