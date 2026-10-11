# Combined governance reseal — 2026-10-11

This repository-wide reseal attests frozen main **`0fd763294610e8e30cc52a62b738c5034c8a9150`**. The previous actual seal is `cf7fdffe84`, not its preparation base `806941ca04`. Jared assigned `codex-combined-reseal` on 2026-10-11 through the scheduler relay. Coordinator `home-redesign-planner` authorized Phase 2 in mailbox **`1011173122-7808`**, after verifying the six prerequisite landing groups in [PLAN.md](PLAN.md). The approved plan's bytes are unchanged from `55fbfdf80c` after rebasing onto the authorized main.

The preparation base includes the home canon waves `511c288368` and `86d0fe8b3f`, panels/terminal publish `62f37f65df`, Glass carry Option A `51c316e18b`, Usage D43 `28de206b9b`, readiness adoption/fix `251c586e5c`/`e428bb3b31`, rail answers `2c35101f93` with follow-up `516a7c96a2`, and hpt's small canon round `bf939041db` with follow-up `394aadfe46`. The range from that last follow-up to the authorized base changes only onboarding harness tools and their result report; it changes no Plans or repository instructions. Both reseal requests and the actual owner amendments were verified in Phase 1; the unchanged final source bytes were checked again in Phase 2.

The procedure follows [the previous reseal record](../governance-reseal-20261009/reseal-record.md), with two explicit coordinator approvals: the bounded DL-188 receipt-pin refresh (`1011054952-0e8a`) and the currentness custody sequence required by the new landing checker (`1011123744-3ebf`, confirmed by the checker owner). GO confirms both. The landing lock was acquired before fetching/rebasing and remains held through both pushes, the currentness write, the snapshot/baseline follow-up and cleanup.

## Scope and migration runs

The ten changed governance paths are the existing Spec Lock, the three files in the sole live-current evidence bundle, buildability and node-readiness reports, the PNC-019 receipt, run 002's batch report/final summary, and one auto-decision row. No canonical owner prose, registry, schema, validator, Concepts file, historical evidence bundle, shard or PlanUnit/acceptance index body changed.

The refresh pair targets **`pds-20260611-002-atomize-planunits`**, which remains `pm-plans-verify.py`'s `DEFAULT_PLAN_MIGRATION_RUN`. It ran `refresh-batch-hashes`, then `refresh-final-summary --seal-state preseal`. It does not replace the separate current pointer, which names **`pds-20261011-003-current-planunit-snapshot`** at preparation. That current run validates with zero findings before and after; the two reports are byte-identical. The normal landing follow-up allocates the next free current snapshot after the first main push.

## Backups and external evidence

Before any overwrite, `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261011/phase2/backup/` received Spec Lock, auto-decisions, node readiness and the original PNC-019 receipt; tar archives of all evidence, implementation readiness and run 002; and all 15 files of the shared ignored currentness edition. The existing baseline's 15-file binding was checked against the shared bytes before copying them. Backup manifest SHA-256: **`e9a07fa08407d5ca59bd5e85b76ba117c6683ec4a2361d757a5730922e583c80`**. The old edition's manifest SHA-256 is **`2db35237c0166f0420875928062963d2c88862628fa713c679926afdfabbab20`**.

All commands, stdout/stderr, exit codes, helpers and currentness editions are external, under that `phase2/` directory. `preparation.SHA256SUMS` binds the completed preparation outputs and helpers; its hash and selected output hashes are recorded in [execution-evidence.json](execution-evidence.json). Mutable progress files and later landing outputs are excluded from that preparation manifest. Landing results and their hashes belong in [baseline-record.md](baseline-record.md), committed in the separate follow-up.

The full local T3 worktree received only the ignored inputs named by the previous record: the currentness edition, two small audit directories, three large audits' final reports and the widget audit report, the three ignored August 12 Event Authority files, and the two approved audit/raw-capture links. Those temporary copies and links are removed at cleanup. Raw evidence is not committed.

## What was recomputed

