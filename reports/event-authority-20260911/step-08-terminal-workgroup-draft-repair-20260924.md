# Step 08 — terminal.workgroup_moved draft: repair before review

Branch `plans/terminal-workgroup-depth-20260923` carries a new owner contract under DL-045 for the registered family `terminal.workgroup_moved`. SMPFS-170 in `Plans/Section15_MVP_Promoted_Features_Spec.md` defines the terminal owner's producer `terminal.workgroup_move_commit.v1@1.0.0` and the passive consumer `terminal.workgroup_move_history_read.v1@1.0.0`. SP-319 in `Plans/storage-plan.md` defines the Storage binding `storage.terminal_workgroup_move.inspect_current.v1@1.0.0` and the family checkpoint disposition `none_required`. The draft came from a retired Codex thread and was preserved unverified as `254505ccf9` (takeover report, "Inherited drafts" table). Jared authorized this repair through the coordinator. The repair rebases the draft, fixes the two recorded defects and aligns the text with DL-070 and DL-076. It does not land: a blind review follows, then the coordinator gives the landing go. No registry, payload, retention, admission or governance artifact changes, and no Step 08 or Step 09 count changes.

## Commits

| # | Commit | What |
|---|---|---|
| 1 | `93bbc67c85` | The draft rebased from base `d247d57ebd` onto `origin/main` `9f0da5c2b1`. |
| 2 | `e07919afab` | The draft's storage unit renumbered SP-314 → SP-319. |
| 3 | `bf4fa3a480` | Cycle broken: SP-319 depends on SMPFS-170; SMPFS-170 no longer depends on SP-319. |
| 4 | `6942619e11` | SMPFS-170 and SP-319 aligned with DL-070 and DL-076. |
| 4a | `48fd2f065f` | Wording fixes to commit 4, found on re-reading before this report. |
| 5 | `c34d93c9c3` | The SP-266 v2 subsection cites DL-076 for the nine-field token. |
| 6 | none | The checks passed and the renumbering broke nothing, so there was nothing to fix. |
| 7 | this commit | This report. |

Commit 4a comes after 5 in history. Every commit that edits a Plans document carries its regenerated shards and `Plans/.plan_index`. After each regeneration, the only derived files that changed belonged to the two edited documents. The branch was pushed after every commit. The rebase replaced `254505ccf9` on both remotes using `--force-with-lease` pinned to that commit. `254505ccf9` is still recorded in the takeover report.

## 1. Rebase

The only conflict in an authored file was at the end of `Plans/storage-plan.md`. Main had appended SP-314 to SP-317 there since the draft's base. The conflict was resolved as main's text followed by the draft's unchanged 172-line append. `Plans/Section15_MVP_Promoted_Features_Spec.md` applied cleanly. Both files were verified byte for byte to equal main plus the draft's own append. The derived conflicts, in 112 files under `Plans/_shards` and `Plans/.plan_index`, were not hand-merged: they were reset to main's side and regenerated. A second regeneration changed nothing except the `generated_at` timestamps. At commit 1 the index showed both inherited defects: the draft's SP-314 duplicated main's own SP-314 (coverage failed), and cycle-001 was [SMPFS-170, SP-314].

Before the repairs, the passages the draft relies on were re-read against `9f0da5c2b1`:

- **Unchanged since the base:** SMPFS-168, SP-286, SP-245, DL-045, CV-323, CV-333, CV-339 and UCC-144, in their PlanUnit fields and in the prose the draft cites. SP-278's and SP-273's PlanUnit fields are unchanged too, but their prose gained the DL-076 paragraphs listed below.
- **Changed since the base, and now followed:**
  - SMPFS-138 gained the DL-070 no-reseed rule.
  - SP-278 gained the DL-076 durable read token paragraph.
  - SP-282 and SP-273 gained DL-076 amendments.
  - SMPFS-167 gained the conditional v2 reader criterion. Its `depends_on` is unchanged.
  - DL-070 and DL-076 are new.
