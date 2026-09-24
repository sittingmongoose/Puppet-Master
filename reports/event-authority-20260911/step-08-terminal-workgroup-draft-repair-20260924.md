# Step 08 — terminal.workgroup_moved draft: repair and review fixes

Branch `plans/terminal-workgroup-depth-20260923` carries a new owner contract under DL-045 for the registered family `terminal.workgroup_moved`. SMPFS-170 in `Plans/Section15_MVP_Promoted_Features_Spec.md` defines the terminal owner's producer `terminal.workgroup_move_commit.v1@1.0.0` and the passive consumer `terminal.workgroup_move_history_read.v1@1.0.0`. SP-319 in `Plans/storage-plan.md` defines the Storage binding `storage.terminal_workgroup_move.inspect_current.v1@1.0.0` and the family checkpoint disposition `none_required`. The draft came from a retired Codex thread and was preserved unverified as `254505ccf9` (takeover report, "Inherited drafts" table). Jared authorized this repair through the coordinator. The repair rebases the draft, fixes the two recorded defects and aligns the text with DL-070 and DL-076. It does not land. A blind review then returned fix_then_land; its ten findings and one follow-up edit are applied as described in "Review fixes" below, and the branch waits for the coordinator's landing go. No registry, payload, retention, admission or governance artifact changes, and no Step 08 or Step 09 count changes.

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
| 7 | `39915b7d30` | This report. |

Commit 4a comes after 5 in history. The review-fix commits come after the report and are listed in "Review fixes". Every commit that edits a Plans document carries its regenerated shards and `Plans/.plan_index`. After each regeneration, the only derived files that changed belonged to the two edited documents. The branch was pushed after every commit. The rebase replaced `254505ccf9` on both remotes using `--force-with-lease` pinned to that commit. `254505ccf9` is still recorded in the takeover report.

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

Not changed, because it is outside this task: `Plans/browser_workspace_created_checkpoint_v2.schema.json` still says "coordinator ruling of 2026-09-24" in its `durable_index_read_token` description. That is a one-line follow-up for the SP-278 v2 companion's owner. After the review, the coordinator asked for it on this branch: commit `0a114f2ce4`, described in "Review fixes".

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
| `dependency-summaries-by-commit.jsonl` (main, the pre-rebase draft, every repair commit and, since the review fixes, every review-fix commit; its first eight lines are the version first recorded here, SHA-256 `b8466bba8748d7c6419d994dbb82e7d311727a17ae03eba52873ab8cf380f16d`) | `c86d504573f02f6cbb9174ba373d516f4c822ba764a8f77f89ce3c5bbb1cb503` |
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

## Review fixes

A blind review of tip `39915b7d30` returned **fix_then_land**: 10 findings, none blocking, six should_fix (T-01 to T-06) and four notes (T-07 to T-10). The review files are in `/home/sittingmongoose/PM-Experiments/terminal-draft-review-20260924/`:

| Review file | SHA-256 |
|---|---|
| `REVIEW.md` (verdict, answers and the exact edits) | `bf0ec6d96c4ce3bb71bf645fdd5baf27521f3401252182d22519f6c004fb4074` |
| `findings.jsonl` (T-01 to T-10 and the summary line) | `918fc99e612fa910c89acecef42c8494bfe6047ddc5273acabbbfd29cf937d1f` |
| `RECONCILIATION.md` (the review compared with this report) | `d5d96de7578993856ff6915621866a8ef20a7b107f9c033aa43012dead5f0de7` |

The coordinator asked for every edit to be applied as `REVIEW.md` states, one commit per finding in order, then one more commit for the schema citation. Each commit that edits a Plans document carries its regenerated shards and `Plans/.plan_index`. After each one: generate passed, there were 0 cycles, `build_order_available` stayed true, `depends_on` edges stayed at 15,666, and only the two documents' derived files changed. Every commit was pushed.

