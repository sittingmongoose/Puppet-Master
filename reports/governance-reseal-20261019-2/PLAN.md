# Governance reseal 2 plan — 2026-10-19

**Phase 1 draft: measurements and scratch controls are running. No Phase 2 action is authorized.** The lead must complete the capped Opus xhigh and Astra max reviews, land G-register and its snapshot/baseline follow-up, and mail **GO Phase 2** before this worker refreshes governance.

Branch: `plans/governance-reseal2-20261019`. Agent: `codex-reseal2`. Full T3 worktree: `/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-cd5b8993`, owned by `/home/sittingmongoose/src/PuppetMaster`. Fresh initial main: `142cfa9192a135502328b3dd5fddf8462ef8fbd3`.

## Authority and procedure

Jared assigned RESEAL2 on 2026-10-19: “You can reseal when you are ready to” and “Yes you can register them.” Lead `pm7-purge-lead` supplies the execution GO. The task-specific [RESEAL2 brief](/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/briefs/RESEAL2.md) expressly assigns the Phase 2 landing to this worker; that supersedes COMMON's general rule that the lead lands workers. G-register itself is landed by the lead. No mail goes to `home-redesign-planner`.

Read `AGENTS.md`, `.claude/CLAUDE.md` and `Plans/00-plans-index.md`. The procedure is the [previous plan](../governance-reseal-20261019/PLAN.md), [reseal record](../governance-reseal-20261019/reseal-record.md), [attestation](../governance-reseal-20261019/attestation.json), [baseline record](../governance-reseal-20261019/baseline-record.md), [execution evidence](../governance-reseal-20261019/execution-evidence.json), [checkpoint proof](../governance-reseal-20261019/checkpoint-pin-verification.json), and [landing-check rules](../landing-checks/README.md). Previous helpers and raw outputs were inspected as procedure references, not as reusable runtime state.

