# DCH-FIX3 — final fix round, 2026-11-04

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `eb4bac6e61d0faeb38540c7d5c041e5889a6029c`. Fix commit: `26fa366c5638a23685141bdd30cca8a46d4d7356`. Exact original maximum-array regression extension: `318444509707c627e6a4ca703c06371249c7c6dd`. The following report commit changes only the report and self-grade.

**Worker result: 17/17 prepared without admission; final independent review pending.** Every candidate moves from Astra-2's **8 PASS / 3 PARTIAL / 1 ABSENT** to the worker's **10 PASS / 1 PARTIAL retention / 1 ABSENT membership**. The two upgraded cells are consumers_checkpoints and positive_negative_oracles. No family is admitted or twelve-cell complete. Native execution remains NOT_RUN. `chat.thread_archived` stays manual only under DL-287. Stop stays separately unprepared: **0 PASS / 5 PARTIAL / 7 ABSENT**, unchanged.

## Review round 3: findings and responses

- **B1 — fixed (`26fa366c56`).** All seventeen `Plans/storage_value_registry.json` DCH checkpoint `value_schema` objects now exactly equal their selected standalone same-ID/version schemas, including every current/history identifier/digest pattern and retirement timestamp. Representative registry line: 123252; selected `Plans/dch_event_payloads/dch_chat_message_checkpoint.schema.json:95`. `scripts/pm_dch_events.py:347` requires exact equality; `:547` independently exercises both definitions with current and populated-history positives and LF negatives. The expanded direct probe rejects **357/357** LF mutations in **both** copies (21 per family), including the review's original 187. Each family's full-checker mutations separately restore unguarded registry patterns, inject payload LF and inject populated-history LF; all exit 1. Verify: `python3 scripts/pm_dch_events.py`, `python3 scripts/pm_dch_event_regressions.py --workers 4 --out <evidence>/full-checker-regressions.json` and `registry-schema-probe.json`.
- **B2 — fixed (`26fa366c56`).** `scripts/pm_dch_events.py:32` resolves complete schema-reference closure before fixture execution, independently of instance traversal. This covers payload/envelope/selected checkpoint/embedded registry schemas; local pointers, dynamic anchors, file references, optional/conditional/history branches, and unselected branches of every referenced file. Valid cyclic/local/file references remain accepted. Missing references produce structured failures, never a silently accepted empty-history branch. Each family has a populated-history positive and separate full-checker missing-ref negatives. The actual CLI with all seventeen history refs broken simultaneously exits **1**, `status=fail`, **34 closure failures**, with matching selected/embedded mutations so parity alone cannot catch it. ATS-305 at `Plans/Automated_Testing_System.md:7239` now requires **all ten** checks; `:7242` states registry parity and reference/history obligations. Verify with the regression command above and the retained `cli-schema-negative.py --root <checkout>` (expected exit 1).

No finding is disputed. No new product decision is taken. Standing check 10 additionally gains explicit retained-original lookup coverage in `scripts/pm_dch_events.py:95`: original bytes/edition and current source/access checks remain mandatory, while later lifecycle/worktree state does not redefine historical evidence. Withdrawn or forged events are refused. The witness is a static adapter, not a newly invented authoritative record.

## Every standing check, every prepared family

**P = pass. F = fixed in `26fa366c56`** (check 10 adds the required oracle coverage). No open candidate cell. Each row below has its own actual fixtures, selected/registered checkpoint pair, current/populated-history positives and full-checker negative mutations; no sibling pass is inferred. Every row has the same before/after twelve-cell grades stated above. Check 8 means the actual terminal outcome for the two test-result families and rejection of a fabricated exit field for the other fifteen.

| Family | 1 replay | 2 app key | 3 partition | 4 body | 5 LF | 6 retry | 7 source | 8 exit | 9 refs | 10 history | Baseline checks |
|---|---|---|---|---|---|---|---|---|---|---|---:|
| `bundle.selection_forward_blocked` | P | P | P | P | F | P | P | P | F | F | 493 |
| `bundle.selection_sent_to_chat` | P | P | P | P | F | P | P | P | F | F | 527 |
| `chat.message` | P | P | P | P | F | P | P | P | F | F | 509 |
| `chat.thread_archived` | P | P | P | P | F | P | P | P | F | F | 537 |
| `chat.thread_created` | P | P | P | P | F | P | P | P | F | F | 487 |
| `chat.thread_deleted` | P | P | P | P | F | P | P | P | F | F | 487 |
| `chat.thread_worktree_bound` | P | P | P | P | F | P | P | P | F | F | 485 |
| `chat.thread_worktree_create_failed` | P | P | P | P | F | P | P | P | F | F | 481 |
| `chat.thread_worktree_merge_failed` | P | P | P | P | F | P | P | P | F | F | 489 |
| `chat.thread_worktree_merged` | P | P | P | P | F | P | P | P | F | F | 493 |
| `chat.thread_worktree_pr_created` | P | P | P | P | F | P | P | P | F | F | 493 |
| `chat.thread_worktree_pr_failed` | P | P | P | P | F | P | P | P | F | F | 485 |
| `chat.thread_worktree_pre_merge_test_failed` | P | P | P | P | F | P | P | P | F | F | 561 |
| `chat.thread_worktree_pre_merge_test_passed` | P | P | P | P | F | P | P | P | F | F | 535 |
| `chat.thread_worktree_pre_merge_test_started` | P | P | P | P | F | P | P | P | F | F | 485 |
| `chat.thread_worktree_renamed` | P | P | P | P | F | P | P | P | F | F | 483 |
| `chat.thread_worktree_unbound` | P | P | P | P | F | P | P | P | F | F | 481 |

The machine-readable matrix is `standing-checks.json`; every cell names its individual full-checker runs. All runs invoke the **complete unfiltered checker with all seventeen families**, using in-memory input substitutions or explicitly restored defective oracle behavior. The exact maximum-array bodies are 17,014/17,005 bytes for chat.message and 33,654/33,645 bytes for bundle.selection_sent_to_chat; all four remain valid through their authorized reference positives and are refused inline. No repository input is changed by the runner; an exception is an unexpected failure, not a successful rejection.