| Finding | Commit | Edit (REVIEW.md) | What changed |
|---|---|---|---|
| T-01 | `86607345e6` | S6, first half | SMPFS-170 appends under the existing `ordinary` durability class of Case L-2 and CV-339, not a "post-mutation fact durability class". |
| T-02 | `94ffa73a25` | S5 | `event_id` and `idempotency_key` are supplied by this producer, derived once from the original admitted operation and frozen before the first append. Their derivation and `replay_policy` are companion obligations, as SP-273 defines them for Home. Storage assigns only `sequence_id`, `observed_at_utc` and `persisted_at_utc`. |
| T-03 | `0a796a1402` | S6 second half, P2 | Both units name `storage.first_append_receipt.resolve.v2` and `storage.first_append_receipt.resolve_full_value.v1`. A legacy selector or semantic reader gives no full-value proof. |
| T-04 | `754c977abd` | S7, P1 | The new consumer serves only the already specified resolution of the committed EventRecord that the operation's CV-323 receipt and CV-333 response reference (UCC-144), and has no other caller. SP-319's reader is scoped to it. The reviewer's alternative, dropping the consumer, was not taken. |
| T-05 | `bd2a89ca17` | S1, S2, S4 | The search list adds the two production wiring rows (handler `handlers::terminal::move_workgroup`, declared events `workspace.layout_changed` and `terminal.workgroup_moved`), FinalGUISpec's two DL-070 amendments and `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json`. The producer is reached through that handler path. The rows' declared event set is unchanged, and each event follows its own owner's applicability. |
| T-06 | `9b48df3099` | S3, S8, P3 | An admitted operation that ends `cancelled`, or `failed` with `rolled_back=true`, emits no moved event (CV-323). The acceptance criterion covers disabled, no_change, cancelled and failed operations. SP-319's paired negatives add such an operation carrying a moved event. |
| T-07 | `92c0dcd89d` | N3, first option | The direction sentence now says SMPFS-170 does not list SP-319 in `depends_on`, instead of "only". |
| T-08 | `ad2e923d70` | N1 | The vacated section stays empty and reusable with its guidance state (DL-070). As SMPFS-138 states, it may later be closed or reused and is never destroyed implicitly. |
| T-09 | `b06d94210d` | N2 | The result content SMPFS-170 lists now records whether the move vacated its source section, and that section's resulting empty state. |
| T-10 | `f52b05bcd9` | N4 | SP-319's renumbering note cites commit `93bbc67c85`, rebased from `254505ccf9`. |
| Schema citation | `0a114f2ce4` | coordinator's follow-up | In `Plans/browser_workspace_created_checkpoint_v2.schema.json`, the `durable_index_read_token` description now cites DL-076 instead of the "coordinator ruling of 2026-09-24". Nothing else in the file changes. The file is not a shard or index source, so no derived file changed. The older hash `a881162262c63f9e278d50a7cf8bfb9125d80f8e0180915cef86a31e74810d5f` recorded in `step-08-browser-created-v2-companion-20260924.md` is labelled "File at `72efcb6655`" and remains a correct historical record. |

**Before editing,** every canon fact the edits state was checked at `9f0da5c2b1`:
- The two wiring rows name `handlers::terminal::move_workgroup` and the two declared events.
- Case L-2 and CV-339 define exactly two durability classes, `ordinary` and `barrier`, and SP-273 appends its fact under `ordinary`.
- SP-270 names both SP-286 resolver identities, and `Plans/event_append_receipt_contracts.schema.json` defines `full_value_request` and `full_value_result`.
- CV-323 has the cancelled and failed (`rolled_back=true`) no-event rules and links the committed EventRecord.
- UCC-144 has "Every applied/no_change/failed result follows CV-323 and the exact canonical event family".
- Contracts_V0 section 1.2 makes `event_id` and `idempotency_key` producer-owned and excludes the three Storage-assigned fields.
- The reconciliation JSON lists `terminal.workgroup_moved`.