Fresh helpers: `/mnt/Cursor/share/puppet-master/2026-10-19-reseal2/`. Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/`. Worker report: `/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/reports/RESEAL2.md`.

Scope: Spec Lock; the sole live-current evidence bundle; readiness projections; exactly one new decision through `upsert_auto_decision`; the run-002 refresh pair; currentness written in place after the first checked main push; and a separate snapshot/baseline follow-up. The addition is exactly seven registered machine inputs in Spec Lock and live evidence, following G-register's canon registration. Existing schema versions and lock fields stay unchanged except hashes and these seven new rows.

## Prerequisites before GO

| Prerequisite | Phase 1 state | Execution requirement |
|---|---|---|
| Previous real reseal | First checked main `984f605c0759ee57f5468a36413cb9e96c4bd955`; follow-up `ecd1e236395e1b95dc2f181a4be17543036065b7` | Verify ancestry and re-read its records. These are historical references. |
| G-register `plans/register-companions-20261019` | Worker mailed candidate `5ce8b1b0f9ba3d819c6dea113a38a973a91c0dbb` in `1019192537-7f98`; not a landing receipt | Lead supplies reviewed main and follow-up SHAs. Both must be ancestors of the frozen main. Reinspect any candidate-to-landed delta. |
| Local G-register preview | An unpushed, uncommitted merge is measured after the initial main measurements | Abort that merge before committing this plan. Never push the preview merge. |
| Opus xhigh and Astra max plan reviews | Lead-owned, pending | Two cycles at most. Remaining required decisions go to the lead. |
| Explicit authorization | Not received | Preserve the exact lead **GO Phase 2** mail and its id; `PENDING` is never executable authority. |

Any intervening Plans change or governed script/input change requires re-inventory on the actual GO-time main. Protected inputs include every locked path, every discovered currentness source, all receipt source hashes and required-but-unpinned PNC dependencies, admission manifests/scripts/schema pins, the currentness generator, readiness validators, and every script used by this reseal or landing check. The lookup-only `scripts/pm7-where.py` is excluded only while it remains outside those bindings. Preparation and rebuilds occur outside the landing lock.

## Inventory and Phase 1 measurements

The full tree is not sparse. Named ignored inputs were copied with `rsync -a --no-perms --no-owner --no-group`: the 15-file installed currentness edition; settings-tome and chat-56 audit directories; the usage-recovery, usage-successor and widget-followup `FINAL_REPORT.md` files; widget-followup `audit_report.json`; and the three named Event Authority 2026-08-12 support files. The resize audit is symlinked to its shared-checkout directory. `tests/agent_packet_restrictions` points at the shared checkout's resolved evidence target. No whole `.audits` copy was made.

Each long command is detached and has a log, stdout, stderr, command metadata and exit file. A task-owned `TMPDIR` is passed explicitly. Each edition's manifest is compared with all 15 baseline-bound shared input hashes before and after measurement. No validator output is used as a new baseline in Phase 1.

<!-- PHASE1_RESULTS_START -->
Main measurements and the G-register preview are pending. Final counts, findings, comparisons and SHA-256 references will replace this paragraph before **PLAN ready** is mailed.
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

**Live evidence:** the binding-mode manifest identifies exactly one `live_current` bundle, `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`. The initial bundle has 3,178 artifacts. Generate its shard reports, synchronize using the repository tool, then run the guarded `admit-companions.py` generator before the ordinary evidence refresh. The generator appends exactly seven path/hash/owner-note records using repository hashing and atomic JSON writing; it preserves existing records and every other field. Its expected count is the freshly synchronized artifact count plus seven, initially 3,185 if G-register retains the shard path set. The synchronization tool reconstructs the shard artifact list and would otherwise omit these companions; the admission step therefore follows synchronization. No historical bundle changes. Evidence and graph must validate with no graph edit.

**Currentness:** discover exactly seven new machine inputs with the unchanged selector. Generate two external seven-file editions in the established order; install each only into the local ignored preparation copy. Keep all eight frozen files and both quarantine/group artifacts byte-identical. The installed shared 15-file edition remains unchanged through the first checked main push. Status stays `UNKNOWN_OPEN`; `closed`, `complete_denominator_known`, `contract_depth_complete`, and `build_or_pnc019_authority` stay false.

**DL-188:** both the event-family registry and workspace-layout v2 payload pins match the current receipt at initial main. Recompute them with the canonical SHA-256 helper. The expected apply is a no-op, preserving the entire receipt byte-for-byte. Only those two source-hash slots are permitted by the prior bounded rule; every other source hash, field, historical result and timestamp must equal a fresh backup. Any new drift, checkpoint mismatch or change beyond that rule stops for lead adjudication. No certification harness runs.

**Readiness and run 002:** regenerate node readiness, generate buildability once, retain that first generation, and perform `refresh-batch-hashes` followed by `refresh-final-summary --seal-state preseal` on `DEFAULT_PLAN_MIGRATION_RUN`. Reconfirm that default from the live verifier. Regenerate final node readiness only after the final currentness edition. Prove the retained buildability report differs from its read-only canonical probe solely at its node-readiness input hash; otherwise stop. Validate the current pointer run independently, without refreshing it until the post-push snapshot.

### What stays reported

Inherited PRD references, audit-closure history, PM7 GUI fixture findings, raw-capture findings, historical PNC source staleness, unresolved Event denominator/depth, legacy fixture-root mismatch and readiness self-test failure remain reported. The buildability/node-readiness cycle residual is proven, not chased through repeated generation. Historical run 002 retains its document-count and inventory-set mismatches (72 historical versus 96 current documents). This reseal adds no native, handler, execution, certification, runtime, readiness, denominator or depth authority. Phase 1's measured residual table is the evidence; prior counts are not copied as new results.

## Fresh helper controls

The helper manifest binds the production copies under the fresh helper folder. Scratch tests copy them and their needed inputs into this task's evidence sandbox. Git object history is read through the original repository; no test invokes a Git mutation. All apply tests write only scratch copies. Production/shared manifests prove unchanged bytes afterward.

Required controls: scratch writer `check/write/check/restore`, restoring all 15 files; Phase 1 rejection of shared writer access; pin preview and no-op scratch apply; canonical prefix40/current39 admission checks; seven evidence additions and an idempotent repeat; seven Spec Lock additions with no unrelated field change; one appended decision and duplicate rejection; attestation preview and seven-registration scratch apply; and malformed/incomplete report rejection. Every apply helper rejects `PENDING`, including `attestation.py`. A synthetic README-only writer edition is never eligible for installation. Phase 2 retests the writer on its real backup/final editions.

## Phase 2 commands and order

Execution variables are assigned from fresh observations, not Phase 1 output filenames or the previous run's state:

```bash
RESEAL_EVIDENCE=/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019-2/phase2
RESEAL_NOTES=/mnt/Cursor/share/puppet-master/2026-10-19-reseal2
RESEAL_BUNDLE=Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29
RESEAL_CURRENTNESS=Plans/.audits/event-authority-2026-08-13-currentness
RESEAL_TMPDIR=/home/sittingmongoose/pm-scratch/governance-reseal-20261019-2-tmp
RESEAL_EXECUTION_REF=plans/governance-reseal2-20261019-execution
```

| Variable | Assignment point |
|---|---|
| `RESEAL_MAIN_BASE` | Full `origin/main` SHA after GO, fetch, and prerequisite ancestry checks; freeze in `phase2/state.json`. |
| `RESEAL_GO_MAIL_ID` | Exact preserved mail from `pm7-purge-lead` containing `GO Phase 2`, after reading its body and binding the approved plan. |
| `RESEAL_RUN002` | Live verifier's `DEFAULT_PLAN_MIGRATION_RUN`, not the current-run pointer. |
| `RESEAL_CURRENT_RUN` | GO-time pointer's `run_path`; save its `run_id` separately. |
| `RESEAL_RECEIPT_SHA` | SHA-256 of the fresh pre-apply receipt backup, proven equal to the live receipt. |
| `RESEAL_WRITER_CONFIG` / `_SHA` | Fresh old/final manifests and scratch destination; after the first push rebind to verified main and stat-derived acquisition time, then hash the exact new config. |
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

Also retain complete standalone Spec Lock, evidence and graph exports. No timeout flag is passed to `pm-plan-migration.py validate`; it has no `--write-report`. Reject missing output and rerun incomplete checks.

2. **Pins and first edition.** Run `admission-pins.py`, then `refresh-dl188-checkpoint-pins.py --apply --main-base "$RESEAL_MAIN_BASE" --go-mail-id "$RESEAL_GO_MAIL_ID" --expected-receipt-sha256 "$RESEAL_RECEIPT_SHA"`. Save `checkpoint-pin-verification.json` with actual main, GO, helper SHA, checkpoint and checkpoint-module SHA. Expected receipt bytes are unchanged. A drift requiring new adjudication stops before apply. Write a `pm.external_evidence_locations.v1` map with exactly one mapping from logical currentness root to the unchanged shared old edition. Set it only for:

```bash
PM_EVIDENCE_MAP="$RESEAL_EVIDENCE/evidence-map.json" python3 scripts/pm-event-authority-currentness.py generate --outdir "$RESEAL_EVIDENCE/currentness-edition-1"
```

Install exactly seven generated files locally, preserving eight frozen files and quarantine/group bytes; validate locally without a map. Assert counts 266/96/170 and exactly the seven added paths.

3. **Readiness and historical run.** Run index generate/validate. Restore non-node index JSON only after proving its sole difference is `generated_at_utc`; retain node readiness. Generate buildability once and keep its bytes. Then run:

```bash
python3 scripts/pm-implementation-readiness.py generate
python3 scripts/pm-plan-migration.py refresh-batch-hashes --run-dir "$RESEAL_RUN002"
python3 scripts/pm-plan-migration.py refresh-final-summary --run-dir "$RESEAL_RUN002" --seal-state preseal
python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_RUN002"
```

4. **Evidence and seven bindings.** Generate and check shard reports in the live bundle. Any shard body/path difference from the landed prerequisite stops. Synchronize, admit exactly seven, then refresh evidence:

```bash
python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard_report.json"
python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard-check-report.json"
python3 scripts/pm-governance-seal.py sync-plan-sharding-evidence --evidence "$RESEAL_BUNDLE/evidence.json" --report "$RESEAL_BUNDLE/shard_report.json"
python3 "$RESEAL_NOTES/admit-companions.py" --apply --main-base "$RESEAL_MAIN_BASE" --go-mail-id "$RESEAL_GO_MAIL_ID"
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

