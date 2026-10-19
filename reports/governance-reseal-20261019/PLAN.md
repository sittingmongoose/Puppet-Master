# Governance reseal plan — 2026-10-19

**Phase 1 draft; measurements in progress. No governance has been refreshed or landed.** The required pin check found a landed F6 payload amendment. Lead mail `1019051652-b067` explicitly authorizes continuing Phase 1 and adding a bounded DL-188 two-pin refresh to Phase 2. This draft is not the `PLAN ready` submission.

Branch: `plans/governance-reseal-20261019`. Agent: `codex-reseal`. Full T3 worktree: `/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-83513dc7`, owned by `/home/sittingmongoose/src/PuppetMaster`. Initial fetched main: `10b644d389845b28e2bdb3d39397f6eaf66c7b17`. Phase 2 uses the main frozen after the prerequisite landings and lead GO; it does not seal this initial snapshot by assumption.

## Authority and procedure

Jared assigned this reseal on 2026-10-19 ("You can reseal when you are ready to"). The lead `pm7-purge-lead` coordinates it and must mail **GO Phase 2** after both plan reviews and the F-plans landing. The task-specific [RESEAL brief](/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/briefs/RESEAL.md) authorizes this worker to land Phase 2; that specific instruction supersedes COMMON's general worker rule that the lead lands. No mail goes to the stopped `home-redesign-planner` thread.

Read `AGENTS.md`, `.claude/CLAUDE.md`, and the authoritative map `Plans/00-plans-index.md`. Follow the [previous plan](../governance-reseal-20261015/PLAN.md), [reseal record](../governance-reseal-20261015/reseal-record.md), [attestation](../governance-reseal-20261015/attestation.json), [baseline record](../governance-reseal-20261015/baseline-record.md), and [landing-check rules](../landing-checks/README.md). Prior executable helpers and transcripts are reference material only: `/mnt/Cursor/share/puppet-master/2026-10-16-reseal-phase2/` and `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261016/phase2/`.

Scope: existing Spec Lock hashes; the sole `live_current` evidence bundle; buildability/node-readiness projections; the lead-adjudicated DL-188 two-pin-only receipt refresh; exactly one new auto-decision row through `upsert_auto_decision`; `refresh-batch-hashes` then `refresh-final-summary --seal-state preseal` on aggregate-default run `pds-20260611-002-atomize-planunits`; and currentness written in place after the first checked main push. The ordinary snapshot/baseline follow-up then runs in this same provisioned worktree under the same landing lock.

No owner prose, certification harness, receipt field outside those two `source_hashes`, schema/registry registration, hand-edited shard body, or frozen-custody change is authorized. The lead's specific adjudication extends the brief's initial no-receipt-edit scope using the 2026-10-11 precedent; it does not authorize Phase 2. New helpers live under `/mnt/Cursor/share/puppet-master/2026-10-19-reseal/`. Raw evidence lives under `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/`.

## Required landings and decisions before GO

| Prerequisite | State at this checkpoint | Required evidence |
|---|---|---|
| F6 Plans top-up | Landed through `432fdd3a14`, follow-up `98c8b7ea61` | Re-read Plans history from the preceding seal to frozen main. |
| PM7 stream C Plans cleanup | Landed through `203ff50040`, follow-up `10b644d389` | Includes the current snapshot and baseline; not a governance reseal. |
| F-plans, branch `plans/pm7-purge-followups-20261019` | Pending lead's main SHA | Liquid Glass off-switch retirement; UCC-152/CS-074 counts; SSYS-035; touch-closure validator re-anchor. Confirm main ancestry. |
| DL-188 payload-pin drift | **Adjudicated for bounded Phase 2 refresh** | Stop mail `1019051623-f40e`; lead approval `1019051652-b067`. Dry-run now; apply only after GO against a fresh receipt-backup hash. |
| Opus xhigh and Astra max plan reviews | Pending complete Phase 1 submission | Lead runs both; respond in at most two cycles. |
| Explicit lead authorization | Not received | Read and preserve the exact `GO Phase 2` mail id. |