- **Re-adjudicated:** two draft statements depended on changed canon. The vacated-section behavior, which the draft left unstated and the takeover triage held neutral, now follows DL-070 (commit 4). The sentence "A stored snapshot identifier is provenance, never permission to reopen that snapshot" repeated the reading that DL-076 overrode, so it was replaced (commit 4).
- **Negative search still holds:** no terminal-family producer, reader, projector or checkpoint binding landed on main after the draft's search. A grep of Plans at `9f0da5c2b1` finds `terminal.workgroup_moved` only in its registry row, the Contracts_V0 payload contract, FinalGUISpec, the Decision Log, the wiring matrix, the PMConcept7 reconciliation JSON and SP-273's sibling sentence.

## 2. Renumbering

- **The new id.** SP-314 on main is a different accepted unit, "Original Standard authority families and fresh whole stored profiles". The highest storage id on main at `9f0da5c2b1` is SP-318, the Back Seat Driver lifecycle disposition, so the draft unit is now **SP-319**. The unused ids below the highest (SP-263, SP-264, SP-267, SP-276, SP-283, SP-284) are referenced nowhere, and they were not reused: the next id is always one past the highest, which is how the takeover's SP-318 figure was chosen too. No other branch on origin claims SP-319 or SMPFS-170.
- **What changed.**
  - Storage block: the heading and `plan_unit_id`.
  - SMPFS-170 block: three prose references, `depends_on` (the entry commit 3 then removed), `validation_surfaces` and ContractRef.
  - Main's own SP-314 and every reference to it are untouched.
  - No fixture, schema, registry row, script or test referenced the draft's SP-314. The draft commit changed only the two documents and their derived files.
- **How it is recorded in the unit's lineage.**
  - `source_lineage` adds `reports/event-authority-20260911/takeover-20260923.md` and this report.
  - A `stale_retired_dispositions` entry says the unit was drafted as SP-314 at `254505ccf9` and renumbered on 2026-09-24, and that SP-314 is not an alias of this unit.

## 3. Cycle resolution and its canon basis

SMPFS-170 and the storage unit listed each other in `depends_on`. That made cycle-001 and set `build_order_available=false`, which emptied the build order for the whole index.

**Resolution.** SMPFS-170 owns the family's semantics, and SP-319 is the Storage binding that consumes them. SP-319 keeps SMPFS-170 in `depends_on`. SMPFS-170 drops SP-319 from `depends_on` and names it only in `validation_surfaces` (`Plans/storage-plan.md#SP-319`), in ContractRef and in prose. One added sentence in SMPFS-170 states that direction.

**Canon basis.**

1. The registry row `event-family-terminal-workgroup-moved` in `Plans/event_family_registry.json` names `Plans/Section15_MVP_Promoted_Features_Spec.md#pmconcept7-home-workspace-terminal-reconciliation`, the SMPFS-138 section, as the semantic owner. Contracts_V0 is the payload owner.
2. DL-045's owner-batch table lists `terminal.workgroup_moved` under that Section 15 anchor, as a registered family that gets depth work only. Under DL-045, Storage owners define the Storage bindings for such families.
3. Main's two landed Section 15 and Storage pairs point the same way.
   - SP-266 depends on SMPFS-167, and SP-282 depends on SMPFS-168.
   - SMPFS-167 depends on [DL-046, SMPFS-166, CV-332], and SMPFS-168 on [DL-046, SMPFS-166, CV-332, SP-278].
   - Each Section 15 unit names its Storage unit in its text ("the exact checkpoint in SP-266", "SP-282's checkpoint") and in ContractRef, never in `depends_on`.
4. SP-273, the Storage binding for the Home sibling event, depends on its semantic and command owners (SP-245, F3-515, CV-323, UCC-144, UCC-147, CV-333).
5. The draft already says this. The storage text calls the producer and consumer "owned by SMPFS-170", and SMPFS-170 defines both identities.

