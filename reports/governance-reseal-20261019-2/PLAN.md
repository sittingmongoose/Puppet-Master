# Governance reseal 2 plan — 2026-10-19

**Phase 1 plan revision, fix round 1. No Phase 2 action is authorized.** Original measurements and 32 controls are preserved below as cycle-1 evidence; revised controls and the two-place binding rehearsal appear in the fix-round section. The lead must complete cycle-2 Opus xhigh and Astra max reviews, confirm G-register and its snapshot/baseline follow-up, and mail **GO Phase 2** before this worker refreshes governance.

Review branch: `plans/governance-reseal2-20261019`. Agent: `codex-reseal2`. Fix-round full T3 worktree: `/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-d20640ac`, owned by `/home/sittingmongoose/src/PuppetMaster`. Local branch and Phase 2 holder branch: `plans/governance-reseal2-fix-20261019`. The review branch is attached to the original worker's worktree; this local branch starts at reviewed `128ad789b901ab90a2a4e3c1be2052a9b9022564` and pushes as a fast-forward to the same review ref. Initial Phase 1 main was `142cfa9192a135502328b3dd5fddf8462ef8fbd3`. Original measurement paths are historical, not execution paths.

## Authority and procedure

Jared assigned RESEAL2 on 2026-10-19: “You can reseal when you are ready to” and “Yes you can register them.” Lead `pm7-purge-lead` supplies the execution GO. The task-specific [RESEAL2 brief](/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/briefs/RESEAL2.md) expressly assigns the Phase 2 landing to this worker; that supersedes COMMON's general rule that the lead lands workers. G-register itself is landed by the lead. No mail goes to `home-redesign-planner`.

Read `AGENTS.md`, `.claude/CLAUDE.md` and `Plans/00-plans-index.md`. The procedure is the [previous plan](../governance-reseal-20261019/PLAN.md), [reseal record](../governance-reseal-20261019/reseal-record.md), [attestation](../governance-reseal-20261019/attestation.json), [baseline record](../governance-reseal-20261019/baseline-record.md), [execution evidence](../governance-reseal-20261019/execution-evidence.json), [checkpoint proof](../governance-reseal-20261019/checkpoint-pin-verification.json), and [landing-check rules](../landing-checks/README.md). Previous helpers and raw outputs were inspected as procedure references, not as reusable runtime state.