Concepts-only A/B landings may occur during or after this work. Inspect every intervening landing: any `Plans/` path requires re-inventory. Recompute on the frozen main after GO and release the landing lock if a source-changing rebase requires rebuilding.

## Previous seal and Plans landings since it

Previous frozen main: `3d37380471304a2b8c328256b89e748d0de86536`. Previous first checked push: `8552129defaa6cbbf50016438c8c05c6a1f763ba`. Its follow-up is `1b092d0b0e977b4b780aa0ee943965764f585df5`, with snapshot `pds-20261016-003-current-planunit-snapshot`. These identify history, not reusable inputs or this run's output counts.

`git log 8552129def..origin/main -- Plans/` confirms the F6/week-reconciliation stack and stream C. The initial pointer names `pds-20261019-001-current-planunit-snapshot`; reread it at execution and allocate the next free execution-date id only after the first push.

## Inventory

Provisioning physically copied the 15-file currentness edition, both small audit directories, the three `FINAL_REPORT.md` files, widget `audit_report.json`, and the three ignored Event Authority 2026-08-12 files using `rsync -a --no-perms --no-owner --no-group`. The resize audit is symlinked to the shared checkout; `tests/agent_packet_restrictions` points at the shared checkout's resolved evidence target. No whole `.audits` copy is made.

The pin check found the registry matches previous seal, receipt, and live bytes. The layout payload changed in F6 commit `f8d796ea7f`: it adds `layout_restored`, `cmd.workspace_layout.restore`, and their conditional mapping. Its live SHA-256 is `a611ee3d41f275e7dfd349021a3d41de866849f97f0108396bf0685c41431b1a`; the receipt and previous seal pin `5d486daf7af60d2e8e487a3102a1d4200fdbd66465839578d96640d1405b04f1`. The receipt remains unchanged.

