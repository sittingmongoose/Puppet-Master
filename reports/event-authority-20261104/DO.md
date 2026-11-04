# DO — targeted fix round 4

**Branch:** `plans/ea-w2-orchestrator-20261104`. **Assessed source/fix commit:** `3f3641156a32fbd816d4af236cdcc328a516bf9a`. **Reviewed head:** `927b4864cd2149718e7b415695913b4e3771b031`.

**25/25 prepared under the lane's membership and retention exceptions.** Every family keeps membership ABSENT and retention PARTIAL; native execution/custody/authentication/durability remain NOT_RUN. No family registry append, admission record, Decision Log entry, main push or governance reseal occurred.

**Independent cycle-4 grades → current self-grade:** **224 PASS / 51 PARTIAL / 25 ABSENT → 250 PASS / 25 PARTIAL / 25 ABSENT**, zero conflicts. All 25 oracle cells and the application posted producer cell move PARTIAL → PASS. All other cells are carried after current owner reread. Prepared count **0 → 25**. The prior branch's 248 PASS claim is not the before baseline.

## Review round 4: findings and responses

- **DO-C4-01 — fixed (`3f3641156a32fbd816d4af236cdcc328a516bf9a`). Where:** `scripts/pm_orchestrator_event_oracles.py:166`, `scripts/pm-orchestrator-event-contracts.py`, every selected DO definition and actual coordination storage composition. **Cause:** instance-driven resolution left dormant optional refs unvisited. **Fix:** eagerly walk selected roots and every subschema/reference edge, including optional and unreachable instance branches, using the exact offline URI registry and Referencing's scoped `$id`, anchors and escaped JSON Pointer resolution. Retrieval always refuses; no basename/latest-version fallback exists. Every family has unresolved-resource and unresolved-fragment standing negatives. Source/input/wrapper/checkpoint/EventRecord roots also close eagerly. The full checker runs them; eight independent full CLI controls (diagnostic and all three board members, both missing URI and fragment) exit 1 specifically for `unresolved_schema_reference`, with board composition and optional summaries kept consistent. Nested relative-id, escaped-pointer and anchor positives plus missing-resource/fragment controls pass in ref-resolution-tests.json. Closure is of the selected DO graph; the review's unrelated immutable Goal edges remain an integration item, never silently selected or repaired.
- **DO-C4-02 — fixed (`3f3641156a32fbd816d4af236cdcc328a516bf9a`). Where:** `scripts/pm_orchestrator_event_oracles.py:471`, `Plans/orchestrator_historical_read.schema.json`, OSI-680..704 and ATS-360. **Cause:** the generic checkpoint could not express the exact family's withdrawn reader/publication gate. **Fix:** separate historical read admission consumes an explicit supported reader/version, original admission/schema/source witness and captured original producer facts, then enforces current access/deletion/hold and actual family reader/publication fences. Current child/phase/model/board/Stop/deadline/producer permission/writer-admission changes do not recapture original validity. Every family runs changed-live-state and supported compatibility positives, forged/unproven/foreign original refusals, unsupported/wrong reader and withdrawal/publication/access/deletion/hold negatives with otherwise unchanged generic checkpoints. All 25 complete compatibility-only EventRecord vectors read successfully while current append/retry still refuses `projector_replay_only`. The independent fenced-history full CLI control exits 1 for `historical_reader_withdrawn`. All ten standing checks are now required for each family; no boolean witness is native authentication or admission.
- **DO-A04 — fixed (`3f3641156a32fbd816d4af236cdcc328a516bf9a`), technical under DL-045/DL-085. Where:** `Plans/Contracts_V0.md:24475` (CV-740), `Plans/storage-plan.md:29619` (SP-723), OSI-247/299/440/681..683 and live successor companions. **Cause:** immutable V1 could not preserve the already required original subject/priority. **Fix:** a separately governed `AgentMessageApplicationV2@2.0.0`, original append source and physical wrapper select the new immutable URI `https://puppetmaster.local/schemas/application-board-message/2.0.0/schema.json`. The message retains all V1 fields and actual scope/Server/thread/crew/run/message, body/ref and sender/receiver identity, and preserves original subject, low/normal/high/urgent priority, platform/type/node/lane routing, execution context, reply/read/resolution. No header comes from an event, default or body reinterpretation. The whole app.coordination_append.v2 graph selects exact resources/method/source/input/output, wrapper/key/codec, canonical read and coherent backup/restore; V2 originals also have read/archive consumer positives, while V1 historical/source selections remain explicit. Full original operation/stage/accepted-source commitments, separate semantic and physical hashes, SP-337 aggregate limit and SP-286 full-value first receipt apply before publication. SP-723 defines the governed upgrader's genuine-original-field precondition and compatibility/withdrawal protocol. Six independent successor full CLI mutations exit 1 for their stated defects; 36 authored complete successor negatives run internally. No Jared card remains.

