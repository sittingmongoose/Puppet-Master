# DMEM fix round 1 — 2026-11-04

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source head / implementation commit: `87024556d85e707dea8e1051d8b04d95c9123c14`. Reviewed head: `ef00a9a59f9c4d0a56ac1cf120149f024211d86e`. Original base: `be4766513ff71776346fc73b84f2542990f955af`. This report and the self-grade are committed in a separate report-only follow-up, so the source pin is exact.

## Outcome

Both blocking findings are fixed. Eight drafted families self-grade prepared with retention still pending and membership ABSENT. This is a worker self-grade, not independent review, admission, DEPTH_PASS, governance clearance or native execution. Four monthly-summary/prune families remain held with their existing questions and contracts unchanged.

| Family | Before (independent review) | After (self-grade at assessed head) |
|---|---|---|
| `memory.dedup_sweep.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.dedup_sweep.started` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.lexical.rebuild.completed` | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.lexical.rebuild.started` | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.semantic.rebuild.completed` | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.index.semantic.rebuild.started` | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.verification_sweep.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `memory.verification_sweep.started` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

All four held rows retain 1 PASS / 2 PARTIAL / 9 ABSENT, byte-for-byte in the self-grade. The prior branch self-grade was 9 PASS / 2 PARTIAL / 1 ABSENT for all eight; the independent review correctly downgraded producer, replay and transitions on the four rebuild rows to 6 PASS / 5 PARTIAL / 1 ABSENT. The round-1 after counts are 10 PASS / 1 PARTIAL / 1 ABSENT for each draft. Across all 144 cells: 84 PASS, 16 PARTIAL, 44 ABSENT. The sole remaining open contract cell for prepared rows is retention; deliberate non-admission is ABSENT. Native NOT_RUN alone lowers no cell.

## Review round 1: findings and responses

1. **Blocking 1 — fixed in `87024556d85e707dea8e1051d8b04d95c9123c14`.** Where: `Plans/storage-plan.md:29599` (SP-632/SP-633 lexical) and `Plans/storage-plan.md:29713` (SP-634/SP-635 semantic); `Plans/memory_maintenance_operation.schema.json`; new `Plans/memory_maintenance_rebuild_target.schema.json`; six lane value rows in `Plans/storage_value_registry.json`. Cause: the old closed operation rows could not store the promised exact shadow target and had no concrete selected-target record. Fix: each exact rebuild family independently binds required nullable `prepared_target`, a durable `prepared` phase, closed artifact inventory, domain-separated target and manifest identity, canonical operation key, pre-swap flush/publication, exact-prior selector CAS and post-swap recovery joins. Two new derived selector rows record the complete selected descriptor in `assistant_memory_derived.redb/memory_index_selectors`; they are distinct from SP-278's generic CURRENT. The original operation descriptor is mandatory-backup custody; derived selectors/files quarantine and require a separately accepted rebuild after loss. Recovery compares the complete original descriptor and inventory, never an opaque result string or mtime. No canonical gist deletion, survivor selection, target collection or retention policy was chosen. This is technical recovery under current DL-045, not a stopped Jared cell. Verify: full DMEM checker, its per-family prepare/swap/crash/concurrent-selector/invalid-descriptor traces and `review-regressions.json`.

2. **Blocking 2 — fixed in `87024556d85e707dea8e1051d8b04d95c9123c14`.** Where: `scripts/pm_memory_maintenance_events.py`, `Plans/memory_maintenance_event_fixtures.json`, `Plans/memory_maintenance_operation.schema.json`, own SP-630–637/CV-650/652/654/656 text, and `Plans/Automated_Testing_System.md:7243` (ATS-315). Cause: Boolean proof flags and recomputed event hashes did not compare original outcomes or exercise operation CAS/crash/no-repeat semantics; terminal schema rows could lack receipts and outcome. Fix: retain all original 136 cases and expected outcomes, supply concrete operation/full-value custody, and independently author expected durable states. The full checker now runs 188 boundary cases, 84 operation cases and 240 traces / 428 steps over the eight exact families. Each has original-value equality, stale CAS, interrupted publication, lost ack, replay, repeated-effect refusal and settled-failure coverage. Rebuilds additionally cover exact existing-selector replacement, crash after swap before effect settlement, third-party selectors and missing/unsafe/unsorted artifacts. Closed schemas enforce phase-dependent null/non-null fields; withdrawal is an external fence preserving the durable phase. Frozen start/terminal times and bounded `memresult_` refs join the original operation outcome. SP-340 profiles and a reused canonical MessagePack encoder check the 16 KiB cap, reserving terminal capacity before swap; oversized metadata cannot be truncated. ATS-315 names exactly what these synthetic checks establish and leaves physical SP-286/redb/filesystem/backup/read-race proof native NOT_RUN. Verify: full checker exits 0; all four review terminal mutations and all four null-completed schema counterexamples are rejected.

