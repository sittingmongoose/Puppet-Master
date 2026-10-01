# R030 immutable CURRENT assessment

Verdict: **quality failure**. Complete review coverage: **true**, which does not mean every claim is correct.

The report gives useful precise freshness, no-resume and progress constraints, but its claim that observation snapshots are harmless across crashes is not established by the source. It also broadens recovery from ObjectNotFound to unreadable operations, says every command must fail after foreign updates, and confuses shared-view child commits with physical checkout in every workspace. These affect the brief’s safe-observation and disk-recovery promises.

Report SHA-256: `87bc024aa70ecf7f5e51d0eebc07c606b58cc76c17171d31d6f028e8aaa15c20`
Stage SHA-256: `62a240e1ee743f3ecdb41ca7e466c1e437aaeafc9a280bad3999d993bff961e8`
Scope: literal original two coherent families / five-to-eight findings; six opportunity families, 16 independently derived actual/shared criteria; 61 claim rows.

All 431 repository files, 624 patches and 68 issue bodies retained; all ordered sources byte-exactly reconstructed. Five PNGs remain visually unresolved under the text-only guard.

## Required scope

| Criterion | Coverage | Assessment |
|---|---|---|
| scope_and_pin | full | Exact full original corpus/pin and image restrictions respected. |
| two_coherent_families | full | Seven coherent findings across both original families, with explicit mappings. |
| exact_locators_and_versions | partial | Precise source locators broadly supplied; unreadable-op and view/filesystem scopes lose material conditions. |
| evidence_roles | full | Historical body/comment/pinned source/test intent and unexecuted proposal roles distinguished. |
| temporal_and_missing_links | partial | Capture/release separation good; #4396 pinned fix is important counterevidence to malformed-marker proposal, not a proved current historical panic. |
| observation_effects | partial | Snapshot/config/cost constraints found; safe-reader and snapshot crash conclusions overgeneralize. |
| workspace_state | partial | Freshness/shared view/rename/forget and secondary Git gap covered; every-command-fails and all-workspace physical-checkout scopes inaccurate. |
| concurrent_mutation_limits | full | Repo/working-copy locks, distributed/backend caveats and materialization TOCTOU source limits developed. |
| completion_and_delivery | full | #4239 intended fix, progress throttling and limited signal cleanup concretely supported, with no runtime guarantee. |
| recovery | partial | Useful stale/missing-op/no-resume mechanism; unreadable-op universal trigger and safe-observation crash boundary weakened. |
| failure_history | partial | Relevant bodies and source-order fix present; historical/parser-fix counterevidence and open-body absence qualifications recorded. |
| mechanism_and_counterevidence | partial | All claims assessed; several core safety conclusions exceed source conditions. |
| integration_transfer | partial | Useful proposals and strong final caveat; core safe-observation and file-effect statements need correction. |
| unexecuted_validation | full | Six proposals explicitly unexecuted and individually assessed rather than treated as native outcomes. |
| unresolved_and_novelty | full | Source/image gaps preserved; useful pending-checkout and vanished-workspace novelty assessed. |
| standalone_current_report | partial | Complete coherent deliverable; material safety guarantees prevent quality acceptance. |

## Every material claim

### C001 — report lines 3-3

Pin/date/manifest/original line convention and capture-time issue qualification

**supported** (current assertion). Exact admitted manifests and source reconstruction agree. Issue capture is distinct from release truth.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/PIN.json` (lines 1-5); SHA-256 `6cb6112d93cdecd21d5e9a57db5f878b1afac553012e99f008e0c4102a503342`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues-index.json` (lines 687-689); SHA-256 `6a6e593591ccd033b424101f2470effebc2cfd433dc97bb345e555dafac726d6`

### C002 — report lines 5-5

Product context and both coherent original families investigated

**supported** (current assertion). Matches original brief; seven findings span both goals.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/brief.md` (lines 1-7); SHA-256 `6455c54d08627a6669c8f176a5cfb1e1c23578a183f3e606addadcf59eefff36`

### C003 — report lines 7-7

Map-assisted bounded reads, one comments GET, mechanical successes/errors; no execution

**unresolved** (candidate method self-report). Actual acquisition/map/mechanical/native operations are locked; their self-reports receive no credit. Every emitted current source claim is independently checked.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/TASK.md` (lines 3-7); SHA-256 `85f1d348299d9cb65e568d459f188713a592550ccd92624d46b5c494d25ff117`