1. **Before checks.** Full aggregate gates, readiness, run 002 and the pointer-named current run were measured before mutation. Every subcheck completed; the gate timeout was explicitly 600 seconds.
2. **DL-188 checkpoint pins.** The guarded, previously tested helper ran once with the actual GO ID and fresh receipt-backup hash. It inserted only the live registry and workspace-layout v2 payload hashes into `source_hashes`. Every other receipt field and source hash is unchanged, and its schema validates. [checkpoint-pin-verification.json](checkpoint-pin-verification.json) records the exact delta, live 43-family checkpoint and helper hash. The certification harness was not run.
3. **First currentness.** The edition was generated into a fresh external directory through an inline evidence-location map, copied into the local ignored edition only, then validated without the map: evidence valid, all 14 checks true, authority closed false.
4. **Readiness projections.** Plan-index generation and validation precede buildability generation. Non-node JSON changes were restored only after recursively proving they differed solely in `generated_at_utc`; PlanUnit and acceptance bodies remained unchanged. The first buildability generation was saved and retained through the final cycle. The index has **7,095 PlanUnits and 28,335 acceptance units**, coverage pass, node readiness `blocked_runtime_certification_incomplete`, runtime disabled.
5. **Run 002 pair.** Refreshing 108 stale batch hashes and the stale live-unit count reduces its findings from 111 to the two inherited structural findings: `doc_count_mismatch` (72 versus 96) and `inventory_doc_set_mismatch`. No historical document set was repaired, and no postseal claim was made.
6. **Live evidence.** The only `live_current` bundle remains `pm7-usage-recovery-plan-sharding-2026-08-29`. Generate/check reports now describe **99 sources and 2,855 shards**, with zero reconstruction mismatches. Every shard body/path is unchanged by regeneration. Synchronization expands the artifact inventory from **3,097 to 3,155** and removes the two obsolete last-shard references. Refresh updates the existing three command excerpts in place with actual counts, and adds `governance-reseal-2026-10-11`. The historical `plan-shard-generate` text stays unchanged. Evidence and graph validation pass; `Plans/plan_graph.json` remains byte-identical.
7. **One decision row, then lock.** `upsert_auto_decision` appended **`dec-2026-10-11-combined-governance-reseal`** before lock refresh; every historical row is byte-identical. Its pre-refresh inputs hash covers the nine governed artifacts. Its rationale names the frozen main, prerequisite receipts, onboarding `look_choice`, wave 2 units, DL-188 bounded pins, frozen custody, run 002 pair and approved landing sequence. Spec Lock rehashes all **94 existing entries** and updates **23**. Registrations, schema versions and every non-hash field are unchanged. Auto-decision and Spec Lock validation pass.
8. **Final currentness, then final node readiness.** A new external edition pins final Spec Lock, live evidence and the modified receipt. All 14 checks pass before and after final node generation. Timestamp-only index differences were again proven and restored. The first buildability bytes remain equal to their Spec Lock pin.
9. **Final checks.** Full aggregate gates, both migration runs, readiness, shard check, index, Spec Lock, auto-decisions, evidence, graph and currentness validation completed. The compact table below reports the inherited failing gates instead of claiming aggregate success.

The obsolete references were `settings_inventory/108-lines-21401-21412.md` and `storage_value_registry/569-lines-113601-113646.md`. The corresponding current generated chunks end at line 21600 and 113800, respectively; later canon also extends the inventories to final chunks **`settings_inventory/113-lines-22401-22532.md`** and **`storage_value_registry/577-lines-115201-115345.md`**. These paths come from generated reports and synchronization, with no hand substitution.

Hpt's landed onboarding storage field is optional `look_choice` on the existing `pm.product_onboarding.session.v2` materialization, referencing the existing five nullable choice fields including `nier_mode`, `nier_parts` and `nier_background`. Version 2.0.0 and the absence/null behavior remain the owner's canon. This reseal only pins those landed bytes. The separate emit/testing/GitHub 40-row and browser 39-row admission pins remain unchanged; their scoped validators pass in the before and after aggregates.

## Attestation and currentness

[attestation.json](attestation.json) lists the **23 registered files** changed since `cf7fdffe84`: 18 Plans documents, storage registry, two scripts, buildability and the bounded receipt refresh. It records previous/live hashes and the 249 distinct intervening commits that touched those registered paths. The two artifacts modified by this reseal have explicit regeneration notes; history ends at the frozen main base, rather than the branch's plan commits.

The final seven-file edition manifest SHA-256 is **`78c3e7870c0411a18c0618a675f5a2c4f22f562e10a460c143e10a9df393b6b1`**. The inventory covers **255 sources: 96 direct Plans Markdown and 159 registered machine inputs**. Its discovery census contains **3,773 tokens, 11,339 occurrences, minimum owner queue 87, 13 contested tokens and 296 ambiguous tokens**. These are discovery counts, not adjudications.