Pin evidence: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/pnc-pin-check.json`, SHA-256 `e4fb0c71683e28b564a48159dad006b3cce8399162afa3ec037bb4f7c8a0e15d`.

The initial runner stopped before validators and asked the lead. After the adjudication, read-only measurements resumed on the same provisioned tree. Every long command is detached with stdout, stderr, command metadata, and an exit file. No baseline or currentness input is refreshed to obtain a measurement. Fresh helper tests pass: scratch `check/write/check/restore --test`, rejected live access from the Phase 1 config, receipt dry-run, decision preview, and attestation preview. The synthetic test edition changes only its scratch README and must never be installed.

`refresh-dl188-checkpoint-pins.py` imports `pm_pnc019_currentness.sha256_file`, the receipt validators' file-byte SHA-256 algorithm, to recompute the two receipt source pins. The dry-run finds only the payload pin changes; registry stays at its current pin. It validates the candidate receipt schema and proves all other receipt fields and source hashes equal. The receipt SHA-256 before/after dry-run is `574e33cf6e008a903a7ba06953cbabc64a605faebafe0ae91267a78d9ff1a316`. The helper never imports or executes the certification harness. F6 commit `f8d796ea7fd6256370df32f15e1cb34fb09eba66` is already on main through the reviewed F6 landing; its actual payload diff was inspected, not inferred from a commit subject. `/mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/RESEAL-REQUEST.md` records both Opus and Astra ending LAND and the landing/follow-up SHAs.

The **admission pins are a separate check**. Fresh `admission-pins.py` recomputes prefix40 using the emit-only validator's canonical JSON algorithm and current39 through the browser validator's `fingerprint`. Both match their live scripts/manifests; current39 also matches its schema const. Measured prefix40 is `237b757a8f78e70fc77d3332f27eb51f0c4f80f2f5fbc16d5ff6792a344c49f8`; current39 is `5ccb9d5d543fcb81e91db26ce432b89192fe96ed86ca6adf5515c9e5929383ed`. These are recomputed results, not copied expectations. Historical39/40 lineage and required reviewed successors pass. Output `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/admission-pins.out`, SHA-256 `e56c2415a9179e34874b2ad22b842183b40ff810cc2059359fe9ba41f800b1bf`. Phase 2 reruns the check before the receipt change; no admission script/manifest/schema pin is edited by this reseal.

## Phase 2 commands and order

Only execute after every prerequisite is satisfied and the lead's exact GO mail is preserved. Fetch/rebase onto the resulting main and recompute all hashes/counts. Preserve a record of the frozen main distinct from the plan branch HEAD.

```bash
RESEAL_EVIDENCE=/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase2
RESEAL_NOTES=/mnt/Cursor/share/puppet-master/2026-10-19-reseal
RESEAL_BUNDLE=Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29
RESEAL_RUN002=Plans/.plan_migration/pds-20260611-002-atomize-planunits
RESEAL_CURRENTNESS=Plans/.audits/event-authority-2026-08-13-currentness
```

Every long command below runs in a detached process with an external log, stdout/stderr files, command metadata, and exit file. Check `pm-mail --as codex-reseal inbox` before each step. Detach computation with `start_new_session=True` or `nohup`/`setsid`; **never put `pm-mail wait` behind `&`**. Stage only explicit paths and keep the common co-author trailer on commits.

1. **Provision, backup, measure, then pins.** Recopy the named ignored inputs physically. Back up Spec Lock, auto-decisions, node readiness, the certification receipt, the evidence tree, readiness directory, run 002, and all 15 shared currentness files. Save SHA-256 manifests. Run the same five before measurements as Phase 1, with `--subcheck-timeout-seconds 600` only on supported `pm-plans-verify.py` commands, never on `pm-plan-migration.py validate`. After GO, run the fresh DL-188 helper with `--apply --go-mail-id <actual-go> --expected-receipt-sha256 <fresh-backup-sha>`. Only its two allowlisted source hashes may differ from the backup. Verify every other field and historical result remains equal before generating currentness.
2. **First currentness edition.** Write `pm.external_evidence_locations.v1` mapping only logical currentness root to the shared old edition. Set `PM_EVIDENCE_MAP` only for `pm-event-authority-currentness.py generate --outdir <external-empty-edition-1>`. Copy the seven generated files into this worktree's ignored edition and validate there without a map. Preserve eight frozen files, the quarantine/group bytes, `UNKNOWN_OPEN`, and all four authority flags false.
3. **Readiness and run 002.** Run index generate/validate, retain node readiness, restore other index JSON only after proving their sole difference is `generated_at_utc`, generate buildability once, and retain its bytes. Run the historical refresh pair in order, with `--seal-state preseal`, then validate. Do not repair the historical document inventory.
4. **Evidence and graph.** Generate/check shards with `Plans/sharding_config.json` and reports in the live bundle; any changed shard body/path stops this reseal. Run `sync-plan-sharding-evidence`, then evidence refresh. Replace the three exact existing `commands_run` strings' stdout excerpts. Preserve historical `plan-shard-generate` text. Evidence and graph must validate without editing `Plans/plan_graph.json`.
5. **Decision and Spec Lock.** Call this run's guarded `decision-row.py --apply` exactly once, validate auto-decisions, refresh existing Spec Lock entries without registration/schema flags, then verify all lock hashes. Preserve every non-hash lock field.
6. **Final edition and node readiness.** Generate final currentness externally with the same one-root map; install locally and validate without a map. Confirm final inventory pins for Spec Lock, live evidence, and the bounded-refreshed receipt. Regenerate/validate node readiness; retain first-generation buildability. Prove its sole canonical difference is the node-readiness input hash, and report that cycle residual. Frozen custody is byte-identical; the receipt differs only at the two approved source-hash locations.
7. **Writer test.** Rebind the fresh in-place helper to Phase 2 backups/final manifest. On a scratch copy only: `check --test`, `write --test`, `check --test`, `restore --test`. Expected editions are old, final, final, old; all 15 bytes match the original backup afterward. Record helper/config/output hashes. Repeat even though Phase 1 tests the algorithm independently.
8. **Final checks and branch push.** Shards, index, Spec Lock, auto-decisions, evidence, graph, and currentness checks; run-gates, audit-governance, standalone readiness, run 002 and current-run validation. Compare complete before/after findings and rerun timed-out subchecks. Write reseal record, attestation, and execution evidence; commit only explicit changed governance/report paths, mode `100644`. Push the branch to both configured remotes. Remove this worktree's local currentness copy before landing; retain the other provisioned ignored inputs.

The literal command groups below implement those steps. Backup/copy/install operations verify the exact file sets and hashes described above. No `--write-report`, `--ledger-id`, `--seal-state postseal`, `register-canonical-docs`, `--register-file`, or `--schema-version` is part of this procedure.

### Before measurements and the bounded receipt change

```bash
python3 scripts/pm-plans-verify.py run-gates \
  --report "$RESEAL_EVIDENCE/before/run-gates.json" \
  --subcheck-timeout-seconds 600 --quiet-progress