| Check | Negative that catches it (applied separately to every family) | Full-checker result |
|---:|---|---|
| 1 | Replace current positives' replay policy with projector_replay_only; baseline also tests append and either/both retry records. | exit 1 |
| 2 | Replace the application key with the incompatible Project dch: recipe; baseline validates exact CV-366 lowercase UTF-8 hex. | exit 1 |
| 3 | Replace the encoded partition with raw Project text, updating body, envelope, event ID and key consistently. | exit 1 |
| 4 | Restore acceptance of >16,384-byte inline probes; physical byte-boundary negatives then fail. Also restore schema-valid maximum attachment/provenance bodies inline for the two applicable families and remove reference support. | exit 1 |
| 5 | Inject payload identifier LF, restore old registry patterns, and inject LF into a populated history token. Baseline independently probes every patterned field in both definitions. | exit 1 each |
| 6 | Restore whole-record retry comparison; the three independent and combined metadata-only positives fail. Baseline also negates every included semantic field and global event-ID integrity. | exit 1 |
| 7 | Cross outer/token/selection storage instances while retaining the source event; independently advance the source frontier without the candidate. | exit 1 each |
| 8 | Failed-test actual exit 0 / passed-test nonzero source; all other families get a fabricated exit_code=0 field. | exit 1 |
| 9 | Break exercised payload, unexercised history, missing-file, optional, conditional, selected-only, registered-only, external-document-hidden and dynamic-anchor references. Positive local/file/cyclic references prevent a reject-all implementation. | exit 1 for each negative; exit 0 for each positive |
| 10 | Restore live-revision gating of history; separately claim withdrawn or forged historical evidence is a valid positive. | exit 1 each |

## Earlier findings rerun at the fixed checker

| Earlier finding | Exact restored defect / runner case | Result |
|---|---|---|
| Sol F1 | `2_old_application_key`, all 17 application editions (including the subsequently prepared archive). | 17/17 exit 1 |
| Sol F2 | `3_raw_project_partition`, internally rekeyed, all 17 Project editions. | 17/17 exit 1 |
| Sol F3 | `F3_archive_stopped_again`; `F3_automatic_archive` with matching automatic source. | both exit 1 |
| First Astra B1 | `1_replay_only`, both writer editions of every family. | 17/17 exit 1 |
| First Astra B2 | `4_inline_size_guard_removed`, `B2_payload_reference_support_removed` for all 17; `B2_legal_large_inline_body` and `B2_original_review_maximum_arrays_inline` for chat.message and bundle.selection_sent_to_chat. | all 38 exit 1 |
| First Astra B3 | `6_whole_record_retry`, independent Storage metadata-only retries. | 17/17 exit 1 |
| First Astra B4 | `7_checkpoint_storage_mismatch`; `7_current_frontier_mismatch`. | all 34 exit 1 |
| First Astra B5 | `8_success_as_failure_or_fabricated_exit` for chat.thread_worktree_pre_merge_test_failed changes both actual outcome and payload to success exit 0. | exit 1; other families' outcome/fabricated-field cases also exit 1 |

## Stop — unchanged question for Jared

Which existing durable chat run or turn record, with which exact fields, must preserve whether Stop cancelled the model/tool/subagent work or timed out, and the time of that outcome? The current chat and Storage owners name no such record. If none exists, do you authorize defining a run/turn outcome record and its fields before preparing chat.response_stop_requested and retiring chat_run.cancel_requested, chat_run.cancelled and chat_run.cancel_timeout? The 3-second wait and saved-outcome queue barrier stay, including ACD-471's requirement that queued messages wait for a user action after Stop.

The prior DL-406 condition audit remains below as source history. Neither the three chat_run outcome names, the 3-second wait, the saved-outcome queue barrier nor ACD-471's user-action barrier is altered. No Stop record/schema/fixture is prepared and none of its outcomes is retired. The archive manual-only ruling is unchanged.

## Authority, scope, capacity and verification

All own ACD/CV/SP producer, identity, scope, replay, retention, custody and transition contracts were re-read. `DCH-binding-search.json` adds a separate round-3 search for each exact family across **930 live non-hidden owner/schema/registry files**, excluding shards, ledgers and bootstrap, and pins its own ACD/CV/SP passages. Existing SP-278 original source, SP-337 body/access/readback, own historical-lookup and current-state projection rules are reused. **New product bindings: none.** New witness fields are fixture data only. The DL-045/DL-076/DL-287 premises remain current; the only failed existing-record premise is the already documented Stop condition.

**IDs minted this round: none.** Retained lane IDs: ACD-610–626, CV-630–646, SP-610–626 and ATS-305 (52 existing IDs). Only ATS-305's owner prose/metadata changes in this round. No ACD/CV/SP owner text, event registry, Decision Log, admission, source retention/deletion choice, .gitignore, Spec Lock, auto_decisions, frozen validator or governance evidence is changed. No test file is edited; targeted discovery finds only the two DCH scripts. No pm-mail or subagents, landing lock or main push is used.

Generated shard changes belong only to **automated_testing_system** and **storage_value_registry**. The PlanUnit index changes only ATS-owned rows (77 other ATS rows change only their owner-document hash); acceptance rows change only ATS-305. No other owner's generated body/indexed unit changes. Fifteen ignored currentness-edition files were copied and SHA-256 matched before index generation. No generated file was hand-edited.

Initial capacity was **16 GB available RAM / 124 GB disk free**, above the **6 GB / 50 GB** stop thresholds. Before the final four-process test run: **15 GB / 109 GB**. Later measurement: **18 GB / 96 GB**. The detached sparse worktree is `~/pm-worktrees/DCH-fix3` from `~/src/PuppetMaster`, approximately **3.4 GB**; it is removed after the final report push. Ordinary checker processes, not delegated workers, run the mutation matrix.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | top-level pass; **8,511 checks**, all 17 families / 34 editions; no failures |
| `python3 scripts/pm_dch_event_regressions.py --workers 4 --out <evidence>/full-checker-regressions.json` | 0 | **465 full-checker runs**: 414 expected negative exits 1 and 51 valid-reference positive exits 0; zero unexpected outcomes. The 463-case runner was followed by two additive exact maximum-array cases using the same unchanged full checker |
| Retained `cli-schema-negative.py --root <checkout>` | 1 expected | Actual CLI, all 17 history refs broken together: status fail, 34 structured closure failures |
| Registry/selected schema probe | 0 | 17 exact object matches; current and real-history positives valid; 357 LF probes rejected by both copies |
| Schema/reference audit | 0 | All 34 standalone schemas meta-valid; complete closure succeeds; registry pairs audited separately |
| Self-grade citation audit | 0 | 18 rows / 216 cells / **425 exact citations**; Stop unchanged |
| `pm-shard-plans.py --generate` / `--check --config Plans/sharding_config.json` | 0 / 0 | top-level pass; 99 sources / 3,135 shards |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | parsed top-level status=pass; 7,473 PlanUnits |
| `pm-storage-profile-check.py` | 1 | Byte-identical round-2 baseline: 41 pre-existing errors |
| `pm-assistant-contract-check.py` | 1 | Same apply-2b results after excluding three changed source-hash values; errors and projects_refresh_static_failures empty |
| Scope, schema parity, canonical_text, index-owner and protected-path audits | 0 | Only this lane's intended paths/metadata change |
| `git diff --check` | 0 | No whitespace errors |

