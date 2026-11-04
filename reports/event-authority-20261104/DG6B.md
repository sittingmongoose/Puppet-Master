# DG6B — review round 4, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `2db4922de7699a40a9cb4f288a326a064c99e2a8`. Fixed contract commit: **`96cff41a8263e49644328eb23611c1dd5d135152`**. Worker: DG6B-FIX4, VM. This extra targeted round was explicitly authorized after the three-round cap. No additional review or delegation was started. Native execution: **NOT_RUN**.

C4-B1 is fixed for all nineteen families. Prepared-contract grades are **190 PASS / 19 PARTIAL / 19 ABSENT / zero CONFLICT**. Membership stays ABSENT; retention stays PARTIAL / PENDING_RETENTION_DECISION; every disposition stays UNDISPOSITIONED. These results prepare contracts without admitting writers.

## Review round 4: findings and responses

**C4-B1 — fixed (`96cff41a8263e49644328eb23611c1dd5d135152`).** Where: `Plans/dg6b_event_contract_fixtures.json:4517` (`inline_base64_body`), `:8318` (forged history), `:9900` (physical byte stage), `scripts/pm-dg6b-event-contracts.py:86` / `:380` / `:454`, and `scripts/pm-dg6b-guard-proof.py`. Why: negative inputs left independent schema, scope, identity, source or envelope defects after their intended guard was removed. Fix: rebuild the named controls and every additional survivor from valid representations; synchronize copies and identities; authenticate coherent replacement bytes with the intended integrity defect kept separate; use the actual pre-dispatch boundary for synthetic sizes and missing-reference availability.

- **Named controls:** all nineteen forbidden-body negatives synchronize frozen source and EventRecord payload; all nineteen forged-history negatives synchronize their transport while preserving genuine source custody; all eight unrelated plugin receipts synchronize the EventRecord copy; all five application-only auth negatives use coherent Project partitions, envelopes and recomputed identities. Generated auth scope negatives use the corresponding Project identity.
- **Other controls:** six Persona Server substitutions synchronize request/frozen copies while retaining the intended scope-key mismatch. Deleted revision and updated subject substitutions retain valid CAS/source relations. Every payload-schema negative differs from a valid payload at exactly one leaf, including the extra two-field retired-tier case found this round. Reference-byte controls remain canonical, schema-valid and coherent with expected operation custody while retaining their targeted digest defect. New controls cover checkpoint-key mismatch and authenticated noncanonical operation encoding in every family.
- **Boundary controls:** fake padded logical operations were replaced with 16,383 / 16,384-byte positives and a 16,385-byte negative at the physical byte gate used by `operation_contract`. Missing-reference tests invoke the availability function used by transport. Raw/colon/LF partitions and retired-tier enum controls exercise their actual partition or schema boundary; corresponding full-path refusals remain covered by preservation, owner/scope, pattern and CLI controls. Synthetic bytes are never claimed as schema-valid logical operations.
- **Guard preservation:** original writer-policy predicates remain intact. The two current-writer-policy refusal paths enforce the same invariant and are removed together in the proof; both source locations are exported. Other repeated checks are grouped by their named invariant. Metadata checks retain their exact family, disposition, membership, retention and schema-binding conditions; registry/value files are still read fresh. No original rejection is lost: all 961 relational/append/operation/history/retry outcomes and 228 original payload-schema refusals remain unchanged.

Verification: `python3 scripts/pm-dg6b-guard-proof.py --output <external-path>.json`; `python3 scripts/pm-dg6b-event-contracts.py`. The independent fixture audit reports **1,245 negatives, zero wrong initial reasons, zero survivors**. The complete matrix reports **2,324 negatives × 51 logical guard groups**, zero unexpected results. All 52 refusal classifications are covered; writer policy accounts for two classifications in one invariant. Every unrelated negative retains its exact original refusal. Every unique real upstream schema check is memoized in the proof; instance validation and eager reference lookup execute for every probe. The production checker bytes are never patched on disk. A fresh restored module and the unmodified CLI pass.

