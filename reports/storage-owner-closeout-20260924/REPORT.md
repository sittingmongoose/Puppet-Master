# Storage owner closeout, 2026-09-24

STATUS: landed on `main` on 2026-09-24 under the landing lock. The landing record is `reports/landing-checks/LANDING_20260924_STORAGE_OWNER_CLOSEOUT.md`. DL-076 is the decision recorded.

Branch `plans/storage-owner-closeout-20260924`, sparse worktree `~/pm-worktrees/storage-owner-closeout-20260924` (`Plans scripts reports tests .claude`), rebased for landing onto `main` `22e516b456` (tip `51c71b9ca4`). Landed.

Scope, on Jared's authorization relayed by the coordinator (Jared approved the coordinator deciding these on his behalf):
1. The two Storage owner questions left open by `reports/storage-registry-repairs-20260923/REPORT.md` (review findings R-02 and R-05): the `whole_wrapper_sha256` preimage on the three SP-310 stored-profile union members, and `redb_snapshot_id` inside the persisted SP-278 read token.
2. The two stale census tests: `tests/test_shared_runtime_storage_contracts.py` (84 families) and `tests/test_pm_onboarding_phases.py` (88 row bytes).
3. Two rule-file sentences Jared requested for `AGENTS.md` and `.claude/CLAUDE.md`.

Coordinator addition to Task 3 (received 2026-09-24, explicitly requested by Jared): a third sentence in "How to land on main" of both files establishing the landing lock (`mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`, holder file, held through fast-forward, checks, push of `main` and worktree removal, released with `rm -r`, stale after 90 minutes, retry every five minutes, branch pushes need no lock, `main` never pushed without it), in the same commit as the other two; and this branch lands under that lock.