The prior 6,012-check claim was incomplete; Astra-2 correctly identified its untested registry and history-reference gaps. The new suite supplies the missing evidence. Native process/receipt, full-source coverage, CRC, source locks, redb/CAS, pack durability, custody and withdrawal execution remain **NOT_RUN**. No aggregate governance pass is claimed. Final independent review, RT policy assignment and later family-by-family admission remain integration work; Stop returns to Jared.

## Round 3 retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round3/`. Report, self-grade and binding search are copied to the parent DCH draft directory. Paths below are relative to that evidence directory and pins are SHA-256.

| Evidence | SHA-256 |
|---|---|
| `baseline-before.json` | `9ba6198821b7671c7e21e0e1b36bf776baecb56c64570993351a18557b4aaebe` |
| `dch-static.json` | `a977f088bfdcc06876a315eb0d2425c3e7680e2a76e79cb55deb223ce526ce8e` |
| `full-checker-regressions.json` | `f0ab64706590de84d5fa20446f9762663d4433dd0942d01f15163c709a2c94d2` |
| `maximum-array-regressions.json` | `c13273b0c8ab72339f1b3fce4a36d45e99242faa0b7f9304ce584a82f7e347ee` |
| `standing-checks.json` | `77d9d600bc008923093dfbc341d6b1e303927e29a84a2c6a7b5be313bf0d0086` |
| `registry-schema-probe.json` | `90e469b7e3af8fbd3d7f9cf64675384966bb17db272ea7920f8f65eca15ee941` |
| `cli-schema-negative.py` | `4b5e983fb84a6d285659fe2b4ab8272bb7fcdf03e55b035e5987e0417e8f2a1b` |
| `cli-schema-negative.json` | `1e8de2dcef8829968351e732bdf30b84d10eae59b3dda8d9df7091494b236aa2` |
| `schema-integrity.json` | `772ceae1ed9323939cb303a6bdfeb40e2a6ca52d7d3ebd96e4e89fecdd7bf0d3` |
| `scope-integrity.json` | `f30a2be530493d7713c17103f6580cc5c5b5a9bcd8c1784eb0814dac426d449c` |
| `grade-citation-check.json` | `299339d3cb2e2a25a1ffacb31f43508c16a5c0ab89c7b7e029e37ae52962c8ab` |
| `code-pins.json` | `d2f0ffe3a950ea05a67a42e8abc8d982c6f2e175b23a6a2b69234b131a1a8ea6` |
| `checks.json` | `11adebca982af5bc0402d4aa05898de5ea44660de23425f76bc039a34a8348fd` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `shard-generate.json` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.json` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `737f25ac16608ecdff2a285a3616cfbdb3071b5acec1f1dd2c9095a68cf082f8` |
| `index-validate.json` | `2e580386a8bb5596cb27a75d8b5729845dc754e341a9db7ab2425590ff326986` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `f9e42d4b5edc4391e9131309f794d975fa9f73427c45bda0d331f6a303fab62d` |

---

# Previous reports (historical; round 3 above supersedes preparation claims)

# DCH-APPLY — card 2b A / DL-406, 2026-11-04

Branch: `plans/ea-w2-chat-20261104`. Inspected head: `bdc257cc0852fdd094570f2d8390216a4487821c`. This is a report-only condition audit; all owner, schema, fixture, checker, registry and derived content stays at that head.

**Outcome: Stop is blocked on Jared; nothing for Stop is prepared or retired.** No existing authoritative chat run or turn record, with existing fields, can be named for cancellation-versus-timeout and its outcome time. Seventeen previously prepared families retain their self-grades (10 PASS / 1 PARTIAL retention / 1 ABSENT membership). Stop's separate twelve-cell assessment is **0 PASS / 5 PARTIAL / 7 ABSENT**, UNDISPOSITIONED, not prepared, unregistered; native execution NOT_RUN.

## Exact question for Jared

Which existing durable chat run or turn record, with which exact fields, must preserve whether Stop cancelled the model/tool/subagent work or timed out, and the time of that outcome? The current chat and Storage owners name no such record. If none exists, do you authorize defining a run/turn outcome record and its fields before preparing chat.response_stop_requested and retiring chat_run.cancel_requested, chat_run.cancelled and chat_run.cancel_timeout? The 3-second wait and saved-outcome queue barrier stay, including ACD-471's requirement that queued messages wait for a user action after Stop.

## Current-source evidence and DL-406 premise check

Card 2b A is read from `decision-answers/E-CARDS-1.as-presented-578a6774.md`, SHA-256 `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`. DL-406 is read from `origin/plans/ea-cards1-answers-20261104` at `b6332f391a7870bad5f01a29a7e9d080050dac27`, `Plans/Decision_Log.md:4566` and its PlanUnit at `:5176`. It explicitly requires an existing record and outcome fields before retirement; if none can be named, return to Jared. No Decision Log bytes are imported or edited. The approved action is accepted; its existing-record condition fails on today's inspected canon.

| Candidate / owner | Current finding |
|---|---|
| Chat section 4, `Plans/assistant-chat-design.md:275` | Names all three `chat_run.*` records and `cancel_grace_ms = 3000`, then a saved outcome before queued messages may advance. It names no durable run/turn record or outcome fields. These exact bytes remain unchanged. |
| Streaming reply ACD-470, `Plans/assistant-chat-design.md:26479` | Terminal reply states are `complete`, `stopped`, `steered`, `error`; the partial transcript is for display (`:26483`). `stopped` records that the user pressed Stop, without distinguishing cancellation completion versus timeout or naming an outcome timestamp. It cannot be used as proof of cancellation success. |
| Queue ACD-471, `Plans/assistant-chat-design.md:26556` | After Stop or error, the queue waits for a user Send / Send now / Edit / Remove; no automatic advance. This stricter existing rule and the saved-outcome barrier are preserved together. |
| Run baseline, `Plans/storage-plan.md:596`, `:16966`; `Plans/storage_value_registry.json:7591` | `run:<run_id>` is a retired compatibility alias. The row's only required field is `schema_version`; optional fields are `created_at_utc`, `updated_at_utc`. Its value schema is deferred; replay is explicitly migration-read-only (`:7615`). No cancellation outcome field exists, and `updated_at_utc` alone cannot preserve that outcome. Writes to aliases are forbidden (`Plans/storage-plan.md:16968`). |
| Attempt / thread inventories, `Plans/storage_value_registry.json:7851` and `worktree_lane_thread_families` | Deferred Executor attempt identity and thread/worktree/persona binding inventory; no chat stop-outcome fields. Neither provides an existing writable chat run/turn outcome record. |
| Focused thread detail, `Plans/shared_runtime_contracts.schema.json:1208`; `Plans/storage_value_registry.json:29156` | Closed derived projection: state is `cached`, `synchronizing`, `replaying`, `current`, `stale`, `failed`. Its timestamp is projection update time. Registry expressly forbids treating the projection as authority (`:29196`). Transcript refs do not create the missing original outcome. |
| Outbox, `Plans/shared_runtime_contracts.schema.json:1006`; `Plans/storage_value_registry.json:27895` | `state`, `terminal_reason_ref`, `terminal_at_utc` describe command delivery, not the model/tool/subagent stop result on a run/turn record. `cancelled` is an outbox state; `expired` / `terminal_unknown` cannot silently mean the 3-second cancellation timeout. Reclassifying it would violate the approved record condition. |
| ObservableWork, `Plans/full_thread_runtime_contracts.schema.json:728` and registry `observable_work_projection` | Current object is a projection with `work_state`, `result_receipt_ref`, `error_ref`, `observed_at`; no authoritative chat stop-outcome/time fields. Its old physical row is migration/import-only. A derived status cannot replace the missing original. |
| Executor run control, `Plans/storage_value_registry.json:108591` | Key binds storage instance / Project / Goal / Goal run. It is not an ordinary chat run/turn record; adopting it would invent a Goal binding and cannot cover ordinary or application chat turns. |
| Stop catalog, `Plans/UI_Command_Catalog.md:8581` | `cmd.chat.stop` accepts `thread_id`, optional `run_id` / `assistant_turn_id`, `stop_reason_code`, `idempotency_key`; result has optional `stopped_ref` and `resumable`. It names `chat.response_stop_requested`, but neither defines the referenced outcome record nor its fields. |

Search scope: the complete chat and Storage owners and storage value registry; chat, shared runtime, current Full Thread, runtime expansion and native Executor control schemas; the Stop catalog; a live Plans-wide exact-name/field search excluding generated shards/indexes, ledgers, migration/evidence outputs and copied historical workflow inputs. The receipt records all eight candidate registry rows, exact field rosters, five schema inventories, the command and its four hits, and SHA-256 pins for every primary owner/schema inspected. No sibling contract is borrowed. No new technical binding, record, field, feature, retention/deletion choice, ID, or owner conflict resolution is authored.

## Checks and scope

**Owner passages changed: none.** `chat_run.cancel_requested`, `chat_run.cancelled`, `chat_run.cancel_timeout`, the catalog request spelling, the 3-second wait and both queue constraints remain byte-identical. No registry append, admission, validator/checker edit, Spec Lock, `.evidence`, `.gitignore`, `auto_decisions.jsonl`, Decision Log, landing lock or `main` push. No pm-mail, subagents or test edits. Initial capacity: 109 GB disk free, 19 GB available RAM, above the 50 GB / 6 GB limits. The absent requested worktree was recreated detached/sparse at the supplied head from the local clone, after fetching origin.

Fifteen ignored currentness-edition files were copied from the shared checkout and SHA-256 matched before generation. Shard regeneration changed no bytes. Index regeneration changed only `generated_at_utc` in four aggregate reports; normalized objects were identical and those self-generated timestamp-only diffs were discarded. No document-specific derived file changed. All source and derived content remains at the inspected head. The pushed worktree is removed at completion.

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | 6,012 checks, 17 prepared families, no failures; Stop is not covered or prepared. |
| All eight standing checks | 0 | Fresh full-suite run: replay-only append/retry refusal; exact CV-366 application keys; encoded Project partitions; SP-337 payload size/reference path; exact-end regex/LF negatives; producer-only semantic retry; checkpoint/source joins; actual failure exit-code rejection. All 17 family counters match the recorded evidence. No Stop pass is claimed. |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | Regeneration and shard/path verification passed, no shard changes. |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | Both parsed top-level statuses: generate=pass, validate=pass. |
| Schema audit | 0 | 34 closed payload/checkpoint schema documents validated. |
| Grade/citation audit | 0 | 18 rows, 216 cells, 374 exact citations; Stop is graded blocked/unprepared. |
| Scope / derived-content audit | 0 | All source, protected and derived content identical; no new IDs. |
| `pm-storage-profile-check.py` | 1 | Byte-identical round-2 baseline, 41 pre-existing errors. |
| `pm-assistant-contract-check.py` | 1 | JSON exactly equals round-2 baseline, status `gaps_found`. |
| `git diff --check` | 0 | Pass. |

No new broader failure is introduced; no aggregate governance/native pass is claimed. This conditional task's remaining item is Jared's answer to the exact record question. Retention assignment, independent review and family admission for the original seventeen remain separate integration work.

## Apply-2b evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/apply-2b/`. Report, self-grade and check summary are also copied to the parent DCH draft directory. All pins below are SHA-256; logs and structured search receipts are retained because this report cites them.