### C004 — report lines 7-7

Five PNGs unviewed and validation proposals unexecuted

**supported** (current assertion). Explicit visual gap and proposal labels preserve source limits; no runtime result established.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/PIN.json` (lines 1-441); SHA-256 `6cb6112d93cdecd21d5e9a57db5f878b1afac553012e99f008e0c4102a503342`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/TASK.md` (lines 7-7); SHA-256 `85f1d348299d9cb65e568d459f188713a592550ccd92624d46b5c494d25ff117`

### C005 — report lines 13-14

Freshness detection and update-stale source locators

**supported** (current assertion). All named pinned definitions/functions exist at the stated ranges.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 2214-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 98-118); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`

### C006 — report lines 15-15

WC records last updated operation, tree equality fast path, four ancestor-based freshness branches/messages

**supported** (current assertion). Exact source confirms every named branch/direction and missing-op hint.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1595-1597); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1560-1598); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C007 — report lines 15-15

Update-stale snapshots known WC op, merges and checks old tree before update/finish

**supported** (current assertion). Precise command sequence and concurrent-tree guard are present.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-108); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`

### C008 — report lines 15-15

Any unreadable operation object builds recovery commit

**qualified** (current assertion). Only ObjectNotFound of the recorded WC operation selects recovery; other OpStoreError variants propagate. Loadable workspace/current repo/tree state remain required.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 110-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1895-1907); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- Material failure: `R030-F1-unreadable-operation-trigger`

### C009 — report lines 15-15

Recovery resets prior-tree assumptions

**supported** (current assertion). Recover clears cached file states/old tree and resets metadata to target without touching physical files; report does not claim arbitrary store recovery.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 113-118); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1553-1557); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1895-1907); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C010 — report lines 16-16

Tree identity can be Fresh despite old/divergent operation ids; SiblingOperation internal-error branch

**supported** (current assertion). Useful exact counterevidence. Materialized/desired tree identity is the fast path, not operation recency alone.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 94-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1583-1590); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C011 — report lines 17-17

After foreign WC update every command fails until update-stale

**contradicted** (current assertion). Ordinary snapshot requires the relevant mismatch/relation, but ignores/historical operation reads and no-snapshot command paths may still run. Same-tree update remains Fresh by the preceding counterevidence.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 424-438); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 897-916); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/operation/log.rs` (lines 81-100); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- Material failure: `R030-F1-every-command-fails`

### C012 — report lines 17-17

Companion detects stale/reuses snapshot-merge recovery; first writable command must anticipate stale

**supported** (integration proposal). Useful derived guidance within the precise command conditions.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-108); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1572-1582); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C013 — report lines 19-20

Repo concurrency lock-free; op-head and no-read simple-op-head source locators

**supported** (current assertion). Primary design/trait source supplies the stated scope. Declared actual unread depths remain unassessed acquisition.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/technical/concurrency.md` (lines 35-38); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/op_heads_store.rs` (lines 31-138); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`

### C014 — report lines 21-21

Loaded repo fixed during command, completed op parent, next normal command three-way merges divergence; empty head-marker ordering

**supported** (current assertion). Direct design and exact head store implement these semantics. Head contents are empty by design.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/technical/concurrency.md` (lines 80-127); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/simple_op_heads_store.rs` (lines 58-92); SHA-256 `30755eb32a63d29b57a93fb3858f9e1a3c5abdd13f05dae103817cb387965825`

### C015 — report lines 21-21

Optional de-duplication lock, ancestor filter and remaining-head merges

**supported** (current assertion). Pinned resolver confirms the conditional one-head shortcut and multi-head merge; no universal runtime guarantee.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/op_heads_store.rs` (lines 52-56); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/op_heads_store.rs` (lines 63-138); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`

### C016 — report lines 21-21

Bad-locking source test simulates machines and asserts both child commits survive

**supported** (current assertion). Full relevant test source establishes intended assertion, not an executed guarantee.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/tests/test_bad_locking.rs` (lines 103-190); SHA-256 `23daa5cd550d294ef540ff8ed4a9823fc719bfd257d7192e78cd645aa6310d13`

### C017 — report lines 22-22

Git backend known corruption and distributed-FS/colocated untested caveat

**supported** (current assertion). Docs explicitly carve out both limits.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/technical/concurrency.md` (lines 51-61); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`

