# Combined governance reseal plan — 2026-10-11

**Phase 1 only. Nothing has been sealed or landed by this thread.** Jared assigned `codex-combined-reseal` the PMConcept7 home redesign chain's combined reseal, relayed by `claude-usage-scheduler` on 2026-10-11. Coordinator: `home-redesign-planner`. Phase 2 starts only upon the coordinator's explicit mailbox **go**, after the five prerequisite landing groups below and resolution of the currentness custody sequence.

Branch: `plans/combined-reseal-20261011`. Full T3 worktree: `/home/sittingmongoose/.t3/worktrees/PuppetMaster/plans-combined-reseal-20261011`, owned by `/home/sittingmongoose/src/PuppetMaster/.git`. Phase 1 fetched and verified `origin/main` **`618fd35e0e52eac0d6df5d1e3ff55d5c0a2bbf4b`**. All measurements below describe that revision; Phase 2 recomputes them at the new main.

## Authority and procedure

Read `AGENTS.md`, `.claude/CLAUDE.md`, and `Plans/00-plans-index.md` first. The procedure is [the 2026-10-09 reseal record](../governance-reseal-20261009/reseal-record.md), its [attestation](../governance-reseal-20261009/attestation.json), and [baseline record](../governance-reseal-20261009/baseline-record.md), with the landing rules in [the baseline README](../landing-checks/README.md). The previous actual seal is `cf7fdffe84`; the record's `806941ca04` is its preparation base, not its seal commit.

Both requests were read:

- `/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/RESEAL-REQUEST-plans-wave1.md` — canon landed at `511c288368`.
- `/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/RESEAL-REQUEST-plans-followup.md` — canon landed at `86d0fe8b3f`, snapshot/baseline follow-up `618fd35e0e`.

The old runbook's exact commands and helper algorithms were checked against the current argument parsers. External reference: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261009/RESEAL-RUNBOOK.md`. Do not reuse its dated hashes, counts, base commit, or run IDs.

The only addition to that procedure is DL-188's explicitly approved, bounded checkpoint-pin refresh in the existing PNC-019 receipt. The planner confirmed its scope in mailbox `1011054952-0e8a`. It does not rerun the certification harness or alter its historical execution results. Other stale certification inputs remain reported. Canon and design changes belong to their owners; this thread never edits `Concepts/`.

## Required landings before go

Chain update from the planner, mailbox `1011065727-3387` (2026-10-11): **panels+terminal publish, rail answers, Usage D43, hpt's small round, then the reseal go**. D43 is an additional prerequisite; this update does not authorize Phase 2.

Landing receipt `1011092907-6431` (2026-10-11): the panels+terminal publish is on main at **`62f37f65df4399c3de1f7fbaf654f3baea1cb287`**, with no `Plans/` paths changed, as reported by the planner. The receipt SHA was verified as an ancestor of fetched `origin/main`; its commit diff contains only four terminal harness/fixture paths under `Concepts/`. **One prerequisite is complete. Rail answers, D43 and hpt's small round remain pending; no reseal go has been received.**

Additional landing receipt `1011101650-3fee` (2026-10-11): the onboarding scenario repair is on main at **`3ad5e84b71bdf6abe6b5b9c1d1be5898615fe12f`**. This SHA was verified against fetched `origin/main`; the entire range after `62f37f65df` changes only Concepts and its onboarding result report, with no `Plans/` paths. It does not complete another reseal prerequisite. The planner now permits Usage D43 before rail answers if the rail landing misses 10:30 UTC; both landings and hpt's small round remain required before the explicit go. Rebase on the final main before Phase 2, without merging or regenerating Concepts in this thread.

The latest order update, mailbox **`1011123513-559d`**, supersedes those scheduling instructions: **Usage D43, readiness baseline adoption plus checker fix, rail answers landed by `codex-rail-landing`, hpt's small round, then go**. The publish remains complete; four prerequisite groups remain pending. The baseline adoption belongs to `codex-readiness-drift`, not this reseal thread. Its pushed fix at `d8b4e545d82976c038858071c56d7a3c77d4579d` is not yet on main. It introduces an input-identity guard that needs the sequencing resolution below; this order update is not a reseal go.