| Evidence | SHA-256 |
|---|---|
| `QUESTION.md` | `2080266ecf7aabda0699a50a383a95984d4063faa44522d4e07713257612a925` |
| `DL-406.as-read.md` | `53434e4a2b34c1683840669e9bf9d3f4be827f193a3193f58b88966f39cd9850` |
| `stop-record-search.json` | `753ac840e836ca7d98a64f1379a7117042310fd0c694cb632a49da38d0613028` |
| `stop-record-search.log` | `259e103c2786ee780127eaa2b79c4006cc2960801bb0234e3029657ba644a9bb` |
| `currentness-sha256.json` | `c79bd5656ad4f994a7b47fe9e534b0dac085e530b38eceb5d7cceb80b69e9e3d` |
| `dch-static.json` | `9ba6198821b7671c7e21e0e1b36bf776baecb56c64570993351a18557b4aaebe` |
| `standing-checks.json` | `200f7c88f294616e4533cd7e0f90200533406164ed6308117d36b917f9b8dee7` |
| `shard-generate.log` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.log` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `37329fc1cf0abb5247e108a730befb26d7bdebf81213879729e171a7d52e665b` |
| `index-validate.json` | `9cf97f52f4c33b5783ddb4d5bbd1adc4a8af81ca8852864a859e37138fffe54a` |
| `schema-check.json` | `a6615af61412c4cbef0f504acf081e546172457e028dc1d562cb4e02cb547ec3` |
| `grade-citation-check.json` | `20081a4c0c64003dece089f34be8b8937905268e000c1a9e546434bf1184e030` |
| `scope-integrity.json` | `55ed67531f80466d523feb66f18054585d45c2923b5290238fd65aad804f3bfe` |
| `derived-scope.json` | `2d732dab92f476b62d0ff897cc02968d3097a9108fa6ac3c202b747d03258ae9` |
| `base-comparison.json` | `ad9f4374691f5fe6a1d41014e1d31d5c1e61aa6d2c83aae90d898f29a2ac1ac9` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `f991664b790faccb2674235e82f79c764c72b1df96432ae8e9307eaa01b80220` |
| `exit-codes.json` | `3dbea088b15f4958840c47be0cf94840a2d0eccf32b41ef414642fe460d732f7` |

---

# Prior DCH round 2 record (unchanged contract history)

Branch: `plans/ea-w2-chat-20261104`. Astra-reviewed head: `b3b8f054e169dc929789a4db9857885f7a2cf28c`. Fix contract commit: `1ef01512c78701cd9aae1b0d877115f2d80e0e4c`. The following report-only commit preserves those assessed contract bytes.

**Outcome:** all seventeen families are prepared without admission in the worker self-grade: ten PASS cells, PARTIAL retention and ABSENT membership each. Astra's starting verdict was 0/17 prepared. Independent re-review remains pending. Native execution remains NOT_RUN. No exclusion, new feature, retention choice, admission or `main` push is claimed. `chat.thread_archived` remains manual only under DL-287. The held Stop record/card and all its owner occurrences are unchanged.

## Review round 2: findings and responses

- **B1 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** Each CV-630–646 selects `dedupe_by_idempotency_key`; the contract rows and all 34 writer editions independently check it. `projector_replay_only` returns `replay_only_not_appendable` before dedupe for original, retry or both. Other unselected current policies are refused too. See `Plans/Contracts_V0.md:24478` and `scripts/pm_dch_events.py:95`, `:106`. Every family has append/retry negative cases. Full-checker restoration of all 34 replay-only positives exits 1 with 1,377 failures; separate compatibility-reader behavior is preserved.
- **B2 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** Every CV/SP family binding adopts SP-337; the contradictory “payload inline” selection is removed. See CV-631 at `Plans/Contracts_V0.md:24585` and `scripts/pm_dch_events.py:41`. The logical schema and 32 attachment / 64 provenance bounds remain. Actual canonical MessagePack bytes determine the 16,384-byte cap. Larger or separately governed bodies use empty inline payload plus the exact newly authored BLAKE3/size/media-type string selecting the existing payload-pack index key. The full body must resolve, validate, authorize, match original scope/instance/Computer/thread, and have durable pack/index/readback before acknowledgement/publication. Both editions of chat.message and bundle.selection_sent_to_chat exercise schema-valid 16,384-byte inline, rejected 16,385-byte inline, accepted reference counterparts and the review's maximum legal arrays. Every family also exercises the physical boundary and separately governed reference path, missing/changed/unauthorized/deleted/wrong-store/non-durable/wrong-size/type/ref evidence. Restored oversized inline positives fail the full checker (exit 1, 26 failures); deliberately removing reference support also fails (46 failures).
- **B3 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** The retry commitment uses exactly the EventRecord owner's 21 producer-semantic fields and RFC 8785/SHA-256. It excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; same-key/event-ID integrity is checked separately. All 34 editions include a combined metadata-only retry, three independent metadata-only retries and one mutation of every included semantic field. See `scripts/pm_dch_events.py:20`, `:106`. Restoring whole-record equality fails 136 positive retry checks in the full suite. No field omitted from the owner commitment was silently reclassified as semantic.
- **B4 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** All seventeen checkpoints now have the same UUID Storage instance as their actual matching fixture EventRecord; last event/sequence, real generic-key/JSON-pointer/dataset forms and domain key match. See `Plans/storage-plan.md:29495`, `Plans/dch_checkpoint_fixtures.json:1`, `scripts/pm_dch_events.py:155`. Independent synthetic resolved-root/source/index/publication witnesses are compared against all nine durable-token fields, current selected source and complete frontier token. Each family has separate outer/token/selection/source instance, key/ref, scope, event/sequence, dataset, publication/ref/revision and current-frontier/source negatives. Changing all nested instances or advancing every current frontier fails all seventeen checkpoint positives in the full checker. These witnesses model joins; native SP-278 full-source coverage, CRC, locks and redb atomicity remain NOT_RUN.
- **B5 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** ACD-622, CV-642 and the closed failed-test schema bind the actual original matching started EventRecord and terminal test outcome. See `Plans/assistant-chat-design.md:29821` and `scripts/pm_dch_events.py:128`. Ordinary failure requires the actual matching nonzero integer exit; 0 is refused even when both payload and outcome claim it. Existing W.9.3 timeout and process-error behavior uses explicit test_outcome with null exit status, and original error_ref for process errors. Passed events separately require an actual exit 0. Both editions cover nonzero/negative exit, timeout, process error, success refusal, original started-operation/scope/Computer/thread/worktree/command/strategy/duration mismatches and bad started-envelope edition. Restoring successful exit 0 in both failed-test positives fails the full checker (11 failures).

No finding is disputed or stopped for Jared. No new owner choice is required. Standing-check (5) additionally repaired every DCH identifier regex with an exact-end guard and trailing-LF negatives, including the HTTPS PR URL prefix gap found by the expanded suite. Closed non-exit families explicitly reject an added exit_code field.

## Round 2 family grades before and after

P=PASS, Pa=PARTIAL, C=CONFLICT, A=ABSENT. Before is Astra at the reviewed head; after is the worker at the fix commit. All after rows retain PARTIAL retention, ABSENT membership and native NOT_RUN. No family is twelve-cell complete or admitted.

| Family | Before (Astra) | After (self) | ACD / CV / SP |
|---|---|---|---|
| `bundle.selection_forward_blocked` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-610 / CV-630 / SP-610 |
| `bundle.selection_sent_to_chat` | 8 P / 2 Pa / 1 C / 1 A | 10 P / 1 Pa / 1 A | ACD-611 / CV-631 / SP-611 |
| `chat.message` | 8 P / 2 Pa / 1 C / 1 A | 10 P / 1 Pa / 1 A | ACD-612 / CV-632 / SP-612 |
| `chat.thread_archived` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-613 / CV-633 / SP-613 |
| `chat.thread_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-614 / CV-634 / SP-614 |
| `chat.thread_deleted` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-615 / CV-635 / SP-615 |
| `chat.thread_worktree_bound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-616 / CV-636 / SP-616 |
| `chat.thread_worktree_create_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-617 / CV-637 / SP-617 |
| `chat.thread_worktree_merge_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-618 / CV-638 / SP-618 |
| `chat.thread_worktree_merged` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-619 / CV-639 / SP-619 |
| `chat.thread_worktree_pr_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-620 / CV-640 / SP-620 |
| `chat.thread_worktree_pr_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-621 / CV-641 / SP-621 |
| `chat.thread_worktree_pre_merge_test_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-622 / CV-642 / SP-622 |
| `chat.thread_worktree_pre_merge_test_passed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-623 / CV-643 / SP-623 |
| `chat.thread_worktree_pre_merge_test_started` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-624 / CV-644 / SP-624 |
| `chat.thread_worktree_renamed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-625 / CV-645 / SP-625 |
| `chat.thread_worktree_unbound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-626 / CV-646 / SP-626 |

## Round 2 authority, search, scope and checks

`DCH-binding-search.json` adds an individual round-2 search for each of the seventeen families against 741 live non-generated/non-ledger/non-bootstrap owner/schema/registry files at the reviewed head. It records exact-family hits, source hashes and the missing reference binding before reuse of SP-337 and its existing payload_pack_index key. The reference string and test started/outcome fields are newly authored technical bindings under the unchanged DL-045 scope, not new behavior. Existing SP-236, SP-337, SP-278, CV-365/366, SP-286/CV-339 and W.9.2/W.9.3 remain the owners. No generic full-index, EventRecord or Stop schema is changed. Prior DL-045, DL-076 and DL-287 premise checks still hold; round 2 directly re-read the current envelope, nine-field durable-token, payload-store and Pass/failure/timeout/process-error clauses. No premise requires a new Jared decision. RT source policy assignment remains pending; no source keepalive/deletion exception is introduced.

Initial capacity was 119 GB disk free and 11 GB available RAM, above the 50 GB disk / 6 GB RAM stop limits. The final checkpoint was 104 GB / 13 GB. Used detached sparse `~/pm-worktrees/DCH-fix2` from the local clone. Fifteen currentness-edition files were copied and SHA-256 matched before index generation. Initial inbox/who reads occurred before the no-mail brief was loaded; no mailbox write or further mailbox use followed. No delegation, admission, registry append, Decision Log edit, governance seal, landing lock or main push occurred.

Shared prose changes are confined to CV-630–646, SP-610–626, ACD-622/623 and ATS-305; exact prose/canonical_text equality is verified. All owner bytes outside those units match the reviewed head. Derived shards change only for assistant-chat-design, contracts_v0, storage-plan and automated_testing_system. Aggregate PlanUnit/acceptance rows change only for those four docs. All protected paths, Stop occurrences and archive owner bytes are unchanged. No test file was edited.

**New IDs this round:** none. **Lane IDs retained:** ACD-610–626, CV-630–646, SP-610–626, ATS-305. No existing identifier is repurposed.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | 6,012 checks; 17 families / 34 editions / 17 checkpoint suites; per-family counters emitted |
| Full checker with each original defect restored in memory | 1 expected each | Replay-only, oversized inline, reference-path rejection, whole-record retry comparison, foreign checkpoint instance/current frontier and exit-0 failure regressions all caught |
| Full checker with old app keys / internally rekeyed raw Project partitions / identifier LF | 1 expected each | All three standing-check regressions caught; restored baseline exits 0 |
| All eight standing checks across all 17 families | 0 | standing-checks.json ties each cell to the full-suite family counters; failure exit checks are applied to the actual outcome families |
| Schema/owner/protected-scope and aggregate-index owner audits | 0 | Exact guarded schemas, canonical_text, unchanged protected bytes, four derived owners only |
| 204-cell self-grade citation check | 0 | Every disposition and cell citation matches the assessed contract bytes |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | 99 sources, 3,135 shards; no failures |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | Parsed top-level status=pass for both; 7,473 PlanUnits |
| `pm-storage-profile-check.py` | 1 | Byte-identical recorded baseline: 41 pre-existing errors |
| `pm-assistant-contract-check.py` | 1 | Same gaps_found/results after excluding changed source hashes; errors and projects_refresh_static_failures remain empty |
| `git diff --check` | 0 | Pass |

The static checker uses jsonschema, msgpack, blake3 and rfc8785 (versions pinned in the evidence). Native process, receipt, full-source coverage, CRC, source locks, redb/CAS, pack sync/readback, custody and withdrawal execution remain NOT_RUN. No aggregate governance pass is claimed. Independent re-review, RT assignment and later family-by-family admission remain integration work. The pushed fix worktree is removed at completion.

## Round 2 evidence

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round2/`. Files below are retained; pins are SHA-256. Current report, self-grade and binding search are copied to the parent DCH draft directory. Scratch helpers are removed.

