# DO — technical fix round 5

**Branch:** `plans/ea-w2-orchestrator-20261104`. **Assessed fix commit:** `10f1152aa6d12d6a016fe8e2d392b6a85383f4c0`. **Reviewed head:** `18b9a615dcb4309d0ac970f7d604a2bf4c238ad7`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DO-sol/REVIEW-cycle5.md`.

**25/25 prepared under the lane exceptions; native NOT_RUN.** Independent cycle-5 grades **225 PASS / 50 PARTIAL / 25 ABSENT → 250 PASS / 25 PARTIAL / 25 ABSENT**; zero conflicts. Each family's oracle cell moves PARTIAL → PASS. Membership remains ABSENT and retention PARTIAL. No admission, Decision Log, registry, governance or main change.

## Review round 5: findings and responses

- **DO-C5-01 — fixed (`10f1152aa6d12d6a016fe8e2d392b6a85383f4c0`). Where:** `scripts/pm_orchestrator_event_oracles.py:357`, OSI-681..683, CV-740 and SP-723. **Cause:** stage operation joins omitted successful original stage status and proof, while post-only commitment checks left read/archive paths uncovered. **Fix:** all six selected application source positives, including V1 and V2 read/archive consumers, require accepted original intent, accepted source, captured original owner/Stop fence, reservation and owner commit. Each needs its recorded request/result and resolved original owner evidence; compare the retained stage record, operation/method, input/accepted-source commitments, owner/revision/generation and actual wrapper key/physical digest, recomputing hashes. Every consumer verifies accepted-source witness/hash, all stage methods and actual wrapper bytes. Missing, foreign, refused, unknown or not-reached originals refuse. An independent metadata mutation initially exposed an owner-ref omission; the fix adds owner/revision/generation commitments and 90 corresponding negatives. Admission-dependent event append/first receipt stays not_reached in prepared fixtures; neither synthetic evidence nor a non-null ref authenticates a native record. Verify `board_custody_cases`, full CLI controls and the final source guard table.
- **DO-C5-02 — fixed (`10f1152aa6d12d6a016fe8e2d392b6a85383f4c0`). Where:** `scripts/pm-orchestrator-event-contracts.py:29`, `number_domain_errors`/`canonical_loads`/`retry_outcome`, and each OSI-680..704 identity paragraph. **Cause:** JSON dumps minted representation-dependent identity and application observation bytes. **Fix:** actual RFC8785 serialization for both preimages, plus an explicit current-input domain before schema/hash/retry: finite RFC8785 numbers, safe integers for integral values and canonical token spelling for fractional floats. Raw 1.0, -0 and 1e0 refuse; 01 is invalid JSON. Every one of 53 scope/body vectors has all four input negatives and synchronized current event/retry controls. Direct identity and semantic-digest comparisons prove 1 and 1.0 produce the same canonical bytes, while current aliases refuse. Current checks inspect the incoming event/candidate; they do not reinterpret a verified stored original. All 106 numeric-history vectors, six retained typed board sources, and 106 canonical retries against valid numeric originals pass; retries return the exact original complete receipt bytes. Frozen typed source hash/physical codec domains remain unchanged.

## Family grades and all eleven standing checks

Each row independently retains membership ABSENT and retention PARTIAL. The before column is the independent cycle-5 re-grade, not the branch's former self-grade. All other criterion statuses carry after rereading current owner evidence; all 327 evidence quotations verify.

| Family | Unit | PASS cells before → after | S1..S11 | Prepared before → after |
|---|---|---:|---|---|
| `config.validation.failed` | OSI-680 | 9 → 10 | PASS | no → yes |
| `crew.board_message_posted` | OSI-681 | 9 → 10 | PASS | no → yes |
| `crew.board_message_read` | OSI-682 | 9 → 10 | PASS | no → yes |
| `crew.board_messages_archived` | OSI-683 | 9 → 10 | PASS | no → yes |
| `parser.error` | OSI-684 | 9 → 10 | PASS | no → yes |
| `phase.force_completed` | OSI-685 | 9 → 10 | PASS | no → yes |
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

S1: current append/retry refuses projector_replay_only. S2: exact CV-366 application key, including canonical numeric observation; the three Project-only diagnostics refuse fabricated application scope. S3: encoded project~ partition. S4: full stored parts respect SP-337/16 KiB. S5: anchored full match/length and LF refusals. S6: caller semantic fields alone; changed Storage metadata returns original full result. S7: actual Storage/checkpoint/source identities match. S8: success-labelled failures refuse. S9: eagerly close every selected ref, including dormant branches. S10: captured original validity survives changed live state, including numeric and compatibility history; current disclosure and exact family withdrawal/publication fences remain. S11: final source-mutating guard table below.

## Check 11 — final guard-removal table

**87 guard groups / 706 valid baselines / 6,033 single-defect negatives / 524,871 mutant-negative evaluations.** Every guard or named duplicate set is removed one at a time in an isolated source mutant. All its negatives then pass; every other negative still rejects for its own unchanged reason. Production guards remain intact; final source hashes match the table. The guard census has no unproved emitted invariant, invalid negative or mixed-invariant negative. Rejected intermediate audit runs were replaced after code changes; only this complete final-source run is claimed.

Pure shape controls run the complete selected schema at its declared seam; relational controls run the full corresponding helper. Repeated enforcement sites of the same invariant are named together below with their site count. `N01` onward and their complements are the exact named lists in guard-removal-table.json; U is the complete 6,033-case universe. No test expectation or production guard is bypassed.

| Removed guard / named duplicate set | Sites | Negatives that flip | Negatives that stay rejected for their own reason |
|---|---:|---|---|
| `accepted_original_source_join` | 1 | `N01` (28) | `U\N01` (6005) |
| `anchored_identifier_fullmatch` | 1 | `N02` (1) | `U\N02` (6032) |
| `application_*_schema` | 1 | `N03` (334) | `U\N03` (5699) |
| `application_message_body_representation` | 1 | `N04` (1) | `U\N04` (6032) |
| `application_wrapper_over_16k` | 1 | `N05` (1) | `U\N05` (6032) |
| `checkpoint_identity_token` | 2 | `N06` (583) | `U\N06` (5450) |
| `checkpoint_not_current` | 1 | `N07` (1) | `U\N07` (6032) |
| `checkpoint_schema` | 1 | `N08` (106) | `U\N08` (5927) |
| `checkpoint_source_storage_identity` | 1 | `N09` (1) | `U\N09` (6032) |
| `closed_payload_schema` | 1 | `N10` (1230) | `U\N10` (4803) |
| `envelope_*` | 1 | `N11` (10) | `U\N11` (6023) |
| `event_join_*` | 1 | `N12` (424) | `U\N12` (5609) |
| `event_schema` | 1 | `N13` (53) | `U\N13` (5980) |
| `event_type_join` | 1 | `N14` (53) | `U\N14` (5980) |
| `failure_oracle_success_code` | 1 | `N15` (25) | `U\N15` (6008) |
| `family_current_replay_policy` | 1 | `N16` (53) | `U\N16` (5980) |
| `historical_disclosure_fence` | 1 | `N17` (75) | `U\N17` (5958) |
| `historical_original_admission` | 1 | `N18` (50) | `U\N18` (5983) |
| `historical_original_source` | 1 | `N19` (50) | `U\N19` (5983) |
| `historical_reader_identity` | 1 | `N20` (25) | `U\N20` (6008) |
| `historical_reader_withdrawn` | 1 | `N21` (50) | `U\N21` (5983) |
| `historical_schema_unsupported` | 1 | `N22` (25) | `U\N22` (6008) |
| `historical_state_schema` | 1 | `N23` (689) | `U\N23` (5344) |
| `identity` | 1 | `N24` (10) | `U\N24` (6023) |
| `index_birth_anchor_join` | 1 | `N25` (1) | `U\N25` (6032) |
| `index_complete_row_set` | 1 | `N26` (53) | `U\N26` (5980) |
| `index_complete_source_coverage` | 1 | `N27` (1) | `U\N27` (6032) |
| `index_original_source_join` | 1 | `N28` (106) | `U\N28` (5927) |
| `index_row_*` | 1 | `N29` (424) | `U\N29` (5609) |
| `index_row_locator_join` | 1 | `N30` (1) | `U\N30` (6032) |
| `index_row_schema` | 1 | `N31` (1) | `U\N31` (6032) |
| `index_source_prefix` | 1 | `N32` (1) | `U\N32` (6032) |
| `inline_base64_body` | 1 | `N33` (25) | `U\N33` (6008) |
| `inline_payload_join` | 1 | `N34` (1) | `U\N34` (6032) |
| `inline_payload_over_16k` | 1 | `N35` (50) | `U\N35` (5983) |
| `logical_payload_schema` | 2 | `N36` (53) | `U\N36` (5980) |
| `message_*` | 3 | `N37` (23) | `U\N37` (6010) |
| `message_content_join` | 2 | `N38` (6) | `U\N38` (6027) |
| `message_sender` | 1 | `N39` (3) | `U\N39` (6030) |
| `message_source` | 2 | `N40` (7) | `U\N40` (6026) |
| `message_target` | 1 | `N41` (5) | `U\N41` (6028) |
| `message_target_type` | 1 | `N42` (3) | `U\N42` (6030) |
| `number_domain` | 5 | `N43` (223) | `U\N43` (5810) |
| `number_token_canonical` | 2 | `N44` (5) | `U\N44` (6028) |
| `payload_encoding` | 1 | `N45` (1) | `U\N45` (6032) |
| `payload_reference` | 6 | `N46` (128) | `U\N46` (5905) |
| `phase_force_predicate` | 1 | `N47` (4) | `U\N47` (6029) |
| `project_original_input_shape` | 1 | `N48` (4) | `U\N48` (6029) |
| `replay_only_not_appendable` | 1 | `N49` (53) | `U\N49` (5980) |
| `retry_attempt` | 1 | `N50` (2) | `U\N50` (6031) |
| `retry_ceiling` | 1 | `N51` (7) | `U\N51` (6026) |
| `retry_deadline` | 1 | `N52` (7) | `U\N52` (6026) |
| `retry_lineage` | 1 | `N53` (7) | `U\N53` (6026) |
| `retry_operation` | 1 | `N54` (2) | `U\N54` (6031) |
| `retry_outcome:different_identity` | 1 | `N55` (53) | `U\N55` (5980) |
| `retry_outcome:idempotency_conflict` | 1 | `N56` (53) | `U\N56` (5980) |
| `retry_outcome:replay_only_not_appendable` | 1 | `N57` (53) | `U\N57` (5980) |
| `retry_payload_source_predicate` | 1 | `N58` (1) | `U\N58` (6032) |
| `retry_permission` | 1 | `N59` (7) | `U\N59` (6026) |
| `retry_source_transition` | 1 | `N60` (3) | `U\N60` (6030) |
| `retry_stop` | 1 | `N61` (7) | `U\N61` (6026) |
| `retry_terminal` | 1 | `N62` (1) | `U\N62` (6032) |
| `run_anchor_*` | 1 | `N63` (20) | `U\N63` (6013) |
| `run_anchor_kind` | 1 | `N64` (10) | `U\N64` (6023) |
| `scope_partition` | 2 | `N65` (63) | `U\N65` (5970) |
| `source_*` | 2 | `N66` (38) | `U\N66` (5995) |
| `source_digest` | 1 | `N67` (8) | `U\N67` (6025) |
| `source_edition` | 1 | `N68` (8) | `U\N68` (6025) |
| `source_input_digest` | 1 | `N69` (8) | `U\N69` (6025) |
| `source_original_join` | 1 | `N70` (8) | `U\N70` (6025) |
| `source_output_digest` | 1 | `N71` (6) | `U\N71` (6027) |
| `source_stage_evidence` | 1 | `N72` (300) | `U\N72` (5733) |
| `source_stage_method` | 1 | `N73` (34) | `U\N73` (5999) |
| `source_stage_operation` | 1 | `N74` (38) | `U\N74` (5995) |
| `source_stage_status` | 1 | `N75` (90) | `U\N75` (5943) |
| `successor_complete_graph` | 1 | `N76` (1) | `U\N76` (6032) |
| `successor_graph_digest` | 1 | `N77` (1) | `U\N77` (6032) |
| `successor_method_selection` | 1 | `N78` (1) | `U\N78` (6032) |
| `successor_physical_selection` | 1 | `N79` (1) | `U\N79` (6032) |
| `successor_read_backup_restore` | 1 | `N80` (1) | `U\N80` (6032) |
| `successor_resource_selection` | 1 | `N81` (1) | `U\N81` (6032) |
| `successor_storage_member` | 1 | `N82` (1) | `U\N82` (6032) |
| `successor_storage_selection` | 1 | `N83` (1) | `U\N83` (6032) |
| `truncation_grows_output` | 1 | `N84` (2) | `U\N84` (6031) |
| `unresolved_schema_reference` | 3 | `N85` (107) | `U\N85` (5926) |
| `wrapper_key_join` | 1 | `N86` (6) | `U\N86` (6027) |
| `wrapper_physical_digest` | 1 | `N87` (16) | `U\N87` (6017) |

## All ten Astra defect classes

| Class | Independent mutation and refusal/acceptance boundary |
|---|---|
| **1. Forged/contradictory inputs** | Every family/scope rejects a forged event identity and forged original bytes. Board stage status/proof/method/operation and owner metadata controls refresh dependent commitments; the actual selected original must agree field by field. All semantic/physical hashes are recomputed. |
| **2. Storage metadata** | Every scope vector retries each changed sequence/observed/persisted field and gets the original full result; read mismatches against Storage's unchanged source refuse. Caller payload cannot establish Storage truth. |
| **3. Historical readers** | All scope vectors preserve valid originals after changed live state; compatibility/replay-only history reads while current append/retry refuses it. Withdrawal/publication/access/deletion/hold and forged/unproven/foreign original controls refuse. Numeric retained event/source positives prove current numeric guards do not reach captured originals. |
| **4. One field read two ways** | Integer, uppercase and spaced digest substitutes refuse (including ValueError on an out-of-domain integer). Current number tokens/values have one canonical domain, before current hashes/identity/retry; typed retained sources keep their original exact bytes/domains. |
| **5. Unvisited refs** | Each of 53 scope vectors adds an optional absent resource and absent fragment; eager closure refuses before instance visitation. No selected schema/graph/URI changed; original scoped-id, pointer, anchor and full storage closure repairs remain. |
| **6. Partial size limits** | Every scope vector rejects a complete oversized inline operation, accepts its intact external pack, then rejects undurable pack/index evidence. All six application wrappers independently overflow after other joins/hashes are synchronized and reject wrapper size. Existing UTF-8, boundary, multibyte, full-pack and body-ref controls remain. |
| **7. Custody on every path** | Foreign family/envelope and original source refuse for every scope; all six application V1/V2 post/read/archive sources exercise every mandatory original stage and proof commitment. Current retries/history/recovery retain original byte custody. Native authentication remains NOT_RUN. |
| **8. Masked negatives** | The complete final guard table proves each exact flip set and every unchanged unrelated rejection reason; copied source, evidence, physical, token and post-state observations are synchronized. No guard has an empty flip set without a named duplicate. |
| **9. Overstated grades** | All 300 cells are reread/regraded; exact quotations mechanically verified. Oracle upgrades depend on final checker, guard proof and probes. Membership remains ABSENT, retention PARTIAL, native execution/custody/authentication/durability/CAS/restore/withdrawal races NOT_RUN. |
| **10. Numeric aliases** | All 25 families / 53 vectors test 1.0, -0, 1e0 and 01 through current input refusal. Actual RFC8785 preimages and semantic digests equate integral aliases; synchronized current negatives and original-result retry positives prove neither duplicate identity nor loss of original receipt custody. |

Independent class probe result: **1,658 negative probes across 25 families / 53 vectors**, plus the named live/history/compatibility/external positives; classes 8 and 9 are completed by the guard table and quote audit rather than inferred from other classes.

## Preserved confirmed findings and boundaries

| Confirmed finding | Preserved result |
|---|---|
| DO-01 / DO-02 | CV-366 application keys, closed content/content_ref split and original body joins remain. |
| DO-03 | Exact coordination storage composition and every original agent member remain unchanged. |
| DO-04 | Failure, blockage and interruption retries, original source state/attempt joins and permission/ceiling/Stop/deadline/lineage/operation fences remain; actual guard removals still prove them. |
| DO-C2-01 | Both source/stored BLAKE3 71-character fences and independent trailing-LF/suffix negatives remain. |
| DO-A01 | Complete all-family append/retry/read/checkpoint joins, encoded Project partitions, replay-only refusals and semantic/Storage-metadata separation remain. |
| DO-A02 | Complete aggregate payload/wrapper limits, exact external bytes/BLAKE3/media/length and durability witnesses remain. |
| DO-A03 | Actual phase count, retry cause/counter/source, truncation and closed priority guards remain. |
| DO-A04 successor | CV-740/SP-723's whole immutable V2 message/source/wrapper/method/read/backup/restore selection remains exact, including original subject/priority/routing/body. All frozen V1/Project resources and physical codecs remain byte-identical. No header inference, V1 URI rebind or new product choice. |
| DO-C4-01 | Exact offline eager selected closure remains, including dormant source/storage/schema branches. |
| DO-C4-02 | Historical original admission/source/producer validity remains separate from current live state and current exact reader/publication/disclosure fences. |

No retention/deletion answer changes. DL-084's parent-chat histories, DL-085's coordination archive-as-visibility/application counterpart and DL-086's run diagnostics keep their current owner bindings and named retention integration. The prior pinned retention dependency remains `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`; Q1/Q3 and linked-successor/integration/per-family admission stay open. The 43 inherited coordination anchored-pattern integration items and four unrelated frozen Goal refs are outside this selected DO graph. No native, retention integration, Event Authority admission or governance clearance is claimed.

## Verification

| Check | Exit/result |
|---|---|
| Complete DO checker | 0; **25 families / 9,043 checks**, no stopped facet, native NOT_RUN |
| Full CLI controls | **33 / 33 exit 1**, each expected diagnostic present; number-token, five original stages, V1/V2 read/archive and proof metadata controls |
| Final guard audit | 0; 87 groups / 706 positives / 6,033 negatives, no invalid/masked/unproved case |
| Independent Astra classes | 0; 1,658 probes, all 25 families |
| Shard generate/check | 0 / 0; top-level pass, 99 sources / 3,096 shards |
| Index generate/validate | 0 / 0; parsed top-level pass; all 15 ignored currentness inputs SHA-equal |
| Event-index binding tests | 0; 14/14 |
| Coordination checker | 1; same 2 failures, complete JSON equal to prior reviewed baseline |
| Runtime canon | 1; same 161 failures, complete JSON equal |
| Storage-profile checker | 1; same 41 errors, complete JSON equal |
| Scope/preservation/quote audit | Exact frozen V1/V2/Project/source graph and storage/event registries; 327 exact quotations / 300 cells |
| Python syntax / git diff --check | 0 / 0 |

**Changed owner units:** OSI-680..704 numeric-domain qualifications, OSI-681..683 original custody, CV-740/SP-723 custody detail, ATS-360 negative obligations; fixture/checker companions only. Generated shards stay in these four edited owners' directories; global indexes are regenerated. No unrelated owner, schema/source URI, storage registry, admission registry, lock or evidence-governance edit.

**IDs used:** no new IDs. Retained lane IDs **OSI-680..704, SP-720..723, CV-740, ATS-360**. No registry append, admission or Decision Log entry.

**Procedure:** starting root free 84 GB / available RAM 13 GiB, above the 50/6 floors. Sparse detached local worktree at the exact reviewed head. No delegation, browser, server, landing or main push. The task-specific no-mail rule was followed after its brief was read (two initial read-only mailbox listing calls preceded that read; no registration or message was sent). Temporary edit-generation files and the literal-path worktree are removed after branch push and final delivery preparation.

## Retained evidence

Base path: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-5/`. Full-byte SHA-256 follows; the source-mutating table names every flipping/still-rejected case.