### C018 — report lines 23-23

Embedder competes with CLI, must resolve divergent views on load, colocated default only hypothetical

**qualified** (integration proposal). Useful derived constraint. The proposed companion default is not supplied design, and embedding alone does not implement automatic merge unless caller uses the correct path.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/technical/concurrency.md` (lines 80-114); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/op_heads_store.rs` (lines 63-138); SHA-256 `4de9db047c0ddcc8fd98ed108b0301a466429f22a7f38d1f813493e2e10b4909`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/brief.md` (lines 7-7); SHA-256 `6455c54d08627a6669c8f176a5cfb1e1c23578a183f3e606addadcf59eefff36`

### C019 — report lines 25-26

One WC advisory lock, temp-file state writes and pending-checkout TODO indicate no resume record

**supported** (current assertion). Pinned lock/state wrappers and three unimplemented marker comments directly support these facts. Platform wait behavior stays explicitly unresolved in report.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1607-1631); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 660-706); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1693-1702); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1861-1863); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1917-1955); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/lock.rs` (lines 15-21); SHA-256 `ba1763e5730e9c7232b883a6a0280abf45b0fb1e42ec403a22689d37755eb934`

### C020 — report lines 27-27

Re-read tree/checkout state after lock captures old ids; finish writes dirty tree then changed op/name checkout

**supported** (current assertion). Exact state sequence confirms this, including two-store non-atomic gap.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1607-1631); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1932-1955); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C021 — report lines 27-27

Two persist Windows TODOs and checkout proto operation/name fields

**supported** (current assertion). One write uses mapped errors, checkout write unwrap can panic; Windows open-reader TODO exists at both locations.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1567-1572); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 694-705); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1693-1702); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C022 — report lines 27-27

Interruption during file materialization before finish can leave physical files ahead of recorded tree; no resumable marker

**supported** (current assertion). Check_out materializes before dirty-state finish and pending marker is only TODO. This is a possible boundary, not every interruption.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1861-1875); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1932-1955); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C023 — report lines 28-28

Lock re-read closes state TOCTOU; parent materialization still races; lock wait/fail semantics unknown to candidate

**supported** (current assertion). Source re-read and create_parent_dirs caveat agree. Evaluator Unix flock blocks, but candidate access omission remains legitimate unresolved depth.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1607-1631); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 427-435); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/lock/unix.rs` (lines 29-47); SHA-256 `6665c72f51598bf7b41dfeb2138448613c1a4e159ff60f1dda1f187d12570206`

### C024 — report lines 29-29

Crashed checkout requires re-snapshot/reconciliation and state-file deletion should not be blind repair

**qualified** (integration proposal). Useful caution; recorded tree is durable baseline rather than proof files currently match. Freshness classification alone compares stored tree ids, so actual file drift needs snapshot and cannot universally imply stale.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1861-1875); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1602-1641); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C025 — report lines 31-32

Snapshot parallel scan, mtime filter and possible worker/source panics

**supported** (current assertion). Source contains parallel directory iteration and read_dir/write_tree unwraps. This establishes potential panic paths, not every old #4396 trigger at pin.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 795-906); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 934-958); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C026 — report lines 33-33

Sparse/fsmonitor intersection, stat type/mtime/size gating, immediate blobs and delayed dirty state finish

**qualified** (current assertion). Core sequence is supported, but stat equality alone is insufficient: mtime must also precede own_mtime. Blob/tree writes occur before finish, which does not establish fsync durability.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 120-142); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 817-822); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 712-722); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1134-1185); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1932-1955); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C027 — report lines 33-33

write_tree/read_dir unwrap can panic; CLI changed-tree transaction rewrites WC and rebases

**supported** (current assertion). Exact unwraps and conditional transaction exist. Backend errors/data races are not executed here.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 889-902); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 934-948); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1611-1641); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C028 — report lines 34-34

Any crash mid-snapshot is harmless orphan objects/unchanged state/no corruption, making observation commands safe

**unsupported** (current assertion). Before a completed TreeState scan, in-memory state may be unchanged on disk. This does not prove backend writes crash-durable or safety of the whole observation pipeline: snapshot_working_copy commits before WC finish, and colocated Git import/export adds other effects. The docs explicitly acknowledge backend corruption.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 897-942); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1611-1641); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 712-722); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1932-1955); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/technical/concurrency.md` (lines 51-61); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- Material failure: `R030-F4-unconditional-snapshot-crash-safety`