| Evidence | SHA-256 |
|---|---|
| `dch-static.json` | `9ba6198821b7671c7e21e0e1b36bf776baecb56c64570993351a18557b4aaebe` |
| `full-checker-regressions.json` | `3954fe29ebcf96ca41e07b527955e3e9ef6ac0a87c18469e6ae55dfdde076c7b` |
| `standing-checks.json` | `d9b881c2a00051c92db35a4e0eab08442245784cbe85bb2f986388c6312b4f55` |
| `scope-integrity.json` | `ec7d9371225604b6ccebae042f4d1a4f54bca3148bd35ec3ead375b2a180117e` |
| `index-owner-scope.json` | `c531cd196c188102039d75b8a4f819e9f11d2e1f44d38d6db472d031e805c4e5` |
| `grade-citation-check.json` | `765f381843209df60bd4b688fe32d065c251740698b105853e7ffb0b73e0b702` |
| `base-comparison.json` | `e9543d594f3a80a614b82c33dde48200e621914e4998e244ea75ffd37e2e0fe5` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `dependencies.json` | `4e9da5b0ce2a91d7ae50fb28b62e7ab171c40f1972e70690d764b7ec9b460400` |
| `shard-generate.log` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.log` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `c76621a09375cea17cffabb6cd76babc1c7f4337da0c26cb13bd4b9b5368c79d` |
| `index-validate.json` | `f9320de424a3294c0dd97bb8e97ee5e259420796b7060b827370e47ef0622aa3` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `f991664b790faccb2674235e82f79c764c72b1df96432ae8e9307eaa01b80220` |

---

# Prior round 1 record (historical; superseded by round 2 below)

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `2cc5f4246638ee4367d6ab14f3f6fceadc36ac6e`. Fix contract commit: `2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`. This report and its self-grade follow in a report-only commit.

**Outcome:** seventeen families prepared without admission; no archive product stop and no exclusions. Every family has ten PASS cells, PARTIAL retention and ABSENT membership. This is the worker's post-fix assessment; independent re-review is pending. Native execution remains NOT_RUN. No admission, event registry append, Decision Log entry, governance seal or `main` push occurred. The held `chat.response_stop_requested` record/card is untouched.

## Review round 1: findings and responses

- **F1 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** Each of the sixteen affected ACD/CV pairs explicitly selects the existing CV-366 application key: `application@1:` plus lowercase hex of exact UTF-8 `scope.server_id`, colon, and lowercase hex of the original `operation_id`. `owner_operation_id` is this original source operation, frozen before effect; no additional optional effect component is defined. Original Server/Computer/thread/source joins remain mandatory. The separate Project `dch:` key and Storage lifetime tuple remain explicit. Representative owner: `Plans/Contracts_V0.md:24474` (CV-630); the self-grade cites each family's own units. All seventeen application records now conform, including the new archive record. Same-operation/same-semantics returns original evidence, changed semantics conflicts, and unavailable dedupe refuses. Verify with `python3 scripts/pm_dch_events.py`; deliberately restoring every old application key makes the full checker fail.
- **F2 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** All Project positives and EventRecord payloads now bind `p1` to `project~cDE`. Dependent event IDs and Project keys were recomputed. `scripts/pm_dch_events.py:21` checks both strict decode equality to exact UTF-8 Project identity and canonical unpadded encode equality, independently of JSON Schema and envelope matching. Every Project edition includes valid and mismatched punctuation/Unicode cases, composed/decomposed distinctions, raw-ID, padding, invalid UTF-8 and noncanonical pad-bit negatives. Even a wrong partition with a recomputed matching event ID/key/envelope is rejected. Verify with the full checker; restoring `project~p1` makes it fail.
- **F3 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** Verified the current accepted text directly: DL-287 says “No chat auto-archives” (`Plans/Decision_Log.md:20343`); DL-280 gives approved recommendations and later rulings precedence (`Plans/Decision_Log.md:19967`). ACD-071 applies shared lifecycle scope (`Plans/assistant-chat-design.md:7024`) and ACD-508 says archive is never automatic (`Plans/assistant-chat-design.md:28766`). There is no Project exception. The two stale lifecycle trigger rows (`Plans/assistant-chat-design.md:1122`, `:1123`) now allow manual archive only. New ACD-613 at `Plans/assistant-chat-design.md:30157`, CV-633 at `Plans/Contracts_V0.md:25607`, and SP-613 at `Plans/storage-plan.md:31666` prepare this exact family with closed Project/application payloads, original-source joins, receipt ordering, concrete reader/projector/checkpoint, recovery/withdrawal and positive/negative oracles. The existing cataloged `cmd.chat.archive` action (`Plans/UI_Command_Catalog.md:730`) reaches the lifecycle owner interface `cmd.chat.thread.archive`; no new command is registered. Existing selected-thread/no-active-run guards, active/suspended predecessor, revision CAS/readback, stable lineage/folder/worktree, and current-state/tombstone fences remain. Retention assignment stays explicitly pending RT. Verify with the full checker and archive source/transition cases. No Jared question remains on automatic archive.

No findings are disputed or stopped for Jared. No notes require an integration change outside this lane.

## Per-family grades before and after

Before is the independent Sol review at the reviewed head, which supersedes the original overclaimed self-grade. P=PASS, Pa=PARTIAL, C=CONFLICT, A=ABSENT. After is the worker self-grade of the fix commit. No row is a twelve-cell complete/admitted family while membership and retention remain open.

| Family | Before (review) | After (self) | Units ACD / CV / SP |
|---|---|---|---|
| `bundle.selection_forward_blocked` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-610 / CV-630 / SP-610 |
| `bundle.selection_sent_to_chat` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-611 / CV-631 / SP-611 |
| `chat.message` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-612 / CV-632 / SP-612 |
| `chat.thread_archived` | 3 Pa / 9 A | 10 P / 1 Pa retention / 1 A membership | ACD-613 / CV-633 / SP-613 |
| `chat.thread_created` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-614 / CV-634 / SP-614 |
| `chat.thread_deleted` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-615 / CV-635 / SP-615 |
| `chat.thread_worktree_bound` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-616 / CV-636 / SP-616 |
| `chat.thread_worktree_create_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-617 / CV-637 / SP-617 |
| `chat.thread_worktree_merge_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-618 / CV-638 / SP-618 |
| `chat.thread_worktree_merged` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-619 / CV-639 / SP-619 |
| `chat.thread_worktree_pr_created` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-620 / CV-640 / SP-620 |
| `chat.thread_worktree_pr_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-621 / CV-641 / SP-621 |
| `chat.thread_worktree_pre_merge_test_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-622 / CV-642 / SP-622 |
| `chat.thread_worktree_pre_merge_test_passed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-623 / CV-643 / SP-623 |
| `chat.thread_worktree_pre_merge_test_started` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-624 / CV-644 / SP-624 |
| `chat.thread_worktree_renamed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-625 / CV-645 / SP-625 |
| `chat.thread_worktree_unbound` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-626 / CV-646 / SP-626 |

## Binding searches and premise checks

`DCH-binding-search.json` retains the initial per-family lineage and adds a fresh `review_round_1` search for every exact family against the immutable reviewed head: 928 live owner/schema/registry files, excluding hidden/generated/bootstrap/ledger material. Each row records exact hits, paths, lines, file hashes, existing CV-365/366 adoption and explicit negative evidence. For the sixteen already drafted rows, original event_id, producer, readers, domain projector/checkpoint and withdrawal bindings are retained; the incompatible application key is removed. No sibling is evidence for another family's binding.

Archive's own search found existing lifecycle/name mentions and generic SP-278/SP-286, but no complete archive payload/reader/domain projector/checkpoint/withdrawal binding. Its new owner contract explicitly authors `reader.chat.chat_thread_archived@1.0.0`, `projector.chat.chat_thread_archived@1.0.0`, `projector.checkpoint.dch.chat_thread_archived.v1:{storage_instance_id}:{scope_partition}`, stored family `dch_chat_thread_archived_checkpoint`, and schema `Plans/dch_event_payloads/dch_chat_thread_archived_checkpoint.schema.json` (`pm.storage_value.dch_chat_thread_archived_checkpoint.v1`, 1.0.0). Its closed payload editions are `pm.dch_event.chat_thread_archived.project.v1` and `pm.dch_event.chat_thread_archived.application.v1` in `Plans/dch_event_payloads/chat_thread_archived.schema.json`. These are newly authored technical bindings under DL-045, for manual behavior already decided. SP-613 separately adopts the existing generic `projector.storage.event_record_index@1.0.0`, `event_record_index_checkpoint.v1:{storage_instance_id}` and nine-field SP-278/DL-076 token; no persisted redb_snapshot_id. The derived value has a registered profile and existing RP-PROJECTION-3GEN policy, source-order/CAS/shadow publication, coherent rebuild and withdrawal fencing.

- **DL-045:** the current exact 285-family table still includes all seventeen names (`Plans/Decision_Log.md:603`); the bounded technical-authoring scope and reuse-first requirement remain (`:564–566`). No feature or retention choice is made.
- **CV-365/366:** the current scope/key owner clauses at `Plans/Contracts_V0.md:24018` and `:24099` still apply. The old DCH replacement key and invalid positive partitions failed this premise check and are corrected.
- **DL-280/287 and ACD-071/508:** the former archive product question was based on obsolete trigger wording. Direct inspection establishes manual-only archive for Project and application chats; no conflicting accepted owner choice remains.
- **DL-076:** current SP-278 still requires the durable nine-field token; archive adopts it explicitly and its checkpoint negatives reject redb_snapshot_id.
- **Retention:** all source policy objects stay PENDING_RETENTION_DECISION for RT; chat.message retains its existing Case L-3 Chat content class binding (thread lifetime, 250,000/thread linked successor). All seventeen derived checkpoints adopt existing RP-PROJECTION-3GEN and its three-generation/604800-second eligible-retired bound with current/staged/hold/live-ref protection. Archive authorizes no expiry or deletion. Existing deletion semantics and the held Stop card remain unchanged.

## Scope, IDs and checks

Initial capacity: 17 GB available RAM and 125 GB free disk, above the 6 GB/50 GB hard limits. Used detached sparse `~/pm-worktrees/DCH-fix1` from the local clone at the named branch head. Fifteen ignored currentness-edition files were copied from the shared source and SHA-256 matched before index generation. No pm-mail, subagent, admission, frozen-validator edit or governance operation occurred.

Shared changes: existing lane ACD-610–612/614–626 and CV-630–632/634–646 identity prose and matching canonical_text; two old ACD lifecycle table cells; new ACD-613/CV-633/SP-613 appended units; ATS-305 oracle coverage; exactly one appended storage checkpoint row and one profile. Existing Storage units and registry rows/profiles are preserved. The only regenerated shard owners are assistant-chat-design, contracts_v0, storage-plan, automated_testing_system and storage_value_registry. Schema, fixture, checker and report companions remain inside lane scope; no test file was edited.

**New IDs this round:** ACD-613, CV-633, SP-613. Scanned 500 fetched origin refs / 145 distinct owner blobs; no collision. **Total lane IDs:** ACD-610–626, CV-630–646, SP-610–626 and ATS-305. No other IDs minted.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | 2,209 checks, 34 payload editions/records and 17 checkpoint suites |
| Full checker with original defects deliberately restored in memory | 1 / 1 expected | Rejects old application keys and invalid Project partitions; repository inputs unchanged |
| JSON/Schema/owner integrity | 0 | 34 schemas, full storage registry schema, 51 exact prose/canonical_text pairs |
| Per-family self-grade citation check | 0 | 204 cells and all disposition/cell citations match current bytes |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | 99 sources, 3,135 shards verified; only five edited source owners changed |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | Both top-level status=pass; runtime certification remains blocked |
| `pm-storage-profile-check.py` | 1 | Identical 41 baseline errors; no new error |
| `pm-assistant-contract-check.py` | 1 | Same gaps_found baseline; errors and projects_refresh_static_failures remain empty |
| Origin ID / source-scope audits | 0 / 0 | No collisions, protected artifacts/Stop preserved |
| `git diff --check` | 0 | Pass |

No aggregate governance/native pass or admission is claimed. RT assignment, independent review and later integration/admission remain with the lead. The required fix worktree is removed after all pushes.

## Evidence

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round1/`. Paths below are relative to that directory; each pin is SHA-256. The report, self-grade and updated binding search are also copied to the parent DCH draft directory.

