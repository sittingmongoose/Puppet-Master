# DS round 3 guard-removal table

Targeted groups pass; the whole-lane inventory remains **PARTIAL**. No oracle grade is promoted.

Source revision `3f762144faf6edc258e070d680aab2a14fe79d8e`. Repair `c75ecbfc2faba6dc0120126f0856199857f17d9a`. Every source SHA in the raw table must match the final tree.

Boundary: **27 positives / 46 negatives / 17 groups**. Round 3: **39 positives / 63 negatives / 16 groups**. Type sweep: **156 refusals**.

Each row weakens one actual predicate or its explicitly named duplicate/alias set, runs its complete negative cohort, checks that only its own negatives flip, and restores it. No error-list filtering or whole-helper bypass is used. Missing-reference and missing-compatibility-source availability are tested at their actual predicate seam; independent complete-reader controls still require refusal and never fabricate missing bytes.

Combined cross-suite proof: **66 positives / 109 negatives / 30 groups**. Three shared predicate pairs from the two original tables are merged; every row below runs all 109 negatives.

| Suite / guard | Negatives that flip | Other negatives stay rejected | Status |
|---|---|---:|---|
| combined / `identifier_end_of_input` | `browser.workspace.created:artifact_ref_LF`, `browser.workspace.created:publication_id_LF`, `browser.workspace.reset:artifact_ref_LF`, `browser.workspace.reset:publication_id_LF`, `compaction:project_id_LF`, `compaction:thread_id_LF`, `compaction:operation_id_LF`, `compaction:context_epoch_id_LF` | 101 | pass |
| combined / `browser_compatibility_projector_validation` | `browser.workspace.created:generic_projector_unknown_payload_field`, `browser.workspace.reset:generic_projector_unknown_payload_field` | 107 | pass |
| combined / `eager_reference_closure` | `browser.workspace.created:dormant_ref_0`, `browser.workspace.created:dormant_ref_1`, `browser.workspace.reset:dormant_ref_0`, `browser.workspace.reset:dormant_ref_1`, `compaction:dormant_ref` | 104 | pass |
| combined / `browser_current_replay_and_producer_sequence` | `browser.workspace.created:replay_only`, `browser.workspace.created:known_retry_replay_only`, `browser.workspace.reset:replay_only`, `browser.workspace.reset:known_retry_replay_only`, `browser.workspace.created:writer_null_producer_sequence`, `browser.workspace.reset:writer_null_producer_sequence` | 103 | pass |
| combined / `inline_encoded_byte_limit` | `browser.workspace.created:one_byte_over_inline`, `browser.workspace.reset:one_byte_over_inline`, `layout:one_byte_over_inline` | 106 | pass |
| combined / `compaction_calendar_validation` | `compaction:invalid_calendar` | 108 | pass |
| combined / `compaction_writer_replay_policy` | `compaction:replay_only` | 108 | pass |
| combined / `compaction_historical_authenticity` | `compaction:forged_source`, `compaction:withdrawn_history` | 107 | pass |
| combined / `governed_envelope_successor` | `browser.workspace.created:retained_2_not_a_fresh_writer`, `browser.workspace.reset:retained_2_not_a_fresh_writer`, `layout:old_envelope_not_a_new_writer` | 106 | pass |
| combined / `layout_writer_replay_policy` | `layout:writer_replay_only` | 108 | pass |
| combined / `reference_presence` | `browser.workspace.created:missing_reference`, `browser.workspace.reset:missing_reference`, `layout:boundary_missing_reference` | 106 | pass |
| combined / `reference_hash` | `browser.workspace.created:reference_hash`, `browser.workspace.reset:reference_hash`, `layout:boundary_corrupt_reference` | 106 | pass |
| combined / `reference_size` | `browser.workspace.created:reference_size`, `browser.workspace.reset:reference_size` | 107 | pass |
| combined / `reference_media` | `browser.workspace.created:reference_media`, `browser.workspace.reset:reference_media` | 107 | pass |
| combined / `reference_encoding` | `browser.workspace.created:reference_encoding`, `browser.workspace.reset:reference_encoding` | 107 | pass |
| combined / `history_flags:browser.workspace.created` | `browser.workspace.created:historical_unverified_source`, `browser.workspace.created:historical_withdrawn_checkpoint`, `browser.workspace.created:history_source_verified`, `browser.workspace.created:history_access_allowed`, `browser.workspace.created:history_deletion_allows_audit`, `browser.workspace.created:history_checkpoint_read_token_valid` | 103 | pass |
| combined / `history_flags:browser.workspace.reset` | `browser.workspace.reset:historical_unverified_source`, `browser.workspace.reset:historical_withdrawn_checkpoint`, `browser.workspace.reset:history_source_verified`, `browser.workspace.reset:history_access_allowed`, `browser.workspace.reset:history_deletion_allows_audit`, `browser.workspace.reset:history_checkpoint_read_token_valid`, `browser.workspace.reset:history_admitted` | 102 | pass |
| combined / `integral_numeric_type` | `compaction:operation_generation:7.0`, `compaction:operation_generation:7e0`, `compaction:input_bytes:48000.0`, `compaction:input_bytes:48000e0`, `home4:slot_generation:1.0`, `home4:slot_generation:1e0`, `home4:slot_generation:-0.0`, `browser.workspace.created:inline_generation.0`, `browser.workspace.created:inline_generatione0`, `browser.workspace.created:external_generation.0`, `browser.workspace.created:external_generatione0`, `browser.workspace.created:producer_sequence_id.0`, `browser.workspace.created:producer_sequence_ide0`, `browser.workspace.created:sequence_id.0`, `browser.workspace.created:sequence_ide0`, `browser.workspace.created:producer_sequence_negative_zero`, `browser.workspace.reset:inline_generation.0`, `browser.workspace.reset:inline_generatione0`, `browser.workspace.reset:external_generation.0`, `browser.workspace.reset:external_generatione0`, `browser.workspace.reset:producer_sequence_id.0`, `browser.workspace.reset:producer_sequence_ide0`, `browser.workspace.reset:sequence_id.0`, `browser.workspace.reset:sequence_ide0`, `browser.workspace.reset:producer_sequence_negative_zero` | 84 | pass |
| combined / `compatibility_source:browser.workspace.created` | `browser.workspace.created:legacy_forged_event_id`, `browser.workspace.created:legacy_forged_idempotency_key`, `browser.workspace.created:legacy_forged_project_id`, `browser.workspace.created:legacy_forged_migration`, `browser.workspace.created:legacy_forged_numeric_type` | 104 | pass |
| combined / `compatibility_missing:browser.workspace.created` | `browser.workspace.created:legacy_missing_source` | 108 | pass |
| combined / `compatibility_source:browser.workspace.reset` | `browser.workspace.reset:legacy_forged_event_id`, `browser.workspace.reset:legacy_forged_idempotency_key`, `browser.workspace.reset:legacy_forged_project_id`, `browser.workspace.reset:legacy_forged_migration`, `browser.workspace.reset:legacy_forged_numeric_type` | 104 | pass |
| combined / `compatibility_missing:browser.workspace.reset` | `browser.workspace.reset:legacy_missing_source` | 108 | pass |
| combined / `compaction_receipt_identity` | `compaction:well_formed_false_receipt` | 108 | pass |
| combined / `home4:operation_digest` | `home4:well_formed_false_operation_digest` | 108 | pass |
| combined / `layout_home4_identity` | `home4:well_formed_false_event_id`, `layout:omitted_join_event_id`, `layout:omitted_join_idempotency_key` | 106 | pass |
| combined / `layout_join:event_type` | `layout:omitted_join_event_type` | 108 | pass |
| combined / `layout_join:payload_schema_id` | `layout:omitted_join_payload_schema_id` | 108 | pass |
| combined / `layout_join:project_id` | `layout:omitted_join_project_id` | 108 | pass |
| combined / `layout_history_custody` | `layout:history_source_verified`, `layout:history_access_allowed`, `layout:history_deletion_allows_audit`, `layout:history_checkpoint_read_token_valid` | 105 | pass |
| combined / `encoder_numeric_representation` | `encoder_numeric_boundary:1.0`, `encoder_numeric_boundary:1e0`, `encoder_numeric_boundary:-0.0` | 106 | pass |

