# Governance reseal plan — 2026-10-19

**Phase 1 complete. No governance has been refreshed or landed.** The required pin check found a landed F6 payload amendment. Lead mail `1019051652-b067` explicitly authorizes continuing Phase 1 and adding a bounded DL-188 two-pin refresh to Phase 2. Phase 2 remains gated on both reviews, F-plans on main, and the lead's explicit **GO Phase 2** mail.

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
| F-plans, branch `plans/pm7-purge-followups-20261019` | Candidate `46256f42bd` approved by Astra r2 and Opus r1; landing and snapshot/baseline follow-up in progress per lead mail `1019064852-0674`. Main receipt pending. | Liquid Glass off-switch retirement; UCC-152/CS-074 counts; SSYS-035; Touch re-anchor and new `touch_closure_action_sources.json`. Confirm final main/follow-up ancestry. |
| DL-188 payload-pin drift | **Adjudicated for bounded Phase 2 refresh** | Stop mail `1019051623-f40e`; lead approval `1019051652-b067`. Dry-run now; apply only after GO against a fresh receipt-backup hash. |
| Opus xhigh and Astra max plan reviews | Astra r1 **OK**, 0 FIX / 1 LOW; LOW addressed below. Opus running per lead mail `1019064852-0674`. | The later mail supersedes `1019054804-d5fc`'s expected 10:09Z start. Respond in at most two cycles. |
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

All required measurements completed against initial main `10b644d389845b28e2bdb3d39397f6eaf66c7b17`; a fresh fetch before submission still names that main. The successful aggregate pair has no incomplete subcheck and exactly matches every baseline subcheck total. Both audit-status and plans-index support-reference checks pass, so no phantom missing-input row was recorded. Current snapshot and index validation pass; build/runtime readiness stays blocked.

All table paths are under `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/`:

| Output | Measured result | SHA-256 |
|---|---|---|
| `spec-lock.json` | 94 locked files; 20 stale hashes | `a9b0eaee27f02e182a484cf356b7029ac25618c55f7905345b62e9891dc1b901` |
| `evidence.json` | 1,730 stale artifact hashes; no missing artifact | `79d53b59eb8ee6b9ba423b65fb7d27f80e08a8ad05f8fbe84542b431694444fa` |
| `plan-graph.json` | Same 1,730 stale hashes | `4d85ccb1e41082cdc25ad18499a0c3c662da5895a77342a40013649add14b214` |
| `readiness.json` | 70 findings; buildability false | `417a0a988a2d0bc3f1759cd6c1947960b1e6bb01f9de598612b9e6702e14faca` |
| `migration-002.json` | 79 findings; 76 stale batch hashes, one stale unit count, two structural mismatches | `3030541ba7030f82555920ff1fecddc92d7b4591c4529085d48438bb33c4f3c3` |
| `migration-current.out` | PASS; zero findings; current run `pds-20261019-001-current-planunit-snapshot` | `fab700fd359c88333a165a241b3a6ca0881b92d0c0b1a31f377c4a19a79da842` |
| `plan-index-validate.out` | PASS; 7,157 PlanUnits; 28,506 acceptance units; runtime certification blocked | `f24420643dc99f1a5ae65e8a31473522ebcaaf1754365237f7ae3dfd0beb47d0` |
| `currentness-validate.out` | Only `all_live_sources_rehashed` fails; custody and fail-closed checks pass | `dee0f498000e3db9248d9ca1921cbe9d777916c9369d32d1131e36ae33533f70` |
| `json-syntax.json` | 17 inherited raw-capture findings | `217d8012cbd0132f817b4e319c2cbb848f3f10773cd99cbb1d33ec146a062a77` |
| `run-gates.json` | 5,090 findings; 27 pass / 9 fail; no timeout | `bf9cb68b59700d4a6f0a3fe5fd3284ce1244ace4f9957fa87fa4ce146dc8ef17` |
| `audit-governance-retry.json` | 5,073 findings; 25 pass / 8 fail; no infrastructure error | `db87e8ea03c177074fda81ef65b5b2402e646568ca0a6fac491e6eec9f56aef9` |

Completion witness: `phase1-completion.json`, SHA-256 `c17ca38ad10205df3a0bdbda1a9a288992d04401b2ff2ed0eded3d1d7f9b85f8`. Full raw-evidence manifest: `SHA256SUMS`, SHA-256 `6601c42c035647ff818ab8bb7dc57d5b4ce7d95cbed1e887f34ada04a33c5992`. The witness proves unchanged governed bytes, receipt, and all 15 local/shared currentness inputs; helper source snapshots are retained under `helpers-phase1/`. The initial attempts are preserved under `initial-attempt-archive/`, manifest SHA-256 `9a22ddcd9ea4708298dd54fdd1ae7cb7bd428d1f21522a3011ab0b5f8c9e9288`. That archive includes the quota failure and a standalone export's rejected timeout flag; the completed export uses the supported arguments.