| Landing | Additional inputs to inventory after it lands |
|---|---|
| `home-panels`: combined panels and terminal publish into PMConcept7 — **LANDED `62f37f65df`** | The published panels and terminal integration in `Concepts/PMConcept7.html` and companions. Planner receipt `1011092907-6431` confirms no `Plans/` paths changed. Concepts-only changes require no invented governance hashes. Inventory any separately landed locked or inventoried inputs against the final main at go. |
| `leftrail-polish-lead`: `concept/leftrail-rail-answers-20261010` | The branch carries amendments to DL-162/DL-163 and their consumers. Its pushed canon commit `a25b885a3e` changes `Plans/Decision_Log.md`, `Plans/FinalGUISpec.md`, and `Plans/Jujutsu_Integration.md`, with regenerated index/shards. It names JJI section 4.1 and F3-624/F3-619/F3-528. DL-162/DL-163 already exist on current main; verify the amended passages after the owner rebases and lands. The branch also has Concepts changes, which this thread only observes. |
| Usage D43: `concept/usage-d43-20261010` at `1f9962a880` | Canon in CS-067/068, WM-043/045, UCC-147, UF-093/107, MA-073, F3-441, UIW-012, ATS, SSYS-019 and DL-174. The fetched branch head is `1f9962a880baf7fea250a995da0fc3541e7457dd`. Its expected canonical inputs are `Plans/Automated_Testing_System.md`, `Commands_System.md`, `Decision_Log.md`, `FinalGUISpec.md`, `Multi-Account.md`, `Settings_System.md`, `UI_Command_Catalog.md`, `UI_Wiring_Rules.md`, `Wiring_Matrix.md`, `Wiring_Matrix.production.json`, `settings_system_contract_fixtures.json`, `settings_system_contracts.schema.json`, `touch_closure.json`, and `usage-feature.md`, plus derived shards/index. The branch also publishes Concepts copies; this thread does not edit them. Require the actual final landing SHA/diff and re-read those units after the owner's landing; refresh whichever resulting hashes the existing governance inventories bind. |
| `codex-readiness-drift`: scheduled baseline adoption, then `fix/landing-readiness-drift-20261011` | Verify both landing receipts. The pushed fix `d8b4e545d8` changes `scripts/pm-landing-check.py`, its input tests, `reports/landing-checks/README.md`, and `reports/landing-checks/readiness-drift-20261011/NOTES.md`. The preceding scheduled snapshot/baseline follow-up records the pushed main using the new recorder, then lands under the old checker; the fix lands afterwards against the adopted baseline. Read the actual landed procedure and baseline. The new `readiness_audit_inputs` binds all 15 ignored currentness files by actual bytes, refuses missing/mismatched identity with exit 3, and rechecks identity after aggregates/exports. Canonical source edits still produce readiness findings. Do not change this owner's script or adopt a baseline within this thread to pass the reseal. |
| `hpt-plans-lead`: small canon round | F3-490 amendment, the final wave 2 numbers/IDs, and the stored onboarding-session NieR choice contract. Require the owner landing SHA and final IDs; do not reserve or invent them here. Include the source schema, storage registry, fixtures, owner prose and derived artifacts that actually land. |

The onboarding item is **a dependency, not a reseal-owned canon edit**. The planner explicitly assigned it to hpt's small round in `1011054952-0e8a`; hpt supplied the contract in `1011055039-79fa`: optional `look_choice` on `pm.product_onboarding.session.v2`, referencing existing `onboarding_look_choice` in `Plans/product_onboarding_contracts.schema.json`. Its fields are `theme_family`, `theme_mode`, `nier_mode`, `nier_parts`, `nier_background`, all nullable with existing enums. At 2.0.0, absence means all null, with no version bump or migration. Requests replace only the fields they set; resume repaints the stored choice, with nulls falling back to F3-520's start rule. Settings writes occur at Project commit. Owners/sources: PWIZ Product Onboarding, storage-plan/registry, DL-153, and Jared's answer `1010191558-0ce6` item 2. Verify the owner's landed implementation and fixtures; do not implement it during resealing.

### Currentness custody sequence requiring resolution