**After the ten finding commits,** both documents are byte-identical to the reviewer's dry run of every edit, `export-fixed/` in the review directory. Neither document contains "post-mutation fact" or "shared owner supplies" any more. PlanUnits stay at 6,721 and acceptance units at 26,233: T-06 rewords one criterion and adds none.

**Checks at `0a114f2ce4`** (base still `9f0da5c2b1`, clean worktree):
- `pm-shard-plans.py --check --config Plans/sharding_config.json`: pass, 99 documents, 2,722 shards, 0 failures.
- `pm-plan-index.py validate`: pass, 0 failures.
- Dependency graph: 0 cycle components and `build_order_available` true, with the build order covering all 6,721 units. There are 15,666 `depends_on` edges and 0 unresolved references. SMPFS-170 is at position 6,519 and SP-319 at 6,531.
- The ten test modules: 311 tests, all OK.
  - `test_event_authority_holding_bucket` 13
  - `test_pm_assistant_contract_closure` 38
  - `test_pm_browser_event_admission` 38
  - `test_pm_browser_program_semantics` 10
  - `test_pm_browser_result_binding` 54
  - `test_pm_runtime_vocabulary_migration` 9
  - `test_shared_runtime_storage_contracts` 15
  - `test_pm_browser_workspace_reset` 53
  - `test_pm_browser_workspace_created` 63
  - `test_pm_plan_index` 18
- `scripts/pm_browser_workspace_created_v2.py` prints `PASS` (`conditional_not_admitted`, native `NOT_RUN`, 3 positive cases).
- The four lints have the same failure counts as main (1, 0, 103 and 876). Setting aside line numbers and current-hash values, there are no new failures, and none names SMPFS-170, SP-319, either new shard or the edited schema.