`refresh-dl188-checkpoint-pins.py` imports `pm_pnc019_currentness.sha256_file`, the receipt validators' file-byte SHA-256 algorithm, to recompute the two receipt source pins. The dry-run finds only the payload pin changes; registry stays at its current pin. It validates the candidate receipt schema and proves all other receipt fields and source hashes equal. The receipt SHA-256 before/after dry-run is `574e33cf6e008a903a7ba06953cbabc64a605faebafe0ae91267a78d9ff1a316`. The helper never imports or executes the certification harness. F6 commit `f8d796ea7fd6256370df32f15e1cb34fb09eba66` is already on main through the reviewed F6 landing; its actual payload diff was inspected, not inferred from a commit subject. `/mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/RESEAL-REQUEST.md` records both Opus and Astra ending LAND and the landing/follow-up SHAs.

The **admission pins are a separate check**. Fresh `admission-pins.py` recomputes prefix40 using the emit-only validator's canonical JSON algorithm and current39 through the browser validator's `fingerprint`. Both match their live scripts/manifests; current39 also matches its schema const. Measured prefix40 is `237b757a8f78e70fc77d3332f27eb51f0c4f80f2f5fbc16d5ff6792a344c49f8`; current39 is `5ccb9d5d543fcb81e91db26ce432b89192fe96ed86ca6adf5515c9e5929383ed`. These are recomputed results, not copied expectations. Historical39/40 lineage and required reviewed successors pass. Output `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/admission-pins.out`, SHA-256 `e56c2415a9179e34874b2ad22b842183b40ff810cc2059359fe9ba41f800b1bf`. Phase 2 reruns the check before the receipt change; no admission script/manifest/schema pin is edited by this reseal.

### What a reseal refreshes

**Spec Lock:** 20 of 94 existing entries differ from live bytes. Refresh every existing entry without adding registrations. The stale set is:

```text
Plans/00-plans-index.md
Plans/Automated_Testing_System.md
Plans/Contracts_V0.md
Plans/Crosswalk.md
Plans/DRY_Rules.md
Plans/Glossary.md
Plans/Goal_Runtime_System.md
Plans/sharding_config.json
Plans/UI_Command_Catalog.md
Plans/Planning_Wizard.md
Plans/FinalGUISpec.md
Plans/assistant-chat-design.md
Plans/Wiring_Matrix.md
scripts/pm-implementation-readiness.py
Plans/storage_value_registry.json
Plans/usage-feature.md
Plans/Widget_System.md
Plans/storage-plan.md
Plans/Commands_System.md
Plans/UI_Wiring_Rules.md
```

**Live evidence and graph:** binding modes contain 21 immutable `historical_snapshot` bundles and exactly one `live_current` bundle, `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`. Its 3,164 artifacts contain 1,730 stale hashes; every named artifact exists. Refresh reports/artifact bindings through repository generators and seal tools. Graph validation follows the refreshed bundle; there is no graph edit. Do not carry forward the previous run's obsolete-shard findings or counts.

**Currentness:** the installed edition inventories 258 sources, including 96 direct Markdown documents and 162 registered machine inputs. Forty-three source hashes are stale at the initial main. Its status remains `UNKNOWN_OPEN`; `closed`, `complete_denominator_known`, `contract_depth_complete`, and `build_or_pnc019_authority` are false. All 15 input hashes match the current baseline. The frozen 252-row input SHA-256 is `d59142bc9ceef3f8c2d2257b7a6fbe9307ddae236720a0ac5a8c62afc7c5f541`, measured in this run's backup. Stop on frozen-custody drift. Discover additions/removals with the existing generator, record its final inventory delta, and preserve all eight frozen files and the quarantine/group artifacts byte-for-byte.