The previous record writes the seven new currentness files immediately before fast-forwarding, then runs the pre-push landing check. The new checker instead requires the currentness bytes to equal the pre-existing baseline and refuses a changed edition with exit 3 before classifying findings. Regenerating currentness and applying it before that check would therefore fail even for this assigned reseal. Never bypass the guard or refresh the baseline to excuse that pending landing.

Proposed compatible sequence, submitted to the planner and checker owner: retain the recorded old edition throughout the first landing check and main push; after those succeed, write the backed-up and verified final seven files under the same lock, validate them, and run the normal current-snapshot/baseline follow-up against the already pushed resealed main and new edition. Its follow-up landing then uses that new baseline. This changes the previous record's in-place-write timing and requires an explicit procedure resolution before execution. The landing steps below describe the old timing only where explicitly labelled; no in-place write runs until this question is settled. Preparation and gate outputs against the new local edition remain useful, but a landing-check dry run must use the exact old baseline-bound bytes via the landed checker's selected input source.

## Verified inventory at current main

The scheduler's list was checked against live files rather than treated as an edit manifest.

**Spec Lock:** 94 registered files, 21 stale hashes. The following are the complete stale set, including changed owners outside the two home requests:

```text
Plans/00-plans-index.md
Plans/Automated_Testing_System.md
Plans/Contracts_V0.md
Plans/Crosswalk.md
Plans/DRY_Rules.md
Plans/Glossary.md
Plans/Goal_Runtime_System.md
Plans/UI_Command_Catalog.md
Plans/Planning_Wizard.md
Plans/FinalGUISpec.md
Plans/Multi-Account.md
Plans/assistant-chat-design.md
Plans/Wiring_Matrix.md
scripts/pm-implementation-readiness.py
Plans/storage_value_registry.json
scripts/pm_pnc019_currentness.py
Plans/usage-feature.md
Plans/Widget_System.md
Plans/storage-plan.md
Plans/Commands_System.md
Plans/UI_Wiring_Rules.md
```

Refresh every existing lock entry from live bytes, including unchanged entries. The regenerated buildability report and the bounded receipt change will add to the changed set. `settings_inventory.json`, `event_family_registry.json`, and the workspace-layout v2 payload schema are not currently registered directly in Spec Lock. Do not add lock registrations or change schema-version fields merely because a request lists them; their hashes are covered where the live shard/evidence inventory, readiness inputs, and currentness inventory actually bind them.

**Evidence and graph:** `Plans/evidence_artifact_binding_modes.json` identifies exactly one `live_current` bundle: `pm7-usage-recovery-plan-sharding-2026-08-29`. Its 3,097 recorded artifacts produce 1,885 `artifact_hash_stale` and two `missing_ref` findings. Live shard manifests verify the replacements:

| Obsolete evidence reference | Current generated path |
|---|---|
| `Plans/_shards/settings_inventory/108-lines-21401-21412.md` | `Plans/_shards/settings_inventory/108-lines-21401-21600.md` |
| `Plans/_shards/storage_value_registry/569-lines-113601-113646.md` | `Plans/_shards/storage_value_registry/569-lines-113601-113800.md` |

Regenerate the reports and synchronize the entire artifact list; do not substitute paths by hand. `Plans/plan_graph.json` references this bundle and has no independent `sha256` fields. Its validator currently reports the same 1,887 findings. Repair the live bundle, then validate the graph; no graph-prose or topology edit is needed. Historical bundles remain immutable.

**Readiness:** with the shared checkout's ignored audit inputs copied into this full worktree, validation has 74 findings: 45 source-drift rows, one live-registry-drift row, 17 historical `pnc019_source_hash_stale` rows, four stale Spec Lock rows, and seven residual rows (buildability report, two denominator, two depth, legacy fixture root, self-tests). Node-index validation reports only stale `node_readiness_report.json`, with 7,095 PlanUnits and 28,332 acceptance units; coverage passes and runtime remains blocked. The readiness spec-lock rows are repaired by refreshing the lock, not by editing EventRecord/non-executable-closure evidence.

**Onboarding session:** neither the registry's `onboarding_state` family materialization nor the source `onboarding_session` schema has the stored NieR choice at this revision. This confirms the prerequisite above. The choose-look request payload already has the NieR fields. The retired `general.visual.chat-layout-mode` row is described as retired, with no options, in settings inventory and is absent from the storage registry; no further retirement edit belongs to this reseal.

