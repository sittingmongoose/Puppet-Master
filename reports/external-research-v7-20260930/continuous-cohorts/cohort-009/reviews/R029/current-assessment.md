# R029 immutable CURRENT assessment

Verdict: **quality failure**. Complete review coverage: **true**, which does not mean every claim is correct.

Seven coherent findings cover both families, but the report treats at-op as an unconditional snapshot escape, calls tree-state deletion safe with only rehash loss, misidentifies empty op-head markers as corrupt objects, and denies explicit pinned BrokenPipe handling. These affect its safe-observation and recovery advice despite substantial correct source work.

Report SHA-256: `ac2b736ae8180ba31839cf0e80f9d48ef0783fdfb492fb90d78f5a65775c348c`
Stage SHA-256: `c318e89d96b777b6c9a73ccb68946ccd831a14caa887a947bd10f59afa115f44`
Scope: literal original two coherent families / five-to-eight findings; six opportunity families, 16 independently derived actual/shared criteria; 78 claim rows.

All 431 repository files, 624 patches and 68 issue bodies retained; all ordered sources byte-exactly reconstructed. Five PNGs remain visually unresolved under the text-only guard.

## Required scope

| Criterion | Coverage | Assessment |
|---|---|---|
| scope_and_pin | full | Exact original pin/full source and image limits explicit. |
| two_coherent_families | full | Seven findings cover both original families with concrete design choices. |
| exact_locators_and_versions | partial | Many precise code/issue locators; wrong universal flag and safe-reset conditions remain material. |
| evidence_roles | full | Documentation, body, current capture, later transcript, source tests and UNEXECUTED proposals differentiated. |
| temporal_and_missing_links | full | Capture/release and later recovery/version uncertainty generally retained; declared missing links stay unresolved. |
| observation_effects | partial | Strong conditional snapshot/cost mechanics; at-op=@ and repository mutation counterevidence omitted from read-only advice. |
| workspace_state | partial | Shared repo/secondary Git gap and forget/rename semantics useful; any foreign workspace stale overgeneralizes. |
| concurrent_mutation_limits | partial | Repo/working-copy locks and colocated TODOs developed; recorded-tree guards do not cover every human file edit. |
| completion_and_delivery | partial | Correct #4239 ordering history; EPIPE special handling falsely denied and old-operation residual overstated. |
| recovery | partial | Stale/missing-op mechanisms and manual history useful; safe tree-state deletion and empty op-head corruption unsupported. |
| failure_history | partial | Good #4239 chain and dated crash reports; corrupt-head/state safety deductions fail pinned source. |
| mechanism_and_counterevidence | partial | All material claims assessed; precise source conditions counter overbroad safety advice. |
| integration_transfer | partial | Concrete safeguards/alternatives and transfer limits; read-only/reset advice cannot be promised as written. |
| unexecuted_validation | full | Six proposals explicitly unexecuted, all logical expectations individually qualified. |
| unresolved_and_novelty | full | Image/source gaps retained; supported novelty covers hard-crash transcript and secondary Git-tool gap. |
| standalone_current_report | partial | Coherent complete report, but safety-critical source contradictions prevent quality acceptance. |

## Every material claim

### C001 — report lines 5-5

Hypothetical companion context and both original question families

**supported** (current assertion). Exact original brief agrees; product is hypothetical, so implementation evidence is a transfer constraint.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/brief.md` (lines 1-7); SHA-256 `6455c54d08627a6669c8f176a5cfb1e1c23578a183f3e606addadcf59eefff36`

### C002 — report lines 6-6

v0.22.0 commit, 431 tracked files, 68 issue bodies captured 2026-09-30

**supported** (current assertion). Pinned source manifests, complete reconstruction and original capture index agree.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/PIN.json` (lines 1-5); SHA-256 `6cb6112d93cdecd21d5e9a57db5f878b1afac553012e99f008e0c4102a503342`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/PIN.json` (lines 439-441); SHA-256 `6cb6112d93cdecd21d5e9a57db5f878b1afac553012e99f008e0c4102a503342`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues-index.json` (lines 1-5); SHA-256 `6a6e593591ccd033b424101f2470effebc2cfd433dc97bb345e555dafac726d6`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues-index.json` (lines 687-689); SHA-256 `6a6e593591ccd033b424101f2470effebc2cfd433dc97bb345e555dafac726d6`

### C003 — report lines 6-7

Every local range read via named boundary tool; documentation/issue navigation and no map use

**unresolved** (candidate method self-report). Actual candidate reads, navigation and operations are locked. The cited source content is independently checked; out/map-usage is not opened.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/TASK.md` (lines 3-5); SHA-256 `85f1d348299d9cb65e568d459f188713a592550ccd92624d46b5c494d25ff117`

### C004 — report lines 8-8

Mechanisms pinned; capture status separated from release history; five exact PNGs unviewed

