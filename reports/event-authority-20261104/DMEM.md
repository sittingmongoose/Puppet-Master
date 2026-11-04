# DMEM fix round 3 — 2026-11-04

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source head: `91c899446cf01a62db84067940b9fcab53f8272b`. Reviewed head: `720fc29400ce5fbf5e2fd92e2454f725c4f909b9`. B4 repair: `2d6bc3d09e`. Standing-check companion and derived files: `91c899446c`. This report and the self-grade are a report-only follow-up; the source pin is exact. Prior reports remain in Git history.

## Outcome and family grades

**Worker result: 8/8 prepared**, up from the cycle-3 review’s 4/8, pending the final independent review. No additional fix round is assumed. All 96 prepared-family cells were regraded, with 220 exact current citation instances checked. Only the four completed-family `positive_negative_oracles` cells change from PARTIAL to PASS. Membership remains ABSENT and retention PARTIAL. Native execution remains NOT_RUN.

P/Q/A below are PASS/PARTIAL/ABSENT counts. Every standing cell is PASS with the applicability and proof limits in the numbered table below.

| Exact family | Before P/Q/A | After P/Q/A | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|---|
| `memory.dedup_sweep.completed` | 9/2/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.dedup_sweep.started` | 10/1/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.completed` | 9/2/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.lexical.rebuild.started` | 10/1/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.completed` | 9/2/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.index.semantic.rebuild.started` | 10/1/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.completed` | 9/2/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `memory.verification_sweep.started` | 10/1/1 | 10/1/1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

Prepared totals move from **76 PASS / 12 PARTIAL / 8 ABSENT** to **80 PASS / 8 PARTIAL / 8 ABSENT**. The four monthly-summary/prune families stay held and ungraded in this round. Their legacy self-grade row objects and contract hold rows are structurally unchanged. Including those historical rows, the file retains 84 PASS / 16 PARTIAL / 44 ABSENT; that total does not represent a fresh grade of the holds. Jared’s DL-402/DL-403 settle archive-only, not-yet-runnable terms; applying those answers is separate work, not an unanswered product question or permission request from this repair.

## Review round 3: findings and responses

### B4 — fixed (`2d6bc3d09e`)

**Where:** `scripts/pm_memory_maintenance_events.py:188–190`, before the retained-original branch; all four completed `writer_families` in `Plans/memory_maintenance_event_fixtures.json`. Governing owner text is unchanged: SP-630/632/634/636 already requires exact original start custody for later phases and retries.

**Why:** The old terminal-original return ran before the start-custody guard. The exact review mutation reproduced eight false accepts: four completed families, each at effect_committed and completed, with intact terminal originals and schema-valid operations but no original start. `B4-before.json` records them.

**Fix:** Move the existing guard before any completed original return. No rule is removed or weakened. Each completed family adds succeeded and failed retry states before and after completion: 16 intact-custody positives and 64 negatives across missing start, altered retained hash, altered retained full value and missing full-flush custody. Every refusal is exactly `start_receipt_missing`, with no output and unchanged durable state. Authorized retries return the exact terminal original without append/effect. Restoring the old guard order makes the full checker assert `expected refusal`; all 16 phase/outcome missing-start expectations also independently fail the full-process checker when corrupted to expect success.

### Earlier Astra B1 — fixed (`9d197a494c`), recheck PASS

**Where:** The eight complete canonical writer suites and `append_current`. **Why:** Earlier reduced originals omitted required writer-envelope and replay-policy checks. **Fix retained:** All 28 required envelope fields, legal replay policy, exact dispatch/identity/partition joins, plus fresh and retry `projector_replay_only` refusal. The review harness rerun passes 248 B1 probes, including 16 replay-only refusals and 224 required-field deletions. Each family’s independently corrupted replay-only expectation exits 1.

### Earlier Astra B2 — fixed (`9d197a494c`), recheck PASS

**Where:** Completed recovery in `transition` and each exact family’s traces. **Why:** Recovery disclosed an original without current permission/withdrawal checks. **Fix retained:** All 32 succeeded/failed denied-or-withdrawn recoveries refuse `permission_or_withdrawal` without durable mutation; 16 authorized recoveries return their original. These are the exact earlier mutations plus failed-outcome coverage.

### Earlier Astra B3 — fixed (`9d197a494c`), recheck PASS

**Where:** Started `accept`, retry/replay and recovery custody gates. **Why:** A later-phase started gate could pass after original-start removal. **Fix retained:** The exact four Astra reproductions reject; all 38 review custody probes pass. Lawful accepted pre-append admission remains distinct from required recorded/later-phase start custody.

### Cycle-1 blocker 1 — fixed (`87024556d8`), recheck PASS

