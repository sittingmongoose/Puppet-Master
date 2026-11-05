# Event Authority batch 1 integration — 2026-11-05

**Status: STOPPED_LOW_MEMORY — not ready for landing.**

Branch: `plans/ea-batch1-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Source/follow-up head: `75e0c31807ac8e8da947cb40249229e6b90d7c1e`. Machine: Nas1 (`ubuntu-agent-nas1`).

## Input replay

All seven fetched heads matched the reviewed table. All 33 distinct lane commits were replayed, retaining their complete messages and authors. Stacked ancestors were replayed once. The two-line `.gitignore` input remains its own commit.

| Input branch | Reviewed head | Replayed range | Commits | Owner-text conflicts | Generated conflict occurrences |
|---|---|---|---:|---:|---:|
| `plans/ea-s09-decisions-hb-scope-20261104` | `8724fcea67936ca08d55de237f55c2745eed459e` | `baf6d4a709..38a460c2a6` (inclusive) | 9 | 0 | 76 |
| `plans/ea-cards1-answers-20261104` | `b6332f391a7870bad5f01a29a7e9d080050dac27` | `b7ffabe5b0..b7ffabe5b0` (inclusive) | 1 | 0 | 19 |
| `plans/ea-dl087-088-retirements-20261104` | `b4ef60f0a9610a7fa64fc1e9f44674f20f31d876` | `337b9225f9..b9e27db760` (inclusive) | 5 | 0 | 179 |
| `plans/ea-storage-retention-20261104` | `4d52bd2758526cd0e8a56358baaa73049c1d4bdd` | `9a6b8ec9a3..04f47ef352` (inclusive) | 7 | 0 | 1647 |
| `plans/ea-retention-cards1-20261104` | `2663667e14346235daaa561d193e959422640b6e` | `9294c27390..c01a4adf50` (inclusive) | 7 | 0 | 2378 |
| `plans/ea-gitignore-ea-tests-20261104` | `66af5d0d67f9138754c63823c8ddb68bd10b40aa` | `aea83c9c81..aea83c9c81` (inclusive) | 1 | 0 | 0 |
| `plans/ea-census-recount-20261104` | `c53e4199ae94ca853a197354f3f9e7f296cf1efc` | `09e36a8f2d..7bf00a88b7` (inclusive) | 3 | 0 | 0 |

Generated conflicts are deferred, not hand-merged. Each no-commit cherry-pick restored `Plans/_shards/**` and `Plans/.plan_index/**` from the integration HEAD; a separate generator commit is required. The registry final-chunk rename conflicted at `59e68d0650`; the unmerged generated paths were removed from the index and restored from HEAD for later regeneration. Raw per-commit logs and complete path lists are outside the repository.

## Integration follow-ups

- `d5a7b43e81` — CA-RET review: SP-291 depends_on and source_lineage add DL-401.
- `e337c8ea4a` — B1 part 2 review: Eight retired J248 row objects and exactly eight rows in each ledger now record completed Contracts/Run Modes edits and current citations; dispositions, cohort/category, and evidence grades unchanged; historical positive cells explicitly grant no current authority; separate orchestrator pointer remains pending.
- `75e0c31807` — B1 part 2, B2 and CA-RET reviews: Append current integrated premise locators to dated reports without changing historical source hashes or meanings; DL-404 answers the older B2 Q2.

## IDs and premise checks

New PlanUnit IDs are DL-095, DL-096 and DL-400 through DL-414. Current main has no definition of any of these IDs. The completed all-origin scan examined 548 refs and 1,383 distinct canonical root Plans owner versions, called `git grep` for every ref, and reused exact Git blob identities for unchanged owner files. Source-memory ledgers, generated shards and migration copies are not canonical PlanUnit definitions. Stream C’s DL-330–332 on `origin/plans/closure-owner-answers-20261105` and DL-333 on `origin/plans/command-payload-defs-20261105` are disjoint. The matching Event Authority definitions on its September lineage and two reviewed input branches are the same decisions, not independently minted IDs.

**Known stale-branch collision:** `origin/fix/server-pairing-issuance-rebased-20260925` defines DL-095 as “Replace import resets omitted ordinary settings within the chosen scope” and DL-096 as “Stash apply explicitly chooses whether to restore saved staged selections”. These are different from stream E’s heartbeat/scope decisions. They are absent from main. BATCH1.md explicitly requires stopping on a main collision; the reviewed stream E IDs are preserved without unilateral renumbering.

Current premise locators and moved-citation corrections are appended to the B1 part 2, B2 and CA-RET reports. The 25 retention-row assignments remain at `Plans/storage-plan.md:17427`, `:17429`, `:17431`; the Chat policy object is still at `Plans/storage_value_registry.json:558`. Main’s DL-302, FileSafe and application-compaction admission boundaries, prototype cleanup and typed app storage/onboarding changes are preserved. B2’s older Q2 is answered by DL-404. Historical application hashes and dated source-revision citations are not restamped.

## Regeneration and validation

The mandatory memory guard sampled **5 GB available RAM** during index generation and terminated that process. Work stopped under the user’s explicit `< 6 GB` condition; no remaining generator or checker was started.

| Command | Exit | Result | Minimum available RAM |
|---|---:|---|---:|
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | Parsed top-level `status=pass`, 99 sources, no failures; 73.26 s | 8 GB |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Parsed top-level `status=pass`; completed consistency check; 405.44 s | 6 GB |
| `python3 scripts/pm-plan-index.py generate` | child -15; guard 99 | Terminated by SIGTERM at memory threshold after 548.95 s; no completed top-level status | 5 GB |
| `python3 scripts/pm-plan-index.py validate` | not run | Stopped before this step | — |
| Targeted unit tests, including `tests/test_event_authority_holding_bucket.py` | not run | Stopped before this step | — |
| Frozen independent validator, read-only | not run | Stopped before this step; no frozen receipt or code changed | — |
| Dry `pm-landing-check.py --base origin/main` | not run | No result exists to classify against the landing rules | — |

The generated shard diff was confined to the five edited namespaces: `contracts_v0` (66 tracked paths), `decision_log` (13), `run_modes` (30), `storage-plan` (91), and `storage_value_registry` (633): 833 changed tracked paths. No unrelated shard namespace changed. Because the paired index generation/validation did not finish, **no regenerated artifacts are committed**. All uncommitted generated output is discarded with the worktree. Resume by regenerating both shards and index, checking and validating them, committing generated files separately, then running the targeted tests and the full-tree dry landing check.

**Landing classification:** unavailable, because the dry landing check did not run. The list below is an expected reseal request from the source edits, not a classified dry-check result. Existing lane-level check claims remain historical and do not certify this integrated tree.

## Reseal and landing follow-up

Expected reseal list after these source edits: `Plans/Decision_Log.md`, `Plans/Contracts_V0.md`, `Plans/Run_Modes.md`, `Plans/storage-plan.md`, `Plans/storage_value_registry.json`, `scripts/pm-implementation-readiness.py`, and changed disposition-ledger evidence inputs. The designated reseal agent handles applicable Spec Lock entries, edited source/shard artifact evidence, currentness edition/source hashes, run-002 batch hashes/final summary and readiness artifacts. The actual landing agent separately refreshes the current migration snapshot and landing baseline after landing. None is refreshed by this integration worker.

## Open items

No product decision is supplied here. Carried exact retention questions:

- Which event starts the 90-day clock? Proposed option: first durable record creation, with no reset on retry, replay or recovery.
- How should the nine already-approved no-project Debug investigation history names be counted under the seven-year rule?
- How should the twelve memory-maintenance history names over a no-project thread-private memory corpus be counted under the seven-year rule?
- How should these five no-project candidate history names be counted under the seven-year rule? Permission override remains a non-emitting candidate.
- How should the three no-project hook candidate history names be counted under the approved 90-day terms?
- How should no-project model.catalog_refreshed records be counted under the approved 90-day terms?
- How should no-project preview history be counted under the approved 90-day terms, after the owner maps its scope and payload/adoption? This does not assert application scope for all seven names.

- Memory owner must propose age/score cutoffs for monthly summary/prune; neither job runs before approval (DL-403).
- Separate orchestrator pointer/child-run/board/raw-output owner edits and collaborative family contracts/admissions belong to batch 2.
- Storage SR-04 Boot aggregate interpretation, SR-05 future regrade and storage_maintenance_operation count/card observation remain carried notes; no choice made here.
- Chat successor physical form belongs to first admission technical work.
- CA-SEAL frozen-validator third change is excluded from batch 1.

## Evidence and operating limits

Raw inputs, replay records, per-commit conflicts, source-drift diff, ID-scan logs, copied currentness hashes, eight-row update record and completed/interrupted check outputs are retained under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/`. Evidence manifest and check hashes are listed below.

Initial disk free: 499 GB; initial RAM available: 11 GB. Generators/checkers were sequential. The `< 6 GB` stop occurred at 5 GB during index generation. Nas1 load was about 35; the shard check consumed about 20 seconds of CPU over more than six minutes of elapsed time. All 15 mandatory ignored currentness files matched SHA-256 after the attribute-copy warnings. Two named memory files are absent on Nas1. The optional landing-input copy was retried with per-input timeouts after NFS stalled; nine requested inputs succeeded, while the live-resize directory timed out and its `FINAL_REPORT.md` was absent on the shared source (not listed in the tracked audit-status index). The `tests/agent_packet_restrictions` evidence symlink is present.

No main push, landing lock, reseal, family admission, frozen-validator edit or protected governance edit. No pm-mail or subagents.

## Remaining verification and handoff

The source/follow-up head above was already pushed before the memory stop. This report is committed and pushed as a separate stopped-state handoff. No newly introduced product question stopped the integration; the stop is the mandatory machine-memory limit. The carried questions above remain unanswered. The lead must not land this branch until regeneration, index validation, targeted tests, read-only frozen validation, the dry landing check and the required Sol/Astra reviews are complete.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/inputs.json` — SHA-256 `a94359f8bad1117c77df598a00f108ead0d959c2f44b90cf60d216658815d85d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/replay.json` — SHA-256 `2ef08a45ac79daa11eccc1b0f9fec76aefd6aaae3658b8407d384927411a01cd`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/id-scan-summary.json` — SHA-256 `298094e184ecbf3045f7ae73185b71aeb3310ac47a5ef71b91b50a996fb8c157`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/currentness-copy.json` — SHA-256 `f4c2525c039671caad45a18b11c52f48223aff4d4f3e0e1a48ab42722728c391`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/retirement-row-update.json` — SHA-256 `80b020886dac24e1a378eb4e363bea9b488d92b11f9489ab29154f2cded04c2e`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/check-results.json` — SHA-256 `d1c6546b80f6024037d37672f8bcc07a9e9c63867f34ae6255754e060d6f2728`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/SHA256SUMS` — SHA-256 `af961765146e8ecd054b54dd21692f18cb87c47b98134690f7fd0424e8d1e71f`.