**supported** (current assertion). Correct source/version discipline and explicit image gap. All five raw/ordered base64 sources are independently reconstructed; no visual-derived fact is credited.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/PIN.json` (lines 1-441); SHA-256 `6cb6112d93cdecd21d5e9a57db5f878b1afac553012e99f008e0c4102a503342`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues-index.json` (lines 687-689); SHA-256 `6a6e593591ccd033b424101f2470effebc2cfd433dc97bb345e555dafac726d6`

### C005 — report lines 9-9

No execution and six UNEXECUTED proposals

**unresolved** (execution disclaimer). The report labels test text and proposals correctly. Actual execution remains UNKNOWN, not established success or native failure.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/TASK.md` (lines 7-7); SHA-256 `85f1d348299d9cb65e568d459f188713a592550ccd92624d46b5c494d25ff117`

### C006 — report lines 13-15

Ordinary observation snapshots and may create commits/operations

**qualified** (current assertion). Most usual workspace-helper commands do so conditionally. The headline every ordinary command is broader than the source; mutating op abandon deliberately bypasses snapshot. No changed tree means no snapshot transaction.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 366-386); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1536-1643); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/abandon.rs` (lines 47-61); SHA-256 `9d8c2bfcc0cb1dc3bb7441fe08d0af9f9ca1775483be4f44139ece662a7a0a0e`

### C007 — report lines 16-16

Maybe_snapshot imports colocated Git HEAD, snapshots, then imports refs; changed tree rewrite/rebase/export/transaction sequence

**supported** (current assertion). Exact pinned pipeline and conditional transaction confirm each step.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 897-916); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1536-1643); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C008 — report lines 16-16

Implicit tracking controlled by snapshot.auto-track

**supported** (current assertion). Docs and options match; ignore and matcher conditions still apply.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 10-27); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 186-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`

### C009 — report lines 17-17

Clean tracked-file test compares type/mtime/size and requires mtime older than state own_mtime

**supported** (current assertion). Pinned extraction and get_updated_tree_value implement precisely these conditions.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 468-509); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 619-625); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1134-1185); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C010 — report lines 17-17

Parallel scan skips .jj/.git, untracked ignored files, oversized new files; listed SnapshotError variants

**supported** (current assertion). Direct source confirms traversal, ignore/auto-track gates and size cap applying only to previously untracked files.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 934-958); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1037-1064); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 142-184); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`

### C011 — report lines 18-18

#4545 open Chromium Watchman 209ms/58ms cost, stale/trigger concerns; #4508 open macOS 150k/24-core exact timings

**supported** (current assertion). Faithful attributed issue-body evidence, not independently executed benchmarks. #4508 platform version is OS and does not pin every jj implementation version.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4545.json` (lines 1-88); SHA-256 `a6f9011c0ebda172ab04e2edcae10945a464556b871f2824e8f811351c1d0ae6`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4508.json` (lines 1-99); SHA-256 `7574413e1681fc1e3c15cd306399095b9c722e312ae8bbfe77275df262e934cb`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 939-939); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C012 — report lines 19-19

--at-op always skips snapshots; mutating commands then refuse

**contradicted** (current assertion). At-op=@ is explicitly considered head and may snapshot. Only commands requiring writable WC enforce this guard; historical operation repository mutations are deliberately allowed, and op abandon is another bypass.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 424-438); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 881-895); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 91-97); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/abandon.rs` (lines 47-61); SHA-256 `9d8c2bfcc0cb1dc3bb7441fe08d0af9f9ca1775483be4f44139ece662a7a0a0e`
- Material failure: `R029-F1-option-and-mutator-scope`

### C013 — report lines 19-19

Ignore-working-copy suppresses maybe_snapshot and writable-WC guard has exact cited error

**supported** (current assertion). Pinned conditions/error text are exact, while the blanket extension to every mutator is separately contradicted.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 853-854); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 881-916); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C014 — report lines 20-20

Unchanged tree can advance WC operation id without rewriting files; embedding read queries avoids CLI snapshot pipeline

**supported** (current assertion). Conditional free update and snapshot dirty handling support the distinction; library query behavior is not every embedded operation.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2455-2481); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 795-906); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 897-916); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C015 — report lines 21-21

Background refresh can capture edits and cost time; supplied SnapshotOptions make policy caller responsibility

**supported** (integration proposal). Useful derived constraints grounded in conditional snapshots and the attributed issue measurements.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1602-1639); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 186-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4545.json` (lines 1-88); SHA-256 `a6f9011c0ebda172ab04e2edcae10945a464556b871f2824e8f811351c1d0ae6`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4508.json` (lines 1-99); SHA-256 `7574413e1681fc1e3c15cd306399095b9c722e312ae8bbfe77275df262e934cb`

### C016 — report lines 21-21

--ignore-working-copy/--at-op are read-only invocation modes

**qualified** (integration proposal). These suppress some WC writes, not every repository write. Default head resolution can reconcile divergent heads even when WC is ignored; at-op=@ alone does not suppress snapshots. Explicit operation selection and ignore-WC are needed for the documented no-mutation op-log mode.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 424-485); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/log.rs` (lines 41-45); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- Material failure: `R029-F1-observation-read-only-loss`