**F-plans source addition:** candidate `46256f42bdd189aec2fd284e5beac4a354037648` adds `Plans/touch_closure_action_sources.json`, registered by the live index. The unchanged currentness selector discovers exactly this one additional machine input: expected post-F-plans counts are **259 total / 96 direct Markdown / 163 machine inputs**. The canonical `build_occurrences` function yields **zero event-like rows** for that new file. Until the new edition is installed, `exact_live_source_set` will be false against the old 258-source shared edition; the 15-file identity binding still stays unchanged through the first checked main push. Preparation includes the new source via the existing generator, with no new seal registration. Reconfirm the count/delta on the actual landed main at GO. These candidate expectations do not replace the original Phase 1 measurements above. Read-only proof: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/revisions/fplans-prerequisite/source-discovery.json`, SHA-256 `23f43c59a4718a3a4e447470ae1cbb171b376143bf1fc6c6b3fcc04238012987`.

**Readiness and run 002:** standalone readiness reports 70 findings: 43 currentness source drifts, 16 historical `pnc019_source_hash_stale`, four stale Spec Lock dependencies (two storage registry, one EventRecord, one non-executable closure), and seven other inherited blocker rows. Regenerate node readiness and one buildability generation in the specified order. Run 002 has 79 findings: 76 stale batch hashes, one stale final-summary live-unit count, and its two historical document-inventory mismatches (72 versus 96 documents). Refresh only batch hashes and the preseal final summary. The current pointer run is validated separately and left untouched until the post-push follow-up.

Seven companions remain outside Spec Lock, live evidence and installed currentness. Report them as an open owner-registration question; this reseal admits none:

```text
Plans/appearance_quick_sets.json
Plans/appearance_quick_sets.schema.json
Plans/editor_appearance.schema.json
Plans/glyph_catalog.json
Plans/pm7_canon.fixtures.json
Plans/pm7_control_bindings.schema.json
Plans/wallpaper_catalog.json
```

The complete changed-owner/companion set since the preceding seal has 48 authored Plans paths, and the light inventory lists every stale lock entry, live artifact path, and currentness source path. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/light-inventory.json`, SHA-256 `4bfa856b3169baf35eaca4f24bdccad3c0db17ee0c5b4158c66422450ceceee8`. Run-gates reports 5,090 findings, with every subcheck complete and all failure totals equal to the current baseline; evidence `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/run-gates-baseline-comparison.json`, SHA-256 `f016a847aabd6ef1a9a7619aaa79b805ba436d7693b36557d97584a787688478`. The standalone reports retain complete hash-level findings instead of the aggregate samples.

The full hash inventory records stored/live SHA-256 pairs for all 94 lock entries, all 3,164 live evidence artifacts, all 258 inventoried currentness sources, and buildability/receipt source pins: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/governance-hash-inventory.json`, SHA-256 `421458dac46e69b2dc6763cb273ffb6943a3c87136b84d621d431b015f106cd4`. Current argument-parser evidence: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/help.txt`, SHA-256 `d8f0f28264d3422df2b23a639b98cb781e3fd3a6750a49e9c94a9c8a63be2fcd`.

### What stays reported

The reseal does not repair owner prose, historical certification/execution, audit-closure history, fixtures or raw captures. The initial main's inherited findings are:

| Kind | Count | Source |
|---|---:|---|
| `unresolved_local_ref` | 1,240 | PRD planning/runtime contracts |
| `audit_closure_validator_error` | 201 reported | Audit closure; no complete export, sampled beyond the report cap |
| `pnc019_source_hash_stale` | 16 | Historical certification dependencies outside the two-pin scope |
| PM7 GUI fixture findings | 3 | One each: forbidden compaction family, missing valid command fixtures, missing invalid command fixtures |
| `event_denominator_unresolved` | 2 | Readiness |
| `event_family_contract_depth_unresolved` | 2 | Readiness |
| `event_legacy_fixture_root_mismatch` | 1 | Readiness |
| `implementation_readiness_self_tests_failed` | 1 | Readiness |
| `buildability_gate_report_stale_or_not_canonical` | 1 | Expected generation-cycle residual, proven at execution |
| `doc_count_mismatch` | 1 | Historical run 002, 72 versus 96 |
| `inventory_doc_set_mismatch` | 1 | Historical run 002 |

Raw-capture JSON findings are 16 `raw_capture_manifest_entry_not_in_verifier_file_set` and one `raw_capture_mode_census_mismatch`. No raw evidence, manifest or verifier list is repaired here. The readiness residual is expected to remain 23 rows (16 source pins plus the seven other blockers) after 43 currentness and four Spec Lock rows clear. On these initial inputs, removing only the inventoried refreshable rows projects run-gates 1,486 and audit-governance 1,469. These are projections, not an after-state or a substitute for Phase 2 measurements.