The per-family current-source search is retained in source-search.json (25 independent entries); new bindings are explicitly labelled. It reuses every family's existing history reader and generic SP-278 index/checkpoint rather than inventing a sibling-derived reader or family cursor. CV-740/SP-723 select only already specified board behavior. All four source/method graph resources are exact offline selections. New physical V2 storage/profile rows reuse the existing canonical coordination group, budget, codec algorithm, sole coordinator, payload store and Server counterpart policy. Every original Storage row/profile/group/policy, Project resource, V1 application resource/URI/codec and agent member is preserved.

## Family grades and standing census

P-count is PASS cells out of twelve; every row keeps one ABSENT membership cell and one PARTIAL retention cell after this round. Each row has its own S1..S10 cases; † the three Project-only diagnostics reject fabricated application scope for S2. No sibling supplies a pass.

| Family | Unit | PASS before → after | S1..S10 | Prepared before → after |
|---|---|---:|---|---|
| `config.validation.failed` | OSI-680 | 9 → 10 | PASS† | no → yes |
| `crew.board_message_posted` | OSI-681 | 8 → 10 | PASS | no → yes |
| `crew.board_message_read` | OSI-682 | 9 → 10 | PASS | no → yes |
| `crew.board_messages_archived` | OSI-683 | 9 → 10 | PASS | no → yes |
| `parser.error` | OSI-684 | 9 → 10 | PASS† | no → yes |
| `phase.force_completed` | OSI-685 | 9 → 10 | PASS† | no → yes |
| `subagent.budget_warning` | OSI-686 | 9 → 10 | PASS | no → yes |
| `subagent.cancelled` | OSI-687 | 9 → 10 | PASS | no → yes |
| `subagent.completed` | OSI-688 | 9 → 10 | PASS | no → yes |
| `subagent.context_warning` | OSI-689 | 9 → 10 | PASS | no → yes |
| `subagent.escalated` | OSI-690 | 9 → 10 | PASS | no → yes |
| `subagent.failed` | OSI-691 | 9 → 10 | PASS | no → yes |
| `subagent.message_received` | OSI-692 | 9 → 10 | PASS | no → yes |
| `subagent.message_sent` | OSI-693 | 9 → 10 | PASS | no → yes |
| `subagent.model_switched` | OSI-694 | 9 → 10 | PASS | no → yes |
| `subagent.output_truncated` | OSI-695 | 9 → 10 | PASS | no → yes |
| `subagent.paused` | OSI-696 | 9 → 10 | PASS | no → yes |
| `subagent.progress` | OSI-697 | 9 → 10 | PASS | no → yes |
| `subagent.resumed` | OSI-698 | 9 → 10 | PASS | no → yes |
| `subagent.retried` | OSI-699 | 9 → 10 | PASS | no → yes |
| `subagent.spawned` | OSI-700 | 9 → 10 | PASS | no → yes |
| `subagent.started` | OSI-701 | 9 → 10 | PASS | no → yes |
| `subagent.timeout` | OSI-702 | 9 → 10 | PASS | no → yes |
| `subagent.tool_called` | OSI-703 | 9 → 10 | PASS | no → yes |
| `subagent.tool_completed` | OSI-704 | 9 → 10 | PASS | no → yes |