### C017 — report lines 23-25

Repository operations deliberately allow concurrency and merge divergence lazily without a global serialization lock

**supported** (current assertion). Faithful source design; fine-resource/de-duplication locks coexist with the lock-free correctness model.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 35-38); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 80-127); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/op_heads_store.rs` (lines 52-56); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`

### C018 — report lines 26-26

Heads are empty filename markers; optional lock/re-read, filter ancestors, merge remaining views

**qualified** (current assertion). Source confirms the design, but one remaining filtered head returns without a new merge operation. The next ordinary unpinned load merges divergent heads; explicit @ resolution refuses ambiguity.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/op_heads_store.rs` (lines 63-138); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/simple_op_heads_store.rs` (lines 58-92); SHA-256 `30755eb32a63d29b57a93fb3858f9e1a3c5abdd13f05dae103817cb387965825`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/op_walk.rs` (lines 84-100); SHA-256 `69579bbc8d65f43949acb1b81728ae3f6278efe7b08a0b0339aac1e0a8776120`

### C019 — report lines 26-26

Command view fixed after load, content-addressed objects and conflicted view merge; @ refuses multiple heads

**supported** (current assertion). Direct design and op_walk implementation confirm each claim.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 80-127); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/op_walk.rs` (lines 84-100); SHA-256 `69579bbc8d65f43949acb1b81728ae3f6278efe7b08a0b0339aac1e0a8776120`

### C020 — report lines 27-27

#4465 reported concurrent abandon/edit op-show panic on 0.21; closed June2025; unresolved at v0.22 unless verified

**supported** (historical report with unresolved pinned status). Body, version and capture date agree. Later closure is not itself proof of pinned reachability. The explicit unresolved-at-pin qualification is appropriate.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4465.json` (lines 1-130); SHA-256 `ce41618f43514866713c7b26982deacef21910f93c0d6f2dcbf426e84c027c5d`

### C021 — report lines 28-28

Git backend corruption and untested distributed-FS/bookmark caveats admitted; bad-locking test source simulates directory merges

**supported** (current assertion). Docs and test helpers/cases directly support the stated transfer limits. Test source is not runtime evidence.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 51-61); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/tests/test_bad_locking.rs` (lines 28-141); SHA-256 `23daa5cd550d294ef540ff8ed4a9823fc719bfd257d7192e78cd645aa6310d13`

### C022 — report lines 29-29

Fine-grained FileLock resources and WC checkout mismatch guard coexist

**supported** (current assertion). Platform declaration/source tests and workspace check support this counterevidence.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/lock.rs` (lines 15-65); SHA-256 `ba1763e5730e9c7232b883a6a0280abf45b0fb1e42ec403a22689d37755eb934`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 420-449); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`

### C023 — report lines 30-30

Cached loaded repos need reload; tolerate conflicted views and avoid unsupported distributed/colocated promises

**supported** (integration proposal). Useful derived safeguard; source explicitly fixes the command view and reloads when a WC operation is ahead.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 80-114); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1560-1570); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 51-61); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`

### C024 — report lines 32-34

WC consistency guarded by real state lock and before/after comparisons

**qualified** (current assertion). Applies to cooperating state transitions, not all user/editor/Git writes to files. Source still has file-overwrite race TODOs.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 420-449); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1048-1056); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1440-1440); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C025 — report lines 35-35

Workspace state/type directory, shared .jj/repo pointer, start_mutation/finish contracts

**supported** (current assertion). Exact state construction, pointer writer/loader and trait contracts corroborate these facts.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 120-149); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 345-377); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 549-563); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 64-66); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 136-139); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`

### C026 — report lines 35-35

ConcurrentCheckout expected-tree mismatch and CLI Concurrent working copy operation guard

**supported** (current assertion). Recorded tree-id comparisons and error mapping are present; neither is a human-file lock.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 420-449); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 256-259); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1048-1056); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C027 — report lines 35-35

Tree state NamedTempFile then own_mtime and persist atomic-by-rename

**supported** (current assertion). Pinned implementation directly provides this file-replacement sequence, not cross-store/crash durability.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 683-705); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C028 — report lines 36-36

Three colocated duplicate-WC-commit TODOs and op-id-after-lock insufficiency

**supported** (current assertion). Exact TODO explicitly records these possible races; it is not a measured guarantee of routine failure.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 918-973); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C029 — report lines 37-37

Reuse lock/verify/mutate/finish, retry or surface concurrency errors, invalidate on external Git HEAD

