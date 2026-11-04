# Storage retention binding rebuilt on main, 2026-11-04 (Event Authority stream E, lane B2)

Branch `plans/ea-storage-retention-20261104`, cut from `origin/main` `be4766513f` (the 2026-11-04 snapshot and baseline refresh). It is pushed and not landed; a landing hold is in force. It rebuilds `origin/plans/ea-storage-retention-20260925` (tip `7401f10257`, 14 commits over base `63cf2cb97f`), the reviewed Storage retention owner edit for Event Authority batch 2, which never landed. Its blind review is `/mnt/Cursor/PM-Experiments/review-ea-storage-retention-20260925/` (cycle 1 `REVIEW.md`: SR-01 blocking, SR-02 should fix, five notes; cycle 2 `RECHECK.md`: landing-ready, no finding).

`main` moved about 3,700 commits past the September base, including the Storage canon program (DL-270 and later), the projects and settings refresh (DL-280 to DL-299, SP-337 to SP-353) and the 2026-11-04 Event Authority checkpoint (DL-300). The rebuild re-applies the September intent, after its review repairs, to today's text. It does not cherry-pick: each change is written against today's canon, every citation is re-pinned to today's lines and hashes, and every place where today's canon says something the September text did not know is recorded below (section 2).

What the branch writes, as in September:
- DL-083 and DL-089: the two application-wide count buckets under `RP-OPERATIONAL-2555D@1.0.0`, `app:storage_operational` and `app:platform_capability`, counted apart, in SP-291's aggregate custody text;
- DL-084 and DL-092: kept as long as the chat exists, after the DL-045 reuse check, with one materialized policy object `RP-CHAT-THREAD-LIFETIME@1.0.0` for the Chat content class (DL-047's `RP-GOAL-THREAD-LIFETIME` is not reused);
- DL-085 and DL-086: the Case L-3 assignments for the board records and the three orchestrator diagnostics;
- the v2-current review's R2-01 wording note on the SP-266 successor subsection;
- the 25 J248 retention cells moved from `FAIL` to `PASS` on that owner text, under the host's 2026-09-25 confirmation.

It registers, admits and retires nothing. It changes no event family registry row, DL-077 admission record, validator logic, receipt, Decision Log entry, Spec Lock, evidence file, `.gitignore` or procedure count. It mints no plan id. One retention policy object is added, the only one DL-092 allows.

## 1. What changed against September, and why

| September commit | Today's commit | Surface (lines at the tip) | Same as September | Different from September, and why |
|---|---|---|---|---|
| `34998368f3` R2-01 | `b8dcee17cd` | `Plans/storage-plan.md:20208` | The same words: "the 2026-09-23 conditional target alone granted none of them." | Only the line (20022 then). The sentence was unchanged on `main`. |
| `306b9e30f2` + SR-01 `73883f479a` + SR-06 `b2397450e5` | `d22e1ff73a` | SP-291 custody paragraph `:23803`; new subsection "Application-wide count buckets under the operational policy (DL-083, DL-089)" `:23805-23825`; SP-291 PlanUnit `depends_on` `:23878`, acceptance criterion `:23888` (SP-291-A008), `source_lineage`, negative constraint `:23903`; registry `boot_recovery_control.retention_compaction` `Plans/storage_value_registry.json:70496` | The custody sentence and the criterion in SR-01's words; the buckets, assignment, count and overflow, boundary; DL-045 contract label; the PlanUnit edits; the registry prose | **SR-06's search sentence is re-run on today's canon** (section 2.3). September found "the only application-scope count text was SP-291's seam sentence and the matching `boot_recovery_control` prose". Today there is more: the projects refresh's application-family bound. The sentence now names it and says why it does not cover these families. "Until 2026-09-25" reads "Until 2026-11-04". A bucket name is also "not ... an application storage key". |
| `0d624161eb` | `59e68d0650` | Reuse check `:17423`, cap and successor `:17425`; policy object `Plans/storage_value_registry.json:558`; census `:533`; `scripts/pm-implementation-readiness.py`; `tests/test_pm_onboarding_phases.py` | The reuse decision and its reasons; the policy object's values byte for byte; the cap, successor and deletion rule; the retention-policy count 27 to 28 in the script and the test | **The reuse check states today's other uses of `RP-GOAL-THREAD-LIFETIME`** (section 2.2). **The cap paragraph says the per-thread count is the same in an application chat** (DL-292) and is not an SP-349 counterpart bucket. **The census line states the current pin** (section 2.1). |
| `2d2562fe23` + SR-03 `4066d01cb2` + SR-07 `c1eed503c9` | `a666b3aeed` | DL-084 `:17427`, DL-085 `:17429`, DL-086 `:17431`, DL-092 `:17433` | The four assignments in DL-075's form; SR-07's 19 names on the DL-084 line; SR-03's words on the coordination-family half of DL-085 | **DL-085:** board text is inline up to 16 KiB and above that an SP-337 payload reference (OSI-299, DL-270); board records of an application chat fall within SP-351's application bound, and SP-351 already gives `crew_board_message_application` the same policy (section 2.4). **DL-092:** application chats keep the same lifetime (DL-292); "stay open" for the run, transcript, proposal and finding records is replaced, because SP-351 now names a policy for three of their application editions (section 2.5). |
| `1aae02ac37` + SR-02 `f7efc4f519` | `fa84affa02` | 25 row files, both ledgers, `reports/event-authority-20260911/step-09-retention-binding-application-20261104.json` | The cells, notes, appended citations and rationale passage. Normalized for the owner line numbers, the application time and the record path, every row equals the September tip row, and every census ledger line equals the September tip line | One application step instead of two: the rationale carries SR-02's sentence from the start, and the record carries `host_confirmation` from the start. A new record path (`...-20261104.json`) and a `rebuild_of` field. Campaign count `1 registered, 15 excluded, 0 carded, 236 remaining` (September: 0 and 237; `coordination.agent_registered` landed since). |
| `c8afc7569e`, `e2d02aab4a`, `6f4daff26f`, `7401f10257` (branch report) | this report | `reports/event-authority-20260911/step-09-storage-retention-20261104.md` | SR-04 and SR-05 stay open items, in the reviewer's words (section 6) | The September report `storage-retention-binding-20260925.md` is not carried over: its citations are September lines. It stays readable on the old branch. |

The four authored files, against `be4766513f`:

| File | SHA-256 before | SHA-256 after |
|---|---|---|
| `Plans/storage-plan.md` (+42/-6) | `b5c25cb5b5ce1aa48455af1e77ee36f555191c9355e1ed1d3909310ee14e35db` | `ca2e7162263b2f1e0c4f771d15d984f05adc4bc4db044f819033c70597ded32b` |
| `Plans/storage_value_registry.json` (+17/-1) | `65bec3424aa40235b35f272539c9e423972f5f5deeebe33bae22a5bae3a2de2a` | `c52b6172362a34c10a4d23b9900e0cdb68831c97849f42c3b805e07c2c72bf87` |
| `scripts/pm-implementation-readiness.py` (+5/-1) | `a5df08b320d35d0fab11d1f56b1760bb922b904af73457d67dd536e999ae84aa` | `53088b669262424e8c533f9d9f5e7a7cee547c087cd8147dac3af377b34a2501` |
| `tests/test_pm_onboarding_phases.py` (+4/-1) | `d361321ea7de5dcc4b939eb6a59dad6ad1f2ddb420d97cca2486591163381ec2` | `cc1cceafbddd796fc5df0c762fbb6564283728d18b6fb9cc7147b1aa82bd2184` |

The application record is `3959e9a6b1fe94c74d93226f347dad34f64396f787ee61412bfc0830c739706e`. Derived files: `Plans/_shards/storage-plan` (91 files), `Plans/_shards/storage_value_registry` (631 files; `628-lines-125218-125376.md` becomes `628-lines-125218-125392.md`) and `Plans/.plan_index` (6 files). No other document's shards changed at any of the four Plans commits. PlanUnits stay at 7,421 and acceptance units at 29,932.

## 2. Where today's canon differs, and what the rebuild did

No Decision Log entry contradicts DL-083 to DL-092. DL-083 to DL-091 carry no supersession note, and no later entry or owner document names them, except one: DL-092 is "Superseded in part by DL-292 (2026-11-03)", which adds application chats and leaves "the chat-lifetime/deletion/hold policy ... unchanged". None of today's owner text already writes any of these assignments: `RP-CHAT-THREAD-LIFETIME`, `app:storage_operational` and `app:platform_capability` occur nowhere on `main`, and the SP-291 seam sentence, the `boot_recovery_control` prose and the 25 rows are byte-identical to the September base. So nothing was stopped. The items below are places where today's canon knows more than September's text did. Each is applied as stated and marked for the reviewer; items 2.3, 2.4 and 2.5 also carry an open question (section 6).

### 2.1 The census line had not followed later re-pins

On `main`, section 2.3.1's census line still read "The 2026-09-25 pin is 294 families and 27 retention policies: 274 materialized, 19 deferred ... 40 tier-0 ... 3 migration-only", while `scripts/pm-implementation-readiness.py` already pins 344 families, 320/23/1 and 61/273/10 (re-pins of 2026-09-27 to 2026-11-04, recorded only in the script). September's edit kept 294 and wrote 28; today that pair would be false. The line now states the current pin, 344 families and 28 retention policies with the script's status and tier counts, and says the 2026-09-25 pin moved through the script's recorded re-pins and the one policy this branch adds. The family, status and tier numbers are the ones `main` already enforces; nothing else in the line changes. **Reviewer:** this is the only edit that restates numbers this branch did not change.

### 2.2 `RP-GOAL-THREAD-LIFETIME` now has more uses

September's reuse check rested on the object's owner text, "DL-047 lifetime and deletion" under SP-287, which is unchanged (`Plans/storage-plan.md:22392`). Since then the object has gained uses: later Goal sections give it to update input content and the Stop and binding controls, SP-351 to the application editions of those Goal records, and SP-349 to the application chat's place and folder binding records (`chat_place_application` is in the registry; the SP-349 table also names `chat_folder_binding_application`). The reuse check now says so, and that none of those roles is the Chat content class or carries its count rule. The decisive reason is unchanged: the object has no count cap ("no imported 250,000-message Goal-revision cap"), while PD-L005-02 caps chat content at 250,000 per thread with a linked successor. The conclusion, `RP-CHAT-THREAD-LIFETIME@1.0.0`, is unchanged.

### 2.3 Application-family buckets of the projects refresh (SR-06's search)

The September SR-06 sentence claimed that the only application-scope count text was SP-291's seam sentence and the matching registry prose. Re-run on today's tree (whole `storage-plan.md`, the registry and its schema, the event family registry and `Contracts_V0.md`; evidence `dl045-search-20261104.txt`), the search also finds:
- SP-349: "One app Server-wide counterpart bucket per family supplies the same limits, budget/TTL/retention/holds and backup classification as the Project bucket, not a reset per chat";
- SP-274, SP-275 and SP-285: "the same shared 2,048 app bucket" for application restore points;
- SP-351: "The app bound is one Server counterpart bucket, not one per chat" for application Goal, Crew and coordination records.

Those rules govern the `*_application` storage families of SP-345's app-data root, whose key map "is separate from EventRecord's unchanged `app` partition and `project~` encoding" (`Plans/storage-plan.md:29115`, `29309`, `29425`). None names `storage.boot_recovery`, `storage.recovery_applied`, `storage.compaction_lifecycle_changed`, `platform.capability_evaluated` or `boot_recovery_control`, none of which has an application counterpart family. The sentence now says this. DL-083's single shared bucket for three families therefore does not collide with SP-349's "one ... bucket per family", which covers other records. **Open question Q1** asks the host to confirm that reading.

### 2.4 Board messages: 16 KiB inline, application chats, `crew_board_message_application`

Three facts are new since September and are stated in the DL-085 assignment:
- DL-270 amended OSI-299: `crew.board_message_posted` carries at most 16 KiB of inline content, and longer bodies are SP-337 payloads the record references. SP-337 payloads are reference-counted and their collection honours holds, so the text kept "for that period" includes such a payload.
- DL-292 allows Crew in an application chat. SP-351 binds application coordination events to `RP-COORDINATION-180D` within "one Server counterpart bucket, not one per chat". The assignment says that board records of an application chat fall within that bound instead of a Project bucket. **Open question Q1** covers this reading too.
- SP-351 already gives `crew_board_message_application`, the stored board message's application edition, `RP-COORDINATION-180D`, which agrees with DL-085.

The coordination-family half of DL-085 (SR-03's words) is unchanged. `coordination_event_records` still has the eight key shapes and the content rule that September quoted.

### 2.5 Collaborative records: DL-292, and SP-351's runtime policy

DL-292 supersedes DL-092 in part: collaboration history also belongs to application chats, with the lifetime unchanged. The DL-092 assignment now says the lifetime holds in an application chat as in a Project chat.

September wrote "The run, transcript message, proposal and finding records are not assigned here and stay open." DL-092 itself says their lifetime "is not set here and stays open". Today SP-351 gives the application editions `collaboration_run_application`, `collaboration_participant_application` and `collaboration_transcript_application` `RP-RUNTIME-365D`. Their Project counterparts have no registry family, and no Decision Log entry names that retention. The sentence now says that DL-092 does not decide their lifetime, and that SP-351's choice for those application editions is neither changed nor relied on here. This branch does not decide whether SP-351 settled what DL-092 left to Jared. **Open question Q2.**

### 2.6 Re-pinned citations

The new binding citations this branch appends to the rows, and the application record's anchors, cite lines at the branch tip. Citation-check entries the rows and both ledgers already carried from earlier applications are history: they are kept as written and some now point at moved or blank lines (for example `Plans/storage-plan.md:17269`, see the table). Every citation the September branch carried moved as follows:

| What | September (base `63cf2cb97f` or its tip) | Today (tip) |
|---|---|---|
| Census line, section 2.3.1 | 523 | 533 |
| DL-075's runtime-artifact line | 17280 | 17421 |
| Reuse check / cap and successor | 17282 / 17284 | 17423 / 17425 |
| DL-084 / DL-085 / DL-086 / DL-092 assignments | 17286 / 17288 / 17290 / 17292 | 17427 / 17429 / 17431 / 17433 |
| Case L-3 class table (first row) / Chat content row | 17269 / 17272 | 17409 / 17412. The rows' earlier `citations_checked` entry `Plans/storage-plan.md:17269`, written by the batch 2 application on `main`, now points at a blank line; it is history and is left as written |
| R2-01, SP-266 successor | 20022 | 20208 |
| SP-291 custody paragraph | 23604 (seam sentence at base 23592) | 23803 (seam sentence on `main` at 23791) |
| Application-wide buckets subsection | 23606-23626 | 23805-23825 |
| Boot aggregate controls bucket sentence (SR-04) | 23619 | 23818 |
| "assigns no other family" | 23622 | 23821 |
| SP-291 criterion (SP-291-A008) / negative constraint | 23689 / 23704 | 23888 / 23903 |
| Registry `RP-COORDINATION-180D` / `RP-RUNTIME-365D` / `RP-CHAT-THREAD-LIFETIME` | 329 / 456 / 557 | 330 / 457 / 558 |
| Registry `boot_recovery_control.retention_compaction` | 65785 | 70496 |
| Contracts board rows | `Plans/Contracts_V0.md:3067-3069` | 3074-3076 |
| Orchestrator "archived or deleted" | `Plans/orchestrator-subagent-integration.md:4747` | 4752 |
| Orchestrator raw-output passage (parser.error note) | 1222, 1226 | 1223, 1227 |
| Orchestrator board append | 4765 | 4770 |
| `DL-047 lifetime and deletion` | 22175-22177 | 22390-22392 |

## 3. The 25 rows

Form, fields and boundaries are September's after SR-02. Each row stays `KEEP_QUARANTINED`. Only `disposition_rationale` (one appended passage), `evidence.retention` (`FAIL` to `PASS`, citing the assignment line) and `citations_checked` (entries appended) change. Each note states the open admission precondition: the full contract's structured `retention_policy_ref` and its chat-deletion, text-protection or Run-anchor reconciliation, "still open and no evidence cell in this row records it as met". The rationale says the host ruling kept the cell `FAIL` until the Storage owner binding was written and that on 2026-09-25 the host confirmed that the landed Case L-3 assignment moves the cell. Both ledgers rewrite or amend exactly those 25 lines with each line's own ending; the individual-ledger lines equal their row objects. The 15 other batch 2 rows are byte-identical. The row "before" hashes equal September's "before" hashes: the rows were not touched on `main` since.

| # | Row | Decision | Cell now | Row SHA-256 before | After |
|---:|---|---|---|---|---|
| 1 | `subagent.spawned` | DL-084 | PASS `Plans/storage-plan.md:17427` | `c013087d6491` | `94dc406d2d91` |
| 2 | `subagent.started` | DL-084 | PASS `Plans/storage-plan.md:17427` | `58d45008ec0c` | `ba8a0d3b4eff` |
| 3 | `subagent.completed` | DL-084 | PASS `Plans/storage-plan.md:17427` | `276f4e316049` | `737fb41c348b` |
| 4 | `subagent.failed` | DL-084 | PASS `Plans/storage-plan.md:17427` | `f2de060509e2` | `de7bc14ed9fb` |
| 5 | `subagent.cancelled` | DL-084 | PASS `Plans/storage-plan.md:17427` | `2ac0ea5e3c6c` | `d415c1f98ae9` |
| 6 | `subagent.timeout` | DL-084 | PASS `Plans/storage-plan.md:17427` | `947533dfa711` | `4a483089b442` |
| 7 | `subagent.paused` | DL-084 | PASS `Plans/storage-plan.md:17427` | `8c12d5661d63` | `a4095302f434` |
| 8 | `subagent.resumed` | DL-084 | PASS `Plans/storage-plan.md:17427` | `968b4827d04f` | `492654faee4f` |
| 9 | `subagent.progress` | DL-084 | PASS `Plans/storage-plan.md:17427` | `4d11c612981e` | `6e7dd7ae1af8` |
| 10 | `subagent.tool_called` | DL-084 | PASS `Plans/storage-plan.md:17427` | `bb7554f479fe` | `3ecbe4461a86` |
| 11 | `subagent.tool_completed` | DL-084 | PASS `Plans/storage-plan.md:17427` | `816a80d2e4a8` | `f2fd7a65aecf` |
| 12 | `subagent.message_sent` | DL-084 | PASS `Plans/storage-plan.md:17427` | `0d55ab0e0564` | `39d737841d6e` |
| 13 | `subagent.message_received` | DL-084 | PASS `Plans/storage-plan.md:17427` | `50dd18933f14` | `9e9eb42f40ec` |
| 14 | `subagent.output_truncated` | DL-084 | PASS `Plans/storage-plan.md:17427` | `cb705014d974` | `9a6923e5d6a7` |
| 15 | `subagent.retried` | DL-084 | PASS `Plans/storage-plan.md:17427` | `7ce3de42ff70` | `5d45b4ad624c` |
| 16 | `subagent.context_warning` | DL-084 | PASS `Plans/storage-plan.md:17427` | `df017f36bdfa` | `a1e335d7e7df` |
| 17 | `subagent.model_switched` | DL-084 | PASS `Plans/storage-plan.md:17427` | `6993e0ce6747` | `16b24af57bd8` |
| 18 | `subagent.budget_warning` | DL-084 | PASS `Plans/storage-plan.md:17427` | `016f664c079a` | `67164dea7ed4` |
| 19 | `subagent.escalated` | DL-084 | PASS `Plans/storage-plan.md:17427` | `f5cb92cd9f8f` | `bbfba2ca762b` |
| 20 | `crew.board_message_posted` | DL-085 | PASS `Plans/storage-plan.md:17429` | `9bad6992c5ee` | `8d3439b40397` |
| 21 | `crew.board_message_read` | DL-085 | PASS `Plans/storage-plan.md:17429` | `a4a50d07447f` | `5ed952fe9fde` |
| 22 | `crew.board_messages_archived` | DL-085 | PASS `Plans/storage-plan.md:17429` | `9fcb79b9d524` | `7ec39e669360` |
| 23 | `phase.force_completed` | DL-086 | PASS `Plans/storage-plan.md:17431` | `c04a5d6fe6a6` | `0fe92868873d` |
| 24 | `config.validation.failed` | DL-086 | PASS `Plans/storage-plan.md:17431` | `16215bd7deff` | `fc8efe1396cc` |
| 25 | `parser.error` | DL-086 | PASS `Plans/storage-plan.md:17431` | `cd0604a4fc3d` | `1903e955b38a` |

Ledgers: `individual-disposition/LEDGER.jsonl` `37ea81478780…` to `9e253e94cb10…`; `census-adjudication/LEDGER.jsonl` `83a1698ac3df…` to `18e5d18f1056…`. Full hashes are in the application record.

**The host's confirmation** (`host_confirmation` in the record): asked about the September branch, the host answered on 2026-09-25: "Confirmed. The landed Case L-3 assignment and the Storage owner text move each retention cell to PASS, as in Step 9 batch 1, where the families' own contracts were also still to come. The family contract's structured retention_policy_ref stays an open admission precondition, and the other owner edits DL-084 and DL-085 name (Contracts CV-267 to CV-269 citing DL-084, the board rows carrying RP-COORDINATION-180D, the Orchestrator's child-run section and archived wording) stay open follow-ups." Source: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/storage-retention-binding-repair-20260925/host-answer-sr02-20260925.txt`, SHA-256 `6e2acd627e79fc165f248e7a1e076377c51bb9fb5965bf51b2b96dbec38007eb`, verified. This branch rebuilds the same assignment with the same families, policies and boundary, so the record applies the answer to it and says so (`applies_to_this_rebuild`). **Open question Q3** asks the host to confirm that the answer carries over.

## 4. Checks

Measured in this worktree (a full, non-sparse T3 worktree) with the gitignored inputs copied in from the shared checkout and verified: the currentness edition `Plans/.audits/event-authority-2026-08-13-currentness/` (15 files, every SHA-256 equal to the shared checkout's), the ten `Plans/.audits` inputs that `reports/landing-checks/README.md` lists, and the `tests/agent_packet_restrictions` symlink. Base comparisons ran in a detached worktree of `be4766513f` with the same inputs. Lines below give the exit code.

**After each Plans commit** (`b8dcee17cd`, `d22e1ff73a`, `59e68d0650`, `a666b3aeed`): `pm-shard-plans.py --generate` 0, `pm-plan-index.py generate` 0, `pm-shard-plans.py --check --config Plans/sharding_config.json` 0, `pm-plan-index.py validate` 0 with top-level `status` `pass` (JSON parse), 7,421 PlanUnits and 29,932 acceptance units, 0 failures. Only the edited documents' shards and the six index files changed. Regeneration on the untouched base changed nothing but four `generated_at_utc` values.

**Focused validators, tip `fa84affa02` against base `be4766513f`:**

| Check | Tip | Base | Comparison |
|---|---|---|---|
| `pm-plans-verify.py validate-new-contracts` | 0 | 0 | equal |
| `validate-projects-refresh-contracts` | 0 | 0 | equal |
| `validate-browser-event-admission` | 0 | 0 | equal |
| `validate-testing-session-event-admission` | 0 | 0 | equal |
| `validate-github-project-integration` | 0 | 0 | equal |
| `validate-working-notebook-contracts` | 0 | 0 | equal |
| `validate-case-l-non-event-materialization` | 0 | 0 | equal modulo hashes |
| `validate-implementation-readiness` | 1 | 1 | equal modulo hashes |
| `verify-spec-lock` | 1 | 1 | equal modulo hashes (the actual hashes of this branch's three files move) |
| `lint-contractrefs` | 0 | 0 | equal |
| `pm-implementation-readiness.py validate` | 1 | 1 | the same 50 rows modulo hashes; the census accepts 28 policies |
| `pm-implementation-readiness.py self-test` | 1 | 1 | equal modulo hashes (pre-existing) |
| `pm-implementation-readiness.py validate-case-l` | 0 | 0 | equal |

`pm-plans-verify.py` has no `validate-storage-value-registry` subcommand; the validators above are the ones that read the storage value registry.

**Tests, tip against base:** `test_event_authority_holding_bucket` 1 and 1, the same 2 failing tests of 34; `test_pm_emit_only_event_boundaries` 1 and 1, the same 1 of 13; `test_pm_pnc019_currentness` 1 and 1, the same 1; `test_pm_coordination_events` 1 and 1, the same 14. `test_pm_onboarding_phases` fails on `main` and here at its 342-family pin (section 6); the tail of that test, run on its own, holds at the tip: 28 policies, `pm-onboarding-contracts.py` validation `[]`, onboarding storage gate no failures and 1 valid contract.

**Branch verifier** `verify_branch_20261104.py be4766513f fa84affa02`: exit 0, 19 of 19. It checks that only allowed paths changed and none of `.gitignore`, `Plans/Spec_Lock.json`, `Plans/.evidence/**` or `Plans/auto_decisions.jsonl`; that exactly one policy was appended and the other 27 and every family are identical except the one prose field; the six removed storage-plan lines; exactly 25 rows changed in the permitted fields only; both ledgers changed exactly 25 lines with line endings kept and the individual-ledger lines equal their rows; the 15 other batch 2 rows are unchanged; every hash in the application record; each anchor line and each cited line naming the row's event type; the host answer's SHA-256; that `storage_maintenance_operation` is in no bucket sentence; the readiness pin; and that no other document's shards changed.

**Dry landing check** `python3 scripts/pm-landing-check.py --base origin/main --json --readiness-audit-root Plans/.audits/event-authority-2026-08-13-currentness --keep-check-reports <scratch>`, at `fa84affa02` with `origin/main` = `be4766513f`: **exit 1, 0 blocking items, no infrastructure result.** Baseline `5aa12e1dd0`, current (ancestor of the base, 0.03 days older).
- `run-gates` 3,196 and `audit-governance` 3,196 failures, both equal to the baseline totals. No bucket grew and none resolved. The two `audit_closure` copies are compared by total only, and their totals are unchanged (201).
- `plan-migration-validate` against the current run `pds-20261104-004-current-planunit-snapshot`: 0 to 3,636, every row marked stale. 3,615 are span rows of `storage-plan` spans (`current_snapshot_live_span_metadata_mismatch` 3,427, `current_snapshot_span_sha256_mismatch` 188); the rest are the snapshot's own exact-file, live-byte and line-count rows and one `stale_batch_report_sha256_after`. This is the snapshot taken on `main` before `storage-plan.md` changed; the landing agent's `snapshot-current` refreshes it.
- On this branch's paths, all excused staleness: `artifact_hash_stale` 8, `stale_hash` 6, `storage_value_registry_spec_lock_hash_stale` 4, `event_authority_currentness_source_drift` 4, `pnc019_source_hash_stale` 2, `event_record_spec_lock_hash_stale` 2, `non_executable_closure_spec_lock_hash_stale` 2, `buildability_gate_report_stale_or_not_canonical` 2, `stale_batch_report_sha256_after` 17, and the snapshot rows above.
- Pre-existing, not stopping: `implementation_readiness_self_tests_failed` (1 in each aggregate, as in the baseline), which names `scripts/pm-implementation-readiness.py`.
- No row names the 25 row files, the ledgers, the application record or `tests/test_pm_onboarding_phases.py`.

The landing check ran at `fa84affa02`. The report commit after it adds only this file, which no check reads.

## 5. Reseal request

For the agent Jared assigns to the next reseal, from editing `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`:
- **Spec Lock.** Refresh the entries of those three files.
- **Plan-sharding bundle.** Refresh the rows of the two documents and their shards, including the registry's changed shard file list.
- **PNC-019 source hash** for `Plans/storage_value_registry.json`.
- **Currentness.** An edition covering `storage-plan.md` and `storage_value_registry.json`; until then `test_pm_pnc019_currentness` keeps their drift rows.
- **Run-002.** `refresh-batch-hashes` for the two documents' batch report rows, and `refresh-final-summary`.
- **Readiness and snapshot.** The implementation-readiness gate report, and the landing agent's `snapshot-current` and baseline refresh after the landing.

## 6. Open questions and follow-ups

New with this rebuild:
- **Q1 (2.3, 2.4).** SP-349's "one app Server-wide counterpart bucket per family" and SP-351's application bound are read as governing the `*_application` storage families and application coordination records, not the EventRecords of the three DL-083 families, `platform.capability_evaluated` or `boot_recovery_control`. DL-083's one shared bucket stands on that reading. The DL-085 line also reads SP-351's bound as covering board records of an application chat. Does the Storage owner or the host read them otherwise?
- **Q2 (2.5).** DL-092 left the retention of collaborative run, transcript message, proposal and finding records open for Jared. SP-351 now gives the application editions of the run, participant and transcript records `RP-RUNTIME-365D`, with no Decision Log entry naming that retention. Is that settled, or still Jared's to decide? This branch does not touch it.
- **Q3 (3).** The host's 2026-09-25 confirmation was for the September branch. Does it carry over to this rebuild, which writes the same assignment on today's lines? The record applies it, as the September repair round did.
- **Pre-existing test failure, not this branch's.** `tests/test_pm_onboarding_phases.py::test_existing_family_and_retention_census_is_unchanged` fails on `main` before it reaches the retention-policy line this branch re-pins: it pins 342 families while `main` has 344 (the 2026-11-04 full-review fixes re-pinned the readiness script only), and with that pin patched it also fails on the registry's row order (`families[88:90]`). The rest of the test's tail was checked separately and holds (28 policies, onboarding storage validation clean, gate clean). Its owner should re-pin it.

Carried from September, unchanged in substance (lines re-pinned):
- **SR-04 (note), open question.** Whether DL-083 covers the Boot aggregate controls. The reviewer found the reading within DL-083 and required no change. If the host reads DL-083 as covering EventRecords only, the reviewer's repair is to delete from `Plans/storage-plan.md:23818` the sentence "So does every settled or no-obligation Boot aggregate control of this section (registry family `boot_recovery_control`), which is `storage.boot_recovery`'s own aggregate custody under the same policy.", restore the `boot_recovery_control` `retention_compaction` prose to its base text, and narrow the SP-291 criterion at `:23888` the same way.
- **SR-05 (note), follow-up.** At the next Step 8 regrade, re-grade the retention cells of `storage.boot_recovery`, `storage.recovery_applied`, `storage.compaction_lifecycle_changed` and `platform.capability_evaluated` against `Plans/storage-plan.md:23805-23825`. Do not edit the pinned assessment `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` on this branch.
- **`storage_maintenance_operation`** (application-scoped, `storage_maintenance_operation.v1:{storage_instance_id}:{operation_id}`, under `RP-OPERATIONAL-2555D`) is in neither bucket and no decision covers its count. Whether it needs a card is the host's call.
- **The linked successor's physical form** is defined nowhere; it is technical work for the first admission of a family bound to `RP-CHAT-THREAD-LIFETIME`.
- **Other owners' follow-ups**, open by the host's answer and not preconditions of the 25 cells: CV-267 to CV-269 cite DL-084; the board rows `Plans/Contracts_V0.md:3074-3076` carry `RP-COORDINATION-180D`; the Orchestrator's child-run section cites DL-084; "archived or deleted" becomes "archived" (`Plans/orchestrator-subagent-integration.md:4752`); the raw-output reconciliation (DL-086); Collaborative Workflows section 13 cites DL-090 and gains `collaboration.failed` (DL-091; still absent on `main`).
- **Response rows unchanged.** `decision-responses.jsonl` still says the DL-084 to DL-086 cells are `FAIL` "until the Storage owner binding lands". That stays true as history.

## 7. Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/B2/` holds a copy of this report, the edit scripts (`edit_sp291_buckets.py`, `edit_chat_policy.py`, `edit_case_l3_assignments.py`, `apply_retention_binding_rows_20261104.py`), the branch verifier `verify_branch_20261104.py` and its output, the DL-045 search `dl045-search-20261104.txt`, the regeneration and index-validate outputs of each Plans commit, the base and tip validator and test outputs, and the dry landing check's report. Its `SHA256SUMS` covers every file there.

## 8. Commits

| Commit | What |
|---|---|
| `b8dcee17cd` | R2-01 wording in the SP-266 successor subsection |
| `d22e1ff73a` | SP-291: the DL-083 and DL-089 buckets (SR-01, SR-06 re-run), PlanUnit, registry prose |
| `59e68d0650` | Reuse check; `RP-CHAT-THREAD-LIFETIME@1.0.0`; census, readiness pin and onboarding test pin |
| `a666b3aeed` | Case L-3 assignments for DL-084, DL-085, DL-086 and DL-092 (SR-03, SR-07) |
| `fa84affa02` | The 25 rows, both ledgers and the application record |
| this commit | This report |

## Review round 1 (Sol 6.1 max, LANDING_READY_WITH_NOTES)

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/B2-sol/REVIEW.md`. Fix by the stream E lead, report text only.
- **B2-01, should fix, fixed.** Section 2.6 now says only the new binding citations and the application-record anchors were re-pinned; earlier citation-check entries in the rows and ledgers stay as historical evidence and may have drifted. No row field or historical evidence was rewritten.
- **B2-02, note.** Q2 stays open for Jared: DL-092 reserved run, transcript-message, proposal and finding retention, and SP-351's `RP-RUNTIME-365D` table entries are not his answer. This branch assigns only the event histories and neither changes nor relies on those entries.
- **B2-03, note.** The onboarding census test fails on `main` before the changed assertion (section 6).
- **B2-04, note.** Governance reseal and the later per-family admissions remain separate work.
- **Q1 and Q3.** The review finds the bounded reading of SP-349/SP-351 defensible (Q1) and the 2026-09-25 confirmation carrying over within the same scope and families (Q3).