### C029 — report lines 34-34

#4396 historical 0.20/0.21 snapshot panic and #4508 many-core cost

**supported** (historical issue reports). Issue bodies substantiate historical reports. Current closed reason alone does not explain #4396; the report does not directly prove a current malformed-marker panic from an unread invariant.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4396.json` (lines 1-76); SHA-256 `00967c17d1d3746e4dfb012dcc5b0a86aa0d52266199991420a0afb617dd2f50`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4508.json` (lines 1-99); SHA-256 `7574413e1681fc1e3c15cd306399095b9c722e312ae8bbfe77275df262e934cb`

### C030 — report lines 34-34

Using #4396 as current malformed-marker panic counterevidence

**qualified** (current transfer from historical report). Official closure comment2332006042 links duplicate2611; frozen patch3133534 guards malformed term counts and pinned malformed-marker test expects None. Other read_dir/write_tree panic sites remain, so do not erase all panic risk or inflate this historical trigger.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/issues-4396-comments.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `c507e1055ad0044b25d33b64173d46fb92d86dae044e2056c6967abee06d5a57`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4396/comments?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/commit-patches/3133534b323cea968d3e2ff91a5446998a9374a1.patch` (lines 1-71); SHA-256 `bed39fc244e57875391aaca69f015d65bed319d42e3ed3a8f5e6ce171db28480`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/conflicts.rs` (lines 476-481); SHA-256 `907b5a819f1799df8d54520ecc2c7dbd6a10b0b4296aa4976ccad5748f4db2be`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/tests/test_conflicts.rs` (lines 752-771); SHA-256 `65c70e3de949be04e231359ded61a299606bf7e6d2da247d6b108da48a1e29a7`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 934-948); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C031 — report lines 35-35

Long-lived TreeState/caller snapshot options permit embedding; survive panics; snapshot dominant recurring cost

**qualified** (integration proposal). Embedding is feasible and caller owns options, but a live tree state is not a live repo view. Dominant cost is attributed workload evidence, not a universal measured property; recover/reload after panic requires validation.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 186-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/technical/concurrency.md` (lines 80-83); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4508.json` (lines 1-99); SHA-256 `7574413e1681fc1e3c15cd306399095b9c722e312ae8bbfe77275df262e934cb`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4545.json` (lines 1-88); SHA-256 `a6f9011c0ebda172ab04e2edcae10945a464556b871f2824e8f811351c1d0ae6`

### C032 — report lines 37-38

Snapshot-before-command default and config/source locators

**qualified** (current assertion). Most usual commands snapshot conditionally; not every command or mutating path. No changed tree need not create a new snapshot operation.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 10-27); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 366-386); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1550-1641); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/operation/abandon.rs` (lines 47-61); SHA-256 `9d8c2bfcc0cb1dc3bb7441fe08d0af9f9ca1775483be4f44139ece662a7a0a0e`

### C033 — report lines 39-39

Auto-track/ignore and #4545 exact cost, jj-new stale and absent Watchman trigger reports

**supported** (current assertion). Faithful body attribution and pinned auto-track/size options. Referenced #4028 and old fsmonitor blob stay unconfirmed unless separately sourced.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 15-27); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 60-75); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4545.json` (lines 1-88); SHA-256 `a6f9011c0ebda172ab04e2edcae10945a464556b871f2824e8f811351c1d0ae6`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 761-790); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C034 — report lines 40-40

Ignore-working-copy fine for pure readers and Watchman external dependency

**qualified** (current assertion). Ignoring WC avoids its snapshot/update, but ordinary head resolution can still create a reconciliation operation. At-op=@ does not alone disable snapshots. Readers are not universally repository-nonmutating. Watchman dependency is explicit source.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 424-485); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/operation/log.rs` (lines 41-45); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 761-790); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- Material failure: `R030-F5-observation-mode-qualifier-loss`

### C035 — report lines 41-41

Do not ignore WC everywhere; long-lived library/change feed or accept cost; configure tracking/size

**qualified** (integration proposal). Useful proposals with clearly visible knobs. Changes must reload fixed repo state, and size cap limits newly tracked files rather than all artifact commits.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 186-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/technical/concurrency.md` (lines 80-83); SHA-256 `464ac73e5bead50a401ba00340c7fd9c837ee92ca39e2131f3f66af5a5025b5c`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1550-1609); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C036 — report lines 43-44