No finding is disputed or stopped for Jared. Retention assignment, separate per-family admission and native proof remain integration items.

## Guard-removal table

Each ID has the form `<family>:<kind>/<label>`. The flip column gives label selectors across applicable families and the exact count. “All other N IDs” means the exact complement in the 2,324-probe universe, verified with unchanged refusal text. The full JSON contains every individual flip/stay ID and every source location, without truncation: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix4/guard-removal.json` — SHA-256 `c2df6c3c3ccc41b8a0740fed332ad2af0c7f7db0d8da58b124e13fa312994217`. The committed compact table is `reports/event-authority-20261104/DG6B.guard-removal-summary.json`.

| Guard / invariant | Negatives that flip | Negatives that stay rejected |
|---|---|---|
| `access` | 25: `append_invalid/source_access_revoked`; `semantic_invalid/source_access_revoked` | All other 2299 IDs, same refusal |
| `cadence` | 1: `semantic/cadence` | All other 2323 IDs, same refusal |
| `cas` | 3: `semantic_invalid/stale_cas` | All other 2321 IDs, same refusal |
| `checkpoint_schema` | 76: `append_invalid/checkpoint_trailing_lf_frontier_sha256`; `append_invalid/checkpoint_trailing_lf_generation_anchor_sha256`; `append_invalid/checkpoint_trailing_lf_generation_id`; `append_invalid/persisted_snapshot_forbidden` | All other 2248 IDs, same refusal |
| `checkpoint_storage_join` | 57: `append_invalid/wrong_checkpoint_key`; `append_invalid/wrong_checkpoint_source_storage`; `append_invalid/wrong_checkpoint_storage` | All other 2267 IDs, same refusal |
| `confirmation` | 1: `semantic_invalid/unconfirmed_delete` | All other 2323 IDs, same refusal |
| `creation_source` | 1: `extra/creation_source` | All other 2323 IDs, same refusal |
| `current_writer_policy` | 38: `append_invalid/replay_only_append`; `append_invalid/wrong_current_replay_policy` | All other 2286 IDs, same refusal |
| `definition_writer` | 5: `extra/definition_writer` | All other 2319 IDs, same refusal |
| `envelope_source_join` | 57: `append_invalid/wrong_actor`; `append_invalid/wrong_schema_route`; `append_invalid/wrong_time` | All other 2267 IDs, same refusal |
| `event_record_schema` | 19: `extra/event_record_schema` | All other 2305 IDs, same refusal |
| `failure_error_reason` | 1: `wrong_reason_cannot_prove_failure` | All other 2323 IDs, same refusal |
| `failure_oracle` | 1: `success_cannot_prove_failure` | All other 2323 IDs, same refusal |
| `fixture_family_coverage` | 19: `preparation/fixture_family_coverage` | All other 2305 IDs, same refusal |
| `grade_family_coverage` | 19: `preparation/grade_family_coverage` | All other 2305 IDs, same refusal |
| `historical_access` | 38: `history_cases/history_access_current`; `history_cases/history_body_deleted` | All other 2286 IDs, same refusal |
| `historical_provenance` | 57: `history_cases/history_admitted_when_written`; `history_cases/history_authentic`; `history_cases/history_retained` | All other 2267 IDs, same refusal |
| `historical_withdrawn` | 38: `history_cases/history_family_withdrawn`; `history_cases/history_reader_current` | All other 2286 IDs, same refusal |
| `home_scope` | 1: `semantic_invalid/project_home_in_no_project` | All other 2323 IDs, same refusal |
| `idempotency_conflict` | 162: `caller_semantic_change/*`; `retry_cases/caller_causation_event_id`; `retry_cases/caller_correlation_id`; `retry_cases/caller_parent_event_id`; `retry_cases/caller_producer_sequence_id` | All other 2162 IDs, same refusal |
| `idempotency_key` | 95: `append_invalid/actual_server_application_key`; `append_invalid/application_key_odd_hex`; `append_invalid/application_key_trailing_lf`; `append_invalid/application_key_uppercase_hex`; `append_invalid/legacy_application_key` | All other 2229 IDs, same refusal |
| `identity` | 21: `semantic/identity`; `semantic/scope` | All other 2303 IDs, same refusal |
| `inline_body_too_large` | 20: `append_invalid/schema_valid_16385_byte_inline`; `transport/*` | All other 2304 IDs, same refusal |
| `mirror` | 4: `semantic_invalid/mirror_write` | All other 2320 IDs, same refusal |
| `observation_only_hook` | 2: `semantic/post_attempt_complete`; `semantic/post_tool_invoke` | All other 2322 IDs, same refusal |
| `operation_schema` | 344: `operation_schema/*` | All other 1980 IDs, same refusal |
| `operation_schema_binding` | 19: `preparation/operation_schema_binding` | All other 2305 IDs, same refusal |
| `operation_source_join` | 38: `operation_cases/authenticated_but_wrong_effect_receipt_ref`; `operation_cases/authenticated_but_wrong_payload` | All other 2286 IDs, same refusal |
| `operation_value_too_large` | 21: `operation_cases/oversized_inline_operation`; `operation_cases/review_exact_16898_byte_inline_operation`; `stage_cases/physical_byte_stage_16385` | All other 2303 IDs, same refusal |
| `original_payload_conflict` | 13: `semantic/original_payload` | All other 2311 IDs, same refusal |
| `original_server_required` | 1: `original_server_required` | All other 2323 IDs, same refusal |
| `original_source_join` | 72: `append_invalid/receipt_substitution`; `append_invalid/unrelated_original_source`; `history_cases/history_forged_original`; `semantic_invalid/changed_runtime_snapshot`; `semantic_invalid/frozen_timestamp_changed`; `semantic_invalid/recomputed_effective_identity`; `semantic_invalid/result_substitution`; `semantic_invalid/revision_substitution`; `semantic_invalid/subject_substitution` | All other 2252 IDs, same refusal |
| `override_lineage` | 1: `semantic_invalid/coherent_wrong_lineage_owner` | All other 2323 IDs, same refusal |
| `partition` | 48: `semantic_invalid/project_partition_wrong`; `stage_cases/invalid_project_partition_'project-one'`; `stage_cases/invalid_project_partition_'project:project-one'`; `stage_cases/invalid_project_partition_'project~cHJvamVjdC1vbmU\n'` | All other 2276 IDs, same refusal |
| `payload_ref_integrity` | 342: `append_invalid/reference_hash_wrong`; `operation_cases/operation_noncanonical_encoding`; `operation_cases/operation_reference_blake3_id`; `operation_cases/operation_reference_byte_size`; `operation_cases/operation_reference_bytes_hex`; `operation_cases/operation_reference_media_type`; `transport/*` | All other 1982 IDs, same refusal |
| `payload_ref_unavailable` | 190: `append_invalid/reference_not_durable`; `operation_cases/operation_reference_access_current`; `operation_cases/operation_reference_durable`; `stage_cases/operation_reference_missing`; `transport/*` | All other 2134 IDs, same refusal |
| `payload_schema` | 266: `append_invalid/inline_base64_body`; `payload_schema/*`; `stage_cases/coherent_retired_tier` | All other 2058 IDs, same refusal |
| `payload_transport_join` | 19: `extra/payload_transport_join` | All other 2305 IDs, same refusal |
| `prepared_membership` | 19: `preparation/prepared_membership` | All other 2305 IDs, same refusal |
| `protected` | 4: `semantic_invalid/protected_id_mutation` | All other 2320 IDs, same refusal |
| `reach` | 1: `semantic_invalid/only_projects_in_no_project` | All other 2323 IDs, same refusal |
| `resolution_schema` | 6: `resolution/effective_persona_id`; `resolution/missing/effective_persona`; `resolution/missing/requested_persona`; `resolution/missing/runtime_snapshot_ref`; `resolution/missing/runtime_snapshot_sha256`; `resolution/requested_persona_id` | All other 2318 IDs, same refusal |
| `retention_pending` | 19: `preparation/retention_pending` | All other 2305 IDs, same refusal |
| `retry_identity` | 19: `extra/retry_identity` | All other 2305 IDs, same refusal |
| `scope` | 16: `append_invalid/project_auth_forbidden`; `semantic/scope`; `semantic_invalid/server_substitution` | All other 2308 IDs, same refusal |
| `selected_result_schema` | 2: `selected_result/effective_persona_id`; `selected_result/requested_persona_id` | All other 2322 IDs, same refusal |
| `source_trust` | 1: `semantic_invalid/unverified_import` | All other 2323 IDs, same refusal |
| `unadmitted_disposition` | 19: `preparation/unadmitted_disposition` | All other 2305 IDs, same refusal |
| `unknown_oracle_stage` | 1: `unknown_oracle_stage` | All other 2323 IDs, same refusal |
| `unresolved_schema_ref` | 57: `schema_graph/*` | All other 2267 IDs, same refusal |
| `writer` | 25: `append_invalid/withdrawn_event_writer`; `semantic_invalid/withdrawn_event_writer`; `semantic_invalid/writer_stale` | All other 2299 IDs, same refusal |

## All eleven standing checks

| Check | All-family result and evidence |
|---|---|
| 1 Current writer/replay-only | PASS: original policy predicates retained; nineteen independent full CLI replay-only refusals. |
| 2 CV-366 | PASS: existing exact UTF-8 Server/operation recipes, maximum keys and legacy/wrong-Server/odd/uppercase/LF controls preserved. |
| 3 Project partition | PASS: fourteen eligible encoded Project positives and five coherent auth refusals; raw/colon/LF controls at their real boundaries. |
| 4 SP-337 | PASS: physical byte stages, real operation boundaries and authenticated references; exact Astra B2 16,898-byte inline refusal and 259-byte reference recovery. |
| 5 LF | PASS: 2,373 independent pattern/earlier-Persona regression checks; all 246 schema negatives have a single-leaf valid control. |
| 6 Retry semantics | PASS: Storage metadata preserves digest; caller semantic changes conflict. |
| 7 Durable token | PASS: storage/source-selection/key mismatches isolated; persisted snapshot and identifier negatives preserved. |
| 8 Failure oracle | PASS: success and wrong-reason helper controls isolate both failure guards; nineteen full CLI accepted-negative injections exit nonzero. |
| 9 All references | PASS: all 408 references resolve; 57 isolated dormant/unused ref probes and nineteen dormant plus two unused full CLI refusals. |
| 10 Historical read | PASS: 133 independent later-live-state positives; provenance, withdrawal, access and forged-original controls remain decisive. |
| 11 Negative isolation | PASS: 1,245 fixture negatives and the complete 2,324-case / 51-invariant matrix, with no unexplained survivor or unrelated acceptance. |

## Earlier findings remain fixed

| Finding | Recheck |
|---|---|
| Astra-2 B1 dangling dormant refs | Exact uncovered conditional, unused `$ref` and `$dynamicRef` controls still refuse; eager resolution unchanged. |
| Astra-2 B2 oversized authenticated operation | Independent canonical MessagePack matches all 86 append positives. Exact 16,898-byte operation refuses inline and recovers its complete logical body/receipt through the 259-byte wrapper. |
| Cycle-1 B1 Persona owners; B2 runtime names | No-project / real Project / source-Server / home / mirror / protected / CAS / reach and canonical requested_persona/effective_persona bindings pass 58 owner/scope probes plus the pattern regression suite. |
| Cycle-1 B3 CURRENT_WRITER claim | Nineteen full CLI disposition mutations refuse. Membership/registry stay unchanged. |
| Cycle-1 B4 observation hooks | Three pre-hooks pass; both coherent post-hook Block observations still refuse. |
| Astra-1 B1 keys; B2 source/append/reference custody | Existing original negative outcomes preserved; repaired unrelated receipts now isolate custody. |
| Astra-1 B3 tier/lineage; B4 export writer | Retired-tier schemas and coherent wrong-lineage refusal remain; current read-only mirror export passes and stale event-writer export refuses. |
| Earlier timestamp/profile/dataset notes | No generator is rerun: no Markdown, registry or indexed source changed this round. Profile checker still has the identical 41 pre-existing errors. Unpatterned dataset-name LF remains an external generic-publication/native prerequisite, not a patterned-identifier failure. |

## Family grades before and after

Before is cycle-4 independent review. P=PASS, p=PARTIAL, A=ABSENT. Only the oracle cell changes, PARTIAL → PASS. Membership remains A and retention remains p for every family. All 228 cells and 313 current exact citations are checked.

| Family | Before | After |
|---|---|---|
| `auth.github.authenticated` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `auth.github.device_code.issued` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `auth.github.disconnected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `auth.github.failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `auth.github.token.polling` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.hook.blocked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.hook.error` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.hook.invoked` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.load_failed` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.loaded` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.permission.override` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.tool.collision` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `plugin.tool.registered` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `persona.created` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `persona.deleted` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `persona.exported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `persona.imported` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `persona.selected` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |
| `persona.updated` | 9 P / 2 p / 1 A | 10 P / 1 p / 1 A |

Aggregate: **171 PASS / 38 PARTIAL / 19 ABSENT → 190 PASS / 19 PARTIAL / 19 ABSENT**, zero CONFLICT. Prepared gate: **0/19 → 19/19**, with pending retention and absent membership remaining explicit permitted open cells.

## Scope, IDs and open items

No owner prose, schema, registry, profile, retention policy, event-family admission, Decision Log, Spec Lock, auto-decisions, frozen validator or governance evidence changed this round. Existing per-family owner contracts and historical-decision premises are not extended. The protected-source audit verifies unchanged current owner/schema/registry bytes against the input head. No new technical or product binding was authored.

**IDs used:** zero new IDs. Existing GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691 and ATS-335..336 remain the lane's 26 IDs, unchanged. Membership stays absent; retention stays pending; native execution stays NOT_RUN.

Changed paths are the fixture pack, the existing checker, the new guard-proof script, this report, self-grade and compact guard summary. No Plans Markdown changed, so no derived regeneration or timestamp churn is introduced. Shard and index validation pass against existing generated content; fifteen currentness files were copied and hash-matched. No reseal, landing lock, main push, mailbox or subagent was used.

## Verification and evidence

| Check | Exit / result |
|---|---|
| Complete guard-removal proof | 0; 51 invariant groups, 2,324 negatives, zero failures, exact input hashes stable, restored full checker pass |
| Independent fixture isolation | 0; 1,245 negatives, zero wrong initial reasons, zero survivors |
| Unmodified full CLI adversarial controls | 0; 78 expected nonzero process exits, all correct |
| Preservation / byte / history audit | 0; 1,189 old refusals preserved; 86 independent MessagePack encodings; 133 live-state positives; exact B2 recovery |
| Owner/scope; pattern regressions | 0; 58/58 and 2,373/2,373 |
| Full checker; Projects refresh; GitHub integration | 0; parsed top-level pass |
| Primary command catalog | 0; 19 tests |
| Shard check; plan-index validate | 0; parsed top-level pass; 7,447 PlanUnits, native certification remains blocked |
| Storage profile checker | 1; identical ordered 41-error pre-existing baseline |
| Self-grade / payload purity / diff whitespace | 0; 313 exact citations; 246 one-leaf schema negatives; clean diff |

Evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix4/checks-manifest.json` — SHA-256 `5da0a77aa4e2bfe5a3e11fb029281e8e080cbf5240827b63d46f6e74c3dd052a`. It pins every retained control output and reproduction aid by path, bytes and SHA-256. Raw evidence remains outside the repository. Report and self-grade are copied to the DG6B drafts root. The sparse detached worktree is removed after both commits are pushed.