Fresh helpers: `/mnt/Cursor/share/puppet-master/2026-10-19-reseal2/`. Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/`. Worker report: `/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/reports/RESEAL2.md`.

Scope: Spec Lock; the sole live-current evidence bundle; readiness projections; exactly one new decision through `upsert_auto_decision`; the run-002 refresh pair; currentness written in place after the first checked main push; and a separate snapshot/baseline follow-up. The seven registered machine inputs are bound in **installed currentness and Spec Lock**, following G-register's canon registration. Existing schema versions and lock fields stay unchanged except hashes and these seven new rows.

**Lead adjudication, Opus FIX 1:** before G-register, **45 of 163 machine inputs are in Spec Lock; 26 of 163 are in live evidence, all from the shard-source/configuration mechanism; `Plans/touch_closure_action_sources.json` is in neither.** The fresh rehearsal resolves those 26 as 25 configured document-source rows plus `Plans/sharding_config.json`, a native sync root input; the review's shorthand "all shard sources" includes that configuration input. Currentness is the complete inventory. Jared requested durable detection of companion edits, so the seven gain repository-native Spec Lock registrations through `pm-governance-seal.py refresh --spec-lock --register-file` (94 to 101). They are deliberately **not bound in evidence**: `sync-plan-sharding-evidence` rebuilds that list from configured shard sources and would silently erase an external append. The fix brief adjudicates currentness plus Spec Lock only. `admit-companions.py` stays on disk labelled **UNUSED**, excluded from Phase 2 and `HELPERS.SHA256SUMS`. The future `reseal-record.md` and `execution-evidence.json` must state these two binding locations, the deliberate evidence exclusion, and this reason.

## Prerequisites before GO

| Prerequisite | Phase 1 state | Execution requirement |
|---|---|---|
| Previous real reseal | First checked main `984f605c0759ee57f5468a36413cb9e96c4bd955`; follow-up `ecd1e236395e1b95dc2f181a4be17543036065b7` | Verify ancestry and re-read its records. These are historical references. |
| G-register `plans/register-companions-20261019` | Candidate `5ce8b1b0f9ba3d819c6dea113a38a973a91c0dbb` passed both G reviews per lead mail `1019193634-4882`; LANDING-G is landing it; main/follow-up receipts pending | Lead supplies reviewed main and follow-up SHAs. Both must be ancestors of the frozen main. Reinspect any candidate-to-landed delta. |
| Local G-register preview | Measured without a commit, then aborted; the branch is restored to report-only changes | Completion and abort witnesses are bound in the Phase 1 manifest. The preview merge was never pushed. |
| Opus xhigh and Astra max plan reviews | Cycle 1: Opus FIX, Astra OK with one LOW; fix round 1 implements the lead's adjudication and all LOW items | Cycle 2 is lead-owned, two cycles at most. Remaining required decisions go to the lead. |
| Explicit authorization | Not received | Preserve the exact lead **GO Phase 2** mail and its id; `PENDING` is never executable authority. |

Any intervening Plans change or governed script/input change requires re-inventory on the actual GO-time main. Protected inputs include every locked path, every discovered currentness source, all receipt source hashes and required-but-unpinned PNC dependencies, admission manifests/scripts/schema pins, the currentness generator, readiness validators, and every script used by this reseal or landing check. The lookup-only `scripts/pm7-where.py` is excluded only while it remains outside those bindings. Preparation and rebuilds occur outside the landing lock.

## Inventory and Phase 1 measurements

The full tree is not sparse. Named ignored inputs were copied with `rsync -a --no-perms --no-owner --no-group`: the 15-file installed currentness edition; settings-tome and chat-56 audit directories; the usage-recovery, usage-successor and widget-followup `FINAL_REPORT.md` files; widget-followup `audit_report.json`; and the three named Event Authority 2026-08-12 support files. The resize audit is symlinked to its shared-checkout directory. `tests/agent_packet_restrictions` points at the shared checkout's resolved evidence target. No whole `.audits` copy was made.

Each long command is detached and has a log, stdout, stderr, command metadata and exit file. A task-owned `TMPDIR` is passed explicitly. Each edition's manifest is compared with all 15 baseline-bound shared input hashes before and after measurement. No validator output is used as a new baseline in Phase 1.

<!-- PHASE1_RESULTS_START -->
Both measurement sets completed with no `validator_no_output` or timed-out subcheck. Main exactly matches every aggregate subcheck count in its recorded baseline. The preview merge was aborted; this branch contains only the plan. All 15 local/shared currentness inputs, both receipt pins and all seven companion bodies remain byte-identical.

| Check | Initial main | Uncommitted G-register preview |
|---|---:|---:|
| `audit-governance` | 1469 | 1541 |
| `evidence` | 0 | 34 |
| `migration-002` | 2 | 4 |
| `migration-current` | 0 | 54 |
| `plan-graph` | 0 | 34 |
| `readiness` | 23 | 24 |
| `run-gates` | 1486 | 1558 |
| `spec-lock` | 0 | 1 |

Standalone currentness is valid on initial main. Against the old installed edition, the G-register preview fails exactly `exact_live_source_set`, `all_live_sources_rehashed`. This directly exposes the seven unlisted inputs; the landing check cannot establish their inventory membership. The 34 evidence/graph hash drifts and one lock drift follow the edited index and its derived artifacts. Readiness adds one index source drift. Run 002 adds two `stale_batch_report_sha256_after` rows to its two inherited inventory findings. The old current snapshot has 54 source/snapshot mismatches after the index edit; G-register must land a fresh snapshot/baseline before GO.

Measured main readiness retains `{"buildability_gate_report_stale_or_not_canonical": 1, "event_denominator_unresolved": 2, "event_family_contract_depth_unresolved": 2, "event_legacy_fixture_root_mismatch": 1, "implementation_readiness_self_tests_failed": 1, "pnc019_source_hash_stale": 16}`. Currentness stays `UNKNOWN_OPEN`, all four authority flags false; frozen/quarantine/group custody is unchanged. The previous baseline has 14 export buckets, measured from this tree.

The paths below are relative to `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase1/`; each row has the same filename under `main/` and `g-register-preview/`.

| Output | Main SHA-256 | Preview SHA-256 |
|---|---|---|
| `audit-governance.json` | `255aec623e282abf11d56186c6b7b3577ec65309c88713578e965503c3de39f1` | `ba8e73a65ee0c53494ffde5471cf2d5fa206dbe58a9892dc214aed9942ccef72` |
| `currentness-validate.out` | `c1a812cd48c307af8ff0870839204f748202c0c5f035eb6751650741bc0a384b` | `394531f008c2b980e8f1c943a031160ab86791a94154fa3933919f7bc56f1d2b` |
| `evidence.json` | `1fb508b2f84d1602d7a0e161e4f530cb5fbaf90503571477fd0d5bce42e02f8e` | `8fcb7048a619fea8f819b8cba61d7aa745f10722c6caec45910b125af9309339` |
| `migration-002.json` | `818c79b9f5726d55893b60fe22b89f64a0eb6377837c469abfb70bf84a6fec2d` | `ca7dea1cbde9bde35772156c35a23768710cfc3f61714c6e846870f36655eb83` |
| `migration-current.out` | `ecff6ced16d921df0b1e3c3e4fe9265460d295131cd0d98bccab639cae74aa42` | `faa03d3d4b28057e72b5e0a6ca22e8f55d820ba2b6d92f11d1e124801057370f` |
| `plan-graph.json` | `143578863cdb9795c906bf977a83d11be0fba22cdfbc096aa4541c4c0397da91` | `77079a1a3aaa9c230e43713d519061b3ad65fb2f7e01b99b47fb29e33e201846` |
| `readiness.json` | `f2c21c21780879c81a9b0dc0b7721fbb5941fd444094ce74985e1bfc64f22e5b` | `d58da57d4de1a43d789b002aec9a6b8a2a964b9f0bf12ef4437a3449165df21d` |
| `run-gates.json` | `e7aafc649513f425d3b64a437240e5f33e1af94d42797f1b54a6be6dbbcdc379` | `86092e4e80be91c1f2aa9ebdc55ed657010206d23036dbabb56635654ac3ff59` |
| `spec-lock.json` | `2b410814097c0748d22858464d25a0f42127cb2e253f9b2dc023af588c38c7bc` | `01ddadbbea8cb646971b2503891770d7c46a289282576b489491414f88bcb2a3` |

Full result/identity witness: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase1/phase1-summary.json`, SHA-256 `c63b060d7eba8fca87ccc95029d7dc746b8753e4de2832cfe84c96c1847696c6`. Closed evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase1/SHA256SUMS`, SHA-256 `4462ae29a4d953a0ef78c09d962b06e8694557b5ba21b3f04f0b4ac74ee690a9`. It binds 316 closed measurement/control files; mailbox waits and mutable working state are excluded.

G-register ownership/report snapshot: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase1/G-register-report-snapshot.md`, SHA-256 `0594897af50c59c5eb9545754c97120955f93540c2c0cc1fe2471ab7d3a56b61`. Lead mail `1019193634-4882` confirms both G reviews are OK and records the standalone-currentness LOW; it does not authorize Phase 2.
<!-- PHASE1_RESULTS_END -->

The initial installed inventory has **259 total / 96 direct Markdown / 163 machine inputs**. The unchanged selector discovers the seven new inputs from G-register's live index registration, yielding **266 / 96 / 170**, exactly seven additions and no removals. Direct Markdown does not increase. `build_occurrences` finds zero event-like rows in each companion. The final re-inventory must reproduce those results on the reviewed landed main; a discrepancy is reported with its cause before proceeding.

| Companion | Product owner |
|---|---|
| `Plans/appearance_quick_sets.json` | FinalGUISpec F3-650 |
| `Plans/appearance_quick_sets.schema.json` | FinalGUISpec F3-650 |
| `Plans/editor_appearance.schema.json` | Commands_System CS-102; UI_Command_Catalog UCC-204 |
| `Plans/glyph_catalog.json` | FinalGUISpec F3-658 |
| `Plans/pm7_canon.fixtures.json` | Automated_Testing_System ATS-077 |
| `Plans/pm7_control_bindings.schema.json` | Wiring_Matrix WM-093 |
| `Plans/wallpaper_catalog.json` | FinalGUISpec F3-653 |