S1 refuses compatibility-only current append/retry. S2 uses exact CV-366 application keys. S3 verifies encoded Project partitions. S4 measures complete inline MessagePack and actual external packs. S5 refuses LF-suffixed identifiers and retains the exact BLAKE3 fence. S6 compares only caller semantic fields and returns the original full result for Storage-only changes. S7 joins actual checkpoint Storage identity. S8 refuses success-labelled failures. S9 eagerly closes all selected refs. S10 enforces original-valid retained history and current exact-family withdrawal/disclosure fences. Check 11 is proved below.

## Check 11 — complete guard-removal table

**83 guard groups; 488 valid cases; 5,319 single-defect negatives; zero unrelated flips.** Each guard was removed only in an isolated in-memory source mutant, then restored by discarding that mutant. Production source hashes are pinned in the evidence and remain identical. No bypass flag or production guard weakening was added.

A guard group is one rejection invariant; repeated enforcement sites for that same invariant are removed together and the site count is retained. Closed-schema negatives use the complete selected validator at its pure shape-validation seam; relational negatives use the complete corresponding event/read/source/transport checker with otherwise valid shapes. For the closed-schema mutation the selected schema root is replaced by `true` and still run through the validator. Source/input/wrapper, event/payload, scope pairs, physical keys, accepted-source/semantic/physical digests and checkpoint observations are kept consistent except for the one invariant under test. Unchanged pure schema leaves are memoized by held immutable input/schema/format identity; every mutant reruns every negative's relational checker. Test-harness expectation assertions are not admission predicates and are never suppressed to make a result pass.

`U` is the full 5,319-case set. `N01`..`N83` are the complete explicit case-id lists in guard-removal-table.json, identified by case_set_id. Each row reports both exact sets as N / U\N; the JSON expands both into names, records source/mutant hashes and verifies unrelated rejection reasons. This notation keeps the report compact without substituting a count for an executed proof.