**DL-188 checkpoint and admission pins:** current main has registry revision `2026-10-09.1`, 43 families, and `workspace.layout_changed` family revision 2.0.0, with its v2 schema. `pm_pnc019_currentness.py` already names the approved revision/count and keeps denominator/depth false. Both admission pins were recomputed using their validators' canonical JSON algorithm and match:

```text
prefix40 = 237b757a8f78e70fc77d3332f27eb51f0c4f80f2f5fbc16d5ff6792a344c49f8
current39 = 5ccb9d5d543fcb81e91db26ce432b89192fe96ed86ca6adf5515c9e5929383ed
registry raw SHA-256 = 4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe
v2 payload SHA-256 = 5d486daf7af60d2e8e487a3102a1d4200fdbd66465839578d96640d1405b04f1
```

The emit-only script and both testing/GitHub manifests match prefix40; the browser script, manifest and schema const match current39, and browser admission validation passes. The ignored currentness status still pins `2026-09-25.1`/`4227be36…`, so it needs regeneration. The checkpoint module's provenance comment quotes `6e01bb36…`, differing from the final live registry bytes; hpt was notified in `1011055203-cf47`. This comment is not an active validator hash pin. Recompute final live hashes and record their provenance without changing a validator or a registry row in this thread.

## Every artifact to change

| Artifact | Recompute/write method |
|---|---|
| `Plans/Spec_Lock.json` | `pm-governance-seal.py refresh --spec-lock`, after all pinned tracked outputs are ready; no manual hashes. |
| `Plans/auto_decisions.jsonl` | Exactly one new row through `upsert_auto_decision`; specification below. |
| `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/{shard_report.json,shard-check-report.json,evidence.json}` | Shard generate/check with report paths; `sync-plan-sharding-evidence`; live bundle `refresh` with actual validation excerpts and dated reseal check. |
| `Plans/.plan_index/node_readiness_report.json` | `pm-plan-index.py generate` against the first and final currentness editions. Restore other JSON index files only after proving their differences are timestamps alone. |
| `Plans/.implementation_readiness/buildability_gate_report.json` | `pm-implementation-readiness.py generate` after the first node-readiness generation; retain those bytes through the final cycle, as in the previous record. |
| `Plans/.implementation_readiness/pnc019_certification_receipt.json` | Guarded external helper adds/refreshes only `source_hashes["Plans/event_family_registry.json"]` and `source_hashes["Plans/event_payloads/workspace_layout_changed_v2.schema.json"]` from live bytes. Schema-valid; every other source pin and receipt field is equal to the backup. |
| `Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl` | `refresh-batch-hashes` on run 002. |
| `Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json` | Immediately following `refresh-final-summary --seal-state preseal` on run 002. |
| Ignored `Plans/.audits/event-authority-2026-08-13-currentness/` edition | Two external generations; seven generated files copied into the worktree only during preparation, then written in place in the shared checkout under the landing lock after backup/hash checks. Frozen inputs remain identical. |
| `reports/governance-reseal-20261011/{reseal-record.md,attestation.json,checkpoint-pin-verification.json}` | Compact execution record, locked-file hash/history attestation, and DL-188 pin-delta verification from actual Phase 2 outputs. PLAN.md is the sole Phase 1 repository edit. |
| Post-landing `Plans/.plan_migration/<new-current-snapshot>/**`, `current_run.json`, and standard script-managed supersession effects | `snapshot-current` at the pushed resealed main, with a newly allocated run ID and the then-current predecessor. Separate follow-up commit. |
| Post-landing `reports/landing-checks/baseline.json` and `reports/governance-reseal-20261011/baseline-record.md` | Full `--record-baseline` after snapshot-current at the already pushed resealed main; same separate follow-up commit. |

`Plans/_shards/**` should remain byte-identical when regenerated from already landed canon. If shard bodies/paths or `plan_units.jsonl`/`acceptance_units.jsonl` unexpectedly change, stop and report the stale owner derivation. Never hand-edit derived artifacts. No canonical owner prose, registry design, validator, Concepts file, historical bundle, WorkNode or NodeSeed is a reseal-owned edit.