#4239 fix/order and progress/cleanup source locators

**supported** (current assertion). Sources at pin and dated official thread/patch support intended reordering; actual GET self-report not credited.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4239.json` (lines 1-130); SHA-256 `1f47a5da278ef981bde5e474a800b692ce72ea3a53f6c91408bfa975b127c795`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/issues-4239-timeline.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `ebdf5d3a099ea7153d66e7b828490b324bfb8373acc039b741045bb9dd8175d7`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4239/timeline?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 43-63); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/progress.rs` (lines 19-93); SHA-256 `3747f662ea359d1dd1cdd2b0712e4d901ea0ab9c0cf7afa9668694913006ef63`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cleanup_guard.rs` (lines 13-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`

### C037 — report lines 45-45

Historical reporting broken pipe before WC update; maintainer residual inconsistency and pinned reorder

**supported** (current assertion). Exact issue/primary comments and patch give the causal history. Pinned comment/order corroborates fix, not an executed reproduction.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4239.json` (lines 1-130); SHA-256 `1f47a5da278ef981bde5e474a800b692ce72ea3a53f6c91408bfa975b127c795`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/issues-4239-timeline.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `ebdf5d3a099ea7153d66e7b828490b324bfb8373acc039b741045bb9dd8175d7`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4239/timeline?per_page=100)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 43-63); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C038 — report lines 46-46

Snapshot 30Hz/250ms delay; Git bar cursor guard; Unix signal drain/re-raise and second fatal

**supported** (current assertion). Precise constants and handler branches match all facts. The handoff is UnixDatagram; informal self-pipe terminology does not change the mechanism.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/progress.rs` (lines 19-93); SHA-256 `3747f662ea359d1dd1cdd2b0712e4d901ea0ab9c0cf7afa9668694913006ef63`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/progress.rs` (lines 112-113); SHA-256 `3747f662ea359d1dd1cdd2b0712e4d901ea0ab9c0cf7afa9668694913006ef63`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/progress.rs` (lines 166-214); SHA-256 `3747f662ea359d1dd1cdd2b0712e4d901ea0ab9c0cf7afa9668694913006ef63`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cleanup_guard.rs` (lines 65-114); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`

### C039 — report lines 46-46

Non-Unix no signal-time cleanup, guards do not cover listed fatal signals/broken pipes

**qualified** (current assertion). Correct scope for CleanupGuard signal registration; normal Drop remains on non-Unix. BrokenPipe is separately recognized/gracefully handled by command_error, so absence in this signal set is not absence of EPIPE handling.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cleanup_guard.rs` (lines 39-46); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cleanup_guard.rs` (lines 90-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/command_error.rs` (lines 223-229); SHA-256 `ed9f35aa9360681316bf0f27daafb1cbd7993f57264979a8c85be25f69c7dc31`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/command_error.rs` (lines 712-750); SHA-256 `ed9f35aa9360681316bf0f27daafb1cbd7993f57264979a8c85be25f69c7dc31`

### C040 — report lines 47-47

Prefer in-process callbacks to terminal UX; recovery cannot depend on guard cosmetics

**qualified** (integration proposal). Concrete proposal. The cited progress guard is cosmetic, but CleanupGuard itself accepts arbitrary callbacks; no source proves every cleanup guard is only cosmetic. Recovery remains conditional.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/progress.rs` (lines 56-63); SHA-256 `3747f662ea359d1dd1cdd2b0712e4d901ea0ab9c0cf7afa9668694913006ef63`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 226-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cleanup_guard.rs` (lines 29-46); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 145-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`

### C041 — report lines 49-50

Multi-workspace sources, omissions and rename/silent-skip/Git-gap locators

**supported** (current assertion). Named current code/docs exist; actual incomplete reading depth remains locked, not credited.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 78-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 49-50); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 110-111); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1877-1879); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1545-1549); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C042 — report lines 51-51

Finish_transaction immutable/hidden/abandoned workspace commit means physical checkout of fresh child in each workspace

**qualified** (current assertion). It creates a new child/set_wc_commit in shared repo views for affected immutable workspace commits; actual filesystem update later applies only to current workspace. Hidden or abandoned is not synonymous with configured immutable.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1714-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- Material failure: `R030-F7-view-versus-filesystem-checkout`

### C043 — report lines 51-51

Deleted/forgotten repo-side workspace skips snapshot or absent current-WC checkout

**supported** (current assertion). Exact optional-WC guards confirm this silent path. Disk files can remain after forgetting.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1545-1549); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1762-1769); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 90-92); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`

### C044 — report lines 51-51

Locked WC rename exists/applied at finish; #4342 prepin closure means public command present

**supported** (current assertion). Trait/pending state alone would not prove public command; evaluator directly verifies pinned rename implementation and full source patch.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 110-111); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1877-1879); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1946-1952); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/rename.rs` (lines 23-78); SHA-256 `be6d3e326408ee9ac004b05a68dc72beae3803437c80638710992cf9ce48b2fd`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/commit-patches/412ef36259426d8d7a8bc33bf076922f2a801c18.patch` (lines 101-184); SHA-256 `12994fcbaae4bede93ed6e91ba65923c291ecb260311147ffcd7388a0b1dd265`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4342.json` (lines 1-99); SHA-256 `d45a015ba6b063129d46c036ac9ba32f91c91aa6d047df3adeeeb5afed754680`

### C045 — report lines 51-51

#4436 no secondary .git/tool problems, capture closure2026, pin-era gap

**supported** (current assertion). Body and pinned add/shared-repo initializer establish the implementation limit independently of later closed state.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4436.json` (lines 1-99); SHA-256 `2939a2223ea17385ed89d208acb48c2e52a29f4144f679be274721382201ea2b`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/add.rs` (lines 109-118); SHA-256 `0d5a2e5a18851f126f4cc8311dc1c738a86c38e8b26a67438682b02e2fdf8345`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/workspace.rs` (lines 345-377); SHA-256 `bb2796db350fa8d3d1c508d1baff77ae252b2e7b1791a11da316184ec8c7ac20`

