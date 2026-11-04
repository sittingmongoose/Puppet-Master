# DR — fix round 5, cycle-4 findings and whole-lane check 11

Branch `plans/ea-w2-runtime-artifacts-20261104`; reviewed head `32154c9415d1c78bebe3cd88c4cf2318ca411623`. Implementation `be654d70037b1e79b3d694469a5e32b031da2b3f`; primary B1/B2/B3 repair `935a89543b01f212ea868e342dcc32ca4ed3858d`, complete checkpoint-negative rebinding `c3e2a265dda7829bf0fa1c38bc12843b0839b734`. The report-only delivery head is pinned in external `drafts/DR/HEAD.txt`.

**Result:** 0/19 independently prepared before → **19/19 self-graded prepared without admission**. All 228 cells regraded: **190 PASS / 19 PARTIAL / 19 ABSENT → 209 PASS / 0 PARTIAL / 19 ABSENT**. Membership ABSENT and native NOT_RUN remain explicit. Independent acceptance belongs to the lead.

## Review round 5: findings and responses

- **B1 — fixed (`935a89543b01f212ea868e342dcc32ca4ed3858d`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:266` (decode), `:1054` (pack controls), CV-520..538 / ATS-260. Cause: the old wrong-digest reference had no reachable pack and old corruption changed length. Fix: change a reachable pack's 17,000-character summary from x to y without changing size, canonical JSON or logical schema. Keep absent-reference coverage separately as `missing_digest`. Its positive schema/size control passes. Removing only BLAKE3 comparison (`D09`) accepts this precise negative for 19/19 and makes the full checker fail for all nineteen. Length removal remains a separate `D08` witness.
- **B2 — fixed (`935a89543b01f212ea868e342dcc32ca4ed3858d`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:1121` (successor key repair), RAP-113. Cause: wrong ordinals retained the valid successor's key and failed identity dispatch first. Fix: recompute each `ra-observation1:` key for ordinals 0 and 2; require successful decode before the ordinal decision. Removing only consecutive-ordinal comparison (`O08`) accepts both negatives and makes the full checker fail. Parent, grouping, source snapshot, unchanged observation, immutable joins and terminal-state guards remain separate witnesses.
- **B3 — fixed (`935a89543b01f212ea868e342dcc32ca4ed3858d`).** Where: `scripts/pm-runtime-artifact-event-drafts.py:165` (validation selection), `:364` (history resolution), `:854` (authenticated source adapter); RAP-106/RAP-117 and CV-526/CV-537. Cause: original stored values always used the current-writer hash overlay. Fix: explicitly select `historical-v1-before-provider-hash`; append exposes no selector and keeps its strict current format. Historical requests compare event/result/custody against a separately frozen authenticated source original, never against themselves. Four unchanged inline/packed originals issued by checker `19c4973d6bd8fc71360fe012eede59cf31da5848` reproduce byte-for-byte, retain old strings, and resolve after live-state changes. Current writes, unknown decoders, withdrawal, authorization failure, forged source/receipt/event and well-formed forged custody still refuse. No historical schema bytes, issued receipt, original event or custody are rewritten.

**Disputed:** none. **Stopped for Jared:** none. **Open findings:** none.

The required whole-lane audit additionally found dependent checkpoint observations that could mask the intended mismatch. `c3e2a265dda7829bf0fa1c38bc12843b0839b734` rebinds generation identities, token hashes and dataset publication/locator copies without repairing the targeted fault. All nineteen shipped checkpoint mismatch forms now have individual causal witnesses per family; the missing-file case stays a structural-unavailability control, with an available wrong schema target used to isolate route validation. Existing retained-history, lexical, replay, retention and source/receipt refusals remain.

Two mutation-driver construction issues were corrected: preflight removal now changes the actual validator class (`0c1ccf3475`), and witness data is built from the clean baseline before positive-input injection (`47b006adc6`). Neither changes a production guard. The final complete 45-trial run includes both corrections.

## Per-family grades and eleven standing checks

P=PASS, Q=PARTIAL, A=ABSENT. All nineteen now pass checks 1–11 in their Project-edition scope. Check 2 certifies scope refusal, including exact CV-366 keys; it does not certify an application writer. The only grade change is the oracle cell Q→P for every family; all other cells retain their independent cycle-4 grades.

| Exact family | Twelve-criterion grade before → after | Findings repaired |
|---|---|---|
| `runtime_artifact.api_web_call` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.artifact_version` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.before_after_snapshot` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.browser_recording` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.code_diff` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.context_snapshot` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.cost_usage` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1+B3 |
| `runtime_artifact.document` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.evidence` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.failed_attempts` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.hitl_approval` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.implementation_plan` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.reasoning_summary` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1+B2 |
| `runtime_artifact.screenshot` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.subagent_lineage` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.suggested_next_steps` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |
| `runtime_artifact.tool_llm_trace` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1+B3 |
| `runtime_artifact.validation_test` | 10P / 1Q / 1A → 11P / 0Q / 1A | B1 |

`DR.standing-checks.json` names each negative for all eleven checks in every family. `DR.self-grade.json` contains the 228 cells and exact current owner/function/fixture excerpts. Source auditing verifies 636 excerpts within their current units. The RAP/Storage/Contracts owner documents are unchanged from the reviewed head; only ATS-260 adds this round's oracle requirements.

## Guard-removal table — complete lane

**2,033 valid/negative invocation pairs; 88/88 guard boundaries proved; 2,090 expected acceptance flips; zero unrelated flips.** Every baseline positive accepts and its single-defect negative rejects. Every other isolated negative still rejects under each mutation. All 88 mutations also make the complete checker exit 1/status fail: 87 through the repository driver, plus the existing deleted-body reference gate through the pinned `body-gate-matrix.py` extension. That extension replays the entire matrix, including its nineteen added reference-exposure requests, under every mutation. The unmodified complete checker passes **10,124 assertions**. Mutations exist in memory only; disk guards and fixture answers stay unchanged.

Guard labels name validation boundaries/rules, including compound coherence checks. Repeated enforcement of the same invariant is listed together: canonical JSON uniqueness/canonical encoding (`D10`), checkpoint route/target (`C01`), checkpoint store/key and repeated token joins (`C03`), and live source-selection/snapshot plus repeated anchor/token joins (`C04`). Forwarded schema validation at append (`A07`) is also owned by `F01`; forwarded authenticated custody equality at history (`H06`) is also owned by `F13`; the checkpoint caller's `shipped_wrong_custody_event` is also owned by the same receipt/event/custody join `F11`. These are the same fault at a caller boundary, counted as own negatives for that underlying rule. They are not unrelated flips. Missing bytes/files remain missing-data controls; the available-wrong-target/available-corrupt-pack witnesses establish the associated guard itself. Dispatcher branches, codec representation choices and exception adapters add no independent refusal rule.

| Guard / rule removed in memory | Own negatives that become accepted (family-expanded count) | Other negatives that stay rejected | Full checker |
|---|---|---|---|
| `D01` — decode: EVENT_VALIDATOR | `envelope_extension` (19) | 2014; zero unrelated flips | 1 / fail |
| `D02` — decode: row['payload_schema_id'] | `family`, `payload_schema` (38) | 1995; zero unrelated flips | 1 / fail |
| `D03` — decode: event['scope_kind'] | `redaction`, `replay` (38) | 1995; zero unrelated flips | 1 / fail |
| `D04` — decode: len(rfc8785.dumps(payload)) | `inline_size` (19) | 2014; zero unrelated flips | 1 / fail |
| `D05` — decode/stored: exact pack media and reference grammar | `media` (19) | 2014; zero unrelated flips | 1 / fail |
| `D06` — decode: event['payload'] != {} | `placeholder` (19) | 2014; zero unrelated flips | 1 / fail |
| `D07` — decode: not source or | `pack_not_durable`, `pack_unauthorized` (38) | 1995; zero unrelated flips | 1 / fail |
| `D08` — decode: len(body) != int(size) | `byte_size` (19) | 2014; zero unrelated flips | 1 / fail |
| `D09` — decode: blake3(body).hexdigest() != digest | `same_size_digest` (19) | 2014; zero unrelated flips | 1 / fail |
| `D10` — canonical JSON: unique members and canonical serialization (same encoding rule) | `duplicate_member`, `whitespace` (38) | 1995; zero unrelated flips | 1 / fail |
| `D11` — decode: len(body) <= INLINE_LIMIT | `unnecessary_pack` (19) | 2014; zero unrelated flips | 1 / fail |
| `D12` — decode: validator(schema | `logical_extension` (19) | 2014; zero unrelated flips | 1 / fail |
| `D13` — decode: payload['project_id'] != event['project_id'] | `project_join` (19) | 2014; zero unrelated flips | 1 / fail |
| `D14` — decode: payload.get(field) | `attempt_id`, `node_id`, `run_id`, `thread_id` (76) | 1957; zero unrelated flips | 1 / fail |
| `D15` — decode: payload['created_at_utc'] | `authored_time` (19) | 2014; zero unrelated flips | 1 / fail |
| `D16` — decode: payload['actor_ref'] | `actor` (19) | 2014; zero unrelated flips | 1 / fail |
| `D17` — decode: event['idempotency_key'] | `identity` (19) | 2014; zero unrelated flips | 1 / fail |
| `D18` — decode: point['project_id'] | `point_project` (1) | 2032; zero unrelated flips | 1 / fail |
| `H01` — inspect: source['withdrawn'] | `unauthorized`, `withdrawn` (38) | 1995; zero unrelated flips | 1 / fail |
| `H02` — inspect: source['source_valid'] | `forged_receipt`, `forged_source` (38) | 1995; zero unrelated flips | 1 / fail |
| `H03` — inspect: source['project_id'] | `family`, `project` (38) | 1995; zero unrelated flips | 1 / fail |
| `H04` — inspect: source['original_payload'] | `changed_original` (19) | 2014; zero unrelated flips | 1 / fail |
| `H06` — resolve_history: not full_value_matches | `authenticated_custody` (19) | 2014; zero unrelated flips | 1 / fail |
| `H05` — explicit supported historical decoder selection | `decoder_selection` (2) | 2031; zero unrelated flips | 1 / fail |
| `F01` — full_value_matches: stored_event_valid | `invalid_issued_custody`, `schema` (38) | 1995; zero unrelated flips | 1 / fail |
| `F02` — full_value_matches: value_bytes(candidate) == value_bytes(stored) | `original_value_bytes` (19) | 2014; zero unrelated flips | 1 / fail |
| `F03` — full_value_matches: custody['scope_partition'] == scope_partition(candidate['project_id']) | `partition` (19) | 2014; zero unrelated flips | 1 / fail |
| `F04` — full_value_matches: custody['event_type'] == candidate['event_type'] | `custody_family` (19) | 2014; zero unrelated flips | 1 / fail |
| `F05` — full_value_matches: custody['idempotency_key'] == candidate['idempotency_key'] | `custody_key` (19) | 2014; zero unrelated flips | 1 / fail |
| `F06` — full_value_matches: receipt['sequence_id'] == candidate['sequence_id'] | `receipt_sequence` (19) | 2014; zero unrelated flips | 1 / fail |
| `F07` — full_value_matches: result['original_segment_ref'] == custody['original_segment_ref'] | `segment_reference` (19) | 2014; zero unrelated flips | 1 / fail |
| `F08` — full_value_matches: commitment(candidate) == custody['original_event_value_commitment'] == result['original_event_value_commitment'] | `full_commitment`, `result_commitment` (38) | 1995; zero unrelated flips | 1 / fail |
| `F09` — full_value_matches: semantic_digest(candidate) == custody['producer_semantic_digest'] | `semantic_commitment` (19) | 2014; zero unrelated flips | 1 / fail |
| `F10` — full_value_matches: receipt == custody['first_append_receipt'] | `receipt_copy` (19) | 2014; zero unrelated flips | 1 / fail |
| `F11` — full_value_matches: receipt['event_id'] == candidate['event_id'] == custody['event_id'] | `custody_event`, `receipt_event`, `shipped_wrong_custody_event` (57) | 1976; zero unrelated flips | 1 / fail |
| `F12` — full_value_matches: result == original['result'] | `original_result` (19) | 2014; zero unrelated flips | 1 / fail |
| `F13` — full_value_matches: custody == original['custody'] | `authenticated_custody`, `original_custody` (38) | 1995; zero unrelated flips | 1 / fail |
| `V01` — stored_event_valid: EVENT_VALIDATOR | `event_extension` (19) | 2014; zero unrelated flips | 1 / fail |
| `V02` — stored_event_valid: event['scope_kind'] | `replay` (19) | 2014; zero unrelated flips | 1 / fail |
| `V03` — stored_event_valid: bool(PACK_REF.fullmatch(event['payload_ref'])) | `pack_ref` (19) | 2014; zero unrelated flips | 1 / fail |
| `V04` — stored_event_valid: event['payload'] == {} | `pack_placeholder` (19) | 2014; zero unrelated flips | 1 / fail |
| `V05` — stored_event_valid: len(rfc8785.dumps(event['payload'])) <= INLINE_LIMIT | `inline_size` (19) | 2014; zero unrelated flips | 1 / fail |
| `V06` — stored_event_valid: validator(load(row['payload_schema_ref']), validation=validation).is_valid(event['payload']) | `logical_schema` (19) | 2014; zero unrelated flips | 1 / fail |
| `V07` — stored_event_valid:      return False | `unknown_dispatch` (19) | 2014; zero unrelated flips | 1 / fail |
| `A01` — append: not admission | `not_admitted` (19) | 2014; zero unrelated flips | 1 / fail |
| `A02` — append: not source_valid | `dedupe_unavailable`, `source_invalid` (38) | 1995; zero unrelated flips | 1 / fail |
| `A03` — append: replay policy before dedupe (both refusal branches) | `append_once_retry`, `dedupe_by_event_id_retry`, `projector_replay_only_retry` (57) | 1976; zero unrelated flips | 1 / fail |
| `A04` — append: event['event_id'] in self.global_ids | `global_event_conflict` (19) | 2014; zero unrelated flips | 1 / fail |
| `A05` — append: original['custody']['producer_semantic_digest'] == digest | `scoped_semantic_conflict` (19) | 2014; zero unrelated flips | 1 / fail |
| `A06` — append: EVENT_VALIDATOR | `retry_envelope_extension` (19) | 2014; zero unrelated flips | 1 / fail |
| `A07` — append: not full_value_matches | `invalid_issued_custody` (19) | 2014; zero unrelated flips | 1 / fail |
| `P01` — policies_match: row.get('index_retention_policy_ref') == index_policy | `index` (19) | 2014; zero unrelated flips | 1 / fail |
| `P02` — policies_match: row.get('checkpoint_retention_policy_ref') == checkpoint_policy | `checkpoint` (19) | 2014; zero unrelated flips | 1 / fail |
| `P03` — policies_match: 'derived_retention_policy_ref' not in row | `conflated` (19) | 2014; zero unrelated flips | 1 / fail |
| `C01` — checkpoint: schema/key route and resolved checkpoint target | `available_wrong_schema_target`, `route`, `shipped_wrong_key_route` (57) | 1976; zero unrelated flips | 1 / fail |
| `C02` — checkpoint_matches: validator(schema, 'checkpoint') | `schema` (19) | 2014; zero unrelated flips | 1 / fail |
| `C03` — checkpoint store/key identities, including repeated token store/key joins | `shipped_wrong_checkpoint_store`, `shipped_wrong_custody_store`, `shipped_wrong_source_store`, `shipped_wrong_store_key`, `shipped_wrong_token_store`, `storage` (114) | 1919; zero unrelated flips | 1 / fail |
| `C04` — checkpoint live selection/verification/snapshot, including the repeated token snapshot join | `shipped_unverified_source`, `shipped_wrong_anchor_store`, `shipped_wrong_frontier_store`, `shipped_wrong_live_snapshot`, `shipped_wrong_token_source_store`, `snapshot`, `verified` (133) | 1900; zero unrelated flips | 1 / fail |
| `C05` — checkpoint_matches: generation != expected_generation | `shipped_wrong_frontier`, `shipped_wrong_pointer`, `token_commitment` (57) | 1976; zero unrelated flips | 1 / fail |
| `C06` — checkpoint_matches: not full_value_matches | `shipped_wrong_custody_event`, `shipped_wrong_event`, `source_event` (57) | 1976; zero unrelated flips | 1 / fail |
| `C07` — checkpoint_matches: source['scope_partition'] | `partition`, `shipped_wrong_locator`, `shipped_wrong_partition` (57) | 1976; zero unrelated flips | 1 / fail |
| `C08` — checkpoint_matches: selection['current_bytes_sha256'] | `current_bytes`, `manifest_bytes`, `shipped_wrong_source_selection` (57) | 1976; zero unrelated flips | 1 / fail |
| `C09` — checkpoint_matches: anchor['source_selection'] != selection | `coverage` (19) | 2014; zero unrelated flips | 1 / fail |
| `C10` — checkpoint_matches: coverage['last_frame'] | `last_frame` (19) | 2014; zero unrelated flips | 1 / fail |
| `C11` — checkpoint_matches: segment['scan_start_offset'] | `segment` (19) | 2014; zero unrelated flips | 1 / fail |
| `C12` — checkpoint_matches: bundle['datasets'] == {token['index_dataset_name']: dataset} | `dataset`, `shipped_missing_dataset` (38) | 1995; zero unrelated flips | 1 / fail |
| `C13` — checkpoint_matches: frontier['index_row_count'] == 1 | `row_count` (19) | 2014; zero unrelated flips | 1 / fail |
| `C14` — checkpoint_matches: frontier['index_row_set_sha256'] == binding_digest(dict(                     domain='pm.event_index.row_set.v1', entries=[dict(key=row_key, value=expected_row)])) | `row_set_digest` (19) | 2014; zero unrelated flips | 1 / fail |
| `O01` — observation_admissible: source['proof_valid'] | `predecessor_complete`, `proof_valid`, `snapshot_current` (3) | 2030; zero unrelated flips | 1 / fail |
| `O02` — observation_admissible: candidate['correlation_id'] != grouping_identity | `grouping` (1) | 2032; zero unrelated flips | 1 / fail |
| `O03` — observation_admissible: payload['type_payload'] != source | `source_snapshot` (1) | 2032; zero unrelated flips | 1 / fail |
| `O04` — observation_admissible: candidate['producer_sequence_id'] == 0 and candidate['parent_event_id'] is None | `first_parent_event_id`, `first_producer_sequence_id` (2) | 2031; zero unrelated flips | 1 / fail |
| `O05` — observation_admissible: payload['artifact_id'] != | `artifact_id`, `project_id`, `record_ref`, `record_sha256`, `restore_point_id`, `source_branch_id`, `source_message_id`, `source_thread_id` (8) | 2025; zero unrelated flips | 1 / fail |
| `O06` — observation_admissible: payload['type_payload'] == old['type_payload'] | `unchanged` (1) | 2032; zero unrelated flips | 1 / fail |
| `O07` — observation_admissible: old_status != 'available' | `terminal_reopen` (1) | 2032; zero unrelated flips | 1 / fail |
| `O08` — observation_admissible: candidate['producer_sequence_id'] == previous['producer_sequence_id'] + 1 | `0`, `2` (2) | 2031; zero unrelated flips | 1 / fail |
| `O09` — observation_admissible: candidate['parent_event_id'] == previous['event_id'] | `predecessor` (1) | 2032; zero unrelated flips | 1 / fail |
| `O10` — observation_admissible: candidate['correlation_id'] == previous['correlation_id'] | `prior_group` (1) | 2032; zero unrelated flips | 1 / fail |
| `S01` — whole-document schema references, including optional/unvisited definitions | `unresolved_optional` (19) | 2014; zero unrelated flips | 1 / fail |
| `S02` — exact_pattern: re.search(pattern, instance) and re.fullmatch(pattern, instance) is None | `identifier_LF` (1) | 2032; zero unrelated flips | 1 / fail |
| `S04` — exact_pattern_properties: re.search(pattern, key) and re.fullmatch(pattern, key) is None | `identifier_key_LF` (1) | 2032; zero unrelated flips | 1 / fail |
| `S03` — current-writer provider hash overlay | `provider_hash` (2) | 2031; zero unrelated flips | 1 / fail |
| `S05` — rejected:     return False | `success_is_not_failure` (1) | 2032; zero unrelated flips | 1 / fail |
| `I01` — identity: type(revision) | `boolean_observation_revision`, `fractional_observation_revision`, `missing_observation_revision`, `negative_observation_revision` (4) | 2029; zero unrelated flips | 1 / fail |
| `I02` — value_bytes: not math.isfinite | `infinite_value`, `nan_value`, `negative_infinite_value` (3) | 2030; zero unrelated flips | 1 / fail |
| `I03` — value_bytes: type(value) not in | `unsupported_binary` (1) | 2032; zero unrelated flips | 1 / fail |
| `S06` — validator: validation not in | `unsupported_validation_profile` (1) | 2032; zero unrelated flips | 1 / fail |
| `H07` — inspect: return 'metadata_only' if source['body_deleted'] else 'metadata_and_authorized_refs' | `deleted_body_refs` (19) | 2014; zero unrelated flips | 1 / fail |

The complete per-family flip/still-rejected lists and mutant source SHA-256 values are in external `complete-causal-matrix.json`; full-checker failure names are in `guard-removal.json` and `body-gate-full.json`. `DR.guard-removal.json` is the compact repository summary. Schema validation memoization in mutation runs keys exact code/schema/instance bytes; changed schemas or lexical code get distinct keys. It never caches domain guard decisions or expected oracle outcomes. The precise forwarded F11 checkpoint case was rechecked after its same-rule ownership was identified; its model source, mutant source and inputs did not change. The initial output and focused full-checker recheck are both pinned.

## Verification and preserved earlier resolutions

- **Full checker:** 10,124 assertions, exit 0/status pass. **Guard suite:** 88/88, every own negative flips and every other isolated negative rejects; every full mutated checker exits 1/fail. **Standing suite:** 45/45 caught, including exact digest/ordinal removals, current-writer overlay forced onto history, unknown historical selection, and all earlier mutations.
- **Independent earlier probes:** cycle 3, 1,890 assertions; Astra, 1,189 assertions; zero failed expectations. Latest unchanged Astra logic: 608 resolved references / 24 schemas / zero unresolved; optional-reference injection fails all nineteen; malformed/LF provider hashes refuse in schema and fresh append for both families. Copies retain probe predicates; only the growing aggregate failure-count lower bound and custody reporting expression are adapted, with exact source copies retained.
- **Historical provenance:** all four originals reissued by the previous checker match frozen event/result/custody exactly. They resolve under the selected historical decoder after current live-state changes; current writes and all forgery/withdrawal controls refuse. This is synthetic issued-original custody, not native authentication or real registry admission.
- **Derived/targeted checks:** shard generate/check, index generate and parsed top-level validate, runtime-artifact schema validation and whitespace checks pass. All fifteen ignored currentness files match the shared edition by SHA-256. Derived changes stay in ATS's shard directory and the six standard global indexes. Readiness remains `blocked_runtime_certification_incomplete`; no seal or admission follows.

## Scope, authority, IDs and cleanup

No new technical product binding, decision, feature, retention assignment, stored-value family, registry/admission record, WorkNode or native implementation is added. No old Decision Log answer is newly applied; no premise check failed. Existing handler/consumer/identity/provider-hash searches remain the prior round's cited evidence; RAP-106/RAP-117/CV-526/CV-537 preserve their already explicit historical contract. Source bodies, Usage, original receipts, source-coupled indexes and checkpoint generations keep their existing separate policies. Runtime source/receipt authentication, real sync, crash/recovery, redb/CAS, backup and UI execution remain NOT_RUN.

**IDs used: zero new.** Existing branch allocation is 58: RAP-100..118, SP-520..538, CV-520..538, ATS-260. Only ATS-260 prose changes this round; the remaining units supply unchanged per-family authority. No .gitignore, Spec Lock, auto-decisions, governance evidence, frozen validator or test-file edit. No subagent, mailbox registration/message, landing lock or main push.

Start resource checks: 12 GB available RAM / 109 GB free disk; all sampled checks remain above 6 GB / 50 GB. Sparse detached worktree `/home/sittingmongoose/pm-worktrees/DR-fix5`; temporary venv beside it. After the pushed report, delivery removes both with literal paths; the external `cleanup.json` records completion. No browser or server was started.

## Pinned evidence

| Path | SHA-256 |
|---|---|
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/full-final.json` | `b6e8b716749287aeeb67999b89eb9d417cb32fbf07c15881342c955f74ddd1a7` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/complete-causal-matrix.json` | `ead1204be2fa20c1fc2be17280d9acb64c1ee68a63bd24a27fb2960eddfe0d7f` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/guard-removal.json` | `2cbf8126b29bccc9812e8de64643888e779a61b85a98a70051cf294da17dfe84` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/body-gate-full.json` | `99c26eaded0a43d12d61fcfe4f557814bf2d5a4072324e1fab94dd856d8d9a8e` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/body-gate-matrix.py` | `d907de259843998129219d65ee4519d2b3a7087d6a46f6531cbe7c5a26741b3f` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/standing-verified.json` | `06d2eb80e844e96a56fdfd3eb78f2416d403f315a0dbf02b5563fdc89e964038` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/history-provenance.py` | `196bfc47df2edbc52de1cb8d9f0fad4bda3fdc2afd560bae87922b4c45a5c652` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/history-provenance.json` | `04fe9c9ad403640fbd7c1dcd4fd7cdc7774c7f0a03eed0436b22b79a79995848` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/grade-source-audit.json` | `8e245f3e77f8fbb6fab19bc66615114c29e44654fccbd82de24a500807a81746` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/currentness-copy.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/shard-generate.json` | `fafb1c33a567c68de84f9f26c3cbd2828d5f49a400771374af7218463f00b5d2` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/shard-check.json` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/index-generate.json` | `d4b612f24f8a491936e6c00e20c9ca7948cdbd7fa084c686916deffd5cbe5ba7` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/index-validate.json` | `fa2f4fb07502d813803ce4e8ac53f06bd022ae74ee35b8bfcfe2e66fc6a822a5` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/runtime-schemas.json` | `8f869d12d2abe7e0138ede6d6178044c683376d06214c05dfbfde03e1a5b6286` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/cycle3-mutation-results.json` | `200c2542d9575e70c9bee0bab04e68126bad02447e3785b28185abbc966c2dc0` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/prior-cycle3-probes.py` | `268641e768cd9e2b77f04dec0721d760d62515abc1bac9be62e81eac6ed046b1` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/prior-astra-probes.py` | `61a3df73dd5d9ba25e27b69aa24b8ed8f90b01d902efb460a440a942f0166ca7` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/prior-astra.json` | `52ae627d7318ed163739a5ab074cbdf7532b773747cda6f4cfd2508323bf328d` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/prior-astra2-probes.py` | `8160f78e18f591f567fdfc626f013cb44cc805d51ba75687cb6ff8a504e0bf9d` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/prior-astra2.json` | `06a6fb4f6b5f76fb408a7297bc922abfa33c9232fb558cbbcaac6af766c9138f` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/checkpoint-isolation.json` | `12195e1f23009a41c80c90be586f0584fe73574c69b3da055e82d20080702ca5` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/receipt-event-forwarding.json` | `ef8d8cfa7d2b8ed81be76650447e35d978a20146fb4b3ec3ff178ce8f47ff484` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/guard-removal-before-forwarding-recheck.json` | `7325beae394557136ae6e3e3c599ff415d23fb7a8920c6b465c115cd98a998c2` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/fix-round-5/dependencies.log` | `5117bebb78643eaa53d92b0a4097906f25397ce381c3d364ba5785edb2c17dcd` |
