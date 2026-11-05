# DO — technical fix round 6

**Branch:** `plans/ea-w2-orchestrator-20261104`. **Reviewed head:** `f48c329aaed1faddb1481bd6133097200ba2f185`. **Assessed fix:** `0e938f2fbd3a3f2e09b2dffca0e0ea37a857f715`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DO-sol/REVIEW-cycle6.md`.

**25/25 prepared under the lane exceptions; native NOT_RUN.** Independent cycle-6 grades **225 PASS / 50 PARTIAL / 25 ABSENT → 250 PASS / 25 PARTIAL / 25 ABSENT**. Each oracle cell moves PARTIAL → PASS after the complete final-source proof. Membership remains ABSENT; retention remains PARTIAL.

## Review round 6: findings and responses

- **DO-C6-01 — fixed (`0e938f2fbd3a3f2e09b2dffca0e0ea37a857f715`). Where:** `Plans/orchestrator-subagent-integration.md:32173` (OSI-680..704), `scripts/pm-orchestrator-event-contracts.py:48`, `scripts/pm_orchestrator_event_oracles.py:646` and `:690`, the closed historical witness and file-backed retained vectors. **Cause:** the current RFC8785 recipe reminted valid prior-writer identities. **Fix:** the authenticated original writer edition/recipe selects exactly `ea-do-json-v1` (the actual previous JSON serializer) or `ea-do-rfc8785-v2`. The recipe witness binds exact event/key/family/schema/Storage/partition and original receipt bytes; no arbitrary-hash or newest-recipe fallback. Recompute under that selected original recipe. Recovery verifies the original before returning its exact full receipt; equal-semantic retries retain its lifetime key/ID. All 25 families have old/new recipe, compatibility and original-result controls; forged identities and withdrawn/foreign/unverified evidence refuse with otherwise synchronized Storage observations. The independent probe compares 159 IDs against the actual previous writer function, not a reimplementation assumed equivalent.
- **DO-C6-02 — fixed (`0e938f2fbd3a3f2e09b2dffca0e0ea37a857f715`). Where:** `scripts/pm-orchestrator-event-contracts.py:210`, `scripts/pm_orchestrator_event_oracles.py:106` (`fixture_loads`), current event/input boundaries, original source/receipt paths, and ATS-360. **Cause:** a global current-number parser reached retained material before historical dispatch. **Fix:** decode original domains intact and apply strict raw token validation only to explicit current input roots. Current schema/identity/source/retry inputs still refuse aliases; historical event, captured producer facts, receipts, typed V1/V2 board originals and pack metadata retain valid original numeric forms and exact bytes/types. The real fixture file includes 478 complete retained positives, six typed board sources, 106 exact original-result retries and 530 isolated forged/withdrawn/foreign evidence negatives. Complete-main controls include the original retained representations themselves.
- **Item 11 type sweep — fixed (`0e938f2fbd3a3f2e09b2dffca0e0ea37a857f715`). Where:** `scripts/pm_orchestrator_event_oracles.py:140`, `:199`, `:228`, `:268` and `:629`, the exact payload schemas and failure exit-code validation. **Cause:** truthiness and Python boolean/numeric equality could substitute strings or booleans for the owner type. **Fix:** validate the exact JSON type before comparison; numbers accept the original supported numeric domain while excluding booleans. The strict current-number fence remains at current ingress. Per-family payload, receipt, historical disclosure/admission and transport controls cover string booleans/numbers, null, arrays and nested objects. File-backed type banks contain 5,349 payload controls, 224 producer-context controls and 1,943 boundary controls.
- **Review note: board family association — fixed (`0e938f2fbd3a3f2e09b2dffca0e0ea37a857f715`). Where:** `scripts/pm-orchestrator-event-contracts.py:85` and `:156` (`board_join_errors`/`board_storage_checks`). **Cause:** a sibling board selector could retain the old payload schema/source and was not joined to the unchanged complete EventRecord. **Fix:** require exact selected family/payload schema plus complete original envelope identity, partition and lineage. Twenty schema association controls and a complete-main changed-selector control refuse. C5-01, CV-740/SP-723 and every frozen V1/V2 resource remain intact.

## Family grades and standing checks

Every row has the twelve-criterion before/after grade **9 PASS / 2 PARTIAL / 1 ABSENT → 10 PASS / 1 PARTIAL / 1 ABSENT**. No conflicts. The before grade is the independent cycle-6 review.

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

S1: current append/retry rejects replay-only. S2: exact CV-366 application component, with fabricated application scope refused for Project-only diagnostics. S3: encoded project~ partition. S4: whole stored parts/SP-337 and durable references. S5: exact identifiers/LF. S6: producer semantics exclude Storage-assigned metadata; return original complete result. S7: actual Storage/source/checkpoint/token joins. S8: failure codes are exact integer 1. S9: eager selected reference closure, including dormant branches. S10: valid originally written history under its original recipe/codec, with present disclosure and exact family publication fences. S11: complete final-source mutation proof below.

## Check 11 — final guard-removal table

**94 guard groups / 1,668 valid baselines / 14,984 single-defect negatives / 1,408,496 mutant-negative evaluations.** Every group or named duplicate set is weakened one at a time; all its occurrences flip and every unrelated negative retains its exact rejection reasons. Final checker hashes match. No invalid/mixed/uncovered emitter. All 260 duplicate display-name occurrences are checked by multiplicity; D00001 onward uniquely identify the actual cases in the JSON manifest. U is the complete 14,984-case universe. N01 onward denotes each exact flip-ID list; its complement is the exact stay-ID list.

Pure schema/type preconditions run their actual production validator at its declared shape seam; relational cases run their full helper. Recovery delegates the same original-history invariants and is exercised on both positive and rejecting originals. Repeated enforcement sites are named duplicate sets, preserving the earlier proof method; no production guard or expectation is bypassed.

| Removed guard / named duplicate set | Sites | Negatives that flip | Negatives that stay rejected for their own reason |
|---|---:|---|---|
| `accepted_original_source_join` | 1 | `N01` (28) | `U\N01` (14956) |
| `anchored_identifier_fullmatch` | 1 | `N02` (1) | `U\N02` (14983) |
| `application_*_schema` | 1 | `N03` (334) | `U\N03` (14650) |
| `application_message_body_representation` | 1 | `N04` (1) | `U\N04` (14983) |
| `application_wrapper_over_16k` | 1 | `N05` (1) | `U\N05` (14983) |
| `board_family_payload_join` | 1 | `N06` (40) | `U\N06` (14944) |
| `checkpoint_identity_token` | 2 | `N07` (583) | `U\N07` (14401) |
| `checkpoint_not_current` | 1 | `N08` (1) | `U\N08` (14983) |
| `checkpoint_schema` | 1 | `N09` (106) | `U\N09` (14878) |
| `checkpoint_source_storage_identity` | 1 | `N10` (1) | `U\N10` (14983) |
| `closed_payload_schema` | 1 | `N11` (6579) | `U\N11` (8405) |
| `envelope_*` | 1 | `N12` (10) | `U\N12` (14974) |
| `event_join_*` | 1 | `N13` (848) | `U\N13` (14136) |
| `event_schema` | 1 | `N14` (53) | `U\N14` (14931) |
| `event_type_join` | 1 | `N15` (53) | `U\N15` (14931) |
| `failure_oracle_success_code` | 1 | `N16` (32) | `U\N16` (14952) |
| `family_current_replay_policy` | 1 | `N17` (53) | `U\N17` (14931) |
| `historical_disclosure_fence` | 1 | `N18` (75) | `U\N18` (14909) |
| `historical_original_admission` | 1 | `N19` (50) | `U\N19` (14934) |
| `historical_original_recipe` | 1 | `N20` (424) | `U\N20` (14560) |
| `historical_original_source` | 1 | `N21` (50) | `U\N21` (14934) |
| `historical_reader_identity` | 1 | `N22` (25) | `U\N22` (14959) |
| `historical_reader_withdrawn` | 1 | `N23` (262) | `U\N23` (14722) |
| `historical_schema_unsupported` | 1 | `N24` (25) | `U\N24` (14959) |
| `historical_state_schema` | 1 | `N25` (2279) | `U\N25` (12705) |
| `identity` | 1 | `N26` (10) | `U\N26` (14974) |
| `index_birth_anchor_join` | 1 | `N27` (1) | `U\N27` (14983) |
| `index_complete_row_set` | 1 | `N28` (53) | `U\N28` (14931) |
| `index_complete_source_coverage` | 1 | `N29` (1) | `U\N29` (14983) |
| `index_original_source_join` | 1 | `N30` (106) | `U\N30` (14878) |
| `index_row_*` | 1 | `N31` (424) | `U\N31` (14560) |
| `index_row_locator_join` | 1 | `N32` (1) | `U\N32` (14983) |
| `index_row_schema` | 1 | `N33` (1) | `U\N33` (14983) |
| `index_source_prefix` | 1 | `N34` (1) | `U\N34` (14983) |
| `inline_base64_body` | 1 | `N35` (25) | `U\N35` (14959) |
| `inline_payload_join` | 1 | `N36` (1) | `U\N36` (14983) |
| `inline_payload_over_16k` | 1 | `N37` (50) | `U\N37` (14934) |
| `logical_payload_schema` | 2 | `N38` (53) | `U\N38` (14931) |
| `message_*` | 3 | `N39` (23) | `U\N39` (14961) |
| `message_content_join` | 2 | `N40` (6) | `U\N40` (14978) |
| `message_sender` | 1 | `N41` (3) | `U\N41` (14981) |
| `message_source` | 2 | `N42` (7) | `U\N42` (14977) |
| `message_target` | 1 | `N43` (5) | `U\N43` (14979) |
| `message_target_type` | 1 | `N44` (3) | `U\N44` (14981) |
| `number_domain` | 5 | `N45` (223) | `U\N45` (14761) |
| `number_token_canonical` | 2 | `N46` (17) | `U\N46` (14967) |
| `payload_encoding` | 1 | `N47` (1) | `U\N47` (14983) |
| `payload_pack_types` | 1 | `N48` (21) | `U\N48` (14963) |
| `payload_reference` | 6 | `N49` (128) | `U\N49` (14856) |
| `payload_types` | 1 | `N50` (12) | `U\N50` (14972) |
| `phase_context_type` | 2 | `N51` (14) | `U\N51` (14970) |
| `phase_force_predicate` | 1 | `N52` (4) | `U\N52` (14980) |
| `project_original_input_shape` | 1 | `N53` (4) | `U\N53` (14980) |
| `replay_only_not_appendable` | 1 | `N54` (53) | `U\N54` (14931) |
| `retry_attempt` | 1 | `N55` (2) | `U\N55` (14982) |
| `retry_ceiling` | 1 | `N56` (7) | `U\N56` (14977) |
| `retry_context_type` | 3 | `N57` (210) | `U\N57` (14774) |
| `retry_deadline` | 1 | `N58` (7) | `U\N58` (14977) |
| `retry_lineage` | 1 | `N59` (7) | `U\N59` (14977) |
| `retry_operation` | 1 | `N60` (2) | `U\N60` (14982) |
| `retry_outcome:different_identity` | 1 | `N61` (53) | `U\N61` (14931) |
| `retry_outcome:idempotency_conflict` | 1 | `N62` (53) | `U\N62` (14931) |
| `retry_outcome:replay_only_not_appendable` | 1 | `N63` (53) | `U\N63` (14931) |
| `retry_outcome:retry_value_schema` | 1 | `N64` (636) | `U\N64` (14348) |
| `retry_payload_source_predicate` | 1 | `N65` (1) | `U\N65` (14983) |
| `retry_permission` | 1 | `N66` (7) | `U\N66` (14977) |
| `retry_source_transition` | 1 | `N67` (3) | `U\N67` (14981) |
| `retry_stop` | 1 | `N68` (7) | `U\N68` (14977) |
| `retry_terminal` | 1 | `N69` (1) | `U\N69` (14983) |
| `run_anchor_*` | 1 | `N70` (20) | `U\N70` (14964) |
| `run_anchor_kind` | 1 | `N71` (10) | `U\N71` (14974) |
| `scope_partition` | 2 | `N72` (63) | `U\N72` (14921) |
| `source_*` | 2 | `N73` (38) | `U\N73` (14946) |
| `source_digest` | 1 | `N74` (8) | `U\N74` (14976) |
| `source_edition` | 1 | `N75` (8) | `U\N75` (14976) |
| `source_input_digest` | 1 | `N76` (8) | `U\N76` (14976) |
| `source_original_join` | 1 | `N77` (8) | `U\N77` (14976) |
| `source_output_digest` | 1 | `N78` (6) | `U\N78` (14978) |
| `source_stage_evidence` | 1 | `N79` (300) | `U\N79` (14684) |
| `source_stage_method` | 1 | `N80` (34) | `U\N80` (14950) |
| `source_stage_operation` | 1 | `N81` (38) | `U\N81` (14946) |
| `source_stage_status` | 1 | `N82` (90) | `U\N82` (14894) |
| `successor_complete_graph` | 1 | `N83` (1) | `U\N83` (14983) |
| `successor_graph_digest` | 1 | `N84` (1) | `U\N84` (14983) |
| `successor_method_selection` | 1 | `N85` (1) | `U\N85` (14983) |
| `successor_physical_selection` | 1 | `N86` (1) | `U\N86` (14983) |
| `successor_read_backup_restore` | 1 | `N87` (1) | `U\N87` (14983) |
| `successor_resource_selection` | 1 | `N88` (1) | `U\N88` (14983) |
| `successor_storage_member` | 1 | `N89` (1) | `U\N89` (14983) |
| `successor_storage_selection` | 1 | `N90` (1) | `U\N90` (14983) |
| `truncation_grows_output` | 1 | `N91` (2) | `U\N91` (14982) |
| `unresolved_schema_reference` | 3 | `N92` (107) | `U\N92` (14877) |
| `wrapper_key_join` | 1 | `N93` (6) | `U\N93` (14978) |
| `wrapper_physical_digest` | 1 | `N94` (16) | `U\N94` (14968) |

## All eleven Astra defect classes

| Class | Independent probe and result |
|---|---|
| **1. Forged/contradictory inputs** | Recompute event/key, original physical and semantic commitments, recipe witness and synchronized Storage observations. Forged retained ID/key controls fail solely at their own identity join; source and recipe evidence substitutions refuse. |
| **2. Storage metadata** | All scope vectors change sequence/observed/persisted metadata on retries and get the original complete receipt; read mismatches against the unchanged Storage original refuse. |
| **3. Historical readers** | 159 actual prior-writer identities pass, plus both recipe editions, changed live state and compatibility reads; forged/withdrawn/foreign/unverified originals refuse. Exact recovery returns original receipt bytes. |
| **4. One field read two ways** | Digest integer/case/space substitutions refuse. Current numeric tokens/values have one domain. Original typed/physical material is decoded with its selected original recipe/codec, without changing its representation. |
| **5. Unvisited refs** | Every scope vector adds absent optional URI/fragment controls; eager closure refuses before instance visitation. No selected immutable schema URI or source graph was rebound. |
| **6. Partial size limits** | Whole payload overflow, valid intact external packs and non-durable/forged references execute for every scope; all six V1/V2 application wrappers independently overflow after dependent commitments are synchronized. |
| **7. Custody on every path** | Every family verifies original source, exact family and current publication before read/recovery. All six application board source paths retain accepted stages, recorded request/result and stage witnesses; sibling family/schema/envelope substitutions refuse. |
| **8. Masked negatives** | The final guard table proves exact flip sets and unchanged unrelated errors; dependent event, hash, row, token, stage and physical observations are synchronized. Invalid/mixed intermediate controls were rebuilt, never credited. |
| **9. Overstated grades** | Regrade all 300 cells and verify each exact quotation. PASS is static preparation only; membership ABSENT, retention PARTIAL and native NOT_RUN remain. |
| **10. Numeric aliases** | Current 1.0/-0/1e0/01 controls refuse at current ingress. Old 1.0/1e0/1e20 IDs match the actual previous writer; file-backed retained payload/context/source/index representations pass without reminting. |
| **11. Types confused** | All-family payload/receipt/state/transport cases plus context/pack/exit-code controls refuse string booleans/numbers, null, arrays, nested objects and boolean-number aliases at the declared type boundary. |

## Preserved fixes and open integration items

Per-family search evidence at the reviewed snapshot covers all 25 names across 96 current canonical documents: no prior named recipe-evidence selector exists; reuse the current owner arrays, first-receipt custody and actual previous writer serializer. The new original-recipe selector is a newly authored technical owner binding for these existing DL-045 families only; no sibling inference or product choice.

C5-01 original accepted-stage custody, DO-01 CV-366 keys, DO-02 posted body split, DO-03 original coordination composition, DO-04 retry source/permission/Stop/deadline/lineage/counters, C2-01 BLAKE3 length/LF fences, A01 complete EventRecord/checkpoint/retry joins, A02 whole-value transport, A03 actual predicates, A04 successor, C4-01 dormant refs and C4-02 historical withdrawal remain. The original 486 custody controls still run. Frozen V1, governed V2, Project resources, source graph and both registries are byte-identical to the reviewed head.

No product or retention choice changed. DL-084/085/086 bindings retain dependency `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`; retention integration, linked-successor physical form, Q1/Q3 and per-family admission remain open. The 43 inherited coordination pattern integration items and four unrelated frozen Goal refs remain outside the selected DO graph. Native authentication, actual first receipts, durability, CAS, restore and withdrawal races remain NOT_RUN. Synthetic verified adapters test joins and do not authenticate native custody.

## Verification

| Check | Exit / result |
|---|---|
| Complete DO checker | 0; 25 families / 27,337 checks, no stopped facet; native NOT_RUN |
| Complete-main controls | 11/11: one retained-source positive exits 0; ten named current/forged/withdrawn/custody/family negatives exit 1 |
| Actual previous writer regression | 0; 159 earlier-recipe IDs match the actual old function; history/checkpoint/recovery pass; forged/withdrawn/foreign values refuse |
| Independent Astra probes | 0; 2,188 recorded probes across 25 families / 53 vectors, plus positive and producer-type assertions |
| Final guard audit | 0; 94 groups / 1,668 baselines / 14,984 negatives / 1,408,496 evaluations; all occurrence counts and exact unrelated reasons pass |
| Shard generate/check | 0 / 0; 99 source docs / 3,096 shards; only the two edited owner directories change |
| Index generate | 0; generated with all 15 ignored currentness inputs present and SHA-equal |
| Index validate | 1; parsed top-level fail: 22 identical reviewed-index failures against advanced origin/main bc399e19742ddc6afd1a1cb1d77a33845341d565; no PlanUnit removed by this fix; every named path unchanged |
| Event-index binding tests | 0; 14/14 |
| Coordination / runtime canon / storage profile | 1 / 1 / 1; complete outputs exactly equal earlier reviewed baselines (2 / 161 / 41 failures) |
| Source/fixture/guard preservation | 0; original fixture banks retained; current writer/number guards and C5/A04 functions unchanged; frozen schemas/graphs/registries unchanged |
| Quote / scope / syntax / whitespace | 0; 427 exact range quotations / 300 cells; no unrelated or prohibited path |

**Scope:** only OSI-680..704 prose, ATS-360 obligations, historical witness schema, fixtures and the two DO checker files. Shards changed only in the two edited owner directories; global indexes regenerated with all 15 currentness inputs SHA-equal. No admission, registry append, Decision Log, new plan ID, governance artifact, frozen validator, native code, subagent, pm-mail or main push.

**IDs used:** no new IDs. Retained **OSI-680..704, SP-720..723, CV-740, ATS-360** (31 existing lane IDs).

**Procedure:** starting root free 81 GB / available RAM 8 GB; sparse detached worktree `/home/sittingmongoose/pm-worktrees/DO-fix6` at the pinned head. Guard mutations run one guard or named duplicate set at a time, with a 6 GB available-RAM check before each; no production bypass. Branch pushed and the literal-path worktree removed after delivery preparation.

## Retained evidence

Base: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-6/`. Each retained artifact below is cited by complete-byte SHA-256.