### C046 — report lines 52-52

Forget changes repo state without deleting disk files; silent-skip window

**supported** (current assertion). Direct docs and snapshot optional-WC branch confirm this conditional gap.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 90-92); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1545-1549); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`

### C047 — report lines 53-53

Model per-workspace view, surface stale, do not assume secondary Git visibility

**supported** (integration proposal). Useful source-grounded decisions, conditional on whether desired tree changed; no guarantee every other workspace is stale.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 78-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4436.json` (lines 1-99); SHA-256 `2939a2223ea17385ed89d208acb48c2e52a29f4144f679be274721382201ea2b`

### C048 — report lines 56-56

QF1 mapping across F1/F2/F3/F5/F7

**supported** (current assertion). These findings materially address observation/workspace/concurrent-state goal; current qualifications remain assessed above.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/brief.md` (lines 3-5); SHA-256 `6455c54d08627a6669c8f176a5cfb1e1c23578a183f3e606addadcf59eefff36`

### C049 — report lines 57-57

QF2 mapping and #4423 unreadable view, #4493 no-progress import hang, #4396 historical panic

**supported** (current assertion). All three bodies support the attributed historical symptoms. #4493 on0.21 is not a verified current hang; #4396 has a pinned parser fix.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/brief.md` (lines 3-5); SHA-256 `6455c54d08627a6669c8f176a5cfb1e1c23578a183f3e606addadcf59eefff36`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4423.json` (lines 1-76); SHA-256 `d72a14271fb697217917eef42baab65eff836b63acdca7ba9393ca5658cfda64`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4493.json` (lines 1-88); SHA-256 `eb345827295e0dc6797e4300e19ef57a96f32f7549e862e7cfa75c2888061fcd`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4396.json` (lines 1-76); SHA-256 `00967c17d1d3746e4dfb012dcc5b0a86aa0d52266199991420a0afb617dd2f50`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/commit-patches/3133534b323cea968d3e2ff91a5446998a9374a1.patch` (lines 1-71); SHA-256 `bed39fc244e57875391aaca69f015d65bed319d42e3ed3a8f5e6ce171db28480`

### C050 — report lines 57-57

#4423 no automated repair; route to backup/op-log repair rather than deletion