The first audit-governance attempt contained `validator_no_output` on readiness because `/tmp`'s per-user quota rejected its report write (`OSError: [Errno 122] Disk quota exceeded`). Its apparent aggregate total is not a usable inventory. Standalone readiness completed with 70 real rows. A full aggregate retry uses task-owned local temporary space at `/home/sittingmongoose/pm-scratch/governance-reseal-20261019-tmp`; preserve the failed attempt and successful retry separately. This infrastructure failure is not a product improvement or a new canon finding. Phase 2 uses task-owned temporary space from the outset and records that environment.

### Fresh helper custody

Fresh helpers are external files under `/mnt/Cursor/share/puppet-master/2026-10-19-reseal/`; no earlier dated helper is executed. Current `HELPERS.SHA256SUMS` SHA-256 `815f88ee65557a8c781cc96fc2f117fdca4c03b3315712285d21d0111d751100` binds the delivered set after Astra's requested attestation-note revision. The original eight helpers and original manifest remain immutable under `phase1/helpers-phase1/`. Phase 1 required tests are in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/phase1/helper-tests.json`, SHA-256 `d985480b9f03aa437ad7d935220e19e94d8b7d2c9132d4cd40fbe23af4a97d51`. The four writer commands returned 0, and the original 15-file scratch manifest was restored. A separate negative check returned the expected rejection for attempted shared access with the Phase 1 config. Receipt, decision and attestation helpers ran only in dry-run/preview mode. `admission-pins.out` is the additional canonical-JSON admission check above.

| Helper | SHA-256 |
|---|---|
| `in-place-write.py` | `d204642cd8499ab007febaf6cfb259eb7e2129ef3a92eec7622e667423f2d4c1` |
| `decision-row.py` | `2786a3d3b674b950c3ea9fda7d7fb853639c33de02e448435917fd124d49848f` |
| `attestation.py` | `62f1b5585cdfe255fde31c07525d89a5ef04f5890eab6da1f35aaf3bc41d5fff` |
| `refresh-dl188-checkpoint-pins.py` | `ef2e3924007f8f111975ea828fb329b695cc56781f6fe5ea1b0aec50c6b48043` |

The writer's Phase 1 candidate is deliberately synthetic: it copies the seven old generated files and changes only the scratch README to exercise replacement. It is neither a generated currentness edition nor eligible for shared installation. Phase 2 repeats the four tests against fresh real backup/final manifests before its branch push.

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
3. Fetch/rebase and inspect all intervening Plans changes. Rebuild outside the lock if inputs changed. Shard-check locally. The prescribed rebase can change the already-published Phase 1 commit ids. Preserve that review ref and publish the rebased execution at fresh remote ref `plans/governance-reseal-20261019-execution`; subsequent pushes to that ref are fast-forwards. The local branch and lock holder remain `plans/governance-reseal-20261019`. No published ref is force-updated. In shared checkout fetch the execution ref and compare uncommitted paths against its exact diff; overlap stops the landing and requires handoff. Fast-forward only.
4. Keep the old edition unchanged through shared shard check and `pm-landing-check.py --base origin/main --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness --keep-check-reports <external-first-check-dir> --json`. Save the verdict and all exports. Exit 2/3 stops; exit 1 requires adjudicating its rows and rerunning timeouts before pushing. Any failed unpushed landing uses `git reset --keep origin/main`, never `--hard`. Push main to both destinations and verify their exact SHAs before currentness mutation.
5. Recheck all 15 old hashes. The new guarded writer requires this agent/branch lock, an unexpired acquisition time, and shared HEAD plus origin/main equal to the verified first push. Replace only seven generated files; on partial failure restore the seven old files, verify all 15, report the incomplete follow-up, and retain the already-pushed main. Validate currentness and standalone readiness from the shared checkout with no map; readiness has no audit-root option. Save both outputs and installed 15-file SHA-256 manifest.
6. In this **same provisioned full worktree**, fetch and assert clean HEAD equals the first pushed main and no local currentness directory exists. Run `snapshot-current` first with next-free execution-date id, actual direct Markdown count, and then-current superseded run id. Run `--record-baseline` against the installed shared edition second. Hash all 15 files before/after. Retry a timed-out recording at 1200 seconds and never commit a timed-out baseline. Reject phantom `stale_audit_status_index` buckets or widget-report `missing_ref` rows in plans-index from absent ignored inputs.
7. Follow-up commit includes new run, pointer/supersession changes, baseline, `baseline-record.md`, completed-landing section of `reseal-record.md`, and `post_push_followup` in execution evidence. Record actual totals, not the prior seal's counts. Push branch; shared fetch, overlap check, fast-forward, shard check, and a second saved landing check occur before second main push. Require empty `new`, `grown_buckets`, and `resolved_buckets`, plus unchanged 15-file installed hashes. Push and verify both main destinations.
8. Mail the lead both SHAs and residual findings. Remove ignored inputs/symlinks made here, this T3 worktree via its owning clone, and the landed local branch. Retain cited evidence/helper deliverables. Release the lock after worktree/branch cleanup. No other process, worktree, branch, or Concepts file is cleaned by this task.