The seven JSON inputs remain byte-identical. Their registration describes the native Slint product. Concepts asset paths are reference art, and native implementation evidence remains required.

### What refreshes

**Spec Lock:** refresh all existing hashes with the repository tool and add exactly seven file registrations through its `--register-file` option. The initial lock has 94 entries, so the expected final count is 101. Preserve the existing entry order and all existing non-hash fields; preserve all other top-level and schema-version fields. If the landed prerequisite changes that inventory, explain and re-adjudicate it rather than assuming these counts.

**Live evidence:** the binding-mode manifest identifies exactly one `live_current` bundle, `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`. The initial bundle has 3,178 artifacts. Generate its shard reports, synchronize using the repository tool, then refresh existing evidence hashes. Expected count stays 3,178 if the prerequisite retains the shard path set; never add seven to this count. Save the synchronization result and inspect every `added_paths`/`removed_paths` entry. Machine inputs enter this bundle only through the configured shard-source/configuration mechanism. No companion evidence admission or historical bundle change is authorized. Evidence and graph must validate with no graph edit.

**Currentness:** discover exactly seven new machine inputs with the unchanged selector. Generate two external seven-file editions in the established order; install each only into the local ignored preparation copy. Keep all eight frozen files and both quarantine/group artifacts byte-identical. The installed shared 15-file edition remains unchanged through the first checked main push. Status stays `UNKNOWN_OPEN`; `closed`, `complete_denominator_known`, `contract_depth_complete`, and `build_or_pnc019_authority` stay false.

**DL-188:** both the event-family registry and workspace-layout v2 payload pins match the current receipt at initial main. Recompute them with the canonical SHA-256 helper. The expected apply is a no-op, preserving the entire receipt byte-for-byte. The helper asserts `changed_pin_paths == []` unless a fresh `--new-adjudication-mail-id` is passed; discovering drift stops for lead adjudication before passing that option. Keep `pm-mail:1019051652-b067` in `approval_refs` as the original bounded-rule lineage. Only those two source-hash slots are permitted; every other source hash, field, historical result and timestamp must equal a fresh backup. Drift outside those slots or a checkpoint mismatch stops. No certification harness runs.

**Readiness and run 002:** regenerate node readiness, generate buildability once, retain that first generation, and perform `refresh-batch-hashes` followed by `refresh-final-summary --seal-state preseal` on `DEFAULT_PLAN_MIGRATION_RUN`. Reconfirm that default from the live verifier. Regenerate final node readiness only after the final currentness edition. Prove the retained buildability report differs from its read-only canonical probe solely at its node-readiness input hash; otherwise stop. Validate the current pointer run independently, without refreshing it until the post-push snapshot.

### What stays reported

Inherited PRD references, audit-closure history, PM7 GUI fixture findings, raw-capture findings, historical PNC source staleness, unresolved Event denominator/depth, legacy fixture-root mismatch and readiness self-test failure remain reported. The buildability/node-readiness cycle residual is proven, not chased through repeated generation. Historical run 002 retains its document-count and inventory-set mismatches (72 historical versus 96 current documents). This reseal adds no native, handler, execution, certification, runtime, readiness, denominator or depth authority. Phase 1's measured residual table is the evidence; prior counts are not copied as new results.

## Fresh helper controls

The helper manifest binds the production copies under the fresh helper folder. Scratch tests copy them and their needed inputs into this task's evidence sandbox. Git object history is read through the original repository; no test invokes a Git mutation. All apply tests write only scratch copies. Production/shared manifests prove unchanged bytes afterward.

Required revised controls: scratch writer `check/write/check/restore`, restoring all 15 files; Phase 1 rejection of shared writer access; non-test writer rejection of empty, `None`, `PENDING`, and `TEST_ONLY` GO ids before any live write; pin preview/no-op apply and rejection of unadjudicated drift in each allowed slot; original adjudication lineage; canonical prefix40/current39 admission checks; seven Spec Lock additions with no unrelated field change; exact currentness/Spec Lock proof with old-inventory and stale-binding negative controls; one appended decision and duplicate rejection; attestation preview and seven-registration scratch apply; temp-space and malformed/incomplete report rejection. No evidence-admission helper runs. Every apply helper rejects `PENDING`, including `attestation.py`. A synthetic README-only writer edition is never eligible for installation. Phase 2 retests the writer on its real backup/final editions.


The **cycle-1** core scratch run had 27 controls, plus three temporary-space and two exact-binding controls. Its original three-location evidence-admission controls are historical and superseded by this adjudication. Revised control counts and hashes are recorded in the fix-round section. These are scratch proofs, not installed governance.