6. **Final edition and checks.** Generate final currentness externally with the same one-root map; install the seven files locally and validate without a map. Confirm all seven companion hashes in currentness, evidence and Spec Lock, plus live Spec Lock/evidence/receipt inventory hashes. Regenerate/validate final node readiness; keep first-generation buildability and prove the sole cycle residual. Retest scratch writer check/write/check/restore with real old/final manifests. Validate shards, index, lock, decisions, evidence, graph and currentness; run all five after measurements, compare complete findings and rerun incomplete subchecks. Use `attestation.py --apply` with actual GO, previous seal and frozen main; it requires all seven registrations and rejects `PENDING`. Write `reseal-record.md`, `attestation.json`, `checkpoint-pin-verification.json`, and `execution-evidence.json`, mode 100644. Execution evidence binds helper/config hashes, manifests, commands, TMPDIR, free space and residuals; `post_push_followup` is initially null. Commit only explicit changed governance/report paths and push the distinct execution ref to both configured destinations. Remove the local ignored currentness copy before landing, keeping its backup/final editions externally and the other provisioned inputs locally.

## The one auto-decisions row

Id: `dec-2026-10-19-governance-reseal-2`. Scope: `plans.governance.reseal_repository_wide`. Use `upsert_auto_decision`, which supplies timestamp and inputs hash. Rationale names Jared's 2026-10-19 assignment and registration approval, lead `pm7-purge-lead`, exact new GO mail id, previous seal, frozen main and intervening Plans history, seven product machine inputs, the DL-188 limit, refresh order, post-push currentness write, byte-identical custody and false authority flags. No row is written in Phase 1.