The first and second comparison commands run in `/mnt/Cursor/PuppetMaster`, before their respective main pushes. Preserve their JSON plus complete retained reports/exports:

```bash
python3 scripts/pm-landing-check.py --base origin/main \
  --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
  --keep-check-reports "$RESEAL_EVIDENCE/landing/first-check-reports" --json \
  > "$RESEAL_EVIDENCE/landing/landing-check.json"
# First checked main push and exact remote-SHA verification precede the guarded shared write.
python3 scripts/pm-event-authority-currentness.py validate \
  > "$RESEAL_EVIDENCE/landing/currentness-shared.out"
python3 scripts/pm-implementation-readiness.py validate \
  > "$RESEAL_EVIDENCE/landing/shared-readiness-after-currentness.json"
```

In this same provisioned full T3 worktree, at the verified first pushed main with no local currentness directory, use the actual next-free id and pointer read at execution:

```bash
python3 scripts/pm-plan-migration.py snapshot-current \
  --run-id "$RESEAL_NEXT_RUN_ID" --expected-doc-count "$RESEAL_DIRECT_MD_COUNT" \
  --supersedes-run-id "$RESEAL_SUPERSEDED_RUN_ID"
python3 scripts/pm-landing-check.py --record-baseline \
  --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
  --keep-check-reports "$RESEAL_EVIDENCE/landing/baseline-check-reports" --json \
  > "$RESEAL_EVIDENCE/landing/record-baseline.json"
```

After the explicit-path follow-up commit, branch push, shared fetch, overlap check, fast-forward and shard check, run in the shared checkout:

```bash
python3 scripts/pm-landing-check.py --base origin/main \
  --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
  --keep-check-reports "$RESEAL_EVIDENCE/landing/followup-check-reports" --json \
  > "$RESEAL_EVIDENCE/landing/followup-landing-check.json"
```

Hash all 15 installed inputs before/after baseline recording and after the final comparison. Require stable bytes and empty `new`, `grown_buckets` and `resolved_buckets` before the second push. A timeout is rerun with `--subcheck-timeout-seconds 1200`; an incomplete recording is never committed. Save installed hashes to `phase2/landing/currentness-installed.SHA256SUMS`. The follow-up's `post_push_followup` and completed-landing section bind the first verdict, shared validation, installed manifest and recording by path and SHA-256. The later final comparison is preserved externally and bound in the final share completion receipt. Do not create a recursive commit-and-recheck loop solely to insert a commit's own later check.

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

## Review cycle 1

Astra review `/mnt/Cursor/share/puppet-master/2026-10-18-pm7-purge/reviews/RESEAL-astra-r1.md`, SHA-256 `9a463011cdc7e6152ab05b1a269478d8503f85cf0504ee673c212e99a4e104f2`, is **OK**, with no FIX and one LOW. Lead mail `1019054804-d5fc` requests addressing LOW 1 before the later Opus review; it is not a GO.

LOW 1 is addressed in `attestation.py`: a changed PNC-019 receipt row now explains the bounded DL-188 source-pin refresh, adjudication `1019051652-b067`, preserved historical certification fields and all other receipt fields/source hashes, and no certification-harness execution. Only this explanatory note changed. The helper compiles and its read-only preview passes against the same measured main, with unchanged receipt bytes. Current helper and manifest hashes above are updated; the original Phase 1 helper snapshot and evidence manifest remain unchanged.

Revision proof: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261019/revisions/astra-r1/verification.json`, SHA-256 `b85309f8a4f379d9a1c5739e2ddea5099cd4e6bb37f2ef91d764784ec8f00e2b`; revision `SHA256SUMS` in that directory, SHA-256 `dbd5d3cae30c6d704afe5f590a36197c13126caf869621ff238f39c5bc836fbc`.

Lead mail `1019064852-0674` reports the F-plans candidate approved and landing, and this plan's Opus review running. Its source-discovery LOW is incorporated in the inventory above: expect 259/163, verify the new file's zero occurrence rows, and keep the old edition through the first push. Landing/follow-up receipts and the reseal's Opus verdict remain required before GO. No Phase 2 step has run.