| Proof | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase1/helper-tests/verification.json` | `f861ce2c24d5cfc7ced8bed787ae3e4f89a9a58f205dca8e6fc2a4fb1f7b9b28` |
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase1/temp-guard-tests/verification.json` | `92e478a58914874057e0041a6ef2af435a01b8fd5a1f948b3bc0abba1045632b` |
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase1/seven-binding-tests/verification.json` | `550479309d842da909eab4e58b72f3aa337b97478c7cb4785a87072a0ca10193` |

**Cycle-1** helper manifest SHA-256 was `82330ec274aafbb9994309197595033972fc8f5ac4568198e19a988decff1d24`, preserved with the original bundle under revision evidence. The current manifest excludes the unused admission helper; its revised digest and source count are recorded in the fix-round section. Scratch sources and duplicate editions are removed after retaining result snapshots, logs and verification records.
## Phase 2 commands and order

Execution variables are assigned from fresh observations, not Phase 1 output filenames or the previous run's state:

```bash
RESEAL_EVIDENCE=/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase2
RESEAL_NOTES=/mnt/Cursor/share/puppet-master/2026-10-19-reseal2
RESEAL_BUNDLE=Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29
RESEAL_CURRENTNESS=Plans/.audits/event-authority-2026-08-13-currentness
RESEAL_TMPDIR=/home/sittingmongoose/pm-scratch/governance-reseal-20261019-2-tmp
RESEAL_EXECUTION_REF=plans/governance-reseal2-20261019-execution
mkdir -p "$RESEAL_TMPDIR"
export TMPDIR="$RESEAL_TMPDIR"
```

| Variable | Assignment point |
|---|---|
| `RESEAL_MAIN_BASE` | Full `origin/main` SHA after GO, fetch, and prerequisite ancestry checks; freeze in `phase2/state.json`. |
| `RESEAL_GO_MAIL_ID` | Exact preserved mail from `pm7-purge-lead` containing `GO Phase 2`, after reading its body and binding the approved plan. |
| `RESEAL_RUN002` | Live verifier's `DEFAULT_PLAN_MIGRATION_RUN`, not the current-run pointer. |
| `RESEAL_CURRENT_RUN` | GO-time pointer's `run_path`; save its `run_id` separately. |
| `RESEAL_RECEIPT_SHA` | SHA-256 of the fresh pre-apply receipt backup, proven equal to the live receipt. |
| `RESEAL_WRITER_CONFIG` / `_SHA` | Fresh old/final manifests and scratch destination; after the first push rebind to verified main and stat-derived acquisition time, then hash the exact new config. |
| `RESEAL_LOCK_ACQUIRED_AT_UTC` | Immutable timezone-aware UTC converted from the successful lock directory's initial `stat().st_mtime`, saved before writing the holder. |
| Next snapshot id/count/superseded id | Next free execution-date id, direct `Plans/*.md` count, and current pointer read at the first pushed main, under lock. |

Check the mailbox before each stage. Every long computation runs detached with a log and exit file. Every command receives explicit task `TMPDIR`, recorded with command metadata; remove inherited `PM_EVIDENCE_MAP` except for the two generator calls. Preserve the Phase 1 review ref and publish execution on the distinct ref above. No force push.

1. **Freeze and back up.** Preserve GO and G-register receipts. Provision the exact ignored inputs again and bind all 15 currentness inputs to the then-current baseline. Back up Spec Lock, decisions, readiness/index projections, the receipt, evidence tree, run 002, baseline and currentness. Save file sets and SHA-256 manifests. Bind protected sources and all intervening governed changes. Measure the five checks again before mutation:

```bash
python3 scripts/pm-plans-verify.py run-gates --report "$RESEAL_EVIDENCE/before/run-gates.json" --subcheck-timeout-seconds 600 --quiet-progress
python3 scripts/pm-plans-verify.py audit-governance --report "$RESEAL_EVIDENCE/before/audit-governance.json" --subcheck-timeout-seconds 600 --quiet-progress
python3 scripts/pm-plans-verify.py validate-implementation-readiness --report "$RESEAL_EVIDENCE/before/readiness.json" --subcheck-timeout-seconds 600
python3 scripts/pm-plans-verify.py validate-plan-migration --report "$RESEAL_EVIDENCE/before/migration-002.json" --subcheck-timeout-seconds 600
python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_CURRENT_RUN"
```

Also retain complete standalone Spec Lock, evidence and graph exports. No timeout flag is passed to `pm-plan-migration.py validate`; **never pass `--write-report`**, which would write `validation_report.json`. Reject missing output and rerun incomplete checks.

2. **Pins and first edition.** Run `admission-pins.py`, then `refresh-dl188-checkpoint-pins.py --apply --main-base "$RESEAL_MAIN_BASE" --go-mail-id "$RESEAL_GO_MAIL_ID" --expected-receipt-sha256 "$RESEAL_RECEIPT_SHA"`. Save `checkpoint-pin-verification.json` with actual main, GO, helper SHA, checkpoint and checkpoint-module SHA. Expected receipt bytes are unchanged. A drift requiring new adjudication stops before apply. Write a `pm.external_evidence_locations.v1` map with exactly one mapping from logical currentness root to the unchanged shared old edition. Set it only for:

```bash
PM_EVIDENCE_MAP="$RESEAL_EVIDENCE/evidence-map.json" python3 scripts/pm-event-authority-currentness.py generate --outdir "$RESEAL_EVIDENCE/currentness-edition-1"
```

Install exactly seven generated files locally, preserving eight frozen files and quarantine/group bytes; validate locally without a map. Assert counts 266/96/170 and exactly the seven added paths. The standalone validator is mandatory even if a landing check reports no gap:

```bash
python3 scripts/pm-event-authority-currentness.py validate > "$RESEAL_EVIDENCE/currentness-edition-1-validate.out"
python3 -c 'import json,sys; expected={"all_sources":266,"direct_plans_markdown":96,"registered_machine_inputs":170}; actual=json.load(open(sys.argv[1]))["counts"]; assert actual==expected, actual; print(actual)' "$RESEAL_CURRENTNESS/CURRENT_EVENT_SOURCE_INVENTORY.json"
```


3. **Readiness and historical run.** Run index generate/validate. Restore non-node index JSON only after proving its sole difference is `generated_at_utc`; retain node readiness. Generate buildability once and keep its bytes. Then run:

```bash
python3 scripts/pm-implementation-readiness.py generate
python3 scripts/pm-plan-migration.py refresh-batch-hashes --run-dir "$RESEAL_RUN002"
python3 scripts/pm-plan-migration.py refresh-final-summary --run-dir "$RESEAL_RUN002" --seal-state preseal
python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_RUN002"
```

4. **Evidence hash refresh.** Generate and check shard reports in the live bundle. Any shard body/path difference from the landed prerequisite stops. Synchronize, inspect its added/removed paths, then refresh existing evidence:

```bash
python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard_report.json"
python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard-check-report.json"
python3 scripts/pm-governance-seal.py sync-plan-sharding-evidence --evidence "$RESEAL_BUNDLE/evidence.json" --report "$RESEAL_BUNDLE/shard_report.json" \
  > "$RESEAL_EVIDENCE/shard-evidence-sync.json"
```

The ordinary `pm-governance-seal.py refresh --evidence ...` follows. Pass actual saved stdout through structured subprocess arguments for the three existing `commands_run` strings, preserving their spelling: index validate; shard generate with the live report path; shard check with the live check-report path. Keep the historical `plan-shard-generate` check unchanged. Update plan-index details from measured counts and add this reseal's check detail with actual main, GO, seven registrations and false authority limits. Validate evidence and graph; do not edit the graph.

5. **One decision, then Spec Lock.** Apply `decision-row.py` exactly once with actual main and GO; validate decisions. Refresh/register with the repository CLI:

```bash
python3 "$RESEAL_NOTES/decision-row.py" --apply --main-base "$RESEAL_MAIN_BASE" --go-mail-id "$RESEAL_GO_MAIL_ID"
python3 scripts/pm-plans-verify.py validate-auto-decisions
python3 scripts/pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json \
  --register-file Plans/appearance_quick_sets.json \
  --register-file Plans/appearance_quick_sets.schema.json \
  --register-file Plans/editor_appearance.schema.json \
  --register-file Plans/glyph_catalog.json \
  --register-file Plans/pm7_canon.fixtures.json \
  --register-file Plans/pm7_control_bindings.schema.json \
  --register-file Plans/wallpaper_catalog.json
python3 scripts/pm-plans-verify.py verify-spec-lock
```

No schema-version assignment, canonical-doc registration command, sharding-config registration or additional decision is authorized. Prove exactly the seven new lock paths and preserved existing non-hash fields.

6. **Final edition and checks.** Generate final currentness externally with the same one-root map; install the seven files locally and validate without a map. Confirm all seven companion hashes in currentness and Spec Lock; the seven have no evidence binding. Regenerate/validate final node readiness; keep first-generation buildability and prove the sole cycle residual. Retest scratch writer check/write/check/restore with real old/final manifests. Validate shards, index, lock, decisions, evidence, graph and currentness; run all five after measurements, compare complete findings and rerun incomplete subchecks. Use `attestation.py --apply` with actual GO, previous seal and frozen main; it requires all seven registrations and rejects `PENDING`. Write `reseal-record.md`, `attestation.json`, `checkpoint-pin-verification.json`, and `execution-evidence.json`, mode 100644. Both the record and execution evidence explicitly explain currentness/Spec Lock binding and deliberate evidence exclusion. Execution evidence binds helper/config hashes, manifests, commands, TMPDIR, free space and residuals; `post_push_followup` is initially null. Commit only explicit changed governance/report paths and push the distinct execution ref to both configured destinations. Remove the local ignored currentness copy before landing, keeping its backup/final editions externally and the other provisioned inputs locally.

After the final local edition is installed and all seven companions have both bindings, run both checks explicitly and retain their outputs:

```bash
python3 scripts/pm-event-authority-currentness.py validate > "$RESEAL_EVIDENCE/currentness-final.out"
python3 "$RESEAL_NOTES/verify-seven-bindings.py" --root /home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-d20640ac \
  > "$RESEAL_EVIDENCE/seven-bindings-final.json"
```

`verify-seven-bindings.py` requires the exact live/installed source set, 266/96/170 counts, current source hashes, and seven matching SHA-256 bindings in Spec Lock and currentness only. It is separate from the landing check and grants no runtime or native authority. `--inventory` accepts a task-evidence copy of the installed inventory for the foreign-dirty fallback below.

## The one auto-decisions row

Id: `dec-2026-10-19-governance-reseal-2`. Scope: `plans.governance.reseal_repository_wide`. Use `upsert_auto_decision`, which supplies timestamp and inputs hash. Rationale names Jared's 2026-10-19 assignment and registration approval, lead `pm7-purge-lead`, exact new GO mail id, previous seal, frozen main and intervening Plans history, seven product machine inputs, the DL-188 limit, refresh order, post-push currentness write, byte-identical custody and false authority flags. No row is written in Phase 1.

Applied paths are Spec Lock; the live evidence bundle and two reports; buildability; node readiness; and run 002's batch report/preseal summary. Add the receipt only if the bounded authorized apply actually changes it. Contract refs are the Spec Lock update policy, DL-039, DL-067, DL-188 and `pm.auto_decisions.schema.v1`.

## Landing, follow-up and cleanup

1. **Acquire immediately before landing fetch.** Atomically create `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`. On contention read its holder; clear only after 90 minutes, otherwise wait five minutes with bounded waits and retry. Immediately preserve the successful directory's `stat().st_mtime` as immutable acquisition epoch/UTC. Save it before writing the holder. The holder has exactly four `key: value` lines: agent `codex-reseal2`, branch `plans/governance-reseal2-fix-20261019`, current milestone UTC, phase. Update it at **lock taken, edition verified, rebase done, first check saved, first push, currentness written, snapshot recorded, follow-up checked, cleanup**; retain each holder/milestone in execution evidence. Milestones do not extend the **absolute 90-minute cap**. Deadline-bound command sessions and recovery act only on processes started by this task.

   **Go/no-go budget:** require at least 80 minutes remaining before starting the first landing check; 55 minutes before the first push/currentness write; 50 minutes before `snapshot-current`; 40 minutes before baseline recording; 25 minutes before the follow-up landing check; and 5 minutes before the second push/cleanup. Before any optional full rerun require its bounded timeout allowance plus all remaining downstream budgets. A timeout rerun at 1200 seconds cannot consume the follow-up's reserved 25 minutes. Recheck the immutable deadline before every stage. If a threshold fails, start no dependent step: reset an unpushed shared fast-forward with `git reset --keep origin/main`, preserve pushed main and a coherent installed edition, release the lock safely, and report the exact incomplete state. Never retain the lock merely to finish another check.
2. **Bind old input identity.** Immediately copy/hash all 15 shared currentness files; compare file set and bytes with preparation backup and the then-current baseline. Compare the baseline itself with the preparation copy. Mismatch stops, releases the lock, and requires re-inventory outside it. Do not record a baseline to excuse it.
3. **Space and environment.** At acquisition and before every full under-lock check, assert that task `TMPDIR` exists and is writable, root free space is at least 6 GiB, and Python's selected temporary directory resolves to that path. Record actual byte count and `df -h /`. Failure releases the lock before main changes. Every command receives the explicit environment.

```bash
test -d "$RESEAL_TMPDIR" -a -w "$RESEAL_TMPDIR"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/check-temp-space.py" > "$RESEAL_EVIDENCE/landing/temp-space-at-lock.json"
```

4. **Fetch, rebase, overlap, fast-forward.** Fetch/rebase the execution branch on current main. Reinspect all intervening protected inputs; if preparation no longer applies, release and rebuild outside the lock. Preserve the published review ref and publish rebased execution only on its distinct, fresh ref without force-updating a published ref. Check shards locally. In the shared landing checkout fetch the exact execution commit and inspect staged, unstaged and untracked paths for overlap with its diff; overlap stops for handoff. Shared HEAD must equal main's base. Fast-forward only. No other thread's dirty file is repaired or staged.
5. **First comparison before first push.** Keep the old currentness edition unchanged. Run shared shard check and the saved landing comparison below. A failed unpushed landing is reset immediately with `git reset --keep origin/main`; never `--hard`. Apply the repository's unrelated-shard-failure rule only after proving HEAD's named shard and manifest are consistent. Landing exit 2/3 stops. Exit 1 requires row adjudication and standalone reruns of all timeouts before push. Independently reject any `validator_no_output` anywhere in the verdict or full retained reports/exports regardless of its classification. Preserve export lists/counts and reconcile any coverage reduction before pushing. Push main to both destinations; verify both exact remote SHAs before currentness mutation.

```bash
TMPDIR="$RESEAL_TMPDIR" python3 scripts/pm-landing-check.py --base origin/main \
  --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
  --keep-check-reports "$RESEAL_EVIDENCE/landing/first-check-reports" --json \
  > "$RESEAL_EVIDENCE/landing/first-landing-check.json"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/reject-incomplete-checks.py" \
  "$RESEAL_EVIDENCE/landing/first-landing-check.json" "$RESEAL_EVIDENCE/landing/first-check-reports"
```

6. **Shared writer after verified push.** Recheck all 15 old hashes; rebind/hash the writer config to fresh old/final manifests, verified pushed SHA and stat-derived acquisition UTC. Run non-test `check` immediately before `write`; require `old_baseline_bound`. The writer rejects empty, `None`, `PENDING` and `TEST_ONLY` GO ids and checks holder identity, deadline, directory mtime and shared HEAD/origin/main. It copies only seven generated files in place, preserving eight frozen files and quarantine/group bytes. Partial failure restores the seven old files and verifies all 15; report the incomplete follow-up with the already-pushed main retained. Validate shared currentness and standalone readiness with no map; save outputs and the installed 15-file manifest. Reject incomplete validators.
After first-push verification and writer-config rebinding, run this sequence once; validate and prove the installed edition before taking the snapshot:

```bash
RESEAL_WRITER_CONFIG="$RESEAL_EVIDENCE/landing/in-place-write-config.json"
RESEAL_WRITER_CONFIG_SHA=$(TMPDIR="$RESEAL_TMPDIR" python3 -c 'import hashlib,sys; print(hashlib.sha256(open(sys.argv[1],"rb").read()).hexdigest())' "$RESEAL_WRITER_CONFIG")
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/in-place-write.py" \
  --config "$RESEAL_WRITER_CONFIG" --expected-config-sha256 "$RESEAL_WRITER_CONFIG_SHA" check \
  > "$RESEAL_EVIDENCE/landing/in-place-check.out"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/in-place-write.py" \
  --config "$RESEAL_WRITER_CONFIG" --expected-config-sha256 "$RESEAL_WRITER_CONFIG_SHA" write \
  > "$RESEAL_EVIDENCE/landing/in-place-write.out"
TMPDIR="$RESEAL_TMPDIR" python3 scripts/pm-event-authority-currentness.py validate \
  > "$RESEAL_EVIDENCE/landing/currentness-shared.out"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/verify-seven-bindings.py" --root /mnt/Cursor/PuppetMaster \
  > "$RESEAL_EVIDENCE/landing/seven-bindings-shared.json"
TMPDIR="$RESEAL_TMPDIR" python3 scripts/pm-implementation-readiness.py validate \
  > "$RESEAL_EVIDENCE/landing/shared-readiness-after-currentness.json"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/reject-incomplete-checks.py" \
  "$RESEAL_EVIDENCE/landing/shared-readiness-after-currentness.json"
```

**Foreign uncommitted paths:** if a shared currentness/binding proof fails or standalone readiness gains unexpected source drift beyond its adjudicated residuals, immediately retain `git --no-optional-locks status --porcelain -- Plans scripts` from the shared checkout. Inspect every failed path, compare it with the execution diff and clean first-pushed commit, and obtain any necessary owner confirmation through pm-mail. Only if **every unexpected failure** names another thread's uncommitted path, with no branch overlap or unexplained failure, copy/hash the installed inventory and repeat the proof against this clean worktree at the first pushed main:

```bash
git --no-optional-locks status --porcelain -- Plans scripts \
  > "$RESEAL_EVIDENCE/landing/shared-dirty-paths.out"
cp /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness/CURRENT_EVENT_SOURCE_INVENTORY.json \
  "$RESEAL_EVIDENCE/landing/installed-inventory-copy.json"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/verify-seven-bindings.py" \
  --root /home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-d20640ac \
  --inventory "$RESEAL_EVIDENCE/landing/installed-inventory-copy.json" \
  > "$RESEAL_EVIDENCE/landing/seven-bindings-clean-tree.json"
```

Also copy the installed 15-file edition into the local ignored currentness path, validate currentness and readiness there without a map, save both outputs, then remove only that temporary local copy **before snapshot/baseline**. Verify the shared 15-file manifest is unchanged throughout. Preserve the original failing output, all path attribution and the clean-tree results, and report the foreign-dirty condition to the lead. Never edit another thread's files. Any unattributed/overlapping failure or failed clean-tree proof stops the follow-up. This fallback does not waive the landing check's independent rules or authorize an unverified baseline.

7. **Snapshot before baseline, same full tree.** In this same provisioned full worktree, fetch and assert clean HEAD equals the first pushed main, with no local currentness directory. Allocate the next free execution-date snapshot id, read actual direct Markdown count and superseded pointer, then run `snapshot-current` followed by `--record-baseline`. Pass explicit task TMPDIR and shared readiness root. Bind all 15 installed hashes before/after. The recorder's stdout is text saved as `.out`; guard the actual baseline JSON and every retained JSON report/export, never that text stdout. Reject `validator_no_output`, timeouts and phantom audit-status/widget-support rows. Retry a timeout at 1200 seconds without committing an incomplete baseline.

```bash
RESEAL_DIRECT_MD_COUNT=$(TMPDIR="$RESEAL_TMPDIR" python3 -c 'from pathlib import Path; print(sum(p.is_file() for p in Path("Plans").glob("*.md")))')
RESEAL_SUPERSEDED_RUN_ID=$(TMPDIR="$RESEAL_TMPDIR" python3 -c 'import json; print(json.load(open("Plans/.plan_migration/current_run.json"))["run_id"])')
RESEAL_NEXT_RUN_ID=$(TMPDIR="$RESEAL_TMPDIR" python3 -c 'from pathlib import Path; from datetime import datetime,timezone; prefix="pds-"+datetime.now(timezone.utc).strftime("%Y%m%d")+"-"; ids=[int(p.name[len(prefix):len(prefix)+3]) for p in Path("Plans/.plan_migration").glob(prefix+"*-current-planunit-snapshot")]; print(prefix+f"{max(ids,default=0)+1:03d}"+"-current-planunit-snapshot")')
TMPDIR="$RESEAL_TMPDIR" python3 scripts/pm-plan-migration.py snapshot-current \
  --run-id "$RESEAL_NEXT_RUN_ID" --expected-doc-count "$RESEAL_DIRECT_MD_COUNT" \
  --supersedes-run-id "$RESEAL_SUPERSEDED_RUN_ID"
TMPDIR="$RESEAL_TMPDIR" python3 scripts/pm-landing-check.py --record-baseline \
  --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
  --keep-check-reports "$RESEAL_EVIDENCE/landing/baseline-check-reports" \
  > "$RESEAL_EVIDENCE/landing/record-baseline.out"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/reject-incomplete-checks.py" \
  reports/landing-checks/baseline.json "$RESEAL_EVIDENCE/landing/baseline-check-reports"
```

8. **Follow-up and second push.** Commit the new snapshot, pointer/supersession changes and baseline together with `baseline-record.md`, the completed-landing section of `reseal-record.md` and `post_push_followup` evidence. The baseline commit field must be the already-pushed main. Stage only explicitly enumerated changed paths; retain the required co-author trailer and mode 100644. Push execution ref, then shared fetch, overlap check, fast-forward, shard check and a second retained landing comparison before the second main push. Require empty `new`, `grown_buckets`, and `resolved_buckets`; zero blockers/infrastructure; unchanged installed hashes; and no `validator_no_output` anywhere. Push and verify both destinations. Any unpushed failure uses `reset --keep` immediately.

Run the follow-up comparison from the shared checkout, only with at least 25 minutes remaining:

```bash
TMPDIR="$RESEAL_TMPDIR" python3 -c 'from datetime import datetime,timezone; import sys; acquired=datetime.fromisoformat(sys.argv[1]); assert acquired.tzinfo is not None; elapsed=(datetime.now(timezone.utc)-acquired).total_seconds(); remaining=90*60-elapsed; assert 0 <= elapsed and remaining >= 25*60, "Insufficient lock budget for follow-up; release and report"; print(remaining)' "$RESEAL_LOCK_ACQUIRED_AT_UTC" \
  > "$RESEAL_EVIDENCE/landing/followup-budget-guard.out"
TMPDIR="$RESEAL_TMPDIR" python3 scripts/pm-landing-check.py --base origin/main \
  --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
  --keep-check-reports "$RESEAL_EVIDENCE/landing/followup-check-reports" --json \
  > "$RESEAL_EVIDENCE/landing/followup-landing-check.json"
TMPDIR="$RESEAL_TMPDIR" python3 "$RESEAL_NOTES/reject-incomplete-checks.py" \
  "$RESEAL_EVIDENCE/landing/followup-landing-check.json" "$RESEAL_EVIDENCE/landing/followup-check-reports"
```
9. **Report and release within cap.** Mail the lead both verified main SHAs, actual inventory and residual findings. Preserve the later final comparison in external completion evidence; do not create a commit/check recursion to insert its own verdict. Remove only this worker's ignored copies/symlinks, scratch, task temporary directory, T3 worktree through its owning clone, and landed local branch. Keep cited helper/evidence/report deliverables and every Concepts file. Release the lock after worktree/branch removal, within the same immutable cap. If a post-first-push step cannot complete, preserve the pushed main, restore only a partially written edition, release safely, and hand over the exact incomplete state.

**Export coverage:** compare both landing comparisons and the new baseline with the actual pre-landing baseline's keyed-from-export list, `compared_with_baseline_exports`, and `export_buckets` count. The initial observed count is 14; re-read it after G-register's landing. Any missing key or reduced bucket count triggers a complete rerun and row-level reconciliation showing findings cleared or became fully printed. An absent/unwritten/unreadable export is never an improvement. An unexplained reduction stops the relevant push or baseline commit. Bind both editions, lists/counts, reruns and reconciliation by SHA-256 in execution evidence.

**Expected export-bucket reductions at the measured base: none (14 to 14).** All 14 buckets are `unresolved_local_ref` in the PRD validator, one per path below in each aggregate (`audit-governance/prd_planning_runtime_contracts` and `run-gates/validate_prd_planning_runtime_contracts`). Each listed count is per aggregate. They remain reported; this reseal does not repair those schemas. Save the GO-time baseline's full rows/fingerprints and compare these keys individually, rather than accepting only an equal total.

| Export path | Count per aggregate | Expected after reseal |
|---|---:|---|
| `Plans/home_layout_event_contracts.schema.json` | 72 | retained |
| `Plans/home_layout_pending_receipt.schema.json` | 172 | retained |
| `Plans/home_layout_pending_receipt_v2_reader.schema.json` | 136 | retained |
| `Plans/restore_point_deleted_read_adapter.schema.json` | 302 | retained |
| `Plans/restore_point_retained_creation_read.schema.json` | 240 | retained |
| `Plans/restore_point_retained_read.schema.json` | 286 | retained |
| `Plans/storage_boot_recovery_control.schema.json` | 32 | retained |

Expected **printed-row** reductions from G-register are 34 `artifact_hash_stale` rows in each evidence/graph validator, one index `stale_hash` in Spec Lock, one `event_authority_currentness_source_drift` readiness row after installed currentness, and two run-002 `stale_batch_report_sha256_after` rows. Those validators are below their aggregate sample caps at the measured base, so their reduction should remove no export bucket. G-register's stale current snapshot (54 findings) must already be replaced by its prerequisite follow-up. If the actual GO-time baseline has additional export keys, enumerate each key and its exact retained/resolved/fully-printed rows during preparation outside the lock. Any unpredicted reduction still requires a complete rerun and row-level proof within the go/no-go budget; otherwise release and report.

## Risks and stop conditions

- A candidate preview is not a reviewed landing; GO-time main and G-register's follow-up may alter readiness, current-run and baseline inputs.
- New or unexplained inventory/path/count differences require re-inventory; the seven JSON files themselves must remain byte-identical.
- Evidence sync deliberately excludes the companions because they are not configured shard sources. All seven final bindings are asserted in currentness and Spec Lock only; adding them to evidence would create a silently erasable binding.
- Any DL-188 pin drift requiring new adjudication, non-allowlisted receipt change, frozen-custody change, authority-flag increase, shard-body/path drift, historical evidence change or graph edit stops.
- Missing temporary space or `validator_no_output` is an infrastructure failure; it is never accepted as an inherited product finding or recorded baseline.
- Local currentness must be absent for the shared-input landing comparison and post-push recording. All other named ignored support inputs must be present.
- The first comparison uses the old baseline/edition. Only the already-pushed result is recorded afterward. No baseline refresh can make an unpushed landing pass.
- A deadline, partial push, shared overlap or changed protected input stops dependent actions and is reported to the lead with exact state and recovery evidence.

## Out of scope

Owner prose, seven JSON body edits, Concepts edits or pruning, sharding-config registration, schema-version changes, historical evidence, certification-harness execution, receipt changes beyond the DL-188 rule, hand-edited shard bodies, plan-graph edits, executable WorkNodes/NodeSeeds, and native/runtime/buildability/denominator/depth authority.


## Fix round 1 — cycle-2 review packet

The lead's [fix brief](/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/briefs/RESEAL2-fix.md) adjudicates Opus FIX 1 as installed currentness plus Spec Lock only. The evidence-admission helper is unused and absent from the active manifest. The decision helper, two-place proof, Phase 2 steps and required future reseal record all carry that policy. Original review reports are [Opus cycle 1](/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/reviews/RESEAL2-opus-r1.md) and [Astra cycle 1](/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/reviews/RESEAL2-astra-r1.md).

**45 revised controls passed: 32 core and 13 rehearsal controls.** The non-test writer rejects empty, null, PENDING and TEST_ONLY GO ids. Each allowed DL-188 pin rejects unadjudicated drift, rejects placeholder adjudication, and accepts a bounded scratch-only change with a distinct simulated adjudication; the original `pm-mail:1019051652-b067` remains in the proof. The real no-drift receipt apply stays byte-identical. No test grants actual Phase 2 authority.

The native Spec Lock CLI rehearsal at immutable main `5ce8b1b0f9ba3d819c6dea113a38a973a91c0dbb` gives **94 to 101**, changes only the existing index hash, preserves entry order/non-hash fields, verifies cleanly and repeats without a byte change. Canonical currentness generation and validation give **266/96/170**, exactly seven additions and no removals. The two-place proof and copied-inventory clean-tree proof pass with **zero companion artifact additions** to the unchanged 3,178-row evidence bundle. Old 259-source inventory, stale ordinary-source hashes and stale companion Spec Lock hashes are rejected. Frozen/quarantine/group custody stays byte-identical, UNKNOWN_OPEN and all authority flags stay false.

The rehearsal independently resolves evidence coverage as **25 configured document sources plus the shard configuration root input**, totaling the review's 26/163. Lead FYI `1019202132-ef33` records that precision correction. Three scratch-driver setup/assertion corrections are retained as attempts with their cause/fix records: the 25-plus-config distinction, provisioning all locked derived inputs, and preserving evidence as a rehashed corpus source while omitting companion artifact bindings. These were scratch-only corrections, not Phase 2 or additional review cycles.

All Opus LOWs are addressed: staged 90-minute go/no-go thresholds and an executable 25-minute follow-up guard; expected 14-to-14 export coverage with every PRD bucket listed; restored literal run-id/count, writer, shared readiness, follow-up and milestone instructions; enforced DL-188 no-op/new-adjudication boundary; foreign-dirty attribution and clean-worktree proof; and corrected `never pass --write-report` wording. Astra's writer-boundary LOW is covered by four negative controls. All 14 bash blocks parse without execution.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/revisions/fix-round-1/`.

| File | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/revisions/fix-round-1/verification.json` | `51f006b69f8f181298b2419c628e9e9e116ff968dcce68abf67817690d1b1ec1` |
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/revisions/fix-round-1/helper-tests/verification.json` | `b9102d01f7b58db2260c19e83e0d21900a3c36a0ca9f99bcf406d86adb83da47` |
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/revisions/fix-round-1/rehearsal/verification.json` | `2994dc6bca25c37e49034edc08dcc492770405d4d6ee869fb29e1cd24a055d1f` |
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/revisions/fix-round-1/rehearsal/spec-lock-registration-proof.json` | `d8909433224f19156f087852114980bdf69ba28474aa2ca621299c9302c13f6b` |
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/revisions/fix-round-1/rehearsal/binding-policy-facts.json` | `217d7a225f494e846b904af04e7c7035789e1c4cdbb834e19bfad9fc8648f115` |
| `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/revisions/fix-round-1/SHA256SUMS` | `8f1381a89b73db78dcc1d040158363518fbbcbbc92186e07916d8cd61930a1d2` |
| `/mnt/Cursor/share/puppet-master/2026-10-19-reseal2/HELPERS.SHA256SUMS` | `f61a30369b784b565d614d3e3f6e39dbab8de0ac3e5280e50a7924cf08fbef99` |

The active manifest binds 13 Python helpers and README; the unused admission helper is excluded. The closed evidence manifest binds 320 files, including before/after helper sources, passed controls and corrected scratch-attempt records. Task-owned scratch source trees, duplicate editions and TMPDIR were removed; one generated rehearsal edition remains as result evidence. No shared governance/currentness write, landing lock or landing occurred. The unlanded worktree is retained. Cycle-2 reviews and a separate lead **GO Phase 2** remain required.