**Other review observations.** The 12 overstated index-recovery cells were regraded from the review's PARTIAL baseline against current evidence. All 144 citation sets pass exact-substring / <=200-character validation. No finding is disputed. There are no additional numbered should-fix findings or lane-owned notes in the review. The four policy holds, pending retention, absence of membership and native boundaries remain explicit.

## Technical bindings, searches and premise checks

`DMEM-search.json` preserves the twelve original per-family searches. Round 1 adds an independent search record only to each of the eight drafted rows. Search scope: live non-generated Plans Markdown/JSON, excluding ledgers/audits/evidence/migration/shards/indexes, at the reviewed head; exact event names plus target/shadow/generation/swap/manifest with Tantivy/USearch. `target-search.json` records the hits. No concrete memory target descriptor, pre-swap value or selector was found; the existing SP rebuild units only promised recording it. Reuse remains explicit: AMS 4.1/amended 4.2 and 7.2; SP-286/CV-339 original full-value v2 custody; SP-278/DL-076 history checkpoint; SP-340 size/file split. Each exact event's own SP unit labels new bindings as newly authored. No sibling is its authority.

The four existing operation families keep their own keys and owners. Newly authored `memory_index_lexical_selector` and `memory_index_semantic_selector` are derived selection custody, not event-family admissions. Closed target inventories retain every file, including Tantivy dotfiles and the paired USearch/mapping-redb snapshot. Target identity binds storage, Project, original operation, kind, source revision and manifest. Each family also binds frozen publication timestamps and `memresult_`/outcome digests back to its original operation. No unspecified external result body remains.

Current-premise rechecks: DL-045 still explicitly lists all twelve names and permits technical recovery only; current AMS/UCC still specify the operations. DL-076/SP-278 still forbids persisted redb_snapshot_id. Current DL-270/AMS 4.2 puts mapping/tombstones in derived redb and BRS-031 rebuilds derived data. SP-286/CV-339 still requires full-flush barriers and full-value v2 originals. AMS-054 remains app-thread-private; these drafts are Project-only and create no app event writer. No old answer with a changed premise was applied. No Jared-reserved choice was needed to close either blocker.

## Held questions and integration items

The four `memory.monthly_summary.*` / `memory.prune_archive.*` rows remain exactly held. Their prior questions are preserved: which policy selects older low-activation Note gists and governs source retention after consolidation; which eligibility policy chooses archive versus deletion and preserves history/holds/pins. No held schema, operation family or dependent contract was added or changed. Existing dedup source-survivor/deletion policy is likewise not answered; policy-dependent mutation stays unavailable.

RT must settle event/operation/selector/target retention. The pending marker selects no candidate class or collection permission. Event Authority review/admission and all native obligations remain outstanding.

Outside-lane checks: storage-profile checker exits 1 with 41 unrelated missing profiles; the reviewed head had 45, and the four removed errors are exactly the lane's original operation rows. All six lane values now have profiles. Assistant checker exits 1 only because 51 Browser families remain pending admission; current errors=[] and projects_refresh_static_failures=[]. Those 51 names are unchanged against reviewed-head inputs. The auxiliary baseline Assistant inventory omitted one nested goal-cancelled schema and is not claimed to be a complete equivalent run. These are integration items, not changes to other owners.

## Shared hunks, scope and IDs

- `storage-plan.md`: edit only existing SP-630–637; target detail appears separately in each exact rebuild unit.
- `Contracts_V0.md`: strengthen the original-outcome join only in CV-650/652/654/656; start contracts unchanged.
- `Automated_Testing_System.md`: replace ATS-315's overclaim with precise static/native coverage.
- `storage_value_registry.json`: update only four lane operation objects, append two derived selector objects, append six lane profiles. Pre-existing non-lane family/profile objects and all other top-level/profile metadata are unchanged.
- Regeneration changes only shard groups `storage-plan`, `contracts_v0`, `automated_testing_system`, `storage_value_registry` plus generated `.plan_index`. Shard check covers 99 sources / 3,106 shards and passes.
- No new PlanUnit id minted. IDs used remain AMS-100–107, SP-630–637, CV-650–657 and ATS-315 (25 existing lane IDs). Reserved unused: AMS-108–129, SP-638–639, CV-658–659, ATS-316–319.
- No registry append, admission, Decision Log, `.gitignore`, Spec Lock, auto_decisions, evidence bundle, frozen validator, tests file, governance reseal, pm-mail, subagent, landing lock or main push.

