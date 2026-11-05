# DR — fix round 7: exact restore-source JSON types

Branch `plans/ea-w2-runtime-artifacts-20261104`; reviewed head `379727030a1e0e6929a11e5f9595e1fe2f35db1a`; implementation `2d92a6977184325037bf8b52e8292dccf04d335a`. Final delivery head is recorded in external `drafts/DR/HEAD.txt`.

**Result:** cycle-6 review 18/19 prepared → **19/19 prepared without admission**. Grades **208 PASS / 1 PARTIAL / 19 ABSENT → 209 PASS / 0 PARTIAL / 19 ABSENT**. Membership remains ABSENT; native execution remains NOT_RUN.

## Review round 7: findings and responses

- **C6-B1 — fixed (`2d92a6977184325037bf8b52e8292dccf04d335a`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:1028`, `observation_admissible`, O03 and `scripts/pm_runtime_artifact_round7_cases.py`; existing RAP-113/SP-533/CV-533/ATS-260. Why: Python dictionary equality aliases boolean false with `0`/`0.0`, and true with `1`/`1.0`. Fix: validate the complete source snapshot using the adopted logical schema **before** comparing exact encoded values. No coercion. Nine required/optional restore booleans, protected/unprotected references, first/successor and inline/packed routes supply **832 new one-defect pairs**. Wrong forms include `0`, `1`, `0.0`, `1.0`, string booleans/numbers, null, arrays and nested objects. Source shape negatives are included. The candidate, identity, predecessor and pack bytes stay intact. All valid controls accept. O03 has **833 own flips**, no masked cases or unrelated flips. Injecting `restores_files: false → 0` into positive source adapters now makes the actual full restore checker exit 1/status fail; no production guard or expected answer is modified in that trial.
- **N1 — integration item retained.** The required unmodified `pm-plan-index.py validate` exits 1 with top-level `fail`. All 22 failures match N1: DL-302 plus 21 pre-existing removal-ledger format errors. The branch still predates current-main units; the three-dot branch scope changes no Decision Log or owner prose this round. Preserve current-main units (including DL-302), regenerate at integration and rerun the original validator. No baseline substitution or unrelated ledger repair is claimed as a pass.

**Disputed:** none. **Stopped for Jared:** none.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Twelve rubric cells; expected absence is registry non-admission.

| Exact family | Before → after |
|---|---|
| `runtime_artifact.api_web_call` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.artifact_version` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.before_after_snapshot` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.browser_recording` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.code_diff` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.context_snapshot` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.cost_usage` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.document` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.evidence` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.failed_attempts` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.hitl_approval` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.implementation_plan` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.reasoning_summary` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.screenshot` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.subagent_lineage` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.suggested_next_steps` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.tool_llm_trace` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `runtime_artifact.validation_test` | 11P / 0Q / 1A → 11P / 0Q / 1A |

## Whole guard table

**93/93 guards; 6,886 distinct valid/negative pairs; 7,087 owned acceptance flips; zero masked cases; zero unrelated flips.** Every complete mutant checker returns exit 1/status fail. All nineteen family checkers run sequentially under each guard or named duplicate set; available memory is checked before each family and guard. The raw production modules independently reproduce all baseline pairs and owned flips without schema, codec or hash memoization. No guard, expectation or negative from the reviewed inventory is removed.

O03 names the duplicated type defenses: adopted source-snapshot schema and exact encoded snapshot join. They are removed together for the causal witness. Existing forwarded/repeated-rule sets stay explicit (F01→A07, F13→H06, F11→C06 custody-event, D12→B01 decode/packed-append, repeated canonical JSON and checkpoint joins). All other isolated negatives remain refused.

| Guard / named rule | Negatives that flip (names in DR.guard-removal.json) | Other negatives stay refused | Full checker |
|---|---|---:|---|
| `D01` — decode: event_validator.iter_errors | `envelope_extension` (19) | 6867 | 1 / fail |
| `D02` — decode: row['payload_schema_id'] | `family`, `payload_schema` (38) | 6848 | 1 / fail |
| `D03` — decode: event['scope_kind'] | `redaction`, `replay` (38) | 6848 | 1 / fail |
| `D04` — decode: len(rfc8785.dumps(payload)) | `inline_size` (19) | 6867 | 1 / fail |
| `D05` — decode/stored: exact pack media and reference grammar | `media` (19) | 6867 | 1 / fail |
| `D06` — decode: event['payload'] != {} | `placeholder` (19) | 6867 | 1 / fail |
| `D07` — decode: not source or | 22 named cases; full list in `DR.guard-removal.json` (418) | 6468 | 1 / fail |
| `D08` — decode: len(body) != int(size) | `byte_size` (19) | 6867 | 1 / fail |
| `D09` — decode: blake3(body).hexdigest() != digest | `same_size_digest` (19) | 6867 | 1 / fail |
| `D10` — canonical JSON: unique members and canonical serialization (same encoding rule) | `duplicate_member`, `whitespace` (38) | 6848 | 1 / fail |
| `D11` — decode: len(body) <= INLINE_LIMIT | `unnecessary_pack` (19) | 6867 | 1 / fail |
| `D12` — decode: validator(schema | 124 named cases; full list in `DR.guard-removal.json` (163) | 6723 | 1 / fail |
| `D13` — decode: payload['project_id'] != event['project_id'] | `project_join` (19) | 6867 | 1 / fail |
| `D14` — decode: payload.get(field) | `attempt_id`, `node_id`, `run_id`, `thread_id` (76) | 6810 | 1 / fail |
| `D15` — decode: payload['created_at_utc'] | `authored_time` (19) | 6867 | 1 / fail |
| `D16` — decode: payload['actor_ref'] | `actor` (19) | 6867 | 1 / fail |
| `D17` — decode: event['idempotency_key'] | `identity` (19) | 6867 | 1 / fail |
| `D18` — decode: point['project_id'] | `point_project` (1) | 6885 | 1 / fail |
| `H01` — inspect: source['withdrawn'] | 22 named cases; full list in `DR.guard-removal.json` (418) | 6468 | 1 / fail |
| `H02` — inspect: source['source_valid'] | 22 named cases; full list in `DR.guard-removal.json` (418) | 6468 | 1 / fail |
| `H03` — inspect: source['project_id'] | `family`, `project` (38) | 6848 | 1 / fail |
| `H04` — inspect: source['original_payload'] | `changed_original` (19) | 6867 | 1 / fail |
| `H06` — resolve_history: not full_value_matches | `authenticated_custody` (19) | 6867 | 1 / fail |
| `H05` — explicit supported historical decoder selection | `decoder_selection` (2) | 6884 | 1 / fail |
| `F01` — full_value_matches: stored_event_valid | `invalid_issued_custody`, `schema` (38) | 6848 | 1 / fail |
| `F02` — full_value_matches: value_bytes(candidate) == value_bytes(stored) | `original_value_bytes` (19) | 6867 | 1 / fail |
| `F03` — full_value_matches: custody['scope_partition'] == scope_partition(candidate['project_id']) | `partition` (19) | 6867 | 1 / fail |
| `F04` — full_value_matches: custody['event_type'] == candidate['event_type'] | `custody_family` (19) | 6867 | 1 / fail |
| `F05` — full_value_matches: custody['idempotency_key'] == candidate['idempotency_key'] | `custody_key` (19) | 6867 | 1 / fail |
| `F06` — full_value_matches: value_bytes(receipt['sequence_id']) == value_bytes(candidate['sequence_id']) | `receipt_sequence`, `retained_exact_receipt_type` (38) | 6848 | 1 / fail |
| `F07` — full_value_matches: result['original_segment_ref'] == custody['original_segment_ref'] | `segment_reference` (19) | 6867 | 1 / fail |
| `F08` — full_value_matches: commitment(candidate) == custody['original_event_value_commitment'] == result['original_event_value_commitment'] | `full_commitment`, `result_commitment` (38) | 6848 | 1 / fail |
| `F09` — full_value_matches: semantic_digest(candidate) == custody['producer_semantic_digest'] | `semantic_commitment` (19) | 6867 | 1 / fail |
| `F10` — full_value_matches: value_bytes(receipt) == value_bytes(custody['first_append_receipt']) | `receipt_copy`, `retained_exact_receipt_type` (38) | 6848 | 1 / fail |
| `F11` — full_value_matches: receipt['event_id'] == candidate['event_id'] == custody['event_id'] | `custody_event`, `receipt_event`, `shipped_wrong_custody_event` (57) | 6829 | 1 / fail |
| `F12` — full_value_matches: value_bytes(result) == value_bytes(original['result']) | `original_result`, `retained_exact_receipt_type` (38) | 6848 | 1 / fail |
| `F13` — full_value_matches: value_bytes(custody) == value_bytes(original['custody']) | `authenticated_custody`, `original_custody`, `retained_exact_receipt_type` (57) | 6829 | 1 / fail |
| `V01` — stored_event_valid: event_validator.iter_errors | `event_extension` (19) | 6867 | 1 / fail |
| `V02` — stored_event_valid: event['scope_kind'] | `replay` (19) | 6867 | 1 / fail |
| `V03` — stored_event_valid: bool(PACK_REF.fullmatch(event['payload_ref'])) | `pack_ref` (19) | 6867 | 1 / fail |
| `V04` — stored_event_valid: event['payload'] == {} | `pack_placeholder` (19) | 6867 | 1 / fail |
| `V05` — stored_event_valid: len(rfc8785.dumps(event['payload'])) <= INLINE_LIMIT | `inline_size` (19) | 6867 | 1 / fail |
| `V06` — stored_event_valid: validator(load(row['payload_schema_ref']), validation=validation).is_valid(event['payload']) | `logical_schema` (19) | 6867 | 1 / fail |
| `V07` — stored_event_valid: return False | `unknown_dispatch` (19) | 6867 | 1 / fail |
| `A01` — append: admission is not True | `flag_type_admission_0`, `flag_type_admission_1`, `flag_type_admission_2`, `flag_type_admission_3`, `flag_type_admission_4`, `flag_type_admission_5`, `flag_type_admission_6`, `flag_type_admission_7`, `flag_type_admission_8`, `flag_type_admission_9`, `not_admitted` (209) | 6677 | 1 / fail |
| `A02` — append: source_valid is not True | 22 named cases; full list in `DR.guard-removal.json` (418) | 6468 | 1 / fail |
| `A03` — append: replay policy before dedupe (both refusal branches) | `append_once_retry`, `dedupe_by_event_id_retry`, `projector_replay_only_retry` (57) | 6829 | 1 / fail |
| `A04` — append: event['event_id'] in self.global_ids | `global_event_conflict` (19) | 6867 | 1 / fail |
| `A05` — append: original['custody']['producer_semantic_digest'] == digest | `scoped_semantic_conflict` (19) | 6867 | 1 / fail |
| `A06` — append: EVENT_VALIDATOR | `retry_envelope_extension` (19) | 6867 | 1 / fail |
| `A07` — append: not full_value_matches | `invalid_issued_custody` (19) | 6867 | 1 / fail |
| `P01` — policies_match: row.get('index_retention_policy_ref') == index_policy | `index` (19) | 6867 | 1 / fail |
| `P02` — policies_match: row.get('checkpoint_retention_policy_ref') == checkpoint_policy | `checkpoint` (19) | 6867 | 1 / fail |
| `P03` — policies_match: 'derived_retention_policy_ref' not in row | `conflated` (19) | 6867 | 1 / fail |
| `C01` — checkpoint: schema/key route and resolved checkpoint target | `available_wrong_schema_target`, `route`, `shipped_wrong_key_route` (57) | 6829 | 1 / fail |
| `C02` — checkpoint_matches: validator(schema, 'checkpoint') | `schema` (19) | 6867 | 1 / fail |
| `C03` — checkpoint store/key identities, including repeated token store/key joins | `shipped_wrong_checkpoint_store`, `shipped_wrong_custody_store`, `shipped_wrong_source_store`, `shipped_wrong_store_key`, `shipped_wrong_token_store`, `storage` (114) | 6772 | 1 / fail |
| `C04` — checkpoint live selection/verification/snapshot, including the repeated token snapshot join | 10 named cases; full list in `DR.guard-removal.json` (190) | 6696 | 1 / fail |
| `C05` — checkpoint_matches: generation != expected_generation | `shipped_wrong_frontier`, `shipped_wrong_pointer`, `token_commitment` (57) | 6829 | 1 / fail |
| `C06` — checkpoint_matches: not full_value_matches | `shipped_wrong_custody_event`, `shipped_wrong_event`, `source_event` (57) | 6829 | 1 / fail |
| `C07` — checkpoint_matches: source['scope_partition'] | `partition`, `shipped_wrong_locator`, `shipped_wrong_partition` (57) | 6829 | 1 / fail |
| `C08` — checkpoint_matches: selection['current_bytes_sha256'] | 36 named cases; full list in `DR.guard-removal.json` (684) | 6202 | 1 / fail |
| `C09` — checkpoint_matches: value_bytes(anchor['source_selection']) != value_bytes(selection) | `coverage` (19) | 6867 | 1 / fail |
| `C10` — checkpoint_matches: coverage['last_frame'] | `last_frame`, `source_frame_end_type`, `source_segment_retained_event_count_boolean`, `source_segment_scan_start_offset_boolean`, `source_segment_segment_generation_boolean` (95) | 6791 | 1 / fail |
| `C11` — checkpoint_matches: segment['scan_start_offset'] | `segment` (19) | 6867 | 1 / fail |
| `C12` — checkpoint_matches: value_bytes(bundle['datasets']) == value_bytes({token['index_dataset_name']: dataset}) | `dataset`, `shipped_missing_dataset` (38) | 6848 | 1 / fail |
| `C13` — checkpoint_matches: frontier['index_row_count'] == 1 | `row_count` (19) | 6867 | 1 / fail |
| `C14` — checkpoint_matches: frontier['index_row_set_sha256'] == binding_digest(dict( domain='pm.event_index.row_set.v1', entries=[dict(key=row_key, value=expected_row)])) | `row_set_digest` (19) | 6867 | 1 / fail |
| `O01` — observation_admissible: source['proof_valid'] | 33 named cases; full list in `DR.guard-removal.json` (33) | 6853 | 1 / fail |
| `O02` — observation_admissible: candidate['correlation_id'] != grouping_identity | `grouping` (1) | 6885 | 1 / fail |
| `O03` — source snapshot: adopted logical schema before exact encoded join (named duplicate type defenses) | 833 named cases; full list in `DR.guard-removal.json` (833) | 6053 | 1 / fail |
| `O04` — observation_admissible: candidate['producer_sequence_id'] == 0 and candidate['parent_event_id'] is None | `first_parent_event_id`, `first_producer_sequence_id` (2) | 6884 | 1 / fail |
| `O05` — observation_admissible: payload['artifact_id'] != | `artifact_id`, `project_id`, `record_ref`, `record_sha256`, `restore_point_id`, `source_branch_id`, `source_message_id`, `source_thread_id` (8) | 6878 | 1 / fail |
| `O06` — observation_admissible: payload['type_payload'] == old['type_payload'] | `unchanged` (1) | 6885 | 1 / fail |
| `O07` — observation_admissible: old_status != 'available' | `terminal_reopen` (1) | 6885 | 1 / fail |
| `O08` — observation_admissible: candidate['producer_sequence_id'] == previous['producer_sequence_id'] + 1 | `0`, `2` (2) | 6884 | 1 / fail |
| `O09` — observation_admissible: candidate['parent_event_id'] == previous['event_id'] | `predecessor` (1) | 6885 | 1 / fail |
| `O10` — observation_admissible: candidate['correlation_id'] == previous['correlation_id'] | `prior_group` (1) | 6885 | 1 / fail |
| `S01` — whole-document schema references, including optional/unvisited definitions | `unresolved_optional` (19) | 6867 | 1 / fail |
| `S02` — exact_pattern: re.search(pattern, instance) and re.fullmatch(pattern, instance) is None | `identifier_LF` (1) | 6885 | 1 / fail |
| `S04` — exact_pattern_properties: re.search(pattern, key) and re.fullmatch(pattern, key) is None | `identifier_key_LF` (1) | 6885 | 1 / fail |
| `S03` — current-writer provider hash overlay | `provider_hash` (2) | 6884 | 1 / fail |
| `S05` — rejected: return False | `success_is_not_failure` (1) | 6885 | 1 / fail |
| `I01` — identity: type(revision) | `boolean_observation_revision`, `fractional_observation_revision`, `missing_observation_revision`, `negative_observation_revision` (4) | 6882 | 1 / fail |
| `I02` — value_bytes: not math.isfinite | `infinite_value`, `nan_value`, `negative_infinite_value` (3) | 6883 | 1 / fail |
| `I03` — value_bytes: type(value) not in | `unsupported_binary` (1) | 6885 | 1 / fail |
| `S06` — validator: validation not in | `unsupported_validation_profile` (1) | 6885 | 1 / fail |
| `H07` — inspect: return ('metadata_only' if source['body_deleted'] else 'metadata_and_authorized_refs') if type(source['body_deleted']) is bool else 'unavailable' | 11 named cases; full list in `DR.guard-removal.json` (209) | 6677 | 1 / fail |
| `N01` — numeric_walk: not math.isfinite(value) | 32 named cases; full list in `DR.guard-removal.json` (608) | 6278 | 1 / fail |
| `B01` — source_agreement: copy != source | 205 named cases; full list in `DR.guard-removal.json` (240) | 6646 | 1 / fail |
| `B02` — decode: raw is False | `source_bytes_type_inline`, `source_bytes_type_packed` (4) | 6882 | 1 / fail |
| `B03` — decode: evidence['provider_payload_hash'] != expected | `source_digest_inline`, `source_digest_packed` (4) | 6882 | 1 / fail |
| `S07` — primitive JSON type at artifact_id, sequence_id and boolean scalar witness leaves; union/format tags retained | 21 named cases; full list in `DR.guard-removal.json` (399) | 6487 | 1 / fail |

## Eleven standing checks and Astra classes

The complete baseline has **20,400 distinct assertions, exit 0/status pass**, across nineteen sequential family runs; identical shared assertions are counted once and executed in each family run. All **45/45** standing mutation trials are caught. Every family retains standing checks 1–11; application scope is refused in this Project-only edition and is not application-writer certification. Historical support means authenticated issued originals, not invented unsupported legacy mappings.

| Astra class | Round-7 probe and result |
|---|---|
| 1 forged/contradictory input | Framed identity, full-value source joins and all B01/B02/B03 body/digest pairs rerun. C6-B1 source contradictions now refuse. |
| 2 Storage metadata | Full family suites preserve producer-semantic retries and reject forged Storage-owned copies against original receipt/custody. Real issuance remains NOT_RUN. |
| 3 retained history | 798 checks over 38 numeric and four provider originals reissue with the actual old models, preserve exact bytes after live changes and reject withdrawal/forgery. Historical decoder and commitment recipes are byte-identical to reviewed source. |
| 4 field read two ways | Source schema runs before encoded equality; current helper boolean predicates and numeric/copy boundaries receive integer/float/string/null/container probes. |
| 5 dangling references | Complete schema preflight and optional/unused/external/fragment standing mutations rerun; no bypass. |
| 6 sizes of every part | Existing exact 16 KiB inline/packed boundary, digest and canonical-storage checks rerun for every family. No stored operation/outbox value is added. |
| 7 custody paths | Inline/packed fresh append, retry, retained resolution, receipt and checkpoint joins rerun; source authentication remains a synthetic adapter. |
| 8 masked negatives | Complete 93-row table and uncached proof; one guard or explicitly named duplicate set at a time, with every unrelated negative still refused. |
| 9 grade precision | Only restore_point.positive_negative_oracles upgrades. All 680 exact evidence excerpts match current source. Native NOT_RUN and membership ABSENT remain explicit. |
| 10 numeric forms | 3666 independent boundary assertions include float/exponent/signed-zero/invalid leading-zero forms and unchanged originals. Every declared numeric scalar also receives representation probes. |
| 11 confused types | Raw sweep passes **220,163 assertions**, including **13,454 declared scalar positions** across nineteen families, optional fields and unused reachable definitions. All present event/payload/receipt/custody/result/checkpoint/token fields are tested at their complete schema boundary. Legal multi-type fixture fields keep their declared alternatives. Exact source-copy witnesses include every restore boolean. |

Both item 10 and item 11 apply to this round. Nothing is deferred under the later-added-item clause.

## Scope, authority and integration

Compared with `379727030a1e0e6929a11e5f9595e1fe2f35db1a`, **no Plans path changed**. Every owner unit, payload schema, fixture, frozen original, registry and generated shard/index is byte-identical. Production definitions other than `observation_admissible` and `main` are byte-identical; `main` only gains explicit family selection. All 5,668 old named negative pairs remain, with 1,218 additions. The other eighteen families change only shared test coverage and sequential execution controls, and keep their eleven PASS cells.

No new technical binding or Decision Log premise is applied. Existing DL-045/DL-075/DL-270, source/body policies, SP-278/SP-286/CV-339 and SP-337 remain as previously reviewed. No feature, retention/deletion choice or owner conflict is decided. Canonical Markdown was not edited, so derived regeneration is unnecessary; the unchanged shards are checked. Fifteen ignored currentness files match the shared edition by SHA-256. Native authentication/receipt issuance, sync/crash/CAS, backup/restore and UI execution remain NOT_RUN. Readiness remains blocked_runtime_certification_incomplete; no seal follows.

**IDs used: zero new.** Existing allocation stays RAP-100..118 / SP-520..538 / CV-520..538 / ATS-260 (58 IDs). No registry/admission, Decision Log, .gitignore, Spec Lock, governance evidence, auto-decisions or frozen-validator edit. No subagent, mailbox use, landing lock or main push.

## Verification commands and evidence

Exact argv, exit codes, duration and output hashes are in `DR.checks.json`; top-level index failure is retained as N1. Pinned dependencies come from `scripts/requirements-runtime-artifact-drafts.txt` plus PyYAML 6.0.3. All checks run one family at a time; available RAM stays at least 6 GB.

| Evidence under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-7/` | SHA-256 |
|---|---|
| `full-checker.json` | `f7daf3d9fc7df2b95446ce7bfe4584db58aeab9ca443e694f59ec358981e0832` |
| `complete-guard-removal.json` | `22b8a66085d1ff64025b634a42c29d4816d2c2924a31d3fb9dbb6cd20f1b79a2` |
| `raw-guard-proof.json` | `bae1cbb84a12b521bfa2a4cda0d60d51dd7da269b266c292279011d682d415d7` |
| `standing-mutations.json` | `cc1086e99654cd5eeb02f008c0de8ac14177a4a4183d79ee2a70f397c8fea289` |
| `type-number-sweep.json` | `5fcd4ec11e1083cca00821c59bc12824d44f0b7634c8f58c22e351d1ea3adb19` |
| `restore-full-checker.json` | `ab815091b5518da9aea3b5efbe39e502cd734b81a981616f759d5ba2440844ed` |
| `independent-boundaries.json` | `ed3d1d3a46219cf136753e12f05f62d01251904f1f9dd36ca77a36e8f637a6a3` |
| `historical-originals.json` | `d1cf8915f40e824cdb2722f874d4a784cb002a846f21951ab1a7a81670daa42b` |
| `scope-audit.json` | `5be0827893befc129570f12693b1075f0e302e2adb09e4710a32746b8af27132` |
| `grade-source-audit.json` | `9b8bd2bee98a4f51641f7f2d1219f881f1e93c1f7132678439ed80735b79a408` |
| `currentness-copy.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `runtime-schemas.json` | `3fd6ab6c00934eae504d164593562d2467fac84347c147e66ad97dcd88509c16` |
| `shard-check.json` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `index-validate.json` | `6c9ceeee9813f9e1615f5fad83d3a5506fb8ed3c56d2b0c7a8fc88492224fb86` |
| `validation-runs.json` | `437a1212b514495373c62d95f0545276637351cd4d1a29f982fb593572036853` |

The sparse detached fix worktree and temporary venv are removed after push; external `cleanup.json` records the completed cleanup. No browser or server was started.