**qualified** (integration proposal). No guaranteed arbitrary corrupted-store repair established. Op log has explicit no-repo-load triage, and op abandon can repair some corrupted state; source/report body do not prove global absence of every automated route. Backup guidance remains useful.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/operation/log.rs` (lines 81-100); SHA-256 `107072a1028383c2338211b151fe5d54d7d7158161b843314ce5426edd528484`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/operation/abandon.rs` (lines 47-61); SHA-256 `9d8c2bfcc0cb1dc3bb7441fe08d0af9f9ca1775483be4f44139ece662a7a0a0e`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 145-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4423.json` (lines 1-76); SHA-256 `d72a14271fb697217917eef42baab65eff836b63acdca7ba9393ca5658cfda64`

### C051 — report lines 60-60

Five PNGs unviewed, no visual claims

**supported** (current assertion). All bytes remain retained/reconstructed; visual interpretation SOURCE UNKNOWN without image-dependent semantic verdict.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/PIN.json` (lines 1-441); SHA-256 `6cb6112d93cdecd21d5e9a57db5f878b1afac553012e99f008e0c4102a503342`

### C052 — report lines 61-61

Declared unread full patches, sources, issue bodies/comments and read ranges

**unresolved** (candidate method/source-gap self-report). Actual candidate read depth remains locked. Do not credit reports from acquisition artifacts or punish unasked exhaustive source census; all current emitted claims independently checked.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/TASK.md` (lines 3-7); SHA-256 `85f1d348299d9cb65e568d459f188713a592550ccd92624d46b5c494d25ff117`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/history-index.json` (lines 1-4376); SHA-256 `e8330e80a540d4432e33843436ac76c255c879661e57d7b1f818554efd544d60`

### C053 — report lines 62-62

FileLock wait/fail/stale-lock behavior unresolved to candidate

**supported** (current assertion). Honest source limit; evaluator Unix flock blocks but does not retroactively grant acquisition/read coverage.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/lock/unix.rs` (lines 29-47); SHA-256 `6665c72f51598bf7b41dfeb2138448613c1a4e159ff60f1dda1f187d12570206`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/lock.rs` (lines 15-21); SHA-256 `ba1763e5730e9c7232b883a6a0280abf45b0fb1e42ec403a22689d37755eb934`

### C054 — report lines 63-63

PR4517 exact diff not fetched; attribution inferred from comments/pin

**supported** (current assertion). The explicit gap is legitimate. Evaluator original frozen patch and primary PR metadata establish source support with no candidate access credit.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/commit-patches/76f40e5990db2981e7c86986c8af98f22edaccc9.patch` (lines 1-63); SHA-256 `9710b6108cf70350dddf76dcf4c182c56cc1622332fc559a33f58bdd706eea56`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/pulls-4517.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `bfa8e02edd83ce7939e511b21df4e84d1dfc45c866f63791b4b6b6c21b9e136d`; [official source](https://api.github.com/repos/jj-vcs/jj/pulls/4517)
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/reviews/repo-current-grading-v6/R028/eval-only-source-addendum/issues-4239-timeline.json` (entire primary JSON; material ids/dates specified in assessment); SHA-256 `ebdf5d3a099ea7153d66e7b828490b324bfb8373acc039b741045bb9dd8175d7`; [official source](https://api.github.com/repos/jj-vcs/jj/issues/4239/timeline?per_page=100)

### C055 — report lines 66-66

UNEXECUTED kill-mid-checkout Fresh/Stale matrix and guaranteed lossless convergence

**qualified** (UNEXECUTED validation proposal). Useful proposal; exact kill boundary/partial files/loadability determine result. Desired stored tree equality can be Fresh despite physical drift, and no universal no-data-loss recovery follows.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 2234-2268); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1861-1875); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/commands/workspace/update_stale.rs` (lines 43-175); SHA-256 `d97bb464e4d0f2857ae571731925744acc40e0e705245f93b244b168d0289ad5`

### C056 — report lines 67-67

UNEXECUTED concurrent new in workspaces, divergence merge and WC commits survive

**qualified** (UNEXECUTED validation proposal). Tests intended operation-view merge behavior; deliberately coordinate overlap and distinguish shared commit records from physical files. No result executed.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/tests/test_bad_locking.rs` (lines 103-190); SHA-256 `23daa5cd550d294ef540ff8ed4a9823fc719bfd257d7192e78cd645aa6310d13`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/docs/working-copy.md` (lines 94-100); SHA-256 `080b3610c8fa04c4184f3e3e8a504b70c576f64a824b3fc3147a6ecd877cbe62`

### C057 — report lines 68-68

UNEXECUTED reporting EPIPE no-stale regression at pin

**qualified** (UNEXECUTED validation proposal). Valid path test; force report timing/EPIPE and successful checkout, since ordinary head pipeline alone does not guarantee relevant output write failure.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cli_util.rs` (lines 1757-1771); SHA-256 `689a8b64a3d0ae0b6ab74996d95813a1b2387a58d2985e25a55ddf30b0cc1c04`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/command_error.rs` (lines 712-750); SHA-256 `ed9f35aa9360681316bf0f27daafb1cbd7993f57264979a8c85be25f69c7dc31`

### C058 — report lines 69-69

UNEXECUTED Windows kill/persist-interference expects no state corruption

**qualified** (UNEXECUTED validation proposal). Valid risk investigation, not established crash safety. Checkout persist unwrap and open-reader TODO can panic; define process-termination and file-locker conditions precisely.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1693-1702); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 1932-1955); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C059 — report lines 70-70

UNEXECUTED malformed marker expected #4396-style current worker panic

**qualified** (UNEXECUTED validation proposal). Not an executed false result. Pinned guard and malformed-marker test reject that known term-count defect; test should assert safe parsing and separately inject real read_dir/write_tree faults.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/conflicts.rs` (lines 476-481); SHA-256 `907b5a819f1799df8d54520ecc2c7dbd6a10b0b4296aa4976ccad5748f4db2be`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/tests/test_conflicts.rs` (lines 752-771); SHA-256 `65c70e3de949be04e231359ded61a299606bf7e6d2da247d6b108da48a1e29a7`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/commit-patches/3133534b323cea968d3e2ff91a5446998a9374a1.patch` (lines 1-71); SHA-256 `bed39fc244e57875391aaca69f015d65bed319d42e3ed3a8f5e6ce171db28480`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 934-948); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C060 — report lines 71-71