Currentness stays **`UNKNOWN_OPEN`**, with `closed`, `complete_denominator_known`, `contract_depth_complete` and `build_or_pnc019_authority` all false. The approved checkpoint is **`2026-10-09.1`, 43 families**, including `workspace.layout_changed` family revision 2.0.0. Live registry SHA-256: `4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe`; payload SHA-256: `5d486daf7af60d2e8e487a3102a1d4200fdbd66465839578d96640d1405b04f1`.

All eight frozen files are unchanged. `EXPECTED_252_EVENT_TYPES.tsv` retains `d59142bc9ceef3f8c2d2257b7a6fbe9307ddae236720a0ac5a8c62afc7c5f541`. The 252-row quarantine ledger (`e77c83e1861c4b02739d7609c7c4fe066a6fe4f901a8e61511c698e0bb949294`) and group manifest (`fc212fc26784ba0dec1094705b811663fb7a92f38289af0d20503a7f0247af5e`) are byte-identical to backup. No denominator/depth authority, registration advance, runtime enablement or certification is inferred.

## Gates in the preparation worktree

| Check | Before | After |
|---|---:|---:|
| Spec Lock | 21 | 0 |
| Evidence | 1,887 | 0 |
| Plan graph | 1,887 | 0 |
| Migration run 002 | 111 | 2 |
| Implementation readiness | 74 | 23 |
| Audit closure | 201 | 201 |
| PM7 GUI fixtures | 3 | 3 |
| PRD planning runtime contracts | 1,240 | 1,240 |
| Raw-capture JSON syntax | 17 | 17 |
| **Aggregate total** | **5,441; 27 pass / 9 fail** | **1,486; 30 pass / 6 fail** |
| Current migration snapshot | 0 | 0; byte-identical |

Before readiness includes 45 source-drift rows, one registry-drift row, 17 historical receipt-source rows and four stale lock rows. After readiness retains **16 historical `pnc019_source_hash_stale`**, two denominator, two depth, one legacy fixture root, one inherited self-test failure and one buildability-cycle row. Every currentness source/registry/artifact finding clears locally. The 16 remaining receipt hashes are historical certification dependencies; refreshing two checkpoint pins does not recertify them.

The local gate inputs differ from the shared baseline's ignored-input context. That baseline has two additional inherited support-reference/audit-status rows; the first landing check measures the shared checkout against its own recorded baseline, rather than comparing it with this local aggregate total.

## The documented cycle

Spec Lock pins buildability, which pins node readiness, which reads currentness, which inventories Spec Lock and evidence. A read-only call to the generator's `build_report` proves that a fresh report would differ **only** in its node-readiness source hash: `437e6d7ad3d6a9ec2888dcce168d76a112da5e9a73995ae5464ab4ef8fd0a0a7` → `09b5966bb1adcf5d069f3179b31cebd02ca23a8abfc4c61dfa52b0a33e12ae5a`. No trial report was written. Retaining the first generation keeps its Spec Lock pin valid and reports the one-step-behind residual, as previous reseals do.

## Landing custody and follow-up

At this preparation commit, shared main and all 15 ignored currentness files still have their original bytes. The in-place helper passed isolated **check old / write / check final / restore** tests. It checks both manifest hashes, all 15 old files, all seven final files, the eight frozen files and unchanged quarantine custody. A real write additionally requires this thread's lock and the already pushed first landing SHA.

The first fast-forward runs shard and landing checks against the **old baseline-bound edition before the first main push**. The local temporary edition is removed after final local gates, so it cannot override the checker's selected shared root. Neither guard bypass nor a baseline refresh to excuse a pending landing is permitted.

Only after that check and push does the helper replace the seven generated files in place. Shared currentness and standalone shared readiness must then be validated and their exact residuals recorded here in the follow-up. Still under the same lock, `snapshot-current` and `--record-baseline` run from a full local worktree at pushed resealed main with the installed shared edition. The separate follow-up commits that new snapshot, pointer/supersession effects, bound baseline and compact landing record, then repeats the shared pre-push landing check before the second push. Final SHAs are mailed to the planner; worktree/branch cleanup precedes lock release.

Execution results for those landing steps are appended in the separate follow-up, with [baseline-record.md](baseline-record.md). Until then this section records the prepared procedure, not an assertion that main was pushed or currentness installed.