The dependency graph uses only `depends_on`. `unblocks` and `validation_surfaces` add no incoming edges, so the reverse reference does not reform the cycle. At the branch tip, SMPFS-170 is position 6,519 of 6,721 in the build order and SP-319 is 6,531.

## 4. DL-070 and DL-076 alignment

**DL-070.** Jared answered Approve, option 1, on `EA-S8-TERMINAL-MOVE-SOURCE-001`. The takeover triage had held the draft's empty-section and reseed behavior neutral until that card was answered; the contract now states the approved rule.

SMPFS-170 says that when the moved workgroup is the last one in its source section:
- that section stays empty and reusable with its guidance state, as SMPFS-138 states under DL-070;
- the move allocates no replacement workgroup, pane or session, opens no terminal session and records no reseed;
- creating another workgroup or terminal there is a separate action;
- the payload has no `source_reseeded` field, and `section_created` reports only whether the target section was created;
- reset and boot-recovery reconstitution are unchanged and gain no creation authority from a move.

The readback check requires the vacated section's empty state. SMPFS-170's YAML gains a `canonical_text` sentence, an acceptance criterion and a negative constraint, and DL-070 is added to its `depends_on`, `source_lineage` and ContractRef.

On the storage side, SP-319 adds the empty state of a source section the move vacated to the original-move obligations that a verified historical read must resolve. It also adds "a reseeded vacated source section or reported reseed" to the paired negatives, with a matching acceptance criterion. DL-070 is in its `source_lineage` and ContractRef.

**DL-076.** Stored read tokens carry nine fields and never `redb_snapshot_id`.

SP-319 stores no record and no read token: its checkpoint disposition is `none_required` and it has no durable effect. The text now says:
- `redb_snapshot_id` is the live fence of the read's own redb snapshot and is never stored.
- The ephemeral observation carries the live token of its own read and is never persisted.
- A separately admitted contract that ever stores the observation or its token stores SP-278's nine-field durable read token (`DurableGenericToken`). Every later read joins the snapshot ID of its own live read transaction.

The draft sentence that treated a stored snapshot id as provenance is gone. SP-319 gains a `canonical_text` sentence, an acceptance criterion and a negative constraint, and DL-076 is added to its `depends_on`, `source_lineage` and ContractRef.

SMPFS-170 says that if its future pending or result companions store an SP-278 read token, it is the nine-field durable token (DL-076).

Commit 4a is precision only. It moves SMPFS-170's DL-076 sentence so that "that missing admission" again follows its antecedent. It also limits SP-319's vacated-section obligation to moves that actually vacate their source section.

## 5. SP-266 v2 citation

In "Conditional SP-266 v2 successor adopting the SP-278 read token — 2026-09-23" in `Plans/storage-plan.md`, one sentence changes. It no longer says "This follows the Storage owner decision on stored SP-278 checkpoint tokens, ruled by the coordinator on Jared's delegation on 2026-09-24:". It now says "This follows DL-076, the Storage owner decision on stored SP-278 checkpoint tokens:". Nothing else in the subsection changes, and SP-266's PlanUnit fields are unchanged.

Not changed, because it is outside this task: `Plans/browser_workspace_created_checkpoint_v2.schema.json` still says "coordinator ruling of 2026-09-24" in its `durable_index_read_token` description. That is a one-line follow-up for the SP-278 v2 companion's owner.

## 6. Checks

The checks ran at `48fd2f065f`, in a clean worktree with the sparse set Plans, scripts, reports and tests.