Applied paths are Spec Lock; the live evidence bundle and two reports; buildability; node readiness; and run 002's batch report/preseal summary. Add the receipt only if the bounded authorized apply actually changes it. Contract refs are the Spec Lock update policy, DL-039, DL-067, DL-188 and `pm.auto_decisions.schema.v1`.

## Landing, follow-up and cleanup

1. **Acquire immediately before landing fetch.** Atomically create `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`. On contention read its holder; clear only after 90 minutes, otherwise wait five minutes with bounded waits and retry. Immediately preserve the successful directory's `stat().st_mtime` as immutable acquisition epoch/UTC. Save it before writing the holder. The holder has exactly four `key: value` lines: agent `codex-reseal2`, branch `plans/governance-reseal2-20261019`, current milestone UTC, phase. Milestones do not extend the **absolute 90-minute cap**. Deadline-bound command sessions and recovery act only on processes started by this task.
2. **Bind old input identity.** Immediately copy/hash all 15 shared currentness files; compare file set and bytes with preparation backup and the then-current baseline. Compare the baseline itself with the preparation copy. Mismatch stops, releases the lock, and requires re-inventory outside it. Do not record a baseline to excuse it.
3. **Space and environment.** At acquisition and before every full under-lock check, assert that task `TMPDIR` exists and is writable, root free space is at least 6 GiB, and Python's selected temporary directory resolves to that path. Record actual byte count and `df -h /`. Failure releases the lock before main changes. Every command receives the explicit environment.