| Authored file at `0a114f2ce4` | SHA-256 |
|---|---|
| `Plans/Section15_MVP_Promoted_Features_Spec.md` (equal to the review's `export-fixed/`) | `b64442645033baa1dde100a6480c9b6c337b89bfe12453ac6faf4ad52cc0c2e9` |
| `Plans/storage-plan.md` (equal to the review's `export-fixed/`) | `bf6912ec8b3b0970f6654838b6e445b7cf70d6b3b59035e0403eddd014f018cb` |
| `Plans/browser_workspace_created_checkpoint_v2.schema.json` (main `a881162262c63f9e278d50a7cf8bfb9125d80f8e0180915cef86a31e74810d5f`) | `6c9cd75980d17e79ed58c9a65f6483d7a37075fea467d3e544e16f0a23458ab6` |

New evidence files in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/terminal-workgroup-draft-repair-20260924/`:

| Evidence file at `0a114f2ce4` | SHA-256 |
|---|---|
| `shard-check-0a114f2ce4.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `plan-index-validate-0a114f2ce4.json` | `e7bcd6f5af863bcea739a34f2eb3182328af0524aacb9c452e7b402fd009a308` |
| `unittest-test_event_authority_holding_bucket-0a114f2ce4.log` | `a12ebdf9c9b6af54db78185bbcd39732fe037813934af68d4c2eec76f62e1225` |
| `unittest-test_pm_assistant_contract_closure-0a114f2ce4.log` | `6a6be94467d4b38871943bbb54f70d10b13b96e9b9ad1a5d15112e40cc950421` |
| `unittest-test_pm_browser_event_admission-0a114f2ce4.log` | `02b50fa641b2d20c79244438d334103a8f33e6e5e323214f8d92f6a284c4b3f4` |
| `unittest-test_pm_browser_program_semantics-0a114f2ce4.log` | `31652e50be0f47d453dc5878fa445e778e6d1647f0d06a94cd1fb337464847d4` |
| `unittest-test_pm_browser_result_binding-0a114f2ce4.log` | `1bf67e2096680fae21ec2fc3ecac8ca0f2010e1c84160907e26649ac1b108e1f` |
| `unittest-test_pm_runtime_vocabulary_migration-0a114f2ce4.log` | `8199e8f141be872161eaf1a16a96c152d8de57ea0e9a5782e60b3bcdc1b1bf0b` |
| `unittest-test_shared_runtime_storage_contracts-0a114f2ce4.log` | `b2af9fad8d72e1ec611eca4aa5f955a1ae5e187367477a15b860250c73ad179e` |
| `unittest-test_pm_browser_workspace_reset-0a114f2ce4.log` | `dcc385be10cf18066d255cade3af8e79dab5a3b7c104ba71c9e5a51d60a3e916` |
| `unittest-test_pm_browser_workspace_created-0a114f2ce4.log` | `0fbc3a898222d9dd651048f6d70669ef382d00b02c7125d8777a57249c382c91` |
| `unittest-test_pm_plan_index-0a114f2ce4.log` | `8f666cc070fbd76ccecd73f8feb193d4f51b896c7698bc377ca650dca9884f57` |
| `pm_browser_workspace_created_v2-oracle-0a114f2ce4.out` | `147638b2069a328005ff9f68581042a3c673bef833408a3964b63aaae5e49f49` |
| `pm-plans-verify-lint-contractrefs-0a114f2ce4.json` | `d42785d31e91631c370a4559a25d6429b1a6ae237ddf1ef7e5e6b9f0a904163d` |
| `pm-plans-verify-lint-banned-phrases-0a114f2ce4.json` | `45657fe7a0356261352b0e47da922bf38e9f301a6dabbedbbf8a87c4b7b901c3` |
| `pm-plans-verify-lint-path-refs-0a114f2ce4.json` | `bf63563d70ac06022959432e8c973168e438d7b7ae117493ed7164680e02fd41` |
| `pm-plans-verify-validate-plan-graph-0a114f2ce4.json` | `635974ad62cda8ad474f7063f5dc043d629507d87d20f2b8f3d777499a0a3f32` |

The landing check has still not been run; it runs at landing. The review expects governance staleness for the two edited documents there: Spec Lock already marks `Plans/storage-plan.md` stale on main, and evidence hashes and the plan-migration live-unit count (6,719 to 6,721) will also go stale. Neither `Plans/Spec_Lock.json` nor `Plans/.evidence/**` pins the edited schema file. None of this stops the landing; it goes with a reseal request to the designated Plans agent. This review's cycle is closed by one confirmation pass over S1 to S8 and P1 to P3, and the cycle cap is two.

## Still open

- **Landed** on 2026-09-24 under the coordinator's go, after one more commit it asked for: the DL-070 PlanUnit now says `source_reseeded` is retired. The landing rebase onto `54ac20a1bc` rewrote the commit hashes cited above. `reports/landing-checks/LANDING_20260924_TERMINAL_WORKGROUP_MOVED.md` maps each one to its commit on `main`, and SP-319's renumbering note now cites the landed draft commit `a475070763`.
- **Companion work the contract itself requires.** Each still needs its own owner work before the producer or reader can be used:
  - the closed original result and pending custody schemas, including the `event_id`, `idempotency_key` and `replay_policy` derivation named under T-02;
  - SIR delegation;
  - the private read-result schema;
  - the paired static oracles;
  - migration;
  - native proof.
- **Depth status.** Nothing here gives the family a Step 08 depth pass. Its depth assessment against the current 42-family checkpoint remains Step 08 work.
- **DL-070's own YAML.** Its `canonical_text` still says "source_reseeded is always false for a move", while its dated addendum and FinalGUISpec retire the field. This branch follows the addendum. Aligning the YAML is a Decision Log owner item, raised by the review.

Cost: one session, covering the rebase, five repair commits, ten review-fix commits and one schema-citation commit, and three runs each of the 311 tests and the four lints on the branch, with one baseline run of the lints on main; monetary attribution unavailable.