| Removed guard | Negatives that flip | Negatives that stay rejected for their own reason |
|---|---|---|
| `accepted_original_source_join` | `N01` (4) | `U\N01` (5315) |
| `anchored_identifier_fullmatch` | `N02` (1) | `U\N02` (5318) |
| `application_*_schema` | `N03` (334) | `U\N03` (4985) |
| `application_message_body_representation` | `N04` (1) | `U\N04` (5318) |
| `application_wrapper_over_16k` | `N05` (1) | `U\N05` (5318) |
| `checkpoint_identity_token` | `N06` (583) | `U\N06` (4736) |
| `checkpoint_not_current` | `N07` (1) | `U\N07` (5318) |
| `checkpoint_schema` | `N08` (106) | `U\N08` (5213) |
| `checkpoint_source_storage_identity` | `N09` (1) | `U\N09` (5318) |
| `closed_payload_schema` | `N10` (1230) | `U\N10` (4089) |
| `envelope_*` | `N11` (10) | `U\N11` (5309) |
| `event_join_*` | `N12` (424) | `U\N12` (4895) |
| `event_schema` | `N13` (53) | `U\N13` (5266) |
| `event_type_join` | `N14` (53) | `U\N14` (5266) |
| `failure_oracle_success_code` | `N15` (25) | `U\N15` (5294) |
| `family_current_replay_policy` | `N16` (53) | `U\N16` (5266) |
| `historical_disclosure_fence` | `N17` (75) | `U\N17` (5244) |
| `historical_original_admission` | `N18` (50) | `U\N18` (5269) |
| `historical_original_source` | `N19` (50) | `U\N19` (5269) |
| `historical_reader_identity` | `N20` (25) | `U\N20` (5294) |
| `historical_reader_withdrawn` | `N21` (50) | `U\N21` (5269) |
| `historical_schema_unsupported` | `N22` (25) | `U\N22` (5294) |
| `historical_state_schema` | `N23` (689) | `U\N23` (4630) |
| `identity` | `N24` (10) | `U\N24` (5309) |
| `index_birth_anchor_join` | `N25` (1) | `U\N25` (5318) |
| `index_complete_row_set` | `N26` (53) | `U\N26` (5266) |
| `index_complete_source_coverage` | `N27` (1) | `U\N27` (5318) |
| `index_original_source_join` | `N28` (106) | `U\N28` (5213) |
| `index_row_*` | `N29` (424) | `U\N29` (4895) |
| `index_row_locator_join` | `N30` (1) | `U\N30` (5318) |
| `index_row_schema` | `N31` (1) | `U\N31` (5318) |
| `index_source_prefix` | `N32` (1) | `U\N32` (5318) |
| `inline_base64_body` | `N33` (25) | `U\N33` (5294) |
| `inline_payload_join` | `N34` (1) | `U\N34` (5318) |
| `inline_payload_over_16k` | `N35` (50) | `U\N35` (5269) |
| `logical_payload_schema` | `N36` (53) | `U\N36` (5266) |
| `message_*` | `N37` (23) | `U\N37` (5296) |
| `message_content_join` | `N38` (6) | `U\N38` (5313) |
| `message_sender` | `N39` (3) | `U\N39` (5316) |
| `message_source` | `N40` (7) | `U\N40` (5312) |
| `message_target` | `N41` (5) | `U\N41` (5314) |
| `message_target_type` | `N42` (3) | `U\N42` (5316) |
| `payload_encoding` | `N43` (1) | `U\N43` (5318) |
| `payload_reference` | `N44` (128) | `U\N44` (5191) |
| `phase_force_predicate` | `N45` (4) | `U\N45` (5315) |
| `project_original_input_shape` | `N46` (4) | `U\N46` (5315) |
| `replay_only_not_appendable` | `N47` (53) | `U\N47` (5266) |
| `retry_attempt` | `N48` (2) | `U\N48` (5317) |
| `retry_ceiling` | `N49` (7) | `U\N49` (5312) |
| `retry_deadline` | `N50` (7) | `U\N50` (5312) |
| `retry_lineage` | `N51` (7) | `U\N51` (5312) |
| `retry_operation` | `N52` (2) | `U\N52` (5317) |
| `retry_outcome:different_identity` | `N53` (53) | `U\N53` (5266) |
| `retry_outcome:idempotency_conflict` | `N54` (53) | `U\N54` (5266) |
| `retry_outcome:replay_only_not_appendable` | `N55` (53) | `U\N55` (5266) |
| `retry_payload_source_predicate` | `N56` (1) | `U\N56` (5318) |
| `retry_permission` | `N57` (7) | `U\N57` (5312) |
| `retry_source_transition` | `N58` (3) | `U\N58` (5316) |
| `retry_stop` | `N59` (7) | `U\N59` (5312) |
| `retry_terminal` | `N60` (1) | `U\N60` (5318) |
| `run_anchor_*` | `N61` (20) | `U\N61` (5299) |
| `run_anchor_kind` | `N62` (10) | `U\N62` (5309) |
| `scope_partition` | `N63` (63) | `U\N63` (5256) |
| `source_*` | `N64` (38) | `U\N64` (5281) |
| `source_digest` | `N65` (8) | `U\N65` (5311) |
| `source_edition` | `N66` (8) | `U\N66` (5311) |
| `source_input_digest` | `N67` (8) | `U\N67` (5311) |
| `source_original_join` | `N68` (8) | `U\N68` (5311) |
| `source_output_digest` | `N69` (6) | `U\N69` (5313) |
| `source_stage_method` | `N70` (4) | `U\N70` (5315) |
| `source_stage_operation` | `N71` (8) | `U\N71` (5311) |
| `successor_complete_graph` | `N72` (1) | `U\N72` (5318) |
| `successor_graph_digest` | `N73` (1) | `U\N73` (5318) |
| `successor_method_selection` | `N74` (1) | `U\N74` (5318) |
| `successor_physical_selection` | `N75` (1) | `U\N75` (5318) |
| `successor_read_backup_restore` | `N76` (1) | `U\N76` (5318) |
| `successor_resource_selection` | `N77` (1) | `U\N77` (5318) |
| `successor_storage_member` | `N78` (1) | `U\N78` (5318) |
| `successor_storage_selection` | `N79` (1) | `U\N79` (5318) |
| `truncation_grows_output` | `N80` (2) | `U\N80` (5317) |
| `unresolved_schema_reference` | `N81` (107) | `U\N81` (5212) |
| `wrapper_key_join` | `N82` (6) | `U\N82` (5313) |
| `wrapper_physical_digest` | `N83` (4) | `U\N83` (5315) |