| Artifact | SHA-256 |
|---|---|
| `after-check.json` | `a21eac48c1544af02a5a903e5c7bece32d10d2d0cc4cc418c2dd30a58b06eae2` |
| `guard-removal-table.json` | `1d3c8b307e7ccc0fa372d80aedca68f71261a9a81ff44b1dab5fb135bb453bdd` |
| `guard-removal-names.json` | `c8534f8ac7db6c0f82812bc744e1266f2943054b9d69f5210a9a3609b87db9b5` |
| `guard_audit.py` | `19ae5be0f31058497c0b7a5cc0aa8427c94ff15768aa813a8e1fafe0bb49155f` |
| `normalize_guard_table.py` | `a7ef998dc23d62bc06af0f29827bc9a5b71a9b2f00fd8912ddacf2c6e9bc4280` |
| `guard-occurrence-proof.json` | `bb748c5112342d15884c8b1a68b3ba2aa772ecf4a50bfb79b080db91fd673406` |
| `guard-bank-diagnostics.json` | `099896c30c72ae7ddad72cf9a12c716a2bba94842fade05d3abaf3e1a8f347d5` |
| `guard-diagnostics-summary.json` | `453643091dea3daa0bea95ff6741c5853613e51e18585359dbc1606d4f04c67a` |
| `guard-audit.log` | `0d618d5351c824a5229676b13a50c3ffd7333c902c754073d1ec3e4cc094911b` |
| `full-cli-controls.json` | `59a71a794e919164e6cd7082f5b5b867670da5e312ee66b2efde347ed8802db2` |
| `cli_controls.py` | `fec42969817c235a5347f12a9595062eaee4f8e71c3a35f7178e099c8836fc17` |
| `astra-class-probes.json` | `5aff46ad0519eeb37354b30a4b58587f8d81a7d83ca178143c3a43e2e4fbf8ca` |
| `class_probes.py` | `32637137d7d5ffb7d21e56faae661d479292a447a5de63d7f751db1cdf8b9624` |
| `regression-probes.json` | `9eb28db5633bce1a65775a96622d336a3361f3bc08d9cae2d496137b86bcab0b` |
| `regression_probes.py` | `b9f3986b4813d7e681a0d0b1f794300179b31c84c9c518fb321d7a2715c77893` |
| `regrade.json` | `bffc29d243bda48368f9df8807ee95681195d98b064e77442bcd5974204d3a88` |
| `preservation.json` | `352aff1ca13ed53a581fb4d554fd6583feb13a305c04183f398b0ff24c0bb11a` |
| `fixture-preservation.json` | `92f2d9134f9e14cc73e5a94c6d47f85baf920f57335a362c64311cabf17dd431` |
| `prior-guard-preservation.json` | `d2da1ee39010486cd6d71efb693fb1bf32d8bc54d87d3149ba8d1e1757061d0b` |
| `baseline-comparison.json` | `da5fc54ce7b54d713198d6cf691d212736b01344b036964c20f72ebb9d6afb97` |
| `companion-results.json` | `142dae0fdf27299a21ae33a06fb7db965fc4d5fea9d9a96d271b84f8b9756374` |
| `currentness.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `shard-generate.json` | `fafb1c33a567c68de84f9f26c3cbd2828d5f49a400771374af7218463f00b5d2` |
| `shard-check.json` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `index-generate.json` | `94cdcb291c0cae3b458d0e904cc5ef6c621c450385349eb83633482dfab1c8e4` |
| `index-validate.json` | `3f75c7482f19fb907eacdaaead73fb0352878c7cf5bb541c81f49caa90e2ee67` |
| `index-baseline-comparison.json` | `cced2b22d7d1e5236273e6fced4b051c031e699940dc05ce0f7a6860a441e5a4` |
| `event-index-tests.log` | `188bab90114f40295dc273a1492d52fa1ed5a6a6589715ef08bda07dd2a53bcd` |
| `recipe-search-evidence.json` | `4de21f888607deb501d0dffbc6857e0a047f44be6d41581383336930788d0b84` |
| `scope-audit.json` | `b6db1c5592fbd02178651cb6be6338d9fbd2459ee519ec6969e7768660d1d4cb` |
| `final-input-hashes.json` | `e9ba9dc2232428e13531e0f17541ba4211addfbf34d056bdf2e26b9080c7bf33` |