The seven generated currentness files are `CURRENT_EVENT_SOURCE_INVENTORY.json`, `EVENT_FAMILY_DENOMINATOR_STATUS.json`, `EVENT_OCCURRENCES.jsonl`, `README.md`, `VALIDATOR_RECEIPT.json`, `adjudication/GROUP_ARTIFACT_MANIFEST.json`, and `adjudication/QUARANTINED_EVENT_DISPOSITIONS.jsonl`. Preserve the eight frozen files: `adjudication/EXPECTED_252_EVENT_TYPES.tsv` and all seven `adjudication/source_groups/*` inputs. The TSV pin is `d59142bc9ceef3f8c2d2257b7a6fbe9307ddae236720a0ac5a8c62afc7c5f541`.

## Phase 2 commands and order

Run only after the planner's go has been read, recorded and matched to all five landed prerequisite groups, including both readiness adoption/fix receipts, and the custody sequence has been resolved. Fetch/rebase on the new main, reread the relevant owner passages and requests, and record `origin/main` as the seal's main base. The branch may also contain this plan commit; do not mislabel its HEAD as main. Preparation uses the full local T3 worktree; shared checkout mutation is reserved for landing.

```bash
RESEAL_EVIDENCE=/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261011
RESEAL_BUNDLE=Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29
RESEAL_RUN002=Plans/.plan_migration/pds-20260611-002-atomize-planunits
RESEAL_CURRENTNESS=Plans/.audits/event-authority-2026-08-13-currentness
```

1. **Fresh inputs and backup.** Recopy only the ignored inputs named in the prior record: currentness edition; the two small audit directories; the three large audits' `FINAL_REPORT.md` files plus the cited widget `audit_report.json`; the resize-audit symlink; the three ignored 2026-08-12 Event Authority files; `tests/agent_packet_restrictions` symlink. Check a full checkout and clean tracked source inputs. Back up Spec Lock, auto-decisions and node report; tar the evidence tree, readiness directory and run 002; copy all 15 shared currentness files. Record base and SHA-256 manifests before any overwrite. Keep all helpers, backups and raw transcripts outside the repository. Use fresh Phase 2 directories, not Phase 1 preview outputs.

2. **Measure before; bounded DL-188 receipt delta.** Run `run-gates`, readiness and both migration validations into external `before/` outputs. The run named in `current_run.json` is separate from run 002. The tested helper is `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261011/phase1/refresh-dl188-checkpoint-pins.py`, SHA-256 `87fd06be0bc75d4b52a1cce00f42fcd03b41337e0d1e34bce7cf8a56c6b61ab7`. Its default invocation is read-only. After go and a fresh receipt backup, run it with `--apply --go-mail-id <actual-go-id> --expected-receipt-sha256 <backup-receipt-hash>`. It refuses another worktree/branch, another checkpoint or payload, an authority-enabling checkpoint, changed receipt bytes, or an invalid candidate schema. It preserves status, generation timestamp, execution evidence, lifecycle results, artifact counts, scope policy and all other source hashes. Never run `pm-pnc019-certification-harness.py`.

3. **First currentness generation.** Create a fresh evidence-location map pointing the logical currentness root to the shared checkout's existing edition, as in the old procedure. Pass it inline only on generation:

   ```bash
   PM_EVIDENCE_MAP="$RESEAL_EVIDENCE/evidence-map.json" python3 scripts/pm-event-authority-currentness.py generate --outdir "$RESEAL_EVIDENCE/currentness-edition-1"
   python3 scripts/pm-event-authority-currentness.py validate
   ```

   Between those commands, copy the seven generated files into the local worktree's ignored edition. Validate without the map so it reads the local copy. Preserve all frozen files, `UNKNOWN_OPEN`, closed/denominator/depth/build-or-PNC authority false, and the approved live 43-family checkpoint. This inventories the bounded receipt change before readiness consumes it.