python3 scripts/pm-plans-verify.py audit-governance \
  --report "$RESEAL_EVIDENCE/before/audit-governance.json" \
  --subcheck-timeout-seconds 600 --quiet-progress
python3 scripts/pm-plans-verify.py validate-implementation-readiness \
  --report "$RESEAL_EVIDENCE/before/readiness.json" --subcheck-timeout-seconds 600
python3 scripts/pm-plans-verify.py validate-plan-migration \
  --report "$RESEAL_EVIDENCE/before/migration-002.json" --subcheck-timeout-seconds 600
RESEAL_CURRENT_RUN=$(python3 -c 'import json; print(json.load(open("Plans/.plan_migration/current_run.json"))["run_path"])')
python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_CURRENT_RUN"
```

`validate-plan-migration` without `--run-dir` selects the aggregate default, run 002. `current_run.json` has `run_path`, not `run_dir`. Its current-run validator takes neither a timeout flag nor `--write-report`. Save both complete outputs and distinguish the two runs in every report.

After the fresh backup and GO, set `RESEAL_GO_MAIL_ID` from the preserved lead mail and `RESEAL_RECEIPT_SHA` from the actual backup bytes, then:

```bash
python3 "$RESEAL_NOTES/admission-pins.py"
python3 "$RESEAL_NOTES/refresh-dl188-checkpoint-pins.py" --apply \
  --go-mail-id "$RESEAL_GO_MAIL_ID" --expected-receipt-sha256 "$RESEAL_RECEIPT_SHA"
```

Compare the resulting receipt with that backup. Only `source_hashes["Plans/event_family_registry.json"]` and `source_hashes["Plans/event_payloads/workspace_layout_changed_v2.schema.json"]` are allowlisted; every other field, source hash, historical execution result, timestamp and authority claim must be equal. The registry pin is currently unchanged. Recompute both rather than copying the Phase 1 expected values. Do not run `pm-pnc019-certification-harness.py`.

### Currentness, projections, and historical run 002

The evidence map's only entry is `{logical_root: "Plans/.audits/event-authority-2026-08-13-currentness", physical_root: "/mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness"}` under schema `pm.external_evidence_locations.v1`, in a `mappings` array. Do not export `PM_EVIDENCE_MAP` across later validation commands.

```bash
PM_EVIDENCE_MAP="$RESEAL_EVIDENCE/evidence-map.json" \
  python3 scripts/pm-event-authority-currentness.py generate \
  --outdir "$RESEAL_EVIDENCE/currentness-edition-1"