## Checks

| Command / check | Exit | Evidence file under fix1 |
|---|---:|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 | `targeted-check.json` |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `shard-generate.log` |
| `python3 scripts/pm-plan-index.py generate` | 0 | `index-generate.json` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `shard-check.log` |
| `python3 scripts/pm-plan-index.py validate` | 0 | `index-validate.json` |
| `Draft202012Validator(storage_value_registry.schema.json)` | 0 | `storage-value-schema.json` |
| `python3 scripts/pm-storage-recovery-contracts.py --self-test` | 0 | `storage-recovery.json` |
| `python3 scripts/pm-storage-profile-check.py` | 1 | `storage-profile.json` |
| `python3 scripts/pm-assistant-contract-check.py` | 1 | `assistant-contract.json` |
| `review counterexample regression probes` | 0 | `review-regressions.json` |
| `scope and original fixture outcome audit` | 0 | `scope-audit.json` |
| `git diff --check` | 0 | `no output` |

Top-level index generate/validate JSON statuses were parsed as pass, not searched for nested status text. All 15 ignored currentness-edition files were copied from the VM share before index generation and SHA-256 matched. Initial memory/disk gates passed (22 GB available memory; 125 GB available disk); the detached sparse worktree was created only after both passed.

During authoring, fixture/checker failures exposed baseline-positive adaptation, result-shape synchronization and terminal-cap reservation mistakes; they were corrected and the complete checker rerun. A first auxiliary baseline attempt refused noncanonical symlink paths; a copied-input run was used instead. No failed final required check is hidden, and no existing rule was weakened.

## Evidence and cleanup

Report/self-grade copies go to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/`; the round-specific outputs below remain in `fix1/`. The branch is pushed after the source and report steps. The detached fix worktree `/home/sittingmongoose/pm-worktrees/DMEM-fix1` is removed after the final push, as FIX-ROUND.md requires. No development server or browser was started. Temporary baseline inputs and scratch rewrite scripts were removed.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/currentness-sha256.txt` | `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/target-search.json` | `dcad547c067249c13851dbe5723cd0150aca801228e1abbe46f27a6ac3428854` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/targeted-check.json` | `e7d5f2802d5deedcffcebd306a62d7807e0dd3410510a4a37f78dd65e122b052` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/review-regressions.json` | `8fe7558621fc00a114d810c2d45abbe75c0adf807241304a63d081e285d6a6f6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/storage-value-schema.json` | `f561779247ccc8fe3c3ecf04fe09091f420eb0448f5b7798bc4aa359620c54bc` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/storage-recovery.json` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/storage-profile.json` | `6e550e1e361f3fb8865210511a0bc682d661fa18c1a2d72ca8151dc243baa064` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/baseline-storage-profile.json` | `1e0b4d4ac3a9045bcc5277f6aa127a3e069390e1b23f4f406d16a8763c30c6a5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/assistant-contract.json` | `bb3ad87b2abbda3a5b859f19ca6ca35a0ec8c9b7b55902481a758938833a161d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/baseline-comparison.json` | `c187d2a57eb90cea262bb15665a8c4036a9d84be395e9368aff28590d511e7d9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/scope-audit.json` | `7882dbfebe26478058756608a0951669da36c83462d19c9036e6c972a16f13bb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/regrade-validation.json` | `dfd7903752ed53e25142258abe1b9935c20a6e8b4614c84f012a96db6ad6d202` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/commands.json` | `bea21e9d2ad88274f7e8655c0caa5341b2b6a09c0bec2885385e18892054f823` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/shard-generate.log` | `fca3b9db3ca4ab22037b22938229adee0ea56a84424ddfbffbfc7b7c2a76d5b4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/index-generate.json` | `5ae0230e67e77ee90d0943549263f5f2684dbe01fb4f3240d28bbc26d36aae8d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/shard-check.log` | `ebb3b2680a9b7f9beb1574da4fa1c0d868f3b156d16a9612d863d3a2c3a9ccc3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix1/index-validate.json` | `9278d80f947a33208006fd0ddcd07b367bcd380c02a7c712b9d779f6d1676b71` |