4. **Readiness and run 002.**

   ```bash
   python3 scripts/pm-plan-index.py generate
   python3 scripts/pm-plan-index.py validate
   python3 scripts/pm-implementation-readiness.py generate
   python3 scripts/pm-plan-migration.py refresh-batch-hashes --run-dir "$RESEAL_RUN002"
   python3 scripts/pm-plan-migration.py refresh-final-summary --run-dir "$RESEAL_RUN002" --seal-state preseal
   python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_RUN002"
   ```

   After index generation, compare the non-node JSON artifacts with HEAD after recursively removing only `generated_at_utc`; restore them only if equal. No structural index change is expected. Save the first buildability-report bytes for the final cycle. Run 002 currently has 108 stale batch hashes, one stale live-unit count and two structural document-set findings; the pair should remove the first 109, retaining the two structural findings. Do not use `postseal` to assert passed gates or repair historical document sets.

5. **Live evidence and graph.**

   ```bash
   python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard_report.json"
   python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard-check-report.json"
   python3 scripts/pm-governance-seal.py sync-plan-sharding-evidence --evidence "$RESEAL_BUNDLE/evidence.json" --report "$RESEAL_BUNDLE/shard_report.json"
   python3 scripts/pm-governance-seal.py refresh --evidence "$RESEAL_BUNDLE/evidence.json" --plan-index-details '<actual main base, PlanUnit/acceptance counts and blocked runtime>' --command-excerpt '<existing command string>|||<actual successful output>' --check-detail 'governance-reseal-2026-10-11|||<assigned combined reseal scope, DL-188 pin refresh, valid currentness and false authority flags>'
   python3 scripts/pm-plans-verify.py validate-evidence
   python3 scripts/pm-plans-verify.py validate-plan-graph
   ```

   Supply all three command excerpts, preserving the exact existing strings for plan-index validate and shard generate/check (the recorded strings omit `--config`, though execution includes it). Use counts from this run, never the old excerpts. Leave the historical `plan-shard-generate` check text alone. Synchronization removes both obsolete shard references and includes any new shards. Graph validation must be clear without a graph edit.

6. **One decision row, then Spec Lock.** Create a guarded external `decision-row.py` around `scripts/pm-governance-seal.py`'s `upsert_auto_decision`, following the old helper. Append exactly one row with the specification below, then:

   ```bash
   python3 scripts/pm-plans-verify.py validate-auto-decisions
   python3 scripts/pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json
   python3 scripts/pm-plans-verify.py verify-spec-lock
   ```

7. **Final currentness and node readiness.** Generate into a new empty `currentness-edition-final` directory with the inline map, copy the same seven files into the local ignored edition, and validate without the map. Assert final Spec Lock, receipt and live-bundle hashes equal the inventory's pins. Assert frozen inputs and the quarantine ledger/group manifest equal the backup. Then `pm-plan-index.py generate` and `validate` once more, again restoring only proven timestamp-only files. Retain the first buildability report, which remains equal to its Spec Lock hash. The documented cycle leaves its node-readiness pin one generation behind; report that residual rather than continuously regenerating or claiming buildability.

8. **Final checks and record.** Run shard check, index validate, Spec Lock verify, auto-decision validate, evidence validate, graph validate and currentness validate; run `pm-plans-verify.py run-gates --report "$RESEAL_EVIDENCE/after/run-gates.json" --subcheck-timeout-seconds 600`. Validate run 002 and the actual current run without `--write-report`. Compare all failures to the before outputs and landing baseline. Record inherited audit-closure, GUI-fixture, PRD-contract, raw-capture, readiness/legacy/self-test and run-002 structural findings; never repair another owner's files. Produce the attestation from the previous seal to the new main base and live output hashes, plus the checkpoint-pin delta proof. Commit only the exact changed paths above and the compact reports, then push the branch. Recheck any timeout separately before considering landing.

## The one auto_decisions row