**qualified** (integration proposal). Useful proposals; embedded flow versus CLI choice is not proven superior, retry requires reloading/revalidation and queues cannot protect human edits.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1048-1056); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 934-942); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1440-1440); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C030 — report lines 39-41

Stale desired WC tree is surfaced with update-stale hint; #4239 historically caused this and pin contains reordering

**supported** (current assertion). Docs, exact detection/hints and before/after patch support the narrower concrete history.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 94-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1572-1598); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 43-63); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C031 — report lines 42-42

Four freshness states and tree-first/common-ancestor classification, reload and three error paths

**supported** (current assertion). All stated branches/messages match pinned implementation. Tree equality short-circuits operation age, relevant to later residual-risk statement.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2214-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1560-1598); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C032 — report lines 43-43

Update-stale snapshots known operation, merges, rechecks tree then checks out/finishes

**supported** (current assertion). Exact command confirms conditions and ordering.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-108); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`

### C033 — report lines 43-43

ObjectNotFound old WC operation triggers child recovery commit/recover; April2025 #4423 transcript shows recovery commit

**supported** (pinned source plus dated later history). Pinned trigger is exactly ObjectNotFound, not arbitrary corruption. Official comment 2782472662 contains the later transcript; its binary version is not independently pinned, so it corroborates later history only.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 110-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 113-118); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)

### C034 — report lines 44-44

#4239 dates/completed state, body symptom, maintainer mitigation and PR4517 timeline

**supported** (current assertion). Body and primary dated events 2275287126/2365243059 plus PR metadata verify these exact facts. Entire frozen fix patch independently reconstructed and changed hunk read.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4239.json` (lines 1-130); SHA-256 `1f47a5da278ef981bde5e474a800b692ce72ea3a53f6c91408bfa975b127c795`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/issues-4239-timeline.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `ebdf5d3a099ea7153d66e7b828490b324bfb8373acc039b741045bb9dd8175d7`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4239/timeline?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/pulls-4517.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `bfa8e02edd83ce7939e511b21df4e84d1dfc45c866f63791b4b6b6c21b9e136d`; [official source](https://api.github.com/repos/jj-vcs/jj/pulls/4517)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 1-63); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`

### C035 — report lines 44-44

Finish_transaction comment/order expected to fix reporting-path repro at pin; no execution claimed

**supported** (current assertion). Direct source and regression expectation changes confirm intended ordering. Actual runtime result remains UNEXECUTED.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1699-1801); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 43-180); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/tests/test_repo_change_report.rs` (lines 16-103); SHA-256 `6614e2b5a4c457dc4b0fd9b0beb9052d3c9b810d00bdff4829be1a043fb5ddfd`

### C036 — report lines 45-45

Kill between snapshot tx.commit and finish leaves old operation and therefore classifies stale and update-stale repairs

**qualified** (current assertion). Old state id is plausible, but stale does not follow from old id alone: equal recorded/desired tree returns Fresh; otherwise ancestor relationship or unreadable store determines result. Checkout partial files also lack a resume marker.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1639-1641); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1861-1863); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- Material failure: `R029-F4-old-operation-implies-stale`

### C037 — report lines 45-45

SIGKILL/power loss outside cleanup handlers

**supported** (current assertion). Narrow signal registration and normal-drop distinction establish this limit; source does not prove every crash residue repairable.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 65-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`

### C038 — report lines 46-46

Surface freshness, decouple display failure, one-click update-stale and retry UI

**qualified** (integration proposal). Useful derived ideas. SiblingOperation is an internal-error branch, not always normal application state, and recovery/retry still requires a loadable repo plus command conditions.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1560-1598); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C039 — report lines 48-48

No named built-in fsck and hard-crash recovery manual/version-sensitive

**qualified** (current assertion). The complete default command enum and relevant repair namespaces do not expose a named fsck. This is not absence of all built-in triage: no-repo-load op log/op abandon and debug reindex exist.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/mod.rs` (lines 72-168); SHA-256 `7bf5ec2bfdb594bdbaac9b7d30ada93cb8331e9084d1407797670c17a97ea893`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/debug/mod.rs` (lines 1-107); SHA-256 `a7800efae40c4b6165081cce9f01b8b414909469afcdbe45c340bf2a8ca13402`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/git/mod.rs` (lines 1-124); SHA-256 `db8875291418997dff776c7c75c99d89ef653aed6f9de7b119f7919bf72d59e4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/util.rs` (lines 30-38); SHA-256 `53a2b0575aa6918144a76ef95487c83927ca8312c7fa2790452cd5c5f221151e`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/log.rs` (lines 81-100); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/abandon.rs` (lines 47-61); SHA-256 `9d8c2bfcc0cb1dc3bb7441fe08d0af9f9ca1775483be4f44139ece662a7a0a0e`

### C040 — report lines 50-50

Empty zero-length op-head files make repo unloadable like zero-length store/index/Git objects

**contradicted** (current assertion). Op-head contents are intentionally empty; ids live in filenames. Truncating valid head markers changes nothing. Missing/invalid head filenames or empty encoded objects are separate failure classes.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/simple_op_heads_store.rs` (lines 58-92); SHA-256 `30755eb32a63d29b57a93fb3858f9e1a3c5abdd13f05dae103817cb387965825`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 118-127); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)
- Material failure: `R029-F5-empty-op-head-as-corruption`