**Where:** Both lexical and both semantic operation/target/selector contracts and fixtures. **Why:** Durable prepared target and post-swap recovery custody were not representable. **Fix retained:** All four own prepared rows are representable; deleting the required target fails the closed schema, and schema-valid wrong target identities fail semantic validation. Each family’s missing-target mutation independently causes a named full-checker assertion. Existing prepare/swap/recovery and selector-CAS traces remain unchanged.

### Cycle-1 blocker 2 — fixed (`87024556d8`), recheck PASS

**Where:** Boundary, operation and stateful oracles for all eight families. **Why:** Proof flags did not establish frozen originals, CAS or no-repeat behavior. **Fix retained:** Exact earlier changed terminal status/ref/hash mutations reject for every completed family, as do schema-valid failed results paired with original success custody. Null completed receipt/outcome rows reject for all eight families. Stale CAS, repeated effect and altered retained-original probes refuse with unchanged state. All original 206 boundary cases, 84 operation cases, 276 traces / 464 steps and old snapshots remain structurally unchanged.

### N1 — handled by explicit qualification (report-only)

**Where:** `Plans/.plan_index/{doc_cards,dependencies,coverage_report,node_readiness_report}.json`. **Why:** The existing generator writes `generated_at_utc`; literal byte equality across regeneration is not a valid claim for those clock fields. **Fix:** Retain that qualification, leave the generator unchanged and report parsed top-level validation results. All regenerated shard paths belong to the edited Automated Testing System owner. Index content reflects the ATS change and expected timestamps; no unrelated owner shard changed.

No finding is disputed. No repair cell needs a new Jared decision.

## All eight standing checks and their negative cases

Every numbered check has an independently corrupted expectation executed through the complete checker for **each of the eight families**. The audit requires exit 1 with that case’s named AssertionError. Success exit 0 is rejected by the audit. There are 80 such standing runs (additional cases for 6 and 8), plus 32 review-regression runs: **112/112 rejected**. `standing-checks.json` contains every family/check pairing, exact fixture name, full-checker exit and qualification.

| # | Result across 8 families | Negative and qualification |
|---|---|---|
| **1 — replay-only** | PASS 8/8 | Fresh and retained-original retry with `projector_replay_only` refuse exactly `replay_only_not_appendable`. |
| **2 — CV-366 Application key** | PASS 8/8, Project-only scope | Each rejects an exact `application@1:{hex(server_id)}:{hex(owner_operation_id)}`-shaped key and malformed/raw/old-Project/trailing-LF Application attempts. No Application writer is introduced or claimed. |
| **3 — Project partition** | PASS 8/8 | Positives use `project~cHJvamVjdC0x`; raw Project, another encoded Project and padded encoding refuse `scope_partition_mismatch`. |
| **4 — inline cap / SP-337** | PASS 8/8, bounded inline roots | Maximum-width permitted UTF-8 bodies are 2,348–2,649 MessagePack bytes and fit 16 KiB. A 17,000-character body fails each closed schema. No permitted over-limit body exists, so no new payload-ref path is authored; SP-337 remains authoritative for separately declared larger bodies. |
| **5 — exact identifiers** | PASS 8/8 | All 170 lane pattern declarations retain exact lengths/full-input guards. Trailing-LF raw-schema negatives cover payloads, operations, targets and selectors; all six registry schema mirrors still match. |
| **6 — caller semantics** | PASS 8/8 | Caller payload/actor/time/correlation/redaction/producer-sequence changes conflict. Individual and combined Storage sequence/observed/persisted changes return the retained original. Both wrong conflict acceptance and returning changed metadata are rejected by full-checker mutations. |
| **7 — checkpoint Storage join** | PASS 8/8, adopted generic identity only | New synthetic positives reuse the existing canonical SP-278 checkpoint schema/fixture, with event IDs bound to the same operation Storage instance. Foreign checkpoint instance, instance-qualified key and event identity each fail. No DMEM cursor/format, source-inclusion proof, native projection or read authorization is claimed. |
| **8 — failure exit** | PASS 8/8, checker process | Corrupting a negative boundary to expect success makes the full checker exit 1 for each family. Unknown `exit_code=0` is separately rejected by each closed payload schema. The maintenance event has no process-exit contract, so this proves checker failure propagation and unknown-field rejection, not an absent native process path. |

`91c899446c` adds these per-family companion negatives, maximum-width positives, adopted generic checkpoint identity tests, required-case coverage guards and ATS-315’s exact test boundaries. Existing tests and expectations are preserved. No new product binding, producer, consumer, checkpoint family, retention class or PlanUnit is minted. The inherited per-family searches remain in `reports/event-authority-20261104/DMEM-search.json`; existing AMS-100–107, CV-650–657 and SP-630–637 remain each family’s own contract.

## Checks, scope and limits