- `schema_id`: `pm.auto_decisions.schema.v1`.
- `decision_id`: **`dec-2026-10-11-combined-governance-reseal`**; absent at the Phase 1 base. Check uniqueness again before applying.
- `scope`: `plans.governance.reseal_repository_wide`.
- `decision`: `reseal_spec_lock_live_evidence_readiness_dl188_checkpoint_and_currentness_at_main_<frozen-main-short-sha>_without_certification_or_runtime_enablement`.
- `rationale`: Jared's 2026-10-11 assignment, previous seal `cf7fdffe84`, both landed home canon rounds, all five prerequisite groups' main SHAs (including readiness adoption/fix and Usage D43) and final wave 2 IDs, hpt's landed `look_choice`, the DL-188 two-pin-only receipt refresh, unchanged frozen 252-row custody, run-002 refresh pair, and externally generated currentness written in place at landing using the resolved custody sequence. No certification harness or denominator/depth/runtime/buildability claim.
- `applied_to`: Spec Lock; the three live bundle files; buildability report; node-readiness report; PNC-019 receipt; run 002's `batch_report.jsonl` and `final_validation_summary.json` — nine tracked artifacts.
- `contract_refs`: `PolicyRule:Decision_Policy.md#spec-lock-update-protocol`, `ContractName:Plans/Decision_Log.md#DL-039`, `ContractName:Plans/Decision_Log.md#DL-067`, `ContractName:Plans/Decision_Log.md#DL-188`, `SchemaID:pm.auto_decisions.schema.v1`.
- `timestamp_utc` and `inputs_hash`: generated by `upsert_auto_decision` from actual inputs, at the same pre-Spec-Lock point as the previous procedure. Never hand-edit a row or change historical rows.

## Landing, follow-up and cleanup

1. Acquire `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held` with `mkdir` **before the landing fetch**; write agent, branch and UTC time to `holder.txt`. If held, inspect the holder and wait five minutes between retries; clear it only when older than 90 minutes. Keep the lock through both main pushes and worktree removal.
2. Fetch and rebase against the latest main. Re-read cited owner passages. If a locked/inventoried source, shard or index changed since preparation, rebuild the reseal from the new base; never merge generated conflicts by hand. Rebuild any main-base-dependent decision/provenance before landing rather than restamping old evidence. Run the shard check locally first.
3. Push the prepared branch. In `/mnt/Cursor/PuppetMaster`, fetch that branch (the T3 worktree is in a separate clone); inspect uncommitted paths against the exact branch diff. If they overlap, stop and hand off. Fast-forward main to the fetched reseal branch. Run shard/currentness checks and **before pushing main**:

   ```bash
   python3 scripts/pm-landing-check.py --base origin/main --keep-check-reports "$RESEAL_EVIDENCE/landing/check-reports" --json > "$RESEAL_EVIDENCE/landing/landing-check.json"
   ```

   **Old-record timing, pending resolution above:** before the fast-forward, the tested external in-place helper checks the fresh 15-file shared-edition backup manifest, the seven-file final manifest and unchanged frozen bytes, and replaces only the seven generated files under the lock. This must not run before the landing check once the new input-identity guard is present. The proposed sequence delays that replacement until after the first check and main push. At the agreed write point validate the shared edition from the worktree with the evidence map and from the shared checkout without it. On a failed unpushed landing reset shared main with `git reset --keep origin/main`; restore the backed-up ignored edition if it was written. Never leave main ahead while repairing elsewhere and never use `--hard` there.
4. Apply the repository's exact landing verdict rules. Exit 2/3 stops landing; exit 1 requires reading staleness/pre-existing/off-branch findings and completing any timed-out subcheck separately. Shard failures solely on other threads' paths require verifying the HEAD shard/manifest binding, reporting them and following the permitted landing rule. Never fix another thread's files or refresh the baseline to pass this landing. Push main in the same landing step.
5. Still holding the lock, update a **full local worktree** to the pushed resealed main. Allocate the next free `pds-YYYYMMDD-NNN-current-planunit-snapshot` ID from the actual execution date; read the current pointer and count direct `Plans/*.md`. Run:

   ```bash
   python3 scripts/pm-plan-migration.py snapshot-current --run-id '<new-free-id>' --expected-doc-count '<actual-direct-doc-count>' --supersedes-run-id '<then-current-run-id>'
   python3 scripts/pm-landing-check.py --record-baseline --keep-check-reports "$RESEAL_EVIDENCE/landing/baseline-check-reports" --json > "$RESEAL_EVIDENCE/landing/record-baseline.json"
   ```

   The bare `snapshot-current` command is insufficient: all three arguments are required. Baseline recording must finish without a timed-out subcheck and name the already pushed resealed main. Commit the new snapshot, pointer/script-managed supersession changes, baseline and compact baseline record together as **one separate follow-up commit**; push that branch, fast-forward the shared checkout, shard-check and landing-check it before the second main push. The current Phase 1 run is `pds-20261010-008-current-planunit-snapshot`; do not freeze that name for Phase 2.
