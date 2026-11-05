# DO — technical fix round 7

Branch `plans/ea-w2-orchestrator-20261104`; reviewed head `8e6995a24f9dfb84e60ed41771765e4e296ea38f`; implementation commit `3005b38bb48cf45cee766789f61bcf314287aea9`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DO-sol/REVIEW-cycle7.md`.

**25/25 prepared under the authorized membership/retention exceptions; native NOT_RUN.** Independent cycle-7 grade **225 PASS / 50 PARTIAL / 25 ABSENT → 250 PASS / 25 PARTIAL / 25 ABSENT**, no conflicts. Every family is **9 PASS / 2 PARTIAL / 1 ABSENT → 10 PASS / 1 PARTIAL / 1 ABSENT**. Membership stays ABSENT, retention stays PARTIAL.

## Review round 7: findings and responses

- **DO-C7-01 — fixed (`97064e1c914377d7d9c0c5ac5915724b7e575f1a`). Where:** `scripts/pm_orchestrator_event_oracles.py:106` and `:1228`, plus the original `compatibility_event_cases` fixture collection. **Cause:** round 6 repaired decoding and added a separate retained collection, but its complete-entry positive used the ordinary fixture, whose original compatibility loop still saw integer originals. Direct historical-helper tests and the new retained collection never exercised the old compatibility loop with numeric originals; the removal census proved only its supplied bank. That loop reused a historical positive as a current replay-only negative, coupling replay policy with a correctly rejected current numeric form. **Fix:** `number_rule_for_record` alone chooses strict current input versus an authenticated original recipe. Retained read/checkpoint/recovery callers use it; current append/retry always select the strict rule. The compatibility loop keeps its original bytes and recipe and builds its replay-only negative from a separately valid current input, changing replay policy alone. All 25 families have six added compatibility originals (both recipes × 1.0/1e0/1e20), 750 bound-recipe negatives, exact original receipt recovery and the original 31 complete-file-input controls. Selector-only controls use a valid integer original whose identity agrees under both recipes, so proof removal is not masked by an independently changed identity. Float originals retain their real writer identities and separate forged proof controls. No current guard was relaxed and no original was reminted to fit a current negative.
- **DO-C7-02 — fixed (`97064e1c914377d7d9c0c5ac5915724b7e575f1a`, `3005b38bb48cf45cee766789f61bcf314287aea9`). Where:** `scripts/pm_orchestrator_event_oracles.py:593` and `board_source_errors`. **Cause:** Project originals had member-name and selected equality checks, leaving unjoined types unchecked. **Fix:** validate complete unchanged Project source/message/context/body/reference shapes and exact field/element types before values or joins, then enforce existing message/priority enums and body/format rules. The 994 file-backed controls cover all four Project variants, every field, nullable/boolean/list elements, nested context and body references. Four additional single-defect controls enforce the owner-required Project posted target joins, including well-typed contradictory values. Existing source codec and valid original integral-float sizes remain; no live resolution state is consulted. The four original resolved-string full-entry controls now exit 1.
- **DO-C7-03 — fixed (`97064e1c914377d7d9c0c5ac5915724b7e575f1a`). Where:** all failure-descriptor paths in `check_oracles`, through `failure_oracle_errors` at `:867`. **Cause:** three loops compared exit codes using Python equality, accepting true and 1.0. **Fix:** every failure descriptor uses the existing exact-integer helper. Bool, float, string and success-code controls refuse; all three formerly affected collections have full-entry controls and the float alias is in the direct guard bank.
- **DO-C7-04 — fixed (this report and regenerated external evidence). Where:** `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-7/recipe-search-evidence.json`. **Cause:** the earlier owner hash matched neither declared snapshot; its provenance is unverified. **Fix:** re-run every family search across all 96 pinned input blobs and absent tokens. Each row now names the searched input commit/path/SHA separately from the authored output commit/path/SHA, preserves the invalid former value and explicitly supersedes the old artifact. No old hash is silently relabelled.

## Every retained and compatibility validation path

| Path | Write-time rule and current boundary |
|---|---|
| `fixture_loads` | Decodes original JSON types intact. Only explicitly current input roots invoke token checks, which route to the central current rule. Every retained collection dispatches to its original verifier below. No key-name exemption rewrites an original. |
| `event_cases` historical reads; `historical_cases`; generated numeric history | `historical_read_errors` validates the closed witness, selects the authenticated original recipe, substitutes captured original producer facts, and calls historical event validation. `record_number_errors` repeats that same selection before original schema/identity checks. Current live state is never original evidence. |
| `retained_event_cases` | Same historical selector, selected writer identity and exact bytes; both recipes remain supported. |
| `compatibility_event_cases` | Same original selector/read path, including replay-only originals. Its current append/retry negatives are independent canonical inputs. This is the path round 6 missed. |
| `retained_history_negatives`, `compatibility_history_negatives` | Same full original read and recovery path; missing/foreign/contradictory/unverified recipe evidence refuses. |
| `checkpoint_errors` (direct and historical) | Calls the same original selector before validating exact stored event/index/token joins; no current number-domain predicate reaches the original. |
| `recover_original`, `retained_retries` | Full historical verification/recipe selection precedes receipt return or retry. `retry_outcome` schema-checks the original without applying a current numeric guard to it; only its incoming candidate receives the central strict current rule. Lifetime event/key and exact original receipt stay unchanged. |
| Board storage, retained board originals, generated numeric board sources | Current event payload/envelope use the central current rule. Original source/input/wrapper use their selected immutable V1/V2 codec or unchanged Project adapter; integer semantics exclude bool while preserving originally valid integral floats. These are original source codecs, not a second event identity recipe or a current-number exception. C5 stage custody and A04's graph remain exact. |

## Family grades and standing checks

S1 replay-only current refusal; S2 exact CV-366 key; S3 encoded project partition; S4 complete stored parts/SP-337; S5 full-match identifiers/LF; S6 producer semantics excluding Storage metadata; S7 Storage/source/checkpoint/token joins; S8 exact integer failure code; S9 eager reference closure; S10 lawful original history through the complete checker; S11 whole-lane removal proof.

| Family | Unit | Oracle before → after | S1..S11 | Prepared before → after |
|---|---|---|---|---|
| `config.validation.failed` | OSI-680 | PARTIAL → PASS | PASS | no → yes |
| `crew.board_message_posted` | OSI-681 | PARTIAL → PASS | PASS | no → yes |
| `crew.board_message_read` | OSI-682 | PARTIAL → PASS | PASS | no → yes |
| `crew.board_messages_archived` | OSI-683 | PARTIAL → PASS | PASS | no → yes |
| `parser.error` | OSI-684 | PARTIAL → PASS | PASS | no → yes |
| `phase.force_completed` | OSI-685 | PARTIAL → PASS | PASS | no → yes |
| `subagent.budget_warning` | OSI-686 | PARTIAL → PASS | PASS | no → yes |
| `subagent.cancelled` | OSI-687 | PARTIAL → PASS | PASS | no → yes |
| `subagent.completed` | OSI-688 | PARTIAL → PASS | PASS | no → yes |
| `subagent.context_warning` | OSI-689 | PARTIAL → PASS | PASS | no → yes |
| `subagent.escalated` | OSI-690 | PARTIAL → PASS | PASS | no → yes |
| `subagent.failed` | OSI-691 | PARTIAL → PASS | PASS | no → yes |
| `subagent.message_received` | OSI-692 | PARTIAL → PASS | PASS | no → yes |
| `subagent.message_sent` | OSI-693 | PARTIAL → PASS | PASS | no → yes |
| `subagent.model_switched` | OSI-694 | PARTIAL → PASS | PASS | no → yes |
| `subagent.output_truncated` | OSI-695 | PARTIAL → PASS | PASS | no → yes |
| `subagent.paused` | OSI-696 | PARTIAL → PASS | PASS | no → yes |
| `subagent.progress` | OSI-697 | PARTIAL → PASS | PASS | no → yes |
| `subagent.resumed` | OSI-698 | PARTIAL → PASS | PASS | no → yes |
| `subagent.retried` | OSI-699 | PARTIAL → PASS | PASS | no → yes |
| `subagent.spawned` | OSI-700 | PARTIAL → PASS | PASS | no → yes |
| `subagent.started` | OSI-701 | PARTIAL → PASS | PASS | no → yes |
| `subagent.timeout` | OSI-702 | PARTIAL → PASS | PASS | no → yes |
| `subagent.tool_called` | OSI-703 | PARTIAL → PASS | PASS | no → yes |
| `subagent.tool_completed` | OSI-704 | PARTIAL → PASS | PASS | no → yes |

## Check 11 — complete final guard table

**96 guard groups / 1,989 valid baselines / 19,079 negative occurrences / 1,831,584 mutant-negative evaluations.** One guard or named duplicate set is removed at a time. Every own occurrence flips; every unrelated negative keeps its exact rejection reasons. No invalid, mixed or uncovered emitter; no bypass. Duplicate names are checked by Counter, then every occurrence receives a unique D00001 onward ID. All 260 duplicate display-name occurrences are retained.

Schema/type preconditions run their actual production shape validator; relational guards run the full helper. `project_original_input_*` are the exact Project adapter seam before joins. Existing duplicate groups retain their declared meaning: checkpoint Storage/token joins; payload pack integrity/reference joins; application source/input/wrapper schema enforcement; repeated logical schema, number and message/source joins. Pure immutable schema/closure memoization does not cache any relational result or mutated guard. U is the full 19,079-case manifest. Nxx is the exact flip-ID list in the cited JSON; U\Nxx is its exact stay-ID list. Production source and mutant hashes and removed-site counts are in that artifact.

| Removed guard / named duplicate set | Sites | Negatives that flip | Negatives that stay rejected |
|---|---:|---|---|
| `accepted_original_source_join` | 1 | N01 (28) | U\N01 (19051) |
| `anchored_identifier_fullmatch` | 1 | N02 (1) | U\N02 (19078) |
| `application_*_schema` | 1 | N03 (334) | U\N03 (18745) |
| `application_message_body_representation` | 1 | N04 (1) | U\N04 (19078) |
| `application_wrapper_over_16k` | 1 | N05 (1) | U\N05 (19078) |
| `board_family_payload_join` | 1 | N06 (40) | U\N06 (19039) |
| `checkpoint_identity_token` | 2 | N07 (583) | U\N07 (18496) |
| `checkpoint_not_current` | 1 | N08 (1) | U\N08 (19078) |
| `checkpoint_schema` | 1 | N09 (106) | U\N09 (18973) |
| `checkpoint_source_storage_identity` | 1 | N10 (1) | U\N10 (19078) |
| `closed_payload_schema` | 1 | N11 (7377) | U\N11 (11702) |
| `envelope_*` | 1 | N12 (10) | U\N12 (19069) |
| `event_join_*` | 1 | N13 (848) | U\N13 (18231) |
| `event_schema` | 1 | N14 (53) | U\N14 (19026) |
| `event_type_join` | 1 | N15 (53) | U\N15 (19026) |
| `failure_oracle_success_code` | 1 | N16 (33) | U\N16 (19046) |
| `family_current_replay_policy` | 1 | N17 (53) | U\N17 (19026) |
| `historical_disclosure_fence` | 1 | N18 (75) | U\N18 (19004) |
| `historical_original_admission` | 1 | N19 (50) | U\N19 (19029) |
| `historical_original_recipe` | 1 | N20 (1924) | U\N20 (17155) |
| `historical_original_source` | 1 | N21 (50) | U\N21 (19029) |
| `historical_reader_identity` | 1 | N22 (25) | U\N22 (19054) |
| `historical_reader_withdrawn` | 1 | N23 (262) | U\N23 (18817) |
| `historical_schema_unsupported` | 1 | N24 (25) | U\N24 (19054) |
| `historical_state_schema` | 1 | N25 (2279) | U\N25 (16800) |
| `identity` | 1 | N26 (10) | U\N26 (19069) |
| `index_birth_anchor_join` | 1 | N27 (1) | U\N27 (19078) |
| `index_complete_row_set` | 1 | N28 (53) | U\N28 (19026) |
| `index_complete_source_coverage` | 1 | N29 (1) | U\N29 (19078) |
| `index_original_source_join` | 1 | N30 (106) | U\N30 (18973) |
| `index_row_*` | 1 | N31 (424) | U\N31 (18655) |
| `index_row_locator_join` | 1 | N32 (1) | U\N32 (19078) |
| `index_row_schema` | 1 | N33 (1) | U\N33 (19078) |
| `index_source_prefix` | 1 | N34 (1) | U\N34 (19078) |
| `inline_base64_body` | 1 | N35 (25) | U\N35 (19054) |
| `inline_payload_join` | 1 | N36 (1) | U\N36 (19078) |
| `inline_payload_over_16k` | 1 | N37 (50) | U\N37 (19029) |
| `logical_payload_schema` | 2 | N38 (53) | U\N38 (19026) |
| `message_*` | 3 | N39 (27) | U\N39 (19052) |
| `message_content_join` | 2 | N40 (5) | U\N40 (19074) |
| `message_sender` | 1 | N41 (3) | U\N41 (19076) |
| `message_source` | 2 | N42 (3) | U\N42 (19076) |
| `message_target` | 1 | N43 (5) | U\N43 (19074) |
| `message_target_type` | 1 | N44 (3) | U\N44 (19076) |
| `number_domain` | 4 | N45 (223) | U\N45 (18856) |
| `number_token_canonical` | 2 | N46 (17) | U\N46 (19062) |
| `payload_encoding` | 1 | N47 (1) | U\N47 (19078) |
| `payload_pack_types` | 1 | N48 (21) | U\N48 (19058) |
| `payload_reference` | 6 | N49 (128) | U\N49 (18951) |
| `payload_types` | 1 | N50 (12) | U\N50 (19067) |
| `phase_context_type` | 2 | N51 (14) | U\N51 (19065) |
| `phase_force_predicate` | 1 | N52 (4) | U\N52 (19075) |
| `project_original_input_shape` | 1 | N53 (4) | U\N53 (19075) |
| `project_original_input_type` | 3 | N54 (942) | U\N54 (18137) |
| `project_original_input_value` | 1 | N55 (57) | U\N55 (19022) |
| `replay_only_not_appendable` | 2 | N56 (53) | U\N56 (19026) |
| `retry_attempt` | 1 | N57 (2) | U\N57 (19077) |
| `retry_ceiling` | 1 | N58 (7) | U\N58 (19072) |
| `retry_context_type` | 3 | N59 (210) | U\N59 (18869) |
| `retry_deadline` | 1 | N60 (7) | U\N60 (19072) |
| `retry_lineage` | 1 | N61 (7) | U\N61 (19072) |
| `retry_operation` | 1 | N62 (2) | U\N62 (19077) |
| `retry_outcome:different_identity` | 1 | N63 (53) | U\N63 (19026) |
| `retry_outcome:idempotency_conflict` | 1 | N64 (53) | U\N64 (19026) |
| `retry_outcome:replay_only_not_appendable` | 1 | N65 (53) | U\N65 (19026) |
| `retry_outcome:retry_value_schema` | 1 | N66 (1434) | U\N66 (17645) |
| `retry_payload_source_predicate` | 1 | N67 (1) | U\N67 (19078) |
| `retry_permission` | 1 | N68 (7) | U\N68 (19072) |
| `retry_source_transition` | 1 | N69 (3) | U\N69 (19076) |
| `retry_stop` | 1 | N70 (7) | U\N70 (19072) |
| `retry_terminal` | 1 | N71 (1) | U\N71 (19078) |
| `run_anchor_*` | 1 | N72 (20) | U\N72 (19059) |
| `run_anchor_kind` | 1 | N73 (10) | U\N73 (19069) |
| `scope_partition` | 2 | N74 (63) | U\N74 (19016) |
| `source_*` | 2 | N75 (38) | U\N75 (19041) |
| `source_digest` | 1 | N76 (8) | U\N76 (19071) |
| `source_edition` | 1 | N77 (8) | U\N77 (19071) |
| `source_input_digest` | 1 | N78 (8) | U\N78 (19071) |
| `source_original_join` | 1 | N79 (8) | U\N79 (19071) |
| `source_output_digest` | 1 | N80 (6) | U\N80 (19073) |
| `source_stage_evidence` | 1 | N81 (300) | U\N81 (18779) |
| `source_stage_method` | 1 | N82 (34) | U\N82 (19045) |
| `source_stage_operation` | 1 | N83 (38) | U\N83 (19041) |
| `source_stage_status` | 1 | N84 (90) | U\N84 (18989) |
| `successor_complete_graph` | 1 | N85 (1) | U\N85 (19078) |
| `successor_graph_digest` | 1 | N86 (1) | U\N86 (19078) |
| `successor_method_selection` | 1 | N87 (1) | U\N87 (19078) |
| `successor_physical_selection` | 1 | N88 (1) | U\N88 (19078) |
| `successor_read_backup_restore` | 1 | N89 (1) | U\N89 (19078) |
| `successor_resource_selection` | 1 | N90 (1) | U\N90 (19078) |
| `successor_storage_member` | 1 | N91 (1) | U\N91 (19078) |
| `successor_storage_selection` | 1 | N92 (1) | U\N92 (19078) |
| `truncation_grows_output` | 1 | N93 (2) | U\N93 (19077) |
| `unresolved_schema_reference` | 3 | N94 (107) | U\N94 (18972) |
| `wrapper_key_join` | 1 | N95 (6) | U\N95 (19073) |
| `wrapper_physical_digest` | 1 | N96 (16) | U\N96 (19063) |

## Astra classes 1..12 and 10a

| Class | How ruled out |
|---|---|
| **1. Forged/contradictory inputs** | Recomputed event/key, semantic/physical/source commitments, exact recipe binding and original source/stage joins; independent forged controls refuse. |
| **2. Storage metadata** | Retry metadata changes return the original complete receipt; reads compare the unchanged actual Storage record, row and token. |
| **3. Historical readers** | Both recipes, changed live state, numeric retained/compatibility originals and exact recovery pass the full path; forged/withdrawn/foreign/access/deletion/hold controls refuse. |
| **4. One field read two ways** | Digest aliases refuse; exact Project field types and failure-descriptor integer types precede value comparisons; original numeric representations keep their selected original recipe. |
| **5. Dormant references** | Eager offline closure includes every selected branch; every-family missing URI/fragment and original stored-board controls refuse. |
| **6. Partial size checks** | Whole EventRecord payloads, external packs and intact V1/V2 wrappers retain complete byte/durability checks; no truncation. Project bodies/references now receive the same existing body rules. |
| **7. Custody on every path** | Original recipe/admission/source and current disclosure/publication verified before read/recovery; all six application board stage paths and sibling-family joins remain. |
| **8. Masked negatives** | Exact full-table flip/stay proof, including all 1,924 recipe-proof occurrences. Historical compatibility positives and canonical current negatives are separate. Selector-only negatives use an otherwise unchanged valid input. |
| **9. Overstated grades** | All 300 cells regraded from independent cycle 7; exact source quotations verified. Membership ABSENT, retention PARTIAL and native NOT_RUN remain. |
| **10. Numeric aliases** | Current 1.0/-0/1e0/01 refusals remain; actual earlier-writer identities for 1.0/1e0/1e20 and exact receipts survive. |
| **11. Types** | All prior payload/state/context/transport controls remain, plus every Project original field/element and the three descriptor paths; boolean, string-number/boolean, null, arrays, nested objects and 1.0 exit aliases refuse. |
| **12. Formats** | Every formatted declaration in the selected resource inventory uses an enforced checker. Retry envelope/payload validators now pass it explicitly. RFC3339 UTC full-match grammar rejects missing zone, wrong separators/calendar/ranges, LF, leap seconds, comma/empty fractions, offsets and basic ISO forms. Legal arbitrary decimal fractions remain exact through both original recipes, retained/compatibility reads and recovery. UUID malformed/LF controls refuse. The local Python parser's acceptance of 24:00 is explicitly fenced. |
| **10a. Tightening versus history** | Central selection verifies authenticated original recipe rather than applying current number restrictions to history. File-backed positives cover both editions/all 25 families; forged selectors and proof substitutions refuse. Format enforcement implements the existing RFC3339 contract, not the Python parser's broader false accepts; legal original precision is preserved byte-for-byte. |

All late-list items apply to round 7. No earlier-round exemption is claimed.

## Preserved scope and integration boundaries

Every earlier fixture bank is retained as an exact typed-JSON prefix. Current numeric-domain enforcement, original identity serializers, retry policy, original C5 application custody branch, A04 application source graph/schema, frozen resources, Project owner prose and both registries match the reviewed head. This round edits only the two DO checker files, their fixture and this report/self-grade; it adds no PlanUnit or owner binding. No canonical Markdown changed, so no derived files require regeneration. The shard check and index validation still ran with all 15 ignored currentness files SHA-equal.

DL-045 and DL-084..088 premises and retention dependency 4d52bd2758526cd0e8a56358baaa73049c1d4bdd remain. Retention integration, linked-successor physical/admission work and Q1/Q3 remain open. No admission, registry append, Decision Log, Spec Lock, auto-decision, frozen-validator, governance reseal or main push. Native authentication, first-append durability, CAS, actual restore and withdrawal races remain NOT_RUN.

## Verification

| Check | Exit / result |
|---|---|
| `complete_checker` | 0 |
| `original_writer_regression` | 0 |
| `astra_classes` | 0 |
| `review_types` | 0 |
| `format_sweep` | 0 |
| `full_entry_controls` | 0 |
| `earlier_cli_controls` | 0 |
| `shard_check` | 0 |
| `index_validate` | 1 |
| `event_index_tests` | 0 |
| `coordination` | 1 |
| `runtime_canon` | 1 |
| `storage_profile` | 1 |

Complete DO: **25 families / 34,971 checks**, no stopped facet. Full-entry controls: **20/20** expected exits; earlier CLI bank: **11/11**. Item-12 sweep: **1,200** probes. Parsed index top-level status: **fail**; its exact diagnostics and baseline disposition are retained in `index_validate.stdout` (21 ledger-record errors plus main-only DL-302; exact row comparison is retained). Direct index validation reports 21 pre-existing invalid ledger decision records and main-only DL-302; its exact rows are compared with the earlier full-worktree run. Every named ledger, Decision Log and index-validator path is unchanged by this fix. Carry DL-302 through integration; do not invent a deletion decision. Companion outputs retain their reviewed pre-existing failures; no such failure is claimed as a pass.

**IDs used:** no new IDs. Retained **OSI-680..704, SP-720..723, CV-740, ATS-360** (31 existing lane IDs).

**Procedure:** VM local sparse detached worktree; start 113 GB disk free / 13 GB RAM available. No pm-mail or subagents. Each checker family runs serially and every guard checks the 6 GB available-memory floor. The CLI and final test stages paused at 5/4 GB and resumed only after recovery; completed CLI inputs were rejoined by exact input SHA-256 and pinned source hashes, without repeating or bypassing a case. Branch pushed only to its named lane; temporary worktree removed after the pushed report and grade were copied.

## Retained evidence

Base: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-7/`. Artifacts below are exact complete-byte SHA-256 values; raw name/progress tables are compressed or removed after normalization. Historical evidence is explicitly superseded where corrected, not silently overwritten.