| Evidence | SHA-256 |
|---|---|
| `dch-static.json` | `eb09b0ffab853d8441c47b835554cb9117276b8089cb31f544f9b8e20fe17461` |
| `original-defect-regressions.json` | `edf0c7e006d8e5a30a0e8f03529a964db8cd46d27a81a48186a4e84233712535` |
| `integrity-results.json` | `3636a55d86390b96c4c3ebbe001fc5a3a10f87e355c1af8852e66fad6ef102f4` |
| `grade-citation-check.json` | `d2ef5487a20d0c0a0e35ed66f51080c910de0d6281d42a17fea16246458c61d2` |
| `scope-audit.json` | `7fd561fef7c55acc124c60ad66285791c3019a428bb3da9c60e1e65119e4ed9a` |
| `derived-scope.json` | `6525af00f82b120f628ed1a4371776249b097f80ec432a72a2117f1acf206ec9` |
| `id-scan.json` | `9a8720683be4aad9e54c4a195bbdc3e63acfebf849d659cbaf530d766aaa4b61` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `base-comparison.json` | `4caefa8dea08a4ecb19844f5d0ba5d463fea0668a68b9ced4394e371d9538abd` |
| `shard-generate.log` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.log` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.log` | `d031f5b1bfa46765866e3b51502a4cd804716695bf3fed95ebfd149ce1e1b7c8` |
| `index-validate.json` | `7d71a3b5614d6c0361c250b999829ddd23d7f5d6a2f75c0cf14edd9c8feeb720` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `8a541e973fc9979fa6396c54fd0fef531c84d7e468c4f9f424f33332a1c31b48` |
| `exit-codes.json` | `7ca33d6392ea974542b54a4adf9b50965748162e02b5af99e6463467e1071647` |