### C041 — report lines 50-50

Interrupted completed operation publication extra heads can be reconciled; torn objects can break load

**qualified** (current assertion). Supported at precise publication/object-load boundaries, not every arbitrary power loss. Object corruption remains attributed history and unknown general durability at pin.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/op_heads_store.rs` (lines 63-138); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/transaction.rs` (lines 104-142); SHA-256 `7d6404eb1dea2e89467ede320f690f6630c63664ae880f0492c6088dbdab510f`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/transaction.rs` (lines 196-201); SHA-256 `7d6404eb1dea2e89467ede320f690f6630c63664ae880f0492c6088dbdab510f`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)

### C042 — report lines 51-51

#4423 body/capture timestamps, view is-directory symptom and multi-version manual histories

**supported** (current assertion). Frozen body and dated comments corroborate rollback failures, zero-byte Git/extra objects and later successful extraction/recovery. Empty-name cause/fsync explanation remain reporter hypotheses.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4423.json` (lines 1-76); SHA-256 `d72a14271fb697217917eef42baab65eff836b63acdca7ba9393ca5658cfda64`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)

### C043 — report lines 52-52

Head write-before-delete ordering, transient empty readdir, persistent NoHeads and load error mapping

**supported** (current assertion). Precise design/implementation branches support the stated conditions, not a durability guarantee for torn encoded objects.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/technical/concurrency.md` (lines 121-127); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/op_heads_store.rs` (lines 31-35); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/op_heads_store.rs` (lines 71-100); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2168-2174); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C044 — report lines 52-52

Deleting tree_state is safe: rebuilt from disk and only file-state tracking/full hash work lost

**unsupported** (current assertion). A May2025 anecdote supports success in that case. Pinned missing-file path initializes an EMPTY tree/state with root sparse patterns and no watchman clock. It loses tree baseline and sparse/tracking distinctions, so safe/full-rehash-only is not established; ignored previously tracked paths can be treated differently. No runtime loss experiment is inferred.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 570-617); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1037-1064); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 60-75); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- Material failure: `R029-F5-safe-tree-state-deletion`

### C045 — report lines 53-53

Older repository origin and no demonstrated v0.22-introduction/fix; risk unresolved at pin

**supported** (current assertion). Appropriate qualification of heterogeneous later histories; open capture state alone does not establish absence of a fix.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4423.json` (lines 1-76); SHA-256 `d72a14271fb697217917eef42baab65eff836b63acdca7ba9393ca5658cfda64`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)

### C046 — report lines 53-53

Thread histories only Linux ext4-class filesystems

**qualified** (current assertion). Original reporter describes Linux/ext4, but full dated thread also includes WSL2 and Win11 histories. Filesystem-specific transfer remains sensible, while universal thread scope is too narrow.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4423.json` (lines 1-76); SHA-256 `d72a14271fb697217917eef42baab65eff836b63acdca7ba9393ca5658cfda64`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)

### C047 — report lines 54-54

Guide load failures, back up .jj and avoid automated internal edits

**supported** (integration proposal). Useful derived caution directly motivated by ambiguous object corruption and destructive/manual recipes. Every successful case being expert-guided is not established as a universal classification.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2168-2174); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C048 — report lines 54-54

Low-risk automatic update-stale and ignore-WC op-log triage

**qualified** (integration proposal). Purpose-built update-stale has source conditions, not unconditional safety after arbitrary corruption. Official first comment suggests no-WC op log, and implementation bypasses repo loading; omitting explicit at-op can still reconcile divergent heads.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/log.rs` (lines 41-45); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/log.rs` (lines 81-100); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 445-485); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C049 — report lines 56-58

Shared repository/per-workspace commits; secondary colocated Git gap and forget leaves disk files

**supported** (current assertion). Docs, add/init source and captured issue body agree. No claim of all-workspace global serialization follows.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 78-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/view.rs` (lines 90-119); SHA-256 `dc835df43ee3ec03ea564f025b7682039a085c380612ea5eea5defd1987b3ac4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/add.rs` (lines 109-118); SHA-256 `0d5a2e5a18851f126f4cc8311dc1c738a86c38e8b26a67438682b02e2fdf8345`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 345-377); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4436.json` (lines 1-99); SHA-256 `2939a2223ea17385ed89d208acb48c2e52a29f4144f679be274721382201ea2b`

### C050 — report lines 59-59

Loader/writer .jj/repo contains relative path

**qualified** (current assertion). Loader comment says relative, but writer canonicalizes and writes an absolute repo directory; joining accepts that absolute path too. Treat it as a path pointer, not a relative-only invariant.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 345-377); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 549-563); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`