## Verification and preserved repairs

| Check | Exit / result |
|---|---|
| Full DO checker | 0; **25 families / 7111 checks**, no stopped facet, native NOT_RUN |
| Full CLI controls | 16 invocations: baseline 0; **15 negatives 1**, all expected diagnostics present |
| Guard-removal audit | 0; **83 groups / 488 positives / 5,319 negatives**, no uncovered runtime rejection emitter, no accidental valid negative, no mixed-invariant negative |
| Shard generation and check | 0 / 0; parsed top-level pass |
| Index generation and validation | 0 / 0; parsed top-level pass; all 15 ignored currentness inputs SHA-equal |
| Index binding tests | 0; 14/14 |
| Coordination checker | 1; same 2 failures, whole output equal to prior checked baseline |
| Runtime canon | 1; same 161 failures, whole output equal |
| Storage profile checker | 1; same 41-error list; family/profile counts each rise by one for the new fully assigned V2 member |
| Coordination tests | 1; 50 tests / same 14 failures; output equal after only worktree-path/elapsed normalization |
| Quote/re-grade audit | 25 families / 300 cells; all current evidence quotations mechanically verified |
| Preservation audit | all 344 original storage rows and all original profiles/groups/policies equal; only V2 member/profile added; frozen V1/Project resources exact |
| Scoped-id audit | CV-740/SP-723 absent from all fetched origin owner identities before authoring; both inside DO's assigned blocks |
| Python syntax / git diff --check | 0 / 0 |

**A01–A03 remain repaired.** Current append/retry policy, exact partition/key, semantic/Storage metadata comparison and full original read/checkpoint joins remain enforced. Complete transport/body/reference integrity and aggregate byte limits remain enforced for all families. Phase count, truncation ordering, source/payload retry cause/counter/current fences and closed priority remain enforced. The guard audit removes those actual guards individually, including each retry fence, and demonstrates their own negatives flip. DO-01..04 and DO-C2-01's source/stored byte fences, body split, exact storage members and retry source cases remain in the full checker. Native execution remains separate.

**Shared-file scope and generated files.** Contracts: existing CV-366 selection qualification plus new CV-740. Storage: existing SP-351 selection qualification, SP-720 source replacement, SP-721/722 V2 consumer selection and new SP-723. Coordination: existing OSI-247/299/440 message selection and exact OSI-680..704 historical oracles, with posted/source consumer qualifications in 681..683. Testing: existing ATS-360. Registry: append the V2 canonical storage member and its existing-group profile only; all original rows remain exact. Only these five edited sources' shard directories change (including storage_value_registry); global indexes are generated normally. No generated shard/evidence was hand-edited. Registry admissions, locks, governance evidence and Decision Log remain untouched.

**Open integration work.** Membership is intentionally absent. Retention remains PARTIAL until the named Storage branch integration/per-family admission and Q1/Q3 are settled; DL-084/085/086 lifetime premises and OSI-440/CV-366's application counterpart remain current. This round chooses no numeric cap, retention or deletion policy. Original coordination anchored-pattern integration and the review's unrelated frozen Goal-reference baseline remain outside DO. Native custody/authentication/durability/CAS/restore/withdrawal races remain NOT_RUN; static success grants none of those authorities.