# Install exactly the seven generated files into the local ignored edition, preserving the other eight.
python3 scripts/pm-event-authority-currentness.py validate
python3 scripts/pm-plan-index.py generate
python3 scripts/pm-plan-index.py validate
# Restore only non-node index JSON whose sole difference is generated_at_utc; save the comparison proof.
python3 scripts/pm-implementation-readiness.py generate
python3 scripts/pm-plan-migration.py refresh-batch-hashes --run-dir "$RESEAL_RUN002"
python3 scripts/pm-plan-migration.py refresh-final-summary --run-dir "$RESEAL_RUN002" --seal-state preseal
python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_RUN002"
```

Save first-generation buildability bytes. Run 002's historical `doc_count_mismatch` and `inventory_doc_set_mismatch` are reported, not repaired. A different after-state must be explained before proceeding.

### Live evidence and Spec Lock

```bash
python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json \
  --report "$RESEAL_BUNDLE/shard_report.json"
python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json \
  --report "$RESEAL_BUNDLE/shard-check-report.json"
python3 scripts/pm-governance-seal.py sync-plan-sharding-evidence \
  --evidence "$RESEAL_BUNDLE/evidence.json" --report "$RESEAL_BUNDLE/shard_report.json"
```

Read the live bundle's existing `commands_run` before refresh. They currently contain exactly these three `cmd` strings; keep their spelling, including omission of `--config`, and replace their stdout excerpts with this execution's actual outputs:

```text
python3 scripts/pm-plan-index.py validate
python3 scripts/pm-shard-plans.py --generate --report Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard_report.json
python3 scripts/pm-shard-plans.py --check --report Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard-check-report.json
```

```bash
python3 scripts/pm-governance-seal.py refresh \
  --evidence "$RESEAL_BUNDLE/evidence.json" \
  --plan-index-details '<actual frozen main, PlanUnit and acceptance counts; runtime blocked>' \
  --command-excerpt 'python3 scripts/pm-plan-index.py validate|||<actual saved stdout>' \
  --command-excerpt 'python3 scripts/pm-shard-plans.py --generate --report Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard_report.json|||<actual saved stdout>' \
  --command-excerpt 'python3 scripts/pm-shard-plans.py --check --report Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard-check-report.json|||<actual saved stdout>' \
  --check-detail 'governance-reseal-2026-10-19|||<actual GO, scope, bounded DL-188 change, UNKNOWN_OPEN and false authority flags>'
python3 scripts/pm-plans-verify.py validate-evidence
python3 scripts/pm-plans-verify.py validate-plan-graph
python3 "$RESEAL_NOTES/decision-row.py" --apply \
  --main-base "$RESEAL_MAIN_BASE" --go-mail-id "$RESEAL_GO_MAIL_ID"
python3 scripts/pm-plans-verify.py validate-auto-decisions
python3 scripts/pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json
python3 scripts/pm-plans-verify.py verify-spec-lock
```

Angle-bracket text is substituted from saved command output, passed as structured subprocess arguments rather than shell-interpolating transcript text. A changed shard body/path, substantive non-node index change, historical bundle change, new registration, graph edit, or duplicate decision row stops the reseal. Spec Lock's path set and non-hash fields stay identical.

### Final edition, writer retest, and final checks

```bash
PM_EVIDENCE_MAP="$RESEAL_EVIDENCE/evidence-map.json" \
  python3 scripts/pm-event-authority-currentness.py generate \
  --outdir "$RESEAL_EVIDENCE/currentness-edition-final"
# Install seven files locally; preserve all frozen and quarantine/group bytes.
python3 scripts/pm-event-authority-currentness.py validate
python3 scripts/pm-plan-index.py generate
python3 scripts/pm-plan-index.py validate
python3 "$RESEAL_NOTES/in-place-write.py" --config "$RESEAL_WRITER_CONFIG" \
  --expected-config-sha256 "$RESEAL_WRITER_CONFIG_SHA" check --test
python3 "$RESEAL_NOTES/in-place-write.py" --config "$RESEAL_WRITER_CONFIG" \
  --expected-config-sha256 "$RESEAL_WRITER_CONFIG_SHA" write --test
python3 "$RESEAL_NOTES/in-place-write.py" --config "$RESEAL_WRITER_CONFIG" \
  --expected-config-sha256 "$RESEAL_WRITER_CONFIG_SHA" check --test