| Check | Result |
|---|---|
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | Pass: 99 documents, 2,722 shards, 0 failures. |
| `python3 scripts/pm-plan-index.py validate` | Pass, 0 failures. Coverage pass, 0 duplicate ids, 0 parse errors. Node readiness `blocked_runtime_certification_incomplete`, the same as main. |
| PlanUnits and acceptance units | PlanUnits 6,721 (main 6,719, plus SMPFS-170 and SP-319). Acceptance units 26,233 (main 26,216, plus 8 and 9). No existing unit's fields change apart from source hash and location. |
| Dependency graph | 0 cycle components, `build_order_available=true`, build order 6,721 of 6,721. 15,666 `depends_on` edges (main 15,648, plus 11 and 7), 0 unresolved references. |
| `tests.test_event_authority_holding_bucket` | 13 tests OK. This is the only test module that names any of SMPFS-170, SP-314 or `terminal.workgroup_moved`. It names the event only. |
| Test modules that read either edited document, plus the index and DL-076 suites | All OK: `test_pm_assistant_contract_closure` 38, `test_pm_browser_event_admission` 38, `test_pm_browser_program_semantics` 10, `test_pm_browser_result_binding` 54, `test_pm_runtime_vocabulary_migration` 9, `test_shared_runtime_storage_contracts` 15, `test_pm_browser_workspace_reset` 53, `test_pm_browser_workspace_created` 63, `test_pm_plan_index` 18. |
| Tests in total | 311 tests in 10 modules, all OK. |
| `pm-plans-verify.py` lint-contractrefs, lint-banned-phrases, lint-path-refs, validate-plan-graph, on the branch and on main `9f0da5c2b1` in the same sparse cone | See the notes below. |

Notes on the four lints:

- **lint-contractrefs:** 1 failure on both, the same one.
- **lint-banned-phrases:** passes on both.
- **lint-path-refs:** 103 failures on both, the same set. Only line numbers differ, because two index rows were inserted.
- **validate-plan-graph:** 876 failures on both, the same set.
  - The 112 failures that name the two edited documents belong to the 2026-08-29 evidence bundle `pm7-usage-recovery-plan-sharding-2026-08-29`: 76 are `artifact_hash_stale` and 36 are `missing_ref`.
  - The 36 `missing_ref` rows, and one more in that bundle, point at shard files that are also absent on main.
  - The 76 stale rows now report the edited documents' new hashes. This is governance staleness, as expected.
- **Across all four:** no failure names SP-319, SMPFS-170 or either new shard.

The landing check was not run. It needs a whole tree and runs at landing. Expected there: governance staleness for `Plans/storage-plan.md` and `Plans/Section15_MVP_Promoted_Features_Spec.md` (Spec Lock `stale_hash` and evidence hashes). That does not stop the landing, and it comes with a reseal request for the designated Plans agent.

## Hashes

| Authored file at `48fd2f065f` | SHA-256 |
|---|---|
| `Plans/Section15_MVP_Promoted_Features_Spec.md` | `35e4fd72dab2f42756023845503ca82fa1a3bc0ed06f0c610804f904245d6972` |
| `Plans/storage-plan.md` | `7c4924f6b9125fd9f76d1d713d0e3108bc9344a51cf9f331eeb105c7e13948d2` |

For comparison, main `9f0da5c2b1` has `138d57ec43325256585bfa978167666dab32d96465f4025dc0614a62e1f9a05c` (Section 15) and `720e2fa91b54d99e28e3c406021d543103d3fdc6ff1c1628d0e99c8647901931` (storage plan). The pre-rebase draft `254505ccf9` has `39d15f40029e54043abc0dde0a3afc0bcb7981625e77048b94ea35df53ab1bdb` and `1bdbf6f25834dbbaffac342718e9e7cd348935dea9743f46f17d338467252340`. This report's own hash is given in the hand-back to the coordinator.