| Command / check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_memory_maintenance_events.py` | 0 | 206 boundaries; 84 operation cases; 276 stateful traces / 464 steps; 328 current-writer steps; 129 identifier cases; 32 adopted generic checkpoint identity cases. |
| Adapted unchanged cycle-3 independent probe harness | 0 | 827/827 probes, no failures; all exact B1–B4 reproductions rerun. |
| `prior-findings.py` | 0 | 180/180 earlier-finding, schema-valid outcome/target and expanded B4 custody probes. |
| `full-checker-mutations.py` | 0 | 112 independent complete-checker subprocesses; each exits 1 with its named assertion. |
| Shard `--generate`, then index `generate` | 0 / 0 | Parsed status pass; only ATS owner shards regenerated. |
| Shard `--check --config Plans/sharding_config.json` | 0 | Parsed status pass, failures empty; 99 sources / 3,107 shards. |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level pass; failures empty. |
| Fixture preservation, forbidden-path and scope audit | 0 | Prior cases/states unchanged; holds, registries and governance files untouched. |
| Regrade and current quote check | 0 | 96 prepared cells; 220 exact citation instances; four oracle upgrades only. |
| Currentness copy/hash and owner-premise comparisons | 0 | 15/15 edition files match; current envelope, CV-366 key and AMS operation premises unchanged on local `origin/main` `16acf7594a3fe8559af89491b895f440b314b99e`. |
| `git diff --check` | 0 | No whitespace errors. |

No test file was edited. The only checker edited is `scripts/pm_memory_maintenance_events.py`, run in full. No event-family registry append, admission, Decision Log, `.gitignore`, Spec Lock, `.evidence`, auto-decisions, frozen validator, governance seal, landing lock or main push. No mail was sent and no subagent, browser or server was started. Standard landing aggregate checks are left to the landing agent; this worker does not land.

Initial gates: 126 GB disk free and 18 GB available RAM. Available RAM stayed at least 13 GB in the observed checks; the latest check showed 135 GB disk free and 19 GB available RAM. The worktree uses the prescribed sparse set `Plans scripts reports tests`.

## IDs and remaining work

**New IDs: none.** Existing lane IDs retained: AMS-100–107, CV-650–657, SP-630–637, ATS-315 (25 total). Only ATS-315 prose is edited this round. Unused reservations remain AMS-108–129, CV-658–659, SP-638–639, ATS-316–319.

Final independent review remains required. Event/operation/selector/target retention, admission and native receipt/atomicity/flush/crash/backup/read-race proof remain separate obligations. Existing dedup survivor/deletion limits remain unchanged. Applying DL-402/DL-403 to the four archive-only held families is separate work. Static success grants no native activation or policy decision.

## Evidence and cleanup

All raw outputs and the runnable audit scripts are outside the repository under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/`. `source-inputs.json` pins the exact assessed source bytes. The report/self-grade overwrite the draft copies in the parent DMEM directory after the report commit. The detached worktree `/home/sittingmongoose/pm-worktrees/DMEM-fix3` is removed with the prescribed literal-path `git -C /home/sittingmongoose/src/PuppetMaster worktree remove --force /home/sittingmongoose/pm-worktrees/DMEM-fix3` after all commits are pushed. The evidence remains as the reviewable result.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/evidence-sha256.json` | `578d57155693de4f77e156b6a9dc1263b19044755d0b674768f3002adb98de0e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/standing-checks.json` | `c94032a65f0e2806104ee4d34e69eee54cac9f4e43a4c73e62fe307f95f5f4d1` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/full-checker-mutations.json` | `7f15c8e68df5ba9a7fe77f8657d0860918daf8f7164e31f9d5bfad84ab57df0c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/cycle3-probe-results.json` | `fc482c133818883239c43500997daf46e967c4d89a61c1af83c6e75d85c03012` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/prior-findings.json` | `d04d1ea232a9e03e1776c1091fc0946aa47a6c49a19ab101af5c59c2c71a2f03` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/B4-before.json` | `fc471cd7c65221176b3ee093d867438380210fa0d2a8fca219abd706b77a5dd5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/B4-restored-defect.json` | `c2fe6c2580d407b0d32fe032527b3bb0e025cb52a221ee71217d069f742b79dd` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/targeted-check.json` | `60bd777cde99f59d0ea1e05bc0639fa2748b321e9fa4c06ddb39d527c4692bd3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/scope-audit.json` | `59c7f1e3a7017ae294b74c5a5339d53478907836e566803fd22107c17cbc31f4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/regrade-validation.json` | `87d18bc061b4ecf17c26b4815e1f63ab5891b39f715e973b8bd2485cb435cce9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/index-validate.json` | `96f8d60789e57083e5ff258aa41a8d570f9cf8aaa3acf944ba18e866ca60a437` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/fix3/shard-check.json` | `1a25aa4c77107f640cfffd7413df3618d6e71a670a7cc06f349236660cad9fc6` |