| Artifact | SHA-256 |
|---|---|
| `after-check.json` | `80020327c3ecea38d9f1b3dd7cd202b0a357263585272064196dc7e62fbd853b` |
| `complete_checker.stdout` | `80020327c3ecea38d9f1b3dd7cd202b0a357263585272064196dc7e62fbd853b` |
| `guard-removal-table.json` | `f95c2284bcb51843b20eb872a5d267ef0691320faee52dee826d89da1017da43` |
| `guard-removal-table.json.gz` | `f4db4d29643a01d55b17dc50df9c305cd57a1c5344c5815715c64b21bf04960c` |
| `guard-removal-names.json.gz` | `1fa719a12dee67f8ed82d5c55e49c9681cb16dfcfaa666999aca5d775c4d5242` |
| `guard-bank-diagnostics.json` | `1140cb871e2a5b87023cff262ab2e70030027947fb73ff5e47d0ae687f44de4d` |
| `guard-diagnostics-summary.json` | `0c696022600bb5dd23903d57d44361f2965cd0115c5da9181313cfb765a64115` |
| `guard_audit.py` | `945fd37e114bd518b15da4265ef953c55363398ec9becc7ad9a5d20bd3ac3872` |
| `normalize_guard_table.py` | `6706509fffd283b632f5049a7fe85b781a697136be9e2ebc52d60b757132fe8b` |
| `entry-controls.json` | `4385db5a1b0a3b9ee8082adfd808e9083e66ba53064fe26ebc0f27bea0d7130f` |
| `entry_controls.py` | `5a42e1002928b971f00e84ac4e2d7ee9ab35b7c26aa29fdb5695bca395051b87` |
| `full-cli-controls.json` | `149e6225e241342ea1752d15e34d34351a24a49c421576665c9089cc4ef76c64` |
| `regression-probes.json` | `9eb28db5633bce1a65775a96622d336a3361f3bc08d9cae2d496137b86bcab0b` |
| `astra-class-probes.json` | `cb82360ba036bdfdb40117083be5d1d577ad8ff002f16d5254f224d27e7f443a` |
| `format-sweep.json` | `e673e884eb305eb10aa23559f26dd447a0b4c02fd3145229bc1c6c87ba901753` |
| `format_sweep.py` | `103303094faa009f2bb8f5fb6dd7d8e14a78a8dadb9383c45ed9fee2dfa1a6d3` |
| `verification-results.json` | `461cd8ed359786f9d9b7aff8497fd4796b1370cab6473b0b8c7726f10e230022` |
| `recipe-search-evidence.json` | `294c9c805611a9e16480851352f82fee678106cbd9a8e86288bccb2fc6c7a937` |
| `correct_search.py` | `d250425a0880eb5b38d6eb3a65f1befbe25e55dce0f5ea9e490e61e2202a7e59` |
| `fixture-preservation.json` | `2777391eb9ee3166049e18fd451317e4ccd54f429f0a27f886dc59d19c92a2b7` |
| `preservation.json` | `afa5875311389d7ddced643a1c75e231479140b10b86cc63657a6171569e8862` |
| `currentness.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `index_validate.stdout` | `02e5a70b7d4d9e095d116ef2f232fd76d1ddbf47edba78a3dfbb394a31e0383a` |
| `baseline-comparison.json` | `175c18a0db0feaa2c86c21de8d05299439c34bc15fea4302ec3813fbbd72246a` |
| `scope-audit.json` | `ee5e77006e1f5e009a6a5ccfa1722bc2fe45215aab043b25450539b88d93e8c3` |
| `memory-pause.json` | `2ca60c92a6068a95275d851bdd5ee430112d6744c66ec48e2f0e18ec7d2c6127` |
| `index-baseline-comparison.json` | `5ac204c4d14abdfbbce29f59ab7e66514e740eac4125005157200230c6423ec5` |