6. Mail `home-redesign-planner` both the reseal and final follow-up main SHAs and the residual findings. Remove temporary copies/links/helpers that are no longer needed; preserve cited external evidence. Remove this T3 worktree with its owning local clone, `/home/sittingmongoose/src/PuppetMaster`, and delete its landed local branch; remove any separate follow-up worktree/branch too. It is not registered in the shared clone's worktree list. Release the lock only after cleanup. Check the mailbox before finishing.

## Phase 1 dry-run evidence

No tracked governance file changed. Read-only validators ran in the full worktree after copying only the prior record's ignored inputs. An external currentness preview was generated into a new directory and **never copied into the worktree or shared edition**. The receipt pin helper ran in its default dry-run mode. Full aggregate gates and the landing check are reserved for Phase 2 after resealing.

Raw outputs: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261011/phase1/`. Each file below is cited by that directory plus basename and SHA-256.

| Output | Result | SHA-256 |
|---|---|---|
| `inventory.json` | 94 lock entries, 21 stale; two missing shard refs; live checkpoint census | `aba00cd70da4aea40fb36a502e63d9ecd82d2de9bd12d8e8813b7ffe95646966` |
| `spec-lock.json` | 21 `stale_hash` | `bb6cefc34073681511d78d6847d19a48543878df9e311c43e0222a2d8d55438a` |
| `shards.json` | PASS: 99 sources, 2,855 shards | `e8779f0b9810f1ab1953d9c19454bb7e234d5814afb1b2d0442601560a41e577` |
| `evidence.json` | 1,885 stale hashes, two missing refs | `94d323ab2362e3eb632a4af9ecd7fa4cf252ba387d7c8ab8cad58fa101088884` |
| `plan-graph.json` | Same 1,887 findings | `ee48a587a64bfa55b5033b94257e0338605aeb946fdf70f610d8b59aaf5e76a9` |
| `plan-index.json` | One stale node-readiness artifact; coverage PASS | `8843f53e2be367af34344cfe31521038d0f4f7f9901b9bf1fe121f21055afb44` |
| `readiness.json` | 74 findings; buildability false | `69fda50816b7bfef2da05aa42479fa2b63bd2b72999d7d8360190675e3e3af7e` |
| `migration-002.json` | 111 findings: 108 stale batch hashes, one stale count, two structural | `db8ba1c04f1a7b0ac4b902b62af956d3116483f8fc5777028ae840bc2d0dafae` |
| `migration-current.json` | PASS: zero findings | `caf9e6187f90fe826506f36a0d8f4880e23d40c878bfffc148a47f55b4695f54` |
| `browser-admission.json` | PASS, scoped conformance only | `aad0e60344fd996501fb6839d5cd038fc33df845210db187328b04587f084709` |
| `currentness-preview.json` | All 14 checks true; evidence valid; authority closed false | `c1a812cd48c307af8ff0870839204f748202c0c5f035eb6751650741bc0a384b` |
| `checkpoint-pin-helper-dry-run.json` | Candidate schema valid; exactly two pin insertions; every other receipt field/hash preserved | `c4194c9ae564d6280a531560840baddd2f2013e70568f583d236fbf7e697f2fb` |

The preview inventories 255 sources (96 direct Plans Markdown, 159 registered machine inputs), 3,773 discovery tokens and 11,334 occurrences; these are discovery counts, not adjudications. Its quarantine ledger and group manifest are byte-identical to the input edition. The current landing baseline was recorded at `86d0fe8b3f` after snapshot `pds-20261010-008`; totals are run-gates 5,397, audit-governance 5,381, current-run validation 0. The inherited baseline lacks ignored audit inputs, so compare actual keyed findings as the landing checker does, rather than requiring identical aggregate totals in this fully prepared worktree.

The original two scope questions are resolved: hpt owns the missing onboarding field before go, and the planner accepts the DL-188 two-pin-only refresh. The publish receipt is recorded at `62f37f65df`; Phase 2 still requires D43, readiness adoption/fix, rail-answers and hpt-small-round landing receipts, followed by the coordinator's explicit go. The newly identified currentness write/landing-check sequencing conflict is pending planner and checker-owner resolution.