## Named shared rules and duplicate sets

- `identifier_end_of_input`: exact ECMA end-of-input pattern plus the thread id maxLength duplicate. The actual schema keyword guards are restored together.
- Current Browser replay and producer-sequence rules: the same source condition exists in the created cached gate and reset cached sibling gate; both named copies are removed together.
- Canonical reference decoding: `home.decode_canonical_msgpack` and the route import are aliases of the same decoder. Only its canonical re-encoding equality condition is removed.
- `layout_home4_identity`: the standalone oracle calls Home4 `event_checks`; its Home4 event-id and standalone event-id/key negatives share that one actual identity predicate.
- Eager closure: only the unresolved-ref refusal is removed. Eager caches are cold for each baseline and mutation, and immutable context constructors are cleared per mutation. Successful standard-library schema-definition checks alone are memoized by full JSON content; invalid schemas and tuple-shaped schema input still fail their original checks. No event/value validation result is cached, and an ablation cannot make a later broken reference look validated.
- The three reviewed Home4 schema/composed implications are retained: identifier syntax is also constrained upstream; source-reference byte_size is >=16385 by schema; the by-reference whole-value bound follows from that minimum, exact resolved length and canonical equality. Their independent upstream guards stay intact. These implications are recorded, not counted as newly proved full-path rows.

## Whole-lane inventory and open proof

**995 distinct negatives** reject at baseline. Reused existing suites: **118 tests**, 738 replayable negative calls, 108 positive controls. Checkpoint, CAS, token, source, generation replacement, holds/cleanup, pending and original-result calls are included. One schema-loader mock remains explicitly a dependency-fault control, not an out-of-scope replay or guard witness.

Raw source-binding mutation runs: **863**, with **245 observed witnesses**. Distinct source conditions: **551**, of which **177 have a witness in at least one captured namespace**. Runs can repeat a source predicate through module/proxy bindings; the distinct-condition count removes that repetition. This does not certify all copies or all predicate clauses. There are 54 exception-bearing mutation runs; none is credited as a witness. Empty, exception and nonflipping rows remain unproved.

The unchanged thirty shared Browser conditions for navigation, screenshots, leases/effects and absent workspace facts are N/A for these five family shapes, as cycle 3 ruled. Remaining routing/codec, harness/meta and schema-dominated rows still require their appropriate reachability/fault/shared-rule adjudication; an observed flip is not automatically an ownership ruling. No fixed number of new negatives is inferred from this mixed syntactic inventory. The exact remaining rows and exceptions are retained below and are not hidden by the targeted pass.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/fix3-boundary.json`, SHA-256 `b3cf5a73a3c7a13681de6568425a28175c0137cfb42166016346714c0b6a7cd3`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/fix3-targeted.json`, SHA-256 `caaf4c6339fe3ab03582a84a035919684f5f782dd1284fb250d66794b1d76920`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/fix3-combined-guard-matrix.json`, SHA-256 `2eaa1bf8aeab2d3d0dbcde1adf7b987ddb1424500e67b1f2f324b3ae825c9bc4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS/fix3-whole-guard-removal.json`, SHA-256 `ca81d26f938d4540e9210b1e4d83b48b8edea6d5576ad4c0290564ba7f6fdfd3`.