```bash
test -d "$RESEAL_TMPDIR" -a -w "$RESEAL_TMPDIR"
TMPDIR="$RESEAL_TMPDIR" python3 -c 'import os,shutil,tempfile; from pathlib import Path; assert shutil.disk_usage("/").free >= 6*2**30; assert Path(tempfile.gettempdir()).resolve() == Path(os.environ["TMPDIR"]).resolve()'
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

6. **Shared writer after verified push.** Recheck all 15 old hashes; rebind/hash the writer config to fresh old/final manifests, verified pushed SHA and stat-derived acquisition UTC. Run non-test `check` immediately before `write`; require `old_baseline_bound`. The writer checks holder identity, deadline, directory mtime and shared HEAD/origin/main. It copies only seven generated files in place, preserving eight frozen files and quarantine/group bytes. Partial failure restores the seven old files and verifies all 15; report the incomplete follow-up with the already-pushed main retained. Validate shared currentness and standalone readiness with no map; save outputs and the installed 15-file manifest. Reject incomplete validators.
7. **Snapshot before baseline, same full tree.** In this same provisioned full worktree, fetch and assert clean HEAD equals the first pushed main, with no local currentness directory. Allocate the next free execution-date snapshot id, read actual direct Markdown count and superseded pointer, then run `snapshot-current` followed by `--record-baseline`. Pass explicit task TMPDIR and shared readiness root. Bind all 15 installed hashes before/after. The recorder's stdout is text saved as `.out`; guard the actual baseline JSON and every retained JSON report/export, never that text stdout. Reject `validator_no_output`, timeouts and phantom audit-status/widget-support rows. Retry a timeout at 1200 seconds without committing an incomplete baseline.

```bash
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
9. **Report and release within cap.** Mail the lead both verified main SHAs, actual inventory and residual findings. Preserve the later final comparison in external completion evidence; do not create a commit/check recursion to insert its own verdict. Remove only this worker's ignored copies/symlinks, scratch, task temporary directory, T3 worktree through its owning clone, and landed local branch. Keep cited helper/evidence/report deliverables and every Concepts file. Release the lock after worktree/branch removal, within the same immutable cap. If a post-first-push step cannot complete, preserve the pushed main, restore only a partially written edition, release safely, and hand over the exact incomplete state.

**Export coverage:** compare both landing comparisons and the new baseline with the actual pre-landing baseline's keyed-from-export list, `compared_with_baseline_exports`, and `export_buckets` count. The initial observed count is 14; re-read it after G-register's landing. Any missing key or reduced bucket count triggers a complete rerun and row-level reconciliation showing findings cleared or became fully printed. An absent/unwritten/unreadable export is never an improvement. An unexplained reduction stops the relevant push or baseline commit. Bind both editions, lists/counts, reruns and reconciliation by SHA-256 in execution evidence.

## Risks and stop conditions

- A candidate preview is not a reviewed landing; GO-time main and G-register's follow-up may alter readiness, current-run and baseline inputs.
- New or unexplained inventory/path/count differences require re-inventory; the seven JSON files themselves must remain byte-identical.
- The evidence synchronization tool omits the companions without the explicit post-sync admission generator. All seven final bindings are asserted in lock, evidence and currentness.
- Any DL-188 pin drift requiring new adjudication, non-allowlisted receipt change, frozen-custody change, authority-flag increase, shard-body/path drift, historical evidence change or graph edit stops.
- Missing temporary space or `validator_no_output` is an infrastructure failure; it is never accepted as an inherited product finding or recorded baseline.
- Local currentness must be absent for the shared-input landing comparison and post-push recording. All other named ignored support inputs must be present.
- The first comparison uses the old baseline/edition. Only the already-pushed result is recorded afterward. No baseline refresh can make an unpushed landing pass.
- A deadline, partial push, shared overlap or changed protected input stops dependent actions and is reported to the lead with exact state and recovery evidence.

## Out of scope

Owner prose, seven JSON body edits, Concepts edits or pruning, sharding-config registration, schema-version changes, historical evidence, certification-harness execution, receipt changes beyond the DL-188 rule, hand-edited shard bodies, plan-graph edits, executable WorkNodes/NodeSeeds, and native/runtime/buildability/denominator/depth authority.