### C051 — report lines 59-59

Rename exists, #4342 closed prepin, forget disk semantics, immutable per-workspace commits get new child and warning

**supported** (current assertion). Exact command, captured dates, docs and finish_transaction branches verify these facts. It creates repo view commits for all affected workspaces, not filesystem checkout in every workspace.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/rename.rs` (lines 23-78); SHA-256 `be6d3e326408ee9ac004b05a68dc72beae3803437c80638710992cf9ce48b2fd`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4342.json` (lines 1-99); SHA-256 `d45a015ba6b063129d46c036ac9ba32f91c91aa6d047df3adeeeb5afed754680`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 90-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1714-1732); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C052 — report lines 60-60

#4436 body no .git/tool degradation, closed2026; no secondary colocation at pin

**supported** (current assertion). Historical status alone would not prove fix absence. Pinned add path invokes shared-repo workspace init, which writes .jj but no .git, independently verifying the limit.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4436.json` (lines 1-99); SHA-256 `2939a2223ea17385ed89d208acb48c2e52a29f4144f679be274721382201ea2b`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/add.rs` (lines 109-118); SHA-256 `0d5a2e5a18851f126f4cc8311dc1c738a86c38e8b26a67438682b02e2fdf8345`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 345-377); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`

### C053 — report lines 61-61

Primary init_colocated_git and extra import sync supported

**supported** (current assertion). Pinned primary initializer and import path explicitly support this scoped counterevidence.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 209-235); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 897-916); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C054 — report lines 62-62

UI identity/forget semantics and label secondary Git compatibility; manually managed Git worktrees alternative

**qualified** (integration proposal). Useful labeled limitation. Git worktree coexistence is a proposal, not verified jj workspace support at this pin; requires separate integration validation.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 78-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/add.rs` (lines 109-118); SHA-256 `0d5a2e5a18851f126f4cc8311dc1c738a86c38e8b26a67438682b02e2fdf8345`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4436.json` (lines 1-99); SHA-256 `2939a2223ea17385ed89d208acb48c2e52a29f4144f679be274721382201ea2b`

### C055 — report lines 62-62

Expect WorkingCopyStale for any workspace companion does not itself update

**contradicted** (current assertion). A workspace becomes stale only when its desired WC tree differs and operation relation indicates staleness. Unrelated updates and equal trees remain Fresh.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 94-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- Material failure: `R029-F6-any-foreign-workspace-is-stale`

### C056 — report lines 64-66

SIGINT/SIGTERM cleanup only, second signal fatal, no non-Unix signal init

**supported** (current assertion). Exact guard registration/drain/re-raise confirms this narrow signal subsystem. Normal Drop callbacks still run on non-Unix.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 8-46); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 65-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`

### C057 — report lines 66-66

No special EPIPE handling; fix was ordering not handling EPIPE

**contradicted** (current assertion). Ordering is indeed the #4239 mitigation, but pinned command_error explicitly classifies BrokenPipe, gracefully handles it and exits with code3. Signal-handler scope does not prove no EPIPE handling.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/command_error.rs` (lines 223-229); SHA-256 `ed9f35aa9360681316bf0f27daafb1cbd7993f57264979a8c85be25f69c7dc31`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/command_error.rs` (lines 712-750); SHA-256 `ed9f35aa9360681316bf0f27daafb1cbd7993f57264979a8c85be25f69c7dc31`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 43-63); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`
- Material failure: `R029-F7-denies-broken-pipe-handling`

### C058 — report lines 67-67

Cleanup callbacks normal drop, Unix self-pipe thread and no-op non-Unix; progress callback not persisted protocol

**supported** (current assertion). Source confirms all details. The channel is UnixDatagram rather than literal pipe; self-pipe is an informal signal handoff description.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 8-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 226-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1602-1610); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C059 — report lines 68-68

EPIPE after successful reordered WC update ends command with error but preserves that update