python3 "$RESEAL_NOTES/in-place-write.py" --config "$RESEAL_WRITER_CONFIG" \
  --expected-config-sha256 "$RESEAL_WRITER_CONFIG_SHA" restore --test
```

The Phase 2 writer config is fresh and bound by its own SHA-256; it names this run's actual old 15-file backup, final seven-file edition and empty scratch-copy destination. Only after the first checked main push is it rebound to that verified SHA and actual lock-acquisition UTC. The Phase 1 test config always refuses access to the shared destination.

```bash
python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
python3 scripts/pm-plan-index.py validate
python3 scripts/pm-plans-verify.py verify-spec-lock
python3 scripts/pm-plans-verify.py validate-auto-decisions
python3 scripts/pm-plans-verify.py validate-evidence
python3 scripts/pm-plans-verify.py validate-plan-graph
python3 scripts/pm-event-authority-currentness.py validate
python3 scripts/pm-plans-verify.py run-gates \
  --report "$RESEAL_EVIDENCE/after/run-gates.json" --subcheck-timeout-seconds 600 --quiet-progress
python3 scripts/pm-plans-verify.py audit-governance \
  --report "$RESEAL_EVIDENCE/after/audit-governance.json" --subcheck-timeout-seconds 600 --quiet-progress
python3 scripts/pm-plans-verify.py validate-implementation-readiness \
  --report "$RESEAL_EVIDENCE/after/readiness.json" --subcheck-timeout-seconds 600
python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_RUN002"
python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_CURRENT_RUN"
python3 "$RESEAL_NOTES/attestation.py" --apply --go-mail-id "$RESEAL_GO_MAIL_ID" \
  --previous-seal 8552129defaa6cbbf50016438c8c05c6a1f763ba --main-base "$RESEAL_MAIN_BASE" \
  --output reports/governance-reseal-20261019/attestation.json
```

The reseal commit contains changed governance paths plus `reseal-record.md`, `attestation.json` (`pm.governance.reseal_attestation.v1`), and `execution-evidence.json` (`pm.governance.reseal.execution_evidence.v1`). The attestation history ends at the frozen main, not at a report/plan commit. Execution evidence records `main_base`, `go_mail_id`, the pin-adjudication id, helper/config hashes, every selected output hash, and a null `post_push_followup` until the follow-up. `baseline-record.md` belongs only to the follow-up commit. All records use mode `100644`.

## The one auto_decisions row

Decision id: `dec-2026-10-19-governance-reseal`. Scope: `plans.governance.reseal_repository_wide`. `upsert_auto_decision` supplies the timestamp and inputs hash. Rationale must name Jared's 2026-10-19 assignment, lead `pm7-purge-lead`, exact GO mail id, pin adjudication `1019051652-b067`, previous seal, frozen main, actual intervening Plans landings, the bounded two-pin change, and the scope and fail-closed limits. Do not append it during Phase 1.

Applied paths: Spec Lock; the live bundle's `evidence.json`, `shard_report.json`, and `shard-check-report.json`; buildability; node readiness; `Plans/.implementation_readiness/pnc019_certification_receipt.json`; run 002's `batch_report.jsonl` and `final_validation_summary.json`. Contract refs: `PolicyRule:Decision_Policy.md#spec-lock-update-protocol`, `ContractName:Plans/Decision_Log.md#DL-039`, `ContractName:Plans/Decision_Log.md#DL-067`, `ContractName:Plans/Decision_Log.md#DL-188`, `SchemaID:pm.auto_decisions.schema.v1`.

## Landing, follow-up, and cleanup