The check outputs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/terminal-workgroup-draft-repair-20260924/`:

| Evidence file | SHA-256 |
|---|---|
| `dependency-summaries-by-commit.jsonl` (main, the pre-rebase draft and every repair commit) | `b8466bba8748d7c6419d994dbb82e7d311727a17ae03eba52873ab8cf380f16d` |
| `shard-check-48fd2f065f.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `plan-index-validate-48fd2f065f.json` | `3e230ff5f2ae1e0b549b0e459f988b6397ede6bd7c56e7d281d90ea2159b5174` |
| `unittest-test_event_authority_holding_bucket-48fd2f065f.log` | `923142c15fca79652325ffc18bf7d5f79d5149d0758a13e8a5ee4f67ff3fc489` |
| `unittest-test_pm_assistant_contract_closure-48fd2f065f.log` | `8e0644585587059d00d36d8e213cccd8f9780aee0b98728011b0e68124b73fb4` |
| `unittest-test_pm_browser_event_admission-48fd2f065f.log` | `3581906b26f49c6bf5a9e7faf9fb174a069bf204356f615b58001b53f950ec28` |
| `unittest-test_pm_browser_program_semantics-48fd2f065f.log` | `dabecd621e81e6b863eec890fab5c6d13af54e017b4cc68b9173314c957405ad` |
| `unittest-test_pm_browser_result_binding-48fd2f065f.log` | `7827a72faf00b08dfac53377e891b69ef96bfc25156bb95134867cee404edd99` |
| `unittest-test_pm_runtime_vocabulary_migration-48fd2f065f.log` | `c61594ae918168710bfd90f694609803fe90f12cd50da3182254bbe97b2a7bb9` |
| `unittest-test_shared_runtime_storage_contracts-48fd2f065f.log` | `80286eee635554c2722018458daf3de3b9a2831900f46815496192a4211759f5` |
| `unittest-test_pm_browser_workspace_reset-48fd2f065f.log` | `e28639742d6b0555bc7ae64eb4aedee7f80048d0fcf07f3b531f3918a992746d` |
| `unittest-test_pm_browser_workspace_created-48fd2f065f.log` | `6095cbe5231ce2c0ee81ee3c6c3dd3079ae0e67fd9da389341cb3d0119d1115a` |
| `unittest-test_pm_plan_index-48fd2f065f.log` | `0e338af7daf2351b6477ed97d4d22b60faf6ca1ab3ed17005b6e4672f7e689c1` |
| `pm-plans-verify-lint-contractrefs-48fd2f065f.json` / `-main-9f0da5c2b1.json` | `1502933aaff8872ae111135473d4138bc0152a65fed5df181a49498fc0ced3b3` / `bf071b9b165ecff664914aa160a40994f52671767fe14427977014f64c5253c2` |
| `pm-plans-verify-lint-banned-phrases-48fd2f065f.json` / `-main-9f0da5c2b1.json` | `ec11014df692ff8a879d43064c83c5120b432bff197f1372366df2ac7a1ac0b2` / `7ce822d5660d2b06a370fb49b5336da88a973606aaffdcb3610ae1b3e66925ef` |
| `pm-plans-verify-lint-path-refs-48fd2f065f.json` / `-main-9f0da5c2b1.json` | `95d0c7382c8356711f86c2d571e0c4264a3b85ac8c0fdb96cfca8deea78248c7` / `44444e0f5ff5bbb275d424d23398fe8b7361f812c39a06e3e4ee91fa1dd9d73e` |
| `pm-plans-verify-validate-plan-graph-48fd2f065f.json` / `-main-9f0da5c2b1.json` | `4836f4092ae0f41198b71a573af47ea170fe7aed2b5eec4601e51b21abe84cc9` / `b560ab8149d1e9acfdde008ca1ac8a900905cd7a28f2f76f858313040f970379` |

## Still open

- **Review and landing.** The blind review of this branch, then the coordinator's landing go.
- **Companion work the contract itself requires.** Each still needs its own owner work before the producer or reader can be used:
  - the closed original result and pending custody schemas;
  - SIR delegation;
  - the private read-result schema;
  - the paired static oracles;
  - migration;
  - native proof.
- **Depth status.** Nothing here gives the family a Step 08 depth pass. Its depth assessment against the current 42-family checkpoint remains Step 08 work.
- **The schema description citation** named in section 5.

Cost: one session, covering the rebase, five repair commits, 311 tests and four lints on the branch and on main; monetary attribution unavailable.