**supported** (current assertion). Conditional on checkout/finish completing, reporting BrokenPipe maps to code3. It does not prove every possible output site is after commit.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/command_error.rs` (lines 712-750); SHA-256 `ed9f35aa9360681316bf0f27daafb1cbd7993f57264979a8c85be25f69c7dc31`

### C060 — report lines 69-69

Maintainer identifies WC updates/Git exports as remaining inconsistency sources

**supported** (current assertion). Official comment2280955909 and source ordering provide useful counterevidence against universal interruption safety.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/issues-4239-timeline.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `ebdf5d3a099ea7153d66e7b828490b324bfb8373acc039b741045bb9dd8175d7`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4239/timeline?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1748-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C061 — report lines 70-70

Choose embedding/ignore reads, atomic-from-user perspective states, avoid second signal and Windows cleanup assumption

**qualified** (integration proposal). Useful UX proposals, but ignore reads may reconcile ops, actual transition has durable/checkout gaps, and no signal cleanup on Windows must not erase normal Drop callbacks.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 445-485); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 39-46); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 102-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C062 — report lines 70-70

Snapshot per-path callback, checkout summary/skipped warning granularity

**supported** (current assertion). Source explicitly implements these coarse feedback forms, not a durable completion receipt.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 226-244); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/progress.rs` (lines 166-214); SHA-256 `3747f662ea359d1dd1cdd2b0712e4d901ea0ab9c0cf7afa9668694913006ef63`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2362-2392); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C063 — report lines 74-74

Conflict markers are reparsed into conflicts; unresolved paths/recipe and file-type limits

**supported** (current assertion). Docs, actual disk-content parser path and output recipe confirm each technical fact. Proposed GUI renderer is derived rather than present.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/docs/working-copy.md` (lines 30-57); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1195-1223); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1676-1684); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1931-1957); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2270-2360); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C064 — report lines 78-78

Simpler observe skip-mode and explicit snapshot choice

**qualified** (integration proposal). Repeats lost @/repository reconciliation qualifiers; preserve them for genuine safe observation.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 424-485); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/operation/log.rs` (lines 41-45); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- Material failure: `R029-F1-observation-read-only-loss`

### C065 — report lines 79-79

Writes before output to decouple delivery

**qualified** (integration proposal). Useful #4239 lesson for post-commit report; finish_transaction also has earlier status/Git export output, so sequence is not universal for all commands.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1699-1801); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C066 — report lines 80-80

Repair button including missing-operation recovery commit

**qualified** (integration proposal). Supported within loadable workspace/repo and exact ObjectNotFound path; no arbitrary hard-crash safety guarantee.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`

### C067 — report lines 81-81

Stop/guide load failures and back up .jj before manual edits

**supported** (integration proposal). Useful derived safeguard for uncertain manual histories.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)

### C068 — report lines 82-82

One writer per workspace/retry errors

**qualified** (integration proposal). Controls cooperating companion writers, not repo-wide/Git/human mutations; fresh reload/check is needed for retry.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1607-1631); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 934-942); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 1440-1440); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C069 — report lines 83-83

Label secondary colocated Git-tool gap

**supported** (integration proposal). Concrete product decision supported by pinned init/add and body.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/add.rs` (lines 109-118); SHA-256 `0d5a2e5a18851f126f4cc8311dc1c738a86c38e8b26a67438682b02e2fdf8345`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 345-377); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4436.json` (lines 1-99); SHA-256 `2939a2223ea17385ed89d208acb48c2e52a29f4144f679be274721382201ea2b`

### C070 — report lines 87-89

Declared unread raw patches/source/tests/public threads and unverified acquisition depth

**unresolved** (method/source-gap self-report). Retain all source gaps explicitly. Actual candidate reads remain locked; no current report credit is granted from self-reported logs. Full source remains available and all emitted claims are independently checked.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/TASK.md` (lines 3-7); SHA-256 `85f1d348299d9cb65e568d459f188713a592550ccd92624d46b5c494d25ff117`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/history-index.json` (lines 1-4376); SHA-256 `e8330e80a540d4432e33843436ac76c255c879661e57d7b1f818554efd544d60`

### C071 — report lines 89-89

#4517 attribution inferred rather than read diff; #4465 later fix uninvestigated; PNG visual gap

**supported** (current assertion). Explicit inference limits are appropriate. Evaluator primary/patch checking confirms #4517 without crediting candidate acquisition, while later #4465 status stays separate.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/issues-4239-timeline.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `ebdf5d3a099ea7153d66e7b828490b324bfb8373acc039b741045bb9dd8175d7`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4239/timeline?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/pulls-4517.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `bfa8e02edd83ce7939e511b21df4e84d1dfc45c866f63791b4b6b6c21b9e136d`; [official source](https://api.github.com/repos/jj-vcs/jj/pulls/4517)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 1-63); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4465.json` (lines 1-130); SHA-256 `ce41618f43514866713c7b26982deacef21910f93c0d6f2dcbf426e84c027c5d`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/PIN.json` (lines 1-441); SHA-256 `6cb6112d93cdecd21d5e9a57db5f878b1afac553012e99f008e0c4102a503342`

### C072 — report lines 90-90

#4545/#4508/#4423 open at capture

**supported** (current assertion). Exact frozen status fields verify these current historical dispositions, not release-time truth.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4545.json` (lines 1-88); SHA-256 `a6f9011c0ebda172ab04e2edcae10945a464556b871f2824e8f811351c1d0ae6`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4508.json` (lines 1-99); SHA-256 `7574413e1681fc1e3c15cd306399095b9c722e312ae8bbfe77275df262e934cb`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4423.json` (lines 1-76); SHA-256 `d72a14271fb697217917eef42baab65eff836b63acdca7ba9393ca5658cfda64`