**IDs used.** New: **CV-740, SP-723**. Existing lane IDs: **OSI-680..704, SP-720..722, ATS-360**. Existing owner qualifications: OSI-247/299/440, CV-366 and SP-351. No other PlanUnit id was minted.

**Procedure and cleanup.** Initial available RAM 17 GiB / root disk 126 GiB, above the 6/50 GiB floors. Sparse detached worktree DO-fix4 started at the exact reviewed head; no pm-mail, subagents, browser, server, admission, main push or reseal. The temporary input overlay is removed; source/report branches are pushed and the literal-path fix worktree is removed after final delivery preparation. No temporary checkout is retained.

## Retained evidence

Base path: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-4/`. Full-byte SHA-256 values below. The complete guard table includes every flipping/still-rejected case id, not a sample. Reproduction scripts are retained as result evidence; edit-generation scratch is removed.

| Evidence | SHA-256 |
|---|---|
| `contracts-check.json` | `0a2e515f0610108d820bff5b5133586d9a55429d71145d36f66451618ef912aa` |
| `full-cli-probes.json` | `e81d9185ea32958857e6ff533c554fcbf96e1b57dbe5b895d3c2e48dad349df1` |
| `cli_probes.py` | `74f502060fd270d287b802d6bd01dad00d3f8727cb1c86d5b8cfca254b0068dd` |
| `guard-removal-table.json` | `cfd048a41a9adf5ca192423f4c0b41260e7500ce9ad5555d8345ba8df5695afc` |
| `guard-diagnostics-summary.json` | `6f6244582c48a689ff501bc91493769fe211080a60b9c2e328eb75019e477ea6` |
| `guard-bank-diagnostics.json` | `074e15170584933eefbe42e5fb4af404528bcf1809b22f1e32c5df70217294d3` |
| `guard_audit.py` | `4dec4d857d59fbb011ff2d2a7afb47fc8b41feda7be0794349d0d98e6b24d1fb` |
| `ref-resolution-tests.json` | `9dd4b2af9297fdc18103d10c9e640fecc2ac4dfc812c9a633ed84c283206ce84` |
| `baseline-comparison.json` | `291f1247596ae56882d9f9d036980865fa56ee9c1834969093a89f129623a512` |
| `preservation.json` | `ca87a8e090237848668566a3479d6aca0c0c6104b58c841281dffa3157d148c6` |
| `source-search.json` | `362f60ba1e4cd04ba0fdd8f1c53216db8a4a55ae0082a100ef32e848f64ecf91` |
| `new-id-audit.json` | `d20f9bcbc9a7c70cde3a07248485b9fa39f7a647077d4cb30f0580df76cf97a2` |
| `currentness.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `regrade.json` | `667a0811af86732a57ff9ae61a7c856d089a600fe834144f6dda7c5d87c4ff2e` |
| `shard-check.json` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `index-validate.json` | `ebc81ceacb8c38a96553ed90ca2a8b1258fde62e8890d05795059da8e40e3e65` |
| `runtime-canon.json` | `bd09795460a0685673e28093e0bf0299343bf8b5ac4c7062440eb9bac412b955` |
| `coordination-check.json` | `a7a906d97e05afa3eec03aded40a2428d67c353bc3292400bddad104e8584b8d` |
| `storage-check.json` | `08b2a6c5fdc6f8b053a9ab58de439ba2c9e7be70ba41f4d8a22f9b11fb25fef9` |
| `coordination-tests.stderr` | `ff0baf26b00506ae04e23c504a39114cd73f7fc70f7280f4cac48a0682faa328` |
| `index-tests.stderr` | `74e992098969552c4ba5002c686aa098a850105fd144b6812ed378858924f685` |