Coordinator confirmations (2026-09-24, on Jared's delegation), after this branch asked:
- `tests/test_pm_browser_workspace_reset.py` may be edited for Task 1(b), and Task 2 covers `tests/test_shared_runtime_storage_contracts.py`. Both are tracked but have no one-per-file exception line in `.gitignore`; those lines are added in the same commit as the rule-file sentences, as an explicitly requested `.gitignore` edit.
- The 1(b) plan stands: the four checkpoint rows persist the nine-field durable token on the `DurableGenericToken` precedent, the live snapshot id is joined again at each read, SP-311's text stays as it is, the hash-pinned `Plans/event_record_index_checkpoint.schema.json` is not touched (each contract carries the projection locally), the frozen Home2 reader copy stays frozen, and readiness gains a rule, with self-tests, that rejects a persisted ten-field token.
- The Decision Log entry quotes the Browser passage's "historical provenance" wording as the reading overridden and SP-311's "never persist" as the reason.
- Currentness drift from the extra documents is expected at landing and lands under the staleness carve-out.

## Result

| | |
|---|---|
| Branch | `plans/storage-owner-closeout-20260924`, rebased onto `origin/main` `15ab001892` and pushed to both push URLs of `origin` (GitHub and the NAS). The last task commit is `9006c719e0`; only report commits follow it. |
| Decision Log | **DL-076**, with two items, in both sections |
| 1(a) `whole_wrapper_sha256` | Recipe found and stated beside SP-310; readiness checks it (3 new self-test checks) |
| 1(b) `redb_snapshot_id` | The four checkpoint rows store the nine-field durable token; SP-311 unchanged; readiness rejects a stored snapshot fence (5 new self-test checks) |
| Task 2 | Both census tests re-pinned after tracing every moved value to a landed, recorded commit: 15/15 and 42/42 pass (before: 1 failure each) |
| Task 3 | Three sentences in both rule files (landing lock, push-or-reset fast-forward, reseal scope), byte-identical passages, plus two `.gitignore` exception lines |
| Readiness failures | 38 on `origin/main` `15ab001892`, 38 on the branch, with an identical keyed set |

## Commits

After the rebase onto `15ab001892`, in order:

| Commit | What |
|---|---|
| `811ec3a4b7` | 1(a) owner text: the SP-310 follow-up that states the recipe, and the section 2.3.1 sentence. Storage-plan shards and the plan index regenerated. |
| `c24e341b4c` | 1(a) readiness: the member digest check and 3 self-test checks; the representation test names 31 checks. |
| `68c67c6e69` | This report, Task 1(a) section. |
| `9225b8d077` | 1(b) canon: the SP-278 durable read token, four dated amendments and SP-282-A001, the section 2.3.1 bullet, five contracts, three fixture files, four registry rows, the Browser reset oracle and its test. Storage-plan and registry shards and the plan index regenerated. |
| `730320a806` | 1(b) readiness: the durable-token exemption, the stored-fence rule and 5 self-test checks; the representation test names 36 checks. |
| `d935bef56c` | This report, Task 1(b) section. |
| `918c89ad5e` | DL-076 in both Decision Log sections. Decision_Log shards and the plan index regenerated. |
| `cb4bbd45dc` | Task 2: the two census tests re-pinned. |
| `9006c719e0` | Task 3: the three rule-file sentences and the two `.gitignore` lines. |
| `3561b01c9f`, `f485cc6e74`, `9183da847a` and this commit | This report, completed after the rebase. |

## Task 1(a): `whole_wrapper_sha256`

**Decision: the recipe exists. It is now stated in SP-310, and readiness checks it.**

**How the recipe was found.** The six values (two members for each of `goal_cancel_progress`, `goal_cancel_control_publication` and `goal_cancel_terminal_audit`) live in `Plans/goal_workflow_cancel_contracts/physical-profiles.json`. `git log -S` puts all six in one commit, `de87b6dfc3` ("plans: define original Workflow Goal cancellation coordination and storage profiles"). That commit's machine report, `reports/event-authority-20260911/step-08-goal-workflow-coordinator-checks.json`, pins six source packages by manifest SHA-256. The `physical_source` package is `/home/sittingmongoose/PM-Experiments/goal-workflow-cancel-physical-integration-20260914/v1/`; its manifest's SHA-256 is `1c2a331b8fc097a6215712227e7abb0250a8334ec73dd33401bd92d68f4b8ab2`, which is the value the report records. That manifest pins `build_proposal.py` at `29cf2f89f5f66fcdf2c682c75fb2f648894d584741e3ad45bb39caa81a8679e9`. Line 100 of the script writes:

```python
'whole_wrapper_sha256': hashlib.sha256(dump(ww).encode()).hexdigest()
# with dump = lambda x: json.dumps(x, ensure_ascii=False, indent=2) + '\n'
# and ww = the definition that whole_wrapper_ref resolves to in the goal realm
```

The reviewer tried compact and spaced separators, but not `indent=2`. The recipe applied to the current hash-pinned documents reproduces **all six** declared values. `ensure_ascii` makes no difference here, because the six definitions contain no non-ASCII characters. Sorted keys, compact output and output without the final LF reproduce none of them.

| Family | Member | Wrapper definition | Reproduces |
|---|---|---|---|
| `goal_cancel_progress` | v1 `1.0.0` | `Plans/goal_cancel_command_custody.schema.json#/$defs/StorageProgress` | yes |
| `goal_cancel_progress` | v2 `2.0.0` | `Plans/goal_workflow_cancel_contracts/schemas/goal-workflow-cancel-custody.schema.json#/$defs/StorageProgress` | yes |
| `goal_cancel_control_publication` | v1 | `...goal_cancel_command_custody.schema.json#/$defs/StorageControlPublication` | yes |
| `goal_cancel_control_publication` | v2 | `...goal-workflow-cancel-custody.schema.json#/$defs/StorageControlPublication` | yes |
| `goal_cancel_terminal_audit` | v1 | `...goal_cancel_command_custody.schema.json#/$defs/StorageTerminal` | yes |
| `goal_cancel_terminal_audit` | v2 | `...goal-workflow-cancel-custody.schema.json#/$defs/StorageTerminal` | yes |

**Reasoning, in three sentences.** The digests were never unexplained: the generator that wrote the declaration is still on disk, pinned by the commit's own machine report, and its recipe reproduces every value exactly. Retiring a field that is correct and reproducible would throw away the one pin that binds each reviewed wrapper definition, which the resource map's whole-document hash cannot do once someone refreshes that hash. So the owner text now states the recipe beside SP-310, and readiness checks it: a changed wrapper needs a newly declared digest.

**What changed.**
- `Plans/storage-plan.md`: in SP-310, a dated "2026-09-24 follow-up: member wrapper digests" states the recipe. The digest covers the definition, not the whole document; members stay in document order; indentation is two spaces; non-ASCII is written as UTF-8; there is one final LF; it is not a stored-value hash and not the `pm.goal.cancel_command_json.v1` codec. It cites the generator's provenance and DL-076. The section 2.3.1 sentence that called the recipe an open question now says readiness checks it and keeps the note that it was open until 2026-09-24.
- `scripts/pm-implementation-readiness.py`: `storage_value_whole_wrapper_sha256`, and in the union check a new failure `storage_value_registry_stored_profile_union_member_wrapper_digest_mismatch`. Three self-test checks:
  - `stored_profile_union_member_wrapper_digests_reproduce` (positive): all six digests are present, 64 lowercase hex, and equal the recomputed value.
  - `stored_profile_union_member_wrapper_digest_drift_rejected` (negative): a zeroed declared digest is rejected.
  - `stored_profile_union_edited_wrapper_with_refreshed_document_pin_rejected` (negative): a `$comment` added to the V2 `StorageProgress` definition, with the resource map re-pinned so the document still resolves, is rejected by the digest alone.
- `tests/test_pm_runtime_vocabulary_migration.py`: the representation test names the three checks, 31 in all.
- A mutation run confirms the negatives are not vacuous. A copy of the validator with the digest comparison disabled fails exactly the two negative checks, and the positive check still passes.

`Plans/goal_workflow_cancel_contracts/physical-profiles.json` itself is unchanged, so no resource map, manifest or report pin moves.

## Task 1(b): `redb_snapshot_id` in the stored SP-278 read token

**Decision: the four checkpoint rows stop storing the snapshot id. SP-311's rule stays as written, with no exception.**

**What canon said.**
- SP-311 (goal_run started projector): "Snapshot id from the actual ten-field generic token is only a live transaction fence; never persist or manufacture it." SP-312 repeats it: "The tenth actual redb_snapshot_id is a live fence only, never durable or manufactured."
- Three goal_run consumer schemas (started, cancelled, certified) each define `DurableGenericToken`, which is exactly the canonical `read_token` without `redb_snapshot_id` (checked by equality).
- The restore-created v2 digest ("it is not persisted in this digest") and the restore-expiry `index_selection_sha256` ("read_token excluding redb_snapshot_id") both leave it out of stored digests.
- Against that, four owner passages stored the whole ten-field token on purpose:
  - SP-282 Browser reset: "A stored snapshot ID is historical provenance, not a reopenable native snapshot or a restart credential."
  - SP-270 seglog reader: "stores the exact closed read_token as index_read_token: ... and redb_snapshot_id".
  - SP-273 Home reader: "including ... actual redb_snapshot_id".
  - SP-275 restore expiry: "generic_read_token additionally carries the actual redb_snapshot_id".
- The Browser oracle and its tests encoded the provenance reading: the stored id is never rewritten, and disclosure swaps in the live id.

**Reasoning, in three sentences.** A stored snapshot id served no function: every one of the four owners already forbade using it as a fence, a restart handle or a currentness proof, so it was an inert field whose only safe use was to be ignored, and it invited exactly the misuse those guards exist to prevent. Keeping SP-311's rule universal costs only planning churn now, because nothing is implemented, and the nine-field durable token is already canon in three consumer schemas. The alternative, an exception in SP-311 for checkpoint custody, would leave two meanings of "stored read token" in one Storage plan.

**What changed** (commits `9225b8d077` and `730320a806`).
- `Plans/storage-plan.md`:
  - SP-278 gains a dated "2026-09-24: the durable read token" paragraph. It defines the stored form as the canonical token with `redb_snapshot_id` removed from `properties` and `required`, and says each read joins the snapshot id of its own live read transaction.
  - Dated DL-076 amendments in the four passages (SP-282, SP-270, SP-273, SP-275). The SP-282 amendment says outright that the "historical provenance" reading no longer applies. SP-282 criterion A001 is amended in place.
  - Section 2.3.1: the read-token bullet is rewritten, and the closing sentence names DL-076.
  - SP-311's text is unchanged.
- Contracts:
  - `Plans/browser_workspace_reset_contracts.schema.json` gains a local `$defs/durable_read_token`, which `checkpoint` and `checkpoint_core` now reference.
  - The whole-token copies become the nine-field projection in:
    - `Plans/seglog_append_observability_contracts.schema.json` (3 copies);
    - `Plans/home_layout_event_contracts.schema.json` (3);
    - the Home3 receipt contract `Plans/home_layout_pending_receipt.schema.json` (3), which carries the same checkpoint definitions;
    - `Plans/restore_point_expired_contracts.schema.json` (2).
  - Not touched: the frozen Home2 reader `Plans/home_layout_pending_receipt_v2_reader.schema.json`; `Plans/event_record_index_checkpoint.schema.json`, which 12 resource maps pin by hash; and every live-read contract (reader inputs, owner resolutions, reader routes).
- Fixtures: the eight stored checkpoint values in the home, restore and seglog contract fixtures lose the field. A jsonschema harness over all 28 value-shape cases gives the same per-case outcome before and after. Each updated contract now rejects a stored checkpoint whose token carries the field.
- `Plans/storage_value_registry.json`: the four rows. The Browser row's local definition is renamed `durable_read_token`, and its `replay_behavior` sentence "Stored snapshot ID is provenance, never a restart handle." is replaced. The row equals `expected_storage_family()`.
- `scripts/pm_browser_workspace_reset.py`:
  - `durable_read_token_schema()` computes the projection from the canonical token.
  - `binding_failures` rejects a contract whose `durable_read_token` is not that projection.
  - `index_token_failures` validates the stored nine-field token and then joins the observation's live snapshot id. A missing live id is `generic_live_snapshot_unproved`.
  - `disclose` no longer rewrites a stored field.
- `tests/test_pm_browser_workspace_reset.py`:
  - `test_every_read_token_field_exactly_joins` covers the nine stored fields.
  - The snapshot observation case now uses a missing or empty live id.
  - The new-snapshot disclosure test asserts that no id is stored.
  - Two new tests: a stored id is rejected even when it equals the live id, and the contract's durable token is the SP-278 projection, with a negative.
  - The storage-binding mutation list gains `stored_snapshot_id`.
- `scripts/pm-implementation-readiness.py`:
  - The read-token exemption accepts the canonical token or its durable projection.
  - New failure `storage_value_registry_live_snapshot_fence_persisted`. It fires for any `redb_snapshot_id` property reachable from an inline value schema: subschema keywords and local references are followed, unreferenced `$defs` are not, so `retention_hold_record`'s unused whole-token definition is correctly not reported. It also fires, conservatively, for any such property in the SP-310 union record graphs.
  - Five self-test checks: `sp278_persisted_read_tokens_are_durable` (positive), `persisted_whole_read_token_rejected`, `persisted_snapshot_fence_through_local_reference_rejected`, `stored_profile_union_record_graph_snapshot_fence_rejected` and `durable_read_token_schema_under_other_name_rejected`.
  - `read_token_local_reference_to_altered_definition_rejected` follows the renamed Browser definition.
  - The representation test names 36 checks.
- Mutation runs on the validator, each caught:
  - with the inline rule removed, the two inline negatives fail;
  - with the union rule removed, the union negative fails;
  - with the exemption limited to the whole token, the live-row positive fails;
  - with local references not followed, the local-reference negative fails.

## DL-076

`Plans/Decision_Log.md` now has **DL-076**, "Storage owner decisions — the SP-310 wrapper digest recipe, and stored read tokens without the live snapshot id", in both sections: the Entries section and a PlanUnit under PlanUnits.
- It is written in the DL-036 plain-language form: each of the two items has a name, question, why, what you get, what it costs, options, recommendation and answer.
- It is attributed "Decided by Jared, by delegation to the coordinator, 2026-09-24".
- Item 2 quotes the Browser passage's "historical provenance, not a reopenable native snapshot or a restart credential" as the reading overridden, and SP-311's "is only a live transaction fence; never persist or manufacture it" as the reason.

The number was the next free one when the branch was written and again after the rebase onto `15ab001892`. `main` ends at DL-075, and no other branch on the remote carries a DL-076. It has to be checked once more at landing. The owner edits cite DL-076 in `Plans/storage-plan.md` (SP-310, SP-278, SP-282, SP-270, SP-273, SP-275, section 2.3.1) and in the two validator scripts. If the number is taken by then, all of these move together to the next free number.

The PlanUnit adds 1 PlanUnit and 4 acceptance units. Its `preserved_exact_tokens` (`whole_wrapper_sha256`, `redb_snapshot_id`, `DurableGenericToken`) all occur in its `canonical_text`. It depends on DL-045 and DL-046, the Step 8 and Browser technical-binding approvals under which the four checkpoints were defined.

## Task 2: the two stale census tests

**Before**, on the branch base: `tests.test_shared_runtime_storage_contracts` ran 15 tests with 1 failure (`294 != 84`), and `tests.test_pm_onboarding_phases` ran 42 with 1 failure (`294 != 90`). **After** (`cb4bbd45dc`): 15/15 and 42/42 pass. They were re-measured at the rebased tip; see "Checks and tests".

**How each moved value was traced.** A per-commit history of `Plans/storage_value_registry.json` along `main` records, for every commit that touched the file, the family and policy counts, the status and tier counts, and which rows changed (`registry-history.json` in the evidence set). A script then confirmed that every commit named below is an ancestor of `origin/main` and that its cited record exists; a record under `reports/` is one the commit itself added.

`tests/test_shared_runtime_storage_contracts.py`, `test_registry_has_exact_family_and_status_counts`:

| Value | Old pin | Now | Moved by |
|---|---|---|---|
| families | 84 (the registry as of `dc3a300310`, the sweep that added this test) | 294 | `99a3c7db9d` +4; then the 26 commits `af6856d039` to `f6350caf27` +206; none removed |
| materialized | 66 | 272 | the same 26 commits, +206 |
| deferred | 17 | 21 | `99a3c7db9d`: the four Working Notebook families, recorded in `Plans/storage-plan.md` "Working Notebook And Context Transition Storage Addendum (2026-09-05)" (SP-255 to SP-257), which that commit added along with a governance reseal |
| compatibility alias | 1 | 1 | unchanged |

`tests/test_pm_onboarding_phases.py`, `test_existing_family_and_retention_census_is_unchanged`:

| Value | Old pin | Now | Moved by |
|---|---|---|---|
| families (and unique ids) | 90 | 294 | the 25 commits `4d9d21297d` to `f6350caf27` in the readiness census comment, +204; none removed |
| retention policies | 24 | 27 | `0fed14e345`, `74c5485e3b` and `6621d9dc1d`, each with its own record |
| digest of the 88 prior rows | `91e394fe…`, "from `7db6a87c60`" | `de1461c6…` | Four rows changed, each by a recorded commit: `event_record_index` (`d21fd2cf23`, `step-08-generic-index-validation.md`), `restore_point_record` (`7fa3b65df7`, `step-08-restore-pair-validation.md`), `retention_hold_record` (`2080658ff8`, `step-08-hold-validation.md`) and `goal_receipt` (`679e066a2a`, `step-08-certified-custody-validation.md`; `274c681e43`, `step-08-current-child-scope-validation.md`) |
| `run_started_index_checkpoint` digest | `04cd5eaa…` (as added by `af6856d039`) | `24060bdb…` | `38d896d3f0`, "Adopt versioned run-start and restore-created index checkpoints" (`step-08-index-adoption-validation.md`) |

Findings behind the re-pin:
- **The test's cited pin commit `7db6a87c60` is not on `main`.** It is the pre-rebase twin of `b09294e44b`, which carries the same subject and the same 88-row digest `91e394fe…`. The new comment names `b09294e44b`.
- The 88 pinned rows still lead the registry in their original order, followed by the two families the test names. Every later family was appended after them. The test therefore now takes `families[:88]` and asserts the two names at positions 88 and 89, where it used to take "every row except the two", which was only 88 rows while the registry had 90.
- The remaining assertions already held at the tip: the Browser created row equals `expected_storage_family()`, the Onboarding storage module validates the registry, and the Onboarding gate passes. Only the pinned values had moved.
- The new pins are the same on `origin/main` and on this branch. This branch changes no row among the first 90.
- The two tests re-pin literal values, with comments naming the commits, as instructed. Neither reads the readiness constants, so each stays an independent tripwire.
- "Checkpoint 2026-09-11.2" in the request is the `registry_revision` of `Plans/event_family_registry.json`. The storage registry carries no checkpoint label; its census here is stated against `origin/main`.

## Task 3: the rule-file sentences

Commit `9006c719e0` changes `AGENTS.md`, `.claude/CLAUDE.md` and `.gitignore`. Before and after the edit, the "How to commit and push" and "How to land on main" sections compare byte-identical between the two files (1,009 and 6,767 characters after).
- **Landing lock** (the new first bullet of "How to land on main"): "Before the fetch for a landing, run `mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`; success means you hold the landing lock, so write your agent name, branch and UTC time to `held/holder.txt`, hold it through the fast-forward, the checks, the push of `main` and the worktree removal, and release it with `rm -r` of that directory; if `mkdir` fails, read `holder.txt` and clear the directory only if it is older than 90 minutes, otherwise wait five minutes and retry; branch pushes need no lock, and `main` is never pushed without holding it." The parent directory exists, with a README that matches.
- **After the fast-forward step**: "A fast-forward of the shared checkout's `main` is pushed in the same step or reset back to `origin/main` immediately, never left ahead of `origin` while checks or repairs run elsewhere."
- **In the reseal sentence of "How to commit and push"**: "The designated Plans agent's reseal scope includes the one required row in `Plans/auto_decisions.jsonl`, the `refresh-batch-hashes` and `refresh-final-summary` pair on the current migration run, and the currentness edition written in place after a backup." Both subcommand names exist in `scripts/pm-plan-migration.py`.
- **`.gitignore`**: `!/tests/test_pm_browser_workspace_reset.py` and `!/tests/test_shared_runtime_storage_contracts.py`. Both are tracked tests this branch edits. `git check-ignore` no longer matches either.

## Rebase

The branch started at `566970cb7b`. On 2026-09-24, after the session resumed, it was rebased onto `origin/main` `15ab001892`, 18 commits later. None of those commits touches a file this branch authors. They change `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/multi_account_*`, `Plans/touch_closure.json`, Browser admission scripts and tests, `Concepts/**` and reports. Every passage this branch cites is byte-identical before and after.

Only `Plans/.plan_index/*` conflicted. The conflicts came at the three commits that regenerate the index. Each was resolved by regenerating shards and the index at that commit, never by merging. Regenerating again at the tip changes only the four `generated_at_utc` stamps. The rebased branch was pushed with `--force-with-lease` pinned to the previous remote tip `239f2f87ec`.

## Checks and tests

Environment: this sparse worktree (`Plans scripts reports tests .claude`), holding a byte-identical copy of the ignored currentness audit `Plans/.audits/event-authority-2026-08-13-currentness/` (`VALIDATOR_RECEIPT.json` SHA-256 `af0bce7c65932afb2165cf64c0bd06c69f65e9a4b2007dd6ccc0125b56368f0e`). The plan index is generated and validated without that audit, as `main`'s was. "`main`" columns were measured in a temporary detached sparse worktree at the same commit and with the same audit copy.

| Check | Branch base `566970cb7b` | Tip before rebase | `origin/main` `15ab001892` | Tip `9006c719e0` (rebased) |
|---|---|---|---|---|
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 99 docs | pass, 99 docs | — | pass, 99 docs / 2,720 shards |
| `pm-plan-index.py validate` | pass, 6,718 / 26,208 | pass, 6,719 / 26,212 | 6,718 / 26,210 (committed index) | pass, 6,719 / 26,214 |
| `pm-implementation-readiness.py validate` | 35 | 35, identical keyed set | 38 | **38, identical keyed set** |
| storage representation self-test checks | 28 | 36, all pass | 28 | 36, all pass |
| `verify-spec-lock` | — | — | 10 `stale_hash` | 10, same set |
| `validate-evidence` / `validate-plan-graph` | 759 / 759 | 759 / 759, 0 added, 0 removed | 847 / 847 | **847 / 847, 0 added, 0 removed** (keyed with `pm-landing-check.py`'s own `normalize`) |
| `validate-browser-event-admission` | pass | pass | — | pass |
| `pm_browser_workspace_reset.py` fixture report | pass | pass | — | pass |
| 28 contract fixture value-shape cases (jsonschema) | all as declared | all as declared | — | all as declared |
| updated contracts reject a stored token with `redb_snapshot_id` | — | yes (3 of 3) | — | yes (3 of 3) |

Remaining readiness failures, the same set on `main` and the tip:
- 17 `pnc019_source_hash_stale`;
- 9 `event_authority_currentness_source_drift`;
- 2 `event_denominator_unresolved` and 2 `event_family_contract_depth_unresolved`;
- 5 readiness Spec Lock hash rows;
- 1 `buildability_gate_report_stale_or_not_canonical`;
- 1 `event_legacy_fixture_root_mismatch`;
- 1 `implementation_readiness_self_tests_failed`, which names only the three `case_l_verification_integration` checks that were false before this branch.

Every storage representation check passes.

| Tests | Before (base) | After (rebased tip) |
|---|---|---|
| `tests.test_shared_runtime_storage_contracts` | 15 run, **1 fail** | 15 run, 0 fail |
| `tests.test_pm_onboarding_phases` | 42 run, **1 fail** | 42 run, 0 fail |
| `tests.test_pm_runtime_vocabulary_migration` | 9 run, 0 fail (28 checks named) | 9 run, 0 fail (36 checks named) |
| `tests.test_pm_browser_workspace_reset` | 51 run, 0 fail | 53 run, 0 fail |
| `tests.test_pm_browser_event_admission` | 30 run, 0 fail (at `566970cb7b`) | 38 run, 0 fail (`main` added 8) |
| `tests.test_pm_testing_session_events`, `tests.test_pm_github_project_integration`, `tests.test_pm_emit_only_event_boundaries` | — | 11, 15, 13 run, 0 fail |
| Whole tracked suite, `unittest discover -s tests` | 952 run, 6 fail, 3 errors (at `15ab001892`) | **954 run, 4 fail, 3 errors** |

The whole-suite difference is exactly the two census tests fixed and the two new Browser reset tests passing; nothing new fails. The failures left are identical on both sides:
- `test_pm_touch_closure_source` (3 errors and 1 failure) needs `Concepts/pm7-tools`, which is outside this sparse cone. These are environmental.
- `test_pm_pnc019_currentness`, `test_prd_planning_runtime_contracts` and `test_runtime_integration_disposition` fail on `main` too.

## What the landing check will say

This branch lands under the landing lock, after the coordinator's go. The landing check compares against the committed baseline `reports/landing-checks/baseline.json`, recorded at `75bcda93bc` on 2026-09-23, which predates `main`'s later commits.

- **Truncated-subcheck rise, not from this branch.** `validate_evidence` and `validate_plan_graph` have 665 failures in the baseline and 847 on `main`. The check compares truncated subchecks by their totals, so it will report a rise and exit 2 whatever branch lands. The proof: both subchecks were run on `origin/main` `15ab001892` and on this branch with their full failure lists, and diffed with the landing check's own keys. The result is **0 added and 0 removed**. Every evidence artifact this branch touches was already stale on `main` (storage-plan and Decision_Log shards and documents) or is in no evidence bundle (registry shards, contracts, fixtures).
- **Governance staleness on files this branch edits.** These rows exist on `main` and now name branch files:
  - `verify_spec_lock` `stale_hash` for `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`. The landing check recognizes these as staleness.
  - The readiness Spec Lock rows whose `required_path` is `scripts/pm-implementation-readiness.py` or `Plans/storage_value_registry.json`.
  - `event_authority_currentness_source_drift` for `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `Plans/Decision_Log.md`.

  The last two kinds are missing from the check's staleness list, so they print as blocking on-branch items. The coordinator classified the same rows as staleness for the storage-registry-repairs landing; they are the currentness drift the coordinator said to expect under the carve-out.
- **Readiness is not worse.** Its truncated total is 38 on `main` and on the branch, with an identical keyed set; the baseline has 79.
- **Measured prediction.** A landing baseline was recorded at `origin/main` `15ab001892` in a temporary detached sparse worktree, with `--record-baseline --allow-sparse` and a scratch `--baseline` file. `pm-landing-check.py --base 15ab001892` then ran on this branch against it, in the same sparse environment. Result:
  - **0 new failures, 0 grown buckets, 0 grown subchecks.**
  - Exit 2 comes only from 166 on-branch items that already exist on `main`. None was introduced here.
  - 150 are samples of the truncated `prd_planning_runtime_contracts` subcheck: `unresolved_local_ref`, `#/$defs/surface` and similar, in `Plans/home_layout_event_contracts.schema.json` and `Plans/home_layout_pending_receipt.schema.json`. They count as on-branch only because 1(b) edits those two files. The full standalone subcheck has 1,240 failures on `main` and 1,240 on the branch, with **0 added and 0 removed** under the landing check's keys (`prd-runtime-delta/` in the evidence set).
  - 14 are governance staleness: 3 currentness drift rows and 4 readiness Spec Lock rows, each reported by both run-gates and audit-governance.
  - 2 are `implementation_readiness_self_tests_failed`. It names the validator because this branch edits it, but its false checks are the three `case_l_verification_integration` checks that are false on `main` too; every storage check passes.

  The real landing runs in the full shared checkout against the committed baseline. There the sparse-cone noise disappears, and `main`'s own rises since `75bcda93bc` appear, as described above.
- **Tooling note.** With a `--baseline` path outside the repository, `pm-landing-check.py --record-baseline` writes the baseline and then crashes on its final message, which calls `baseline_path.relative_to(root)`. The file it wrote is complete. This matters only for scratch baselines like this one.
- **Reseal request:** see "Open items".

## Choices where canon was ambiguous

1. **One Decision Log entry with two items.** Both questions came from the same review, are Storage-owned and were decided together, so one entry keeps the owner citations single (DL-076). Each item still has the full DL-036 form.
2. **Where the durable token is defined.** `Plans/event_record_index_checkpoint.schema.json` is pinned by SHA-256 in 12 resource maps, so a `$defs/durable_read_token` there would have forced 12 unrelated re-pins. SP-278 instead defines the durable token in prose as an exact projection of the canonical definition, and each contract carries it locally, as the three goal_run consumer schemas already do with `DurableGenericToken`. The Browser reset oracle recomputes the projection from the canonical token and rejects a contract whose copy differs.
3. **What "stored" means for the new readiness rule.** The rule reports a `redb_snapshot_id` property only where a stored value could actually hold it: from the row's value schema root, through subschema keywords and local references. `retention_hold_record` carries an unreferenced whole-token definition under `$defs/read_token`, and that is not reported. For the SP-310 union rows the rule scans every definition reached through the realm conservatively, as the secret scan does; none contains the field today.
4. **The Home2 reader stays frozen.** `Plans/home_layout_pending_receipt_v2_reader.schema.json` "preserves the frozen external Home2 assertion-bearing schema and provenance", so its three embedded copies of the Home checkpoint keep the tenth field. It is not a registry row, and the SP-273 amendment says so. The Home3 receipt contract carries the current checkpoint definitions and was updated.
5. **The Browser binding record is unchanged.** `x-pm-event-authority-binding.generic_index_read_token_ref` still names the canonical token, because that is the live token the checkpoint adopts. The stored form is its projection, which the new `binding_failures` check ties to it.
6. **The fast-forward sentence names no command.** For the "reset back to `origin/main`" step, a shared checkout that holds other threads' uncommitted work needs `git reset --keep origin/main`; `--hard` would discard their work. The sentence was added as requested, without that detail. This report recommends it; it is not in the rule files.
7. **Test method name kept.** `test_existing_family_and_retention_census_is_unchanged` keeps its name. Its comment now says it pins the landed, recorded state.

## Open items, with owners

- **Reseal** (the designated Plans agent):
  - Spec Lock for `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`, all already stale on `main`.
  - A currentness edition for `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `Plans/Decision_Log.md`, whose drift rows already exist on `main`.
  - The storage-plan and Decision_Log evidence entries, already stale.
- **The landing baseline predates `main`'s own rises.** `reports/landing-checks/baseline.json` (recorded at `75bcda93bc`) has 665 `validate_evidence` and 665 `validate_plan_graph` failures; `main` has 847 of each. Every landing therefore reports a truncated-subcheck rise until the nightly refresh re-records it. Owner: the designated Plans agent's nightly run.
- **The dead whole-token definition in `retention_hold_record`.** Its `$defs/read_token`, like its source `Plans/storage_retention_hold_value.schema.json`, carries the ten-field token, and nothing references it. The owner may remove it or replace it with the projection. Owner: Storage, SP-288.
- **The landing check's staleness list** still lacks the readiness Spec Lock kinds and `event_authority_currentness_source_drift`; see the storage-registry-repairs report. Owner: landing-check tooling, for Jared.

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/storage-owner-closeout-20260924/`, listed in `MANIFEST.sha256` (90 files; SHA-256 `b098a2954bbcc4a1c4dc317c934b55eadbd1463e1a97bb248b991b0ec68cfc2f`).
- `before/`: branch-base check outputs, unittest runs and the fixture baseline.
- `after/`: the fixture harness and the stored-snapshot rejection check before the rebase.
- `after-rebase/`:
  - readiness on `15ab001892` and on the tip;
  - `verify-spec-lock` on both;
  - the shard check and index validation;
  - the Browser gate and the reset module report;
  - the fixture checks;
  - the eight named unittest modules.
- `evidence-delta/` and `evidence-delta-rebased/`: the full `validate-evidence` and `validate-plan-graph` lists on each side, `proof_diff.py` and `proof-result.txt` (both NO_DELTA).
- `prd-runtime-delta/`: the full `validate-prd-planning-runtime-contracts` lists on `15ab001892` and the tip (NO_DELTA).
- `compare/`:
  - the whole-suite runs on both sides;
  - the local landing baseline at `15ab001892`;
  - the tip's landing check against it, `landing-tip-vs-local-baseline.json`. Its plain-text rerun was stopped as redundant, so `landing-tip-vs-local-baseline.txt` is partial.
- `registry-history.json`: the per-commit census and row-change history of `Plans/storage_value_registry.json` that Task 2 is traced from.
- `scripts/`: every script used for the recipe check, the edits, the fixture harness, the history, the rebase and the comparisons.

Cost: this session only; no model calls beyond this agent; monetary attribution unavailable.