### C073 — report lines 94-94

UNEXECUTED forced #4239 pipe regression expected nonstale after successful reorder

**qualified** (UNEXECUTED validation proposal). Valid proposal, but force the reporting EPIPE timing and separate failed checkout or early output errors; head-n3 alone does not guarantee relevant write failure.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/command_error.rs` (lines 712-750); SHA-256 `ed9f35aa9360681316bf0f27daafb1cbd7993f57264979a8c85be25f69c7dc31`

### C074 — report lines 95-95

UNEXECUTED kill snapshot plus other-workspace log must merge and update-stale restore fresh

**qualified** (UNEXECUTED validation proposal). Useful matrix but expected merge/repair depends on kill boundary. Before publication there may be no extra head; equal trees can remain Fresh; corrupt stores may not load. Not an executed false result.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/transaction.rs` (lines 104-142); SHA-256 `7d6404eb1dea2e89467ede320f690f6630c63664ae880f0492c6088dbdab510f`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/transaction.rs` (lines 196-201); SHA-256 `7d6404eb1dea2e89467ede320f690f6630c63664ae880f0492c6088dbdab510f`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 145-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`

### C075 — report lines 96-96

UNEXECUTED truncate op-head/objects/tree_state then recipes restore without writing objects

**qualified** (UNEXECUTED validation proposal). Empty head files are normal, so truncation is not torn-marker simulation. No universal restore/no-object-write expectation follows: recovery-commit path writes an operation/commit and several thread recipes reconstruct/copy objects. Safe tree-state deletion premise is separately unsupported.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/simple_op_heads_store.rs` (lines 58-92); SHA-256 `30755eb32a63d29b57a93fb3858f9e1a3c5abdd13f05dae103817cb387965825`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 110-143); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R029/eval-only-source-addendum/issues-4423-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `d9467a4c0b74e801161cedee468fb95698087f546c01a4d0648de17841a15463`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4423/comments?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/local_working_copy.rs` (lines 570-617); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C076 — report lines 97-97

UNEXECUTED poll-cost comparison against issue magnitudes

**supported** (UNEXECUTED validation proposal). Reasonable explicit experiment proposal; choose consistent operation state and report measurements without assuming body magnitudes generalize.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4545.json` (lines 1-88); SHA-256 `a6f9011c0ebda172ab04e2edcae10945a464556b871f2824e8f811351c1d0ae6`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4508.json` (lines 1-99); SHA-256 `7574413e1681fc1e3c15cd306399095b9c722e312ae8bbfe77275df262e934cb`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/working_copy.rs` (lines 186-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`

### C077 — report lines 98-98

UNEXECUTED secondary colocated .git/tool audit

**supported** (UNEXECUTED validation proposal). Directly tests the source-supported gap; no execution result asserted.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/commands/workspace/add.rs` (lines 109-118); SHA-256 `0d5a2e5a18851f126f4cc8311dc1c738a86c38e8b26a67438682b02e2fdf8345`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/lib/src/workspace.rs` (lines 345-377); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/issues/4436.json` (lines 1-99); SHA-256 `2939a2223ea17385ed89d208acb48c2e52a29f4144f679be274721382201ea2b`

### C078 — report lines 99-99

UNEXECUTED first/second SIGINT and Windows no-op experiment

**qualified** (UNEXECUTED validation proposal). Narrow Unix behavior source-supported. Windows uses different termination/control events; the no-op init does not make normal Drop callbacks no-op. Specify platform event and guard registration.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 39-46); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R029/inputs/repository/cli/src/cleanup_guard.rs` (lines 65-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`

## Independence and source limits

R017 and all old grader directories remain unopened. Candidate method/history/native/economics remain locked. Missing first-party sources are evaluator-only and were frozen before the decision. UNEXECUTED proposals are assessed as logical proposals, not executed successes/failures.

Useful supported novelty: Conditional stat/own-mtime snapshot behavior and practical cost measurements; Fine-lock/operation-head distinction with distributed-FS caveats; Dated deep-recovery transcript and secondary colocated Git-tool limit

Unresolved: Runtime outcomes of six UNEXECUTED proposals; General hard-crash durability at this pin; Binary version of later recovery transcripts; Named fsck absence does not exclude built-in triage or integrity inspection; Candidate-method self-reports and declared unread depths; Actual candidate source acquisition, operations and runtime outcomes remain UNKNOWN; Raw PNG visual interpretation unavailable under text-only guard

Freeze 2026-10-01T22:53:39.388605+00:00; elapsed wall 3159.5s; response checkpoint 32; generated usage UNKNOWN.