UNEXECUTED Watchman/default snapshot timing before SLA promise

**supported** (UNEXECUTED validation proposal). Appropriate empirical validation proposal with attributed workload baseline; external service behavior and version remain explicit.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/issues/4545.json` (lines 1-88); SHA-256 `a6f9011c0ebda172ab04e2edcae10945a464556b871f2824e8f811351c1d0ae6`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/local_working_copy.rs` (lines 761-790); SHA-256 `05ad60eda211d2aa19765d89b215f999dc741b7093b7f534a2afb925ddae00a4`

### C061 — report lines 74-74

CLI source does not prove hypothetical GUI safety; process/lock/watch/failure delivery changes require validation

**supported** (integration transfer limit). Faithful original transfer-limit ask. Source claims about guards and pipeline remain conditional rather than completed GUI proof.

- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/brief.md` (lines 7-7); SHA-256 `6455c54d08627a6669c8f176a5cfb1e1c23578a183f3e606addadcf59eefff36`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/lib/src/working_copy.rs` (lines 186-227); SHA-256 `7f7f8f8a8b6c2570a1171f51bc10ee23cb7f960ee754ad210f0de8e9592c2f40`
- `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930/evaluation/continuous-repo-current-v1/current/R030/inputs/repository/cli/src/cleanup_guard.rs` (lines 65-126); SHA-256 `383311c42fc4346fb7bd8d0bee07278a78ff0c29fbe571e9147ddda276a5b891`

## Independence and source limits

R017 and all old grader directories remain unopened. Candidate method/history/native/economics remain locked. Missing first-party sources are evaluator-only and were frozen before the decision. UNEXECUTED proposals are assessed as logical proposals, not executed successes/failures.

Useful supported novelty: Tree-identity freshness shortcut even with older/divergent operation ids; Unimplemented pending_checkout markers and Windows persist TODOs; Vanished/forgotten workspace silent snapshot skip; Progress throttling and narrow signal-time guard design

Unresolved: No runtime validation of six proposals; Platform lock behavior explicitly unread by candidate; Exact historical malformed-marker trigger is fixed at pin, while other source unwrap paths remain; General crash durability or data-loss-free recovery not established; All hypothetical GUI safeguards remain proposals; Actual candidate source acquisition, operations and runtime outcomes remain UNKNOWN; Raw PNG visual interpretation unavailable under text-only guard

Freeze 2026-10-01T22:59:13.615349+00:00; elapsed wall 3493.8s; response checkpoint 33; generated usage UNKNOWN.