1. Take the landing lock immediately before the landing fetch, never during preparation/rebuild. Record agent `codex-reseal`, branch, acquisition UTC and phase. Update `holder.txt` at lock taken, edition verified, rebase done, first check saved, first push, currentness written, snapshot recorded, follow-up checked, cleanup. **90 minutes from acquisition is an absolute cap; milestone updates do not extend it.** On contention read the holder; only a lock older than 90 minutes can be cleared; otherwise wait five minutes and retry.
2. Immediately copy/hash all 15 shared currentness files at lock acquisition. Compare every hash and the path set against both preparation backup and the then-current baseline's `readiness_audit_inputs.files`. A mismatch stops; do not re-record a baseline to explain it.
3. Fetch/rebase and inspect all intervening Plans changes. Rebuild outside the lock if inputs changed. Shard-check locally. Push the branch. In shared checkout fetch and compare uncommitted paths against the exact branch diff; overlap stops the landing and requires handoff. Fast-forward only.
4. Keep the old edition unchanged through shared shard check and `pm-landing-check.py --base origin/main --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness --keep-check-reports <external-first-check-dir> --json`. Save the verdict and all exports. Exit 2/3 stops; exit 1 requires adjudicating its rows and rerunning timeouts before pushing. Any failed unpushed landing uses `git reset --keep origin/main`, never `--hard`. Push main to both destinations and verify their exact SHAs before currentness mutation.
5. Recheck all 15 old hashes. The new guarded writer requires this agent/branch lock, an unexpired acquisition time, and shared HEAD plus origin/main equal to the verified first push. Replace only seven generated files; on partial failure restore the seven old files, verify all 15, report the incomplete follow-up, and retain the already-pushed main. Validate currentness and standalone readiness from the shared checkout with no map; readiness has no audit-root option. Save both outputs and installed 15-file SHA-256 manifest.
6. In this **same provisioned full worktree**, fetch and assert clean HEAD equals the first pushed main and no local currentness directory exists. Run `snapshot-current` first with next-free execution-date id, actual direct Markdown count, and then-current superseded run id. Run `--record-baseline` against the installed shared edition second. Hash all 15 files before/after. Retry a timed-out recording at 1200 seconds and never commit a timed-out baseline. Reject phantom `stale_audit_status_index` buckets or widget-report `missing_ref` rows in plans-index from absent ignored inputs.
7. Follow-up commit includes new run, pointer/supersession changes, baseline, `baseline-record.md`, completed-landing section of `reseal-record.md`, and `post_push_followup` in execution evidence. Record actual totals, not the prior seal's counts. Push branch; shared fetch, overlap check, fast-forward, shard check, and a second saved landing check occur before second main push. Require empty `new`, `grown_buckets`, and `resolved_buckets`, plus unchanged 15-file installed hashes. Push and verify both main destinations.
8. Mail the lead both SHAs and residual findings. Remove ignored inputs/symlinks made here, this T3 worktree via its owning clone, and the landed local branch. Retain cited evidence/helper deliverables. Release the lock after worktree/branch cleanup. No other process, worktree, branch, or Concepts file is cleaned by this task.

## Risks and stop conditions

- The payload pin drift was explicitly adjudicated. Only the two-pin helper is permitted, after GO and against a fresh receipt backup; any other receipt difference stops the reseal. Historical certification results remain unchanged.
- F-plans is still pending; any additional Plans landing changes the inventory and invalidates cached counts/hashes.
- A different local currentness directory or changed shared bytes cause landing input-identity exit 3. Remove the local preparation copy; bind the actual shared edition.
- A fresh unprovisioned follow-up tree records phantom audit-input rows. Reuse this full worktree and reject those rows before committing.
- Readiness/buildability have a generation cycle; prove and report its residual rather than regenerating repeatedly.
- Historical run 002 structural findings and inherited runtime/certification/fixture/raw-capture findings stay reported. No baseline refresh makes an unpushed landing pass.
- If the two review cycles leave required scope decisions open, preserve them explicitly and wait for the lead; no third review round is invented here.

## Out of scope

Canonical owner prose, Concepts, registry/schema registrations, historical evidence bundles, certification harness or receipt changes beyond the two approved admission hashes, shard-body hand edits, executable WorkNodes/NodeSeeds, and native runtime/buildability/denominator/depth authority.