| Artifact | SHA-256 |
|---|---|
| `after-check.json` | `9d9ea7918d5db4c54655bff0d4812eb9aeec058b7382ceb238c90a3d071cbe06` |
| `guard-removal-table.json` | `5f2e2a14cf160062b39f54038e6795472c0c03e8efdd121039559d8f7a0aaed4` |
| `guard-diagnostics-summary.json` | `bed86b7187e5112ff3b216f0b30405e6cc4d6e228832f1f484e947996f127752` |
| `guard_audit.py` | `06ebb693c1b2926db24a3eb1b6b935df3955443e2b9bbc119a2bbd7bf37bc14d` |
| `astra-class-probes.json` | `a92c94adabb83fb9de91939c6ffeec6209e109238f87d69bc79d12dd620cfe49` |
| `class_probes.py` | `4c74604daf598f6da0f4468d5b0449d521fb6f442d5637cff5eddc2d4e17f7b0` |
| `full-cli-controls.json` | `4201927ecf4dfc35d57a80f0ea4a1d627d6f1463e6d031bce523e22dd5e4f4e9` |
| `cli_controls.py` | `90e14cafa1199538cdc03ec91a188c0cfde23d53369c7b61de2264b498ce4790` |
| `regrade.json` | `37f81040a4be4e336a59c9311aa942c9e65ecb7e7267790dcbd717673bd03250` |
| `preservation.json` | `7b7b8d1bfb7eb11454f50a9ddf2b2a3ad165d6dc93214d52ae2274be886fc954` |
| `baseline-comparison.json` | `55550c53ea57f3afbb435559d55efcb6999506530f0febb849b3e3a8ea5eeec6` |
| `currentness.json` | `0a76a4b38a6d14305bbd3a2fe42e68febfc482acb104b48c4cde0661404ffa12` |
| `shard-check.json` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `index-validate.stdout` | `23acf8c830693cabc3c8b14c8b0d2bb450f457157530937345dd8c07b4fbe53c` |
| `check-results.json` | `8c244220aafbc424473f80999f46b19806ac8d8e8726667327d937d0ad296498` |
| `stage-metadata-before.json` | `e32c8869f9611ae894f1e53f1a7e346e9463e695809f4b5fb2bbfde05207c215` |
